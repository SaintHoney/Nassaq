import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';
import {
  Users, BookOpen, Calendar, GraduationCap, Clock,
  Play, ChevronLeft, RefreshCw, Loader2
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

// Get current Hijri date
const getCurrentHijriDate = () => {
  const today = new Date();
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return hijriFormatter.format(today);
  } catch (e) {
    return today.toLocaleDateString('ar-SA');
  }
};

// Get time until lesson - with smarter end detection
const getTimeUntilLesson = (lessonTime) => {
  if (!lessonTime) return null;
  
  const now = new Date();
  const [hours, minutes] = lessonTime.split(':').map(Number);
  const lessonDate = new Date();
  lessonDate.setHours(hours, minutes, 0, 0);
  
  // Calculate end time (assume 45 minute lesson)
  const lessonEndDate = new Date(lessonDate);
  lessonEndDate.setMinutes(lessonEndDate.getMinutes() + 45);
  
  const diff = lessonDate - now;
  const diffMinutes = Math.floor(diff / 60000);
  
  // If lesson is currently happening (started but not ended)
  if (diff < 0 && now < lessonEndDate) return { status: 'ongoing', minutes: Math.abs(diffMinutes) };
  
  // If lesson ended but it's the same day - show as "ready" so teacher can still start late
  if (diff < 0) return { status: 'ready', minutes: Math.abs(diffMinutes), recentlyEnded: true };
  
  // Lesson hasn't started yet
  if (diffMinutes <= 10) return { status: 'ready', minutes: diffMinutes };
  if (diffMinutes <= 30) return { status: 'soon', minutes: diffMinutes };
  return { status: 'upcoming', minutes: diffMinutes };
};

// Get card color based on time - matching reference design
const getLessonCardStyle = (timeStatus, isFirst = false) => {
  // First lesson should always be green unless explicitly ended
  if (isFirst) {
    if (timeStatus?.status === 'ended') {
      return 'border-gray-300 bg-gray-100 opacity-60';
    }
    // Use !important equivalent by adding more specific classes
    return 'border-0 !bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 [background:linear-gradient(to_bottom_right,#10b981,#059669)]';
  }
  
  // Other lessons
  if (!timeStatus) return 'border-0 [background:linear-gradient(to_bottom_right,#3b82f6,#2563eb)] text-white';
  
  switch (timeStatus.status) {
    case 'ongoing':
    case 'ready':
      return 'border-0 [background:linear-gradient(to_bottom_right,#10b981,#059669)] text-white shadow-lg shadow-emerald-200';
    case 'soon':
    case 'upcoming':
      return 'border-0 [background:linear-gradient(to_bottom_right,#3b82f6,#2563eb)] text-white shadow-lg shadow-blue-200';
    case 'ended':
      return 'border-gray-300 bg-gray-100 opacity-60';
    default:
      return 'border-0 [background:linear-gradient(to_bottom_right,#3b82f6,#2563eb)] text-white';
  }
};

