import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Lock,
  Key,
  UserCheck,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  FileWarning,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const SecurityCenterPage = () => {
  const { isRTL, isDark } = useTheme();

  const securityScore = 92;

  const securityMetrics = [
    { label: isRTL ? 'محاولات دخول فاشلة' : 'Failed Login Attempts', value: 12, trend: 'down', status: 'good' },
    { label: isRTL ? 'حسابات مقفلة' : 'Locked Accounts', value: 3, trend: 'stable', status: 'warning' },
    { label: isRTL ? 'جلسات نشطة' : 'Active Sessions', value: 127, trend: 'up', status: 'good' },
    { label: isRTL ? 'تنبيهات أمنية' : 'Security Alerts', value: 2, trend: 'down', status: 'warning' },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: isRTL ? 'محاولات دخول متعددة فاشلة' : 'Multiple Failed Login Attempts',
      description: isRTL ? 'تم رصد 5 محاولات دخول فاشلة لحساب واحد' : '5 failed login attempts detected for one account',
      time: '15 min ago',
    },
    {
      id: 2,
      type: 'info',
      title: isRTL ? 'دخول من موقع جديد' : 'Login from New Location',
      description: isRTL ? 'تم تسجيل دخول من موقع جغرافي جديد' : 'Login detected from a new geographic location',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'success',
      title: isRTL ? 'تم تحديث كلمة المرور' : 'Password Updated',
      description: isRTL ? 'تم تغيير كلمة مرور حساب مدير بنجاح' : 'Admin account password changed successfully',
      time: '2 hours ago',
    },
  ];

  const securityChecks = [
    { name: isRTL ? 'تشفير البيانات' : 'Data Encryption', status: 'passed', icon: Lock },
    { name: isRTL ? 'المصادقة الثنائية' : 'Two-Factor Auth', status: 'partial', icon: Key },
    { name: isRTL ? 'سياسة كلمات المرور' : 'Password Policy', status: 'passed', icon: ShieldCheck },
    { name: isRTL ? 'تدقيق السجلات' : 'Audit Logging', status: 'passed', icon: Activity },
    { name: isRTL ? 'حماية API' : 'API Protection', status: 'passed', icon: Shield },
    { name: isRTL ? 'النسخ الاحتياطي' : 'Backup Security', status: 'passed', icon: FileWarning },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="security-center-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'مركز الأمان' : 'Security Center'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'مراقبة وإدارة أمان المنصة' : 'Monitor and manage platform security'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button className="rounded-xl bg-brand-navy hover:bg-brand-navy/90">
                <Shield className="h-4 w-4 me-2" />
                {isRTL ? 'فحص شامل' : 'Full Scan'}
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
                    ? 'البيانات المعروضة توضيحية. سيتم ربطها بنظام الأمان الفعلي قريباً.'
                    : 'The data shown is placeholder. It will be connected to the actual security system soon.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="card-nassaq lg:col-span-1">
              <CardHeader>
                <CardTitle className="font-cairo">{isRTL ? 'مؤشر الأمان' : 'Security Score'}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${securityScore * 3.52} 352`}
                      className="text-green-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{securityScore}%</span>
                  </div>
                </div>
                <Badge className="mt-4 bg-green-100 text-green-700">
                  {isRTL ? 'جيد جداً' : 'Very Good'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="card-nassaq lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-cairo">{isRTL ? 'مؤشرات الأمان' : 'Security Metrics'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {securityMetrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <Badge variant={metric.status === 'good' ? 'default' : 'secondary'}>
                          {metric.status === 'good' 
                            ? (isRTL ? 'طبيعي' : 'Normal')
                            : (isRTL ? 'يحتاج متابعة' : 'Needs Attention')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Checks */}
          <Card className="card-nassaq">
            <CardHeader>
              <CardTitle className="font-cairo flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'فحوصات الأمان' : 'Security Checks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {securityChecks.map((check, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      check.status === 'passed' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                    }`}>
                      <check.icon className={`h-5 w-5 ${
                        check.status === 'passed' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{check.name}</p>
                      <p className={`text-xs ${
                        check.status === 'passed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {check.status === 'passed' 
                          ? (isRTL ? 'ناجح' : 'Passed')
                          : (isRTL ? 'جزئي' : 'Partial')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="card-nassaq">
            <CardHeader>
              <CardTitle className="font-cairo flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {isRTL ? 'التنبيهات الأخيرة' : 'Recent Alerts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.type === 'warning' ? 'bg-yellow-500/10' :
                      alert.type === 'success' ? 'bg-green-500/10' : 'bg-blue-500/10'
                    }`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : alert.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
};
