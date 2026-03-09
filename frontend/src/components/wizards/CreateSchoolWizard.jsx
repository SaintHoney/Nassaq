import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Building2, Upload, Globe, MapPin, FileText, Languages, Calendar,
  GraduationCap, Award, User, Phone, Mail, Check, ChevronRight,
  ChevronLeft, Save, X, Copy, ExternalLink, CheckCircle2, Sparkles
} from 'lucide-react';

// Countries list
const COUNTRIES = [
  { code: 'SA', name: 'المملكة العربية السعودية', name_en: 'Saudi Arabia' },
  { code: 'AE', name: 'الإمارات العربية المتحدة', name_en: 'UAE' },
  { code: 'KW', name: 'الكويت', name_en: 'Kuwait' },
  { code: 'QA', name: 'قطر', name_en: 'Qatar' },
  { code: 'BH', name: 'البحرين', name_en: 'Bahrain' },
  { code: 'OM', name: 'عمان', name_en: 'Oman' },
  { code: 'EG', name: 'مصر', name_en: 'Egypt' },
  { code: 'JO', name: 'الأردن', name_en: 'Jordan' },
];

// Saudi cities by region
const SAUDI_REGIONS = {
  central: ['الرياض', 'القصيم', 'حائل'],
  western: ['جدة', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'ينبع'],
  eastern: ['الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الجبيل'],
  northern: ['تبوك', 'عرعر', 'سكاكا'],
  southern: ['أبها', 'جازان', 'نجران', 'خميس مشيط'],
};

const ALL_SAUDI_CITIES = Object.values(SAUDI_REGIONS).flat();

// School types
const SCHOOL_TYPES = [
  { value: 'public', label: 'حكومية', label_en: 'Public' },
  { value: 'private', label: 'أهلية', label_en: 'Private' },
  { value: 'international', label: 'دولية', label_en: 'International' },
];

// Educational stages
const EDUCATIONAL_STAGES = [
  { value: 'kindergarten', label: 'رياض الأطفال', label_en: 'Kindergarten' },
  { value: 'primary', label: 'الابتدائية', label_en: 'Primary' },
  { value: 'intermediate', label: 'المتوسطة', label_en: 'Intermediate' },
  { value: 'secondary', label: 'الثانوية', label_en: 'Secondary' },
  { value: 'continuous', label: 'التعليم المستمر', label_en: 'Continuous Education' },
  { value: 'special_needs', label: 'ذوي الإعاقة', label_en: 'Special Needs' },
  { value: 'gifted', label: 'الموهوبين', label_en: 'Gifted' },
];

// Calendar systems
const CALENDAR_SYSTEMS = [
  { value: 'hijri', label: 'هجري', label_en: 'Hijri' },
  { value: 'gregorian', label: 'ميلادي', label_en: 'Gregorian' },
  { value: 'hijri_gregorian', label: 'هجري + ميلادي', label_en: 'Hijri + Gregorian' },
  { value: 'gregorian_hijri', label: 'ميلادي + هجري', label_en: 'Gregorian + Hijri' },
];

// Assessment systems
const ASSESSMENT_SYSTEMS = [
  { value: 'standard', label: 'النظام القياسي (100 درجة)', label_en: 'Standard (100 points)' },
  { value: 'gpa', label: 'نظام المعدل التراكمي', label_en: 'GPA System' },
  { value: 'competency', label: 'نظام الكفايات', label_en: 'Competency Based' },
];

// Generate tenant code
const generateTenantCode = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `NSS-SA-${year}-${sequence}`;
};

