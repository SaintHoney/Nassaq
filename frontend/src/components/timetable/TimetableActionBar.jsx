/**
 * TimetableActionBar Component
 * شريط الإجراءات الرئيسي للجدول المدرسي
 * 
 * يعرض جميع الإجراءات الأساسية الخاصة بالجدول
 */

import React from 'react';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { 
  Wand2, RefreshCw, Send, Archive, Activity, Settings,
  Loader2, AlertCircle
} from 'lucide-react';

const TimetableActionBar = ({
  canGenerate = false,
  canPublish = false,
  canArchive = false,
  canPartialRegenerate = false,
  isGenerating = false,
  hasDraftVersion = false,
  hasPublishedVersion = false,
  disabledReason = '',
  onGenerateClick,
  onPartialRegenerateClick,
  onPublishClick,
  onArchiveClick,
  onDiagnosticsClick,
  onGoToSettingsClick
}) => {

  return (
    <div 
      className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
      data-testid="timetable-action-bar"
    >
      {/* Left Side - Secondary Actions */}
      <div className="flex items-center gap-2">
        {/* Go to Settings */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGoToSettingsClick}
                className="gap-2"
                data-testid="go-to-settings-btn"
              >
                <Settings className="h-4 w-4" />
                إعدادات المدرسة
              </Button>
            </TooltipTrigger>
            <TooltipContent>الانتقال لإعدادات المدرسة</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* View Diagnostics */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onDiagnosticsClick}
                className="gap-2"
                data-testid="view-diagnostics-btn"
              >
                <Activity className="h-4 w-4" />
                التشخيص
              </Button>
            </TooltipTrigger>
            <TooltipContent>عرض تشخيص المحرك</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right Side - Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Partial Regeneration - Only show if version exists */}
        {canPartialRegenerate && (hasDraftVersion || hasPublishedVersion) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onPartialRegenerateClick}
                  disabled={isGenerating}
                  className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  data-testid="partial-regenerate-btn"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة معالجة جزئية
                </Button>
              </TooltipTrigger>
              <TooltipContent>إعادة توليد جزء من الجدول</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Archive - Only show if has draft or published */}
        {canArchive && (hasDraftVersion || hasPublishedVersion) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onArchiveClick}
                  disabled={isGenerating}
                  className="gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                  data-testid="archive-version-btn"
                >
                  <Archive className="h-4 w-4" />
                  أرشفة
                </Button>
              </TooltipTrigger>
              <TooltipContent>أرشفة النسخة الحالية</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Publish - Only show if has valid draft */}
        {canPublish && hasDraftVersion && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm"
                  onClick={onPublishClick}
                  disabled={isGenerating}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="publish-version-btn"
                >
                  <Send className="h-4 w-4" />
                  نشر النسخة
                </Button>
              </TooltipTrigger>
              <TooltipContent>نشر النسخة الحالية للمستخدمين</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Primary CTA - AI Generate */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  onClick={onGenerateClick}
                  disabled={!canGenerate || isGenerating}
                  className={`gap-2 px-6 py-2 shadow-lg transition-all ${
                    canGenerate && !isGenerating
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  data-testid="ai-generate-btn"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      معالجة الجدول بالذكاء الاصطناعي
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {!canGenerate && disabledReason && (
              <TooltipContent className="max-w-xs bg-red-50 text-red-700 border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{disabledReason}</span>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TimetableActionBar;
