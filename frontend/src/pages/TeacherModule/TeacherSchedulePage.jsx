import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  Calendar, Clock, ChevronRight, ChevronLeft, BookOpen,
  Users, Loader2, RefreshCw, Printer, Download, Play
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

const DAYS = [
  { key: 'sunday', ar: 'الأحد', en: 'Sun' },
  { key: 'monday', ar: 'الاثنين', en: 'Mon' },
  { key: 'tuesday', ar: 'الثلاثاء', en: 'Tue' },
  { key: 'wednesday', ar: 'الأربعاء', en: 'Wed' },
  { key: 'thursday', ar: 'الخميس', en: 'Thu' },
];

const SUBJECT_COLORS = {
  'اللغة العربية': 'bg-blue-100 border-blue-300 text-blue-800',
  'الرياضيات': 'bg-green-100 border-green-300 text-green-800',
  'العلوم': 'bg-purple-100 border-purple-300 text-purple-800',
  'اللغة الإنجليزية': 'bg-red-100 border-red-300 text-red-800',
  'الدراسات الاجتماعية': 'bg-amber-100 border-amber-300 text-amber-800',
  'التربية الإسلامية': 'bg-emerald-100 border-emerald-300 text-emerald-800',
  'الحاسب الآلي': 'bg-cyan-100 border-cyan-300 text-cyan-800',
  'default': 'bg-gray-100 border-gray-300 text-gray-800'
};

export default function TeacherSchedulePage() {
  const { user, api, isRTL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [view, setView] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1]?.key || 'sunday');

  const teacherId = user?.teacher_id || user?.id;

  const fetchSchedule = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      const [scheduleRes, slotsRes] = await Promise.all([
        api.get(`/teacher/schedule/${teacherId}`).catch(() => ({ data: [] })),
        api.get('/time-slots').catch(() => ({ data: [] }))
      ]);
      
      setSchedule(scheduleRes.data || []);
      setTimeSlots(slotsRes.data?.filter(s => !s.is_break) || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error(isRTL ? 'خطأ في تحميل الجدول' : 'Error loading schedule');
    } finally {
      setLoading(false);
    }
  }, [api, teacherId, isRTL]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const getSessionsForCell = (day, slotId) => {
    return schedule.filter(s => s.day_of_week === day && s.time_slot_id === slotId);
  };

  const getSubjectColor = (subjectName) => {
    return SUBJECT_COLORS[subjectName] || SUBJECT_COLORS.default;
  };

  const todayKey = DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1]?.key;

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                {isRTL ? 'جدولي' : 'My Schedule'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'عرض وإدارة جدول حصصي' : 'View and manage my class schedule'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchSchedule} disabled={loading}>
                <RefreshCw className={`h-4 w-4 me-1 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 me-1" />
                {isRTL ? 'طباعة' : 'Print'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 me-1" />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="weekly" data-testid="weekly-view-btn">
                  {isRTL ? 'أسبوعي' : 'Weekly'}
                </TabsTrigger>
                <TabsTrigger value="daily" data-testid="daily-view-btn">
                  {isRTL ? 'يومي' : 'Daily'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {view === 'daily' && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  const idx = DAYS.findIndex(d => d.key === selectedDay);
                  setSelectedDay(DAYS[(idx - 1 + DAYS.length) % DAYS.length].key);
                }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[80px] text-center">
                  {DAYS.find(d => d.key === selectedDay)?.[isRTL ? 'ar' : 'en']}
                </span>
                <Button variant="ghost" size="icon" onClick={() => {
                  const idx = DAYS.findIndex(d => d.key === selectedDay);
                  setSelectedDay(DAYS[(idx + 1) % DAYS.length].key);
                }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          ) : timeSlots.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">{isRTL ? 'لا يوجد جدول حالياً' : 'No schedule available'}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden" data-testid="schedule-grid">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-start border-b min-w-[80px]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {isRTL ? 'الحصة' : 'Period'}
                        </div>
                      </th>
                      {(view === 'weekly' ? DAYS : [DAYS.find(d => d.key === selectedDay)]).map(day => (
                        <th 
                          key={day.key} 
                          className={`p-3 text-center border-b border-s min-w-[150px] ${
                            day.key === todayKey ? 'bg-brand-turquoise/10' : ''
                          }`}
                        >
                          <span className={day.key === todayKey ? 'font-bold text-brand-turquoise' : ''}>
                            {isRTL ? day.ar : day.en}
                          </span>
                          {day.key === todayKey && (
                            <Badge variant="outline" className="ms-2 text-xs bg-brand-turquoise text-white">
                              {isRTL ? 'اليوم' : 'Today'}
                            </Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, idx) => (
                      <tr key={slot.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        <td className="p-3 border-b">
                          <div className="text-sm font-medium">{isRTL ? `الحصة ${slot.slot_number}` : `Period ${slot.slot_number}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                          </div>
                        </td>
                        {(view === 'weekly' ? DAYS : [DAYS.find(d => d.key === selectedDay)]).map(day => {
                          const sessions = getSessionsForCell(day.key, slot.id);
                          return (
                            <td 
                              key={`${day.key}-${slot.id}`} 
                              className={`p-2 border-b border-s min-h-[80px] ${
                                day.key === todayKey ? 'bg-brand-turquoise/5' : ''
                              }`}
                            >
                              {sessions.length > 0 ? (
                                <div className="space-y-1">
                                  {sessions.map(session => (
                                    <div
                                      key={session.id}
                                      className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getSubjectColor(session.subject_name)}`}
                                      data-testid={`session-${session.id}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-sm truncate">{session.subject_name}</p>
                                          <div className="flex items-center gap-1 text-xs opacity-70">
                                            <Users className="h-3 w-3" />
                                            <span className="truncate">{session.class_name}</span>
                                          </div>
                                        </div>
                                      </div>
                                      {day.key === todayKey && new Date().getHours() >= parseInt(slot.start_time?.split(':')[0]) && (
                                        <Button size="sm" className="w-full mt-2 h-7 text-xs bg-brand-navy hover:bg-brand-navy/90">
                                          <Play className="h-3 w-3 me-1" />
                                          {isRTL ? 'ابدأ الحصة' : 'Start Class'}
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-16 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground/50 text-xs">
                                  {isRTL ? 'فارغ' : 'Empty'}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-brand-navy">{schedule.length}</div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الحصص' : 'Total Sessions'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-brand-turquoise">
                  {schedule.filter(s => s.day_of_week === todayKey).length}
                </div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'حصص اليوم' : "Today's Sessions"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {[...new Set(schedule.map(s => s.class_id))].length}
                </div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'عدد الفصول' : 'Classes'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {[...new Set(schedule.map(s => s.subject_name))].length}
                </div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'عدد المواد' : 'Subjects'}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
