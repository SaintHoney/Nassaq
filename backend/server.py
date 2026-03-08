from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'nassaq-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 30))

# Create the main app
app = FastAPI(title="NASSAQ - نَسَّق", description="نظام إدارة المدارس الذكي")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ============== ENUMS ==============
class UserRole(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    MINISTRY_REP = "ministry_rep"
    SCHOOL_PRINCIPAL = "school_principal"
    SCHOOL_SUB_ADMIN = "school_sub_admin"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"
    DRIVER = "driver"
    GATEKEEPER = "gatekeeper"

class SchoolStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"

# ============== MODELS ==============
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    full_name_en: Optional[str] = None
    role: UserRole
    tenant_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    preferred_language: str = "ar"
    preferred_theme: str = "light"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    full_name_en: Optional[str] = None
    role: UserRole
    tenant_id: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    full_name: str
    full_name_en: Optional[str] = None
    role: UserRole
    tenant_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    preferred_language: str
    preferred_theme: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SchoolBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    code: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: str = "SA"
    logo_url: Optional[str] = None
    status: SchoolStatus = SchoolStatus.PENDING
    student_capacity: int = 0
    current_students: int = 0
    current_teachers: int = 0

class SchoolCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    code: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    student_capacity: int = 500

class SchoolResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_en: Optional[str] = None
    code: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: str
    logo_url: Optional[str] = None
    status: SchoolStatus
    student_capacity: int
    current_students: int
    current_teachers: int
    created_at: str

class HakimMessage(BaseModel):
    message: str
    context: Optional[str] = None
    user_role: Optional[str] = None
    tenant_id: Optional[str] = None

class HakimResponse(BaseModel):
    response: str
    suggestions: List[str] = []

class DashboardStats(BaseModel):
    total_schools: int = 0
    total_students: int = 0
    total_teachers: int = 0
    active_schools: int = 0
    pending_schools: int = 0
    total_users: int = 0
    pending_requests: int = 0
    active_users: int = 0
    total_classes: int = 0
    total_subjects: int = 0

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ============== HELPER FUNCTIONS ==============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============== AUTH ROUTES ==============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "full_name_en": user_data.full_name_en,
        "role": user_data.role.value,
        "tenant_id": user_data.tenant_id,
        "phone": user_data.phone,
        "avatar_url": None,
        "is_active": True,
        "preferred_language": "ar",
        "preferred_theme": "light",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"sub": user_id, "role": user_data.role.value})
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        full_name_en=user_data.full_name_en,
        role=user_data.role,
        tenant_id=user_data.tenant_id,
        phone=user_data.phone,
        avatar_url=None,
        is_active=True,
        preferred_language="ar",
        preferred_theme="light",
        created_at=user_doc["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="الحساب معطل")
    
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        full_name_en=user.get("full_name_en"),
        role=UserRole(user["role"]),
        tenant_id=user.get("tenant_id"),
        phone=user.get("phone"),
        avatar_url=user.get("avatar_url"),
        is_active=user.get("is_active", True),
        preferred_language=user.get("preferred_language", "ar"),
        preferred_theme=user.get("preferred_theme", "light"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        full_name_en=current_user.get("full_name_en"),
        role=UserRole(current_user["role"]),
        tenant_id=current_user.get("tenant_id"),
        phone=current_user.get("phone"),
        avatar_url=current_user.get("avatar_url"),
        is_active=current_user.get("is_active", True),
        preferred_language=current_user.get("preferred_language", "ar"),
        preferred_theme=current_user.get("preferred_theme", "light"),
        created_at=current_user["created_at"]
    )

@api_router.put("/auth/preferences")
async def update_preferences(
    preferred_language: Optional[str] = None,
    preferred_theme: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if preferred_language:
        updates["preferred_language"] = preferred_language
    if preferred_theme:
        updates["preferred_theme"] = preferred_theme
    
    await db.users.update_one({"id": current_user["id"]}, {"$set": updates})
    return {"message": "تم تحديث الإعدادات"}

# ============== SCHOOLS (TENANTS) ROUTES ==============
@api_router.post("/schools", response_model=SchoolResponse)
async def create_school(
    school_data: SchoolCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
):
    # Check if code exists
    existing = await db.schools.find_one({"code": school_data.code})
    if existing:
        raise HTTPException(status_code=400, detail="رمز المدرسة مستخدم مسبقاً")
    
    school_id = str(uuid.uuid4())
    school_doc = {
        "id": school_id,
        "name": school_data.name,
        "name_en": school_data.name_en,
        "code": school_data.code,
        "email": school_data.email,
        "phone": school_data.phone,
        "address": school_data.address,
        "city": school_data.city,
        "region": school_data.region,
        "country": "SA",
        "logo_url": None,
        "status": SchoolStatus.PENDING.value,
        "student_capacity": school_data.student_capacity,
        "current_students": 0,
        "current_teachers": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.schools.insert_one(school_doc)
    
    return SchoolResponse(
        id=school_id,
        name=school_data.name,
        name_en=school_data.name_en,
        code=school_data.code,
        email=school_data.email,
        phone=school_data.phone,
        address=school_data.address,
        city=school_data.city,
        region=school_data.region,
        country="SA",
        logo_url=None,
        status=SchoolStatus.PENDING,
        student_capacity=school_data.student_capacity,
        current_students=0,
        current_teachers=0,
        created_at=school_doc["created_at"]
    )

@api_router.get("/schools", response_model=List[SchoolResponse])
async def get_schools(
    status: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.MINISTRY_REP]))
):
    query = {}
    if status:
        query["status"] = status
    
    schools = await db.schools.find(query, {"_id": 0}).to_list(1000)
    return [SchoolResponse(**s) for s in schools]

