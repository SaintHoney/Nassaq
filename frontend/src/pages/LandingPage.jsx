import { useTheme, useTranslation } from '../contexts/ThemeContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Link } from 'react-router-dom';
import {
  Brain,
  Building2,
  Users,
  BarChart3,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Play,
  Star,
  Sparkles,
} from 'lucide-react';

const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';
const HAKIM_CHARACTER = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/bfdsnfxc_Hakim%20Character%20Examples%20and%20Referance%2001.avif';

export const LandingPage = () => {
  const { isRTL } = useTheme();
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: isRTL ? 'الذكاء الاصطناعي' : 'AI Intelligence',
      description: isRTL
        ? 'حكيم - مساعدك الذكي لتحليل البيانات وتقديم توصيات تعليمية مخصصة'
        : 'Hakim - Your intelligent assistant for data analysis and personalized educational recommendations',
      color: 'brand-purple',
    },
    {
      icon: Building2,
      title: isRTL ? 'إدارة المدارس' : 'School Management',
      description: isRTL
        ? 'إدارة شاملة للمدارس مع دعم تعدد المستأجرين وعزل البيانات'
        : 'Comprehensive school management with multi-tenant support and data isolation',
      color: 'brand-turquoise',
    },
    {
      icon: Users,
      title: isRTL ? 'إدارة المستخدمين' : 'User Management',
      description: isRTL
        ? 'إدارة المعلمين والطلاب وأولياء الأمور مع صلاحيات مخصصة لكل دور'
        : 'Manage teachers, students, and parents with role-based permissions',
      color: 'brand-navy',
    },
    {
      icon: BarChart3,
      title: isRTL ? 'التحليلات المتقدمة' : 'Advanced Analytics',
      description: isRTL
        ? 'تقارير وإحصائيات تفصيلية مدعومة بالذكاء الاصطناعي'
        : 'Detailed reports and statistics powered by AI',
      color: 'brand-turquoise',
    },
    {
      icon: Shield,
      title: isRTL ? 'الأمان والخصوصية' : 'Security & Privacy',
      description: isRTL
        ? 'حماية متقدمة للبيانات مع تشفير كامل وتحكم بالوصول'
        : 'Advanced data protection with full encryption and access control',
      color: 'brand-navy',
    },
    {
      icon: Zap,
      title: isRTL ? 'الأداء العالي' : 'High Performance',
      description: isRTL
        ? 'سرعة استجابة عالية وتجربة استخدام سلسة على جميع الأجهزة'
        : 'Fast response times and smooth experience across all devices',
      color: 'brand-purple',
    },
  ];

  const stats = [
    { value: '500+', label: isRTL ? 'مدرسة' : 'Schools' },
    { value: '100K+', label: isRTL ? 'طالب' : 'Students' },
    { value: '10K+', label: isRTL ? 'معلم' : 'Teachers' },
    { value: '99.9%', label: isRTL ? 'وقت التشغيل' : 'Uptime' },
  ];

  const testimonials = [
    {
      name: isRTL ? 'أحمد الشمري' : 'Ahmed Al-Shammari',
      role: isRTL ? 'مدير مدرسة' : 'School Principal',
      content: isRTL
        ? 'نَسَّق غيّر طريقة إدارتنا للمدرسة بالكامل. المساعد الذكي حكيم يوفر علينا ساعات من العمل يومياً.'
        : 'NASSAQ completely transformed how we manage our school. The AI assistant Hakim saves us hours of work daily.',
      avatar: 'أ',
    },
    {
      name: isRTL ? 'سارة القحطاني' : 'Sarah Al-Qahtani',
      role: isRTL ? 'معلمة' : 'Teacher',
      content: isRTL
        ? 'أصبح تتبع أداء الطلاب وإدارة الحضور أسهل بكثير. النظام بديهي وسهل الاستخدام.'
        : 'Tracking student performance and managing attendance has become much easier. The system is intuitive and user-friendly.',
      avatar: 'س',
    },
    {
      name: isRTL ? 'محمد العتيبي' : 'Mohammed Al-Otaibi',
      role: isRTL ? 'ولي أمر' : 'Parent',
      content: isRTL
        ? 'أستطيع متابعة تقدم أبنائي الدراسي بسهولة والتواصل مع المدرسة مباشرة من التطبيق.'
        : 'I can easily track my children\'s academic progress and communicate with the school directly from the app.',
      avatar: 'م',
    },
  ];

  const pricingPlans = [
    {
      name: isRTL ? 'الأساسي' : 'Basic',
      price: isRTL ? '٩٩' : '99',
      period: isRTL ? '/شهرياً' : '/month',
      features: [
        isRTL ? 'حتى 500 طالب' : 'Up to 500 students',
        isRTL ? 'إدارة المستخدمين الأساسية' : 'Basic user management',
        isRTL ? 'تقارير أساسية' : 'Basic reports',
        isRTL ? 'دعم بالبريد الإلكتروني' : 'Email support',
      ],
      popular: false,
    },
    {
      name: isRTL ? 'المتقدم' : 'Professional',
      price: isRTL ? '١٩٩' : '199',
      period: isRTL ? '/شهرياً' : '/month',
      features: [
        isRTL ? 'حتى 2000 طالب' : 'Up to 2000 students',
        isRTL ? 'جميع ميزات الأساسي' : 'All Basic features',
        isRTL ? 'حكيم - المساعد الذكي' : 'Hakim - AI Assistant',
        isRTL ? 'تحليلات متقدمة' : 'Advanced analytics',
        isRTL ? 'دعم على مدار الساعة' : '24/7 support',
      ],
      popular: true,
    },
    {
      name: isRTL ? 'المؤسسي' : 'Enterprise',
      price: isRTL ? 'مخصص' : 'Custom',
      period: '',
      features: [
        isRTL ? 'عدد غير محدود من الطلاب' : 'Unlimited students',
        isRTL ? 'جميع ميزات المتقدم' : 'All Professional features',
        isRTL ? 'تكاملات مخصصة' : 'Custom integrations',
        isRTL ? 'مدير حساب مخصص' : 'Dedicated account manager',
        isRTL ? 'تدريب مخصص' : 'Custom training',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${BG_PATTERN})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand-navy/90" />
        
        <Navbar variant="transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-start animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-brand-turquoise" />
                <span className="text-white/80 text-sm">
                  {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
                </span>
              </div>
              
              <h1 className="font-cairo text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {isRTL ? (
                  <>
                    نظام إدارة المدارس
                    <span className="text-brand-turquoise"> الذكي</span>
                  </>
                ) : (
                  <>
                    Smart School
                    <span className="text-brand-turquoise"> Management</span> System
                  </>
                )}
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
                {isRTL
                  ? 'منصة متكاملة مدعومة بالذكاء الاصطناعي لإدارة العملية التعليمية بكفاءة عالية. تواصل أفضل، قرارات أذكى، ونتائج أفضل.'
                  : 'AI-powered integrated platform for efficient educational management. Better communication, smarter decisions, and better results.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-xl h-14 px-8 text-lg"
                  data-testid="hero-cta-btn"
                >
                  <Link to="/register">
                    {t('getStarted')}
                    {isRTL ? <ArrowLeft className="ms-2 h-5 w-5" /> : <ArrowRight className="ms-2 h-5 w-5" />}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 rounded-xl h-14 px-8 text-lg"
                  data-testid="hero-demo-btn"
                >
                  <Play className="me-2 h-5 w-5" />
                  {isRTL ? 'شاهد العرض' : 'Watch Demo'}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-start">
                    <div className="text-3xl font-bold text-brand-turquoise">{stat.value}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block animate-fade-up animate-delay-200">
              <div className="relative">
                {/* Dashboard Preview Card */}
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl p-6 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={LOGO_WHITE} alt="نَسَّق" className="h-8" />
                      <div className="flex-1" />
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                    </div>
                    
                    {/* Mock Dashboard */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-white/50 text-xs mb-1">
                          {isRTL ? 'الطلاب' : 'Students'}
                        </div>
                        <div className="text-white text-2xl font-bold">1,247</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-white/50 text-xs mb-1">
                          {isRTL ? 'المعلمون' : 'Teachers'}
                        </div>
                        <div className="text-white text-2xl font-bold">86</div>
                      </div>
                    </div>
                    
                    {/* Mock Chart */}
                    <div className="bg-white/10 rounded-xl p-4 h-32 flex items-end gap-2">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-brand-turquoise/60 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Hakim Assistant Floating */}
                <div className="absolute -bottom-6 -start-6 animate-float">
                  <div className="bg-brand-purple rounded-2xl p-4 shadow-xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 overflow-hidden">
                      <img src={HAKIM_CHARACTER} alt="حكيم" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {isRTL ? 'حكيم' : 'Hakim'}
                      </div>
                      <div className="text-white/70 text-sm">
                        {isRTL ? 'كيف أساعدك؟' : 'How can I help?'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-background" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'ميزات قوية لإدارة تعليمية أفضل' : 'Powerful Features for Better Education'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isRTL
                ? 'نقدم لك مجموعة متكاملة من الأدوات والميزات المدعومة بالذكاء الاصطناعي'
                : 'We offer a comprehensive suite of AI-powered tools and features'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-nassaq p-6 group cursor-pointer"
                data-testid={`feature-card-${index}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="font-cairo text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 lg:py-32 bg-brand-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${BG_PATTERN})`,
            backgroundSize: 'cover',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-3xl" />
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم"
                    className="relative z-10 w-full h-full object-contain animate-float"
                  />
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 bg-brand-purple/20 rounded-full px-4 py-2 mb-6">
                <Brain className="h-4 w-4 text-brand-purple" />
                <span className="text-white/80 text-sm">
                  {isRTL ? 'المساعد الذكي' : 'AI Assistant'}
                </span>
              </div>
              
              <h2 className="font-cairo text-3xl md:text-4xl font-bold text-white mb-6">
                {isRTL ? (
                  <>تعرف على <span className="text-brand-purple">حكيم</span></>
                ) : (
                  <>Meet <span className="text-brand-purple">Hakim</span></>
                )}
              </h2>
              
              <p className="text-white/70 text-lg mb-8">
                {isRTL
                  ? 'حكيم هو المساعد الذكي الخاص بمنصة نَسَّق. يساعدك في تحليل البيانات، اتخاذ القرارات، وتقديم توصيات تعليمية مخصصة لكل طالب.'
                  : 'Hakim is NASSAQ\'s intelligent assistant. It helps you analyze data, make decisions, and provide personalized educational recommendations for each student.'}
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  isRTL ? 'تحليل أداء الطلاب التلقائي' : 'Automatic student performance analysis',
                  isRTL ? 'توصيات تعليمية مخصصة' : 'Personalized educational recommendations',
                  isRTL ? 'تنبيهات ذكية استباقية' : 'Proactive smart alerts',
                  isRTL ? 'تقارير تحليلية متقدمة' : 'Advanced analytical reports',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="h-5 w-5 text-brand-turquoise flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                size="lg"
                className="bg-brand-purple hover:bg-brand-purple-light text-white rounded-xl"
                data-testid="hakim-cta-btn"
              >
                {isRTL ? 'جرب حكيم الآن' : 'Try Hakim Now'}
                <Sparkles className="ms-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-muted/50" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isRTL
                ? 'آراء حقيقية من مستخدمي منصة نَسَّق'
                : 'Real feedback from NASSAQ users'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-nassaq p-6" data-testid={`testimonial-card-${index}`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-background" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'خطط الأسعار' : 'Pricing Plans'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isRTL
                ? 'اختر الخطة المناسبة لاحتياجات مدرستك'
                : 'Choose the plan that fits your school\'s needs'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`card-nassaq p-6 relative ${
                  plan.popular ? 'border-brand-turquoise border-2 scale-105' : ''
                }`}
                data-testid={`pricing-card-${index}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                    <span className="bg-brand-turquoise text-white text-xs font-medium px-3 py-1 rounded-full">
                      {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                    </span>
                  </div>
                )}
                
                <h3 className="font-cairo text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-brand-turquoise flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full rounded-xl ${
                    plan.popular
                      ? 'bg-brand-turquoise hover:bg-brand-turquoise-light'
                      : 'bg-brand-navy hover:bg-brand-navy-light'
                  }`}
                >
                  {isRTL ? 'ابدأ الآن' : 'Get Started'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-brand-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${BG_PATTERN})`,
            backgroundSize: 'cover',
          }}
        />
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-cairo text-3xl md:text-4xl font-bold text-white mb-4">
            {isRTL ? 'ابدأ رحلتك مع نَسَّق' : 'Start Your Journey with NASSAQ'}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {isRTL
              ? 'انضم إلى مئات المدارس التي تثق بنَسَّق لإدارة عملياتها التعليمية'
              : 'Join hundreds of schools that trust NASSAQ for their educational operations'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input
              placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              className="h-14 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 sm:w-80"
              data-testid="contact-email-input"
            />
            <Button
              size="lg"
              className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-xl h-14 px-8"
              data-testid="contact-submit-btn"
            >
              {isRTL ? 'احصل على عرض تجريبي' : 'Get a Demo'}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <HakimAssistant />
    </div>
  );
};
