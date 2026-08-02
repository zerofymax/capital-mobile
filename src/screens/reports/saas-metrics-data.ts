import type {
  CalculatedSaaSMetrics,
  GrowthMetricDefinition,
  MetricHistoryPoint,
  SaaSMetricId,
  SaaSPeriod,
  SaaSRawMetrics,
} from './saas-metrics-types';
import type { BusinessInformationState } from '@/screens/account/business-information-data';
import type { TransactionRecord } from '@/screens/ledger/ledger-data';
import type { Invoice } from '@/screens/invoices/invoices-data';
import { getInvoiceCollectionSummary } from '@/screens/invoices/invoice-utils';
import type { RecurringExpense } from '@/screens/recurring-expenses/recurring-expenses-types';
import { calculateDaysUntilDue, calculateMonthlyRecurringTotal } from '@/screens/recurring-expenses/recurring-expenses-utils';
import type { FinancialGoal } from '@/screens/goals/goals-data';
import { getGoalSummary } from '@/screens/goals/goal-utils';
import {
  calculateARR,
  calculateCAC,
  calculateCustomerChurnRate,
  calculateGrossMargin,
  calculateLTV,
  calculateLtvToCacRatio,
  calculateNRR,
  resolveMetricStatus,
} from './saas-metrics-calculations';

export const saasPeriods: readonly { id: SaaSPeriod; label: string }[] = [
  { id: 'current-month', label: 'هذا الشهر' },
  { id: 'three-months', label: 'آخر 3 أشهر' },
  { id: 'six-months', label: 'آخر 6 أشهر' },
  { id: 'year', label: 'هذه السنة' },
];

export const prototypeCompanyProfile = {
  businessModel: 'saas',
  currency: 'ر.س',
} as const;

const ltrStart = '\u2066';
const ltrEnd = '\u2069';

const periodComparisonLabels: Record<SaaSPeriod, string> = {
  'current-month': 'عن الشهر السابق',
  'three-months': 'مقارنة بالأشهر الثلاثة السابقة',
  'six-months': 'مقارنة بالأشهر الستة السابقة',
  year: 'مقارنة بالسنة السابقة',
};

type PeriodRange = {
  start: Date;
  end: Date;
};

type TransactionBucket = {
  income: number;
  expenses: number;
  net: number;
  count: number;
};

type GrowthTrendPoint = MetricHistoryPoint & {
  income: number;
  expenses: number;
  net: number;
};

export type GrowthMetricsSourceData = {
  transactions: readonly TransactionRecord[];
  invoices: readonly Invoice[];
  recurringExpenses: readonly RecurringExpense[];
  goals: readonly FinancialGoal[];
  businessInfo?: BusinessInformationState;
  now?: Date;
};

export type OperationalGrowthSummary = {
  period: SaaSPeriod;
  periodLabel: string;
  currencySymbol: string;
  current: TransactionBucket;
  previous: TransactionBucket;
  revenueGrowth: number | null;
  expenseChange: number | null;
  netMargin: number | null;
  trend: readonly GrowthTrendPoint[];
  invoices: {
    total: number;
    collected: number;
    remaining: number;
    openCount: number;
    overdueCount: number;
    dueSoonCount: number;
    waitingCount: number;
    paidCount: number;
    partiallyPaidCount: number;
    incompleteCount: number;
    collectionRate: number | null;
  };
  recurring: {
    monthlyTotal: number;
    activeCount: number;
    upcomingCount: number;
    reviewCount: number;
    ratioToIncome: number | null;
  };
  activeGoal: {
    name: string;
    progress: number;
    remaining: number;
    expectedCompletion: string;
  } | null;
  healthScore: number;
  healthLabel: string;
  primaryInsight: string;
  revenueGrowthLabel: string;
  expenseChangeLabel: string;
};

export const saasRawMetricsByPeriod: Record<SaaSPeriod, SaaSRawMetrics> = {
  'current-month': {
    period: 'current-month',
    periodLabel: 'يوليو 2026',
    mrr: 96000,
    previousMrr: 85400,
    activeCustomersEnd: 320,
    activeCustomersStart: 295,
    newCustomers: 32,
    previousNewCustomers: 24,
    lostCustomers: 7,
    previousLostCustomers: 9,
    salesAndMarketingSpend: 60000,
    averageRevenuePerCustomer: 300,
    beginningMrr: 86000,
    expansionMrr: 11000,
    contractionMrr: 2000,
    churnedMrr: 2120,
    revenue: 128000,
    serviceCost: 37125,
    revenueTrend: [64000, 70000, 76000, 82000, 88500, 96000],
  },
  'three-months': {
    period: 'three-months',
    periodLabel: 'مايو - يوليو 2026',
    mrr: 96000,
    previousMrr: 79000,
    activeCustomersEnd: 320,
    activeCustomersStart: 276,
    newCustomers: 76,
    previousNewCustomers: 58,
    lostCustomers: 32,
    previousLostCustomers: 35,
    salesAndMarketingSpend: 174000,
    averageRevenuePerCustomer: 300,
    beginningMrr: 79000,
    expansionMrr: 24000,
    contractionMrr: 5100,
    churnedMrr: 3100,
    revenue: 354000,
    serviceCost: 106200,
    revenueTrend: [56000, 62000, 70000, 79000, 88500, 96000],
  },
  'six-months': {
    period: 'six-months',
    periodLabel: 'فبراير - يوليو 2026',
    mrr: 96000,
    previousMrr: 64000,
    activeCustomersEnd: 320,
    activeCustomersStart: 238,
    newCustomers: 124,
    previousNewCustomers: 96,
    lostCustomers: 42,
    previousLostCustomers: 46,
    salesAndMarketingSpend: 288000,
    averageRevenuePerCustomer: 300,
    beginningMrr: 64000,
    expansionMrr: 39000,
    contractionMrr: 7600,
    churnedMrr: 4600,
    revenue: 672000,
    serviceCost: 201600,
    revenueTrend: [48000, 56000, 64000, 76000, 88500, 96000],
  },
  year: {
    period: 'year',
    periodLabel: '2026',
    mrr: 96000,
    previousMrr: 82000,
    activeCustomersEnd: 320,
    activeCustomersStart: 300,
    newCustomers: 30,
    previousNewCustomers: 24,
    lostCustomers: 10,
    previousLostCustomers: 14,
    salesAndMarketingSpend: 60000,
    averageRevenuePerCustomer: 300,
    beginningMrr: 82000,
    expansionMrr: 17000,
    contractionMrr: 3000,
    churnedMrr: 2200,
    revenue: 1184000,
    serviceCost: 355200,
    revenueTrend: [76000, 80000, 82000, 87500, 92000, 96000],
  },
};

