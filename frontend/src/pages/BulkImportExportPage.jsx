/**
 * Bulk Import/Export Page
 * صفحة الاستيراد والتصدير الجماعي
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/ai/HakimAssistant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Calendar,
  ClipboardList,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileDown,
  FileUp,
  Trash2,
  Eye,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const BulkImportExportPage = () => {
  const { token, user } = useAuth();
  const { isRTL } = useTheme();
  
  // Import state
  const [importType, setImportType] = useState('students');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  
  // Export state
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exporting, setExporting] = useState(false);
  
  // Download template
  const downloadTemplate = async (type) => {
    try {
      const response = await axios.get(`${API_URL}/api/bulk/template/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', type === 'students' ? 'قالب_استيراد_الطلاب.xlsx' : 'قالب_استيراد_المعلمين.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(isRTL ? 'تم تحميل القالب بنجاح' : 'Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error(isRTL ? 'فشل تحميل القالب' : 'Failed to download template');
    }
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
      
      if (!isValid) {
        toast.error(isRTL ? 'يجب أن يكون الملف بصيغة Excel أو CSV' : 'File must be Excel or CSV format');
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
    }
  };
  
  // Import data
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error(isRTL ? 'يرجى اختيار ملف' : 'Please select a file');
      return;
    }
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post(
        `${API_URL}/api/bulk/import/${importType}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setImportResult(response.data);
      
      if (response.data.success) {
        toast.success(
          isRTL 
            ? `تم استيراد ${response.data.imported} سجل بنجاح` 
            : `Successfully imported ${response.data.imported} records`
        );
      } else {
        toast.warning(
          isRTL 
            ? `تم استيراد ${response.data.imported} من ${response.data.total_rows} سجل` 
            : `Imported ${response.data.imported} of ${response.data.total_rows} records`
        );
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'فشل الاستيراد' : 'Import failed'));
    } finally {
      setImporting(false);
    }
  };
  
  // Export data
  const handleExport = async () => {
    setExporting(true);
    
    try {
      const response = await axios.get(
        `${API_URL}/api/bulk/export/${exportType}?format=${exportFormat}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const filename = {
        students: 'تصدير_الطلاب',
        teachers: 'تصدير_المعلمين',
        schedule: 'تصدير_الجدول',
        attendance: 'تصدير_الحضور',
        grades: 'تصدير_الدرجات'
      }[exportType] || 'تصدير';
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(isRTL ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      const message = error.response?.status === 404 
        ? (isRTL ? 'لا توجد بيانات للتصدير' : 'No data to export')
        : (isRTL ? 'فشل التصدير' : 'Export failed');
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };
  
  const importTypeOptions = [
    { value: 'students', label: isRTL ? 'الطلاب' : 'Students', icon: GraduationCap },
    { value: 'teachers', label: isRTL ? 'المعلمين' : 'Teachers', icon: Users },
  ];
  
  const exportTypeOptions = [
    { value: 'students', label: isRTL ? 'الطلاب' : 'Students', icon: GraduationCap },
    { value: 'teachers', label: isRTL ? 'المعلمين' : 'Teachers', icon: Users },
    { value: 'schedule', label: isRTL ? 'الجدول الدراسي' : 'Schedule', icon: Calendar },
    { value: 'attendance', label: isRTL ? 'سجل الحضور' : 'Attendance', icon: ClipboardList },
    { value: 'grades', label: isRTL ? 'الدرجات' : 'Grades', icon: Award },
  ];
  
  return (
    <Sidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-cairo text-brand-navy dark:text-white flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-brand-turquoise" />
            {isRTL ? 'الاستيراد والتصدير' : 'Import & Export'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'استيراد وتصدير البيانات بصيغة Excel أو CSV' : 'Import and export data in Excel or CSV format'}
          </p>
        </div>
        
        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              {isRTL ? 'الاستيراد' : 'Import'}
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              {isRTL ? 'التصدير' : 'Export'}
            </TabsTrigger>
          </TabsList>
          
          {/* Import Tab */}
          <TabsContent value="import">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Import Form */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-brand-turquoise" />
                    {isRTL ? 'استيراد البيانات' : 'Import Data'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'قم برفع ملف Excel أو CSV لاستيراد البيانات' : 'Upload an Excel or CSV file to import data'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Choose Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {isRTL ? '1. اختر نوع البيانات' : '1. Choose data type'}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {importTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setImportType(option.value)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              importType === option.value
                                ? 'border-brand-turquoise bg-brand-turquoise/10'
                                : 'border-border hover:border-brand-turquoise/50'
                            }`}
                          >
                            <Icon className={`h-8 w-8 mx-auto mb-2 ${
                              importType === option.value ? 'text-brand-turquoise' : 'text-muted-foreground'
                            }`} />
                            <p className="text-sm font-medium">{option.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Step 2: Download Template */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {isRTL ? '2. حمّل القالب (اختياري)' : '2. Download template (optional)'}
                    </Label>
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate(importType)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 me-2" />
                      {isRTL ? 'تحميل قالب ' : 'Download '} 
                      {importType === 'students' ? (isRTL ? 'الطلاب' : 'Students') : (isRTL ? 'المعلمين' : 'Teachers')}
                    </Button>
                  </div>
                  
                  {/* Step 3: Upload File */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {isRTL ? '3. ارفع الملف' : '3. Upload file'}
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-brand-turquoise/50 transition-colors">
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {isRTL ? 'اسحب الملف هنا أو انقر للاختيار' : 'Drag file here or click to select'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'يدعم: Excel (.xlsx, .xls) و CSV' : 'Supports: Excel (.xlsx, .xls) and CSV'}
                        </p>
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5 text-brand-turquoise" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <Badge variant="secondary">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFile(null);
                            setImportResult(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Import Button */}
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || importing}
                    className="w-full bg-brand-turquoise hover:bg-brand-turquoise/90"
                  >
                    {importing ? (
                      <>
                        <RefreshCw className="h-4 w-4 me-2 animate-spin" />
                        {isRTL ? 'جاري الاستيراد...' : 'Importing...'}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 me-2" />
                        {isRTL ? 'بدء الاستيراد' : 'Start Import'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Import Results */}
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-brand-purple" />
                    {isRTL ? 'نتيجة الاستيراد' : 'Import Result'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!importResult ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <FileSpreadsheet className="h-16 w-16 mb-4 opacity-30" />
                      <p className="text-sm">{isRTL ? 'لم يتم الاستيراد بعد' : 'No import yet'}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/30 rounded-xl">
                          <p className="text-2xl font-bold text-brand-navy dark:text-white">
                            {importResult.total_rows}
                          </p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الصفوف' : 'Total Rows'}</p>
                        </div>
                        <div className="text-center p-4 bg-green-500/10 rounded-xl">
                          <p className="text-2xl font-bold text-green-600">
                            {importResult.imported}
                          </p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'تم استيرادها' : 'Imported'}</p>
                        </div>
                        <div className="text-center p-4 bg-red-500/10 rounded-xl">
                          <p className="text-2xl font-bold text-red-600">
                            {importResult.failed}
                          </p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'فشلت' : 'Failed'}</p>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{isRTL ? 'نسبة النجاح' : 'Success Rate'}</span>
                          <span className="font-medium">
                            {((importResult.imported / importResult.total_rows) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={(importResult.imported / importResult.total_rows) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      {/* Errors */}
                      {importResult.errors?.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            {isRTL ? 'الأخطاء' : 'Errors'} ({importResult.errors.length})
                          </Label>
                          <ScrollArea className="h-40 border rounded-lg p-2">
                            {importResult.errors.map((error, idx) => (
                              <div key={idx} className="text-xs p-2 bg-red-500/10 rounded mb-1">
                                <span className="font-medium">{isRTL ? 'صف' : 'Row'} {error.row}:</span>
                                {error.field && <span className="mx-1">[{error.field}]</span>}
                                <span>{error.message}</span>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      )}
                      
                      {/* Warnings */}
                      {importResult.warnings?.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {isRTL ? 'تحذيرات' : 'Warnings'} ({importResult.warnings.length})
                          </Label>
                          <ScrollArea className="h-32 border rounded-lg p-2">
                            {importResult.warnings.map((warning, idx) => (
                              <div key={idx} className="text-xs p-2 bg-amber-500/10 rounded mb-1">
                                <span className="font-medium">{isRTL ? 'صف' : 'Row'} {warning.row}:</span>
                                <span className="ms-1">{warning.message}</span>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      )}
                      
                      {/* Success Message */}
                      {importResult.success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {isRTL ? 'تم الاستيراد بنجاح!' : 'Import completed successfully!'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Export Tab */}
          <TabsContent value="export">
            <Card className="card-nassaq max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-brand-turquoise" />
                  {isRTL ? 'تصدير البيانات' : 'Export Data'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اختر نوع البيانات والصيغة لتصديرها' : 'Choose data type and format to export'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Choose Export Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {isRTL ? 'نوع البيانات' : 'Data Type'}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {exportTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setExportType(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            exportType === option.value
                              ? 'border-brand-turquoise bg-brand-turquoise/10'
                              : 'border-border hover:border-brand-turquoise/50'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mx-auto mb-2 ${
                            exportType === option.value ? 'text-brand-turquoise' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm font-medium">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Choose Format */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {isRTL ? 'صيغة الملف' : 'File Format'}
                  </Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          CSV (.csv)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Export Button */}
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full bg-brand-navy hover:bg-brand-navy/90"
                >
                  {exporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 me-2 animate-spin" />
                      {isRTL ? 'جاري التصدير...' : 'Exporting...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 me-2" />
                      {isRTL ? 'تصدير البيانات' : 'Export Data'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};

export default BulkImportExportPage;
