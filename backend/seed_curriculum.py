"""
NASSAQ Official Curriculum Seed Data
بيانات المنهج الرسمي لوزارة التعليم السعودية

ALL DATA IS READ-ONLY AND CANNOT BE MODIFIED
This module seeds the official_curriculum_* tables on startup.
"""

import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

STAGES = [
    {"id": "STG-PRIMARY", "name_ar": "المرحلة الابتدائية", "name_en": "Primary", "order": 1, "grades_count": 6},
    {"id": "STG-PRIMARY-QURAN", "name_ar": "المرحلة الابتدائية — تحفيظ القرآن الكريم", "name_en": "Primary - Quran", "order": 2, "grades_count": 6},
    {"id": "STG-INTERMEDIATE", "name_ar": "المرحلة المتوسطة", "name_en": "Intermediate", "order": 3, "grades_count": 3},
    {"id": "STG-INTERMEDIATE-QURAN", "name_ar": "المرحلة المتوسطة — تحفيظ القرآن الكريم", "name_en": "Intermediate - Quran", "order": 4, "grades_count": 3},
    {"id": "STG-SECONDARY-COMMON", "name_ar": "المرحلة الثانوية — السنة المشتركة", "name_en": "Secondary Common Year", "order": 5, "grades_count": 1},
    {"id": "STG-SECONDARY-TRACKS", "name_ar": "المرحلة الثانوية — التخصصي", "name_en": "Secondary Specialized", "order": 6, "grades_count": 2},
]

TRACKS = [
    {"id": "TRK-GENERAL", "name_ar": "التعليم العام", "name_en": "General Education", "applicable_stages": ["STG-PRIMARY", "STG-INTERMEDIATE", "STG-SECONDARY-COMMON"], "order": 1},
    {"id": "TRK-QURAN", "name_ar": "تحفيظ القرآن الكريم", "name_en": "Quran Memorization", "applicable_stages": ["STG-PRIMARY-QURAN", "STG-INTERMEDIATE-QURAN"], "order": 2},
    {"id": "TRK-SEC-GENERAL", "name_ar": "المسار العام", "name_en": "General Track", "applicable_stages": ["STG-SECONDARY-TRACKS"], "order": 3},
    {"id": "TRK-SEC-CS-ENG", "name_ar": "مسار علوم الحاسب والهندسة", "name_en": "Computer Science & Engineering", "applicable_stages": ["STG-SECONDARY-TRACKS"], "order": 4},
    {"id": "TRK-SEC-HEALTH", "name_ar": "مسار الصحة والحياة", "name_en": "Health & Life", "applicable_stages": ["STG-SECONDARY-TRACKS"], "order": 5},
    {"id": "TRK-SEC-BUSINESS", "name_ar": "مسار إدارة الأعمال", "name_en": "Business Administration", "applicable_stages": ["STG-SECONDARY-TRACKS"], "order": 6},
    {"id": "TRK-SEC-SHARIA", "name_ar": "المسار الشرعي", "name_en": "Sharia Law", "applicable_stages": ["STG-SECONDARY-TRACKS"], "order": 7},
]

def _gid(stage_id, track_id, grade_num):
    return f"GRD-{stage_id.replace('STG-','')}-{track_id.replace('TRK-','')}-{grade_num}"

_primary_ar = {1: "الأول", 2: "الثاني", 3: "الثالث", 4: "الرابع", 5: "الخامس", 6: "السادس"}
_inter_ar = {1: "الأول", 2: "الثاني", 3: "الثالث"}

GRADES = [
    {"id": _gid("STG-PRIMARY","TRK-GENERAL",i), "stage_id": "STG-PRIMARY", "track_id": "TRK-GENERAL",
     "name_ar": f"الصف {_primary_ar[i]} الابتدائي", "name_en": f"Primary Grade {i}", "grade_number": i, "order": i}
    for i in range(1, 7)
] + [
    {"id": _gid("STG-PRIMARY-QURAN","TRK-QURAN",i), "stage_id": "STG-PRIMARY-QURAN", "track_id": "TRK-QURAN",
     "name_ar": f"الصف {_primary_ar[i]} الابتدائي (تحفيظ)", "name_en": f"Primary Grade {i} (Quran)", "grade_number": i, "order": 10+i}
    for i in range(1, 7)
] + [
    {"id": _gid("STG-INTERMEDIATE","TRK-GENERAL",i), "stage_id": "STG-INTERMEDIATE", "track_id": "TRK-GENERAL",
     "name_ar": f"الصف {_inter_ar[i]} المتوسط", "name_en": f"Intermediate Grade {i}", "grade_number": i, "order": 20+i}
    for i in range(1, 4)
] + [
    {"id": _gid("STG-INTERMEDIATE-QURAN","TRK-QURAN",i), "stage_id": "STG-INTERMEDIATE-QURAN", "track_id": "TRK-QURAN",
     "name_ar": f"الصف {_inter_ar[i]} المتوسط (تحفيظ)", "name_en": f"Intermediate Grade {i} (Quran)", "grade_number": i, "order": 30+i}
    for i in range(1, 4)
] + [
    {"id": "GRD-SEC-COMMON-1", "stage_id": "STG-SECONDARY-COMMON", "track_id": "TRK-GENERAL",
     "name_ar": "السنة الأولى المشتركة", "name_en": "Secondary Year 1 (Common)", "grade_number": 1, "order": 40},
    {"id": "GRD-SEC-GENERAL-2", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-GENERAL",
     "name_ar": "السنة الثانية — المسار العام", "name_en": "Secondary Year 2 (General)", "grade_number": 2, "order": 50},
    {"id": "GRD-SEC-GENERAL-3", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-GENERAL",
     "name_ar": "السنة الثالثة — المسار العام", "name_en": "Secondary Year 3 (General)", "grade_number": 3, "order": 51},
    {"id": "GRD-SEC-CS-2", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-CS-ENG",
     "name_ar": "السنة الثانية — علوم الحاسب والهندسة", "name_en": "Secondary Year 2 (CS & Eng)", "grade_number": 2, "order": 52},
    {"id": "GRD-SEC-CS-3", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-CS-ENG",
     "name_ar": "السنة الثالثة — علوم الحاسب والهندسة", "name_en": "Secondary Year 3 (CS & Eng)", "grade_number": 3, "order": 53},
    {"id": "GRD-SEC-HEALTH-2", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-HEALTH",
     "name_ar": "السنة الثانية — الصحة والحياة", "name_en": "Secondary Year 2 (Health)", "grade_number": 2, "order": 54},
    {"id": "GRD-SEC-HEALTH-3", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-HEALTH",
     "name_ar": "السنة الثالثة — الصحة والحياة", "name_en": "Secondary Year 3 (Health)", "grade_number": 3, "order": 55},
    {"id": "GRD-SEC-BUS-2", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-BUSINESS",
     "name_ar": "السنة الثانية — إدارة الأعمال", "name_en": "Secondary Year 2 (Business)", "grade_number": 2, "order": 56},
    {"id": "GRD-SEC-BUS-3", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-BUSINESS",
     "name_ar": "السنة الثالثة — إدارة الأعمال", "name_en": "Secondary Year 3 (Business)", "grade_number": 3, "order": 57},
    {"id": "GRD-SEC-SHARIA-2", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-SHARIA",
     "name_ar": "السنة الثانية — المسار الشرعي", "name_en": "Secondary Year 2 (Sharia)", "grade_number": 2, "order": 58},
    {"id": "GRD-SEC-SHARIA-3", "stage_id": "STG-SECONDARY-TRACKS", "track_id": "TRK-SEC-SHARIA",
     "name_ar": "السنة الثالثة — المسار الشرعي", "name_en": "Secondary Year 3 (Sharia)", "grade_number": 3, "order": 59},
]

