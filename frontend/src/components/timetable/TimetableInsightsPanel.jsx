/**
 * TimetableInsightsPanel Component
 * لوحة الرؤى والتحليلات
 * 
 * يعرض ملخص ذكي وتحليلات النسخة الحالية
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  BarChart3, CheckCircle2, AlertTriangle, XCircle, Users,
  GraduationCap, BookOpen, Lightbulb, Activity, TrendingUp,
  TrendingDown, Minus
} from 'lucide-react';

// Insight Metric Card Component
const InsightMetricCard = ({ 
  label, 
  value, 
  tone = 'default', 
  helperText,
  icon: Icon 
}) => {
  const getToneStyles = () => {
    switch (tone) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getToneStyles()}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {helperText && (
            <p className="text-xs opacity-70 mt-1">{helperText}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-white/50 rounded-lg">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

// AI Insight Notice Component
const AIInsightNotice = ({ notes = [] }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm flex items-center gap-2 text-violet-700">
        <Lightbulb className="h-4 w-4" />
        ملاحظات الذكاء الاصطناعي
      </h4>
      <div className="space-y-2">
        {notes.map((note, idx) => (
          <div 
            key={idx}
            className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-700"
          >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Insights Panel Component
const TimetableInsightsPanel = ({
  insights = null,
  loading = false,
  onOpenDiagnostics
}) => {
  if (loading) {
    return (
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="py-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد بيانات للتحليل</p>
          <p className="text-xs text-muted-foreground mt-1">قم بتوليد جدول أولاً</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages
  const assignmentRate = insights.totalRequiredSessions > 0
    ? Math.round((insights.totalAssignedSessions / insights.totalRequiredSessions) * 100)
    : 0;

  return (
    <Card className="border-2 border-brand-navy/20" data-testid="timetable-insights-panel">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-brand-navy" />
            ملخص وتحليلات
          </CardTitle>
          {onOpenDiagnostics && (
            <Button variant="outline" size="sm" onClick={onOpenDiagnostics}>
              عرض التشخيص
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <InsightMetricCard
            label="الحصص المطلوبة"
            value={insights.totalRequiredSessions || 0}
            tone="default"
            icon={BookOpen}
          />
          <InsightMetricCard
            label="الحصص الموزعة"
            value={insights.totalAssignedSessions || 0}
            tone={assignmentRate >= 100 ? 'success' : assignmentRate >= 80 ? 'warning' : 'danger'}
            icon={CheckCircle2}
          />
          <InsightMetricCard
            label="الحصص غير الموزعة"
            value={insights.totalUnassignedSessions || 0}
            tone={insights.totalUnassignedSessions === 0 ? 'success' : 'danger'}
            icon={insights.totalUnassignedSessions === 0 ? CheckCircle2 : XCircle}
          />
          <InsightMetricCard
            label="جودة التوزيع"
            value={`${insights.qualityScore || assignmentRate}%`}
            tone={insights.qualityScore >= 90 ? 'success' : insights.qualityScore >= 70 ? 'warning' : 'danger'}
            icon={TrendingUp}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <InsightMetricCard
            label="التحذيرات"
            value={insights.warningsCount || 0}
            tone={insights.warningsCount === 0 ? 'success' : 'warning'}
            icon={AlertTriangle}
          />
          <InsightMetricCard
            label="التعارضات"
            value={insights.hardConflictsCount || 0}
            tone={insights.hardConflictsCount === 0 ? 'success' : 'danger'}
            icon={XCircle}
          />
          <InsightMetricCard
            label="المعلمون المتأثرون"
            value={insights.affectedTeachersCount || 0}
            tone="info"
            icon={Users}
          />
          <InsightMetricCard
            label="الفصول المتأثرة"
            value={insights.affectedClassesCount || 0}
            tone="info"
            icon={GraduationCap}
          />
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.topOverloadedClass && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-600 font-medium">أكثر فصل ضغطاً</p>
              <p className="font-bold text-amber-800 mt-1">{insights.topOverloadedClass}</p>
            </div>
          )}
          {insights.topOverloadedTeacher && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-600 font-medium">أكثر معلم نصاباً</p>
              <p className="font-bold text-orange-800 mt-1">{insights.topOverloadedTeacher}</p>
            </div>
          )}
          {insights.topClusteredSubject && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-xs text-rose-600 font-medium">أكثر مادة تكدساً</p>
              <p className="font-bold text-rose-800 mt-1">{insights.topClusteredSubject}</p>
            </div>
          )}
        </div>

        {/* AI Notes */}
        {insights.aiNotes && insights.aiNotes.length > 0 && (
          <AIInsightNotice notes={insights.aiNotes} />
        )}
      </CardContent>
    </Card>
  );
};

export default TimetableInsightsPanel;
export { InsightMetricCard, AIInsightNotice };
