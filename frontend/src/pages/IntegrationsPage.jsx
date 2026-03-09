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
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Translations
const translations = {
  ar: {
    pageTitle: 'التكاملات',
    pageSubtitle: 'إدارة التكاملات والربط مع الأنظمة الخارجية',
    overview: 'نظرة عامة',
    all: 'الكل',
    government: 'حكومية',
    payment: 'مدفوعات',
    sms: 'رسائل SMS',
    email: 'بريد إلكتروني',
    storage: 'تخزين',
    ai: 'ذكاء اصطناعي',
    other: 'أخرى',
    addIntegration: 'إضافة تكامل',
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الإعداد',
    error: 'خطأ',
    lastSync: 'آخر مزامنة',
    testConnection: 'اختبار الاتصال',
    sync: 'مزامنة',
    edit: 'تعديل',
    delete: 'حذف',
    enable: 'تفعيل',
    disable: 'تعطيل',
    viewLogs: 'عرض السجلات',
    integrationName: 'اسم التكامل',
    integrationType: 'نوع التكامل',
    description: 'الوصف',
    apiUrl: 'رابط API',
    apiKey: 'مفتاح API',
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
    filter: 'تصفية',
    logs: 'السجلات',
    settings: 'الإعدادات',
    endpoints: 'نقاط الاتصال',
    webhooks: 'Webhooks',
    dataMapping: 'ربط البيانات',
    importExport: 'استيراد/تصدير',
  },
  en: {
    pageTitle: 'Integrations',
    pageSubtitle: 'Manage integrations with external systems',
    overview: 'Overview',
    all: 'All',
    government: 'Government',
    payment: 'Payment',
    sms: 'SMS',
    email: 'Email',
    storage: 'Storage',
    ai: 'AI',
    other: 'Other',
    addIntegration: 'Add Integration',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    error: 'Error',
    lastSync: 'Last Sync',
    testConnection: 'Test Connection',
    sync: 'Sync',
    edit: 'Edit',
    delete: 'Delete',
    enable: 'Enable',
    disable: 'Disable',
    viewLogs: 'View Logs',
    integrationName: 'Integration Name',
    integrationType: 'Integration Type',
    description: 'Description',
    apiUrl: 'API URL',
    apiKey: 'API Key',
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
    filter: 'Filter',
    logs: 'Logs',
    settings: 'Settings',
    endpoints: 'Endpoints',
    webhooks: 'Webhooks',
    dataMapping: 'Data Mapping',
    importExport: 'Import/Export',
  }
};

// Integration types
const INTEGRATION_TYPES = [
  { id: 'government', icon: Building2, color: 'bg-blue-500', label_ar: 'حكومية', label_en: 'Government' },
  { id: 'payment', icon: CreditCard, color: 'bg-green-500', label_ar: 'مدفوعات', label_en: 'Payment' },
  { id: 'sms', icon: MessageSquare, color: 'bg-purple-500', label_ar: 'رسائل SMS', label_en: 'SMS' },
  { id: 'email', icon: Mail, color: 'bg-orange-500', label_ar: 'بريد إلكتروني', label_en: 'Email' },
  { id: 'storage', icon: Cloud, color: 'bg-cyan-500', label_ar: 'تخزين', label_en: 'Storage' },
  { id: 'ai', icon: Brain, color: 'bg-pink-500', label_ar: 'ذكاء اصطناعي', label_en: 'AI' },
  { id: 'other', icon: PlugZap, color: 'bg-gray-500', label_ar: 'أخرى', label_en: 'Other' },
];