def _sid(name_en):
    return f"SUB-{name_en.upper().replace(' ','_').replace('&','AND')[:30]}"

SUBJECTS = [
    {"id": "SUB-QURAN", "name_ar": "القرآن الكريم والدراسات الإسلامية", "name_en": "Quran & Islamic Studies", "category": "islamic"},
    {"id": "SUB-QURAN-ONLY", "name_ar": "القرآن الكريم", "name_en": "Quran Recitation", "category": "islamic"},
    {"id": "SUB-TAJWEED", "name_ar": "التجويد", "name_en": "Tajweed", "category": "islamic"},
    {"id": "SUB-TAWHEED", "name_ar": "التوحيد", "name_en": "Tawheed", "category": "islamic"},
    {"id": "SUB-TAWHEED1", "name_ar": "التوحيد 1", "name_en": "Tawheed 1", "category": "islamic"},
    {"id": "SUB-TAWHEED2", "name_ar": "التوحيد 2", "name_en": "Tawheed 2", "category": "islamic"},
    {"id": "SUB-HADITH", "name_ar": "الحديث", "name_en": "Hadith", "category": "islamic"},
    {"id": "SUB-QURAN-TAFSIR", "name_ar": "القرآن الكريم وتفسيره", "name_en": "Quran & Tafsir", "category": "islamic"},
    {"id": "SUB-TAFSIR", "name_ar": "التفسير", "name_en": "Tafsir", "category": "islamic"},
    {"id": "SUB-FIQH", "name_ar": "الفقه", "name_en": "Fiqh", "category": "islamic"},
    {"id": "SUB-FIQH1", "name_ar": "الفقه 1", "name_en": "Fiqh 1", "category": "islamic"},
    {"id": "SUB-FIQH2", "name_ar": "الفقه 2", "name_en": "Fiqh 2", "category": "islamic"},
    {"id": "SUB-USUL-FIQH", "name_ar": "أصول الفقه", "name_en": "Usul Al-Fiqh", "category": "islamic"},
    {"id": "SUB-MUSTALAH", "name_ar": "مصطلح الحديث", "name_en": "Mustalah Al-Hadith", "category": "islamic"},
    {"id": "SUB-FARAED", "name_ar": "الفرائض", "name_en": "Faraed (Inheritance)", "category": "islamic"},
    {"id": "SUB-QIRAAT1", "name_ar": "القراءات 1", "name_en": "Qiraat 1", "category": "islamic"},
    {"id": "SUB-QIRAAT2", "name_ar": "القراءات 2", "name_en": "Qiraat 2", "category": "islamic"},
    {"id": "SUB-QURAN-SCIENCES", "name_ar": "علوم القرآن", "name_en": "Quran Sciences", "category": "islamic"},
    {"id": "SUB-ARABIC", "name_ar": "اللغة العربية", "name_en": "Arabic Language", "category": "language"},
    {"id": "SUB-KIFAYAT", "name_ar": "الكفايات اللغوية", "name_en": "Language Competencies", "category": "language"},
    {"id": "SUB-LANG-STUDIES", "name_ar": "الدراسات اللغوية", "name_en": "Language Studies", "category": "language"},
    {"id": "SUB-LITERARY", "name_ar": "الدراسات الأدبية", "name_en": "Literary Studies", "category": "language"},
    {"id": "SUB-RHETORIC", "name_ar": "الدراسات البلاغية والنقدية", "name_en": "Rhetoric & Criticism", "category": "language"},
    {"id": "SUB-ENGLISH", "name_ar": "اللغة الإنجليزية", "name_en": "English Language", "category": "language"},
    {"id": "SUB-MATH", "name_ar": "الرياضيات", "name_en": "Mathematics", "category": "science"},
    {"id": "SUB-SCIENCE", "name_ar": "العلوم", "name_en": "Science", "category": "science"},
    {"id": "SUB-BIOLOGY", "name_ar": "الأحياء", "name_en": "Biology", "category": "science"},
    {"id": "SUB-CHEMISTRY", "name_ar": "الكيمياء", "name_en": "Chemistry", "category": "science"},
    {"id": "SUB-PHYSICS", "name_ar": "الفيزياء", "name_en": "Physics", "category": "science"},
    {"id": "SUB-ENV-SCIENCE", "name_ar": "علم البيئة", "name_en": "Environmental Science", "category": "science"},
    {"id": "SUB-EARTH-SPACE", "name_ar": "علوم الأرض والفضاء", "name_en": "Earth & Space Sciences", "category": "science"},
    {"id": "SUB-STATISTICS", "name_ar": "الإحصاء", "name_en": "Statistics", "category": "science"},
    {"id": "SUB-SOCIAL", "name_ar": "الدراسات الاجتماعية", "name_en": "Social Studies", "category": "social"},
    {"id": "SUB-HISTORY", "name_ar": "التاريخ", "name_en": "History", "category": "social"},
    {"id": "SUB-GEOGRAPHY", "name_ar": "الجغرافيا", "name_en": "Geography", "category": "social"},
    {"id": "SUB-PSYCH-SOCIAL", "name_ar": "الدراسات النفسية والاجتماعية", "name_en": "Psychological & Social Studies", "category": "social"},
    {"id": "SUB-DIGITAL-SKILLS", "name_ar": "المهارات الرقمية", "name_en": "Digital Skills", "category": "technology"},
    {"id": "SUB-DIGITAL-TECH", "name_ar": "التقنية الرقمية", "name_en": "Digital Technology", "category": "technology"},
    {"id": "SUB-DATA-SCIENCE", "name_ar": "علم البيانات", "name_en": "Data Science", "category": "technology"},
    {"id": "SUB-IOT", "name_ar": "إنترنت الأشياء", "name_en": "IoT", "category": "technology"},
    {"id": "SUB-AI", "name_ar": "الذكاء الاصطناعي", "name_en": "AI", "category": "technology"},
    {"id": "SUB-CYBERSECURITY", "name_ar": "الأمن السيبراني", "name_en": "Cybersecurity", "category": "technology"},
    {"id": "SUB-SW-ENG", "name_ar": "هندسة البرمجيات", "name_en": "Software Engineering", "category": "technology"},
    {"id": "SUB-DIGITAL-CITIZEN", "name_ar": "المواطنة الرقمية", "name_en": "Digital Citizenship", "category": "technology"},
    {"id": "SUB-ENGINEERING", "name_ar": "الهندسة", "name_en": "Engineering", "category": "engineering"},
    {"id": "SUB-ENG-DESIGN", "name_ar": "التصميم الهندسي", "name_en": "Engineering Design", "category": "engineering"},
    {"id": "SUB-HEALTH-PRINCIPLES", "name_ar": "مبادئ العلوم الصحية", "name_en": "Health Science Principles", "category": "health"},
    {"id": "SUB-HEALTHCARE", "name_ar": "الرعاية الصحية", "name_en": "Healthcare", "category": "health"},
    {"id": "SUB-HUMAN-BODY", "name_ar": "أنظمة جسم الإنسان", "name_en": "Human Body Systems", "category": "health"},
    {"id": "SUB-BIZ-DECISIONS", "name_ar": "صناعة القرار في الأعمال", "name_en": "Business Decision Making", "category": "business"},
    {"id": "SUB-BIZ-INTRO", "name_ar": "مقدمة في الأعمال", "name_en": "Introduction to Business", "category": "business"},
    {"id": "SUB-ECONOMICS", "name_ar": "مبادئ الاقتصاد", "name_en": "Economics Principles", "category": "business"},
    {"id": "SUB-FIN-MGMT", "name_ar": "الإدارة المالية", "name_en": "Financial Management", "category": "business"},
    {"id": "SUB-MGMT-PRINCIPLES", "name_ar": "مبادئ الإدارة", "name_en": "Management Principles", "category": "business"},
    {"id": "SUB-EVENT-MGMT", "name_ar": "إدارة الفعاليات", "name_en": "Event Management", "category": "business"},
    {"id": "SUB-MARKETING", "name_ar": "تخطيط الحملات التسويقية", "name_en": "Marketing Campaigns", "category": "business"},
    {"id": "SUB-SECRETARY", "name_ar": "السكرتارية والإدارة المكتبية", "name_en": "Secretarial & Office Mgmt", "category": "business"},
    {"id": "SUB-FIN-LITERACY", "name_ar": "المعرفة المالية", "name_en": "Financial Literacy", "category": "business"},
    {"id": "SUB-LAW-PRINCIPLES", "name_ar": "مبادئ القانون", "name_en": "Law Principles", "category": "law"},
    {"id": "SUB-LAW-APPLIED", "name_ar": "تطبيقات في القانون", "name_en": "Applied Law", "category": "law"},
    {"id": "SUB-CRITICAL-THINK", "name_ar": "التفكير الناقد", "name_en": "Critical Thinking", "category": "skills"},
    {"id": "SUB-LIFE-SKILLS", "name_ar": "المهارات الحياتية والأسرية", "name_en": "Life & Family Skills", "category": "skills"},
    {"id": "SUB-LIFE-SKILLS2", "name_ar": "المهارات الحياتية", "name_en": "Life Skills", "category": "skills"},
    {"id": "SUB-VOCATIONAL", "name_ar": "التربية المهنية", "name_en": "Vocational Education", "category": "skills"},
    {"id": "SUB-RESEARCH", "name_ar": "البحث ومصادر المعلومات", "name_en": "Research & Information", "category": "skills"},
    {"id": "SUB-GRADUATION", "name_ar": "مشروع التخرج", "name_en": "Graduation Project", "category": "project"},
    {"id": "SUB-ART", "name_ar": "التربية الفنية", "name_en": "Art Education", "category": "arts"},
    {"id": "SUB-ARTS-GENERAL", "name_ar": "الفنون", "name_en": "Arts", "category": "arts"},
    {"id": "SUB-PE", "name_ar": "التربية البدنية والدفاع عن النفس", "name_en": "PE & Self Defense", "category": "physical"},
    {"id": "SUB-FITNESS", "name_ar": "اللياقة والثقافة الصحية", "name_en": "Fitness & Health Culture", "category": "physical"},
    {"id": "SUB-HEALTH-PE", "name_ar": "التربية الصحية والبدنية", "name_en": "Health & PE", "category": "physical"},
    {"id": "SUB-ACTIVITY", "name_ar": "النشاط", "name_en": "Activity", "category": "activity"},
    {"id": "SUB-NON-CLASS", "name_ar": "الفترات اللاصفية", "name_en": "Non-Class Periods", "category": "non_class"},
    {"id": "SUB-ELECTIVE", "name_ar": "المجال الاختياري", "name_en": "Elective Field", "category": "optional"},
]

