import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, Shield, Eye, EyeOff, Copy, Check,
  ChevronLeft, ChevronRight, UserPlus, Settings, Lock, Send,
  CheckCircle2, XCircle, Plus, Minus, AlertTriangle, Sparkles,
  Building2, Users, BarChart3, Activity, FileText, Brain,
  GraduationCap, UserCheck, CalendarCheck, Bell, MessageSquare,
  Link2, Archive, Server, Database, Search, Key
} from 'lucide-react';

// =============================================================
// نظام الأدوار والصلاحيات - Roles & Permissions System (RBAC)
// =============================================================

// الأدوار المتاحة لمدير المنصة
const AVAILABLE_ROLES = [
  {
    id: 'platform_operations_manager',
    name: 'مدير العمليات التشغيلية',
    name_en: 'Platform Operations Manager',
    description: 'مسؤول عن متابعة العمليات التشغيلية اليومية للمنصة',
    description_en: 'Responsible for monitoring daily platform operations',
    icon: Activity,
    color: 'bg-blue-500',
  },
  {
    id: 'platform_technical_admin',
    name: 'مسؤول الإدارة التقنية',
    name_en: 'Platform Technical Administrator',
    description: 'مسؤول عن الجوانب التقنية وإدارة البنية التحتية للنظام',
    description_en: 'Responsible for technical aspects and system infrastructure',
    icon: Server,
    color: 'bg-purple-500',
  },
  {
    id: 'platform_support_specialist',
    name: 'مسؤول دعم المستخدمين',
    name_en: 'Platform Support Specialist',
    description: 'مسؤول عن دعم المستخدمين والتعامل مع طلبات المساعدة',
    description_en: 'Responsible for user support and assistance requests',
    icon: MessageSquare,
    color: 'bg-green-500',
  },
  {
    id: 'platform_data_analyst',
    name: 'محلل بيانات المنصة',
    name_en: 'Platform Data Analyst',
    description: 'مسؤول عن تحليل البيانات وإعداد التقارير الاستراتيجية',
    description_en: 'Responsible for data analysis and strategic reports',
    icon: BarChart3,
    color: 'bg-orange-500',
  },
  {
    id: 'platform_security_officer',
    name: 'مسؤول أمن المنصة',
    name_en: 'Platform Security Officer',
    description: 'مسؤول عن مراقبة أمن النظام وإدارة الحوادث الأمنية',
    description_en: 'Responsible for security monitoring and incident management',
    icon: Shield,
    color: 'bg-red-500',
  },
  {
    id: 'testing_account',
    name: 'حساب اختبار',
    name_en: 'Testing Account',
    description: 'حساب مخصص للاختبارات التقنية أو اختبار الميزات الجديدة',
    description_en: 'Account for technical testing or new feature testing',
    icon: Settings,
    color: 'bg-gray-500',
  },
  {
    id: 'teacher',
    name: 'معلم',
    name_en: 'Teacher',
    description: 'حساب معلم يمكن إنشاؤه مباشرة من مستوى المنصة',
    description_en: 'Teacher account created directly from platform level',
    icon: GraduationCap,
    color: 'bg-teal-500',
  },
];