// Sample integrations (will be replaced by API data)
const SAMPLE_INTEGRATIONS = [
  {
    id: '1',
    name: 'نظام نور',
    name_en: 'Noor System',
    type: 'government',
    description: 'ربط مع نظام نور التعليمي',
    description_en: 'Integration with Noor educational system',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T10:30:00Z',
    api_base_url: 'https://noor.moe.gov.sa/api',
    created_at: '2026-01-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'يسّر للرسائل',
    name_en: 'Yesser SMS',
    type: 'sms',
    description: 'خدمة إرسال الرسائل النصية',
    description_en: 'SMS messaging service',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T09:15:00Z',
    api_base_url: 'https://api.yesser.gov.sa/sms',
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: '3',
    name: 'Stripe',
    name_en: 'Stripe',
    type: 'payment',
    description: 'بوابة الدفع الإلكتروني',
    description_en: 'Payment gateway',
    status: 'pending',
    is_active: false,
    last_sync: null,
    api_base_url: 'https://api.stripe.com/v1',
    created_at: '2026-03-01T14:00:00Z'
  },
  {
    id: '4',
    name: 'OpenAI',
    name_en: 'OpenAI',
    type: 'ai',
    description: 'خدمات الذكاء الاصطناعي',
    description_en: 'AI services',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T08:00:00Z',
    api_base_url: 'https://api.openai.com/v1',
    created_at: '2026-01-20T12:00:00Z'
  },
  {
    id: '5',
    name: 'SendGrid',
    name_en: 'SendGrid',
    type: 'email',
    description: 'خدمة إرسال البريد الإلكتروني',
    description_en: 'Email sending service',
    status: 'error',
    is_active: false,
    last_sync: '2026-03-08T22:00:00Z',
    api_base_url: 'https://api.sendgrid.com/v3',
    created_at: '2026-02-10T09:00:00Z'
  },
  {
    id: '6',
    name: 'Amazon S3',
    name_en: 'Amazon S3',
    type: 'storage',
    description: 'تخزين الملفات السحابي',
    description_en: 'Cloud file storage',
    status: 'active',
    is_active: true,
    last_sync: '2026-03-09T07:30:00Z',
    api_base_url: 'https://s3.amazonaws.com',
    created_at: '2026-01-25T16:00:00Z'
  },
];

