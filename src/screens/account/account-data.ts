import type { Ionicons } from '@expo/vector-icons';

export type AccountProfile = {
  initials: string;
  name: string;
  role: string;
  businessName: string;
  email: string;
  status: string;
  avatarType?: 'initial' | 'icon';
  avatarColor?: string;
  avatarBorderColor?: string;
};

export type AccountSettingsRow = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  soon?: boolean;
};

export type AccountSettingsSection = {
  id: 'company-account' | 'financial-planning' | 'data' | 'settings' | 'help';
  title: string;
  rows: readonly AccountSettingsRow[];
};

export type AccountSubscription = {
  title: string;
  subtitle: string;
  renewalLabel: string;
  renewalValue: string;
  statusLabel: string;
  statusValue: string;
  ctaLabel: string;
  priceLine: string;
  renewalLine: string;
};

export const accountProfile: AccountProfile = {
  initials: 'ع',
  name: 'عبدالله',
  role: 'مالك نشاط',
  businessName: 'Capital Studio',
  email: 'abdullah@capital.app',
  status: 'نشط',
};

export const accountSections: readonly AccountSettingsSection[] = [
  {
    id: 'company-account',
    title: 'الشركة والحساب',
    rows: [
      {
        id: 'business-info',
        icon: 'business-outline',
        title: 'معلومات النشاط',
        description: 'الاسم التجاري، نوع النشاط، الدولة، والعملة.',
      },
      {
        id: 'financial-accounts',
        icon: 'wallet-outline',
        title: 'الحسابات المالية',
        description: 'إدارة الحسابات والمحافظ المالية المرتبطة.',
      },
      {
        id: 'opening-balances',
        icon: 'calculator-outline',
        title: 'الأرصدة الابتدائية',
        description: 'تحديد نقطة البداية للحسابات والتقارير.',
      },
      {
        id: 'categories',
        icon: 'pricetags-outline',
        title: 'التصنيفات',
        description: 'تخصيص تصنيفات الإيرادات والمصروفات.',
      },
    ],
  },
  {
    id: 'financial-planning',
    title: 'التخطيط المالي',
    rows: [
      {
        id: 'budget-limits',
        icon: 'speedometer-outline',
        title: 'حدود الميزانية',
        description: 'ضبط حدود الإنفاق والتنبيهات المالية.',
      },
      {
        id: 'recurring-expenses',
        icon: 'repeat-outline',
        title: 'المصروفات المتكررة',
        description: 'متابعة الاشتراكات والالتزامات الشهرية.',
      },
      {
        id: 'financial-reports',
        icon: 'bar-chart-outline',
        title: 'التقارير المالية',
        description: 'الأرباح والخسائر، التدفق النقدي، والملخصات المالية.',
      },
    ],
  },
  {
    id: 'data',
    title: 'البيانات',
    rows: [
      {
        id: 'import-data',
        icon: 'cloud-upload-outline',
        title: 'استيراد البيانات',
        description: 'استعادة نسخة احتياطية محلية من بيانات Capital.',
      },
      {
        id: 'export-data',
        icon: 'download-outline',
        title: 'تصدير البيانات',
        description: 'إنشاء نسخة JSON محلية قابلة للاستعادة لاحقًا.',
      },
      {
        id: 'backup',
        icon: 'shield-outline',
        title: 'النسخ الاحتياطي',
        description: 'الاحتفاظ بنسخة آمنة من بيانات الشركة.',
        soon: true,
      },
    ],
  },
  {
    id: 'settings',
    title: 'الإعدادات',
    rows: [
      {
        id: 'notifications',
        icon: 'notifications-outline',
        title: 'الإشعارات',
        description: 'تخصيص تنبيهات الفواتير والسيولة والميزانية.',
      },
      {
        id: 'security',
        icon: 'shield-checkmark-outline',
        title: 'الأمان والخصوصية',
        description: 'إعدادات الدخول، الأمان، وخصوصية البيانات.',
      },
      {
        id: 'language-appearance',
        icon: 'language-outline',
        title: 'المظهر واللغة',
        description: 'تخصيص مظهر التطبيق ولغته.',
      },
    ],
  },
  {
    id: 'help',
    title: 'المساعدة',
    rows: [
      {
        id: 'financial-terms',
        icon: 'book-outline',
        title: 'المصطلحات المالية',
        description: 'شرح مبسط للمؤشرات والمفاهيم المالية.',
      },
      {
        id: 'help-center',
        icon: 'help-circle-outline',
        title: 'مركز المساعدة',
        description: 'إجابات عن الأسئلة الشائعة وطريقة استخدام Capital.',
      },
      {
        id: 'feedback',
        icon: 'megaphone-outline',
        title: 'إرسال اقتراح أو الإبلاغ عن مشكلة',
        description: 'شاركنا رأيك أو أخبرنا عن مشكلة واجهتك.',
      },
      {
        id: 'about',
        icon: 'information-circle-outline',
        title: 'عن Capital',
        description: 'معلومات التطبيق، الإصدار، الشروط، والخصوصية.',
      },
    ],
  },
];

export const accountSubscription: AccountSubscription = {
  title: 'خطة Capital Pro',
  subtitle: 'مزايا الذكاء المالي والتقارير المتقدمة مفعلة',
  renewalLabel: 'التجديد القادم',
  renewalValue: '15 أغسطس 2026',
  statusLabel: 'الحالة',
  statusValue: 'نشطة',
  ctaLabel: 'إدارة الاشتراك',
  priceLine: '49 ر.س / شهريًا',
  renewalLine: 'التجديد في 15 أغسطس 2026',
};
