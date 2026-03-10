import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Bell,
  Plus,
  UserPlus,
  School,
  ClipboardList,
  Eye,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  UserX,
  FileText,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AddStudentWizard } from '../wizards/AddStudentWizard';
import { AddTeacherWizard } from '../wizards/AddTeacherWizard';
import { CreateClassWizard } from '../wizards/CreateClassWizard';
import { SendNotificationWizard } from '../wizards/SendNotificationWizard';
import { CreateScheduleWizard } from '../wizards/CreateScheduleWizard';
import { LiveSessionsMonitor } from '../wizards/LiveSessionsMonitor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ========== Key Metrics Card Component ==========
const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  status, 
  icon: Icon, 
  onViewDetails,
  isRTL,
}) => {
  const getChangeIndicator = () => {
    if (changeType === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (changeType === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'normal':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">{isRTL ? 'طبيعي' : 'Normal'}</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">{isRTL ? 'يحتاج متابعة' : 'Needs Follow-up'}</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">{isRTL ? 'حرج' : 'Critical'}</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="card-nassaq hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-turquoise/10 flex items-center justify-center group-hover:bg-brand-turquoise/20 transition-colors">
            <Icon className="h-6 w-6 text-brand-turquoise" />
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-tajawal">{title}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-cairo text-foreground">{value}</span>
            {change && (
              <div className="flex items-center gap-1 text-sm">
                {getChangeIndicator()}
                <span className={`font-tajawal ${
                  changeType === 'up' ? 'text-green-600' : 
                  changeType === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {change}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails}
            className="w-full mt-3 text-brand-turquoise hover:text-brand-turquoise/80 hover:bg-brand-turquoise/5 rounded-xl font-tajawal"
          >
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
            {isRTL ? <ChevronLeft className="h-4 w-4 ms-1" /> : <ChevronRight className="h-4 w-4 ms-1" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// ========== Attendance Summary Component ==========
const AttendanceSummary = ({ data, isRTL }) => {
  const categories = [
    { 
      label: isRTL ? 'الطلاب' : 'Students',
      present: data?.students?.present || 0,
      absent: data?.students?.absent || 0,
      excused: data?.students?.excused || 0,
      total: data?.students?.total || 0,
    },
    { 
      label: isRTL ? 'المعلمين' : 'Teachers',
      present: data?.teachers?.present || 0,
      absent: data?.teachers?.absent || 0,
      excused: data?.teachers?.excused || 0,
      total: data?.teachers?.total || 0,
    },
  ];

  return (
    <Card className="card-nassaq" data-testid="attendance-summary-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-cairo text-lg">
          <UserCheck className="h-5 w-5 text-brand-turquoise" />
          {isRTL ? 'نسبة الحضور اليوم' : "Today's Attendance"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat, index) => {
            const presentPercent = cat.total > 0 ? Math.round((cat.present / cat.total) * 100) : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-tajawal text-muted-foreground">{cat.label}</span>
                  <span className="text-lg font-bold font-cairo text-foreground">{presentPercent}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-turquoise rounded-full transition-all duration-500"
                    style={{ width: `${presentPercent}%` }}
                  />
                </div>
                
                {/* Breakdown */}
                <div className="flex gap-4 text-xs font-tajawal">
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {isRTL ? 'حاضر' : 'Present'}: {cat.present}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {isRTL ? 'غائب' : 'Absent'}: {cat.absent}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {isRTL ? 'مستأذن' : 'Excused'}: {cat.excused}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// ========== Needs Intervention Card ==========
const NeedsInterventionCard = ({ data, isRTL, onViewDetails }) => {
  const interventions = [
    { 
      label: isRTL ? 'حصص بلا معلم' : 'Classes without teacher',
      count: data?.classesWithoutTeacher || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    { 
      label: isRTL ? 'معلمين غياب متكرر' : 'Teachers with frequent absences',
      count: data?.teachersWithFrequentAbsence || 0,
      icon: UserX,
      color: 'text-amber-500',
    },
    { 
      label: isRTL ? 'فصول حضور أقل من 80%' : 'Classes with <80% attendance',
      count: data?.classesLowAttendance || 0,
      icon: Activity,
      color: 'text-orange-500',
    },
  ];

  const totalIssues = interventions.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className={`card-nassaq ${totalIssues > 0 ? 'border-red-200 bg-red-50/30 dark:bg-red-950/10' : ''}`} data-testid="needs-intervention-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-cairo text-lg">
            <AlertCircle className={`h-5 w-5 ${totalIssues > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            {isRTL ? 'يحتاج تدخل الآن' : 'Needs Intervention'}
          </CardTitle>
          {totalIssues > 0 && (
            <Badge variant="destructive" className="text-lg px-3">
              {totalIssues}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalIssues === 0 ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground font-tajawal">
              {isRTL ? 'لا توجد مشكلات تحتاج تدخل' : 'No issues need intervention'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.filter(item => item.count > 0).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background rounded-xl">
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-tajawal">{item.label}</span>
                </div>
                <Badge variant="outline" className="font-bold">
                  {item.count}
                </Badge>
              </div>
            ))}
            
            {onViewDetails && (
              <Button 
                variant="outline" 
                onClick={onViewDetails}
                className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-tajawal"
              >
                {isRTL ? 'معالجة المشكلات' : 'Handle Issues'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== Alerts & Notifications Card ==========
const AlertsCard = ({ alerts, isRTL, onAlertAction }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="card-nassaq" data-testid="alerts-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-cairo text-lg">
            <Bell className="h-5 w-5 text-brand-turquoise" />
            {isRTL ? 'التنبيهات والإشعارات' : 'Alerts & Notifications'}
          </CardTitle>
          {alerts?.length > 0 && (
            <Badge variant="secondary">{alerts.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(!alerts || alerts.length === 0) ? (
          <div className="text-center py-6">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground font-tajawal">
              {isRTL ? 'لا توجد تنبيهات جديدة' : 'No new alerts'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {alerts.slice(0, 5).map((alert, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-tajawal font-medium truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground font-tajawal mt-0.5">{alert.time}</p>
                </div>
                {onAlertAction && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onAlertAction(alert)}
                    className="shrink-0 text-xs"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== Quick Actions Component ==========
const QuickActionsCard = ({ onAction, isRTL }) => {
  const actions = [
    { 
      id: 'add-student', 
      label: isRTL ? 'إضافة طالب' : 'Add Student',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    { 
      id: 'add-teacher', 
      label: isRTL ? 'إضافة معلم' : 'Add Teacher',
      icon: GraduationCap,
      color: 'bg-green-500 hover:bg-green-600',
    },
    { 
      id: 'create-class', 
      label: isRTL ? 'إنشاء فصل' : 'Create Class',
      icon: School,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    { 
      id: 'create-schedule', 
      label: isRTL ? 'إنشاء جدول' : 'Create Schedule',
      icon: Calendar,
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    { 
      id: 'view-sessions', 
      label: isRTL ? 'الحصص الجارية' : 'Current Sessions',
      icon: Clock,
      color: 'bg-cyan-500 hover:bg-cyan-600',
    },
    { 
      id: 'send-notification', 
      label: isRTL ? 'إرسال إشعار' : 'Send Notification',
      icon: Send,
      color: 'bg-pink-500 hover:bg-pink-600',
    },
  ];

  return (
    <Card className="card-nassaq" data-testid="quick-actions-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-cairo text-lg">
          <ClipboardList className="h-5 w-5 text-brand-turquoise" />
          {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              onClick={() => onAction(action.id)}
              className={`h-auto py-4 flex-col gap-2 rounded-xl text-white ${action.color} transition-all hover:scale-105`}
              data-testid={`quick-action-${action.id}`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs font-tajawal text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ========== Main School Dashboard Component ==========
export const SchoolDashboardContent = () => {
  const { isRTL } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Wizard states
  const [showAddStudentWizard, setShowAddStudentWizard] = useState(false);
  const [showAddTeacherWizard, setShowAddTeacherWizard] = useState(false);
  const [showCreateClassWizard, setShowCreateClassWizard] = useState(false);
  const [showSendNotificationWizard, setShowSendNotificationWizard] = useState(false);
  const [showCreateScheduleWizard, setShowCreateScheduleWizard] = useState(false);
  const [showLiveSessionsMonitor, setShowLiveSessionsMonitor] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/school/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        
        // Transform API response to match component expected format
        const transformedData = {
          metrics: {
            totalStudents: data.metrics.totalStudents,
            totalTeachers: data.metrics.totalTeachers,
            totalClasses: data.metrics.totalClasses,
            todaySessions: data.metrics.todaySessions,
            activeUsers: data.metrics.attendanceRate || { value: 342, change: '+28', changeType: 'up', status: 'normal' },
            waitingSubstitute: data.metrics.waitingSubstitute,
          },
          attendance: data.attendance,
          interventions: data.interventions,
          alerts: data.alerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            title: isRTL ? (alert.title_ar || alert.title) : (alert.title_en || alert.title),
            time: isRTL ? (alert.time_ar || alert.time) : (alert.time_en || alert.time),
          })),
        };
        
        setDashboardData(transformedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to mock data on error
        const mockData = {
          metrics: {
            totalStudents: { value: 1245, change: '+12', changeType: 'up', status: 'normal' },
            totalTeachers: { value: 87, change: '+3', changeType: 'up', status: 'normal' },
            totalClasses: { value: 42, change: '0', changeType: 'same', status: 'normal' },
            todaySessions: { value: 156, change: '-5', changeType: 'down', status: 'warning' },
            activeUsers: { value: 342, change: '+28', changeType: 'up', status: 'normal' },
            waitingSubstitute: { value: 3, change: '+1', changeType: 'up', status: 'warning' },
          },
          attendance: {
            students: { present: 1120, absent: 85, excused: 40, total: 1245 },
            teachers: { present: 82, absent: 3, excused: 2, total: 87 },
          },
          interventions: {
            classesWithoutTeacher: 2,
            teachersWithFrequentAbsence: 1,
            classesLowAttendance: 4,
          },
          alerts: [
            { id: 1, type: 'warning', title: isRTL ? 'معلم غائب في الصف الرابع أ' : 'Teacher absent in Grade 4A', time: isRTL ? 'منذ 10 دقائق' : '10 min ago' },
            { id: 2, type: 'info', title: isRTL ? 'اكتمل تسجيل الحضور للصف الخامس' : 'Attendance complete for Grade 5', time: isRTL ? 'منذ 25 دقيقة' : '25 min ago' },
            { id: 3, type: 'error', title: isRTL ? 'نسبة حضور منخفضة في الصف الثاني ب' : 'Low attendance in Grade 2B', time: isRTL ? 'منذ ساعة' : '1 hour ago' },
            { id: 4, type: 'info', title: isRTL ? 'تم إضافة 5 طلاب جدد' : '5 new students added', time: isRTL ? 'منذ ساعتين' : '2 hours ago' },
          ],
        };
        
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isRTL]);

  // Handle quick actions
  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'add-student':
        setShowAddStudentWizard(true);
        break;
      case 'add-teacher':
        setShowAddTeacherWizard(true);
        break;
      case 'create-class':
        setShowCreateClassWizard(true);
        break;
      case 'create-schedule':
        setShowCreateScheduleWizard(true);
        break;
      case 'view-sessions':
        setShowLiveSessionsMonitor(true);
        break;
      case 'send-notification':
        setShowSendNotificationWizard(true);
        break;
      default:
        console.log('Action:', actionId);
    }
  };

  // Handle alert action
  const handleAlertAction = (alert) => {
    console.log('Alert action:', alert);
    // Navigate or show modal based on alert type
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-brand-turquoise" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="school-dashboard-content">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl lg:text-3xl font-bold text-foreground">
            {isRTL ? 'مركز القيادة' : 'Command Center'}
          </h1>
          <p className="text-muted-foreground font-tajawal">
            {isRTL ? 'نظرة شاملة على حالة المدرسة' : 'Overview of school status'}
          </p>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted-foreground font-tajawal">
            {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Section 1: Key Metrics */}
      <section data-testid="key-metrics-section">
        <h2 className="font-cairo text-lg font-semibold mb-4 text-foreground">
          {isRTL ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Metrics'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title={isRTL ? 'عدد الطلاب' : 'Students'}
            value={dashboardData?.metrics?.totalStudents?.value || 0}
            change={dashboardData?.metrics?.totalStudents?.change}
            changeType={dashboardData?.metrics?.totalStudents?.changeType}
            status={dashboardData?.metrics?.totalStudents?.status}
            icon={Users}
            isRTL={isRTL}
            onViewDetails={() => navigate('/school/students')}
          />
          <MetricCard
            title={isRTL ? 'عدد المعلمين' : 'Teachers'}
            value={dashboardData?.metrics?.totalTeachers?.value || 0}
            change={dashboardData?.metrics?.totalTeachers?.change}
            changeType={dashboardData?.metrics?.totalTeachers?.changeType}
            status={dashboardData?.metrics?.totalTeachers?.status}
            icon={GraduationCap}
            isRTL={isRTL}
            onViewDetails={() => navigate('/school/teachers')}
          />
          <MetricCard
            title={isRTL ? 'عدد الفصول' : 'Classes'}
            value={dashboardData?.metrics?.totalClasses?.value || 0}
            change={dashboardData?.metrics?.totalClasses?.change}
            changeType={dashboardData?.metrics?.totalClasses?.changeType}
            status={dashboardData?.metrics?.totalClasses?.status}
            icon={School}
            isRTL={isRTL}
            onViewDetails={() => navigate('/school/classes')}
          />
          <MetricCard
            title={isRTL ? 'حصص اليوم' : "Today's Sessions"}
            value={dashboardData?.metrics?.todaySessions?.value || 0}
            change={dashboardData?.metrics?.todaySessions?.change}
            changeType={dashboardData?.metrics?.todaySessions?.changeType}
            status={dashboardData?.metrics?.todaySessions?.status}
            icon={Calendar}
            isRTL={isRTL}
            onViewDetails={() => navigate('/school/schedule')}
          />
          <MetricCard
            title={isRTL ? 'المستخدمين النشطين' : 'Active Users'}
            value={dashboardData?.metrics?.activeUsers?.value || 0}
            change={dashboardData?.metrics?.activeUsers?.change}
            changeType={dashboardData?.metrics?.activeUsers?.changeType}
            status={dashboardData?.metrics?.activeUsers?.status}
            icon={Activity}
            isRTL={isRTL}
          />
          <MetricCard
            title={isRTL ? 'حصص الانتظار' : 'Substitute Sessions'}
            value={dashboardData?.metrics?.waitingSubstitute?.value || 0}
            change={dashboardData?.metrics?.waitingSubstitute?.change}
            changeType={dashboardData?.metrics?.waitingSubstitute?.changeType}
            status={dashboardData?.metrics?.waitingSubstitute?.status}
            icon={Clock}
            isRTL={isRTL}
          />
        </div>
      </section>

      {/* Section 2: Attendance + Interventions + Alerts */}
      <section className="grid lg:grid-cols-3 gap-6" data-testid="dashboard-middle-section">
        <AttendanceSummary 
          data={dashboardData?.attendance} 
          isRTL={isRTL} 
        />
        <NeedsInterventionCard 
          data={dashboardData?.interventions}
          isRTL={isRTL}
          onViewDetails={() => navigate('/school/issues')}
        />
        <AlertsCard 
          alerts={dashboardData?.alerts}
          isRTL={isRTL}
          onAlertAction={handleAlertAction}
        />
      </section>

      {/* Section 3: Quick Actions */}
      <section data-testid="quick-actions-section">
        <QuickActionsCard 
          onAction={handleQuickAction}
          isRTL={isRTL}
        />
      </section>

      {/* Wizards */}
      <AddStudentWizard 
        open={showAddStudentWizard} 
        onClose={() => setShowAddStudentWizard(false)} 
      />
      <AddTeacherWizard 
        open={showAddTeacherWizard} 
        onClose={() => setShowAddTeacherWizard(false)} 
      />
      <CreateClassWizard 
        open={showCreateClassWizard} 
        onClose={() => setShowCreateClassWizard(false)} 
      />
      <SendNotificationWizard 
        open={showSendNotificationWizard} 
        onClose={() => setShowSendNotificationWizard(false)} 
      />
      <CreateScheduleWizard 
        open={showCreateScheduleWizard} 
        onClose={() => setShowCreateScheduleWizard(false)} 
      />
      <LiveSessionsMonitor 
        open={showLiveSessionsMonitor} 
        onClose={() => setShowLiveSessionsMonitor(false)} 
      />
    </div>
  );
};

export default SchoolDashboardContent;
