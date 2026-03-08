# NASSAQ (نَسَّق) - نظام إدارة المدارس الذكي
## Product Requirements Document (PRD)

---

## 📋 Original Problem Statement
بناء منصة نَسَّق (NASSAQ) - نظام إدارة مدارس متكامل مدعوم بالذكاء الاصطناعي على مستوى المؤسسات:
- موقع تعريفي للمنصة (Landing Page)
- بوابة المصادقة (تسجيل الدخول وإنشاء الحساب)
- نظام إدارة المدارس الكامل (تطبيق ويب)
- دعم Multi-Tenant Architecture
- دعم RTL (العربية) و LTR (الإنجليزية)
- وضع مظلم ووضع فاتح
- مساعد ذكي (حكيم) مدعوم بـ GPT-5.2

---

## 👥 User Personas

| Role | Description |
|------|-------------|
| Platform Admin | إدارة المنصة بالكامل، المدارس، المستخدمين، القواعد |
| Ministry Representative | مراقبة وتحليل على مستوى المدارس والإدارات التعليمية |
| School Principal | المسؤول التنفيذي عن إدارة المدرسة |
| School Sub Admin | الدعم الإداري لمدير المدرسة |
| Teacher | المشاركة في العملية التعليمية |
| Student | المستفيد من المنصة |
| Parent/Guardian | متابعة تقدم الأبناء |
| Driver | تشغيل خدمات النقل المدرسي |
| Gatekeeper | إدارة الدخول والخروج |

---

## ✅ What's Been Implemented (Phase 1 - Foundation)
**Date: January 2026**

### Backend (FastAPI + MongoDB)
- [x] JWT Authentication with RBAC
- [x] User registration and login
- [x] Multi-tenant school management (CRUD)
- [x] Dashboard statistics endpoint
- [x] AI Assistant (Hakim) chat endpoint using OpenAI GPT-5.2
- [x] School status management (active/pending/suspended)
- [x] User preferences (language, theme)

### Frontend (React + Tailwind + Shadcn UI)
- [x] Landing Page with hero, features, pricing, testimonials
- [x] Login Page with role-based redirect
- [x] Register Page with role selection
- [x] Platform Admin Dashboard
  - Stats cards (schools, students, teachers)
  - Schools management table
  - Create school dialog
  - School status management
- [x] School Principal Dashboard (basic)
- [x] AI Assistant (Hakim) floating chat
- [x] Theme toggle (dark/light mode)
- [x] Language toggle (Arabic/English)
- [x] RTL/LTR support
- [x] Responsive design

### Design System
- [x] Brand colors (Navy, Turquoise, Purple)
- [x] Cairo font for headings
- [x] Tajawal font for body
- [x] Rounded corners on all cards
- [x] Soft shadows
- [x] CSS variables for theming

---

## 📦 Core Requirements (Static)

### Authentication
- JWT-based custom auth
- Role-based access control (RBAC)
- Session expiration
- Secure token storage

### Multi-Tenant Architecture
- Each school as independent tenant
- tenant_id in all school-related collections
- Data isolation between schools

### Design
- Arabic (RTL) as primary language
- English (LTR) support
- Dark and Light modes
- Modern SaaS dashboard style

---

## 📋 Prioritized Backlog

### P0 - Critical (Phase 2 - Core School System)
- [ ] Teachers Management (CRUD, profiles, assignments)
- [ ] Students Management (CRUD, profiles, enrollment)
- [ ] Classes Management (create, assign teachers/students)
- [ ] Subjects Management (curriculum, assignments)
- [ ] Parent Accounts (link to students)
- [ ] Student Profiles with academic history
- [ ] Basic Reporting (PDF export)

### P1 - Important (Phase 3 - Academic Operations)
- [ ] Attendance System (daily, class-based)
- [ ] Assignments System (create, submit, grade)
- [ ] Grading System (marks, GPA, report cards)
- [ ] Scheduling Engine (timetable generation)
- [ ] Academic Analytics Dashboard

### P2 - Nice to Have (Phase 4 - AI Intelligence Layer)
- [ ] AI Student Analysis
- [ ] AI Educational Insights
- [ ] AI Recommendations Engine
- [ ] AI Smart Alerts
- [ ] AI Educational Reports

### P3 - Future (Phase 5 - Advanced Modules)
- [ ] Transport Management
- [ ] Gate Management
- [ ] Advanced Notifications System
- [ ] Ministry Dashboard
- [ ] Compliance Monitoring

---

## 🔑 Credentials
- **Admin Login:** admin@nassaq.sa / Admin@123

---

## 🔧 Technical Stack
- **Backend:** FastAPI, MongoDB, JWT, bcrypt, emergentintegrations
- **Frontend:** React, Tailwind CSS, Shadcn UI, React Router
- **AI:** OpenAI GPT-5.2 via Emergent LLM Key
- **Languages:** Arabic (primary), English

---

## 📝 Next Tasks List
1. Implement Teachers Management (CRUD, bulk import)
2. Implement Students Management (CRUD, bulk import)
3. Implement Classes Management with teacher assignment
4. Implement Subjects Management linked to classes
5. Build Basic Reporting module
6. Enhance Hakim AI with system knowledge
