# نَسَّق | NASSAQ - School Management System PRD

## Original Problem Statement
بناء نظام شامل ومتعدد المستأجرين لإدارة المدارس يعمل بالذكاء الاصطناعي، يسمى "نَسَّق | NASSAQ".

---

## Current Status: Teacher Session Engine - COMPLETE ✅

### What's Been Implemented (11 مارس 2026)

#### 1. Teacher Session Engine (Backend) ✅ COMPLETE
- **Session Start API** (`POST /api/session/start`): Starts a new class session, creates attendance records
- **Get Current Session** (`GET /api/session/current`): Gets in-progress session by schedule_session_id (FIXED route ordering)
- **Get Session Students** (`GET /api/session/{id}/students`): Returns students with attendance status, grouped by gender
- **Update Attendance** (`PUT /api/session/{id}/attendance/{student_id}`): Updates individual student attendance
- **Approve Attendance** (`POST /api/session/{id}/attendance/approve`): Finalizes attendance
- **Record Interaction** (`POST /api/session/{id}/interaction`): Logs student participation/answers
- **Record Behavior** (`POST /api/session/{id}/behaviour`): Logs student behavior (positive/negative/skills)
- **End Session** (`POST /api/session/{id}/end`): Finalizes and closes session

#### 2. Mobile-First Teacher UI ✅ COMPLETE
- **TeacherHomePage.jsx**: Mobile-first dashboard with colored lesson cards
  - Green cards for current lesson
  - Blue cards for upcoming lessons
  - Hijri date display
  - Quick stats (classes, students, stage)
  - Session storage for lesson data persistence
  
- **SessionStartPage.jsx**: Attendance management
  - Students grouped by gender (الطلاب / الطالبات)
  - All students default to "حاضر" (present)
  - Click to change status (absent, late, excused)
  - Progress bar showing attendance stats
  - "اعتماد الحضور" button to proceed
  - FIXED: Session storage fallback for lesson data
  
- **SessionTeachPage.jsx**: Interactive teaching
  - Random student selection with spinning animation
  - Confetti celebrations for correct answers
  - Built-in audio feedback (base64 encoded)
  - Multiple burst confetti effects
  - Participation logging
  - Behavior recording (skills, positive, negative)

#### 3. Bug Fixes ✅ COMPLETE
- Fixed `/api/auth/me` returning incorrect `id` and missing `teacher_id`
- Fixed `/api/teacher/dashboard` not returning today's lessons
- Fixed `/api/session/current` route ordering (was being matched by `/{session_id}`)
- Fixed `location.state` not being passed correctly (added sessionStorage fallback)
- Added `isRTL` to AuthContext for Arabic language support

#### 4. Language Settings ✅
- Arabic is now the default language for all users
- `isRTL` property added to AuthContext
- All teacher pages support RTL layout

---

## Architecture

```
/app
├── backend/
│   ├── engines/
│   │   └── session_engine.py    # Session business logic (1000+ lines)
│   └── server.py                # Main API routes
└── frontend/src/
    ├── contexts/
    │   └── AuthContext.js       # Added isRTL, preferredLanguage
    ├── pages/TeacherModule/
    │   ├── TeacherHomePage.jsx  # Mobile-first dashboard
    │   ├── SessionStartPage.jsx # Attendance page
    │   └── SessionTeachPage.jsx # Teaching page with confetti
    └── App.js                   # Routes
```

---

## Remaining Tasks

### 🟡 P1 - Important
1. **Complete Teaching Page Flow**
   - Test full "approve attendance → teaching → random selection → end session" flow

2. **Scheduling Engine**
   - Schedule generation logic (Hakim AI)
   - Conflict detection
   - Drag-and-drop saving

3. **School Settings Verification**
   - Test all 15 sections save correctly to database

4. **System Cleanup**
   - Remove all mock/static data

### 🟢 P2 - Nice to Have
5. **Add Student Wizard** (with QR code)
6. **Add Teacher Wizard**
7. **Create Class Wizard**

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

## API Endpoints (Session)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session/start` | Start new session |
| GET | `/api/session/current` | Get current session by schedule_session_id |
| GET | `/api/session/{id}` | Get session info |
| GET | `/api/session/{id}/students` | Get students with attendance |
| PUT | `/api/session/{id}/attendance/{student_id}` | Update attendance |
| POST | `/api/session/{id}/attendance/approve` | Approve attendance |
| POST | `/api/session/{id}/interaction` | Log interaction |
| POST | `/api/session/{id}/behaviour` | Log behavior |
| POST | `/api/session/{id}/end` | End session |

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
