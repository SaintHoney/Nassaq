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
- تبويب طلبات المعلمين المستقلين يعمل (قبول/رفض/طلب معلومات)

### ✅ المرحلة 4: مركز الأمان - مكتمل بالكامل
**Backend APIs:**
- `/api/security/search-account` - البحث عن حساب
- `/api/security/lock-account/{user_id}` - قفل حساب
- `/api/security/unlock-account/{user_id}` - فتح حساب
- `/api/security/end-all-sessions` - إنهاء جميع الجلسات
- `/api/security/force-password-change` - فرض تغيير كلمة المرور

**Frontend:**
- 4 أدوات أمان جديدة مع dialogs تفاعلية

### ✅ سجلات التدقيق (Audit Logs) - مكتمل
**APIs:**
- `/api/audit/logs` - جلب السجلات مع الترحيل والفلترة

### ✅ إعدادات النظام (System Settings) - مكتمل بالكامل
**جميع الأقسام تعمل:**
- إعدادات الحساب (اسم، بريد، هاتف، صورة)
- الإعدادات العامة (اسم المنصة، اللغة، التاريخ، المنطقة الزمنية)
- إشعارات (بريد، SMS، نظام)
- ميزات الذكاء الاصطناعي
- التسجيل مفتوح/مغلق
- وضع الصيانة
- الشروط والأحكام (محرر، إصدارات، نشر)
- سياسة الخصوصية (محرر، إصدارات، نشر)
- بيانات التواصل (بريد، هاتف، عنوان، وسائل التواصل)
- إعدادات الأمان (الجلسات النشطة، مدة الجلسة، سياسة كلمات المرور)

### ✅ زر تبديل الأدوار (Role Switcher) - مكتمل (جديد!)
**Backend APIs:**
- `/api/user-roles/my-roles` - جلب أدوار المستخدم المتاحة
- `/api/user-roles/switch` - تبديل الدور
- `/api/user-roles/return-to-original` - العودة للدور الأصلي
- `/api/user-roles/switch-history` - سجل تبديل الأدوار

**Frontend:**
- زر "تبديل الدور" في الشريط الجانبي
- مودال يعرض الدور الحالي والأدوار المتاحة
- مدير المنصة يمكنه معاينة أي مدرسة كمدير مدرسة
- شارات "الحالي" و "معاينة" للتوضيح

### ✅ التواصل والإشعارات - مكتمل مع بيانات حقيقية (جديد!)
**Backend APIs:**
- `/api/communication/stats` - إحصائيات التواصل
- `/api/communication/audience-counts` - أعداد الجمهور المستهدف
- `/api/communication/scheduled` - الرسائل المجدولة
- `/api/communication/sent` - الرسائل المرسلة
- `/api/communication/broadcast` - إرسال رسالة بث جماعية

**Frontend:**
- إحصائيات حية (الجميع 1,148، المدارس 9، المعلمين 133، الطلاب 501)
- عرض الرسائل المجدولة
- عرض الرسائل المرسلة
- إرسال رسائل بث جماعية

---

## المهام المستقبلية (P2)

### 🟢 إشعارات فورية (Real-time Notifications)
- [ ] WebSocket للإشعارات الفورية
- [ ] إشعار عند وصول طلبات معلمين جدد
- [ ] تنبيهات أمنية فورية

### 🟢 ميزات إضافية
- استيراد جماعي (Excel/CSV) للطلاب والمعلمين
- تصدير الجدول (PDF/CSV)
- تطبيق مستقل للطالب/ولي الأمر

---

## الملفات المهمة

### Backend Routes
- `/app/backend/routes/admin_dashboard_routes.py`
- `/app/backend/routes/security_routes.py`
- `/app/backend/routes/audit_routes.py`
- `/app/backend/routes/settings_routes.py`
- `/app/backend/routes/user_roles_routes.py` (جديد)
- `/app/backend/routes/communication_routes.py` (محدث)

### Frontend Pages
- `/app/frontend/src/pages/AdminDashboard.jsx`
- `/app/frontend/src/pages/PlatformSchoolsPage.jsx`
- `/app/frontend/src/pages/UsersManagement.jsx`
- `/app/frontend/src/pages/SecurityCenterPage.jsx`
- `/app/frontend/src/pages/PlatformSettingsPage.jsx`
- `/app/frontend/src/pages/CommunicationNotificationsPage.jsx` (محدث)
- `/app/frontend/src/components/layout/Sidebar.jsx` (محدث - زر تبديل الدور)

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
- **Backend:** 100% (16/16 اختبار نجح) - Iteration 57
- **Frontend:** 100% (جميع الميزات تعمل)
- **Test Reports:** `/app/test_reports/iteration_56.json`, `/app/test_reports/iteration_57.json`

---

## الميزات المكتملة في هذه الجلسة:
1. ✅ إعدادات النظام - واجهة مستخدم كاملة
2. ✅ زر تبديل الأدوار - Backend + Frontend
3. ✅ التواصل والإشعارات - بيانات حقيقية من API
4. ✅ طلبات تسجيل المعلمين - موجود مسبقاً ويعمل
