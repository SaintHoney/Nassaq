import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../components/ui/sheet';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Share2,
  Filter,
  Calendar,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  Zap,
  FileText,
  Mail,
  Send,
  RefreshCw,
  Eye,
  Settings,
  Plus,
  Search,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Award,
  DollarSign,
  Activity,
  Layers,
  Grid,
  List,
  Sparkles,
  Wand2,
  CalendarClock,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartPie, Pie, Cell, Legend, LineChart as RechartLine, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Translations
const translations = {
  ar: {
    pageTitle: 'التقارير والتحليلات',
    pageSubtitle: 'مركز التحليل المتقدم للبيانات التعليمية والتشغيلية',
    overview: 'نظرة عامة',
    reports: 'التقارير',
    aiInsights: 'رؤى AI',
    tools: 'الأدوات',
    totalSchools: 'إجمالي المدارس',
    totalStudents: 'إجمالي الطلاب',
    totalTeachers: 'إجمالي المعلمين',
    activeUsers: 'مستخدمون نشطون',
    schoolReports: 'تقارير المدارس',
    studentReports: 'تقارير الطلاب',
    teacherReports: 'تقارير المعلمين',
    academicReports: 'تقارير الأداء الأكاديمي',
    attendanceReports: 'تقارير الحضور',
    behaviorReports: 'تقارير السلوك',
    subscriptionReports: 'تقارير الاشتراكات',
    usageReports: 'تقارير استخدام المنصة',
    aiReports: 'تقارير الذكاء الاصطناعي',
    hcdReports: 'مؤشرات تنمية القدرات',
    viewReport: 'عرض التقرير',
    exportPDF: 'تصدير PDF',
    exportExcel: 'تصدير Excel',
    exportCSV: 'تصدير CSV',
    share: 'مشاركة',
    schedule: 'جدولة',
    filters: 'الفلاتر',
    selectSchool: 'اختر المدرسة',
    selectCity: 'اختر المدينة',
    selectStage: 'اختر المرحلة',
    selectPeriod: 'اختر الفترة',
    allSchools: 'جميع المدارس',
    allCities: 'جميع المدن',
    allStages: 'جميع المراحل',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisQuarter: 'هذا الربع',
    thisYear: 'هذا العام',
    custom: 'مخصص',
    apply: 'تطبيق',
    reset: 'إعادة ضبط',
    generateReport: 'إنشاء تقرير',
    aiSummary: 'ملخص AI',
    aiReportBuilder: 'منشئ التقارير بـ AI',
    compareSchools: 'مقارنة المدارس',
    comparePeriods: 'مقارنة الفترات',
    scheduledReports: 'التقارير المجدولة',
    recentReports: 'التقارير الأخيرة',
    keyInsights: 'أهم الرؤى',
    recommendations: 'التوصيات',
    trends: 'الاتجاهات',
    alerts: 'التنبيهات',
    performance: 'الأداء',
    growth: 'النمو',
    decline: 'الانخفاض',
    stable: 'مستقر',
    critical: 'حرج',
    warning: 'تحذير',
    good: 'جيد',
    excellent: 'ممتاز',
  },
  en: {
    pageTitle: 'Reports & Analytics',
    pageSubtitle: 'Advanced analytics center for educational and operational data',
    overview: 'Overview',
    reports: 'Reports',
    aiInsights: 'AI Insights',
    tools: 'Tools',
    totalSchools: 'Total Schools',
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    activeUsers: 'Active Users',
    schoolReports: 'School Reports',
    studentReports: 'Student Reports',
    teacherReports: 'Teacher Reports',
    academicReports: 'Academic Performance',
    attendanceReports: 'Attendance Reports',
    behaviorReports: 'Behavior Reports',
    subscriptionReports: 'Subscription Reports',
    usageReports: 'Platform Usage',
    aiReports: 'AI Usage Reports',
    hcdReports: 'HCD Indicators',
    viewReport: 'View Report',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    exportCSV: 'Export CSV',
    share: 'Share',
    schedule: 'Schedule',
    filters: 'Filters',
    selectSchool: 'Select School',
    selectCity: 'Select City',
    selectStage: 'Select Stage',
    selectPeriod: 'Select Period',
    allSchools: 'All Schools',
    allCities: 'All Cities',
    allStages: 'All Stages',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisQuarter: 'This Quarter',
    thisYear: 'This Year',
    custom: 'Custom',
    apply: 'Apply',
    reset: 'Reset',
    generateReport: 'Generate Report',
    aiSummary: 'AI Summary',
    aiReportBuilder: 'AI Report Builder',
    compareSchools: 'Compare Schools',
    comparePeriods: 'Compare Periods',
    scheduledReports: 'Scheduled Reports',
    recentReports: 'Recent Reports',
    keyInsights: 'Key Insights',
    recommendations: 'Recommendations',
    trends: 'Trends',
    alerts: 'Alerts',
    performance: 'Performance',
    growth: 'Growth',
    decline: 'Decline',
    stable: 'Stable',
    critical: 'Critical',
    warning: 'Warning',
    good: 'Good',
    excellent: 'Excellent',
  }
};

