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
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Sun,
  Moon,
  Globe,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Heart,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export const SchoolReportsPage = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current_term');
  const [selectedClass, setSelectedClass] = useState('all');
  
  // Data
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    attendance_rate: 0,
    avg_grade: 0,
  });
  
  // Mock data for reports
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [behaviorData, setBehaviorData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch data from APIs
        const [classesRes, overviewRes, attendanceRes, gradesRes] = await Promise.all([
          api.get(`/classes?school_id=${user?.tenant_id}`).catch(() => ({ data: [] })),
          api.get(`/reports/school/overview?period=${selectedPeriod}`).catch(() => ({ data: null })),
          api.get(`/reports/school/attendance?period=${selectedPeriod}`).catch(() => ({ data: [] })),
          api.get(`/reports/school/grades?period=${selectedPeriod}`).catch(() => ({ data: [] })),
        ]);
        
        setClasses(classesRes.data || []);
        
        // Set statistics from API - no fallback to mock data
        if (overviewRes.data) {
          setStats({
            total_students: overviewRes.data.total_students || 0,
            total_teachers: overviewRes.data.total_teachers || 0,
            total_classes: overviewRes.data.total_classes || 0,
            attendance_rate: overviewRes.data.attendance_rate || 0,
            avg_grade: overviewRes.data.avg_grade || 0,
          });
        } else {
          // Empty state - no mock data
          setStats({
            total_students: 0,
            total_teachers: 0,
            total_classes: 0,
            attendance_rate: 0,
            avg_grade: 0,
          });
        }
        
        // Set attendance data from API - no fallback to mock data
        if (attendanceRes.data && attendanceRes.data.length > 0) {
          setAttendanceData(attendanceRes.data);
        } else {
          // Empty state
          setAttendanceData([]);
        }
        
        // Set grade data from API - no fallback to mock data
        if (gradesRes.data && gradesRes.data.length > 0) {
          setGradeData(gradesRes.data);
        } else {
          // Empty state
          setGradeData([]);
        }
        
        // Behavior data - empty until API is available
        setBehaviorData([]);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, selectedPeriod, selectedClass]);

  const handleExport = (format) => {
    toast.success(isRTL ? `جاري تصدير التقرير بصيغة ${format}` : `Exporting report as ${format}`);
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, color }) => (
    <Card className="card-nassaq">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{change}%</span>
              </div>
            )}
          </div>
          <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="school-reports-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'تقارير شاملة عن أداء المدرسة' : 'Comprehensive school performance reports'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <Calendar className="h-4 w-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_term">{isRTL ? 'الفصل الحالي' : 'Current Term'}</SelectItem>
                  <SelectItem value="last_term">{isRTL ? 'الفصل السابق' : 'Last Term'}</SelectItem>
                  <SelectItem value="current_year">{isRTL ? 'العام الحالي' : 'Current Year'}</SelectItem>
                  <SelectItem value="last_year">{isRTL ? 'العام السابق' : 'Last Year'}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => handleExport('PDF')} className="rounded-xl">
                <Download className="h-4 w-4 me-2" />
                {isRTL ? 'تصدير' : 'Export'}
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
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title={isRTL ? 'إجمالي الطلاب' : 'Total Students'}
              value={stats.total_students}
              icon={GraduationCap}
              change={5.2}
              changeType="positive"
              color="bg-brand-turquoise"
            />
            <StatCard
              title={isRTL ? 'إجمالي المعلمين' : 'Total Teachers'}
              value={stats.total_teachers}
              icon={Users}
              change={2.1}
              changeType="positive"
              color="bg-brand-purple"
            />
            <StatCard
              title={isRTL ? 'الفصول' : 'Classes'}
              value={stats.total_classes}
              icon={BookOpen}
              color="bg-brand-navy"
            />
            <StatCard
              title={isRTL ? 'نسبة الحضور' : 'Attendance Rate'}
              value={`${stats.attendance_rate}%`}
              icon={CheckCircle}
              change={1.5}
              changeType="positive"
              color="bg-green-500"
            />
            <StatCard
              title={isRTL ? 'السلوك الإيجابي' : 'Positive Behavior'}
              value={behaviorData.find(b => b.type === 'positive')?.count || 0}
              icon={Target}
              change={behaviorData.find(b => b.type === 'positive')?.change || 0}
              changeType="positive"
              color="bg-amber-500"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-overview">
                <BarChart3 className="h-4 w-4 me-2" />
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-attendance">
                <CheckCircle className="h-4 w-4 me-2" />
                {isRTL ? 'الحضور' : 'Attendance'}
              </TabsTrigger>
              <TabsTrigger value="grades" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-grades">
                <Award className="h-4 w-4 me-2" />
                {isRTL ? 'الدرجات' : 'Grades'}
              </TabsTrigger>
              <TabsTrigger value="behavior" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-behavior">
                <Target className="h-4 w-4 me-2" />
                {isRTL ? 'السلوك' : 'Behavior'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Overview */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="font-cairo flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {isRTL ? 'ملخص الحضور' : 'Attendance Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{isRTL ? 'نسبة الحضور الكلية' : 'Overall Attendance'}</span>
                        <span className="font-bold text-green-600">94.5%</span>
                      </div>
                      <Progress value={94.5} className="h-3" />
                      
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                          <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <p className="text-2xl font-bold text-green-600">425</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'حاضر' : 'Present'}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                          <p className="text-2xl font-bold text-red-600">18</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'غائب' : 'Absent'}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                          <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                          <p className="text-2xl font-bold text-yellow-600">7</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'متأخر' : 'Late'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grades Overview */}
                <Card className="card-nassaq">
                  <CardHeader>
                    <CardTitle className="font-cairo flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      {isRTL ? 'ملخص الدرجات' : 'Grades Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{isRTL ? 'متوسط الدرجات الكلي' : 'Overall Average'}</span>
                        <span className="font-bold text-amber-600">78.3%</span>
                      </div>
                      <Progress value={78.3} className="h-3" />
                      
                      <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                          <p className="text-xl font-bold text-green-600">125</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'ممتاز' : 'Excellent'}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                          <p className="text-xl font-bold text-blue-600">180</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'جيد جداً' : 'Very Good'}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                          <p className="text-xl font-bold text-yellow-600">110</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'جيد' : 'Good'}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <p className="text-xl font-bold text-red-600">35</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'ضعيف' : 'Weak'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'أفضل الفصول أداءً' : 'Top Performing Classes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { rank: 1, name: 'الصف الثاني - ب', name_en: 'Grade 2-B', score: 92.5 },
                      { rank: 2, name: 'الصف الأول - ب', name_en: 'Grade 1-B', score: 90.8 },
                      { rank: 3, name: 'الصف الثالث - ب', name_en: 'Grade 3-B', score: 88.2 },
                    ].map((item) => (
                      <Card key={item.rank} className="border-2 border-brand-gold/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              item.rank === 1 ? 'bg-yellow-400' : item.rank === 2 ? 'bg-gray-300' : 'bg-amber-600'
                            }`}>
                              <span className="text-xl font-bold text-white">{item.rank}</span>
                            </div>
                            <div>
                              <p className="font-medium">{isRTL ? item.name : item.name_en}</p>
                              <p className="text-2xl font-bold text-brand-turquoise">{item.score}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo">
                    {isRTL ? 'تقرير الحضور حسب الفصل' : 'Attendance Report by Class'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceData.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">{isRTL ? 'لا توجد بيانات حضور متاحة' : 'No attendance data available'}</p>
                      <p className="text-sm text-muted-foreground/70 mt-2">
                        {isRTL ? 'سيتم عرض البيانات عند تسجيل الحضور' : 'Data will appear when attendance is recorded'}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isRTL ? 'الفصل' : 'Class'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'حاضر' : 'Present'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'غائب' : 'Absent'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'متأخر' : 'Late'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'النسبة' : 'Rate'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {isRTL ? row.class : row.class_en}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-100 text-green-700">{row.present}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-red-100 text-red-700">{row.absent}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-yellow-100 text-yellow-700">{row.late}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Progress value={row.rate} className="w-20 h-2" />
                                <span className={`font-medium ${row.rate >= 90 ? 'text-green-600' : row.rate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {row.rate}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Grades Tab */}
            <TabsContent value="grades" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo">
                    {isRTL ? 'تقرير الدرجات حسب المادة' : 'Grades Report by Subject'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gradeData.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">{isRTL ? 'لا توجد بيانات درجات متاحة' : 'No grade data available'}</p>
                      <p className="text-sm text-muted-foreground/70 mt-2">
                        {isRTL ? 'سيتم عرض البيانات عند تسجيل الدرجات' : 'Data will appear when grades are recorded'}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isRTL ? 'المادة' : 'Subject'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'المتوسط' : 'Average'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'الأعلى' : 'Highest'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'الأدنى' : 'Lowest'}</TableHead>
                          <TableHead className="text-center">{isRTL ? 'نسبة النجاح' : 'Pass Rate'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradeData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {isRTL ? row.subject : row.subject_en}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-bold ${row.avg >= 80 ? 'text-green-600' : row.avg >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {row.avg}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-green-600 font-medium">{row.highest}</TableCell>
                            <TableCell className="text-center text-red-600 font-medium">{row.lowest}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Progress value={row.pass_rate} className="w-20 h-2" />
                                <span className="font-medium">{row.pass_rate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-6">
              {behaviorData.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد بيانات سلوك متاحة' : 'No behavior data available'}</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    {isRTL ? 'سيتم عرض البيانات عند تسجيل ملاحظات السلوك' : 'Data will appear when behavior notes are recorded'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {behaviorData.map((item, index) => (
                      <Card key={index} className="card-nassaq">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? item.type_ar : item.type}
                              </p>
                              <p className="text-3xl font-bold mt-1">{item.count}</p>
                              <div className={`flex items-center gap-1 mt-2 text-sm ${
                                item.change > 0 
                                  ? item.type === 'negative' || item.type === 'warning' ? 'text-red-600' : 'text-green-600'
                                  : item.type === 'negative' || item.type === 'warning' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.change > 0 ? (
                                  <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4" />
                                )}
                                <span>{Math.abs(item.change)}%</span>
                              </div>
                            </div>
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                              item.type === 'positive' ? 'bg-green-500' :
                              item.type === 'negative' ? 'bg-red-500' :
                              item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>
                              {item.type === 'positive' && <CheckCircle className="h-7 w-7 text-white" />}
                              {item.type === 'negative' && <XCircle className="h-7 w-7 text-white" />}
                              {item.type === 'warning' && <AlertTriangle className="h-7 w-7 text-white" />}
                              {item.type === 'recognition' && <Award className="h-7 w-7 text-white" />}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo">
                    {isRTL ? 'ملاحظات السلوك الأخيرة' : 'Recent Behavior Notes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا توجد ملاحظات سلوك مسجلة' : 'No behavior notes recorded'}
                    </p>
                  </div>
                </CardContent>
              </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};

export default SchoolReportsPage;
