import { useSyncExternalStore } from 'react';

import { initialBudgets, type Budget, type BudgetCategoryId } from './budgets-data';

type BudgetDraft = {
  categoryId: BudgetCategoryId;
  budget: number;
  month: string;
  alertThreshold: number;
  alertEnabled: boolean;
};

export type BudgetSnapshot = {
  budgets: Budget[];
  notice: string | null;
};

const listeners = new Set<() => void>();

let snapshot: BudgetSnapshot = {
  budgets: initialBudgets,
  notice: null,
};

function emit(nextSnapshot: BudgetSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useBudgetsStore() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function getBudgetsSnapshot() {
  return snapshot;
}

export function replaceBudgets(budgets: readonly Budget[]) {
  emit({ budgets: [...budgets], notice: null });
}

export function addBudget(draft: BudgetDraft) {
  const budget: Budget = {
    ...draft,
    id: `budget-${draft.categoryId}-${Date.now()}`,
    spent: 0,
    createdAt: '1 يوليو 2026',
  };

  emit({ budgets: [...snapshot.budgets, budget], notice: 'تمت إضافة الميزانية بنجاح' });
}

export function updateBudget(id: string, draft: BudgetDraft) {
  emit({
    budgets: snapshot.budgets.map((budget) => (budget.id === id ? { ...budget, ...draft } : budget)),
    notice: 'تم تحديث الميزانية بنجاح',
  });
}

export function deleteBudget(id: string) {
  emit({
    budgets: snapshot.budgets.filter((budget) => budget.id !== id),
    notice: 'تم حذف الميزانية',
  });
}

export function clearBudgetNotice() {
  if (snapshot.notice) {
    emit({ ...snapshot, notice: null });
  }
}

export function findDuplicateBudget(categoryId: BudgetCategoryId | null, month: string, excludeId?: string) {
  if (!categoryId) {
    return undefined;
  }

  return snapshot.budgets.find((budget) => budget.categoryId === categoryId && budget.month === month && budget.id !== excludeId);
}
