import type { Ionicons } from '@expo/vector-icons';

export type SaaSPeriod = 'current-month' | 'three-months' | 'six-months' | 'year';

export type MetricStatus = 'good' | 'watch' | 'intervene';

export type SaaSMetricId =
  | 'mrr'
  | 'arr'
  | 'new-customers'
  | 'lost-customers'
  | 'churn'
  | 'cac'
  | 'ltv'
  | 'nrr'
  | 'gross-margin';

export type SaaSRawMetrics = {
  period: SaaSPeriod;
  periodLabel: string;
  mrr: number;
  previousMrr: number;
  activeCustomersEnd: number;
  activeCustomersStart: number;
  newCustomers: number;
  previousNewCustomers: number;
  lostCustomers: number;
  previousLostCustomers: number;
  salesAndMarketingSpend: number;
  averageRevenuePerCustomer: number;
  beginningMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  revenue: number;
  serviceCost: number;
  revenueTrend: readonly number[];
};

export type CalculatedSaaSMetrics = {
  arr: number | null;
  churnRate: number | null;
  cac: number | null;
  ltv: number | null;
  nrr: number | null;
  grossMargin: number | null;
  ltvToCacRatio: number | null;
};

export type MetricHistoryPoint = {
  label: string;
  value: number;
};

export type GrowthMetricDefinition = {
  id: SaaSMetricId;
  title: string;
  abbreviation: string;
  value: string;
  rawValue: number | null;
  comparison: string;
  status: MetricStatus;
  icon: keyof typeof Ionicons.glyphMap;
  section: 'revenue' | 'customers' | 'efficiency';
  badge?: string;
  sourceDescription?: string;
  explanation: string;
  formula: string;
  calculationDescription: string;
  sourceValues: readonly string[];
  importance: string;
  note: string;
  history: readonly MetricHistoryPoint[];
};
