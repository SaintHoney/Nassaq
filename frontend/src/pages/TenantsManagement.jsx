import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  const { api, isRTL } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [schools, setSchools] = useState(SAMPLE_SCHOOLS);
  const [filteredSchools, setFilteredSchools] = useState(SAMPLE_SCHOOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolActions, setShowSchoolActions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
    aiEnabled: schools.filter(s => s.ai_enabled).length,
  };
  
  // Filter and search schools
  useEffect(() => {
    let result = [...schools];
    
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
    
    // Apply filters
    if (filters.status !== 'all') {
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
  }, [searchQuery, filters, schools]);
  
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
  };
  
  // Toggle school selection
  const toggleSchoolSelection = (schoolId) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };
  
  // Select all schools
  const selectAllSchools = () => {
    if (selectedSchools.length === filteredSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(filteredSchools.map(s => s.id));
    }
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
        toast.warning(isRTL ? `تم تعليق ${school.name}` : `${school.name} suspended`);
        break;
      case 'activate':
        toast.success(isRTL ? `تم تفعيل ${school.name}` : `${school.name} activated`);
        break;
      case 'toggleAI':
        toast.info(isRTL 
          ? `تم ${school.ai_enabled ? 'إيقاف' : 'تفعيل'} الذكاء الاصطناعي`
          : `AI ${school.ai_enabled ? 'disabled' : 'enabled'}`
        );
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
    setShowSchoolActions(null);
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
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-cairo text-lg font-bold">{isRTL ? 'إدارة المدارس' : 'Schools'}</h1>
              <p className="text-xs text-muted-foreground">{filteredSchools.length} {isRTL ? 'مدرسة' : 'schools'}</p>
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
              placeholder={isRTL ? 'بحث بالاسم، الكود، الهاتف...' : 'Search by name, code, phone...'}
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
              {isRTL ? 'إضافة مدرسة جديدة' : 'Add New School'}
            </Button>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`font-cairo text-2xl font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Building2 className="h-7 w-7 text-brand-navy" />
                  {isRTL ? 'إدارة المدارس' : 'Tenants Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'إدارة جميع المدارس والمؤسسات التعليمية' : 'Manage all schools and educational institutions'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Stats Cards - Desktop - RTL Aligned */}
          <div className={`grid grid-cols-4 gap-4 mb-4 ${isRTL ? 'direction-rtl' : ''}`}>
            {/* إجمالي المعلمين */}
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="p-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-teal-600 text-sm">{isRTL ? 'إجمالي المعلمين' : 'Total Teachers'}</p>
                    <p className="text-3xl font-bold text-teal-700">{stats.totalTeachers || 98}</p>
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
                    <p className="text-blue-600 text-sm">{isRTL ? 'إجمالي الطلاب' : 'Total Students'}</p>
                    <p className="text-3xl font-bold text-blue-700">{stats.totalStudents || 1250}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            {/* كارت إجمالي المدارس مع جميع الحالات */}
            <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/80 text-white col-span-2">
              <CardContent className="p-4">
                <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-white/70 text-sm">{isRTL ? 'إجمالي المدارس' : 'Total Schools'}</p>
                    <p className="text-4xl font-bold">{stats.total}</p>
                  </div>
                  <Building2 className="h-12 w-12 text-white/30" />
                </div>
                <div className={`grid grid-cols-4 gap-2 pt-3 border-t border-white/20 ${isRTL ? 'direction-rtl' : ''}`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="text-xl font-bold">{stats.expired || 0}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{isRTL ? 'منتهية' : 'Expired'}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      <span className="text-xl font-bold">{stats.suspended}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{isRTL ? 'موقوفة' : 'Suspended'}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="text-xl font-bold">{stats.setup}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{isRTL ? 'إعداد' : 'Setup'}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      <span className="text-xl font-bold">{stats.active}</span>
                    </div>
                    <p className="text-[10px] text-white/70">{isRTL ? 'نشطة' : 'Active'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search and Filters - Desktop */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'بحث بالاسم، الكود، الهاتف، البريد...' : 'Search by name, code, phone, email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 rounded-xl"
              />
            </div>
            
            {/* Quick Filters */}
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="active">{isRTL ? 'نشطة' : 'Active'}</SelectItem>
                <SelectItem value="suspended">{isRTL ? 'موقوفة' : 'Suspended'}</SelectItem>
                <SelectItem value="setup">{isRTL ? 'قيد الإعداد' : 'Setup'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue placeholder={isRTL ? 'المدينة' : 'City'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'جميع المدن' : 'All Cities'}</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.aiStatus} onValueChange={(v) => setFilters({ ...filters, aiStatus: v })}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue placeholder={isRTL ? 'حالة AI' : 'AI Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="enabled">{isRTL ? 'مفعّل' : 'Enabled'}</SelectItem>
                <SelectItem value="disabled">{isRTL ? 'غير مفعّل' : 'Disabled'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={resetFilters} className="rounded-xl">
              <RefreshCw className="h-4 w-4 me-2" />
              {isRTL ? 'إعادة ضبط' : 'Reset'}
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
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-navy/10 rounded-xl">
            <Building2 className="h-4 w-4 text-brand-navy" />
            <span className="text-sm font-medium">{stats.total}</span>
            <span className="text-xs text-muted-foreground">{isRTL ? 'مدرسة' : 'total'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">{stats.active}</span>
            <span className="text-xs text-green-600">{isRTL ? 'نشطة' : 'active'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">{stats.suspended}</span>
            <span className="text-xs text-red-600">{isRTL ? 'موقوفة' : 'suspended'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">{stats.aiEnabled}</span>
            <span className="text-xs text-purple-600">AI</span>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedSchools.length > 0 && (
        <div className="sticky top-[120px] lg:top-[200px] z-40 bg-brand-purple text-white px-4 py-3 flex items-center justify-between">
          <span className="text-sm">
            {selectedSchools.length} {isRTL ? 'مدرسة محددة' : 'schools selected'}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('enableAI')}>
              <Brain className="h-4 w-4 me-1" />
              {isRTL ? 'تفعيل AI' : 'Enable AI'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('export')}>
              <Download className="h-4 w-4 me-1" />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedSchools([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Schools Grid */}
      <main className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {filteredSchools.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'لا توجد نتائج' : 'No results found'}</h3>
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'جرب تغيير معايير البحث أو الفلاتر' : 'Try changing search criteria or filters'}
            </p>
            <Button onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 me-2" />
              {isRTL ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </Button>
          </Card>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' : 'grid-cols-1'}`}>
            {filteredSchools.map((school) => (
              <Card 
                key={school.id}
                className={`card-nassaq hover:shadow-lg transition-all cursor-pointer ${
                  selectedSchools.includes(school.id) ? 'ring-2 ring-brand-purple' : ''
                }`}
                data-testid={`school-card-${school.id}`}
              >
                <CardContent className="p-4">
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Logo/Avatar */}
                    <div 
                      className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl ${getLogoColor(school.id)} flex items-center justify-center flex-shrink-0 cursor-pointer`}
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-cairo font-bold text-base lg:text-lg truncate">{school.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{school.code}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                            <DropdownMenuItem onClick={() => handleSchoolAction('view', school)}>
                              <Eye className="h-4 w-4 me-2" />
                              {isRTL ? 'فتح لوحة التحكم' : 'Open Dashboard'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchoolAction('edit', school)}>
                              <Edit className="h-4 w-4 me-2" />
                              {isRTL ? 'تعديل البيانات' : 'Edit Data'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchoolAction('users', school)}>
                              <Users className="h-4 w-4 me-2" />
                              {isRTL ? 'المستخدمون' : 'Users'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchoolAction('reports', school)}>
                              <BarChart3 className="h-4 w-4 me-2" />
                              {isRTL ? 'التقارير' : 'Reports'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSchoolAction('toggleAI', school)}>
                              <Brain className="h-4 w-4 me-2" />
                              {school.ai_enabled 
                                ? (isRTL ? 'إيقاف AI' : 'Disable AI')
                                : (isRTL ? 'تفعيل AI' : 'Enable AI')
                              }
                            </DropdownMenuItem>
                            {school.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleSchoolAction('suspend', school)} className="text-red-600">
                                <Pause className="h-4 w-4 me-2" />
                                {isRTL ? 'تعليق' : 'Suspend'}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleSchoolAction('activate', school)} className="text-green-600">
                                <Play className="h-4 w-4 me-2" />
                                {isRTL ? 'تفعيل' : 'Activate'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSchoolAction('resendWelcome', school)}>
                              <Mail className="h-4 w-4 me-2" />
                              {isRTL ? 'إعادة إرسال الترحيب' : 'Resend Welcome'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchoolAction('delete', school)} className="text-red-600">
                              <Trash2 className="h-4 w-4 me-2" />
                              {isRTL ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge className={`${SCHOOL_STATUS[school.status]?.color} text-white text-[10px]`}>
                          {isRTL ? SCHOOL_STATUS[school.status]?.label : SCHOOL_STATUS[school.status]?.label_en}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {isRTL ? SCHOOL_TYPES[school.type]?.label : SCHOOL_TYPES[school.type]?.label_en}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {isRTL ? EDUCATIONAL_STAGES[school.stage]?.label : EDUCATIONAL_STAGES[school.stage]?.label_en}
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
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/30 rounded-xl">
                    <div className="text-center">
                      <p className="text-lg font-bold text-brand-navy">{school.students_count}</p>
                      <p className="text-[10px] text-muted-foreground">{isRTL ? 'طالب' : 'Students'}</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-lg font-bold text-brand-turquoise">{school.teachers_count}</p>
                      <p className="text-[10px] text-muted-foreground">{isRTL ? 'معلم' : 'Teachers'}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getHealthColor(school.health_score)}`}>{school.health_score}%</p>
                      <p className="text-[10px] text-muted-foreground">{isRTL ? 'الصحة' : 'Health'}</p>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{school.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{school.principal_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">{isRTL ? 'آخر نشاط:' : 'Last:'} {school.last_activity}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    className="w-full bg-brand-navy hover:bg-brand-navy/90 rounded-xl"
                    onClick={() => handleSchoolAction('view', school)}
                  >
                    <Eye className="h-4 w-4 me-2" />
                    {isRTL ? 'فتح لوحة التحكم' : 'Open Dashboard'}
                  </Button>
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
            <SheetTitle className="font-cairo">{isRTL ? 'الفلاتر' : 'Filters'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'الحالة' : 'Status'}</label>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="active">{isRTL ? 'نشطة' : 'Active'}</SelectItem>
                  <SelectItem value="suspended">{isRTL ? 'موقوفة' : 'Suspended'}</SelectItem>
                  <SelectItem value="setup">{isRTL ? 'قيد الإعداد' : 'Setup'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* City Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'المدينة' : 'City'}</label>
              <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع المدن' : 'All Cities'}</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'نوع المدرسة' : 'School Type'}</label>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="public">{isRTL ? 'حكومية' : 'Public'}</SelectItem>
                  <SelectItem value="private">{isRTL ? 'أهلية' : 'Private'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Stage Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'المرحلة' : 'Stage'}</label>
              <Select value={filters.stage} onValueChange={(v) => setFilters({ ...filters, stage: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع المراحل' : 'All Stages'}</SelectItem>
                  {Object.entries(EDUCATIONAL_STAGES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{isRTL ? value.label : value.label_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* AI Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'حالة الذكاء الاصطناعي' : 'AI Status'}</label>
              <Select value={filters.aiStatus} onValueChange={(v) => setFilters({ ...filters, aiStatus: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="enabled">{isRTL ? 'مفعّل' : 'Enabled'}</SelectItem>
                  <SelectItem value="disabled">{isRTL ? 'غير مفعّل' : 'Disabled'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetFilters} className="flex-1 rounded-xl">
                {isRTL ? 'إعادة ضبط' : 'Reset'}
              </Button>
              <Button onClick={() => setShowFilters(false)} className="flex-1 bg-brand-navy rounded-xl">
                {isRTL ? 'تطبيق' : 'Apply'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Create School Wizard */}
      <CreateSchoolWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
        onSuccess={(newSchool) => {
          toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح!' : 'School created successfully!');
          // Refresh schools list
        }}
        api={api}
        isRTL={isRTL}
      />
    </div>
    </Sidebar>
  );
}
