import base64
import asyncio
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import requests
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)

APP_NAME = "xolnet"
MAX_UPLOAD = 3 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}

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


class TestimonialIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    org: str = ""
    service: str = ""
    quote: str = Field(min_length=1, max_length=600)
    rating: int = Field(default=5, ge=1, le=5)
    label: str = ""
    image: str = ""
    order: int = 0


class ClientIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    image: str = ""
    order: int = 0


class InfluencerOfferIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=3000)
    pricing: str = Field(default="", max_length=200)
    image: str = ""
    second_image: str = ""
    third_image: str = ""
    order: int = 0


MODELS = {"courses": CourseIn, "packages": PackageIn, "products": ProductIn,
          "influencer-offers": InfluencerOfferIn,
          "testimonials": TestimonialIn, "clients": ClientIn}

SEED_TESTIMONIALS = [
    ("Priya Mohanty", "Full Stack Development student", "IT Training", "The trainers explained every concept with real projects. Within six months I built my own portfolio and cracked my first developer interview."),
    ("Rakesh Agarwal", "Retail business owner, Sambalpur", "IT Products", "We bought laptops, a printer and CCTV for our shop. XOLNET gave the best quote in town, installed everything on time and still supports us."),
    ("Sneha Patel", "Boutique owner", "Social Media Marketing", "Our Instagram enquiries doubled in three months. The team plans our posts and reels so I can focus on running the store."),
    ("Amit Behera", "Cyber Security student", "IT Training", "The hands-on labs were the best part. I learned tools I now use every day at work. Highly recommend the faculty."),
    ("Sunita Das", "Office administrator", "Bulk IT Procurement", "Quick quotations, genuine products and proper billing. They handled our complete office setup including networking."),
    ("Manoj Sahu", "Restaurant owner", "SEO & Google Business", "Customers now find us on Google Maps easily. Our weekend footfall has clearly gone up since XOLNET took over our online presence."),
]

SEED_CLIENTS = ["Adobe", "Malabar Jewellers", "Tanishq", "Anand Super Market", "Dell", "HP", "Lenovo",
                "Reliance Digital", "Croma", "Airtel", "HDFC Bank", "Tata Motors", "Asian Paints", "Infosys", "Mahindra"]


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
    elif kind == "testimonials":
        rows = [TestimonialIn(name=n, org=o, service=s, quote=q, rating=5, label="Sample review", order=i)
                for i, (n, o, s, q) in enumerate(SEED_TESTIMONIALS)]
    elif kind == "clients":
        rows = [ClientIn(name=n, order=i) for i, n in enumerate(SEED_CLIENTS)]
    else:
        rows = [ProductIn(name=n, category=c, image=img, badge="", order=i,
                          description=f"{n} from leading brands — tell us your requirement for the best price.")
                for i, (n, c, img) in enumerate(SEED_PRODUCTS)]
    now = datetime.now(timezone.utc).isoformat()
    return [{"id": str(uuid.uuid4()), **r.model_dump(), "created_at": now, "updated_at": now} for r in rows]


async def seed_catalog(db) -> None:
    for kind in MODELS:
        if kind == "influencer-offers":
            continue
        if await db[kind].count_documents({}) == 0:
            await db[kind].insert_many(_seed_docs(kind))
            logger.info(f"Seeded {kind}")
        await db[kind].create_index("id", unique=True)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
def _check_kind(kind: str):
    if kind not in MODELS:
        raise HTTPException(status_code=404, detail="Unknown catalog")
    return MODELS[kind]


def _validate(kind: str, payload: dict) -> dict:
    model = _check_kind(kind)
    try:
        return model(**payload).model_dump()
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors(include_url=False, include_context=False))


async def _store_upload(db, file: UploadFile, user: dict) -> str:
    ext = ALLOWED_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP or GIF images are allowed")
    data = await file.read()
    if len(data) > MAX_UPLOAD:
        raise HTTPException(status_code=400, detail="Image must be 3 MB or smaller")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    stored = {"path": path, "size": len(data)}
    await db.files.insert_one({
        "id": str(uuid.uuid4()), "data": base64.b64encode(data).decode("ascii"), "storage_path": stored["path"], "original_filename": file.filename,
        "content_type": file.content_type, "size": stored.get("size", len(data)), "is_deleted": False,
        "uploaded_by": user["id"], "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return stored["path"]


async def _load_file(db, path: str) -> Response:
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    content = base64.b64decode(record["data"])
    return Response(content=content, media_type=record["content_type"],
                    headers={"Cache-Control": "public, max-age=86400"})


def create_catalog_router(db, require_admin) -> APIRouter:
    router = APIRouter(prefix="/api")
    _register_item_routes(router, db, require_admin)
    _register_file_routes(router, db, require_admin)
    return router


def _register_item_routes(router: APIRouter, db, require_admin) -> None:
    @router.get("/catalog/{kind}")
    async def list_items(kind: str):
        _check_kind(kind)
        return await db[kind].find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)]).to_list(500)

    @router.post("/admin/catalog/{kind}")
    async def create_item(kind: str, payload: dict, user: dict = Depends(require_admin)):
        data = _validate(kind, payload)
        now = datetime.now(timezone.utc).isoformat()
        doc = {"id": str(uuid.uuid4()), **data, "created_at": now, "updated_at": now}
        await db[kind].insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.put("/admin/catalog/{kind}/{item_id}")
    async def update_item(kind: str, item_id: str, payload: dict, user: dict = Depends(require_admin)):
        data = _validate(kind, payload)
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


def _register_file_routes(router: APIRouter, db, require_admin) -> None:
    @router.post("/admin/upload")
    async def upload_image(file: UploadFile = File(...), user: dict = Depends(require_admin)):
        return {"url": f"/api/files/{await _store_upload(db, file, user)}"}

    @router.get("/files/{path:path}")
    async def serve_file(path: str):
        return await _load_file(db, path)