def _detail(grade_id, subject_id, annual, period_type="class_period", order=0):
    return {"id": f"DET-{grade_id}-{subject_id}", "grade_id": grade_id, "subject_id": subject_id,
            "annual_periods": annual, "weekly_periods": round(annual / 36, 2), "period_type": period_type, "order": order}

SUBJECT_DETAILS = []
_o = [0]
def _add(gid, sid, annual, ptype="class_period"):
    _o[0] += 1
    SUBJECT_DETAILS.append(_detail(gid, sid, annual, ptype, _o[0]))

_P = lambda i: _gid("STG-PRIMARY","TRK-GENERAL",i)
_PQ = lambda i: _gid("STG-PRIMARY-QURAN","TRK-QURAN",i)
_I = lambda i: _gid("STG-INTERMEDIATE","TRK-GENERAL",i)
_IQ = lambda i: _gid("STG-INTERMEDIATE-QURAN","TRK-QURAN",i)

_add(_P(1), "SUB-QURAN", 180); _add(_P(1), "SUB-ARABIC", 288); _add(_P(1), "SUB-MATH", 180)
_add(_P(1), "SUB-SCIENCE", 108); _add(_P(1), "SUB-ENGLISH", 108); _add(_P(1), "SUB-ART", 72)
_add(_P(1), "SUB-PE", 108); _add(_P(1), "SUB-LIFE-SKILLS", 36); _add(_P(1), "SUB-ACTIVITY", 108, "activity")
_add(_P(1), "SUB-NON-CLASS", 240, "non_class")

_add(_P(2), "SUB-QURAN", 180); _add(_P(2), "SUB-ARABIC", 252); _add(_P(2), "SUB-MATH", 216)
_add(_P(2), "SUB-SCIENCE", 108); _add(_P(2), "SUB-ENGLISH", 108); _add(_P(2), "SUB-ART", 72)
_add(_P(2), "SUB-PE", 108); _add(_P(2), "SUB-LIFE-SKILLS", 36); _add(_P(2), "SUB-ACTIVITY", 108, "activity")
_add(_P(2), "SUB-NON-CLASS", 240, "non_class")

_add(_P(3), "SUB-QURAN", 180); _add(_P(3), "SUB-ARABIC", 216); _add(_P(3), "SUB-MATH", 216)
_add(_P(3), "SUB-SCIENCE", 144); _add(_P(3), "SUB-ENGLISH", 108); _add(_P(3), "SUB-ART", 72)
_add(_P(3), "SUB-PE", 108); _add(_P(3), "SUB-LIFE-SKILLS", 36); _add(_P(3), "SUB-ACTIVITY", 108, "activity")
_add(_P(3), "SUB-NON-CLASS", 240, "non_class")

_add(_P(4), "SUB-QURAN", 180); _add(_P(4), "SUB-ARABIC", 180); _add(_P(4), "SUB-SOCIAL", 72)
_add(_P(4), "SUB-MATH", 216); _add(_P(4), "SUB-SCIENCE", 144); _add(_P(4), "SUB-ENGLISH", 108)
_add(_P(4), "SUB-DIGITAL-SKILLS", 72); _add(_P(4), "SUB-ART", 36); _add(_P(4), "SUB-PE", 72)
_add(_P(4), "SUB-LIFE-SKILLS", 36); _add(_P(4), "SUB-ACTIVITY", 72, "activity")
_add(_P(4), "SUB-NON-CLASS", 240, "non_class")

_add(_P(5), "SUB-QURAN", 180); _add(_P(5), "SUB-ARABIC", 180); _add(_P(5), "SUB-SOCIAL", 72)
_add(_P(5), "SUB-MATH", 216); _add(_P(5), "SUB-SCIENCE", 144); _add(_P(5), "SUB-ENGLISH", 108)
_add(_P(5), "SUB-DIGITAL-SKILLS", 72); _add(_P(5), "SUB-ART", 36); _add(_P(5), "SUB-PE", 72)
_add(_P(5), "SUB-LIFE-SKILLS", 36); _add(_P(5), "SUB-ACTIVITY", 72, "activity")
_add(_P(5), "SUB-NON-CLASS", 240, "non_class")

