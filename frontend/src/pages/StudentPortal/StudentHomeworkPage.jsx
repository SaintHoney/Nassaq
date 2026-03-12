/**
 * Student Portal - Homework Page
 * صفحة الواجبات للطالب
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import PortalLayout from '../../components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';
import {
  ClipboardList,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StudentHomeworkPage = () => {
  const { token } = useAuth();
  const { isRTL } = useTheme();
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState({ pending: [], completed: [], overdue: [] });

  useEffect(() => {
    fetchHomework();
  }, [token]);

  const fetchHomework = async () => {
    try {
      // For now, use mock data since API might not exist yet
      // In production, this would call the actual API
      setHomework({
        pending: [
          {
            id: '1',
            title: 'حل تمارين الفصل الثالث',
            subject: 'الرياضيات',
            teacher: 'أ. محمد أحمد',
            due_date: '2026-03-15',
            description: 'حل التمارين من 1 إلى 15',
            status: 'pending'
          },
          {
            id: '2',
            title: 'كتابة موضوع تعبير',
            subject: 'اللغة العربية',
            teacher: 'أ. فاطمة علي',
            due_date: '2026-03-16',
            description: 'كتابة موضوع عن أهمية القراءة',
            status: 'pending'
          }
        ],
        completed: [
          {
            id: '3',
            title: 'تقرير عن البيئة',
            subject: 'العلوم',
            teacher: 'أ. خالد سعيد',
            due_date: '2026-03-10',
            completed_date: '2026-03-09',
            grade: 95,
            status: 'completed'
          }
        ],
        overdue: []
      });
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast.error(isRTL ? 'حدث خطأ في جلب الواجبات' : 'Error fetching homework');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: isRTL ? 'قيد الانتظار' : 'Pending',
      completed: isRTL ? 'مكتمل' : 'Completed',
      overdue: isRTL ? 'متأخر' : 'Overdue'
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return isRTL ? `متأخر ${Math.abs(diff)} يوم` : `${Math.abs(diff)} days overdue`;
    if (diff === 0) return isRTL ? 'اليوم' : 'Today';
    if (diff === 1) return isRTL ? 'غداً' : 'Tomorrow';
    return isRTL ? `${diff} أيام متبقية` : `${diff} days left`;
  };

  if (loading) {
    return (
      <PortalLayout portalType="student">
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </PortalLayout>
    );
  }

  const totalPending = homework.pending.length;
  const totalCompleted = homework.completed.length;
  const totalOverdue = homework.overdue.length;

  return (
    <PortalLayout portalType="student">
      <div className="p-4 space-y-4" data-testid="student-homework-page">
        {/* Header */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">{isRTL ? 'الواجبات المنزلية' : 'Homework'}</h1>
                  <p className="text-sm text-muted-foreground">
                    {totalPending} {isRTL ? 'واجب قيد الانتظار' : 'pending assignments'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-lg font-bold text-amber-600">{totalPending}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">{totalCompleted}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'مكتمل' : 'Completed'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-600">{totalOverdue}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'متأخر' : 'Overdue'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="pending" className="rounded-lg text-xs">
              {isRTL ? 'قيد الانتظار' : 'Pending'} ({totalPending})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs">
              {isRTL ? 'مكتمل' : 'Completed'} ({totalCompleted})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="rounded-lg text-xs">
              {isRTL ? 'متأخر' : 'Overdue'} ({totalOverdue})
            </TabsTrigger>
          </TabsList>

          {['pending', 'completed', 'overdue'].map((status) => (
            <TabsContent key={status} value={status} className="mt-4">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px]">
                    {homework[status]?.length > 0 ? (
                      <div className="space-y-3">
                        {homework[status].map((item) => (
                          <div
                            key={item.id}
                            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-purple-600" />
                                <span className="font-medium text-sm">{item.subject}</span>
                              </div>
                              <Badge variant="outline" className={getStatusColor(item.status)}>
                                {getStatusLabel(item.status)}
                              </Badge>
                            </div>
                            
                            <h3 className="font-bold mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.due_date)}
                              </span>
                              {status === 'pending' && (
                                <span className={`font-medium ${
                                  getDaysRemaining(item.due_date).includes('متأخر') || getDaysRemaining(item.due_date).includes('overdue')
                                    ? 'text-red-600'
                                    : 'text-amber-600'
                                }`}>
                                  {getDaysRemaining(item.due_date)}
                                </span>
                              )}
                              {status === 'completed' && item.grade && (
                                <Badge className="bg-green-100 text-green-700 border-0">
                                  {isRTL ? 'الدرجة:' : 'Grade:'} {item.grade}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mb-3 opacity-30" />
                        <p>
                          {status === 'pending' && (isRTL ? 'لا توجد واجبات قيد الانتظار' : 'No pending homework')}
                          {status === 'completed' && (isRTL ? 'لا توجد واجبات مكتملة' : 'No completed homework')}
                          {status === 'overdue' && (isRTL ? 'لا توجد واجبات متأخرة' : 'No overdue homework')}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default StudentHomeworkPage;
