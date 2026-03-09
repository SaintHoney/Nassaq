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
  ClipboardList,
  Users,
  FileText,
  Sun,
  Moon,
  Globe,
  RefreshCw,
  Save,
  Plus,
  Calendar,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const assessmentTypeConfig = {
  quiz: { label: { ar: 'اختبار قصير', en: 'Quiz' }, color: 'bg-blue-500' },
  assignment: { label: { ar: 'واجب', en: 'Assignment' }, color: 'bg-green-500' },
  exam: { label: { ar: 'اختبار', en: 'Exam' }, color: 'bg-red-500' },
  participation: { label: { ar: 'مشاركة', en: 'Participation' }, color: 'bg-yellow-500' },
  project: { label: { ar: 'مشروع', en: 'Project' }, color: 'bg-purple-500' },
  midterm: { label: { ar: 'اختبار منتصف الفصل', en: 'Midterm' }, color: 'bg-orange-500' },
  final: { label: { ar: 'اختبار نهائي', en: 'Final' }, color: 'bg-red-700' },
  oral: { label: { ar: 'اختبار شفهي', en: 'Oral' }, color: 'bg-teal-500' },
  practical: { label: { ar: 'اختبار عملي', en: 'Practical' }, color: 'bg-indigo-500' },
};

const gradeColors = {
  excellent: 'bg-green-500',
  very_good: 'bg-blue-500',
  good: 'bg-yellow-500',
  pass: 'bg-orange-500',
  fail: 'bg-red-500',
};

