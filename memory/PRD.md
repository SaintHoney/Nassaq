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

## 👥 User Personas (9 أدوار)

| Role | Arabic | Description |
|------|--------|-------------|
| Platform Admin | مدير المنصة | إدارة المنصة بالكامل، المدارس، المستخدمين، القواعد |
| Ministry Representative | ممثل الوزارة | مراقبة وتحليل على مستوى المدارس والإدارات التعليمية |
| School Principal | مدير المدرسة | المسؤول التنفيذي عن إدارة المدرسة |
| School Sub Admin | المسؤول الإداري | الدعم الإداري لمدير المدرسة |
| Teacher | المعلم | المشاركة في العملية التعليمية |
| Student | الطالب | المستفيد من المنصة |
| Parent/Guardian | ولي الأمر | متابعة تقدم الأبناء |
| Driver | السائق | تشغيل خدمات النقل المدرسي |
| Gatekeeper | مسؤول البوابة | إدارة عمليات الدخول والخروج |

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

### December 2026 - Latest Updates

#### Hero Section Updates ✅ (NEW)
- [x] **Platform Name Under Logo:**
  - Arabic: نَسَّق
  - English: NASSAQ
  
- [x] **Traction / Platform Impact Block:**
  - +200 مدرسة / Schools
  - +50,000 طالب / Students
  - +100,000 ولي أمر / Parents
  - +3,000 معلم ومعلمة / Teachers
  - 24/7 Support Badge
  
- [x] **Demo Data Seeded:**
  - 200 schools created
  - 50,000 students created
  - 3,061 teachers created
  - 9,440 classes created
  - 904 subjects created

#### Landing Page (صفحة الهبوط) ✅
- [x] **Hero Section:**
  - شعار نَسَّق (NASSAQ Logo)
  - اسم المنصة تحت الشعار
  - AI Icon متحرك (Sparkles)
  - حكيم كـ Avatar دائري صغير مع فقاعة حوار
  - "من البيانات إلى القرار"
  - قسم الأثر والانتشار (Traction)
  - زر "الدخول إلى المنصة"
  
- [x] **Header:** غير ثابت أثناء التمرير (NOT Sticky)
  
- [x] **Section 2: رحلة المدرسة نحو النظام الذكي**
  - يتحرك تلقائياً كل 2 ثانية (Auto-rotate Loop)
  - 4 خطوات: الواقع اليومي، جمع البيانات، التحليل، اتخاذ القرار
  
- [x] **Section 3: الذكاء الاصطناعي داخل نَسَّق**
  - 4 قدرات: البيانات تتحدث، تحليل الطلاب، الجداول الذكية، التقارير الذكية
  
- [x] **Section 4: عندما يعمل الجميع داخل نظام واحد**
  - 4 أدوار: مدير المدرسة، المعلم، الطالب، ولي الأمر
  
- [x] **Call To Action Section**
- [x] **Footer**

#### Login & Register Pages ✅
- [x] تصميم عمودين (Visual/Brand + Form)
- [x] دعم ثنائي اللغة (AR/EN)
- [x] Multi-Step Registration Flow (4 خطوات)

#### Platform Control Dashboard ✅
- [x] **Global Analytics:** بطاقات KPI متصلة بالـ API
- [x] **Daily Platform Activity:** بطاقات النشاط اليومي
- [x] **Quick Actions:** أزرار الإجراءات السريعة
- [x] **AI Operations Panel:** عمليات الذكاء الاصطناعي
- [x] **Schools Table:** جدول المدارس مع البحث والفلاتر

#### Management Pages ✅
- [x] **Teachers Page:** Full CRUD
- [x] **Students Page:** Full CRUD
- [x] **Classes Page:** Full CRUD
- [x] **Subjects Page:** Full CRUD

#### Language System ✅
- [x] **Full System Language Toggle:** يعمل على مستوى النظام بالكامل
- [x] **RTL/LTR Switch:** تغيير اتجاه النظام
- [x] **Persistent Language:** تخزين اللغة في localStorage

---

## 📊 Live Dashboard Statistics

| Metric | Count |
|--------|-------|
| Total Schools | 200 |
| Active Schools | 137 |
| Pending Schools | 63 |
| Total Students | 50,000 |
| Total Teachers | 3,061 |
| Total Classes | 9,440 |
| Total Subjects | 904 |
| Total Users | 3,063 |
| Active Users | 3,062 |

---

## 📋 Prioritized Backlog

### P0 - Completed ✅
- ✅ Landing Page مع Hero Section و Traction Block
- ✅ Login Page 
- ✅ Register Page متعدد الخطوات
- ✅ Platform Control Dashboard (مركز القيادة)
- ✅ Management Pages (Teachers, Students, Classes, Subjects)
- ✅ Language System (AR/EN, RTL/LTR)
- ✅ Demo Data Seeding

### P1 - Next (Phase 2 Completion)
- [ ] User Identity Graph Engine (محرك هوية المستخدم)
- [ ] Teacher Invite Engine (نظام دعوة المعلمين)
- [ ] Role Permissions Matrix Implementation (مصفوفة الصلاحيات)
- [ ] Security & Compliance Features (الأمان والامتثال)
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
- [ ] Notifications System

---

## 🔧 Technical Stack
- **Backend:** FastAPI, MongoDB, JWT, bcrypt, emergentintegrations
- **Frontend:** React, Tailwind CSS, Shadcn UI, React Router
- **AI:** OpenAI GPT-5.2 via Emergent LLM Key (planned)
- **Languages:** Arabic (primary), English
- **Architecture:** Multi-Tenant Architecture

---

## 🔑 Credentials

### Platform Admin
- **Email:** `info@nassaqapp.com`
- **Password:** `NassaqAdmin2026!##$$HBJ`

---

## 📁 Project Structure
```
/app
├── backend/
│   ├── .env
│   ├── requirements.txt
│   └── server.py
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx (Hero + Traction + 4 sections)
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── TeachersPage.jsx
│       │   ├── StudentsPage.jsx
│       │   ├── ClassesPage.jsx
│       │   └── SubjectsPage.jsx
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
    └── iteration_6.json
```

---

## 📊 Test Results (Iteration 6)
- **Backend:** 100% - All API tests passed
- **Frontend:** 100% - All UI features working correctly

---

## 📝 Last Update: December 2026

### Completed This Session:
1. ✅ Added platform name under logo in Hero Section
2. ✅ Added Traction/Platform Impact block with 4 stats cards
3. ✅ Added 24/7 Support Badge
4. ✅ Created demo data seeding API
5. ✅ Seeded database with 200 schools, 50K students, 3K teachers
6. ✅ All tests passed (Iteration 6)

---

## 🔜 Next Tasks (P1)
- [ ] User Identity Graph Engine Implementation
- [ ] Teacher Invite Engine with Referral System
- [ ] Role Permissions Matrix for 9 user roles
- [ ] Security Control Center
- [ ] Audit Logging System

## 📋 Future Tasks (P2-P3)
- [ ] **Phase 3:** العمليات الأكاديمية (الحضور، الواجبات، الدرجات، الجدول)
- [ ] **Phase 4:** طبقة الذكاء الاصطناعي (تحليل الطلاب، التوصيات)
- [ ] **Phase 5:** الوحدات المتقدمة (النقل، الإشعارات، التحليلات المتقدمة)