// Report categories
const REPORT_CATEGORIES = [
  { 
    id: 'schools', 
    title_ar: 'تقارير المدارس', 
    title_en: 'School Reports',
    description_ar: 'تحليل شامل لأداء المدارس داخل المنصة',
    description_en: 'Comprehensive analysis of school performance',
    icon: Building2, 
    color: 'bg-blue-500',
    count: 12
  },
  { 
    id: 'students', 
    title_ar: 'تقارير الطلاب', 
    title_en: 'Student Reports',
    description_ar: 'بيانات تحليلية حول الطلاب المسجلين',
    description_en: 'Analytical data about enrolled students',
    icon: Users, 
    color: 'bg-green-500',
    count: 8
  },
  { 
    id: 'teachers', 
    title_ar: 'تقارير المعلمين', 
    title_en: 'Teacher Reports',
    description_ar: 'تحليلات تفصيلية حول المعلمين',
    description_en: 'Detailed analytics about teachers',
    icon: GraduationCap, 
    color: 'bg-purple-500',
    count: 6
  },
  { 
    id: 'academic', 
    title_ar: 'الأداء الأكاديمي', 
    title_en: 'Academic Performance',
    description_ar: 'تحليل النتائج الأكاديمية للطلاب',
    description_en: 'Analysis of student academic results',
    icon: BookOpen, 
    color: 'bg-orange-500',
    count: 10
  },
  { 
    id: 'attendance', 
    title_ar: 'تقارير الحضور', 
    title_en: 'Attendance Reports',
    description_ar: 'تحليل حضور الطلاب والمعلمين',
    description_en: 'Student and teacher attendance analysis',
    icon: Clock, 
    color: 'bg-cyan-500',
    count: 5
  },
  { 
    id: 'behavior', 
    title_ar: 'تقارير السلوك', 
    title_en: 'Behavior Reports',
    description_ar: 'تحليل السلوكيات المسجلة',
    description_en: 'Analysis of recorded behaviors',
    icon: Award, 
    color: 'bg-pink-500',
    count: 4
  },
  { 
    id: 'subscriptions', 
    title_ar: 'تقارير الاشتراكات', 
    title_en: 'Subscription Reports',
    description_ar: 'الحالة التجارية للمنصة',
    description_en: 'Platform commercial status',
    icon: DollarSign, 
    color: 'bg-emerald-500',
    count: 3
  },
  { 
    id: 'usage', 
    title_ar: 'استخدام المنصة', 
    title_en: 'Platform Usage',
    description_ar: 'مستوى استخدام المنصة',
    description_en: 'Platform usage levels',
    icon: Activity, 
    color: 'bg-indigo-500',
    count: 7
  },
  { 
    id: 'ai', 
    title_ar: 'تقارير AI', 
    title_en: 'AI Reports',
    description_ar: 'استخدام ميزات الذكاء الاصطناعي',
    description_en: 'AI features usage',
    icon: Brain, 
    color: 'bg-rose-500',
    count: 5
  },
  { 
    id: 'hcd', 
    title_ar: 'مؤشرات تنمية القدرات', 
    title_en: 'HCD Indicators',
    description_ar: 'مؤشرات تنمية القدرات البشرية',
    description_en: 'Human capability development indicators',
    icon: Target, 
    color: 'bg-amber-500',
    count: 6
  },
];

// Sample chart data
const monthlyData = [
  { month: 'يناير', students: 4200, teachers: 320, schools: 45 },
  { month: 'فبراير', students: 4500, teachers: 340, schools: 48 },
  { month: 'مارس', students: 4800, teachers: 360, schools: 52 },
  { month: 'أبريل', students: 5100, teachers: 380, schools: 55 },
  { month: 'مايو', students: 5400, teachers: 400, schools: 58 },
  { month: 'يونيو', students: 5700, teachers: 420, schools: 62 },
];

