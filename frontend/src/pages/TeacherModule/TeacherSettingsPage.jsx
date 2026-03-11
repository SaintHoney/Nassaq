import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import {
  Settings, User, Bell, Lock, Palette, Globe, Save,
  Loader2, Camera, Mail, Phone, Key, Eye, EyeOff
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

export default function TeacherSettingsPage() {
  const { user, api, isRTL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: ''
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    attendance_alerts: true,
    grade_reminders: true,
    meeting_reminders: true
  });

  const [preferences, setPreferences] = useState({
    language: 'ar',
    theme: 'light',
    dashboard_layout: 'default'
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const teacherId = user?.teacher_id || user?.id;

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch teacher profile
      const teacherRes = await api.get(`/teachers/${teacherId}`).catch(() => null);
      if (teacherRes?.data) {
        setProfile({
          full_name: teacherRes.data.full_name || user?.full_name || '',
          email: teacherRes.data.email || user?.email || '',
          phone: teacherRes.data.phone || '',
          bio: teacherRes.data.bio || '',
          avatar_url: teacherRes.data.avatar_url || ''
        });
      } else {
        setProfile({
          full_name: user?.full_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          bio: '',
          avatar_url: ''
        });
      }

      // Fetch notification settings
      const notifRes = await api.get(`/users/${user?.id}/notifications/settings`).catch(() => null);
      if (notifRes?.data) {
        setNotifications(prev => ({ ...prev, ...notifRes.data }));
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [api, teacherId, user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/teachers/${teacherId}`, profile);
      toast.success(isRTL ? 'تم حفظ الملف الشخصي' : 'Profile saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${user?.id}/notifications/settings`, notifications);
      toast.success(isRTL ? 'تم حفظ إعدادات الإشعارات' : 'Notification settings saved');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error(isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${user?.id}/password`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      toast.success(isRTL ? 'تم تغيير كلمة المرور' : 'Password changed');
      setShowPasswordDialog(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(isRTL ? 'خطأ في تغيير كلمة المرور' : 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profile', label: isRTL ? 'الملف الشخصي' : 'Profile', icon: User },
    { id: 'notifications', label: isRTL ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'security', label: isRTL ? 'الأمان' : 'Security', icon: Lock },
    { id: 'preferences', label: isRTL ? 'التفضيلات' : 'Preferences', icon: Palette },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                {isRTL ? 'الإعدادات' : 'Settings'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {sections.map(section => (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveSection(section.id)}
                      >
                        <section.icon className="h-4 w-4 me-2" />
                        {section.label}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Profile Section */}
                  {activeSection === 'profile' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-cairo flex items-center gap-2">
                          <User className="h-5 w-5 text-brand-turquoise" />
                          {isRTL ? 'الملف الشخصي' : 'Profile'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="bg-brand-navy text-white text-xl">
                              {profile.full_name?.charAt(0) || 'م'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Button variant="outline" size="sm">
                              <Camera className="h-4 w-4 me-1" />
                              {isRTL ? 'تغيير الصورة' : 'Change Photo'}
                            </Button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
                            <Input
                              value={profile.full_name}
                              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                            <Input
                              value={profile.email}
                              onChange={(e) => setProfile({...profile, email: e.target.value})}
                              type="email"
                              dir="ltr"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{isRTL ? 'رقم الجوال' : 'Phone'}</Label>
                            <Input
                              value={profile.phone}
                              onChange={(e) => setProfile({...profile, phone: e.target.value})}
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{isRTL ? 'نبذة عني' : 'Bio'}</Label>
                          <Textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            rows={3}
                            placeholder={isRTL ? 'اكتب نبذة عن نفسك...' : 'Write about yourself...'}
                          />
                        </div>

                        <Button onClick={saveProfile} disabled={saving}>
                          {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                          <Save className="h-4 w-4 me-1" />
                          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notifications Section */}
                  {activeSection === 'notifications' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-cairo flex items-center gap-2">
                          <Bell className="h-5 w-5 text-brand-turquoise" />
                          {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">{isRTL ? 'طرق التنبيه' : 'Notification Methods'}</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{isRTL ? 'إشعارات البريد' : 'Email Notifications'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {isRTL ? 'استلام الإشعارات عبر البريد' : 'Receive notifications via email'}
                                </p>
                              </div>
                              <Switch
                                checked={notifications.email_notifications}
                                onCheckedChange={(v) => setNotifications({...notifications, email_notifications: v})}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{isRTL ? 'إشعارات SMS' : 'SMS Notifications'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {isRTL ? 'استلام الرسائل النصية' : 'Receive text messages'}
                                </p>
                              </div>
                              <Switch
                                checked={notifications.sms_notifications}
                                onCheckedChange={(v) => setNotifications({...notifications, sms_notifications: v})}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{isRTL ? 'الإشعارات الفورية' : 'Push Notifications'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {isRTL ? 'إشعارات التطبيق' : 'In-app notifications'}
                                </p>
                              </div>
                              <Switch
                                checked={notifications.push_notifications}
                                onCheckedChange={(v) => setNotifications({...notifications, push_notifications: v})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">{isRTL ? 'أنواع الإشعارات' : 'Notification Types'}</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p>{isRTL ? 'تنبيهات الحضور' : 'Attendance Alerts'}</p>
                              <Switch
                                checked={notifications.attendance_alerts}
                                onCheckedChange={(v) => setNotifications({...notifications, attendance_alerts: v})}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <p>{isRTL ? 'تذكير الدرجات' : 'Grade Reminders'}</p>
                              <Switch
                                checked={notifications.grade_reminders}
                                onCheckedChange={(v) => setNotifications({...notifications, grade_reminders: v})}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <p>{isRTL ? 'تذكير الاجتماعات' : 'Meeting Reminders'}</p>
                              <Switch
                                checked={notifications.meeting_reminders}
                                onCheckedChange={(v) => setNotifications({...notifications, meeting_reminders: v})}
                              />
                            </div>
                          </div>
                        </div>

                        <Button onClick={saveNotifications} disabled={saving}>
                          {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                          <Save className="h-4 w-4 me-1" />
                          {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Security Section */}
                  {activeSection === 'security' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-cairo flex items-center gap-2">
                          <Lock className="h-5 w-5 text-brand-turquoise" />
                          {isRTL ? 'الأمان' : 'Security'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{isRTL ? 'كلمة المرور' : 'Password'}</p>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? 'تغيير كلمة المرور الخاصة بك' : 'Change your password'}
                              </p>
                            </div>
                            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                              <Key className="h-4 w-4 me-1" />
                              {isRTL ? 'تغيير' : 'Change'}
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{isRTL ? 'آخر تسجيل دخول' : 'Last Login'}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleString('ar-SA')}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-600">
                              {isRTL ? 'نشط' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Preferences Section */}
                  {activeSection === 'preferences' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-cairo flex items-center gap-2">
                          <Palette className="h-5 w-5 text-brand-turquoise" />
                          {isRTL ? 'التفضيلات' : 'Preferences'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{isRTL ? 'اللغة' : 'Language'}</p>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? 'اختر لغة الواجهة' : 'Choose interface language'}
                              </p>
                            </div>
                            <Select 
                              value={preferences.language} 
                              onValueChange={(v) => setPreferences({...preferences, language: v})}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ar">العربية</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{isRTL ? 'المظهر' : 'Theme'}</p>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? 'اختر مظهر التطبيق' : 'Choose app theme'}
                              </p>
                            </div>
                            <Select 
                              value={preferences.theme} 
                              onValueChange={(v) => setPreferences({...preferences, theme: v})}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">{isRTL ? 'فاتح' : 'Light'}</SelectItem>
                                <SelectItem value="dark">{isRTL ? 'داكن' : 'Dark'}</SelectItem>
                                <SelectItem value="system">{isRTL ? 'النظام' : 'System'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-cairo">{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={changePassword} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {isRTL ? 'تغيير' : 'Change'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
