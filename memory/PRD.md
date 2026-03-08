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
- Modern Enterprise SaaS UI
- دعم RTL و LTR بالكامل
- Responsive Design
- Light Mode + Dark Mode

---

## ✅ What's Been Implemented

### December 2026 - Phase 1.6 (UI Refinement)

#### Landing Page (صفحة الهبوط) ✅
- [x] **Hero Section:**
  - شعار نَسَّق (NASSAQ Logo) بدلاً من صورة حكيم الكبيرة
  - AI Icon متحرك (Sparkles)
  - حكيم كـ Avatar دائري صغير مع فقاعة حوار
  - "من البيانات إلى القرار"
  - زر "الدخول إلى المنصة"
  
- [x] **Header:** غير ثابت أثناء التمرير (NOT Sticky)
  
- [x] **Section 2: رحلة المدرسة نحو النظام الذكي**
  - يتحرك تلقائياً كل 2 ثانية (Auto-rotate Loop)
  - 4 خطوات: الواقع اليومي، جمع البيانات، التحليل، اتخاذ القرار
  - بدون أرقام الخطوات - العنوان والمحتوى والأيقونات فقط
  - Progress dots للتتبع البصري
  - لا يتطلب تفاعل المستخدم
  
- [x] **Section 3: الذكاء الاصطناعي داخل نَسَّق**
  - يتحرك تلقائياً كل 2 ثانية (Auto-rotate Loop)
  - 4 قدرات: البيانات تتحدث، تحليل الطلاب، الجداول الذكية، التقارير الذكية
  - لا يتطلب تفاعل المستخدم
  
- [x] **Section 4: عندما يعمل الجميع داخل نظام واحد**
  - يتحرك تلقائياً كل 2 ثانية (Auto-rotate Loop)
  - 4 أدوار: مدير المدرسة، المعلم، الطالب، ولي الأمر
  - بطاقات الأدوار تتغير مع المحتوى
  - لا يتطلب تفاعل المستخدم
  
- [x] **Call To Action Section**
  - حكيم كـ Avatar صغير بجانب النص (Inline)
  - نص حكيم في سطر واحد بجانب الصورة
  
- [x] **Footer**
  - © 2026 NASSAQ. All rights reserved.
  - عنصر المستقبل - يوفاي في اس (العربية)
  - Future Element & UVAII VS (الإنجليزية)

#### Login Page (صفحة تسجيل الدخول) ✅
- [x] تصميم عمودين (Visual/Brand + Login Form)
- [x] الجانب البصري: الشعار + "نَسَّق" + "من البيانات إلى القرار" (بدون صورة حكيم)
- [x] زر العودة للموقع
- [x] زر تبديل اللغة (AR/EN)
- [x] نموذج تسجيل الدخول كامل

#### Register Page (صفحة التسجيل) ✅
- [x] تصميم عمودين مع صورة حكيم الجديدة كـ Avatar
- [x] Multi-Step Registration Flow (4 خطوات)
- [x] التسجيل يُنشئ طلب للمراجعة من قبل Admin

#### Platform Control Dashboard (مركز القيادة) ✅
- [x] **Section 1: التحليلات العامة (Global Analytics)**
  - 6 بطاقات KPI: المدارس، الطلاب، المعلمين، المستخدمون النشطون، المدارس النشطة، طلبات التسجيل المعلقة
  - فلتر الفترة الزمنية (اليوم، الأسبوع، الشهر، السنة)
  - مؤشرات النمو (+%)
  
- [x] **Section 2: نشاط المنصة اليومي (Daily Platform Activity)**
  - 4 بطاقات: الحصص المنعقدة، سجلات الحضور، الدرجات المسجلة، المستخدمون النشطون
  - Progress bars لكل بطاقة
  - مؤشرات التغيير اليومي
  - Badge "مباشر" (Live)
  
- [x] **Section 3: الإجراءات السريعة (Quick Actions)**
  - 4 أزرار: إضافة مدرسة، إنشاء مستخدم، إنشاء فصل، الإعدادات
  - أيقونات كبيرة ملونة
  - Hover effects
  
- [x] **Section 4: لوحة عمليات الذكاء الاصطناعي (Quick AI Operations Panel)**
  - صورة حكيم في الرأس
  - 4 عمليات: فحص تشخيصي للمنصة، فحص جودة البيانات، تحليل عمليات الاستيراد، إنشاء ملخص تنفيذي
  - Toast notifications للعمليات
  
- [x] **جدول المدارس**
  - إضافة مدرسة جديدة (Dialog)
  - البحث
  - تغيير الحالة

#### Hakim Character (شخصية حكيم) ✅
- [x] صورة حكيم الجديدة: HAKIM 1.png
- [x] ظهور كـ Avatar دائري صغير (بدون خلفية)
- [x] فقاعات محادثة (Chat Bubbles) بجانب الصورة
- [x] Interactive Floating Assistant

---

## 📋 Prioritized Backlog

### P0 - Completed ✅
- ✅ Landing Page مع الأقسام المتحركة تلقائياً
- ✅ Login Page بدون صورة حكيم
- ✅ Register Page متعدد الخطوات
- ✅ Platform Control Dashboard (مركز القيادة)

### P1 - Next (Phase 2 - Core School System)
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
│       │   ├── LandingPage.jsx (Hero + 4 sections + Footer)
│       │   ├── LoginPage.jsx (No Hakim image)
│       │   ├── RegisterPage.jsx (Multi-step)
│       │   ├── AdminDashboard.jsx (Platform Control Center)
│       │   └── SchoolDashboard.jsx
│       ├── components/
│       │   ├── hakim/
│       │   │   └── HakimAssistant.jsx (New image)
│       │   ├── layout/
│       │   │   ├── Footer.jsx (New text)
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
    ├── iteration_2.json
    └── iteration_3.json
```

---

## 📊 Test Results
- **Backend:** 100% - All 18 API tests passed
- **Frontend:** 100% - All UI components working correctly

---

## 📝 Last Update: December 2026
تم تنفيذ جميع التعديلات المطلوبة:
- Hero Section مع الشعار بدلاً من حكيم
- الأقسام تتحرك تلقائياً بدون تفاعل المستخدم
- Header غير ثابت أثناء التمرير
- Login بدون صورة حكيم
- Platform Control Dashboard (مركز القيادة) كامل
- Footer مع النص الجديد
