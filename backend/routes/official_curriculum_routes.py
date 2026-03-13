"""
Official Curriculum Routes - المنهج الرسمي
بيانات المنهج الرسمي من وزارة التعليم السعودية
هذه البيانات للقراءة فقط ولا يمكن تعديلها
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/official-curriculum", tags=["Official Curriculum"])

# Database dependency - will be injected
db = None

def set_database(database):
    """Set the database connection"""
    global db
    db = database


# ============================================
# Pydantic Models for Response
# ============================================

class OfficialStageResponse(BaseModel):
    id: str
    code: str
    name_ar: str
    name_en: str
    order: int
    grades_count: int
    is_official: bool = True
    is_locked: bool = True

class OfficialTrackResponse(BaseModel):
    id: str
    code: str
    name_ar: str
    name_en: str
    applicable_stages: List[str]
    order: int
    is_official: bool = True
    is_locked: bool = True

class OfficialGradeResponse(BaseModel):
    id: str
    stage_id: str
    track_id: str
    name_ar: str
    name_en: str
    order: int
    year_number: int
    is_official: bool = True
    is_locked: bool = True
    # Computed fields
    stage_name_ar: Optional[str] = None
    track_name_ar: Optional[str] = None

class OfficialSubjectResponse(BaseModel):
    id: str
    code: str
    name_ar: str
    name_en: str
    category: str
    is_core: bool
    is_official: bool = True
    is_locked: bool = True

class OfficialGradeSubjectResponse(BaseModel):
    id: str
    grade_id: str
    subject_id: str
    annual_periods: int
    period_type: str
    order: int
    is_official: bool = True
    is_locked: bool = True
    # Computed fields
    grade_name_ar: Optional[str] = None
    subject_name_ar: Optional[str] = None
    weekly_periods: Optional[int] = None  # annual_periods / 35 weeks

class OfficialTeacherRankLoadResponse(BaseModel):
    id: str
    rank_code: str
    rank_name_ar: str
    rank_name_en: str
    weekly_periods: int
    is_special_education: bool
    is_official: bool = True
    is_locked: bool = True


# ============================================
# API Endpoints
# ============================================

@router.get("/stages", response_model=List[OfficialStageResponse])
async def get_official_stages():
    """
    جلب المراحل الدراسية الرسمية
    Get official educational stages (Elementary, Middle, Secondary)
    """
    stages = await db.official_curriculum_stages.find(
        {},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    return stages


@router.get("/tracks", response_model=List[OfficialTrackResponse])
async def get_official_tracks(
    stage_id: Optional[str] = Query(None, description="Filter by stage ID")
):
    """
    جلب المسارات التعليمية الرسمية
    Get official educational tracks
    """
    query = {}
    if stage_id:
        query["applicable_stages"] = stage_id
    
    tracks = await db.official_curriculum_tracks.find(
        query,
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    return tracks


@router.get("/grades", response_model=List[OfficialGradeResponse])
async def get_official_grades(
    stage_id: Optional[str] = Query(None, description="Filter by stage ID"),
    track_id: Optional[str] = Query(None, description="Filter by track ID")
):
    """
    جلب الصفوف الدراسية الرسمية
    Get official grades with stage and track names
    """
    query = {}
    if stage_id:
        query["stage_id"] = stage_id
    if track_id:
        query["track_id"] = track_id
    
    grades = await db.official_curriculum_grades.find(
        query,
        {"_id": 0}
    ).sort("order", 1).to_list(200)
    
    # Enrich with stage and track names
    stages = {s["id"]: s for s in await db.official_curriculum_stages.find({}, {"_id": 0}).to_list(100)}
    tracks = {t["id"]: t for t in await db.official_curriculum_tracks.find({}, {"_id": 0}).to_list(100)}
    
    for grade in grades:
        stage = stages.get(grade.get("stage_id"))
        track = tracks.get(grade.get("track_id"))
        grade["stage_name_ar"] = stage.get("name_ar") if stage else None
        grade["track_name_ar"] = track.get("name_ar") if track else None
    
    return grades


@router.get("/subjects", response_model=List[OfficialSubjectResponse])
async def get_official_subjects(
    category: Optional[str] = Query(None, description="Filter by category"),
    is_core: Optional[bool] = Query(None, description="Filter core subjects only")
):
    """
    جلب المواد الدراسية الرسمية
    Get official subjects
    """
    query = {}
    if category:
        query["category"] = category
    if is_core is not None:
        query["is_core"] = is_core
    
    subjects = await db.official_curriculum_subjects.find(
        query,
        {"_id": 0}
    ).to_list(200)
    return subjects


@router.get("/subjects/categories")
async def get_subject_categories():
    """
    جلب تصنيفات المواد الدراسية
    Get subject categories
    """
    categories = await db.official_curriculum_subjects.distinct("category")
    
    category_names = {
        "islamic": "المواد الإسلامية",
        "language": "اللغات",
        "science": "العلوم والرياضيات",
        "social": "الدراسات الاجتماعية",
        "technology": "التقنية والحاسب",
        "activity": "الأنشطة",
        "skills": "المهارات",
        "business": "إدارة الأعمال"
    }
    
    return [
        {"code": cat, "name_ar": category_names.get(cat, cat)}
        for cat in categories
    ]


@router.get("/grade-subjects")
async def get_official_grade_subjects(
    grade_id: Optional[str] = Query(None, description="Filter by grade ID"),
    subject_id: Optional[str] = Query(None, description="Filter by subject ID"),
    period_type: Optional[str] = Query(None, description="Filter by period type (class_period/non_class_period)")
):
    """
    جلب توزيع المواد على الصفوف مع الحصص السنوية
    Get grade-subject mappings with annual periods
    """
    query = {}
    if grade_id:
        query["grade_id"] = grade_id
    if subject_id:
        query["subject_id"] = subject_id
    if period_type:
        query["period_type"] = period_type
    
    grade_subjects = await db.official_curriculum_grade_subjects.find(
        query,
        {"_id": 0}
    ).sort("order", 1).to_list(1000)
    
    # Enrich with grade and subject names
    grades = {g["id"]: g for g in await db.official_curriculum_grades.find({}, {"_id": 0}).to_list(200)}
    subjects = {s["id"]: s for s in await db.official_curriculum_subjects.find({}, {"_id": 0}).to_list(200)}
    
    for gs in grade_subjects:
        grade = grades.get(gs.get("grade_id"))
        subject = subjects.get(gs.get("subject_id"))
        gs["grade_name_ar"] = grade.get("name_ar") if grade else None
        gs["subject_name_ar"] = subject.get("name_ar") if subject else None
        # Calculate weekly periods (annual / 35 weeks, rounded)
        gs["weekly_periods"] = round(gs.get("annual_periods", 0) / 35, 1)
    
    return grade_subjects


@router.get("/teacher-rank-loads", response_model=List[OfficialTeacherRankLoadResponse])
async def get_official_teacher_rank_loads(
    is_special_education: Optional[bool] = Query(None, description="Filter by special education")
):
    """
    جلب النصاب الرسمي للمعلمين حسب الرتبة
    Get official teacher rank workloads
    """
    query = {}
    if is_special_education is not None:
        query["is_special_education"] = is_special_education
    
    rank_loads = await db.official_teacher_rank_loads.find(
        query,
        {"_id": 0}
    ).to_list(20)
    return rank_loads


@router.get("/curriculum-for-grade/{grade_id}")
async def get_curriculum_for_grade(grade_id: str):
    """
    جلب المنهج الكامل لصف معين
    Get complete curriculum for a specific grade
    """
    # Get grade info
    grade = await db.official_curriculum_grades.find_one(
        {"id": grade_id},
        {"_id": 0}
    )
    if not grade:
        raise HTTPException(status_code=404, detail="الصف غير موجود")
    
    # Get stage and track
    stage = await db.official_curriculum_stages.find_one(
        {"id": grade.get("stage_id")},
        {"_id": 0}
    )
    track = await db.official_curriculum_tracks.find_one(
        {"id": grade.get("track_id")},
        {"_id": 0}
    )
    
    # Get subjects for this grade
    grade_subjects = await db.official_curriculum_grade_subjects.find(
        {"grade_id": grade_id, "period_type": "class_period"},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    
    # Enrich subject data
    all_subjects = {s["id"]: s for s in await db.official_curriculum_subjects.find({}, {"_id": 0}).to_list(200)}
    
    subjects_with_details = []
    total_annual_periods = 0
    total_weekly_periods = 0
    
    for gs in grade_subjects:
        subject = all_subjects.get(gs.get("subject_id"), {})
        weekly = round(gs.get("annual_periods", 0) / 35, 1)
        subjects_with_details.append({
            "subject_id": gs.get("subject_id"),
            "subject_code": subject.get("code"),
            "subject_name_ar": subject.get("name_ar"),
            "subject_name_en": subject.get("name_en"),
            "category": subject.get("category"),
            "is_core": subject.get("is_core"),
            "annual_periods": gs.get("annual_periods"),
            "weekly_periods": weekly
        })
        total_annual_periods += gs.get("annual_periods", 0)
        total_weekly_periods += weekly
    
    return {
        "grade": {
            "id": grade.get("id"),
            "name_ar": grade.get("name_ar"),
            "name_en": grade.get("name_en"),
            "year_number": grade.get("year_number")
        },
        "stage": {
            "id": stage.get("id") if stage else None,
            "name_ar": stage.get("name_ar") if stage else None
        },
        "track": {
            "id": track.get("id") if track else None,
            "name_ar": track.get("name_ar") if track else None
        },
        "subjects": subjects_with_details,
        "summary": {
            "subjects_count": len(subjects_with_details),
            "total_annual_periods": total_annual_periods,
            "total_weekly_periods": round(total_weekly_periods, 1)
        },
        "is_official": True,
        "is_locked": True
    }


@router.get("/stats")
async def get_official_curriculum_stats():
    """
    إحصائيات المنهج الرسمي
    Get statistics about the official curriculum
    """
    stages_count = await db.official_curriculum_stages.count_documents({})
    tracks_count = await db.official_curriculum_tracks.count_documents({})
    grades_count = await db.official_curriculum_grades.count_documents({})
    subjects_count = await db.official_curriculum_subjects.count_documents({})
    grade_subjects_count = await db.official_curriculum_grade_subjects.count_documents({})
    rank_loads_count = await db.official_teacher_rank_loads.count_documents({})
    
    # Get categories count
    categories = await db.official_curriculum_subjects.distinct("category")
    
    return {
        "stages": stages_count,
        "tracks": tracks_count,
        "grades": grades_count,
        "subjects": subjects_count,
        "grade_subject_mappings": grade_subjects_count,
        "teacher_rank_loads": rank_loads_count,
        "subject_categories": len(categories),
        "source": "وزارة التعليم السعودية",
        "is_official": True,
        "is_locked": True,
        "last_updated": "2024-09-01"
    }


@router.get("/search")
async def search_official_curriculum(
    q: str = Query(..., min_length=2, description="Search query"),
    type: Optional[str] = Query(None, description="Type to search: stage, track, grade, subject")
):
    """
    بحث في المنهج الرسمي
    Search the official curriculum
    """
    results = {
        "stages": [],
        "tracks": [],
        "grades": [],
        "subjects": []
    }
    
    search_regex = {"$regex": q, "$options": "i"}
    
    if not type or type == "stage":
        stages = await db.official_curriculum_stages.find(
            {"$or": [{"name_ar": search_regex}, {"name_en": search_regex}]},
            {"_id": 0}
        ).to_list(10)
        results["stages"] = stages
    
    if not type or type == "track":
        tracks = await db.official_curriculum_tracks.find(
            {"$or": [{"name_ar": search_regex}, {"name_en": search_regex}]},
            {"_id": 0}
        ).to_list(10)
        results["tracks"] = tracks
    
    if not type or type == "grade":
        grades = await db.official_curriculum_grades.find(
            {"$or": [{"name_ar": search_regex}, {"name_en": search_regex}]},
            {"_id": 0}
        ).to_list(20)
        results["grades"] = grades
    
    if not type or type == "subject":
        subjects = await db.official_curriculum_subjects.find(
            {"$or": [{"name_ar": search_regex}, {"name_en": search_regex}, {"code": search_regex}]},
            {"_id": 0}
        ).to_list(30)
        results["subjects"] = subjects
    
    return results
