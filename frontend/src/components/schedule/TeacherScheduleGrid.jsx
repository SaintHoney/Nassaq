/**
 * TeacherScheduleGrid Component
 * شبكة جدول المعلمين - Teacher-based Schedule Grid
 * 
 * This component displays the schedule in a grid format where:
 * - Rows = Teachers
 * - Columns = Days of the week
 * - Cells = 7 periods per day
 * 
 * Features:
 * - Drag & Drop support
 * - Conflict detection
 * - Session cards with subject and class info
 * - Teacher workload visualization
 */

import { useState, useCallback } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  GripVertical, 
  Clock, 
  AlertTriangle, 
  Lock,
  User,
  BookOpen,
  MapPin,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Subject colors mapping
const SUBJECT_COLORS = {
  'اللغة العربية': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300', text: 'text-emerald-700 dark:text-emerald-400' },
  'الرياضيات': { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300', text: 'text-blue-700 dark:text-blue-400' },
  'العلوم': { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300', text: 'text-purple-700 dark:text-purple-400' },
  'اللغة الإنجليزية': { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300', text: 'text-red-700 dark:text-red-400' },
  'الدراسات الإسلامية': { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300', text: 'text-amber-700 dark:text-amber-400' },
  'الدراسات الاجتماعية': { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300', text: 'text-orange-700 dark:text-orange-400' },
  'الحاسب الآلي': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-300', text: 'text-cyan-700 dark:text-cyan-400' },
  'المهارات الرقمية': { bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-300', text: 'text-teal-700 dark:text-teal-400' },
  'التربية الفنية': { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300', text: 'text-pink-700 dark:text-pink-400' },
  'التربية البدنية': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', border: 'border-indigo-300', text: 'text-indigo-700 dark:text-indigo-400' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300', text: 'text-gray-700 dark:text-gray-400' };

// Days of week in Arabic
const DAYS = [
  { key: 'sunday', ar: 'الأحد', en: 'Sun' },
  { key: 'monday', ar: 'الاثنين', en: 'Mon' },
  { key: 'tuesday', ar: 'الثلاثاء', en: 'Tue' },
  { key: 'wednesday', ar: 'الأربعاء', en: 'Wed' },
  { key: 'thursday', ar: 'الخميس', en: 'Thu' },
];

// Session Card Component
const SessionCard = ({ session, isRTL, onDragStart, onDragEnd, onSessionClick, conflicts, isLocked }) => {
  const colors = SUBJECT_COLORS[session?.subject_name] || DEFAULT_COLOR;
  const hasConflict = conflicts?.some(c => c.session_id === session?.id);
  
  return (
    <div
      draggable={!isLocked}
      onDragStart={(e) => onDragStart?.(e, session)}
      onDragEnd={onDragEnd}
      onClick={() => onSessionClick?.(session)}
      className={`
        relative p-1.5 rounded-lg cursor-pointer transition-all duration-200
        ${colors.bg} ${colors.border} border
        hover:shadow-md hover:scale-[1.02]
        ${hasConflict ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        ${isLocked ? 'opacity-70' : ''}
      `}
      data-testid={`session-card-${session?.id}`}
    >
      {/* Drag Handle */}
      {!isLocked && (
        <div className="absolute top-1 start-1 opacity-40 hover:opacity-100 cursor-move">
          <GripVertical className="h-3 w-3" />
        </div>
      )}
      
      {/* Lock Icon */}
      {isLocked && (
        <div className="absolute top-1 start-1">
          <Lock className="h-3 w-3 text-orange-500" />
        </div>
      )}
      
      {/* Conflict Icon */}
      {hasConflict && (
        <div className="absolute top-1 end-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
        </div>
      )}
      
      {/* Content */}
      <div className="ps-3">
        <p className={`text-[10px] font-bold truncate ${colors.text}`}>
          {session?.subject_name}
        </p>
        <p className="text-[9px] text-muted-foreground truncate">
          {session?.class_name}
        </p>
      </div>
    </div>
  );
};

// Empty Cell Component
const EmptyCell = ({ day, slot, isRTL, onDragOver, onDrop, canDrop }) => {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(e, day, slot); }}
      onDrop={(e) => onDrop?.(e, day, slot)}
      className={`
        min-h-[40px] rounded-lg border-2 border-dashed border-transparent
        hover:border-brand-turquoise/30 hover:bg-brand-turquoise/5
        transition-all duration-200
        ${canDrop ? 'border-brand-turquoise/50 bg-brand-turquoise/10' : ''}
      `}
      data-testid={`empty-cell-${day}-${slot}`}
    />
  );
};

// Break Cell Component
const BreakCell = ({ isRTL }) => {
  return (
    <div className="min-h-[40px] rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
      <span className="text-[10px] text-amber-600 dark:text-amber-400">
        {isRTL ? 'فسحة' : 'Break'}
      </span>
    </div>
  );
};

// Teacher Row Component
const TeacherRow = ({ 
  teacher, 
  sessions, 
  timeSlots,
  daysToShow, // Add this prop
  isRTL, 
  onDragStart, 
  onDragEnd, 
  onDragOver, 
  onDrop, 
  onSessionClick,
  conflicts,
  lockedSessions,
  expanded,
  onToggleExpand
}) => {
  // Calculate teacher workload
  const totalSessions = sessions.length;
  const maxWorkload = 30; // Max sessions per week
  const workloadPercent = Math.min((totalSessions / maxWorkload) * 100, 100);
  
  // Get sessions for specific day and slot
  const getSessionsForCell = (day, slotNumber) => {
    return sessions.filter(s => 
      (s.day_of_week === day || s.day === day) && 
      s.slot_number === slotNumber
    );
  };
  
  return (
    <div className="border-b border-border/50 hover:bg-muted/30 transition-colors" data-testid={`teacher-row-${teacher.id}`}>
      <div className="flex">
        {/* Teacher Info Column (Fixed) */}
        <div className="w-48 flex-shrink-0 p-3 border-e border-border/50 bg-muted/20 sticky start-0 z-10">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={teacher.avatar_url} />
              <AvatarFallback className="text-xs bg-brand-navy text-white">
                {teacher.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{teacher.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{teacher.specialization}</p>
            </div>
          </div>
          
          {/* Workload indicator */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{isRTL ? 'النصاب' : 'Load'}</span>
              <span>{totalSessions}/{maxWorkload}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  workloadPercent > 90 ? 'bg-red-500' : 
                  workloadPercent > 70 ? 'bg-amber-500' : 'bg-brand-turquoise'
                }`}
                style={{ width: `${workloadPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Schedule Cells */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {daysToShow.map(day => (
              <div key={day.key} className={`${daysToShow.length === 1 ? 'w-[280px]' : 'w-[140px]'} border-e border-border/30 p-1`}>
                <div className="grid grid-rows-7 gap-1">
                  {timeSlots.map((slot, slotIndex) => {
                    const slotNumber = slot.slot_number || slotIndex + 1;
                    const cellSessions = getSessionsForCell(day.key, slotNumber);
                    const isBreak = slot.is_break;
                    
                    if (isBreak) {
                      return <BreakCell key={`${day.key}-${slotNumber}`} isRTL={isRTL} />;
                    }
                    
                    return (
                      <div key={`${day.key}-${slotNumber}`} className="min-h-[40px]">
                        {cellSessions.length > 0 ? (
                          cellSessions.map(session => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              isRTL={isRTL}
                              onDragStart={onDragStart}
                              onDragEnd={onDragEnd}
                              onSessionClick={onSessionClick}
                              conflicts={conflicts}
                              isLocked={lockedSessions?.includes(session.id)}
                            />
                          ))
                        ) : (
                          <EmptyCell
                            day={day.key}
                            slot={slotNumber}
                            isRTL={isRTL}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, day.key, slotNumber, teacher.id)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const TeacherScheduleGrid = ({
  teachers = [],
  sessions = [],
  timeSlots = [],
  classes = [],
  subjects = [],
  conflicts = [],
  lockedSessions = [],
  isRTL = true,
  displayedDays = null, // Optional: specific days to display
  onSessionMove,
  onSessionClick,
  onSessionEdit,
}) => {
  const [draggedSession, setDraggedSession] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [expandedTeachers, setExpandedTeachers] = useState({});
  
  // Use provided displayedDays or default to all DAYS
  const daysToShow = displayedDays || DAYS;

  // Handle drag start
  const handleDragStart = useCallback((e, session) => {
    setDraggedSession(session);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', session.id);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedSession(null);
    setDropTarget(null);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e, day, slot) => {
    e.preventDefault();
    setDropTarget({ day, slot });
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, day, slot, teacherId) => {
    e.preventDefault();
    
    if (!draggedSession) return;
    
    // Check for conflicts before moving
    const existingSessionInSlot = sessions.find(s => 
      s.teacher_id === teacherId &&
      (s.day_of_week === day || s.day === day) &&
      s.slot_number === slot &&
      s.id !== draggedSession.id
    );
    
    if (existingSessionInSlot) {
      toast.error(isRTL 
        ? 'يوجد تعارض! المعلم لديه حصة أخرى في هذا الوقت'
        : 'Conflict! Teacher already has a session at this time'
      );
      return;
    }
    
    // Notify parent of the move
    onSessionMove?.({
      sessionId: draggedSession.id,
      newDay: day,
      newSlot: slot,
      newTeacherId: teacherId,
      oldDay: draggedSession.day_of_week || draggedSession.day,
      oldSlot: draggedSession.slot_number,
      oldTeacherId: draggedSession.teacher_id,
    });
    
    setDraggedSession(null);
    setDropTarget(null);
  }, [draggedSession, sessions, isRTL, onSessionMove]);

  // Get sessions for a specific teacher
  const getTeacherSessions = (teacherId) => {
    return sessions.filter(s => s.teacher_id === teacherId);
  };

  // Toggle teacher row expansion
  const toggleTeacherExpand = (teacherId) => {
    setExpandedTeachers(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background" data-testid="teacher-schedule-grid">
      {/* Header Row */}
      <div className="flex bg-muted/50 sticky top-0 z-20">
        {/* Teacher Column Header */}
        <div className="w-48 flex-shrink-0 p-3 border-e border-b border-border font-medium text-sm flex items-center gap-2 sticky start-0 bg-muted/50 z-30">
          <User className="h-4 w-4 text-brand-navy" />
          {isRTL ? 'المعلم' : 'Teacher'}
        </div>
        
        {/* Day Headers */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {daysToShow.map(day => (
              <div 
                key={day.key} 
                className={`${daysToShow.length === 1 ? 'w-[280px]' : 'w-[140px]'} p-3 border-e border-b border-border text-center`}
              >
                <p className="font-bold text-sm">{isRTL ? day.ar : day.en}</p>
                <p className="text-[10px] text-muted-foreground">{timeSlots.length} {isRTL ? 'حصص' : 'periods'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Period Numbers Row */}
      <div className="flex bg-muted/30 border-b border-border">
        <div className="w-48 flex-shrink-0 border-e border-border sticky start-0 bg-muted/30 z-10 p-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {isRTL ? 'الفترات' : 'Periods'}
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {daysToShow.map(day => (
              <div key={day.key} className={`${daysToShow.length === 1 ? 'w-[280px]' : 'w-[140px]'} border-e border-border`}>
                <div className="grid grid-rows-7 gap-0">
                  {timeSlots.map((slot, idx) => (
                    <div 
                      key={`header-${day.key}-${idx}`} 
                      className={`text-[9px] text-center py-0.5 ${slot.is_break ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                    >
                      {slot.is_break ? (isRTL ? 'فسحة' : 'Break') : `${slot.start_time || ''}`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Teacher Rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {teachers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isRTL ? 'لا يوجد معلمين' : 'No teachers found'}
          </div>
        ) : (
          teachers.map(teacher => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              sessions={getTeacherSessions(teacher.id)}
              timeSlots={timeSlots}
              daysToShow={daysToShow}
              isRTL={isRTL}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onSessionClick={onSessionClick}
              conflicts={conflicts.filter(c => c.teacher_id === teacher.id)}
              lockedSessions={lockedSessions}
              expanded={expandedTeachers[teacher.id]}
              onToggleExpand={() => toggleTeacherExpand(teacher.id)}
            />
          ))
        )}
      </div>
      
      {/* Drag Indicator */}
      {draggedSession && (
        <div className="fixed bottom-4 start-4 z-50 bg-background border border-brand-turquoise rounded-xl p-3 shadow-lg">
          <p className="text-sm font-medium flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-brand-turquoise" />
            {isRTL ? 'جاري نقل:' : 'Moving:'} {draggedSession.subject_name}
          </p>
          <p className="text-xs text-muted-foreground">{draggedSession.class_name}</p>
        </div>
      )}
    </div>
  );
};

export default TeacherScheduleGrid;
