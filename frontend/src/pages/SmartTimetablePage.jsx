/**
 * صفحة الجدول الذكي - عرض شامل للجدول المدرسي
 * Smart Timetable Page - Comprehensive school schedule view
 * 
 * المعادلة الأساسية: فصل + مادة + معلم + وقت مناسب + بدون تعارض + ضمن النصاب
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ScrollArea } from '../components/ui/scroll-area';

// Icons
import {
  Calendar, Clock, Users, BookOpen, GraduationCap, 
  Loader2, Wand2, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Settings, Filter, ChevronLeft, ChevronRight,
  Sun, Moon, Play, Eye, Download, FileText, Sparkles,
  User, Coffee, Send, Globe, List, Printer, FileSpreadsheet,
  Building, AlertCircle, ArrowLeft, BarChart3, Target, Zap,
  School, Layers, Grid3X3
} from 'lucide-react';
import { NotificationBell } from '../components/notifications/NotificationBell';

// Days configuration
const DAYS = [
  { key: 'sunday', ar: 'الأحد', en: 'Sun', color: 'from-blue-500 to-blue-600' },
  { key: 'monday', ar: 'الإثنين', en: 'Mon', color: 'from-purple-500 to-purple-600' },
  { key: 'tuesday', ar: 'الثلاثاء', en: 'Tue', color: 'from-green-500 to-green-600' },
  { key: 'wednesday', ar: 'الأربعاء', en: 'Wed', color: 'from-amber-500 to-amber-600' },
  { key: 'thursday', ar: 'الخميس', en: 'Thu', color: 'from-rose-500 to-rose-600' },
];

// Subject colors
const SUBJECT_COLORS = {
  'لغتي': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'الرياضيات': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'العلوم': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'اللغة الإنجليزية': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  'الدراسات الإسلامية': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'القرآن الكريم': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  'الدراسات الاجتماعية': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  'التربية الفنية': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  'التربية البدنية': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  'المهارات الرقمية': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
};

const getSubjectColor = (subjectName) => {
  if (!subjectName) return SUBJECT_COLORS.default;
  for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
    if (subjectName.includes(key)) return value;
  }
  return SUBJECT_COLORS.default;
};

// Period times (default)
const getDefaultPeriods = (periodsCount = 7) => {
  const periods = [];
  let startHour = 7;
  let startMin = 0;
  
  for (let i = 1; i <= periodsCount; i++) {
    const start = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    startMin += 45;
    if (startMin >= 60) {
      startHour += 1;
      startMin -= 60;
    }
    const end = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    
    periods.push({ number: i, start_time: start, end_time: end });
    
    // Add 5 min break between periods
    startMin += 5;
    if (startMin >= 60) {
      startHour += 1;
      startMin -= 60;
    }
    
    // Add longer break after 3rd period
    if (i === 3) {
      startMin += 15;
      if (startMin >= 60) {
        startHour += 1;
        startMin -= 60;
      }
    }
    
    // Add prayer break after 6th period
    if (i === 6) {
      startMin += 15;
      if (startMin >= 60) {
        startHour += 1;
        startMin -= 60;
      }
    }
  }
  
  return periods;
};

// ============================================
// مكون كارت الحصة المصغر
// ============================================
const SessionCell = ({ session, showTeacher = true, compact = false }) => {
  const colors = getSubjectColor(session?.subject_name);
  
  if (!session) {
    return (
      <div className="h-full min-h-[50px] bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center">
        <span className="text-gray-400 text-xs">-</span>
      </div>
    );
  }
  
  return (
    <div className={`h-full min-h-[50px] p-1.5 rounded ${colors.bg} ${colors.border} border text-center`}>
      <p className={`font-bold text-xs ${colors.text} truncate`}>
        {session.subject_name || 'مادة'}
      </p>
      {showTeacher && (
        <p className="text-[10px] text-gray-600 truncate mt-0.5">
          {session.teacher_name || ''}
        </p>
      )}
    </div>
  );
};

// ============================================
// مكون جدول الفصل
// ============================================
const ClassTimetableGrid = ({ className, sessions, periods, days, showTeacher = true }) => {
  const getSession = (day, period) => {
    return sessions.find(s => 
      s.day_of_week === day && s.period_number === period
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-brand-navy to-brand-turquoise text-white">
            <th className="p-2 text-center border border-white/20 w-16">الحصة</th>
            {days.map(day => (
              <th key={day.key} className="p-2 text-center border border-white/20 min-w-[100px]">
                {day.ar}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period, idx) => (
            <tr key={period.number} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-1 text-center border bg-gray-100 font-medium">
                <div className="text-xs">{period.number}</div>
                <div className="text-[10px] text-gray-500">
                  {period.start_time?.substring(0, 5)}
                </div>
              </td>
              {days.map(day => (
                <td key={`${day.key}-${period.number}`} className="p-1 border">
                  <SessionCell 
                    session={getSession(day.key, period.number)} 
                    showTeacher={showTeacher}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// مكون إحصائيات المعلم
// ============================================
const TeacherLoadCard = ({ teacher, sessions }) => {
  const teacherSessions = sessions.filter(s => s.teacher_id === teacher.teacher_id);
  const weeklyLoad = teacher.weekly_load || 24;
  const currentLoad = teacherSessions.length;
  const loadPercentage = Math.round((currentLoad / weeklyLoad) * 100);
  
  return (
    <div className="p-3 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{teacher.teacher_name}</span>
        <Badge variant={loadPercentage >= 100 ? 'destructive' : loadPercentage >= 80 ? 'warning' : 'success'}>
          {currentLoad}/{weeklyLoad}
        </Badge>
      </div>
      <Progress value={loadPercentage} className="h-2" />
      <p className="text-xs text-gray-500 mt-1">{loadPercentage}% من النصاب</p>
    </div>
  );
};

// ============================================
// المكون الرئيسي
// ============================================
export default function SmartTimetablePage() {
  const { user, api } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const printRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [resources, setResources] = useState([]);
  const [demands, setDemands] = useState([]);
  const [validation, setValidation] = useState(null);
  const [settings, setSettings] = useState(null);
  
  // Dialogs
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'class', 'teacher'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [conflictsDialogOpen, setConflictsDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const schoolId = user?.tenant_id;
  const periods = getDefaultPeriods(settings?.periods_per_day || 7);
  
  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const [timetablesRes, classesRes, teachersRes, settingsRes] = await Promise.all([
        api.get(`/smart-scheduling/timetables/${schoolId}`).catch(() => ({ data: { timetables: [] } })),
        api.get(`/classes?school_id=${schoolId}`).catch(() => ({ data: [] })),
        api.get(`/teachers?school_id=${schoolId}`).catch(() => ({ data: [] })),
        api.get(`/school/settings`).catch(() => ({ data: { settings: {} } })),
      ]);
      
      setTimetables(timetablesRes.data?.timetables || []);
      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
      setSettings(settingsRes.data?.settings || {});
      
      // Auto-select latest published or draft timetable
      const allTimetables = timetablesRes.data?.timetables || [];
      if (allTimetables.length > 0) {
        const published = allTimetables.find(t => t.status === 'published');
        const draft = allTimetables.find(t => t.status === 'draft');
        setSelectedTimetable(published || draft || allTimetables[0]);
      }
      
      // Auto-select first class
      if (classesRes.data?.length > 0) {
        setSelectedClass(classesRes.data[0].id);
      }
      
      // Auto-select first teacher
      if (teachersRes.data?.length > 0) {
        const first = teachersRes.data[0];
        setSelectedTeacher(first.id || first.teacher_id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [schoolId, api]);
  
  // Fetch sessions for selected timetable
  const fetchSessions = useCallback(async () => {
    if (!selectedTimetable?.id) {
      setSessions([]);
      return;
    }
    
    try {
      const [sessionsRes, conflictsRes] = await Promise.all([
        api.get(`/smart-scheduling/timetable/${selectedTimetable.id}/sessions`),
        api.get(`/smart-scheduling/timetable/${selectedTimetable.id}/conflicts`),
      ]);
      
      setSessions(sessionsRes.data?.sessions || []);
      setConflicts(conflictsRes.data?.conflicts || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    }
  }, [selectedTimetable, api]);
  
  // Fetch resources matrix
  const fetchResources = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      const res = await api.get(`/smart-scheduling/resource-matrix/${schoolId}`);
      setResources(res.data?.resources || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  }, [schoolId, api]);
  
  // Generate timetable
  const handleGenerateTimetable = async () => {
    setGenerating(true);
    setGenerationStep('جاري التحقق من جاهزية البيانات...');
    
    try {
      // Step 1: Validate
      const validateRes = await api.get(`/smart-scheduling/validate/${schoolId}`);
      setValidation(validateRes.data);
      
      if (!validateRes.data.can_proceed) {
        const errors = validateRes.data.issues
          .filter(i => i.severity === 'critical')
          .map(i => i.message_ar);
        toast.error('يوجد مشاكل تمنع إنشاء الجدول');
        setGenerating(false);
        setGenerationStep('');
        return;
      }
      
      setGenerationStep('جاري بناء مصفوفة الطلب الأكاديمي...');
      await new Promise(r => setTimeout(r, 500));
      
      setGenerationStep('جاري بناء مصفوفة الموارد المتاحة...');
      await new Promise(r => setTimeout(r, 500));
      
      setGenerationStep('جاري توليد الجدول بالذكاء الاصطناعي...');
      
      // Step 2: Generate
      const response = await api.post(`/smart-scheduling/generate/${schoolId}`, {});
      
      if (response.data.success) {
        toast.success(`تم إنشاء ${response.data.scheduled_sessions} حصة بنجاح!`);
        setGenerateDialogOpen(false);
        
        // Refresh data
        await fetchData();
        
        // Select the new timetable
        setSelectedTimetable({ id: response.data.timetable_id });
      } else {
        throw new Error(response.data.message_ar || 'فشل توليد الجدول');
      }
    } catch (error) {
      console.error('Generate error:', error);
      toast.error(error.response?.data?.message_ar || error.message || 'فشل توليد الجدول');
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };
  
  // Export to CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      toast.error('لا توجد حصص للتصدير');
      return;
    }
    
    const headers = ['اليوم', 'الحصة', 'الفصل', 'المادة', 'المعلم', 'وقت البداية', 'وقت النهاية'];
    const dayNames = { sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' };
    
    const rows = sessions.map(s => [
      dayNames[s.day_of_week] || s.day_of_week,
      s.period_number,
      s.class_name || '',
      s.subject_name || '',
      s.teacher_name || '',
      s.start_time || '',
      s.end_time || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `جدول_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير الجدول بنجاح');
    setExportDialogOpen(false);
  };
  
  // Export to PDF (print)
  const handleExportPDF = () => {
    window.print();
    setExportDialogOpen(false);
  };
  
  // Publish timetable
  const handlePublish = async () => {
    if (!selectedTimetable?.id) return;
    
    try {
      await api.post(`/smart-scheduling/timetable/${selectedTimetable.id}/publish`);
      toast.success('تم نشر الجدول بنجاح');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'فشل نشر الجدول');
    }
  };
  
  // Effects
  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);
  
  useEffect(() => {
    if (selectedTimetable?.id) {
      fetchSessions();
      fetchResources();
    }
  }, [selectedTimetable, fetchSessions, fetchResources]);
  
  // Filter sessions by class
  const getClassSessions = (classId) => {
    return sessions.filter(s => s.class_id === classId);
  };
  
  // Filter sessions by teacher
  const getTeacherSessions = (teacherId) => {
    return sessions.filter(s => s.teacher_id === teacherId);
  };
  
  // Loading state
  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-turquoise flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-navy mb-4" />
            <p className="text-muted-foreground font-medium">جاري تحميل الجدول...</p>
          </div>
        </div>
      </Sidebar>
    );
  }
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background print:bg-white" data-testid="smart-timetable-page">
        
        {/* Header - Hidden in print */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/schedule')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-cairo text-xl font-bold text-foreground">
                  الجدول المدرسي الشامل
                </h1>
                <p className="text-sm text-muted-foreground">عرض جميع الفصول والمعلمين</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Timetable selector */}
              {timetables.length > 0 && (
                <Select 
                  value={selectedTimetable?.id || ''} 
                  onValueChange={(v) => setSelectedTimetable(timetables.find(t => t.id === v))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="اختر الجدول" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          {t.status === 'published' && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                          {t.status === 'draft' && <FileText className="h-3 w-3 text-amber-600" />}
                          <span>{t.name?.substring(0, 25) || 'جدول'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="outline" onClick={fetchData} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6 print:p-2" ref={printRef}>
          
          {/* Action Bar - Hidden in print */}
          <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setGenerateDialogOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2"
                data-testid="generate-timetable-btn"
              >
                <Wand2 className="h-4 w-4" />
                إنشاء جدول جديد
              </Button>
              
              {selectedTimetable && selectedTimetable.status === 'draft' && (
                <Button 
                  onClick={handlePublish}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  data-testid="publish-timetable-btn"
                >
                  <Send className="h-4 w-4" />
                  نشر الجدول
                </Button>
              )}
              
              {conflicts.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setConflictsDialogOpen(true)}
                  className="gap-2 border-amber-300 text-amber-700"
                  data-testid="view-conflicts-btn"
                >
                  <AlertTriangle className="h-4 w-4" />
                  التعارضات ({conflicts.length})
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode */}
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all" className="gap-1">
                    <Layers className="h-4 w-4" />
                    الكل
                  </TabsTrigger>
                  <TabsTrigger value="class" className="gap-1">
                    <GraduationCap className="h-4 w-4" />
                    فصل
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="gap-1">
                    <User className="h-4 w-4" />
                    معلم
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {viewMode === 'class' && (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name || c.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {viewMode === 'teacher' && (
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.full_name || t.full_name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setExportDialogOpen(true)}
                className="gap-2"
                data-testid="export-btn"
              >
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>
          
          {/* Stats Cards - Hidden in print */}
          {selectedTimetable && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{sessions.length}</p>
                      <p className="text-xs text-gray-500">حصة مجدولة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <School className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{classes.length}</p>
                      <p className="text-xs text-gray-500">فصل دراسي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{teachers.length}</p>
                      <p className="text-xs text-gray-500">معلم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${conflicts.length > 0 ? 'border-amber-300' : 'border-green-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${conflicts.length > 0 ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center`}>
                      {conflicts.length > 0 ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Zap className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                        {conflicts.length}
                      </p>
                      <p className="text-xs text-gray-500">تعارضات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* No Timetable Message */}
          {!selectedTimetable && (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">لا يوجد جدول بعد</h3>
                <p className="text-muted-foreground mb-6">
                  قم بإنشاء جدول جديد باستخدام الذكاء الاصطناعي
                </p>
                <Button 
                  onClick={() => setGenerateDialogOpen(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  إنشاء جدول جديد
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* All Classes View */}
          {selectedTimetable && viewMode === 'all' && (
            <div className="space-y-8">
              {/* Print Header */}
              <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold">الجدول المدرسي الشامل</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              
              {classes.map(cls => {
                const classSessions = getClassSessions(cls.id);
                if (classSessions.length === 0) return null;
                
                return (
                  <Card key={cls.id} className="border-2 print:break-inside-avoid print:mb-8">
                    <CardHeader className="pb-2 bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5">
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-brand-navy" />
                        {cls.name || cls.name_ar}
                      </CardTitle>
                      <CardDescription>
                        {classSessions.length} حصة أسبوعية
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <ClassTimetableGrid 
                        className={cls.name || cls.name_ar}
                        sessions={classSessions}
                        periods={periods}
                        days={DAYS}
                        showTeacher={true}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Single Class View */}
          {selectedTimetable && viewMode === 'class' && selectedClass && (
            <Card className="border-2">
              <CardHeader className="pb-2 bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-brand-navy" />
                  جدول {classes.find(c => c.id === selectedClass)?.name || 'الفصل'}
                </CardTitle>
                <CardDescription>
                  {getClassSessions(selectedClass).length} حصة أسبوعية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ClassTimetableGrid 
                  sessions={getClassSessions(selectedClass)}
                  periods={periods}
                  days={DAYS}
                  showTeacher={true}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Single Teacher View */}
          {selectedTimetable && viewMode === 'teacher' && selectedTeacher && (
            <Card className="border-2">
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-600/5 to-violet-600/5">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  جدول {teachers.find(t => (t.id || t.teacher_id) === selectedTeacher)?.full_name || teachers.find(t => (t.id || t.teacher_id) === selectedTeacher)?.full_name_ar || 'المعلم'}
                </CardTitle>
                <CardDescription>
                  {getTeacherSessions(selectedTeacher).length} حصة أسبوعية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ClassTimetableGrid 
                  sessions={getTeacherSessions(selectedTeacher)}
                  periods={periods}
                  days={DAYS}
                  showTeacher={false}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Teacher Load Summary - Hidden in print */}
          {selectedTimetable && viewMode === 'all' && resources.length > 0 && (
            <Card className="border-2 print:hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-navy" />
                  نصاب المعلمين
                </CardTitle>
                <CardDescription>
                  توزيع الحصص على المعلمين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {resources.map(r => (
                    <TeacherLoadCard key={r.teacher_id} teacher={r} sessions={sessions} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
        {/* Generate Dialog */}
        <AlertDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-cairo flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-violet-600" />
                إنشاء جدول بالذكاء الاصطناعي
              </AlertDialogTitle>
              <AlertDialogDescription>
                سيتم تحليل البيانات وإنشاء جدول متوازن يراعي جميع القيود
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {generating ? (
              <div className="p-4 bg-violet-50 rounded-lg border border-violet-200 my-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                  <span className="text-violet-700 font-medium">{generationStep}</span>
                </div>
                <Progress className="mt-3 h-2" value={50} />
              </div>
            ) : (
              <div className="space-y-3 my-4">
                <p className="text-sm font-medium text-muted-foreground">المعادلة الأساسية:</p>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-bold text-brand-navy">
                    فصل + مادة + معلم + وقت مناسب
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    = بدون تعارض + ضمن النصاب
                  </p>
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    'تحليل الفصول والمواد المطلوبة',
                    'تحليل المعلمين والتوافر',
                    'تطبيق القيود الإدارية',
                    'توزيع الحصص بشكل متوازن'
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <AlertDialogFooter>
              <AlertDialogCancel disabled={generating}>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleGenerateTimetable} 
                disabled={generating}
                className="bg-gradient-to-r from-violet-600 to-purple-600"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Sparkles className="h-4 w-4 ml-2" />}
                {generating ? 'جاري المعالجة...' : 'ابدأ الإنشاء'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Conflicts Dialog */}
        <Dialog open={conflictsDialogOpen} onOpenChange={setConflictsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                التعارضات في الجدول
              </DialogTitle>
              <DialogDescription>
                يوجد {conflicts.length} تعارض يحتاج للمراجعة
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {conflicts.map((conflict, idx) => (
                  <div 
                    key={conflict.id || idx}
                    className={`p-3 rounded-lg border ${
                      conflict.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      conflict.severity === 'high' ? 'bg-amber-50 border-amber-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={conflict.severity === 'critical' ? 'destructive' : 'warning'}>
                        {conflict.severity === 'critical' ? 'حرج' : 
                         conflict.severity === 'high' ? 'عالي' : 'متوسط'}
                      </Badge>
                      <span className="text-sm font-medium">
                        {conflict.conflict_type === 'teacher_overlap' ? 'تعارض معلم' :
                         conflict.conflict_type === 'class_overlap' ? 'تعارض فصل' :
                         conflict.conflict_type === 'teacher_overload' ? 'تجاوز نصاب' :
                         conflict.conflict_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {conflict.message_ar || conflict.message_en}
                    </p>
                    {conflict.day_of_week && (
                      <p className="text-xs text-gray-500 mt-1">
                        {DAYS.find(d => d.key === conflict.day_of_week)?.ar} - الحصة {conflict.period_number}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConflictsDialogOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-brand-navy" />
                تصدير الجدول
              </DialogTitle>
              <DialogDescription>
                اختر صيغة التصدير المطلوبة
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 my-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-14"
                onClick={handleExportCSV}
                data-testid="export-csv-btn"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="font-medium">ملف CSV</p>
                  <p className="text-xs text-gray-500">للفتح في Excel</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-14"
                onClick={handleExportPDF}
                data-testid="export-pdf-btn"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Printer className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="font-medium">طباعة / PDF</p>
                  <p className="text-xs text-gray-500">طباعة مباشرة</p>
                </div>
              </Button>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setExportDialogOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Print Styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #root { visibility: visible; }
            [data-testid="smart-timetable-page"] { visibility: visible; }
            [data-testid="smart-timetable-page"] * { visibility: visible; }
            .print\\:hidden { display: none !important; }
            .print\\:block { display: block !important; }
            .print\\:break-inside-avoid { break-inside: avoid; }
            @page { size: landscape; margin: 1cm; }
          }
        `}</style>
      </div>
    </Sidebar>
  );
}
