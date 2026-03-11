import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Users,
  UserPlus,
  GraduationCap,
  School,
  Search,
  Filter,
  Plus,
  Sun,
  Moon,
  Globe,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Eye,
  UserCheck,
  Award,
  Calendar,
  Hash,
  Building2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { NotificationBell } from '../components/notifications/NotificationBell';
import AddStudentWizard from '../components/wizards/AddStudentWizard';
import { AddTeacherWizard } from '../components/wizards/AddTeacherWizard';
import CreateClassWizard from '../components/wizards/CreateClassWizard';

// Translations
const t = {
  ar: {
    pageTitle: 'إدارة المستخدمين والفصول',
    pageSubtitle: 'إدارة الطلاب والمعلمين والفصول الدراسية',
    all: 'الكل',
    students: 'الطلاب',
    teachers: 'المعلمين',
    classes: 'الفصول',
    addStudent: 'طالب/طلاب',
    addTeacher: 'معلم/معلمين',
    addClass: 'فصل/فصول',
    search: 'بحث...',
    noResults: 'لا توجد نتائج',
    loading: 'جاري التحميل...',
    totalStudents: 'إجمالي الطلاب',
    totalTeachers: 'إجمالي المعلمين',
    totalClasses: 'إجمالي الفصول',
    edit: 'تعديل',
    delete: 'حذف',
    viewDetails: 'عرض التفاصيل',
    grade: 'الصف',
    section: 'الشعبة',
    capacity: 'السعة',
    specialization: 'التخصص',
    experience: 'الخبرة',
    years: 'سنوات',
    studentId: 'رقم الطالب',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    homeroom: 'معلم الفصل',
    studentsCount: 'عدد الطلاب',
    refresh: 'تحديث',
    export: 'تصدير',
    import: 'استيراد',
  },
  en: {
    pageTitle: 'Users & Classes Management',
    pageSubtitle: 'Manage students, teachers, and classes',
    all: 'All',
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    addStudent: 'Add Student(s)',
    addTeacher: 'Add Teacher(s)',
    addClass: 'Add Class(es)',
    search: 'Search...',
    noResults: 'No results found',
    loading: 'Loading...',
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    totalClasses: 'Total Classes',
    edit: 'Edit',
    delete: 'Delete',
    viewDetails: 'View Details',
    grade: 'Grade',
    section: 'Section',
    capacity: 'Capacity',
    specialization: 'Specialization',
    experience: 'Experience',
    years: 'years',
    studentId: 'Student ID',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    homeroom: 'Homeroom Teacher',
    studentsCount: 'Students Count',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
  },
};

