from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import logging
import uuid
import re
import asyncio
import ipaddress
import jwt
import bcrypt
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Literal, Optional
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from catalog import create_catalog_router, seed_catalog, init_storage

# ---------------------------------------------------------------------------
# DB + App setup
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Yantr Technologies API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("yantr")

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

# ---------------------------------------------------------------------------
# Email (Emergent managed Resend)
# ---------------------------------------------------------------------------
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Yantr Technologies")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
LEAD_NOTIFY_EMAIL = os.environ.get("LEAD_NOTIFY_EMAIL")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


_bg_tasks: set = set()


def _spawn(coro) -> None:
    task = asyncio.create_task(coro)
    _bg_tasks.add(task)
    task.add_done_callback(_bg_tasks.discard)


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set; skipping email send")
        return None
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    try:
        _assert_safe_email(subject, html)
        async with httpx.AsyncClient(timeout=30) as http_client:
            for attempt in range(3):
                resp = await http_client.post(
                    f"{EMAIL_BASE_URL}/api/v1/email/send",
                    headers={"X-Email-Key": EMAIL_KEY},
                    json=payload,
                )
                if resp.status_code != 429:
                    break
                await asyncio.sleep(2 ** (attempt + 1))
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        try:
            code = e.response.json().get("code", "")
        except ValueError:
            code = ""
        logger.warning(f"Email send failed ({code}): {e.response.status_code} {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None


VERTICAL_LABELS = {"marketing": "Digital Marketing", "products": "IT Products", "academy": "IT Training",
                   "corporate": "Corporate / Bulk", "general": "General Enquiry"}


def _customer_email_html(p: "EnquiryInput", enquiry_id: str) -> str:
    items = [("Reference ID", enquiry_id), ("Service", p.category or VERTICAL_LABELS.get(p.vertical, p.vertical)),
             ("Interested in", p.interest), ("Budget range", p.budget), ("Timeline", p.timeline),
             ("Phone", p.phone), ("Details", (p.message or "")[:500] or None)]
    rows = "".join(
        f'<tr><td style="padding:6px 16px 6px 0;color:#64748b;font-size:13px;vertical-align:top">{escape(k)}</td>'
        f'<td style="padding:6px 0;color:#0f172a;font-size:13px"><strong>{escape(str(v))}</strong></td></tr>'
        for k, v in items if v
    )
    return (
        '<table role="presentation" width="100%" style="font-family:Arial,sans-serif;background:#f8fafc">'
        '<tr><td style="padding:24px"><table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px">'
        '<tr><td style="background:#0B0F19;padding:20px 24px;border-radius:12px 12px 0 0">'
        '<span style="color:#ffffff;font-size:20px;font-weight:bold">Yantr Technologies</span></td></tr>'
        '<tr><td style="padding:24px">'
        f'<h2 style="color:#0B0F19;margin:0 0 8px">Thank you, {escape(p.name)}!</h2>'
        '<p style="color:#475569;margin:0 0 16px;font-size:14px">We have received your enquiry. Our team will get back to you shortly. '
        'Please keep your reference ID for any follow-up.</p>'
        f'<table role="presentation">{rows}</table>'
        '<p style="color:#0B0F19;font-size:14px;margin:24px 0 6px"><strong>Need to reach us?</strong></p>'
        '<p style="color:#475569;font-size:13px;margin:0;line-height:1.7">'
        'Email: <a href="mailto:yantrtechnologies@gmail.com" style="color:#2563EB">yantrtechnologies@gmail.com</a><br>'
        'Phone / WhatsApp: <a href="tel:+919692791725" style="color:#2563EB">+91 9692791725</a><br>'
        'Office: Pragati Vihar, Ainthapali, Sambalpur, Odisha</p>'
        '<p style="font-size:12px;color:#94a3b8;margin-top:24px">You received this because you submitted an enquiry on the Yantr Technologies website.</p>'
        '</td></tr></table></td></tr></table>'
    )


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class EnquiryInput(BaseModel):
    vertical: Literal["marketing", "products", "academy", "corporate", "general"]
    category: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    services: Optional[List[str]] = None
    interest: Optional[str] = None     # course name / product name
    message: Optional[str] = None

    @field_validator("email", "phone", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        return (v.strip() or None) if isinstance(v, str) else v

    @model_validator(mode="after")
    def _need_contact(self):
        if not self.email and not self.phone:
            raise ValueError("Please provide a phone number or email")
        return self


class StatusUpdate(BaseModel):
    status: str


class NoteInput(BaseModel):
    note: str


class FollowUpInput(BaseModel):
    follow_up_date: Optional[str] = None
    owner: Optional[str] = None


VALID_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"]

# simple in-memory rate limiter for public enquiry submissions
_rate: dict = {}
_login_attempts: dict = {}


def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    xri = request.headers.get("x-real-ip")
    if xri:
        return xri.strip()
    return request.client.host if request.client else "anon"


def _rate_limit(key: str, limit: int = 8, window_sec: int = 300):
    now = datetime.now(timezone.utc).timestamp()
    bucket = [t for t in _rate.get(key, []) if now - t < window_sec]
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    bucket.append(now)
    _rate[key] = bucket


# ---------------------------------------------------------------------------
# Routes - public
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Yantr Technologies API", "status": "ok"}


@api_router.post("/auth/register")
async def register(payload: RegisterInput):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id, "name": payload.name, "email": email,
        "password_hash": hash_password(payload.password), "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, "student")
    return {"token": token, "user": {"id": user_id, "name": payload.name, "email": email, "role": "student"}}


@api_router.post("/auth/login")
async def login(payload: LoginInput, request: Request):
    email = payload.email.lower()
    key = f"{_client_ip(request)}:{email}"
    now = datetime.now(timezone.utc).timestamp()
    attempts = [t for t in _login_attempts.get(key, []) if now - t < 900]
    if len(attempts) >= 5:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        attempts.append(now)
        _login_attempts[key] = attempts
        raise HTTPException(status_code=401, detail="Invalid email or password")
    _login_attempts.pop(key, None)
    token = create_access_token(user["id"], email, user["role"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": email, "role": user["role"]}}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryInput, request: Request):
    _rate_limit(_client_ip(request))
    enquiry_id = "YT-" + uuid.uuid4().hex[:8].upper()
    doc = payload.model_dump()
    doc.update({
        "id": enquiry_id,
        "status": "New",
        "owner": None,
        "follow_up_date": None,
        "notes": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.enquiries.insert_one(doc)

    if LEAD_NOTIFY_EMAIL:
        subject = f"New {payload.vertical.title()} Enquiry — {enquiry_id}"
        rows = "".join(
            f'<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px">{escape(k)}</td>'
            f'<td style="padding:4px 0;color:#0f172a;font-size:13px"><strong>{escape(str(v))}</strong></td></tr>'
            for k, v in [
                ("Enquiry ID", enquiry_id), ("Vertical", payload.vertical),
                ("Category", payload.category or "-"), ("Name", payload.name),
                ("Email", payload.email or "-"), ("Phone", payload.phone or "-"),
                ("Company", payload.company or "-"), ("Budget", payload.budget or "-"),
                ("Interest", payload.interest or "-"),
                ("Message", (payload.message or "-")[:500]),
            ]
        )
        html = (
            '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">'
            '<tr><td style="padding:24px">'
            f'<h2 style="color:#0B0F19;margin:0 0 8px">New lead received</h2>'
            f'<p style="color:#475569;margin:0 0 16px">A new enquiry was submitted on the Yantr Technologies website.</p>'
            f'<table role="presentation">{rows}</table>'
            '<p style="font-size:12px;color:#94a3b8;margin-top:20px">Sent by Yantr Technologies. '
            'We never ask for your password or card details by email.</p>'
            '</td></tr></table>'
        )
        _spawn(send_email(to=LEAD_NOTIFY_EMAIL, subject=subject, html=html))

    if payload.email:
        _spawn(send_email(
            to=payload.email,
            subject=f"Thank you for contacting Yantr Technologies — {enquiry_id}",
            html=_customer_email_html(payload, enquiry_id),
        ))

    return {"id": enquiry_id, "status": "received",
            "message": "Thank you! Your enquiry has been received. Our team will reach out shortly."}


# ---------------------------------------------------------------------------
# Routes - admin
# ---------------------------------------------------------------------------
@api_router.get("/admin/enquiries")
async def list_enquiries(user: dict = Depends(require_admin),
                         status: Optional[str] = None, vertical: Optional[str] = None,
                         search: Optional[str] = None):
    query = {}
    if status and status != "All":
        query["status"] = status
    if vertical and vertical != "All":
        query["vertical"] = vertical
    if search:
        safe = re.escape(search)
        query["$or"] = [
            {"name": {"$regex": safe, "$options": "i"}},
            {"email": {"$regex": safe, "$options": "i"}},
            {"company": {"$regex": safe, "$options": "i"}},
            {"id": {"$regex": safe, "$options": "i"}},
        ]
    items = await db.enquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api_router.get("/admin/metrics")
async def metrics(user: dict = Depends(require_admin)):
    items = await db.enquiries.find({}, {"_id": 0, "status": 1, "vertical": 1}).to_list(5000)
    total = len(items)
    by_status = {s: 0 for s in VALID_STATUSES}
    by_vertical = {}
    for it in items:
        by_status[it.get("status", "New")] = by_status.get(it.get("status", "New"), 0) + 1
        v = it.get("vertical", "general")
        by_vertical[v] = by_vertical.get(v, 0) + 1
    converted = by_status.get("Converted", 0)
    conversion_rate = round((converted / total) * 100, 1) if total else 0.0
    return {"total": total, "by_status": by_status, "by_vertical": by_vertical,
            "conversion_rate": conversion_rate, "converted": converted}


@api_router.patch("/admin/enquiries/{enquiry_id}/status")
async def update_status(enquiry_id: str, payload: StatusUpdate, user: dict = Depends(require_admin)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.enquiries.update_one({"id": enquiry_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"ok": True, "status": payload.status}


@api_router.post("/admin/enquiries/{enquiry_id}/notes")
async def add_note(enquiry_id: str, payload: NoteInput, user: dict = Depends(require_admin)):
    note = {"text": payload.note, "by": user["name"], "at": datetime.now(timezone.utc).isoformat()}
    res = await db.enquiries.update_one({"id": enquiry_id}, {"$push": {"notes": note}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"ok": True, "note": note}


@api_router.patch("/admin/enquiries/{enquiry_id}/followup")
async def update_followup(enquiry_id: str, payload: FollowUpInput, user: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    res = await db.enquiries.update_one({"id": enquiry_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"ok": True}


app.include_router(api_router)
app.include_router(create_catalog_router(db, require_admin))

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id")
    await db.enquiries.create_index("id")
    await seed_catalog(db)
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "Yantr Admin", "email": admin_email,
            "password_hash": hash_password(admin_password), "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})
        logger.info("Updated admin password")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