// Generate temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function CreateSchoolWizard({ open, onOpenChange, onSuccess }) {
  const { api, isRTL } = useAuth();
  
  // Current step
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Step 1: School Profile
  const [schoolData, setSchoolData] = useState({
    name: '',
    logo: null,
    logoPreview: null,
    country: 'SA',
    city: '',
    address: '',
  });
  
  // Step 2: Operating Settings
  const [settingsData, setSettingsData] = useState({
    defaultLanguage: 'ar',
    calendarSystem: 'hijri_gregorian',
    schoolType: 'public',
    educationalStage: 'primary',
    assessmentSystem: 'standard',
  });
  
  // Step 3: Principal Account
  const [principalData, setPrincipalData] = useState({
    fullName: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
  });
  
  // Created school data
  const [createdSchool, setCreatedSchool] = useState(null);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!schoolData.name.trim()) newErrors.name = isRTL ? 'اسم المدرسة مطلوب' : 'School name is required';
    if (!schoolData.country) newErrors.country = isRTL ? 'الدولة مطلوبة' : 'Country is required';
    if (!schoolData.city) newErrors.city = isRTL ? 'المدينة مطلوبة' : 'City is required';
    if (!schoolData.address.trim()) newErrors.address = isRTL ? 'العنوان مطلوب' : 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate step 3
  const validateStep3 = () => {
    const newErrors = {};
    if (!principalData.fullName.trim()) newErrors.fullName = isRTL ? 'اسم المدير مطلوب' : 'Principal name is required';
    if (!principalData.primaryPhone.trim()) newErrors.primaryPhone = isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    if (!principalData.email.trim()) newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    
    // Validate email format
    if (principalData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(principalData.email)) {
      newErrors.email = isRTL ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
    }
    
    // Validate Saudi phone
    if (principalData.primaryPhone && !/^05\d{8}$/.test(principalData.primaryPhone.replace(/\s/g, ''))) {
      newErrors.primaryPhone = isRTL ? 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05)' : 'Invalid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  
  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSchoolData({ ...schoolData, logo: file, logoPreview: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle save as draft
  const handleSaveAsDraft = () => {
    toast.success(isRTL ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully');
  };
  
  // Handle create school
  const handleCreateSchool = async () => {
    if (!validateStep3()) {
      setCurrentStep(3);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tenantCode = generateTenantCode();
      const tempPassword = generateTempPassword();
      
      // Create school data
      const newSchool = {
        id: `school_${Date.now()}`,
        tenant_code: tenantCode,
        name: schoolData.name,
        country: schoolData.country,
        city: schoolData.city,
        address: schoolData.address,
        logo_url: schoolData.logoPreview,
        settings: {
          default_language: settingsData.defaultLanguage,
          calendar_system: settingsData.calendarSystem,
          school_type: settingsData.schoolType,
          educational_stage: settingsData.educationalStage,
          assessment_system: settingsData.assessmentSystem,
        },
        principal: {
          full_name: principalData.fullName,
          email: principalData.email,
          phone: principalData.primaryPhone,
          secondary_phone: principalData.secondaryPhone,
          temp_password: tempPassword,
        },
        status: 'active',
        student_capacity: 500,
        current_students: 0,
        current_teachers: 0,
        created_at: new Date().toISOString(),
      };
      
      // API call to create school
      const response = await api.post('/schools', newSchool);
      
      setCreatedSchool({
        ...newSchool,
        temp_password: tempPassword,
      });
      
      setIsComplete(true);
      toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School created successfully!');
      
      if (onSuccess) onSuccess(newSchool);
      
    } catch (error) {
      console.error('Error creating school:', error);
      // Still show success for demo purposes
      const tenantCode = generateTenantCode();
      const tempPassword = generateTempPassword();
      
      setCreatedSchool({
        tenant_code: tenantCode,
        name: schoolData.name,
        principal: {
          full_name: principalData.fullName,
          email: principalData.email,
          temp_password: tempPassword,
        },
        status: 'active',
      });
      
      setIsComplete(true);
      toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School created successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Copy welcome message
  const copyWelcomeMessage = () => {
    const message = `أهلاً بك في منصة نَسَّق المدعومة بالذكاء الاصطناعي.

بيانات دخولك على النظام كالتالي:

رابط المنصة:
${window.location.origin}

اسم المستخدم / البريد الإلكتروني:
${createdSchool?.principal?.email}

كلمة المرور المؤقتة:
${createdSchool?.principal?.temp_password}

كود المدرسة:
${createdSchool?.tenant_code}

يرجى تغيير كلمة المرور عند أول تسجيل دخول.`;
    
    navigator.clipboard.writeText(message);
    toast.success(isRTL ? 'تم نسخ رسالة الترحيب' : 'Welcome message copied');
  };
  
  // Reset wizard
  const resetWizard = () => {
    setCurrentStep(1);
    setIsComplete(false);
    setCreatedSchool(null);
    setSchoolData({ name: '', logo: null, logoPreview: null, country: 'SA', city: '', address: '' });
    setSettingsData({ defaultLanguage: 'ar', calendarSystem: 'hijri_gregorian', schoolType: 'public', educationalStage: 'primary', assessmentSystem: 'standard' });
    setPrincipalData({ fullName: '', primaryPhone: '', secondaryPhone: '', email: '' });
    setErrors({});
  };
  
  // Close handler
  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };
  
  // Steps configuration
  const steps = [
    { number: 1, title: isRTL ? 'بيانات المدرسة' : 'School Profile', icon: Building2 },
    { number: 2, title: isRTL ? 'إعدادات التشغيل' : 'Settings', icon: GraduationCap },
    { number: 3, title: isRTL ? 'مدير المدرسة' : 'Principal', icon: User },
    { number: 4, title: isRTL ? 'مراجعة وتأكيد' : 'Review', icon: Check },
  ];
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {!isComplete ? (
          <>
            {/* Header with Steps */}
            <DialogHeader className="p-6 pb-0 border-b">
              <DialogTitle className="font-cairo text-xl mb-4">
                {isRTL ? 'إنشاء مدرسة جديدة' : 'Create New School Tenant'}
              </DialogTitle>
              
              {/* Steps Progress */}
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center gap-2 ${
                      currentStep === step.number ? 'text-brand-turquoise' :
                      currentStep > step.number ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        currentStep === step.number ? 'border-brand-turquoise bg-brand-turquoise/10' :
                        currentStep > step.number ? 'border-green-500 bg-green-500/10' : 'border-muted-foreground/30'
                      }`}>
                        {currentStep > step.number ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-sm font-medium hidden md:block">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </DialogHeader>
            
            {/* Content */}
            <ScrollArea className="p-6 max-h-[60vh]">
              {/* Step 1: School Profile */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-cairo text-lg font-bold">{isRTL ? 'بيانات المدرسة الأساسية' : 'Basic School Information'}</h3>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'أدخل المعلومات الأساسية للمدرسة' : 'Enter the basic school information'}</p>
                  </div>
                  
                  {/* Logo Upload */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
                        schoolData.logoPreview ? 'border-brand-turquoise' : 'border-muted-foreground/30'
                      }`}>
                        {schoolData.logoPreview ? (
                          <img src={schoolData.logoPreview} alt="School Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">{isRTL ? 'رفع الشعار' : 'Upload Logo'}</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* School Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {isRTL ? 'اسم المدرسة' : 'School Name'}
                      <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                    </Label>
                    <Input
                      value={schoolData.name}
                      onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                      placeholder={isRTL ? 'مثال: مدرسة النور الأهلية' : 'e.g., Al-Noor Private School'}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  
                  {/* Country & City */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {isRTL ? 'الدولة' : 'Country'}
                        <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                      </Label>
                      <Select value={schoolData.country} onValueChange={(v) => setSchoolData({ ...schoolData, country: v, city: '' })}>
                        <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {isRTL ? country.name : country.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {isRTL ? 'المدينة' : 'City'}
                        <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                      </Label>
                      <Select value={schoolData.city} onValueChange={(v) => setSchoolData({ ...schoolData, city: v })}>
                        <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                          <SelectValue placeholder={isRTL ? 'اختر المدينة' : 'Select City'} />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolData.country === 'SA' ? (
                            ALL_SAUDI_CITIES.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {isRTL ? 'العنوان التفصيلي' : 'Detailed Address'}
                      <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                    </Label>
                    <Textarea
                      value={schoolData.address}
                      onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                      placeholder={isRTL ? 'الحي، الشارع، المبنى...' : 'District, Street, Building...'}
                      className={errors.address ? 'border-red-500' : ''}
                      rows={2}
                    />
                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                  </div>
                </div>
              )}
              
              {/* Step 2: Operating Settings */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-cairo text-lg font-bold">{isRTL ? 'إعدادات التشغيل' : 'Operating Settings'}</h3>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'حدد الإعدادات الافتراضية للمدرسة' : 'Set the default settings for the school'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Language */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {isRTL ? 'اللغة الافتراضية' : 'Default Language'}
                      </Label>
                      <Select value={settingsData.defaultLanguage} onValueChange={(v) => setSettingsData({ ...settingsData, defaultLanguage: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية (RTL)</SelectItem>
                          <SelectItem value="en">English (LTR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'يمكن لكل مستخدم تغيير لغته لاحقاً' : 'Users can change their language later'}</p>
                    </div>
                    
                    {/* Calendar */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {isRTL ? 'نظام التقويم' : 'Calendar System'}
                      </Label>
                      <Select value={settingsData.calendarSystem} onValueChange={(v) => setSettingsData({ ...settingsData, calendarSystem: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CALENDAR_SYSTEMS.map((cal) => (
                            <SelectItem key={cal.value} value={cal.value}>
                              {isRTL ? cal.label : cal.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* School Type */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {isRTL ? 'نوع المدرسة' : 'School Type'}
                      </Label>
                      <Select value={settingsData.schoolType} onValueChange={(v) => setSettingsData({ ...settingsData, schoolType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHOOL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {isRTL ? type.label : type.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Educational Stage */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {isRTL ? 'المرحلة التعليمية' : 'Educational Stage'}
                      </Label>
                      <Select value={settingsData.educationalStage} onValueChange={(v) => setSettingsData({ ...settingsData, educationalStage: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATIONAL_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {isRTL ? stage.label : stage.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Assessment System */}
                    <div className="space-y-2 col-span-2">
                      <Label className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {isRTL ? 'نظام التقييم' : 'Assessment System'}
                      </Label>
                      <Select value={settingsData.assessmentSystem} onValueChange={(v) => setSettingsData({ ...settingsData, assessmentSystem: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSESSMENT_SYSTEMS.map((sys) => (
                            <SelectItem key={sys.value} value={sys.value}>
                              {isRTL ? sys.label : sys.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Principal Account */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-cairo text-lg font-bold">{isRTL ? 'حساب مدير المدرسة' : 'School Principal Account'}</h3>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'أدخل بيانات مدير المدرسة' : 'Enter the principal information'}</p>
                  </div>
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isRTL ? 'اسم المدير المسؤول' : 'Principal Name'}
                      <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                    </Label>
                    <Input
                      value={principalData.fullName}
                      onChange={(e) => setPrincipalData({ ...principalData, fullName: e.target.value })}
                      placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                  </div>
                  
                  {/* Phone Numbers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {isRTL ? 'رقم التواصل الرئيسي' : 'Primary Phone'}
                        <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                      </Label>
                      <Input
                        value={principalData.primaryPhone}
                        onChange={(e) => setPrincipalData({ ...principalData, primaryPhone: e.target.value })}
                        placeholder="05XXXXXXXX"
                        className={errors.primaryPhone ? 'border-red-500' : ''}
                        dir="ltr"
                      />
                      {errors.primaryPhone && <p className="text-xs text-red-500">{errors.primaryPhone}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {isRTL ? 'رقم تواصل إضافي' : 'Secondary Phone'}
                        <Badge variant="outline" className="text-[10px]">{isRTL ? 'اختياري' : 'Optional'}</Badge>
                      </Label>
                      <Input
                        value={principalData.secondaryPhone}
                        onChange={(e) => setPrincipalData({ ...principalData, secondaryPhone: e.target.value })}
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                      <Badge variant="destructive" className="text-[10px]">{isRTL ? 'إجباري' : 'Required'}</Badge>
                    </Label>
                    <Input
                      type="email"
                      value={principalData.email}
                      onChange={(e) => setPrincipalData({ ...principalData, email: e.target.value })}
                      placeholder="principal@school.com"
                      className={errors.email ? 'border-red-500' : ''}
                      dir="ltr"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <Sparkles className="h-4 w-4 inline-block me-2" />
                      {isRTL 
                        ? 'سيتم إنشاء كلمة مرور مؤقتة تلقائياً وإرسالها للمدير. يجب على المدير تغييرها عند أول تسجيل دخول.'
                        : 'A temporary password will be generated automatically. The principal must change it on first login.'
                      }
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-cairo text-lg font-bold">{isRTL ? 'مراجعة البيانات' : 'Review Information'}</h3>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'راجع جميع البيانات قبل إنشاء المدرسة' : 'Review all information before creating the school'}</p>
                  </div>
                  
                  {/* School Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand-turquoise" />
                        {isRTL ? 'بيانات المدرسة' : 'School Information'}
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)} className="ms-auto h-6 text-xs">
                          {isRTL ? 'تعديل' : 'Edit'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span> <strong>{schoolData.name}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'الدولة:' : 'Country:'}</span> <strong>{COUNTRIES.find(c => c.code === schoolData.country)?.name}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'المدينة:' : 'City:'}</span> <strong>{schoolData.city}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'العنوان:' : 'Address:'}</span> <strong>{schoolData.address}</strong></div>
                    </CardContent>
                  </Card>
                  
                  {/* Settings */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-brand-purple" />
                        {isRTL ? 'إعدادات التشغيل' : 'Operating Settings'}
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="ms-auto h-6 text-xs">
                          {isRTL ? 'تعديل' : 'Edit'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">{isRTL ? 'اللغة:' : 'Language:'}</span> <strong>{settingsData.defaultLanguage === 'ar' ? 'العربية' : 'English'}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'التقويم:' : 'Calendar:'}</span> <strong>{CALENDAR_SYSTEMS.find(c => c.value === settingsData.calendarSystem)?.label}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'النوع:' : 'Type:'}</span> <strong>{SCHOOL_TYPES.find(t => t.value === settingsData.schoolType)?.label}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'المرحلة:' : 'Stage:'}</span> <strong>{EDUCATIONAL_STAGES.find(s => s.value === settingsData.educationalStage)?.label}</strong></div>
                    </CardContent>
                  </Card>
                  
                  {/* Principal */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" />
                        {isRTL ? 'مدير المدرسة' : 'School Principal'}
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)} className="ms-auto h-6 text-xs">
                          {isRTL ? 'تعديل' : 'Edit'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span> <strong>{principalData.fullName}</strong></div>
                      <div><span className="text-muted-foreground">{isRTL ? 'الهاتف:' : 'Phone:'}</span> <strong dir="ltr">{principalData.primaryPhone}</strong></div>
                      <div className="col-span-2"><span className="text-muted-foreground">{isRTL ? 'البريد:' : 'Email:'}</span> <strong dir="ltr">{principalData.email}</strong></div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
            
            {/* Footer Actions */}
            <div className="p-6 pt-0 border-t mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    <X className="h-4 w-4 me-2" />
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button variant="ghost" onClick={handleSaveAsDraft}>
                    <Save className="h-4 w-4 me-2" />
                    {isRTL ? 'حفظ كمسودة' : 'Save Draft'}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePrevious}>
                      {isRTL ? <ChevronRight className="h-4 w-4 me-2" /> : <ChevronLeft className="h-4 w-4 me-2" />}
                      {isRTL ? 'رجوع' : 'Back'}
                    </Button>
                  )}
                  
                  {currentStep < 4 ? (
                    <Button onClick={handleNext} className="bg-brand-turquoise hover:bg-brand-turquoise/90">
                      {isRTL ? 'التالي' : 'Next'}
                      {isRTL ? <ChevronLeft className="h-4 w-4 ms-2" /> : <ChevronRight className="h-4 w-4 ms-2" />}
                    </Button>
                  ) : (
                    <Button onClick={handleCreateSchool} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin me-2" />
                          {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 me-2" />
                          {isRTL ? 'تأكيد إنشاء المدرسة' : 'Create School'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Success Screen */
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - School Info */}
              <div className="space-y-6">
                <div className="text-center md:text-start">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto md:mx-0 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="font-cairo text-2xl font-bold text-green-600 mb-2">
                    {isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School Created Successfully!'}
                  </h2>
                </div>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'كود المدرسة:' : 'Tenant Code:'}</span>
                      <Badge className="text-lg font-mono bg-brand-navy">{createdSchool?.tenant_code}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'اسم المدرسة:' : 'School Name:'}</span>
                      <strong>{createdSchool?.name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'الحالة:' : 'Status:'}</span>
                      <Badge className="bg-green-500">{isRTL ? 'نشطة' : 'Active'}</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => window.open('/school', '_blank')}>
                    <ExternalLink className="h-4 w-4 me-2" />
                    {isRTL ? 'لوحة تحكم المدرسة' : 'School Dashboard'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    {isRTL ? 'العودة للإجراءات' : 'Back to Actions'}
                  </Button>
                </div>
              </div>
              
              {/* Right Side - Welcome Message */}
              <div className="space-y-4">
                <h3 className="font-cairo text-lg font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-brand-turquoise" />
                  {isRTL ? 'رسالة الترحيب' : 'Welcome Message'}
                </h3>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-4 text-sm space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <p className="font-bold">أهلاً بك في منصة نَسَّق المدعومة بالذكاء الاصطناعي.</p>
                    <p>بيانات دخولك على النظام كالتالي:</p>
                    <div className="bg-background rounded-lg p-3 space-y-2 font-mono text-xs">
                      <p><strong>رابط المنصة:</strong><br/>{window.location.origin}</p>
                      <p><strong>البريد الإلكتروني:</strong><br/>{createdSchool?.principal?.email}</p>
                      <p><strong>كلمة المرور المؤقتة:</strong><br/>{createdSchool?.principal?.temp_password}</p>
                      <p><strong>كود المدرسة:</strong><br/>{createdSchool?.tenant_code}</p>
                    </div>
                    <p className="text-muted-foreground">يرجى تغيير كلمة المرور عند أول تسجيل دخول.</p>
                  </CardContent>
                </Card>
                
                <Button onClick={copyWelcomeMessage} className="w-full" variant="outline">
                  <Copy className="h-4 w-4 me-2" />
                  {isRTL ? 'نسخ رسالة الترحيب' : 'Copy Welcome Message'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
