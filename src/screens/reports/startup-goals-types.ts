import type { Ionicons } from '@expo/vector-icons';

export type StartupGoalStatus = 'not-started' | 'active' | 'completed' | 'delayed' | 'paused';

export type StartupGoalType =
  | 'product'
  | 'revenue'
  | 'customers'
  | 'users'
  | 'hiring'
  | 'expansion'
  | 'funding'
  | 'operations'
  | 'other';

export type StartupGoalUnit = 'ر.س' | 'عميل' | 'مستخدم' | 'موظف' | 'نسبة مئوية' | 'مرحلة' | 'عنصر' | 'وحدة أخرى';

export type StartupGoalBudgetStatus = 'no-budget' | 'within-budget' | 'near-limit' | 'over-budget';

export type StartupGoalTimeStatus = 'not-started' | 'on-track' | 'watch' | 'delayed' | 'completed';

export type StartupGoalMilestone = {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
};

export type StartupGoal = {
  id: string;
  title: string;
  description: string;
  type: StartupGoalType;
  status: StartupGoalStatus;
  owner: string;
  currentValue: number;
  targetValue: number;
  unit: StartupGoalUnit;
  startDate: string;
  targetDate: string;
  allocatedBudget: number;
  spentBudget: number;
  notes: string;
  milestones: StartupGoalMilestone[];
  createdAt: string;
  updatedAt: string;
};

export type StartupGoalDraft = {
  title: string;
  description: string;
  type: StartupGoalType;
  status: StartupGoalStatus;
  owner: string;
  currentValue: number;
  targetValue: number;
  unit: StartupGoalUnit;
  startDate: string;
  targetDate: string;
  allocatedBudget: number;
  spentBudget: number;
  notes: string;
};

export type StartupGoalTypeMeta = {
  id: StartupGoalType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
