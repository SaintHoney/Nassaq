/**
 * PrincipalTimetablePage Component
 * صفحة الجدول المدرسي الرئيسية
 * 
 * المكون الجذر الذي يدير جميع أقسام صفحة الجدول
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import Sidebar
import { Sidebar } from '../../components/layout/Sidebar';

// Import Components
import TimetablePageHeader from './TimetablePageHeader';
import TimetableStatusBanner from './TimetableStatusBanner';
import TimetableActionBar from './TimetableActionBar';
import TimetableReadinessPanel from './TimetableReadinessPanel';
import TimetableViewControls from './TimetableViewControls';
import TimetableGridSection from './TimetableGridSection';
import TimetableInsightsPanel from './TimetableInsightsPanel';
import TimetableVersionManager from './TimetableVersionManager';
import TimetableIssuesSection from './TimetableIssuesSection';
import {
  AITimetableGenerationModal,
  PartialRegenerationModal,
  PublishTimetableVersionModal,
  ArchiveTimetableVersionModal,
  TimetableDiagnosticsModal,
  TimetableSessionDetailsDrawer
} from './TimetableModals';

// Import Types
import { 
  ViewModes, TimetableStatus, ReadinessStatus, WEEKDAYS, 
  getWorkingDays 
} from './types';

// Skeleton Component
import { Skeleton } from '../../components/ui/skeleton';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

// ============================================
// Main Page Component
// ============================================
const PrincipalTimetablePage = () => {
  const navigate = useNavigate();
  const schoolId = localStorage.getItem('school_id');
  // Try both token storage keys
  const token = localStorage.getItem('nassaq_token') || localStorage.getItem('token');
  const userName = localStorage.getItem('user_name') || '';

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ============================================
  // State Management
  // ============================================
  const [pageStatus, setPageStatus] = useState('loading'); // loading, ready, error
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, running, success, failed
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');

  // View State
  const [activeViewMode, setActiveViewMode] = useState(ViewModes.CLASS);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedWeekday, setSelectedWeekday] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toggles, setToggles] = useState({
    showBreaks: true,
    showPrayer: true,
    showWarnings: true,
    showColorCoding: true,
    showCoreSubjectsOnly: false
  });

  // Data State
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [readinessSummary, setReadinessSummary] = useState(null);
  const [timetableVersions, setTimetableVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [insights, setInsights] = useState(null);
  const [issues, setIssues] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);

  // Modal State
  const [modalState, setModalState] = useState({
    generationModalOpen: false,
    partialRegenerationModalOpen: false,
    publishModalOpen: false,
    archiveModalOpen: false,
    diagnosticsModalOpen: false,
    sessionDetailsOpen: false
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  // ============================================
  // API Helpers
  // ============================================
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-School-Context': schoolId,
      ...(options.headers || {})
    };
    
    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    
    return response.json();
  };

  // ============================================
  // Data Fetching Functions
  // ============================================
  const fetchSchoolInfo = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/school/info');
      setSchoolInfo(data);
      
      // Set working days
      if (data.settings?.working_days || data.workingDays) {
        const days = data.settings?.working_days || data.workingDays;
        setWorkingDays(getWorkingDays(days));
      } else {
        setWorkingDays(getWorkingDays(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']));
      }
    } catch (error) {
      console.error('Error fetching school info:', error);
    }
  }, [schoolId, token]);

  const fetchReadinessSummary = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/timetable-readiness/check');
      setReadinessSummary(data);
      return data;
    } catch (error) {
      console.error('Error fetching readiness:', error);
      return null;
    }
  }, [schoolId, token]);

  const fetchTimetableVersions = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/smart-scheduling/timetable/versions');
      setTimetableVersions(data.versions || []);
      
      // Find active/published version
      const published = (data.versions || []).find(v => v.status === 'published');
      const draft = (data.versions || []).find(v => v.status === 'draft');
      
      if (published) {
        setActiveVersion(published);
        setSelectedVersionId(published.id);
      } else if (draft) {
        setActiveVersion(draft);
        setSelectedVersionId(draft.id);
      }
      
      return data.versions || [];
    } catch (error) {
      console.error('Error fetching versions:', error);
      return [];
    }
  }, [schoolId, token]);

  const fetchTimeSlots = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/time-slots');
      setTimeSlots(data.time_slots || data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  }, [schoolId, token]);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/classes');
      setClasses(data.classes || data || []);
      
      // Extract unique grades
      const uniqueGrades = [...new Map(
        (data.classes || data || [])
          .filter(c => c.grade)
          .map(c => [c.grade.id, c.grade])
      ).values()];
      setGrades(uniqueGrades);
      
      return data.classes || data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }, [schoolId, token]);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/teachers');
      setTeachers(data.teachers || data || []);
      return data.teachers || data || [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  }, [schoolId, token]);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/school/subjects/unique');
      setSubjects(data.subjects || data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, [schoolId, token]);

  const fetchSessions = useCallback(async (versionId = null) => {
    try {
      const url = versionId 
        ? `/api/smart-scheduling/timetable/${versionId}/sessions`
        : '/api/smart-scheduling/timetable/active/sessions';
      
      const data = await fetchWithAuth(url);
      setSessions(data.sessions || data || []);
      
      // Calculate insights from sessions
      if (data.sessions || data) {
        const sessionsList = data.sessions || data || [];
        setInsights({
          totalRequiredSessions: sessionsList.length,
          totalAssignedSessions: sessionsList.filter(s => s.teacher_id).length,
          totalUnassignedSessions: sessionsList.filter(s => !s.teacher_id).length,
          qualityScore: sessionsList.length > 0 
            ? Math.round((sessionsList.filter(s => s.teacher_id).length / sessionsList.length) * 100)
            : 0,
          warningsCount: sessionsList.filter(s => s.has_warning || (s.warnings && s.warnings.length > 0)).length,
          hardConflictsCount: 0,
          affectedTeachersCount: [...new Set(sessionsList.map(s => s.teacher_id).filter(Boolean))].length,
          affectedClassesCount: [...new Set(sessionsList.map(s => s.class_id).filter(Boolean))].length,
        });
      }
      
      return data.sessions || data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }, [schoolId, token]);

  // ============================================
  // Load Page Data
  // ============================================
  const loadPageData = useCallback(async () => {
    setPageStatus('loading');
    try {
      await Promise.all([
        fetchSchoolInfo(),
        fetchReadinessSummary(),
        fetchTimetableVersions(),
        fetchTimeSlots(),
        fetchClasses(),
        fetchTeachers(),
        fetchSubjects()
      ]);
      
      // Fetch sessions after getting versions
      await fetchSessions();
      
      setPageStatus('ready');
    } catch (error) {
      console.error('Error loading page data:', error);
      setErrorMessage(error.message);
      setPageStatus('error');
    }
  }, [fetchSchoolInfo, fetchReadinessSummary, fetchTimetableVersions, fetchTimeSlots, fetchClasses, fetchTeachers, fetchSubjects, fetchSessions]);

  // Initial Load
  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // Auto-select first class when classes load
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Auto-select first teacher when view mode changes to teacher
  useEffect(() => {
    if (activeViewMode === ViewModes.TEACHER && teachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [activeViewMode, teachers, selectedTeacherId]);

  // ============================================
  // Action Handlers
  // ============================================
  const handleGenerateTimetable = async (payload) => {
    setModalSubmitting(true);
    setGenerationStatus('running');
    setGenerationProgress(0);
    setGenerationMessage('جاري فحص الجاهزية...');
    
    try {
      // Start generation
      const response = await fetchWithAuth('/api/timetable/generate-smart', {
        method: 'POST',
        body: JSON.stringify({
          school_id: schoolId,
          use_baseline: payload.usePublishedAsBaseline
        })
      });
      
      // Simulate progress
      setGenerationProgress(30);
      setGenerationMessage('جاري تجهيز البيانات...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(60);
      setGenerationMessage('جاري توزيع الحصص...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(90);
      setGenerationMessage('جاري حفظ النسخة...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setGenerationProgress(100);
      setGenerationMessage('تم بنجاح!');
      
      setGenerationStatus('success');
      setModalState(prev => ({ ...prev, generationModalOpen: false }));
      toast.success('تم توليد الجدول بنجاح');
      
      // Reload data
      await loadPageData();
      
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStatus('failed');
      setGenerationMessage(error.message);
      toast.error('فشل في توليد الجدول: ' + error.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handlePartialRegenerate = async (payload) => {
    setModalSubmitting(true);
    try {
      await fetchWithAuth('/api/smart-scheduling/timetable/regenerate-partial', {
        method: 'POST',
        body: JSON.stringify({
          school_id: schoolId,
          scope: payload.scope,
          class_id: payload.classId,
          teacher_id: payload.teacherId,
          weekday: payload.weekdayNumber,
          subject_id: payload.subjectId
        })
      });
      
      setModalState(prev => ({ ...prev, partialRegenerationModalOpen: false }));
      toast.success('تمت إعادة المعالجة الجزئية بنجاح');
      await loadPageData();
    } catch (error) {
      toast.error('فشل في إعادة المعالجة: ' + error.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handlePublishVersion = async () => {
    if (!activeVersion) return;
    
    setModalSubmitting(true);
    try {
      await fetchWithAuth(`/api/timetable/publish/${activeVersion.id}`, {
        method: 'POST'
      });
      
      setModalState(prev => ({ ...prev, publishModalOpen: false }));
      toast.success('تم نشر النسخة بنجاح');
      await loadPageData();
    } catch (error) {
      toast.error('فشل في نشر النسخة: ' + error.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleArchiveVersion = async (reason) => {
    if (!activeVersion) return;
    
    setModalSubmitting(true);
    try {
      await fetchWithAuth(`/api/smart-scheduling/timetable/${activeVersion.id}/archive`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      setModalState(prev => ({ ...prev, archiveModalOpen: false }));
      toast.success('تمت أرشفة النسخة بنجاح');
      await loadPageData();
    } catch (error) {
      toast.error('فشل في أرشفة النسخة: ' + error.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleVersionSelect = async (versionId) => {
    setSelectedVersionId(versionId);
    const version = timetableVersions.find(v => v.id === versionId);
    if (version) {
      setActiveVersion(version);
      await fetchSessions(versionId);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setModalState(prev => ({ ...prev, sessionDetailsOpen: true }));
  };

  const handleFixReadinessItem = (itemKey, fixLink) => {
    if (fixLink) {
      navigate(fixLink);
    }
  };

  const handleViewModeChange = (mode) => {
    setActiveViewMode(mode);
    // Reset selections when changing mode
    if (mode === ViewModes.CLASS) {
      setSelectedTeacherId(null);
      if (classes.length > 0 && !selectedClassId) {
        setSelectedClassId(classes[0].id);
      }
    } else if (mode === ViewModes.TEACHER) {
      setSelectedClassId(null);
      if (teachers.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(teachers[0].id);
      }
    }
  };

  // ============================================
  // Computed Values
  // ============================================
  const getCurrentStatus = () => {
    if (generationStatus === 'running') return TimetableStatus.GENERATING;
    if (generationStatus === 'failed') return TimetableStatus.FAILED;
    if (!activeVersion) return TimetableStatus.NONE;
    return activeVersion.status === 'published' ? TimetableStatus.PUBLISHED : TimetableStatus.DRAFT;
  };

  const canGenerate = readinessSummary?.status === ReadinessStatus.FULLY_READY || 
                      readinessSummary?.can_generate === true;
  const hasDraft = timetableVersions.some(v => v.status === 'draft');
  const hasPublished = timetableVersions.some(v => v.status === 'published');

  const generationInputSummary = {
    totalClasses: classes.length,
    totalTeachers: teachers.length,
    totalSubjects: subjects.length,
    totalTeachingSlots: timeSlots.filter(s => !s.is_break && s.type !== 'prayer').length * workingDays.length
  };

  // Get selected filter based on view mode
  const getSelectedFilter = () => {
    switch (activeViewMode) {
      case ViewModes.CLASS:
        return selectedClassId;
      case ViewModes.TEACHER:
        return selectedTeacherId;
      case ViewModes.GRADE:
        return selectedGradeId;
      default:
        return selectedClassId;
    }
  };

  // ============================================
  // Render
  // ============================================
  if (pageStatus === 'loading') {
    return (
      <div className="flex min-h-screen bg-muted/30">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto" dir="rtl">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-6 w-24 rounded-full" />
                ))}
              </div>
            </div>
            
            {/* Content Skeleton */}
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (pageStatus === 'error') {
    return (
      <div className="flex min-h-screen bg-muted/30">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto" dir="rtl">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-red-700 mb-2">حدث خطأ في تحميل الصفحة</h2>
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <button
                onClick={loadPageData}
                className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy/90"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto" dir="rtl" data-testid="principal-timetable-page">
      {/* 1. Page Header */}
      <TimetablePageHeader
        schoolNameAr={schoolInfo?.name_ar || schoolInfo?.school_name_ar}
        academicYearName={schoolInfo?.settings?.academic_year || schoolInfo?.academicYear}
        termName={schoolInfo?.settings?.current_semester || schoolInfo?.currentSemester}
        totalClasses={classes.length}
        totalTeachers={teachers.length}
        totalTeachingSlots={generationInputSummary.totalTeachingSlots}
        currentVersionStatus={getCurrentStatus()}
        userName={userName}
      />

      {/* 2. Status Banner */}
      <TimetableStatusBanner
        status={getCurrentStatus()}
        versionName={activeVersion?.versionName || activeVersion?.version_name}
        generatedAt={activeVersion?.generatedAt || activeVersion?.created_at}
        publishedAt={activeVersion?.publishedAt || activeVersion?.published_at}
        generatedBy={activeVersion?.generatedBy || activeVersion?.created_by}
        qualityScore={insights?.qualityScore || 0}
        warningsCount={insights?.warningsCount || 0}
        message={generationStatus === 'failed' ? generationMessage : ''}
        progress={generationProgress}
        progressMessage={generationMessage}
        onViewDiagnostics={() => setModalState(prev => ({ ...prev, diagnosticsModalOpen: true }))}
        onPublishDraft={hasDraft ? () => setModalState(prev => ({ ...prev, publishModalOpen: true })) : null}
        onStartGeneration={() => setModalState(prev => ({ ...prev, generationModalOpen: true }))}
        onViewVersion={() => {}}
      />

      {/* 3. Action Bar */}
      <TimetableActionBar
        canGenerate={canGenerate}
        canPublish={hasDraft}
        canArchive={hasDraft || hasPublished}
        canPartialRegenerate={hasDraft || hasPublished}
        isGenerating={generationStatus === 'running'}
        hasDraftVersion={hasDraft}
        hasPublishedVersion={hasPublished}
        disabledReason={!canGenerate ? 'البيانات غير مكتملة. يرجى إكمال الإعدادات أولاً.' : ''}
        onGenerateClick={() => setModalState(prev => ({ ...prev, generationModalOpen: true }))}
        onPartialRegenerateClick={() => setModalState(prev => ({ ...prev, partialRegenerationModalOpen: true }))}
        onPublishClick={() => setModalState(prev => ({ ...prev, publishModalOpen: true }))}
        onArchiveClick={() => setModalState(prev => ({ ...prev, archiveModalOpen: true }))}
        onDiagnosticsClick={() => setModalState(prev => ({ ...prev, diagnosticsModalOpen: true }))}
        onGoToSettingsClick={() => navigate('/principal/settings')}
      />

      {/* 4. Readiness Panel */}
      <TimetableReadinessPanel
        items={readinessSummary?.items || []}
        categories={readinessSummary?.categories || {}}
        overallStatus={readinessSummary?.status || ReadinessStatus.NOT_READY}
        percentage={readinessSummary?.percentage || 0}
        criticalIssuesCount={readinessSummary?.critical_issues?.length || 0}
        warningsCount={readinessSummary?.warnings?.length || 0}
        canGenerate={canGenerate}
        onFixItem={handleFixReadinessItem}
        onRefresh={fetchReadinessSummary}
      />

      {/* 5. View Controls */}
      <TimetableViewControls
        activeViewMode={activeViewMode}
        selectedClassId={selectedClassId}
        selectedTeacherId={selectedTeacherId}
        selectedGradeId={selectedGradeId}
        selectedWeekday={selectedWeekday}
        selectedVersionId={selectedVersionId}
        selectedSubjectId={selectedSubjectId}
        classes={classes.map(c => ({ id: c.id, label: c.name || `${c.grade?.name_ar} - ${c.section}`, ...c }))}
        teachers={teachers.map(t => ({ id: t.id, label: t.full_name || t.name, ...t }))}
        grades={grades.map(g => ({ id: g.id, label: g.name_ar, ...g }))}
        subjects={subjects.map(s => ({ id: s.id || s.name_ar, label: s.name_ar, ...s }))}
        weekdays={workingDays}
        versions={timetableVersions.map(v => ({ 
          id: v.id, 
          label: v.versionName || v.version_name || `نسخة ${v.id?.substring(0, 6)}`,
          ...v 
        }))}
        searchQuery={searchQuery}
        toggles={toggles}
        onViewModeChange={handleViewModeChange}
        onClassChange={setSelectedClassId}
        onTeacherChange={setSelectedTeacherId}
        onGradeChange={setSelectedGradeId}
        onWeekdayChange={setSelectedWeekday}
        onVersionChange={handleVersionSelect}
        onSubjectChange={setSelectedSubjectId}
        onSearchChange={setSearchQuery}
        onToggleChange={(updates) => setToggles(prev => ({ ...prev, ...updates }))}
        showFilters={true}
        showSearch={true}
        showToggles={true}
      />

      {/* Main Content - Grid + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6. Main Grid (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <TimetableGridSection
            loading={pageStatus === 'loading'}
            hasData={sessions.length > 0 || timeSlots.length > 0}
            activeViewMode={activeViewMode}
            workingDays={workingDays}
            timeSlots={timeSlots}
            sessions={sessions}
            selectedFilter={getSelectedFilter()}
            filterType={activeViewMode === ViewModes.TEACHER ? 'teacher' : 'class'}
            showBreaks={toggles.showBreaks}
            showPrayer={toggles.showPrayer}
            showWarnings={toggles.showWarnings}
            showColorCoding={toggles.showColorCoding}
            onSessionClick={handleSessionClick}
            onGenerate={() => setModalState(prev => ({ ...prev, generationModalOpen: true }))}
            onClearFilters={() => {
              setSelectedClassId(null);
              setSelectedTeacherId(null);
              setSelectedGradeId(null);
            }}
          />

          {/* 9. Issues Section */}
          <TimetableIssuesSection
            items={issues}
            loading={false}
            onOpenIssue={(issueId) => console.log('Open issue:', issueId)}
            onFixIssue={handleFixReadinessItem}
          />
        </div>

        {/* Side Panels (1/3 width) */}
        <div className="space-y-6">
          {/* 7. Insights Panel */}
          <TimetableInsightsPanel
            insights={insights}
            loading={pageStatus === 'loading'}
            onOpenDiagnostics={() => setModalState(prev => ({ ...prev, diagnosticsModalOpen: true }))}
          />

          {/* 8. Version Manager */}
          <TimetableVersionManager
            versions={timetableVersions.map(v => ({
              id: v.id,
              versionName: v.versionName || v.version_name || `نسخة ${v.id?.substring(0, 6)}`,
              status: v.status,
              generationMode: v.generation_mode || 'full',
              qualityScore: v.quality_score || 0,
              conflictsCount: v.conflicts_count || 0,
              warningsCount: v.warnings_count || 0,
              generatedAt: v.created_at,
              generatedBy: v.created_by || 'النظام'
            }))}
            selectedVersionId={selectedVersionId}
            onSelectVersion={handleVersionSelect}
            onPublishVersion={(id) => {
              const version = timetableVersions.find(v => v.id === id);
              if (version) {
                setActiveVersion(version);
                setModalState(prev => ({ ...prev, publishModalOpen: true }));
              }
            }}
            onArchiveVersion={(id) => {
              const version = timetableVersions.find(v => v.id === id);
              if (version) {
                setActiveVersion(version);
                setModalState(prev => ({ ...prev, archiveModalOpen: true }));
              }
            }}
            onCompareVersion={(id) => console.log('Compare version:', id)}
            onRestoreAsBase={(id) => console.log('Restore as base:', id)}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* Modals */}
      {/* ============================================ */}
      
      {/* AI Generation Modal */}
      <AITimetableGenerationModal
        open={modalState.generationModalOpen}
        readinessSummary={readinessSummary}
        generationInputSummary={generationInputSummary}
        submitting={modalSubmitting}
        onConfirm={handleGenerateTimetable}
        onClose={() => setModalState(prev => ({ ...prev, generationModalOpen: false }))}
      />

      {/* Partial Regeneration Modal */}
      <PartialRegenerationModal
        open={modalState.partialRegenerationModalOpen}
        classes={classes.map(c => ({ id: c.id, label: c.name || `${c.grade?.name_ar} - ${c.section}`, ...c }))}
        teachers={teachers.map(t => ({ id: t.id, label: t.full_name || t.name, ...t }))}
        weekdays={workingDays}
        subjects={subjects.map(s => ({ id: s.id || s.name_ar, label: s.name_ar, ...s }))}
        grades={grades}
        submitting={modalSubmitting}
        onConfirm={handlePartialRegenerate}
        onClose={() => setModalState(prev => ({ ...prev, partialRegenerationModalOpen: false }))}
      />

      {/* Publish Modal */}
      <PublishTimetableVersionModal
        open={modalState.publishModalOpen}
        version={activeVersion ? {
          id: activeVersion.id,
          versionName: activeVersion.versionName || activeVersion.version_name,
          qualityScore: insights?.qualityScore || 0,
          warningsCount: insights?.warningsCount || 0
        } : null}
        blockingIssuesCount={readinessSummary?.critical_issues?.length || 0}
        submitting={modalSubmitting}
        onConfirm={handlePublishVersion}
        onClose={() => setModalState(prev => ({ ...prev, publishModalOpen: false }))}
      />

      {/* Archive Modal */}
      <ArchiveTimetableVersionModal
        open={modalState.archiveModalOpen}
        version={activeVersion ? {
          id: activeVersion.id,
          versionName: activeVersion.versionName || activeVersion.version_name,
          status: activeVersion.status
        } : null}
        submitting={modalSubmitting}
        onConfirm={handleArchiveVersion}
        onClose={() => setModalState(prev => ({ ...prev, archiveModalOpen: false }))}
      />

      {/* Diagnostics Modal */}
      <TimetableDiagnosticsModal
        open={modalState.diagnosticsModalOpen}
        diagnostics={diagnostics}
        loading={false}
        onClose={() => setModalState(prev => ({ ...prev, diagnosticsModalOpen: false }))}
      />

      {/* Session Details Drawer */}
      <TimetableSessionDetailsDrawer
        open={modalState.sessionDetailsOpen}
        session={selectedSession ? {
          id: selectedSession.id,
          subjectName: selectedSession.subject_name,
          teacherName: selectedSession.teacher_name,
          className: selectedSession.class_name,
          weekdayLabel: selectedSession.day_of_week,
          startTime: selectedSession.start_time,
          endTime: selectedSession.end_time,
          roomName: selectedSession.room_name,
          isAiGenerated: selectedSession.is_ai_generated || selectedSession.source === 'ai',
          isLocked: selectedSession.is_locked,
          status: selectedSession.status,
          notes: selectedSession.notes,
          warnings: selectedSession.warnings || []
        } : null}
        loading={false}
        onClose={() => {
          setModalState(prev => ({ ...prev, sessionDetailsOpen: false }));
          setSelectedSession(null);
        }}
        onLock={(id) => console.log('Lock session:', id)}
        onUnlock={(id) => console.log('Unlock session:', id)}
        onRegenerateRelated={(id) => console.log('Regenerate for session:', id)}
      />
    </div>
  );
};

export default PrincipalTimetablePage;