_add(_P(6), "SUB-QURAN", 180); _add(_P(6), "SUB-ARABIC", 180); _add(_P(6), "SUB-SOCIAL", 72)
_add(_P(6), "SUB-MATH", 216); _add(_P(6), "SUB-SCIENCE", 144); _add(_P(6), "SUB-ENGLISH", 108)
_add(_P(6), "SUB-DIGITAL-SKILLS", 72); _add(_P(6), "SUB-ART", 36); _add(_P(6), "SUB-PE", 72)
_add(_P(6), "SUB-LIFE-SKILLS", 36); _add(_P(6), "SUB-ACTIVITY", 72, "activity")
_add(_P(6), "SUB-NON-CLASS", 240, "non_class")

_add(_PQ(1), "SUB-QURAN", 324); _add(_PQ(1), "SUB-ARABIC", 288); _add(_PQ(1), "SUB-MATH", 180)
_add(_PQ(1), "SUB-SCIENCE", 108); _add(_PQ(1), "SUB-ENGLISH", 108); _add(_PQ(1), "SUB-ART", 72)
_add(_PQ(1), "SUB-PE", 108); _add(_PQ(1), "SUB-LIFE-SKILLS", 36); _add(_PQ(1), "SUB-ACTIVITY", 101, "activity")
_add(_PQ(1), "SUB-NON-CLASS", 240, "non_class")

_add(_PQ(2), "SUB-QURAN", 324); _add(_PQ(2), "SUB-ARABIC", 252); _add(_PQ(2), "SUB-MATH", 216)
_add(_PQ(2), "SUB-SCIENCE", 108); _add(_PQ(2), "SUB-ENGLISH", 108); _add(_PQ(2), "SUB-ART", 72)
_add(_PQ(2), "SUB-PE", 108); _add(_PQ(2), "SUB-LIFE-SKILLS", 36); _add(_PQ(2), "SUB-ACTIVITY", 101, "activity")
_add(_PQ(2), "SUB-NON-CLASS", 240, "non_class")

_add(_PQ(3), "SUB-QURAN", 324); _add(_PQ(3), "SUB-ARABIC", 216); _add(_PQ(3), "SUB-MATH", 216)
_add(_PQ(3), "SUB-SCIENCE", 144); _add(_PQ(3), "SUB-ENGLISH", 108); _add(_PQ(3), "SUB-ART", 72)
_add(_PQ(3), "SUB-PE", 108); _add(_PQ(3), "SUB-LIFE-SKILLS", 36); _add(_PQ(3), "SUB-ACTIVITY", 101, "activity")
_add(_PQ(3), "SUB-NON-CLASS", 240, "non_class")

_add(_PQ(4), "SUB-QURAN", 288); _add(_PQ(4), "SUB-TAJWEED", 36); _add(_PQ(4), "SUB-ARABIC", 180)
_add(_PQ(4), "SUB-SOCIAL", 72); _add(_PQ(4), "SUB-MATH", 216); _add(_PQ(4), "SUB-SCIENCE", 144)
_add(_PQ(4), "SUB-ENGLISH", 108); _add(_PQ(4), "SUB-DIGITAL-SKILLS", 72); _add(_PQ(4), "SUB-ART", 36)
_add(_PQ(4), "SUB-PE", 72); _add(_PQ(4), "SUB-LIFE-SKILLS", 36); _add(_PQ(4), "SUB-ACTIVITY", 67, "activity")
_add(_PQ(4), "SUB-NON-CLASS", 240, "non_class")

_add(_PQ(5), "SUB-QURAN", 288); _add(_PQ(5), "SUB-TAJWEED", 36); _add(_PQ(5), "SUB-ARABIC", 180)
_add(_PQ(5), "SUB-SOCIAL", 72); _add(_PQ(5), "SUB-MATH", 216); _add(_PQ(5), "SUB-SCIENCE", 144)
_add(_PQ(5), "SUB-ENGLISH", 108); _add(_PQ(5), "SUB-DIGITAL-SKILLS", 72); _add(_PQ(5), "SUB-ART", 36)
_add(_PQ(5), "SUB-PE", 72); _add(_PQ(5), "SUB-LIFE-SKILLS", 36); _add(_PQ(5), "SUB-ACTIVITY", 67, "activity")
_add(_PQ(5), "SUB-NON-CLASS", 240, "non_class")

_add(_PQ(6), "SUB-QURAN", 288); _add(_PQ(6), "SUB-TAJWEED", 36); _add(_PQ(6), "SUB-ARABIC", 180)
_add(_PQ(6), "SUB-SOCIAL", 72); _add(_PQ(6), "SUB-MATH", 216); _add(_PQ(6), "SUB-SCIENCE", 144)
_add(_PQ(6), "SUB-ENGLISH", 108); _add(_PQ(6), "SUB-DIGITAL-SKILLS", 72); _add(_PQ(6), "SUB-ART", 36)
_add(_PQ(6), "SUB-PE", 72); _add(_PQ(6), "SUB-LIFE-SKILLS", 36); _add(_PQ(6), "SUB-ACTIVITY", 67, "activity")
_add(_PQ(6), "SUB-NON-CLASS", 240, "non_class")

_add(_I(1), "SUB-QURAN", 180); _add(_I(1), "SUB-ARABIC", 180); _add(_I(1), "SUB-SOCIAL", 108)
_add(_I(1), "SUB-MATH", 216); _add(_I(1), "SUB-SCIENCE", 144); _add(_I(1), "SUB-ENGLISH", 144)
_add(_I(1), "SUB-DIGITAL-SKILLS", 72); _add(_I(1), "SUB-ART", 72); _add(_I(1), "SUB-PE", 72)
_add(_I(1), "SUB-LIFE-SKILLS", 36); _add(_I(1), "SUB-ACTIVITY", 36, "activity")
_add(_I(1), "SUB-NON-CLASS", 240, "non_class")

_add(_I(2), "SUB-QURAN", 180); _add(_I(2), "SUB-ARABIC", 180); _add(_I(2), "SUB-SOCIAL", 108)
_add(_I(2), "SUB-MATH", 216); _add(_I(2), "SUB-SCIENCE", 144); _add(_I(2), "SUB-ENGLISH", 144)
_add(_I(2), "SUB-DIGITAL-SKILLS", 72); _add(_I(2), "SUB-ART", 72); _add(_I(2), "SUB-PE", 72)
_add(_I(2), "SUB-LIFE-SKILLS", 36); _add(_I(2), "SUB-ACTIVITY", 36, "activity")
_add(_I(2), "SUB-NON-CLASS", 240, "non_class")

_add(_I(3), "SUB-QURAN", 180); _add(_I(3), "SUB-ARABIC", 144); _add(_I(3), "SUB-SOCIAL", 72)
_add(_I(3), "SUB-MATH", 216); _add(_I(3), "SUB-SCIENCE", 144); _add(_I(3), "SUB-ENGLISH", 144)
_add(_I(3), "SUB-DIGITAL-SKILLS", 72); _add(_I(3), "SUB-ART", 72); _add(_I(3), "SUB-PE", 72)
_add(_I(3), "SUB-LIFE-SKILLS", 36); _add(_I(3), "SUB-CRITICAL-THINK", 72)
_add(_I(3), "SUB-ACTIVITY", 36, "activity"); _add(_I(3), "SUB-NON-CLASS", 240, "non_class")

_add(_IQ(1), "SUB-QURAN", 288); _add(_IQ(1), "SUB-TAJWEED", 36); _add(_IQ(1), "SUB-ARABIC", 180)
_add(_IQ(1), "SUB-SOCIAL", 72); _add(_IQ(1), "SUB-MATH", 216); _add(_IQ(1), "SUB-SCIENCE", 144)
_add(_IQ(1), "SUB-ENGLISH", 144); _add(_IQ(1), "SUB-DIGITAL-SKILLS", 72); _add(_IQ(1), "SUB-ART", 36)
_add(_IQ(1), "SUB-PE", 36); _add(_IQ(1), "SUB-LIFE-SKILLS", 36)
_add(_IQ(1), "SUB-ACTIVITY", 67, "activity"); _add(_IQ(1), "SUB-NON-CLASS", 240, "non_class")

