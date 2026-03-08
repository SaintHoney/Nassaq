import { useState, useEffect, useRef } from 'react';
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
  Play,
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
  School,
  Clock,
  Shield,
  Headphones,
} from 'lucide-react';

const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const BG_PATTERN = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/1itjy61q_Nassaq%20Background.png';
const HAKIM_CHARACTER = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/bfdsnfxc_Hakim%20Character%20Examples%20and%20Referance%2001.avif';

export const LandingPage = () => {
  const { isRTL } = useTheme();
  const [hakimMessage, setHakimMessage] = useState(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const [activeAIStep, setActiveAIStep] = useState(0);
  const [activeEcosystemStep, setActiveEcosystemStep] = useState(0);

  // Hakim messages for hero
  const hakimMessages = [
    isRTL ? 'مرحبًا… أنا حكيم.' : 'Hello... I am Hakim.',
    isRTL ? 'أنا العقل الذكي داخل منصة نَسَّق.' : 'I am the intelligent mind inside NASSAQ.',
    isRTL ? 'أساعد المدارس على فهم بياناتها وتحويلها إلى قرارات تعليمية واضحة.' : 'I help schools understand their data and transform it into clear educational decisions.',
    isRTL ? 'هل ترغب أن أريك كيف يمكن للذكاء الاصطناعي أن يساعد مدرستك؟' : 'Would you like me to show you how AI can help your school?',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHakimMessage((prev) => (prev + 1) % hakimMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hakimMessages.length]);

  // Traction stats
  const tractionStats = [
    { value: '+200', label: isRTL ? 'مدرسة' : 'Schools', icon: Building2 },
    { value: '+50,000', label: isRTL ? 'طالب' : 'Students', icon: GraduationCap },
    { value: '+100,000', label: isRTL ? 'ولي أمر' : 'Parents', icon: Users },
    { value: '+3,000', label: isRTL ? 'معلم ومعلمة' : 'Teachers', icon: UserCheck },
    { value: '24/7', label: isRTL ? 'دعم فني متواصل' : 'Support', icon: Headphones },
  ];

  // Journey steps - Section 2
  const journeySteps = [
    {
      title: isRTL ? 'الواقع اليومي للمدرسة' : 'Daily School Reality',
      subtitle: isRTL ? 'كل مدرسة تنتج آلاف البيانات يوميًا' : 'Every school produces thousands of data points daily',
      description: isRTL
        ? 'داخل المدرسة يحدث الكثير كل يوم: تسجيل حضور الطلاب، تقييم الواجبات، تسجيل السلوك، مشاركة الطلاب داخل الفصل، نتائج الاختبارات، ملاحظات المعلمين. لكن هذه البيانات غالبًا تكون موزعة ومجزأة داخل أنظمة مختلفة.'
        : 'A lot happens inside the school every day: student attendance, homework evaluation, behavior recording, classroom participation, test results, teacher notes. But this data is often scattered across different systems.',
      hakimSays: isRTL
        ? 'المدارس تولد آلاف البيانات كل يوم… لكن القليل منها يستطيع تحويل هذه البيانات إلى معرفة.'
        : 'Schools generate thousands of data points every day... but few can transform this data into knowledge.',
      icons: [BarChart3, Calendar, Brain, BookOpen, Target, Bell],
    },
    {
      title: isRTL ? 'جمع البيانات داخل نَسَّق' : 'Data Collection in NASSAQ',
      subtitle: isRTL ? 'هنا يبدأ دور منصة نَسَّق' : 'This is where NASSAQ comes in',
      description: isRTL
        ? 'يقوم النظام بجمع كل هذه البيانات داخل منصة واحدة. تصبح المدرسة قادرة على رؤية: الحضور، الأداء الأكاديمي، السلوك، التفاعل داخل الحصة، الواجبات، التقييمات. كل ذلك في لوحة تحكم واحدة.'
        : 'The system collects all this data in one platform. The school can see: attendance, academic performance, behavior, classroom interaction, assignments, assessments. All in one dashboard.',
      hakimSays: isRTL
        ? 'مهمتي هي تنظيم هذه البيانات وتحويلها إلى صورة واضحة للمدرسة.'
        : 'My mission is to organize this data and transform it into a clear picture for the school.',
      icons: [Database, TrendingUp, CheckCircle2, Award],
    },
    {
      title: isRTL ? 'تحليل البيانات بالذكاء الاصطناعي' : 'AI Data Analysis',
      subtitle: isRTL ? 'عندما يبدأ الذكاء الاصطناعي بالتحليل' : 'When AI starts analyzing',
      description: isRTL
        ? 'يقوم نظام نَسَّق بتحليل البيانات باستخدام خوارزميات الذكاء الاصطناعي. يتم اكتشاف: الطلاب الذين يحتاجون دعمًا، الأنماط السلوكية داخل الفصول، تراجع الأداء الأكاديمي، فرص تحسين المشاركة.'
        : 'NASSAQ analyzes data using AI algorithms. It discovers: students who need support, behavioral patterns in classrooms, declining academic performance, opportunities to improve participation.',
      hakimSays: isRTL
        ? 'أنا لا أعرض الأرقام فقط… بل أكتشف ما تعنيه هذه الأرقام.'
        : 'I don\'t just display numbers... I discover what these numbers mean.',
      icons: [Brain, Lightbulb, TrendingUp, Target],
    },
    {
      title: isRTL ? 'اتخاذ القرار' : 'Decision Making',
      subtitle: isRTL ? 'من البيانات… إلى القرار' : 'From Data... to Decision',
      description: isRTL
        ? 'بعد تحليل البيانات، يصبح لدى المدرسة رؤية واضحة تساعدها على: دعم الطلاب المتعثرين، تحسين أداء الفصول، اتخاذ قرارات تعليمية مبنية على البيانات، تحسين جودة العملية التعليمية.'
        : 'After analyzing data, the school has a clear vision that helps: support struggling students, improve classroom performance, make data-driven educational decisions, improve education quality.',
      hakimSays: isRTL
        ? 'البيانات وحدها لا تغيّر التعليم… لكن القرارات الصحيحة تفعل.'
        : 'Data alone doesn\'t change education... but the right decisions do.',
      icons: [CheckCircle2, Award, Target, TrendingUp],
    },
  ];

  // AI Intelligence steps - Section 3
  const aiSteps = [
    {
      title: isRTL ? 'عندما تبدأ البيانات بالتحدث' : 'When Data Starts Speaking',
      subtitle: isRTL ? 'الذكاء الاصطناعي ليس ميزة إضافية في نَسَّق بل هو العقل الذي يعمل خلف النظام' : 'AI is not an extra feature in NASSAQ, it is the brain behind the system',
      description: isRTL
        ? 'كل تفاعل يحدث داخل المدرسة يتحول إلى بيانات: حضور الطلاب، مشاركة الطلاب داخل الحصة، الواجبات، التقييمات، السلوك، ملاحظات المعلمين. هذه البيانات لا تبقى مجرد أرقام… بل تتحول إلى مدخلات لذكاء النظام.'
        : 'Every interaction in school becomes data: student attendance, classroom participation, homework, assessments, behavior, teacher notes. This data doesn\'t remain just numbers... it becomes inputs for the system\'s intelligence.',
      hakimSays: isRTL
        ? 'كل يوم تولد المدرسة آلاف البيانات… مهمتي هي أن أفهم ما تعنيه هذه البيانات.'
        : 'Every day the school generates thousands of data points... my mission is to understand what this data means.',
    },
    {
      title: isRTL ? 'تحليل أداء الطلاب' : 'Student Performance Analysis',
      subtitle: isRTL ? 'فهم الطالب قبل أن تظهر المشكلة' : 'Understanding the student before the problem appears',
      description: isRTL
        ? 'يقوم الذكاء الاصطناعي داخل نَسَّق بتحليل أداء الطالب بشكل مستمر. ويأخذ في الاعتبار عدة عوامل: نسبة الحضور، المشاركة داخل الحصة، إنجاز الواجبات، نتائج التقييمات، السلوك داخل الفصل.'
        : 'AI in NASSAQ continuously analyzes student performance, considering multiple factors: attendance rate, classroom participation, homework completion, assessment results, classroom behavior.',
      hakimSays: isRTL
        ? 'يمكنني اكتشاف الطالب الذي يحتاج دعمًا… قبل أن تتحول المشكلة إلى أزمة تعليمية.'
        : 'I can discover students who need support... before the problem becomes an educational crisis.',
    },
    {
      title: isRTL ? 'الجداول الدراسية الذكية' : 'Smart School Schedules',
      subtitle: isRTL ? 'عندما تصبح الجداول الدراسية عملية ذكية' : 'When school schedules become a smart process',
      description: isRTL
        ? 'إنشاء جدول مدرسي متوازن عملية معقدة. يجب مراعاة: المعلمين، الفصول، المواد، القاعات، عدد الحصص، التعارضات. يقوم الذكاء الاصطناعي داخل نَسَّق بتحليل هذه العوامل لبناء جدول أفضل.'
        : 'Creating a balanced school schedule is complex. It must consider: teachers, classes, subjects, rooms, number of sessions, conflicts. AI in NASSAQ analyzes these factors to build a better schedule.',
      hakimSays: isRTL
        ? 'يمكنني تحليل آلاف الاحتمالات في ثوانٍ لبناء جدول دراسي متوازن.'
        : 'I can analyze thousands of possibilities in seconds to build a balanced school schedule.',
    },
    {
      title: isRTL ? 'التقارير التعليمية الذكية' : 'Smart Educational Reports',
      subtitle: isRTL ? 'التقارير التي تفهمها… لا مجرد تقرأها' : 'Reports you understand... not just read',
      description: isRTL
        ? 'بدلاً من عرض الأرقام فقط، يقوم النظام بتحويل البيانات إلى رؤى تعليمية. يمكن للإدارة رؤية: أداء الفصول، تطور الطلاب، الأنماط السلوكية، جودة المشاركة داخل الحصص.'
        : 'Instead of just displaying numbers, the system transforms data into educational insights. Management can see: class performance, student development, behavioral patterns, quality of classroom participation.',
      hakimSays: isRTL
        ? 'الأرقام وحدها لا تكفي… مهمتي هي تحويلها إلى رؤية تساعد المدرسة على اتخاذ القرار.'
        : 'Numbers alone are not enough... my mission is to transform them into insights that help the school make decisions.',
    },
  ];

  // Ecosystem roles - Section 4
  const ecosystemRoles = [
    {
      role: isRTL ? 'مدير المدرسة' : 'School Principal',
      title: isRTL ? 'المدرسة كاملة… في لوحة تحكم واحدة' : 'The entire school... in one dashboard',
      description: isRTL
        ? 'عندما يدخل مدير المدرسة إلى نَسَّق، يرى صورة كاملة عن المدرسة في لحظة واحدة. يمكنه متابعة: حضور الطلاب، أداء الفصول، نشاط المعلمين، السلوك الطلابي، تقارير الأداء.'
        : 'When the principal enters NASSAQ, they see a complete picture of the school in one moment. They can track: student attendance, class performance, teacher activity, student behavior, performance reports.',
      hakimSays: isRTL
        ? 'بدل البحث في عشرات التقارير… يمكنني عرض صورة كاملة عن المدرسة في شاشة واحدة.'
        : 'Instead of searching through dozens of reports... I can show a complete picture of the school on one screen.',
      icon: Building2,
    },
    {
      role: isRTL ? 'المعلم' : 'Teacher',
      title: isRTL ? 'إدارة الحصة أصبحت أكثر ذكاءً' : 'Class management became smarter',
      description: isRTL
        ? 'يستخدم المعلم نَسَّق لإدارة الحصة بسهولة. يمكنه: تسجيل الحضور، متابعة تفاعل الطلاب، تقييم الإجابات، تسجيل السلوك، إضافة التقييمات. كل ذلك أثناء الحصة في واجهة بسيطة.'
        : 'Teachers use NASSAQ to manage classes easily. They can: record attendance, track student interaction, evaluate answers, record behavior, add assessments. All during class in a simple interface.',
      hakimSays: isRTL
        ? 'أثناء الحصة… أساعد المعلم على فهم مستوى التفاعل داخل الفصل.'
        : 'During class... I help the teacher understand the level of interaction in the classroom.',
      icon: UserCheck,
    },
    {
      role: isRTL ? 'الطالب' : 'Student',
      title: isRTL ? 'التعلم يصبح تجربة محفزة' : 'Learning becomes a motivating experience',
      description: isRTL
        ? 'حساب الطالب داخل نَسَّق مصمم ليكون: بسيط، محفز، تفاعلي. يحصل الطالب على: نقاط المشاركة، إنجازات، متابعة الواجبات، تقارير تقدمه الدراسي.'
        : 'The student account in NASSAQ is designed to be: simple, motivating, interactive. Students get: participation points, achievements, homework tracking, progress reports.',
      hakimSays: isRTL
        ? 'عندما يرى الطالب تقدمه بنفسه… يصبح التعلم تجربة أكثر تحفيزًا.'
        : 'When students see their progress themselves... learning becomes a more motivating experience.',
      icon: GraduationCap,
    },
    {
      role: isRTL ? 'ولي الأمر' : 'Parent',
      title: isRTL ? 'متابعة حقيقية لأداء الابن' : 'Real tracking of child performance',
      description: isRTL
        ? 'يمكن لولي الأمر متابعة أداء الابن بسهولة من خلال: الحضور، الواجبات، السلوك، التقييمات. كل ذلك عبر لوحة بسيطة وواضحة.'
        : 'Parents can easily track their child\'s performance through: attendance, homework, behavior, assessments. All through a simple and clear dashboard.',
      hakimSays: isRTL
        ? 'عندما يكون ولي الأمر جزءًا من الصورة… تصبح العملية التعليمية أكثر نجاحًا.'
        : 'When parents are part of the picture... the educational process becomes more successful.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
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
              
              <h1 className="font-cairo text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                {isRTL ? 'نَسَّق' : 'NASSAQ'}
              </h1>
              
              <p className="text-2xl md:text-3xl text-brand-turquoise font-semibold mb-6">
                {isRTL ? 'من البيانات إلى القرار' : 'From Data To Decision'}
              </p>
              
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
                {isRTL
                  ? 'منصة متكاملة لإدارة المدارس وفق معايير تعليمية حديثة، مدعومة بالذكاء الاصطناعي لتحويل بيانات المدرسة اليومية إلى رؤى واضحة تساعد الإدارة والمعلمين على اتخاذ قرارات تعليمية أفضل.'
                  : 'An integrated platform for school management according to modern educational standards, powered by AI to transform daily school data into clear insights that help management and teachers make better educational decisions.'}
              </p>
              
              {/* Traction Stats */}
              <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm mb-4">
                  {isRTL
                    ? 'تستخدم منصة نَسَّق اليوم في مدارس حقيقية وتدير آلاف العمليات التعليمية يوميًا.'
                    : 'NASSAQ is used today in real schools and manages thousands of educational operations daily.'}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {tractionStats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <stat.icon className="h-5 w-5 text-brand-turquoise mx-auto mb-1" />
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/50">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                asChild
                size="lg"
                className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-xl h-14 px-8 text-lg"
                data-testid="hero-cta-btn"
              >
                <Link to="/login">
                  {isRTL ? 'الدخول إلى المنصة' : 'Enter Platform'}
                  {isRTL ? <ArrowLeft className="ms-2 h-5 w-5" /> : <ArrowRight className="ms-2 h-5 w-5" />}
                </Link>
              </Button>
            </div>

            {/* Hakim Character */}
            <div className="relative hidden lg:block animate-fade-up animate-delay-200">
              <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-3xl" />
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم"
                    className="relative z-10 w-full h-full object-contain animate-float"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.3))' }}
                  />
                </div>
                
                {/* Hakim Speech Bubble */}
                <div className="absolute -bottom-4 start-0 end-0 mx-auto w-[320px]">
                  <Card className="bg-brand-purple/90 backdrop-blur-lg border-brand-purple-light rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-white/70 flex-shrink-0 mt-1" />
                      <p className="text-white text-sm leading-relaxed animate-fade-in" key={hakimMessage}>
                        {hakimMessages[hakimMessage]}
                      </p>
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
            <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: Journey to Smart System ========== */}
      <section className="py-20 lg:py-32 bg-background" data-testid="journey-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'رحلة المدرسة نحو النظام الذكي' : 'School Journey to Smart System'}
            </h2>
            <p className="text-xl text-brand-turquoise font-semibold">
              {isRTL ? 'من البيانات إلى القرارات' : 'From Data to Decisions'}
            </p>
          </div>

          {/* Journey Steps Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-2 p-2 bg-muted rounded-2xl">
              {journeySteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveJourneyStep(i)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                    activeJourneyStep === i
                      ? 'bg-brand-navy text-white'
                      : 'bg-transparent text-muted-foreground hover:bg-brand-navy/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Journey Step */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Card className="card-nassaq p-8">
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
                
                <h3 className="font-cairo text-2xl font-bold mb-2">
                  {journeySteps[activeJourneyStep].title}
                </h3>
                <p className="text-brand-turquoise font-semibold mb-4">
                  {journeySteps[activeJourneyStep].subtitle}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {journeySteps[activeJourneyStep].description}
                </p>
              </Card>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="w-48 h-48 mx-auto relative">
                  <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-2xl" />
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم"
                    className="relative z-10 w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(124, 58, 237, 0.2))' }}
                  />
                </div>
                <Card className="mt-4 bg-brand-purple/10 border-brand-purple/20 rounded-2xl p-4">
                  <p className="text-foreground text-sm leading-relaxed">
                    <span className="text-brand-purple font-bold">
                      {isRTL ? 'حكيم: ' : 'Hakim: '}
                    </span>
                    {journeySteps[activeJourneyStep].hakimSays}
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Journey End Message */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-brand-navy text-white rounded-2xl px-8 py-4">
              <p className="font-cairo text-xl font-bold">
                {isRTL
                  ? 'نَسَّق يحول بيانات المدرسة إلى قرارات تعليمية ذكية'
                  : 'NASSAQ transforms school data into smart educational decisions'}
              </p>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                className="rounded-xl border-brand-turquoise text-brand-turquoise hover:bg-brand-turquoise/10"
              >
                {isRTL ? 'اكتشف كيف يعمل نَسَّق' : 'Discover how NASSAQ works'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: AI Intelligence ========== */}
      <section className="py-20 lg:py-32 bg-brand-navy relative overflow-hidden" data-testid="ai-section">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${BG_PATTERN})`,
            backgroundSize: 'cover',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-purple/20 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-brand-purple" />
              <span className="text-white/80 text-sm">
                {isRTL ? 'الذكاء الاصطناعي' : 'Artificial Intelligence'}
              </span>
            </div>
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-white mb-4">
              {isRTL ? 'الذكاء الاصطناعي داخل نَسَّق' : 'AI Inside NASSAQ'}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              {isRTL
                ? 'الذكاء الاصطناعي ليس ميزة إضافية في نَسَّق بل هو العقل الذي يعمل خلف النظام'
                : 'AI is not an extra feature in NASSAQ, it is the brain that works behind the system'}
            </p>
          </div>

          {/* AI Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiSteps.map((step, i) => (
              <Card
                key={i}
                className={`bg-white/5 border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 ${
                  activeAIStep === i ? 'ring-2 ring-brand-turquoise' : ''
                }`}
                onClick={() => setActiveAIStep(i)}
                data-testid={`ai-step-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-turquoise/20 flex items-center justify-center mb-4">
                  <span className="text-brand-turquoise font-bold text-xl">{i + 1}</span>
                </div>
                <h3 className="font-cairo text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.subtitle}</p>
              </Card>
            ))}
          </div>

          {/* Active AI Step Details */}
          <div className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
            <Card className="bg-white/5 border-white/10 rounded-2xl p-8">
              <p className="text-white/80 leading-relaxed mb-6">
                {aiSteps[activeAIStep].description}
              </p>
              <div className="flex items-start gap-3 bg-brand-purple/20 rounded-xl p-4">
                <img
                  src={HAKIM_CHARACTER}
                  alt="حكيم"
                  className="w-12 h-12 rounded-lg object-cover"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(124, 58, 237, 0.3))' }}
                />
                <p className="text-white text-sm">
                  <span className="text-brand-purple font-bold">
                    {isRTL ? 'حكيم: ' : 'Hakim: '}
                  </span>
                  {aiSteps[activeAIStep].hakimSays}
                </p>
              </div>
            </Card>
            
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-3xl animate-pulse" />
                <img
                  src={HAKIM_CHARACTER}
                  alt="حكيم"
                  className="relative z-10 w-full h-full object-contain animate-float"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.4))' }}
                />
              </div>
            </div>
          </div>

          {/* AI Section End */}
          <div className="mt-16 text-center">
            <p className="text-white/60 text-lg mb-6">
              {isRTL
                ? 'الذكاء الاصطناعي داخل نَسَّق يعمل بصمت… ليجعل المدرسة أكثر وضوحًا.'
                : 'AI inside NASSAQ works silently... to make the school clearer.'}
            </p>
            <Button
              className="bg-brand-purple hover:bg-brand-purple-light text-white rounded-xl"
              data-testid="ask-hakim-btn"
            >
              {isRTL ? 'اسأل حكيم' : 'Ask Hakim'}
              <Sparkles className="ms-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: Ecosystem ========== */}
      <section className="py-20 lg:py-32 bg-background" data-testid="ecosystem-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'عندما يعمل الجميع داخل نظام واحد' : 'When Everyone Works in One System'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isRTL ? 'منصة واحدة. نظام بيئي تعليمي واحد.' : 'One Platform. One Educational Ecosystem.'}
            </p>
          </div>

          {/* Ecosystem Role Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {ecosystemRoles.map((role, i) => (
              <Card
                key={i}
                className={`card-nassaq p-6 cursor-pointer transition-all ${
                  activeEcosystemStep === i ? 'ring-2 ring-brand-turquoise scale-105' : ''
                }`}
                onClick={() => setActiveEcosystemStep(i)}
                data-testid={`ecosystem-role-${i}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-navy/10 flex items-center justify-center mb-4">
                  <role.icon className="h-7 w-7 text-brand-navy" />
                </div>
                <h3 className="font-cairo text-lg font-bold mb-1">{role.role}</h3>
                <p className="text-sm text-muted-foreground">{role.title}</p>
              </Card>
            ))}
          </div>

          {/* Active Role Details */}
          <Card className="card-nassaq p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-cairo text-2xl font-bold mb-4">
                  {ecosystemRoles[activeEcosystemStep].title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {ecosystemRoles[activeEcosystemStep].description}
                </p>
                <div className="flex items-start gap-3 bg-brand-purple/10 rounded-xl p-4">
                  <img
                    src={HAKIM_CHARACTER}
                    alt="حكيم"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <p className="text-foreground text-sm">
                    <span className="text-brand-purple font-bold">
                      {isRTL ? 'حكيم: ' : 'Hakim: '}
                    </span>
                    {ecosystemRoles[activeEcosystemStep].hakimSays}
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {ecosystemRoles.map((role, i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                          activeEcosystemStep === i
                            ? 'bg-brand-turquoise scale-125'
                            : 'bg-brand-navy/10'
                        }`}
                      >
                        <role.icon className={`h-8 w-8 ${
                          activeEcosystemStep === i ? 'text-white' : 'text-brand-navy'
                        }`} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      {isRTL
                        ? 'جميعهم متصلون داخل منصة واحدة'
                        : 'All connected within one platform'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Ecosystem Message */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-brand-turquoise/10 text-brand-turquoise rounded-2xl px-8 py-4">
              <p className="font-cairo text-lg font-bold">
                {isRTL
                  ? 'نَسَّق يربط جميع أطراف العملية التعليمية في نظام ذكي واحد.'
                  : 'NASSAQ connects all educational stakeholders in one smart system.'}
              </p>
            </div>
          </div>

          {/* Hakim Final Message */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <img
              src={HAKIM_CHARACTER}
              alt="حكيم"
              className="w-16 h-16 rounded-xl object-cover"
            />
            <Card className="bg-brand-purple/10 border-brand-purple/20 rounded-2xl p-4 max-w-md">
              <p className="text-foreground text-sm">
                <span className="text-brand-purple font-bold">
                  {isRTL ? 'حكيم: ' : 'Hakim: '}
                </span>
                {isRTL
                  ? 'عندما تعمل المدرسة كنظام واحد… يصبح التعليم أكثر وضوحًا وتأثيرًا.'
                  : 'When the school works as one system... education becomes clearer and more impactful.'}
              </p>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              asChild
              className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-xl"
            >
              <Link to="/register">
                {isRTL ? 'اكتشف كيف تعمل المنصة' : 'Discover how the platform works'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
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
            {isRTL ? 'جاهزون للبدء؟' : 'Ready to Start?'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white/10 border-white/20 rounded-2xl p-6 text-start">
              <Building2 className="h-8 w-8 text-brand-turquoise mb-4" />
              <h3 className="font-cairo text-xl font-bold text-white mb-2">
                {isRTL ? 'إذا كنت مدرسة' : 'If you are a school'}
              </h3>
              <p className="text-white/70 text-sm">
                {isRTL
                  ? 'اجعل مدرستك أكثر تنظيمًا ووضوحًا مع منصة نَسَّق.'
                  : 'Make your school more organized and clear with NASSAQ platform.'}
              </p>
            </Card>
            <Card className="bg-white/10 border-white/20 rounded-2xl p-6 text-start">
              <UserCheck className="h-8 w-8 text-brand-turquoise mb-4" />
              <h3 className="font-cairo text-xl font-bold text-white mb-2">
                {isRTL ? 'إذا كنت معلمًا' : 'If you are a teacher'}
              </h3>
              <p className="text-white/70 text-sm">
                {isRTL
                  ? 'ابدأ تنظيم حصصك الآن واجعل إدارة الفصل أكثر سهولة وذكاءً.'
                  : 'Start organizing your classes now and make classroom management easier and smarter.'}
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
                  style={{ filter: 'drop-shadow(0 0 15px rgba(124, 58, 237, 0.3))' }}
                />
              </div>
            </div>
            
            <Card className="bg-brand-purple/20 border-brand-purple/30 rounded-2xl p-4 max-w-lg mb-6">
              <p className="text-white text-sm">
                <span className="text-brand-purple font-bold">
                  {isRTL ? 'حكيم: ' : 'Hakim: '}
                </span>
                {isRTL
                  ? 'التعليم الجيد يبدأ بقرار جيد… والقرار الجيد يبدأ ببيانات واضحة. دعني أساعدك في تنظيم مدرستك.'
                  : 'Good education starts with a good decision... and good decisions start with clear data. Let me help you organize your school.'}
              </p>
            </Card>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-brand-turquoise hover:bg-brand-turquoise-light text-white rounded-xl h-16 px-12 text-xl"
            data-testid="cta-register-btn"
          >
            <Link to="/register">
              {isRTL ? 'سجل الآن' : 'Register Now'}
              {isRTL ? <ArrowLeft className="ms-2 h-6 w-6" /> : <ArrowRight className="ms-2 h-6 w-6" />}
            </Link>
          </Button>
          
          <p className="mt-4 text-white/50 text-sm">
            {isRTL
              ? 'ابدأ الآن واكتشف كيف يمكن للذكاء الاصطناعي أن يساعدك.'
              : 'Start now and discover how AI can help you.'}
          </p>

          {/* End Message */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-white/60 text-lg">
              {isRTL
                ? 'نَسَّق ليس مجرد نظام… بل بيئة تعليمية ذكية تساعد المدرسة على اتخاذ القرار الصحيح.'
                : 'NASSAQ is not just a system... but a smart educational environment that helps the school make the right decision.'}
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <HakimAssistant />
    </div>
  );
};
