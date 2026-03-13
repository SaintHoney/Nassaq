/**
 * TimetableGrid Component
 * الشبكة الرئيسية للجدول المدرسي
 * 
 * يعرض الجدول الأسبوعي بشكل مرئي واضح
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { 
  Clock, Coffee, Moon, GraduationCap, User, AlertTriangle,
  Lock, Sparkles, Filter, Calendar
} from 'lucide-react';
import { 
  ViewModes, BlockType, EntryType, SessionStatus, 
  getSubjectColor, WEEKDAYS, getWorkingDays 
} from './types';

// ============================================
// Timetable Cell Component
// ============================================
const TimetableCell = ({ 
  entry, 
  showWarnings = true, 
  showColorCoding = true,
  onClick 
}) => {
  if (!entry || entry.entryType === EntryType.EMPTY) {
    return (
      <div 
        className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-dashed border-gray-200 h-full min-h-[85px] flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer"
        onClick={() => onClick && onClick(entry)}
      >
        <span className="text-gray-400 text-xs">فارغة</span>
      </div>
    );
  }

  // Break Cell
  if (entry.entryType === EntryType.BREAK) {
    return (
      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 h-full min-h-[85px] flex items-center justify-center shadow-sm">
        <div className="text-center">
          <Coffee className="h-5 w-5 mx-auto mb-1 text-amber-600" />
          <p className="text-xs font-bold text-amber-700">
            {entry.subjectName || 'استراحة'}
          </p>
        </div>
      </div>
    );
  }

  // Prayer Cell
  if (entry.entryType === EntryType.PRAYER) {
    return (
      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 h-full min-h-[85px] flex items-center justify-center shadow-sm">
        <div className="text-center">
          <Moon className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
          <p className="text-xs font-bold text-emerald-700">
            {entry.subjectName || 'صلاة'}
          </p>
        </div>
      </div>
    );
  }

  // Lecture Cell
  const colors = showColorCoding ? getSubjectColor(entry.subjectName) : {
    bg: 'bg-gradient-to-br from-gray-100 to-slate-200',
    border: 'border-gray-300',
    text: 'text-gray-800',
    badge: 'bg-gray-200'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            onClick={() => onClick && onClick(entry)}
            className={`p-3 rounded-xl ${colors.bg} ${colors.border} border cursor-pointer
              hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full min-h-[85px]
              shadow-md backdrop-blur-sm relative`}
            data-testid={`session-${entry.id}`}
          >
            {/* Status Indicators */}
            <div className="absolute top-1 left-1 flex gap-1">
              {entry.isLocked && (
                <Lock className="h-3 w-3 text-white/80" />
              )}
              {entry.isAiGenerated && (
                <Sparkles className="h-3 w-3 text-white/80" />
              )}
              {entry.hasWarning && showWarnings && (
                <AlertTriangle className="h-3 w-3 text-yellow-300" />
              )}
            </div>

            <div className="flex flex-col h-full justify-between">
              <div>
                <p className={`font-bold text-sm ${colors.text} leading-tight drop-shadow-sm`}>
                  {entry.subjectName?.split('/')[0]?.trim() || 'مادة'}
                </p>
                <p className={`text-xs ${colors.text} opacity-90 mt-1 truncate`}>
                  {entry.teacherName || 'معلم'}
                </p>
              </div>
              <div className="mt-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} ${colors.text}`}>
                  {entry.className?.replace('الصف ', '')?.substring(0, 15) || 'فصل'}
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-white border shadow-lg p-3">
          <div className="space-y-1 text-sm">
            <p className="font-bold">{entry.subjectName}</p>
            <p className="text-muted-foreground">المعلم: {entry.teacherName}</p>
            <p className="text-muted-foreground">الفصل: {entry.className}</p>
            {entry.roomName && (
              <p className="text-muted-foreground">القاعة: {entry.roomName}</p>
            )}
            {entry.isAiGenerated && (
              <Badge variant="outline" className="text-xs">AI Generated</Badge>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// Empty Grid State Component
// ============================================
const TimetableEmptyGridState = ({ 
  reason = 'no_version', 
  onGenerate, 
  onClearFilters 
}) => {
  const getContent = () => {
    switch (reason) {
      case 'no_version':
        return {
          icon: <Clock className="h-16 w-16 text-muted-foreground/30" />,
          title: 'لا توجد نسخة جدول',
          description: 'قم بتوليد جدول جديد باستخدام الذكاء الاصطناعي',
          action: onGenerate && (
            <button
              onClick={onGenerate}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors"
            >
              توليد الجدول
            </button>
          )
        };
      case 'no_filter_selection':
        return {
          icon: <Filter className="h-16 w-16 text-muted-foreground/30" />,
          title: 'اختر فلتر لعرض الجدول',
          description: 'اختر فصلاً أو معلماً أو يوماً من القائمة أعلاه',
          action: null
        };
      case 'no_matching_results':
        return {
          icon: <Filter className="h-16 w-16 text-muted-foreground/30" />,
          title: 'لا توجد نتائج مطابقة',
          description: 'جرب تعديل الفلاتر أو مسح البحث',
          action: onClearFilters && (
            <button
              onClick={onClearFilters}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              مسح الفلاتر
            </button>
          )
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-muted-foreground/30" />,
          title: 'لا توجد بيانات',
          description: '',
          action: null
        };
    }
  };

  const content = getContent();

  return (
    <div 
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="timetable-empty-state"
    >
      {content.icon}
      <h3 className="text-xl font-bold mt-4 mb-2">{content.title}</h3>
      <p className="text-muted-foreground max-w-md">{content.description}</p>
      {content.action}
    </div>
  );
};

// ============================================
// Grid Skeleton Component
// ============================================
const TimetableGridSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-muted/30">
            <th className="p-3 w-[100px]"><Skeleton className="h-6 w-16 mx-auto" /></th>
            {[1, 2, 3, 4, 5].map(i => (
              <th key={i} className="p-3"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7].map(row => (
            <tr key={row}>
              <td className="p-2 border-e bg-muted/20">
                <Skeleton className="h-12 w-full" />
              </td>
              {[1, 2, 3, 4, 5].map(col => (
                <td key={col} className="p-2 border-e">
                  <Skeleton className="h-[85px] w-full rounded-xl" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// Main Timetable Grid Section Component
// ============================================
const TimetableGridSection = ({
  loading = false,
  hasData = false,
  gridData = null,
  activeViewMode = ViewModes.CLASS,
  workingDays = [],
  timeSlots = [],
  sessions = [],
  selectedFilter = null,
  filterType = 'class',
  showBreaks = true,
  showPrayer = true,
  showWarnings = true,
  showColorCoding = true,
  onSessionClick,
  onGenerate,
  onClearFilters
}) => {

  // Get working days or use default
  const days = workingDays.length > 0 
    ? workingDays 
    : WEEKDAYS.filter(d => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].includes(d.key));

  // Get session for a specific cell
  const getSessionForCell = (dayKey, slotId, slotNumber) => {
    return sessions.find(s => {
      const dayMatch = s.day_of_week === dayKey || s.day === dayKey;
      const slotMatch = 
        s.time_slot_id === slotId || 
        s.period_number === slotId ||
        s.period_number === slotNumber ||
        s.slot_number === slotNumber;
      
      // Apply filter
      let filterMatch = true;
      if (selectedFilter) {
        if (filterType === 'class') {
          filterMatch = s.class_id === selectedFilter;
        } else if (filterType === 'teacher') {
          filterMatch = s.teacher_id === selectedFilter;
        }
      }
      
      return dayMatch && slotMatch && filterMatch;
    });
  };

  // Convert session to entry format
  const sessionToEntry = (session, slot) => {
    if (!session) return null;
    
    return {
      id: session.id,
      entryType: EntryType.LECTURE,
      subjectName: session.subject_name,
      teacherName: session.teacher_name,
      className: session.class_name,
      roomName: session.room_name,
      isAiGenerated: session.is_ai_generated || session.source === 'ai',
      isLocked: session.is_locked || session.status === SessionStatus.LOCKED,
      hasWarning: session.has_warning || (session.warnings && session.warnings.length > 0),
      warningCount: session.warning_count || session.warnings?.length || 0,
      status: session.status
    };
  };

  // Check if slot is break or prayer
  const isBreakSlot = (slot) => {
    return slot.is_break || slot.type === 'break';
  };

  const isPrayerSlot = (slot) => {
    return slot.type === 'prayer';
  };

  // Loading State
  if (loading) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <TimetableGridSkeleton />
        </CardContent>
      </Card>
    );
  }

  // No Data State
  if (!hasData || timeSlots.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/30">
        <CardContent>
          <TimetableEmptyGridState 
            reason={timeSlots.length === 0 ? 'no_version' : 'no_filter_selection'}
            onGenerate={onGenerate}
            onClearFilters={onClearFilters}
          />
        </CardContent>
      </Card>
    );
  }

  // Filter slots based on toggles - define early for use in all views
  const visibleSlots = timeSlots.filter(slot => {
    if (!showBreaks && isBreakSlot(slot)) return false;
    if (!showPrayer && isPrayerSlot(slot)) return false;
    return true;
  });

  // No Filter Selected - Show all sessions in a different view
  if (!selectedFilter && sessions.length > 0) {
    // Show condensed view of all sessions
    return (
      <Card className="border-2 border-brand-navy/20 overflow-hidden" data-testid="timetable-grid">
        <CardHeader className="bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-brand-navy" />
              <div>
                <CardTitle className="text-lg">الجدول الأسبوعي (كل الحصص)</CardTitle>
                <CardDescription>
                  {sessions.length} حصة مجدولة - اختر فصلاً أو معلماً لعرض تفصيلي
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-3 text-center font-bold w-[100px] text-sm rounded-tr-xl">
                  الحصة
                </th>
                {days.map((day, idx) => (
                  <th 
                    key={day.key} 
                    className={`p-3 text-center ${idx === days.length - 1 ? 'rounded-tl-xl' : ''}`}
                  >
                    <Badge variant="outline" className="text-xs bg-white shadow-sm">
                      {day.ar || day.label}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleSlots.map((slot, idx) => (
                <tr key={slot.id || idx} className="border-b hover:bg-muted/10">
                  <td className="p-2 text-center border-l">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-brand-navy">
                        {slot.label || `حصة ${slot.number || idx + 1}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {slot.startTime || slot.start_time} - {slot.endTime || slot.end_time}
                      </span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const daySessions = sessions.filter(s => {
                      const dayMatch = s.day_of_week === day.key || s.day === day.key;
                      const slotMatch = s.period_number === slot.number || s.period_number === (idx + 1);
                      return dayMatch && slotMatch;
                    });
                    return (
                      <td key={day.key} className="p-1 border-l min-w-[150px]">
                        {daySessions.length > 0 ? (
                          <div className="space-y-1">
                            {daySessions.slice(0, 3).map(session => (
                              <div 
                                key={session.id}
                                onClick={() => onSessionClick && onSessionClick(session)}
                                className="p-1.5 rounded bg-brand-navy/10 text-xs cursor-pointer hover:bg-brand-navy/20"
                              >
                                <p className="font-medium truncate text-brand-navy">{session.subject_name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{session.teacher_name}</p>
                              </div>
                            ))}
                            {daySessions.length > 3 && (
                              <p className="text-[10px] text-center text-muted-foreground">+{daySessions.length - 3} أخرى</p>
                            )}
                          </div>
                        ) : (
                          <div className="h-10" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }
  
  // No Filter Selected and no sessions
  if (!selectedFilter) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/30">
        <CardContent>
          <TimetableEmptyGridState 
            reason="no_filter_selection"
            onClearFilters={onClearFilters}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-brand-navy/20 overflow-hidden" data-testid="timetable-grid">
      <CardHeader className="bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {filterType === 'class' ? (
              <GraduationCap className="h-6 w-6 text-brand-navy" />
            ) : (
              <User className="h-6 w-6 text-brand-navy" />
            )}
            <div>
              <CardTitle className="text-lg">الجدول الأسبوعي</CardTitle>
              <CardDescription>
                {sessions.length} حصة مجدولة
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {visibleSlots.filter(s => !isBreakSlot(s) && !isPrayerSlot(s)).length} حصة
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            {/* Header Row - Days */}
            <thead>
              <tr className="bg-muted/30">
                <th className="p-3 text-center font-medium border-b border-e w-[100px]">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>الحصة</span>
                  </div>
                </th>
                {days.map(day => (
                  <th key={day.key} className="p-3 text-center font-medium border-b border-e">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${day.color} text-white text-sm`}>
                      {day.ar}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body Rows - Time Slots */}
            <tbody>
              {visibleSlots.map((slot, idx) => {
                const isBreak = isBreakSlot(slot);
                const isPrayer = isPrayerSlot(slot);

                return (
                  <tr key={slot.id} className={`${idx % 2 === 0 ? '' : 'bg-muted/5'} hover:bg-muted/10 transition-colors`}>
                    {/* Time Slot Label */}
                    <td className="p-2 border-e bg-muted/20">
                      <div className="text-center">
                        <p className="font-bold text-sm">
                          {isBreak || isPrayer 
                            ? (slot.name_ar || slot.name || (isPrayer ? 'صلاة' : 'استراحة'))
                            : `الحصة ${slot.slot_number || idx + 1}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                        </p>
                      </div>
                    </td>

                    {/* Session Cells for Each Day */}
                    {days.map(day => {
                      if (isBreak) {
                        return (
                          <td key={`${day.key}-${slot.id}`} className="p-2 border-e">
                            <TimetableCell 
                              entry={{
                                entryType: EntryType.BREAK,
                                subjectName: slot.name_ar || slot.name
                              }}
                              showColorCoding={showColorCoding}
                            />
                          </td>
                        );
                      }

                      if (isPrayer) {
                        return (
                          <td key={`${day.key}-${slot.id}`} className="p-2 border-e">
                            <TimetableCell 
                              entry={{
                                entryType: EntryType.PRAYER,
                                subjectName: slot.name_ar || slot.name
                              }}
                              showColorCoding={showColorCoding}
                            />
                          </td>
                        );
                      }

                      const session = getSessionForCell(day.key, slot.id, slot.slot_number);
                      const entry = sessionToEntry(session, slot);

                      return (
                        <td key={`${day.key}-${slot.id}`} className="p-2 border-e">
                          <TimetableCell 
                            entry={entry}
                            showWarnings={showWarnings}
                            showColorCoding={showColorCoding}
                            onClick={() => onSessionClick && session && onSessionClick(session)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableGridSection;
export { TimetableCell, TimetableEmptyGridState, TimetableGridSkeleton };