export function calculateSaaSMetrics(raw: SaaSRawMetrics): CalculatedSaaSMetrics {
  const grossMargin = calculateGrossMargin(raw.revenue, raw.serviceCost);
  const churnRate = calculateCustomerChurnRate(raw.lostCustomers, raw.activeCustomersStart);
  const cac = calculateCAC(raw.salesAndMarketingSpend, raw.newCustomers);
  const ltv = calculateLTV(raw.averageRevenuePerCustomer, grossMargin, churnRate);

  return {
    arr: calculateARR(raw.mrr),
    churnRate,
    cac,
    ltv,
    nrr: calculateNRR(raw.beginningMrr, raw.expansionMrr, raw.contractionMrr, raw.churnedMrr),
    grossMargin,
    ltvToCacRatio: calculateLtvToCacRatio(ltv, cac),
  };
}

export function getSaaSRawMetrics(period: SaaSPeriod, source?: GrowthMetricsSourceData) {
  if (source) {
    const summary = getOperationalGrowthSummary(source, period);

    return {
      period,
      periodLabel: summary.periodLabel,
      mrr: 0,
      previousMrr: 0,
      activeCustomersEnd: 0,
      activeCustomersStart: 0,
      newCustomers: 0,
      previousNewCustomers: 0,
      lostCustomers: 0,
      previousLostCustomers: 0,
      salesAndMarketingSpend: 0,
      averageRevenuePerCustomer: 0,
      beginningMrr: 0,
      expansionMrr: 0,
      contractionMrr: 0,
      churnedMrr: 0,
      revenue: summary.current.income,
      serviceCost: summary.current.expenses,
      revenueTrend: summary.trend.map((point) => point.income),
    };
  }

  return saasRawMetricsByPeriod[period] ?? saasRawMetricsByPeriod['current-month'];
}

export function getSaaSMetrics(period: SaaSPeriod, source?: GrowthMetricsSourceData) {
  if (source) {
    return buildLocalGrowthMetricDefinitions(getOperationalGrowthSummary(source, period));
  }

  const raw = getSaaSRawMetrics(period);

  return buildMetricDefinitions(raw, calculateSaaSMetrics(raw));
}

export function getSaaSMetric(metricId: string | string[] | undefined, period: SaaSPeriod = 'current-month', source?: GrowthMetricsSourceData) {
  const id = Array.isArray(metricId) ? metricId[0] : metricId;
  const metrics = getSaaSMetrics(period, source);

  return metrics.find((metric) => metric.id === id) ?? metrics[0]!;
}

export function formatSar(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  return `${Math.round(value).toLocaleString('en-US')} ر.س`;
}

export function formatPercent(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number | null, suffix = '') {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  return `${Math.round(value).toLocaleString('en-US')}${suffix ? ` ${suffix}` : ''}`;
}

export function formatMultiplier(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  return isolateLtr(`${value.toFixed(1)}x`);
}

