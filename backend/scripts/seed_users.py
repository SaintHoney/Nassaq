#!/usr/bin/env python3
"""
سكريبت إنشاء حسابات الاختبار لنظام نَسَّق
Seed script for NASSAQ test accounts
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
from datetime import datetime, timezone
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_test_accounts():
    """Create test accounts for all roles"""
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print(f"🔗 الاتصال بقاعدة البيانات: {mongo_url}")
    print(f"📁 اسم قاعدة البيانات: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Create a test school first
    test_school_id = "test-school-001"
    test_school = {
        "id": test_school_id,
        "name": "مدرسة نَسَّق التجريبية",
        "name_en": "NASSAQ Demo School",
        "code": "NASSAQ-DEMO",
        "email": "school@nassaq.com",
        "phone": "+966500000000",
        "address": "الرياض، المملكة العربية السعودية",
        "city": "الرياض",
        "region": "منطقة الرياض",
        "country": "SA",
        "status": "active",
        "student_capacity": 1000,
        "current_students": 250,
        "current_teachers": 25,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Upsert school
    await db.schools.update_one(
        {"id": test_school_id},
        {"$set": test_school},
        upsert=True
    )
    print(f"✅ تم إنشاء/تحديث المدرسة التجريبية: {test_school['name']}")
    
    # Test accounts to create
    test_accounts = [
        {
            "id": str(uuid.uuid4()),
            "email": "principal@nassaq.com",
            "password_hash": hash_password("Principal@123"),
            "full_name": "أحمد محمد العمري",
            "full_name_en": "Ahmed Mohammed Al-Omari",
            "role": "school_principal",
            "tenant_id": test_school_id,
            "phone": "+966501234567",
            "avatar_url": None,
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
            "tenant_id": test_school_id,
            "phone": "+966502345678",
            "avatar_url": None,
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "preferred_theme": "light",
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
            "tenant_id": test_school_id,
            "phone": "+966503456789",
            "avatar_url": None,
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "preferred_theme": "light",
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
            "tenant_id": test_school_id,
            "phone": "+966504567890",
            "avatar_url": None,
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
            "tenant_id": None,  # Independent teacher
            "phone": "+966505678901",
            "avatar_url": None,
            "is_active": True,
            "must_change_password": False,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    print("\n📋 إنشاء حسابات الاختبار...")
    
    for account in test_accounts:
        # Delete existing account with same email first (to reset)
        await db.users.delete_one({"email": account["email"]})
        
        # Insert new account
        await db.users.insert_one(account)
        print(f"✅ {account['role']}: {account['email']}")
    
    # Verify accounts were created
    print("\n🔍 التحقق من الحسابات...")
    users = await db.users.find({}).to_list(length=None)
    print(f"✅ إجمالي المستخدمين في قاعدة البيانات: {len(users)}")
    
    for user in users:
        print(f"   - {user['email']} ({user['role']})")
    
    client.close()
    
    print("\n" + "="*50)
    print("🎉 تم إنشاء جميع حسابات الاختبار بنجاح!")
    print("="*50)
    print("\n📝 بيانات الدخول:")
    print("-" * 40)
    print("المدير:     principal@nassaq.com / Principal@123")
    print("المعلم:     teacher@nassaq.com / Teacher@123")
    print("الطالب:     student@nassaq.com / Student@123")
    print("ولي الأمر: parent@nassaq.com / Parent@123")
    print("معلم مستقل: independent.teacher@nassaq.com / Teacher@123")
    print("-" * 40)

if __name__ == "__main__":
    asyncio.run(seed_test_accounts())
