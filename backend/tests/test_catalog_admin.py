# Catalog (courses/packages/products), admin CRUD, image upload & file serving tests
import io
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN = {"email": "amtrks79@gmail.com", "password": "YantrAdmin@2026"}

EXPECTED_PRODUCTS = ["Harddisk", "CPU", "Tablet PC", "DVD Writer", "Pen Drive", "LAN Card", "Server", "Cabinet",
                     "Networking", "Laptop-Keyboard", "RAM", "Motherboard", "K/B-Mouse", "Scanner", "Headphone",
                     "Sound Card", "Projector", "Monitor", "Digital Camera", "Software", "Laptop", "LED/ LCD",
                     "Multimedia", "UPS/ Inverter", "Web Cam", "TV Tuner Card", "Toner Cartridge", "Accessories",
                     "CPU FAN", "Laptop-Battery", "CCTV", "Desktop", "Graphics Card", "Mobile/iphone", "Printer",
                     "Data Card", "UTP Cable", "Power Bank", "Bluetooth Headset", "Laptop-Charger"]

# Minimal valid 1x1 PNG
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002"
                    "000154a24f5f0000000049454e44ae426082")


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}")
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def student_headers():
    r = requests.post(f"{BASE_URL}/api/auth/register",
                      json={"name": "TEST Student", "email": f"test_stu_{uuid.uuid4().hex[:8]}@example.com",
                            "password": "Passw0rd!x"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


# --- Public catalog ---
class TestPublicCatalog:
    def test_courses(self):
        r = requests.get(f"{BASE_URL}/api/catalog/courses")
        assert r.status_code == 200
        d = r.json()
        seeded = [c for c in d if not c["title"].startswith("TEST_")]
        assert len(seeded) == 9
        assert all(c["image"] for c in seeded)
        assert all("_id" not in c for c in d)

    def test_packages(self):
        r = requests.get(f"{BASE_URL}/api/catalog/packages")
        assert r.status_code == 200
        d = [p for p in r.json() if not p["title"].startswith("TEST_")]
        assert len(d) == 9
        assert all(len(p["features"]) > 0 for p in d)

    def test_products(self):
        r = requests.get(f"{BASE_URL}/api/catalog/products")
        assert r.status_code == 200
        d = [p for p in r.json() if not p["name"].startswith("TEST_")]
        assert len(d) == 40
        assert [p["name"] for p in d] == EXPECTED_PRODUCTS
        assert all(p["image"] for p in d)

    def test_unknown_kind(self):
        assert requests.get(f"{BASE_URL}/api/catalog/foo").status_code == 404


# --- Auth / RBAC on admin catalog ---
class TestAdminAuth:
    def test_no_token_401(self):
        r = requests.post(f"{BASE_URL}/api/admin/catalog/courses", json={"title": "TEST_x"})
        assert r.status_code == 401

    def test_student_403(self, student_headers):
        r = requests.post(f"{BASE_URL}/api/admin/catalog/courses", json={"title": "TEST_x"}, headers=student_headers)
        assert r.status_code == 403
        r = requests.post(f"{BASE_URL}/api/admin/upload", files={"file": ("a.png", PNG, "image/png")},
                          headers=student_headers)
        assert r.status_code == 403

    def test_validation_missing_title_422(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/catalog/courses", json={"description": "no title"},
                          headers=admin_headers)
        assert r.status_code == 422, f"got {r.status_code}: {r.text[:200]}"

    def test_validation_missing_name_422(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/catalog/products", json={"category": "x"}, headers=admin_headers)
        assert r.status_code == 422, f"got {r.status_code}: {r.text[:200]}"

    def test_validation_put_422(self, admin_headers):
        r = requests.put(f"{BASE_URL}/api/admin/catalog/products/nonexistent", json={"name": ""},
                         headers=admin_headers)
        assert r.status_code == 422, f"got {r.status_code}: {r.text[:200]}"

    def test_unknown_kind_admin_404(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/catalog/foo", json={"title": "TEST_x"}, headers=admin_headers)
        assert r.status_code == 404


# --- CRUD ---
@pytest.mark.parametrize("kind,key", [("courses", "title"), ("packages", "title"), ("products", "name")])
def test_crud_flow(admin_headers, kind, key):
    name = f"TEST_{kind}_{uuid.uuid4().hex[:6]}"
    r = requests.post(f"{BASE_URL}/api/admin/catalog/{kind}", json={key: name, "image": "https://example.com/a.png"},
                      headers=admin_headers)
    assert r.status_code == 200, r.text
    item = r.json()
    assert item[key] == name and isinstance(item["id"], str) and "_id" not in item
    lst = requests.get(f"{BASE_URL}/api/catalog/{kind}").json()
    assert any(i["id"] == item["id"] for i in lst)
    r = requests.put(f"{BASE_URL}/api/admin/catalog/{kind}/{item['id']}", json={key: name + "_upd"},
                     headers=admin_headers)
    assert r.status_code == 200 and r.json()[key] == name + "_upd"
    lst = requests.get(f"{BASE_URL}/api/catalog/{kind}").json()
    assert [i for i in lst if i["id"] == item["id"]][0][key] == name + "_upd"
    r = requests.delete(f"{BASE_URL}/api/admin/catalog/{kind}/{item['id']}", headers=admin_headers)
    assert r.status_code == 200
    lst = requests.get(f"{BASE_URL}/api/catalog/{kind}").json()
    assert not any(i["id"] == item["id"] for i in lst)
    assert requests.delete(f"{BASE_URL}/api/admin/catalog/{kind}/{item['id']}",
                           headers=admin_headers).status_code == 404
    assert requests.put(f"{BASE_URL}/api/admin/catalog/{kind}/{item['id']}", json={key: "x"},
                        headers=admin_headers).status_code == 404


# --- Upload ---
class TestUpload:
    def test_upload_and_serve(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/upload", files={"file": ("TEST_a.png", PNG, "image/png")},
                          headers=admin_headers)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("/api/files/")
        g = requests.get(f"{BASE_URL}{url}")
        assert g.status_code == 200
        assert g.headers["content-type"].startswith("image/png")
        assert g.content == PNG

    def test_upload_no_auth(self):
        r = requests.post(f"{BASE_URL}/api/admin/upload", files={"file": ("a.png", PNG, "image/png")})
        assert r.status_code == 401

    def test_upload_non_image(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/upload", files={"file": ("a.txt", b"hello", "text/plain")},
                          headers=admin_headers)
        assert r.status_code == 400

    def test_upload_too_big(self, admin_headers):
        big = PNG + b"\0" * (5 * 1024 * 1024 + 10)
        r = requests.post(f"{BASE_URL}/api/admin/upload", files={"file": ("big.png", big, "image/png")},
                          headers=admin_headers)
        assert r.status_code in (400, 413)

    def test_missing_file_404(self):
        assert requests.get(f"{BASE_URL}/api/files/yantr/uploads/nope.png").status_code == 404
