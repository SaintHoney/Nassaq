"""
PostgreSQL Database Abstraction Layer (DAL)
MongoDB-compatible API over PostgreSQL JSONB

Each MongoDB "collection" maps to a PostgreSQL table:
  CREATE TABLE <name> (_id TEXT PRIMARY KEY, data JSONB NOT NULL)

Usage:
  db = PostgresDB(database_url)
  await db.connect()
  doc = await db.users.find_one({"email": "admin@nassaq.com"})
  await db.users.insert_one({"_id": "u1", "email": "admin@nassaq.com", ...})
  await db.disconnect()
"""

import asyncpg
import json
import re
import uuid
import logging
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, date, timezone

logger = logging.getLogger(__name__)


def _serialize_value(v: Any) -> Any:
    if isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, date):
        return v.isoformat()
    if isinstance(v, set):
        return list(v)
    return v


def _deep_serialize(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: _deep_serialize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_deep_serialize(i) for i in obj]
    return _serialize_value(obj)


class PostgresCursor:
    def __init__(self, collection: "PostgresCollection", filter_query: dict,
                 projection: Optional[dict] = None):
        self._collection = collection
        self._filter = filter_query
        self._projection = projection
        self._sort_fields: Optional[List[Tuple[str, int]]] = None
        self._limit_val: Optional[int] = None
        self._skip_val: Optional[int] = None

    def sort(self, key_or_list, direction=None):
        if isinstance(key_or_list, str):
            self._sort_fields = [(key_or_list, direction or 1)]
        elif isinstance(key_or_list, list):
            self._sort_fields = key_or_list
        return self

    def limit(self, count: int):
        self._limit_val = count
        return self

    def skip(self, count: int):
        self._skip_val = count
        return self

    async def to_list(self, length: Optional[int] = None):
        if length is not None and self._limit_val is None:
            self._limit_val = length
        where_clause, params = self._collection._build_where(self._filter)
        order_clause = self._build_order()
        limit_clause = f" LIMIT {self._limit_val}" if self._limit_val else ""
        skip_clause = f" OFFSET {self._skip_val}" if self._skip_val else ""
        table = self._collection._table_name
        sql = f"SELECT data FROM {table}{where_clause}{order_clause}{limit_clause}{skip_clause}"
        rows = await self._collection._db._fetch(sql, params)
        results = []
        for row in rows:
            doc = json.loads(row["data"]) if isinstance(row["data"], str) else row["data"]
            doc["_id"] = doc.get("_id")
            results.append(doc)
        return results

    def _build_order(self) -> str:
        if not self._sort_fields:
            return ""
        parts = []
        for field, direction in self._sort_fields:
            if field == "_id":
                col_expr = "_id"
            else:
                col_expr = f"data->>'{field}'"
            order = "ASC" if direction == 1 else "DESC"
            parts.append(f"{col_expr} {order}")
        return " ORDER BY " + ", ".join(parts)

    def __aiter__(self):
        return self._async_iter()

    async def _async_iter(self):
        results = await self.to_list(None)
        for doc in results:
            yield doc


