import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  GraduationCap,
  User,
  Users,
  Heart,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Settings,
  Copy,
  Download,
  AlertTriangle,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  MapPin,
  QrCode,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, title_ar: 'بيانات الطالب', title_en: 'Student Info', icon: GraduationCap },
  { id: 2, title_ar: 'بيانات ولي الأمر', title_en: 'Parent Info', icon: Users },
  { id: 3, title_ar: 'البيانات الصحية', title_en: 'Health Info', icon: Heart },
  { id: 4, title_ar: 'مراجعة البيانات', title_en: 'Review', icon: CheckCircle2 },
  { id: 5, title_ar: 'تم الإنشاء', title_en: 'Success', icon: Sparkles },
];

const EDUCATION_LEVELS = [
  { id: 'primary', name_ar: 'المرحلة الابتدائية', name_en: 'Primary' },
  { id: 'middle', name_ar: 'المرحلة المتوسطة', name_en: 'Middle School' },
  { id: 'high', name_ar: 'المرحلة الثانوية', name_en: 'High School' },
];

const RELATIONSHIPS = [
  { id: 'father', name_ar: 'أب', name_en: 'Father' },
  { id: 'mother', name_ar: 'أم', name_en: 'Mother' },
  { id: 'guardian', name_ar: 'ولي أمر', name_en: 'Guardian' },
];

