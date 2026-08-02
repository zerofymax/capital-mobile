import { useSyncExternalStore } from 'react';

import { calculateRealizedGoalAmount, getGoalStatusFromProgress } from './goal-utils';
import { initialGoals, type FinancialGoal, type GoalContribution, type GoalTypeId } from './goals-data';

type GoalDraft = {
  name: string;
  typeId: GoalTypeId;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  reminderEnabled: boolean;
  reminderDay: string;
};

type ContributionDraft = {
  amount: number;
  source: string;
  date: string;
  note?: string;
};

export type GoalsSnapshot = {
  goals: FinancialGoal[];
  notice: string | null;
};

const listeners = new Set<() => void>();

let snapshot: GoalsSnapshot = {
  goals: initialGoals,
  notice: null,
};

function emit(nextSnapshot: GoalsSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useGoalsStore() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function getGoalsSnapshot() {
  return snapshot;
}

export function replaceGoals(goals: readonly FinancialGoal[]) {
  emit({ goals: [...goals], notice: null });
}

export function addGoal(draft: GoalDraft) {
  const progress = draft.targetAmount > 0 ? Math.round((draft.currentAmount / draft.targetAmount) * 100) : 0;
  const goal: FinancialGoal = {
    ...draft,
    id: `goal-${draft.typeId}-${Date.now()}`,
    startDate: '1 يوليو 2026',
    status: getGoalStatusFromProgress(progress),
    completionDate: progress >= 100 ? draft.targetDate : undefined,
    contributions: [],
  };

  emit({ goals: [...snapshot.goals, goal], notice: 'تمت إضافة الهدف بنجاح' });
}

export function updateGoal(id: string, draft: GoalDraft) {
  emit({
    goals: snapshot.goals.map((goal) => {
      if (goal.id !== id) {
        return goal;
      }

      const progress = draft.targetAmount > 0 ? Math.round((draft.currentAmount / draft.targetAmount) * 100) : 0;

      return {
        ...goal,
        ...draft,
        status: getGoalStatusFromProgress(progress),
        completionDate: progress >= 100 ? goal.completionDate ?? draft.targetDate : undefined,
      };
    }),
    notice: 'تم تحديث الهدف بنجاح',
  });
}

export function addContribution(goalId: string, draft: ContributionDraft) {
  let completed = false;

  const goals = snapshot.goals.map((goal) => {
    if (goal.id !== goalId) {
      return goal;
    }

    const currentRealizedAmount = calculateRealizedGoalAmount(goal);
    const neededAmount = Math.max(goal.targetAmount - currentRealizedAmount, 0);
    const appliedAmount = Math.min(draft.amount, neededAmount);
    const contribution: GoalContribution = {
      id: `contribution-${Date.now()}`,
      title: draft.source === 'من الإيرادات' ? 'إضافة من الإيرادات' : 'مساهمة جديدة',
      date: draft.date,
      amount: appliedAmount,
      source: draft.source,
      note: draft.note,
    };

    const nextContributions = [...goal.contributions, contribution];
    const nextAmount = Math.min(calculateRealizedGoalAmount({ ...goal, contributions: nextContributions }), goal.targetAmount);
    const progress = goal.targetAmount > 0 ? Math.round((nextAmount / goal.targetAmount) * 100) : 0;

    completed = progress >= 100;

    return {
      ...goal,
      currentAmount: nextAmount,
      status: getGoalStatusFromProgress(progress),
      completionDate: completed ? goal.completionDate ?? goal.targetDate : goal.completionDate,
      contributions: nextContributions,
    };
  });

  emit({
    goals,
    notice: completed ? 'تمت إضافة المساهمة وتحقيق الهدف بنجاح' : 'تمت إضافة المساهمة بنجاح',
  });
}

export function deleteGoal(id: string) {
  emit({
    goals: snapshot.goals.filter((goal) => goal.id !== id),
    notice: 'تم حذف الهدف',
  });
}

export function clearGoalsNotice() {
  if (snapshot.notice) {
    emit({ ...snapshot, notice: null });
  }
}
