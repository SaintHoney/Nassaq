import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  Lock, Unlock, RefreshCw, Mail, Phone, Building2, Shield,
  UserPlus, UserCheck, UserX, Brain, Calendar, Clock, ChevronLeft,
  LayoutGrid, Download, Settings, Activity, Bell, Send, Key, Archive,
  GraduationCap, Briefcase, HeadphonesIcon, BarChart3, TestTube, Megaphone,
  CheckCircle2, XCircle, AlertTriangle, FileText, QrCode, Copy, Check,
  MessageSquare, Info, School, Globe, Sparkles
} from 'lucide-react';
import CreateUserWizard from '../components/wizards/CreateUserWizard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// User Roles Configuration
const USER_ROLES = [
  { id: 'platform_admin', name: 'مدير المنصة', name_en: 'Platform Admin', color: 'bg-purple-600', icon: Shield },
  { id: 'platform_operations_manager', name: 'مدير العمليات', name_en: 'Operations Manager', color: 'bg-blue-600', icon: Briefcase },
  { id: 'platform_technical_admin', name: 'مسؤول تقني', name_en: 'Technical Admin', color: 'bg-indigo-600', icon: Settings },
  { id: 'platform_support_specialist', name: 'دعم فني', name_en: 'Support Specialist', color: 'bg-green-600', icon: HeadphonesIcon },
  { id: 'platform_data_analyst', name: 'محلل بيانات', name_en: 'Data Analyst', color: 'bg-orange-600', icon: BarChart3 },
  { id: 'platform_security_officer', name: 'مسؤول أمن', name_en: 'Security Officer', color: 'bg-red-600', icon: Shield },
  { id: 'platform_sales', name: 'المبيعات', name_en: 'Sales', color: 'bg-emerald-600', icon: Megaphone },
  { id: 'platform_marketing', name: 'التسويق', name_en: 'Marketing', color: 'bg-pink-600', icon: Megaphone },
  { id: 'platform_quality', name: 'الجودة والاختبار', name_en: 'Quality & Testing', color: 'bg-amber-600', icon: TestTube },
  { id: 'school_principal', name: 'مدير مدرسة', name_en: 'School Principal', color: 'bg-teal-600', icon: School },
  { id: 'teacher', name: 'معلم', name_en: 'Teacher', color: 'bg-cyan-600', icon: GraduationCap },
  { id: 'independent_teacher', name: 'معلم مستقل', name_en: 'Independent Teacher', color: 'bg-violet-600', icon: GraduationCap },
  { id: 'testing_account', name: 'حساب اختبار', name_en: 'Testing Account', color: 'bg-gray-500', icon: TestTube },
];

// Account Types for filtering
const ACCOUNT_TYPES = [
  { id: 'all', name: 'جميع الحسابات', name_en: 'All Accounts' },
  { id: 'platform', name: 'حسابات المنصة', name_en: 'Platform Accounts' },
  { id: 'school', name: 'حسابات المدارس', name_en: 'School Accounts' },
  { id: 'independent', name: 'معلمين مستقلين', name_en: 'Independent Teachers' },
  { id: 'testing', name: 'حسابات اختبار', name_en: 'Testing Accounts' },
];

// Account Statuses
const ACCOUNT_STATUSES = [
  { id: 'all', name: 'كل الحالات', name_en: 'All Status', color: '' },
  { id: 'active', name: 'نشط', name_en: 'Active', color: 'bg-green-500' },
  { id: 'suspended', name: 'موقوف', name_en: 'Suspended', color: 'bg-red-500' },
  { id: 'pending', name: 'معلق', name_en: 'Pending', color: 'bg-yellow-500' },
  { id: 'archived', name: 'مؤرشف', name_en: 'Archived', color: 'bg-gray-500' },
];

// Teacher Request Status
const REQUEST_STATUSES = [
  { id: 'pending', name: 'قيد المراجعة', color: 'bg-yellow-500' },
  { id: 'approved', name: 'موافق عليه', color: 'bg-green-500' },
  { id: 'rejected', name: 'مرفوض', color: 'bg-red-500' },
  { id: 'info_required', name: 'يحتاج معلومات', color: 'bg-blue-500' },
];

