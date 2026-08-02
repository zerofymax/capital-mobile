import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

export const financialTermCategoryIds = ['all', 'basics', 'profitability', 'liquidity', 'saas', 'invoices'] as const;

export type FinancialTermCategoryFilter = (typeof financialTermCategoryIds)[number];
export type FinancialTermCategory = Exclude<FinancialTermCategoryFilter, 'all'>;

export const financialTermIds = [
  'revenue',
  'expenses',
  'profit',
  'loss',
  'net-profit',
  'cash-balance',
  'capital',
  'gross-profit',
  'gross-margin',
  'net-profit-margin',
  'direct-costs',
  'operating-expenses',
  'break-even',
  'recurring-expense',
  'cash-flow',
  'liquidity',
  'burn-rate',
  'runway',
  'budget',
  'cash-inflow',
  'cash-outflow',
  'mrr',
  'arr',
  'arpu',
  'cac',
  'ltv',
  'churn',
  'nrr',
  'invoice-due',
  'accounts-receivable',
  'accounts-payable',
  'due-date',
  'collection',
  'partial-payment',
  'overdue-invoice',
] as const;

export type FinancialTermId = (typeof financialTermIds)[number];

export type FinancialTermDestination = {
  label: string;
  route: Href;
};

export type FinancialTermExample = {
  title: string;
  description: string;
  result?: string;
};

export type FinancialTerm = {
  id: FinancialTermId;
  category: FinancialTermCategory;
  titleAr: string;
  englishName?: string;
  acronym?: string;
  aliases: string[];
  shortDefinition: string;
  simpleExplanation: string;
  founderImportance: string;
  formula?: string;
  formulaExplanation?: string;
  example?: FinancialTermExample;
  interpretation?: string[];
  commonMistake?: string;
  simplerSummary: string;
  relatedTermIds: FinancialTermId[];
  capitalDestination?: FinancialTermDestination;
  icon: keyof typeof Ionicons.glyphMap;
};

export type FinancialTermCategoryDefinition = {
  id: FinancialTermCategoryFilter;
  label: string;
};
