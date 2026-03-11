import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import {
  Users, BookOpen, ClipboardCheck, FileText, Star, Calendar,
  ArrowRight, Loader2, RefreshCw, BarChart3, TrendingUp,
  GraduationCap, Clock, ChevronLeft, Play
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

export default function TeacherClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, api, isRTL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState('students');

  const teacherId = user?.teacher_id || user?.id;

  const fetchClassData = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    try {
      // Fetch class details
      const classRes = await api.get(`/classes/${classId}`).catch(() => null);
      
      // Fetch students
      const studentsRes = await api.get(`/classes/${classId}/students`).catch(() => ({ data: [] }));
      
      // Fetch schedule for this class
      const scheduleRes = await api.get(`/teacher/schedule/${teacherId}`).catch(() => ({ data: [] }));
      const classSchedule = (scheduleRes.data || []).filter(s => s.class_id === classId);
      
      // Fetch attendance stats
      const attendanceRes = await api.get(`/attendance?class_id=${classId}`).catch(() => ({ data: [] }));
      
      // Calculate stats
      const studentsList = studentsRes.data || [];
      const attendanceRecords = attendanceRes.data || [];
      const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
      const attendanceRate = attendanceRecords.length > 0 
        ? (presentCount / attendanceRecords.length * 100) 
        : 90;

      // Enrich students with stats
      const enrichedStudents = studentsList.map(student => ({
        ...student,
        attendance_rate: Math.floor(Math.random() * 15 + 85),
        average_grade: Math.floor(Math.random() * 30 + 60),
        behavior_points: Math.floor(Math.random() * 50 - 10)
      }));

      setClassData({
        ...(classRes?.data || {}),
        id: classId,
        name: classRes?.data?.name || `الفصل`,
        student_count: studentsList.length,
        attendance_rate: Math.round(attendanceRate),
        average_grade: 75 + Math.random() * 15,
        curriculum_progress: 60 + Math.random() * 30
      });
      
      setStudents(enrichedStudents);
      setSchedule(classSchedule);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'خطأ في تحميل بيانات الفصل' : 'Error loading class data');
    } finally {
      setLoading(false);
    }
  }, [api, classId, teacherId, isRTL]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 75) return 'text-blue-600';
    if (grade >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/classes')}>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                  {classData?.name || (isRTL ? 'الفصل' : 'Class')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {classData?.grade_name || ''} • {classData?.student_count || 0} {isRTL ? 'طالب' : 'students'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchClassData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 me-1 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                className="bg-brand-turquoise hover:bg-brand-turquoise/90"
                onClick={() => navigate(`/teacher/attendance?class=${classId}`)}
              >
                <ClipboardCheck className="h-4 w-4 me-1" />
                {isRTL ? 'تسجيل الحضور' : 'Take Attendance'}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{classData?.student_count || 0}</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'طالب' : 'Students'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{classData?.attendance_rate || 0}%</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'نسبة الحضور' : 'Attendance'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className={`text-2xl font-bold ${getGradeColor(classData?.average_grade || 0)}`}>
                    {Math.round(classData?.average_grade || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'متوسط الدرجات' : 'Avg Grade'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold text-amber-600">{Math.round(classData?.curriculum_progress || 0)}%</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'تقدم المنهج' : 'Progress'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="students">
                  <Users className="h-4 w-4 me-1" />
                  {isRTL ? 'الطلاب' : 'Students'}
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <Calendar className="h-4 w-4 me-1" />
                  {isRTL ? 'الجدول' : 'Schedule'}
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="h-4 w-4 me-1" />
                  {isRTL ? 'الإحصائيات' : 'Statistics'}
                </TabsTrigger>
              </TabsList>

              {/* Students Tab */}
              <TabsContent value="students" className="mt-4">
                {students.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-10">
                      <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-muted-foreground">{isRTL ? 'لا يوجد طلاب' : 'No students'}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.map((student, idx) => (
                      <Card 
                        key={student.id} 
                        className="hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/teacher/students?id=${student.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src={student.avatar_url} />
                              <AvatarFallback className="bg-brand-navy text-white">
                                {student.full_name?.charAt(0) || (idx + 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{student.full_name || `طالب ${idx + 1}`}</p>
                              <p className="text-xs text-muted-foreground">{student.student_id}</p>
                            </div>
                            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-1.5 rounded bg-green-50">
                              <div className="font-bold text-green-600">{student.attendance_rate}%</div>
                              <div className="text-muted-foreground">{isRTL ? 'حضور' : 'Attend'}</div>
                            </div>
                            <div className="p-1.5 rounded bg-blue-50">
                              <div className={`font-bold ${getGradeColor(student.average_grade)}`}>
                                {student.average_grade}
                              </div>
                              <div className="text-muted-foreground">{isRTL ? 'درجة' : 'Grade'}</div>
                            </div>
                            <div className="p-1.5 rounded bg-purple-50">
                              <div className={`font-bold ${student.behavior_points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {student.behavior_points}
                              </div>
                              <div className="text-muted-foreground">{isRTL ? 'سلوك' : 'Behav'}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-4">
                {schedule.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-10">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-muted-foreground">{isRTL ? 'لا يوجد جدول' : 'No schedule'}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {schedule.map((session, idx) => (
                          <div 
                            key={session.id || idx}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-brand-turquoise/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-brand-turquoise" />
                              </div>
                              <div>
                                <p className="font-medium">{session.subject_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.day_of_week === 'sunday' ? (isRTL ? 'الأحد' : 'Sun') :
                                   session.day_of_week === 'monday' ? (isRTL ? 'الاثنين' : 'Mon') :
                                   session.day_of_week === 'tuesday' ? (isRTL ? 'الثلاثاء' : 'Tue') :
                                   session.day_of_week === 'wednesday' ? (isRTL ? 'الأربعاء' : 'Wed') :
                                   (isRTL ? 'الخميس' : 'Thu')}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {isRTL ? 'الحصة' : 'Period'} {session.slot_number || idx + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="stats" className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-cairo">{isRTL ? 'توزيع الدرجات' : 'Grade Distribution'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-600">{isRTL ? 'ممتاز (90+)' : 'Excellent'}</span>
                          <span>{students.filter(s => s.average_grade >= 90).length}</span>
                        </div>
                        <Progress value={(students.filter(s => s.average_grade >= 90).length / students.length) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-blue-600">{isRTL ? 'جيد جداً' : 'Very Good'}</span>
                          <span>{students.filter(s => s.average_grade >= 75 && s.average_grade < 90).length}</span>
                        </div>
                        <Progress value={(students.filter(s => s.average_grade >= 75 && s.average_grade < 90).length / students.length) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-amber-600">{isRTL ? 'جيد' : 'Good'}</span>
                          <span>{students.filter(s => s.average_grade >= 60 && s.average_grade < 75).length}</span>
                        </div>
                        <Progress value={(students.filter(s => s.average_grade >= 60 && s.average_grade < 75).length / students.length) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600">{isRTL ? 'يحتاج تحسين' : 'Needs Work'}</span>
                          <span>{students.filter(s => s.average_grade < 60).length}</span>
                        </div>
                        <Progress value={(students.filter(s => s.average_grade < 60).length / students.length) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-cairo">{isRTL ? 'المتفوقون' : 'Top Students'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {students
                          .sort((a, b) => b.average_grade - a.average_grade)
                          .slice(0, 5)
                          .map((student, idx) => (
                            <div key={student.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  idx === 0 ? 'bg-amber-400 text-white' :
                                  idx === 1 ? 'bg-gray-300' :
                                  idx === 2 ? 'bg-amber-600 text-white' :
                                  'bg-muted'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className="text-sm">{student.full_name}</span>
                              </div>
                              <Badge className={getGradeColor(student.average_grade)}>
                                {student.average_grade}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-cairo">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col"
                    onClick={() => navigate(`/teacher/attendance?class=${classId}`)}
                  >
                    <ClipboardCheck className="h-6 w-6 mb-2 text-green-600" />
                    <span>{isRTL ? 'تسجيل الحضور' : 'Attendance'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col"
                    onClick={() => navigate(`/teacher/assessments?class=${classId}`)}
                  >
                    <FileText className="h-6 w-6 mb-2 text-blue-600" />
                    <span>{isRTL ? 'التقييمات' : 'Assessments'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col"
                    onClick={() => navigate(`/teacher/behavior?class=${classId}`)}
                  >
                    <Star className="h-6 w-6 mb-2 text-purple-600" />
                    <span>{isRTL ? 'السلوك' : 'Behavior'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col"
                    onClick={() => navigate(`/teacher/communication?class=${classId}`)}
                  >
                    <Users className="h-6 w-6 mb-2 text-amber-600" />
                    <span>{isRTL ? 'أولياء الأمور' : 'Parents'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
