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
import { Checkbox } from '../components/ui/checkbox';
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
  SheetFooter,
} from '../components/ui/sheet';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  LineChart as LineChartIcon,
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
  UserCheck,
  BookOpen,
  Clock,
  FileText,
  Brain,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Check,
  ChevronRight,
  Eye,
  FileDown,
  Mail,
  Printer,
  CalendarClock,
  ArrowUpDown,
  Scale,
  Loader2,
  Save,
  Settings,
  ListFilter,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Target,
  Award,
  Activity,
  Zap,
  School,
  MapPin,
  Link as LinkIcon,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Translations
const translations = {
  ar: {
    pageTitle: 'التقارير والتحليلات',
    pageSubtitle: 'تحليل البيانات التعليمية واستخراج التقارير',
    overview: 'نظرة عامة',
    reports: 'التقارير',
    aiInsights: 'رؤى الذكاء الاصطناعي',
    tools: 'الأدوات',
    totalSchools: 'إجمالي المدارس',
    totalStudents: 'إجمالي الطلاب',
    totalTeachers: 'إجمالي المعلمين',
    activeUsers: 'المستخدمين النشطين',
    schoolDistribution: 'توزيع المدارس حسب المدينة',
    attendanceRates: 'نسب الحضور في جميع المدارس',
    growthTrend: 'اتجاه النمو',
    performanceOverview: 'نظرة عامة على الأداء',
    filters: 'الفلاتر',
    applyFilters: 'تطبيق الفلاتر',
    resetFilters: 'إعادة تعيين',
    saveFilters: 'حفظ الفلاتر',
    exportReport: 'تصدير التقرير',
    scheduleReport: 'جدولة التقرير',
    shareReport: 'مشاركة التقرير',
    aiReportBuilder: 'منشئ التقارير بالذكاء الاصطناعي',
    compareSchools: 'مقارنة المدارس',
    comparePeriods: 'مقارنة الفترات',
    downloadAISummary: 'تحميل ملخص AI',
    recentReports: 'التقارير الأخيرة',
    scheduledReports: 'التقارير المجدولة',
    addScheduledReport: 'إضافة تقرير',
    viewReport: 'عرض التقرير',
    downloadReport: 'تحميل التقرير',
    reportName: 'اسم التقرير',
    reportType: 'نوع التقرير',
    selectSchools: 'اختر المدارس',
    selectPeriod: 'اختر الفترة',
    frequency: 'التكرار',
    recipients: 'المستلمين',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisSemester: 'هذا الفصل',
    thisYear: 'هذه السنة',
    customRange: 'نطاق مخصص',
    allSchools: 'جميع المدارس',
    allCities: 'جميع المدن',
    allStages: 'جميع المراحل',
    primary: 'ابتدائي',
    middle: 'متوسط',
    secondary: 'ثانوي',
    schoolReports: 'تقارير المدارس',
    studentReports: 'تقارير الطلاب',
    teacherReports: 'تقارير المعلمين',
    academicReports: 'الأداء الأكاديمي',
    attendanceReports: 'تقارير الحضور',
    behaviorReports: 'تقارير السلوك',
    subscriptionReports: 'تقارير الاشتراكات',
    usageReports: 'استخدام المنصة',
    aiReports: 'تقارير AI',
    hcdReports: 'مؤشرات تنمية القدرات',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
    generate: 'إنشاء',
    activeFilters: 'الفلاتر المفعلة',
    city: 'المدينة',
    stage: 'المرحلة',
    period: 'الفترة',
    school: 'المدرسة',
    status: 'الحالة',
    active: 'نشط',
    suspended: 'معلق',
    all: 'الكل',
    Riyadh: 'الرياض',
    Jeddah: 'جدة',
    Makkah: 'مكة المكرمة',
    Madinah: 'المدينة المنورة',
    Dammam: 'الدمام',
  },
  en: {
    pageTitle: 'Analytics & Reports',
    pageSubtitle: 'Analyze educational data and generate reports',
    overview: 'Overview',
    reports: 'Reports',
    aiInsights: 'AI Insights',
    tools: 'Tools',
    totalSchools: 'Total Schools',
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    activeUsers: 'Active Users',
    schoolDistribution: 'School Distribution by City',
    attendanceRates: 'Attendance Rates in All Schools',
    growthTrend: 'Growth Trend',
    performanceOverview: 'Performance Overview',
    filters: 'Filters',
    applyFilters: 'Apply Filters',
    resetFilters: 'Reset',
    saveFilters: 'Save Filters',
    exportReport: 'Export Report',
    scheduleReport: 'Schedule Report',
    shareReport: 'Share Report',
    aiReportBuilder: 'AI Report Builder',
    compareSchools: 'Compare Schools',
    comparePeriods: 'Compare Periods',
    downloadAISummary: 'Download AI Summary',
    recentReports: 'Recent Reports',
    scheduledReports: 'Scheduled Reports',
    addScheduledReport: 'Add Report',
    viewReport: 'View Report',
    downloadReport: 'Download Report',
    reportName: 'Report Name',
    reportType: 'Report Type',
    selectSchools: 'Select Schools',
    selectPeriod: 'Select Period',
    frequency: 'Frequency',
    recipients: 'Recipients',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisSemester: 'This Semester',
    thisYear: 'This Year',
    customRange: 'Custom Range',
    allSchools: 'All Schools',
    allCities: 'All Cities',
    allStages: 'All Stages',
    primary: 'Primary',
    middle: 'Middle',
    secondary: 'Secondary',
    schoolReports: 'School Reports',
    studentReports: 'Student Reports',
    teacherReports: 'Teacher Reports',
    academicReports: 'Academic Performance',
    attendanceReports: 'Attendance Reports',
    behaviorReports: 'Behavior Reports',
    subscriptionReports: 'Subscription Reports',
    usageReports: 'Platform Usage',
    aiReports: 'AI Reports',
    hcdReports: 'HCD Indicators',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    generate: 'Generate',
    activeFilters: 'Active Filters',
    city: 'City',
    stage: 'Stage',
    period: 'Period',
    school: 'School',
    status: 'Status',
    active: 'Active',
    suspended: 'Suspended',
    all: 'All',
    Riyadh: 'Riyadh',
    Jeddah: 'Jeddah',
    Makkah: 'Makkah',
    Madinah: 'Madinah',
    Dammam: 'Dammam',
  }
};