@api_router.get("/schools/{school_id}", response_model=SchoolResponse)
async def get_school(school_id: str, current_user: dict = Depends(get_current_user)):
    school = await db.schools.find_one({"id": school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
    return SchoolResponse(**school)

@api_router.put("/schools/{school_id}/status")
async def update_school_status(
    school_id: str,
    status: SchoolStatus,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
):
    result = await db.schools.update_one(
        {"id": school_id},
        {"$set": {"status": status.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
    return {"message": "تم تحديث حالة المدرسة"}

# ============== USERS MANAGEMENT ROUTES ==============
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = None,
    tenant_id: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    query = {}
    
    # Filter by tenant for school admins
    if current_user["role"] in [UserRole.SCHOOL_PRINCIPAL.value, UserRole.SCHOOL_SUB_ADMIN.value]:
        query["tenant_id"] = current_user.get("tenant_id")
    elif tenant_id:
        query["tenant_id"] = tenant_id
    
    if role:
        query["role"] = role
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return {"message": "تم تحديث حالة المستخدم"}

# ============== DASHBOARD STATS ==============
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.PLATFORM_ADMIN.value:
        total_schools = await db.schools.count_documents({})
        active_schools = await db.schools.count_documents({"status": "active"})
        pending_schools = await db.schools.count_documents({"status": "pending"})
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({"is_active": True})
        total_students = await db.students.count_documents({})
        total_teachers = await db.teachers.count_documents({})
        total_classes = await db.classes.count_documents({})
        total_subjects = await db.subjects.count_documents({})
        pending_requests = await db.registration_requests.count_documents({"status": "pending"})
    else:
        tenant_id = current_user.get("tenant_id")
        total_schools = 1
        active_schools = 1
        pending_schools = 0
        total_users = await db.users.count_documents({"tenant_id": tenant_id})
        active_users = await db.users.count_documents({"tenant_id": tenant_id, "is_active": True})
        total_students = await db.students.count_documents({"school_id": tenant_id})
        total_teachers = await db.teachers.count_documents({"school_id": tenant_id})
        total_classes = await db.classes.count_documents({"school_id": tenant_id})
        total_subjects = await db.subjects.count_documents({"school_id": tenant_id})
        pending_requests = 0
    
    return DashboardStats(
        total_schools=total_schools,
        total_students=total_students,
        total_teachers=total_teachers,
        active_schools=active_schools,
        pending_schools=pending_schools,
        total_users=total_users,
        active_users=active_users,
        pending_requests=pending_requests,
        total_classes=total_classes,
        total_subjects=total_subjects
    )

# ============== AI ASSISTANT (HAKIM) ==============
@api_router.post("/hakim/chat", response_model=HakimResponse)
async def chat_with_hakim(message: HakimMessage):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        system_prompt = """أنت حكيم، المساعد الذكي لمنصة نَسَّق لإدارة المدارس.
        
مهمتك:
- مساعدة المستخدمين في فهم النظام وميزاته
- الإجابة على الأسئلة المتعلقة بإدارة المدارس والعمليات التعليمية
- تقديم توصيات ذكية بناءً على البيانات المتاحة
- شرح كيفية استخدام الميزات المختلفة في النظام

أسلوبك:
- ودود ومهني
- واضح ومختصر
- داعم وإيجابي
- تستخدم اللغة العربية الفصحى

قدم إجابات مفيدة وعملية للمستخدمين."""

        chat = LlmChat(
            api_key=llm_key,
            session_id=f"hakim_{message.tenant_id or 'public'}_{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        context_info = ""
        if message.context:
            context_info = f"\n\nسياق إضافي: {message.context}"
        if message.user_role:
            context_info += f"\nدور المستخدم: {message.user_role}"
        
        user_msg = UserMessage(text=message.message + context_info)
        response = await chat.send_message(user_msg)
        
        suggestions = []
        if "مدرسة" in message.message or "school" in message.message.lower():
            suggestions = ["إنشاء مدرسة جديدة", "عرض قائمة المدارس", "تعديل بيانات المدرسة"]
        elif "طالب" in message.message or "student" in message.message.lower():
            suggestions = ["إضافة طالب جديد", "عرض سجلات الطلاب", "تقارير الحضور"]
        elif "معلم" in message.message or "teacher" in message.message.lower():
            suggestions = ["إضافة معلم جديد", "جدول الحصص", "تقييم الأداء"]
        
        return HakimResponse(response=response, suggestions=suggestions)
        
    except ImportError:
        return HakimResponse(
            response="مرحباً! أنا حكيم، مساعدك الذكي في منصة نَسَّق. كيف يمكنني مساعدتك اليوم؟",
            suggestions=["تعرف على النظام", "إدارة المدارس", "إدارة المستخدمين"]
        )
    except Exception as e:
        logging.error(f"Hakim error: {str(e)}")
        return HakimResponse(
            response="مرحباً! أنا حكيم. كيف يمكنني مساعدتك؟",
            suggestions=["تعرف على النظام", "إدارة المدارس", "إدارة المستخدمين"]
        )

# ============== REGISTRATION REQUESTS MODELS ==============
class RegistrationRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RegistrationRequest(BaseModel):
    full_name: str
    phone: str
    account_type: str  # 'school' or 'teacher'
    status: RegistrationRequestStatus = RegistrationRequestStatus.PENDING
    # School fields
    school_name: Optional[str] = None
    school_email: Optional[str] = None
    school_phone: Optional[str] = None
    school_city: Optional[str] = None
    school_address: Optional[str] = None
    student_capacity: Optional[str] = None
    # Teacher fields
    email: Optional[str] = None
    school_code: Optional[str] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[str] = None

class RegistrationRequestResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    full_name: str
    phone: str
    account_type: str
    status: str
    created_at: str

# ============== REGISTRATION REQUESTS ROUTES ==============
@api_router.post("/registration-requests", response_model=RegistrationRequestResponse)
async def create_registration_request(request_data: RegistrationRequest):
    """Create a new registration request for admin review"""
    request_id = str(uuid.uuid4())
    request_doc = {
        "id": request_id,
        **request_data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.registration_requests.insert_one(request_doc)
    
    return RegistrationRequestResponse(
        id=request_id,
        full_name=request_data.full_name,
        phone=request_data.phone,
        account_type=request_data.account_type,
        status="pending",
        created_at=request_doc["created_at"]
    )

@api_router.get("/registration-requests", response_model=List[RegistrationRequestResponse])
async def get_registration_requests(
    status: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
):
    """Get all registration requests (admin only)"""
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.registration_requests.find(query, {"_id": 0}).to_list(1000)
    return [RegistrationRequestResponse(**r) for r in requests]

@api_router.put("/registration-requests/{request_id}/status")
async def update_registration_request_status(
    request_id: str,
    status: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))
):
    """Update registration request status (admin only)"""
    result = await db.registration_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="طلب التسجيل غير موجود")
    return {"message": "تم تحديث حالة الطلب"}

# ============== TEACHERS, STUDENTS, CLASSES MODELS ==============
class TeacherCreate(BaseModel):
    full_name: str
    full_name_en: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    school_id: str
    specialization: str
    years_of_experience: Optional[int] = 0
    qualification: Optional[str] = None
    gender: Optional[str] = None  # male/female

class TeacherResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    full_name: str
    full_name_en: Optional[str] = None
    email: str
    phone: Optional[str] = None
    school_id: str
    specialization: str
    years_of_experience: int
    qualification: Optional[str] = None
    gender: Optional[str] = None
    is_active: bool
    created_at: str

class StudentCreate(BaseModel):
    full_name: str
    full_name_en: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    school_id: str
    class_id: Optional[str] = None
    student_number: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_name: Optional[str] = None

class StudentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: Optional[str] = None
    full_name: str
    full_name_en: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    school_id: str
    class_id: Optional[str] = None
    class_name: Optional[str] = None
    student_number: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_name: Optional[str] = None
    is_active: bool
    created_at: str

class ClassCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    school_id: str
    grade_level: str  # e.g., "الأول الابتدائي", "الثاني المتوسط"
    section: Optional[str] = None  # e.g., "أ", "ب", "ج"
    capacity: int = 30
    homeroom_teacher_id: Optional[str] = None

class ClassResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_en: Optional[str] = None
    school_id: str
    grade_level: str
    section: Optional[str] = None
    capacity: int
    current_students: int
    homeroom_teacher_id: Optional[str] = None
    homeroom_teacher_name: Optional[str] = None
    is_active: bool
    created_at: str

class SubjectCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    school_id: str
    code: str
    description: Optional[str] = None
    weekly_hours: int = 4
    grade_levels: List[str] = []

class SubjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_en: Optional[str] = None
    school_id: str
    code: str
    description: Optional[str] = None
    weekly_hours: int
    grade_levels: List[str]
    is_active: bool
    created_at: str

# ============== TEACHERS ROUTES ==============
@api_router.post("/teachers", response_model=TeacherResponse)
async def create_teacher(
    teacher_data: TeacherCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Create a new teacher"""
    # Check if email already exists
    existing = await db.users.find_one({"email": teacher_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    # Create user account for teacher
    user_id = str(uuid.uuid4())
    teacher_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": teacher_data.email,
        "password_hash": hash_password("Teacher@123"),  # Default password
        "full_name": teacher_data.full_name,
        "full_name_en": teacher_data.full_name_en,
        "role": UserRole.TEACHER.value,
        "tenant_id": teacher_data.school_id,
        "phone": teacher_data.phone,
        "avatar_url": None,
        "is_active": True,
        "preferred_language": "ar",
        "preferred_theme": "light",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    teacher_doc = {
        "id": teacher_id,
        "user_id": user_id,
        "full_name": teacher_data.full_name,
        "full_name_en": teacher_data.full_name_en,
        "email": teacher_data.email,
        "phone": teacher_data.phone,
        "school_id": teacher_data.school_id,
        "specialization": teacher_data.specialization,
        "years_of_experience": teacher_data.years_of_experience or 0,
        "qualification": teacher_data.qualification,
        "gender": teacher_data.gender,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    await db.teachers.insert_one(teacher_doc)
    
    # Update school teacher count
    await db.schools.update_one(
        {"id": teacher_data.school_id},
        {"$inc": {"current_teachers": 1}}
    )
    
    return TeacherResponse(**teacher_doc)

@api_router.get("/teachers", response_model=List[TeacherResponse])
async def get_teachers(
    school_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all teachers or filter by school"""
    query = {}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    teachers = await db.teachers.find(query, {"_id": 0}).to_list(1000)
    return [TeacherResponse(**t) for t in teachers]

@api_router.get("/teachers/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(teacher_id: str, current_user: dict = Depends(get_current_user)):
    """Get teacher by ID"""
    teacher = await db.teachers.find_one({"id": teacher_id}, {"_id": 0})
    if not teacher:
        raise HTTPException(status_code=404, detail="المعلم غير موجود")
    return TeacherResponse(**teacher)

@api_router.put("/teachers/{teacher_id}")
async def update_teacher(
    teacher_id: str,
    teacher_data: TeacherCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Update teacher"""
    result = await db.teachers.update_one(
        {"id": teacher_id},
        {"$set": {
            "full_name": teacher_data.full_name,
            "full_name_en": teacher_data.full_name_en,
            "phone": teacher_data.phone,
            "specialization": teacher_data.specialization,
            "years_of_experience": teacher_data.years_of_experience,
            "qualification": teacher_data.qualification,
            "gender": teacher_data.gender,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المعلم غير موجود")
    return {"message": "تم تحديث بيانات المعلم"}

@api_router.delete("/teachers/{teacher_id}")
async def delete_teacher(
    teacher_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """Delete teacher (soft delete)"""
    teacher = await db.teachers.find_one({"id": teacher_id}, {"_id": 0})
    if not teacher:
        raise HTTPException(status_code=404, detail="المعلم غير موجود")
    
    await db.teachers.update_one({"id": teacher_id}, {"$set": {"is_active": False}})
    await db.users.update_one({"id": teacher.get("user_id")}, {"$set": {"is_active": False}})
    
    # Update school teacher count
    await db.schools.update_one(
        {"id": teacher.get("school_id")},
        {"$inc": {"current_teachers": -1}}
    )
    
    return {"message": "تم حذف المعلم"}

# ============== STUDENTS ROUTES ==============
@api_router.post("/students", response_model=StudentResponse)
async def create_student(
    student_data: StudentCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Create a new student"""
    student_id = str(uuid.uuid4())
    
    student_doc = {
        "id": student_id,
        "user_id": None,  # Students may not have user accounts initially
        "full_name": student_data.full_name,
        "full_name_en": student_data.full_name_en,
        "email": student_data.email,
        "phone": student_data.phone,
        "school_id": student_data.school_id,
        "class_id": student_data.class_id,
        "student_number": student_data.student_number,
        "date_of_birth": student_data.date_of_birth,
        "gender": student_data.gender,
        "parent_phone": student_data.parent_phone,
        "parent_name": student_data.parent_name,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.students.insert_one(student_doc)
    
    # Update school student count
    await db.schools.update_one(
        {"id": student_data.school_id},
        {"$inc": {"current_students": 1}}
    )
    
    # Update class student count if assigned
    if student_data.class_id:
        await db.classes.update_one(
            {"id": student_data.class_id},
            {"$inc": {"current_students": 1}}
        )
    
    # Get class name for response
    class_name = None
    if student_data.class_id:
        class_doc = await db.classes.find_one({"id": student_data.class_id}, {"_id": 0})
        if class_doc:
            class_name = class_doc.get("name")
    
    return StudentResponse(**student_doc, class_name=class_name)

@api_router.get("/students", response_model=List[StudentResponse])
async def get_students(
    school_id: Optional[str] = None,
    class_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all students or filter by school/class"""
    query = {}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    if class_id:
        query["class_id"] = class_id
    
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    
    # Get class names
    class_ids = list(set([s.get("class_id") for s in students if s.get("class_id")]))
    classes = await db.classes.find({"id": {"$in": class_ids}}, {"_id": 0}).to_list(100)
    class_map = {c.get("id"): c.get("name") for c in classes}
    
    result = []
    for s in students:
        s["class_name"] = class_map.get(s.get("class_id"))
        result.append(StudentResponse(**s))
    
    return result

@api_router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, current_user: dict = Depends(get_current_user)):
    """Get student by ID"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    
    class_name = None
    if student.get("class_id"):
        class_doc = await db.classes.find_one({"id": student.get("class_id")}, {"_id": 0})
        if class_doc:
            class_name = class_doc.get("name")
    
    return StudentResponse(**student, class_name=class_name)

@api_router.put("/students/{student_id}")
async def update_student(
    student_id: str,
    student_data: StudentCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Update student"""
    result = await db.students.update_one(
        {"id": student_id},
        {"$set": {
            "full_name": student_data.full_name,
            "full_name_en": student_data.full_name_en,
            "email": student_data.email,
            "phone": student_data.phone,
            "class_id": student_data.class_id,
            "date_of_birth": student_data.date_of_birth,
            "gender": student_data.gender,
            "parent_phone": student_data.parent_phone,
            "parent_name": student_data.parent_name,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    return {"message": "تم تحديث بيانات الطالب"}

@api_router.delete("/students/{student_id}")
async def delete_student(
    student_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """Delete student (soft delete)"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    
    await db.students.update_one({"id": student_id}, {"$set": {"is_active": False}})
    
    # Update school student count
    await db.schools.update_one(
        {"id": student.get("school_id")},
        {"$inc": {"current_students": -1}}
    )
    
    # Update class student count if assigned
    if student.get("class_id"):
        await db.classes.update_one(
            {"id": student.get("class_id")},
            {"$inc": {"current_students": -1}}
        )
    
    return {"message": "تم حذف الطالب"}

# ============== CLASSES ROUTES ==============
@api_router.post("/classes", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Create a new class"""
    class_id = str(uuid.uuid4())
    
    class_doc = {
        "id": class_id,
        "name": class_data.name,
        "name_en": class_data.name_en,
        "school_id": class_data.school_id,
        "grade_level": class_data.grade_level,
        "section": class_data.section,
        "capacity": class_data.capacity,
        "current_students": 0,
        "homeroom_teacher_id": class_data.homeroom_teacher_id,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.classes.insert_one(class_doc)
    
    # Get homeroom teacher name
    teacher_name = None
    if class_data.homeroom_teacher_id:
        teacher = await db.teachers.find_one({"id": class_data.homeroom_teacher_id}, {"_id": 0})
        if teacher:
            teacher_name = teacher.get("full_name")
    
    return ClassResponse(**class_doc, homeroom_teacher_name=teacher_name)

@api_router.get("/classes", response_model=List[ClassResponse])
async def get_classes(
    school_id: Optional[str] = None,
    grade_level: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all classes or filter by school/grade"""
    query = {}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    if grade_level:
        query["grade_level"] = grade_level
    
    classes = await db.classes.find(query, {"_id": 0}).to_list(1000)
    
    # Get teacher names
    teacher_ids = list(set([c.get("homeroom_teacher_id") for c in classes if c.get("homeroom_teacher_id")]))
    teachers = await db.teachers.find({"id": {"$in": teacher_ids}}, {"_id": 0}).to_list(100)
    teacher_map = {t.get("id"): t.get("full_name") for t in teachers}
    
    result = []
    for c in classes:
        c["homeroom_teacher_name"] = teacher_map.get(c.get("homeroom_teacher_id"))
        result.append(ClassResponse(**c))
    
    return result

@api_router.get("/classes/{class_id}", response_model=ClassResponse)
async def get_class(class_id: str, current_user: dict = Depends(get_current_user)):
    """Get class by ID"""
    class_doc = await db.classes.find_one({"id": class_id}, {"_id": 0})
    if not class_doc:
        raise HTTPException(status_code=404, detail="الفصل غير موجود")
    
    teacher_name = None
    if class_doc.get("homeroom_teacher_id"):
        teacher = await db.teachers.find_one({"id": class_doc.get("homeroom_teacher_id")}, {"_id": 0})
        if teacher:
            teacher_name = teacher.get("full_name")
    
    return ClassResponse(**class_doc, homeroom_teacher_name=teacher_name)

@api_router.put("/classes/{class_id}")
async def update_class(
    class_id: str,
    class_data: ClassCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Update class"""
    result = await db.classes.update_one(
        {"id": class_id},
        {"$set": {
            "name": class_data.name,
            "name_en": class_data.name_en,
            "grade_level": class_data.grade_level,
            "section": class_data.section,
            "capacity": class_data.capacity,
            "homeroom_teacher_id": class_data.homeroom_teacher_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الفصل غير موجود")
    return {"message": "تم تحديث بيانات الفصل"}

@api_router.delete("/classes/{class_id}")
async def delete_class(
    class_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """Delete class (soft delete)"""
    class_doc = await db.classes.find_one({"id": class_id}, {"_id": 0})
    if not class_doc:
        raise HTTPException(status_code=404, detail="الفصل غير موجود")
    
    await db.classes.update_one({"id": class_id}, {"$set": {"is_active": False}})
    return {"message": "تم حذف الفصل"}

# ============== SUBJECTS ROUTES ==============
@api_router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Create a new subject"""
    subject_id = str(uuid.uuid4())
    
    subject_doc = {
        "id": subject_id,
        "name": subject_data.name,
        "name_en": subject_data.name_en,
        "school_id": subject_data.school_id,
        "code": subject_data.code,
        "description": subject_data.description,
        "weekly_hours": subject_data.weekly_hours,
        "grade_levels": subject_data.grade_levels,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.subjects.insert_one(subject_doc)
    return SubjectResponse(**subject_doc)

@api_router.get("/subjects", response_model=List[SubjectResponse])
async def get_subjects(
    school_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all subjects or filter by school"""
    query = {}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    subjects = await db.subjects.find(query, {"_id": 0}).to_list(1000)
    return [SubjectResponse(**s) for s in subjects]

@api_router.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: str, current_user: dict = Depends(get_current_user)):
    """Get subject by ID"""
    subject = await db.subjects.find_one({"id": subject_id}, {"_id": 0})
    if not subject:
        raise HTTPException(status_code=404, detail="المادة غير موجودة")
    return SubjectResponse(**subject)

@api_router.put("/subjects/{subject_id}")
async def update_subject(
    subject_id: str,
    subject_data: SubjectCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """Update subject"""
    result = await db.subjects.update_one(
        {"id": subject_id},
        {"$set": {
            "name": subject_data.name,
            "name_en": subject_data.name_en,
            "code": subject_data.code,
            "description": subject_data.description,
            "weekly_hours": subject_data.weekly_hours,
            "grade_levels": subject_data.grade_levels,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المادة غير موجودة")
    return {"message": "تم تحديث بيانات المادة"}

@api_router.delete("/subjects/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """Delete subject (soft delete)"""
    subject = await db.subjects.find_one({"id": subject_id}, {"_id": 0})
    if not subject:
        raise HTTPException(status_code=404, detail="المادة غير موجودة")
    
    await db.subjects.update_one({"id": subject_id}, {"$set": {"is_active": False}})
    return {"message": "تم حذف المادة"}

# ============== SEED DATA ==============
@api_router.post("/seed/admin")
async def seed_admin():
    """Create initial platform admin if not exists"""
    # Check for old admin and delete
    await db.users.delete_one({"email": "admin@nassaq.sa"})
    
    # Check if new admin exists
    existing = await db.users.find_one({"email": "info@nassaqapp.com"})
    if existing:
        return {"message": "Admin already exists", "email": "info@nassaqapp.com"}
    
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "email": "info@nassaqapp.com",
        "password_hash": hash_password("NassaqAdmin2026!##$$HBJ"),
        "full_name": "مدير المنصة",
        "full_name_en": "Platform Admin",
        "role": UserRole.PLATFORM_ADMIN.value,
        "tenant_id": None,
        "phone": None,
        "avatar_url": None,
        "is_active": True,
        "preferred_language": "ar",
        "preferred_theme": "light",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_doc)
    return {"message": "Admin created", "email": "info@nassaqapp.com"}


# ============== SEED DEMO DATA ==============
@api_router.post("/seed/demo-data")
async def seed_demo_data():
    """
    Seed the database with demo data to match traction metrics:
    - +200 schools
    - +50,000 students  
    - +100,000 parents
    - +3,000 teachers
    
    This is for testing and demonstration purposes only.
    """
    import random
    
    # Saudi Arabian cities for realistic data
    cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "تبوك", "بريدة", "خميس مشيط", "حائل", "نجران", "جازان", "ينبع", "أبها"]
    regions = ["الرياض", "مكة المكرمة", "المدينة المنورة", "الشرقية", "القصيم", "عسير", "تبوك", "حائل", "الشمالية", "جازان", "نجران", "الباحة", "الجوف"]
    
    # School name prefixes and suffixes
    school_prefixes = ["مدارس", "مجمع", "أكاديمية", "ثانوية", "متوسطة", "ابتدائية"]
    school_names = ["النور", "الأمل", "المستقبل", "التميز", "الإبداع", "الريادة", "النجاح", "التفوق", "العلم", "المعرفة", "الحكمة", "البيان", "الفرقان", "الهدى", "السلام", "الإيمان", "التقوى", "الصلاح", "الفلاح", "الرشاد"]
    
    # Teacher specializations
    specializations = ["الرياضيات", "اللغة العربية", "اللغة الإنجليزية", "العلوم", "الفيزياء", "الكيمياء", "الأحياء", "التاريخ", "الجغرافيا", "التربية الإسلامية", "الحاسب الآلي", "التربية الفنية", "التربية البدنية"]
    
    # Grade levels
    grade_levels = ["الأول الابتدائي", "الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي", "الأول المتوسط", "الثاني المتوسط", "الثالث المتوسط", "الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"]
    
    # Arabic first names
    male_first_names = ["محمد", "أحمد", "عبدالله", "عبدالرحمن", "سعود", "فهد", "خالد", "سلطان", "ناصر", "تركي", "بندر", "فيصل", "سعد", "عمر", "علي", "حسن", "حسين", "إبراهيم", "يوسف", "عبدالعزيز"]
    female_first_names = ["نورة", "سارة", "فاطمة", "مريم", "عائشة", "خديجة", "هند", "ريم", "لمى", "دانة", "جود", "لين", "روان", "شهد", "منى", "أمل", "هدى", "سلمى", "رنا", "ندى"]
    last_names = ["العتيبي", "القحطاني", "الشمري", "الدوسري", "الحربي", "المطيري", "الغامدي", "الزهراني", "السبيعي", "العنزي", "الرشيدي", "السهلي", "البقمي", "الجهني", "الثبيتي", "الأحمدي", "المالكي", "الشهري", "العمري", "الصبحي"]
    
    results = {
        "schools_created": 0,
        "teachers_created": 0,
        "students_created": 0,
        "parents_created": 0,
        "classes_created": 0,
        "subjects_created": 0
    }
    
    # Check current counts to avoid duplicates
    current_schools = await db.schools.count_documents({})
    current_teachers = await db.teachers.count_documents({})
    current_students = await db.students.count_documents({})
    
    # Calculate how many to create
    schools_to_create = max(0, 200 - current_schools)
    teachers_per_school = 15  # Average teachers per school
    students_per_school = 250  # Average students per school
    
    if schools_to_create == 0 and current_schools >= 200 and current_teachers >= 3000 and current_students >= 50000:
        return {
            "message": "البيانات التجريبية موجودة بالفعل",
            "current_counts": {
                "schools": current_schools,
                "teachers": current_teachers,
                "students": current_students
            }
        }
    
    # Create schools
    school_ids = []
    for i in range(schools_to_create):
        school_id = str(uuid.uuid4())
        city = random.choice(cities)
        region = random.choice(regions)
        prefix = random.choice(school_prefixes)
        name = random.choice(school_names)
        
        school_doc = {
            "id": school_id,
            "name": f"{prefix} {name} {i+1}",
            "name_en": f"{name} School {i+1}",
            "code": f"SCH{str(i+1).zfill(4)}",
            "email": f"school{i+1}@nassaq.demo",
            "phone": f"05{random.randint(10000000, 99999999)}",
            "address": f"شارع {random.randint(1, 100)}، حي {random.choice(school_names)}",
            "city": city,
            "region": region,
            "country": "SA",
            "logo_url": None,
            "status": random.choice(["active", "active", "active", "pending"]),  # 75% active
            "student_capacity": random.randint(200, 500),
            "current_students": 0,
            "current_teachers": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.schools.insert_one(school_doc)
        school_ids.append(school_id)
        results["schools_created"] += 1
    
    # If no new schools created, get existing school IDs
    if not school_ids:
        existing_schools = await db.schools.find({}, {"id": 1, "_id": 0}).to_list(200)
        school_ids = [s["id"] for s in existing_schools]
    
    # Create teachers (15 per school average = 3000 for 200 schools)
    teachers_needed = max(0, 3000 - current_teachers)
    teachers_per_batch = min(teachers_needed, teachers_per_school * len(school_ids))
    
    teacher_ids_by_school = {sid: [] for sid in school_ids}
    
    for i in range(teachers_per_batch):
        school_id = school_ids[i % len(school_ids)]
        teacher_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        gender = random.choice(["male", "female"])
        first_name = random.choice(male_first_names if gender == "male" else female_first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        specialization = random.choice(specializations)
        
        # Create user account
        user_doc = {
            "id": user_id,
            "email": f"teacher{i+1}@nassaq.demo",
            "password_hash": hash_password("Teacher@123"),
            "full_name": full_name,
            "full_name_en": f"Teacher {i+1}",
            "role": UserRole.TEACHER.value,
            "tenant_id": school_id,
            "phone": f"05{random.randint(10000000, 99999999)}",
            "avatar_url": None,
            "is_active": True,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        teacher_doc = {
            "id": teacher_id,
            "user_id": user_id,
            "full_name": full_name,
            "full_name_en": f"Teacher {i+1}",
            "email": f"teacher{i+1}@nassaq.demo",
            "phone": f"05{random.randint(10000000, 99999999)}",
            "school_id": school_id,
            "specialization": specialization,
            "years_of_experience": random.randint(1, 25),
            "qualification": random.choice(["بكالوريوس", "ماجستير", "دكتوراه"]),
            "gender": gender,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        await db.teachers.insert_one(teacher_doc)
        teacher_ids_by_school[school_id].append(teacher_id)
        results["teachers_created"] += 1
        
        # Update school teacher count
        await db.schools.update_one(
            {"id": school_id},
            {"$inc": {"current_teachers": 1}}
        )
    
    # Create classes (12 per school = 2400 classes)
    class_ids_by_school = {sid: [] for sid in school_ids}
    sections = ["أ", "ب", "ج", "د"]
    
    for school_id in school_ids:
        for grade in grade_levels:
            for section in random.sample(sections, random.randint(1, 3)):
                class_id = str(uuid.uuid4())
                teacher_list = teacher_ids_by_school.get(school_id, [])
                homeroom_teacher = random.choice(teacher_list) if teacher_list else None
                
                class_doc = {
                    "id": class_id,
                    "name": f"{grade} - {section}",
                    "name_en": f"Grade {grade_levels.index(grade)+1} - {section}",
                    "school_id": school_id,
                    "grade_level": grade,
                    "section": section,
                    "capacity": random.randint(25, 35),
                    "current_students": 0,
                    "homeroom_teacher_id": homeroom_teacher,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.classes.insert_one(class_doc)
                class_ids_by_school[school_id].append(class_id)
                results["classes_created"] += 1
    
    # Create students (250 per school average = 50,000 for 200 schools)
    students_needed = max(0, 50000 - current_students)
    students_per_batch = min(students_needed, students_per_school * len(school_ids))
    
    for i in range(students_per_batch):
        school_id = school_ids[i % len(school_ids)]
        student_id = str(uuid.uuid4())
        gender = random.choice(["male", "female"])
        first_name = random.choice(male_first_names if gender == "male" else female_first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        
        # Assign to a class
        class_list = class_ids_by_school.get(school_id, [])
        class_id = random.choice(class_list) if class_list else None
        
        # Parent info
        parent_first = random.choice(male_first_names)
        parent_name = f"{parent_first} {last_name}"
        
        student_doc = {
            "id": student_id,
            "user_id": None,
            "full_name": full_name,
            "full_name_en": f"Student {i+1}",
            "email": None,
            "phone": None,
            "school_id": school_id,
            "class_id": class_id,
            "student_number": f"STD{str(i+1).zfill(6)}",
            "date_of_birth": f"{random.randint(2008, 2018)}-{str(random.randint(1,12)).zfill(2)}-{str(random.randint(1,28)).zfill(2)}",
            "gender": gender,
            "parent_phone": f"05{random.randint(10000000, 99999999)}",
            "parent_name": parent_name,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.students.insert_one(student_doc)
        results["students_created"] += 1
        
        # Update school and class student counts
        await db.schools.update_one(
            {"id": school_id},
            {"$inc": {"current_students": 1}}
        )
        if class_id:
            await db.classes.update_one(
                {"id": class_id},
                {"$inc": {"current_students": 1}}
            )
    
    # Create subjects for each school
    subject_templates = [
        {"name": "الرياضيات", "name_en": "Mathematics", "code": "MATH", "weekly_hours": 5},
        {"name": "اللغة العربية", "name_en": "Arabic Language", "code": "ARAB", "weekly_hours": 6},
        {"name": "اللغة الإنجليزية", "name_en": "English Language", "code": "ENGL", "weekly_hours": 4},
        {"name": "العلوم", "name_en": "Science", "code": "SCIE", "weekly_hours": 4},
        {"name": "الدراسات الإسلامية", "name_en": "Islamic Studies", "code": "ISLM", "weekly_hours": 3},
        {"name": "الدراسات الاجتماعية", "name_en": "Social Studies", "code": "SOCL", "weekly_hours": 3},
        {"name": "الحاسب الآلي", "name_en": "Computer Science", "code": "COMP", "weekly_hours": 2},
        {"name": "التربية الفنية", "name_en": "Art Education", "code": "ARTS", "weekly_hours": 2},
        {"name": "التربية البدنية", "name_en": "Physical Education", "code": "PHYS", "weekly_hours": 2},
    ]
    
    for school_id in school_ids[:50]:  # Create subjects for first 50 schools to save time
        for template in subject_templates:
            subject_id = str(uuid.uuid4())
            subject_doc = {
                "id": subject_id,
                "name": template["name"],
                "name_en": template["name_en"],
                "school_id": school_id,
                "code": f"{template['code']}-{school_id[:4]}",
                "description": f"مادة {template['name']}",
                "weekly_hours": template["weekly_hours"],
                "grade_levels": grade_levels,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.subjects.insert_one(subject_doc)
            results["subjects_created"] += 1
    
    # Calculate parents (each student has a parent record counted)
    results["parents_created"] = results["students_created"] * 2  # Assuming 2 parents per student on average
    
    return {
        "message": "تم إنشاء البيانات التجريبية بنجاح",
        "results": results,
        "note": "البيانات التجريبية للعرض والاختبار فقط"
    }

# ============== SCHEDULING ENGINE MODELS ==============
class TeacherRankEnum(str, Enum):
    """رتب المعلمين"""
    EXPERT = "expert"           # معلم خبير
    ADVANCED = "advanced"       # معلم متقدم
    PRACTITIONER = "practitioner"  # معلم ممارس
    ASSISTANT = "assistant"     # معلم / مساعد معلم

class DayOfWeekEnum(str, Enum):
    """أيام الأسبوع"""
    SUNDAY = "sunday"
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"

class SessionStatusEnum(str, Enum):
    """حالة الحصة"""
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ScheduleStatusEnum(str, Enum):
    """حالة الجدول"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# Time Slot Models
class TimeSlotCreate(BaseModel):
    school_id: str
    name: str
    name_en: Optional[str] = None
    start_time: str
    end_time: str
    slot_number: int
    duration_minutes: int = 45
    is_break: bool = False

class TimeSlotResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    school_id: str
    name: str
    name_en: Optional[str] = None
    start_time: str
    end_time: str
    slot_number: int
    duration_minutes: int
    is_break: bool
    is_active: bool
    created_at: str

# Teacher Assignment Models
class TeacherAssignmentCreate(BaseModel):
    school_id: str
    teacher_id: str
    class_id: str
    subject_id: str
    weekly_sessions: int = 4
    academic_year: str = "2026-2027"
    semester: int = 1

class TeacherAssignmentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    school_id: str
    teacher_id: str
    teacher_name: Optional[str] = None
    class_id: str
    class_name: Optional[str] = None
    subject_id: str
    subject_name: Optional[str] = None
    weekly_sessions: int
    academic_year: str
    semester: int
    is_active: bool
    created_at: str

# Schedule Models
class SchoolScheduleCreate(BaseModel):
    school_id: str
    name: str
    name_en: Optional[str] = None
    academic_year: str = "2026-2027"
    semester: int = 1
    effective_from: str
    effective_to: Optional[str] = None
    working_days: List[str] = ["sunday", "monday", "tuesday", "wednesday", "thursday"]

class SchoolScheduleResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    school_id: str
    name: str
    name_en: Optional[str] = None
    academic_year: str
    semester: int
    effective_from: str
    effective_to: Optional[str] = None
    working_days: List[str]
    status: str
    total_sessions: int = 0
    created_at: str
    updated_at: str

# Schedule Session Models
class ScheduleSessionCreate(BaseModel):
    school_id: str
    schedule_id: str
    assignment_id: str
    day_of_week: str
    time_slot_id: str
    room_id: Optional[str] = None

class ScheduleSessionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    school_id: str
    schedule_id: str
    assignment_id: str
    teacher_id: Optional[str] = None
    teacher_name: Optional[str] = None
    class_id: Optional[str] = None
    class_name: Optional[str] = None
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    day_of_week: str
    time_slot_id: str
    time_slot_name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    room_id: Optional[str] = None
    status: str
    created_at: str

# ============== TIME SLOTS ROUTES ==============
@api_router.post("/time-slots", response_model=TimeSlotResponse)
async def create_time_slot(
    slot_data: TimeSlotCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """إنشاء فترة زمنية جديدة"""
    slot_id = str(uuid.uuid4())
    slot_doc = {
        "id": slot_id,
        "school_id": slot_data.school_id,
        "name": slot_data.name,
        "name_en": slot_data.name_en,
        "start_time": slot_data.start_time,
        "end_time": slot_data.end_time,
        "slot_number": slot_data.slot_number,
        "duration_minutes": slot_data.duration_minutes,
        "is_break": slot_data.is_break,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.time_slots.insert_one(slot_doc)
    return TimeSlotResponse(**slot_doc)

@api_router.get("/time-slots", response_model=List[TimeSlotResponse])
async def get_time_slots(
    school_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """الحصول على الفترات الزمنية"""
    query = {}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    slots = await db.time_slots.find(query, {"_id": 0}).sort("slot_number", 1).to_list(50)
    return [TimeSlotResponse(**s) for s in slots]

@api_router.delete("/time-slots/{slot_id}")
async def delete_time_slot(
    slot_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """حذف فترة زمنية"""
    result = await db.time_slots.update_one({"id": slot_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الفترة الزمنية غير موجودة")
    return {"message": "تم حذف الفترة الزمنية"}

# ============== TEACHER ASSIGNMENTS ROUTES ==============
@api_router.post("/teacher-assignments", response_model=TeacherAssignmentResponse)
async def create_teacher_assignment(
    assignment_data: TeacherAssignmentCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """إسناد معلم لفصل ومادة"""
    # Check if assignment already exists
    existing = await db.teacher_assignments.find_one({
        "teacher_id": assignment_data.teacher_id,
        "class_id": assignment_data.class_id,
        "subject_id": assignment_data.subject_id,
        "academic_year": assignment_data.academic_year,
        "semester": assignment_data.semester,
        "is_active": True
    })
    if existing:
        raise HTTPException(status_code=400, detail="هذا الإسناد موجود بالفعل")
    
    assignment_id = str(uuid.uuid4())
    assignment_doc = {
        "id": assignment_id,
        "school_id": assignment_data.school_id,
        "teacher_id": assignment_data.teacher_id,
        "class_id": assignment_data.class_id,
        "subject_id": assignment_data.subject_id,
        "weekly_sessions": assignment_data.weekly_sessions,
        "academic_year": assignment_data.academic_year,
        "semester": assignment_data.semester,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.teacher_assignments.insert_one(assignment_doc)
    
    # Get names for response
    teacher = await db.teachers.find_one({"id": assignment_data.teacher_id}, {"_id": 0, "full_name": 1})
    class_doc = await db.classes.find_one({"id": assignment_data.class_id}, {"_id": 0, "name": 1})
    subject = await db.subjects.find_one({"id": assignment_data.subject_id}, {"_id": 0, "name": 1})
    
    return TeacherAssignmentResponse(
        **assignment_doc,
        teacher_name=teacher.get("full_name") if teacher else None,
        class_name=class_doc.get("name") if class_doc else None,
        subject_name=subject.get("name") if subject else None
    )

@api_router.get("/teacher-assignments", response_model=List[TeacherAssignmentResponse])
async def get_teacher_assignments(
    school_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    class_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """الحصول على إسنادات المعلمين"""
    query = {"is_active": True}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    if teacher_id:
        query["teacher_id"] = teacher_id
    if class_id:
        query["class_id"] = class_id
    
    assignments = await db.teacher_assignments.find(query, {"_id": 0}).to_list(500)
    
    # Get all related entities
    teacher_ids = list(set(a.get("teacher_id") for a in assignments))
    class_ids = list(set(a.get("class_id") for a in assignments))
    subject_ids = list(set(a.get("subject_id") for a in assignments))
    
    teachers = await db.teachers.find({"id": {"$in": teacher_ids}}, {"_id": 0}).to_list(100)
    classes = await db.classes.find({"id": {"$in": class_ids}}, {"_id": 0}).to_list(100)
    subjects = await db.subjects.find({"id": {"$in": subject_ids}}, {"_id": 0}).to_list(100)
    
    teacher_map = {t.get("id"): t.get("full_name") for t in teachers}
    class_map = {c.get("id"): c.get("name") for c in classes}
    subject_map = {s.get("id"): s.get("name") for s in subjects}
    
    result = []
    for a in assignments:
        result.append(TeacherAssignmentResponse(
            **a,
            teacher_name=teacher_map.get(a.get("teacher_id")),
            class_name=class_map.get(a.get("class_id")),
            subject_name=subject_map.get(a.get("subject_id"))
        ))
    
    return result

@api_router.delete("/teacher-assignments/{assignment_id}")
async def delete_teacher_assignment(
    assignment_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """حذف إسناد معلم"""
    result = await db.teacher_assignments.update_one(
        {"id": assignment_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الإسناد غير موجود")
    return {"message": "تم حذف الإسناد"}

# ============== SCHOOL SCHEDULES ROUTES ==============
@api_router.post("/schedules", response_model=SchoolScheduleResponse)
async def create_schedule(
    schedule_data: SchoolScheduleCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """إنشاء جدول مدرسي جديد"""
    schedule_id = str(uuid.uuid4())
    schedule_doc = {
        "id": schedule_id,
        "school_id": schedule_data.school_id,
        "name": schedule_data.name,
        "name_en": schedule_data.name_en,
        "academic_year": schedule_data.academic_year,
        "semester": schedule_data.semester,
        "effective_from": schedule_data.effective_from,
        "effective_to": schedule_data.effective_to,
        "working_days": schedule_data.working_days,
        "status": ScheduleStatusEnum.DRAFT.value,
        "total_sessions": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.schedules.insert_one(schedule_doc)
    return SchoolScheduleResponse(**schedule_doc)

@api_router.get("/schedules", response_model=List[SchoolScheduleResponse])
async def get_schedules(
    school_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """الحصول على الجداول المدرسية"""
    query = {}
    if school_id:
        query["school_id"] = school_id
    elif current_user.get("role") != UserRole.PLATFORM_ADMIN.value:
        query["school_id"] = current_user.get("tenant_id")
    
    if status:
        query["status"] = status
    
    schedules = await db.schedules.find(query, {"_id": 0}).to_list(100)
    return [SchoolScheduleResponse(**s) for s in schedules]

@api_router.get("/schedules/{schedule_id}", response_model=SchoolScheduleResponse)
async def get_schedule(schedule_id: str, current_user: dict = Depends(get_current_user)):
    """الحصول على جدول محدد"""
    schedule = await db.schedules.find_one({"id": schedule_id}, {"_id": 0})
    if not schedule:
        raise HTTPException(status_code=404, detail="الجدول غير موجود")
    return SchoolScheduleResponse(**schedule)

@api_router.put("/schedules/{schedule_id}/publish")
async def publish_schedule(
    schedule_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """نشر الجدول المدرسي"""
    result = await db.schedules.update_one(
        {"id": schedule_id},
        {"$set": {"status": ScheduleStatusEnum.PUBLISHED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الجدول غير موجود")
    return {"message": "تم نشر الجدول"}

@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """حذف جدول مدرسي"""
    # Delete all sessions first
    await db.schedule_sessions.delete_many({"schedule_id": schedule_id})
    
    result = await db.schedules.update_one(
        {"id": schedule_id},
        {"$set": {"status": ScheduleStatusEnum.ARCHIVED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الجدول غير موجود")
    return {"message": "تم حذف الجدول"}

# ============== SCHEDULE SESSIONS ROUTES ==============
@api_router.post("/schedule-sessions", response_model=ScheduleSessionResponse)
async def create_schedule_session(
    session_data: ScheduleSessionCreate,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """إضافة حصة للجدول"""
    # Check for conflicts
    existing = await db.schedule_sessions.find_one({
        "schedule_id": session_data.schedule_id,
        "day_of_week": session_data.day_of_week,
        "time_slot_id": session_data.time_slot_id,
        "assignment_id": session_data.assignment_id,
        "status": {"$ne": SessionStatusEnum.CANCELLED.value}
    })
    if existing:
        raise HTTPException(status_code=400, detail="هذه الحصة موجودة بالفعل")
    
    # Get assignment details
    assignment = await db.teacher_assignments.find_one({"id": session_data.assignment_id}, {"_id": 0})
    if not assignment:
        raise HTTPException(status_code=404, detail="الإسناد غير موجود")
    
    session_id = str(uuid.uuid4())
    session_doc = {
        "id": session_id,
        "school_id": session_data.school_id,
        "schedule_id": session_data.schedule_id,
        "assignment_id": session_data.assignment_id,
        "day_of_week": session_data.day_of_week,
        "time_slot_id": session_data.time_slot_id,
        "room_id": session_data.room_id,
        "status": SessionStatusEnum.SCHEDULED.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.schedule_sessions.insert_one(session_doc)
    
    # Update schedule session count
    await db.schedules.update_one(
        {"id": session_data.schedule_id},
        {"$inc": {"total_sessions": 1}}
    )
    
    # Get names for response
    teacher = await db.teachers.find_one({"id": assignment.get("teacher_id")}, {"_id": 0})
    class_doc = await db.classes.find_one({"id": assignment.get("class_id")}, {"_id": 0})
    subject = await db.subjects.find_one({"id": assignment.get("subject_id")}, {"_id": 0})
    time_slot = await db.time_slots.find_one({"id": session_data.time_slot_id}, {"_id": 0})
    
    return ScheduleSessionResponse(
        **session_doc,
        teacher_id=assignment.get("teacher_id"),
        teacher_name=teacher.get("full_name") if teacher else None,
        class_id=assignment.get("class_id"),
        class_name=class_doc.get("name") if class_doc else None,
        subject_id=assignment.get("subject_id"),
        subject_name=subject.get("name") if subject else None,
        time_slot_name=time_slot.get("name") if time_slot else None,
        start_time=time_slot.get("start_time") if time_slot else None,
        end_time=time_slot.get("end_time") if time_slot else None
    )

@api_router.get("/schedule-sessions", response_model=List[ScheduleSessionResponse])
async def get_schedule_sessions(
    schedule_id: str,
    day_of_week: Optional[str] = None,
    teacher_id: Optional[str] = None,
    class_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """الحصول على حصص الجدول"""
    query = {"schedule_id": schedule_id, "status": {"$ne": SessionStatusEnum.CANCELLED.value}}
    
    if day_of_week:
        query["day_of_week"] = day_of_week
    
    sessions = await db.schedule_sessions.find(query, {"_id": 0}).to_list(500)
    
    # Get all related data
    assignment_ids = list(set(s.get("assignment_id") for s in sessions))
    time_slot_ids = list(set(s.get("time_slot_id") for s in sessions))
    
    assignments = await db.teacher_assignments.find({"id": {"$in": assignment_ids}}, {"_id": 0}).to_list(100)
    time_slots = await db.time_slots.find({"id": {"$in": time_slot_ids}}, {"_id": 0}).to_list(20)
    
    assignment_map = {a.get("id"): a for a in assignments}
    slot_map = {s.get("id"): s for s in time_slots}
    
    # Get teacher/class/subject names
    teacher_ids = list(set(a.get("teacher_id") for a in assignments if a))
    class_ids = list(set(a.get("class_id") for a in assignments if a))
    subject_ids = list(set(a.get("subject_id") for a in assignments if a))
    
    teachers = await db.teachers.find({"id": {"$in": teacher_ids}}, {"_id": 0}).to_list(100)
    classes = await db.classes.find({"id": {"$in": class_ids}}, {"_id": 0}).to_list(100)
    subjects = await db.subjects.find({"id": {"$in": subject_ids}}, {"_id": 0}).to_list(100)
    
    teacher_map = {t.get("id"): t.get("full_name") for t in teachers}
    class_map = {c.get("id"): c.get("name") for c in classes}
    subject_map = {s.get("id"): s.get("name") for s in subjects}
    
    # Filter by teacher/class if specified
    result = []
    for s in sessions:
        assignment = assignment_map.get(s.get("assignment_id"), {})
        
        if teacher_id and assignment.get("teacher_id") != teacher_id:
            continue
        if class_id and assignment.get("class_id") != class_id:
            continue
        
        slot = slot_map.get(s.get("time_slot_id"), {})
        
        result.append(ScheduleSessionResponse(
            **s,
            teacher_id=assignment.get("teacher_id"),
            teacher_name=teacher_map.get(assignment.get("teacher_id")),
            class_id=assignment.get("class_id"),
            class_name=class_map.get(assignment.get("class_id")),
            subject_id=assignment.get("subject_id"),
            subject_name=subject_map.get(assignment.get("subject_id")),
            time_slot_name=slot.get("name"),
            start_time=slot.get("start_time"),
            end_time=slot.get("end_time")
        ))
    
    return result

@api_router.delete("/schedule-sessions/{session_id}")
async def delete_schedule_session(
    session_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """حذف حصة من الجدول"""
    session = await db.schedule_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="الحصة غير موجودة")
    
    await db.schedule_sessions.update_one(
        {"id": session_id},
        {"$set": {"status": SessionStatusEnum.CANCELLED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update schedule session count
    await db.schedules.update_one(
        {"id": session.get("schedule_id")},
        {"$inc": {"total_sessions": -1}}
    )
    
    return {"message": "تم حذف الحصة"}

# ============== SCHEDULE GENERATION (AI) ==============
@api_router.post("/schedules/{schedule_id}/generate")
async def generate_schedule_auto(
    schedule_id: str,
    respect_workload: bool = True,
    max_iterations: int = 1000,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """توليد الجدول تلقائياً"""
    import random
    
    schedule = await db.schedules.find_one({"id": schedule_id}, {"_id": 0})
    if not schedule:
        raise HTTPException(status_code=404, detail="الجدول غير موجود")
    
    school_id = schedule.get("school_id")
    working_days = schedule.get("working_days", ["sunday", "monday", "tuesday", "wednesday", "thursday"])
    
    # Get time slots
    time_slots = await db.time_slots.find(
        {"school_id": school_id, "is_active": True, "is_break": False},
        {"_id": 0}
    ).sort("slot_number", 1).to_list(20)
    
    if not time_slots:
        raise HTTPException(status_code=400, detail="لم يتم تعريف الفترات الزمنية")
    
    # Get assignments
    assignments = await db.teacher_assignments.find({
        "school_id": school_id,
        "is_active": True,
        "academic_year": schedule.get("academic_year"),
        "semester": schedule.get("semester")
    }, {"_id": 0}).to_list(500)
    
    if not assignments:
        raise HTTPException(status_code=400, detail="لم يتم العثور على إسنادات للمعلمين")
    
    # Clear existing sessions
    await db.schedule_sessions.delete_many({"schedule_id": schedule_id})
    
    # Build sessions to place
    sessions_to_place = []
    for assignment in assignments:
        for i in range(assignment.get("weekly_sessions", 4)):
            sessions_to_place.append({
                "assignment_id": assignment.get("id"),
                "teacher_id": assignment.get("teacher_id"),
                "class_id": assignment.get("class_id"),
                "placed": False
            })
    
    random.shuffle(sessions_to_place)
    
    # Track placements
    teacher_schedule = {d: {} for d in working_days}
    class_schedule = {d: {} for d in working_days}
    sessions_created = 0
    conflicts = []
    
    for session_req in sessions_to_place:
        teacher_id = session_req["teacher_id"]
        class_id = session_req["class_id"]
        
        placed = False
        days = list(working_days)
        random.shuffle(days)
        
        for day in days:
            if placed:
                break
            
            for slot in time_slots:
                slot_id = slot.get("id")
                
                # Check teacher availability
                if teacher_schedule[day].get(slot_id) is not None:
                    if teacher_schedule[day][slot_id] == teacher_id:
                        continue  # Teacher already busy
                
                # Check class availability
                if class_schedule[day].get(slot_id) is not None:
                    if class_schedule[day][slot_id] == class_id:
                        continue  # Class already busy
                
                # Place session
                session_id = str(uuid.uuid4())
                session_doc = {
                    "id": session_id,
                    "school_id": school_id,
                    "schedule_id": schedule_id,
                    "assignment_id": session_req["assignment_id"],
                    "day_of_week": day,
                    "time_slot_id": slot_id,
                    "room_id": None,
                    "status": SessionStatusEnum.SCHEDULED.value,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.schedule_sessions.insert_one(session_doc)
                
                teacher_schedule[day][slot_id] = teacher_id
                class_schedule[day][slot_id] = class_id
                sessions_created += 1
                session_req["placed"] = True
                placed = True
                break
    
    # Update schedule
    await db.schedules.update_one(
        {"id": schedule_id},
        {"$set": {
            "total_sessions": sessions_created,
            "status": ScheduleStatusEnum.DRAFT.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    unplaced = sum(1 for s in sessions_to_place if not s["placed"])
    
    return {
        "success": unplaced == 0,
        "schedule_id": schedule_id,
        "sessions_created": sessions_created,
        "unplaced_sessions": unplaced,
        "message": f"تم إنشاء {sessions_created} حصة",
        "message_en": f"Created {sessions_created} sessions"
    }

# ============== SCHEDULE CONFLICTS CHECK ==============
@api_router.get("/schedules/{schedule_id}/conflicts")
async def check_schedule_conflicts(
    schedule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """التحقق من تعارضات الجدول"""
    conflicts = []
    
    sessions = await db.schedule_sessions.find({
        "schedule_id": schedule_id,
        "status": {"$ne": SessionStatusEnum.CANCELLED.value}
    }, {"_id": 0}).to_list(500)
    
    # Group by day and time slot
    by_day_slot = {}
    for session in sessions:
        key = (session.get("day_of_week"), session.get("time_slot_id"))
        if key not in by_day_slot:
            by_day_slot[key] = []
        by_day_slot[key].append(session)
    
    for (day, slot_id), slot_sessions in by_day_slot.items():
        if len(slot_sessions) < 2:
            continue
        
        assignment_ids = [s.get("assignment_id") for s in slot_sessions]
        assignments = await db.teacher_assignments.find(
            {"id": {"$in": assignment_ids}}, {"_id": 0}
        ).to_list(100)
        assignment_map = {a.get("id"): a for a in assignments}
        
        teachers_seen = {}
        classes_seen = {}
        
        for session in slot_sessions:
            assignment = assignment_map.get(session.get("assignment_id"), {})
            teacher_id = assignment.get("teacher_id")
            class_id = assignment.get("class_id")
            
            if teacher_id:
                if teacher_id in teachers_seen:
                    teacher = await db.teachers.find_one({"id": teacher_id}, {"_id": 0, "full_name": 1})
                    conflicts.append({
                        "type": "teacher_double_booking",
                        "day": day,
                        "time_slot_id": slot_id,
                        "teacher_id": teacher_id,
                        "teacher_name": teacher.get("full_name") if teacher else "Unknown",
                        "message_ar": f"المعلم مجدول في أكثر من حصة",
                        "severity": "error"
                    })
                teachers_seen[teacher_id] = session.get("id")
            
            if class_id:
                if class_id in classes_seen:
                    class_doc = await db.classes.find_one({"id": class_id}, {"_id": 0, "name": 1})
                    conflicts.append({
                        "type": "class_double_booking",
                        "day": day,
                        "time_slot_id": slot_id,
                        "class_id": class_id,
                        "class_name": class_doc.get("name") if class_doc else "Unknown",
                        "message_ar": f"الفصل مجدول في أكثر من حصة",
                        "severity": "error"
                    })
                classes_seen[class_id] = session.get("id")
    
    return {
        "schedule_id": schedule_id,
        "total_conflicts": len(conflicts),
        "conflicts": conflicts
    }

# ============== TEACHER RANK UPDATE ==============
@api_router.put("/teachers/{teacher_id}/rank")
async def update_teacher_rank(
    teacher_id: str,
    rank: TeacherRankEnum,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """تحديث رتبة المعلم"""
    result = await db.teachers.update_one(
        {"id": teacher_id},
        {"$set": {"rank": rank.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المعلم غير موجود")
    return {"message": "تم تحديث رتبة المعلم"}

# ============== TEACHER WORKLOAD ==============
@api_router.get("/teachers/{teacher_id}/workload")
async def get_teacher_workload(
    teacher_id: str,
    schedule_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """الحصول على نصاب المعلم"""
    teacher = await db.teachers.find_one({"id": teacher_id}, {"_id": 0})
    if not teacher:
        raise HTTPException(status_code=404, detail="المعلم غير موجود")
    
    rank_str = teacher.get("rank", TeacherRankEnum.PRACTITIONER.value)
    
    # Workload limits by rank
    workload_limits = {
        TeacherRankEnum.EXPERT.value: {"min": 12, "max": 18, "daily_max": 4},
        TeacherRankEnum.ADVANCED.value: {"min": 16, "max": 20, "daily_max": 5},
        TeacherRankEnum.PRACTITIONER.value: {"min": 18, "max": 24, "daily_max": 6},
        TeacherRankEnum.ASSISTANT.value: {"min": 20, "max": 26, "daily_max": 7},
    }
    
    limits = workload_limits.get(rank_str, workload_limits[TeacherRankEnum.PRACTITIONER.value])
    
    # Get assignments
    assignments = await db.teacher_assignments.find(
        {"teacher_id": teacher_id, "is_active": True}, {"_id": 0}
    ).to_list(50)
    
    total_weekly_sessions = sum(a.get("weekly_sessions", 0) for a in assignments)
    
    # Get actual sessions if schedule_id provided
    actual_sessions = 0
    sessions_by_day = {}
    if schedule_id:
        assignment_ids = [a.get("id") for a in assignments]
        sessions = await db.schedule_sessions.find({
            "schedule_id": schedule_id,
            "assignment_id": {"$in": assignment_ids},
            "status": {"$ne": SessionStatusEnum.CANCELLED.value}
        }, {"_id": 0}).to_list(200)
        
        actual_sessions = len(sessions)
        for s in sessions:
            day = s.get("day_of_week")
            if day not in sessions_by_day:
                sessions_by_day[day] = 0
            sessions_by_day[day] += 1
    
    return {
        "teacher_id": teacher_id,
        "teacher_name": teacher.get("full_name"),
        "rank": rank_str,
        "weekly_hours_min": limits["min"],
        "weekly_hours_max": limits["max"],
        "daily_sessions_max": limits["daily_max"],
        "total_assigned_sessions": total_weekly_sessions,
        "actual_scheduled_sessions": actual_sessions,
        "sessions_by_day": sessions_by_day,
        "is_overloaded": total_weekly_sessions > limits["max"],
        "is_underloaded": total_weekly_sessions < limits["min"],
        "assignments_count": len(assignments)
    }

# ============== SEED TIME SLOTS ==============
@api_router.post("/seed/time-slots/{school_id}")
async def seed_time_slots(
    school_id: str,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL]))
):
    """إنشاء فترات زمنية افتراضية للمدرسة"""
    # Check if slots already exist
    existing = await db.time_slots.count_documents({"school_id": school_id})
    if existing > 0:
        return {"message": "الفترات الزمنية موجودة بالفعل", "count": existing}
    
    # Default time slots for Saudi schools
    default_slots = [
        {"name": "الحصة الأولى", "name_en": "Period 1", "start_time": "07:00", "end_time": "07:45", "slot_number": 1, "is_break": False},
        {"name": "الحصة الثانية", "name_en": "Period 2", "start_time": "07:50", "end_time": "08:35", "slot_number": 2, "is_break": False},
        {"name": "الحصة الثالثة", "name_en": "Period 3", "start_time": "08:40", "end_time": "09:25", "slot_number": 3, "is_break": False},
        {"name": "الاستراحة", "name_en": "Break", "start_time": "09:25", "end_time": "09:45", "slot_number": 4, "is_break": True},
        {"name": "الحصة الرابعة", "name_en": "Period 4", "start_time": "09:45", "end_time": "10:30", "slot_number": 5, "is_break": False},
        {"name": "الحصة الخامسة", "name_en": "Period 5", "start_time": "10:35", "end_time": "11:20", "slot_number": 6, "is_break": False},
        {"name": "الحصة السادسة", "name_en": "Period 6", "start_time": "11:25", "end_time": "12:10", "slot_number": 7, "is_break": False},
        {"name": "الصلاة", "name_en": "Prayer", "start_time": "12:10", "end_time": "12:30", "slot_number": 8, "is_break": True},
        {"name": "الحصة السابعة", "name_en": "Period 7", "start_time": "12:30", "end_time": "13:15", "slot_number": 9, "is_break": False},
    ]
    
    created = 0
    for slot in default_slots:
        slot_id = str(uuid.uuid4())
        slot_doc = {
            "id": slot_id,
            "school_id": school_id,
            "duration_minutes": 45 if not slot["is_break"] else 20,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            **slot
        }
        await db.time_slots.insert_one(slot_doc)
        created += 1
    
    return {"message": f"تم إنشاء {created} فترة زمنية", "count": created}

# ============== LEGACY ROUTES ==============
@api_router.get("/")
async def root():
    return {"message": "مرحباً بك في نَسَّق - نظام إدارة المدارس الذكي"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
