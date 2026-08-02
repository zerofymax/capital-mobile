import { useSyncExternalStore } from 'react';

import { createCompanyUpdateDraft } from './company-update-utils';
import { getCompanyUpdatePeriod, resolveFinancialSnapshot } from './company-update-data';
import type { CompanyUpdate, CompanyUpdateFormValues, CompanyUpdateStatus } from './company-update-types';
import { createDraftMilestones, initialStartupGoals } from './startup-goals-data';
import { calculateGoalProgress } from './startup-goals-utils';
import type { StartupGoal, StartupGoalDraft } from './startup-goals-types';

export type StartupReportsSnapshot = {
  goals: StartupGoal[];
  companyUpdates: Record<string, CompanyUpdate>;
  notice: string | null;
};

const listeners = new Set<() => void>();
const todayLabel = 'اليوم';

let snapshot: StartupReportsSnapshot = {
  goals: [...initialStartupGoals],
  companyUpdates: {},
  notice: null,
};

function emit(nextSnapshot: StartupReportsSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useStartupReportsStore() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function getStartupReportsSnapshot() {
  return snapshot;
}

export function replaceStartupReports(
  nextSnapshot: Pick<StartupReportsSnapshot, 'goals' | 'companyUpdates'>,
) {
  emit({
    goals: [...nextSnapshot.goals],
    companyUpdates: { ...nextSnapshot.companyUpdates },
    notice: null,
  });
}

export function clearStartupReportsNotice() {
  if (snapshot.notice) {
    emit({ ...snapshot, notice: null });
  }
}

export function getStartupGoal(id: string | string[] | undefined) {
  const goalId = Array.isArray(id) ? id[0] : id;

  return snapshot.goals.find((goal) => goal.id === goalId) ?? null;
}

export function addStartupGoal(draft: StartupGoalDraft) {
  const progress = calculateGoalProgress(draft);
  const goal: StartupGoal = {
    ...draft,
    id: `startup-goal-${Date.now()}`,
    status: progress !== null && progress >= 100 ? 'completed' : draft.status,
    createdAt: todayLabel,
    updatedAt: todayLabel,
    milestones: createDraftMilestones(),
  };

  emit({
    ...snapshot,
    goals: [...snapshot.goals, goal],
    notice: 'تمت إضافة الهدف بنجاح',
  });

  return goal.id;
}

export function updateStartupGoal(id: string, draft: StartupGoalDraft) {
  const progress = calculateGoalProgress(draft);

  emit({
    ...snapshot,
    goals: snapshot.goals.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            ...draft,
            status: progress !== null && progress >= 100 ? 'completed' : draft.status,
            updatedAt: todayLabel,
          }
        : goal,
    ),
    notice: 'تم حفظ تعديلات الهدف',
  });
}

export function deleteStartupGoal(id: string) {
  emit({
    ...snapshot,
    goals: snapshot.goals.filter((goal) => goal.id !== id),
    notice: 'تم حذف الهدف من النسخة التجريبية الحالية',
  });
}

export function toggleStartupGoalMilestone(goalId: string, milestoneId: string) {
  emit({
    ...snapshot,
    goals: snapshot.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            milestones: goal.milestones.map((milestone) =>
              milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone,
            ),
            updatedAt: todayLabel,
          }
        : goal,
    ),
  });
}

export function addStartupGoalMilestone(goalId: string, title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return;
  }

  emit({
    ...snapshot,
    goals: snapshot.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            milestones: [
              ...goal.milestones,
              {
                id: `milestone-${Date.now()}`,
                title: trimmedTitle,
                completed: false,
              },
            ],
            updatedAt: todayLabel,
          }
        : goal,
    ),
    notice: 'تمت إضافة المرحلة',
  });
}

export function getCompanyUpdateByPeriod(periodKey: string) {
  return snapshot.companyUpdates[periodKey] ?? null;
}

export function createDraftForPeriod(periodKey: string) {
  const period = getCompanyUpdatePeriod(periodKey);
  const financialSnapshot = resolveFinancialSnapshot(period.key, snapshot.goals);

  return createCompanyUpdateDraft(period, financialSnapshot);
}

export function saveCompanyUpdate(update: CompanyUpdate, status: CompanyUpdateStatus = 'saved') {
  const nextUpdate: CompanyUpdate = {
    ...update,
    status,
    updatedAt: todayLabel,
  };

  emit({
    ...snapshot,
    companyUpdates: {
      ...snapshot.companyUpdates,
      [nextUpdate.periodKey]: nextUpdate,
    },
    notice: 'تم حفظ تحديث الشركة.',
  });
}

export function updateCompanyUpdate(periodKey: string, values: CompanyUpdateFormValues) {
  const existingUpdate = snapshot.companyUpdates[periodKey] ?? createDraftForPeriod(periodKey);

  emit({
    ...snapshot,
    companyUpdates: {
      ...snapshot.companyUpdates,
      [periodKey]: {
        ...existingUpdate,
        ...values,
        status: 'draft',
        updatedAt: todayLabel,
      },
    },
  });
}

export function deleteCompanyUpdate(periodKey: string) {
  const { [periodKey]: _removed, ...rest } = snapshot.companyUpdates;

  emit({
    ...snapshot,
    companyUpdates: rest,
    notice: 'تم حذف تحديث الشركة من النسخة التجريبية.',
  });
}