export default function IntegrationsPage() {
  const { isRTL = true, isDark } = useTheme();
  const navigate = useNavigate();
  const t = translations[isRTL ? 'ar' : 'en'];
  
  // States
  const [integrations, setIntegrations] = useState(SAMPLE_INTEGRATIONS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showLogsSheet, setShowLogsSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
    webhook_url: '',
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
  
  // Fetch integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/integrations');
        if (response.data.integrations && response.data.integrations.length > 0) {
          setIntegrations(response.data.integrations);
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
        // Keep sample data if API fails
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntegrations();
  }, []);
  
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
    const matchesTab = activeTab === 'all' || integration.type === activeTab;
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
  
  // Test connection
  const handleTestConnection = async (integration) => {
    setTestingConnection(integration.id);
    try {
      await api.post(`/api/integrations/${integration.id}/test`);
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
      await api.post(`/api/integrations/${integration.id}/sync`);
      toast.success(t.syncSuccess);
      // Update last sync
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
    try {
      await api.post(`/api/integrations/${integration.id}/toggle`);
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id 
          ? { ...i, is_active: !i.is_active, status: !i.is_active ? 'active' : 'inactive' }
          : i
      ));
      toast.success(integration.is_active 
        ? (isRTL ? 'تم تعطيل التكامل' : 'Integration disabled')
        : (isRTL ? 'تم تفعيل التكامل' : 'Integration enabled')
      );
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error occurred');
    }
  };
  
  // Delete integration
  const handleDelete = async () => {
    if (!selectedIntegration) return;
    try {
      await api.delete(`/api/integrations/${selectedIntegration.id}`);
      setIntegrations(prev => prev.filter(i => i.id !== selectedIntegration.id));
      toast.success(isRTL ? 'تم حذف التكامل' : 'Integration deleted');
    } catch (error) {
      toast.error(isRTL ? 'فشل الحذف' : 'Delete failed');
    }
    setShowDeleteDialog(false);
    setSelectedIntegration(null);
  };
  
  // Save integration
  const handleSave = async () => {
    try {
      if (selectedIntegration) {
        // Update
        await api.put(`/api/integrations/${selectedIntegration.id}`, formData);
        setIntegrations(prev => prev.map(i => 
          i.id === selectedIntegration.id ? { ...i, ...formData } : i
        ));
        toast.success(isRTL ? 'تم تحديث التكامل' : 'Integration updated');
      } else {
        // Create
        const response = await api.post('/api/integrations', formData);
        setIntegrations(prev => [...prev, response.data]);
        toast.success(isRTL ? 'تم إنشاء التكامل' : 'Integration created');
      }
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error occurred');
    }
    setShowAddDialog(false);
    setShowEditSheet(false);
    setFormData({
      name: '',
      name_en: '',
      type: 'other',
      description: '',
      description_en: '',
      api_base_url: '',
      api_key: '',
      webhook_url: '',
    });
    setSelectedIntegration(null);
  };
  
  // Copy to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success(isRTL ? 'تم النسخ' : 'Copied');
    } catch (err) {
      toast.error(isRTL ? 'فشل النسخ' : 'Copy failed');
    }
  };
  
  // Open edit
  const openEdit = (integration) => {
    setSelectedIntegration(integration);
    setFormData({
      name: integration.name,
      name_en: integration.name_en || '',
      type: integration.type,
      description: integration.description || '',
      description_en: integration.description_en || '',
      api_base_url: integration.api_base_url || '',
      api_key: '',
      webhook_url: integration.webhook_url || '',
    });
    setShowEditSheet(true);
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
                onClick={() => {
                  setSelectedIntegration(null);
                  setFormData({
                    name: '',
                    name_en: '',
                    type: 'other',
                    description: '',
                    description_en: '',
                    api_base_url: '',
                    api_key: '',
                    webhook_url: '',
                  });
                  setShowAddDialog(true);
                }}
                data-testid="add-integration-btn"
              >
                <Plus className="h-4 w-4 me-2" />
                {t.addIntegration}
              </Button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-4">
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
            
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
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
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            
            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
                </div>
              ) : filteredIntegrations.length === 0 ? (
                <Card className="card-nassaq">
                  <CardContent className="py-12 text-center">
                    <Unplug className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-lg mb-2">{t.noIntegrations}</h3>
                    <p className="text-muted-foreground mb-4">
                      {isRTL ? 'لم يتم إضافة أي تكاملات بعد' : 'No integrations have been added yet'}
                    </p>
                    <Button onClick={() => setShowAddDialog(true)} className="rounded-xl">
                      <Plus className="h-4 w-4 me-2" />
                      {t.addIntegration}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntegrations.map(integration => {
                    const typeInfo = getTypeInfo(integration.type);
                    const statusInfo = getStatusInfo(integration.status);
                    const TypeIcon = typeInfo.icon;
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <Card 
                        key={integration.id} 
                        className="card-nassaq hover:shadow-lg transition-all"
                        data-testid={`integration-card-${integration.id}`}
                      >
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl ${typeInfo.color} flex items-center justify-center`}>
                                <TypeIcon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold">
                                  {isRTL ? integration.name : (integration.name_en || integration.name)}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {isRTL ? typeInfo.label_ar : typeInfo.label_en}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="h-3 w-3 me-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          {/* Description */}
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {isRTL ? integration.description : (integration.description_en || integration.description)}
                          </p>
                          
                          {/* Info */}
                          <div className="space-y-2 text-sm mb-4">
                            {integration.api_base_url && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Globe className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate" dir="ltr">{integration.api_base_url}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {t.lastSync}: {formatDateTime(integration.last_sync)}
                              </span>
                            </div>
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
                          
                          {/* Actions */}
                          <div className="grid grid-cols-4 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleTestConnection(integration)}
                              disabled={testingConnection === integration.id}
                              data-testid={`test-${integration.id}`}
                            >
                              {testingConnection === integration.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleSync(integration)}
                              disabled={syncing === integration.id || !integration.is_active}
                              data-testid={`sync-${integration.id}`}
                            >
                              {syncing === integration.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => openEdit(integration)}
                              data-testid={`edit-${integration.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setShowDeleteDialog(true);
                              }}
                              data-testid={`delete-${integration.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* View Logs */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 rounded-lg"
                            onClick={() => openLogs(integration)}
                          >
                            <History className="h-4 w-4 me-2" />
                            {t.viewLogs}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
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
                    placeholder={isRTL ? 'اسم التكامل' : 'Integration name'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Integration name"
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
                  placeholder={isRTL ? 'وصف التكامل...' : 'Integration description...'}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.apiUrl}</Label>
                <Input
                  value={formData.api_base_url}
                  onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                  placeholder="https://api.example.com"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.apiKey}</Label>
                <Input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="••••••••••••••••"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.webhookUrl}</Label>
                <Input
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                  dir="ltr"
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleSave} className="bg-brand-navy">
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Sheet */}
        <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[450px] sm:w-[550px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-navy" />
                {t.edit}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-6">
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
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.apiUrl}</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.api_base_url}
                    onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.api_base_url, 'api_url')}
                  >
                    {copiedField === 'api_url' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t.apiKey}</Label>
                <Input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder={isRTL ? 'أدخل مفتاح جديد للتغيير' : 'Enter new key to change'}
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.webhookUrl}</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.webhook_url, 'webhook')}
                  >
                    {copiedField === 'webhook' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-brand-navy rounded-xl">
                  {t.save}
                </Button>
                <Button variant="outline" onClick={() => setShowEditSheet(false)} className="rounded-xl">
                  {t.cancel}
                </Button>
              </div>
            </div>
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
        
        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                {t.delete}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? `هل أنت متأكد من حذف التكامل "${selectedIntegration?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${selectedIntegration?.name_en || selectedIntegration?.name}"? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                {t.cancel}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 me-2" />
                {t.delete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
