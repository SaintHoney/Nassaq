import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Settings,
  Lock,
  Bell,
  Palette,
  Globe,
  Sun,
  Moon,
  Save,
  Camera,
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  LogOut,
  Trash2,
  Languages,
  Monitor,
  RefreshCw,
  Users,
  Building2,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export const AccountSettingsPage = () => {
  const { user, api, logout } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark, language, setLanguage, theme, setTheme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile
  const [profile, setProfile] = useState({
    title: 'none',
    full_name: '',
    full_name_en: '',
    email: '',
    phone: '',
    avatar_url: '',
  });
  
  // Title options
  const titleOptions = isRTL 
    ? [
        { value: 'none', label: 'بدون لقب' },
        { value: 'السيد', label: 'السيد' },
        { value: 'السيدة', label: 'السيدة' },
        { value: 'الآنسة', label: 'الآنسة' },
        { value: 'الأستاذة', label: 'الأستاذة / السيدة' },
        { value: 'دكتور', label: 'دكتور' },
        { value: 'أستاذ', label: 'أستاذ' },
        { value: 'مهندس', label: 'مهندس' },
        { value: 'مستشار', label: 'مستشار' },
        { value: 'معالي', label: 'معالي' },
        { value: 'سعادة', label: 'سعادة' },
        { value: 'الشيخ', label: 'الشيخ' },
      ]
    : [
        { value: 'none', label: 'No Title' },
        { value: 'Mr.', label: 'Mr.' },
        { value: 'Mrs.', label: 'Mrs.' },
        { value: 'Miss', label: 'Miss' },
        { value: 'Ms.', label: 'Ms.' },
        { value: 'Dr.', label: 'Dr.' },
        { value: 'Prof.', label: 'Prof.' },
        { value: 'Eng.', label: 'Eng.' },
        { value: 'Consultant', label: 'Consultant' },
        { value: 'His/Her Excellency', label: 'His/Her Excellency' },
        { value: 'Sheikh', label: 'Sheikh' },
      ];
  
  // Password
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Notifications
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    attendance_alerts: true,
    grade_alerts: true,
    behavior_alerts: true,
    announcement_alerts: true,
    weekly_digest: true,
  });
  
  // Preferences
  const [preferences, setPreferences] = useState({
    language: 'ar',
    theme: 'light',
    time_format: '12h',
    date_format: 'dd/mm/yyyy',
    first_day_of_week: 'sunday',
  });
  
  // Dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showRoleSwitchDialog, setShowRoleSwitchDialog] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        title: user.title || 'none',
        full_name: user.full_name || '',
        full_name_en: user.full_name_en || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
      setPreferences(prev => ({
        ...prev,
        language: user.preferred_language || 'ar',
        theme: user.preferred_theme || 'light',
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Convert 'none' back to empty string for API
      const profileToSave = {
        ...profile,
        title: profile.title === 'none' ? '' : profile.title
      };
      await api.put('/users/me', profileToSave);
      toast.success(isRTL ? 'تم حفظ الملف الشخصي' : 'Profile saved');
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل حفظ الملف الشخصي' : 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success(isRTL ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/users/me/notifications', notifications);
      toast.success(isRTL ? 'تم حفظ إعدادات الإشعارات' : 'Notification settings saved');
    } catch (error) {
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await api.put('/users/me/preferences', preferences);
      
      // Apply language and theme changes
      if (preferences.language !== language) {
        setLanguage(preferences.language);
      }
      if (preferences.theme !== theme) {
        setTheme(preferences.theme);
      }
      
      toast.success(isRTL ? 'تم حفظ التفضيلات' : 'Preferences saved');
    } catch (error) {
      toast.error(isRTL ? 'فشل حفظ التفضيلات' : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(isRTL ? 'تم تسجيل الخروج' : 'Logged out successfully');
  };

  const getRoleLabel = (role) => {
    const roles = {
      platform_admin: { ar: 'مدير المنصة', en: 'Platform Admin' },
      school_principal: { ar: 'مدير المدرسة', en: 'School Principal' },
      school_sub_admin: { ar: 'مساعد المدير', en: 'Sub Admin' },
      teacher: { ar: 'معلم', en: 'Teacher' },
      student: { ar: 'طالب', en: 'Student' },
      parent: { ar: 'ولي أمر', en: 'Parent' },
    };
    return roles[role]?.[isRTL ? 'ar' : 'en'] || role;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="account-settings-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'إعدادات الحساب' : 'Account Settings'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة ملفك الشخصي وإعداداتك' : 'Manage your profile and settings'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Profile Summary Card */}
          <Card className="card-nassaq mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-brand-turquoise/20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-brand-navy text-white text-2xl">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-brand-turquoise hover:bg-brand-turquoise/90"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold font-cairo">{profile.full_name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-brand-turquoise/10 text-brand-turquoise">
                      {getRoleLabel(user?.role)}
                    </Badge>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 me-1" />
                      {isRTL ? 'حساب موثق' : 'Verified'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutDialog(true)}
                  className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 me-2" />
                  {isRTL ? 'تسجيل خروج' : 'Logout'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-profile">
                <User className="h-4 w-4 me-2" />
                {isRTL ? 'الملف الشخصي' : 'Profile'}
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-security">
                <Lock className="h-4 w-4 me-2" />
                {isRTL ? 'الأمان' : 'Security'}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-notifications">
                <Bell className="h-4 w-4 me-2" />
                {isRTL ? 'الإشعارات' : 'Notifications'}
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-preferences">
                <Palette className="h-4 w-4 me-2" />
                {isRTL ? 'التفضيلات' : 'Preferences'}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اللقب' : 'Title'}</Label>
                      <Select 
                        value={profile.title} 
                        onValueChange={(value) => setProfile({ ...profile, title: value })}
                      >
                        <SelectTrigger className="rounded-xl" data-testid="profile-title">
                          <SelectValue placeholder={isRTL ? 'اختر اللقب' : 'Select Title'} />
                        </SelectTrigger>
                        <SelectContent>
                          {titleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}</Label>
                      <Input
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="rounded-xl"
                        data-testid="profile-name-ar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}</Label>
                      <Input
                        value={profile.full_name_en}
                        onChange={(e) => setProfile({ ...profile, full_name_en: e.target.value })}
                        className="rounded-xl"
                        data-testid="profile-name-en"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="rounded-xl ps-10"
                          data-testid="profile-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="rounded-xl ps-10"
                          data-testid="profile-phone"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-brand-navy rounded-xl" data-testid="save-profile">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                      {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Key className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 max-w-md">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="rounded-xl ps-10 pe-10"
                          data-testid="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        >
                          {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="rounded-xl ps-10 pe-10"
                          data-testid="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        >
                          {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="rounded-xl ps-10 pe-10"
                          data-testid="confirm-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        >
                          {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} disabled={saving} className="bg-brand-navy rounded-xl" data-testid="change-password">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Key className="h-4 w-4 me-2" />}
                      {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    {isRTL ? 'أمان الحساب' : 'Account Security'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{isRTL ? 'البريد الإلكتروني موثق' : 'Email Verified'}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">{isRTL ? 'موثق' : 'Verified'}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{isRTL ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'أضف طبقة أمان إضافية' : 'Add an extra layer of security'}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl">
                        {isRTL ? 'تفعيل' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Bell className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium">{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</p>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'استلام الإشعارات عبر البريد' : 'Receive notifications via email'}</p>
                      </div>
                      <Switch
                        checked={notifications.email_notifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email_notifications: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium">{isRTL ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}</p>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'استلام الإشعارات عبر SMS' : 'Receive notifications via SMS'}</p>
                      </div>
                      <Switch
                        checked={notifications.sms_notifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, sms_notifications: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium">{isRTL ? 'تنبيهات الحضور' : 'Attendance Alerts'}</p>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'إشعارات عن الغياب والتأخر' : 'Alerts about absences and tardiness'}</p>
                      </div>
                      <Switch
                        checked={notifications.attendance_alerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, attendance_alerts: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium">{isRTL ? 'تنبيهات الدرجات' : 'Grade Alerts'}</p>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'إشعارات عن الدرجات والنتائج' : 'Alerts about grades and results'}</p>
                      </div>
                      <Switch
                        checked={notifications.grade_alerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, grade_alerts: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium">{isRTL ? 'الملخص الأسبوعي' : 'Weekly Digest'}</p>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'ملخص أسبوعي بالتحديثات' : 'Weekly summary of updates'}</p>
                      </div>
                      <Switch
                        checked={notifications.weekly_digest}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, weekly_digest: checked })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={saving} className="bg-brand-navy rounded-xl" data-testid="save-notifications">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                      {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Palette className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'التفضيلات' : 'Preferences'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {isRTL ? 'اللغة' : 'Language'}
                      </Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(v) => setPreferences({ ...preferences, language: v })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        {isRTL ? 'المظهر' : 'Theme'}
                      </Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(v) => setPreferences({ ...preferences, theme: v })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">{isRTL ? 'فاتح' : 'Light'}</SelectItem>
                          <SelectItem value="dark">{isRTL ? 'داكن' : 'Dark'}</SelectItem>
                          <SelectItem value="system">{isRTL ? 'حسب النظام' : 'System'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'تنسيق الوقت' : 'Time Format'}</Label>
                      <Select
                        value={preferences.time_format}
                        onValueChange={(v) => setPreferences({ ...preferences, time_format: v })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">{isRTL ? '12 ساعة' : '12 Hour'}</SelectItem>
                          <SelectItem value="24h">{isRTL ? '24 ساعة' : '24 Hour'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'أول يوم في الأسبوع' : 'First Day of Week'}</Label>
                      <Select
                        value={preferences.first_day_of_week}
                        onValueChange={(v) => setPreferences({ ...preferences, first_day_of_week: v })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunday">{isRTL ? 'الأحد' : 'Sunday'}</SelectItem>
                          <SelectItem value="monday">{isRTL ? 'الإثنين' : 'Monday'}</SelectItem>
                          <SelectItem value="saturday">{isRTL ? 'السبت' : 'Saturday'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences} disabled={saving} className="bg-brand-navy rounded-xl" data-testid="save-preferences">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                      {isRTL ? 'حفظ التفضيلات' : 'Save Preferences'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Logout Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-cairo">
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-500 rounded-xl">
                <LogOut className="h-4 w-4 me-2" />
                {isRTL ? 'تسجيل خروج' : 'Logout'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};

export default AccountSettingsPage;
