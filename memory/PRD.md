# نَسَّق | NASSAQ - نظام إدارة المدارس الشامل

## المعلومات الأساسية
- **اسم المشروع**: نَسَّق | NASSAQ
- **النوع**: نظام إدارة مدارس متعدد المستأجرين (Multi-tenant SaaS)
- **آخر تحديث**: 11 مارس 2026

---

## ✅ ما تم إنجازه - جلسة 11 مارس 2026

### 1. نظام Context Switching الكامل ✅
- ✅ Platform Admin يمكنه الدخول لسياق أي مدرسة
- ✅ **القائمة الجانبية تعرض فقط menu مدير المدرسة** (لا يوجد أي عنصر من menu مدير المنصة)
- ✅ شريط المعاينة يظهر اسم المدرسة + زر "العودة للمنصة"
- ✅ صندوق المعاينة في أسفل القائمة الجانبية
- ✅ التجربة مطابقة 100% لتسجيل الدخول المباشر كمدير مدرسة
- ✅ X-School-Context Header للـ API

### 2. قاعدة البيانات الواقعية ✅
- 🏫 5 مدارس: النور، الأمل، المستقبل، الرواد، الإبداع
- 👨‍🎓 500 طالب (100 لكل مدرسة)
- 👨‍🏫 125 معلم (25 لكل مدرسة)
- 🏛️ 125 فصل (25 لكل مدرسة)
- ✅ 18,750 سجل حضور
- 📝 1,486 سجل سلوك
- 📊 10,000 درجة

### 3. صفحة إدارة المستخدمين والفصول ✅
- ✅ تصميم بطاقات (5 في الصف)
- ✅ أزرار: طالب/طلاب 🔵، معلم/معلمين 🔷، فصل/فصول 🟢
- ✅ فلاتر تبويب مع URL parameters
- ✅ إزالة زر الاستيراد الجماعي (ينتقل داخل المعالجات)
- ✅ **إصلاح خطأ `fetchTeachers`** عند إغلاق معالج إضافة المعلم (تاريخ: 11 مارس 2026)

### 4. معالجات الإضافة (Wizards) ✅

**معالج إضافة طالب:**
- المراحل: بيانات الطالب → ولي الأمر → البيانات الصحية → المراجعة → الإنشاء
- API: `/student-wizard/create`, `/student-wizard/check-parent`
- ميزة: فحص وجود ولي الأمر مسبقاً (الأشقاء)

**معالج إضافة معلم:**
- المراحل: البيانات → المؤهلات → المواد → الجدول → المراجعة
- API: `/teachers/create`, options endpoints
- ميزة: اختيار المواد والصفوف والمؤهلات

**معالج إنشاء فصل:**
- المراحل: بيانات الفصل → المعلم → الطلاب → المراجعة
- API: `/classes/create`, options endpoints
- ميزة: تعيين معلم الفصل واختيار الطلاب

---

## الحسابات التجريبية

| الدور | البريد | كلمة المرور |
|------|-------|------------|
| مدير المنصة | admin@nassaq.com | Admin@123 |
| مدير مدرسة النور | principal1@nassaq.com | Principal@123 |
| مدير مدرسة الأمل | principal2@nassaq.com | Principal@123 |
| نائب مدير | subadmin1@nassaq.com | SubAdmin@123 |
| معلم | teacher1@nor.edu.sa | Teacher@123 |
| طالب | student1@nor.edu.sa | Student@123 |
| ولي أمر | parent1@nor.edu.sa | Parent@123 |

---

## المهام المستقبلية (P1)

### 1. إزالة البيانات الوهمية من PlatformAnalyticsPage.jsx
- ربط الرسوم البيانية بـ API حقيقي
- جلب توزيع المدارس حسب المدينة

### 2. تفاصيل المستخدم (UserDetailsPage)
- عرض تفصيلي للطالب/المعلم
- تاريخ الحضور والسلوك

### 3. توسيع نظام Audit Log
- تسجيل جميع العمليات الحساسة

### 4. مساعد "حكيم" الذكي (AI Assistant)
- استخدام Emergent LLM Key
- تحليل البيانات والتوصيات

---

## API Endpoints

### Student Wizard
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/student-wizard/create` | POST | إنشاء طالب مع ولي أمر |
| `/student-wizard/check-parent` | POST | فحص وجود ولي أمر |

### Teacher Wizard
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/teachers/create` | POST | إنشاء معلم |
| `/teachers/options/subjects` | GET | المواد المتاحة |
| `/teachers/options/grades` | GET | الصفوف المتاحة |
| `/teachers/options/academic-degrees` | GET | الدرجات العلمية |
| `/teachers/options/teacher-ranks` | GET | الرتب التعليمية |

### Class Wizard
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/classes/create` | POST | إنشاء فصل |
| `/classes/options/grades` | GET | الصفوف المتاحة |
| `/classes/options/teachers` | GET | المعلمين المتاحين |

### School Context
| Header | الوصف |
|--------|-------|
| `X-School-Context` | معرف المدرسة للـ Context Switching |

---

## الملفات الرئيسية

```
/app
├── backend/
│   ├── server.py          # APIs (updated with wizard routes)
│   └── scripts/
│       └── seed_realistic_data.py
├── frontend/src/
│   ├── contexts/
│   │   └── AuthContext.js  # School Context support
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx # Role-based menu
│   │   └── wizards/
│   │       ├── AddStudentWizard.jsx
│   │       ├── AddTeacherWizard.jsx
│   │       └── CreateClassWizard.jsx
│   └── pages/
│       ├── TenantsManagement.jsx # Dynamic schools
│       ├── UsersClassesManagement.jsx # New page
│       └── PrincipalDashboard.jsx # Impersonation banner
└── memory/
    └── PRD.md
```

---

*آخر تحديث: 11 مارس 2026*
