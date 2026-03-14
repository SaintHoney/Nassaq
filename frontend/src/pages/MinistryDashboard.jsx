import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { School, Users, GraduationCap, BarChart3, CheckCircle, ArrowLeftRight } from 'lucide-react';

const MinistryDashboard = () => {
  const { user, api } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('attendance');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, compRes, compliRes] = await Promise.all([
        api.get('/ministry/dashboard').catch(() => ({ data: { overview: {}, schools: [], compliance: {} } })),
        api.get(`/ministry/schools-comparison?metric=${selectedMetric}`).catch(() => ({ data: { schools: [] } })),
        api.get('/ministry/compliance-report').catch(() => ({ data: { schools: [] } }))
      ]);
      setDashboard(dashRes.data);
      setComparison(compRes.data);
      setCompliance(compliRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api, selectedMetric]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C3D74]"></div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const stats = [
    { label: 'المدارس', value: overview.total_schools || 0, icon: School, color: 'bg-[#1C3D74]' },
    { label: 'الطلاب', value: overview.total_students || 0, icon: Users, color: 'bg-[#615090]' },
    { label: 'المعلمون', value: overview.total_teachers || 0, icon: GraduationCap, color: 'bg-[#46C1BE]' },
    { label: 'نسبة الحضور', value: `${overview.overall_attendance_rate || 0}%`, icon: BarChart3, color: 'bg-green-500' },
  ];

  const metrics = [
    { value: 'attendance', label: 'الحضور' },
    { value: 'grades', label: 'الدرجات' },
    { value: 'behavior', label: 'السلوك' },
    { value: 'students', label: 'عدد الطلاب' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1C3D74] rounded-xl flex items-center justify-center">
            <School className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C3D74]" style={{ fontFamily: 'Cairo' }}>
              لوحة ممثل الوزارة
            </h1>
            <p className="text-sm text-slate-500">مرحباً {user?.full_name} · نظرة شاملة على المدارس</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#1C3D74] mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-[#1C3D74] mb-4">تفاصيل المدارس</h2>
            <div className="space-y-3">
              {(dashboard?.schools || []).map(school => (
                <div key={school.school_id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#1C3D74]">{school.school_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {school.status === 'active' ? 'نشط' : school.status}
                    </span>
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
                <p className="text-center text-slate-400 py-4">لا توجد مدارس مسجلة</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1C3D74] flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" />
                مقارنة المدارس
              </h2>
              <select
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#46C1BE]"
              >
                {metrics.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              {(comparison?.schools || []).map((school, i) => (
                <div key={school.school_id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'
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
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-[#46C1BE] h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(school.value || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!comparison?.schools || comparison.schools.length === 0) && (
                <p className="text-center text-slate-400 py-4">لا توجد بيانات للمقارنة</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#1C3D74] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            تقرير الامتثال
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-right py-2 px-3">المدرسة</th>
                  <th className="text-right py-2 px-3">الإعدادات</th>
                  <th className="text-right py-2 px-3">الجدول</th>
                  <th className="text-right py-2 px-3">المعلمون</th>
                  <th className="text-right py-2 px-3">الطلاب</th>
                  <th className="text-right py-2 px-3">اكتمال البيانات</th>
                  <th className="text-right py-2 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {(compliance?.schools || []).map(school => (
                  <tr key={school.school_id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{school.school_name}</td>
                    <td className="py-2 px-3">
                      {school.has_settings ? (
                        <CheckCircle className="text-green-500 w-4 h-4" />
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {school.has_schedule ? (
                        <CheckCircle className="text-green-500 w-4 h-4" />
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{school.teacher_count}</td>
                    <td className="py-2 px-3">{school.student_count}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${school.data_completeness >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${school.data_completeness}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{school.data_completeness}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
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
      </div>
    </div>
  );
};

export default MinistryDashboard;