const performanceData = [
  { name: 'الرياضيات', value: 78, fullMark: 100 },
  { name: 'العلوم', value: 82, fullMark: 100 },
  { name: 'اللغة العربية', value: 85, fullMark: 100 },
  { name: 'اللغة الإنجليزية', value: 72, fullMark: 100 },
  { name: 'الدراسات', value: 80, fullMark: 100 },
  { name: 'الحاسب', value: 88, fullMark: 100 },
];

const attendanceData = [
  { name: 'حضور', value: 92, color: '#10B981' },
  { name: 'غياب', value: 5, color: '#EF4444' },
  { name: 'تأخر', value: 3, color: '#F59E0B' },
];

const schoolDistribution = [
  { name: 'الرياض', value: 35, color: '#3B82F6' },
  { name: 'جدة', value: 25, color: '#8B5CF6' },
  { name: 'الدمام', value: 15, color: '#06B6D4' },
  { name: 'مكة', value: 12, color: '#10B981' },
  { name: 'أخرى', value: 13, color: '#F59E0B' },
];

// Sample AI insights
const AI_INSIGHTS = [
  {
    id: 1,
    type: 'trend',
    title_ar: 'ارتفاع ملحوظ في نسبة الحضور',
    title_en: 'Notable increase in attendance rate',
    description_ar: 'زادت نسبة الحضور بنسبة 5% مقارنة بالشهر الماضي في 12 مدرسة',
    description_en: 'Attendance rate increased by 5% compared to last month in 12 schools',
    impact: 'positive',
    priority: 'medium',
  },
  {
    id: 2,
    type: 'alert',
    title_ar: '3 مدارس تحتاج متابعة',
    title_en: '3 schools need attention',
    description_ar: 'انخفض مستوى النشاط في 3 مدارس خلال الأسبوعين الماضيين',
    description_en: 'Activity level decreased in 3 schools over the past two weeks',
    impact: 'negative',
    priority: 'high',
  },
  {
    id: 3,
    type: 'recommendation',
    title_ar: 'فرصة لتفعيل AI',
    title_en: 'AI activation opportunity',
    description_ar: '8 مدارس لم تفعّل ميزات AI رغم ارتفاع نشاطها',
    description_en: '8 schools have not activated AI features despite high activity',
    impact: 'neutral',
    priority: 'medium',
  },
  {
    id: 4,
    type: 'trend',
    title_ar: 'تحسن في الأداء الأكاديمي',
    title_en: 'Academic performance improvement',
    description_ar: 'ارتفع متوسط الدرجات بنسبة 3.2% في مادة الرياضيات',
    description_en: 'Average grades increased by 3.2% in Mathematics',
    impact: 'positive',
    priority: 'low',
  },
];

// Sample scheduled reports
const SCHEDULED_REPORTS = [
  { id: 1, name_ar: 'تقرير الحضور الأسبوعي', name_en: 'Weekly Attendance Report', frequency: 'weekly', nextRun: '2026-03-15', recipients: 5 },
  { id: 2, name_ar: 'تقرير الأداء الشهري', name_en: 'Monthly Performance Report', frequency: 'monthly', nextRun: '2026-04-01', recipients: 12 },
  { id: 3, name_ar: 'تقرير الاشتراكات', name_en: 'Subscription Report', frequency: 'monthly', nextRun: '2026-04-01', recipients: 3 },
];

