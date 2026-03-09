"""
NASSAQ Assessment Engine
محرك التقييم والاختبارات لمنصة نَسَّق

Handles:
- Assessment creation and management
- Grading and scoring
- Grade calculations and weighting
- Performance tracking
- Report card generation
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class AssessmentType(str, Enum):
    QUIZ = "quiz"
    EXAM = "exam"
    MIDTERM = "midterm"
    FINAL = "final"
    ASSIGNMENT = "assignment"
    HOMEWORK = "homework"
    PROJECT = "project"
    PARTICIPATION = "participation"
    PRACTICAL = "practical"


class GradeScale(str, Enum):
    PERCENTAGE = "percentage"       # 0-100
    LETTER = "letter"               # A, B, C, D, F
    POINTS = "points"               # Custom points
    PASS_FAIL = "pass_fail"         # Pass/Fail


class AssessmentEngine:
    """
    Core Assessment Engine for NASSAQ
    Manages assessments, grading, and academic performance
    """
    
    def __init__(self, db):
        self.db = db
        self.assessments_collection = db.assessments
        self.grades_collection = db.student_grades
        self.grade_weights_collection = db.grade_weights
        self.report_cards_collection = db.report_cards
        self.audit_collection = db.audit_logs
    
    # ============== ASSESSMENT MANAGEMENT ==============
    
    async def create_assessment(
        self,
        tenant_id: str,
        subject_id: str,
        section_ids: List[str],
        title: str,
        assessment_type: str,
        max_score: float,
        created_by: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a new assessment"""
        assessment_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        assessment_doc = {
            "id": assessment_id,
            "tenant_id": tenant_id,
            "subject_id": subject_id,
            "section_ids": section_ids,
            "title": title,
            "title_en": kwargs.get("title_en"),
            "description": kwargs.get("description"),
            "assessment_type": assessment_type,
            "max_score": max_score,
            "passing_score": kwargs.get("passing_score", max_score * 0.5),
            "weight": kwargs.get("weight", 1.0),
            "due_date": kwargs.get("due_date"),
            "assessment_date": kwargs.get("assessment_date"),
            "duration_minutes": kwargs.get("duration_minutes"),
            "is_published": False,
            "is_graded": False,
            "academic_year": kwargs.get("academic_year"),
            "semester": kwargs.get("semester"),
            "created_at": now,
            "created_by": created_by,
            "metadata": {
                "total_submissions": 0,
                "graded_submissions": 0,
                "average_score": 0,
                "highest_score": 0,
                "lowest_score": 0
            }
        }
        
        await self.assessments_collection.insert_one(assessment_doc)
        
        return assessment_doc
    
    async def get_assessments(
        self,
        tenant_id: str,
        subject_id: Optional[str] = None,
        section_id: Optional[str] = None,
        assessment_type: Optional[str] = None,
        academic_year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get assessments"""
        query = {"tenant_id": tenant_id}
        
        if subject_id:
            query["subject_id"] = subject_id
        if section_id:
            query["section_ids"] = section_id
        if assessment_type:
            query["assessment_type"] = assessment_type
        if academic_year:
            query["academic_year"] = academic_year
        
        assessments = await self.assessments_collection.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
        
        return assessments
    
    async def get_assessment_by_id(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get assessment by ID"""
        return await self.assessments_collection.find_one(
            {"id": assessment_id},
            {"_id": 0}
        )
    
    async def update_assessment(
        self,
        assessment_id: str,
        updates: Dict[str, Any],
        updated_by: str
    ) -> Dict[str, Any]:
        """Update an assessment"""
        now = datetime.now(timezone.utc).isoformat()
        
        protected = ["id", "tenant_id", "created_at", "created_by"]
        for field in protected:
            updates.pop(field, None)
        
        updates["updated_at"] = now
        updates["updated_by"] = updated_by
        
        await self.assessments_collection.update_one(
            {"id": assessment_id},
            {"$set": updates}
        )
        
        return await self.get_assessment_by_id(assessment_id)
    
    async def publish_assessment(
        self,
        assessment_id: str,
        published_by: str
    ) -> Dict[str, Any]:
        """Publish an assessment"""
        now = datetime.now(timezone.utc).isoformat()
        
        await self.assessments_collection.update_one(
            {"id": assessment_id},
            {
                "$set": {
                    "is_published": True,
                    "published_at": now,
                    "published_by": published_by
                }
            }
        )
        
        return await self.get_assessment_by_id(assessment_id)
    
    async def delete_assessment(
        self,
        assessment_id: str,
        deleted_by: str
    ) -> bool:
        """Delete an assessment and its grades"""
        assessment = await self.get_assessment_by_id(assessment_id)
        if not assessment:
            return False
        
        # Delete all grades for this assessment
        await self.grades_collection.delete_many({"assessment_id": assessment_id})
        
        # Delete assessment
        await self.assessments_collection.delete_one({"id": assessment_id})
        
        return True
    
    # ============== GRADING ==============
    
    async def record_grade(
        self,
        assessment_id: str,
        student_id: str,
        score: float,
        graded_by: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Record a grade for a student"""
        assessment = await self.get_assessment_by_id(assessment_id)
        if not assessment:
            raise ValueError("التقييم غير موجود")
        
        now = datetime.now(timezone.utc).isoformat()
        
        # Check if grade already exists
        existing = await self.grades_collection.find_one({
            "assessment_id": assessment_id,
            "student_id": student_id
        })
        
        # Calculate percentage
        max_score = assessment.get("max_score", 100)
        percentage = round((score / max_score * 100) if max_score > 0 else 0, 2)
        passing_score = assessment.get("passing_score", max_score * 0.5)
        is_passing = score >= passing_score
        
        if existing:
            # Update existing grade
            updates = {
                "score": score,
                "percentage": percentage,
                "is_passing": is_passing,
                "updated_at": now,
                "graded_by": graded_by,
                "feedback": kwargs.get("feedback"),
                "notes": kwargs.get("notes")
            }
            
            await self.grades_collection.update_one(
                {"id": existing["id"]},
                {"$set": updates}
            )
            
            existing.update(updates)
            existing.pop("_id", None)
            
            # Update assessment metadata
            await self._update_assessment_metadata(assessment_id)
            
            return existing
        
        # Create new grade
        grade_id = str(uuid.uuid4())
        
        grade_doc = {
            "id": grade_id,
            "assessment_id": assessment_id,
            "tenant_id": assessment.get("tenant_id"),
            "subject_id": assessment.get("subject_id"),
            "student_id": student_id,
            "score": score,
            "max_score": max_score,
            "percentage": percentage,
            "is_passing": is_passing,
            "feedback": kwargs.get("feedback"),
            "notes": kwargs.get("notes"),
            "graded_at": now,
            "graded_by": graded_by,
            "submitted_at": kwargs.get("submitted_at"),
            "academic_year": assessment.get("academic_year"),
            "semester": assessment.get("semester")
        }
        
        await self.grades_collection.insert_one(grade_doc)
        
        # Update assessment metadata
        await self._update_assessment_metadata(assessment_id)
        
        return grade_doc
    
    async def record_bulk_grades(
        self,
        assessment_id: str,
        grades: List[Dict[str, Any]],
        graded_by: str
    ) -> Dict[str, Any]:
        """Record grades for multiple students"""
        results = {
            "processed": 0,
            "created": 0,
            "updated": 0,
            "errors": []
        }
        
        for grade_data in grades:
            try:
                student_id = grade_data.get("student_id")
                score = grade_data.get("score")
                
                if not student_id:
                    results["errors"].append({"error": "معرف الطالب مفقود"})
                    continue
                
                if score is None:
                    results["errors"].append({
                        "student_id": student_id,
                        "error": "الدرجة مفقودة"
                    })
                    continue
                
                await self.record_grade(
                    assessment_id=assessment_id,
                    student_id=student_id,
                    score=float(score),
                    graded_by=graded_by,
                    feedback=grade_data.get("feedback"),
                    notes=grade_data.get("notes")
                )
                
                results["processed"] += 1
                
            except Exception as e:
                results["errors"].append({
                    "student_id": grade_data.get("student_id"),
                    "error": str(e)
                })
        
        return results
    
    async def get_student_grades(
        self,
        tenant_id: str,
        student_id: str,
        subject_id: Optional[str] = None,
        academic_year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get grades for a student"""
        query = {
            "tenant_id": tenant_id,
            "student_id": student_id
        }
        
        if subject_id:
            query["subject_id"] = subject_id
        if academic_year:
            query["academic_year"] = academic_year
        
        grades = await self.grades_collection.find(
            query,
            {"_id": 0}
        ).sort("graded_at", -1).to_list(1000)
        
        return grades
    
    async def get_assessment_grades(
        self,
        assessment_id: str
    ) -> List[Dict[str, Any]]:
        """Get all grades for an assessment"""
        grades = await self.grades_collection.find(
            {"assessment_id": assessment_id},
            {"_id": 0}
        ).sort("score", -1).to_list(1000)
        
        return grades
    
    # ============== GRADE WEIGHTS ==============
    
    async def set_grade_weights(
        self,
        tenant_id: str,
        subject_id: str,
        weights: Dict[str, float],
        set_by: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Set grade weights for a subject"""
        now = datetime.now(timezone.utc).isoformat()
        
        # Validate weights sum to 100
        total = sum(weights.values())
        if abs(total - 100) > 0.01:
            raise ValueError(f"مجموع الأوزان يجب أن يساوي 100 (الحالي: {total})")
        
        # Check if weights exist
        existing = await self.grade_weights_collection.find_one({
            "tenant_id": tenant_id,
            "subject_id": subject_id,
            "academic_year": kwargs.get("academic_year"),
            "semester": kwargs.get("semester")
        })
        
        if existing:
            await self.grade_weights_collection.update_one(
                {"id": existing["id"]},
                {
                    "$set": {
                        "weights": weights,
                        "updated_at": now,
                        "updated_by": set_by
                    }
                }
            )
            existing["weights"] = weights
            existing.pop("_id", None)
            return existing
        
        weight_id = str(uuid.uuid4())
        
        weight_doc = {
            "id": weight_id,
            "tenant_id": tenant_id,
            "subject_id": subject_id,
            "weights": weights,
            "academic_year": kwargs.get("academic_year"),
            "semester": kwargs.get("semester"),
            "created_at": now,
            "created_by": set_by
        }
        
        await self.grade_weights_collection.insert_one(weight_doc)
        
        return weight_doc
    
    async def get_grade_weights(
        self,
        tenant_id: str,
        subject_id: str,
        **kwargs
    ) -> Dict[str, float]:
        """Get grade weights for a subject"""
        query = {
            "tenant_id": tenant_id,
            "subject_id": subject_id
        }
        
        if kwargs.get("academic_year"):
            query["academic_year"] = kwargs["academic_year"]
        if kwargs.get("semester"):
            query["semester"] = kwargs["semester"]
        
        weights = await self.grade_weights_collection.find_one(
            query,
            {"_id": 0}
        )
        
        if weights:
            return weights.get("weights", {})
        
        # Return default weights
        return {
            "quiz": 10,
            "assignment": 10,
            "midterm": 30,
            "final": 40,
            "participation": 10
        }
    
    # ============== GRADE CALCULATIONS ==============
    
    async def calculate_student_average(
        self,
        tenant_id: str,
        student_id: str,
        subject_id: str,
        academic_year: Optional[str] = None,
        semester: Optional[int] = None
    ) -> Dict[str, Any]:
        """Calculate weighted average for a student in a subject"""
        # Get weights
        weights = await self.get_grade_weights(
            tenant_id,
            subject_id,
            academic_year=academic_year,
            semester=semester
        )
        
        # Get grades
        query = {
            "tenant_id": tenant_id,
            "student_id": student_id,
            "subject_id": subject_id
        }
        
        if academic_year:
            query["academic_year"] = academic_year
        if semester:
            query["semester"] = semester
        
        grades = await self.grades_collection.find(
            query,
            {"_id": 0}
        ).to_list(1000)
        
        # Get assessment types for each grade
        weighted_sum = 0
        weight_total = 0
        grade_breakdown = {}
        
        for grade in grades:
            assessment = await self.get_assessment_by_id(grade.get("assessment_id"))
            if not assessment:
                continue
            
            assessment_type = assessment.get("assessment_type", "other")
            weight = weights.get(assessment_type, 0)
            
            if weight > 0:
                percentage = grade.get("percentage", 0)
                
                if assessment_type not in grade_breakdown:
                    grade_breakdown[assessment_type] = {
                        "grades": [],
                        "weight": weight,
                        "average": 0
                    }
                
                grade_breakdown[assessment_type]["grades"].append(percentage)
        
        # Calculate averages by type
        for atype, data in grade_breakdown.items():
            if data["grades"]:
                avg = sum(data["grades"]) / len(data["grades"])
                data["average"] = round(avg, 2)
                weighted_sum += avg * (data["weight"] / 100)
                weight_total += data["weight"]
        
        # Final weighted average
        final_average = round(weighted_sum * (100 / weight_total) if weight_total > 0 else 0, 2)
        
        return {
            "student_id": student_id,
            "subject_id": subject_id,
            "academic_year": academic_year,
            "semester": semester,
            "final_average": final_average,
            "letter_grade": self._percentage_to_letter(final_average),
            "grade_breakdown": grade_breakdown,
            "total_assessments": len(grades)
        }
    
    async def calculate_class_statistics(
        self,
        assessment_id: str
    ) -> Dict[str, Any]:
        """Calculate statistics for an assessment"""
        grades = await self.get_assessment_grades(assessment_id)
        
        if not grades:
            return {
                "assessment_id": assessment_id,
                "total_students": 0,
                "graded_students": 0,
                "average": 0,
                "highest": 0,
                "lowest": 0,
                "median": 0,
                "passing_count": 0,
                "failing_count": 0,
                "pass_rate": 0
            }
        
        scores = [g.get("percentage", 0) for g in grades]
        scores.sort()
        
        passing = len([g for g in grades if g.get("is_passing", False)])
        failing = len(grades) - passing
        
        # Calculate median
        n = len(scores)
        median = scores[n // 2] if n % 2 != 0 else (scores[n // 2 - 1] + scores[n // 2]) / 2
        
        return {
            "assessment_id": assessment_id,
            "total_students": len(grades),
            "graded_students": len(grades),
            "average": round(sum(scores) / len(scores), 2),
            "highest": max(scores),
            "lowest": min(scores),
            "median": round(median, 2),
            "passing_count": passing,
            "failing_count": failing,
            "pass_rate": round(passing / len(grades) * 100, 2)
        }
    
    # ============== REPORT CARDS ==============
    
    async def generate_report_card(
        self,
        tenant_id: str,
        student_id: str,
        academic_year: str,
        semester: int,
        generated_by: str
    ) -> Dict[str, Any]:
        """Generate a report card for a student"""
        now = datetime.now(timezone.utc).isoformat()
        
        # Get all subjects for the student's grades
        grades = await self.grades_collection.find(
            {
                "tenant_id": tenant_id,
                "student_id": student_id,
                "academic_year": academic_year,
                "semester": semester
            },
            {"_id": 0}
        ).to_list(1000)
        
        # Get unique subjects
        subject_ids = list(set(g.get("subject_id") for g in grades if g.get("subject_id")))
        
        # Calculate average for each subject
        subjects = []
        total_average = 0
        
        for subject_id in subject_ids:
            result = await self.calculate_student_average(
                tenant_id=tenant_id,
                student_id=student_id,
                subject_id=subject_id,
                academic_year=academic_year,
                semester=semester
            )
            
            subjects.append({
                "subject_id": subject_id,
                "average": result["final_average"],
                "letter_grade": result["letter_grade"],
                "total_assessments": result["total_assessments"]
            })
            
            total_average += result["final_average"]
        
        # Overall GPA
        gpa = round(total_average / len(subjects), 2) if subjects else 0
        
        report_card_id = str(uuid.uuid4())
        
        report_card = {
            "id": report_card_id,
            "tenant_id": tenant_id,
            "student_id": student_id,
            "academic_year": academic_year,
            "semester": semester,
            "subjects": subjects,
            "gpa": gpa,
            "overall_letter_grade": self._percentage_to_letter(gpa),
            "generated_at": now,
            "generated_by": generated_by,
            "status": "draft"
        }
        
        await self.report_cards_collection.insert_one(report_card)
        
        return report_card
    
    async def get_report_card(
        self,
        tenant_id: str,
        student_id: str,
        academic_year: str,
        semester: int
    ) -> Optional[Dict[str, Any]]:
        """Get report card for a student"""
        return await self.report_cards_collection.find_one(
            {
                "tenant_id": tenant_id,
                "student_id": student_id,
                "academic_year": academic_year,
                "semester": semester
            },
            {"_id": 0}
        )
    
    # ============== HELPER METHODS ==============
    
    def _percentage_to_letter(self, percentage: float) -> str:
        """Convert percentage to letter grade"""
        if percentage >= 95:
            return "A+"
        elif percentage >= 90:
            return "A"
        elif percentage >= 85:
            return "B+"
        elif percentage >= 80:
            return "B"
        elif percentage >= 75:
            return "C+"
        elif percentage >= 70:
            return "C"
        elif percentage >= 65:
            return "D+"
        elif percentage >= 60:
            return "D"
        else:
            return "F"
    
    async def _update_assessment_metadata(self, assessment_id: str):
        """Update assessment metadata after grading"""
        grades = await self.get_assessment_grades(assessment_id)
        
        if not grades:
            return
        
        scores = [g.get("score", 0) for g in grades]
        
        metadata = {
            "total_submissions": len(grades),
            "graded_submissions": len(grades),
            "average_score": round(sum(scores) / len(scores), 2),
            "highest_score": max(scores),
            "lowest_score": min(scores)
        }
        
        await self.assessments_collection.update_one(
            {"id": assessment_id},
            {
                "$set": {
                    "metadata": metadata,
                    "is_graded": True
                }
            }
        )


# Export
__all__ = ["AssessmentEngine", "AssessmentType", "GradeScale"]
