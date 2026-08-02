import type { Ionicons } from '@expo/vector-icons';

export type ReportPeriod = 'month' | 'quarter' | 'year';

export type ReportMetricTone = 'positive' | 'warning' | 'danger';

export type ReportMetric = {
  id: 'revenue' | 'expenses' | 'netProfit' | 'profitMargin';
  label: string;
  value: number;
  format: 'sar' | 'percent';
  trend: string;
  tone: ReportMetricTone;
};

export type ReportChartPoint = {
  id: string;
  label: string;
  revenue: number;
  expenses: number;
};

export type ReportTypeRow = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export type ReportPeriodData = {
  metrics: readonly ReportMetric[];
  chart: readonly ReportChartPoint[];
  summary: string;
};

export const reportPeriodOptions: readonly { id: ReportPeriod; label: string }[] = [
  { id: 'month', label: 'هذا الشهر' },
  { id: 'quarter', label: 'آخر 3 أشهر' },
  { id: 'year', label: 'السنة' },
];

export const reportsByPeriod: Record<ReportPeriod, ReportPeriodData> = {
  month: {
    metrics: [
      { id: 'revenue', label: 'الإيرادات', value: 128400, format: 'sar', trend: '+12% عن السابق', tone: 'positive' },
      { id: 'expenses', label: 'المصروفات', value: 74900, format: 'sar', trend: '+8% عن السابق', tone: 'warning' },
      { id: 'netProfit', label: 'صافي الربح', value: 53500, format: 'sar', trend: '+6.5% عن السابق', tone: 'positive' },
      { id: 'profitMargin', label: 'هامش الربح', value: 41.7, format: 'percent', trend: '-1.2% عن السابق', tone: 'warning' },
    ],
    chart: [
      { id: 'w1', label: 'أسبوع 1', revenue: 28600, expenses: 17100 },
      { id: 'w2', label: 'أسبوع 2', revenue: 31400, expenses: 18400 },
      { id: 'w3', label: 'أسبوع 3', revenue: 33200, expenses: 19600 },
      { id: 'w4', label: 'أسبوع 4', revenue: 35200, expenses: 19800 },
    ],
    summary:
      'أداء نشاطك مستقر هذا الشهر. الإيرادات أعلى من الشهر السابق، لكن المصروفات التشغيلية ارتفعت وتحتاج إلى مراجعة.',
  },
  quarter: {
    metrics: [
      { id: 'revenue', label: 'الإيرادات', value: 362800, format: 'sar', trend: '+18% عن الفترة السابقة', tone: 'positive' },
      { id: 'expenses', label: 'المصروفات', value: 221600, format: 'sar', trend: '+11% عن الفترة السابقة', tone: 'warning' },
      { id: 'netProfit', label: 'صافي الربح', value: 141200, format: 'sar', trend: '+14% عن الفترة السابقة', tone: 'positive' },
      { id: 'profitMargin', label: 'هامش الربح', value: 38.9, format: 'percent', trend: '+2.1% عن الفترة السابقة', tone: 'positive' },
    ],
    chart: [
      { id: 'm1', label: 'مايو', revenue: 108300, expenses: 68900 },
      { id: 'm2', label: 'يونيو', revenue: 126100, expenses: 77800 },
      { id: 'm3', label: 'يوليو', revenue: 128400, expenses: 74900 },
    ],
    summary:
      'خلال آخر 3 أشهر، يظهر نمو جيد في الإيرادات مع تحسن تدريجي في صافي الربح. راقب الاشتراكات والمصاريف المتكررة.',
  },
  year: {
    metrics: [
      { id: 'revenue', label: 'الإيرادات', value: 1486000, format: 'sar', trend: '+24% عن السنة السابقة', tone: 'positive' },
      { id: 'expenses', label: 'المصروفات', value: 947000, format: 'sar', trend: '+19% عن السنة السابقة', tone: 'warning' },
      { id: 'netProfit', label: 'صافي الربح', value: 539000, format: 'sar', trend: '+17% عن السنة السابقة', tone: 'positive' },
      { id: 'profitMargin', label: 'هامش الربح', value: 36.3, format: 'percent', trend: '-2.4% عن السنة السابقة', tone: 'warning' },
    ],
    chart: [
      { id: 'q1', label: 'الربع 1', revenue: 318000, expenses: 207000 },
      { id: 'q2', label: 'الربع 2', revenue: 362800, expenses: 221600 },
      { id: 'q3', label: 'الربع 3', revenue: 389200, expenses: 251400 },
      { id: 'q4', label: 'الربع 4', revenue: 416000, expenses: 267000 },
    ],
    summary:
      'الأداء السنوي إيجابي، لكن هامش الربح يحتاج إلى تحسين عبر تقليل التكاليف الثابتة وزيادة الإيرادات المتكررة.',
  },
};

export const reportTypes: readonly ReportTypeRow[] = [
  {
    id: 'profit-loss',
    icon: 'bar-chart-outline',
    title: 'تقرير الأرباح والخسائر',
    description: 'ملخص الإيرادات والمصروفات وصافي الربح.',
  },
  {
    id: 'cash-flow',
    icon: 'swap-vertical-outline',
    title: 'تقرير التدفق النقدي',
    description: 'حركة النقد الداخل والخارج خلال الفترة.',
  },
  {
    id: 'expenses',
    icon: 'receipt-outline',
    title: 'تقرير المصروفات',
    description: 'تفصيل المصروفات حسب الفئة والتكرار.',
  },
  {
    id: 'revenue',
    icon: 'trending-up-outline',
    title: 'تقرير الإيرادات',
    description: 'مصادر الدخل وأقوى قنوات الإيراد.',
  },
  {
    id: 'taxes',
    icon: 'document-text-outline',
    title: 'تقرير الضرائب',
    description: 'تجهيز مبسط للالتزامات الضريبية القادمة.',
  },
  {
    id: 'monthly-performance',
    icon: 'calendar-outline',
    title: 'تقرير الأداء الشهري',
    description: 'مقارنة شهرية لأهم مؤشرات النشاط.',
  },
];
