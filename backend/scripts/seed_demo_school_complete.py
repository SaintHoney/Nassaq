#!/usr/bin/env python3
"""
سكريبت إنشاء بيانات تجريبية كاملة للمدرسة التجريبية
Complete Demo Data for NASSAQ Demo School
"""

import asyncio
import sys
import os
import random
import uuid
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

DEMO_SCHOOL_ID = "demo-school-001"

# Sample Data
MALE_NAMES = ["أحمد", "محمد", "خالد", "عمر", "سعود", "فيصل", "ناصر", "سلطان", "عبدالرحمن", "يوسف", "إبراهيم", "علي", "حسن", "سعد", "مشاري", "بندر", "طلال", "ماجد", "راشد", "سالم"]
FEMALE_NAMES = ["فاطمة", "نورة", "سارة", "مريم", "هند", "لمياء", "ريم", "دانة", "جود", "لين", "ندى", "هيا", "العنود", "منيرة", "أمل", "رنا", "شيماء", "وفاء", "هدى", "سمر"]
LAST_NAMES = ["العمري", "الفهد", "السعيد", "الشمري", "القحطاني", "الدوسري", "الحربي", "المطيري", "العتيبي", "الزهراني", "الغامدي", "البلوي", "الشهري", "العسيري", "الحازمي"]

SUBJECTS = [
    {"name": "الرياضيات", "name_en": "Mathematics", "code": "MATH"},
    {"name": "اللغة العربية", "name_en": "Arabic Language", "code": "ARB"},
    {"name": "اللغة الإنجليزية", "name_en": "English Language", "code": "ENG"},
    {"name": "العلوم", "name_en": "Science", "code": "SCI"},
    {"name": "الدراسات الاجتماعية", "name_en": "Social Studies", "code": "SOC"},
    {"name": "التربية الإسلامية", "name_en": "Islamic Studies", "code": "ISL"},
    {"name": "الحاسب الآلي", "name_en": "Computer Science", "code": "CS"},
    {"name": "التربية البدنية", "name_en": "Physical Education", "code": "PE"},
]

GRADES = [
    {"name": "الصف الأول", "name_en": "Grade 1", "order": 1},
    {"name": "الصف الثاني", "name_en": "Grade 2", "order": 2},
    {"name": "الصف الثالث", "name_en": "Grade 3", "order": 3},
    {"name": "الصف الرابع", "name_en": "Grade 4", "order": 4},
    {"name": "الصف الخامس", "name_en": "Grade 5", "order": 5},
    {"name": "الصف السادس", "name_en": "Grade 6", "order": 6},
]

DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


