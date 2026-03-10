"""
NASSAQ - Public Routes
Public endpoints that don't require authentication
"""
from fastapi import APIRouter
from datetime import datetime, timezone


def create_public_routes(db):
    """Create public router"""
    router = APIRouter(prefix="/public", tags=["Public"])
    
    @router.get("/stats")
    async def get_public_stats():
        """Get public platform statistics for Landing Page"""
        try:
            # Try to get cached stats first
            cached_stats = await db.platform_stats.find_one({"id": "platform_stats"})
            
            if cached_stats:
                return {
                    "schools": cached_stats.get("total_schools", 0),
                    "students": cached_stats.get("total_students", 0),
                    "teachers": cached_stats.get("total_teachers", 0),
                    "parents": cached_stats.get("total_parents", 0),
                    "active_schools": cached_stats.get("active_schools", 0),
                    "last_updated": cached_stats.get("last_updated", "")
                }
            
            # Calculate from database
            total_schools = await db.schools.count_documents({})
            active_schools = await db.schools.count_documents({"status": "active"})
            total_students = await db.users.count_documents({"role": "student"})
            total_teachers = await db.users.count_documents({"role": "teacher"})
            total_parents = await db.users.count_documents({"role": "parent"})
            
            return {
                "schools": total_schools,
                "students": total_students,
                "teachers": total_teachers,
                "parents": total_parents,
                "active_schools": active_schools,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        except Exception:
            # Return default values on error
            return {
                "schools": 100,
                "students": 30000,
                "teachers": 2500,
                "parents": 60000,
                "active_schools": 95,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
    
    @router.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "NASSAQ API"
        }
    
    return router
