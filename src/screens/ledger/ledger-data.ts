import { useSyncExternalStore } from 'react';

import {
  getBusinessInformationSnapshot,
} from '@/screens/account/business-information-data';
import {
  getCategoriesByType,
  getCategoryById,
  type FinancialCategory,
} from '@/state/categories-state';
import { formatCurrency } from '@/utils/rtl';

export type TransactionId = string;
export type TransactionType = 'income' | 'expense';
export type LedgerTransactionType = TransactionType;
export type TransactionSortOrder = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
export type TransactionPeriodKey = 'current-month' | 'previous-month' | 'last-3-months' | 'year' | 'custom';

export type TransactionRecord = {
  id: TransactionId;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  note: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  source: 'manual';
};

export type TransactionDraft = {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  note?: string;
  transactionDate: string;
};

export type TransactionFilters = {
  period: TransactionPeriodKey;
  customRange: {
    startDate: string;
    endDate: string;
  };
  query: string;
  type: 'all' | TransactionType;
  categoryIds: readonly string[];
  sortOrder: TransactionSortOrder;
};

export type TransactionSummary = {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  count: number;
};

export type LedgerTransactionStatus = 'completed' | 'pending';

export type LedgerTransaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: LedgerTransactionType;
  dateGroup: string;
  timestamp: string;
  recurring: boolean;
  status: LedgerTransactionStatus;
  reference: string;
};

export type LedgerGroup = {
  id: string;
  label: string;
  transactions: LedgerTransaction[];
};

export type TransactionTypeFilter = {
  key: TransactionFilters['type'];
  label: string;
};

export type TransactionPeriodOption = {
  key: TransactionPeriodKey;
  label: string;
};

export type TransactionSortOption = {
  key: TransactionSortOrder;
  label: string;
};

export type TransactionsSnapshot = {
  transactions: readonly TransactionRecord[];
  notice: string | null;
};

export const transactionTypeFilters: readonly TransactionTypeFilter[] = [
  { key: 'all', label: 'الكل' },
  { key: 'income', label: 'دخل' },
  { key: 'expense', label: 'مصروف' },
];

export const transactionPeriodOptions: readonly TransactionPeriodOption[] = [
  { key: 'current-month', label: 'هذا الشهر' },
  { key: 'previous-month', label: 'الشهر السابق' },
  { key: 'last-3-months', label: 'آخر 3 أشهر' },
  { key: 'year', label: 'هذا العام' },
  { key: 'custom', label: 'فترة مخصصة' },
];

export const transactionSortOptions: readonly TransactionSortOption[] = [
  { key: 'newest', label: 'الأحدث أولًا' },
  { key: 'oldest', label: 'الأقدم أولًا' },
  { key: 'amount-desc', label: 'الأعلى مبلغًا' },
  { key: 'amount-asc', label: 'الأقل مبلغًا' },
];

