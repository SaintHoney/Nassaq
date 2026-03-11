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
    navigate('/admin/schools');
  };

  return (
    <Sidebar>
      <div className="min-h-screen" data-testid="principal-dashboard">
        {/* Impersonation Banner - Shows when Platform Admin is viewing school context */}
        {isImpersonating && schoolContext && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-4 py-2 flex items-center justify-between" data-testid="impersonation-banner">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {isRTL ? 'وضع المعاينة:' : 'Preview Mode:'}
                </span>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  <Building2 className="h-3 w-3 me-1" />
                  {schoolContext.school_name}
                </Badge>
                <span className="text-xs opacity-80">
                  {isRTL ? '(أنت تشاهد كمدير مدرسة)' : '(Viewing as School Manager)'}
                </span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20 rounded-lg"
              onClick={handleExitImpersonation}
              data-testid="exit-impersonation-btn"
            >
              <ArrowLeft className="h-4 w-4 me-1" />
              {isRTL ? 'العودة للمنصة' : 'Back to Platform'}
            </Button>
          </div>
        )}
        
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
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
