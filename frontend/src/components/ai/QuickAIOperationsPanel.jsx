import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Brain, Activity, Shield, Database, Building2, FileText, Settings, AlertTriangle,
  Play, RefreshCw, Eye, Download, CheckCircle2, XCircle, Clock, Zap, Upload,
  BarChart3, Users, School, Sparkles, Copy, ChevronRight, History, Bot,
  Gauge, Search, Filter, ListChecks, FileCheck, Wrench, Bell, Check, X
} from 'lucide-react';

// AI Status States
const AI_STATUS = {
  ACTIVE: { label: 'نشط', label_en: 'Active', color: 'bg-green-500', textColor: 'text-green-500' },
  PARTIAL: { label: 'نشط جزئياً', label_en: 'Partially Active', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  STOPPED: { label: 'متوقف', label_en: 'Stopped', color: 'bg-red-500', textColor: 'text-red-500' },
  MAINTENANCE: { label: 'تحت الصيانة', label_en: 'Maintenance', color: 'bg-gray-500', textColor: 'text-gray-500' },
};

// AI Operations Configuration
const AI_OPERATIONS = [
  {
    id: 'system_diagnosis',
    title: 'تشخيص النظام',
    title_en: 'System Diagnosis',
    desc: 'فحص شامل للنظام',
    desc_en: 'Full system scan',
    icon: Gauge,
    color: 'bg-blue-500',
    type: 'analysis',
  },
  {
    id: 'data_quality',
    title: 'فحص جودة البيانات',
    title_en: 'Data Quality Scan',
    desc: 'اكتشاف النقص والتكرار',
    desc_en: 'Find gaps & duplicates',
    icon: Database,
    color: 'bg-green-500',
    type: 'analysis',
  },
  {
    id: 'import_analyzer',
    title: 'تحليل ملفات الاستيراد',
    title_en: 'Import Analyzer',
    desc: 'تحليل الملفات قبل الإدخال',
    desc_en: 'Analyze files before import',
    icon: Upload,
    color: 'bg-purple-500',
    type: 'analysis',
  },
  {
    id: 'tenant_health',
    title: 'صحة المدارس',
    title_en: 'Tenant Health',
    desc: 'تحليل أداء المدارس',
    desc_en: 'Schools performance',
    icon: Building2,
    color: 'bg-orange-500',
    type: 'analysis',
  },
  {
    id: 'config_suggestion',
    title: 'اقتراح الإعدادات',
    title_en: 'Config Suggestion',
    desc: 'اقتراحات إعدادات ذكية',
    desc_en: 'Smart config suggestions',
    icon: Settings,
    color: 'bg-cyan-500',
    type: 'suggestion',
  },
  {
    id: 'executive_summary',
    title: 'الملخص التنفيذي',
    title_en: 'Executive Summary',
    desc: 'تقرير ذكي شامل',
    desc_en: 'Comprehensive AI report',
    icon: FileText,
    color: 'bg-indigo-500',
    type: 'report',
  },
  {
    id: 'report_builder',
    title: 'منشئ التقارير',
    title_en: 'Report Builder',
    desc: 'إنشاء تقارير مخصصة',
    desc_en: 'Build custom reports',
    icon: BarChart3,
    color: 'bg-pink-500',
    type: 'report',
  },
  {
    id: 'alerts_review',
    title: 'مراجعة التنبيهات',
    title_en: 'Alerts Review',
    desc: 'التنبيهات الذكية',
    desc_en: 'AI-generated alerts',
    icon: Bell,
    color: 'bg-red-500',
    type: 'alert',
  },
];

// Sample suggested actions
const SUGGESTED_ACTIONS = [
  { id: 1, title: 'توجد 3 مدارس لم يتم استكمال بيانات مديرها', priority: 'high', type: 'data' },
  { id: 2, title: '12 معلماً بدون رتبة محددة', priority: 'medium', type: 'data' },
  { id: 3, title: '4 ملفات استيراد تحتاج مراجعة', priority: 'high', type: 'import' },
  { id: 4, title: 'يُفضل تفعيل AI Scheduling لمدرستين', priority: 'low', type: 'suggestion' },
];

// Sample recent operations
const RECENT_OPERATIONS = [
  { id: 1, name: 'تشخيص النظام', type: 'diagnosis', time: '10:30', status: 'success', user: 'مدير النظام' },
  { id: 2, name: 'فحص جودة البيانات', type: 'quality', time: '09:15', status: 'success', user: 'مدير النظام' },
  { id: 3, name: 'تحليل ملف استيراد', type: 'import', time: '08:45', status: 'partial', user: 'مدير النظام' },
];

export default function QuickAIOperationsPanel({ api, isRTL = true }) {
  // States
  const [aiStatus, setAiStatus] = useState(AI_STATUS.ACTIVE);
  const [operationsToday, setOperationsToday] = useState(47);
  const [openAlerts, setOpenAlerts] = useState(5);
  const [pendingRecommendations, setPendingRecommendations] = useState(8);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('ar-SA'));
  const [aiEnabledSchools, setAiEnabledSchools] = useState(184);
  const [totalSchools, setTotalSchools] = useState(200);
  
  // Dialog states
  const [activeDialog, setActiveDialog] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationResult, setOperationResult] = useState(null);
  
  // Run AI Operation
  const runOperation = async (operationId) => {
    setActiveDialog(operationId);
    setIsProcessing(true);
    setOperationResult(null);
    
    // Simulate AI operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock results based on operation type
    const results = generateOperationResults(operationId);
    setOperationResult(results);
    setIsProcessing(false);
    setOperationsToday(prev => prev + 1);
  };
  
  // Generate mock operation results
  const generateOperationResults = (operationId) => {
    switch (operationId) {
      case 'system_diagnosis':
        return {
          title: isRTL ? 'نتائج تشخيص النظام' : 'System Diagnosis Results',
          summary: isRTL ? 'تم تحليل 200 مدرسة و 4,320 مستخدمًا نشطًا' : 'Analyzed 200 schools and 4,320 active users',
          items: [
            { label: isRTL ? 'مدارس تحتاج متابعة عاجلة' : 'Schools need urgent follow-up', value: 3, type: 'critical' },
            { label: isRTL ? 'مدارس بانخفاض نشاط ملحوظ' : 'Schools with low activity', value: 2, type: 'warning' },
            { label: isRTL ? 'مدارس بتأخر في الإدخال' : 'Schools with delayed input', value: 1, type: 'warning' },
            { label: isRTL ? 'عمليات استيراد تحتاج مراجعة' : 'Imports need review', value: 5, type: 'info' },
          ],
          recommendations: [
            isRTL ? 'التواصل مع المدارس المتأخرة' : 'Contact delayed schools',
            isRTL ? 'مراجعة ملفات الاستيراد المعلقة' : 'Review pending imports',
            isRTL ? 'تفعيل التذكيرات التلقائية' : 'Enable automatic reminders',
          ]
        };
      case 'data_quality':
        return {
          title: isRTL ? 'نتائج فحص جودة البيانات' : 'Data Quality Results',
          summary: isRTL ? 'متوسط جودة البيانات: 86%' : 'Average data quality: 86%',
          qualityScore: 86,
          items: [
            { label: isRTL ? 'سجلات ناقصة' : 'Missing records', value: 42, type: 'warning' },
            { label: isRTL ? 'سجلات مكررة' : 'Duplicate records', value: 9, type: 'warning' },
            { label: isRTL ? 'فصول بدون معلم' : 'Classes without teacher', value: 6, type: 'critical' },
            { label: isRTL ? 'أولياء أمور غير مرتبطين' : 'Unlinked parents', value: 11, type: 'info' },
          ],
          autoFixAvailable: true,
        };
      case 'tenant_health':
        return {
          title: isRTL ? 'نتائج فحص صحة المدارس' : 'Tenant Health Results',
          summary: isRTL ? 'تم فحص 200 مدرسة' : 'Checked 200 schools',
          items: [
            { label: isRTL ? 'مدارس مستقرة' : 'Stable schools', value: 148, type: 'success' },
            { label: isRTL ? 'مدارس تحتاج متابعة' : 'Need follow-up', value: 34, type: 'warning' },
            { label: isRTL ? 'مدارس حرجة' : 'Critical schools', value: 18, type: 'critical' },
          ],
        };
      case 'executive_summary':
        return {
          title: isRTL ? 'الملخص التنفيذي اليومي' : 'Daily Executive Summary',
          content: isRTL 
            ? `حالة المنصة: مستقرة ✓

النشاط اليوم:
• 184 مدرسة نشطة من أصل 200
• 3,847 مستخدم نشط
• 12,456 عملية منفذة

التنبيهات:
• 3 مدارس تحتاج متابعة عاجلة
• 5 ملفات استيراد معلقة

التوصيات:
• تفعيل الإشعارات للمدارس المتأخرة
• مراجعة ملفات الاستيراد المعلقة`
            : 'Platform Status: Stable ✓\n\nActivity Today:\n• 184/200 active schools\n• 3,847 active users\n• 12,456 operations\n\nAlerts:\n• 3 schools need urgent follow-up\n• 5 pending imports',
          canCopy: true,
          canExport: true,
        };
      default:
        return {
          title: isRTL ? 'نتائج العملية' : 'Operation Results',
          summary: isRTL ? 'تمت العملية بنجاح' : 'Operation completed successfully',
          items: [],
        };
    }
  };
  
  // Refresh AI Status
  const refreshStatus = () => {
    setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
    toast.success(isRTL ? 'تم تحديث حالة الذكاء الاصطناعي' : 'AI status updated');
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? 'تم النسخ' : 'Copied');
  };
  
  // Execute suggested action
  const executeAction = (action) => {
    toast.success(isRTL ? `تم تنفيذ: ${action.title}` : `Executed: ${action.title}`);
  };
  
  // Get operation by ID
  const getOperation = (id) => AI_OPERATIONS.find(op => op.id === id);
  
  return (
    <section data-testid="ai-operations-panel" className="space-y-6">
      {/* العنوان والوصف */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cairo text-xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-turquoise flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            {isRTL ? 'لوحة العمليات الذكية السريعة' : 'Quick AI Operations Panel'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL 
              ? 'تنفيذ وتحليل ومراقبة العمليات الذكية على مستوى المنصة بالكامل'
              : 'Execute, analyze and monitor AI operations across the entire platform'
            }
          </p>
        </div>
      </div>
      
      {/* شريط الحالة الذكي - AI Status Bar */}
      <Card className="card-nassaq bg-gradient-to-r from-brand-navy/5 to-brand-purple/5 border-brand-navy/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* حالة المحرك */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${aiStatus.color} animate-pulse`} />
                <span className="font-bold">{isRTL ? aiStatus.label : aiStatus.label_en}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-1 text-sm">
                <Activity className="h-4 w-4 text-brand-turquoise" />
                <span>{operationsToday}</span>
                <span className="text-muted-foreground">{isRTL ? 'عملية اليوم' : 'ops today'}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-1 text-sm">
                <Bell className="h-4 w-4 text-orange-500" />
                <span>{openAlerts}</span>
                <span className="text-muted-foreground">{isRTL ? 'تنبيه مفتوح' : 'open alerts'}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-1 text-sm">
                <Sparkles className="h-4 w-4 text-brand-purple" />
                <span>{pendingRecommendations}</span>
                <span className="text-muted-foreground">{isRTL ? 'توصية' : 'recommendations'}</span>
              </div>
            </div>
            
            {/* أزرار التحكم */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshStatus} className="rounded-lg">
                <RefreshCw className="h-4 w-4 me-1" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => runOperation('system_diagnosis')} className="rounded-lg">
                <Gauge className="h-4 w-4 me-1" />
                {isRTL ? 'تشخيص' : 'Diagnose'}
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg">
                <History className="h-4 w-4 me-1" />
                {isRTL ? 'السجل' : 'Log'}
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg">
                <Settings className="h-4 w-4 me-1" />
                {isRTL ? 'إعدادات' : 'Settings'}
              </Button>
            </div>
          </div>
          
          {/* معلومات إضافية */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>{isRTL ? 'آخر تحديث:' : 'Last update:'} {lastUpdate}</span>
            <span>•</span>
            <span>{isRTL ? 'المدارس المفعّل لها AI:' : 'AI-enabled schools:'} {aiEnabledSchools}/{totalSchools}</span>
            <span>•</span>
            <span className="text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {isRTL ? 'جميع المحركات تعمل' : 'All engines running'}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* بطاقات العمليات الذكية - AI Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AI_OPERATIONS.map((op) => (
          <Card 
            key={op.id}
            className="card-nassaq hover:shadow-lg hover:border-brand-purple/30 transition-all cursor-pointer group"
            onClick={() => runOperation(op.id)}
            data-testid={`ai-op-${op.id}`}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className={`w-14 h-14 rounded-2xl ${op.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <op.icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-cairo font-bold text-sm">{isRTL ? op.title : op.title_en}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? op.desc : op.desc_en}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {op.type === 'analysis' && (isRTL ? 'تحليل' : 'Analysis')}
                {op.type === 'suggestion' && (isRTL ? 'اقتراح' : 'Suggestion')}
                {op.type === 'report' && (isRTL ? 'تقرير' : 'Report')}
                {op.type === 'alert' && (isRTL ? 'تنبيه' : 'Alert')}
              </Badge>
              <Button 
                size="sm" 
                className={`w-full ${op.color} hover:opacity-90 rounded-lg text-white`}
              >
                <Play className="h-3 w-3 me-1" />
                {isRTL ? 'تشغيل' : 'Run'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* صف سفلي: المهام المقترحة + سجل العمليات */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* المهام الذكية المقترحة */}
        <Card className="card-nassaq">
          <CardHeader className="pb-2">
            <CardTitle className="font-cairo text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              {isRTL ? 'المهام الذكية المقترحة' : 'AI Suggested Actions'}
              <Badge className="bg-yellow-500 text-white">{SUGGESTED_ACTIONS.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {SUGGESTED_ACTIONS.map((action) => (
                <div 
                  key={action.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                    action.priority === 'high' ? 'border-red-200 bg-red-50/50' :
                    action.priority === 'medium' ? 'border-yellow-200 bg-yellow-50/50' :
                    'border-blue-200 bg-blue-50/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    action.priority === 'high' ? 'bg-red-500' :
                    action.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="flex-1 text-sm">{action.title}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => executeAction(action)}>
                      <Check className="h-3 w-3 me-1" />
                      {isRTL ? 'تنفيذ' : 'Execute'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* سجل العمليات الأخيرة */}
        <Card className="card-nassaq">
          <CardHeader className="pb-2">
            <CardTitle className="font-cairo text-base flex items-center gap-2">
              <History className="h-5 w-5 text-brand-turquoise" />
              {isRTL ? 'سجل العمليات الأخيرة' : 'Recent Operations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {RECENT_OPERATIONS.map((op) => (
                <div 
                  key={op.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    op.status === 'success' ? 'bg-green-100 text-green-600' :
                    op.status === 'partial' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {op.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                     op.status === 'partial' ? <AlertTriangle className="h-4 w-4" /> :
                     <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{op.name}</p>
                    <p className="text-xs text-muted-foreground">{op.user} • {op.time}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog للنتائج */}
      <Dialog open={!!activeDialog} onOpenChange={() => { setActiveDialog(null); setOperationResult(null); }}>
        <DialogContent className="max-w-2xl" data-testid="ai-result-dialog">
          <DialogHeader>
            <DialogTitle className="font-cairo flex items-center gap-2">
              {activeDialog && getOperation(activeDialog) && (
                <>
                  <div className={`w-8 h-8 rounded-lg ${getOperation(activeDialog).color} flex items-center justify-center`}>
                    {React.createElement(getOperation(activeDialog).icon, { className: "h-4 w-4 text-white" })}
                  </div>
                  {isRTL ? getOperation(activeDialog).title : getOperation(activeDialog).title_en}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isProcessing 
                ? (isRTL ? 'جاري التحليل...' : 'Analyzing...')
                : (isRTL ? 'نتائج العملية' : 'Operation Results')
              }
            </DialogDescription>
          </DialogHeader>
          
          {isProcessing ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-brand-purple animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'يتم تحليل البيانات...' : 'Analyzing data...'}</p>
              <Progress value={66} className="w-48" />
            </div>
          ) : operationResult && (
            <div className="space-y-4">
              {/* الملخص */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-bold mb-2">{operationResult.title}</h4>
                <p className="text-sm text-muted-foreground">{operationResult.summary}</p>
              </div>
              
              {/* شريط الجودة (إن وجد) */}
              {operationResult.qualityScore && (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{isRTL ? 'نسبة جودة البيانات' : 'Data Quality Score'}</span>
                    <span className={`font-bold ${operationResult.qualityScore >= 80 ? 'text-green-500' : operationResult.qualityScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {operationResult.qualityScore}%
                    </span>
                  </div>
                  <Progress value={operationResult.qualityScore} className="h-2" />
                </div>
              )}
              
              {/* النتائج */}
              {operationResult.items && operationResult.items.length > 0 && (
                <div className="space-y-2">
                  {operationResult.items.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.type === 'critical' ? 'bg-red-50 border border-red-200' :
                        item.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        item.type === 'success' ? 'bg-green-50 border border-green-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      <Badge className={
                        item.type === 'critical' ? 'bg-red-500' :
                        item.type === 'warning' ? 'bg-yellow-500' :
                        item.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }>
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {/* التوصيات */}
              {operationResult.recommendations && (
                <div className="p-4 rounded-lg border border-brand-purple/20 bg-brand-purple/5">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-purple" />
                    {isRTL ? 'التوصيات' : 'Recommendations'}
                  </h4>
                  <ul className="space-y-1">
                    {operationResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3 text-brand-purple" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* محتوى نصي (للملخص التنفيذي) */}
              {operationResult.content && (
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap">
                  {operationResult.content}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {operationResult?.autoFixAvailable && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Wrench className="h-4 w-4 me-1" />
                {isRTL ? 'تصحيح تلقائي' : 'Auto Fix'}
              </Button>
            )}
            {operationResult?.canCopy && (
              <Button variant="outline" onClick={() => copyToClipboard(operationResult.content)}>
                <Copy className="h-4 w-4 me-1" />
                {isRTL ? 'نسخ' : 'Copy'}
              </Button>
            )}
            {operationResult?.canExport && (
              <Button variant="outline">
                <Download className="h-4 w-4 me-1" />
                {isRTL ? 'تصدير PDF' : 'Export PDF'}
              </Button>
            )}
            <Button variant="outline" onClick={() => { setActiveDialog(null); setOperationResult(null); }}>
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
            {operationResult && (
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <ListChecks className="h-4 w-4 me-1" />
                {isRTL ? 'تحويل لمهام' : 'Create Tasks'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