export function getOperationalGrowthSummary(source: GrowthMetricsSourceData, period: SaaSPeriod = 'current-month'): OperationalGrowthSummary {
  const now = source.now ?? new Date();
  const currencySymbol = getSourceCurrencySymbol(source.businessInfo);
  const currentRange = getPeriodRange(period, now);
  const previousRange = getPreviousPeriodRange(currentRange);
  const current = summarizeTransactions(source.transactions, currentRange);
  const previous = summarizeTransactions(source.transactions, previousRange);
  const revenueGrowth = percentageChange(current.income, previous.income);
  const expenseChange = percentageChange(current.expenses, previous.expenses);
  const netMargin = current.income > 0 ? safePercent(current.net, current.income) : null;
  const trend = buildSixMonthTrend(source.transactions, now);
  const invoiceCollection = getInvoiceCollectionSummary(source.invoices, now);
  const monthlyRecurringTotal = calculateMonthlyRecurringTotal(source.recurringExpenses);
  const activeRecurring = source.recurringExpenses.filter((expense) => expense.status === 'active');
  const upcomingRecurring = activeRecurring.filter((expense) => {
    const daysUntilDue = calculateDaysUntilDue(expense.nextDueDate, formatIsoDate(now));

    return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 30;
  });
  const reviewRecurring = activeRecurring.filter((expense) => expense.needsReview);
  const activeGoalSummary = source.goals
    .filter((goal) => goal.status !== 'completed')
    .map((goal) => getGoalSummary(goal, now))
    .sort((first, second) => second.progress - first.progress)[0];
  const recurringRatio = current.income > 0 ? safePercent(monthlyRecurringTotal, current.income) : null;
  const healthScore = calculateLocalGrowthScore({
    revenueGrowth,
    netMargin,
    overdueCount: invoiceCollection.overdueCount,
    recurringRatio,
    goalProgress: activeGoalSummary?.progress ?? null,
  });

  return {
    period,
    periodLabel: formatPeriodLabel(currentRange, period),
    currencySymbol,
    current,
    previous,
    revenueGrowth,
    expenseChange,
    netMargin,
    trend,
    invoices: {
      total: invoiceCollection.totalAmount,
      collected: invoiceCollection.collectedAmount,
      remaining: invoiceCollection.remainingAmount,
      openCount: invoiceCollection.incompleteCount,
      overdueCount: invoiceCollection.overdueCount,
      dueSoonCount: invoiceCollection.dueSoonCount,
      waitingCount: invoiceCollection.waitingCount,
      paidCount: invoiceCollection.paidCount,
      partiallyPaidCount: invoiceCollection.partiallyPaidCount,
      incompleteCount: invoiceCollection.incompleteCount,
      collectionRate: invoiceCollection.collectionRate,
    },
    recurring: {
      monthlyTotal: monthlyRecurringTotal,
      activeCount: activeRecurring.length,
      upcomingCount: upcomingRecurring.length,
      reviewCount: reviewRecurring.length,
      ratioToIncome: recurringRatio,
    },
    activeGoal: activeGoalSummary
      ? {
          name: activeGoalSummary.name,
          progress: activeGoalSummary.progress,
          remaining: activeGoalSummary.remaining,
          expectedCompletion: activeGoalSummary.expectedCompletion.label,
        }
      : null,
    healthScore,
    healthLabel: healthScore >= 80 ? 'مستقر' : healthScore >= 60 ? 'يحتاج متابعة' : 'يحتاج انتباه',
    primaryInsight: buildPrimaryInsight(
      current,
      revenueGrowth,
      invoiceCollection.overdueCount,
      monthlyRecurringTotal,
      activeGoalSummary?.progress ?? null,
    ),
    revenueGrowthLabel: formatGrowthLabel(revenueGrowth, current.income, previous.income, 'الدخل'),
    expenseChangeLabel: formatExpenseChangeLabel(expenseChange, current.expenses, previous.expenses),
  };
}

export function getCollectionStatusLabel({
  total,
  collectionRate,
}: Pick<OperationalGrowthSummary['invoices'], 'total' | 'collectionRate'>) {
  if (total <= 0 || collectionRate === null || !Number.isFinite(collectionRate)) {
    return 'يحتاج بيانات';
  }

  if (collectionRate >= 80) {
    return 'جيد';
  }

  if (collectionRate >= 50) {
    return 'متوسط';
  }

  return 'يحتاج متابعة';
}

