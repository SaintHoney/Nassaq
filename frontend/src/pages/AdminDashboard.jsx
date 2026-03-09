import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Search,
  MoreHorizontal,
  Sun,
  Moon,
  Globe,
  Bell,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Brain,
  FileText,
  Zap,
  Download,
  Upload,
  Shield,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileSearch,
  Sparkles,
  PieChart,
  Calendar,
  Settings,
  UserPlus,
  FolderPlus,
  ClipboardList,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Filter,
  SlidersHorizontal,
  Play,
  Pause,
  AlertCircle,
  Info,
  MessageSquare,
  Send,
  Lightbulb,
  Target,
  Gauge,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  MapPin,
  Phone,
  Mail,
  Image,
  FileSpreadsheet,
  Bot,
  Wand2,
  ListChecks,
  LayoutGrid,
  Table as TableIcon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';

// Hakim Avatar
const HAKIM_AVATAR = 'https://customer-assets.emergentagent.com/job_nassaq-school/artifacts/mtvfci3y_HAKIM%201.png';

// Countries list
const COUNTRIES = [
  { code: 'SA', name: 'المملكة العربية السعودية', name_en: 'Saudi Arabia' },
  { code: 'AE', name: 'الإمارات العربية المتحدة', name_en: 'United Arab Emirates' },
  { code: 'KW', name: 'الكويت', name_en: 'Kuwait' },
  { code: 'QA', name: 'قطر', name_en: 'Qatar' },
  { code: 'BH', name: 'البحرين', name_en: 'Bahrain' },
  { code: 'OM', name: 'عُمان', name_en: 'Oman' },
  { code: 'EG', name: 'مصر', name_en: 'Egypt' },
  { code: 'JO', name: 'الأردن', name_en: 'Jordan' },
];

// Saudi cities
const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر',
  'الظهران', 'الأحساء', 'الطائف', 'تبوك', 'بريدة', 'خميس مشيط',
  'حائل', 'نجران', 'جازان', 'أبها', 'ينبع', 'الجبيل',
];

// School stages
const SCHOOL_STAGES = [
  { value: 'nursery', label: 'الحضانة', label_en: 'Nursery' },
  { value: 'kindergarten', label: 'رياض الأطفال', label_en: 'Kindergarten' },
  { value: 'primary', label: 'الابتدائية', label_en: 'Primary' },
  { value: 'middle', label: 'المتوسطة', label_en: 'Middle School' },
  { value: 'high', label: 'الثانوية العامة', label_en: 'High School' },
  { value: 'continuing', label: 'التعليم المستمر', label_en: 'Continuing Education' },
  { value: 'special_needs', label: 'ذوي الإعاقة', label_en: 'Special Needs' },
  { value: 'scientific_institutes', label: 'المعاهد العلمية', label_en: 'Scientific Institutes' },
  { value: 'gifted', label: 'المطبقة لبرامج الموهوبين', label_en: 'Gifted Programs' },
];

// School types
const SCHOOL_TYPES = [
  { value: 'public', label: 'حكومية', label_en: 'Public' },
  { value: 'private', label: 'خاصة', label_en: 'Private' },
];

// Calendar systems
const CALENDAR_SYSTEMS = [
  { value: 'hijri', label: 'هجري', label_en: 'Hijri' },
  { value: 'gregorian', label: 'ميلادي', label_en: 'Gregorian' },
  { value: 'hijri_gregorian', label: 'هجري + ميلادي', label_en: 'Hijri + Gregorian' },
  { value: 'gregorian_hijri', label: 'ميلادي + هجري', label_en: 'Gregorian + Hijri' },
];

