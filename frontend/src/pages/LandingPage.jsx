import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Footer } from '../components/layout/Footer';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
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
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

// Assets
const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';
const HAKIM_CHARACTER = 'https://customer-assets.emergentagent.com/job_nassaq-school/artifacts/mtvfci3y_HAKIM%201.png';

export const LandingPage = () => {
  const { isRTL, toggleLanguage, toggleTheme, isDark } = useTheme();
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const [activeAIStep, setActiveAIStep] = useState(0);
  const [activeEcosystemRole, setActiveEcosystemRole] = useState(0);
  
  // Hover pause states
  const [journeyPaused, setJourneyPaused] = useState(false);
  const [aiPaused, setAIPaused] = useState(false);
  const [ecosystemPaused, setEcosystemPaused] = useState(false);
  
  // Platform Stats from API
  const [platformStats, setPlatformStats] = useState({
    schools: 100,
    students: 30000,
    teachers: 2500,
    parents: 60000,
  });

  // Fetch platform stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${API_URL}/api/public/stats`);
        if (response.ok) {
          const data = await response.json();
          setPlatformStats({
            schools: data.schools || 100,
            students: data.students || 30000,
            teachers: data.teachers || 2500,
            parents: data.parents || 60000,
          });
        }
      } catch (error) {
        console.log('Using default stats');
      }
    };
    fetchStats();
  }, []);

  // Auto-rotate Journey Steps every 2 seconds (pause on hover)
  useEffect(() => {
    if (journeyPaused) return;
    const interval = setInterval(() => {
      setActiveJourneyStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [journeyPaused]);

  // Auto-rotate AI Steps every 2 seconds (pause on hover)
  useEffect(() => {
    if (aiPaused) return;
    const interval = setInterval(() => {
      setActiveAIStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [aiPaused]);

  // Auto-rotate Ecosystem Roles every 2 seconds (pause on hover)
  useEffect(() => {
    if (ecosystemPaused) return;
    const interval = setInterval(() => {
      setActiveEcosystemRole((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [ecosystemPaused]);

  // Journey Steps Data - Bilingual
  const journeySteps = isRTL ? [
    {
      title: 'الواقع اليومي للمدرسة',
      subtitle: 'كل مدرسة تنتج آلاف البيانات يوميًا',
      content: `داخل المدرسة يحدث الكثير كل يوم: تسجيل حضور الطلاب، تقييم الواجبات، تسجيل السلوك، مشاركة الطلاب داخل الفصل، نتائج الاختبارات، ملاحظات المعلمين. لكن هذه البيانات غالبًا تكون موزعة ومجزأة داخل أنظمة مختلفة.`,
      hakimSays: 'المدارس تولد آلاف البيانات كل يوم… لكن القليل منها يستطيع تحويل هذه البيانات إلى معرفة.',
      icons: [BarChart3, Calendar, Brain, BookOpen],
    },
    {
      title: 'جمع البيانات داخل نَسَّق',
      subtitle: 'هنا يبدأ دور منصة نَسَّق',
      content: `يقوم النظام بجمع كل هذه البيانات داخل منصة واحدة: الحضور والانصراف، الأداء الأكاديمي، السلوك اليومي، التفاعل داخل الحصة، الواجبات والتقييمات. كل ذلك في لوحة تحكم واحدة.`,
      hakimSays: 'مهمتي هي تنظيم هذه البيانات وتحويلها إلى صورة واضحة للمدرسة.',
      icons: [Database, TrendingUp, CheckCircle2, Award],
    },
    {
      title: 'تحليل البيانات بالذكاء الاصطناعي',
      subtitle: 'عندما يبدأ الذكاء الاصطناعي بالتحليل',
      content: `يقوم نظام نَسَّق بتحليل البيانات باستخدام خوارزميات الذكاء الاصطناعي: اكتشاف الطلاب الذين يحتاجون دعمًا، تحليل الأنماط السلوكية داخل الفصول، رصد تراجع الأداء الأكاديمي، تحديد فرص تحسين المشاركة.`,
      hakimSays: 'أنا لا أعرض الأرقام فقط… بل أكتشف ما تعنيه هذه الأرقام.',
      icons: [Brain, Lightbulb, TrendingUp, Target],
    },
    {
      title: 'اتخاذ القرار',
      subtitle: 'من البيانات… إلى القرار',
      content: `بعد تحليل البيانات، يصبح لدى المدرسة رؤية واضحة تساعدها على: دعم الطلاب المتعثرين، تحسين أداء الفصول، اتخاذ قرارات تعليمية مبنية على البيانات، تحسين جودة العملية التعليمية.`,
      hakimSays: 'البيانات وحدها لا تغيّر التعليم… لكن القرارات الصحيحة تفعل.',
      icons: [CheckCircle2, Award, Target, TrendingUp],
    },
  ] : [
    {
      title: 'Daily School Reality',
      subtitle: 'Every school produces thousands of data points daily',
      content: `Inside the school, a lot happens every day: recording student attendance, evaluating assignments, recording behavior, student participation in class, test results, teacher notes. But this data is often distributed and fragmented across different systems.`,
      hakimSays: 'Schools generate thousands of data points every day... but few can turn this data into knowledge.',
      icons: [BarChart3, Calendar, Brain, BookOpen],
    },
    {
      title: 'Data Collection in NASSAQ',
      subtitle: 'Here is where NASSAQ platform begins',
      content: `The system collects all this data in one platform: attendance, academic performance, daily behavior, in-class interaction, assignments and assessments. All in one control panel.`,
      hakimSays: 'My mission is to organize this data and turn it into a clear picture for the school.',
      icons: [Database, TrendingUp, CheckCircle2, Award],
    },
    {
      title: 'AI Data Analysis',
      subtitle: 'When AI starts analyzing',
      content: `NASSAQ analyzes data using AI algorithms: discovering students who need support, analyzing behavioral patterns in classes, tracking academic decline, identifying opportunities for participation improvement.`,
      hakimSays: "I don't just display numbers... I discover what these numbers mean.",
      icons: [Brain, Lightbulb, TrendingUp, Target],
    },
    {
      title: 'Decision Making',
      subtitle: 'From Data... to Decisions',
      content: `After data analysis, the school has a clear vision to help: support struggling students, improve class performance, make data-driven educational decisions, improve the quality of education.`,
      hakimSays: "Data alone doesn't change education... but the right decisions do.",
      icons: [CheckCircle2, Award, Target, TrendingUp],
    },
  ];

  // AI Capabilities Data - Bilingual
  const aiCapabilities = isRTL ? [
    {
      title: 'عندما تبدأ البيانات بالتحدث',
      subtitle: 'الذكاء الاصطناعي هو العقل الذي يعمل خلف النظام',
      content: `كل تفاعل يحدث داخل المدرسة يتحول إلى بيانات: حضور الطلاب، مشاركة الطلاب داخل الحصة، الواجبات، التقييمات، السلوك، ملاحظات المعلمين. هذه البيانات تتحول إلى مدخلات لذكاء النظام.`,
      hakimSays: 'كل يوم تولد المدرسة آلاف البيانات… مهمتي هي أن أفهم ما تعنيه هذه البيانات.',
    },
    {
      title: 'تحليل أداء الطلاب',
      subtitle: 'فهم الطالب قبل أن تظهر المشكلة',
      content: `يقوم الذكاء الاصطناعي بتحليل أداء الطالب بشكل مستمر: نسبة الحضور، المشاركة داخل الحصة، إنجاز الواجبات، نتائج التقييمات، السلوك داخل الفصل.`,
      hakimSays: 'يمكنني اكتشاف الطالب الذي يحتاج دعمًا… قبل أن تتحول المشكلة إلى أزمة تعليمية.',
    },
    {
      title: 'الجداول الدراسية الذكية',
      subtitle: 'عندما تصبح الجداول الدراسية عملية ذكية',
      content: `إنشاء جدول مدرسي متوازن عملية معقدة تتطلب مراعاة: المعلمين، الفصول، المواد الدراسية، القاعات، عدد الحصص، التعارضات. الذكاء الاصطناعي يحلل كل هذه العوامل.`,
      hakimSays: 'يمكنني تحليل آلاف الاحتمالات في ثوانٍ لبناء جدول دراسي متوازن.',
    },
    {
      title: 'التقارير التعليمية الذكية',
      subtitle: 'التقارير التي تفهمها… لا مجرد تقرأها',
      content: `بدلاً من عرض الأرقام فقط، يقوم النظام بتحويل البيانات إلى رؤى تعليمية واضحة: أداء الفصول، تطور الطلاب، الأنماط السلوكية، جودة المشاركة داخل الحصص.`,
      hakimSays: 'الأرقام وحدها لا تكفي… مهمتي هي تحويلها إلى رؤية تساعد المدرسة على اتخاذ القرار.',
    },
  ] : [
    {
      title: 'When Data Starts Speaking',
      subtitle: 'AI is the mind that works behind the system',
      content: `Every interaction in school turns into data: student attendance, in-class participation, assignments, assessments, behavior, teacher notes. This data becomes inputs for system intelligence.`,
      hakimSays: 'Every day the school generates thousands of data points... my mission is to understand what this data means.',
    },
    {
      title: 'Student Performance Analysis',
      subtitle: 'Understanding the student before problems appear',
      content: `AI continuously analyzes student performance: attendance rate, in-class participation, assignment completion, assessment results, classroom behavior.`,
      hakimSays: 'I can detect a student who needs support... before the problem becomes an educational crisis.',
    },
    {
      title: 'Smart Scheduling',
      subtitle: 'When scheduling becomes an intelligent process',
      content: `Creating a balanced school schedule is complex, requiring consideration of: teachers, classes, subjects, rooms, number of sessions, conflicts. AI analyzes all these factors.`,
      hakimSays: 'I can analyze thousands of possibilities in seconds to build a balanced schedule.',
    },
    {
      title: 'Smart Educational Reports',
      subtitle: 'Reports you understand... not just read',
      content: `Instead of just displaying numbers, the system transforms data into clear educational insights: class performance, student progress, behavioral patterns, quality of in-class participation.`,
      hakimSays: "Numbers alone aren't enough... my mission is to turn them into vision that helps the school make decisions.",
    },
  ];

  // Ecosystem Roles Data - Bilingual
  const ecosystemRoles = isRTL ? [
    {
      role: 'مدير المدرسة',
      title: 'المدرسة كاملة… في لوحة تحكم واحدة',
      content: `عندما يدخل مدير المدرسة إلى نَسَّق، يرى صورة كاملة عن المدرسة في لحظة واحدة: حضور الطلاب، أداء الفصول، نشاط المعلمين، السلوك الطلابي، تقارير الأداء.`,
      hakimSays: 'بدل البحث في عشرات التقارير… يمكنني عرض صورة كاملة عن المدرسة في شاشة واحدة.',
      icon: Building2,
    },
    {
      role: 'المعلم',
      title: 'إدارة الحصة أصبحت أكثر ذكاءً',
      content: `يستخدم المعلم نَسَّق لإدارة الحصة بسهولة: تسجيل الحضور، متابعة تفاعل الطلاب، تقييم الإجابات، تسجيل السلوك، إضافة التقييمات. كل ذلك في واجهة بسيطة.`,
      hakimSays: 'أثناء الحصة… أساعد المعلم على فهم مستوى التفاعل داخل الفصل.',
      icon: UserCheck,
    },
    {
      role: 'الطالب',
      title: 'التعلم يصبح تجربة محفزة',
      content: `حساب الطالب داخل نَسَّق مصمم ليكون: بسيط، محفز، تفاعلي. يحصل الطالب على: نقاط المشاركة، إنجازات، متابعة الواجبات، تقارير تقدمه الدراسي.`,
      hakimSays: 'عندما يرى الطالب تقدمه بنفسه… يصبح التعلم تجربة أكثر تحفيزًا.',
      icon: GraduationCap,
    },
    {
      role: 'ولي الأمر',
      title: 'متابعة حقيقية لأداء الابن',
      content: `يمكن لولي الأمر متابعة أداء ابنه بسهولة من خلال: الحضور، الواجبات، السلوك، التقييمات. كل ذلك عبر لوحة بسيطة وواضحة.`,
      hakimSays: 'عندما يكون ولي الأمر جزءًا من الصورة… تصبح العملية التعليمية أكثر نجاحًا.',
      icon: Users,
    },
  ] : [
    {
      role: 'School Principal',
      title: 'The entire school... in one dashboard',
      content: `When the principal enters NASSAQ, they see a complete picture of the school in one moment: student attendance, class performance, teacher activity, student behavior, performance reports.`,
      hakimSays: 'Instead of searching through dozens of reports... I can display a complete picture of the school on one screen.',
      icon: Building2,
    },
    {
      role: 'Teacher',
      title: 'Class management is now smarter',
      content: `Teachers use NASSAQ to easily manage classes: record attendance, track student interaction, evaluate answers, record behavior, add assessments. All in a simple interface.`,
      hakimSays: 'During class... I help the teacher understand the level of interaction in the classroom.',
      icon: UserCheck,
    },
    {
      role: 'Student',
      title: 'Learning becomes a motivating experience',
      content: `The student account in NASSAQ is designed to be: simple, motivating, interactive. Students get: participation points, achievements, assignment tracking, progress reports.`,
      hakimSays: 'When students see their own progress... learning becomes a more motivating experience.',
      icon: GraduationCap,
    },
    {
      role: 'Parent',
      title: 'Real follow-up on your child\'s performance',
      content: `Parents can easily follow their child's performance through: attendance, assignments, behavior, assessments. All through a simple and clear dashboard.`,
      hakimSays: 'When parents are part of the picture... education becomes more successful.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'} data-testid="landing-page">
      {/* ========== HEADER (NOT STICKY) ========== */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
              <img src={LOGO_WHITE} alt="نَسَّق" className="h-10 lg:h-12 w-auto rounded-xl" />
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-white hover:bg-white/10" data-testid="language-toggle">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white hover:bg-white/10" data-testid="theme-toggle">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" asChild className="text-white hover:bg-white/10" data-testid="login-link">
                <Link to="/login">{isRTL ? 'تسجيل الدخول' : 'Login'}</Link>
              </Button>
              <Button asChild className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-xl" data-testid="register-link">
                <Link to="/register">{isRTL ? 'إنشاء حساب' : 'Register'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${BG_PATTERN})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-brand-navy/95" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-brand-purple/20 border border-brand-purple/30 animate-pulse">
            <Sparkles className="h-8 w-8 text-brand-turquoise" />
          </div>
          
          {/* LOGO - Bigger with Curved Corners */}
          <div className="mb-4">
            <img 
              src={LOGO_WHITE} 
              alt="نَسَّق" 
              className="h-32 lg:h-44 w-auto mx-auto rounded-3xl" 
              data-testid="hero-logo" 
            />
          </div>
          
          {/* Platform Name Under Logo */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-cairo font-bold text-white mb-6" data-testid="platform-name">
            {isRTL ? 'نَسَّق' : 'NASSAQ'}
          </h1>
          
          <p className="text-2xl md:text-3xl lg:text-4xl text-brand-turquoise font-cairo font-semibold mb-6">
            {isRTL ? 'من البيانات إلى القرار' : 'From Data to Decisions'}
          </p>
          
          {/* Updated Description - Shorter */}
          <p className="text-lg text-white/70 font-tajawal mb-8 max-w-2xl mx-auto leading-relaxed">
            {isRTL 
              ? 'منصة متكاملة لإدارة المدارس وفق معايير تعليمية حديثة، مدعومة بالذكاء الاصطناعي'
              : 'A comprehensive school management platform with modern educational standards, powered by AI'
            }
          </p>
          
          {/* ========== TRACTION / PLATFORM IMPACT BLOCK ========== */}
          <div className="mb-10" data-testid="traction-section">
            <p className="text-white/80 font-tajawal text-base mb-6 max-w-xl mx-auto">
              {isRTL 
                ? 'تستخدم منصة نَسَّق اليوم وتدير آلاف العمليات التعليمية يوميًا.'
                : 'NASSAQ platform is used today to manage thousands of educational operations daily.'
              }
            </p>
            
            {/* Traction Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-6">
              {/* Schools */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15 hover:scale-105" data-testid="traction-schools">
                <Building2 className="h-8 w-8 text-brand-turquoise mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-cairo font-bold text-white">+200</p>
                <p className="text-white/70 font-tajawal text-sm">{isRTL ? 'مدرسة' : 'Schools'}</p>
              </div>
              
              {/* Students */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15 hover:scale-105" data-testid="traction-students">
                <GraduationCap className="h-8 w-8 text-brand-turquoise mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-cairo font-bold text-white">+50,000</p>
                <p className="text-white/70 font-tajawal text-sm">{isRTL ? 'طالب' : 'Students'}</p>
              </div>
              
              {/* Parents */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15 hover:scale-105" data-testid="traction-parents">
                <Users className="h-8 w-8 text-brand-turquoise mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-cairo font-bold text-white">+100,000</p>
                <p className="text-white/70 font-tajawal text-sm">{isRTL ? 'ولي أمر' : 'Parents'}</p>
              </div>
              
              {/* Teachers */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15 hover:scale-105" data-testid="traction-teachers">
                <UserCheck className="h-8 w-8 text-brand-turquoise mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-cairo font-bold text-white">+3,000</p>
                <p className="text-white/70 font-tajawal text-sm">{isRTL ? 'معلم ومعلمة' : 'Teachers'}</p>
              </div>
            </div>
            
            {/* 24/7 Support Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-turquoise/20 border border-brand-turquoise/30 rounded-full px-4 py-2">
              <Bell className="h-4 w-4 text-brand-turquoise animate-pulse" />
              <span className="text-white font-tajawal text-sm">{isRTL ? 'دعم فني متواصل 24/7' : '24/7 Technical Support'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-10">
            <img src={HAKIM_CHARACTER} alt={isRTL ? 'حكيم' : 'Hakim'} className="w-12 h-12 rounded-full object-cover border-2 border-brand-turquoise shadow-lg" data-testid="hakim-avatar" />
            <Card className="bg-brand-purple/20 backdrop-blur-sm border-brand-purple/30 rounded-2xl px-4 py-3 max-w-md">
              <p className="text-white text-sm font-tajawal text-start">
                <span className="text-brand-turquoise font-bold font-cairo">{isRTL ? 'حكيم: ' : 'Hakim: '}</span>
                {isRTL 
                  ? 'مرحبًا! أنا هنا لأساعدك في اكتشاف كيف يمكن للذكاء الاصطناعي تحسين مدرستك.'
                  : "Hello! I'm here to help you discover how AI can improve your school."
                }
              </p>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-2xl h-14 px-10 text-lg font-cairo shadow-lg" data-testid="hero-cta-btn">
              <Link to="/login" className="flex items-center gap-2">
                {isRTL ? 'الدخول إلى المنصة' : 'Enter the Platform'}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-brand-turquoise/50 text-white hover:bg-brand-turquoise/10 rounded-2xl h-14 px-8 text-lg font-cairo backdrop-blur-sm" data-testid="teacher-register-cta">
              <Link to="/teacher-register" className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {isRTL ? 'انضم كمعلم' : 'Join as Teacher'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION: دعوة خاصة للمعلمين ========== */}
      <section className="py-12 bg-gradient-to-r from-brand-navy to-brand-purple/50" data-testid="teacher-invite-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-turquoise/20 border border-brand-turquoise/30 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-brand-turquoise" />
              </div>
              <div>
                <h3 className="font-cairo text-xl font-bold text-white mb-1">
                  {isRTL ? 'هل أنت معلم؟' : 'Are you a teacher?'}
                </h3>
                <p className="text-white/70 font-tajawal text-sm">
                  {isRTL 
                    ? 'انضم لمنصة نَسَّق حتى لو لم تكن مدرستك مسجلة بعد'
                    : 'Join NASSAQ platform even if your school is not registered yet'
                  }
                </p>
              </div>
            </div>
            <Button asChild className="bg-white text-brand-navy hover:bg-white/90 rounded-xl font-cairo px-6" data-testid="teacher-register-banner-btn">
              <Link to="/teacher-register" className="flex items-center gap-2">
                {isRTL ? 'سجّل الآن' : 'Register Now'}
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: رحلة المدرسة نحو النظام الذكي ========== */}
      <section className="py-20 lg:py-28 bg-background" data-testid="journey-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'رحلة المدرسة نحو النظام الذكي' : "The School's Journey to Smart Systems"}
            </h2>
            <p className="text-xl text-brand-turquoise font-cairo font-semibold">
              {isRTL ? 'من البيانات إلى القرارات' : 'From Data to Decisions'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Hakim Side - Fixed Height */}
            <div 
              className="flex items-start gap-4 order-2 lg:order-1"
              onMouseEnter={() => setJourneyPaused(true)}
              onMouseLeave={() => setJourneyPaused(false)}
            >
              <img src={HAKIM_CHARACTER} alt="حكيم" className="w-14 h-14 rounded-full object-cover border-2 border-brand-purple shadow-lg flex-shrink-0" />
              <Card className="bg-brand-purple/10 border-brand-purple/20 rounded-2xl p-5 flex-1 h-[120px] overflow-hidden">
                <p className="text-foreground text-sm leading-relaxed font-tajawal">
                  <span className="text-brand-purple font-bold font-cairo">{isRTL ? 'حكيم: ' : 'Hakim: '}</span>
                  {journeySteps[activeJourneyStep].hakimSays}
                </p>
              </Card>
            </div>
            
            {/* Content Card - Fixed Height */}
            <Card 
              className="card-nassaq p-8 transition-all duration-500 h-[380px] flex flex-col order-1 lg:order-2 overflow-hidden"
              onMouseEnter={() => setJourneyPaused(true)}
              onMouseLeave={() => setJourneyPaused(false)}
            >
              <div className="flex flex-wrap gap-3 mb-4">
                {journeySteps[activeJourneyStep].icons.map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-brand-turquoise/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-brand-turquoise" />
                  </div>
                ))}
              </div>
              
              <h3 className="font-cairo text-xl font-bold text-foreground mb-2">
                {journeySteps[activeJourneyStep].title}
              </h3>
              <p className="text-brand-turquoise font-cairo font-semibold mb-3 text-sm">
                {journeySteps[activeJourneyStep].subtitle}
              </p>
              <p className="text-muted-foreground font-tajawal leading-relaxed text-sm flex-1 overflow-hidden">
                {journeySteps[activeJourneyStep].content}
              </p>
              
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-border/30">
                {journeySteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeJourneyStep === i ? 'w-8 bg-brand-turquoise' : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: الذكاء الاصطناعي داخل نَسَّق ========== */}
      <section className="py-20 lg:py-28 bg-brand-navy relative overflow-hidden" data-testid="ai-section">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${BG_PATTERN})`, backgroundSize: 'cover' }} />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-purple/20 border border-brand-purple/30 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-brand-turquoise" />
              <span className="text-white/80 text-sm font-tajawal">{isRTL ? 'الذكاء الاصطناعي' : 'Artificial Intelligence'}</span>
            </div>
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-white mb-4">
              {isRTL ? 'الذكاء الاصطناعي داخل نَسَّق' : 'AI Inside NASSAQ'}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Content Card - Fixed Height */}
            <Card 
              className="bg-white/5 border-white/10 rounded-2xl p-8 transition-all duration-500 h-[420px] flex flex-col overflow-hidden"
              onMouseEnter={() => setAIPaused(true)}
              onMouseLeave={() => setAIPaused(false)}
            >
              <h3 className="font-cairo text-xl font-bold text-white mb-2">
                {aiCapabilities[activeAIStep].title}
              </h3>
              <p className="text-brand-turquoise font-cairo text-sm mb-4">
                {aiCapabilities[activeAIStep].subtitle}
              </p>
              <p className="text-white/70 font-tajawal leading-relaxed text-sm mb-4 flex-1 overflow-hidden">
                {aiCapabilities[activeAIStep].content}
              </p>
              
              {/* Hakim Quote */}
              <div className="flex items-start gap-3 bg-brand-purple/20 rounded-xl p-4 h-[80px] overflow-hidden">
                <img src={HAKIM_CHARACTER} alt={isRTL ? 'حكيم' : 'Hakim'} className="w-10 h-10 rounded-full object-cover border border-brand-turquoise flex-shrink-0" />
                <p className="text-white text-sm font-tajawal overflow-hidden">
                  <span className="text-brand-turquoise font-bold font-cairo">{isRTL ? 'حكيم: ' : 'Hakim: '}</span>
                  {aiCapabilities[activeAIStep].hakimSays}
                </p>
              </div>
              
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                {aiCapabilities.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeAIStep === i ? 'w-8 bg-brand-turquoise' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </Card>
            
            {/* Visual Side - Fixed Height */}
            <div 
              className="flex justify-center items-center h-[420px]"
              onMouseEnter={() => setAIPaused(true)}
              onMouseLeave={() => setAIPaused(false)}
            >
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-brand-purple/30 blur-3xl absolute inset-0 animate-pulse" />
                <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-turquoise/20 border border-white/10 flex items-center justify-center">
                  <Brain className="w-20 h-20 text-brand-turquoise animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: عندما يعمل الجميع داخل نظام واحد ========== */}
      <section className="py-20 lg:py-28 bg-background" data-testid="ecosystem-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'عندما يعمل الجميع داخل نظام واحد' : 'When Everyone Works in One System'}
            </h2>
            <p className="text-muted-foreground text-lg font-tajawal">
              {isRTL ? 'منصة واحدة. نظام بيئي تعليمي واحد.' : 'One platform. One educational ecosystem.'}
            </p>
          </div>

          {/* Role Cards - Fixed Height */}
          <div 
            className="grid md:grid-cols-4 gap-4 mb-10"
            onMouseEnter={() => setEcosystemPaused(true)}
            onMouseLeave={() => setEcosystemPaused(false)}
          >
            {ecosystemRoles.map((role, i) => (
              <Card
                key={i}
                className={`card-nassaq p-5 transition-all duration-300 h-[160px] flex flex-col justify-center overflow-hidden ${
                  activeEcosystemRole === i ? 'ring-2 ring-brand-turquoise scale-[1.02]' : 'opacity-60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-navy/10 flex items-center justify-center mb-3 flex-shrink-0">
                  <role.icon className="h-6 w-6 text-brand-navy" />
                </div>
                <h3 className="font-cairo text-base font-bold text-foreground">{role.role}</h3>
                <p className="text-xs text-muted-foreground font-tajawal mt-1 line-clamp-2">{role.title}</p>
              </Card>
            ))}
          </div>

          {/* Active Role Details - Fixed Height */}
          <Card 
            className="card-nassaq p-8 h-[320px] overflow-hidden"
            onMouseEnter={() => setEcosystemPaused(true)}
            onMouseLeave={() => setEcosystemPaused(false)}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-start h-full">
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="font-cairo text-xl font-bold text-foreground mb-4 flex-shrink-0">
                  {ecosystemRoles[activeEcosystemRole].title}
                </h3>
                <p className="text-muted-foreground font-tajawal leading-relaxed text-sm mb-4 flex-1 overflow-hidden">
                  {ecosystemRoles[activeEcosystemRole].content}
                </p>
                
                {/* Hakim Quote */}
                <div className="flex items-start gap-3 bg-brand-purple/10 rounded-xl p-4 h-[80px] flex-shrink-0 overflow-hidden">
                  <img src={HAKIM_CHARACTER} alt={isRTL ? 'حكيم' : 'Hakim'} className="w-10 h-10 rounded-full object-cover border border-brand-purple flex-shrink-0" />
                  <p className="text-foreground text-sm font-tajawal overflow-hidden">
                    <span className="text-brand-purple font-bold font-cairo">{isRTL ? 'حكيم: ' : 'Hakim: '}</span>
                    {ecosystemRoles[activeEcosystemRole].hakimSays}
                  </p>
                </div>
              </div>
              
              {/* Visual Icons */}
              <div className="flex flex-wrap justify-center gap-4 items-center h-full">
                {ecosystemRoles.map((role, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      activeEcosystemRole === i
                        ? 'bg-brand-turquoise scale-110 shadow-lg'
                        : 'bg-brand-navy/10'
                    }`}
                  >
                    <role.icon className={`h-7 w-7 ${
                      activeEcosystemRole === i ? 'text-white' : 'text-brand-navy'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-border/30">
              {ecosystemRoles.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeEcosystemRole === i ? 'w-8 bg-brand-turquoise' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ========== CALL TO ACTION SECTION ========== */}
      <section
        className="py-20 lg:py-28 relative overflow-hidden"
        style={{ backgroundImage: `url(${BG_PATTERN})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        data-testid="cta-section"
      >
        <div className="absolute inset-0 bg-brand-navy/95" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-cairo text-4xl md:text-5xl font-bold text-white mb-8">
            {isRTL ? 'جاهز للبدء؟' : 'Ready to Start?'}
          </h2>
          
          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="bg-white/10 border-white/20 rounded-2xl p-6 text-start hover:bg-white/15 transition-all">
              <Building2 className="h-10 w-10 text-brand-turquoise mb-4" />
              <h3 className="font-cairo text-xl font-bold text-white mb-2">{isRTL ? 'إذا كنت مدرسة' : 'If you are a school'}</h3>
              <p className="text-white/70 text-sm font-tajawal">
                {isRTL 
                  ? 'اجعل مدرستك أكثر تنظيمًا ووضوحًا مع منصة نَسَّق.'
                  : 'Make your school more organized and clear with NASSAQ platform.'
                }
              </p>
            </Card>
            <Card className="bg-white/10 border-white/20 rounded-2xl p-6 text-start hover:bg-white/15 transition-all">
              <UserCheck className="h-10 w-10 text-brand-turquoise mb-4" />
              <h3 className="font-cairo text-xl font-bold text-white mb-2">{isRTL ? 'إذا كنت معلمًا' : 'If you are a teacher'}</h3>
              <p className="text-white/70 text-sm font-tajawal">
                {isRTL 
                  ? 'ابدأ تنظيم حصصك الآن واجعل إدارة الفصل أكثر سهولة وذكاءً.'
                  : 'Start organizing your classes now and make classroom management easier and smarter.'
                }
              </p>
            </Card>
          </div>

          {/* Hakim Message - Inline with Avatar */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <img src={HAKIM_CHARACTER} alt={isRTL ? 'حكيم' : 'Hakim'} className="w-14 h-14 rounded-full object-cover border-2 border-brand-turquoise shadow-lg flex-shrink-0" />
            <div className="text-start">
              <p className="text-white font-tajawal">
                <span className="text-brand-turquoise font-bold font-cairo">{isRTL ? 'حكيم: ' : 'Hakim: '}</span>
                {isRTL 
                  ? 'التعليم الجيد يبدأ بقرار جيد… والقرار الجيد يبدأ ببيانات واضحة. دعني أساعدك في تنظيم مدرستك.'
                  : 'Good education starts with good decisions... and good decisions start with clear data. Let me help you organize your school.'
                }
              </p>
            </div>
          </div>

          <Button asChild size="lg" className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-2xl h-14 px-12 text-xl font-cairo shadow-xl" data-testid="cta-register-btn">
            <Link to="/register" className="flex items-center gap-3">
              {isRTL ? 'سجل الآن' : 'Register Now'}
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />
      
      {/* Hakim Floating Assistant */}
      <HakimAssistant />
    </div>
  );
};
