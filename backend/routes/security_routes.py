"""
Security Center Routes - مسارات مركز الأمان
APIs for security operations: lock/unlock accounts, end sessions, force password change
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# Models
class AccountSearchRequest(BaseModel):
    """بحث عن حساب بالبريد أو رقم الهاتف"""
    search_query: str  # email or phone


class AccountSearchResult(BaseModel):
    """نتيجة البحث عن حساب"""
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_locked: bool = False


class ForcePasswordChangeRequest(BaseModel):
    """طلب فرض تغيير كلمة المرور"""
    target_type: str  # 'user', 'role', 'all'
    user_id: Optional[str] = None
    role: Optional[str] = None


class SessionActionResult(BaseModel):
    """نتيجة إجراء على الجلسات"""
    success: bool
    message: str
    affected_count: int = 0


def setup_security_routes(db, get_current_user, require_roles, UserRole):
    """Setup security routes with database and auth dependencies"""
    
    router = APIRouter(prefix="/security", tags=["Security Center"])
    
    @router.post("/search-account", response_model=List[AccountSearchResult])
    async def search_account(
        request: AccountSearchRequest,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        البحث عن حساب بالبريد الإلكتروني أو رقم الهاتف
        Search for an account by email or phone
        """
        try:
            query = request.search_query.strip()
            if not query:
                return []
            
            # Search by email or phone
            results = await db.users.find({
                "$or": [
                    {"email": {"$regex": query, "$options": "i"}},
                    {"phone": {"$regex": query, "$options": "i"}}
                ]
            }).to_list(20)
            
            return [
                AccountSearchResult(
                    id=str(user.get("id", user.get("_id", ""))),
                    email=user.get("email", ""),
                    name=user.get("name", user.get("full_name", "")),
                    phone=user.get("phone"),
                    role=user.get("role", "unknown"),
                    is_active=user.get("is_active", True),
                    is_locked=user.get("is_locked", False)
                )
                for user in results
            ]
        except Exception as e:
            print(f"Error searching accounts: {e}")
            return []
    
    @router.post("/lock-account/{user_id}")
    async def lock_account(
        user_id: str,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        قفل حساب مستخدم
        Lock a user account
        """
        try:
            result = await db.users.update_one(
                {"$or": [{"id": user_id}, {"_id": user_id}]},
                {
                    "$set": {
                        "is_locked": True,
                        "is_active": False,
                        "locked_at": datetime.now(timezone.utc).isoformat(),
                        "locked_by": current_user.get("id")
                    }
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="المستخدم غير موجود")
            
            # Log the action
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "account_locked",
                "target_user_id": user_id,
                "performed_by": current_user.get("id"),
                "performed_by_name": current_user.get("name"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": {"reason": "Manual lock by admin"}
            })
            
            return {"success": True, "message": "تم قفل الحساب بنجاح"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في قفل الحساب: {str(e)}")
    
    @router.post("/unlock-account/{user_id}")
    async def unlock_account(
        user_id: str,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        فتح حساب مستخدم
        Unlock a user account
        """
        try:
            result = await db.users.update_one(
                {"$or": [{"id": user_id}, {"_id": user_id}]},
                {
                    "$set": {
                        "is_locked": False,
                        "is_active": True,
                        "unlocked_at": datetime.now(timezone.utc).isoformat(),
                        "unlocked_by": current_user.get("id")
                    }
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="المستخدم غير موجود")
            
            # Log the action
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "account_unlocked",
                "target_user_id": user_id,
                "performed_by": current_user.get("id"),
                "performed_by_name": current_user.get("name"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            return {"success": True, "message": "تم فتح الحساب بنجاح"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في فتح الحساب: {str(e)}")
    
    @router.post("/end-all-sessions", response_model=SessionActionResult)
    async def end_all_sessions(
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        إنهاء جميع الجلسات النشطة لجميع المستخدمين
        End all active sessions for all users (system-wide)
        """
        try:
            # Delete all sessions except current admin's session
            result = await db.sessions.delete_many({
                "user_id": {"$ne": current_user.get("id")}
            })
            
            # Also invalidate all refresh tokens
            await db.refresh_tokens.delete_many({
                "user_id": {"$ne": current_user.get("id")}
            })
            
            # Log the action
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "all_sessions_terminated",
                "performed_by": current_user.get("id"),
                "performed_by_name": current_user.get("name"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": {"sessions_ended": result.deleted_count}
            })
            
            return SessionActionResult(
                success=True,
                message="تم إنهاء جميع الجلسات النشطة",
                affected_count=result.deleted_count
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في إنهاء الجلسات: {str(e)}")
    
    @router.post("/force-password-change")
    async def force_password_change(
        request: ForcePasswordChangeRequest,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        فرض تغيير كلمة المرور
        Force password change for a user, role, or all users
        """
        try:
            affected_count = 0
            
            if request.target_type == 'user' and request.user_id:
                # Single user
                result = await db.users.update_one(
                    {"$or": [{"id": request.user_id}, {"_id": request.user_id}]},
                    {
                        "$set": {
                            "must_change_password": True,
                            "password_change_required_at": datetime.now(timezone.utc).isoformat(),
                            "password_change_required_by": current_user.get("id")
                        }
                    }
                )
                affected_count = result.modified_count
                
            elif request.target_type == 'role' and request.role:
                # All users with specific role
                result = await db.users.update_many(
                    {"role": request.role},
                    {
                        "$set": {
                            "must_change_password": True,
                            "password_change_required_at": datetime.now(timezone.utc).isoformat(),
                            "password_change_required_by": current_user.get("id")
                        }
                    }
                )
                affected_count = result.modified_count
                
                # End all sessions for affected users
                await db.sessions.delete_many({"role": request.role})
                
            elif request.target_type == 'all':
                # ALL users except current admin
                result = await db.users.update_many(
                    {"id": {"$ne": current_user.get("id")}},
                    {
                        "$set": {
                            "must_change_password": True,
                            "password_change_required_at": datetime.now(timezone.utc).isoformat(),
                            "password_change_required_by": current_user.get("id")
                        }
                    }
                )
                affected_count = result.modified_count
                
                # End all sessions except admin's
                await db.sessions.delete_many({
                    "user_id": {"$ne": current_user.get("id")}
                })
            
            # Log the action
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "force_password_change",
                "target_type": request.target_type,
                "target_role": request.role,
                "target_user_id": request.user_id,
                "performed_by": current_user.get("id"),
                "performed_by_name": current_user.get("name"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": {"affected_count": affected_count}
            })
            
            return {
                "success": True,
                "message": f"تم فرض تغيير كلمة المرور على {affected_count} مستخدم",
                "affected_count": affected_count
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في فرض تغيير كلمة المرور: {str(e)}")
    
    @router.get("/roles")
    async def get_available_roles(
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        جلب قائمة الأدوار المتاحة في النظام
        Get list of available roles in the system
        """
        roles = [
            {"id": "platform_admin", "name_ar": "مدير المنصة", "name_en": "Platform Admin"},
            {"id": "school_principal", "name_ar": "مدير مدرسة", "name_en": "School Principal"},
            {"id": "teacher", "name_ar": "معلم", "name_en": "Teacher"},
            {"id": "student", "name_ar": "طالب", "name_en": "Student"},
            {"id": "parent", "name_ar": "ولي أمر", "name_en": "Parent"},
            {"id": "independent_teacher", "name_ar": "معلم مستقل", "name_en": "Independent Teacher"},
        ]
        return roles
    
    return router
