import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Trash2,
  Sun,
  Moon,
  Globe,
  Loader2,
  Clock,
  Settings,
  UserCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  Eye,
  BookOpen,
  GraduationCap,
  Play,
  RotateCcw,
  GripVertical,
  Move,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
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
// Drag and Drop imports
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Days configuration
const DAYS = [
  { key: 'sunday', ar: 'الأحد', en: 'Sun' },
  { key: 'monday', ar: 'الاثنين', en: 'Mon' },
  { key: 'tuesday', ar: 'الثلاثاء', en: 'Tue' },
  { key: 'wednesday', ar: 'الأربعاء', en: 'Wed' },
  { key: 'thursday', ar: 'الخميس', en: 'Thu' },
];

// Subject colors for visual distinction
const SUBJECT_COLORS = [
  'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200',
  'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200',
  'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200',
  'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200',
  'bg-pink-100 dark:bg-pink-900/40 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200',
  'bg-cyan-100 dark:bg-cyan-900/40 border-cyan-300 dark:border-cyan-700 text-cyan-800 dark:text-cyan-200',
  'bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200',
  'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200',
];

// ============== DRAGGABLE SESSION COMPONENT ==============
const DraggableSession = ({ session, hasConflict, cellConflicts, subjectColor, isRTL, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session },
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-2 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
              isDragging ? 'opacity-50 shadow-lg scale-105' : ''
            } ${
              hasConflict 
                ? 'border-red-400 dark:border-red-600 bg-red-100 dark:bg-red-900/30' 
                : subjectColor
            }`}
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                onClick();
              }
            }}
            data-testid={`session-${session.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1">
                <GripVertical className="h-3 w-3 opacity-50 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{session.subject_name}</p>
                  <p className="text-xs opacity-75 truncate">{session.teacher_name}</p>
                  <p className="text-xs opacity-60 truncate mt-1">{session.class_name}</p>
                </div>
              </div>
              {hasConflict && (
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{session.subject_name}</p>
            <p className="text-xs">{isRTL ? 'المعلم:' : 'Teacher:'} {session.teacher_name}</p>
            <p className="text-xs">{isRTL ? 'الفصل:' : 'Class:'} {session.class_name}</p>
            <p className="text-xs text-brand-turquoise">{isRTL ? '↔️ اسحب لنقل الحصة' : '↔️ Drag to move session'}</p>
            {hasConflict && (
              <p className="text-xs text-red-500 font-medium">
                {cellConflicts[0]?.message_ar || cellConflicts[0]?.message}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============== DROPPABLE CELL COMPONENT ==============
const DroppableCell = ({ id, day, slot, hasConflict, isDragging, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <td
      ref={setNodeRef}
      className={`p-2 border-b min-h-[80px] align-top transition-colors ${
        hasConflict ? 'bg-red-50 dark:bg-red-900/10' : ''
      } ${
        isOver ? 'bg-brand-turquoise/20 ring-2 ring-brand-turquoise ring-inset' : ''
      } ${
        isDragging && !isOver ? 'bg-muted/30' : ''
      }`}
      data-testid={`cell-${day.key}-${slot.slot_number}`}
    >
      {children}
    </td>
  );
};

export const SchedulePage = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // State
  const [schedules, setSchedules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Drag and Drop State
  const [activeSession, setActiveSession] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [movingSession, setMovingSession] = useState(false);
  
  // Filters
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  
  // Dialogs
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [conflictsSheetOpen, setConflictsSheetOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    name_en: '',
    academic_year: '2026-2027',
    semester: 1,
    effective_from: new Date().toISOString().split('T')[0],
  });

  // Subject color mapping
  const [subjectColorMap, setSubjectColorMap] = useState({});

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
      if (res.data.length > 0 && !selectedSchool) {
        setSelectedSchool(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const fetchData = async () => {
    if (!selectedSchool) return;
    
    setLoading(true);
    try {
      const [schedulesRes, slotsRes, teachersRes, classesRes] = await Promise.all([
        api.get(`/schedules?school_id=${selectedSchool}`),
        api.get(`/time-slots?school_id=${selectedSchool}`),
        api.get(`/teachers?school_id=${selectedSchool}`),
        api.get(`/classes?school_id=${selectedSchool}`),
      ]);
      
      setSchedules(schedulesRes.data);
      setTimeSlots(slotsRes.data.filter(s => !s.is_break).sort((a, b) => a.slot_number - b.slot_number));
      setTeachers(teachersRes.data);
      setClasses(classesRes.data);
      
      // Auto-select first schedule if none selected
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
  };

  const fetchSessions = async () => {
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
      
      // Build subject color map
      const subjects = [...new Set(sessionsRes.data.map(s => s.subject_id))];
      const colorMap = {};
      subjects.forEach((subjectId, index) => {
        colorMap[subjectId] = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
      });
      setSubjectColorMap(colorMap);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

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
        school_id: selectedSchool,
        working_days: DAYS.map(d => d.key),
      });
      toast.success(isRTL ? 'تم إنشاء الجدول بنجاح' : 'Schedule created successfully');
      setCreateScheduleOpen(false);
      setNewSchedule({
        name: '',
        name_en: '',
        academic_year: '2026-2027',
        semester: 1,
        effective_from: new Date().toISOString().split('T')[0],
      });
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
        toast.success(
          isRTL 
            ? `تم إنشاء ${response.data.sessions_created} حصة بنجاح` 
            : `Successfully created ${response.data.sessions_created} sessions`
        );
      } else {
        toast.warning(
          isRTL 
            ? `تم إنشاء ${response.data.sessions_created} حصة مع ${response.data.unplaced_sessions} حصة غير مجدولة` 
            : `Created ${response.data.sessions_created} sessions with ${response.data.unplaced_sessions} unplaced`
        );
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

  // ============== DRAG AND DROP HANDLERS ==============
  const handleDragStart = (event) => {
    const { active } = event;
    const sessionId = active.id;
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSession(session);
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveSession(null);
    setIsDragging(false);
    
    if (!over || !active) return;
    
    const sessionId = active.id;
    const [targetDay, targetSlotId] = over.id.split('::');
    
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Check if same position
    if (session.day_of_week === targetDay && session.time_slot_id === targetSlotId) {
      return;
    }
    
    // Move session
    await moveSession(sessionId, targetDay, targetSlotId);
  };

  const handleDragCancel = () => {
    setActiveSession(null);
    setIsDragging(false);
  };

  const moveSession = async (sessionId, newDay, newSlotId) => {
    setMovingSession(true);
    
    try {
      const response = await api.put(`/schedule-sessions/${sessionId}/move`, {
        new_day_of_week: newDay,
        new_time_slot_id: newSlotId
      });
      
      const { status, message, message_en, conflicts: responseConflicts } = response.data;
      
      if (status === 'success') {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>{isRTL ? message : message_en}</span>
          </div>
        );
      } else if (status === 'conflict_warning') {
        toast.warning(
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="font-medium">{isRTL ? message : message_en}</span>
            </div>
            {responseConflicts && responseConflicts.length > 0 && (
              <div className="text-xs opacity-80">
                {responseConflicts.map((c, i) => (
                  <p key={i}>{isRTL ? c.message : c.message_en}</p>
                ))}
              </div>
            )}
          </div>,
          { duration: 5000 }
        );
      } else if (status === 'hard_conflict') {
        toast.error(
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{isRTL ? message : message_en}</span>
            </div>
            {responseConflicts && responseConflicts.length > 0 && (
              <div className="text-xs opacity-80">
                {responseConflicts.map((c, i) => (
                  <p key={i}>{isRTL ? c.message : c.message_en}</p>
                ))}
              </div>
            )}
          </div>,
          { duration: 6000 }
        );
      }
      
      // Refresh sessions and conflicts
      await fetchSessions();
      
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <span>{error.response?.data?.detail || (isRTL ? 'فشل نقل الحصة' : 'Failed to move session')}</span>
        </div>
      );
    } finally {
      setMovingSession(false);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filterTeacher !== 'all' && session.teacher_id !== filterTeacher) return false;
    if (filterClass !== 'all' && session.class_id !== filterClass) return false;
    return true;
  });

  // Get session for specific day and time slot
  const getSessionsForCell = (day, slotId) => {
    return filteredSessions.filter(s => s.day_of_week === day && s.time_slot_id === slotId);
  };

  // Check if cell has conflict
  const getCellConflicts = (day, slotId) => {
    return conflicts.filter(c => c.day === day && c.time_slot_id === slotId);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM');
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const currentSchedule = schedules.find(s => s.id === selectedSchedule);

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="schedule-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'الجدول المدرسي' : 'School Schedule'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة وعرض الجداول الدراسية' : 'Manage and view class schedules'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/admin/time-slots">
                <Button variant="outline" className="rounded-xl">
                  <Clock className="h-4 w-4 me-2" />
                  {isRTL ? 'الفترات الزمنية' : 'Time Slots'}
                </Button>
              </Link>
              <Link to="/admin/teacher-assignments">
                <Button variant="outline" className="rounded-xl">
                  <UserCheck className="h-4 w-4 me-2" />
                  {isRTL ? 'إسناد المعلمين' : 'Assignments'}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Control Bar */}
          <Card className="card-nassaq">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  {/* School Select */}
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger className="w-[200px] rounded-xl" data-testid="school-select">
                      <SelectValue placeholder={isRTL ? 'اختر المدرسة' : 'Select School'} />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(school => (
                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Schedule Select */}
                  <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                    <SelectTrigger className="w-[220px] rounded-xl" data-testid="schedule-select">
                      <Calendar className="h-4 w-4 me-2" />
                      <SelectValue placeholder={isRTL ? 'اختر الجدول' : 'Select Schedule'} />
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
                  
                  {/* Create New Schedule */}
                  <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl" data-testid="create-schedule-btn">
                        <Plus className="h-4 w-4 me-2" />
                        {isRTL ? 'جدول جديد' : 'New Schedule'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-cairo">
                          {isRTL ? 'إنشاء جدول جديد' : 'Create New Schedule'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{isRTL ? 'اسم الجدول' : 'Schedule Name'}</label>
                          <input
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            value={newSchedule.name}
                            onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                            placeholder={isRTL ? 'الجدول الدراسي - الفصل الأول' : 'Academic Schedule - Semester 1'}
                            data-testid="schedule-name-input"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{isRTL ? 'الفصل الدراسي' : 'Semester'}</label>
                            <Select 
                              value={String(newSchedule.semester)} 
                              onValueChange={(v) => setNewSchedule({ ...newSchedule, semester: parseInt(v) })}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">{isRTL ? 'الفصل الأول' : 'Semester 1'}</SelectItem>
                                <SelectItem value="2">{isRTL ? 'الفصل الثاني' : 'Semester 2'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{isRTL ? 'تاريخ البدء' : 'Start Date'}</label>
                            <input
                              type="date"
                              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                              value={newSchedule.effective_from}
                              onChange={(e) => setNewSchedule({ ...newSchedule, effective_from: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateScheduleOpen(false)} className="rounded-xl">
                          {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button onClick={handleCreateSchedule} className="bg-brand-navy rounded-xl" data-testid="confirm-create-schedule">
                          {isRTL ? 'إنشاء' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Filter by Teacher */}
                  <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <UserCheck className="h-4 w-4 me-2" />
                      <SelectValue placeholder={isRTL ? 'المعلم' : 'Teacher'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? 'جميع المعلمين' : 'All Teachers'}</SelectItem>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Filter by Class */}
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-[180px] rounded-xl">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Status & Actions */}
          {currentSchedule && (
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge 
                  className={`text-sm px-3 py-1 ${
                    currentSchedule.status === 'published' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                  }`}
                >
                  {currentSchedule.status === 'published' ? (
                    <><CheckCircle2 className="h-4 w-4 me-1" />{isRTL ? 'منشور' : 'Published'}</>
                  ) : (
                    <><Clock className="h-4 w-4 me-1" />{isRTL ? 'مسودة' : 'Draft'}</>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentSchedule.total_sessions} {isRTL ? 'حصة' : 'sessions'}
                </span>
                
                {conflicts.length > 0 && (
                  <Sheet open={conflictsSheetOpen} onOpenChange={setConflictsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="destructive" size="sm" className="rounded-xl" data-testid="conflicts-btn">
                        <AlertTriangle className="h-4 w-4 me-2" />
                        {conflicts.length} {isRTL ? 'تعارض' : 'conflicts'}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px]">
                      <SheetHeader>
                        <SheetTitle className="font-cairo flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          {isRTL ? 'التعارضات في الجدول' : 'Schedule Conflicts'}
                        </SheetTitle>
                        <SheetDescription>
                          {isRTL ? 'يجب حل هذه التعارضات قبل نشر الجدول' : 'These conflicts must be resolved before publishing'}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {conflicts.map((conflict, index) => (
                          <div key={index} className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">
                                  {conflict.type === 'teacher_double_booking' 
                                    ? (isRTL ? 'تكرار معلم' : 'Teacher Double Booking')
                                    : (isRTL ? 'تكرار فصل' : 'Class Double Booking')
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {conflict.message_ar || conflict.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {DAYS.find(d => d.key === conflict.day)?.[isRTL ? 'ar' : 'en']}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>

              <div className="flex gap-3">
                {/* Generate Schedule Button */}
                <AlertDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setGenerateDialogOpen(true)}
                    data-testid="generate-schedule-btn"
                  >
                    <Sparkles className="h-4 w-4 me-2" />
                    {isRTL ? 'توليد تلقائي' : 'Auto Generate'}
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-cairo">
                        {isRTL ? 'توليد الجدول تلقائياً' : 'Auto Generate Schedule'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isRTL 
                          ? 'سيقوم النظام بتوليد جدول تلقائي بناءً على إسنادات المعلمين. سيتم حذف الحصص الحالية واستبدالها بالجدول الجديد.'
                          : 'The system will automatically generate a schedule based on teacher assignments. Current sessions will be replaced.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                        <Sparkles className="h-8 w-8 text-brand-turquoise" />
                        <div>
                          <p className="font-medium">{isRTL ? 'التوليد الذكي' : 'Smart Generation'}</p>
                          <p className="text-sm text-muted-foreground">
                            {isRTL 
                              ? 'يراعي نصاب المعلمين وتجنب التعارضات'
                              : 'Respects teacher workload and avoids conflicts'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleGenerateSchedule}
                        disabled={generating}
                        className="bg-brand-turquoise rounded-xl"
                        data-testid="confirm-generate-btn"
                      >
                        {generating ? (
                          <><Loader2 className="h-4 w-4 animate-spin me-2" />{isRTL ? 'جاري التوليد...' : 'Generating...'}</>
                        ) : (
                          <><Play className="h-4 w-4 me-2" />{isRTL ? 'ابدأ التوليد' : 'Start Generation'}</>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Publish Button */}
                {currentSchedule.status !== 'published' && (
                  <Button 
                    className="bg-brand-navy rounded-xl"
                    onClick={handlePublishSchedule}
                    disabled={conflicts.length > 0}
                    data-testid="publish-schedule-btn"
                  >
                    <CheckCircle2 className="h-4 w-4 me-2" />
                    {isRTL ? 'نشر الجدول' : 'Publish Schedule'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Weekly Schedule Grid with Drag & Drop */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          ) : timeSlots.length === 0 ? (
            <Card className="card-nassaq">
              <CardContent className="text-center py-16">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'لم يتم تحديد الفترات الزمنية بعد' : 'Time slots not defined yet'}
                </p>
                <Link to="/admin/time-slots">
                  <Button className="rounded-xl">
                    <Settings className="h-4 w-4 me-2" />
                    {isRTL ? 'إعداد الفترات الزمنية' : 'Setup Time Slots'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {/* Drag & Drop Instructions Banner */}
              <div className="mb-4 p-3 bg-brand-turquoise/10 rounded-xl border border-brand-turquoise/30">
                <div className="flex items-center gap-2 text-sm text-brand-turquoise">
                  <Move className="h-4 w-4" />
                  <span className="font-medium">
                    {isRTL ? 'يمكنك سحب وإفلات الحصص لتعديل الجدول' : 'Drag and drop sessions to modify the schedule'}
                  </span>
                </div>
              </div>
              
              {/* Moving Indicator */}
              {movingSession && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                  <div className="bg-background rounded-xl p-6 shadow-xl flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-turquoise" />
                    <span className="font-medium">
                      {isRTL ? 'جاري نقل الحصة...' : 'Moving session...'}
                    </span>
                  </div>
                </div>
              )}
              
              <Card className="card-nassaq overflow-hidden" data-testid="schedule-grid">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-3 text-start font-medium border-b border-e w-24">
                            {isRTL ? 'الوقت' : 'Time'}
                          </th>
                          {DAYS.map(day => (
                            <th key={day.key} className="p-3 text-center font-medium border-b min-w-[160px]">
                              {isRTL ? day.ar : day.en}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((slot, slotIndex) => (
                          <tr key={slot.id} className={slotIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                            <td className="p-3 border-e border-b">
                              <div className="text-xs font-medium text-muted-foreground">
                                {formatTime(slot.start_time)}
                              </div>
                              <div className="text-xs text-muted-foreground/60">
                                {formatTime(slot.end_time)}
                              </div>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {isRTL ? slot.name : (slot.name_en || slot.name)}
                              </Badge>
                            </td>
                            {DAYS.map(day => {
                              const cellSessions = getSessionsForCell(day.key, slot.id);
                              const cellConflicts = getCellConflicts(day.key, slot.id);
                              const hasConflict = cellConflicts.length > 0;
                              
                              return (
                                <DroppableCell
                                  key={`${day.key}-${slot.id}`}
                                  id={`${day.key}::${slot.id}`}
                                  day={day}
                                  slot={slot}
                                  hasConflict={hasConflict}
                                  isDragging={isDragging}
                                >
                                  {cellSessions.length > 0 ? (
                                    <div className="space-y-2">
                                      {cellSessions.map(session => (
                                        <DraggableSession
                                          key={session.id}
                                          session={session}
                                          hasConflict={hasConflict}
                                          cellConflicts={cellConflicts}
                                          subjectColor={subjectColorMap[session.subject_id] || SUBJECT_COLORS[0]}
                                          isRTL={isRTL}
                                          onClick={() => {
                                            setSelectedSession(session);
                                            setSessionDetailOpen(true);
                                          }}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-16 flex items-center justify-center text-muted-foreground/30">
                                      <span className="text-xs">{isDragging ? (isRTL ? 'أفلت هنا' : 'Drop here') : '—'}</span>
                                    </div>
                                  )}
                                </DroppableCell>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Drag Overlay */}
              <DragOverlay>
                {activeSession && (
                  <div className={`p-3 rounded-xl border-2 shadow-xl ${subjectColorMap[activeSession.subject_id] || SUBJECT_COLORS[0]} opacity-90`}>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-sm">{activeSession.subject_name}</p>
                        <p className="text-xs opacity-75">{activeSession.teacher_name}</p>
                        <p className="text-xs opacity-60">{activeSession.class_name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Session Detail Dialog */}
          <Dialog open={sessionDetailOpen} onOpenChange={setSessionDetailOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-cairo">
                  {isRTL ? 'تفاصيل الحصة' : 'Session Details'}
                </DialogTitle>
              </DialogHeader>
              {selectedSession && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{isRTL ? 'المادة' : 'Subject'}</p>
                      <p className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-brand-navy dark:text-brand-gold" />
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
                      <p className="text-xs text-muted-foreground">{isRTL ? 'الوقت' : 'Time'}</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'اليوم' : 'Day'}</p>
                    <Badge variant="secondary" className="rounded-lg">
                      {DAYS.find(d => d.key === selectedSession.day_of_week)?.[isRTL ? 'ar' : 'en']}
                    </Badge>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteSession(selectedSession?.id)}
                  className="rounded-xl"
                  data-testid="delete-session-btn"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {isRTL ? 'حذف الحصة' : 'Delete Session'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Legend */}
          <Card className="card-nassaq">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-6 items-center">
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'دليل الألوان:' : 'Color Legend:'}</p>
                {Object.entries(subjectColorMap).slice(0, 6).map(([subjectId, colorClass]) => {
                  const session = sessions.find(s => s.subject_id === subjectId);
                  return session ? (
                    <div key={subjectId} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 ${colorClass}`}></div>
                      <span className="text-xs">{session.subject_name}</span>
                    </div>
                  ) : null;
                })}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-red-400 bg-red-100"></div>
                  <span className="text-xs text-red-600">{isRTL ? 'تعارض' : 'Conflict'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
