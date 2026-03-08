import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useTranslation } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Sun, Moon, Globe, Building2 } from 'lucide-react';

const LOGO_LIGHT = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/a2a1b0lv_Nassaq%20LinkedIn%20Logo.png';
const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';
const HAKIM_CHARACTER = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/bfdsnfxc_Hakim%20Character%20Examples%20and%20Referance%2001.avif';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'school_principal',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const roles = [
    { value: 'school_principal', label: isRTL ? 'مدير مدرسة' : 'School Principal' },
    { value: 'school_sub_admin', label: isRTL ? 'نائب المدير' : 'School Admin' },
    { value: 'teacher', label: isRTL ? 'معلم' : 'Teacher' },
    { value: 'parent', label: isRTL ? 'ولي أمر' : 'Parent' },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      phone: formData.phone || null,
      role: formData.role,
    });
    
    if (result.success) {
      toast.success(isRTL ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
      
      // Redirect based on role
      switch (result.user.role) {
        case 'school_principal':
        case 'school_sub_admin':
          navigate('/school');
          break;
        case 'teacher':
          navigate('/teacher');
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
    <div className="min-h-screen flex" data-testid="register-page">
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

        <Card className="w-full max-w-md card-nassaq" data-testid="register-card">
          <CardHeader className="text-center">
            <CardTitle className="font-cairo text-2xl">
              {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'انضم إلى نَسَّق وابدأ إدارة مدرستك بذكاء'
                : 'Join NASSAQ and start managing your school smartly'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t('fullName')}</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="full_name"
                    placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="ps-10 h-12 rounded-xl"
                    required
                    data-testid="register-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="ps-10 h-12 rounded-xl"
                    required
                    data-testid="register-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{isRTL ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="ps-10 h-12 rounded-xl"
                    data-testid="register-phone-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{isRTL ? 'نوع الحساب' : 'Account Type'}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger className="h-12 rounded-xl" data-testid="register-role-select">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="ps-10 pe-10 h-12 rounded-xl"
                    required
                    data-testid="register-password-input"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="ps-10 h-12 rounded-xl"
                    required
                    data-testid="register-confirm-password-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-brand-navy hover:bg-brand-navy-light"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <span className="animate-pulse">{isRTL ? 'جاري الإنشاء...' : 'Creating...'}</span>
                ) : (
                  <>
                    {t('register')}
                    {isRTL ? <ArrowLeft className="ms-2 h-5 w-5" /> : <ArrowRight className="ms-2 h-5 w-5" />}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('hasAccount')}{' '}
                <Link to="/login" className="text-brand-turquoise hover:underline font-medium">
                  {t('login')}
                </Link>
              </p>
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
            <div className="absolute inset-0 bg-brand-turquoise/30 rounded-full blur-3xl" />
            <img
              src={HAKIM_CHARACTER}
              alt="حكيم"
              className="relative z-10 w-full h-full object-contain animate-float"
            />
          </div>
          
          <h2 className="font-cairo text-3xl font-bold text-white mb-4">
            {isRTL ? 'انضم إلى نَسَّق' : 'Join NASSAQ'}
          </h2>
          <p className="text-white/70">
            {isRTL
              ? 'أنشئ حسابك وابدأ رحلة الإدارة الذكية مع حكيم، مساعدك الذكي'
              : 'Create your account and start your smart management journey with Hakim, your AI assistant'}
          </p>
        </div>
      </div>
    </div>
  );
};