export const AssessmentPage = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // State
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('');
  
  // Current assessment for grading
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [studentsForGrading, setStudentsForGrading] = useState([]);
  const [grades, setGrades] = useState({});
  
  // Dialogs
  const [createDialog, setCreateDialog] = useState(false);
  const [gradeDialog, setGradeDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  
  // New assessment form
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    title_en: '',
    assessment_type: 'quiz',
    max_score: 100,
    weight: 0.1,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  
  // Reports
  const [activeTab, setActiveTab] = useState('assessments');
  const [classOverview, setClassOverview] = useState(null);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  // Fetch assessments when filters change
  useEffect(() => {
    if (selectedClass) {
      fetchAssessments();
    }
  }, [selectedClass, selectedSubject, selectedAssessmentType]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      let url = '/assessments?';
      if (selectedClass && selectedClass !== 'none') url += `class_id=${selectedClass}&`;
      if (selectedSubject && selectedSubject !== 'none') url += `subject_id=${selectedSubject}&`;
      if (selectedAssessmentType && selectedAssessmentType !== 'none') url += `assessment_type=${selectedAssessmentType}&`;
      
      const response = await api.get(url);
      setAssessments(response.data);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      toast.error(isRTL ? 'فشل تحميل التقييمات' : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    if (!selectedClass || !selectedSubject || selectedSubject === 'none') {
      toast.error(isRTL ? 'يرجى اختيار الفصل والمادة' : 'Please select class and subject');
      return;
    }
    
    if (!newAssessment.title) {
      toast.error(isRTL ? 'يرجى إدخال عنوان التقييم' : 'Please enter assessment title');
      return;
    }
    
    try {
      setSaving(true);
      await api.post('/assessments', {
        ...newAssessment,
        class_id: selectedClass,
        subject_id: selectedSubject,
      });
      
      toast.success(isRTL ? 'تم إنشاء التقييم بنجاح' : 'Assessment created successfully');
      setCreateDialog(false);
      setNewAssessment({
        title: '',
        title_en: '',
        assessment_type: 'quiz',
        max_score: 100,
        weight: 0.1,
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      fetchAssessments();
    } catch (error) {
      console.error('Failed to create assessment:', error);
      toast.error(isRTL ? 'فشل إنشاء التقييم' : 'Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenGrading = async (assessment) => {
    setCurrentAssessment(assessment);
    try {
      const response = await api.get(`/assessments/students-for-grading/${assessment.id}`);
      setStudentsForGrading(response.data.students || []);
      
      // Initialize grades from existing data
      const existingGrades = {};
      response.data.students?.forEach(student => {
        if (student.score !== null) {
          existingGrades[student.id] = {
            score: student.score,
            notes: student.notes || ''
          };
        }
      });
      setGrades(existingGrades);
      setGradeDialog(true);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error(isRTL ? 'فشل تحميل الطلاب' : 'Failed to load students');
    }
  };

  const handleGradeChange = (studentId, score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > currentAssessment.max_score) return;
    
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], score: numScore }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const handleSaveGrades = async () => {
    if (!currentAssessment) return;
    
    const gradesToSave = Object.entries(grades)
      .filter(([_, data]) => data.score !== undefined && data.score !== null)
      .map(([studentId, data]) => ({
        student_id: studentId,
        score: data.score,
        notes: data.notes || null
      }));
    
    if (gradesToSave.length === 0) {
      toast.error(isRTL ? 'لا يوجد درجات للحفظ' : 'No grades to save');
      return;
    }
    
    try {
      setSaving(true);
      await api.post('/grades/bulk', {
        assessment_id: currentAssessment.id,
        grades: gradesToSave
      });
      
      toast.success(isRTL ? 'تم حفظ الدرجات بنجاح' : 'Grades saved successfully');
      setGradeDialog(false);
      fetchAssessments();
    } catch (error) {
      console.error('Failed to save grades:', error);
      toast.error(isRTL ? 'فشل حفظ الدرجات' : 'Failed to save grades');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this assessment?')) {
      return;
    }
    
    try {
      await api.delete(`/assessments/${assessmentId}`);
      toast.success(isRTL ? 'تم حذف التقييم' : 'Assessment deleted');
      fetchAssessments();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      toast.error(isRTL ? 'فشل حذف التقييم' : 'Failed to delete assessment');
    }
  };

  const fetchClassOverview = async () => {
    if (!selectedClass) return;
    
    try {
      let url = `/grades/class/${selectedClass}/overview`;
      if (selectedSubject && selectedSubject !== 'none') {
        url += `?subject_id=${selectedSubject}`;
      }
      const response = await api.get(url);
      setClassOverview(response.data);
    } catch (error) {
      console.error('Failed to fetch class overview:', error);
    }
  };

  const fetchStudentHistory = async (studentId) => {
    try {
      const response = await api.get(`/grades/student/${studentId}`);
      setSelectedStudentHistory(response.data);
      setViewDialog(true);
    } catch (error) {
      console.error('Failed to fetch student history:', error);
      toast.error(isRTL ? 'فشل تحميل سجل الطالب' : 'Failed to load student history');
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' && selectedClass) {
      fetchClassOverview();
    }
  }, [activeTab, selectedClass, selectedSubject]);

  // Calculate stats
  const totalAssessments = assessments.length;
  const gradedAssessments = assessments.filter(a => a.grades_count > 0).length;

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="assessment-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="h-7 w-7 text-brand-turquoise" />
                {isRTL ? 'التقييمات والدرجات' : 'Assessments & Grades'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة التقييمات وإدخال الدرجات' : 'Manage assessments and enter grades'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                onClick={() => setCreateDialog(true)}
                className="bg-brand-turquoise hover:bg-brand-turquoise-light rounded-xl"
                data-testid="create-assessment-btn"
              >
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'تقييم جديد' : 'New Assessment'}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="assessments" className="rounded-xl">
                <ClipboardList className="h-4 w-4 me-2" />
                {isRTL ? 'التقييمات' : 'Assessments'}
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-xl">
                <BarChart3 className="h-4 w-4 me-2" />
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl">
                <TrendingUp className="h-4 w-4 me-2" />
                {isRTL ? 'السجلات' : 'History'}
              </TabsTrigger>
            </TabsList>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-6">
              {/* Filters */}
              <Card className="card-nassaq">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الفصل' : 'Class'}</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="rounded-xl" data-testid="select-class">
                          <SelectValue placeholder={isRTL ? 'اختر الفصل' : 'Select class'} />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'المادة' : 'Subject'}</Label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={isRTL ? 'اختر المادة' : 'Select subject'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{isRTL ? 'جميع المواد' : 'All Subjects'}</SelectItem>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'نوع التقييم' : 'Assessment Type'}</Label>
                      <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={isRTL ? 'جميع الأنواع' : 'All Types'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{isRTL ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                          {Object.entries(assessmentTypeConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {isRTL ? config.label.ar : config.label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="card-nassaq">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalAssessments}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي التقييمات' : 'Total Assessments'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-nassaq">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{gradedAssessments}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'تم تقييمها' : 'Graded'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-nassaq">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalAssessments - gradedAssessments}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'بانتظار التقييم' : 'Pending'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-nassaq">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{subjects.length}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'المواد' : 'Subjects'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assessments List */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo">{isRTL ? 'قائمة التقييمات' : 'Assessment List'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'اضغط على "إدخال الدرجات" لتسجيل درجات الطلاب' : 'Click "Enter Grades" to record student grades'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  ) : assessments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا يوجد تقييمات' : 'No assessments found'}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isRTL ? 'العنوان' : 'Title'}</TableHead>
                          <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                          <TableHead>{isRTL ? 'المادة' : 'Subject'}</TableHead>
                          <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                          <TableHead>{isRTL ? 'الدرجة' : 'Max Score'}</TableHead>
                          <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                          <TableHead>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessments.map((assessment) => {
                          const typeConfig = assessmentTypeConfig[assessment.assessment_type] || {};
                          return (
                            <TableRow key={assessment.id}>
                              <TableCell className="font-medium">{assessment.title}</TableCell>
                              <TableCell>
                                <Badge className={`${typeConfig.color} text-white`}>
                                  {isRTL ? typeConfig.label?.ar : typeConfig.label?.en}
                                </Badge>
                              </TableCell>
                              <TableCell>{assessment.subject_name}</TableCell>
                              <TableCell>{assessment.date}</TableCell>
                              <TableCell>{assessment.max_score}</TableCell>
                              <TableCell>
                                {assessment.grades_count > 0 ? (
                                  <Badge className="bg-green-500 text-white">
                                    {isRTL ? `${assessment.grades_count} درجة` : `${assessment.grades_count} graded`}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    {isRTL ? 'لم يتم التقييم' : 'Not graded'}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenGrading(assessment)}
                                    className="rounded-xl"
                                    data-testid={`grade-btn-${assessment.id}`}
                                  >
                                    <Edit className="h-4 w-4 me-1" />
                                    {isRTL ? 'الدرجات' : 'Grades'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteAssessment(assessment.id)}
                                    className="rounded-xl text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {classOverview && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="card-nassaq col-span-2">
                      <CardContent className="p-4 text-center">
                        <p className="text-4xl font-bold text-brand-turquoise">
                          {classOverview.class_average}%
                        </p>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'متوسط الفصل' : 'Class Average'}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="card-nassaq">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{classOverview.highest_score}%</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'أعلى درجة' : 'Highest'}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="card-nassaq">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{classOverview.lowest_score}%</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'أقل درجة' : 'Lowest'}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="card-nassaq">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{classOverview.total_assessments}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'التقييمات' : 'Assessments'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Grade Distribution */}
                  <Card className="card-nassaq">
                    <CardHeader>
                      <CardTitle className="font-cairo">{isRTL ? 'توزيع الدرجات' : 'Grade Distribution'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <p className="text-3xl font-bold text-green-600">{classOverview.grade_distribution.excellent}</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'ممتاز' : 'Excellent'}</p>
                          <p className="text-xs text-green-600">90%+</p>
                        </div>
                        <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <p className="text-3xl font-bold text-blue-600">{classOverview.grade_distribution.very_good}</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'جيد جداً' : 'Very Good'}</p>
                          <p className="text-xs text-blue-600">80-89%</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                          <p className="text-3xl font-bold text-yellow-600">{classOverview.grade_distribution.good}</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'جيد' : 'Good'}</p>
                          <p className="text-xs text-yellow-600">70-79%</p>
                        </div>
                        <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                          <p className="text-3xl font-bold text-orange-600">{classOverview.grade_distribution.pass}</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'مقبول' : 'Pass'}</p>
                          <p className="text-xs text-orange-600">60-69%</p>
                        </div>
                        <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <p className="text-3xl font-bold text-red-600">{classOverview.grade_distribution.fail}</p>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'راسب' : 'Fail'}</p>
                          <p className="text-xs text-red-600">&lt;60%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Assessments */}
                  <Card className="card-nassaq">
                    <CardHeader>
                      <CardTitle className="font-cairo">{isRTL ? 'آخر التقييمات' : 'Recent Assessments'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{isRTL ? 'العنوان' : 'Title'}</TableHead>
                            <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                            <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                            <TableHead>{isRTL ? 'تم تقييمهم' : 'Graded'}</TableHead>
                            <TableHead>{isRTL ? 'المتوسط' : 'Average'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classOverview.recent_assessments.map((a) => {
                            const typeConfig = assessmentTypeConfig[a.type] || {};
                            return (
                              <TableRow key={a.id}>
                                <TableCell className="font-medium">{a.title}</TableCell>
                                <TableCell>
                                  <Badge className={`${typeConfig.color} text-white`}>
                                    {isRTL ? typeConfig.label?.ar : typeConfig.label?.en}
                                  </Badge>
                                </TableCell>
                                <TableCell>{a.date}</TableCell>
                                <TableCell>{a.students_graded}</TableCell>
                                <TableCell>
                                  <Badge className={a.average >= 70 ? 'bg-green-500' : a.average >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                                    {a.average}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo">{isRTL ? 'سجل درجات الطلاب' : 'Student Grade History'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'اضغط على اسم الطالب لعرض سجله الكامل' : 'Click on student name to view full history'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentsForGrading.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentsForGrading.map((student) => (
                        <Card 
                          key={student.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => fetchStudentHistory(student.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={student.avatar_url} />
                                <AvatarFallback className="bg-brand-navy text-white">
                                  {student.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{student.full_name}</h4>
                                <p className="text-xs text-muted-foreground">{student.student_code}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'اختر فصلاً لعرض الطلاب' : 'Select a class to view students'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Assessment Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cairo">{isRTL ? 'إنشاء تقييم جديد' : 'Create New Assessment'}</DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل بيانات التقييم الجديد' : 'Enter new assessment details'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان' : 'Title'}</Label>
                <Input
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={isRTL ? 'مثال: اختبار الفصل الأول' : 'e.g. Chapter 1 Quiz'}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{isRTL ? 'نوع التقييم' : 'Assessment Type'}</Label>
                <Select 
                  value={newAssessment.assessment_type} 
                  onValueChange={(v) => setNewAssessment(prev => ({ ...prev, assessment_type: v }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(assessmentTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {isRTL ? config.label.ar : config.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الدرجة القصوى' : 'Max Score'}</Label>
                  <Input
                    type="number"
                    value={newAssessment.max_score}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, max_score: parseFloat(e.target.value) || 100 }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الوزن' : 'Weight'}</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={newAssessment.weight}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0.1 }))}
                    className="rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{isRTL ? 'التاريخ' : 'Date'}</Label>
                <Input
                  type="date"
                  value={newAssessment.date}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, date: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</Label>
                <Textarea
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isRTL ? 'وصف التقييم...' : 'Assessment description...'}
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)} className="rounded-xl">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleCreateAssessment} disabled={saving} className="bg-brand-navy rounded-xl">
                {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'إنشاء' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grade Entry Dialog */}
        <Dialog open={gradeDialog} onOpenChange={setGradeDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {isRTL ? 'إدخال الدرجات' : 'Enter Grades'} - {currentAssessment?.title}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? `الدرجة القصوى: ${currentAssessment?.max_score}` : `Max Score: ${currentAssessment?.max_score}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {studentsForGrading.map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-brand-navy text-white">
                        {student.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{student.full_name}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        max={currentAssessment?.max_score}
                        value={grades[student.id]?.score ?? student.score ?? ''}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        placeholder={isRTL ? 'الدرجة' : 'Score'}
                        className="w-24 rounded-xl"
                        data-testid={`grade-input-${student.id}`}
                      />
                      <span className="text-muted-foreground">/ {currentAssessment?.max_score}</span>
                      <Input
                        value={grades[student.id]?.notes ?? student.notes ?? ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        placeholder={isRTL ? 'ملاحظات' : 'Notes'}
                        className="w-32 rounded-xl"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setGradeDialog(false)} className="rounded-xl">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSaveGrades} 
                disabled={saving}
                className="bg-brand-turquoise hover:bg-brand-turquoise-light rounded-xl"
                data-testid="save-grades-btn"
              >
                <Save className="h-4 w-4 me-2" />
                {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الدرجات' : 'Save Grades')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student History Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {isRTL ? 'سجل الطالب' : 'Student History'} - {selectedStudentHistory?.student_name}
              </DialogTitle>
              <DialogDescription>
                {selectedStudentHistory?.class_name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudentHistory && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold text-brand-turquoise">{selectedStudentHistory.average_percentage}%</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'المتوسط العام' : 'Average'}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold">{selectedStudentHistory.total_assessments}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'التقييمات' : 'Assessments'}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold">{Object.keys(selectedStudentHistory.grades_by_subject).length}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'المواد' : 'Subjects'}</p>
                  </Card>
                </div>

                {/* By Subject */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-cairo">{isRTL ? 'حسب المادة' : 'By Subject'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(selectedStudentHistory.grades_by_subject).map(([subject, data]) => (
                      <div key={subject} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span>{subject}</span>
                        <Badge className={data.average >= 70 ? 'bg-green-500' : data.average >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                          {data.average}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Grades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-cairo">{isRTL ? 'آخر الدرجات' : 'Recent Grades'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isRTL ? 'التقييم' : 'Assessment'}</TableHead>
                          <TableHead>{isRTL ? 'المادة' : 'Subject'}</TableHead>
                          <TableHead>{isRTL ? 'الدرجة' : 'Score'}</TableHead>
                          <TableHead>{isRTL ? 'النسبة' : 'Percentage'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStudentHistory.recent_grades.map((grade, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{grade.title}</TableCell>
                            <TableCell>{grade.subject_name}</TableCell>
                            <TableCell>{grade.score}/{grade.max_score}</TableCell>
                            <TableCell>
                              <Badge className={grade.percentage >= 70 ? 'bg-green-500' : grade.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                                {grade.percentage}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