// City data for distribution chart
const CITIES_DATA = [
  { name: 'الرياض', name_en: 'Riyadh', value: 45, color: '#2563eb' },
  { name: 'جدة', name_en: 'Jeddah', value: 28, color: '#16a34a' },
  { name: 'مكة المكرمة', name_en: 'Makkah', value: 18, color: '#dc2626' },
  { name: 'المدينة المنورة', name_en: 'Madinah', value: 15, color: '#9333ea' },
  { name: 'الدمام', name_en: 'Dammam', value: 12, color: '#ea580c' },
  { name: 'الطائف', name_en: 'Taif', value: 8, color: '#0891b2' },
  { name: 'تبوك', name_en: 'Tabuk', value: 6, color: '#4f46e5' },
  { name: 'أبها', name_en: 'Abha', value: 5, color: '#db2777' },
];

// Attendance data
const ATTENDANCE_DATA = [
  { name: 'حاضر', name_en: 'Present', value: 85, color: '#22c55e' },
  { name: 'غائب', name_en: 'Absent', value: 10, color: '#ef4444' },
  { name: 'متأخر', name_en: 'Late', value: 5, color: '#f59e0b' },
];

// Growth data
const GROWTH_DATA = [
  { month: 'يناير', schools: 85, students: 12000, teachers: 800 },
  { month: 'فبراير', schools: 92, students: 13500, teachers: 850 },
  { month: 'مارس', schools: 98, students: 14200, teachers: 890 },
  { month: 'أبريل', schools: 105, students: 15000, teachers: 920 },
  { month: 'مايو', schools: 112, students: 16200, teachers: 980 },
  { month: 'يونيو', schools: 118, students: 17500, teachers: 1020 },
];

// Report types
const REPORT_TYPES = [
  { id: 'school', icon: Building2, label_ar: 'تقارير المدارس', label_en: 'School Reports' },
  { id: 'student', icon: GraduationCap, label_ar: 'تقارير الطلاب', label_en: 'Student Reports' },
  { id: 'teacher', icon: Users, label_ar: 'تقارير المعلمين', label_en: 'Teacher Reports' },
  { id: 'academic', icon: BookOpen, label_ar: 'الأداء الأكاديمي', label_en: 'Academic Performance' },
  { id: 'attendance', icon: UserCheck, label_ar: 'تقارير الحضور', label_en: 'Attendance Reports' },
  { id: 'behavior', icon: Activity, label_ar: 'تقارير السلوك', label_en: 'Behavior Reports' },
  { id: 'subscription', icon: FileText, label_ar: 'تقارير الاشتراكات', label_en: 'Subscription Reports' },
  { id: 'usage', icon: BarChart3, label_ar: 'استخدام المنصة', label_en: 'Platform Usage' },
  { id: 'ai', icon: Brain, label_ar: 'تقارير AI', label_en: 'AI Reports' },
  { id: 'hcd', icon: Target, label_ar: 'مؤشرات تنمية القدرات', label_en: 'HCD Indicators' },
];

