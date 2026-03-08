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
        total_students = await db.users.count_documents({"role": "student"})
        total_teachers = await db.users.count_documents({"role": "teacher"})
    else:
        tenant_id = current_user.get("tenant_id")
        total_schools = 1
        active_schools = 1
        pending_schools = 0
        total_users = await db.users.count_documents({"tenant_id": tenant_id})
        total_students = await db.users.count_documents({"tenant_id": tenant_id, "role": "student"})
        total_teachers = await db.users.count_documents({"tenant_id": tenant_id, "role": "teacher"})
    
    return DashboardStats(
        total_schools=total_schools,
        total_students=total_students,
        total_teachers=total_teachers,
        active_schools=active_schools,
        pending_schools=pending_schools,
        total_users=total_users
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
