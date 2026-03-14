import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  Calendar, Clock, ChevronRight, ChevronLeft, BookOpen,
  Users, Loader2, RefreshCw, Play, X
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [view, setView] = useState('weekly');
  const getDayIndex = (jsDay) => (jsDay >= 0 && jsDay <= 4) ? jsDay : 0;
  const [selectedDay, setSelectedDay] = useState(DAYS[getDayIndex(new Date().getDay())]?.key || 'sunday');
  const [selectedSession, setSelectedSession] = useState(null);

  const teacherId = user?.teacher_id || user?.id;

  const fetchSchedule = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      const [scheduleRes, slotsRes] = await Promise.all([
        api.get(`/teacher/schedule/${teacherId}`),
        api.get('/time-slots')
      ]);
      
      setSchedule(scheduleRes.data || []);
      setTimeSlots((slotsRes.data || []).filter(s => !s.is_break));
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

  const todayKey = DAYS[getDayIndex(new Date().getDay())]?.key;

  const isCurrentPeriod = (dayKey, slot) => {
    if (dayKey !== todayKey) return false;
    const now = new Date();
    const nowTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const start = slot.start_time?.slice(0, 5) || '';
    const end = slot.end_time?.slice(0, 5) || '';
    return start && end && start <= nowTime && nowTime <= end;
  };

  const handleStartClass = (session, slot) => {
    const lessonData = {
      lesson: { ...session, time: slot?.start_time?.slice(0, 5), end_time: slot?.end_time?.slice(0, 5) },
      schedule_session_id: session.id,
      class_id: session.class_id,
      subject_id: session.subject_id
    };
    sessionStorage.setItem('current_lesson', JSON.stringify(lessonData));
    navigate('/teacher/session/start', { state: lessonData });
  };

  const getMonthSummary = () => {
    const summary = {};
    DAYS.forEach(day => {
      const daySessions = schedule.filter(s => s.day_of_week === day.key);
      summary[day.key] = {
        count: daySessions.length,
        subjects: [...new Set(daySessions.map(s => s.subject_name))],
        classes: [...new Set(daySessions.map(s => s.class_name))],
      };
    });
    return summary;
  };

  const renderScheduleGrid = (daysToShow) => (
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
              {daysToShow.map(day => (
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
                <td className={`p-3 border-b ${daysToShow.some(d => isCurrentPeriod(d.key, slot)) ? 'bg-green-50 font-bold' : ''}`}>
                  <div className="text-sm font-medium">{isRTL ? `الحصة ${slot.slot_number}` : `Period ${slot.slot_number}`}</div>
                  <div className="text-xs text-muted-foreground">
                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                  </div>
                  {daysToShow.some(d => isCurrentPeriod(d.key, slot)) && (
                    <Badge className="mt-1 bg-green-500 text-white text-[10px]">{isRTL ? 'الآن' : 'Now'}</Badge>
                  )}
                </td>
                {daysToShow.map(day => {
                  const sessions = getSessionsForCell(day.key, slot.id);
                  const currentPeriod = isCurrentPeriod(day.key, slot);
                  return (
                    <td 
                      key={`${day.key}-${slot.id}`} 
                      className={`p-2 border-b border-s min-h-[80px] ${
                        currentPeriod ? 'bg-green-50 ring-2 ring-inset ring-green-400' :
                        day.key === todayKey ? 'bg-brand-turquoise/5' : ''
                      }`}
                    >
                      {sessions.length > 0 ? (
                        <div className="space-y-1">
                          {sessions.map(session => (
                            <div
                              key={session.id}
                              className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                currentPeriod ? 'ring-2 ring-green-500 shadow-green-100 shadow-lg ' : ''
                              }${getSubjectColor(session.subject_name)}`}
                              onClick={() => setSelectedSession({ ...session, slot })}
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
                                  <div className="flex items-center gap-1 text-xs opacity-60 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</span>
                                    {session.room && <span className="ms-1">· {session.room}</span>}
                                  </div>
                                </div>
                              </div>
                              {day.key === todayKey && (
                                <Button 
                                  size="sm" 
                                  className={`w-full mt-2 h-7 text-xs ${currentPeriod ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-navy hover:bg-brand-navy/90'}`}
                                  onClick={(e) => { e.stopPropagation(); handleStartClass(session, slot); }}
                                >
                                  <Play className="h-3 w-3 me-1" />
                                  {currentPeriod ? (isRTL ? 'الحصة الحالية' : 'Current Class') : (isRTL ? 'ابدأ الحصة' : 'Start Class')}
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
  );

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
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
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Calendar className="h-4 w-4 me-1" />
                {isRTL ? 'طباعة' : 'Print'}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="weekly" data-testid="weekly-view-btn">
                  {isRTL ? 'أسبوعي' : 'Weekly'}
                </TabsTrigger>
                <TabsTrigger value="daily" data-testid="daily-view-btn">
                  {isRTL ? 'يومي' : 'Daily'}
                </TabsTrigger>
                <TabsTrigger value="monthly" data-testid="monthly-view-btn">
                  {isRTL ? 'شهري' : 'Monthly'}
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
          ) : timeSlots.length === 0 && schedule.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">{isRTL ? 'لا يوجد جدول حالياً' : 'No schedule available'}</p>
                <p className="text-sm text-muted-foreground/70 mt-1">{isRTL ? 'لم يتم تعيين حصص بعد' : 'No sessions have been assigned yet'}</p>
              </CardContent>
            </Card>
          ) : view === 'monthly' ? (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="font-cairo font-bold text-lg text-brand-navy mb-4">
                  {isRTL ? 'ملخص الجدول الشهري' : 'Monthly Schedule Summary'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  {DAYS.map(day => {
                    const summary = getMonthSummary()[day.key];
                    return (
                      <div
                        key={day.key}
                        className={`p-4 rounded-xl border-2 ${
                          day.key === todayKey ? 'border-brand-turquoise bg-brand-turquoise/5' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold ${day.key === todayKey ? 'text-brand-turquoise' : 'text-brand-navy'}`}>
                            {isRTL ? day.ar : day.en}
                          </span>
                          {day.key === todayKey && (
                            <Badge className="bg-brand-turquoise text-white text-[10px]">{isRTL ? 'اليوم' : 'Today'}</Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-brand-navy">{summary.count}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'حصص' : 'sessions'}</p>
                        <div className="mt-2 space-y-1">
                          {summary.subjects.slice(0, 3).map((subj, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] me-1">{subj}</Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
              {renderScheduleGrid(DAYS)}
            </div>
          ) : (
            renderScheduleGrid(view === 'weekly' ? DAYS : [DAYS.find(d => d.key === selectedDay)])
          )}

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

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedSession(null)}>
          <Card className="w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-cairo text-lg">{isRTL ? 'تفاصيل الحصة' : 'Session Details'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${getSubjectColor(selectedSession.subject_name)}`}>
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-6 w-6" />
                  <div>
                    <h3 className="font-bold text-lg">{selectedSession.subject_name}</h3>
                    <p className="text-sm opacity-70">{selectedSession.class_name}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{isRTL ? 'اليوم' : 'Day'}</p>
                  <p className="font-medium">
                    {DAYS.find(d => d.key === selectedSession.day_of_week)?.[isRTL ? 'ar' : 'en']}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{isRTL ? 'الحصة' : 'Period'}</p>
                  <p className="font-medium">
                    {selectedSession.slot?.slot_number ? (isRTL ? `الحصة ${selectedSession.slot.slot_number}` : `Period ${selectedSession.slot.slot_number}`) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{isRTL ? 'من' : 'From'}</p>
                  <p className="font-mono font-medium">{selectedSession.slot?.start_time?.slice(0, 5) || '-'}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{isRTL ? 'إلى' : 'To'}</p>
                  <p className="font-mono font-medium">{selectedSession.slot?.end_time?.slice(0, 5) || '-'}</p>
                </div>
              </div>

              {selectedSession.room && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{isRTL ? 'الفصل' : 'Room'}</p>
                  <p className="font-medium">{selectedSession.room}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-brand-navy hover:bg-brand-navy/90"
                  onClick={() => handleStartClass(selectedSession, selectedSession.slot)}
                >
                  <Play className="h-4 w-4 me-2" />
                  {isRTL ? 'ابدأ الحصة' : 'Start Class'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (selectedSession.class_id) navigate(`/teacher/class/${selectedSession.class_id}`);
                  }}
                >
                  {isRTL ? 'عرض الفصل' : 'View Class'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <HakimAssistant />
    </TeacherLayout>
  );
}