const ARABIC_GREGORIAN_MONTH_NAMES = [
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

const currentLocalDate = new Date();
const currentLocalDateIso = formatLocalIsoDate(currentLocalDate);
const yesterdayLocalDateIso = formatLocalIsoDate(
  new Date(currentLocalDate.getFullYear(), currentLocalDate.getMonth(), currentLocalDate.getDate() - 1),
);
const currentMonthStartIso = `${currentLocalDateIso.slice(0, 7)}-01`;

export const transactionDateOptions = [
  { value: currentLocalDateIso, label: `اليوم، ${formatFullDate(currentLocalDateIso)}` },
  { value: yesterdayLocalDateIso, label: `أمس، ${formatFullDate(yesterdayLocalDateIso)}` },
  { value: '2026-07-17', label: '17 يوليو 2026' },
  { value: '2026-07-16', label: '16 يوليو 2026' },
  { value: '2026-07-15', label: '15 يوليو 2026' },
  { value: '2026-06-20', label: '20 يونيو 2026' },
  { value: '2026-05-15', label: '15 مايو 2026' },
].filter((option, index, options) => options.findIndex((item) => item.value === option.value) === index);

export const defaultTransactionFilters: TransactionFilters = {
  period: 'current-month',
  customRange: {
    startDate: currentMonthStartIso,
    endDate: currentLocalDateIso,
  },
  query: '',
  type: 'all',
  categoryIds: [],
  sortOrder: 'newest',
};

const prototypeNow = '2026-07-26T12:00:00+03:00';
const unknownDateGroupId = 'unknown-date';
const unknownDateLabel = 'تاريخ غير محدد';

const initialTransactions: readonly TransactionRecord[] = [
  {
    id: 'identity-design',
    type: 'income',
    amount: 18500,
    categoryId: 'income-services',
    description: 'تصميم هوية بصرية',
    note: 'دفعة عميل مسجلة يدويًا في النموذج المحلي.',
    transactionDate: '2026-07-17',
    createdAt: '2026-07-17T09:30:00+03:00',
    updatedAt: '2026-07-17T09:30:00+03:00',
    source: 'manual',
  },
  {
    id: 'design-tools',
    type: 'expense',
    amount: 420,
    categoryId: 'expense-software',
    description: 'اشتراك أدوات تصميم',
    note: 'مصروف أدوات تشغيلية.',
    transactionDate: '2026-07-17',
    createdAt: '2026-07-17T08:05:00+03:00',
    updatedAt: '2026-07-17T08:05:00+03:00',
    source: 'manual',
  },
  {
    id: 'external-freelancer',
    type: 'expense',
    amount: 6200,
    categoryId: 'expense-professional',
    description: 'دفعة مستقل خارجي',
    note: '',
    transactionDate: '2026-07-16',
    createdAt: '2026-07-16T15:20:00+03:00',
    updatedAt: '2026-07-16T15:20:00+03:00',
    source: 'manual',
  },
  {
    id: 'product-shoot',
    type: 'income',
    amount: 9800,
    categoryId: 'income-products',
    description: 'تصوير منتجات',
    note: '',
    transactionDate: '2026-07-16',
    createdAt: '2026-07-16T11:45:00+03:00',
    updatedAt: '2026-07-16T11:45:00+03:00',
    source: 'manual',
  },
  {
    id: 'site-hosting',
    type: 'expense',
    amount: 140,
    categoryId: 'expense-software',
    description: 'استضافة الموقع',
    note: 'مصروف شهري مسجل يدويًا، دون ربط بالمصروفات المتكررة.',
    transactionDate: '2026-07-15',
    createdAt: '2026-07-15T10:00:00+03:00',
    updatedAt: '2026-07-15T10:00:00+03:00',
    source: 'manual',
  },
  {
    id: 'packaging-project',
    type: 'income',
    amount: 12300,
    categoryId: 'income-services',
    description: 'دفعة مشروع تغليف',
    note: '',
    transactionDate: '2026-07-15',
    createdAt: '2026-07-15T09:15:00+03:00',
    updatedAt: '2026-07-15T09:15:00+03:00',
    source: 'manual',
  },
  {
    id: 'june-marketing',
    type: 'expense',
    amount: 2800,
    categoryId: 'expense-marketing',
    description: 'حملة تسويق يونيو',
    note: '',
    transactionDate: '2026-06-20',
    createdAt: '2026-06-20T13:00:00+03:00',
    updatedAt: '2026-06-20T13:00:00+03:00',
    source: 'manual',
  },
  {
    id: 'may-subscription',
    type: 'income',
    amount: 7200,
    categoryId: 'income-subscriptions',
    description: 'اشتراكات عملاء مايو',
    note: '',
    transactionDate: '2026-05-15',
    createdAt: '2026-05-15T10:30:00+03:00',
    updatedAt: '2026-05-15T10:30:00+03:00',
    source: 'manual',
  },
];

export const ledgerGroups: LedgerGroup[] = groupLedgerTransactions(initialTransactions);

const listeners = new Set<() => void>();

let snapshot: TransactionsSnapshot = {
  transactions: initialTransactions,
  notice: null,
};

function emitTransactionsChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeTransactions(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function getTransactionsSnapshot() {
  return snapshot;
}

export function useTransactionsStore() {
  return useSyncExternalStore(subscribeTransactions, getTransactionsSnapshot, getTransactionsSnapshot);
}

export function getTransactions() {
  return snapshot.transactions;
}

export function replaceTransactions(transactions: readonly TransactionRecord[]) {
  snapshot = {
    transactions: [...transactions],
    notice: null,
  };
  emitTransactionsChange();
}

export function getTransactionById(id?: string | string[]) {
  const transactionId = Array.isArray(id) ? id[0] : id;

  if (!transactionId) {
    return null;
  }

  return snapshot.transactions.find((transaction) => transaction.id === transactionId) ?? null;
}

export function createTransaction(draft: TransactionDraft) {
  const now = new Date().toISOString();
  const transaction: TransactionRecord = {
    ...sanitizeTransactionDraft(draft),
    id: createTransactionId(),
    createdAt: now,
    updatedAt: now,
    source: 'manual',
  };

  snapshot = {
    transactions: [transaction, ...snapshot.transactions],
    notice: transaction.type === 'income' ? 'تم تسجيل الدخل بنجاح.' : 'تم تسجيل المصروف بنجاح.',
  };
  emitTransactionsChange();

  return transaction;
}

export function updateTransaction(id: TransactionId, draft: TransactionDraft) {
  const currentTransaction = getTransactionById(id);

  if (!currentTransaction) {
    return null;
  }

  const nextTransaction: TransactionRecord = {
    ...currentTransaction,
    ...sanitizeTransactionDraft(draft),
    id: currentTransaction.id,
    createdAt: currentTransaction.createdAt,
    updatedAt: new Date().toISOString(),
    source: 'manual',
  };

  snapshot = {
    transactions: snapshot.transactions.map((transaction) => (transaction.id === id ? nextTransaction : transaction)),
    notice: 'تم تحديث العملية بنجاح.',
  };
  emitTransactionsChange();

  return nextTransaction;
}

export function deleteTransaction(id: TransactionId) {
  const exists = snapshot.transactions.some((transaction) => transaction.id === id);

  if (!exists) {
    return false;
  }

  snapshot = {
    transactions: snapshot.transactions.filter((transaction) => transaction.id !== id),
    notice: 'تم حذف العملية.',
  };
  emitTransactionsChange();

  return true;
}

export function clearTransactionsNotice() {
  if (!snapshot.notice) {
    return;
  }

  snapshot = { ...snapshot, notice: null };
  emitTransactionsChange();
}

export function calculateTransactionSummary(
  transactions: readonly TransactionRecord[],
  period: TransactionPeriodKey,
  customRange: TransactionFilters['customRange'] = defaultTransactionFilters.customRange,
): TransactionSummary {
  const periodTransactions = transactions.filter((transaction) => transactionMatchesPeriod(transaction, period, customRange));

  return periodTransactions.reduce<TransactionSummary>(
    (summary, transaction) => {
      const safeAmount = safePositiveNumber(transaction.amount);

      if (transaction.type === 'income') {
        summary.totalIncome += safeAmount;
      } else {
        summary.totalExpenses += safeAmount;
      }

      summary.net = summary.totalIncome - summary.totalExpenses;
      summary.count += 1;
      return summary;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      net: 0,
      count: 0,
    },
  );
}

export function filterTransactions(
  transactions: readonly TransactionRecord[],
  filters: TransactionFilters,
) {
  const normalizedQuery = normalizeSearch(filters.query);

  return [...transactions]
    .filter((transaction) => transactionMatchesPeriod(transaction, filters.period, filters.customRange))
    .filter((transaction) => filters.type === 'all' || transaction.type === filters.type)
    .filter((transaction) => filters.categoryIds.length === 0 || filters.categoryIds.includes(transaction.categoryId))
    .filter((transaction) => {
      if (!normalizedQuery) {
        return true;
      }

      const category = getTransactionCategory(transaction);
      const searchTarget = normalizeSearch([
        transaction.description,
        transaction.note,
        category.name,
      ].join(' '));

      return searchTarget.includes(normalizedQuery);
    })
    .sort((first, second) => compareTransactions(first, second, filters.sortOrder));
}

export function groupLedgerTransactions(transactions: readonly TransactionRecord[]): LedgerGroup[] {
  const groups = new Map<string, TransactionRecord[]>();

  transactions.forEach((transaction) => {
    const date = normalizeIsoDateSafe(transaction.transactionDate) ?? unknownDateGroupId;
    const current = groups.get(date) ?? [];
    groups.set(date, [...current, transaction]);
  });

  return [...groups.entries()]
    .sort(([firstDate], [secondDate]) => compareDateGroupKeys(firstDate, secondDate))
    .map(([date, items]) => ({
      id: date,
      label: formatDateGroupLabel(date),
      transactions: items.map((transaction) => toLedgerTransaction(transaction, formatDateGroupLabel(date))),
    }));
}

export function getTransactionCategory(transaction: TransactionRecord): FinancialCategory {
  return getCategoryById(transaction.categoryId) ?? getFallbackCategory(transaction.type);
}

export function getTransactionCategoriesForType(type: TransactionType) {
  return getCategoriesByType(type);
}

export function formatTransactionAmount(transaction: TransactionRecord) {
  const sign = transaction.type === 'income' ? '+' : '-';
  return `${sign}${formatCurrency(safePositiveNumber(transaction.amount), getCurrencySymbol())}`;
}

export function formatSignedCurrency(value: number) {
  const safeValue = safeNumber(value);
  const sign = safeValue > 0 ? '+' : safeValue < 0 ? '-' : '';
  return `${sign}${formatCurrency(Math.abs(safeValue), getCurrencySymbol())}`;
}

export function getCurrencySymbol() {
  const currencyParts = getBusinessInformationSnapshot().currency.split('—').map((part) => part.trim());
  return currencyParts[1] || 'ر.س';
}

export function parseAmountInput(value: string) {
  const normalized = normalizeArabicDigits(value)
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();
  const numericValue = Number(normalized);

  if (!normalized) {
    return null;
  }

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue * 100) / 100;
}

export function normalizeAmountInput(value: string) {
  const normalized = normalizeArabicDigits(value).replace(/[^\d.]/g, '');
  const parts = normalized.split('.');
  const integerPart = parts[0] ?? '';
  const decimalPart = parts.slice(1).join('').slice(0, 2);

  return parts.length > 1 ? `${integerPart}.${decimalPart}` : integerPart;
}

export function getDateOptionLabel(value: string) {
  return transactionDateOptions.find((option) => option.value === value)?.label ?? formatFullDate(value);
}

export function hasActiveTransactionFilters(filters: TransactionFilters) {
  return (
    filters.period !== defaultTransactionFilters.period ||
    filters.query.trim().length > 0 ||
    filters.type !== 'all' ||
    filters.categoryIds.length > 0 ||
    filters.sortOrder !== defaultTransactionFilters.sortOrder
  );
}

export function resetTransactionFilters(): TransactionFilters {
  return {
    ...defaultTransactionFilters,
    categoryIds: [],
    customRange: { ...defaultTransactionFilters.customRange },
  };
}

function toLedgerTransaction(transaction: TransactionRecord, dateGroup: string): LedgerTransaction {
  const category = getTransactionCategory(transaction);

  return {
    id: transaction.id,
    title: transaction.description,
    category: category.name,
    amount: transaction.type === 'income' ? transaction.amount : -transaction.amount,
    type: transaction.type,
    dateGroup,
    timestamp: `${normalizeIsoDate(transaction.transactionDate)}T12:00:00+03:00`,
    recurring: false,
    status: 'completed',
    reference: createDisplayReference(transaction.id),
  };
}

function sanitizeTransactionDraft(draft: TransactionDraft): Omit<TransactionRecord, 'id' | 'createdAt' | 'updatedAt' | 'source'> {
  return {
    type: draft.type,
    amount: safePositiveNumber(draft.amount),
    categoryId: draft.categoryId,
    description: draft.description.trim().replace(/\s+/g, ' '),
    note: (draft.note ?? '').trim().slice(0, 300),
    transactionDate: normalizeIsoDate(draft.transactionDate),
  };
}

function compareTransactions(first: TransactionRecord, second: TransactionRecord, sortOrder: TransactionSortOrder) {
  const firstDate = normalizeIsoDate(first.transactionDate);
  const secondDate = normalizeIsoDate(second.transactionDate);

  if (sortOrder === 'oldest') {
    return firstDate.localeCompare(secondDate);
  }

  if (sortOrder === 'amount-desc') {
    return safePositiveNumber(second.amount) - safePositiveNumber(first.amount);
  }

  if (sortOrder === 'amount-asc') {
    return safePositiveNumber(first.amount) - safePositiveNumber(second.amount);
  }

  return secondDate.localeCompare(firstDate);
}

function transactionMatchesPeriod(
  transaction: TransactionRecord,
  period: TransactionPeriodKey,
  customRange: TransactionFilters['customRange'],
) {
  const range = resolvePeriodRange(period, customRange);
  const date = normalizeIsoDate(transaction.transactionDate);

  return date >= range.startDate && date <= range.endDate;
}

function resolvePeriodRange(period: TransactionPeriodKey, customRange: TransactionFilters['customRange']) {
  if (period === 'previous-month') {
    return getRelativeMonthRange(-1);
  }

  if (period === 'last-3-months') {
    return { startDate: getRelativeMonthRange(-2).startDate, endDate: formatLocalIsoDate(new Date()) };
  }

  if (period === 'year') {
    const today = new Date();
    return { startDate: `${today.getFullYear()}-01-01`, endDate: formatLocalIsoDate(today) };
  }

  if (period === 'custom') {
    const startDate = normalizeIsoDate(customRange.startDate);
    const endDate = normalizeIsoDate(customRange.endDate);

    return endDate < startDate ? { startDate, endDate: startDate } : { startDate, endDate };
  }

  return getCurrentMonthToDateRange();
}

function formatDateGroupLabel(date: string) {
  if (date === unknownDateGroupId) {
    return unknownDateLabel;
  }

  const today = formatLocalIsoDate(new Date());
  const yesterday = formatLocalIsoDate(
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
  );

  if (date === today) {
    return 'اليوم';
  }

  if (date === yesterday) {
    return 'أمس';
  }

  return formatFullDate(date);
}

function formatFullDate(value: unknown) {
  const normalized = normalizeIsoDateSafe(value);

  if (!normalized) {
    return unknownDateLabel;
  }

  const parts = normalized.split('-');

  if (parts.length !== 3) {
    return unknownDateLabel;
  }

  const [year, month, day] = parts;
  const monthIndex = Number(month) - 1;
  const monthName = ARABIC_GREGORIAN_MONTH_NAMES[monthIndex];
  const dayNumber = Number(day);

  if (!year || !day || !Number.isInteger(monthIndex) || !monthName || !Number.isFinite(dayNumber)) {
    return unknownDateLabel;
  }

  return `${dayNumber} ${monthName} ${year}`;
}

function formatLocalIsoDate(date: Date) {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getRelativeMonthRange(offset: number) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);

  return {
    startDate: formatLocalIsoDate(start),
    endDate: formatLocalIsoDate(end),
  };
}

