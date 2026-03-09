import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Settings,
  FileText,
  AlertCircle,
  RefreshCw,
  Calendar,
  Users,
  GraduationCap,
  Building2,
} from 'lucide-react';

export const RulesManagementPage = () => {
  const { isRTL, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder rule categories
  const ruleCategories = [
    {
      id: 'attendance',
      title: isRTL ? 'قواعد الحضور والغياب' : 'Attendance Rules',
      description: isRTL ? 'إدارة قواعد تسجيل الحضور والتأخر والغياب' : 'Manage attendance, tardiness, and absence rules',
      icon: Clock,
      count: 12,
      status: 'active',
    },
    {
      id: 'grading',
      title: isRTL ? 'قواعد التقييم والدرجات' : 'Grading Rules',
      description: isRTL ? 'نظام الدرجات والتقييمات والاختبارات' : 'Grading system, assessments, and exams rules',
      icon: FileText,
      count: 8,
      status: 'active',
    },
    {
      id: 'scheduling',
      title: isRTL ? 'قواعد الجدولة' : 'Scheduling Rules',
      description: isRTL ? 'قواعد توزيع الحصص ونصاب المعلمين' : 'Class distribution and teacher workload rules',
      icon: Calendar,
      count: 15,
      status: 'active',
    },
    {
      id: 'behavior',
      title: isRTL ? 'قواعد السلوك' : 'Behavior Rules',
      description: isRTL ? 'نظام نقاط السلوك والمكافآت والعقوبات' : 'Behavior points, rewards, and penalties system',
      icon: Users,
      count: 20,
      status: 'draft',
    },
    {
      id: 'academic',
      title: isRTL ? 'القواعد الأكاديمية' : 'Academic Rules',
      description: isRTL ? 'متطلبات النجاح والانتقال بين المراحل' : 'Pass requirements and grade progression rules',
      icon: GraduationCap,
      count: 6,
      status: 'active',
    },
    {
      id: 'tenant',
      title: isRTL ? 'قواعد المدارس' : 'Tenant Rules',
      description: isRTL ? 'قواعد إنشاء وإدارة المدارس' : 'School creation and management rules',
      icon: Building2,
      count: 10,
      status: 'active',
    },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="rules-management-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'إدارة القواعد' : 'Rules Management'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة القواعد التعليمية والتشغيلية للمنصة' : 'Manage educational and operational platform rules'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button className="rounded-xl bg-brand-navy hover:bg-brand-navy/90">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'قاعدة جديدة' : 'New Rule'}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Under Development Banner */}
          <Card className="card-nassaq border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-cairo font-medium text-yellow-600">
                  {isRTL ? 'هذه الصفحة قيد التطوير' : 'This Page is Under Development'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'نعمل على إضافة ميزات إدارة القواعد قريباً. ترقبوا التحديثات!'
                    : 'We are working on adding rules management features soon. Stay tuned!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'البحث في القواعد...' : 'Search rules...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10 rounded-xl"
              />
            </div>
            <Button variant="outline" className="rounded-xl">
              <Filter className="h-4 w-4 me-2" />
              {isRTL ? 'تصفية' : 'Filter'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-brand-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold">71</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي القواعد' : 'Total Rules'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">51</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'قواعد نشطة' : 'Active Rules'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">20</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'قواعد مسودة' : 'Draft Rules'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-nassaq">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-brand-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">6</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'فئات القواعد' : 'Rule Categories'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rule Categories Grid */}
          <div>
            <h2 className="font-cairo text-xl font-bold mb-4">
              {isRTL ? 'فئات القواعد' : 'Rule Categories'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ruleCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className="card-nassaq hover:shadow-lg transition-all cursor-pointer"
                  data-testid={`rule-category-${category.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                        <category.icon className="h-6 w-6 text-brand-navy" />
                      </div>
                      <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                        {category.status === 'active' 
                          ? (isRTL ? 'نشط' : 'Active')
                          : (isRTL ? 'مسودة' : 'Draft')}
                      </Badge>
                    </div>
                    <CardTitle className="font-cairo text-lg mt-3">{category.title}</CardTitle>
                    <CardDescription className="font-tajawal">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        {category.count} {isRTL ? 'قاعدة' : 'rules'}
                      </span>
                      <Button variant="ghost" size="sm">
                        {isRTL ? 'عرض' : 'View'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
