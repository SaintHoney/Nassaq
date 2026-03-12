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

### ✅ إعدادات النظام (System Settings) - مكتمل بالكامل
**Backend APIs:**
- `/api/settings/general` - الإعدادات العامة (GET/PUT)
- `/api/settings/maintenance` - وضع الصيانة والتسجيل (GET/PUT)
- `/api/settings/terms/versions` - إصدارات الشروط والأحكام (GET)
- `/api/settings/terms` - إنشاء إصدار جديد (POST)
- `/api/settings/terms/{id}/publish` - نشر إصدار (POST)
- `/api/settings/privacy/versions` - إصدارات سياسة الخصوصية (GET)
- `/api/settings/privacy` - إنشاء إصدار جديد (POST)
- `/api/settings/privacy/{id}/publish` - نشر إصدار (POST)
- `/api/settings/contact` - بيانات التواصل (GET/PUT)
- `/api/settings/security` - إعدادات الأمان (GET/PUT)
- `/api/settings/account` - إعدادات حساب المستخدم (GET/PUT)
- `/api/settings/account/upload-picture` - رفع صورة شخصية (POST)
- `/api/settings/titles` - قائمة الألقاب (GET)
- `/api/settings/sessions/active` - الجلسات النشطة (GET)

**Frontend (PlatformSettingsPage.jsx):**
- ✅ إعدادات الحساب (اسم، بريد، هاتف، لغة، صورة، تغيير كلمة المرور)
- ✅ الإعدادات العامة (اسم المنصة، عنوان المتصفح، اللغة، نظام التاريخ، المنطقة الزمنية)
- ✅ إشعارات (بريد، SMS، نظام)
- ✅ ميزات الذكاء الاصطناعي
- ✅ التسجيل مفتوح/مغلق
- ✅ وضع الصيانة
- ✅ الشروط والأحكام (محرر، إصدارات، نشر)
- ✅ سياسة الخصوصية (محرر، إصدارات، نشر)
- ✅ بيانات التواصل (بريد، هاتف، عنوان، ساعات العمل، وسائل التواصل)
- ✅ إعدادات الأمان (الجلسات النشطة، مدة الجلسة، الحد الأقصى، سياسة كلمات المرور)

---

## المهام المعلقة

### 🟡 P1: إدارة المستخدمين - طلبات التسجيل
- [ ] عرض طلبات تسجيل المعلمين المستقلين المعلقة
- [ ] قبول/رفض الطلبات

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

---

## نتائج الاختبار (March 12, 2026)
- **Backend:** 100% (18/18 اختبار نجح)
- **Frontend:** 100% (جميع الـ 7 tabs تعمل)
- **Test Report:** `/app/test_reports/iteration_56.json`
