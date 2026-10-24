# Iteration 3: customer thank-you email (non-blocking) + phone/email rule regression
import os
import time
import uuid
import subprocess
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
CUSTOMER_EMAIL = "amtrks79@gmail.com"
LOG_GLOB = "/var/log/supervisor/backend.err.log"


def _ip():
    return f"10.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"


def _post(payload):
    return requests.post(f"{BASE_URL}/api/enquiries", json=payload,
                         headers={"X-Forwarded-For": _ip()}, timeout=30)


def _log_tail(n=300):
    out = subprocess.run(f"tail -n {n} /var/log/supervisor/backend.*.log", shell=True,
                         capture_output=True, text=True)
    return out.stdout


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "amtrks79@gmail.com", "password": "YantrAdmin@2026"},
                      headers={"X-Forwarded-For": _ip()}, timeout=20)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    return r.json()["token"]


# Customer email flow: with email -> fast 200, 2 sends in log
class TestCustomerEmail:
    def test_with_email_fast_and_two_sends(self, admin_token):
        before = _log_tail(2000).count("email/send")
        t0 = time.time()
        r = _post({"vertical": "marketing", "category": "SEO", "name": "TEST_Iter3 Email",
                   "email": CUSTOMER_EMAIL, "phone": "9999999999", "message": "TEST iter3 thank-you"})
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["id"].startswith("YT-") and d["status"] == "received"
        assert elapsed < 3, f"Slow response {elapsed:.2f}s"
        time.sleep(8)
        logs = _log_tail(2000)
        after = logs.count("email/send")
        print("email/send lines delta:", after - before)
        recent = [l for l in logs.splitlines() if "email/send" in l][-3:]
        print("\n".join(recent))
        assert after - before == 2, f"Expected 2 email sends, got {after - before}"
        # NOTE: provider may return 429 rate_limited on bursts; report, not code bug
        assert all("202 Accepted" in l for l in recent[-2:]), recent[-2:]
        # persisted
        g = requests.get(f"{BASE_URL}/api/admin/enquiries", params={"search": d["id"]},
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=20)
        assert g.status_code == 200
        body = g.json()
        items = body if isinstance(body, list) else body.get("items", body.get("enquiries", []))
        assert any(i["id"] == d["id"] for i in items)

    def test_phone_only_one_send(self):
        before = _log_tail(2000).count("email/send")
        r = _post({"vertical": "general", "name": "TEST_Iter3 Phone", "phone": "9888888888",
                   "message": "TEST phone only"})
        assert r.status_code == 200, r.text
        time.sleep(6)
        logs = _log_tail(2000)
        delta = logs.count("email/send") - before
        assert delta == 1, f"Expected 1 email send, got {delta}"
        tail = logs.splitlines()[-40:]
        assert not any("Email send error" in l or "Email send failed" in l for l in tail)


# Regression: phone-or-email rule
class TestRule:
    def test_neither_phone_nor_email_rejected(self):
        r = _post({"vertical": "general", "name": "TEST_Iter3 None", "message": "x"})
        assert r.status_code in (400, 422)

    def test_invalid_email_rejected(self):
        r = _post({"vertical": "general", "name": "TEST_Iter3 Bad", "email": "not-an-email"})
        assert r.status_code in (400, 422)


def test_cleanup(admin_token):
    # Cleanup TEST_ leads directly via mongo
    script = ("from pymongo import MongoClient;import os;"
              "from dotenv import load_dotenv;load_dotenv('/app/backend/.env');"
              "c=MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']];"
              "print(c.enquiries.delete_many({'name':{'$regex':'^TEST_'}}).deleted_count)")
    out = subprocess.run(["python", "-c", script], capture_output=True, text=True)
    print("deleted:", out.stdout, out.stderr)