function buildLocalGrowthMetricDefinitions(summary: OperationalGrowthSummary): GrowthMetricDefinition[] {
  const unavailableReason = 'يحتاج إلى بيانات اشتراكات العملاء المتكررة.';
  const customerReason = 'يحتاج إلى سجل عملاء وفترات اشتراك فعلية.';
  const acquisitionReason = 'يحتاج إلى مصروفات تسويق ومبيعات مخصصة وعدد عملاء جدد.';

  return [
    unavailableMetric({
      id: 'mrr',
      title: 'الإيراد الشهري المتكرر',
      abbreviation: 'MRR',
      icon: 'trending-up-outline',
      section: 'revenue',
      reason: unavailableReason,
      formula: 'مجموع الإيرادات الشهرية المتكررة النشطة من اشتراكات العملاء.',
      sourceValues: [
        'اشتراكات العملاء النشطة: غير متاحة',
        'قيمة التكرار الشهري: غير متاحة',
        `الفترة: ${summary.periodLabel}`,
      ],
    }),
    unavailableMetric({
      id: 'arr',
      title: 'الإيراد السنوي المتكرر',
      abbreviation: 'ARR',
      icon: 'calendar-outline',
      section: 'revenue',
      reason: unavailableReason,
      formula: 'MRR × 12 عند توفر مصدر MRR موثوق.',
      sourceValues: ['MRR موثوق: غير متاح', `الفترة: ${summary.periodLabel}`],
    }),
    unavailableMetric({
      id: 'nrr',
      title: 'صافي الاحتفاظ بالإيراد',
      abbreviation: 'NRR',
      icon: 'repeat-outline',
      section: 'revenue',
      reason: 'يحتاج إلى MRR بداية الفترة والتوسع والانخفاض والإلغاء من اشتراكات العملاء.',
      formula: '(MRR البداية + التوسع - التخفيض - الإلغاء) ÷ MRR البداية × 100.',
      sourceValues: [
        'MRR بداية الفترة: غير متاح',
        'توسعات الاشتراكات: غير متاحة',
        'تخفيضات الاشتراكات: غير متاحة',
        'إيراد العملاء الملغين: غير متاح',
        `الفترة: ${summary.periodLabel}`,
      ],
    }),
    {
      id: 'gross-margin',
      title: 'هامش الصافي المحلي',
      abbreviation: 'Net',
      value: formatPercent(summary.netMargin),
      rawValue: summary.netMargin,
      comparison: summary.netMargin === null ? 'لا توجد بيانات دخل كافية' : `مبني على العمليات المسجلة في ${summary.periodLabel}`,
      status: resolveMetricStatus('gross-margin', summary.netMargin),
      icon: 'layers-outline',
      section: 'revenue',
      badge: 'تجريبي',
      sourceDescription: 'هامش تشغيلي محلي مبني على العمليات المسجلة.',
      explanation: 'يعرض نسبة صافي الدخل المحلي من إجمالي دخل الفترة في Store العمليات. لا يمثل هامش ربح محاسبيًا معتمدًا.',
      formula: 'صافي الفترة ÷ دخل الفترة × 100.',
      calculationDescription: 'صافي الفترة = الدخل المسجل - المصروفات المسجلة. إذا كان الدخل صفرًا تعرض الحالة غير متاحة بدل NaN.',
      sourceValues: [
        `الدخل: ${formatMoney(summary.current.income, summary.currencySymbol)}`,
        `المصروفات: ${formatMoney(summary.current.expenses, summary.currencySymbol)}`,
        `الصافي: ${formatSignedMoney(summary.current.net, summary.currencySymbol)}`,
      ],
      importance: 'يساعد على فهم كفاءة العمليات المحلية دون خلطها مع التقارير المحاسبية.',
      note: `${summary.revenueGrowthLabel}. ${summary.expenseChangeLabel}.`,
      history: summary.trend.map((point) => ({ label: point.label, value: point.income > 0 ? Math.round((point.net / point.income) * 100) : 0 })),
    },
    unavailableMetric({
      id: 'new-customers',
      title: 'العملاء الجدد',
      abbreviation: 'New',
      icon: 'person-add-outline',
      section: 'customers',
      reason: customerReason,
      formula: 'عدد العملاء الذين بدأوا اشتراكًا أو دفعًا خلال الفترة.',
      sourceValues: ['العملاء الجدد خلال الفترة: غير متاح', `الفترة: ${summary.periodLabel}`],
    }),
    unavailableMetric({
      id: 'lost-customers',
      title: 'العملاء المفقودون',
      abbreviation: 'Lost',
      icon: 'person-remove-outline',
      section: 'customers',
      reason: customerReason,
      formula: 'عدد العملاء الذين توقفوا عن الدفع أو ألغوا الاشتراك خلال الفترة.',
      sourceValues: ['العملاء المفقودون خلال الفترة: غير متاح', `الفترة: ${summary.periodLabel}`],
    }),
    unavailableMetric({
      id: 'churn',
      title: 'معدل إلغاء العملاء',
      abbreviation: 'Churn',
      icon: 'warning-outline',
      section: 'customers',
      reason: customerReason,
      formula: 'العملاء المفقودون ÷ العملاء في بداية الفترة × 100.',
      sourceValues: [
        'العملاء في بداية الفترة: غير متاح',
        'العملاء المفقودون خلال الفترة: غير متاح',
        `الفترة: ${summary.periodLabel}`,
      ],
    }),
    unavailableMetric({
      id: 'cac',
      title: 'تكلفة اكتساب العميل',
      abbreviation: 'CAC',
      icon: 'megaphone-outline',
      section: 'efficiency',
      reason: acquisitionReason,
      formula: 'مصروفات التسويق والمبيعات المخصصة ÷ العملاء الجدد.',
      sourceValues: [
        'مصروفات التسويق والمبيعات المخصصة: غير متاحة',
        'عدد العملاء الجدد: غير متاح',
        `الفترة: ${summary.periodLabel}`,
      ],
    }),
    unavailableMetric({
      id: 'ltv',
      title: 'قيمة العميل',
      abbreviation: 'LTV',
      icon: 'diamond-outline',
      section: 'efficiency',
      reason: 'يحتاج إلى ARPU وهامش موثوق ومعدل Churn من بيانات عملاء فعلية.',
      formula: `${isolateLtr('LTV = ARPU × الهامش ÷ Churn')} — متوسط الإيراد لكل عميل × الهامش ÷ معدل إلغاء العملاء`,
      sourceValues: ['ARPU: غير متاح', 'هامش موثوق: غير متاح', 'Churn: غير متاح', `الفترة: ${summary.periodLabel}`],
    }),
  ];
}

function unavailableMetric({
  id,
  title,
  abbreviation,
  icon,
  section,
  reason,
  formula,
  sourceValues,
}: {
  id: SaaSMetricId;
  title: string;
  abbreviation: string;
  icon: GrowthMetricDefinition['icon'];
  section: GrowthMetricDefinition['section'];
  reason: string;
  formula: string;
  sourceValues?: readonly string[];
}): GrowthMetricDefinition {
  return {
    id,
    title,
    abbreviation,
    value: 'غير متاح حاليًا',
    rawValue: null,
    comparison: reason,
    status: 'watch',
    icon,
    section,
    badge: 'يحتاج بيانات',
    sourceDescription: reason,
    explanation: `${title} غير محسوب في النموذج الحالي لأن مصدر البيانات المطلوب غير موجود.`,
    formula,
    calculationDescription: 'تم إيقاف الرقم الثابت لهذا المؤشر حتى تتوفر بيانات محلية موثوقة للحساب.',
    sourceValues: sourceValues ?? ['لا يوجد مصدر بيانات موثوق لهذا المؤشر في الـprototype الحالي.'],
    importance: 'إظهار الحالة غير المتاحة يمنع قراءة رقم تجريبي كأنه مؤشر مالي مؤكد.',
    note: reason,
    history: [],
  };
}

