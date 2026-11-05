"""Integration coverage for the Postgres API and durable document updates."""
import asyncio
import os
import sys
import unittest
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env.local")
sys.path.insert(0, str(ROOT / "backend"))
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from server import app, db


class PostgresIntegration(unittest.TestCase):
    def test_api_persistence_and_permissions(self):
        with TestClient(app) as client:
            self.assertEqual(client.get("/api/").status_code, 200)
            self.assertEqual(client.get("/api/admin/enquiries").status_code, 401)
            login = client.post("/api/auth/login", json={"email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"]})
            self.assertEqual(login.status_code, 200, login.text)
            headers = {"Authorization": "Bearer " + login.json()["token"]}
            for kind in ["courses", "testimonials", "products"]:
                response = client.get("/api/catalog/" + kind)
                self.assertEqual(response.status_code, 200)
                self.assertIsInstance(response.json(), list)
            marker = "VERIFY_" + uuid.uuid4().hex
            result = client.post("/api/enquiries", json={"name": marker, "phone": "9000000000", "vertical": "general"})
            self.assertEqual(result.status_code, 200, result.text)
            enquiry_id = result.json()["id"]
            try:
                found = client.get("/api/admin/enquiries", headers=headers, params={"search": marker}).json()
                self.assertEqual(len(found), 1)
                self.assertEqual(client.patch(f"/api/admin/enquiries/{enquiry_id}/status", headers=headers, json={"status": "Contacted"}).status_code, 200)
                self.assertEqual(client.post(f"/api/admin/enquiries/{enquiry_id}/notes", headers=headers, json={"note": "Persistence check"}).status_code, 200)
                updated = client.get("/api/admin/enquiries", headers=headers, params={"search": marker}).json()[0]
                self.assertEqual(updated["status"], "Contacted")
                self.assertEqual(updated["notes"][-1]["text"], "Persistence check")
                self.assertEqual(client.get("/api/admin/metrics", headers=headers).status_code, 200)
            finally:
                client.portal.call(db.enquiries.delete_one, {"id": enquiry_id})


if __name__ == "__main__":
    unittest.main()
