import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Plus,
  Sun,
  Moon,
  Globe,
  Activity,
  BarChart3,
  Brain,
  FileText,
  Zap,
  Download,
  Shield,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileSearch,
  Sparkles,
  Calendar,
  Settings,
  UserPlus,
  BookOpen,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Play,
  AlertCircle,
  MessageSquare,
  Send,
  Lightbulb,
  Target,
  Gauge,
  Server,
  Bot,
  Wand2,
  LayoutGrid,
  LayoutList,
  Maximize2,
  GripVertical,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Hakim Avatar
const HAKIM_AVATAR = 'https://customer-assets.emergentagent.com/job_nassaq-school/artifacts/mtvfci3y_HAKIM%201.png';

// Countries & Cities
const COUNTRIES = [
  { code: 'SA', name: 'المملكة العربية السعودية', name_en: 'Saudi Arabia' },
  { code: 'AE', name: 'الإمارات العربية المتحدة', name_en: 'UAE' },
  { code: 'KW', name: 'الكويت', name_en: 'Kuwait' },
  { code: 'QA', name: 'قطر', name_en: 'Qatar' },
  { code: 'EG', name: 'مصر', name_en: 'Egypt' },
];

const SAUDI_CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'تبوك'];

const SCHOOL_STAGES = [
  { value: 'kindergarten', label: 'رياض الأطفال', label_en: 'Kindergarten' },
  { value: 'primary', label: 'ابتدائي', label_en: 'Primary' },
  { value: 'middle', label: 'متوسط', label_en: 'Middle' },
  { value: 'high', label: 'ثانوي', label_en: 'High School' },
];