// AI Insights data
const AI_INSIGHTS = [
  {
    id: 1,
    type: 'trend',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-100',
    title_ar: 'نمو إيجابي في التسجيل',
    title_en: 'Positive Enrollment Growth',
    description_ar: 'زيادة بنسبة 15% في تسجيل الطلاب الجدد مقارنة بالشهر الماضي',
    description_en: '15% increase in new student enrollment compared to last month',
    impact: 'positive',
    priority: 'low'
  },
  {
    id: 2,
    type: 'alert',
    icon: AlertTriangle,
    color: 'text-orange-600 bg-orange-100',
    title_ar: '5 مدارس تحتاج متابعة',
    title_en: '5 Schools Need Attention',
    description_ar: 'انخفاض في معدل الحضور خلال الأسبوعين الماضيين',
    description_en: 'Attendance rate dropped in the last two weeks',
    impact: 'negative',
    priority: 'high'
  },
  {
    id: 3,
    type: 'recommendation',
    icon: Lightbulb,
    color: 'text-blue-600 bg-blue-100',
    title_ar: 'فرصة لتحسين الأداء',
    title_en: 'Performance Improvement Opportunity',
    description_ar: '12 مدرسة يمكنها تفعيل ميزات AI لتحسين نتائج الطلاب',
    description_en: '12 schools can activate AI features to improve student results',
    impact: 'neutral',
    priority: 'medium'
  },
  {
    id: 4,
    type: 'achievement',
    icon: Award,
    color: 'text-purple-600 bg-purple-100',
    title_ar: 'إنجاز أكاديمي متميز',
    title_en: 'Outstanding Academic Achievement',
    description_ar: '3 مدارس حققت نسبة نجاح 100% هذا الفصل',
    description_en: '3 schools achieved 100% success rate this semester',
    impact: 'positive',
    priority: 'low'
  },
];

// Recent reports
const RECENT_REPORTS = [
  { id: 1, name: 'تقرير الحضور الشهري', name_en: 'Monthly Attendance Report', type: 'attendance', date: '2026-03-08', status: 'ready' },
  { id: 2, name: 'أداء المدارس Q1', name_en: 'Schools Performance Q1', type: 'school', date: '2026-03-07', status: 'ready' },
  { id: 3, name: 'تحليل نتائج الفصل', name_en: 'Semester Results Analysis', type: 'academic', date: '2026-03-05', status: 'ready' },
  { id: 4, name: 'استخدام النظام', name_en: 'System Usage Report', type: 'usage', date: '2026-03-03', status: 'ready' },
];

// Scheduled reports
const SCHEDULED_REPORTS = [
  { id: 1, name: 'تقرير الحضور اليومي', name_en: 'Daily Attendance', frequency: 'daily', nextRun: '2026-03-10T08:00', recipients: 2 },
  { id: 2, name: 'ملخص أسبوعي', name_en: 'Weekly Summary', frequency: 'weekly', nextRun: '2026-03-15T09:00', recipients: 5 },
  { id: 3, name: 'تقرير شهري للإدارة', name_en: 'Monthly Management Report', frequency: 'monthly', nextRun: '2026-04-01T10:00', recipients: 3 },
];

