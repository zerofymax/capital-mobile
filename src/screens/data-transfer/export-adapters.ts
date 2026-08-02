import { getInvoiceSubtotal } from '@/screens/invoices/invoice-utils';
import type { Invoice } from '@/screens/invoices/invoices-data';
import { budgetCategories, type Budget } from '@/screens/budgets/budgets-data';
import type { FinancialGoal } from '@/screens/goals/goals-data';
import { goalTypes } from '@/screens/goals/goals-data';
import type { RecurringExpense } from '@/screens/recurring-expenses/recurring-expenses-types';
import { resolveFinancialReportData } from '@/screens/financial-reports/financial-reports-calculations';
import type { FinancialReportPeriod } from '@/screens/financial-reports/financial-reports-types';
import { getTransactions } from '@/screens/ledger/ledger-data';

import { collectHeaders, serializeCsv } from './csv-serializer';
import type {
  CsvExportRow,
  DataExportPreview,
  ExportDatasetSummary,
  ExportDatasetType,
  ExportPeriod,
} from './data-transfer-types';

const datasetLabels: Record<ExportDatasetType, string> = {
  transactions: 'العمليات',
  invoices: 'الفواتير',
  recurring_expenses: 'المصروفات المتكررة',
  budgets: 'الميزانيات',
  goals: 'الأهداف',
  milestones: 'المراحل',
  financial_summary: 'ملخص التقارير المالية',
};

const prototypeToday = new Date(2026, 6, 26);

type BuildExportInput = {
  selectedDatasets: readonly ExportDatasetType[];
  period: ExportPeriod;
  invoices: readonly Invoice[];
  recurringExpenses: readonly RecurringExpense[];
  budgets: readonly Budget[];
  goals: readonly FinancialGoal[];
};

export function buildDataExportPreview(input: BuildExportInput): DataExportPreview {
  const rowsByDataset = input.selectedDatasets.map((dataset) => ({
    dataset,
    rows: buildDatasetRows(dataset, input),
  }));
  const rows = rowsByDataset.flatMap(({ rows }) => rows);
  const multipleDatasets = input.selectedDatasets.length > 1;
  const exportRows = multipleDatasets ? rows.map((row) => row) : rows.map(({ dataset: _dataset, ...row }) => row);
  const headers = multipleDatasets ? ['dataset', ...collectHeaders(exportRows).filter((header) => header !== 'dataset')] : collectHeaders(exportRows);
  const summaries: ExportDatasetSummary[] = rowsByDataset.map(({ dataset, rows: datasetRows }) => ({
    dataset,
    label: datasetLabels[dataset],
    rowCount: datasetRows.length,
  }));
  const createdAt = '2026-07-26';
  const fileName = `capital-export-${createdAt}.csv`;

  return {
    fileName,
    createdAt,
    rows: exportRows,
    previewRows: exportRows.slice(0, 5),
    summaries,
    csvText: exportRows.length > 0 ? serializeCsv(exportRows, headers) : '',
  };
}

function buildDatasetRows(dataset: ExportDatasetType, input: BuildExportInput): CsvExportRow[] {
  switch (dataset) {
    case 'transactions':
      return buildTransactionRows(input.period);
    case 'invoices':
      return input.invoices.filter((invoice) => isWithinExportPeriod(normalizeDate(invoice.issueDate), input.period)).map(mapInvoiceToRow);
    case 'recurring_expenses':
      return input.recurringExpenses
        .filter((expense) => isWithinExportPeriod(normalizeDate(expense.nextDueDate ?? expense.startDate), input.period))
        .map(mapRecurringExpenseToRow);
    case 'budgets':
      return input.budgets.map(mapBudgetToRow);
    case 'goals':
      return input.goals.map(mapGoalToRow);
    case 'milestones':
      return input.goals.flatMap(mapGoalMilestonesToRows);
    case 'financial_summary':
      return [mapFinancialSummaryToRow(input.period)];
    default:
      return [];
  }
}

function buildTransactionRows(period: ExportPeriod): CsvExportRow[] {
  const reportPeriod = mapExportPeriodToReportPeriod(period);
  const report = resolveFinancialReportData(reportPeriod, getTransactions());

  return report.transactions.map((transaction) => ({
    dataset: 'transactions',
    id: transaction.id,
    date: normalizeDate(transaction.date),
    type: transaction.kind,
    description: transaction.title,
    amount: safeNumber(transaction.amount),
    currency: 'SAR',
    category: transaction.category,
    reference: '',
    notes: transaction.recurring ? 'recurring' : '',
  }));
}

function mapInvoiceToRow(invoice: Invoice): CsvExportRow {
  const total = getInvoiceSubtotal(invoice) - invoice.discount + invoice.tax;

  return {
    dataset: 'invoices',
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    customer: invoice.clientName,
    issue_date: normalizeDate(invoice.issueDate),
    due_date: normalizeDate(invoice.dueDate),
    total: safeNumber(total),
    paid: safeNumber(invoice.paid),
    remaining: safeNumber(total - invoice.paid),
    status: invoice.status,
    currency: 'SAR',
  };
}

function mapRecurringExpenseToRow(expense: RecurringExpense): CsvExportRow {
  return {
    dataset: 'recurring_expenses',
    id: expense.id,
    name: expense.name,
    vendor: expense.vendor,
    category: expense.categoryId,
    amount: safeNumber(expense.amount),
    frequency: expense.frequency,
    next_due_date: normalizeDate(expense.nextDueDate),
    status: expense.status,
    payment_method: expense.paymentMethod,
    needs_review: expense.needsReview,
  };
}

