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

---

## 🎨 Design System

### Colors
- **Primary Blue:** `#1C3D74`
- **Purple:** `#615090`
- **Turquoise:** `#46C1BE`
- **Neutral Black:** `#312E2F`
- **Light Gray:** `#EAECED`

### Fonts
- **Headings:** Cairo
- **Body:** Tajawal

### UI Rules
- Curved Corners / Rounded Cards على جميع العناصر
- Modern SaaS Dashboard Style
- دعم RTL و LTR بالكامل
- Responsive Design

---

## ✅ What's Been Implemented

### December 2026 - Phase 1.5 (New UI Implementation)

#### Landing Page (صفحة الهبوط) ✅
- [x] **Hero Section:**
  - عنوان "نَسَّق" مع شعار "من البيانات إلى القرار"
  - شخصية حكيم التفاعلية مع فقاعات الحوار المتغيرة
  - إحصائيات الاستخدام (+200 مدرسة، +50,000 طالب، إلخ)
  - زر "الدخول إلى المنصة"
  
- [x] **Section 2: رحلة المدرسة نحو النظام الذكي**
  - Timeline تفاعلي بـ 4 خطوات
  - الواقع اليومي للمدرسة
  - جمع البيانات داخل نَسَّق
  - تحليل البيانات بالذكاء الاصطناعي
  - اتخاذ القرار
  
- [x] **Section 3: الذكاء الاصطناعي داخل نَسَّق**
  - عندما تبدأ البيانات بالتحدث
  - تحليل أداء الطلاب
  - الجداول الدراسية الذكية
  - التقارير التعليمية الذكية
  
- [x] **Section 4: عندما يعمل الجميع داخل نظام واحد**
  - مدير المدرسة
  - المعلم
  - الطالب
  - ولي الأمر
  
- [x] **Call To Action Section**
- [x] **Footer**
- [x] إزالة قسم "ماذا يقول عملاؤنا"
- [x] إزالة قسم "خطط الأسعار"

#### Login Page (صفحة تسجيل الدخول) ✅
- [x] تصميم عمودين (Visual/Brand + Login Form)
- [x] الجانب البصري: الشعار + "من البيانات إلى القرار" + شخصية حكيم
- [x] زر العودة للموقع
- [x] زر تبديل اللغة (AR/EN)
- [x] نموذج تسجيل الدخول:
  - البريد الإلكتروني
  - كلمة المرور (مع إظهار/إخفاء)
  - خيار "تذكرني"
  - رابط "نسيت كلمة المرور"
  - رابط "تسجيل جديد"
- [x] التحقق من البيانات (Validation)
- [x] حالات التحميل والأخطاء

#### Register Page (صفحة التسجيل) ✅
- [x] تصميم عمودين مماثل لصفحة الدخول
- [x] Multi-Step Registration Flow (4 خطوات):
  - **الخطوة 1:** البيانات الأساسية (الاسم الكامل، رقم الهاتف)
  - **الخطوة 2:** سياسة الخصوصية (الموافقة على الشروط)
  - **الخطوة 3:** اختيار نوع الحساب (مدرسة جديدة / معلم)
  - **الخطوة 4:** استكمال البيانات حسب نوع الحساب
- [x] مؤشرات الخطوات (Step Indicators)
- [x] أزرار التنقل (التالي/السابق)
- [x] التسجيل يُنشئ طلب للمراجعة من قبل Admin (لا يُنشئ الحساب مباشرة)

#### Backend (FastAPI + MongoDB) ✅
- [x] JWT Authentication with RBAC
- [x] حساب Platform Admin جديد:
  - Email: `info@nassaqapp.com`
  - Password: `NassaqAdmin2026!##$$HBJ`
- [x] API: `/api/registration-requests` لإدارة طلبات التسجيل
- [x] API: `/api/schools` لإدارة المدارس
- [x] API: `/api/hakim/chat` للمساعد الذكي
- [x] Dashboard statistics endpoint

#### Platform Admin Dashboard ✅
- [x] لوحة تحكم المنصة (مركز القيادة)
- [x] بطاقات الإحصائيات (المدارس، الطلاب، المعلمين)
- [x] قائمة المدارس مع البحث
- [x] إضافة مدرسة جديدة
- [x] تغيير حالة المدرسة

---

## 📋 Prioritized Backlog

### P0 - Critical (الأولوية القصوى)
- [ ] تحسين لوحة تحكم المدير مع:
  - Global Analytics (KPI cards with filters)
  - Daily Platform Activity (Real-time charts)
  - Quick Actions Panel
  - Quick AI Operations Panel

### P1 - Important (Phase 2 - Core School System)
- [ ] Teachers Management (CRUD, profiles, assignments)
- [ ] Students Management (CRUD, profiles, enrollment)
- [ ] Classes Management (create, assign teachers/students)
- [ ] Subjects Management (curriculum, assignments)
- [ ] Parent Accounts (link to students)
- [ ] Basic Reporting (PDF export)

### P2 - Nice to Have (Phase 3 - Academic Operations)
- [ ] Attendance System (daily, class-based)
- [ ] Assignments System (create, submit, grade)
- [ ] Grading System (marks, GPA, report cards)
- [ ] Scheduling Engine (timetable generation)
- [ ] Academic Analytics Dashboard

### P3 - Future (Phase 4 & 5)
- [ ] AI Student Analysis
- [ ] AI Educational Insights
- [ ] Transport Management
- [ ] Gate Management
- [ ] Ministry Dashboard

---

## 🔑 Credentials

### Platform Admin
- **Email:** `info@nassaqapp.com`
- **Password:** `NassaqAdmin2026!##$$HBJ`

---

## 🔧 Technical Stack
- **Backend:** FastAPI, MongoDB, JWT, bcrypt, emergentintegrations
- **Frontend:** React, Tailwind CSS, Shadcn UI, React Router
- **AI:** OpenAI GPT-5.2 via Emergent LLM Key
- **Languages:** Arabic (primary), English

---

## 📁 Project Structure
```
/app
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py
│   └── tests/
│       └── test_nassaq_api.py
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── SchoolDashboard.jsx
│       ├── components/
│       │   ├── hakim/
│       │   │   └── HakimAssistant.jsx
│       │   ├── layout/
│       │   │   ├── Footer.jsx
│       │   │   ├── Navbar.jsx
│       │   │   └── Sidebar.jsx
│       │   └── ui/
│       └── contexts/
│           ├── AuthContext.js
│           └── ThemeContext.js
├── memory/
│   └── PRD.md
└── test_reports/
    ├── iteration_1.json
    └── iteration_2.json
```

---

## 📊 Test Results
- **Backend:** 100% - All 18 API tests passed
- **Frontend:** 100% - All UI components working correctly

---

## 📝 Last Update: December 2026
تم تنفيذ صفحات Landing، Login، Register الجديدة بالكامل حسب المواصفات المطلوبة.
