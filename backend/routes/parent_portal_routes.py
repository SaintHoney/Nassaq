"""
NASSAQ - Parent Portal Routes
مسارات بوابة ولي الأمر
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone
import uuid


def setup_parent_portal_routes(db, get_current_user, require_roles, UserRole):
    """Setup parent portal routes"""
    
    async def _verify_parent_child(db, current_user, child_id):
        parent_id = current_user.get("id")
        children_ids = current_user.get("children_ids", [])
        if not children_ids:
            parent_doc = await db.parents.find_one({"user_id": parent_id})
            if parent_doc:
                children_ids = parent_doc.get("student_ids", []) or parent_doc.get("children_ids", [])
        if child_id in children_ids:
            child = await db.students.find_one({"id": child_id})
            if child:
                return child
        child = await db.students.find_one({
            "id": child_id,
            "$or": [
                {"parent_id": parent_id},
                {"parent_user_id": parent_id},
                {"parent_phone": current_user.get("phone")}
            ]
        })
        if not child:
            raise HTTPException(status_code=403, detail="غير مصرح لك بالوصول لهذا الطالب")
        return child

    router = APIRouter(prefix="/parent-portal", tags=["Parent Portal"])
    
    # ============= DASHBOARD =============
    
    @router.get("/dashboard")
    async def get_parent_dashboard(
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """لوحة تحكم ولي الأمر"""
        parent_id = current_user.get("id")
        
        children_ids = current_user.get("children_ids", [])
        if not children_ids:
            parent_doc = await db.parents.find_one({"user_id": parent_id})
            if parent_doc:
                children_ids = parent_doc.get("student_ids", []) or parent_doc.get("children_ids", [])

        children = []
        if children_ids:
            for cid in children_ids:
                s = await db.students.find_one({"id": cid})
                if s:
                    children.append(s)
        if not children:
            children = await db.students.find({
                "$or": [
                    {"parent_id": parent_id},
                    {"parent_user_id": parent_id},
                    {"parent_phone": current_user.get("phone")}
                ]
            }).to_list(20)
        
        children_data = []
        for child in children:
            child_id = child.get("id")
            
            total_days = await db.attendance.count_documents({"student_id": child_id})
            present_days = await db.attendance.count_documents({"student_id": child_id, "status": "present"})
            attendance_rate = (present_days / total_days * 100) if total_days > 0 else 100
            
            recent_ag = await db.assessment_grades.find({"student_id": child_id}).sort("graded_at", -1).limit(3).to_list(3)
            recent_grades_enriched = []
            for g in recent_ag:
                a = await db.assessments.find_one({"id": g.get("assessment_id")})
                subj_id = a.get("subject_id") if a else None
                subj_doc = None
                if subj_id:
                    subj_doc = await db.subjects.find_one({"id": subj_id})
                    if not subj_doc:
                        subj_doc = await db.official_curriculum_subjects.find_one({"id": subj_id})
                recent_grades_enriched.append({
                    "subject": subj_doc.get("name_ar", subj_id) if subj_doc else (subj_id or ""),
                    "score": g.get("score"),
                    "max_score": g.get("max_score"),
                    "date": g.get("graded_at", "")[:10] if g.get("graded_at") else ""
                })
            
            all_ag = await db.assessment_grades.find({"student_id": child_id}).to_list(500)
            avg_score = sum(g.get("percentage", 0) for g in all_ag) / len(all_ag) if all_ag else 0
            
            cls = await db.classes.find_one({"id": child.get("class_id")})
            
            grade_id = child.get("grade_id") or child.get("grade")
            grade_doc = await db.official_curriculum_grades.find_one({"id": grade_id}) if grade_id else None
            grade_name = grade_doc.get("name_ar", grade_id) if grade_doc else (grade_id or "")

            children_data.append({
                "id": child_id,
                "name": child.get("full_name"),
                "grade": grade_name,
                "class_name": cls.get("name_ar", cls.get("name", "")) if cls else child.get("class_id", ""),
                "school_name": "",
                "profile_picture": child.get("profile_picture"),
                "attendance_rate": round(attendance_rate, 1),
                "average_score": round(avg_score, 1),
                "recent_grades": recent_grades_enriched
            })
        
        # Get unread notifications
        unread_notifications = await db.notifications.count_documents({
            "user_id": parent_id,
            "read_status": False
        })
        
        # Get unread messages
        unread_messages = await db.messages.count_documents({
            "receiver_id": parent_id,
            "read_status": False
        })
        
        return {
            "parent": {
                "id": parent_id,
                "name": current_user.get("full_name"),
                "email": current_user.get("email"),
                "phone": current_user.get("phone")
            },
            "children": children_data,
            "children_count": len(children_data),
            "unread_notifications": unread_notifications,
            "unread_messages": unread_messages
        }
    
    # ============= CHILD DETAILS =============
    
    @router.get("/child/{child_id}")
    async def get_child_details(
        child_id: str,
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """تفاصيل الابن"""
        child = await _verify_parent_child(db, current_user, child_id)
        
        if not child:
            raise HTTPException(status_code=403, detail="غير مصرح لك بالوصول لهذا الطالب")
        
        return {
            "id": child.get("id"),
            "name": child.get("full_name"),
            "first_name": child.get("first_name"),
            "last_name": child.get("last_name"),
            "national_id": child.get("national_id"),
            "birth_date": child.get("birth_date"),
            "gender": child.get("gender"),
            "grade": child.get("grade"),
            "class_name": child.get("class_name"),
            "school_name": child.get("school_name"),
            "profile_picture": child.get("profile_picture"),
            "health_status": child.get("health_status"),
            "notes": child.get("notes")
        }
    
    # ============= CHILD GRADES =============
    
    @router.get("/child/{child_id}/grades")
    async def get_child_grades(
        child_id: str,
        subject: Optional[str] = None,
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """درجات الابن"""
        parent_id = current_user.get("id")
        
        child = await _verify_parent_child(db, current_user, child_id)
        
        raw_grades = await db.assessment_grades.find({"student_id": child_id}).sort("graded_at", -1).to_list(500)

        enriched = []
        for g in raw_grades:
            a = await db.assessments.find_one({"id": g.get("assessment_id")})
            if not a:
                continue
            subj_id = a.get("subject_id")
            subj_doc = None
            if subj_id:
                subj_doc = await db.subjects.find_one({"id": subj_id})
                if not subj_doc:
                    subj_doc = await db.official_curriculum_subjects.find_one({"id": subj_id})
            subj_name = subj_doc.get("name_ar", subj_id) if subj_doc else (subj_id or "غير محدد")
            a_type = a.get("assessment_type", "quiz")
            if subject and subj_id != subject and subj_name != subject:
                continue
            enriched.append({
                "score": g.get("score"),
                "max_score": g.get("max_score"),
                "percentage": g.get("percentage"),
                "assessment_type": a_type,
                "date": g.get("graded_at", "")[:10] if g.get("graded_at") else "",
                "subject": subj_name
            })

        subjects_data = {}
        for grade in enriched:
            subj = grade["subject"]
            if subj not in subjects_data:
                subjects_data[subj] = {"subject": subj, "grades": [], "total_score": 0, "total_max": 0}
            subjects_data[subj]["grades"].append(grade)
            subjects_data[subj]["total_score"] += grade.get("score", 0)
            subjects_data[subj]["total_max"] += grade.get("max_score", 100)

        for subj in subjects_data:
            data = subjects_data[subj]
            data["average"] = round((data["total_score"] / data["total_max"]) * 100, 1) if data["total_max"] > 0 else 0

        total_grades = len(enriched)
        overall_avg = sum(g.get("percentage", 0) for g in enriched) / total_grades if total_grades > 0 else 0

        return {
            "child_name": child.get("full_name"),
            "subjects": list(subjects_data.values()),
            "total_grades": total_grades,
            "overall_average": round(overall_avg, 1)
        }
    
    # ============= CHILD ATTENDANCE =============
    
    @router.get("/child/{child_id}/attendance")
    async def get_child_attendance(
        child_id: str,
        month: Optional[int] = None,
        year: Optional[int] = None,
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """سجل حضور الابن"""
        child = await _verify_parent_child(db, current_user, child_id)
        
        query = {"student_id": child_id}
        
        if month and year:
            start_date = f"{year}-{month:02d}-01"
            if month == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month + 1:02d}-01"
            query["date"] = {"$gte": start_date, "$lt": end_date}
        
        records = await db.attendance.find(query).sort("date", -1).to_list(500)
        
        # Statistics
        total = len(records)
        present = sum(1 for r in records if r.get("status") == "present")
        absent = sum(1 for r in records if r.get("status") == "absent")
        late = sum(1 for r in records if r.get("status") == "late")
        excused = sum(1 for r in records if r.get("status") == "excused")
        
        attendance_rate = (present / total * 100) if total > 0 else 100
        
        return {
            "child_name": child.get("full_name"),
            "records": [
                {
                    "date": r.get("date"),
                    "status": r.get("status"),
                    "check_in_time": r.get("check_in_time"),
                    "check_out_time": r.get("check_out_time"),
                    "notes": r.get("notes")
                }
                for r in records
            ],
            "statistics": {
                "total_days": total,
                "present": present,
                "absent": absent,
                "late": late,
                "excused": excused,
                "attendance_rate": round(attendance_rate, 1)
            }
        }
    
    # ============= CHILD SCHEDULE =============
    
    @router.get("/child/{child_id}/schedule")
    async def get_child_schedule(
        child_id: str,
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """الجدول الدراسي للابن"""
        child = await _verify_parent_child(db, current_user, child_id)
        
        school_id = child.get("school_id")
        
        # Get schedule
        schedules = await db.schedules.find({
            "school_id": school_id,
            "$or": [
                {"grade": child.get("grade")},
                {"class_name": child.get("class_name")}
            ]
        }).to_list(10)
        
        # Organize by day
        days_order = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"]
        schedule_by_day = {day: [] for day in days_order}
        
        for schedule in schedules:
            for entry in schedule.get("entries", []):
                day = entry.get("day")
                if day in schedule_by_day:
                    schedule_by_day[day].append({
                        "period": entry.get("period"),
                        "subject": entry.get("subject"),
                        "teacher": entry.get("teacher_name"),
                        "room": entry.get("room"),
                        "start_time": entry.get("start_time"),
                        "end_time": entry.get("end_time")
                    })
        
        # Sort entries
        for day in schedule_by_day:
            schedule_by_day[day] = sorted(schedule_by_day[day], key=lambda x: x.get("start_time", ""))
        
        return {
            "child_name": child.get("full_name"),
            "grade": child.get("grade"),
            "class_name": child.get("class_name"),
            "schedule": schedule_by_day,
            "days": days_order
        }
    
    # ============= MESSAGES =============
    
    @router.get("/messages")
    async def get_parent_messages(
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """رسائل ولي الأمر"""
        parent_id = current_user.get("id")
        
        messages = await db.messages.find({
            "$or": [
                {"sender_id": parent_id},
                {"receiver_id": parent_id}
            ]
        }).sort("created_at", -1).limit(50).to_list(50)
        
        return {
            "messages": [
                {
                    "id": m.get("id"),
                    "subject": m.get("subject"),
                    "content": m.get("content"),
                    "sender_id": m.get("sender_id"),
                    "sender_name": m.get("sender_name"),
                    "receiver_id": m.get("receiver_id"),
                    "receiver_name": m.get("receiver_name"),
                    "is_sent": m.get("sender_id") == parent_id,
                    "read_status": m.get("read_status", False),
                    "created_at": m.get("created_at")
                }
                for m in messages
            ]
        }
    
    @router.post("/messages")
    async def send_parent_message(
        receiver_id: str,
        subject: str,
        content: str,
        child_id: Optional[str] = None,
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """إرسال رسالة من ولي الأمر"""
        # Get receiver info
        receiver = await db.users.find_one({"id": receiver_id})
        if not receiver:
            receiver = await db.teachers.find_one({"id": receiver_id})
        
        if not receiver:
            raise HTTPException(status_code=404, detail="المستلم غير موجود")
        
        message = {
            "id": str(uuid.uuid4()),
            "subject": subject,
            "content": content,
            "sender_id": current_user.get("id"),
            "sender_name": current_user.get("full_name"),
            "sender_role": "parent",
            "receiver_id": receiver_id,
            "receiver_name": receiver.get("full_name") or receiver.get("name"),
            "child_id": child_id,
            "read_status": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.messages.insert_one(message)
        
        # Create notification
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": receiver_id,
            "notification_type": "message",
            "title": f"رسالة جديدة من ولي أمر: {current_user.get('full_name')}",
            "message": subject,
            "read_status": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "message_id": message["id"]}
    
    # ============= CHILD TEACHERS =============
    
    @router.get("/child/{child_id}/teachers")
    async def get_child_teachers(
        child_id: str,
        current_user: dict = Depends(require_roles([UserRole.PARENT]))
    ):
        """معلمي الابن"""
        child = await _verify_parent_child(db, current_user, child_id)
        
        school_id = child.get("school_id")
        
        # Get teachers
        teachers = await db.teachers.find({
            "school_id": school_id,
            "$or": [
                {"grades": {"$in": [child.get("grade")]}},
                {"classes": {"$in": [child.get("class_name")]}}
            ]
        }).to_list(100)
        
        return {
            "child_name": child.get("full_name"),
            "teachers": [
                {
                    "id": t.get("id"),
                    "name": t.get("full_name"),
                    "subjects": t.get("subjects", []),
                    "email": t.get("email"),
                    "profile_picture": t.get("profile_picture")
                }
                for t in teachers
            ]
        }
    
    return router