export default function TeacherHomePage() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [todayLessons, setTodayLessons] = useState([]);
  const [stats, setStats] = useState({
    classesCount: 0,
    studentsCount: 0,
    stage: ''
  });

  const teacherId = user?.teacher_id || user?.id;

  const fetchTeacherData = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      // Fetch teacher dashboard data
      const dashboardRes = await api.get(`/teacher/dashboard/${teacherId}`).catch(() => null);
      
      if (dashboardRes?.data) {
        const data = dashboardRes.data;
        
        setTeacherInfo({
          name: data.teacher?.full_name || user?.full_name || 'معلم',
          school: data.school_name || 'المدرسة',
          stage: data.stage || 'المرحلة الابتدائية'
        });
        
        setStats({
          classesCount: data.stats?.my_classes || 0,
          studentsCount: data.stats?.my_students || 0,
          stage: data.stage || 'الابتدائية'
        });
        
        // Transform today's schedule to lessons
        const lessons = (data.today_schedule || []).map((lesson, idx) => ({
          id: lesson.session_id || lesson.id || `lesson-${idx}`,
          schedule_session_id: lesson.schedule_session_id || lesson.id,
          subject: lesson.subject || lesson.subject_name || 'مادة',
          className: lesson.class_name || 'فصل',
          classId: lesson.class_id,
          subjectId: lesson.subject_id,
          time: lesson.time || lesson.start_time || `${8 + idx}:00`,
          endTime: lesson.end_time || `${9 + idx}:00`,
          period: lesson.period || lesson.slot_number || idx + 1
        }));
        
        setTodayLessons(lessons);
      } else {
        // Set defaults
        setTeacherInfo({
          name: user?.full_name || 'معلم',
          school: 'المدرسة',
          stage: 'المرحلة'
        });
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, teacherId, user]);

  useEffect(() => {
    fetchTeacherData();
    
    // Refresh every minute to update lesson status
    const interval = setInterval(fetchTeacherData, 60000);
    return () => clearInterval(interval);
  }, [fetchTeacherData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeacherData();
  };

  const handleStartClass = (lesson) => {
    // Store lesson data in sessionStorage for backup
    const lessonData = {
      lesson,
      schedule_session_id: lesson.schedule_session_id,
      class_id: lesson.classId,
      subject_id: lesson.subjectId
    };
    sessionStorage.setItem('current_lesson', JSON.stringify(lessonData));
    
    // Navigate to session page with lesson info
    navigate('/teacher/session/start', { state: lessonData });
  };

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-brand-turquoise/10">
            <Loader2 className="h-5 w-5 animate-spin text-brand-turquoise" />
          </div>
        )}

        <div className="p-4 space-y-4 max-w-lg mx-auto">
          
          {/* Teacher Info Card - بطاقة معلومات المعلم */}
          <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-white/30">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-brand-turquoise text-white text-lg font-bold">
                      {teacherInfo?.name?.charAt(0) || 'م'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-cairo text-lg font-bold">
                      الأستاذ {teacherInfo?.name}
                    </h1>
                    <p className="text-white/80 text-sm">
                      {teacherInfo?.school}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Date */}
              <div className="text-center py-2 border-t border-white/20">
                <p className="font-cairo text-white/90">
                  {getCurrentHijriDate()}
                </p>
              </div>

              {/* Quick Stats - مؤشرات سريعة */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur">
                  <BookOpen className="h-6 w-6 mx-auto mb-1 text-brand-turquoise" />
                  <div className="text-xl font-bold">{loading ? '-' : stats.classesCount}</div>
                  <div className="text-xs text-white/70">عدد الفصول</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur">
                  <Users className="h-6 w-6 mx-auto mb-1 text-brand-turquoise" />
                  <div className="text-xl font-bold">{loading ? '-' : stats.studentsCount}</div>
                  <div className="text-xs text-white/70">عدد الطلاب</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur">
                  <GraduationCap className="h-6 w-6 mx-auto mb-1 text-brand-turquoise" />
                  <div className="text-sm font-bold mt-1">{stats.stage || 'الابتدائية'}</div>
                  <div className="text-xs text-white/70">المرحلة</div>
                </div>
              </div>

              {/* View Schedule Button - زر عرض الجدول */}
              <Button 
                className="w-full mt-4 bg-brand-turquoise hover:bg-brand-turquoise/90 text-white"
                onClick={() => navigate('/teacher/schedule')}
              >
                <Calendar className="h-4 w-4 me-2" />
                عرض الجدول
              </Button>
            </CardContent>
          </Card>

          {/* Today's Lessons - حصص اليوم */}
          <div>
            <h2 className="font-cairo font-bold text-lg text-brand-navy mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-turquoise" />
              حصص اليوم
              {todayLessons.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {todayLessons.length}
                </Badge>
              )}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
              </div>
            ) : todayLessons.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">لا توجد حصص اليوم</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayLessons.map((lesson, index) => {
                  const timeStatus = getTimeUntilLesson(lesson.time);
                  const isFirstLesson = index === 0;
                  const isCurrentLesson = isFirstLesson && timeStatus?.status !== 'ended';
                  const isEnded = timeStatus?.status === 'ended';
                  // White text for colored cards (green for first, blue for others, unless ended)
                  const isWhiteText = !isEnded;
                  
                  // Inline style for gradient background
                  const cardBackground = isEnded 
                    ? {} 
                    : isFirstLesson 
                      ? { background: 'linear-gradient(to bottom right, #10b981, #059669)' }
                      : { background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)' };
                  
                  return (
                    <div 
                      key={lesson.id}
                      className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                        isEnded ? 'bg-gray-100 border border-gray-300 opacity-60' : 'shadow-lg'
                      }`}
                      style={cardBackground}
                      data-testid={`lesson-card-${lesson.id}`}
                    >
                      <div className="p-5">
                        {/* Status Badge - Top Right */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {isFirstLesson && timeStatus?.status !== 'ended' ? (
                              <Badge className="bg-white/20 text-white border-0 animate-pulse">
                                الحصة الحالية
                              </Badge>
                            ) : !isFirstLesson && timeStatus?.status !== 'ended' ? (
                              <Badge className="bg-white/20 text-white border-0">
                                الحصة القادمة
                              </Badge>
                            ) : null}
                          </div>
                          <div className={`flex items-center gap-1 ${isWhiteText ? 'text-white' : 'text-muted-foreground'}`}>
                            <Clock className="h-4 w-4" />
                            <span className="font-mono font-bold">{lesson.time}</span>
                          </div>
                        </div>

                        {/* Lesson Info */}
                        <div className="text-right mb-4">
                          <h3 className={`font-cairo font-bold text-2xl ${isWhiteText ? 'text-white' : 'text-brand-navy'}`}>
                            {lesson.subject}
                          </h3>
                          <p className={`text-sm ${isWhiteText ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {lesson.className} • الحصة {lesson.period}
                          </p>
                        </div>

                        {/* Start Class Button - زر ابدأ الحصة */}
                        {timeStatus?.status !== 'ended' && (
                          <Button 
                            className={`w-full h-14 text-lg font-bold rounded-xl transition-all ${
                              isWhiteText
                                ? 'bg-white text-brand-navy hover:bg-white/90 shadow-lg'
                                : 'bg-brand-navy text-white hover:bg-brand-navy/90'
                            }`}
                            onClick={() => handleStartClass(lesson)}
                            data-testid={`start-class-btn-${lesson.id}`}
                          >
                            <Play className="h-6 w-6 me-2" />
                            ابدأ الحصة
                          </Button>
                        )}
                        
                        {/* Manage Lesson Button for upcoming */}
                        {!isCurrentLesson && timeStatus?.status !== 'ended' && index > 0 && (
                          <Button 
                            variant="ghost"
                            className={`w-full mt-2 ${isWhiteText ? 'text-white/80 hover:text-white hover:bg-white/10' : ''}`}
                            onClick={() => navigate('/teacher/schedule')}
                          >
                            إدارة الدرس
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 border-2"
              onClick={() => navigate('/teacher/classes')}
            >
              <BookOpen className="h-5 w-5 text-brand-navy" />
              <span className="text-sm">فصولي</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 border-2"
              onClick={() => navigate('/teacher/students')}
            >
              <Users className="h-5 w-5 text-brand-navy" />
              <span className="text-sm">طلابي</span>
            </Button>
          </div>

        </div>
      </div>
      <HakimAssistant />
    </TeacherLayout>
  );
}