// Sample chart data
const sampleChartData = [
  { time: '6:00', students: 120, teachers: 45 },
  { time: '7:00', students: 450, teachers: 180 },
  { time: '8:00', students: 2800, teachers: 520 },
  { time: '9:00', students: 3500, teachers: 680 },
  { time: '10:00', students: 3200, teachers: 650 },
  { time: '11:00', students: 2900, teachers: 600 },
  { time: '12:00', students: 2100, teachers: 480 },
  { time: '13:00', students: 1500, teachers: 350 },
  { time: '14:00', students: 800, teachers: 200 },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const chatContainerRef = useRef(null);
  
  // States
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSchoolWizard, setShowAddSchoolWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid, compact, expanded
  const [sectionsOrder, setSectionsOrder] = useState(['analytics', 'quickActions', 'activity', 'aiOps', 'hakim']);
  
  // Wizard Data
  const [schoolData, setSchoolData] = useState({
    name: '', name_en: '', country: 'SA', city: '', address: '',
    language: 'ar', calendar_system: 'hijri_gregorian', school_type: 'public', stage: 'primary',
    principal_name: '', principal_email: '', principal_phone: '',
  });
  const [createdSchool, setCreatedSchool] = useState(null);

  // AI Operations
  const [aiOperationsToday, setAiOperationsToday] = useState(0);

  // Global Filters State
  const [filters, setFilters] = useState({
    scope: 'all', // all, single, multi
    selectedSchool: '',
    selectedSchools: [],
    city: '',
    schoolType: '',
    timeWindow: 'today', // live, today, week, month, custom
    customDateFrom: '',
    customDateTo: '',
    tenantStatus: 'all', // all, active, suspended, setup, expired
  });
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [visibleCards, setVisibleCards] = useState({
    schools: true, students: true, teachers: true, admins: true, activeUsers: true, apiCalls: true
  });
  const [schools, setSchools] = useState([]);

  // Hakim Chat
  const [hakimMessages, setHakimMessages] = useState([
    { id: 1, role: 'assistant', content: isRTL ? 'مرحباً! أنا حكيم، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am Hakim, your AI assistant. How can I help you today?' }
  ]);
  const [hakimInput, setHakimInput] = useState('');
  const [hakimLoading, setHakimLoading] = useState(false);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      // Use mock data
      setStats({
        total_schools: 202, active_schools: 185, suspended_schools: 10, pending_schools: 7,
        total_students: 50000, active_students: 48500, new_students_this_month: 1200,
        total_teachers: 3062, active_teachers: 2980, new_teachers_this_month: 85,
        total_admins: 245, active_users_today: 12500, api_calls_today: 45000,
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Wizard handlers
  const handleNextStep = () => {
    if (wizardStep === 1 && (!schoolData.name || !schoolData.city)) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    if (wizardStep === 3 && (!schoolData.principal_name || !schoolData.principal_email)) {
      toast.error(isRTL ? 'يرجى ملء بيانات مدير المدرسة' : 'Please fill principal information');
      return;
    }
    setWizardStep(prev => prev + 1);
  };

  const handleCreateSchool = async () => {
    try {
      const response = await api.post('/schools', schoolData);
      setCreatedSchool(response.data);
      setWizardStep(5);
      toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School created successfully!');
      fetchStats();
    } catch (error) {
      toast.error(isRTL ? 'فشل إنشاء المدرسة' : 'Failed to create school');
    }
  };

  // AI Operations Handler
  const handleAiOperation = async (operation) => {
    toast.success(isRTL ? `جاري تشغيل: ${operation}` : `Running: ${operation}`);
    setAiOperationsToday(prev => prev + 1);
    // Simulate operation
    setTimeout(() => {
      toast.success(isRTL ? 'تم التشغيل بنجاح' : 'Operation completed');
    }, 2000);
  };

  // Hakim Chat Handler
  const handleSendToHakim = () => {
    if (!hakimInput.trim()) return;
    
    const userMessage = { id: Date.now(), role: 'user', content: hakimInput };
    setHakimMessages(prev => [...prev, userMessage]);
    setHakimInput('');
    setHakimLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = isRTL ? [
        'تم تحليل طلبك. يبدو أن لديك استفسار حول النظام.',
        'أستطيع مساعدتك في ذلك. اسمح لي بالتحقق من البيانات.',
        'بناءً على تحليل البيانات، أقترح عليك مراجعة لوحة التحليلات.',
      ] : [
        'I have analyzed your request. It seems you have a query about the system.',
        'I can help you with that. Let me check the data.',
        'Based on data analysis, I suggest reviewing the analytics dashboard.',
      ];
      const aiResponse = { id: Date.now() + 1, role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)] };
      setHakimMessages(prev => [...prev, aiResponse]);
      setHakimLoading(false);
    }, 1500);
  };

  // Quick Actions
  const quickActions = [
    { icon: Plus, label: isRTL ? 'إضافة مدرسة' : 'Add School', color: 'bg-brand-navy', action: () => setShowAddSchoolWizard(true) },
    { icon: UserPlus, label: isRTL ? 'إضافة مستخدم' : 'Add User', color: 'bg-brand-turquoise', action: () => navigate('/admin/users') },
    { icon: FileText, label: isRTL ? 'تقرير جديد' : 'New Report', color: 'bg-brand-purple', action: () => navigate('/admin/reports') },
    { icon: MessageSquare, label: isRTL ? 'إرسال إشعار' : 'Send Notice', color: 'bg-orange-500', action: () => navigate('/notifications') },
    { icon: BookOpen, label: isRTL ? 'إدارة القواعد' : 'Manage Rules', color: 'bg-green-600', action: () => navigate('/admin/rules') },
    { icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings', color: 'bg-gray-600', action: () => navigate('/settings') },
  ];

  // AI Operations
  const aiOperations = [
    { id: 'diagnosis', icon: Gauge, title: isRTL ? 'تشخيص النظام' : 'System Diagnosis', desc: isRTL ? 'فحص شامل للنظام' : 'Full system scan' },
    { id: 'data_quality', icon: Shield, title: isRTL ? 'جودة البيانات' : 'Data Quality', desc: isRTL ? 'فحص سلامة البيانات' : 'Data integrity check' },
    { id: 'tenant_health', icon: Building2, title: isRTL ? 'صحة المدارس' : 'Tenant Health', desc: isRTL ? 'تحليل أداء المدارس' : 'Schools performance' },
    { id: 'executive_summary', icon: FileText, title: isRTL ? 'ملخص تنفيذي' : 'Executive Summary', desc: isRTL ? 'تقرير شامل' : 'Comprehensive report' },
  ];

  // Render Analytics Card
  const renderAnalyticsCard = (icon, title, mainValue, secondaryData, actionLabel, actionFn, color = 'brand-navy') => (
    <Card className="card-nassaq hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
            {icon}
          </div>
          <Button 
            size="sm" 
            onClick={actionFn}
            className="bg-brand-turquoise hover:bg-brand-turquoise/90 text-white rounded-lg text-xs px-3"
          >
            {actionLabel}
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-3xl font-bold">{mainValue?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {secondaryData?.map((item, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className={`text-xs ${item.color || 'bg-muted/50'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor || 'bg-gray-400'} me-1.5`}></span>
                {item.label}: {item.value ?? 0}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-turquoise" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="admin-dashboard">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'مركز القيادة' : 'Command Center'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'لوحة تحكم مدير المنصة' : 'Platform Admin Dashboard'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg h-8 w-8 p-0"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'compact' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg h-8 w-8 p-0"
                  onClick={() => setViewMode('compact')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'expanded' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg h-8 w-8 p-0"
                  onClick={() => setViewMode('expanded')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Section 1: Analytics Cards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cairo text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'المؤشرات العامة للمنصة' : 'Platform Analytics'}
              </h2>
              <Button variant="ghost" size="sm" onClick={fetchStats}>
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
            
            <div className={`grid gap-4 ${
              viewMode === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' :
              viewMode === 'expanded' ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {renderAnalyticsCard(
                <Building2 className="h-6 w-6 text-brand-navy" />,
                isRTL ? 'المدارس المسجلة' : 'Registered Schools',
                stats?.total_schools,
                [
                  { label: isRTL ? 'نشطة' : 'Active', value: stats?.active_schools, dotColor: 'bg-green-500' },
                  { label: isRTL ? 'موقوفة' : 'Suspended', value: stats?.suspended_schools, dotColor: 'bg-red-500' },
                  { label: isRTL ? 'معلقة' : 'Pending', value: stats?.pending_schools, dotColor: 'bg-yellow-500' },
                ],
                isRTL ? 'إضافة' : 'Add',
                () => setShowAddSchoolWizard(true)
              )}

              {renderAnalyticsCard(
                <GraduationCap className="h-6 w-6 text-brand-turquoise" />,
                isRTL ? 'الطلاب المسجلين' : 'Enrolled Students',
                stats?.total_students,
                [
                  { label: isRTL ? 'نشط' : 'Active', value: stats?.active_students?.toLocaleString(), dotColor: 'bg-green-500' },
                  { label: isRTL ? 'جديد' : 'New', value: `+${stats?.new_students_this_month}`, dotColor: 'bg-blue-500' },
                ],
                isRTL ? 'عرض' : 'View',
                () => navigate('/admin/reports')
              )}

              {renderAnalyticsCard(
                <UserCheck className="h-6 w-6 text-brand-purple" />,
                isRTL ? 'المعلمين' : 'Teachers',
                stats?.total_teachers,
                [
                  { label: isRTL ? 'نشط' : 'Active', value: stats?.active_teachers?.toLocaleString(), dotColor: 'bg-green-500' },
                  { label: isRTL ? 'جديد' : 'New', value: `+${stats?.new_teachers_this_month}`, dotColor: 'bg-blue-500' },
                ],
                isRTL ? 'عرض' : 'View',
                () => navigate('/admin/users')
              )}

              {renderAnalyticsCard(
                <Users className="h-6 w-6 text-orange-500" />,
                isRTL ? 'المسؤولين' : 'Administrators',
                stats?.total_admins,
                [
                  { label: isRTL ? 'مدراء' : 'Principals', value: 200, dotColor: 'bg-purple-500' },
                  { label: isRTL ? 'منصة' : 'Platform', value: 45, dotColor: 'bg-blue-500' },
                ],
                isRTL ? 'إدارة' : 'Manage',
                () => navigate('/admin/users')
              )}

              {renderAnalyticsCard(
                <Activity className="h-6 w-6 text-green-500" />,
                isRTL ? 'المستخدمين النشطين' : 'Active Users Today',
                stats?.active_users_today,
                [
                  { label: isRTL ? 'طلاب' : 'Students', value: '10.2K', dotColor: 'bg-green-500' },
                  { label: isRTL ? 'معلمين' : 'Teachers', value: '2.1K', dotColor: 'bg-blue-500' },
                ],
                isRTL ? 'تفاصيل' : 'Details',
                () => navigate('/admin/monitoring')
              )}

              {renderAnalyticsCard(
                <Server className="h-6 w-6 text-teal-500" />,
                isRTL ? 'طلبات API اليوم' : 'API Requests Today',
                stats?.api_calls_today,
                [
                  { label: isRTL ? 'نجاح' : 'Success', value: '99.8%', dotColor: 'bg-green-500' },
                  { label: isRTL ? 'متوسط' : 'Avg', value: '45ms', dotColor: 'bg-blue-500' },
                ],
                isRTL ? 'مراقبة' : 'Monitor',
                () => navigate('/admin/monitoring')
              )}
            </div>
          </section>

          {/* Section 2: Quick Actions (Swapped with Activity) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cairo text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-brand-turquoise transition-all"
                  onClick={action.action}
                  data-testid={`quick-action-${index}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </section>

          {/* Section 3: Daily Platform Activity (Swapped with Quick Actions) */}
          <section>
            <Card className="card-nassaq">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-cairo text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'نشاط المنصة اليومي' : 'Daily Platform Activity'}
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      {isRTL ? 'مباشر' : 'LIVE'}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="today">
                      <SelectTrigger className="w-32 rounded-xl h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                        <SelectItem value="week">{isRTL ? 'الأسبوع' : 'This Week'}</SelectItem>
                        <SelectItem value="month">{isRTL ? 'الشهر' : 'This Month'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampleChartData}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#805ad5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#805ad5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="students" stroke="#38b2ac" fillOpacity={1} fill="url(#colorStudents)" name={isRTL ? 'الطلاب' : 'Students'} />
                      <Area type="monotone" dataKey="teachers" stroke="#805ad5" fillOpacity={1} fill="url(#colorTeachers)" name={isRTL ? 'المعلمين' : 'Teachers'} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 4: AI Operations Panel */}
          <section>
            <Card className="card-nassaq">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-cairo text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-brand-purple" />
                    {isRTL ? 'لوحة العمليات الذكية السريعة' : 'AI Quick Operations'}
                  </CardTitle>
                  <Badge variant="outline">
                    {aiOperationsToday} {isRTL ? 'عملية اليوم' : 'ops today'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {aiOperations.map((op) => (
                    <Card 
                      key={op.id}
                      className="bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border-0"
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                          <op.icon className="h-6 w-6 text-brand-purple" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{op.title}</p>
                          <p className="text-xs text-muted-foreground">{op.desc}</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-lg"
                          onClick={() => handleAiOperation(op.title)}
                        >
                          <Play className="h-3 w-3 me-1" />
                          {isRTL ? 'تشغيل' : 'Run'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Hakim Chat Interface */}
          <section>
            <Card className="card-nassaq">
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={HAKIM_AVATAR} alt="Hakim" className="w-full h-full object-cover" />
                  </div>
                  {isRTL ? 'مساعد حكيم الذكي' : 'Hakim AI Assistant'}
                  <Badge className="bg-green-500 text-white text-xs">
                    {isRTL ? 'متصل' : 'Online'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اسأل حكيم أي سؤال عن المنصة' : 'Ask Hakim any question about the platform'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Chat Messages */}
                <ScrollArea className="h-64 mb-4 p-4 bg-muted/20 rounded-xl" ref={chatContainerRef}>
                  <div className="space-y-4">
                    {hakimMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                              <img src={HAKIM_AVATAR} alt="Hakim" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl ${
                            msg.role === 'user' 
                              ? 'bg-brand-navy text-white rounded-tr-none' 
                              : 'bg-muted rounded-tl-none'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-brand-turquoise flex items-center justify-center shrink-0">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {hakimLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img src={HAKIM_AVATAR} alt="Hakim" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 rounded-2xl bg-muted rounded-tl-none">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={hakimInput}
                    onChange={(e) => setHakimInput(e.target.value)}
                    placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                    className="rounded-xl flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendToHakim()}
                  />
                  <Button 
                    onClick={handleSendToHakim}
                    disabled={hakimLoading || !hakimInput.trim()}
                    className="bg-brand-navy hover:bg-brand-navy/90 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Add School Wizard Dialog */}
        <Dialog open={showAddSchoolWizard} onOpenChange={setShowAddSchoolWizard}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-cairo text-xl">
                {wizardStep < 5 
                  ? (isRTL ? 'إضافة مدرسة جديدة' : 'Add New School')
                  : (isRTL ? 'تم الإنشاء!' : 'Created!')}
              </DialogTitle>
              <DialogDescription>
                {wizardStep < 5 && (
                  <span>{isRTL ? `الخطوة ${wizardStep} من 4` : `Step ${wizardStep} of 4`}</span>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Progress */}
            {wizardStep < 5 && (
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex-1">
                    <div className={`h-2 rounded-full ${
                      step <= wizardStep ? 'bg-brand-turquoise' : 'bg-muted'
                    }`} />
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">{isRTL ? 'بيانات المدرسة الأساسية' : 'Basic School Info'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم المدرسة (عربي) *' : 'School Name (Arabic) *'}</Label>
                    <Input
                      placeholder={isRTL ? 'مثال: ابتدائية النور' : 'e.g. Al Noor Primary'}
                      value={schoolData.name}
                      onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'School name in English' : 'School Name (English)'}</Label>
                    <Input
                      placeholder="e.g. Al Noor Primary School"
                      value={schoolData.name_en}
                      onChange={(e) => setSchoolData({ ...schoolData, name_en: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الدولة' : 'Country'}</Label>
                    <Select value={schoolData.country} onValueChange={(v) => setSchoolData({ ...schoolData, country: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{isRTL ? c.name : c.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'المدينة *' : 'City *'}</Label>
                    <Select value={schoolData.city} onValueChange={(v) => setSchoolData({ ...schoolData, city: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? 'اختر المدينة' : 'Select city'} /></SelectTrigger>
                      <SelectContent>
                        {SAUDI_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان' : 'Address'}</Label>
                  <Textarea
                    placeholder={isRTL ? 'العنوان التفصيلي للمدرسة' : 'Detailed school address'}
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">{isRTL ? 'إعدادات التشغيل' : 'Operating Settings'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'لغة التدريس' : 'Language'}</Label>
                    <Select value={schoolData.language} onValueChange={(v) => setSchoolData({ ...schoolData, language: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">{isRTL ? 'العربية' : 'Arabic'}</SelectItem>
                        <SelectItem value="en">{isRTL ? 'الإنجليزية' : 'English'}</SelectItem>
                        <SelectItem value="both">{isRTL ? 'ثنائي اللغة' : 'Bilingual'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نظام التقويم' : 'Calendar System'}</Label>
                    <Select value={schoolData.calendar_system} onValueChange={(v) => setSchoolData({ ...schoolData, calendar_system: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hijri">{isRTL ? 'هجري' : 'Hijri'}</SelectItem>
                        <SelectItem value="gregorian">{isRTL ? 'ميلادي' : 'Gregorian'}</SelectItem>
                        <SelectItem value="hijri_gregorian">{isRTL ? 'هجري وميلادي' : 'Both'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نوع المدرسة' : 'School Type'}</Label>
                    <Select value={schoolData.school_type} onValueChange={(v) => setSchoolData({ ...schoolData, school_type: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">{isRTL ? 'حكومية' : 'Public'}</SelectItem>
                        <SelectItem value="private">{isRTL ? 'خاصة' : 'Private'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'المرحلة الدراسية' : 'School Stage'}</Label>
                    <Select value={schoolData.stage} onValueChange={(v) => setSchoolData({ ...schoolData, stage: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SCHOOL_STAGES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{isRTL ? s.label : s.label_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Principal Info */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium">{isRTL ? 'حساب مدير المدرسة' : 'Principal Account'}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الاسم الكامل *' : 'Full Name *'}</Label>
                    <Input
                      placeholder={isRTL ? 'الاسم الكامل للمدير' : 'Principal full name'}
                      value={schoolData.principal_name}
                      onChange={(e) => setSchoolData({ ...schoolData, principal_name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم الجوال' : 'Phone Number'}</Label>
                    <Input
                      placeholder="05xxxxxxxx"
                      value={schoolData.principal_phone}
                      onChange={(e) => setSchoolData({ ...schoolData, principal_phone: e.target.value })}
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'البريد الإلكتروني *' : 'Email *'}</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={schoolData.principal_email}
                      onChange={(e) => setSchoolData({ ...schoolData, principal_email: e.target.value })}
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium">{isRTL ? 'مراجعة البيانات' : 'Review Data'}</h3>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'اسم المدرسة' : 'School Name'}</p>
                    <p className="font-medium">{schoolData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'المدينة' : 'City'}</p>
                    <p className="font-medium">{schoolData.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'نوع المدرسة' : 'Type'}</p>
                    <p className="font-medium">{schoolData.school_type === 'public' ? (isRTL ? 'حكومية' : 'Public') : (isRTL ? 'خاصة' : 'Private')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'المرحلة' : 'Stage'}</p>
                    <p className="font-medium">{SCHOOL_STAGES.find(s => s.value === schoolData.stage)?.[isRTL ? 'label' : 'label_en']}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl">
                  <h4 className="font-medium mb-2">{isRTL ? 'مدير المدرسة' : 'Principal'}</h4>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span> {schoolData.principal_name}</p>
                    <p className="text-sm"><span className="text-muted-foreground">{isRTL ? 'البريد:' : 'Email:'}</span> {schoolData.principal_email}</p>
                    <p className="text-sm"><span className="text-muted-foreground">{isRTL ? 'الهاتف:' : 'Phone:'}</span> {schoolData.principal_phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {wizardStep === 5 && createdSchool && (
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-600">
                  {isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School Created Successfully!'}
                </h3>
                <div className="bg-muted/30 p-4 rounded-xl text-start">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'كود المدرسة' : 'School Code'}</p>
                  <p className="font-mono text-lg font-bold">{createdSchool.code}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'تم إرسال بيانات الدخول إلى البريد الإلكتروني للمدير'
                    : 'Login credentials have been sent to the principal\'s email'}
                </p>
              </div>
            )}

            <DialogFooter>
              {wizardStep > 1 && wizardStep < 5 && (
                <Button variant="outline" onClick={() => setWizardStep(prev => prev - 1)} className="rounded-xl">
                  {isRTL ? 'السابق' : 'Previous'}
                </Button>
              )}
              {wizardStep < 4 && (
                <Button onClick={handleNextStep} className="bg-brand-navy hover:bg-brand-navy/90 rounded-xl">
                  {isRTL ? 'التالي' : 'Next'}
                  <ChevronRight className="h-4 w-4 ms-1" />
                </Button>
              )}
              {wizardStep === 4 && (
                <Button onClick={handleCreateSchool} className="bg-green-600 hover:bg-green-700 rounded-xl">
                  {isRTL ? 'تأكيد الإنشاء' : 'Confirm & Create'}
                </Button>
              )}
              {wizardStep === 5 && (
                <Button onClick={() => { setShowAddSchoolWizard(false); setWizardStep(1); setSchoolData({ name: '', name_en: '', country: 'SA', city: '', address: '', language: 'ar', calendar_system: 'hijri_gregorian', school_type: 'public', stage: 'primary', principal_name: '', principal_email: '', principal_phone: '' }); }} className="rounded-xl">
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
};
