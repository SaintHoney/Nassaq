import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  MessageSquare,
  Send,
  Users,
  Bell,
  Mail,
  Phone,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  Inbox,
  CheckCircle,
  Clock,
  Building2,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export const CommunicationCenterPage = () => {
  const { isRTL, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const messageStats = {
    sent: 1250,
    received: 890,
    pending: 45,
    templates: 12,
  };

  const recentMessages = [
    {
      id: 1,
      type: 'broadcast',
      title: isRTL ? 'إشعار بداية الفصل الدراسي' : 'Semester Start Notification',
      recipients: isRTL ? 'جميع المدارس' : 'All Schools',
      date: '2026-03-09',
      status: 'sent',
    },
    {
      id: 2,
      type: 'targeted',
      title: isRTL ? 'تحديث نظام الحضور' : 'Attendance System Update',
      recipients: isRTL ? 'مديري المدارس' : 'School Principals',
      date: '2026-03-08',
      status: 'sent',
    },
    {
      id: 3,
      type: 'scheduled',
      title: isRTL ? 'تذكير بموعد الاختبارات' : 'Exam Schedule Reminder',
      recipients: isRTL ? 'المعلمين والطلاب' : 'Teachers & Students',
      date: '2026-03-15',
      status: 'scheduled',
    },
  ];

  const quickTemplates = [
    { id: 1, name: isRTL ? 'إشعار عام' : 'General Announcement', icon: Bell },
    { id: 2, name: isRTL ? 'تذكير بموعد' : 'Event Reminder', icon: Clock },
    { id: 3, name: isRTL ? 'تحديث النظام' : 'System Update', icon: RefreshCw },
    { id: 4, name: isRTL ? 'طلب معلومات' : 'Information Request', icon: Mail },
  ];

  const audienceGroups = [
    { id: 'all', name: isRTL ? 'الجميع' : 'Everyone', count: 53000, icon: Users },
    { id: 'schools', name: isRTL ? 'المدارس' : 'Schools', count: 200, icon: Building2 },
    { id: 'teachers', name: isRTL ? 'المعلمين' : 'Teachers', count: 3000, icon: UserCheck },
    { id: 'students', name: isRTL ? 'الطلاب' : 'Students', count: 50000, icon: GraduationCap },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="communication-center-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'مركز التواصل' : 'Communication Center'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إرسال الرسائل والإشعارات الجماعية' : 'Send messages and broadcast notifications'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button className="rounded-xl bg-brand-navy hover:bg-brand-navy/90">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'رسالة جديدة' : 'New Message'}
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
                    ? 'نعمل على إضافة ميزات التواصل الجماعي قريباً.'
                    : 'We are working on adding mass communication features soon.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                  <Send className="h-6 w-6 text-brand-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{messageStats.sent}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'رسائل مرسلة' : 'Messages Sent'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Inbox className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{messageStats.received}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'رسائل مستلمة' : 'Received'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{messageStats.pending}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'مجدولة' : 'Scheduled'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-brand-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{messageStats.templates}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'قوالب' : 'Templates'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose Message */}
            <Card className="card-nassaq lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-cairo flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-turquoise" />
                  {isRTL ? 'إنشاء رسالة' : 'Compose Message'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {audienceGroups.map((group) => (
                      <Button 
                        key={group.id} 
                        variant="outline" 
                        className="justify-start rounded-xl h-auto py-3"
                      >
                        <group.icon className="h-4 w-4 me-2" />
                        <div className="text-start">
                          <p className="text-sm">{group.name}</p>
                          <p className="text-xs text-muted-foreground">{group.count.toLocaleString()}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'عنوان الرسالة' : 'Message Title'}
                  </label>
                  <Input placeholder={isRTL ? 'أدخل عنوان الرسالة...' : 'Enter message title...'} className="rounded-xl" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'نص الرسالة' : 'Message Content'}
                  </label>
                  <Textarea 
                    placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'} 
                    className="rounded-xl min-h-[150px]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" className="rounded-xl">
                    <Clock className="h-4 w-4 me-2" />
                    {isRTL ? 'جدولة' : 'Schedule'}
                  </Button>
                  <Button className="rounded-xl bg-brand-navy hover:bg-brand-navy/90">
                    <Send className="h-4 w-4 me-2" />
                    {isRTL ? 'إرسال الآن' : 'Send Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates & Recent */}
            <div className="space-y-6">
              {/* Quick Templates */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo text-lg">{isRTL ? 'قوالب سريعة' : 'Quick Templates'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickTemplates.map((template) => (
                    <Button 
                      key={template.id} 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl"
                    >
                      <template.icon className="h-4 w-4 me-2" />
                      {template.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo text-lg">{isRTL ? 'الرسائل الأخيرة' : 'Recent Messages'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium line-clamp-1">{msg.title}</p>
                        <Badge variant={msg.status === 'sent' ? 'default' : 'secondary'} className="text-xs">
                          {msg.status === 'sent' 
                            ? (isRTL ? 'مرسلة' : 'Sent')
                            : (isRTL ? 'مجدولة' : 'Scheduled')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{msg.recipients}</p>
                      <p className="text-xs text-muted-foreground mt-1">{msg.date}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
