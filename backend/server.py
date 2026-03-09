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
    suspended_schools: int = 0
    setup_schools: int = 0
    total_users: int = 0
    pending_requests: int = 0
    active_users: int = 0
    total_classes: int = 0
    total_subjects: int = 0
    total_operations: int = 0
    teachers_without_classes: int = 0
    incomplete_schedules: int = 0
    schools_without_principal: int = 0
    students_missing_data: int = 0
    teachers_without_rank: int = 0

class AIOperationResult(BaseModel):
    success: bool
    message: str
    message_en: str
    health_score: Optional[int] = None
    issues_found: int = 0
    recommendations: int = 0
    details: Optional[dict] = None

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
        suspended_schools = await db.schools.count_documents({"status": "suspended"})
        setup_schools = await db.schools.count_documents({"status": "setup"})
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({"is_active": True})
        total_students = await db.students.count_documents({})
        total_teachers = await db.teachers.count_documents({})
        total_classes = await db.classes.count_documents({})
        total_subjects = await db.subjects.count_documents({})
        pending_requests = await db.registration_requests.count_documents({"status": "pending"})
        
        # Additional stats
        teachers_without_classes = await db.teachers.count_documents({"assigned_classes": {"$size": 0}})
        incomplete_schedules = await db.teachers.count_documents({"schedule_complete": False})
        schools_without_principal = 0  # Would need principal check
        students_missing_data = await db.students.count_documents({
            "$or": [{"parent_phone": None}, {"parent_phone": ""}]
        })
        teachers_without_rank = await db.teachers.count_documents({
            "$or": [{"rank": None}, {"rank": ""}]
        })
        total_operations = await db.events.count_documents({})
    else:
        tenant_id = current_user.get("tenant_id")
        total_schools = 1
        active_schools = 1
        pending_schools = 0
        suspended_schools = 0
        setup_schools = 0
        total_users = await db.users.count_documents({"tenant_id": tenant_id})
        active_users = await db.users.count_documents({"tenant_id": tenant_id, "is_active": True})
        total_students = await db.students.count_documents({"school_id": tenant_id})
        total_teachers = await db.teachers.count_documents({"school_id": tenant_id})
        total_classes = await db.classes.count_documents({"school_id": tenant_id})
        total_subjects = await db.subjects.count_documents({"school_id": tenant_id})
        pending_requests = 0
        teachers_without_classes = 0
        incomplete_schedules = 0
        schools_without_principal = 0
        students_missing_data = 0
        teachers_without_rank = 0
        total_operations = await db.events.count_documents({"tenant_id": tenant_id})
    
    return DashboardStats(
        total_schools=total_schools,
        total_students=total_students,
        total_teachers=total_teachers,
        active_schools=active_schools,
        pending_schools=pending_schools,
        suspended_schools=suspended_schools,
        setup_schools=setup_schools,
        total_users=total_users,
        active_users=active_users,
        pending_requests=pending_requests,
        total_classes=total_classes,
        total_subjects=total_subjects,
        total_operations=total_operations,
        teachers_without_classes=teachers_without_classes,
        incomplete_schedules=incomplete_schedules,
        schools_without_principal=schools_without_principal,
        students_missing_data=students_missing_data,
        teachers_without_rank=teachers_without_rank
    )

# ============== AI OPERATIONS ==============
@api_router.post("/ai/diagnosis")
async def ai_system_diagnosis(current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))):
    """تشخيص النظام بالذكاء الاصطناعي"""
    # Gather system metrics
    total_schools = await db.schools.count_documents({})
    active_schools = await db.schools.count_documents({"status": "active"})
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    
    # Calculate health score
    health_score = 100
    issues = []
    recommendations = []
    
    # Check for inactive schools
    inactive_schools = total_schools - active_schools
    if inactive_schools > 0:
        health_score -= min(10, inactive_schools * 2)
        issues.append(f"{inactive_schools} مدرسة غير نشطة")
    
    # Check for low active users ratio
    if total_users > 0:
        active_ratio = (active_users / total_users) * 100
        if active_ratio < 70:
            health_score -= 10
            issues.append(f"نسبة المستخدمين النشطين منخفضة ({active_ratio:.1f}%)")
            recommendations.append("مراجعة حسابات المستخدمين غير النشطين")
    
    # Check pending requests
    pending = await db.registration_requests.count_documents({"status": "pending"})
    if pending > 10:
        health_score -= 5
        issues.append(f"{pending} طلب تسجيل معلق")
        recommendations.append("مراجعة طلبات التسجيل المعلقة")
    
    return {
        "success": True,
        "message": "تم تشخيص النظام بنجاح" if health_score >= 80 else "يحتاج النظام إلى متابعة",
        "message_en": "System diagnosis completed",
        "health_score": max(0, health_score),
        "issues_found": len(issues),
        "recommendations": len(recommendations),
        "details": {
            "issues": issues,
            "recommendations": recommendations,
            "metrics": {
                "total_schools": total_schools,
                "active_schools": active_schools,
                "total_users": total_users,
                "active_users": active_users,
                "pending_requests": pending
            }
        }
    }

@api_router.post("/ai/data-quality")
async def ai_data_quality_scan(current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))):
    """فحص جودة البيانات"""
    issues = []
    
    # Check students with missing data
    students_missing_phone = await db.students.count_documents({
        "$or": [{"parent_phone": None}, {"parent_phone": ""}]
    })
    if students_missing_phone > 0:
        issues.append({"type": "missing_data", "entity": "students", "count": students_missing_phone, "field": "parent_phone"})
    
    # Check teachers without rank
    teachers_no_rank = await db.teachers.count_documents({
        "$or": [{"rank": None}, {"rank": ""}]
    })
    if teachers_no_rank > 0:
        issues.append({"type": "missing_data", "entity": "teachers", "count": teachers_no_rank, "field": "rank"})
    
    # Check classes without teachers
    classes_no_teacher = await db.classes.count_documents({
        "$or": [{"teacher_id": None}, {"teacher_id": ""}]
    })
    if classes_no_teacher > 0:
        issues.append({"type": "incomplete", "entity": "classes", "count": classes_no_teacher, "issue": "no_teacher"})
    
    # Calculate quality score
    total_records = await db.students.count_documents({}) + await db.teachers.count_documents({}) + await db.classes.count_documents({})
    total_issues = sum(i.get("count", 0) for i in issues)
    quality_score = max(0, 100 - (total_issues / max(1, total_records) * 100))
    
    return {
        "success": True,
        "message": f"جودة البيانات: {quality_score:.1f}%",
        "message_en": f"Data Quality: {quality_score:.1f}%",
        "health_score": int(quality_score),
        "issues_found": len(issues),
        "recommendations": len(issues),
        "details": {
            "quality_score": quality_score,
            "issues": issues,
            "total_records": total_records,
            "records_with_issues": total_issues
        }
    }

@api_router.post("/ai/tenant-health")
async def ai_tenant_health_check(current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))):
    """فحص صحة المدارس"""
    schools = await db.schools.find({}, {"_id": 0}).to_list(1000)
    
    healthy = []
    warning = []
    critical = []
    
    for school in schools:
        school_id = school.get("id")
        student_count = await db.students.count_documents({"school_id": school_id})
        teacher_count = await db.teachers.count_documents({"school_id": school_id})
        class_count = await db.classes.count_documents({"school_id": school_id})
        
        # Determine health
        if school.get("status") == "suspended":
            critical.append({"id": school_id, "name": school.get("name"), "reason": "موقوفة"})
        elif student_count == 0 or teacher_count == 0:
            warning.append({"id": school_id, "name": school.get("name"), "reason": "بيانات ناقصة"})
        elif class_count == 0:
            warning.append({"id": school_id, "name": school.get("name"), "reason": "لا توجد فصول"})
        else:
            healthy.append({"id": school_id, "name": school.get("name")})
    
    return {
        "success": True,
        "message": f"تم فحص {len(schools)} مدرسة",
        "message_en": f"Checked {len(schools)} schools",
        "health_score": int(len(healthy) / max(1, len(schools)) * 100),
        "issues_found": len(warning) + len(critical),
        "recommendations": len(warning) + len(critical),
        "details": {
            "healthy": len(healthy),
            "warning": len(warning),
            "critical": len(critical),
            "schools_healthy": healthy[:5],
            "schools_warning": warning,
            "schools_critical": critical
        }
    }

