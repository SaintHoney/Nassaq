"""
NASSAQ - Database Service
Database connection and utilities (PostgreSQL via pg_dal)
"""
from pg_dal import PostgresDB
import os
from typing import Optional

_db: Optional[PostgresDB] = None


def get_database():
    """Get the database instance"""
    global _db
    
    if _db is None:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise RuntimeError("DATABASE_URL environment variable is not set")
        _db = PostgresDB(database_url)
    
    return _db


async def close_database():
    """Close database connection"""
    global _db
    if _db:
        await _db.disconnect()
        _db = None


def serialize_doc(doc: dict) -> dict:
    """Serialize a document for JSON response"""
    if doc is None:
        return None
    
    result = dict(doc)
    
    if "_id" in result:
        if "id" not in result or not result.get("id"):
            result["id"] = str(result["_id"])
        del result["_id"]
    
    return result


def serialize_docs(docs: list) -> list:
    """Serialize a list of documents"""
    return [serialize_doc(doc) for doc in docs if doc]
