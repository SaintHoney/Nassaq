import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
} from '../components/ui/sheet';
import {
  Settings,
  User,
  Building2,
  Globe,
  Shield,
  FileText,
  Lock,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Palette,
  Languages,
  Bell,
  LogOut,
  RefreshCw,
  Save,
  Camera,
  Edit,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Activity,
  UserCog,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Plus,
  Trash2,
  Users,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Brain,
  Server,
  Database,
  Cloud,
  Upload,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Translations
const translations = {
  ar: {
    pageTitle: 'إعدادات النظام',
    pageSubtitle: 'إدارة إعدادات وتكوين منصة نَسَّق',
    accountSettings: 'إعدادات الحساب',
    generalSettings: 'الإعدادات العامة',
    brandIdentity: 'الهوية والعلامة التجارية',
    termsConditions: 'الشروط والأحكام',
    privacyPolicy: 'سياسة الخصوصية',
    contactInfo: 'بيانات التواصل',
    securitySessions: 'الأمان والجلسات',
    logout: 'تسجيل الخروج',
    switchUser: 'تبديل المستخدم',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    language: 'اللغة',
    avatar: 'الصورة الشخصية',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    uploadImage: 'رفع صورة',
    platformName: 'اسم المنصة',
    platformNameAr: 'اسم المنصة (عربي)',
    platformNameEn: 'اسم المنصة (إنجليزي)',
    browserTitle: 'عنوان المتصفح',
    defaultLanguage: 'اللغة الافتراضية',
    dateSystem: 'نظام التاريخ',
    timezone: 'المنطقة الزمنية',
    arabic: 'العربية',
    english: 'الإنجليزية',
    hijri: 'هجري',
    gregorian: 'ميلادي',
    both: 'كلاهما',
    notificationSettings: 'إعدادات الإشعارات',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    smsNotifications: 'إشعارات SMS',
    pushNotifications: 'الإشعارات الفورية',
    aiSettings: 'إعدادات الذكاء الاصطناعي',
    registrationSettings: 'إعدادات التسجيل',
    passwordPolicy: 'سياسة كلمات المرور',
    minLength: 'الحد الأدنى للطول',
    requireUppercase: 'أحرف كبيرة',
    requireNumbers: 'أرقام',
    requireSpecials: 'رموز خاصة',
    termsVersion: 'نسخة الشروط',
    lastUpdated: 'آخر تحديث',
    publishVersion: 'نشر النسخة',
    previewTerms: 'معاينة',
    archiveVersions: 'النسخ المؤرشفة',
    compareVersions: 'مقارنة النسخ',
    primaryEmail: 'البريد الإلكتروني الرئيسي',
    primaryPhone: 'رقم الهاتف الرئيسي',
    altPhone: 'رقم هاتف بديل',
    officeAddress: 'عنوان الإدارة',
    websiteUrl: 'الموقع الرسمي',
    supportUrl: 'رابط الدعم',
    workingHours: 'ساعات العمل',
    ownerName: 'اسم الجهة المالكة',
    billingInfo: 'بيانات الفواتير',
    socialMedia: 'وسائل التواصل الاجتماعي',
    twitter: 'تويتر',
    facebook: 'فيسبوك',
    linkedin: 'لينكد إن',
    instagram: 'إنستقرام',
    activeSessions: 'الجلسات النشطة',
    linkedDevices: 'الأجهزة المرتبطة',
    loginHistory: 'سجل تسجيل الدخول',
    switchHistory: 'سجل تبديل المستخدم',
    twoFactorAuth: '2FA المصادقة الثنائية',
    deviceRestrictions: 'قيود الأجهزة',
    sessionPolicy: 'سياسات الجلسة',
    endAllSessions: 'إنهاء جميع الجلسات',
    endOtherSessions: 'إنهاء الجلسات الأخرى',
    currentSession: 'الجلسة الحالية',
    device: 'الجهاز',
    browser: 'المتصفح',
    location: 'الموقع',
    lastActivity: 'آخر نشاط',
    endSession: 'إنهاء الجلسة',
    adminUsers: 'المستخدمين الإداريين',
    addAdmin: 'إضافة مسؤول',
    role: 'الدور',
    permissions: 'الصلاحيات',
    switchUserMode: 'وضع تبديل المستخدم',
    switchUserWarning: 'أنت الآن في وضع Switch User',
    returnToAdmin: 'العودة لحساب المدير',
    savedSuccessfully: 'تم الحفظ بنجاح',
    sessionEnded: 'تم إنهاء الجلسة',
    passwordChanged: 'تم تغيير كلمة المرور',
    versionPublished: 'تم نشر النسخة',
    logoUploaded: 'تم رفع الشعار',
  },
  en: {
    pageTitle: 'System Settings',
    pageSubtitle: 'Manage NASSAQ platform settings and configuration',
    accountSettings: 'Account Settings',
    generalSettings: 'General Settings',
    brandIdentity: 'Brand & Identity',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    contactInfo: 'Contact Information',
    securitySessions: 'Security & Sessions',
    logout: 'Logout',
    switchUser: 'Switch User',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    language: 'Language',
    avatar: 'Profile Picture',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    uploadImage: 'Upload Image',
    platformName: 'Platform Name',
    platformNameAr: 'Platform Name (Arabic)',
    platformNameEn: 'Platform Name (English)',
    browserTitle: 'Browser Title',
    defaultLanguage: 'Default Language',
    dateSystem: 'Date System',
    timezone: 'Timezone',
    arabic: 'Arabic',
    english: 'English',
    hijri: 'Hijri',
    gregorian: 'Gregorian',
    both: 'Both',
    notificationSettings: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    smsNotifications: 'SMS Notifications',
    pushNotifications: 'Push Notifications',
    aiSettings: 'AI Settings',
    registrationSettings: 'Registration Settings',
    passwordPolicy: 'Password Policy',
    minLength: 'Minimum Length',
    requireUppercase: 'Uppercase Letters',
    requireNumbers: 'Numbers',
    requireSpecials: 'Special Characters',
    termsVersion: 'Terms Version',
    lastUpdated: 'Last Updated',
    publishVersion: 'Publish Version',
    previewTerms: 'Preview',
    archiveVersions: 'Archived Versions',
    compareVersions: 'Compare Versions',
    primaryEmail: 'Primary Email',
    primaryPhone: 'Primary Phone',
    altPhone: 'Alternative Phone',
    officeAddress: 'Office Address',
    websiteUrl: 'Website URL',
    supportUrl: 'Support URL',
    workingHours: 'Working Hours',
    ownerName: 'Owner Name',
    billingInfo: 'Billing Information',
    socialMedia: 'Social Media',
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    activeSessions: 'Active Sessions',
    linkedDevices: 'Linked Devices',
    loginHistory: 'Login History',
    switchHistory: 'Switch User History',
    twoFactorAuth: 'Two-Factor Auth',
    deviceRestrictions: 'Device Restrictions',
    sessionPolicy: 'Session Policies',
    endAllSessions: 'End All Sessions',
    endOtherSessions: 'End Other Sessions',
    currentSession: 'Current Session',
    device: 'Device',
    browser: 'Browser',
    location: 'Location',
    lastActivity: 'Last Activity',
    endSession: 'End Session',
    adminUsers: 'Admin Users',
    addAdmin: 'Add Admin',
    role: 'Role',
    permissions: 'Permissions',
    switchUserMode: 'Switch User Mode',
    switchUserWarning: 'You are in Switch User mode',
    returnToAdmin: 'Return to Admin Account',
    savedSuccessfully: 'Saved successfully',
    sessionEnded: 'Session ended',
    passwordChanged: 'Password changed',
    versionPublished: 'Version published',
    logoUploaded: 'Logo uploaded',
  }
};

// Sample sessions data
const SAMPLE_SESSIONS = [
  {
    id: '1',
    device: 'Windows 11',
    browser: 'Chrome 120',
    ip: '192.168.1.100',
    location: 'الرياض، السعودية',
    lastActivity: '2026-03-09T10:30:00Z',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari',
    ip: '192.168.1.105',
    location: 'الرياض، السعودية',
    lastActivity: '2026-03-09T09:00:00Z',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'MacBook Pro',
    browser: 'Firefox 115',
    ip: '192.168.1.110',
    location: 'جدة، السعودية',
    lastActivity: '2026-03-08T22:30:00Z',
    isCurrent: false,
  },
];

// Terms versions
const TERMS_VERSIONS = [
  { version: '2.1', date: '2026-03-01', status: 'active' },
  { version: '2.0', date: '2026-01-15', status: 'archived' },
  { version: '1.5', date: '2025-10-01', status: 'archived' },
];

// Settings navigation items
const SETTINGS_NAV = [
  { id: 'account', icon: User, label_ar: 'إعدادات الحساب', label_en: 'Account Settings' },
  { id: 'general', icon: Settings, label_ar: 'الإعدادات العامة', label_en: 'General Settings' },
  { id: 'brand', icon: Palette, label_ar: 'الهوية والعلامة', label_en: 'Brand & Identity' },
  { id: 'terms', icon: FileText, label_ar: 'الشروط والأحكام', label_en: 'Terms & Conditions' },
  { id: 'privacy', icon: Shield, label_ar: 'سياسة الخصوصية', label_en: 'Privacy Policy' },
  { id: 'contact', icon: Phone, label_ar: 'بيانات التواصل', label_en: 'Contact Info' },
  { id: 'security', icon: Lock, label_ar: 'الأمان والجلسات', label_en: 'Security & Sessions' },
  { id: 'logout', icon: LogOut, label_ar: 'تسجيل الخروج', label_en: 'Logout' },
];

export default function SystemSettingsPage() {
  const { isRTL = true, isDark, toggleTheme, toggleLanguage } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[isRTL ? 'ar' : 'en'];
  
  // States
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSwitchUserSheet, setShowSwitchUserSheet] = useState(false);
  const [showTermsPreview, setShowTermsPreview] = useState(false);
  const [showPrivacyPreview, setShowPrivacyPreview] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);
  const [showPasswordOld, setShowPasswordOld] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  
  // Account settings
  const [accountForm, setAccountForm] = useState({
    full_name: user?.full_name || 'مدير المنصة',
    email: user?.email || 'admin@nassaq.com',
    phone: user?.phone || '+966 50 000 0000',
    preferred_language: user?.preferred_language || 'ar',
    avatar_url: user?.avatar_url || '',
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    platformNameAr: 'نَسَّق | NASSAQ',
    platformNameEn: 'NASSAQ',
    browserTitle: 'نَسَّق - نظام إدارة المدارس',
    defaultLanguage: 'ar',
    dateSystem: 'hijri_gregorian',
    timezone: 'Asia/Riyadh',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    aiEnabled: true,
    autoRegistration: false,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecials: true,
  });
  
  // Brand settings
  const [brandSettings, setBrandSettings] = useState({
    logoUrl: '/nassaq-logo.png',
    faviconUrl: '/favicon.ico',
    primaryColor: '#2563eb',
    secondaryColor: '#16a34a',
    accentColor: '#f59e0b',
  });
  
  // Terms & Privacy
  const [termsContent, setTermsContent] = useState(`# شروط وأحكام منصة نَسَّق

## 1. مقدمة
مرحباً بكم في منصة نَسَّق لإدارة المدارس...

## 2. تعريفات
- "المنصة": تشير إلى منصة نَسَّق
- "المستخدم": أي شخص يستخدم المنصة

## 3. الاستخدام المقبول
...`);

  const [privacyContent, setPrivacyContent] = useState(`# سياسة الخصوصية لمنصة نَسَّق

## 1. المعلومات التي نجمعها
نقوم بجمع المعلومات التالية...

## 2. كيف نستخدم معلوماتك
...`);
  
  // Contact info
  const [contactInfo, setContactInfo] = useState({
    primaryEmail: 'info@nassaqapp.com',
    primaryPhone: '+966 11 000 0000',
    altPhone: '+966 11 000 0001',
    address: 'الرياض، المملكة العربية السعودية',
    websiteUrl: 'https://nassaqapp.com',
    supportUrl: 'https://support.nassaqapp.com',
    workingHours: 'الأحد - الخميس: 8 ص - 5 م',
    ownerName: 'شركة نَسَّق للتقنية',
    twitter: '@nassaqapp',
    facebook: 'nassaqapp',
    linkedin: 'nassaqapp',
    instagram: 'nassaqapp',
  });
  
  // Format date
  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle save
  const handleSave = async (section) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t.savedSuccessfully);
    } catch (error) {
      toast.error(isRTL ? 'فشل الحفظ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < generalSettings.passwordMinLength) {
      toast.error(isRTL ? 'كلمة المرور قصيرة جداً' : 'Password too short');
      return;
    }
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(t.passwordChanged);
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(isRTL ? 'فشل تغيير كلمة المرور' : 'Password change failed');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle logout
  const handleLogout = async (type) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (type === 'all') {
        toast.success(isRTL ? 'تم تسجيل الخروج من جميع الأجهزة' : 'Logged out from all devices');
      } else if (type === 'others') {
        setSessions(sessions.filter(s => s.isCurrent));
        toast.success(isRTL ? 'تم إنهاء الجلسات الأخرى' : 'Other sessions ended');
      } else {
        logout();
        navigate('/login');
      }
      setShowLogoutDialog(false);
    } catch (error) {
      toast.error(isRTL ? 'فشلت العملية' : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };
  
  // End single session
  const handleEndSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success(t.sessionEnded);
  };
  
  // Publish terms/privacy version
  const handlePublishVersion = (type) => {
    toast.success(t.versionPublished);
    setShowPublishDialog(false);
  };
  
  // Handle image upload
  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'avatar') {
          setAccountForm({ ...accountForm, avatar_url: reader.result });
        } else if (type === 'logo') {
          setBrandSettings({ ...brandSettings, logoUrl: reader.result });
        }
        toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded');
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'} data-testid="system-settings-page">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <PageHeader 
                title={t.pageTitle} 
                subtitle={t.pageSubtitle}
                icon={Settings}
                className="mb-0"
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                  <Globe className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <Card className="w-64 h-fit sticky top-24">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {SETTINGS_NAV.map(item => {
                    const NavIcon = item.icon;
                    const isActive = activeSection === item.id;
                    const isLogout = item.id === 'logout';
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isLogout) {
                            setShowLogoutDialog(true);
                          } else {
                            setActiveSection(item.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                          isActive 
                            ? 'bg-brand-navy text-white' 
                            : isLogout
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <NavIcon className="h-5 w-5" />
                        <span className="font-medium">{isRTL ? item.label_ar : item.label_en}</span>
                        {isActive && <ChevronRight className="h-4 w-4 ms-auto rtl:rotate-180" />}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
            
            {/* Content Area */}
            <div className="flex-1 space-y-6">
              {/* Account Settings */}
              {activeSection === 'account' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-brand-navy" />
                      {t.accountSettings}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'إدارة بيانات حسابك الشخصي' : 'Manage your personal account information'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={accountForm.avatar_url} />
                        <AvatarFallback className="bg-brand-navy text-white text-2xl">
                          {accountForm.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{accountForm.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{accountForm.email}</p>
                        <div className="flex gap-2 mt-3">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, 'avatar')}
                            />
                            <Button variant="outline" size="sm" className="rounded-xl" asChild>
                              <span><Camera className="h-4 w-4 me-2" />{t.uploadImage}</span>
                            </Button>
                          </label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setShowPasswordDialog(true)}
                          >
                            <Key className="h-4 w-4 me-2" />
                            {t.changePassword}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>{t.name}</Label>
                        <Input
                          value={accountForm.full_name}
                          onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.email}</Label>
                        <Input
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.phone}</Label>
                        <Input
                          value={accountForm.phone}
                          onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.language}</Label>
                        <Select 
                          value={accountForm.preferred_language} 
                          onValueChange={(v) => setAccountForm({ ...accountForm, preferred_language: v })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">{t.arabic}</SelectItem>
                            <SelectItem value="en">{t.english}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleSave('account')} 
                        disabled={saving}
                        className="bg-brand-navy rounded-xl"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                        {t.save}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* General Settings */}
              {activeSection === 'general' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-brand-navy" />
                      {t.generalSettings}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Platform Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>{t.platformNameAr}</Label>
                        <Input
                          value={generalSettings.platformNameAr}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, platformNameAr: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.platformNameEn}</Label>
                        <Input
                          value={generalSettings.platformNameEn}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, platformNameEn: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.defaultLanguage}</Label>
                        <Select 
                          value={generalSettings.defaultLanguage} 
                          onValueChange={(v) => setGeneralSettings({ ...generalSettings, defaultLanguage: v })}
                        >
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">{t.arabic}</SelectItem>
                            <SelectItem value="en">{t.english}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.dateSystem}</Label>
                        <Select 
                          value={generalSettings.dateSystem} 
                          onValueChange={(v) => setGeneralSettings({ ...generalSettings, dateSystem: v })}
                        >
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hijri">{t.hijri}</SelectItem>
                            <SelectItem value="gregorian">{t.gregorian}</SelectItem>
                            <SelectItem value="hijri_gregorian">{t.both}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.timezone}</Label>
                        <Select 
                          value={generalSettings.timezone} 
                          onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}
                        >
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Riyadh">{isRTL ? 'الرياض' : 'Riyadh'} (GMT+3)</SelectItem>
                            <SelectItem value="Asia/Dubai">{isRTL ? 'دبي' : 'Dubai'} (GMT+4)</SelectItem>
                            <SelectItem value="Asia/Kuwait">{isRTL ? 'الكويت' : 'Kuwait'} (GMT+3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        {t.notificationSettings}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{t.emailNotifications}</span>
                          </div>
                          <Switch
                            checked={generalSettings.emailNotifications}
                            onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, emailNotifications: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{t.smsNotifications}</span>
                          </div>
                          <Switch
                            checked={generalSettings.smsNotifications}
                            onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, smsNotifications: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{t.pushNotifications}</span>
                          </div>
                          <Switch
                            checked={generalSettings.pushNotifications}
                            onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, pushNotifications: v })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Password Policy */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        {t.passwordPolicy}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.minLength}</Label>
                          <Input
                            type="number"
                            value={generalSettings.passwordMinLength}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, passwordMinLength: parseInt(e.target.value) })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <span className="text-sm">{t.requireUppercase}</span>
                          <Switch
                            checked={generalSettings.requireUppercase}
                            onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, requireUppercase: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <span className="text-sm">{t.requireNumbers}</span>
                          <Switch
                            checked={generalSettings.requireNumbers}
                            onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, requireNumbers: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <span className="text-sm">{t.requireSpecials}</span>
                          <Switch
                            checked={generalSettings.requireSpecials}
                            onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, requireSpecials: v })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => handleSave('general')} disabled={saving} className="bg-brand-navy rounded-xl">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                        {t.save}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Brand & Identity */}
              {activeSection === 'brand' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-brand-navy" />
                      {t.brandIdentity}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                        <img src={brandSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-medium">{isRTL ? 'شعار المنصة' : 'Platform Logo'}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isRTL ? 'PNG أو SVG، 512x512 بكسل' : 'PNG or SVG, 512x512px'}
                        </p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                          />
                          <Button variant="outline" size="sm" className="rounded-xl" asChild>
                            <span><Upload className="h-4 w-4 me-2" />{t.uploadImage}</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Platform Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>{t.platformNameAr}</Label>
                        <Input
                          value={generalSettings.platformNameAr}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, platformNameAr: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.platformNameEn}</Label>
                        <Input
                          value={generalSettings.platformNameEn}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, platformNameEn: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t.browserTitle}</Label>
                        <Input
                          value={generalSettings.platformNameAr}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Language Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        {isRTL ? 'إعدادات اللغة' : 'Language Settings'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant={accountForm.preferred_language === 'ar' ? 'default' : 'outline'}
                          className={`h-20 flex-col rounded-xl ${accountForm.preferred_language === 'ar' ? 'bg-brand-navy' : ''}`}
                          onClick={() => setAccountForm({ ...accountForm, preferred_language: 'ar' })}
                        >
                          <span className="text-2xl mb-1">🇸🇦</span>
                          {t.arabic}
                        </Button>
                        <Button
                          variant={accountForm.preferred_language === 'en' ? 'default' : 'outline'}
                          className={`h-20 flex-col rounded-xl ${accountForm.preferred_language === 'en' ? 'bg-brand-navy' : ''}`}
                          onClick={() => setAccountForm({ ...accountForm, preferred_language: 'en' })}
                        >
                          <span className="text-2xl mb-1">🇺🇸</span>
                          {t.english}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => handleSave('brand')} disabled={saving} className="bg-brand-navy rounded-xl">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                        {t.save}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Terms & Conditions */}
              {activeSection === 'terms' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-brand-navy" />
                          {t.termsConditions}
                        </CardTitle>
                        <CardDescription>
                          {isRTL ? 'إدارة شروط وأحكام استخدام المنصة' : 'Manage platform terms and conditions'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowTermsPreview(true)}>
                          <Eye className="h-4 w-4 me-1" />
                          {t.previewTerms}
                        </Button>
                        <Button size="sm" className="rounded-xl bg-brand-navy" onClick={() => setShowPublishDialog(true)}>
                          <Check className="h-4 w-4 me-1" />
                          {t.publishVersion}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Version Info */}
                    <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{isRTL ? 'النسخة الحالية:' : 'Current Version:'} 2.1</p>
                        <p className="text-sm text-green-700">{isRTL ? 'تاريخ النشر:' : 'Published:'} 1 مارس 2026</p>
                      </div>
                    </div>
                    
                    {/* Editor */}
                    <div className="space-y-2">
                      <Label>{isRTL ? 'محتوى الشروط والأحكام' : 'Terms Content'}</Label>
                      <Textarea
                        value={termsContent}
                        onChange={(e) => setTermsContent(e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    {/* Archived Versions */}
                    <div className="space-y-3">
                      <h4 className="font-medium">{t.archiveVersions}</h4>
                      <div className="space-y-2">
                        {TERMS_VERSIONS.map(version => (
                          <div key={version.version} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                                v{version.version}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{version.date}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {version.status === 'archived' && (
                                <Button variant="ghost" size="sm">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => handleSave('terms')} disabled={saving} className="bg-brand-navy rounded-xl">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                        {t.save}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Privacy Policy */}
              {activeSection === 'privacy' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-brand-navy" />
                          {t.privacyPolicy}
                        </CardTitle>
                        <CardDescription>
                          {isRTL ? 'إدارة سياسة خصوصية المنصة' : 'Manage platform privacy policy'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowPrivacyPreview(true)}>
                          <Eye className="h-4 w-4 me-1" />
                          {t.previewTerms}
                        </Button>
                        <Button size="sm" className="rounded-xl bg-brand-navy" onClick={() => setShowPublishDialog(true)}>
                          <Check className="h-4 w-4 me-1" />
                          {t.publishVersion}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'محتوى سياسة الخصوصية' : 'Privacy Policy Content'}</Label>
                      <Textarea
                        value={privacyContent}
                        onChange={(e) => setPrivacyContent(e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => handleSave('privacy')} disabled={saving} className="bg-brand-navy rounded-xl">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                        {t.save}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Contact Info */}
              {activeSection === 'contact' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-brand-navy" />
                      {t.contactInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>{t.primaryEmail}</Label>
                        <Input
                          value={contactInfo.primaryEmail}
                          onChange={(e) => setContactInfo({ ...contactInfo, primaryEmail: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.primaryPhone}</Label>
                        <Input
                          value={contactInfo.primaryPhone}
                          onChange={(e) => setContactInfo({ ...contactInfo, primaryPhone: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.altPhone}</Label>
                        <Input
                          value={contactInfo.altPhone}
                          onChange={(e) => setContactInfo({ ...contactInfo, altPhone: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.websiteUrl}</Label>
                        <Input
                          value={contactInfo.websiteUrl}
                          onChange={(e) => setContactInfo({ ...contactInfo, websiteUrl: e.target.value })}
                          className="rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t.officeAddress}</Label>
                        <Textarea
                          value={contactInfo.address}
                          onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                          className="rounded-xl"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.workingHours}</Label>
                        <Input
                          value={contactInfo.workingHours}
                          onChange={(e) => setContactInfo({ ...contactInfo, workingHours: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.ownerName}</Label>
                        <Input
                          value={contactInfo.ownerName}
                          onChange={(e) => setContactInfo({ ...contactInfo, ownerName: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Social Media */}
                    <div className="space-y-4">
                      <h4 className="font-medium">{t.socialMedia}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.twitter}</Label>
                          <Input
                            value={contactInfo.twitter}
                            onChange={(e) => setContactInfo({ ...contactInfo, twitter: e.target.value })}
                            className="rounded-xl"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.facebook}</Label>
                          <Input
                            value={contactInfo.facebook}
                            onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                            className="rounded-xl"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.linkedin}</Label>
                          <Input
                            value={contactInfo.linkedin}
                            onChange={(e) => setContactInfo({ ...contactInfo, linkedin: e.target.value })}
                            className="rounded-xl"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.instagram}</Label>
                          <Input
                            value={contactInfo.instagram}
                            onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                            className="rounded-xl"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => handleSave('contact')} disabled={saving} className="bg-brand-navy rounded-xl">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                        {t.save}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Security & Sessions */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  {/* Active Sessions */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-brand-navy" />
                            {t.activeSessions}
                          </CardTitle>
                          <CardDescription>
                            {isRTL ? 'الجلسات النشطة حالياً' : 'Currently active sessions'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => handleLogout('others')}
                          >
                            {t.endOtherSessions}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => handleLogout('all')}
                          >
                            {t.endAllSessions}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sessions.map(session => (
                          <div 
                            key={session.id} 
                            className={`p-4 rounded-xl border ${session.isCurrent ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.isCurrent ? 'bg-green-100' : 'bg-muted'}`}>
                                  {session.device.includes('iPhone') || session.device.includes('Android') 
                                    ? <Smartphone className="h-6 w-6 text-muted-foreground" />
                                    : <Monitor className="h-6 w-6 text-muted-foreground" />
                                  }
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{session.device}</p>
                                    {session.isCurrent && (
                                      <Badge className="bg-green-500">{t.currentSession}</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{session.browser}</p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {session.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDateTime(session.lastActivity)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {!session.isCurrent && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleEndSession(session.id)}
                                >
                                  <XCircle className="h-4 w-4 me-1" />
                                  {t.endSession}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Security Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-brand-navy" />
                        {isRTL ? 'إعدادات الأمان' : 'Security Settings'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Key className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{t.twoFactorAuth}</p>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? 'طبقة حماية إضافية' : 'Extra layer of security'}
                            </p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{t.deviceRestrictions}</p>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? 'تقييد الأجهزة المسموحة' : 'Restrict allowed devices'}
                            </p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        <Key className="h-4 w-4 me-2" />
                        {t.changePassword}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Switch User */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-brand-navy" />
                        {t.switchUser}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {isRTL 
                          ? 'يتيح لك هذا الخيار الدخول مؤقتاً إلى حساب مستخدم آخر'
                          : 'This option allows you to temporarily access another user account'}
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl"
                        onClick={() => setShowSwitchUserSheet(true)}
                      >
                        <UserCog className="h-4 w-4 me-2" />
                        {t.switchUser}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
        
        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-brand-navy" />
                {t.changePassword}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t.currentPassword}</Label>
                <div className="relative">
                  <Input
                    type={showPasswordOld ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="rounded-xl pe-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute end-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPasswordOld(!showPasswordOld)}
                  >
                    {showPasswordOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.newPassword}</Label>
                <div className="relative">
                  <Input
                    type={showPasswordNew ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="rounded-xl pe-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute end-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPasswordNew(!showPasswordNew)}
                  >
                    {showPasswordNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.confirmPassword}</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                {t.cancel}
              </Button>
              <Button 
                onClick={handlePasswordChange} 
                disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="bg-brand-navy"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Logout Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-red-600" />
                {t.logout}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'اختر طريقة تسجيل الخروج' : 'Choose logout method'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-xl"
                onClick={() => handleLogout('current')}
              >
                <LogOut className="h-4 w-4 me-2" />
                {isRTL ? 'تسجيل خروج عادي' : 'Normal Logout'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-xl"
                onClick={() => handleLogout('all')}
              >
                <Monitor className="h-4 w-4 me-2" />
                {isRTL ? 'تسجيل خروج من جميع الأجهزة' : 'Logout from All Devices'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-xl"
                onClick={() => handleLogout('others')}
              >
                <Smartphone className="h-4 w-4 me-2" />
                {t.endOtherSessions}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                {t.cancel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Switch User Sheet */}
        <Sheet open={showSwitchUserSheet} onOpenChange={setShowSwitchUserSheet}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-brand-navy" />
                {t.switchUser}
              </SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">{isRTL ? 'تنبيه' : 'Warning'}</p>
                    <p className="text-sm text-yellow-700">
                      {isRTL 
                        ? 'سيتم تسجيل هذه العملية في سجل التدقيق'
                        : 'This action will be logged in the audit log'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{isRTL ? 'اختر المستخدم' : 'Select User'}</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={isRTL ? 'اختر مستخدم...' : 'Select user...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">{isRTL ? 'أحمد محمد - معلم' : 'Ahmed Mohammed - Teacher'}</SelectItem>
                    <SelectItem value="user2">{isRTL ? 'سارة أحمد - مديرة مدرسة' : 'Sara Ahmed - Principal'}</SelectItem>
                    <SelectItem value="user3">{isRTL ? 'محمد علي - مشرف' : 'Mohammed Ali - Supervisor'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full bg-brand-navy rounded-xl">
                <UserCog className="h-4 w-4 me-2" />
                {t.switchUser}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Publish Version Dialog */}
        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                {t.publishVersion}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'هل تريد نشر النسخة الجديدة؟ سيتم أرشفة النسخة السابقة.'
                  : 'Do you want to publish the new version? The previous version will be archived.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                {t.cancel}
              </Button>
              <Button onClick={() => handlePublishVersion('terms')} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 me-2" />
                {t.publishVersion}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
