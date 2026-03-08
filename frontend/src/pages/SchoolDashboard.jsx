import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  GraduationCap,
  UserCheck,
  BookOpen,
  Calendar,
  TrendingUp,
  Sun,
  Moon,
  Globe,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const SchoolDashboard = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: isRTL ? 'إجمالي الطلاب' : 'Total Students',
      value: stats?.total_students || 0,
      icon: GraduationCap,
      color: 'brand-turquoise',
      trend: '+5%',
    },
    {
      title: isRTL ? 'إجمالي المعلمين' : 'Total Teachers',
      value: stats?.total_teachers || 0,
      icon: UserCheck,
      color: 'brand-navy',
      trend: '+2%',
    },
    {
      title: isRTL ? 'الفصول' : 'Classes',
      value: 24,
      icon: BookOpen,
      color: 'brand-purple',
      trend: '0%',
    },
    {
      title: isRTL ? 'الحصص اليوم' : 'Classes Today',
      value: 48,
      icon: Calendar,
      color: 'green-500',
      trend: '+12%',
    },
  ];

  const quickActions = [
    { icon: GraduationCap, label: isRTL ? 'إضافة طالب' : 'Add Student', color: 'brand-turquoise' },
    { icon: UserCheck, label: isRTL ? 'إضافة معلم' : 'Add Teacher', color: 'brand-navy' },
    { icon: BookOpen, label: isRTL ? 'إنشاء فصل' : 'Create Class', color: 'brand-purple' },
    { icon: Calendar, label: isRTL ? 'جدول الحصص' : 'Schedule', color: 'green-500' },
  ];

  const recentActivities = [
    {
      icon: CheckCircle,
      title: isRTL ? 'تم تسجيل حضور الفصل 3-أ' : 'Attendance recorded for Class 3-A',
      time: isRTL ? 'منذ 5 دقائق' : '5 mins ago',
      color: 'green-500',
    },
    {
      icon: GraduationCap,
      title: isRTL ? 'تم إضافة طالب جديد' : 'New student added',
      time: isRTL ? 'منذ ساعة' : '1 hour ago',
      color: 'brand-turquoise',
    },
    {
      icon: AlertTriangle,
      title: isRTL ? 'تنبيه: موعد الاختبارات قريب' : 'Alert: Exams approaching',
      time: isRTL ? 'منذ ساعتين' : '2 hours ago',
      color: 'yellow-500',
    },
    {
      icon: Clock,
      title: isRTL ? 'تم تحديث جدول الحصص' : 'Schedule updated',
      time: isRTL ? 'منذ 3 ساعات' : '3 hours ago',
      color: 'brand-navy',
    },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen" data-testid="school-dashboard">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold">
                {isRTL ? 'لوحة تحكم المدرسة' : 'School Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? `مرحباً، ${user?.full_name}` : `Welcome, ${user?.full_name}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage}>
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="card-nassaq" data-testid={`stat-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>{stat.trend}</span>
                      </div>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center`}>
                      <stat.icon className={`h-7 w-7 text-${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="card-nassaq lg:col-span-1" data-testid="quick-actions-card">
              <CardHeader>
                <CardTitle className="font-cairo">
                  {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl hover:border-brand-turquoise hover:bg-brand-turquoise/5"
                      data-testid={`quick-action-${index}`}
                    >
                      <action.icon className={`h-6 w-6 text-${action.color}`} />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-nassaq lg:col-span-2" data-testid="recent-activity-card">
              <CardHeader>
                <CardTitle className="font-cairo">
                  {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'آخر التحديثات والأحداث' : 'Latest updates and events'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-${activity.color}/10 flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-5 w-5 text-${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Overview */}
          <Card className="card-nassaq" data-testid="attendance-overview-card">
            <CardHeader>
              <CardTitle className="font-cairo">
                {isRTL ? 'نظرة عامة على الحضور' : 'Attendance Overview'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إحصائيات الحضور لهذا الأسبوع' : 'Attendance statistics for this week'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2 justify-center">
                {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-brand-turquoise/60 rounded-t transition-all hover:bg-brand-turquoise"
                      style={{ height: `${[85, 92, 88, 95, 78][i]}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{isRTL ? day : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'][i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
