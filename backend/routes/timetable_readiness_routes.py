"""
Timetable Readiness Engine Routes
نظام التحقق من جاهزية إعدادات المدرسة لإنشاء الجدول

هذا النظام يعمل كطبقة تحقق (Validation Layer) قبل تشغيل Timetable AI Engine
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
from enum import Enum

router = APIRouter(prefix="/timetable-readiness", tags=["Timetable Readiness"])

# Database dependency - will be injected
db = None

def set_database(database):
    """Set the database connection"""
    global db
    db = database


# ============================================
# Enums and Models
# ============================================

class ReadinessStatus(str, Enum):
    NOT_READY = "NOT_READY"
    PARTIALLY_READY = "PARTIALLY_READY"
    FULLY_READY = "FULLY_READY"


class IssueType(str, Enum):
    CRITICAL = "critical"      # Blocks timetable generation
    WARNING = "warning"        # Allows generation with warnings
    INFO = "info"              # Informational only


class ReadinessIssue(BaseModel):
    id: str
    type: IssueType
    category: str
    message_ar: str
    message_en: str
    fix_link: Optional[str] = None
    fix_action: Optional[str] = None
    affected_items: Optional[List[str]] = None


class CategoryReadiness(BaseModel):
    name_ar: str
    name_en: str
    score: int
    max_score: int
    status: str
    issues: List[ReadinessIssue]


class ReadinessReport(BaseModel):
    status: ReadinessStatus
    overall_score: int
    max_score: int
    percentage: float
    categories: Dict[str, CategoryReadiness]
    critical_issues: List[ReadinessIssue]
    warnings: List[ReadinessIssue]
    info_items: List[ReadinessIssue]
    can_generate: bool
    generated_at: str


# ============================================
# Helper Functions
# ============================================

async def get_school_id_from_context(current_user: dict, x_school_context: str = None):
    """Get school ID from user context"""
    if x_school_context:
        return x_school_context
    
    user_role = current_user.get("role", "")
    if user_role == "platform_admin" and x_school_context:
        return x_school_context
    
    school_id = current_user.get("school_id")
    if school_id:
        return school_id
    
    # Try to get from user roles
    user_roles = current_user.get("roles", [])
    for role in user_roles:
        if role.get("school_id"):
            return role.get("school_id")
    
    return None


# ============================================
# Readiness Check Functions
# ============================================

async def check_academic_context(school_id: str) -> CategoryReadiness:
    """Check academic year and semester configuration"""
    issues = []
    score = 0
    max_score = 20
    
    # Get school settings
    settings = await db.school_settings.find_one(
        {"school_id": school_id},
        {"_id": 0}
    )
    
    if not settings:
        settings = {}
    
    # Check nested settings object as well
    nested_settings = settings.get("settings", {})
    
    # Check academic year (check both root and nested)
    academic_year = (
        settings.get("academicYear") or 
        settings.get("academic_year") or
        nested_settings.get("academic_year")
    )
    if academic_year:
        score += 10
    else:
        issues.append(ReadinessIssue(
            id="no-academic-year",
            type=IssueType.CRITICAL,
            category="academic_context",
            message_ar="لم يتم تحديد العام الدراسي الحالي",
            message_en="Current academic year not set",
            fix_link="/principal/settings?tab=overview",
            fix_action="تحديد العام الدراسي"
        ))
    
    # Check semester (check both root and nested)
    semester = (
        settings.get("currentSemester") or 
        settings.get("current_semester") or
        nested_settings.get("current_semester")
    )
    if semester:
        score += 10
    else:
        issues.append(ReadinessIssue(
            id="no-semester",
            type=IssueType.CRITICAL,
            category="academic_context",
            message_ar="لم يتم تحديد الفصل الدراسي الحالي",
            message_en="Current semester not set",
            fix_link="/principal/settings?tab=overview",
            fix_action="تحديد الفصل الدراسي"
        ))
    
    status = "ready" if score == max_score else "critical" if score == 0 else "warning"
    
    return CategoryReadiness(
        name_ar="السياق الأكاديمي",
        name_en="Academic Context",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_school_days(school_id: str) -> CategoryReadiness:
    """Check working days configuration"""
    issues = []
    score = 0
    max_score = 15
    
    settings = await db.school_settings.find_one(
        {"school_id": school_id},
        {"_id": 0}
    )
    
    if not settings:
        settings = {}
    
    # Check nested settings object as well
    nested_settings = settings.get("settings", {})
    
    working_days = (
        settings.get("workingDays") or 
        settings.get("working_days") or 
        nested_settings.get("working_days") or
        []
    )
    weekend_days = (
        settings.get("weekendDays") or 
        settings.get("weekend_days") or
        nested_settings.get("weekend_days") or
        []
    )
    
    if len(working_days) >= 1:
        score += 10
        if len(working_days) >= 5:
            score += 5
    else:
        issues.append(ReadinessIssue(
            id="no-working-days",
            type=IssueType.CRITICAL,
            category="school_days",
            message_ar="لم يتم تحديد أيام الدراسة",
            message_en="Working days not configured",
            fix_link="/principal/settings?tab=work-days",
            fix_action="تحديد أيام الدراسة"
        ))
    
    if len(working_days) > 0 and len(working_days) < 5:
        issues.append(ReadinessIssue(
            id="few-working-days",
            type=IssueType.WARNING,
            category="school_days",
            message_ar=f"أيام الدراسة ({len(working_days)} أيام) أقل من المعتاد",
            message_en=f"Working days ({len(working_days)}) less than typical",
            fix_link="/principal/settings?tab=work-days",
            fix_action="مراجعة أيام الدراسة"
        ))
    
    status = "ready" if score == max_score else "critical" if score == 0 else "warning"
    
    return CategoryReadiness(
        name_ar="أيام الدراسة",
        name_en="School Days",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_day_structure(school_id: str) -> CategoryReadiness:
    """Check day structure (periods, duration, times)"""
    issues = []
    score = 0
    max_score = 25
    
    settings = await db.school_settings.find_one(
        {"school_id": school_id},
        {"_id": 0}
    )
    
    if not settings:
        settings = {}
    
    # Check nested settings object as well
    nested_settings = settings.get("settings", {})
    
    # Check periods per day
    periods_per_day = (
        settings.get("periodsPerDay") or 
        settings.get("periods_per_day") or
        nested_settings.get("periods_per_day")
    )
    if periods_per_day and periods_per_day >= 1:
        score += 8
    else:
        issues.append(ReadinessIssue(
            id="no-periods-per-day",
            type=IssueType.CRITICAL,
            category="day_structure",
            message_ar="لم يتم تحديد عدد الحصص اليومية",
            message_en="Periods per day not set",
            fix_link="/principal/settings?tab=time",
            fix_action="تحديد عدد الحصص"
        ))
    
    # Check period duration
    period_duration = (
        settings.get("periodDuration") or 
        settings.get("period_duration") or
        nested_settings.get("period_duration_minutes")
    )
    if period_duration and period_duration >= 30:
        score += 8
    else:
        issues.append(ReadinessIssue(
            id="no-period-duration",
            type=IssueType.CRITICAL,
            category="day_structure",
            message_ar="لم يتم تحديد مدة الحصة",
            message_en="Period duration not set",
            fix_link="/principal/settings?tab=time",
            fix_action="تحديد مدة الحصة"
        ))
    
    # Check day start time
    day_start = (
        settings.get("dayStart") or 
        settings.get("day_start") or
        settings.get("school_day_start") or
        nested_settings.get("school_day_start")
    )
    if day_start:
        score += 5
    else:
        issues.append(ReadinessIssue(
            id="no-day-start",
            type=IssueType.WARNING,
            category="day_structure",
            message_ar="لم يتم تحديد وقت بداية اليوم الدراسي",
            message_en="Day start time not set",
            fix_link="/principal/settings?tab=time",
            fix_action="تحديد وقت البداية"
        ))
    
    # Check time slots
    time_slots = settings.get("timeSlots") or settings.get("time_slots") or nested_settings.get("time_slots") or []
    if len(time_slots) >= periods_per_day if periods_per_day else 0:
        score += 4
    else:
        issues.append(ReadinessIssue(
            id="incomplete-time-slots",
            type=IssueType.INFO,
            category="day_structure",
            message_ar="سيتم توليد الفترات الزمنية تلقائياً",
            message_en="Time slots will be auto-generated",
            fix_link="/principal/settings?tab=time",
            fix_action="تحديد الفترات الزمنية"
        ))
    
    status = "ready" if score >= 20 else "critical" if score < 10 else "warning"
    
    return CategoryReadiness(
        name_ar="هيكل اليوم الدراسي",
        name_en="Day Structure",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_classes(school_id: str) -> CategoryReadiness:
    """Check classes/sections configuration"""
    issues = []
    score = 0
    max_score = 20
    
    # Get classes for this school
    classes = await db.classes.find(
        {"school_id": school_id, "is_active": {"$ne": False}},
        {"_id": 0}
    ).to_list(500)
    
    if len(classes) >= 1:
        score += 15
        if len(classes) >= 5:
            score += 5
    else:
        issues.append(ReadinessIssue(
            id="no-classes",
            type=IssueType.CRITICAL,
            category="classes",
            message_ar="لا يوجد فصول دراسية مسجلة",
            message_en="No classes registered",
            fix_link="/principal/settings?tab=classes",
            fix_action="إضافة الفصول"
        ))
    
    # Check for classes without grade
    classes_without_grade = [c for c in classes if not c.get("grade_id") and not c.get("grade")]
    if classes_without_grade:
        issues.append(ReadinessIssue(
            id="classes-without-grade",
            type=IssueType.WARNING,
            category="classes",
            message_ar=f"{len(classes_without_grade)} فصل بدون تحديد الصف الدراسي",
            message_en=f"{len(classes_without_grade)} classes without grade",
            fix_link="/principal/settings?tab=classes",
            fix_action="تحديد الصفوف",
            affected_items=[c.get("name") or c.get("name_ar") for c in classes_without_grade[:5]]
        ))
    
    status = "ready" if score == max_score else "critical" if score == 0 else "warning"
    
    return CategoryReadiness(
        name_ar="الفصول الدراسية",
        name_en="Classes",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_teachers(school_id: str) -> CategoryReadiness:
    """Check teachers configuration"""
    issues = []
    score = 0
    max_score = 15
    
    # Get teachers
    teachers = await db.teachers.find(
        {"school_id": school_id, "is_active": {"$ne": False}},
        {"_id": 0}
    ).to_list(500)
    
    if len(teachers) >= 1:
        score += 10
        if len(teachers) >= 10:
            score += 5
    else:
        issues.append(ReadinessIssue(
            id="no-teachers",
            type=IssueType.CRITICAL,
            category="teachers",
            message_ar="لا يوجد معلمين مسجلين",
            message_en="No teachers registered",
            fix_link="/principal/settings?tab=teachers",
            fix_action="إضافة المعلمين"
        ))
    
    # Check for teachers without workload
    teachers_without_workload = [
        t for t in teachers 
        if not t.get("weekly_periods") and not t.get("max_periods_per_week")
    ]
    if teachers_without_workload and len(teachers_without_workload) > len(teachers) * 0.5:
        issues.append(ReadinessIssue(
            id="teachers-without-workload",
            type=IssueType.INFO,
            category="teachers",
            message_ar=f"{len(teachers_without_workload)} معلم بدون تحديد النصاب",
            message_en=f"{len(teachers_without_workload)} teachers without workload",
            fix_link="/principal/settings?tab=teachers",
            fix_action="سيتم استخدام النصاب الافتراضي"
        ))
    
    status = "ready" if score >= 10 else "critical" if score == 0 else "warning"
    
    return CategoryReadiness(
        name_ar="المعلمون",
        name_en="Teachers",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_teacher_assignments(school_id: str) -> CategoryReadiness:
    """Check teacher-subject assignments AND teacher-class assignments"""
    issues = []
    score = 0
    max_score = 25
    
    # Get teacher-subject assignments
    subject_assignments = await db.teacher_assignments.find(
        {"school_id": school_id, "is_active": {"$ne": False}},
        {"_id": 0}
    ).to_list(1000)
    
    # Get teacher-class assignments (from new table)
    class_assignments = await db.teacher_class_assignments.find(
        {"school_id": school_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Get classes
    classes = await db.classes.find(
        {"school_id": school_id, "is_active": {"$ne": False}},
        {"_id": 0}
    ).to_list(500)
    
    # Check subject assignments
    if len(subject_assignments) >= 1:
        score += 15
    else:
        issues.append(ReadinessIssue(
            id="no-assignments",
            type=IssueType.CRITICAL,
            category="teacher_assignments",
            message_ar="لا يوجد إسنادات للمعلمين",
            message_en="No teacher assignments found",
            fix_link="/principal/settings?tab=assignments",
            fix_action="ربط المعلمين بالمواد والفصول"
        ))
    
    # Check if all classes have teacher-class assignments
    class_ids = set(c.get("id") for c in classes if c.get("id"))
    assigned_class_ids = set(a.get("class_id") for a in class_assignments if a.get("class_id"))
    unassigned_classes = class_ids - assigned_class_ids
    
    if len(unassigned_classes) == 0 and len(class_ids) > 0:
        score += 10
    elif len(unassigned_classes) > 0:
        # Get names of unassigned classes
        unassigned_class_names = [
            c.get("name") or c.get("name_ar") 
            for c in classes 
            if c.get("id") in unassigned_classes
        ][:5]
        issues.append(ReadinessIssue(
            id="classes-without-assignments",
            type=IssueType.WARNING,
            category="teacher_assignments",
            message_ar=f"{len(unassigned_classes)} فصل بدون إسنادات للمعلمين",
            message_en=f"{len(unassigned_classes)} classes without teacher assignments",
            fix_link="/school/teacher-class-assignments",
            fix_action="ربط المعلمين بالفصول",
            affected_items=unassigned_class_names
        ))
    
    status = "ready" if score >= 20 else "critical" if score == 0 else "warning"
    
    return CategoryReadiness(
        name_ar="إسنادات المعلمين",
        name_en="Teacher Assignments",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_constraints(school_id: str) -> CategoryReadiness:
    """Check constraints configuration"""
    issues = []
    score = 0
    max_score = 10
    
    # Get school constraints
    constraints = await db.school_constraints.find(
        {"school_id": school_id},
        {"_id": 0}
    ).to_list(100)
    
    # Hard constraints are system-level and always present
    score += 5
    
    # Check if custom constraints exist
    if len(constraints) > 0:
        score += 5
        active_constraints = [c for c in constraints if c.get("is_active", True)]
        issues.append(ReadinessIssue(
            id="constraints-info",
            type=IssueType.INFO,
            category="constraints",
            message_ar=f"{len(active_constraints)} قيد مخصص مفعّل",
            message_en=f"{len(active_constraints)} custom constraints active",
            fix_link="/principal/settings?tab=constraints",
            fix_action="مراجعة القيود"
        ))
    else:
        issues.append(ReadinessIssue(
            id="no-custom-constraints",
            type=IssueType.INFO,
            category="constraints",
            message_ar="سيتم استخدام القيود الافتراضية",
            message_en="Default constraints will be used",
            fix_link="/principal/settings?tab=constraints",
            fix_action="إضافة قيود مخصصة (اختياري)"
        ))
    
    status = "ready"
    
    return CategoryReadiness(
        name_ar="القيود",
        name_en="Constraints",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


async def check_official_curriculum(school_id: str) -> CategoryReadiness:
    """Check if official curriculum data is available"""
    issues = []
    score = 0
    max_score = 10
    
    # Check official curriculum stats
    stages_count = await db.official_curriculum_stages.count_documents({})
    subjects_count = await db.official_curriculum_subjects.count_documents({})
    grade_subjects_count = await db.official_curriculum_grade_subjects.count_documents({})
    
    if stages_count > 0 and subjects_count > 0:
        score += 5
    else:
        issues.append(ReadinessIssue(
            id="no-official-curriculum",
            type=IssueType.WARNING,
            category="official_curriculum",
            message_ar="بيانات المنهج الرسمي غير متوفرة",
            message_en="Official curriculum data not available",
            fix_link="/principal/settings?tab=official-curriculum",
            fix_action="تحميل بيانات المنهج"
        ))
    
    if grade_subjects_count > 0:
        score += 5
    
    status = "ready" if score >= 5 else "warning"
    
    return CategoryReadiness(
        name_ar="المنهج الرسمي",
        name_en="Official Curriculum",
        score=score,
        max_score=max_score,
        status=status,
        issues=issues
    )


# ============================================
# Main API Endpoint
# ============================================

@router.get("/check")
async def check_timetable_readiness(
    x_school_context: str = Header(default=None, alias="X-School-Context"),
    authorization: str = Header(default=None)
):
    """
    فحص جاهزية النظام لإنشاء الجدول
    Check system readiness for timetable generation
    
    Returns comprehensive readiness report with:
    - Overall status (NOT_READY, PARTIALLY_READY, FULLY_READY)
    - Score per category
    - List of issues with fix links
    """
    # Get school_id from user token or header
    school_id = x_school_context
    
    if not school_id and authorization:
        try:
            import jwt
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            # Get school_id from token claims
            school_id = payload.get("school_id")
            if not school_id:
                # Try to get from database
                user_id = payload.get("sub")
                if user_id:
                    user = await db.users.find_one({"id": user_id}, {"_id": 0, "school_id": 1})
                    if user:
                        school_id = user.get("school_id")
        except Exception as e:
            print(f"Error decoding token: {e}")
    
    # Fallback if still no school_id
    if not school_id:
        school_id = "SCH-001"
    
    # Run all checks
    categories = {}
    
    # Academic context
    categories["academic_context"] = await check_academic_context(school_id)
    
    # School days
    categories["school_days"] = await check_school_days(school_id)
    
    # Day structure
    categories["day_structure"] = await check_day_structure(school_id)
    
    # Classes
    categories["classes"] = await check_classes(school_id)
    
    # Teachers
    categories["teachers"] = await check_teachers(school_id)
    
    # Teacher assignments
    categories["teacher_assignments"] = await check_teacher_assignments(school_id)
    
    # Constraints
    categories["constraints"] = await check_constraints(school_id)
    
    # Official curriculum
    categories["official_curriculum"] = await check_official_curriculum(school_id)
    
    # Calculate overall score
    total_score = sum(cat.score for cat in categories.values())
    max_score = sum(cat.max_score for cat in categories.values())
    percentage = round((total_score / max_score) * 100, 1) if max_score > 0 else 0
    
    # Collect all issues
    all_issues = []
    for cat in categories.values():
        all_issues.extend(cat.issues)
    
    critical_issues = [i for i in all_issues if i.type == IssueType.CRITICAL]
    warnings = [i for i in all_issues if i.type == IssueType.WARNING]
    info_items = [i for i in all_issues if i.type == IssueType.INFO]
    
    # Determine overall status
    if len(critical_issues) > 0:
        status = ReadinessStatus.NOT_READY
        can_generate = False
    elif len(warnings) > 0:
        status = ReadinessStatus.PARTIALLY_READY
        can_generate = True
    else:
        status = ReadinessStatus.FULLY_READY
        can_generate = True
    
    # Convert categories to dict format
    categories_dict = {
        key: {
            "name_ar": cat.name_ar,
            "name_en": cat.name_en,
            "score": cat.score,
            "max_score": cat.max_score,
            "status": cat.status,
            "issues": [i.dict() for i in cat.issues]
        }
        for key, cat in categories.items()
    }
    
    return {
        "status": status.value,
        "overall_score": total_score,
        "max_score": max_score,
        "percentage": percentage,
        "categories": categories_dict,
        "critical_issues": [i.dict() for i in critical_issues],
        "warnings": [i.dict() for i in warnings],
        "info_items": [i.dict() for i in info_items],
        "can_generate": can_generate,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_issues": len(all_issues),
            "critical_count": len(critical_issues),
            "warning_count": len(warnings),
            "info_count": len(info_items)
        }
    }


@router.get("/summary")
async def get_readiness_summary(
    x_school_context: str = Header(default=None, alias="X-School-Context")
):
    """
    ملخص سريع لحالة الجاهزية
    Quick summary of readiness status
    """
    full_report = await check_timetable_readiness(x_school_context)
    
    status_messages = {
        "NOT_READY": {
            "ar": "النظام غير جاهز لإنشاء الجدول",
            "en": "System not ready for timetable generation",
            "color": "red",
            "icon": "x-circle"
        },
        "PARTIALLY_READY": {
            "ar": "النظام جاهز جزئياً - يمكن المتابعة مع تحذيرات",
            "en": "Partially ready - can proceed with warnings",
            "color": "yellow",
            "icon": "alert-triangle"
        },
        "FULLY_READY": {
            "ar": "النظام جاهز بالكامل لإنشاء الجدول",
            "en": "System fully ready for timetable generation",
            "color": "green",
            "icon": "check-circle"
        }
    }
    
    status_info = status_messages.get(full_report["status"], status_messages["NOT_READY"])
    
    return {
        "status": full_report["status"],
        "status_message_ar": status_info["ar"],
        "status_message_en": status_info["en"],
        "status_color": status_info["color"],
        "status_icon": status_info["icon"],
        "percentage": full_report["percentage"],
        "can_generate": full_report["can_generate"],
        "critical_count": full_report["summary"]["critical_count"],
        "warning_count": full_report["summary"]["warning_count"]
    }
