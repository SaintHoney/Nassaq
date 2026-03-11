import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nassaq_token'));
  const [loading, setLoading] = useState(true);
  
  // School Context Switching (Platform Admin -> School Manager simulation)
  const [schoolContext, setSchoolContext] = useState(() => {
    const saved = sessionStorage.getItem('nassaq_school_context');
    return saved ? JSON.parse(saved) : null;
  });
  const [isImpersonating, setIsImpersonating] = useState(() => {
    return sessionStorage.getItem('nassaq_impersonating') === 'true';
  });

  const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests - with school context support
  api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem('nassaq_token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    
    // Add school context header when impersonating
    const savedContext = sessionStorage.getItem('nassaq_school_context');
    if (savedContext) {
      const ctx = JSON.parse(savedContext);
      if (ctx?.school_id) {
        config.headers['X-School-Context'] = ctx.school_id;
      }
    }
    return config;
  });

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('nassaq_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('nassaq_token', access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'فشل تسجيل الدخول';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('nassaq_token', access_token);
      setToken(access_token);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.detail || 'فشل إنشاء الحساب';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('nassaq_token');
    sessionStorage.removeItem('nassaq_school_context');
    sessionStorage.removeItem('nassaq_impersonating');
    setToken(null);
    setUser(null);
    setSchoolContext(null);
    setIsImpersonating(false);
  };
  
  // Enter School Context (Platform Admin simulation of School Manager)
  const enterSchoolContext = (school) => {
    const ctx = {
      school_id: school.id,
      school_name: school.name,
      school_name_en: school.name_en,
      school_code: school.code,
      original_role: user?.role,
      entered_at: new Date().toISOString()
    };
    sessionStorage.setItem('nassaq_school_context', JSON.stringify(ctx));
    sessionStorage.setItem('nassaq_impersonating', 'true');
    setSchoolContext(ctx);
    setIsImpersonating(true);
    return ctx;
  };
  
  // Exit School Context (Return to Platform Admin)
  const exitSchoolContext = () => {
    sessionStorage.removeItem('nassaq_school_context');
    sessionStorage.removeItem('nassaq_impersonating');
    setSchoolContext(null);
    setIsImpersonating(false);
  };
  
  // Get effective role (simulated or actual)
  const getEffectiveRole = () => {
    if (isImpersonating && schoolContext) {
      return 'school_principal'; // Simulate School Manager role
    }
    return user?.role;
  };
  
  // Get effective tenant_id (school_id)
  const getEffectiveTenantId = () => {
    if (isImpersonating && schoolContext) {
      return schoolContext.school_id;
    }
    return user?.tenant_id;
  };

  const updatePreferences = async (preferences) => {
    try {
      await api.put('/auth/preferences', null, { params: preferences });
      setUser((prev) => ({ ...prev, ...preferences }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'فشل تحديث الإعدادات' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updatePreferences,
    api,
    isAuthenticated: !!user,
    isPlatformAdmin: user?.role === 'platform_admin',
    isSchoolPrincipal: user?.role === 'school_principal',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
