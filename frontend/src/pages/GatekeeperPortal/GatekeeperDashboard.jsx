import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { DoorOpen, DoorClosed, Search, UserCheck, Clock, AlertTriangle } from 'lucide-react';

const GatekeeperDashboard = () => {
  const { user, api } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, logsRes] = await Promise.all([
        api.get('/gatekeeper/dashboard').catch(() => ({ data: { total_entries: 0, total_exits: 0, late_entries: 0, total_students: 0, total_teachers: 0, recent_logs: [] } })),
        api.get('/gatekeeper/logs').catch(() => ({ data: [] }))
      ]);
      setDashboard(dashRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await api.post('/gatekeeper/search', { query: searchQuery });
      setSearchResults(res.data.results || []);
    } catch {
      toast.error('حدث خطأ في البحث');
    } finally {
      setSearching(false);
    }
  };

  const handleEntryExit = async (personId, personType, type) => {
    try {
      await api.post('/gatekeeper/entry-exit', {
        person_id: personId,
        person_type: personType,
        type: type
      });
      toast.success(type === 'entry' ? 'تم تسجيل الدخول' : 'تم تسجيل الخروج');
      fetchData();
      setSearchResults([]);
      setSearchQuery('');
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
    { label: 'الداخلون اليوم', value: dashboard?.total_entries || 0, icon: DoorOpen, color: 'bg-green-500' },
    { label: 'الخارجون اليوم', value: dashboard?.total_exits || 0, icon: DoorClosed, color: 'bg-blue-500' },
    { label: 'المتأخرون', value: dashboard?.late_entries || 0, icon: Clock, color: 'bg-amber-500' },
    { label: 'إجمالي الطلاب', value: dashboard?.total_students || 0, icon: UserCheck, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1C3D74] rounded-xl flex items-center justify-center">
            <DoorOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C3D74]" style={{ fontFamily: 'Cairo' }}>
              بوابة حارس البوابة
            </h1>
            <p className="text-sm text-slate-500">مرحباً {user?.full_name} · {dashboard?.today}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1C3D74] mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#1C3D74] mb-4">تسجيل دخول / خروج</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ابحث بالاسم أو الرقم..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#46C1BE] focus:border-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-[#1C3D74] text-white rounded-xl hover:bg-[#15305d] transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              بحث
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4">
              {searchResults.map(person => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${person.type === 'student' ? 'bg-blue-500' : 'bg-green-500'}`}>
                      {person.type === 'student' ? 'ط' : 'م'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-slate-400">{person.id} · {person.type === 'student' ? 'طالب' : 'معلم'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEntryExit(person.id, person.type, 'entry')}
                      className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 flex items-center gap-1"
                    >
                      <DoorOpen className="w-3 h-3" /> دخول
                    </button>
                    <button
                      onClick={() => handleEntryExit(person.id, person.type, 'exit')}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 flex items-center gap-1"
                    >
                      <DoorClosed className="w-3 h-3" /> خروج
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1C3D74]">سجل اليوم</h2>
            <span className="text-sm text-slate-500">{logs.length} سجل</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-right py-2 px-3">الاسم</th>
                  <th className="text-right py-2 px-3">النوع</th>
                  <th className="text-right py-2 px-3">الحركة</th>
                  <th className="text-right py-2 px-3">الوقت</th>
                  <th className="text-right py-2 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 20).map((log, idx) => (
                  <tr key={log.id || idx} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{log.person_name}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${log.person_type === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {log.person_type === 'student' ? 'طالب' : 'معلم'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${log.type === 'entry' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.type === 'entry' ? 'دخول' : 'خروج'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{log.time}</td>
                    <td className="py-2 px-3">
                      {log.is_late && (
                        <span className="flex items-center gap-1 text-amber-600 text-xs">
                          <AlertTriangle className="w-3 h-3" /> متأخر
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">لا توجد سجلات اليوم</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatekeeperDashboard;
