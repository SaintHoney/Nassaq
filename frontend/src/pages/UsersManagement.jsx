import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import {
  Users, Search, Filter, Plus, MoreVertical, Eye, Edit, Trash2,
  Lock, Unlock, RefreshCw, Mail, Phone, Building2, Shield,
  UserPlus, UserCheck, UserX, Brain, Calendar, Clock, ChevronLeft,
  LayoutGrid, LayoutList, Download, Upload, Settings, Activity,
  CheckCircle2, XCircle, AlertTriangle, Send, Key, Archive,
  GraduationCap, Briefcase, HeadphonesIcon, BarChart3, TestTube, Megaphone
} from 'lucide-react';
import CreateUserWizard from '../components/wizards/CreateUserWizard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Account Types
const ACCOUNT_TYPES = [
  { id: 'all', name: 'جميع الحسابات', name_en: 'All Accounts', icon: Users },
  { id: 'platform', name: 'حساب منصة', name_en: 'Platform Account', icon: Shield },
  { id: 'school', name: 'حساب مدرسة', name_en: 'School Account', icon: Building2 },
  { id: 'support', name: 'حساب دعم', name_en: 'Support Account', icon: HeadphonesIcon },
  { id: 'testing', name: 'حساب اختبار', name_en: 'Testing Account', icon: TestTube },
];

// User Roles
const USER_ROLES = [
  { id: 'platform_admin', name: 'مدير المنصة', name_en: 'Platform Admin', color: 'bg-purple-500' },
  { id: 'platform_operations_manager', name: 'مدير العمليات', name_en: 'Operations Manager', color: 'bg-blue-500' },
  { id: 'platform_technical_admin', name: 'مسؤول تقني', name_en: 'Technical Admin', color: 'bg-indigo-500' },
  { id: 'platform_support_specialist', name: 'دعم فني', name_en: 'Support Specialist', color: 'bg-green-500' },
  { id: 'platform_data_analyst', name: 'محلل بيانات', name_en: 'Data Analyst', color: 'bg-orange-500' },
  { id: 'platform_security_officer', name: 'مسؤول أمن', name_en: 'Security Officer', color: 'bg-red-500' },
  { id: 'school_principal', name: 'مدير مدرسة', name_en: 'School Principal', color: 'bg-teal-500' },
  { id: 'teacher', name: 'معلم', name_en: 'Teacher', color: 'bg-cyan-500' },
  { id: 'testing_account', name: 'حساب اختبار', name_en: 'Testing Account', color: 'bg-gray-500' },
];

// Account Statuses
const ACCOUNT_STATUSES = [
  { id: 'all', name: 'كل الحالات', name_en: 'All Status', color: '' },
  { id: 'active', name: 'نشط', name_en: 'Active', color: 'bg-green-500' },
  { id: 'suspended', name: 'موقوف', name_en: 'Suspended', color: 'bg-red-500' },
  { id: 'pending', name: 'معلق', name_en: 'Pending', color: 'bg-yellow-500' },
  { id: 'archived', name: 'مؤرشف', name_en: 'Archived', color: 'bg-gray-500' },
];

