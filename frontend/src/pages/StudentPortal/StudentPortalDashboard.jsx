/**
 * Student Portal - Dashboard Page
 * لوحة تحكم بوابة الطالب
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import PortalLayout from '../../components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  TrendingUp,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Helper function for Hijri date
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

const StudentPortalDashboard = () => {
  const { token, user } = useAuth();
  const { isRTL } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/student-portal/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Set default data if API fails
      setDashboard({
        student: {
          name: user?.full_name || 'طالب',
          grade: 'الصف الأول',
          class_name: 'الفصل أ',
          school_name: 'مدرسة نموذجية'
        },
        today_schedule: [],
        recent_grades: [],
        attendance: { total_days: 0, present: 0, absent: 0, late: 0, rate: 100 },
        average_score: 0,
        unread_notifications: 0,
        current_date: new Date().toISOString().split('T')[0],
        current_day: 'اليوم'
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (percentage >= 75) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  if (loading) {
    return (
      <PortalLayout portalType="student">
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout portalType="student">
      <div className="p-4 space-y-4" data-testid="student-portal-dashboard">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">{getCurrentHijriDate()}</p>
                  <h1 className="text-xl md:text-2xl font-bold font-cairo mt-1">
                    {isRTL ? 'مرحباً' : 'Welcome'}, {dashboard?.student?.name?.split(' ')[0]}
                  </h1>
                  <p className="text-emerald-100 flex items-center gap-2 mt-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {dashboard?.student?.school_name} - {dashboard?.student?.grade} ({dashboard?.student?.class_name})
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex gap-4">
                <div className="text-center px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-2xl font-bold">{dashboard?.attendance?.rate}%</p>
                  <p className="text-xs text-emerald-100">{isRTL ? 'الحضور' : 'Attendance'}</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-2xl font-bold">{dashboard?.average_score}%</p>
                  <p className="text-xs text-emerald-100">{isRTL ? 'المعدل' : 'Average'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xl font-bold text-green-600">{dashboard?.attendance?.rate}%</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'نسبة الحضور' : 'Attendance'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-blue-600">{dashboard?.average_score}%</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'المعدل العام' : 'Average'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-xl font-bold text-amber-600">{dashboard?.attendance?.total_days}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'أيام الدراسة' : 'School Days'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-purple-600">{dashboard?.unread_notifications}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'إشعارات جديدة' : 'Notifications'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Today's Schedule */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  {isRTL ? 'جدول اليوم' : "Today's Schedule"}
                </div>
                <Link to="/student/schedule" className="text-xs text-emerald-600 hover:underline">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {dashboard?.today_schedule?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboard.today_schedule.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          idx === 0
                            ? 'bg-gradient-to-l from-emerald-500 to-emerald-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center ${
                          idx === 0 ? 'bg-white/20' : 'bg-white border'
                        }`}>
                          <span className={`font-bold text-xs ${idx === 0 ? 'text-white' : 'text-emerald-600'}`}>
                            {entry.start_time}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${idx === 0 ? 'text-white' : ''}`}>
                            {entry.subject}
                          </p>
                          <p className={`text-xs truncate ${idx === 0 ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                            {entry.teacher} {entry.room && `- ${entry.room}`}
                          </p>
                        </div>
                        {idx === 0 && (
                          <Badge className="bg-white/20 text-white border-0 text-xs">
                            {isRTL ? 'الآن' : 'Now'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{isRTL ? 'لا توجد حصص اليوم' : 'No classes today'}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  {isRTL ? 'آخر الدرجات' : 'Recent Grades'}
                </div>
                <Link to="/student/grades" className="text-xs text-blue-600 hover:underline">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {dashboard?.recent_grades?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboard.recent_grades.map((grade, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <p className="font-medium text-sm">{grade.subject}</p>
                          </div>
                          <Badge variant="outline" className={getGradeBadgeColor(grade.percentage)}>
                            {grade.score}/{grade.max_score}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{grade.assessment_type}</span>
                          <span>{grade.date}</span>
                        </div>
                        <Progress value={grade.percentage} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{isRTL ? 'لا توجد درجات حتى الآن' : 'No grades yet'}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Summary */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {isRTL ? 'ملخص الحضور' : 'Attendance Summary'}
              </div>
              <Link to="/student/attendance" className="text-xs text-green-600 hover:underline">
                {isRTL ? 'التفاصيل' : 'Details'}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{dashboard?.attendance?.present || 0}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'حاضر' : 'Present'}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-600">{dashboard?.attendance?.absent || 0}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'غائب' : 'Absent'}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold text-amber-600">{dashboard?.attendance?.late || 0}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'متأخر' : 'Late'}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{dashboard?.attendance?.total_days || 0}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الأيام' : 'Total Days'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default StudentPortalDashboard;
