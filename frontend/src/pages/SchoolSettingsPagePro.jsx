/**
 * صفحة إعدادات المدرسة - التصميم الاحترافي الشامل
 * تعرض جميع البيانات من قاعدة البيانات مع إمكانية التعديل والحذف والإضافة
 * 
 * الأقسام الرئيسية:
 * 1. أيام العمل والعطلات
 * 2. التوزيع الزمني الكامل (الفترات، الاستراحات، الصلاة)
 * 3. بيانات المعلمين
 * 4. بيانات الفصول
 * 5. المواد الدراسية
 * 6. رتب المعلمين والنصاب التدريسي
 * 7. القيود الإدارية
 * 8. الهيكل الأكاديمي
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Progress } from '../components/ui/progress';

// Icons
import {
  Settings, Globe, Sun, Moon, RefreshCw, Save, Edit2, Plus, Trash2, X,
  Calendar, Clock, Users, BookOpen, GraduationCap, Shield, Target,
  ChevronRight, ChevronDown, ChevronLeft, Building2, MapPin, Phone, Mail,
  Grid3X3, Coffee, Play, CheckCircle2, AlertTriangle, Info, Eye, EyeOff,
  CalendarDays, Timer, Loader2, FileText, Copy, Check, School, Layers,
  AlertCircle, Ban, Star, Award, Bookmark, ArrowRight, ArrowUpDown, Filter
} from 'lucide-react';
import { NotificationBell } from '../components/notifications/NotificationBell';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============================================
// الثوابت
// ============================================
const DAYS_AR = {
  sunday: 'الأحد',
  monday: 'الإثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
  saturday: 'السبت'
};

const CATEGORY_COLORS = {
  language: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: 'text-blue-600' },
  science: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: 'text-green-600' },
  islamic: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: 'text-emerald-600' },
  activity: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: 'text-orange-600' },
  social: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: 'text-purple-600' },
  technology: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', icon: 'text-cyan-600' },
  skills: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', icon: 'text-pink-600' },
  default: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: 'text-gray-600' },
};

// ============================================
// مكون كارت الإحصائيات
// ============================================
const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
  <Card 
    className={`border-2 ${color} cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
    onClick={onClick}
    data-testid={`stat-card-${title}`}
  >
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-opacity-20 flex items-center justify-center ${color.replace('border-', 'bg-').replace('-200', '-100')}`}>
            <Icon className={`h-6 w-6 ${color.replace('border-', 'text-').replace('-200', '-600')}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        {trend && (
          <Badge variant="secondary" className="text-xs">
            {trend}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================
// مكون عرض الأيام التفاعلي
// ============================================
const DaysGrid = ({ workDays = [], weekendDays = [], onToggle, editable = false }) => {
  const allDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  return (
    <div className="grid grid-cols-7 gap-2">
      {allDays.map((day) => {
        const isWorkDay = workDays.includes(DAYS_AR[day]) || workDays.includes(day);
        const isWeekend = weekendDays.includes(DAYS_AR[day]) || weekendDays.includes(day);
        
        return (
          <div
            key={day}
            onClick={() => editable && onToggle?.(day)}
            className={`
              p-3 rounded-xl text-center transition-all duration-200
              ${editable ? 'cursor-pointer hover:scale-105' : ''}
              ${isWorkDay 
                ? 'bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-400 text-green-800 shadow-sm' 
                : isWeekend
                  ? 'bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-300 text-red-700'
                  : 'bg-gray-100 border-2 border-gray-200 text-gray-500'
              }
            `}
          >
            <p className="font-bold text-sm">{DAYS_AR[day]}</p>
            <p className="text-[10px] mt-1 opacity-80">
              {isWorkDay ? 'دراسة' : 'عطلة'}
            </p>
            {isWorkDay && (
              <CheckCircle2 className="h-3 w-3 mx-auto mt-1 text-green-600" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// مكون عرض الفترة الزمنية
// ============================================
const TimeSlotItem = ({ slot, index, onEdit, onDelete }) => {
  const getSlotStyle = (type) => {
    switch(type) {
      case 'break': return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-800';
      case 'prayer': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800';
      default: return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-800';
    }
  };
  
  const getSlotIcon = (type) => {
    switch(type) {
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'prayer': return <Moon className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getSlotLabel = (type) => {
    switch(type) {
      case 'break': return 'استراحة';
      case 'prayer': return 'صلاة';
      default: return 'حصة';
    }
  };
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${getSlotStyle(slot.type || 'period')} hover:shadow-md transition-all group`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
          {slot.type === 'period' ? (
            <span className="font-bold text-lg text-blue-600">{slot.slot_number || index + 1}</span>
          ) : (
            getSlotIcon(slot.type)
          )}
        </div>
        <div>
          <p className="font-bold text-base">{slot.name_ar || slot.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {slot.duration || slot.duration_minutes} دقيقة
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getSlotLabel(slot.type)}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-left bg-white px-4 py-2 rounded-lg shadow-sm">
          <p className="text-xs text-muted-foreground">من - إلى</p>
          <p className="font-mono font-bold text-lg">
            {slot.start_time} <span className="text-muted-foreground">-</span> {slot.end_time}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(slot)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => onDelete(slot)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// مكون كارت المعلم
// ============================================
const TeacherItem = ({ teacher }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 hover:shadow-lg hover:border-violet-300 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">
          {(teacher.full_name || teacher.full_name_ar || 'م')?.charAt(0)}
        </span>
      </div>
      <div>
        <p className="font-bold text-violet-900">{teacher.full_name || teacher.full_name_ar}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-violet-100 text-violet-700 border-violet-300 text-xs">
            {teacher.subject_name || teacher.specialization || 'غير محدد'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {teacher.rank_name_ar || teacher.rank_name || 'معلم'}
          </Badge>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-center bg-white px-4 py-2 rounded-lg shadow-sm">
        <p className="text-2xl font-bold text-violet-600">{teacher.weekly_periods || 24}</p>
        <p className="text-xs text-muted-foreground">حصة/أسبوع</p>
      </div>
    </div>
  </div>
);

// ============================================
// مكون كارت الفصل
// ============================================
const ClassItem = ({ classItem }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200 hover:shadow-lg hover:border-cyan-300 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
        <GraduationCap className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-cyan-900">{classItem.name || classItem.name_ar}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300 text-xs">
            {classItem.grade_name_ar || classItem.grade_name || 'غير محدد'}
          </Badge>
          {classItem.section && (
            <Badge variant="outline" className="text-xs">
              شعبة {classItem.section}
            </Badge>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-center bg-white px-4 py-2 rounded-lg shadow-sm">
        <p className="text-2xl font-bold text-cyan-600">{classItem.current_students || classItem.student_count || 0}</p>
        <p className="text-xs text-muted-foreground">طالب</p>
      </div>
    </div>
  </div>
);

// ============================================
// مكون كارت المادة
// ============================================
const SubjectItem = ({ subject, onEdit, onDelete }) => {
  const colors = CATEGORY_COLORS[subject.category] || CATEGORY_COLORS.default;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${colors.bg} border-2 ${colors.border} hover:shadow-md transition-all group`}>
      <div className="flex items-center gap-3">
        <BookOpen className={`h-5 w-5 ${colors.icon}`} />
        <div>
          <p className={`font-bold text-sm ${colors.text}`}>{subject.name_ar}</p>
          <p className="text-xs text-muted-foreground">{subject.name_en}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs font-bold">
          {subject.weekly_periods} ح/أسبوع
        </Badge>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onDelete(subject)}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// مكون كارت رتبة المعلم
// ============================================
const RankItem = ({ rank }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
        <Award className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="font-bold text-teal-800">{rank.name_ar}</p>
        <p className="text-xs text-muted-foreground">{rank.name_en}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-center bg-white px-3 py-2 rounded-lg shadow-sm">
        <p className="text-xl font-bold text-teal-600">{rank.weekly_periods}</p>
        <p className="text-[10px] text-muted-foreground">حصة/أسبوع</p>
      </div>
      <div className="text-center bg-white px-3 py-2 rounded-lg shadow-sm">
        <p className="text-xl font-bold text-cyan-600">{rank.daily_max}</p>
        <p className="text-[10px] text-muted-foreground">حد يومي</p>
      </div>
      {rank.is_special_education && (
        <Badge className="bg-purple-100 text-purple-700">تربية خاصة</Badge>
      )}
    </div>
  </div>
);

// ============================================
// مكون كارت القيد الإداري مع زر التفعيل
// ============================================
const ConstraintItem = ({ constraint, index, onToggle }) => {
  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      default: return 'عادي';
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 hover:shadow-md transition-all">
      <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-rose-700">{index + 1}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-bold text-rose-800">{constraint.name_ar}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${getPriorityStyle(constraint.priority)}`}>
              {getPriorityLabel(constraint.priority)}
            </Badge>
            <Button
              variant={constraint.is_active ? "default" : "outline"}
              size="sm"
              className={`text-xs h-7 ${constraint.is_active ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => onToggle?.(constraint)}
              data-testid={`toggle-constraint-${constraint.id}`}
            >
              {constraint.is_active ? (
                <>
                  <CheckCircle2 className="h-3 w-3 ml-1" /> مفعّل
                </>
              ) : (
                <>
                  <Ban className="h-3 w-3 ml-1" /> معطّل
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-rose-600 mt-2">{constraint.description_ar}</p>
        {constraint.restricted_periods && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">الحصص المقيدة:</span>
            {constraint.restricted_periods.map(p => (
              <Badge key={p} variant="secondary" className="text-xs">ح{p}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// مكون الهيكل الأكاديمي
// ============================================
const AcademicStructureView = ({ stages, grades, tracks }) => {
  const [expandedStage, setExpandedStage] = useState(null);

  return (
    <div className="space-y-4">
      {stages?.map((stage) => {
        const stageGrades = grades?.filter(g => g.stage_id === stage.id) || [];
        const isExpanded = expandedStage === stage.id;
        
        return (
          <Card key={stage.id} className="border-2 border-blue-200 overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-blue-50/50 transition-colors py-4"
              onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <School className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{stage.name_ar}</CardTitle>
                    <CardDescription className="text-xs">{stage.name_en}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-700">
                    {stageGrades.length} صف
                  </Badge>
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="bg-blue-50/30 border-t">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                  {stageGrades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{grade.order}</span>
                        </div>
                        <span className="font-medium text-sm">{grade.name_ar}</span>
                      </div>
                      {grade.is_lower_grades && (
                        <Badge variant="outline" className="text-xs">صفوف أولية</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
      
      {/* المسارات التعليمية */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">المسارات التعليمية</CardTitle>
              <CardDescription className="text-xs">Education Tracks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-3">
            {tracks?.map((track) => (
              <div key={track.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2">
                  <Bookmark className={`h-5 w-5 ${track.is_quran_track ? 'text-emerald-600' : 'text-purple-600'}`} />
                  <div>
                    <p className="font-medium text-sm">{track.name_ar}</p>
                    <p className="text-xs text-muted-foreground">{track.name_en}</p>
                  </div>
                </div>
                {track.is_quran_track && (
                  <Badge className="bg-emerald-100 text-emerald-700">تحفيظ</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// الصفحة الرئيسية
// ============================================
export default function SchoolSettingsPagePro() {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit Mode States
  const [editDayTimesOpen, setEditDayTimesOpen] = useState(false);
  const [editTimeSlotsOpen, setEditTimeSlotsOpen] = useState(false);
  const [editConstraintOpen, setEditConstraintOpen] = useState(false);
  const [selectedConstraint, setSelectedConstraint] = useState(null);
  
  // Edit Form States
  const [editedDayTimes, setEditedDayTimes] = useState({
    dayStart: '07:00',
    dayEnd: '13:15',
    periodsPerDay: 7,
    periodDuration: 45,
    breakDuration: 20,
    prayerDuration: 20,
  });
  
  // Data States
  const [schoolInfo, setSchoolInfo] = useState({});
  const [settings, setSettings] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherRanks, setTeacherRanks] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [defaultSettings, setDefaultSettings] = useState({});
  
  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        settingsRes,
        teachersRes,
        classesRes,
        ranksRes,
        constraintsRes,
        stagesRes,
        gradesRes,
        tracksRes,
        subjectsRes,
        defaultSettingsRes
      ] = await Promise.all([
        api.get('/school/settings').catch(() => ({ data: {} })),
        api.get('/teachers').catch(() => ({ data: [] })),
        api.get('/classes').catch(() => ({ data: [] })),
        api.get('/reference/teacher-ranks').catch(() => ({ data: [] })),
        api.get('/reference/admin-constraints').catch(() => ({ data: [] })),
        api.get('/reference/stages').catch(() => ({ data: [] })),
        api.get('/reference/grades').catch(() => ({ data: [] })),
        api.get('/reference/tracks').catch(() => ({ data: [] })),
        api.get('/reference/subjects').catch(() => ({ data: [] })),
        api.get('/reference/default-settings').catch(() => ({ data: {} })),
      ]);
      
      const settingsData = settingsRes.data || {};
      
      setSchoolInfo(settingsData.school_info || {});
      setSettings({
        workingDays: settingsData.settings?.working_days_ar || ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        weekendDays: settingsData.settings?.weekend_days_ar || ['الجمعة', 'السبت'],
        periodsPerDay: settingsData.periods_per_day || settingsData.settings?.periods_per_day || 7,
        periodDuration: settingsData.settings?.period_duration_minutes || 45,
        breakDuration: settingsData.settings?.break_duration_minutes || 20,
        prayerDuration: settingsData.settings?.prayer_duration_minutes || 20,
        dayStart: settingsData.school_day_start || settingsData.settings?.school_day_start || '07:00',
        dayEnd: settingsData.school_day_end || settingsData.settings?.school_day_end || '13:15',
        timeSlots: settingsData.time_slots || settingsData.settings?.time_slots || [],
      });
      
      setTeachers(teachersRes.data || []);
      setClasses(classesRes.data || []);
      setTeacherRanks(ranksRes.data || []);
      setConstraints(constraintsRes.data || []);
      setStages(stagesRes.data || []);
      setGrades(gradesRes.data || []);
      setTracks(tracksRes.data || []);
      setDefaultSettings(defaultSettingsRes.data || {});
      
      // Get unique subjects for display
      const allSubjects = subjectsRes.data || [];
      const uniqueSubjects = allSubjects.reduce((acc, curr) => {
        if (!acc.find(s => s.name_ar === curr.name_ar)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      setSubjects(uniqueSubjects.slice(0, 20)); // Show first 20 unique
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [api]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Save day times settings
  const saveDayTimes = async () => {
    setSaving(true);
    try {
      // Generate new time slots based on settings
      const newTimeSlots = [];
      let currentTime = editedDayTimes.dayStart;
      
      const addMinutes = (time, minutes) => {
        const [h, m] = time.split(':').map(Number);
        const totalMinutes = h * 60 + m + minutes;
        const newH = Math.floor(totalMinutes / 60);
        const newM = totalMinutes % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
      };
      
      for (let i = 1; i <= editedDayTimes.periodsPerDay; i++) {
        const endTime = addMinutes(currentTime, editedDayTimes.periodDuration);
        newTimeSlots.push({
          slot_number: i,
          name_ar: `الحصة ${['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة'][i-1] || i}`,
          name: `Period ${i}`,
          start_time: currentTime,
          end_time: endTime,
          duration_minutes: editedDayTimes.periodDuration,
          type: 'period',
          is_break: false,
        });
        currentTime = endTime;
        
        // Add break after 3rd period
        if (i === 3) {
          const breakEnd = addMinutes(currentTime, editedDayTimes.breakDuration);
          newTimeSlots.push({
            slot_number: null,
            name_ar: 'الاستراحة',
            name: 'Break',
            start_time: currentTime,
            end_time: breakEnd,
            duration_minutes: editedDayTimes.breakDuration,
            type: 'break',
            is_break: true,
          });
          currentTime = breakEnd;
        }
        
        // Add prayer after 5th period
        if (i === 5) {
          const prayerEnd = addMinutes(currentTime, editedDayTimes.prayerDuration);
          newTimeSlots.push({
            slot_number: null,
            name_ar: 'فترة الصلاة',
            name: 'Prayer',
            start_time: currentTime,
            end_time: prayerEnd,
            duration_minutes: editedDayTimes.prayerDuration,
            type: 'prayer',
            is_break: true,
          });
          currentTime = prayerEnd;
        }
      }
      
      await api.put('/school/settings', {
        settings: {
          school_day_start: editedDayTimes.dayStart,
          school_day_end: editedDayTimes.dayEnd,
          periods_per_day: editedDayTimes.periodsPerDay,
          period_duration_minutes: editedDayTimes.periodDuration,
          break_duration_minutes: editedDayTimes.breakDuration,
          prayer_duration_minutes: editedDayTimes.prayerDuration,
          time_slots: newTimeSlots,
        }
      });
      
      toast.success('تم حفظ مواعيد اليوم الدراسي بنجاح');
      setEditDayTimesOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(error.response?.data?.detail || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle constraint active status
  const toggleConstraint = async (constraint) => {
    try {
      await api.put(`/school/constraints/${constraint.id}`, {
        is_active: !constraint.is_active
      });
      toast.success(`تم ${constraint.is_active ? 'تعطيل' : 'تفعيل'} القيد بنجاح`);
      fetchData();
    } catch (error) {
      console.error('Error toggling constraint:', error);
      toast.error('فشل تحديث القيد');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-turquoise flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-navy mb-4" />
            <p className="text-muted-foreground font-medium">جاري تحميل إعدادات المدرسة...</p>
          </div>
        </div>
      </Sidebar>
    );
  }
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background" data-testid="school-settings-page-pro">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-turquoise flex items-center justify-center shadow-lg">
                <Settings className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="font-cairo text-2xl font-bold text-foreground">
                  مرحباً، {user?.full_name || 'المستخدم'}
                </h1>
                <p className="text-base text-muted-foreground">إعدادات المدرسة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" onClick={fetchData} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-6 space-y-6 max-w-7xl mx-auto">
          
          {/* School Info Card */}
          <Card className="border-2 border-brand-navy/20 bg-gradient-to-r from-brand-navy/5 via-brand-turquoise/5 to-brand-navy/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-turquoise flex items-center justify-center shadow-xl">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="font-cairo text-2xl font-bold">{schoolInfo.name || 'اسم المدرسة'}</h2>
                    <p className="text-sm text-muted-foreground">{schoolInfo.name_en || 'School Name'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {schoolInfo.city || 'المدينة'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" /> {schoolInfo.phone || '---'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" /> {schoolInfo.email || '---'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center px-4 py-3 bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl border border-violet-200 shadow-sm">
                    <p className="text-3xl font-bold text-violet-700">{teachers.length}</p>
                    <p className="text-xs text-violet-600 font-medium">معلم</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl border border-cyan-200 shadow-sm">
                    <p className="text-3xl font-bold text-cyan-700">{classes.length}</p>
                    <p className="text-xs text-cyan-600 font-medium">فصل</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                    <p className="text-3xl font-bold text-emerald-700">{subjects.length}</p>
                    <p className="text-xs text-emerald-600 font-medium">مادة</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-3xl font-bold text-blue-700">{settings.periodsPerDay}</p>
                    <p className="text-xs text-blue-600 font-medium">حصة/يوم</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <Calendar className="h-4 w-4 ml-1 hidden sm:inline" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="time" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <Timer className="h-4 w-4 ml-1 hidden sm:inline" />
                التوقيت
              </TabsTrigger>
              <TabsTrigger value="teachers" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <Users className="h-4 w-4 ml-1 hidden sm:inline" />
                المعلمون
              </TabsTrigger>
              <TabsTrigger value="classes" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <GraduationCap className="h-4 w-4 ml-1 hidden sm:inline" />
                الفصول
              </TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <BookOpen className="h-4 w-4 ml-1 hidden sm:inline" />
                المواد
              </TabsTrigger>
              <TabsTrigger value="ranks" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <Award className="h-4 w-4 ml-1 hidden sm:inline" />
                الرتب
              </TabsTrigger>
              <TabsTrigger value="constraints" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <Shield className="h-4 w-4 ml-1 hidden sm:inline" />
                القيود
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs py-2 data-[state=active]:bg-brand-navy data-[state=active]:text-white">
                <Layers className="h-4 w-4 ml-1 hidden sm:inline" />
                الهيكل
              </TabsTrigger>
            </TabsList>
            
            {/* ================= TAB: نظرة عامة ================= */}
            <TabsContent value="overview" className="space-y-6">
              {/* أيام العمل والعطلة */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">أيام العمل والعطلة</CardTitle>
                        <CardDescription className="text-xs">
                          {settings.workingDays?.length || 5} أيام دراسة • {settings.weekendDays?.length || 2} أيام عطلة
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DaysGrid 
                      workDays={settings.workingDays} 
                      weekendDays={settings.weekendDays}
                    />
                  </CardContent>
                </Card>
                
                {/* اليوم الدراسي */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">اليوم الدراسي</CardTitle>
                          <CardDescription className="text-xs">
                            {settings.periodsPerDay} حصص • {settings.periodDuration} دقيقة للحصة
                          </CardDescription>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditedDayTimes({
                            dayStart: settings.dayStart || '07:00',
                            dayEnd: settings.dayEnd || '13:15',
                            periodsPerDay: settings.periodsPerDay || 7,
                            periodDuration: settings.periodDuration || 45,
                            breakDuration: settings.breakDuration || 20,
                            prayerDuration: settings.prayerDuration || 20,
                          });
                          setEditDayTimesOpen(true);
                        }}
                        data-testid="edit-day-times-btn"
                      >
                        <Edit2 className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border border-green-200">
                        <Sun className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-green-700">{settings.dayStart}</p>
                        <p className="text-xs text-green-600">بداية الدوام</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200">
                        <Moon className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold text-orange-700">{settings.dayEnd}</p>
                        <p className="text-xs text-orange-600">نهاية الدوام</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xl font-bold text-blue-700">{settings.periodsPerDay}</p>
                        <p className="text-xs text-blue-600">حصة</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xl font-bold text-amber-700">{settings.breakDuration}</p>
                        <p className="text-xs text-amber-600">د. استراحة</p>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-xl font-bold text-emerald-700">{settings.prayerDuration}</p>
                        <p className="text-xs text-emerald-600">د. صلاة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* ملخص سريع */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="المعلمون" 
                  value={teachers.length} 
                  icon={Users} 
                  color="border-violet-200"
                  onClick={() => setActiveTab('teachers')}
                />
                <StatCard 
                  title="الفصول" 
                  value={classes.length} 
                  icon={GraduationCap} 
                  color="border-cyan-200"
                  onClick={() => setActiveTab('classes')}
                />
                <StatCard 
                  title="رتب المعلمين" 
                  value={teacherRanks.length} 
                  icon={Award} 
                  color="border-teal-200"
                  onClick={() => setActiveTab('ranks')}
                />
                <StatCard 
                  title="القيود الإدارية" 
                  value={constraints.length} 
                  icon={Shield} 
                  color="border-rose-200"
                  onClick={() => setActiveTab('constraints')}
                />
              </div>
            </TabsContent>
            
            {/* ================= TAB: التوزيع الزمني ================= */}
            <TabsContent value="time" className="space-y-4">
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Timer className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>التوزيع الزمني الكامل لليوم الدراسي</CardTitle>
                        <CardDescription>
                          {settings.timeSlots?.length || 0} فترة زمنية ({settings.periodsPerDay} حصة + استراحة + صلاة)
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditedDayTimes({
                          dayStart: settings.dayStart || '07:00',
                          dayEnd: settings.dayEnd || '13:15',
                          periodsPerDay: settings.periodsPerDay || 7,
                          periodDuration: settings.periodDuration || 45,
                          breakDuration: settings.breakDuration || 20,
                          prayerDuration: settings.prayerDuration || 20,
                        });
                        setEditDayTimesOpen(true);
                      }}
                      data-testid="edit-time-slots-btn"
                    >
                      <Edit2 className="h-4 w-4 ml-2" />
                      تعديل التوزيع الزمني
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {settings.timeSlots && settings.timeSlots.length > 0 ? (
                    <div className="space-y-3">
                      {settings.timeSlots.map((slot, index) => (
                        <TimeSlotItem key={index} slot={slot} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Timer className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">لا يوجد توزيع زمني محدد</p>
                      <p className="text-sm">يتم استخدام الإعدادات الافتراضية</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => {
                          setEditedDayTimes({
                            dayStart: '07:00',
                            dayEnd: '13:15',
                            periodsPerDay: 7,
                            periodDuration: 45,
                            breakDuration: 20,
                            prayerDuration: 20,
                          });
                          setEditDayTimesOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إنشاء التوزيع الزمني
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: المعلمون ================= */}
            <TabsContent value="teachers" className="space-y-4">
              <Card className="border-2 border-violet-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>بيانات المعلمين</CardTitle>
                        <CardDescription>{teachers.length} معلم في المدرسة</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      لإضافة معلم، انتقل إلى "إدارة المستخدمين والفصول"
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {teachers.length > 0 ? (
                    <div className="space-y-3">
                      {teachers.map((teacher) => (
                        <TeacherItem key={teacher.id} teacher={teacher} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">لا يوجد معلمون مسجلون</p>
                      <p className="text-sm mt-2">انتقل إلى صفحة "إدارة المستخدمين والفصول" لإضافة معلمين</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: الفصول ================= */}
            <TabsContent value="classes" className="space-y-4">
              <Card className="border-2 border-cyan-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>بيانات الفصول</CardTitle>
                        <CardDescription>{classes.length} فصل في المدرسة</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      لإضافة فصل، انتقل إلى "إدارة المستخدمين والفصول"
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {classes.length > 0 ? (
                    <div className="space-y-3">
                      {classes.map((classItem) => (
                        <ClassItem key={classItem.id} classItem={classItem} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">لا يوجد فصول مسجلة</p>
                      <p className="text-sm mt-2">انتقل إلى صفحة "إدارة المستخدمين والفصول" لإضافة فصول</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: المواد الدراسية ================= */}
            <TabsContent value="subjects" className="space-y-4">
              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>المواد الدراسية</CardTitle>
                        <CardDescription>{subjects.length} مادة دراسية</CardDescription>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setAddSubjectOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      data-testid="add-subject-btn"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة مادة
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subjects.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subjects.map((subject, index) => (
                        <SubjectItem 
                          key={subject.id || index} 
                          subject={subject} 
                          onEdit={() => {
                            setEditSubject(subject);
                            setEditSubjectOpen(true);
                          }}
                          onDelete={() => handleDeleteSubject(subject.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">لا يوجد مواد مسجلة</p>
                      <Button 
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setAddSubjectOpen(true)}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة مادة جديدة
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: رتب المعلمين ================= */}
            <TabsContent value="ranks" className="space-y-4">
              <Card className="border-2 border-teal-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>رتب المعلمين والنصاب التدريسي</CardTitle>
                      <CardDescription>{teacherRanks.length} رتبة معلم حسب نظام وزارة التعليم</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {teacherRanks.length > 0 ? (
                    <div className="space-y-3">
                      {teacherRanks.map((rank) => (
                        <RankItem key={rank.id} rank={rank} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">لا يوجد رتب محددة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: القيود الإدارية ================= */}
            <TabsContent value="constraints" className="space-y-4">
              <Card className="border-2 border-rose-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>القيود الإدارية</CardTitle>
                      <CardDescription>{constraints.length} قيد إداري للجدولة</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {constraints.length > 0 ? (
                    <div className="space-y-3">
                      {constraints.map((constraint, index) => (
                        <ConstraintItem 
                          key={constraint.id} 
                          constraint={constraint} 
                          index={index}
                          onToggle={toggleConstraint}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">لا يوجد قيود إدارية</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ================= TAB: الهيكل الأكاديمي ================= */}
            <TabsContent value="structure" className="space-y-4">
              <AcademicStructureView stages={stages} grades={grades} tracks={tracks} />
            </TabsContent>
            
          </Tabs>
        </main>
        
        {/* ============================================ */}
        {/* Dialog تعديل مواعيد اليوم الدراسي */}
        {/* ============================================ */}
        <Dialog open={editDayTimesOpen} onOpenChange={setEditDayTimesOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-cairo flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                تعديل مواعيد اليوم الدراسي
              </DialogTitle>
              <DialogDescription>
                تعديل أوقات بداية ونهاية اليوم الدراسي وعدد الحصص والاستراحات
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* أوقات الدوام */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayStart">بداية الدوام</Label>
                  <Input
                    id="dayStart"
                    type="time"
                    value={editedDayTimes.dayStart}
                    onChange={(e) => setEditedDayTimes({...editedDayTimes, dayStart: e.target.value})}
                    className="text-center text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayEnd">نهاية الدوام</Label>
                  <Input
                    id="dayEnd"
                    type="time"
                    value={editedDayTimes.dayEnd}
                    onChange={(e) => setEditedDayTimes({...editedDayTimes, dayEnd: e.target.value})}
                    className="text-center text-lg font-bold"
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* عدد الحصص ومدتها */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodsPerDay">عدد الحصص اليومية</Label>
                  <Select 
                    value={String(editedDayTimes.periodsPerDay)} 
                    onValueChange={(v) => setEditedDayTimes({...editedDayTimes, periodsPerDay: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7, 8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} حصص</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodDuration">مدة الحصة (دقيقة)</Label>
                  <Select 
                    value={String(editedDayTimes.periodDuration)} 
                    onValueChange={(v) => setEditedDayTimes({...editedDayTimes, periodDuration: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[35, 40, 45, 50, 55].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* الاستراحة والصلاة */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breakDuration" className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-amber-600" />
                    مدة الاستراحة (دقيقة)
                  </Label>
                  <Select 
                    value={String(editedDayTimes.breakDuration)} 
                    onValueChange={(v) => setEditedDayTimes({...editedDayTimes, breakDuration: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 25, 30].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prayerDuration" className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-emerald-600" />
                    مدة الصلاة (دقيقة)
                  </Label>
                  <Select 
                    value={String(editedDayTimes.prayerDuration)} 
                    onValueChange={(v) => setEditedDayTimes({...editedDayTimes, prayerDuration: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 25, 30].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} دقيقة</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* ملاحظة */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  سيتم إعادة توليد التوزيع الزمني تلقائياً بناءً على هذه الإعدادات
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDayTimesOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={saveDayTimes} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}

export { SchoolSettingsPagePro };