function getPeriodRange(period: SaaSPeriod, now: Date): PeriodRange {
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = endOfMonth(now);

  if (period === 'three-months') {
    return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end: currentEnd };
  }

  if (period === 'six-months') {
    return { start: new Date(now.getFullYear(), now.getMonth() - 5, 1), end: currentEnd };
  }

  if (period === 'year') {
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) };
  }

  return { start: currentStart, end: currentEnd };
}

function getPreviousPeriodRange(range: PeriodRange): PeriodRange {
  const months = Math.max(monthsBetween(range.start, range.end), 1);
  const previousEnd = new Date(range.start.getFullYear(), range.start.getMonth(), 0, 23, 59, 59, 999);

  return {
    start: new Date(previousEnd.getFullYear(), previousEnd.getMonth() - months + 1, 1),
    end: previousEnd,
  };
}

function summarizeTransactions(transactions: readonly TransactionRecord[], range: PeriodRange): TransactionBucket {
  return transactions.reduce<TransactionBucket>(
    (summary, transaction) => {
      const date = parseIsoDate(transaction.transactionDate);

      if (!date || date.getTime() < range.start.getTime() || date.getTime() > range.end.getTime()) {
        return summary;
      }

      const amount = safeNumber(transaction.amount);

      if (transaction.type === 'income') {
        summary.income += amount;
      } else {
        summary.expenses += amount;
      }

      summary.net = summary.income - summary.expenses;
      summary.count += 1;
      return summary;
    },
    { income: 0, expenses: 0, net: 0, count: 0 },
  );
}

function buildSixMonthTrend(transactions: readonly TransactionRecord[], now: Date): GrowthTrendPoint[] {
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const bucket = summarizeTransactions(transactions, { start: month, end: endOfMonth(month) });

    return {
      label: arabicMonthNames[month.getMonth()] ?? `${index + 1}`,
      value: bucket.income,
      income: bucket.income,
      expenses: bucket.expenses,
      net: bucket.net,
    };
  });
}

function calculateLocalGrowthScore({
  revenueGrowth,
  netMargin,
  overdueCount,
  recurringRatio,
  goalProgress,
}: {
  revenueGrowth: number | null;
  netMargin: number | null;
  overdueCount: number;
  recurringRatio: number | null;
  goalProgress: number | null;
}) {
  let score = 64;

  score += revenueGrowth === null ? 0 : Math.max(-12, Math.min(16, revenueGrowth / 2));
  score += netMargin === null ? 0 : Math.max(-12, Math.min(14, netMargin / 3));
  score -= Math.min(16, overdueCount * 5);
  score -= recurringRatio === null ? 0 : recurringRatio > 45 ? 10 : recurringRatio > 30 ? 5 : 0;
  score += goalProgress === null ? 0 : Math.min(8, goalProgress / 12);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildPrimaryInsight(current: TransactionBucket, revenueGrowth: number | null, overdueCount: number, monthlyRecurringTotal: number, goalProgress: number | null) {
  if (overdueCount > 0) {
    return formatOverdueGrowthInsight(overdueCount);
  }

  if (current.net < 0) {
    return 'صافي الفترة سلبي؛ راجع المصروفات المسجلة قبل زيادة الالتزامات.';
  }

  if (revenueGrowth !== null && revenueGrowth > 0) {
    return 'الدخل المسجل تحسن مقارنة بالفترة السابقة، مع استمرار متابعة الالتزامات المتكررة.';
  }

  if (monthlyRecurringTotal > 0) {
    return 'الالتزامات المتكررة نشطة وتحتاج مراجعة دورية حتى لا تضغط على هامش الصافي.';
  }

  if (goalProgress !== null) {
    return 'تقدم الهدف النشط محسوب من المساهمات المحققة فقط دون المساهمات المستقبلية.';
  }

  return 'الرؤية محلية تجريبية مبنية على البيانات المسجلة داخل الجهاز.';
}

function formatOverdueGrowthInsight(count: number) {
  if (count === 1) {
    return 'توجد فاتورة متأخرة واحدة تحتاج إلى المتابعة قبل اعتبار قراءة النمو تحسنًا مكتملًا.';
  }

  if (count === 2) {
    return 'توجد فاتورتان متأخرتان تحتاجان إلى المتابعة قبل اعتبار قراءة النمو تحسنًا مكتملًا.';
  }

  if (count >= 3 && count <= 10) {
    return `توجد ${count.toLocaleString('en-US')} فواتير متأخرة تحتاج إلى المتابعة قبل اعتبار قراءة النمو تحسنًا مكتملًا.`;
  }

  return `توجد ${count.toLocaleString('en-US')} فاتورة متأخرة تحتاج إلى المتابعة قبل اعتبار قراءة النمو تحسنًا مكتملًا.`;
}

function formatGrowthLabel(value: number | null, current: number, previous: number, label: string) {
  if (previous > 0 && value !== null) {
    return value > 0
      ? `${label} ارتفع بنسبة ${formatPercent(value)}`
      : value < 0
        ? `${label} انخفض بنسبة ${formatPercent(Math.abs(value))}`
        : `${label} مستقر مقارنة بالفترة السابقة`;
  }

  if (previous === 0 && current > 0) {
    return `${label} جديد في هذه الفترة`;
  }

  return 'لا توجد بيانات كافية';
}

function formatExpenseChangeLabel(value: number | null, current: number, previous: number) {
  if (previous > 0 && value !== null) {
    return value > 0
      ? `المصروفات ارتفعت بنسبة ${formatPercent(value)}`
      : value < 0
        ? `المصروفات انخفضت بنسبة ${formatPercent(Math.abs(value))}`
        : 'المصروفات مستقرة مقارنة بالفترة السابقة';
  }

  if (previous === 0 && current > 0) {
    return 'ظهرت مصروفات جديدة في هذه الفترة';
  }

  return 'لا توجد بيانات مصروفات كافية';
}

export function formatMoney(value: number | null, currency: string) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  return `${Math.round(Math.abs(value)).toLocaleString('en-US')} ${currency}`;
}