@api_router.post("/ai/executive-summary")
async def ai_executive_summary(current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN]))):
    """الملخص التنفيذي الذكي"""
    # Gather all stats
    total_schools = await db.schools.count_documents({})
    active_schools = await db.schools.count_documents({"status": "active"})
    total_students = await db.students.count_documents({})
    total_teachers = await db.teachers.count_documents({})
    total_classes = await db.classes.count_documents({})
    pending_requests = await db.registration_requests.count_documents({"status": "pending"})
    
    # Today's activity
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_events = await db.events.count_documents({"created_at": {"$gte": today_start.isoformat()}})
    
    summary_ar = f"""ملخص تنفيذي لمنصة نَسَّق

📊 إحصائيات عامة:
• إجمالي المدارس: {total_schools} ({active_schools} نشطة)
• إجمالي الطلاب: {total_students:,}
• إجمالي المعلمين: {total_teachers:,}
• إجمالي الفصول: {total_classes:,}

📈 نشاط اليوم:
• عدد العمليات: {today_events:,}

⚠️ يتطلب اهتمام:
• طلبات تسجيل معلقة: {pending_requests}

التوصيات:
{"• مراجعة طلبات التسجيل المعلقة" if pending_requests > 0 else "• لا توجد إجراءات مطلوبة حالياً"}
"""
    
    return {
        "success": True,
        "message": "تم إنشاء الملخص التنفيذي",
        "message_en": "Executive summary generated",
        "details": {
            "summary_ar": summary_ar,
            "summary_en": f"Platform Summary: {total_schools} schools, {total_students:,} students, {total_teachers:,} teachers",
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }

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
# ============== SESSION MOVE API (Drag & Drop) ==============
class MoveSessionRequest(BaseModel):
    """طلب نقل حصة"""
    new_day_of_week: str
    new_time_slot_id: str

class MoveSessionResponse(BaseModel):
    """استجابة نقل حصة"""
    success: bool
    session_id: str
    old_day: str
    old_time_slot_id: str
    new_day: str
    new_time_slot_id: str
    conflicts: List[dict] = []
    status: str  # 'success', 'conflict_warning', 'hard_conflict'
    message: str
    message_en: str

@api_router.put("/schedule-sessions/{session_id}/move", response_model=MoveSessionResponse)
async def move_schedule_session(
    session_id: str,
    move_data: MoveSessionRequest,
    current_user: dict = Depends(require_roles([UserRole.PLATFORM_ADMIN, UserRole.SCHOOL_PRINCIPAL, UserRole.SCHOOL_SUB_ADMIN]))
):
    """
    نقل حصة من موقع إلى آخر (Drag & Drop)
    
    يتحقق من:
    1. تعارض المعلم
    2. تعارض الفصل
    3. تعارض القاعة (إن وجدت)
    
    يُرجع:
    - success: تم النقل بنجاح
    - conflict_warning: تم النقل مع وجود تعارض يحتاج مراجعة
    - hard_conflict: تم رفض النقل وإرجاع الحصة
    """
    # Get the session
    session = await db.schedule_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="الحصة غير موجودة")
    
    old_day = session.get("day_of_week")
    old_time_slot_id = session.get("time_slot_id")
    schedule_id = session.get("schedule_id")
    assignment_id = session.get("assignment_id")
    
    # Get assignment details
    assignment = await db.teacher_assignments.find_one({"id": assignment_id}, {"_id": 0})
    if not assignment:
        raise HTTPException(status_code=404, detail="الإسناد غير موجود")
    
    teacher_id = assignment.get("teacher_id")
    class_id = assignment.get("class_id")
    
    # Validate the new time slot exists
    new_slot = await db.time_slots.find_one({"id": move_data.new_time_slot_id}, {"_id": 0})
    if not new_slot:
        raise HTTPException(status_code=400, detail="الفترة الزمنية غير موجودة")
    
    # Check for conflicts at the new position
    conflicts = []
    is_hard_conflict = False
    
    # 1. Check teacher conflict
    teacher_conflict = await db.schedule_sessions.find_one({
        "schedule_id": schedule_id,
        "day_of_week": move_data.new_day_of_week,
        "time_slot_id": move_data.new_time_slot_id,
        "id": {"$ne": session_id},
        "status": {"$ne": SessionStatusEnum.CANCELLED.value}
    }, {"_id": 0})
    
    if teacher_conflict:
        conflict_assignment = await db.teacher_assignments.find_one(
            {"id": teacher_conflict.get("assignment_id")}, {"_id": 0}
        )
        if conflict_assignment:
            conflict_teacher_id = conflict_assignment.get("teacher_id")
            conflict_class_id = conflict_assignment.get("class_id")
            
            # Check if same teacher
            if conflict_teacher_id == teacher_id:
                teacher_doc = await db.teachers.find_one({"id": teacher_id}, {"_id": 0})
                teacher_name = teacher_doc.get("full_name", "المعلم") if teacher_doc else "المعلم"
                conflicts.append({
                    "type": "teacher_double_booking",
                    "message": f"المعلم {teacher_name} لديه حصة أخرى في نفس الوقت",
                    "message_en": f"Teacher {teacher_name} has another session at the same time",
                    "severity": "hard",
                    "conflicting_session_id": teacher_conflict.get("id")
                })
                is_hard_conflict = True
            
            # Check if same class
            if conflict_class_id == class_id:
                class_doc = await db.classes.find_one({"id": class_id}, {"_id": 0})
                class_name = class_doc.get("name", "الفصل") if class_doc else "الفصل"
                conflicts.append({
                    "type": "class_double_booking",
                    "message": f"الفصل {class_name} لديه حصة أخرى في نفس الوقت",
                    "message_en": f"Class {class_name} has another session at the same time",
                    "severity": "hard",
                    "conflicting_session_id": teacher_conflict.get("id")
                })
                is_hard_conflict = True
    
    # If hard conflict, reject the move
    if is_hard_conflict:
        return MoveSessionResponse(
            success=False,
            session_id=session_id,
            old_day=old_day,
            old_time_slot_id=old_time_slot_id,
            new_day=move_data.new_day_of_week,
            new_time_slot_id=move_data.new_time_slot_id,
            conflicts=conflicts,
            status="hard_conflict",
            message="لا يمكن نقل الحصة بسبب تعارض. تم إرجاع الحصة إلى مكانها السابق.",
            message_en="Cannot move session due to conflict. Session returned to original position."
        )
    
    # Perform the move
    await db.schedule_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "day_of_week": move_data.new_day_of_week,
            "time_slot_id": move_data.new_time_slot_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Determine response status
    if conflicts:
        status = "conflict_warning"
        message = "تم نقل الحصة مع وجود تحذيرات. يرجى مراجعة التعارضات."
        message_en = "Session moved with warnings. Please review conflicts."
    else:
        status = "success"
        message = "تم نقل الحصة بنجاح"
        message_en = "Session moved successfully"
    
    return MoveSessionResponse(
        success=True,
        session_id=session_id,
        old_day=old_day,
        old_time_slot_id=old_time_slot_id,
        new_day=move_data.new_day_of_week,
        new_time_slot_id=move_data.new_time_slot_id,
        conflicts=conflicts,
        status=status,
        message=message,
        message_en=message_en
    )


