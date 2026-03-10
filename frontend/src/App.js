import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TeacherSelfRegistration } from "./pages/TeacherSelfRegistration";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SchoolDashboard } from "./pages/SchoolDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import { TeachersPage } from "./pages/TeachersPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ClassesPage } from "./pages/ClassesPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { TimeSlotsPage } from "./pages/TimeSlotsPage";
import { TeacherAssignmentsPage } from "./pages/TeacherAssignmentsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { TeacherAttendancePage } from "./pages/TeacherAttendancePage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { NotificationsPage } from "./pages/NotificationsPage";

// Platform Admin Pages
import { PlatformSchoolsPage } from "./pages/PlatformSchoolsPage";
import { PlatformUsersPage } from "./pages/PlatformUsersPage";
import { PlatformReportsPage } from "./pages/PlatformReportsPage";
import { PlatformNotificationsPage } from "./pages/PlatformNotificationsPage";
import { PlatformSettingsPage } from "./pages/PlatformSettingsPage";
import { RulesManagementPage } from "./pages/RulesManagementPage";
import { SystemMonitoringPage } from "./pages/SystemMonitoringPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SecurityCenterPage from "./pages/SecurityCenterPage";
import { CommunicationNotificationsPage } from "./pages/CommunicationNotificationsPage";
import { CommunicationCenterPage } from "./pages/CommunicationCenterPage";
// TeacherRequestsPage removed - now integrated in UsersManagement
import TenantsManagement from "./pages/TenantsManagement";

// School Principal Pages
import { SchoolSettingsPage } from "./pages/SchoolSettingsPage";
import { SchoolReportsPage } from "./pages/SchoolReportsPage";
import { AIInsightsPage } from "./pages/AIInsightsPage";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import UsersManagement from "./pages/UsersManagement";
import UserDetailsPage from "./pages/UserDetailsPage";
import { PlatformAnalyticsPage } from "./pages/PlatformAnalyticsPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, skipPasswordCheck = false }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-navy">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user must change password (skip for password change page itself)
  if (!skipPasswordCheck && user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
      case 'platform_admin':
        return <Navigate to="/admin" replace />;
      case 'school_principal':
        return <Navigate to="/principal" replace />;
      case 'school_sub_admin':
        return <Navigate to="/school" replace />;
      case 'teacher':
        return <Navigate to="/teacher" replace />;
      case 'student':
        return <Navigate to="/student" replace />;
      case 'parent':
        return <Navigate to="/parent" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-navy">جاري التحميل...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
      case 'platform_admin':
        return <Navigate to="/admin" replace />;
      case 'school_principal':
        return <Navigate to="/principal" replace />;
      case 'school_sub_admin':
        return <Navigate to="/school" replace />;
      case 'teacher':
        return <Navigate to="/teacher" replace />;
      case 'student':
        return <Navigate to="/student" replace />;
      case 'parent':
        return <Navigate to="/parent" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/teacher-register"
        element={<TeacherSelfRegistration />}
      />

      {/* Force Password Change Route */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute skipPasswordCheck={true}>
            <ForcePasswordChange />
          </ProtectedRoute>
        }
      />

      {/* Platform Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schools"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <TenantsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schools-table"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <PlatformSchoolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <UserDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users-old"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <PlatformUsersPage />
          </ProtectedRoute>
        }
      />
      {/* Teacher Requests page removed - functionality merged into UsersManagement */}
      <Route
        path="/admin/rules"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <RulesManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monitoring"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <SystemMonitoringPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/integrations"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/security"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <SecurityCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/communication"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <CommunicationNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <PlatformAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['platform_admin', 'ministry_rep']}>
            <PlatformReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['platform_admin', 'school_principal', 'school_sub_admin', 'teacher']}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['platform_admin', 'school_principal']}>
            <PlatformSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* School Routes */}
      <Route
        path="/school"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <SchoolDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Teacher Dashboard Route */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Student Dashboard Route */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Parent Dashboard Route */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Principal Dashboard Route */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute allowedRoles={['school_principal']}>
            <PrincipalDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Principal Communication Center - مركز التواصل لمدير المدرسة */}
      <Route
        path="/principal/communication"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <CommunicationCenterPage />
          </ProtectedRoute>
        }
      />
      
      {/* Attendance Route */}
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin', 'teacher']}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      
      {/* Assessment Route */}
      <Route
        path="/admin/assessments"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin', 'teacher']}>
            <AssessmentPage />
          </ProtectedRoute>
        }
      />

      {/* School Management Routes - Only for School Principal and Sub Admin (NOT Platform Admin) */}
      <Route
        path="/admin/users-management"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <TeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <TeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <ClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <SubjectsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Scheduling Routes - Only for School Principal and Sub Admin (NOT Platform Admin) */}
      <Route
        path="/admin/schedule"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <SchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/time-slots"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <TimeSlotsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-assignments"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <TeacherAssignmentsPage />
          </ProtectedRoute>
        }
      />

      {/* Teacher Attendance Management - For School Principal */}
      <Route
        path="/admin/teacher-attendance"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <TeacherAttendancePage />
          </ProtectedRoute>
        }
      />

      {/* School Principal Settings & Reports */}
      <Route
        path="/principal/settings"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <SchoolSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/principal/reports"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <SchoolReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/principal/ai-insights"
        element={
          <ProtectedRoute allowedRoles={['school_principal', 'school_sub_admin']}>
            <AIInsightsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Account Settings - All authenticated users */}
      <Route
        path="/account/settings"
        element={
          <ProtectedRoute allowedRoles={['platform_admin', 'school_principal', 'school_sub_admin', 'teacher', 'student', 'parent']}>
            <AccountSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
