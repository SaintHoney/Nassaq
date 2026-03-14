"""
Teacher Management Engine - محرك إدارة المعلمين
Handles teacher creation and management for school principals
"""
import logging
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional, Dict, Any, List
import secrets
import string
import qrcode
import io
import base64
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

logger = logging.getLogger(__name__)

# ==================== Enums ====================

class Gender(str, Enum):
    male = "male"
    female = "female"

class TeacherRank(str, Enum):
    expert = "expert"  # خبير
    advanced = "advanced"  # متقدم
    practitioner = "practitioner"  # ممارس
    assistant = "assistant"  # مساعد

class ContractType(str, Enum):
    permanent = "permanent"  # دائم
    contract = "contract"  # متعاقد
    part_time = "part_time"  # دوام جزئي

# ==================== Pydantic Models ====================

class TeacherBasicInfo(BaseModel):
    """Step 1: Basic teacher information"""
    full_name_ar: str = Field(..., min_length=3, max_length=100)
    full_name_en: Optional[str] = Field(None, max_length=100)
    national_id: str = Field(..., min_length=10, max_length=10)
    date_of_birth: Optional[str] = None
    gender: Gender
    nationality: str = Field(default="SA")
    phone: str = Field(...)
    email: EmailStr

class TeacherQualifications(BaseModel):
    """Step 2: Qualifications and experience"""
    academic_degree: str  # bachelor, master, doctorate
    specialization: str
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    years_of_experience: int = Field(ge=0)
    teacher_rank: TeacherRank
    certifications: Optional[List[str]] = None

class TeacherSubjectsAssignment(BaseModel):
    """Step 3: Subjects and grades assignment"""
    subject_ids: List[str]  # List of subject IDs teacher can teach
    grade_ids: List[str]  # List of grades teacher can teach
    primary_subject_id: str  # Main subject
    max_periods_per_week: int = Field(default=24, ge=1, le=30)

class TeacherSchedulePreferences(BaseModel):
    """Step 4: Schedule preferences"""
    contract_type: ContractType
    available_days: List[str] = ["sunday", "monday", "tuesday", "wednesday", "thursday"]
    preferred_periods: Optional[List[int]] = None  # Preferred period numbers
    notes: Optional[str] = None

class CreateTeacherRequest(BaseModel):
    """Full teacher creation request"""
    basic_info: TeacherBasicInfo
    qualifications: TeacherQualifications
    subjects: TeacherSubjectsAssignment
    schedule: Optional[TeacherSchedulePreferences] = None

# ==================== Engine Class ====================

