"""Email jobs remain attached to the ASGI request after its response is sent."""
import os
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

os.environ.setdefault("DATABASE_URL", "postgresql://unused/unused")
os.environ.setdefault("JWT_SECRET", "test-only-key-not-for-production")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi import FastAPI
from fastapi.testclient import TestClient
import server


class EmailLifecycleTests(unittest.TestCase):
    def setUp(self):
        self.app = FastAPI()
        self.app.include_router(server.api_router)
        server._rate.clear()

    def submit(self, payload):
        insert = AsyncMock()
        async def deliver(**kwargs):
            insert.assert_awaited_once()
            return "provider-message-id"
        send = AsyncMock(side_effect=deliver)
        database = SimpleNamespace(enquiries=SimpleNamespace(insert_one=insert, update_one=AsyncMock()))
        with patch.object(server, "db", database), patch.object(server, "send_email", send), patch.object(server, "LEAD_NOTIFY_EMAIL", "owner@example.com"):
            with TestClient(self.app) as client:
                response = client.post("/api/enquiries", json=payload)
        self.assertEqual(response.status_code, 200, response.text)
        return send

    def test_customer_and_admin_jobs_finish_in_request_lifecycle(self):
        send = self.submit({"name": "Email lifecycle test", "email": "customer@example.com", "vertical": "general"})
        self.assertEqual(send.await_count, 2)
        self.assertEqual([call.kwargs["to"] for call in send.await_args_list], ["owner@example.com", "customer@example.com"])

    def test_phone_only_enquiry_sends_only_admin_notification(self):
        send = self.submit({"name": "Phone lifecycle test", "phone": "9000000000", "vertical": "general"})
        self.assertEqual(send.await_count, 1)
        self.assertEqual(send.await_args.kwargs["to"], "owner@example.com")


if __name__ == "__main__":
    unittest.main()
