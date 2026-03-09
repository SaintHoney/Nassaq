import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  Calendar,
  CalendarCheck,
  ClipboardList,
  AlertTriangle,
  Info,
  MessageSquare,
  Megaphone,
  Sun,
  Moon,
  Globe,
  Eye,
  Clock,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { NotificationBell } from '../components/notifications/NotificationBell';

const notificationTypeConfig = {
  system: { 
    icon: Info, 
    label: { ar: 'النظام', en: 'System' }, 
    color: 'bg-gray-500',
    iconColor: 'text-gray-500'
  },
  attendance: { 
    icon: CalendarCheck, 
    label: { ar: 'الحضور', en: 'Attendance' }, 
    color: 'bg-blue-500',
    iconColor: 'text-blue-500'
  },
  schedule: { 
    icon: Calendar, 
    label: { ar: 'الجدول', en: 'Schedule' }, 
    color: 'bg-purple-500',
    iconColor: 'text-purple-500'
  },
  assessment: { 
    icon: ClipboardList, 
    label: { ar: 'التقييمات', en: 'Assessments' }, 
    color: 'bg-green-500',
    iconColor: 'text-green-500'
  },
  behaviour: { 
    icon: AlertTriangle, 
    label: { ar: 'السلوك', en: 'Behaviour' }, 
    color: 'bg-yellow-500',
    iconColor: 'text-yellow-500'
  },
  communication: { 
    icon: MessageSquare, 
    label: { ar: 'التواصل', en: 'Communication' }, 
    color: 'bg-teal-500',
    iconColor: 'text-teal-500'
  },
  announcement: { 
    icon: Megaphone, 
    label: { ar: 'الإعلانات', en: 'Announcements' }, 
    color: 'bg-orange-500',
    iconColor: 'text-orange-500'
  },
};

const priorityConfig = {
  low: { label: { ar: 'منخفضة', en: 'Low' }, color: 'bg-gray-400' },
  medium: { label: { ar: 'متوسطة', en: 'Medium' }, color: 'bg-blue-400' },
  high: { label: { ar: 'مرتفعة', en: 'High' }, color: 'bg-orange-500' },
  critical: { label: { ar: 'حرجة', en: 'Critical' }, color: 'bg-red-600' },
};

export const NotificationsPage = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const navigate = useNavigate();
  
  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [analytics, setAnalytics] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/notifications?limit=100';
      if (filterType && filterType !== 'all') {
        url += `&notification_type=${filterType}`;
      }
      if (filterRead !== 'all') {
        url += `&read_status=${filterRead === 'read'}`;
      }
      
      const response = await api.get(url);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [api, filterType, filterRead]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/notifications/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (user?.role === 'platform_admin' || user?.role === 'school_principal') {
      fetchAnalytics();
    }
  }, [fetchNotifications, user?.role]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_status: true } : n)
      );
      toast.success(isRTL ? 'تم تحديد الإشعار كمقروء' : 'Marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error(isRTL ? 'فشل تحديد الإشعار' : 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
      toast.success(isRTL ? 'تم تحديد جميع الإشعارات كمقروءة' : 'All marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error(isRTL ? 'فشل تحديد الإشعارات' : 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success(isRTL ? 'تم حذف الإشعار' : 'Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error(isRTL ? 'فشل حذف الإشعار' : 'Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read_status) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate if action_url exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return isRTL ? 'الآن' : 'Just now';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    if (days < 7) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  const unreadCount = notifications.filter(n => !n.read_status).length;

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="notifications-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-7 w-7 text-brand-turquoise" />
                {isRTL ? 'الإشعارات' : 'Notifications'}
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'جميع إشعاراتك في مكان واحد' : 'All your notifications in one place'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                variant="outline"
                onClick={fetchNotifications}
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              {unreadCount > 0 && (
                <Button 
                  onClick={handleMarkAllAsRead}
                  className="bg-brand-turquoise hover:bg-brand-turquoise-light rounded-xl"
                  data-testid="mark-all-read-btn"
                >
                  <CheckCheck className="h-4 w-4 me-2" />
                  {isRTL ? 'تحديد الكل كمقروء' : 'Mark All Read'}
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Analytics Cards (Admin Only) */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="card-nassaq">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-brand-navy" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics.total_notifications}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الإشعارات' : 'Total'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-nassaq">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics.read_count}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'مقروءة' : 'Read'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-nassaq">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <BellOff className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics.unread_count}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'غير مقروءة' : 'Unread'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-nassaq">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-turquoise/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-brand-turquoise" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics.read_rate}%</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'نسبة القراءة' : 'Read Rate'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="card-nassaq">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{isRTL ? 'تصفية:' : 'Filter:'}</span>
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue placeholder={isRTL ? 'النوع' : 'Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                    {Object.entries(notificationTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {isRTL ? config.label.ar : config.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterRead} onValueChange={setFilterRead}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="unread">{isRTL ? 'غير مقروء' : 'Unread'}</SelectItem>
                    <SelectItem value="read">{isRTL ? 'مقروء' : 'Read'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="card-nassaq">
            <CardHeader>
              <CardTitle className="font-cairo">{isRTL ? 'قائمة الإشعارات' : 'Notification List'}</CardTitle>
              <CardDescription>
                {isRTL ? `${notifications.length} إشعار` : `${notifications.length} notifications`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا يوجد إشعارات' : 'No notifications'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const typeConfig = notificationTypeConfig[notification.notification_type] || notificationTypeConfig.system;
                      const priorityConf = priorityConfig[notification.priority] || priorityConfig.medium;
                      const IconComponent = typeConfig.icon;
                      
                      return (
                        <Card 
                          key={notification.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            !notification.read_status 
                              ? 'bg-brand-turquoise/5 border-brand-turquoise/30' 
                              : 'bg-background'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                          data-testid={`notification-${notification.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color}/10`}>
                                <IconComponent className={`h-5 w-5 ${typeConfig.iconColor}`} />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className={`font-medium ${!notification.read_status ? 'font-bold' : ''}`}>
                                      {isRTL ? notification.title : (notification.title_en || notification.title)}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {isRTL ? notification.message : (notification.message_en || notification.message)}
                                    </p>
                                  </div>
                                  
                                  {/* Badges */}
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge className={`${typeConfig.color} text-white text-xs`}>
                                      {isRTL ? typeConfig.label.ar : typeConfig.label.en}
                                    </Badge>
                                    {notification.priority !== 'medium' && (
                                      <Badge className={`${priorityConf.color} text-white text-xs`}>
                                        {isRTL ? priorityConf.label.ar : priorityConf.label.en}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Footer */}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(notification.created_at)}
                                    {notification.sender_name && (
                                      <>
                                        <span>•</span>
                                        <span>{notification.sender_name}</span>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    {!notification.read_status && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="h-8 rounded-xl"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="h-8 rounded-xl text-red-500 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Unread indicator */}
                              {!notification.read_status && (
                                <div className="w-2 h-2 rounded-full bg-brand-turquoise animate-pulse" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
