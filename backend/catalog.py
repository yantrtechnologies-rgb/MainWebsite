import asyncio
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import requests
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "yantr"
MAX_UPLOAD = 5 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}
_storage_key: Optional[str] = None


def init_storage(force: bool = False) -> str:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _storage_call(method: str, path: str, **kwargs) -> requests.Response:
    for attempt in range(2):
        resp = requests.request(method, f"{STORAGE_URL}/objects/{path}",
                                headers={"X-Storage-Key": init_storage(force=attempt > 0), **kwargs.pop("headers", {})},
                                **kwargs)
        if resp.status_code != 404 or attempt:
            break
    resp.raise_for_status()
    return resp


def put_object(path: str, data: bytes, content_type: str) -> dict:
    return _storage_call("PUT", path, headers={"Content-Type": content_type}, data=data, timeout=120).json()


def get_object(path: str) -> bytes:
    return _storage_call("GET", path, timeout=60).content


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class CourseIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    duration: str = ""
    level: str = ""
    mode: str = ""
    topics: List[str] = []
    badge: str = ""
    image: str = ""
    order: int = 0


class PackageIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    features: List[str] = []
    icon: str = "Sparkles"
    badge: str = ""
    image: str = ""
    order: int = 0


class ProductIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = ""
    description: str = ""
    badge: str = ""
    image: str = ""
    order: int = 0


MODELS = {"courses": CourseIn, "packages": PackageIn, "products": ProductIn}


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------
def _u(pid: str) -> str:
    return f"https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&w=800&q=80"


def _px(pid: str) -> str:
    return f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=800"


SEED_COURSES = [
    ("Digital Marketing", "SEO, social media, Google & Meta ads, content and analytics — run real campaigns end to end.", "3 Months", "Beginner → Advanced", "Online & Offline", ["SEO", "Social Media", "Google Ads", "Analytics"], "Job Oriented", _u("1460925895917-afdab827c52f")),
    ("ITIL Foundation", "Learn IT service management best practices and prepare for the ITIL 4 Foundation certification.", "4 Weeks", "Beginner", "Online & Offline", ["ITIL 4", "Service Desk", "Incident Mgmt", "Change Mgmt"], "Certification Prep", _u("1517048676732-d65bc937f952")),
    ("Networking (CCNA)", "Routing, switching, subnetting, Wi-Fi and network security with hands-on lab practice.", "3 Months", "Beginner → Intermediate", "Online & Offline", ["TCP/IP", "Routing", "Switching", "Firewalls"], "Hands-on Labs", _u("1680691257251-5fead813b73e")),
    ("Database Management", "Design, query and manage databases with SQL, MySQL, Oracle and MongoDB.", "2 Months", "Beginner → Intermediate", "Online & Offline", ["SQL", "MySQL", "Oracle", "MongoDB"], "Practical Projects", _u("1695668548342-c0c1ad479aee")),
    ("Core & Advanced Java", "Object-oriented programming, collections, JDBC, Spring Boot and building real applications.", "4 Months", "Beginner → Advanced", "Online & Offline", ["Core Java", "OOP", "JDBC", "Spring Boot"], "Placement Support", _u("1542831371-29b0f74f9713")),
    ("Python Programming", "From Python basics to automation, Django web apps and data handling.", "3 Months", "Beginner → Advanced", "Online & Offline", ["Python", "Django", "Automation", "Pandas"], "Most Popular", _u("1555066931-4365d14bab8c")),
    ("Full Stack Development", "Build complete web apps — HTML, CSS, JavaScript, React, Node.js and databases.", "6 Months", "Beginner → Advanced", "Online & Offline", ["HTML/CSS", "React", "Node.js", "MongoDB"], "Placement Support", _u("1467232004584-a241de8bcf5d")),
    ("Cyber Security", "Ethical hacking, network defence, threat analysis and security tools in real lab environments.", "3 Months", "Intermediate", "Online & Offline", ["Ethical Hacking", "Kali Linux", "SIEM", "VAPT"], "Hands-on Labs", _u("1614064641938-3bbee52942c7")),
    ("Artificial Intelligence", "Machine learning, deep learning and generative AI with Python and real-world projects.", "4 Months", "Intermediate → Advanced", "Online & Offline", ["Machine Learning", "Deep Learning", "GenAI", "Python"], "Future Ready", _u("1737644467636-6b0053476bb2")),
]

