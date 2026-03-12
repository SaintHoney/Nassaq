# نَسَّق | NASSAQ - Product Requirements Document

## المشروع
نظام إدارة مدرسي شامل ومتعدد المستأجرين مدعوم بالذكاء الاصطناعي.

---

## ما تم إنجازه (March 12, 2026)

### ✅ مركز القيادة (Command Center) - مكتمل
- التاريخ الهجري والميلادي
- 9 كروت إحصائية مع حركة LIVE

### ✅ إدارة المدارس - مكتمل
- Grid View للمدارس
- أزرار "تعليق" و "AI"

### ✅ إدارة المستخدمين - مكتمل
- 9 كروت إحصائيات
- تبويب طلبات المعلمين المستقلين

### ✅ مركز الأمان - مكتمل
- قفل/فتح الحسابات
- إنهاء الجلسات
- فرض تغيير كلمة المرور
- إشعارات أمنية فورية

### ✅ سجلات التدقيق - مكتمل

### ✅ إعدادات النظام - مكتمل (7 tabs)

### ✅ زر تبديل الأدوار - مكتمل
- 4 APIs
- مودال في الشريط الجانبي
- معاينة كمدير مدرسة

### ✅ التواصل والإشعارات - مكتمل
- إحصائيات حقيقية
- الرسائل المجدولة والمرسلة
- إرسال رسائل بث جماعية

### ✅ الإشعارات الفورية (WebSocket) - مكتمل
- `/api/ws/notifications` - WebSocket endpoint
- صوت الإشعارات
- إشعارات المتصفح (Browser Push)

### ✅ الاستيراد والتصدير الجماعي - مكتمل (جديد!)

**Backend APIs:**
- `/api/bulk/template/students` - قالب استيراد الطلاب
- `/api/bulk/template/teachers` - قالب استيراد المعلمين
- `/api/bulk/import/students` - استيراد الطلاب من Excel/CSV
- `/api/bulk/import/teachers` - استيراد المعلمين من Excel/CSV
- `/api/bulk/export/students` - تصدير الطلاب
- `/api/bulk/export/teachers` - تصدير المعلمين
- `/api/bulk/export/schedule` - تصدير الجدول الدراسي
- `/api/bulk/export/attendance` - تصدير سجل الحضور
- `/api/bulk/export/grades` - تصدير الدرجات

**Frontend (`/admin/bulk`):**
- تبويب الاستيراد:
  - اختيار نوع البيانات (طلاب/معلمين)
  - تحميل القالب
  - رفع الملف
  - عرض نتيجة الاستيراد (نجاح/فشل/أخطاء/تحذيرات)
- تبويب التصدير:
  - 5 أنواع بيانات (طلاب، معلمين، جدول، حضور، درجات)
  - صيغتين (Excel/CSV)

---

## المهام المستقبلية (P3)

### 🟢 تطبيق مستقل للطالب/ولي الأمر
- واجهة مخصصة للطالب
- واجهة مخصصة لولي الأمر
- عرض الدرجات والحضور
- التواصل مع المعلمين

---

## الملفات المهمة

### Backend Routes
- `/app/backend/routes/admin_dashboard_routes.py`
- `/app/backend/routes/security_routes.py`
- `/app/backend/routes/audit_routes.py`
- `/app/backend/routes/settings_routes.py`
- `/app/backend/routes/user_roles_routes.py`
- `/app/backend/routes/communication_routes.py`
- `/app/backend/routes/websocket_routes.py`
- `/app/backend/routes/bulk_import_export_routes.py` (جديد)

### Frontend Pages
- `/app/frontend/src/pages/BulkImportExportPage.jsx` (جديد)
- `/app/frontend/src/contexts/WebSocketContext.jsx`
- `/app/frontend/src/components/notifications/RealtimeNotificationIndicator.jsx`

---

## بيانات الاختبار
- **مدير المنصة:** admin@nassaq.com / Admin@123
- **مدير مدرسة:** principal1@nassaq.com / Principal@123

---

## التكاملات
- OpenAI (Emergent LLM Key) - مساعد حكيم
- MongoDB (MONGO_URL)
- WebSocket (Real-time Notifications)
- pandas, openpyxl, xlsxwriter (Excel Import/Export)

---

## نتائج الاختبار (March 12, 2026)
- **Iteration 56:** Settings 100% (18/18 ✅)
- **Iteration 57:** Role Switcher + Communication 100% (16/16 ✅)
- **Iteration 58:** WebSocket Real-time 100% (8/8 ✅)
- **Iteration 59:** Bulk Import/Export 100% (16/16 ✅)

---

## الميزات المكتملة في هذه الجلسة:
1. ✅ إعدادات النظام (7 tabs)
2. ✅ زر تبديل الأدوار
3. ✅ التواصل والإشعارات (بيانات حقيقية)
4. ✅ الإشعارات الفورية (WebSocket + Sound + Browser Push)
5. ✅ الاستيراد والتصدير الجماعي (Excel/CSV)
