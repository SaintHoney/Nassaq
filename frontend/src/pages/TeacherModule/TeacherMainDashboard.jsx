import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';
import {
  BookOpen, Users, Calendar, ClipboardCheck, Bell,
  GraduationCap, Clock, AlertCircle, ChevronLeft, CheckCircle2,
  BarChart3, FileText, Star, CalendarDays, RefreshCw,
  MessageSquare, FolderOpen, Play, Settings
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

const getCurrentHijriDate = () => {
  const today = new Date();
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
    const hijriDate = hijriFormatter.format(today);
    const gregorianDate = today.toLocaleDateString('en-GB');
    return { hijri: hijriDate, gregorian: gregorianDate };
  } catch (e) {
    return { hijri: 'التاريخ الهجري', gregorian: today.toLocaleDateString() };
  }
};

export default function TeacherMainDashboard() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    myClasses: 0,
    myStudents: 0,
    todayLessons: 0,
    pendingAttendance: 0,
    pendingAssessments: 0,
    upcomingLessons: [],
    totalSessions: 0,
    subjectsCount: 0,
    unreadNotifications: 0,
    unreadMessages: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [hijriDate, setHijriDate] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolStage, setSchoolStage] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [countdown, setCountdown] = useState('');
  const countdownRef = useRef(null);

  const teacherId = user?.teacher_id || user?.id;

  const fetchTeacherData = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      // Fetch teacher dashboard data from API
      const dashboardRes = await api.get(`/teacher/dashboard/${teacherId}`).catch(() => null);
      
      if (dashboardRes?.data) {
        const data = dashboardRes.data;
        setStats({
          myClasses: data.stats.my_classes || 0,
          myStudents: data.stats.my_students || 0,
          todayLessons: data.stats.today_lessons || 0,
          pendingAttendance: data.stats.pending_attendance || 0,
          pendingAssessments: 0,
          totalSessions: data.stats.weekly_sessions || 0,
          subjectsCount: data.stats.subjects_count || 0,
          unreadNotifications: data.stats.unread_notifications || 0,
          unreadMessages: data.stats.unread_messages || 0,
          upcomingLessons: data.today_schedule?.map(lesson => ({
            time: lesson.time,
            period: lesson.period,
            subject: lesson.subject || lesson.subject_name,
            class: lesson.class_name,
            class_id: lesson.class_id,
            subject_id: lesson.subject_id,
            end_time: lesson.end_time,
            schedule_session_id: lesson.schedule_session_id || lesson.id
          })) || []
        });
        
        setHijriDate(data.hijri_date || '');
        setSchoolName(data.school_name || '');
        setSchoolStage(data.stage || '');
        setCurrentSession(data.current_session || null);
        setNextSession(data.next_session || null);
        setTeacherSubjects((data.subjects || []).map(s => s.name).filter(Boolean));
        setClasses(data.classes || []);
        
        setRecentActivities(data.recent_activities?.map(a => ({
          type: a.type?.includes('attendance') ? 'attendance' : 
                a.type?.includes('assessment') ? 'assessment' : 'notification',
          message: a.message,
          time: a.time ? new Date(a.time).toLocaleDateString('ar-SA') : 'مؤخراً'
        })) || []);
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  }, [api, teacherId]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const activeSession = currentSession || nextSession;
    if (!activeSession?.time) return;

    const updateCountdown = () => {
      const now = new Date();
      const [h, m] = (currentSession ? activeSession.end_time : activeSession.time)?.split(':').map(Number) || [];
      if (h === undefined) return;
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      const diff = target - now;
      if (diff <= 0) {
        setCountdown(currentSession ? (isRTL ? 'انتهت' : 'Ended') : (isRTL ? 'الآن' : 'Now'));
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [currentSession, nextSession, isRTL]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeacherData();
    setRefreshing(false);
    toast.success(isRTL ? 'تم تحديث البيانات' : 'Data refreshed');
  };

  const quickActions = [
    { 
      icon: Calendar, 
      label: isRTL ? 'جدولي' : 'My Schedule', 
      path: '/teacher/schedule', 
      color: 'bg-brand-turquoise hover:bg-brand-turquoise/90',
      description: isRTL ? 'عرض جدول الحصص' : 'View class schedule'
    },
    { 
      icon: GraduationCap, 
      label: isRTL ? 'فصولي' : 'My Classes', 
      path: '/teacher/classes', 
      color: 'bg-brand-navy hover:bg-brand-navy/90',
      description: isRTL ? 'إدارة الفصول الدراسية' : 'Manage your classes'
    },
    { 
      icon: ClipboardCheck, 
      label: isRTL ? 'تسجيل الحضور' : 'Attendance', 
      path: '/teacher/attendance', 
      color: 'bg-green-500 hover:bg-green-600',
      description: isRTL ? 'تسجيل حضور وغياب الطلاب' : 'Record student attendance'
    },
    { 
      icon: Star, 
      label: isRTL ? 'الإنجازات' : 'Achievements', 
      path: '/teacher/reports', 
      color: 'bg-purple-500 hover:bg-purple-600',
      description: isRTL ? 'عرض الإنجازات والتقارير' : 'View achievements and reports'
    },
  ];

  const statsCards = [
    { 
      icon: BookOpen, 
      label: isRTL ? 'فصولي' : 'My Classes', 
      value: stats.myClasses, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      path: '/teacher/classes'
    },
    { 
      icon: Users, 
      label: isRTL ? 'طلابي' : 'My Students', 
      value: stats.myStudents, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      path: '/teacher/students'
    },
    { 
      icon: CalendarDays, 
      label: isRTL ? 'حصص اليوم' : "Today's Lessons", 
      value: stats.todayLessons, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      path: '/teacher/schedule'
    },
    { 
      icon: AlertCircle, 
      label: isRTL ? 'حضور معلق' : 'Pending', 
      value: stats.pendingAttendance, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      path: '/teacher/attendance'
    },
    { 
      icon: Bell, 
      label: isRTL ? 'إشعارات' : 'Notifications', 
      value: stats.unreadNotifications, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      path: '/notifications'
    },
    { 
      icon: MessageSquare, 
      label: isRTL ? 'رسائل' : 'Messages', 
      value: stats.unreadMessages, 
      color: 'text-teal-600', 
      bgColor: 'bg-teal-100',
      path: '/teacher/communication'
    },
  ];

  return (
    <TeacherLayout>
        <div className="p-4 md:p-6 space-y-6">
          
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-brand-navy/5 via-brand-turquoise/5 to-brand-purple/5 border-brand-navy/20">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-brand-turquoise shadow-lg">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-navy to-brand-turquoise text-white text-xl font-bold">
                      {user?.full_name?.charAt(0) || 'م'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-cairo text-xl font-bold text-brand-navy">
                      {isRTL ? `مرحباً أستاذ ${user?.full_name || 'المعلم'}` : `Welcome, ${user?.full_name || 'Teacher'}`}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {schoolName || (isRTL ? 'المدرسة' : 'School')}
                      {schoolStage ? ` · ${schoolStage}` : ''}
                    </p>
                    {teacherSubjects.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {teacherSubjects.slice(0, 3).join(' · ')}
                        {teacherSubjects.length > 3 ? ` +${teacherSubjects.length - 3}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Refresh */}
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-brand-navy" />
                    <div className="text-end">
                      <p className="font-cairo text-lg font-bold text-brand-navy">
                        {hijriDate || getCurrentHijriDate().hijri}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {new Date().toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-brand-turquoise group"
                onClick={() => navigate(action.path)}
                data-testid={`quick-action-${index}`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-xl ${action.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 hidden md:block">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsCards.map((stat, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(stat.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current / Next Session Panel */}
          {(currentSession || nextSession) && (
            <Card className={`border-2 ${currentSession ? 'border-green-400 bg-green-50/50' : 'border-brand-turquoise bg-brand-turquoise/5'}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${currentSession ? 'bg-green-500' : 'bg-brand-turquoise'} text-white`}>
                      <Play className="h-7 w-7" />
                    </div>
                    <div>
                      <Badge className={`mb-1 ${currentSession ? 'bg-green-500' : 'bg-brand-turquoise'}`}>
                        {currentSession ? (isRTL ? 'الحصة الحالية' : 'Current Session') : (isRTL ? 'الحصة التالية' : 'Next Session')}
                      </Badge>
                      <h3 className="font-cairo font-bold text-xl text-brand-navy">
                        {(currentSession || nextSession)?.subject || (currentSession || nextSession)?.subject_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {(currentSession || nextSession)?.class_name} · {isRTL ? 'الحصة' : 'Period'} {(currentSession || nextSession)?.slot_number || (currentSession || nextSession)?.period}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-mono font-bold text-lg text-brand-navy">{(currentSession || nextSession)?.time}</p>
                      <p className="text-xs text-muted-foreground">{(currentSession || nextSession)?.end_time}</p>
                    </div>
                    {countdown && (
                      <div className={`px-4 py-2 rounded-xl font-mono font-bold text-lg ${currentSession ? 'bg-green-100 text-green-700' : 'bg-brand-turquoise/10 text-brand-turquoise'}`}>
                        <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                          {currentSession ? (isRTL ? 'متبقي' : 'Remaining') : (isRTL ? 'تبدأ بعد' : 'Starts in')}
                        </p>
                        {countdown}
                      </div>
                    )}
                    <Button
                      className={`h-12 px-6 ${currentSession ? 'bg-green-500 hover:bg-green-600' : 'bg-brand-turquoise hover:bg-brand-turquoise/90'}`}
                      onClick={() => {
                        const session = currentSession || nextSession;
                        const lessonData = {
                          lesson: session,
                          schedule_session_id: session?.schedule_session_id || session?.id,
                          class_id: session?.class_id,
                          subject_id: session?.subject_id
                        };
                        sessionStorage.setItem('current_lesson', JSON.stringify(lessonData));
                        navigate('/teacher/session/start', { state: lessonData });
                      }}
                    >
                      <Play className="h-5 w-5 me-2" />
                      {isRTL ? 'ابدأ الحصة' : 'Start Class'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Today's Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-brand-turquoise" />
                  {isRTL ? 'جدول اليوم' : "Today's Schedule"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'حصصك المتبقية لهذا اليوم' : 'Your remaining lessons for today'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.upcomingLessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>{isRTL ? 'لا توجد حصص اليوم' : 'No lessons today'}</p>
                  </div>
                ) : (
                  stats.upcomingLessons.map((lesson, index) => {
                    const now = new Date();
                    const nowTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
                    const isCurrent = lesson.time && lesson.end_time && lesson.time <= nowTime && nowTime <= lesson.end_time;
                    const isCompleted = lesson.end_time && nowTime > lesson.end_time;
                    const isUpcoming = !isCurrent && !isCompleted;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isCurrent ? 'bg-green-50 border-green-400' :
                          isCompleted ? 'bg-gray-50 border-gray-200 opacity-60' :
                          'bg-brand-turquoise/5 border-brand-turquoise/30 hover:bg-brand-turquoise/10'
                        }`}
                        onClick={() => lesson.class_id && navigate(`/teacher/class/${lesson.class_id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isCurrent ? 'bg-green-500 text-white' :
                            isCompleted ? 'bg-gray-300' : 'bg-brand-turquoise text-white'
                          }`}>
                            <span className="font-bold text-sm">{lesson.time}</span>
                          </div>
                          <div>
                            <p className="font-medium">{lesson.subject}</p>
                            <p className="text-sm text-muted-foreground">{lesson.class}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            isCurrent ? 'bg-green-500' :
                            isCompleted ? 'bg-gray-400' : 'bg-brand-turquoise'
                          }>
                            {isCurrent ? (isRTL ? 'الآن' : 'Now') :
                             isCompleted ? (isRTL ? 'انتهت' : 'Done') :
                             (isRTL ? 'قادمة' : 'Upcoming')}
                          </Badge>
                          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })
                )}
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/teacher/schedule')}>
                  {isRTL ? 'عرض الجدول الكامل' : 'View Full Schedule'}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-brand-purple" />
                  {isRTL ? 'آخر النشاطات' : 'Recent Activities'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'أحدث الأنشطة والتحديثات' : 'Latest activities and updates'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>{isRTL ? 'لا توجد نشاطات حديثة' : 'No recent activities'}</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'attendance' ? 'bg-green-100' :
                        activity.type === 'assessment' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        {activity.type === 'attendance' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : activity.type === 'assessment' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bell className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/notifications')}>
                  {isRTL ? 'عرض جميع الإشعارات' : 'View All Notifications'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                {isRTL ? 'المهام المعلقة' : 'Pending Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-orange-800">{isRTL ? 'حضور غير مسجل' : 'Unrecorded Attendance'}</span>
                    <Badge variant="destructive">{stats.pendingAttendance}</Badge>
                  </div>
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => navigate('/teacher/attendance')}>
                    {isRTL ? 'تسجيل الآن' : 'Record Now'}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">{isRTL ? 'تقييمات معلقة' : 'Pending Assessments'}</span>
                    <Badge className="bg-blue-500">{stats.pendingAssessments}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700" onClick={() => navigate('/teacher/assessments')}>
                    {isRTL ? 'إكمال التقييم' : 'Complete Assessment'}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">{isRTL ? 'تقارير للمراجعة' : 'Reports to Review'}</span>
                    <Badge className="bg-green-500">0</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700" onClick={() => navigate('/teacher/reports')}>
                    {isRTL ? 'عرض التقارير' : 'View Reports'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{isRTL ? 'التنقل السريع' : 'Quick Navigation'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { icon: Calendar, label: isRTL ? 'جدولي' : 'My Schedule', path: '/teacher/schedule' },
                  { icon: GraduationCap, label: isRTL ? 'فصولي' : 'My Classes', path: '/teacher/classes' },
                  { icon: Users, label: isRTL ? 'طلابي' : 'My Students', path: '/teacher/students' },
                  { icon: BarChart3, label: isRTL ? 'التقارير' : 'Reports', path: '/teacher/reports' },
                  { icon: FolderOpen, label: isRTL ? 'المصادر' : 'Resources', path: '/teacher/resources' },
                  { icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings', path: '/teacher/settings' },
                ].map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:bg-muted hover:border-brand-turquoise"
                    onClick={() => navigate(link.path)}
                  >
                    <link.icon className="h-5 w-5 text-brand-navy" />
                    <span className="text-sm">{link.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      <HakimAssistant />
    </TeacherLayout>
  );
}
