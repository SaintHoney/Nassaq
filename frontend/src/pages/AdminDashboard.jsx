import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useTranslation } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Sun,
  Moon,
  Globe,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export const AdminDashboard = () => {
  const { user, api, logout } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    name_en: '',
    code: '',
    email: '',
    phone: '',
    city: '',
    student_capacity: 500,
  });

  const fetchData = async () => {
    try {
      const [statsRes, schoolsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/schools'),
      ]);
      setStats(statsRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchool = async () => {
    try {
      const response = await api.post('/schools', newSchool);
      toast.success(isRTL ? 'تم إنشاء المدرسة بنجاح' : 'School created successfully');
      setCreateDialogOpen(false);
      setNewSchool({
        name: '',
        name_en: '',
        code: '',
        email: '',
        phone: '',
        city: '',
        student_capacity: 500,
      });
      // Immediately update schools list with the new school
      setSchools(prev => [...prev, response.data]);
      // Also refresh stats
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل إنشاء المدرسة' : 'Failed to create school'));
    }
  };

  const handleStatusChange = async (schoolId, status) => {
    try {
      await api.put(`/schools/${schoolId}/status?status=${status}`);
      toast.success(isRTL ? 'تم تحديث حالة المدرسة' : 'School status updated');
      fetchData();
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  };

  const statCards = [
    {
      title: isRTL ? 'إجمالي المدارس' : 'Total Schools',
      value: stats?.total_schools || 0,
      icon: Building2,
      color: 'brand-navy',
      trend: '+12%',
    },
    {
      title: isRTL ? 'إجمالي الطلاب' : 'Total Students',
      value: stats?.total_students || 0,
      icon: GraduationCap,
      color: 'brand-turquoise',
      trend: '+8%',
    },
    {
      title: isRTL ? 'إجمالي المعلمين' : 'Total Teachers',
      value: stats?.total_teachers || 0,
      icon: UserCheck,
      color: 'brand-purple',
      trend: '+5%',
    },
    {
      title: isRTL ? 'المدارس النشطة' : 'Active Schools',
      value: stats?.active_schools || 0,
      icon: CheckCircle,
      color: 'green-500',
      trend: '+3%',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{isRTL ? 'نشطة' : 'Active'}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{isRTL ? 'معلقة' : 'Pending'}</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{isRTL ? 'موقوفة' : 'Suspended'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Sidebar>
      <div className="min-h-screen" data-testid="admin-dashboard">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold">
                {isRTL ? 'لوحة تحكم المنصة' : 'Platform Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? `مرحباً، ${user?.full_name}` : `Welcome, ${user?.full_name}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage}>
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="card-nassaq" data-testid={`stat-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>{stat.trend}</span>
                      </div>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center`}>
                      <stat.icon className={`h-7 w-7 text-${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Schools Table */}
          <Card className="card-nassaq" data-testid="schools-table-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-cairo">
                    {isRTL ? 'المدارس' : 'Schools'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'إدارة جميع المدارس في المنصة' : 'Manage all schools on the platform'}
                  </CardDescription>
                </div>
                
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-turquoise hover:bg-brand-turquoise-light rounded-xl" data-testid="add-school-btn">
                      <Plus className="h-5 w-5 me-2" />
                      {isRTL ? 'إضافة مدرسة' : 'Add School'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="font-cairo">
                        {isRTL ? 'إضافة مدرسة جديدة' : 'Add New School'}
                      </DialogTitle>
                      <DialogDescription>
                        {isRTL ? 'أدخل بيانات المدرسة الجديدة' : 'Enter the new school details'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{isRTL ? 'اسم المدرسة (عربي)' : 'School Name (Arabic)'}</Label>
                          <Input
                            value={newSchool.name}
                            onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                            placeholder={isRTL ? 'مدرسة...' : 'School...'}
                            className="rounded-xl"
                            data-testid="school-name-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isRTL ? 'اسم المدرسة (إنجليزي)' : 'School Name (English)'}</Label>
                          <Input
                            value={newSchool.name_en}
                            onChange={(e) => setNewSchool({ ...newSchool, name_en: e.target.value })}
                            placeholder="School..."
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{isRTL ? 'رمز المدرسة' : 'School Code'}</Label>
                          <Input
                            value={newSchool.code}
                            onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value })}
                            placeholder="SCH001"
                            className="rounded-xl"
                            data-testid="school-code-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                          <Input
                            type="email"
                            value={newSchool.email}
                            onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                            placeholder="school@example.com"
                            className="rounded-xl"
                            data-testid="school-email-input"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{isRTL ? 'الهاتف' : 'Phone'}</Label>
                          <Input
                            value={newSchool.phone}
                            onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                            placeholder="+966..."
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isRTL ? 'المدينة' : 'City'}</Label>
                          <Input
                            value={newSchool.city}
                            onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                            placeholder={isRTL ? 'الرياض' : 'Riyadh'}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>{isRTL ? 'سعة الطلاب' : 'Student Capacity'}</Label>
                        <Input
                          type="number"
                          value={newSchool.student_capacity}
                          onChange={(e) => setNewSchool({ ...newSchool, student_capacity: parseInt(e.target.value) })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-xl">
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button onClick={handleCreateSchool} className="bg-brand-navy rounded-xl" data-testid="create-school-btn">
                        {isRTL ? 'إنشاء' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'بحث عن مدرسة...' : 'Search schools...'}
                    className="ps-10 rounded-xl"
                    data-testid="search-schools-input"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'المدرسة' : 'School'}</TableHead>
                      <TableHead>{isRTL ? 'الرمز' : 'Code'}</TableHead>
                      <TableHead>{isRTL ? 'المدينة' : 'City'}</TableHead>
                      <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{isRTL ? 'الطلاب' : 'Students'}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {isRTL ? 'لا توجد مدارس حتى الآن' : 'No schools yet'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      schools.map((school) => (
                        <TableRow key={school.id} data-testid={`school-row-${school.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{school.name}</div>
                              <div className="text-sm text-muted-foreground">{school.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{school.code}</TableCell>
                          <TableCell>{school.city || '-'}</TableCell>
                          <TableCell>{getStatusBadge(school.status)}</TableCell>
                          <TableCell>
                            {school.current_students} / {school.student_capacity}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusChange(school.id, 'active')}>
                                  <CheckCircle className="h-4 w-4 me-2 text-green-600" />
                                  {isRTL ? 'تفعيل' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(school.id, 'suspended')}>
                                  <XCircle className="h-4 w-4 me-2 text-red-600" />
                                  {isRTL ? 'إيقاف' : 'Suspend'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
