import { startupReportSummary } from '@/screens/reports/startup-report-data';
import type {
  CustomRecurringInterval,
  RecurringExpense,
  RecurringExpenseStatus,
  RecurringFrequency,
} from './recurring-expenses-types';

export const prototypeToday = '2026-07-25';

const dayMs = 24 * 60 * 60 * 1000;

export function isFinitePositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function calculateMonthlyEquivalent(
  amount: number,
  frequency: RecurringFrequency,
  customInterval?: CustomRecurringInterval,
) {
  if (!isFinitePositiveNumber(amount)) {
    return 0;
  }

  switch (frequency) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'monthly':
      return amount;
    case 'bimonthly':
      return amount / 2;
    case 'quarterly':
      return amount / 3;
    case 'semiannual':
      return amount / 6;
    case 'annual':
      return amount / 12;
    case 'custom':
      if (!customInterval || !isFinitePositiveNumber(customInterval.value)) {
        return 0;
      }
      if (customInterval.unit === 'days') {
        return (amount * 365) / 12 / customInterval.value;
      }
      return amount / customInterval.value;
    default:
      return 0;
  }
}

export function calculateAnnualEquivalent(
  amount: number,
  frequency: RecurringFrequency,
  customInterval?: CustomRecurringInterval,
) {
  return calculateMonthlyEquivalent(amount, frequency, customInterval) * 12;
}

export function calculateNextDueDate(date: string, frequency: RecurringFrequency, customInterval?: CustomRecurringInterval) {
  const current = parseIsoDate(date);

  if (!current) {
    return undefined;
  }

  if (frequency === 'weekly') {
    return formatIsoDate(addDays(current, 7));
  }

  if (frequency === 'monthly') {
    return formatIsoDate(addMonthsClamped(current, 1));
  }

  if (frequency === 'bimonthly') {
    return formatIsoDate(addMonthsClamped(current, 2));
  }

  if (frequency === 'quarterly') {
    return formatIsoDate(addMonthsClamped(current, 3));
  }

  if (frequency === 'semiannual') {
    return formatIsoDate(addMonthsClamped(current, 6));
  }

  if (frequency === 'annual') {
    return formatIsoDate(addMonthsClamped(current, 12));
  }

  if (frequency === 'custom' && customInterval && isFinitePositiveNumber(customInterval.value)) {
    return formatIsoDate(
      customInterval.unit === 'days'
        ? addDays(current, customInterval.value)
        : addMonthsClamped(current, customInterval.value),
    );
  }

  return undefined;
}

export function calculateDaysUntilDue(date?: string, baseDate = prototypeToday) {
  const due = parseIsoDate(date);
  const base = parseIsoDate(baseDate);

  if (!due || !base) {
    return null;
  }

  return Math.round((due.getTime() - base.getTime()) / dayMs);
}

export function calculateMonthlyRecurringTotal(expenses: readonly RecurringExpense[]) {
  return expenses.reduce((sum, expense) => {
    if (expense.status !== 'active') {
      return sum;
    }

    return sum + calculateMonthlyEquivalent(expense.amount, expense.frequency, expense.customInterval);
  }, 0);
}

export function calculateAnnualRecurringTotal(expenses: readonly RecurringExpense[]) {
  return expenses.reduce((sum, expense) => {
    if (expense.status !== 'active') {
      return sum;
    }

    return sum + calculateAnnualEquivalent(expense.amount, expense.frequency, expense.customInterval);
  }, 0);
}

export function calculateUpcomingAmount(expenses: readonly RecurringExpense[], days: number) {
  return expenses.reduce((sum, expense) => {
    const remainingDays = calculateDaysUntilDue(expense.nextDueDate);

    if (expense.status !== 'active' || remainingDays === null || remainingDays < 0 || remainingDays > days) {
      return sum;
    }

    return sum + (isFinitePositiveNumber(expense.amount) ? expense.amount : 0);
  }, 0);
}

export function calculateRecurringExpenseShareOfBurn(monthlyRecurringTotal: number, monthlyBurn = startupReportSummary.monthlyBurn) {
  if (!isFinitePositiveNumber(monthlyRecurringTotal) || !isFinitePositiveNumber(monthlyBurn)) {
    return null;
  }

  return Math.round((monthlyRecurringTotal / monthlyBurn) * 100);
}

