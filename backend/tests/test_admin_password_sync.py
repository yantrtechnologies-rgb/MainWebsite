# Admin login applies ADMIN_PASSWORD even when the startup hook never ran (as on Vercel).
# Offline: uses an in-memory users collection, so it needs no database or running server.
import copy
import os
import sys
from pathlib import Path

import pytest

TEST_ENV = {
    "DATABASE_URL": "postgresql://unused",
    "JWT_SECRET": "offline-test-secret-not-used-anywhere-else",
    "ADMIN_EMAIL": "Admin@Example.com",
    "ADMIN_PASSWORD": "first-test-pass",
}


class FakeUsers:
    def __init__(self):
        self.docs = []

    @staticmethod
    def _match(doc, query):
        return all(doc.get(k) == v for k, v in query.items())

    async def find_one(self, query, projection=None):
        return next((copy.deepcopy(d) for d in self.docs if self._match(d, query)), None)

    async def insert_one(self, doc):
        self.docs.append(copy.deepcopy(doc))

    async def update_one(self, query, update):
        for d in self.docs:
            if self._match(d, query):
                d.update(update.get("$set", {}))
                return


@pytest.fixture
def app_env(monkeypatch):
    for key, value in TEST_ENV.items():
        monkeypatch.setenv(key, value)
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    import server
    from fastapi.testclient import TestClient

    users = FakeUsers()
    monkeypatch.setattr(server, "db", type("FakeDB", (), {"users": users})())
    server._login_attempts.clear()
    client = TestClient(server.app)  # not used as a context manager, so startup does not run

    def login(password, email="admin@example.com"):
        server._login_attempts.clear()
        return client.post("/api/auth/login", json={"email": email, "password": password}).status_code

    return server, users, login, monkeypatch


def test_admin_created_on_first_login(app_env):
    _, users, login, _ = app_env
    assert login("first-test-pass") == 200
    assert users.docs[0]["email"] == "admin@example.com" and users.docs[0]["role"] == "admin"


def test_changed_admin_password_applies_without_restart(app_env):
    _, _, login, monkeypatch = app_env
    assert login("first-test-pass") == 200
    monkeypatch.setenv("ADMIN_PASSWORD", "second-test-pass")
    assert login("second-test-pass") == 200
    assert login("first-test-pass") == 401


def test_admin_role_restored(app_env):
    _, users, login, _ = app_env
    assert login("first-test-pass") == 200
    users.docs[0]["role"] = "student"
    assert login("first-test-pass") == 200
    assert users.docs[0]["role"] == "admin"


def test_other_users_unaffected(app_env):
    server, users, login, _ = app_env
    users.docs.append({"id": "s1", "name": "Student", "email": "student@example.com", "role": "student",
                       "password_hash": server.hash_password("student-pass")})
    assert login("student-pass", "student@example.com") == 200
    assert login("wrong-pass", "student@example.com") == 401
    assert not any(d["role"] == "admin" for d in users.docs)
