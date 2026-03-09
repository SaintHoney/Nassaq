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
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import {
  Building2, Users, GraduationCap, UserCheck, Plus, Sun, Moon, Globe, Activity, BarChart3, Brain,
  FileText, Zap, Download, Shield, Clock, RefreshCw, Sparkles, Calendar, Settings, UserPlus,
  BookOpen, ChevronRight, Filter, SlidersHorizontal, Play, MessageSquare, Send, Gauge, Server,
  MapPin, Eye, Check, GripVertical, CheckCircle, LayoutGrid, LayoutList, Maximize2, ChevronUp, ChevronDown,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Bell, ExternalLink, User
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { jsPDF } from 'jspdf';
import CreateSchoolWizard from '../components/wizards/CreateSchoolWizard';
import QuickAIOperationsPanel from '../components/ai/QuickAIOperationsPanel';

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

// المناطق والمدن - Regions and Cities (Cascading Filters)
const REGIONS = [
  { value: 'central', label: 'المنطقة الوسطى', label_en: 'Central Region', cities: ['الرياض', 'القصيم', 'حائل'] },
  { value: 'western', label: 'المنطقة الغربية', label_en: 'Western Region', cities: ['جدة', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'ينبع'] },
  { value: 'eastern', label: 'المنطقة الشرقية', label_en: 'Eastern Region', cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الجبيل'] },
  { value: 'northern', label: 'المنطقة الشمالية', label_en: 'Northern Region', cities: ['تبوك', 'عرعر', 'سكاكا'] },
  { value: 'southern', label: 'المنطقة الجنوبية', label_en: 'Southern Region', cities: ['أبها', 'جازان', 'نجران', 'خميس مشيط'] },
];

const SAUDI_CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'تبوك'];

// أنواع المدارس
const SCHOOL_TYPES = [
  { value: 'public', label: 'حكومية', label_en: 'Public' },
  { value: 'private', label: 'أهلية', label_en: 'Private' },
  { value: 'international', label: 'دولية', label_en: 'International' },
  { value: 'model', label: 'نموذجية', label_en: 'Model' },
];

const SCHOOL_STAGES = [
  { value: 'kindergarten', label: 'رياض الأطفال', label_en: 'Kindergarten' },
  { value: 'primary', label: 'ابتدائي', label_en: 'Primary' },
  { value: 'middle', label: 'متوسط', label_en: 'Middle' },
  { value: 'high', label: 'ثانوي', label_en: 'High School' },
];

// Sample chart data for daily activity
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

// Sparkline data generator for cards - Enhanced for clarity
const generateSparklineData = (baseValue, trend) => {
  const data = [];
  let value = baseValue * 0.85;
  for (let i = 0; i < 7; i++) {
    const change = trend === 'up' ? Math.random() * 0.05 + 0.01 : trend === 'down' ? -Math.random() * 0.03 - 0.01 : (Math.random() - 0.5) * 0.015;
    value = value * (1 + change);
    data.push({ day: i + 1, value: Math.round(value) });
  }
  return data;
};

// Enhanced Mini Sparkline Component - Professional Design
const MiniSparkline = ({ data, trend = 'up', height = 36 }) => {
  // تحديد اللون بناءً على الاتجاه
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8';
  const gradientId = `sparkGradient_${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={trendColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={trendColor} 
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* مؤشر الاتجاه */}
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-full ${
        trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
      }`} />
    </div>
  );
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const chatContainerRef = useRef(null);
  
  // States
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddSchoolWizard, setShowAddSchoolWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  
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
    scope: 'all',
    selectedSchool: '',
    selectedSchools: [],
    city: '',
    region: '',
    schoolType: '',
    timeWindow: 'today',
    customDateFrom: '',
    customDateTo: '',
    tenantStatus: 'all',
  });
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [visibleCards, setVisibleCards] = useState({
    schools: true, students: true, teachers: true, admins: true, activeUsers: true, apiCalls: true
  });
  const [cardsOrder, setCardsOrder] = useState(['schools', 'students', 'teachers', 'admins', 'activeUsers', 'apiCalls']);
  const [schools, setSchools] = useState([]);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');

  // Hakim Chat
  const [hakimMessages, setHakimMessages] = useState([
    { id: 1, role: 'assistant', content: isRTL ? 'مرحباً! أنا حكيم، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am Hakim, your AI assistant. How can I help you today?' }
  ]);
  const [hakimInput, setHakimInput] = useState('');
  const [hakimLoading, setHakimLoading] = useState(false);

  // Daily Activity States - نشاط المنصة اليومي
  const [activityData, setActivityData] = useState([]);
  const [activitySummary, setActivitySummary] = useState({
    lessons: { count: 0, change: 0, status: 'normal' },
    attendance: { count: 0, change: 0, status: 'normal' },
    grades: { count: 0, change: 0, status: 'normal' },
    users: { count: 0, change: 0, status: 'normal' }
  });
  const [activityAlerts, setActivityAlerts] = useState([]);
  const [activityPeriod, setActivityPeriod] = useState('today');
  const [activityViewBy, setActivityViewBy] = useState('hour');
  const [activityFilters, setActivityFilters] = useState({
    showLessons: true,
    showAttendance: true,
    showGrades: true,
    showUsers: true
  });

  // Get current Hijri date
  const getCurrentHijriDate = useCallback(() => {
    const today = new Date();
    const hijriYear = 1447;
    const hijriMonth = Math.floor(today.getMonth() + 1);
    const hijriDay = today.getDate();
    return {
      hijri: `${hijriYear}/${String(hijriMonth).padStart(2, '0')}/${String(hijriDay).padStart(2, '0')} هـ`,
      gregorian: today.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    };
  }, []);

  // Fetch Stats - يجلب البيانات مع تطبيق الفلاتر
  const fetchStats = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      // بناء query parameters من الفلاتر
      const queryParams = new URLSearchParams();
      if (filters.scope !== 'all') queryParams.append('scope', filters.scope);
      if (filters.selectedSchool) queryParams.append('school_id', filters.selectedSchool);
      if (filters.selectedSchools.length > 0) queryParams.append('school_ids', filters.selectedSchools.join(','));
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.schoolType) queryParams.append('school_type', filters.schoolType);
      if (filters.timeWindow) queryParams.append('time_window', filters.timeWindow);
      if (filters.timeWindow === 'custom') {
        if (filters.customDateFrom) queryParams.append('date_from', filters.customDateFrom);
        if (filters.customDateTo) queryParams.append('date_to', filters.customDateTo);
      }
      if (filters.tenantStatus !== 'all') queryParams.append('status', filters.tenantStatus);

      const queryString = queryParams.toString();
      const url = `/dashboard/stats${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      setStats({
        ...response.data,
        active_students: response.data.active_students || Math.floor(response.data.total_students * 0.97),
        new_students_this_month: response.data.new_students_this_month || Math.floor(response.data.total_students * 0.024),
        active_teachers: response.data.active_teachers || response.data.total_teachers - (response.data.teachers_without_rank || 0),
        new_teachers_this_month: response.data.new_teachers_this_month || 85,
        total_admins: response.data.total_admins || 245,
        active_users_today: response.data.active_users_today || response.data.active_users || 12500,
        api_calls_today: response.data.api_calls_today || 45000,
      });
      
      if (showToast) toast.success(isRTL ? 'تم تحديث البيانات بنجاح' : 'Data refreshed successfully');
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
      setRefreshing(false);
    }
  }, [api, filters, isRTL]);

  // Fetch Schools for filter
  const fetchSchools = useCallback(async () => {
    try {
      const response = await api.get('/schools');
      setSchools(response.data || []);
    } catch (error) {
      setSchools([]);
    }
  }, [api]);

  // Fetch Daily Activity Data - جلب بيانات النشاط اليومي
  const fetchActivityData = useCallback(async () => {
    try {
      // جلب بيانات الرسم البياني
      const chartResponse = await api.get(`/activity/daily?period=${activityPeriod}&view_by=${activityViewBy}`);
      setActivityData(chartResponse.data?.chart_data || []);
      
      // جلب ملخص النشاط
      const summaryResponse = await api.get('/activity/summary');
      setActivitySummary(summaryResponse.data || {
        lessons: { count: 0, change: 0, status: 'normal' },
        attendance: { count: 0, change: 0, status: 'normal' },
        grades: { count: 0, change: 0, status: 'normal' },
        users: { count: 0, change: 0, status: 'normal' }
      });
      
      // جلب التنبيهات
      const alertsResponse = await api.get('/activity/alerts');
      setActivityAlerts(alertsResponse.data?.alerts || []);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      // بيانات تجريبية افتراضية
      setActivityData([
        { hour: '07:00', lessons: 5, attendance: 45, grades: 3, users: 120 },
        { hour: '08:00', lessons: 25, attendance: 180, grades: 8, users: 450 },
        { hour: '09:00', lessons: 38, attendance: 95, grades: 15, users: 680 },
        { hour: '10:00', lessons: 42, attendance: 40, grades: 22, users: 720 },
        { hour: '11:00', lessons: 35, attendance: 25, grades: 18, users: 650 },
        { hour: '12:00', lessons: 28, attendance: 20, grades: 12, users: 580 },
        { hour: '13:00', lessons: 18, attendance: 15, grades: 8, users: 420 },
        { hour: '14:00', lessons: 8, attendance: 10, grades: 5, users: 280 },
        { hour: '15:00', lessons: 3, attendance: 5, grades: 2, users: 150 },
        { hour: '16:00', lessons: 0, attendance: 2, grades: 1, users: 80 },
      ]);
      setActivitySummary({
        lessons: { count: 202, change: 12.5, status: 'high' },
        attendance: { count: 437, change: -5.2, status: 'low' },
        grades: { count: 94, change: 8.3, status: 'normal' },
        users: { count: 4130, change: 15.7, status: 'high' }
      });
    }
  }, [api, activityPeriod, activityViewBy]);

  // تحميل قائمة المدارس عند التحميل الأول
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // *** تحديث البيانات عند تغيير أي فلتر - Dynamic Data Refresh ***
  // fetchStats يعتمد على filters، لذا سيتم استدعاؤه تلقائياً عند تغيير أي فلتر
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // تحميل بيانات النشاط اليومي
  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // تصدير البيانات - Export Data (PDF حقيقي باستخدام jsPDF)
  const handleExportData = (format) => {
    const data = {
      exportDate: new Date().toISOString(),
      filters: filters,
      stats: {
        totalSchools: stats?.total_schools || 0,
        activeSchools: stats?.active_schools || 0,
        suspendedSchools: stats?.suspended_schools || 0,
        pendingSchools: stats?.pending_schools || 0,
        totalStudents: stats?.total_students || 0,
        totalTeachers: stats?.total_teachers || 0,
        totalAdmins: stats?.total_admins || 0,
        activeUsersToday: stats?.active_users_today || 0,
        apiCallsToday: stats?.api_calls_today || 0,
      }
    };

    if (format === 'excel') {
      // تصدير كملف CSV (يفتح في Excel)
      const csvContent = [
        ['تقرير المؤشرات العامة للمنصة - NASSAQ Platform Report'],
        ['تاريخ التصدير', new Date().toLocaleDateString('ar-SA')],
        ['التاريخ الهجري', getCurrentHijriDate().hijri],
        [''],
        ['المؤشر', 'القيمة'],
        ['إجمالي المدارس', data.stats.totalSchools],
        ['المدارس النشطة', data.stats.activeSchools],
        ['المدارس الموقوفة', data.stats.suspendedSchools],
        ['المدارس المعلقة', data.stats.pendingSchools],
        ['إجمالي الطلاب', data.stats.totalStudents],
        ['إجمالي المعلمين', data.stats.totalTeachers],
        ['إجمالي المسؤولين', data.stats.totalAdmins],
        ['المستخدمين النشطين اليوم', data.stats.activeUsersToday],
        ['طلبات API اليوم', data.stats.apiCallsToday],
        [''],
        ['الفلاتر المطبقة'],
        ['النطاق', filters.scope === 'all' ? 'كل المنصة' : filters.scope === 'single' ? 'مدرسة محددة' : 'مجموعة مدارس'],
        ['الفترة الزمنية', filters.timeWindow],
        ['حالة المدارس', filters.tenantStatus === 'all' ? 'كل الحالات' : filters.tenantStatus],
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `nassaq_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success(isRTL ? 'تم تنزيل ملف Excel بنجاح' : 'Excel file downloaded');
    } else if (format === 'pdf') {
      // تصدير كملف PDF حقيقي باستخدام jsPDF
      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        // إعداد الخط العربي
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(20);
        
        // العنوان
        doc.setTextColor(30, 58, 95); // brand-navy
        doc.text('NASSAQ Platform Report', 105, 25, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Platform Analytics Dashboard', 105, 35, { align: 'center' });
        
        // التاريخ
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Export Date: ${new Date().toLocaleDateString('en-US')}`, 105, 45, { align: 'center' });
        doc.text(`Hijri: ${getCurrentHijriDate().hijri}`, 105, 52, { align: 'center' });
        
        // خط فاصل
        doc.setDrawColor(56, 178, 172); // brand-turquoise
        doc.setLineWidth(0.5);
        doc.line(20, 58, 190, 58);
        
        // الفلاتر المطبقة
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 95);
        doc.text('Applied Filters:', 20, 68);
        doc.setFontSize(9);
        doc.setTextColor(80);
        const scopeText = filters.scope === 'all' ? 'All Platform' : filters.scope === 'single' ? 'Single School' : 'Multiple Schools';
        const statusText = filters.tenantStatus === 'all' ? 'All Status' : filters.tenantStatus;
        doc.text(`Scope: ${scopeText} | Time: ${filters.timeWindow} | Status: ${statusText}`, 20, 75);
        
        // جدول البيانات
        const tableData = [
          ['Metric', 'Value'],
          ['Total Schools', data.stats.totalSchools.toLocaleString()],
          ['Active Schools', data.stats.activeSchools.toLocaleString()],
          ['Suspended Schools', data.stats.suspendedSchools.toLocaleString()],
          ['Pending Schools', data.stats.pendingSchools.toLocaleString()],
          ['Total Students', data.stats.totalStudents.toLocaleString()],
          ['Total Teachers', data.stats.totalTeachers.toLocaleString()],
          ['Total Administrators', data.stats.totalAdmins.toLocaleString()],
          ['Active Users Today', data.stats.activeUsersToday.toLocaleString()],
          ['API Calls Today', data.stats.apiCallsToday.toLocaleString()],
        ];
        
        let yPos = 85;
        doc.setFillColor(30, 58, 95);
        doc.rect(20, yPos, 170, 8, 'F');
        doc.setTextColor(255);
        doc.setFontSize(10);
        doc.text('Metric', 25, yPos + 5.5);
        doc.text('Value', 140, yPos + 5.5);
        
        yPos += 8;
        doc.setTextColor(50);
        tableData.slice(1).forEach((row, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(20, yPos, 170, 8, 'F');
          }
          doc.text(row[0], 25, yPos + 5.5);
          doc.text(row[1], 140, yPos + 5.5);
          yPos += 8;
        });
        
        // حدود الجدول
        doc.setDrawColor(200);
        doc.rect(20, 85, 170, yPos - 85);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generated by NASSAQ School Management System', 105, 280, { align: 'center' });
        
        // حفظ الملف
        doc.save(`nassaq_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success(isRTL ? 'تم تنزيل ملف PDF بنجاح' : 'PDF file downloaded successfully');
      } catch (error) {
        console.error('PDF generation error:', error);
        toast.error(isRTL ? 'فشل إنشاء ملف PDF' : 'Failed to generate PDF');
      }
    }
  };

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
      fetchSchools();
    } catch (error) {
      toast.error(isRTL ? 'فشل إنشاء المدرسة' : 'Failed to create school');
    }
  };

  // AI Operations Handler
  const handleAiOperation = async (operation) => {
    toast.success(isRTL ? `جاري تشغيل: ${operation}` : `Running: ${operation}`);
    setAiOperationsToday(prev => prev + 1);
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

  // Quick Actions - الإجراءات السريعة (Operational Launch Pad)
  const quickActions = [
    { 
      icon: Plus, 
      label: isRTL ? 'إضافة مدرسة' : 'Add School', 
      desc: isRTL ? 'إنشاء مستأجر جديد' : 'Create new tenant',
      color: 'bg-brand-navy', 
      action: () => setShowAddSchoolWizard(true) 
    },
    { 
      icon: UserPlus, 
      label: isRTL ? 'إنشاء مستخدم' : 'Create User', 
      desc: isRTL ? 'إضافة حساب جديد' : 'Add new account',
      color: 'bg-brand-turquoise', 
      action: () => navigate('/admin/users') 
    },
    { 
      icon: BookOpen, 
      label: isRTL ? 'إدارة القواعد' : 'Manage Rules', 
      desc: isRTL ? 'القواعد التعليمية' : 'Educational rules',
      color: 'bg-green-600', 
      action: () => navigate('/admin/rules') 
    },
    { 
      icon: Settings, 
      label: isRTL ? 'إعدادات النظام' : 'System Settings', 
      desc: isRTL ? 'إعدادات المنصة' : 'Platform config',
      color: 'bg-gray-600', 
      action: () => navigate('/settings') 
    },
    { 
      icon: FileText, 
      label: isRTL ? 'التقارير' : 'Reports', 
      desc: isRTL ? 'التحليلات والتقارير' : 'Analytics & reports',
      color: 'bg-brand-purple', 
      action: () => navigate('/admin/reports') 
    },
  ];

  // AI Operations
  const aiOperations = [
    { id: 'diagnosis', icon: Gauge, title: isRTL ? 'تشخيص النظام' : 'System Diagnosis', desc: isRTL ? 'فحص شامل للنظام' : 'Full system scan' },
    { id: 'data_quality', icon: Shield, title: isRTL ? 'جودة البيانات' : 'Data Quality', desc: isRTL ? 'فحص سلامة البيانات' : 'Data integrity check' },
    { id: 'tenant_health', icon: Building2, title: isRTL ? 'صحة المدارس' : 'Tenant Health', desc: isRTL ? 'تحليل أداء المدارس' : 'Schools performance' },
    { id: 'executive_summary', icon: FileText, title: isRTL ? 'ملخص تنفيذي' : 'Executive Summary', desc: isRTL ? 'تقرير شامل' : 'Comprehensive report' },
  ];

  // Enhanced Cards configuration with Delta, Health, and Sparkline
  const cardsConfig = {
    schools: {
      icon: <Building2 className="h-6 w-6 text-brand-navy" />,
      iconBg: 'bg-brand-navy/10',
      title: isRTL ? 'المدارس المسجلة' : 'Registered Schools',
      mainValue: stats?.total_schools,
      delta: { value: 12, type: 'up', period: isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month' },
      health: stats?.suspended_schools > 5 ? 'warning' : 'normal',
      sparklineData: generateSparklineData(stats?.total_schools || 200, 'up'),
      sparklineColor: '#1e3a5f',
      secondaryData: [
        { label: isRTL ? 'نشطة' : 'Active', value: stats?.active_schools, dotColor: 'bg-green-500' },
        { label: isRTL ? 'موقوفة' : 'Suspended', value: stats?.suspended_schools, dotColor: 'bg-red-500' },
        { label: isRTL ? 'معلقة' : 'Pending', value: stats?.pending_schools, dotColor: 'bg-yellow-500' },
      ],
      navigateTo: '/admin/schools',
      actions: [
        { label: isRTL ? 'عرض التفاصيل' : 'View Details', action: () => navigate('/admin/schools') },
        { label: isRTL ? 'فتح التقرير' : 'Open Report', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'ضبط تنبيه' : 'Set Alert', action: () => toast.info(isRTL ? 'سيتم إضافة هذه الميزة قريباً' : 'Coming soon') },
      ],
    },
    students: {
      icon: <GraduationCap className="h-6 w-6 text-brand-turquoise" />,
      iconBg: 'bg-brand-turquoise/10',
      title: isRTL ? 'الطلاب المسجلين' : 'Enrolled Students',
      mainValue: stats?.total_students,
      delta: { value: 2.4, type: 'up', period: isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month' },
      health: 'normal',
      sparklineData: generateSparklineData(stats?.total_students || 50000, 'up'),
      sparklineColor: '#38b2ac',
      secondaryData: [
        { label: isRTL ? 'نشط' : 'Active', value: stats?.active_students?.toLocaleString(), dotColor: 'bg-green-500' },
        { label: isRTL ? 'جديد هذا الشهر' : 'New this month', value: `+${stats?.new_students_this_month?.toLocaleString()}`, dotColor: 'bg-blue-500' },
      ],
      navigateTo: '/admin/reports',
      actions: [
        { label: isRTL ? 'عرض التفاصيل' : 'View Details', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'فتح التقرير' : 'Open Report', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'ضبط تنبيه' : 'Set Alert', action: () => toast.info(isRTL ? 'سيتم إضافة هذه الميزة قريباً' : 'Coming soon') },
      ],
    },
    teachers: {
      icon: <UserCheck className="h-6 w-6 text-brand-purple" />,
      iconBg: 'bg-brand-purple/10',
      title: isRTL ? 'المعلمين' : 'Teachers',
      mainValue: stats?.total_teachers,
      delta: { value: 2.8, type: 'up', period: isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month' },
      health: stats?.teachers_without_rank > 100 ? 'warning' : 'normal',
      sparklineData: generateSparklineData(stats?.total_teachers || 3000, 'up'),
      sparklineColor: '#805ad5',
      secondaryData: [
        { label: isRTL ? 'نشط' : 'Active', value: stats?.active_teachers?.toLocaleString(), dotColor: 'bg-green-500' },
        { label: isRTL ? 'جديد هذا الشهر' : 'New this month', value: `+${stats?.new_teachers_this_month}`, dotColor: 'bg-blue-500' },
      ],
      navigateTo: '/admin/users',
      actions: [
        { label: isRTL ? 'عرض التفاصيل' : 'View Details', action: () => navigate('/admin/users') },
        { label: isRTL ? 'فتح التقرير' : 'Open Report', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'ضبط تنبيه' : 'Set Alert', action: () => toast.info(isRTL ? 'سيتم إضافة هذه الميزة قريباً' : 'Coming soon') },
      ],
    },
    admins: {
      icon: <Users className="h-6 w-6 text-orange-500" />,
      iconBg: 'bg-orange-500/10',
      title: isRTL ? 'المسؤولين' : 'Administrators',
      mainValue: stats?.total_admins,
      delta: { value: 0, type: 'stable', period: isRTL ? 'مستقر' : 'Stable' },
      health: 'normal',
      sparklineData: generateSparklineData(stats?.total_admins || 245, 'stable'),
      sparklineColor: '#f97316',
      secondaryData: [
        { label: isRTL ? 'مدراء مدارس' : 'Principals', value: 200, dotColor: 'bg-purple-500' },
        { label: isRTL ? 'منصة' : 'Platform', value: 45, dotColor: 'bg-blue-500' },
      ],
      navigateTo: '/admin/users',
      actions: [
        { label: isRTL ? 'عرض التفاصيل' : 'View Details', action: () => navigate('/admin/users') },
        { label: isRTL ? 'فتح التقرير' : 'Open Report', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'ضبط تنبيه' : 'Set Alert', action: () => toast.info(isRTL ? 'سيتم إضافة هذه الميزة قريباً' : 'Coming soon') },
      ],
    },
    activeUsers: {
      icon: <Activity className="h-6 w-6 text-green-500" />,
      iconBg: 'bg-green-500/10',
      title: isRTL ? 'المستخدمون النشطون' : 'Active Users Today',
      mainValue: stats?.active_users_today,
      delta: { value: 8.5, type: 'up', period: isRTL ? 'مقارنة بالأمس' : 'vs yesterday' },
      health: 'normal',
      sparklineData: generateSparklineData(stats?.active_users_today || 12500, 'up'),
      sparklineColor: '#22c55e',
      secondaryData: [
        { label: isRTL ? 'طلاب' : 'Students', value: '10.2K', dotColor: 'bg-green-500' },
        { label: isRTL ? 'معلمين' : 'Teachers', value: '2.1K', dotColor: 'bg-blue-500' },
      ],
      navigateTo: '/admin/monitoring',
      actions: [
        { label: isRTL ? 'عرض التفاصيل' : 'View Details', action: () => navigate('/admin/monitoring') },
        { label: isRTL ? 'فتح التقرير' : 'Open Report', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'ضبط تنبيه' : 'Set Alert', action: () => toast.info(isRTL ? 'سيتم إضافة هذه الميزة قريباً' : 'Coming soon') },
      ],
    },
    apiCalls: {
      icon: <Server className="h-6 w-6 text-teal-500" />,
      iconBg: 'bg-teal-500/10',
      title: isRTL ? 'طلبات API اليوم' : 'API Requests Today',
      mainValue: stats?.api_calls_today,
      delta: { value: 5.2, type: 'down', period: isRTL ? 'مقارنة بالأمس' : 'vs yesterday' },
      health: 'normal',
      sparklineData: generateSparklineData(stats?.api_calls_today || 45000, 'down'),
      sparklineColor: '#14b8a6',
      secondaryData: [
        { label: isRTL ? 'نجاح' : 'Success', value: '99.8%', dotColor: 'bg-green-500' },
        { label: isRTL ? 'متوسط الاستجابة' : 'Avg Response', value: '45ms', dotColor: 'bg-blue-500' },
      ],
      navigateTo: '/admin/monitoring',
      actions: [
        { label: isRTL ? 'عرض التفاصيل' : 'View Details', action: () => navigate('/admin/monitoring') },
        { label: isRTL ? 'فتح التقرير' : 'Open Report', action: () => navigate('/admin/reports') },
        { label: isRTL ? 'ضبط تنبيه' : 'Set Alert', action: () => toast.info(isRTL ? 'سيتم إضافة هذه الميزة قريباً' : 'Coming soon') },
      ],
    },
  };

  // Get Health Status config
  const getHealthConfig = (health) => {
    switch (health) {
      case 'normal':
        return { label: isRTL ? 'طبيعي' : 'Normal', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'warning':
        return { label: isRTL ? 'يحتاج متابعة' : 'Needs Attention', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'danger':
        return { label: isRTL ? 'خطر' : 'Critical', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { label: isRTL ? 'طبيعي' : 'Normal', color: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  // Render Enhanced Analytics Card - Mobile Optimized
  const renderAnalyticsCard = (cardKey) => {
    const card = cardsConfig[cardKey];
    if (!card || !visibleCards[cardKey]) return null;
    
    const healthConfig = getHealthConfig(card.health);
    
    return (
      <Card 
        key={cardKey} 
        className="card-nassaq hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden" 
        data-testid={`card-${cardKey}`}
        onClick={() => navigate(card.navigateTo)}
      >
        <CardContent className="p-3 lg:p-5">
          {/* Header: Icon, Title, Health Tag */}
          <div className="flex items-start justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium line-clamp-1">{card.title}</p>
                {/* Health Tag - Hidden on Mobile */}
                <Badge variant="outline" className={`text-[10px] mt-1 hidden lg:inline-flex ${healthConfig.color}`}>
                  {healthConfig.label}
                </Badge>
              </div>
            </div>
            
            {/* Actions Dropdown - Desktop Only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {card.actions?.map((action, idx) => (
                  <DropdownMenuItem 
                    key={idx} 
                    onClick={(e) => { e.stopPropagation(); action.action(); }}
                    className="cursor-pointer text-sm"
                  >
                    {idx === 0 && <Eye className="h-3.5 w-3.5 me-2" />}
                    {idx === 1 && <FileText className="h-3.5 w-3.5 me-2" />}
                    {idx === 2 && <Bell className="h-3.5 w-3.5 me-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Main Value + Delta */}
          <div className="flex items-end justify-between mb-2 lg:mb-3">
            <div>
              <p className="text-2xl lg:text-3xl font-bold">{card.mainValue?.toLocaleString() || 0}</p>
              {/* Delta Indicator */}
              <div className="flex items-center gap-1 lg:gap-1.5 mt-1">
                {card.delta.type === 'up' && <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />}
                {card.delta.type === 'down' && <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />}
                {card.delta.type === 'stable' && <Minus className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />}
                <span className={`text-xs lg:text-sm font-medium ${
                  card.delta.type === 'up' ? 'text-green-600' : 
                  card.delta.type === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {card.delta.type === 'up' ? '+' : card.delta.type === 'down' ? '-' : ''}{card.delta.value}%
                </span>
                <span className="text-[10px] lg:text-xs text-muted-foreground hidden sm:inline">{card.delta.period}</span>
              </div>
            </div>
            
            {/* Sparkline Chart - Hidden on Mobile */}
            <div className="w-20 h-8 lg:w-28 lg:h-10 hidden sm:block">
              <MiniSparkline data={card.sparklineData} trend={card.delta.type} height={40} />
            </div>
          </div>
          
          {/* Secondary Data Badges - Simplified on Mobile */}
          <div className="flex flex-wrap gap-1 lg:gap-2 pt-2 border-t border-border/50">
            {card.secondaryData?.slice(0, 2).map((item, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-[10px] lg:text-xs bg-muted/50"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor || 'bg-gray-400'} me-1`}></span>
                <span className="hidden sm:inline">{item.label}: </span>{item.value ?? 0}
              </Badge>
            ))}
          </div>
          
          {/* Hover Indicator - Desktop Only */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter schools based on search
  const filteredSchools = schools.filter(school => 
    school.name?.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
    school.city?.toLowerCase().includes(schoolSearchQuery.toLowerCase())
  );

  // Handle card reorder
  const moveCard = (index, direction) => {
    const newOrder = [...cardsOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < cardsOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      setCardsOrder(newOrder);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      scope: 'all', selectedSchool: '', selectedSchools: [], city: '', region: '', schoolType: '',
      timeWindow: 'today', customDateFrom: '', customDateTo: '', tenantStatus: 'all'
    });
  };

  // Check if any filter is active
  const hasActiveFilters = filters.city || filters.region || filters.schoolType || 
    filters.tenantStatus !== 'all' || filters.scope !== 'all';

  // Mobile menu state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
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
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-lg font-bold text-foreground">
                {isRTL ? 'مركز القيادة' : 'Command Center'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {getCurrentHijriDate().hijri}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileFiltersOpen(true)} 
                className="rounded-xl relative"
                data-testid="mobile-filters-btn"
              >
                <Filter className="h-5 w-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 bg-brand-purple text-white text-[10px] rounded-full flex items-center justify-center">
                    {Object.values(filters).filter(v => v !== 'all' && v !== '' && v !== 'today').length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
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

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          
          {/* ============================================ */}
          {/* 1. كارت الترحيب - Welcome Card (متجاوب بالكامل) */}
          {/* ============================================ */}
          <Card className="card-nassaq bg-gradient-to-r from-brand-navy/5 via-brand-turquoise/5 to-brand-purple/5 border-brand-navy/20" data-testid="welcome-card">
            <CardContent className="py-4 px-4 lg:py-5 lg:px-6">
              {/* Mobile Layout */}
              <div className="lg:hidden">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-brand-turquoise shadow-lg flex-shrink-0">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-navy to-brand-turquoise text-white text-lg font-bold">
                      {user?.full_name?.charAt(0) || 'أ'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="font-cairo text-base font-bold text-brand-navy truncate" data-testid="user-display-mobile">
                      {isRTL ? 'مرحباً أستاذ أحمد زلط' : 'Welcome, Ahmed Zalt'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'مركز القيادة' : 'Command Center'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-center px-3 py-2 bg-brand-turquoise/10 rounded-xl border border-brand-turquoise/20">
                    <p className="text-[10px] text-muted-foreground">{isRTL ? 'الفصل' : 'Semester'}</p>
                    <p className="font-cairo font-bold text-brand-turquoise text-sm">{isRTL ? 'الثاني 1446-1447' : '2nd 1446-1447'}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 bg-muted/30 px-3 py-2 rounded-xl" data-testid="date-display-mobile">
                    <Calendar className="h-4 w-4 text-brand-navy flex-shrink-0" />
                    <div className="text-center">
                      <p className="font-cairo text-xs font-bold text-brand-navy">
                        {getCurrentHijriDate().hijri}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Desktop Layout */}
              <div className="hidden lg:flex items-center justify-between">
                {/* القسم الأيسر: الترحيب والعنوان مع صورة المستخدم */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-brand-turquoise shadow-lg">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-navy to-brand-turquoise text-white text-xl font-bold">
                      {user?.full_name?.charAt(0) || 'أ'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-cairo text-xl font-bold text-brand-navy" data-testid="user-display">
                      {isRTL ? 'مرحباً أستاذ أحمد زلط' : 'Welcome, Ahmed Zalt'}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                      {isRTL ? 'مركز القيادة' : 'Command Center'}
                    </p>
                  </div>
                </div>
                
                {/* القسم الأوسط: الفصل الدراسي */}
                <div className="flex items-center gap-6">
                  <div className="text-center px-6 py-2 bg-brand-turquoise/10 rounded-xl border border-brand-turquoise/20">
                    <p className="text-xs text-muted-foreground font-medium">{isRTL ? 'الفصل الدراسي' : 'Semester'}</p>
                    <p className="font-cairo font-bold text-brand-turquoise text-lg">{isRTL ? 'الثاني 1446-1447' : '2nd 1446-1447'}</p>
                  </div>
                </div>
                
                {/* القسم الأيمن: التاريخ */}
                <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl" data-testid="date-display">
                  <Calendar className="h-5 w-5 text-brand-navy" />
                  <div className="text-end">
                    <p className="font-cairo text-lg font-bold text-brand-navy">
                      {getCurrentHijriDate().hijri}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {getCurrentHijriDate().gregorian}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============================================ */}
          {/* 2. قسم المؤشرات العامة للمنصة */}
          {/* ============================================ */}
          <section data-testid="analytics-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cairo text-base lg:text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-brand-turquoise" />
                {isRTL ? 'المؤشرات العامة' : 'Platform Analytics'}
              </h2>
              {/* Mobile Quick Actions */}
              <div className="lg:hidden flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchStats(true)}
                  className="rounded-xl h-8 px-3"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowDisplaySettings(true)}
                  className="rounded-xl h-8 px-3 bg-brand-navy"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* ============================================ */}
            {/* شريط التحكم العلوي - Desktop Only */}
            {/* ============================================ */}
            <Card className="card-nassaq mb-4 border-2 border-brand-turquoise/20 hidden lg:block" data-testid="global-filters-bar">
              <CardContent className="p-4">
                
                {/* الصف الأول: الفلاتر المتسلسلة (المنطقة -> المدينة -> النوع -> المدرسة) */}
                <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border/50">
                  
                  {/* 1. المنطقة - Region (أولاً) */}
                  <div className="flex items-center gap-2 bg-brand-navy/5 px-3 py-2 rounded-xl border border-brand-navy/10">
                    <MapPin className="h-4 w-4 text-brand-navy" />
                    <span className="text-xs font-bold text-brand-navy">{isRTL ? 'المنطقة' : 'Region'}</span>
                    <Select 
                      value={filters.region || 'all_regions'} 
                      onValueChange={(v) => setFilters({ 
                        ...filters, 
                        region: v === 'all_regions' ? '' : v,
                        city: '', // إعادة تعيين المدينة عند تغيير المنطقة
                        selectedSchool: '',
                        selectedSchools: []
                      })}
                    >
                      <SelectTrigger className="w-40 rounded-lg h-8 text-sm border-brand-navy/20 bg-background" data-testid="region-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_regions">{isRTL ? 'كل المناطق' : 'All Regions'}</SelectItem>
                        {REGIONS.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-turquoise" />
                              {isRTL ? region.label : region.label_en}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. المدينة - City (تعتمد على المنطقة) */}
                  <div className="flex items-center gap-2 bg-brand-turquoise/5 px-3 py-2 rounded-xl border border-brand-turquoise/10">
                    <Building2 className="h-4 w-4 text-brand-turquoise" />
                    <span className="text-xs font-bold text-brand-turquoise">{isRTL ? 'المدينة' : 'City'}</span>
                    <Select 
                      value={filters.city || 'all_cities'} 
                      onValueChange={(v) => setFilters({ 
                        ...filters, 
                        city: v === 'all_cities' ? '' : v,
                        selectedSchool: '',
                        selectedSchools: []
                      })}
                    >
                      <SelectTrigger className="w-36 rounded-lg h-8 text-sm border-brand-turquoise/20 bg-background" data-testid="city-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_cities">{isRTL ? 'كل المدن' : 'All Cities'}</SelectItem>
                        {(filters.region 
                          ? REGIONS.find(r => r.value === filters.region)?.cities || SAUDI_CITIES
                          : SAUDI_CITIES
                        ).map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 3. نوع المدرسة - School Type */}
                  <div className="flex items-center gap-2 bg-brand-purple/5 px-3 py-2 rounded-xl border border-brand-purple/10">
                    <GraduationCap className="h-4 w-4 text-brand-purple" />
                    <span className="text-xs font-bold text-brand-purple">{isRTL ? 'النوع' : 'Type'}</span>
                    <Select 
                      value={filters.schoolType || 'all_types'} 
                      onValueChange={(v) => setFilters({ 
                        ...filters, 
                        schoolType: v === 'all_types' ? '' : v,
                        selectedSchool: '',
                        selectedSchools: []
                      })}
                    >
                      <SelectTrigger className="w-32 rounded-lg h-8 text-sm border-brand-purple/20 bg-background" data-testid="type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_types">{isRTL ? 'كل الأنواع' : 'All Types'}</SelectItem>
                        {SCHOOL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {isRTL ? type.label : type.label_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 4. اختيار مدرسة محددة (اختياري) */}
                  <div className="flex items-center gap-2 bg-orange-500/5 px-3 py-2 rounded-xl border border-orange-500/10">
                    <Filter className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold text-orange-600">{isRTL ? 'المدرسة' : 'School'}</span>
                    <Select 
                      value={filters.scope} 
                      onValueChange={(v) => setFilters({ ...filters, scope: v, selectedSchool: '', selectedSchools: [] })}
                    >
                      <SelectTrigger className="w-36 rounded-lg h-8 text-sm border-orange-500/20 bg-background" data-testid="scope-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'كل المدارس' : 'All Schools'}</SelectItem>
                        <SelectItem value="single">{isRTL ? 'مدرسة محددة' : 'Single School'}</SelectItem>
                        <SelectItem value="multi">{isRTL ? 'مجموعة مدارس' : 'Multi-Select'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* اختيار مدرسة واحدة - قابل للبحث */}
                  {filters.scope === 'single' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl h-8 min-w-[200px] justify-between border-brand-turquoise/30" data-testid="single-school-select">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {filters.selectedSchool 
                              ? schools.find(s => s.id === filters.selectedSchool)?.name || (isRTL ? 'اختر مدرسة' : 'Select school')
                              : (isRTL ? 'ابحث واختر مدرسة...' : 'Search school...')}
                          </span>
                          <ChevronRight className="h-3 w-3 rotate-90" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-72 max-h-80">
                        <div className="p-2 border-b sticky top-0 bg-background z-10">
                          <Input 
                            placeholder={isRTL ? 'ابحث عن مدرسة...' : 'Search schools...'} 
                            className="h-8 text-sm rounded-lg"
                            value={schoolSearchQuery}
                            onChange={(e) => setSchoolSearchQuery(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="max-h-60">
                          {filteredSchools.map((school) => (
                            <DropdownMenuItem 
                              key={school.id}
                              className={`flex items-center gap-2 cursor-pointer ${filters.selectedSchool === school.id ? 'bg-brand-turquoise/10' : ''}`}
                              onClick={() => {
                                setFilters({ ...filters, selectedSchool: school.id });
                                setSchoolSearchQuery('');
                              }}
                            >
                              <Building2 className="h-3 w-3" />
                              <span className="text-sm flex-1">{school.name}</span>
                              {school.city && <Badge variant="outline" className="text-[10px]">{school.city}</Badge>}
                              {filters.selectedSchool === school.id && <Check className="h-3 w-3 text-brand-turquoise" />}
                            </DropdownMenuItem>
                          ))}
                          {filteredSchools.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              {isRTL ? 'لا توجد نتائج' : 'No results found'}
                            </div>
                          )}
                        </ScrollArea>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* اختيار مجموعة مدارس - Multi-Select مع بحث */}
                  {filters.scope === 'multi' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl h-8 min-w-[220px] justify-between border-brand-turquoise/30" data-testid="multi-school-select">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {filters.selectedSchools.length > 0 
                              ? `${filters.selectedSchools.length} ${isRTL ? 'مدرسة محددة' : 'schools selected'}`
                              : (isRTL ? 'اختر المدارس...' : 'Select schools...')}
                          </span>
                          <ChevronRight className="h-3 w-3 rotate-90" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-72 max-h-80">
                        <div className="p-2 border-b sticky top-0 bg-background z-10">
                          <Input 
                            placeholder={isRTL ? 'ابحث عن مدرسة...' : 'Search schools...'} 
                            className="h-8 text-sm rounded-lg"
                            value={schoolSearchQuery}
                            onChange={(e) => setSchoolSearchQuery(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="max-h-60">
                          <div className="p-1">
                            {filteredSchools.map((school) => {
                              const isSelected = filters.selectedSchools.includes(school.id);
                              return (
                                <div 
                                  key={school.id}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-brand-turquoise/10' : ''}`}
                                  onClick={() => {
                                    setFilters({
                                      ...filters,
                                      selectedSchools: isSelected 
                                        ? filters.selectedSchools.filter(id => id !== school.id)
                                        : [...filters.selectedSchools, school.id]
                                    });
                                  }}
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-brand-turquoise border-brand-turquoise' : 'border-gray-300'}`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className="text-sm flex-1">{school.name}</span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {school.status === 'active' ? (isRTL ? 'نشط' : 'Active') : school.status}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        {filters.selectedSchools.length > 0 && (
                          <div className="p-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs text-red-500"
                              onClick={() => setFilters({ ...filters, selectedSchools: [] })}
                            >
                              {isRTL ? 'مسح الاختيار' : 'Clear selection'}
                            </Button>
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* الصف الثاني: الفترة الزمنية + حالة المدارس + الأزرار */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  
                  {/* B. الفترة الزمنية - Time Window */}
                  <div className="flex items-center gap-2 bg-brand-purple/5 px-3 py-2 rounded-xl border border-brand-purple/10">
                    <Clock className="h-4 w-4 text-brand-purple" />
                    <span className="text-xs font-bold text-brand-purple">{isRTL ? 'الفترة' : 'Time'}</span>
                    <Select 
                      value={filters.timeWindow} 
                      onValueChange={(v) => setFilters({ ...filters, timeWindow: v })}
                    >
                      <SelectTrigger className="w-36 rounded-lg h-8 text-sm border-brand-purple/20 bg-background" data-testid="time-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {isRTL ? 'الآن (Live)' : 'Live Now'}
                          </span>
                        </SelectItem>
                        <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                        <SelectItem value="week">{isRTL ? 'الأسبوع الحالي' : 'This Week'}</SelectItem>
                        <SelectItem value="month">{isRTL ? 'الشهر الحالي' : 'This Month'}</SelectItem>
                        <SelectItem value="custom">{isRTL ? 'نطاق مخصص' : 'Custom Range'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* فاصل */}
                  <div className="h-6 w-px bg-border hidden lg:block" />

                  {/* C. حالة المدارس - Tenant Status - واضحة جداً بصرياً */}
                  <div className="flex items-center gap-2 bg-orange-500/5 px-3 py-2 rounded-xl border border-orange-500/10">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold text-orange-600">{isRTL ? 'الحالة' : 'Status'}</span>
                    <Select 
                      value={filters.tenantStatus} 
                      onValueChange={(v) => setFilters({ ...filters, tenantStatus: v })}
                    >
                      <SelectTrigger className="w-40 rounded-lg h-8 text-sm border-orange-500/20 bg-background" data-testid="status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                            {isRTL ? 'كل الحالات' : 'All Status'}
                          </span>
                        </SelectItem>
                        <SelectItem value="active">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-green-700 font-medium">{isRTL ? 'نشطة' : 'Active'}</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="suspended">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-red-700 font-medium">{isRTL ? 'موقوفة' : 'Suspended'}</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="setup">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span className="text-yellow-700 font-medium">{isRTL ? 'قيد الإعداد' : 'Setup'}</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="expired">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-400" />
                            <span className="text-gray-600 font-medium">{isRTL ? 'انتهى الاشتراك' : 'Expired'}</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* D. أزرار الإجراءات - Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* تحديث الآن - Refresh Now */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fetchStats(true)}
                      className="rounded-xl h-9 px-4 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                      disabled={refreshing}
                      data-testid="refresh-btn"
                    >
                      <RefreshCw className={`h-4 w-4 me-2 ${refreshing ? 'animate-spin' : ''} text-green-600`} />
                      <span className="font-medium">{isRTL ? 'تحديث الآن' : 'Refresh'}</span>
                    </Button>

                    {/* تصدير البيانات - Export (ينزل ملف فعلي) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500" data-testid="export-btn">
                          <Download className="h-4 w-4 me-2 text-blue-600" />
                          <span className="font-medium">{isRTL ? 'تصدير' : 'Export'}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleExportData('pdf')} className="cursor-pointer" data-testid="export-pdf">
                          <FileText className="h-4 w-4 me-2 text-red-500" />
                          <span>{isRTL ? 'تنزيل PDF' : 'Download PDF'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportData('excel')} className="cursor-pointer" data-testid="export-excel">
                          <BarChart3 className="h-4 w-4 me-2 text-green-600" />
                          <span>{isRTL ? 'تنزيل Excel' : 'Download Excel'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* إعدادات العرض - Display Settings */}
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => setShowDisplaySettings(true)}
                      className="rounded-xl h-9 px-4 bg-brand-navy hover:bg-brand-navy/90"
                      data-testid="display-settings-btn"
                    >
                      <SlidersHorizontal className="h-4 w-4 me-2" />
                      <span className="font-medium">{isRTL ? 'إعدادات العرض' : 'Display'}</span>
                    </Button>
                  </div>
                </div>

                {/* نطاق تاريخ مخصص */}
                {filters.timeWindow === 'custom' && (
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/50 bg-brand-purple/5 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl">
                    <span className="text-sm font-bold text-brand-purple">{isRTL ? 'تحديد النطاق:' : 'Select Range:'}</span>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'من' : 'From'}</Label>
                      <Input 
                        type="date" 
                        value={filters.customDateFrom}
                        onChange={(e) => setFilters({ ...filters, customDateFrom: e.target.value })}
                        className="w-40 rounded-xl h-8 text-sm"
                        data-testid="date-from"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'إلى' : 'To'}</Label>
                      <Input 
                        type="date" 
                        value={filters.customDateTo}
                        onChange={(e) => setFilters({ ...filters, customDateTo: e.target.value })}
                        className="w-40 rounded-xl h-8 text-sm"
                        data-testid="date-to"
                      />
                    </div>
                  </div>
                )}

                {/* عرض الفلاتر النشطة */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{isRTL ? 'الفلاتر النشطة:' : 'Active filters:'}</span>
                    {filters.scope !== 'all' && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {filters.scope === 'single' ? (isRTL ? 'مدرسة واحدة' : 'Single School') : (isRTL ? 'مجموعة مدارس' : 'Multi-Select')}
                        <button className="ms-1 hover:text-red-500" onClick={() => setFilters({ ...filters, scope: 'all', selectedSchool: '', selectedSchools: [] })}>×</button>
                      </Badge>
                    )}
                    {filters.city && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {filters.city}
                        <button className="ms-1 hover:text-red-500" onClick={() => setFilters({ ...filters, city: '' })}>×</button>
                      </Badge>
                    )}
                    {filters.region && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {filters.region === 'central' ? (isRTL ? 'الوسطى' : 'Central') : 
                         filters.region === 'western' ? (isRTL ? 'الغربية' : 'Western') :
                         filters.region === 'eastern' ? (isRTL ? 'الشرقية' : 'Eastern') :
                         filters.region === 'northern' ? (isRTL ? 'الشمالية' : 'Northern') : (isRTL ? 'الجنوبية' : 'Southern')}
                        <button className="ms-1 hover:text-red-500" onClick={() => setFilters({ ...filters, region: '' })}>×</button>
                      </Badge>
                    )}
                    {filters.schoolType && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {filters.schoolType === 'public' ? (isRTL ? 'حكومي' : 'Public') : 
                         filters.schoolType === 'private' ? (isRTL ? 'خاص' : 'Private') : (isRTL ? 'عالمي' : 'International')}
                        <button className="ms-1 hover:text-red-500" onClick={() => setFilters({ ...filters, schoolType: '' })}>×</button>
                      </Badge>
                    )}
                    {filters.tenantStatus !== 'all' && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {filters.tenantStatus === 'active' ? (isRTL ? 'نشطة' : 'Active') : 
                         filters.tenantStatus === 'suspended' ? (isRTL ? 'موقوفة' : 'Suspended') :
                         filters.tenantStatus === 'setup' ? (isRTL ? 'قيد الإعداد' : 'Setup') : (isRTL ? 'منتهية' : 'Expired')}
                        <button className="ms-1 hover:text-red-500" onClick={() => setFilters({ ...filters, tenantStatus: 'all' })}>×</button>
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-700" onClick={clearAllFilters}>
                      {isRTL ? 'مسح الكل' : 'Clear All'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* كروت المؤشرات المحسنة - Enhanced Analytics Cards */}
            {/* ============================================ */}
            <div className={`grid gap-3 lg:gap-4 ${
              viewMode === 'compact' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' :
              viewMode === 'expanded' ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-2 lg:grid-cols-3'
            }`} data-testid="analytics-cards-grid">
              {cardsOrder.map((cardKey) => renderAnalyticsCard(cardKey))}
            </div>
          </section>

          {/* ============================================ */}
          {/* 3. الإجراءات السريعة - Quick Actions (Operational Launch Pad) */}
          {/* ============================================ */}
          <section data-testid="quick-actions-section">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="font-cairo text-base lg:text-lg font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />
                {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
              </h2>
              <p className="text-[10px] lg:text-xs text-muted-foreground hidden sm:block">
                {isRTL ? 'لوحة التشغيل الفورية' : 'Operational Launch Pad'}
              </p>
            </div>
            
            {/* Mobile: Horizontal Scroll / Desktop: Grid */}
            <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-3 min-w-max">
                {quickActions.map((action, index) => (
                  <Card
                    key={index}
                    className="card-nassaq hover:shadow-lg transition-all cursor-pointer group w-28 flex-shrink-0"
                    onClick={action.action}
                    data-testid={`quick-action-mobile-${index}`}
                  >
                    <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                      <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-cairo font-bold text-xs line-clamp-2">{action.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="card-nassaq hover:shadow-lg hover:border-brand-turquoise/50 transition-all cursor-pointer group"
                  onClick={action.action}
                  data-testid={`quick-action-${index}`}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-cairo font-bold text-sm mb-1">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ============================================ */}
          {/* 4. نشاط المنصة اليومي - Daily Platform Activity */}
          {/* ============================================ */}
          <section data-testid="activity-section">
            <Card className="card-nassaq">
              <CardHeader className="pb-2 px-4 lg:px-6">
                <div className="flex flex-col gap-3 lg:gap-4">
                  {/* العنوان وشريط التحكم */}
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-cairo text-base lg:text-lg flex items-center gap-2">
                      <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-brand-turquoise" />
                      <span className="hidden sm:inline">{isRTL ? 'نشاط المنصة اليومي' : 'Daily Platform Activity'}</span>
                      <span className="sm:hidden">{isRTL ? 'النشاط اليومي' : 'Daily Activity'}</span>
                      <Badge className="bg-red-500 text-white text-[10px] lg:text-xs animate-pulse">
                        {isRTL ? 'مباشر' : 'LIVE'}
                      </Badge>
                    </CardTitle>
                    
                    {/* أدوات التحكم - Desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                      {/* الفترة الزمنية */}
                      <Select value={activityPeriod} onValueChange={setActivityPeriod}>
                        <SelectTrigger className="w-36 rounded-xl h-8 text-xs">
                          <Clock className="h-3 w-3 me-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                          <SelectItem value="24h">{isRTL ? 'آخر 24 ساعة' : 'Last 24h'}</SelectItem>
                          <SelectItem value="week">{isRTL ? 'الأسبوع الحالي' : 'This Week'}</SelectItem>
                          <SelectItem value="month">{isRTL ? 'الشهر الحالي' : 'This Month'}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* طريقة العرض */}
                      <Select value={activityViewBy} onValueChange={setActivityViewBy}>
                        <SelectTrigger className="w-32 rounded-xl h-8 text-xs">
                          <BarChart3 className="h-3 w-3 me-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">{isRTL ? 'حسب الساعة' : 'By Hour'}</SelectItem>
                          <SelectItem value="school">{isRTL ? 'حسب المدرسة' : 'By School'}</SelectItem>
                          <SelectItem value="type">{isRTL ? 'حسب النوع' : 'By Type'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Mobile Controls */}
                    <div className="lg:hidden">
                      <Select value={activityPeriod} onValueChange={setActivityPeriod}>
                        <SelectTrigger className="w-24 rounded-xl h-7 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                          <SelectItem value="24h">{isRTL ? '24 ساعة' : '24h'}</SelectItem>
                          <SelectItem value="week">{isRTL ? 'الأسبوع' : 'Week'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* فلاتر النشاط - Desktop Only */}
                  <div className="hidden lg:flex items-center gap-4 bg-muted/30 p-3 rounded-xl">
                    <span className="text-xs font-medium text-muted-foreground">{isRTL ? 'إظهار:' : 'Show:'}</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={activityFilters.showLessons}
                          onChange={(e) => setActivityFilters({...activityFilters, showLessons: e.target.checked})}
                          className="rounded border-green-500 text-green-500 focus:ring-green-500"
                        />
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-xs">{isRTL ? 'الحصص' : 'Lessons'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={activityFilters.showAttendance}
                          onChange={(e) => setActivityFilters({...activityFilters, showAttendance: e.target.checked})}
                          className="rounded border-blue-500 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-xs">{isRTL ? 'الحضور' : 'Attendance'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={activityFilters.showGrades}
                          onChange={(e) => setActivityFilters({...activityFilters, showGrades: e.target.checked})}
                          className="rounded border-purple-500 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-xs">{isRTL ? 'الدرجات' : 'Grades'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={activityFilters.showUsers}
                          onChange={(e) => setActivityFilters({...activityFilters, showUsers: e.target.checked})}
                          className="rounded border-orange-500 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        <span className="text-xs">{isRTL ? 'المستخدمين' : 'Users'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-4 lg:px-6">
                {/* الرسم البياني التفاعلي */}
                <div className="h-48 lg:h-72 mb-4 lg:mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGrades" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          direction: isRTL ? 'rtl' : 'ltr',
                          fontSize: '12px'
                        }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                      />
                      {activityFilters.showLessons && (
                        <Area 
                          type="monotone" 
                          dataKey="lessons" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorLessons)" 
                          name={isRTL ? 'الحصص المنفذة' : 'Lessons'} 
                        />
                      )}
                      {activityFilters.showAttendance && (
                        <Area 
                          type="monotone" 
                          dataKey="attendance" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorAttendance)" 
                          name={isRTL ? 'تسجيل الحضور' : 'Attendance'} 
                        />
                      )}
                      {activityFilters.showGrades && (
                        <Area 
                          type="monotone" 
                          dataKey="grades" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorGrades)" 
                          name={isRTL ? 'تسجيل الدرجات' : 'Grades'} 
                        />
                      )}
                      {activityFilters.showUsers && (
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorUsers)" 
                          name={isRTL ? 'نشاط المستخدمين' : 'User Activity'} 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* ملخص المؤشرات - Quick Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-green-800">{isRTL ? 'الحصص المنفذة' : 'Lessons'}</span>
                      <Badge className={activitySummary.lessons.status === 'high' ? 'bg-green-500' : activitySummary.lessons.status === 'low' ? 'bg-red-500' : 'bg-gray-500'}>
                        {activitySummary.lessons.status === 'high' ? (isRTL ? 'مرتفع' : 'High') : activitySummary.lessons.status === 'low' ? (isRTL ? 'منخفض' : 'Low') : (isRTL ? 'طبيعي' : 'Normal')}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{activitySummary.lessons.count}</p>
                    <p className={`text-xs flex items-center gap-1 ${activitySummary.lessons.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activitySummary.lessons.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {activitySummary.lessons.change >= 0 ? '+' : ''}{activitySummary.lessons.change}% {isRTL ? 'مقارنة بالأمس' : 'vs yesterday'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-800">{isRTL ? 'تسجيلات الحضور' : 'Attendance'}</span>
                      <Badge className={activitySummary.attendance.status === 'high' ? 'bg-green-500' : activitySummary.attendance.status === 'low' ? 'bg-red-500' : 'bg-gray-500'}>
                        {activitySummary.attendance.status === 'high' ? (isRTL ? 'مرتفع' : 'High') : activitySummary.attendance.status === 'low' ? (isRTL ? 'منخفض' : 'Low') : (isRTL ? 'طبيعي' : 'Normal')}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{activitySummary.attendance.count}</p>
                    <p className={`text-xs flex items-center gap-1 ${activitySummary.attendance.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activitySummary.attendance.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {activitySummary.attendance.change >= 0 ? '+' : ''}{activitySummary.attendance.change}% {isRTL ? 'مقارنة بالأمس' : 'vs yesterday'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-800">{isRTL ? 'إدخالات الدرجات' : 'Grades'}</span>
                      <Badge className={activitySummary.grades.status === 'high' ? 'bg-green-500' : activitySummary.grades.status === 'low' ? 'bg-red-500' : 'bg-gray-500'}>
                        {activitySummary.grades.status === 'high' ? (isRTL ? 'مرتفع' : 'High') : activitySummary.grades.status === 'low' ? (isRTL ? 'منخفض' : 'Low') : (isRTL ? 'طبيعي' : 'Normal')}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{activitySummary.grades.count}</p>
                    <p className={`text-xs flex items-center gap-1 ${activitySummary.grades.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activitySummary.grades.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {activitySummary.grades.change >= 0 ? '+' : ''}{activitySummary.grades.change}% {isRTL ? 'مقارنة بالأمس' : 'vs yesterday'}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-orange-800">{isRTL ? 'المستخدمين النشطين' : 'Active Users'}</span>
                      <Badge className={activitySummary.users.status === 'high' ? 'bg-green-500' : activitySummary.users.status === 'low' ? 'bg-red-500' : 'bg-gray-500'}>
                        {activitySummary.users.status === 'high' ? (isRTL ? 'مرتفع' : 'High') : activitySummary.users.status === 'low' ? (isRTL ? 'منخفض' : 'Low') : (isRTL ? 'طبيعي' : 'Normal')}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">{activitySummary.users.count}</p>
                    <p className={`text-xs flex items-center gap-1 ${activitySummary.users.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activitySummary.users.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {activitySummary.users.change >= 0 ? '+' : ''}{activitySummary.users.change}% {isRTL ? 'مقارنة بالأمس' : 'vs yesterday'}
                    </p>
                  </div>
                </div>
                
                {/* تنبيهات النشاط - Activity Alerts */}
                {activityAlerts.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-500" />
                      {isRTL ? 'تنبيهات النشاط' : 'Activity Alerts'}
                    </h4>
                    <div className="space-y-2">
                      {activityAlerts.map((alert, index) => (
                        <div 
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                            alert.type === 'critical' ? 'bg-red-50 border border-red-200' :
                            alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'
                          }`}
                          onClick={() => toast.info(alert.message)}
                        >
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.type === 'critical' ? 'text-red-500' :
                            alert.type === 'warning' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.message}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ============================================ */}
          {/* 5. لوحة العمليات الذكية السريعة - Quick AI Operations Panel */}
          {/* ============================================ */}
          <QuickAIOperationsPanel api={api} isRTL={isRTL} />

          {/* ============================================ */}
          {/* 6. مساعدك الذكي حكيم - Hakim AI Assistant */}
          {/* ============================================ */}
          <section data-testid="hakim-section">
            <Card className="card-nassaq">
              <CardHeader className="pb-2">
                <CardTitle className="font-cairo text-lg flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img src={HAKIM_AVATAR} alt="Hakim" className="w-full h-full object-cover" />
                    </div>
                    {/* Pulsing online indicator */}
                    <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  {isRTL ? 'مساعدك الذكي حكيم' : 'Hakim - Your AI Assistant'}
                  <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {isRTL ? 'متاح الآن' : 'Online Now'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اسأل حكيم أي سؤال عن المنصة وسيساعدك فوراً' : 'Ask Hakim any question and get instant help'}
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

        {/* ============================================ */}
        {/* Wizard: إضافة مدرسة جديدة - Create School Wizard */}
        {/* ============================================ */}
        <CreateSchoolWizard
          open={showAddSchoolWizard}
          onOpenChange={setShowAddSchoolWizard}
          onSuccess={(newSchool) => {
            fetchStats();
            fetchSchools();
            toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School created successfully!');
          }}
          api={api}
          isRTL={isRTL}
        />

        {/* ============================================ */}
        {/* Dialog: إعدادات العرض - Display Settings */}
        {/* ============================================ */}
        <Dialog open={showDisplaySettings} onOpenChange={setShowDisplaySettings}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'إعدادات العرض' : 'Display Settings'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'تخصيص الكروت المعروضة وترتيبها في لوحة التحكم' : 'Customize and reorder the cards displayed in the dashboard'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Visible Cards Section */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {isRTL ? 'إظهار / إخفاء المؤشرات' : 'Show / Hide Cards'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'schools', label: isRTL ? 'المدارس' : 'Schools', icon: Building2, color: 'text-brand-navy' },
                    { key: 'students', label: isRTL ? 'الطلاب' : 'Students', icon: GraduationCap, color: 'text-brand-turquoise' },
                    { key: 'teachers', label: isRTL ? 'المعلمين' : 'Teachers', icon: UserCheck, color: 'text-brand-purple' },
                    { key: 'admins', label: isRTL ? 'المسؤولين' : 'Admins', icon: Users, color: 'text-orange-500' },
                    { key: 'activeUsers', label: isRTL ? 'النشطين' : 'Active', icon: Activity, color: 'text-green-500' },
                    { key: 'apiCalls', label: isRTL ? 'API' : 'API', icon: Server, color: 'text-teal-500' },
                  ].map((item) => (
                    <div 
                      key={item.key} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        visibleCards[item.key] ? 'bg-brand-turquoise/5 border-brand-turquoise/30' : 'bg-muted/30 border-transparent'
                      }`}
                      onClick={() => setVisibleCards({ ...visibleCards, [item.key]: !visibleCards[item.key] })}
                      data-testid={`toggle-card-${item.key}`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        visibleCards[item.key] ? 'bg-brand-turquoise' : 'bg-muted'
                      }`}>
                        {visibleCards[item.key] && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reorder Cards Section */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <GripVertical className="h-4 w-4" />
                  {isRTL ? 'ترتيب الكروت' : 'Card Order'}
                </h4>
                <div className="space-y-2">
                  {cardsOrder.map((cardKey, index) => {
                    const cardInfo = {
                      schools: { label: isRTL ? 'المدارس المسجلة' : 'Registered Schools', icon: Building2 },
                      students: { label: isRTL ? 'الطلاب المسجلين' : 'Enrolled Students', icon: GraduationCap },
                      teachers: { label: isRTL ? 'المعلمين' : 'Teachers', icon: UserCheck },
                      admins: { label: isRTL ? 'المسؤولين' : 'Administrators', icon: Users },
                      activeUsers: { label: isRTL ? 'المستخدمين النشطين' : 'Active Users', icon: Activity },
                      apiCalls: { label: isRTL ? 'طلبات API' : 'API Requests', icon: Server },
                    }[cardKey];
                    const IconComp = cardInfo.icon;
                    
                    return (
                      <div 
                        key={cardKey}
                        className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-xl"
                        data-testid={`reorder-card-${cardKey}`}
                      >
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            disabled={index === 0}
                            onClick={() => moveCard(index, 'up')}
                            data-testid={`move-up-${cardKey}`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            disabled={index === cardsOrder.length - 1}
                            onClick={() => moveCard(index, 'down')}
                            data-testid={`move-down-${cardKey}`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                        <IconComp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{cardInfo.label}</span>
                        {!visibleCards[cardKey] && (
                          <Badge variant="secondary" className="text-xs">{isRTL ? 'مخفي' : 'Hidden'}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setVisibleCards({ schools: true, students: true, teachers: true, admins: true, activeUsers: true, apiCalls: true });
                  setCardsOrder(['schools', 'students', 'teachers', 'admins', 'activeUsers', 'apiCalls']);
                }} 
                className="rounded-xl"
                data-testid="reset-display-settings"
              >
                {isRTL ? 'إعادة تعيين' : 'Reset'}
              </Button>
              <Button onClick={() => setShowDisplaySettings(false)} className="rounded-xl bg-brand-navy" data-testid="save-display-settings">
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
};
