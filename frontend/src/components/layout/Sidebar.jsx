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
  Shield,
  Activity,
  Link2,
  FileText,
  UserCog,
  Network,
} from 'lucide-react';

const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';

export const Sidebar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isImpersonating, schoolContext, getEffectiveRole, exitSchoolContext } = useAuth();
  const { isRTL } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle exit from school context (impersonation mode)
  const handleExitSchoolContext = () => {
    exitSchoolContext();
    navigate('/admin/schools');
  };

  const getMenuItems = () => {
    // Get effective role (supports impersonation)
    const effectiveRole = getEffectiveRole ? getEffectiveRole() : user?.role;
    
    // Platform Admin Menu Items - مدير المنصة
    // Based on Platform Admin Role Documentation
    const platformAdminItems = [
      {
        icon: LayoutDashboard,
        label: isRTL ? 'مركز القيادة' : 'Control Dashboard',
        href: '/admin',
        roles: ['platform_admin'],
      },
      {
        icon: Building2,
        label: isRTL ? 'إدارة المدارس' : 'Schools Management',
        href: '/admin/schools',
        roles: ['platform_admin'],
      },
      {
        icon: Users,
        label: isRTL ? 'إدارة المستخدمين' : 'Users Management',
        href: '/admin/users',
        roles: ['platform_admin'],
      },
      {
        icon: Activity,
        label: isRTL ? 'مراقبة النظام' : 'System Monitoring',
        href: '/admin/monitoring',
        roles: ['platform_admin'],
      },
      {
        icon: BarChart3,
        label: isRTL ? 'التقارير والتحليلات' : 'Analytics & Reports',
        href: '/admin/analytics',
        roles: ['platform_admin'],
      },
      {
        icon: Link2,
        label: isRTL ? 'التكاملات' : 'Integrations',
        href: '/admin/integrations',
        roles: ['platform_admin'],
      },
      {
        icon: Shield,
        label: isRTL ? 'مركز الأمان' : 'Security Center',
        href: '/admin/security',
        roles: ['platform_admin'],
      },
      {
        icon: FileText,
        label: isRTL ? 'سجلات التدقيق' : 'Audit Logs',
        href: '/admin/audit',
        roles: ['platform_admin', 'platform_security_officer', 'platform_data_analyst'],
      },
      {
        icon: MessageSquare,
        label: isRTL ? 'التواصل والإشعارات' : 'Communication & Notifications',
        href: '/admin/communication',
        roles: ['platform_admin'],
      },
      {
        icon: Settings,
        label: isRTL ? 'إعدادات النظام' : 'System Settings',
        href: '/settings',
        roles: ['platform_admin'],
      },
    ];

    // School Principal & Sub Admin Menu Items
    // Reorganized according to the required structure
    const schoolItems = [
      // 1. Dashboard Overview
      {
        icon: LayoutDashboard,
        label: isRTL ? 'مركز القيادة' : 'Command Center',
        href: '/principal',
        roles: ['school_principal', 'school_sub_admin'],
      },
      // 2. Schedule Management
      {
        icon: Calendar,
        label: isRTL ? 'الجدول المدرسي' : 'School Schedule',
        href: '/school/schedule',
        roles: ['school_principal', 'school_sub_admin'],
      },
      // 3. Users & Classes Management
      {
        icon: Users,
        label: isRTL ? 'إدارة المستخدمين والفصول' : 'Users & Classes',
        href: '/admin/users-management',
        roles: ['school_principal', 'school_sub_admin'],
        subItems: [
          {
            label: isRTL ? 'المعلمون' : 'Teachers',
            href: '/admin/teachers',
          },
          {
            label: isRTL ? 'الطلاب' : 'Students',
            href: '/admin/students',
          },
          {
            label: isRTL ? 'الفصول' : 'Classes',
            href: '/admin/classes',
          },
        ],
      },
      // 4. Attendance Management (Teachers Only)
      {
        icon: CalendarCheck,
        label: isRTL ? 'إدارة الحضور' : 'Attendance Management',
        href: '/admin/teacher-attendance',
        roles: ['school_principal', 'school_sub_admin'],
      },
      // 5. Assessments & Grades Management
      {
        icon: ClipboardList,
        label: isRTL ? 'إدارة الاختبارات والتقييمات' : 'Exams & Assessments',
        href: '/admin/assessments',
        roles: ['school_principal', 'school_sub_admin'],
      },
      // 6. School Settings
      {
        icon: Settings,
        label: isRTL ? 'إعدادات المدرسة' : 'School Settings',
        href: '/school/settings',
        roles: ['school_principal'],
      },
      // 7. Communication & Notifications
      {
        icon: Bell,
        label: isRTL ? 'مركز التواصل والإشعارات' : 'Communication Center',
        href: '/principal/communication',
        roles: ['school_principal', 'school_sub_admin'],
      },
      // 8. Reports & Analytics
      {
        icon: BarChart3,
        label: isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics',
        href: '/principal/reports',
        roles: ['school_principal', 'school_sub_admin'],
      },
      // 9. AI Insights
      {
        icon: Network,
        label: isRTL ? 'رؤى الذكاء الاصطناعي' : 'AI Insights',
        href: '/principal/ai-insights',
        roles: ['school_principal'],
      },
      // 10. Account Settings
      {
        icon: UserCog,
        label: isRTL ? 'إعدادات الحساب' : 'Account Settings',
        href: '/account/settings',
        roles: ['school_principal', 'school_sub_admin'],
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
    
    // Filter by effective role (supports impersonation)
    // effectiveRole is already defined at the start of this function
    const filteredItems = allItems.filter((item) => item.roles.includes(effectiveRole));
    
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
      <div className="p-4 flex flex-col items-center">
        {/* Logo and collapse button row */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full`}>
          {!collapsed && (
            <Link to="/">
              <img src={LOGO_WHITE} alt="نَسَّق" className="h-10 w-auto rounded-xl" />
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="flex-shrink-0">
              <img src={LOGO_WHITE} alt="نَسَّق" className="h-8 w-8 rounded-lg object-contain" />
            </Link>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-white/70 hover:text-white hover:bg-white/10 hidden lg:flex"
              data-testid="sidebar-collapse-btn"
            >
              {isRTL ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        
        {/* Collapse button when collapsed */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/70 hover:text-white hover:bg-white/10 mt-2 hidden lg:flex"
            data-testid="sidebar-collapse-btn"
          >
            {isRTL ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        )}
        
        {/* User info when collapsed */}
        {collapsed && user && (
          <div className="mt-3 text-center">
            <p className="text-xs font-medium text-white truncate max-w-[60px]">
              {user.full_name?.split(' ')[0]}
            </p>
            <p className="text-[10px] text-white/50 truncate max-w-[60px]">
              {isRTL
                ? user.role === 'platform_admin'
                  ? 'مدير المنصة'
                  : user.role === 'school_principal'
                  ? 'مدير المدرسة'
                  : user.role === 'teacher'
                  ? 'معلم'
                  : user.role?.replace('_', ' ')
                : user.role?.replace('_', ' ')}
            </p>
          </div>
        )}
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

      {/* User Info & Logout */}
      {!collapsed && user && (
        <div className="p-4 border-t border-white/10">
          {/* Impersonation Notice */}
          {isImpersonating && schoolContext && (
            <div className="mb-3 p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-200 text-xs mb-2">
                <Shield className="h-3 w-3" />
                <span className="font-medium">
                  {isRTL ? 'وضع المعاينة' : 'Preview Mode'}
                </span>
              </div>
              <p className="text-[10px] text-amber-100/80 truncate mb-2">
                {schoolContext.school_name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitSchoolContext}
                className="w-full text-xs h-7 text-amber-200 hover:text-white hover:bg-amber-500/30"
                data-testid="exit-school-context-btn"
              >
                <ChevronLeft className="h-3 w-3 me-1" />
                {isRTL ? 'العودة للمنصة' : 'Back to Platform'}
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-turquoise flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.full_name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-white/50 truncate">
                {(() => {
                  const effectiveRole = getEffectiveRole ? getEffectiveRole() : user.role;
                  if (isRTL) {
                    return effectiveRole === 'platform_admin'
                      ? 'مدير المنصة'
                      : effectiveRole === 'school_principal'
                      ? 'مدير المدرسة'
                      : effectiveRole === 'teacher'
                      ? 'معلم'
                      : effectiveRole;
                  }
                  return effectiveRole?.replace('_', ' ');
                })()}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            data-testid="logout-btn"
          >
            <LogOut className="h-4 w-4 me-2" />
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </div>
      )}
      
      {/* Collapsed Logout */}
      {collapsed && user && (
        <div className="p-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-full text-white/70 hover:text-white hover:bg-white/10"
            title={isRTL ? 'تسجيل الخروج' : 'Logout'}
            data-testid="logout-btn-collapsed"
          >
            <LogOut className="h-5 w-5" />
          </Button>
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
          flex-1 min-h-screen bg-background w-full
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