// تعريف جميع الصلاحيات المتاحة
const ALL_PERMISSIONS = {
  // صلاحيات عرض وتحليل النظام
  view_platform_dashboard: {
    id: 'view_platform_dashboard',
    name: 'عرض لوحة التحكم',
    name_en: 'View Platform Dashboard',
    category: 'system_view',
    icon: Activity,
  },
  view_platform_analytics: {
    id: 'view_platform_analytics',
    name: 'عرض مؤشرات المنصة',
    name_en: 'View Platform Analytics',
    category: 'system_view',
    icon: BarChart3,
  },
  view_daily_activity: {
    id: 'view_daily_activity',
    name: 'عرض النشاط اليومي',
    name_en: 'View Daily Activity',
    category: 'system_view',
    icon: Activity,
  },
  view_operational_reports: {
    id: 'view_operational_reports',
    name: 'عرض التقارير التشغيلية',
    name_en: 'View Operational Reports',
    category: 'system_view',
    icon: FileText,
  },
  
  // صلاحيات إدارة المدارس
  view_schools: {
    id: 'view_schools',
    name: 'عرض المدارس',
    name_en: 'View Schools',
    category: 'schools',
    icon: Building2,
  },
  open_school_panel: {
    id: 'open_school_panel',
    name: 'فتح لوحة المدرسة',
    name_en: 'Open School Panel',
    category: 'schools',
    icon: Building2,
  },
  view_school_data: {
    id: 'view_school_data',
    name: 'عرض بيانات المدرسة',
    name_en: 'View School Data',
    category: 'schools',
    icon: Eye,
  },
  review_subscription: {
    id: 'review_subscription',
    name: 'مراجعة حالة الاشتراك',
    name_en: 'Review Subscription Status',
    category: 'schools',
    icon: CheckCircle2,
  },
  review_data_completeness: {
    id: 'review_data_completeness',
    name: 'مراجعة اكتمال البيانات',
    name_en: 'Review Data Completeness',
    category: 'schools',
    icon: Database,
  },
  delete_schools: {
    id: 'delete_schools',
    name: 'حذف المدارس',
    name_en: 'Delete Schools',
    category: 'schools',
    icon: XCircle,
    dangerous: true,
  },
  
  // صلاحيات المستخدمين
  view_users: {
    id: 'view_users',
    name: 'عرض المستخدمين',
    name_en: 'View Users',
    category: 'users',
    icon: Users,
  },
  review_user_accounts: {
    id: 'review_user_accounts',
    name: 'مراجعة بيانات الحسابات',
    name_en: 'Review User Accounts',
    category: 'users',
    icon: UserCheck,
  },
  resend_login_invitation: {
    id: 'resend_login_invitation',
    name: 'إعادة إرسال دعوة الدخول',
    name_en: 'Resend Login Invitation',
    category: 'users',
    icon: Send,
  },
  reset_password: {
    id: 'reset_password',
    name: 'إعادة تعيين كلمة المرور',
    name_en: 'Reset Password',
    category: 'users',
    icon: Lock,
  },
  activate_accounts: {
    id: 'activate_accounts',
    name: 'تفعيل الحسابات',
    name_en: 'Activate Accounts',
    category: 'users',
    icon: CheckCircle2,
  },
  suspend_accounts: {
    id: 'suspend_accounts',
    name: 'تعليق الحسابات مؤقتاً',
    name_en: 'Suspend Accounts',
    category: 'users',
    icon: AlertTriangle,
  },
  create_admin_users: {
    id: 'create_admin_users',
    name: 'إنشاء مستخدمين إداريين',
    name_en: 'Create Admin Users',
    category: 'users',
    icon: UserPlus,
    dangerous: true,
  },
  delete_users: {
    id: 'delete_users',
    name: 'حذف المستخدمين',
    name_en: 'Delete Users',
    category: 'users',
    icon: XCircle,
    dangerous: true,
  },
  modify_permissions: {
    id: 'modify_permissions',
    name: 'تعديل الصلاحيات',
    name_en: 'Modify Permissions',
    category: 'users',
    icon: Shield,
    dangerous: true,
  },
  
  // صلاحيات طلبات الحسابات
  view_teacher_requests: {
    id: 'view_teacher_requests',
    name: 'عرض طلبات المعلمين',
    name_en: 'View Teacher Requests',
    category: 'requests',
    icon: FileText,
  },
  review_requests: {
    id: 'review_requests',
    name: 'مراجعة الطلبات',
    name_en: 'Review Requests',
    category: 'requests',
    icon: Eye,
  },
  request_additional_info: {
    id: 'request_additional_info',
    name: 'طلب معلومات إضافية',
    name_en: 'Request Additional Info',
    category: 'requests',
    icon: MessageSquare,
  },
  
  // صلاحيات التقارير
  view_performance_reports: {
    id: 'view_performance_reports',
    name: 'عرض تقارير الأداء',
    name_en: 'View Performance Reports',
    category: 'reports',
    icon: BarChart3,
  },
  view_activity_reports: {
    id: 'view_activity_reports',
    name: 'عرض تقارير النشاط',
    name_en: 'View Activity Reports',
    category: 'reports',
    icon: Activity,
  },
  create_operational_reports: {
    id: 'create_operational_reports',
    name: 'إنشاء تقارير تشغيلية',
    name_en: 'Create Operational Reports',
    category: 'reports',
    icon: FileText,
  },
  export_reports: {
    id: 'export_reports',
    name: 'تصدير التقارير',
    name_en: 'Export Reports',
    category: 'reports',
    icon: Archive,
  },
  
  // صلاحيات الذكاء الاصطناعي
  run_ai_analytics: {
    id: 'run_ai_analytics',
    name: 'تشغيل تحليلات AI',
    name_en: 'Run AI Analytics',
    category: 'ai',
    icon: Brain,
  },
  view_ai_insights: {
    id: 'view_ai_insights',
    name: 'عرض AI Insights',
    name_en: 'View AI Insights',
    category: 'ai',
    icon: Sparkles,
  },
  run_ai_summary: {
    id: 'run_ai_summary',
    name: 'تشغيل AI Executive Summary',
    name_en: 'Run AI Executive Summary',
    category: 'ai',
    icon: FileText,
  },
  run_ai_data_quality: {
    id: 'run_ai_data_quality',
    name: 'تشغيل AI Data Quality Scan',
    name_en: 'Run AI Data Quality Scan',
    category: 'ai',
    icon: Database,
  },
  run_ai_import_analyzer: {
    id: 'run_ai_import_analyzer',
    name: 'تشغيل AI Import Analyzer',
    name_en: 'Run AI Import Analyzer',
    category: 'ai',
    icon: Archive,
  },
  run_ai_security: {
    id: 'run_ai_security',
    name: 'تشغيل AI Security Analysis',
    name_en: 'Run AI Security Analysis',
    category: 'ai',
    icon: Shield,
  },
  
  // صلاحيات مراقبة النظام
  access_system_monitoring: {
    id: 'access_system_monitoring',
    name: 'الوصول لمراقبة النظام',
    name_en: 'Access System Monitoring',
    category: 'system',
    icon: Server,
  },
  view_server_status: {
    id: 'view_server_status',
    name: 'عرض حالة الخوادم',
    name_en: 'View Server Status',
    category: 'system',
    icon: Server,
  },
  view_resource_usage: {
    id: 'view_resource_usage',
    name: 'عرض استهلاك الموارد',
    name_en: 'View Resource Usage',
    category: 'system',
    icon: Activity,
  },
  view_db_performance: {
    id: 'view_db_performance',
    name: 'عرض أداء قواعد البيانات',
    name_en: 'View Database Performance',
    category: 'system',
    icon: Database,
  },
  view_api_performance: {
    id: 'view_api_performance',
    name: 'عرض أداء API',
    name_en: 'View API Performance',
    category: 'system',
    icon: Link2,
  },
  run_health_check: {
    id: 'run_health_check',
    name: 'تشغيل System Health Check',
    name_en: 'Run System Health Check',
    category: 'system',
    icon: CheckCircle2,
  },
  restart_services: {
    id: 'restart_services',
    name: 'إعادة تشغيل الخدمات',
    name_en: 'Restart Services',
    category: 'system',
    icon: Settings,
    dangerous: true,
  },
  
  // صلاحيات السجلات
  view_system_logs: {
    id: 'view_system_logs',
    name: 'عرض سجلات النظام',
    name_en: 'View System Logs',
    category: 'logs',
    icon: FileText,
  },
  view_error_logs: {
    id: 'view_error_logs',
    name: 'عرض سجلات الأخطاء',
    name_en: 'View Error Logs',
    category: 'logs',
    icon: AlertTriangle,
  },
  view_performance_logs: {
    id: 'view_performance_logs',
    name: 'عرض سجلات الأداء',
    name_en: 'View Performance Logs',
    category: 'logs',
    icon: BarChart3,
  },
  view_audit_logs: {
    id: 'view_audit_logs',
    name: 'عرض Audit Logs',
    name_en: 'View Audit Logs',
    category: 'logs',
    icon: FileText,
  },
  view_security_logs: {
    id: 'view_security_logs',
    name: 'عرض Security Logs',
    name_en: 'View Security Logs',
    category: 'logs',
    icon: Shield,
  },
  
  // صلاحيات التكاملات
  view_integrations: {
    id: 'view_integrations',
    name: 'عرض التكاملات',
    name_en: 'View Integrations',
    category: 'integrations',
    icon: Link2,
  },
  test_external_connections: {
    id: 'test_external_connections',
    name: 'اختبار الاتصالات الخارجية',
    name_en: 'Test External Connections',
    category: 'integrations',
    icon: Link2,
  },
  resync_data: {
    id: 'resync_data',
    name: 'إعادة مزامنة البيانات',
    name_en: 'Resync Data',
    category: 'integrations',
    icon: Settings,
  },
  manage_integrations: {
    id: 'manage_integrations',
    name: 'إدارة التكاملات',
    name_en: 'Manage Integrations',
    category: 'integrations',
    icon: Settings,
    dangerous: true,
  },
  
  // صلاحيات الأمان
  access_security_center: {
    id: 'access_security_center',
    name: 'الوصول لمركز الأمان',
    name_en: 'Access Security Center',
    category: 'security',
    icon: Shield,
  },
  view_security_incidents: {
    id: 'view_security_incidents',
    name: 'عرض الحوادث الأمنية',
    name_en: 'View Security Incidents',
    category: 'security',
    icon: AlertTriangle,
  },
  view_failed_logins: {
    id: 'view_failed_logins',
    name: 'عرض محاولات الدخول الفاشلة',
    name_en: 'View Failed Login Attempts',
    category: 'security',
    icon: XCircle,
  },
  view_locked_accounts: {
    id: 'view_locked_accounts',
    name: 'عرض الحسابات المقفلة',
    name_en: 'View Locked Accounts',
    category: 'security',
    icon: Lock,
  },
  end_user_sessions: {
    id: 'end_user_sessions',
    name: 'إنهاء جلسات المستخدمين',
    name_en: 'End User Sessions',
    category: 'security',
    icon: XCircle,
  },
  lock_suspicious_accounts: {
    id: 'lock_suspicious_accounts',
    name: 'قفل الحسابات المشبوهة',
    name_en: 'Lock Suspicious Accounts',
    category: 'security',
    icon: Lock,
  },
  create_security_reports: {
    id: 'create_security_reports',
    name: 'إنشاء تقارير أمنية',
    name_en: 'Create Security Reports',
    category: 'security',
    icon: FileText,
  },
  export_security_logs: {
    id: 'export_security_logs',
    name: 'تصدير سجلات الأمان',
    name_en: 'Export Security Logs',
    category: 'security',
    icon: Archive,
  },
  
  // صلاحيات الرسائل
  send_user_messages: {
    id: 'send_user_messages',
    name: 'إرسال رسائل للمستخدمين',
    name_en: 'Send User Messages',
    category: 'communication',
    icon: MessageSquare,
  },
  send_notifications: {
    id: 'send_notifications',
    name: 'إرسال إشعارات',
    name_en: 'Send Notifications',
    category: 'communication',
    icon: Bell,
  },
  
  // صلاحيات إعدادات النظام
  modify_system_settings: {
    id: 'modify_system_settings',
    name: 'تعديل إعدادات النظام',
    name_en: 'Modify System Settings',
    category: 'settings',
    icon: Settings,
    dangerous: true,
  },
  modify_rules: {
    id: 'modify_rules',
    name: 'تعديل القواعد التعليمية',
    name_en: 'Modify Educational Rules',
    category: 'settings',
    icon: FileText,
    dangerous: true,
  },
  
  // صلاحيات المعلم
  view_classes: {
    id: 'view_classes',
    name: 'عرض الفصول',
    name_en: 'View Classes',
    category: 'teacher',
    icon: Building2,
  },
  manage_own_class: {
    id: 'manage_own_class',
    name: 'إدارة فصله الخاص',
    name_en: 'Manage Own Class',
    category: 'teacher',
    icon: Settings,
  },
  view_class_students: {
    id: 'view_class_students',
    name: 'عرض طلاب فصوله',
    name_en: 'View Class Students',
    category: 'teacher',
    icon: Users,
  },
  record_attendance: {
    id: 'record_attendance',
    name: 'تسجيل الحضور',
    name_en: 'Record Attendance',
    category: 'teacher',
    icon: CalendarCheck,
  },
  create_assignments: {
    id: 'create_assignments',
    name: 'إنشاء واجبات',
    name_en: 'Create Assignments',
    category: 'teacher',
    icon: FileText,
  },
  grade_assignments: {
    id: 'grade_assignments',
    name: 'تصحيح الواجبات',
    name_en: 'Grade Assignments',
    category: 'teacher',
    icon: CheckCircle2,
  },
  enter_grades: {
    id: 'enter_grades',
    name: 'إدخال الدرجات',
    name_en: 'Enter Grades',
    category: 'teacher',
    icon: BarChart3,
  },
  view_student_reports: {
    id: 'view_student_reports',
    name: 'عرض تقارير الطلاب',
    name_en: 'View Student Reports',
    category: 'teacher',
    icon: FileText,
  },
  message_students: {
    id: 'message_students',
    name: 'مراسلة الطلاب',
    name_en: 'Message Students',
    category: 'teacher',
    icon: MessageSquare,
  },
  message_parents: {
    id: 'message_parents',
    name: 'مراسلة أولياء الأمور',
    name_en: 'Message Parents',
    category: 'teacher',
    icon: MessageSquare,
  },
  use_ai_assistant: {
    id: 'use_ai_assistant',
    name: 'استخدام مساعد AI التعليمي',
    name_en: 'Use AI Teaching Assistant',
    category: 'teacher',
    icon: Brain,
  },
  
  // صلاحيات الاختبار
  access_all_pages: {
    id: 'access_all_pages',
    name: 'الوصول لصفحات النظام',
    name_en: 'Access System Pages',
    category: 'testing',
    icon: Eye,
  },
  test_features: {
    id: 'test_features',
    name: 'تجربة الميزات',
    name_en: 'Test Features',
    category: 'testing',
    icon: Settings,
  },
  create_test_data: {
    id: 'create_test_data',
    name: 'إنشاء بيانات اختبارية',
    name_en: 'Create Test Data',
    category: 'testing',
    icon: Plus,
  },
  test_ai_features: {
    id: 'test_ai_features',
    name: 'تجربة ميزات AI',
    name_en: 'Test AI Features',
    category: 'testing',
    icon: Brain,
  },
  modify_real_data: {
    id: 'modify_real_data',
    name: 'تعديل بيانات حقيقية',
    name_en: 'Modify Real Data',
    category: 'testing',
    icon: Settings,
    dangerous: true,
  },
};

