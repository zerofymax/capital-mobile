import type { Ionicons } from '@expo/vector-icons';

export type NotificationPreferenceId =
  | 'invoices-due-soon'
  | 'overdue-invoices'
  | 'invoice-payment-recorded'
  | 'invoice-due-reminder'
  | 'low-cash-balance'
  | 'low-runway'
  | 'monthly-burn-rise'
  | 'cash-flow-change'
  | 'budget-near-limit'
  | 'budget-exceeded'
  | 'recurring-expense-due'
  | 'recurring-expense-review'
  | 'weekly-summary'
  | 'monthly-company-update'
  | 'saas-metrics-change'
  | 'financial-ai-alerts';

export type NotificationSectionId = 'invoices' | 'cash-flow' | 'budgets' | 'growth';

export type NotificationChannel = 'in-app' | 'device' | 'email';

export type ReminderLeadTime = 'due-day' | 'before-3-days' | 'before-7-days' | 'before-14-days';

export type BudgetAlertThreshold = 70 | 80 | 90;

export type QuietHoursTime = '9:00 مساءً' | '10:00 مساءً' | '11:00 مساءً' | '6:00 صباحًا' | '7:00 صباحًا' | '8:00 صباحًا';

export type NotificationPreference = {
  id: NotificationPreferenceId;
  title: string;
  description: string;
};

export type NotificationSettingsSection = {
  id: NotificationSectionId;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  preferences: readonly NotificationPreference[];
};

export type NotificationChannelOption = {
  id: NotificationChannel;
  title: string;
  description: string;
  soon?: boolean;
};

export type NotificationSettingsState = {
  preferences: Record<NotificationPreferenceId, boolean>;
  channels: Record<NotificationChannel, boolean>;
  invoiceReminderLeadTime: ReminderLeadTime;
  lowBalanceThreshold: string;
  budgetAlertThreshold: BudgetAlertThreshold;
  quietHours: {
    enabled: boolean;
    start: QuietHoursTime;
    end: QuietHoursTime;
  };
};

export const prototypeCompanyCurrency = 'ر.س';

export const notificationSettingsSections: readonly NotificationSettingsSection[] = [
  {
    id: 'invoices',
    title: 'الفواتير والتحصيل',
    icon: 'receipt-outline',
    preferences: [
      {
        id: 'invoices-due-soon',
        title: 'الفواتير المستحقة قريبًا',
        description: 'تنبيه عند اقتراب موعد تحصيل فاتورة مفتوحة.',
      },
      {
        id: 'overdue-invoices',
        title: 'الفواتير المتأخرة',
        description: 'تنبيه عند تجاوز فاتورة لموعد الاستحقاق.',
      },
      {
        id: 'invoice-payment-recorded',
        title: 'تسجيل دفعة على فاتورة',
        description: 'تنبيه محلي عند إضافة دفعة جديدة إلى فاتورة.',
      },
      {
        id: 'invoice-due-reminder',
        title: 'تذكير قبل موعد الاستحقاق',
        description: 'حدد متى تريد ظهور تذكير الاستحقاق داخل التطبيق.',
      },
    ],
  },
  {
    id: 'cash-flow',
    title: 'السيولة والتدفق النقدي',
    icon: 'water-outline',
    preferences: [
      {
        id: 'low-cash-balance',
        title: 'انخفاض الرصيد النقدي',
        description: 'تنبيه عند انخفاض النقد المتاح عن الحد المحلي المحدد.',
      },
      {
        id: 'low-runway',
        title: 'انخفاض مدة بقاء السيولة',
        description: 'تنبيه عند اقتراب مدة تغطية المصروفات من مستوى مقلق.',
      },
      {
        id: 'monthly-burn-rise',
        title: 'ارتفاع الحرق الشهري',
        description: 'تنبيه عند ارتفاع المصروف الشهري عن النمط المعتاد.',
      },
      {
        id: 'cash-flow-change',
        title: 'تغير كبير في التدفق النقدي',
        description: 'تنبيه عند حدوث تغير واضح في التدفق الداخل أو الخارج.',
      },
    ],
  },
  {
    id: 'budgets',
    title: 'الميزانيات والمصروفات',
    icon: 'speedometer-outline',
    preferences: [
      {
        id: 'budget-near-limit',
        title: 'الاقتراب من حد الميزانية',
        description: 'تنبيه عند وصول الصرف إلى النسبة المختارة من الميزانية.',
      },
      {
        id: 'budget-exceeded',
        title: 'تجاوز الميزانية',
        description: 'تنبيه عندما يتجاوز المصروف الحد المعتمد.',
      },
      {
        id: 'recurring-expense-due',
        title: 'مصروف متكرر مستحق قريبًا',
        description: 'تذكير بالاشتراكات والالتزامات القادمة.',
      },
      {
        id: 'recurring-expense-review',
        title: 'مصروف متكرر يحتاج مراجعة',
        description: 'تنبيه عند وجود مصروف متكرر يبدو غير مستغل أو مرتفع.',
      },
    ],
  },
  {
    id: 'growth',
    title: 'النمو والتقارير',
    icon: 'trending-up-outline',
    preferences: [
      {
        id: 'weekly-summary',
        title: 'الملخص الأسبوعي',
        description: 'ملخص محلي لأهم مؤشرات النشاط خلال الأسبوع.',
      },
      {
        id: 'monthly-company-update',
        title: 'التحديث الشهري للشركة',
        description: 'تنبيه عند تجهيز نموذج تحديث الشركة الشهري.',
      },
      {
        id: 'saas-metrics-change',
        title: 'تغير مهم في مؤشرات SaaS',
        description: 'تنبيه عند تغير كبير في MRR أو ARR أو Churn أو مؤشرات النمو.',
      },
      {
        id: 'financial-ai-alerts',
        title: 'تنبيهات الذكاء المالي',
        description: 'إشارات Capital عند وجود فرصة أو مخاطرة مالية مهمة.',
      },
    ],
  },
];

