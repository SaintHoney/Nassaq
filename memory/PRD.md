# نَسَّق | NASSAQ - School Management System PRD

## Original Problem Statement
بناء نظام شامل ومتعدد المستأجرين لإدارة المدارس يعمل بالذكاء الاصطناعي، يسمى "نَسَّق | NASSAQ".

---

## Current Status: All P0-P2 Tasks COMPLETE ✅

### What's Been Implemented (11 مارس 2026)

#### 1. Teacher Session Engine ✅ COMPLETE
- Session lifecycle management (start, attendance, teaching, end)
- Random student selection with visual effects
- Participation & behavior logging
- Points system
- Full API testing passed

#### 2. Mobile-First Teacher UI ✅ COMPLETE
- TeacherHomePage with colored lesson cards
- SessionStartPage with attendance management
- SessionTeachPage with confetti and audio effects
- Arabic as default language
- RTL support

#### 3. Scheduling Engine ✅ ALREADY COMPLETE
- Auto-generation with conflict detection
- Drag-and-drop with `/schedule-sessions/{id}/move`
- Teacher workload balancing
- Hakim AI integration ready

#### 4. School Settings ✅ VERIFIED
- 15+ setting endpoints available
- Fixed `periods-per-day` endpoint (body instead of query param)

#### 5. Mock Data Cleanup ✅ DONE
- Removed mock data from:
  - TeacherDashboard.jsx
  - PlatformNotificationsPage.jsx
  - AdminDashboard.jsx
- Now shows zeros instead of fake data when API fails

#### 6. Add Student Wizard ✅ COMPLETE
- 5-step wizard (Student Info → Parent Info → Health → Review → Success)
- QR Code generation (base64 PNG)
- Parent account linking
- Sibling detection
- Welcome message generation
- API: `POST /api/student-wizard/create`

#### 7. Add Teacher Wizard ✅ COMPLETE
- Multi-step wizard
- Subject & grade assignment
- Rank & contract type
- Temporary password generation
- API: `POST /api/teachers/create`

#### 8. Create Class Wizard ✅ COMPLETE
- Class info (name, grade, section)
- Capacity settings
- Homeroom teacher assignment
- Room assignment

---

## Architecture

```
/app
├── backend/
│   ├── engines/
│   │   ├── session_engine.py    # Session business logic
│   │   └── audit_engine.py      # Audit logging
│   └── server.py                # Main API routes (13800+ lines)
└── frontend/src/
    ├── contexts/
    │   ├── AuthContext.js       # Added isRTL, preferredLanguage
    │   └── ThemeContext.js
    ├── components/wizards/
    │   ├── AddStudentWizard.jsx # Student creation with QR
    │   ├── AddTeacherWizard.jsx # Teacher creation
    │   └── CreateClassWizard.jsx # Class creation
    ├── pages/TeacherModule/
    │   ├── TeacherHomePage.jsx  # Mobile-first dashboard
    │   ├── SessionStartPage.jsx # Attendance page
    │   └── SessionTeachPage.jsx # Teaching with confetti
    └── App.js
```

---

## Key APIs

### Session Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session/start` | Start session |
| GET | `/api/session/current` | Get active session |
| GET | `/api/session/{id}/students` | Get students |
| POST | `/api/session/{id}/attendance/approve` | Approve attendance |
| POST | `/api/session/{id}/random-student` | Random selection |
| POST | `/api/session/{id}/answer` | Log answer |
| POST | `/api/session/{id}/end` | End session |

### Wizards
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student-wizard/create` | Create student with QR |
| POST | `/api/teachers/create` | Create teacher |
| POST | `/api/classes` | Create class |

### Schedule
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/schedules/{id}/generate` | Auto-generate schedule |
| PUT | `/api/schedule-sessions/{id}/move` | Move session (D&D) |
| GET | `/api/schedules/{id}/conflicts` | Get conflicts |

---

## Test Credentials
- **Teacher**: `teacher1@nor.edu.sa` / `Teacher@123`
- **Principal**: `principal1@nassaq.com` / `Principal@123`
- **Admin**: `admin@nassaq.com` / `Admin@123`

---

## Remaining Work (Future Enhancements)

### Nice to Have
- Bulk import (Excel/CSV) for students and teachers
- Schedule export (PDF, CSV)
- Advanced Hakim AI conversational assistant
- Parent mobile app
- Push notifications

---

## Tech Stack
- **Backend**: FastAPI, MongoDB, Pydantic, qrcode
- **Frontend**: React, TailwindCSS, Shadcn/UI, canvas-confetti
- **Auth**: JWT with RBAC
- **Languages**: Arabic (default), English

---

*آخر تحديث: 11 مارس 2026*
