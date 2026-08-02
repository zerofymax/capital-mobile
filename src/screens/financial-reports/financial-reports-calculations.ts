import type { TransactionRecord } from '@/screens/ledger/ledger-data';
import { getCurrencySymbol } from '@/screens/ledger/ledger-data';
import { getCategoryById } from '@/state/categories-state';
import { directionSafeText, formatCurrency } from '@/utils/rtl';
import { getPeriodLabel } from './financial-reports-data';
import type {
  CashFlowLine,
  CashFlowReport,
  ExpenseCategoryReport,
  ExpenseCategorySummary,
  FinancialComparison,
  FinancialReportPeriod,
  FinancialReportStatus,
  FinancialTransaction,
  IncomeStatement,
  IncomeStatementLine,
  MonthlyFinancialTrend,
  ResolvedFinancialReportData,
} from './financial-reports-types';

type ReportRange = {
  startDate: string;
  endDate: string;
};

const unavailableComparison: FinancialComparison = {
  direction: 'unavailable',
  label: 'غير متاح',
  percentage: null,
};

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

export function safeCurrencyValue(value: number | null | undefined) {
  return Number.isFinite(value) ? Math.max(Number(value), 0) : 0;
}

export function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

export function safePercentage(numerator: number, denominator: number) {
  const ratio = safeDivide(numerator, denominator);

  return ratio === null ? null : ratio * 100;
}

export function calculatePercentageChange(current: number, previous: number | null | undefined): FinancialComparison {
  const currentValue = Number.isFinite(current) ? Number(current) : 0;
  const previousValue = typeof previous === 'number' && Number.isFinite(previous) ? previous : null;

  if (previousValue === null) {
    return unavailableComparison;
  }

  if (previousValue === 0) {
    if (currentValue === 0) {
      return { direction: 'flat', label: 'دون تغيير', percentage: 0 };
    }

    return { direction: 'up', label: 'جديد', percentage: null };
  }

  const percentage = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;

  if (!Number.isFinite(percentage)) {
    return unavailableComparison;
  }

  const rounded = Math.round(percentage * 10) / 10;

  if (Math.abs(rounded) < 0.1) {
    return { direction: 'flat', label: 'دون تغيير', percentage: 0 };
  }

  return {
    direction: rounded > 0 ? 'up' : 'down',
    label: `${rounded > 0 ? 'ارتفع' : 'انخفض'} ${Math.abs(rounded).toLocaleString('en-US')}%`,
    percentage: Math.abs(rounded),
  };
}

export function resolveLineComparison(current: number, previous: number | null | undefined, hasReliableHistory: boolean): FinancialComparison {
  if (!hasReliableHistory) {
    return unavailableComparison;
  }

  return calculatePercentageChange(current, previous);
}

export function calculateTotalRevenue(lines: readonly Pick<IncomeStatementLine, 'amount'>[]) {
  return sumAmounts(lines);
}

export function calculateDirectCosts(lines: readonly Pick<IncomeStatementLine, 'amount'>[]) {
  return sumAmounts(lines);
}

export function calculateGrossProfit(totalRevenue: number, directCosts: number) {
  return safeCurrencyValue(totalRevenue) - safeCurrencyValue(directCosts);
}

export function calculateGrossMargin(grossProfit: number, totalRevenue: number) {
  return safePercentage(grossProfit, totalRevenue);
}

export function calculateOperatingExpenses(lines: readonly Pick<IncomeStatementLine, 'amount'>[]) {
  return sumAmounts(lines);
}

export function calculateOperatingProfit(grossProfit: number, operatingExpenses: number) {
  return safeCurrencyValue(grossProfit) - safeCurrencyValue(operatingExpenses);
}

export function calculateNetProfit(operatingProfit: number, otherIncome: number, otherExpenses: number) {
  return operatingProfit + safeCurrencyValue(otherIncome) - safeCurrencyValue(otherExpenses);
}

export function calculateNetProfitMargin(netProfit: number, totalRevenue: number) {
  return safePercentage(netProfit, totalRevenue);
}

export function calculateCashInflows(lines: readonly Pick<CashFlowLine, 'amount'>[]) {
  return sumAmounts(lines);
}

export function calculateCashOutflows(lines: readonly Pick<CashFlowLine, 'amount'>[]) {
  return sumAmounts(lines);
}

export function calculateNetCashFlow(inflows: number, outflows: number) {
  return safeCurrencyValue(inflows) - safeCurrencyValue(outflows);
}

