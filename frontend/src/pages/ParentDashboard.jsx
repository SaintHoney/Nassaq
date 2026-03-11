import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import {
  User, Calendar, Bell, GraduationCap, Clock, CheckCircle2,
  AlertCircle, TrendingUp, Award, FileText, BookOpen, Users,
  Phone, Mail, BarChart3, CalendarDays, MessageSquare
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';

// Helper functions
const getCurrentHijriDate = () => {
  const today = new Date();
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return { hijri: hijriFormatter.format(today), gregorian: today.toLocaleDateString('en-GB') };
  } catch (e) {
    return { hijri: 'التاريخ الهجري', gregorian: today.toLocaleDateString() };
  }
};

export default function ParentDashboard() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedChild, setSelectedChild] = useState(0);
  const [children, setChildren] = useState([]);
  const [childData, setChildData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchParentData = useCallback(async () => {
    setLoading(true);
    try {
      // Get parent ID from user
      const parentId = user?.parent_id || user?.id;
      
      // Fetch parent dashboard data from API
      const dashboardRes = await api.get(`/parent/dashboard/${parentId}`).catch(() => null);
      
      if (dashboardRes?.data) {
        const data = dashboardRes.data;
        
        // Transform children data
        const transformedChildren = data.children?.map(child => ({
          id: child.id,
          name: child.name,
          grade: child.class_name,
          section: '',
          avatar: child.avatar,
          stats: {
            attendanceRate: child.stats.attendance_rate || 0,
            averageGrade: child.stats.average_grade || 0,
            absences: child.stats.absences || 0,
            lates: child.stats.lates || 0
          },
          recentGrades: child.recent_grades?.map(g => ({
            subject: g.subject,
            grade: g.grade,
            date: g.date
          })) || [],
          behaviourNotes: child.behaviour_notes?.map(n => ({
            type: n.type,
            note: n.note,
            date: n.date
          })) || [],
          schedule: child.today_schedule?.map(s => ({
            time: s.time,
            subject: s.subject,
            teacher: s.teacher
          })) || []
        })) || [];
        
        setChildren(transformedChildren);
        if (transformedChildren.length > 0) {
          setChildData(transformedChildren[selectedChild] || transformedChildren[0]);
        }
        
        setNotifications(data.notifications?.map(n => ({
          title: n.title || n.message,
          time: n.time ? new Date(n.time).toLocaleDateString('ar-SA') : 'مؤخراً',
          type: n.type || 'info'
        })) || []);
      } else {
        // No data available - show empty state
        console.log('No parent dashboard data available');
        setChildren([]);
        setChildData(null);
        
        // Try to get notifications anyway
        const notifRes = await api.get('/notifications?limit=5').catch(() => ({ data: [] }));
        setNotifications(notifRes.data?.slice?.(0, 5) || []);
      }

    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setLoading(false);
    }
  }, [api, selectedChild, user?.id, user?.parent_id]);

  useEffect(() => {
    fetchParentData();
  }, [fetchParentData]);

  useEffect(() => {
    if (children.length > 0) {
      setChildData(children[selectedChild]);
    }
  }, [selectedChild, children]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex min-h-screen bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`} data-testid="parent-dashboard">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : (isRTL ? 'mr-20' : 'ml-20')}`}>
        <div className="p-6 space-y-6">
          
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-indigo-500 shadow-lg">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-500 text-white text-xl font-bold">
                      {user?.full_name?.charAt(0) || 'و'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-cairo text-xl font-bold text-gray-900">
                      {isRTL ? `مرحباً ${user?.full_name || 'ولي الأمر'}` : `Welcome, ${user?.full_name || 'Parent'}`}
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {isRTL ? `${children.length} أبناء مسجلين` : `${children.length} registered children`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div className="text-end">
                    <p className="font-cairo text-sm font-bold">{getCurrentHijriDate().hijri}</p>
                    <p className="text-xs text-muted-foreground font-mono">{getCurrentHijriDate().gregorian}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Children Selector */}
          {children.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {children.map((child, index) => (
                <Button
                  key={child.id}
                  variant={selectedChild === index ? "default" : "outline"}
                  className={`flex items-center gap-2 min-w-fit ${selectedChild === index ? 'bg-indigo-600' : ''}`}
                  onClick={() => setSelectedChild(index)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{child.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{child.name}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Child Info Card */}
          {childData && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-indigo-300">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-lg">
                          {childData.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-cairo text-lg font-bold">{childData.name}</h2>
                        <p className="text-sm text-muted-foreground">{childData.grade} - {childData.section}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {isRTL ? 'تواصل مع المعلم' : 'Contact Teacher'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {isRTL ? 'التقرير الكامل' : 'Full Report'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'نسبة الحضور' : 'Attendance'}</p>
                        <p className="text-3xl font-bold text-green-600">{childData.stats.attendanceRate}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <Progress value={childData.stats.attendanceRate} className="mt-3 h-2" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'المعدل العام' : 'Average'}</p>
                        <p className="text-3xl font-bold text-blue-600">{childData.stats.averageGrade}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-100">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <Progress value={childData.stats.averageGrade} className="mt-3 h-2" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'أيام الغياب' : 'Absences'}</p>
                        <p className="text-3xl font-bold text-orange-600">{childData.stats.absences}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-100">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'مرات التأخير' : 'Late Arrivals'}</p>
                        <p className="text-3xl font-bold text-yellow-600">{childData.stats.lates}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-yellow-100">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for detailed info */}
              <Tabs defaultValue="grades" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="grades">{isRTL ? 'الدرجات' : 'Grades'}</TabsTrigger>
                  <TabsTrigger value="schedule">{isRTL ? 'الجدول' : 'Schedule'}</TabsTrigger>
                  <TabsTrigger value="behaviour">{isRTL ? 'السلوك' : 'Behaviour'}</TabsTrigger>
                  <TabsTrigger value="notifications">{isRTL ? 'الإشعارات' : 'Notifications'}</TabsTrigger>
                </TabsList>

                <TabsContent value="grades" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        {isRTL ? 'آخر الدرجات' : 'Recent Grades'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {childData.recentGrades.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-gray-500" />
                            <div>
                              <span className="font-medium">{item.subject}</span>
                              <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                          </div>
                          <span className={`font-bold text-lg ${getGradeColor(item.grade)}`}>{item.grade}%</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                        {isRTL ? 'جدول اليوم' : "Today's Schedule"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {childData.schedule.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <span className="font-bold text-xs text-purple-600">{lesson.time}</span>
                            </div>
                            <div>
                              <p className="font-medium">{lesson.subject}</p>
                              <p className="text-xs text-muted-foreground">{lesson.teacher}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="behaviour" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        {isRTL ? 'ملاحظات السلوك' : 'Behaviour Notes'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {childData.behaviourNotes.map((note, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          note.type === 'positive' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              note.type === 'positive' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {note.type === 'positive' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{note.note}</p>
                              <p className="text-xs text-muted-foreground">{note.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        {isRTL ? 'الإشعارات' : 'Notifications'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {notifications.map((notif, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <div className={`p-2 rounded-full ${
                            notif.type === 'exam' ? 'bg-red-100' :
                            notif.type === 'grade' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {notif.type === 'exam' ? (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : notif.type === 'grade' ? (
                              <Award className="h-4 w-4 text-green-600" />
                            ) : (
                              <Calendar className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
