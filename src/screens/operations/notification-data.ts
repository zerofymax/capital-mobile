import type { Ionicons } from '@expo/vector-icons';

export type NotificationCategory = 'transactions' | 'intelligence' | 'reports' | 'security' | 'settings';

export type NotificationSection = 'today' | 'yesterday' | 'week';

export type NotificationAccent = 'green' | 'amber' | 'muted';

export type NotificationFilter = 'all' | NotificationCategory;

export type CapitalNotification = {
  id: string;
  title: string;
  description: string;
  body: string;
  category: NotificationCategory;
  categoryLabel: string;
  timestamp: string;
  section: NotificationSection;
  unread: boolean;
  accent: NotificationAccent;
  icon: keyof typeof Ionicons.glyphMap;
  amount?: string;
  actionLabel?: string;
};

export const notificationMessages = {
  allRead: 'تم تعيين كل الإشعارات كمقروءة',
  read: 'تم تعيين الإشعار كمقروء',
  deleted: 'تم حذف الإشعار',
} as const;

export const notificationFilters: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'transactions', label: 'المعاملات' },
  { id: 'intelligence', label: 'الذكاء' },
  { id: 'reports', label: 'التقارير' },
  { id: 'security', label: 'الأمان' },
  { id: 'settings', label: 'الإعدادات' },
];

export const notificationSectionLabels: Record<NotificationSection, string> = {
  today: 'اليوم',
  yesterday: 'أمس',
  week: 'هذا الأسبوع',
};

export const notificationSectionOrder: NotificationSection[] = ['today', 'yesterday', 'week'];

export const prototypeNotifications: CapitalNotification[] = [
  {
    id: 'new-income-recorded',
    title: 'تم تسجيل دخل جديد',
    description: 'تمت إضافة دفعة عميل بقيمة 18,500 ر.س',
    body: 'تمت إضافة دفعة عميل بقيمة 18,500 ر.س إلى سجل المعاملات. يظهر الأثر مباشرة في النقد المتاح وتقرير التدفق النقدي لهذا الشهر.',
    category: 'transactions',
    categoryLabel: 'المعاملات',
    timestamp: '10:42 ص',
    section: 'today',
    unread: true,
    accent: 'green',
    icon: 'arrow-up-outline',
    amount: '18,500 ر.س',
  },
  {
    id: 'expense-saving-opportunity',
    title: 'فرصة لخفض المصروفات',
    description: 'يمكنك توفير 480 ر.س شهريًا بمراجعة اشتراكاتك',
    body: 'لاحظ Capital أن لديك 3 اشتراكات مصنفة كـ"محدودة الاستخدام" بإجمالي 480 ر.س شهريًا. مراجعتها قد تساعدك على تحسين هامش الربح دون التأثير على تشغيل نشاطك.',
    category: 'intelligence',
    categoryLabel: 'الذكاء',
    timestamp: '9:15 ص',
    section: 'today',
    unread: true,
    accent: 'green',
    icon: 'sparkles-outline',
    amount: '480 ر.س / شهريًا',
    actionLabel: 'عرض التوصية',
  },
  {
    id: 'monthly-report-ready',
    title: 'تقريرك الشهري جاهز',
    description: 'راجع أداء نشاطك لشهر يوليو',
    body: 'تقرير الأداء الشهري جاهز للمراجعة. يتضمن ملخص الإيرادات والمصروفات وصافي الربح لشهر يوليو مع أبرز نقاط التحسن.',
    category: 'reports',
    categoryLabel: 'التقارير',
    timestamp: '6:00 م',
    section: 'yesterday',
    unread: false,
    accent: 'muted',
    icon: 'bar-chart-outline',
  },
  {
    id: 'new-login-detected',
    title: 'تسجيل دخول جديد',
    description: 'تم تسجيل الدخول من جهاز جديد',
    body: 'تم تسجيل الدخول إلى حسابك من جهاز جديد. إذا كان هذا النشاط منك فلا يلزم اتخاذ إجراء، وإذا لم يكن منك فراجع إعدادات الأمان فورًا.',
    category: 'security',
    categoryLabel: 'الأمان',
    timestamp: '2:20 م',
    section: 'yesterday',
    unread: false,
    accent: 'muted',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'subscription-renewal-soon',
    title: 'موعد تجديد قريب',
    description: 'سيتم تجديد اشتراك Capital Pro خلال 3 أيام',
    body: 'سيتم تجديد اشتراك Capital Pro خلال 3 أيام. يمكنك مراجعة إعدادات الاشتراك أو طريقة الدفع قبل موعد التجديد.',
    category: 'settings',
    categoryLabel: 'الإعدادات',
    timestamp: '12 يوليو 2026',
    section: 'week',
    unread: false,
    accent: 'amber',
    icon: 'calendar-outline',
  },
];

export const defaultNotification =
  prototypeNotifications.find((notification) => notification.id === 'expense-saving-opportunity') ?? prototypeNotifications[0]!;

export function getPrototypeNotification(notificationId?: string | string[]) {
  const id = Array.isArray(notificationId) ? notificationId[0] : notificationId;
  return prototypeNotifications.find((notification) => notification.id === id) ?? defaultNotification;
}
