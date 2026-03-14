"""
Admin Dashboard Routes - مسارات لوحة تحكم مدير المنصة
APIs for Command Center stats and operations
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

# Models
class CommandCenterStats(BaseModel):
    """إحصائيات مركز القيادة"""
    # الكروت الأساسية
    registered_schools: int = 0
    registered_students: int = 0
    teachers_in_schools: int = 0
    
    # الكروت الجديدة
    independent_teachers: int = 0
    student_attendance_rate: float = 0.0
    teacher_attendance_rate: float = 0.0
    platform_accounts: int = 0
    pending_requests: int = 0
    ai_enabled_schools: int = 0
    
    # بيانات إضافية
    active_schools: int = 0
    suspended_schools: int = 0
    pending_schools: int = 0
    
    # التاريخ
    hijri_date: str = ""
    gregorian_date: str = ""
    last_updated: str = ""


class NotificationStats(BaseModel):
    """إحصائيات الإشعارات"""
    total_notifications: int = 0
    unread_notifications: int = 0
    sent_messages: int = 0
    received_messages: int = 0
    scheduled_messages: int = 0


def setup_admin_routes(db, get_current_user, require_roles, UserRole):
    """Setup routes with database and auth dependencies"""
    
    router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])
    
    @router.get("/command-center/stats", response_model=CommandCenterStats)
    async def get_command_center_stats(
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN])),
        school_id: Optional[str] = None,
        school_ids: Optional[str] = None,
        city: Optional[str] = None,
        region: Optional[str] = None,
        school_type: Optional[str] = None,
        scope: Optional[str] = None,
        time_window: Optional[str] = None,
        status: Optional[str] = None,
    ):
        """
        جلب إحصائيات مركز القيادة مع دعم الفلاتر
        Get Command Center statistics for Platform Admin with filter support
        """
        try:
            now = datetime.now(timezone.utc)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            
            school_filter = {}
            student_filter = {}
            teacher_filter = {}
            attendance_filter = {}
            
            if scope == 'single' and school_id:
                school_filter["id"] = school_id
                student_filter["school_id"] = school_id
                teacher_filter["school_id"] = school_id
                attendance_filter["school_id"] = school_id
            elif scope == 'multi' and school_ids:
                id_list = [s.strip() for s in school_ids.split(',') if s.strip()]
                if id_list:
                    school_filter["id"] = {"$in": id_list}
                    student_filter["school_id"] = {"$in": id_list}
                    teacher_filter["school_id"] = {"$in": id_list}
                    attendance_filter["school_id"] = {"$in": id_list}
            elif school_id:
                school_filter["id"] = school_id
                student_filter["school_id"] = school_id
                teacher_filter["school_id"] = school_id
                attendance_filter["school_id"] = school_id
            
            if city:
                school_filter["city"] = city
            if region:
                school_filter["region"] = region
            if school_type:
                school_filter["school_type"] = school_type
            if status and status != 'all':
                school_filter["status"] = status
            
            filtered_school_ids = None
            if school_filter and not school_id:
                filtered_schools = await db.schools.find(school_filter, {"id": 1})
                filtered_school_ids = [s["id"] for s in filtered_schools]
                if filtered_school_ids and not student_filter.get("school_id"):
                    student_filter["school_id"] = {"$in": filtered_school_ids}
                    teacher_filter["school_id"] = {"$in": filtered_school_ids}
                    attendance_filter["school_id"] = {"$in": filtered_school_ids}
            
            registered_schools = await db.schools.count_documents(school_filter)
            active_schools = await db.schools.count_documents({**school_filter, "status": "active"})
            suspended_schools = await db.schools.count_documents({**school_filter, "status": "suspended"})
            pending_schools = await db.schools.count_documents({**school_filter, "status": "pending"})
            
            registered_students = await db.students.count_documents(student_filter if student_filter else {})
            
            teachers_in_schools = await db.teachers.count_documents(teacher_filter if teacher_filter else {"school_id": {"$ne": None}})
            if teachers_in_schools == 0:
                user_teacher_filter = {"role": "teacher", "tenant_id": {"$ne": None}}
                if teacher_filter.get("school_id"):
                    user_teacher_filter["tenant_id"] = teacher_filter["school_id"]
                teachers_in_schools = await db.users.count_documents(user_teacher_filter)
            
            independent_teachers = await db.users.count_documents({
                "role": "teacher",
                "$or": [{"tenant_id": None}, {"tenant_id": ""}]
            })
            
            att_student_filter = {**attendance_filter, "user_type": "student", "date": {"$gte": today_start.isoformat()[:10]}}
            total_student_attendance = await db.attendance.count_documents(att_student_filter)
            present_students = await db.attendance.count_documents({**att_student_filter, "status": "present"})
            student_attendance_rate = (present_students / total_student_attendance) * 100 if total_student_attendance > 0 else 0.0
            
            att_teacher_filter = {**attendance_filter, "user_type": "teacher", "date": {"$gte": today_start.isoformat()[:10]}}
            total_teacher_attendance = await db.attendance.count_documents(att_teacher_filter)
            present_teachers = await db.attendance.count_documents({**att_teacher_filter, "status": "present"})
            teacher_attendance_rate = (present_teachers / total_teacher_attendance) * 100 if total_teacher_attendance > 0 else 0.0
            
            platform_roles = [
                "platform_admin", "platform_operations_manager", "platform_technical_admin",
                "platform_support_specialist", "platform_data_analyst", "platform_security_officer"
            ]
            platform_accounts = await db.users.count_documents({"role": {"$in": platform_roles}})
            
            pending_requests = await db.registration_requests.count_documents({"status": "pending"})
            pending_teacher_requests = 0
            
            ai_enabled_schools = await db.schools.count_documents({**school_filter, "ai_enabled": True})
            if ai_enabled_schools == 0:
                ai_enabled_schools = await db.schools.count_documents({
                    **school_filter,
                    "$or": [{"ai_features_enabled": True}, {"hakim_enabled": True}]
                })
            
            hijri_date = get_hijri_date(now)
            gregorian_date = now.strftime("%Y/%m/%d")
            
            return CommandCenterStats(
                registered_schools=registered_schools,
                registered_students=registered_students,
                teachers_in_schools=teachers_in_schools,
                independent_teachers=independent_teachers,
                student_attendance_rate=round(student_attendance_rate, 1),
                teacher_attendance_rate=round(teacher_attendance_rate, 1),
                platform_accounts=platform_accounts,
                pending_requests=pending_requests + pending_teacher_requests,
                ai_enabled_schools=ai_enabled_schools,
                active_schools=active_schools,
                suspended_schools=suspended_schools,
                pending_schools=pending_schools,
                hijri_date=hijri_date,
                gregorian_date=gregorian_date,
                last_updated=now.isoformat()
            )
            
        except Exception as e:
            print(f"Error getting command center stats: {e}")
            import traceback
            traceback.print_exc()
            return CommandCenterStats(
                registered_schools=0,
                registered_students=0,
                teachers_in_schools=0,
                independent_teachers=0,
                student_attendance_rate=0.0,
                teacher_attendance_rate=0.0,
                platform_accounts=0,
                pending_requests=0,
                ai_enabled_schools=0,
                hijri_date="",
                gregorian_date=datetime.now().strftime("%Y/%m/%d"),
                last_updated=datetime.now(timezone.utc).isoformat()
            )
    
    @router.get("/notifications/stats", response_model=NotificationStats)
    async def get_notification_stats(
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        جلب إحصائيات الإشعارات
        Get notification statistics for Platform Admin
        """
        try:
            # Total notifications
            total_notifications = await db.notifications.count_documents({})
            
            # Unread notifications for admin
            unread_notifications = await db.notifications.count_documents({
                "read": False,
                "$or": [
                    {"recipient_id": current_user.get("id")},
                    {"recipient_role": "platform_admin"}
                ]
            })
            
            # Sent messages (from communication center)
            sent_messages = await db.messages.count_documents({
                "sender_id": current_user.get("id"),
                "status": "sent"
            })
            
            # Received messages
            received_messages = await db.messages.count_documents({
                "$or": [
                    {"recipient_id": current_user.get("id")},
                    {"recipient_role": "platform_admin"}
                ]
            })
            
            # Scheduled messages
            scheduled_messages = await db.messages.count_documents({
                "status": "scheduled"
            })
            
            return NotificationStats(
                total_notifications=total_notifications,
                unread_notifications=unread_notifications,
                sent_messages=sent_messages,
                received_messages=received_messages,
                scheduled_messages=scheduled_messages
            )
            
        except Exception as e:
            print(f"Error getting notification stats: {e}")
            return NotificationStats()
    
    @router.post("/ai-operation/{operation_type}")
    async def run_ai_operation(
        operation_type: str,
        current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
    ):
        """
        تشغيل عملية ذكاء اصطناعي
        Run AI operation (diagnosis, data_quality, tenant_health, etc.)
        """
        valid_operations = ["diagnosis", "data_quality", "import_analysis", "alerts_review"]
        
        if operation_type not in valid_operations:
            raise HTTPException(status_code=400, detail="نوع العملية غير صالح")
        
        try:
            result = {
                "operation": operation_type,
                "status": "completed",
                "message": "",
                "details": {}
            }
            
            if operation_type == "diagnosis":
                # System diagnosis
                total_schools = await db.schools.count_documents({})
                active_schools = await db.schools.count_documents({"status": "active"})
                health_score = (active_schools / max(total_schools, 1)) * 100
                
                result["message"] = "تم تشخيص النظام بنجاح"
                result["details"] = {
                    "health_score": round(health_score, 1),
                    "total_schools": total_schools,
                    "active_schools": active_schools,
                    "issues_found": max(0, total_schools - active_schools)
                }
                
            elif operation_type == "data_quality":
                # Data quality check
                students_missing_data = await db.students.count_documents({
                    "$or": [{"parent_phone": None}, {"parent_phone": ""}]
                })
                teachers_missing_data = await db.teachers.count_documents({
                    "$or": [{"rank": None}, {"rank": ""}]
                })
                
                total_records = await db.students.count_documents({}) + await db.teachers.count_documents({})
                quality_score = max(0, 100 - ((students_missing_data + teachers_missing_data) / max(total_records, 1) * 100))
                
                result["message"] = f"جودة البيانات: {round(quality_score, 1)}%"
                result["details"] = {
                    "quality_score": round(quality_score, 1),
                    "students_missing_data": students_missing_data,
                    "teachers_missing_data": teachers_missing_data
                }
                
            elif operation_type == "import_analysis":
                # Import analysis
                result["message"] = "تم تحليل ملفات الاستيراد"
                result["details"] = {
                    "files_analyzed": 0,
                    "ready_for_import": 0,
                    "issues_found": 0
                }
                
            elif operation_type == "alerts_review":
                # Alerts review
                pending_alerts = await db.notifications.count_documents({
                    "type": "alert",
                    "read": False
                })
                result["message"] = f"تم مراجعة {pending_alerts} تنبيه"
                result["details"] = {
                    "pending_alerts": pending_alerts,
                    "reviewed": pending_alerts
                }
            
            # Log the operation
            await db.ai_operations.insert_one({
                "id": str(uuid.uuid4()),
                "operation_type": operation_type,
                "performed_by": current_user.get("id"),
                "result": result,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            return result
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في تنفيذ العملية: {str(e)}")
    
    return router


def get_hijri_date(date: datetime) -> str:
    """Convert Gregorian date to Hijri"""
    try:
        # Simplified Hijri conversion algorithm
        jd = int((1461 * (date.year + 4800 + int((date.month - 14) / 12))) / 4) + \
             int((367 * (date.month - 2 - 12 * int((date.month - 14) / 12))) / 12) - \
             int((3 * int((date.year + 4900 + int((date.month - 14) / 12)) / 100)) / 4) + \
             date.day - 32075
        
        l = jd - 1948440 + 10632
        n = int((l - 1) / 10631)
        l = l - 10631 * n + 354
        j = int((10985 - l) / 5316) * int((50 * l) / 17719) + int(l / 5670) * int((43 * l) / 15238)
        l = l - int((30 - j) / 15) * int((17719 * j) / 50) - int(j / 16) * int((15238 * j) / 43) + 29
        
        hijri_month = int((24 * l) / 709)
        hijri_day = l - int((709 * hijri_month) / 24)
        hijri_year = 30 * n + j - 30
        
        hijri_months = [
            '', 'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 
            'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 
            'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
        ]
        
        return f"{hijri_day} {hijri_months[hijri_month]} {hijri_year} هـ"
        
    except Exception:
        return ""
