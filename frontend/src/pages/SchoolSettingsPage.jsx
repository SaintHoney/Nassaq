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
  Settings,
  School,
  Calendar,
  BookOpen,
  Clock,
  Sun,
  Moon,
  Globe,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Switch } from '../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export const SchoolSettingsPage = () => {
  const { user, api } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('school-info');
  
  // School Info
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    name_en: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    logo_url: '',
    website: '',
    principal_name: '',
    established_year: '',
  });
  
  // Academic Years
  const [academicYears, setAcademicYears] = useState([]);
  const [showAcademicYearDialog, setShowAcademicYearDialog] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);
  const [newAcademicYear, setNewAcademicYear] = useState({
    name: '',
    name_en: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });
  
  // Terms/Semesters
  const [terms, setTerms] = useState([]);
  const [showTermDialog, setShowTermDialog] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [newTerm, setNewTerm] = useState({
    name: '',
    name_en: '',
    academic_year_id: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });
  
  // Grade Levels
  const [gradeLevels, setGradeLevels] = useState([]);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [newGrade, setNewGrade] = useState({
    name: '',
    name_en: '',
    order: 1,
    is_active: true,
  });
  
  // Working Days Configuration
  const [workingDays, setWorkingDays] = useState({
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
    saturday: false,
  });
  
  // School Timings
  const [schoolTimings, setSchoolTimings] = useState({
    school_start: '07:00',
    school_end: '14:00',
    period_duration: 45,
    break_duration: 15,
    long_break_duration: 30,
  });
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '' });

  const fetchSchoolInfo = async () => {
    try {
      const tenantId = user?.tenant_id;
      if (!tenantId) return;
      
      const response = await api.get(`/schools/${tenantId}`);
      setSchoolInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch school info:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const tenantId = user?.tenant_id;
      if (!tenantId) return;
      
      const response = await api.get(`/academic-years?school_id=${tenantId}`);
      setAcademicYears(response.data || []);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
      // Use mock data if API not available
      setAcademicYears([
        {
          id: '1',
          name: 'العام الدراسي 2025-2026',
          name_en: 'Academic Year 2025-2026',
          start_date: '2025-09-01',
          end_date: '2026-06-30',
          is_current: false,
          status: 'completed',
        },
        {
          id: '2',
          name: 'العام الدراسي 2026-2027',
          name_en: 'Academic Year 2026-2027',
          start_date: '2026-09-01',
          end_date: '2027-06-30',
          is_current: true,
          status: 'active',
        },
      ]);
    }
  };

  const fetchTerms = async () => {
    try {
      const tenantId = user?.tenant_id;
      if (!tenantId) return;
      
      const response = await api.get(`/terms?school_id=${tenantId}`);
      setTerms(response.data || []);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      // Use mock data
      setTerms([
        {
          id: '1',
          name: 'الفصل الدراسي الأول',
          name_en: 'First Semester',
          academic_year_id: '2',
          start_date: '2026-09-01',
          end_date: '2027-01-15',
          is_current: true,
        },
        {
          id: '2',
          name: 'الفصل الدراسي الثاني',
          name_en: 'Second Semester',
          academic_year_id: '2',
          start_date: '2027-02-01',
          end_date: '2027-06-30',
          is_current: false,
        },
      ]);
    }
  };

  const fetchGradeLevels = async () => {
    try {
      const tenantId = user?.tenant_id;
      if (!tenantId) return;
      
      const response = await api.get(`/grade-levels?school_id=${tenantId}`);
      setGradeLevels(response.data || []);
    } catch (error) {
      console.error('Failed to fetch grade levels:', error);
      // Use mock data
      setGradeLevels([
        { id: '1', name: 'الصف الأول', name_en: 'Grade 1', order: 1, is_active: true },
        { id: '2', name: 'الصف الثاني', name_en: 'Grade 2', order: 2, is_active: true },
        { id: '3', name: 'الصف الثالث', name_en: 'Grade 3', order: 3, is_active: true },
        { id: '4', name: 'الصف الرابع', name_en: 'Grade 4', order: 4, is_active: true },
        { id: '5', name: 'الصف الخامس', name_en: 'Grade 5', order: 5, is_active: true },
        { id: '6', name: 'الصف السادس', name_en: 'Grade 6', order: 6, is_active: true },
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSchoolInfo(),
        fetchAcademicYears(),
        fetchTerms(),
        fetchGradeLevels(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleSaveSchoolInfo = async () => {
    setSaving(true);
    try {
      await api.put(`/schools/${user?.tenant_id}`, schoolInfo);
      toast.success(isRTL ? 'تم حفظ معلومات المدرسة' : 'School info saved');
    } catch (error) {
      toast.error(isRTL ? 'فشل حفظ المعلومات' : 'Failed to save info');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademicYear = async () => {
    setSaving(true);
    try {
      if (editingAcademicYear) {
        await api.put(`/academic-years/${editingAcademicYear.id}`, newAcademicYear);
        toast.success(isRTL ? 'تم تحديث العام الدراسي' : 'Academic year updated');
      } else {
        await api.post('/academic-years', { ...newAcademicYear, school_id: user?.tenant_id });
        toast.success(isRTL ? 'تم إنشاء العام الدراسي' : 'Academic year created');
      }
      setShowAcademicYearDialog(false);
      setEditingAcademicYear(null);
      setNewAcademicYear({ name: '', name_en: '', start_date: '', end_date: '', is_current: false });
      fetchAcademicYears();
    } catch (error) {
      toast.error(isRTL ? 'فشل في الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTerm = async () => {
    setSaving(true);
    try {
      if (editingTerm) {
        await api.put(`/terms/${editingTerm.id}`, newTerm);
        toast.success(isRTL ? 'تم تحديث الفصل الدراسي' : 'Term updated');
      } else {
        await api.post('/terms', { ...newTerm, school_id: user?.tenant_id });
        toast.success(isRTL ? 'تم إنشاء الفصل الدراسي' : 'Term created');
      }
      setShowTermDialog(false);
      setEditingTerm(null);
      setNewTerm({ name: '', name_en: '', academic_year_id: '', start_date: '', end_date: '', is_current: false });
      fetchTerms();
    } catch (error) {
      toast.error(isRTL ? 'فشل في الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { type, id } = deleteDialog;
      if (type === 'academic-year') {
        await api.delete(`/academic-years/${id}`);
        fetchAcademicYears();
      } else if (type === 'term') {
        await api.delete(`/terms/${id}`);
        fetchTerms();
      } else if (type === 'grade') {
        await api.delete(`/grade-levels/${id}`);
        fetchGradeLevels();
      }
      toast.success(isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully');
    } catch (error) {
      toast.error(isRTL ? 'فشل الحذف' : 'Failed to delete');
    } finally {
      setDeleteDialog({ open: false, type: '', id: '' });
    }
  };

  const dayLabels = {
    sunday: { ar: 'الأحد', en: 'Sunday' },
    monday: { ar: 'الإثنين', en: 'Monday' },
    tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
    wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
    thursday: { ar: 'الخميس', en: 'Thursday' },
    friday: { ar: 'الجمعة', en: 'Friday' },
    saturday: { ar: 'السبت', en: 'Saturday' },
  };

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
      <div className="min-h-screen bg-background" data-testid="school-settings-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'إعدادات المدرسة' : 'School Settings'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة إعدادات المدرسة والعام الدراسي' : 'Manage school settings and academic year'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="school-info" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-school-info">
                <School className="h-4 w-4 me-2" />
                {isRTL ? 'معلومات المدرسة' : 'School Info'}
              </TabsTrigger>
              <TabsTrigger value="academic-year" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-academic-year">
                <Calendar className="h-4 w-4 me-2" />
                {isRTL ? 'العام الدراسي' : 'Academic Year'}
              </TabsTrigger>
              <TabsTrigger value="grade-levels" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-grade-levels">
                <GraduationCap className="h-4 w-4 me-2" />
                {isRTL ? 'المراحل الدراسية' : 'Grade Levels'}
              </TabsTrigger>
              <TabsTrigger value="schedule-settings" className="rounded-lg data-[state=active]:bg-background" data-testid="tab-schedule-settings">
                <Clock className="h-4 w-4 me-2" />
                {isRTL ? 'إعدادات الجدول' : 'Schedule Settings'}
              </TabsTrigger>
            </TabsList>

            {/* School Info Tab */}
            <TabsContent value="school-info" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Building className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم المدرسة (عربي)' : 'School Name (Arabic)'}</Label>
                      <Input
                        value={schoolInfo.name}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                        className="rounded-xl"
                        data-testid="school-name-ar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم المدرسة (إنجليزي)' : 'School Name (English)'}</Label>
                      <Input
                        value={schoolInfo.name_en}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, name_en: e.target.value })}
                        className="rounded-xl"
                        data-testid="school-name-en"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input
                        type="email"
                        value={schoolInfo.email}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                        className="rounded-xl"
                        data-testid="school-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
                      <Input
                        value={schoolInfo.phone}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                        className="rounded-xl"
                        data-testid="school-phone"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{isRTL ? 'العنوان' : 'Address'}</Label>
                      <Textarea
                        value={schoolInfo.address}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                        className="rounded-xl"
                        data-testid="school-address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'المدينة' : 'City'}</Label>
                      <Input
                        value={schoolInfo.city}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, city: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'المنطقة' : 'Region'}</Label>
                      <Input
                        value={schoolInfo.region}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSchoolInfo} disabled={saving} className="bg-brand-navy rounded-xl" data-testid="save-school-info">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                      {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Year Tab */}
            <TabsContent value="academic-year" className="space-y-6">
              {/* Academic Years */}
              <Card className="card-nassaq">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-cairo flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-brand-turquoise" />
                      {isRTL ? 'الأعوام الدراسية' : 'Academic Years'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'إدارة الأعوام الدراسية' : 'Manage academic years'}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAcademicYearDialog(true)} className="bg-brand-turquoise rounded-xl" data-testid="add-academic-year">
                    <Plus className="h-4 w-4 me-2" />
                    {isRTL ? 'عام جديد' : 'New Year'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'العام الدراسي' : 'Academic Year'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ البداية' : 'Start Date'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ النهاية' : 'End Date'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicYears.map((year) => (
                        <TableRow key={year.id}>
                          <TableCell className="font-medium">
                            {isRTL ? year.name : year.name_en}
                          </TableCell>
                          <TableCell>{year.start_date}</TableCell>
                          <TableCell>{year.end_date}</TableCell>
                          <TableCell>
                            {year.is_current ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                <CheckCircle className="h-3 w-3 me-1" />
                                {isRTL ? 'حالي' : 'Current'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {isRTL ? 'منتهي' : 'Completed'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingAcademicYear(year);
                                  setNewAcademicYear(year);
                                  setShowAcademicYearDialog(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteDialog({ open: true, type: 'academic-year', id: year.id })}
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Terms/Semesters */}
              <Card className="card-nassaq">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-cairo flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-brand-purple" />
                      {isRTL ? 'الفصول الدراسية' : 'Terms/Semesters'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'إدارة الفصول الدراسية لكل عام' : 'Manage terms for each academic year'}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowTermDialog(true)} className="bg-brand-purple rounded-xl" data-testid="add-term">
                    <Plus className="h-4 w-4 me-2" />
                    {isRTL ? 'فصل جديد' : 'New Term'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'الفصل الدراسي' : 'Term'}</TableHead>
                        <TableHead>{isRTL ? 'العام الدراسي' : 'Academic Year'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ البداية' : 'Start Date'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ النهاية' : 'End Date'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {terms.map((term) => (
                        <TableRow key={term.id}>
                          <TableCell className="font-medium">
                            {isRTL ? term.name : term.name_en}
                          </TableCell>
                          <TableCell>
                            {academicYears.find(y => y.id === term.academic_year_id)?.[isRTL ? 'name' : 'name_en'] || '-'}
                          </TableCell>
                          <TableCell>{term.start_date}</TableCell>
                          <TableCell>{term.end_date}</TableCell>
                          <TableCell>
                            {term.is_current ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                <CheckCircle className="h-3 w-3 me-1" />
                                {isRTL ? 'حالي' : 'Current'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {isRTL ? 'قادم' : 'Upcoming'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTerm(term);
                                  setNewTerm(term);
                                  setShowTermDialog(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteDialog({ open: true, type: 'term', id: term.id })}
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Grade Levels Tab */}
            <TabsContent value="grade-levels" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-cairo flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-turquoise" />
                      {isRTL ? 'المراحل الدراسية' : 'Grade Levels'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'إدارة الصفوف والمراحل الدراسية' : 'Manage grade levels and stages'}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowGradeDialog(true)} className="bg-brand-turquoise rounded-xl" data-testid="add-grade">
                    <Plus className="h-4 w-4 me-2" />
                    {isRTL ? 'صف جديد' : 'New Grade'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gradeLevels.map((grade) => (
                      <Card key={grade.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-brand-turquoise/10 flex items-center justify-center">
                                <span className="text-lg font-bold text-brand-turquoise">{grade.order}</span>
                              </div>
                              <div>
                                <p className="font-medium">{isRTL ? grade.name : grade.name_en}</p>
                                <p className="text-xs text-muted-foreground">{!isRTL ? grade.name : grade.name_en}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={grade.is_active} />
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Settings Tab */}
            <TabsContent value="schedule-settings" className="space-y-6">
              {/* Working Days */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'أيام العمل' : 'Working Days'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'تحديد أيام الدوام المدرسي' : 'Configure school working days'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {Object.entries(dayLabels).map(([day, labels]) => (
                      <div
                        key={day}
                        className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                          workingDays[day]
                            ? 'border-brand-turquoise bg-brand-turquoise/10'
                            : 'border-muted bg-muted/30'
                        }`}
                        onClick={() => setWorkingDays({ ...workingDays, [day]: !workingDays[day] })}
                      >
                        <div className="text-center">
                          <p className="font-medium">{isRTL ? labels.ar : labels.en}</p>
                          <div className="mt-2">
                            {workingDays[day] ? (
                              <CheckCircle className="h-5 w-5 mx-auto text-brand-turquoise" />
                            ) : (
                              <div className="h-5 w-5 mx-auto rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* School Timings */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-purple" />
                    {isRTL ? 'أوقات الدوام' : 'School Timings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'بداية الدوام' : 'School Start'}</Label>
                      <Input
                        type="time"
                        value={schoolTimings.school_start}
                        onChange={(e) => setSchoolTimings({ ...schoolTimings, school_start: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'نهاية الدوام' : 'School End'}</Label>
                      <Input
                        type="time"
                        value={schoolTimings.school_end}
                        onChange={(e) => setSchoolTimings({ ...schoolTimings, school_end: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'مدة الحصة (دقيقة)' : 'Period Duration (min)'}</Label>
                      <Input
                        type="number"
                        value={schoolTimings.period_duration}
                        onChange={(e) => setSchoolTimings({ ...schoolTimings, period_duration: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'مدة الاستراحة (دقيقة)' : 'Break Duration (min)'}</Label>
                      <Input
                        type="number"
                        value={schoolTimings.break_duration}
                        onChange={(e) => setSchoolTimings({ ...schoolTimings, break_duration: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-brand-navy rounded-xl" data-testid="save-schedule-settings">
                      <Save className="h-4 w-4 me-2" />
                      {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Academic Year Dialog */}
        <Dialog open={showAcademicYearDialog} onOpenChange={setShowAcademicYearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {editingAcademicYear ? (isRTL ? 'تعديل العام الدراسي' : 'Edit Academic Year') : (isRTL ? 'عام دراسي جديد' : 'New Academic Year')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={newAcademicYear.name}
                    onChange={(e) => setNewAcademicYear({ ...newAcademicYear, name: e.target.value })}
                    placeholder="العام الدراسي 2026-2027"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={newAcademicYear.name_en}
                    onChange={(e) => setNewAcademicYear({ ...newAcademicYear, name_en: e.target.value })}
                    placeholder="Academic Year 2026-2027"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'تاريخ البداية' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={newAcademicYear.start_date}
                    onChange={(e) => setNewAcademicYear({ ...newAcademicYear, start_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'تاريخ النهاية' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={newAcademicYear.end_date}
                    onChange={(e) => setNewAcademicYear({ ...newAcademicYear, end_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newAcademicYear.is_current}
                  onCheckedChange={(checked) => setNewAcademicYear({ ...newAcademicYear, is_current: checked })}
                />
                <Label>{isRTL ? 'العام الدراسي الحالي' : 'Current Academic Year'}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAcademicYearDialog(false)} className="rounded-xl">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSaveAcademicYear} disabled={saving} className="bg-brand-navy rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Term Dialog */}
        <Dialog open={showTermDialog} onOpenChange={setShowTermDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {editingTerm ? (isRTL ? 'تعديل الفصل الدراسي' : 'Edit Term') : (isRTL ? 'فصل دراسي جديد' : 'New Term')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={newTerm.name}
                    onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })}
                    placeholder="الفصل الدراسي الأول"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={newTerm.name_en}
                    onChange={(e) => setNewTerm({ ...newTerm, name_en: e.target.value })}
                    placeholder="First Semester"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{isRTL ? 'العام الدراسي' : 'Academic Year'}</Label>
                  <Select
                    value={newTerm.academic_year_id}
                    onValueChange={(v) => setNewTerm({ ...newTerm, academic_year_id: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={isRTL ? 'اختر العام الدراسي' : 'Select Academic Year'} />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {isRTL ? year.name : year.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'تاريخ البداية' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={newTerm.start_date}
                    onChange={(e) => setNewTerm({ ...newTerm, start_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'تاريخ النهاية' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={newTerm.end_date}
                    onChange={(e) => setNewTerm({ ...newTerm, end_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newTerm.is_current}
                  onCheckedChange={(checked) => setNewTerm({ ...newTerm, is_current: checked })}
                />
                <Label>{isRTL ? 'الفصل الدراسي الحالي' : 'Current Term'}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTermDialog(false)} className="rounded-xl">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSaveTerm} disabled={saving} className="bg-brand-navy rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-cairo">
                {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL 
                  ? 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 rounded-xl">
                {isRTL ? 'حذف' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};

export default SchoolSettingsPage;
