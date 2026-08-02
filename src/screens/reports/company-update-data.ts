import { startupReportSummary } from './startup-report-data';
import type { StartupGoal } from './startup-goals-types';
import { calculateDisplayProgress, resolveGoalStatus } from './startup-goals-utils';
import type { CompanyUpdateFinancialSnapshot, CompanyUpdateFormValues, CompanyUpdatePeriod } from './company-update-types';

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'] as const;

export const companyUpdatePeriods: readonly CompanyUpdatePeriod[] = [
  { key: '2026-05', month: 5, year: 2026, label: 'مايو 2026' },
  { key: '2026-06', month: 6, year: 2026, label: 'يونيو 2026' },
  { key: '2026-07', month: 7, year: 2026, label: 'يوليو 2026' },
  { key: '2026-08', month: 8, year: 2026, label: 'أغسطس 2026' },
];

export const defaultCompanyUpdatePeriod = companyUpdatePeriods[2]!;

export const companyUpdateSectionLabels: Record<keyof CompanyUpdateFormValues, string> = {
  achievements: 'أهم الإنجازات',
  challenges: 'المشكلات والتحديات',
  companyNeeds: 'ما تحتاجه الشركة',
  hiringUpdate: 'التوظيف',
  nextSteps: 'الخطوات القادمة',
};

export const companyUpdatePlaceholders: Record<keyof CompanyUpdateFormValues, string> = {
  achievements: 'اكتب أهم ما حققته الشركة خلال هذا الشهر.',
  challenges: 'اذكر أهم المشكلات التي تحتاج متابعة أو قرارًا.',
  companyNeeds: 'ما المساعدة أو المقدمات التي تحتاجها الشركة؟',
  hiringUpdate: 'اكتب تحديثًا مختصرًا عن الفريق والتوظيف.',
  nextSteps: 'ما أهم الخطوات التي ستركز عليها الشركة في الشهر القادم؟',
};

export const currentCompanyUpdateDefaults: CompanyUpdateFormValues = {
  achievements: [
    'إطلاق النسخة التجريبية لميزة الفواتير المستحقة.',
    'الوصول إلى 640 عميلًا نشطًا.',
    'زيادة الإيراد الشهري المتكرر المدخل يدويًا بنسبة 12.4%.',
  ].join('\n'),
  challenges: [
    'ارتفاع تكلفة اكتساب العميل.',
    'تأخر توظيف مدير مبيعات.',
    'اعتماد نسبة كبيرة من الإيرادات على عدد محدود من العملاء.',
  ].join('\n'),
  companyNeeds: [
    'مقدمات لمديري تقنية في الشركات المتوسطة.',
    'مرشحون ذوو خبرة في مبيعات SaaS.',
    'مراجعة استراتيجية التسعير.',
  ].join('\n'),
  hiringUpdate: [
    'تم توظيف مطور تطبيقات.',
    'يوجد منصبان مفتوحان في المبيعات.',
    'مقابلات مدير المبيعات ما زالت جارية.',
  ].join('\n'),
  nextSteps: [
    'إكمال إطلاق النسخة الأولى.',
    'الوصول إلى 1,000 عميل.',
    'خفض CAC بنسبة 10%. هدف إداري مستقبلي — لا يوجد CAC محسوب حاليًا.',
    'بدء تجهيز مستندات الجولة الاستثمارية.',
  ].join('\n'),
};

const historicalSnapshots: Record<string, CompanyUpdateFinancialSnapshot> = {
  '2026-05': {
    activeCustomers: 276,
    cash: 930000,
    churnRate: 2,
    employees: 10,
    keyGoalLabel: 'إطلاق النسخة الأولى',
    keyGoalProgress: 54,
    monthlyBurn: 78000,
    mrr: 76000,
    newCustomers: 25,
    revenue: 102000,
    revenueGrowth: 7,
    runwayMonths: 11.9,
  },
  '2026-06': {
    activeCustomers: 295,
    cash: 885000,
    churnRate: 2.4,
    employees: 11,
    keyGoalLabel: 'الوصول إلى 1,000 عميل',
    keyGoalProgress: 58,
    monthlyBurn: 75000,
    mrr: 85400,
    newCustomers: 28,
    revenue: 112000,
    revenueGrowth: 9.8,
    runwayMonths: 11.8,
  },
};

export function createPeriodKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatUpdatePeriod(period: Pick<CompanyUpdatePeriod, 'month' | 'year'>) {
  return `${monthNames[period.month - 1] ?? `شهر ${period.month}`} ${period.year}`;
}

export function getCompanyUpdatePeriod(periodKey: string) {
  return companyUpdatePeriods.find((period) => period.key === periodKey) ?? defaultCompanyUpdatePeriod;
}

export function resolveFinancialSnapshot(periodKey: string, goals: readonly StartupGoal[]): CompanyUpdateFinancialSnapshot | null {
  if (periodKey === defaultCompanyUpdatePeriod.key) {
    const keyGoal = goals.find((goal) => goal.id === 'customers-1000') ?? goals.find((goal) => resolveGoalStatus(goal) === 'active') ?? null;

    return {
      activeCustomers: 320,
      cash: startupReportSummary.cash,
      churnRate: 2.4,
      employees: 12,
      keyGoalLabel: keyGoal?.title ?? startupReportSummary.keyGoalLabel,
      keyGoalProgress: keyGoal ? Math.round(calculateDisplayProgress(keyGoal)) : startupReportSummary.keyGoalProgress,
      monthlyBurn: startupReportSummary.monthlyBurn,
      mrr: 96000,
      newCustomers: 33,
      revenue: startupReportSummary.revenue,
      revenueGrowth: startupReportSummary.revenueGrowth,
      runwayMonths: startupReportSummary.runwayMonths,
    };
  }

  return historicalSnapshots[periodKey] ?? null;
}

export function createInitialCompanyUpdateValues(periodKey: string): CompanyUpdateFormValues {
  if (periodKey === defaultCompanyUpdatePeriod.key) {
    return currentCompanyUpdateDefaults;
  }

  return {
    achievements: '',
    challenges: '',
    companyNeeds: '',
    hiringUpdate: '',
    nextSteps: '',
  };
}
