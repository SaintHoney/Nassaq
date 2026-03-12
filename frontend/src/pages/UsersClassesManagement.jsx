import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { ScrollArea } from '../components/ui/scroll-area';
import axios from 'axios';
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
  Eye,
  UserCheck,
  Award,
  Calendar,
  Hash,
  Building2,
  Upload,
  Download,
  FileSpreadsheet,
  FileUp,
  FileDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarRange,
  ClipboardList,
} from 'lucide-react';
import { Save } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { NotificationBell } from '../components/notifications/NotificationBell';
import AddStudentWizard from '../components/wizards/AddStudentWizard';
import { AddTeacherWizard } from '../components/wizards/AddTeacherWizard';
import CreateClassWizard from '../components/wizards/CreateClassWizard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Translations
const t = {
  ar: {
    pageTitle: 'إدارة المستخدمين والفصول',
    pageSubtitle: 'إدارة الطلاب والمعلمين والفصول الدراسية',
    all: 'الكل',
    students: 'الطلاب',
    teachers: 'المعلمين',
    classes: 'الفصول',
    addStudent: 'طالب / طلاب',
    addTeacher: 'معلم / معلمين',
    addClass: 'فصل / فصول',
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
    importExport: 'استيراد/تصدير',
    importData: 'استيراد البيانات',
    exportData: 'تصدير البيانات',
    chooseDataType: 'اختر نوع البيانات',
    downloadTemplate: 'تحميل القالب',
    uploadFile: 'ارفع الملف',
    startImport: 'بدء الاستيراد',
    importing: 'جاري الاستيراد...',
    exporting: 'جاري التصدير...',
    importResult: 'نتيجة الاستيراد',
    noImportYet: 'لم يتم الاستيراد بعد',
    totalRows: 'إجمالي الصفوف',
    imported: 'تم استيرادها',
    failed: 'فشلت',
    successRate: 'نسبة النجاح',
    errors: 'الأخطاء',
    warnings: 'تحذيرات',
    row: 'صف',
    importSuccess: 'تم الاستيراد بنجاح!',
    fileFormat: 'صيغة الملف',
    dragOrClick: 'اسحب الملف هنا أو انقر للاختيار',
    supportedFormats: 'يدعم: Excel (.xlsx, .xls) و CSV',
    schedule: 'الجدول الدراسي',
    attendance: 'سجل الحضور',
    grades: 'الدرجات',
  },
  en: {
    pageTitle: 'Users & Classes Management',
    pageSubtitle: 'Manage students, teachers, and classes',
    all: 'All',
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    addStudent: 'Student(s)',
    addTeacher: 'Teacher(s)',
    addClass: 'Class(es)',
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
    importExport: 'Import/Export',
    importData: 'Import Data',
    exportData: 'Export Data',
    chooseDataType: 'Choose data type',
    downloadTemplate: 'Download Template',
    uploadFile: 'Upload file',
    startImport: 'Start Import',
    importing: 'Importing...',
    exporting: 'Exporting...',
    importResult: 'Import Result',
    noImportYet: 'No import yet',
    totalRows: 'Total Rows',
    imported: 'Imported',
    failed: 'Failed',
    successRate: 'Success Rate',
    errors: 'Errors',
    warnings: 'Warnings',
    row: 'Row',
    importSuccess: 'Import completed successfully!',
    fileFormat: 'File Format',
    dragOrClick: 'Drag file here or click to select',
    supportedFormats: 'Supports: Excel (.xlsx, .xls) and CSV',
    schedule: 'Schedule',
    attendance: 'Attendance',
    grades: 'Grades',
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
  const [grades, setGrades] = useState([]);
  
  // Wizard states
  const [showStudentWizard, setShowStudentWizard] = useState(false);
  const [showTeacherWizard, setShowTeacherWizard] = useState(false);
  const [showClassWizard, setShowClassWizard] = useState(false);
  
  // Import/Export states
  const [importType, setImportType] = useState('students');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exporting, setExporting] = useState(false);
  
  // View/Edit Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
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
    setSelectedItem(item);
    setSelectedItemType(type);
    setEditFormData({ ...item });
    setEditDialogOpen(true);
  };
  
  const handleDelete = async (item, type) => {
    const confirmMessage = isRTL 
      ? `هل أنت متأكد من حذف ${type === 'student' ? 'الطالب' : type === 'teacher' ? 'المعلم' : 'الفصل'}؟`
      : `Are you sure you want to delete this ${type}?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const endpoint = type === 'student' ? `/students/${item.id}` 
                     : type === 'teacher' ? `/teachers/${item.id}` 
                     : `/classes/${item.id}`;
      await api.delete(endpoint);
      toast.success(isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل الحذف' : 'Delete failed'));
    }
  };
  
  const handleView = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setViewDialogOpen(true);
  };
  
  const handleSaveEdit = async () => {
    if (!selectedItem || !selectedItemType) return;
    
    setEditLoading(true);
    try {
      const endpoint = selectedItemType === 'student' ? `/students/${selectedItem.id}` 
                     : selectedItemType === 'teacher' ? `/teachers/${selectedItem.id}` 
                     : `/classes/${selectedItem.id}`;
      
      await api.put(endpoint, editFormData);
      toast.success(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully');
      setEditDialogOpen(false);
      setSelectedItem(null);
      fetchAllData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setEditLoading(false);
    }
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

  // Import/Export handlers
  const downloadTemplate = async (type) => {
    try {
      const response = await api.get(`/bulk/template/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', type === 'students' ? 'قالب_استيراد_الطلاب.xlsx' : 'قالب_استيراد_المعلمين.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(isRTL ? 'تم تحميل القالب بنجاح' : 'Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error(isRTL ? 'فشل تحميل القالب' : 'Failed to download template');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
      
      if (!isValid) {
        toast.error(isRTL ? 'يجب أن يكون الملف بصيغة Excel أو CSV' : 'File must be Excel or CSV format');
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error(isRTL ? 'يرجى اختيار ملف' : 'Please select a file');
      return;
    }
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await api.post(`/bulk/import/${importType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setImportResult(response.data);
      
      if (response.data.success) {
        toast.success(
          isRTL 
            ? `تم استيراد ${response.data.imported} سجل بنجاح` 
            : `Successfully imported ${response.data.imported} records`
        );
        // Refresh data after successful import
        fetchAllData();
      } else {
        toast.warning(
          isRTL 
            ? `تم استيراد ${response.data.imported} من ${response.data.total_rows} سجل` 
            : `Imported ${response.data.imported} of ${response.data.total_rows} records`
        );
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل الاستيراد' : 'Import failed'));
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const response = await api.get(`/bulk/export/${exportType}?format=${exportFormat}`, {
        responseType: 'blob'
      });
      
      const filename = {
        students: 'تصدير_الطلاب',
        teachers: 'تصدير_المعلمين',
        schedule: 'تصدير_الجدول',
        attendance: 'تصدير_الحضور',
        grades: 'تصدير_الدرجات'
      }[exportType] || 'تصدير';
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(isRTL ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      const message = error.response?.status === 404 
        ? (isRTL ? 'لا توجد بيانات للتصدير' : 'No data to export')
        : (isRTL ? 'فشل التصدير' : 'Export failed');
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const importTypeOptions = [
    { value: 'students', label: labels.students, icon: GraduationCap },
    { value: 'teachers', label: labels.teachers, icon: Users },
  ];
  
  const exportTypeOptions = [
    { value: 'students', label: labels.students, icon: GraduationCap },
    { value: 'teachers', label: labels.teachers, icon: Users },
    { value: 'schedule', label: labels.schedule, icon: Calendar },
    { value: 'attendance', label: labels.attendance, icon: ClipboardList },
    { value: 'grades', label: labels.grades, icon: Award },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen" data-testid="users-classes-management">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold">
                {isRTL ? `مرحباً، ${user?.full_name || 'المستخدم'}` : `Welcome, ${user?.full_name || 'User'}`}
              </h1>
              <p className="text-base text-muted-foreground font-tajawal">
                {labels.pageTitle}
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
                <TabsTrigger value="import-export" className="rounded-lg" data-testid="filter-import-export">
                  <FileSpreadsheet className="h-4 w-4 me-1" />
                  {labels.importExport}
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

              {/* Import/Export Section */}
              {activeTab === 'import-export' && (
                <section>
                  <Tabs defaultValue="import" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="import" className="flex items-center gap-2" data-testid="inner-tab-import">
                        <FileUp className="h-4 w-4" />
                        {labels.import}
                      </TabsTrigger>
                      <TabsTrigger value="export" className="flex items-center gap-2" data-testid="inner-tab-export">
                        <FileDown className="h-4 w-4" />
                        {labels.export}
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Import Tab */}
                    <TabsContent value="import">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Import Form */}
                        <Card className="card-nassaq">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Upload className="h-5 w-5 text-brand-turquoise" />
                              {labels.importData}
                            </CardTitle>
                            <CardDescription>
                              {isRTL ? 'قم برفع ملف Excel أو CSV لاستيراد البيانات' : 'Upload an Excel or CSV file to import data'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Step 1: Choose Type */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">
                                {isRTL ? '1. اختر نوع البيانات' : '1. Choose data type'}
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                {importTypeOptions.map((option) => {
                                  const Icon = option.icon;
                                  return (
                                    <button
                                      key={option.value}
                                      onClick={() => setImportType(option.value)}
                                      className={`p-4 rounded-xl border-2 transition-all ${
                                        importType === option.value
                                          ? 'border-brand-turquoise bg-brand-turquoise/10'
                                          : 'border-border hover:border-brand-turquoise/50'
                                      }`}
                                      data-testid={`import-type-${option.value}`}
                                    >
                                      <Icon className={`h-8 w-8 mx-auto mb-2 ${
                                        importType === option.value ? 'text-brand-turquoise' : 'text-muted-foreground'
                                      }`} />
                                      <p className="text-sm font-medium">{option.label}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Step 2: Download Template */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">
                                {isRTL ? '2. حمّل القالب (اختياري)' : '2. Download template (optional)'}
                              </Label>
                              <Button
                                variant="outline"
                                onClick={() => downloadTemplate(importType)}
                                className="w-full"
                                data-testid="download-template-btn"
                              >
                                <Download className="h-4 w-4 me-2" />
                                {labels.downloadTemplate} - {importType === 'students' ? labels.students : labels.teachers}
                              </Button>
                            </div>
                            
                            {/* Step 3: Upload File */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">
                                {isRTL ? '3. ارفع الملف' : '3. Upload file'}
                              </Label>
                              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-brand-turquoise/50 transition-colors">
                                <Input
                                  type="file"
                                  accept=".xlsx,.xls,.csv"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                  id="file-upload"
                                  data-testid="file-upload-input"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {labels.dragOrClick}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {labels.supportedFormats}
                                  </p>
                                </label>
                              </div>
                              
                              {selectedFile && (
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-brand-turquoise" />
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <Badge variant="secondary">
                                      {(selectedFile.size / 1024).toFixed(1)} KB
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedFile(null);
                                      setImportResult(null);
                                    }}
                                    data-testid="remove-file-btn"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {/* Import Button */}
                            <Button
                              onClick={handleImport}
                              disabled={!selectedFile || importing}
                              className="w-full bg-brand-turquoise hover:bg-brand-turquoise/90"
                              data-testid="start-import-btn"
                            >
                              {importing ? (
                                <>
                                  <RefreshCw className="h-4 w-4 me-2 animate-spin" />
                                  {labels.importing}
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 me-2" />
                                  {labels.startImport}
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                        
                        {/* Import Results */}
                        <Card className="card-nassaq">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ClipboardList className="h-5 w-5 text-brand-purple" />
                              {labels.importResult}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {!importResult ? (
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileSpreadsheet className="h-16 w-16 mb-4 opacity-30" />
                                <p className="text-sm">{labels.noImportYet}</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                                    <p className="text-2xl font-bold text-brand-navy dark:text-white">
                                      {importResult.total_rows}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{labels.totalRows}</p>
                                  </div>
                                  <div className="text-center p-4 bg-green-500/10 rounded-xl">
                                    <p className="text-2xl font-bold text-green-600">
                                      {importResult.imported}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{labels.imported}</p>
                                  </div>
                                  <div className="text-center p-4 bg-red-500/10 rounded-xl">
                                    <p className="text-2xl font-bold text-red-600">
                                      {importResult.failed}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{labels.failed}</p>
                                  </div>
                                </div>
                                
                                {/* Progress */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>{labels.successRate}</span>
                                    <span className="font-medium">
                                      {((importResult.imported / importResult.total_rows) * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(importResult.imported / importResult.total_rows) * 100} 
                                    className="h-2"
                                  />
                                </div>
                                
                                {/* Errors */}
                                {importResult.errors?.length > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-red-600 flex items-center gap-2">
                                      <XCircle className="h-4 w-4" />
                                      {labels.errors} ({importResult.errors.length})
                                    </Label>
                                    <ScrollArea className="h-40 border rounded-lg p-2">
                                      {importResult.errors.map((error, idx) => (
                                        <div key={idx} className="text-xs p-2 bg-red-500/10 rounded mb-1">
                                          <span className="font-medium">{labels.row} {error.row}:</span>
                                          {error.field && <span className="mx-1">[{error.field}]</span>}
                                          <span>{error.message}</span>
                                        </div>
                                      ))}
                                    </ScrollArea>
                                  </div>
                                )}
                                
                                {/* Warnings */}
                                {importResult.warnings?.length > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-amber-600 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      {labels.warnings} ({importResult.warnings.length})
                                    </Label>
                                    <ScrollArea className="h-32 border rounded-lg p-2">
                                      {importResult.warnings.map((warning, idx) => (
                                        <div key={idx} className="text-xs p-2 bg-amber-500/10 rounded mb-1">
                                          <span className="font-medium">{labels.row} {warning.row}:</span>
                                          <span className="ms-1">{warning.message}</span>
                                        </div>
                                      ))}
                                    </ScrollArea>
                                  </div>
                                )}
                                
                                {/* Success Message */}
                                {importResult.success && (
                                  <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                      {labels.importSuccess}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    {/* Export Tab */}
                    <TabsContent value="export">
                      <Card className="card-nassaq max-w-2xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-brand-turquoise" />
                            {labels.exportData}
                          </CardTitle>
                          <CardDescription>
                            {isRTL ? 'اختر نوع البيانات والصيغة لتصديرها' : 'Choose data type and format to export'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Choose Export Type */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              {labels.chooseDataType}
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {exportTypeOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                  <button
                                    key={option.value}
                                    onClick={() => setExportType(option.value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                      exportType === option.value
                                        ? 'border-brand-turquoise bg-brand-turquoise/10'
                                        : 'border-border hover:border-brand-turquoise/50'
                                    }`}
                                    data-testid={`export-type-${option.value}`}
                                  >
                                    <Icon className={`h-6 w-6 mx-auto mb-2 ${
                                      exportType === option.value ? 'text-brand-turquoise' : 'text-muted-foreground'
                                    }`} />
                                    <p className="text-sm font-medium">{option.label}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Choose Format */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              {labels.fileFormat}
                            </Label>
                            <Select value={exportFormat} onValueChange={setExportFormat}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="xlsx">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Excel (.xlsx)
                                  </div>
                                </SelectItem>
                                <SelectItem value="csv">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    CSV (.csv)
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Export Button */}
                          <Button
                            onClick={handleExport}
                            disabled={exporting}
                            className="w-full bg-brand-navy hover:bg-brand-navy/90"
                            data-testid="export-data-btn"
                          >
                            {exporting ? (
                              <>
                                <RefreshCw className="h-4 w-4 me-2 animate-spin" />
                                {labels.exporting}
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 me-2" />
                                {labels.exportData}
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
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
        
        <CreateClassWizard 
          open={showClassWizard}
          onOpenChange={setShowClassWizard}
          onSuccess={handleClassCreated}
          api={api}
          isRTL={isRTL}
        />
        
        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'تفاصيل ' : 'Details: '}
                {selectedItemType === 'student' ? (isRTL ? 'الطالب' : 'Student') 
                 : selectedItemType === 'teacher' ? (isRTL ? 'المعلم' : 'Teacher') 
                 : (isRTL ? 'الفصل' : 'Class')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4 py-4">
                {selectedItemType === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
                      <p className="font-medium mt-1">{selectedItem.full_name || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'رقم الطالب' : 'Student Number'}</Label>
                      <p className="font-medium mt-1">{selectedItem.student_number || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الصف' : 'Grade'}</Label>
                      <p className="font-medium mt-1">{selectedItem.grade || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الشعبة' : 'Section'}</Label>
                      <p className="font-medium mt-1">{selectedItem.section || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الجنس' : 'Gender'}</Label>
                      <p className="font-medium mt-1">{selectedItem.gender === 'male' ? (isRTL ? 'ذكر' : 'Male') : (isRTL ? 'أنثى' : 'Female')}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</Label>
                      <Badge variant={selectedItem.is_active ? 'default' : 'secondary'}>
                        {selectedItem.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg col-span-2">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <p className="font-medium mt-1">{selectedItem.email || '-'}</p>
                    </div>
                  </div>
                )}
                
                {selectedItemType === 'teacher' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
                      <p className="font-medium mt-1">{selectedItem.full_name || selectedItem.full_name_ar || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'التخصص' : 'Specialization'}</Label>
                      <p className="font-medium mt-1">{selectedItem.specialization || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الرتبة' : 'Rank'}</Label>
                      <p className="font-medium mt-1">{selectedItem.rank || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
                      <p className="font-medium mt-1">{selectedItem.phone || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg col-span-2">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <p className="font-medium mt-1">{selectedItem.email || '-'}</p>
                    </div>
                  </div>
                )}
                
                {selectedItemType === 'class' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'اسم الفصل' : 'Class Name'}</Label>
                      <p className="font-medium mt-1">{selectedItem.name || selectedItem.name_ar || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'الصف' : 'Grade'}</Label>
                      <p className="font-medium mt-1">{selectedItem.grade || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'السعة' : 'Capacity'}</Label>
                      <p className="font-medium mt-1">{selectedItem.capacity || '-'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">{isRTL ? 'عدد الطلاب' : 'Students Count'}</Label>
                      <p className="font-medium mt-1">{selectedItem.students_count || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedItem, selectedItemType);
              }}>
                <Edit className="h-4 w-4 me-2" />
                {isRTL ? 'تعديل' : 'Edit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-turquoise" />
                {isRTL ? 'تعديل ' : 'Edit '}
                {selectedItemType === 'student' ? (isRTL ? 'الطالب' : 'Student') 
                 : selectedItemType === 'teacher' ? (isRTL ? 'المعلم' : 'Teacher') 
                 : (isRTL ? 'الفصل' : 'Class')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4 py-4">
                {selectedItemType === 'student' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
                      <Input 
                        value={editFormData.full_name || ''} 
                        onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الصف' : 'Grade'}</Label>
                        <Input 
                          value={editFormData.grade || ''} 
                          onChange={(e) => setEditFormData({...editFormData, grade: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الشعبة' : 'Section'}</Label>
                        <Input 
                          value={editFormData.section || ''} 
                          onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="student-active"
                        checked={editFormData.is_active || false}
                        onChange={(e) => setEditFormData({...editFormData, is_active: e.target.checked})}
                      />
                      <Label htmlFor="student-active">{isRTL ? 'نشط' : 'Active'}</Label>
                    </div>
                  </div>
                )}
                
                {selectedItemType === 'teacher' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
                      <Input 
                        value={editFormData.full_name || editFormData.full_name_ar || ''} 
                        onChange={(e) => setEditFormData({...editFormData, full_name_ar: e.target.value, full_name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'التخصص' : 'Specialization'}</Label>
                        <Input 
                          value={editFormData.specialization || ''} 
                          onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
                        <Input 
                          value={editFormData.phone || ''} 
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input 
                        type="email"
                        value={editFormData.email || ''} 
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                {selectedItemType === 'class' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم الفصل' : 'Class Name'}</Label>
                      <Input 
                        value={editFormData.name || editFormData.name_ar || ''} 
                        onChange={(e) => setEditFormData({...editFormData, name_ar: e.target.value, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الصف' : 'Grade'}</Label>
                        <Input 
                          value={editFormData.grade || ''} 
                          onChange={(e) => setEditFormData({...editFormData, grade: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'السعة' : 'Capacity'}</Label>
                        <Input 
                          type="number"
                          value={editFormData.capacity || ''} 
                          onChange={(e) => setEditFormData({...editFormData, capacity: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Save className="h-4 w-4 me-2" />
                )}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
}
