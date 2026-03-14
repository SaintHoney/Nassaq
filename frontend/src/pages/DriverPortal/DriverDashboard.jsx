import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Bus, Users, Route, CheckCircle, MapPin, Clock } from 'lucide-react';

const DriverDashboard = () => {
  const { user, api } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, routesRes] = await Promise.all([
        api.get('/driver/dashboard').catch(() => ({ data: { total_routes: 0, total_students: 0, today_boarded: 0, routes: [], today_logs: [], alerts: [] } })),
        api.get('/driver/routes').catch(() => ({ data: [] }))
      ]);
      setDashboard(dashRes.data);
      setRoutes(routesRes.data);
      if (routesRes.data.length > 0) setSelectedRoute(routesRes.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBoardStudent = async (studentId, routeId) => {
    try {
      await api.post('/driver/bus-attendance', {
        student_id: studentId,
        route_id: routeId,
        status: 'boarded',
        direction: 'to_school'
      });
      toast.success('تم تسجيل صعود الطالب');
      fetchData();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C3D74]"></div>
      </div>
    );
  }

  const stats = [
    { label: 'المسارات', value: dashboard?.total_routes || 0, icon: Route, color: 'bg-blue-500' },
    { label: 'إجمالي الطلاب', value: dashboard?.total_students || 0, icon: Users, color: 'bg-green-500' },
    { label: 'صعدوا اليوم', value: dashboard?.today_boarded || 0, icon: CheckCircle, color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1C3D74] rounded-xl flex items-center justify-center">
            <Bus className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C3D74]" style={{ fontFamily: 'Cairo' }}>
              بوابة السائق
            </h1>
            <p className="text-sm text-slate-500">مرحباً {user?.full_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-[#1C3D74] mb-4">المسارات</h2>
            <div className="space-y-3">
              {routes.map(route => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`w-full text-right p-3 rounded-xl border transition-all ${
                    selectedRoute?.id === route.id
                      ? 'border-[#46C1BE] bg-[#46C1BE]/10'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Route className="text-[#46C1BE] w-4 h-4" />
                    <span className="font-medium">{route.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {route.student_ids?.length || 0} طلاب · {route.stops?.length || 0} محطات
                  </p>
                </button>
              ))}
              {routes.length === 0 && (
                <p className="text-center text-slate-400 py-4">لا توجد مسارات</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            {selectedRoute ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1C3D74]">{selectedRoute.name}</h2>
                  <span className="text-sm text-slate-500">
                    {selectedRoute.students?.length || 0} طالب
                  </span>
                </div>

                {selectedRoute.stops && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">المحطات</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedRoute.stops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-lg border">
                          <MapPin className="text-[#46C1BE] w-3 h-3" />
                          <span>{stop.name}</span>
                          <span className="text-slate-400">({stop.time})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700">قائمة الطلاب</h3>
                  {(selectedRoute.students || []).map(student => {
                    const boarded = dashboard?.today_logs?.some(
                      l => l.student_id === student.id && l.status === 'boarded'
                    );
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${boarded ? 'bg-green-500' : 'bg-slate-300'}`}>
                            {boarded ? '✓' : '?'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{student.full_name || student.full_name_ar}</p>
                            <p className="text-xs text-slate-400">{student.id}</p>
                          </div>
                        </div>
                        {!boarded && (
                          <button
                            onClick={() => handleBoardStudent(student.id, selectedRoute.id)}
                            className="px-3 py-1 bg-[#46C1BE] text-white text-xs rounded-lg hover:bg-[#3ba8a5] transition-colors"
                          >
                            تسجيل صعود
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {(!selectedRoute.students || selectedRoute.students.length === 0) && (
                    <p className="text-center text-slate-400 py-4">لا يوجد طلاب في هذا المسار</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-slate-400 py-8">اختر مسارًا لعرض التفاصيل</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
