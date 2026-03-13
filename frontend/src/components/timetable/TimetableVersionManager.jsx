/**
 * TimetableVersionManager Component
 * إدارة نسخ الجدول
 * 
 * يعرض نسخ الجدول ويتيح التحكم بها
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  CheckCircle2, Clock, Archive, Trash2, Eye, Send, 
  RefreshCw, RotateCcw, MoreVertical, Calendar, User,
  TrendingUp, AlertTriangle, XCircle, FileText, Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { TimetableStatus, getStatusBadgeStyle, getStatusLabel } from './types';

// Version Card Component
const TimetableVersionCard = ({
  version,
  selected = false,
  onSelect,
  onPublish,
  onArchive,
  onCompare,
  onRestoreAsBase,
  onDelete
}) => {
  const statusStyle = getStatusBadgeStyle(version.status);
  const statusLabel = getStatusLabel(version.status);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
        selected 
          ? 'border-brand-navy bg-brand-navy/5 shadow-md' 
          : 'border-gray-200 hover:border-brand-navy/50 hover:shadow-sm'
      }`}
      onClick={() => onSelect && onSelect(version.id)}
      data-testid={`version-card-${version.id}`}
    >
      <div className="flex items-start justify-between">
        {/* Version Info */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            version.status === TimetableStatus.PUBLISHED 
              ? 'bg-green-100' 
              : version.status === TimetableStatus.DRAFT 
              ? 'bg-amber-100' 
              : 'bg-gray-100'
          }`}>
            {version.status === TimetableStatus.PUBLISHED ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : version.status === TimetableStatus.DRAFT ? (
              <Clock className="h-5 w-5 text-amber-600" />
            ) : (
              <Archive className="h-5 w-5 text-gray-600" />
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm">
                {version.versionName || `نسخة ${version.id?.substring(0, 6)}`}
              </h4>
              <Badge className={`text-xs ${statusStyle}`}>
                {statusLabel.ar}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {version.generatedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(version.generatedAt)}
                </span>
              )}
              {version.generatedBy && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {version.generatedBy}
                </span>
              )}
              {version.generationMode && (
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {version.generationMode === 'full' ? 'توليد كامل' : 'جزئي'}
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{version.qualityScore || 0}%</span>
              </div>
              {version.warningsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{version.warningsCount} تحذير</span>
                </div>
              )}
              {version.conflictsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <XCircle className="h-3 w-3" />
                  <span>{version.conflictsCount} تعارض</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect && onSelect(version.id); }}>
              <Eye className="h-4 w-4 ml-2" />
              عرض النسخة
            </DropdownMenuItem>
            
            {version.status === TimetableStatus.DRAFT && onPublish && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPublish(version.id); }}>
                <Send className="h-4 w-4 ml-2" />
                نشر النسخة
              </DropdownMenuItem>
            )}
            
            {version.status !== TimetableStatus.ARCHIVED && onArchive && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(version.id); }}>
                <Archive className="h-4 w-4 ml-2" />
                أرشفة
              </DropdownMenuItem>
            )}
            
            {onCompare && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCompare(version.id); }}>
                <RefreshCw className="h-4 w-4 ml-2" />
                مقارنة
              </DropdownMenuItem>
            )}
            
            {version.status === TimetableStatus.ARCHIVED && onRestoreAsBase && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRestoreAsBase(version.id); }}>
                  <RotateCcw className="h-4 w-4 ml-2" />
                  استعادة كأساس
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Main Version Manager Component
const TimetableVersionManager = ({
  versions = [],
  selectedVersionId = null,
  loading = false,
  onSelectVersion,
  onPublishVersion,
  onArchiveVersion,
  onCompareVersion,
  onRestoreAsBase
}) => {
  if (loading) {
    return (
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد نسخ جدول</p>
          <p className="text-xs text-muted-foreground mt-1">قم بتوليد جدول جديد</p>
        </CardContent>
      </Card>
    );
  }

  // Group versions by status
  const publishedVersions = versions.filter(v => v.status === TimetableStatus.PUBLISHED);
  const draftVersions = versions.filter(v => v.status === TimetableStatus.DRAFT);
  const archivedVersions = versions.filter(v => v.status === TimetableStatus.ARCHIVED);

  return (
    <Card className="border-2 border-brand-navy/20" data-testid="timetable-version-manager">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-brand-navy" />
          نسخ الجدول
          <Badge variant="outline">{versions.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Published Versions */}
        {publishedVersions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              النسخة المنشورة
            </h4>
            <div className="space-y-2">
              {publishedVersions.map(version => (
                <TimetableVersionCard
                  key={version.id}
                  version={version}
                  selected={selectedVersionId === version.id}
                  onSelect={onSelectVersion}
                  onArchive={onArchiveVersion}
                  onCompare={onCompareVersion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Draft Versions */}
        {draftVersions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              المسودات
            </h4>
            <div className="space-y-2">
              {draftVersions.map(version => (
                <TimetableVersionCard
                  key={version.id}
                  version={version}
                  selected={selectedVersionId === version.id}
                  onSelect={onSelectVersion}
                  onPublish={onPublishVersion}
                  onArchive={onArchiveVersion}
                  onCompare={onCompareVersion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archived Versions */}
        {archivedVersions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Archive className="h-4 w-4" />
              الأرشيف
            </h4>
            <div className="space-y-2 opacity-75">
              {archivedVersions.slice(0, 3).map(version => (
                <TimetableVersionCard
                  key={version.id}
                  version={version}
                  selected={selectedVersionId === version.id}
                  onSelect={onSelectVersion}
                  onRestoreAsBase={onRestoreAsBase}
                />
              ))}
            </div>
            {archivedVersions.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                و {archivedVersions.length - 3} نسخة أخرى مؤرشفة
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimetableVersionManager;
export { TimetableVersionCard };
