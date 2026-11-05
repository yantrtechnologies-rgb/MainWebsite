"""Postgres JSONB persistence for the application's document collections."""
import asyncio
import json
from contextlib import asynccontextmanager
from types import SimpleNamespace
import psycopg
from psycopg.types.json import Jsonb


def where(query):
    clauses, params = [], []
    for key, value in query.items():
        if key == "$or":
            parts = [where(item) for item in value]
            clauses.append("(" + " OR ".join(p[0] for p in parts) + ")")
            params.extend(v for p in parts for v in p[1])
        elif isinstance(value, dict) and "$regex" in value:
            clauses.append("(document ->> %s) ~* %s")
            params.extend([key, value["$regex"]])
        else:
            clauses.append("document @> %s")
            params.append(Jsonb({key: value}))
    return " AND ".join(clauses) or "TRUE", params


def project(doc, projection):
    if not projection:
        return doc
    included = [k for k, v in projection.items() if v and k != "_id"]
    return {k: v for k, v in doc.items() if (k in included if included else projection.get(k, 1))}


class Cursor:
    def __init__(self, collection, query, projection):
        self.collection, self.query, self.projection = collection, query, projection
        self.order = []

    def sort(self, key, direction=1):
        self.order = key if isinstance(key, list) else [(key, direction)]
        return self

    async def to_list(self, length):
        condition, params = where(self.query)
        sql = "SELECT document FROM xolnet_documents WHERE collection = %s AND " + condition
        if self.order:
            sql += " ORDER BY " + ", ".join("document ->> %s " + ("DESC" if d < 0 else "ASC") for _, d in self.order)
            params.extend(k for k, _ in self.order)
        sql += " LIMIT %s"
        async with self.collection.db.connect() as conn:
            rows = await (await conn.execute(sql, [self.collection.name, *params, length])).fetchall()
        return [project(row[0], self.projection) for row in rows]


class Collection:
    def __init__(self, db, name):
        self.db, self.name = db, name

    async def create_index(self, *args, **kwargs):
        async with self.db.connect():
            pass

    def find(self, query, projection=None):
        return Cursor(self, query, projection)

    async def find_one(self, query, projection=None):
        rows = await self.find(query, projection).to_list(1)
        return rows[0] if rows else None

    async def count_documents(self, query):
        condition, params = where(query)
        async with self.db.connect() as conn:
            return (await (await conn.execute("SELECT count(*) FROM xolnet_documents WHERE collection=%s AND " + condition, [self.name, *params])).fetchone())[0]

    async def insert_one(self, doc):
        async with self.db.connect() as conn:
            await conn.execute("INSERT INTO xolnet_documents (collection, document) VALUES (%s,%s)", [self.name, Jsonb(doc)])

    async def insert_many(self, docs):
        async with self.db.connect() as conn:
            async with conn.cursor() as cursor:
                await cursor.executemany("INSERT INTO xolnet_documents (collection, document) VALUES (%s,%s)", [(self.name, Jsonb(doc)) for doc in docs])

    async def find_one_and_update(self, query, update, projection=None, return_document=True):
        condition, params = where(query)
        async with self.db.connect() as conn:
            row = await (await conn.execute("SELECT row_id,document FROM xolnet_documents WHERE collection=%s AND " + condition + " LIMIT 1 FOR UPDATE", [self.name, *params])).fetchone()
            if row is None:
                return None
            doc = row[1]
            doc.update(update.get("$set", {}))
            for key, value in update.get("$push", {}).items():
                doc.setdefault(key, []).append(value)
            await conn.execute("UPDATE xolnet_documents SET document=%s WHERE row_id=%s", [Jsonb(doc), row[0]])
            return project(doc, projection)

    async def update_one(self, query, update):
        doc = await self.find_one_and_update(query, update)
        return SimpleNamespace(matched_count=int(doc is not None))

    async def delete_one(self, query):
        condition, params = where(query)
        async with self.db.connect() as conn:
            result = await conn.execute("DELETE FROM xolnet_documents WHERE row_id IN (SELECT row_id FROM xolnet_documents WHERE collection=%s AND " + condition + " LIMIT 1)", [self.name, *params])
            return SimpleNamespace(deleted_count=result.rowcount)


class Database:
    def __init__(self, url):
        self.url = url
        self.ready = False
        self.lock = asyncio.Lock()

    def __getitem__(self, name):
        return Collection(self, name)

    def __getattr__(self, name):
        return self[name]

    @asynccontextmanager
    async def connect(self):
        async with await psycopg.AsyncConnection.connect(self.url) as conn:
            if not self.ready:
                async with self.lock:
                    if not self.ready:
                        await conn.execute("CREATE TABLE IF NOT EXISTS xolnet_documents (row_id BIGSERIAL PRIMARY KEY, collection TEXT NOT NULL, document JSONB NOT NULL)")
                        await conn.execute("CREATE INDEX IF NOT EXISTS xolnet_collection ON xolnet_documents(collection)")
                        await conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS xolnet_document_id ON xolnet_documents(collection, (document->>'id'))")
                        await conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS xolnet_user_email ON xolnet_documents((document->>'email')) WHERE collection='users'")
                        await conn.commit()
                        self.ready = True
            yield conn
