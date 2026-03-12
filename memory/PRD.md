# نَسَّق | NASSAQ - Product Requirements Document

## المشروع
نظام إدارة مدرسي شامل ومتعدد المستأجرين مدعوم بالذكاء الاصطناعي.

---

## ما تم إنجازه (March 12, 2026)

### ✅ المرحلة 1: مركز القيادة (Command Center) - مكتمل
- التاريخ الهجري والميلادي ظاهر
- إلغاء زر "تصدير"
- 9 كروت جديدة مع حركة LIVE متواصلة
- الكروت غير القابلة للنقر (نسب الحضور) تظهر "إحصائية"
- نافذة "إضافة مدرسة" أكبر
- كروت العمليات الذكية قابلة للنقر مباشرة

### ✅ المرحلة 2: إدارة المدارس - مكتمل
- Grid View جديد للمدارس ككروت
- أزرار "تعليق" و "AI" واضحة وكبيرة
- زر "فتح لوحة التحكم" هو الوحيد القابل للنقر

### ✅ المرحلة 3: إدارة المستخدمين - مكتمل
- 9 كروت إحصائيات جديدة (غير قابلة للنقر)
- جلب البيانات من Command Center API

### ✅ المرحلة 4: مركز الأمان - مكتمل بالكامل
**Backend APIs:**
- `/api/security/search-account` - البحث عن حساب
- `/api/security/lock-account/{user_id}` - قفل حساب
- `/api/security/unlock-account/{user_id}` - فتح حساب
- `/api/security/end-all-sessions` - إنهاء جميع الجلسات
- `/api/security/force-password-change` - فرض تغيير كلمة المرور
- `/api/security/roles` - قائمة الأدوار

**Frontend:**
- 4 أدوات أمان جديدة مع dialogs تفاعلية
- بحث عن الحسابات بالبريد أو رقم الهاتف
- فرض تغيير كلمة المرور (فردي/فئة/الكل)

### ✅ سجلات التدقيق (Audit Logs) - Backend مكتمل
**APIs:**
- `/api/audit/logs` - جلب السجلات مع الترحيل والفلترة
- `/api/audit/actions` - قائمة الإجراءات للفلترة
- `/api/audit/stats` - إحصائيات السجلات
- `/api/audit/log` - إنشاء سجل جديد

### ✅ إعدادات النظام (System Settings) - Backend مكتمل
**APIs:**
- `/api/settings/general` - الإعدادات العامة
- `/api/settings/maintenance` - وضع الصيانة والتسجيل
- `/api/settings/terms/versions` - إصدارات الشروط والأحكام
- `/api/settings/privacy/versions` - إصدارات سياسة الخصوصية
- `/api/settings/contact` - بيانات التواصل
- `/api/settings/security` - إعدادات الأمان
- `/api/settings/account` - إعدادات حساب المستخدم
- `/api/settings/titles` - قائمة الألقاب
- `/api/settings/sessions/active` - الجلسات النشطة

---

## المهام المعلقة

### 🟡 P1: Frontend لإعدادات النظام
- [ ] تحديث واجهة PlatformSettingsPage.jsx لاستخدام APIs الجديدة
- [ ] قسم الإعدادات العامة (اسم المنصة، عنوان المتصفح، اللغة، التاريخ، المنطقة الزمنية)
- [ ] قسم وضع الصيانة والتسجيل المفتوح
- [ ] محرر الشروط والأحكام مع نظام الإصدارات
- [ ] محرر سياسة الخصوصية مع نظام الإصدارات
- [ ] قسم بيانات التواصل
- [ ] قسم إعدادات الأمان (الجلسات، كلمات المرور)
- [ ] رفع الصورة الشخصية + اختيار اللقب

### 🟡 P1: زر تبديل الأدوار + القائمة الجانبية
- [ ] تبديل بين الأدوار بدون تسجيل خروج
- [ ] تحديث القائمة الجانبية (شعار + اسم + دور + زر خروج)

### 🟡 P1: التواصل والإشعارات
- [ ] إحصائيات حقيقية عن الإشعارات
- [ ] قسم الرسائل المجدولة

### 🟢 P2: إشعارات فورية (Real-time Notifications)
- [ ] WebSocket للإشعارات الفورية
- [ ] إشعار عند وصول طلبات معلمين جدد
- [ ] تنبيهات أمنية فورية

---

## المهام المستقبلية
- استيراد جماعي (Excel/CSV) للطلاب والمعلمين
- تصدير الجدول (PDF/CSV)
- تطبيق مستقل للطالب/ولي الأمر

---

## الملفات المهمة

### Backend Routes (جديدة)
- `/app/backend/routes/admin_dashboard_routes.py`
- `/app/backend/routes/security_routes.py`
- `/app/backend/routes/audit_routes.py`
- `/app/backend/routes/settings_routes.py`

### Frontend Pages
- `/app/frontend/src/pages/AdminDashboard.jsx`
- `/app/frontend/src/pages/PlatformSchoolsPage.jsx`
- `/app/frontend/src/pages/UsersManagement.jsx`
- `/app/frontend/src/pages/SecurityCenterPage.jsx`
- `/app/frontend/src/pages/PlatformSettingsPage.jsx`

---

## بيانات الاختبار
- **مدير المنصة:** admin@nassaq.com / Admin@123
- **مدير مدرسة:** principal1@nassaq.com / Principal@123
- **معلم:** teacher1@nor.edu.sa / Teacher@123

---

## التكاملات
- OpenAI (Emergent LLM Key) - مساعد حكيم
- MongoDB (MONGO_URL)
- Faker, qrcode, @dnd-kit, canvas-confetti