function getCurrentMonthToDateRange() {
  const today = new Date();

  return {
    startDate: formatLocalIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatLocalIsoDate(today),
  };
}

function compareDateGroupKeys(firstDate: string, secondDate: string) {
  if (firstDate === unknownDateGroupId) {
    return 1;
  }

  if (secondDate === unknownDateGroupId) {
    return -1;
  }

  return secondDate.localeCompare(firstDate);
}

function createDisplayReference(id: string) {
  return `TX-${id.toUpperCase().slice(0, 8)}`;
}

function createTransactionId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function safePositiveNumber(value: number) {
  const safeValue = safeNumber(value);
  return safeValue > 0 ? safeValue : 0;
}

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar-SA');
}

function normalizeIsoDate(value: unknown) {
  return normalizeIsoDateSafe(value) ?? formatLocalIsoDate(new Date());
}

function normalizeIsoDateSafe(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const isoDate = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/)?.[0];

  if (!isoDate) {
    return null;
  }

  const [, month, day] = isoDate.split('-');
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(dayNumber) ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31
  ) {
    return null;
  }

  return isoDate;
}

function normalizeArabicDigits(value: string) {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicDigits.indexOf(digit);
    if (arabicIndex >= 0) {
      return String(arabicIndex);
    }

    const persianIndex = persianDigits.indexOf(digit);
    return persianIndex >= 0 ? String(persianIndex) : digit;
  });
}

function getFallbackCategory(type: TransactionType): FinancialCategory {
  return {
    id: `${type}-fallback`,
    type,
    name: type === 'income' ? 'إيرادات أخرى' : 'مصروفات أخرى',
    icon: 'ellipsis-horizontal-outline',
    tone: 'muted',
    isDefault: true,
  };
}

export function getPrototypeNow() {
  return prototypeNow;
}
