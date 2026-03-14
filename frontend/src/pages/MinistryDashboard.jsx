import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  School, Users, GraduationCap, BarChart3, CheckCircle, ArrowLeftRight,
  TrendingUp, BookOpen, Brain, Target, Bell, Settings, MapPin,
  Award, AlertTriangle, Activity, FileText, ChevronDown, ChevronUp,
  UserCheck, ClipboardList
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
  { id: 'schools', label: 'المدارس', icon: School },
  { id: 'academic', label: 'النشاط الأكاديمي', icon: BookOpen },
  { id: 'teachers', label: 'أداء المعلمين', icon: UserCheck },
  { id: 'students', label: 'أداء الطلاب', icon: GraduationCap },
  { id: 'compliance', label: 'الامتثال', icon: CheckCircle },
  { id: 'comparison', label: 'مقارنة الأداء', icon: ArrowLeftRight },
  { id: 'kpis', label: 'المؤشرات الاستراتيجية', icon: Target },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'insights', label: 'رؤى ذكية', icon: Brain },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

const StatCard = ({ label, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-[#1C3D74] mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="text-white w-5 h-5" />
      </div>
    </div>
  </div>
);

const KpiGauge = ({ kpi }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  const barColors = {
    good: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    info: 'bg-blue-500',
  };
  const cls = statusColors[kpi.status] || statusColors.info;
  const barCls = barColors[kpi.status] || barColors.info;
  const pct = kpi.target ? Math.min((kpi.value / kpi.target) * 100, 100) : 100;

  return (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{kpi.label}</p>
        <span className="text-2xl font-bold">{kpi.value}{kpi.unit}</span>
      </div>
      {kpi.target && (
        <>
          <div className="w-full bg-white/60 rounded-full h-2 mb-1">
            <div className={`${barCls} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs opacity-70">الهدف: {kpi.target}{kpi.unit}</p>
        </>
      )}
    </div>
  );
};

const MinistryDashboard = () => {
  const { user, api } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [teacherPerf, setTeacherPerf] = useState(null);
  const [studentPerf, setStudentPerf] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('attendance');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, compRes, compliRes, teachRes, studRes, acadRes, kpiRes] = await Promise.all([
        api.get('/ministry/dashboard').catch(() => ({ data: { overview: {}, schools: [], compliance: {} } })),
        api.get(`/ministry/schools-comparison?metric=${selectedMetric}`).catch(() => ({ data: { schools: [] } })),
        api.get('/ministry/compliance-report').catch(() => ({ data: { schools: [] } })),
        api.get('/ministry/teacher-performance').catch(() => ({ data: { total_teachers: 0, schools: [] } })),
        api.get('/ministry/student-performance').catch(() => ({ data: { total_students: 0, schools: [] } })),
        api.get('/ministry/academic-activity').catch(() => ({ data: {} })),
        api.get('/ministry/strategic-kpis').catch(() => ({ data: { kpis: [] } })),
      ]);
      setDashboard(dashRes.data);
      setComparison(compRes.data);
      setCompliance(compliRes.data);
      setTeacherPerf(teachRes.data);
      setStudentPerf(studRes.data);
      setAcademic(acadRes.data);
      setKpis(kpiRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api, selectedMetric]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/reports/export/csv?report_type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `nassaq_${type}_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C3D74] mx-auto mb-4"></div>
          <p className="text-slate-500" style={{ fontFamily: 'Cairo' }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const metrics = [
    { value: 'attendance', label: 'الحضور' },
    { value: 'grades', label: 'الدرجات' },
    { value: 'behavior', label: 'السلوك' },
    { value: 'students', label: 'عدد الطلاب' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="المدارس" value={overview.total_schools || 0} icon={School} color="bg-[#1C3D74]" />
        <StatCard label="الطلاب" value={overview.total_students || 0} icon={Users} color="bg-[#615090]" />
        <StatCard label="المعلمون" value={overview.total_teachers || 0} icon={GraduationCap} color="bg-[#46C1BE]" />
        <StatCard label="نسبة الحضور" value={`${overview.overall_attendance_rate || 0}%`} icon={BarChart3} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="الفصول" value={overview.total_classes || 0} icon={BookOpen} color="bg-indigo-500" />
        <StatCard label="التقييمات" value={academic?.total_assessments || 0} icon={ClipboardList} color="bg-purple-500" />
        <StatCard label="سجلات السلوك" value={academic?.total_behavior_records || 0} icon={Award} color="bg-orange-500" />
        <StatCard label="الدرجات المسجلة" value={academic?.total_grades_entered || 0} icon={TrendingUp} color="bg-teal-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-lg font-bold text-[#1C3D74] mb-4">ملخص سريع</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-600">{dashboard?.compliance?.curriculum_aligned || 0}</p>
            <p className="text-sm text-green-700 mt-1">مدارس متوافقة مع المنهج</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-3xl font-bold text-blue-600">{dashboard?.compliance?.reporting_on_time || 0}</p>
            <p className="text-sm text-blue-700 mt-1">تقارير في الوقت المحدد</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-3xl font-bold text-purple-600">{dashboard?.compliance?.data_quality_score || 0}%</p>
            <p className="text-sm text-purple-700 mt-1">جودة البيانات</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchools = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1C3D74] flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            تفاصيل المدارس
          </h2>
          <span className="text-sm text-slate-500">{(dashboard?.schools || []).length} مدرسة</span>
        </div>
        <div className="space-y-3">
          {(dashboard?.schools || []).map(school => (
            <div key={school.school_id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#1C3D74]">{school.school_name}</h3>
                <div className="flex items-center gap-2">
                  {school.city && <span className="text-xs text-slate-400">{school.city}</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {school.status === 'active' ? 'نشط' : school.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg">
                  <p className="text-lg font-bold text-[#1C3D74]">{school.students}</p>
                  <p className="text-slate-500">طلاب</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <p className="text-lg font-bold text-[#1C3D74]">{school.teachers}</p>
                  <p className="text-slate-500">معلمون</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <p className="text-lg font-bold text-[#1C3D74]">{school.classes}</p>
                  <p className="text-slate-500">فصول</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{school.attendance_rate}%</p>
                  <p className="text-slate-500">حضور</p>
                </div>
              </div>
            </div>
          ))}
          {(!dashboard?.schools || dashboard.schools.length === 0) && (
            <p className="text-center text-slate-400 py-8">لا توجد مدارس مسجلة</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي التقييمات" value={academic?.total_assessments || 0} icon={ClipboardList} color="bg-[#1C3D74]" />
        <StatCard label="سجلات الحضور" value={academic?.total_attendance_records || 0} icon={UserCheck} color="bg-[#615090]" />
        <StatCard label="سجلات السلوك" value={academic?.total_behavior_records || 0} icon={Award} color="bg-[#46C1BE]" />
        <StatCard label="الدرجات المسجلة" value={academic?.total_grades_entered || 0} icon={TrendingUp} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            النشاط خلال 7 أيام
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm text-blue-700">سجلات حضور جديدة</span>
              <span className="text-xl font-bold text-blue-600">{academic?.recent_attendance_7d || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm text-purple-700">سجلات سلوك جديدة</span>
              <span className="text-xl font-bold text-purple-600">{academic?.recent_behavior_7d || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            أكثر المواد نشاطاً
          </h3>
          <div className="space-y-2">
            {(academic?.top_subjects || []).map((subj, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1C3D74] text-white text-xs rounded-full flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm">{subj.subject}</span>
                </div>
                <span className="text-sm font-bold text-[#1C3D74]">{subj.count} تقييم</span>
              </div>
            ))}
            {(!academic?.top_subjects || academic.top_subjects.length === 0) && (
              <p className="text-center text-slate-400 py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="إجمالي المعلمين" value={teacherPerf?.total_teachers || 0} icon={Users} color="bg-[#1C3D74]" />
        <StatCard label="متوسط نسبة طلاب/معلم" value={teacherPerf?.avg_student_teacher_ratio || 0} icon={BarChart3} color="bg-[#615090]" subtitle="طالب لكل معلم" />
        <StatCard label="المدارس" value={(teacherPerf?.schools || []).length} icon={School} color="bg-[#46C1BE]" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-lg font-bold text-[#1C3D74] mb-4">أداء المعلمين حسب المدرسة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="text-right py-3 px-3">المدرسة</th>
                <th className="text-right py-3 px-3">المعلمون</th>
                <th className="text-right py-3 px-3">نسبة الطلاب/المعلم</th>
                <th className="text-right py-3 px-3">معلمون مُعيّنون</th>
                <th className="text-right py-3 px-3">غير مُعيّنين</th>
              </tr>
            </thead>
            <tbody>
              {(teacherPerf?.schools || []).map(school => (
                <tr key={school.school_id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium">{school.school_name}</td>
                  <td className="py-3 px-3">{school.teacher_count}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      school.student_teacher_ratio <= 25 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {school.student_teacher_ratio}:1
                    </span>
                  </td>
                  <td className="py-3 px-3 text-green-600">{school.assigned_teachers}</td>
                  <td className="py-3 px-3">
                    {school.unassigned_teachers > 0 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {school.unassigned_teachers}
                      </span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="إجمالي الطلاب" value={studentPerf?.total_students || 0} icon={Users} color="bg-[#1C3D74]" />
        <StatCard label="نسبة النجاح العامة" value={`${studentPerf?.overall_pass_rate || 0}%`} icon={TrendingUp} color="bg-green-500" />
        <StatCard label="المدارس" value={(studentPerf?.schools || []).length} icon={School} color="bg-[#46C1BE]" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-lg font-bold text-[#1C3D74] mb-4">أداء الطلاب حسب المدرسة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="text-right py-3 px-3">المدرسة</th>
                <th className="text-right py-3 px-3">الطلاب</th>
                <th className="text-right py-3 px-3">متوسط الدرجات</th>
                <th className="text-right py-3 px-3">نسبة النجاح</th>
                <th className="text-right py-3 px-3">سلوك إيجابي</th>
                <th className="text-right py-3 px-3">سلوك سلبي</th>
              </tr>
            </thead>
            <tbody>
              {(studentPerf?.schools || []).map(school => (
                <tr key={school.school_id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium">{school.school_name}</td>
                  <td className="py-3 px-3">{school.student_count}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      school.avg_score >= 70 ? 'bg-green-100 text-green-700' : school.avg_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {school.avg_score}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[80px]">
                        <div className={`h-2 rounded-full ${school.pass_rate >= 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${school.pass_rate}%` }} />
                      </div>
                      <span className="text-xs">{school.pass_rate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-green-600">{school.positive_behavior}</td>
                  <td className="py-3 px-3 text-red-500">{school.negative_behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        تقرير الامتثال والمراقبة التنظيمية
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b">
              <th className="text-right py-3 px-3">المدرسة</th>
              <th className="text-right py-3 px-3">الإعدادات</th>
              <th className="text-right py-3 px-3">الجدول</th>
              <th className="text-right py-3 px-3">المعلمون</th>
              <th className="text-right py-3 px-3">الطلاب</th>
              <th className="text-right py-3 px-3">اكتمال البيانات</th>
              <th className="text-right py-3 px-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {(compliance?.schools || []).map(school => (
              <tr key={school.school_id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-3 font-medium">{school.school_name}</td>
                <td className="py-3 px-3">
                  {school.has_settings ? <CheckCircle className="text-green-500 w-4 h-4" /> : <span className="text-red-500 font-bold">✗</span>}
                </td>
                <td className="py-3 px-3">
                  {school.has_schedule ? <CheckCircle className="text-green-500 w-4 h-4" /> : <span className="text-red-500 font-bold">✗</span>}
                </td>
                <td className="py-3 px-3">{school.teacher_count}</td>
                <td className="py-3 px-3">{school.student_count}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${school.data_completeness >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${school.data_completeness}%` }} />
                    </div>
                    <span className="text-xs">{school.data_completeness}%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    school.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {school.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#1C3D74] flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          مقارنة الأداء بين المدارس
        </h2>
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#46C1BE] bg-white"
        >
          {metrics.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {(comparison?.schools || []).map((school, i) => (
          <div key={school.school_id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-300'
            }`}>
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{school.school_name}</span>
                <span className="text-[#1C3D74] font-bold">
                  {typeof school.value === 'number' && school.value <= 100 ? `${school.value}%` : school.value}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-l from-[#46C1BE] to-[#1C3D74] h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(school.value || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {(!comparison?.schools || comparison.schools.length === 0) && (
          <p className="text-center text-slate-400 py-8">لا توجد بيانات للمقارنة</p>
        )}
      </div>
    </div>
  );

  const renderKpis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          لوحة المؤشرات الاستراتيجية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(kpis?.kpis || []).map(kpi => (
            <KpiGauge key={kpi.key} kpi={kpi} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => {
    const reportTypes = [
      { type: 'students', label: 'تقرير الطلاب', icon: Users, desc: 'بيانات جميع الطلاب المسجلين' },
      { type: 'teachers', label: 'تقرير المعلمين', icon: GraduationCap, desc: 'بيانات جميع المعلمين والتخصصات' },
      { type: 'attendance', label: 'تقرير الحضور', icon: UserCheck, desc: 'سجلات الحضور والغياب' },
      { type: 'grades', label: 'تقرير الدرجات', icon: TrendingUp, desc: 'درجات التقييمات والاختبارات' },
    ];

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            مولد التقارير الرسمية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map(r => (
              <div key={r.type} className="p-4 border border-slate-200 rounded-xl hover:border-[#46C1BE] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1C3D74] rounded-lg flex items-center justify-center flex-shrink-0">
                    <r.icon className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1C3D74]">{r.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
                    <button
                      onClick={() => handleExport(r.type)}
                      className="mt-3 px-4 py-1.5 bg-[#46C1BE] text-white text-sm rounded-lg hover:bg-[#3aa8a5] transition-colors"
                    >
                      تصدير CSV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          رؤى مدعومة بالذكاء الاصطناعي
        </h2>
        <div className="space-y-3">
          {(kpis?.kpis || []).filter(k => k.status === 'warning' || k.status === 'critical').length > 0 ? (
            (kpis?.kpis || []).filter(k => k.status === 'warning' || k.status === 'critical').map(kpi => (
              <div key={kpi.key} className={`p-4 rounded-xl border ${kpi.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${kpi.status === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{kpi.label}: {kpi.value}{kpi.unit}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {kpi.status === 'critical' ? 'يحتاج تدخل فوري' : 'يحتاج متابعة'} — الهدف: {kpi.target}{kpi.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-700">جميع المؤشرات ضمن المعدل الطبيعي</p>
              <p className="text-xs text-green-600 mt-1">لا توجد تنبيهات حالياً</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-[#1C3D74] mb-3">توصيات النظام</h3>
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2">
            <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>مراجعة المدارس التي لم تكتمل إعداداتها لضمان جاهزيتها للفصل الدراسي</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-sm text-purple-700 flex items-start gap-2">
            <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>متابعة المعلمين غير المعيّنين لفصول لضمان تغطية كاملة للمنهج</span>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-sm text-teal-700 flex items-start gap-2">
            <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>تحليل أداء الطلاب في المواد ذات نسب النجاح المنخفضة لتحديد نقاط الضعف</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        إشعارات النظام
      </h2>
      <div className="space-y-3">
        {(compliance?.schools || []).filter(s => s.status !== 'مكتمل').length > 0 ? (
          (compliance?.schools || []).filter(s => s.status !== 'مكتمل').map(school => (
            <div key={school.school_id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-amber-800">{school.school_name}</p>
                <p className="text-xs text-amber-600 mt-1">لم تكتمل إعدادات المدرسة - اكتمال البيانات: {school.data_completeness}%</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        إعدادات الحساب
      </h2>
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">الاسم</label>
              <p className="font-medium text-[#1C3D74]">{user?.full_name || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">البريد الإلكتروني</label>
              <p className="font-medium text-[#1C3D74]">{user?.email || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">الدور</label>
              <p className="font-medium text-[#1C3D74]">ممثل الوزارة</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">اللغة</label>
              <p className="font-medium text-[#1C3D74]">العربية</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent = {
    overview: renderOverview,
    schools: renderSchools,
    academic: renderAcademic,
    teachers: renderTeachers,
    students: renderStudents,
    compliance: renderCompliance,
    comparison: renderComparison,
    kpis: renderKpis,
    reports: renderReports,
    insights: renderInsights,
    notifications: renderNotifications,
    settings: renderSettings,
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1C3D74] rounded-xl flex items-center justify-center">
                <School className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1C3D74]" style={{ fontFamily: 'Cairo' }}>
                  لوحة ممثل الوزارة
                </h1>
                <p className="text-xs text-slate-500">مرحباً {user?.full_name}</p>
              </div>
            </div>
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
            <nav className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 sticky top-20 space-y-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isActive ? 'bg-[#1C3D74] text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {tabContent[activeTab]?.()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MinistryDashboard;