_add(_IQ(2), "SUB-QURAN", 288); _add(_IQ(2), "SUB-TAJWEED", 36); _add(_IQ(2), "SUB-ARABIC", 180)
_add(_IQ(2), "SUB-SOCIAL", 72); _add(_IQ(2), "SUB-MATH", 216); _add(_IQ(2), "SUB-SCIENCE", 144)
_add(_IQ(2), "SUB-ENGLISH", 144); _add(_IQ(2), "SUB-DIGITAL-SKILLS", 72); _add(_IQ(2), "SUB-ART", 36)
_add(_IQ(2), "SUB-PE", 36); _add(_IQ(2), "SUB-LIFE-SKILLS", 36)
_add(_IQ(2), "SUB-ACTIVITY", 67, "activity"); _add(_IQ(2), "SUB-NON-CLASS", 240, "non_class")

_add(_IQ(3), "SUB-QURAN", 252); _add(_IQ(3), "SUB-TAJWEED", 36); _add(_IQ(3), "SUB-ARABIC", 144)
_add(_IQ(3), "SUB-SOCIAL", 72); _add(_IQ(3), "SUB-MATH", 216); _add(_IQ(3), "SUB-SCIENCE", 144)
_add(_IQ(3), "SUB-ENGLISH", 144); _add(_IQ(3), "SUB-DIGITAL-SKILLS", 72); _add(_IQ(3), "SUB-ART", 36)
_add(_IQ(3), "SUB-PE", 36); _add(_IQ(3), "SUB-LIFE-SKILLS", 36); _add(_IQ(3), "SUB-CRITICAL-THINK", 72)
_add(_IQ(3), "SUB-ACTIVITY", 67, "activity"); _add(_IQ(3), "SUB-NON-CLASS", 240, "non_class")

_SC = "GRD-SEC-COMMON-1"
_add(_SC, "SUB-QURAN-TAFSIR", 60); _add(_SC, "SUB-MATH", 180); _add(_SC, "SUB-ENGLISH", 180)
_add(_SC, "SUB-DIGITAL-TECH", 108); _add(_SC, "SUB-BIOLOGY", 60); _add(_SC, "SUB-CHEMISTRY", 60)
_add(_SC, "SUB-PHYSICS", 60); _add(_SC, "SUB-ENV-SCIENCE", 36); _add(_SC, "SUB-KIFAYAT", 120)
_add(_SC, "SUB-HADITH", 36); _add(_SC, "SUB-FIN-LITERACY", 36); _add(_SC, "SUB-SOCIAL", 60)
_add(_SC, "SUB-CRITICAL-THINK", 48); _add(_SC, "SUB-VOCATIONAL", 36); _add(_SC, "SUB-HEALTH-PE", 72)
_add(_SC, "SUB-ACTIVITY", 60, "activity"); _add(_SC, "SUB-NON-CLASS", 216, "non_class")

_SG2 = "GRD-SEC-GENERAL-2"
_add(_SG2, "SUB-MATH", 180); _add(_SG2, "SUB-ENGLISH", 180); _add(_SG2, "SUB-CHEMISTRY", 180)
_add(_SG2, "SUB-BIOLOGY", 144); _add(_SG2, "SUB-PHYSICS", 60); _add(_SG2, "SUB-TAWHEED", 36)
_add(_SG2, "SUB-KIFAYAT", 72); _add(_SG2, "SUB-DIGITAL-TECH", 72); _add(_SG2, "SUB-HISTORY", 60)
_add(_SG2, "SUB-ARTS-GENERAL", 36); _add(_SG2, "SUB-FITNESS", 60)
_add(_SG2, "SUB-ACTIVITY", 72, "activity"); _add(_SG2, "SUB-NON-CLASS", 216, "non_class")

_SG3 = "GRD-SEC-GENERAL-3"
_add(_SG3, "SUB-MATH", 144); _add(_SG3, "SUB-ENGLISH", 144); _add(_SG3, "SUB-CHEMISTRY", 60)
_add(_SG3, "SUB-PHYSICS", 180); _add(_SG3, "SUB-EARTH-SPACE", 96); _add(_SG3, "SUB-FIQH", 36)
_add(_SG3, "SUB-LITERARY", 36); _add(_SG3, "SUB-PSYCH-SOCIAL", 36); _add(_SG3, "SUB-DIGITAL-TECH", 36)
_add(_SG3, "SUB-DIGITAL-CITIZEN", 36); _add(_SG3, "SUB-GEOGRAPHY", 36); _add(_SG3, "SUB-LIFE-SKILLS2", 36)
_add(_SG3, "SUB-HEALTH-PE", 48); _add(_SG3, "SUB-RESEARCH", 36); _add(_SG3, "SUB-ELECTIVE", 120, "elective")
_add(_SG3, "SUB-ACTIVITY", 72, "activity"); _add(_SG3, "SUB-NON-CLASS", 216, "non_class")

_CS2 = "GRD-SEC-CS-2"
_add(_CS2, "SUB-MATH", 180); _add(_CS2, "SUB-ENGLISH", 180); _add(_CS2, "SUB-CHEMISTRY", 180)
_add(_CS2, "SUB-BIOLOGY", 144); _add(_CS2, "SUB-PHYSICS", 60); _add(_CS2, "SUB-TAWHEED", 36)
_add(_CS2, "SUB-KIFAYAT", 72); _add(_CS2, "SUB-DATA-SCIENCE", 36); _add(_CS2, "SUB-IOT", 72)
_add(_CS2, "SUB-ENGINEERING", 60); _add(_CS2, "SUB-FITNESS", 60)
_add(_CS2, "SUB-ACTIVITY", 72, "activity"); _add(_CS2, "SUB-NON-CLASS", 216, "non_class")

_CS3 = "GRD-SEC-CS-3"
_add(_CS3, "SUB-MATH", 144); _add(_CS3, "SUB-ENGLISH", 144); _add(_CS3, "SUB-CHEMISTRY", 60)
_add(_CS3, "SUB-PHYSICS", 180); _add(_CS3, "SUB-EARTH-SPACE", 96); _add(_CS3, "SUB-FIQH", 36)
_add(_CS3, "SUB-LITERARY", 36); _add(_CS3, "SUB-AI", 84); _add(_CS3, "SUB-CYBERSECURITY", 36)
_add(_CS3, "SUB-SW-ENG", 60); _add(_CS3, "SUB-ENG-DESIGN", 48); _add(_CS3, "SUB-LIFE-SKILLS2", 36)
_add(_CS3, "SUB-HEALTH-PE", 48); _add(_CS3, "SUB-RESEARCH", 36); _add(_CS3, "SUB-GRADUATION", 36)
_add(_CS3, "SUB-ACTIVITY", 72, "activity"); _add(_CS3, "SUB-NON-CLASS", 216, "non_class")

_HL2 = "GRD-SEC-HEALTH-2"
_add(_HL2, "SUB-MATH", 180); _add(_HL2, "SUB-ENGLISH", 180); _add(_HL2, "SUB-CHEMISTRY", 180)
_add(_HL2, "SUB-BIOLOGY", 144); _add(_HL2, "SUB-PHYSICS", 60); _add(_HL2, "SUB-TAWHEED", 36)
_add(_HL2, "SUB-KIFAYAT", 72); _add(_HL2, "SUB-DIGITAL-TECH", 72); _add(_HL2, "SUB-HEALTH-PRINCIPLES", 96)
_add(_HL2, "SUB-FITNESS", 60)
_add(_HL2, "SUB-ACTIVITY", 72, "activity"); _add(_HL2, "SUB-NON-CLASS", 216, "non_class")

