/**
 * School Settings Page - إعدادات المدرسة
 * NASSAQ | نَسَّق
 * 
 * مقسمة إلى قسمين رئيسيين:
 * 1. البيانات المتغيرة لبناء الجدول (Dynamic Timetable Inputs)
 * 2. البيانات الأساسية الثابتة العامة (Official Static Reference Data)
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
  Layers, Award, ChevronRight, FileText, Database, Zap, Lock,
  Calendar, Timer, Coffee, Moon, UserX, DoorClosed, Link2, Heart
} from 'lucide-react';

// ============================================
// Main Component
// ============================================

function SchoolSettingsPagePro() {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [activeSection, setActiveSection] = useState('dynamic'); // 'dynamic' or 'static'
  const [activeTab, setActiveTab] = useState('academic-year');
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
  
  // Full curriculum data per stage
  const [stageCurriculums, setStageCurriculums] = useState({});
  const [loadingCurriculum, setLoadingCurriculum] = useState({});
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedTracks, setExpandedTracks] = useState({});
  const [expandedGrades, setExpandedGrades] = useState({});
  
  // Subjects for assignment
  const [subjects, setSubjects] = useState([]);
  const [draggingSubject, setDraggingSubject] = useState(null);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  
  // Modal States
  const [showEditSchool, setShowEditSchool] = useState(false);
  
  // Form States
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
  
  // Break Times
  const [breakTimes, setBreakTimes] = useState([
    { id: 1, name: 'الاستراحة الأولى', afterPeriod: 2, duration: 15, type: 'break' },
    { id: 2, name: 'صلاة الظهر', afterPeriod: 4, duration: 20, type: 'prayer' },
    { id: 3, name: 'الاستراحة الثانية', afterPeriod: 5, duration: 10, type: 'break' }
  ]);
  
  // Unavailability
  const [teacherUnavailability, setTeacherUnavailability] = useState([]);
  const [classUnavailability, setClassUnavailability] = useState([]);
  
  // Soft Constraints
  const [softConstraints, setSoftConstraints] = useState([
    { id: 1, name: 'توزيع حصص المادة على أكثر من يوم', enabled: true, weight: 80 },
    { id: 2, name: 'تقليل الفجوات في جدول المعلم', enabled: true, weight: 70 },
    { id: 3, name: 'تقليل الفجوات في جدول الفصل', enabled: true, weight: 70 },
    { id: 4, name: 'المواد الثقيلة في أول اليوم', enabled: false, weight: 50 },
    { id: 5, name: 'عدم تكرار نفس المادة متتالياً', enabled: true, weight: 60 },
    { id: 6, name: 'توزيع حصص المعلم بشكل متوازن', enabled: true, weight: 65 }
  ]);

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
        officialStatsRes, officialStagesRes, officialTracksRes, officialRankLoadsRes,
        subjectsRes
      ] = await Promise.all([
        api.get('/school/settings').catch(() => ({ data: {} })),
        api.get('/teachers').catch(() => ({ data: [] })),
        api.get('/classes').catch(() => ({ data: [] })),
        api.get('/teacher-assignments').catch(() => ({ data: [] })),
        api.get('/school/constraints').catch(() => ({ data: [] })),
        api.get('/timetable-readiness/check').catch(() => ({ data: null })),
        api.get('/school/info').catch(() => ({ data: {} })),
        api.get('/official-curriculum/stats').catch(() => ({ data: null })),
        api.get('/official-curriculum/stages').catch(() => ({ data: [] })),
        api.get('/official-curriculum/tracks').catch(() => ({ data: [] })),
        api.get('/official-curriculum/teacher-rank-loads').catch(() => ({ data: [] })),
        api.get('/school/subjects/unique').catch(() => ({ data: [] }))
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
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      
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
  // Curriculum Loading Functions
  // ============================================
  
  const fetchStageCurriculum = useCallback(async (stageId) => {
    if (!api || stageCurriculums[stageId] || loadingCurriculum[stageId]) return;
    
    setLoadingCurriculum(prev => ({ ...prev, [stageId]: true }));
    try {
      const response = await api.get(`/official-curriculum/stage/${stageId}/full`);
      setStageCurriculums(prev => ({ ...prev, [stageId]: response.data }));
    } catch (error) {
      console.error('Error fetching stage curriculum:', error);
      toast.error('حدث خطأ في تحميل بيانات المرحلة');
    } finally {
      setLoadingCurriculum(prev => ({ ...prev, [stageId]: false }));
    }
  }, [api, stageCurriculums, loadingCurriculum]);
  
  const toggleStageExpand = (stageId) => {
    setExpandedStages(prev => {
      const newExpanded = { ...prev, [stageId]: !prev[stageId] };
      if (newExpanded[stageId]) {
        fetchStageCurriculum(stageId);
      }
      return newExpanded;
    });
  };
  
  const toggleTrackExpand = (trackId) => {
    setExpandedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  };
  
  const toggleGradeExpand = (gradeId) => {
    setExpandedGrades(prev => ({ ...prev, [gradeId]: !prev[gradeId] }));
  };

  // ============================================
  // Save Functions
  // ============================================
  
  const saveAllSettings = async () => {
    setSaving(true);
    try {
      const dayNames = { sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت' };
      const workingDays = Object.entries(workDays).filter(([_, active]) => active).map(([day]) => dayNames[day]);
      const weekendDays = Object.entries(workDays).filter(([_, active]) => !active).map(([day]) => dayNames[day]);
      
      // Send only the required fields, not the entire settings object
      const dataToSave = {
        academicYear: timingSettings.academicYear,
        currentSemester: timingSettings.currentSemester,
        dayStart: timingSettings.dayStart,
        dayEnd: timingSettings.dayEnd,
        periodsPerDay: timingSettings.periodsPerDay,
        periodDuration: timingSettings.periodDuration,
        breakDuration: timingSettings.breakDuration,
        breakAfterPeriod: timingSettings.breakAfterPeriod,
        workingDays, 
        weekendDays 
      };
      
      await api.put('/school/settings', dataToSave);
      toast.success('تم حفظ جميع الإعدادات بنجاح');
      setHasChanges(false);
      fetchData();
    } catch (error) {
      console.error('Save error:', error);
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
  
  // ============================================
  // Teacher Assignment Drag & Drop Functions
  // ============================================
  
  const handleDragStart = (e, subject) => {
    setDraggingSubject(subject);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', subject.id);
  };
  
  const handleDragEnd = () => {
    setDraggingSubject(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const handleDropOnTeacher = async (e, teacher) => {
    e.preventDefault();
    if (!draggingSubject) return;
    
    // Check if this assignment already exists for this teacher
    const existingAssignment = assignments.find(
      a => a.teacher_id === teacher.id && a.subject_id === draggingSubject.id
    );
    
    if (existingAssignment) {
      toast.error('هذه المادة مسندة بالفعل لهذا المعلم');
      setDraggingSubject(null);
      return;
    }
    
    setAssignmentSaving(true);
    try {
      const schoolId = user?.tenant_id || user?.school_id || 'SCH-001';
      await api.post('/teacher-assignments', {
        teacher_id: teacher.id,
        subject_id: draggingSubject.id,
        school_id: schoolId
      });
      toast.success(`تم إسناد "${draggingSubject.name_ar}" إلى "${teacher.full_name || teacher.name}"`);
      fetchData();
    } catch (error) {
      console.error('Assignment error:', error);
      let errorMessage = 'حدث خطأ في إسناد المادة';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      }
      toast.error(errorMessage);
    } finally {
      setAssignmentSaving(false);
      setDraggingSubject(null);
    }
  };
  
  const removeAssignment = async (assignmentId) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الإسناد؟')) return;
    
    try {
      await api.delete(`/teacher-assignments/${assignmentId}`);
      toast.success('تم إلغاء الإسناد بنجاح');
      fetchData();
    } catch (error) {
      console.error('Remove assignment error:', error);
      toast.error('حدث خطأ في إلغاء الإسناد');
    }
  };
  
  const getTeacherAssignments = (teacherId) => {
    return assignments.filter(a => a.teacher_id === teacherId);
  };
  
  const getSubjectById = (subjectId) => {
    return subjects.find(s => s.id === subjectId);
  };
  
  const deleteClass = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success('تم حذف الفصل بنجاح');
      fetchData();
    } catch (error) {
      console.error('Delete class error:', error);
      let errorMessage = 'حدث خطأ في حذف الفصل';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      }
      toast.error(errorMessage);
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
  
  const handleSoftConstraintToggle = (id) => {
    setSoftConstraints(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    setHasChanges(true);
  };
  
  // Navigate to specific tab for fixing issues
  const navigateToFix = (category) => {
    setActiveSection('dynamic');
    const tabMapping = {
      'academic_context': 'academic-year',
      'school_days': 'workdays',
      'day_structure': 'timings',
      'classes': 'classes',
      'teachers': 'teacher-assignments',
      'teacher_assignments': 'teacher-assignments',
      'constraints': 'constraints'
    };
    const tab = tabMapping[category] || 'academic-year';
    setActiveTab(tab);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // Dynamic Section Tabs Configuration
  // ============================================
  const dynamicTabs = [
    { id: 'academic-year', label: 'العام والفصل الدراسي', icon: Calendar },
    { id: 'workdays', label: 'أيام العمل', icon: CalendarDays },
    { id: 'timings', label: 'التوقيت والحصص', icon: Clock },
    { id: 'breaks', label: 'الاستراحات والصلاة', icon: Coffee },
    { id: 'classes', label: 'الفصول والشعب', icon: School },
    { id: 'teacher-assignments', label: 'إسناد المعلمين', icon: Link2 },
    { id: 'unavailability', label: 'عدم التوفر', icon: UserX },
    { id: 'constraints', label: 'القيود والتفضيلات', icon: Sliders }
  ];
  
  // Static Section Tabs Configuration
  const staticTabs = [
    { id: 'curriculum', label: 'المنهج الرسمي', icon: BookOpen },
    { id: 'stages', label: 'المراحل والمسارات', icon: Layers },
    { id: 'rank-loads', label: 'النصاب التعليمي', icon: Award },
    { id: 'subject-distribution', label: 'توزيع المواد', icon: Target }
  ];

  // ============================================
  // Render
  // ============================================
  
  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-slate-50" dir="rtl">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#1C3D74] mx-auto mb-4" />
              <p className="text-slate-600">جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        {/* Main Content */}
        <div className="overflow-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">إعدادات المدرسة</h1>
              <p className="text-slate-500 mt-1">إدارة بيانات الجدول والمعلومات المرجعية</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchData} disabled={loading} data-testid="refresh-btn">
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              {hasChanges && (
                <Button 
                  onClick={saveAllSettings} 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                  data-testid="save-all-btn"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Readiness Status Card - بطاقة جاهزية الجدول */}
          {readinessData && (
            <Card className="mb-6 overflow-hidden border-0 shadow-lg" data-testid="readiness-card">
              {/* Header Section */}
              <div className={`p-5 ${
                readinessData.status === 'FULLY_READY' 
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' 
                  : readinessData.status === 'PARTIALLY_READY'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                  : 'bg-gradient-to-br from-[#1C3D74] to-[#2a5096]'
              } text-white`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
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
                         readinessData.status === 'PARTIALLY_READY' ? 'بيانات الجدول جاهزة جزئياً' :
                         'بيانات الجدول غير مكتملة'}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {readinessData.summary?.critical_count > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {readinessData.summary.critical_count} عناصر ضرورية مطلوبة لإنشاء الجدول
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className={`${readinessData.can_generate ? 'bg-white text-[#1C3D74] hover:bg-slate-100' : 'bg-white/20 text-white cursor-not-allowed'}`}
                    disabled={!readinessData.can_generate}
                    onClick={() => navigate('/school/schedule')}
                    data-testid="generate-timetable-btn"
                  >
                    <Play className="h-5 w-5 ml-2" />
                    {readinessData.can_generate ? 'إنشاء الجدول' : 'أكمل البيانات أولاً'}
                  </Button>
                </div>
              </div>
              
              {/* Required Data Section - البيانات المطلوبة */}
              {readinessData.critical_issues && readinessData.critical_issues.length > 0 && (
                <CardContent className="p-5 bg-white">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      البيانات الضرورية المطلوبة
                    </h3>
                    <p className="text-sm text-slate-500">أكمل هذه البيانات لتتمكن من إنشاء الجدول المدرسي</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Group issues by category */}
                    {Object.entries(readinessData.categories || {})
                      .filter(([_, cat]) => cat.status === 'critical')
                      .map(([categoryId, category]) => (
                        <div 
                          key={categoryId}
                          className="p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-red-800 text-sm">{category.name_ar}</h4>
                                <p className="text-xs text-red-600">{category.score}/{category.max_score} نقطة</p>
                              </div>
                            </div>
                          </div>
                          
                          <ul className="space-y-1 mb-3">
                            {category.issues?.filter(i => i.type === 'critical').slice(0, 2).map((issue, idx) => (
                              <li key={idx} className="text-xs text-red-700 flex items-start gap-1">
                                <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {issue.message_ar}
                              </li>
                            ))}
                          </ul>
                          
                          <Button 
                            size="sm" 
                            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                            onClick={() => navigateToFix(categoryId)}
                            data-testid={`fix-${categoryId}-btn`}
                          >
                            <Edit2 className="h-3 w-3 ml-1" />
                            {category.issues?.[0]?.fix_action || 'إصلاح'}
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  {/* Ready Categories Summary */}
                  {Object.entries(readinessData.categories || {})
                    .filter(([_, cat]) => cat.status === 'ready').length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        البيانات المكتملة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(readinessData.categories || {})
                          .filter(([_, cat]) => cat.status === 'ready')
                          .map(([categoryId, category]) => (
                            <Badge key={categoryId} className="bg-emerald-100 text-emerald-700 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {category.name_ar}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
              
              {/* All Ready State */}
              {readinessData.status === 'FULLY_READY' && (
                <CardContent className="p-5 bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-emerald-800">جميع البيانات مكتملة!</h3>
                      <p className="text-sm text-emerald-600">يمكنك الآن إنشاء الجدول المدرسي بالذكاء الاصطناعي</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Section Selector */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => { setActiveSection('dynamic'); setActiveTab('academic-year'); }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                activeSection === 'dynamic' 
                  ? 'border-[#1C3D74] bg-[#1C3D74]/5 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              data-testid="section-dynamic-btn"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  activeSection === 'dynamic' ? 'bg-[#1C3D74] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Zap className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <h3 className={`font-bold ${activeSection === 'dynamic' ? 'text-[#1C3D74]' : 'text-slate-700'}`}>
                    البيانات المتغيرة لبناء الجدول
                  </h3>
                  <p className="text-sm text-slate-500">Dynamic Timetable Inputs</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => { setActiveSection('static'); setActiveTab('curriculum'); }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                activeSection === 'static' 
                  ? 'border-brand-turquoise bg-brand-turquoise/10 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              data-testid="section-static-btn"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  activeSection === 'static' ? 'bg-brand-turquoise text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Lock className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <h3 className={`font-bold ${activeSection === 'static' ? 'text-brand-turquoise-dark' : 'text-slate-700'}`}>
                    البيانات الأساسية الثابتة
                  </h3>
                  <p className="text-sm text-slate-500">Official Static Reference Data</p>
                </div>
              </div>
            </button>
          </div>
          
          {/* ========================================= */}
          {/* DYNAMIC SECTION - البيانات المتغيرة */}
          {/* ========================================= */}
          {activeSection === 'dynamic' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3 p-4 bg-[#1C3D74]/5 rounded-xl border border-[#1C3D74]/20">
                <Zap className="h-5 w-5 text-[#1C3D74]" />
                <div>
                  <h2 className="font-bold text-[#1C3D74]">البيانات المتغيرة لبناء الجدول</h2>
                  <p className="text-sm text-slate-600">هذه البيانات تمثل المدخلات التشغيلية لمحرك الجدول ويمكن تعديلها بشكل متكرر</p>
                </div>
              </div>
              
              {/* Dynamic Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-auto bg-white rounded-xl p-2 shadow-sm border mb-6 flex flex-wrap gap-1">
                  {dynamicTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex-1 min-w-[140px] rounded-lg text-xs lg:text-sm py-2.5 data-[state=active]:bg-[#1C3D74] data-[state=active]:text-white transition-all"
                      data-testid={`tab-${tab.id}`}
                    >
                      <tab.icon className="h-4 w-4 ml-1.5" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* ======= TAB: العام والفصل الدراسي ======= */}
                <TabsContent value="academic-year" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#1C3D74]" />
                        العام والفصل الدراسي الحالي
                      </CardTitle>
                      <CardDescription>حدد العام والفصل الدراسي الذي سيتم بناء الجدول له</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm text-slate-600 mb-2 block">العام الدراسي</Label>
                          <Select 
                            value={timingSettings.academicYear} 
                            onValueChange={(v) => handleSettingChange('academicYear', v)}
                          >
                            <SelectTrigger className="h-12 bg-white" data-testid="academic-year-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1447">1447 هـ</SelectItem>
                              <SelectItem value="1446">1446 هـ</SelectItem>
                              <SelectItem value="1445">1445 هـ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600 mb-2 block">الفصل الدراسي</Label>
                          <Select 
                            value={timingSettings.currentSemester}
                            onValueChange={(v) => handleSettingChange('currentSemester', v)}
                          >
                            <SelectTrigger className="h-12 bg-white" data-testid="semester-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">الفصل الأول</SelectItem>
                              <SelectItem value="2">الفصل الثاني</SelectItem>
                              <SelectItem value="3">الفصل الثالث</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8" data-testid="save-academic-btn">
                          <Save className="h-4 w-4 ml-2" />
                          {saving ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: أيام العمل ======= */}
                <TabsContent value="workdays" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-[#1C3D74]" />
                        أيام العمل والعطلة
                      </CardTitle>
                      <CardDescription>حدد أيام الدراسة الأسبوعية</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-3 mb-6">
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
                            className={`cursor-pointer rounded-xl p-4 text-center transition-all duration-200 ${
                              workDays[day.key] 
                                ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            data-testid={`day-${day.key}`}
                          >
                            <p className="text-xs mb-1 opacity-70">{day.en}</p>
                            <p className="text-sm font-bold">{day.ar}</p>
                            <div className="mt-2">
                              {workDays[day.key] ? <CheckCircle2 className="h-4 w-4 mx-auto" /> : <X className="h-4 w-4 mx-auto opacity-50" />}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-brand-navy"></div>
                            <span className="text-sm text-slate-600">{Object.values(workDays).filter(Boolean).length} أيام دراسة</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                            <span className="text-sm text-slate-600">{Object.values(workDays).filter(v => !v).length} أيام عطلة</span>
                          </div>
                        </div>
                        <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8" data-testid="save-workdays-btn">
                          <Save className="h-4 w-4 ml-2" />
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: التوقيت والحصص ======= */}
                <TabsContent value="timings" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#1C3D74]" />
                        إعدادات التوقيت والحصص
                      </CardTitle>
                      <CardDescription>حدد هيكل اليوم الدراسي وعدد الحصص</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm text-slate-600 mb-2 block">وقت بداية اليوم الدراسي</Label>
                            <Input 
                              type="time" 
                              value={timingSettings.dayStart}
                              onChange={(e) => handleSettingChange('dayStart', e.target.value)}
                              className="h-12 text-lg"
                              data-testid="day-start-input"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-slate-600 mb-2 block">عدد الحصص في اليوم</Label>
                            <Select 
                              value={String(timingSettings.periodsPerDay)}
                              onValueChange={(v) => handleSettingChange('periodsPerDay', parseInt(v))}
                            >
                              <SelectTrigger className="h-12" data-testid="periods-per-day-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 6, 7, 8, 9, 10].map(n => <SelectItem key={n} value={String(n)}>{n} حصص</SelectItem>)}
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
                              <SelectTrigger className="h-12" data-testid="period-duration-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[30, 35, 40, 45, 50, 55, 60].map(n => <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm text-slate-600 mb-2 block">مدة الاستراحة الأساسية (بالدقائق)</Label>
                            <Select 
                              value={String(timingSettings.breakDuration)}
                              onValueChange={(v) => handleSettingChange('breakDuration', parseInt(v))}
                            >
                              <SelectTrigger className="h-12" data-testid="break-duration-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[10, 15, 20, 25, 30].map(n => <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timing Summary */}
                      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <h4 className="font-medium text-slate-700 mb-3">ملخص اليوم الدراسي</h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">بداية اليوم</p>
                            <p className="text-xl font-bold text-[#1C3D74]">{timingSettings.dayStart}</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">عدد الحصص</p>
                            <p className="text-xl font-bold text-[#1C3D74]">{timingSettings.periodsPerDay}</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">مدة الحصة</p>
                            <p className="text-xl font-bold text-[#1C3D74]">{timingSettings.periodDuration} د</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">الاستراحة</p>
                            <p className="text-xl font-bold text-[#1C3D74]">{timingSettings.breakDuration} د</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8" data-testid="save-timings-btn">
                          <Save className="h-4 w-4 ml-2" />
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: الاستراحات والصلاة ======= */}
                <TabsContent value="breaks" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Coffee className="h-5 w-5 text-[#1C3D74]" />
                            فترات الاستراحة والصلاة
                          </CardTitle>
                          <CardDescription>حدد أوقات الاستراحات وفترات الصلاة</CardDescription>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          إضافة فترة
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {breakTimes.map((breakTime) => (
                          <div key={breakTime.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                            breakTime.type === 'prayer' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                          }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                breakTime.type === 'prayer' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {breakTime.type === 'prayer' ? <Moon className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-medium">{breakTime.name}</p>
                                <p className="text-sm text-slate-500">بعد الحصة {breakTime.afterPeriod} • {breakTime.duration} دقيقة</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8" data-testid="save-breaks-btn">
                          <Save className="h-4 w-4 ml-2" />
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: الفصول والشعب ======= */}
                <TabsContent value="classes" className="space-y-6">
                  <Card className="bg-white shadow-sm border-brand-navy/10">
                    <CardHeader className="bg-gradient-to-l from-brand-navy/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center">
                            <School className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-brand-navy">الفصول الدراسية والشعب</CardTitle>
                            <CardDescription className="text-brand-navy/60">{classes.length} فصل مسجل في قاعدة البيانات</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-brand-turquoise/10 text-brand-turquoise border-brand-turquoise/30">
                          <Database className="h-3 w-3 ml-1" />
                          بيانات من قاعدة البيانات
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {classes.length === 0 ? (
                        <div className="text-center py-12">
                          <School className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                          <p className="text-lg text-slate-500 mb-2">لا يوجد فصول مسجلة</p>
                          <p className="text-sm text-slate-400">يمكنك إضافة الفصول من صفحة إدارة المستخدمين والفصول</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-brand-navy">#</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-brand-navy">اسم الفصل</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-brand-navy">الصف</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-brand-navy">الشعبة</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-brand-navy">السعة</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-brand-navy">الحالة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {classes.map((cls, idx) => (
                                <tr key={cls.id || idx} className="hover:bg-brand-navy/5 transition-colors">
                                  <td className="py-3 px-4 text-slate-500 text-sm">{idx + 1}</td>
                                  <td className="py-3 px-4">
                                    <span className="font-medium text-slate-800">{cls.name || cls.name_ar || '-'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-600">{cls.grade_level || cls.grade || cls.grade_name || '-'}</td>
                                  <td className="py-3 px-4 text-slate-600">{cls.section || '-'}</td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge variant="outline" className="bg-brand-navy/5 text-brand-navy border-brand-navy/20">
                                      {cls.capacity || 30} طالب
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge className={cls.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                                      {cls.is_active !== false ? 'نشط' : 'غير نشط'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {/* Info Banner */}
                      <div className="p-4 bg-amber-50 border-t border-amber-200">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-amber-700">
                              لإضافة أو تعديل الفصول، استخدم صفحة <span className="font-medium">إدارة المستخدمين والفصول</span> من القائمة الجانبية.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: إسناد المعلمين ======= */}
                <TabsContent value="teacher-assignments" className="space-y-6">
                  {/* Header Card */}
                  <Card className="bg-gradient-to-l from-brand-navy/10 to-brand-turquoise/5 border-brand-navy/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center">
                            <Link2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-brand-navy">ربط المعلمين بالمواد</h3>
                            <p className="text-sm text-brand-navy/60">
                              {teachers.length} معلم • {subjects.length} مادة • {assignments.length} إسناد
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-brand-turquoise/10 text-brand-turquoise border-brand-turquoise/30">
                            <Zap className="h-3 w-3 ml-1" />
                            سحب وإفلات
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Instructions */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800">طريقة الاستخدام</p>
                        <p className="text-sm text-blue-700 mt-1">
                          اسحب أي مادة من قائمة المواد على اليسار وأفلتها داخل صندوق المعلم المطلوب لإسنادها له.
                          يمكنك إسناد نفس المادة لأكثر من معلم.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content - Drag & Drop Interface */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Subjects List (Draggable) */}
                    <Card className="lg:col-span-1 bg-white shadow-sm border-brand-purple/20">
                      <CardHeader className="bg-brand-purple/5 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-brand-purple">
                          <BookOpen className="h-5 w-5" />
                          المواد الدراسية
                        </CardTitle>
                        <CardDescription>{subjects.length} مادة متاحة للإسناد</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                          <div className="p-3 space-y-2">
                            {subjects.map((subject) => (
                              <div
                                key={subject.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, subject)}
                                onDragEnd={handleDragEnd}
                                className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all
                                  ${draggingSubject?.id === subject.id 
                                    ? 'bg-brand-purple/20 border-brand-purple shadow-lg scale-105' 
                                    : 'bg-white border-slate-200 hover:border-brand-purple/50 hover:shadow-sm'
                                  }`}
                                data-testid={`draggable-subject-${subject.id}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-4 w-4 text-brand-purple" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 truncate text-sm">{subject.name_ar}</p>
                                    <p className="text-xs text-slate-500 truncate">{subject.name_en || subject.category}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                    
                    {/* Teachers List (Drop Zones) */}
                    <Card className="lg:col-span-2 bg-white shadow-sm border-brand-navy/20">
                      <CardHeader className="bg-brand-navy/5 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-brand-navy">
                          <Users className="h-5 w-5" />
                          المعلمون
                        </CardTitle>
                        <CardDescription>أفلت المواد هنا لإسنادها للمعلمين</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                          <div className="p-3 space-y-4">
                            {teachers.length === 0 ? (
                              <div className="text-center py-12">
                                <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                                <p className="text-lg text-slate-500 mb-2">لا يوجد معلمين مسجلين</p>
                                <p className="text-sm text-slate-400">يمكنك إضافة المعلمين من صفحة إدارة المستخدمين</p>
                              </div>
                            ) : (
                              teachers.map((teacher) => {
                                const teacherAssignments = getTeacherAssignments(teacher.id);
                                return (
                                  <div
                                    key={teacher.id}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropOnTeacher(e, teacher)}
                                    className={`p-4 rounded-xl border-2 transition-all
                                      ${draggingSubject 
                                        ? 'border-dashed border-brand-turquoise bg-brand-turquoise/5' 
                                        : 'border-slate-200 bg-white'
                                      }`}
                                    data-testid={`teacher-drop-zone-${teacher.id}`}
                                  >
                                    {/* Teacher Header */}
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center">
                                          <span className="text-white font-bold text-sm">
                                            {(teacher.full_name || teacher.name || '?')[0]}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-800">{teacher.full_name || teacher.name || '-'}</p>
                                          <p className="text-xs text-slate-500">{teacher.specialization || teacher.email || '-'}</p>
                                        </div>
                                      </div>
                                      <Badge className="bg-brand-navy/10 text-brand-navy">
                                        {teacherAssignments.length} مادة
                                      </Badge>
                                    </div>
                                    
                                    {/* Assigned Subjects */}
                                    <div className="min-h-[60px]">
                                      {teacherAssignments.length === 0 ? (
                                        <div className={`text-center py-4 rounded-lg transition-colors
                                          ${draggingSubject ? 'bg-brand-turquoise/10' : 'bg-slate-50'}`}
                                        >
                                          <p className="text-sm text-slate-400">
                                            {draggingSubject ? 'أفلت المادة هنا' : 'لا توجد مواد مسندة'}
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="flex flex-wrap gap-2">
                                          {teacherAssignments.map((assignment) => {
                                            const subject = getSubjectById(assignment.subject_id);
                                            return (
                                              <div
                                                key={assignment.id}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-turquoise/10 border border-brand-turquoise/30 group"
                                              >
                                                <span className="text-sm font-medium text-brand-turquoise-dark">
                                                  {subject?.name_ar || assignment.subject_name || assignment.subject_id}
                                                </span>
                                                <button
                                                  onClick={() => removeAssignment(assignment.id)}
                                                  className="w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                  title="إلغاء الإسناد"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Info Banner */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-700">
                          لإضافة معلمين جدد، استخدم صفحة <span className="font-medium">إدارة المستخدمين والفصول</span>.
                          المواد المعروضة هي المواد الرسمية من المنهج الوزاري.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* ======= TAB: عدم التوفر ======= */}
                <TabsContent value="unavailability" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Teacher Unavailability */}
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <UserX className="h-5 w-5 text-amber-600" />
                              عدم توفر المعلمين
                            </CardTitle>
                            <CardDescription>حدد أوقات عدم توفر المعلمين</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="h-4 w-4" />
                            إضافة
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {teacherUnavailability.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <UserX className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">لا يوجد قيود على توفر المعلمين</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {teacherUnavailability.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <span className="text-sm">{item.teacher_name} - {item.day} - الحصة {item.period}</span>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500"><X className="h-3 w-3" /></Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Class Unavailability */}
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <DoorClosed className="h-5 w-5 text-red-600" />
                              عدم توفر الفصول
                            </CardTitle>
                            <CardDescription>حدد أوقات عدم توفر الفصول</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="h-4 w-4" />
                            إضافة
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {classUnavailability.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <DoorClosed className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">لا يوجد قيود على توفر الفصول</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {classUnavailability.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                <span className="text-sm">{item.class_name} - {item.day} - الحصة {item.period}</span>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500"><X className="h-3 w-3" /></Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* ======= TAB: القيود والتفضيلات ======= */}
                <TabsContent value="constraints" className="space-y-6">
                  {/* Hard Constraints */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        القيود الإلزامية (Hard Constraints)
                      </CardTitle>
                      <CardDescription>قيود لا يمكن خرقها - مطبقة تلقائياً على جميع الجداول</CardDescription>
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
                          <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
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
                      <CardDescription>تؤثر على جودة الجدول - يمكن تفعيلها/تعطيلها وضبط أولويتها</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {softConstraints.map((c) => (
                          <div key={c.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-3">
                              <Switch 
                                checked={c.enabled} 
                                onCheckedChange={() => handleSoftConstraintToggle(c.id)}
                                data-testid={`constraint-switch-${c.id}`}
                              />
                              <span className={`text-sm ${c.enabled ? 'text-amber-900' : 'text-slate-400'}`}>{c.name}</span>
                            </div>
                            {c.enabled && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">الأولوية:</span>
                                <Badge className="bg-amber-200 text-amber-800">{c.weight}%</Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button onClick={saveAllSettings} disabled={saving} className="bg-[#1C3D74] hover:bg-[#152d57] px-8" data-testid="save-constraints-btn">
                          <Save className="h-4 w-4 ml-2" />
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* ========================================= */}
          {/* STATIC SECTION - البيانات الثابتة */}
          {/* ========================================= */}
          {activeSection === 'static' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <Lock className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-emerald-700">البيانات الأساسية الثابتة العامة</h2>
                  <p className="text-sm text-slate-600">بيانات مرجعية رسمية للنظام - للقراءة فقط</p>
                </div>
                <Badge className="mr-auto bg-emerald-100 text-emerald-700">
                  <Shield className="h-3 w-3 ml-1" />
                  بيانات مقفلة
                </Badge>
              </div>
              
              {/* Static Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-auto bg-white rounded-xl p-2 shadow-sm border mb-6 flex flex-wrap gap-1">
                  {staticTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex-1 min-w-[140px] rounded-lg text-xs lg:text-sm py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
                      data-testid={`tab-${tab.id}`}
                    >
                      <tab.icon className="h-4 w-4 ml-1.5" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* ======= TAB: المنهج الرسمي ======= */}
                <TabsContent value="curriculum" className="space-y-6">
                  <Card className="bg-white shadow-sm border-emerald-200">
                    <CardHeader className="bg-emerald-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-emerald-800">المنهج الدراسي الرسمي</CardTitle>
                          <CardDescription className="text-emerald-600">بيانات وزارة التعليم السعودية</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {officialCurriculumStats && (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                          {[
                            { label: 'مرحلة', value: officialCurriculumStats.stages, color: 'emerald' },
                            { label: 'مسار', value: officialCurriculumStats.tracks, color: 'blue' },
                            { label: 'صف', value: officialCurriculumStats.grades, color: 'violet' },
                            { label: 'مادة', value: officialCurriculumStats.subjects, color: 'amber' },
                            { label: 'توزيع', value: officialCurriculumStats.grade_subject_mappings, color: 'rose' },
                            { label: 'رتبة معلم', value: officialCurriculumStats.teacher_rank_loads, color: 'cyan' }
                          ].map((stat, idx) => (
                            <div key={idx} className={`text-center p-4 bg-${stat.color}-50 rounded-xl border border-${stat.color}-200`}>
                              <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                              <p className={`text-xs text-${stat.color}-600`}>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600 text-center">
                          هذه البيانات محدثة من وزارة التعليم وتشمل جميع المراحل والمسارات التعليمية المعتمدة
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: المراحل والمسارات ======= */}
                <TabsContent value="stages" className="space-y-6">
                  {/* المراحل الدراسية */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-emerald-600" />
                        المراحل الدراسية ({officialStages.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        {officialStages.map((stage) => (
                          <div key={stage.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <p className="font-bold text-emerald-800">{stage.name_ar}</p>
                            <p className="text-sm text-emerald-600">{stage.name_en}</p>
                            <p className="text-xs text-emerald-500 mt-2">{stage.grades_count} صفوف</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* المسارات التعليمية */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ChevronRight className="h-5 w-5 text-blue-600" />
                        المسارات التعليمية ({officialTracks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-3">
                        {officialTracks.map((track) => (
                          <div key={track.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-800 text-sm">{track.name_ar}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: النصاب التعليمي ======= */}
                <TabsContent value="rank-loads" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-violet-600" />
                        النصاب الرسمي للمعلمين حسب الرتب ({officialRankLoads.length})
                      </CardTitle>
                      <CardDescription>عدد الحصص الأسبوعية المطلوبة لكل رتبة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        {officialRankLoads.map((rank) => (
                          <div key={rank.id} className="p-4 bg-violet-50 rounded-xl border border-violet-200 text-center">
                            <p className="font-bold text-violet-800">{rank.rank_name_ar}</p>
                            <p className="text-3xl font-bold text-violet-600 mt-2">{rank.weekly_periods}</p>
                            <p className="text-xs text-violet-500">حصة/أسبوع</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ======= TAB: توزيع المواد ======= */}
                <TabsContent value="subject-distribution" className="space-y-6">
                  <Card className="bg-white shadow-sm border-rose-100">
                    <CardHeader className="bg-rose-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-rose-800">توزيع المواد الرسمي</CardTitle>
                            <CardDescription className="text-rose-600">الخطة الدراسية المعتمدة من وزارة التعليم</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300">
                          <Lock className="h-3 w-3 ml-1" />
                          للقراءة فقط
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Stages Accordion */}
                      <div className="divide-y divide-slate-200">
                        {officialStages.map((stage) => (
                          <div key={stage.id} className="bg-white">
                            {/* Stage Header */}
                            <button
                              onClick={() => toggleStageExpand(stage.id)}
                              className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
                                expandedStages[stage.id] ? 'bg-slate-50' : ''
                              }`}
                              data-testid={`stage-expand-${stage.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  expandedStages[stage.id] ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                  <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-slate-800">{stage.name_ar}</p>
                                  <p className="text-xs text-slate-500">{stage.grades_count} صفوف</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {loadingCurriculum[stage.id] && (
                                  <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                                )}
                                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${
                                  expandedStages[stage.id] ? 'rotate-90' : ''
                                }`} />
                              </div>
                            </button>
                            
                            {/* Stage Content - Tracks */}
                            {expandedStages[stage.id] && stageCurriculums[stage.id] && (
                              <div className="pr-6 pb-4">
                                {stageCurriculums[stage.id].tracks?.map((track) => (
                                  <div key={track.id} className="mr-4 mt-2 border-r-2 border-blue-200">
                                    {/* Track Header */}
                                    <button
                                      onClick={() => toggleTrackExpand(track.id)}
                                      className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                                      data-testid={`track-expand-${track.id}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                          expandedTracks[track.id] ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                          <Layers className="h-4 w-4" />
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium text-slate-700">{track.name_ar}</p>
                                          <p className="text-xs text-slate-500">{track.grades_count} صف</p>
                                        </div>
                                      </div>
                                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${
                                        expandedTracks[track.id] ? 'rotate-90' : ''
                                      }`} />
                                    </button>
                                    
                                    {/* Track Content - Grades */}
                                    {expandedTracks[track.id] && track.grades?.map((grade) => (
                                      <div key={grade.id} className="mr-8 mt-2 border-r-2 border-violet-200">
                                        {/* Grade Header */}
                                        <button
                                          onClick={() => toggleGradeExpand(grade.id)}
                                          className="w-full flex items-center justify-between p-3 hover:bg-violet-50 rounded-lg transition-colors mr-2"
                                          data-testid={`grade-expand-${grade.id}`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                              expandedGrades[grade.id] ? 'bg-violet-500 text-white' : 'bg-violet-100 text-violet-600'
                                            }`}>
                                              <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium text-slate-700 text-sm">{grade.name_ar}</p>
                                              <p className="text-xs text-slate-500">
                                                {grade.subjects_count} مادة | {grade.total_annual_periods} حصة سنوياً
                                              </p>
                                            </div>
                                          </div>
                                          <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${
                                            expandedGrades[grade.id] ? 'rotate-90' : ''
                                          }`} />
                                        </button>
                                        
                                        {/* Grade Content - Subjects Table */}
                                        {expandedGrades[grade.id] && (
                                          <div className="mr-8 mt-2 mb-4 bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                              <thead className="bg-slate-100">
                                                <tr>
                                                  <th className="text-right p-3 font-medium text-slate-700">#</th>
                                                  <th className="text-right p-3 font-medium text-slate-700">المادة</th>
                                                  <th className="text-center p-3 font-medium text-slate-700">الحصص السنوية</th>
                                                  <th className="text-center p-3 font-medium text-slate-700">الحصص الأسبوعية</th>
                                                  <th className="text-center p-3 font-medium text-slate-700">النوع</th>
                                                  <th className="text-center p-3 font-medium text-slate-700">الحالة</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                {grade.subjects?.map((subj, idx) => (
                                                  <tr key={subj.id || idx} className="hover:bg-slate-50">
                                                    <td className="p-3 text-slate-500">{idx + 1}</td>
                                                    <td className="p-3">
                                                      <p className="font-medium text-slate-800">{subj.subject_name_ar}</p>
                                                      <p className="text-xs text-slate-400">{subj.subject_name_en}</p>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                      <span className="font-bold text-emerald-700">{subj.annual_periods}</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                      <span className="font-medium text-blue-700">
                                                        {typeof subj.weekly_periods === 'number' ? subj.weekly_periods.toFixed(1) : subj.weekly_periods}
                                                      </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                      <Badge 
                                                        variant="outline" 
                                                        className={
                                                          subj.period_type === 'class_period' 
                                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }
                                                      >
                                                        {subj.period_type === 'class_period' ? 'حصة صفية' : 'فترة لاصفية'}
                                                      </Badge>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                                                        <Lock className="h-3 w-3 ml-1" />
                                                        رسمي
                                                      </Badge>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            {/* Grade Summary */}
                                            <div className="bg-slate-50 p-3 flex justify-around text-sm border-t">
                                              <div className="text-center">
                                                <p className="font-bold text-emerald-700">{grade.subjects?.length || 0}</p>
                                                <p className="text-xs text-slate-500">مادة</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="font-bold text-blue-700">{grade.total_annual_periods}</p>
                                                <p className="text-xs text-slate-500">حصة سنوية</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="font-bold text-violet-700">
                                                  {grade.subjects?.filter(s => s.period_type === 'class_period').length || 0}
                                                </p>
                                                <p className="text-xs text-slate-500">حصة صفية</p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Info Banner */}
                      <div className="p-4 bg-amber-50 border-t border-amber-200">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-amber-800">هذه البيانات رسمية ومقفلة</p>
                            <p className="text-sm text-amber-700 mt-1">
                              لا يمكن تعديل أو حذف أو إضافة مواد. يتم استخدام هذه البيانات كأساس لبناء الجدول المدرسي.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          </div>
        </div>
      </div>
      
      {/* ================= Modals ================= */}
      
      {/* Modals removed */}
    </Sidebar>
  );
}

export { SchoolSettingsPagePro };
export default SchoolSettingsPagePro;
