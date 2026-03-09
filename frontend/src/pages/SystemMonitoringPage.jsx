import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Activity,
  Cpu,
  HardDrive,
  Database,
  Wifi,
  Server,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Globe,
} from 'lucide-react';

export const SystemMonitoringPage = () => {
  const { isRTL, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Simulated system metrics
  const systemMetrics = {
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 85,
  };

  const services = [
    { name: 'API Server', status: 'healthy', uptime: '99.9%', latency: '45ms' },
    { name: 'Database (MongoDB)', status: 'healthy', uptime: '99.8%', latency: '12ms' },
    { name: 'Authentication', status: 'healthy', uptime: '100%', latency: '23ms' },
    { name: 'File Storage', status: 'healthy', uptime: '99.5%', latency: '89ms' },
    { name: 'AI Services', status: 'healthy', uptime: '98.2%', latency: '250ms' },
    { name: 'Notification Service', status: 'healthy', uptime: '99.7%', latency: '34ms' },
  ];

  const recentActivities = [
    { time: '2 min ago', event: isRTL ? 'تسجيل دخول - مدير المنصة' : 'Login - Platform Admin', type: 'auth' },
    { time: '5 min ago', event: isRTL ? 'إنشاء مدرسة جديدة' : 'New school created', type: 'create' },
    { time: '12 min ago', event: isRTL ? 'تحديث بيانات المستخدم' : 'User data updated', type: 'update' },
    { time: '18 min ago', event: isRTL ? 'تشغيل عملية AI' : 'AI operation executed', type: 'ai' },
    { time: '25 min ago', event: isRTL ? 'تصدير تقرير' : 'Report exported', type: 'export' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="system-monitoring-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'مراقبة النظام' : 'System Monitoring'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'مراقبة أداء وصحة النظام في الوقت الفعلي' : 'Real-time system health and performance monitoring'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 me-2 animate-pulse" />
                {isRTL ? 'جميع الخدمات تعمل' : 'All Services Operational'}
              </Badge>
              <Button variant="outline" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
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
                    ? 'البيانات المعروضة هي بيانات توضيحية. سيتم ربطها بالبيانات الفعلية قريباً.'
                    : 'The data shown is placeholder data. It will be connected to real metrics soon.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-nassaq">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'المعالج' : 'CPU'}</p>
                    <p className="text-2xl font-bold">{systemMetrics.cpu}%</p>
                  </div>
                </div>
                <Progress value={systemMetrics.cpu} className="h-2" />
              </CardContent>
            </Card>

            <Card className="card-nassaq">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Server className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'الذاكرة' : 'Memory'}</p>
                    <p className="text-2xl font-bold">{systemMetrics.memory}%</p>
                  </div>
                </div>
                <Progress value={systemMetrics.memory} className="h-2" />
              </CardContent>
            </Card>

            <Card className="card-nassaq">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'التخزين' : 'Disk'}</p>
                    <p className="text-2xl font-bold">{systemMetrics.disk}%</p>
                  </div>
                </div>
                <Progress value={systemMetrics.disk} className="h-2" />
              </CardContent>
            </Card>

            <Card className="card-nassaq">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'الشبكة' : 'Network'}</p>
                    <p className="text-2xl font-bold">{systemMetrics.network}%</p>
                  </div>
                </div>
                <Progress value={systemMetrics.network} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Services Status */}
          <Card className="card-nassaq">
            <CardHeader>
              <CardTitle className="font-cairo flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'حالة الخدمات' : 'Services Status'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'مراقبة حالة جميع خدمات النظام' : 'Monitor all system services status'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{isRTL ? 'وقت التشغيل' : 'Uptime'}: {service.uptime}</span>
                      <span>{isRTL ? 'التأخير' : 'Latency'}: {service.latency}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {isRTL ? 'يعمل' : 'Healthy'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="card-nassaq">
              <CardHeader>
                <CardTitle className="font-cairo flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-purple" />
                  {isRTL ? 'آخر الأنشطة' : 'Recent Activities'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm">{activity.event}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-nassaq">
              <CardHeader>
                <CardTitle className="font-cairo flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-navy" />
                  {isRTL ? 'إحصائيات سريعة' : 'Quick Stats'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-brand-turquoise" />
                    <span>{isRTL ? 'مستخدمون نشطون الآن' : 'Active Users Now'}</span>
                  </div>
                  <span className="text-2xl font-bold">127</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>{isRTL ? 'طلبات API/دقيقة' : 'API Requests/min'}</span>
                  </div>
                  <span className="text-2xl font-bold">1,234</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-brand-purple" />
                    <span>{isRTL ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}</span>
                  </div>
                  <span className="text-2xl font-bold">45ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