class PostgresCollection:
    def __init__(self, db: "PostgresDB", name: str):
        self._db = db
        self._table_name = self._sanitize_name(name)
        self._ensured = False

    @staticmethod
    def _sanitize_name(name: str) -> str:
        return re.sub(r'[^a-zA-Z0-9_]', '_', name)

    async def _ensure_table(self):
        if self._ensured:
            return
        table = self._table_name
        await self._db._execute(f"""
            CREATE TABLE IF NOT EXISTS {table} (
                _id TEXT PRIMARY KEY,
                data JSONB NOT NULL DEFAULT '{{}}'::jsonb
            )
        """)
        await self._db._execute(f"""
            CREATE INDEX IF NOT EXISTS idx_{table}_data ON {table} USING GIN (data)
        """)
        self._ensured = True

    def _generate_id(self) -> str:
        return str(uuid.uuid4())

    def _build_where(self, filter_query: dict) -> Tuple[str, list]:
        if not filter_query:
            return "", []
        conditions = []
        params = []
        self._build_conditions(filter_query, conditions, params)
        if not conditions:
            return "", []
        return " WHERE " + " AND ".join(conditions), params

    def _build_conditions(self, filter_query: dict, conditions: list, params: list):
        for key, value in filter_query.items():
            if key == "$or":
                or_parts = []
                for sub_filter in value:
                    sub_conds = []
                    self._build_conditions(sub_filter, sub_conds, params)
                    if sub_conds:
                        or_parts.append("(" + " AND ".join(sub_conds) + ")")
                if or_parts:
                    conditions.append("(" + " OR ".join(or_parts) + ")")
            elif key == "$and":
                for sub_filter in value:
                    self._build_conditions(sub_filter, conditions, params)
            elif key == "$nor":
                nor_parts = []
                for sub_filter in value:
                    sub_conds = []
                    self._build_conditions(sub_filter, sub_conds, params)
                    if sub_conds:
                        nor_parts.append("(" + " AND ".join(sub_conds) + ")")
                if nor_parts:
                    conditions.append("NOT (" + " OR ".join(nor_parts) + ")")
            elif isinstance(value, dict) and any(k.startswith("$") for k in value):
                self._build_operator_condition(key, value, conditions, params)
            else:
                if key == "_id":
                    params.append(str(value))
                    conditions.append(f"_id = ${len(params)}")
                elif value is None:
                    conditions.append(
                        f"(data->>'{key}' IS NULL OR NOT (data ? '{key}'))"
                    )
                elif isinstance(value, bool):
                    params.append(json.dumps({key: value}))
                    conditions.append(f"data @> ${len(params)}::jsonb")
                elif isinstance(value, (int, float)):
                    params.append(json.dumps({key: value}))
                    conditions.append(f"data @> ${len(params)}::jsonb")
                elif isinstance(value, list):
                    params.append(json.dumps({key: value}))
                    conditions.append(f"data @> ${len(params)}::jsonb")
                else:
                    params.append(str(value))
                    conditions.append(f"data->>'{key}' = ${len(params)}")

    def _build_operator_condition(self, key: str, ops: dict, conditions: list, params: list):
        for op, val in ops.items():
            if key == "_id":
                field_expr = "_id"
            else:
                field_expr = f"data->>'{key}'"

            if op == "$eq":
                params.append(str(val))
                conditions.append(f"{field_expr} = ${len(params)}")
            elif op == "$ne":
                if val is None:
                    conditions.append(f"(data ? '{key}' AND data->>'{key}' IS NOT NULL)")
                else:
                    params.append(str(val))
                    conditions.append(f"({field_expr} IS NULL OR {field_expr} != ${len(params)})")
            elif op in ("$gt", "$gte", "$lt", "$lte"):
                cmp_map = {"$gt": ">", "$gte": ">=", "$lt": "<", "$lte": "<="}
                cmp_op = cmp_map[op]
                if isinstance(val, (int, float)):
                    params.append(float(val))
                    conditions.append(f"({field_expr})::float {cmp_op} ${len(params)}")
                else:
                    params.append(str(val))
                    conditions.append(f"{field_expr} {cmp_op} ${len(params)}")
            elif op == "$in":
                if not val:
                    conditions.append("FALSE")
                else:
                    placeholders = []
                    for v in val:
                        params.append(str(v))
                        placeholders.append(f"${len(params)}")
                    conditions.append(f"{field_expr} IN ({', '.join(placeholders)})")
            elif op == "$nin":
                if not val:
                    pass
                else:
                    placeholders = []
                    for v in val:
                        params.append(str(v))
                        placeholders.append(f"${len(params)}")
                    conditions.append(
                        f"({field_expr} IS NULL OR {field_expr} NOT IN ({', '.join(placeholders)}))"
                    )
            elif op == "$regex":
                flags = ops.get("$options", "")
                if "i" in flags:
                    params.append(str(val))
                    conditions.append(f"{field_expr} ~* ${len(params)}")
                else:
                    params.append(str(val))
                    conditions.append(f"{field_expr} ~ ${len(params)}")
            elif op == "$exists":
                if val:
                    conditions.append(f"data ? '{key}'")
                else:
                    conditions.append(f"NOT (data ? '{key}')")
            elif op == "$size":
                conditions.append(f"jsonb_array_length(data->'{key}') = {int(val)}")
            elif op == "$options":
                pass
            elif op == "$not":
                neg_conds = []
                self._build_operator_condition(key, val, neg_conds, params)
                if neg_conds:
                    conditions.append("NOT (" + " AND ".join(neg_conds) + ")")

    def _build_update(self, update: dict, params: list) -> str:
        expr = "data"
        D = "data"

        for op, fields in update.items():
            if op == "$set":
                serialized = _deep_serialize(fields)
                params.append(json.dumps(serialized))
                expr = f"({expr} || ${len(params)}::jsonb)"
            elif op == "$unset":
                for field_name in fields:
                    expr = f"({expr} - '{field_name}')"
            elif op == "$inc":
                for field_name, inc_val in fields.items():
                    expr = (
                        f"jsonb_set({expr}, '{{{field_name}}}', "
                        f"to_jsonb(COALESCE(({expr}->>'{field_name}')::float, 0) + {float(inc_val)}))"
                    )
            elif op == "$push":
                for field_name, push_val in fields.items():
                    if isinstance(push_val, dict) and "$each" in push_val:
                        serialized = json.dumps(_deep_serialize(push_val["$each"]))
                        params.append(serialized)
                        expr = (
                            f"jsonb_set({expr}, '{{{field_name}}}', "
                            f"COALESCE({expr}->'{field_name}', '[]'::jsonb) || ${len(params)}::jsonb)"
                        )
                    else:
                        serialized = json.dumps(_deep_serialize(push_val))
                        params.append(serialized)
                        expr = (
                            f"jsonb_set({expr}, '{{{field_name}}}', "
                            f"COALESCE({expr}->'{field_name}', '[]'::jsonb) || "
                            f"jsonb_build_array(${len(params)}::jsonb))"
                        )
            elif op == "$pull":
                for field_name, pull_val in fields.items():
                    serialized = json.dumps(_deep_serialize(pull_val))
                    params.append(serialized)
                    expr = (
                        f"jsonb_set({expr}, '{{{field_name}}}', "
                        f"(SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb) "
                        f"FROM jsonb_array_elements(COALESCE({expr}->'{field_name}', '[]'::jsonb)) elem "
                        f"WHERE elem != ${len(params)}::jsonb))"
                    )
            elif op == "$addToSet":
                for field_name, add_val in fields.items():
                    if isinstance(add_val, dict) and "$each" in add_val:
                        for item in add_val["$each"]:
                            serialized = json.dumps(_deep_serialize(item))
                            params.append(serialized)
                            expr = (
                                f"jsonb_set({expr}, '{{{field_name}}}', "
                                f"CASE WHEN COALESCE({expr}->'{field_name}', '[]'::jsonb) @> "
                                f"jsonb_build_array(${len(params)}::jsonb) "
                                f"THEN {expr}->'{field_name}' "
                                f"ELSE COALESCE({expr}->'{field_name}', '[]'::jsonb) || "
                                f"jsonb_build_array(${len(params)}::jsonb) END)"
                            )
                    else:
                        serialized = json.dumps(_deep_serialize(add_val))
                        params.append(serialized)
                        expr = (
                            f"jsonb_set({expr}, '{{{field_name}}}', "
                            f"CASE WHEN COALESCE({expr}->'{field_name}', '[]'::jsonb) @> "
                            f"jsonb_build_array(${len(params)}::jsonb) "
                            f"THEN {expr}->'{field_name}' "
                            f"ELSE COALESCE({expr}->'{field_name}', '[]'::jsonb) || "
                            f"jsonb_build_array(${len(params)}::jsonb) END)"
                        )

        if expr == D:
            return ""
        return f"data = {expr}"

    async def find_one(self, filter_query: Optional[dict] = None,
                       projection: Optional[dict] = None) -> Optional[dict]:
        await self._ensure_table()
        filter_query = filter_query or {}
        where_clause, params = self._build_where(filter_query)
        sql = f"SELECT data FROM {self._table_name}{where_clause} LIMIT 1"
        rows = await self._db._fetch(sql, params)
        if not rows:
            return None
        doc = json.loads(rows[0]["data"]) if isinstance(rows[0]["data"], str) else rows[0]["data"]
        return doc

    def find(self, filter_query: Optional[dict] = None,
             projection: Optional[dict] = None) -> PostgresCursor:
        return PostgresCursor(self, filter_query or {}, projection)

    async def insert_one(self, document: dict) -> "InsertOneResult":
        await self._ensure_table()
        doc = dict(document)
        doc_id = str(doc.pop("_id", None) or self._generate_id())
        doc["_id"] = doc_id
        serialized = json.dumps(_deep_serialize(doc))
        await self._db._execute(
            f"INSERT INTO {self._table_name} (_id, data) VALUES ($1, $2::jsonb) "
            f"ON CONFLICT (_id) DO UPDATE SET data = $2::jsonb",
            [doc_id, serialized]
        )
        return InsertOneResult(doc_id)

    async def insert_many(self, documents: List[dict]) -> "InsertManyResult":
        await self._ensure_table()
        ids = []
        for doc in documents:
            result = await self.insert_one(doc)
            ids.append(result.inserted_id)
        return InsertManyResult(ids)

    async def update_one(self, filter_query: dict, update: dict,
                         upsert: bool = False) -> "UpdateResult":
        await self._ensure_table()
        where_clause, params = self._build_where(filter_query)
        update_clause = self._build_update(update, params)
        if not update_clause:
            return UpdateResult(0, 0)
        sql = f"UPDATE {self._table_name} SET {update_clause}{where_clause}"
        sql_with_limit = sql
        if where_clause:
            sql_with_limit = (
                f"UPDATE {self._table_name} SET {update_clause} "
                f"WHERE _id = (SELECT _id FROM {self._table_name}{where_clause} LIMIT 1)"
            )
        result = await self._db._execute(sql_with_limit, params)
        matched = int(result.split(" ")[-1]) if result else 0
        if matched == 0 and upsert:
            doc = {}
            for key, value in filter_query.items():
                if not key.startswith("$"):
                    doc[key] = value
            if "$set" in update:
                doc.update(update["$set"])
            if "$setOnInsert" in update:
                doc.update(update["$setOnInsert"])
            await self.insert_one(doc)
            return UpdateResult(0, 1, upserted_id=doc.get("_id"))
        return UpdateResult(matched, 0)

    async def update_many(self, filter_query: dict, update: dict,
                          upsert: bool = False) -> "UpdateResult":
        await self._ensure_table()
        where_clause, params = self._build_where(filter_query)
        update_clause = self._build_update(update, params)
        if not update_clause:
            return UpdateResult(0, 0)
        sql = f"UPDATE {self._table_name} SET {update_clause}{where_clause}"
        result = await self._db._execute(sql, params)
        matched = int(result.split(" ")[-1]) if result else 0
        return UpdateResult(matched, 0)

    async def delete_one(self, filter_query: dict) -> "DeleteResult":
        await self._ensure_table()
        where_clause, params = self._build_where(filter_query)
        sql = (
            f"DELETE FROM {self._table_name} "
            f"WHERE _id = (SELECT _id FROM {self._table_name}{where_clause} LIMIT 1)"
        )
        result = await self._db._execute(sql, params)
        deleted = int(result.split(" ")[-1]) if result else 0
        return DeleteResult(deleted)

    async def delete_many(self, filter_query: dict) -> "DeleteResult":
        await self._ensure_table()
        where_clause, params = self._build_where(filter_query)
        sql = f"DELETE FROM {self._table_name}{where_clause}"
        result = await self._db._execute(sql, params)
        deleted = int(result.split(" ")[-1]) if result else 0
        return DeleteResult(deleted)

    async def count_documents(self, filter_query: Optional[dict] = None) -> int:
        await self._ensure_table()
        filter_query = filter_query or {}
        where_clause, params = self._build_where(filter_query)
        sql = f"SELECT COUNT(*) as cnt FROM {self._table_name}{where_clause}"
        rows = await self._db._fetch(sql, params)
        return rows[0]["cnt"] if rows else 0

    async def find_one_and_update(self, filter_query: dict, update: dict,
                                  upsert: bool = False,
                                  return_document: Optional[str] = None) -> Optional[dict]:
        await self._ensure_table()
        if return_document == "after":
            await self.update_one(filter_query, update, upsert=upsert)
            merged_filter = dict(filter_query)
            if "$set" in update:
                for k, v in update["$set"].items():
                    if k in merged_filter:
                        merged_filter[k] = v
            return await self.find_one(filter_query)
        else:
            doc = await self.find_one(filter_query)
            await self.update_one(filter_query, update, upsert=upsert)
            return doc

    async def find_one_and_delete(self, filter_query: dict) -> Optional[dict]:
        await self._ensure_table()
        doc = await self.find_one(filter_query)
        if doc:
            await self.delete_one({"_id": doc["_id"]})
        return doc

    async def create_index(self, keys, **kwargs):
        pass

    async def aggregate(self, pipeline: list) -> list:
        await self._ensure_table()
        docs_cursor = self.find({})
        docs = await docs_cursor.to_list(None)

        for stage in pipeline:
            if "$match" in stage:
                match_filter = stage["$match"]
                cursor = self.find(match_filter)
                docs = await cursor.to_list(None)
            elif "$sort" in stage:
                sort_spec = stage["$sort"]
                for field, direction in reversed(list(sort_spec.items())):
                    docs.sort(key=lambda d: (d.get(field) is None, d.get(field, "")),
                              reverse=(direction == -1))
            elif "$limit" in stage:
                docs = docs[:stage["$limit"]]
            elif "$skip" in stage:
                docs = docs[stage["$skip"]:]
            elif "$group" in stage:
                group_spec = stage["$group"]
                group_id = group_spec["_id"]
                groups: Dict[Any, list] = {}
                for doc in docs:
                    if isinstance(group_id, str) and group_id.startswith("$"):
                        key = doc.get(group_id[1:])
                    elif group_id is None:
                        key = None
                    else:
                        key = group_id
                    groups.setdefault(str(key), []).append(doc)

                result_docs = []
                for gkey, gdocs in groups.items():
                    result = {"_id": gkey}
                    for field, expr in group_spec.items():
                        if field == "_id":
                            continue
                        if isinstance(expr, dict):
                            if "$sum" in expr:
                                sum_expr = expr["$sum"]
                                if isinstance(sum_expr, str) and sum_expr.startswith("$"):
                                    result[field] = sum(
                                        d.get(sum_expr[1:], 0) for d in gdocs
                                    )
                                elif sum_expr == 1:
                                    result[field] = len(gdocs)
                            elif "$first" in expr:
                                f = expr["$first"]
                                if isinstance(f, str) and f.startswith("$"):
                                    result[field] = gdocs[0].get(f[1:]) if gdocs else None
                    result_docs.append(result)
                docs = result_docs
            elif "$project" in stage:
                proj = stage["$project"]
                projected = []
                for doc in docs:
                    new_doc = {}
                    for field, spec in proj.items():
                        if spec == 1 or spec is True:
                            if field in doc:
                                new_doc[field] = doc[field]
                        elif spec == 0 or spec is False:
                            continue
                    projected.append(new_doc)
                docs = projected
        return docs

    async def distinct(self, field: str, filter_query: Optional[dict] = None) -> list:
        await self._ensure_table()
        filter_query = filter_query or {}
        where_clause, params = self._build_where(filter_query)
        sql = f"SELECT DISTINCT data->>'{field}' as val FROM {self._table_name}{where_clause}"
        rows = await self._db._fetch(sql, params)
        return [r["val"] for r in rows if r["val"] is not None]

    async def bulk_write(self, operations: list):
        await self._ensure_table()
        for op in operations:
            if hasattr(op, '_filter') and hasattr(op, '_update'):
                await self.update_one(op._filter, op._update, upsert=getattr(op, '_upsert', False))
            elif hasattr(op, '_document'):
                await self.insert_one(op._document)
            elif hasattr(op, '_filter') and hasattr(op, '_replacement'):
                doc = dict(op._replacement)
                filter_q = op._filter
                existing = await self.find_one(filter_q)
                if existing:
                    doc["_id"] = existing["_id"]
                    await self.delete_one({"_id": existing["_id"]})
                await self.insert_one(doc)

    async def drop(self):
        await self._db._execute(f"DROP TABLE IF EXISTS {self._table_name}")
        self._ensured = False


