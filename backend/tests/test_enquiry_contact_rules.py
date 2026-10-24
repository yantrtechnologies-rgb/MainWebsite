# Enquiry contact rules (phone OR email required) + free-text budget + admin list rendering of phone-only leads
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
ADMIN_EMAIL = "amtrks79@gmail.com"
ADMIN_PASSWORD = "YantrAdmin@2026"


def _hdr():
    return {"Content-Type": "application/json", "X-Forwarded-For": f"10.250.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"}


@pytest.fixture(scope="module")
def auth():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _post(body):
    return requests.post(f"{BASE_URL}/api/enquiries", json=body, headers=_hdr())


class TestContactRequired:
    def test_both_missing_422(self):
        r = _post({"vertical": "products", "name": "TEST_NoContact"})
        assert r.status_code == 422, r.text

    def test_both_empty_422(self):
        r = _post({"vertical": "products", "name": "TEST_NoContact", "email": "", "phone": ""})
        assert r.status_code == 422, r.text

    def test_whitespace_only_422(self):
        r = _post({"vertical": "products", "name": "TEST_NoContact", "email": "  ", "phone": "   "})
        assert r.status_code == 422, r.text

    def test_email_null_phone_empty_422(self):
        r = _post({"vertical": "products", "name": "TEST_NoContact", "email": None, "phone": ""})
        assert r.status_code == 422, r.text

    def test_invalid_email_422(self):
        r = _post({"vertical": "products", "name": "TEST_BadEmail", "email": "notanemail"})
        assert r.status_code == 422, r.text


class TestValidSubmissions:
    def test_phone_only_with_budget_persisted(self, auth):
        budget = "TEST ₹75,000 – ₹1,20,000 flexible"
        r = _post({"vertical": "products", "name": "TEST_PhoneOnly", "phone": "9876543210", "email": "", "budget": budget})
        assert r.status_code == 200, r.text
        eid = r.json()["id"]
        lst = requests.get(f"{BASE_URL}/api/admin/enquiries", params={"search": eid}, headers=auth)
        assert lst.status_code == 200
        items = lst.json() if isinstance(lst.json(), list) else lst.json().get("items", lst.json().get("enquiries", []))
        match = [x for x in items if x["id"] == eid]
        assert match, "phone-only lead not found in admin list"
        assert match[0]["budget"] == budget
        assert match[0]["phone"] == "9876543210"
        assert match[0]["email"] is None
        assert "_id" not in match[0]

    def test_email_only(self, auth):
        r = _post({"vertical": "marketing", "name": "TEST_EmailOnly", "email": "test_emailonly@example.com"})
        assert r.status_code == 200, r.text
        eid = r.json()["id"]
        lst = requests.get(f"{BASE_URL}/api/admin/enquiries", params={"search": eid}, headers=auth).json()
        items = lst if isinstance(lst, list) else lst.get("items", lst.get("enquiries", []))
        m = [x for x in items if x["id"] == eid]
        assert m and m[0]["email"] == "test_emailonly@example.com" and not m[0].get("phone")

    def test_admin_list_full_ok(self, auth):
        r = requests.get(f"{BASE_URL}/api/admin/enquiries", headers=auth)
        assert r.status_code == 200

    def test_metrics_ok(self, auth):
        r = requests.get(f"{BASE_URL}/api/admin/metrics", headers=auth)
        assert r.status_code == 200
