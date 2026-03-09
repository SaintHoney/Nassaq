import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
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
  SheetDescription,
} from '../components/ui/sheet';
import {
  Link2,
  Plus,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Power,
  PowerOff,
  FileText,
  Upload,
  Download,
  Key,
  Globe,
  Server,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Cloud,
  Brain,
  Shield,
  Building2,
  Webhook,
  FileJson,
  Activity,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Zap,
  PlugZap,
  Unplug,
  ArrowUpDown,
  History,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Smartphone,
  Share2,
  Lock,
  Unlock,
  FileCode,
  Terminal,
  Hash,
  LinkIcon,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Translations
const translations = {
  ar: {
    pageTitle: 'التكاملات',
    pageSubtitle: 'إدارة التكاملات والربط مع الأنظمة الخارجية وواجهات البرمجة',
    integrations: 'التكاملات',
    apiManagement: 'إدارة API',
    all: 'الكل',
    government: 'حكومية',
    payment: 'مدفوعات',
    sms: 'رسائل SMS',
    messaging: 'المراسلة',
    email: 'بريد إلكتروني',
    storage: 'تخزين',
    ai: 'ذكاء اصطناعي',
    other: 'أخرى',
    addIntegration: 'إضافة تكامل',
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الإعداد',
    error: 'خطأ',
    notConfigured: 'غير مهيأ',
    lastSync: 'آخر مزامنة',
    testConnection: 'اختبار الاتصال',
    sync: 'مزامنة',
    edit: 'تعديل',
    delete: 'حذف',
    enable: 'تفعيل',
    disable: 'تعطيل',
    viewLogs: 'عرض السجلات',
    setupIntegration: 'إعداد التكامل',
    viewDetails: 'عرض التفاصيل',
    integrationName: 'اسم التكامل',
    integrationType: 'نوع التكامل',
    description: 'الوصف',
    apiUrl: 'رابط API',
    apiKey: 'مفتاح API',
    secretKey: 'المفتاح السري',
    webhookUrl: 'رابط Webhook',
    save: 'حفظ',
    cancel: 'إلغاء',
    noIntegrations: 'لا توجد تكاملات',
    connectionSuccess: 'تم الاتصال بنجاح',
    connectionFailed: 'فشل الاتصال',
    syncSuccess: 'تمت المزامنة بنجاح',
    totalIntegrations: 'إجمالي التكاملات',
    activeIntegrations: 'تكاملات نشطة',
    pendingIntegrations: 'قيد الإعداد',
    errorIntegrations: 'بها أخطاء',
    search: 'بحث...',
    logs: 'السجلات',
    settings: 'الإعدادات',
    endpoints: 'نقاط الاتصال',
    webhooks: 'Webhooks',
    copy: 'نسخ',
    copied: 'تم النسخ',
    copyAll: 'نسخ جميع البيانات',
    shareTemplate: 'قالب المشاركة',
    generateNewKey: 'إنشاء مفتاح جديد',
    revokeKey: 'إلغاء المفتاح',
    apiKeys: 'مفاتيح API',
    nassaqApi: 'واجهة برمجة نسق',
    documentation: 'التوثيق',
    baseUrl: 'الرابط الأساسي',
    createdAt: 'تاريخ الإنشاء',
    lastUsed: 'آخر استخدام',
    permissions: 'الصلاحيات',
    readOnly: 'قراءة فقط',
    readWrite: 'قراءة وكتابة',
    fullAccess: 'وصول كامل',
  },
  en: {
    pageTitle: 'Integrations',
    pageSubtitle: 'Manage integrations and API connections',
    integrations: 'Integrations',
    apiManagement: 'API Management',
    all: 'All',
    government: 'Government',
    payment: 'Payment',
    sms: 'SMS',
    messaging: 'Messaging',
    email: 'Email',
    storage: 'Storage',
    ai: 'AI',
    other: 'Other',
    addIntegration: 'Add Integration',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    error: 'Error',
    notConfigured: 'Not Configured',
    lastSync: 'Last Sync',
    testConnection: 'Test Connection',
    sync: 'Sync',
    edit: 'Edit',
    delete: 'Delete',
    enable: 'Enable',
    disable: 'Disable',
    viewLogs: 'View Logs',
    setupIntegration: 'Setup',
    viewDetails: 'View Details',
    integrationName: 'Integration Name',
    integrationType: 'Integration Type',
    description: 'Description',
    apiUrl: 'API URL',
    apiKey: 'API Key',
    secretKey: 'Secret Key',
    webhookUrl: 'Webhook URL',
    save: 'Save',
    cancel: 'Cancel',
    noIntegrations: 'No integrations',
    connectionSuccess: 'Connection successful',
    connectionFailed: 'Connection failed',
    syncSuccess: 'Sync completed',
    totalIntegrations: 'Total Integrations',
    activeIntegrations: 'Active',
    pendingIntegrations: 'Pending',
    errorIntegrations: 'With Errors',
    search: 'Search...',
    logs: 'Logs',
    settings: 'Settings',
    endpoints: 'Endpoints',
    webhooks: 'Webhooks',
    copy: 'Copy',
    copied: 'Copied',
    copyAll: 'Copy All',
    shareTemplate: 'Share Template',
    generateNewKey: 'Generate New Key',
    revokeKey: 'Revoke Key',
    apiKeys: 'API Keys',
    nassaqApi: 'NASSAQ API',
    documentation: 'Documentation',
    baseUrl: 'Base URL',
    createdAt: 'Created At',
    lastUsed: 'Last Used',
    permissions: 'Permissions',
    readOnly: 'Read Only',
    readWrite: 'Read/Write',
    fullAccess: 'Full Access',
  }
};

// Integration types with icons and colors
const INTEGRATION_TYPES = [
  { id: 'government', icon: Building2, color: 'from-blue-500 to-blue-600', label_ar: 'حكومية', label_en: 'Government' },
  { id: 'payment', icon: CreditCard, color: 'from-green-500 to-green-600', label_ar: 'مدفوعات', label_en: 'Payment' },
  { id: 'messaging', icon: Smartphone, color: 'from-emerald-500 to-emerald-600', label_ar: 'المراسلة', label_en: 'Messaging' },
  { id: 'sms', icon: MessageSquare, color: 'from-purple-500 to-purple-600', label_ar: 'رسائل SMS', label_en: 'SMS' },
  { id: 'email', icon: Mail, color: 'from-orange-500 to-orange-600', label_ar: 'بريد إلكتروني', label_en: 'Email' },
  { id: 'storage', icon: Cloud, color: 'from-cyan-500 to-cyan-600', label_ar: 'تخزين', label_en: 'Storage' },
  { id: 'ai', icon: Brain, color: 'from-pink-500 to-pink-600', label_ar: 'ذكاء اصطناعي', label_en: 'AI' },
  { id: 'other', icon: PlugZap, color: 'from-gray-500 to-gray-600', label_ar: 'أخرى', label_en: 'Other' },
];

// Premium Integration Cards Data
const PREMIUM_INTEGRATIONS = [
  {
    id: 'noor',
    name: 'نظام نور',
    name_en: 'Noor System',
    type: 'government',
    description: 'الربط مع نظام نور التعليمي لمزامنة بيانات الطلاب والمعلمين',
    description_en: 'Integration with Noor educational system for student and teacher data sync',
    logo: '🏛️',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T10:30:00Z',
    api_base_url: 'https://noor.moe.gov.sa/api',
    features: ['مزامنة الطلاب', 'مزامنة المعلمين', 'الدرجات', 'الحضور'],
  },
  {
    id: 'whatsapp',
    name: 'واتساب',
    name_en: 'WhatsApp',
    type: 'messaging',
    description: 'إرسال الإشعارات والرسائل عبر واتساب للطلاب وأولياء الأمور',
    description_en: 'Send notifications via WhatsApp to students and parents',
    logo: '💬',
    status: 'pending',
    is_active: false,
    last_sync: null,
    api_base_url: 'https://api.whatsapp.com/v1',
    features: ['إشعارات', 'تقارير', 'تذكيرات', 'دعم'],
  },
  {
    id: 'stripe',
    name: 'بوابة الدفع',
    name_en: 'Payment Gateway',
    type: 'payment',
    description: 'معالجة المدفوعات والرسوم الدراسية إلكترونياً',
    description_en: 'Process payments and tuition fees electronically',
    logo: '💳',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T08:00:00Z',
    api_base_url: 'https://api.stripe.com/v1',
    features: ['الرسوم', 'الفواتير', 'الاشتراكات', 'التقارير المالية'],
  },
  {
    id: 'sms',
    name: 'بوابة الرسائل',
    name_en: 'SMS Gateway',
    type: 'sms',
    description: 'إرسال الرسائل النصية القصيرة للتواصل مع المستخدمين',
    description_en: 'Send SMS messages for user communication',
    logo: '📱',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T09:15:00Z',
    api_base_url: 'https://api.unifonic.com/rest',
    features: ['إشعارات', 'تذكيرات', 'OTP', 'حملات'],
  },
  {
    id: 'openai',
    name: 'الذكاء الاصطناعي',
    name_en: 'AI Integration',
    type: 'ai',
    description: 'تكامل مع OpenAI و Google AI لتحليل البيانات والمساعد الذكي',
    description_en: 'Integration with OpenAI and Google AI for data analysis',
    logo: '🤖',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T10:00:00Z',
    api_base_url: 'https://api.openai.com/v1',
    features: ['تحليل البيانات', 'التقارير الذكية', 'المساعد الافتراضي', 'التوصيات'],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    name_en: 'SendGrid',
    type: 'email',
    description: 'إرسال البريد الإلكتروني للإشعارات والتقارير',
    description_en: 'Send email notifications and reports',
    logo: '📧',
    status: 'error',
    is_active: false,
    last_sync: '2026-03-08T22:00:00Z',
    api_base_url: 'https://api.sendgrid.com/v3',
    features: ['إشعارات', 'تقارير', 'نشرات', 'قوالب'],
  },
  {
    id: 's3',
    name: 'Amazon S3',
    name_en: 'Amazon S3',
    type: 'storage',
    description: 'تخزين الملفات والمستندات في السحابة بشكل آمن',
    description_en: 'Secure cloud storage for files and documents',
    logo: '☁️',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T07:30:00Z',
    api_base_url: 'https://s3.amazonaws.com',
    features: ['الملفات', 'الصور', 'المستندات', 'النسخ الاحتياطي'],
  },
];

// NASSAQ API Keys
const NASSAQ_API_KEYS = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'nsk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
    secret: 'nss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    permissions: 'full_access',
    created_at: '2026-01-15T08:00:00Z',
    last_used: '2026-03-09T10:30:00Z',
    is_active: true,
  },
  {
    id: '2',
    name: 'Testing API Key',
    key: 'nsk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
    secret: 'nss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    permissions: 'read_write',
    created_at: '2026-02-01T10:00:00Z',
    last_used: '2026-03-08T14:00:00Z',
    is_active: true,
  },
  {
    id: '3',
    name: 'Read Only Key',
    key: 'nsk_ro_xxxxxxxxxxxxxxxxxxxxxxxxx',
    secret: 'nss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    permissions: 'read_only',
    created_at: '2026-03-01T12:00:00Z',
    last_used: null,
    is_active: false,
  },
];

