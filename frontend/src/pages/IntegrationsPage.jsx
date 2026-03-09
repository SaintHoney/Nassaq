import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Link2,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Mail,
  MessageSquare,
  Phone,
  Cloud,
  CreditCard,
  Database,
  Lock,
  Zap,
} from 'lucide-react';

export const IntegrationsPage = () => {
  const { isRTL, isDark } = useTheme();

  const integrations = [
    {
      id: 'sms',
      name: isRTL ? 'خدمة الرسائل النصية' : 'SMS Service',
      provider: 'Unifonic',
      description: isRTL ? 'إرسال رسائل نصية للإشعارات' : 'Send SMS notifications',
      icon: Phone,
      status: 'active',
      connected: true,
    },
    {
      id: 'email',
      name: isRTL ? 'خدمة البريد الإلكتروني' : 'Email Service',
      provider: 'SendGrid',
      description: isRTL ? 'إرسال إشعارات البريد الإلكتروني' : 'Send email notifications',
      icon: Mail,
      status: 'active',
      connected: true,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      provider: 'Meta',
      description: isRTL ? 'إرسال رسائل واتساب' : 'Send WhatsApp messages',
      icon: MessageSquare,
      status: 'pending',
      connected: false,
    },
    {
      id: 'storage',
      name: isRTL ? 'التخزين السحابي' : 'Cloud Storage',
      provider: 'AWS S3',
      description: isRTL ? 'تخزين الملفات والوثائق' : 'Store files and documents',
      icon: Cloud,
      status: 'active',
      connected: true,
    },
    {
      id: 'payment',
      name: isRTL ? 'بوابة الدفع' : 'Payment Gateway',
      provider: 'HyperPay',
      description: isRTL ? 'معالجة المدفوعات' : 'Process payments',
      icon: CreditCard,
      status: 'pending',
      connected: false,
    },
    {
      id: 'noor',
      name: isRTL ? 'نظام نور' : 'Noor System',
      provider: isRTL ? 'وزارة التعليم' : 'Ministry of Education',
      description: isRTL ? 'التكامل مع نظام نور التعليمي' : 'Integration with Noor education system',
      icon: Database,
      status: 'planned',
      connected: false,
    },
    {
      id: 'nafath',
      name: isRTL ? 'نفاذ' : 'Nafath',
      provider: isRTL ? 'مركز المعلومات الوطني' : 'NIC',
      description: isRTL ? 'التحقق من الهوية الوطنية' : 'National ID verification',
      icon: Lock,
      status: 'planned',
      connected: false,
    },
    {
      id: 'ai',
      name: isRTL ? 'خدمات الذكاء الاصطناعي' : 'AI Services',
      provider: 'OpenAI',
      description: isRTL ? 'مساعد حكيم الذكي' : 'Hakim AI Assistant',
      icon: Zap,
      status: 'active',
      connected: true,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">{isRTL ? 'نشط' : 'Active'}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">{isRTL ? 'قيد الإعداد' : 'Pending'}</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-700">{isRTL ? 'مخطط له' : 'Planned'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="integrations-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'التكاملات' : 'Integrations'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة التكاملات مع الخدمات الخارجية' : 'Manage integrations with external services'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button className="rounded-xl bg-brand-navy hover:bg-brand-navy/90">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة تكامل' : 'Add Integration'}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Under Development Banner */}
          <Card className="card-nassaq border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-cairo font-medium text-yellow-600">
                  {isRTL ? 'هذه الصفحة قيد التطوير' : 'This Page is Under Development'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'إدارة التكاملات ستكون متاحة قريباً. بعض التكاملات نشطة بالفعل.'
                    : 'Integration management will be available soon. Some integrations are already active.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-brand-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي التكاملات' : 'Total Integrations'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'متصل' : 'Connected'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'قيد الإعداد' : 'Pending Setup'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'مخطط له' : 'Planned'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Grid */}
          <div>
            <h2 className="font-cairo text-xl font-bold mb-4">
              {isRTL ? 'التكاملات المتاحة' : 'Available Integrations'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <Card 
                  key={integration.id} 
                  className="card-nassaq"
                  data-testid={`integration-${integration.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          integration.connected ? 'bg-green-500/10' : 'bg-muted'
                        }`}>
                          <integration.icon className={`h-6 w-6 ${
                            integration.connected ? 'text-green-600' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-cairo font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.provider}</p>
                          <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(integration.status)}
                        <Switch 
                          checked={integration.connected} 
                          disabled={integration.status !== 'active'}
                        />
                      </div>
                    </div>
                    {integration.connected && (
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4 me-2" />
                          {isRTL ? 'إعدادات' : 'Settings'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
