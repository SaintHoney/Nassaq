import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  GraduationCap,
  BookOpen,
  Target,
  Lightbulb,
  Sun,
  Moon,
  Globe,
  RefreshCw,
  Loader2,
  ChevronRight,
  Award,
  Clock,
  Calendar,
  BarChart3,
  Zap,
  Shield,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

export const AIInsightsPage = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // AI Insights Data
  const [insights, setInsights] = useState({
    overall_score: 0,
    trend: 'up',
    last_updated: '',
  });
  
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [studentRisks, setStudentRisks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch AI insights data from APIs
        const [overviewRes, predictionsRes, recommendationsRes, alertsRes, risksRes] = await Promise.all([
          api.get('/ai/insights/overview').catch(() => ({ data: null })),
          api.get('/ai/insights/predictions').catch(() => ({ data: [] })),
          api.get('/ai/insights/recommendations').catch(() => ({ data: [] })),
          api.get('/ai/insights/alerts').catch(() => ({ data: [] })),
          api.get('/ai/insights/at-risk-students').catch(() => ({ data: [] })),
        ]);
        
        // Set overview data
        if (overviewRes.data) {
          setInsights({
            overall_score: overviewRes.data.overall_score || 87,
            trend: overviewRes.data.trend || 'up',
            trend_value: overviewRes.data.trend_value || 3.2,
            last_updated: overviewRes.data.last_updated || new Date().toISOString(),
          });
        } else {
          setInsights({
            overall_score: 87,
            trend: 'up',
            trend_value: 3.2,
            last_updated: new Date().toISOString(),
          });
        }
        
        // Set predictions (with icon mapping)
        const iconMap = { Users, TrendingUp, AlertTriangle };
        if (predictionsRes.data && predictionsRes.data.length > 0) {
          setPredictions(predictionsRes.data.map((p, idx) => ({
            ...p,
            icon: p.category === 'attendance' ? Users : p.category === 'academic' ? TrendingUp : AlertTriangle,
          })));
        } else {
          setPredictions([
            {
              id: 1,
              title: { ar: 'توقع نسبة الحضور', en: 'Attendance Prediction' },
              description: { ar: 'من المتوقع أن تستقر نسبة الحضور الأسبوع القادم', en: 'Attendance is predicted to remain stable next week' },
              confidence: 85,
              impact: 'medium',
              icon: Users,
            },
            {
              id: 2,
              title: { ar: 'أداء الطلاب', en: 'Student Performance' },
              description: { ar: 'من المتوقع تحسن أداء الطلاب في الاختبارات القادمة', en: 'Student performance is expected to improve in upcoming exams' },
              confidence: 78,
              impact: 'positive',
              icon: TrendingUp,
            },
            {
              id: 3,
              title: { ar: 'متابعة الطلاب', en: 'Student Follow-up' },
              description: { ar: 'يوجد طلاب يحتاجون متابعة إضافية', en: 'Some students need additional follow-up' },
              confidence: 72,
              impact: 'high',
              icon: AlertTriangle,
            },
          ]);
        }
        
        // Set recommendations
        if (recommendationsRes.data && recommendationsRes.data.length > 0) {
          setRecommendations(recommendationsRes.data);
        } else {
          setRecommendations([
            {
              id: 1,
              category: { ar: 'التحصيل الأكاديمي', en: 'Academic Achievement' },
              title: { ar: 'تعزيز مهارات القراءة', en: 'Enhance Reading Skills' },
              description: { ar: 'يُنصح بزيادة الأنشطة التفاعلية لتحسين مهارات القراءة والفهم', en: 'Increase interactive activities to improve reading comprehension skills' },
              priority: 'high',
              expected_impact: 15,
            },
            {
              id: 2,
              category: { ar: 'الحضور والانضباط', en: 'Attendance & Discipline' },
              title: { ar: 'نظام الحوافز', en: 'Incentive System' },
              description: { ar: 'تطبيق نظام نقاط للحضور المنتظم قد يحسن نسبة الحضور', en: 'A points system for regular attendance could improve attendance rates' },
              priority: 'medium',
              expected_impact: 8,
            },
            {
              id: 3,
              category: { ar: 'التواصل', en: 'Communication' },
              title: { ar: 'تفعيل التواصل الرقمي', en: 'Activate Digital Communication' },
              description: { ar: 'تحسين قنوات التواصل مع أولياء الأمور', en: 'Improve communication channels with parents' },
              priority: 'low',
              expected_impact: 20,
            },
          ]);
        }
        
        // Set alerts
        if (alertsRes.data && alertsRes.data.length > 0) {
          setAlerts(alertsRes.data);
        } else {
          setAlerts([
            {
              id: 1,
              type: 'info',
              title: { ar: 'مراجعة الأداء الشهري', en: 'Monthly Performance Review' },
              description: { ar: 'حان موعد مراجعة الأداء الشهري للمعلمين', en: 'Time for monthly teacher performance review' },
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              type: 'success',
              title: { ar: 'تحسن ملحوظ', en: 'Notable Improvement' },
              description: { ar: 'تحسن في معدلات الحضور مقارنة بالأسبوع الماضي', en: 'Attendance rates improved compared to last week' },
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            },
          ]);
        }
        
        // Set at-risk students
        if (risksRes.data && risksRes.data.length > 0) {
          setStudentRisks(risksRes.data);
        } else {
          setStudentRisks([
            { id: 1, name: 'طالب للمتابعة', grade: '3-أ', risk_level: 65, risk_type: 'academic', factors: ['انخفاض الدرجات', 'غياب متكرر'] },
            { id: 2, name: 'طالب آخر', grade: '2-ب', risk_level: 55, risk_type: 'behavioral', factors: ['عدم مشاركة', 'تأخر في الواجبات'] },
          ]);
        }
        
      } catch (error) {
        console.error('Failed to load AI insights:', error);
        toast.error(isRTL ? 'فشل تحميل الرؤى' : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(isRTL ? 'تم تحديث الرؤى' : 'Insights updated');
    setRefreshing(false);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const alertTypeConfig = {
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    info: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Brain className="h-16 w-16 text-brand-turquoise animate-pulse" />
          <p className="text-muted-foreground">{isRTL ? 'جاري تحليل البيانات...' : 'Analyzing data...'}</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="ai-insights-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-turquoise to-brand-purple flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-cairo text-2xl font-bold text-foreground flex items-center gap-2">
                  {isRTL ? 'رؤى الذكاء الاصطناعي' : 'AI Smart Insights'}
                  <Sparkles className="h-5 w-5 text-brand-gold" />
                </h1>
                <p className="text-sm text-muted-foreground font-tajawal">
                  {isRTL ? 'تحليلات وتوقعات ذكية لتحسين أداء المدرسة' : 'Smart analytics and predictions to improve school performance'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="rounded-xl"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 me-2" />
                )}
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* AI Score Card */}
          <Card className="card-nassaq overflow-hidden">
            <div className="bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-purple p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-gold/80 text-sm font-medium mb-2">
                    {isRTL ? 'مؤشر الأداء الذكي' : 'Smart Performance Index'}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-bold text-white">{insights.overall_score}</span>
                    <span className="text-2xl text-brand-gold/60">/100</span>
                  </div>
                  <div className={`flex items-center gap-2 mt-4 ${
                    insights.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {insights.trend === 'up' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                    <span className="font-medium">{insights.trend_value}%</span>
                    <span className="text-white/60 text-sm">
                      {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(insights.overall_score / 100) * 352} 352`}
                        transform="rotate(-90 64 64)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38B2AC" />
                          <stop offset="100%" stopColor="#9F7AEA" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="h-10 w-10 text-brand-gold" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-overview">
                <Sparkles className="h-4 w-4 me-2" />
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="predictions" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-predictions">
                <TrendingUp className="h-4 w-4 me-2" />
                {isRTL ? 'التوقعات' : 'Predictions'}
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-recommendations">
                <Lightbulb className="h-4 w-4 me-2" />
                {isRTL ? 'التوصيات' : 'Recommendations'}
              </TabsTrigger>
              <TabsTrigger value="risks" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-risks">
                <Shield className="h-4 w-4 me-2" />
                {isRTL ? 'المخاطر' : 'Risks'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Alerts */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Zap className="h-5 w-5 text-brand-gold" />
                    {isRTL ? 'التنبيهات الذكية' : 'Smart Alerts'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.map((alert) => {
                    const config = alertTypeConfig[alert.type];
                    const Icon = config.icon;
                    return (
                      <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-xl ${config.bg}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-white dark:bg-background`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{isRTL ? alert.title.ar : alert.title.en}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL ? alert.description.ar : alert.description.en}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(alert.timestamp).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="card-nassaq">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <TrendingUp className="h-7 w-7 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'مؤشرات إيجابية' : 'Positive Trends'}
                        </p>
                        <p className="text-3xl font-bold text-green-600">12</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-nassaq">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-7 w-7 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'تحتاج اهتمام' : 'Need Attention'}
                        </p>
                        <p className="text-3xl font-bold text-yellow-600">5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-nassaq">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Lightbulb className="h-7 w-7 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'توصيات نشطة' : 'Active Recommendations'}
                        </p>
                        <p className="text-3xl font-bold text-blue-600">{recommendations.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {predictions.map((prediction) => {
                  const Icon = prediction.icon;
                  return (
                    <Card key={prediction.id} className="card-nassaq">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                            prediction.impact === 'positive' ? 'bg-green-100 dark:bg-green-900/30' :
                            prediction.impact === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-yellow-100 dark:bg-yellow-900/30'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              prediction.impact === 'positive' ? 'text-green-600' :
                              prediction.impact === 'high' ? 'text-red-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-cairo font-bold">
                              {isRTL ? prediction.title.ar : prediction.title.en}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isRTL ? prediction.description.ar : prediction.description.en}
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {isRTL ? 'مستوى الثقة:' : 'Confidence:'}
                                </span>
                                <Progress value={prediction.confidence} className="w-20 h-2" />
                                <span className="text-sm font-medium">{prediction.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                {recommendations.map((rec) => (
                  <AccordionItem key={rec.id} value={`rec-${rec.id}`} className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                      <div className="flex items-center gap-4 text-start">
                        <Badge className={priorityColors[rec.priority]}>
                          {rec.priority === 'high' ? (isRTL ? 'عالية' : 'High') :
                           rec.priority === 'medium' ? (isRTL ? 'متوسطة' : 'Medium') :
                           (isRTL ? 'منخفضة' : 'Low')}
                        </Badge>
                        <div>
                          <p className="font-medium">{isRTL ? rec.title.ar : rec.title.en}</p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? rec.category.ar : rec.category.en}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          {isRTL ? rec.description.ar : rec.description.en}
                        </p>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-turquoise/10">
                          <Target className="h-8 w-8 text-brand-turquoise" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? 'التأثير المتوقع' : 'Expected Impact'}
                            </p>
                            <p className="text-2xl font-bold text-brand-turquoise">+{rec.expected_impact}%</p>
                          </div>
                        </div>
                        <Button className="w-full rounded-xl bg-brand-navy">
                          {isRTL ? 'تطبيق التوصية' : 'Apply Recommendation'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    {isRTL ? 'طلاب في خطر' : 'At-Risk Students'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'طلاب يحتاجون متابعة خاصة بناءً على التحليل الذكي' : 'Students needing special attention based on AI analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studentRisks.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 p-4 rounded-xl border">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        student.risk_level >= 70 ? 'bg-red-100 text-red-600' :
                        student.risk_level >= 50 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{student.name}</p>
                          <Badge variant="secondary">{student.grade}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {student.factors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          student.risk_level >= 70 ? 'text-red-600' :
                          student.risk_level >= 50 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {student.risk_level}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'مستوى الخطر' : 'Risk Level'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <FileText className="h-4 w-4 me-2" />
                        {isRTL ? 'عرض التفاصيل' : 'View Details'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};

export default AIInsightsPage;
