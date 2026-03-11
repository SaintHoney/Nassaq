import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  School,
  Users,
  User,
  FileText,
  MapPin,
  Building,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Step 1: Class Info
const Step1ClassInfo = ({ data, onChange, errors, options, isRTL }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <School className="h-8 w-8 text-purple-600" />
      </div>
      <h3 className="text-xl font-bold font-cairo">{isRTL ? 'بيانات الفصل' : 'Class Information'}</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{isRTL ? 'اسم الفصل (عربي)' : 'Class Name (Arabic)'} <span className="text-red-500">*</span></Label>
        <Input
          value={data.name_ar || ''}
          onChange={(e) => onChange('name_ar', e.target.value)}
          placeholder={isRTL ? 'مثال: 1-أ' : 'Example: 1-A'}
          className={errors.name_ar ? 'border-red-500' : ''}
          data-testid="class-name-ar"
        />
        {errors.name_ar && <p className="text-red-500 text-sm">{errors.name_ar}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'اسم الفصل (إنجليزي)' : 'Class Name (English)'}</Label>
        <Input value={data.name_en || ''} onChange={(e) => onChange('name_en', e.target.value)} dir="ltr" data-testid="class-name-en" />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الصف الدراسي' : 'Grade'} <span className="text-red-500">*</span></Label>
        <Select value={data.grade_id || ''} onValueChange={(val) => onChange('grade_id', val)}>
          <SelectTrigger className={errors.grade_id ? 'border-red-500' : ''} data-testid="class-grade">
            <SelectValue placeholder={isRTL ? 'اختر الصف' : 'Select Grade'} />
          </SelectTrigger>
          <SelectContent>
            {options.grades?.map((g) => (
              <SelectItem key={g.id} value={g.id}>{isRTL ? g.name_ar : g.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.grade_id && <p className="text-red-500 text-sm">{errors.grade_id}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'نوع الفصل' : 'Class Type'}</Label>
        <Select value={data.class_type || 'regular'} onValueChange={(val) => onChange('class_type', val)}>
          <SelectTrigger data-testid="class-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.classTypes?.map((t) => (
              <SelectItem key={t.code} value={t.code}>{isRTL ? t.name_ar : t.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'السعة القصوى' : 'Capacity'}</Label>
        <Input
          type="number"
          value={data.capacity || 30}
          onChange={(e) => onChange('capacity', parseInt(e.target.value) || 30)}
          min="1"
          max="50"
          data-testid="class-capacity"
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'رقم الغرفة' : 'Room Number'}</Label>
        <Input value={data.room_number || ''} onChange={(e) => onChange('room_number', e.target.value)} data-testid="class-room" />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'الطابق' : 'Floor'}</Label>
        <Input type="number" value={data.floor || ''} onChange={(e) => onChange('floor', parseInt(e.target.value) || '')} data-testid="class-floor" />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'المبنى' : 'Building'}</Label>
        <Input value={data.building || ''} onChange={(e) => onChange('building', e.target.value)} data-testid="class-building" />
      </div>
    </div>
  </div>
);

