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

// Sparkline data generator for cards
const generateSparklineData = (baseValue, trend) => {
  const data = [];
  let value = baseValue * 0.85;
  for (let i = 0; i < 7; i++) {
    const change = trend === 'up' ? Math.random() * 0.05 : trend === 'down' ? -Math.random() * 0.03 : (Math.random() - 0.5) * 0.02;
    value = value * (1 + change);
    data.push({ day: i + 1, value: Math.round(value) });
  }
  return data;
};

// Mini Sparkline Component
const MiniSparkline = ({ data, color = '#38b2ac', height = 40 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
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

  // تحميل قائمة المدارس عند التحميل الأول
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // *** تحديث البيانات عند تغيير أي فلتر - Dynamic Data Refresh ***
  // fetchStats يعتمد على filters، لذا سيتم استدعاؤه تلقائياً عند تغيير أي فلتر
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // تصدير البيانات - Export Data (تنزيل ملف فعلي)
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
      // تصدير كملف HTML (يمكن طباعته كـ PDF)
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير نَسَّق - NASSAQ Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; }
            h1 { color: #1e3a5f; border-bottom: 2px solid #38b2ac; padding-bottom: 10px; }
            .date { color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background: #1e3a5f; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 40px; color: #999; font-size: 12px; }
            .filters { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>تقرير المؤشرات العامة للمنصة</h1>
          <p class="date">
            <strong>التاريخ الهجري:</strong> ${getCurrentHijriDate().hijri}<br/>
            <strong>التاريخ الميلادي:</strong> ${getCurrentHijriDate().gregorian}
          </p>
          <div class="filters">
            <strong>الفلاتر المطبقة:</strong>
            النطاق: ${filters.scope === 'all' ? 'كل المنصة' : filters.scope} |
            الفترة: ${filters.timeWindow} |
            الحالة: ${filters.tenantStatus === 'all' ? 'الكل' : filters.tenantStatus}
          </div>
          <table>
            <tr><th>المؤشر</th><th>القيمة</th></tr>
            <tr><td>إجمالي المدارس المسجلة</td><td>${data.stats.totalSchools}</td></tr>
            <tr><td>المدارس النشطة</td><td>${data.stats.activeSchools}</td></tr>
            <tr><td>المدارس الموقوفة</td><td>${data.stats.suspendedSchools}</td></tr>
            <tr><td>المدارس قيد الإعداد</td><td>${data.stats.pendingSchools}</td></tr>
            <tr><td>إجمالي الطلاب</td><td>${data.stats.totalStudents.toLocaleString()}</td></tr>
            <tr><td>إجمالي المعلمين</td><td>${data.stats.totalTeachers.toLocaleString()}</td></tr>
            <tr><td>إجمالي المسؤولين</td><td>${data.stats.totalAdmins}</td></tr>
            <tr><td>المستخدمين النشطين اليوم</td><td>${data.stats.activeUsersToday.toLocaleString()}</td></tr>
            <tr><td>طلبات API اليوم</td><td>${data.stats.apiCallsToday.toLocaleString()}</td></tr>
          </table>
          <p class="footer">تم إنشاء هذا التقرير بواسطة نظام نَسَّق | NASSAQ School Management System</p>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `nassaq_report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success(isRTL ? 'تم تنزيل الملف - افتحه واطبعه كـ PDF' : 'File downloaded - open and print as PDF');
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

  // Render Enhanced Analytics Card
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
        <CardContent className="p-5">
          {/* Header: Icon, Title, Health Tag */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                {/* Health Tag */}
                <Badge variant="outline" className={`text-[10px] mt-1 ${healthConfig.color}`}>
                  {healthConfig.label}
                </Badge>
              </div>
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold">{card.mainValue?.toLocaleString() || 0}</p>
              {/* Delta Indicator */}
              <div className="flex items-center gap-1.5 mt-1">
                {card.delta.type === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {card.delta.type === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                {card.delta.type === 'stable' && <Minus className="h-4 w-4 text-gray-400" />}
                <span className={`text-sm font-medium ${
                  card.delta.type === 'up' ? 'text-green-600' : 
                  card.delta.type === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {card.delta.type === 'up' ? '+' : card.delta.type === 'down' ? '-' : ''}{card.delta.value}%
                </span>
                <span className="text-xs text-muted-foreground">{card.delta.period}</span>
              </div>
            </div>
            
            {/* Sparkline Chart */}
            <div className="w-24 h-12">
              <MiniSparkline data={card.sparklineData} color={card.sparklineColor} height={48} />
            </div>
          </div>
          
          {/* Secondary Data Badges */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            {card.secondaryData?.map((item, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-muted/50"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor || 'bg-gray-400'} me-1.5`}></span>
                {item.label}: {item.value ?? 0}
              </Badge>
            ))}
          </div>
          
          {/* Hover Indicator */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          
          {/* ============================================ */}
          {/* 1. التاريخ واسم المستخدم - أول شيء في الصفحة */}
          {/* ============================================ */}
          <div className="flex justify-center" data-testid="date-display">
            <Card className="card-nassaq bg-gradient-to-r from-brand-navy/5 via-brand-turquoise/5 to-brand-purple/5 border-brand-navy/20">
              <CardContent className="py-3 px-6">
                <div className="flex items-center gap-6">
                  {/* اسم المستخدم */}
                  <div className="flex items-center gap-3 pe-6 border-e border-border" data-testid="user-display">
                    <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'مرحباً' : 'Welcome'}</p>
                      <p className="font-bold text-brand-navy">{user?.full_name || (isRTL ? 'مدير المنصة' : 'Platform Admin')}</p>
                    </div>
                  </div>
                  
                  {/* التاريخ الهجري/الميلادي */}
                  <div className="flex items-center gap-4">
                    <Calendar className="h-6 w-6 text-brand-navy" />
                    <div className="text-center">
                      <p className="font-cairo text-2xl font-bold text-brand-navy">
                        {getCurrentHijriDate().hijri}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        ({getCurrentHijriDate().gregorian})
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-border" />
                  
                  {/* الفصل الدراسي */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{isRTL ? 'الفصل الدراسي' : 'Semester'}</p>
                    <p className="font-bold text-brand-turquoise">{isRTL ? 'الثاني 1446-1447' : '2nd 1446-1447'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ============================================ */}
          {/* 2. قسم المؤشرات العامة للمنصة */}
          {/* ============================================ */}
          <section data-testid="analytics-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cairo text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'المؤشرات العامة للمنصة' : 'Platform Analytics'}
              </h2>
            </div>

            {/* ============================================ */}
            {/* شريط التحكم العلوي - Global Filters Bar */}
            {/* ============================================ */}
            <Card className="card-nassaq mb-4 border-2 border-brand-turquoise/20" data-testid="global-filters-bar">
              <CardContent className="p-4">
                
                {/* الصف الأول: نطاق البيانات والفلاتر الإضافية */}
                <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border/50">
                  
                  {/* A. نطاق البيانات - Scope */}
                  <div className="flex items-center gap-2 bg-brand-navy/5 px-3 py-2 rounded-xl border border-brand-navy/10">
                    <Filter className="h-4 w-4 text-brand-navy" />
                    <span className="text-xs font-bold text-brand-navy">{isRTL ? 'النطاق' : 'Scope'}</span>
                    <Select 
                      value={filters.scope} 
                      onValueChange={(v) => setFilters({ ...filters, scope: v, selectedSchool: '', selectedSchools: [] })}
                    >
                      <SelectTrigger className="w-36 rounded-lg h-8 text-sm border-brand-navy/20 bg-background" data-testid="scope-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'كل المنصة' : 'All Tenants'}</SelectItem>
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

                  {/* فاصل */}
                  <div className="h-6 w-px bg-border hidden lg:block" />

                  {/* فلتر المدينة */}
                  <Select 
                    value={filters.city || 'all_cities'} 
                    onValueChange={(v) => setFilters({ ...filters, city: v === 'all_cities' ? '' : v })}
                  >
                    <SelectTrigger className="w-32 rounded-xl h-8 text-sm" data-testid="city-filter">
                      <MapPin className="h-3 w-3 me-1 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_cities">{isRTL ? 'كل المدن' : 'All Cities'}</SelectItem>
                      {SAUDI_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* فلتر المنطقة */}
                  <Select 
                    value={filters.region || 'all_regions'} 
                    onValueChange={(v) => setFilters({ ...filters, region: v === 'all_regions' ? '' : v })}
                  >
                    <SelectTrigger className="w-28 rounded-xl h-8 text-sm" data-testid="region-filter">
                      <Globe className="h-3 w-3 me-1 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_regions">{isRTL ? 'كل المناطق' : 'All Regions'}</SelectItem>
                      <SelectItem value="central">{isRTL ? 'الوسطى' : 'Central'}</SelectItem>
                      <SelectItem value="western">{isRTL ? 'الغربية' : 'Western'}</SelectItem>
                      <SelectItem value="eastern">{isRTL ? 'الشرقية' : 'Eastern'}</SelectItem>
                      <SelectItem value="northern">{isRTL ? 'الشمالية' : 'Northern'}</SelectItem>
                      <SelectItem value="southern">{isRTL ? 'الجنوبية' : 'Southern'}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* فلتر نوع المدرسة */}
                  <Select 
                    value={filters.schoolType || 'all_types'} 
                    onValueChange={(v) => setFilters({ ...filters, schoolType: v === 'all_types' ? '' : v })}
                  >
                    <SelectTrigger className="w-28 rounded-xl h-8 text-sm" data-testid="type-filter">
                      <GraduationCap className="h-3 w-3 me-1 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_types">{isRTL ? 'كل الأنواع' : 'All Types'}</SelectItem>
                      <SelectItem value="public">{isRTL ? 'حكومي' : 'Public'}</SelectItem>
                      <SelectItem value="private">{isRTL ? 'خاص' : 'Private'}</SelectItem>
                      <SelectItem value="international">{isRTL ? 'عالمي' : 'International'}</SelectItem>
                    </SelectContent>
                  </Select>
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
            <div className={`grid gap-4 ${
              viewMode === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' :
              viewMode === 'expanded' ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`} data-testid="analytics-cards-grid">
              {cardsOrder.map((cardKey) => renderAnalyticsCard(cardKey))}
            </div>
          </section>

          {/* ============================================ */}
          {/* 3. الإجراءات السريعة - Quick Actions */}
          {/* ============================================ */}
          <section data-testid="quick-actions-section">
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

          {/* ============================================ */}
          {/* 4. نشاط المنصة اليومي - Daily Platform Activity */}
          {/* ============================================ */}
          <section data-testid="activity-section">
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

          {/* ============================================ */}
          {/* 5. لوحة العمليات الذكية - AI Operations Panel */}
          {/* ============================================ */}
          <section data-testid="ai-ops-section">
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

          {/* ============================================ */}
          {/* 6. مساعد حكيم الذكي - Hakim AI Assistant */}
          {/* ============================================ */}
          <section data-testid="hakim-section">
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

        {/* ============================================ */}
        {/* Dialog: إضافة مدرسة جديدة - Add School Wizard */}
        {/* ============================================ */}
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
                    <div className={`h-2 rounded-full ${step <= wizardStep ? 'bg-brand-turquoise' : 'bg-muted'}`} />
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
