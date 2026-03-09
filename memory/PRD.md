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

### ✅ Phase 4: Tenants Management Page (Completed & Fixed - March 2026)
- **صفحة إدارة المدارس (Updated with RTL Fix)**:
  - **RTL Layout Fixed**: Add School button on RIGHT side
  - **Combined Statistics Card**: All school statuses in one card (نشطة, إعداد, موقوفة, منتهية)
  - **Stats Cards Reordered**: Teachers → Students → Schools (RTL order)
  - **6-Column Grid Layout**: Premium card layout (2xl:grid-cols-6)
  - **Larger Add School Button**: px-6 py-6 text-lg shadow-lg styling
  - Global search (name, code, phone, principal)
  - Advanced filters (status, city, stage, type)
  - Grid/Table view toggle
  - Bulk actions support

### ✅ Phase 5: User Creation Wizard with RBAC (Completed - March 2026)
- **معالج إنشاء حساب مستخدم (Connected to Real API)**:
  - **Backend API**: `/api/users/create` endpoint working
  - **Step 1 - Role Selection**: 7 roles available
  - **Step 2 - User Data (Teacher)**: Region, City, Educational Department, School Names
  - **Step 3 - Permissions**: 11 teacher permissions
  - **Step 4 - Password**: Auto-generated secure temporary password
  - **Step 5 - Success**: Copy credentials and welcome message

### ✅ Phase 6: Users Management Page (Completed - March 2026)
- **صفحة إدارة المستخدمين الشاملة (NEW)**:
  - **6 Statistics Cards**:
    - إجمالي المستخدمين (Total Users)
    - إجمالي المدارس (Total Schools)
    - معلمين داخل المدارس (Teachers in Schools)
    - معلمين مستقلين (Independent Teachers)
    - حسابات المنصة (Platform Accounts)
    - طلبات معلقة (Pending Requests)
  - **User Cards with Visible Action Buttons**:
    - عرض (View) - Opens user details dialog
    - تعليق (Suspend) - Toggles account status
    - تعديل (Edit) - Opens edit form
    - حذف (Delete) - Soft delete (archive)
    - إشعار (Notify) - Send notification
  - **Integrated Teacher Requests Tab**:
    - Shows pending teacher account requests
    - Request details: name, ID, phone, email, subject, education level, school
    - Actions: موافقة (Approve), رفض (Reject), طلب معلومات (Request Info)
    - Approval creates Teacher ID, QR Code, and temp credentials
  - **Advanced Filters**: Account type, role, status, AI status
  - **Search**: Name, email, phone, school
  - **RTL Layout**: Full Arabic support

### ✅ Phase 7: Force Password Change Flow (Completed - March 2026)
- **تغيير كلمة المرور الإجباري**:
  - Backend endpoint: `/api/auth/change-password`
  - `must_change_password` flag in user model
  - Password validation rules (8+ chars, uppercase, lowercase, number, special)
  - Redirect to password change page on first login

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

### Registration Requests
- `POST /api/registration-requests` - Create registration request
- `GET /api/registration-requests` - List requests (admin)
- `PUT /api/registration-requests/{id}/status` - Update request status

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
- [x] Tenants Management Page (RTL Fixed)
- [x] User Creation Wizard with RBAC
- [x] Connect User Creation to Backend API
- [x] **Users Management Page (Complete)**
- [x] **Teacher Requests Integration**

### P1 - High Priority
- [x] First-time login password change flow
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
- `/app/test_reports/iteration_21.json` - User creation API tests
- `/app/test_reports/iteration_22.json` - Users Management & RTL tests (14/14 passed)

## Test Credentials
- **Platform Admin**: info@nassaqapp.com / NassaqAdmin2026!##$$HBJ
- **Teacher**: teacher@nassaq.com / NassaqTeacher2026

---

## Last Updated: March 9, 2026

### Latest Changes:
1. **Fixed RTL Layout on TenantsManagement**:
   - Add School button now on RIGHT side (correct for RTL)
   - Stats cards reordered: Teachers → Students → Schools
   - Combined stats card with RTL-ordered statuses

2. **Built Comprehensive UsersManagement Page**:
   - 6 statistics cards showing all user metrics
   - User cards with 5 visible action buttons
   - Integrated Teacher Requests tab
   - Advanced filtering and search
   - Full RTL Arabic layout

3. **All Tests Passing (100% success rate)**
