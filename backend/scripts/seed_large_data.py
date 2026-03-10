#!/usr/bin/env python3
"""
سكريبت إنشاء البيانات التجريبية الكبيرة لنظام نَسَّق
Large Scale Seed Data Script for NASSAQ Platform
"""

import asyncio
import sys
import os
import random
from typing import List, Dict

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
from datetime import datetime, timezone, timedelta
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# ============== CONFIGURATION ==============
CONFIG = {
    "schools": 100,
    "teachers_per_school": 25,
    "students_per_school": 300,
    "parents_per_school": 600,  # 2 parents per student on average
    "classes_per_school": 10,
    "students_per_class": 30,
}

# ============== SAMPLE DATA ==============
SAUDI_CITIES = [
    {"name": "الرياض", "name_en": "Riyadh", "region": "منطقة الرياض"},
    {"name": "جدة", "name_en": "Jeddah", "region": "منطقة مكة المكرمة"},
    {"name": "مكة المكرمة", "name_en": "Makkah", "region": "منطقة مكة المكرمة"},
    {"name": "المدينة المنورة", "name_en": "Madinah", "region": "منطقة المدينة المنورة"},
    {"name": "الدمام", "name_en": "Dammam", "region": "المنطقة الشرقية"},
    {"name": "الخبر", "name_en": "Khobar", "region": "المنطقة الشرقية"},
    {"name": "الأحساء", "name_en": "Al-Ahsa", "region": "المنطقة الشرقية"},
    {"name": "الطائف", "name_en": "Taif", "region": "منطقة مكة المكرمة"},
    {"name": "بريدة", "name_en": "Buraidah", "region": "منطقة القصيم"},
    {"name": "تبوك", "name_en": "Tabuk", "region": "منطقة تبوك"},
    {"name": "أبها", "name_en": "Abha", "region": "منطقة عسير"},
    {"name": "خميس مشيط", "name_en": "Khamis Mushait", "region": "منطقة عسير"},
    {"name": "حائل", "name_en": "Hail", "region": "منطقة حائل"},
    {"name": "نجران", "name_en": "Najran", "region": "منطقة نجران"},
    {"name": "جازان", "name_en": "Jazan", "region": "منطقة جازان"},
]

SCHOOL_TYPES = ["حكومية", "أهلية", "عالمية", "خاصة"]
SCHOOL_STAGES = ["ابتدائية", "متوسطة", "ثانوية", "شاملة"]
SCHOOL_GENDER = ["بنين", "بنات", "مشتركة"]

MALE_FIRST_NAMES = [
    "محمد", "أحمد", "عبدالله", "خالد", "عمر", "سعود", "فيصل", "ناصر", "سلطان", "عبدالرحمن",
    "يوسف", "إبراهيم", "علي", "حسن", "حسين", "سعد", "مشاري", "بندر", "طلال", "ماجد",
    "راشد", "سالم", "جاسم", "عادل", "وليد", "تركي", "نواف", "فهد", "منصور", "زياد"
]

FEMALE_FIRST_NAMES = [
    "فاطمة", "نورة", "سارة", "مريم", "هند", "لمياء", "ريم", "دانة", "جود", "لين",
    "ندى", "هيا", "العنود", "منيرة", "أمل", "رنا", "شيماء", "وفاء", "هدى", "سمر",
    "لطيفة", "نجلاء", "عبير", "رشا", "مها", "ديما", "غدير", "روان", "جوري", "ليان"
]

LAST_NAMES = [
    "العمري", "الفهد", "السعيد", "الشمري", "القحطاني", "الدوسري", "الحربي", "المطيري",
    "العتيبي", "الزهراني", "الغامدي", "البلوي", "الشهري", "العسيري", "الحازمي",
    "السبيعي", "الرشيدي", "التميمي", "الخالدي", "المالكي", "الجهني", "السلمي",
    "العمراني", "البكري", "الأنصاري", "الهاشمي", "المحمدي", "العبدالله", "الصالح", "الحمد"
]

