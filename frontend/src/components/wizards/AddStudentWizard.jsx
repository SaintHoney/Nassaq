import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  QrCode,
  Calendar,
  Users,
  Heart,
  IdCard,
  GraduationCap,
  Home,
  Sparkles,
  Save,
  X,
  FileText,
  UserPlus,
  Shield,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ==================== Step Components ====================

// Step 1: Basic Student Information
const Step1BasicInfo = ({ data, onChange, errors, options, isRTL, onValidateNationalId }) => {
  const [validatingId, setValidatingId] = useState(false);
  const [idValidation, setIdValidation] = useState(null);

  const handleNationalIdBlur = async () => {
    if (data.national_id && data.national_id.length === 10) {
      setValidatingId(true);
      const result = await onValidateNationalId(data.national_id);
      setIdValidation(result);
      setValidatingId(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">
          {isRTL ? 'البيانات الأساسية للطالب' : 'Basic Student Information'}
        </h3>
        <p className="text-muted-foreground font-tajawal mt-1">
          {isRTL ? 'أدخل المعلومات الأساسية للطالب' : 'Enter the student basic information'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name Arabic */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'} <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.full_name_ar || ''}
            onChange={(e) => onChange('full_name_ar', e.target.value)}
            placeholder={isRTL ? 'الاسم الكامل بالعربية' : 'Full name in Arabic'}
            className={errors.full_name_ar ? 'border-red-500' : ''}
            data-testid="student-name-ar"
          />
          {errors.full_name_ar && (
            <p className="text-red-500 text-sm">{errors.full_name_ar}</p>
          )}
        </div>

        {/* Full Name English */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}
          </Label>
          <Input
            value={data.full_name_en || ''}
            onChange={(e) => onChange('full_name_en', e.target.value)}
            placeholder={isRTL ? 'الاسم الكامل بالإنجليزية' : 'Full name in English'}
            dir="ltr"
            data-testid="student-name-en"
          />
        </div>

        {/* National ID */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'رقم الهوية' : 'National ID'} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              value={data.national_id || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange('national_id', val);
                setIdValidation(null);
              }}
              onBlur={handleNationalIdBlur}
              placeholder="1234567890"
              className={`${errors.national_id ? 'border-red-500' : ''} ${idValidation?.valid === false ? 'border-red-500' : idValidation?.valid === true ? 'border-green-500' : ''}`}
              maxLength={10}
              dir="ltr"
              data-testid="student-national-id"
            />
            {validatingId && (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {idValidation?.valid === true && (
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
            {idValidation?.valid === false && (
              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
          {errors.national_id && (
            <p className="text-red-500 text-sm">{errors.national_id}</p>
          )}
          {idValidation?.valid === false && (
            <p className="text-red-500 text-sm">{isRTL ? idValidation.message : idValidation.message_en}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={data.date_of_birth || ''}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
            className={errors.date_of_birth ? 'border-red-500' : ''}
            data-testid="student-dob"
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-sm">{errors.date_of_birth}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'الجنس' : 'Gender'} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.gender || ''}
            onValueChange={(val) => onChange('gender', val)}
          >
            <SelectTrigger className={errors.gender ? 'border-red-500' : ''} data-testid="student-gender">
              <SelectValue placeholder={isRTL ? 'اختر الجنس' : 'Select gender'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{isRTL ? 'ذكر' : 'Male'}</SelectItem>
              <SelectItem value="female">{isRTL ? 'أنثى' : 'Female'}</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender}</p>
          )}
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'الجنسية' : 'Nationality'} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.nationality || 'SA'}
            onValueChange={(val) => onChange('nationality', val)}
          >
            <SelectTrigger data-testid="student-nationality">
              <SelectValue placeholder={isRTL ? 'اختر الجنسية' : 'Select nationality'} />
            </SelectTrigger>
            <SelectContent>
              {options.nationalities?.map((nat) => (
                <SelectItem key={nat.code} value={nat.code}>
                  {isRTL ? nat.name_ar : nat.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'الصف الدراسي' : 'Grade'} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.grade_id || ''}
            onValueChange={(val) => onChange('grade_id', val)}
          >
            <SelectTrigger className={errors.grade_id ? 'border-red-500' : ''} data-testid="student-grade">
              <SelectValue placeholder={isRTL ? 'اختر الصف' : 'Select grade'} />
            </SelectTrigger>
            <SelectContent>
              {options.grades?.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {isRTL ? grade.name_ar : grade.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grade_id && (
            <p className="text-red-500 text-sm">{errors.grade_id}</p>
          )}
        </div>

        {/* Section */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'الشعبة' : 'Section'} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.section_id || ''}
            onValueChange={(val) => onChange('section_id', val)}
          >
            <SelectTrigger className={errors.section_id ? 'border-red-500' : ''} data-testid="student-section">
              <SelectValue placeholder={isRTL ? 'اختر الشعبة' : 'Select section'} />
            </SelectTrigger>
            <SelectContent>
              {options.sections?.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {isRTL ? section.name_ar : section.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.section_id && (
            <p className="text-red-500 text-sm">{errors.section_id}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 2: Parent/Guardian Information
const Step2ParentInfo = ({ data, onChange, errors, options, isRTL, onValidatePhone }) => {
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState(null);

  const handlePhoneBlur = async () => {
    if (data.parent_phone && data.parent_phone.length >= 9) {
      setValidatingPhone(true);
      const result = await onValidatePhone(data.parent_phone);
      setPhoneValidation(result);
      setValidatingPhone(false);
      
      // Auto-fill parent info if found
      if (result?.exists) {
        onChange('existing_parent_id', result.parent_id);
        if (result.parent_name_ar) {
          onChange('parent_name_ar', result.parent_name_ar);
        }
        if (result.parent_name_en) {
          onChange('parent_name_en', result.parent_name_en);
        }
        toast.success(isRTL ? 'تم العثور على ولي الأمر في النظام' : 'Parent found in system');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">
          {isRTL ? 'بيانات ولي الأمر' : 'Parent/Guardian Information'}
        </h3>
        <p className="text-muted-foreground font-tajawal mt-1">
          {isRTL ? 'أدخل بيانات ولي الأمر أو وصي الطالب' : 'Enter parent or guardian information'}
        </p>
      </div>

      {phoneValidation?.exists && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 font-tajawal">
                {isRTL ? 'تم العثور على ولي الأمر' : 'Parent Found'}
              </p>
              <p className="text-sm text-green-600 font-tajawal">
                {isRTL ? 'سيتم ربط الطالب بحساب ولي الأمر الموجود' : 'Student will be linked to existing parent account'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Phone - First for quick lookup */}
        <div className="space-y-2 md:col-span-2">
          <Label className="font-tajawal">
            {isRTL ? 'رقم جوال ولي الأمر' : 'Parent Phone'} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              value={data.parent_phone || ''}
              onChange={(e) => {
                onChange('parent_phone', e.target.value);
                setPhoneValidation(null);
                onChange('existing_parent_id', null);
              }}
              onBlur={handlePhoneBlur}
              placeholder="05xxxxxxxx"
              className={`${errors.parent_phone ? 'border-red-500' : ''} ${phoneValidation?.exists ? 'border-green-500' : ''}`}
              dir="ltr"
              data-testid="parent-phone"
            />
            {validatingPhone && (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {phoneValidation?.exists && (
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.parent_phone && (
            <p className="text-red-500 text-sm">{errors.parent_phone}</p>
          )}
        </div>

        {/* Parent Name Arabic */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'اسم ولي الأمر (عربي)' : 'Parent Name (Arabic)'} <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.parent_name_ar || ''}
            onChange={(e) => onChange('parent_name_ar', e.target.value)}
            placeholder={isRTL ? 'الاسم بالعربية' : 'Name in Arabic'}
            className={errors.parent_name_ar ? 'border-red-500' : ''}
            disabled={phoneValidation?.exists}
            data-testid="parent-name-ar"
          />
          {errors.parent_name_ar && (
            <p className="text-red-500 text-sm">{errors.parent_name_ar}</p>
          )}
        </div>

        {/* Parent Name English */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'اسم ولي الأمر (إنجليزي)' : 'Parent Name (English)'}
          </Label>
          <Input
            value={data.parent_name_en || ''}
            onChange={(e) => onChange('parent_name_en', e.target.value)}
            placeholder={isRTL ? 'الاسم بالإنجليزية' : 'Name in English'}
            dir="ltr"
            disabled={phoneValidation?.exists}
            data-testid="parent-name-en"
          />
        </div>

        {/* Parent National ID */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'رقم هوية ولي الأمر' : 'Parent National ID'}
          </Label>
          <Input
            value={data.parent_national_id || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              onChange('parent_national_id', val);
            }}
            placeholder="1234567890"
            maxLength={10}
            dir="ltr"
            disabled={phoneValidation?.exists}
            data-testid="parent-national-id"
          />
        </div>

        {/* Parent Relation */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'صلة القرابة' : 'Relation'} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.parent_relation || ''}
            onValueChange={(val) => onChange('parent_relation', val)}
          >
            <SelectTrigger className={errors.parent_relation ? 'border-red-500' : ''} data-testid="parent-relation">
              <SelectValue placeholder={isRTL ? 'اختر صلة القرابة' : 'Select relation'} />
            </SelectTrigger>
            <SelectContent>
              {options.relations?.map((rel) => (
                <SelectItem key={rel.code} value={rel.code}>
                  {isRTL ? rel.name_ar : rel.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parent_relation && (
            <p className="text-red-500 text-sm">{errors.parent_relation}</p>
          )}
        </div>

        {/* Parent Email */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'البريد الإلكتروني' : 'Email'}
          </Label>
          <Input
            type="email"
            value={data.parent_email || ''}
            onChange={(e) => onChange('parent_email', e.target.value)}
            placeholder="email@example.com"
            dir="ltr"
            disabled={phoneValidation?.exists}
            data-testid="parent-email"
          />
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label className="font-tajawal">
            {isRTL ? 'العنوان' : 'Address'}
          </Label>
          <Textarea
            value={data.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder={isRTL ? 'عنوان السكن' : 'Home address'}
            rows={2}
            data-testid="parent-address"
          />
        </div>

        {/* Emergency Contact */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'جهة اتصال طوارئ (اختياري)' : 'Emergency Contact (Optional)'}
          </Label>
          <Input
            value={data.emergency_contact || ''}
            onChange={(e) => onChange('emergency_contact', e.target.value)}
            placeholder={isRTL ? 'اسم جهة الطوارئ' : 'Emergency contact name'}
            data-testid="emergency-contact"
          />
        </div>

        {/* Emergency Phone */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'رقم طوارئ (اختياري)' : 'Emergency Phone (Optional)'}
          </Label>
          <Input
            value={data.emergency_phone || ''}
            onChange={(e) => onChange('emergency_phone', e.target.value)}
            placeholder="05xxxxxxxx"
            dir="ltr"
            data-testid="emergency-phone"
          />
        </div>
      </div>
    </div>
  );
};

// Step 3: Health Information
const Step3HealthInfo = ({ data, onChange, options, isRTL }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">
          {isRTL ? 'المعلومات الصحية' : 'Health Information'}
        </h3>
        <p className="text-muted-foreground font-tajawal mt-1">
          {isRTL ? 'أدخل المعلومات الصحية للطالب (اختياري)' : 'Enter student health information (optional)'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Type */}
        <div className="space-y-2">
          <Label className="font-tajawal">
            {isRTL ? 'فصيلة الدم' : 'Blood Type'}
          </Label>
          <Select
            value={data.blood_type || ''}
            onValueChange={(val) => onChange('blood_type', val)}
          >
            <SelectTrigger data-testid="health-blood-type">
              <SelectValue placeholder={isRTL ? 'اختر فصيلة الدم' : 'Select blood type'} />
            </SelectTrigger>
            <SelectContent>
              {options.bloodTypes?.map((type) => (
                <SelectItem key={type.code} value={type.code}>
                  {isRTL ? type.name_ar : type.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spacer */}
        <div />

        {/* Chronic Conditions */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="has_chronic"
              checked={data.has_chronic_conditions || false}
              onCheckedChange={(checked) => onChange('has_chronic_conditions', checked)}
              data-testid="health-chronic-checkbox"
            />
            <Label htmlFor="has_chronic" className="font-tajawal cursor-pointer">
              {isRTL ? 'يعاني من أمراض مزمنة' : 'Has chronic conditions'}
            </Label>
          </div>
          {data.has_chronic_conditions && (
            <Textarea
              value={data.chronic_conditions || ''}
              onChange={(e) => onChange('chronic_conditions', e.target.value)}
              placeholder={isRTL ? 'اذكر الأمراض المزمنة...' : 'List chronic conditions...'}
              rows={2}
              data-testid="health-chronic-details"
            />
          )}
        </div>

        {/* Allergies */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="has_allergies"
              checked={data.has_allergies || false}
              onCheckedChange={(checked) => onChange('has_allergies', checked)}
              data-testid="health-allergies-checkbox"
            />
            <Label htmlFor="has_allergies" className="font-tajawal cursor-pointer">
              {isRTL ? 'يعاني من حساسية' : 'Has allergies'}
            </Label>
          </div>
          {data.has_allergies && (
            <Textarea
              value={data.allergies || ''}
              onChange={(e) => onChange('allergies', e.target.value)}
              placeholder={isRTL ? 'اذكر أنواع الحساسية...' : 'List allergies...'}
              rows={2}
              data-testid="health-allergies-details"
            />
          )}
        </div>

        {/* Disabilities */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="has_disabilities"
              checked={data.has_disabilities || false}
              onCheckedChange={(checked) => onChange('has_disabilities', checked)}
              data-testid="health-disabilities-checkbox"
            />
            <Label htmlFor="has_disabilities" className="font-tajawal cursor-pointer">
              {isRTL ? 'يعاني من إعاقة' : 'Has disabilities'}
            </Label>
          </div>
          {data.has_disabilities && (
            <Textarea
              value={data.disabilities || ''}
              onChange={(e) => onChange('disabilities', e.target.value)}
              placeholder={isRTL ? 'اذكر نوع الإعاقة...' : 'Describe disability...'}
              rows={2}
              data-testid="health-disabilities-details"
            />
          )}
        </div>

        {/* Current Medications */}
        <div className="space-y-2 md:col-span-2">
          <Label className="font-tajawal">
            {isRTL ? 'الأدوية الحالية' : 'Current Medications'}
          </Label>
          <Textarea
            value={data.current_medications || ''}
            onChange={(e) => onChange('current_medications', e.target.value)}
            placeholder={isRTL ? 'اذكر الأدوية التي يتناولها الطالب حالياً...' : 'List current medications...'}
            rows={2}
            data-testid="health-medications"
          />
        </div>

        {/* Special Care */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="requires_special_care"
              checked={data.requires_special_care || false}
              onCheckedChange={(checked) => onChange('requires_special_care', checked)}
              data-testid="health-special-care-checkbox"
            />
            <Label htmlFor="requires_special_care" className="font-tajawal cursor-pointer">
              {isRTL ? 'يحتاج رعاية خاصة' : 'Requires special care'}
            </Label>
          </div>
          {data.requires_special_care && (
            <Textarea
              value={data.special_care_notes || ''}
              onChange={(e) => onChange('special_care_notes', e.target.value)}
              placeholder={isRTL ? 'اذكر متطلبات الرعاية الخاصة...' : 'Describe special care requirements...'}
              rows={2}
              data-testid="health-special-care-details"
            />
          )}
        </div>

        {/* Emergency Medical Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label className="font-tajawal">
            {isRTL ? 'ملاحظات طبية للطوارئ' : 'Emergency Medical Notes'}
          </Label>
          <Textarea
            value={data.emergency_medical_notes || ''}
            onChange={(e) => onChange('emergency_medical_notes', e.target.value)}
            placeholder={isRTL ? 'أي معلومات طبية مهمة يجب معرفتها في حالات الطوارئ...' : 'Any important medical information for emergencies...'}
            rows={2}
            data-testid="health-emergency-notes"
          />
        </div>
      </div>
    </div>
  );
};

// Step 4: Review & Confirm
const Step4Review = ({ basicData, parentData, healthData, options, isRTL }) => {
  const getGradeName = (id) => {
    const grade = options.grades?.find(g => g.id === id);
    return grade ? (isRTL ? grade.name_ar : grade.name_en) : id;
  };

  const getSectionName = (id) => {
    const section = options.sections?.find(s => s.id === id);
    return section ? (isRTL ? section.name_ar : section.name_en) : id;
  };

  const getNationalityName = (code) => {
    const nat = options.nationalities?.find(n => n.code === code);
    return nat ? (isRTL ? nat.name_ar : nat.name_en) : code;
  };

  const getRelationName = (code) => {
    const rel = options.relations?.find(r => r.code === code);
    return rel ? (isRTL ? rel.name_ar : rel.name_en) : code;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold font-cairo">
          {isRTL ? 'مراجعة البيانات' : 'Review Information'}
        </h3>
        <p className="text-muted-foreground font-tajawal mt-1">
          {isRTL ? 'راجع البيانات قبل الحفظ' : 'Review information before saving'}
        </p>
      </div>

      {/* Basic Info Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-cairo">
            <User className="h-5 w-5 text-blue-600" />
            {isRTL ? 'بيانات الطالب' : 'Student Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</p>
              <p className="font-medium">{basicData.full_name_ar}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</p>
              <p className="font-medium">{basicData.full_name_en || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'رقم الهوية' : 'National ID'}</p>
              <p className="font-medium" dir="ltr">{basicData.national_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</p>
              <p className="font-medium">{basicData.date_of_birth}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الجنس' : 'Gender'}</p>
              <p className="font-medium">{basicData.gender === 'male' ? (isRTL ? 'ذكر' : 'Male') : (isRTL ? 'أنثى' : 'Female')}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الجنسية' : 'Nationality'}</p>
              <p className="font-medium">{getNationalityName(basicData.nationality)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الصف' : 'Grade'}</p>
              <p className="font-medium">{getGradeName(basicData.grade_id)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الشعبة' : 'Section'}</p>
              <p className="font-medium">{getSectionName(basicData.section_id)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Info Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-cairo">
            <Users className="h-5 w-5 text-green-600" />
            {isRTL ? 'بيانات ولي الأمر' : 'Parent Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'الاسم' : 'Name'}</p>
              <p className="font-medium">{parentData.parent_name_ar}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'رقم الجوال' : 'Phone'}</p>
              <p className="font-medium" dir="ltr">{parentData.parent_phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-tajawal">{isRTL ? 'صلة القرابة' : 'Relation'}</p>
              <p className="font-medium">{getRelationName(parentData.parent_relation)}</p>
            </div>
            {parentData.parent_email && (
              <div>
                <p className="text-muted-foreground font-tajawal">{isRTL ? 'البريد' : 'Email'}</p>
                <p className="font-medium" dir="ltr">{parentData.parent_email}</p>
              </div>
            )}
            {parentData.address && (
              <div className="col-span-2">
                <p className="text-muted-foreground font-tajawal">{isRTL ? 'العنوان' : 'Address'}</p>
                <p className="font-medium">{parentData.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Health Info Summary (if any) */}
      {healthData && (healthData.blood_type || healthData.has_chronic_conditions || healthData.has_allergies || healthData.has_disabilities) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-cairo">
              <Heart className="h-5 w-5 text-red-600" />
              {isRTL ? 'المعلومات الصحية' : 'Health Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {healthData.blood_type && (
                <div>
                  <p className="text-muted-foreground font-tajawal">{isRTL ? 'فصيلة الدم' : 'Blood Type'}</p>
                  <p className="font-medium">{healthData.blood_type}</p>
                </div>
              )}
              {healthData.has_chronic_conditions && (
                <div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {isRTL ? 'أمراض مزمنة' : 'Chronic Conditions'}
                  </Badge>
                  <p className="mt-1">{healthData.chronic_conditions}</p>
                </div>
              )}
              {healthData.has_allergies && (
                <div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {isRTL ? 'حساسية' : 'Allergies'}
                  </Badge>
                  <p className="mt-1">{healthData.allergies}</p>
                </div>
              )}
              {healthData.has_disabilities && (
                <div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {isRTL ? 'إعاقة' : 'Disabilities'}
                  </Badge>
                  <p className="mt-1">{healthData.disabilities}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Success Step
const SuccessStep = ({ result, isRTL, onClose, onAddAnother }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? 'تم النسخ' : 'Copied!');
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold font-cairo text-green-700">
          {isRTL ? 'تم إضافة الطالب بنجاح!' : 'Student Added Successfully!'}
        </h3>
        <p className="text-muted-foreground font-tajawal mt-2">
          {isRTL ? 'تم تسجيل الطالب في النظام' : 'Student has been registered in the system'}
        </p>
      </div>

      {/* Student ID Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-blue-600 font-tajawal">
                {isRTL ? 'رقم الطالب' : 'Student ID'}
              </p>
              <p className="text-xl font-bold font-mono text-blue-800">
                {result.student_id}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => copyToClipboard(result.student_id)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* QR Code */}
          {result.qr_code && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <img 
                  src={`data:image/png;base64,${result.qr_code}`} 
                  alt="Student QR Code"
                  className="w-32 h-32"
                />
              </div>
            </div>
          )}

          {/* Login Credentials */}
          {result.user_account?.created && (
            <div className="space-y-2 text-start mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-medium text-blue-800 font-tajawal">
                {isRTL ? 'بيانات الدخول' : 'Login Credentials'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'اسم المستخدم:' : 'Username:'}</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{result.user_account.username}</code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(result.user_account.username)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'كلمة المرور:' : 'Password:'}</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{result.user_account.temp_password}</code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(result.user_account.temp_password)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Parent Info */}
          {result.is_new_parent && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-start">
              <p className="text-sm font-medium text-green-800 font-tajawal flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {isRTL ? 'تم إنشاء حساب ولي أمر جديد' : 'New parent account created'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {isRTL ? `رقم ولي الأمر: ${result.parent_id}` : `Parent ID: ${result.parent_id}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onClose}>
          {isRTL ? 'إغلاق' : 'Close'}
        </Button>
        <Button onClick={onAddAnother} className="bg-brand-turquoise hover:bg-brand-turquoise/90">
          <UserPlus className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة طالب آخر' : 'Add Another Student'}
        </Button>
      </div>
    </div>
  );
};

// ==================== Main Wizard Component ====================

export const AddStudentWizard = ({ open, onClose }) => {
  const { isRTL } = useTheme();
  const { token } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  // Form data
  const [basicData, setBasicData] = useState({
    nationality: 'SA',
  });
  const [parentData, setParentData] = useState({});
  const [healthData, setHealthData] = useState({});

  // Options
  const [options, setOptions] = useState({
    grades: [],
    sections: [],
    nationalities: [],
    bloodTypes: [],
    relations: [],
  });

  // Fetch options on mount
  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [gradesRes, sectionsRes, nationalitiesRes, bloodTypesRes, relationsRes] = await Promise.all([
        axios.get(`${API_URL}/api/students/options/grades`, { headers }).catch(() => ({ data: { grades: [] } })),
        axios.get(`${API_URL}/api/students/options/sections`, { headers }).catch(() => ({ data: { sections: [] } })),
        axios.get(`${API_URL}/api/students/options/nationalities`, { headers }).catch(() => ({ data: { nationalities: [] } })),
        axios.get(`${API_URL}/api/students/options/blood-types`, { headers }).catch(() => ({ data: { blood_types: [] } })),
        axios.get(`${API_URL}/api/students/options/parent-relations`, { headers }).catch(() => ({ data: { relations: [] } })),
      ]);

      setOptions({
        grades: gradesRes.data.grades || [
          { id: 'grade_1', name_ar: 'الصف الأول', name_en: 'Grade 1' },
          { id: 'grade_2', name_ar: 'الصف الثاني', name_en: 'Grade 2' },
          { id: 'grade_3', name_ar: 'الصف الثالث', name_en: 'Grade 3' },
          { id: 'grade_4', name_ar: 'الصف الرابع', name_en: 'Grade 4' },
          { id: 'grade_5', name_ar: 'الصف الخامس', name_en: 'Grade 5' },
          { id: 'grade_6', name_ar: 'الصف السادس', name_en: 'Grade 6' },
        ],
        sections: sectionsRes.data.sections || [
          { id: 'section_a', name_ar: 'أ', name_en: 'A' },
          { id: 'section_b', name_ar: 'ب', name_en: 'B' },
          { id: 'section_c', name_ar: 'ج', name_en: 'C' },
        ],
        nationalities: nationalitiesRes.data.nationalities || [
          { code: 'SA', name_ar: 'سعودي', name_en: 'Saudi' },
          { code: 'EG', name_ar: 'مصري', name_en: 'Egyptian' },
          { code: 'JO', name_ar: 'أردني', name_en: 'Jordanian' },
        ],
        bloodTypes: bloodTypesRes.data.blood_types || [
          { code: 'A+', name_ar: 'A موجب', name_en: 'A+' },
          { code: 'A-', name_ar: 'A سالب', name_en: 'A-' },
          { code: 'B+', name_ar: 'B موجب', name_en: 'B+' },
          { code: 'B-', name_ar: 'B سالب', name_en: 'B-' },
          { code: 'AB+', name_ar: 'AB موجب', name_en: 'AB+' },
          { code: 'AB-', name_ar: 'AB سالب', name_en: 'AB-' },
          { code: 'O+', name_ar: 'O موجب', name_en: 'O+' },
          { code: 'O-', name_ar: 'O سالب', name_en: 'O-' },
        ],
        relations: relationsRes.data.relations || [
          { code: 'father', name_ar: 'الأب', name_en: 'Father' },
          { code: 'mother', name_ar: 'الأم', name_en: 'Mother' },
          { code: 'guardian', name_ar: 'ولي الأمر', name_en: 'Guardian' },
        ],
      });
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!basicData.full_name_ar?.trim()) {
      newErrors.full_name_ar = isRTL ? 'الاسم مطلوب' : 'Name is required';
    }
    if (!basicData.national_id || basicData.national_id.length !== 10) {
      newErrors.national_id = isRTL ? 'رقم الهوية يجب أن يكون 10 أرقام' : 'National ID must be 10 digits';
    }
    if (!basicData.date_of_birth) {
      newErrors.date_of_birth = isRTL ? 'تاريخ الميلاد مطلوب' : 'Date of birth is required';
    }
    if (!basicData.gender) {
      newErrors.gender = isRTL ? 'الجنس مطلوب' : 'Gender is required';
    }
    if (!basicData.grade_id) {
      newErrors.grade_id = isRTL ? 'الصف مطلوب' : 'Grade is required';
    }
    if (!basicData.section_id) {
      newErrors.section_id = isRTL ? 'الشعبة مطلوبة' : 'Section is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!parentData.parent_phone?.trim()) {
      newErrors.parent_phone = isRTL ? 'رقم الجوال مطلوب' : 'Phone is required';
    }
    if (!parentData.parent_name_ar?.trim()) {
      newErrors.parent_name_ar = isRTL ? 'اسم ولي الأمر مطلوب' : 'Parent name is required';
    }
    if (!parentData.parent_relation) {
      newErrors.parent_relation = isRTL ? 'صلة القرابة مطلوبة' : 'Relation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate national ID
  const handleValidateNationalId = async (nationalId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${API_URL}/api/students/validate/national-id`,
        { national_id: nationalId },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating national ID:', error);
      return { valid: true }; // Allow to proceed if validation fails
    }
  };

  // Validate parent phone
  const handleValidatePhone = async (phone) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${API_URL}/api/students/validate/parent-phone`,
        { phone },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating phone:', error);
      return { exists: false };
    }
  };

  // Navigation
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const payload = {
        basic_info: {
          full_name_ar: basicData.full_name_ar,
          full_name_en: basicData.full_name_en || null,
          national_id: basicData.national_id,
          date_of_birth: basicData.date_of_birth,
          gender: basicData.gender,
          nationality: basicData.nationality || 'SA',
          grade_id: basicData.grade_id,
          section_id: basicData.section_id,
        },
        parent_info: {
          parent_name_ar: parentData.parent_name_ar,
          parent_name_en: parentData.parent_name_en || null,
          parent_national_id: parentData.parent_national_id || null,
          parent_phone: parentData.parent_phone,
          parent_email: parentData.parent_email || null,
          parent_relation: parentData.parent_relation,
          emergency_contact: parentData.emergency_contact || null,
          emergency_phone: parentData.emergency_phone || null,
          address: parentData.address || null,
        },
        health_info: healthData.blood_type || healthData.has_chronic_conditions || healthData.has_allergies ? {
          blood_type: healthData.blood_type || null,
          has_chronic_conditions: healthData.has_chronic_conditions || false,
          chronic_conditions: healthData.chronic_conditions || null,
          has_allergies: healthData.has_allergies || false,
          allergies: healthData.allergies || null,
          has_disabilities: healthData.has_disabilities || false,
          disabilities: healthData.disabilities || null,
          current_medications: healthData.current_medications || null,
          requires_special_care: healthData.requires_special_care || false,
          special_care_notes: healthData.special_care_notes || null,
          emergency_medical_notes: healthData.emergency_medical_notes || null,
        } : null,
      };

      const response = await axios.post(
        `${API_URL}/api/students/create`,
        payload,
        { headers }
      );

      if (response.data.success) {
        setResult(response.data);
        setCurrentStep(5);
        toast.success(isRTL ? 'تم إضافة الطالب بنجاح' : 'Student added successfully');
      } else {
        toast.error(response.data.error || (isRTL ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'حدث خطأ أثناء إضافة الطالب' : 'Error adding student'));
    } finally {
      setSubmitting(false);
    }
  };

  // Reset wizard
  const handleReset = () => {
    setCurrentStep(1);
    setBasicData({ nationality: 'SA' });
    setParentData({});
    setHealthData({});
    setErrors({});
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Step titles
  const steps = [
    { num: 1, title: isRTL ? 'البيانات الأساسية' : 'Basic Info', icon: User },
    { num: 2, title: isRTL ? 'ولي الأمر' : 'Parent', icon: Users },
    { num: 3, title: isRTL ? 'الصحة' : 'Health', icon: Heart },
    { num: 4, title: isRTL ? 'المراجعة' : 'Review', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="add-student-wizard">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-cairo text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            {isRTL ? 'إضافة طالب جديد' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription className="font-tajawal">
            {isRTL ? 'أدخل بيانات الطالب وولي الأمر' : 'Enter student and parent information'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        {currentStep < 5 && (
          <div className="flex items-center justify-center gap-2 my-4">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  currentStep === step.num 
                    ? 'bg-brand-turquoise text-white' 
                    : currentStep > step.num 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.num ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-tajawal hidden sm:inline">{step.title}</span>
                  <span className="text-sm font-tajawal sm:hidden">{step.num}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${currentStep > step.num ? 'bg-green-400' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
          </div>
        )}

        {/* Step Content */}
        {!loading && (
          <div className="py-4">
            {currentStep === 1 && (
              <Step1BasicInfo
                data={basicData}
                onChange={(key, value) => setBasicData(prev => ({ ...prev, [key]: value }))}
                errors={errors}
                options={options}
                isRTL={isRTL}
                onValidateNationalId={handleValidateNationalId}
              />
            )}
            
            {currentStep === 2 && (
              <Step2ParentInfo
                data={parentData}
                onChange={(key, value) => setParentData(prev => ({ ...prev, [key]: value }))}
                errors={errors}
                options={options}
                isRTL={isRTL}
                onValidatePhone={handleValidatePhone}
              />
            )}
            
            {currentStep === 3 && (
              <Step3HealthInfo
                data={healthData}
                onChange={(key, value) => setHealthData(prev => ({ ...prev, [key]: value }))}
                options={options}
                isRTL={isRTL}
              />
            )}
            
            {currentStep === 4 && (
              <Step4Review
                basicData={basicData}
                parentData={parentData}
                healthData={healthData}
                options={options}
                isRTL={isRTL}
              />
            )}
            
            {currentStep === 5 && result && (
              <SuccessStep
                result={result}
                isRTL={isRTL}
                onClose={handleClose}
                onAddAnother={handleReset}
              />
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!loading && currentStep < 5 && (
          <DialogFooter className="flex justify-between gap-3 mt-4">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={submitting}>
                  {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
                  {isRTL ? 'السابق' : 'Back'}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose} disabled={submitting}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={handleNext} className="bg-brand-turquoise hover:bg-brand-turquoise/90">
                  {isRTL ? 'التالي' : 'Next'}
                  {isRTL ? <ArrowLeft className="h-4 w-4 ms-2" /> : <ArrowRight className="h-4 w-4 ms-2" />}
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 me-2" />
                  )}
                  {isRTL ? 'تأكيد وحفظ' : 'Confirm & Save'}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentWizard;
