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

### ✅ Phase 4: Tenants Management Page (Completed & Enhanced - March 9, 2026)
- **صفحة إدارة المدارس (Redesigned)**:
  - **2-Column Grid Layout**: School cards displayed 2 per row
  - **Fixed Card Size**: All cards have uniform 280px height
  - **Interactive Stats Card**: Click on status (Active, Suspended, Setup, Expired) to filter
  - **Stats Cards**: Teachers → Students → Total Schools (RTL order)
  - **Suspend Toggle**: Per-school suspension control
  - **AI Toggle**: Per-school AI features control
  - **Full Localization**: Arabic/English support based on user language
  - Global search (name, code, phone, principal)
  - Advanced filters (status, city, stage, type, AI status)
  - Grid/Table view toggle
  - Bulk actions support (enable AI, export, suspend)

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

### ✅ Phase 8: P1 Features (Completed - March 9, 2026)
- **PageHeader Component**:
  - Automatic icon mapping based on route
  - Arabic/English title support
  - Consistent styling across all pages
  
- **صفحة تفاصيل المستخدم (UserDetailsPage) - ENHANCED**:
  - ✅ زر العودة إلى إدارة المستخدمين (Back button)
  - ✅ تعديل الصلاحيات (Permissions editing)
  - ✅ نموذج تعديل البيانات (الاسم عربي/إنجليزي، البريد، الهاتف، المنطقة، المدينة، إدارة التعليم)
  - ✅ إعادة تعيين كلمة المرور مع رسالة ترحيبية قابلة للنسخ
  - ✅ رفع صورة المستخدم (Base64)
  - ✅ عرض اسم منشئ الحساب (قابل للنقر)
  - ✅ أزرار الإجراءات بالألوان المناسبة:
    - تعديل (أزرق)
    - إعادة تعيين كلمة المرور (بنفسجي)
    - إرسال إشعار (أخضر)
    - تعليق الحساب (برتقالي)
    - حذف الحساب (أحمر)
  
- **صفحة إدارة القواعد (RulesManagementPage)**:
  - 8 Rule Categories (Attendance, Grading, Scheduling, Behavior, Academic, Tenant, Security, AI)
  - CRUD operations with dialogs/sheets
  - Multiple rule types (Numeric, Percentage, Boolean, List, Text)
  - Priority levels (High, Medium, Low)
  - Status management (Active, Draft, Disabled)
  - Search and filter functionality
  - Grid/List view toggle
  
- **صفحة مراقبة النظام (SystemMonitoringPage)**:
  - Real-time system health indicator (Healthy/Warning/Critical)
  - Resource monitoring (CPU, Memory, Disk, Network)
  - Performance charts with Recharts
  - API performance metrics
  - Database performance metrics
  - Background jobs monitoring
  - Integrations status
  - AI status
  - 4 tabs: Overview, Details, Alerts, Tools
  - 8 Tools: View Logs, Monitor APIs, Monitor Jobs, Restart Service, Re-Sync, Escalate Alert, Download Report, AI Diagnosis
  - Auto-refresh toggle

### ✅ Phase 9: Analytics & Integrations (Completed - March 9, 2026)
- **صفحة التقارير والتحليلات (PlatformAnalyticsPage)**:
  - Overview with 4 Stats Cards (Schools, Students, Teachers, Active Users)
  - 10 Report Categories:
    1. تقارير المدارس (School Reports)
    2. تقارير الطلاب (Student Reports)
    3. تقارير المعلمين (Teacher Reports)
    4. الأداء الأكاديمي (Academic Performance)
    5. تقارير الحضور (Attendance Reports)
    6. تقارير السلوك (Behavior Reports)
    7. تقارير الاشتراكات (Subscription Reports)
    8. استخدام المنصة (Platform Usage)
    9. تقارير AI (AI Reports)
    10. مؤشرات تنمية القدرات (HCD Indicators)
  - Interactive Charts: Area, Pie, Bar, Radar (using Recharts)
  - AI Insights Panel with 4 insight types (trend, alert, recommendation)
  - AI Report Builder dialog
  - Scheduled Reports management
  - Filters (School, City, Stage, Period)
  - Export options (PDF, Excel, CSV)
  - 4 Tabs: Overview, Reports, AI Insights, Tools
  
- **صفحة التكاملات (IntegrationsPage)**:
  - 7 Integration Types:
    1. حكومية (Government) - نظام نور
    2. مدفوعات (Payment) - Stripe
    3. رسائل SMS - يسّر
    4. بريد إلكتروني (Email) - SendGrid
    5. تخزين (Storage) - Amazon S3
    6. ذكاء اصطناعي (AI) - OpenAI
    7. أخرى (Other)
  - Stats Cards (Total, Active, Pending, Error)
  - Integration Cards with:
    - Type icon and color badge
    - Status badge (Active/Inactive/Pending/Error)
    - API URL display
    - Last sync time
    - Toggle switch
    - 4 Action buttons (Test, Sync, Edit, Delete)
    - View Logs button
  - Add Integration dialog
  - Edit Integration sheet
  - Logs sheet
  - Delete confirmation dialog
  - Search and filter by type

---

## API Endpoints