export default function AddStudentWizard({ 
  open, 
  onOpenChange, 
  onSuccess, 
  api, 
  isRTL = true,
  grades = [],
  classes = [],
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  
  // Form Data
  const [studentData, setStudentData] = useState({
    full_name: '',
    email: '',
    national_id: '',
    gender: 'male',
    date_of_birth: '',
    education_level: '',
    grade_id: '',
    class_id: '',
  });
  
  const [parentData, setParentData] = useState({
    full_name: '',
    national_id: '',
    phone: '',
    email: '',
    relationship: 'father',
    address: '',
  });
  
  const [healthData, setHealthData] = useState({
    health_status: '',
    allergies: '',
    medications: '',
    special_needs: '',
    notes: '',
  });
  
  // Parent detection
  const [existingParent, setExistingParent] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [checkingParent, setCheckingParent] = useState(false);
  const [linkToExisting, setLinkToExisting] = useState(false);
  
  // Result
  const [createdStudent, setCreatedStudent] = useState(null);
  const [createdParent, setCreatedParent] = useState(null);
  
  // Check for existing parent
  const checkParentExists = useCallback(async () => {
    if (!parentData.phone && !parentData.email && !parentData.national_id) return;
    
    setCheckingParent(true);
    try {
      const params = new URLSearchParams();
      if (parentData.phone) params.append('phone', parentData.phone);
      if (parentData.email) params.append('email', parentData.email);
      if (parentData.national_id) params.append('national_id', parentData.national_id);
      
      const response = await api.post(`/api/student-wizard/check-parent?${params.toString()}`);
      
      if (response.data?.found) {
        setExistingParent(response.data.parent);
        setSiblings(response.data.students || []);
      } else {
        setExistingParent(null);
        setSiblings([]);
      }
    } catch (error) {
      console.error('Error checking parent:', error);
    } finally {
      setCheckingParent(false);
    }
  }, [api, parentData.phone, parentData.email, parentData.national_id]);
  
  // Validation
  const isStepValid = () => {
    switch (step) {
      case 1:
        return studentData.full_name && 
               studentData.gender && 
               studentData.date_of_birth && 
               studentData.education_level && 
               studentData.grade_id;
      case 2:
        return parentData.full_name && 
               parentData.phone && 
               parentData.relationship;
      case 3:
        return true; // Health is optional
      case 4:
        return true;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (step === 2) {
      checkParentExists();
    }
    if (step < 5) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const requestData = {
        ...studentData,
        parent: {
          ...parentData,
          email: parentData.email || null,
        },
        health: healthData.health_status || healthData.allergies || healthData.medications ? {
          health_status: healthData.health_status || null,
          allergies: healthData.allergies ? healthData.allergies.split(',').map(a => a.trim()) : [],
          medications: healthData.medications ? healthData.medications.split(',').map(m => m.trim()) : [],
          special_needs: healthData.special_needs || null,
          notes: healthData.notes || null,
        } : null,
        link_to_parent_id: linkToExisting && existingParent ? existingParent.id : null,
      };
      
      const response = await api.post('/student-wizard/create', requestData);
      
      if (response.data?.success) {
        setCreatedStudent(response.data.student);
        setCreatedParent(response.data.parent);
        setSiblings(response.data.siblings?.list || []);
        setStep(5);
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Error creating student:', error);
      const errorMessage = error.response?.data?.detail || (isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyWelcomeMessage = () => {
    if (!createdStudent || !createdParent) return;
    
    const loginUrl = window.location.origin + '/login';
    const message = `السلام عليكم ورحمة الله وبركاته

ولي الأمر الكريم / ${createdParent.full_name}

يسعدنا إبلاغكم بأنه تم إتمام تسجيل الطالب ${createdStudent.full_name} بنجاح داخل المدرسة عبر منصة نَسَّق | NASSAQ.

أولًا: بيانات الطالب
━━━━━━━━━━━━━━━━━━━━
📛 اسم الطالب: ${createdStudent.full_name}
🆔 رقم الطالب: ${createdStudent.student_id}
📧 البريد الإلكتروني: ${createdStudent.email}
🔑 كلمة المرور المؤقتة: ${createdStudent.temp_password}

ثانيًا: بيانات ولي الأمر
━━━━━━━━━━━━━━━━━━━━
👤 اسم ولي الأمر: ${createdParent.full_name}
📧 البريد الإلكتروني: ${createdParent.email}
📱 رقم الهاتف: ${createdParent.phone}
${createdParent.is_new ? `🔑 كلمة المرور المؤقتة: ${createdParent.temp_password}` : '(حساب ولي الأمر موجود مسبقًا)'}

🔗 رابط الدخول للمنصة:
${loginUrl}

━━━━━━━━━━━━━━━━━━━━
نرجو تغيير كلمة المرور عند أول تسجيل دخول.

مع خالص التحية،
إدارة المدرسة
منصة نَسَّق | NASSAQ`;

    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    toast.success(isRTL ? 'تم نسخ رسالة الترحيب' : 'Welcome message copied');
  };
  
  const downloadQRCode = () => {
    if (!createdStudent?.qr_code) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${createdStudent.qr_code}`;
    link.download = `student_${createdStudent.student_id}_qr.png`;
    link.click();
    toast.success(isRTL ? 'تم تحميل رمز QR' : 'QR Code downloaded');
  };
  
  const resetForm = () => {
    setStep(1);
    setStudentData({
      full_name: '',
      email: '',
      national_id: '',
      gender: 'male',
      date_of_birth: '',
      education_level: '',
      grade_id: '',
      class_id: '',
    });
    setParentData({
      full_name: '',
      national_id: '',
      phone: '',
      email: '',
      relationship: 'father',
      address: '',
    });
    setHealthData({
      health_status: '',
      allergies: '',
      medications: '',
      special_needs: '',
      notes: '',
    });
    setExistingParent(null);
    setSiblings([]);
    setLinkToExisting(false);
    setCreatedStudent(null);
    setCreatedParent(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5 flex-shrink-0">
          <DialogTitle className="font-cairo text-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {isRTL ? 'إضافة طالب جديد' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? 'إضافة طالب جديد مع ولي أمره' : 'Add a new student with parent information'}
          </DialogDescription>
          
          <div className="flex items-center justify-between mt-4 px-2">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.id ? 'text-brand-navy' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step > s.id ? 'bg-green-500 text-white' :
                    step === s.id ? 'bg-brand-navy text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </div>
                  <span className="text-xs hidden md:inline">{isRTL ? s.title_ar : s.title_en}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم الكامل *' : 'Full Name *'}</Label>
                  <Input
                    value={studentData.full_name}
                    onChange={(e) => setStudentData({...studentData, full_name: e.target.value})}
                    placeholder={isRTL ? 'أدخل اسم الطالب الكامل' : 'Enter full name'}
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}</Label>
                  <Input
                    type="email"
                    value={studentData.email}
                    onChange={(e) => setStudentData({...studentData, email: e.target.value})}
                    placeholder="student@example.com"
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'رقم الهوية (اختياري)' : 'National ID (optional)'}</Label>
                  <Input
                    value={studentData.national_id}
                    onChange={(e) => setStudentData({...studentData, national_id: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'الجنس *' : 'Gender *'}</Label>
                  <Select value={studentData.gender} onValueChange={(val) => setStudentData({...studentData, gender: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{isRTL ? 'ذكر' : 'Male'}</SelectItem>
                      <SelectItem value="female">{isRTL ? 'أنثى' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'تاريخ الميلاد *' : 'Date of Birth *'}</Label>
                  <Input type="date" value={studentData.date_of_birth} onChange={(e) => setStudentData({...studentData, date_of_birth: e.target.value})} className="rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'المرحلة التعليمية *' : 'Education Level *'}</Label>
                  <Select value={studentData.education_level} onValueChange={(val) => setStudentData({...studentData, education_level: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? 'اختر المرحلة' : 'Select level'} /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map(level => (<SelectItem key={level.id} value={level.id}>{isRTL ? level.name_ar : level.name_en}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'الصف *' : 'Grade *'}</Label>
                  <Select value={studentData.grade_id} onValueChange={(val) => setStudentData({...studentData, grade_id: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? 'اختر الصف' : 'Select grade'} /></SelectTrigger>
                    <SelectContent>
                      {grades.length > 0 ? grades.map(grade => (<SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>)) : (
                        <><SelectItem value="grade-1">الصف الأول</SelectItem><SelectItem value="grade-2">الصف الثاني</SelectItem><SelectItem value="grade-3">الصف الثالث</SelectItem></>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'الفصل (اختياري)' : 'Class (optional)'}</Label>
                  <Select value={studentData.class_id} onValueChange={(val) => setStudentData({...studentData, class_id: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? 'اختر الفصل' : 'Select class'} /></SelectTrigger>
                    <SelectContent>
                      {classes.length > 0 ? classes.map(cls => (<SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)) : (
                        <><SelectItem value="class-a">شعبة أ</SelectItem><SelectItem value="class-b">شعبة ب</SelectItem></>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              {existingParent && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">{isRTL ? 'تم العثور على ولي أمر مسجل مسبقاً!' : 'Existing parent found!'}</p>
                      <p className="text-sm text-blue-700 mt-1">{existingParent.full_name} - {existingParent.phone}</p>
                      {siblings.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-blue-700">{isRTL ? 'الأبناء المسجلون:' : 'Registered children:'}</p>
                          <div className="flex flex-wrap gap-2 mt-1">{siblings.map(s => (<Badge key={s.id} variant="secondary">{s.name}</Badge>))}</div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant={linkToExisting ? "default" : "outline"} onClick={() => setLinkToExisting(true)} className="rounded-lg">{isRTL ? 'نعم، ربط بهذا الحساب' : 'Yes, link'}</Button>
                        <Button size="sm" variant={!linkToExisting ? "default" : "outline"} onClick={() => setLinkToExisting(false)} className="rounded-lg">{isRTL ? 'لا، إنشاء حساب جديد' : 'No, create new'}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'اسم ولي الأمر *' : 'Parent Name *'}</Label>
                  <Input value={parentData.full_name} onChange={(e) => setParentData({...parentData, full_name: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'صلة القرابة *' : 'Relationship *'}</Label>
                  <Select value={parentData.relationship} onValueChange={(val) => setParentData({...parentData, relationship: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{RELATIONSHIPS.map(rel => (<SelectItem key={rel.id} value={rel.id}>{isRTL ? rel.name_ar : rel.name_en}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'رقم الهاتف *' : 'Phone *'}</Label>
                  <Input value={parentData.phone} onChange={(e) => setParentData({...parentData, phone: e.target.value})} onBlur={checkParentExists} placeholder="05xxxxxxxx" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}</Label>
                  <Input type="email" value={parentData.email} onChange={(e) => setParentData({...parentData, email: e.target.value})} onBlur={checkParentExists} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'رقم الهوية (اختياري)' : 'National ID (optional)'}</Label>
                  <Input value={parentData.national_id} onChange={(e) => setParentData({...parentData, national_id: e.target.value})} onBlur={checkParentExists} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان (اختياري)' : 'Address (optional)'}</Label>
                  <Input value={parentData.address} onChange={(e) => setParentData({...parentData, address: e.target.value})} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/30 border"><p className="text-sm text-muted-foreground">{isRTL ? 'البيانات الصحية اختيارية' : 'Health info is optional'}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>{isRTL ? 'الحالة الصحية العامة' : 'Health Status'}</Label>
                  <Textarea value={healthData.health_status} onChange={(e) => setHealthData({...healthData, health_status: e.target.value})} className="rounded-xl" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الحساسيات' : 'Allergies'}</Label>
                  <Input value={healthData.allergies} onChange={(e) => setHealthData({...healthData, allergies: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الأدوية' : 'Medications'}</Label>
                  <Input value={healthData.medications} onChange={(e) => setHealthData({...healthData, medications: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{isRTL ? 'الاحتياجات الخاصة' : 'Special Needs'}</Label>
                  <Textarea value={healthData.special_needs} onChange={(e) => setHealthData({...healthData, special_needs: e.target.value})} className="rounded-xl" rows={2} />
                </div>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-blue-100/50">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><GraduationCap className="h-5 w-5 text-blue-600" />{isRTL ? 'بيانات الطالب' : 'Student'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span><p className="font-medium">{studentData.full_name}</p></div>
                  <div><span className="text-muted-foreground">{isRTL ? 'الجنس:' : 'Gender:'}</span><p className="font-medium">{studentData.gender === 'male' ? 'ذكر' : 'أنثى'}</p></div>
                  <div><span className="text-muted-foreground">{isRTL ? 'تاريخ الميلاد:' : 'DOB:'}</span><p className="font-medium">{studentData.date_of_birth}</p></div>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-gradient-to-r from-green-50 to-green-100/50">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><Users className="h-5 w-5 text-green-600" />{isRTL ? 'ولي الأمر' : 'Parent'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span><p className="font-medium">{parentData.full_name}</p></div>
                  <div><span className="text-muted-foreground">{isRTL ? 'الهاتف:' : 'Phone:'}</span><p className="font-medium">{parentData.phone}</p></div>
                </div>
              </div>
            </div>
          )}
          
          {step === 5 && createdStudent && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4"><CheckCircle2 className="h-10 w-10 text-green-600" /></div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">{isRTL ? 'تم إنشاء الحساب بنجاح!' : 'Success!'}</h2>
              </div>
              <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
                <div className="flex items-start gap-4">
                  {createdStudent.qr_code && (<img src={`data:image/png;base64,${createdStudent.qr_code}`} alt="QR" className="w-24 h-24 rounded-lg border" />)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2"><Badge className="bg-brand-navy">{createdStudent.student_id}</Badge><span className="font-semibold text-lg">{createdStudent.full_name}</span></div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><Mail className="h-4 w-4 inline me-1" />{createdStudent.email}</div>
                      <div>{isRTL ? 'كلمة المرور:' : 'Password:'} <span className="font-mono bg-muted px-2 py-0.5 rounded">{createdStudent.temp_password}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              {createdParent && (
                <div className="p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">{createdParent.full_name}</p><p className="text-sm text-muted-foreground">{createdParent.email} • {createdParent.phone}</p></div>
                    <Badge variant={createdParent.is_new ? "default" : "secondary"}>{createdParent.is_new ? 'حساب جديد' : 'موجود'}</Badge>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={copyWelcomeMessage} variant="outline" className="rounded-xl"><Copy className="h-4 w-4 me-2" />{copiedMessage ? 'تم النسخ!' : 'نسخ رسالة الترحيب'}</Button>
                <Button onClick={downloadQRCode} variant="outline" className="rounded-xl"><QrCode className="h-4 w-4 me-2" />تحميل QR</Button>
                <Button onClick={resetForm} className="bg-brand-navy rounded-xl"><UserPlus className="h-4 w-4 me-2" />إضافة طالب آخر</Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex justify-between w-full">
            {step > 1 && step < 5 && (<Button variant="outline" onClick={prevStep} className="rounded-xl"><ChevronRight className="h-4 w-4 me-2 rtl:rotate-180" />{isRTL ? 'السابق' : 'Previous'}</Button>)}
            {step === 1 && <div />}
            {step < 4 && (<Button onClick={nextStep} disabled={!isStepValid()} className="bg-brand-navy rounded-xl">{isRTL ? 'التالي' : 'Next'}<ChevronLeft className="h-4 w-4 ms-2 rtl:rotate-180" /></Button>)}
            {step === 4 && (<Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 rounded-xl">{isSubmitting ? (<><Settings className="h-4 w-4 me-2 animate-spin" />{isRTL ? 'جاري الإنشاء...' : 'Creating...'}</>) : (<><CheckCircle2 className="h-4 w-4 me-2" />{isRTL ? 'إنشاء الحساب' : 'Create'}</>)}</Button>)}
            {step === 5 && (<Button onClick={() => onOpenChange(false)} className="bg-brand-navy rounded-xl ms-auto">{isRTL ? 'إغلاق' : 'Close'}</Button>)}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
