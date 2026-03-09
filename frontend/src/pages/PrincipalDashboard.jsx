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
  Users, Calendar, Bell, GraduationCap, Clock, CheckCircle2,
  AlertCircle, TrendingUp, Award, FileText, BookOpen, Building2,
  UserCheck, UserX, BarChart3, CalendarDays, Settings, Shield,
  ClipboardList, MessageSquare, ChevronRight, Activity
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

export default function PrincipalDashboard() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
    pendingApprovals: 0,
    behaviourAlerts: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);

  const fetchPrincipalData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch school overview stats
      const [
        studentsRes,
        teachersRes,
        classesRes,
        attendanceRes,
        behaviourRes
      ] = await Promise.all([
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/teachers').catch(() => ({ data: [] })),
        api.get('/classes').catch(() => ({ data: [] })),
        api.get(`/attendance/overview?attendance_date=${new Date().toISOString().split('T')[0]}`).catch(() => ({ data: {} })),
        api.get('/behaviour-records?status=pending_review').catch(() => ({ data: [] }))
      ]);

      const students = studentsRes.data || [];
      const teachers = teachersRes.data || [];
      const classes = classesRes.data || [];
      const attendanceData = attendanceRes.data || {};
      const pendingBehaviour = behaviourRes.data?.records || [];

      setStats({
        totalStudents: students.length || 450,
        totalTeachers: teachers.length || 35,
        totalClasses: classes.length || 18,
        todayAttendance: attendanceData.attendance_rate || 94,
        pendingApprovals: 5,
        behaviourAlerts: pendingBehaviour.length || 3
      });

      setAttendanceOverview({
        present: attendanceData.present || 423,
        absent: attendanceData.absent || 18,
        late: attendanceData.late || 9,
        rate: attendanceData.attendance_rate || 94
      });

      setRecentActivities([
        { type: 'attendance', message: 'تقرير حضور اليوم جاهز', time: 'منذ 30 دقيقة', icon: UserCheck },
        { type: 'behaviour', message: 'ملاحظة سلوكية تحتاج مراجعة', time: 'منذ ساعة', icon: AlertCircle },
        { type: 'teacher', message: 'طلب إجازة من المعلم أحمد', time: 'منذ ساعتين', icon: FileText },
        { type: 'academic', message: 'اكتمال رصد درجات الرياضيات', time: 'منذ 3 ساعات', icon: Award },
        { type: 'meeting', message: 'تذكير: اجتماع أولياء الأمور غداً', time: 'أمس', icon: Calendar },
      ]);

      setPendingTasks([
        { title: 'مراجعة ملاحظات سلوكية', count: 3, priority: 'high', path: '/admin/behaviour' },
        { title: 'موافقات طلبات الإجازة', count: 2, priority: 'medium', path: '/admin/requests' },
        { title: 'مراجعة تقارير الأداء', count: 5, priority: 'low', path: '/admin/reports' },
      ]);

    } catch (error) {
      console.error('Error fetching principal data:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchPrincipalData();
  }, [fetchPrincipalData]);

  const quickActions = [
    { icon: Users, label: isRTL ? 'إدارة الطلاب' : 'Students', path: '/admin/students', color: 'bg-blue-500' },
    { icon: GraduationCap, label: isRTL ? 'إدارة المعلمين' : 'Teachers', path: '/admin/teachers', color: 'bg-green-500' },
    { icon: Calendar, label: isRTL ? 'الجدول الدراسي' : 'Schedule', path: '/admin/schedule', color: 'bg-purple-500' },
    { icon: ClipboardList, label: isRTL ? 'تقرير الحضور' : 'Attendance', path: '/admin/attendance', color: 'bg-orange-500' },
    { icon: BarChart3, label: isRTL ? 'التقارير' : 'Reports', path: '/admin/reports', color: 'bg-pink-500' },
    { icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings', path: '/admin/settings', color: 'bg-gray-500' },
  ];

  return (
    <div className={`flex min-h-screen bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`} data-testid="principal-dashboard">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : (isRTL ? 'mr-20' : 'ml-20')}`}>
        <div className="p-6 space-y-6">
          
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-brand-navy/10 via-brand-turquoise/10 to-brand-purple/10 border-brand-navy/20">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-brand-navy shadow-lg">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-navy to-brand-turquoise text-white text-xl font-bold">
                      {user?.full_name?.charAt(0) || 'م'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-cairo text-xl font-bold text-brand-navy">
                      {isRTL ? `مرحباً ${user?.full_name || 'مدير المدرسة'}` : `Welcome, ${user?.full_name || 'Principal'}`}
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {isRTL ? 'لوحة تحكم مدير المدرسة' : 'Principal Dashboard'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Alerts Badge */}
                  {(stats.pendingApprovals > 0 || stats.behaviourAlerts > 0) && (
                    <div className="flex gap-2">
                      {stats.behaviourAlerts > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {stats.behaviourAlerts} {isRTL ? 'تنبيه سلوكي' : 'alerts'}
                        </Badge>
                      )}
                      {stats.pendingApprovals > 0 && (
                        <Badge className="bg-orange-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {stats.pendingApprovals} {isRTL ? 'بانتظار الموافقة' : 'pending'}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-brand-navy" />
                    <div className="text-end">
                      <p className="font-cairo text-sm font-bold text-brand-navy">{getCurrentHijriDate().hijri}</p>
                      <p className="text-xs text-muted-foreground font-mono">{getCurrentHijriDate().gregorian}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-accent transition-all border-2 hover:border-brand-turquoise"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-2 rounded-full ${action.color}`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-xs">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/students')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الطلاب' : 'Total Students'}</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/teachers')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'المعلمون' : 'Teachers'}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalTeachers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/classes')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'الفصول' : 'Classes'}</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalClasses}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/attendance')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'حضور اليوم' : "Today's Attendance"}</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.todayAttendance}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-100">
                    <UserCheck className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <Progress value={stats.todayAttendance} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Attendance Overview - Takes 2 columns */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-brand-turquoise" />
                  {isRTL ? 'نظرة عامة على الحضور اليوم' : "Today's Attendance Overview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceOverview && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <UserCheck className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-600">{attendanceOverview.present}</p>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'حاضر' : 'Present'}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                      <UserX className="h-8 w-8 mx-auto text-red-600 mb-2" />
                      <p className="text-2xl font-bold text-red-600">{attendanceOverview.absent}</p>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'غائب' : 'Absent'}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold text-yellow-600">{attendanceOverview.late}</p>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'متأخر' : 'Late'}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{attendanceOverview.rate}%</p>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'النسبة' : 'Rate'}</p>
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/attendance')}>
                  {isRTL ? 'عرض تقرير الحضور الكامل' : 'View Full Attendance Report'}
                </Button>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-orange-500" />
                  {isRTL ? 'مهام تحتاج اهتمامك' : 'Tasks Requiring Attention'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent ${
                      task.priority === 'high' ? 'border-red-300 bg-red-50' :
                      task.priority === 'medium' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => navigate(task.path)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                        {task.count}
                      </Badge>
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-brand-purple" />
                {isRTL ? 'آخر النشاطات' : 'Recent Activities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'attendance' ? 'bg-green-100' :
                      activity.type === 'behaviour' ? 'bg-red-100' :
                      activity.type === 'teacher' ? 'bg-blue-100' :
                      activity.type === 'academic' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.type === 'attendance' ? 'text-green-600' :
                        activity.type === 'behaviour' ? 'text-red-600' :
                        activity.type === 'teacher' ? 'text-blue-600' :
                        activity.type === 'academic' ? 'text-purple-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
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
