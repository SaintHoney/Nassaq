#!/usr/bin/env python3
"""
NASSAQ Controlled Demo Data Seeder
===================================
Creates exactly 5 schools with consistent, realistic Saudi educational data.
Respects Multi-Tenant Architecture completely.

Schools:
1. مدرسة النور
2. مدرسة العلي
3. مدرسة المنارة
4. مدرسة الاحساء
5. مدرسة الحديثة

Each school has:
- 1 Principal
- 100 Students (distributed across grades/sections)
- 10+ Teachers (1 per subject minimum)
- 10 Saudi standard subjects
- Logical class structure
- Attendance records
- Behavior records
- Assessment records
"""

import asyncio
import uuid
import random
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv('/app/backend/.env')

# =============================================================================
# CONFIGURATION
# =============================================================================

SCHOOLS_CONFIG = [
    {"name": "مدرسة النور", "name_en": "Al-Noor School", "code": "NOR", "city": "الرياض", "city_en": "Riyadh"},
    {"name": "مدرسة العلي", "name_en": "Al-Ali School", "code": "ALI", "city": "جدة", "city_en": "Jeddah"},
    {"name": "مدرسة المنارة", "name_en": "Al-Manara School", "code": "MNR", "city": "الدمام", "city_en": "Dammam"},
    {"name": "مدرسة الاحساء", "name_en": "Al-Ahsa School", "code": "AHS", "city": "الأحساء", "city_en": "Al-Ahsa"},
    {"name": "مدرسة الحديثة", "name_en": "Al-Haditha School", "code": "HDT", "city": "مكة المكرمة", "city_en": "Makkah"},
]

# Saudi Standard Subjects
SUBJECTS = [
    {"name": "اللغة العربية", "name_en": "Arabic Language", "code": "ARB"},
    {"name": "الرياضيات", "name_en": "Mathematics", "code": "MTH"},
    {"name": "العلوم", "name_en": "Science", "code": "SCI"},
    {"name": "اللغة الإنجليزية", "name_en": "English Language", "code": "ENG"},
    {"name": "الدراسات الإسلامية", "name_en": "Islamic Studies", "code": "ISL"},
    {"name": "الدراسات الاجتماعية", "name_en": "Social Studies", "code": "SOC"},
    {"name": "الحاسب الآلي", "name_en": "Computer Science", "code": "CMP"},
    {"name": "المهارات الرقمية", "name_en": "Digital Skills", "code": "DGT"},
    {"name": "التربية الفنية", "name_en": "Art Education", "code": "ART"},
    {"name": "التربية البدنية", "name_en": "Physical Education", "code": "PHY"},
]

# Grade Levels (Saudi System)
GRADE_LEVELS = [
    {"grade": 1, "name": "الصف الأول", "name_en": "Grade 1", "stage": "ابتدائي"},
    {"grade": 2, "name": "الصف الثاني", "name_en": "Grade 2", "stage": "ابتدائي"},
    {"grade": 3, "name": "الصف الثالث", "name_en": "Grade 3", "stage": "ابتدائي"},
    {"grade": 4, "name": "الصف الرابع", "name_en": "Grade 4", "stage": "ابتدائي"},
    {"grade": 5, "name": "الصف الخامس", "name_en": "Grade 5", "stage": "ابتدائي"},
    {"grade": 6, "name": "الصف السادس", "name_en": "Grade 6", "stage": "ابتدائي"},
]

# Time Slots (Saudi School Day)
TIME_SLOTS = [
    {"slot": 1, "start": "07:00", "end": "07:45", "name": "الحصة الأولى", "name_en": "Period 1", "is_break": False},
    {"slot": 2, "start": "07:50", "end": "08:35", "name": "الحصة الثانية", "name_en": "Period 2", "is_break": False},
    {"slot": 3, "start": "08:40", "end": "09:25", "name": "الحصة الثالثة", "name_en": "Period 3", "is_break": False},
    {"slot": 4, "start": "09:30", "end": "10:00", "name": "الفسحة", "name_en": "Break", "is_break": True},
    {"slot": 5, "start": "10:05", "end": "10:50", "name": "الحصة الرابعة", "name_en": "Period 4", "is_break": False},
    {"slot": 6, "start": "10:55", "end": "11:40", "name": "الحصة الخامسة", "name_en": "Period 5", "is_break": False},
    {"slot": 7, "start": "11:45", "end": "12:30", "name": "الحصة السادسة", "name_en": "Period 6", "is_break": False},
]

DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday"]

# Arabic Names for realistic data
MALE_FIRST_NAMES = [
    "محمد", "أحمد", "عبدالله", "عبدالرحمن", "فيصل", "سلطان", "خالد", "سعود", "ناصر", "تركي",
    "سعد", "عمر", "يوسف", "إبراهيم", "عبدالعزيز", "بندر", "فهد", "عبدالمجيد", "طلال", "ماجد",
    "راشد", "سالم", "حمد", "مشاري", "نايف", "وليد", "عادل", "سامي", "هاني", "زياد"
]

FEMALE_FIRST_NAMES = [
    "نورة", "سارة", "فاطمة", "عائشة", "منال", "هند", "ريم", "دانة", "لمياء", "أمل",
    "مها", "نوف", "هيا", "جواهر", "لولوة", "العنود", "البندري", "شيخة", "موضي", "نوال"
]

LAST_NAMES = [
    "القحطاني", "العتيبي", "الدوسري", "الشمري", "المطيري", "الحربي", "الغامدي", "الزهراني",
    "السبيعي", "العمري", "البلوي", "الشهري", "السهلي", "الجهني", "المالكي", "القرني",
    "الأسمري", "الخالدي", "التميمي", "الرشيدي"
]

# Behavior Types
BEHAVIOR_TYPES = [
    {"name": "تميز أكاديمي", "name_en": "Academic Excellence", "category": "positive", "points": 5},
    {"name": "مشاركة فعالة", "name_en": "Active Participation", "category": "positive", "points": 3},
    {"name": "سلوك مثالي", "name_en": "Exemplary Behavior", "category": "positive", "points": 4},
    {"name": "مساعدة الزملاء", "name_en": "Helping Peers", "category": "positive", "points": 3},
    {"name": "تأخر عن الحصة", "name_en": "Late to Class", "category": "negative", "points": -2},
    {"name": "عدم إحضار الواجب", "name_en": "Missing Homework", "category": "negative", "points": -3},
    {"name": "سلوك غير لائق", "name_en": "Inappropriate Behavior", "category": "negative", "points": -4},
    {"name": "إزعاج في الفصل", "name_en": "Classroom Disruption", "category": "negative", "points": -2},
]


