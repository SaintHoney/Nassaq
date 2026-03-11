# نَسَّق | NASSAQ - School Management System PRD

## Original Problem Statement
بناء نظام شامل ومتعدد المستأجرين لإدارة المدارس يعمل بالذكاء الاصطناعي، يسمى "نَسَّق | NASSAQ".

---

## Current Status: Teacher Session Engine - Backend Complete ✅

### What's Been Implemented

#### 1. Teacher Session Engine (Backend) ✅ COMPLETE
- **Session Start API** (`POST /api/session/start`): Starts a new class session, creates attendance records
- **Get Session Students** (`GET /api/session/{id}/students`): Returns students with attendance status, grouped by gender
- **Update Attendance** (`PUT /api/session/{id}/attendance/{student_id}`): Updates individual student attendance
- **Approve Attendance** (`POST /api/session/{id}/approve-attendance`): Finalizes attendance
- **Get Current Session** (`GET /api/session/current`): Gets in-progress session by schedule_session_id
- **Record Interaction** (`POST /api/session/{id}/interaction`): Logs student participation/answers
- **Record Behavior** (`POST /api/session/{id}/behaviour`): Logs student behavior (positive/negative/skills)
- **End Session** (`POST /api/session/{id}/end`): Finalizes and closes session

#### 2. Mobile-First Teacher UI ✅ SCAFFOLDED
- **TeacherHomePage.jsx**: Mobile-first dashboard with colored lesson cards (green for current, blue for upcoming)
- **SessionStartPage.jsx**: Attendance management with student cards grouped by gender
- **SessionTeachPage.jsx**: Interactive teaching grid (placeholder for random selection & confetti)

#### 3. Bug Fixes ✅
- Fixed `/api/auth/me` returning incorrect `id` and missing `teacher_id`
- Fixed `/api/teacher/dashboard` not returning today's lessons correctly
- Added fallback logic for session data retrieval

---

## Architecture

```
/app
├── backend/
│   ├── engines/
│   │   └── session_engine.py    # NEW - Session business logic (1000+ lines)
│   └── server.py                # Main API routes
└── frontend/src/
    ├── pages/TeacherModule/
    │   ├── TeacherHomePage.jsx  # Mobile-first dashboard
    │   ├── SessionStartPage.jsx # Attendance page
    │   └── SessionTeachPage.jsx # Teaching page
    └── App.js                   # Routes
```

---

## Pending/In-Progress Tasks

### 🔴 P0 - Critical
1. **Fix Frontend Navigation Issue**
   - `location.state` not being passed correctly from TeacherHomePage to SessionStartPage
   - When clicking "ابدأ الحصة", user should go to `/teacher/session/start` with lesson data

2. **Complete Teaching Page UI**
   - Random student selection feature
   - Confetti animation for correct answers
   - Interaction panel for logging participation/behavior

### 🟡 P1 - Important
3. **Scheduling Engine**
   - Schedule generation logic
   - Conflict detection
   - Drag-and-drop saving

4. **School Settings Verification**
   - Test all 15 sections save correctly to database

5. **System Cleanup**
   - Remove all mock/static data

### 🟢 P2 - Nice to Have
6. **Add Student Wizard** (with QR code)
7. **Add Teacher Wizard**
8. **Create Class Wizard**

---

## Key Database Collections

```
- class_sessions: Active/completed class sessions
- session_attendance: Student attendance records per session
- session_interactions: Student participation/answer logs
- session_behaviours: Student behavior records
- behaviour_types: Predefined behavior types (13 entries)
```

---

## API Endpoints

### Session APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session/start` | Start new session |
| GET | `/api/session/{id}` | Get session info |
| GET | `/api/session/{id}/students` | Get students with attendance |
| PUT | `/api/session/{id}/attendance/{student_id}` | Update attendance |
| POST | `/api/session/{id}/approve-attendance` | Approve attendance |
| POST | `/api/session/{id}/interaction` | Log interaction |
| POST | `/api/session/{id}/behaviour` | Log behavior |
| POST | `/api/session/{id}/end` | End session |
| GET | `/api/session/current` | Get current session by schedule_session_id |

---

## Test Credentials
- **Teacher**: `teacher1@nor.edu.sa` / `Teacher@123`
- **Principal**: `principal1@nassaq.com` / `Principal@123`
- **Admin**: `admin@nassaq.com` / `Admin@123`

---

## Tech Stack
- **Backend**: FastAPI, MongoDB (motor), Pydantic
- **Frontend**: React, TailwindCSS, Shadcn/UI, canvas-confetti
- **Dependencies**: @dnd-kit, lucide-react, sonner

---

*آخر تحديث: 11 مارس 2026*