export function resolveFinancialReportData(period: FinancialReportPeriod, sourceTransactions: readonly TransactionRecord[]): ResolvedFinancialReportData {
  const range = getFinancialReportRange(period);
  const previousRange = getPreviousFinancialReportRange(period);
  const transactions = resolveReportTransactions(sourceTransactions, period);
  const previousTransactions = previousRange ? filterTransactionsByRange(sourceTransactions, previousRange).map(toFinancialTransaction) : [];
  const incomeStatement = buildIncomeStatement(transactions, previousTransactions);
  const cashFlow = buildCashFlowReport(transactions, previousTransactions);
  const expenseReport = buildExpenseCategoryReport(transactions, previousTransactions);
  const totalExpenses = incomeStatement.totalOperatingExpenses;
  const incomeCount = transactions.filter((transaction) => transaction.kind === 'income').length;
  const expenseCount = transactions.filter((transaction) => transaction.kind === 'expense').length;
  const previousIncomeStatement = previousRange ? buildIncomeStatement(previousTransactions, []) : null;
  const summary = {
    period,
    periodLabel: getPeriodLabel(period),
    totalRevenue: incomeStatement.totalRevenue,
    totalExpenses,
    netProfit: incomeStatement.netProfit,
    netProfitMargin: incomeStatement.netProfitMargin,
    incomeCount,
    expenseCount,
    transactionCount: transactions.length,
    cashInflows: cashFlow.totalInflows,
    cashOutflows: cashFlow.totalOutflows,
    netCashFlow: cashFlow.netCashFlow,
    status: resolveFinancialStatus(incomeStatement.netProfit, incomeStatement.totalRevenue),
    revenueComparison: calculatePercentageChange(incomeStatement.totalRevenue, previousIncomeStatement?.totalRevenue),
    expensesComparison: calculatePercentageChange(totalExpenses, previousIncomeStatement?.totalOperatingExpenses),
    profitComparison: calculatePercentageChange(incomeStatement.netProfit, previousIncomeStatement?.netProfit),
  };

  return {
    period,
    periodLabel: getPeriodLabel(period),
    previousPeriodLabel: previousRange ? formatRangeLabel(previousRange) : null,
    transactions,
    summary,
    incomeStatement,
    cashFlow,
    expenseReport,
    monthlyTrend: createMonthlyTrend(sourceTransactions, range),
    insight: createSummaryInsight(summary.netProfit, summary.netProfitMargin, summary.periodLabel, summary.transactionCount),
  };
}

export function buildFinancialReportShareText(report: ResolvedFinancialReportData) {
  const topExpenses = report.expenseReport.categories.slice(0, 3);
  const lines = [
    `ملخص Capital المالي — ${report.periodLabel}`,
    '',
    `الدخل: ${formatSar(report.summary.totalRevenue)}`,
    `المصروفات: ${formatSar(report.summary.totalExpenses)}`,
    `الصافي التشغيلي: ${formatSignedSar(report.summary.netProfit)}`,
    `هامش الصافي التشغيلي: ${formatPercent(report.summary.netProfitMargin)}`,
    `صافي التدفق التشغيلي المحلي: ${formatSignedSar(report.summary.netCashFlow)}`,
  ];

  if (topExpenses.length > 0) {
    lines.push('', 'أكبر المصروفات:');
    topExpenses.forEach((expense) => {
      lines.push(`• ${expense.category}: ${formatSar(expense.amount)}`);
    });
  }

  lines.push('', 'ملاحظة:', report.insight);

  return lines.map((line) => directionSafeText(line)).join('\n').replace(/\b(undefined|NaN|Infinity)\b/g, 'غير متاح');
}

export function formatSar(value: number | null | undefined) {
  if (!Number.isFinite(value)) {
    return 'غير متاح';
  }

  return directionSafeText(formatCurrency(Math.round(Number(value)), getCurrencySymbol()));
}

export function formatSignedSar(value: number | null | undefined) {
  if (!Number.isFinite(value)) {
    return 'غير متاح';
  }

  const safeValue = Number(value);
  const sign = safeValue > 0 ? '+' : safeValue < 0 ? '-' : '';

  return directionSafeText(`${sign}${formatCurrency(Math.round(Math.abs(safeValue)), getCurrencySymbol())}`);
}

export function formatPercent(value: number | null | undefined) {
  if (!Number.isFinite(value)) {
    return 'غير متاح';
  }

  return directionSafeText(`${(Math.round(Number(value) * 10) / 10).toLocaleString('en-US')}%`);
}

