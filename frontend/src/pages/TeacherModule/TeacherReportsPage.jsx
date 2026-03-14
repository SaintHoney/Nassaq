import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import {
  BarChart3, TrendingUp, TrendingDown, Users, ClipboardCheck,
  FileText, Loader2, RefreshCw, Download, Calendar, Star,
  Award, AlertTriangle, BookOpen, GraduationCap
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

export default function TeacherReportsPage() {
  const { user, api, isRTL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const teacherId = user?.teacher_id || user?.id;

  const fetchClasses = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      const classesRes = await api.get(`/teacher/classes/${teacherId}`).catch(() => ({ data: [] }));
      setClasses(classesRes.data || []);
      
      if (classesRes.data?.length > 0 && !selectedClass) {
        setSelectedClass(classesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [api, teacherId, selectedClass]);

  const fetchReportData = useCallback(async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      // Fetch various data for reports
      const [studentsRes, attendanceRes, gradesRes, behaviorRes] = await Promise.all([
        api.get(`/classes/${selectedClass}/students`).catch(() => ({ data: [] })),
        api.get(`/attendance?class_id=${selectedClass}`).catch(() => ({ data: [] })),
        api.get(`/grades?class_id=${selectedClass}`).catch(() => ({ data: [] })),
        api.get(`/behavior?class_id=${selectedClass}`).catch(() => ({ data: [] }))
      ]);

      const students = studentsRes.data || [];
      const attendance = attendanceRes.data || [];
      const grades = gradesRes.data || [];
      const behavior = behaviorRes.data || [];

      // Calculate statistics
      const totalStudents = students.length;
      const presentCount = attendance.filter(a => a.status === 'present').length;
      const absentCount = attendance.filter(a => a.status === 'absent').length;
      const attendanceRate = attendance.length > 0 
        ? (presentCount / attendance.length * 100) 
        : 0;

      const avgGrade = grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length
        : 0;

      const positiveBehavior = behavior.filter(b => (b.points || 0) > 0).length;
      const negativeBehavior = behavior.filter(b => (b.points || 0) < 0).length;

      // Grade distribution
      const gradeDistribution = {
        excellent: students.filter(s => (s.average_grade || 0) >= 90).length,
        veryGood: students.filter(s => {
          const g = s.average_grade || 0;
          return g >= 75 && g < 90;
        }).length,
        good: students.filter(s => {
          const g = s.average_grade || 0;
          return g >= 60 && g < 75;
        }).length,
        needsWork: students.filter(s => (s.average_grade || 0) < 60).length
      };

      const topPerformers = students
        .map(s => ({ ...s, avg: s.average_grade || 0 }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5);

      const needsAttention = students
        .map(s => ({
          ...s,
          issues: [
            (s.attendance_rate || 0) < 80 ? 'attendance' : null,
            (s.average_grade || 0) < 60 ? 'grades' : null,
            (s.behavior_points || 0) < 0 ? 'behavior' : null
          ].filter(Boolean)
        }))
        .filter(s => s.issues.length > 0)
        .slice(0, 5);

      setReportData({
        summary: {
          totalStudents,
          attendanceRate: Math.round(attendanceRate),
          avgGrade: Math.round(avgGrade),
          positiveBehavior,
          negativeBehavior,
          assessmentsCount: grades.length,
          behaviorRecords: behavior.length
        },
        gradeDistribution,
        topPerformers,
        needsAttention,
        weeklyTrend: [
          { week: isRTL ? 'الأسبوع 1' : 'Week 1', attendance: 92, grades: 75 },
          { week: isRTL ? 'الأسبوع 2' : 'Week 2', attendance: 88, grades: 78 },
          { week: isRTL ? 'الأسبوع 3' : 'Week 3', attendance: 95, grades: 72 },
          { week: isRTL ? 'الأسبوع 4' : 'Week 4', attendance: 90, grades: 80 },
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'خطأ في تحميل التقارير' : 'Error loading reports');
    } finally {
      setLoading(false);
    }
  }, [api, selectedClass, isRTL]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchReportData();
    }
  }, [selectedClass, fetchReportData]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600 bg-green-100';
    if (grade >= 75) return 'text-blue-600 bg-blue-100';
    if (grade >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                {isRTL ? 'التقارير والإحصائيات' : 'Reports & Statistics'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'تقارير الأداء والإحصائيات' : 'Performance reports and statistics'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]" data-testid="class-select">
                  <SelectValue placeholder={isRTL ? 'اختر الفصل' : 'Select class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchReportData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 me-1 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 me-1" />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          ) : !reportData ? (
            <Card>
              <CardContent className="text-center py-16">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">{isRTL ? 'اختر فصلاً لعرض التقارير' : 'Select a class to view reports'}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-brand-navy" />
                    <div className="text-2xl font-bold">{reportData.summary.totalStudents}</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'طالب' : 'Students'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <ClipboardCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{reportData.summary.attendanceRate}%</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'الحضور' : 'Attendance'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className={`text-2xl font-bold ${getGradeColor(reportData.summary.avgGrade).split(' ')[0]}`}>
                      {reportData.summary.avgGrade}
                    </div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'متوسط الدرجات' : 'Avg Grade'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{reportData.summary.positiveBehavior}</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'سلوك إيجابي' : 'Positive'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold text-red-600">{reportData.summary.negativeBehavior}</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'سلوك سلبي' : 'Negative'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">{reportData.summary.assessmentsCount}</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'تقييم' : 'Assessments'}</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
                  <TabsTrigger value="grades">{isRTL ? 'الدرجات' : 'Grades'}</TabsTrigger>
                  <TabsTrigger value="attention">{isRTL ? 'يحتاج متابعة' : 'Needs Attention'}</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Grade Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-cairo flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-brand-turquoise" />
                          {isRTL ? 'توزيع الدرجات' : 'Grade Distribution'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-600 font-medium">{isRTL ? 'ممتاز (90+)' : 'Excellent (90+)'}</span>
                            <span>{reportData.gradeDistribution.excellent} {isRTL ? 'طالب' : 'students'}</span>
                          </div>
                          <Progress value={(reportData.gradeDistribution.excellent / reportData.summary.totalStudents) * 100} className="h-3 bg-green-100" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-600 font-medium">{isRTL ? 'جيد جداً (75-89)' : 'Very Good (75-89)'}</span>
                            <span>{reportData.gradeDistribution.veryGood} {isRTL ? 'طالب' : 'students'}</span>
                          </div>
                          <Progress value={(reportData.gradeDistribution.veryGood / reportData.summary.totalStudents) * 100} className="h-3 bg-blue-100" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-amber-600 font-medium">{isRTL ? 'جيد (60-74)' : 'Good (60-74)'}</span>
                            <span>{reportData.gradeDistribution.good} {isRTL ? 'طالب' : 'students'}</span>
                          </div>
                          <Progress value={(reportData.gradeDistribution.good / reportData.summary.totalStudents) * 100} className="h-3 bg-amber-100" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-red-600 font-medium">{isRTL ? 'يحتاج تحسين (<60)' : 'Needs Work (<60)'}</span>
                            <span>{reportData.gradeDistribution.needsWork} {isRTL ? 'طالب' : 'students'}</span>
                          </div>
                          <Progress value={(reportData.gradeDistribution.needsWork / reportData.summary.totalStudents) * 100} className="h-3 bg-red-100" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-cairo flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-500" />
                          {isRTL ? 'المتفوقون' : 'Top Performers'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reportData.topPerformers.map((student, idx) => (
                            <div key={student.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  idx === 0 ? 'bg-amber-400 text-white' :
                                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                                  idx === 2 ? 'bg-amber-600 text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className="font-medium">{student.full_name || `طالب ${idx + 1}`}</span>
                              </div>
                              <Badge className={getGradeColor(student.avg)}>
                                {student.avg}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-cairo">
                        {isRTL ? 'تفاصيل الدرجات' : 'Grade Details'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-green-50">
                          <CardContent className="p-4 text-center">
                            <Star className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-3xl font-bold text-green-700">{reportData.gradeDistribution.excellent}</div>
                            <div className="text-sm text-green-600 font-medium">{isRTL ? 'ممتاز' : 'Excellent'}</div>
                            <div className="text-xs text-muted-foreground mt-1">90% {isRTL ? 'فما فوق' : 'and above'}</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-blue-50">
                          <CardContent className="p-4 text-center">
                            <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-3xl font-bold text-blue-700">{reportData.gradeDistribution.veryGood}</div>
                            <div className="text-sm text-blue-600 font-medium">{isRTL ? 'جيد جداً' : 'Very Good'}</div>
                            <div className="text-xs text-muted-foreground mt-1">75% - 89%</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-amber-50">
                          <CardContent className="p-4 text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                            <div className="text-3xl font-bold text-amber-700">{reportData.gradeDistribution.good}</div>
                            <div className="text-sm text-amber-600 font-medium">{isRTL ? 'جيد' : 'Good'}</div>
                            <div className="text-xs text-muted-foreground mt-1">60% - 74%</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-red-50">
                          <CardContent className="p-4 text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                            <div className="text-3xl font-bold text-red-700">{reportData.gradeDistribution.needsWork}</div>
                            <div className="text-sm text-red-600 font-medium">{isRTL ? 'يحتاج تحسين' : 'Needs Work'}</div>
                            <div className="text-xs text-muted-foreground mt-1">{isRTL ? 'أقل من' : 'Below'} 60%</div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Needs Attention Tab */}
                <TabsContent value="attention">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-cairo flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        {isRTL ? 'طلاب يحتاجون متابعة' : 'Students Needing Attention'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reportData.needsAttention.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          {isRTL ? 'لا يوجد طلاب يحتاجون متابعة خاصة' : 'No students need special attention'}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {reportData.needsAttention.map((student, idx) => (
                            <div key={student.id || idx} className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{student.full_name || `طالب ${idx + 1}`}</span>
                                <div className="flex gap-1">
                                  {student.issues.map(issue => (
                                    <Badge 
                                      key={issue} 
                                      variant="outline"
                                      className={
                                        issue === 'attendance' ? 'border-red-300 text-red-600' :
                                        issue === 'grades' ? 'border-amber-300 text-amber-600' :
                                        'border-purple-300 text-purple-600'
                                      }
                                    >
                                      {issue === 'attendance' ? (isRTL ? 'حضور' : 'Attendance') :
                                       issue === 'grades' ? (isRTL ? 'درجات' : 'Grades') :
                                       (isRTL ? 'سلوك' : 'Behavior')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isRTL 
                                  ? `هذا الطالب يحتاج متابعة في: ${student.issues.map(i => 
                                      i === 'attendance' ? 'الحضور' : i === 'grades' ? 'الدرجات' : 'السلوك'
                                    ).join('، ')}`
                                  : `This student needs attention in: ${student.issues.join(', ')}`
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
      <HakimAssistant />
    </TeacherLayout>
  );
}
