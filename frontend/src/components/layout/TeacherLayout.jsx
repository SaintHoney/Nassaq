import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import {
  Home, Calendar, BookOpen, ClipboardCheck, FileText,
  Star, Users, MessageSquare, BarChart3, Settings, FolderOpen
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
  const { isRTL } = useAuth();

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
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