# ============== SEED TEST ACCOUNTS ==============
@api_router.post("/seed/test-accounts")
async def seed_test_accounts():
    """
    إنشاء حسابات اختبار للنظام:
    - مدير المدرسة: principal@nassaq.com / NassaqPrincipal2026
    - معلم: teacher@nassaq.com / NassaqTeacher2026
    """
    results = {
        "principal": None,
        "teacher": None
    }
    
    # Get or create a test school
    test_school = await db.schools.find_one({"code": "TEST001"}, {"_id": 0})
    if not test_school:
        school_id = str(uuid.uuid4())
        test_school = {
            "id": school_id,
            "name": "مدرسة نَسَّق التجريبية",
            "name_en": "NASSAQ Test School",
            "code": "TEST001",
            "email": "school@nassaq.com",
            "phone": "0500000000",
            "address": "الرياض، المملكة العربية السعودية",
            "city": "الرياض",
            "region": "الرياض",
            "country": "SA",
            "logo_url": None,
            "status": "active",
            "student_capacity": 500,
            "current_students": 0,
            "current_teachers": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.schools.insert_one(test_school)
    
    school_id = test_school.get("id")
    
    # 1. Create Principal Account
    existing_principal = await db.users.find_one({"email": "principal@nassaq.com"})
    if existing_principal:
        # Update password to ensure it's correct
        await db.users.update_one(
            {"email": "principal@nassaq.com"},
            {"$set": {
                "password_hash": hash_password("NassaqPrincipal2026"),
                "is_active": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        results["principal"] = {"status": "updated", "email": "principal@nassaq.com"}
    else:
        principal_id = str(uuid.uuid4())
        principal_doc = {
            "id": principal_id,
            "email": "principal@nassaq.com",
            "password_hash": hash_password("NassaqPrincipal2026"),
            "full_name": "مدير المدرسة",
            "full_name_en": "School Principal",
            "role": UserRole.SCHOOL_PRINCIPAL.value,
            "tenant_id": school_id,
            "phone": "0511111111",
            "avatar_url": None,
            "is_active": True,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(principal_doc)
        results["principal"] = {"status": "created", "email": "principal@nassaq.com"}
    
    # 2. Create Teacher Account
    existing_teacher = await db.users.find_one({"email": "teacher@nassaq.com"})
    if existing_teacher:
        # Update password to ensure it's correct
        await db.users.update_one(
            {"email": "teacher@nassaq.com"},
            {"$set": {
                "password_hash": hash_password("NassaqTeacher2026"),
                "is_active": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        results["teacher"] = {"status": "updated", "email": "teacher@nassaq.com"}
    else:
        teacher_user_id = str(uuid.uuid4())
        teacher_id = str(uuid.uuid4())
        
        # User account
        teacher_user_doc = {
            "id": teacher_user_id,
            "email": "teacher@nassaq.com",
            "password_hash": hash_password("NassaqTeacher2026"),
            "full_name": "معلم تجريبي",
            "full_name_en": "Test Teacher",
            "role": UserRole.TEACHER.value,
            "tenant_id": school_id,
            "phone": "0522222222",
            "avatar_url": None,
            "is_active": True,
            "preferred_language": "ar",
            "preferred_theme": "light",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Teacher profile
        teacher_profile_doc = {
            "id": teacher_id,
            "user_id": teacher_user_id,
            "full_name": "معلم تجريبي",
            "full_name_en": "Test Teacher",
            "email": "teacher@nassaq.com",
            "phone": "0522222222",
            "school_id": school_id,
            "specialization": "الرياضيات",
            "years_of_experience": 5,
            "qualification": "بكالوريوس",
            "gender": "male",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(teacher_user_doc)
        await db.teachers.insert_one(teacher_profile_doc)
        
        # Update school teacher count
        await db.schools.update_one(
            {"id": school_id},
            {"$inc": {"current_teachers": 1}}
        )
        
        results["teacher"] = {"status": "created", "email": "teacher@nassaq.com"}
    
    return {
        "message": "تم إنشاء/تحديث حسابات الاختبار",
        "accounts": {
            "principal": {
                "email": "principal@nassaq.com",
                "password": "NassaqPrincipal2026",
                "role": "School Principal"
            },
            "teacher": {
                "email": "teacher@nassaq.com",
                "password": "NassaqTeacher2026",
                "role": "Teacher"
            }
        },
        "results": results
    }


# ============== ATTENDANCE ENGINE ==============

# Attendance Status Enum
class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

# Attendance Models
class AttendanceRecord(BaseModel):
    student_id: str
    class_id: str
    subject_id: Optional[str] = None
    teacher_id: str
    date: str  # Format: YYYY-MM-DD
    time_slot_id: Optional[str] = None
    status: AttendanceStatus
    notes: Optional[str] = None
    recorded_by: str
    recorded_at: str

class AttendanceCreate(BaseModel):
    student_id: str
    class_id: str
    subject_id: Optional[str] = None
    time_slot_id: Optional[str] = None
    status: AttendanceStatus
    notes: Optional[str] = None

class BulkAttendanceCreate(BaseModel):
    class_id: str
    subject_id: Optional[str] = None
    time_slot_id: Optional[str] = None
    date: str  # Format: YYYY-MM-DD
    records: List[dict]  # List of {student_id, status, notes}

class AttendanceResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    student_id: str
    student_name: Optional[str] = None
    class_id: str
    class_name: Optional[str] = None
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    teacher_id: str
    teacher_name: Optional[str] = None
    date: str
    time_slot_id: Optional[str] = None
    status: AttendanceStatus
    notes: Optional[str] = None
    recorded_by: str
    recorded_at: str

class AttendanceSummary(BaseModel):
    total_students: int
    present: int
    absent: int
    late: int
    excused: int
    attendance_rate: float

class StudentAttendanceHistory(BaseModel):
    student_id: str
    student_name: str
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    excused_days: int
    attendance_rate: float
    records: List[AttendanceResponse]

class DailyAttendanceReport(BaseModel):
    date: str
    class_id: str
    class_name: str
    summary: AttendanceSummary
    records: List[AttendanceResponse]

# ============== ATTENDANCE ENDPOINTS ==============

@api_router.post("/attendance", response_model=AttendanceResponse)
async def create_attendance(
    attendance: AttendanceCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a single attendance record"""
    if current_user['role'] not in ['teacher', 'school_principal', 'school_sub_admin', 'platform_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to record attendance")
    
    # Get student info
    student = await db.students.find_one({"id": attendance.student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get class info
    class_info = await db.classes.find_one({"id": attendance.class_id}, {"_id": 0})
    
    # Get subject info if provided
    subject_name = None
    if attendance.subject_id:
        subject = await db.subjects.find_one({"id": attendance.subject_id}, {"_id": 0})
        subject_name = subject.get('name') if subject else None
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if attendance already exists for this student, class, date
    existing = await db.attendance.find_one({
        "student_id": attendance.student_id,
        "class_id": attendance.class_id,
        "date": today,
        "time_slot_id": attendance.time_slot_id
    })
    
    if existing:
        # Update existing record
        await db.attendance.update_one(
            {"id": existing['id']},
            {"$set": {
                "status": attendance.status,
                "notes": attendance.notes,
                "recorded_by": current_user['id'],
                "recorded_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        updated = await db.attendance.find_one({"id": existing['id']}, {"_id": 0})
        updated['student_name'] = student.get('full_name')
        updated['class_name'] = class_info.get('name') if class_info else None
        updated['subject_name'] = subject_name
        updated['teacher_name'] = current_user.get('full_name')
        return AttendanceResponse(**updated)
    
    # Create new record
    attendance_id = str(uuid.uuid4())
    attendance_doc = {
        "id": attendance_id,
        "student_id": attendance.student_id,
        "class_id": attendance.class_id,
        "subject_id": attendance.subject_id,
        "teacher_id": current_user['id'],
        "date": today,
        "time_slot_id": attendance.time_slot_id,
        "status": attendance.status,
        "notes": attendance.notes,
        "recorded_by": current_user['id'],
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "tenant_id": current_user.get('tenant_id')
    }
    
    await db.attendance.insert_one(attendance_doc)
    
    # Create attendance event for notifications/analytics
    event_doc = {
        "id": str(uuid.uuid4()),
        "type": "attendance_recorded",
        "student_id": attendance.student_id,
        "class_id": attendance.class_id,
        "status": attendance.status,
        "recorded_by": current_user['id'],
        "date": today,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "tenant_id": current_user.get('tenant_id')
    }
    await db.events.insert_one(event_doc)
    
    return AttendanceResponse(
        id=attendance_id,
        student_id=attendance.student_id,
        student_name=student.get('full_name'),
        class_id=attendance.class_id,
        class_name=class_info.get('name') if class_info else None,
        subject_id=attendance.subject_id,
        subject_name=subject_name,
        teacher_id=current_user['id'],
        teacher_name=current_user.get('full_name'),
        date=today,
        time_slot_id=attendance.time_slot_id,
        status=attendance.status,
        notes=attendance.notes,
        recorded_by=current_user['id'],
        recorded_at=attendance_doc['recorded_at']
    )

@api_router.post("/attendance/bulk")
async def create_bulk_attendance(
    bulk_data: BulkAttendanceCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create multiple attendance records at once (for a whole class)"""
    if current_user['role'] not in ['teacher', 'school_principal', 'school_sub_admin', 'platform_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to record attendance")
    
    created_count = 0
    updated_count = 0
    errors = []
    
    for record in bulk_data.records:
        try:
            student_id = record.get('student_id')
            status = record.get('status', 'present')
            notes = record.get('notes')
            
            # Check if attendance already exists
            existing = await db.attendance.find_one({
                "student_id": student_id,
                "class_id": bulk_data.class_id,
                "date": bulk_data.date,
                "time_slot_id": bulk_data.time_slot_id
            })
            
            if existing:
                # Update existing
                await db.attendance.update_one(
                    {"id": existing['id']},
                    {"$set": {
                        "status": status,
                        "notes": notes,
                        "recorded_by": current_user['id'],
                        "recorded_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                updated_count += 1
            else:
                # Create new
                attendance_doc = {
                    "id": str(uuid.uuid4()),
                    "student_id": student_id,
                    "class_id": bulk_data.class_id,
                    "subject_id": bulk_data.subject_id,
                    "teacher_id": current_user['id'],
                    "date": bulk_data.date,
                    "time_slot_id": bulk_data.time_slot_id,
                    "status": status,
                    "notes": notes,
                    "recorded_by": current_user['id'],
                    "recorded_at": datetime.now(timezone.utc).isoformat(),
                    "tenant_id": current_user.get('tenant_id')
                }
                await db.attendance.insert_one(attendance_doc)
                created_count += 1
                
                # Create event for absent students
                if status in ['absent', 'late']:
                    event_doc = {
                        "id": str(uuid.uuid4()),
                        "type": f"student_{status}",
                        "student_id": student_id,
                        "class_id": bulk_data.class_id,
                        "date": bulk_data.date,
                        "recorded_by": current_user['id'],
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "tenant_id": current_user.get('tenant_id')
                    }
                    await db.events.insert_one(event_doc)
                    
                    # Create notification for attendance (absent/late)
                    student_info = await db.students.find_one({"id": student_id}, {"_id": 0})
                    if student_info:
                        student_name = student_info.get('full_name', 'طالب')
                        status_ar = 'غائب' if status == 'absent' else 'متأخر'
                        status_en = 'absent' if status == 'absent' else 'late'
                        
                        # Notify school principal
                        principal = await db.users.find_one({
                            "role": "school_principal", 
                            "tenant_id": current_user.get('tenant_id')
                        }, {"_id": 0})
                        if principal:
                            await create_notification_internal(
                                title=f"تنبيه حضور: {student_name}",
                                title_en=f"Attendance Alert: {student_name}",
                                message=f"الطالب {student_name} تم تسجيله {status_ar} في تاريخ {bulk_data.date}",
                                message_en=f"Student {student_name} was marked {status_en} on {bulk_data.date}",
                                recipient_id=principal['id'],
                                notification_type="attendance",
                                priority="high" if status == 'absent' else "medium",
                                sender_id=current_user['id'],
                                related_entity="student",
                                related_entity_id=student_id,
                                action_url="/admin/attendance",
                                school_id=current_user.get('tenant_id')
                            )
                        
                        # Notify parent if exists
                        if student_info.get('parent_phone'):
                            parent_user = await db.users.find_one({
                                "phone": student_info.get('parent_phone'),
                                "role": "parent"
                            }, {"_id": 0})
                            if parent_user:
                                await create_notification_internal(
                                    title=f"تنبيه حضور ابنك/ابنتك",
                                    title_en=f"Attendance Alert for Your Child",
                                    message=f"تم تسجيل {student_name} {status_ar} في المدرسة اليوم {bulk_data.date}",
                                    message_en=f"{student_name} was marked {status_en} at school on {bulk_data.date}",
                                    recipient_id=parent_user['id'],
                                    notification_type="attendance",
                                    priority="high" if status == 'absent' else "medium",
                                    sender_id=current_user['id'],
                                    related_entity="student",
                                    related_entity_id=student_id,
                                    action_url="/parent/attendance",
                                    school_id=current_user.get('tenant_id')
                                )
                    
        except Exception as e:
            errors.append({"student_id": record.get('student_id'), "error": str(e)})
    
    return {
        "message": "تم تسجيل الحضور بنجاح",
        "message_en": "Attendance recorded successfully",
        "created": created_count,
        "updated": updated_count,
        "errors": errors,
        "date": bulk_data.date,
        "class_id": bulk_data.class_id
    }

@api_router.get("/attendance/class/{class_id}", response_model=List[AttendanceResponse])
async def get_class_attendance(
    class_id: str,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance records for a class on a specific date"""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    query = {"class_id": class_id, "date": date}
    if current_user.get('tenant_id'):
        query['tenant_id'] = current_user['tenant_id']
    
    records = await db.attendance.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with names
    result = []
    for record in records:
        student = await db.students.find_one({"id": record['student_id']}, {"_id": 0})
        class_info = await db.classes.find_one({"id": record['class_id']}, {"_id": 0})
        teacher = await db.users.find_one({"id": record['teacher_id']}, {"_id": 0})
        
        record['student_name'] = student.get('full_name') if student else None
        record['class_name'] = class_info.get('name') if class_info else None
        record['teacher_name'] = teacher.get('full_name') if teacher else None
        
        if record.get('subject_id'):
            subject = await db.subjects.find_one({"id": record['subject_id']}, {"_id": 0})
            record['subject_name'] = subject.get('name') if subject else None
        
        result.append(AttendanceResponse(**record))
    
    return result

@api_router.get("/attendance/student/{student_id}", response_model=StudentAttendanceHistory)
async def get_student_attendance_history(
    student_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance history for a specific student"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    query = {"student_id": student_id}
    if start_date:
        query['date'] = {"$gte": start_date}
    if end_date:
        if 'date' in query:
            query['date']['$lte'] = end_date
        else:
            query['date'] = {"$lte": end_date}
    
    records = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    
    # Calculate statistics
    total_days = len(set(r['date'] for r in records))
    present_days = len([r for r in records if r['status'] == 'present'])
    absent_days = len([r for r in records if r['status'] == 'absent'])
    late_days = len([r for r in records if r['status'] == 'late'])
    excused_days = len([r for r in records if r['status'] == 'excused'])
    
    attendance_rate = (present_days + late_days) / total_days * 100 if total_days > 0 else 0
    
    # Enrich records
    enriched_records = []
    for record in records:
        class_info = await db.classes.find_one({"id": record['class_id']}, {"_id": 0})
        teacher = await db.users.find_one({"id": record.get('teacher_id')}, {"_id": 0})
        
        record['student_name'] = student.get('full_name')
        record['class_name'] = class_info.get('name') if class_info else None
        record['teacher_name'] = teacher.get('full_name') if teacher else None
        
        enriched_records.append(AttendanceResponse(**record))
    
    return StudentAttendanceHistory(
        student_id=student_id,
        student_name=student.get('full_name', ''),
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        late_days=late_days,
        excused_days=excused_days,
        attendance_rate=round(attendance_rate, 2),
        records=enriched_records
    )

@api_router.get("/attendance/report/daily/{class_id}", response_model=DailyAttendanceReport)
async def get_daily_attendance_report(
    class_id: str,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get daily attendance report for a class"""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    class_info = await db.classes.find_one({"id": class_id}, {"_id": 0})
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get all students in this class
    students = await db.students.find({"class_id": class_id}, {"_id": 0}).to_list(100)
    total_students = len(students)
    
    # Get attendance records for this date
    records = await db.attendance.find({"class_id": class_id, "date": date}, {"_id": 0}).to_list(100)
    
    # Calculate summary
    present = len([r for r in records if r['status'] == 'present'])
    absent = len([r for r in records if r['status'] == 'absent'])
    late = len([r for r in records if r['status'] == 'late'])
    excused = len([r for r in records if r['status'] == 'excused'])
    
    recorded_students = present + absent + late + excused
    attendance_rate = (present + late) / total_students * 100 if total_students > 0 else 0
    
    # Enrich records
    enriched_records = []
    for record in records:
        student = await db.students.find_one({"id": record['student_id']}, {"_id": 0})
        teacher = await db.users.find_one({"id": record.get('teacher_id')}, {"_id": 0})
        
        record['student_name'] = student.get('full_name') if student else None
        record['class_name'] = class_info.get('name')
        record['teacher_name'] = teacher.get('full_name') if teacher else None
        
        enriched_records.append(AttendanceResponse(**record))
    
    return DailyAttendanceReport(
        date=date,
        class_id=class_id,
        class_name=class_info.get('name', ''),
        summary=AttendanceSummary(
            total_students=total_students,
            present=present,
            absent=absent,
            late=late,
            excused=excused,
            attendance_rate=round(attendance_rate, 2)
        ),
        records=enriched_records
    )

@api_router.get("/attendance/report/summary")
async def get_attendance_summary(
    class_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance summary for a period"""
    query = {}
    
    if class_id:
        query['class_id'] = class_id
    
    if current_user.get('tenant_id'):
        query['tenant_id'] = current_user['tenant_id']
    
    if start_date:
        query['date'] = {"$gte": start_date}
    if end_date:
        if 'date' in query:
            query['date']['$lte'] = end_date
        else:
            query['date'] = {"$lte": end_date}
    
    records = await db.attendance.find(query, {"_id": 0}).to_list(10000)
    
    # Group by date
    dates = list(set(r['date'] for r in records))
    dates.sort(reverse=True)
    
    daily_summaries = []
    for date in dates[:30]:  # Last 30 days
        day_records = [r for r in records if r['date'] == date]
        present = len([r for r in day_records if r['status'] == 'present'])
        absent = len([r for r in day_records if r['status'] == 'absent'])
        late = len([r for r in day_records if r['status'] == 'late'])
        excused = len([r for r in day_records if r['status'] == 'excused'])
        total = present + absent + late + excused
        
        daily_summaries.append({
            "date": date,
            "total": total,
            "present": present,
            "absent": absent,
            "late": late,
            "excused": excused,
            "attendance_rate": round((present + late) / total * 100, 2) if total > 0 else 0
        })
    
    # Overall summary
    total_records = len(records)
    overall_present = len([r for r in records if r['status'] == 'present'])
    overall_absent = len([r for r in records if r['status'] == 'absent'])
    overall_late = len([r for r in records if r['status'] == 'late'])
    overall_excused = len([r for r in records if r['status'] == 'excused'])
    
    return {
        "overall": {
            "total_records": total_records,
            "present": overall_present,
            "absent": overall_absent,
            "late": overall_late,
            "excused": overall_excused,
            "attendance_rate": round((overall_present + overall_late) / total_records * 100, 2) if total_records > 0 else 0
        },
        "daily": daily_summaries,
        "period": {
            "start": start_date or (dates[-1] if dates else None),
            "end": end_date or (dates[0] if dates else None)
        }
    }

@api_router.get("/attendance/students-for-class/{class_id}")
async def get_students_for_attendance(
    class_id: str,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get students with their attendance status for a class"""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get class info
    class_info = await db.classes.find_one({"id": class_id}, {"_id": 0})
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get all students in this class
    students = await db.students.find({"class_id": class_id}, {"_id": 0}).to_list(100)
    
    # Get existing attendance records for today
    existing_records = await db.attendance.find(
        {"class_id": class_id, "date": date},
        {"_id": 0}
    ).to_list(100)
    
    # Create a map of student_id -> status
    attendance_map = {r['student_id']: r for r in existing_records}
    
    # Build result with attendance status
    result = []
    for student in students:
        student_id = student['id']
        attendance_record = attendance_map.get(student_id)
        
        result.append({
            "id": student_id,
            "student_code": student.get('student_code'),
            "full_name": student.get('full_name'),
            "full_name_en": student.get('full_name_en'),
            "avatar_url": student.get('avatar_url'),
            "gender": student.get('gender'),
            "attendance_status": attendance_record.get('status') if attendance_record else None,
            "attendance_notes": attendance_record.get('notes') if attendance_record else None,
            "attendance_id": attendance_record.get('id') if attendance_record else None
        })
    
    return {
        "class_id": class_id,
        "class_name": class_info.get('name'),
        "date": date,
        "total_students": len(students),
        "recorded_count": len(existing_records),
        "students": result
    }


# ============== ASSESSMENT ENGINE ==============
# Data Models

class AssessmentType(str, Enum):
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    EXAM = "exam"
    PARTICIPATION = "participation"
    PROJECT = "project"
    MIDTERM = "midterm"
    FINAL = "final"
    ORAL = "oral"
    PRACTICAL = "practical"

class AssessmentCreate(BaseModel):
    class_id: str
    subject_id: str
    title: str
    title_en: Optional[str] = None
    assessment_type: AssessmentType
    max_score: float = 100.0
    weight: float = 1.0  # Weight for GPA calculation (0.0 - 1.0)
    date: str  # YYYY-MM-DD
    description: Optional[str] = None
    is_published: bool = False

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    title_en: Optional[str] = None
    max_score: Optional[float] = None
    weight: Optional[float] = None
    date: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None

class AssessmentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    class_id: str
    class_name: Optional[str] = None
    subject_id: str
    subject_name: Optional[str] = None
    teacher_id: str
    teacher_name: Optional[str] = None
    title: str
    title_en: Optional[str] = None
    assessment_type: str
    max_score: float
    weight: float
    date: str
    description: Optional[str] = None
    is_published: bool
    created_at: str
    grades_count: Optional[int] = 0

class GradeCreate(BaseModel):
    student_id: str
    score: float
    notes: Optional[str] = None

class GradeUpdate(BaseModel):
    score: Optional[float] = None
    notes: Optional[str] = None

class GradeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    assessment_id: str
    student_id: str
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    score: float
    max_score: float
    percentage: float
    notes: Optional[str] = None
    recorded_by: str
    recorded_at: str

class BulkGradeEntry(BaseModel):
    assessment_id: str
    grades: List[GradeCreate]

class StudentGradeHistoryResponse(BaseModel):
    student_id: str
    student_name: str
    class_id: str
    class_name: str
    total_assessments: int
    average_percentage: float
    grades_by_subject: dict
    grades_by_type: dict
    recent_grades: List[dict]

class ClassGradeOverviewResponse(BaseModel):
    class_id: str
    class_name: str
    subject_id: Optional[str]
    subject_name: Optional[str]
    total_students: int
    total_assessments: int
    class_average: float
    highest_score: float
    lowest_score: float
    grade_distribution: dict
    recent_assessments: List[dict]

# Assessment APIs

@api_router.post("/assessments", response_model=AssessmentResponse)
async def create_assessment(
    assessment: AssessmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new assessment"""
    if current_user['role'] not in ['teacher', 'school_principal', 'school_sub_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to create assessments")
    
    # Verify class exists
    class_info = await db.classes.find_one({"id": assessment.class_id}, {"_id": 0})
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Verify subject exists
    subject = await db.subjects.find_one({"id": assessment.subject_id}, {"_id": 0})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    assessment_id = str(uuid.uuid4())
    assessment_doc = {
        "id": assessment_id,
        "class_id": assessment.class_id,
        "subject_id": assessment.subject_id,
        "teacher_id": current_user['id'],
        "title": assessment.title,
        "title_en": assessment.title_en,
        "assessment_type": assessment.assessment_type.value,
        "max_score": assessment.max_score,
        "weight": assessment.weight,
        "date": assessment.date,
        "description": assessment.description,
        "is_published": assessment.is_published,
        "school_id": current_user.get('tenant_id') or class_info.get('school_id'),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.assessments.insert_one(assessment_doc)
    
    # Get teacher name
    teacher = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "full_name": 1})
    
    return AssessmentResponse(
        id=assessment_id,
        class_id=assessment.class_id,
        class_name=class_info.get('name'),
        subject_id=assessment.subject_id,
        subject_name=subject.get('name'),
        teacher_id=current_user['id'],
        teacher_name=teacher.get('full_name') if teacher else None,
        title=assessment.title,
        title_en=assessment.title_en,
        assessment_type=assessment.assessment_type.value,
        max_score=assessment.max_score,
        weight=assessment.weight,
        date=assessment.date,
        description=assessment.description,
        is_published=assessment.is_published,
        created_at=assessment_doc['created_at'],
        grades_count=0
    )

@api_router.get("/assessments", response_model=List[AssessmentResponse])
async def get_assessments(
    class_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    assessment_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all assessments with optional filters"""
    query = {}
    
    # Filter by school for school-level users
    if current_user['role'] in ['school_principal', 'school_sub_admin', 'teacher']:
        if current_user.get('tenant_id'):
            query['school_id'] = current_user['tenant_id']
    
    if class_id:
        query['class_id'] = class_id
    if subject_id:
        query['subject_id'] = subject_id
    if assessment_type:
        query['assessment_type'] = assessment_type
    
    assessments = await db.assessments.find(query, {"_id": 0}).sort("date", -1).to_list(500)
    
    # Enrich with related data
    result = []
    for a in assessments:
        # Get class info
        class_info = await db.classes.find_one({"id": a['class_id']}, {"_id": 0, "name": 1})
        # Get subject info
        subject = await db.subjects.find_one({"id": a['subject_id']}, {"_id": 0, "name": 1})
        # Get teacher info
        teacher = await db.users.find_one({"id": a['teacher_id']}, {"_id": 0, "full_name": 1})
        # Count grades
        grades_count = await db.grades.count_documents({"assessment_id": a['id']})
        
        result.append(AssessmentResponse(
            id=a['id'],
            class_id=a['class_id'],
            class_name=class_info.get('name') if class_info else None,
            subject_id=a['subject_id'],
            subject_name=subject.get('name') if subject else None,
            teacher_id=a['teacher_id'],
            teacher_name=teacher.get('full_name') if teacher else None,
            title=a['title'],
            title_en=a.get('title_en'),
            assessment_type=a['assessment_type'],
            max_score=a['max_score'],
            weight=a.get('weight', 1.0),
            date=a['date'],
            description=a.get('description'),
            is_published=a.get('is_published', False),
            created_at=a['created_at'],
            grades_count=grades_count
        ))
    
    return result

@api_router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single assessment by ID"""
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Get related data
    class_info = await db.classes.find_one({"id": assessment['class_id']}, {"_id": 0, "name": 1})
    subject = await db.subjects.find_one({"id": assessment['subject_id']}, {"_id": 0, "name": 1})
    teacher = await db.users.find_one({"id": assessment['teacher_id']}, {"_id": 0, "full_name": 1})
    grades_count = await db.grades.count_documents({"assessment_id": assessment_id})
    
    return AssessmentResponse(
        id=assessment['id'],
        class_id=assessment['class_id'],
        class_name=class_info.get('name') if class_info else None,
        subject_id=assessment['subject_id'],
        subject_name=subject.get('name') if subject else None,
        teacher_id=assessment['teacher_id'],
        teacher_name=teacher.get('full_name') if teacher else None,
        title=assessment['title'],
        title_en=assessment.get('title_en'),
        assessment_type=assessment['assessment_type'],
        max_score=assessment['max_score'],
        weight=assessment.get('weight', 1.0),
        date=assessment['date'],
        description=assessment.get('description'),
        is_published=assessment.get('is_published', False),
        created_at=assessment['created_at'],
        grades_count=grades_count
    )

@api_router.put("/assessments/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: str,
    update: AssessmentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an assessment"""
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Only owner or admin can update
    if current_user['role'] not in ['school_principal', 'school_sub_admin'] and assessment['teacher_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized to update this assessment")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.assessments.update_one({"id": assessment_id}, {"$set": update_data})
    
    return await get_assessment(assessment_id, current_user)

@api_router.delete("/assessments/{assessment_id}")
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an assessment and its grades"""
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Only owner or admin can delete
    if current_user['role'] not in ['school_principal', 'school_sub_admin'] and assessment['teacher_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this assessment")
    
    # Delete all grades for this assessment
    await db.grades.delete_many({"assessment_id": assessment_id})
    # Delete the assessment
    await db.assessments.delete_one({"id": assessment_id})
    
    return {"message": "Assessment deleted successfully"}

# Grade APIs

@api_router.post("/grades/bulk")
async def create_bulk_grades(
    data: BulkGradeEntry,
    current_user: dict = Depends(get_current_user)
):
    """Create or update multiple grades at once for an assessment"""
    if current_user['role'] not in ['teacher', 'school_principal', 'school_sub_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to enter grades")
    
    assessment = await db.assessments.find_one({"id": data.assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    created = 0
    updated = 0
    errors = []
    
    for grade in data.grades:
        try:
            # Check if student exists
            student = await db.students.find_one({"id": grade.student_id}, {"_id": 0})
            if not student:
                errors.append(f"Student {grade.student_id} not found")
                continue
            
            # Validate score
            if grade.score < 0 or grade.score > assessment['max_score']:
                errors.append(f"Invalid score {grade.score} for student {grade.student_id}")
                continue
            
            # Check if grade already exists
            existing = await db.grades.find_one({
                "assessment_id": data.assessment_id,
                "student_id": grade.student_id
            })
            
            if existing:
                # Update existing grade
                await db.grades.update_one(
                    {"id": existing['id']},
                    {"$set": {
                        "score": grade.score,
                        "notes": grade.notes,
                        "recorded_by": current_user['id'],
                        "recorded_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                updated += 1
            else:
                # Create new grade
                grade_id = str(uuid.uuid4())
                grade_doc = {
                    "id": grade_id,
                    "assessment_id": data.assessment_id,
                    "student_id": grade.student_id,
                    "class_id": assessment['class_id'],
                    "subject_id": assessment['subject_id'],
                    "score": grade.score,
                    "max_score": assessment['max_score'],
                    "percentage": round((grade.score / assessment['max_score']) * 100, 2),
                    "notes": grade.notes,
                    "recorded_by": current_user['id'],
                    "recorded_at": datetime.now(timezone.utc).isoformat()
                }
                await db.grades.insert_one(grade_doc)
                created += 1
                
                # Create assessment event for notifications/analytics
                await db.events.insert_one({
                    "id": str(uuid.uuid4()),
                    "type": "grade_recorded",
                    "student_id": grade.student_id,
                    "assessment_id": data.assessment_id,
                    "score": grade.score,
                    "max_score": assessment['max_score'],
                    "recorded_by": current_user['id'],
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
                # Create notification for new grade
                student_info = await db.students.find_one({"id": grade.student_id}, {"_id": 0})
                if student_info:
                    student_name = student_info.get('full_name', 'طالب')
                    percentage = round((grade.score / assessment['max_score']) * 100, 1)
                    assessment_title = assessment.get('title', 'تقييم')
                    
                    # Notify the student if they have a user account
                    if student_info.get('user_id'):
                        await create_notification_internal(
                            title=f"درجة جديدة: {assessment_title}",
                            title_en=f"New Grade: {assessment_title}",
                            message=f"حصلت على درجة {grade.score}/{assessment['max_score']} ({percentage}%) في {assessment_title}",
                            message_en=f"You scored {grade.score}/{assessment['max_score']} ({percentage}%) in {assessment_title}",
                            recipient_id=student_info['user_id'],
                            notification_type="assessment",
                            priority="medium",
                            sender_id=current_user['id'],
                            related_entity="assessment",
                            related_entity_id=data.assessment_id,
                            action_url="/student/grades",
                            school_id=current_user.get('tenant_id')
                        )
                    
                    # Notify parent if exists
                    if student_info.get('parent_phone'):
                        parent_user = await db.users.find_one({
                            "phone": student_info.get('parent_phone'),
                            "role": "parent"
                        }, {"_id": 0})
                        if parent_user:
                            await create_notification_internal(
                                title=f"درجة جديدة لـ {student_name}",
                                title_en=f"New Grade for {student_name}",
                                message=f"حصل {student_name} على درجة {grade.score}/{assessment['max_score']} ({percentage}%) في {assessment_title}",
                                message_en=f"{student_name} scored {grade.score}/{assessment['max_score']} ({percentage}%) in {assessment_title}",
                                recipient_id=parent_user['id'],
                                notification_type="assessment",
                                priority="medium",
                                sender_id=current_user['id'],
                                related_entity="assessment",
                                related_entity_id=data.assessment_id,
                                action_url="/parent/grades",
                                school_id=current_user.get('tenant_id')
                            )
        except Exception as e:
            errors.append(f"Error processing grade for student {grade.student_id}: {str(e)}")
    
    return {
        "success": True,
        "created": created,
        "updated": updated,
        "errors": errors,
        "total_processed": created + updated
    }

@api_router.get("/grades/assessment/{assessment_id}", response_model=List[GradeResponse])
async def get_grades_for_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all grades for a specific assessment"""
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    grades = await db.grades.find({"assessment_id": assessment_id}, {"_id": 0}).to_list(500)
    
    result = []
    for g in grades:
        student = await db.students.find_one({"id": g['student_id']}, {"_id": 0, "full_name": 1, "student_code": 1})
        result.append(GradeResponse(
            id=g['id'],
            assessment_id=g['assessment_id'],
            student_id=g['student_id'],
            student_name=student.get('full_name') if student else None,
            student_code=student.get('student_code') if student else None,
            score=g['score'],
            max_score=g['max_score'],
            percentage=g.get('percentage', round((g['score'] / g['max_score']) * 100, 2)),
            notes=g.get('notes'),
            recorded_by=g['recorded_by'],
            recorded_at=g['recorded_at']
        ))
    
    return result

@api_router.get("/grades/student/{student_id}")
async def get_student_grade_history(
    student_id: str,
    subject_id: Optional[str] = None,
    assessment_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get complete grade history for a student"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get class info
    class_info = await db.classes.find_one({"id": student.get('class_id')}, {"_id": 0, "name": 1})
    
    query = {"student_id": student_id}
    if subject_id:
        query['subject_id'] = subject_id
    
    grades = await db.grades.find(query, {"_id": 0}).sort("recorded_at", -1).to_list(500)
    
    # Calculate statistics
    grades_by_subject = {}
    grades_by_type = {}
    total_percentage = 0
    
    for g in grades:
        # Get assessment details
        assessment = await db.assessments.find_one({"id": g['assessment_id']}, {"_id": 0})
        if not assessment:
            continue
        
        if assessment_type and assessment['assessment_type'] != assessment_type:
            continue
        
        # Get subject name
        subject = await db.subjects.find_one({"id": g['subject_id']}, {"_id": 0, "name": 1})
        subject_name = subject.get('name') if subject else "Unknown"
        
        # Aggregate by subject
        if subject_name not in grades_by_subject:
            grades_by_subject[subject_name] = {
                "subject_id": g['subject_id'],
                "grades": [],
                "average": 0
            }
        grades_by_subject[subject_name]['grades'].append({
            "assessment_id": g['assessment_id'],
            "title": assessment['title'],
            "type": assessment['assessment_type'],
            "score": g['score'],
            "max_score": g['max_score'],
            "percentage": g.get('percentage', 0),
            "date": assessment['date']
        })
        
        # Aggregate by type
        assessment_type_key = assessment['assessment_type']
        if assessment_type_key not in grades_by_type:
            grades_by_type[assessment_type_key] = {
                "count": 0,
                "total_percentage": 0,
                "average": 0
            }
        grades_by_type[assessment_type_key]['count'] += 1
        grades_by_type[assessment_type_key]['total_percentage'] += g.get('percentage', 0)
        
        total_percentage += g.get('percentage', 0)
    
    # Calculate averages
    for subj in grades_by_subject.values():
        if subj['grades']:
            subj['average'] = round(sum(g['percentage'] for g in subj['grades']) / len(subj['grades']), 2)
    
    for type_data in grades_by_type.values():
        if type_data['count'] > 0:
            type_data['average'] = round(type_data['total_percentage'] / type_data['count'], 2)
    
    average_percentage = round(total_percentage / len(grades), 2) if grades else 0
    
    # Get recent grades (last 10)
    recent_grades = []
    for g in grades[:10]:
        assessment = await db.assessments.find_one({"id": g['assessment_id']}, {"_id": 0})
        subject = await db.subjects.find_one({"id": g['subject_id']}, {"_id": 0, "name": 1})
        if assessment:
            recent_grades.append({
                "assessment_id": g['assessment_id'],
                "title": assessment['title'],
                "type": assessment['assessment_type'],
                "subject_name": subject.get('name') if subject else None,
                "score": g['score'],
                "max_score": g['max_score'],
                "percentage": g.get('percentage', 0),
                "date": assessment['date'],
                "recorded_at": g['recorded_at']
            })
    
    return {
        "student_id": student_id,
        "student_name": student.get('full_name'),
        "class_id": student.get('class_id'),
        "class_name": class_info.get('name') if class_info else None,
        "total_assessments": len(grades),
        "average_percentage": average_percentage,
        "grades_by_subject": grades_by_subject,
        "grades_by_type": grades_by_type,
        "recent_grades": recent_grades
    }

@api_router.get("/grades/class/{class_id}/overview")
async def get_class_grade_overview(
    class_id: str,
    subject_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get grade overview for a class"""
    class_info = await db.classes.find_one({"id": class_id}, {"_id": 0})
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get all students in class
    students = await db.students.find({"class_id": class_id}, {"_id": 0, "id": 1}).to_list(100)
    student_ids = [s['id'] for s in students]
    
    # Get grades query
    query = {"student_id": {"$in": student_ids}}
    if subject_id:
        query['subject_id'] = subject_id
    
    grades = await db.grades.find(query, {"_id": 0}).to_list(1000)
    
    # Get subject info
    subject_name = None
    if subject_id:
        subject = await db.subjects.find_one({"id": subject_id}, {"_id": 0, "name": 1})
        subject_name = subject.get('name') if subject else None
    
    # Calculate statistics
    if not grades:
        return {
            "class_id": class_id,
            "class_name": class_info.get('name'),
            "subject_id": subject_id,
            "subject_name": subject_name,
            "total_students": len(students),
            "total_assessments": 0,
            "class_average": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "grade_distribution": {},
            "recent_assessments": []
        }
    
    percentages = [g.get('percentage', 0) for g in grades]
    class_average = round(sum(percentages) / len(percentages), 2)
    highest_score = max(percentages)
    lowest_score = min(percentages)
    
    # Grade distribution
    grade_distribution = {
        "excellent": len([p for p in percentages if p >= 90]),  # A
        "very_good": len([p for p in percentages if 80 <= p < 90]),  # B
        "good": len([p for p in percentages if 70 <= p < 80]),  # C
        "pass": len([p for p in percentages if 60 <= p < 70]),  # D
        "fail": len([p for p in percentages if p < 60])  # F
    }
    
    # Get unique assessments count
    assessment_ids = list(set(g['assessment_id'] for g in grades))
    
    # Get recent assessments
    recent_assessments = []
    assessments_query = {"class_id": class_id}
    if subject_id:
        assessments_query['subject_id'] = subject_id
    
    recent_assessment_docs = await db.assessments.find(
        assessments_query, 
        {"_id": 0}
    ).sort("date", -1).limit(5).to_list(5)
    
    for a in recent_assessment_docs:
        # Get grades for this assessment
        assessment_grades = [g for g in grades if g['assessment_id'] == a['id']]
        assessment_percentages = [g.get('percentage', 0) for g in assessment_grades]
        
        recent_assessments.append({
            "id": a['id'],
            "title": a['title'],
            "type": a['assessment_type'],
            "date": a['date'],
            "max_score": a['max_score'],
            "students_graded": len(assessment_grades),
            "average": round(sum(assessment_percentages) / len(assessment_percentages), 2) if assessment_percentages else 0
        })
    
    return {
        "class_id": class_id,
        "class_name": class_info.get('name'),
        "subject_id": subject_id,
        "subject_name": subject_name,
        "total_students": len(students),
        "total_assessments": len(assessment_ids),
        "class_average": class_average,
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "grade_distribution": grade_distribution,
        "recent_assessments": recent_assessments
    }

@api_router.get("/assessments/students-for-grading/{assessment_id}")
async def get_students_for_grading(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get students with their grades for a specific assessment"""
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Get class info
    class_info = await db.classes.find_one({"id": assessment['class_id']}, {"_id": 0})
    
    # Get subject info
    subject = await db.subjects.find_one({"id": assessment['subject_id']}, {"_id": 0, "name": 1})
    
    # Get all students in this class
    students = await db.students.find({"class_id": assessment['class_id']}, {"_id": 0}).to_list(100)
    
    # Get existing grades for this assessment
    existing_grades = await db.grades.find(
        {"assessment_id": assessment_id},
        {"_id": 0}
    ).to_list(100)
    
    # Create a map of student_id -> grade
    grades_map = {g['student_id']: g for g in existing_grades}
    
    # Build result with grade data
    result = []
    for student in students:
        student_id = student['id']
        grade_record = grades_map.get(student_id)
        
        result.append({
            "id": student_id,
            "student_code": student.get('student_code'),
            "full_name": student.get('full_name'),
            "full_name_en": student.get('full_name_en'),
            "avatar_url": student.get('avatar_url'),
            "gender": student.get('gender'),
            "score": grade_record.get('score') if grade_record else None,
            "notes": grade_record.get('notes') if grade_record else None,
            "grade_id": grade_record.get('id') if grade_record else None,
            "percentage": grade_record.get('percentage') if grade_record else None
        })
    
    graded_count = len([s for s in result if s['score'] is not None])
    
    return {
        "assessment_id": assessment_id,
        "assessment_title": assessment['title'],
        "assessment_type": assessment['assessment_type'],
        "max_score": assessment['max_score'],
        "date": assessment['date'],
        "class_id": assessment['class_id'],
        "class_name": class_info.get('name') if class_info else None,
        "subject_id": assessment['subject_id'],
        "subject_name": subject.get('name') if subject else None,
        "total_students": len(students),
        "graded_count": graded_count,
        "students": result
    }


# ============== NOTIFICATION ENGINE ==============
# Data Models

class NotificationType(str, Enum):
    SYSTEM = "system"
    ATTENDANCE = "attendance"
    SCHEDULE = "schedule"
    ASSESSMENT = "assessment"
    BEHAVIOUR = "behaviour"
    COMMUNICATION = "communication"
    ANNOUNCEMENT = "announcement"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationCreate(BaseModel):
    title: str
    title_en: Optional[str] = None
    message: str
    message_en: Optional[str] = None
    notification_type: NotificationType = NotificationType.SYSTEM
    priority: NotificationPriority = NotificationPriority.MEDIUM
    recipient_id: Optional[str] = None  # Single recipient
    recipient_role: Optional[str] = None  # Role-based (all users with this role)
    related_entity: Optional[str] = None  # e.g., "student", "class", "assessment"
    related_entity_id: Optional[str] = None
    action_url: Optional[str] = None  # URL to navigate when clicked

class NotificationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    title_en: Optional[str] = None
    message: str
    message_en: Optional[str] = None
    notification_type: str
    priority: str
    related_entity: Optional[str] = None
    related_entity_id: Optional[str] = None
    action_url: Optional[str] = None
    read_status: bool
    read_at: Optional[str] = None
    created_at: str
    sender_name: Optional[str] = None

class NotificationBulkCreate(BaseModel):
    title: str
    title_en: Optional[str] = None
    message: str
    message_en: Optional[str] = None
    notification_type: NotificationType = NotificationType.SYSTEM
    priority: NotificationPriority = NotificationPriority.MEDIUM
    recipient_ids: List[str] = []  # List of user IDs
    recipient_role: Optional[str] = None  # Send to all users with this role
    related_entity: Optional[str] = None
    related_entity_id: Optional[str] = None
    action_url: Optional[str] = None

# Helper function to create notification
async def create_notification_internal(
    title: str,
    message: str,
    recipient_id: str,
    notification_type: str = "system",
    priority: str = "medium",
    sender_id: Optional[str] = None,
    related_entity: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    action_url: Optional[str] = None,
    title_en: Optional[str] = None,
    message_en: Optional[str] = None,
    school_id: Optional[str] = None
):
    """Internal helper to create notifications from other engines"""
    notification_id = str(uuid.uuid4())
    notification_doc = {
        "id": notification_id,
        "title": title,
        "title_en": title_en,
        "message": message,
        "message_en": message_en,
        "notification_type": notification_type,
        "priority": priority,
        "recipient_id": recipient_id,
        "sender_id": sender_id,
        "related_entity": related_entity,
        "related_entity_id": related_entity_id,
        "action_url": action_url,
        "school_id": school_id,
        "read_status": False,
        "read_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification_doc)
    return notification_id

# Notification APIs

@api_router.post("/notifications")
async def create_notification(
    notification: NotificationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a single notification"""
    if current_user['role'] not in ['platform_admin', 'school_principal', 'school_sub_admin', 'teacher']:
        raise HTTPException(status_code=403, detail="Not authorized to create notifications")
    
    notification_id = str(uuid.uuid4())
    notification_doc = {
        "id": notification_id,
        "title": notification.title,
        "title_en": notification.title_en,
        "message": notification.message,
        "message_en": notification.message_en,
        "notification_type": notification.notification_type.value,
        "priority": notification.priority.value,
        "recipient_id": notification.recipient_id,
        "recipient_role": notification.recipient_role,
        "sender_id": current_user['id'],
        "related_entity": notification.related_entity,
        "related_entity_id": notification.related_entity_id,
        "action_url": notification.action_url,
        "school_id": current_user.get('tenant_id'),
        "read_status": False,
        "read_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notification_doc)
    
    return {"success": True, "notification_id": notification_id, "message": "Notification created successfully"}

@api_router.post("/notifications/bulk")
async def create_bulk_notifications(
    data: NotificationBulkCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create notifications for multiple recipients or role-based"""
    if current_user['role'] not in ['platform_admin', 'school_principal', 'school_sub_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to create bulk notifications")
    
    recipient_ids = data.recipient_ids.copy()
    
    # If role-based, find all users with that role
    if data.recipient_role:
        query = {"role": data.recipient_role}
        if current_user.get('tenant_id'):
            query['tenant_id'] = current_user['tenant_id']
        users = await db.users.find(query, {"_id": 0, "id": 1}).to_list(1000)
        recipient_ids.extend([u['id'] for u in users])
    
    # Remove duplicates
    recipient_ids = list(set(recipient_ids))
    
    created_count = 0
    for recipient_id in recipient_ids:
        notification_id = str(uuid.uuid4())
        notification_doc = {
            "id": notification_id,
            "title": data.title,
            "title_en": data.title_en,
            "message": data.message,
            "message_en": data.message_en,
            "notification_type": data.notification_type.value,
            "priority": data.priority.value,
            "recipient_id": recipient_id,
            "recipient_role": data.recipient_role,
            "sender_id": current_user['id'],
            "related_entity": data.related_entity,
            "related_entity_id": data.related_entity_id,
            "action_url": data.action_url,
            "school_id": current_user.get('tenant_id'),
            "read_status": False,
            "read_at": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification_doc)
        created_count += 1
    
    return {"success": True, "created_count": created_count, "message": f"{created_count} notifications created"}

@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    notification_type: Optional[str] = None,
    read_status: Optional[bool] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get notifications for current user"""
    query = {
        "$or": [
            {"recipient_id": current_user['id']},
            {"recipient_role": current_user['role']}
        ]
    }
    
    if notification_type:
        query['notification_type'] = notification_type
    if read_status is not None:
        query['read_status'] = read_status
    
    notifications = await db.notifications.find(
        query, 
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for n in notifications:
        sender_name = None
        if n.get('sender_id'):
            sender = await db.users.find_one({"id": n['sender_id']}, {"_id": 0, "full_name": 1})
            sender_name = sender.get('full_name') if sender else None
        
        result.append(NotificationResponse(
            id=n['id'],
            title=n['title'],
            title_en=n.get('title_en'),
            message=n['message'],
            message_en=n.get('message_en'),
            notification_type=n['notification_type'],
            priority=n['priority'],
            related_entity=n.get('related_entity'),
            related_entity_id=n.get('related_entity_id'),
            action_url=n.get('action_url'),
            read_status=n.get('read_status', False),
            read_at=n.get('read_at'),
            created_at=n['created_at'],
            sender_name=sender_name
        ))
    
    return result

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({
        "$or": [
            {"recipient_id": current_user['id']},
            {"recipient_role": current_user['role']}
        ],
        "read_status": False
    })
    return {"unread_count": count}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    notification = await db.notifications.find_one({"id": notification_id}, {"_id": 0})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify the notification belongs to the user
    if notification.get('recipient_id') != current_user['id'] and notification.get('recipient_role') != current_user['role']:
        raise HTTPException(status_code=403, detail="Not authorized to access this notification")
    
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {
            "read_status": True,
            "read_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Notification marked as read"}

@api_router.put("/notifications/mark-all-read")
async def mark_all_notifications_as_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read for current user"""
    result = await db.notifications.update_many(
        {
            "$or": [
                {"recipient_id": current_user['id']},
                {"recipient_role": current_user['role']}
            ],
            "read_status": False
        },
        {"$set": {
            "read_status": True,
            "read_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "marked_count": result.modified_count}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a notification"""
    notification = await db.notifications.find_one({"id": notification_id}, {"_id": 0})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify the notification belongs to the user or user is admin
    if notification.get('recipient_id') != current_user['id'] and current_user['role'] not in ['platform_admin', 'school_principal']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
    
    await db.notifications.delete_one({"id": notification_id})
    
    return {"success": True, "message": "Notification deleted"}

@api_router.get("/notifications/analytics")
async def get_notification_analytics(
    current_user: dict = Depends(get_current_user)
):
    """Get notification analytics (admin only)"""
    if current_user['role'] not in ['platform_admin', 'school_principal']:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")
    
    query = {}
    if current_user.get('tenant_id'):
        query['school_id'] = current_user['tenant_id']
    
    total = await db.notifications.count_documents(query)
    
    read_query = {**query, "read_status": True}
    read_count = await db.notifications.count_documents(read_query)
    
    unread_query = {**query, "read_status": False}
    unread_count = await db.notifications.count_documents(unread_query)
    
    # By type
    by_type = {}
    for ntype in ["system", "attendance", "schedule", "assessment", "behaviour", "communication", "announcement"]:
        type_query = {**query, "notification_type": ntype}
        by_type[ntype] = await db.notifications.count_documents(type_query)
    
    # By priority
    by_priority = {}
    for priority in ["low", "medium", "high", "critical"]:
        priority_query = {**query, "priority": priority}
        by_priority[priority] = await db.notifications.count_documents(priority_query)
    
    read_rate = round((read_count / total) * 100, 2) if total > 0 else 0
    
    return {
        "total_notifications": total,
        "read_count": read_count,
        "unread_count": unread_count,
        "read_rate": read_rate,
        "by_type": by_type,
        "by_priority": by_priority
    }


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
