import type {
  StartupGoal,
  StartupGoalBudgetStatus,
  StartupGoalTimeStatus,
  StartupGoalUnit,
} from './startup-goals-types';

export const prototypeToday = '2026-07-25';

const dayMs = 24 * 60 * 60 * 1000;
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
] as const;

export function calculateGoalProgress(goal: Pick<StartupGoal, 'currentValue' | 'targetValue'>) {
  if (!Number.isFinite(goal.currentValue) || !Number.isFinite(goal.targetValue) || goal.targetValue <= 0) {
    return null;
  }

  return Math.max(0, (goal.currentValue / goal.targetValue) * 100);
}

export function calculateDisplayProgress(goal: Pick<StartupGoal, 'currentValue' | 'targetValue'>) {
  const progress = calculateGoalProgress(goal);

  return progress === null ? 0 : Math.min(100, progress);
}

export function calculateBudgetUsage(goal: Pick<StartupGoal, 'allocatedBudget' | 'spentBudget'>) {
  if (!Number.isFinite(goal.allocatedBudget) || !Number.isFinite(goal.spentBudget) || goal.allocatedBudget <= 0) {
    return null;
  }

  return Math.max(0, (goal.spentBudget / goal.allocatedBudget) * 100);
}

export function calculateRemainingBudget(goal: Pick<StartupGoal, 'allocatedBudget' | 'spentBudget'>) {
  const allocated = Number.isFinite(goal.allocatedBudget) ? goal.allocatedBudget : 0;
  const spent = Number.isFinite(goal.spentBudget) ? goal.spentBudget : 0;

  return allocated - spent;
}

export function calculateDaysRemaining(targetDate: string, today = prototypeToday) {
  const target = parseIsoDate(targetDate);
  const current = parseIsoDate(today);

  if (target === null || current === null) {
    return null;
  }

  return Math.ceil((target - current) / dayMs);
}

export function calculateElapsedTimePercentage(startDate: string, targetDate: string, today = prototypeToday) {
  const start = parseIsoDate(startDate);
  const target = parseIsoDate(targetDate);
  const current = parseIsoDate(today);

  if (start === null || target === null || current === null || target <= start) {
    return null;
  }

  return Math.max(0, Math.min(100, ((current - start) / (target - start)) * 100));
}

export function resolveGoalStatus(goal: StartupGoal) {
  if (goal.status === 'completed' || goal.status === 'paused' || goal.status === 'not-started') {
    return goal.status;
  }

  const progress = calculateGoalProgress(goal);
  const daysRemaining = calculateDaysRemaining(goal.targetDate);

  if (progress !== null && progress >= 100) {
    return 'completed';
  }

  if (daysRemaining !== null && daysRemaining < 0) {
    return 'delayed';
  }

  return goal.status;
}

export function resolveGoalBudgetStatus(goal: Pick<StartupGoal, 'allocatedBudget' | 'spentBudget'>): StartupGoalBudgetStatus {
  const usage = calculateBudgetUsage(goal);

  if (usage === null) {
    return 'no-budget';
  }

  if (usage > 100) {
    return 'over-budget';
  }

  if (usage >= 85) {
    return 'near-limit';
  }

  return 'within-budget';
}

export function resolveGoalTimeStatus(goal: StartupGoal): StartupGoalTimeStatus {
  if (goal.status === 'completed') {
    return 'completed';
  }

  if (goal.status === 'not-started') {
    return 'not-started';
  }

  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const elapsed = calculateElapsedTimePercentage(goal.startDate, goal.targetDate);
  const progress = calculateGoalProgress(goal);

  if (daysRemaining !== null && daysRemaining < 0) {
    return 'delayed';
  }

  if (progress !== null && elapsed !== null && elapsed - progress > 15) {
    return 'watch';
  }

  return 'on-track';
}

export function compareProgressToBudget(goal: Pick<StartupGoal, 'currentValue' | 'targetValue' | 'allocatedBudget' | 'spentBudget'>) {
  const progress = calculateGoalProgress(goal);
  const budgetUsage = calculateBudgetUsage(goal);

  if (progress === null) {
    return 'لا توجد قيمة مستهدفة صالحة للمقارنة.';
  }

  if (budgetUsage === null) {
    return 'لا توجد ميزانية مخصصة لهذا الهدف.';
  }

  const diff = budgetUsage - progress;

  if (Math.abs(diff) <= 10) {
    return 'الإنفاق متوافق مع التقدم.';
  }

  if (diff > 10) {
    return 'الإنفاق أسرع من التقدم.';
  }

  return 'التقدم أسرع من الإنفاق.';
}

export function calculateMilestonesProgress(goal: Pick<StartupGoal, 'milestones'>) {
  if (goal.milestones.length === 0) {
    return 0;
  }

  return (goal.milestones.filter((milestone) => milestone.completed).length / goal.milestones.length) * 100;
}

export function formatSar(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  const abs = Math.abs(Math.round(value)).toLocaleString('en-US');

  return `${value < 0 ? '-' : ''}${abs} ر.س`;
}

export function formatGoalNumber(value: number | null, unit: StartupGoalUnit) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  if (unit === 'ر.س') {
    return formatSar(value);
  }

  const formatted = Math.round(value).toLocaleString('en-US');

  if (unit === 'نسبة مئوية') {
    return `${formatted}%`;
  }

  return `${formatted} ${unit}`;
}

export function formatPercent(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) {
    return 'غير متاح';
  }

  return `${value.toFixed(digits)}%`;
}

export function formatDate(value: string) {
  const parts = parseIsoParts(value);

  if (!parts) {
    return value;
  }

  return `${parts.day} ${monthNames[parts.month - 1]} ${parts.year}`;
}

export function formatDaysRemaining(value: number | null) {
  if (value === null) {
    return 'غير متاح';
  }

  if (value > 0) {
    return `متبقي ${value} يوم`;
  }

  if (value === 0) {
    return 'الموعد اليوم';
  }

  return `متأخر بـ ${Math.abs(value)} يوم`;
}

export function parseIsoDate(value: string) {
  const parts = parseIsoParts(value);

  if (!parts) {
    return null;
  }

  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function parseIsoParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}