export function formatComparison(comparison: FinancialComparison) {
  return directionSafeText(comparison.label);
}

function buildIncomeStatement(transactions: readonly FinancialTransaction[], previousTransactions: readonly FinancialTransaction[]): IncomeStatement {
  const revenue = aggregateTransactionLines(transactions, previousTransactions, 'income');
  const operatingExpenses = aggregateTransactionLines(transactions, previousTransactions, 'expense');
  const totalRevenue = calculateTotalRevenue(revenue);
  const totalOperatingExpenses = calculateOperatingExpenses(operatingExpenses);
  const operatingProfit = totalRevenue - totalOperatingExpenses;
  const netProfit = operatingProfit;
  const netProfitMargin = calculateNetProfitMargin(netProfit, totalRevenue);

  return {
    revenue,
    directCosts: [],
    operatingExpenses,
    otherIncome: 0,
    otherExpenses: 0,
    totalRevenue,
    totalDirectCosts: 0,
    grossProfit: totalRevenue,
    grossMargin: totalRevenue > 0 ? 100 : null,
    totalOperatingExpenses,
    operatingProfit,
    netProfit,
    netProfitMargin,
  };
}

function buildCashFlowReport(transactions: readonly FinancialTransaction[], previousTransactions: readonly FinancialTransaction[]): CashFlowReport {
  const inflows = aggregateCashLines(transactions, previousTransactions, 'income');
  const outflows = aggregateCashLines(transactions, previousTransactions, 'expense');
  const totalInflows = calculateCashInflows(inflows);
  const totalOutflows = calculateCashOutflows(outflows);
  const netCashFlow = calculateNetCashFlow(totalInflows, totalOutflows);

  return {
    inflows,
    outflows,
    totalInflows,
    totalOutflows,
    netCashFlow,
    status: netCashFlow > 0 ? 'positive' : netCashFlow < 0 ? 'negative' : 'neutral',
  };
}

function buildExpenseCategoryReport(
  transactions: readonly FinancialTransaction[],
  previousTransactions: readonly FinancialTransaction[],
): ExpenseCategoryReport {
  const categories = aggregateExpenseCategories(transactions, previousTransactions);
  const totalExpenses = categories.reduce((sum, category) => sum + category.amount, 0);
  const expenseCount = categories.reduce((sum, category) => sum + category.transactionCount, 0);

  return {
    totalExpenses,
    expenseCount,
    averageExpense: expenseCount > 0 ? totalExpenses / expenseCount : null,
    topCategory: categories[0] ?? null,
    categories,
  };
}

function aggregateTransactionLines(
  transactions: readonly FinancialTransaction[],
  previousTransactions: readonly FinancialTransaction[],
  kind: 'income' | 'expense',
): IncomeStatementLine[] {
  const previousByCategory = groupAmountsByCategory(previousTransactions.filter((transaction) => transaction.kind === kind));

  return Array.from(groupFinancialTransactions(transactions.filter((transaction) => transaction.kind === kind)).values())
    .map((line) => ({
      ...line,
      comparison: resolveLineComparison(line.amount, previousByCategory.get(line.id), previousByCategory.has(line.id)),
    }))
    .sort((first, second) => second.amount - first.amount);
}

function aggregateCashLines(
  transactions: readonly FinancialTransaction[],
  previousTransactions: readonly FinancialTransaction[],
  kind: 'income' | 'expense',
): CashFlowLine[] {
  const previousByCategory = groupAmountsByCategory(previousTransactions.filter((transaction) => transaction.kind === kind));

  return Array.from(groupFinancialTransactions(transactions.filter((transaction) => transaction.kind === kind)).values())
    .map((line) => ({
      ...line,
      comparison: calculatePercentageChange(line.amount, previousByCategory.get(line.id)),
    }))
    .sort((first, second) => second.amount - first.amount);
}

function aggregateExpenseCategories(
  transactions: readonly FinancialTransaction[],
  previousTransactions: readonly FinancialTransaction[],
): ExpenseCategorySummary[] {
  const expenseTransactions = transactions.filter((transaction) => transaction.kind === 'expense');
  const previousByCategory = groupAmountsByCategory(previousTransactions.filter((transaction) => transaction.kind === 'expense'));
  const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + safeCurrencyValue(transaction.amount), 0);

  return Array.from(groupFinancialTransactions(expenseTransactions).values())
    .map((line) => ({
      id: line.id,
      category: line.label,
      amount: line.amount,
      percentage: safePercentage(line.amount, totalExpenses),
      comparison: resolveLineComparison(line.amount, previousByCategory.get(line.id), previousByCategory.has(line.id)),
      transactionCount: line.transactionCount,
      status: (line.amount > totalExpenses * 0.35 ? 'increased' : 'normal') as ExpenseCategorySummary['status'],
      recurringAmount: 0,
    }))
    .sort((first, second) => second.amount - first.amount);
}

