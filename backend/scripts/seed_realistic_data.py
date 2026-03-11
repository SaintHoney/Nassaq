#!/usr/bin/env python3
"""
NASSAQ - سكريبت البيانات الواقعية الشامل
=========================================
إنشاء بيانات واقعية متكاملة لـ 5 مدارس حسب متطلبات المستخدم

كل مدرسة تحتوي على:
- 1 مدير مدرسة (School Principal)
- 1 نائب مدير (School Sub Admin)
- 25 فصل دراسي (موزعة على 6 مراحل)
- 25 معلم
- 100 طالب
- جداول حصص واقعية
- سجلات حضور
- سجلات سلوك
- تقييمات ودرجات
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
# المدارس الخمس المطلوبة
# =============================================================================
SCHOOLS_CONFIG = [
    {
        "name": "مدرسة النور",
        "name_en": "Al-Noor School",
        "code": "NOR",
        "city": "الرياض",
        "city_en": "Riyadh",
        "region": "المنطقة الوسطى",
        "email_domain": "nor.edu.sa"
    },
    {
        "name": "مدرسة الأمل",
        "name_en": "Al-Amal School",
        "code": "AML",
        "city": "جدة",
        "city_en": "Jeddah",
        "region": "المنطقة الغربية",
        "email_domain": "aml.edu.sa"
    },
    {
        "name": "مدرسة المستقبل",
        "name_en": "Al-Mustaqbal School",
        "code": "MST",
        "city": "الدمام",
        "city_en": "Dammam",
        "region": "المنطقة الشرقية",
        "email_domain": "mst.edu.sa"
    },
    {
        "name": "مدرسة الرواد",
        "name_en": "Al-Rowad School",
        "code": "RWD",
        "city": "مكة المكرمة",
        "city_en": "Makkah",
        "region": "المنطقة الغربية",
        "email_domain": "rwd.edu.sa"
    },
    {
        "name": "مدرسة الإبداع",
        "name_en": "Al-Ibda School",
        "code": "IBD",
        "city": "المدينة المنورة",
        "city_en": "Madinah",
        "region": "المنطقة الغربية",
        "email_domain": "ibd.edu.sa"
    },
]

# المواد الدراسية السعودية
SUBJECTS = [
    {"name": "اللغة العربية", "name_en": "Arabic Language", "code": "ARB", "weekly_periods": 5},
    {"name": "الرياضيات", "name_en": "Mathematics", "code": "MTH", "weekly_periods": 5},
    {"name": "العلوم", "name_en": "Science", "code": "SCI", "weekly_periods": 4},
    {"name": "اللغة الإنجليزية", "name_en": "English Language", "code": "ENG", "weekly_periods": 4},
    {"name": "الدراسات الإسلامية", "name_en": "Islamic Studies", "code": "ISL", "weekly_periods": 4},
    {"name": "الدراسات الاجتماعية", "name_en": "Social Studies", "code": "SOC", "weekly_periods": 2},
    {"name": "الحاسب الآلي", "name_en": "Computer Science", "code": "CMP", "weekly_periods": 2},
    {"name": "التربية الفنية", "name_en": "Art Education", "code": "ART", "weekly_periods": 2},
    {"name": "التربية البدنية", "name_en": "Physical Education", "code": "PHY", "weekly_periods": 2},
    {"name": "المهارات الحياتية", "name_en": "Life Skills", "code": "LFS", "weekly_periods": 1},
]

# الصفوف الدراسية
GRADE_LEVELS = [
    {"grade": 1, "name": "الصف الأول", "name_en": "Grade 1", "stage": "ابتدائي", "sections_count": 4},
    {"grade": 2, "name": "الصف الثاني", "name_en": "Grade 2", "stage": "ابتدائي", "sections_count": 4},
    {"grade": 3, "name": "الصف الثالث", "name_en": "Grade 3", "stage": "ابتدائي", "sections_count": 4},
    {"grade": 4, "name": "الصف الرابع", "name_en": "Grade 4", "stage": "ابتدائي", "sections_count": 4},
    {"grade": 5, "name": "الصف الخامس", "name_en": "Grade 5", "stage": "ابتدائي", "sections_count": 5},
    {"grade": 6, "name": "الصف السادس", "name_en": "Grade 6", "stage": "ابتدائي", "sections_count": 4},
]

# الحصص الزمنية
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
SECTIONS = ["أ", "ب", "ج", "د", "هـ"]

# الأسماء العربية الواقعية
MALE_FIRST_NAMES = [
    "محمد", "أحمد", "عبدالله", "عبدالرحمن", "فيصل", "سلطان", "خالد", "سعود", "ناصر", "تركي",
    "سعد", "عمر", "يوسف", "إبراهيم", "عبدالعزيز", "بندر", "فهد", "عبدالمجيد", "طلال", "ماجد",
    "راشد", "سالم", "حمد", "مشاري", "نايف", "وليد", "عادل", "سامي", "هاني", "زياد",
    "عبدالملك", "منصور", "بدر", "سلمان", "عبدالكريم", "حسن", "حسين", "علي", "جاسم", "صالح",
    "عبدالمحسن", "فارس", "مازن", "رائد", "أيمن", "باسل", "جمال", "رامي", "هيثم", "كريم"
]

FEMALE_FIRST_NAMES = [
    "نورة", "سارة", "فاطمة", "عائشة", "منال", "هند", "ريم", "دانة", "لمياء", "أمل",
    "مها", "نوف", "هيا", "جواهر", "لولوة", "العنود", "البندري", "شيخة", "موضي", "نوال",
    "لطيفة", "مريم", "رقية", "خديجة", "زينب", "سمية", "عبير", "هدى", "رنا", "لينا",
    "ياسمين", "رهف", "غادة", "سلمى", "روان", "جنى", "لجين", "تالا", "حلا", "رزان"
]

LAST_NAMES = [
    "القحطاني", "العتيبي", "الدوسري", "الشمري", "المطيري", "الحربي", "الغامدي", "الزهراني",
    "السبيعي", "العمري", "البلوي", "الشهري", "السهلي", "الجهني", "المالكي", "القرني",
    "الأسمري", "الخالدي", "التميمي", "الرشيدي", "العنزي", "الحارثي", "الشريف", "الهاشمي",
    "السلمي", "الثقفي", "الفيفي", "النعيمي", "الكعبي", "البقمي", "الخثعمي", "الأحمدي",
    "المحمدي", "العمراني", "الصقري", "النجدي", "الحجازي", "اليامي", "الوادعي", "الشعلان"
]

# أنواع السلوك
BEHAVIOR_TYPES = [
    {"name": "تميز أكاديمي", "name_en": "Academic Excellence", "category": "positive", "points": 5},
    {"name": "مشاركة فعالة", "name_en": "Active Participation", "category": "positive", "points": 3},
    {"name": "سلوك مثالي", "name_en": "Exemplary Behavior", "category": "positive", "points": 4},
    {"name": "مساعدة الزملاء", "name_en": "Helping Peers", "category": "positive", "points": 3},
    {"name": "إنجاز متميز", "name_en": "Outstanding Achievement", "category": "positive", "points": 5},
    {"name": "التزام بالنظام", "name_en": "Rule Compliance", "category": "positive", "points": 2},
    {"name": "تأخر عن الحصة", "name_en": "Late to Class", "category": "negative", "points": -2},
    {"name": "عدم إحضار الواجب", "name_en": "Missing Homework", "category": "negative", "points": -3},
    {"name": "سلوك غير لائق", "name_en": "Inappropriate Behavior", "category": "negative", "points": -4},
    {"name": "إزعاج في الفصل", "name_en": "Classroom Disruption", "category": "negative", "points": -2},
]


def hash_password(password: str) -> str:
    """تشفير كلمة المرور"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def generate_id():
    return str(uuid.uuid4())


