"""Brevo request format, retries, and failure handling without sending email."""
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

os.environ.setdefault("DATABASE_URL", "postgresql://unused/unused")
os.environ.setdefault("JWT_SECRET", "test-only-key-not-for-production")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import httpx
import json
import server


class BrevoTests(unittest.IsolatedAsyncioTestCase):
    async def deliver(self, handler):
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        with patch.object(server, "EMAIL_KEY", "test-provider-key"), patch.object(server, "EMAIL_FROM_ADDRESS", "sender@example.com"), patch.object(server, "EMAIL_REPLY_TO", "reply@example.com"), patch.object(server.httpx, "AsyncClient", return_value=client):
            return await server.send_email(to="owner@example.com", subject="Enquiry", html="<p>New enquiry</p>")

    async def test_brevo_payload_and_message_id(self):
        def handler(request):
            self.assertEqual(str(request.url), "https://api.brevo.com/v3/smtp/email")
            self.assertEqual(request.headers["api-key"], "test-provider-key")
            payload = json.loads(request.content)
            self.assertEqual(payload["sender"]["email"], "sender@example.com")
            self.assertEqual(payload["replyTo"]["email"], "reply@example.com")
            self.assertEqual(payload["to"], [{"email": "owner@example.com"}])
            self.assertEqual(payload["htmlContent"], "<p>New enquiry</p>")
            return httpx.Response(201, json={"messageId": "test-id"})
        self.assertEqual(await self.deliver(handler), "test-id")

    async def test_rejected_key_reports_failure(self):
        self.assertIsNone(await self.deliver(lambda request: httpx.Response(401, json={"code": "unauthorized"})))

    async def test_rate_limit_is_retried_once(self):
        calls = []
        def handler(request):
            calls.append(request)
            return httpx.Response(429, json={"code": "rate_limit"}) if len(calls) == 1 else httpx.Response(201, json={"messageId": "retry-id"})
        with patch.object(server.asyncio, "sleep", new=AsyncMock()):
            self.assertEqual(await self.deliver(handler), "retry-id")
        self.assertEqual(len(calls), 2)


if __name__ == "__main__":
    unittest.main()