function mapBudgetToRow(budget: Budget): CsvExportRow {
  const category = budgetCategories.find((item) => item.id === budget.categoryId);

  return {
    dataset: 'budgets',
    id: budget.id,
    period: budget.month,
    category: category?.name ?? budget.categoryId,
    budget_amount: safeNumber(budget.budget),
    spent_amount: safeNumber(budget.spent),
    remaining_amount: safeNumber(budget.budget - budget.spent),
    status: budget.spent > budget.budget ? 'over_limit' : 'within_budget',
  };
}

function mapGoalToRow(goal: FinancialGoal): CsvExportRow {
  const goalType = goalTypes.find((type) => type.id === goal.typeId);

  return {
    dataset: 'goals',
    record_type: 'goal',
    goal_id: goal.id,
    title: goal.name,
    category: goalType?.name ?? goal.typeId,
    status: goal.status,
    current_value: safeNumber(goal.currentAmount),
    target_value: safeNumber(goal.targetAmount),
    start_date: normalizeDate(goal.startDate),
    target_date: normalizeDate(goal.targetDate),
    budget: '',
    spent: '',
    parent_goal_id: '',
  };
}

function mapGoalMilestonesToRows(goal: FinancialGoal): CsvExportRow[] {
  return goal.contributions.map((contribution) => ({
    dataset: 'milestones',
    record_type: 'milestone',
    goal_id: contribution.id,
    title: contribution.title,
    category: contribution.source,
    status: 'completed',
    current_value: safeNumber(contribution.amount),
    target_value: '',
    start_date: normalizeDate(contribution.date),
    target_date: normalizeDate(contribution.date),
    budget: '',
    spent: safeNumber(contribution.amount),
    parent_goal_id: goal.id,
  }));
}

function mapFinancialSummaryToRow(period: ExportPeriod): CsvExportRow {
  const report = resolveFinancialReportData(mapExportPeriodToReportPeriod(period), getTransactions());

  return {
    dataset: 'financial_summary',
    period: report.periodLabel,
    total_revenue: safeNumber(report.summary.totalRevenue),
    total_expenses: safeNumber(report.summary.totalExpenses),
    net_profit: safeNumber(report.summary.netProfit),
    net_profit_margin: safeNumber(report.summary.netProfitMargin),
    cash_inflows: safeNumber(report.summary.cashInflows),
    cash_outflows: safeNumber(report.summary.cashOutflows),
    net_cash_flow: safeNumber(report.summary.netCashFlow),
    currency: 'SAR',
  };
}

function mapExportPeriodToReportPeriod(period: ExportPeriod): FinancialReportPeriod {
  switch (period) {
    case 'previous-month':
      return 'previous-month';
    case 'last-3-months':
      return 'last-3-months';
    case 'last-6-months':
      return 'last-6-months';
    case 'current-year':
    case 'all':
      return 'current-year';
    case 'current-month':
    default:
      return 'current-month';
  }
}

function getExportPeriodRange(period: ExportPeriod) {
  switch (period) {
    case 'current-month':
      return monthRange(prototypeToday.getFullYear(), prototypeToday.getMonth());
    case 'previous-month':
      return monthRange(prototypeToday.getFullYear(), prototypeToday.getMonth() - 1);
    case 'last-3-months':
      return rollingMonthRange(3);
    case 'last-6-months':
      return rollingMonthRange(6);
    case 'current-year':
      return {
        start: new Date(prototypeToday.getFullYear(), 0, 1),
        end: new Date(prototypeToday.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case 'all':
    default:
      return null;
  }
}

function monthRange(year: number, monthIndex: number) {
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
  };
}

function rollingMonthRange(monthCount: number) {
  const startMonth = prototypeToday.getMonth() - monthCount + 1;

  return {
    start: new Date(prototypeToday.getFullYear(), startMonth, 1),
    end: new Date(prototypeToday.getFullYear(), prototypeToday.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

function isWithinExportPeriod(dateValue: string, period: ExportPeriod) {
  const range = getExportPeriodRange(period);

  if (!range) {
    return true;
  }

  const date = parseLocalIsoDate(dateValue);

  if (!date) {
    return true;
  }

  return date >= range.start && date <= range.end;
}

function parseLocalIsoDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function safeNumber(value: number | null | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function normalizeDate(value: string | undefined) {
  if (!value) {
    return '';
  }

  const isoMatch = value.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    return isoMatch[0];
  }

  const normalized = value.replace('اليوم،', '').trim();
  const [dayText, monthText, yearText] = normalized.split(/\s+/);
  const month = monthText ? arabicMonthToNumber(monthText) : null;
  const day = Number(dayText);
  const year = Number(yearText);

  if (Number.isFinite(day) && Number.isFinite(year) && month !== null) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return value;
}

function arabicMonthToNumber(month: string) {
  const months: Record<string, number> = {
    يناير: 1,
    فبراير: 2,
    مارس: 3,
    أبريل: 4,
    ابريل: 4,
    مايو: 5,
    يونيو: 6,
    يوليو: 7,
    أغسطس: 8,
    اغسطس: 8,
    سبتمبر: 9,
    أكتوبر: 10,
    اكتوبر: 10,
    نوفمبر: 11,
    ديسمبر: 12,
  };

  return months[month] ?? null;
}
