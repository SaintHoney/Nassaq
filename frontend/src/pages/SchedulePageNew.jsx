/**
 * صفحة الجدول المدرسي - التصميم الجديد
 * عرض الجدول الأسبوعي بشكل مرئي واضح وبصري
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

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

// Icons
import {
  Calendar, Clock, Users, BookOpen, GraduationCap, 
  Loader2, Wand2, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Settings, Filter, ChevronLeft, ChevronRight,
  Sun, Moon, Play, Eye, Download, FileText, Sparkles,
  User, Coffee
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
  'لغتي': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', gradient: 'from-emerald-400 to-emerald-600' },
  'لغتي / لغة عربية': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', gradient: 'from-emerald-400 to-emerald-600' },
  'الرياضيات': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', gradient: 'from-blue-400 to-blue-600' },
  'العلوم': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', gradient: 'from-purple-400 to-purple-600' },
  'اللغة الإنجليزية': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', gradient: 'from-red-400 to-red-600' },
  'الدراسات الإسلامية': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', gradient: 'from-amber-400 to-amber-600' },
  'القرآن الكريم': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', gradient: 'from-teal-400 to-teal-600' },
  'الدراسات الاجتماعية': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', gradient: 'from-orange-400 to-orange-600' },
  'التربية الفنية': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', gradient: 'from-pink-400 to-pink-600' },
  'التربية البدنية': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', gradient: 'from-cyan-400 to-cyan-600' },
  'المهارات الرقمية': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', gradient: 'from-indigo-400 to-indigo-600' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', gradient: 'from-gray-400 to-gray-600' },
};

const getSubjectColor = (subjectName) => {
  if (!subjectName) return SUBJECT_COLORS.default;
  for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
    if (subjectName.includes(key)) return value;
  }
  return SUBJECT_COLORS.default;
};

// ============================================
// مكون كارت الحصة
// ============================================
const SessionCard = ({ session, onClick }) => {
  const colors = getSubjectColor(session.subject_name);
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-xl ${colors.bg} ${colors.border} border-2 cursor-pointer
        hover:shadow-lg hover:scale-[1.02] transition-all duration-200 h-full min-h-[80px]`}
      data-testid={`session-${session.id}`}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <p className={`font-bold text-sm ${colors.text} leading-tight`}>
            {session.subject_name?.split('/')[0]?.trim() || 'مادة'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {session.teacher_name || 'معلم'}
          </p>
        </div>
        <div className="mt-2">
          <Badge variant="secondary" className="text-[10px] font-normal">
            {session.class_name?.replace('الصف ', '')?.substring(0, 15) || 'فصل'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// ============================================
// مكون الخلية الفارغة
// ============================================
const EmptyCell = () => (
  <div className="p-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 h-full min-h-[80px] flex items-center justify-center">
    <span className="text-gray-300 text-xs">فارغة</span>
  </div>
);

// ============================================
// مكون فترة الاستراحة/الصلاة
// ============================================
const BreakSlot = ({ type, name }) => (
  <div className={`p-3 rounded-xl ${type === 'break' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} border-2 h-full min-h-[80px] flex items-center justify-center`}>
    <div className="text-center">
      {type === 'break' ? (
        <Coffee className={`h-5 w-5 mx-auto mb-1 text-amber-500`} />
      ) : (
        <Moon className={`h-5 w-5 mx-auto mb-1 text-emerald-600`} />
      )}
      <p className={`text-xs font-medium ${type === 'break' ? 'text-amber-700' : 'text-emerald-700'}`}>
        {name || (type === 'break' ? 'استراحة' : 'صلاة')}
      </p>
    </div>
  </div>
);

// ============================================
// الصفحة الرئيسية
// ============================================
export default function SchedulePageNew() {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // States
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [viewMode, setViewMode] = useState('class'); // 'class' or 'teacher'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generationResultOpen, setGenerationResultOpen] = useState(false);
  const [generationStats, setGenerationStats] = useState(null);
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [fullScheduleOpen, setFullScheduleOpen] = useState(false);
  const [generationErrors, setGenerationErrors] = useState([]);
  
  const schoolId = user?.tenant_id;

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const [schedulesRes, slotsRes, teachersRes, classesRes] = await Promise.all([
        api.get(`/schedules?school_id=${schoolId}`).catch(() => ({ data: [] })),
        api.get(`/time-slots?school_id=${schoolId}`).catch(() => ({ data: [] })),
        api.get(`/teachers?school_id=${schoolId}`).catch(() => ({ data: [] })),
        api.get(`/classes?school_id=${schoolId}`).catch(() => ({ data: [] })),
      ]);
      
      setSchedules(schedulesRes.data || []);
      setTimeSlots((slotsRes.data || []).sort((a, b) => (a.slot_number || 0) - (b.slot_number || 0)));
      setTeachers(teachersRes.data || []);
      setClasses(classesRes.data || []);
      
      // Auto-select first schedule
      if (schedulesRes.data?.length > 0 && !selectedSchedule) {
        const first = schedulesRes.data.find(s => s.status !== 'archived') || schedulesRes.data[0];
        setSelectedSchedule(first.id);
      }
      
      // Auto-select first class
      if (classesRes.data?.length > 0 && !selectedClass) {
        setSelectedClass(classesRes.data[0].id);
      }
      
      // Auto-select first teacher
      if (teachersRes.data?.length > 0 && !selectedTeacher) {
        setSelectedTeacher(teachersRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [schoolId, api, selectedSchedule, selectedClass, selectedTeacher]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!selectedSchedule) {
      setSessions([]);
      return;
    }
    
    try {
      const res = await api.get(`/schedule-sessions?schedule_id=${selectedSchedule}`);
      setSessions(res.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    }
  }, [selectedSchedule, api]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  useEffect(() => {
    if (selectedSchedule) fetchSessions();
  }, [selectedSchedule, fetchSessions]);

  // Generate schedule
  const handleGenerateSchedule = async () => {
    setGenerating(true);
    try {
      let scheduleId = selectedSchedule;
      
      // Create schedule if none exists
      if (!scheduleId) {
        const createRes = await api.post('/schedules', {
          name: 'الجدول المدرسي - تلقائي',
          academic_year: '2026-2027',
          semester: 1,
          effective_from: new Date().toISOString().split('T')[0],
          school_id: schoolId,
          working_days: DAYS.map(d => d.key),
        });
        scheduleId = createRes.data.id;
        setSelectedSchedule(scheduleId);
      }
      
      const response = await api.post(`/schedules/${scheduleId}/generate?respect_workload=true&balance_daily=true&avoid_consecutive=true`);
      
      setGenerationStats(response.data);
      setGenerateDialogOpen(false);
      setGenerationResultOpen(true);
      
      if (response.data.success) {
        toast.success(`تم إنشاء ${response.data.sessions_created} حصة بنجاح`);
      } else {
        toast.warning(`تم إنشاء ${response.data.sessions_created} حصة مع ${response.data.unplaced_sessions || 0} حصة غير مجدولة`);
      }
      
      fetchData();
      fetchSessions();
    } catch (error) {
      console.error('Generate error:', error);
      toast.error(error.response?.data?.detail || 'فشل توليد الجدول');
    } finally {
      setGenerating(false);
    }
  };

  // Get sessions for a specific cell
  const getSessionForCell = (dayKey, slotId, filterType, filterId) => {
    return sessions.find(s => {
      const dayMatch = s.day_of_week === dayKey || s.day === dayKey;
      const slotMatch = s.time_slot_id === slotId;
      const filterMatch = filterType === 'class' 
        ? s.class_id === filterId 
        : s.teacher_id === filterId;
      return dayMatch && slotMatch && filterMatch;
    });
  };

  // Get current filter
  const currentFilter = viewMode === 'class' ? selectedClass : selectedTeacher;
  const currentFilterName = viewMode === 'class'
    ? classes.find(c => c.id === selectedClass)?.name || 'اختر فصل'
    : teachers.find(t => t.id === selectedTeacher)?.full_name || 'اختر معلم';

  const currentSchedule = schedules.find(s => s.id === selectedSchedule);
  const periodSlots = timeSlots.filter(s => !s.is_break);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background" data-testid="schedule-page-new">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-turquoise flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="font-cairo text-2xl font-bold text-foreground">
                  مرحباً، {user?.full_name || 'المستخدم'}
                </h1>
                <p className="text-base text-muted-foreground">الجدول المدرسي</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" onClick={() => { fetchData(); fetchSessions(); }} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6 max-w-full">
          
          {/* Controls Bar */}
          <Card className="border-2 border-brand-navy/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: View Mode & Filters */}
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                    <TabsList className="grid grid-cols-2 w-[200px]">
                      <TabsTrigger value="class" className="text-xs">
                        <GraduationCap className="h-4 w-4 ml-1" />
                        بالفصل
                      </TabsTrigger>
                      <TabsTrigger value="teacher" className="text-xs">
                        <User className="h-4 w-4 ml-1" />
                        بالمعلم
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {/* Filter Selector */}
                  {viewMode === 'class' ? (
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[220px]" data-testid="class-selector">
                        <SelectValue placeholder="اختر الفصل" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name || c.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger className="w-[220px]" data-testid="teacher-selector">
                        <SelectValue placeholder="اختر المعلم" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.full_name || t.full_name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  {/* Schedule Status */}
                  {currentSchedule && (
                    <Badge className={`${currentSchedule.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {currentSchedule.status === 'published' ? 'منشور' : 'مسودة'}
                    </Badge>
                  )}
                  
                  <Badge variant="outline">
                    {sessions.length} حصة
                  </Badge>
                  
                  {/* Generate Button */}
                  <Button 
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                    onClick={() => setGenerateDialogOpen(true)}
                    data-testid="generate-schedule-btn"
                  >
                    <Wand2 className="h-4 w-4 ml-2" />
                    معالجة الجدول بالذكاء الاصطناعي
                  </Button>
                  
                  {/* Settings Link */}
                  <Link to="/principal/settings">
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Grid */}
          {timeSlots.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardContent className="text-center py-16">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-bold mb-2">لم يتم تحديد الفترات الزمنية</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  يجب إعداد الفترات الزمنية (الحصص) أولاً من إعدادات المدرسة قبل إنشاء الجدول
                </p>
                <Link to="/principal/settings">
                  <Button className="bg-brand-turquoise hover:bg-brand-turquoise/90">
                    <Settings className="h-4 w-4 ml-2" />
                    الذهاب لإعدادات المدرسة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : !currentFilter ? (
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardContent className="text-center py-16">
                <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-bold mb-2">اختر {viewMode === 'class' ? 'الفصل' : 'المعلم'}</h3>
                <p className="text-muted-foreground">
                  اختر {viewMode === 'class' ? 'فصلاً' : 'معلماً'} من القائمة أعلاه لعرض الجدول
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-brand-navy/20 overflow-hidden" data-testid="schedule-grid">
              <CardHeader className="bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {viewMode === 'class' ? (
                      <GraduationCap className="h-6 w-6 text-brand-navy" />
                    ) : (
                      <User className="h-6 w-6 text-brand-navy" />
                    )}
                    <div>
                      <CardTitle className="text-lg">جدول {currentFilterName}</CardTitle>
                      <CardDescription>
                        {viewMode === 'class' ? 'الجدول الأسبوعي للفصل' : 'الجدول الأسبوعي للمعلم'}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[900px]">
                    {/* Header Row - Days */}
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="p-3 text-center font-medium border-b border-e w-[100px]">
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>الحصة</span>
                          </div>
                        </th>
                        {DAYS.map(day => (
                          <th key={day.key} className="p-3 text-center font-medium border-b border-e">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${day.color} text-white text-sm`}>
                              {day.ar}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    
                    {/* Body Rows - Time Slots */}
                    <tbody>
                      {timeSlots.map((slot, idx) => {
                        const isBreak = slot.is_break || slot.type === 'break' || slot.type === 'prayer';
                        
                        return (
                          <tr key={slot.id} className={`${idx % 2 === 0 ? '' : 'bg-muted/5'} hover:bg-muted/10 transition-colors`}>
                            {/* Time Slot Label */}
                            <td className="p-2 border-e bg-muted/20">
                              <div className="text-center">
                                <p className="font-bold text-sm">
                                  {isBreak ? (slot.name_ar || slot.name || 'استراحة') : `الحصة ${slot.slot_number || idx + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                </p>
                              </div>
                            </td>
                            
                            {/* Session Cells for Each Day */}
                            {DAYS.map(day => {
                              if (isBreak) {
                                return (
                                  <td key={`${day.key}-${slot.id}`} className="p-2 border-e">
                                    <BreakSlot type={slot.type || 'break'} name={slot.name_ar || slot.name} />
                                  </td>
                                );
                              }
                              
                              const session = getSessionForCell(day.key, slot.id, viewMode, currentFilter);
                              
                              return (
                                <td key={`${day.key}-${slot.id}`} className="p-2 border-e">
                                  {session ? (
                                    <SessionCard 
                                      session={session} 
                                      onClick={() => {
                                        setSelectedSession(session);
                                        setSessionDetailOpen(true);
                                      }}
                                    />
                                  ) : (
                                    <EmptyCell />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subject Legend */}
          <Card className="border-2 border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                دليل ألوان المواد
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {Object.entries(SUBJECT_COLORS).filter(([key]) => key !== 'default').map(([name, colors]) => (
                  <Badge key={name} className={`${colors.bg} ${colors.text} ${colors.border} border`}>
                    {name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Generate Dialog */}
        <AlertDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-cairo flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-violet-600" />
                معالجة الجدول بالذكاء الاصطناعي
              </AlertDialogTitle>
              <AlertDialogDescription>
                سيقوم الذكاء الاصطناعي بتحليل إسنادات المعلمين والفصول وإنشاء جدول متوازن يراعي جميع القيود والأولويات.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleGenerateSchedule} 
                disabled={generating}
                className="bg-gradient-to-r from-violet-600 to-purple-600"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Wand2 className="h-4 w-4 ml-2" />}
                ابدأ المعالجة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Generation Result Dialog */}
        <Dialog open={generationResultOpen} onOpenChange={setGenerationResultOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-2">
                {generationStats?.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                )}
                نتيجة التوليد
              </DialogTitle>
            </DialogHeader>
            
            {generationStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-3xl font-bold text-green-700">{generationStats.sessions_created || 0}</p>
                    <p className="text-sm text-green-600">حصة تم إنشاؤها</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-3xl font-bold text-amber-700">{generationStats.unplaced_sessions || 0}</p>
                    <p className="text-sm text-amber-600">حصة غير مجدولة</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">نسبة النجاح</span>
                    <span className="text-sm font-bold">{generationStats.success_rate || 0}%</span>
                  </div>
                  <Progress value={parseFloat(generationStats.success_rate) || 0} className="h-2" />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setGenerationResultOpen(false)}>
                حسناً
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session Detail Dialog */}
        <Dialog open={sessionDetailOpen} onOpenChange={setSessionDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cairo">تفاصيل الحصة</DialogTitle>
            </DialogHeader>
            
            {selectedSession && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${getSubjectColor(selectedSession.subject_name).bg} ${getSubjectColor(selectedSession.subject_name).border} border-2`}>
                  <p className={`font-bold text-lg ${getSubjectColor(selectedSession.subject_name).text}`}>
                    {selectedSession.subject_name}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">المعلم</p>
                      <p className="font-medium">{selectedSession.teacher_name || 'غير محدد'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">الفصل</p>
                      <p className="font-medium">{selectedSession.class_name || 'غير محدد'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">الوقت</p>
                      <p className="font-medium">
                        {DAYS.find(d => d.key === selectedSession.day_of_week)?.ar} - 
                        {selectedSession.start_time?.substring(0, 5)} إلى {selectedSession.end_time?.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSessionDetailOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}

export { SchedulePageNew };
