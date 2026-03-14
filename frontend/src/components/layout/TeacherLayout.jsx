import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Home, Calendar, BookOpen, ClipboardCheck, FileText,
  Star, Users, MessageSquare, BarChart3, Settings, FolderOpen,
  Bell, Globe
} from 'lucide-react';

const teacherNavItems = [
  { path: '/teacher', label: 'الرئيسية', icon: Home },
  { path: '/teacher/home', label: 'لوحة التحكم', icon: Home },
  { path: '/teacher/schedule', label: 'الجدول', icon: Calendar },
  { path: '/teacher/classes', label: 'فصولي', icon: BookOpen },
  { path: '/teacher/attendance', label: 'الحضور', icon: ClipboardCheck },
  { path: '/teacher/assessments', label: 'التقييمات', icon: FileText },
  { path: '/teacher/behavior', label: 'السلوك', icon: Star },
  { path: '/teacher/students', label: 'الطلاب', icon: Users },
  { path: '/teacher/communication', label: 'التواصل', icon: MessageSquare },
  { path: '/teacher/reports', label: 'التقارير', icon: BarChart3 },
  { path: '/teacher/resources', label: 'المصادر', icon: FolderOpen },
  { path: '/teacher/settings', label: 'الإعدادات', icon: Settings },
];

const mobileNavItems = [
  { path: '/teacher', label: 'الرئيسية', icon: Home },
  { path: '/teacher/schedule', label: 'الجدول', icon: Calendar },
  { path: '/teacher/classes', label: 'فصولي', icon: BookOpen },
  { path: '/teacher/students', label: 'الطلاب', icon: Users },
  { path: '/teacher/settings', label: 'الإعدادات', icon: Settings },
];

export function TeacherLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isRTL, toggleLanguage } = useAuth();

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-2">
              <span className="font-cairo font-bold text-brand-navy text-sm">نَسَّق</span>
              <span className="text-muted-foreground text-xs">|</span>
              <span className="text-xs text-muted-foreground">{isRTL ? 'بوابة المعلم' : 'Teacher Portal'}</span>
            </div>

            <div className="flex items-center gap-2">
              {toggleLanguage && (
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={toggleLanguage}>
                  <Globe className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 relative"
                onClick={() => navigate('/teacher/communication')}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>

              <button
                onClick={() => navigate('/teacher/settings')}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-7 w-7 border border-brand-turquoise/30">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback className="bg-brand-navy text-white text-xs font-bold">
                    {user?.full_name?.charAt(0) || 'م'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium max-w-[100px] truncate hidden lg:block">
                  {user?.full_name}
                </span>
              </button>
            </div>
          </div>
        </div>

        {children}

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom">
          <nav className="flex justify-around items-center h-16 px-2">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-brand-turquoise'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pb-16 md:pb-0" />
      </div>
    </Sidebar>
  );
}
