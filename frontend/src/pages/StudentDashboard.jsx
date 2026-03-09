import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  BookOpen, Calendar, ClipboardCheck, Bell, GraduationCap,
  Clock, CheckCircle2, AlertCircle, TrendingUp, Award,
  FileText, Target, BarChart3, CalendarDays
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';

// Helper functions
const getCurrentHijriDate = () => {
  const today = new Date();
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return { hijri: hijriFormatter.format(today), gregorian: today.toLocaleDateString('en-GB') };
  } catch (e) {
    return { hijri: 'التاريخ الهجري', gregorian: today.toLocaleDateString() };
  }
};

export default function StudentDashboard() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: 95,
    averageGrade: 88,
    completedAssignments: 12,
    pendingAssignments: 3,
    todayLessons: []
  });
  const [grades, setGrades] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch student's attendance summary
      const [attendanceRes, notificationsRes] = await Promise.all([
        api.get(`/attendance/summary/student/${user?.id}`).catch(() => ({ data: {} })),
        api.get('/notifications?limit=5').catch(() => ({ data: [] }))
      ]);

      const attendanceSummary = attendanceRes.data || {};
      
      setStats({
        attendanceRate: attendanceSummary.attendance_rate || 95,
        averageGrade: 88, // Will be fetched from assessments
        completedAssignments: 12,
        pendingAssignments: 3,
        todayLessons: [
          { time: '07:00', subject: 'الرياضيات', teacher: 'أ. محمد', room: 'غرفة 101' },
          { time: '08:00', subject: 'اللغة العربية', teacher: 'أ. فاطمة', room: 'غرفة 102' },
          { time: '09:00', subject: 'العلوم', teacher: 'أ. خالد', room: 'المختبر' },
          { time: '10:30', subject: 'اللغة الإنجليزية', teacher: 'أ. سارة', room: 'غرفة 103' },
          { time: '11:30', subject: 'التربية الإسلامية', teacher: 'أ. أحمد', room: 'غرفة 104' },
        ]
      });

      setGrades([
        { subject: 'الرياضيات', grade: 92, trend: 'up' },
        { subject: 'اللغة العربية', grade: 88, trend: 'up' },
        { subject: 'العلوم', grade: 85, trend: 'same' },
        { subject: 'اللغة الإنجليزية', grade: 90, trend: 'up' },
      ]);

      setNotifications(notificationsRes.data?.slice?.(0, 5) || [
        { title: 'اختبار الرياضيات غداً', time: 'منذ ساعة', type: 'exam' },
        { title: 'تم رصد درجة اللغة العربية', time: 'منذ 3 ساعات', type: 'grade' },
        { title: 'اجتماع أولياء الأمور', time: 'أمس', type: 'meeting' },
      ]);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }, [api, user?.id]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBg = (grade) => {
    if (grade >= 90) return 'bg-green-100';
    if (grade >= 80) return 'bg-blue-100';
    if (grade >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`flex min-h-screen bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`} data-testid="student-dashboard">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : (isRTL ? 'mr-20' : 'ml-20')}`}>
        <div className="p-6 space-y-6">
          
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-emerald-500 shadow-lg">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-xl font-bold">
                      {user?.full_name?.charAt(0) || 'ط'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-cairo text-xl font-bold text-gray-900">
                      {isRTL ? `مرحباً ${user?.full_name || 'الطالب'}` : `Welcome, ${user?.full_name || 'Student'}`}
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {isRTL ? 'الصف الثالث المتوسط - شعبة أ' : 'Grade 9 - Section A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-emerald-500/10 rounded-xl">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'المعدل العام' : 'GPA'}</p>
                    <p className="font-cairo font-bold text-emerald-600 text-2xl">{stats.averageGrade}%</p>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div className="text-end">
                      <p className="font-cairo text-sm font-bold">{getCurrentHijriDate().hijri}</p>
                      <p className="text-xs text-muted-foreground font-mono">{getCurrentHijriDate().gregorian}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'نسبة الحضور' : 'Attendance'}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.attendanceRate}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <Progress value={stats.attendanceRate} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'المعدل العام' : 'Average Grade'}</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.averageGrade}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Progress value={stats.averageGrade} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'واجبات مكتملة' : 'Completed'}</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.completedAssignments}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'واجبات معلقة' : 'Pending'}</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingAssignments}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-100">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Today's Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-emerald-600" />
                  {isRTL ? 'جدول اليوم' : "Today's Schedule"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.todayLessons.map((lesson, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-10 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                      }`}>
                        <span className="font-bold text-xs">{lesson.time}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lesson.subject}</p>
                        <p className="text-xs text-muted-foreground">{lesson.teacher} • {lesson.room}</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge className="bg-emerald-500 text-xs">{isRTL ? 'الآن' : 'Now'}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grades Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  {isRTL ? 'درجاتي' : 'My Grades'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {grades.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{item.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${getGradeColor(item.grade)}`}>{item.grade}%</span>
                      {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  {isRTL ? 'عرض جميع الدرجات' : 'View All Grades'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-orange-500" />
                {isRTL ? 'الإشعارات والتنبيهات' : 'Notifications'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {notifications.map((notif, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-50 border">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        notif.type === 'exam' ? 'bg-red-100' :
                        notif.type === 'grade' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {notif.type === 'exam' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : notif.type === 'grade' ? (
                          <Award className="h-4 w-4 text-green-600" />
                        ) : (
                          <Calendar className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