function groupFinancialTransactions(transactions: readonly FinancialTransaction[]) {
  const grouped = new Map<string, { id: string; label: string; amount: number; transactionCount: number }>();

  transactions.forEach((transaction) => {
    const existing = grouped.get(transaction.categoryId ?? transaction.category);
    const amount = (existing?.amount ?? 0) + safeCurrencyValue(transaction.amount);
    const transactionCount = (existing?.transactionCount ?? 0) + 1;

    grouped.set(transaction.categoryId ?? transaction.category, {
      id: transaction.categoryId ?? transaction.category,
      label: transaction.category,
      amount,
      transactionCount,
    });
  });

  return grouped;
}

function groupAmountsByCategory(transactions: readonly FinancialTransaction[]) {
  const grouped = new Map<string, number>();

  transactions.forEach((transaction) => {
    const categoryId = transaction.categoryId ?? transaction.category;
    grouped.set(categoryId, (grouped.get(categoryId) ?? 0) + safeCurrencyValue(transaction.amount));
  });

  return grouped;
}

function createMonthlyTrend(transactions: readonly TransactionRecord[], range: ReportRange): MonthlyFinancialTrend[] {
  return enumerateMonths(range).map((month) => {
    const monthRange = getMonthRange(month.year, month.monthIndex);
    const monthTransactions = filterTransactionsByRange(transactions, {
      startDate: maxIsoDate(monthRange.startDate, range.startDate),
      endDate: minIsoDate(monthRange.endDate, range.endDate),
    });
    const income = monthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + safeCurrencyValue(transaction.amount), 0);
    const expenses = monthTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + safeCurrencyValue(transaction.amount), 0);

    return {
      id: `${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}`,
      month: arabicMonthNames[month.monthIndex] ?? `${month.monthIndex + 1}`,
      revenue: income,
      expenses,
      netProfit: income - expenses,
    };
  });
}

function resolveReportTransactions(sourceTransactions: readonly TransactionRecord[], period: FinancialReportPeriod): FinancialTransaction[] {
  return filterTransactionsByRange(sourceTransactions, getFinancialReportRange(period)).map(toFinancialTransaction);
}

function filterTransactionsByRange(transactions: readonly TransactionRecord[], range: ReportRange) {
  return transactions.filter((transaction) => {
    const date = normalizeIsoDate(transaction.transactionDate);

    return date !== null && date >= range.startDate && date <= range.endDate && transaction.source === 'manual';
  });
}

function toFinancialTransaction(transaction: TransactionRecord): FinancialTransaction {
  const category = getCategoryById(transaction.categoryId);

  return {
    id: transaction.id,
    title: transaction.description,
    amount: safeCurrencyValue(transaction.amount),
    kind: transaction.type,
    category: category?.name ?? 'تصنيف غير متاح',
    categoryId: transaction.categoryId,
    date: normalizeIsoDate(transaction.transactionDate) ?? formatLocalIsoDate(new Date()),
    recurring: false,
    cashFlow: transaction.type === 'income' ? 'inflow' : 'outflow',
    source: 'manual',
  };
}

function getFinancialReportRange(period: FinancialReportPeriod): ReportRange {
  const today = new Date();

  if (period === 'previous-month') {
    return getRelativeMonthRange(today, -1, -1);
  }

  if (period === 'last-3-months') {
    return {
      startDate: getRelativeMonthRange(today, -2, -2).startDate,
      endDate: formatLocalIsoDate(today),
    };
  }

  if (period === 'last-6-months') {
    return {
      startDate: getRelativeMonthRange(today, -5, -5).startDate,
      endDate: formatLocalIsoDate(today),
    };
  }

  if (period === 'current-year') {
    return { startDate: `${today.getFullYear()}-01-01`, endDate: formatLocalIsoDate(today) };
  }

  return {
    startDate: formatLocalIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatLocalIsoDate(today),
  };
}

