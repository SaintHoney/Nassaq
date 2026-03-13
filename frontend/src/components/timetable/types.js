/**
 * نظام أنواع صفحة الجدول المدرسي
 * Timetable Page Type Definitions
 */

// ============================================
// View Modes
// ============================================
export const ViewModes = {
  CLASS: 'class',
  TEACHER: 'teacher',
  GRADE: 'grade',
  DAY: 'day'
};

// ============================================
// Timetable Status
// ============================================
export const TimetableStatus = {
  NONE: 'none',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  GENERATING: 'generating',
  FAILED: 'failed',
  ARCHIVED: 'archived'
};

// ============================================
// Readiness Status
// ============================================
export const ReadinessStatus = {
  NOT_READY: 'NOT_READY',
  PARTIALLY_READY: 'PARTIALLY_READY',
  FULLY_READY: 'FULLY_READY'
};

// ============================================
// Issue Types
// ============================================
export const IssueType = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
};

// ============================================
// Issue Severity
// ============================================
export const IssueSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// ============================================
// Entry Types (Cell Types)
// ============================================
export const EntryType = {
  LECTURE: 'lecture',
  BREAK: 'break',
  PRAYER: 'prayer',
  ASSEMBLY: 'assembly',
  CUSTOM: 'custom',
  EMPTY: 'empty'
};

// ============================================
// Block Types (Row Types)
// ============================================
export const BlockType = {
  PERIOD: 'period',
  BREAK: 'break',
  PRAYER: 'prayer',
  ASSEMBLY: 'assembly',
  CUSTOM: 'custom'
};

// ============================================
// Session Status
// ============================================
export const SessionStatus = {
  SCHEDULED: 'scheduled',
  MODIFIED: 'modified',
  LOCKED: 'locked',
  CANCELLED: 'cancelled'
};

// ============================================
// Generation Mode
// ============================================
export const GenerationMode = {
  FULL: 'full',
  PARTIAL_CLASS: 'class',
  PARTIAL_TEACHER: 'teacher',
  PARTIAL_DAY: 'day',
  PARTIAL_SUBJECT: 'subject'
};

// ============================================
// Days of Week
// ============================================
export const WEEKDAYS = [
  { key: 'sunday', number: 0, ar: 'الأحد', en: 'Sunday', short: 'Sun', color: 'from-blue-500 to-blue-600' },
  { key: 'monday', number: 1, ar: 'الإثنين', en: 'Monday', short: 'Mon', color: 'from-purple-500 to-purple-600' },
  { key: 'tuesday', number: 2, ar: 'الثلاثاء', en: 'Tuesday', short: 'Tue', color: 'from-green-500 to-green-600' },
  { key: 'wednesday', number: 3, ar: 'الأربعاء', en: 'Wednesday', short: 'Wed', color: 'from-amber-500 to-amber-600' },
  { key: 'thursday', number: 4, ar: 'الخميس', en: 'Thursday', short: 'Thu', color: 'from-rose-500 to-rose-600' },
  { key: 'friday', number: 5, ar: 'الجمعة', en: 'Friday', short: 'Fri', color: 'from-emerald-500 to-emerald-600' },
  { key: 'saturday', number: 6, ar: 'السبت', en: 'Saturday', short: 'Sat', color: 'from-slate-500 to-slate-600' },
];

// ============================================
// Subject Colors
// ============================================
export const SUBJECT_COLORS = {
  'لغتي': { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', border: 'border-emerald-300', text: 'text-white', badge: 'bg-emerald-700/30' },
  'اللغة العربية': { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', border: 'border-emerald-300', text: 'text-white', badge: 'bg-emerald-700/30' },
  'الرياضيات': { bg: 'bg-gradient-to-br from-blue-400 to-indigo-500', border: 'border-blue-300', text: 'text-white', badge: 'bg-blue-700/30' },
  'العلوم': { bg: 'bg-gradient-to-br from-purple-400 to-violet-500', border: 'border-purple-300', text: 'text-white', badge: 'bg-purple-700/30' },
  'الدراسات الإسلامية': { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', border: 'border-amber-300', text: 'text-white', badge: 'bg-amber-700/30' },
  'القرآن': { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', border: 'border-yellow-300', text: 'text-white', badge: 'bg-yellow-700/30' },
  'اللغة الإنجليزية': { bg: 'bg-gradient-to-br from-rose-400 to-pink-500', border: 'border-rose-300', text: 'text-white', badge: 'bg-rose-700/30' },
  'التربية الفنية': { bg: 'bg-gradient-to-br from-fuchsia-400 to-pink-500', border: 'border-fuchsia-300', text: 'text-white', badge: 'bg-fuchsia-700/30' },
  'التربية البدنية': { bg: 'bg-gradient-to-br from-cyan-400 to-sky-500', border: 'border-cyan-300', text: 'text-white', badge: 'bg-cyan-700/30' },
  'الدراسات الاجتماعية': { bg: 'bg-gradient-to-br from-lime-400 to-green-500', border: 'border-lime-300', text: 'text-white', badge: 'bg-lime-700/30' },
  'المهارات الرقمية': { bg: 'bg-gradient-to-br from-slate-400 to-gray-500', border: 'border-slate-300', text: 'text-white', badge: 'bg-slate-700/30' },
  'الحاسب': { bg: 'bg-gradient-to-br from-slate-400 to-gray-500', border: 'border-slate-300', text: 'text-white', badge: 'bg-slate-700/30' },
  default: { bg: 'bg-gradient-to-br from-gray-400 to-slate-500', border: 'border-gray-300', text: 'text-white', badge: 'bg-gray-700/30' }
};

// ============================================
// Helper Functions
// ============================================
export const getSubjectColor = (subjectName) => {
  if (!subjectName) return SUBJECT_COLORS.default;
  for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
    if (subjectName.includes(key)) return value;
  }
  return SUBJECT_COLORS.default;
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case TimetableStatus.PUBLISHED:
      return 'bg-green-100 text-green-800 border-green-200';
    case TimetableStatus.DRAFT:
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case TimetableStatus.GENERATING:
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case TimetableStatus.FAILED:
      return 'bg-red-100 text-red-800 border-red-200';
    case TimetableStatus.ARCHIVED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case TimetableStatus.PUBLISHED:
      return { ar: 'منشور', en: 'Published' };
    case TimetableStatus.DRAFT:
      return { ar: 'مسودة', en: 'Draft' };
    case TimetableStatus.GENERATING:
      return { ar: 'جاري التوليد', en: 'Generating' };
    case TimetableStatus.FAILED:
      return { ar: 'فشل', en: 'Failed' };
    case TimetableStatus.ARCHIVED:
      return { ar: 'مؤرشف', en: 'Archived' };
    case TimetableStatus.NONE:
      return { ar: 'لا يوجد', en: 'None' };
    default:
      return { ar: status, en: status };
  }
};

export const getWeekdayByKey = (key) => {
  return WEEKDAYS.find(d => d.key === key) || WEEKDAYS[0];
};

export const getWorkingDays = (workingDaysArray) => {
  if (!workingDaysArray || !Array.isArray(workingDaysArray)) {
    // Default working days (Sunday - Thursday)
    return WEEKDAYS.filter(d => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].includes(d.key));
  }
  return WEEKDAYS.filter(d => workingDaysArray.includes(d.key));
};
