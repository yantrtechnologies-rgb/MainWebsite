"""Where uploaded images live.

By default (no settings) images stay inside the database, exactly as before.
Set FILE_STORAGE=s3 to keep new uploads in an S3-compatible bucket instead
(Amazon S3, Cloudflare R2, Backblaze B2, ...), which keeps the database small.

Settings (environment variables):
  FILE_STORAGE          "s3" to enable bucket storage; anything else = database
  S3_BUCKET             bucket name (required for s3)
  S3_REGION             bucket region, e.g. ap-southeast-2 (Amazon S3) or "auto" (R2)
  S3_ENDPOINT_URL       only for non-AWS providers, e.g. https://<account>.r2.cloudflarestorage.com
  S3_PUBLIC_BASE_URL    optional public URL of the bucket/CDN; when set, /api/files/... redirects there
  S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
                        the bucket's access key. Required on Vercel: Vercel reserves the AWS_* names and its
                        functions carry Vercel's own AWS identity, which must never be used for this bucket.
                        Leave unset on AWS Lambda, which uses its execution role.
"""
import asyncio
import os
from typing import Optional


class BucketStorage:
    """Thin async wrapper around an S3-compatible bucket."""

    def __init__(self, bucket: str, region: Optional[str] = None, endpoint_url: Optional[str] = None,
                 public_base_url: Optional[str] = None, access_key_id: Optional[str] = None,
                 secret_access_key: Optional[str] = None, client=None):
        if not bucket:
            raise ValueError("S3_BUCKET is required when FILE_STORAGE=s3")
        if bool(access_key_id) != bool(secret_access_key):
            raise ValueError("Set both S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY, or neither")
        self.bucket = bucket
        self.public_base_url = (public_base_url or "").rstrip("/") or None
        if client is None:
            import boto3  # imported lazily so database-only setups do not need boto3 loaded
            keys = {"aws_access_key_id": access_key_id, "aws_secret_access_key": secret_access_key} if access_key_id else {}
            # An explicit Session ignores any AWS_* credentials already in the environment.
            session = boto3.session.Session(**keys) if keys else boto3.session.Session()
            client = session.client("s3", region_name=region or None, endpoint_url=endpoint_url or None)
        self.client = client

    async def put(self, key: str, data: bytes, content_type: str) -> None:
        await asyncio.to_thread(
            self.client.put_object, Bucket=self.bucket, Key=key, Body=data, ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable",
        )

    async def get(self, key: str) -> bytes:
        obj = await asyncio.to_thread(self.client.get_object, Bucket=self.bucket, Key=key)
        return await asyncio.to_thread(obj["Body"].read)

    def public_url(self, key: str) -> Optional[str]:
        return f"{self.public_base_url}/{key}" if self.public_base_url else None


def storage_from_env(env=os.environ) -> Optional[BucketStorage]:
    """Return bucket storage when FILE_STORAGE=s3, otherwise None (images stay in the database)."""
    if (env.get("FILE_STORAGE") or "").strip().lower() != "s3":
        return None
    return BucketStorage(
        bucket=(env.get("S3_BUCKET") or "").strip(),
        region=(env.get("S3_REGION") or "").strip() or None,
        endpoint_url=(env.get("S3_ENDPOINT_URL") or "").strip() or None,
        public_base_url=(env.get("S3_PUBLIC_BASE_URL") or "").strip() or None,
        access_key_id=(env.get("S3_ACCESS_KEY_ID") or "").strip() or None,
        secret_access_key=(env.get("S3_SECRET_ACCESS_KEY") or "").strip() or None,
    )
