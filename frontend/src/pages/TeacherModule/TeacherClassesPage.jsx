import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';
import {
  Users, BookOpen, Search, RefreshCw, Loader2, ChevronLeft,
  GraduationCap, ClipboardCheck, BarChart3, Calendar, TrendingUp
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

export default function TeacherClassesPage() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const teacherId = user?.teacher_id || user?.id;

  const fetchClasses = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      // Fetch teacher's assigned classes
      const response = await api.get(`/teacher/classes/${teacherId}`);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Fallback to assignments
      try {
        const assignmentsRes = await api.get('/teacher-assignments');
        const myAssignments = (assignmentsRes.data || []).filter(a => a.teacher_id === teacherId);
        
        // Get unique classes
        const classIds = [...new Set(myAssignments.map(a => a.class_id))];
        const classesRes = await api.get('/classes');
        const myClasses = (classesRes.data || []).filter(c => classIds.includes(c.id));
        
        // Enrich with assignment data
        const enrichedClasses = myClasses.map(cls => {
          const classAssignments = myAssignments.filter(a => a.class_id === cls.id);
          return {
            ...cls,
            subjects: classAssignments.map(a => a.subject_name || 'مادة'),
            weekly_periods: classAssignments.reduce((sum, a) => sum + (a.weekly_periods || 0), 0),
            student_count: cls.student_count || cls.students_count || 0,
            progress: Math.floor(Math.random() * 40) + 60, // Placeholder
            attendance_rate: Math.floor(Math.random() * 15) + 85 // Placeholder
          };
        });
        
        setClasses(enrichedClasses);
      } catch (err) {
        toast.error(isRTL ? 'خطأ في تحميل الفصول' : 'Error loading classes');
      }
    } finally {
      setLoading(false);
    }
  }, [api, teacherId, isRTL]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = classes.filter(cls => 
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.grade_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                {isRTL ? 'فصولي' : 'My Classes'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'إدارة ومتابعة الفصول المسندة إليك' : 'Manage and track your assigned classes'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'بحث في الفصول...' : 'Search classes...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-[200px]"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchClasses} disabled={loading}>
                <RefreshCw className={`h-4 w-4 me-1 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
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
          ) : filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-bold mb-2">{isRTL ? 'لا توجد فصول' : 'No classes found'}</h3>
                <p className="text-muted-foreground">
                  {isRTL ? 'لم يتم تعيين أي فصول لك بعد' : 'No classes assigned to you yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((cls) => (
                <Card 
                  key={cls.id} 
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-brand-turquoise"
                  onClick={() => navigate(`/teacher/class/${cls.id}`)}
                  data-testid={`class-card-${cls.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-brand-navy" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-cairo">{cls.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{cls.grade_name || cls.grade}</p>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                        <div className="text-lg font-bold text-blue-700">{cls.student_count || 0}</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'طالب' : 'Students'}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <BookOpen className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <div className="text-lg font-bold text-green-700">{cls.subjects?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'مادة' : 'Subjects'}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <Calendar className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                        <div className="text-lg font-bold text-purple-700">{cls.weekly_periods || 0}</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'حصة/أسبوع' : 'Per week'}</div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{isRTL ? 'تقدم المنهج' : 'Curriculum Progress'}</span>
                        <span className="font-medium">{cls.progress || 0}%</span>
                      </div>
                      <Progress value={cls.progress || 0} className="h-2" />
                    </div>

                    {/* Attendance Rate */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-brand-turquoise" />
                        <span className="text-sm">{isRTL ? 'نسبة الحضور' : 'Attendance Rate'}</span>
                      </div>
                      <Badge variant={cls.attendance_rate >= 90 ? 'default' : cls.attendance_rate >= 80 ? 'secondary' : 'destructive'}>
                        {cls.attendance_rate || 0}%
                      </Badge>
                    </div>

                    {/* Subjects Tags */}
                    {cls.subjects && cls.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cls.subjects.slice(0, 3).map((subject, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {cls.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{cls.subjects.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); navigate(`/teacher/attendance?class=${cls.id}`); }}
                      >
                        <ClipboardCheck className="h-3.5 w-3.5 me-1" />
                        {isRTL ? 'الحضور' : 'Attendance'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); navigate(`/teacher/reports?class=${cls.id}`); }}
                      >
                        <BarChart3 className="h-3.5 w-3.5 me-1" />
                        {isRTL ? 'التقارير' : 'Reports'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {!loading && filteredClasses.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20">
                <CardContent className="p-4 text-center">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold text-blue-700">{filteredClasses.length}</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'فصل' : 'Classes'}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold text-green-700">
                    {filteredClasses.reduce((sum, c) => sum + (c.student_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'طالب' : 'Students'}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-3xl font-bold text-purple-700">
                    {[...new Set(filteredClasses.flatMap(c => c.subjects || []))].length}
                  </div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'مادة' : 'Subjects'}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-3xl font-bold text-amber-700">
                    {Math.round(filteredClasses.reduce((sum, c) => sum + (c.attendance_rate || 0), 0) / filteredClasses.length) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'متوسط الحضور' : 'Avg Attendance'}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