### User Management
- `POST /api/users/create` - Create platform user (admin, teacher)
- `GET /api/users/platform-users` - List platform users with filters
- `GET /api/users/{user_id}` - Get user details by ID
- `PUT /api/users/{user_id}` - Update user information
- `PUT /api/users/{user_id}/permissions` - Update user permissions
- `POST /api/users/{user_id}/reset-password` - Reset user password
- `POST /api/users/{user_id}/suspend` - Toggle user suspension
- `POST /api/users/{user_id}/notify` - Send notification to user
- `POST /api/users/{user_id}/upload-image` - Upload user avatar
- `GET /api/users/{user_id}/activity` - Get user activity logs
- `DELETE /api/users/{user_id}` - Soft delete user

### Integrations Management
- `GET /api/integrations` - List all integrations
- `POST /api/integrations` - Create new integration
- `GET /api/integrations/{id}` - Get integration details
- `PUT /api/integrations/{id}` - Update integration
- `POST /api/integrations/{id}/toggle` - Enable/disable integration
- `POST /api/integrations/{id}/test` - Test integration connection
- `POST /api/integrations/{id}/sync` - Trigger data sync
- `GET /api/integrations/{id}/logs` - Get sync logs
- `DELETE /api/integrations/{id}` - Delete integration

### Analytics
- `GET /api/analytics/overview` - Get platform analytics overview
- `GET /api/analytics/reports` - Get available reports
- `GET /api/analytics/insights` - Get AI-generated insights

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
- [x] Tenants Management Page (Card Layout) - ENHANCED with 2-column grid, toggles, localization
- [x] User Creation Wizard with RBAC - Fixed API path /api/users/create
- [x] Platform Admin role option - Added to allowed_roles in backend
- [x] Role-specific permissions display
- [x] Next button validation
- [x] Sidebar logo rounded corners
- [x] Sidebar collapsed user info
- [x] User Card Action Buttons (View, Suspend, Edit, Delete, Notify) - Implemented in UsersManagement
- [x] Interactive Tenant Stats Card - Click to filter schools by status
- [x] School Suspend/AI Toggles - Per-school controls added

### P1 - High Priority (ALL COMPLETED ✅ - March 9, 2026)
- [x] Remove standalone Teacher Requests page - Route removed, tab preserved in UsersManagement
- [x] Add page title icons - PageHeader component created with icon mapping
- [x] Force Password Change on First Login UI - Already existed at /app/frontend/src/pages/ForcePasswordChange.jsx
- [x] User Profile/Details page - UserDetailsPage with tabs (overview, permissions, activity)
- [x] Rules Management Page - Full CRUD with categories, priorities, status
- [x] System Monitoring Dashboard - Real-time metrics, charts, jobs, integrations, AI status

### P2 - Medium Priority (NEXT)
- [ ] Connect PlatformAnalyticsPage to real database data
- [ ] Connect SystemMonitoringPage to real system metrics
- [ ] Connect RulesManagementPage to backend
- [ ] Teacher Dashboard enhancements
- [ ] School Principal Dashboard
- [ ] Parent Dashboard
- [ ] Student Dashboard
- [ ] AI Hakim Assistant backend integration
- [ ] Notification Engine (SMS/Email)

### P3 - Low Priority
- [ ] PDF Reports generation
- [ ] Data import/export
- [ ] Audit logs UI
- [ ] Force Password Change backend logic

---

## Test Reports
- `/app/test_reports/iteration_22.json` - Users Management tests
- `/app/test_reports/iteration_23.json` - P0 bug fixes verification (ALL PASSED)
- `/app/test_reports/iteration_24.json` - User creation, TenantsManagement enhancements
- `/app/test_reports/iteration_25.json` - P1 features: Rules, Monitoring, UserDetails (ALL PASSED)
- `/app/test_reports/iteration_26.json` - UserDetails enhancements, Analytics, Integrations (100% PASSED)

## Test Credentials
- **Platform Admin**: info@nassaqapp.com / NassaqAdmin2026!##$$HBJ
- **Teacher**: teacher@nassaq.com / NassaqTeacher2026

---

## Last Updated: March 9, 2026

### Latest Changes (March 9, 2026 - Phase 9):
1. **UserDetailsPage Enhancements** ✅
   - Back button to return to Users Management
   - Edit form with Arabic/English name fields
   - Password reset with welcome message template
   - Image upload support (Base64)
   - Creator name display with clickable link
   - Redesigned action buttons with correct colors
   - Backend APIs: GET/PUT user, permissions, reset-password, suspend, notify, upload-image

2. **PlatformAnalyticsPage** ✅
   - 10 Report Categories
   - Interactive Charts (Recharts)
   - AI Insights Panel
   - AI Report Builder
   - Scheduled Reports
   - Filters & Export
   - Backend APIs: overview, reports, insights

3. **IntegrationsPage** ✅
   - 7 Integration Types
   - CRUD operations
   - Test Connection & Sync
   - Logs viewer
   - Backend APIs: full CRUD + toggle, test, sync, logs

### Test Results (iteration_26.json):
- ✅ Backend: 100% (21/21 tests passed)
- ✅ Frontend: 100% (all features working)
- ✅ UserDetailsPage: Back button, edit form, reset password, action buttons, creator name
- ✅ IntegrationsPage: Page load, add/edit/delete, toggle, test, sync
- ✅ PlatformAnalyticsPage: Charts, stats, AI builder, tabs, filters