function getPreviousFinancialReportRange(period: FinancialReportPeriod): ReportRange | null {
  const today = new Date();

  if (period === 'current-month') {
    return getRelativeMonthRange(today, -1, -1);
  }

  if (period === 'previous-month') {
    return getRelativeMonthRange(today, -2, -2);
  }

  if (period === 'last-3-months') {
    return getRelativeMonthRange(today, -5, -3);
  }

  if (period === 'last-6-months') {
    return getRelativeMonthRange(today, -11, -6);
  }

  if (period === 'current-year') {
    const previousYear = today.getFullYear() - 1;
    return { startDate: `${previousYear}-01-01`, endDate: `${previousYear}-12-31` };
  }

  return null;
}

function enumerateMonths(range: ReportRange) {
  const startParts = parseIsoDateParts(range.startDate);
  const endParts = parseIsoDateParts(range.endDate);

  if (!startParts || !endParts) {
    return [];
  }

  const months: { year: number; monthIndex: number }[] = [];
  let cursorYear = startParts.year;
  let cursorMonthIndex = startParts.month - 1;
  const endKey = endParts.year * 12 + (endParts.month - 1);

  while (cursorYear * 12 + cursorMonthIndex <= endKey) {
    months.push({ year: cursorYear, monthIndex: cursorMonthIndex });
    cursorMonthIndex += 1;

    if (cursorMonthIndex > 11) {
      cursorMonthIndex = 0;
      cursorYear += 1;
    }
  }

  return months;
}

function getMonthRange(year: number, monthIndex: number): ReportRange {
  return {
    startDate: `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`,
    endDate: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(new Date(year, monthIndex + 1, 0).getDate()).padStart(2, '0')}`,
  };
}

function getRelativeMonthRange(referenceDate: Date, startOffset: number, endOffset: number): ReportRange {
  const safeReference = Number.isFinite(referenceDate.getTime()) ? referenceDate : new Date();
  const start = new Date(safeReference.getFullYear(), safeReference.getMonth() + startOffset, 1);
  const end = new Date(safeReference.getFullYear(), safeReference.getMonth() + endOffset + 1, 0);

  return {
    startDate: formatLocalIsoDate(start),
    endDate: formatLocalIsoDate(end),
  };
}

function formatLocalIsoDate(date: Date) {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatRangeLabel(range: ReportRange) {
  const start = parseIsoDateParts(range.startDate);
  const end = parseIsoDateParts(range.endDate);

  if (!start || !end) {
    return 'غير متاح';
  }

  if (start.year === end.year && start.month === end.month) {
    return `${arabicMonthNames[start.month - 1]} ${start.year}`;
  }

  return `${arabicMonthNames[start.month - 1]} ${start.year} - ${arabicMonthNames[end.month - 1]} ${end.year}`;
}

function normalizeIsoDate(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseIsoDateParts(value: string) {
  const normalized = normalizeIsoDate(value);

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const yearValue = match[1];
  const monthValue = match[2];
  const dayValue = match[3];

  if (!yearValue || !monthValue || !dayValue) {
    return null;
  }

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return { year, month, day };
}

function maxIsoDate(first: string, second: string) {
  return first > second ? first : second;
}

function minIsoDate(first: string, second: string) {
  return first < second ? first : second;
}

function resolveFinancialStatus(netProfit: number, totalRevenue: number): FinancialReportStatus {
  if (netProfit < 0) {
    return 'loss';
  }

  if (totalRevenue === 0 || Math.abs(netProfit) <= Math.max(totalRevenue * 0.02, 1)) {
    return 'near-break-even';
  }

  return 'profitable';
}

function createSummaryInsight(netProfit: number, netProfitMargin: number | null, periodLabel: string, transactionCount: number) {
  if (transactionCount === 0) {
    return `لا توجد عمليات مسجلة خلال ${periodLabel}. أضف عمليات يدوية لتظهر التقارير المالية.`;
  }

  if (netProfit < 0) {
    return `الصافي التشغيلي سلبي خلال ${periodLabel}. راجع المصروفات الأعلى قبل زيادة الالتزامات.`;
  }

  if (netProfitMargin !== null && netProfitMargin <= 2) {
    return `الأداء قريب من التعادل خلال ${periodLabel}. أي زيادة بسيطة في المصروفات قد تجعل الصافي التشغيلي سالبًا.`;
  }

  return `سجلت العمليات اليدوية صافيًا تشغيليًا قدره ${formatSignedSar(netProfit)} خلال ${periodLabel}، وبلغ هامش الصافي التشغيلي ${formatPercent(netProfitMargin)}.`;
}

function sumAmounts(lines: readonly Pick<IncomeStatementLine | CashFlowLine, 'amount'>[]) {
  return lines.reduce((sum, line) => sum + safeCurrencyValue(line.amount), 0);
}