export const PlatformAnalyticsPage = () => {
  const { isRTL = true, isDark } = useTheme();
  const navigate = useNavigate();
  const t = translations[isRTL ? 'ar' : 'en'];
  
  // States
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAIBuilderDialog, setShowAIBuilderDialog] = useState(false);
  const [showCompareSchoolsDialog, setShowCompareSchoolsDialog] = useState(false);
  const [showComparePeriodsDialog, setShowComparePeriodsDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showAddScheduledDialog, setShowAddScheduledDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [aiQuery, setAIQuery] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    period: 'thisMonth',
    city: 'all',
    stage: 'all',
    school: 'all',
    status: 'all',
    reportType: 'all',
    customDateFrom: '',
    customDateTo: '',
  });
  
  // Active filters display
  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all' && v !== 'thisMonth' && v !== '').length;
  
  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'school',
    schools: 'all',
    frequency: 'weekly',
    recipients: '',
  });
  
  // Stats from API
  const [stats, setStats] = useState({
    totalSchools: 110,
    totalStudents: 6000,
    totalTeachers: 750,
    activeUsers: 14750,
    totalParents: 8000,
    growthRate: 12.5,
  });
  
  // Data loaded flag
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/stats`);
        if (response.ok) {
          const data = await response.json();
          console.log('Stats loaded:', data);
          setStats({
            totalSchools: data.schools || 110,
            totalStudents: data.students || 6000,
            totalTeachers: data.teachers || 750,
            totalParents: data.parents || 8000,
            activeUsers: (data.students || 6000) + (data.teachers || 750) + (data.parents || 8000),
            growthRate: 12.5,
          });
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setDataLoaded(true);
      }
    };
    fetchStats();
  }, []);
  
  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    toast.success(isRTL ? 'تم تطبيق الفلاتر بنجاح' : 'Filters applied successfully');
    setShowFiltersSheet(false);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      period: 'thisMonth',
      city: 'all',
      stage: 'all',
      school: 'all',
      status: 'all',
      reportType: 'all',
      customDateFrom: '',
      customDateTo: '',
    });
    toast.success(isRTL ? 'تم إعادة تعيين الفلاتر' : 'Filters reset');
  };
  
  // Save filters
  const handleSaveFilters = () => {
    toast.success(isRTL ? 'تم حفظ الفلاتر' : 'Filters saved');
  };
  
  // Export report - تنزيل حقيقي للتقرير
  const handleExport = () => {
    setLoading(true);
    
    // إنشاء بيانات التقرير
    const reportData = {
      generated_at: new Date().toISOString(),
      period: filters.period,
      stats: stats,
      charts: {
        schools_by_city: SCHOOLS_BY_CITY,
        attendance_rates: ATTENDANCE_DATA,
        ai_insights: AI_INSIGHTS,
      },
      summary: isRTL 
        ? `تقرير شامل للمنصة - ${stats.totalSchools} مدرسة - ${stats.totalStudents} طالب`
        : `Platform Report - ${stats.totalSchools} schools - ${stats.totalStudents} students`,
    };
    
    let blob;
    let filename;
    
    if (exportFormat === 'pdf') {
      // للـ PDF نُنشئ HTML بسيط
      const htmlContent = `
        <html dir="${isRTL ? 'rtl' : 'ltr'}">
        <head><title>تقرير المنصة</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>تقرير تحليلات المنصة</h1>
          <p>تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</p>
          <hr/>
          <h2>الإحصائيات</h2>
          <ul>
            <li>إجمالي المدارس: ${stats.totalSchools}</li>
            <li>إجمالي الطلاب: ${stats.totalStudents}</li>
            <li>إجمالي المعلمين: ${stats.totalTeachers}</li>
            <li>نسبة النمو: ${stats.growthRate}%</li>
          </ul>
        </body>
        </html>
      `;
      blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      filename = `platform_report_${new Date().toISOString().split('T')[0]}.html`;
    } else if (exportFormat === 'excel' || exportFormat === 'csv') {
      // للـ CSV/Excel
      const csvContent = [
        'المؤشر,القيمة',
        `إجمالي المدارس,${stats.totalSchools}`,
        `إجمالي الطلاب,${stats.totalStudents}`,
        `إجمالي المعلمين,${stats.totalTeachers}`,
        `المستخدمين النشطين,${stats.activeUsers}`,
        `نسبة النمو,${stats.growthRate}%`,
      ].join('\n');
      blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      filename = `platform_report_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // JSON
      blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      filename = `platform_report_${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    setLoading(false);
    toast.success(isRTL ? `تم تحميل التقرير بصيغة ${exportFormat.toUpperCase()}` : `Report downloaded as ${exportFormat.toUpperCase()}`);
    setShowExportDialog(false);
  };
  
  // Download AI summary
  const handleDownloadAISummary = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(isRTL ? 'تم تحميل ملخص AI' : 'AI Summary downloaded');
    }, 1500);
  };
  
  // Generate AI report
  const handleGenerateAIReport = () => {
    if (!aiQuery) return;
    setGeneratingAI(true);
    setTimeout(() => {
      setGeneratingAI(false);
      toast.success(isRTL ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully');
      setShowAIBuilderDialog(false);
      setAIQuery('');
    }, 3000);
  };
  
  // Schedule report
  const handleScheduleReport = () => {
    toast.success(isRTL ? 'تم جدولة التقرير بنجاح' : 'Report scheduled successfully');
    setShowScheduleDialog(false);
    setShowAddScheduledDialog(false);
  };
  
  // Share report
  const handleShareReport = () => {
    toast.success(isRTL ? 'تم إرسال التقرير بنجاح' : 'Report shared successfully');
    setShowShareDialog(false);
  };
  
  // Preview report
  const openPreview = (report) => {
    setSelectedReport(report);
    setShowPreviewDialog(true);
  };
  
  // Remove active filter
  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: key === 'period' ? 'thisMonth' : 'all' }));
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'} data-testid="analytics-page">
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl"
                  onClick={() => setShowFiltersSheet(true)}
                >
                  <Filter className="h-4 w-4 me-2" />
                  {t.filters}
                  {activeFiltersCount > 0 && (
                    <Badge className="ms-2 bg-brand-navy">{activeFiltersCount}</Badge>
                  )}
                </Button>
                <Button 
                  className="rounded-xl bg-brand-navy hover:bg-brand-navy/90"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 me-2" />
                  {t.exportReport}
                </Button>
              </div>
            </div>
            
            {/* Active Filters Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap py-2 px-3 bg-brand-navy/5 rounded-xl mb-4">
                <span className="text-sm font-medium text-muted-foreground">{t.activeFilters}:</span>
                {filters.city !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t.city}: {t[filters.city] || filters.city}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('city')} />
                  </Badge>
                )}
                {filters.stage !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t.stage}: {t[filters.stage]}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('stage')} />
                  </Badge>
                )}
                {filters.period !== 'thisMonth' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t.period}: {t[filters.period]}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('period')} />
                  </Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t.status}: {t[filters.status]}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('status')} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-6 px-2">
                  <RotateCcw className="h-3 w-3 me-1" />
                  {t.resetFilters}
                </Button>
              </div>
            )}
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t.overview}
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t.reports}
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                {t.aiInsights}
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t.tools}
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.totalSchools}</p>
                        <p className="text-3xl font-bold">{stats.totalSchools}</p>
                        <p className="text-xs text-white/60 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 me-1" />
                          +{stats.growthRate}%
                        </p>
                      </div>
                      <Building2 className="h-12 w-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.totalStudents}</p>
                        <p className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                        <p className="text-xs text-white/60 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 me-1" />
                          +8.2%
                        </p>
                      </div>
                      <GraduationCap className="h-12 w-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.totalTeachers}</p>
                        <p className="text-3xl font-bold">{stats.totalTeachers.toLocaleString()}</p>
                        <p className="text-xs text-white/60 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 me-1" />
                          +5.4%
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.activeUsers}</p>
                        <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                        <p className="text-xs text-white/60 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 me-1" />
                          +15.7%
                        </p>
                      </div>
                      <Activity className="h-12 w-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* School Distribution by City */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-brand-navy" />
                      {t.schoolDistribution}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={CITIES_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, name_en, value, percent }) => 
                              `${isRTL ? name : name_en}: ${value} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {CITIES_DATA.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 rounded-lg shadow-lg border">
                                    <p className="font-bold">{isRTL ? data.name : data.name_en}</p>
                                    <p className="text-sm">عدد المدارس: {data.value}</p>
                                    <p className="text-sm text-muted-foreground">
                                      النسبة: {((data.value / CITIES_DATA.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {CITIES_DATA.map((city, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: city.color }} />
                          {isRTL ? city.name : city.name_en}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Attendance Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-brand-navy" />
                      {t.attendanceRates}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ATTENDANCE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, name_en, value }) => 
                              `${isRTL ? name : name_en}: ${value}%`
                            }
                          >
                            {ATTENDANCE_DATA.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 rounded-lg shadow-lg border">
                                    <p className="font-bold">{isRTL ? data.name : data.name_en}</p>
                                    <p className="text-sm">النسبة: {data.value}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Stats below chart */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {ATTENDANCE_DATA.map((item, idx) => (
                        <div key={idx} className="text-center p-3 rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                          <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}%</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? item.name : item.name_en}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Growth Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-navy" />
                    {t.growthTrend}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={GROWTH_DATA}>
                        <defs>
                          <linearGradient id="colorSchools" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="schools"
                          stroke="#2563eb"
                          fillOpacity={1}
                          fill="url(#colorSchools)"
                          name={isRTL ? 'المدارس' : 'Schools'}
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="students"
                          stroke="#16a34a"
                          fillOpacity={1}
                          fill="url(#colorStudents)"
                          name={isRTL ? 'الطلاب' : 'Students'}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Report Types Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {REPORT_TYPES.map(type => {
                  const TypeIcon = type.icon;
                  return (
                    <Card 
                      key={type.id}
                      className="cursor-pointer hover:shadow-lg transition-all hover:border-brand-navy/30"
                      onClick={() => setFilters(prev => ({ ...prev, reportType: type.id }))}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                          <TypeIcon className="h-6 w-6 text-brand-navy" />
                        </div>
                        <p className="text-sm font-medium">{isRTL ? type.label_ar : type.label_en}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Recent Reports */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-navy" />
                    {t.recentReports}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {RECENT_REPORTS.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-brand-navy" />
                          <div>
                            <p className="font-medium">{isRTL ? report.name : report.name_en}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(report.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreview(report)}
                          >
                            <Eye className="h-4 w-4 me-1" />
                            {t.viewReport}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowExportDialog(true);
                            }}
                          >
                            <Download className="h-4 w-4 me-1" />
                            {t.downloadReport}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Scheduled Reports */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-brand-navy" />
                    {t.scheduledReports}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => setShowAddScheduledDialog(true)}
                  >
                    <Plus className="h-4 w-4 me-1" />
                    {t.addScheduledReport}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SCHEDULED_REPORTS.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CalendarClock className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">{isRTL ? report.name : report.name_en}</p>
                            <p className="text-sm text-muted-foreground">
                              {t[report.frequency]} • {report.recipients} {isRTL ? 'مستلم' : 'recipients'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{formatDate(report.nextRun)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* AI Summary Card */}
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Brain className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{isRTL ? 'ملخص الذكاء الاصطناعي' : 'AI Summary'}</h3>
                        <p className="text-white/80">
                          {isRTL ? 'تحليل شامل لبيانات المنصة' : 'Comprehensive platform data analysis'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="rounded-xl"
                      onClick={handleDownloadAISummary}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                      ) : (
                        <Download className="h-4 w-4 me-2" />
                      )}
                      {t.downloadAISummary}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Insights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_INSIGHTS.map(insight => {
                  const InsightIcon = insight.icon;
                  return (
                    <Card 
                      key={insight.id} 
                      className="hover:shadow-lg transition-all cursor-pointer"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${insight.color}`}>
                            <InsightIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">{isRTL ? insight.title_ar : insight.title_en}</h4>
                              <Badge 
                                variant="outline"
                                className={
                                  insight.priority === 'high' ? 'border-red-500 text-red-500' :
                                  insight.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-green-500 text-green-500'
                                }
                              >
                                {insight.priority === 'high' ? (isRTL ? 'عالي' : 'High') :
                                 insight.priority === 'medium' ? (isRTL ? 'متوسط' : 'Medium') :
                                 (isRTL ? 'منخفض' : 'Low')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? insight.description_ar : insight.description_en}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* AI Report Builder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-navy" />
                    {t.aiReportBuilder}
                  </CardTitle>
                  <CardDescription>
                    {isRTL 
                      ? 'اكتب طلبك بالعربية وسيقوم الذكاء الاصطناعي بإنشاء التقرير'
                      : 'Write your request and AI will generate the report'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      value={aiQuery}
                      onChange={(e) => setAIQuery(e.target.value)}
                      placeholder={isRTL ? 'مثال: تحليل أداء المدارس خلال آخر 3 أشهر' : 'e.g., Analyze school performance in the last 3 months'}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleGenerateAIReport}
                      disabled={!aiQuery || generatingAI}
                      className="bg-brand-navy rounded-xl"
                    >
                      {generatingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                      ) : (
                        <Zap className="h-4 w-4 me-2" />
                      )}
                      {t.generate}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Export Reports */}
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowExportDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Download className="h-7 w-7 text-blue-600" />
                    </div>
                    <h4 className="font-bold mb-1">{t.exportReport}</h4>
                    <p className="text-sm text-muted-foreground">PDF, Excel, CSV</p>
                  </CardContent>
                </Card>
                
                {/* Schedule Reports */}
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowScheduleDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
                      <CalendarClock className="h-7 w-7 text-purple-600" />
                    </div>
                    <h4 className="font-bold mb-1">{t.scheduleReport}</h4>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'يومي، أسبوعي، شهري' : 'Daily, Weekly, Monthly'}</p>
                  </CardContent>
                </Card>
                
                {/* Share Reports */}
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowShareDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                      <Share2 className="h-7 w-7 text-green-600" />
                    </div>
                    <h4 className="font-bold mb-1">{t.shareReport}</h4>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'بريد، رابط، فريق' : 'Email, Link, Team'}</p>
                  </CardContent>
                </Card>
                
                {/* AI Report Builder */}
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowAIBuilderDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-pink-100 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-pink-600" />
                    </div>
                    <h4 className="font-bold mb-1">{t.aiReportBuilder}</h4>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'إنشاء تقرير ذكي' : 'Generate Smart Report'}</p>
                  </CardContent>
                </Card>
                
                {/* Compare Schools */}
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowCompareSchoolsDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <Scale className="h-7 w-7 text-orange-600" />
                    </div>
                    <h4 className="font-bold mb-1">{t.compareSchools}</h4>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'مقارنة الأداء' : 'Compare Performance'}</p>
                  </CardContent>
                </Card>
                
                {/* Compare Periods */}
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowComparePeriodsDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-100 flex items-center justify-center">
                      <ArrowUpDown className="h-7 w-7 text-cyan-600" />
                    </div>
                    <h4 className="font-bold mb-1">{t.comparePeriods}</h4>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'مقارنة زمنية' : 'Time Comparison'}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        {/* Filters Sheet */}
        <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[400px] sm:w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand-navy" />
                {t.filters}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-6">
              {/* Period Filter */}
              <div className="space-y-2">
                <Label>{t.period}</Label>
                <Select value={filters.period} onValueChange={(v) => setFilters(prev => ({ ...prev, period: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">{t.today}</SelectItem>
                    <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                    <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                    <SelectItem value="thisSemester">{t.thisSemester}</SelectItem>
                    <SelectItem value="thisYear">{t.thisYear}</SelectItem>
                    <SelectItem value="customRange">{t.customRange}</SelectItem>
                  </SelectContent>
                </Select>
                
                {filters.period === 'customRange' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{isRTL ? 'من' : 'From'}</Label>
                      <Input
                        type="date"
                        value={filters.customDateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{isRTL ? 'إلى' : 'To'}</Label>
                      <Input
                        type="date"
                        value={filters.customDateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* School Filter */}
              <div className="space-y-2">
                <Label>{t.school}</Label>
                <Select value={filters.school} onValueChange={(v) => setFilters(prev => ({ ...prev, school: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSchools}</SelectItem>
                    <SelectItem value="school1">{isRTL ? 'مدرسة النور' : 'Al Noor School'}</SelectItem>
                    <SelectItem value="school2">{isRTL ? 'مدرسة الأمل' : 'Al Amal School'}</SelectItem>
                    <SelectItem value="school3">{isRTL ? 'مدرسة التميز' : 'Excellence School'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* City Filter */}
              <div className="space-y-2">
                <Label>{t.city}</Label>
                <Select value={filters.city} onValueChange={(v) => setFilters(prev => ({ ...prev, city: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCities}</SelectItem>
                    <SelectItem value="Riyadh">{t.Riyadh}</SelectItem>
                    <SelectItem value="Jeddah">{t.Jeddah}</SelectItem>
                    <SelectItem value="Makkah">{t.Makkah}</SelectItem>
                    <SelectItem value="Madinah">{t.Madinah}</SelectItem>
                    <SelectItem value="Dammam">{t.Dammam}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Stage Filter */}
              <div className="space-y-2">
                <Label>{t.stage}</Label>
                <Select value={filters.stage} onValueChange={(v) => setFilters(prev => ({ ...prev, stage: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStages}</SelectItem>
                    <SelectItem value="primary">{t.primary}</SelectItem>
                    <SelectItem value="middle">{t.middle}</SelectItem>
                    <SelectItem value="secondary">{t.secondary}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>{t.status}</Label>
                <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="suspended">{t.suspended}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Report Type Filter */}
              <div className="space-y-2">
                <Label>{t.reportType}</Label>
                <Select value={filters.reportType} onValueChange={(v) => setFilters(prev => ({ ...prev, reportType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {REPORT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {isRTL ? type.label_ar : type.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="flex gap-2">
              <Button variant="outline" onClick={handleResetFilters} className="flex-1 rounded-xl">
                <RotateCcw className="h-4 w-4 me-2" />
                {t.resetFilters}
              </Button>
              <Button variant="outline" onClick={handleSaveFilters} className="rounded-xl">
                <Save className="h-4 w-4 me-2" />
                {t.saveFilters}
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1 bg-brand-navy rounded-xl">
                <Check className="h-4 w-4 me-2" />
                {t.applyFilters}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-brand-navy" />
                {t.exportReport}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'اختر صيغة التقرير للتحميل' : 'Choose report format to download'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {['pdf', 'excel', 'csv'].map(format => (
                  <Button
                    key={format}
                    variant={exportFormat === format ? 'default' : 'outline'}
                    className={`h-20 flex-col rounded-xl ${exportFormat === format ? 'bg-brand-navy' : ''}`}
                    onClick={() => setExportFormat(format)}
                  >
                    <FileDown className="h-6 w-6 mb-2" />
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleExport} disabled={loading} className="bg-brand-navy">
                {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Download className="h-4 w-4 me-2" />}
                {t.downloadReport}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Schedule Report Dialog */}
        <Dialog open={showScheduleDialog || showAddScheduledDialog} onOpenChange={(open) => {
          setShowScheduleDialog(open);
          setShowAddScheduledDialog(open);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-brand-navy" />
                {t.scheduleReport}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>{t.reportName}</Label>
                <Input
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={isRTL ? 'اسم التقرير' : 'Report name'}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.reportType}</Label>
                <Select value={scheduleForm.type} onValueChange={(v) => setScheduleForm(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {isRTL ? type.label_ar : type.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.selectSchools}</Label>
                <Select value={scheduleForm.schools} onValueChange={(v) => setScheduleForm(prev => ({ ...prev, schools: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSchools}</SelectItem>
                    <SelectItem value="selected">{isRTL ? 'مدارس محددة' : 'Selected Schools'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.frequency}</Label>
                <Select value={scheduleForm.frequency} onValueChange={(v) => setScheduleForm(prev => ({ ...prev, frequency: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t.daily}</SelectItem>
                    <SelectItem value="weekly">{t.weekly}</SelectItem>
                    <SelectItem value="monthly">{t.monthly}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.recipients}</Label>
                <Input
                  value={scheduleForm.recipients}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder={isRTL ? 'البريد الإلكتروني (مفصول بفاصلة)' : 'Email addresses (comma separated)'}
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => {
                setShowScheduleDialog(false);
                setShowAddScheduledDialog(false);
              }}>
                {t.cancel}
              </Button>
              <Button onClick={handleScheduleReport} className="bg-brand-navy">
                <Check className="h-4 w-4 me-2" />
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Share Report Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-brand-navy" />
                {t.shareReport}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'طريقة المشاركة' : 'Share Method'}</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="h-20 flex-col rounded-xl">
                    <Users className="h-6 w-6 mb-2" />
                    {isRTL ? 'فريق العمل' : 'Team'}
                  </Button>
                  <Button variant="outline" className="h-20 flex-col rounded-xl">
                    <Mail className="h-6 w-6 mb-2" />
                    {isRTL ? 'بريد إلكتروني' : 'Email'}
                  </Button>
                  <Button variant="outline" className="h-20 flex-col rounded-xl">
                    <LinkIcon className="h-6 w-6 mb-2" />
                    {isRTL ? 'رابط مشاركة' : 'Link'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t.recipients}</Label>
                <Input placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'} />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleShareReport} className="bg-brand-navy">
                <Share2 className="h-4 w-4 me-2" />
                {t.shareReport}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* AI Builder Dialog */}
        <Dialog open={showAIBuilderDialog} onOpenChange={setShowAIBuilderDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-navy" />
                {t.aiReportBuilder}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'اكتب طلبك باللغة العربية وسيقوم الذكاء الاصطناعي بإنشاء التقرير المناسب'
                  : 'Write your request and AI will generate the appropriate report'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Textarea
                value={aiQuery}
                onChange={(e) => setAIQuery(e.target.value)}
                placeholder={isRTL 
                  ? 'مثال: أريد تحليل أداء المدارس في الرياض خلال آخر 3 أشهر مع مقارنة نسب الحضور'
                  : 'e.g., I want to analyze Riyadh schools performance in the last 3 months with attendance comparison'}
                rows={4}
              />
              
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-sm font-medium mb-2">{isRTL ? 'أمثلة على الطلبات:' : 'Example requests:'}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {isRTL ? 'تحليل أداء الطلاب في الفصل الأول' : 'Analyze student performance in first semester'}</li>
                  <li>• {isRTL ? 'مقارنة نسب الحضور بين المدارس' : 'Compare attendance rates between schools'}</li>
                  <li>• {isRTL ? 'تقرير عن استخدام ميزات AI' : 'Report on AI features usage'}</li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowAIBuilderDialog(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleGenerateAIReport} disabled={!aiQuery || generatingAI} className="bg-brand-navy">
                {generatingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Zap className="h-4 w-4 me-2" />
                )}
                {t.generate}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Compare Schools Dialog */}
        <Dialog open={showCompareSchoolsDialog} onOpenChange={setShowCompareSchoolsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-brand-navy" />
                {t.compareSchools}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اختر المدارس للمقارنة' : 'Select schools to compare'}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر المدرسة الأولى' : 'Select first school'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school1">{isRTL ? 'مدرسة النور' : 'Al Noor School'}</SelectItem>
                    <SelectItem value="school2">{isRTL ? 'مدرسة الأمل' : 'Al Amal School'}</SelectItem>
                    <SelectItem value="school3">{isRTL ? 'مدرسة التميز' : 'Excellence School'}</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر المدرسة الثانية' : 'Select second school'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school1">{isRTL ? 'مدرسة النور' : 'Al Noor School'}</SelectItem>
                    <SelectItem value="school2">{isRTL ? 'مدرسة الأمل' : 'Al Amal School'}</SelectItem>
                    <SelectItem value="school3">{isRTL ? 'مدرسة التميز' : 'Excellence School'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowCompareSchoolsDialog(false)}>
                {t.cancel}
              </Button>
              <Button className="bg-brand-navy">
                <Scale className="h-4 w-4 me-2" />
                {isRTL ? 'مقارنة' : 'Compare'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Compare Periods Dialog */}
        <Dialog open={showComparePeriodsDialog} onOpenChange={setShowComparePeriodsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-brand-navy" />
                {t.comparePeriods}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الفترة الأولى' : 'First Period'}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                      <SelectItem value="lastMonth">{isRTL ? 'الشهر الماضي' : 'Last Month'}</SelectItem>
                      <SelectItem value="thisSemester">{t.thisSemester}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الفترة الثانية' : 'Second Period'}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastMonth">{isRTL ? 'الشهر الماضي' : 'Last Month'}</SelectItem>
                      <SelectItem value="lastSemester">{isRTL ? 'الفصل الماضي' : 'Last Semester'}</SelectItem>
                      <SelectItem value="lastYear">{isRTL ? 'العام الماضي' : 'Last Year'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowComparePeriodsDialog(false)}>
                {t.cancel}
              </Button>
              <Button className="bg-brand-navy">
                <ArrowUpDown className="h-4 w-4 me-2" />
                {isRTL ? 'مقارنة' : 'Compare'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Preview Report Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-navy" />
                {selectedReport && (isRTL ? selectedReport.name : selectedReport.name_en)}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {/* Report Preview Content */}
              <div className="p-6 bg-muted/20 rounded-xl min-h-[400px]">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">{selectedReport && (isRTL ? selectedReport.name : selectedReport.name_en)}</h2>
                  <p className="text-muted-foreground">{selectedReport && formatDate(selectedReport.date)}</p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-white rounded-lg shadow">
                    <h3 className="font-bold mb-3">{isRTL ? 'ملخص التقرير' : 'Report Summary'}</h3>
                    <p className="text-muted-foreground">
                      {isRTL 
                        ? 'هذا التقرير يعرض بيانات تحليلية شاملة للفترة المحددة. يتضمن إحصائيات مفصلة ورسوم بيانية توضيحية.'
                        : 'This report presents comprehensive analytical data for the specified period. It includes detailed statistics and explanatory charts.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow">
                      <p className="text-sm text-muted-foreground mb-1">{isRTL ? 'إجمالي السجلات' : 'Total Records'}</p>
                      <p className="text-2xl font-bold">1,250</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow">
                      <p className="text-sm text-muted-foreground mb-1">{isRTL ? 'نسبة الإنجاز' : 'Completion Rate'}</p>
                      <p className="text-2xl font-bold">94.5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                {t.close}
              </Button>
              <Button onClick={() => {
                handleExport();
                setShowPreviewDialog(false);
              }} className="bg-brand-navy">
                <Download className="h-4 w-4 me-2" />
                {t.downloadReport}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
};

export default PlatformAnalyticsPage;