// Step 2: Homeroom Teacher
const Step2Teacher = ({ data, onChange, options, isRTL }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold font-cairo">{isRTL ? 'معلم الفصل' : 'Homeroom Teacher'}</h3>
      <p className="text-muted-foreground text-sm mt-1">{isRTL ? 'اختر المعلم المشرف على الفصل (اختياري)' : 'Select homeroom teacher (optional)'}</p>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{isRTL ? 'معلم الفصل' : 'Homeroom Teacher'}</Label>
        <Select value={data.homeroom_teacher_id || 'none'} onValueChange={(val) => onChange('homeroom_teacher_id', val === 'none' ? null : val)}>
          <SelectTrigger data-testid="class-homeroom-teacher">
            <SelectValue placeholder={isRTL ? 'اختر المعلم' : 'Select Teacher'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{isRTL ? 'بدون معلم' : 'No Teacher'}</SelectItem>
            {options.teachers?.map((t) => (
              <SelectItem key={t.teacher_id} value={t.teacher_id}>{t.full_name_ar || t.full_name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {options.teachers?.length === 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-amber-700 font-tajawal">{isRTL ? 'لا يوجد معلمين متاحين، يمكنك إضافة معلمين لاحقاً' : 'No teachers available, you can add teachers later'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

// Step 3: Students
const Step3Students = ({ data, onChange, options, isRTL }) => {
  const filteredStudents = options.students?.filter(s => !data.grade_id || s.grade_id === data.grade_id) || [];
  
  const toggleStudent = (studentId) => {
    const current = data.student_ids || [];
    const updated = current.includes(studentId)
      ? current.filter(id => id !== studentId)
      : [...current, studentId];
    onChange('student_ids', updated);
  };

  const selectAll = () => onChange('student_ids', filteredStudents.map(s => s.student_id));
  const clearAll = () => onChange('student_ids', []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">{isRTL ? 'الطلاب' : 'Students'}</h3>
        <p className="text-muted-foreground text-sm mt-1">{isRTL ? 'اختر الطلاب للفصل (اختياري)' : 'Select students for class (optional)'}</p>
      </div>

      <div className="flex justify-between items-center">
        <Badge variant="outline">{isRTL ? `${(data.student_ids || []).length} طالب محدد` : `${(data.student_ids || []).length} selected`}</Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>{isRTL ? 'تحديد الكل' : 'Select All'}</Button>
          <Button variant="outline" size="sm" onClick={clearAll}>{isRTL ? 'إلغاء الكل' : 'Clear All'}</Button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-lg p-2">
        {filteredStudents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{isRTL ? 'لا يوجد طلاب متاحين' : 'No students available'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                onClick={() => toggleStudent(student.student_id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  (data.student_ids || []).includes(student.student_id)
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                <p className="font-medium text-sm">{student.full_name_ar || student.full_name_en}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">{student.student_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Step 4: Review
const Step4Review = ({ data, options, isRTL }) => {
  const getGradeName = (id) => options.grades?.find(g => g.id === id)?.[isRTL ? 'name_ar' : 'name_en'] || id;
  const getTeacherName = (id) => options.teachers?.find(t => t.teacher_id === id)?.full_name_ar || '';

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
          <CardTitle className="flex items-center gap-2 text-lg"><School className="h-5 w-5 text-purple-600" />{isRTL ? 'بيانات الفصل' : 'Class Info'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</p><p className="font-medium">{data.name_ar}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'الصف' : 'Grade'}</p><p className="font-medium">{getGradeName(data.grade_id)}</p></div>
            <div><p className="text-muted-foreground">{isRTL ? 'السعة' : 'Capacity'}</p><p className="font-medium">{data.capacity || 30}</p></div>
            {data.room_number && <div><p className="text-muted-foreground">{isRTL ? 'الغرفة' : 'Room'}</p><p className="font-medium">{data.room_number}</p></div>}
            {data.homeroom_teacher_id && <div><p className="text-muted-foreground">{isRTL ? 'المعلم' : 'Teacher'}</p><p className="font-medium">{getTeacherName(data.homeroom_teacher_id)}</p></div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-blue-600" />{isRTL ? 'الطلاب' : 'Students'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{isRTL ? `${(data.student_ids || []).length} طالب` : `${(data.student_ids || []).length} students`}</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

// Success Step
const SuccessStep = ({ result, isRTL, onClose, onAddAnother }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircle2 className="h-10 w-10 text-green-600" />
    </div>
    <div>
      <h3 className="text-2xl font-bold font-cairo text-green-700">{isRTL ? 'تم إنشاء الفصل بنجاح!' : 'Class Created Successfully!'}</h3>
      <p className="text-lg font-mono mt-2 text-purple-700">{result.class_id}</p>
    </div>
    <div className="flex justify-center gap-3">
      <Button variant="outline" onClick={onClose}>{isRTL ? 'إغلاق' : 'Close'}</Button>
      <Button onClick={onAddAnother} className="bg-purple-600 hover:bg-purple-700">{isRTL ? 'إنشاء فصل آخر' : 'Create Another'}</Button>
    </div>
  </div>
);

// Main Wizard
export const CreateClassWizard = ({ open, onOpenChange, onSuccess, api }) => {
  const { isRTL } = useTheme();
  const { token } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [data, setData] = useState({ capacity: 30, class_type: 'regular', student_ids: [] });
  const [options, setOptions] = useState({ grades: [], teachers: [], students: [], classTypes: [] });

  // Handle close - supports onOpenChange pattern
  const handleCloseDialog = () => {
    handleReset();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (open) fetchOptions();
  }, [open]);

  const fetchOptions = async () => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [gradesRes, teachersRes, studentsRes, typesRes] = await Promise.all([
        axios.get(`${API_URL}/api/classes/options/grades`, { headers }).catch(() => ({ data: { grades: [] } })),
        axios.get(`${API_URL}/api/classes/options/teachers`, { headers }).catch(() => ({ data: { teachers: [] } })),
        axios.get(`${API_URL}/api/classes/options/students`, { headers }).catch(() => ({ data: { students: [] } })),
        axios.get(`${API_URL}/api/classes/options/class-types`, { headers }).catch(() => ({ data: { types: [] } })),
      ]);

      setOptions({
        grades: gradesRes.data.grades || [],
        teachers: teachersRes.data.teachers || [],
        students: studentsRes.data.students || [],
        classTypes: typesRes.data.types || [
          { code: 'regular', name_ar: 'عادي', name_en: 'Regular' },
          { code: 'advanced', name_ar: 'متقدم', name_en: 'Advanced' },
        ],
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!data.name_ar?.trim()) newErrors.name_ar = isRTL ? 'مطلوب' : 'Required';
      if (!data.grade_id) newErrors.grade_id = isRTL ? 'مطلوب' : 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const response = await axios.post(`${API_URL}/api/classes/create`, data, { headers });
      if (response.data.success) {
        setResult(response.data);
        setCurrentStep(5);
        toast.success(isRTL ? 'تم إنشاء الفصل' : 'Class created');
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setData({ capacity: 30, class_type: 'regular', student_ids: [] });
    setErrors({});
    setResult(null);
  };

  const steps = [
    { num: 1, title: isRTL ? 'البيانات' : 'Info', icon: School },
    { num: 2, title: isRTL ? 'المعلم' : 'Teacher', icon: User },
    { num: 3, title: isRTL ? 'الطلاب' : 'Students', icon: Users },
    { num: 4, title: isRTL ? 'المراجعة' : 'Review', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="create-class-wizard">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-cairo text-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <School className="h-5 w-5 text-purple-600" />
            </div>
            {isRTL ? 'إنشاء فصل جديد' : 'Create New Class'}
          </DialogTitle>
        </DialogHeader>

        {currentStep < 5 && (
          <div className="flex items-center justify-center gap-2 my-4">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  currentStep === step.num ? 'bg-purple-600 text-white' : currentStep > step.num ? 'bg-purple-100 text-purple-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.num ? <CheckCircle2 className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
                {idx < steps.length - 1 && <div className={`w-6 h-0.5 mx-1 ${currentStep > step.num ? 'bg-purple-400' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
        ) : (
          <div className="py-4">
            {currentStep === 1 && <Step1ClassInfo data={data} onChange={(k, v) => setData(p => ({ ...p, [k]: v }))} errors={errors} options={options} isRTL={isRTL} />}
            {currentStep === 2 && <Step2Teacher data={data} onChange={(k, v) => setData(p => ({ ...p, [k]: v }))} options={options} isRTL={isRTL} />}
            {currentStep === 3 && <Step3Students data={data} onChange={(k, v) => setData(p => ({ ...p, [k]: v }))} options={options} isRTL={isRTL} />}
            {currentStep === 4 && <Step4Review data={data} options={options} isRTL={isRTL} />}
            {currentStep === 5 && result && <SuccessStep result={result} isRTL={isRTL} onClose={handleCloseDialog} onAddAnother={handleReset} />}
          </div>
        )}

        {!loading && currentStep < 5 && (
          <DialogFooter className="flex justify-between gap-3 mt-4">
            <div>{currentStep > 1 && <Button variant="outline" onClick={handleBack}>{isRTL ? 'السابق' : 'Back'}</Button>}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCloseDialog}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              {currentStep < 4 ? (
                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">{isRTL ? 'التالي' : 'Next'}</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <CheckCircle2 className="h-4 w-4 me-2" />}
                  {isRTL ? 'إنشاء' : 'Create'}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassWizard;
