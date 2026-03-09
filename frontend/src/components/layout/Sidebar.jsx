import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, useTranslation } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { NotificationBell } from '../notifications/NotificationBell';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  Calendar,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Bell,
  MessageSquare,
  LogOut,
} from 'lucide-react';

const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';

export const Sidebar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isRTL } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    // Platform Admin Menu Items
    const platformAdminItems = [
      {
        icon: LayoutDashboard,
        label: isRTL ? 'نظرة عامة' : 'Overview',
        href: '/admin',
        roles: ['platform_admin'],
      },
      {
        icon: Building2,
        label: isRTL ? 'المدارس' : 'Schools',
        href: '/admin/schools',
        roles: ['platform_admin'],
      },
      {
        icon: Users,
        label: isRTL ? 'المستخدمين' : 'Users',
        href: '/admin/users',
        roles: ['platform_admin'],
      },
      {
        icon: BarChart3,
        label: isRTL ? 'التقارير' : 'Reports',
        href: '/admin/reports',
        roles: ['platform_admin', 'ministry_rep'],
      },
      {
        icon: Bell,
        label: isRTL ? 'الإشعارات' : 'Notifications',
        href: '/notifications',
        roles: ['platform_admin'],
      },
      {
        icon: Settings,
        label: isRTL ? 'الإعدادات' : 'Settings',
        href: '/settings',
        roles: ['platform_admin'],
      },
    ];

    // School Principal & Sub Admin Menu Items
    const schoolItems = [
      {
        icon: LayoutDashboard,
        label: isRTL ? 'نظرة عامة' : 'Overview',
        href: '/school',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: UserCheck,
        label: isRTL ? 'المعلمون' : 'Teachers',
        href: '/admin/teachers',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: GraduationCap,
        label: isRTL ? 'الطلاب' : 'Students',
        href: '/admin/students',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: BookOpen,
        label: isRTL ? 'الفصول' : 'Classes',
        href: '/admin/classes',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: MessageSquare,
        label: isRTL ? 'المواد الدراسية' : 'Subjects',
        href: '/admin/subjects',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: Calendar,
        label: isRTL ? 'الجدول المدرسي' : 'Schedule',
        href: '/admin/schedule',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: CalendarCheck,
        label: isRTL ? 'الحضور والغياب' : 'Attendance',
        href: '/admin/attendance',
        roles: ['school_principal', 'school_sub_admin', 'teacher'],
      },
      {
        icon: ClipboardList,
        label: isRTL ? 'التقييمات والدرجات' : 'Assessments',
        href: '/admin/assessments',
        roles: ['school_principal', 'school_sub_admin', 'teacher'],
      },
      {
        icon: BarChart3,
        label: isRTL ? 'التقارير' : 'Reports',
        href: '/admin/reports',
        roles: ['school_principal'],
      },
      {
        icon: Bell,
        label: isRTL ? 'الإشعارات' : 'Notifications',
        href: '/notifications',
        roles: ['school_principal', 'school_sub_admin'],
      },
      {
        icon: Settings,
        label: isRTL ? 'الإعدادات' : 'Settings',
        href: '/settings',
        roles: ['school_principal'],
      },
    ];

    // Teacher Menu Items
    const teacherItems = [
      {
        icon: Calendar,
        label: isRTL ? 'الجدول المدرسي' : 'Schedule',
        href: '/admin/schedule',
        roles: ['teacher'],
      },
      {
        icon: CalendarCheck,
        label: isRTL ? 'الحضور والغياب' : 'Attendance',
        href: '/admin/attendance',
        roles: ['teacher'],
      },
      {
        icon: ClipboardList,
        label: isRTL ? 'التقييمات والدرجات' : 'Assessments',
        href: '/admin/assessments',
        roles: ['teacher'],
      },
      {
        icon: Bell,
        label: isRTL ? 'الإشعارات' : 'Notifications',
        href: '/notifications',
        roles: ['teacher'],
      },
    ];

    // Combine all items
    const allItems = [...platformAdminItems, ...schoolItems, ...teacherItems];
    
    // Filter by role and remove duplicates
    const filteredItems = allItems.filter((item) => item.roles.includes(user?.role));
    
    // Remove duplicates by href
    const uniqueItems = filteredItems.reduce((acc, current) => {
      const exists = acc.find(item => item.href === current.href);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueItems;
  };

  const menuItems = getMenuItems();

  const isActive = (href) => location.pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/" className={`${collapsed ? 'hidden' : 'block'}`}>
          <img src={LOGO_WHITE} alt="نَسَّق" className="h-10 w-auto" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10 hidden lg:flex"
          data-testid="sidebar-collapse-btn"
        >
          {isRTL ? (
            collapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
          ) : (
            collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              data-testid={`sidebar-link-${item.href.replace(/\//g, '-')}`}
              className={`sidebar-item ${
                isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-turquoise flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.full_name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-white/50 truncate">
                {isRTL
                  ? user.role === 'platform_admin'
                    ? 'مدير المنصة'
                    : user.role === 'school_principal'
                    ? 'مدير المدرسة'
                    : user.role
                  : user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 start-4 z-50 bg-brand-navy text-white"
        data-testid="mobile-sidebar-toggle"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`
          fixed inset-y-0 z-40 bg-brand-navy
          transition-all duration-300 ease-in-out
          ${isRTL ? 'right-0' : 'left-0'}
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 min-h-screen bg-background
          transition-all duration-300
          ${isRTL
            ? collapsed ? 'lg:mr-20' : 'lg:mr-72'
            : collapsed ? 'lg:ml-20' : 'lg:ml-72'
          }
        `}
      >
        {children}
      </main>
    </div>
  );
};
