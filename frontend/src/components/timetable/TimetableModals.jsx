/**
 * Timetable Modals Components
 * مكونات النوافذ المنبثقة للجدول المدرسي
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Wand2, Loader2, CheckCircle2, XCircle, AlertTriangle,
  GraduationCap, Users, BookOpen, Clock, Send, Archive,
  Activity, RefreshCw, Lock, Unlock, Eye
} from 'lucide-react';
import { ReadinessStatus, GenerationMode, TimetableStatus, getStatusLabel } from './types';

// ============================================
// AI Timetable Generation Modal
// ============================================
export const AITimetableGenerationModal = ({
  open = false,
  readinessSummary = null,
  generationInputSummary = null,
  submitting = false,
  onConfirm,
  onClose
}) => {
  const [usePublishedAsBaseline, setUsePublishedAsBaseline] = useState(false);

  const canGenerate = readinessSummary?.status === ReadinessStatus.FULLY_READY || 
                      readinessSummary?.can_generate === true;

  const handleConfirm = () => {
    onConfirm && onConfirm({
      generationMode: GenerationMode.FULL,
      usePublishedAsBaseline
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[500px]" data-testid="ai-generation-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            معالجة الجدول بالذكاء الاصطناعي
          </DialogTitle>
          <DialogDescription>
            سيقوم النظام بقراءة البيانات الحالية وتوليد جدول مدرسي محسّن
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Generation Input Summary */}
          {generationInputSummary && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <GraduationCap className="h-5 w-5 mx-auto mb-1 text-brand-navy" />
                <p className="text-lg font-bold">{generationInputSummary.totalClasses}</p>
                <p className="text-xs text-muted-foreground">فصل</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-brand-navy" />
                <p className="text-lg font-bold">{generationInputSummary.totalTeachers}</p>
                <p className="text-xs text-muted-foreground">معلم</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-brand-navy" />
                <p className="text-lg font-bold">{generationInputSummary.totalSubjects}</p>
                <p className="text-xs text-muted-foreground">مادة</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-brand-navy" />
                <p className="text-lg font-bold">{generationInputSummary.totalTeachingSlots}</p>
                <p className="text-xs text-muted-foreground">حصة</p>
              </div>
            </div>
          )}

          {/* Readiness Summary */}
          {readinessSummary && (
            <div className={`p-3 rounded-lg border ${
              canGenerate 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {canGenerate ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${canGenerate ? 'text-green-700' : 'text-red-700'}`}>
                  {canGenerate 
                    ? 'البيانات جاهزة للمعالجة' 
                    : 'البيانات غير مكتملة'
                  }
                </span>
              </div>
              {!canGenerate && readinessSummary.critical_issues && (
                <ul className="mt-2 space-y-1 text-xs text-red-600">
                  {readinessSummary.critical_issues.slice(0, 3).map((issue, idx) => (
                    <li key={idx}>• {issue.message_ar || issue.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="use-baseline" className="cursor-pointer">
                استخدام النسخة المنشورة كأساس
              </Label>
              <Switch
                id="use-baseline"
                checked={usePublishedAsBaseline}
                onCheckedChange={setUsePublishedAsBaseline}
              />
            </div>
            {usePublishedAsBaseline && (
              <p className="text-xs text-muted-foreground">
                سيحاول النظام الحفاظ على التوزيع الحالي قدر الإمكان
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canGenerate || submitting}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            data-testid="confirm-generation-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 ml-2" />
                بدء المعالجة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Partial Regeneration Modal
// ============================================
export const PartialRegenerationModal = ({
  open = false,
  classes = [],
  teachers = [],
  weekdays = [],
  subjects = [],
  grades = [],
  submitting = false,
  onConfirm,
  onClose
}) => {
  const [scope, setScope] = useState('class');
  const [classId, setClassId] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [weekdayNumber, setWeekdayNumber] = useState(null);
  const [subjectId, setSubjectId] = useState(null);

  const canSubmit = () => {
    switch (scope) {
      case 'class':
        return !!classId;
      case 'teacher':
        return !!teacherId;
      case 'day':
        return weekdayNumber !== null;
      case 'subject':
        return !!subjectId;
      default:
        return false;
    }
  };

  const handleConfirm = () => {
    onConfirm && onConfirm({
      scope,
      classId,
      teacherId,
      weekdayNumber,
      subjectId
    });
  };

  const resetSelections = () => {
    setClassId(null);
    setTeacherId(null);
    setWeekdayNumber(null);
    setSubjectId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[450px]" data-testid="partial-regeneration-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            إعادة المعالجة الجزئية
          </DialogTitle>
          <DialogDescription>
            اختر الجزء المراد إعادة معالجته من الجدول
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Scope Selection */}
          <Tabs value={scope} onValueChange={(val) => { setScope(val); resetSelections(); }}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="class">فصل</TabsTrigger>
              <TabsTrigger value="teacher">معلم</TabsTrigger>
              <TabsTrigger value="day">يوم</TabsTrigger>
              <TabsTrigger value="subject">مادة</TabsTrigger>
            </TabsList>

            <TabsContent value="class" className="space-y-3 mt-4">
              <Label>اختر الفصل</Label>
              <Select value={classId || ''} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id || c.value} value={c.id || c.value}>
                      {c.name || c.name_ar || c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-3 mt-4">
              <Label>اختر المعلم</Label>
              <Select value={teacherId || ''} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المعلم" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id || t.value} value={t.id || t.value}>
                      {t.full_name || t.name || t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="day" className="space-y-3 mt-4">
              <Label>اختر اليوم</Label>
              <Select 
                value={weekdayNumber?.toString() || ''} 
                onValueChange={(val) => setWeekdayNumber(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر اليوم" />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map(d => (
                    <SelectItem key={d.number ?? d.value} value={(d.number ?? d.value)?.toString()}>
                      {d.ar || d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="subject" className="space-y-3 mt-4">
              <Label>اختر المادة</Label>
              <Select value={subjectId || ''} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id || s.value} value={s.id || s.value}>
                      {s.name_ar || s.name || s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canSubmit() || submitting}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="confirm-partial-regen-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المعالجة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Publish Version Modal
// ============================================
export const PublishTimetableVersionModal = ({
  open = false,
  version = null,
  blockingIssuesCount = 0,
  submitting = false,
  onConfirm,
  onClose
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const hasBlockingIssues = blockingIssuesCount > 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[450px]" data-testid="publish-version-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-green-600" />
            نشر النسخة
          </DialogTitle>
          <DialogDescription>
            تأكيد نشر النسخة الحالية للمستخدمين
          </DialogDescription>
        </DialogHeader>

        {version && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{version.versionName}</span>
                <Badge className="bg-amber-100 text-amber-700">مسودة</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>جودة التوزيع: {version.qualityScore || 0}%</p>
                {version.warningsCount > 0 && (
                  <p className="text-amber-600">{version.warningsCount} تحذير</p>
                )}
              </div>
            </div>

            {hasBlockingIssues && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    توجد {blockingIssuesCount} مشكلة حرجة
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  يُنصح بمعالجة المشاكل قبل النشر
                </p>
              </div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4 inline ml-1" />
              سيتم استبدال النسخة المنشورة الحالية
            </div>

            {hasBlockingIssues && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirm-publish"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="confirm-publish" className="cursor-pointer text-sm">
                  أفهم المخاطر وأريد النشر رغم المشاكل
                </Label>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={submitting || (hasBlockingIssues && !confirmed)}
            className="bg-green-600 hover:bg-green-700"
            data-testid="confirm-publish-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري النشر...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ml-2" />
                نشر النسخة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Archive Version Modal
// ============================================
export const ArchiveTimetableVersionModal = ({
  open = false,
  version = null,
  submitting = false,
  onConfirm,
  onClose
}) => {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[400px]" data-testid="archive-version-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-gray-600" />
            أرشفة النسخة
          </DialogTitle>
          <DialogDescription>
            نقل النسخة إلى الأرشيف
          </DialogDescription>
        </DialogHeader>

        {version && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">{version.versionName}</span>
              <Badge className="mr-2" variant="outline">
                {getStatusLabel(version.status).ar}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archive-reason">سبب الأرشفة (اختياري)</Label>
              <Textarea
                id="archive-reason"
                placeholder="اكتب سبب الأرشفة..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button 
            onClick={() => onConfirm && onConfirm(reason)}
            disabled={submitting}
            variant="secondary"
            data-testid="confirm-archive-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الأرشفة...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 ml-2" />
                أرشفة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Diagnostics Details Modal
// ============================================
export const TimetableDiagnosticsModal = ({
  open = false,
  diagnostics = null,
  loading = false,
  onClose
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('ar-SA');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]" data-testid="diagnostics-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-navy" />
            تشخيص المحرك
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
            </div>
          ) : diagnostics ? (
            <div className="space-y-4">
              {/* Run Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">بدء التشغيل</p>
                  <p className="font-medium text-sm">{formatDate(diagnostics.startedAt)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">انتهاء التشغيل</p>
                  <p className="font-medium text-sm">{formatDate(diagnostics.finishedAt)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{diagnostics.totalUnits || 0}</p>
                  <p className="text-xs text-blue-600">إجمالي الوحدات</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{diagnostics.assignedUnits || 0}</p>
                  <p className="text-xs text-green-600">تم توزيعها</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{diagnostics.unassignedUnits || 0}</p>
                  <p className="text-xs text-red-600">لم يتم توزيعها</p>
                </div>
              </div>

              {/* Conflicts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">تعارضات حرجة</p>
                  <p className="text-xl font-bold text-red-600">{diagnostics.hardConflicts || 0}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">تعارضات بسيطة</p>
                  <p className="text-xl font-bold text-amber-600">{diagnostics.softConflicts || 0}</p>
                </div>
              </div>

              {/* Logs */}
              {diagnostics.logs && diagnostics.logs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">سجلات التشغيل</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {diagnostics.logs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-muted/20 rounded text-xs font-mono">
                        {log.message || log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات تشخيص
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Session Details Drawer
// ============================================
export const TimetableSessionDetailsDrawer = ({
  open = false,
  session = null,
  loading = false,
  onClose,
  onLock,
  onUnlock,
  onRegenerateRelated,
  onViewDiagnostics
}) => {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[450px]" data-testid="session-details-drawer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand-navy" />
            تفاصيل الحصة
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
          </div>
        ) : session ? (
          <div className="space-y-4 py-4">
            {/* Main Info */}
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-brand-navy/5 to-brand-turquoise/5 rounded-lg">
                <p className="text-xs text-muted-foreground">المادة</p>
                <p className="font-bold text-lg">{session.subjectName || session.subject_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">المعلم</p>
                  <p className="font-medium">{session.teacherName || session.teacher_name}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">الفصل</p>
                  <p className="font-medium">{session.className || session.class_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">اليوم</p>
                  <p className="font-medium">{session.weekdayLabel || session.day_of_week}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">التوقيت</p>
                  <p className="font-medium">
                    {session.startTime || session.start_time} - {session.endTime || session.end_time}
                  </p>
                </div>
              </div>

              {session.roomName && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">القاعة</p>
                  <p className="font-medium">{session.roomName}</p>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {session.isAiGenerated && (
                <Badge variant="outline" className="gap-1 bg-violet-50 text-violet-700 border-violet-200">
                  <Wand2 className="h-3 w-3" />
                  AI Generated
                </Badge>
              )}
              {session.isLocked && (
                <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                  <Lock className="h-3 w-3" />
                  مقفلة
                </Badge>
              )}
              {session.status && (
                <Badge variant="outline">
                  {session.status}
                </Badge>
              )}
            </div>

            {/* Warnings */}
            {session.warnings && session.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <p className="text-xs font-medium text-amber-700">تحذيرات:</p>
                {session.warnings.map((warning, idx) => (
                  <p key={idx} className="text-xs text-amber-600">• {warning}</p>
                ))}
              </div>
            )}

            {/* Notes */}
            {session.notes && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="text-sm">{session.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد بيانات
          </div>
        )}

        <DialogFooter className="flex-wrap gap-2">
          {session && (
            <>
              {session.isLocked ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUnlock && onUnlock(session.id)}
                  className="gap-1"
                >
                  <Unlock className="h-4 w-4" />
                  فك القفل
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onLock && onLock(session.id)}
                  className="gap-1"
                >
                  <Lock className="h-4 w-4" />
                  قفل
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRegenerateRelated && onRegenerateRelated(session.id)}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة معالجة
              </Button>
            </>
          )}
          <Button onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
