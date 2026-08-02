import { colors } from '@/theme/colors';
import { directionSafeText } from '@/utils/rtl';
import { invoiceStatusOptions, type Invoice, type InvoiceStatusId, type InvoiceStatusMeta } from './invoices-data';

export type InvoiceTone = 'green' | 'blue' | 'amber' | 'danger' | 'muted';

export type InvoiceStatus = InvoiceStatusMeta & {
  tone: InvoiceTone;
};

export type InvoiceSummary = Invoice & {
  subtotal: number;
  total: number;
  remaining: number;
  progress: number;
  displayStatus: InvoiceStatus;
  open: boolean;
  paidInFull: boolean;
  dueTiming: InvoiceDueTiming;
  dueText: string;
};

export type InvoiceDueTiming = {
  state: 'paid' | 'upcoming' | 'today' | 'overdue' | 'unavailable';
  days: number | null;
};

export type InvoiceCollectionSummary = {
  totalCount: number;
  totalAmount: number;
  collectedAmount: number;
  remainingAmount: number;
  collectionRate: number | null;
  paidCount: number;
  partiallyPaidCount: number;
  incompleteCount: number;
  overdueCount: number;
  dueSoonCount: number;
  waitingCount: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DUE_SOON_WINDOW_DAYS = 7;

export const invoiceToneColors: Record<InvoiceTone, { accent: string; tint: string; border: string; text: string }> = {
  green: {
    accent: '#35D39A',
    tint: 'rgba(53,211,154,0.12)',
    border: 'rgba(53,211,154,0.28)',
    text: '#35D39A',
  },
  blue: {
    accent: '#2EA8FF',
    tint: 'rgba(46,168,255,0.12)',
    border: 'rgba(46,168,255,0.28)',
    text: '#2EA8FF',
  },
  amber: {
    accent: '#F3B744',
    tint: 'rgba(243,183,68,0.13)',
    border: 'rgba(243,183,68,0.30)',
    text: '#F3B744',
  },
  danger: {
    accent: colors.semantic.danger,
    tint: colors.semantic.dangerTint,
    border: 'rgba(229,103,90,0.34)',
    text: colors.semantic.danger,
  },
  muted: {
    accent: colors.text.tertiary,
    tint: 'rgba(255,255,255,0.07)',
    border: colors.surface.border,
    text: colors.text.secondary,
  },
};

export function getInvoiceSummary(invoice: Invoice): InvoiceSummary {
  return buildInvoiceSummary(invoice, new Date());
}

function buildInvoiceSummary(invoice: Invoice, currentDate: Date): InvoiceSummary {
  const subtotal = getInvoiceSubtotal(invoice);
  const total = Math.max(subtotal - invoice.discount + invoice.tax, 0);
  const paid = Math.min(invoice.paid, total);
  const remaining = Math.max(total - paid, 0);
  const paidInFull = total > 0 && remaining === 0;
  const progress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const displayStatus = paidInFull ? getInvoiceStatus('paid') : getInvoiceStatus(invoice.status);
  const dueTiming = getInvoiceDueTiming(
    paidInFull ? 'paid' : invoice.status,
    invoice.dueDate,
    currentDate,
  );

  return {
    ...invoice,
    paid,
    subtotal,
    total,
    remaining,
    progress,
    displayStatus,
    open: !paidInFull && invoice.status !== 'cancelled',
    paidInFull,
    dueTiming,
    dueText: formatInvoiceDueText(dueTiming),
  };
}

export function getInvoiceCollectionSummary(
  invoices: readonly Invoice[],
  currentDate: Date = new Date(),
): InvoiceCollectionSummary {
  const safeCurrentDate = Number.isFinite(currentDate.getTime()) ? currentDate : new Date();

  const summary = invoices.reduce<InvoiceCollectionSummary>(
    (result, invoice) => {
      const invoiceSummary = buildInvoiceSummary(invoice, safeCurrentDate);
      const total = safeNonNegative(invoiceSummary.total);
      const collected = getRecordedPaymentAmount(invoice, total);
      const remaining = Math.max(total - collected, 0);
      const paidInFull = total > 0 && remaining === 0;
      const incomplete = !paidInFull;
      const open = incomplete && invoice.status !== 'cancelled';
      const overdue = open && invoiceSummary.dueTiming.state === 'overdue';
      const dueSoon =
        open &&
        !overdue &&
        (invoiceSummary.dueTiming.state === 'today' ||
          (invoiceSummary.dueTiming.state === 'upcoming' &&
            invoiceSummary.dueTiming.days !== null &&
            invoiceSummary.dueTiming.days <= DUE_SOON_WINDOW_DAYS));

      result.totalCount += 1;
      result.totalAmount += total;
      result.collectedAmount += collected;
      result.remainingAmount += remaining;
      result.paidCount += paidInFull ? 1 : 0;
      result.partiallyPaidCount += collected > 0 && remaining > 0 ? 1 : 0;
      result.incompleteCount += incomplete ? 1 : 0;
      result.overdueCount += overdue ? 1 : 0;
      result.dueSoonCount += dueSoon ? 1 : 0;
      result.waitingCount += open && !overdue && !dueSoon ? 1 : 0;

      return result;
    },
    {
      totalCount: 0,
      totalAmount: 0,
      collectedAmount: 0,
      remainingAmount: 0,
      collectionRate: null,
      paidCount: 0,
      partiallyPaidCount: 0,
      incompleteCount: 0,
      overdueCount: 0,
      dueSoonCount: 0,
      waitingCount: 0,
    },
  );

  summary.collectionRate =
    summary.totalAmount > 0
      ? Math.min(100, Math.max(0, (summary.collectedAmount / summary.totalAmount) * 100))
      : null;

  return summary;
}

export function getInvoiceSubtotal(invoice: Pick<Invoice, 'items'>) {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function getInvoiceStatus(status: InvoiceStatusId): InvoiceStatus {
  const meta = invoiceStatusOptions.find((item) => item.id === status) ?? invoiceStatusOptions[0]!;

  switch (status) {
    case 'awaiting-payment':
      return { ...meta, tone: 'muted' };
    case 'due-soon':
      return { ...meta, tone: 'amber' };
    case 'overdue':
      return { ...meta, tone: 'danger' };
    case 'partially-paid':
      return { ...meta, tone: 'blue' };
    case 'paid':
      return { ...meta, tone: 'green' };
    case 'cancelled':
      return { ...meta, tone: 'muted' };
  }
}

export function getStatusFromPayment(total: number, paid: number, fallback: InvoiceStatusId): InvoiceStatusId {
  if (paid >= total && total > 0) {
    return 'paid';
  }
  if (paid > 0) {
    return 'partially-paid';
  }
  if (fallback === 'overdue' || fallback === 'due-soon') {
    return fallback;
  }

  return 'awaiting-payment';
}

export function formatAmountInput(value: string) {
  return value.replace(/[^\d-]/g, '');
}

export function parseAmount(value: string) {
  const normalized = value.replace(/,/g, '').trim();

  if (!normalized || normalized === '-') {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function formatSar(value: number) {
  return directionSafeText(`${value.toLocaleString('en-US')} ر.س`);
}

export function formatSignedSar(value: number) {
  return directionSafeText(`${value >= 0 ? '+' : '-'}${Math.abs(value).toLocaleString('en-US')} ر.س`);
}

export function formatInvoiceDateForDisplay(date: Date, today = false) {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const formattedDate = `${safeDate.getDate()} ${getArabicMonthName(safeDate.getMonth())} ${safeDate.getFullYear()}`;

  return today ? `اليوم، ${formattedDate}` : formattedDate;
}

export function getRecentPaymentDateOptions(now = new Date()) {
  const safeNow = Number.isFinite(now.getTime()) ? now : new Date();
  const start = startOfLocalDay(safeNow);

  return [0, -1, -2, -7].map((offset, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    return formatInvoiceDateForDisplay(date, index === 0);
  });
}

export function getRoundedCollectionRate(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
}

export function formatInvoiceCollectionRate(value: number | null) {
  const rounded = getRoundedCollectionRate(value);

  return rounded === null ? 'غير متاح' : `${rounded.toLocaleString('en-US')}%`;
}

export function getInvoiceDueTiming(
  status: InvoiceStatusId,
  dueDate: string,
  currentDate: Date = new Date(),
): InvoiceDueTiming {
  if (status === 'paid') {
    return { state: 'paid', days: 0 };
  }

  const parsedDueDate = parseInvoiceDate(dueDate);
  const safeCurrentDate = Number.isFinite(currentDate.getTime()) ? currentDate : new Date();

  if (!parsedDueDate) {
    return { state: 'unavailable', days: null };
  }

  const days = Math.round(
    (startOfLocalDay(parsedDueDate).getTime() - startOfLocalDay(safeCurrentDate).getTime()) /
      DAY_IN_MS,
  );

  if (days > 0) {
    return { state: 'upcoming', days };
  }

  if (days < 0) {
    return { state: 'overdue', days: Math.abs(days) };
  }

  return { state: 'today', days: 0 };
}

export function getDueText(
  status: InvoiceStatusId,
  dueDate: string,
  currentDate: Date = new Date(),
) {
  return formatInvoiceDueText(getInvoiceDueTiming(status, dueDate, currentDate));
}

export function compareInvoiceDates(issueDate: string, dueDate: string) {
  const issue = parseInvoiceDate(issueDate);
  const due = parseInvoiceDate(dueDate);

  if (!issue || !due) {
    return 0;
  }

  return due.getTime() - issue.getTime();
}

export function parseInvoiceDate(value: string) {
  const normalized = value.replace('اليوم، ', '');
  const [dayText, month, yearText] = normalized.split(' ');
  const months: Record<string, number> = {
    يناير: 0,
    فبراير: 1,
    مارس: 2,
    أبريل: 3,
    مايو: 4,
    يونيو: 5,
    يوليو: 6,
    أغسطس: 7,
    سبتمبر: 8,
    أكتوبر: 9,
    نوفمبر: 10,
    ديسمبر: 11,
  };
  const day = Number(dayText);
  const year = Number(yearText);
  const monthIndex = month ? months[month] : undefined;

  if (!Number.isFinite(day) || !Number.isFinite(year) || monthIndex === undefined) {
    return null;
  }

  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getRecordedPaymentAmount(invoice: Invoice, total: number) {
  const paymentsTotal = invoice.payments.reduce(
    (sum, payment) => sum + safeNonNegative(payment.amount),
    0,
  );
  const recordedAmount = invoice.payments.length > 0 ? paymentsTotal : safeNonNegative(invoice.paid);

  return Math.min(recordedAmount, total);
}

function safeNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getArabicMonthName(monthIndex: number) {
  const months = [
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

  return months[monthIndex] ?? '';
}

function formatInvoiceDueText(timing: InvoiceDueTiming) {
  if (timing.state === 'paid') {
    return 'مدفوعة';
  }

  if (timing.state === 'today') {
    return 'مستحقة اليوم';
  }

  if (timing.state === 'unavailable' || timing.days === null) {
    return 'موعد الاستحقاق غير متاح';
  }

  const days = formatDays(timing.days);

  return timing.state === 'overdue' ? `متأخرة ${days}` : `متبقي ${days}`;
}

function formatDays(days: number) {
  if (days === 1) {
    return 'يوم واحد';
  }

  if (days === 2) {
    return 'يومان';
  }

  return `${days.toLocaleString('en-US')} أيام`;
}