SEED_PACKAGES = [
    ("Search Engine Optimization", "Search", "Technical SEO, content and authority building to win high-intent search traffic.", ["Keyword research", "On-page & technical SEO", "Local SEO / Google Business", "Monthly ranking report"]),
    ("Social Media Marketing", "Share2", "Always-on content systems that build communities and compound reach.", ["Content calendar", "Posts, reels & stories", "Community management", "Monthly insights"]),
    ("Performance Marketing", "Target", "ROI-obsessed paid media across Google, Meta and beyond.", ["Google & Meta ads setup", "Audience targeting", "A/B creative testing", "Conversion tracking"]),
    ("Brand Strategy & Identity", "Palette", "Positioning, messaging and visual systems that make you unmistakable.", ["Logo & brand kit", "Brand guidelines", "Messaging framework", "Stationery design"]),
    ("Creative & Video Production", "Clapperboard", "Scroll-stopping reels, ads and brand films produced in-house.", ["Reels & short videos", "Ad creatives", "Product shoots", "Motion graphics"]),
    ("Website Design & Development", "Code2", "Fast, conversion-first websites and landing pages built to scale.", ["Responsive design", "SEO-ready build", "Landing pages", "Maintenance support"]),
    ("Content Marketing", "PenTool", "Editorial engines that attract, educate and convert your audience.", ["Blogs & articles", "Copywriting", "Lead magnets", "Content strategy"]),
    ("Email & Marketing Automation", "Mail", "Lifecycle flows that nurture leads into loyal customers.", ["Email campaigns", "WhatsApp broadcasts", "Automated journeys", "List management"]),
    ("Analytics & CRO", "LineChart", "Measurement, experimentation and optimization for compounding gains.", ["GA4 & tag setup", "Dashboards", "Funnel analysis", "Conversion optimisation"]),
]

SEED_PRODUCTS = [
    ("Harddisk", "Storage", _u("1531492746076-161ca9bcad58")),
    ("CPU", "Components", _u("1518770660439-4636190af475")),
    ("Tablet PC", "Computers", _u("1623126908029-58cb08a2b272")),
    ("DVD Writer", "Storage", _u("1618034100983-e1d78be0dc80")),
    ("Pen Drive", "Storage", _u("1587145820098-23e484e69816")),
    ("LAN Card", "Networking", _u("1544197150-b99a580bb7a8")),
    ("Server", "Computers", _u("1695668548342-c0c1ad479aee")),
    ("Cabinet", "Components", _u("1587202372775-e229f172b9d7")),
    ("Networking", "Networking", _u("1680691257251-5fead813b73e")),
    ("Laptop-Keyboard", "Laptop Parts", _u("1529236183275-4fdcf2bc987e")),
    ("RAM", "Components", _px("7594824")),
    ("Motherboard", "Components", _u("1562408590-e32931084e23")),
    ("K/B-Mouse", "Peripherals", _u("1635987391914-cb84b567e68f")),
    ("Scanner", "Printing", _u("1666101041092-468eb2818c87")),
    ("Headphone", "Audio & Video", _u("1505740420928-5e560c06d30e")),
    ("Sound Card", "Audio & Video", _u("1618609377864-68609b857e90")),
    ("Projector", "Audio & Video", _u("1535016120720-40c646be5580")),
    ("Monitor", "Peripherals", _px("326512")),
    ("Digital Camera", "Audio & Video", _u("1502920917128-1aa500764cbd")),
    ("Software", "Software", _u("1571171637578-41bc2dd41cd2")),
    ("Laptop", "Computers", _u("1496181133206-80ce9b88a853")),
    ("LED/ LCD", "Audio & Video", _u("1560169897-fc0cdbdfa4d5")),
    ("Multimedia", "Audio & Video", _u("1545454675-3531b543be5d")),
    ("UPS/ Inverter", "Power", _px("38040020")),
    ("Web Cam", "Peripherals", _u("1623949556303-b0d17d198863")),
    ("TV Tuner Card", "Components", _u("1636230837680-478e71305f22")),
    ("Toner Cartridge", "Printing", _u("1706895040634-62055892cbbb")),
    ("Accessories", "Peripherals", _px("7596072")),
    ("CPU FAN", "Components", _u("1624701928517-44c8ac49d93c")),
    ("Laptop-Battery", "Laptop Parts", _px("7019805")),
    ("CCTV", "Security", _u("1589935447067-5531094415d1")),
    ("Desktop", "Computers", _u("1587831990711-23ca6441447b")),
    ("Graphics Card", "Components", _u("1562976540-1502c2145186")),
    ("Mobile/iphone", "Mobile", _u("1511707171634-5f897ff02aa9")),
    ("Printer", "Printing", _u("1612815154858-60aa4c59eaa6")),
    ("Data Card", "Networking", _px("29711663")),
    ("UTP Cable", "Networking", _u("1683322499436-f4383dd59f5a")),
    ("Power Bank", "Mobile", _u("1557767382-97b28f5488e7")),
    ("Bluetooth Headset", "Audio & Video", _u("1572569511254-d8f925fe2cbb")),
    ("Laptop-Charger", "Laptop Parts", _u("1731616103600-3fe7ccdc5a59")),
]


