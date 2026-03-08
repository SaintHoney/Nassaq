import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Database,
  Brain,
  BarChart3,
  CheckCircle2,
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  Calendar,
  BookOpen,
  Bell,
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  MessageCircle,
  Clock,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Assets
const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';
const HAKIM_CHARACTER = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/bfdsnfxc_Hakim%20Character%20Examples%20and%20Referance%2001.avif';

export const LandingPage = () => {
  const { isRTL } = useTheme();
  const [hakimMessageIndex, setHakimMessageIndex] = useState(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const [activeAIStep, setActiveAIStep] = useState(0);
  const [activeEcosystemRole, setActiveEcosystemRole] = useState(0);

  // رسائل حكيم في Hero Section
  const hakimMessages = [
    'مرحبًا… أنا حكيم.',
    'أنا العقل الذكي داخل منصة نَسَّق.',
    'أساعد المدارس على فهم بياناتها وتحويلها إلى قرارات تعليمية واضحة.',
    'هل ترغب أن أريك كيف يمكن للذكاء الاصطناعي أن يساعد مدرستك؟',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHakimMessageIndex((prev) => (prev + 1) % hakimMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // إحصائيات الاستخدام
  const tractionStats = [
    { value: '+200', label: 'مدرسة', icon: Building2 },
    { value: '+50,000', label: 'طالب', icon: GraduationCap },
    { value: '+100,000', label: 'ولي أمر', icon: Users },
    { value: '+3,000', label: 'معلم ومعلمة', icon: UserCheck },
    { value: '24/7', label: 'دعم فني متواصل', icon: Headphones },
  ];

  // القسم الثاني: رحلة المدرسة نحو النظام الذكي
  const journeySteps = [
    {
      step: 1,
      title: 'الواقع اليومي للمدرسة',
      subtitle: 'كل مدرسة تنتج آلاف البيانات يوميًا',
      content: `داخل المدرسة يحدث الكثير كل يوم:
• تسجيل حضور الطلاب
• تقييم الواجبات
• تسجيل السلوك
• مشاركة الطلاب داخل الفصل
• نتائج الاختبارات
• ملاحظات المعلمين

لكن هذه البيانات غالبًا تكون موزعة ومجزأة داخل أنظمة مختلفة.`,
      hakimSays: 'المدارس تولد آلاف البيانات كل يوم… لكن القليل منها يستطيع تحويل هذه البيانات إلى معرفة.',
      icons: [BarChart3, Calendar, Brain, BookOpen, Target, Bell],
    },
    {
      step: 2,
      title: 'جمع البيانات داخل نَسَّق',
      subtitle: 'هنا يبدأ دور منصة نَسَّق',
      content: `يقوم النظام بجمع كل هذه البيانات داخل منصة واحدة:
• الحضور والانصراف
• الأداء الأكاديمي
• السلوك اليومي
• التفاعل داخل الحصة
• الواجبات والتقييمات

كل ذلك في لوحة تحكم واحدة.`,
      hakimSays: 'مهمتي هي تنظيم هذه البيانات وتحويلها إلى صورة واضحة للمدرسة.',
      icons: [Database, TrendingUp, CheckCircle2, Award],
    },
    {
      step: 3,
      title: 'تحليل البيانات بالذكاء الاصطناعي',
      subtitle: 'عندما يبدأ الذكاء الاصطناعي بالتحليل',
      content: `يقوم نظام نَسَّق بتحليل البيانات باستخدام خوارزميات الذكاء الاصطناعي:
• اكتشاف الطلاب الذين يحتاجون دعمًا
• تحليل الأنماط السلوكية داخل الفصول
• رصد تراجع الأداء الأكاديمي
• تحديد فرص تحسين المشاركة`,
      hakimSays: 'أنا لا أعرض الأرقام فقط… بل أكتشف ما تعنيه هذه الأرقام.',
      icons: [Brain, Lightbulb, TrendingUp, Target],
    },
    {
      step: 4,
      title: 'اتخاذ القرار',
      subtitle: 'من البيانات… إلى القرار',
      content: `بعد تحليل البيانات، يصبح لدى المدرسة رؤية واضحة تساعدها على:
• دعم الطلاب المتعثرين
• تحسين أداء الفصول
• اتخاذ قرارات تعليمية مبنية على البيانات
• تحسين جودة العملية التعليمية`,
      hakimSays: 'البيانات وحدها لا تغيّر التعليم… لكن القرارات الصحيحة تفعل.',
      icons: [CheckCircle2, Award, Target, TrendingUp],
    },
  ];

  // القسم الثالث: الذكاء الاصطناعي داخل نَسَّق
  const aiCapabilities = [
    {
      title: 'عندما تبدأ البيانات بالتحدث',
      subtitle: 'الذكاء الاصطناعي ليس ميزة إضافية في نَسَّق بل هو العقل الذي يعمل خلف النظام.',
      content: `كل تفاعل يحدث داخل المدرسة يتحول إلى بيانات:
• حضور الطلاب
• مشاركة الطلاب داخل الحصة
• الواجبات
• التقييمات
• السلوك
• ملاحظات المعلمين

هذه البيانات لا تبقى مجرد أرقام… بل تتحول إلى مدخلات لذكاء النظام.`,
      hakimSays: 'كل يوم تولد المدرسة آلاف البيانات… مهمتي هي أن أفهم ما تعنيه هذه البيانات.',
    },
    {
      title: 'تحليل أداء الطلاب',
      subtitle: 'فهم الطالب قبل أن تظهر المشكلة',
      content: `يقوم الذكاء الاصطناعي داخل نَسَّق بتحليل أداء الطالب بشكل مستمر، ويأخذ في الاعتبار عدة عوامل:
• نسبة الحضور
• المشاركة داخل الحصة
• إنجاز الواجبات
• نتائج التقييمات
• السلوك داخل الفصل`,
      hakimSays: 'يمكنني اكتشاف الطالب الذي يحتاج دعمًا… قبل أن تتحول المشكلة إلى أزمة تعليمية.',
    },
    {
      title: 'الجداول الدراسية الذكية',
      subtitle: 'عندما تصبح الجداول الدراسية عملية ذكية',
      content: `إنشاء جدول مدرسي متوازن عملية معقدة تتطلب مراعاة:
• المعلمين
• الفصول
• المواد الدراسية
• القاعات
• عدد الحصص
• التعارضات

يقوم الذكاء الاصطناعي داخل نَسَّق بتحليل كل هذه العوامل لبناء جدول متوازن وفعال.`,
      hakimSays: 'يمكنني تحليل آلاف الاحتمالات في ثوانٍ لبناء جدول دراسي متوازن.',
    },
    {
      title: 'التقارير التعليمية الذكية',
      subtitle: 'التقارير التي تفهمها… لا مجرد تقرأها',
      content: `بدلاً من عرض الأرقام فقط، يقوم النظام بتحويل البيانات إلى رؤى تعليمية واضحة:
• أداء الفصول
• تطور الطلاب
• الأنماط السلوكية
• جودة المشاركة داخل الحصص`,
      hakimSays: 'الأرقام وحدها لا تكفي… مهمتي هي تحويلها إلى رؤية تساعد المدرسة على اتخاذ القرار.',
    },
  ];

  // القسم الرابع: عندما يعمل الجميع داخل نظام واحد
  const ecosystemRoles = [
    {
      role: 'مدير المدرسة',
      title: 'المدرسة كاملة… في لوحة تحكم واحدة',
      content: `عندما يدخل مدير المدرسة إلى نَسَّق، يرى صورة كاملة عن المدرسة في لحظة واحدة:
• حضور الطلاب
• أداء الفصول
• نشاط المعلمين
• السلوك الطلابي
• تقارير الأداء`,
      hakimSays: 'بدل البحث في عشرات التقارير… يمكنني عرض صورة كاملة عن المدرسة في شاشة واحدة.',
      icon: Building2,
    },
    {
      role: 'المعلم',
      title: 'إدارة الحصة أصبحت أكثر ذكاءً',
      content: `يستخدم المعلم نَسَّق لإدارة الحصة بسهولة:
• تسجيل الحضور
• متابعة تفاعل الطلاب
• تقييم الإجابات
• تسجيل السلوك
• إضافة التقييمات

كل ذلك أثناء الحصة في واجهة بسيطة.`,
      hakimSays: 'أثناء الحصة… أساعد المعلم على فهم مستوى التفاعل داخل الفصل.',
      icon: UserCheck,
    },
    {
      role: 'الطالب',
      title: 'التعلم يصبح تجربة محفزة',
      content: `حساب الطالب داخل نَسَّق مصمم ليكون: بسيط، محفز، تفاعلي.
يحصل الطالب على:
• نقاط المشاركة
• إنجازات
• متابعة الواجبات
• تقارير تقدمه الدراسي`,
      hakimSays: 'عندما يرى الطالب تقدمه بنفسه… يصبح التعلم تجربة أكثر تحفيزًا.',
      icon: GraduationCap,
    },
    {
      role: 'ولي الأمر',
      title: 'متابعة حقيقية لأداء الابن',
      content: `يمكن لولي الأمر متابعة أداء ابنه بسهولة من خلال:
• الحضور
• الواجبات
• السلوك
• التقييمات

كل ذلك عبر لوحة بسيطة وواضحة.`,
      hakimSays: 'عندما يكون ولي الأمر جزءًا من الصورة… تصبح العملية التعليمية أكثر نجاحًا.',
      icon: Users,
    },
  ];

  const nextJourneyStep = () => {
    setActiveJourneyStep((prev) => (prev + 1) % journeySteps.length);
  };

  const prevJourneyStep = () => {
    setActiveJourneyStep((prev) => (prev - 1 + journeySteps.length) % journeySteps.length);
  };

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'} data-testid="landing-page">
      {/* ========== HERO SECTION ========== */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${BG_PATTERN})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-brand-navy/95" />
        
        <Navbar variant="transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-start">
              <div className="inline-flex items-center gap-2 bg-brand-purple/20 border border-brand-purple/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-brand-turquoise" />
                <span className="text-white/80 text-sm font-tajawal">
                  مدعوم بالذكاء الاصطناعي
                </span>
              </div>
              
              <h1 className="font-cairo text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                نَسَّق
              </h1>
              
              <p className="text-2xl md:text-3xl text-brand-turquoise font-cairo font-semibold mb-6">
                من البيانات إلى القرار
              </p>
              
              <p className="text-lg text-white/70 font-tajawal mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                منصة متكاملة لإدارة المدارس وفق معايير تعليمية حديثة، مدعومة بالذكاء الاصطناعي لتحويل بيانات المدرسة اليومية إلى رؤى واضحة تساعد الإدارة والمعلمين على اتخاذ قرارات تعليمية أفضل.
              </p>
              
              {/* Traction Stats */}
              <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-white/60 text-sm font-tajawal mb-4">
                  تستخدم منصة نَسَّق اليوم في مدارس حقيقية وتدير آلاف العمليات التعليمية يوميًا.
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {tractionStats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <stat.icon className="h-5 w-5 text-brand-turquoise mx-auto mb-1" />
                      <div className="text-lg md:text-xl font-bold text-white font-cairo">{stat.value}</div>
                      <div className="text-xs text-white/50 font-tajawal">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                asChild
                size="lg"
                className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-2xl h-14 px-8 text-lg font-cairo shadow-lg"
                data-testid="hero-cta-btn"
              >
                <Link to="/login" className="flex items-center gap-2">
                  الدخول إلى المنصة
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Hakim Character - Interactive */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-3xl scale-75" />
                
                {/* Hakim Image - Transparent Background */}
                <div className="w-80 h-80 mx-auto relative">
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم - المساعد الذكي"
                    className="relative z-10 w-full h-full object-contain animate-float drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(97, 80, 144, 0.4))' }}
                    data-testid="hakim-character"
                  />
                </div>
                
                {/* Speech Bubble - Interactive */}
                <div className="absolute -bottom-4 start-1/2 -translate-x-1/2 w-[320px]">
                  <Card className="bg-brand-purple/90 backdrop-blur-xl border-brand-purple-light/30 rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-brand-turquoise flex-shrink-0 mt-1" />
                      <p className="text-white text-sm leading-relaxed font-tajawal animate-fade-in" key={hakimMessageIndex}>
                        {hakimMessages[hakimMessageIndex]}
                      </p>
                    </div>
                    {/* Message Dots */}
                    <div className="flex justify-center gap-2 mt-3">
                      {hakimMessages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHakimMessageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            hakimMessageIndex === i ? 'bg-brand-turquoise w-4' : 'bg-white/30'
                          }`}
                          data-testid={`hakim-dot-${i}`}
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-brand-turquoise rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: رحلة المدرسة نحو النظام الذكي ========== */}
      <section className="py-20 lg:py-32 bg-background" data-testid="journey-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              رحلة المدرسة نحو النظام الذكي
            </h2>
            <p className="text-xl text-brand-turquoise font-cairo font-semibold">
              من البيانات إلى القرارات
            </p>
          </div>

          {/* Journey Timeline Navigation */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <Button
              variant="outline"
              size="icon"
              onClick={prevJourneyStep}
              className="rounded-full border-brand-navy/20 hover:bg-brand-navy hover:text-white"
              data-testid="journey-prev-btn"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2 p-2 bg-muted rounded-2xl">
              {journeySteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveJourneyStep(i)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-cairo transition-all ${
                    activeJourneyStep === i
                      ? 'bg-brand-navy text-white shadow-lg'
                      : 'bg-transparent text-muted-foreground hover:bg-brand-navy/10'
                  }`}
                  data-testid={`journey-step-${i}`}
                >
                  {step.step}
                </button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextJourneyStep}
              className="rounded-full border-brand-navy/20 hover:bg-brand-navy hover:text-white"
              data-testid="journey-next-btn"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Active Journey Step Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Content Card */}
            <Card className="card-nassaq p-8 order-2 lg:order-1">
              <div className="flex flex-wrap gap-3 mb-6">
                {journeySteps[activeJourneyStep].icons.map((Icon, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-xl bg-brand-turquoise/10 flex items-center justify-center animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Icon className="h-6 w-6 text-brand-turquoise" />
                  </div>
                ))}
              </div>
              
              <h3 className="font-cairo text-2xl font-bold text-foreground mb-2">
                {journeySteps[activeJourneyStep].title}
              </h3>
              <p className="text-brand-turquoise font-cairo font-semibold mb-4">
                {journeySteps[activeJourneyStep].subtitle}
              </p>
              <div className="text-muted-foreground font-tajawal leading-relaxed whitespace-pre-line">
                {journeySteps[activeJourneyStep].content}
              </div>
            </Card>
            
            {/* Hakim Side */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-24">
                <div className="w-48 h-48 mx-auto relative mb-6">
                  <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-2xl" />
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم"
                    className="relative z-10 w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(97, 80, 144, 0.3))' }}
                  />
                </div>
                <Card className="bg-brand-purple/10 border-brand-purple/20 rounded-2xl p-5">
                  <p className="text-foreground text-base leading-relaxed font-tajawal">
                    <span className="text-brand-purple font-bold font-cairo">حكيم: </span>
                    {journeySteps[activeJourneyStep].hakimSays}
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Journey Summary */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-brand-navy text-white rounded-2xl px-8 py-5 shadow-lg">
              <p className="font-cairo text-xl font-bold">
                نَسَّق يحول بيانات المدرسة إلى قرارات تعليمية ذكية
              </p>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                className="rounded-2xl border-brand-turquoise text-brand-turquoise hover:bg-brand-turquoise hover:text-white"
              >
                اكتشف كيف يعمل نَسَّق
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: الذكاء الاصطناعي داخل نَسَّق ========== */}
      <section className="py-20 lg:py-32 bg-brand-navy relative overflow-hidden" data-testid="ai-section">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${BG_PATTERN})`,
            backgroundSize: 'cover',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-purple/20 border border-brand-purple/30 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-brand-turquoise" />
              <span className="text-white/80 text-sm font-tajawal">
                الذكاء الاصطناعي
              </span>
            </div>
            <h2 className="font-cairo text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              الذكاء الاصطناعي داخل نَسَّق
            </h2>
            <p className="text-white/60 font-tajawal max-w-2xl mx-auto">
              الذكاء الاصطناعي ليس ميزة إضافية في نَسَّق بل هو العقل الذي يعمل خلف النظام
            </p>
          </div>

          {/* AI Capabilities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {aiCapabilities.map((capability, i) => (
              <Card
                key={i}
                className={`bg-white/5 border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 ${
                  activeAIStep === i ? 'ring-2 ring-brand-turquoise bg-white/10' : ''
                }`}
                onClick={() => setActiveAIStep(i)}
                data-testid={`ai-capability-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-turquoise/20 flex items-center justify-center mb-4">
                  <span className="text-brand-turquoise font-bold text-xl font-cairo">{i + 1}</span>
                </div>
                <h3 className="font-cairo text-lg font-bold text-white mb-2">{capability.title}</h3>
                <p className="text-white/50 text-sm font-tajawal line-clamp-2">{capability.subtitle}</p>
              </Card>
            ))}
          </div>

          {/* Active AI Capability Details */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <Card className="bg-white/5 border-white/10 rounded-2xl p-8">
              <h3 className="font-cairo text-2xl font-bold text-white mb-3">
                {aiCapabilities[activeAIStep].title}
              </h3>
              <p className="text-brand-turquoise font-cairo mb-4">
                {aiCapabilities[activeAIStep].subtitle}
              </p>
              <div className="text-white/70 font-tajawal leading-relaxed whitespace-pre-line mb-6">
                {aiCapabilities[activeAIStep].content}
              </div>
              
              {/* Hakim Quote */}
              <div className="flex items-start gap-3 bg-brand-purple/20 rounded-xl p-4">
                <img
                  src={HAKIM_CHARACTER}
                  alt="حكيم"
                  className="w-12 h-12 rounded-xl object-cover"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(97, 80, 144, 0.3))' }}
                />
                <p className="text-white text-sm font-tajawal">
                  <span className="text-brand-turquoise font-bold font-cairo">حكيم: </span>
                  {aiCapabilities[activeAIStep].hakimSays}
                </p>
              </div>
            </Card>
            
            {/* Hakim Visual */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-3xl animate-pulse" />
                <img
                  src={HAKIM_CHARACTER}
                  alt="حكيم"
                  className="relative z-10 w-full h-full object-contain animate-float"
                  style={{ filter: 'drop-shadow(0 0 25px rgba(97, 80, 144, 0.5))' }}
                />
              </div>
            </div>
          </div>

          {/* AI Section Footer */}
          <div className="mt-16 text-center">
            <p className="text-white/60 text-lg font-tajawal mb-6">
              الذكاء الاصطناعي داخل نَسَّق يعمل بصمت… ليجعل المدرسة أكثر وضوحًا.
            </p>
            <Button
              className="bg-brand-purple hover:bg-brand-purple-light text-white rounded-2xl font-cairo"
              data-testid="ask-hakim-btn"
            >
              اسأل حكيم
              <Sparkles className="me-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: عندما يعمل الجميع داخل نظام واحد ========== */}
      <section className="py-20 lg:py-32 bg-background" data-testid="ecosystem-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              عندما يعمل الجميع داخل نظام واحد
            </h2>
            <p className="text-muted-foreground text-lg font-tajawal">
              منصة واحدة. نظام بيئي تعليمي واحد.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {ecosystemRoles.map((role, i) => (
              <Card
                key={i}
                className={`card-nassaq p-6 cursor-pointer transition-all ${
                  activeEcosystemRole === i ? 'ring-2 ring-brand-turquoise scale-[1.02]' : ''
                }`}
                onClick={() => setActiveEcosystemRole(i)}
                data-testid={`ecosystem-role-${i}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-navy/10 flex items-center justify-center mb-4">
                  <role.icon className="h-7 w-7 text-brand-navy" />
                </div>
                <h3 className="font-cairo text-lg font-bold text-foreground mb-1">{role.role}</h3>
                <p className="text-sm text-muted-foreground font-tajawal">{role.title}</p>
              </Card>
            ))}
          </div>

          {/* Active Role Details */}
          <Card className="card-nassaq p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-turquoise/10 flex items-center justify-center">
                    {(() => {
                      const Icon = ecosystemRoles[activeEcosystemRole].icon;
                      return <Icon className="h-7 w-7 text-brand-turquoise" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-brand-turquoise font-cairo font-semibold">
                      {ecosystemRoles[activeEcosystemRole].role}
                    </p>
                    <h3 className="font-cairo text-2xl font-bold text-foreground">
                      {ecosystemRoles[activeEcosystemRole].title}
                    </h3>
                  </div>
                </div>
                
                <div className="text-muted-foreground font-tajawal leading-relaxed whitespace-pre-line mb-6">
                  {ecosystemRoles[activeEcosystemRole].content}
                </div>
                
                {/* Hakim Quote */}
                <div className="flex items-start gap-3 bg-brand-purple/10 rounded-xl p-4">
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <p className="text-foreground text-sm font-tajawal">
                    <span className="text-brand-purple font-bold font-cairo">حكيم: </span>
                    {ecosystemRoles[activeEcosystemRole].hakimSays}
                  </p>
                </div>
              </div>
              
              {/* Visual Representation */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {ecosystemRoles.map((role, i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                        activeEcosystemRole === i
                          ? 'bg-brand-turquoise scale-125 shadow-lg'
                          : 'bg-brand-navy/10'
                      }`}
                    >
                      <role.icon className={`h-8 w-8 ${
                        activeEcosystemRole === i ? 'text-white' : 'text-brand-navy'
                      }`} />
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground text-sm font-tajawal">
                    جميعهم متصلون داخل منصة واحدة
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Ecosystem Message */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-brand-turquoise/10 text-brand-turquoise rounded-2xl px-8 py-4">
              <p className="font-cairo text-lg font-bold">
                نَسَّق يربط جميع أطراف العملية التعليمية في نظام ذكي واحد.
              </p>
            </div>
          </div>

          {/* Hakim Final Message for Section */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <img
              src={HAKIM_CHARACTER}
              alt="حكيم"
              className="w-16 h-16 rounded-xl object-cover"
            />
            <Card className="bg-brand-purple/10 border-brand-purple/20 rounded-2xl p-4 max-w-md">
              <p className="text-foreground text-sm font-tajawal">
                <span className="text-brand-purple font-bold font-cairo">حكيم: </span>
                عندما تعمل المدرسة كنظام واحد… يصبح التعليم أكثر وضوحًا وتأثيرًا.
              </p>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              asChild
              className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-2xl font-cairo"
            >
              <Link to="/register">
                اكتشف كيف تعمل المنصة
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== CALL TO ACTION SECTION ========== */}
      <section
        className="py-20 lg:py-32 relative overflow-hidden"
        style={{
          backgroundImage: `url(${BG_PATTERN})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="cta-section"
      >
        <div className="absolute inset-0 bg-brand-navy/95" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-cairo text-4xl md:text-5xl font-bold text-white mb-8">
            جاهزون للبدء؟
          </h2>
          
          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white/10 border-white/20 rounded-2xl p-6 text-start hover:bg-white/15 transition-all">
              <Building2 className="h-10 w-10 text-brand-turquoise mb-4" />
              <h3 className="font-cairo text-xl font-bold text-white mb-2">
                إذا كنت مدرسة
              </h3>
              <p className="text-white/70 text-sm font-tajawal">
                اجعل مدرستك أكثر تنظيمًا ووضوحًا مع منصة نَسَّق.
              </p>
            </Card>
            <Card className="bg-white/10 border-white/20 rounded-2xl p-6 text-start hover:bg-white/15 transition-all">
              <UserCheck className="h-10 w-10 text-brand-turquoise mb-4" />
              <h3 className="font-cairo text-xl font-bold text-white mb-2">
                إذا كنت معلمًا
              </h3>
              <p className="text-white/70 text-sm font-tajawal">
                ابدأ تنظيم حصصك الآن واجعل إدارة الفصل أكثر سهولة وذكاءً.
              </p>
            </Card>
          </div>

          {/* Hakim CTA */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="w-32 h-32 relative">
                <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-2xl animate-pulse" />
                <img
                  src={HAKIM_CHARACTER}
                  alt="حكيم"
                  className="relative z-10 w-full h-full object-contain animate-float"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(97, 80, 144, 0.4))' }}
                />
              </div>
            </div>
            
            <Card className="bg-brand-purple/20 border-brand-purple/30 rounded-2xl p-5 max-w-lg mb-6">
              <p className="text-white text-base font-tajawal">
                <span className="text-brand-turquoise font-bold font-cairo">حكيم: </span>
                التعليم الجيد يبدأ بقرار جيد… والقرار الجيد يبدأ ببيانات واضحة. دعني أساعدك في تنظيم مدرستك.
              </p>
            </Card>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-2xl h-16 px-12 text-xl font-cairo shadow-xl"
            data-testid="cta-register-btn"
          >
            <Link to="/register" className="flex items-center gap-3">
              سجل الآن
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          
          <p className="mt-4 text-white/50 text-sm font-tajawal">
            ابدأ الآن واكتشف كيف يمكن للذكاء الاصطناعي أن يساعدك.
          </p>

          {/* Final Message */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-white/60 text-lg font-tajawal">
              نَسَّق ليس مجرد نظام… بل بيئة تعليمية ذكية تساعد المدرسة على اتخاذ القرار الصحيح.
            </p>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />
      
      {/* Hakim Floating Assistant */}
      <HakimAssistant />
    </div>
  );
};