export function calculatePotentialMonthlySavings(expenses: readonly RecurringExpense[]) {
  return expenses.reduce((sum, expense) => {
    if (!expense.needsReview || expense.status !== 'active' || !expense.monthlySavingOpportunity) {
      return sum;
    }

    return sum + (isFinitePositiveNumber(expense.monthlySavingOpportunity) ? expense.monthlySavingOpportunity : 0);
  }, 0);
}

export function resolveRecurringExpenseStatus(expense: RecurringExpense): RecurringExpenseStatus {
  return expense.status;
}

export function formatFrequencyLabel(frequency: RecurringFrequency, customInterval?: CustomRecurringInterval) {
  const labels: Record<Exclude<RecurringFrequency, 'custom'>, string> = {
    weekly: 'أسبوعي',
    monthly: 'شهري',
    bimonthly: 'كل شهرين',
    quarterly: 'ربع سنوي',
    semiannual: 'نصف سنوي',
    annual: 'سنوي',
  };

  if (frequency !== 'custom') {
    return labels[frequency];
  }

  if (!customInterval || !isFinitePositiveNumber(customInterval.value)) {
    return 'مخصص';
  }

  return customInterval.unit === 'days'
    ? `كل ${customInterval.value} يوم`
    : `كل ${customInterval.value} شهر`;
}

export function formatPaymentMethodLabel(method: RecurringExpense['paymentMethod']) {
  const labels: Record<RecurringExpense['paymentMethod'], string> = {
    'company-card': 'بطاقة الشركة',
    'bank-account': 'حساب بنكي',
    cash: 'نقدي',
    transfer: 'تحويل',
    other: 'أخرى',
  };

  return labels[method];
}

export function formatRenewalModeLabel(mode: RecurringExpense['renewalMode']) {
  return mode === 'automatic' ? 'يتجدد تلقائيًا' : 'دفع يدوي';
}

export function formatDueDistance(date?: string) {
  const days = calculateDaysUntilDue(date);

  if (days === null) {
    return 'غير محدد';
  }

  if (days === 0) {
    return 'مستحق اليوم';
  }

  if (days === 1) {
    return 'متبقٍ يوم واحد';
  }

  if (days === 2) {
    return 'متبقٍ يومان';
  }

  if (days > 2 && days <= 10) {
    return `متبقٍ ${days} أيام`;
  }

  if (days > 10) {
    return `متبقٍ ${days} يومًا`;
  }

  const overdue = Math.abs(days);

  if (overdue === 1) {
    return 'متأخر بيوم';
  }

  if (overdue === 2) {
    return 'متأخر بيومين';
  }

  return `متأخر ${overdue} أيام`;
}

export function formatSar(value: number, currency = 'ر.س') {
  const safeValue = Number.isFinite(value) ? value : 0;

  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(safeValue))} ${currency}`;
}

export function formatDisplayDate(value?: string) {
  if (!value) {
    return 'غير محدد';
  }

  const date = parseIsoDate(value);

  if (!date) {
    return 'غير محدد';
  }

  const monthNames = [
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
  ];

  return `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDateInputValue(value?: string, placeholder = 'اختر تاريخًا') {
  if (!value) {
    return placeholder;
  }

  return formatDisplayDate(value);
}

export function parseAmount(value: string) {
  const normalized = value.replace(/,/g, '').trim();

  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  return isFinitePositiveNumber(amount) ? amount : null;
}

export function parseIsoDate(value?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) {
    return null;
  }

  const maxDay = getDaysInMonth(year, month - 1);

  if (day < 1 || day > maxDay) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function compareIsoDates(first?: string, second?: string) {
  const firstDate = parseIsoDate(first);
  const secondDate = parseIsoDate(second);

  if (!firstDate || !secondDate) {
    return null;
  }

  return Math.sign(firstDate.getTime() - secondDate.getTime());
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonthsClamped(date: Date, months: number) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedTargetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetMonthDays = getDaysInMonth(targetYear, normalizedTargetMonth);
  const next = new Date(Date.UTC(targetYear, normalizedTargetMonth, Math.min(day, targetMonthDays)));

  return next;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
