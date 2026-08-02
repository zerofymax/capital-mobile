import type { Ionicons } from '@expo/vector-icons';

export type FinancialReportPeriod = 'current-month' | 'previous-month' | 'last-3-months' | 'last-6-months' | 'current-year';

export type FinancialReportType = 'income-statement' | 'cash-flow' | 'expense-analysis' | 'financial-trend';

export type FinancialReportStatus = 'profitable' | 'near-break-even' | 'loss';

export type FinancialTransactionKind = 'income' | 'expense';

export type FinancialTransaction = {
  id: string;
  title: string;
  amount: number;
  kind: FinancialTransactionKind;
  category: string;
  categoryId?: string;
  date: string;
  recurring: boolean;
  cashFlow: 'inflow' | 'outflow';
  source: 'manual';
};

export type FinancialComparison = {
  label: string;
  direction: 'up' | 'down' | 'flat' | 'unavailable';
  percentage: number | null;
};

export type IncomeStatementLine = {
  id: string;
  label: string;
  amount: number;
  transactionCount: number;
  comparison: FinancialComparison;
  description?: string;
};

export type IncomeStatement = {
  revenue: IncomeStatementLine[];
  directCosts: IncomeStatementLine[];
  operatingExpenses: IncomeStatementLine[];
  otherIncome: number;
  otherExpenses: number;
  totalRevenue: number;
  totalDirectCosts: number;
  grossProfit: number;
  grossMargin: number | null;
  totalOperatingExpenses: number;
  operatingProfit: number;
  netProfit: number;
  netProfitMargin: number | null;
};

export type CashFlowLine = {
  id: string;
  label: string;
  amount: number;
  transactionCount: number;
  comparison: FinancialComparison;
};

export type CashFlowReport = {
  inflows: CashFlowLine[];
  outflows: CashFlowLine[];
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  status: 'positive' | 'negative' | 'neutral';
};

export type ExpenseCategorySummary = {
  id: string;
  category: string;
  amount: number;
  percentage: number | null;
  comparison: FinancialComparison;
  transactionCount: number;
  status: 'normal' | 'increased' | 'needs-review';
  recurringAmount: number;
};

export type ExpenseCategoryReport = {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number | null;
  topCategory: ExpenseCategorySummary | null;
  categories: ExpenseCategorySummary[];
};

export type MonthlyFinancialTrend = {
  id: string;
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
};

export type FinancialReportSummary = {
  period: FinancialReportPeriod;
  periodLabel: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number | null;
  incomeCount: number;
  expenseCount: number;
  transactionCount: number;
  cashInflows: number;
  cashOutflows: number;
  netCashFlow: number;
  status: FinancialReportStatus;
  revenueComparison: FinancialComparison;
  expensesComparison: FinancialComparison;
  profitComparison: FinancialComparison;
};

export type FinancialReportCard = {
  type: FinancialReportType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type ResolvedFinancialReportData = {
  period: FinancialReportPeriod;
  periodLabel: string;
  previousPeriodLabel: string | null;
  transactions: FinancialTransaction[];
  summary: FinancialReportSummary;
  incomeStatement: IncomeStatement;
  cashFlow: CashFlowReport;
  expenseReport: ExpenseCategoryReport;
  monthlyTrend: MonthlyFinancialTrend[];
  insight: string;
};
