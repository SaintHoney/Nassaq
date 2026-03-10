#!/usr/bin/env python3
"""
سكريبت إنشاء البيانات التجريبية السريع لنظام نَسَّق
Quick Seed Data Script for NASSAQ Platform (Demo Version)
"""

import asyncio
import sys
import os
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
from datetime import datetime, timezone, timedelta
import uuid

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# ============== QUICK CONFIG (For Demo) ==============
CONFIG = {
    "schools": 10,  # 10 schools for quick demo
    "teachers_per_school": 5,
    "students_per_school": 30,
    "parents_per_school": 20,
}

SAUDI_CITIES = [
    {"name": "الرياض", "name_en": "Riyadh", "region": "منطقة الرياض"},
    {"name": "جدة", "name_en": "Jeddah", "region": "منطقة مكة المكرمة"},
    {"name": "مكة المكرمة", "name_en": "Makkah", "region": "منطقة مكة المكرمة"},
    {"name": "المدينة المنورة", "name_en": "Madinah", "region": "منطقة المدينة المنورة"},
    {"name": "الدمام", "name_en": "Dammam", "region": "المنطقة الشرقية"},
]

MALE_NAMES = ["محمد", "أحمد", "عبدالله", "خالد", "عمر", "سعود", "فيصل", "ناصر", "سلطان", "عبدالرحمن"]
FEMALE_NAMES = ["فاطمة", "نورة", "سارة", "مريم", "هند", "لمياء", "ريم", "دانة", "جود", "لين"]
LAST_NAMES = ["العمري", "الفهد", "السعيد", "الشمري", "القحطاني", "الدوسري", "الحربي", "المطيري"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_phone():
    return f"+9665{random.randint(10000000, 99999999)}"

async def main():
    print("=" * 60)
    print("🚀 بدء إنشاء البيانات التجريبية السريعة")
    print("=" * 60)
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print(f"\n🔗 الاتصال بقاعدة البيانات: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # 1. Create Platform Admin
        print("\n👑 إنشاء حساب مدير المنصة...")
        admin = {
            "id": str(uuid.uuid4()),
            "email": "admin@nassaq.com",
            "password_hash": hash_password("NassaqAdmin2026"),
            "full_name": "مدير نظام نَسَّق",
            "full_name_en": "NASSAQ System Admin",
            "role": "platform_admin",
            "tenant_id": None,
            "phone": "+966500000001",
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "permissions": ["manage_schools", "manage_users", "manage_settings", "view_analytics"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.delete_one({"email": "admin@nassaq.com"})
        await db.users.insert_one(admin)
        print(f"✅ admin@nassaq.com / NassaqAdmin2026")
        
        # 2. Create Demo Accounts
        print("\n🧪 إنشاء حسابات الاختبار...")
        demo_school_id = "demo-school-001"
        
        demo_accounts = [
            {"email": "principal@nassaq.com", "password": "Principal@123", "role": "school_principal", "name": "أحمد محمد العمري"},
            {"email": "teacher@nassaq.com", "password": "Teacher@123", "role": "teacher", "name": "سارة أحمد الفهد"},
            {"email": "student@nassaq.com", "password": "Student@123", "role": "student", "name": "محمد خالد السعيد"},
            {"email": "parent@nassaq.com", "password": "Parent@123", "role": "parent", "name": "خالد محمد السعيد"},
            {"email": "independent.teacher@nassaq.com", "password": "Teacher@123", "role": "teacher", "name": "نورة عبدالله الشمري"},
        ]
        
        for acc in demo_accounts:
            user = {
                "id": str(uuid.uuid4()),
                "email": acc["email"],
                "password_hash": hash_password(acc["password"]),
                "full_name": acc["name"],
                "full_name_en": acc["name"],
                "role": acc["role"],
                "tenant_id": demo_school_id if acc["email"] != "independent.teacher@nassaq.com" else None,
                "phone": generate_phone(),
                "is_active": True,
                "must_change_password": False,
                "preferred_language": "ar",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.delete_one({"email": acc["email"]})
            await db.users.insert_one(user)
            print(f"✅ {acc['email']}")
        
        # 3. Create Schools
        print(f"\n🏫 إنشاء {CONFIG['schools']} مدرسة...")
        schools = []
        
        # Demo school first
        demo_school = {
            "id": demo_school_id,
            "name": "مدرسة نَسَّق التجريبية",
            "name_en": "NASSAQ Demo School",
            "code": "NASSAQ-DEMO",
            "email": "demo@nassaq.com",
            "phone": "+966500000000",
            "city": "الرياض",
            "region": "منطقة الرياض",
            "status": "active",
            "current_students": 300,
            "current_teachers": 25,
            "subscription_plan": "premium",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        schools.append(demo_school)
        
        for i in range(CONFIG["schools"]):
            city = random.choice(SAUDI_CITIES)
            school = {
                "id": str(uuid.uuid4()),
                "name": f"مدرسة {city['name']} النموذجية #{i+1}",
                "name_en": f"{city['name_en']} Model School #{i+1}",
                "code": f"SCH-{i+1:04d}",
                "email": f"school{i+1}@nassaq.demo",
                "phone": generate_phone(),
                "city": city["name"],
                "region": city["region"],
                "status": "active",
                "current_students": random.randint(200, 500),
                "current_teachers": random.randint(15, 40),
                "subscription_plan": random.choice(["basic", "standard", "premium"]),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            schools.append(school)
        
        await db.schools.delete_many({})
        await db.schools.insert_many(schools)
        print(f"✅ تم إنشاء {len(schools)} مدرسة")
        
        # 4. Create Users for Schools
        print("\n👥 إنشاء المستخدمين للمدارس...")
        all_users = []
        
        for idx, school in enumerate(schools[1:], 1):  # Skip demo school
            school_id = school["id"]
            
            # Principal
            principal = {
                "id": str(uuid.uuid4()),
                "email": f"principal{idx}@nassaq.demo",
                "password_hash": hash_password("Principal@123"),
                "full_name": f"{random.choice(MALE_NAMES)} {random.choice(LAST_NAMES)}",
                "role": "school_principal",
                "tenant_id": school_id,
                "phone": generate_phone(),
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            all_users.append(principal)
            
            # Teachers
            for t in range(CONFIG["teachers_per_school"]):
                teacher = {
                    "id": str(uuid.uuid4()),
                    "email": f"teacher{idx}_{t}@nassaq.demo",
                    "password_hash": hash_password("Teacher@123"),
                    "full_name": f"{random.choice(FEMALE_NAMES)} {random.choice(LAST_NAMES)}",
                    "role": "teacher",
                    "tenant_id": school_id,
                    "phone": generate_phone(),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                all_users.append(teacher)
            
            # Students
            for s in range(CONFIG["students_per_school"]):
                student = {
                    "id": str(uuid.uuid4()),
                    "email": f"student{idx}_{s}@nassaq.demo",
                    "password_hash": hash_password("Student@123"),
                    "full_name": f"{random.choice(MALE_NAMES + FEMALE_NAMES)} {random.choice(LAST_NAMES)}",
                    "role": "student",
                    "tenant_id": school_id,
                    "phone": generate_phone(),
                    "is_active": True,
                    "grade": f"الصف {random.randint(1,6)}",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                all_users.append(student)
            
            # Parents
            for p in range(CONFIG["parents_per_school"]):
                parent = {
                    "id": str(uuid.uuid4()),
                    "email": f"parent{idx}_{p}@nassaq.demo",
                    "password_hash": hash_password("Parent@123"),
                    "full_name": f"{random.choice(MALE_NAMES + FEMALE_NAMES)} {random.choice(LAST_NAMES)}",
                    "role": "parent",
                    "tenant_id": school_id,
                    "phone": generate_phone(),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                all_users.append(parent)
        
        # Bulk insert
        await db.users.delete_many({"email": {"$regex": "@nassaq.demo$"}})
        if all_users:
            await db.users.insert_many(all_users)
        print(f"✅ تم إنشاء {len(all_users)} مستخدم")
        
        # 5. Create Platform Stats
        print("\n📊 إنشاء إحصائيات المنصة...")
        
        # Calculate totals including demo multiplier for impressive numbers
        base_schools = len(schools)
        base_teachers = len([u for u in all_users if u.get("role") == "teacher"]) + 25  # +25 for demo school
        base_students = len([u for u in all_users if u.get("role") == "student"]) + 300  # +300 for demo school
        base_parents = len([u for u in all_users if u.get("role") == "parent"]) + 600  # +600 for demo school
        
        # Apply multiplier for impressive demo numbers
        multiplier = 10
        stats = {
            "id": "platform_stats",
            "total_schools": base_schools * multiplier,
            "active_schools": int(base_schools * multiplier * 0.95),
            "total_students": base_students * multiplier,
            "total_teachers": base_teachers * multiplier,
            "total_parents": base_parents * multiplier,
            "total_users": (base_students + base_teachers + base_parents) * multiplier,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
        await db.platform_stats.delete_many({})
        await db.platform_stats.insert_one(stats)
        
        print(f"\n📈 إحصائيات المنصة:")
        print(f"   - المدارس: {stats['total_schools']}")
        print(f"   - الطلاب: {stats['total_students']:,}")
        print(f"   - المعلمون: {stats['total_teachers']:,}")
        print(f"   - أولياء الأمور: {stats['total_parents']:,}")
        
        print("\n" + "=" * 60)
        print("🎉 تم إنشاء جميع البيانات بنجاح!")
        print("=" * 60)
        
        print("\n📝 حسابات الدخول:")
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
