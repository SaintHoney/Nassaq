import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('nassaq_theme');
    return stored || 'light';
  });

  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('nassaq_language');
    return stored || 'ar';
  });

  // Apply theme and language to document
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('nassaq_theme', theme);
    
    // Language direction - apply to both html and body
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    root.dir = dir;
    root.lang = language;
    body.dir = dir;
    
    // Update document title based on language
    document.title = 'NASSAQ | نَسَّق';
    
    // Store language preference
    localStorage.setItem('nassaq_language', language);
    
    // Force re-render of CSS custom properties for RTL/LTR
    root.style.setProperty('--direction', dir);
    root.style.setProperty('--text-align', language === 'ar' ? 'right' : 'left');
    root.style.setProperty('--text-align-opposite', language === 'ar' ? 'left' : 'right');
  }, [theme, language]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === 'ar' ? 'en' : 'ar';
      // Force immediate update
      const root = window.document.documentElement;
      const body = window.document.body;
      const dir = newLang === 'ar' ? 'rtl' : 'ltr';
      root.dir = dir;
      root.lang = newLang;
      body.dir = dir;
      localStorage.setItem('nassaq_language', newLang);
      return newLang;
    });
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    language,
    setLanguage,
    toggleLanguage,
    isRTL: language === 'ar',
    isDark: theme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Translation helper
export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    features: 'المميزات',
    pricing: 'الأسعار',
    contact: 'تواصل معنا',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    
    // Landing Page
    heroTitle: 'نظام إدارة المدارس الذكي',
    heroSubtitle: 'منصة متكاملة مدعومة بالذكاء الاصطناعي لإدارة العملية التعليمية بكفاءة عالية',
    getStarted: 'ابدأ الآن',
    learnMore: 'اعرف المزيد',
    
    // Features
    aiAssistant: 'المساعد الذكي',
    aiAssistantDesc: 'حكيم - مساعدك الذكي لتحليل البيانات وتقديم التوصيات',
    schoolManagement: 'إدارة المدارس',
    schoolManagementDesc: 'إدارة شاملة للمدارس والفصول والمواد الدراسية',
    userManagement: 'إدارة المستخدمين',
    userManagementDesc: 'إدارة المعلمين والطلاب وأولياء الأمور بسهولة',
    analytics: 'التحليلات',
    analyticsDesc: 'تقارير وإحصائيات تفصيلية لمتابعة الأداء',
    
    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    
    // Dashboard
    overview: 'نظرة عامة',
    schools: 'المدارس',
    users: 'المستخدمين',
    settings: 'الإعدادات',
    totalSchools: 'إجمالي المدارس',
    totalStudents: 'إجمالي الطلاب',
    totalTeachers: 'إجمالي المعلمين',
    activeSchools: 'المدارس النشطة',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    search: 'بحث',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
  },
  en: {
    // Navigation
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    
    // Landing Page
    heroTitle: 'Smart School Management System',
    heroSubtitle: 'AI-powered integrated platform for efficient educational management',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Features
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Hakim - Your intelligent assistant for data analysis and recommendations',
    schoolManagement: 'School Management',
    schoolManagementDesc: 'Comprehensive management of schools, classes, and subjects',
    userManagement: 'User Management',
    userManagementDesc: 'Easily manage teachers, students, and parents',
    analytics: 'Analytics',
    analyticsDesc: 'Detailed reports and statistics to track performance',
    
    // Auth
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    
    // Dashboard
    overview: 'Overview',
    schools: 'Schools',
    users: 'Users',
    settings: 'Settings',
    totalSchools: 'Total Schools',
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    activeSchools: 'Active Schools',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
  },
};

export const useTranslation = () => {
  const { language } = useTheme();
  
  const t = (key) => {
    return translations[language]?.[key] || translations.ar[key] || key;
  };
  
  return { t, language };
};
