# نَسَّق | NASSAQ - School Management System PRD

## Original Problem Statement
Build a comprehensive, AI-powered, multi-tenant school management system named "نَسَّق | NASSAQ" with multiple user roles and detailed user journeys.

## User Personas
- **Platform Admin (مدير المنصة)**: Full system control, manages all schools and users
- **School Principal (مدير المدرسة)**: Manages their school's operations
- **Teacher (معلم)**: Manages classes, students, attendance, grades
- **Independent Teacher (معلم مستقل)**: Uses platform tools without school affiliation
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

### ✅ Phase 4: Tenants Management Page (Completed & Verified - March 2026)
- **صفحة إدارة المدارس (Card-Based Layout)**:
  - **Card Layout**: 6-column grid with school cards (2xl:grid-cols-6)
  - **Combined Statistics Card**: All school statuses (نشطة, إعداد, موقوفة, منتهية)
  - **Stats Cards**: Teachers → Students → Schools (RTL order)
  - **Add School Button**: Positioned on RIGHT side (correct for RTL)
  - Global search (name, code, phone, principal)
  - Advanced filters (status, city, stage, type)
  - Grid/Table view toggle
  - Bulk actions support

### ✅ Phase 5: User Creation Wizard with RBAC (Completed & Fixed - March 2026)
- **معالج إنشاء حساب مستخدم (All P0 Fixes Verified)**:
  - **8 Roles Available**:
    1. مدير المنصة (Platform Admin) - NEW
    2. مدير العمليات التشغيلية
    3. مسؤول الإدارة التقنية
    4. مسؤول دعم المستخدمين
    5. محلل بيانات المنصة
    6. مسؤول أمن المنصة
    7. حساب اختبار
    8. معلم
  - **Role-Specific Permissions**:
    - Platform Admin: 11 permissions
    - Operations Manager: 6 permissions
    - Technical Admin: 6 permissions
    - Support Specialist: 5 permissions
    - Data Analyst: 4 permissions
    - Security Officer: 5 permissions
    - Testing Account: 2 permissions
    - Teacher: 11 permissions
  - **Validation Fixed**: Next button disabled until required fields filled
  - **Email Validation**: Proper email format check added

### ✅ Phase 6: Sidebar UI Improvements (Completed - March 2026)
- **Sidebar Enhancements**:
  - **Logo with Rounded Corners**: rounded-xl class applied
  - **Collapsed State**: Shows user name (first name) and role under logo
  - **Smooth Transitions**: Animation on collapse/expand

### ✅ Phase 7: Users Management Page (Completed - March 2026)
- **صفحة إدارة المستخدمين الشاملة**:
  - 6 Statistics Cards
  - User Cards with Visible Action Buttons
  - Integrated Teacher Requests Tab
  - Advanced Filters & Search
  - RTL Layout

---

## API Endpoints

### User Management
- `POST /api/users/create` - Create platform user (admin, teacher)
- `GET /api/users/platform-users` - List platform users with filters
- `DELETE /api/users/{user_id}` - Soft delete user
- `PATCH /api/users/{user_id}/status` - Update user status

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

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

### P0 - Critical (ALL COMPLETED ✅)
- [x] Mobile-First Responsive Design
- [x] Tenants Management Page (Card Layout)
- [x] User Creation Wizard with RBAC
- [x] Platform Admin role option
- [x] Role-specific permissions display
- [x] Next button validation
- [x] Sidebar logo rounded corners
- [x] Sidebar collapsed user info

### P1 - High Priority (NEXT)
- [ ] **User Card Action Buttons**:
  - View User: Full profile page with activity logs
  - Suspend User: With confirmation modal
  - Edit User: Edit form
  - Delete User: Soft delete (archive)
  - Send Notification: Modal with notification options
- [ ] Force Password Change on First Login UI
- [ ] Teacher Dashboard enhancements
- [ ] School Principal Dashboard

### P2 - Medium Priority
- [ ] **Global Rules Management Page**: Central page for platform rules
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
- `/app/test_reports/iteration_22.json` - Users Management tests
- `/app/test_reports/iteration_23.json` - P0 bug fixes verification (ALL PASSED)

## Test Credentials
- **Platform Admin**: info@nassaqapp.com / NassaqAdmin2026!##$$HBJ
- **Teacher**: teacher@nassaq.com / NassaqTeacher2026

---

## Last Updated: March 9, 2026

### Latest Changes (P0 Fixes):
1. **Schools Management Card Layout** ✅
   - Route changed to use TenantsManagement
   - 6 school cards in responsive grid

2. **Sidebar UI Improvements** ✅
   - Logo with rounded-xl corners
   - User name/role visible when collapsed

3. **CreateUserWizard Fixes** ✅
   - Platform Admin role added
   - All 8 roles with permissions
   - Next button validation working
   - Email format validation added

### Test Results (iteration_23.json):
- ✅ Schools card layout verified
- ✅ Sidebar logo rounded corners verified
- ✅ Collapsed sidebar user info verified
- ✅ Wizard validation verified
- ✅ Platform Admin with 11 permissions verified
- ✅ All 8 roles available verified
