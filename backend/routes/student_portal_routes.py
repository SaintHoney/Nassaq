"""
NASSAQ - Student Portal Routes
مسارات بوابة الطالب
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid


def setup_student_portal_routes(db, get_current_user, require_roles, UserRole):
    """Setup student portal routes"""
    
    router = APIRouter(prefix="/student-portal", tags=["Student Portal"])
    
    # ============= DASHBOARD =============
    
    @router.get("/dashboard")
    async def get_student_dashboard(
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """لوحة تحكم الطالب"""
        student_id = current_user.get("student_id") or current_user.get("id")
        school_id = current_user.get("tenant_id")
        
        # Get student info
        student = await db.students.find_one({"id": student_id})
        if not student:
            student = await db.students.find_one({"user_id": current_user.get("id")})
        
        # Get today's schedule
        today = datetime.now().strftime("%A")
        day_map = {
            "Sunday": "الأحد", "Monday": "الاثنين", "Tuesday": "الثلاثاء",
            "Wednesday": "الأربعاء", "Thursday": "الخميس", "Friday": "الجمعة", "Saturday": "السبت"
        }
        today_ar = day_map.get(today, today)
        
        schedule_entries = []
        if student:
            schedules = await db.schedules.find({
                "school_id": school_id,
                "$or": [
                    {"grade": student.get("grade")},
                    {"class_name": student.get("class_name")}
                ]
            }).to_list(10)
            
            for schedule in schedules:
                for entry in schedule.get("entries", []):
                    if entry.get("day") == today_ar or entry.get("day") == today:
                        schedule_entries.append({
                            "period": entry.get("period"),
                            "subject": entry.get("subject"),
                            "teacher": entry.get("teacher_name"),
                            "room": entry.get("room"),
                            "start_time": entry.get("start_time"),
                            "end_time": entry.get("end_time")
                        })
        
        recent_grades = []
        ag_cursor = db.assessment_grades.find({
            "student_id": student_id
        }).sort("graded_at", -1).limit(5)
        async for grade in ag_cursor:
            assessment = await db.assessments.find_one({"id": grade.get("assessment_id")})
            subject_id = assessment.get("subject_id") if assessment else None
            subject = None
            if subject_id:
                subject = await db.subjects.find_one({"id": subject_id})
                if not subject:
                    subject = await db.official_curriculum_subjects.find_one({"id": subject_id})
            recent_grades.append({
                "subject": subject.get("name_ar", subject_id) if subject else (subject_id or "غير محدد"),
                "score": grade.get("score"),
                "max_score": grade.get("max_score"),
                "percentage": grade.get("percentage"),
                "assessment_type": assessment.get("assessment_type") if assessment else "quiz",
                "date": grade.get("graded_at", "")[:10] if grade.get("graded_at") else ""
            })
        
        # Calculate attendance stats
        total_days = await db.attendance.count_documents({"student_id": student_id})
        present_days = await db.attendance.count_documents({"student_id": student_id, "status": "present"})
        absent_days = await db.attendance.count_documents({"student_id": student_id, "status": "absent"})
        late_days = await db.attendance.count_documents({"student_id": student_id, "status": "late"})
        
        attendance_rate = (present_days / total_days * 100) if total_days > 0 else 100
        
        # Get unread notifications
        unread_notifications = await db.notifications.count_documents({
            "user_id": current_user.get("id"),
            "read_status": False
        })
        
        all_grades = await db.assessment_grades.find({"student_id": student_id}).to_list(1000)
        total_score = sum(g.get("percentage", 0) for g in all_grades)
        avg_score = total_score / len(all_grades) if all_grades else 0
        
        grade_name = None
        class_name_val = None
        if student:
            grade_id = student.get("grade_id") or student.get("grade")
            if grade_id:
                grade_doc = await db.official_curriculum_grades.find_one({"id": grade_id})
                grade_name = grade_doc.get("name_ar", grade_id) if grade_doc else grade_id
            cls_id = student.get("class_id")
            if cls_id:
                cls_doc = await db.classes.find_one({"id": cls_id})
                class_name_val = cls_doc.get("name", cls_id) if cls_doc else cls_id

        return {
            "student": {
                "id": student.get("id") if student else student_id,
                "name": student.get("full_name") if student else current_user.get("full_name"),
                "grade": grade_name,
                "class_name": class_name_val,
                "school_name": current_user.get("school_name")
            },
            "today_schedule": sorted(schedule_entries, key=lambda x: x.get("start_time", "")),
            "recent_grades": recent_grades,
            "attendance": {
                "total_days": total_days,
                "present": present_days,
                "absent": absent_days,
                "late": late_days,
                "rate": round(attendance_rate, 1)
            },
            "average_score": round(avg_score, 1),
            "unread_notifications": unread_notifications,
            "current_date": datetime.now().strftime("%Y-%m-%d"),
            "current_day": today_ar
        }
    
    # ============= GRADES =============
    
    @router.get("/grades")
    async def get_student_grades(
        subject: Optional[str] = None,
        assessment_type: Optional[str] = None,
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """درجات الطالب"""
        student_id = current_user.get("student_id") or current_user.get("id")
        
        ag_query = {"student_id": student_id}
        raw_grades = await db.assessment_grades.find(ag_query).sort("graded_at", -1).to_list(500)

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
            if assessment_type and a_type != assessment_type:
                continue
            enriched.append({
                "id": g.get("id"),
                "subject": subj_name,
                "subject_id": subj_id,
                "score": g.get("score"),
                "max_score": g.get("max_score"),
                "percentage": g.get("percentage"),
                "assessment_type": a_type,
                "title": a.get("title", ""),
                "date": g.get("graded_at", "")[:10] if g.get("graded_at") else "",
                "notes": g.get("notes")
            })

        subjects_data = {}
        for grade in enriched:
            subj = grade["subject"]
            if subj not in subjects_data:
                subjects_data[subj] = {"subject": subj, "grades": [], "total_score": 0, "total_max": 0, "count": 0}
            subjects_data[subj]["grades"].append(grade)
            subjects_data[subj]["total_score"] += grade.get("score", 0)
            subjects_data[subj]["total_max"] += grade.get("max_score", 100)
            subjects_data[subj]["count"] += 1

        for subj in subjects_data:
            data = subjects_data[subj]
            data["average"] = round((data["total_score"] / data["total_max"]) * 100, 1) if data["total_max"] > 0 else 0

        total_grades = len(enriched)
        overall_avg = sum(g.get("percentage", 0) for g in enriched) / total_grades if total_grades > 0 else 0

        return {
            "subjects": list(subjects_data.values()),
            "total_grades": total_grades,
            "overall_average": round(overall_avg, 1),
            "assessment_types": list(set(g.get("assessment_type") for g in enriched if g.get("assessment_type")))
        }
    
    # ============= ATTENDANCE =============
    
    @router.get("/attendance")
    async def get_student_attendance(
        month: Optional[int] = None,
        year: Optional[int] = None,
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """سجل حضور الطالب"""
        student_id = current_user.get("student_id") or current_user.get("id")
        
        query = {"student_id": student_id}
        
        # Filter by month/year if provided
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
            },
            "current_month": month or datetime.now().month,
            "current_year": year or datetime.now().year
        }
    
    # ============= SCHEDULE =============
    
    @router.get("/schedule")
    async def get_student_schedule(
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """الجدول الدراسي للطالب"""
        student_id = current_user.get("student_id") or current_user.get("id")
        school_id = current_user.get("tenant_id")
        
        # Get student info
        student = await db.students.find_one({"id": student_id})
        if not student:
            student = await db.students.find_one({"user_id": current_user.get("id")})
        
        if not student:
            return {"schedule": {}, "days": []}
        
        # Get schedule
        schedules = await db.schedules.find({
            "school_id": school_id,
            "$or": [
                {"grade": student.get("grade")},
                {"class_name": student.get("class_name")}
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
        
        # Sort entries by period/time
        for day in schedule_by_day:
            schedule_by_day[day] = sorted(schedule_by_day[day], key=lambda x: x.get("start_time", ""))
        
        return {
            "schedule": schedule_by_day,
            "days": days_order,
            "student_info": {
                "grade": student.get("grade"),
                "class_name": student.get("class_name")
            }
        }
    
    # ============= MESSAGES =============
    
    @router.get("/messages")
    async def get_student_messages(
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """رسائل الطالب"""
        user_id = current_user.get("id")
        
        # Get messages where student is sender or receiver
        messages = await db.messages.find({
            "$or": [
                {"sender_id": user_id},
                {"receiver_id": user_id}
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
                    "is_sent": m.get("sender_id") == user_id,
                    "read_status": m.get("read_status", False),
                    "created_at": m.get("created_at")
                }
                for m in messages
            ]
        }
    
    @router.post("/messages")
    async def send_student_message(
        receiver_id: str,
        subject: str,
        content: str,
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """إرسال رسالة من الطالب"""
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
            "sender_role": "student",
            "receiver_id": receiver_id,
            "receiver_name": receiver.get("full_name") or receiver.get("name"),
            "read_status": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.messages.insert_one(message)
        
        # Create notification for receiver
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": receiver_id,
            "notification_type": "message",
            "title": f"رسالة جديدة من {current_user.get('full_name')}",
            "message": subject,
            "read_status": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "message_id": message["id"]}
    
    # ============= TEACHERS LIST =============
    
    @router.get("/teachers")
    async def get_student_teachers(
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """قائمة معلمي الطالب"""
        student_id = current_user.get("student_id") or current_user.get("id")
        school_id = current_user.get("tenant_id")
        
        # Get student info
        student = await db.students.find_one({"id": student_id})
        if not student:
            student = await db.students.find_one({"user_id": current_user.get("id")})
        
        # Get teachers for student's grade/class
        teachers = []
        if student:
            teacher_docs = await db.teachers.find({
                "school_id": school_id,
                "$or": [
                    {"grades": {"$in": [student.get("grade")]}},
                    {"classes": {"$in": [student.get("class_name")]}}
                ]
            }).to_list(100)
            
            for t in teacher_docs:
                teachers.append({
                    "id": t.get("id"),
                    "name": t.get("full_name"),
                    "subjects": t.get("subjects", []),
                    "email": t.get("email"),
                    "profile_picture": t.get("profile_picture")
                })
        
        return {"teachers": teachers}
    
    # Setup homework routes
    setup_homework_routes(router, db, get_current_user, require_roles, UserRole)
    
    return router


# ============= TEST ACCOUNTS CREATION =============

async def create_test_student_account(db):
    """Create test student account for testing"""
    import bcrypt
    from datetime import datetime, timezone
    import uuid
    
    # Check if test student already exists
    existing = await db.users.find_one({"email": "student@nassaq.com"})
    if existing:
        return existing
    
    # Get first school
    school = await db.schools.find_one({"status": "active"})
    if not school:
        return None
    
    # Create student user
    student_user_id = str(uuid.uuid4())
    student_id = str(uuid.uuid4())
    
    password_hash = bcrypt.hashpw("Student@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user record
    user_doc = {
        "id": student_user_id,
        "email": "student@nassaq.com",
        "password_hash": password_hash,
        "full_name": "طالب تجريبي",
        "full_name_en": "Test Student",
        "role": "student",
        "tenant_id": school.get("id"),
        "phone": "0512345678",
        "is_active": True,
        "must_change_password": False,
        "student_id": student_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create student record
    student_doc = {
        "id": student_id,
        "user_id": student_user_id,
        "full_name": "طالب تجريبي",
        "full_name_en": "Test Student",
        "email": "student@nassaq.com",
        "phone": "0512345678",
        "school_id": school.get("id"),
        "school_name": school.get("name"),
        "grade": "الصف الأول",
        "class_name": "الفصل أ",
        "national_id": "1234567890",
        "birth_date": "2010-01-15",
        "gender": "male",
        "parent_phone": "0509876543",
        "parent_name": "ولي أمر تجريبي",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.students.insert_one(student_doc)
    
    # Add some test grades
    subjects = ["الرياضيات", "اللغة العربية", "العلوم", "اللغة الإنجليزية"]
    for subject in subjects:
        for i in range(3):
            grade_doc = {
                "id": str(uuid.uuid4()),
                "student_id": student_id,
                "subject": subject,
                "score": 75 + (i * 5),
                "max_score": 100,
                "percentage": 75 + (i * 5),
                "assessment_type": ["اختبار شهري", "اختبار نهائي", "واجب"][i],
                "date": f"2026-03-{10 - i}",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.grades.insert_one(grade_doc)
    
    # Add some test attendance
    for i in range(20):
        status = "present" if i < 17 else ("late" if i < 19 else "absent")
        attendance_doc = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "date": f"2026-02-{(i % 28) + 1:02d}",
            "status": status,
            "check_in_time": "07:30" if status == "present" else "08:00",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.attendance.insert_one(attendance_doc)
    
    return user_doc


async def create_test_parent_account(db):
    """Create test parent account for testing"""
    import bcrypt
    from datetime import datetime, timezone
    import uuid
    
    # Check if test parent already exists
    existing = await db.users.find_one({"email": "parent@nassaq.com"})
    if existing:
        return existing
    
    # Get test student
    test_student = await db.students.find_one({"email": "student@nassaq.com"})
    school = await db.schools.find_one({"status": "active"})
    
    if not school:
        return None
    
    # Create parent user
    parent_user_id = str(uuid.uuid4())
    parent_id = str(uuid.uuid4())
    
    password_hash = bcrypt.hashpw("Parent@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user record
    user_doc = {
        "id": parent_user_id,
        "email": "parent@nassaq.com",
        "password_hash": password_hash,
        "full_name": "ولي أمر تجريبي",
        "full_name_en": "Test Parent",
        "role": "parent",
        "tenant_id": school.get("id"),
        "phone": "0509876543",
        "is_active": True,
        "must_change_password": False,
        "parent_id": parent_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Link parent to student
    if test_student:
        await db.students.update_one(
            {"id": test_student.get("id")},
            {"$set": {
                "parent_id": parent_id,
                "parent_user_id": parent_user_id,
                "parent_phone": "0509876543",
                "parent_name": "ولي أمر تجريبي"
            }}
        )
    
    return user_doc


# ============= HOMEWORK/ASSIGNMENTS APIs =============

def setup_homework_routes(router, db, get_current_user, require_roles, UserRole):
    """Setup homework routes for students"""
    
    @router.get("/assignments")
    async def get_student_assignments(
        status: Optional[str] = None,  # pending, submitted, graded, late
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """
        الحصول على واجبات الطالب
        Get student assignments
        """
        student_id = current_user.get("student_id") or current_user.get("id")
        school_id = current_user.get("tenant_id")
        
        # Get student info for class
        student = await db.students.find_one({"id": student_id}, {"_id": 0})
        if not student:
            student = await db.students.find_one({"user_id": current_user.get("id")}, {"_id": 0})
        
        class_id = student.get("class_id") if student else None
        grade_id = student.get("grade_id") or student.get("grade") if student else None
        
        # Build query for assignments
        query = {"school_id": school_id, "is_active": True}
        
        if class_id:
            query["$or"] = [
                {"class_ids": class_id},
                {"class_id": class_id},
                {"grade_id": grade_id}
            ]
        
        # Get assignments
        assignments = await db.student_assignments.find(query, {"_id": 0}).sort("due_date", -1).to_list(100)
        
        # Get student submissions
        submissions = await db.assignment_submissions.find(
            {"student_id": student_id},
            {"_id": 0}
        ).to_list(500)
        
        submission_map = {s.get("assignment_id"): s for s in submissions}
        
        # Enrich assignments
        result = []
        now = datetime.now(timezone.utc)
        
        for a in assignments:
            assignment_id = a.get("id")
            submission = submission_map.get(assignment_id)
            
            # Determine status
            due_date_str = a.get("due_date")
            try:
                if isinstance(due_date_str, str):
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                else:
                    due_date = due_date_str
            except Exception:
                due_date = now + timedelta(days=7)
            
            if submission:
                if submission.get("grade") is not None:
                    a_status = "graded"
                else:
                    a_status = "submitted"
            elif due_date < now:
                a_status = "late"
            else:
                a_status = "pending"
            
            if status and a_status != status:
                continue
            
            # Get subject name
            subject = await db.subjects.find_one({"id": a.get("subject_id")}, {"_id": 0, "name_ar": 1})
            if not subject:
                subject = await db.reference_subjects.find_one({"id": a.get("subject_id")}, {"_id": 0, "name_ar": 1})
            
            # Get teacher name
            teacher = await db.teachers.find_one({"id": a.get("teacher_id")}, {"_id": 0, "full_name": 1, "full_name_ar": 1})
            
            result.append({
                "id": assignment_id,
                "title": a.get("title", ""),
                "description": a.get("description", ""),
                "subject_id": a.get("subject_id"),
                "subject_name": subject.get("name_ar") if subject else "",
                "teacher_id": a.get("teacher_id"),
                "teacher_name": (teacher.get("full_name") or teacher.get("full_name_ar")) if teacher else "",
                "due_date": due_date_str,
                "max_grade": a.get("max_grade", 100),
                "status": a_status,
                "grade": submission.get("grade") if submission else None,
                "feedback": submission.get("feedback") if submission else None,
                "submission_date": submission.get("submitted_at") if submission else None,
                "created_at": a.get("created_at")
            })
        
        return {
            "assignments": result,
            "total": len(result),
            "statistics": {
                "pending": len([a for a in result if a["status"] == "pending"]),
                "submitted": len([a for a in result if a["status"] == "submitted"]),
                "graded": len([a for a in result if a["status"] == "graded"]),
                "late": len([a for a in result if a["status"] == "late"])
            }
        }
    
    @router.post("/assignments/{assignment_id}/submit")
    async def submit_assignment(
        assignment_id: str,
        content: str = None,
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """
        تسليم واجب
        Submit an assignment
        """
        student_id = current_user.get("student_id") or current_user.get("id")
        
        # Check assignment exists
        assignment = await db.student_assignments.find_one({"id": assignment_id}, {"_id": 0})
        if not assignment:
            raise HTTPException(status_code=404, detail="الواجب غير موجود")
        
        # Check not already submitted
        existing = await db.assignment_submissions.find_one({
            "assignment_id": assignment_id,
            "student_id": student_id
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="تم تسليم هذا الواجب مسبقاً")
        
        # Create submission
        submission_doc = {
            "id": str(uuid.uuid4()),
            "assignment_id": assignment_id,
            "student_id": student_id,
            "content": content or "",
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "is_late": datetime.now(timezone.utc) > datetime.fromisoformat(assignment.get("due_date", "2099-12-31").replace('Z', '+00:00')),
            "grade": None,
            "feedback": None
        }
        
        await db.assignment_submissions.insert_one(submission_doc)
        
        return {
            "success": True,
            "submission_id": submission_doc["id"],
            "message_ar": "تم تسليم الواجب بنجاح",
            "message_en": "Assignment submitted successfully"
        }
    
    @router.get("/assignments/{assignment_id}")
    async def get_assignment_details(
        assignment_id: str,
        current_user: dict = Depends(require_roles([UserRole.STUDENT]))
    ):
        """تفاصيل الواجب"""
        student_id = current_user.get("student_id") or current_user.get("id")
        
        assignment = await db.student_assignments.find_one({"id": assignment_id}, {"_id": 0})
        if not assignment:
            raise HTTPException(status_code=404, detail="الواجب غير موجود")
        
        # Get submission
        submission = await db.assignment_submissions.find_one({
            "assignment_id": assignment_id,
            "student_id": student_id
        }, {"_id": 0})
        
        return {
            **assignment,
            "submission": submission
        }
    
    return router