def _seed_docs(kind: str) -> List[dict]:
    if kind == "courses":
        rows = [CourseIn(title=t, description=d, duration=du, level=lv, mode=m, topics=tp, badge=b, image=img, order=i)
                for i, (t, d, du, lv, m, tp, b, img) in enumerate(SEED_COURSES)]
    elif kind == "packages":
        rows = [PackageIn(title=t, icon=ic, description=d, features=f, order=i)
                for i, (t, ic, d, f) in enumerate(SEED_PACKAGES)]
    else:
        rows = [ProductIn(name=n, category=c, image=img, badge="Ask for Quote", order=i,
                          description=f"{n} from leading brands — tell us your requirement for the best price.")
                for i, (n, c, img) in enumerate(SEED_PRODUCTS)]
    now = datetime.now(timezone.utc).isoformat()
    return [{"id": str(uuid.uuid4()), **r.model_dump(), "created_at": now, "updated_at": now} for r in rows]


async def seed_catalog(db) -> None:
    for kind in MODELS:
        if await db[kind].count_documents({}) == 0:
            await db[kind].insert_many(_seed_docs(kind))
            logger.info(f"Seeded {kind}")
        await db[kind].create_index("id", unique=True)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
def create_catalog_router(db, require_admin) -> APIRouter:
    router = APIRouter(prefix="/api")

    def _check_kind(kind: str):
        if kind not in MODELS:
            raise HTTPException(status_code=404, detail="Unknown catalog")
        return MODELS[kind]

    @router.get("/catalog/{kind}")
    async def list_items(kind: str):
        _check_kind(kind)
        return await db[kind].find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)]).to_list(500)

    @router.post("/admin/catalog/{kind}")
    async def create_item(kind: str, payload: dict, user: dict = Depends(require_admin)):
        data = _check_kind(kind)(**payload).model_dump()
        now = datetime.now(timezone.utc).isoformat()
        doc = {"id": str(uuid.uuid4()), **data, "created_at": now, "updated_at": now}
        await db[kind].insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.put("/admin/catalog/{kind}/{item_id}")
    async def update_item(kind: str, item_id: str, payload: dict, user: dict = Depends(require_admin)):
        data = _check_kind(kind)(**payload).model_dump()
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        res = await db[kind].find_one_and_update({"id": item_id}, {"$set": data},
                                                 projection={"_id": 0}, return_document=True)
        if not res:
            raise HTTPException(status_code=404, detail="Item not found")
        return res

    @router.delete("/admin/catalog/{kind}/{item_id}")
    async def delete_item(kind: str, item_id: str, user: dict = Depends(require_admin)):
        _check_kind(kind)
        res = await db[kind].delete_one({"id": item_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"ok": True}

    @router.post("/admin/upload")
    async def upload_image(file: UploadFile = File(...), user: dict = Depends(require_admin)):
        ext = ALLOWED_TYPES.get(file.content_type or "")
        if not ext:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP or GIF images are allowed")
        data = await file.read()
        if len(data) > MAX_UPLOAD:
            raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")
        path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
        try:
            result = await asyncio.to_thread(put_object, path, data, file.content_type)
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            raise HTTPException(status_code=502, detail="Image upload failed, please try again")
        await db.files.insert_one({
            "id": str(uuid.uuid4()), "storage_path": result["path"], "original_filename": file.filename,
            "content_type": file.content_type, "size": result.get("size", len(data)), "is_deleted": False,
            "uploaded_by": user["id"], "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"url": f"/api/files/{result['path']}"}

    @router.get("/files/{path:path}")
    async def serve_file(path: str):
        record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
        if not record:
            raise HTTPException(status_code=404, detail="File not found")
        try:
            data = await asyncio.to_thread(get_object, path)
        except Exception as e:
            logger.error(f"File fetch failed: {e}")
            raise HTTPException(status_code=502, detail="Could not load file")
        return Response(content=data, media_type=record["content_type"],
                        headers={"Cache-Control": "public, max-age=86400"})

    return router
