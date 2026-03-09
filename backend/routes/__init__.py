"""
NASSAQ Routes Package
حزمة مسارات API لمنصة نَسَّق
"""

from routes.scheduling_routes import create_scheduling_router
from routes.attendance_routes import create_attendance_router
from routes.assessment_routes import create_assessment_router
from routes.audit_routes import create_audit_router

__all__ = [
    "create_scheduling_router",
    "create_attendance_router",
    "create_assessment_router",
    "create_audit_router",
]
