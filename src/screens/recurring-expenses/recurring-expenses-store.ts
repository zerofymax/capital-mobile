import { useSyncExternalStore } from 'react';

import { initialRecurringExpenses } from './recurring-expenses-data';
import type {
  RecurringExpense,
  RecurringExpenseFormValues,
  RecurringPaymentMethod,
  RecurringPaymentRecord,
} from './recurring-expenses-types';
import { calculateDaysUntilDue, calculateNextDueDate, parseAmount, prototypeToday } from './recurring-expenses-utils';

export type RecurringExpensesSnapshot = {
  expenses: RecurringExpense[];
  notice: string | null;
};

type PaymentInput = {
  amount: number;
  date: string;
  method: RecurringPaymentMethod;
  note?: string;
};

let snapshot: RecurringExpensesSnapshot = {
  expenses: initialRecurringExpenses,
  notice: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: RecurringExpensesSnapshot) {
  snapshot = next;
  emit();
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return snapshot;
}

export function useRecurringExpensesStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getRecurringExpenses() {
  return snapshot.expenses;
}

export function getRecurringExpensesSnapshot() {
  return snapshot;
}

export function replaceRecurringExpenses(expenses: readonly RecurringExpense[]) {
  setSnapshot({
    expenses: [...expenses],
    notice: null,
  });
}

export function getRecurringExpenseById(id: string | undefined) {
  return snapshot.expenses.find((expense) => expense.id === id);
}

export function clearRecurringExpenseNotice() {
  if (!snapshot.notice) {
    return;
  }

  setSnapshot({ ...snapshot, notice: null });
}

export function addRecurringExpense(values: RecurringExpenseFormValues) {
  const now = prototypeToday;
  const expense: RecurringExpense = {
    id: createId('recurring'),
    ...mapFormValues(values),
    payments: [],
    createdAt: now,
    updatedAt: now,
  };

  setSnapshot({
    expenses: [expense, ...snapshot.expenses],
    notice: 'تمت إضافة المصروف المتكرر بنجاح',
  });

  return expense;
}

export function updateRecurringExpense(id: string, values: RecurringExpenseFormValues) {
  let updated: RecurringExpense | undefined;
  const expenses = snapshot.expenses.map((expense) => {
    if (expense.id !== id) {
      return expense;
    }

    updated = {
      ...expense,
      ...mapFormValues(values),
      updatedAt: prototypeToday,
    };

    return updated;
  });

  if (!updated) {
    return undefined;
  }

  setSnapshot({
    expenses,
    notice: 'تم حفظ تغييرات المصروف المتكرر',
  });

  return updated;
}

export function deleteRecurringExpense(id: string) {
  setSnapshot({
    expenses: snapshot.expenses.filter((expense) => expense.id !== id),
    notice: 'تم حذف المصروف المتكرر',
  });
}

export function pauseRecurringExpense(id: string) {
  setSnapshot({
    expenses: snapshot.expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            status: 'paused',
            pausedAt: prototypeToday,
            updatedAt: prototypeToday,
          }
        : expense,
    ),
    notice: 'تم إيقاف المصروف مؤقتًا',
  });
}

export function resumeRecurringExpense(id: string) {
  setSnapshot({
    expenses: snapshot.expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            nextDueDate:
              expense.nextDueDate ?? calculateNextDueDate(prototypeToday, expense.frequency, expense.customInterval),
            pausedAt: undefined,
            status: 'active',
            updatedAt: prototypeToday,
          }
        : expense,
    ),
    notice: 'تمت إعادة تفعيل المصروف',
  });
}

export function recordRecurringPayment(id: string, input: PaymentInput) {
  let record: RecurringPaymentRecord | undefined;
  let updatedExpense: RecurringExpense | undefined;

  const expenses = snapshot.expenses.map((expense) => {
    if (expense.id !== id) {
      return expense;
    }

    record = {
      id: createId('payment'),
      amount: input.amount,
      date: input.date,
      method: input.method,
      note: input.note,
      status: 'paid',
    };

    updatedExpense = {
      ...expense,
      nextDueDate: calculateNextDueDate(input.date, expense.frequency, expense.customInterval),
      payments: [record, ...expense.payments],
      updatedAt: prototypeToday,
    };

    return updatedExpense;
  });

  if (!record || !updatedExpense) {
    return undefined;
  }

  setSnapshot({
    expenses,
    notice: 'تم تسجيل الدفعة وتحديث موعد الاستحقاق القادم',
  });

  return { expense: updatedExpense, record };
}

export function getActiveRecurringExpenses() {
  return snapshot.expenses.filter((expense) => expense.status === 'active');
}

export function getRecurringExpensesNeedingReview() {
  return snapshot.expenses.filter((expense) => expense.needsReview);
}

export function getUpcomingRecurringExpenses(days = 30) {
  return snapshot.expenses.filter((expense) => {
    const remainingDays = calculateDaysUntilDue(expense.nextDueDate);

    return expense.status === 'active' && remainingDays !== null && remainingDays >= 0 && remainingDays <= days;
  });
}

function mapFormValues(values: RecurringExpenseFormValues) {
  const frequency = values.frequency || 'monthly';
  const amount = parseAmount(values.amount) ?? 0;
  const reminderDays = values.reminderDays ? Number(values.reminderDays) : undefined;
  const monthlySavingOpportunity = parseAmount(values.monthlySavingOpportunity) ?? 0;

  return {
    name: values.name.trim(),
    vendor: values.vendor.trim(),
    description: values.description.trim() || undefined,
    categoryId: values.categoryId,
    amount,
    currency: 'ر.س',
    frequency,
    customInterval:
      frequency === 'custom'
        ? {
            unit: values.customIntervalUnit,
            value: Math.max(1, Number(values.customIntervalValue) || 1),
          }
        : undefined,
    startDate: values.startDate || prototypeToday,
    nextDueDate: values.nextDueDate,
    endDate: values.endDate || undefined,
    renewalMode: values.renewalMode,
    paymentMethod: values.paymentMethod,
    accountId: values.accountId.trim() || undefined,
    reference: values.reference.trim() || undefined,
    owner: values.owner.trim() || 'غير محدد',
    reminderDays,
    status: 'active' as const,
    needsReview: values.needsReview,
    monthlySavingOpportunity: monthlySavingOpportunity > 0 ? monthlySavingOpportunity : undefined,
    notes: values.notes.trim() || undefined,
  };
}
