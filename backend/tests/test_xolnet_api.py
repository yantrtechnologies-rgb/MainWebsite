import os
from pathlib import Path
import pytest
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]


@pytest.fixture(scope="module")
def s():
    x = requests.Session()
    # unique client IP per run so the per-IP enquiry rate limit isn't shared across runs
    import uuid
    x.headers.update({"Content-Type": "application/json",
                      "X-Forwarded-For": f"10.251.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"})
    return x


@pytest.fixture(scope="module")
def token(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def enquiry_id(s):
    r = s.post(f"{BASE_URL}/api/enquiries", json={
        "vertical": "products", "name": "TEST_Pytest Lead", "email": "test_pytest@example.com",
        "phone": "123", "company": "TEST_Co", "budget": "Not sure yet", "interest": "TEST Laptop",
        "message": "hello"})
    assert r.status_code == 200, r.text
    return r.json()["id"]


# Health
def test_root(s):
    r = s.get(f"{BASE_URL}/api/")
    assert r.status_code == 200 and r.json()["status"] == "ok"


# Auth
class TestAuth:
    def test_login_ok(self, s):
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["role"] == "admin" and d["user"]["email"] == ADMIN_EMAIL
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_bad(self, s):
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me(self, s, auth):
        r = s.get(f"{BASE_URL}/api/auth/me", headers=auth)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL and "password_hash" not in d and "_id" not in d

    def test_me_no_token(self, s):
        assert s.get(f"{BASE_URL}/api/auth/me").status_code == 401

    def test_bad_token(self, s):
        assert s.get(f"{BASE_URL}/api/admin/enquiries", headers={"Authorization": "Bearer junk"}).status_code == 401


# Admin protection
class TestProtection:
    def test_list_no_auth(self, s):
        assert s.get(f"{BASE_URL}/api/admin/enquiries").status_code in (401, 403)

    def test_metrics_no_auth(self, s):
        assert s.get(f"{BASE_URL}/api/admin/metrics").status_code in (401, 403)

    def test_patch_no_auth(self, s):
        assert s.patch(f"{BASE_URL}/api/admin/enquiries/YT-X/status", json={"status": "Lost"}).status_code in (401, 403)


# Enquiries + admin CRUD
class TestEnquiries:
    def test_invalid_email(self, s):
        r = s.post(f"{BASE_URL}/api/enquiries", json={"vertical": "marketing", "name": "x", "email": "bad"})
        assert r.status_code == 422

    def test_created_appears_in_list(self, s, auth, enquiry_id):
        assert enquiry_id.startswith("YT-")
        r = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth)
        assert r.status_code == 200
        items = r.json()
        found = [i for i in items if i["id"] == enquiry_id]
        assert found and found[0]["status"] == "New" and found[0]["vertical"] == "products"
        assert all("_id" not in i for i in items)

    def test_search_and_filter(self, s, auth, enquiry_id):
        r = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth, params={"search": enquiry_id})
        assert [i["id"] for i in r.json()] == [enquiry_id]
        r = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth, params={"vertical": "products", "status": "New"})
        assert all(i["vertical"] == "products" and i["status"] == "New" for i in r.json())

    def test_search_regex_chars(self, s, auth):
        r = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth, params={"search": "("})
        assert r.status_code == 200, f"regex special char search -> {r.status_code}"

    def test_status_update(self, s, auth, enquiry_id):
        r = s.patch(f"{BASE_URL}/api/admin/enquiries/{enquiry_id}/status", headers=auth, json={"status": "Contacted"})
        assert r.status_code == 200 and r.json()["status"] == "Contacted"
        items = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth, params={"search": enquiry_id}).json()
        assert items[0]["status"] == "Contacted"

    def test_status_invalid(self, s, auth, enquiry_id):
        r = s.patch(f"{BASE_URL}/api/admin/enquiries/{enquiry_id}/status", headers=auth, json={"status": "Bogus"})
        assert r.status_code == 400

    def test_status_404(self, s, auth):
        r = s.patch(f"{BASE_URL}/api/admin/enquiries/YT-NOPE/status", headers=auth, json={"status": "Lost"})
        assert r.status_code == 404

    def test_add_note(self, s, auth, enquiry_id):
        r = s.post(f"{BASE_URL}/api/admin/enquiries/{enquiry_id}/notes", headers=auth, json={"note": "TEST note"})
        assert r.status_code == 200 and r.json()["note"]["text"] == "TEST note"
        items = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth, params={"search": enquiry_id}).json()
        assert items[0]["notes"][-1]["text"] == "TEST note"

    def test_followup(self, s, auth, enquiry_id):
        r = s.patch(f"{BASE_URL}/api/admin/enquiries/{enquiry_id}/followup", headers=auth,
                    json={"follow_up_date": "2026-02-01", "owner": "TEST_owner"})
        assert r.status_code == 200
        items = s.get(f"{BASE_URL}/api/admin/enquiries", headers=auth, params={"search": enquiry_id}).json()
        assert items[0]["owner"] == "TEST_owner"

    def test_metrics(self, s, auth):
        r = s.get(f"{BASE_URL}/api/admin/metrics", headers=auth)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] >= 1 and "Contacted" in d["by_status"] and isinstance(d["conversion_rate"], (int, float))


# Rate limiting (runs last - exhausts bucket)
def test_zz_rate_limit(s):
    codes = []
    for i in range(10):
        r = s.post(f"{BASE_URL}/api/enquiries", json={"vertical": "general", "name": f"TEST_rl{i}", "email": "test_rl@example.com"})
        codes.append(r.status_code)
        if r.status_code == 429:
            break
    assert 429 in codes, codes