export function formatSignedMoney(value: number | null, currency: string) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  const sign = value > 0 ? '+' : value < 0 ? '-' : '';

  return `${sign}${Math.round(Math.abs(value)).toLocaleString('en-US')} ${currency}`;
}

function getSourceCurrencySymbol(businessInfo?: BusinessInformationState) {
  const currency = businessInfo?.currency ?? prototypeCompanyProfile.currency;

  if (currency.includes('AED')) {
    return 'د.إ';
  }

  if (currency.includes('KWD')) {
    return 'د.ك';
  }

  if (currency.includes('QAR')) {
    return 'ر.ق';
  }

  if (currency.includes('BHD')) {
    return 'د.ب';
  }

  if (currency.includes('OMR')) {
    return 'ر.ع';
  }

  const parts = currency.split(/—|-/).map((part) => part.trim()).filter(Boolean);

  return parts[1] ?? prototypeCompanyProfile.currency;
}

function formatPeriodLabel(range: PeriodRange, period: SaaSPeriod) {
  if (period === 'current-month') {
    return formatMonthYear(range.end);
  }

  if (period === 'year') {
    return `${range.end.getFullYear()}`;
  }

  return `${formatMonthYear(range.start)} - ${formatMonthYear(range.end)}`;
}

function formatMonthYear(date: Date) {
  return `${arabicMonthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function monthsBetween(start: Date, end: Date) {
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isFinite(date.getTime()) ? date : null;
}

function safeNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function safePercent(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }

  const value = (numerator / denominator) * 100;

  return Number.isFinite(value) ? value : null;
}

const arabicMonthNames = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

function formatLtvToCacComparison(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return `نسبة ${isolateLtr('LTV:CAC')} غير متاحة`;
  }

  return `نسبة ${isolateLtr('LTV:CAC')} تساوي ${formatMultiplier(value)}`;
}

function isolateLtr(value: string) {
  return `${ltrStart}${value}${ltrEnd}`;
}

function buildMetricDefinitions(raw: SaaSRawMetrics, calculated: CalculatedSaaSMetrics): GrowthMetricDefinition[] {
  const mrrGrowth = percentageChange(raw.mrr, raw.previousMrr);
  const newCustomersDelta = raw.newCustomers - raw.previousNewCustomers;
  const lostCustomersDelta = raw.previousLostCustomers - raw.lostCustomers;
  const ltvStatus = resolveMetricStatus('ltv-cac', calculated.ltvToCacRatio);
  const comparisonLabel = periodComparisonLabels[raw.period];

  return [
    {
      id: 'mrr',
      title: 'الإيراد الشهري المتكرر',
      abbreviation: 'MRR',
      value: formatSar(raw.mrr),
      rawValue: raw.mrr,
      comparison: mrrGrowth === null ? 'غير متاح' : `ارتفع ${formatPercent(mrrGrowth)} ${comparisonLabel}`,
      status: resolveMetricStatus('positive', mrrGrowth),
      icon: 'trending-up-outline',
      section: 'revenue',
      explanation: 'يقيس الإيراد الشهري المتوقع من الاشتراكات النشطة خلال شهر واحد.',
      formula: 'متوسط قيمة الاشتراك الشهري × عدد العملاء النشطين.',
      calculationDescription: 'تم الاعتماد على الاشتراكات النشطة وقيمة الإيراد الشهري المتكرر للفترة.',
      sourceValues: [`MRR الحالي: ${formatSar(raw.mrr)}`, `MRR السابق: ${formatSar(raw.previousMrr)}`],
      importance: 'يساعد مؤسس الشركة على فهم استقرار الإيراد وسرعة النمو قبل زيادة الإنفاق.',
      note: 'الإيراد المتكرر ينمو بشكل جيد. راقب استمرار النمو دون رفع تكلفة اكتساب العميل بالمعدل نفسه.',
      history: toHistory(raw.revenueTrend),
    },
    {
      id: 'arr',
      title: 'الإيراد السنوي المتكرر',
      abbreviation: 'ARR',
      value: formatSar(calculated.arr),
      rawValue: calculated.arr,
      comparison: 'محسوب من MRR الحالي × 12',
      status: resolveMetricStatus('positive', calculated.arr),
      icon: 'calendar-outline',
      section: 'revenue',
      explanation: 'يعرض تقدير الإيراد السنوي إذا استمر الأداء الشهري الحالي.',
      formula: 'MRR × 12.',
      calculationDescription: 'هذا تقدير سنوي مبسط مبني على الإيراد الشهري الحالي.',
      sourceValues: [`MRR الحالي: ${formatSar(raw.mrr)}`, `ARR المحسوب: ${formatSar(calculated.arr)}`],
      importance: 'يفيد في قراءة حجم الشركة المتوقع ومقارنة النمو مع خطط التمويل والتوسع.',
      note: 'استخدم ARR كتقدير تشغيلي، وليس كإيراد محقق بالكامل.',
      history: toHistory(raw.revenueTrend.map((value) => value * 12)),
    },
    {
      id: 'nrr',
      title: 'صافي الاحتفاظ بالإيراد',
      abbreviation: 'NRR',
      value: formatPercent(calculated.nrr),
      rawValue: calculated.nrr,
      comparison: calculated.nrr === null ? 'لا توجد بيانات كافية' : `${formatPercent(calculated.nrr)} بعد التوسعات والانخفاضات`,
      status: resolveMetricStatus('nrr', calculated.nrr),
      icon: 'repeat-outline',
      section: 'revenue',
      explanation: 'يقيس نمو الإيراد من العملاء الحاليين بعد التوسعات والتخفيضات والإلغاءات.',
      formula: '(MRR بداية الفترة + التوسع - التخفيض - الإلغاء) ÷ MRR بداية الفترة × 100.',
      calculationDescription: 'إذا كانت النتيجة فوق 100% فهذا يعني أن العملاء الحاليين يعوضون الانخفاض والإلغاء.',
      sourceValues: [
        `MRR بداية الفترة: ${formatSar(raw.beginningMrr)}`,
        `توسعات الاشتراكات: ${formatSar(raw.expansionMrr)}`,
        `تخفيضات الاشتراكات: ${formatSar(raw.contractionMrr)}`,
        `إيراد العملاء الملغين: ${formatSar(raw.churnedMrr)}`,
      ],
      importance: 'يوضح جودة قاعدة العملاء الحالية وقدرتها على النمو دون الاعتماد الكامل على عملاء جدد.',
      note: 'صافي الاحتفاظ أعلى من 100%، ما يعني أن توسع العملاء الحاليين يعوض الانخفاض والإلغاء.',
      history: toHistory([99, 101, 103, 105, 106, calculated.nrr ?? 0]),
    },
    {
      id: 'gross-margin',
      title: 'هامش الربح الإجمالي',
      abbreviation: 'GM',
      value: formatPercent(calculated.grossMargin),
      rawValue: calculated.grossMargin,
      comparison: 'هامش صحي لنموذج SaaS',
      status: resolveMetricStatus('gross-margin', calculated.grossMargin),
      icon: 'layers-outline',
      section: 'revenue',
      explanation: 'النسبة المتبقية من الإيراد بعد تكلفة تقديم الخدمة المباشرة.',
      formula: '(الإيرادات - التكلفة المباشرة للخدمة) ÷ الإيرادات × 100.',
      calculationDescription: 'تمت مقارنة الإيرادات بتكاليف التشغيل المباشرة لتقدير كفاءة الهامش.',
      sourceValues: [`الإيرادات: ${formatSar(raw.revenue)}`, `التكلفة المباشرة للخدمة: ${formatSar(raw.serviceCost)}`],
      importance: 'كلما كان أعلى، زادت قدرة الشركة على تمويل النمو والتطوير.',
      note: 'الهامش جيد لنموذج SaaS، لكن زيادة تكاليف البنية التقنية قد تؤثر عليه مستقبلًا.',
      history: toHistory([66, 67, 68, 69, 70, calculated.grossMargin ?? 0]),
    },
    {
      id: 'new-customers',
      title: 'العملاء الجدد',
      abbreviation: 'New',
      value: formatNumber(raw.newCustomers, 'عميلًا'),
      rawValue: raw.newCustomers,
      comparison: `${formatNumber(Math.abs(newCustomersDelta), 'عملاء')} ${newCustomersDelta >= 0 ? 'أكثر' : 'أقل'} ${comparisonLabel}`,
      status: resolveMetricStatus('positive', newCustomersDelta),
      icon: 'person-add-outline',
      section: 'customers',
      explanation: 'عدد العملاء الذين بدأوا الاشتراك أو الدفع خلال الفترة.',
      formula: 'إجمالي العملاء الجدد المسجلين في الفترة.',
      calculationDescription: 'تم احتساب العملاء الذين دخلوا قاعدة العملاء النشطين خلال الفترة المختارة.',
      sourceValues: [`العملاء الجدد: ${formatNumber(raw.newCustomers)}`, `الفترة السابقة: ${formatNumber(raw.previousNewCustomers)}`],
      importance: 'يوضح قوة قنوات النمو وقدرتها على توليد طلب جديد.',
      note: 'النمو في العملاء الجدد جيد. راقب جودة العملاء الجدد ومعدل التحويل إلى خطط مدفوعة.',
      history: toHistory([17, 19, 22, 25, 28, raw.newCustomers]),
    },
    {
      id: 'lost-customers',
      title: 'العملاء المفقودون',
      abbreviation: 'Lost',
      value: formatNumber(raw.lostCustomers, 'عملاء'),
      rawValue: raw.lostCustomers,
      comparison: `${formatNumber(Math.abs(lostCustomersDelta), 'عميل')} ${lostCustomersDelta >= 0 ? 'أقل' : 'أكثر'} ${comparisonLabel}`,
      status: resolveMetricStatus('low-is-good', raw.lostCustomers - raw.previousLostCustomers),
      icon: 'person-remove-outline',
      section: 'customers',
      explanation: 'عدد العملاء الذين توقفوا عن الدفع أو ألغوا الاشتراك.',
      formula: 'العملاء الملغون أو غير المجددين خلال الفترة.',
      calculationDescription: 'انخفاض هذا الرقم أفضل لأنه يحافظ على قاعدة العملاء النشطين.',
      sourceValues: [`العملاء المفقودون: ${formatNumber(raw.lostCustomers)}`, `الفترة السابقة: ${formatNumber(raw.previousLostCustomers)}`],
      importance: 'ارتفاعه قد يخفي مشكلة في المنتج أو التسعير أو الدعم.',
      note: 'العملاء المفقودون أقل من الفترة السابقة، لكن راقب أسباب الإلغاء الجديدة.',
      history: toHistory([4, 5, 4, 6, raw.previousLostCustomers, raw.lostCustomers]),
    },
    {
      id: 'churn',
      title: 'معدل إلغاء العملاء',
      abbreviation: 'Churn',
      value: formatPercent(calculated.churnRate),
      rawValue: calculated.churnRate,
      comparison: calculated.churnRate === null ? 'لا توجد بيانات كافية' : `${formatNumber(raw.lostCustomers, 'عملاء')} من ${formatNumber(raw.activeCustomersStart, 'عميل')}`,
      status: resolveMetricStatus('churn', calculated.churnRate),
      icon: 'warning-outline',
      section: 'customers',
      explanation: 'النسبة المئوية للعملاء الذين خرجوا من قاعدة العملاء خلال الفترة.',
      formula: 'العملاء المفقودون ÷ العملاء في بداية الفترة × 100.',
      calculationDescription: 'يتعامل الحساب مع صفر العملاء في بداية الفترة بإرجاع قيمة غير متاحة بدل NaN.',
      sourceValues: [`العملاء المفقودون: ${formatNumber(raw.lostCustomers)}`, `العملاء في بداية الفترة: ${formatNumber(raw.activeCustomersStart)}`],
      importance: 'كل انخفاض في الإلغاء يحسن قيمة العميل والعائد من النمو.',
      note: 'معدل الإلغاء منخفض نسبيًا، لكنه ارتفع قليلًا عن الشهر السابق. راجع أسباب إلغاء العملاء الجدد.',
      history: toHistory([2.1, 2.2, 2, 2.4, 2.4, calculated.churnRate ?? 0]),
    },
    {
      id: 'cac',
      title: 'تكلفة اكتساب العميل',
      abbreviation: 'CAC',
      value: formatSar(calculated.cac),
      rawValue: calculated.cac,
      comparison: 'مصروفات التسويق والمبيعات ÷ العملاء الجدد',
      status: resolveMetricStatus('cac', calculated.cac),
      icon: 'megaphone-outline',
      section: 'efficiency',
      explanation: 'متوسط ما تدفعه لاكتساب عميل جديد واحد.',
      formula: 'مصروفات المبيعات والتسويق ÷ العملاء الجدد.',
      calculationDescription: 'عند عدم وجود عملاء جدد يرجع الحساب قيمة غير متاحة بدل القسمة على صفر.',
      sourceValues: [`مصروفات التسويق والمبيعات: ${formatSar(raw.salesAndMarketingSpend)}`, `العملاء الجدد: ${formatNumber(raw.newCustomers)}`],
      importance: 'إذا زاد بسرعة، قد يصبح النمو أقل كفاءة حتى مع ارتفاع الإيرادات.',
      note: 'تكلفة اكتساب العميل ارتفعت بنسبة 18%. راجع القنوات الأقل تحويلًا قبل زيادة ميزانية التسويق.',
      history: toHistory([1420, 1510, 1580, 1620, 1680, calculated.cac ?? 0]),
    },
    {
      id: 'ltv',
      title: 'قيمة العميل',
      abbreviation: 'LTV',
      value: formatSar(calculated.ltv),
      rawValue: calculated.ltv,
      comparison: formatLtvToCacComparison(calculated.ltvToCacRatio),
      status: ltvStatus,
      icon: 'diamond-outline',
      section: 'efficiency',
      explanation: 'القيمة الإجمالية المتوقعة من العميل طوال فترة بقائه.',
      formula: 'متوسط الإيراد الشهري لكل عميل × هامش الربح الإجمالي ÷ معدل الإلغاء الشهري.',
      calculationDescription: 'يتم حسابها برمجيًا من ARPU والهامش وChurn، ثم تقارن مع CAC.',
      sourceValues: [
        `متوسط الإيراد لكل عميل: ${formatSar(raw.averageRevenuePerCustomer)}`,
        `هامش الربح: ${formatPercent(calculated.grossMargin)}`,
        `Churn: ${formatPercent(calculated.churnRate)}`,
        `CAC: ${formatSar(calculated.cac)}`,
      ],
      importance: 'تساعدك على تحديد سقف صحي لتكلفة الاكتساب واستدامة النمو.',
      note: 'قيمة العميل أعلى من تكلفة اكتسابه، لكن راقب مدة بقاء العميل ومتوسط الإيراد لضمان استدامة النسبة.',
      history: toHistory([6400, 6900, 7400, 7900, 8400, calculated.ltv ?? 0]),
    },
  ];
}

function percentageChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function toHistory(values: readonly number[]): MetricHistoryPoint[] {
  const labels = ['فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'];

  return values.map((value, index) => ({
    label: labels[index] ?? `نقطة ${index + 1}`,
    value: Number.isFinite(value) ? value : 0,
  }));
}

export function isSaaSBusinessModel() {
  return prototypeCompanyProfile.businessModel === 'saas';
}

export function getMetricSectionTitle(section: GrowthMetricDefinition['section']) {
  if (section === 'customers') {
    return 'العملاء';
  }

  if (section === 'efficiency') {
    return 'كفاءة النمو';
  }

  return 'الإيرادات';
}

export function getMetricIds() {
  return ['mrr', 'arr', 'nrr', 'gross-margin', 'new-customers', 'lost-customers', 'churn', 'cac', 'ltv'] as SaaSMetricId[];
}
