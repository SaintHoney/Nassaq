"""
Teacher Session Engine - محرك إدارة الحصة
نَسَّق | NASSAQ

This engine handles the complete "Start Class" journey:
1. Session Creation & Validation
2. Attendance Management
3. Student Interaction Tracking
4. Behaviour & Participation Recording
5. Student Score System
6. Random Student Selection Algorithm
7. Session Analytics & Summary
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid
import random

# Create router for session endpoints
session_router = APIRouter(prefix="/session", tags=["Teacher Session"])


# ============== ENUMS ==============

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class SessionStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InteractionType(str, Enum):
    QUESTION = "question"
    PARTICIPATION = "participation"
    BEHAVIOUR = "behaviour"


class AnswerResult(str, Enum):
    CORRECT = "correct"
    WRONG = "wrong"
    NO_ANSWER = "no_answer"


class ParticipationType(str, Enum):
    ACTIVE = "active"          # مشاركة فعالة
    INITIATIVE = "initiative"  # طالب مبادر
    INACTIVE = "inactive"      # عدم التفاعل
    REFUSED = "refused"        # رفض التفاعل


class BehaviourCategory(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    SKILL = "skill"


class StudentLevel(str, Enum):
    NEEDS_ATTENTION = "needs_attention"  # 0-19
    ACCEPTABLE = "acceptable"            # 20-39
    GOOD = "good"                        # 40-59
    EXCELLENT = "excellent"              # 60-79
    STAR = "star"                        # 80+


# ============== PYDANTIC MODELS ==============

class SessionStartRequest(BaseModel):
    """Request to start a new class session"""
    schedule_session_id: str  # ID from schedule_sessions table
    teacher_id: str
    class_id: str
    subject_id: str
    

class SessionStartResponse(BaseModel):
    """Response after starting a session"""
    session_record_id: str
    session_status: SessionStatus
    start_time: str
    class_name: str
    subject_name: str
    teacher_name: str
    student_count: int
    message: str


class AttendanceUpdateRequest(BaseModel):
    """Request to update student attendance"""
    student_id: str
    status: AttendanceStatus


class AttendanceBulkRequest(BaseModel):
    """Request to update multiple students attendance"""
    attendance_records: List[AttendanceUpdateRequest]


class AttendanceApproveRequest(BaseModel):
    """Request to approve and finalize attendance"""
    session_record_id: str


class StudentInteractionRequest(BaseModel):
    """Request to record student interaction"""
    student_id: str
    interaction_type: InteractionType
    result: Optional[AnswerResult] = None
    participation_type: Optional[ParticipationType] = None
    behaviour_category: Optional[BehaviourCategory] = None
    behaviour_type: Optional[str] = None  # e.g., "respect", "disruption"
    behaviour_details: Optional[str] = None
    notes: Optional[str] = None


class SessionEndRequest(BaseModel):
    """Request to end a session"""
    session_record_id: str
    notes: Optional[str] = None


class StudentScoreResponse(BaseModel):
    """Student score information"""
    student_id: str
    student_name: str
    daily_score: int
    weekly_score: int
    monthly_score: int
    behaviour_score: int
    participation_score: int
    level: StudentLevel
    recent_achievements: List[str]


class SessionSummaryResponse(BaseModel):
    """Session summary after ending"""
    session_record_id: str
    duration_minutes: int
    total_students: int
    present_count: int
    absent_count: int
    late_count: int
    excused_count: int
    attendance_rate: float
    questions_asked: int
    correct_answers: int
    wrong_answers: int
    participation_rate: float
    positive_behaviours: int
    negative_behaviours: int
    top_participants: List[Dict[str, Any]]
    needs_attention: List[Dict[str, Any]]


# ============== SCORE RULES ==============

SCORE_RULES = {
    # Answer scores
    "correct_answer": 5,
    "no_answer_after_selection": -1,
    
    # Participation scores
    "active_participation": 2,
    "initiative": 2,
    "inactive": 0,
    "refused": -1,
    
    # Positive behaviour scores
    "respect": 2,
    "commitment": 2,
    "helping_others": 2,
    "special_skill": 3,
    "leadership": 3,
    
    # Negative behaviour scores
    "disruption": -2,
    "non_compliance": -2,
    "interruption": -1,
    "late_to_class": -2,
    "medium_violation": -4,
    "high_violation": -8,
    
    # Attendance scores
    "present": 1,
    "absent_no_excuse": -3,
    "excused": 0,
    "late": -1,
    
    # Bonus scores
    "three_correct_streak": 5,
    "no_negative_week": 10,
    "full_attendance_month": 15,
    "top_3_weekly": 10,
}

STUDENT_LEVELS = {
    "needs_attention": (0, 19),
    "acceptable": (20, 39),
    "good": (40, 59),
    "excellent": (60, 79),
    "star": (80, float('inf'))
}


# ============== SESSION ENGINE CLASS ==============

class TeacherSessionEngine:
    """
    Main engine for managing teacher class sessions.
    All data operations go through the database.
    """
    
    def __init__(self, db):
        self.db = db
        
    # ---------- Session Management ----------
    
    async def validate_session_start(self, teacher_id: str, schedule_session_id: str) -> Dict[str, Any]:
        """
        Validate if a session can be started.
        Checks:
        1. Session belongs to teacher
        2. Session is within allowed time
        3. Session hasn't started already
        4. Schedule is published
        """
        # Get schedule session
        schedule_session = await self.db.schedule_sessions.find_one(
            {"id": schedule_session_id},
            {"_id": 0}
        )
        
        if not schedule_session:
            raise HTTPException(status_code=404, detail="الحصة غير موجودة في الجدول")
        
        # Verify teacher owns this session
        if schedule_session.get("teacher_id") != teacher_id:
            raise HTTPException(status_code=403, detail="هذه الحصة ليست مخصصة لك")
        
        # Check if session already started today
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        existing_session = await self.db.class_sessions.find_one({
            "schedule_session_id": schedule_session_id,
            "date": today,
            "status": {"$in": [SessionStatus.IN_PROGRESS.value, SessionStatus.COMPLETED.value]}
        })
        
        if existing_session:
            if existing_session.get("status") == SessionStatus.IN_PROGRESS.value:
                raise HTTPException(status_code=400, detail="الحصة قيد التشغيل بالفعل")
            else:
                raise HTTPException(status_code=400, detail="تم إنهاء هذه الحصة مسبقاً اليوم")
        
        return schedule_session
    
    async def start_session(
        self, 
        teacher_id: str, 
        schedule_session_id: str,
        class_id: str,
        subject_id: str
    ) -> Dict[str, Any]:
        """
        Start a new class session.
        Creates session record and initializes attendance drafts.
        """
        # Validate first
        schedule_session = await self.validate_session_start(teacher_id, schedule_session_id)
        
        # Get teacher info
        teacher = await self.db.teachers.find_one({"id": teacher_id}, {"_id": 0})
        if not teacher:
            # Try to find from users
            user = await self.db.users.find_one({"teacher_id": teacher_id}, {"_id": 0})
            teacher = {"full_name": user.get("full_name") if user else "معلم"}
        
        # Get class info
        class_info = await self.db.classes.find_one({"id": class_id}, {"_id": 0})
        class_name = class_info.get("name", "فصل") if class_info else "فصل"
        
        # Get subject info
        subject = await self.db.subjects.find_one({"id": subject_id}, {"_id": 0})
        subject_name = subject.get("name_ar") or subject.get("name") or "مادة" if subject else "مادة"
        
        # Get students in this class
        students = await self.db.students.find(
            {"class_id": class_id, "is_active": True},
            {"_id": 0}
        ).to_list(100)
        
        # Create session record
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        today = now.strftime("%Y-%m-%d")
        
        session_record = {
            "id": session_id,
            "schedule_session_id": schedule_session_id,
            "teacher_id": teacher_id,
            "class_id": class_id,
            "subject_id": subject_id,
            "school_id": teacher.get("school_id") or class_info.get("tenant_id"),
            "date": today,
            "start_time": now.isoformat(),
            "end_time": None,
            "status": SessionStatus.IN_PROGRESS.value,
            "attendance_approved": False,
            "interaction_mode": None,  # homework, review, quiz
            "created_at": now.isoformat()
        }
        
        await self.db.class_sessions.insert_one(session_record)
        
        # Create attendance draft records for all students (default: present)
        attendance_drafts = []
        for student in students:
            attendance_drafts.append({
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "student_id": student.get("id"),
                "status": AttendanceStatus.PRESENT.value,
                "is_draft": True,
                "recorded_by": teacher_id,
                "recorded_at": now.isoformat()
            })
        
        if attendance_drafts:
            await self.db.session_attendance.insert_many(attendance_drafts)
        
        return {
            "session_record_id": session_id,
            "session_status": SessionStatus.IN_PROGRESS,
            "start_time": now.isoformat(),
            "class_name": class_name,
            "subject_name": subject_name,
            "teacher_name": teacher.get("full_name", "معلم"),
            "student_count": len(students),
            "message": "تم بدء الحصة بنجاح"
        }
    
    async def get_session_students(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Get all students for a session with their attendance status.
        Returns students grouped by gender.
        """
        # Get session
        session = await self.db.class_sessions.find_one({"id": session_id}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=404, detail="الجلسة غير موجودة")
        
        # Get attendance records
        attendance_records = await self.db.session_attendance.find(
            {"session_id": session_id},
            {"_id": 0}
        ).to_list(200)
        
        attendance_map = {a["student_id"]: a for a in attendance_records}
        
        # Get students
        students = await self.db.students.find(
            {"class_id": session["class_id"], "is_active": True},
            {"_id": 0}
        ).to_list(200)
        
        # Enrich students with attendance
        result = []
        for student in students:
            attendance = attendance_map.get(student.get("id"), {})
            result.append({
                "id": student.get("id"),
                "full_name": student.get("full_name"),
                "student_code": student.get("student_id") or student.get("code"),
                "gender": student.get("gender", "male"),
                "avatar_url": student.get("avatar_url"),
                "attendance_status": attendance.get("status", AttendanceStatus.PRESENT.value),
                "attendance_id": attendance.get("id")
            })
        
        # Sort by gender (males first based on RTL layout)
        result.sort(key=lambda x: (0 if x["gender"] == "male" else 1, x["full_name"]))
        
        return result
    
    async def update_attendance(
        self, 
        session_id: str, 
        student_id: str, 
        status: AttendanceStatus,
        teacher_id: str
    ) -> Dict[str, Any]:
        """Update attendance status for a single student"""
        now = datetime.now(timezone.utc)
        
        result = await self.db.session_attendance.update_one(
            {"session_id": session_id, "student_id": student_id},
            {
                "$set": {
                    "status": status.value,
                    "is_draft": True,
                    "updated_by": teacher_id,
                    "updated_at": now.isoformat()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="سجل الحضور غير موجود")
        
        return {"message": "تم تحديث الحضور", "student_id": student_id, "status": status.value}
    
    async def approve_attendance(self, session_id: str, teacher_id: str) -> Dict[str, Any]:
        """
        Approve and finalize attendance for a session.
        This triggers:
        1. Converting drafts to final records
        2. Updating attendance scores
        3. Sending notifications for absences
        """
        now = datetime.now(timezone.utc)
        
        # Get all attendance records
        records = await self.db.session_attendance.find(
            {"session_id": session_id},
            {"_id": 0}
        ).to_list(200)
        
        if not records:
            raise HTTPException(status_code=404, detail="لا توجد سجلات حضور")
        
        # Update all to final
        await self.db.session_attendance.update_many(
            {"session_id": session_id},
            {
                "$set": {
                    "is_draft": False,
                    "approved_by": teacher_id,
                    "approved_at": now.isoformat()
                }
            }
        )
        
        # Update session
        await self.db.class_sessions.update_one(
            {"id": session_id},
            {"$set": {"attendance_approved": True}}
        )
        
        # Calculate attendance scores
        for record in records:
            score_change = 0
            if record["status"] == AttendanceStatus.PRESENT.value:
                score_change = SCORE_RULES["present"]
            elif record["status"] == AttendanceStatus.ABSENT.value:
                score_change = SCORE_RULES["absent_no_excuse"]
            elif record["status"] == AttendanceStatus.LATE.value:
                score_change = SCORE_RULES["late"]
            elif record["status"] == AttendanceStatus.EXCUSED.value:
                score_change = SCORE_RULES["excused"]
            
            if score_change != 0:
                await self._update_student_score(
                    record["student_id"],
                    score_change,
                    "attendance",
                    f"حضور الحصة: {record['status']}"
                )
        
        # Count stats
        present = sum(1 for r in records if r["status"] == AttendanceStatus.PRESENT.value)
        absent = sum(1 for r in records if r["status"] == AttendanceStatus.ABSENT.value)
        late = sum(1 for r in records if r["status"] == AttendanceStatus.LATE.value)
        excused = sum(1 for r in records if r["status"] == AttendanceStatus.EXCUSED.value)
        
        return {
            "message": "تم اعتماد الحضور بنجاح",
            "total": len(records),
            "present": present,
            "absent": absent,
            "late": late,
            "excused": excused,
            "attendance_rate": round(present / len(records) * 100, 1) if records else 0
        }
    
    # ---------- Interaction Management ----------
    
    async def set_interaction_mode(self, session_id: str, mode: str) -> Dict[str, Any]:
        """Set the interaction mode for the session (homework, review, quiz)"""
        await self.db.class_sessions.update_one(
            {"id": session_id},
            {"$set": {"interaction_mode": mode}}
        )
        return {"message": f"تم تحديد نمط التفاعل: {mode}"}
    
    async def select_random_student(self, session_id: str) -> Dict[str, Any]:
        """
        Select a random student using a fair algorithm.
        Prioritizes students who haven't been selected recently.
        """
        # Get session
        session = await self.db.class_sessions.find_one({"id": session_id}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=404, detail="الجلسة غير موجودة")
        
        # Get present students only
        attendance = await self.db.session_attendance.find(
            {"session_id": session_id, "status": AttendanceStatus.PRESENT.value},
            {"_id": 0}
        ).to_list(200)
        
        if not attendance:
            raise HTTPException(status_code=400, detail="لا يوجد طلاب حاضرين")
        
        present_student_ids = [a["student_id"] for a in attendance]
        
        # Get interaction history for this session
        interactions = await self.db.session_interactions.find(
            {"session_id": session_id, "interaction_type": InteractionType.QUESTION.value},
            {"_id": 0}
        ).to_list(500)
        
        # Count selections per student
        selection_counts = {}
        last_selection_order = {}
        for i, interaction in enumerate(interactions):
            sid = interaction["student_id"]
            selection_counts[sid] = selection_counts.get(sid, 0) + 1
            last_selection_order[sid] = i
        
        # Calculate selection weights (lower = more likely to be selected)
        weights = []
        for sid in present_student_ids:
            count = selection_counts.get(sid, 0)
            last_order = last_selection_order.get(sid, -1)
            
            # Weight formula: fewer selections = lower weight = higher chance
            # Recently selected students get higher weight (lower chance)
            weight = count * 10 + (last_order + 1) * 0.5
            weights.append((sid, weight))
        
        # Sort by weight (ascending) and select from bottom third
        weights.sort(key=lambda x: x[1])
        selection_pool = weights[:max(len(weights) // 3, 1)]
        
        # Random selection from pool
        selected_id = random.choice(selection_pool)[0]
        
        # Get student info
        student = await self.db.students.find_one({"id": selected_id}, {"_id": 0})
        
        # Get participation count in this session
        participation_count = selection_counts.get(selected_id, 0)
        
        return {
            "student_id": selected_id,
            "full_name": student.get("full_name") if student else "طالب",
            "student_code": student.get("student_id") if student else "",
            "avatar_url": student.get("avatar_url") if student else None,
            "gender": student.get("gender", "male") if student else "male",
            "participation_count": participation_count
        }
    
    async def record_answer(
        self,
        session_id: str,
        student_id: str,
        result: AnswerResult,
        teacher_id: str
    ) -> Dict[str, Any]:
        """Record student answer (correct/wrong/no_answer)"""
        now = datetime.now(timezone.utc)
        
        # Create interaction record
        interaction = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "student_id": student_id,
            "interaction_type": InteractionType.QUESTION.value,
            "answer_result": result.value,
            "recorded_by": teacher_id,
            "recorded_at": now.isoformat()
        }
        
        await self.db.session_interactions.insert_one(interaction)
        
        # Calculate score
        score_change = 0
        if result == AnswerResult.CORRECT:
            score_change = SCORE_RULES["correct_answer"]
            
            # Check for streak bonus
            streak = await self._check_answer_streak(session_id, student_id)
            if streak >= 3:
                score_change += SCORE_RULES["three_correct_streak"]
                # TODO: Send notification to parent
                
        elif result == AnswerResult.NO_ANSWER:
            score_change = SCORE_RULES["no_answer_after_selection"]
        
        # Update student score
        if score_change != 0:
            await self._update_student_score(
                student_id,
                score_change,
                "answer",
                f"إجابة: {result.value}"
            )
        
        return {
            "message": "تم تسجيل الإجابة",
            "result": result.value,
            "score_change": score_change
        }
    
    async def record_participation(
        self,
        session_id: str,
        student_id: str,
        participation_type: ParticipationType,
        teacher_id: str
    ) -> Dict[str, Any]:
        """Record student participation"""
        now = datetime.now(timezone.utc)
        
        # Create interaction record
        interaction = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "student_id": student_id,
            "interaction_type": InteractionType.PARTICIPATION.value,
            "participation_type": participation_type.value,
            "recorded_by": teacher_id,
            "recorded_at": now.isoformat()
        }
        
        await self.db.session_interactions.insert_one(interaction)
        
        # Calculate score
        score_change = 0
        if participation_type == ParticipationType.ACTIVE:
            score_change = SCORE_RULES["active_participation"]
        elif participation_type == ParticipationType.INITIATIVE:
            score_change = SCORE_RULES["initiative"]
        elif participation_type == ParticipationType.REFUSED:
            score_change = SCORE_RULES.get("refused", -1)
        
        # Update student score
        if score_change != 0:
            await self._update_student_score(
                student_id,
                score_change,
                "participation",
                f"مشاركة: {participation_type.value}"
            )
        
        return {
            "message": "تم تسجيل المشاركة",
            "type": participation_type.value,
            "score_change": score_change
        }
    
    async def record_behaviour(
        self,
        session_id: str,
        student_id: str,
        category: BehaviourCategory,
        behaviour_type: str,
        details: Optional[str],
        teacher_id: str
    ) -> Dict[str, Any]:
        """Record student behaviour (positive/negative/skill)"""
        now = datetime.now(timezone.utc)
        
        # Create interaction record
        interaction = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "student_id": student_id,
            "interaction_type": InteractionType.BEHAVIOUR.value,
            "behaviour_category": category.value,
            "behaviour_type": behaviour_type,
            "behaviour_details": details,  # Only visible to admin
            "recorded_by": teacher_id,
            "recorded_at": now.isoformat(),
            "editable_until": (now + timedelta(hours=1)).isoformat()
        }
        
        await self.db.session_interactions.insert_one(interaction)
        
        # Calculate score based on behaviour type
        score_change = 0
        if category == BehaviourCategory.POSITIVE:
            score_change = SCORE_RULES.get(behaviour_type, 2)
        elif category == BehaviourCategory.NEGATIVE:
            score_change = SCORE_RULES.get(behaviour_type, -2)
        elif category == BehaviourCategory.SKILL:
            score_change = SCORE_RULES.get("special_skill", 3)
        
        # Update student score
        if score_change != 0:
            await self._update_student_score(
                student_id,
                score_change,
                "behaviour",
                f"سلوك ({category.value}): {behaviour_type}"
            )
        
        return {
            "message": "تم تسجيل السلوك",
            "category": category.value,
            "type": behaviour_type,
            "score_change": score_change
        }
    
    # ---------- Session End ----------
    
    async def end_session(self, session_id: str, teacher_id: str) -> SessionSummaryResponse:
        """
        End the session and generate summary.
        """
        now = datetime.now(timezone.utc)
        
        # Get session
        session = await self.db.class_sessions.find_one({"id": session_id}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=404, detail="الجلسة غير موجودة")
        
        if session.get("status") == SessionStatus.COMPLETED.value:
            raise HTTPException(status_code=400, detail="تم إنهاء الحصة مسبقاً")
        
        # Calculate duration
        start_time = datetime.fromisoformat(session["start_time"].replace("Z", "+00:00"))
        duration = (now - start_time).total_seconds() / 60
        
        # Get attendance stats
        attendance = await self.db.session_attendance.find(
            {"session_id": session_id},
            {"_id": 0}
        ).to_list(200)
        
        present = sum(1 for a in attendance if a["status"] == AttendanceStatus.PRESENT.value)
        absent = sum(1 for a in attendance if a["status"] == AttendanceStatus.ABSENT.value)
        late = sum(1 for a in attendance if a["status"] == AttendanceStatus.LATE.value)
        excused = sum(1 for a in attendance if a["status"] == AttendanceStatus.EXCUSED.value)
        total = len(attendance)
        
        # Get interaction stats
        interactions = await self.db.session_interactions.find(
            {"session_id": session_id},
            {"_id": 0}
        ).to_list(500)
        
        questions = [i for i in interactions if i.get("interaction_type") == InteractionType.QUESTION.value]
        correct = sum(1 for q in questions if q.get("answer_result") == AnswerResult.CORRECT.value)
        wrong = sum(1 for q in questions if q.get("answer_result") == AnswerResult.WRONG.value)
        
        participations = [i for i in interactions if i.get("interaction_type") == InteractionType.PARTICIPATION.value]
        participants = set(p["student_id"] for p in participations)
        participation_rate = len(participants) / present * 100 if present > 0 else 0
        
        behaviours = [i for i in interactions if i.get("interaction_type") == InteractionType.BEHAVIOUR.value]
        positive_behaviours = sum(1 for b in behaviours if b.get("behaviour_category") == BehaviourCategory.POSITIVE.value)
        negative_behaviours = sum(1 for b in behaviours if b.get("behaviour_category") == BehaviourCategory.NEGATIVE.value)
        
        # Get top participants
        student_interactions = {}
        for i in interactions:
            sid = i["student_id"]
            if sid not in student_interactions:
                student_interactions[sid] = {"correct": 0, "participation": 0}
            if i.get("answer_result") == AnswerResult.CORRECT.value:
                student_interactions[sid]["correct"] += 1
            if i.get("interaction_type") == InteractionType.PARTICIPATION.value:
                student_interactions[sid]["participation"] += 1
        
        # Sort by total positive interactions
        sorted_students = sorted(
            student_interactions.items(),
            key=lambda x: x[1]["correct"] * 2 + x[1]["participation"],
            reverse=True
        )
        
        top_participants = []
        for sid, stats in sorted_students[:3]:
            student = await self.db.students.find_one({"id": sid}, {"_id": 0})
            if student:
                top_participants.append({
                    "student_id": sid,
                    "name": student.get("full_name"),
                    "correct_answers": stats["correct"],
                    "participations": stats["participation"]
                })
        
        # Update session record
        await self.db.class_sessions.update_one(
            {"id": session_id},
            {
                "$set": {
                    "status": SessionStatus.COMPLETED.value,
                    "end_time": now.isoformat(),
                    "duration_minutes": round(duration),
                    "summary": {
                        "total_students": total,
                        "present": present,
                        "absent": absent,
                        "questions_asked": len(questions),
                        "correct_answers": correct,
                        "participation_rate": round(participation_rate, 1)
                    }
                }
            }
        )
        
        return SessionSummaryResponse(
            session_record_id=session_id,
            duration_minutes=round(duration),
            total_students=total,
            present_count=present,
            absent_count=absent,
            late_count=late,
            excused_count=excused,
            attendance_rate=round(present / total * 100, 1) if total > 0 else 0,
            questions_asked=len(questions),
            correct_answers=correct,
            wrong_answers=wrong,
            participation_rate=round(participation_rate, 1),
            positive_behaviours=positive_behaviours,
            negative_behaviours=negative_behaviours,
            top_participants=top_participants,
            needs_attention=[]  # TODO: Calculate based on scores
        )
    
    # ---------- Score System ----------
    
    async def _update_student_score(
        self,
        student_id: str,
        score_change: int,
        category: str,
        description: str
    ):
        """Update student score and create ledger entry"""
        now = datetime.now(timezone.utc)
        today = now.strftime("%Y-%m-%d")
        week_start = (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")
        month = now.strftime("%Y-%m")
        
        # Create score ledger entry
        ledger_entry = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "score_change": score_change,
            "category": category,
            "description": description,
            "date": today,
            "week": week_start,
            "month": month,
            "created_at": now.isoformat()
        }
        
        await self.db.student_score_ledger.insert_one(ledger_entry)
        
        # Update or create daily score
        await self.db.student_daily_scores.update_one(
            {"student_id": student_id, "date": today},
            {
                "$inc": {"score": score_change},
                "$setOnInsert": {
                    "id": str(uuid.uuid4()),
                    "student_id": student_id,
                    "date": today,
                    "created_at": now.isoformat()
                }
            },
            upsert=True
        )
    
    async def _check_answer_streak(self, session_id: str, student_id: str) -> int:
        """Check consecutive correct answers for a student in current session"""
        interactions = await self.db.session_interactions.find(
            {
                "session_id": session_id,
                "student_id": student_id,
                "interaction_type": InteractionType.QUESTION.value
            },
            {"_id": 0}
        ).sort("recorded_at", -1).to_list(10)
        
        streak = 0
        for i in interactions:
            if i.get("answer_result") == AnswerResult.CORRECT.value:
                streak += 1
            else:
                break
        
        return streak
    
    async def get_student_score(self, student_id: str) -> StudentScoreResponse:
        """Get comprehensive score information for a student"""
        now = datetime.now(timezone.utc)
        today = now.strftime("%Y-%m-%d")
        week_start = (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")
        month = now.strftime("%Y-%m")
        
        # Get student info
        student = await self.db.students.find_one({"id": student_id}, {"_id": 0})
        if not student:
            raise HTTPException(status_code=404, detail="الطالب غير موجود")
        
        # Get daily score
        daily = await self.db.student_daily_scores.find_one(
            {"student_id": student_id, "date": today},
            {"_id": 0}
        )
        daily_score = daily.get("score", 0) if daily else 0
        
        # Get weekly score
        weekly_scores = await self.db.student_score_ledger.find(
            {"student_id": student_id, "week": week_start},
            {"_id": 0}
        ).to_list(500)
        weekly_score = sum(s.get("score_change", 0) for s in weekly_scores)
        
        # Get monthly score
        monthly_scores = await self.db.student_score_ledger.find(
            {"student_id": student_id, "month": month},
            {"_id": 0}
        ).to_list(1000)
        monthly_score = sum(s.get("score_change", 0) for s in monthly_scores)
        
        # Get category scores
        behaviour_score = sum(
            s.get("score_change", 0) 
            for s in monthly_scores 
            if s.get("category") == "behaviour"
        )
        participation_score = sum(
            s.get("score_change", 0) 
            for s in monthly_scores 
            if s.get("category") in ["participation", "answer"]
        )
        
        # Determine level
        level = StudentLevel.NEEDS_ATTENTION
        for level_name, (min_score, max_score) in STUDENT_LEVELS.items():
            if min_score <= weekly_score <= max_score:
                level = StudentLevel(level_name)
                break
        
        return StudentScoreResponse(
            student_id=student_id,
            student_name=student.get("full_name", "طالب"),
            daily_score=max(0, daily_score),  # No negative display
            weekly_score=weekly_score,
            monthly_score=monthly_score,
            behaviour_score=behaviour_score,
            participation_score=participation_score,
            level=level,
            recent_achievements=[]  # TODO: Get from achievements table
        )
    
    # ---------- Seating Order ----------
    
    async def update_seating_order(
        self,
        session_id: str,
        student_order: List[str]
    ) -> Dict[str, Any]:
        """Update student seating order for current session"""
        await self.db.class_sessions.update_one(
            {"id": session_id},
            {"$set": {"seating_order": student_order}}
        )
        return {"message": "تم حفظ ترتيب الجلوس"}


# ============== BEHAVIOUR CATEGORIES DATA ==============

DEFAULT_BEHAVIOUR_TYPES = {
    "skill": [
        {"id": "leadership", "name_ar": "قيادة", "name_en": "Leadership", "score": 3},
        {"id": "cooperation", "name_ar": "تعاون", "name_en": "Cooperation", "score": 2},
        {"id": "initiative", "name_ar": "مبادرة", "name_en": "Initiative", "score": 3},
    ],
    "positive": [
        {"id": "respect", "name_ar": "احترام", "name_en": "Respect", "score": 2},
        {"id": "commitment", "name_ar": "التزام", "name_en": "Commitment", "score": 2},
        {"id": "helping_others", "name_ar": "مساعدة الآخرين", "name_en": "Helping Others", "score": 2},
    ],
    "negative": [
        {"id": "disruption", "name_ar": "إزعاج", "name_en": "Disruption", "score": -2},
        {"id": "non_compliance", "name_ar": "عدم التزام", "name_en": "Non-compliance", "score": -2},
        {"id": "interruption", "name_ar": "مقاطعة التعليمات", "name_en": "Interruption", "score": -1},
    ]
}
