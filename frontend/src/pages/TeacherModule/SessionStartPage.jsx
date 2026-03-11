import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';
import {
  Users, CheckCircle2, XCircle, Clock, AlertCircle,
  Loader2, ChevronRight, Play, BookOpen, FileText, 
  Sparkles, ArrowRight
} from 'lucide-react';

// Attendance Status Enum
const ATTENDANCE_STATUS = {
  PRESENT: { value: 'present', label: 'حاضر', color: 'bg-green-500', textColor: 'text-green-600' },
  ABSENT: { value: 'absent', label: 'غائب', color: 'bg-red-500', textColor: 'text-red-600' },
  LATE: { value: 'late', label: 'متأخر', color: 'bg-amber-500', textColor: 'text-amber-600' },
  EXCUSED: { value: 'excused', label: 'مستأذن', color: 'bg-blue-500', textColor: 'text-blue-600' },
};

export default function SessionStartPage() {
  const { user, api, isRTL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState('validating'); // validating, attendance, approved
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0, present: 0, absent: 0, late: 0, excused: 0
  });
  const [lessonData, setLessonData] = useState(null);

  const teacherId = user?.teacher_id || user?.id;
  
  // Get lesson data from location.state or sessionStorage fallback - with useEffect
  useEffect(() => {
    // First check location.state
    if (location.state?.lesson) {
      console.log('Got lesson from location.state:', location.state.lesson);
      setLessonData(location.state.lesson);
      return;
    }
    
    // Fallback to sessionStorage
    const stored = sessionStorage.getItem('current_lesson');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Got lesson from sessionStorage:', parsed.lesson);
        setLessonData(parsed.lesson);
        return;
      } catch (e) {
        console.error('Error parsing sessionStorage:', e);
      }
    }
    
    // No lesson data found - redirect after a short delay
    console.log('No lesson data found, redirecting...');
    const timeout = setTimeout(() => {
      toast.error('لم يتم تحديد الحصة');
      navigate('/teacher/home');
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [location.state, navigate]);

  // Start the session - only when lessonData is available
  const startSession = useCallback(async () => {
    if (!lessonData) {
      return; // Wait for lessonData to be set
    }

    setLoading(true);
    try {
      console.log('Starting session with data:', lessonData);
      const response = await api.post('/session/start', {
        teacher_id: teacherId,
        schedule_session_id: lessonData.schedule_session_id || lessonData.id,
        class_id: lessonData.classId,
        subject_id: lessonData.subjectId
      });

      if (response.data?.session_record_id) {
        setSessionId(response.data.session_record_id);
        setSessionInfo({
          className: response.data.class_name || lessonData.className,
          subjectName: response.data.subject_name || lessonData.subject,
          teacherName: response.data.teacher_name,
          studentCount: response.data.student_count
        });
        
        // Fetch students for attendance
        await fetchStudents(response.data.session_record_id);
        setStep('attendance');
        toast.success('تم بدء الحصة بنجاح');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      const message = error.response?.data?.detail || 'خطأ في بدء الحصة';
      
      // If session already running, try to continue it
      if (message.includes('قيد التشغيل')) {
        toast.info('جارٍ استكمال الحصة الحالية');
        // Try to get the existing session
        try {
          const existingSession = await api.get(`/session/current?schedule_session_id=${lessonData.schedule_session_id || lessonData.id}`);
          if (existingSession.data?.session_record_id) {
            setSessionId(existingSession.data.session_record_id);
            setSessionInfo({
              className: existingSession.data.class_name || lessonData.className,
              subjectName: existingSession.data.subject_name || lessonData.subject,
              teacherName: existingSession.data.teacher_name,
              studentCount: existingSession.data.student_count
            });
            await fetchStudents(existingSession.data.session_record_id);
            setStep('attendance');
            return;
          }
        } catch (e) {
          console.error('Error getting existing session:', e);
        }
        navigate('/teacher');
      } else if (message.includes('تم إنهاء')) {
        toast.error(message);
        navigate('/teacher');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [api, teacherId, lessonData, navigate]);

  // Fetch students with attendance status
  const fetchStudents = async (sid) => {
    try {
      const response = await api.get(`/session/${sid}/students`);
      const studentsList = response.data?.students || [];
      
      setStudents(studentsList);
      updateAttendanceStats(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Update attendance statistics
  const updateAttendanceStats = (studentsList) => {
    const stats = {
      total: studentsList.length,
      present: studentsList.filter(s => s.attendance_status === 'present').length,
      absent: studentsList.filter(s => s.attendance_status === 'absent').length,
      late: studentsList.filter(s => s.attendance_status === 'late').length,
      excused: studentsList.filter(s => s.attendance_status === 'excused').length
    };
    setAttendanceStats(stats);
  };

  // Update single student attendance
  const updateAttendance = async (studentId, status) => {
    try {
      await api.put(`/session/${sessionId}/attendance/${studentId}`, {
        status: status
      });

      // Update local state
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, attendance_status: status } : s
      ));
      
      // Recalculate stats
      const updatedStudents = students.map(s => 
        s.id === studentId ? { ...s, attendance_status: status } : s
      );
      updateAttendanceStats(updatedStudents);
    } catch (error) {
      toast.error('خطأ في تحديث الحضور');
    }
  };

  // Approve attendance and proceed
  const approveAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/session/${sessionId}/attendance/approve`);
      
      toast.success(`تم اعتماد الحضور - ${response.data?.present || attendanceStats.present} حاضر`);
      setStep('approved');
      
      // Navigate to teaching page after short delay
      setTimeout(() => {
        navigate('/teacher/session/teach', { 
          state: { 
            sessionId,
            sessionInfo,
            attendanceStats: response.data || attendanceStats
          }
        });
      }, 1500);
    } catch (error) {
      toast.error('خطأ في اعتماد الحضور');
    } finally {
      setLoading(false);
    }
  };

  // Initialize session on mount
  useEffect(() => {
    startSession();
  }, [startSession]);

  // Separate students by gender
  const maleStudents = students.filter(s => s.gender === 'male');
  const femaleStudents = students.filter(s => s.gender === 'female');

  // Loading state
  if (step === 'validating' || (loading && !students.length)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-turquoise mx-auto mb-4" />
          <h2 className="font-cairo text-xl font-bold text-brand-navy mb-2">
            جاري بدء الحصة...
          </h2>
          <p className="text-muted-foreground">
            يتم التحقق من الصلاحيات وإعداد الجلسة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-brand-navy text-white p-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/teacher')}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="font-cairo font-bold text-lg">{sessionInfo?.subjectName}</h1>
              <p className="text-sm text-white/80">{sessionInfo?.className}</p>
            </div>
            <Badge className="bg-green-500 text-white">
              جارية
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        
        {/* Attendance Stats - مؤشرات الحضور */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-cairo font-bold text-brand-navy flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-turquoise" />
                قائمة الطلاب ({attendanceStats.total})
              </h2>
              <div className="flex items-center gap-2">
                {attendanceStats.present > 0 && (
                  <Badge className="bg-green-100 text-green-700">
                    {attendanceStats.present} حاضر
                  </Badge>
                )}
                {attendanceStats.absent > 0 && (
                  <Badge className="bg-red-100 text-red-700">
                    {attendanceStats.absent} غائب
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Attendance Progress */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-green-500 transition-all" 
                style={{ width: `${(attendanceStats.present / attendanceStats.total) * 100}%` }}
              />
              <div 
                className="bg-amber-500 transition-all" 
                style={{ width: `${(attendanceStats.late / attendanceStats.total) * 100}%` }}
              />
              <div 
                className="bg-blue-500 transition-all" 
                style={{ width: `${(attendanceStats.excused / attendanceStats.total) * 100}%` }}
              />
              <div 
                className="bg-red-500 transition-all" 
                style={{ width: `${(attendanceStats.absent / attendanceStats.total) * 100}%` }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              اضغط على الطالب لتغيير حالة الحضور
            </p>
          </CardContent>
        </Card>

        {/* Students Grid - شبكة الطلاب */}
        {students.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">لا يوجد طلاب في هذا الفصل</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Males Section */}
            {maleStudents.length > 0 && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  الطلاب ({maleStudents.length})
                </p>
                <div className="space-y-2">
                  {maleStudents.map((student, idx) => (
                    <StudentAttendanceCard
                      key={student.id}
                      student={student}
                      index={idx}
                      onUpdateStatus={updateAttendance}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Females Section */}
            {femaleStudents.length > 0 && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  الطالبات ({femaleStudents.length})
                </p>
                <div className="space-y-2">
                  {femaleStudents.map((student, idx) => (
                    <StudentAttendanceCard
                      key={student.id}
                      student={student}
                      index={idx}
                      onUpdateStatus={updateAttendance}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* If no gender distinction, show all */}
            {maleStudents.length === 0 && femaleStudents.length === 0 && (
              <div className="col-span-2 space-y-2">
                {students.map((student, idx) => (
                  <StudentAttendanceCard
                    key={student.id}
                    student={student}
                    index={idx}
                    onUpdateStatus={updateAttendance}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approve Attendance Button - زر اعتماد الحضور */}
        <div className="sticky bottom-4">
          <Button
            className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
            onClick={approveAttendance}
            disabled={loading || students.length === 0}
            data-testid="approve-attendance-btn"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin me-2" />
            ) : (
              <CheckCircle2 className="h-6 w-6 me-2" />
            )}
            اعتماد الحضور
          </Button>
        </div>
      </div>
    </div>
  );
}

// Student Attendance Card Component
function StudentAttendanceCard({ student, index, onUpdateStatus }) {
  const [showOptions, setShowOptions] = useState(false);
  const currentStatus = ATTENDANCE_STATUS[student.attendance_status?.toUpperCase()] || ATTENDANCE_STATUS.PRESENT;

  const handleStatusChange = (status) => {
    onUpdateStatus(student.id, status);
    setShowOptions(false);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all border-2 ${
        student.attendance_status === 'absent' ? 'border-red-300 bg-red-50' :
        student.attendance_status === 'late' ? 'border-amber-300 bg-amber-50' :
        student.attendance_status === 'excused' ? 'border-blue-300 bg-blue-50' :
        'border-green-300 bg-green-50'
      }`}
      onClick={() => setShowOptions(!showOptions)}
      data-testid={`student-card-${student.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.avatar_url} />
            <AvatarFallback className={`text-white font-bold ${
              student.attendance_status === 'absent' ? 'bg-red-500' :
              student.attendance_status === 'late' ? 'bg-amber-500' :
              student.attendance_status === 'excused' ? 'bg-blue-500' :
              'bg-green-500'
            }`}>
              {student.full_name?.charAt(0) || (index + 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{student.full_name || `طالب ${index + 1}`}</p>
            <p className="text-xs text-muted-foreground">{student.student_code}</p>
          </div>
          <Badge className={`${currentStatus.color} text-white`}>
            {currentStatus.label}
          </Badge>
        </div>

        {/* Status Options */}
        {showOptions && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            {Object.values(ATTENDANCE_STATUS).map(status => (
              <Button
                key={status.value}
                size="sm"
                variant={student.attendance_status === status.value ? 'default' : 'outline'}
                className={student.attendance_status === status.value ? status.color : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(status.value);
                }}
              >
                {status.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
