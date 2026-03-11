import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import {
  Users, Shuffle, CheckCircle2, XCircle, Star, AlertTriangle,
  Loader2, ArrowRight, Hand, ThumbsUp, ThumbsDown, Award,
  MessageSquare, Zap, Target, BookOpen, FileQuestion, ClipboardCheck,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Interaction Modes
const INTERACTION_MODES = [
  { id: 'homework', label: 'متابعة الواجب', icon: ClipboardCheck, color: 'bg-blue-500' },
  { id: 'review', label: 'مراجعة عامة', icon: BookOpen, color: 'bg-purple-500' },
  { id: 'quiz', label: 'امتحان مفاجئ', icon: FileQuestion, color: 'bg-amber-500' },
];

// Participation Types
const PARTICIPATION_TYPES = [
  { id: 'active', label: 'مشاركة فعالة', color: 'bg-green-500', icon: Hand },
  { id: 'initiative', label: 'طالب مبادر', color: 'bg-purple-500', icon: Zap },
  { id: 'inactive', label: 'عدم التفاعل', color: 'bg-amber-500', icon: AlertTriangle },
  { id: 'refused', label: 'رفض التفاعل', color: 'bg-red-500', icon: XCircle },
];

// Behaviour Types
const BEHAVIOUR_TYPES = {
  skill: [
    { id: 'leadership', label: 'قيادة', points: 3 },
    { id: 'cooperation', label: 'تعاون', points: 2 },
    { id: 'initiative', label: 'مبادرة', points: 3 },
  ],
  positive: [
    { id: 'respect', label: 'احترام', points: 2 },
    { id: 'commitment', label: 'التزام', points: 2 },
    { id: 'helping_others', label: 'مساعدة الآخرين', points: 2 },
  ],
  negative: [
    { id: 'disruption', label: 'إزعاج', points: -2 },
    { id: 'non_compliance', label: 'عدم التزام', points: -2 },
    { id: 'interruption', label: 'مقاطعة التعليمات', points: -1 },
  ],
};

export default function SessionTeachPage() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(location.state?.sessionId);
  const [sessionInfo, setSessionInfo] = useState(location.state?.sessionInfo);
  const [students, setStudents] = useState([]);
  const [interactionMode, setInteractionMode] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showBehaviourDialog, setShowBehaviourDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [behaviourDetails, setBehaviourDetails] = useState('');

  const teacherId = user?.teacher_id || user?.id;

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      toast.error('لم يتم العثور على جلسة نشطة');
      navigate('/teacher');
    }
  }, [sessionId, navigate]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await api.get(`/session/${sessionId}/students`);
      const studentsList = (response.data?.students || []).map(s => ({
        ...s,
        interactionCount: 0,
        correctAnswers: 0,
        isFlashing: false
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [api, sessionId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Set interaction mode
  const handleSetMode = async (mode) => {
    try {
      await api.post(`/session/${sessionId}/mode`, { mode: mode.id });
      setInteractionMode(mode);
      toast.success(`تم تحديد النمط: ${mode.label}`);
    } catch (error) {
      toast.error('خطأ في تحديد النمط');
    }
  };

  // Select random student with enhanced visual and audio effects
  const selectRandomStudent = async () => {
    setLoading(true);
    
    // Play drum roll sound effect
    try {
      const drumRoll = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGmBenZxeHt9gYKAf35+gYOFhYSCgH59fYCDhYaGhYOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+gIKEhYaFhIOBf35+');
      drumRoll.volume = 0.2;
      drumRoll.play().catch(() => {});
    } catch {}
    
    // Visual flashing effect - faster spinning through students
    let flashCount = 0;
    const maxFlashes = 25;
    const flashInterval = setInterval(() => {
      flashCount++;
      const randomIdx = Math.floor(Math.random() * students.length);
      setStudents(prev => prev.map((s, i) => ({
        ...s,
        isFlashing: i === randomIdx
      })));
      
      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
      }
    }, 80); // Faster interval for spinning effect

    try {
      const response = await api.post(`/session/${sessionId}/random-student`);
      
      // Stop flashing after 2.5 seconds and show result
      setTimeout(() => {
        clearInterval(flashInterval);
        
        const selected = response.data;
        setStudents(prev => prev.map(s => ({
          ...s,
          isFlashing: s.id === selected.student_id
        })));
        
        setSelectedStudent({
          id: selected.student_id,
          full_name: selected.full_name,
          student_code: selected.student_code,
          avatar_url: selected.avatar_url,
          participation_count: selected.participation_count
        });
        
        // Play selection sound
        try {
          const selectSound = new Audio('data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAACAf4B/gH+Af4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpubnJucnJycnJycm5ubmpqamZiXl5aVlJSTkpGQj46NjIuKiYiHhoWEg4KBgH+Af4B/gH+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbm5ycnJycnJybm5uampmYl5eWlZSUk5KRkI+OjYyLiomIh4aFhIOCgYB/gH+Af4B/');
          selectSound.volume = 0.4;
          selectSound.play().catch(() => {});
        } catch {}
        
        // Small confetti burst on selection
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.7 },
          colors: ['#0ea5e9', '#14b8a6']
        });
        
        setShowStudentDialog(true);
        setLoading(false);
      }, 2500);
    } catch (error) {
      clearInterval(flashInterval);
      setStudents(prev => prev.map(s => ({ ...s, isFlashing: false })));
      toast.error(error.response?.data?.detail || 'خطأ في اختيار الطالب');
      setLoading(false);
    }
  };

  // Record answer with enhanced celebrations
  const recordAnswer = async (result) => {
    if (!selectedStudent) return;
    
    try {
      const response = await api.post(`/session/${sessionId}/answer`, {
        student_id: selectedStudent.id,
        result: result
      });

      if (result === 'correct') {
        // Big celebration effect!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b']
        });
        
        // Multiple bursts
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
        }, 150);
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 300);
        
        // Play success sound
        try {
          const successSound = new Audio('data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAACAf4B/gH9/f3+Af4GAgoKDhISFhoeIiYqLjI2OkJGSk5SVl5iZmpydnp+goaKjpKWmp6ipqqutrq+wsrO0tba3uLm6u7y9vr/AwMHCwsPDxMTFxcXGxsbGxsbGxsbGxsXFxcXExMPDwsLBwMC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZyampmalZSSkJCOjYuKiYiHhYSDgoF/fn17enl4d3Z1dHNycXBwb29ubm5ubm5ub29vb3BwcHFxcnJzc3R0dXZ2d3h5ent8fH1+f4A=');
          successSound.volume = 0.4;
          successSound.play().catch(() => {});
        } catch {}
        
        toast.success(`🎉 +${response.data?.score_change || 5} نقاط! أحسنت!`);
      } else if (result === 'wrong') {
        // Gentle shake animation feedback
        toast.info('❌ إجابة خاطئة - حاول مرة أخرى');
      } else {
        toast.warning('⏭️ لم يجب الطالب');
      }

      // Update student stats locally
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id 
          ? { 
              ...s, 
              interactionCount: (s.interactionCount || 0) + 1,
              correctAnswers: result === 'correct' ? (s.correctAnswers || 0) + 1 : s.correctAnswers,
              isFlashing: false
            } 
          : { ...s, isFlashing: false }
      ));

      setShowStudentDialog(false);
      setSelectedStudent(null);
    } catch (error) {
      toast.error('خطأ في تسجيل الإجابة');
    }
  };

  // Record participation
  const recordParticipation = async (type) => {
    if (!selectedStudent) return;
    
    try {
      const response = await api.post(`/session/${sessionId}/participation`, {
        student_id: selectedStudent.id,
        type: type.id
      });

      if (type.id === 'active' || type.id === 'initiative') {
        toast.success(`+${response.data?.score_change || 2} نقاط!`);
      }

      setShowStudentDialog(false);
      setSelectedStudent(null);
    } catch (error) {
      toast.error('خطأ في تسجيل المشاركة');
    }
  };

  // Record behaviour
  const recordBehaviour = async (category, behaviourType) => {
    if (!selectedStudent) return;
    
    try {
      const response = await api.post(`/session/${sessionId}/behaviour`, {
        student_id: selectedStudent.id,
        category: category,
        behaviour_type: behaviourType.id,
        details: behaviourDetails
      });

      if (category === 'positive' || category === 'skill') {
        toast.success(`+${Math.abs(behaviourType.points)} نقاط سلوك إيجابي!`);
      } else {
        toast.warning(`${behaviourType.points} نقاط سلوك`);
      }

      setShowBehaviourDialog(false);
      setBehaviourDetails('');
      setSelectedStudent(null);
    } catch (error) {
      toast.error('خطأ في تسجيل السلوك');
    }
  };

  // End session
  const endSession = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/session/${sessionId}/end`);
      setSessionSummary(response.data);
      toast.success('تم إنهاء الحصة بنجاح');
    } catch (error) {
      toast.error('خطأ في إنهاء الحصة');
    } finally {
      setLoading(false);
    }
  };

  // Handle student card click
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };

  // Navigate home after session end
  const goHome = () => {
    navigate('/teacher');
  };

  // If session ended, show summary
  if (sessionSummary) {
    return (
      <div className="min-h-screen bg-gray-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-400" />
              <h1 className="font-cairo text-2xl font-bold mb-2">
                تم إنهاء الحصة
              </h1>
              <p className="text-white/80">
                مدة الحصة: {sessionSummary.duration_minutes} دقيقة
              </p>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-lg">ملخص الحصة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{sessionSummary.present_count}</div>
                  <div className="text-sm text-muted-foreground">حاضر</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{sessionSummary.absent_count}</div>
                  <div className="text-sm text-muted-foreground">غائب</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sessionSummary.questions_asked}</div>
                  <div className="text-sm text-muted-foreground">أسئلة</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{sessionSummary.correct_answers}</div>
                  <div className="text-sm text-muted-foreground">إجابات صحيحة</div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">معدل المشاركة</p>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-turquoise transition-all"
                    style={{ width: `${sessionSummary.participation_rate}%` }}
                  />
                </div>
                <p className="text-sm text-center mt-1">{sessionSummary.participation_rate}%</p>
              </div>

              {sessionSummary.top_participants?.length > 0 && (
                <div className="pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    الأكثر تفاعلاً
                  </h3>
                  {sessionSummary.top_participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <span>{p.name}</span>
                      <Badge variant="secondary">{p.correct_answers} إجابات صحيحة</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            className="w-full h-14 text-lg font-bold bg-brand-navy"
            onClick={goHome}
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-brand-navy text-white p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-cairo font-bold">{sessionInfo?.subjectName}</h1>
            <p className="text-sm text-white/80">{sessionInfo?.className}</p>
          </div>
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
          >
            إنهاء الحصة
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        
        {/* Mode Selection - if not selected */}
        {!interactionMode ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-lg text-center">
                ابدأ الشرح الآن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-center text-muted-foreground text-sm mb-4">
                اختر نمط التفاعل
              </p>
              {INTERACTION_MODES.map(mode => (
                <Button
                  key={mode.id}
                  className={`w-full h-16 text-lg justify-start ${mode.color} hover:opacity-90`}
                  onClick={() => handleSetMode(mode)}
                >
                  <mode.icon className="h-6 w-6 me-3" />
                  {mode.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Random Student Button */}
            <Button
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-brand-turquoise to-brand-navy shadow-lg"
              onClick={selectRandomStudent}
              disabled={loading}
              data-testid="random-student-btn"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin me-2" />
              ) : (
                <Shuffle className="h-6 w-6 me-2" />
              )}
              اختيار طالب عشوائي
            </Button>

            {/* Students Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {students.filter(s => s.attendance_status === 'present').map((student, idx) => (
                <Card 
                  key={student.id}
                  className={`cursor-pointer transition-all ${
                    student.isFlashing 
                      ? 'ring-4 ring-brand-turquoise bg-brand-turquoise/20 scale-105' 
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => handleStudentClick(student)}
                  data-testid={`student-grid-${student.id}`}
                >
                  <CardContent className="p-2 text-center">
                    <Avatar className={`h-12 w-12 mx-auto mb-1 ${student.isFlashing ? 'ring-2 ring-brand-turquoise' : ''}`}>
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback className="bg-brand-navy text-white text-sm">
                        {student.full_name?.charAt(0) || (idx + 1)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium truncate">{student.full_name?.split(' ')[0]}</p>
                    {student.correctAnswers > 0 && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {student.correctAnswers} ✓
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Student Interaction Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedStudent && (
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage src={selectedStudent.avatar_url} />
                    <AvatarFallback className="bg-brand-navy text-white text-2xl">
                      {selectedStudent.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-cairo text-lg">{selectedStudent.full_name}</span>
                  <span className="text-sm text-muted-foreground">
                    المشاركات: {selectedStudent.participation_count || 0}
                  </span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Question Section */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                طرح سؤال
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="h-14 bg-green-500 hover:bg-green-600"
                  onClick={() => recordAnswer('correct')}
                >
                  <CheckCircle2 className="h-5 w-5 me-2" />
                  إجابة صحيحة
                </Button>
                <Button 
                  className="h-14 bg-red-500 hover:bg-red-600"
                  onClick={() => recordAnswer('wrong')}
                >
                  <XCircle className="h-5 w-5 me-2" />
                  إجابة خاطئة
                </Button>
              </div>
            </div>

            {/* Participation Section */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Hand className="h-4 w-4" />
                المشاركة
              </p>
              <div className="flex flex-wrap gap-2">
                {PARTICIPATION_TYPES.map(type => (
                  <Button
                    key={type.id}
                    size="sm"
                    variant="outline"
                    className={`${type.color} text-white border-0`}
                    onClick={() => recordParticipation(type)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Behaviour Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowStudentDialog(false);
                setShowBehaviourDialog(true);
              }}
            >
              <Star className="h-4 w-4 me-2" />
              تسجيل سلوك
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Behaviour Dialog */}
      <Dialog open={showBehaviourDialog} onOpenChange={setShowBehaviourDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo">تسجيل سلوك</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Skills */}
            <div>
              <p className="text-sm font-medium mb-2 text-purple-600">مهارة</p>
              <div className="flex flex-wrap gap-2">
                {BEHAVIOUR_TYPES.skill.map(b => (
                  <Button
                    key={b.id}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => recordBehaviour('skill', b)}
                  >
                    {b.label} (+{b.points})
                  </Button>
                ))}
              </div>
            </div>

            {/* Positive */}
            <div>
              <p className="text-sm font-medium mb-2 text-green-600">سلوك إيجابي</p>
              <div className="flex flex-wrap gap-2">
                {BEHAVIOUR_TYPES.positive.map(b => (
                  <Button
                    key={b.id}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => recordBehaviour('positive', b)}
                  >
                    {b.label} (+{b.points})
                  </Button>
                ))}
              </div>
            </div>

            {/* Negative */}
            <div>
              <p className="text-sm font-medium mb-2 text-red-600">سلوك سلبي</p>
              <div className="flex flex-wrap gap-2">
                {BEHAVIOUR_TYPES.negative.map(b => (
                  <Button
                    key={b.id}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => recordBehaviour('negative', b)}
                  >
                    {b.label} ({b.points})
                  </Button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-sm font-medium mb-2">تفاصيل الواقعة (اختياري)</p>
              <Textarea
                value={behaviourDetails}
                onChange={(e) => setBehaviourDetails(e.target.value)}
                placeholder="تظهر فقط لمدير المدرسة..."
                rows={2}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-cairo">إنهاء الحصة</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            هل أنت متأكد من إنهاء الحصة؟ سيتم حفظ جميع البيانات.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setShowEndDialog(false);
                endSession();
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              إنهاء الحصة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
