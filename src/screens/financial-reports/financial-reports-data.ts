import type { FinancialReportCard, FinancialReportPeriod } from './financial-reports-types';

export const financialReportPeriods: readonly { id: FinancialReportPeriod; label: string; periodLabel: string }[] = [
  { id: 'current-month', label: 'هذا الشهر', periodLabel: 'يوليو 2026' },
  { id: 'previous-month', label: 'الشهر السابق', periodLabel: 'يونيو 2026' },
  { id: 'last-3-months', label: 'آخر 3 أشهر', periodLabel: 'مايو - يوليو 2026' },
  { id: 'last-6-months', label: 'آخر 6 أشهر', periodLabel: 'فبراير - يوليو 2026' },
  { id: 'current-year', label: 'هذه السنة', periodLabel: '2026' },
] as const;

export const financialReportCards: readonly FinancialReportCard[] = [
  {
    type: 'income-statement',
    title: 'قائمة الدخل',
    description: 'الإيرادات والمصروفات والصافي التشغيلي خلال الفترة.',
    icon: 'document-text-outline',
  },
  {
    type: 'cash-flow',
    title: 'التدفق التشغيلي المحلي',
    description: 'الداخل والخارج من العمليات اليدوية المسجلة فقط.',
    icon: 'swap-vertical-outline',
  },
  {
    type: 'expense-analysis',
    title: 'تحليل المصروفات',
    description: 'توزيع المصروفات حسب التصنيف وأكثر البنود تكلفة.',
    icon: 'pie-chart-outline',
  },
  {
    type: 'financial-trend',
    title: 'الاتجاه المالي',
    description: 'مقارنة الدخل والمصروفات والصافي حسب الأشهر.',
    icon: 'analytics-outline',
  },
] as const;

export function getPeriodLabel(period: FinancialReportPeriod) {
  return financialReportPeriods.find((item) => item.id === period)?.periodLabel ?? financialReportPeriods[0]!.periodLabel;
}

export function normalizeFinancialReportPeriod(value: unknown): FinancialReportPeriod {
  return financialReportPeriods.some((item) => item.id === value) ? (value as FinancialReportPeriod) : 'current-month';
}
