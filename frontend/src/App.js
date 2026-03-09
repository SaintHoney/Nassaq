import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SchoolDashboard } from "./pages/SchoolDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import { TeachersPage } from "./pages/TeachersPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ClassesPage } from "./pages/ClassesPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { TimeSlotsPage } from "./pages/TimeSlotsPage";
import { TeacherAssignmentsPage } from "./pages/TeacherAssignmentsPage";
import { AttendancePage } from "./pages/AttendancePage";
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
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { SecurityCenterPage } from "./pages/SecurityCenterPage";
import { CommunicationNotificationsPage } from "./pages/CommunicationNotificationsPage";
import { TeacherRequestsPage } from "./pages/TeacherRequestsPage";
import TenantsManagement from "./pages/TenantsManagement";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import UsersManagement from "./pages/UsersManagement";

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
      case 'school_sub_admin':
        return <Navigate to="/school" replace />;
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
            <PlatformSchoolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenants"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <TenantsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <PlatformUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-requests"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <TeacherRequestsPage />
          </ProtectedRoute>
        }
      />
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