// NASSAQ API Endpoints
const NASSAQ_ENDPOINTS = [
  { path: '/api/students', method: 'GET', description: 'قائمة الطلاب' },
  { path: '/api/students/{id}', method: 'GET', description: 'تفاصيل طالب' },
  { path: '/api/teachers', method: 'GET', description: 'قائمة المعلمين' },
  { path: '/api/schools', method: 'GET', description: 'قائمة المدارس' },
  { path: '/api/attendance', method: 'POST', description: 'تسجيل الحضور' },
  { path: '/api/grades', method: 'POST', description: 'إدخال الدرجات' },
  { path: '/api/reports', method: 'GET', description: 'التقارير' },
  { path: '/api/webhooks', method: 'POST', description: 'Webhooks' },
];

export default function IntegrationsPage() {
  const { isRTL = true, isDark } = useTheme();
  const navigate = useNavigate();
  const t = translations[isRTL ? 'ar' : 'en'];
  
  // States
  const [integrations, setIntegrations] = useState(PREMIUM_INTEGRATIONS);
  const [apiKeys, setApiKeys] = useState(NASSAQ_API_KEYS);
  const [loading, setLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('integrations');
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showLogsSheet, setShowLogsSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [testingConnection, setTestingConnection] = useState(null);
  const [syncing, setSyncing] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    type: 'other',
    description: '',
    description_en: '',
    api_base_url: '',
    api_key: '',
    secret_key: '',
    webhook_url: '',
  });
  
  // New key form
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    permissions: 'read_only',
  });
  
  // Sample logs
  const [logs, setLogs] = useState([
    { id: 1, action: 'sync', status: 'success', timestamp: '2026-03-09T10:30:00Z', details: 'تمت مزامنة 150 سجل' },
    { id: 2, action: 'test', status: 'success', timestamp: '2026-03-09T10:00:00Z', details: 'اتصال ناجح' },
    { id: 3, action: 'sync', status: 'failed', timestamp: '2026-03-08T22:00:00Z', details: 'خطأ في المصادقة' },
    { id: 4, action: 'webhook', status: 'success', timestamp: '2026-03-08T18:30:00Z', details: 'تم استلام حدث' },
  ]);
  
  // API instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Format date
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { label: isRTL ? 'نشط' : 'Active', color: 'bg-green-500', icon: CheckCircle2 };
      case 'inactive':
        return { label: isRTL ? 'غير نشط' : 'Inactive', color: 'bg-gray-500', icon: PowerOff };
      case 'pending':
        return { label: isRTL ? 'قيد الإعداد' : 'Pending', color: 'bg-yellow-500', icon: Clock };
      case 'error':
        return { label: isRTL ? 'خطأ' : 'Error', color: 'bg-red-500', icon: XCircle };
      case 'not_configured':
        return { label: isRTL ? 'غير مهيأ' : 'Not Configured', color: 'bg-slate-500', icon: Settings };
      default:
        return { label: status, color: 'bg-gray-500', icon: AlertTriangle };
    }
  };
  
  // Get type info
  const getTypeInfo = (type) => {
    return INTEGRATION_TYPES.find(t => t.id === type) || INTEGRATION_TYPES[INTEGRATION_TYPES.length - 1];
  };
  
  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesTab = activeTypeTab === 'all' || integration.type === activeTypeTab;
    const matchesSearch = !searchQuery || 
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (integration.name_en && integration.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });
  
  // Stats
  const stats = {
    total: integrations.length,
    active: integrations.filter(i => i.status === 'active').length,
    pending: integrations.filter(i => i.status === 'pending').length,
    error: integrations.filter(i => i.status === 'error').length,
  };
  
  // Copy to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success(t.copied);
    } catch (err) {
      toast.error(isRTL ? 'فشل النسخ' : 'Copy failed');
    }
  };
  
  // Generate share template
  const generateShareTemplate = () => {
    const baseUrl = `${API_URL}/api`;
    return `تم إنشاء بيانات التكامل الخاصة بمنصة نَسَّق | NASSAQ.
يمكنكم استخدام البيانات التالية للاتصال بالنظام:

Base API URL:
${baseUrl}

API Key:
nsk_live_xxxxxxxxxxxxxxxxxxxxxxxx

Secret Key:
nss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Documentation:
${API_URL}/docs

Webhook Endpoint:
${baseUrl}/webhooks

مع تحيات
إدارة منصة نَسَّق`;
  };
  
  // Test connection
  const handleTestConnection = async (integration) => {
    setTestingConnection(integration.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(t.connectionSuccess);
    } catch (error) {
      toast.error(t.connectionFailed);
    } finally {
      setTestingConnection(null);
    }
  };
  
  // Sync
  const handleSync = async (integration) => {
    setSyncing(integration.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t.syncSuccess);
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id 
          ? { ...i, last_sync: new Date().toISOString() }
          : i
      ));
    } catch (error) {
      toast.error(isRTL ? 'فشلت المزامنة' : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };
  
  // Toggle integration
  const handleToggle = async (integration) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integration.id 
        ? { ...i, is_active: !i.is_active, status: !i.is_active ? 'active' : 'inactive' }
        : i
    ));
    toast.success(integration.is_active 
      ? (isRTL ? 'تم تعطيل التكامل' : 'Integration disabled')
      : (isRTL ? 'تم تفعيل التكامل' : 'Integration enabled')
    );
  };
  
  // Generate new API key
  const handleGenerateKey = () => {
    const newKey = {
      id: String(apiKeys.length + 1),
      name: newKeyForm.name,
      key: `nsk_${newKeyForm.permissions === 'read_only' ? 'ro' : newKeyForm.permissions === 'read_write' ? 'rw' : 'live'}_${'x'.repeat(24)}`,
      secret: `nss_${'x'.repeat(32)}`,
      permissions: newKeyForm.permissions,
      created_at: new Date().toISOString(),
      last_used: null,
      is_active: true,
    };
    setApiKeys(prev => [...prev, newKey]);
    setShowNewKeyDialog(false);
    setNewKeyForm({ name: '', permissions: 'read_only' });
    toast.success(isRTL ? 'تم إنشاء المفتاح بنجاح' : 'Key generated successfully');
  };
  
  // Revoke API key
  const handleRevokeKey = (keyId) => {
    setApiKeys(prev => prev.map(k => 
      k.id === keyId ? { ...k, is_active: false } : k
    ));
    toast.success(isRTL ? 'تم إلغاء المفتاح' : 'Key revoked');
  };
  
  // Open details
  const openDetails = (integration) => {
    setSelectedIntegration(integration);
    setShowDetailsSheet(true);
  };
  
  // Open logs
  const openLogs = (integration) => {
    setSelectedIntegration(integration);
    setShowLogsSheet(true);
  };
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'} data-testid="integrations-page">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <PageHeader 
                title={t.pageTitle} 
                subtitle={t.pageSubtitle}
                icon={Link2}
                className="mb-0"
              />
              <Button 
                className="rounded-xl bg-brand-navy hover:bg-brand-navy/90"
                onClick={() => setShowAddDialog(true)}
                data-testid="add-integration-btn"
              >
                <Plus className="h-4 w-4 me-2" />
                {t.addIntegration}
              </Button>
            </div>
            
            {/* Main Tabs */}
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="mb-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <PlugZap className="h-4 w-4" />
                  {t.integrations}
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {t.apiManagement}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-6">
          {activeMainTab === 'integrations' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.totalIntegrations}</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                      </div>
                      <Link2 className="h-10 w-10 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.activeIntegrations}</p>
                        <p className="text-3xl font-bold">{stats.active}</p>
                      </div>
                      <CheckCircle2 className="h-10 w-10 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.pendingIntegrations}</p>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                      </div>
                      <Clock className="h-10 w-10 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{t.errorIntegrations}</p>
                        <p className="text-3xl font-bold">{stats.error}</p>
                      </div>
                      <XCircle className="h-10 w-10 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Type Filter Tabs */}
              <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab} className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="flex-wrap h-auto p-1">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      {t.all} ({integrations.length})
                    </TabsTrigger>
                    {INTEGRATION_TYPES.map(type => {
                      const count = integrations.filter(i => i.type === type.id).length;
                      const TypeIcon = type.icon;
                      return (
                        <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          {isRTL ? type.label_ar : type.label_en} ({count})
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  <div className="relative w-64">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-10 rounded-xl"
                      data-testid="search-input"
                    />
                  </div>
                </div>
                
                <TabsContent value={activeTypeTab} className="mt-0">
                  {/* Premium Integration Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredIntegrations.map(integration => {
                      const typeInfo = getTypeInfo(integration.type);
                      const statusInfo = getStatusInfo(integration.status);
                      const TypeIcon = typeInfo.icon;
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <Card 
                          key={integration.id} 
                          className="group relative overflow-hidden border-2 hover:border-brand-navy/30 transition-all hover:shadow-xl"
                          data-testid={`integration-card-${integration.id}`}
                        >
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${typeInfo.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                          
                          <CardContent className="p-6 relative">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {/* Logo */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
                                  {integration.logo}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">
                                    {isRTL ? integration.name : integration.name_en}
                                  </h3>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {isRTL ? typeInfo.label_ar : typeInfo.label_en}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Status Badge */}
                              <Badge className={`${statusInfo.color} text-white`}>
                                <StatusIcon className="h-3 w-3 me-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                              {isRTL ? integration.description : integration.description_en}
                            </p>
                            
                            {/* Features Tags */}
                            {integration.features && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {integration.features.slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {integration.features.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{integration.features.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Last Sync */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                              <Clock className="h-3 w-3" />
                              <span>{t.lastSync}: {formatDateTime(integration.last_sync)}</span>
                            </div>
                            
                            {/* Toggle */}
                            <div className="flex items-center justify-between pb-4 border-b mb-4">
                              <span className="text-sm font-medium">
                                {integration.is_active ? t.active : t.inactive}
                              </span>
                              <Switch
                                checked={integration.is_active}
                                onCheckedChange={() => handleToggle(integration)}
                                data-testid={`toggle-${integration.id}`}
                              />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => openDetails(integration)}
                              >
                                <Settings className="h-4 w-4 me-1" />
                                {t.setupIntegration}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => handleTestConnection(integration)}
                                disabled={testingConnection === integration.id}
                              >
                                {testingConnection === integration.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Zap className="h-4 w-4 me-1" />
                                    {t.testConnection}
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => openLogs(integration)}
                              >
                                <History className="h-4 w-4 me-1" />
                                {t.viewLogs}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => handleSync(integration)}
                                disabled={syncing === integration.id || !integration.is_active}
                              >
                                {syncing === integration.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 me-1" />
                                    {t.sync}
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {/* View Details */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2 rounded-lg group-hover:bg-brand-navy/5"
                              onClick={() => openDetails(integration)}
                            >
                              <Eye className="h-4 w-4 me-2" />
                              {t.viewDetails}
                              <ChevronRight className="h-4 w-4 ms-auto rtl:rotate-180" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            /* API Management Tab */
            <div className="space-y-6">
              {/* API Overview Card */}
              <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/80 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{t.nassaqApi}</h2>
                      <p className="text-white/70">
                        {isRTL 
                          ? 'إدارة واجهات البرمجة ومفاتيح الوصول الخاصة بمنصة نسق'
                          : 'Manage NASSAQ platform API keys and access'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        className="rounded-xl"
                        onClick={() => setShowShareDialog(true)}
                      >
                        <Share2 className="h-4 w-4 me-2" />
                        {t.shareTemplate}
                      </Button>
                      <Button 
                        className="rounded-xl bg-white text-brand-navy hover:bg-white/90"
                        onClick={() => setShowNewKeyDialog(true)}
                      >
                        <Plus className="h-4 w-4 me-2" />
                        {t.generateNewKey}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* API Base Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Keys */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-brand-navy" />
                      {t.apiKeys}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'مفاتيح الوصول لواجهة برمجة التطبيقات' : 'API access keys'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {apiKeys.map(key => (
                      <div 
                        key={key.id}
                        className={`p-4 rounded-xl border ${key.is_active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {key.name}
                              {key.is_active ? (
                                <Badge className="bg-green-500">{t.active}</Badge>
                              ) : (
                                <Badge variant="secondary">{t.inactive}</Badge>
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t.createdAt}: {formatDateTime(key.created_at)}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {key.permissions === 'full_access' ? t.fullAccess :
                             key.permissions === 'read_write' ? t.readWrite : t.readOnly}
                          </Badge>
                        </div>
                        
                        {/* API Key */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black/5 px-3 py-1.5 rounded text-xs font-mono" dir="ltr">
                              {key.key}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.key, `key-${key.id}`)}
                            >
                              {copiedField === `key-${key.id}` ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          
                          {/* Secret */}
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black/5 px-3 py-1.5 rounded text-xs font-mono" dir="ltr">
                              {key.secret.substring(0, 10)}{'•'.repeat(20)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.secret, `secret-${key.id}`)}
                            >
                              {copiedField === `secret-${key.id}` ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRevokeKey(key.id)}
                          >
                            <Lock className="h-4 w-4 me-1" />
                            {t.revokeKey}
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* API Endpoints */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-brand-navy" />
                      {t.endpoints}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'نقاط الاتصال المتاحة' : 'Available API endpoints'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Base URL */}
                    <div className="mb-4 p-3 bg-brand-navy/5 rounded-xl">
                      <Label className="text-xs text-muted-foreground">{t.baseUrl}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 font-mono text-sm" dir="ltr">{API_URL}/api</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${API_URL}/api`, 'base-url')}
                        >
                          {copiedField === 'base-url' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {NASSAQ_ENDPOINTS.map((endpoint, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
                            <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="w-16 justify-center">
                              {endpoint.method}
                            </Badge>
                            <code className="flex-1 text-sm font-mono" dir="ltr">{endpoint.path}</code>
                            <span className="text-xs text-muted-foreground">{endpoint.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${API_URL}${endpoint.path}`, `endpoint-${idx}`)}
                            >
                              {copiedField === `endpoint-${idx}` ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Documentation Link */}
                    <Button variant="outline" className="w-full mt-4 rounded-xl">
                      <FileText className="h-4 w-4 me-2" />
                      {t.documentation}
                      <ExternalLink className="h-4 w-4 ms-auto" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
        
        {/* Integration Details Sheet */}
        <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[500px] sm:w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                {selectedIntegration && (
                  <>
                    <span className="text-3xl">{selectedIntegration.logo}</span>
                    {isRTL ? selectedIntegration.name : selectedIntegration.name_en}
                  </>
                )}
              </SheetTitle>
              <SheetDescription>
                {selectedIntegration && (isRTL ? selectedIntegration.description : selectedIntegration.description_en)}
              </SheetDescription>
            </SheetHeader>
            
            {selectedIntegration && (
              <div className="space-y-6 py-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="font-medium">{isRTL ? 'الحالة' : 'Status'}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusInfo(selectedIntegration.status).color}>
                      {getStatusInfo(selectedIntegration.status).label}
                    </Badge>
                    <Switch
                      checked={selectedIntegration.is_active}
                      onCheckedChange={() => handleToggle(selectedIntegration)}
                    />
                  </div>
                </div>
                
                {/* Connection Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {isRTL ? 'إعدادات الاتصال' : 'Connection Settings'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>{t.apiUrl}</Label>
                      <div className="flex gap-2">
                        <Input value={selectedIntegration.api_base_url} readOnly dir="ltr" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(selectedIntegration.api_base_url, 'detail-url')}
                        >
                          {copiedField === 'detail-url' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t.apiKey}</Label>
                      <div className="flex gap-2">
                        <Input type="password" value="••••••••••••••••••••" readOnly dir="ltr" />
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t.webhookUrl}</Label>
                      <div className="flex gap-2">
                        <Input value={`${API_URL}/api/webhooks/${selectedIntegration.id}`} readOnly dir="ltr" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(`${API_URL}/api/webhooks/${selectedIntegration.id}`, 'webhook')}
                        >
                          {copiedField === 'webhook' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                {selectedIntegration.features && (
                  <div className="space-y-3">
                    <h4 className="font-medium">{isRTL ? 'الميزات المتاحة' : 'Available Features'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedIntegration.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-brand-navy rounded-xl"
                    onClick={() => handleTestConnection(selectedIntegration)}
                    disabled={testingConnection === selectedIntegration.id}
                  >
                    {testingConnection === selectedIntegration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                      <Zap className="h-4 w-4 me-2" />
                    )}
                    {t.testConnection}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl"
                    onClick={() => handleSync(selectedIntegration)}
                    disabled={syncing === selectedIntegration.id}
                  >
                    {syncing === selectedIntegration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 me-2" />
                    )}
                    {t.sync}
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
        
        {/* Logs Sheet */}
        <Sheet open={showLogsSheet} onOpenChange={setShowLogsSheet}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[450px] sm:w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-brand-navy" />
                {t.logs}
                {selectedIntegration && (
                  <Badge variant="outline">{isRTL ? selectedIntegration.name : selectedIntegration.name_en}</Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-6">
              {logs.map(log => (
                <div 
                  key={log.id}
                  className={`p-4 rounded-xl border ${
                    log.status === 'success' ? 'bg-green-50 border-green-200' :
                    log.status === 'failed' ? 'bg-red-50 border-red-200' :
                    'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : log.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="font-medium text-sm">
                        {log.action === 'sync' ? (isRTL ? 'مزامنة' : 'Sync') :
                         log.action === 'test' ? (isRTL ? 'اختبار' : 'Test') :
                         log.action === 'webhook' ? 'Webhook' : log.action}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Share Template Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-brand-navy" />
                {t.shareTemplate}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'نموذج جاهز لمشاركة بيانات التكامل' : 'Ready template for sharing integration data'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={generateShareTemplate()}
                readOnly
                rows={15}
                className="font-mono text-sm"
                dir="rtl"
              />
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                {t.cancel}
              </Button>
              <Button 
                onClick={() => {
                  copyToClipboard(generateShareTemplate(), 'share-template');
                  setShowShareDialog(false);
                }}
                className="bg-brand-navy"
              >
                <Copy className="h-4 w-4 me-2" />
                {t.copyAll}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* New API Key Dialog */}
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-brand-navy" />
                {t.generateNewKey}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم المفتاح' : 'Key Name'}</Label>
                <Input
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: مفتاح الإنتاج' : 'e.g., Production Key'}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.permissions}</Label>
                <Select 
                  value={newKeyForm.permissions} 
                  onValueChange={(v) => setNewKeyForm({ ...newKeyForm, permissions: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read_only">{t.readOnly}</SelectItem>
                    <SelectItem value="read_write">{t.readWrite}</SelectItem>
                    <SelectItem value="full_access">{t.fullAccess}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleGenerateKey} className="bg-brand-navy" disabled={!newKeyForm.name}>
                <Plus className="h-4 w-4 me-2" />
                {t.generateNewKey}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Integration Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-navy" />
                {t.addIntegration}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t.integrationType}</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEGRATION_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {isRTL ? type.label_ar : type.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.apiUrl}</Label>
                <Input
                  value={formData.api_base_url}
                  onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                  dir="ltr"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.apiKey}</Label>
                  <Input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.secretKey}</Label>
                  <Input
                    type="password"
                    value={formData.secret_key}
                    onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {t.cancel}
              </Button>
              <Button className="bg-brand-navy">
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