export default function UsersManagement() {
  const navigate = useNavigate();
  const isRTL = true;
  
  // State
  const [users, setUsers] = useState([]);
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    teachersInSchools: 0,
    independentTeachers: 0,
    platformAdmins: 0,
    pendingRequests: 0,
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedAIStatus, setSelectedAIStatus] = useState('all');
  
  // UI State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  
  // Dialogs
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showSendNotification, setShowSendNotification] = useState(null);
  const [showApproveRequest, setShowApproveRequest] = useState(null);
  const [showRejectRequest, setShowRejectRequest] = useState(null);
  const [showMoreInfoRequest, setShowMoreInfoRequest] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(null);
  
  // Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Notification form
  const [notificationForm, setNotificationForm] = useState({
    type: 'system', // system, email, push
    title: '',
    message: '',
  });
  
  // Rejection form
  const [rejectionReason, setRejectionReason] = useState('');
  
  // More info request form
  const [moreInfoMessage, setMoreInfoMessage] = useState('');
  
  // API instance with interceptor
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor to attach token dynamically
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('nassaq_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    return instance;
  }, []);
  
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
      
      // Show warning if API returned empty but use mock for demo
      if (fetchedUsers.length === 0) {
        console.warn('API returned no users, using demo data');
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
      
      if (selectedAccountType !== 'all') {
        filtered = filtered.filter(u => {
          if (selectedAccountType === 'platform') return u.role?.startsWith('platform_');
          if (selectedAccountType === 'school') return u.school_name && !u.role?.startsWith('platform_');
          if (selectedAccountType === 'independent') return u.role === 'independent_teacher';
          if (selectedAccountType === 'testing') return u.role === 'testing_account';
          return true;
        });
      }
      
      setUsers(filtered);
      
      // Calculate stats from API response or fetch from schools API
      const schoolCount = await api.get('/api/schools').then(r => r.data?.length || 6).catch(() => 6);
      const allUsers = fetchedUsers;
      setStats(prev => ({
        ...prev,
        totalUsers: allUsers.length,
        totalSchools: schoolCount,
        teachersInSchools: allUsers.filter(u => u.role === 'teacher' && u.school_name).length,
        independentTeachers: allUsers.filter(u => u.role === 'independent_teacher').length,
        platformAdmins: allUsers.filter(u => u.role?.startsWith('platform_')).length,
      }));
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(isRTL ? 'فشل في تحميل المستخدمين' : 'Failed to load users');
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setStats({
        totalUsers: mockUsers.length,
        totalSchools: 6,
        teachersInSchools: 3,
        independentTeachers: 2,
        platformAdmins: 5,
        pendingRequests: 3,
      });
    } finally {
      setLoading(false);
    }
  }, [api, searchQuery, selectedRole, selectedStatus, selectedAIStatus, selectedAccountType, isRTL]);
  
  // Fetch teacher requests
  const fetchTeacherRequests = useCallback(async () => {
    try {
      const response = await api.get('/api/registration-requests', {
        params: { status: 'pending', account_type: 'teacher' }
      });
      // Handle new API response format
      const requests = response.data?.requests || response.data || [];
      setTeacherRequests(requests);
      // Update pending requests count in stats
      setStats(prev => ({
        ...prev,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
      }));
    } catch (error) {
      console.error('Error fetching teacher requests:', error);
      // Mock data for demo
      const mockRequests = generateMockTeacherRequests();
      setTeacherRequests(mockRequests);
      setStats(prev => ({
        ...prev,
        pendingRequests: mockRequests.filter(r => r.status === 'pending').length,
      }));
    }
  }, [api]);
  
  // Initial fetch - only runs once
  useEffect(() => {
    fetchUsers();
    fetchTeacherRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Refetch when filters change (but not on initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchUsers();
  }, [searchQuery, selectedRole, selectedStatus, selectedAIStatus, selectedAccountType]);
  
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
      account_type: 'platform',
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
      account_type: 'platform',
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
      account_type: 'school',
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
      account_type: 'school',
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
      account_type: 'platform',
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
      account_type: 'testing',
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
      account_type: 'platform',
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
      account_type: 'school',
    },
    {
      id: '9',
      full_name: 'عمر سالم الحربي',
      email: 'omar.independent@nassaq.com',
      phone: '0521234567',
      role: 'independent_teacher',
      school_name: null,
      is_active: true,
      ai_enabled: true,
      last_login: '2026-03-08T09:00:00Z',
      created_at: '2026-02-25T08:00:00Z',
      account_type: 'independent',
      specialization: 'الرياضيات',
    },
    {
      id: '10',
      full_name: 'منى خالد الغامدي',
      email: 'mona.independent@nassaq.com',
      phone: '0531234567',
      role: 'independent_teacher',
      school_name: null,
      is_active: true,
      ai_enabled: false,
      last_login: '2026-03-06T11:00:00Z',
      created_at: '2026-02-28T08:00:00Z',
      account_type: 'independent',
      specialization: 'اللغة العربية',
    },
  ];
  
  // Generate mock teacher requests
  const generateMockTeacherRequests = () => [
    {
      id: 'req1',
      full_name: 'سعود محمد الرشيدي',
      national_id: '1098765432',
      phone: '0512345678',
      email: 'saud.rashidi@email.com',
      subject: 'الرياضيات',
      education_level: 'ابتدائي',
      school_mentioned: 'مدرسة الأمل الابتدائية',
      country: 'SA',
      created_at: '2026-03-08T10:00:00Z',
      status: 'pending',
    },
    {
      id: 'req2',
      full_name: 'هند عبدالله السبيعي',
      national_id: '1087654321',
      phone: '0523456789',
      email: 'hind.subaie@email.com',
      subject: 'اللغة الإنجليزية',
      education_level: 'متوسط',
      school_mentioned: '',
      country: 'SA',
      created_at: '2026-03-07T14:30:00Z',
      status: 'pending',
    },
    {
      id: 'req3',
      full_name: 'فيصل أحمد العمري',
      national_id: '1076543210',
      phone: '0534567890',
      email: 'faisal.omari@email.com',
      subject: 'العلوم',
      education_level: 'ثانوي',
      school_mentioned: 'ثانوية الملك فهد',
      country: 'SA',
      created_at: '2026-03-06T09:15:00Z',
      status: 'pending',
    },
  ];
  
  // Get role info
  const getRoleInfo = (roleId) => {
    return USER_ROLES.find(r => r.id === roleId) || { name: roleId, name_en: roleId, color: 'bg-gray-500', icon: Users };
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
  const handleViewUser = (user) => {
    navigate(`/admin/users/${user.id}`);
  };
  
  const handleSuspendUser = async (user) => {
    try {
      await api.patch(`/api/users/${user.id}/status`, { is_active: !user.is_active });
      toast.success(user.is_active ? 'تم تعليق الحساب بنجاح' : 'تم تفعيل الحساب بنجاح');
      fetchUsers();
    } catch (error) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast.success(user.is_active ? 'تم تعليق الحساب بنجاح' : 'تم تفعيل الحساب بنجاح');
    }
    setShowSuspendConfirm(null);
  };
  
  const handleDeleteUser = async (user) => {
    try {
      await api.delete(`/api/users/${user.id}`);
      toast.success('تم أرشفة الحساب بنجاح');
      fetchUsers();
    } catch (error) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('تم أرشفة الحساب بنجاح');
    }
    setShowDeleteConfirm(null);
  };
  
  const handleSendNotification = async (user) => {
    toast.success(`تم إرسال الإشعار إلى ${user.full_name}`);
    setShowSendNotification(null);
    setNotificationForm({ type: 'system', title: '', message: '' });
  };
  
  // Handle teacher request actions
  const handleApproveRequest = async (request) => {
    try {
      // Call the new approve API
      const response = await api.post(`/api/registration-requests/${request.id}/approve`, {
        send_notification: true
      });
      
      if (response.data?.success) {
        // Show success dialog with credentials
        setShowApproveRequest({
          ...request,
          teacher_id: response.data.teacher_id,
          temp_password: response.data.temporary_password,
          qr_code: response.data.qr_code,
          email: response.data.email,
          message_template: response.data.message_template,
        });
        
        toast.success('تم الموافقة على الطلب وإنشاء الحساب بنجاح');
        fetchTeacherRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error.response?.data?.detail || 'حدث خطأ أثناء الموافقة على الطلب';
      toast.error(errorMessage);
    }
  };
  
  const handleRejectRequest = async (request) => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }
    
    try {
      const response = await api.post(`/api/registration-requests/${request.id}/reject`, {
        reason: rejectionReason
      });
      
      if (response.data?.success) {
        toast.success('تم رفض الطلب وإرسال إشعار للمعلم');
        fetchTeacherRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error.response?.data?.detail || 'حدث خطأ أثناء رفض الطلب';
      toast.error(errorMessage);
    }
    setShowRejectRequest(null);
    setRejectionReason('');
  };
  
  const handleRequestMoreInfo = async (request) => {
    if (!moreInfoMessage || moreInfoMessage.trim().length < 10) {
      toast.error('يرجى إدخال المعلومات المطلوبة بشكل واضح');
      return;
    }
    
    try {
      const response = await api.post(`/api/registration-requests/${request.id}/request-info`, {
        message: moreInfoMessage
      });
      
      if (response.data?.success) {
        toast.success('تم إرسال طلب المعلومات الإضافية للمعلم');
        fetchTeacherRequests();
      }
    } catch (error) {
      console.error('Error requesting more info:', error);
      const errorMessage = error.response?.data?.detail || 'حدث خطأ أثناء إرسال الطلب';
      toast.error(errorMessage);
    }
    setShowMoreInfoRequest(null);
    setMoreInfoMessage('');
  };
  
  // Generate temp password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
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
          <div className="flex items-center justify-between flex-row-reverse">
            <Button 
              className="bg-brand-navy hover:bg-brand-navy/90 rounded-xl px-6 py-5 text-base shadow-lg" 
              onClick={() => setShowCreateWizard(true)}
              data-testid="create-user-btn"
            >
              <UserPlus className="h-5 w-5 ms-2" />
              إنشاء مستخدم جديد
            </Button>
            <div className="flex items-center gap-4 flex-row-reverse">
              <div className="text-right">
                <h1 className="font-cairo text-2xl font-bold flex items-center gap-2 flex-row-reverse justify-end">
                  <Users className="h-7 w-7 text-brand-navy" />
                  إدارة المستخدمين
                </h1>
                <p className="text-sm text-muted-foreground">
                  المركز الموحد لإدارة جميع المستخدمين وطلبات المعلمين
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="rounded-xl">
                <ChevronLeft className="h-5 w-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Header - Mobile */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between flex-row-reverse">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileFiltersOpen(true)} 
                className="rounded-xl relative"
              >
                <Filter className="h-5 w-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -start-1 w-4 h-4 bg-brand-purple text-white text-[10px] rounded-full flex items-center justify-center">!</span>
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
            <div className="flex items-center gap-3 flex-row-reverse">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="rounded-xl">
                <ChevronLeft className="h-5 w-5 rotate-180" />
              </Button>
              <h1 className="font-cairo text-lg font-bold">إدارة المستخدمين</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {/* إجمالي المستخدمين */}
            <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/80 text-white col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-white/70 text-sm">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-10 w-10 text-white/30" />
                </div>
              </CardContent>
            </Card>
            
            {/* إجمالي المدارس */}
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-teal-600 text-sm">إجمالي المدارس</p>
                    <p className="text-2xl lg:text-3xl font-bold text-teal-700">{stats.totalSchools}</p>
                  </div>
                  <Building2 className="h-8 lg:h-10 w-8 lg:w-10 text-teal-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* معلمين داخل المدارس */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-blue-600 text-sm">معلمين داخل المدارس</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-700">{stats.teachersInSchools}</p>
                  </div>
                  <GraduationCap className="h-8 lg:h-10 w-8 lg:w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* معلمين مستقلين */}
            <Card className="border-violet-200 bg-violet-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-violet-600 text-sm">معلمين مستقلين</p>
                    <p className="text-2xl lg:text-3xl font-bold text-violet-700">{stats.independentTeachers}</p>
                  </div>
                  <Sparkles className="h-8 lg:h-10 w-8 lg:w-10 text-violet-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* حسابات إدارية */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-purple-600 text-sm">حسابات المنصة</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-700">{stats.platformAdmins}</p>
                  </div>
                  <Shield className="h-8 lg:h-10 w-8 lg:w-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* طلبات معلقة */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-yellow-600 text-sm">طلبات معلقة</p>
                    <p className="text-2xl lg:text-3xl font-bold text-yellow-700">{teacherRequests.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <Clock className="h-8 lg:h-10 w-8 lg:w-10 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
              <TabsTrigger value="users" className="font-cairo">
                <Users className="h-4 w-4 ms-2" />
                المستخدمين
              </TabsTrigger>
              <TabsTrigger value="requests" className="font-cairo relative">
                <FileText className="h-4 w-4 ms-2" />
                طلبات المعلمين
                {teacherRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -start-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {teacherRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              {/* Search and Filters */}
              <Card className="hidden lg:block">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4 flex-row-reverse">
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
                    
                    {/* AI Status Filter */}
                    <Select value={selectedAIStatus} onValueChange={setSelectedAIStatus}>
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="AI" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="enabled">AI مفعّل</SelectItem>
                        <SelectItem value="disabled">AI معطّل</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Status Filter */}
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32 rounded-xl">
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
                    
                    {/* Role Filter */}
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue placeholder="الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأدوار</SelectItem>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Account Type Filter */}
                    <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue placeholder="نوع الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Search */}
                    <div className="relative flex-1 min-w-[300px]">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="البحث بالاسم، البريد، الهاتف، المدرسة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pe-10 rounded-xl text-right"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Mobile Search */}
              <div className="lg:hidden relative">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pe-10 rounded-xl text-right"
                />
              </div>
              
              {/* Users Grid */}
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
                      {hasActiveFilters ? 'لم يتم العثور على مستخدمين مطابقين للفلاتر' : 'ابدأ بإنشاء مستخدم جديد'}
                    </p>
                    {hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>مسح الفلاتر</Button>
                    ) : (
                      <Button onClick={() => setShowCreateWizard(true)}>
                        <UserPlus className="h-4 w-4 ms-2" />
                        إنشاء مستخدم
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {users.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <Card key={user.id} className="hover:shadow-lg transition-all" data-testid={`user-card-${user.id}`}>
                        <CardContent className="p-4">
                          {/* User Header */}
                          <div className="flex items-start justify-between mb-4 flex-row-reverse">
                            <div className="flex items-center gap-3 flex-row-reverse">
                              <Avatar className="h-14 w-14 border-2">
                                <AvatarFallback className={`${roleInfo.color} text-white text-lg`}>
                                  {user.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-right">
                                <h4 className="font-bold text-base">{user.full_name}</h4>
                                <Badge variant="outline" className={`${roleInfo.color} text-white border-0 text-[10px] mt-1`}>
                                  <RoleIcon className="h-3 w-3 ms-1" />
                                  {roleInfo.name}
                                </Badge>
                              </div>
                            </div>
                            {/* Status Badge */}
                            <div className="flex flex-col gap-1 items-start">
                              {user.is_active !== false ? (
                                <Badge className="bg-green-100 text-green-700 text-[10px]">نشط</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 text-[10px]">موقوف</Badge>
                              )}
                              {user.ai_enabled && (
                                <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                                  <Brain className="h-3 w-3 ms-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* User Details */}
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2 text-muted-foreground flex-row-reverse">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate text-right flex-1" dir="ltr">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground flex-row-reverse">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span dir="ltr">{user.phone}</span>
                              </div>
                            )}
                            {user.school_name && (
                              <div className="flex items-center gap-2 text-muted-foreground flex-row-reverse">
                                <Building2 className="h-4 w-4 flex-shrink-0" />
                                <span className="text-right">{user.school_name}</span>
                              </div>
                            )}
                            {user.department && (
                              <div className="flex items-center gap-2 text-muted-foreground flex-row-reverse">
                                <Briefcase className="h-4 w-4 flex-shrink-0" />
                                <span className="text-right">{user.department}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground flex-row-reverse">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="text-right text-xs">{formatTimeAgo(user.last_login)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground flex-row-reverse">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="text-right text-xs">تاريخ الإنشاء: {formatDate(user.created_at)}</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Always Visible */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 min-w-[60px] rounded-lg text-xs"
                              onClick={() => handleViewUser(user)}
                              data-testid={`view-user-${user.id}`}
                            >
                              <Eye className="h-3 w-3 ms-1" />
                              عرض
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 min-w-[60px] rounded-lg text-xs"
                              onClick={() => setShowSuspendConfirm(user)}
                              data-testid={`suspend-user-${user.id}`}
                            >
                              {user.is_active !== false ? (
                                <>
                                  <Lock className="h-3 w-3 ms-1" />
                                  تعليق
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-3 w-3 ms-1" />
                                  تفعيل
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 min-w-[60px] rounded-lg text-xs"
                              onClick={() => setShowEditUser(user)}
                              data-testid={`edit-user-${user.id}`}
                            >
                              <Edit className="h-3 w-3 ms-1" />
                              تعديل
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 min-w-[60px] rounded-lg text-xs text-red-600 hover:bg-red-50"
                              onClick={() => setShowDeleteConfirm(user)}
                              data-testid={`delete-user-${user.id}`}
                            >
                              <Trash2 className="h-3 w-3 ms-1" />
                              حذف
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 min-w-[60px] rounded-lg text-xs text-blue-600 hover:bg-blue-50"
                              onClick={() => setShowSendNotification(user)}
                              data-testid={`notify-user-${user.id}`}
                            >
                              <Bell className="h-3 w-3 ms-1" />
                              إشعار
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            {/* Teacher Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2 flex-row-reverse justify-end">
                    <FileText className="h-5 w-5 text-brand-navy" />
                    طلبات حسابات المعلمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teacherRequests.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="font-bold text-lg mb-2">لا توجد طلبات</h3>
                      <p className="text-muted-foreground">لا توجد طلبات معلمين معلقة حالياً</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teacherRequests.map((request) => (
                        <Card key={request.id} className="border-2 border-yellow-200 bg-yellow-50/30" data-testid={`request-card-${request.id}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Request Info */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3 flex-row-reverse justify-end">
                                  <div className="text-right">
                                    <h4 className="font-bold text-lg">{request.full_name}</h4>
                                    <Badge className="bg-yellow-500 text-white text-xs mt-1">قيد المراجعة</Badge>
                                  </div>
                                  <Avatar className="h-12 w-12 border-2">
                                    <AvatarFallback className="bg-cyan-500 text-white">
                                      {request.full_name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                  <div className="flex items-center gap-2 flex-row-reverse">
                                    <span className="text-muted-foreground">رقم الهوية:</span>
                                    <span className="font-medium" dir="ltr">{request.national_id}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-row-reverse">
                                    <span className="text-muted-foreground">الهاتف:</span>
                                    <span className="font-medium" dir="ltr">{request.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-row-reverse">
                                    <span className="text-muted-foreground">المادة:</span>
                                    <span className="font-medium">{request.subject}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-row-reverse">
                                    <span className="text-muted-foreground">المرحلة:</span>
                                    <span className="font-medium">{request.education_level}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-row-reverse col-span-2">
                                    <span className="text-muted-foreground">البريد:</span>
                                    <span className="font-medium" dir="ltr">{request.email}</span>
                                  </div>
                                  {request.school_mentioned && (
                                    <div className="flex items-center gap-2 flex-row-reverse col-span-2">
                                      <span className="text-muted-foreground">المدرسة المذكورة:</span>
                                      <span className="font-medium">{request.school_mentioned}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 flex-row-reverse">
                                    <span className="text-muted-foreground">تاريخ الطلب:</span>
                                    <span className="font-medium">{formatDate(request.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-wrap lg:flex-col gap-2">
                                <Button 
                                  className="bg-green-600 hover:bg-green-700 flex-1 lg:flex-none"
                                  onClick={() => setShowApproveConfirm(request)}
                                  data-testid={`approve-request-${request.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 ms-2" />
                                  موافقة
                                </Button>
                                <Button 
                                  variant="destructive"
                                  className="flex-1 lg:flex-none"
                                  onClick={() => setShowRejectRequest(request)}
                                  data-testid={`reject-request-${request.id}`}
                                >
                                  <XCircle className="h-4 w-4 ms-2" />
                                  رفض
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="flex-1 lg:flex-none"
                                  onClick={() => setShowMoreInfoRequest(request)}
                                  data-testid={`info-request-${request.id}`}
                                >
                                  <Info className="h-4 w-4 ms-2" />
                                  طلب معلومات
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Mobile Filters Sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="font-cairo flex items-center gap-2 flex-row-reverse justify-end">
                <Filter className="h-5 w-5" />
                الفلاتر
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-right block">نوع الحساب</label>
                  <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-right block">الدور</label>
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
                  <label className="text-sm font-medium text-right block">الحالة</label>
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
                  <label className="text-sm font-medium text-right block">حالة AI</label>
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
              <Button variant="outline" onClick={clearFilters} className="flex-1 rounded-xl">مسح الكل</Button>
              <Button onClick={() => setMobileFiltersOpen(false)} className="flex-1 bg-brand-navy rounded-xl">تطبيق</Button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* User Details Dialog */}
        <Dialog open={!!showUserDetails} onOpenChange={() => setShowUserDetails(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-3 flex-row-reverse justify-end">
                {showUserDetails?.full_name}
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-brand-navy text-white">
                    {showUserDetails?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DialogTitle>
            </DialogHeader>
            {showUserDetails && (
              <div className="space-y-6">
                {/* User Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium" dir="ltr">{showUserDetails.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-medium" dir="ltr">{showUserDetails.phone || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الدور</p>
                    <Badge className={`${getRoleInfo(showUserDetails.role).color} text-white`}>
                      {getRoleInfo(showUserDetails.role).name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    <Badge className={showUserDetails.is_active !== false ? 'bg-green-500' : 'bg-red-500'}>
                      {showUserDetails.is_active !== false ? 'نشط' : 'موقوف'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">المدرسة</p>
                    <p className="font-medium">{showUserDetails.school_name || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">القسم</p>
                    <p className="font-medium">{showUserDetails.department || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">آخر دخول</p>
                    <p className="font-medium">{formatTimeAgo(showUserDetails.last_login)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="font-medium">{formatDate(showUserDetails.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">حالة AI</p>
                    <Badge className={showUserDetails.ai_enabled ? 'bg-purple-500' : 'bg-gray-400'}>
                      {showUserDetails.ai_enabled ? 'مفعّل' : 'غير مفعّل'}
                    </Badge>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => { setShowUserDetails(null); setShowEditUser(showUserDetails); }}>
                    <Edit className="h-4 w-4 ms-2" />
                    تعديل البيانات
                  </Button>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 ms-2" />
                    إعادة تعيين كلمة المرور
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setShowUserDetails(null); setShowSendNotification(showUserDetails); }}>
                    <Bell className="h-4 w-4 ms-2" />
                    إرسال إشعار
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => { setShowUserDetails(null); setShowSuspendConfirm(showUserDetails); }}
                  >
                    {showUserDetails.is_active !== false ? (
                      <>
                        <Lock className="h-4 w-4 ms-2" />
                        تعليق الحساب
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 ms-2" />
                        تفعيل الحساب
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(null)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Suspend Confirmation Dialog */}
        <Dialog open={!!showSuspendConfirm} onOpenChange={() => setShowSuspendConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                {showSuspendConfirm?.is_active !== false ? 'تأكيد تعليق الحساب' : 'تأكيد تفعيل الحساب'}
              </DialogTitle>
              <DialogDescription className="text-right">
                {showSuspendConfirm?.is_active !== false 
                  ? `هل أنت متأكد من تعليق حساب "${showSuspendConfirm?.full_name}"؟ لن يتمكن المستخدم من تسجيل الدخول.`
                  : `هل أنت متأكد من إعادة تفعيل حساب "${showSuspendConfirm?.full_name}"؟`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowSuspendConfirm(null)}>إلغاء</Button>
              <Button 
                variant={showSuspendConfirm?.is_active !== false ? "destructive" : "default"}
                onClick={() => handleSuspendUser(showSuspendConfirm)}
              >
                {showSuspendConfirm?.is_active !== false ? (
                  <>
                    <Lock className="h-4 w-4 ms-2" />
                    تعليق
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 ms-2" />
                    تفعيل
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end text-red-600">
                <Trash2 className="h-5 w-5" />
                تأكيد الحذف
              </DialogTitle>
              <DialogDescription className="text-right">
                هل أنت متأكد من حذف حساب <strong>{showDeleteConfirm?.full_name}</strong>؟
                <br />
                <span className="text-muted-foreground text-sm">سيتم نقل الحساب إلى الأرشيف ولن يتم حذفه نهائياً.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>إلغاء</Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(showDeleteConfirm)}>
                <Archive className="h-4 w-4 ms-2" />
                أرشفة الحساب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Send Notification Dialog */}
        <Dialog open={!!showSendNotification} onOpenChange={() => setShowSendNotification(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end">
                <Bell className="h-5 w-5 text-blue-600" />
                إرسال إشعار إلى {showSendNotification?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right block">نوع الإشعار</Label>
                <Select value={notificationForm.type} onValueChange={(v) => setNotificationForm({...notificationForm, type: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">إشعار داخل النظام</SelectItem>
                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                    <SelectItem value="push">إشعار فوري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-right block">العنوان</Label>
                <Input 
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  className="rounded-xl text-right"
                  placeholder="عنوان الإشعار"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">الرسالة</Label>
                <Textarea 
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  className="rounded-xl text-right min-h-[100px]"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowSendNotification(null)}>إلغاء</Button>
              <Button onClick={() => handleSendNotification(showSendNotification)}>
                <Send className="h-4 w-4 ms-2" />
                إرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Approve Request Success Dialog */}
        <Dialog open={!!showApproveRequest} onOpenChange={() => setShowApproveRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                تم إنشاء الحساب بنجاح!
              </DialogTitle>
            </DialogHeader>
            {showApproveRequest && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2 text-right">بيانات الحساب الجديد:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(showApproveRequest.teacher_id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <div className="text-right">
                        <span className="text-muted-foreground">رقم المعلم: </span>
                        <span className="font-mono font-bold">{showApproveRequest.teacher_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(showApproveRequest.email)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <div className="text-right">
                        <span className="text-muted-foreground">البريد: </span>
                        <span className="font-mono" dir="ltr">{showApproveRequest.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(showApproveRequest.temp_password)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <div className="text-right">
                        <span className="text-muted-foreground">كلمة المرور: </span>
                        <span className="font-mono font-bold text-brand-navy">{showApproveRequest.temp_password}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <QrCode className="h-16 w-16 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-blue-700">QR Code للمعلم</p>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  يمكنك نسخ البيانات وإرسالها للمعلم عبر البريد أو الرسائل
                </p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowApproveRequest(null)} className="w-full">
                <Check className="h-4 w-4 ms-2" />
                تم
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reject Request Dialog */}
        <Dialog open={!!showRejectRequest} onOpenChange={() => setShowRejectRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end text-red-600">
                <XCircle className="h-5 w-5" />
                رفض طلب {showRejectRequest?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right block">سبب الرفض *</Label>
                <Textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="rounded-xl text-right min-h-[100px]"
                  placeholder="اكتب سبب رفض الطلب... سيتم إرساله للمعلم"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setRejectionReason('بيانات غير مكتملة')}>بيانات غير مكتملة</Button>
                  <Button variant="outline" size="sm" onClick={() => setRejectionReason('بيانات غير صحيحة')}>بيانات غير صحيحة</Button>
                  <Button variant="outline" size="sm" onClick={() => setRejectionReason('حساب مكرر')}>حساب مكرر</Button>
                  <Button variant="outline" size="sm" onClick={() => setRejectionReason('المعلم غير مؤهل')}>المعلم غير مؤهل</Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowRejectRequest(null)}>إلغاء</Button>
              <Button 
                variant="destructive" 
                onClick={() => handleRejectRequest(showRejectRequest)}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 ms-2" />
                رفض وإرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Approve Confirmation Dialog */}
        <Dialog open={!!showApproveConfirm} onOpenChange={() => setShowApproveConfirm(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                تأكيد الموافقة على طلب إنشاء حساب
              </DialogTitle>
              <DialogDescription className="text-right">
                هل أنت متأكد من الموافقة على طلب إنشاء حساب لهذا المعلم؟
              </DialogDescription>
            </DialogHeader>
            {showApproveConfirm && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl space-y-2 text-right">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{showApproveConfirm.full_name}</span>
                    <span className="text-muted-foreground">الاسم:</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span dir="ltr">{showApproveConfirm.email}</span>
                    <span className="text-muted-foreground">البريد:</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span dir="ltr">{showApproveConfirm.phone}</span>
                    <span className="text-muted-foreground">الهاتف:</span>
                  </div>
                  {showApproveConfirm.subject && (
                    <div className="flex items-center justify-between">
                      <span>{showApproveConfirm.subject}</span>
                      <span className="text-muted-foreground">المادة:</span>
                    </div>
                  )}
                  {showApproveConfirm.educational_level && (
                    <div className="flex items-center justify-between">
                      <span>{showApproveConfirm.educational_level}</span>
                      <span className="text-muted-foreground">المرحلة:</span>
                    </div>
                  )}
                  {showApproveConfirm.school_mentioned && (
                    <div className="flex items-center justify-between">
                      <span>{showApproveConfirm.school_mentioned}</span>
                      <span className="text-muted-foreground">المدرسة:</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  سيتم إنشاء حساب للمعلم وتوليد بيانات الدخول و QR Code
                </p>
              </div>
            )}
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowApproveConfirm(null)}>إلغاء</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleApproveRequest(showApproveConfirm);
                  setShowApproveConfirm(null);
                }}
              >
                <CheckCircle2 className="h-4 w-4 ms-2" />
                تأكيد الموافقة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Request More Info Dialog */}
        <Dialog open={!!showMoreInfoRequest} onOpenChange={() => setShowMoreInfoRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-row-reverse justify-end text-blue-600">
                <Info className="h-5 w-5" />
                طلب معلومات إضافية من {showMoreInfoRequest?.full_name}
              </DialogTitle>
              <DialogDescription className="text-right">
                سيتم إرسال رسالة للمعلم تطلب منه تزويدكم بالمعلومات المحددة أدناه
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right block">المعلومات المطلوبة من المعلم *</Label>
                <Textarea 
                  value={moreInfoMessage}
                  onChange={(e) => setMoreInfoMessage(e.target.value)}
                  className="rounded-xl text-right min-h-[100px]"
                  placeholder="مثال: يرجى رفع صورة الهوية وتحديد المادة التي تدرسها..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setMoreInfoMessage('يرجى رفع صورة الهوية')}>رفع صورة الهوية</Button>
                  <Button variant="outline" size="sm" onClick={() => setMoreInfoMessage('يرجى تأكيد المادة التي تدرسها')}>تأكيد المادة</Button>
                  <Button variant="outline" size="sm" onClick={() => setMoreInfoMessage('يرجى تحديد المدرسة التي تعمل بها')}>تحديد المدرسة</Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowMoreInfoRequest(null)}>إلغاء</Button>
              <Button 
                onClick={() => handleRequestMoreInfo(showMoreInfoRequest)}
                disabled={!moreInfoMessage.trim() || moreInfoMessage.trim().length < 10}
              >
                <Send className="h-4 w-4 ms-2" />
                إرسال الطلب
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
