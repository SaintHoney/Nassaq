"""
User Roles Routes - مسارات أدوار المستخدمين
APIs for user role switching and multi-role management
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid


# Models
class RoleSwitchRequest(BaseModel):
    """طلب تبديل الدور"""
    target_role: str
    target_tenant_id: Optional[str] = None  # Required for school roles


class UserRolesResponse(BaseModel):
    """استجابة أدوار المستخدم"""
    current_role: str
    available_roles: List[dict]
    can_switch: bool


def setup_user_roles_routes(db, get_current_user, require_roles, UserRole, create_access_token):
    """Setup user roles routes with database and auth dependencies"""
    
    router = APIRouter(prefix="/user-roles", tags=["User Roles"])
    
    @router.get("/my-roles")
    async def get_my_roles(
        current_user: dict = Depends(get_current_user)
    ):
        """جلب أدوار المستخدم الحالي"""
        try:
            user_id = current_user.get("id")
            
            # Get user from database to get all roles
            user = await db.users.find_one({"id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="المستخدم غير موجود")
            
            current_role = current_user.get("role")
            
            # Get user's available roles
            # Primary role is always available
            available_roles = [{
                "role": user.get("role"),
                "role_name_ar": get_role_name_ar(user.get("role")),
                "role_name_en": get_role_name_en(user.get("role")),
                "tenant_id": user.get("tenant_id"),
                "tenant_name": user.get("school_name") or user.get("tenant_name"),
                "is_current": user.get("role") == current_role,
                "is_primary": True
            }]
            
            # Check for additional roles
            additional_roles = user.get("additional_roles", [])
            for role_info in additional_roles:
                available_roles.append({
                    "role": role_info.get("role"),
                    "role_name_ar": get_role_name_ar(role_info.get("role")),
                    "role_name_en": get_role_name_en(role_info.get("role")),
                    "tenant_id": role_info.get("tenant_id"),
                    "tenant_name": role_info.get("tenant_name"),
                    "is_current": role_info.get("role") == current_role and role_info.get("tenant_id") == current_user.get("tenant_id"),
                    "is_primary": False
                })
            
            # For platform admins, they can view as school principal
            if user.get("role") == "platform_admin":
                schools = await db.schools.find({}, {"id": 1, "name": 1}).to_list(100)
                for school in schools:
                    available_roles.append({
                        "role": "school_principal",
                        "role_name_ar": "معاينة كمدير مدرسة",
                        "role_name_en": "Preview as School Principal",
                        "tenant_id": school.get("id"),
                        "tenant_name": school.get("name"),
                        "is_current": False,
                        "is_primary": False,
                        "is_preview": True
                    })
            
            return {
                "user_id": user_id,
                "current_role": current_role,
                "current_tenant_id": current_user.get("tenant_id"),
                "available_roles": available_roles,
                "can_switch": len(available_roles) > 1
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error getting user roles: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/switch")
    async def switch_role(
        request: RoleSwitchRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """تبديل دور المستخدم"""
        try:
            user_id = current_user.get("id")
            
            # Get user from database
            user = await db.users.find_one({"id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="المستخدم غير موجود")
            
            # Validate the target role
            target_role = request.target_role
            target_tenant_id = request.target_tenant_id
            
            # Check if user has permission for this role
            is_valid_role = False
            tenant_name = None
            
            # Check primary role
            if user.get("role") == target_role:
                if target_tenant_id is None or target_tenant_id == user.get("tenant_id"):
                    is_valid_role = True
                    target_tenant_id = user.get("tenant_id")
                    tenant_name = user.get("school_name") or user.get("tenant_name")
            
            # Check additional roles
            additional_roles = user.get("additional_roles", [])
            for role_info in additional_roles:
                if role_info.get("role") == target_role:
                    if target_tenant_id is None or target_tenant_id == role_info.get("tenant_id"):
                        is_valid_role = True
                        target_tenant_id = role_info.get("tenant_id")
                        tenant_name = role_info.get("tenant_name")
                        break
            
            # Platform admins can preview as school principal
            if user.get("role") == "platform_admin" and target_role == "school_principal" and target_tenant_id:
                school = await db.schools.find_one({"id": target_tenant_id})
                if school:
                    is_valid_role = True
                    tenant_name = school.get("name")
            
            if not is_valid_role:
                raise HTTPException(status_code=403, detail="ليس لديك صلاحية لهذا الدور")
            
            # Generate new token with switched role
            token_data = {
                "sub": user_id,
                "role": target_role,
                "tenant_id": target_tenant_id,
                "original_role": user.get("role"),  # Keep track of original role
                "is_switched": True
            }
            
            new_token = create_access_token(token_data)
            
            # Log the role switch
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "role_switched",
                "user_id": user_id,
                "performed_by": user_id,
                "performed_by_name": user.get("full_name"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": {
                    "from_role": current_user.get("role"),
                    "to_role": target_role,
                    "tenant_id": target_tenant_id,
                    "tenant_name": tenant_name
                }
            })
            
            # Store switch history for the user
            await db.role_switch_history.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "from_role": current_user.get("role"),
                "to_role": target_role,
                "tenant_id": target_tenant_id,
                "tenant_name": tenant_name,
                "switched_at": datetime.now(timezone.utc).isoformat()
            })
            
            return {
                "success": True,
                "access_token": new_token,
                "token_type": "bearer",
                "role": target_role,
                "tenant_id": target_tenant_id,
                "tenant_name": tenant_name,
                "message": f"تم التبديل إلى دور {get_role_name_ar(target_role)}"
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error switching role: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/return-to-original")
    async def return_to_original_role(
        current_user: dict = Depends(get_current_user)
    ):
        """العودة للدور الأصلي"""
        try:
            user_id = current_user.get("id")
            
            # Get user from database
            user = await db.users.find_one({"id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="المستخدم غير موجود")
            
            original_role = user.get("role")
            original_tenant_id = user.get("tenant_id")
            
            # Generate new token with original role
            token_data = {
                "sub": user_id,
                "role": original_role,
                "tenant_id": original_tenant_id,
                "is_switched": False
            }
            
            new_token = create_access_token(token_data)
            
            # Log the return
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "role_returned_to_original",
                "user_id": user_id,
                "performed_by": user_id,
                "performed_by_name": user.get("full_name"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": {
                    "from_role": current_user.get("role"),
                    "to_role": original_role
                }
            })
            
            return {
                "success": True,
                "access_token": new_token,
                "token_type": "bearer",
                "role": original_role,
                "tenant_id": original_tenant_id,
                "message": "تمت العودة للدور الأصلي"
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error returning to original role: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/switch-history")
    async def get_switch_history(
        current_user: dict = Depends(get_current_user)
    ):
        """جلب سجل تبديل الأدوار"""
        try:
            user_id = current_user.get("id")
            
            history = await db.role_switch_history.find(
                {"user_id": user_id}
            ).sort("switched_at", -1).limit(20).to_list(20)
            
            return {
                "history": [
                    {
                        "id": h.get("id"),
                        "from_role": h.get("from_role"),
                        "from_role_name": get_role_name_ar(h.get("from_role")),
                        "to_role": h.get("to_role"),
                        "to_role_name": get_role_name_ar(h.get("to_role")),
                        "tenant_name": h.get("tenant_name"),
                        "switched_at": h.get("switched_at")
                    }
                    for h in history
                ]
            }
        except Exception as e:
            return {"history": []}
    
    @router.post("/impersonate")
    async def impersonate_user(
        request: Request,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """انتحال صفة مستخدم آخر (مدير المنصة فقط)"""
        try:
            body = await request.json()
            target_user_id = body.get("target_user_id")
            
            if not target_user_id:
                raise HTTPException(status_code=400, detail="يرجى تحديد المستخدم المراد الدخول بحسابه")
            
            target_user = await db.users.find_one({"id": target_user_id})
            if not target_user:
                raise HTTPException(status_code=404, detail="المستخدم غير موجود")
            
            impersonator_id = current_user.get("id")
            
            token_data = {
                "sub": target_user_id,
                "role": target_user.get("role"),
                "tenant_id": target_user.get("tenant_id"),
                "is_impersonation": True,
                "impersonator_id": impersonator_id,
                "is_switched": True,
                "original_user_id": impersonator_id,
            }
            
            new_token = create_access_token(token_data)
            
            await db.audit_logs.insert_one({
                "id": str(uuid.uuid4()),
                "action": "user_impersonated",
                "user_id": target_user_id,
                "performed_by": impersonator_id,
                "performed_by_name": current_user.get("full_name"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": {
                    "impersonator_id": impersonator_id,
                    "impersonator_name": current_user.get("full_name"),
                    "target_user_id": target_user_id,
                    "target_user_name": target_user.get("full_name", target_user.get("name")),
                    "target_role": target_user.get("role"),
                }
            })
            
            return {
                "success": True,
                "access_token": new_token,
                "token_type": "bearer",
                "role": target_user.get("role"),
                "tenant_id": target_user.get("tenant_id"),
                "user": {
                    "id": target_user_id,
                    "full_name": target_user.get("full_name", target_user.get("name")),
                    "email": target_user.get("email"),
                    "role": target_user.get("role"),
                },
                "message": f"تم الدخول كـ {target_user.get('full_name', target_user.get('name', ''))}"
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return router


def get_role_name_ar(role: str) -> str:
    """Get Arabic name for role"""
    role_names = {
        "platform_admin": "مدير المنصة",
        "platform_operations_manager": "مدير العمليات",
        "platform_technical_admin": "مسؤول تقني",
        "platform_support_specialist": "دعم فني",
        "platform_data_analyst": "محلل بيانات",
        "platform_security_officer": "مسؤول أمن",
        "school_principal": "مدير المدرسة",
        "school_sub_admin": "نائب مدير المدرسة",
        "school_admin": "مسؤول المدرسة",
        "teacher": "معلم",
        "independent_teacher": "معلم مستقل",
        "student": "طالب",
        "parent": "ولي أمر",
    }
    return role_names.get(role, role)


def get_role_name_en(role: str) -> str:
    """Get English name for role"""
    role_names = {
        "platform_admin": "Platform Admin",
        "platform_operations_manager": "Operations Manager",
        "platform_technical_admin": "Technical Admin",
        "platform_support_specialist": "Support Specialist",
        "platform_data_analyst": "Data Analyst",
        "platform_security_officer": "Security Officer",
        "school_principal": "School Principal",
        "school_sub_admin": "Deputy Principal",
        "school_admin": "School Admin",
        "teacher": "Teacher",
        "independent_teacher": "Independent Teacher",
        "student": "Student",
        "parent": "Parent",
    }
    return role_names.get(role, role)
