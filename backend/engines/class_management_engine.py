"""
Class Management Engine - محرك إدارة الفصول
Handles class/section creation and management
"""
import logging
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional, Dict, Any, List
import secrets
from pydantic import BaseModel, Field
from enum import Enum

logger = logging.getLogger(__name__)

class ClassType(str, Enum):
    regular = "regular"
    advanced = "advanced"
    special_needs = "special_needs"

class CreateClassRequest(BaseModel):
    name_ar: str = Field(..., min_length=1)
    name_en: Optional[str] = None
    grade_id: str
    class_type: ClassType = ClassType.regular
    capacity: int = Field(default=30, ge=1, le=50)
    homeroom_teacher_id: Optional[str] = None
    room_number: Optional[str] = None
    floor: Optional[int] = None
    building: Optional[str] = None
    student_ids: Optional[List[str]] = None
    notes: Optional[str] = None

class ClassManagementEngine:
    """Engine for managing class/section operations"""
    
    def __init__(self, db):
        self.db = db
        self.classes_collection = db.classes
        self.sections_collection = db.sections
        self.grades_collection = db.grades
        self.teachers_collection = db.teachers
        self.students_collection = db.students
    
    def _generate_class_id(self, tenant_id: str, grade_id: str) -> str:
        """Generate unique class ID"""
        year = datetime.now().strftime("%y")
        prefix = f"CLS-{grade_id[:3].upper()}-{year}-"
        count = self.classes_collection.count_documents({
            "class_id": {"$regex": f"^{prefix}"},
            "tenant_id": tenant_id
        })
        return f"{prefix}{str(count + 1).zfill(3)}"
    
    async def create_class(
        self,
        request: CreateClassRequest,
        tenant_id: str,
        created_by: str
    ) -> Dict[str, Any]:
        """Create a new class/section"""
        try:
            class_id = self._generate_class_id(tenant_id, request.grade_id)
            now = datetime.now(timezone.utc)
            
            class_doc = {
                "class_id": class_id,
                "tenant_id": tenant_id,
                "name_ar": request.name_ar,
                "name_en": request.name_en,
                "grade_id": request.grade_id,
                "class_type": request.class_type.value,
                "capacity": request.capacity,
                "homeroom_teacher_id": request.homeroom_teacher_id,
                "room_number": request.room_number,
                "floor": request.floor,
                "building": request.building,
                "student_ids": request.student_ids or [],
                "student_count": len(request.student_ids) if request.student_ids else 0,
                "notes": request.notes,
                "status": "active",
                "is_deleted": False,
                "created_at": now,
                "created_by": created_by,
                "updated_at": now,
            }
            
            self.classes_collection.insert_one(class_doc)
            
            # Also add to sections collection for compatibility
            section_doc = {
                "id": class_id,
                "name_ar": request.name_ar,
                "name_en": request.name_en,
                "grade_id": request.grade_id,
                "tenant_id": tenant_id,
                "capacity": request.capacity,
                "is_active": True,
            }
            self.sections_collection.update_one(
                {"id": class_id, "tenant_id": tenant_id},
                {"$set": section_doc},
                upsert=True
            )
            
            return {
                "success": True,
                "class_id": class_id,
                "message": "تم إنشاء الفصل بنجاح",
                "message_en": "Class created successfully"
            }
        except Exception as e:
            logger.error(f"Error creating class: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_class(self, class_id: str, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get class by ID"""
        return self.classes_collection.find_one({
            "class_id": class_id,
            "tenant_id": tenant_id,
            "is_deleted": {"$ne": True}
        }, {"_id": 0})
    
    async def list_classes(
        self,
        tenant_id: str,
        grade_id: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Dict[str, Any]:
        """List classes with filters"""
        query = {"tenant_id": tenant_id, "is_deleted": {"$ne": True}}
        if grade_id:
            query["grade_id"] = grade_id
        if search:
            query["$or"] = [
                {"name_ar": {"$regex": search, "$options": "i"}},
                {"name_en": {"$regex": search, "$options": "i"}},
                {"class_id": {"$regex": search, "$options": "i"}},
            ]
        
        total = self.classes_collection.count_documents(query)
        classes = list(
            self.classes_collection.find(query, {"_id": 0})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return {"classes": classes, "total": total}
    
    async def get_grades(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Get available grades"""
        grades = list(self.grades_collection.find(
            {"tenant_id": tenant_id, "is_active": {"$ne": False}},
            {"_id": 0}
        ))
        if not grades:
            grades = [
                {"id": "grade_1", "name_ar": "الصف الأول", "name_en": "Grade 1"},
                {"id": "grade_2", "name_ar": "الصف الثاني", "name_en": "Grade 2"},
                {"id": "grade_3", "name_ar": "الصف الثالث", "name_en": "Grade 3"},
                {"id": "grade_4", "name_ar": "الصف الرابع", "name_en": "Grade 4"},
                {"id": "grade_5", "name_ar": "الصف الخامس", "name_en": "Grade 5"},
                {"id": "grade_6", "name_ar": "الصف السادس", "name_en": "Grade 6"},
            ]
        return grades
    
    async def get_teachers(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Get available teachers for homeroom assignment"""
        teachers = list(self.teachers_collection.find(
            {"tenant_id": tenant_id, "is_deleted": {"$ne": True}, "status": "active"},
            {"_id": 0, "teacher_id": 1, "full_name_ar": 1, "full_name_en": 1}
        ))
        return teachers
    
    async def get_students(self, tenant_id: str, grade_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get available students for class assignment"""
        query = {"tenant_id": tenant_id, "is_deleted": {"$ne": True}}
        if grade_id:
            query["grade_id"] = grade_id
        
        students = list(self.students_collection.find(
            query,
            {"_id": 0, "student_id": 1, "full_name_ar": 1, "full_name_en": 1, "grade_id": 1}
        ))
        return students
    
    async def get_class_types(self) -> List[Dict[str, str]]:
        """Get class types"""
        return [
            {"code": "regular", "name_ar": "عادي", "name_en": "Regular"},
            {"code": "advanced", "name_ar": "متقدم", "name_en": "Advanced"},
            {"code": "special_needs", "name_ar": "احتياجات خاصة", "name_en": "Special Needs"},
        ]
