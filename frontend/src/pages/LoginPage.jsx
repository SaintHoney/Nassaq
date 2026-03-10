import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Globe,
  Home,
  Loader2,
} from 'lucide-react';

// Assets
const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { isRTL, toggleLanguage } = useTheme();
  const navigate = useNavigate();

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value) => {
    if (!value) {
      setEmailError(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError(isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        switch (result.user.role) {
          case 'platform_admin':
            navigate('/admin');
            break;
          case 'school_principal':
          case 'school_sub_admin':
            navigate('/school');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          case 'student':
            navigate('/student');
            break;
          case 'parent':
            navigate('/parent');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(result.error || (isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
        toast.error(result.error);
      }
    } catch (err) {
      setError(isRTL ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login');
      toast.error(isRTL ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'} data-testid="login-page">
      {/* ========== الجانب البصري (Brand / Visual Side) - بدون صورة حكيم ========== */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative"
        style={{
          backgroundImage: `url(${BG_PATTERN})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-brand-navy/95" />
        
        <div className="relative z-10 text-center max-w-md">
          {/* Logo - Very Large with Curved Corners */}
          <img
            src={LOGO_WHITE}
            alt="نَسَّق"
            className="h-32 lg:h-40 w-auto mx-auto mb-8 rounded-3xl"
            data-testid="login-logo"
          />
          
          {/* Tagline */}
          <h2 className="font-cairo text-4xl font-bold text-white mb-4">
            {isRTL ? 'نَسَّق' : 'NASSAQ'}
          </h2>
          <p className="text-2xl text-brand-turquoise font-cairo font-semibold mb-8">
            {isRTL ? 'من البيانات إلى القرار' : 'From Data to Decisions'}
          </p>
          
          <p className="text-white/60 font-tajawal">
            {isRTL 
              ? 'سجل دخولك للوصول إلى لوحة التحكم وإدارة مدرستك بذكاء'
              : 'Sign in to access your dashboard and manage your school smartly'
            }
          </p>
        </div>
      </div>

      {/* ========== الجانب التشغيلي (Login Form Side) ========== */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-foreground rounded-xl"
            data-testid="back-to-website-btn"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="font-tajawal">
                {isRTL ? 'العودة للموقع' : 'Back to Website'}
              </span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            onClick={toggleLanguage}
            className="rounded-xl border-border/50"
            data-testid="language-toggle-btn"
          >
            <Globe className="h-5 w-5 me-2" />
            <span className="font-tajawal">{isRTL ? 'EN' : 'عربي'}</span>
          </Button>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
          <Card className="w-full max-w-md card-nassaq" data-testid="login-card">
            <CardHeader className="text-center pb-2">
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </h1>
              <p className="text-muted-foreground font-tajawal text-sm">
                {isRTL
                  ? 'أدخل بيانات حسابك للوصول إلى لوحة التحكم'
                  : 'Enter your credentials to access your dashboard'}
              </p>
            </CardHeader>
            
            <CardContent className="pt-4">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-tajawal text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-tajawal">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      onBlur={() => validateEmail(email)}
                      className={`ps-10 h-12 rounded-xl font-tajawal ${emailError ? 'border-destructive' : ''}`}
                      disabled={loading}
                      data-testid="login-email-input"
                    />
                  </div>
                  {emailError && (
                    <p className="text-destructive text-xs font-tajawal">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="font-tajawal">
                      {isRTL ? 'كلمة المرور' : 'Password'}
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-brand-turquoise hover:underline font-tajawal"
                      data-testid="forgot-password-link"
                    >
                      {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                      }}
                      onBlur={() => validatePassword(password)}
                      className={`ps-10 pe-10 h-12 rounded-xl font-tajawal ${passwordError ? 'border-destructive' : ''}`}
                      disabled={loading}
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      data-testid="toggle-password-btn"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-destructive text-xs font-tajawal">{passwordError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="rounded"
                    data-testid="remember-me-checkbox"
                  />
                  <Label htmlFor="rememberMe" className="font-tajawal text-sm cursor-pointer">
                    {isRTL ? 'تذكرني' : 'Remember me'}
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-brand-navy hover:bg-brand-navy-light font-cairo text-base"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                      {isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground font-tajawal">
                  {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                  <Link 
                    to="/register" 
                    className="text-brand-turquoise hover:underline font-medium"
                    data-testid="register-link"
                  >
                    {isRTL ? 'تسجيل جديد' : 'Register'}
                  </Link>
                </p>
              </div>

              {/* Test Accounts Section */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground font-tajawal text-center mb-3">
                  {isRTL ? '🔐 حسابات تجريبية للاختبار:' : '🔐 Demo Accounts for Testing:'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Platform Admin - Full Width First */}
                  <div 
                    className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-brand-navy/10 to-brand-gold/10 border-2 border-brand-navy/30 cursor-pointer hover:border-brand-navy/50 transition-all hover:shadow-md"
                    onClick={() => {
                      setEmail('admin@nassaq.com');
                      setPassword('NassaqAdmin2026');
                    }}
                    data-testid="test-admin-credentials"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-brand-navy flex items-center justify-center">
                          <span className="text-white text-xs font-bold">👑</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-navy dark:text-brand-gold">
                            {isRTL ? 'مدير المنصة' : 'Platform Admin'}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">admin@nassaq.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-turquoise font-medium">{isRTL ? 'صلاحيات كاملة' : 'Full Access'}</span>
                    </div>
                  </div>
                  
                  {/* School Principal */}
                  <div 
                    className="p-2.5 rounded-xl bg-brand-turquoise/5 border border-brand-turquoise/20 cursor-pointer hover:bg-brand-turquoise/10 transition-colors"
                    onClick={() => {
                      setEmail('principal@nassaq.com');
                      setPassword('Principal@123');
                    }}
                    data-testid="test-principal-credentials"
                  >
                    <p className="text-xs font-medium text-brand-turquoise">
                      {isRTL ? 'مدير المدرسة' : 'Principal'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">principal@nassaq.com</p>
                  </div>
                  
                  {/* Teacher */}
                  <div 
                    className="p-2.5 rounded-xl bg-brand-purple/5 border border-brand-purple/20 cursor-pointer hover:bg-brand-purple/10 transition-colors"
                    onClick={() => {
                      setEmail('teacher@nassaq.com');
                      setPassword('Teacher@123');
                    }}
                    data-testid="test-teacher-credentials"
                  >
                    <p className="text-xs font-medium text-brand-purple">
                      {isRTL ? 'معلم' : 'Teacher'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">teacher@nassaq.com</p>
                  </div>
                  
                  {/* Student */}
                  <div 
                    className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/10 transition-colors"
                    onClick={() => {
                      setEmail('student@nassaq.com');
                      setPassword('Student@123');
                    }}
                    data-testid="test-student-credentials"
                  >
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {isRTL ? 'طالب' : 'Student'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">student@nassaq.com</p>
                  </div>
                  
                  {/* Parent */}
                  <div 
                    className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 cursor-pointer hover:bg-amber-500/10 transition-colors"
                    onClick={() => {
                      setEmail('parent@nassaq.com');
                      setPassword('Parent@123');
                    }}
                    data-testid="test-parent-credentials"
                  >
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {isRTL ? 'ولي أمر' : 'Parent'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">parent@nassaq.com</p>
                  </div>
                  
                  {/* Independent Teacher - Full Width */}
                  <div 
                    className="col-span-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 cursor-pointer hover:bg-rose-500/10 transition-colors"
                    onClick={() => {
                      setEmail('independent.teacher@nassaq.com');
                      setPassword('Teacher@123');
                    }}
                    data-testid="test-independent-teacher-credentials"
                  >
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      {isRTL ? 'معلم مستقل' : 'Independent Teacher'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">independent.teacher@nassaq.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
