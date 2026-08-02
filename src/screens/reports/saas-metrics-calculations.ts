import type { MetricStatus } from './saas-metrics-types';

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }

  const value = numerator / denominator;

  return Number.isFinite(value) ? value : null;
}

export function calculateARR(mrr: number) {
  if (!Number.isFinite(mrr) || mrr < 0) {
    return null;
  }

  return mrr * 12;
}

export function calculateCustomerChurnRate(lostCustomers: number, startingCustomers: number) {
  if (lostCustomers < 0 || startingCustomers < 0) {
    return null;
  }

  const ratio = safeDivide(lostCustomers, startingCustomers);

  return ratio === null ? null : ratio * 100;
}

export function calculateCAC(salesAndMarketingSpend: number, newCustomers: number) {
  if (salesAndMarketingSpend < 0 || newCustomers <= 0) {
    return null;
  }

  return safeDivide(salesAndMarketingSpend, newCustomers);
}

export function calculateLTV(averageRevenuePerCustomer: number, grossMarginPercent: number | null, churnRatePercent: number | null) {
  if (
    grossMarginPercent === null ||
    churnRatePercent === null ||
    averageRevenuePerCustomer < 0 ||
    grossMarginPercent < 0 ||
    churnRatePercent <= 0
  ) {
    return null;
  }

  const churnRatio = churnRatePercent / 100;
  const grossMarginRatio = grossMarginPercent / 100;

  return safeDivide(averageRevenuePerCustomer * grossMarginRatio, churnRatio);
}

export function calculateNRR(beginningMrr: number, expansionMrr: number, contractionMrr: number, churnedMrr: number) {
  if (beginningMrr <= 0 || expansionMrr < 0 || contractionMrr < 0 || churnedMrr < 0) {
    return null;
  }

  const retainedRevenue = beginningMrr + expansionMrr - contractionMrr - churnedMrr;
  const ratio = safeDivide(retainedRevenue, beginningMrr);

  return ratio === null ? null : ratio * 100;
}

export function calculateGrossMargin(revenue: number, serviceCost: number) {
  if (revenue <= 0 || serviceCost < 0) {
    return null;
  }

  const margin = revenue - serviceCost;
  const ratio = safeDivide(margin, revenue);

  return ratio === null ? null : ratio * 100;
}

export function calculateLtvToCacRatio(ltv: number | null, cac: number | null) {
  if (ltv === null || cac === null || ltv <= 0 || cac <= 0) {
    return null;
  }

  return safeDivide(ltv, cac);
}

export function resolveMetricStatus(metric: 'positive' | 'low-is-good' | 'churn' | 'cac' | 'ltv-cac' | 'nrr' | 'gross-margin', value: number | null): MetricStatus {
  if (value === null) {
    return 'watch';
  }

  if (metric === 'low-is-good') {
    return value <= 0 ? 'good' : value <= 9 ? 'watch' : 'intervene';
  }

  if (metric === 'churn') {
    return value <= 2 ? 'good' : value <= 4 ? 'watch' : 'intervene';
  }

  if (metric === 'cac') {
    return value <= 1500 ? 'good' : value <= 2200 ? 'watch' : 'intervene';
  }

  if (metric === 'ltv-cac') {
    return value >= 3 ? 'good' : value >= 2 ? 'watch' : 'intervene';
  }

  if (metric === 'nrr') {
    return value >= 100 ? 'good' : value >= 90 ? 'watch' : 'intervene';
  }

  if (metric === 'gross-margin') {
    return value >= 65 ? 'good' : value >= 50 ? 'watch' : 'intervene';
  }

  return value > 0 ? 'good' : 'watch';
}