SUBJECTS = [
    {"name": "الرياضيات", "name_en": "Mathematics"},
    {"name": "اللغة العربية", "name_en": "Arabic Language"},
    {"name": "اللغة الإنجليزية", "name_en": "English Language"},
    {"name": "العلوم", "name_en": "Science"},
    {"name": "الدراسات الاجتماعية", "name_en": "Social Studies"},
    {"name": "التربية الإسلامية", "name_en": "Islamic Studies"},
    {"name": "الحاسب الآلي", "name_en": "Computer Science"},
    {"name": "التربية البدنية", "name_en": "Physical Education"},
    {"name": "التربية الفنية", "name_en": "Art Education"},
    {"name": "المهارات الحياتية", "name_en": "Life Skills"},
]

GRADES = [
    {"name": "الصف الأول", "name_en": "Grade 1", "order": 1},
    {"name": "الصف الثاني", "name_en": "Grade 2", "order": 2},
    {"name": "الصف الثالث", "name_en": "Grade 3", "order": 3},
    {"name": "الصف الرابع", "name_en": "Grade 4", "order": 4},
    {"name": "الصف الخامس", "name_en": "Grade 5", "order": 5},
    {"name": "الصف السادس", "name_en": "Grade 6", "order": 6},
]

SECTIONS = ["أ", "ب", "ج", "د", "هـ"]

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_phone():
    """Generate Saudi phone number"""
    return f"+9665{random.randint(10000000, 99999999)}"

def generate_email(name: str, domain: str, index: int) -> str:
    """Generate unique email"""
    clean_name = name.lower().replace(" ", "").replace("ال", "")[:8]
    return f"{clean_name}{index}@{domain}"

def random_date(start_year=2020, end_year=2026):
    """Generate random date"""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).isoformat()