export const PlatformAnalyticsPage = () => {
  const { isRTL = true, isDark } = useTheme();
  const navigate = useNavigate();
  const t = translations[isRTL ? 'ar' : 'en'];
  
  // States
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    school: 'all',
    city: 'all',
    stage: 'all',
    period: 'thisMonth',
  });
  
  // Stats
  const stats = {
    totalSchools: 62,
    totalStudents: 15420,
    totalTeachers: 892,
    activeUsers: 12847,
    avgAttendance: 92,
    avgPerformance: 78,
    aiUsage: 68,
    growthRate: 12.5,
  };
  
  // Handle AI report generation
  const handleGenerateAIReport = () => {
    if (!aiQuery.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال وصف التقرير' : 'Please enter report description');
      return;
    }
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowAIBuilder(false);
      setAiQuery('');
      toast.success(isRTL ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully');
    }, 3000);
  };
  
  // Get impact color
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500">{isRTL ? 'عالية' : 'High'}</Badge>;
      case 'medium': return <Badge className="bg-yellow-500">{isRTL ? 'متوسطة' : 'Medium'}</Badge>;
      default: return <Badge className="bg-green-500">{isRTL ? 'منخفضة' : 'Low'}</Badge>;
    }
  };
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'} data-testid="platform-analytics-page">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <PageHeader 
                title={t.pageTitle} 
                subtitle={t.pageSubtitle}
                icon={BarChart3}
                className="mb-0"
              />
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setShowFilters(true)} className="rounded-xl">
                  <Filter className="h-4 w-4 me-2" />
                  {t.filters}
                </Button>
                <Button 
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => setShowAIBuilder(true)}
                >
                  <Wand2 className="h-4 w-4 me-2" />
                  {t.aiReportBuilder}
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{t.totalSchools}</p>
                      <p className="text-3xl font-bold">{stats.totalSchools}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+8%</span>
                      </div>
                    </div>
                    <Building2 className="h-10 w-10 text-white/30" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{t.totalStudents}</p>
                      <p className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+12%</span>
                      </div>
                    </div>
                    <Users className="h-10 w-10 text-white/30" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{t.totalTeachers}</p>
                      <p className="text-3xl font-bold">{stats.totalTeachers}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+5%</span>
                      </div>
                    </div>
                    <GraduationCap className="h-10 w-10 text-white/30" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{t.activeUsers}</p>
                      <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+{stats.growthRate}%</span>
                      </div>
                    </div>
                    <Activity className="h-10 w-10 text-white/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-fit">
              <TabsTrigger value="overview">{t.overview}</TabsTrigger>
              <TabsTrigger value="reports">{t.reports}</TabsTrigger>
              <TabsTrigger value="insights">{t.aiInsights}</TabsTrigger>
              <TabsTrigger value="tools">{t.tools}</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-brand-navy" />
                      {isRTL ? 'نمو المنصة' : 'Platform Growth'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'تطور أعداد المدارس والطلاب والمعلمين' : 'Schools, students, and teachers growth'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="students" name={isRTL ? 'الطلاب' : 'Students'} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                          <Area type="monotone" dataKey="teachers" name={isRTL ? 'المعلمين' : 'Teachers'} stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* School Distribution */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-brand-navy" />
                      {isRTL ? 'توزيع المدارس حسب المدينة' : 'Schools by City'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPie>
                          <Pie
                            data={schoolDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {schoolDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Performance and Attendance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Performance Radar */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-brand-navy" />
                      {isRTL ? 'الأداء الأكاديمي حسب المادة' : 'Academic Performance by Subject'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={performanceData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name={isRTL ? 'الأداء' : 'Performance'} dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Attendance Distribution */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-navy" />
                      {isRTL ? 'توزيع الحضور' : 'Attendance Distribution'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full max-w-xs">
                        {attendanceData.map((item, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm font-bold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-3" style={{ '--progress-color': item.color } as any} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* AI Insights Summary */}
              <Card className="card-nassaq bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    {isRTL ? 'رؤى الذكاء الاصطناعي' : 'AI Insights'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {AI_INSIGHTS.slice(0, 4).map((insight) => (
                      <div 
                        key={insight.id}
                        className={`p-4 rounded-xl border ${getImpactColor(insight.impact)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-sm">
                            {isRTL ? insight.title_ar : insight.title_en}
                          </h4>
                          {getPriorityBadge(insight.priority)}
                        </div>
                        <p className="text-xs opacity-80">
                          {isRTL ? insight.description_ar : insight.description_en}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {REPORT_CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <Card 
                      key={category.id}
                      className="card-nassaq hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <CardContent className="p-4">
                        <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-3`}>
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-sm mb-1 group-hover:text-brand-navy transition-colors">
                          {isRTL ? category.title_ar : category.title_en}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {isRTL ? category.description_ar : category.description_en}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {category.count} {isRTL ? 'تقرير' : 'reports'}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Recent Reports */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-navy" />
                    {t.recentReports}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-navy/10 rounded-lg">
                            <FileText className="h-4 w-4 text-brand-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {isRTL ? `تقرير الأداء الأكاديمي - الأسبوع ${i}` : `Academic Performance Report - Week ${i}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? `تم الإنشاء: ${10 - i} مارس 2026` : `Created: March ${10 - i}, 2026`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Insights List */}
                <Card className="lg:col-span-2 card-nassaq">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      {t.keyInsights}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {AI_INSIGHTS.map((insight) => (
                        <div 
                          key={insight.id}
                          className={`p-4 rounded-xl border ${getImpactColor(insight.impact)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {insight.type === 'trend' && <TrendingUp className="h-4 w-4" />}
                              {insight.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                              {insight.type === 'recommendation' && <Zap className="h-4 w-4" />}
                              <h4 className="font-bold">
                                {isRTL ? insight.title_ar : insight.title_en}
                              </h4>
                            </div>
                            {getPriorityBadge(insight.priority)}
                          </div>
                          <p className="text-sm opacity-80">
                            {isRTL ? insight.description_ar : insight.description_en}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* AI Summary Generator */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      {t.aiSummary}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <h4 className="font-bold mb-2">{isRTL ? 'ملخص تنفيذي' : 'Executive Summary'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {isRTL 
                          ? 'المنصة تشهد نمواً مستمراً بنسبة 12.5% هذا الشهر. الأداء الأكاديمي في تحسن مع زيادة في نسبة الحضور. 3 مدارس تحتاج متابعة خاصة.'
                          : 'The platform is experiencing continuous growth of 12.5% this month. Academic performance is improving with increased attendance rates. 3 schools need special attention.'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm">{t.recommendations}</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{isRTL ? 'تفعيل AI في 8 مدارس جديدة' : 'Activate AI in 8 new schools'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{isRTL ? 'متابعة المدارس ذات النشاط المنخفض' : 'Follow up with low-activity schools'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{isRTL ? 'تحليل أسباب تحسن الأداء' : 'Analyze performance improvement causes'}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <Download className="h-4 w-4 me-2" />
                      {isRTL ? 'تحميل التقرير الكامل' : 'Download Full Report'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Export */}
                <Card className="card-nassaq hover:shadow-lg transition-all cursor-pointer" onClick={() => toast.success(isRTL ? 'جاري التصدير...' : 'Exporting...')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Download className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="font-bold mb-2">{isRTL ? 'تصدير التقارير' : 'Export Reports'}</h3>
                    <p className="text-sm text-muted-foreground">PDF, Excel, CSV</p>
                  </CardContent>
                </Card>
                
                {/* Schedule */}
                <Card className="card-nassaq hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowScheduleDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-100 flex items-center justify-center">
                      <CalendarClock className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="font-bold mb-2">{t.schedule}</h3>
                    <p className="text-sm text-muted-foreground">{SCHEDULED_REPORTS.length} {isRTL ? 'تقرير مجدول' : 'scheduled'}</p>
                  </CardContent>
                </Card>
                
                {/* Share */}
                <Card className="card-nassaq hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowShareDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Share2 className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="font-bold mb-2">{t.share}</h3>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'مشاركة مع الفريق' : 'Share with team'}</p>
                  </CardContent>
                </Card>
                
                {/* AI Builder */}
                <Card className="card-nassaq hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50" onClick={() => setShowAIBuilder(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Wand2 className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold mb-2">{t.aiReportBuilder}</h3>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'إنشاء تقارير ذكية' : 'Smart report creation'}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Compare Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="card-nassaq hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold">{t.compareSchools}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'مقارنة أداء المدارس' : 'Compare school performance'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ms-auto" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-nassaq hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-bold">{t.comparePeriods}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'مقارنة الفترات الزمنية' : 'Compare time periods'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ms-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Scheduled Reports */}
              <Card className="card-nassaq">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-brand-navy" />
                      {t.scheduledReports}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 me-2" />
                      {isRTL ? 'إضافة جدول' : 'Add Schedule'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SCHEDULED_REPORTS.map((report) => (
                      <div 
                        key={report.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CalendarClock className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {isRTL ? report.name_ar : report.name_en}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? `التالي: ${report.nextRun}` : `Next: ${report.nextRun}`} • {report.recipients} {isRTL ? 'مستلم' : 'recipients'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{report.frequency}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        {/* Filters Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side={isRTL ? 'right' : 'left'} className="w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand-navy" />
                {t.filters}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label>{t.selectSchool}</Label>
                <Select value={filters.school} onValueChange={(v) => setFilters({ ...filters, school: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSchools}</SelectItem>
                    <SelectItem value="school1">{isRTL ? 'مدرسة النور' : 'Al-Noor School'}</SelectItem>
                    <SelectItem value="school2">{isRTL ? 'ثانوية الملك فهد' : 'King Fahd Secondary'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.selectCity}</Label>
                <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCities}</SelectItem>
                    <SelectItem value="riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</SelectItem>
                    <SelectItem value="jeddah">{isRTL ? 'جدة' : 'Jeddah'}</SelectItem>
                    <SelectItem value="dammam">{isRTL ? 'الدمام' : 'Dammam'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.selectPeriod}</Label>
                <Select value={filters.period} onValueChange={(v) => setFilters({ ...filters, period: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                    <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                    <SelectItem value="thisQuarter">{t.thisQuarter}</SelectItem>
                    <SelectItem value="thisYear">{t.thisYear}</SelectItem>
                    <SelectItem value="custom">{t.custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-brand-navy" onClick={() => { setShowFilters(false); toast.success(isRTL ? 'تم تطبيق الفلاتر' : 'Filters applied'); }}>
                  {t.apply}
                </Button>
                <Button variant="outline" onClick={() => setFilters({ school: 'all', city: 'all', stage: 'all', period: 'thisMonth' })}>
                  {t.reset}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* AI Report Builder Dialog */}
        <Dialog open={showAIBuilder} onOpenChange={setShowAIBuilder}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                {t.aiReportBuilder}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'اكتب وصفاً للتقرير الذي تريده وسيقوم الذكاء الاصطناعي بإنشائه'
                  : 'Describe the report you want and AI will generate it'}
              </DialogDescription>
            </DialogHeader>
            
            {isGenerating ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                </div>
                <p className="font-medium">{isRTL ? 'جاري إنشاء التقرير...' : 'Generating report...'}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL ? 'يرجى الانتظار' : 'Please wait'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder={isRTL 
                      ? 'مثال: تحليل أداء المدارس خلال الشهر الماضي مع مقارنة بين المناطق'
                      : 'Example: Analyze school performance over the past month with regional comparison'}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiQuery(isRTL ? 'تحليل أداء المدارس خلال الشهر الماضي' : 'Analyze school performance last month')}
                    >
                      {isRTL ? 'أداء المدارس' : 'School Performance'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiQuery(isRTL ? 'مقارنة أداء الطلاب بين المراحل التعليمية' : 'Compare student performance between stages')}
                    >
                      {isRTL ? 'مقارنة الطلاب' : 'Student Comparison'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiQuery(isRTL ? 'تقرير الحضور والغياب الأسبوعي' : 'Weekly attendance report')}
                    >
                      {isRTL ? 'تقرير الحضور' : 'Attendance Report'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiQuery(isRTL ? 'تحليل استخدام ميزات الذكاء الاصطناعي' : 'Analyze AI features usage')}
                    >
                      {isRTL ? 'استخدام AI' : 'AI Usage'}
                    </Button>
                  </div>
                </div>
                
                <DialogFooter className="flex-row-reverse gap-2">
                  <Button variant="outline" onClick={() => setShowAIBuilder(false)}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button onClick={handleGenerateAIReport} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Sparkles className="h-4 w-4 me-2" />
                    {t.generateReport}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-green-600" />
                {isRTL ? 'جدولة تقرير' : 'Schedule Report'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم التقرير' : 'Report Name'}</Label>
                <Input placeholder={isRTL ? 'أدخل اسم التقرير' : 'Enter report name'} />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'التكرار' : 'Frequency'}</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{isRTL ? 'يومي' : 'Daily'}</SelectItem>
                    <SelectItem value="weekly">{isRTL ? 'أسبوعي' : 'Weekly'}</SelectItem>
                    <SelectItem value="monthly">{isRTL ? 'شهري' : 'Monthly'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'المستلمين' : 'Recipients'}</Label>
                <Input placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email addresses'} />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={() => { setShowScheduleDialog(false); toast.success(isRTL ? 'تم جدولة التقرير' : 'Report scheduled'); }} className="bg-green-600 hover:bg-green-700">
                <CalendarClock className="h-4 w-4 me-2" />
                {isRTL ? 'جدولة' : 'Schedule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-600" />
                {isRTL ? 'مشاركة التقرير' : 'Share Report'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'} type="email" />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'رسالة (اختياري)' : 'Message (optional)'}</Label>
                <Textarea placeholder={isRTL ? 'أضف رسالة...' : 'Add a message...'} rows={3} />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={() => { setShowShareDialog(false); toast.success(isRTL ? 'تم إرسال التقرير' : 'Report sent'); }} className="bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4 me-2" />
                {isRTL ? 'إرسال' : 'Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
};

export default PlatformAnalyticsPage;
