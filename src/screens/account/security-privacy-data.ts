import type { Ionicons } from '@expo/vector-icons';

export type SecurityPreferenceId = 'pin-code' | 'two-factor' | 'biometric-login';
export type AccountSessionActionId =
  | 'quick-access-code'
  | 'change-password'
  | 'device-management'
  | 'sign-out-all-devices';

export type PrivacyPreferenceId = 'hide-sensitive-numbers' | 'experience-improvement' | 'crash-sharing';

export type SecurityPrivacyActionId = 'privacy-policy' | 'terms' | 'download-data' | 'delete-account';

export type SecurityPrivacySettingsState = Record<PrivacyPreferenceId, boolean>;

export type SecuritySettingItem = {
  id: SecurityPreferenceId;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  status?: string;
  soon?: boolean;
};

export type AccountSessionActionItem = {
  id: AccountSessionActionId;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  tone?: 'warning';
};

export type PrivacySettingItem = {
  id: PrivacyPreferenceId;
  title: string;
  description: string;
};

export type SecurityPrivacyActionItem = {
  id: SecurityPrivacyActionId;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  soon?: boolean;
};

export const securitySettings: readonly SecuritySettingItem[] = [
  {
    id: 'pin-code',
    icon: 'keypad-outline',
    title: 'رمز الدخول',
    description: 'استخدم رمزًا لحماية الوصول إلى بيانات الشركة.',
    status: 'مفعّل',
  },
  {
    id: 'two-factor',
    icon: 'shield-checkmark-outline',
    title: 'المصادقة الثنائية',
    description: 'طبقة إضافية للتحقق عند تسجيل الدخول.',
    soon: true,
  },
  {
    id: 'biometric-login',
    icon: 'finger-print-outline',
    title: 'الدخول بالبصمة أو الوجه',
    description: 'استخدام حماية الجهاز لفتح Capital.',
    soon: true,
  },
];

export const accountSessionActions: readonly AccountSessionActionItem[] = [
  {
    id: 'quick-access-code',
    icon: 'keypad-outline',
    title: 'رمز الدخول السريع',
    description: 'أنشئ رمزًا من 4 أرقام للدخول السريع إلى التطبيق.',
  },
  {
    id: 'change-password',
    icon: 'key-outline',
    title: 'تغيير كلمة المرور',
    description: 'حدّث كلمة المرور المستخدمة لحماية حسابك.',
  },
  {
    id: 'device-management',
    icon: 'phone-portrait-outline',
    title: 'إدارة الأجهزة',
    description: 'راجع الأجهزة والجلسات التي استخدمت حسابك.',
  },
  {
    id: 'sign-out-all-devices',
    icon: 'log-out-outline',
    title: 'تسجيل الخروج من جميع الأجهزة',
    description: 'أنهِ جميع الجلسات المسجلة على الأجهزة الأخرى.',
    tone: 'warning',
  },
];

export const privacySettings: readonly PrivacySettingItem[] = [
  {
    id: 'hide-sensitive-numbers',
    title: 'إخفاء الأرقام الحساسة',
    description: 'إخفاء الأرصدة والمبالغ عند فتح التطبيق.',
  },
  {
    id: 'experience-improvement',
    title: 'السماح بتحسين التجربة',
    description: 'السماح باستخدام بيانات استخدام مجهولة لتحسين تجربة Capital.',
  },
  {
    id: 'crash-sharing',
    title: 'مشاركة بيانات الأعطال',
    description: 'السماح بإرسال تقارير أعطال تقنية دون بيانات مالية.',
  },
];

export const dataPrivacyActions: readonly SecurityPrivacyActionItem[] = [
  {
    id: 'privacy-policy',
    icon: 'shield-checkmark-outline',
    title: 'سياسة الخصوصية',
    description: 'عرض سياسة الخصوصية الحالية.',
  },
  {
    id: 'terms',
    icon: 'document-text-outline',
    title: 'الشروط والأحكام',
    description: 'عرض الشروط والأحكام الحالية.',
  },
  {
    id: 'download-data',
    icon: 'download-outline',
    title: 'تنزيل نسخة من البيانات',
    description: 'ستتوفر بعد اعتماد أدوات البيانات.',
    soon: true,
  },
  {
    id: 'delete-account',
    icon: 'trash-outline',
    title: 'حذف الحساب والبيانات',
    description: 'سيتوفر بعد تفعيل الحسابات السحابية.',
    soon: true,
  },
];

export const defaultSecurityPrivacySettings: SecurityPrivacySettingsState = {
  'hide-sensitive-numbers': false,
  'experience-improvement': false,
  'crash-sharing': false,
};
