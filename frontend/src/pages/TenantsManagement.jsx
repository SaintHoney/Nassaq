import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ScrollArea } from '../components/ui/scroll-area';
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
} from '../components/ui/sheet';
import {
  Building2, Search, Filter, Plus, LayoutGrid, List, MoreVertical,
  Users, GraduationCap, MapPin, Calendar, Brain, Settings, Eye,
  Edit, Pause, Play, Trash2, Mail, FileText, Download, Upload,
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, ArrowLeft,
  Phone, AtSign, Hash, ChevronRight, ChevronDown, Archive, Activity,
  School, Globe, Sparkles, BarChart3, UserPlus, FileSpreadsheet, X,
  Menu, Bell, Home
} from 'lucide-react';
import CreateSchoolWizard from '../components/wizards/CreateSchoolWizard';
import { Sidebar } from '../components/layout/Sidebar';

// Translations
const translations = {
  ar: {
    pageTitle: 'إدارة المدارس',
    pageSubtitle: 'إدارة جميع المدارس والمؤسسات التعليمية',
    addSchool: 'إضافة مدرسة جديدة',
    totalSchools: 'إجمالي المدارس',
    totalTeachers: 'إجمالي المعلمين',
    totalStudents: 'إجمالي الطلاب',
    activeSchools: 'نشطة',
    suspendedSchools: 'موقوفة',
    setupSchools: 'قيد الإعداد',
    expiredSchools: 'منتهية',
    viewingActiveSchools: 'عرض المدارس النشطة',
    viewingSuspendedSchools: 'عرض المدارس الموقوفة',
    viewingSetupSchools: 'عرض المدارس قيد الإعداد',
    viewingExpiredSchools: 'عرض المدارس المنتهية',
    viewingAllSchools: 'عرض جميع المدارس',
    searchPlaceholder: 'بحث بالاسم، الكود، الهاتف، البريد...',
    allStatus: 'جميع الحالات',
    active: 'نشطة',
    suspended: 'موقوفة',
    setup: 'قيد الإعداد',
    expired: 'منتهية',
    status: 'الحالة',
    allCities: 'جميع المدن',
    city: 'المدينة',
    aiStatus: 'حالة AI',
    all: 'الكل',
    enabled: 'مفعّل',
    disabled: 'غير مفعّل',
    reset: 'إعادة ضبط',
    filters: 'الفلاتر',
    schoolType: 'نوع المدرسة',
    public: 'حكومية',
    private: 'أهلية',
    stage: 'المرحلة',
    allStages: 'جميع المراحل',
    kindergarten: 'رياض الأطفال',
    primary: 'ابتدائي',
    intermediate: 'متوسط',
    secondary: 'ثانوي',
    apply: 'تطبيق',
    noResults: 'لا توجد نتائج',
    tryChangingFilters: 'جرب تغيير معايير البحث أو الفلاتر',
    resetFilters: 'إعادة ضبط الفلاتر',
    openDashboard: 'فتح لوحة التحكم',
    editData: 'تعديل البيانات',
    users: 'المستخدمون',
    reports: 'التقارير',
    enableAI: 'تفعيل AI',
    disableAI: 'إيقاف AI',
    suspend: 'تعليق',
    activate: 'تفعيل',
    resendWelcome: 'إعادة إرسال الترحيب',
    delete: 'حذف',
    students: 'طالب',
    teachers: 'معلم',
    health: 'الصحة',
    lastActivity: 'آخر نشاط:',
    school: 'مدرسة',
    total: 'إجمالي',
    schoolsSelected: 'مدرسة محددة',
    export: 'تصدير',
    createdSuccessfully: 'تم إنشاء المدرسة بنجاح!',
    suspendSchool: 'تعليق المدرسة',
    suspendConfirm: 'هل أنت متأكد من تعليق هذه المدرسة؟ سيتم تعطيل جميع الحسابات المرتبطة بها.',
    activateConfirm: 'هل أنت متأكد من إعادة تفعيل هذه المدرسة؟',
    aiEnabled: 'الذكاء الاصطناعي',
    aiEnabledDesc: 'تفعيل ميزات AI لجميع مستخدمي المدرسة',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
  },
  en: {
    pageTitle: 'Tenants Management',
    pageSubtitle: 'Manage all schools and educational institutions',
    addSchool: 'Add New School',
    totalSchools: 'Total Schools',
    totalTeachers: 'Total Teachers',
    totalStudents: 'Total Students',
    activeSchools: 'Active',
    suspendedSchools: 'Suspended',
    setupSchools: 'Setup',
    expiredSchools: 'Expired',
    viewingActiveSchools: 'Viewing Active Schools',
    viewingSuspendedSchools: 'Viewing Suspended Schools',
    viewingSetupSchools: 'Viewing Schools in Setup',
    viewingExpiredSchools: 'Viewing Expired Schools',
    viewingAllSchools: 'Viewing All Schools',
    searchPlaceholder: 'Search by name, code, phone, email...',
    allStatus: 'All Status',
    active: 'Active',
    suspended: 'Suspended',
    setup: 'Setup',
    expired: 'Expired',
    status: 'Status',
    allCities: 'All Cities',
    city: 'City',
    aiStatus: 'AI Status',
    all: 'All',
    enabled: 'Enabled',
    disabled: 'Disabled',
    reset: 'Reset',
    filters: 'Filters',
    schoolType: 'School Type',
    public: 'Public',
    private: 'Private',
    stage: 'Stage',
    allStages: 'All Stages',
    kindergarten: 'Kindergarten',
    primary: 'Primary',
    intermediate: 'Intermediate',
    secondary: 'Secondary',
    apply: 'Apply',
    noResults: 'No results found',
    tryChangingFilters: 'Try changing search criteria or filters',
    resetFilters: 'Reset Filters',
    openDashboard: 'Open Dashboard',
    editData: 'Edit Data',
    users: 'Users',
    reports: 'Reports',
    enableAI: 'Enable AI',
    disableAI: 'Disable AI',
    suspend: 'Suspend',
    activate: 'Activate',
    resendWelcome: 'Resend Welcome',
    delete: 'Delete',
    students: 'Students',
    teachers: 'Teachers',
    health: 'Health',
    lastActivity: 'Last:',
    school: 'school',
    total: 'total',
    schoolsSelected: 'schools selected',
    export: 'Export',
    createdSuccessfully: 'School created successfully!',
    suspendSchool: 'Suspend School',
    suspendConfirm: 'Are you sure you want to suspend this school? All associated accounts will be disabled.',
    activateConfirm: 'Are you sure you want to reactivate this school?',
    aiEnabled: 'Artificial Intelligence',
    aiEnabledDesc: 'Enable AI features for all school users',
    cancel: 'Cancel',
    confirm: 'Confirm',
  }
};