class InsertOneResult:
    def __init__(self, inserted_id: str):
        self.inserted_id = inserted_id


class InsertManyResult:
    def __init__(self, inserted_ids: List[str]):
        self.inserted_ids = inserted_ids


class UpdateResult:
    def __init__(self, matched_count: int, upserted_count: int = 0,
                 upserted_id: Optional[str] = None):
        self.matched_count = matched_count
        self.modified_count = matched_count
        self.upserted_count = upserted_count
        self.upserted_id = upserted_id


class DeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


class UpdateOne:
    def __init__(self, filter_query: dict, update: dict, upsert: bool = False):
        self._filter = filter_query
        self._update = update
        self._upsert = upsert


class InsertOne:
    def __init__(self, document: dict):
        self._document = document


class ReplaceOne:
    def __init__(self, filter_query: dict, replacement: dict, upsert: bool = False):
        self._filter = filter_query
        self._replacement = replacement
        self._upsert = upsert


class PostgresDB:
    def __init__(self, database_url: str):
        self._database_url = database_url
        self._pool: Optional[asyncpg.Pool] = None
        self._collections: Dict[str, PostgresCollection] = {}

    async def connect(self):
        if self._pool is None:
            self._pool = await asyncpg.create_pool(
                self._database_url,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            logger.info("PostgreSQL connection pool created")

    async def disconnect(self):
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("PostgreSQL connection pool closed")

    def __getattr__(self, name: str) -> PostgresCollection:
        if name.startswith("_"):
            raise AttributeError(name)
        if name not in self._collections:
            self._collections[name] = PostgresCollection(self, name)
        return self._collections[name]

    def __getitem__(self, name: str) -> PostgresCollection:
        return self.__getattr__(name)

    async def _execute(self, sql: str, params: Optional[list] = None) -> str:
        if self._pool is None:
            raise RuntimeError("Database not connected. Call await db.connect() first.")
        try:
            async with self._pool.acquire() as conn:
                result = await conn.execute(sql, *(params or []))
                return result
        except Exception as e:
            logger.error(f"SQL execute error: {e}\nSQL: {sql}\nParams: {params}")
            raise

    async def _fetch(self, sql: str, params: Optional[list] = None) -> list:
        if self._pool is None:
            raise RuntimeError("Database not connected. Call await db.connect() first.")
        try:
            async with self._pool.acquire() as conn:
                rows = await conn.fetch(sql, *(params or []))
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"SQL fetch error: {e}\nSQL: {sql}\nParams: {params}")
            raise

    async def list_collection_names(self) -> List[str]:
        rows = await self._fetch(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        )
        return [r["tablename"] for r in rows]

    async def command(self, cmd: dict) -> dict:
        if "ping" in cmd:
            await self._fetch("SELECT 1")
            return {"ok": 1}
        return {"ok": 0}