async def create_platform_admin(db):
    """Create Platform Admin account"""
    admin = {
        "id": str(uuid.uuid4()),
        "email": "admin@nassaq.com",
        "password_hash": hash_password("NassaqAdmin2026"),
        "full_name": "مدير نظام نَسَّق",
        "full_name_en": "NASSAQ System Admin",
        "role": "platform_admin",
        "tenant_id": None,
        "phone": "+966500000001",
        "avatar_url": None,
        "is_active": True,
        "must_change_password": False,
        "preferred_language": "ar",
        "preferred_theme": "light",
        "permissions": [
            "manage_schools", "manage_users", "manage_settings", "view_analytics",
            "manage_integrations", "manage_security", "manage_rules", "system_monitoring",
            "manage_notifications", "export_data", "manage_ai"
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.delete_one({"email": admin["email"]})
    await db.users.insert_one(admin)
    print(f"✅ تم إنشاء حساب مدير المنصة: {admin['email']}")
    return admin

async def create_schools(db, count: int) -> List[Dict]:
    """Create schools"""
    print(f"\n📚 إنشاء {count} مدرسة...")
    schools = []
    
    for i in range(count):
        city = random.choice(SAUDI_CITIES)
        school_type = random.choice(SCHOOL_TYPES)
        stage = random.choice(SCHOOL_STAGES)
        gender = random.choice(SCHOOL_GENDER)
        
        school = {
            "id": str(uuid.uuid4()),
            "name": f"مدرسة {city['name']} {stage} {gender} #{i+1}",
            "name_en": f"{city['name_en']} {stage} School #{i+1}",
            "code": f"SCH-{city['name_en'][:3].upper()}-{str(i+1).zfill(4)}",
            "email": f"school{i+1}@nassaq.demo",
            "phone": generate_phone(),
            "address": f"حي النموذجي، {city['name']}",
            "city": city["name"],
            "city_en": city["name_en"],
            "region": city["region"],
            "country": "SA",
            "school_type": school_type,
            "stage": stage,
            "gender": gender,
            "status": random.choices(["active", "active", "active", "suspended"], weights=[85, 10, 4, 1])[0],
            "student_capacity": random.randint(300, 800),
            "current_students": 0,  # Will be updated
            "current_teachers": 0,  # Will be updated
            "ai_enabled": random.choice([True, True, True, False]),
            "subscription_plan": random.choice(["basic", "standard", "premium"]),
            "subscription_expiry": (datetime.now(timezone.utc) + timedelta(days=random.randint(30, 365))).isoformat(),
            "created_at": random_date(2023, 2025),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        schools.append(school)
        
        if (i + 1) % 20 == 0:
            print(f"   ... تم إنشاء {i+1}/{count} مدرسة")
    
    # Bulk insert
    if schools:
        await db.schools.delete_many({})
        await db.schools.insert_many(schools)
    
    print(f"✅ تم إنشاء {len(schools)} مدرسة")
    return schools

async def create_users_for_school(db, school: Dict, school_index: int) -> Dict:
    """Create all users for a single school"""
    users = []
    students_list = []
    teachers_list = []
    
    school_id = school["id"]
    is_male_school = school["gender"] == "بنين"
    is_female_school = school["gender"] == "بنات"
    
    # Create Principal
    principal_name = random.choice(MALE_FIRST_NAMES if is_male_school else FEMALE_FIRST_NAMES) + " " + random.choice(LAST_NAMES)
    principal = {
        "id": str(uuid.uuid4()),
        "email": f"principal{school_index}@nassaq.demo",
        "password_hash": hash_password("Principal@123"),
        "full_name": principal_name,
        "full_name_en": f"Principal {school_index}",
        "role": "school_principal",
        "tenant_id": school_id,
        "phone": generate_phone(),
        "is_active": True,
        "must_change_password": False,
        "preferred_language": "ar",
        "preferred_theme": "light",
        "created_at": school["created_at"],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    users.append(principal)
    
    # Create Teachers
    for t in range(CONFIG["teachers_per_school"]):
        is_male = is_male_school or (not is_female_school and random.choice([True, False]))
        first_names = MALE_FIRST_NAMES if is_male else FEMALE_FIRST_NAMES
        teacher_name = random.choice(first_names) + " " + random.choice(LAST_NAMES)
        
        teacher = {
            "id": str(uuid.uuid4()),
            "email": f"teacher{school_index}_{t}@nassaq.demo",
            "password_hash": hash_password("Teacher@123"),
            "full_name": teacher_name,
            "full_name_en": f"Teacher {school_index}-{t}",
            "role": "teacher",
            "tenant_id": school_id,
            "phone": generate_phone(),
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "subjects": [random.choice(SUBJECTS)["name"] for _ in range(random.randint(1, 3))],
            "created_at": random_date(2023, 2025),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        users.append(teacher)
        teachers_list.append(teacher)
    
    # Create Students
    for s in range(CONFIG["students_per_school"]):
        is_male = is_male_school or (not is_female_school and random.choice([True, False]))
        first_names = MALE_FIRST_NAMES if is_male else FEMALE_FIRST_NAMES
        student_name = random.choice(first_names) + " " + random.choice(LAST_NAMES)
        
        grade = random.choice(GRADES)
        section = random.choice(SECTIONS)
        
        student = {
            "id": str(uuid.uuid4()),
            "email": f"student{school_index}_{s}@nassaq.demo",
            "password_hash": hash_password("Student@123"),
            "full_name": student_name,
            "full_name_en": f"Student {school_index}-{s}",
            "role": "student",
            "tenant_id": school_id,
            "phone": generate_phone(),
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "grade": grade["name"],
            "section": section,
            "student_id": f"STU-{school_index}-{str(s).zfill(4)}",
            "created_at": random_date(2023, 2025),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        users.append(student)
        students_list.append(student)
    
    # Create Parents (2 per student on average, but some share)
    parent_count = int(CONFIG["students_per_school"] * 1.5)  # 1.5 parents per student average
    for p in range(parent_count):
        is_male = random.choice([True, False])
        first_names = MALE_FIRST_NAMES if is_male else FEMALE_FIRST_NAMES
        parent_name = random.choice(first_names) + " " + random.choice(LAST_NAMES)
        
        # Assign 1-3 children to this parent
        num_children = random.randint(1, 3)
        children_ids = [random.choice(students_list)["id"] for _ in range(num_children)]
        
        parent = {
            "id": str(uuid.uuid4()),
            "email": f"parent{school_index}_{p}@nassaq.demo",
            "password_hash": hash_password("Parent@123"),
            "full_name": parent_name,
            "full_name_en": f"Parent {school_index}-{p}",
            "role": "parent",
            "tenant_id": school_id,
            "phone": generate_phone(),
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "children_ids": children_ids,
            "created_at": random_date(2023, 2025),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        users.append(parent)
    
    return {
        "users": users,
        "teachers": teachers_list,
        "students": students_list,
        "teachers_count": len(teachers_list),
        "students_count": len(students_list),
        "parents_count": parent_count
    }

async def create_classes_for_school(db, school: Dict, teachers: List, students: List) -> List:
    """Create classes for a school"""
    classes = []
    
    for grade in GRADES:
        for section_idx, section in enumerate(SECTIONS[:2]):  # 2 sections per grade
            class_name = f"{grade['name']} - {section}"
            
            # Assign homeroom teacher
            homeroom_teacher = teachers[len(classes) % len(teachers)] if teachers else None
            
            # Assign students to class
            class_students = [s for s in students if s.get("grade") == grade["name"] and s.get("section") == section][:30]
            
            class_obj = {
                "id": str(uuid.uuid4()),
                "name": class_name,
                "name_en": f"{grade['name_en']} - {section}",
                "school_id": school["id"],
                "grade": grade["name"],
                "grade_order": grade["order"],
                "section": section,
                "homeroom_teacher_id": homeroom_teacher["id"] if homeroom_teacher else None,
                "homeroom_teacher_name": homeroom_teacher["full_name"] if homeroom_teacher else None,
                "student_count": len(class_students),
                "max_capacity": 35,
                "room_number": f"{grade['order']}{section_idx + 1}",
                "floor": str((grade['order'] - 1) // 2 + 1),
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            classes.append(class_obj)
    
    return classes

async def create_attendance_records(db, school_id: str, students: List) -> List:
    """Create attendance records for students"""
    attendance = []
    
    # Generate attendance for last 30 days
    today = datetime.now(timezone.utc)
    
    for student in students[:50]:  # Limit to 50 students per school for performance
        for day_offset in range(30):
            date = (today - timedelta(days=day_offset)).date()
            
            # Skip weekends (Friday, Saturday in Saudi)
            if date.weekday() in [4, 5]:  # Friday=4, Saturday=5
                continue
            
            # Random attendance status
            status = random.choices(
                ["present", "absent", "late", "excused"],
                weights=[85, 5, 7, 3]
            )[0]
            
            record = {
                "id": str(uuid.uuid4()),
                "school_id": school_id,
                "student_id": student["id"],
                "student_name": student["full_name"],
                "date": date.isoformat(),
                "status": status,
                "check_in_time": "07:30" if status in ["present", "late"] else None,
                "late_minutes": random.randint(5, 30) if status == "late" else 0,
                "notes": "غياب بعذر طبي" if status == "excused" else None,
                "recorded_by": "system",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            attendance.append(record)
    
    return attendance

async def create_grades_records(db, school_id: str, students: List) -> List:
    """Create grade records for students"""
    grades = []
    
    assessment_types = ["quiz", "assignment", "exam", "participation", "midterm", "final"]
    
    for student in students[:50]:  # Limit to 50 students per school
        for subject in SUBJECTS[:5]:  # 5 subjects
            for assessment_type in random.sample(assessment_types, 3):  # 3 assessments per subject
                max_score = 100 if assessment_type in ["midterm", "final", "exam"] else random.choice([10, 20, 50])
                score = random.randint(int(max_score * 0.4), max_score)
                
                record = {
                    "id": str(uuid.uuid4()),
                    "school_id": school_id,
                    "student_id": student["id"],
                    "student_name": student["full_name"],
                    "subject": subject["name"],
                    "subject_en": subject["name_en"],
                    "assessment_type": assessment_type,
                    "score": score,
                    "max_score": max_score,
                    "percentage": round((score / max_score) * 100, 1),
                    "term": "الفصل الأول",
                    "academic_year": "2026-2027",
                    "notes": None,
                    "recorded_by": "teacher",
                    "created_at": random_date(2026, 2026)
                }
                grades.append(record)
    
    return grades

async def update_school_stats(db, schools: List):
    """Update school statistics"""
    print("\n📊 تحديث إحصائيات المدارس...")
    
    for school in schools:
        # Count users for this school
        teachers_count = await db.users.count_documents({"tenant_id": school["id"], "role": "teacher"})
        students_count = await db.users.count_documents({"tenant_id": school["id"], "role": "student"})
        
        await db.schools.update_one(
            {"id": school["id"]},
            {"$set": {
                "current_teachers": teachers_count,
                "current_students": students_count,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    print("✅ تم تحديث إحصائيات المدارس")

async def create_platform_stats(db):
    """Create platform statistics document"""
    total_schools = await db.schools.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_teachers = await db.users.count_documents({"role": "teacher"})
    total_parents = await db.users.count_documents({"role": "parent"})
    active_schools = await db.schools.count_documents({"status": "active"})
    
    stats = {
        "id": "platform_stats",
        "total_schools": total_schools,
        "active_schools": active_schools,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_parents": total_parents,
        "total_users": total_students + total_teachers + total_parents,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    
    await db.platform_stats.delete_many({})
    await db.platform_stats.insert_one(stats)
    
    print(f"\n📈 إحصائيات المنصة:")
    print(f"   - المدارس: {total_schools}")
    print(f"   - الطلاب: {total_students:,}")
    print(f"   - المعلمون: {total_teachers:,}")
    print(f"   - أولياء الأمور: {total_parents:,}")
    
    return stats

async def main():
    """Main function to seed all data"""
    print("=" * 60)
    print("🚀 بدء إنشاء البيانات التجريبية الكبيرة لنظام نَسَّق")
    print("=" * 60)
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print(f"\n🔗 الاتصال بقاعدة البيانات: {mongo_url}")
    print(f"📁 اسم قاعدة البيانات: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # 1. Create Platform Admin
        print("\n" + "=" * 40)
        print("👑 إنشاء حساب مدير المنصة")
        print("=" * 40)
        await create_platform_admin(db)
        
        # 2. Create Demo Test Accounts
        print("\n" + "=" * 40)
        print("🧪 إنشاء حسابات الاختبار التجريبية")
        print("=" * 40)
        
        demo_school_id = "demo-school-001"
        demo_school = {
            "id": demo_school_id,
            "name": "مدرسة نَسَّق التجريبية",
            "name_en": "NASSAQ Demo School",
            "code": "NASSAQ-DEMO",
            "email": "demo@nassaq.com",
            "phone": "+966500000000",
            "address": "الرياض، المملكة العربية السعودية",
            "city": "الرياض",
            "region": "منطقة الرياض",
            "country": "SA",
            "school_type": "أهلية",
            "stage": "شاملة",
            "gender": "مشتركة",
            "status": "active",
            "student_capacity": 500,
            "current_students": 300,
            "current_teachers": 25,
            "ai_enabled": True,
            "subscription_plan": "premium",
            "subscription_expiry": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Demo accounts
        demo_accounts = [
            {
                "id": str(uuid.uuid4()),
                "email": "principal@nassaq.com",
                "password_hash": hash_password("Principal@123"),
                "full_name": "أحمد محمد العمري",
                "full_name_en": "Ahmed Mohammed Al-Omari",
                "role": "school_principal",
                "tenant_id": demo_school_id,
                "phone": "+966501234567",
                "is_active": True,
                "must_change_password": False,
                "preferred_language": "ar",
                "preferred_theme": "light",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "teacher@nassaq.com",
                "password_hash": hash_password("Teacher@123"),
                "full_name": "سارة أحمد الفهد",
                "full_name_en": "Sarah Ahmed Al-Fahad",
                "role": "teacher",
                "tenant_id": demo_school_id,
                "phone": "+966502345678",
                "is_active": True,
                "must_change_password": False,
                "preferred_language": "ar",
                "preferred_theme": "light",
                "subjects": ["الرياضيات", "العلوم"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "student@nassaq.com",
                "password_hash": hash_password("Student@123"),
                "full_name": "محمد خالد السعيد",
                "full_name_en": "Mohammed Khaled Al-Saeed",
                "role": "student",
                "tenant_id": demo_school_id,
                "phone": "+966503456789",
                "is_active": True,
                "must_change_password": False,
                "preferred_language": "ar",
                "preferred_theme": "light",
                "grade": "الصف الرابع",
                "section": "أ",
                "student_id": "STU-DEMO-0001",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "parent@nassaq.com",
                "password_hash": hash_password("Parent@123"),
                "full_name": "خالد محمد السعيد",
                "full_name_en": "Khaled Mohammed Al-Saeed",
                "role": "parent",
                "tenant_id": demo_school_id,
                "phone": "+966504567890",
                "is_active": True,
                "must_change_password": False,
                "preferred_language": "ar",
                "preferred_theme": "light",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "independent.teacher@nassaq.com",
                "password_hash": hash_password("Teacher@123"),
                "full_name": "نورة عبدالله الشمري",
                "full_name_en": "Noura Abdullah Al-Shammari",
                "role": "teacher",
                "tenant_id": None,
                "phone": "+966505678901",
                "is_active": True,
                "must_change_password": False,
                "preferred_language": "ar",
                "preferred_theme": "light",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        # Insert demo accounts
        for account in demo_accounts:
            await db.users.delete_one({"email": account["email"]})
            await db.users.insert_one(account)
            print(f"✅ {account['role']}: {account['email']}")
        
        # 3. Create Schools
        print("\n" + "=" * 40)
        print("🏫 إنشاء المدارس")
        print("=" * 40)
        schools = await create_schools(db, CONFIG["schools"])
        
        # Add demo school to the beginning
        await db.schools.update_one({"id": demo_school_id}, {"$set": demo_school}, upsert=True)
        schools.insert(0, demo_school)
        
        # 4. Create Users for Each School (in batches to avoid memory issues)
        print("\n" + "=" * 40)
        print("👥 إنشاء المستخدمين")
        print("=" * 40)
        
        all_users = []
        all_classes = []
        all_attendance = []
        all_grades = []
        
        batch_size = 10
        for batch_start in range(0, len(schools), batch_size):
            batch_schools = schools[batch_start:batch_start + batch_size]
            
            for idx, school in enumerate(batch_schools):
                school_index = batch_start + idx
                
                # Create users
                school_data = await create_users_for_school(db, school, school_index)
                all_users.extend(school_data["users"])
                
                # Create classes
                classes = await create_classes_for_school(db, school, school_data["teachers"], school_data["students"])
                all_classes.extend(classes)
                
                # Create attendance (limited for performance)
                if school_index < 10:  # Only for first 10 schools
                    attendance = await create_attendance_records(db, school["id"], school_data["students"])
                    all_attendance.extend(attendance)
                    
                    # Create grades
                    grades = await create_grades_records(db, school["id"], school_data["students"])
                    all_grades.extend(grades)
            
            # Bulk insert users
            if all_users:
                # Delete existing demo users (keep main test accounts)
                await db.users.delete_many({"email": {"$regex": "@nassaq.demo$"}})
                await db.users.insert_many(all_users)
                print(f"   ✅ تم إنشاء {len(all_users):,} مستخدم (الدفعة {batch_start//batch_size + 1})")
                all_users = []
            
            # Bulk insert classes
            if all_classes:
                await db.classes.delete_many({})
                await db.classes.insert_many(all_classes)
                print(f"   ✅ تم إنشاء {len(all_classes):,} فصل")
                all_classes = []
        
        # Insert attendance and grades
        if all_attendance:
            await db.attendance.delete_many({})
            await db.attendance.insert_many(all_attendance)
            print(f"   ✅ تم إنشاء {len(all_attendance):,} سجل حضور")
        
        if all_grades:
            await db.grades.delete_many({})
            await db.grades.insert_many(all_grades)
            print(f"   ✅ تم إنشاء {len(all_grades):,} سجل درجات")
        
        # 5. Update School Statistics
        await update_school_stats(db, schools)
        
        # 6. Create Platform Stats
        stats = await create_platform_stats(db)
        
        print("\n" + "=" * 60)
        print("🎉 تم إنشاء جميع البيانات التجريبية بنجاح!")
        print("=" * 60)
        
        print("\n📝 حسابات الدخول للاختبار:")
        print("-" * 40)
        print("مدير المنصة:   admin@nassaq.com / NassaqAdmin2026")
        print("مدير المدرسة:  principal@nassaq.com / Principal@123")
        print("المعلم:       teacher@nassaq.com / Teacher@123")
        print("الطالب:       student@nassaq.com / Student@123")
        print("ولي الأمر:    parent@nassaq.com / Parent@123")
        print("-" * 40)
        
    except Exception as e:
        print(f"\n❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