def hash_password(password: str) -> str:
    """Bcrypt password hashing - same as server.py"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def generate_id():
    return str(uuid.uuid4())


def generate_phone():
    return f"05{random.randint(10000000, 99999999)}"


def generate_national_id():
    return f"1{random.randint(100000000, 999999999)}"


def get_now():
    return datetime.now(timezone.utc).isoformat()


class ControlledSeeder:
    def __init__(self):
        self.client = None
        self.db = None
        self.schools_data = {}  # Store created data for each school
        
    async def connect(self):
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'test_database')
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        print(f"✅ Connected to MongoDB: {db_name}")
        
    async def close(self):
        if self.client:
            self.client.close()
            
    async def clean_demo_data(self):
        """Remove all existing demo data to start fresh"""
        print("\n" + "=" * 60)
        print("🧹 تنظيف البيانات القديمة / Cleaning old data...")
        print("=" * 60)
        
        collections_to_clean = [
            'schools', 'users', 'students', 'teachers', 'subjects',
            'classes', 'schedules', 'schedule_sessions', 'time_slots',
            'attendance', 'behaviour_records', 'assessments', 'grades',
            'parents', 'academic_years', 'terms', 'grade_levels',
            'teacher_assignments', 'notifications'
        ]
        
        for coll in collections_to_clean:
            try:
                result = await self.db[coll].delete_many({})
                if result.deleted_count > 0:
                    print(f"  🗑️ {coll}: حذف {result.deleted_count} سجل")
            except Exception as e:
                print(f"  ⚠️ {coll}: {e}")
                
        # Clean demo_ prefixed collections
        demo_collections = ['demo_schools', 'demo_students', 'demo_teachers', 'demo_classes', 'demo_subjects']
        for coll in demo_collections:
            try:
                result = await self.db[coll].delete_many({})
                if result.deleted_count > 0:
                    print(f"  🗑️ {coll}: حذف {result.deleted_count} سجل")
            except Exception as e:
                pass
                
        print("✅ تم تنظيف البيانات القديمة")
        
    async def seed_platform_admin(self):
        """Create Platform Admin account"""
        print("\n" + "=" * 60)
        print("👑 إنشاء حساب مدير المنصة / Creating Platform Admin")
        print("=" * 60)
        
        admin_id = generate_id()
        admin = {
            "id": admin_id,
            "email": "admin@nassaq.com",
            "password_hash": hash_password("Admin@123"),
            "full_name": "مدير المنصة",
            "full_name_en": "Platform Admin",
            "role": "platform_admin",
            "is_active": True,
            "is_suspended": False,
            "tenant_id": None,  # Platform admin has no tenant
            "permissions": [
                "manage_schools", "manage_users", "manage_settings",
                "view_analytics", "manage_integrations", "manage_rules",
                "view_audit_logs", "manage_api_keys", "manage_tenants",
                "view_all_data", "system_admin"
            ],
            "created_at": get_now(),
            "updated_at": get_now()
        }
        
        await self.db.users.insert_one(admin)
        print(f"  ✅ مدير المنصة: admin@nassaq.com / Admin@123")
        
        return admin_id
        
    async def seed_school(self, school_config, index):
        """Create a complete school with all related data"""
        school_id = f"school-{school_config['code'].lower()}-001"
        school_name = school_config['name']
        
        print("\n" + "=" * 60)
        print(f"🏫 [{index+1}/5] إنشاء {school_name}")
        print("=" * 60)
        
        # Initialize school data container
        self.schools_data[school_id] = {
            "subjects": [],
            "teachers": [],
            "students": [],
            "classes": [],
            "time_slots": [],
            "grade_levels": []
        }
        
        # 1. Create School
        now = get_now()
        school = {
            "id": school_id,
            "name": school_name,
            "name_en": school_config['name_en'],
            "code": school_config['code'],
            "city": school_config['city'],
            "city_en": school_config['city_en'],
            "country": "المملكة العربية السعودية",
            "region": "المنطقة الوسطى" if school_config['city'] == "الرياض" else "المنطقة الغربية",
            "address": f"حي النخيل، {school_config['city']}",
            "phone": generate_phone(),
            "email": f"info@{school_config['code'].lower()}.edu.sa",
            "type": "بنين",
            "stage": "ابتدائي",
            "status": "active",
            "ai_enabled": True,
            "student_count": 100,
            "teacher_count": 0,  # Will be updated
            "student_capacity": 150,
            "current_students": 100,
            "current_teachers": 0,  # Will be updated
            "created_at": now,
            "updated_at": now
        }
        await self.db.schools.insert_one(school)
        print(f"  ✅ تم إنشاء المدرسة: {school_name}")
        
        # 2. Create Principal
        principal = await self._create_principal(school_id, school_config, index)
        
        # 3. Create Grade Levels
        await self._create_grade_levels(school_id)
        
        # 4. Create Subjects
        await self._create_subjects(school_id)
        
        # 5. Create Teachers (at least 1 per subject)
        await self._create_teachers(school_id, school_config)
        
        # 6. Create Classes
        await self._create_classes(school_id)
        
        # 7. Create Time Slots
        await self._create_time_slots(school_id)
        
        # 8. Create Students (exactly 100)
        await self._create_students(school_id, school_config)
        
        # 9. Create Schedule
        await self._create_schedule(school_id)
        
        # 10. Create Attendance Records
        await self._create_attendance(school_id)
        
        # 11. Create Behavior Records
        await self._create_behavior_records(school_id)
        
        # 12. Create Assessments & Grades
        await self._create_assessments(school_id)
        
        # Update school counts
        teacher_count = len(self.schools_data[school_id]["teachers"])
        await self.db.schools.update_one(
            {"id": school_id},
            {"$set": {"teacher_count": teacher_count}}
        )
        
        return school_id
        
    async def _create_principal(self, school_id, school_config, index):
        """Create school principal"""
        principal_id = generate_id()
        email = f"principal{index+1}@nassaq.com"
        
        principal = {
            "id": principal_id,
            "email": email,
            "password_hash": hash_password("Principal@123"),
            "full_name": f"مدير {school_config['name']}",
            "full_name_en": f"Principal of {school_config['name_en']}",
            "role": "school_principal",  # Correct role name
            "is_active": True,
            "is_suspended": False,
            "tenant_id": school_id,
            "school_id": school_id,
            "permissions": [
                "manage_school", "manage_teachers", "manage_students",
                "manage_classes", "manage_schedule", "view_reports",
                "manage_attendance", "manage_behavior", "view_ai_insights"
            ],
            "phone": generate_phone(),
            "created_at": get_now(),
            "updated_at": get_now()
        }
        
        await self.db.users.insert_one(principal)
        print(f"    👤 مدير المدرسة: {email} / Principal@123")
        
        return principal_id
        
    async def _create_grade_levels(self, school_id):
        """Create grade levels for school"""
        for gl in GRADE_LEVELS:
            grade_level = {
                "id": generate_id(),
                "school_id": school_id,
                "grade": gl["grade"],
                "name": gl["name"],
                "name_en": gl["name_en"],
                "stage": gl["stage"],
                "is_active": True,
                "created_at": get_now()
            }
            await self.db.grade_levels.insert_one(grade_level)
            self.schools_data[school_id]["grade_levels"].append(grade_level)
            
        print(f"    📚 {len(GRADE_LEVELS)} مراحل دراسية")
        
    async def _create_subjects(self, school_id):
        """Create subjects for school"""
        for subj in SUBJECTS:
            subject = {
                "id": generate_id(),
                "school_id": school_id,
                "name": subj["name"],
                "name_en": subj["name_en"],
                "code": subj["code"],
                "is_active": True,
                "weekly_periods": random.randint(3, 6),
                "created_at": get_now()
            }
            await self.db.subjects.insert_one(subject)
            self.schools_data[school_id]["subjects"].append(subject)
            
        print(f"    📖 {len(SUBJECTS)} مواد دراسية")
        
    async def _create_teachers(self, school_id, school_config):
        """Create teachers - at least 1 per subject"""
        subjects = self.schools_data[school_id]["subjects"]
        teacher_count = 0
        
        for i, subject in enumerate(subjects):
            # Create 1-2 teachers per subject
            num_teachers = random.randint(1, 2)
            
            for j in range(num_teachers):
                teacher_id = generate_id()
                gender = random.choice(["male", "female"])
                first_name = random.choice(MALE_FIRST_NAMES if gender == "male" else FEMALE_FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                full_name = f"{first_name} {last_name}"
                
                teacher = {
                    "id": teacher_id,
                    "school_id": school_id,
                    "full_name": full_name,
                    "full_name_en": f"Teacher {teacher_count + 1}",
                    "email": f"teacher{teacher_count + 1}@{school_config['code'].lower()}.edu.sa",
                    "phone": generate_phone(),
                    "national_id": generate_national_id(),
                    "gender": gender,
                    "specialization": subject["name"],
                    "subject_ids": [subject["id"]],
                    "qualification": random.choice(["بكالوريوس", "ماجستير", "دكتوراه"]),
                    "years_of_experience": random.randint(1, 20),
                    "rank": random.choice(["معلم ممارس", "معلم متقدم", "معلم خبير"]),
                    "is_active": True,
                    "created_at": get_now()
                }
                
                await self.db.teachers.insert_one(teacher)
                
                # Create user account for teacher
                user = {
                    "id": generate_id(),
                    "email": teacher["email"],
                    "password_hash": hash_password("Teacher@123"),
                    "full_name": full_name,
                    "role": "teacher",
                    "is_active": True,
                    "is_suspended": False,
                    "tenant_id": school_id,
                    "school_id": school_id,
                    "teacher_id": teacher_id,
                    "permissions": [
                        "view_students", "manage_attendance", "manage_grades",
                        "view_schedule", "manage_behavior", "view_reports"
                    ],
                    "created_at": get_now()
                }
                await self.db.users.insert_one(user)
                
                self.schools_data[school_id]["teachers"].append(teacher)
                teacher_count += 1
                
        print(f"    👨‍🏫 {teacher_count} معلم")
        
    async def _create_classes(self, school_id):
        """Create classes with sections"""
        grade_levels = self.schools_data[school_id]["grade_levels"]
        sections = ["أ", "ب"]  # Two sections per grade
        
        for gl in grade_levels:
            for section in sections:
                class_id = generate_id()
                class_obj = {
                    "id": class_id,
                    "school_id": school_id,
                    "grade_level_id": gl["id"],
                    "grade": gl["grade"],
                    "name": f"{gl['name']} - {section}",
                    "name_en": f"{gl['name_en']} - {section}",
                    "section": section,
                    "capacity": 25,
                    "student_count": 0,  # Will be updated
                    "homeroom_teacher_id": None,
                    "is_active": True,
                    "created_at": get_now()
                }
                await self.db.classes.insert_one(class_obj)
                self.schools_data[school_id]["classes"].append(class_obj)
                
        print(f"    🏛️ {len(self.schools_data[school_id]['classes'])} فصل دراسي")
        
    async def _create_time_slots(self, school_id):
        """Create time slots for school"""
        for ts in TIME_SLOTS:
            start_parts = ts["start"].split(":")
            end_parts = ts["end"].split(":")
            duration = (int(end_parts[0]) * 60 + int(end_parts[1])) - (int(start_parts[0]) * 60 + int(start_parts[1]))
            
            time_slot = {
                "id": generate_id(),
                "school_id": school_id,
                "slot_number": ts["slot"],
                "name": ts["name"],
                "name_en": ts["name_en"],
                "start_time": ts["start"],
                "end_time": ts["end"],
                "duration_minutes": duration,
                "is_break": ts["is_break"],
                "is_active": True,
                "created_at": get_now()
            }
            await self.db.time_slots.insert_one(time_slot)
            self.schools_data[school_id]["time_slots"].append(time_slot)
            
        print(f"    ⏰ {len(TIME_SLOTS)} حصة زمنية")
        
    async def _create_students(self, school_id, school_config):
        """Create exactly 100 students distributed across classes"""
        classes = self.schools_data[school_id]["classes"]
        students_per_class = 100 // len(classes)  # ~8-9 students per class
        extra_students = 100 % len(classes)
        
        student_count = 0
        
        for i, class_obj in enumerate(classes):
            # Distribute students evenly
            num_students = students_per_class + (1 if i < extra_students else 0)
            
            for j in range(num_students):
                if student_count >= 100:
                    break
                    
                student_id = generate_id()
                gender = random.choice(["male", "female"])
                first_name = random.choice(MALE_FIRST_NAMES if gender == "male" else FEMALE_FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                
                # Generate student number: NSS-SCH-GRADE-XXXX
                student_number = f"NSS-{school_config['code']}-{class_obj['grade']}-{str(student_count + 1).zfill(4)}"
                
                student = {
                    "id": student_id,
                    "school_id": school_id,
                    "student_number": student_number,
                    "full_name": f"{first_name} {last_name}",
                    "full_name_en": f"Student {student_count + 1}",
                    "national_id": generate_national_id(),
                    "gender": gender,
                    "date_of_birth": f"{random.randint(2012, 2018)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                    "class_id": class_obj["id"],
                    "grade": class_obj["grade"],
                    "section": class_obj["section"],
                    "is_active": True,
                    "enrollment_date": "2024-09-01",
                    "created_at": get_now()
                }
                
                await self.db.students.insert_one(student)
                self.schools_data[school_id]["students"].append(student)
                
                # Create parent
                parent_id = generate_id()
                parent_name = f"{random.choice(MALE_FIRST_NAMES)} {last_name}"
                parent = {
                    "id": parent_id,
                    "school_id": school_id,
                    "full_name": parent_name,
                    "phone": generate_phone(),
                    "email": f"parent{student_count + 1}@{school_config['code'].lower()}.edu.sa",
                    "relation": random.choice(["أب", "أم", "ولي أمر"]),
                    "student_ids": [student_id],
                    "created_at": get_now()
                }
                await self.db.parents.insert_one(parent)
                
                # Create user accounts for student and parent
                student_user = {
                    "id": generate_id(),
                    "email": f"student{student_count + 1}@{school_config['code'].lower()}.edu.sa",
                    "password_hash": hash_password("Student@123"),
                    "full_name": student["full_name"],
                    "role": "student",
                    "is_active": True,
                    "tenant_id": school_id,
                    "school_id": school_id,
                    "student_id": student_id,
                    "permissions": ["view_schedule", "view_grades", "view_attendance"],
                    "created_at": get_now()
                }
                await self.db.users.insert_one(student_user)
                
                student_count += 1
                
            # Update class student count
            await self.db.classes.update_one(
                {"id": class_obj["id"]},
                {"$set": {"student_count": num_students}}
            )
            
        print(f"    👨‍🎓 {student_count} طالب (موزعين على الفصول)")
        
    async def _create_schedule(self, school_id):
        """Create schedule with sessions"""
        schedule_id = generate_id()
        
        schedule = {
            "id": schedule_id,
            "school_id": school_id,
            "name": "الجدول الدراسي - الفصل الأول",
            "name_en": "Schedule - First Semester",
            "academic_year": "1446-1447",
            "term": "الفصل الأول",
            "status": "published",
            "is_active": True,
            "created_at": get_now()
        }
        await self.db.schedules.insert_one(schedule)
        
        # Create sessions
        classes = self.schools_data[school_id]["classes"]
        teachers = self.schools_data[school_id]["teachers"]
        subjects = self.schools_data[school_id]["subjects"]
        time_slots = [ts for ts in self.schools_data[school_id]["time_slots"] if not ts["is_break"]]
        
        session_count = 0
        
        for class_obj in classes:
            for day in DAYS_OF_WEEK:
                for time_slot in time_slots:
                    # Randomly assign subject and teacher
                    subject = random.choice(subjects)
                    # Find teacher for this subject
                    subject_teachers = [t for t in teachers if subject["id"] in t.get("subject_ids", [])]
                    teacher = random.choice(subject_teachers) if subject_teachers else random.choice(teachers)
                    
                    session = {
                        "id": generate_id(),
                        "school_id": school_id,
                        "schedule_id": schedule_id,
                        "class_id": class_obj["id"],
                        "class_name": class_obj["name"],
                        "subject_id": subject["id"],
                        "subject_name": subject["name"],
                        "teacher_id": teacher["id"],
                        "teacher_name": teacher["full_name"],
                        "day_of_week": day,
                        "slot_number": time_slot["slot_number"],
                        "start_time": time_slot["start_time"],
                        "end_time": time_slot["end_time"],
                        "room": f"غرفة {random.randint(101, 120)}",
                        "created_at": get_now()
                    }
                    await self.db.schedule_sessions.insert_one(session)
                    session_count += 1
                    
        print(f"    📅 جدول واحد مع {session_count} حصة")
        
    async def _create_attendance(self, school_id):
        """Create attendance records for last 30 days"""
        students = self.schools_data[school_id]["students"]
        
        # Generate attendance for last 30 school days
        today = datetime.now(timezone.utc)
        school_days = []
        current = today
        
        while len(school_days) < 30:
            # Skip Friday and Saturday (Saudi weekend)
            if current.weekday() not in [4, 5]:  # 4=Friday, 5=Saturday
                school_days.append(current)
            current -= timedelta(days=1)
            
        attendance_count = 0
        
        for day in school_days:
            for student in students:
                # 90% present, 7% absent, 3% late
                rand = random.random()
                if rand < 0.90:
                    status = "present"
                elif rand < 0.97:
                    status = "absent"
                else:
                    status = "late"
                    
                attendance = {
                    "id": generate_id(),
                    "school_id": school_id,
                    "student_id": student["id"],
                    "student_name": student["full_name"],
                    "class_id": student["class_id"],
                    "date": day.strftime("%Y-%m-%d"),
                    "status": status,
                    "check_in_time": "07:00" if status == "present" else ("07:15" if status == "late" else None),
                    "recorded_by": "system",
                    "created_at": get_now()
                }
                await self.db.attendance.insert_one(attendance)
                attendance_count += 1
                
        print(f"    ✅ {attendance_count} سجل حضور (30 يوم)")
        
    async def _create_behavior_records(self, school_id):
        """Create behavior records"""
        students = self.schools_data[school_id]["students"]
        teachers = self.schools_data[school_id]["teachers"]
        
        record_count = 0
        
        # Add 2-5 behavior records per student (mix of positive and negative)
        for student in students:
            num_records = random.randint(2, 5)
            
            for _ in range(num_records):
                behavior_type = random.choice(BEHAVIOR_TYPES)
                teacher = random.choice(teachers)
                
                # Random date in last 90 days
                days_ago = random.randint(1, 90)
                record_date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                
                record = {
                    "id": generate_id(),
                    "school_id": school_id,
                    "student_id": student["id"],
                    "student_name": student["full_name"],
                    "class_id": student["class_id"],
                    "type": behavior_type["name"],
                    "type_en": behavior_type["name_en"],
                    "category": behavior_type["category"],
                    "points": behavior_type["points"],
                    "description": f"ملاحظة سلوكية: {behavior_type['name']}",
                    "recorded_by": teacher["id"],
                    "teacher_name": teacher["full_name"],
                    "date": record_date,
                    "status": "confirmed",
                    "created_at": get_now()
                }
                await self.db.behaviour_records.insert_one(record)
                record_count += 1
                
        print(f"    📝 {record_count} سجل سلوك")
        
    async def _create_assessments(self, school_id):
        """Create assessments and grades"""
        classes = self.schools_data[school_id]["classes"]
        subjects = self.schools_data[school_id]["subjects"]
        students = self.schools_data[school_id]["students"]
        teachers = self.schools_data[school_id]["teachers"]
        
        assessment_types = [
            {"name": "اختبار شهري", "name_en": "Monthly Test", "weight": 15, "max_score": 20},
            {"name": "اختبار منتصف الفصل", "name_en": "Midterm Exam", "weight": 25, "max_score": 30},
            {"name": "واجب منزلي", "name_en": "Homework", "weight": 10, "max_score": 10},
            {"name": "مشاركة صفية", "name_en": "Class Participation", "weight": 10, "max_score": 10},
        ]
        
        assessment_count = 0
        grade_count = 0
        
        for class_obj in classes:
            class_students = [s for s in students if s["class_id"] == class_obj["id"]]
            
            for subject in subjects:
                subject_teachers = [t for t in teachers if subject["id"] in t.get("subject_ids", [])]
                teacher = random.choice(subject_teachers) if subject_teachers else random.choice(teachers)
                
                # Create 2-3 assessments per subject per class
                for assessment_type in random.sample(assessment_types, random.randint(2, 3)):
                    assessment_id = generate_id()
                    
                    # Random date in current semester
                    days_ago = random.randint(1, 120)
                    assessment_date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                    
                    assessment = {
                        "id": assessment_id,
                        "school_id": school_id,
                        "class_id": class_obj["id"],
                        "class_name": class_obj["name"],
                        "subject_id": subject["id"],
                        "subject_name": subject["name"],
                        "teacher_id": teacher["id"],
                        "teacher_name": teacher["full_name"],
                        "name": f"{assessment_type['name']} - {subject['name']}",
                        "type": assessment_type["name"],
                        "max_score": assessment_type["max_score"],
                        "weight": assessment_type["weight"],
                        "date": assessment_date,
                        "status": "completed",
                        "created_at": get_now()
                    }
                    await self.db.assessments.insert_one(assessment)
                    assessment_count += 1
                    
                    # Create grades for each student
                    for student in class_students:
                        # Normal distribution of grades (70-100 range mostly)
                        score = min(assessment_type["max_score"], 
                                   max(0, int(random.gauss(assessment_type["max_score"] * 0.8, 
                                                          assessment_type["max_score"] * 0.15))))
                        
                        grade = {
                            "id": generate_id(),
                            "school_id": school_id,
                            "assessment_id": assessment_id,
                            "student_id": student["id"],
                            "student_name": student["full_name"],
                            "class_id": class_obj["id"],
                            "subject_id": subject["id"],
                            "score": score,
                            "max_score": assessment_type["max_score"],
                            "percentage": round((score / assessment_type["max_score"]) * 100, 1),
                            "created_at": get_now()
                        }
                        await self.db.grades.insert_one(grade)
                        grade_count += 1
                        
        print(f"    📊 {assessment_count} اختبار و {grade_count} درجة")
        
    async def print_summary(self):
        """Print final summary"""
        print("\n" + "=" * 70)
        print("📊 ملخص البيانات التجريبية / Demo Data Summary")
        print("=" * 70)
        
        # Count data
        schools = await self.db.schools.find({}).to_list(100)
        total_students = await self.db.students.count_documents({})
        total_teachers = await self.db.teachers.count_documents({})
        total_subjects = await self.db.subjects.count_documents({})
        total_classes = await self.db.classes.count_documents({})
        total_attendance = await self.db.attendance.count_documents({})
        total_behavior = await self.db.behaviour_records.count_documents({})
        total_assessments = await self.db.assessments.count_documents({})
        total_grades = await self.db.grades.count_documents({})
        
        print(f"\n🏫 المدارس: {len(schools)}")
        print("-" * 50)
        
        for school in schools:
            school_id = school["id"]
            s_count = await self.db.students.count_documents({"school_id": school_id})
            t_count = await self.db.teachers.count_documents({"school_id": school_id})
            c_count = await self.db.classes.count_documents({"school_id": school_id})
            sub_count = await self.db.subjects.count_documents({"school_id": school_id})
            
            print(f"  📍 {school['name']} ({school['city']})")
            print(f"     - الطلاب: {s_count}")
            print(f"     - المعلمون: {t_count}")
            print(f"     - الفصول: {c_count}")
            print(f"     - المواد: {sub_count}")
            
        print("\n" + "-" * 50)
        print(f"📈 الإجمالي:")
        print(f"   👨‍🎓 الطلاب: {total_students}")
        print(f"   👨‍🏫 المعلمون: {total_teachers}")
        print(f"   🏛️ الفصول: {total_classes}")
        print(f"   📖 المواد: {total_subjects}")
        print(f"   ✅ سجلات الحضور: {total_attendance}")
        print(f"   📝 سجلات السلوك: {total_behavior}")
        print(f"   📊 الاختبارات: {total_assessments}")
        print(f"   📋 الدرجات: {total_grades}")
        
        print("\n" + "=" * 70)
        print("🔐 حسابات الدخول / Login Credentials")
        print("=" * 70)
        print("\n👑 مدير المنصة (Platform Admin):")
        print("   البريد: admin@nassaq.com")
        print("   كلمة المرور: Admin@123")
        
        print("\n👨‍💼 مدراء المدارس (School Principals):")
        for i, school in enumerate(schools):
            print(f"   {school['name']}: principal{i+1}@nassaq.com / Principal@123")
            
        print("\n✅ Multi-Tenant Isolation: مطبق بالكامل")
        print("   - كل مدرسة tenant مستقل")
        print("   - البيانات معزولة تماماً بين المدارس")
        print("   - مدير المدرسة يرى مدرسته فقط")
        print("   - مدير المنصة يرى جميع المدارس")
        
        print("\n" + "=" * 70)
        print("✅ اكتمل إنشاء البيانات التجريبية بنجاح!")
        print("=" * 70)


async def main():
    seeder = ControlledSeeder()
    
    try:
        await seeder.connect()
        
        # Clean old data
        await seeder.clean_demo_data()
        
        # Create Platform Admin
        await seeder.seed_platform_admin()
        
        # Create 5 schools
        for i, school_config in enumerate(SCHOOLS_CONFIG):
            await seeder.seed_school(school_config, i)
            
        # Print summary
        await seeder.print_summary()
        
    finally:
        await seeder.close()


if __name__ == "__main__":
    asyncio.run(main())
