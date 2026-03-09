# نَسَّق | NASSAQ - School Management System PRD

## Original Problem Statement
Build a comprehensive, AI-powered, multi-tenant school management system named "نَسَّق | NASSAQ" with multiple user roles and detailed user journeys.

## User Personas
- **Platform Admin (مدير المنصة)**: Full system control, manages all schools and users
- **School Principal (مدير المدرسة)**: Manages their school's operations
- **Teacher (معلم)**: Manages classes, students, attendance, grades
- **Student (طالب)**: Views grades, assignments, schedule
- **Parent (ولي الأمر)**: Monitors child's progress

## Core Requirements
1. Multi-tenant architecture with school isolation
2. RTL (Arabic) first design with English support
3. Role-based access control (RBAC)
4. AI-powered analytics and insights
5. Mobile-first responsive design

---

## What's Been Implemented

### ✅ Phase 1: Foundation (Completed)
- JWT Authentication with role-based routing
- MongoDB database with demo data
- Basic dashboard structure
- Landing page with Arabic content

### ✅ Phase 2: Platform Admin Dashboard (Completed - Dec 2025)
- **mركز القيادة (Command Center)**:
  - Global Filters Bar with region, city, school type filters
  - Enhanced Analytics Cards with sparklines and health indicators
  - Daily Platform Activity chart with real-time data
  - Quick AI Operations Panel
  - AI Suggested Tasks with navigation links
  - Hakim AI Assistant section with online status

### ✅ Phase 3: Mobile-First Responsive Design (Completed - March 2026)
- **AdminDashboard Mobile Optimization**:
  - Mobile header with compact date display
  - Mobile filters sheet (swipe from side)
  - Horizontal scroll for quick actions
  - Responsive analytics cards (2-column grid)
  - Simplified activity chart for mobile
  - Mobile-optimized sidebar with toggle

### ✅ Phase 4: Tenants Management Page (Completed - March 2026)
- **صفحة إدارة المستأجرين**:
  - Statistics cards (total, active, suspended, AI-enabled)
  - Global search (name, code, phone, email)
  - Advanced filters (status, city, type, stage, AI status)
  - Grid view with premium school cards
  - Responsive design (desktop and mobile)
  - Bulk actions support
  - Create School Wizard integration

### ✅ Phase 5: User Creation Wizard with RBAC (Completed - March 2026)
- **معالج إنشاء حساب مستخدم**:
  - **Step 1 - Role Selection**: 7 roles available:
    - مدير العمليات التشغيلية (Platform Operations Manager)
    - مسؤول الإدارة التقنية (Platform Technical Administrator)
    - مسؤول دعم المستخدمين (Platform Support Specialist)
    - محلل بيانات المنصة (Platform Data Analyst)
    - مسؤول أمن المنصة (Platform Security Officer)
    - حساب اختبار (Testing Account)
    - معلم (Teacher)
  - **Step 2 - User Data**: Full name, email, phone, city, department, status, notes
  - **Step 3 - Permissions**: 60+ permissions in 14 categories with visual cards
  - **Step 4 - Password**: Auto-generated secure temporary password
  - **Step 5 - Success**: Copy credentials and welcome message functionality

---

## Technical Architecture

### Frontend
- React.js with React Router
- TailwindCSS with custom NASSAQ theme
- Shadcn/UI components
- Recharts for data visualization
- Arabic fonts (Cairo, Tajawal)

### Backend
- FastAPI (Python)
- MongoDB with pymongo
- JWT authentication
- Pydantic models

### Database Schema
- users, schools, students, teachers
- classes, subjects, schedules
- attendance, grades, notifications

---

## Prioritized Backlog

### P0 - Critical
- [x] Mobile-First Responsive Design
- [x] Tenants Management Page
- [x] User Creation Wizard with RBAC
- [ ] **Connect User Creation to Backend API**
- [ ] **User Management Page (list, edit, delete users)**

### P1 - High Priority
- [ ] Backend API for user CRUD operations
- [ ] First-time login password change flow
- [ ] Teacher Dashboard enhancements
- [ ] School Principal Dashboard

### P2 - Medium Priority
- [ ] Parent Dashboard
- [ ] Student Dashboard
- [ ] AI Hakim Assistant backend integration
- [ ] Notification Engine (SMS/Email)

### P3 - Low Priority
- [ ] PDF Reports generation
- [ ] Data import/export
- [ ] Audit logs UI
- [ ] System monitoring dashboard

---

## Known Issues & Technical Debt

### Issues to Fix
- [ ] Recharts console warnings (width/height -1)

### Refactoring Needed
- [ ] Break down AdminDashboard.jsx (currently ~2300 lines)
- [ ] Break down server.py into routes/models/services structure
- [ ] Extract reusable components

### Mocked Features
- **User Creation Wizard**: Uses setTimeout simulation, needs backend API connection

---

## Test Credentials
- **Platform Admin**: info@nassaqapp.com / NassaqAdmin2026!##$$HBJ
- **Teacher**: teacher@nassaq.com / NassaqTeacher2026

---

## Last Updated: March 9, 2026
- Added Mobile-First Responsive Design for Admin Dashboard
- Created Tenants Management page with full functionality
- Implemented User Creation Wizard with 7 roles and 60+ permissions
- All frontend tests passing (100% success rate)
