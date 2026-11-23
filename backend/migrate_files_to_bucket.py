"""One-time move of uploaded images from the database into bucket storage.

Usage (from the backend folder, with DATABASE_URL and the FILE_STORAGE / S3_* settings set):
    python migrate_files_to_bucket.py           # preview only: lists what would move
    python migrate_files_to_bucket.py --apply   # copy each image to the bucket, then drop its copy in the database

Image URLs (/api/files/...) do not change, so the website keeps working during and after the move.
Each image is uploaded and read back before its database copy is removed.
"""
import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from file_storage import storage_from_env
from postgres import Database

# DATABASE_URL comes from the project's ignored .env.local. Bucket settings come from the shell;
# with no S3_ACCESS_KEY_ID set, the bucket is reached with your own `aws login` sign-in.
load_dotenv(Path(__file__).resolve().parents[1] / ".env.local", override=False)


async def migrate(apply: bool) -> None:
    storage = storage_from_env()
    if storage is None:
        sys.exit("Set FILE_STORAGE=s3 and the S3_* settings first (see file_storage.py).")
    db = Database(os.environ["DATABASE_URL"])
    records = await db.files.find({"is_deleted": False}, {"_id": 0}).to_list(100000)
    pending = [r for r in records if r.get("data")]
    total = sum(r.get("size", 0) for r in pending)
    print(f"{len(pending)} image(s), {total / 1024 / 1024:.1f} MB to move to bucket '{storage.bucket}'.")
    if not apply:
        for r in pending:
            print("  would move", r["storage_path"])
        print("Preview only. Run again with --apply to move them.")
        return
    moved = 0
    for r in pending:
        data = base64.b64decode(r["data"])
        await storage.put(r["storage_path"], data, r["content_type"])
        if await storage.get(r["storage_path"]) != data:
            print("  FAILED check, kept in database:", r["storage_path"])
            continue
        await db.files.update_one({"id": r["id"]}, {"$set": {"location": "bucket"}, "$unset": {"data": ""}})
        moved += 1
        print("  moved", r["storage_path"])
    print(f"Done: {moved} of {len(pending)} moved.")


if __name__ == "__main__":
    if sys.platform == "win32":  # psycopg's async mode cannot use Windows' default event loop
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(migrate("--apply" in sys.argv))