_HL3 = "GRD-SEC-HEALTH-3"
_add(_HL3, "SUB-MATH", 144); _add(_HL3, "SUB-ENGLISH", 144); _add(_HL3, "SUB-CHEMISTRY", 60)
_add(_HL3, "SUB-PHYSICS", 180); _add(_HL3, "SUB-EARTH-SPACE", 96); _add(_HL3, "SUB-FIQH", 36)
_add(_HL3, "SUB-LITERARY", 36); _add(_HL3, "SUB-HEALTHCARE", 108); _add(_HL3, "SUB-HUMAN-BODY", 84)
_add(_HL3, "SUB-STATISTICS", 36); _add(_HL3, "SUB-LIFE-SKILLS2", 36); _add(_HL3, "SUB-HEALTH-PE", 48)
_add(_HL3, "SUB-RESEARCH", 36); _add(_HL3, "SUB-GRADUATION", 36)
_add(_HL3, "SUB-ACTIVITY", 72, "activity"); _add(_HL3, "SUB-NON-CLASS", 216, "non_class")

_BZ2 = "GRD-SEC-BUS-2"
_add(_BZ2, "SUB-ENGLISH", 180); _add(_BZ2, "SUB-TAWHEED", 36); _add(_BZ2, "SUB-TAFSIR", 36)
_add(_BZ2, "SUB-KIFAYAT", 72); _add(_BZ2, "SUB-LANG-STUDIES", 60); _add(_BZ2, "SUB-BIZ-DECISIONS", 156)
_add(_BZ2, "SUB-BIZ-INTRO", 120); _add(_BZ2, "SUB-ECONOMICS", 48); _add(_BZ2, "SUB-FIN-MGMT", 108)
_add(_BZ2, "SUB-DIGITAL-TECH", 72); _add(_BZ2, "SUB-HISTORY", 60); _add(_BZ2, "SUB-ARTS-GENERAL", 36)
_add(_BZ2, "SUB-FITNESS", 60)
_add(_BZ2, "SUB-ACTIVITY", 108, "activity"); _add(_BZ2, "SUB-NON-CLASS", 216, "non_class")

_BZ3 = "GRD-SEC-BUS-3"
_add(_BZ3, "SUB-ENGLISH", 144); _add(_BZ3, "SUB-FIQH", 36); _add(_BZ3, "SUB-LITERARY", 36)
_add(_BZ3, "SUB-PSYCH-SOCIAL", 36); _add(_BZ3, "SUB-RHETORIC", 48); _add(_BZ3, "SUB-MGMT-PRINCIPLES", 60)
_add(_BZ3, "SUB-EVENT-MGMT", 120); _add(_BZ3, "SUB-MARKETING", 120); _add(_BZ3, "SUB-SECRETARY", 60)
_add(_BZ3, "SUB-LAW-PRINCIPLES", 120); _add(_BZ3, "SUB-LAW-APPLIED", 36); _add(_BZ3, "SUB-DIGITAL-CITIZEN", 36)
_add(_BZ3, "SUB-STATISTICS", 36); _add(_BZ3, "SUB-GEOGRAPHY", 36); _add(_BZ3, "SUB-LIFE-SKILLS2", 36)
_add(_BZ3, "SUB-HEALTH-PE", 48); _add(_BZ3, "SUB-RESEARCH", 36); _add(_BZ3, "SUB-GRADUATION", 36)
_add(_BZ3, "SUB-ACTIVITY", 72, "activity"); _add(_BZ3, "SUB-NON-CLASS", 216, "non_class")

_SH2 = "GRD-SEC-SHARIA-2"
_add(_SH2, "SUB-QURAN-ONLY", 180); _add(_SH2, "SUB-ENGLISH", 180); _add(_SH2, "SUB-TAWHEED1", 36)
_add(_SH2, "SUB-TAWHEED2", 36); _add(_SH2, "SUB-HADITH", 36); _add(_SH2, "SUB-QIRAAT1", 60)
_add(_SH2, "SUB-QIRAAT2", 60); _add(_SH2, "SUB-QURAN-SCIENCES", 60); _add(_SH2, "SUB-TAFSIR", 36)
_add(_SH2, "SUB-KIFAYAT", 72); _add(_SH2, "SUB-LANG-STUDIES", 60); _add(_SH2, "SUB-DIGITAL-TECH", 72)
_add(_SH2, "SUB-HISTORY", 60); _add(_SH2, "SUB-ARTS-GENERAL", 36); _add(_SH2, "SUB-FITNESS", 60)
_add(_SH2, "SUB-ACTIVITY", 108, "activity"); _add(_SH2, "SUB-NON-CLASS", 216, "non_class")

_SH3 = "GRD-SEC-SHARIA-3"
_add(_SH3, "SUB-QURAN-ONLY", 180); _add(_SH3, "SUB-ENGLISH", 144); _add(_SH3, "SUB-TAFSIR", 36)
_add(_SH3, "SUB-FIQH1", 36); _add(_SH3, "SUB-FIQH2", 60); _add(_SH3, "SUB-USUL-FIQH", 36)
_add(_SH3, "SUB-MUSTALAH", 36); _add(_SH3, "SUB-FARAED", 48); _add(_SH3, "SUB-LITERARY", 36)
_add(_SH3, "SUB-PSYCH-SOCIAL", 36); _add(_SH3, "SUB-RHETORIC", 48); _add(_SH3, "SUB-LAW-PRINCIPLES", 120)
_add(_SH3, "SUB-LAW-APPLIED", 36); _add(_SH3, "SUB-DIGITAL-CITIZEN", 36); _add(_SH3, "SUB-GEOGRAPHY", 36)
_add(_SH3, "SUB-LIFE-SKILLS2", 36); _add(_SH3, "SUB-HEALTH-PE", 48); _add(_SH3, "SUB-RESEARCH", 36)
_add(_SH3, "SUB-GRADUATION", 36)
_add(_SH3, "SUB-ACTIVITY", 72, "activity"); _add(_SH3, "SUB-NON-CLASS", 216, "non_class")

TEACHER_RANK_LOADS = [
    {"id": "RANK-TEACHER", "rank_name_ar": "معلم / معلم ممارس", "rank_name_en": "Teacher / Practitioner", "weekly_periods": 24, "is_special_ed": False, "order": 1},
    {"id": "RANK-TEACHER-SPED", "rank_name_ar": "معلم ممارس (التربية الخاصة)", "rank_name_en": "Practitioner (Special Ed)", "weekly_periods": 18, "is_special_ed": True, "order": 2},
    {"id": "RANK-ADVANCED", "rank_name_ar": "معلم متقدم", "rank_name_en": "Advanced Teacher", "weekly_periods": 22, "is_special_ed": False, "order": 3},
    {"id": "RANK-ADVANCED-SPED", "rank_name_ar": "معلم متقدم (التربية الخاصة)", "rank_name_en": "Advanced (Special Ed)", "weekly_periods": 16, "is_special_ed": True, "order": 4},
    {"id": "RANK-EXPERT", "rank_name_ar": "معلم خبير", "rank_name_en": "Expert Teacher", "weekly_periods": 18, "is_special_ed": False, "order": 5},
    {"id": "RANK-EXPERT-SPED", "rank_name_ar": "معلم خبير (التربية الخاصة)", "rank_name_en": "Expert (Special Ed)", "weekly_periods": 14, "is_special_ed": True, "order": 6},
]

