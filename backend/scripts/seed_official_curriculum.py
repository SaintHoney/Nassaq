"""
سكريبت إدخال بيانات المنهج الرسمي (Official Curriculum Seed Data)
هذه البيانات ثابتة وغير قابلة للتعديل من مدير المدرسة

المصدر: وزارة التعليم السعودية - الخطة الدراسية
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os

# Read environment variables
env_vars = {}
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
with open(env_path, 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, value = line.strip().split('=', 1)
            env_vars[key] = value

MONGO_URL = env_vars.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = env_vars.get('DB_NAME', 'test_database')


# ============================================
# المراحل الدراسية الرسمية
# ============================================
OFFICIAL_STAGES = [
    {
        "id": "stage-elementary",
        "code": "elementary",
        "name_ar": "المرحلة الابتدائية",
        "name_en": "Elementary Stage",
        "order": 1,
        "grades_count": 6,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "stage-middle",
        "code": "middle",
        "name_ar": "المرحلة المتوسطة",
        "name_en": "Middle Stage",
        "order": 2,
        "grades_count": 3,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "stage-secondary",
        "code": "secondary",
        "name_ar": "المرحلة الثانوية",
        "name_en": "Secondary Stage",
        "order": 3,
        "grades_count": 3,
        "is_official": True,
        "is_locked": True
    }
]

# ============================================
# المسارات التعليمية الرسمية
# ============================================
OFFICIAL_TRACKS = [
    {
        "id": "track-general",
        "code": "general",
        "name_ar": "التعليم العام",
        "name_en": "General Education",
        "applicable_stages": ["stage-elementary", "stage-middle"],
        "order": 1,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-quran",
        "code": "quran",
        "name_ar": "تحفيظ القرآن الكريم",
        "name_en": "Quran Memorization",
        "applicable_stages": ["stage-elementary", "stage-middle"],
        "order": 2,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-common",
        "code": "common",
        "name_ar": "السنة الأولى المشتركة",
        "name_en": "Common First Year",
        "applicable_stages": ["stage-secondary"],
        "order": 3,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-general-sec",
        "code": "general-sec",
        "name_ar": "المسار العام",
        "name_en": "General Track",
        "applicable_stages": ["stage-secondary"],
        "order": 4,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-cs-engineering",
        "code": "cs-engineering",
        "name_ar": "مسار علوم الحاسب والهندسة",
        "name_en": "Computer Science & Engineering Track",
        "applicable_stages": ["stage-secondary"],
        "order": 5,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-health-life",
        "code": "health-life",
        "name_ar": "مسار الصحة والحياة",
        "name_en": "Health & Life Track",
        "applicable_stages": ["stage-secondary"],
        "order": 6,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-business",
        "code": "business",
        "name_ar": "مسار إدارة الأعمال",
        "name_en": "Business Administration Track",
        "applicable_stages": ["stage-secondary"],
        "order": 7,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "track-sharia",
        "code": "sharia",
        "name_ar": "المسار الشرعي",
        "name_en": "Sharia Track",
        "applicable_stages": ["stage-secondary"],
        "order": 8,
        "is_official": True,
        "is_locked": True
    }
]

# ============================================
# الصفوف الدراسية الرسمية
# ============================================
OFFICIAL_GRADES = [
    # المرحلة الابتدائية - التعليم العام
    {"id": "grade-elem-1-general", "stage_id": "stage-elementary", "track_id": "track-general", "name_ar": "الصف الأول الابتدائي", "name_en": "Grade 1", "order": 1, "year_number": 1},
    {"id": "grade-elem-2-general", "stage_id": "stage-elementary", "track_id": "track-general", "name_ar": "الصف الثاني الابتدائي", "name_en": "Grade 2", "order": 2, "year_number": 2},
    {"id": "grade-elem-3-general", "stage_id": "stage-elementary", "track_id": "track-general", "name_ar": "الصف الثالث الابتدائي", "name_en": "Grade 3", "order": 3, "year_number": 3},
    {"id": "grade-elem-4-general", "stage_id": "stage-elementary", "track_id": "track-general", "name_ar": "الصف الرابع الابتدائي", "name_en": "Grade 4", "order": 4, "year_number": 4},
    {"id": "grade-elem-5-general", "stage_id": "stage-elementary", "track_id": "track-general", "name_ar": "الصف الخامس الابتدائي", "name_en": "Grade 5", "order": 5, "year_number": 5},
    {"id": "grade-elem-6-general", "stage_id": "stage-elementary", "track_id": "track-general", "name_ar": "الصف السادس الابتدائي", "name_en": "Grade 6", "order": 6, "year_number": 6},
    
    # المرحلة الابتدائية - تحفيظ القرآن
    {"id": "grade-elem-1-quran", "stage_id": "stage-elementary", "track_id": "track-quran", "name_ar": "الصف الأول الابتدائي (تحفيظ)", "name_en": "Grade 1 (Quran)", "order": 1, "year_number": 1},
    {"id": "grade-elem-2-quran", "stage_id": "stage-elementary", "track_id": "track-quran", "name_ar": "الصف الثاني الابتدائي (تحفيظ)", "name_en": "Grade 2 (Quran)", "order": 2, "year_number": 2},
    {"id": "grade-elem-3-quran", "stage_id": "stage-elementary", "track_id": "track-quran", "name_ar": "الصف الثالث الابتدائي (تحفيظ)", "name_en": "Grade 3 (Quran)", "order": 3, "year_number": 3},
    {"id": "grade-elem-4-quran", "stage_id": "stage-elementary", "track_id": "track-quran", "name_ar": "الصف الرابع الابتدائي (تحفيظ)", "name_en": "Grade 4 (Quran)", "order": 4, "year_number": 4},
    {"id": "grade-elem-5-quran", "stage_id": "stage-elementary", "track_id": "track-quran", "name_ar": "الصف الخامس الابتدائي (تحفيظ)", "name_en": "Grade 5 (Quran)", "order": 5, "year_number": 5},
    {"id": "grade-elem-6-quran", "stage_id": "stage-elementary", "track_id": "track-quran", "name_ar": "الصف السادس الابتدائي (تحفيظ)", "name_en": "Grade 6 (Quran)", "order": 6, "year_number": 6},
    
    # المرحلة المتوسطة - التعليم العام
    {"id": "grade-mid-1-general", "stage_id": "stage-middle", "track_id": "track-general", "name_ar": "الصف الأول المتوسط", "name_en": "Grade 7", "order": 1, "year_number": 7},
    {"id": "grade-mid-2-general", "stage_id": "stage-middle", "track_id": "track-general", "name_ar": "الصف الثاني المتوسط", "name_en": "Grade 8", "order": 2, "year_number": 8},
    {"id": "grade-mid-3-general", "stage_id": "stage-middle", "track_id": "track-general", "name_ar": "الصف الثالث المتوسط", "name_en": "Grade 9", "order": 3, "year_number": 9},
    
    # المرحلة المتوسطة - تحفيظ القرآن
    {"id": "grade-mid-1-quran", "stage_id": "stage-middle", "track_id": "track-quran", "name_ar": "الصف الأول المتوسط (تحفيظ)", "name_en": "Grade 7 (Quran)", "order": 1, "year_number": 7},
    {"id": "grade-mid-2-quran", "stage_id": "stage-middle", "track_id": "track-quran", "name_ar": "الصف الثاني المتوسط (تحفيظ)", "name_en": "Grade 8 (Quran)", "order": 2, "year_number": 8},
    {"id": "grade-mid-3-quran", "stage_id": "stage-middle", "track_id": "track-quran", "name_ar": "الصف الثالث المتوسط (تحفيظ)", "name_en": "Grade 9 (Quran)", "order": 3, "year_number": 9},
    
    # المرحلة الثانوية - السنة الأولى المشتركة
    {"id": "grade-sec-1-common", "stage_id": "stage-secondary", "track_id": "track-common", "name_ar": "السنة الأولى المشتركة", "name_en": "Year 1 Common", "order": 1, "year_number": 10},
    
    # المرحلة الثانوية - المسار العام
    {"id": "grade-sec-2-general", "stage_id": "stage-secondary", "track_id": "track-general-sec", "name_ar": "السنة الثانية (المسار العام)", "name_en": "Year 2 General", "order": 2, "year_number": 11},
    {"id": "grade-sec-3-general", "stage_id": "stage-secondary", "track_id": "track-general-sec", "name_ar": "السنة الثالثة (المسار العام)", "name_en": "Year 3 General", "order": 3, "year_number": 12},
    
    # المرحلة الثانوية - مسار علوم الحاسب والهندسة
    {"id": "grade-sec-2-cs", "stage_id": "stage-secondary", "track_id": "track-cs-engineering", "name_ar": "السنة الثانية (علوم الحاسب والهندسة)", "name_en": "Year 2 CS & Engineering", "order": 2, "year_number": 11},
    {"id": "grade-sec-3-cs", "stage_id": "stage-secondary", "track_id": "track-cs-engineering", "name_ar": "السنة الثالثة (علوم الحاسب والهندسة)", "name_en": "Year 3 CS & Engineering", "order": 3, "year_number": 12},
    
    # المرحلة الثانوية - مسار الصحة والحياة
    {"id": "grade-sec-2-health", "stage_id": "stage-secondary", "track_id": "track-health-life", "name_ar": "السنة الثانية (الصحة والحياة)", "name_en": "Year 2 Health & Life", "order": 2, "year_number": 11},
    {"id": "grade-sec-3-health", "stage_id": "stage-secondary", "track_id": "track-health-life", "name_ar": "السنة الثالثة (الصحة والحياة)", "name_en": "Year 3 Health & Life", "order": 3, "year_number": 12},
    
    # المرحلة الثانوية - مسار إدارة الأعمال
    {"id": "grade-sec-2-business", "stage_id": "stage-secondary", "track_id": "track-business", "name_ar": "السنة الثانية (إدارة الأعمال)", "name_en": "Year 2 Business", "order": 2, "year_number": 11},
    {"id": "grade-sec-3-business", "stage_id": "stage-secondary", "track_id": "track-business", "name_ar": "السنة الثالثة (إدارة الأعمال)", "name_en": "Year 3 Business", "order": 3, "year_number": 12},
    
    # المرحلة الثانوية - المسار الشرعي
    {"id": "grade-sec-2-sharia", "stage_id": "stage-secondary", "track_id": "track-sharia", "name_ar": "السنة الثانية (المسار الشرعي)", "name_en": "Year 2 Sharia", "order": 2, "year_number": 11},
    {"id": "grade-sec-3-sharia", "stage_id": "stage-secondary", "track_id": "track-sharia", "name_ar": "السنة الثالثة (المسار الشرعي)", "name_en": "Year 3 Sharia", "order": 3, "year_number": 12},
]

# ============================================
# المواد الدراسية الرسمية
# ============================================
OFFICIAL_SUBJECTS = [
    # المواد الأساسية
    {"id": "subj-quran-islamic", "code": "quran-islamic", "name_ar": "القرآن الكريم والدراسات الإسلامية", "name_en": "Quran & Islamic Studies", "category": "islamic", "is_core": True},
    {"id": "subj-quran", "code": "quran", "name_ar": "القرآن الكريم", "name_en": "Holy Quran", "category": "islamic", "is_core": True},
    {"id": "subj-tajweed", "code": "tajweed", "name_ar": "التجويد", "name_en": "Tajweed", "category": "islamic", "is_core": False},
    {"id": "subj-tawheed", "code": "tawheed", "name_ar": "التوحيد", "name_en": "Tawheed", "category": "islamic", "is_core": True},
    {"id": "subj-tafseer", "code": "tafseer", "name_ar": "التفسير", "name_en": "Tafseer", "category": "islamic", "is_core": False},
    {"id": "subj-hadith", "code": "hadith", "name_ar": "الحديث", "name_en": "Hadith", "category": "islamic", "is_core": True},
    {"id": "subj-fiqh", "code": "fiqh", "name_ar": "الفقه", "name_en": "Fiqh", "category": "islamic", "is_core": True},
    {"id": "subj-qiraat", "code": "qiraat", "name_ar": "القراءات", "name_en": "Qiraat", "category": "islamic", "is_core": False},
    {"id": "subj-quran-sciences", "code": "quran-sciences", "name_ar": "علوم القرآن", "name_en": "Quran Sciences", "category": "islamic", "is_core": False},
    {"id": "subj-hadith-terminology", "code": "hadith-terminology", "name_ar": "مصطلح الحديث", "name_en": "Hadith Terminology", "category": "islamic", "is_core": False},
    {"id": "subj-usul-fiqh", "code": "usul-fiqh", "name_ar": "أصول الفقه", "name_en": "Principles of Fiqh", "category": "islamic", "is_core": False},
    {"id": "subj-faraed", "code": "faraed", "name_ar": "الفرائض", "name_en": "Inheritance", "category": "islamic", "is_core": False},
    
    # اللغات
    {"id": "subj-arabic", "code": "arabic", "name_ar": "اللغة العربية", "name_en": "Arabic Language", "category": "language", "is_core": True},
    {"id": "subj-lugati", "code": "lugati", "name_ar": "لغتي", "name_en": "My Language", "category": "language", "is_core": True},
    {"id": "subj-english", "code": "english", "name_ar": "اللغة الإنجليزية", "name_en": "English Language", "category": "language", "is_core": True},
    {"id": "subj-kifayat", "code": "kifayat", "name_ar": "الكفايات اللغوية", "name_en": "Language Competencies", "category": "language", "is_core": True},
    {"id": "subj-literary-studies", "code": "literary-studies", "name_ar": "الدراسات الأدبية", "name_en": "Literary Studies", "category": "language", "is_core": False},
    {"id": "subj-linguistic-studies", "code": "linguistic-studies", "name_ar": "الدراسات اللغوية", "name_en": "Linguistic Studies", "category": "language", "is_core": False},
    {"id": "subj-rhetoric-criticism", "code": "rhetoric-criticism", "name_ar": "الدراسات البلاغية والنقدية", "name_en": "Rhetoric & Criticism", "category": "language", "is_core": False},
    {"id": "subj-functional-writing", "code": "functional-writing", "name_ar": "الكتابة الوظيفية والإبداعية", "name_en": "Functional & Creative Writing", "category": "language", "is_core": False},
    
    # العلوم
    {"id": "subj-math", "code": "math", "name_ar": "الرياضيات", "name_en": "Mathematics", "category": "science", "is_core": True},
    {"id": "subj-science", "code": "science", "name_ar": "العلوم", "name_en": "Science", "category": "science", "is_core": True},
    {"id": "subj-physics", "code": "physics", "name_ar": "الفيزياء", "name_en": "Physics", "category": "science", "is_core": True},
    {"id": "subj-chemistry", "code": "chemistry", "name_ar": "الكيمياء", "name_en": "Chemistry", "category": "science", "is_core": True},
    {"id": "subj-biology", "code": "biology", "name_ar": "الأحياء", "name_en": "Biology", "category": "science", "is_core": True},
    {"id": "subj-environment", "code": "environment", "name_ar": "علم البيئة", "name_en": "Environmental Science", "category": "science", "is_core": False},
    {"id": "subj-earth-space", "code": "earth-space", "name_ar": "علوم الأرض والفضاء", "name_en": "Earth & Space Sciences", "category": "science", "is_core": False},
    {"id": "subj-statistics", "code": "statistics", "name_ar": "الإحصاء", "name_en": "Statistics", "category": "science", "is_core": False},
    
    # الدراسات الاجتماعية
    {"id": "subj-social", "code": "social", "name_ar": "الدراسات الاجتماعية", "name_en": "Social Studies", "category": "social", "is_core": True},
    {"id": "subj-history", "code": "history", "name_ar": "التاريخ", "name_en": "History", "category": "social", "is_core": False},
    {"id": "subj-geography", "code": "geography", "name_ar": "الجغرافيا", "name_en": "Geography", "category": "social", "is_core": False},
    {"id": "subj-psychology", "code": "psychology", "name_ar": "الدراسات النفسية والاجتماعية", "name_en": "Psychology & Social Studies", "category": "social", "is_core": False},
    
    # التقنية والحاسب
    {"id": "subj-digital-skills", "code": "digital-skills", "name_ar": "المهارات الرقمية", "name_en": "Digital Skills", "category": "technology", "is_core": True},
    {"id": "subj-digital-tech", "code": "digital-tech", "name_ar": "التقنية الرقمية", "name_en": "Digital Technology", "category": "technology", "is_core": True},
    {"id": "subj-ai", "code": "ai", "name_ar": "الذكاء الاصطناعي", "name_en": "Artificial Intelligence", "category": "technology", "is_core": False},
    {"id": "subj-cybersecurity", "code": "cybersecurity", "name_ar": "الأمن السيبراني", "name_en": "Cybersecurity", "category": "technology", "is_core": False},
    {"id": "subj-iot", "code": "iot", "name_ar": "إنترنت الأشياء", "name_en": "Internet of Things", "category": "technology", "is_core": False},
    {"id": "subj-data-science", "code": "data-science", "name_ar": "علم البيانات", "name_en": "Data Science", "category": "technology", "is_core": False},
    {"id": "subj-software-eng", "code": "software-eng", "name_ar": "هندسة البرمجيات", "name_en": "Software Engineering", "category": "technology", "is_core": False},
    {"id": "subj-eng-design", "code": "eng-design", "name_ar": "التصميم الهندسي", "name_en": "Engineering Design", "category": "technology", "is_core": False},
    {"id": "subj-engineering", "code": "engineering", "name_ar": "الهندسة", "name_en": "Engineering", "category": "technology", "is_core": False},
    {"id": "subj-digital-citizenship", "code": "digital-citizenship", "name_ar": "المواطنة الرقمية", "name_en": "Digital Citizenship", "category": "technology", "is_core": False},
    {"id": "subj-digital-design", "code": "digital-design", "name_ar": "التصميم الرقمي", "name_en": "Digital Design", "category": "technology", "is_core": False},
    
    # المهارات والأنشطة
    {"id": "subj-art", "code": "art", "name_ar": "التربية الفنية", "name_en": "Art Education", "category": "activity", "is_core": False},
    {"id": "subj-arts", "code": "arts", "name_ar": "الفنون", "name_en": "Arts", "category": "activity", "is_core": False},
    {"id": "subj-pe", "code": "pe", "name_ar": "التربية البدنية والدفاع عن النفس", "name_en": "Physical Education & Self Defense", "category": "activity", "is_core": True},
    {"id": "subj-life-skills", "code": "life-skills", "name_ar": "المهارات الحياتية والأسرية", "name_en": "Life & Family Skills", "category": "skills", "is_core": True},
    {"id": "subj-life-skills-adv", "code": "life-skills-adv", "name_ar": "المهارات الحياتية", "name_en": "Life Skills", "category": "skills", "is_core": False},
    {"id": "subj-critical-thinking", "code": "critical-thinking", "name_ar": "التفكير الناقد", "name_en": "Critical Thinking", "category": "skills", "is_core": False},
    {"id": "subj-activity", "code": "activity", "name_ar": "النشاط", "name_en": "Activity", "category": "activity", "is_core": False},
    {"id": "subj-non-class", "code": "non-class", "name_ar": "الفترات اللاصفية", "name_en": "Non-class Periods", "category": "activity", "is_core": False},
    {"id": "subj-fitness-health", "code": "fitness-health", "name_ar": "اللياقة والثقافة الصحية", "name_en": "Fitness & Health Culture", "category": "activity", "is_core": False},
    {"id": "subj-pe-health", "code": "pe-health", "name_ar": "التربية الصحية والبدنية", "name_en": "Health & Physical Education", "category": "activity", "is_core": False},
    {"id": "subj-vocational", "code": "vocational", "name_ar": "التربية المهنية", "name_en": "Vocational Education", "category": "skills", "is_core": False},
    {"id": "subj-research", "code": "research", "name_ar": "البحث ومصادر المعلومات", "name_en": "Research & Information Sources", "category": "skills", "is_core": False},
    {"id": "subj-graduation-project", "code": "graduation-project", "name_ar": "مشروع التخرج", "name_en": "Graduation Project", "category": "skills", "is_core": False},
    
    # الصحة والحياة
    {"id": "subj-health-principles", "code": "health-principles", "name_ar": "مبادئ العلوم الصحية", "name_en": "Health Sciences Principles", "category": "science", "is_core": False},
    {"id": "subj-healthcare", "code": "healthcare", "name_ar": "الرعاية الصحية", "name_en": "Healthcare", "category": "science", "is_core": False},
    {"id": "subj-human-body", "code": "human-body", "name_ar": "أنظمة جسم الإنسان", "name_en": "Human Body Systems", "category": "science", "is_core": False},
    {"id": "subj-first-aid", "code": "first-aid", "name_ar": "الإسعافات الأولية", "name_en": "First Aid", "category": "skills", "is_core": False},
    
    # إدارة الأعمال
    {"id": "subj-financial-literacy", "code": "financial-literacy", "name_ar": "المعرفة المالية", "name_en": "Financial Literacy", "category": "business", "is_core": False},
    {"id": "subj-business-decision", "code": "business-decision", "name_ar": "صناعة القرار في الأعمال", "name_en": "Business Decision Making", "category": "business", "is_core": False},
    {"id": "subj-intro-business", "code": "intro-business", "name_ar": "مقدمة في الأعمال", "name_en": "Introduction to Business", "category": "business", "is_core": False},
    {"id": "subj-economics", "code": "economics", "name_ar": "مبادئ الاقتصاد", "name_en": "Economics Principles", "category": "business", "is_core": False},
    {"id": "subj-financial-mgmt", "code": "financial-mgmt", "name_ar": "الإدارة المالية", "name_en": "Financial Management", "category": "business", "is_core": False},
    {"id": "subj-admin-principles", "code": "admin-principles", "name_ar": "مبادئ الإدارة", "name_en": "Administration Principles", "category": "business", "is_core": False},
    {"id": "subj-events-mgmt", "code": "events-mgmt", "name_ar": "إدارة الفعاليات", "name_en": "Events Management", "category": "business", "is_core": False},
    {"id": "subj-marketing", "code": "marketing", "name_ar": "تخطيط الحملات التسويقية", "name_en": "Marketing Campaign Planning", "category": "business", "is_core": False},
    {"id": "subj-secretary", "code": "secretary", "name_ar": "السكرتارية والإدارة المكتبية", "name_en": "Secretarial & Office Management", "category": "business", "is_core": False},
    {"id": "subj-law-principles", "code": "law-principles", "name_ar": "مبادئ القانون", "name_en": "Law Principles", "category": "business", "is_core": False},
    {"id": "subj-law-applications", "code": "law-applications", "name_ar": "تطبيقات في القانون", "name_en": "Law Applications", "category": "business", "is_core": False},
    {"id": "subj-admin-skills", "code": "admin-skills", "name_ar": "المهارات الإدارية", "name_en": "Administrative Skills", "category": "business", "is_core": False},
    {"id": "subj-sustainable-dev", "code": "sustainable-dev", "name_ar": "التنمية المستدامة", "name_en": "Sustainable Development", "category": "business", "is_core": False},
    {"id": "subj-fashion-design", "code": "fashion-design", "name_ar": "فن تصميم الأزياء", "name_en": "Fashion Design", "category": "skills", "is_core": False},
    {"id": "subj-tourism", "code": "tourism", "name_ar": "السياحة والضيافة", "name_en": "Tourism & Hospitality", "category": "business", "is_core": False},
]

# ============================================
# توزيع المواد على الصفوف مع الحصص السنوية
# ============================================
def create_grade_subjects():
    """إنشاء ربط المواد بالصفوف مع الحصص السنوية"""
    grade_subjects = []
    
    # المرحلة الابتدائية - التعليم العام
    # الصف الأول الابتدائي
    elem_1_general = [
        ("subj-quran-islamic", 180, "class_period"),
        ("subj-arabic", 288, "class_period"),
        ("subj-math", 180, "class_period"),
        ("subj-science", 108, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 108, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 108, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    # الصف الثاني الابتدائي
    elem_2_general = [
        ("subj-quran-islamic", 180, "class_period"),
        ("subj-arabic", 252, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 108, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 108, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 108, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    # الصف الثالث الابتدائي
    elem_3_general = [
        ("subj-quran-islamic", 180, "class_period"),
        ("subj-arabic", 216, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 108, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 108, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    # الصف الرابع الابتدائي
    elem_4_general = [
        ("subj-quran-islamic", 180, "class_period"),
        ("subj-arabic", 180, "class_period"),
        ("subj-social", 72, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-digital-skills", 72, "class_period"),
        ("subj-art", 36, "class_period"),
        ("subj-pe", 72, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    # الصف الخامس والسادس الابتدائي (نفس الرابع)
    elem_5_general = elem_4_general.copy()
    elem_6_general = elem_4_general.copy()
    
    # المرحلة الابتدائية - تحفيظ القرآن
    elem_1_quran = [
        ("subj-quran-islamic", 324, "class_period"),
        ("subj-arabic", 288, "class_period"),
        ("subj-math", 180, "class_period"),
        ("subj-science", 108, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 108, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 101, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    elem_2_quran = [
        ("subj-quran-islamic", 324, "class_period"),
        ("subj-arabic", 252, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 108, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 108, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 101, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    elem_3_quran = [
        ("subj-quran-islamic", 324, "class_period"),
        ("subj-arabic", 216, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 108, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 101, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    elem_4_quran = [
        ("subj-quran-islamic", 288, "class_period"),
        ("subj-tajweed", 36, "class_period"),
        ("subj-arabic", 180, "class_period"),
        ("subj-social", 72, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 108, "class_period"),
        ("subj-digital-skills", 72, "class_period"),
        ("subj-art", 36, "class_period"),
        ("subj-pe", 72, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-activity", 67, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    elem_5_quran = elem_4_quran.copy()
    elem_6_quran = elem_4_quran.copy()
    
    # المرحلة المتوسطة - التعليم العام
    mid_1_general = [
        ("subj-quran-islamic", 180, "class_period"),
        ("subj-arabic", 180, "class_period"),
        ("subj-social", 108, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-digital-skills", 72, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 72, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-critical-thinking", 0, "class_period"),
        ("subj-activity", 36, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    mid_2_general = mid_1_general.copy()
    
    mid_3_general = [
        ("subj-quran-islamic", 180, "class_period"),
        ("subj-arabic", 144, "class_period"),
        ("subj-social", 72, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-digital-skills", 72, "class_period"),
        ("subj-art", 72, "class_period"),
        ("subj-pe", 72, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-critical-thinking", 72, "class_period"),
        ("subj-activity", 36, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    # المرحلة المتوسطة - تحفيظ القرآن
    mid_1_quran = [
        ("subj-quran-islamic", 288, "class_period"),
        ("subj-tajweed", 36, "class_period"),
        ("subj-arabic", 180, "class_period"),
        ("subj-social", 72, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-digital-skills", 72, "class_period"),
        ("subj-art", 36, "class_period"),
        ("subj-pe", 36, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-critical-thinking", 0, "class_period"),
        ("subj-activity", 67, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    mid_2_quran = mid_1_quran.copy()
    
    mid_3_quran = [
        ("subj-quran-islamic", 252, "class_period"),
        ("subj-tajweed", 36, "class_period"),
        ("subj-arabic", 144, "class_period"),
        ("subj-social", 72, "class_period"),
        ("subj-math", 216, "class_period"),
        ("subj-science", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-digital-skills", 72, "class_period"),
        ("subj-art", 36, "class_period"),
        ("subj-pe", 36, "class_period"),
        ("subj-life-skills", 36, "class_period"),
        ("subj-critical-thinking", 72, "class_period"),
        ("subj-activity", 68, "class_period"),
        ("subj-non-class", 240, "non_class_period"),
    ]
    
    # المرحلة الثانوية - السنة الأولى المشتركة
    sec_1_common = [
        ("subj-quran", 60, "class_period"),
        ("subj-math", 180, "class_period"),
        ("subj-english", 180, "class_period"),
        ("subj-digital-tech", 108, "class_period"),
        ("subj-biology", 60, "class_period"),
        ("subj-chemistry", 60, "class_period"),
        ("subj-physics", 60, "class_period"),
        ("subj-environment", 36, "class_period"),
        ("subj-kifayat", 120, "class_period"),
        ("subj-hadith", 36, "class_period"),
        ("subj-financial-literacy", 36, "class_period"),
        ("subj-social", 60, "class_period"),
        ("subj-critical-thinking", 48, "class_period"),
        ("subj-vocational", 36, "class_period"),
        ("subj-pe-health", 72, "class_period"),
        ("subj-activity", 60, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - المسار العام - السنة الثانية
    sec_2_general = [
        ("subj-math", 180, "class_period"),
        ("subj-english", 180, "class_period"),
        ("subj-chemistry", 180, "class_period"),
        ("subj-biology", 144, "class_period"),
        ("subj-physics", 60, "class_period"),
        ("subj-tawheed", 36, "class_period"),
        ("subj-kifayat", 72, "class_period"),
        ("subj-digital-tech", 72, "class_period"),
        ("subj-history", 60, "class_period"),
        ("subj-arts", 36, "class_period"),
        ("subj-fitness-health", 60, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - المسار العام - السنة الثالثة
    sec_3_general = [
        ("subj-math", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-chemistry", 60, "class_period"),
        ("subj-physics", 180, "class_period"),
        ("subj-earth-space", 96, "class_period"),
        ("subj-fiqh", 36, "class_period"),
        ("subj-literary-studies", 36, "class_period"),
        ("subj-psychology", 36, "class_period"),
        ("subj-digital-tech", 36, "class_period"),
        ("subj-digital-citizenship", 36, "class_period"),
        ("subj-geography", 36, "class_period"),
        ("subj-life-skills-adv", 36, "class_period"),
        ("subj-pe-health", 48, "class_period"),
        ("subj-research", 36, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - مسار علوم الحاسب والهندسة - السنة الثانية
    sec_2_cs = [
        ("subj-math", 180, "class_period"),
        ("subj-english", 180, "class_period"),
        ("subj-chemistry", 180, "class_period"),
        ("subj-biology", 144, "class_period"),
        ("subj-physics", 60, "class_period"),
        ("subj-tawheed", 36, "class_period"),
        ("subj-kifayat", 72, "class_period"),
        ("subj-data-science", 36, "class_period"),
        ("subj-iot", 72, "class_period"),
        ("subj-engineering", 60, "class_period"),
        ("subj-fitness-health", 60, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - مسار علوم الحاسب والهندسة - السنة الثالثة
    sec_3_cs = [
        ("subj-math", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-chemistry", 60, "class_period"),
        ("subj-physics", 180, "class_period"),
        ("subj-earth-space", 96, "class_period"),
        ("subj-fiqh", 36, "class_period"),
        ("subj-literary-studies", 36, "class_period"),
        ("subj-ai", 84, "class_period"),
        ("subj-cybersecurity", 36, "class_period"),
        ("subj-software-eng", 60, "class_period"),
        ("subj-eng-design", 48, "class_period"),
        ("subj-life-skills-adv", 36, "class_period"),
        ("subj-pe-health", 48, "class_period"),
        ("subj-research", 36, "class_period"),
        ("subj-graduation-project", 36, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - مسار الصحة والحياة - السنة الثانية
    sec_2_health = [
        ("subj-math", 180, "class_period"),
        ("subj-english", 180, "class_period"),
        ("subj-chemistry", 180, "class_period"),
        ("subj-biology", 144, "class_period"),
        ("subj-physics", 60, "class_period"),
        ("subj-tawheed", 36, "class_period"),
        ("subj-kifayat", 72, "class_period"),
        ("subj-digital-tech", 72, "class_period"),
        ("subj-health-principles", 96, "class_period"),
        ("subj-fitness-health", 60, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - مسار الصحة والحياة - السنة الثالثة
    sec_3_health = [
        ("subj-math", 144, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-chemistry", 60, "class_period"),
        ("subj-physics", 180, "class_period"),
        ("subj-earth-space", 96, "class_period"),
        ("subj-fiqh", 36, "class_period"),
        ("subj-literary-studies", 36, "class_period"),
        ("subj-healthcare", 108, "class_period"),
        ("subj-human-body", 84, "class_period"),
        ("subj-statistics", 36, "class_period"),
        ("subj-life-skills-adv", 36, "class_period"),
        ("subj-pe-health", 48, "class_period"),
        ("subj-research", 36, "class_period"),
        ("subj-graduation-project", 36, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - مسار إدارة الأعمال - السنة الثانية
    sec_2_business = [
        ("subj-english", 180, "class_period"),
        ("subj-tawheed", 36, "class_period"),
        ("subj-tafseer", 36, "class_period"),
        ("subj-kifayat", 72, "class_period"),
        ("subj-linguistic-studies", 60, "class_period"),
        ("subj-business-decision", 156, "class_period"),
        ("subj-intro-business", 120, "class_period"),
        ("subj-economics", 48, "class_period"),
        ("subj-financial-mgmt", 108, "class_period"),
        ("subj-digital-tech", 72, "class_period"),
        ("subj-history", 60, "class_period"),
        ("subj-arts", 36, "class_period"),
        ("subj-fitness-health", 60, "class_period"),
        ("subj-activity", 108, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - مسار إدارة الأعمال - السنة الثالثة
    sec_3_business = [
        ("subj-english", 144, "class_period"),
        ("subj-fiqh", 36, "class_period"),
        ("subj-literary-studies", 36, "class_period"),
        ("subj-psychology", 36, "class_period"),
        ("subj-rhetoric-criticism", 48, "class_period"),
        ("subj-admin-principles", 60, "class_period"),
        ("subj-events-mgmt", 120, "class_period"),
        ("subj-marketing", 120, "class_period"),
        ("subj-secretary", 60, "class_period"),
        ("subj-law-principles", 120, "class_period"),
        ("subj-law-applications", 36, "class_period"),
        ("subj-digital-citizenship", 36, "class_period"),
        ("subj-statistics", 36, "class_period"),
        ("subj-geography", 36, "class_period"),
        ("subj-life-skills-adv", 36, "class_period"),
        ("subj-pe-health", 48, "class_period"),
        ("subj-research", 36, "class_period"),
        ("subj-graduation-project", 36, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - المسار الشرعي - السنة الثانية
    sec_2_sharia = [
        ("subj-quran", 180, "class_period"),
        ("subj-english", 180, "class_period"),
        ("subj-tawheed", 36, "class_period"),
        ("subj-tawheed", 36, "class_period"),  # توحيد 2
        ("subj-hadith", 36, "class_period"),
        ("subj-qiraat", 60, "class_period"),
        ("subj-qiraat", 60, "class_period"),  # قراءات 2
        ("subj-quran-sciences", 60, "class_period"),
        ("subj-tafseer", 36, "class_period"),
        ("subj-kifayat", 72, "class_period"),
        ("subj-linguistic-studies", 60, "class_period"),
        ("subj-digital-tech", 72, "class_period"),
        ("subj-history", 60, "class_period"),
        ("subj-arts", 36, "class_period"),
        ("subj-fitness-health", 60, "class_period"),
        ("subj-activity", 108, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # المرحلة الثانوية - المسار الشرعي - السنة الثالثة
    sec_3_sharia = [
        ("subj-quran", 180, "class_period"),
        ("subj-english", 144, "class_period"),
        ("subj-tafseer", 36, "class_period"),
        ("subj-fiqh", 36, "class_period"),
        ("subj-fiqh", 60, "class_period"),  # فقه 2
        ("subj-usul-fiqh", 36, "class_period"),
        ("subj-hadith-terminology", 36, "class_period"),
        ("subj-faraed", 48, "class_period"),
        ("subj-literary-studies", 36, "class_period"),
        ("subj-psychology", 36, "class_period"),
        ("subj-rhetoric-criticism", 48, "class_period"),
        ("subj-law-principles", 120, "class_period"),
        ("subj-law-applications", 36, "class_period"),
        ("subj-digital-citizenship", 36, "class_period"),
        ("subj-geography", 36, "class_period"),
        ("subj-life-skills-adv", 36, "class_period"),
        ("subj-pe-health", 48, "class_period"),
        ("subj-research", 36, "class_period"),
        ("subj-graduation-project", 36, "class_period"),
        ("subj-activity", 72, "class_period"),
        ("subj-non-class", 216, "non_class_period"),
    ]
    
    # ربط المواد بالصفوف
    grade_subject_mappings = {
        "grade-elem-1-general": elem_1_general,
        "grade-elem-2-general": elem_2_general,
        "grade-elem-3-general": elem_3_general,
        "grade-elem-4-general": elem_4_general,
        "grade-elem-5-general": elem_5_general,
        "grade-elem-6-general": elem_6_general,
        "grade-elem-1-quran": elem_1_quran,
        "grade-elem-2-quran": elem_2_quran,
        "grade-elem-3-quran": elem_3_quran,
        "grade-elem-4-quran": elem_4_quran,
        "grade-elem-5-quran": elem_5_quran,
        "grade-elem-6-quran": elem_6_quran,
        "grade-mid-1-general": mid_1_general,
        "grade-mid-2-general": mid_2_general,
        "grade-mid-3-general": mid_3_general,
        "grade-mid-1-quran": mid_1_quran,
        "grade-mid-2-quran": mid_2_quran,
        "grade-mid-3-quran": mid_3_quran,
        "grade-sec-1-common": sec_1_common,
        "grade-sec-2-general": sec_2_general,
        "grade-sec-3-general": sec_3_general,
        "grade-sec-2-cs": sec_2_cs,
        "grade-sec-3-cs": sec_3_cs,
        "grade-sec-2-health": sec_2_health,
        "grade-sec-3-health": sec_3_health,
        "grade-sec-2-business": sec_2_business,
        "grade-sec-3-business": sec_3_business,
        "grade-sec-2-sharia": sec_2_sharia,
        "grade-sec-3-sharia": sec_3_sharia,
    }
    
    order = 0
    for grade_id, subjects_list in grade_subject_mappings.items():
        for subject_id, annual_periods, period_type in subjects_list:
            order += 1
            grade_subjects.append({
                "id": f"gs-{grade_id}-{subject_id}",
                "grade_id": grade_id,
                "subject_id": subject_id,
                "annual_periods": annual_periods,
                "period_type": period_type,
                "order": order,
                "is_official": True,
                "is_locked": True
            })
    
    return grade_subjects


# ============================================
# النصاب الرسمي للمعلمين حسب الرتبة
# ============================================
OFFICIAL_TEACHER_RANK_LOADS = [
    {
        "id": "rank-load-teacher",
        "rank_code": "teacher",
        "rank_name_ar": "المعلم",
        "rank_name_en": "Teacher",
        "weekly_periods": 24,
        "is_special_education": False,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "rank-load-practitioner",
        "rank_code": "practitioner",
        "rank_name_ar": "المعلم الممارس",
        "rank_name_en": "Practitioner Teacher",
        "weekly_periods": 24,
        "is_special_education": False,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "rank-load-advanced",
        "rank_code": "advanced",
        "rank_name_ar": "المعلم المتقدم",
        "rank_name_en": "Advanced Teacher",
        "weekly_periods": 22,
        "is_special_education": False,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "rank-load-expert",
        "rank_code": "expert",
        "rank_name_ar": "المعلم الخبير",
        "rank_name_en": "Expert Teacher",
        "weekly_periods": 18,
        "is_special_education": False,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "rank-load-sped-practitioner",
        "rank_code": "sped-practitioner",
        "rank_name_ar": "معلم تربية خاصة - ممارس",
        "rank_name_en": "Special Education - Practitioner",
        "weekly_periods": 18,
        "is_special_education": True,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "rank-load-sped-advanced",
        "rank_code": "sped-advanced",
        "rank_name_ar": "معلم تربية خاصة - متقدم",
        "rank_name_en": "Special Education - Advanced",
        "weekly_periods": 16,
        "is_special_education": True,
        "is_official": True,
        "is_locked": True
    },
    {
        "id": "rank-load-sped-expert",
        "rank_code": "sped-expert",
        "rank_name_ar": "معلم تربية خاصة - خبير",
        "rank_name_en": "Special Education - Expert",
        "weekly_periods": 14,
        "is_special_education": True,
        "is_official": True,
        "is_locked": True
    },
]


async def seed_official_curriculum():
    """إدخال بيانات المنهج الرسمي في قاعدة البيانات"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    print("=" * 60)
    print("بدء إدخال بيانات المنهج الرسمي")
    print("=" * 60)
    
    # 1. إدخال المراحل الدراسية
    print("\n📚 إدخال المراحل الدراسية...")
    await db.official_curriculum_stages.delete_many({})
    for stage in OFFICIAL_STAGES:
        stage["created_at"] = timestamp
        stage["updated_at"] = timestamp
    await db.official_curriculum_stages.insert_many(OFFICIAL_STAGES)
    print(f"   ✅ تم إدخال {len(OFFICIAL_STAGES)} مرحلة")
    
    # 2. إدخال المسارات التعليمية
    print("\n🛤️ إدخال المسارات التعليمية...")
    await db.official_curriculum_tracks.delete_many({})
    for track in OFFICIAL_TRACKS:
        track["created_at"] = timestamp
        track["updated_at"] = timestamp
    await db.official_curriculum_tracks.insert_many(OFFICIAL_TRACKS)
    print(f"   ✅ تم إدخال {len(OFFICIAL_TRACKS)} مسار")
    
    # 3. إدخال الصفوف الدراسية
    print("\n🎓 إدخال الصفوف الدراسية...")
    await db.official_curriculum_grades.delete_many({})
    for grade in OFFICIAL_GRADES:
        grade["created_at"] = timestamp
        grade["updated_at"] = timestamp
        grade["is_official"] = True
        grade["is_locked"] = True
    await db.official_curriculum_grades.insert_many(OFFICIAL_GRADES)
    print(f"   ✅ تم إدخال {len(OFFICIAL_GRADES)} صف")
    
    # 4. إدخال المواد الدراسية
    print("\n📖 إدخال المواد الدراسية...")
    await db.official_curriculum_subjects.delete_many({})
    for subject in OFFICIAL_SUBJECTS:
        subject["created_at"] = timestamp
        subject["updated_at"] = timestamp
        subject["is_official"] = True
        subject["is_locked"] = True
    await db.official_curriculum_subjects.insert_many(OFFICIAL_SUBJECTS)
    print(f"   ✅ تم إدخال {len(OFFICIAL_SUBJECTS)} مادة")
    
    # 5. إدخال ربط المواد بالصفوف
    print("\n🔗 إدخال ربط المواد بالصفوف...")
    grade_subjects = create_grade_subjects()
    await db.official_curriculum_grade_subjects.delete_many({})
    for gs in grade_subjects:
        gs["created_at"] = timestamp
        gs["updated_at"] = timestamp
    await db.official_curriculum_grade_subjects.insert_many(grade_subjects)
    print(f"   ✅ تم إدخال {len(grade_subjects)} ربط مادة بصف")
    
    # 6. إدخال النصاب الرسمي
    print("\n👨‍🏫 إدخال النصاب الرسمي للمعلمين...")
    await db.official_teacher_rank_loads.delete_many({})
    for load in OFFICIAL_TEACHER_RANK_LOADS:
        load["created_at"] = timestamp
        load["updated_at"] = timestamp
    await db.official_teacher_rank_loads.insert_many(OFFICIAL_TEACHER_RANK_LOADS)
    print(f"   ✅ تم إدخال {len(OFFICIAL_TEACHER_RANK_LOADS)} نصاب رتبة")
    
    # إنشاء الفهارس
    print("\n📊 إنشاء الفهارس...")
    await db.official_curriculum_stages.create_index("id", unique=True)
    await db.official_curriculum_tracks.create_index("id", unique=True)
    await db.official_curriculum_grades.create_index("id", unique=True)
    await db.official_curriculum_grades.create_index([("stage_id", 1), ("track_id", 1)])
    await db.official_curriculum_subjects.create_index("id", unique=True)
    await db.official_curriculum_subjects.create_index("code", unique=True)
    await db.official_curriculum_grade_subjects.create_index("id", unique=True)
    await db.official_curriculum_grade_subjects.create_index([("grade_id", 1), ("subject_id", 1)])
    await db.official_teacher_rank_loads.create_index("id", unique=True)
    await db.official_teacher_rank_loads.create_index("rank_code", unique=True)
    print("   ✅ تم إنشاء الفهارس")
    
    # ملخص
    print("\n" + "=" * 60)
    print("✅ تم إدخال بيانات المنهج الرسمي بنجاح!")
    print("=" * 60)
    print(f"   المراحل: {len(OFFICIAL_STAGES)}")
    print(f"   المسارات: {len(OFFICIAL_TRACKS)}")
    print(f"   الصفوف: {len(OFFICIAL_GRADES)}")
    print(f"   المواد: {len(OFFICIAL_SUBJECTS)}")
    print(f"   روابط المواد بالصفوف: {len(grade_subjects)}")
    print(f"   نصاب الرتب: {len(OFFICIAL_TEACHER_RANK_LOADS)}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_official_curriculum())
