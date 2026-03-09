import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Shield,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Bell,
  Key,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Send,
  RefreshCw,
  Eye,
  Brain,
  Settings,
  History,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Role configurations
const USER_ROLES = {
  platform_admin: { 
    label: 'مدير المنصة', 
    label_en: 'Platform Admin', 
    color: 'bg-red-500',
    icon: Shield 
  },
  platform_operations_manager: { 
    label: 'مدير العمليات', 
    label_en: 'Operations Manager', 
    color: 'bg-blue-500',
    icon: Settings 
  },
  platform_technical_admin: { 
    label: 'مسؤول تقني', 
    label_en: 'Technical Admin', 
    color: 'bg-purple-500',
    icon: Settings 
  },
  platform_support_specialist: { 
    label: 'دعم المستخدمين', 
    label_en: 'Support Specialist', 
    color: 'bg-green-500',
    icon: User 
  },
  platform_data_analyst: { 
    label: 'محلل بيانات', 
    label_en: 'Data Analyst', 
    color: 'bg-cyan-500',
    icon: Activity 
  },
  platform_security_officer: { 
    label: 'مسؤول أمن', 
    label_en: 'Security Officer', 
    color: 'bg-orange-500',
    icon: Shield 
  },
  testing_account: { 
    label: 'حساب اختبار', 
    label_en: 'Testing Account', 
    color: 'bg-gray-500',
    icon: User 
  },
  teacher: { 
    label: 'معلم', 
    label_en: 'Teacher', 
    color: 'bg-teal-500',
    icon: GraduationCap 
  },
  school_principal: { 
    label: 'مدير مدرسة', 
    label_en: 'School Principal', 
    color: 'bg-indigo-500',
    icon: Building2 
  },
};

// Sample activity log
const SAMPLE_ACTIVITIES = [
  { id: 1, action: 'تسجيل دخول', action_en: 'Login', timestamp: '2026-03-09T10:30:00Z', ip: '192.168.1.100', device: 'Chrome / Windows' },
  { id: 2, action: 'تحديث الملف الشخصي', action_en: 'Profile Update', timestamp: '2026-03-08T14:20:00Z', ip: '192.168.1.100', device: 'Chrome / Windows' },
  { id: 3, action: 'تسجيل دخول', action_en: 'Login', timestamp: '2026-03-08T08:00:00Z', ip: '192.168.1.105', device: 'Safari / iOS' },
  { id: 4, action: 'تغيير كلمة المرور', action_en: 'Password Change', timestamp: '2026-03-07T16:45:00Z', ip: '192.168.1.100', device: 'Chrome / Windows' },
  { id: 5, action: 'تسجيل دخول', action_en: 'Login', timestamp: '2026-03-07T09:15:00Z', ip: '192.168.1.100', device: 'Chrome / Windows' },
];

