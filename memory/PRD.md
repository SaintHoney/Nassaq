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
- **مركز القيادة (Command Center)**:
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
- **صفحة إدارة المدارس (Updated)**:
  - **Combined Statistics Card**: All school statuses in one card (نشطة, إعداد, موقوفة, منتهية)
  - **Total Students & Teachers Cards**: New stats cards
  - **6-Column Grid Layout**: Premium card layout (xl:grid-cols-6)
  - **Larger Add School Button**: px-6 py-6 text-lg shadow-lg styling
  - Global search (name, code, phone, principal)
  - Advanced filters (status, city, stage, type)
  - Grid/Table view toggle
  - Bulk actions support

### ✅ Phase 5: User Creation Wizard with RBAC (Updated - March 2026)
- **معالج إنشاء حساب مستخدم (Connected to Real API)**:
  - **Backend API**: `/api/users/create` endpoint working
  - **Step 1 - Role Selection**: 7 roles available
  - **Step 2 - User Data (Teacher)**: Updated fields:
    - الاسم الكامل * (Full Name)
    - البريد الإلكتروني * (Email)
    - رقم الهاتف (Phone)
    - **المنطقة *** (Region - 13 Saudi regions)
    - **المدينة *** (City - dynamic based on region)
    - **الإدارة التعليمية** (Educational Department)
    - **اسم المدرسة (عربي)** (School Name Arabic)
    - **اسم المدرسة (English)** (School Name English)
  - **Removed Fields**: القسم, حالة الحساب, ملاحظات إدارية
  - **Step 3 - Permissions**: 11 teacher permissions
  - **Step 4 - Password**: Auto-generated secure temporary password
  - **Step 5 - Success**: Copy credentials and welcome message
  - **Fixed Button Visibility**: التالي/السابق buttons now fully visible

---

## API Endpoints

### User Management (NEW)
- `POST /api/users/create` - Create platform user (admin, teacher)
- `GET /api/users/platform-users` - List platform users
- `DELETE /api/users/{user_id}` - Soft delete user

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Schools
- `POST /api/schools/` - Create school with principal
- `GET /api/schools/` - List schools
- `GET /api/schools/{id}` - Get school details

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

---

## Prioritized Backlog

### P0 - Critical (COMPLETED ✅)
- [x] Mobile-First Responsive Design
- [x] Tenants Management Page (Updated Layout)
- [x] User Creation Wizard with RBAC
- [x] **Connect User Creation to Backend API**

### P1 - High Priority
- [ ] **First-time login password change flow**
- [ ] User Management Page (list, edit, delete users)
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

## Test Reports
- `/app/test_reports/iteration_20.json` - Mobile design tests
- `/app/test_reports/iteration_21.json` - User creation API tests (11/11 passed)

## Test Credentials
- **Platform Admin**: info@nassaqapp.com / NassaqAdmin2026!##$$HBJ
- **Teacher**: teacher@nassaq.com / NassaqTeacher2026

---

## Last Updated: March 9, 2026
- Updated User Creation Wizard with new teacher fields (region, city, educational_department, school_name)
- Connected User Creation to real Backend API (no more mock)
- Updated TenantsManagement page layout (6-column grid, combined stats card)
- Fixed button visibility in wizard (التالي/السابق)
- All tests passing (100% success rate)
