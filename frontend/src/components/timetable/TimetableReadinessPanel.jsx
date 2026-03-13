/**
 * TimetableReadinessPanel Component
 * لوحة جاهزية البيانات للتوليد
 * 
 * يعرض حالة جاهزية البيانات المطلوبة لتوليد الجدول
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  ArrowUpRight, RefreshCw, Loader2, Shield
} from 'lucide-react';
import { ReadinessStatus, IssueType } from './types';

// Readiness Item Component
const ReadinessChecklistItem = ({ item, onFix }) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'complete':
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'missing':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBg = () => {
    switch (item.status) {
      case 'complete':
      case 'ready':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'missing':
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBg()}`}
      data-testid={`readiness-item-${item.key || item.id}`}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <p className="font-medium text-sm">{item.label || item.name_ar}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          )}
          {item.score !== undefined && item.max_score !== undefined && (
            <p className="text-xs text-muted-foreground">
              {item.score}/{item.max_score} نقطة
            </p>
          )}
        </div>
      </div>
      
      {(item.status === 'missing' || item.status === 'critical' || item.status === 'warning') && item.fix_link && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onFix && onFix(item.key || item.id, item.fix_link)}
          className="gap-1 text-brand-navy hover:text-brand-navy/80"
          data-testid={`fix-${item.key || item.id}-btn`}
        >
          إصلاح
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

// Main Readiness Panel Component
const TimetableReadinessPanel = ({
  items = [],
  categories = {},
  overallStatus = ReadinessStatus.NOT_READY,
  percentage = 0,
  criticalIssuesCount = 0,
  warningsCount = 0,
  canGenerate = false,
  loading = false,
  onFixItem,
  onRefresh
}) => {
  const [expanded, setExpanded] = useState(true);

  // Get status color and icon
  const getStatusConfig = () => {
    switch (overallStatus) {
      case ReadinessStatus.FULLY_READY:
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          title: 'جاهز لإنشاء الجدول!',
          titleColor: 'text-green-800',
          progressColor: '[&>div]:bg-green-600'
        };
      case ReadinessStatus.PARTIALLY_READY:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-200',
          title: 'بيانات الجدول جاهزة جزئياً',
          titleColor: 'text-amber-800',
          progressColor: '[&>div]:bg-amber-500'
        };
      default:
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          title: 'بيانات الجدول غير مكتملة',
          titleColor: 'text-red-800',
          progressColor: '[&>div]:bg-red-500'
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Convert categories object to array for display
  const categoryList = Object.entries(categories).map(([key, value]) => ({
    key,
    ...value
  }));

  // Issues from items or categories
  const allIssues = items.length > 0 
    ? items 
    : categoryList.flatMap(cat => cat.issues || []);

  const criticalIssues = allIssues.filter(
    item => item.status === 'critical' || item.status === 'missing' || item.type === IssueType.CRITICAL
  );
  const warnings = allIssues.filter(
    item => item.status === 'warning' || item.type === IssueType.WARNING
  );

  if (loading) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
            <span className="text-muted-foreground">جاري فحص جاهزية البيانات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 ${statusConfig.border} overflow-hidden`}
      data-testid="timetable-readiness-panel"
    >
      {/* Header - Always Visible */}
      <div className={`${statusConfig.bg} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Progress Circle */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
                <span className={`text-xl font-bold ${statusConfig.titleColor}`}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
            
            {/* Status Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {statusConfig.icon}
                <h3 className={`font-bold text-lg ${statusConfig.titleColor}`}>
                  {statusConfig.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                {criticalIssuesCount > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    {criticalIssuesCount} مشكلة حرجة
                  </span>
                )}
                {warningsCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    {warningsCount} تحذير
                  </span>
                )}
                {overallStatus === ReadinessStatus.FULLY_READY && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Shield className="h-4 w-4" />
                    جميع البيانات مكتملة
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                className="gap-2"
                data-testid="refresh-readiness-btn"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-1"
              data-testid="toggle-readiness-btn"
            >
              {expanded ? (
                <>
                  إخفاء التفاصيل
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  عرض التفاصيل
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress 
          value={percentage} 
          className={`h-2 mt-4 ${statusConfig.progressColor}`}
        />
      </div>

      {/* Expanded Content */}
      {expanded && (
        <CardContent className="p-4 space-y-4">
          {/* Categories Grid */}
          {categoryList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryList.map(category => (
                <div 
                  key={category.key}
                  className={`p-3 rounded-lg border ${
                    category.status === 'ready' || category.status === 'complete'
                      ? 'bg-green-50 border-green-200'
                      : category.status === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{category.name_ar}</span>
                    <Badge variant="outline" className={
                      category.status === 'ready' || category.status === 'complete'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : category.status === 'warning'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }>
                      {category.score}/{category.max_score}
                    </Badge>
                  </div>
                  
                  {category.issues && category.issues.length > 0 && (
                    <div className="space-y-1">
                      {category.issues.slice(0, 2).map((issue, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className={
                            issue.type === IssueType.CRITICAL ? 'text-red-600' : 'text-amber-600'
                          }>
                            {issue.message_ar}
                          </span>
                          {issue.fix_link && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => onFixItem && onFixItem(issue.id, issue.fix_link)}
                            >
                              إصلاح
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Critical Issues List */}
          {criticalIssues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-700 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                مشاكل حرجة يجب إصلاحها
              </h4>
              <div className="space-y-2">
                {criticalIssues.map((item, idx) => (
                  <ReadinessChecklistItem 
                    key={item.id || idx} 
                    item={{
                      ...item,
                      status: 'critical',
                      label: item.message_ar || item.label
                    }} 
                    onFix={onFixItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Warnings List */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                تحذيرات (يمكن المتابعة)
              </h4>
              <div className="space-y-2">
                {warnings.slice(0, 3).map((item, idx) => (
                  <ReadinessChecklistItem 
                    key={item.id || idx} 
                    item={{
                      ...item,
                      status: 'warning',
                      label: item.message_ar || item.label
                    }} 
                    onFix={onFixItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Good State */}
          {criticalIssues.length === 0 && warnings.length === 0 && (
            <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <span className="font-medium text-green-700">
                بيانات الجدول مكتملة وجاهزة للمعالجة
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default TimetableReadinessPanel;
