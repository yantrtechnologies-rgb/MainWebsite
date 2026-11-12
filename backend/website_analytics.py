from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Request
from psycopg.types.json import Jsonb
from pydantic import BaseModel


class PageView(BaseModel):
    path: Literal["/", "/digital-marketing", "/it-products", "/it-training", "/work", "/about", "/contact"]


def create_analytics_router(db, require_admin, rate_limit):
    router = APIRouter(prefix="/api")

    @router.post("/analytics/page-view", status_code=204)
    async def record_view(payload: PageView, request: Request):
        rate_limit(request)
        day = datetime.now(timezone.utc).date().isoformat()
        document = {"id": f"{day}:{payload.path}", "day": day, "path": payload.path, "views": 1}
        async with db.connect() as conn:
            await conn.execute("""
                INSERT INTO xolnet_documents (collection, document)
                VALUES ('website_views', %s)
                ON CONFLICT (collection, (document->>'id')) DO UPDATE
                SET document = jsonb_set(xolnet_documents.document, '{views}',
                    to_jsonb((xolnet_documents.document->>'views')::bigint + 1))
            """, [Jsonb(document)])

    @router.get("/admin/analytics", dependencies=[Depends(require_admin)])
    async def website_analytics():
        start = (datetime.now(timezone.utc).date() - timedelta(days=29)).isoformat()
        async with db.connect() as conn:
            rows = await (await conn.execute("""
                SELECT document->>'path', sum((document->>'views')::bigint)
                FROM xolnet_documents
                WHERE collection = 'website_views' AND document->>'id' >= %s
                GROUP BY 1 ORDER BY 2 DESC, 1
            """, [start])).fetchall()
        return {"days": 30, "views": sum(count for _, count in rows),
                "pages": [{"path": path, "views": count} for path, count in rows]}

    return router
