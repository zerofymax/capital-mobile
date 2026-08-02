import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import { routes } from '@/constants/routes';

export type MonthlyReportMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  support?: string;
  tone: 'success' | 'danger' | 'neutral';
};

export type MonthlyReportChartPoint = {
  id: string;
  label: string;
  currentRevenue: number;
  currentExpenses: number;
  previousRevenue: number;
  previousExpenses: number;
};

export type MonthlyReportListRow = {
  id: string;
  label: string;
  amount: string;
};

export type MonthlyReportAction = {
  id: string;
  title: string;
  accent: 'green' | 'amber';
  icon: keyof typeof Ionicons.glyphMap;
  href?: Href;
};

export const monthlyReportData = {
  title: 'التقرير الشهري',
  period: 'يوليو 2026',
  sourceBadge: 'تقرير يدوي',
  sourceNote: 'القيم مدخلة ضمن تحديث شهري مستقل، وقد تختلف عن العمليات المسجلة حاليًا.',
  exportSubtitle: 'تقرير يوليو 2026 · PDF · 4 صفحات',
  executiveSummary:
    'حقق نشاطك أداءً مستقرًا هذا الشهر، ارتفعت الإيرادات بنسبة ملحوظة بينما بقيت المصروفات ضمن النطاق المتوقع.',
  metrics: [
    { id: 'revenue', label: 'الإيرادات', value: '61,200 ر.س', change: '+14% عن يونيو', tone: 'success' },
    { id: 'expenses', label: 'المصروفات', value: '38,400 ر.س', change: '+7% عن يونيو', tone: 'danger' },
    { id: 'net-profit', label: 'الصافي التشغيلي', value: '22,800 ر.س', change: '+29% عن يونيو', tone: 'success' },
    { id: 'profit-margin', label: 'هامش الصافي التشغيلي', value: '37%', support: 'الصافي التشغيلي موجب خلال الفترة.', tone: 'neutral' },
  ] satisfies MonthlyReportMetric[],
  chart: [
    {
      id: 'july',
      label: 'يوليو',
      currentRevenue: 61200,
      currentExpenses: 38400,
      previousRevenue: 53700,
      previousExpenses: 35900,
    },
  ] satisfies MonthlyReportChartPoint[],
  revenueSources: [
    { id: 'client-payments', label: 'دفعات العملاء', amount: '41,200 ر.س' },
    { id: 'service-sales', label: 'بيع خدمات', amount: '20,000 ر.س' },
  ] satisfies MonthlyReportListRow[],
  expenseCategories: [
    { id: 'salaries', label: 'رواتب', amount: '21,000 ر.س' },
    { id: 'marketing', label: 'تسويق', amount: '9,400 ر.س' },
    { id: 'other-expenses', label: 'مصروفات أخرى', amount: '1,800 ر.س' },
  ] satisfies MonthlyReportListRow[],
  commitments: [
    { id: 'subscriptions-rent', label: 'اشتراكات نشطة + إيجار', amount: '6,200 ر.س' },
  ] satisfies MonthlyReportListRow[],
  interpretation:
    'أقوى نقطة إيجابية هذا الشهر هي نمو الإيرادات من العملاء. أما نقطة تحتاج متابعة فهي الاشتراكات محدودة الاستخدام التي ترفع مصروفاتك الثابتة دون فائدة مناسبة.',
  recommendedActions: [
    {
      id: 'review-subscriptions',
      title: 'راجع الاشتراكات محدودة الاستخدام',
      accent: 'green',
      icon: 'repeat-outline',
      href: routes.recurringExpenses,
    },
    {
      id: 'overdue-bill',
      title: 'تابع الفاتورة المتأخرة',
      accent: 'amber',
      icon: 'receipt-outline',
      href: routes.invoices,
    },
    {
      id: 'operating-expenses',
      title: 'حافظ على المصروفات التشغيلية ضمن الحد الحالي',
      accent: 'green',
      icon: 'list-outline',
      href: routes.budgets,
    },
  ] satisfies MonthlyReportAction[],
} as const;
