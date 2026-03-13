/**
 * School Settings Page - إعدادات المدرسة
 * NASSAQ | نَسَّق
 * 
 * Redesigned for simplicity and ease of use
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  LayoutDashboard, CalendarDays, Clock, School, Users, BookOpen, 
  Sliders, Plus, Edit2, Trash2, Save, CheckCircle2, AlertTriangle,
  AlertCircle, ChevronLeft, Search, Filter, MoreVertical, Play,
  RefreshCw, Info, X, GraduationCap, Target, Settings
} from 'lucide-react';

// ============================================
// Main Component
// ============================================

export function SchoolSettingsPagePro() {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data States
  const [settings, setSettings] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [readinessData, setReadinessData] = useState(null);
  
  // Modal States
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form States
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', phone: '', subjects: [] });
  const [newClass, setNewClass] = useState({ name: '', grade: '', section: '', capacity: 30 });
  const [newAssignment, setNewAssignment] = useState({ teacher_id: '', class_id: '', subject: '', weekly_periods: 4 });
  
  // Work Days State
  const [workDays, setWorkDays] = useState({
    sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: false, saturday: false
  });
  
  // Timing Settings
  const [timingSettings, setTimingSettings] = useState({
    dayStart: '07:00',
    periodsPerDay: 7,
    periodDuration: 45,
    breakDuration: 20,
    breakAfterPeriod: 3
  });

  // ============================================
  // Data Fetching
  // ============================================
  
  const fetchData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    
    try {
      const [settingsRes, teachersRes, classesRes, assignmentsRes, constraintsRes, readinessRes] = await Promise.all([
        api.get('/school/settings').catch(() => ({ data: {} })),
        api.get('/school/teachers').catch(() => ({ data: [] })),
        api.get('/school/classes').catch(() => ({ data: [] })),
        api.get('/school/assignments').catch(() => ({ data: [] })),
        api.get('/school/constraints').catch(() => ({ data: [] })),
        api.get('/timetable-readiness/check').catch(() => ({ data: null }))
      ]);
      
      setSettings(settingsRes.data || {});
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
      setConstraints(Array.isArray(constraintsRes.data) ? constraintsRes.data : []);
      setReadinessData(readinessRes.data);
      
      // Update work days from settings
      if (settingsRes.data?.workingDays) {
        const days = settingsRes.data.workingDays;
        setWorkDays({
          sunday: days.includes('الأحد'),
          monday: days.includes('الإثنين'),
          tuesday: days.includes('الثلاثاء'),
          wednesday: days.includes('الأربعاء'),
          thursday: days.includes('الخميس'),
          friday: days.includes('الجمعة'),
          saturday: days.includes('السبت')
        });
      }
      
      // Update timing settings
      if (settingsRes.data) {
        setTimingSettings({
          dayStart: settingsRes.data.dayStart || '07:00',
          periodsPerDay: settingsRes.data.periodsPerDay || 7,
          periodDuration: settingsRes.data.periodDuration || 45,
          breakDuration: settingsRes.data.breakDuration || 20,
          breakAfterPeriod: settingsRes.data.breakAfterPeriod || 3
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [api]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // Save Functions
  // ============================================
  
  const saveWorkDays = async () => {
    setSaving(true);
    try {
      const dayNames = { sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت' };
      const workingDays = Object.entries(workDays).filter(([_, active]) => active).map(([day]) => dayNames[day]);
      const weekendDays = Object.entries(workDays).filter(([_, active]) => !active).map(([day]) => dayNames[day]);
      
      await api.put('/school/settings', { ...settings, workingDays, weekendDays });
      toast.success('تم حفظ أيام العمل بنجاح');
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في حفظ أيام العمل');
    } finally {
      setSaving(false);
    }
  };
  
  const saveTimingSettings = async () => {
    setSaving(true);
    try {
      await api.put('/school/settings', { ...settings, ...timingSettings });
      toast.success('تم حفظ إعدادات التوقيت بنجاح');
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في حفظ إعدادات التوقيت');
    } finally {
      setSaving(false);
    }
  };
  
  const addTeacher = async () => {
    try {
      await api.post('/school/teachers', newTeacher);
      toast.success('تمت إضافة المعلم بنجاح');
      setShowAddTeacher(false);
      setNewTeacher({ name: '', email: '', phone: '', subjects: [] });
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في إضافة المعلم');
    }
  };
  
  const addClass = async () => {
    try {
      await api.post('/school/classes', newClass);
      toast.success('تمت إضافة الفصل بنجاح');
      setShowAddClass(false);
      setNewClass({ name: '', grade: '', section: '', capacity: 30 });
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في إضافة الفصل');
    }
  };
  
  const deleteTeacher = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المعلم؟')) return;
    try {
      await api.delete(`/school/teachers/${id}`);
      toast.success('تم حذف المعلم بنجاح');
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في حذف المعلم');
    }
  };
  
  const deleteClass = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return;
    try {
      await api.delete(`/school/classes/${id}`);
      toast.success('تم حذف الفصل بنجاح');
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في حذف الفصل');
    }
  };

  // ============================================
  // Render
  // ============================================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#1C3D74] mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
            إعدادات المدرسة
          </h1>
          <p className="text-slate-500 mt-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            قم بإدارة بيانات المدرسة، الفصول، والمعلمين لتجهيز الجدول المدرسي
          </p>
        </div>
        
        {/* Readiness Status Card */}
        {readinessData && (
          <Card className="mb-8 overflow-hidden border-0 shadow-lg" data-testid="readiness-hero-card">
            <div className={`p-8 ${
              readinessData.status === 'FULLY_READY' 
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' 
                : readinessData.status === 'PARTIALLY_READY'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                : 'bg-gradient-to-br from-[#1C3D74] to-[#2a5096]'
            } text-white relative`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Status Info */}
                <div className="flex items-center gap-6">
                  {/* Progress Circle */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray={`${(readinessData.percentage / 100) * 251} 251`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{Math.round(readinessData.percentage)}%</span>
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      {readinessData.status === 'FULLY_READY' ? 'جاهز لإنشاء الجدول!' :
                       readinessData.status === 'PARTIALLY_READY' ? 'جاهز جزئياً' :
                       'بيانات المدرسة غير مكتملة'}
                    </h2>
                    <p className="text-white/80 text-lg">
                      {readinessData.summary?.critical_count > 0 && (
                        <span>{readinessData.summary.critical_count} عناصر مطلوبة</span>
                      )}
                      {readinessData.summary?.warning_count > 0 && (
                        <span className="mr-3">{readinessData.summary.warning_count} تحذيرات</span>
                      )}
                      {readinessData.status === 'FULLY_READY' && 'جميع البيانات مكتملة'}
                    </p>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  size="lg"
                  className={`${
                    readinessData.can_generate 
                      ? 'bg-white text-[#1C3D74] hover:bg-slate-100' 
                      : 'bg-white/20 text-white cursor-not-allowed'
                  } font-bold px-8 py-6 text-lg rounded-xl shadow-lg transition-all`}
                  disabled={!readinessData.can_generate}
                  onClick={() => window.location.href = '/principal/timetable'}
                  data-testid="generate-timetable-btn"
                >
                  <Play className="h-5 w-5 ml-2" />
                  {readinessData.can_generate ? 'إنشاء الجدول' : 'أكمل البيانات أولاً'}
                </Button>
              </div>
              
              {/* Quick Issues */}
              {readinessData.critical_issues?.length > 0 && (
                <div className="relative mt-6 pt-6 border-t border-white/20">
                  <div className="flex flex-wrap gap-2">
                    {readinessData.critical_issues.slice(0, 4).map((issue, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer py-1.5 px-3"
                        onClick={() => {
                          const tab = issue.fix_link?.split('tab=')[1];
                          if (tab) setActiveTab(tab);
                        }}
                      >
                        <AlertCircle className="h-3.5 w-3.5 ml-1.5" />
                        {issue.message_ar}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-14 bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 mb-8 grid grid-cols-7 gap-1">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
              { id: 'workdays', label: 'أيام العمل', icon: CalendarDays },
              { id: 'timings', label: 'التوقيت', icon: Clock },
              { id: 'classes', label: 'الفصول', icon: School },
              { id: 'teachers', label: 'المعلمون', icon: Users },
              { id: 'assignments', label: 'الإسنادات', icon: BookOpen },
              { id: 'constraints', label: 'القيود', icon: Sliders }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="rounded-lg data-[state=active]:bg-[#1C3D74] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="h-4 w-4 ml-2 hidden sm:block" />
                <span className="font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* ================= TAB: نظرة عامة ================= */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Summary Cards */}
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <School className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
                      <p className="text-sm text-slate-500">فصل دراسي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{teachers.length}</p>
                      <p className="text-sm text-slate-500">معلم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{assignments.length}</p>
                      <p className="text-sm text-slate-500">إسناد</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {Object.values(workDays).filter(Boolean).length}
                      </p>
                      <p className="text-sm text-slate-500">أيام دراسة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">العام الدراسي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-slate-600 mb-2 block">العام الدراسي الحالي</Label>
                    <Select defaultValue={settings.academicYear || '1446'}>
                      <SelectTrigger className="h-11 bg-white border-slate-200">
                        <SelectValue placeholder="اختر العام الدراسي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1446">1446 هـ</SelectItem>
                        <SelectItem value="1445">1445 هـ</SelectItem>
                        <SelectItem value="1444">1444 هـ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600 mb-2 block">الفصل الدراسي</Label>
                    <Select defaultValue={settings.currentSemester || '1'}>
                      <SelectTrigger className="h-11 bg-white border-slate-200">
                        <SelectValue placeholder="اختر الفصل الدراسي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">الفصل الأول</SelectItem>
                        <SelectItem value="2">الفصل الثاني</SelectItem>
                        <SelectItem value="3">الفصل الثالث</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">ملخص التوقيت</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">بداية اليوم</p>
                      <p className="text-xl font-bold text-slate-900">{timingSettings.dayStart}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">عدد الحصص</p>
                      <p className="text-xl font-bold text-slate-900">{timingSettings.periodsPerDay}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">مدة الحصة</p>
                      <p className="text-xl font-bold text-slate-900">{timingSettings.periodDuration} د</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">الاستراحة</p>
                      <p className="text-xl font-bold text-slate-900">{timingSettings.breakDuration} د</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* ================= TAB: أيام العمل ================= */}
          <TabsContent value="workdays" className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">أيام العمل والعطلة</CardTitle>
                <CardDescription>حدد أيام الدراسة الأسبوعية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4 mb-8">
                  {[
                    { key: 'sunday', ar: 'الأحد', en: 'Sun' },
                    { key: 'monday', ar: 'الإثنين', en: 'Mon' },
                    { key: 'tuesday', ar: 'الثلاثاء', en: 'Tue' },
                    { key: 'wednesday', ar: 'الأربعاء', en: 'Wed' },
                    { key: 'thursday', ar: 'الخميس', en: 'Thu' },
                    { key: 'friday', ar: 'الجمعة', en: 'Fri' },
                    { key: 'saturday', ar: 'السبت', en: 'Sat' }
                  ].map((day) => (
                    <div 
                      key={day.key}
                      onClick={() => setWorkDays(prev => ({ ...prev, [day.key]: !prev[day.key] }))}
                      className={`
                        cursor-pointer rounded-2xl p-6 text-center transition-all duration-200
                        ${workDays[day.key] 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }
                      `}
                      data-testid={`day-${day.key}`}
                    >
                      <p className="text-xs mb-2 opacity-70">{day.en}</p>
                      <p className="text-lg font-bold">{day.ar}</p>
                      <div className="mt-3">
                        {workDays[day.key] ? (
                          <CheckCircle2 className="h-6 w-6 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 mx-auto opacity-50" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-slate-600">
                        {Object.values(workDays).filter(Boolean).length} أيام دراسة
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                      <span className="text-sm text-slate-600">
                        {Object.values(workDays).filter(v => !v).length} أيام عطلة
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={saveWorkDays} 
                    disabled={saving}
                    className="bg-[#1C3D74] hover:bg-[#152d57] text-white px-8"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ================= TAB: التوقيت ================= */}
          <TabsContent value="timings" className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">إعدادات التوقيت</CardTitle>
                <CardDescription>حدد هيكل اليوم الدراسي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">وقت بداية اليوم الدراسي</Label>
                      <Input 
                        type="time" 
                        value={timingSettings.dayStart}
                        onChange={(e) => setTimingSettings(prev => ({ ...prev, dayStart: e.target.value }))}
                        className="h-12 text-lg bg-white border-slate-200"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">عدد الحصص في اليوم</Label>
                      <Select 
                        value={String(timingSettings.periodsPerDay)}
                        onValueChange={(v) => setTimingSettings(prev => ({ ...prev, periodsPerDay: parseInt(v) }))}
                      >
                        <SelectTrigger className="h-12 bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 6, 7, 8, 9].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} حصص</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">مدة الحصة (بالدقائق)</Label>
                      <Select 
                        value={String(timingSettings.periodDuration)}
                        onValueChange={(v) => setTimingSettings(prev => ({ ...prev, periodDuration: parseInt(v) }))}
                      >
                        <SelectTrigger className="h-12 bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 35, 40, 45, 50, 55, 60].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">مدة الاستراحة (بالدقائق)</Label>
                      <Select 
                        value={String(timingSettings.breakDuration)}
                        onValueChange={(v) => setTimingSettings(prev => ({ ...prev, breakDuration: parseInt(v) }))}
                      >
                        <SelectTrigger className="h-12 bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 15, 20, 25, 30].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={saveTimingSettings} 
                    disabled={saving}
                    className="bg-[#1C3D74] hover:bg-[#152d57] text-white px-8"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ================= TAB: الفصول ================= */}
          <TabsContent value="classes" className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">الفصول الدراسية</CardTitle>
                    <CardDescription>{classes.length} فصل مسجل</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddClass(true)}
                    className="bg-[#1C3D74] hover:bg-[#152d57] text-white"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة فصل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-16">
                    <School className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-lg text-slate-500 mb-4">لا يوجد فصول مسجلة</p>
                    <Button onClick={() => setShowAddClass(true)} variant="outline">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة فصل جديد
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">اسم الفصل</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">الصف</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">الشعبة</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">السعة</th>
                          <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map((cls, idx) => (
                          <tr key={cls.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-medium text-slate-900">{cls.name || cls.name_ar || '-'}</p>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{cls.grade || cls.grade_name || '-'}</td>
                            <td className="py-4 px-4 text-slate-600">{cls.section || '-'}</td>
                            <td className="py-4 px-4 text-slate-600">{cls.capacity || '-'}</td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                  onClick={() => deleteClass(cls.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ================= TAB: المعلمون ================= */}
          <TabsContent value="teachers" className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">المعلمون</CardTitle>
                    <CardDescription>{teachers.length} معلم مسجل</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddTeacher(true)}
                    className="bg-[#1C3D74] hover:bg-[#152d57] text-white"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة معلم
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-lg text-slate-500 mb-4">لا يوجد معلمين مسجلين</p>
                    <Button onClick={() => setShowAddTeacher(true)} variant="outline">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة معلم جديد
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">اسم المعلم</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">البريد الإلكتروني</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">الهاتف</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">التخصص</th>
                          <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.map((teacher, idx) => (
                          <tr key={teacher.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-medium text-slate-900">{teacher.name || teacher.name_ar || '-'}</p>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{teacher.email || '-'}</td>
                            <td className="py-4 px-4 text-slate-600">{teacher.phone || '-'}</td>
                            <td className="py-4 px-4 text-slate-600">{teacher.specialization || teacher.subjects?.[0] || '-'}</td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                  onClick={() => deleteTeacher(teacher.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ================= TAB: الإسنادات ================= */}
          <TabsContent value="assignments" className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">إسنادات المعلمين</CardTitle>
                    <CardDescription>ربط المعلمين بالمواد والفصول</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddAssignment(true)}
                    className="bg-[#1C3D74] hover:bg-[#152d57] text-white"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة إسناد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-16">
                    <Target className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-lg text-slate-500 mb-4">لا يوجد إسنادات</p>
                    <p className="text-sm text-slate-400 mb-4">قم بربط المعلمين بالمواد والفصول</p>
                    <Button onClick={() => setShowAddAssignment(true)} variant="outline">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة إسناد جديد
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.map((assignment, idx) => (
                      <Card key={assignment.id || idx} className="border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{assignment.teacher_name || 'معلم'}</p>
                              <p className="text-sm text-slate-500">{assignment.subject_name || assignment.subject || 'مادة'}</p>
                              <p className="text-sm text-slate-400">{assignment.class_name || 'فصل'}</p>
                            </div>
                            <Badge className="bg-slate-100 text-slate-600">
                              {assignment.weekly_periods || assignment.weekly_sessions || 0} حصة/أسبوع
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ================= TAB: القيود ================= */}
          <TabsContent value="constraints" className="space-y-6">
            {/* Hard Constraints */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  القيود الإلزامية
                </CardTitle>
                <CardDescription>قيود لا يمكن خرقها - مطبقة تلقائياً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'لا يمكن تعيين معلم لحصتين في نفس الوقت',
                    'لا يمكن تعيين فصل لحصتين في نفس الوقت',
                    'لا يمكن وضع حصة خارج أوقات اليوم الدراسي',
                    'لا يمكن وضع حصة داخل فترات الاستراحة',
                    'لا يمكن تجاوز النصاب الأسبوعي للمعلم',
                    'يجب احترام عدد الحصص الأسبوعية لكل مادة'
                  ].map((constraint, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                      <CheckCircle2 className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-800">{constraint}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Soft Constraints */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  القيود التفضيلية
                </CardTitle>
                <CardDescription>تؤثر على جودة الجدول - يمكن تفعيلها/تعطيلها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'توزيع حصص المادة على أكثر من يوم', enabled: true },
                    { name: 'تقليل الفجوات في جدول المعلم', enabled: true },
                    { name: 'تقليل الفجوات في جدول الفصل', enabled: true },
                    { name: 'المواد الثقيلة في أول اليوم', enabled: false },
                    { name: 'عدم تكرار نفس المادة متتالياً', enabled: true }
                  ].map((constraint, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-sm text-amber-900">{constraint.name}</span>
                      <Switch defaultChecked={constraint.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* ================= Modals ================= */}
        
        {/* Add Teacher Modal */}
        <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة معلم جديد</DialogTitle>
              <DialogDescription>أدخل بيانات المعلم الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>اسم المعلم</Label>
                <Input 
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم المعلم"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input 
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@school.edu.sa"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input 
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTeacher(false)}>إلغاء</Button>
              <Button onClick={addTeacher} className="bg-[#1C3D74]">إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Class Modal */}
        <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة فصل جديد</DialogTitle>
              <DialogDescription>أدخل بيانات الفصل الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>اسم الفصل</Label>
                <Input 
                  value={newClass.name}
                  onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: 1/أ"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>الصف الدراسي</Label>
                <Select 
                  value={newClass.grade}
                  onValueChange={(v) => setNewClass(prev => ({ ...prev, grade: v }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الأول">الصف الأول</SelectItem>
                    <SelectItem value="الثاني">الصف الثاني</SelectItem>
                    <SelectItem value="الثالث">الصف الثالث</SelectItem>
                    <SelectItem value="الرابع">الصف الرابع</SelectItem>
                    <SelectItem value="الخامس">الصف الخامس</SelectItem>
                    <SelectItem value="السادس">الصف السادس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الشعبة</Label>
                <Input 
                  value={newClass.section}
                  onChange={(e) => setNewClass(prev => ({ ...prev, section: e.target.value }))}
                  placeholder="مثال: أ"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>السعة</Label>
                <Input 
                  type="number"
                  value={newClass.capacity}
                  onChange={(e) => setNewClass(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddClass(false)}>إلغاء</Button>
              <Button onClick={addClass} className="bg-[#1C3D74]">إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default SchoolSettingsPagePro;
