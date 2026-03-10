# NASSAQ Changelog

## March 10, 2026 - Session 2 Updates

### ✅ البيانات التجريبية المحكمة (Controlled Demo Data)

تم إنشاء seeder جديد ومنظم: `/app/backend/scripts/seed_controlled_demo.py`

#### الملخص:
| البيان | العدد |
|--------|-------|
| المدارس | 5 |
| الطلاب | 500 (100 لكل مدرسة) |
| المعلمون | 77 |
| الفصول | 60 (12 لكل مدرسة) |
| المواد | 50 (10 لكل مدرسة) |
| سجلات الحضور | 15,000 |
| سجلات السلوك | 1,739 |
| الاختبارات | 1,500 |
| الدرجات | 12,502 |

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

### ✅ تطبيق Multi-Tenant Isolation

- كل مدرسة تعمل كـ Tenant مستقل
- مدير المدرسة يرى بيانات مدرسته فقط
- مدير المنصة يرى جميع المدارس
- جميع الـ APIs تطبق عزل البيانات بناءً على `tenant_id`

### ✅ إصلاحات سابقة (من Session 1):
1. **صفحة الجدول الدراسي** - إضافة الحقول المفقودة في `time_slots`
2. **صفحة المعلمين** - إخفاء dropdown المدارس لمدير المدرسة

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

## Test Results

### Tenant Isolation Verification:
- ✅ مدير مدرسة النور يرى 100 طالب فقط (من مدرسته)
- ✅ مدير مدرسة النور يرى 15 معلم فقط (من مدرسته)
- ✅ مدير المنصة يرى جميع المدارس الخمس
- ✅ APIs تطبق عزل البيانات بشكل صحيح

### APIs Working:
- ✅ `/api/auth/login` - تسجيل الدخول
- ✅ `/api/schools` - قائمة المدارس (Platform Admin)
- ✅ `/api/teachers` - قائمة المعلمين (Tenant-scoped)
- ✅ `/api/students` - قائمة الطلاب (Tenant-scoped)
- ✅ `/api/time-slots` - الفترات الزمنية
- ✅ `/api/schedules` - الجداول
- ✅ `/api/schedule-sessions` - الحصص

---

## Files Modified/Created

### New Files:
- `/app/backend/scripts/seed_controlled_demo.py` - Seeder محكم ومنظم

### Modified Files:
- `/app/frontend/src/pages/TeachersPage.jsx` - Tenant Isolation
- `/app/backend/scripts/seed_demo_school_complete.py` - تصحيح time_slots

---

## Last Updated: March 10, 2026