// الصلاحيات الافتراضية لكل دور
const DEFAULT_ROLE_PERMISSIONS = {
  platform_operations_manager: [
    'view_platform_dashboard', 'view_platform_analytics', 'view_daily_activity', 'view_operational_reports',
    'view_schools', 'open_school_panel', 'view_school_data', 'review_subscription', 'review_data_completeness',
    'view_users', 'review_user_accounts', 'resend_login_invitation',
    'view_performance_reports', 'view_activity_reports', 'create_operational_reports',
    'run_ai_analytics', 'view_ai_insights', 'run_ai_summary',
  ],
  platform_technical_admin: [
    'access_system_monitoring', 'view_server_status', 'view_resource_usage', 'view_db_performance', 'view_api_performance',
    'view_system_logs', 'view_error_logs', 'view_performance_logs',
    'run_health_check', 'restart_services',
    'view_integrations', 'test_external_connections', 'resync_data',
    'run_ai_data_quality', 'run_ai_import_analyzer',
  ],
  platform_support_specialist: [
    'view_users', 'review_user_accounts', 'reset_password', 'resend_login_invitation', 'activate_accounts', 'suspend_accounts',
    'view_teacher_requests', 'review_requests', 'request_additional_info',
    'view_schools', 'open_school_panel', 'view_school_data',
    'send_user_messages', 'send_notifications',
  ],
  platform_data_analyst: [
    'view_platform_analytics',
    'view_performance_reports', 'view_activity_reports', 'create_operational_reports', 'export_reports',
    'view_schools', 'view_school_data',
    'view_users',
    'run_ai_analytics', 'run_ai_summary', 'run_ai_data_quality',
  ],
  platform_security_officer: [
    'access_security_center', 'view_security_incidents', 'view_failed_logins', 'view_locked_accounts',
    'end_user_sessions', 'lock_suspicious_accounts',
    'view_audit_logs', 'view_security_logs',
    'create_security_reports', 'export_security_logs',
    'run_ai_security',
  ],
  testing_account: [
    'access_all_pages', 'test_features', 'create_test_data',
    'view_performance_reports',
    'test_ai_features',
  ],
  teacher: [
    'view_classes', 'manage_own_class', 'view_class_students', 'record_attendance',
    'create_assignments', 'grade_assignments', 'enter_grades', 'view_student_reports',
    'message_students', 'message_parents',
    'use_ai_assistant',
  ],
};

