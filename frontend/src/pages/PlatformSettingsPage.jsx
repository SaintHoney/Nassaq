import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { HakimAssistant } from '../components/hakim/HakimAssistant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  RefreshCw,
  Save,
  Shield,
  Bell,
  Mail,
  Lock,
  Languages,
  Palette,
  Database,
  Server,
  Brain,
  Building2,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';

export const PlatformSettingsPage = () => {
  const { user, api, logout } = useAuth();
  const { isRTL, toggleTheme, toggleLanguage, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Settings state
  const [settings, setSettings] = useState({
    // General
    platformName: 'نَسَّق | NASSAQ',
    platformNameEn: 'NASSAQ',
    defaultLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    
    // Email
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    senderEmail: 'noreply@nassaq.sa',
    senderName: 'نَسَّق',
    
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    twoFactorEnabled: false,
    
    // AI
    aiEnabled: true,
    aiModel: 'gpt-5.2',
    aiSchedulingEnabled: true,
    aiBehaviorAnalysis: true,
    aiInsights: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    
    // System
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const settingsCards = [
    {
      id: 'general',
      title: isRTL ? 'الإعدادات العامة' : 'General Settings',
      icon: Settings,
      description: isRTL ? 'إعدادات المنصة الأساسية' : 'Basic platform settings',
    },
    {
      id: 'security',
      title: isRTL ? 'الأمان' : 'Security',
      icon: Shield,
      description: isRTL ? 'إعدادات الأمان والحماية' : 'Security and protection settings',
    },
    {
      id: 'email',
      title: isRTL ? 'البريد الإلكتروني' : 'Email',
      icon: Mail,
      description: isRTL ? 'إعدادات خادم البريد' : 'Email server settings',
    },
    {
      id: 'ai',
      title: isRTL ? 'الذكاء الاصطناعي' : 'AI Settings',
      icon: Brain,
      description: isRTL ? 'إعدادات محرك الذكاء الاصطناعي' : 'AI engine settings',
    },
    {
      id: 'notifications',
      title: isRTL ? 'الإشعارات' : 'Notifications',
      icon: Bell,
      description: isRTL ? 'إعدادات الإشعارات' : 'Notification settings',
    },
    {
      id: 'system',
      title: isRTL ? 'النظام' : 'System',
      icon: Server,
      description: isRTL ? 'إعدادات النظام المتقدمة' : 'Advanced system settings',
    },
  ];

  return (
    <Sidebar>
      <div className="min-h-screen bg-background" data-testid="platform-settings-page">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground">
                {isRTL ? 'إعدادات المنصة' : 'Platform Settings'}
              </h1>
              <p className="text-sm text-muted-foreground font-tajawal">
                {isRTL ? 'إدارة إعدادات المنصة الأساسية' : 'Manage basic platform settings'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-xl">
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-brand-turquoise hover:bg-brand-turquoise-light rounded-xl">
                <Save className="h-4 w-4 me-2" />
                {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tabs List */}
            <div className="flex flex-wrap gap-2">
              {settingsCards.map((card) => (
                <Button
                  key={card.id}
                  variant={activeTab === card.id ? 'default' : 'outline'}
                  className={`rounded-xl ${activeTab === card.id ? 'bg-brand-navy' : ''}`}
                  onClick={() => setActiveTab(card.id)}
                >
                  <card.icon className="h-4 w-4 me-2" />
                  {card.title}
                </Button>
              ))}
            </div>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {isRTL ? 'الإعدادات العامة' : 'General Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم المنصة (عربي)' : 'Platform Name (Arabic)'}</Label>
                      <Input
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم المنصة (إنجليزي)' : 'Platform Name (English)'}</Label>
                      <Input
                        value={settings.platformNameEn}
                        onChange={(e) => setSettings({ ...settings, platformNameEn: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                      <Select value={settings.defaultLanguage} onValueChange={(v) => setSettings({ ...settings, defaultLanguage: v })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">{isRTL ? 'العربية' : 'Arabic'}</SelectItem>
                          <SelectItem value="en">{isRTL ? 'الإنجليزية' : 'English'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'المنطقة الزمنية' : 'Timezone'}</Label>
                      <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Riyadh">{isRTL ? 'الرياض' : 'Riyadh'} (GMT+3)</SelectItem>
                          <SelectItem value="Asia/Dubai">{isRTL ? 'دبي' : 'Dubai'} (GMT+4)</SelectItem>
                          <SelectItem value="Africa/Cairo">{isRTL ? 'القاهرة' : 'Cairo'} (GMT+2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {isRTL ? 'إعدادات الأمان' : 'Security Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'مهلة الجلسة (بالدقائق)' : 'Session Timeout (minutes)'}</Label>
                      <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الحد الأقصى لمحاولات الدخول' : 'Max Login Attempts'}</Label>
                      <Input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الحد الأدنى لطول كلمة المرور' : 'Min Password Length'}</Label>
                      <Input
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">{isRTL ? 'متطلبات كلمة المرور' : 'Password Requirements'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{isRTL ? 'أحرف كبيرة' : 'Uppercase Letters'}</span>
                        </div>
                        <Switch
                          checked={settings.requireUppercase}
                          onCheckedChange={(v) => setSettings({ ...settings, requireUppercase: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{isRTL ? 'أرقام' : 'Numbers'}</span>
                        </div>
                        <Switch
                          checked={settings.requireNumbers}
                          onCheckedChange={(v) => setSettings({ ...settings, requireNumbers: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{isRTL ? 'رموز خاصة' : 'Special Characters'}</span>
                        </div>
                        <Switch
                          checked={settings.requireSpecialChars}
                          onCheckedChange={(v) => setSettings({ ...settings, requireSpecialChars: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{isRTL ? 'المصادقة الثنائية' : 'Two-Factor Auth'}</span>
                        </div>
                        <Switch
                          checked={settings.twoFactorEnabled}
                          onCheckedChange={(v) => setSettings({ ...settings, twoFactorEnabled: v })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {isRTL ? 'إعدادات البريد الإلكتروني' : 'Email Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{isRTL ? 'تفعيل خادم SMTP' : 'Enable SMTP Server'}</span>
                    </div>
                    <Switch
                      checked={settings.smtpEnabled}
                      onCheckedChange={(v) => setSettings({ ...settings, smtpEnabled: v })}
                    />
                  </div>
                  
                  {settings.smtpEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'خادم SMTP' : 'SMTP Host'}</Label>
                        <Input
                          value={settings.smtpHost}
                          onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                          placeholder="smtp.example.com"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المنفذ' : 'Port'}</Label>
                        <Input
                          value={settings.smtpPort}
                          onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                          placeholder="587"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم المستخدم' : 'Username'}</Label>
                        <Input
                          value={settings.smtpUser}
                          onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'كلمة المرور' : 'Password'}</Label>
                        <Input
                          type="password"
                          value={settings.smtpPassword}
                          onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'بريد المرسل' : 'Sender Email'}</Label>
                        <Input
                          value={settings.senderEmail}
                          onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم المرسل' : 'Sender Name'}</Label>
                        <Input
                          value={settings.senderName}
                          onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {isRTL ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-brand-purple/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-brand-purple" />
                      </div>
                      <div>
                        <span className="font-medium">{isRTL ? 'تفعيل محرك الذكاء الاصطناعي' : 'Enable AI Engine'}</span>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'حكيم - المساعد الذكي' : 'Hakim - Smart Assistant'}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.aiEnabled}
                      onCheckedChange={(v) => setSettings({ ...settings, aiEnabled: v })}
                    />
                  </div>
                  
                  {settings.aiEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'نموذج الذكاء الاصطناعي' : 'AI Model'}</Label>
                        <Select value={settings.aiModel} onValueChange={(v) => setSettings({ ...settings, aiModel: v })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-5.2">GPT-5.2 (OpenAI)</SelectItem>
                            <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                            <SelectItem value="claude-sonnet">Claude Sonnet 4.5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">{isRTL ? 'ميزات الذكاء الاصطناعي' : 'AI Features'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                            <span className="text-sm">{isRTL ? 'جدولة ذكية' : 'Smart Scheduling'}</span>
                            <Switch
                              checked={settings.aiSchedulingEnabled}
                              onCheckedChange={(v) => setSettings({ ...settings, aiSchedulingEnabled: v })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                            <span className="text-sm">{isRTL ? 'تحليل السلوك' : 'Behavior Analysis'}</span>
                            <Switch
                              checked={settings.aiBehaviorAnalysis}
                              onCheckedChange={(v) => setSettings({ ...settings, aiBehaviorAnalysis: v })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                            <span className="text-sm">{isRTL ? 'رؤى ذكية' : 'AI Insights'}</span>
                            <Switch
                              checked={settings.aiInsights}
                              onCheckedChange={(v) => setSettings({ ...settings, aiInsights: v })}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</span>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span>{isRTL ? 'الإشعارات الفورية' : 'Push Notifications'}</span>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(v) => setSettings({ ...settings, pushNotifications: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{isRTL ? 'رسائل SMS' : 'SMS Notifications'}</span>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(v) => setSettings({ ...settings, smsNotifications: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card className="card-nassaq">
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {isRTL ? 'إعدادات النظام' : 'System Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</span>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">{isRTL ? 'سيتم تعطيل الوصول للمستخدمين' : 'Users will be blocked from access'}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span>{isRTL ? 'وضع التصحيح' : 'Debug Mode'}</span>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(v) => setSettings({ ...settings, debugMode: v })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isRTL ? 'مستوى السجلات' : 'Log Level'}</Label>
                    <Select value={settings.logLevel} onValueChange={(v) => setSettings({ ...settings, logLevel: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* System Info */}
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">{isRTL ? 'معلومات النظام' : 'System Information'}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">{isRTL ? 'الإصدار' : 'Version'}</p>
                        <p className="font-mono">2.1.0</p>
                      </div>
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">{isRTL ? 'البيئة' : 'Environment'}</p>
                        <p className="font-mono">Production</p>
                      </div>
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">{isRTL ? 'قاعدة البيانات' : 'Database'}</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-mono">MongoDB</span>
                        </div>
                      </div>
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">{isRTL ? 'الخادم' : 'Server'}</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-mono">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <HakimAssistant />
    </Sidebar>
  );
};