export const notificationChannels: readonly NotificationChannelOption[] = [
  {
    id: 'in-app',
    title: 'داخل التطبيق',
    description: 'مفعّل محليًا ويظهر داخل مركز الإشعارات.',
  },
  {
    id: 'device',
    title: 'إشعارات الهاتف',
    description: 'ستتوفر بعد اعتماد إشعارات الهاتف الحقيقية.',
    soon: true,
  },
  {
    id: 'email',
    title: 'البريد الإلكتروني',
    description: 'ستتوفر ملخصات البريد في تحديث لاحق.',
    soon: true,
  },
];

export const reminderLeadTimeOptions: readonly { value: ReminderLeadTime; label: string }[] = [
  { value: 'due-day', label: 'في يوم الاستحقاق' },
  { value: 'before-3-days', label: 'قبل 3 أيام' },
  { value: 'before-7-days', label: 'قبل 7 أيام' },
  { value: 'before-14-days', label: 'قبل 14 يومًا' },
];

export const budgetAlertThresholdOptions: readonly { value: BudgetAlertThreshold; label: string }[] = [
  { value: 70, label: '70%' },
  { value: 80, label: '80%' },
  { value: 90, label: '90%' },
];

export const lowBalanceThresholdOptions = ['5,000', '10,000', '20,000'] as const;

export const quietHoursStartOptions: readonly QuietHoursTime[] = ['9:00 مساءً', '10:00 مساءً', '11:00 مساءً'];

export const quietHoursEndOptions: readonly QuietHoursTime[] = ['6:00 صباحًا', '7:00 صباحًا', '8:00 صباحًا'];

export const defaultNotificationSettings: NotificationSettingsState = {
  preferences: {
    'invoices-due-soon': true,
    'overdue-invoices': true,
    'invoice-payment-recorded': false,
    'invoice-due-reminder': true,
    'low-cash-balance': true,
    'low-runway': false,
    'monthly-burn-rise': false,
    'cash-flow-change': false,
    'budget-near-limit': true,
    'budget-exceeded': true,
    'recurring-expense-due': true,
    'recurring-expense-review': false,
    'weekly-summary': true,
    'monthly-company-update': false,
    'saas-metrics-change': false,
    'financial-ai-alerts': true,
  },
  channels: {
    'in-app': true,
    device: false,
    email: false,
  },
  invoiceReminderLeadTime: 'before-7-days',
  lowBalanceThreshold: '10,000',
  budgetAlertThreshold: 80,
  quietHours: {
    enabled: false,
    start: '10:00 مساءً',
    end: '7:00 صباحًا',
  },
};

export function getReminderLeadTimeLabel(value: ReminderLeadTime) {
  return reminderLeadTimeOptions.find((option) => option.value === value)?.label ?? 'في يوم الاستحقاق';
}