// فئات الصلاحيات
const PERMISSION_CATEGORIES = {
  system_view: { label: 'عرض وتحليل النظام', label_en: 'System View & Analytics', icon: Activity },
  schools: { label: 'إدارة المدارس', label_en: 'Schools Management', icon: Building2 },
  users: { label: 'إدارة المستخدمين', label_en: 'Users Management', icon: Users },
  requests: { label: 'طلبات الحسابات', label_en: 'Account Requests', icon: FileText },
  reports: { label: 'التقارير', label_en: 'Reports', icon: BarChart3 },
  ai: { label: 'الذكاء الاصطناعي', label_en: 'Artificial Intelligence', icon: Brain },
  system: { label: 'مراقبة النظام', label_en: 'System Monitoring', icon: Server },
  logs: { label: 'السجلات', label_en: 'Logs', icon: FileText },
  integrations: { label: 'التكاملات', label_en: 'Integrations', icon: Link2 },
  security: { label: 'الأمان', label_en: 'Security', icon: Shield },
  communication: { label: 'التواصل', label_en: 'Communication', icon: MessageSquare },
  settings: { label: 'الإعدادات', label_en: 'Settings', icon: Settings },
  teacher: { label: 'صلاحيات المعلم', label_en: 'Teacher Permissions', icon: GraduationCap },
  testing: { label: 'الاختبار', label_en: 'Testing', icon: Settings },
};