def generate_phone():
    return f"05{random.randint(10000000, 99999999)}"


def generate_national_id():
    return f"1{random.randint(100000000, 999999999)}"


def get_now():
    return datetime.now(timezone.utc).isoformat()


class RealisticDataSeeder:
    def __init__(self):
        self.client = None
        self.db = None
        self.schools_data = {}
        
    async def connect(self):
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'test_database')
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        print(f"✅ متصل بقاعدة البيانات: {db_name}")
        
    async def close(self):
        if self.client:
            self.client.close()
            
    async def clean_all_data(self):
        """حذف جميع البيانات القديمة"""
        print("\n" + "=" * 70)
        print("🧹 تنظيف قاعدة البيانات...")
        print("=" * 70)
        
        collections = [
            'schools', 'users', 'students', 'teachers', 'subjects',
            'classes', 'schedules', 'schedule_sessions', 'time_slots',
            'attendance', 'behaviour_records', 'assessments', 'grades',
            'parents', 'academic_years', 'terms', 'grade_levels',
            'teacher_assignments', 'notifications', 'roles',
            'demo_schools', 'demo_students', 'demo_teachers', 'demo_classes'
        ]
        
        for coll in collections:
            try:
                result = await self.db[coll].delete_many({})
                if result.deleted_count > 0:
                    print(f"  🗑️ {coll}: حُذف {result.deleted_count} سجل")
            except Exception as e:
                pass
                
        print("✅ تم تنظيف قاعدة البيانات")
        
    async def seed_platform_admin(self):
        """إنشاء حساب مدير المنصة"""
        print("\n" + "=" * 70)
        print("👑 إنشاء حساب مدير المنصة")
        print("=" * 70)
        
        admin = {
            "id": generate_id(),
            "email": "admin@nassaq.com",
            "password_hash": hash_password("Admin@123"),
            "full_name": "مدير منصة نَسَّق",
            "full_name_en": "NASSAQ Platform Admin",
            "role": "platform_admin",
            "is_active": True,
            "is_suspended": False,
            "tenant_id": None,
            "permissions": [
                "manage_schools", "manage_users", "manage_settings",
                "view_analytics", "manage_integrations", "manage_rules",
                "view_audit_logs", "manage_api_keys", "manage_tenants",
                "view_all_data", "system_admin"
            ],
            "preferred_language": "ar",
            "preferred_theme": "light",
            "created_at": get_now(),
            "updated_at": get_now()
        }
        
        await self.db.users.insert_one(admin)
        print(f"  ✅ admin@nassaq.com / Admin@123")
        
    async def seed_school(self, config: dict, index: int):
        """إنشاء مدرسة كاملة مع جميع البيانات"""
        school_id = f"school-{config['code'].lower()}-{str(index + 1).zfill(3)}"
        
        print("\n" + "=" * 70)
        print(f"🏫 [{index + 1}/5] إنشاء {config['name']}")
        print("=" * 70)
        
        self.schools_data[school_id] = {
            "subjects": [],
            "teachers": [],
            "students": [],
            "classes": [],
            "time_slots": [],
            "grade_levels": [],
            "config": config
        }
        
        # 1. إنشاء المدرسة
        school = {
            "id": school_id,
            "name": config['name'],
            "name_en": config['name_en'],
            "code": config['code'],
            "city": config['city'],
            "city_en": config['city_en'],
            "region": config['region'],
            "country": "المملكة العربية السعودية",
            "address": f"حي النخيل، {config['city']}",
            "phone": generate_phone(),
            "email": f"info@{config['email_domain']}",
            "type": "بنين",
            "stage": "ابتدائي",
            "status": "active",
            "ai_enabled": True,
            "student_count": 100,
            "teacher_count": 25,
            "student_capacity": 150,
            "current_students": 100,
            "current_teachers": 25,
            "created_at": get_now(),
            "updated_at": get_now()
        }
        await self.db.schools.insert_one(school)
        print(f"  ✅ المدرسة: {config['name']}")
        
        # 2. إنشاء مدير المدرسة
        await self._create_school_admin(school_id, config, index, "school_principal")
        
        # 3. إنشاء نائب مدير المدرسة
        await self._create_school_admin(school_id, config, index, "school_sub_admin")
        
        # 4. إنشاء الصفوف الدراسية
        await self._create_grade_levels(school_id)
        
        # 5. إنشاء المواد الدراسية
        await self._create_subjects(school_id)
        
        # 6. إنشاء الفصول (25 فصل)
        await self._create_classes(school_id)
        
        # 7. إنشاء الحصص الزمنية
        await self._create_time_slots(school_id)
        
        # 8. إنشاء المعلمين (25 معلم)
        await self._create_teachers(school_id, config)
        
        # 9. إنشاء الطلاب (100 طالب)
        await self._create_students(school_id, config)
        
        # 10. تعيين المعلمين للفصول
        await self._assign_teachers_to_classes(school_id)
        
        # 11. إنشاء الجدول الدراسي
        await self._create_schedule(school_id)
        
        # 12. إنشاء سجلات الحضور
        await self._create_attendance_records(school_id)
        
        # 13. إنشاء سجلات السلوك
        await self._create_behavior_records(school_id)
        
        # 14. إنشاء التقييمات والدرجات
        await self._create_assessments(school_id)
        
        return school_id
        
    async def _create_school_admin(self, school_id: str, config: dict, index: int, role: str):
        """إنشاء مدير أو نائب مدير"""
        admin_id = generate_id()
        
        if role == "school_principal":
            email = f"principal{index + 1}@nassaq.com"
            name = f"مدير {config['name']}"
            name_en = f"Principal of {config['name_en']}"
            password = "Principal@123"
        else:
            email = f"subadmin{index + 1}@nassaq.com"
            name = f"نائب مدير {config['name']}"
            name_en = f"Sub Admin of {config['name_en']}"
            password = "SubAdmin@123"
            
        admin = {
            "id": admin_id,
            "email": email,
            "password_hash": hash_password(password),
            "full_name": name,
            "full_name_en": name_en,
            "role": role,
            "is_active": True,
            "is_suspended": False,
            "tenant_id": school_id,
            "school_id": school_id,
            "phone": generate_phone(),
            "permissions": [
                "manage_school", "manage_teachers", "manage_students",
                "manage_classes", "manage_schedule", "view_reports",
                "manage_attendance", "manage_behavior", "view_ai_insights"
            ],
            "preferred_language": "ar",
            "preferred_theme": "light",
            "created_at": get_now(),
            "updated_at": get_now()
        }
        
        await self.db.users.insert_one(admin)
        role_label = "مدير المدرسة" if role == "school_principal" else "نائب المدير"
        print(f"    👤 {role_label}: {email} / {password}")
        
    async def _create_grade_levels(self, school_id: str):
        """إنشاء الصفوف الدراسية"""
        for gl in GRADE_LEVELS:
            grade_level = {
                "id": generate_id(),
                "school_id": school_id,
                "grade": gl["grade"],
                "name": gl["name"],
                "name_en": gl["name_en"],
                "stage": gl["stage"],
                "sections_count": gl["sections_count"],
                "is_active": True,
                "created_at": get_now()
            }
            await self.db.grade_levels.insert_one(grade_level)
            self.schools_data[school_id]["grade_levels"].append(grade_level)
            
        print(f"    📚 {len(GRADE_LEVELS)} مرحلة دراسية")
        
    async def _create_subjects(self, school_id: str):
        """إنشاء المواد الدراسية"""
        for subj in SUBJECTS:
            subject = {
                "id": generate_id(),
                "school_id": school_id,
                "name": subj["name"],
                "name_en": subj["name_en"],
                "code": subj["code"],
                "weekly_periods": subj["weekly_periods"],
                "is_active": True,
                "created_at": get_now()
            }
            await self.db.subjects.insert_one(subject)
            self.schools_data[school_id]["subjects"].append(subject)
            
        print(f"    📖 {len(SUBJECTS)} مادة دراسية")
        
    async def _create_classes(self, school_id: str):
        """إنشاء 25 فصل دراسي"""
        grade_levels = self.schools_data[school_id]["grade_levels"]
        class_count = 0
        
        for gl in grade_levels:
            sections_count = gl["sections_count"]
            
            for i in range(sections_count):
                if class_count >= 25:
                    break
                    
                section = SECTIONS[i]
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
                    "student_count": 0,
                    "homeroom_teacher_id": None,
                    "is_active": True,
                    "created_at": get_now()
                }
                await self.db.classes.insert_one(class_obj)
                self.schools_data[school_id]["classes"].append(class_obj)
                class_count += 1
                
            if class_count >= 25:
                break
                
        print(f"    🏛️ {class_count} فصل دراسي")
        
    async def _create_time_slots(self, school_id: str):
        """إنشاء الحصص الزمنية"""
        for ts in TIME_SLOTS:
            time_slot = {
                "id": generate_id(),
                "school_id": school_id,
                "slot_number": ts["slot"],
                "name": ts["name"],
                "name_en": ts["name_en"],
                "start_time": ts["start"],
                "end_time": ts["end"],
                "is_break": ts["is_break"],
                "is_active": True,
                "created_at": get_now()
            }
            await self.db.time_slots.insert_one(time_slot)
            self.schools_data[school_id]["time_slots"].append(time_slot)
            
        print(f"    ⏰ {len(TIME_SLOTS)} حصة زمنية")
        
    async def _create_teachers(self, school_id: str, config: dict):
        """إنشاء 25 معلم"""
        subjects = self.schools_data[school_id]["subjects"]
        
        for i in range(25):
            teacher_id = generate_id()
            gender = random.choice(["male", "female"])
            first_name = random.choice(MALE_FIRST_NAMES if gender == "male" else FEMALE_FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            full_name = f"{first_name} {last_name}"
            
            # توزيع المعلمين على المواد
            subject_index = i % len(subjects)
            subject = subjects[subject_index]
            
            teacher = {
                "id": teacher_id,
                "school_id": school_id,
                "full_name": full_name,
                "full_name_en": f"Teacher {i + 1}",
                "email": f"teacher{i + 1}@{config['email_domain']}",
                "phone": generate_phone(),
                "national_id": generate_national_id(),
                "gender": gender,
                "specialization": subject["name"],
                "subject_ids": [subject["id"]],
                "qualification": random.choice(["بكالوريوس", "ماجستير", "دكتوراه"]),
                "years_of_experience": random.randint(1, 25),
                "rank": random.choice(["معلم ممارس", "معلم متقدم", "معلم خبير"]),
                "is_active": True,
                "created_at": get_now()
            }
            await self.db.teachers.insert_one(teacher)
            self.schools_data[school_id]["teachers"].append(teacher)
            
            # إنشاء حساب المستخدم للمعلم
            user = {
                "id": generate_id(),
                "email": teacher["email"],
                "password_hash": hash_password("Teacher@123"),
                "full_name": full_name,
                "full_name_en": f"Teacher {i + 1}",
                "role": "teacher",
                "is_active": True,
                "is_suspended": False,
                "tenant_id": school_id,
                "school_id": school_id,
                "teacher_id": teacher_id,
                "phone": teacher["phone"],
                "permissions": [
                    "view_students", "manage_attendance", "manage_grades",
                    "view_schedule", "manage_behavior", "view_reports"
                ],
                "preferred_language": "ar",
                "preferred_theme": "light",
                "created_at": get_now(),
                "updated_at": get_now()
            }
            await self.db.users.insert_one(user)
            
        print(f"    👨‍🏫 25 معلم (كلمة المرور: Teacher@123)")
        
    async def _create_students(self, school_id: str, config: dict):
        """إنشاء 100 طالب"""
        classes = self.schools_data[school_id]["classes"]
        students_per_class = 100 // len(classes)  # 4 طلاب لكل فصل
        extra = 100 % len(classes)
        
        student_number = 1
        
        for i, class_obj in enumerate(classes):
            num_students = students_per_class + (1 if i < extra else 0)
            
            for j in range(num_students):
                if student_number > 100:
                    break
                    
                student_id = generate_id()
                gender = random.choice(["male", "female"])
                first_name = random.choice(MALE_FIRST_NAMES if gender == "male" else FEMALE_FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                full_name = f"{first_name} {last_name}"
                
                # رقم الطالب: NSS-CODE-GRADE-XXXX
                student_code = f"NSS-{config['code']}-{class_obj['grade']}-{str(student_number).zfill(4)}"
                
                birth_year = 2024 - (5 + class_obj['grade'])  # العمر حسب الصف
                
                student = {
                    "id": student_id,
                    "school_id": school_id,
                    "student_number": student_code,
                    "full_name": full_name,
                    "full_name_en": f"Student {student_number}",
                    "national_id": generate_national_id(),
                    "gender": gender,
                    "date_of_birth": f"{birth_year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                    "class_id": class_obj["id"],
                    "grade": class_obj["grade"],
                    "section": class_obj["section"],
                    "is_active": True,
                    "enrollment_date": "2024-09-01",
                    "created_at": get_now()
                }
                await self.db.students.insert_one(student)
                self.schools_data[school_id]["students"].append(student)
                
                # إنشاء ولي الأمر
                parent_id = generate_id()
                parent_name = f"{random.choice(MALE_FIRST_NAMES)} {last_name}"
                parent = {
                    "id": parent_id,
                    "school_id": school_id,
                    "full_name": parent_name,
                    "phone": generate_phone(),
                    "email": f"parent{student_number}@{config['email_domain']}",
                    "relation": random.choice(["أب", "أم", "ولي أمر"]),
                    "student_ids": [student_id],
                    "created_at": get_now()
                }
                await self.db.parents.insert_one(parent)
                
                # حساب الطالب
                student_user = {
                    "id": generate_id(),
                    "email": f"student{student_number}@{config['email_domain']}",
                    "password_hash": hash_password("Student@123"),
                    "full_name": full_name,
                    "full_name_en": f"Student {student_number}",
                    "role": "student",
                    "is_active": True,
                    "is_suspended": False,
                    "tenant_id": school_id,
                    "school_id": school_id,
                    "student_id": student_id,
                    "permissions": ["view_schedule", "view_grades", "view_attendance"],
                    "preferred_language": "ar",
                    "preferred_theme": "light",
                    "created_at": get_now(),
                    "updated_at": get_now()
                }
                await self.db.users.insert_one(student_user)
                
                # حساب ولي الأمر
                parent_user = {
                    "id": generate_id(),
                    "email": f"parent{student_number}@{config['email_domain']}",
                    "password_hash": hash_password("Parent@123"),
                    "full_name": parent_name,
                    "role": "parent",
                    "is_active": True,
                    "is_suspended": False,
                    "tenant_id": school_id,
                    "school_id": school_id,
                    "parent_id": parent_id,
                    "student_ids": [student_id],
                    "permissions": ["view_child_data", "view_grades", "view_attendance"],
                    "preferred_language": "ar",
                    "preferred_theme": "light",
                    "created_at": get_now(),
                    "updated_at": get_now()
                }
                await self.db.users.insert_one(parent_user)
                
                student_number += 1
                
            # تحديث عدد الطلاب في الفصل
            await self.db.classes.update_one(
                {"id": class_obj["id"]},
                {"$set": {"student_count": num_students}}
            )
            
        print(f"    👨‍🎓 100 طالب (كلمة المرور: Student@123)")
        print(f"    👨‍👩‍👧 100 ولي أمر (كلمة المرور: Parent@123)")
        
    async def _assign_teachers_to_classes(self, school_id: str):
        """تعيين المعلمين كمعلمي فصول"""
        classes = self.schools_data[school_id]["classes"]
        teachers = self.schools_data[school_id]["teachers"]
        
        for i, class_obj in enumerate(classes):
            teacher = teachers[i % len(teachers)]
            await self.db.classes.update_one(
                {"id": class_obj["id"]},
                {"$set": {"homeroom_teacher_id": teacher["id"]}}
            )
            class_obj["homeroom_teacher_id"] = teacher["id"]
            
    async def _create_schedule(self, school_id: str):
        """إنشاء الجدول الدراسي"""
        schedule_id = generate_id()
        
        schedule = {
            "id": schedule_id,
            "school_id": school_id,
            "name": "الجدول الدراسي - الفصل الأول 1446",
            "name_en": "Schedule - First Semester 1446",
            "academic_year": "1446-1447",
            "term": "الفصل الأول",
            "status": "published",
            "is_active": True,
            "created_at": get_now()
        }
        await self.db.schedules.insert_one(schedule)
        
        classes = self.schools_data[school_id]["classes"]
        teachers = self.schools_data[school_id]["teachers"]
        subjects = self.schools_data[school_id]["subjects"]
        time_slots = [ts for ts in self.schools_data[school_id]["time_slots"] if not ts["is_break"]]
        
        session_count = 0
        
        for class_obj in classes:
            for day in DAYS_OF_WEEK:
                for time_slot in time_slots:
                    subject = random.choice(subjects)
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
                        "day": day,
                        "time_slot_id": time_slot["id"],
                        "time_slot_name": time_slot["name"],
                        "slot_number": time_slot["slot_number"],
                        "start_time": time_slot["start_time"],
                        "end_time": time_slot["end_time"],
                        "room": f"غرفة {random.randint(101, 130)}",
                        "status": "active",
                        "created_at": get_now()
                    }
                    await self.db.schedule_sessions.insert_one(session)
                    session_count += 1
                    
        print(f"    📅 {session_count} حصة في الجدول")
        
    async def _create_attendance_records(self, school_id: str):
        """إنشاء سجلات الحضور (آخر 30 يوم)"""
        students = self.schools_data[school_id]["students"]
        teachers = self.schools_data[school_id]["teachers"]
        
        today = datetime.now(timezone.utc)
        school_days = []
        current = today
        
        while len(school_days) < 30:
            if current.weekday() not in [4, 5]:  # تخطي الجمعة والسبت
                school_days.append(current)
            current -= timedelta(days=1)
            
        attendance_count = 0
        
        # سجلات حضور الطلاب
        for day in school_days:
            for student in students:
                rand = random.random()
                if rand < 0.92:
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
                    "type": "student",
                    "created_at": get_now()
                }
                await self.db.attendance.insert_one(attendance)
                attendance_count += 1
                
        # سجلات حضور المعلمين
        for day in school_days:
            for teacher in teachers:
                rand = random.random()
                if rand < 0.95:
                    status = "present"
                elif rand < 0.98:
                    status = "absent"
                else:
                    status = "late"
                    
                attendance = {
                    "id": generate_id(),
                    "school_id": school_id,
                    "teacher_id": teacher["id"],
                    "teacher_name": teacher["full_name"],
                    "date": day.strftime("%Y-%m-%d"),
                    "status": status,
                    "check_in_time": "06:45" if status == "present" else ("07:05" if status == "late" else None),
                    "recorded_by": "system",
                    "type": "teacher",
                    "created_at": get_now()
                }
                await self.db.attendance.insert_one(attendance)
                attendance_count += 1
                
        print(f"    ✅ {attendance_count} سجل حضور")
        
    async def _create_behavior_records(self, school_id: str):
        """إنشاء سجلات السلوك"""
        students = self.schools_data[school_id]["students"]
        teachers = self.schools_data[school_id]["teachers"]
        
        record_count = 0
        
        for student in students:
            num_records = random.randint(1, 5)
            
            for _ in range(num_records):
                behavior_type = random.choice(BEHAVIOR_TYPES)
                teacher = random.choice(teachers)
                days_ago = random.randint(1, 90)
                
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
                    "description": f"ملاحظة: {behavior_type['name']}",
                    "recorded_by": teacher["id"],
                    "teacher_name": teacher["full_name"],
                    "date": (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime("%Y-%m-%d"),
                    "status": "confirmed",
                    "created_at": get_now()
                }
                await self.db.behaviour_records.insert_one(record)
                record_count += 1
                
        print(f"    📝 {record_count} سجل سلوك")
        
    async def _create_assessments(self, school_id: str):
        """إنشاء التقييمات والدرجات"""
        classes = self.schools_data[school_id]["classes"]
        subjects = self.schools_data[school_id]["subjects"]
        students = self.schools_data[school_id]["students"]
        teachers = self.schools_data[school_id]["teachers"]
        
        assessment_types = [
            {"name": "اختبار شهري", "weight": 15, "max_score": 20},
            {"name": "اختبار منتصف الفصل", "weight": 25, "max_score": 30},
            {"name": "واجب منزلي", "weight": 10, "max_score": 10},
            {"name": "مشاركة صفية", "weight": 10, "max_score": 10},
        ]
        
        assessment_count = 0
        grade_count = 0
        
        for class_obj in classes:
            class_students = [s for s in students if s["class_id"] == class_obj["id"]]
            
            for subject in subjects:
                subject_teachers = [t for t in teachers if subject["id"] in t.get("subject_ids", [])]
                teacher = random.choice(subject_teachers) if subject_teachers else random.choice(teachers)
                
                for assessment_type in random.sample(assessment_types, 2):
                    assessment_id = generate_id()
                    days_ago = random.randint(1, 90)
                    
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
                        "date": (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime("%Y-%m-%d"),
                        "status": "completed",
                        "created_at": get_now()
                    }
                    await self.db.assessments.insert_one(assessment)
                    assessment_count += 1
                    
                    for student in class_students:
                        score = min(assessment_type["max_score"], 
                                   max(0, int(random.gauss(assessment_type["max_score"] * 0.75, 
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
                        
        print(f"    📊 {assessment_count} تقييم و {grade_count} درجة")
        
    async def print_summary(self):
        """طباعة الملخص النهائي"""
        print("\n" + "=" * 80)
        print("📊 ملخص البيانات الواقعية")
        print("=" * 80)
        
        schools = await self.db.schools.find({}).to_list(100)
        total_students = await self.db.students.count_documents({})
        total_teachers = await self.db.teachers.count_documents({})
        total_classes = await self.db.classes.count_documents({})
        total_subjects = await self.db.subjects.count_documents({})
        total_users = await self.db.users.count_documents({})
        total_attendance = await self.db.attendance.count_documents({})
        total_behavior = await self.db.behaviour_records.count_documents({})
        total_assessments = await self.db.assessments.count_documents({})
        total_grades = await self.db.grades.count_documents({})
        
        print(f"\n🏫 المدارس: {len(schools)}")
        print("-" * 60)
        
        for school in schools:
            school_id = school["id"]
            s_count = await self.db.students.count_documents({"school_id": school_id})
            t_count = await self.db.teachers.count_documents({"school_id": school_id})
            c_count = await self.db.classes.count_documents({"school_id": school_id})
            
            print(f"  📍 {school['name']} ({school['city']})")
            print(f"     الطلاب: {s_count} | المعلمون: {t_count} | الفصول: {c_count}")
            
        print("\n" + "-" * 60)
        print("📈 الإحصائيات الإجمالية:")
        print(f"   🏫 المدارس: {len(schools)}")
        print(f"   👨‍🎓 الطلاب: {total_students}")
        print(f"   👨‍🏫 المعلمون: {total_teachers}")
        print(f"   🏛️ الفصول: {total_classes}")
        print(f"   📖 المواد: {total_subjects}")
        print(f"   👥 المستخدمون: {total_users}")
        print(f"   ✅ سجلات الحضور: {total_attendance}")
        print(f"   📝 سجلات السلوك: {total_behavior}")
        print(f"   📊 التقييمات: {total_assessments}")
        print(f"   📋 الدرجات: {total_grades}")
        
        print("\n" + "=" * 80)
        print("🔐 بيانات الدخول للاختبار")
        print("=" * 80)
        
        print("\n👑 مدير المنصة:")
        print("   admin@nassaq.com / Admin@123")
        
        print("\n👨‍💼 مدراء المدارس:")
        for i, school in enumerate(schools):
            print(f"   {school['name']}: principal{i+1}@nassaq.com / Principal@123")
            
        print("\n👨‍💼 نواب المدراء:")
        for i, school in enumerate(schools):
            print(f"   {school['name']}: subadmin{i+1}@nassaq.com / SubAdmin@123")
            
        print("\n👨‍🏫 المعلمون (مثال من كل مدرسة):")
        for config in SCHOOLS_CONFIG:
            print(f"   {config['name']}: teacher1@{config['email_domain']} / Teacher@123")
            
        print("\n👨‍🎓 الطلاب (مثال من كل مدرسة):")
        for config in SCHOOLS_CONFIG:
            print(f"   {config['name']}: student1@{config['email_domain']} / Student@123")
            
        print("\n👨‍👩‍👧 أولياء الأمور (مثال من كل مدرسة):")
        for config in SCHOOLS_CONFIG:
            print(f"   {config['name']}: parent1@{config['email_domain']} / Parent@123")
            
        print("\n" + "=" * 80)
        print("✅ Multi-Tenant Architecture:")
        print("   - كل مدرسة tenant مستقل")
        print("   - البيانات معزولة بين المدارس")
        print("   - مدير المدرسة يرى مدرسته فقط")
        print("   - مدير المنصة يرى جميع المدارس")
        print("=" * 80)
        print("✅ اكتمل إنشاء البيانات الواقعية بنجاح!")
        print("=" * 80)


async def main():
    seeder = RealisticDataSeeder()
    
    try:
        await seeder.connect()
        await seeder.clean_all_data()
        await seeder.seed_platform_admin()
        
        for i, config in enumerate(SCHOOLS_CONFIG):
            await seeder.seed_school(config, i)
            
        await seeder.print_summary()
        
    finally:
        await seeder.close()


if __name__ == "__main__":
    asyncio.run(main())