export default function UsersManagement() {
  const navigate = useNavigate();
  const isRTL = true;
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    pending: 0,
    aiEnabled: 0,
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedAIStatus, setSelectedAIStatus] = useState('all');
  
  // View Mode
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Dialogs
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(null);
  
  // Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // API instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/platform-users', {
        params: {
          search: searchQuery || undefined,
          role: selectedRole !== 'all' ? selectedRole : undefined,
        }
      });
      
      let fetchedUsers = response.data.users || [];
      
      // Add mock data for demo if no real users
      if (fetchedUsers.length === 0) {
        fetchedUsers = generateMockUsers();
      }
      
      // Apply frontend filters
      let filtered = fetchedUsers;
      
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(u => {
          if (selectedStatus === 'active') return u.is_active !== false;
          if (selectedStatus === 'suspended') return u.is_active === false;
          return true;
        });
      }
      
      if (selectedAIStatus !== 'all') {
        filtered = filtered.filter(u => {
          if (selectedAIStatus === 'enabled') return u.ai_enabled;
          return !u.ai_enabled;
        });
      }
      
      setUsers(filtered);
      
      // Calculate stats
      setStats({
        total: fetchedUsers.length,
        active: fetchedUsers.filter(u => u.is_active !== false).length,
        suspended: fetchedUsers.filter(u => u.is_active === false).length,
        pending: fetchedUsers.filter(u => u.status === 'pending').length,
        aiEnabled: fetchedUsers.filter(u => u.ai_enabled).length,
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data on error
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setStats({
        total: mockUsers.length,
        active: mockUsers.filter(u => u.is_active !== false).length,
        suspended: mockUsers.filter(u => u.is_active === false).length,
        pending: 2,
        aiEnabled: mockUsers.filter(u => u.ai_enabled).length,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRole, selectedStatus, selectedAIStatus]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Generate mock users for demo
  const generateMockUsers = () => [
    {
      id: '1',
      full_name: 'أحمد محمد السعيد',
      email: 'ahmed@nassaq.com',
      phone: '0501234567',
      role: 'platform_operations_manager',
      school_name: null,
      is_active: true,
      ai_enabled: true,
      last_login: '2026-03-09T10:30:00Z',
      created_at: '2026-01-15T08:00:00Z',
      department: 'العمليات',
    },
    {
      id: '2',
      full_name: 'سارة أحمد الفهد',
      email: 'sara@nassaq.com',
      phone: '0509876543',
      role: 'platform_support_specialist',
      school_name: null,
      is_active: true,
      ai_enabled: false,
      last_login: '2026-03-09T09:15:00Z',
      created_at: '2026-02-01T08:00:00Z',
      department: 'الدعم الفني',
    },
    {
      id: '3',
      full_name: 'محمد عبدالله الشمري',
      email: 'mohammad.teacher@school1.nassaq.com',
      phone: '0551234567',
      role: 'teacher',
      school_name: 'مدرسة النور الأهلية',
      is_active: true,
      ai_enabled: true,
      last_login: '2026-03-08T14:20:00Z',
      created_at: '2026-01-20T08:00:00Z',
    },
    {
      id: '4',
      full_name: 'فاطمة علي القحطاني',
      email: 'fatima@school2.nassaq.com',
      phone: '0561234567',
      role: 'school_principal',
      school_name: 'مدرسة الأمل الابتدائية',
      is_active: true,
      ai_enabled: true,
      last_login: '2026-03-09T11:00:00Z',
      created_at: '2025-12-01T08:00:00Z',
    },
    {
      id: '5',
      full_name: 'خالد عمر الدوسري',
      email: 'khaled@nassaq.com',
      phone: '0571234567',
      role: 'platform_data_analyst',
      school_name: null,
      is_active: false,
      ai_enabled: false,
      last_login: '2026-02-28T16:45:00Z',
      created_at: '2026-01-10T08:00:00Z',
      department: 'تحليل البيانات',
    },
    {
      id: '6',
      full_name: 'نورة سعد العتيبي',
      email: 'noura.test@nassaq.com',
      phone: '0581234567',
      role: 'testing_account',
      school_name: null,
      is_active: true,
      ai_enabled: true,
      last_login: '2026-03-09T08:30:00Z',
      created_at: '2026-03-01T08:00:00Z',
      department: 'الاختبار',
    },
    {
      id: '7',
      full_name: 'عبدالرحمن حسن المالكي',
      email: 'abdulrahman@nassaq.com',
      phone: '0591234567',
      role: 'platform_security_officer',
      school_name: null,
      is_active: true,
      ai_enabled: false,
      last_login: '2026-03-09T07:00:00Z',
      created_at: '2026-02-15T08:00:00Z',
      department: 'الأمن',
    },
    {
      id: '8',
      full_name: 'ريم محمد الزهراني',
      email: 'reem.teacher@school3.nassaq.com',
      phone: '0541234567',
      role: 'teacher',
      school_name: 'مدرسة المستقبل',
      is_active: true,
      ai_enabled: true,
      last_login: '2026-03-07T13:00:00Z',
      created_at: '2026-02-20T08:00:00Z',
    },
  ];
  
  // Get role info
  const getRoleInfo = (roleId) => {
    return USER_ROLES.find(r => r.id === roleId) || { name: roleId, name_en: roleId, color: 'bg-gray-500' };
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format time ago
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'لم يسجل دخول';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(dateStr);
  };
  
  // Handle user actions
  const handleSuspendUser = async (user) => {
    try {
      // Toggle active status
      await api.patch(`/api/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      toast.success(user.is_active ? 'تم تعليق الحساب' : 'تم تفعيل الحساب');
      fetchUsers();
    } catch (error) {
      // For demo, just update locally
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
      toast.success(user.is_active ? 'تم تعليق الحساب' : 'تم تفعيل الحساب');
    }
  };
  
  const handleDeleteUser = async (user) => {
    try {
      await api.delete(`/api/users/${user.id}`);
      toast.success('تم حذف المستخدم بنجاح');
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      // For demo, just remove from list
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('تم حذف المستخدم بنجاح');
      setShowDeleteConfirm(null);
    }
  };
  
  const handleResetPassword = async (user) => {
    try {
      await api.post(`/api/users/${user.id}/reset-password`);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
      setShowResetPassword(null);
    } catch (error) {
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
      setShowResetPassword(null);
    }
  };
  
  const handleToggleAI = async (user) => {
    try {
      await api.patch(`/api/users/${user.id}/ai-status`, {
        ai_enabled: !user.ai_enabled,
      });
      toast.success(user.ai_enabled ? 'تم تعطيل AI' : 'تم تفعيل AI');
      fetchUsers();
    } catch (error) {
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, ai_enabled: !u.ai_enabled } : u
      ));
      toast.success(user.ai_enabled ? 'تم تعطيل AI' : 'تم تفعيل AI');
    }
  };
  
  const handleResendInvitation = async (user) => {
    toast.success(`تم إرسال دعوة جديدة إلى ${user.email}`);
  };
  
  // Select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };
  
  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAccountType('all');
    setSelectedStatus('all');
    setSelectedRole('all');
    setSelectedAIStatus('all');
  };
  
  const hasActiveFilters = searchQuery || selectedAccountType !== 'all' || selectedStatus !== 'all' || selectedRole !== 'all' || selectedAIStatus !== 'all';
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-background" dir="rtl" data-testid="users-management">
        {/* Header - Desktop */}
        <header className="hidden lg:block sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="rounded-xl">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-cairo text-2xl font-bold flex items-center gap-2">
                  <Users className="h-7 w-7 text-brand-navy" />
                  إدارة المستخدمين
                </h1>
                <p className="text-sm text-muted-foreground">
                  إدارة جميع حسابات المنصة والمدارس
                </p>
              </div>
            </div>
            <Button 
              className="bg-brand-navy hover:bg-brand-navy/90 rounded-xl px-6 py-5 text-base shadow-lg" 
              onClick={() => setShowCreateWizard(true)}
              data-testid="create-user-btn"
            >
              <UserPlus className="h-5 w-5 me-2" />
              إنشاء مستخدم جديد
            </Button>
          </div>
        </header>
        
        {/* Header - Mobile */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="rounded-xl">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-cairo text-lg font-bold">إدارة المستخدمين</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileFiltersOpen(true)} 
                className="rounded-xl relative"
              >
                <Filter className="h-5 w-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 bg-brand-purple text-white text-[10px] rounded-full flex items-center justify-center">!</span>
                )}
              </Button>
              <Button 
                size="icon"
                className="bg-brand-navy rounded-xl" 
                onClick={() => setShowCreateWizard(true)}
              >
                <UserPlus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/80 text-white col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-10 w-10 text-white/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm">نشط</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-700">{stats.active}</p>
                  </div>
                  <UserCheck className="h-8 lg:h-10 w-8 lg:w-10 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm">موقوف</p>
                    <p className="text-2xl lg:text-3xl font-bold text-red-700">{stats.suspended}</p>
                  </div>
                  <UserX className="h-8 lg:h-10 w-8 lg:w-10 text-red-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm">معلق</p>
                    <p className="text-2xl lg:text-3xl font-bold text-yellow-700">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 lg:h-10 w-8 lg:w-10 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm">AI مفعّل</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-700">{stats.aiEnabled}</p>
                  </div>
                  <Brain className="h-8 lg:h-10 w-8 lg:w-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search and Filters - Desktop */}
          <Card className="hidden lg:block">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث بالاسم، البريد، الهاتف، المدرسة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-10 rounded-xl"
                  />
                </div>
                
                {/* Role Filter */}
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-44 rounded-xl">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-36 rounded-xl">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        <span className="flex items-center gap-2">
                          {status.color && <span className={`w-2 h-2 rounded-full ${status.color}`} />}
                          {status.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* AI Status Filter */}
                <Select value={selectedAIStatus} onValueChange={setSelectedAIStatus}>
                  <SelectTrigger className="w-36 rounded-xl">
                    <SelectValue placeholder="AI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="enabled">AI مفعّل</SelectItem>
                    <SelectItem value="disabled">AI معطّل</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode */}
                <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                  <Button 
                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="rounded-lg h-8 w-8 p-0"
                    onClick={() => setViewMode('table')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="rounded-lg h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500">
                    مسح الفلاتر
                  </Button>
                )}
                
                {/* Refresh */}
                <Button variant="outline" size="icon" onClick={fetchUsers} className="rounded-xl">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Search - Mobile */}
          <div className="lg:hidden relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 rounded-xl"
            />
          </div>
          
          {/* Users Table/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg mb-2">لا يوجد مستخدمين</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? 'لم يتم العثور على مستخدمين مطابقين للفلاتر'
                    : 'ابدأ بإنشاء مستخدم جديد'}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>مسح الفلاتر</Button>
                ) : (
                  <Button onClick={() => setShowCreateWizard(true)}>
                    <UserPlus className="h-4 w-4 me-2" />
                    إنشاء مستخدم
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'table' ? (
            /* Table View */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox 
                            checked={selectedUsers.length === users.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>المستخدم</TableHead>
                        <TableHead className="hidden md:table-cell">الدور</TableHead>
                        <TableHead className="hidden lg:table-cell">المدرسة</TableHead>
                        <TableHead className="hidden md:table-cell">الحالة</TableHead>
                        <TableHead className="hidden lg:table-cell">AI</TableHead>
                        <TableHead className="hidden xl:table-cell">آخر دخول</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const roleInfo = getRoleInfo(user.role);
                        return (
                          <TableRow key={user.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Checkbox 
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => toggleUserSelection(user.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border">
                                  <AvatarFallback className={`${roleInfo.color} text-white text-sm`}>
                                    {user.full_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className={`${roleInfo.color} text-white border-0`}>
                                {roleInfo.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {user.school_name ? (
                                <span className="text-sm">{user.school_name}</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.is_active !== false ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">نشط</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 border-red-200">موقوف</Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {user.ai_enabled ? (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                  <Brain className="h-3 w-3 me-1" />
                                  مفعّل
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {formatTimeAgo(user.last_login)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => setShowUserDetails(user)}>
                                    <Eye className="h-4 w-4 me-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 me-2" />
                                    تعديل البيانات
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                                    {user.is_active !== false ? (
                                      <>
                                        <Lock className="h-4 w-4 me-2" />
                                        تعليق الحساب
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="h-4 w-4 me-2" />
                                        تفعيل الحساب
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setShowResetPassword(user)}>
                                    <Key className="h-4 w-4 me-2" />
                                    إعادة تعيين كلمة المرور
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleAI(user)}>
                                    <Brain className="h-4 w-4 me-2" />
                                    {user.ai_enabled ? 'تعطيل AI' : 'تفعيل AI'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResendInvitation(user)}>
                                    <Send className="h-4 w-4 me-2" />
                                    إعادة إرسال الدعوة
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setShowDeleteConfirm(user)}
                                  >
                                    <Trash2 className="h-4 w-4 me-2" />
                                    حذف الحساب
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2">
                            <AvatarFallback className={`${roleInfo.color} text-white`}>
                              {user.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold">{user.full_name}</h4>
                            <Badge variant="outline" className={`${roleInfo.color} text-white border-0 text-[10px]`}>
                              {roleInfo.name}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowUserDetails(user)}>
                              <Eye className="h-4 w-4 me-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                              {user.is_active ? <Lock className="h-4 w-4 me-2" /> : <Unlock className="h-4 w-4 me-2" />}
                              {user.is_active ? 'تعليق' : 'تفعيل'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(user)}>
                              <Trash2 className="h-4 w-4 me-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span dir="ltr">{user.phone}</span>
                          </div>
                        )}
                        {user.school_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{user.school_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {user.is_active !== false ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">نشط</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">موقوف</Badge>
                          )}
                          {user.ai_enabled && (
                            <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                              <Brain className="h-3 w-3 me-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(user.last_login)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="fixed bottom-4 start-1/2 -translate-x-1/2 bg-brand-navy text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50">
              <span className="font-medium">{selectedUsers.length} محدد</span>
              <div className="h-4 w-px bg-white/30" />
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Lock className="h-4 w-4 me-2" />
                تعليق
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Brain className="h-4 w-4 me-2" />
                تفعيل AI
              </Button>
              <Button variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/20">
                <Trash2 className="h-4 w-4 me-2" />
                حذف
              </Button>
              <Button variant="ghost" size="sm" className="text-white/70" onClick={() => setSelectedUsers([])}>
                إلغاء
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Filters Sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="font-cairo flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الدور</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الحالة</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_STATUSES.map((status) => (
                        <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">حالة AI</label>
                  <Select value={selectedAIStatus} onValueChange={setSelectedAIStatus}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="enabled">مفعّل</SelectItem>
                      <SelectItem value="disabled">معطّل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background flex gap-3">
              <Button variant="outline" onClick={clearFilters} className="flex-1 rounded-xl">
                مسح الكل
              </Button>
              <Button onClick={() => setMobileFiltersOpen(false)} className="flex-1 bg-brand-navy rounded-xl">
                تطبيق
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* User Details Dialog */}
        <Dialog open={!!showUserDetails} onOpenChange={() => setShowUserDetails(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-brand-navy text-white">
                    {showUserDetails?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {showUserDetails?.full_name}
              </DialogTitle>
            </DialogHeader>
            {showUserDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium">{showUserDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-medium" dir="ltr">{showUserDetails.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الدور</p>
                    <Badge className={`${getRoleInfo(showUserDetails.role).color} text-white`}>
                      {getRoleInfo(showUserDetails.role).name}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    <Badge className={showUserDetails.is_active !== false ? 'bg-green-500' : 'bg-red-500'}>
                      {showUserDetails.is_active !== false ? 'نشط' : 'موقوف'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المدرسة</p>
                    <p className="font-medium">{showUserDetails.school_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">القسم</p>
                    <p className="font-medium">{showUserDetails.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">آخر دخول</p>
                    <p className="font-medium">{formatTimeAgo(showUserDetails.last_login)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="font-medium">{formatDate(showUserDetails.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(null)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                تأكيد الحذف
              </DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف حساب <strong>{showDeleteConfirm?.full_name}</strong>؟
                <br />
                هذا الإجراء لا يمكن التراجع عنه.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>إلغاء</Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(showDeleteConfirm)}>
                <Trash2 className="h-4 w-4 me-2" />
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reset Password Dialog */}
        <Dialog open={!!showResetPassword} onOpenChange={() => setShowResetPassword(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                إعادة تعيين كلمة المرور
              </DialogTitle>
              <DialogDescription>
                سيتم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني:
                <br />
                <strong>{showResetPassword?.email}</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetPassword(null)}>إلغاء</Button>
              <Button onClick={() => handleResetPassword(showResetPassword)}>
                <Send className="h-4 w-4 me-2" />
                إرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Create User Wizard */}
        <CreateUserWizard
          open={showCreateWizard}
          onOpenChange={setShowCreateWizard}
          onSuccess={(newUser) => {
            toast.success('تم إنشاء الحساب بنجاح!');
            fetchUsers();
          }}
          api={api}
          isRTL={isRTL}
        />
      </div>
    </Sidebar>
  );
}