async def main():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print("=" * 60)
    print("🚀 بدء إنشاء البيانات التجريبية الكاملة للمدرسة التجريبية")
    print("=" * 60)
    print(f"🔗 الاتصال: {mongo_url}")
    print(f"📁 قاعدة البيانات: {db_name}")
    print(f"🏫 المدرسة: {DEMO_SCHOOL_ID}")
    print()
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Update Demo School
        print("=" * 50)
        print("🏫 تحديث بيانات المدرسة التجريبية")
        print("=" * 50)
        
        await db.schools.update_one(
            {"id": DEMO_SCHOOL_ID},
            {"$set": {
                "name": "مدرسة نَسَّق التجريبية",
                "name_en": "NASSAQ Demo School",
                "current_students": 300,
                "current_teachers": 25,
                "student_capacity": 500,
                "updated_at": now
            }}
        )
        print("✅ تم تحديث المدرسة")
        
        # 2. Update Principal User
        print("\n🔄 تحديث مدير المدرسة...")
        await db.users.update_one(
            {"email": "principal@nassaq.com"},
            {"$set": {"tenant_id": DEMO_SCHOOL_ID}}
        )
        print("✅ تم ربط مدير المدرسة بالمدرسة التجريبية")
        
        # 3. Create Academic Year
        print("\n" + "=" * 50)
        print("📅 إنشاء العام الدراسي والفصول")
        print("=" * 50)
        
        academic_year_id = str(uuid.uuid4())
        await db.academic_years.delete_many({"school_id": DEMO_SCHOOL_ID})
        await db.academic_years.insert_one({
            "id": academic_year_id,
            "name": "العام الدراسي 1447-1448",
            "name_en": "Academic Year 2025-2026",
            "start_date": "2025-09-01",
            "end_date": "2026-06-30",
            "is_current": True,
            "school_id": DEMO_SCHOOL_ID,
            "status": "active",
            "created_at": now,
            "updated_at": now
        })
        print("✅ تم إنشاء العام الدراسي")
        
        # 4. Create Terms
        await db.terms.delete_many({"school_id": DEMO_SCHOOL_ID})
        terms_data = [
            {"name": "الفصل الدراسي الأول", "name_en": "First Semester", "start": "2025-09-01", "end": "2025-12-31", "is_current": False},
            {"name": "الفصل الدراسي الثاني", "name_en": "Second Semester", "start": "2026-01-01", "end": "2026-03-31", "is_current": True},
            {"name": "الفصل الدراسي الثالث", "name_en": "Third Semester", "start": "2026-04-01", "end": "2026-06-30", "is_current": False},
        ]
        term_ids = []
        for t in terms_data:
            tid = str(uuid.uuid4())
            term_ids.append(tid)
            await db.terms.insert_one({
                "id": tid,
                "name": t["name"],
                "name_en": t["name_en"],
                "academic_year_id": academic_year_id,
                "start_date": t["start"],
                "end_date": t["end"],
                "is_current": t["is_current"],
                "school_id": DEMO_SCHOOL_ID,
                "created_at": now,
                "updated_at": now
            })
        print(f"✅ تم إنشاء {len(terms_data)} فصول دراسية")
        
        # 5. Create Grade Levels
        print("\n" + "=" * 50)
        print("🎓 إنشاء المراحل الدراسية")
        print("=" * 50)
        
        await db.grade_levels.delete_many({"school_id": DEMO_SCHOOL_ID})
        grade_level_ids = []
        for g in GRADES:
            gid = str(uuid.uuid4())
            grade_level_ids.append({"id": gid, "name": g["name"], "order": g["order"]})
            await db.grade_levels.insert_one({
                "id": gid,
                "name": g["name"],
                "name_en": g["name_en"],
                "order": g["order"],
                "is_active": True,
                "school_id": DEMO_SCHOOL_ID,
                "created_at": now,
                "updated_at": now
            })
        print(f"✅ تم إنشاء {len(GRADES)} مراحل دراسية")
        
        # 6. Create Subjects
        print("\n" + "=" * 50)
        print("📖 إنشاء المواد الدراسية")
        print("=" * 50)
        
        await db.subjects.delete_many({"school_id": DEMO_SCHOOL_ID})
        subject_ids = []
        for s in SUBJECTS:
            sid = str(uuid.uuid4())
            subject_ids.append({"id": sid, "name": s["name"]})
            await db.subjects.insert_one({
                "id": sid,
                "name": s["name"],
                "name_en": s["name_en"],
                "code": s["code"],
                "is_active": True,
                "school_id": DEMO_SCHOOL_ID,
                "created_at": now,
                "updated_at": now
            })
        print(f"✅ تم إنشاء {len(SUBJECTS)} مواد دراسية")
        
        # 7. Create Time Slots
        print("\n" + "=" * 50)
        print("⏰ إنشاء فترات الحصص")
        print("=" * 50)
        
        await db.time_slots.delete_many({"school_id": DEMO_SCHOOL_ID})
        time_slots = [
            {"slot": 1, "start": "07:30", "end": "08:15", "is_break": False},
            {"slot": 2, "start": "08:20", "end": "09:05", "is_break": False},
            {"slot": 3, "start": "09:10", "end": "09:55", "is_break": False},
            {"slot": 4, "start": "10:00", "end": "10:30", "is_break": True, "label": "فسحة"},
            {"slot": 5, "start": "10:35", "end": "11:20", "is_break": False},
            {"slot": 6, "start": "11:25", "end": "12:10", "is_break": False},
            {"slot": 7, "start": "12:15", "end": "13:00", "is_break": False},
        ]
        time_slot_ids = []
        for ts in time_slots:
            tsid = str(uuid.uuid4())
            time_slot_ids.append({"id": tsid, "slot": ts["slot"], "is_break": ts["is_break"]})
            await db.time_slots.insert_one({
                "id": tsid,
                "slot_number": ts["slot"],
                "start_time": ts["start"],
                "end_time": ts["end"],
                "is_break": ts["is_break"],
                "break_label": ts.get("label"),
                "school_id": DEMO_SCHOOL_ID,
                "created_at": now
            })
        print(f"✅ تم إنشاء {len(time_slots)} فترات حصص")
        
        # 8. Create Teachers
        print("\n" + "=" * 50)
        print("👨‍🏫 إنشاء المعلمين")
        print("=" * 50)
        
        await db.teachers.delete_many({"school_id": DEMO_SCHOOL_ID})
        teachers = []
        for i in range(25):
            teacher_id = str(uuid.uuid4())
            name = random.choice(MALE_NAMES + FEMALE_NAMES) + " " + random.choice(LAST_NAMES)
            subject = random.choice(subject_ids)
            teachers.append({
                "id": teacher_id,
                "name": name,
                "subject_id": subject["id"],
                "subject_name": subject["name"]
            })
            await db.teachers.insert_one({
                "id": teacher_id,
                "full_name": name,
                "full_name_en": f"Teacher {i+1}",
                "email": f"teacher{i+1}@demo.nassaq.com",
                "phone": f"+9665{random.randint(10000000, 99999999)}",
                "subject_id": subject["id"],
                "status": "active",
                "school_id": DEMO_SCHOOL_ID,
                "created_at": now,
                "updated_at": now
            })
        print(f"✅ تم إنشاء {len(teachers)} معلم")
        
        # 9. Create Classes
        print("\n" + "=" * 50)
        print("🏫 إنشاء الفصول")
        print("=" * 50)
        
        await db.classes.delete_many({"school_id": DEMO_SCHOOL_ID})
        classes = []
        sections = ["أ", "ب", "ج"]
        for grade in grade_level_ids:
            for section in sections[:2]:  # 2 sections per grade
                class_id = str(uuid.uuid4())
                class_name = f"{grade['name']} - {section}"
                homeroom_teacher = random.choice(teachers)
                classes.append({
                    "id": class_id,
                    "name": class_name,
                    "grade_id": grade["id"],
                    "grade_order": grade["order"]
                })
                await db.classes.insert_one({
                    "id": class_id,
                    "name": class_name,
                    "name_en": f"Grade {grade['order']} - {section}",
                    "grade_level_id": grade["id"],
                    "grade_level": grade["name"],
                    "section": section,
                    "capacity": 30,
                    "current_students": 0,
                    "homeroom_teacher_id": homeroom_teacher["id"],
                    "homeroom_teacher": homeroom_teacher["name"],
                    "academic_year_id": academic_year_id,
                    "status": "active",
                    "school_id": DEMO_SCHOOL_ID,
                    "created_at": now,
                    "updated_at": now
                })
        print(f"✅ تم إنشاء {len(classes)} فصل")
        
        # 10. Create Students
        print("\n" + "=" * 50)
        print("👨‍🎓 إنشاء الطلاب")
        print("=" * 50)
        
        await db.students.delete_many({"school_id": DEMO_SCHOOL_ID})
        students = []
        student_count = 0
        for cls in classes:
            for j in range(25):  # 25 students per class
                student_id = str(uuid.uuid4())
                is_male = random.random() > 0.5
                name = random.choice(MALE_NAMES if is_male else FEMALE_NAMES) + " " + random.choice(LAST_NAMES)
                students.append({
                    "id": student_id,
                    "name": name,
                    "class_id": cls["id"],
                    "class_name": cls["name"]
                })
                await db.students.insert_one({
                    "id": student_id,
                    "full_name": name,
                    "full_name_en": f"Student {student_count + 1}",
                    "student_number": f"STD{2026}{student_count + 1:04d}",
                    "email": f"student{student_count + 1}@demo.nassaq.com",
                    "gender": "male" if is_male else "female",
                    "class_id": cls["id"],
                    "class_name": cls["name"],
                    "grade_level_id": cls["grade_id"],
                    "status": "active",
                    "school_id": DEMO_SCHOOL_ID,
                    "created_at": now,
                    "updated_at": now
                })
                student_count += 1
        
        # Update class counts
        for cls in classes:
            count = len([s for s in students if s["class_id"] == cls["id"]])
            await db.classes.update_one({"id": cls["id"]}, {"$set": {"current_students": count}})
        
        print(f"✅ تم إنشاء {len(students)} طالب")
        
        # 11. Create Schedule
        print("\n" + "=" * 50)
        print("📅 إنشاء الجدول الدراسي")
        print("=" * 50)
        
        await db.schedules.delete_many({"school_id": DEMO_SCHOOL_ID})
        await db.schedule_sessions.delete_many({"school_id": DEMO_SCHOOL_ID})
        
        schedule_id = str(uuid.uuid4())
        await db.schedules.insert_one({
            "id": schedule_id,
            "name": "الجدول الدراسي للفصل الثاني",
            "name_en": "Second Semester Schedule",
            "academic_year": "2025-2026",
            "semester": 2,
            "effective_from": "2026-01-01",
            "status": "active",
            "school_id": DEMO_SCHOOL_ID,
            "created_at": now,
            "updated_at": now
        })
        print("✅ تم إنشاء الجدول الدراسي")
        
        # Create Sessions for each class
        session_count = 0
        active_slots = [ts for ts in time_slot_ids if not ts["is_break"]]
        
        for cls in classes:
            for day in DAYS:
                for slot in active_slots:
                    subject = random.choice(subject_ids)
                    teacher = random.choice([t for t in teachers if t["subject_id"] == subject["id"]] or teachers)
                    
                    await db.schedule_sessions.insert_one({
                        "id": str(uuid.uuid4()),
                        "schedule_id": schedule_id,
                        "class_id": cls["id"],
                        "class_name": cls["name"],
                        "subject_id": subject["id"],
                        "subject_name": subject["name"],
                        "teacher_id": teacher["id"],
                        "teacher_name": teacher["name"],
                        "day": day,
                        "time_slot_id": slot["id"],
                        "slot_number": slot["slot"],
                        "room": f"Room {random.randint(101, 120)}",
                        "school_id": DEMO_SCHOOL_ID,
                        "created_at": now
                    })
                    session_count += 1
        print(f"✅ تم إنشاء {session_count} حصة دراسية")
        
        # 12. Create Attendance Records
        print("\n" + "=" * 50)
        print("📋 إنشاء سجلات الحضور")
        print("=" * 50)
        
        await db.attendance.delete_many({"school_id": DEMO_SCHOOL_ID})
        attendance_count = 0
        today = datetime.now(timezone.utc)
        
        # Last 30 days attendance
        for day_offset in range(30):
            date = (today - timedelta(days=day_offset)).strftime("%Y-%m-%d")
            
            for student in students:
                status = random.choices(
                    ["present", "absent", "late", "excused"],
                    weights=[85, 8, 5, 2]
                )[0]
                
                await db.attendance.insert_one({
                    "id": str(uuid.uuid4()),
                    "student_id": student["id"],
                    "student_name": student["name"],
                    "class_id": student["class_id"],
                    "class_name": student["class_name"],
                    "date": date,
                    "status": status,
                    "attendee_type": "student",
                    "check_in_time": "07:25" if status == "present" else ("07:45" if status == "late" else None),
                    "recorded_by": "النظام التلقائي",
                    "school_id": DEMO_SCHOOL_ID,
                    "created_at": now
                })
                attendance_count += 1
            
            # Teacher attendance
            for teacher in teachers:
                status = random.choices(
                    ["present", "absent", "excused"],
                    weights=[92, 5, 3]
                )[0]
                
                await db.attendance.insert_one({
                    "id": str(uuid.uuid4()),
                    "teacher_id": teacher["id"],
                    "teacher_name": teacher["name"],
                    "date": date,
                    "status": status,
                    "attendee_type": "teacher",
                    "check_in_time": "07:15" if status == "present" else None,
                    "school_id": DEMO_SCHOOL_ID,
                    "created_at": now
                })
                attendance_count += 1
        
        print(f"✅ تم إنشاء {attendance_count:,} سجل حضور")
        
        # 13. Create Assessments
        print("\n" + "=" * 50)
        print("📝 إنشاء الاختبارات والتقييمات")
        print("=" * 50)
        
        await db.assessments.delete_many({"school_id": DEMO_SCHOOL_ID})
        await db.grades.delete_many({"school_id": DEMO_SCHOOL_ID})
        
        assessment_types = [
            {"type": "quiz", "name": "اختبار قصير", "max_score": 10, "weight": 10},
            {"type": "homework", "name": "واجب منزلي", "max_score": 10, "weight": 10},
            {"type": "midterm", "name": "اختبار نصفي", "max_score": 30, "weight": 30},
            {"type": "final", "name": "اختبار نهائي", "max_score": 50, "weight": 50},
        ]
        
        assessment_count = 0
        grade_count = 0
        
        for cls in classes:
            for subject in subject_ids:
                for atype in assessment_types:
                    assessment_id = str(uuid.uuid4())
                    
                    await db.assessments.insert_one({
                        "id": assessment_id,
                        "name": f"{atype['name']} - {subject['name']}",
                        "name_en": f"{atype['type'].title()} - {subject['name']}",
                        "type": atype["type"],
                        "subject_id": subject["id"],
                        "subject_name": subject["name"],
                        "class_id": cls["id"],
                        "class_name": cls["name"],
                        "max_score": atype["max_score"],
                        "weight": atype["weight"],
                        "date": (today - timedelta(days=random.randint(1, 60))).strftime("%Y-%m-%d"),
                        "term_id": term_ids[1],  # Current term
                        "status": "graded",
                        "school_id": DEMO_SCHOOL_ID,
                        "created_at": now
                    })
                    assessment_count += 1
                    
                    # Create grades for students in this class
                    class_students = [s for s in students if s["class_id"] == cls["id"]]
                    for student in class_students:
                        score = random.gauss(atype["max_score"] * 0.75, atype["max_score"] * 0.15)
                        score = max(0, min(atype["max_score"], round(score, 1)))
                        
                        await db.grades.insert_one({
                            "id": str(uuid.uuid4()),
                            "assessment_id": assessment_id,
                            "student_id": student["id"],
                            "student_name": student["name"],
                            "class_id": cls["id"],
                            "subject_id": subject["id"],
                            "grade": score,
                            "max_score": atype["max_score"],
                            "percentage": round((score / atype["max_score"]) * 100, 1),
                            "status": "final",
                            "school_id": DEMO_SCHOOL_ID,
                            "created_at": now
                        })
                        grade_count += 1
        
        print(f"✅ تم إنشاء {assessment_count} اختبار/تقييم")
        print(f"✅ تم إنشاء {grade_count:,} سجل درجات")
        
        # 14. Update School Stats
        print("\n" + "=" * 50)
        print("📊 تحديث إحصائيات المدرسة")
        print("=" * 50)
        
        await db.schools.update_one(
            {"id": DEMO_SCHOOL_ID},
            {"$set": {
                "current_students": len(students),
                "current_teachers": len(teachers),
                "total_classes": len(classes),
                "updated_at": now
            }}
        )
        print("✅ تم تحديث إحصائيات المدرسة")
        
        # Summary
        print("\n" + "=" * 60)
        print("🎉 تم إنشاء جميع البيانات التجريبية بنجاح!")
        print("=" * 60)
        print(f"""
📊 ملخص البيانات:
   • المدرسة: {DEMO_SCHOOL_ID}
   • الأعوام الدراسية: 1
   • الفصول الدراسية: 3
   • المراحل: {len(GRADES)}
   • المواد: {len(SUBJECTS)}
   • المعلمين: {len(teachers)}
   • الفصول: {len(classes)}
   • الطلاب: {len(students)}
   • الحصص: {session_count}
   • سجلات الحضور: {attendance_count:,}
   • الاختبارات: {assessment_count}
   • الدرجات: {grade_count:,}
        """)
        
        print("\n📝 حسابات الدخول للاختبار:")
        print("-" * 40)
        print("مدير المدرسة:  principal@nassaq.com / Principal@123")
        print("-" * 40)
        
    except Exception as e:
        print(f"\n❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
