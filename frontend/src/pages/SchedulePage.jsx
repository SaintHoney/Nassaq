import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Settings,
  UserCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  Play,
  User,
  X,
  Phone,
  Mail,
  Award,
  Briefcase,
  Filter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
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
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

// Days configuration
const DAYS = [
  { key: 'sunday', ar: 'الأحد', en: 'Sun' },
  { key: 'monday', ar: 'الاثنين', en: 'Mon' },
  { key: 'tuesday', ar: 'الثلاثاء', en: 'Tue' },
  { key: 'wednesday', ar: 'الأربعاء', en: 'Wed' },
  { key: 'thursday', ar: 'الخميس', en: 'Thu' },
];

// Subject colors
const SUBJECT_COLORS = {
  'اللغة العربية': 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 text-emerald-700',
  'الرياضيات': 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-700',
  'العلوم': 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 text-purple-700',
  'اللغة الإنجليزية': 'bg-red-100 dark:bg-red-900/30 border-red-300 text-red-700',
  'الدراسات الإسلامية': 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 text-amber-700',
  'default': 'bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-700',
};

const getSubjectColor = (subjectName) => {
  return SUBJECT_COLORS[subjectName] || SUBJECT_COLORS.default;
};

export const SchedulePage = () => {
  const { user, api } = useAuth();
  const { isRTL, isDark } = useTheme();
  
  // State
  const [sessions, setSessions] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Filters
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [viewPeriod, setViewPeriod] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    const dayMap = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday' };
    return dayMap[today] || 'sunday';
  });
  
  // Dialogs
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [conflictsSheetOpen, setConflictsSheetOpen] = useState(false);
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
  const [teacherDetailOpen, setTeacherDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    academic_year: '2026-2027',
    semester: 1,
    effective_from: new Date().toISOString().split('T')[0],
  });

  const schoolId = user?.tenant_id;

  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const [schedulesRes, slotsRes, teachersRes, classesRes] = await Promise.all([
        api.get(`/schedules?school_id=${schoolId}`),
        api.get(`/time-slots?school_id=${schoolId}`),
        api.get(`/teachers?school_id=${schoolId}`),
        api.get(`/classes?school_id=${schoolId}`),
      ]);
      
      setSchedules(schedulesRes.data);
      setTimeSlots(slotsRes.data.filter(s => !s.is_break).sort((a, b) => a.slot_number - b.slot_number));
      setTeachers(teachersRes.data);
      setClasses(classesRes.data);
      
      if (schedulesRes.data.length > 0 && !selectedSchedule) {
        const firstSchedule = schedulesRes.data.find(s => s.status !== 'archived') || schedulesRes.data[0];
        setSelectedSchedule(firstSchedule.id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [schoolId, api, isRTL, selectedSchedule]);

  const fetchSessions = useCallback(async () => {
    if (!selectedSchedule) {
      setSessions([]);
      return;
    }
    
    try {
      const [sessionsRes, conflictsRes] = await Promise.all([
        api.get(`/schedule-sessions?schedule_id=${selectedSchedule}`),
        api.get(`/schedules/${selectedSchedule}/conflicts`),
      ]);
      
      setSessions(sessionsRes.data);
      setConflicts(conflictsRes.data.conflicts || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, [selectedSchedule, api]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (schoolId) fetchData();
  }, [schoolId]);

  useEffect(() => {
    fetchSessions();
  }, [selectedSchedule]);

  const handleCreateSchedule = async () => {
    if (!newSchedule.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم الجدول' : 'Please enter schedule name');
      return;
    }

    try {
      const response = await api.post('/schedules', {
        ...newSchedule,
        school_id: schoolId,
        working_days: DAYS.map(d => d.key),
      });
      toast.success(isRTL ? 'تم إنشاء الجدول بنجاح' : 'Schedule created successfully');
      setCreateScheduleOpen(false);
      setNewSchedule({ name: '', academic_year: '2026-2027', semester: 1, effective_from: new Date().toISOString().split('T')[0] });
      fetchData();
      setSelectedSchedule(response.data.id);
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل إنشاء الجدول' : 'Failed to create schedule'));
    }
  };

  const handleGenerateSchedule = async () => {
    if (!selectedSchedule) return;
    
    setGenerating(true);
    try {
      const response = await api.post(`/schedules/${selectedSchedule}/generate?respect_workload=true`);
      
      if (response.data.success) {
        toast.success(isRTL ? `تم إنشاء ${response.data.sessions_created} حصة بنجاح` : `Successfully created ${response.data.sessions_created} sessions`);
      } else {
        toast.warning(isRTL ? `تم إنشاء ${response.data.sessions_created} حصة مع ${response.data.unplaced_sessions} حصة غير مجدولة` : `Created ${response.data.sessions_created} sessions with ${response.data.unplaced_sessions} unplaced`);
      }
      
      setGenerateDialogOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل توليد الجدول' : 'Failed to generate schedule'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/schedule-sessions/${sessionId}`);
      toast.success(isRTL ? 'تم حذف الحصة' : 'Session deleted');
      fetchSessions();
      setSessionDetailOpen(false);
    } catch (error) {
      toast.error(isRTL ? 'فشل حذف الحصة' : 'Failed to delete session');
    }
  };

  const handlePublishSchedule = async () => {
    if (!selectedSchedule) return;
    
    try {
      await api.put(`/schedules/${selectedSchedule}/publish`);
      toast.success(isRTL ? 'تم نشر الجدول' : 'Schedule published');
      fetchData();
    } catch (error) {
      toast.error(isRTL ? 'فشل نشر الجدول' : 'Failed to publish schedule');
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filterTeacher !== 'all' && session.teacher_id !== filterTeacher) return false;
    if (filterClass !== 'all' && session.class_id !== filterClass) return false;
    return true;
  });

  // Get displayed days
  const displayedDays = viewPeriod === 'daily' ? DAYS.filter(day => day.key === selectedDay) : DAYS;

  // Get session for specific day and time slot
  const getSessionsForCell = (teacherId, dayKey, slotId) => {
    return filteredSessions.filter(s => 
      s.teacher_id === teacherId && 
      s.day_of_week === dayKey && 
      s.time_slot_id === slotId
    );
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM');
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get teacher workload
  const getTeacherWorkload = (teacherId) => {
    return filteredSessions.filter(s => s.teacher_id === teacherId).length;
  };

  const currentSchedule = schedules.find(s => s.id === selectedSchedule);

  // Display teachers based on filter
  const displayTeachers = filterTeacher === 'all' ? teachers : teachers.filter(t => t.id === filterTeacher);

  return (
    <Sidebar>
      <div className="min-h-screen bg-background overflow-hidden max-w-full" data-testid="schedule-page">
        {/* Sticky Header with Controls */}
        <div className="sticky top-0 z-40 bg-background border-b border-border/50 shadow-sm">
          {/* Page Title */}
          <header className="px-6 py-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-cairo text-2xl font-bold text-foreground">
                  {isRTL ? 'الجدول المدرسي' : 'School Schedule'}
                </h1>
                <p className="text-sm text-muted-foreground font-tajawal">
                  {isRTL ? 'إدارة وعرض الجداول الدراسية' : 'Manage and view class schedules'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Link to="/admin/time-slots">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Clock className="h-4 w-4 me-2" />
                    {isRTL ? 'الفترات' : 'Slots'}
                  </Button>
                </Link>
                <Link to="/admin/teacher-assignments">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <UserCheck className="h-4 w-4 me-2" />
                    {isRTL ? 'الإسنادات' : 'Assign'}
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Filters Bar - Sticky */}
          <div className="px-6 py-3 bg-muted/30">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              {/* Left Side Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Schedule Select */}
                <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                  <SelectTrigger className="w-[180px] h-9 rounded-xl text-sm" data-testid="schedule-select">
                    <Calendar className="h-4 w-4 me-2" />
                    <SelectValue placeholder={isRTL ? 'الجدول' : 'Schedule'} />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map(schedule => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        <div className="flex items-center gap-2">
                          {schedule.name}
                          <Badge variant="secondary" className="text-xs">
                            {schedule.status === 'published' ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter by Class */}
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="w-[160px] h-9 rounded-xl text-sm" data-testid="class-filter">
                    <GraduationCap className="h-4 w-4 me-2" />
                    <SelectValue placeholder={isRTL ? 'الفصل' : 'Class'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'جميع الفصول' : 'All Classes'}</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter by Teacher */}
                <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                  <SelectTrigger className="w-[160px] h-9 rounded-xl text-sm" data-testid="teacher-filter">
                    <User className="h-4 w-4 me-2" />
                    <SelectValue placeholder={isRTL ? 'المعلم' : 'Teacher'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'جميع المعلمين' : 'All Teachers'}</SelectItem>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Period Toggle */}
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <Button
                    variant={viewPeriod === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-none h-9 ${viewPeriod === 'weekly' ? 'bg-brand-turquoise' : ''}`}
                    onClick={() => setViewPeriod('weekly')}
                    data-testid="view-weekly-btn"
                  >
                    {isRTL ? 'أسبوعي' : 'Weekly'}
                  </Button>
                  <Button
                    variant={viewPeriod === 'daily' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-none h-9 ${viewPeriod === 'daily' ? 'bg-brand-turquoise' : ''}`}
                    onClick={() => setViewPeriod('daily')}
                    data-testid="view-daily-btn"
                  >
                    {isRTL ? 'يومي' : 'Daily'}
                  </Button>
                </div>

                {/* Day Selector */}
                {viewPeriod === 'daily' && (
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-[120px] h-9 rounded-xl text-sm" data-testid="day-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(day => (
                        <SelectItem key={day.key} value={day.key}>
                          {isRTL ? day.ar : day.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Right Side Actions */}
              <div className="flex gap-2 items-center">
                {/* Conflicts Button */}
                {conflicts.length > 0 && (
                  <Sheet open={conflictsSheetOpen} onOpenChange={setConflictsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="destructive" size="sm" className="rounded-xl h-9" data-testid="conflicts-btn">
                        <AlertTriangle className="h-4 w-4 me-1" />
                        {conflicts.length}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px]">
                      <SheetHeader>
                        <SheetTitle className="font-cairo flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          {isRTL ? 'التعارضات' : 'Conflicts'}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {conflicts.map((conflict, index) => (
                          <div key={index} className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">{conflict.message_ar || conflict.message}</p>
                                <Badge variant="secondary" className="text-xs mt-2">
                                  {DAYS.find(d => d.key === conflict.day)?.[isRTL ? 'ar' : 'en']}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}

                {/* New Schedule */}
                <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl h-9" data-testid="create-schedule-btn">
                      <Plus className="h-4 w-4 me-1" />
                      {isRTL ? 'جديد' : 'New'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-cairo">{isRTL ? 'إنشاء جدول جديد' : 'Create New Schedule'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{isRTL ? 'اسم الجدول' : 'Schedule Name'}</label>
                        <input
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                          value={newSchedule.name}
                          onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                          placeholder={isRTL ? 'الجدول الدراسي - الفصل الأول' : 'Schedule - Semester 1'}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateScheduleOpen(false)} className="rounded-xl">
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button onClick={handleCreateSchedule} className="bg-brand-navy rounded-xl">
                        {isRTL ? 'إنشاء' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Generate Schedule */}
                <AlertDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl h-9"
                    onClick={() => setGenerateDialogOpen(true)}
                    data-testid="generate-schedule-btn"
                  >
                    <Sparkles className="h-4 w-4 me-1" />
                    {isRTL ? 'توليد' : 'Generate'}
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-cairo">{isRTL ? 'توليد الجدول تلقائياً' : 'Auto Generate Schedule'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isRTL ? 'سيقوم النظام بتوليد جدول تلقائي بناءً على إسنادات المعلمين' : 'The system will automatically generate a schedule'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleGenerateSchedule} disabled={generating} className="bg-brand-turquoise rounded-xl">
                        {generating ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Play className="h-4 w-4 me-2" />}
                        {isRTL ? 'ابدأ' : 'Start'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Publish */}
                {currentSchedule && currentSchedule.status !== 'published' && (
                  <Button 
                    size="sm"
                    className="bg-brand-navy rounded-xl h-9"
                    onClick={handlePublishSchedule}
                    disabled={conflicts.length > 0}
                    data-testid="publish-schedule-btn"
                  >
                    <CheckCircle2 className="h-4 w-4 me-1" />
                    {isRTL ? 'نشر' : 'Publish'}
                  </Button>
                )}
              </div>
            </div>

            {/* Status Bar */}
            {currentSchedule && (
              <div className="flex items-center gap-4 mt-3 text-sm">
                <Badge className={`${currentSchedule.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {currentSchedule.status === 'published' ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                </Badge>
                <span className="text-muted-foreground">{filteredSessions.length} {isRTL ? 'حصة' : 'sessions'}</span>
                <span className="text-muted-foreground">{displayTeachers.length} {isRTL ? 'معلم' : 'teachers'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Grid Content */}
        <div className="p-4 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          ) : timeSlots.length === 0 ? (
            <Card className="card-nassaq">
              <CardContent className="text-center py-16">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-4">{isRTL ? 'لم يتم تحديد الفترات الزمنية' : 'Time slots not defined'}</p>
                <Link to="/admin/time-slots">
                  <Button className="rounded-xl">
                    <Settings className="h-4 w-4 me-2" />
                    {isRTL ? 'إعداد الفترات' : 'Setup Slots'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-nassaq overflow-hidden w-full" data-testid="schedule-grid">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full border-collapse">
                  {/* Header */}
                  <thead className="sticky top-0 z-10 bg-background">
                    {/* Days Row */}
                    <tr className="border-b">
                      <th className="sticky start-0 z-20 bg-muted/50 p-2 text-start font-medium border-e w-36">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-brand-navy" />
                          {isRTL ? 'المعلم' : 'Teacher'}
                        </div>
                      </th>
                      {displayedDays.map(day => (
                        <th 
                          key={day.key} 
                          colSpan={timeSlots.length}
                          className="p-3 text-center font-medium bg-brand-navy/5 dark:bg-brand-navy/20 border-b"
                        >
                          <span className="font-bold text-brand-navy dark:text-brand-turquoise">
                            {isRTL ? day.ar : day.en}
                          </span>
                        </th>
                      ))}
                    </tr>
                    {/* Periods Row */}
                    <tr className="border-b bg-muted/30">
                      <th className="sticky start-0 z-20 bg-muted/30 p-2 border-e">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {isRTL ? 'الحصص' : 'Periods'}
                        </div>
                      </th>
                      {displayedDays.map(day => (
                        timeSlots.map((slot, idx) => (
                          <th key={`${day.key}-${slot.id}`} className="p-1 text-center border-e border-border/20 min-w-[50px] max-w-[60px]">
                            <div className="text-[10px] font-medium">{idx + 1}</div>
                            <div className="text-[9px] text-muted-foreground">{slot.start_time?.slice(0,5)}</div>
                          </th>
                        ))
                      ))}
                    </tr>
                  </thead>
                  
                  {/* Body */}
                  <tbody>
                    {displayTeachers.map((teacher, teacherIdx) => (
                      <tr key={teacher.id} className={`border-b hover:bg-muted/10 ${teacherIdx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                        {/* Teacher Cell - Sticky & Clickable */}
                        <td className="sticky start-0 z-10 bg-background p-1 border-e w-36">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-lg p-1 transition-colors"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setTeacherDetailOpen(true);
                            }}
                            data-testid={`teacher-cell-${teacher.id}`}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={teacher.avatar_url} />
                              <AvatarFallback className="bg-brand-navy text-white text-xs">
                                {teacher.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate text-brand-navy dark:text-brand-turquoise">
                                {teacher.full_name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                  {getTeacherWorkload(teacher.id)} {isRTL ? 'ح' : 'p'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Session Cells */}
                        {displayedDays.map(day => (
                          timeSlots.map(slot => {
                            const cellSessions = getSessionsForCell(teacher.id, day.key, slot.id);
                            
                            return (
                              <td 
                                key={`${teacher.id}-${day.key}-${slot.id}`} 
                                className="p-0.5 border-e border-border/20 min-w-[50px] max-w-[60px] align-top"
                              >
                                {cellSessions.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {cellSessions.map(session => (
                                      <div
                                        key={session.id}
                                        onClick={() => {
                                          setSelectedSession(session);
                                          setSessionDetailOpen(true);
                                        }}
                                        className={`p-1 rounded border cursor-pointer transition-all hover:shadow-sm text-[9px] ${getSubjectColor(session.subject_name)}`}
                                        data-testid={`session-${session.id}`}
                                      >
                                        <p className="font-medium truncate leading-tight">{session.subject_name?.split(' ')[0]}</p>
                                        <p className="opacity-70 truncate leading-tight">{session.class_name}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="h-10 border border-dashed border-muted-foreground/20 rounded" />
                                )}
                              </td>
                            );
                          })
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Teacher Detail Dialog */}
        <Dialog open={teacherDetailOpen} onOpenChange={setTeacherDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedTeacher?.avatar_url} />
                  <AvatarFallback className="bg-brand-navy text-white">
                    {selectedTeacher?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg">{selectedTeacher?.full_name}</p>
                  <p className="text-sm text-muted-foreground font-normal">{selectedTeacher?.specialization || selectedTeacher?.subject}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {isRTL ? 'النصاب' : 'Workload'}
                    </p>
                    <p className="font-bold text-lg text-brand-navy">
                      {getTeacherWorkload(selectedTeacher.id)} / 24
                    </p>
                  </div>
                  <div className="space-y-1 p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {isRTL ? 'الرتبة' : 'Rank'}
                    </p>
                    <p className="font-medium">{selectedTeacher.rank || (isRTL ? 'معلم' : 'Teacher')}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{isRTL ? 'المادة:' : 'Subject:'}</span>
                    <span className="font-medium">{selectedTeacher.specialization || selectedTeacher.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{isRTL ? 'المرحلة:' : 'Level:'}</span>
                    <span className="font-medium">{selectedTeacher.education_level || (isRTL ? 'ابتدائي' : 'Primary')}</span>
                  </div>
                  {selectedTeacher.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{isRTL ? 'الهاتف:' : 'Phone:'}</span>
                      <span className="font-medium" dir="ltr">{selectedTeacher.phone}</span>
                    </div>
                  )}
                  {selectedTeacher.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{isRTL ? 'البريد:' : 'Email:'}</span>
                      <span className="font-medium text-xs" dir="ltr">{selectedTeacher.email}</span>
                    </div>
                  )}
                </div>

                {/* Teacher's Sessions Summary */}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">{isRTL ? 'توزيع الحصص' : 'Sessions Distribution'}</p>
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map(day => {
                      const daySessions = filteredSessions.filter(s => s.teacher_id === selectedTeacher.id && s.day_of_week === day.key);
                      return (
                        <Badge key={day.key} variant="outline" className="text-xs">
                          {isRTL ? day.ar : day.en}: {daySessions.length}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setTeacherDetailOpen(false)} className="rounded-xl">
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session Detail Dialog */}
        <Dialog open={sessionDetailOpen} onOpenChange={setSessionDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-cairo">{isRTL ? 'تفاصيل الحصة' : 'Session Details'}</DialogTitle>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'المادة' : 'Subject'}</p>
                    <p className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-brand-navy" />
                      {selectedSession.subject_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'المعلم' : 'Teacher'}</p>
                    <p className="font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-brand-turquoise" />
                      {selectedSession.teacher_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'الفصل' : 'Class'}</p>
                    <p className="font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-brand-purple" />
                      {selectedSession.class_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'اليوم' : 'Day'}</p>
                    <Badge variant="secondary" className="rounded-lg">
                      {DAYS.find(d => d.key === selectedSession.day_of_week)?.[isRTL ? 'ar' : 'en']}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="destructive" onClick={() => handleDeleteSession(selectedSession?.id)} className="rounded-xl" data-testid="delete-session-btn">
                <Trash2 className="h-4 w-4 me-2" />
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