export const AdminDashboard = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const navigate = useNavigate();
  
  // State
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [scopeFilter, setScopeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Create School Wizard
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newSchool, setNewSchool] = useState({
    name: '',
    name_en: '',
    logo: null,
    country: 'SA',
    city: '',
    address: '',
    language: 'ar',
    calendar_system: 'hijri_gregorian',
    school_type: 'public',
    stage: 'primary',
    evaluation_system: 'standard',
    principal_name: '',
    principal_phone: '',
    principal_phone_alt: '',
    principal_email: '',
  });
  const [createdSchool, setCreatedSchool] = useState(null);
  
  // AI States
  const [aiStatus, setAiStatus] = useState('active');
  const [aiOperationsRunning, setAiOperationsRunning] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [recentAiOperations, setRecentAiOperations] = useState([]);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState('');
  
  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statsRes, schoolsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/schools'),
      ]);
      setStats(statsRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, isRTL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate AI Suggestions
  useEffect(() => {
    if (stats) {
      const suggestions = [];
      if (stats.pending_requests > 0) {
        suggestions.push({
          id: 1,
          title: isRTL ? 'طلبات تسجيل معلقة' : 'Pending Registration Requests',
          description: isRTL 
            ? `يوجد ${stats.pending_requests} طلب تسجيل بانتظار المراجعة`
            : `${stats.pending_requests} registration requests awaiting review`,
          priority: 'high',
          action: () => navigate('/admin/teacher-requests'),
        });
      }
      if (stats.schools_without_principal > 0) {
        suggestions.push({
          id: 2,
          title: isRTL ? 'مدارس بدون مدير' : 'Schools Without Principal',
          description: isRTL
            ? `${stats.schools_without_principal} مدرسة بحاجة لتعيين مدير`
            : `${stats.schools_without_principal} schools need a principal`,
          priority: 'medium',
          action: () => navigate('/admin/schools'),
        });
      }
      setAiSuggestions(suggestions);
    }
  }, [stats, isRTL, navigate]);

  // Create School Handler
  const handleCreateSchool = async () => {
    try {
      const response = await api.post('/schools', {
        name: newSchool.name,
        name_en: newSchool.name_en,
        country: newSchool.country,
        city: newSchool.city,
        address: newSchool.address,
        language: newSchool.language,
        calendar_system: newSchool.calendar_system,
        school_type: newSchool.school_type,
        stage: newSchool.stage,
        principal_name: newSchool.principal_name,
        principal_email: newSchool.principal_email,
        principal_phone: newSchool.principal_phone,
      });
      
      setCreatedSchool(response.data);
      setWizardStep(5); // Success step
      toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح' : 'School created successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل إنشاء المدرسة' : 'Failed to create school'));
    }
  };

  // Reset wizard
  const resetWizard = () => {
    setWizardStep(1);
    setNewSchool({
      name: '',
      name_en: '',
      logo: null,
      country: 'SA',
      city: '',
      address: '',
      language: 'ar',
      calendar_system: 'hijri_gregorian',
      school_type: 'public',
      stage: 'primary',
      evaluation_system: 'standard',
      principal_name: '',
      principal_phone: '',
      principal_phone_alt: '',
      principal_email: '',
    });
    setCreatedSchool(null);
  };

  // AI Operations
  const runAiOperation = async (operation) => {
    setAiOperationsRunning(prev => ({ ...prev, [operation]: true }));
    
    // Simulate AI operation
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    const results = {
      'diagnosis': {
        success: true,
        message: isRTL ? 'النظام يعمل بشكل طبيعي' : 'System running normally',
        details: {
          health_score: 98,
          issues_found: 0,
          recommendations: 2,
        }
      },
      'data_quality': {
        success: true,
        message: isRTL ? 'جودة البيانات: 95.5%' : 'Data Quality: 95.5%',
        details: {
          score: 95.5,
          missing_data: 12,
          duplicates: 3,
        }
      },
      'tenant_health': {
        success: true,
        message: isRTL ? 'تم فحص جميع المدارس' : 'All schools checked',
        details: {
          healthy: stats?.active_schools || 0,
          warning: 5,
          critical: 2,
        }
      },
      'executive_summary': {
        success: true,
        message: isRTL ? 'تم إنشاء الملخص التنفيذي' : 'Executive summary generated',
      }
    };
    
    const result = results[operation] || { success: true, message: 'Done' };
    
    setRecentAiOperations(prev => [{
      id: Date.now(),
      operation,
      timestamp: new Date().toISOString(),
      status: result.success ? 'success' : 'failed',
      result,
    }, ...prev.slice(0, 9)]);
    
    setAiOperationsRunning(prev => ({ ...prev, [operation]: false }));
    
    toast.success(result.message);
    return result;
  };

  // Health tag component
  const HealthTag = ({ status }) => {
    const config = {
      healthy: { label: isRTL ? 'طبيعي' : 'Normal', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      warning: { label: isRTL ? 'يحتاج متابعة' : 'Needs Attention', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      critical: { label: isRTL ? 'خطر' : 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    const { label, color } = config[status] || config.healthy;
    return <Badge className={color}>{label}</Badge>;
  };

  // Analytics cards data
  const analyticsCards = [
    {
      id: 'schools',
      title: isRTL ? 'المدارس المسجلة' : 'Registered Schools',
      value: stats?.total_schools || 0,
      icon: Building2,
      color: 'brand-navy',
      trend: '+12%',
      health: 'healthy',
      subMetrics: [
        { label: isRTL ? 'نشطة' : 'Active', value: stats?.active_schools || 0 },
        { label: isRTL ? 'موقوفة' : 'Suspended', value: stats?.suspended_schools || 0 },
        { label: isRTL ? 'قيد الإعداد' : 'Setup', value: stats?.setup_schools || 0 },
      ],
      actions: [
        { label: isRTL ? 'إضافة مدرسة' : 'Add School', onClick: () => setCreateDialogOpen(true) },
        { label: isRTL ? 'عرض المدارس' : 'View Schools', onClick: () => navigate('/admin/schools') },
      ],
    },
    {
      id: 'students',
      title: isRTL ? 'إجمالي الطلاب' : 'Total Students',
      value: stats?.total_students || 0,
      icon: GraduationCap,
      color: 'brand-turquoise',
      trend: '+8%',
      health: 'healthy',
      subMetrics: [
        { label: isRTL ? 'نشطون اليوم' : 'Active Today', value: Math.round((stats?.total_students || 0) * 0.75) },
        { label: isRTL ? 'جدد هذا الأسبوع' : 'New This Week', value: Math.round((stats?.total_students || 0) * 0.02) },
        { label: isRTL ? 'بيانات ناقصة' : 'Missing Data', value: Math.round((stats?.total_students || 0) * 0.01) },
      ],
      actions: [
        { label: isRTL ? 'تحليلات الطلاب' : 'Student Analytics', onClick: () => navigate('/admin/reports') },
      ],
    },
    {
      id: 'teachers',
      title: isRTL ? 'إجمالي المعلمين' : 'Total Teachers',
      value: stats?.total_teachers || 0,
      icon: UserCheck,
      color: 'brand-purple',
      trend: '+5%',
      health: stats?.teachers_without_classes > 10 ? 'warning' : 'healthy',
      subMetrics: [
        { label: isRTL ? 'نشطون اليوم' : 'Active Today', value: Math.round((stats?.total_teachers || 0) * 0.8) },
        { label: isRTL ? 'بدون فصول' : 'No Classes', value: stats?.teachers_without_classes || 0 },
        { label: isRTL ? 'جداول غير مكتملة' : 'Incomplete Schedule', value: stats?.incomplete_schedules || 0 },
      ],
      actions: [
        { label: isRTL ? 'إدارة التوزيع' : 'Manage Distribution', onClick: () => navigate('/admin/users') },
      ],
    },
    {
      id: 'active_users',
      title: isRTL ? 'المستخدمون النشطون' : 'Active Users',
      value: stats?.active_users || 0,
      icon: Users,
      color: 'green-500',
      trend: '+15%',
      health: 'healthy',
      subMetrics: [
        { label: isRTL ? 'نشطون اليوم' : 'Today', value: stats?.active_users || 0 },
        { label: isRTL ? 'متوسط الجلسة' : 'Avg Session', value: '12 min' },
      ],
      actions: [
        { label: isRTL ? 'تقرير الاستخدام' : 'Usage Report', onClick: () => navigate('/admin/reports') },
      ],
    },
    {
      id: 'classes_today',
      title: isRTL ? 'الحصص اليوم' : 'Classes Today',
      value: stats?.total_classes || 0,
      icon: Calendar,
      color: 'yellow-500',
      trend: '',
      health: 'healthy',
      subMetrics: [
        { label: isRTL ? 'جارية الآن' : 'Running Now', value: Math.round((stats?.total_classes || 0) * 0.3) },
        { label: isRTL ? 'انتهت' : 'Completed', value: Math.round((stats?.total_classes || 0) * 0.5) },
      ],
      actions: [
        { label: isRTL ? 'مشاهدة الحصص' : 'View Classes', onClick: () => navigate('/admin/monitoring') },
      ],
    },
    {
      id: 'operations',
      title: isRTL ? 'العمليات' : 'Operations',
      value: stats?.total_operations || 1250,
      icon: Activity,
      color: 'orange-500',
      trend: '+3%',
      health: 'healthy',
      subMetrics: [
        { label: isRTL ? 'عمليات حساسة' : 'Sensitive', value: 45 },
        { label: isRTL ? 'فاشلة' : 'Failed', value: 3 },
      ],
      actions: [
        { label: isRTL ? 'عرض السجل' : 'View Log', onClick: () => navigate('/admin/monitoring') },
      ],
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: isRTL ? 'إضافة مدرسة' : 'Add School',
      description: isRTL ? 'إنشاء مدرسة جديدة في المنصة' : 'Create a new school',
      icon: Building2,
      color: 'bg-brand-navy',
      action: () => { resetWizard(); setCreateDialogOpen(true); },
    },
    {
      title: isRTL ? 'إدارة المستخدمين' : 'Manage Users',
      description: isRTL ? 'إدارة حسابات المستخدمين' : 'Manage user accounts',
      icon: Users,
      color: 'bg-brand-purple',
      href: '/admin/users',
    },
    {
      title: isRTL ? 'إدارة القواعد' : 'Manage Rules',
      description: isRTL ? 'القواعد التعليمية والتشغيلية' : 'Educational & operational rules',
      icon: BookOpen,
      color: 'bg-brand-turquoise',
      href: '/admin/rules',
    },
    {
      title: isRTL ? 'مراقبة النظام' : 'System Monitoring',
      description: isRTL ? 'مراقبة أداء النظام' : 'Monitor system performance',
      icon: Activity,
      color: 'bg-green-500',
      href: '/admin/monitoring',
    },
    {
      title: isRTL ? 'التقارير' : 'Reports',
      description: isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics',
      icon: BarChart3,
      color: 'bg-yellow-500',
      href: '/admin/reports',
    },
    {
      title: isRTL ? 'الإعدادات' : 'Settings',
      description: isRTL ? 'إعدادات النظام' : 'System settings',
      icon: Settings,
      color: 'bg-gray-600',
      href: '/settings',
    },
  ];

  // AI Operations
  const aiOperations = [
    {
      id: 'diagnosis',
      title: isRTL ? 'تشخيص النظام' : 'System Diagnosis',
      description: isRTL ? 'تحليل شامل لأداء المنصة' : 'Comprehensive platform analysis',
      icon: Shield,
      type: 'analysis',
    },
    {
      id: 'data_quality',
      title: isRTL ? 'فحص جودة البيانات' : 'Data Quality Scan',
      description: isRTL ? 'التحقق من سلامة البيانات' : 'Verify data integrity',
      icon: FileSearch,
      type: 'analysis',
    },
    {
      id: 'import_analyzer',
      title: isRTL ? 'تحليل الاستيراد' : 'Import Analyzer',
      description: isRTL ? 'تحليل ملفات الاستيراد' : 'Analyze import files',
      icon: Upload,
      type: 'tool',
    },
    {
      id: 'tenant_health',
      title: isRTL ? 'فحص صحة المدارس' : 'Tenant Health Check',
      description: isRTL ? 'تحليل وضع كل مدرسة' : 'Analyze each school status',
      icon: Building2,
      type: 'analysis',
    },
    {
      id: 'config_suggestion',
      title: isRTL ? 'اقتراح إعدادات' : 'Config Suggestion',
      description: isRTL ? 'اقتراح إعدادات مناسبة' : 'Suggest appropriate settings',
      icon: Lightbulb,
      type: 'suggestion',
    },
    {
      id: 'executive_summary',
      title: isRTL ? 'ملخص تنفيذي' : 'Executive Summary',
      description: isRTL ? 'توليد تقرير ذكي' : 'Generate smart report',
      icon: Sparkles,
      type: 'report',
    },
    {
      id: 'report_builder',
      title: isRTL ? 'منشئ التقارير' : 'Report Builder',
      description: isRTL ? 'إنشاء تقارير مخصصة' : 'Create custom reports',
      icon: FileText,
      type: 'tool',
    },
    {
      id: 'alerts_review',
      title: isRTL ? 'مراجعة التنبيهات' : 'Alerts Review',
      description: isRTL ? 'مراجعة التنبيهات الذكية' : 'Review smart alerts',
      icon: Bell,
      type: 'alert',
    },
  ];

  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-brand-navy">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="admin-dashboard">
        {/* ============== HEADER ============== */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'مركز القيادة' : 'Platform Control Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? `مرحباً، ${user?.full_name}` : `Welcome, ${user?.full_name}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <NotificationBell />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchData} 
                className="rounded-xl"
                disabled={refreshing}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        {/* ============== CONTENT ============== */}
        <div className="p-6 space-y-8">
          
          {/* ============== SECTION 1: Global Filters Bar ============== */}
          <section data-testid="filters-section" className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-2xl">
            {/* Scope Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                {isRTL ? 'النطاق:' : 'Scope:'}
              </Label>
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'كل المنصة' : 'All Platform'}</SelectItem>
                  <SelectItem value="school">{isRTL ? 'مدرسة محددة' : 'Select School'}</SelectItem>
                  <SelectItem value="region">{isRTL ? 'حسب المنطقة' : 'By Region'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                {isRTL ? 'الفترة:' : 'Period:'}
              </Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">{isRTL ? 'الآن' : 'Live'}</SelectItem>
                  <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                  <SelectItem value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
                  <SelectItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
                  <SelectItem value="custom">{isRTL ? 'نطاق مخصص' : 'Custom Range'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                {isRTL ? 'الحالة:' : 'Status:'}
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="active">{isRTL ? 'نشطة' : 'Active'}</SelectItem>
                  <SelectItem value="suspended">{isRTL ? 'موقوفة' : 'Suspended'}</SelectItem>
                  <SelectItem value="setup">{isRTL ? 'قيد الإعداد' : 'Setup'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1" />
            
            {/* Action Buttons */}
            <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchData}>
              <RefreshCw className={`h-4 w-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Download className="h-4 w-4 me-2" />
                  {isRTL ? 'تصدير' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 me-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileSpreadsheet className="h-4 w-4 me-2" />
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </section>

          {/* ============== SECTION 2: Global Analytics Cards ============== */}
          <section data-testid="analytics-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cairo text-xl font-bold">
                {isRTL ? 'المؤشرات العامة للمنصة' : 'Global Analytics'}
              </h2>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate('/admin/reports')}>
                <BarChart3 className="h-4 w-4 me-2" />
                {isRTL ? 'تفاصيل' : 'Details'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {analyticsCards.map((card) => (
                <Card 
                  key={card.id} 
                  className="card-nassaq hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => card.actions?.[0]?.onClick?.()}
                  data-testid={`analytics-card-${card.id}`}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-${card.color}/10 flex items-center justify-center`}>
                        <card.icon className={`h-5 w-5 text-${card.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        {card.trend && (
                          <div className={`flex items-center text-xs ${card.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {card.trend.startsWith('+') ? <TrendingUp className="h-3 w-3 me-0.5" /> : <TrendingDown className="h-3 w-3 me-0.5" />}
                            {card.trend}
                          </div>
                        )}
                        <HealthTag status={card.health} />
                      </div>
                    </div>
                    
                    {/* Main Value */}
                    <p className="text-2xl font-bold font-cairo">{card.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-tajawal mb-3">{card.title}</p>
                    
                    {/* Sub Metrics */}
                    <div className="space-y-1 mb-3 border-t pt-2">
                      {card.subMetrics?.slice(0, 2).map((metric, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <span className="font-medium">{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {card.actions?.map((action, idx) => (
                        <Button 
                          key={idx} 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7 flex-1"
                          onClick={(e) => { e.stopPropagation(); action.onClick?.(); }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ============== SECTION 3: Daily Platform Activity ============== */}
          <section data-testid="activity-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-cairo text-xl font-bold">
                  {isRTL ? 'نشاط المنصة اليومي' : 'Daily Platform Activity'}
                </h2>
                <Badge variant="outline" className="text-brand-turquoise border-brand-turquoise animate-pulse">
                  <Activity className="h-3 w-3 me-1" />
                  {isRTL ? 'مباشر' : 'Live'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="hourly">
                  <SelectTrigger className="w-[130px] rounded-xl h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">{isRTL ? 'حسب الساعة' : 'Hourly'}</SelectItem>
                    <SelectItem value="school">{isRTL ? 'حسب المدرسة' : 'By School'}</SelectItem>
                    <SelectItem value="activity">{isRTL ? 'حسب النشاط' : 'By Activity'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card className="card-nassaq">
              <CardContent className="p-6">
                {/* Activity Chart Placeholder */}
                <div className="h-64 bg-gradient-to-br from-brand-navy/5 to-brand-turquoise/5 rounded-xl flex items-center justify-center mb-6 border border-dashed border-muted-foreground/20">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'رسم بياني تفاعلي للنشاط اليومي' : 'Interactive daily activity chart'}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {isRTL ? 'الحصص • الحضور • الدرجات • نشاط المستخدمين' : 'Classes • Attendance • Grades • User Activity'}
                    </p>
                  </div>
                </div>
                
                {/* Activity Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-brand-navy/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-brand-navy" />
                      <span className="text-sm text-muted-foreground">{isRTL ? 'الحصص' : 'Classes'}</span>
                    </div>
                    <p className="text-2xl font-bold">{stats?.total_classes || 0}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +5% {isRTL ? 'من أمس' : 'from yesterday'}
                    </p>
                  </div>
                  <div className="p-4 bg-brand-turquoise/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-4 w-4 text-brand-turquoise" />
                      <span className="text-sm text-muted-foreground">{isRTL ? 'تسجيل الحضور' : 'Attendance'}</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round((stats?.total_students || 0) * 0.85)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +2%
                    </p>
                  </div>
                  <div className="p-4 bg-brand-purple/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-brand-purple" />
                      <span className="text-sm text-muted-foreground">{isRTL ? 'الدرجات' : 'Grades'}</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round((stats?.total_students || 0) * 0.1)}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'إدخالات اليوم' : 'Entries today'}</p>
                  </div>
                  <div className="p-4 bg-green-500/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{isRTL ? 'المستخدمون' : 'Users'}</span>
                    </div>
                    <p className="text-2xl font-bold">{stats?.active_users || 0}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +15%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ============== SECTION 4: Quick Actions ============== */}
          <section data-testid="quick-actions-section">
            <h2 className="font-cairo text-xl font-bold mb-4">
              {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="card-nassaq cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => action.href ? navigate(action.href) : action.action?.()}
                  data-testid={`quick-action-${index}`}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <p className="font-cairo font-medium text-foreground text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ============== SECTION 5: AI Operations Panel ============== */}
          <section data-testid="ai-operations-section">
            <Card className="card-nassaq border-brand-purple/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-brand-purple" />
                    </div>
                    <div>
                      <CardTitle className="font-cairo">
                        {isRTL ? 'لوحة العمليات الذكية السريعة' : 'Quick AI Operations Panel'}
                      </CardTitle>
                      <CardDescription>
                        {isRTL ? 'تنفيذ وتحليل ومراقبة العمليات الذكية' : 'Execute, analyze and monitor smart operations'}
                      </CardDescription>
                    </div>
                    <img 
                      src={HAKIM_AVATAR} 
                      alt="Hakim" 
                      className="w-10 h-10 rounded-full ring-2 ring-brand-purple/20 ms-2"
                    />
                  </div>
                  
                  {/* AI Status */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${aiStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-sm text-muted-foreground">
                        {aiStatus === 'active' 
                          ? (isRTL ? 'نشط' : 'Active') 
                          : (isRTL ? 'جزئي' : 'Partial')}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {recentAiOperations.length} {isRTL ? 'عملية اليوم' : 'ops today'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* AI Operation Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {aiOperations.map((op) => (
                    <Card 
                      key={op.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        aiOperationsRunning[op.id] ? 'ring-2 ring-brand-purple animate-pulse' : ''
                      }`}
                      onClick={() => !aiOperationsRunning[op.id] && runAiOperation(op.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                            {aiOperationsRunning[op.id] ? (
                              <RefreshCw className="h-5 w-5 text-brand-purple animate-spin" />
                            ) : (
                              <op.icon className="h-5 w-5 text-brand-purple" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{op.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{op.description}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t">
                          <Badge variant="outline" className="text-xs">
                            {op.type === 'analysis' && (isRTL ? 'تحليل' : 'Analysis')}
                            {op.type === 'tool' && (isRTL ? 'أداة' : 'Tool')}
                            {op.type === 'suggestion' && (isRTL ? 'اقتراح' : 'Suggestion')}
                            {op.type === 'report' && (isRTL ? 'تقرير' : 'Report')}
                            {op.type === 'alert' && (isRTL ? 'تنبيه' : 'Alert')}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={aiOperationsRunning[op.id]}>
                            {aiOperationsRunning[op.id] 
                              ? (isRTL ? 'جاري...' : 'Running...') 
                              : (isRTL ? 'تشغيل' : 'Run')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-cairo font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      {isRTL ? 'المهام المقترحة' : 'Suggested Actions'}
                    </h3>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion) => (
                        <div 
                          key={suggestion.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              suggestion.priority === 'high' ? 'bg-red-500' : 
                              suggestion.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium">{suggestion.title}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={suggestion.action}>
                              {isRTL ? 'تنفيذ' : 'Execute'}
                            </Button>
                            <Button variant="ghost" size="sm">
                              {isRTL ? 'تجاهل' : 'Dismiss'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent AI Operations */}
                {recentAiOperations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-cairo font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {isRTL ? 'آخر العمليات الذكية' : 'Recent AI Operations'}
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {recentAiOperations.slice(0, 5).map((op) => (
                        <div 
                          key={op.id}
                          className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {op.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{aiOperations.find(o => o.id === op.operation)?.title || op.operation}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(op.timestamp).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mini AI Assistant */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <img src={HAKIM_AVATAR} alt="Hakim" className="w-8 h-8 rounded-full" />
                    <div className="flex-1 relative">
                      <Input
                        placeholder={isRTL ? 'اسأل حكيم... (مثال: ما المدارس التي تحتاج متابعة؟)' : 'Ask Hakim... (e.g., Which schools need attention?)'}
                        className="rounded-xl pe-20"
                        value={aiChatMessage}
                        onChange={(e) => setAiChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && aiChatMessage.trim()) {
                            toast.info(isRTL ? 'جاري معالجة سؤالك...' : 'Processing your question...');
                            setAiChatMessage('');
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        className="absolute end-1 top-1/2 -translate-y-1/2 rounded-lg h-8"
                        disabled={!aiChatMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* ============== CREATE SCHOOL WIZARD DIALOG ============== */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) resetWizard(); setCreateDialogOpen(open); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo text-xl">
                {wizardStep < 5 
                  ? (isRTL ? 'إنشاء مدرسة جديدة' : 'Create New School')
                  : (isRTL ? 'تم إنشاء المدرسة بنجاح' : 'School Created Successfully')
                }
              </DialogTitle>
              <DialogDescription>
                {wizardStep < 5 && (
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          wizardStep === step ? 'bg-brand-navy text-white' :
                          wizardStep > step ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {wizardStep > step ? <Check className="h-4 w-4" /> : step}
                        </div>
                        {step < 4 && <div className={`w-8 h-0.5 ${wizardStep > step ? 'bg-green-500' : 'bg-muted'}`} />}
                      </div>
                    ))}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: School Profile */}
            {wizardStep === 1 && (
              <div className="space-y-4 py-4">
                <h3 className="font-cairo font-medium">{isRTL ? 'بيانات المدرسة الأساسية' : 'School Profile'}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم المدرسة' : 'School Name'} *</Label>
                    <Input
                      value={newSchool.name}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={isRTL ? 'اسم المدرسة بالعربية' : 'School name in Arabic'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم المدرسة (إنجليزي)' : 'School Name (English)'}</Label>
                    <Input
                      value={newSchool.name_en}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="School name in English"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'شعار المدرسة' : 'School Logo'}</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'اسحب الملف هنا أو انقر للرفع' : 'Drag file here or click to upload'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الدولة' : 'Country'} *</Label>
                    <Select value={newSchool.country} onValueChange={(v) => setNewSchool(prev => ({ ...prev, country: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {isRTL ? c.name : c.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'المدينة' : 'City'} *</Label>
                    <Select value={newSchool.city} onValueChange={(v) => setNewSchool(prev => ({ ...prev, city: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'اختر المدينة' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {SAUDI_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان' : 'Address'} *</Label>
                  <Textarea
                    value={newSchool.address}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={isRTL ? 'العنوان التفصيلي' : 'Detailed address'}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Operating Settings */}
            {wizardStep === 2 && (
              <div className="space-y-4 py-4">
                <h3 className="font-cairo font-medium">{isRTL ? 'إعدادات التشغيل' : 'Operating Settings'}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                    <Select value={newSchool.language} onValueChange={(v) => setNewSchool(prev => ({ ...prev, language: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">{isRTL ? 'العربية' : 'Arabic'}</SelectItem>
                        <SelectItem value="en">{isRTL ? 'الإنجليزية' : 'English'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نظام التقويم' : 'Calendar System'}</Label>
                    <Select value={newSchool.calendar_system} onValueChange={(v) => setNewSchool(prev => ({ ...prev, calendar_system: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CALENDAR_SYSTEMS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {isRTL ? c.label : c.label_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نوع المدرسة' : 'School Type'}</Label>
                    <Select value={newSchool.school_type} onValueChange={(v) => setNewSchool(prev => ({ ...prev, school_type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {isRTL ? t.label : t.label_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'المرحلة التعليمية' : 'Educational Stage'}</Label>
                    <Select value={newSchool.stage} onValueChange={(v) => setNewSchool(prev => ({ ...prev, stage: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_STAGES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {isRTL ? s.label : s.label_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Principal Account */}
            {wizardStep === 3 && (
              <div className="space-y-4 py-4">
                <h3 className="font-cairo font-medium">{isRTL ? 'إنشاء حساب مدير المدرسة' : 'School Principal Account'}</h3>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'اسم المدير' : 'Principal Name'} *</Label>
                  <Input
                    value={newSchool.principal_name}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, principal_name: e.target.value }))}
                    placeholder={isRTL ? 'الاسم الكامل' : 'Full name'}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                    <Input
                      value={newSchool.principal_phone}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, principal_phone: e.target.value }))}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم هاتف إضافي' : 'Alternative Phone'}</Label>
                    <Input
                      value={newSchool.principal_phone_alt}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, principal_phone_alt: e.target.value }))}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'البريد الإلكتروني' : 'Email Address'} *</Label>
                  <Input
                    type="email"
                    value={newSchool.principal_email}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, principal_email: e.target.value }))}
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
                
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'سيتم إنشاء حساب بدور "مدير المدرسة" وإرسال بيانات الدخول للبريد الإلكتروني المحدد.'
                      : 'An account with "School Principal" role will be created and login credentials will be sent to the specified email.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {wizardStep === 4 && (
              <div className="space-y-4 py-4">
                <h3 className="font-cairo font-medium">{isRTL ? 'مراجعة البيانات' : 'Review Information'}</h3>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">{isRTL ? 'بيانات المدرسة' : 'School Information'}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span>
                        <span className="font-medium">{newSchool.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'المدينة:' : 'City:'}</span>
                        <span>{newSchool.city}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'النوع:' : 'Type:'}</span>
                        <span>{SCHOOL_TYPES.find(t => t.value === newSchool.school_type)?.[isRTL ? 'label' : 'label_en']}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'المرحلة:' : 'Stage:'}</span>
                        <span>{SCHOOL_STAGES.find(s => s.value === newSchool.stage)?.[isRTL ? 'label' : 'label_en']}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">{isRTL ? 'مدير المدرسة' : 'Principal'}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span>
                        <span className="font-medium">{newSchool.principal_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'الهاتف:' : 'Phone:'}</span>
                        <span dir="ltr">{newSchool.principal_phone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'البريد:' : 'Email:'}</span>
                        <span dir="ltr">{newSchool.principal_email}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {wizardStep === 5 && createdSchool && (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">{isRTL ? 'معرف المدرسة' : 'Tenant ID'}</p>
                      <p className="font-mono text-sm bg-muted px-3 py-1 rounded">{createdSchool.code || 'NSS-SA-26-0001'}</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">{isRTL ? 'اسم المدرسة' : 'School Name'}</p>
                      <p className="font-medium">{createdSchool.name || newSchool.name}</p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => navigate('/admin/schools')}>
                        {isRTL ? 'لوحة تحكم المدرسة' : 'School Dashboard'}
                      </Button>
                      <Button variant="outline" onClick={() => { resetWizard(); setCreateDialogOpen(false); }}>
                        {isRTL ? 'العودة' : 'Back'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-s ps-6">
                    <h4 className="font-medium">{isRTL ? 'رسالة الترحيب' : 'Welcome Message'}</h4>
                    <div className="p-4 bg-muted/30 rounded-xl text-sm space-y-2">
                      <p>{isRTL ? 'أهلاً بك في منصة نَسَّق المدعومة بالذكاء الاصطناعي.' : 'Welcome to NASSAQ AI-powered platform.'}</p>
                      <p>{isRTL ? 'بيانات دخولك على النظام:' : 'Your login credentials:'}</p>
                      <div className="space-y-1 font-mono text-xs">
                        <p>📧 {newSchool.principal_email}</p>
                        <p>🔑 ********</p>
                        <p>🏫 {createdSchool.code || 'NSS-SA-26-0001'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Copy className="h-4 w-4 me-2" />
                      {isRTL ? 'نسخ الرسالة' : 'Copy Message'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Dialog Footer */}
            {wizardStep < 5 && (
              <DialogFooter className="flex-row gap-2">
                {wizardStep > 1 && (
                  <Button variant="outline" onClick={() => setWizardStep(prev => prev - 1)}>
                    {isRTL ? 'رجوع' : 'Back'}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => toast.info(isRTL ? 'تم الحفظ كمسودة' : 'Saved as draft')}>
                  {isRTL ? 'حفظ كمسودة' : 'Save Draft'}
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" onClick={() => { resetWizard(); setCreateDialogOpen(false); }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                {wizardStep < 4 ? (
                  <Button 
                    onClick={() => setWizardStep(prev => prev + 1)}
                    disabled={
                      (wizardStep === 1 && (!newSchool.name || !newSchool.city)) ||
                      (wizardStep === 3 && (!newSchool.principal_name || !newSchool.principal_email || !newSchool.principal_phone))
                    }
                  >
                    {isRTL ? 'التالي' : 'Next'}
                    <ChevronRight className="h-4 w-4 ms-1" />
                  </Button>
                ) : (
                  <Button onClick={handleCreateSchool}>
                    <Check className="h-4 w-4 me-1" />
                    {isRTL ? 'تأكيد الإنشاء' : 'Confirm Creation'}
                  </Button>
                )}
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <HakimAssistant />
      </div>
    </Sidebar>
  );
};
