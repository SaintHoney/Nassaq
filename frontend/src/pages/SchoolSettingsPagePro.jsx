/**
 * School Settings Page - إعدادات المدرسة
 * NASSAQ | نَسَّق
 * 
 * Complete redesign with Sidebar, Save buttons, and all data
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
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
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import {
  LayoutDashboard, CalendarDays, Clock, School, Users, BookOpen, 
  Sliders, Plus, Edit2, Trash2, Save, CheckCircle2, AlertTriangle,
  AlertCircle, Search, Play, RefreshCw, Info, X, GraduationCap, 
  Target, Settings, Building2, MapPin, Phone, Mail, Globe, Shield,
  Layers, Award, ChevronRight, FileText, Database
} from 'lucide-react';

// ============================================
// Main Component
// ============================================

function SchoolSettingsPagePro() {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Data States
  const [schoolInfo, setSchoolInfo] = useState({});
  const [settings, setSettings] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [readinessData, setReadinessData] = useState(null);
  const [officialCurriculumStats, setOfficialCurriculumStats] = useState(null);
  const [officialStages, setOfficialStages] = useState([]);
  const [officialTracks, setOfficialTracks] = useState([]);
  const [officialRankLoads, setOfficialRankLoads] = useState([]);
  
  // Modal States
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showEditSchool, setShowEditSchool] = useState(false);
  
  // Form States
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', phone: '', specialization: '' });
  const [newClass, setNewClass] = useState({ name: '', grade: '', section: '', capacity: 30 });
  const [editedSchoolInfo, setEditedSchoolInfo] = useState({});
  
  // Work Days State
  const [workDays, setWorkDays] = useState({
    sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: false, saturday: false
  });
  
  // Timing Settings
  const [timingSettings, setTimingSettings] = useState({
    academicYear: '1446',
    currentSemester: '1',
    dayStart: '07:00',
    dayEnd: '13:15',
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
      const [
        settingsRes, teachersRes, classesRes, assignmentsRes, 
        constraintsRes, readinessRes, schoolRes,
        officialStatsRes, officialStagesRes, officialTracksRes, officialRankLoadsRes
      ] = await Promise.all([
        api.get('/school/settings').catch(() => ({ data: {} })),
        api.get('/school/teachers').catch(() => ({ data: [] })),
        api.get('/school/classes').catch(() => ({ data: [] })),
        api.get('/school/assignments').catch(() => ({ data: [] })),
        api.get('/school/constraints').catch(() => ({ data: [] })),
        api.get('/timetable-readiness/check').catch(() => ({ data: null })),
        api.get('/school/info').catch(() => ({ data: {} })),
        api.get('/official-curriculum/stats').catch(() => ({ data: null })),
        api.get('/official-curriculum/stages').catch(() => ({ data: [] })),
        api.get('/official-curriculum/tracks').catch(() => ({ data: [] })),
        api.get('/official-curriculum/teacher-rank-loads').catch(() => ({ data: [] }))
      ]);
      
      setSettings(settingsRes.data || {});
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
      setConstraints(Array.isArray(constraintsRes.data) ? constraintsRes.data : []);
      setReadinessData(readinessRes.data);
      setSchoolInfo(schoolRes.data || {});
      setOfficialCurriculumStats(officialStatsRes.data);
      setOfficialStages(Array.isArray(officialStagesRes.data) ? officialStagesRes.data : []);
      setOfficialTracks(Array.isArray(officialTracksRes.data) ? officialTracksRes.data : []);
      setOfficialRankLoads(Array.isArray(officialRankLoadsRes.data) ? officialRankLoadsRes.data : []);
      
      // Update states from settings
      const s = settingsRes.data || {};
      if (s.workingDays) {
        setWorkDays({
          sunday: s.workingDays.includes('الأحد'),
          monday: s.workingDays.includes('الإثنين'),
          tuesday: s.workingDays.includes('الثلاثاء'),
          wednesday: s.workingDays.includes('الأربعاء'),
          thursday: s.workingDays.includes('الخميس'),
          friday: s.workingDays.includes('الجمعة'),
          saturday: s.workingDays.includes('السبت')
        });
      }
      
      setTimingSettings({
        academicYear: s.academicYear || '1446',
        currentSemester: s.currentSemester || '1',
        dayStart: s.dayStart || '07:00',
        dayEnd: s.dayEnd || '13:15',
        periodsPerDay: s.periodsPerDay || 7,
        periodDuration: s.periodDuration || 45,
        breakDuration: s.breakDuration || 20,
        breakAfterPeriod: s.breakAfterPeriod || 3
      });
      
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
  
  const saveAllSettings = async () => {
    setSaving(true);
    try {
      const dayNames = { sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت' };
      const workingDays = Object.entries(workDays).filter(([_, active]) => active).map(([day]) => dayNames[day]);
      const weekendDays = Object.entries(workDays).filter(([_, active]) => !active).map(([day]) => dayNames[day]);
      
      await api.put('/school/settings', { 
        ...settings, 
        ...timingSettings,
        workingDays, 
        weekendDays 
      });
      toast.success('تم حفظ جميع الإعدادات بنجاح');
      setHasChanges(false);
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };
  
  const saveSchoolInfo = async () => {
    setSaving(true);
    try {
      await api.put('/school/info', editedSchoolInfo);
      toast.success('تم حفظ معلومات المدرسة');
      setShowEditSchool(false);
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ في حفظ معلومات المدرسة');
    } finally {
      setSaving(false);
    }
  };
  
  const addTeacher = async () => {
    try {
      await api.post('/school/teachers', newTeacher);
      toast.success('تمت إضافة المعلم بنجاح');
      setShowAddTeacher(false);
      setNewTeacher({ name: '', email: '', phone: '', specialization: '' });
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
  
  // Track changes
  const handleSettingChange = (key, value) => {
    setTimingSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };
  
  const handleWorkDayChange = (day) => {
    setWorkDays(prev => ({ ...prev, [day]: !prev[day] }));
    setHasChanges(true);
  };

  // ============================================
  // Render
  // ============================================
  
  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50" dir="rtl">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-[#1C3D74] mx-auto mb-4" />
            <p className="text-slate-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          
          {/* Page Header with Save Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">إعدادات المدرسة</h1>
              <p className="text-slate-500 mt-1">قم بإدارة بيانات المدرسة والفصول والمعلمين</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              {hasChanges && (
                <Button 
                  onClick={saveAllSettings} 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Readiness Status Card */}
          {readinessData && (
            <Card className="mb-8 overflow-hidden border-0 shadow-lg">
              <div className={`p-6 ${
                readinessData.status === 'FULLY_READY' 
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' 
                  : readinessData.status === 'PARTIALLY_READY'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                  : 'bg-gradient-to-br from-[#1C3D74] to-[#2a5096]'
              } text-white`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    {/* Progress Circle */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                        <circle 
                          cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${(readinessData.percentage / 100) * 214} 214`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{Math.round(readinessData.percentage)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-bold mb-1">
                        {readinessData.status === 'FULLY_READY' ? 'جاهز لإنشاء الجدول!' :
                         readinessData.status === 'PARTIALLY_READY' ? 'جاهز جزئياً' :
                         'بيانات المدرسة غير مكتملة'}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {readinessData.summary?.critical_count > 0 && `${readinessData.summary.critical_count} عناصر مطلوبة`}
                        {readinessData.summary?.warning_count > 0 && ` • ${readinessData.summary.warning_count} تحذيرات`}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className={`${readinessData.can_generate ? 'bg-white text-[#1C3D74] hover:bg-slate-100' : 'bg-white/20 text-white cursor-not-allowed'}`}
                    disabled={!readinessData.can_generate}
                    onClick={() => navigate('/principal/timetable')}
                  >
                    <Play className="h-5 w-5 ml-2" />
                    {readinessData.can_generate ? 'إنشاء الجدول' : 'أكمل البيانات أولاً'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-14 bg-white rounded-xl p-1.5 shadow-sm border mb-6 grid grid-cols-4 lg:grid-cols-8 gap-1">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
                { id: 'school-info', label: 'بيانات المدرسة', icon: Building2 },
                { id: 'workdays', label: 'أيام العمل', icon: CalendarDays },
                { id: 'timings', label: 'التوقيت', icon: Clock },
                { id: 'classes', label: 'الفصول', icon: School },
                { id: 'teachers', label: 'المعلمون', icon: Users },
                { id: 'curriculum', label: 'المنهج الرسمي', icon: BookOpen },
                { id: 'constraints', label: 'القيود', icon: Sliders }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="rounded-lg text-xs lg:text-sm data-[state=active]:bg-[#1C3D74] data-[state=active]:text-white transition-all"
                >
                  <tab.icon className="h-4 w-4 ml-1 hidden lg:block" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* ================= TAB: نظرة عامة ================= */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'فصل دراسي', value: classes.length, icon: School, color: 'blue' },
                  { label: 'معلم', value: teachers.length, icon: Users, color: 'emerald' },
                  { label: 'إسناد', value: assignments.length, icon: Target, color: 'purple' },
                  { label: 'أيام دراسة', value: Object.values(workDays).filter(Boolean).length, icon: CalendarDays, color: 'amber' }
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                          <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Quick Settings */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">العام الدراسي</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">العام الدراسي</Label>
                      <Select 
                        value={timingSettings.academicYear} 
                        onValueChange={(v) => handleSettingChange('academicYear', v)}
                      >
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue />
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
                      <Select 
                        value={timingSettings.currentSemester}
                        onValueChange={(v) => handleSettingChange('currentSemester', v)}
                      >
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue />
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
                
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">ملخص التوقيت</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-sm text-slate-500">بداية اليوم</p>
                        <p className="text-xl font-bold text-slate-900">{timingSettings.dayStart}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-sm text-slate-500">عدد الحصص</p>
                        <p className="text-xl font-bold text-slate-900">{timingSettings.periodsPerDay}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-sm text-slate-500">مدة الحصة</p>
                        <p className="text-xl font-bold text-slate-900">{timingSettings.periodDuration} د</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-sm text-slate-500">الاستراحة</p>
                        <p className="text-xl font-bold text-slate-900">{timingSettings.breakDuration} د</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Save Button for Overview */}
              {hasChanges && (
                <div className="flex justify-end">
                  <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8">
                    <Save className="h-4 w-4 ml-2" />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* ================= TAB: بيانات المدرسة ================= */}
            <TabsContent value="school-info" className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">معلومات المدرسة</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditedSchoolInfo(schoolInfo);
                        setShowEditSchool(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1C3D74] to-[#2a5096] flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{schoolInfo.name || 'اسم المدرسة'}</h2>
                        <p className="text-slate-500">{schoolInfo.name_en || 'School Name'}</p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span>{schoolInfo.city || 'المدينة'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4" />
                          <span>{schoolInfo.phone || '---'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span>{schoolInfo.email || '---'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Official Curriculum Stats */}
              {officialCurriculumStats && (
                <Card className="bg-white shadow-sm border-emerald-200">
                  <CardHeader className="bg-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-emerald-800">بيانات المنهج الرسمي</CardTitle>
                        <CardDescription className="text-emerald-600">وزارة التعليم السعودية - للقراءة فقط</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {[
                        { label: 'مرحلة', value: officialCurriculumStats.stages },
                        { label: 'مسار', value: officialCurriculumStats.tracks },
                        { label: 'صف', value: officialCurriculumStats.grades },
                        { label: 'مادة', value: officialCurriculumStats.subjects },
                        { label: 'توزيع', value: officialCurriculumStats.grade_subject_mappings },
                        { label: 'رتبة معلم', value: officialCurriculumStats.teacher_rank_loads }
                      ].map((stat, idx) => (
                        <div key={idx} className="text-center p-3 bg-emerald-50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-700">{stat.value}</p>
                          <p className="text-xs text-emerald-600">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* ================= TAB: أيام العمل ================= */}
            <TabsContent value="workdays" className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">أيام العمل والعطلة</CardTitle>
                  <CardDescription>حدد أيام الدراسة الأسبوعية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4 mb-6">
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
                        onClick={() => handleWorkDayChange(day.key)}
                        className={`cursor-pointer rounded-2xl p-5 text-center transition-all duration-200 ${
                          workDays[day.key] 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <p className="text-xs mb-1 opacity-70">{day.en}</p>
                        <p className="text-lg font-bold">{day.ar}</p>
                        <div className="mt-2">
                          {workDays[day.key] ? <CheckCircle2 className="h-5 w-5 mx-auto" /> : <X className="h-5 w-5 mx-auto opacity-50" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-600">{Object.values(workDays).filter(Boolean).length} أيام دراسة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                        <span className="text-sm text-slate-600">{Object.values(workDays).filter(v => !v).length} أيام عطلة</span>
                      </div>
                    </div>
                    <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8">
                      <Save className="h-4 w-4 ml-2" />
                      {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: التوقيت ================= */}
            <TabsContent value="timings" className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">إعدادات التوقيت</CardTitle>
                  <CardDescription>حدد هيكل اليوم الدراسي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-slate-600 mb-2 block">وقت بداية اليوم</Label>
                        <Input 
                          type="time" 
                          value={timingSettings.dayStart}
                          onChange={(e) => handleSettingChange('dayStart', e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600 mb-2 block">عدد الحصص في اليوم</Label>
                        <Select 
                          value={String(timingSettings.periodsPerDay)}
                          onValueChange={(v) => handleSettingChange('periodsPerDay', parseInt(v))}
                        >
                          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[5, 6, 7, 8, 9].map(n => <SelectItem key={n} value={String(n)}>{n} حصص</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-slate-600 mb-2 block">مدة الحصة (بالدقائق)</Label>
                        <Select 
                          value={String(timingSettings.periodDuration)}
                          onValueChange={(v) => handleSettingChange('periodDuration', parseInt(v))}
                        >
                          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[30, 35, 40, 45, 50, 55, 60].map(n => <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600 mb-2 block">مدة الاستراحة (بالدقائق)</Label>
                        <Select 
                          value={String(timingSettings.breakDuration)}
                          onValueChange={(v) => handleSettingChange('breakDuration', parseInt(v))}
                        >
                          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[10, 15, 20, 25, 30].map(n => <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-end">
                    <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8">
                      <Save className="h-4 w-4 ml-2" />
                      {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: الفصول ================= */}
            <TabsContent value="classes" className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">الفصول الدراسية</CardTitle>
                      <CardDescription>{classes.length} فصل مسجل</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddClass(true)} className="bg-[#1C3D74]">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة فصل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {classes.length === 0 ? (
                    <div className="text-center py-12">
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
                          <tr className="border-b">
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">اسم الفصل</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">الصف</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">الشعبة</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">السعة</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classes.map((cls, idx) => (
                            <tr key={cls.id || idx} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4 font-medium">{cls.name || cls.name_ar || '-'}</td>
                              <td className="py-3 px-4 text-slate-600">{cls.grade || cls.grade_name || '-'}</td>
                              <td className="py-3 px-4 text-slate-600">{cls.section || '-'}</td>
                              <td className="py-3 px-4 text-slate-600">{cls.capacity || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600" onClick={() => deleteClass(cls.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">المعلمون</CardTitle>
                      <CardDescription>{teachers.length} معلم مسجل</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddTeacher(true)} className="bg-[#1C3D74]">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة معلم
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {teachers.length === 0 ? (
                    <div className="text-center py-12">
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
                          <tr className="border-b">
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">اسم المعلم</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">البريد</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">الهاتف</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">التخصص</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teachers.map((teacher, idx) => (
                            <tr key={teacher.id || idx} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4 font-medium">{teacher.name || teacher.name_ar || '-'}</td>
                              <td className="py-3 px-4 text-slate-600">{teacher.email || '-'}</td>
                              <td className="py-3 px-4 text-slate-600">{teacher.phone || '-'}</td>
                              <td className="py-3 px-4 text-slate-600">{teacher.specialization || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600" onClick={() => deleteTeacher(teacher.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
            
            {/* ================= TAB: المنهج الرسمي ================= */}
            <TabsContent value="curriculum" className="space-y-6">
              <Card className="bg-white shadow-sm border-emerald-200">
                <CardHeader className="bg-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-emerald-800">المنهج الرسمي</CardTitle>
                        <CardDescription className="text-emerald-600">بيانات وزارة التعليم السعودية - للقراءة فقط</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      <Shield className="h-3 w-3 ml-1" />
                      بيانات مقفلة
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* المراحل الدراسية */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-600" />
                      المراحل الدراسية ({officialStages.length})
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {officialStages.map((stage) => (
                        <div key={stage.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                          <p className="font-bold text-emerald-800">{stage.name_ar}</p>
                          <p className="text-sm text-emerald-600">{stage.name_en}</p>
                          <p className="text-xs text-emerald-500 mt-2">{stage.grades_count} صفوف</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* المسارات التعليمية */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-blue-600" />
                      المسارات التعليمية ({officialTracks.length})
                    </h3>
                    <div className="grid md:grid-cols-4 gap-3">
                      {officialTracks.map((track) => (
                        <div key={track.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium text-blue-800 text-sm">{track.name_ar}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* النصاب الرسمي */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-violet-600" />
                      النصاب الرسمي للمعلمين ({officialRankLoads.length})
                    </h3>
                    <div className="grid md:grid-cols-4 gap-3">
                      {officialRankLoads.map((rank) => (
                        <div key={rank.id} className="p-4 bg-violet-50 rounded-xl border border-violet-200 text-center">
                          <p className="font-bold text-violet-800">{rank.rank_name_ar}</p>
                          <p className="text-2xl font-bold text-violet-600 mt-2">{rank.weekly_periods}</p>
                          <p className="text-xs text-violet-500">حصة/أسبوع</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: القيود ================= */}
            <TabsContent value="constraints" className="space-y-6">
              {/* Hard Constraints */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    القيود الإلزامية (Hard Constraints)
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
                    ].map((c, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                        <CheckCircle2 className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-800">{c}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Soft Constraints */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    القيود التفضيلية (Soft Constraints)
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
                    ].map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-sm text-amber-900">{c.name}</span>
                        <Switch defaultChecked={c.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* ================= Modals ================= */}
      
      {/* Edit School Info Modal */}
      <Dialog open={showEditSchool} onOpenChange={setShowEditSchool}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل معلومات المدرسة</DialogTitle>
            <DialogDescription>قم بتحديث بيانات المدرسة الأساسية</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم المدرسة (عربي)</Label>
                <Input 
                  value={editedSchoolInfo.name || ''}
                  onChange={(e) => setEditedSchoolInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>اسم المدرسة (إنجليزي)</Label>
                <Input 
                  value={editedSchoolInfo.name_en || ''}
                  onChange={(e) => setEditedSchoolInfo(prev => ({ ...prev, name_en: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>المدينة</Label>
              <Input 
                value={editedSchoolInfo.city || ''}
                onChange={(e) => setEditedSchoolInfo(prev => ({ ...prev, city: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input 
                value={editedSchoolInfo.phone || ''}
                onChange={(e) => setEditedSchoolInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input 
                value={editedSchoolInfo.email || ''}
                onChange={(e) => setEditedSchoolInfo(prev => ({ ...prev, email: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSchool(false)}>إلغاء</Button>
            <Button onClick={saveSchoolInfo} disabled={saving} className="bg-[#1C3D74]">
              <Save className="h-4 w-4 ml-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
            <div>
              <Label>التخصص</Label>
              <Input 
                value={newTeacher.specialization}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="مثال: رياضيات"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTeacher(false)}>إلغاء</Button>
            <Button onClick={addTeacher} className="bg-[#1C3D74]">
              <Save className="h-4 w-4 ml-2" />
              إضافة
            </Button>
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
              <Select value={newClass.grade} onValueChange={(v) => setNewClass(prev => ({ ...prev, grade: v }))}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="اختر الصف" /></SelectTrigger>
                <SelectContent>
                  {['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'].map(g => (
                    <SelectItem key={g} value={g}>الصف {g}</SelectItem>
                  ))}
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
            <Button onClick={addClass} className="bg-[#1C3D74]">
              <Save className="h-4 w-4 ml-2" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { SchoolSettingsPagePro };
export default SchoolSettingsPagePro;