// Student Card Component
const StudentCard = ({ student, isRTL, onEdit, onDelete, onView }) => (
  <Card className="card-nassaq hover:shadow-md transition-shadow h-full" data-testid={`student-card-${student.id}`}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-turquoise to-brand-purple flex items-center justify-center">
            <span className="text-white font-bold text-lg">{student.full_name?.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{student.full_name}</h3>
            <p className="text-xs text-muted-foreground">{student.student_number}</p>
          </div>
        </div>
        <Badge variant={student.is_active ? 'default' : 'secondary'} className="text-[10px]">
          {student.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
        </Badge>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span>{isRTL ? 'الصف' : 'Grade'}: {student.grade || '-'}</span>
          <span className="mx-1">|</span>
          <span>{isRTL ? 'الشعبة' : 'Section'}: {student.section || '-'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span className="truncate">{student.student_number || '-'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onView(student)}>
          <Eye className="h-3 w-3 me-1" />
          {isRTL ? 'عرض' : 'View'}
        </Button>
        <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onEdit(student)}>
          <Edit className="h-3 w-3 me-1" />
          {isRTL ? 'تعديل' : 'Edit'}
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Teacher Card Component
const TeacherCard = ({ teacher, isRTL, onEdit, onDelete, onView }) => (
  <Card className="card-nassaq hover:shadow-md transition-shadow h-full" data-testid={`teacher-card-${teacher.id}`}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-navy to-brand-purple flex items-center justify-center">
            <span className="text-white font-bold text-lg">{teacher.full_name?.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{teacher.full_name}</h3>
            <p className="text-xs text-muted-foreground">{teacher.specialization}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-brand-navy/10 text-brand-navy">
          <Award className="h-3 w-3 me-1" />
          {teacher.rank || (isRTL ? 'معلم' : 'Teacher')}
        </Badge>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{teacher.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{teacher.years_of_experience || 0} {isRTL ? 'سنوات خبرة' : 'years exp.'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onView(teacher)}>
          <Eye className="h-3 w-3 me-1" />
          {isRTL ? 'عرض' : 'View'}
        </Button>
        <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onEdit(teacher)}>
          <Edit className="h-3 w-3 me-1" />
          {isRTL ? 'تعديل' : 'Edit'}
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Class Card Component
const ClassCard = ({ classItem, isRTL, onEdit, onDelete, onView }) => (
  <Card className="card-nassaq hover:shadow-md transition-shadow h-full" data-testid={`class-card-${classItem.id}`}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{classItem.name}</h3>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'الصف' : 'Grade'} {classItem.grade} - {classItem.section}
            </p>
          </div>
        </div>
        <Badge variant={classItem.is_active ? 'default' : 'secondary'} className="text-[10px]">
          {classItem.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
        </Badge>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{classItem.student_count || 0} / {classItem.capacity || 30} {isRTL ? 'طالب' : 'students'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserCheck className="h-3 w-3" />
          <span className="truncate">{classItem.homeroom_teacher_name || (isRTL ? 'لم يُعين' : 'Not assigned')}</span>
        </div>
      </div>
      
      {/* Capacity Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div 
            className="bg-brand-turquoise h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, ((classItem.student_count || 0) / (classItem.capacity || 30)) * 100)}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onView(classItem)}>
          <Eye className="h-3 w-3 me-1" />
          {isRTL ? 'عرض' : 'View'}
        </Button>
        <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onEdit(classItem)}>
          <Edit className="h-3 w-3 me-1" />
          {isRTL ? 'تعديل' : 'Edit'}
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Main Component
export default function UsersClassesManagement() {
  const { user, api, schoolContext, isImpersonating, getEffectiveTenantId } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const labels = t[isRTL ? 'ar' : 'en'];
  
  // States
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('filter') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Wizard states
  const [showStudentWizard, setShowStudentWizard] = useState(false);
  const [showTeacherWizard, setShowTeacherWizard] = useState(false);
  const [showClassWizard, setShowClassWizard] = useState(false);
  
  // Stats
  const stats = {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    activeStudents: students.filter(s => s.is_active).length,
    activeTeachers: teachers.filter(t => t.is_active !== false).length,
    activeClasses: classes.filter(c => c.is_active !== false).length,
  };
  
  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, [user, schoolContext]);
  
  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'all') {
      setSearchParams({ filter: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab]);
  
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Build headers for school context
      const headers = {};
      if (isImpersonating && schoolContext?.school_id) {
        headers['X-School-Context'] = schoolContext.school_id;
      }
      
      // Fetch students, teachers, and classes in parallel
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        api.get('/students', { headers }).catch(() => ({ data: [] })),
        api.get('/teachers', { headers }).catch(() => ({ data: [] })),
        api.get('/classes', { headers }).catch(() => ({ data: [] })),
      ]);
      
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter data based on search
  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTeachers = teachers.filter(t => 
    t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredClasses = classes.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handlers
  const handleEdit = (item, type) => {
    toast.info(isRTL ? 'جاري فتح نموذج التعديل...' : 'Opening edit form...');
  };
  
  const handleDelete = (item, type) => {
    toast.info(isRTL ? 'جاري الحذف...' : 'Deleting...');
  };
  
  const handleView = (item, type) => {
    toast.info(isRTL ? 'جاري فتح التفاصيل...' : 'Opening details...');
  };
  
  const handleRefresh = () => {
    fetchAllData();
    toast.success(isRTL ? 'تم تحديث البيانات' : 'Data refreshed');
  };
  
  // Wizard success handlers
  const handleStudentCreated = (student) => {
    setShowStudentWizard(false);
    fetchAllData();
    toast.success(isRTL ? 'تم إضافة الطالب بنجاح' : 'Student added successfully');
  };
  
  const handleTeacherCreated = (teacher) => {
    setShowTeacherWizard(false);
    fetchAllData();
    toast.success(isRTL ? 'تم إضافة المعلم بنجاح' : 'Teacher added successfully');
  };
  
  const handleClassCreated = (classItem) => {
    setShowClassWizard(false);
    fetchAllData();
    toast.success(isRTL ? 'تم إنشاء الفصل بنجاح' : 'Class created successfully');
  };

  return (
    <Sidebar>
      <div className="min-h-screen" data-testid="users-classes-management">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold">{labels.pageTitle}</h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isImpersonating && schoolContext 
                  ? `${schoolContext.school_name} - ${labels.pageSubtitle}`
                  : labels.pageSubtitle
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} data-testid="language-toggle">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="theme-toggle">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-turquoise/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-brand-turquoise" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{labels.totalStudents}</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-brand-navy" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{labels.totalTeachers}</p>
                  <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{labels.totalClasses}</p>
                  <p className="text-2xl font-bold">{stats.totalClasses}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button 
              onClick={() => setShowStudentWizard(true)}
              className="bg-brand-turquoise hover:bg-brand-turquoise-light rounded-xl"
              data-testid="add-student-btn"
            >
              <GraduationCap className="h-4 w-4 me-2" />
              {labels.addStudent}
            </Button>
            
            <Button 
              onClick={() => setShowTeacherWizard(true)}
              className="bg-brand-navy hover:bg-brand-navy/90 rounded-xl"
              data-testid="add-teacher-btn"
            >
              <UserPlus className="h-4 w-4 me-2" />
              {labels.addTeacher}
            </Button>
            
            <Button 
              onClick={() => setShowClassWizard(true)}
              className="bg-green-500 hover:bg-green-600 rounded-xl"
              data-testid="add-class-btn"
            >
              <School className="h-4 w-4 me-2" />
              {labels.addClass}
            </Button>
            
            <div className="flex-1" />
            
            <Button variant="outline" size="icon" onClick={handleRefresh} className="rounded-xl" title={labels.refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={labels.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 rounded-xl"
                data-testid="search-input"
              />
            </div>
            
            {/* Tab Filters */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-muted/50 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg" data-testid="filter-all">
                  {labels.all}
                </TabsTrigger>
                <TabsTrigger value="students" className="rounded-lg" data-testid="filter-students">
                  <GraduationCap className="h-4 w-4 me-1" />
                  {labels.students}
                </TabsTrigger>
                <TabsTrigger value="teachers" className="rounded-lg" data-testid="filter-teachers">
                  <UserCheck className="h-4 w-4 me-1" />
                  {labels.teachers}
                </TabsTrigger>
                <TabsTrigger value="classes" className="rounded-lg" data-testid="filter-classes">
                  <Building2 className="h-4 w-4 me-1" />
                  {labels.classes}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
              <span className="ms-3 text-muted-foreground">{labels.loading}</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Students Section */}
              {(activeTab === 'all' || activeTab === 'students') && (
                <section>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-turquoise" />
                      {labels.students} ({filteredStudents.length})
                    </h2>
                  )}
                  
                  {filteredStudents.length === 0 ? (
                    <Card className="p-8 text-center">
                      <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">{labels.noResults}</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {filteredStudents.slice(0, activeTab === 'all' ? 10 : undefined).map(student => (
                        <StudentCard 
                          key={student.id}
                          student={student}
                          isRTL={isRTL}
                          onEdit={(s) => handleEdit(s, 'student')}
                          onDelete={(s) => handleDelete(s, 'student')}
                          onView={(s) => handleView(s, 'student')}
                        />
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'all' && filteredStudents.length > 10 && (
                    <Button 
                      variant="ghost" 
                      className="mt-4 w-full" 
                      onClick={() => setActiveTab('students')}
                    >
                      {isRTL ? `عرض الكل (${filteredStudents.length})` : `View All (${filteredStudents.length})`}
                    </Button>
                  )}
                </section>
              )}
              
              {/* Teachers Section */}
              {(activeTab === 'all' || activeTab === 'teachers') && (
                <section>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-brand-navy" />
                      {labels.teachers} ({filteredTeachers.length})
                    </h2>
                  )}
                  
                  {filteredTeachers.length === 0 ? (
                    <Card className="p-8 text-center">
                      <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">{labels.noResults}</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {filteredTeachers.slice(0, activeTab === 'all' ? 10 : undefined).map(teacher => (
                        <TeacherCard 
                          key={teacher.id}
                          teacher={teacher}
                          isRTL={isRTL}
                          onEdit={(t) => handleEdit(t, 'teacher')}
                          onDelete={(t) => handleDelete(t, 'teacher')}
                          onView={(t) => handleView(t, 'teacher')}
                        />
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'all' && filteredTeachers.length > 10 && (
                    <Button 
                      variant="ghost" 
                      className="mt-4 w-full" 
                      onClick={() => setActiveTab('teachers')}
                    >
                      {isRTL ? `عرض الكل (${filteredTeachers.length})` : `View All (${filteredTeachers.length})`}
                    </Button>
                  )}
                </section>
              )}
              
              {/* Classes Section */}
              {(activeTab === 'all' || activeTab === 'classes') && (
                <section>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-500" />
                      {labels.classes} ({filteredClasses.length})
                    </h2>
                  )}
                  
                  {filteredClasses.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">{labels.noResults}</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {filteredClasses.slice(0, activeTab === 'all' ? 10 : undefined).map(classItem => (
                        <ClassCard 
                          key={classItem.id}
                          classItem={classItem}
                          isRTL={isRTL}
                          onEdit={(c) => handleEdit(c, 'class')}
                          onDelete={(c) => handleDelete(c, 'class')}
                          onView={(c) => handleView(c, 'class')}
                        />
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'all' && filteredClasses.length > 10 && (
                    <Button 
                      variant="ghost" 
                      className="mt-4 w-full" 
                      onClick={() => setActiveTab('classes')}
                    >
                      {isRTL ? `عرض الكل (${filteredClasses.length})` : `View All (${filteredClasses.length})`}
                    </Button>
                  )}
                </section>
              )}
            </div>
          )}
        </main>
        
        {/* Wizards */}
        <AddStudentWizard 
          open={showStudentWizard}
          onOpenChange={setShowStudentWizard}
          onSuccess={handleStudentCreated}
          api={api}
          isRTL={isRTL}
          classes={classes}
        />
        
        <AddTeacherWizard 
          open={showTeacherWizard}
          onOpenChange={setShowTeacherWizard}
          onSuccess={handleTeacherCreated}
          api={api}
          isRTL={isRTL}
        />
        
        {showClassWizard && (
          <CreateClassWizard 
            open={showClassWizard}
            onOpenChange={setShowClassWizard}
            onSuccess={handleClassCreated}
            api={api}
            isRTL={isRTL}
          />
        )}
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