// توليد كلمة مرور آمنة
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// =============================================================
// مكون المعالج الرئيسي - Create User Wizard Component
// =============================================================

export default function CreateUserWizard({ open, onOpenChange, onSuccess, api, isRTL }) {
  // خطوات المعالج
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  // بيانات النموذج
  const [formData, setFormData] = useState({
    role: '',
    full_name: '',
    email: '',
    phone: '',
    country: 'SA',
    city: '',
    department: '',
    notes: '',
    is_active: true,
  });
  
  // الصلاحيات
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // كلمة المرور المؤقتة
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  
  // حالة الإرسال
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  
  // عند اختيار دور، تحميل الصلاحيات الافتراضية
  useEffect(() => {
    if (formData.role) {
      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[formData.role] || [];
      setSelectedPermissions(defaultPerms);
    }
  }, [formData.role]);
  
  // إعادة تعيين النموذج عند الفتح
  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({
        role: '',
        full_name: '',
        email: '',
        phone: '',
        country: 'SA',
        city: '',
        department: '',
        notes: '',
        is_active: true,
      });
      setSelectedPermissions([]);
      setTempPassword('');
      setCreatedUser(null);
    }
  }, [open]);
  
  // تبديل صلاحية
  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };
  
  // تبديل فئة كاملة
  const toggleCategory = (categoryId) => {
    const categoryPerms = Object.values(ALL_PERMISSIONS)
      .filter(p => p.category === categoryId)
      .map(p => p.id);
    
    const allSelected = categoryPerms.every(p => selectedPermissions.includes(p));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !categoryPerms.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPerms])]);
    }
  };
  
  // الانتقال للخطوة التالية
  const nextStep = () => {
    if (step < totalSteps) {
      if (step === 4) {
        // توليد كلمة المرور المؤقتة
        setTempPassword(generateSecurePassword());
      }
      setStep(step + 1);
    }
  };
  
  // الانتقال للخطوة السابقة
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // التحقق من صحة الخطوة
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.role !== '';
      case 2:
        return formData.full_name && formData.email;
      case 3:
        return selectedPermissions.length > 0;
      case 4:
        return tempPassword !== '';
      default:
        return true;
    }
  };
  
  // حفظ الحساب
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // محاكاة إنشاء الحساب
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: `user_${Date.now()}`,
        ...formData,
        permissions: selectedPermissions,
        temp_password: tempPassword,
        created_at: new Date().toISOString(),
      };
      
      setCreatedUser(newUser);
      setStep(5); // الانتقال لصفحة النجاح
      
      if (onSuccess) {
        onSuccess(newUser);
      }
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // نسخ بيانات الدخول
  const copyCredentials = () => {
    const text = `البريد الإلكتروني: ${formData.email}\nكلمة المرور: ${tempPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(isRTL ? 'تم نسخ بيانات الدخول' : 'Credentials copied');
  };
  
  // نسخ رسالة الترحيب
  const copyWelcomeMessage = () => {
    const loginUrl = window.location.origin + '/login';
    const message = `مرحبًا،

تم إنشاء حسابك بنجاح على منصة نَسَّق | NASSAQ.

يسعدنا انضمامك إلى فريق إدارة المنصة، وقد تم منحك الصلاحيات المناسبة لدورك داخل النظام. يمكنك الآن تسجيل الدخول إلى المنصة باستخدام بيانات الدخول التالية:

البريد الإلكتروني: ${formData.email}
كلمة المرور المؤقتة: ${tempPassword}

يرجى تسجيل الدخول عبر الرابط التالي:
${loginUrl}

عند تسجيل الدخول لأول مرة سيطلب منك النظام تغيير كلمة المرور لضمان أمان حسابك.

إذا واجهت أي مشكلة أثناء تسجيل الدخول أو احتجت إلى مساعدة، يرجى التواصل مع إدارة المنصة.

نتمنى لك تجربة موفقة داخل منصة نَسَّق، ونسعد بمساهمتك في تطوير وتشغيل النظام.

مع خالص التحية،
إدارة منصة نَسَّق | NASSAQ`;
    
    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    toast.success(isRTL ? 'تم نسخ رسالة الترحيب' : 'Welcome message copied');
  };
  
  // الحصول على معلومات الدور المختار
  const selectedRole = AVAILABLE_ROLES.find(r => r.id === formData.role);
  
  // تصنيف الصلاحيات حسب الفئة
  const groupedPermissions = Object.values(ALL_PERMISSIONS).reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});
  
  // فلترة الفئات المناسبة للدور
  const relevantCategories = Object.keys(groupedPermissions).filter(cat => {
    // للمعلم، عرض فقط الصلاحيات المتعلقة
    if (formData.role === 'teacher') {
      return ['teacher', 'communication'].includes(cat);
    }
    // لحسابات الاختبار
    if (formData.role === 'testing_account') {
      return ['testing', 'reports', 'ai'].includes(cat);
    }
    // للأدوار الأخرى، إخفاء صلاحيات المعلم والاختبار
    return !['teacher', 'testing'].includes(cat);
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-brand-navy/5 to-brand-turquoise/5">
          <DialogTitle className="font-cairo text-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            {isRTL ? 'إنشاء حساب مستخدم جديد' : 'Create New User Account'}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? 'اتبع الخطوات لإنشاء حساب إداري أو تشغيلي جديد' : 'Follow the steps to create a new admin or operational account'}
          </DialogDescription>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s === step 
                    ? 'bg-brand-navy text-white' 
                    : s < step 
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 5 && <div className={`w-8 h-1 ${s < step ? 'bg-green-500' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground px-1">
            <span className={step === 1 ? 'text-brand-navy font-medium' : ''}>{isRTL ? 'الدور' : 'Role'}</span>
            <span className={step === 2 ? 'text-brand-navy font-medium' : ''}>{isRTL ? 'البيانات' : 'Data'}</span>
            <span className={step === 3 ? 'text-brand-navy font-medium' : ''}>{isRTL ? 'الصلاحيات' : 'Permissions'}</span>
            <span className={step === 4 ? 'text-brand-navy font-medium' : ''}>{isRTL ? 'كلمة المرور' : 'Password'}</span>
            <span className={step === 5 ? 'text-brand-navy font-medium' : ''}>{isRTL ? 'تأكيد' : 'Confirm'}</span>
          </div>
        </DialogHeader>
        
        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6">
            
            {/* ====================================== */}
            {/* الخطوة 1: اختيار نوع الحساب */}
            {/* ====================================== */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-navy" />
                  {isRTL ? 'اختر نوع الحساب' : 'Select Account Type'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_ROLES.map((role) => (
                    <Card
                      key={role.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.role === role.id 
                          ? 'ring-2 ring-brand-turquoise border-brand-turquoise' 
                          : 'border-border hover:border-brand-turquoise/50'
                      }`}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      data-testid={`role-card-${role.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center flex-shrink-0`}>
                            <role.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-cairo font-bold text-sm">
                              {isRTL ? role.name : role.name_en}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {isRTL ? role.description : role.description_en}
                            </p>
                          </div>
                          {formData.role === role.id && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* ====================================== */}
            {/* الخطوة 2: البيانات الأساسية */}
            {/* ====================================== */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-navy" />
                  {isRTL ? 'البيانات الأساسية للمستخدم' : 'User Basic Information'}
                </h3>
                
                {/* الدور المختار */}
                {selectedRole && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border">
                    <div className={`w-10 h-10 rounded-xl ${selectedRole.color} flex items-center justify-center`}>
                      <selectedRole.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{isRTL ? selectedRole.name : selectedRole.name_en}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'الدور المختار' : 'Selected Role'}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الاسم الكامل */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
                    </Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
                      className="rounded-xl"
                      data-testid="user-fullname-input"
                    />
                  </div>
                  
                  {/* البريد الإلكتروني */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {isRTL ? 'البريد الإلكتروني *' : 'Email *'}
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@domain.com"
                      className="rounded-xl"
                      dir="ltr"
                      data-testid="user-email-input"
                    />
                  </div>
                  
                  {/* رقم الهاتف */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    </Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="rounded-xl"
                      dir="ltr"
                      data-testid="user-phone-input"
                    />
                  </div>
                  
                  {/* المدينة */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isRTL ? 'المدينة' : 'City'}
                    </Label>
                    <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={isRTL ? 'اختر المدينة' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</SelectItem>
                        <SelectItem value="jeddah">{isRTL ? 'جدة' : 'Jeddah'}</SelectItem>
                        <SelectItem value="dammam">{isRTL ? 'الدمام' : 'Dammam'}</SelectItem>
                        <SelectItem value="makkah">{isRTL ? 'مكة المكرمة' : 'Makkah'}</SelectItem>
                        <SelectItem value="madinah">{isRTL ? 'المدينة المنورة' : 'Madinah'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* القسم */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {isRTL ? 'القسم / الوحدة الإدارية' : 'Department'}
                    </Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder={isRTL ? 'مثال: إدارة التشغيل' : 'e.g., Operations'}
                      className="rounded-xl"
                      data-testid="user-department-input"
                    />
                  </div>
                  
                  {/* حالة الحساب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {isRTL ? 'حالة الحساب' : 'Account Status'}
                    </Label>
                    <Select 
                      value={formData.is_active ? 'active' : 'inactive'} 
                      onValueChange={(v) => setFormData({ ...formData, is_active: v === 'active' })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {isRTL ? 'نشط' : 'Active'}
                          </span>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            {isRTL ? 'غير نشط' : 'Inactive'}
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* ملاحظات */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {isRTL ? 'ملاحظات إدارية' : 'Admin Notes'}
                  </Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                    className="rounded-xl resize-none"
                    rows={3}
                    data-testid="user-notes-input"
                  />
                </div>
              </div>
            )}
            
            {/* ====================================== */}
            {/* الخطوة 3: تحديد الصلاحيات */}
            {/* ====================================== */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cairo font-bold text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-navy" />
                    {isRTL ? 'تحديد الصلاحيات' : 'Configure Permissions'}
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    {selectedPermissions.length} {isRTL ? 'صلاحية محددة' : 'permissions selected'}
                  </Badge>
                </div>
                
                {/* شرح */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">
                      {isRTL ? 'الصلاحيات الافتراضية' : 'Default Permissions'}
                    </p>
                    <p className="text-blue-600">
                      {isRTL 
                        ? 'تم تحميل الصلاحيات الافتراضية للدور المختار. يمكنك إضافة أو إزالة الصلاحيات حسب الحاجة.'
                        : 'Default permissions for the selected role have been loaded. You can add or remove permissions as needed.'}
                    </p>
                  </div>
                </div>
                
                {/* قائمة الصلاحيات حسب الفئة */}
                <div className="space-y-4">
                  {relevantCategories.map((categoryId) => {
                    const category = PERMISSION_CATEGORIES[categoryId];
                    const perms = groupedPermissions[categoryId] || [];
                    const selectedInCategory = perms.filter(p => selectedPermissions.includes(p.id));
                    const allSelected = perms.every(p => selectedPermissions.includes(p.id));
                    const isExpanded = expandedCategories[categoryId] !== false;
                    
                    return (
                      <Card key={categoryId} className="border-border">
                        <CardHeader 
                          className="p-3 cursor-pointer"
                          onClick={() => setExpandedCategories(prev => ({
                            ...prev,
                            [categoryId]: !isExpanded
                          }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-navy/10 flex items-center justify-center">
                                <category.icon className="h-4 w-4 text-brand-navy" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{isRTL ? category.label : category.label_en}</p>
                                <p className="text-xs text-muted-foreground">
                                  {selectedInCategory.length} / {perms.length} {isRTL ? 'محددة' : 'selected'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCategory(categoryId);
                                }}
                              >
                                {allSelected ? (isRTL ? 'إلغاء الكل' : 'Deselect All') : (isRTL ? 'تحديد الكل' : 'Select All')}
                              </Button>
                              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent className="px-3 pb-3 pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {perms.map((perm) => {
                                const isSelected = selectedPermissions.includes(perm.id);
                                return (
                                  <div
                                    key={perm.id}
                                    onClick={() => togglePermission(perm.id)}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                                      isSelected 
                                        ? 'bg-green-50 border-green-300' 
                                        : 'bg-muted/30 border-transparent hover:border-muted-foreground/30'
                                    } ${perm.dangerous ? 'border-red-200' : ''}`}
                                    data-testid={`permission-${perm.id}`}
                                  >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                      isSelected ? 'bg-green-500' : 'bg-muted'
                                    }`}>
                                      {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <perm.icon className={`h-4 w-4 flex-shrink-0 ${
                                      perm.dangerous ? 'text-red-500' : 'text-muted-foreground'
                                    }`} />
                                    <span className={`text-xs flex-1 ${perm.dangerous ? 'text-red-600' : ''}`}>
                                      {isRTL ? perm.name : perm.name_en}
                                    </span>
                                    {perm.dangerous && (
                                      <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* ====================================== */}
            {/* الخطوة 4: كلمة المرور المؤقتة */}
            {/* ====================================== */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="font-cairo font-bold text-lg mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-brand-navy" />
                  {isRTL ? 'كلمة المرور المؤقتة' : 'Temporary Password'}
                </h3>
                
                {/* ملخص المستخدم */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {selectedRole && (
                        <div className={`w-12 h-12 rounded-xl ${selectedRole.color} flex items-center justify-center`}>
                          <selectedRole.icon className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{formData.full_name}</p>
                        <p className="text-sm text-muted-foreground">{formData.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedRole && (isRTL ? selectedRole.name : selectedRole.name_en)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* كلمة المرور */}
                <div className="space-y-3">
                  <Label>{isRTL ? 'كلمة المرور المؤقتة' : 'Temporary Password'}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={tempPassword}
                        readOnly
                        className="rounded-xl pe-10 font-mono text-lg"
                        dir="ltr"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setTempPassword(generateSecurePassword())}
                      className="rounded-xl"
                    >
                      <Settings className="h-4 w-4 me-2" />
                      {isRTL ? 'توليد جديدة' : 'Regenerate'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'سيُطلب من المستخدم تغيير كلمة المرور عند تسجيل الدخول لأول مرة'
                      : 'User will be required to change password on first login'}
                  </p>
                </div>
                
                {/* عدد الصلاحيات */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        {selectedPermissions.length} {isRTL ? 'صلاحية' : 'permissions'}
                      </p>
                      <p className="text-sm text-green-600">
                        {isRTL ? 'سيتم منحها للمستخدم' : 'will be granted to the user'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ====================================== */}
            {/* الخطوة 5: التأكيد والنجاح */}
            {/* ====================================== */}
            {step === 5 && createdUser && (
              <div className="space-y-6 text-center">
                {/* أيقونة النجاح */}
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="font-cairo font-bold text-xl text-green-700">
                    {isRTL ? 'تم إنشاء الحساب بنجاح!' : 'Account Created Successfully!'}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {isRTL 
                      ? 'يمكنك الآن إرسال بيانات الدخول للمستخدم'
                      : 'You can now send login credentials to the user'}
                  </p>
                </div>
                
                {/* بيانات الدخول */}
                <Card className="text-start">
                  <CardHeader>
                    <CardTitle className="font-cairo text-base flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {isRTL ? 'بيانات تسجيل الدخول' : 'Login Credentials'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                        <p className="font-mono text-sm">{formData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'كلمة المرور المؤقتة' : 'Temp Password'}</p>
                        <p className="font-mono text-sm">{showPassword ? tempPassword : '••••••••••••'}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={copyCredentials} variant="outline" className="flex-1 rounded-xl">
                        {copied ? <Check className="h-4 w-4 me-2" /> : <Copy className="h-4 w-4 me-2" />}
                        {isRTL ? 'نسخ البيانات' : 'Copy Credentials'}
                      </Button>
                      <Button onClick={copyWelcomeMessage} className="flex-1 bg-brand-navy rounded-xl">
                        {copiedMessage ? <Check className="h-4 w-4 me-2" /> : <Send className="h-4 w-4 me-2" />}
                        {isRTL ? 'نسخ رسالة الترحيب' : 'Copy Welcome Message'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <div className="flex justify-between w-full">
            {step > 1 && step < 5 ? (
              <Button variant="outline" onClick={prevStep} className="rounded-xl">
                <ChevronRight className="h-4 w-4 me-2 rtl:rotate-180" />
                {isRTL ? 'السابق' : 'Previous'}
              </Button>
            ) : (
              <div />
            )}
            
            {step < 4 && (
              <Button 
                onClick={nextStep} 
                disabled={!isStepValid()}
                className="bg-brand-navy rounded-xl"
              >
                {isRTL ? 'التالي' : 'Next'}
                <ChevronLeft className="h-4 w-4 ms-2 rtl:rotate-180" />
              </Button>
            )}
            
            {step === 4 && (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Settings className="h-4 w-4 me-2 animate-spin" />
                    {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 me-2" />
                    {isRTL ? 'إنشاء الحساب' : 'Create Account'}
                  </>
                )}
              </Button>
            )}
            
            {step === 5 && (
              <Button 
                onClick={() => onOpenChange(false)}
                className="bg-brand-navy rounded-xl"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
