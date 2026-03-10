"""
NASSAQ Audit Routes
مسارات API لسجل التدقيق

Endpoints:
- Audit log queries
- Compliance reports
- Activity tracking
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


# ============== MODELS ==============

class AuditLogResponse(BaseModel):
    id: str
    action: str
    severity: str
    performed_by: str
    tenant_id: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: dict
    timestamp: str


class AuditStatsResponse(BaseModel):
    period_days: int
    total_events: int
    by_action: dict
    by_severity: dict
    by_entity_type: dict
    critical_count: int
    high_count: int


def create_audit_router(db, get_current_user, require_roles, UserRole):
    """Factory function to create audit router with dependencies"""
    
    router = APIRouter(prefix="/audit", tags=["Audit"])
    
    # Initialize engine
    from engines.audit_engine import AuditLogEngine
    engine = AuditLogEngine(db)
    
    # ============== AUDIT LOGS ==============
    
    def normalize_audit_log(log: dict) -> dict:
        """Normalize audit log to handle legacy data format"""
        # Handle legacy field names
        if "action_by" in log and "performed_by" not in log:
            log["performed_by"] = log.get("action_by") or log.get("actor_id") or "unknown"
        elif "actor_id" in log and "performed_by" not in log:
            log["performed_by"] = log.get("actor_id") or "unknown"
        
        # Ensure performed_by exists and is not None
        if "performed_by" not in log or log["performed_by"] is None:
            log["performed_by"] = "unknown"
        
        # Add default severity if missing
        if "severity" not in log or log["severity"] is None:
            log["severity"] = "low"
        
        # Ensure details is a dict
        if "details" not in log or log["details"] is None:
            log["details"] = {}
        
        return log
    
    @router.get("/logs", response_model=List[AuditLogResponse])
    async def get_audit_logs(
        action: Optional[str] = None,
        performed_by: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        severity: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = Query(default=100, le=500),
        skip: int = 0,
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER,
            UserRole.PLATFORM_DATA_ANALYST
        ]))
    ):
        """Get audit logs with filters"""
        tenant_id = current_user.get("tenant_id") or current_user.get("primary_tenant_id")
        
        # Platform admins see all, others see their tenant only
        if current_user.get("role") not in ["platform_admin", "platform_security_officer"]:
            if not tenant_id:
                raise HTTPException(status_code=400, detail="يجب تحديد المدرسة")
        else:
            tenant_id = None  # See all
        
        logs = await engine.get_audit_logs(
            tenant_id=tenant_id,
            action=action,
            performed_by=performed_by,
            entity_type=entity_type,
            entity_id=entity_id,
            severity=severity,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            skip=skip
        )
        
        # Normalize logs to handle legacy data format
        normalized_logs = [normalize_audit_log(log) for log in logs]
        
        return normalized_logs
    
    @router.get("/entity/{entity_type}/{entity_id}")
    async def get_entity_history(
        entity_type: str,
        entity_id: str,
        limit: int = 50,
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER,
            UserRole.SCHOOL_PRINCIPAL
        ]))
    ):
        """Get audit history for a specific entity"""
        logs = await engine.get_entity_history(
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit
        )
        
        return {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "history": logs,
            "total": len(logs)
        }
    
    @router.get("/user/{user_id}/activity")
    async def get_user_activity(
        user_id: str,
        days: int = 30,
        limit: int = 100,
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER,
            UserRole.SCHOOL_PRINCIPAL
        ]))
    ):
        """Get activity log for a specific user"""
        logs = await engine.get_user_activity(
            user_id=user_id,
            days=days,
            limit=limit
        )
        
        return {
            "user_id": user_id,
            "period_days": days,
            "activity": logs,
            "total": len(logs)
        }
    
    @router.get("/critical-events")
    async def get_critical_events(
        days: int = 7,
        limit: int = 100,
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER
        ]))
    ):
        """Get critical and high severity events"""
        tenant_id = None  # Platform level - see all
        
        if current_user.get("role") not in ["platform_admin", "platform_security_officer"]:
            tenant_id = current_user.get("tenant_id")
        
        logs = await engine.get_critical_events(
            tenant_id=tenant_id,
            days=days,
            limit=limit
        )
        
        return {
            "period_days": days,
            "critical_events": logs,
            "total": len(logs)
        }
    
    # ============== STATISTICS ==============
    
    @router.get("/stats", response_model=AuditStatsResponse)
    async def get_audit_stats(
        days: int = 30,
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER,
            UserRole.PLATFORM_DATA_ANALYST
        ]))
    ):
        """Get audit statistics"""
        tenant_id = None
        
        if current_user.get("role") not in ["platform_admin", "platform_security_officer", "platform_data_analyst"]:
            tenant_id = current_user.get("tenant_id")
        
        stats = await engine.get_audit_stats(
            tenant_id=tenant_id,
            days=days
        )
        
        return stats
    
    @router.get("/login-analytics")
    async def get_login_analytics(
        days: int = 30,
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER
        ]))
    ):
        """Get login analytics"""
        tenant_id = None
        
        if current_user.get("role") not in ["platform_admin", "platform_security_officer"]:
            tenant_id = current_user.get("tenant_id")
        
        analytics = await engine.get_login_analytics(
            tenant_id=tenant_id,
            days=days
        )
        
        return analytics
    
    # ============== COMPLIANCE ==============
    
    @router.post("/export-report")
    async def export_audit_report(
        start_date: str,
        end_date: str,
        format_type: str = "json",
        current_user: dict = Depends(require_roles([
            UserRole.PLATFORM_ADMIN,
            UserRole.PLATFORM_SECURITY_OFFICER
        ]))
    ):
        """Export audit report for compliance"""
        tenant_id = current_user.get("tenant_id")
        
        # For platform users without tenant, they can export all
        if current_user.get("role") in ["platform_admin", "platform_security_officer"]:
            if not tenant_id:
                tenant_id = "platform"  # Export platform-wide
        
        if not tenant_id:
            raise HTTPException(status_code=400, detail="يجب تحديد المدرسة")
        
        report = await engine.export_audit_report(
            tenant_id=tenant_id,
            start_date=start_date,
            end_date=end_date,
            format_type=format_type
        )
        
        return report
    
    @router.post("/cleanup")
    async def cleanup_old_logs(
        days_to_keep: int = 365,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """Cleanup old audit logs (platform admin only)"""
        deleted_count = await engine.cleanup_old_logs(days_to_keep=days_to_keep)
        
        return {
            "message": f"تم حذف {deleted_count} سجل قديم",
            "deleted_count": deleted_count
        }
    
    return router


# Export
__all__ = ["create_audit_router"]