class TeacherManagementEngine:
    """Engine for managing teacher operations"""
    
    def __init__(self, db):
        self.db = db
        self.teachers_collection = db.teachers
        self.users_collection = db.users
        self.schools_collection = db.schools
        self.subjects_collection = db.subjects
        self.grades_collection = db.grades
    
    # ==================== ID Generation ====================
    
    async def _generate_teacher_id(self, tenant_id: str) -> str:
        """Generate unique teacher ID: TCH-SCH-YY-XXXX"""
        try:
            school = None
            try:
                school = await self.schools_collection.find_one({"_id": ObjectId(tenant_id)})
            except:
                pass
            if not school:
                school = await self.schools_collection.find_one({"tenant_id": tenant_id})
            if not school:
                school = await self.schools_collection.find_one({"id": tenant_id})
            
            school_code = "SCH"
            if school:
                school_name = school.get("name_ar", school.get("name", "SCH"))
                school_code = ''.join(c for c in school_name[:3] if c.isalnum()).upper() or "SCH"
            
            year = datetime.now().strftime("%y")
            prefix = f"TCH-{school_code}-{year}-"
            
            count = await self.teachers_collection.count_documents({
                "teacher_id": {"$regex": f"^{prefix}"}
            })
            
            seq_num = str(count + 1).zfill(4)
            return f"{prefix}{seq_num}"
        except Exception as e:
            logger.error(f"Error generating teacher ID: {e}")
            timestamp = datetime.now().strftime("%y%m%d%H%M")
            return f"TCH-{timestamp}-{secrets.token_hex(2).upper()}"
    
    def _generate_qr_code(self, data: str) -> str:
        """Generate QR code as base64 string"""
        try:
            qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
            qr.add_data(data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return ""
    
    def _generate_temp_password(self, length: int = 12) -> str:
        """Generate a secure temporary password"""
        chars = string.ascii_letters + string.digits + "!@#$%"
        return ''.join(secrets.choice(chars) for _ in range(length))
    
    # ==================== Validation ====================
    
    async def validate_national_id(self, national_id: str, tenant_id: str) -> Dict[str, Any]:
        """Check if national ID already exists"""
        existing = await self.teachers_collection.find_one({
            "national_id": national_id,
            "tenant_id": tenant_id,
            "is_deleted": {"$ne": True}
        })
        
        if existing:
            return {
                "valid": False,
                "message": "رقم الهوية مسجل مسبقاً لمعلم آخر",
                "message_en": "National ID already registered for another teacher",
                "existing_id": existing.get("teacher_id", "")
            }
        return {"valid": True}
    
    async def validate_email(self, email: str, tenant_id: str) -> Dict[str, Any]:
        """Check if email already exists"""
        existing = await self.users_collection.find_one({
            "email": email,
            "is_deleted": {"$ne": True}
        })
        
        if existing:
            return {
                "valid": False,
                "message": "البريد الإلكتروني مسجل مسبقاً",
                "message_en": "Email already registered"
            }
        return {"valid": True}
    
    # ==================== CRUD Operations ====================
    
    async def create_teacher(
        self,
        request: CreateTeacherRequest,
        tenant_id: str,
        created_by: str
    ) -> Dict[str, Any]:
        """Create a new teacher"""
        try:
            # Validate national ID
            validation = await self.validate_national_id(request.basic_info.national_id, tenant_id)
            if not validation["valid"]:
                return {"success": False, "error": validation["message"], "error_en": validation["message_en"]}
            
            # Validate email
            email_validation = await self.validate_email(request.basic_info.email, tenant_id)
            if not email_validation["valid"]:
                return {"success": False, "error": email_validation["message"], "error_en": email_validation["message_en"]}
            
            # Generate teacher ID and QR code
            teacher_id = await self._generate_teacher_id(tenant_id)
            qr_code = self._generate_qr_code(teacher_id)
            
            now = datetime.now(timezone.utc)
            
            # Prepare teacher document
            teacher_doc = {
                "teacher_id": teacher_id,
                "tenant_id": tenant_id,
                "qr_code": qr_code,
                
                # Basic info
                "full_name_ar": request.basic_info.full_name_ar,
                "full_name_en": request.basic_info.full_name_en,
                "national_id": request.basic_info.national_id,
                "date_of_birth": request.basic_info.date_of_birth,
                "gender": request.basic_info.gender.value,
                "nationality": request.basic_info.nationality,
                "phone": request.basic_info.phone,
                "email": request.basic_info.email,
                
                # Qualifications
                "academic_degree": request.qualifications.academic_degree,
                "specialization": request.qualifications.specialization,
                "university": request.qualifications.university,
                "graduation_year": request.qualifications.graduation_year,
                "years_of_experience": request.qualifications.years_of_experience,
                "teacher_rank": request.qualifications.teacher_rank.value,
                "certifications": request.qualifications.certifications or [],
                
                # Subjects
                "subject_ids": request.subjects.subject_ids,
                "grade_ids": request.subjects.grade_ids,
                "primary_subject_id": request.subjects.primary_subject_id,
                "max_periods_per_week": request.subjects.max_periods_per_week,
                
                # Schedule
                "contract_type": request.schedule.contract_type.value if request.schedule else "permanent",
                "available_days": request.schedule.available_days if request.schedule else ["sunday", "monday", "tuesday", "wednesday", "thursday"],
                "preferred_periods": request.schedule.preferred_periods if request.schedule else None,
                "schedule_notes": request.schedule.notes if request.schedule else None,
                
                # Status
                "status": "active",
                "is_deleted": False,
                "hire_date": now.isoformat(),
                
                # Audit
                "created_at": now.isoformat(),
                "created_by": created_by,
                "updated_at": now.isoformat(),
            }
            
            # Insert teacher
            await self.teachers_collection.insert_one(teacher_doc)
            
            # Create user account
            user_result = await self._create_teacher_user_account(teacher_doc, tenant_id, created_by)
            
            return {
                "success": True,
                "teacher_id": teacher_id,
                "qr_code": qr_code,
                "user_account": user_result,
                "message": "تم إضافة المعلم بنجاح",
                "message_en": "Teacher added successfully"
            }
            
        except Exception as e:
            logger.error(f"Error creating teacher: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "حدث خطأ أثناء إضافة المعلم",
                "message_en": "Error occurred while adding teacher"
            }
    
    async def _create_teacher_user_account(
        self,
        teacher_doc: Dict,
        tenant_id: str,
        created_by: str
    ) -> Dict[str, Any]:
        """Create a user account for the teacher"""
        try:
            temp_password = self._generate_temp_password()
            now = datetime.now(timezone.utc)
            
            # Use email as username
            username = teacher_doc["email"].split("@")[0]
            
            # Check if username exists
            existing = await self.users_collection.find_one({"username": username})
            if existing:
                username = f"{username}_{secrets.token_hex(2)}"
            
            import bcrypt
            password_hash = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user_doc = {
                "username": username,
                "email": teacher_doc["email"],
                "password_hash": password_hash,
                "role": "teacher",
                "tenant_id": tenant_id,
                "full_name": teacher_doc["full_name_ar"],
                "full_name_en": teacher_doc.get("full_name_en"),
                "linked_entity_id": teacher_doc["teacher_id"],
                "phone": teacher_doc["phone"],
                "must_change_password": True,
                "is_active": True,
                "created_at": now.isoformat(),
                "created_by": created_by,
            }
            
            await self.users_collection.insert_one(user_doc)
            
            return {
                "username": username,
                "email": teacher_doc["email"],
                "temp_password": temp_password,
                "created": True
            }
        except Exception as e:
            logger.error(f"Error creating teacher user account: {e}")
            return {"created": False, "error": str(e)}
    
    # ==================== Query Operations ====================
    
    async def get_teacher(self, teacher_id: str, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get teacher by ID"""
        teacher = await self.teachers_collection.find_one({
            "teacher_id": teacher_id,
            "tenant_id": tenant_id,
            "is_deleted": {"$ne": True}
        }, {"_id": 0})
        return teacher
    
    async def list_teachers(
        self,
        tenant_id: str,
        subject_id: Optional[str] = None,
        grade_id: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Dict[str, Any]:
        """List teachers with filters"""
        query = {
            "tenant_id": tenant_id,
            "is_deleted": {"$ne": True}
        }
        
        if subject_id:
            query["subject_ids"] = subject_id
        if grade_id:
            query["grade_ids"] = grade_id
        if status:
            query["status"] = status
        if search:
            query["$or"] = [
                {"full_name_ar": {"$regex": search, "$options": "i"}},
                {"full_name_en": {"$regex": search, "$options": "i"}},
                {"teacher_id": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        
        total = await self.teachers_collection.count_documents(query)
        teachers = await self.teachers_collection.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        return {
            "teachers": teachers,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    # ==================== Options/Lookups ====================
    
    FULL_SUBJECTS = [
        {"id": "subj-arabic", "name_ar": "لغتي / اللغة العربية", "name_en": "Arabic Language"},
        {"id": "subj-math", "name_ar": "الرياضيات", "name_en": "Mathematics"},
        {"id": "subj-science", "name_ar": "العلوم", "name_en": "Science"},
        {"id": "subj-english", "name_ar": "اللغة الإنجليزية", "name_en": "English Language"},
        {"id": "subj-islamic", "name_ar": "الدراسات الإسلامية", "name_en": "Islamic Studies"},
        {"id": "subj-quran", "name_ar": "القرآن الكريم", "name_en": "Quran"},
        {"id": "subj-tawheed", "name_ar": "التوحيد", "name_en": "Monotheism (Tawheed)"},
        {"id": "subj-fiqh", "name_ar": "الفقه", "name_en": "Islamic Jurisprudence (Fiqh)"},
        {"id": "subj-hadith", "name_ar": "الحديث والسيرة", "name_en": "Hadith & Seerah"},
        {"id": "subj-tafseer", "name_ar": "التفسير", "name_en": "Quran Interpretation (Tafseer)"},
        {"id": "subj-social", "name_ar": "الدراسات الاجتماعية", "name_en": "Social Studies"},
        {"id": "subj-history", "name_ar": "التاريخ", "name_en": "History"},
        {"id": "subj-geography", "name_ar": "الجغرافيا", "name_en": "Geography"},
        {"id": "subj-physics", "name_ar": "الفيزياء", "name_en": "Physics"},
        {"id": "subj-chemistry", "name_ar": "الكيمياء", "name_en": "Chemistry"},
        {"id": "subj-biology", "name_ar": "الأحياء", "name_en": "Biology"},
        {"id": "subj-computer", "name_ar": "الحاسب الآلي", "name_en": "Computer Science"},
        {"id": "subj-digital", "name_ar": "المهارات الرقمية", "name_en": "Digital Skills"},
        {"id": "subj-pe", "name_ar": "التربية البدنية والدفاع عن النفس", "name_en": "Physical Education"},
        {"id": "subj-art", "name_ar": "التربية الفنية", "name_en": "Art Education"},
        {"id": "subj-family", "name_ar": "التربية الأسرية", "name_en": "Family Education"},
        {"id": "subj-skills", "name_ar": "المهارات الحياتية والأسرية", "name_en": "Life & Family Skills"},
        {"id": "subj-vocational", "name_ar": "التربية المهنية", "name_en": "Vocational Education"},
        {"id": "subj-critical", "name_ar": "التفكير الناقد", "name_en": "Critical Thinking"},
        {"id": "subj-national", "name_ar": "الدراسات الوطنية", "name_en": "National Studies"},
    ]

    FULL_GRADES = [
        {"id": "grade-1", "name_ar": "الصف الأول الابتدائي", "name_en": "Grade 1 (Primary)", "stage": "primary", "order": 1},
        {"id": "grade-2", "name_ar": "الصف الثاني الابتدائي", "name_en": "Grade 2 (Primary)", "stage": "primary", "order": 2},
        {"id": "grade-3", "name_ar": "الصف الثالث الابتدائي", "name_en": "Grade 3 (Primary)", "stage": "primary", "order": 3},
        {"id": "grade-4", "name_ar": "الصف الرابع الابتدائي", "name_en": "Grade 4 (Primary)", "stage": "primary", "order": 4},
        {"id": "grade-5", "name_ar": "الصف الخامس الابتدائي", "name_en": "Grade 5 (Primary)", "stage": "primary", "order": 5},
        {"id": "grade-6", "name_ar": "الصف السادس الابتدائي", "name_en": "Grade 6 (Primary)", "stage": "primary", "order": 6},
        {"id": "grade-7", "name_ar": "الصف الأول المتوسط", "name_en": "Grade 7 (Intermediate)", "stage": "intermediate", "order": 7},
        {"id": "grade-8", "name_ar": "الصف الثاني المتوسط", "name_en": "Grade 8 (Intermediate)", "stage": "intermediate", "order": 8},
        {"id": "grade-9", "name_ar": "الصف الثالث المتوسط", "name_en": "Grade 9 (Intermediate)", "stage": "intermediate", "order": 9},
        {"id": "grade-10", "name_ar": "الصف الأول الثانوي", "name_en": "Grade 10 (Secondary)", "stage": "secondary", "order": 10},
        {"id": "grade-11", "name_ar": "الصف الثاني الثانوي", "name_en": "Grade 11 (Secondary)", "stage": "secondary", "order": 11},
        {"id": "grade-12", "name_ar": "الصف الثالث الثانوي", "name_en": "Grade 12 (Secondary)", "stage": "secondary", "order": 12},
    ]

    async def get_subjects(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Get available subjects - merges school-specific with full curriculum"""
        school_subjects = await self.subjects_collection.find(
            {"tenant_id": tenant_id, "is_active": {"$ne": False}},
            {"_id": 0}
        ).to_list(100)

        official_subjects = await self.db.reference_subjects.find(
            {"is_active": {"$ne": False}},
            {"_id": 0}
        ).to_list(100)

        seen_ids = set()
        merged = []
        for s in school_subjects:
            sid = s.get("id")
            if sid and sid not in seen_ids:
                seen_ids.add(sid)
                merged.append(s)

        for s in official_subjects:
            sid = s.get("id")
            if sid and sid not in seen_ids:
                seen_ids.add(sid)
                merged.append(s)

        for s in self.FULL_SUBJECTS:
            if s["id"] not in seen_ids:
                seen_ids.add(s["id"])
                merged.append(s)

        return merged

    async def get_grades(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Get available grades - merges school-specific with full curriculum"""
        school_grades = await self.grades_collection.find(
            {"tenant_id": tenant_id, "is_active": {"$ne": False}},
            {"_id": 0}
        ).to_list(100)

        official_grades = await self.db.academic_grades.find(
            {"is_active": {"$ne": False}},
            {"_id": 0}
        ).to_list(100)

        seen_ids = set()
        merged = []
        for g in school_grades:
            gid = g.get("id")
            if gid and gid not in seen_ids:
                seen_ids.add(gid)
                merged.append(g)

        for g in official_grades:
            gid = g.get("id")
            if gid and gid not in seen_ids:
                seen_ids.add(gid)
                merged.append(g)

        for g in self.FULL_GRADES:
            if g["id"] not in seen_ids:
                seen_ids.add(g["id"])
                merged.append(g)

        return merged
    
    async def get_academic_degrees(self) -> List[Dict[str, str]]:
        """Get list of academic degrees"""
        return [
            {"code": "diploma", "name_ar": "دبلوم", "name_en": "Diploma"},
            {"code": "bachelor", "name_ar": "بكالوريوس", "name_en": "Bachelor's"},
            {"code": "master", "name_ar": "ماجستير", "name_en": "Master's"},
            {"code": "doctorate", "name_ar": "دكتوراه", "name_en": "Doctorate"},
        ]
    
    async def get_teacher_ranks(self) -> List[Dict[str, str]]:
        """Get list of teacher ranks"""
        return [
            {"code": "assistant", "name_ar": "معلم مساعد", "name_en": "Assistant Teacher"},
            {"code": "practitioner", "name_ar": "معلم ممارس", "name_en": "Practitioner Teacher"},
            {"code": "advanced", "name_ar": "معلم متقدم", "name_en": "Advanced Teacher"},
            {"code": "expert", "name_ar": "معلم خبير", "name_en": "Expert Teacher"},
        ]
    
    async def get_contract_types(self) -> List[Dict[str, str]]:
        """Get list of contract types"""
        return [
            {"code": "permanent", "name_ar": "دائم", "name_en": "Permanent"},
            {"code": "contract", "name_ar": "متعاقد", "name_en": "Contract"},
            {"code": "part_time", "name_ar": "دوام جزئي", "name_en": "Part-time"},
        ]
    
    async def get_nationalities(self) -> List[Dict[str, str]]:
        """Get list of nationalities"""
        return [
            {"code": "SA", "name_ar": "سعودي", "name_en": "Saudi"},
            {"code": "EG", "name_ar": "مصري", "name_en": "Egyptian"},
            {"code": "JO", "name_ar": "أردني", "name_en": "Jordanian"},
            {"code": "SY", "name_ar": "سوري", "name_en": "Syrian"},
            {"code": "PS", "name_ar": "فلسطيني", "name_en": "Palestinian"},
            {"code": "SD", "name_ar": "سوداني", "name_en": "Sudanese"},
            {"code": "YE", "name_ar": "يمني", "name_en": "Yemeni"},
            {"code": "TN", "name_ar": "تونسي", "name_en": "Tunisian"},
            {"code": "MA", "name_ar": "مغربي", "name_en": "Moroccan"},
            {"code": "PK", "name_ar": "باكستاني", "name_en": "Pakistani"},
            {"code": "IN", "name_ar": "هندي", "name_en": "Indian"},
            {"code": "OTHER", "name_ar": "أخرى", "name_en": "Other"},
        ]
