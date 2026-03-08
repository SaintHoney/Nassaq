# NASSAQ (نَسَّق) - نظام إدارة المدارس الذكي
## AI-Powered Multi-Tenant School Management System

---

## 📋 المتطلبات الأساسية (Original Requirements)

### رؤية المنصة
منصة تعليمية ذكية متعددة الأطراف (Multi-Stakeholder AI-Driven Platform) لإدارة المدارس في المملكة العربية السعودية.

### الأدوار التسعة في النظام
1. **Platform Admin** - مدير المنصة (أعلى مستوى إداري)
2. **Ministry Representative** - ممثل الوزارة
3. **School Principal** - مدير المدرسة
4. **School Sub Admin** - المسؤول الإداري
5. **Teacher** - المعلم
6. **Student** - الطالب
7. **Parent/Guardian** - ولي الأمر
8. **Driver** - السائق
9. **Gatekeeper** - مسؤول البوابة

### رتب المعلمين
| الرتبة | النصاب الأدنى | النصاب الأقصى | الحد اليومي |
|--------|---------------|---------------|-------------|
| معلم خبير | 12 | 18 | 4 حصص |
| معلم متقدم | 16 | 20 | 5 حصص |
| معلم ممارس | 18 | 24 | 6 حصص |
| معلم مساعد | 20 | 26 | 7 حصص |

---

## ✅ ما تم إنجازه

### المرحلة 1: البنية الأساسية ✅
- [x] إعداد بيئة التطوير (FastAPI + React + MongoDB)
- [x] نظام المصادقة JWT مع RBAC
- [x] الصفحة الرئيسية (Landing Page) مع دعم RTL/LTR
- [x] تبديل اللغات (العربية/الإنجليزية)
- [x] قسم Hero محدث مع اسم المنصة وإحصائيات التأثير
- [x] تعبئة قاعدة البيانات (+200 مدرسة، +50,000 طالب، +3,000 معلم)

### المرحلة 2: إدارة الفصول ومحرك الجدولة ✅ (2026-03-08)
- [x] **نموذج بيانات إدارة الفصول (Class Management Data Model)**
  - [x] إسناد المعلمين للفصول والمواد
  - [x] ربط الطلاب بالفصول
  - [x] ربط المواد بالفصول
  
- [x] **محرك الجدولة (Scheduling Engine)**
  - [x] إدارة الفترات الزمنية (Time Slots)
  - [x] إنشاء الجداول المدرسية
  - [x] إضافة/حذف الحصص
  - [x] التوليد التلقائي للجدول
  - [x] اكتشاف التعارضات (معلم/فصل)
  - [x] حساب نصاب المعلم
  - [x] تحديث رتب المعلمين

### APIs المنجزة (محرك الجدولة)
| API | الوصف | الحالة |
|-----|--------|--------|
| `POST /api/time-slots` | إنشاء فترة زمنية | ✅ |
| `GET /api/time-slots` | عرض الفترات الزمنية | ✅ |
| `DELETE /api/time-slots/{id}` | حذف فترة زمنية | ✅ |
| `POST /api/teacher-assignments` | إسناد معلم | ✅ |
| `GET /api/teacher-assignments` | عرض الإسنادات | ✅ |
| `DELETE /api/teacher-assignments/{id}` | حذف إسناد | ✅ |
| `POST /api/schedules` | إنشاء جدول | ✅ |
| `GET /api/schedules` | عرض الجداول | ✅ |
| `PUT /api/schedules/{id}/publish` | نشر الجدول | ✅ |
| `DELETE /api/schedules/{id}` | أرشفة الجدول | ✅ |
| `POST /api/schedule-sessions` | إضافة حصة | ✅ |
| `GET /api/schedule-sessions` | عرض الحصص | ✅ |
| `DELETE /api/schedule-sessions/{id}` | حذف حصة | ✅ |
| `POST /api/schedules/{id}/generate` | توليد الجدول آلياً | ✅ |
| `GET /api/schedules/{id}/conflicts` | اكتشاف التعارضات | ✅ |
| `PUT /api/teachers/{id}/rank` | تحديث رتبة المعلم | ✅ |
| `GET /api/teachers/{id}/workload` | نصاب المعلم | ✅ |
| `POST /api/seed/time-slots/{school_id}` | إنشاء فترات افتراضية | ✅ |

