import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import {
  MessageSquare, Send, Plus, Users, Loader2, RefreshCw,
  Bell, Mail, Phone, Clock, CheckCircle2, AlertCircle, Search,
  MessageCircle, Megaphone, UserCheck, ChevronLeft
} from 'lucide-react';
import { HakimAssistant } from '../../components/hakim/HakimAssistant';

const MESSAGE_TYPES = [
  { value: 'general', label: 'عام', labelEn: 'General', icon: MessageSquare },
  { value: 'urgent', label: 'عاجل', labelEn: 'Urgent', icon: AlertCircle },
  { value: 'announcement', label: 'إعلان', labelEn: 'Announcement', icon: Megaphone },
  { value: 'meeting', label: 'اجتماع', labelEn: 'Meeting', icon: UserCheck },
];

export default function TeacherCommunicationPage() {
  const { user, api, isRTL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newMessage, setNewMessage] = useState({
    type: 'general',
    subject: '',
    body: '',
    recipients: 'all', // 'all', 'selected', 'student'
    selectedStudents: [],
    selectedParents: []
  });

  const teacherId = user?.teacher_id || user?.id;

  const fetchData = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      const [classesRes, messagesRes] = await Promise.all([
        api.get(`/teacher/classes/${teacherId}`).catch(() => ({ data: [] })),
        api.get(`/messages?sender_id=${teacherId}`).catch(() => ({ data: [] }))
      ]);
      
      setClasses(classesRes.data || []);
      setMessages(messagesRes.data || []);
      
      if (classesRes.data?.length > 0 && !selectedClass) {
        setSelectedClass(classesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [api, teacherId, selectedClass]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    
    try {
      const studentsRes = await api.get(`/classes/${selectedClass}/students`);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [api, selectedClass]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, fetchStudents]);

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.body) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setSending(true);
    try {
      // Determine recipients
      let recipientIds = [];
      if (newMessage.recipients === 'all') {
        recipientIds = students.map(s => s.parent_id || s.id);
      } else if (newMessage.recipients === 'selected') {
        recipientIds = newMessage.selectedParents;
      }

      await api.post('/messages', {
        sender_id: teacherId,
        sender_type: 'teacher',
        recipient_ids: recipientIds,
        type: newMessage.type,
        subject: newMessage.subject,
        body: newMessage.body,
        class_id: selectedClass
      });

      toast.success(isRTL ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
      setShowComposeDialog(false);
      setNewMessage({
        type: 'general',
        subject: '',
        body: '',
        recipients: 'all',
        selectedStudents: [],
        selectedParents: []
      });
      fetchData();
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إرسال الرسالة' : 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const toggleStudentSelection = (studentId, parentId) => {
    setNewMessage(prev => {
      const isSelected = prev.selectedStudents.includes(studentId);
      return {
        ...prev,
        selectedStudents: isSelected 
          ? prev.selectedStudents.filter(id => id !== studentId)
          : [...prev.selectedStudents, studentId],
        selectedParents: isSelected
          ? prev.selectedParents.filter(id => id !== parentId)
          : [...prev.selectedParents, parentId]
      };
    });
  };

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-brand-turquoise font-cairo">
                {isRTL ? 'التواصل مع أولياء الأمور' : 'Parent Communication'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'إرسال رسائل وإشعارات لأولياء الأمور' : 'Send messages and notifications to parents'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]" data-testid="class-select">
                  <SelectValue placeholder={isRTL ? 'اختر الفصل' : 'Select class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="bg-brand-turquoise hover:bg-brand-turquoise/90"
                onClick={() => setShowComposeDialog(true)}
              >
                <Plus className="h-4 w-4 me-1" />
                {isRTL ? 'رسالة جديدة' : 'New Message'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="compose" data-testid="compose-tab">
                <Send className="h-4 w-4 me-1" />
                {isRTL ? 'إرسال سريع' : 'Quick Send'}
              </TabsTrigger>
              <TabsTrigger value="sent" data-testid="sent-tab">
                <CheckCircle2 className="h-4 w-4 me-1" />
                {isRTL ? 'المرسلة' : 'Sent'}
              </TabsTrigger>
              <TabsTrigger value="contacts" data-testid="contacts-tab">
                <Users className="h-4 w-4 me-1" />
                {isRTL ? 'جهات الاتصال' : 'Contacts'}
              </TabsTrigger>
            </TabsList>

            {/* Quick Send Tab */}
            <TabsContent value="compose">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Quick Message Templates */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-cairo">
                        {isRTL ? 'رسائل سريعة' : 'Quick Messages'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { 
                          title: isRTL ? 'تذكير بالواجب' : 'Homework Reminder',
                          body: isRTL ? 'نود تذكيركم بضرورة متابعة أداء الواجبات المنزلية لابنكم/ابنتكم.' : 'Reminder to follow up on your child\'s homework.'
                        },
                        { 
                          title: isRTL ? 'إشعار اختبار' : 'Exam Notice',
                          body: isRTL ? 'نود إعلامكم بأنه سيكون هناك اختبار قريباً. يرجى مساعدة الطالب في الاستعداد.' : 'There will be an upcoming exam. Please help your child prepare.'
                        },
                        { 
                          title: isRTL ? 'دعوة لاجتماع' : 'Meeting Invitation',
                          body: isRTL ? 'يسرنا دعوتكم لحضور اجتماع أولياء الأمور.' : 'You are invited to attend the parent-teacher meeting.'
                        },
                        { 
                          title: isRTL ? 'ملاحظة سلوكية' : 'Behavior Note',
                          body: isRTL ? 'نود إطلاعكم على سلوك الطالب في المدرسة.' : 'We would like to inform you about your child\'s behavior.'
                        }
                      ].map((template, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border-2 hover:border-brand-turquoise cursor-pointer transition-all"
                          onClick={() => {
                            setNewMessage({
                              ...newMessage,
                              subject: template.title,
                              body: template.body
                            });
                            setShowComposeDialog(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{template.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{template.body}</p>
                            </div>
                            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-brand-turquoise" />
                        <div className="text-2xl font-bold">{messages.length}</div>
                        <div className="text-sm text-muted-foreground">{isRTL ? 'رسالة مرسلة' : 'Messages Sent'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{students.length}</div>
                        <div className="text-sm text-muted-foreground">{isRTL ? 'ولي أمر' : 'Parents'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                        <div className="text-2xl font-bold">
                          {messages.filter(m => m.type === 'urgent').length}
                        </div>
                        <div className="text-sm text-muted-foreground">{isRTL ? 'رسالة عاجلة' : 'Urgent'}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Sent Messages Tab */}
            <TabsContent value="sent">
              <Card>
                <CardContent className="p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-muted-foreground">{isRTL ? 'لا توجد رسائل مرسلة' : 'No sent messages'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, idx) => (
                        <div key={message.id || idx} className="p-4 rounded-lg border hover:bg-muted/30 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={message.type === 'urgent' ? 'destructive' : 'secondary'}>
                                {MESSAGE_TYPES.find(t => t.value === message.type)?.[isRTL ? 'label' : 'labelEn'] || message.type}
                              </Badge>
                              <span className="font-medium">{message.subject}</span>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {message.created_at ? new Date(message.created_at).toLocaleDateString('ar-SA') : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{message.body}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{message.recipient_ids?.length || 0} {isRTL ? 'مستلم' : 'recipients'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-cairo">
                      {isRTL ? 'أولياء الأمور' : 'Parents'}
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={isRTL ? 'بحث...' : 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-9 w-[200px]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      {isRTL ? 'لا يوجد أولياء أمور' : 'No parents found'}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredStudents.map((student, idx) => (
                        <div key={student.id} className="p-4 rounded-lg border hover:border-brand-turquoise transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar>
                              <AvatarFallback className="bg-brand-navy text-white">
                                {student.full_name?.charAt(0) || (idx + 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'ولي الأمر' : 'Parent'}: {student.parent_name || '-'}</p>
                            </div>
                          </div>
                          {student.parent_phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{student.parent_phone}</span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => {
                              setNewMessage({
                                ...newMessage,
                                recipients: 'selected',
                                selectedStudents: [student.id],
                                selectedParents: [student.parent_id]
                              });
                              setShowComposeDialog(true);
                            }}
                          >
                            <Send className="h-3.5 w-3.5 me-1" />
                            {isRTL ? 'إرسال رسالة' : 'Send Message'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Compose Dialog */}
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-cairo">{isRTL ? 'إرسال رسالة' : 'Send Message'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'نوع الرسالة' : 'Message Type'}</Label>
                  <Select 
                    value={newMessage.type} 
                    onValueChange={(v) => setNewMessage({...newMessage, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {isRTL ? t.label : t.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'المستلمين' : 'Recipients'}</Label>
                  <Select 
                    value={newMessage.recipients} 
                    onValueChange={(v) => setNewMessage({...newMessage, recipients: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? 'جميع أولياء الأمور' : 'All Parents'}</SelectItem>
                      <SelectItem value="selected">{isRTL ? 'محدد' : 'Selected'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newMessage.recipients === 'selected' && (
                <div className="space-y-2">
                  <Label>{isRTL ? 'اختر الطلاب' : 'Select Students'}</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {students.map(student => (
                      <div key={student.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={newMessage.selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id, student.parent_id)}
                        />
                        <span className="text-sm">{student.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{isRTL ? 'عنوان الرسالة' : 'Subject'} *</Label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  placeholder={isRTL ? 'عنوان الرسالة...' : 'Message subject...'}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'نص الرسالة' : 'Message'} *</Label>
                <Textarea
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
                  placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message...'}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                className="bg-brand-turquoise hover:bg-brand-turquoise/90"
                onClick={handleSendMessage}
                disabled={sending}
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                <Send className="h-4 w-4 me-1" />
                {isRTL ? 'إرسال' : 'Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <HakimAssistant />
    </TeacherLayout>
  );
}