BELL_SCHEDULES = [
    {
        "id": "BELL-PRIMARY-INTER",
        "name_ar": "جدول الحصص — الابتدائي والمتوسط",
        "name_en": "Bell Schedule - Primary & Intermediate",
        "period_duration_minutes": 45,
        "periods_per_day": 8,
        "applicable_stages": ["STG-PRIMARY", "STG-PRIMARY-QURAN", "STG-INTERMEDIATE", "STG-INTERMEDIATE-QURAN"],
        "slots": [
            {"order": 0, "type": "assembly", "name_ar": "الطابور الصباحي", "start": "06:45", "end": "07:00"},
            {"order": 1, "type": "period", "name_ar": "الحصة الأولى", "start": "07:00", "end": "07:45"},
            {"order": 2, "type": "period", "name_ar": "الحصة الثانية", "start": "07:45", "end": "08:30"},
            {"order": 3, "type": "period", "name_ar": "الحصة الثالثة", "start": "08:30", "end": "09:15"},
            {"order": 4, "type": "break", "name_ar": "الاستراحة", "start": "09:15", "end": "09:45"},
            {"order": 5, "type": "period", "name_ar": "الحصة الرابعة", "start": "09:45", "end": "10:30"},
            {"order": 6, "type": "period", "name_ar": "الحصة الخامسة", "start": "10:30", "end": "11:15"},
            {"order": 7, "type": "period", "name_ar": "الحصة السادسة", "start": "11:15", "end": "12:00"},
            {"order": 8, "type": "prayer", "name_ar": "صلاة الظهر", "start": "12:00", "end": "12:20"},
            {"order": 9, "type": "period", "name_ar": "الحصة السابعة", "start": "12:20", "end": "13:05"},
            {"order": 10, "type": "period", "name_ar": "الحصة الثامنة", "start": "13:05", "end": "13:50"},
        ]
    },
    {
        "id": "BELL-SECONDARY",
        "name_ar": "جدول الحصص — الثانوي",
        "name_en": "Bell Schedule - Secondary",
        "period_duration_minutes": 50,
        "periods_per_day": 8,
        "applicable_stages": ["STG-SECONDARY-COMMON", "STG-SECONDARY-TRACKS"],
        "slots": [
            {"order": 0, "type": "assembly", "name_ar": "الطابور الصباحي", "start": "06:45", "end": "07:00"},
            {"order": 1, "type": "period", "name_ar": "الحصة الأولى", "start": "07:00", "end": "07:50"},
            {"order": 2, "type": "period", "name_ar": "الحصة الثانية", "start": "07:50", "end": "08:40"},
            {"order": 3, "type": "period", "name_ar": "الحصة الثالثة", "start": "08:40", "end": "09:30"},
            {"order": 4, "type": "break", "name_ar": "الاستراحة", "start": "09:30", "end": "10:00"},
            {"order": 5, "type": "period", "name_ar": "الحصة الرابعة", "start": "10:00", "end": "10:50"},
            {"order": 6, "type": "period", "name_ar": "الحصة الخامسة", "start": "10:50", "end": "11:40"},
            {"order": 7, "type": "period", "name_ar": "الحصة السادسة", "start": "11:40", "end": "12:30"},
            {"order": 8, "type": "prayer", "name_ar": "صلاة الظهر", "start": "12:30", "end": "12:50"},
            {"order": 9, "type": "period", "name_ar": "الحصة السابعة", "start": "12:50", "end": "13:40"},
            {"order": 10, "type": "period", "name_ar": "الحصة الثامنة", "start": "13:40", "end": "14:30"},
        ]
    }
]

ACADEMIC_YEARS = [
    {
        "id": "AY-1446-1447",
        "name_ar": "العام الدراسي 1446-1447 هـ",
        "name_en": "Academic Year 1446-1447 H",
        "hijri_year": "1446-1447",
        "gregorian_start": "2024-08-18",
        "gregorian_end": "2025-06-19",
        "is_current": True,
        "terms": [
            {"id": "TERM-1446-1", "name_ar": "الفصل الدراسي الأول", "name_en": "Term 1", "term_number": 1, "weeks": 13, "start_date": "2024-08-18", "end_date": "2024-11-14"},
            {"id": "TERM-1446-2", "name_ar": "الفصل الدراسي الثاني", "name_en": "Term 2", "term_number": 2, "weeks": 13, "start_date": "2024-11-24", "end_date": "2025-02-20"},
            {"id": "TERM-1446-3", "name_ar": "الفصل الدراسي الثالث", "name_en": "Term 3", "term_number": 3, "weeks": 10, "start_date": "2025-03-02", "end_date": "2025-06-19"},
        ]
    }
]