// School status configuration
const SCHOOL_STATUS = {
  active: { label: 'نشطة', label_en: 'Active', color: 'bg-green-500', textColor: 'text-green-600' },
  suspended: { label: 'موقوفة', label_en: 'Suspended', color: 'bg-red-500', textColor: 'text-red-600' },
  setup: { label: 'قيد الإعداد', label_en: 'Setup', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  expired: { label: 'منتهية', label_en: 'Expired', color: 'bg-gray-500', textColor: 'text-gray-600' },
};

// School types
const SCHOOL_TYPES = {
  public: { label: 'حكومية', label_en: 'Public' },
  private: { label: 'أهلية', label_en: 'Private' },
};

// Educational stages
const EDUCATIONAL_STAGES = {
  kindergarten: { label: 'رياض الأطفال', label_en: 'Kindergarten' },
  primary: { label: 'ابتدائي', label_en: 'Primary' },
  intermediate: { label: 'متوسط', label_en: 'Intermediate' },
  secondary: { label: 'ثانوي', label_en: 'Secondary' },
};

// Sample schools data
const SAMPLE_SCHOOLS = [
  {
    id: '1',
    code: 'NSS-SA-26-0001',
    name: 'مدرسة النور الأهلية',
    name_en: 'Al-Noor Private School',
    type: 'private',
    stage: 'primary',
    city: 'الرياض',
    country: 'SA',
    students_count: 450,
    teachers_count: 32,
    users_count: 520,
    status: 'active',
    ai_enabled: true,
    subscription_status: 'active',
    health_score: 92,
    created_at: '2026-01-15',
    last_activity: '2026-03-09 10:30',
    principal_name: 'أحمد محمد العبدالله',
    principal_email: 'principal@alnoor.edu.sa',
    principal_phone: '0512345678',
    logo_url: null,
    setup_complete: true,
  },
  {
    id: '2',
    code: 'NSS-SA-26-0002',
    name: 'ثانوية الملك فهد',
    name_en: 'King Fahd Secondary',
    type: 'public',
    stage: 'secondary',
    city: 'جدة',
    country: 'SA',
    students_count: 890,
    teachers_count: 58,
    users_count: 980,
    status: 'active',
    ai_enabled: true,
    subscription_status: 'active',
    health_score: 88,
    created_at: '2026-01-20',
    last_activity: '2026-03-09 09:45',
    principal_name: 'سعد الشمري',
    principal_email: 'principal@kfs.edu.sa',
    principal_phone: '0556789123',
    logo_url: null,
    setup_complete: true,
  },
  {
    id: '3',
    code: 'NSS-SA-26-0003',
    name: 'متوسطة الأمل',
    name_en: 'Al-Amal Intermediate',
    type: 'public',
    stage: 'intermediate',
    city: 'الدمام',
    country: 'SA',
    students_count: 320,
    teachers_count: 24,
    users_count: 380,
    status: 'suspended',
    ai_enabled: false,
    subscription_status: 'expired',
    health_score: 45,
    created_at: '2026-02-01',
    last_activity: '2026-02-28 14:20',
    principal_name: 'فهد العتيبي',
    principal_email: 'principal@alamal.edu.sa',
    principal_phone: '0534567890',
    logo_url: null,
    setup_complete: false,
  },
  {
    id: '4',
    code: 'NSS-SA-26-0004',
    name: 'ابتدائية الفلاح',
    name_en: 'Al-Falah Primary',
    type: 'private',
    stage: 'primary',
    city: 'مكة المكرمة',
    country: 'SA',
    students_count: 280,
    teachers_count: 18,
    users_count: 320,
    status: 'setup',
    ai_enabled: false,
    subscription_status: 'trial',
    health_score: 60,
    created_at: '2026-03-01',
    last_activity: '2026-03-08 16:00',
    principal_name: 'خالد الحربي',
    principal_email: 'principal@alfalah.edu.sa',
    principal_phone: '0598765432',
    logo_url: null,
    setup_complete: false,
  },
  {
    id: '5',
    code: 'NSS-SA-26-0005',
    name: 'مدارس التميز العالمية',
    name_en: 'Excellence International Schools',
    type: 'private',
    stage: 'primary',
    city: 'الرياض',
    country: 'SA',
    students_count: 1200,
    teachers_count: 85,
    users_count: 1400,
    status: 'active',
    ai_enabled: true,
    subscription_status: 'active',
    health_score: 95,
    created_at: '2025-12-01',
    last_activity: '2026-03-09 11:15',
    principal_name: 'عبدالرحمن السالم',
    principal_email: 'principal@excellence.edu.sa',
    principal_phone: '0501234567',
    logo_url: null,
    setup_complete: true,
  },
  {
    id: '6',
    code: 'NSS-SA-26-0006',
    name: 'روضة براعم المستقبل',
    name_en: 'Future Buds Kindergarten',
    type: 'private',
    stage: 'kindergarten',
    city: 'جدة',
    country: 'SA',
    students_count: 150,
    teachers_count: 12,
    users_count: 180,
    status: 'active',
    ai_enabled: false,
    subscription_status: 'active',
    health_score: 78,
    created_at: '2026-02-15',
    last_activity: '2026-03-09 08:30',
    principal_name: 'نورة القحطاني',
    principal_email: 'principal@futurebuds.edu.sa',
    principal_phone: '0567891234',
    logo_url: null,
    setup_complete: true,
  },
];

export default function TenantsManagement() {
  const { api, isRTL: contextIsRTL } = useAuth();
  const navigate = useNavigate();
  const isRTL = contextIsRTL !== false; // Default to RTL
  const t = translations[isRTL ? 'ar' : 'en'];
  
  // States
  const [schools, setSchools] = useState(SAMPLE_SCHOOLS);
  const [filteredSchools, setFilteredSchools] = useState(SAMPLE_SCHOOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(null);
  const [showAIDialog, setShowAIDialog] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    status: 'all',
    city: 'all',
    type: 'all',
    stage: 'all',
    aiStatus: 'all',
    subscriptionStatus: 'all',
  });
  
  // Stats
  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === 'active').length,
    suspended: schools.filter(s => s.status === 'suspended').length,
    setup: schools.filter(s => s.status === 'setup').length,
    expired: schools.filter(s => s.status === 'expired').length,
    aiEnabled: schools.filter(s => s.ai_enabled).length,
    totalStudents: schools.reduce((sum, s) => sum + s.students_count, 0),
    totalTeachers: schools.reduce((sum, s) => sum + s.teachers_count, 0),
  };
  
  // Filter and search schools
  useEffect(() => {
    let result = [...schools];
    
    // Apply active status filter from stats card click
    if (activeStatusFilter) {
      result = result.filter(s => s.status === activeStatusFilter);
    }
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(school => 
        school.name.toLowerCase().includes(query) ||
        school.name_en?.toLowerCase().includes(query) ||
        school.code.toLowerCase().includes(query) ||
        school.principal_name?.toLowerCase().includes(query) ||
        school.principal_email?.toLowerCase().includes(query) ||
        school.principal_phone?.includes(query) ||
        school.city.toLowerCase().includes(query)
      );
    }
    
    // Apply filters (only if no status filter from card click)
    if (!activeStatusFilter && filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status);
    }
    if (filters.city !== 'all') {
      result = result.filter(s => s.city === filters.city);
    }
    if (filters.type !== 'all') {
      result = result.filter(s => s.type === filters.type);
    }
    if (filters.stage !== 'all') {
      result = result.filter(s => s.stage === filters.stage);
    }
    if (filters.aiStatus !== 'all') {
      result = result.filter(s => filters.aiStatus === 'enabled' ? s.ai_enabled : !s.ai_enabled);
    }
    
    setFilteredSchools(result);
  }, [searchQuery, filters, schools, activeStatusFilter]);
  
  // Get unique cities
  const cities = [...new Set(schools.map(s => s.city))];
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      city: 'all',
      type: 'all',
      stage: 'all',
      aiStatus: 'all',
      subscriptionStatus: 'all',
    });
    setSearchQuery('');
    setActiveStatusFilter(null);
  };
  
  // Handle status filter from stats card
  const handleStatusFilter = (status) => {
    if (activeStatusFilter === status) {
      setActiveStatusFilter(null);
    } else {
      setActiveStatusFilter(status);
    }
  };
  
  // Get current filter label
  const getCurrentFilterLabel = () => {
    if (!activeStatusFilter) return t.viewingAllSchools;
    switch (activeStatusFilter) {
      case 'active': return t.viewingActiveSchools;
      case 'suspended': return t.viewingSuspendedSchools;
      case 'setup': return t.viewingSetupSchools;
      case 'expired': return t.viewingExpiredSchools;
      default: return t.viewingAllSchools;
    }
  };
  
  // Toggle school selection
  const toggleSchoolSelection = (schoolId) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };
  
  // School actions
  const handleSchoolAction = (action, school) => {
    switch (action) {
      case 'view':
        navigate(`/admin/schools/${school.id}`);
        break;
      case 'edit':
        toast.info(isRTL ? 'جاري فتح صفحة التعديل...' : 'Opening edit page...');
        break;
      case 'suspend':
        setShowSuspendDialog(school);
        break;
      case 'activate':
        handleToggleSuspend(school, false);
        break;
      case 'toggleAI':
        setShowAIDialog(school);
        break;
      case 'users':
        navigate(`/admin/schools/${school.id}/users`);
        break;
      case 'reports':
        navigate(`/admin/schools/${school.id}/reports`);
        break;
      case 'resendWelcome':
        toast.success(isRTL ? 'تم إرسال رسالة الترحيب' : 'Welcome message sent');
        break;
      case 'delete':
        toast.error(isRTL ? 'تم حذف المدرسة' : 'School deleted');
        break;
      default:
        break;
    }
  };
  
  // Handle suspend toggle
  const handleToggleSuspend = (school, suspend = true) => {
    setSchools(prev => prev.map(s => 
      s.id === school.id ? { ...s, status: suspend ? 'suspended' : 'active' } : s
    ));
    toast.success(suspend 
      ? (isRTL ? `تم تعليق ${school.name}` : `${school.name} suspended`)
      : (isRTL ? `تم تفعيل ${school.name}` : `${school.name} activated`)
    );
    setShowSuspendDialog(null);
  };
  
  // Handle AI toggle
  const handleToggleAI = (school, enable) => {
    setSchools(prev => prev.map(s => 
      s.id === school.id ? { ...s, ai_enabled: enable } : s
    ));
    toast.success(enable 
      ? (isRTL ? `تم تفعيل AI لـ ${school.name}` : `AI enabled for ${school.name}`)
      : (isRTL ? `تم إيقاف AI لـ ${school.name}` : `AI disabled for ${school.name}`)
    );
    setShowAIDialog(null);
  };
  
  // Bulk actions
  const handleBulkAction = (action) => {
    const count = selectedSchools.length;
    switch (action) {
      case 'enableAI':
        toast.success(isRTL ? `تم تفعيل AI لـ ${count} مدرسة` : `AI enabled for ${count} schools`);
        break;
      case 'disableAI':
        toast.warning(isRTL ? `تم إيقاف AI لـ ${count} مدرسة` : `AI disabled for ${count} schools`);
        break;
      case 'export':
        toast.info(isRTL ? 'جاري تصدير البيانات...' : 'Exporting data...');
        break;
      case 'suspend':
        toast.warning(isRTL ? `تم تعليق ${count} مدرسة` : `${count} schools suspended`);
        break;
      default:
        break;
    }
    setSelectedSchools([]);
  };
  
  // Generate temporary logo color
  const getLogoColor = (id) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
    return colors[parseInt(id) % colors.length];
  };
  
  // Get health score color
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Sidebar>
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'} data-testid="tenants-management">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <h1 className="font-cairo text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-navy" />
                {t.pageTitle}
              </h1>
              <p className="text-xs text-muted-foreground">{filteredSchools.length} {t.school}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowFilters(true)}>
              <Filter className="h-5 w-5" />
              {Object.values(filters).filter(v => v !== 'all').length > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-brand-purple text-white text-[10px] rounded-full flex items-center justify-center">
                  {Object.values(filters).filter(v => v !== 'all').length}
                </span>
              )}
            </Button>
            <Button size="icon" className="bg-brand-navy" onClick={() => setShowCreateWizard(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 rounded-xl"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button 
              className="bg-brand-navy hover:bg-brand-navy/90 rounded-xl px-6 py-6 text-lg shadow-lg" 
              onClick={() => setShowCreateWizard(true)}
              data-testid="add-school-btn"
            >
              <Plus className="h-6 w-6 me-2" />
              {t.addSchool}
            </Button>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`font-cairo text-2xl font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Building2 className="h-7 w-7 text-brand-navy" />
                  {t.pageTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t.pageSubtitle}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Stats Cards - Desktop - 2 columns for school info, then total schools card */}
          <div className={`grid grid-cols-4 gap-4 mb-4 ${isRTL ? 'direction-rtl' : ''}`}>
            {/* إجمالي المعلمين */}
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="p-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-teal-600 text-sm">{t.totalTeachers}</p>
                    <p className="text-3xl font-bold text-teal-700">{stats.totalTeachers}</p>
                  </div>
                  <GraduationCap className="h-10 w-10 text-teal-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* إجمالي الطلاب */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-blue-600 text-sm">{t.totalStudents}</p>
                    <p className="text-3xl font-bold text-blue-700">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* كارت إجمالي المدارس مع الحالات التفاعلية */}
            <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/80 text-white col-span-2">
              <CardContent className="p-4">
                <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-white/70 text-sm">{t.totalSchools}</p>
                    <p className="text-4xl font-bold">{stats.total}</p>
                  </div>
                  <Building2 className="h-12 w-12 text-white/30" />
                </div>
                
                {/* Interactive status sections */}
                <div className={`grid grid-cols-4 gap-2 pt-3 border-t border-white/20 ${isRTL ? 'direction-rtl' : ''}`}>
                  {/* Expired */}
                  <button 
                    onClick={() => handleStatusFilter('expired')}
                    className={`text-center p-2 rounded-lg transition-all cursor-pointer hover:bg-white/10 ${activeStatusFilter === 'expired' ? 'bg-white/20 ring-2 ring-white/50' : ''}`}
                    data-testid="filter-expired"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="text-xl font-bold">{stats.expired}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{t.expiredSchools}</p>
                  </button>
                  
                  {/* Suspended */}
                  <button 
                    onClick={() => handleStatusFilter('suspended')}
                    className={`text-center p-2 rounded-lg transition-all cursor-pointer hover:bg-white/10 ${activeStatusFilter === 'suspended' ? 'bg-white/20 ring-2 ring-white/50' : ''}`}
                    data-testid="filter-suspended"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      <span className="text-xl font-bold">{stats.suspended}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{t.suspendedSchools}</p>
                  </button>
                  
                  {/* Setup */}
                  <button 
                    onClick={() => handleStatusFilter('setup')}
                    className={`text-center p-2 rounded-lg transition-all cursor-pointer hover:bg-white/10 ${activeStatusFilter === 'setup' ? 'bg-white/20 ring-2 ring-white/50' : ''}`}
                    data-testid="filter-setup"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="text-xl font-bold">{stats.setup}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{t.setupSchools}</p>
                  </button>
                  
                  {/* Active */}
                  <button 
                    onClick={() => handleStatusFilter('active')}
                    className={`text-center p-2 rounded-lg transition-all cursor-pointer hover:bg-white/10 ${activeStatusFilter === 'active' ? 'bg-white/20 ring-2 ring-white/50' : ''}`}
                    data-testid="filter-active"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      <span className="text-xl font-bold">{stats.active}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{t.activeSchools}</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Filter Indicator */}
          {activeStatusFilter && (
            <div className="mb-4 p-3 bg-brand-purple/10 border border-brand-purple/30 rounded-xl flex items-center justify-between">
              <span className="text-sm font-medium text-brand-purple flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {getCurrentFilterLabel()}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveStatusFilter(null)}
                className="text-brand-purple hover:bg-brand-purple/20"
              >
                <X className="h-4 w-4 me-1" />
                {isRTL ? 'إلغاء الفلتر' : 'Clear filter'}
              </Button>
            </div>
          )}
          
          {/* Search and Filters - Desktop */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 rounded-xl"
              />
            </div>
            
            {/* Quick Filters */}
            <Select value={filters.status} onValueChange={(v) => { setFilters({ ...filters, status: v }); setActiveStatusFilter(null); }}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue placeholder={t.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatus}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="suspended">{t.suspended}</SelectItem>
                <SelectItem value="setup">{t.setup}</SelectItem>
                <SelectItem value="expired">{t.expired}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue placeholder={t.city} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCities}</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.aiStatus} onValueChange={(v) => setFilters({ ...filters, aiStatus: v })}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue placeholder={t.aiStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="enabled">{t.enabled}</SelectItem>
                <SelectItem value="disabled">{t.disabled}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={resetFilters} className="rounded-xl">
              <RefreshCw className="h-4 w-4 me-2" />
              {t.reset}
            </Button>
            
            <div className="flex items-center border rounded-xl overflow-hidden">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="icon" 
                className="rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="icon" 
                className="rounded-none"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Stats */}
      <div className="lg:hidden px-4 py-3 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          <button 
            onClick={() => handleStatusFilter(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${!activeStatusFilter ? 'bg-brand-navy text-white' : 'bg-brand-navy/10'}`}
          >
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">{stats.total}</span>
            <span className="text-xs">{t.total}</span>
          </button>
          <button 
            onClick={() => handleStatusFilter('active')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${activeStatusFilter === 'active' ? 'bg-green-500 text-white' : 'bg-green-50'}`}
          >
            <CheckCircle2 className={`h-4 w-4 ${activeStatusFilter === 'active' ? 'text-white' : 'text-green-500'}`} />
            <span className={`text-sm font-medium ${activeStatusFilter === 'active' ? 'text-white' : 'text-green-700'}`}>{stats.active}</span>
            <span className={`text-xs ${activeStatusFilter === 'active' ? 'text-white/80' : 'text-green-600'}`}>{t.active}</span>
          </button>
          <button 
            onClick={() => handleStatusFilter('suspended')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${activeStatusFilter === 'suspended' ? 'bg-red-500 text-white' : 'bg-red-50'}`}
          >
            <XCircle className={`h-4 w-4 ${activeStatusFilter === 'suspended' ? 'text-white' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${activeStatusFilter === 'suspended' ? 'text-white' : 'text-red-700'}`}>{stats.suspended}</span>
            <span className={`text-xs ${activeStatusFilter === 'suspended' ? 'text-white/80' : 'text-red-600'}`}>{t.suspended}</span>
          </button>
          <button 
            onClick={() => handleStatusFilter('setup')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${activeStatusFilter === 'setup' ? 'bg-yellow-500 text-white' : 'bg-yellow-50'}`}
          >
            <Clock className={`h-4 w-4 ${activeStatusFilter === 'setup' ? 'text-white' : 'text-yellow-500'}`} />
            <span className={`text-sm font-medium ${activeStatusFilter === 'setup' ? 'text-white' : 'text-yellow-700'}`}>{stats.setup}</span>
            <span className={`text-xs ${activeStatusFilter === 'setup' ? 'text-white/80' : 'text-yellow-600'}`}>{t.setup}</span>
          </button>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedSchools.length > 0 && (
        <div className="sticky top-[120px] lg:top-[200px] z-40 bg-brand-purple text-white px-4 py-3 flex items-center justify-between">
          <span className="text-sm">
            {selectedSchools.length} {t.schoolsSelected}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('enableAI')}>
              <Brain className="h-4 w-4 me-1" />
              {t.enableAI}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('export')}>
              <Download className="h-4 w-4 me-1" />
              {t.export}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedSchools([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Schools Grid - 2 columns on desktop */}
      <main className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {filteredSchools.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg mb-2">{t.noResults}</h3>
            <p className="text-muted-foreground mb-4">
              {t.tryChangingFilters}
            </p>
            <Button onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 me-2" />
              {t.resetFilters}
            </Button>
          </Card>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {filteredSchools.map((school) => (
              <Card 
                key={school.id}
                className={`card-nassaq hover:shadow-lg transition-all cursor-pointer h-[280px] ${
                  selectedSchools.includes(school.id) ? 'ring-2 ring-brand-purple' : ''
                }`}
                data-testid={`school-card-${school.id}`}
              >
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Logo/Avatar */}
                    <div 
                      className={`w-14 h-14 rounded-xl ${getLogoColor(school.id)} flex items-center justify-center flex-shrink-0 cursor-pointer relative`}
                      onClick={() => toggleSchoolSelection(school.id)}
                    >
                      {school.logo_url ? (
                        <img src={school.logo_url} alt={school.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-white text-xl font-bold">{school.name.charAt(0)}</span>
                      )}
                      {selectedSchools.includes(school.id) && (
                        <div className="absolute inset-0 bg-brand-purple/80 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* School Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-cairo font-bold text-base truncate" title={school.name}>
                        {school.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono truncate">{school.code}</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge className={`${SCHOOL_STATUS[school.status]?.color} text-white text-[10px]`}>
                          {isRTL ? SCHOOL_STATUS[school.status]?.label : SCHOOL_STATUS[school.status]?.label_en}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {isRTL ? SCHOOL_TYPES[school.type]?.label : SCHOOL_TYPES[school.type]?.label_en}
                        </Badge>
                        {school.ai_enabled && (
                          <Badge className="bg-purple-500 text-white text-[10px]">
                            <Brain className="h-3 w-3 me-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-muted/30 rounded-xl">
                    <div className="text-center">
                      <p className="text-lg font-bold text-brand-navy">{school.students_count}</p>
                      <p className="text-[10px] text-muted-foreground">{t.students}</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-lg font-bold text-brand-turquoise">{school.teachers_count}</p>
                      <p className="text-[10px] text-muted-foreground">{t.teachers}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getHealthColor(school.health_score)}`}>{school.health_score}%</p>
                      <p className="text-[10px] text-muted-foreground">{t.health}</p>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-1 text-sm mb-3 flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{school.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{school.principal_name}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button 
                      className="flex-1 bg-brand-navy hover:bg-brand-navy/90 rounded-xl"
                      onClick={() => handleSchoolAction('view', school)}
                      data-testid={`open-dashboard-${school.id}`}
                    >
                      <Eye className="h-4 w-4 me-2" />
                      {t.openDashboard}
                    </Button>
                    
                    {/* Suspend Toggle */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-xl">
                      <Switch
                        checked={school.status !== 'suspended'}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            setShowSuspendDialog(school);
                          } else {
                            handleToggleSuspend(school, false);
                          }
                        }}
                        className="data-[state=checked]:bg-green-500"
                        data-testid={`suspend-toggle-${school.id}`}
                      />
                      <span className="text-[10px] text-muted-foreground">{t.suspend}</span>
                    </div>
                    
                    {/* AI Toggle */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-xl">
                      <Switch
                        checked={school.ai_enabled}
                        onCheckedChange={(checked) => {
                          handleToggleAI(school, checked);
                        }}
                        className="data-[state=checked]:bg-purple-500"
                        data-testid={`ai-toggle-${school.id}`}
                      />
                      <span className="text-[10px] text-muted-foreground">AI</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Mobile Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side={isRTL ? 'right' : 'left'} className="w-[85vw] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="font-cairo">{t.filters}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.status}</label>
              <Select value={filters.status} onValueChange={(v) => { setFilters({ ...filters, status: v }); setActiveStatusFilter(null); }}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatus}</SelectItem>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="suspended">{t.suspended}</SelectItem>
                  <SelectItem value="setup">{t.setup}</SelectItem>
                  <SelectItem value="expired">{t.expired}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* City Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.city}</label>
              <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCities}</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.schoolType}</label>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="public">{t.public}</SelectItem>
                  <SelectItem value="private">{t.private}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Stage Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.stage}</label>
              <Select value={filters.stage} onValueChange={(v) => setFilters({ ...filters, stage: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStages}</SelectItem>
                  {Object.entries(EDUCATIONAL_STAGES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{isRTL ? value.label : value.label_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* AI Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.aiStatus}</label>
              <Select value={filters.aiStatus} onValueChange={(v) => setFilters({ ...filters, aiStatus: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="enabled">{t.enabled}</SelectItem>
                  <SelectItem value="disabled">{t.disabled}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetFilters} className="flex-1 rounded-xl">
                {t.reset}
              </Button>
              <Button onClick={() => setShowFilters(false)} className="flex-1 bg-brand-navy rounded-xl">
                {t.apply}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Suspend Confirmation Dialog */}
      <Dialog open={!!showSuspendDialog} onOpenChange={() => setShowSuspendDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              {t.suspendSchool}
            </DialogTitle>
            <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
              {t.suspendConfirm}
              <br />
              <strong>{showSuspendDialog?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setShowSuspendDialog(null)}>{t.cancel}</Button>
            <Button 
              variant="destructive"
              onClick={() => handleToggleSuspend(showSuspendDialog, true)}
            >
              <Pause className="h-4 w-4 me-2" />
              {t.suspend}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create School Wizard */}
      <CreateSchoolWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
        onSuccess={(newSchool) => {
          toast.success(t.createdSuccessfully);
        }}
        api={api}
        isRTL={isRTL}
      />
    </div>
    </Sidebar>
  );
}