---

## 🔴 المهام القادمة (P1)

### واجهات المستخدم لمحرك الجدولة
- [ ] صفحة إدارة الفترات الزمنية
- [ ] صفحة إسناد المعلمين للفصول والمواد
- [ ] صفحة إنشاء وإدارة الجداول المدرسية
- [ ] عرض الجدول الأسبوعي (Weekly Grid View)
- [ ] لوحة اكتشاف التعارضات

---

## 🟡 المهام المستقبلية (P2 - المحركات الأكاديمية)

### محرك الحضور (Attendance Engine)
- [ ] تسجيل الحضور والغياب
- [ ] تقارير الحضور
- [ ] إشعارات الغياب لأولياء الأمور

### محرك التقييمات (Assessment Engine)
- [ ] إدخال الدرجات
- [ ] أنظمة التقييم
- [ ] التقارير الأكاديمية

### محرك الإشعارات (Notification Engine)
- [ ] إشعارات فورية
- [ ] رسائل SMS
- [ ] إشعارات البريد الإلكتروني

---

## 🔵 المهام البعيدة (P3 - طبقة الذكاء)

### محرك هوية المستخدم (User Identity Graph Engine)
- [ ] الهوية الموحدة للمستخدمين
- [ ] إدارة العلاقات (ولي أمر/طالب، معلم/فصل)
- [ ] ربط الأدوار المتعددة

### محرك دعوة المعلمين (Teacher Invite Engine)
- [ ] نظام الترشيحات
- [ ] مكافآت الدعوة

### مركز التحكم الأمني (Security Control Center)
- [ ] سجلات الأمان
- [ ] مراقبة الدخول
- [ ] اكتشاف النشاط المشبوه

---

## 🏗️ البنية التقنية

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB
- **Auth:** JWT + RBAC
- **Location:** `/app/backend/`

### Frontend
- **Framework:** React.js
- **Styling:** TailwindCSS
- **i18n:** i18next (AR/EN)
- **Location:** `/app/frontend/`

### ملفات مهمة
```
/app/backend/
├── server.py              # API Routes (2000+ lines)
├── models/
│   └── scheduling.py      # نماذج الجدولة
├── services/
│   └── scheduling_service.py  # خدمة الجدولة
└── requirements.txt

/app/frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   └── AdminDashboard.jsx
│   ├── components/ui/     # Shadcn Components
│   └── i18n.js           # Translations
└── package.json
```

---

## 🔐 بيانات الاختبار

```
Platform Admin:
- Email: info@nassaqapp.com
- Password: NassaqAdmin2026!##$$HBJ

Test School ID: d3addce7-919b-4f5a-ba0c-0c2dc71599e9
```

---

## 📊 إحصائيات البيانات

| الكيان | العدد |
|--------|-------|
| المدارس | +200 |
| الطلاب | +50,000 |
| المعلمين | +3,000 |
| الفصول | ~2,400 |
| المواد | ~450 |

---

## ⚠️ ملاحظات إعادة الهيكلة

### مطلوب بشكل عاجل:
1. تقسيم `server.py` (2000+ سطر) إلى:
   - `/routes/` - API endpoints
   - `/models/` - Pydantic models
   - `/services/` - Business logic
   
2. تقسيم `LandingPage.jsx` إلى مكونات أصغر

---

## 📅 سجل التحديثات (Changelog)

### 2026-03-08
- ✅ بناء محرك الجدولة الكامل (Scheduling Engine)
- ✅ 18 API endpoint جديد للجدولة
- ✅ اختبار شامل (29/29 tests passed - 100%)
- ✅ نظام رتب المعلمين والنصاب
- ✅ التوليد التلقائي للجداول
- ✅ اكتشاف التعارضات

### 2026-03-07
- ✅ تحديث Hero Section
- ✅ تعبئة قاعدة البيانات
- ✅ إضافة إحصائيات التأثير