async def seed_official_curriculum(db):
    now = datetime.now(timezone.utc).isoformat()
    total_inserted = {"stages": 0, "tracks": 0, "grades": 0, "subjects": 0, "details": 0, "ranks": 0, "bells": 0, "years": 0}

    for stage in STAGES:
        existing = await db.official_curriculum_stages.find_one({"id": stage["id"]})
        if not existing:
            await db.official_curriculum_stages.insert_one({**stage, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["stages"] += 1

    for track in TRACKS:
        existing = await db.official_curriculum_tracks.find_one({"id": track["id"]})
        if not existing:
            await db.official_curriculum_tracks.insert_one({**track, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["tracks"] += 1

    for grade in GRADES:
        existing = await db.official_curriculum_grades.find_one({"id": grade["id"]})
        if not existing:
            await db.official_curriculum_grades.insert_one({**grade, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["grades"] += 1

    for subject in SUBJECTS:
        existing = await db.official_curriculum_subjects.find_one({"id": subject["id"]})
        if not existing:
            await db.official_curriculum_subjects.insert_one({**subject, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["subjects"] += 1

    for detail in SUBJECT_DETAILS:
        existing = await db.official_curriculum_subject_details.find_one({"id": detail["id"]})
        if not existing:
            await db.official_curriculum_subject_details.insert_one({**detail, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["details"] += 1

    for rank in TEACHER_RANK_LOADS:
        existing = await db.official_teacher_rank_loads.find_one({"id": rank["id"]})
        if not existing:
            await db.official_teacher_rank_loads.insert_one({**rank, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["ranks"] += 1

    for bell in BELL_SCHEDULES:
        existing = await db.official_bell_schedules.find_one({"id": bell["id"]})
        if not existing:
            await db.official_bell_schedules.insert_one({**bell, "is_official": True, "is_locked": True, "created_at": now})
            total_inserted["bells"] += 1

    for ay in ACADEMIC_YEARS:
        existing = await db.academic_years.find_one({"id": ay["id"]})
        if not existing:
            terms = ay.pop("terms")
            await db.academic_years.insert_one({**ay, "is_official": True, "created_at": now})
            total_inserted["years"] += 1
            for term in terms:
                existing_term = await db.academic_terms.find_one({"id": term["id"]})
                if not existing_term:
                    await db.academic_terms.insert_one({**term, "academic_year_id": ay["id"], "is_official": True, "created_at": now})

    logger.info(f"Official curriculum seeding complete: {total_inserted}")
    return total_inserted


async def seed_demo_school_data(db, hash_password_fn):
    now = datetime.now(timezone.utc).isoformat()
    school_id = "SCH-001"
    inserted = {"teachers": 0, "students": 0, "classes": 0, "parents": 0}

    teachers = [
        {"id": "TCH-001", "full_name": "أ. سعاد الشمري", "email": "teacher1@nassaq.com", "subject_specialization": "SUB-ARABIC", "rank": "RANK-TEACHER"},
        {"id": "TCH-002", "full_name": "أ. خالد العتيبي", "email": "teacher2@nassaq.com", "subject_specialization": "SUB-MATH", "rank": "RANK-TEACHER"},
        {"id": "TCH-003", "full_name": "أ. نورة القحطاني", "email": "teacher3@nassaq.com", "subject_specialization": "SUB-SCIENCE", "rank": "RANK-ADVANCED"},
        {"id": "TCH-004", "full_name": "أ. فهد المالكي", "email": "teacher4@nassaq.com", "subject_specialization": "SUB-ENGLISH", "rank": "RANK-TEACHER"},
        {"id": "TCH-005", "full_name": "أ. مريم الزهراني", "email": "teacher5@nassaq.com", "subject_specialization": "SUB-QURAN", "rank": "RANK-EXPERT"},
        {"id": "TCH-006", "full_name": "أ. عبدالله الحربي", "email": "teacher6@nassaq.com", "subject_specialization": "SUB-PE", "rank": "RANK-TEACHER"},
        {"id": "TCH-007", "full_name": "أ. هند الدوسري", "email": "teacher7@nassaq.com", "subject_specialization": "SUB-ART", "rank": "RANK-TEACHER"},
        {"id": "TCH-008", "full_name": "أ. سلطان العمري", "email": "teacher8@nassaq.com", "subject_specialization": "SUB-SOCIAL", "rank": "RANK-ADVANCED"},
        {"id": "TCH-009", "full_name": "أ. لطيفة السبيعي", "email": "teacher9@nassaq.com", "subject_specialization": "SUB-DIGITAL-SKILLS", "rank": "RANK-TEACHER"},
        {"id": "TCH-010", "full_name": "أ. ماجد الغامدي", "email": "teacher10@nassaq.com", "subject_specialization": "SUB-LIFE-SKILLS", "rank": "RANK-TEACHER"},
    ]

    pw_hash = hash_password_fn("Teacher@123")
    for t in teachers:
        existing = await db.users.find_one({"email": t["email"]})
        if not existing:
            await db.users.insert_one({
                "id": t["id"], "email": t["email"], "password_hash": pw_hash,
                "full_name": t["full_name"], "role": "teacher", "tenant_id": school_id,
                "school_id": school_id,
                "is_active": True, "preferred_language": "ar", "created_at": now, "updated_at": now
            })
            await db.teachers.insert_one({
                "id": t["id"], "user_id": t["id"], "tenant_id": school_id,
                "school_id": school_id,
                "full_name": t["full_name"], "email": t["email"],
                "subject_specialization": t["subject_specialization"],
                "rank": t["rank"], "is_active": True, "created_at": now
            })
            inserted["teachers"] += 1

    classes_data = [
        {"id": "CLS-001", "name_ar": "1/أ", "name_en": "1A", "grade_id": "GRD-PRIMARY-GENERAL-1", "stage_id": "STG-PRIMARY", "capacity": 30},
        {"id": "CLS-002", "name_ar": "1/ب", "name_en": "1B", "grade_id": "GRD-PRIMARY-GENERAL-1", "stage_id": "STG-PRIMARY", "capacity": 30},
        {"id": "CLS-003", "name_ar": "2/أ", "name_en": "2A", "grade_id": "GRD-PRIMARY-GENERAL-2", "stage_id": "STG-PRIMARY", "capacity": 30},
        {"id": "CLS-004", "name_ar": "2/ب", "name_en": "2B", "grade_id": "GRD-PRIMARY-GENERAL-2", "stage_id": "STG-PRIMARY", "capacity": 30},
        {"id": "CLS-005", "name_ar": "3/أ", "name_en": "3A", "grade_id": "GRD-PRIMARY-GENERAL-3", "stage_id": "STG-PRIMARY", "capacity": 30},
        {"id": "CLS-006", "name_ar": "3/ب", "name_en": "3B", "grade_id": "GRD-PRIMARY-GENERAL-3", "stage_id": "STG-PRIMARY", "capacity": 30},
    ]

    for c in classes_data:
        existing = await db.classes.find_one({"id": c["id"]})
        if not existing:
            await db.classes.insert_one({
                **c, "tenant_id": school_id, "school_id": school_id,
                "track_id": "TRK-GENERAL", "name": c["name_ar"],
                "is_active": True, "student_count": 0, "created_at": now
            })
            inserted["classes"] += 1

    student_names = [
        "محمد أحمد", "عبدالرحمن سعد", "فيصل خالد", "ريان عمر", "يوسف علي",
        "سارة إبراهيم", "نورة سلطان", "لمى فهد", "دانة ناصر", "حصة عبدالله",
        "تركي ماجد", "سلمان حسن", "عمر طلال", "بندر سعود", "نايف مشعل",
        "هيفاء حمد", "جود بدر", "لين عادل", "ريم صالح", "غادة منصور",
        "أنس وليد", "زياد راشد", "مشاري فارس", "عبدالعزيز نواف", "طلال سامي",
        "شهد يزيد", "أروى ثامر", "عفاف كريم", "بيان حمود", "ملاك عبدالملك",
    ]

    parent_pw = hash_password_fn("Parent@123")
    student_pw = hash_password_fn("Student@123")
    for idx, name in enumerate(student_names):
        sid = f"STD-{idx+1:03d}"
        class_idx = idx // 5
        cls = classes_data[class_idx % len(classes_data)]
        existing = await db.users.find_one({"id": sid})
        if not existing:
            await db.users.insert_one({
                "id": sid, "email": f"student{idx+1}@nassaq.com", "password_hash": student_pw,
                "full_name": name, "role": "student", "tenant_id": school_id,
                "school_id": school_id,
                "is_active": True, "preferred_language": "ar", "created_at": now, "updated_at": now
            })
            await db.students.insert_one({
                "id": sid, "user_id": sid, "tenant_id": school_id,
                "school_id": school_id,
                "full_name": name, "class_id": cls["id"], "grade_id": cls["grade_id"],
                "stage_id": cls["stage_id"], "is_active": True, "created_at": now
            })
            inserted["students"] += 1

            pid = f"PRT-{idx+1:03d}"
            parent_name = f"ولي أمر {name}"
            existing_p = await db.users.find_one({"id": pid})
            if not existing_p:
                await db.users.insert_one({
                    "id": pid, "email": f"parent{idx+1}@nassaq.com", "password_hash": parent_pw,
                    "full_name": parent_name, "role": "parent", "tenant_id": school_id,
                    "school_id": school_id,
                    "is_active": True, "preferred_language": "ar",
                    "children_ids": [sid], "created_at": now, "updated_at": now
                })
                await db.parents.insert_one({
                    "id": pid, "user_id": pid, "tenant_id": school_id,
                    "school_id": school_id,
                    "full_name": parent_name, "email": f"parent{idx+1}@nassaq.com",
                    "phone": f"05000{idx+1:05d}",
                    "student_ids": [sid], "children_ids": [sid],
                    "is_active": True, "created_at": now
                })
                inserted["parents"] += 1

    for c in classes_data:
        count = await db.students.count_documents({"class_id": c["id"], "tenant_id": school_id})
        await db.classes.update_one({"id": c["id"]}, {"$set": {"student_count": count}})

    school_count = await db.teachers.count_documents({"tenant_id": school_id})
    student_count = await db.students.count_documents({"tenant_id": school_id})
    class_count = await db.classes.count_documents({"tenant_id": school_id})
    await db.schools.update_one({"id": school_id}, {"$set": {
        "current_teachers": school_count, "current_students": student_count,
        "current_classes": class_count, "updated_at": now
    }})

    logger.info(f"Demo school data seeding complete for {school_id}: {inserted}")
    return inserted
