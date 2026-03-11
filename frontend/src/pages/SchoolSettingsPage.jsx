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
import { AddStudentWizard } from '../components/wizards/AddStudentWizard';
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
            {isRTL ? 'إضافة معلم' : 'Add Teacher'}
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
              {isRTL ? 'إضافة أول معلم' : 'Add First Teacher'}
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
            {isRTL ? 'إضافة فصل' : 'Add Class'}
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
              {isRTL ? 'إضافة أول فصل' : 'Add First Class'}
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
      const tenantId = user?.tenant_id;
      
      const [teachersRes, classesRes, subjectsRes, gradesRes, schoolRes, settingsRes] = await Promise.all([
        api.get('/api/teachers').catch(() => ({ data: [] })),
        api.get('/api/classes').catch(() => ({ data: [] })),
        api.get('/api/subjects').catch(() => ({ data: [] })),
        api.get('/api/classes/options/grades').catch(() => ({ data: [] })),
        tenantId ? api.get(`/api/schools/${tenantId}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
        api.get('/api/school/settings').catch(() => ({ data: {} })),
      ]);
      
      setTeachers(teachersRes.data || []);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setGrades(gradesRes.data || []);
      setSchoolInfo(schoolRes.data);
      if (settingsRes.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    fetchData();
  }, []);

  // Save handlers
  const handleSaveSchoolInfo = async (info) => {
    const tenantId = user?.tenant_id;
    if (tenantId) {
      await api.put(`/api/schools/${tenantId}`, info);
      setSchoolInfo(info);
    }
  };

  const handleSaveSettings = async (key, value) => {
    try {
      await api.post('/api/school/settings', { [key]: value });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const handleAddSubject = async (subjectData) => {
    try {
      await api.post('/api/subjects', subjectData);
      fetchData();
      toast.success(isRTL ? 'تمت إضافة المادة بنجاح' : 'Subject added successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إضافة المادة' : 'Error adding subject');
    }
  };

  const handleDeleteSubject = async (subject) => {
    try {
      await api.delete(`/api/subjects/${subject.id}`);
      fetchData();
      toast.success(isRTL ? 'تم حذف المادة' : 'Subject deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في حذف المادة' : 'Error deleting subject');
    }
  };

  const handleAddHoliday = async (holiday) => {
    const updated = [...(settings.officialHolidays || []), holiday];
    await handleSaveSettings('officialHolidays', updated);
    toast.success(isRTL ? 'تمت إضافة الإجازة' : 'Holiday added');
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
          {/* School Info */}
          <SchoolInfoSection schoolInfo={schoolInfo} onSave={handleSaveSchoolInfo} loading={loading} isRTL={isRTL} />

          {/* Teachers and Classes */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TeachersSection teachers={teachers} loading={loading} onRefresh={fetchData} onAddTeacher={() => setShowAddTeacherWizard(true)} onEditTeacher={(t) => console.log('Edit teacher:', t)} isRTL={isRTL} />
            <ClassesSection classes={classes} loading={loading} onRefresh={fetchData} onAddClass={() => setShowCreateClassWizard(true)} onEditClass={(c) => console.log('Edit class:', c)} isRTL={isRTL} />
          </div>

          {/* Subjects */}
          <SubjectsSection subjects={subjects} grades={grades} loading={loading} onAddSubject={handleAddSubject} onDeleteSubject={handleDeleteSubject} isRTL={isRTL} />

          {/* Work Days */}
          <WorkDaysSection workDays={settings.workDays} officialHolidays={settings.officialHolidays} onSaveWorkDays={(days) => handleSaveSettings('workDays', days)} onAddHoliday={handleAddHoliday} isRTL={isRTL} />

          {/* Periods and Timing */}
          <div className="grid lg:grid-cols-2 gap-6">
            <PeriodsPerDaySection periodsPerDay={settings.periodsPerDay} onSave={(p) => handleSaveSettings('periodsPerDay', p)} isRTL={isRTL} />
            <SchoolTimingSection timing={settings.timing} onSave={(t) => handleSaveSettings('timing', t)} isRTL={isRTL} />
          </div>

          {/* Breaks */}
          <BreaksSection breaks={settings.breaks} onSave={(b) => handleSaveSettings('breaks', b)} isRTL={isRTL} />

          {/* Teaching Load */}
          <TeachingLoadSection teachers={teachers} teachingLoads={settings.teachingLoads} onSave={(l) => handleSaveSettings('teachingLoads', l)} isRTL={isRTL} />

          {/* Constraints */}
          <ConstraintsSection teachers={teachers} constraints={settings.constraints} onSave={(c) => handleSaveSettings('constraints', c)} isRTL={isRTL} />
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
