import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import {
  Users, Search, Loader2, RefreshCw, Eye, GraduationCap,
  Phone, Mail, ClipboardCheck, FileText, TrendingUp, Star,
  BookOpen, Calendar, ChevronLeft, BarChart3
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

export default function TeacherStudentsPage() {
  const { user, api, isRTL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const studentsRes = await api.get(`/classes/${selectedClass}/students`);
      
      // Enrich students with attendance and grade data
      const enrichedStudents = await Promise.all(
        (studentsRes.data || []).map(async (student) => {
          try {
            // Get attendance stats
            const attendanceRes = await api.get(`/students/${student.id}/attendance-stats`).catch(() => ({ data: {} }));
            // Get grades
            const gradesRes = await api.get(`/students/${student.id}/grades`).catch(() => ({ data: [] }));
            
            const grades = gradesRes.data || [];
            const avgGrade = grades.length > 0 
              ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length 
              : 0;

            return {
              ...student,
              attendance_rate: attendanceRes.data?.rate || 0,
              average_grade: avgGrade || 0,
              behavior_points: 0
            };
          } catch {
            return {
              ...student,
              attendance_rate: 0,
              average_grade: 0,
              behavior_points: 0
            };
          }
        })
      );
      
      setStudents(enrichedStudents);
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'خطأ في تحميل الطلاب' : 'Error loading students');
    } finally {
      setLoading(false);
    }
  }, [api, selectedClass, isRTL]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, fetchStudents]);

  const viewStudentDetails = async (student) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
    setLoadingDetails(true);
    
    try {
      // Fetch detailed student information
      const [attendanceRes, gradesRes, behaviorRes] = await Promise.all([
        api.get(`/attendance?student_id=${student.id}`).catch(() => ({ data: [] })),
        api.get(`/students/${student.id}/grades`).catch(() => ({ data: [] })),
        api.get(`/behavior?student_id=${student.id}`).catch(() => ({ data: [] }))
      ]);
      
      setStudentDetails({
        attendance: attendanceRes.data || [],
        grades: gradesRes.data || [],
        behavior: behaviorRes.data || []
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 75) return 'text-blue-600';
    if (grade >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                {isRTL ? 'طلابي' : 'My Students'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'عرض ومتابعة بيانات الطلاب' : 'View and track student data'}
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
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-[180px]"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchStudents} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-4 border-b bg-muted/30">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl font-bold text-brand-navy">{filteredStudents.length}</div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'طالب' : 'Students'}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(filteredStudents.reduce((s, st) => s + (st.attendance_rate || 0), 0) / filteredStudents.length) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'متوسط الحضور' : 'Avg Attendance'}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(filteredStudents.reduce((s, st) => s + (st.average_grade || 0), 0) / filteredStudents.length) || 0}
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'متوسط الدرجات' : 'Avg Grade'}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl font-bold text-purple-600">
                {filteredStudents.filter(s => (s.average_grade || 0) >= 90).length}
              </div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'متفوقين' : 'Top Students'}</div>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-bold mb-2">{isRTL ? 'لا يوجد طلاب' : 'No students'}</h3>
                <p className="text-muted-foreground">
                  {isRTL ? 'اختر فصلاً لعرض الطلاب' : 'Select a class to view students'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map((student, idx) => (
                <Card 
                  key={student.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-brand-turquoise"
                  onClick={() => viewStudentDetails(student)}
                  data-testid={`student-card-${student.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-brand-navy to-brand-turquoise text-white text-lg">
                          {student.full_name?.charAt(0) || (idx + 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{student.full_name || `طالب ${idx + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{student.student_id || `#${idx + 1}`}</p>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
                        <ClipboardCheck className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <div className="text-sm font-bold text-green-700">{student.attendance_rate || 0}%</div>
                        <div className="text-[10px] text-muted-foreground">{isRTL ? 'حضور' : 'Attend'}</div>
                      </div>
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                        <FileText className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                        <div className={`text-sm font-bold ${getGradeColor(student.average_grade || 0)}`}>
                          {student.average_grade || 0}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{isRTL ? 'درجة' : 'Grade'}</div>
                      </div>
                      <div className="p-2 rounded bg-purple-50 dark:bg-purple-900/20">
                        <Star className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                        <div className="text-sm font-bold text-purple-700">{student.behavior_points || 0}</div>
                        <div className="text-[10px] text-muted-foreground">{isRTL ? 'سلوك' : 'Behav'}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{isRTL ? 'الأداء العام' : 'Overall'}</span>
                        <span className={`font-medium ${getGradeColor(student.average_grade || 0)}`}>
                          {student.average_grade >= 90 ? (isRTL ? 'ممتاز' : 'Excellent') :
                           student.average_grade >= 75 ? (isRTL ? 'جيد جداً' : 'Very Good') :
                           student.average_grade >= 60 ? (isRTL ? 'جيد' : 'Good') : (isRTL ? 'يحتاج تحسين' : 'Needs Improvement')}
                        </span>
                      </div>
                      <Progress value={student.average_grade || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Student Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-3">
                {selectedStudent && (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-brand-navy text-white">
                        {selectedStudent.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{selectedStudent.full_name}</p>
                      <p className="text-sm text-muted-foreground font-normal">
                        {selectedStudent.student_id}
                      </p>
                    </div>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {loadingDetails ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
              </div>
            ) : studentDetails && (
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
                  <TabsTrigger value="attendance">{isRTL ? 'الحضور' : 'Attendance'}</TabsTrigger>
                  <TabsTrigger value="grades">{isRTL ? 'الدرجات' : 'Grades'}</TabsTrigger>
                  <TabsTrigger value="behavior">{isRTL ? 'السلوك' : 'Behavior'}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{selectedStudent?.attendance_rate || 0}%</div>
                        <div className="text-sm text-muted-foreground">{isRTL ? 'نسبة الحضور' : 'Attendance Rate'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{selectedStudent?.average_grade || 0}</div>
                        <div className="text-sm text-muted-foreground">{isRTL ? 'متوسط الدرجات' : 'Average Grade'}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedStudent?.parent_phone && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{isRTL ? 'بيانات التواصل' : 'Contact Info'}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedStudent.parent_phone}</span>
                        </div>
                        {selectedStudent.parent_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedStudent.parent_email}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="attendance" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {studentDetails.attendance.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          {isRTL ? 'لا توجد سجلات حضور' : 'No attendance records'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {studentDetails.attendance.slice(0, 10).map((record, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                              <span>{new Date(record.date).toLocaleDateString('ar-SA')}</span>
                              <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                                {record.status === 'present' ? (isRTL ? 'حاضر' : 'Present') :
                                 record.status === 'absent' ? (isRTL ? 'غائب' : 'Absent') :
                                 (isRTL ? 'متأخر' : 'Late')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="grades" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {studentDetails.grades.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          {isRTL ? 'لا توجد درجات' : 'No grades'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {studentDetails.grades.map((grade, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                              <div>
                                <p className="font-medium">{grade.assessment_name || grade.subject_name}</p>
                                <p className="text-xs text-muted-foreground">{grade.type || 'تقييم'}</p>
                              </div>
                              <Badge className={getGradeColor(grade.score || 0)}>
                                {grade.score || 0} / {grade.max_score || 100}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="behavior" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {studentDetails.behavior.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          {isRTL ? 'لا توجد سجلات سلوكية' : 'No behavior records'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {studentDetails.behavior.slice(0, 10).map((record, idx) => (
                            <div 
                              key={idx} 
                              className={`p-2 rounded ${
                                record.points > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              } border`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{record.note}</span>
                                <Badge variant={record.points > 0 ? 'default' : 'destructive'}>
                                  {record.points > 0 ? '+' : ''}{record.points}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(record.date).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <HakimAssistant />
    </TeacherLayout>
  );
}
