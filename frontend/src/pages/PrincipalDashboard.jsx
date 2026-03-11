import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { SchoolDashboardContent } from '../components/dashboard/SchoolDashboardContent';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Sun,
  Moon,
  Globe,
  ArrowLeft,
  Shield,
  Building2,
  X,
} from 'lucide-react';

// Principal Dashboard - Uses the same SchoolDashboardContent component
// This ensures consistency between SchoolDashboard and PrincipalDashboard
export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const { user, schoolContext, isImpersonating, exitSchoolContext } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // Handle exit impersonation mode
  const handleExitImpersonation = () => {
    exitSchoolContext();
    // Add small delay to ensure context is cleared before navigation
    setTimeout(() => {
      navigate('/admin/tenants', { replace: true });
    }, 100);
  };

  return (
    <Sidebar>
      <div className="min-h-screen" data-testid="principal-dashboard">
        {/* Impersonation Banner - Sticky at top, shows when Platform Admin is viewing school context */}
        {isImpersonating && schoolContext && (
          <div 
            className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-4 py-3 flex items-center justify-between shadow-lg" 
            data-testid="impersonation-banner"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">
                  {isRTL ? 'أنت الآن تعاين مدرسة:' : 'You are now previewing:'}
                </span>
                <span className="text-white/90 font-cairo text-lg">
                  {schoolContext.school_name}
                </span>
              </div>
            </div>
            <Button 
              size="default" 
              className="bg-white text-amber-600 hover:bg-white/90 rounded-xl font-bold shadow-md"
              onClick={handleExitImpersonation}
              data-testid="exit-impersonation-btn"
            >
              <ArrowLeft className={`h-4 w-4 me-2 ${isRTL ? 'rotate-180' : ''}`} />
              {isRTL ? 'العودة للمنصة' : 'Back to Platform'}
            </Button>
          </div>
        )}
        
        {/* Header */}
        <header className={`sticky ${isImpersonating ? 'top-[64px]' : 'top-0'} z-30 glass border-b border-border/50 px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold">
                {isRTL ? 'مركز القيادة' : 'Command Center'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isImpersonating && schoolContext 
                  ? (isRTL ? `معاينة: ${schoolContext.school_name}` : `Previewing: ${schoolContext.school_name}`)
                  : (isRTL ? `مرحباً، ${user?.full_name}` : `Welcome, ${user?.full_name}`)
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} data-testid="language-toggle">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="theme-toggle">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Content - New Command Center Dashboard */}
        <div className="p-6">
          <SchoolDashboardContent schoolContext={schoolContext} isImpersonating={isImpersonating} />
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
