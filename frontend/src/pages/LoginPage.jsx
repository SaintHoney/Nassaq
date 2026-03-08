import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useTranslation } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Sun, Moon, Globe } from 'lucide-react';

const LOGO_LIGHT = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/a2a1b0lv_Nassaq%20LinkedIn%20Logo.png';
const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';
const HAKIM_CHARACTER = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/bfdsnfxc_Hakim%20Character%20Examples%20and%20Referance%2001.avif';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      
      // Redirect based on role
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
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background">
        {/* Theme/Language Toggle */}
        <div className="absolute top-4 end-4 flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLanguage}>
            <Globe className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Logo */}
        <Link to="/" className="mb-8">
          <img
            src={isDark ? LOGO_WHITE : LOGO_LIGHT}
            alt="نَسَّق"
            className="h-12 w-auto"
          />
        </Link>

        <Card className="w-full max-w-md card-nassaq" data-testid="login-card">
          <CardHeader className="text-center">
            <CardTitle className="font-cairo text-2xl">
              {isRTL ? 'تسجيل الدخول' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'أدخل بيانات حسابك للوصول إلى لوحة التحكم'
                : 'Enter your credentials to access your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ps-10 h-12 rounded-xl"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-turquoise hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ps-10 pe-10 h-12 rounded-xl"
                    required
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-brand-navy hover:bg-brand-navy-light"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <span className="animate-pulse">{isRTL ? 'جاري الدخول...' : 'Signing in...'}</span>
                ) : (
                  <>
                    {t('login')}
                    {isRTL ? <ArrowLeft className="ms-2 h-5 w-5" /> : <ArrowRight className="ms-2 h-5 w-5" />}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('noAccount')}{' '}
                <Link to="/register" className="text-brand-turquoise hover:underline font-medium">
                  {t('register')}
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                {isRTL ? 'بيانات تجريبية:' : 'Demo credentials:'}
              </p>
              <p className="text-xs font-mono">admin@nassaq.sa / Admin@123</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Branding */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative"
        style={{
          backgroundImage: `url(${BG_PATTERN})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-brand-navy/90" />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-48 h-48 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-3xl" />
            <img
              src={HAKIM_CHARACTER}
              alt="حكيم"
              className="relative z-10 w-full h-full object-contain animate-float"
            />
          </div>
          
          <h2 className="font-cairo text-3xl font-bold text-white mb-4">
            {isRTL ? 'مرحباً بعودتك!' : 'Welcome Back!'}
          </h2>
          <p className="text-white/70">
            {isRTL
              ? 'سجل دخولك للوصول إلى لوحة التحكم وإدارة مدرستك بذكاء مع حكيم'
              : 'Sign in to access your dashboard and manage your school smartly with Hakim'}
          </p>
        </div>
      </div>
    </div>
  );
};
