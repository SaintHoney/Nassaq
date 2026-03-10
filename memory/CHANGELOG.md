# NASSAQ Changelog

## March 10, 2026 - Session 2 Updates

### ✅ البيانات التجريبية المحكمة (Controlled Demo Data)

تم إنشاء seeder جديد ومنظم: `/app/backend/scripts/seed_controlled_demo.py`

#### الملخص:
| البيان | العدد |
|--------|-------|
| المدارس | 5 |
| الطلاب | 500 (100 لكل مدرسة) |
| المعلمون | 78 |
| الفصول | 60 (12 لكل مدرسة) |
| المواد | 50 (10 لكل مدرسة) |
| الحصص الدراسية | 1,800 (360 لكل مدرسة) |
| سجلات الحضور | 15,000 |
| سجلات السلوك | 1,793 |
| الاختبارات | 1,502 |
| الدرجات | 12,523 |

#### المدارس:
1. **مدرسة النور** (الرياض) - `school-nor-001`
2. **مدرسة العلي** (جدة) - `school-ali-001`
3. **مدرسة المنارة** (الدمام) - `school-mnr-001`
4. **مدرسة الاحساء** (الأحساء) - `school-ahs-001`
5. **مدرسة الحديثة** (مكة المكرمة) - `school-hdt-001`

#### المواد الدراسية (سعودية قياسية):
1. اللغة العربية
2. الرياضيات
3. العلوم
4. اللغة الإنجليزية
5. الدراسات الإسلامية
6. الدراسات الاجتماعية
7. الحاسب الآلي
8. المهارات الرقمية
9. التربية الفنية
10. التربية البدنية

---

### ✅ تحديث صفحة تسجيل الدخول

تم تحديث بيانات الدخول التجريبية في صفحة تسجيل الدخول:
- **مدير المنصة:** `admin@nassaq.com / Admin@123`
- **مدراء المدارس الخمسة:** `principal1-5@nassaq.com / Principal@123`

---

### ✅ تطبيق Multi-Tenant Isolation على جميع الصفحات

#### الصفحات المحدّثة:
1. **TeachersPage.jsx** - إخفاء dropdown المدارس لمدير المدرسة ✅
2. **StudentsPage.jsx** - إخفاء dropdown المدارس لمدير المدرسة ✅
3. **ClassesPage.jsx** - إخفاء dropdown المدارس لمدير المدرسة ✅
4. **SchedulePage.jsx** - تحسين عرض عدد الحصص ✅

#### التغييرات الرئيسية:
- كل صفحة تتحقق من `user.role` لمعرفة إذا كان المستخدم school-level أو platform-level
- School-level users لا يستدعون `/api/schools` endpoint
- يتم استخدام `user.tenant_id` تلقائياً للعمليات
- dropdown المدارس يظهر فقط لـ Platform Admin

---

### ✅ إصلاح صفحة الجدول المدرسي

- إضافة `time_slot_id` في بيانات الحصص
- تصحيح عرض عدد الحصص (من `currentSchedule.total_sessions` إلى `filteredSessions.length`)
- الجدول يعرض الآن 360 حصة بشكل صحيح

---

## حسابات الدخول

### 👑 مدير المنصة (Platform Admin):
- **البريد:** `admin@nassaq.com`
- **كلمة المرور:** `Admin@123`

### 👨‍💼 مدراء المدارس:
| المدرسة | البريد | كلمة المرور |
|---------|--------|-------------|
| مدرسة النور | principal1@nassaq.com | Principal@123 |
| مدرسة العلي | principal2@nassaq.com | Principal@123 |
| مدرسة المنارة | principal3@nassaq.com | Principal@123 |
| مدرسة الاحساء | principal4@nassaq.com | Principal@123 |
| مدرسة الحديثة | principal5@nassaq.com | Principal@123 |

---

## Verification Results

### Tenant Isolation ✅:
- مدير مدرسة النور يرى 100 طالب فقط ✅
- مدير مدرسة النور يرى 15 معلم فقط ✅
- مدير مدرسة النور يرى 12 فصل فقط ✅
- مدير مدرسة النور يرى 360 حصة فقط ✅
- مدير المنصة يرى جميع المدارس الخمس ✅

### Pages Working:
- ✅ Login Page - بيانات تجريبية محدّثة
- ✅ Dashboard - إحصائيات صحيحة
- ✅ Schedule Page - 360 حصة، سحب وإفلات
- ✅ Teachers Page - 15 معلم، لا dropdown مدارس
- ✅ Students Page - 100 طالب، لا dropdown مدارس
- ✅ Classes Page - 12 فصل، لا dropdown مدارس

---

## Files Modified/Created

### New Files:
- `/app/backend/scripts/seed_controlled_demo.py` - Seeder محكم ومنظم

### Modified Files:
- `/app/frontend/src/pages/LoginPage.jsx` - تحديث بيانات الدخول
- `/app/frontend/src/pages/TeachersPage.jsx` - Tenant Isolation
- `/app/frontend/src/pages/StudentsPage.jsx` - Tenant Isolation
- `/app/frontend/src/pages/ClassesPage.jsx` - Tenant Isolation
- `/app/frontend/src/pages/SchedulePage.jsx` - تحسين عرض الحصص

---

## Last Updated: March 10, 2026