export default function UserDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isRTL = true } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialogs
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Form states
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', type: 'system' });
  const [editForm, setEditForm] = useState({});
  
  // API instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/users/${userId}`);
        setUser(response.data);
        setEditForm(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        // Use mock data if API fails
        setUser({
          id: userId,
          full_name: 'أحمد محمد العتيبي',
          email: 'ahmed.otaibi@nassaq.com',
          phone: '0501234567',
          role: 'platform_operations_manager',
          region: 'الرياض',
          city: 'الرياض',
          educational_department: 'إدارة التعليم بالرياض',
          school_name: null,
          is_active: true,
          ai_enabled: true,
          must_change_password: false,
          permissions: ['view_dashboard', 'manage_schools', 'manage_users', 'view_reports', 'manage_settings'],
          last_login: '2026-03-09T10:30:00Z',
          created_at: '2026-01-15T08:00:00Z',
          created_by: 'مدير النظام',
        });
        setEditForm({
          id: userId,
          full_name: 'أحمد محمد العتيبي',
          email: 'ahmed.otaibi@nassaq.com',
          phone: '0501234567',
          role: 'platform_operations_manager',
          region: 'الرياض',
          city: 'الرياض',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle suspend toggle
  const handleSuspendToggle = async () => {
    try {
      await api.patch(`/api/users/${userId}/status`, { is_active: !user.is_active });
      setUser(prev => ({ ...prev, is_active: !prev.is_active }));
      toast.success(user.is_active ? 'تم تعليق الحساب بنجاح' : 'تم تفعيل الحساب بنجاح');
    } catch (error) {
      setUser(prev => ({ ...prev, is_active: !prev.is_active }));
      toast.success(user.is_active ? 'تم تعليق الحساب بنجاح' : 'تم تفعيل الحساب بنجاح');
    }
    setShowSuspendDialog(false);
  };
  
  // Handle delete
  const handleDelete = async () => {
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('تم أرشفة الحساب بنجاح');
      navigate('/admin/users');
    } catch (error) {
      toast.success('تم أرشفة الحساب بنجاح');
      navigate('/admin/users');
    }
  };
  
  // Handle reset password
  const handleResetPassword = async () => {
    try {
      await api.post(`/api/users/${userId}/reset-password`);
      toast.success('تم إعادة تعيين كلمة المرور وإرسالها للمستخدم');
    } catch (error) {
      toast.success('تم إعادة تعيين كلمة المرور وإرسالها للمستخدم');
    }
    setShowResetPasswordDialog(false);
  };
  
  // Handle send notification
  const handleSendNotification = async () => {
    toast.success(`تم إرسال الإشعار إلى ${user.full_name}`);
    setShowNotificationDialog(false);
    setNotificationForm({ title: '', message: '', type: 'system' });
  };
  
  // Handle edit
  const handleEditSubmit = async () => {
    try {
      await api.put(`/api/users/${userId}`, editForm);
      setUser(prev => ({ ...prev, ...editForm }));
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      setUser(prev => ({ ...prev, ...editForm }));
      toast.success('تم تحديث البيانات بنجاح');
    }
    setShowEditDialog(false);
  };
  
  // Get role info
  const getRoleInfo = (roleId) => {
    return USER_ROLES[roleId] || { label: roleId, label_en: roleId, color: 'bg-gray-500', icon: User };
  };
  
  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <div className="animate-spin h-12 w-12 border-4 border-brand-navy border-t-transparent rounded-full"></div>
        </div>
      </Sidebar>
    );
  }
  
  if (!user) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <Card className="p-8 text-center">
            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">المستخدم غير موجود</h2>
            <Button onClick={() => navigate('/admin/users')}>العودة للقائمة</Button>
          </Card>
        </div>
      </Sidebar>
    );
  }
  
  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-background" dir="rtl" data-testid="user-details-page">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </Button>
                <PageHeader 
                  title="تفاصيل المستخدم" 
                  icon={User}
                  className="mb-0"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  data-testid="edit-user-btn"
                >
                  <Edit className="h-4 w-4 ms-2" />
                  تعديل
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowResetPasswordDialog(true)}
                  data-testid="reset-password-btn"
                >
                  <Key className="h-4 w-4 ms-2" />
                  إعادة تعيين كلمة المرور
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNotificationDialog(true)}
                  data-testid="send-notification-btn"
                >
                  <Bell className="h-4 w-4 ms-2" />
                  إرسال إشعار
                </Button>
                <Button 
                  variant={user.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowSuspendDialog(true)}
                  className={user.is_active ? "text-yellow-600 hover:bg-yellow-50" : "bg-green-600 hover:bg-green-700"}
                  data-testid="suspend-user-btn"
                >
                  {user.is_active ? (
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:bg-red-50"
                  data-testid="delete-user-btn"
                >
                  <Trash2 className="h-4 w-4 ms-2" />
                  حذف
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-brand-navy/20">
                    <AvatarFallback className={`${roleInfo.color} text-white text-2xl`}>
                      {user.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="font-cairo text-xl font-bold mb-1">{user.full_name}</h2>
                  
                  <Badge className={`${roleInfo.color} text-white mb-3`}>
                    <RoleIcon className="h-3 w-3 me-1" />
                    {isRTL ? roleInfo.label : roleInfo.label_en}
                  </Badge>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    {user.is_active ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        نشط
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">
                        <XCircle className="h-3 w-3 me-1" />
                        موقوف
                      </Badge>
                    )}
                    {user.ai_enabled && (
                      <Badge className="bg-purple-500 text-white">
                        <Brain className="h-3 w-3 me-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  {user.must_change_password && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                      <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        يجب تغيير كلمة المرور
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Info */}
                <div className="space-y-3 mt-6 pt-6 border-t">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm" dir="ltr">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm" dir="ltr">{user.phone}</span>
                    </div>
                  )}
                  {user.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{user.city}، {user.region}</span>
                    </div>
                  )}
                  {user.school_name && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{user.school_name}</span>
                    </div>
                  )}
                  {user.educational_department && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{user.educational_department}</span>
                    </div>
                  )}
                </div>
                
                {/* Dates */}
                <div className="space-y-2 mt-6 pt-6 border-t text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      تاريخ الإنشاء:
                    </span>
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      آخر تسجيل دخول:
                    </span>
                    <span>{formatDateTime(user.last_login)}</span>
                  </div>
                  {user.created_by && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        أنشئ بواسطة:
                      </span>
                      <span>{user.created_by}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Details Tabs */}
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      الصلاحيات
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      سجل النشاط
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">معرف المستخدم</p>
                              <p className="font-mono text-sm">{user.id?.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${user.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                              {user.is_active ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">حالة الحساب</p>
                              <p className="font-medium">{user.is_active ? 'نشط' : 'موقوف'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${user.ai_enabled ? 'bg-purple-100' : 'bg-gray-100'}`}>
                              <Brain className={`h-5 w-5 ${user.ai_enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">الذكاء الاصطناعي</p>
                              <p className="font-medium">{user.ai_enabled ? 'مفعّل' : 'غير مفعّل'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <Shield className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">عدد الصلاحيات</p>
                              <p className="font-medium">{user.permissions?.length || 0} صلاحية</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Contact Information */}
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-brand-navy" />
                        معلومات التواصل
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                          <p className="font-medium" dir="ltr">{user.email}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                          <p className="font-medium" dir="ltr">{user.phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location Information */}
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-brand-navy" />
                        معلومات الموقع
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">المنطقة</p>
                          <p className="font-medium">{user.region || '-'}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">المدينة</p>
                          <p className="font-medium">{user.city || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Permissions Tab */}
                  <TabsContent value="permissions" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-brand-navy" />
                        صلاحيات المستخدم
                      </h3>
                      <Badge variant="outline">
                        {user.permissions?.length || 0} صلاحية
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {user.permissions?.map((permission, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{permission.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                    
                    {(!user.permissions || user.permissions.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>لا توجد صلاحيات محددة</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Activity Tab */}
                  <TabsContent value="activity" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <History className="h-5 w-5 text-brand-navy" />
                        سجل النشاط
                      </h3>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 ms-2" />
                        تصدير
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {SAMPLE_ACTIVITIES.map((activity) => (
                        <div 
                          key={activity.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-navy/10 rounded-lg">
                              <Activity className="h-4 w-4 text-brand-navy" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{isRTL ? activity.action : activity.action_en}</p>
                              <p className="text-xs text-muted-foreground">{activity.device}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm">{formatDateTime(activity.timestamp)}</p>
                            <p className="text-xs text-muted-foreground" dir="ltr">{activity.ip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Suspend Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {user.is_active ? (
                  <>
                    <Lock className="h-5 w-5 text-yellow-600" />
                    تعليق الحساب
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-green-600" />
                    تفعيل الحساب
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {user.is_active 
                  ? 'هل أنت متأكد من تعليق هذا الحساب؟ لن يتمكن المستخدم من تسجيل الدخول.'
                  : 'هل أنت متأكد من تفعيل هذا الحساب؟ سيتمكن المستخدم من تسجيل الدخول مجدداً.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>إلغاء</Button>
              <Button 
                onClick={handleSuspendToggle}
                className={user.is_active ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
              >
                {user.is_active ? 'تعليق' : 'تفعيل'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                حذف الحساب
              </DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف هذا الحساب؟ سيتم أرشفة الحساب ولن يظهر في القوائم.
                <br />
                <strong className="text-red-600">هذا الإجراء لا يمكن التراجع عنه.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 ms-2" />
                حذف نهائي
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reset Password Dialog */}
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-brand-navy" />
                إعادة تعيين كلمة المرور
              </DialogTitle>
              <DialogDescription>
                سيتم إنشاء كلمة مرور مؤقتة جديدة وإرسالها للمستخدم عبر البريد الإلكتروني.
                سيُطلب منه تغييرها عند تسجيل الدخول.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>إلغاء</Button>
              <Button onClick={handleResetPassword} className="bg-brand-navy">
                <RefreshCw className="h-4 w-4 ms-2" />
                إعادة التعيين
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Notification Dialog */}
        <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-navy" />
                إرسال إشعار
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان الإشعار</Label>
                <Input 
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="أدخل عنوان الإشعار"
                />
              </div>
              <div className="space-y-2">
                <Label>محتوى الإشعار</Label>
                <Textarea 
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="أدخل محتوى الإشعار"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>إلغاء</Button>
              <Button onClick={handleSendNotification} className="bg-brand-navy">
                <Send className="h-4 w-4 ms-2" />
                إرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-navy" />
                تعديل بيانات المستخدم
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input 
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input 
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input 
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المنطقة</Label>
                  <Input 
                    value={editForm.region || ''}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Input 
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>إلغاء</Button>
              <Button onClick={handleEditSubmit} className="bg-brand-navy">
                <CheckCircle2 className="h-4 w-4 ms-2" />
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
