// =============================================================
// صفحة إعدادات المدرسة - School Settings Page
// الصفحة المرجعية الأساسية داخل حساب مدير المدرسة
// مصدر جميع البيانات المستخدمة في صفحة الجدول المدرسي
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Settings,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  Activity,
  Target,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Save,
  RefreshCw,
  ChevronRight,
  CalendarDays,
  School,
  UserPlus,
  Layers,
  Grid3X3,
  Building2,
  FileText,
  Loader2,
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sun,
  Moon,
  Eye,
  Shield,
  CalendarClock,
  ListChecks,
  Briefcase,
  Timer,
  XCircle,
} from 'lucide-react';

// Wizards
import { AddTeacherWizard } from '../components/wizards/AddTeacherWizard';
import AddStudentWizard from '../components/wizards/AddStudentWizard';
import { CreateClassWizard } from '../components/wizards/CreateClassWizard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// =============================================================
// قسم معلومات المدرسة الأساسية
// =============================================================
const SchoolInfoSection = ({ schoolInfo, onSave, loading, isRTL }) => {
  const [info, setInfo] = useState(schoolInfo || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (schoolInfo) setInfo(schoolInfo);
  }, [schoolInfo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(info);
      toast.success(isRTL ? 'تم حفظ معلومات المدرسة بنجاح' : 'School info saved successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حفظ المعلومات' : 'Error saving info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-brand-navy/20 bg-gradient-to-br from-brand-navy/5 to-white" data-testid="school-info-section">
      <CardHeader>
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="w-14 h-14 rounded-2xl bg-brand-navy flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="text-right flex-1">
            <CardTitle className="font-cairo text-xl">{isRTL ? 'معلومات المدرسة' : 'School Information'}</CardTitle>
            <CardDescription>
              {isRTL ? 'البيانات الأساسية للمدرسة - أي تعديل هنا ينعكس على النظام بالكامل' : 'Basic school data - changes reflect system-wide'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-navy" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* School Name Arabic */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <span>{isRTL ? 'اسم المدرسة بالعربية' : 'School Name (Arabic)'}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={info.name || ''}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: مدرسة النور' : 'e.g., Al-Noor School'}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              
              {/* School Name English */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <span>{isRTL ? 'اسم المدرسة بالإنجليزية' : 'School Name (English)'}</span>
                </Label>
                <Input
                  value={info.name_en || ''}
                  onChange={(e) => setInfo({ ...info, name_en: e.target.value })}
                  placeholder="e.g., Al-Noor School"
                  dir="ltr"
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                </Label>
                <Input
                  type="email"
                  value={info.email || ''}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  placeholder="school@example.com"
                  dir="ltr"
                />
              </div>
              
              {/* Phone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{isRTL ? 'رقم الهاتف' : 'Phone'}</span>
                </Label>
                <Input
                  value={info.phone || ''}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  placeholder="+966 XX XXX XXXX"
                  dir="ltr"
                />
              </div>
              
              {/* City */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{isRTL ? 'المدينة' : 'City'}</span>
                </Label>
                <Input
                  value={info.city || ''}
                  onChange={(e) => setInfo({ ...info, city: e.target.value })}
                  placeholder={isRTL ? 'الرياض' : 'Riyadh'}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              
              {/* Region */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <span>{isRTL ? 'المنطقة' : 'Region'}</span>
                </Label>
                <Input
                  value={info.region || ''}
                  onChange={(e) => setInfo({ ...info, region: e.target.value })}
                  placeholder={isRTL ? 'منطقة الرياض' : 'Riyadh Region'}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              
              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2 flex-row-reverse justify-end">
                  <span>{isRTL ? 'العنوان' : 'Address'}</span>
                </Label>
                <Textarea
                  value={info.address || ''}
                  onChange={(e) => setInfo({ ...info, address: e.target.value })}
                  placeholder={isRTL ? 'العنوان الكامل للمدرسة' : 'Full school address'}
                  className="text-right"
                  dir="rtl"
                  rows={2}
                />
              </div>
            </div>
            
            <Separator />
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-brand-navy hover:bg-brand-navy/90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Save className="h-4 w-4 me-2" />
              )}
              {isRTL ? 'حفظ المعلومات' : 'Save Information'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم بيانات المعلمين
// =============================================================
const TeachersSection = ({ teachers, loading, onRefresh, onAddTeacher, onEditTeacher, isRTL }) => {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white" data-testid="teachers-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'بيانات المعلمين' : 'Teachers Data'}</CardTitle>
              <CardDescription>
                {isRTL ? 'المعلمين المسجلين - متاحين لمحرك الجدولة' : 'Registered teachers - Available for scheduling'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-100 text-blue-700">
            {teachers.length} {isRTL ? 'معلم' : 'Teachers'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4 flex-wrap">
          <Button 
            onClick={onAddTeacher}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="add-teacher-settings-btn"
          >
            <UserPlus className="h-4 w-4 me-2" />
            {isRTL ? 'معلم / معلمين' : 'Teacher(s)'}
          </Button>
          <Button variant="outline" onClick={onRefresh} size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-blue-200 rounded-xl">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-blue-200" />
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'لا يوجد معلمين' : 'No Teachers'}</h3>
            <p className="text-muted-foreground mb-4">{isRTL ? 'قم بإضافة المعلمين ليصبحوا متاحين للجدولة' : 'Add teachers to make them available for scheduling'}</p>
            <Button onClick={onAddTeacher} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'معلم / معلمين' : 'Teacher(s)'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
            {teachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="p-3 rounded-xl border bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onEditTeacher(teacher)}
              >
                <div className="flex items-center gap-3 flex-row-reverse">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                      {teacher.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-sm">{teacher.full_name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.subject || teacher.specialization || (isRTL ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم بيانات الفصول
// =============================================================
const ClassesSection = ({ classes, loading, onRefresh, onAddClass, onEditClass, isRTL }) => {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white" data-testid="classes-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <School className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'بيانات الفصول' : 'Classes Data'}</CardTitle>
              <CardDescription>
                {isRTL ? 'الفصول المسجلة - متاحة لمحرك الجدولة' : 'Registered classes - Available for scheduling'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-purple-100 text-purple-700">
            {classes.length} {isRTL ? 'فصل' : 'Classes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4 flex-wrap">
          <Button 
            onClick={onAddClass}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="add-class-settings-btn"
          >
            <Plus className="h-4 w-4 me-2" />
            {isRTL ? 'فصل / فصول' : 'Class(es)'}
          </Button>
          <Button variant="outline" onClick={onRefresh} size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          </div>
        ) : classes.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-purple-200 rounded-xl">
            <School className="h-16 w-16 mx-auto mb-4 text-purple-200" />
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'لا يوجد فصول' : 'No Classes'}</h3>
            <p className="text-muted-foreground mb-4">{isRTL ? 'قم بإضافة الفصول ليتم ربطها بالجدول' : 'Add classes to link them to the schedule'}</p>
            <Button onClick={onAddClass} variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'فصل / فصول' : 'Class(es)'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
            {classes.map((cls) => (
              <div 
                key={cls.id} 
                className="p-3 rounded-xl border bg-white hover:border-purple-300 hover:shadow-md transition-all cursor-pointer text-center group"
                onClick={() => onEditClass(cls)}
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-700 font-bold text-sm">{cls.grade}{cls.section}</span>
                </div>
                <p className="font-medium text-sm">{cls.name}</p>
                <p className="text-xs text-muted-foreground">{cls.student_count || 0} {isRTL ? 'طالب' : 'students'}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم المواد الدراسية
// =============================================================
const SubjectsSection = ({ subjects, grades, loading, onAddSubject, onDeleteSubject, isRTL }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectNameEn, setNewSubjectNameEn] = useState('');
  const [weeklyPeriods, setWeeklyPeriods] = useState(4);

  const handleAddSubject = () => {
    if (!newSubjectName) {
      toast.error(isRTL ? 'يرجى إدخال اسم المادة' : 'Please enter subject name');
      return;
    }
    onAddSubject({
      grade_id: selectedGrade,
      name: newSubjectName,
      name_en: newSubjectNameEn,
      weekly_periods: weeklyPeriods,
    });
    setShowAddDialog(false);
    setNewSubjectName('');
    setNewSubjectNameEn('');
    setWeeklyPeriods(4);
    setSelectedGrade('');
  };

  const handleConfirmDelete = (subject) => {
    setShowDeleteConfirm(subject);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDeleteSubject(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white" data-testid="subjects-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'المواد الدراسية' : 'Subjects'}</CardTitle>
              <CardDescription>
                {isRTL ? 'المواد المعتمدة - مدخلات محرك الجدولة' : 'Approved subjects - Scheduling inputs'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-emerald-100 text-emerald-700">
            {subjects.length} {isRTL ? 'مادة' : 'Subjects'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 mb-4"
          data-testid="add-subject-btn"
        >
          <Plus className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة مادة دراسية' : 'Add Subject'}
        </Button>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-emerald-200 rounded-xl">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-emerald-200" />
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'لا توجد مواد' : 'No Subjects'}</h3>
            <p className="text-muted-foreground">{isRTL ? 'قم بإضافة المواد الدراسية' : 'Add subjects'}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
            {subjects.map((subject) => (
              <Badge 
                key={subject.id} 
                variant="outline"
                className="px-3 py-2 text-sm bg-white hover:bg-emerald-50 cursor-pointer group flex items-center gap-2"
              >
                <span>{subject.name}</span>
                <span className="text-xs text-muted-foreground">({subject.weekly_periods || 4} {isRTL ? 'حصص' : 'periods'})</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleConfirmDelete(subject); }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add Subject Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة مادة دراسية' : 'Add Subject'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {grades.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'الصف (اختياري)' : 'Grade (Optional)'}</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر الصف' : 'Select grade'} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم المادة بالعربية' : 'Subject Name (Arabic)'} <span className="text-red-500">*</span></Label>
                <Input 
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder={isRTL ? 'مثال: الرياضيات' : 'e.g., Mathematics'}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم المادة بالإنجليزية' : 'Subject Name (English)'}</Label>
                <Input 
                  value={newSubjectNameEn}
                  onChange={(e) => setNewSubjectNameEn(e.target.value)}
                  placeholder="e.g., Mathematics"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'عدد الحصص الأسبوعية' : 'Weekly Periods'}</Label>
                <Input 
                  type="number"
                  min="1"
                  max="10"
                  value={weeklyPeriods}
                  onChange={(e) => setWeeklyPeriods(parseInt(e.target.value) || 4)}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleAddSubject} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right font-cairo">
                {isRTL ? 'هل تريد حذف هذه المادة؟' : 'Delete this subject?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                {isRTL 
                  ? `سيتم حذف المادة "${showDeleteConfirm?.name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.`
                  : `The subject "${showDeleteConfirm?.name}" will be permanently deleted. This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 flex-row-reverse">
              <AlertDialogCancel>{isRTL ? 'لا' : 'No'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {isRTL ? 'نعم، احذف' : 'Yes, Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم أيام العمل
// =============================================================
const WorkDaysSection = ({ workDays, officialHolidays, onSaveWorkDays, onAddHoliday, isRTL }) => {
  const [days, setDays] = useState(workDays || {
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
    saturday: false,
  });
  const [saving, setSaving] = useState(false);
  const [showHolidayDialog, setShowHolidayDialog] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', start_date: '', end_date: '' });

  const dayNames = {
    sunday: isRTL ? 'الأحد' : 'Sunday',
    monday: isRTL ? 'الاثنين' : 'Monday',
    tuesday: isRTL ? 'الثلاثاء' : 'Tuesday',
    wednesday: isRTL ? 'الأربعاء' : 'Wednesday',
    thursday: isRTL ? 'الخميس' : 'Thursday',
    friday: isRTL ? 'الجمعة' : 'Friday',
    saturday: isRTL ? 'السبت' : 'Saturday',
  };

  const toggleDay = (day) => {
    setDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveWorkDays(days);
      toast.success(isRTL ? 'تم حفظ أيام العمل' : 'Work days saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.start_date) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    onAddHoliday(newHoliday);
    setShowHolidayDialog(false);
    setNewHoliday({ name: '', start_date: '', end_date: '' });
  };

  const workingDaysCount = Object.values(days).filter(Boolean).length;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white" data-testid="workdays-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'أيام العمل' : 'Work Days'}</CardTitle>
              <CardDescription>
                {isRTL ? 'تحديد أيام الدراسة والإجازات' : 'Define school days and holidays'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2 bg-amber-100 text-amber-700">
            {workingDaysCount} {isRTL ? 'أيام دراسة' : 'School Days'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Days Grid */}
        <div>
          <Label className="mb-3 block text-right font-medium">{isRTL ? 'أيام الأسبوع الدراسية' : 'Weekly School Days'}</Label>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(dayNames).map(([key, name]) => (
              <div
                key={key}
                onClick={() => toggleDay(key)}
                className={`
                  p-4 rounded-xl text-center cursor-pointer transition-all border-2
                  ${days[key] 
                    ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' 
                    : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-gray-400'
                  }
                `}
              >
                <p className="font-bold text-sm">{name}</p>
                <p className="text-[10px] mt-1">
                  {days[key] ? (isRTL ? 'دراسة' : 'School') : (isRTL ? 'إجازة' : 'Off')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Official Holidays */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-row-reverse">
            <Label className="font-medium">{isRTL ? 'الإجازات الرسمية السنوية' : 'Official Annual Holidays'}</Label>
            <Button variant="outline" size="sm" onClick={() => setShowHolidayDialog(true)}>
              <Plus className="h-4 w-4 me-1" />
              {isRTL ? 'إضافة إجازة' : 'Add Holiday'}
            </Button>
          </div>
          
          {(!officialHolidays || officialHolidays.length === 0) ? (
            <div className="py-4 text-center text-muted-foreground border-2 border-dashed border-amber-200 rounded-xl">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-amber-200" />
              <p className="text-sm">{isRTL ? 'لم يتم تحديد إجازات رسمية' : 'No official holidays defined'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {officialHolidays.map((holiday, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border flex items-center justify-between flex-row-reverse">
                  <span className="font-medium">{holiday.name}</span>
                  <span className="text-sm text-muted-foreground">{holiday.start_date} - {holiday.end_date || holiday.start_date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>

        {/* Add Holiday Dialog */}
        <Dialog open={showHolidayDialog} onOpenChange={setShowHolidayDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة إجازة رسمية' : 'Add Official Holiday'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم الإجازة' : 'Holiday Name'} <span className="text-red-500">*</span></Label>
                <Input
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: عيد الفطر' : 'e.g., Eid Al-Fitr'}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'تاريخ البداية' : 'Start Date'} <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={newHoliday.start_date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'تاريخ النهاية' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={newHoliday.end_date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowHolidayDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleAddHoliday} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم عدد الحصص في اليوم
// =============================================================
const PeriodsPerDaySection = ({ periodsPerDay, onSave, isRTL }) => {
  const [periods, setPeriods] = useState(periodsPerDay || 7);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(periods);
      setShowDialog(false);
      toast.success(isRTL ? 'تم حفظ عدد الحصص' : 'Periods count saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white" data-testid="periods-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Grid3X3 className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'عدد الحصص في اليوم' : 'Periods Per Day'}</CardTitle>
              <CardDescription>
                {isRTL ? 'عدد الحصص اليومية المعتمدة لبناء شبكة الجدول' : 'Daily periods for schedule grid'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-3xl px-6 py-3 bg-cyan-100 text-cyan-700 font-bold">
            {periodsPerDay || 7}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDialog(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Edit2 className="h-4 w-4 me-2" />
          {isRTL ? 'تعديل' : 'Edit'}
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'عدد الحصص في اليوم' : 'Periods Per Day'}</DialogTitle>
              <DialogDescription className="text-right">
                {isRTL ? 'حدد عدد الحصص اليومية المعتمدة في المدرسة' : 'Set the number of daily periods'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="text-right block mb-2">{isRTL ? 'عدد الحصص' : 'Number of Periods'}</Label>
              <Input 
                type="number"
                min="1"
                max="12"
                value={periods}
                onChange={(e) => setPeriods(parseInt(e.target.value) || 7)}
                className="text-center text-2xl font-bold"
              />
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم بداية ونهاية اليوم الدراسي
// =============================================================
const SchoolTimingSection = ({ timing, onSave, isRTL }) => {
  const [startTime, setStartTime] = useState(timing?.start || '07:00');
  const [endTime, setEndTime] = useState(timing?.end || '14:00');
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (timing) {
      setStartTime(timing.start || '07:00');
      setEndTime(timing.end || '14:00');
    }
  }, [timing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ start: startTime, end: endTime });
      setShowDialog(false);
      toast.success(isRTL ? 'تم حفظ أوقات اليوم الدراسي' : 'School timing saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white" data-testid="timing-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'بداية ونهاية اليوم الدراسي' : 'School Day Timing'}</CardTitle>
              <CardDescription>
                {isRTL ? 'تحديد وقت بداية ونهاية الدوام المدرسي' : 'Set start and end times'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-4 py-2 bg-green-100 text-green-700">
              <Sun className="h-3 w-3 me-1" />
              {timing?.start || '07:00'}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-orange-100 text-orange-700">
              <Moon className="h-3 w-3 me-1" />
              {timing?.end || '14:00'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Edit2 className="h-4 w-4 me-2" />
          {isRTL ? 'تحديد/تعديل' : 'Set/Edit'}
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'أوقات اليوم الدراسي' : 'School Day Timing'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block flex items-center gap-2 flex-row-reverse justify-end">
                  <Sun className="h-4 w-4 text-green-600" />
                  {isRTL ? 'وقت البداية' : 'Start Time'}
                </Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-center text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block flex items-center gap-2 flex-row-reverse justify-end">
                  <Moon className="h-4 w-4 text-orange-600" />
                  {isRTL ? 'وقت النهاية' : 'End Time'}
                </Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="text-center text-lg" />
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم فترات الاستراحة
// =============================================================
const BreaksSection = ({ breaks, onSave, isRTL }) => {
  const [breaksList, setBreaksList] = useState(breaks || []);
  const [showDialog, setShowDialog] = useState(false);
  const [newBreak, setNewBreak] = useState({ start: '', end: '', name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (breaks) setBreaksList(breaks);
  }, [breaks]);

  const handleAddBreak = () => {
    if (!newBreak.start || !newBreak.end) {
      toast.error(isRTL ? 'يرجى تحديد وقت البداية والنهاية' : 'Please set start and end times');
      return;
    }
    const updated = [...breaksList, { ...newBreak, id: Date.now().toString() }];
    setBreaksList(updated);
    setNewBreak({ start: '', end: '', name: '' });
    setShowDialog(false);
  };

  const handleRemoveBreak = (id) => {
    setBreaksList(breaksList.filter(b => b.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(breaksList);
      toast.success(isRTL ? 'تم حفظ فترات الاستراحة' : 'Breaks saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-white" data-testid="breaks-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Coffee className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'فترات الاستراحة' : 'Break Periods'}</CardTitle>
              <CardDescription>{isRTL ? 'تحديد أوقات الاستراحة خلال اليوم - تستثنى من الجدولة' : 'Define break times - excluded from scheduling'}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-orange-100 text-orange-700">
            {breaksList.length} {isRTL ? 'استراحة' : 'Breaks'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4 flex-wrap">
          <Button onClick={() => setShowDialog(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 me-2" />
            {isRTL ? 'إضافة استراحة' : 'Add Break'}
          </Button>
          {breaksList.length > 0 && (
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          )}
        </div>

        {breaksList.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-orange-200 rounded-xl">
            <Coffee className="h-12 w-12 mx-auto mb-3 text-orange-200" />
            <p className="text-muted-foreground">{isRTL ? 'لا توجد فترات استراحة محددة (القيمة الافتراضية: صفر)' : 'No breaks defined (default: zero)'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {breaksList.map((breakItem) => (
              <div key={breakItem.id} className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-orange-300 transition-colors">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <Badge variant="outline" className="font-mono">{breakItem.start} - {breakItem.end}</Badge>
                  {breakItem.name && <span className="text-sm font-medium">{breakItem.name}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveBreak(breakItem.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة فترة استراحة' : 'Add Break'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم الاستراحة (اختياري)' : 'Break Name (Optional)'}</Label>
                <Input value={newBreak.name} onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })} placeholder={isRTL ? 'مثال: استراحة الفطور' : 'e.g., Breakfast break'} className="text-right" dir="rtl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'البداية' : 'Start'} <span className="text-red-500">*</span></Label>
                  <Input type="time" value={newBreak.start} onChange={(e) => setNewBreak({ ...newBreak, start: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'النهاية' : 'End'} <span className="text-red-500">*</span></Label>
                  <Input type="time" value={newBreak.end} onChange={(e) => setNewBreak({ ...newBreak, end: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAddBreak} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم النصاب التدريسي للمعلمين
// =============================================================
const TeachingLoadSection = ({ teachers, teachingLoads, onSave, isRTL }) => {
  const [loads, setLoads] = useState(teachingLoads || {});
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [loadValue, setLoadValue] = useState(18);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teachingLoads) setLoads(teachingLoads);
  }, [teachingLoads]);

  const handleSaveLoad = async () => {
    if (!selectedTeacher) {
      toast.error(isRTL ? 'يرجى اختيار معلم' : 'Please select a teacher');
      return;
    }
    setSaving(true);
    try {
      const newLoads = { ...loads, [selectedTeacher]: loadValue };
      setLoads(newLoads);
      await onSave(newLoads);
      setShowDialog(false);
      setSelectedTeacher('');
      toast.success(isRTL ? 'تم حفظ النصاب التدريسي' : 'Teaching load saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const teachersWithLoad = Object.entries(loads).map(([teacherId, load]) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? { ...teacher, load } : null;
  }).filter(Boolean);

  return (
    <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50/50 to-white" data-testid="teaching-load-section">
      <CardHeader>
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <Target className="h-6 w-6 text-teal-600" />
          </div>
          <div className="text-right flex-1">
            <CardTitle className="font-cairo">{isRTL ? 'النصاب التدريسي للمعلمين' : 'Teaching Load'}</CardTitle>
            <CardDescription>{isRTL ? 'تحديد عدد الحصص الأسبوعية لكل معلم - يستخدمه محرك الجدولة للتوزيع العادل' : 'Weekly periods per teacher - Used for fair distribution'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDialog(true)} className="bg-teal-600 hover:bg-teal-700 mb-4">
          <Edit2 className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة/تعديل نصاب' : 'Add/Edit Load'}
        </Button>

        {teachersWithLoad.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-teal-200 rounded-xl">
            <Target className="h-12 w-12 mx-auto mb-3 text-teal-200" />
            <p className="text-muted-foreground">{isRTL ? 'لم يتم تحديد النصاب لأي معلم' : 'No teaching loads defined'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {teachersWithLoad.map((teacher) => (
              <div key={teacher.id} className="p-3 rounded-lg bg-white border flex items-center justify-between flex-row-reverse hover:border-teal-300 transition-colors">
                <span className="text-sm font-medium truncate">{teacher.full_name}</span>
                <Badge variant="outline" className="bg-teal-100 text-teal-700 font-bold">{teacher.load} {isRTL ? 'حصة' : 'periods'}</Badge>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'تحديد النصاب التدريسي' : 'Set Teaching Load'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اختر المعلم' : 'Select Teacher'} <span className="text-red-500">*</span></Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر معلم' : 'Select teacher'} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'النصاب الأسبوعي (عدد الحصص)' : 'Weekly Load (Periods)'}</Label>
                <Input type="number" min="1" max="30" value={loadValue} onChange={(e) => setLoadValue(parseInt(e.target.value) || 18)} className="text-center text-xl font-bold" />
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleSaveLoad} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم القيود الإدارية
// =============================================================
const ConstraintsSection = ({ teachers, constraints, onSave, isRTL }) => {
  const [constraintsList, setConstraintsList] = useState(constraints || []);
  const [showDialog, setShowDialog] = useState(false);
  const [newConstraint, setNewConstraint] = useState({ type: '', teacher_id: '', day: '', period: '', description: '' });
  const [saving, setSaving] = useState(false);

  const constraintTypes = [
    { id: 'no_first_period', name: isRTL ? 'لا يبدأ الحصة الأولى' : 'No first period' },
    { id: 'no_last_period', name: isRTL ? 'لا يدرس الحصة الأخيرة' : 'No last period' },
    { id: 'no_day', name: isRTL ? 'لا يعمل في يوم معين' : 'Not available on day' },
    { id: 'max_consecutive', name: isRTL ? 'حد أقصى للحصص المتتالية' : 'Max consecutive periods' },
    { id: 'custom', name: isRTL ? 'قيد مخصص' : 'Custom constraint' },
  ];

  const dayOptions = [
    { id: 'sunday', name: isRTL ? 'الأحد' : 'Sunday' },
    { id: 'monday', name: isRTL ? 'الاثنين' : 'Monday' },
    { id: 'tuesday', name: isRTL ? 'الثلاثاء' : 'Tuesday' },
    { id: 'wednesday', name: isRTL ? 'الأربعاء' : 'Wednesday' },
    { id: 'thursday', name: isRTL ? 'الخميس' : 'Thursday' },
  ];

  useEffect(() => {
    if (constraints) setConstraintsList(constraints);
  }, [constraints]);

  const handleAddConstraint = async () => {
    if (!newConstraint.type) {
      toast.error(isRTL ? 'يرجى اختيار نوع القيد' : 'Please select constraint type');
      return;
    }
    setSaving(true);
    try {
      const updated = [...constraintsList, { ...newConstraint, id: Date.now().toString() }];
      setConstraintsList(updated);
      await onSave(updated);
      setShowDialog(false);
      setNewConstraint({ type: '', teacher_id: '', day: '', period: '', description: '' });
      toast.success(isRTL ? 'تم إضافة القيد' : 'Constraint added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveConstraint = async (id) => {
    const updated = constraintsList.filter(c => c.id !== id);
    setConstraintsList(updated);
    await onSave(updated);
    toast.success(isRTL ? 'تم حذف القيد' : 'Constraint removed');
  };

  return (
    <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50/50 to-white" data-testid="constraints-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-rose-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'القيود الإدارية' : 'Administrative Constraints'}</CardTitle>
              <CardDescription>{isRTL ? 'قيود يلتزم بها محرك الجدولة عند التوزيع' : 'Rules the scheduling engine must follow'}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-rose-100 text-rose-700">
            {constraintsList.length} {isRTL ? 'قيد' : 'Constraints'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDialog(true)} className="bg-rose-600 hover:bg-rose-700 mb-4">
          <Plus className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة قيد إداري' : 'Add Constraint'}
        </Button>

        {constraintsList.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-rose-200 rounded-xl">
            <Shield className="h-12 w-12 mx-auto mb-3 text-rose-200" />
            <p className="text-muted-foreground">{isRTL ? 'لا توجد قيود إدارية محددة' : 'No constraints defined'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {constraintsList.map((constraint) => {
              const teacher = teachers.find(t => t.id === constraint.teacher_id);
              const typeInfo = constraintTypes.find(t => t.id === constraint.type);
              const dayInfo = dayOptions.find(d => d.id === constraint.day);
              return (
                <div key={constraint.id} className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-rose-300 transition-colors">
                  <div className="flex items-center gap-3 flex-row-reverse flex-wrap">
                    <Badge variant="outline" className="bg-rose-100 text-rose-700">{typeInfo?.name || constraint.type}</Badge>
                    {teacher && <span className="text-sm">{teacher.full_name}</span>}
                    {dayInfo && <Badge variant="secondary">{dayInfo.name}</Badge>}
                    {constraint.description && <span className="text-xs text-muted-foreground">({constraint.description})</span>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveConstraint(constraint.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة قيد إداري' : 'Add Constraint'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'نوع القيد' : 'Constraint Type'} <span className="text-red-500">*</span></Label>
                <Select value={newConstraint.type} onValueChange={(v) => setNewConstraint({ ...newConstraint, type: v })}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر نوع القيد' : 'Select type'} /></SelectTrigger>
                  <SelectContent>
                    {constraintTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'المعلم (اختياري)' : 'Teacher (Optional)'}</Label>
                <Select value={newConstraint.teacher_id} onValueChange={(v) => setNewConstraint({ ...newConstraint, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر المعلم' : 'Select teacher'} /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(newConstraint.type === 'no_day') && (
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'اليوم' : 'Day'}</Label>
                  <Select value={newConstraint.day} onValueChange={(v) => setNewConstraint({ ...newConstraint, day: v })}>
                    <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر اليوم' : 'Select day'} /></SelectTrigger>
                    <SelectContent>
                      {dayOptions.map((day) => (
                        <SelectItem key={day.id} value={day.id}>{day.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}</Label>
                <Textarea value={newConstraint.description} onChange={(e) => setNewConstraint({ ...newConstraint, description: e.target.value })} placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'} className="text-right" dir="rtl" rows={2} />
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAddConstraint} disabled={saving} className="bg-rose-600 hover:bg-rose-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Plus className="h-4 w-4 me-2" />}
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم أيام الأنشطة
// =============================================================
const ActivityDaysSection = ({ activityDays, onAddActivity, onDeleteActivity, isRTL }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({ date: '', name: '', notes: '' });

  const handleAdd = () => {
    if (!newActivity.date) {
      toast.error(isRTL ? 'يرجى تحديد التاريخ' : 'Please select a date');
      return;
    }
    onAddActivity(newActivity);
    setShowDialog(false);
    setNewActivity({ date: '', name: '', notes: '' });
  };

  return (
    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50/50 to-white" data-testid="activity-days-section">
      <CardHeader>
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-right">
              <CardTitle className="font-cairo">{isRTL ? 'أيام الأنشطة' : 'Activity Days'}</CardTitle>
              <CardDescription>{isRTL ? 'أيام الأنشطة تستثنى من الجدول العادي' : 'Activity days are excluded from regular schedule'}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-pink-100 text-pink-700">
            {activityDays.length} {isRTL ? 'يوم' : 'Days'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDialog(true)} className="bg-pink-600 hover:bg-pink-700 mb-4">
          <Plus className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة يوم نشاط' : 'Add Activity Day'}
        </Button>

        {activityDays.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-pink-200 rounded-xl">
            <Activity className="h-12 w-12 mx-auto mb-3 text-pink-200" />
            <p className="text-muted-foreground">{isRTL ? 'لا توجد أيام أنشطة محددة (القيمة الافتراضية: صفر)' : 'No activity days defined (default: zero)'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activityDays.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-pink-300 transition-colors">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <Badge variant="outline" className="font-mono">{activity.date}</Badge>
                  {activity.name && <span className="text-sm font-medium">{activity.name}</span>}
                  {activity.notes && <span className="text-xs text-muted-foreground">({activity.notes})</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDeleteActivity(activity.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة يوم نشاط' : 'Add Activity Day'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'التاريخ' : 'Date'} <span className="text-red-500">*</span></Label>
                <Input type="date" value={newActivity.date} onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم النشاط (اختياري)' : 'Activity Name (Optional)'}</Label>
                <Input value={newActivity.name} onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })} placeholder={isRTL ? 'مثال: يوم رياضي' : 'e.g., Sports Day'} className="text-right" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}</Label>
                <Textarea value={newActivity.notes} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} className="text-right" dir="rtl" rows={2} />
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAdd} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم التوافر
// =============================================================
const AvailabilitySection = ({ teachers, availability, onSave, isRTL }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [availableDays, setAvailableDays] = useState([]);
  const [saving, setSaving] = useState(false);

  const dayOptions = [
    { id: 'sunday', name: isRTL ? 'الأحد' : 'Sunday' },
    { id: 'monday', name: isRTL ? 'الاثنين' : 'Monday' },
    { id: 'tuesday', name: isRTL ? 'الثلاثاء' : 'Tuesday' },
    { id: 'wednesday', name: isRTL ? 'الأربعاء' : 'Wednesday' },
    { id: 'thursday', name: isRTL ? 'الخميس' : 'Thursday' },
  ];

  const handleSave = async () => {
    if (!selectedTeacher) {
      toast.error(isRTL ? 'يرجى اختيار معلم' : 'Please select a teacher');
      return;
    }
    setSaving(true);
    try {
      await onSave({ teacher_id: selectedTeacher, available_days: availableDays });
      setShowDialog(false);
      setSelectedTeacher('');
      setAvailableDays([]);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId) => {
    setAvailableDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const teachersWithAvailability = Object.entries(availability).map(([teacherId, data]) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? { ...teacher, availability: data } : null;
  }).filter(Boolean);

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/50 to-white" data-testid="availability-section">
      <CardHeader>
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
            <CalendarClock className="h-6 w-6 text-violet-600" />
          </div>
          <div className="text-right flex-1">
            <CardTitle className="font-cairo">{isRTL ? 'التوافر' : 'Availability'}</CardTitle>
            <CardDescription>{isRTL ? 'تحديد مدى توفر المعلمين - يستخدم للتحقق أثناء الجدولة' : 'Teacher availability - Used for validation during scheduling'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDialog(true)} className="bg-violet-600 hover:bg-violet-700 mb-4">
          <Edit2 className="h-4 w-4 me-2" />
          {isRTL ? 'تعديل التوافر' : 'Edit Availability'}
        </Button>

        {teachersWithAvailability.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-violet-200 rounded-xl">
            <CalendarClock className="h-12 w-12 mx-auto mb-3 text-violet-200" />
            <p className="text-muted-foreground">{isRTL ? 'لم يتم تحديد توفر لأي معلم (الافتراضي: متوفر دائماً)' : 'No availability set (default: always available)'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {teachersWithAvailability.map((teacher) => (
              <div key={teacher.id} className="p-3 rounded-lg bg-white border hover:border-violet-300 transition-colors">
                <p className="font-medium text-sm truncate mb-2">{teacher.full_name}</p>
                <div className="flex flex-wrap gap-1">
                  {(teacher.availability?.available_days || []).map(day => (
                    <Badge key={day} variant="secondary" className="text-xs">{dayOptions.find(d => d.id === day)?.name || day}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-cairo">{isRTL ? 'تعديل توفر المعلم' : 'Edit Teacher Availability'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اختر المعلم' : 'Select Teacher'} <span className="text-red-500">*</span></Label>
                <Select value={selectedTeacher} onValueChange={(v) => {
                  setSelectedTeacher(v);
                  setAvailableDays(availability[v]?.available_days || []);
                }}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر معلم' : 'Select teacher'} /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'الأيام المتاحة' : 'Available Days'}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {dayOptions.map(day => (
                    <div
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`p-2 rounded-lg text-center cursor-pointer transition-all border text-sm ${
                        availableDays.includes(day.id)
                          ? 'bg-violet-100 border-violet-500 text-violet-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {day.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// قسم الهيكل الأكاديمي (المراحل، الصفوف، الشعب، الفصول الدراسية)
// =============================================================
const AcademicStructureSection = ({ 
  stages, grades, sections, terms,
  onAddStage, onDeleteStage, onAddGrade, onDeleteGrade,
  onAddSection, onDeleteSection, onAddTerm, onDeleteTerm,
  isRTL 
}) => {
  const [activeTab, setActiveTab] = useState('stages');
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showTermDialog, setShowTermDialog] = useState(false);
  
  const [newStage, setNewStage] = useState({ name: '', name_en: '', order: 1 });
  const [newGrade, setNewGrade] = useState({ name: '', name_en: '', stage_id: '' });
  const [newSection, setNewSection] = useState({ name: '', grade_id: '' });
  const [newTerm, setNewTerm] = useState({ name: '', name_en: '', start_date: '', end_date: '', is_active: true });

  const handleAddStage = () => {
    if (!newStage.name) { toast.error(isRTL ? 'يرجى إدخال اسم المرحلة' : 'Please enter stage name'); return; }
    onAddStage(newStage);
    setShowStageDialog(false);
    setNewStage({ name: '', name_en: '', order: 1 });
  };

  const handleAddGrade = () => {
    if (!newGrade.name) { toast.error(isRTL ? 'يرجى إدخال اسم الصف' : 'Please enter grade name'); return; }
    onAddGrade(newGrade);
    setShowGradeDialog(false);
    setNewGrade({ name: '', name_en: '', stage_id: '' });
  };

  const handleAddSection = () => {
    if (!newSection.name) { toast.error(isRTL ? 'يرجى إدخال اسم الشعبة' : 'Please enter section name'); return; }
    onAddSection(newSection);
    setShowSectionDialog(false);
    setNewSection({ name: '', grade_id: '' });
  };

  const handleAddTerm = () => {
    if (!newTerm.name || !newTerm.start_date || !newTerm.end_date) { 
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields'); 
      return; 
    }
    onAddTerm(newTerm);
    setShowTermDialog(false);
    setNewTerm({ name: '', name_en: '', start_date: '', end_date: '', is_active: true });
  };

  return (
    <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50/50 to-white" data-testid="academic-structure-section">
      <CardHeader>
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
            <Layers className="h-6 w-6 text-sky-600" />
          </div>
          <div className="text-right flex-1">
            <CardTitle className="font-cairo">{isRTL ? 'الهيكل الأكاديمي' : 'Academic Structure'}</CardTitle>
            <CardDescription>{isRTL ? 'المراحل التعليمية، الصفوف، الشعب، والفصول الدراسية' : 'Stages, grades, sections, and academic terms'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="stages">{isRTL ? 'المراحل' : 'Stages'}</TabsTrigger>
            <TabsTrigger value="grades">{isRTL ? 'الصفوف' : 'Grades'}</TabsTrigger>
            <TabsTrigger value="sections">{isRTL ? 'الشعب' : 'Sections'}</TabsTrigger>
            <TabsTrigger value="terms">{isRTL ? 'الفصول' : 'Terms'}</TabsTrigger>
          </TabsList>

          {/* Stages Tab */}
          <TabsContent value="stages">
            <Button onClick={() => setShowStageDialog(true)} className="bg-sky-600 hover:bg-sky-700 mb-4">
              <Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة مرحلة' : 'Add Stage'}
            </Button>
            {stages.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-sky-200 rounded-xl">
                <Layers className="h-12 w-12 mx-auto mb-3 text-sky-200" />
                <p className="text-muted-foreground">{isRTL ? 'لا توجد مراحل تعليمية' : 'No educational stages'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stages.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-sky-300">
                    <span className="font-medium">{stage.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteStage(stage.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades">
            <Button onClick={() => setShowGradeDialog(true)} className="bg-sky-600 hover:bg-sky-700 mb-4">
              <Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة صف' : 'Add Grade'}
            </Button>
            {grades.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-sky-200 rounded-xl">
                <ListChecks className="h-12 w-12 mx-auto mb-3 text-sky-200" />
                <p className="text-muted-foreground">{isRTL ? 'لا توجد صفوف دراسية' : 'No grades'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-sky-300">
                    <span className="font-medium text-sm">{grade.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteGrade(grade.id)} className="text-red-500 hover:text-red-700 h-8 w-8">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <Button onClick={() => setShowSectionDialog(true)} className="bg-sky-600 hover:bg-sky-700 mb-4">
              <Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة شعبة' : 'Add Section'}
            </Button>
            {sections.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-sky-200 rounded-xl">
                <Grid3X3 className="h-12 w-12 mx-auto mb-3 text-sky-200" />
                <p className="text-muted-foreground">{isRTL ? 'لا توجد شعب' : 'No sections'}</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <Badge key={section.id} variant="outline" className="px-3 py-2 bg-white hover:bg-sky-50 group">
                    {section.name}
                    <button onClick={() => onDeleteSection(section.id)} className="ms-2 text-red-500 hover:text-red-700">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms">
            <Button onClick={() => setShowTermDialog(true)} className="bg-sky-600 hover:bg-sky-700 mb-4">
              <Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة فصل دراسي' : 'Add Term'}
            </Button>
            {terms.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-sky-200 rounded-xl">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 text-sky-200" />
                <p className="text-muted-foreground">{isRTL ? 'لا توجد فصول دراسية' : 'No academic terms'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {terms.map((term) => (
                  <div key={term.id} className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-sky-300">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <span className="font-medium">{term.name}</span>
                      <Badge variant={term.is_active ? "default" : "secondary"}>{term.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}</Badge>
                      <span className="text-sm text-muted-foreground">{term.start_date} - {term.end_date}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteTerm(term.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stage Dialog */}
        <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة مرحلة تعليمية' : 'Add Educational Stage'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم المرحلة' : 'Stage Name'} <span className="text-red-500">*</span></Label>
                <Input value={newStage.name} onChange={(e) => setNewStage({ ...newStage, name: e.target.value })} placeholder={isRTL ? 'مثال: المرحلة الابتدائية' : 'e.g., Primary'} className="text-right" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'الاسم بالإنجليزية' : 'Name (English)'}</Label>
                <Input value={newStage.name_en} onChange={(e) => setNewStage({ ...newStage, name_en: e.target.value })} placeholder="e.g., Primary" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'الترتيب' : 'Order'}</Label>
                <Input type="number" min="1" value={newStage.order} onChange={(e) => setNewStage({ ...newStage, order: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowStageDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAddStage} className="bg-sky-600 hover:bg-sky-700"><Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grade Dialog */}
        <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة صف دراسي' : 'Add Grade'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم الصف' : 'Grade Name'} <span className="text-red-500">*</span></Label>
                <Input value={newGrade.name} onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })} placeholder={isRTL ? 'مثال: الصف الأول' : 'e.g., Grade 1'} className="text-right" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'الاسم بالإنجليزية' : 'Name (English)'}</Label>
                <Input value={newGrade.name_en} onChange={(e) => setNewGrade({ ...newGrade, name_en: e.target.value })} placeholder="e.g., Grade 1" dir="ltr" />
              </div>
              {stages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'المرحلة' : 'Stage'}</Label>
                  <Select value={newGrade.stage_id} onValueChange={(v) => setNewGrade({ ...newGrade, stage_id: v })}>
                    <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر المرحلة' : 'Select stage'} /></SelectTrigger>
                    <SelectContent>{stages.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowGradeDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAddGrade} className="bg-sky-600 hover:bg-sky-700"><Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Section Dialog */}
        <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة شعبة' : 'Add Section'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم الشعبة' : 'Section Name'} <span className="text-red-500">*</span></Label>
                <Input value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} placeholder={isRTL ? 'مثال: أ' : 'e.g., A'} className="text-right" dir="rtl" />
              </div>
              {grades.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'الصف' : 'Grade'}</Label>
                  <Select value={newSection.grade_id} onValueChange={(v) => setNewSection({ ...newSection, grade_id: v })}>
                    <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر الصف' : 'Select grade'} /></SelectTrigger>
                    <SelectContent>{grades.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowSectionDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAddSection} className="bg-sky-600 hover:bg-sky-700"><Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Term Dialog */}
        <Dialog open={showTermDialog} onOpenChange={setShowTermDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="text-right font-cairo">{isRTL ? 'إضافة فصل دراسي' : 'Add Academic Term'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'اسم الفصل' : 'Term Name'} <span className="text-red-500">*</span></Label>
                <Input value={newTerm.name} onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })} placeholder={isRTL ? 'مثال: الفصل الأول' : 'e.g., First Semester'} className="text-right" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">{isRTL ? 'الاسم بالإنجليزية' : 'Name (English)'}</Label>
                <Input value={newTerm.name_en} onChange={(e) => setNewTerm({ ...newTerm, name_en: e.target.value })} placeholder="e.g., First Semester" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'تاريخ البداية' : 'Start Date'} <span className="text-red-500">*</span></Label>
                  <Input type="date" value={newTerm.start_date} onChange={(e) => setNewTerm({ ...newTerm, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">{isRTL ? 'تاريخ النهاية' : 'End Date'} <span className="text-red-500">*</span></Label>
                  <Input type="date" value={newTerm.end_date} onChange={(e) => setNewTerm({ ...newTerm, end_date: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-row-reverse">
                <Switch checked={newTerm.is_active} onCheckedChange={(v) => setNewTerm({ ...newTerm, is_active: v })} />
                <Label>{isRTL ? 'فصل نشط' : 'Active Term'}</Label>
              </div>
            </div>
            <DialogFooter className="flex gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setShowTermDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAddTerm} className="bg-sky-600 hover:bg-sky-700"><Plus className="h-4 w-4 me-2" />{isRTL ? 'إضافة' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// =============================================================
// الصفحة الرئيسية
// =============================================================
export default function SchoolSettingsPage() {
  const navigate = useNavigate();
  const { user, token, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [settings, setSettings] = useState({
    workDays: { sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: false },
    officialHolidays: [],
    periodsPerDay: 7,
    timing: { start: '07:00', end: '14:00' },
    breaks: [],
    teachingLoads: {},
    constraints: [],
  });
  
  // Wizard States
  const [showAddTeacherWizard, setShowAddTeacherWizard] = useState(false);
  const [showAddStudentWizard, setShowAddStudentWizard] = useState(false);
  const [showCreateClassWizard, setShowCreateClassWizard] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch from the new comprehensive school settings API
      const [teachersRes, classesRes, settingsRes] = await Promise.all([
        api.get('/api/teachers').catch(() => ({ data: [] })),
        api.get('/api/classes').catch(() => ({ data: [] })),
        api.get('/school/settings').catch(() => ({ data: {} })),
      ]);
      
      setTeachers(teachersRes.data || []);
      setClasses(classesRes.data || []);
      
      // Set data from school settings API
      const settingsData = settingsRes.data || {};
      setSchoolInfo(settingsData.school_info || null);
      setSubjects(settingsData.subjects || settingsRes.data?.subjects || []);
      setGrades(settingsData.grades || []);
      
      setSettings({
        workDays: settingsData.work_days || { sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: false },
        officialHolidays: settingsData.official_holidays || [],
        exceptionDays: settingsData.exception_days || [],
        periodsPerDay: settingsData.periods_per_day || 7,
        timing: settingsData.timing || { start: '07:00', end: '14:00' },
        breaks: settingsData.breaks || [],
        activityDays: settingsData.activity_days || [],
        teachingLoads: settingsData.teaching_loads || {},
        teacherAvailability: settingsData.teacher_availability || {},
        constraints: settingsData.constraints || [],
        educationalStages: settingsData.educational_stages || [],
        sections: settingsData.sections || [],
        academicTerms: settingsData.academic_terms || [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [api, user, isRTL]);

  useEffect(() => {
    fetchData();
  }, []);

  // Save handlers
  const handleSaveSchoolInfo = async (info) => {
    await api.put('/school/settings/info', info);
    setSchoolInfo(prev => ({ ...prev, ...info }));
  };

  const handleSaveWorkDays = async (workDays) => {
    await api.put('/school/settings/work-days', workDays);
    setSettings(prev => ({ ...prev, workDays }));
  };

  const handleSavePeriodsPerDay = async (periods) => {
    await api.put(`/school/settings/periods-per-day?periods=${periods}`);
    setSettings(prev => ({ ...prev, periodsPerDay: periods }));
  };

  const handleSaveTiming = async (timing) => {
    await api.put('/school/settings/timing', timing);
    setSettings(prev => ({ ...prev, timing }));
  };

  const handleSaveBreaks = async (breaks) => {
    await api.put('/school/settings/breaks', breaks);
    setSettings(prev => ({ ...prev, breaks }));
  };

  const handleSaveTeachingLoads = async (loads) => {
    await api.put('/school/settings/teaching-loads', loads);
    setSettings(prev => ({ ...prev, teachingLoads: loads }));
  };

  const handleSaveConstraints = async (constraints) => {
    await api.put('/school/settings/constraints', constraints);
    setSettings(prev => ({ ...prev, constraints }));
  };

  const handleAddSubject = async (subjectData) => {
    try {
      const response = await api.post('/school/settings/subjects', subjectData);
      const newSubject = response.data?.subject || subjectData;
      setSubjects(prev => [...prev, newSubject]);
      toast.success(isRTL ? 'تمت إضافة المادة بنجاح' : 'Subject added successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة المادة' : 'Error adding subject');
      throw error;
    }
  };

  const handleDeleteSubject = async (subject) => {
    try {
      await api.delete(`/school/settings/subjects/${subject.id}`);
      setSubjects(prev => prev.filter(s => s.id !== subject.id));
      toast.success(isRTL ? 'تم حذف المادة' : 'Subject deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف المادة' : 'Error deleting subject');
      throw error;
    }
  };

  const handleAddHoliday = async (holiday) => {
    try {
      const response = await api.post('/school/settings/holidays', holiday);
      const newHoliday = response.data?.holiday || holiday;
      setSettings(prev => ({ 
        ...prev, 
        officialHolidays: [...(prev.officialHolidays || []), newHoliday] 
      }));
      toast.success(isRTL ? 'تمت إضافة الإجازة' : 'Holiday added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة الإجازة' : 'Error adding holiday');
      throw error;
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await api.delete(`/school/settings/holidays/${holidayId}`);
      setSettings(prev => ({
        ...prev,
        officialHolidays: prev.officialHolidays.filter(h => h.id !== holidayId)
      }));
      toast.success(isRTL ? 'تم حذف الإجازة' : 'Holiday deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف الإجازة' : 'Error deleting holiday');
    }
  };

  const handleAddExceptionDay = async (exceptionDay) => {
    try {
      const response = await api.post('/school/settings/exception-days', exceptionDay);
      const newException = response.data?.exception || exceptionDay;
      setSettings(prev => ({
        ...prev,
        exceptionDays: [...(prev.exceptionDays || []), newException]
      }));
      toast.success(isRTL ? 'تم إضافة يوم الاستثناء' : 'Exception day added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة يوم الاستثناء' : 'Error adding exception day');
    }
  };

  const handleAddActivityDay = async (activityDay) => {
    try {
      const response = await api.post('/school/settings/activity-days', activityDay);
      const newActivity = response.data?.activity || activityDay;
      setSettings(prev => ({
        ...prev,
        activityDays: [...(prev.activityDays || []), newActivity]
      }));
      toast.success(isRTL ? 'تم إضافة يوم النشاط' : 'Activity day added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة يوم النشاط' : 'Error adding activity day');
    }
  };

  const handleDeleteActivityDay = async (activityId) => {
    try {
      await api.delete(`/school/settings/activity-days/${activityId}`);
      setSettings(prev => ({
        ...prev,
        activityDays: prev.activityDays.filter(a => a.id !== activityId)
      }));
      toast.success(isRTL ? 'تم حذف يوم النشاط' : 'Activity day deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف يوم النشاط' : 'Error deleting activity day');
    }
  };

  // Academic structure handlers
  const handleAddStage = async (stage) => {
    try {
      const response = await api.post('/school/settings/stages', stage);
      const newStage = response.data?.stage || stage;
      setSettings(prev => ({
        ...prev,
        educationalStages: [...(prev.educationalStages || []), newStage]
      }));
      toast.success(isRTL ? 'تم إضافة المرحلة التعليمية' : 'Stage added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة المرحلة' : 'Error adding stage');
    }
  };

  const handleDeleteStage = async (stageId) => {
    try {
      await api.delete(`/school/settings/stages/${stageId}`);
      setSettings(prev => ({
        ...prev,
        educationalStages: prev.educationalStages.filter(s => s.id !== stageId)
      }));
      toast.success(isRTL ? 'تم حذف المرحلة' : 'Stage deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف المرحلة' : 'Error deleting stage');
    }
  };

  const handleAddGrade = async (grade) => {
    try {
      const response = await api.post('/school/settings/grades', grade);
      const newGrade = response.data?.grade || grade;
      setGrades(prev => [...prev, newGrade]);
      toast.success(isRTL ? 'تم إضافة الصف' : 'Grade added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة الصف' : 'Error adding grade');
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      await api.delete(`/school/settings/grades/${gradeId}`);
      setGrades(prev => prev.filter(g => g.id !== gradeId));
      toast.success(isRTL ? 'تم حذف الصف' : 'Grade deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف الصف' : 'Error deleting grade');
    }
  };

  const handleAddSection = async (section) => {
    try {
      const response = await api.post('/school/settings/sections', section);
      const newSection = response.data?.section || section;
      setSettings(prev => ({
        ...prev,
        sections: [...(prev.sections || []), newSection]
      }));
      toast.success(isRTL ? 'تم إضافة الشعبة' : 'Section added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة الشعبة' : 'Error adding section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await api.delete(`/school/settings/sections/${sectionId}`);
      setSettings(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }));
      toast.success(isRTL ? 'تم حذف الشعبة' : 'Section deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف الشعبة' : 'Error deleting section');
    }
  };

  const handleAddTerm = async (term) => {
    try {
      const response = await api.post('/school/settings/academic-terms', term);
      const newTerm = response.data?.term || term;
      setSettings(prev => ({
        ...prev,
        academicTerms: [...(prev.academicTerms || []), newTerm]
      }));
      toast.success(isRTL ? 'تم إضافة الفصل الدراسي' : 'Term added');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة الفصل' : 'Error adding term');
    }
  };

  const handleDeleteTerm = async (termId) => {
    try {
      await api.delete(`/school/settings/academic-terms/${termId}`);
      setSettings(prev => ({
        ...prev,
        academicTerms: prev.academicTerms.filter(t => t.id !== termId)
      }));
      toast.success(isRTL ? 'تم حذف الفصل الدراسي' : 'Term deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف الفصل' : 'Error deleting term');
    }
  };

  const handleSaveAvailability = async (data) => {
    try {
      await api.put('/school/settings/teacher-availability', data);
      setSettings(prev => ({
        ...prev,
        teacherAvailability: {
          ...(prev.teacherAvailability || {}),
          [data.teacher_id]: { available_days: data.available_days, available_periods: data.available_periods }
        }
      }));
      toast.success(isRTL ? 'تم حفظ توفر المعلم' : 'Availability saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حفظ التوفر' : 'Error saving availability');
    }
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20" data-testid="school-settings-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-cairo text-2xl font-bold">{isRTL ? 'إعدادات المدرسة' : 'School Settings'}</h1>
                <p className="text-sm text-muted-foreground font-tajawal">{isRTL ? 'المرجع الأساسي لمحرك الجدولة والنظام' : 'Main reference for scheduling engine'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleLanguage}><Globe className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
              <Button variant="outline" onClick={fetchData}><RefreshCw className={`h-4 w-4 me-2 ${loading ? 'animate-spin' : ''}`} />{isRTL ? 'تحديث' : 'Refresh'}</Button>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">{isRTL ? 'إجراءات سريعة:' : 'Quick Actions:'}</span>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddStudentWizard(true)}><UserPlus className="h-4 w-4 me-2" />{isRTL ? 'طالب' : 'Student'}</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddTeacherWizard(true)}><GraduationCap className="h-4 w-4 me-2" />{isRTL ? 'معلم' : 'Teacher'}</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateClassWizard(true)}><School className="h-4 w-4 me-2" />{isRTL ? 'فصل' : 'Class'}</Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Section 0: School Info - معلومات المدرسة */}
          <SchoolInfoSection schoolInfo={schoolInfo} onSave={handleSaveSchoolInfo} loading={loading} isRTL={isRTL} />

          {/* Section 1 & 2: Teachers and Classes - المعلمين والفصول */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TeachersSection teachers={teachers} loading={loading} onRefresh={fetchData} onAddTeacher={() => setShowAddTeacherWizard(true)} onEditTeacher={(t) => console.log('Edit teacher:', t)} isRTL={isRTL} />
            <ClassesSection classes={classes} loading={loading} onRefresh={fetchData} onAddClass={() => setShowCreateClassWizard(true)} onEditClass={(c) => console.log('Edit class:', c)} isRTL={isRTL} />
          </div>

          {/* Section 3: Subjects - المواد الدراسية */}
          <SubjectsSection subjects={subjects} grades={grades} loading={loading} onAddSubject={handleAddSubject} onDeleteSubject={handleDeleteSubject} isRTL={isRTL} />

          {/* Section 4: Work Days - أيام العمل */}
          <WorkDaysSection 
            workDays={settings.workDays} 
            officialHolidays={settings.officialHolidays} 
            onSaveWorkDays={handleSaveWorkDays} 
            onAddHoliday={handleAddHoliday}
            onDeleteHoliday={handleDeleteHoliday}
            onAddExceptionDay={handleAddExceptionDay}
            isRTL={isRTL} 
          />

          {/* Section 5 & 6: Periods and Timing - الحصص وأوقات الدوام */}
          <div className="grid lg:grid-cols-2 gap-6">
            <PeriodsPerDaySection periodsPerDay={settings.periodsPerDay} onSave={handleSavePeriodsPerDay} isRTL={isRTL} />
            <SchoolTimingSection timing={settings.timing} onSave={handleSaveTiming} isRTL={isRTL} />
          </div>

          {/* Section 7: Breaks - فترات الاستراحة */}
          <BreaksSection breaks={settings.breaks} onSave={handleSaveBreaks} isRTL={isRTL} />

          {/* Section 8: Activity Days - أيام الأنشطة */}
          <ActivityDaysSection 
            activityDays={settings.activityDays || []} 
            onAddActivity={handleAddActivityDay}
            onDeleteActivity={handleDeleteActivityDay}
            isRTL={isRTL} 
          />

          {/* Section 9: Teaching Load - النصاب التدريسي */}
          <TeachingLoadSection teachers={teachers} teachingLoads={settings.teachingLoads} onSave={handleSaveTeachingLoads} isRTL={isRTL} />

          {/* Section 10: Availability - التوافر */}
          <AvailabilitySection 
            teachers={teachers} 
            availability={settings.teacherAvailability || {}}
            onSave={handleSaveAvailability}
            isRTL={isRTL} 
          />

          {/* Section 11: Constraints - القيود الإدارية */}
          <ConstraintsSection teachers={teachers} constraints={settings.constraints} onSave={handleSaveConstraints} isRTL={isRTL} />

          {/* Section 12-15: Academic Structure - الهيكل الأكاديمي */}
          <AcademicStructureSection 
            stages={settings.educationalStages || []}
            grades={grades}
            sections={settings.sections || []}
            terms={settings.academicTerms || []}
            onAddStage={handleAddStage}
            onDeleteStage={handleDeleteStage}
            onAddGrade={handleAddGrade}
            onDeleteGrade={handleDeleteGrade}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onAddTerm={handleAddTerm}
            onDeleteTerm={handleDeleteTerm}
            isRTL={isRTL}
          />
        </main>

        {/* Wizards */}
        <AddTeacherWizard open={showAddTeacherWizard} onOpenChange={setShowAddTeacherWizard} onSuccess={fetchData} />
        <AddStudentWizard open={showAddStudentWizard} onOpenChange={setShowAddStudentWizard} isRTL={isRTL} onSuccess={fetchData} />
        <CreateClassWizard open={showCreateClassWizard} onOpenChange={setShowCreateClassWizard} onSuccess={fetchData} />
        
        {/* Hakim Assistant */}
        <HakimAssistant />
      </div>
    </Sidebar>
  );
}

// Export for backwards compatibility
export { SchoolSettingsPage };
