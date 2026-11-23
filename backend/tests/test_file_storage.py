"""Offline tests for uploaded-image storage (no database, network or real bucket needed)."""
import asyncio
import base64
import io
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException, UploadFile  # noqa: E402
from fastapi.responses import RedirectResponse  # noqa: E402

from catalog import _load_file, _store_upload  # noqa: E402
from file_storage import BucketStorage, storage_from_env  # noqa: E402

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64
USER = {"id": "admin-1"}


class FakeFiles:
    def __init__(self):
        self.records = []

    async def insert_one(self, doc):
        self.records.append(dict(doc))

    async def find_one(self, query, projection=None):
        for r in self.records:
            if all(r.get(k) == v for k, v in query.items()):
                return dict(r)
        return None


class FakeDb:
    def __init__(self):
        self.files = FakeFiles()


class FakeBody:
    def __init__(self, data):
        self.data = data

    def read(self):
        return self.data


class FakeS3:
    def __init__(self):
        self.objects = {}

    def put_object(self, Bucket, Key, Body, ContentType, CacheControl):
        self.objects[(Bucket, Key)] = (Body, ContentType)

    def get_object(self, Bucket, Key):
        return {"Body": FakeBody(self.objects[(Bucket, Key)][0])}


def upload(data=PNG, content_type="image/png"):
    return UploadFile(file=io.BytesIO(data), filename="logo.png", headers={"content-type": content_type})


def run(coro):
    return asyncio.run(coro)


def test_no_settings_keeps_images_in_database():
    assert storage_from_env({}) is None
    db = FakeDb()
    path = run(_store_upload(db, upload(), USER))
    rec = db.files.records[0]
    assert rec["storage_path"] == path and base64.b64decode(rec["data"]) == PNG
    resp = run(_load_file(db, path))
    assert resp.body == PNG and resp.media_type == "image/png"


def test_bucket_upload_keeps_database_record_small():
    db, s3 = FakeDb(), FakeS3()
    storage = BucketStorage("xolnet-files", client=s3)
    path = run(_store_upload(db, upload(), USER, storage))
    rec = db.files.records[0]
    assert "data" not in rec and rec["location"] == "bucket"
    assert s3.objects[("xolnet-files", path)] == (PNG, "image/png")
    assert run(_load_file(db, path, storage)).body == PNG


def test_bucket_with_public_url_redirects():
    db, s3 = FakeDb(), FakeS3()
    storage = BucketStorage("b", client=s3, public_base_url="https://files.xolnet.in/")
    path = run(_store_upload(db, upload(), USER, storage))
    resp = run(_load_file(db, path, storage))
    assert isinstance(resp, RedirectResponse) and resp.headers["location"] == f"https://files.xolnet.in/{path}"


def test_old_database_images_still_served_after_bucket_enabled():
    db = FakeDb()
    path = run(_store_upload(db, upload(), USER))  # uploaded before the switch
    storage = BucketStorage("b", client=FakeS3())
    assert run(_load_file(db, path, storage)).body == PNG


def test_bucket_record_without_storage_settings_is_404():
    db = FakeDb()
    path = run(_store_upload(db, upload(), USER, BucketStorage("b", client=FakeS3())))
    with pytest.raises(HTTPException) as e:
        run(_load_file(db, path))
    assert e.value.status_code == 404


def test_rejects_non_images_and_large_files():
    with pytest.raises(HTTPException):
        run(_store_upload(FakeDb(), upload(b"hello", "text/plain"), USER))
    with pytest.raises(HTTPException):
        run(_store_upload(FakeDb(), upload(b"0" * (3 * 1024 * 1024 + 1)), USER))


def test_settings_parsing():
    assert storage_from_env({"FILE_STORAGE": "db"}) is None
    with pytest.raises(ValueError):  # bucket storage without a bucket name is a configuration error
        storage_from_env({"FILE_STORAGE": "s3"})
    s = storage_from_env({"FILE_STORAGE": " S3 ", "S3_BUCKET": "xolnet-files", "S3_REGION": "ap-southeast-2",
                          "S3_PUBLIC_BASE_URL": "https://cdn.example/",
                          "S3_ACCESS_KEY_ID": "AKIAEXAMPLE", "S3_SECRET_ACCESS_KEY": "example-secret"})
    assert s.bucket == "xolnet-files" and s.public_url("a/b.png") == "https://cdn.example/a/b.png"


def test_explicit_keys_are_used_and_must_come_in_pairs(monkeypatch):
    # Simulate Vercel: its own AWS identity sits in AWS_* variables and must be ignored.
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "VERCEL-INTERNAL")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "vercel-internal-secret")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "vercel-internal-token")
    s = storage_from_env({"FILE_STORAGE": "s3", "S3_BUCKET": "b", "S3_REGION": "ap-southeast-2",
                          "S3_ACCESS_KEY_ID": "AKIAEXAMPLE", "S3_SECRET_ACCESS_KEY": "example-secret"})
    creds = s.client._request_signer._credentials
    assert creds.access_key == "AKIAEXAMPLE" and creds.token is None
    assert s.client.meta.region_name == "ap-southeast-2"
    with pytest.raises(ValueError):
        storage_from_env({"FILE_STORAGE": "s3", "S3_BUCKET": "b", "S3_ACCESS_KEY_ID": "AKIAEXAMPLE"})
