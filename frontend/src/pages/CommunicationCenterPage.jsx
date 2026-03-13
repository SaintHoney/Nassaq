import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Users,
  Bell,
  Mail,
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
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const iconMap = {
  users: Users,
  'user-check': UserCheck,
  'graduation-cap': GraduationCap,
  bell: Bell,
  clock: Clock,
  refresh: RefreshCw,
  mail: Mail,
};

export const CommunicationCenterPage = () => {
  const { isRTL, isDark } = useTheme();
  const { api } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ sent: 0, scheduled: 0, drafts: 0, templates: 0 });
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [audienceGroups, setAudienceGroups] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  
  // Dialogs
  const [sentMessagesOpen, setSentMessagesOpen] = useState(false);
  const [receivedMessagesOpen, setReceivedMessagesOpen] = useState(false);
  const [scheduledMessagesOpen, setScheduledMessagesOpen] = useState(false);
  const [editScheduledOpen, setEditScheduledOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // New message form
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    audience: '',
    scheduled_at: ''
  });
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('compose');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await api.get('/communication/stats');
      setStats(statsRes.data);
      
      // Fetch sent messages
      const messagesRes = await api.get('/communication?limit=50');
      setMessages(messagesRes.data.messages || []);
      
      // Fetch received messages
      try {
        const receivedRes = await api.get('/communication/received');
        setReceivedMessages(receivedRes.data.messages || []);
      } catch (e) {
        setReceivedMessages([]);
      }
      
      // Fetch scheduled messages
      const scheduled = (messagesRes.data.messages || []).filter(m => m.status === 'scheduled');
      setScheduledMessages(scheduled);
      
      // Fetch templates
      const templatesRes = await api.get('/communication/templates');
      setTemplates(templatesRes.data || []);
      
      // Fetch audience
      const audienceRes = await api.get('/communication/audience');
      setAudienceGroups(audienceRes.data || []);
      
    } catch (error) {
      console.error('Failed to fetch communication data:', error);
      // Empty state - no fallback mock data
      setAudienceGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (schedule = false) => {
    if (!newMessage.title || !newMessage.content || !newMessage.audience) {
      toast.error(isRTL ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    
    try {
      setSending(true);
      
      const payload = {
        title: newMessage.title,
        content: newMessage.content,
        audience: newMessage.audience,
        channels: ['in_app'],
        scheduled_at: schedule && newMessage.scheduled_at ? newMessage.scheduled_at : null
      };
      
      const response = await api.post('/communication', payload);
      
      toast.success(
        isRTL 
          ? (schedule ? 'تمت جدولة الرسالة بنجاح' : 'تم إرسال الرسالة بنجاح')
          : (schedule ? 'Message scheduled successfully' : 'Message sent successfully')
      );
      
      // Reset form
      setNewMessage({ title: '', content: '', audience: '', scheduled_at: '' });
      setNewMessageOpen(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setNewMessage(prev => ({
      ...prev,
      title: isRTL ? template.name : template.name_en,
      content: template.content_template || ''
    }));
  };

  const handleSendScheduledNow = async (messageId) => {
    try {
      await api.post(`/communication/${messageId}/send-now`);
      toast.success(isRTL ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
      fetchData();
      setScheduledMessagesOpen(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message');
    }
  };

  const handleUpdateScheduledMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      await api.put(`/communication/${selectedMessage.id}`, {
        title: selectedMessage.title,
        content: selectedMessage.content,
        audience: selectedMessage.audience,
        scheduled_at: selectedMessage.scheduled_at
      });
      toast.success(isRTL ? 'تم تحديث الرسالة المجدولة' : 'Scheduled message updated');
      fetchData();
      setEditScheduledOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Failed to update message:', error);
      toast.error(isRTL ? 'فشل تحديث الرسالة' : 'Failed to update message');
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/communication/${messageId}/read`);
      // Update local state
      setReceivedMessages(prev => 
        prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      sent: { label: isRTL ? 'مرسلة' : 'Sent', variant: 'default' },
      scheduled: { label: isRTL ? 'مجدولة' : 'Scheduled', variant: 'secondary' },
      draft: { label: isRTL ? 'مسودة' : 'Draft', variant: 'outline' }
    };
    return config[status] || config.sent;
  };

  const getAudienceIcon = (iconName) => {
    return iconMap[iconName] || Users;
  };

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
              <Button variant="outline" className="rounded-xl" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 me-2 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-brand-navy hover:bg-brand-navy/90" data-testid="new-message-btn">
                    <Plus className="h-4 w-4 me-2" />
                    {isRTL ? 'رسالة جديدة' : 'New Message'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-cairo">
                      {isRTL ? 'إنشاء رسالة جديدة' : 'Create New Message'}
                    </DialogTitle>
                    <DialogDescription>
                      {isRTL ? 'أرسل رسالة إلى المستخدمين المحددين' : 'Send a message to selected users'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الجمهور المستهدف' : 'Target Audience'} *</Label>
                      <Select 
                        value={newMessage.audience} 
                        onValueChange={(v) => setNewMessage(prev => ({ ...prev, audience: v }))}
                      >
                        <SelectTrigger className="rounded-xl" data-testid="audience-select">
                          <SelectValue placeholder={isRTL ? 'اختر الجمهور' : 'Select audience'} />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceGroups.map((group) => {
                            const Icon = getAudienceIcon(group.icon);
                            return (
                              <SelectItem key={group.id} value={group.id}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{isRTL ? group.name : group.name_en}</span>
                                  <Badge variant="secondary" className="ms-2">{group.count}</Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'عنوان الرسالة' : 'Message Title'} *</Label>
                      <Input 
                        value={newMessage.title}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={isRTL ? 'أدخل عنوان الرسالة...' : 'Enter message title...'} 
                        className="rounded-xl"
                        data-testid="message-title-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'نص الرسالة' : 'Message Content'} *</Label>
                      <Textarea 
                        value={newMessage.content}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                        placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'} 
                        className="rounded-xl min-h-[150px]"
                        data-testid="message-content-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'جدولة (اختياري)' : 'Schedule (Optional)'}</Label>
                      <Input 
                        type="datetime-local"
                        value={newMessage.scheduled_at}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, scheduled_at: e.target.value }))}
                        className="rounded-xl"
                        data-testid="schedule-input"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      className="rounded-xl"
                      onClick={() => setNewMessageOpen(false)}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    {newMessage.scheduled_at && (
                      <Button 
                        variant="secondary"
                        className="rounded-xl"
                        onClick={() => handleSendMessage(true)}
                        disabled={sending}
                      >
                        <Clock className="h-4 w-4 me-2" />
                        {isRTL ? 'جدولة' : 'Schedule'}
                      </Button>
                    )}
                    <Button 
                      className="rounded-xl bg-brand-navy hover:bg-brand-navy/90"
                      onClick={() => handleSendMessage(false)}
                      disabled={sending}
                      data-testid="send-message-btn"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 me-2" />
                      )}
                      {isRTL ? 'إرسال الآن' : 'Send Now'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-nassaq cursor-pointer hover:ring-2 hover:ring-brand-navy/50 transition-all" onClick={() => setSentMessagesOpen(true)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                  <Send className="h-6 w-6 text-brand-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sent}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'رسائل مرسلة' : 'Messages Sent'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq cursor-pointer hover:ring-2 hover:ring-green-500/50 transition-all" onClick={() => setReceivedMessagesOpen(true)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Inbox className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{receivedMessages.length}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'الرسائل المستلمة' : 'Received'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq cursor-pointer hover:ring-2 hover:ring-yellow-500/50 transition-all" onClick={() => setScheduledMessagesOpen(true)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.scheduled}</p>
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
                  <p className="text-2xl font-bold">{stats.templates || templates.length}</p>
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
                  {isRTL ? 'إنشاء رسالة سريعة' : 'Quick Compose'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'أرسل رسالة سريعة للمستخدمين' : 'Send a quick message to users'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {audienceGroups.map((group) => {
                      const Icon = getAudienceIcon(group.icon);
                      const isSelected = newMessage.audience === group.id;
                      
                      return (
                        <Button 
                          key={group.id} 
                          variant={isSelected ? 'default' : 'outline'}
                          className={`justify-start rounded-xl h-auto py-3 ${isSelected ? 'bg-brand-navy' : ''}`}
                          onClick={() => setNewMessage(prev => ({ ...prev, audience: group.id }))}
                          data-testid={`audience-btn-${group.id}`}
                        >
                          <Icon className="h-4 w-4 me-2" />
                          <div className="text-start">
                            <p className="text-sm">{isRTL ? group.name : group.name_en}</p>
                            <p className="text-xs text-muted-foreground">{group.count.toLocaleString()}</p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'عنوان الرسالة' : 'Message Title'}
                  </Label>
                  <Input 
                    value={newMessage.title}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={isRTL ? 'أدخل عنوان الرسالة...' : 'Enter message title...'} 
                    className="rounded-xl" 
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'نص الرسالة' : 'Message Content'}
                  </Label>
                  <Textarea 
                    placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'} 
                    className="rounded-xl min-h-[150px]"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setNewMessage({ title: '', content: '', audience: '', scheduled_at: '' })}
                  >
                    {isRTL ? 'مسح' : 'Clear'}
                  </Button>
                  <Button 
                    className="rounded-xl bg-brand-navy hover:bg-brand-navy/90"
                    onClick={() => handleSendMessage(false)}
                    disabled={sending || !newMessage.title || !newMessage.content || !newMessage.audience}
                    data-testid="quick-send-btn"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 me-2" />
                    )}
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
                  {templates.map((template) => {
                    const Icon = iconMap[template.icon] || Bell;
                    return (
                      <Button 
                        key={template.id} 
                        variant="ghost" 
                        className="w-full justify-start rounded-xl"
                        onClick={() => handleTemplateSelect(template)}
                        data-testid={`template-btn-${template.id}`}
                      >
                        <Icon className="h-4 w-4 me-2" />
                        {isRTL ? template.name : template.name_en}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo text-lg">{isRTL ? 'الرسائل الأخيرة' : 'Recent Messages'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}
                    </p>
                  ) : (
                    messages.slice(0, 5).map((msg) => {
                      const statusConfig = getStatusBadge(msg.status);
                      return (
                        <div key={msg.id} className="p-3 bg-muted/30 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium line-clamp-1">{msg.title}</p>
                            <Badge variant={statusConfig.variant} className="text-xs">
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {msg.audience === 'all' ? (isRTL ? 'الجميع' : 'Everyone') :
                             msg.audience === 'teachers' ? (isRTL ? 'المعلمين' : 'Teachers') :
                             msg.audience === 'students' ? (isRTL ? 'الطلاب' : 'Students') :
                             msg.audience === 'parents' ? (isRTL ? 'أولياء الأمور' : 'Parents') :
                             msg.audience}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
