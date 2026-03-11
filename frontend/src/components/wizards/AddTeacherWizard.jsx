import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Calendar,
  Copy,
  Award,
  Briefcase,
  Clock,
  FileText,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Step 1: Basic Info
const Step1BasicInfo = ({ data, onChange, errors, options, isRTL }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold font-cairo">{isRTL ? 'البيانات الأساسية' : 'Basic Information'}</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{isRTL ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'} <span className="text-red-500">*</span></Label>
        <Input
          value={data.full_name_ar || ''}
          onChange={(e) => onChange('full_name_ar', e.target.value)}
          className={errors.full_name_ar ? 'border-red-500' : ''}
          data-testid="teacher-name-ar"
        />
        {errors.full_name_ar && <p className="text-red-500 text-sm">{errors.full_name_ar}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}</Label>
        <Input value={data.full_name_en || ''} onChange={(e) => onChange('full_name_en', e.target.value)} dir="ltr" data-testid="teacher-name-en" />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'رقم الهوية' : 'National ID'} <span className="text-red-500">*</span></Label>
        <Input
          value={data.national_id || ''}
          onChange={(e) => onChange('national_id', e.target.value.replace(/\D/g, '').slice(0, 10))}
          className={errors.national_id ? 'border-red-500' : ''}
          maxLength={10}
          dir="ltr"
          data-testid="teacher-national-id"
        />
        {errors.national_id && <p className="text-red-500 text-sm">{errors.national_id}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الجنس' : 'Gender'} <span className="text-red-500">*</span></Label>
        <Select value={data.gender || ''} onValueChange={(val) => onChange('gender', val)}>
          <SelectTrigger className={errors.gender ? 'border-red-500' : ''} data-testid="teacher-gender">
            <SelectValue placeholder={isRTL ? 'اختر' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">{isRTL ? 'ذكر' : 'Male'}</SelectItem>
            <SelectItem value="female">{isRTL ? 'أنثى' : 'Female'}</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الجنسية' : 'Nationality'}</Label>
        <Select value={data.nationality || 'SA'} onValueChange={(val) => onChange('nationality', val)}>
          <SelectTrigger data-testid="teacher-nationality">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.nationalities?.map((n) => (
              <SelectItem key={n.code} value={n.code}>{isRTL ? n.name_ar : n.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</Label>
        <Input type="date" value={data.date_of_birth || ''} onChange={(e) => onChange('date_of_birth', e.target.value)} data-testid="teacher-dob" />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'رقم الجوال' : 'Phone'} <span className="text-red-500">*</span></Label>
        <Input
          value={data.phone || ''}
          onChange={(e) => onChange('phone', e.target.value)}
          className={errors.phone ? 'border-red-500' : ''}
          dir="ltr"
          data-testid="teacher-phone"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span></Label>
        <Input
          type="email"
          value={data.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
          dir="ltr"
          data-testid="teacher-email"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
    </div>
  </div>
);

// Step 2: Qualifications
const Step2Qualifications = ({ data, onChange, errors, options, isRTL }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <GraduationCap className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold font-cairo">{isRTL ? 'المؤهلات العلمية' : 'Qualifications'}</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{isRTL ? 'الدرجة العلمية' : 'Academic Degree'} <span className="text-red-500">*</span></Label>
        <Select value={data.academic_degree || ''} onValueChange={(val) => onChange('academic_degree', val)}>
          <SelectTrigger className={errors.academic_degree ? 'border-red-500' : ''} data-testid="teacher-degree">
            <SelectValue placeholder={isRTL ? 'اختر' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            {options.degrees?.map((d) => (
              <SelectItem key={d.code} value={d.code}>{isRTL ? d.name_ar : d.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.academic_degree && <p className="text-red-500 text-sm">{errors.academic_degree}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'التخصص' : 'Specialization'} <span className="text-red-500">*</span></Label>
        <Input
          value={data.specialization || ''}
          onChange={(e) => onChange('specialization', e.target.value)}
          className={errors.specialization ? 'border-red-500' : ''}
          data-testid="teacher-specialization"
        />
        {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الجامعة' : 'University'}</Label>
        <Input value={data.university || ''} onChange={(e) => onChange('university', e.target.value)} data-testid="teacher-university" />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'سنة التخرج' : 'Graduation Year'}</Label>
        <Input
          type="number"
          value={data.graduation_year || ''}
          onChange={(e) => onChange('graduation_year', parseInt(e.target.value) || '')}
          min="1970"
          max={new Date().getFullYear()}
          data-testid="teacher-grad-year"
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'سنوات الخبرة' : 'Years of Experience'} <span className="text-red-500">*</span></Label>
        <Input
          type="number"
          value={data.years_of_experience ?? ''}
          onChange={(e) => onChange('years_of_experience', parseInt(e.target.value) || 0)}
          min="0"
          className={errors.years_of_experience ? 'border-red-500' : ''}
          data-testid="teacher-experience"
        />
        {errors.years_of_experience && <p className="text-red-500 text-sm">{errors.years_of_experience}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الرتبة الوظيفية' : 'Teacher Rank'} <span className="text-red-500">*</span></Label>
        <Select value={data.teacher_rank || ''} onValueChange={(val) => onChange('teacher_rank', val)}>
          <SelectTrigger className={errors.teacher_rank ? 'border-red-500' : ''} data-testid="teacher-rank">
            <SelectValue placeholder={isRTL ? 'اختر' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            {options.ranks?.map((r) => (
              <SelectItem key={r.code} value={r.code}>{isRTL ? r.name_ar : r.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.teacher_rank && <p className="text-red-500 text-sm">{errors.teacher_rank}</p>}
      </div>
    </div>
  </div>
);

// Step 3: Subjects
const Step3Subjects = ({ data, onChange, errors, options, isRTL }) => {
  const toggleSubject = (subjectId) => {
    const current = data.subject_ids || [];
    const updated = current.includes(subjectId)
      ? current.filter(id => id !== subjectId)
      : [...current, subjectId];
    onChange('subject_ids', updated);
  };

  const toggleGrade = (gradeId) => {
    const current = data.grade_ids || [];
    const updated = current.includes(gradeId)
      ? current.filter(id => id !== gradeId)
      : [...current, gradeId];
    onChange('grade_ids', updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">{isRTL ? 'المواد والصفوف' : 'Subjects & Grades'}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block">{isRTL ? 'المواد التي يدرسها' : 'Subjects'} <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.subjects?.map((subject) => (
              <div
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  (data.subject_ids || []).includes(subject.id)
                    ? 'bg-purple-100 border-purple-500'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                <p className="font-medium text-sm">{isRTL ? subject.name_ar : subject.name_en}</p>
              </div>
            ))}
          </div>
          {errors.subject_ids && <p className="text-red-500 text-sm mt-2">{errors.subject_ids}</p>}
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? 'المادة الأساسية' : 'Primary Subject'} <span className="text-red-500">*</span></Label>
          <Select value={data.primary_subject_id || ''} onValueChange={(val) => onChange('primary_subject_id', val)}>
            <SelectTrigger className={errors.primary_subject_id ? 'border-red-500' : ''} data-testid="teacher-primary-subject">
              <SelectValue placeholder={isRTL ? 'اختر' : 'Select'} />
            </SelectTrigger>
            <SelectContent>
              {(data.subject_ids || []).map((id) => {
                const subject = options.subjects?.find(s => s.id === id);
                return subject ? (
                  <SelectItem key={id} value={id}>{isRTL ? subject.name_ar : subject.name_en}</SelectItem>
                ) : null;
              })}
            </SelectContent>
          </Select>
          {errors.primary_subject_id && <p className="text-red-500 text-sm">{errors.primary_subject_id}</p>}
        </div>

        <div>
          <Label className="mb-3 block">{isRTL ? 'الصفوف التي يدرسها' : 'Grades'} <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {options.grades?.map((grade) => (
              <div
                key={grade.id}
                onClick={() => toggleGrade(grade.id)}
                className={`p-2 rounded-lg border cursor-pointer text-center transition-colors ${
                  (data.grade_ids || []).includes(grade.id)
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                <p className="font-medium text-sm">{isRTL ? grade.name_ar : grade.name_en}</p>
              </div>
            ))}
          </div>
          {errors.grade_ids && <p className="text-red-500 text-sm mt-2">{errors.grade_ids}</p>}
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? 'الحد الأقصى للحصص أسبوعياً' : 'Max Periods/Week'}</Label>
          <Input
            type="number"
            value={data.max_periods_per_week || 24}
            onChange={(e) => onChange('max_periods_per_week', parseInt(e.target.value) || 24)}
            min="1"
            max="30"
            data-testid="teacher-max-periods"
          />
        </div>
      </div>
    </div>
  );
};

// Step 4: Schedule
const Step4Schedule = ({ data, onChange, options, isRTL }) => {
  const days = [
    { id: 'sunday', ar: 'الأحد', en: 'Sunday' },
    { id: 'monday', ar: 'الإثنين', en: 'Monday' },
    { id: 'tuesday', ar: 'الثلاثاء', en: 'Tuesday' },
    { id: 'wednesday', ar: 'الأربعاء', en: 'Wednesday' },
    { id: 'thursday', ar: 'الخميس', en: 'Thursday' },
  ];

  const toggleDay = (dayId) => {
    const current = data.available_days || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const updated = current.includes(dayId)
      ? current.filter(id => id !== dayId)
      : [...current, dayId];
    onChange('available_days', updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">{isRTL ? 'التفضيلات والجدول' : 'Schedule Preferences'}</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'نوع التعاقد' : 'Contract Type'}</Label>
          <Select value={data.contract_type || 'permanent'} onValueChange={(val) => onChange('contract_type', val)}>
            <SelectTrigger data-testid="teacher-contract">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.contractTypes?.map((c) => (
                <SelectItem key={c.code} value={c.code}>{isRTL ? c.name_ar : c.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">{isRTL ? 'أيام العمل المتاحة' : 'Available Days'}</Label>
          <div className="grid grid-cols-5 gap-2">
            {days.map((day) => (
              <div
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`p-3 rounded-lg border cursor-pointer text-center transition-colors ${
                  (data.available_days || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']).includes(day.id)
                    ? 'bg-green-100 border-green-500'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                <p className="font-medium text-sm">{isRTL ? day.ar : day.en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 5: Review
const Step5Review = ({ basicData, qualData, subjectData, scheduleData, options, isRTL }) => {
  const getSubjectName = (id) => options.subjects?.find(s => s.id === id)?.[isRTL ? 'name_ar' : 'name_en'] || id;
  const getGradeName = (id) => options.grades?.find(g => g.id === id)?.[isRTL ? 'name_ar' : 'name_en'] || id;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">{isRTL ? 'مراجعة البيانات' : 'Review'}</h3>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-green-600" />{isRTL ? 'البيانات الأساسية' : 'Basic Info'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</p><p className="font-medium">{basicData.full_name_ar}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'الهوية' : 'ID'}</p><p className="font-medium" dir="ltr">{basicData.national_id}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'البريد' : 'Email'}</p><p className="font-medium" dir="ltr">{basicData.email}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'الجوال' : 'Phone'}</p><p className="font-medium" dir="ltr">{basicData.phone}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-blue-600" />{isRTL ? 'المؤهلات' : 'Qualifications'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-muted-foreground">{isRTL ? 'الدرجة' : 'Degree'}</p><p className="font-medium">{qualData.academic_degree}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'التخصص' : 'Specialization'}</p><p className="font-medium">{qualData.specialization}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'الخبرة' : 'Experience'}</p><p className="font-medium">{qualData.years_of_experience} {isRTL ? 'سنوات' : 'years'}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-purple-600" />{isRTL ? 'المواد' : 'Subjects'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(subjectData.subject_ids || []).map(id => (
              <Badge key={id} variant="secondary">{getSubjectName(id)}</Badge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(subjectData.grade_ids || []).map(id => (
              <Badge key={id} variant="outline">{getGradeName(id)}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Success Step
const SuccessStep = ({ result, isRTL, onClose, onAddAnother }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? 'تم النسخ' : 'Copied!');
  };

  // Generate welcome message
  const generateWelcomeMessage = () => {
    const schoolName = result.school_name || 'المدرسة';
    const teacherName = result.teacher_name || result.basic_info?.full_name_ar || 'المعلم';
    const teacherId = result.teacher_id || '';
    const email = result.user_account?.email || '';
    const password = result.user_account?.temp_password || '';
    const platformUrl = window.location.origin;

    if (isRTL) {
      return `السلام عليكم ورحمة الله وبركاته

الأستاذ الكريم: ${teacherName}

يسعدنا انضمامكم إلى فريق العمل في ${schoolName}، ويسرنا إبلاغكم بأنه تم إنشاء حساب خاص بكم على منصة نَسَّق | NASSAQ، وهي المنصة الرقمية المعتمدة لإدارة العملية التعليمية داخل المدرسة.

من خلال منصة نَسَّق يمكنكم:
• متابعة الجداول الدراسية
• تسجيل الحضور والغياب
• إدخال الدرجات والتقييمات
• متابعة أداء الطلاب
• التواصل مع الإدارة وأولياء الأمور

بيانات حساب المعلم في النظام:
• اسم المعلم: ${teacherName}
• كود المعلم في النظام: ${teacherId}
• اسم المدرسة: ${schoolName}

بيانات تسجيل الدخول:
• رابط المنصة: ${platformUrl}
• اسم المستخدم: ${email}
• كلمة المرور المؤقتة: ${password}

ننصحكم بعد تسجيل الدخول لأول مرة بتغيير كلمة المرور لضمان حماية حسابكم.

نتطلع إلى تعاونكم المثمر في دعم العملية التعليمية والمساهمة في تحقيق بيئة تعليمية متميزة لطلابنا.

مع خالص التحية والتقدير،
إدارة ${schoolName}
منصة نَسَّق | NASSAQ`;
    } else {
      return `Dear ${teacherName},

Welcome to ${schoolName}! We are pleased to inform you that your account has been created on NASSAQ platform.

Through NASSAQ you can:
• View class schedules
• Record attendance
• Enter grades and assessments
• Track student performance
• Communicate with administration and parents

Account Details:
• Teacher Name: ${teacherName}
• Teacher ID: ${teacherId}
• School: ${schoolName}

Login Credentials:
• Platform URL: ${platformUrl}
• Email: ${email}
• Temporary Password: ${password}

Please change your password after first login for security.

Best regards,
${schoolName} Administration
NASSAQ Platform`;
    }
  };

  const handleCopyWelcomeMessage = () => {
    const message = generateWelcomeMessage();
    navigator.clipboard.writeText(message);
    toast.success(isRTL ? 'تم نسخ رسالة الترحيب' : 'Welcome message copied!');
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold font-cairo text-green-700">{isRTL ? 'تم إضافة المعلم بنجاح!' : 'Teacher Added Successfully!'}</h3>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-green-600 font-tajawal">{isRTL ? 'رقم المعلم' : 'Teacher ID'}</p>
              <p className="text-xl font-bold font-mono text-green-800">{result.teacher_id}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.teacher_id)} className="text-green-600">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {result.user_account?.created && (
            <div className="space-y-2 text-start mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-medium text-green-800 font-tajawal">{isRTL ? 'بيانات الدخول' : 'Login Credentials'}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'البريد:' : 'Email:'}</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">{result.user_account.email}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'كلمة المرور:' : 'Password:'}</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{result.user_account.temp_password}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(result.user_account.temp_password)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Copy Welcome Message Button */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <Button 
              variant="outline" 
              className="w-full rounded-xl border-green-300 text-green-700 hover:bg-green-50"
              onClick={handleCopyWelcomeMessage}
              data-testid="copy-welcome-message"
            >
              <Copy className="h-4 w-4 me-2" />
              {isRTL ? 'نسخ رسالة الترحيب' : 'Copy Welcome Message'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onClose}>{isRTL ? 'إغلاق' : 'Close'}</Button>
        <Button onClick={onAddAnother} className="bg-green-600 hover:bg-green-700">{isRTL ? 'إضافة معلم آخر' : 'Add Another'}</Button>
      </div>
    </div>
  );
};

// Main Wizard
export const AddTeacherWizard = ({ open, onOpenChange, onSuccess, api }) => {
  const { isRTL } = useTheme();
  const { token } = useAuth();
  
  // Handle close - supports both onClose and onOpenChange patterns
  const handleCloseDialog = () => {
    handleReset();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const [basicData, setBasicData] = useState({ nationality: 'SA' });
  const [qualData, setQualData] = useState({ years_of_experience: 0 });
  const [subjectData, setSubjectData] = useState({ subject_ids: [], grade_ids: [], max_periods_per_week: 24 });
  const [scheduleData, setScheduleData] = useState({ contract_type: 'permanent', available_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] });

  const [options, setOptions] = useState({
    subjects: [], grades: [], degrees: [], ranks: [], contractTypes: [], nationalities: []
  });

  useEffect(() => {
    if (open) fetchOptions();
  }, [open]);

  const fetchOptions = async () => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [subjectsRes, gradesRes, degreesRes, ranksRes, contractsRes, nationsRes] = await Promise.all([
        axios.get(`${API_URL}/api/teachers/options/subjects`, { headers }).catch(() => ({ data: { subjects: [] } })),
        axios.get(`${API_URL}/api/teachers/options/grades`, { headers }).catch(() => ({ data: { grades: [] } })),
        axios.get(`${API_URL}/api/teachers/options/academic-degrees`, { headers }).catch(() => ({ data: { degrees: [] } })),
        axios.get(`${API_URL}/api/teachers/options/teacher-ranks`, { headers }).catch(() => ({ data: { ranks: [] } })),
        axios.get(`${API_URL}/api/teachers/options/contract-types`, { headers }).catch(() => ({ data: { types: [] } })),
        axios.get(`${API_URL}/api/teachers/options/nationalities`, { headers }).catch(() => ({ data: { nationalities: [] } })),
      ]);

      setOptions({
        subjects: subjectsRes.data.subjects || [],
        grades: gradesRes.data.grades || [],
        degrees: degreesRes.data.degrees || [],
        ranks: ranksRes.data.ranks || [],
        contractTypes: contractsRes.data.types || [],
        nationalities: nationsRes.data.nationalities || [],
      });
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!basicData.full_name_ar?.trim()) newErrors.full_name_ar = isRTL ? 'مطلوب' : 'Required';
      if (!basicData.national_id || basicData.national_id.length !== 10) newErrors.national_id = isRTL ? '10 أرقام' : '10 digits';
      if (!basicData.gender) newErrors.gender = isRTL ? 'مطلوب' : 'Required';
      if (!basicData.phone?.trim()) newErrors.phone = isRTL ? 'مطلوب' : 'Required';
      if (!basicData.email?.trim()) newErrors.email = isRTL ? 'مطلوب' : 'Required';
    } else if (step === 2) {
      if (!qualData.academic_degree) newErrors.academic_degree = isRTL ? 'مطلوب' : 'Required';
      if (!qualData.specialization?.trim()) newErrors.specialization = isRTL ? 'مطلوب' : 'Required';
      if (!qualData.teacher_rank) newErrors.teacher_rank = isRTL ? 'مطلوب' : 'Required';
    } else if (step === 3) {
      if (!subjectData.subject_ids?.length) newErrors.subject_ids = isRTL ? 'اختر مادة واحدة على الأقل' : 'Select at least one';
      if (!subjectData.grade_ids?.length) newErrors.grade_ids = isRTL ? 'اختر صف واحد على الأقل' : 'Select at least one';
      if (!subjectData.primary_subject_id) newErrors.primary_subject_id = isRTL ? 'مطلوب' : 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const payload = {
        basic_info: basicData,
        qualifications: qualData,
        subjects: subjectData,
        schedule: scheduleData,
      };

      const response = await axios.post(`${API_URL}/api/teachers/create`, payload, { headers });

      if (response.data.success) {
        setResult(response.data);
        setCurrentStep(6);
        toast.success(isRTL ? 'تم إضافة المعلم بنجاح' : 'Teacher added successfully');
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        toast.error(response.data.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ' : 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setBasicData({ nationality: 'SA' });
    setQualData({ years_of_experience: 0 });
    setSubjectData({ subject_ids: [], grade_ids: [], max_periods_per_week: 24 });
    setScheduleData({ contract_type: 'permanent', available_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] });
    setErrors({});
    setResult(null);
  };

  const steps = [
    { num: 1, title: isRTL ? 'البيانات' : 'Basic', icon: User },
    { num: 2, title: isRTL ? 'المؤهلات' : 'Qualifications', icon: GraduationCap },
    { num: 3, title: isRTL ? 'المواد' : 'Subjects', icon: BookOpen },
    { num: 4, title: isRTL ? 'الجدول' : 'Schedule', icon: Calendar },
    { num: 5, title: isRTL ? 'المراجعة' : 'Review', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="add-teacher-wizard">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-cairo text-xl">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-green-600" />
            </div>
            {isRTL ? 'إضافة معلم جديد' : 'Add New Teacher'}
          </DialogTitle>
        </DialogHeader>

        {currentStep < 6 && (
          <div className="flex items-center justify-center gap-1 my-4">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  currentStep === step.num ? 'bg-green-600 text-white' : currentStep > step.num ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.num ? <CheckCircle2 className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
                {idx < steps.length - 1 && <div className={`w-4 h-0.5 mx-0.5 ${currentStep > step.num ? 'bg-green-400' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : (
          <div className="py-4">
            {currentStep === 1 && <Step1BasicInfo data={basicData} onChange={(k, v) => setBasicData(p => ({ ...p, [k]: v }))} errors={errors} options={options} isRTL={isRTL} />}
            {currentStep === 2 && <Step2Qualifications data={qualData} onChange={(k, v) => setQualData(p => ({ ...p, [k]: v }))} errors={errors} options={options} isRTL={isRTL} />}
            {currentStep === 3 && <Step3Subjects data={subjectData} onChange={(k, v) => setSubjectData(p => ({ ...p, [k]: v }))} errors={errors} options={options} isRTL={isRTL} />}
            {currentStep === 4 && <Step4Schedule data={scheduleData} onChange={(k, v) => setScheduleData(p => ({ ...p, [k]: v }))} options={options} isRTL={isRTL} />}
            {currentStep === 5 && <Step5Review basicData={basicData} qualData={qualData} subjectData={subjectData} scheduleData={scheduleData} options={options} isRTL={isRTL} />}
            {currentStep === 6 && result && <SuccessStep result={result} isRTL={isRTL} onClose={handleCloseDialog} onAddAnother={handleReset} />}
          </div>
        )}

        {!loading && currentStep < 6 && (
          <DialogFooter className="flex justify-between gap-3 mt-4">
            <div>{currentStep > 1 && <Button variant="outline" onClick={handleBack} disabled={submitting}>{isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}{isRTL ? 'السابق' : 'Back'}</Button>}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCloseDialog} disabled={submitting}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              {currentStep < 5 ? (
                <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">{isRTL ? 'التالي' : 'Next'}{isRTL ? <ArrowLeft className="h-4 w-4 ms-2" /> : <ArrowRight className="h-4 w-4 ms-2" />}</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <CheckCircle2 className="h-4 w-4 me-2" />}
                  {isRTL ? 'تأكيد وحفظ' : 'Confirm & Save'}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTeacherWizard;
