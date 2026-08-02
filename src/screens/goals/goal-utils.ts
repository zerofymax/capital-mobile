import { colors } from '@/theme/colors';
import { directionSafeText, formatCurrency } from '@/utils/rtl';
import { goalTypes, type FinancialGoal, type GoalContribution, type GoalStatusId, type GoalType, type GoalTypeId } from './goals-data';

export type GoalTone = 'green' | 'blue' | 'amber' | 'danger' | 'muted';

export type GoalStatus = {
  id: GoalStatusId | 'contribution-near' | 'plan-updated';
  label: string;
  tone: GoalTone;
};

export type GoalSummary = FinancialGoal & {
  type: GoalType;
  remaining: number;
  progress: number;
  displayStatus: GoalStatus;
  completed: boolean;
  realizedContributions: GoalContribution[];
  plannedContributions: GoalContribution[];
  plannedAmount: number;
  expectedCompletion: {
    label: string;
    warning?: string;
  };
};

export const goalToneColors: Record<GoalTone, { accent: string; tint: string; border: string; text: string }> = {
  green: {
    accent: '#35D39A',
    tint: 'rgba(53,211,154,0.12)',
    border: 'rgba(53,211,154,0.26)',
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
    border: 'rgba(243,183,68,0.28)',
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

export function getGoalType(typeId: GoalTypeId) {
  return goalTypes.find((type) => type.id === typeId) ?? goalTypes[goalTypes.length - 1]!;
}

export function getGoalSummary(goal: FinancialGoal, today = new Date()): GoalSummary {
  const realizedContributions = getRealizedGoalContributions(goal, today);
  const plannedContributions = getPlannedGoalContributions(goal, today);
  const currentAmount = calculateRealizedGoalAmount(goal, today);
  const targetAmount = safePositive(goal.targetAmount);
  const progress = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
  const completed = progress >= 100 || goal.status === 'completed';
  const remaining = Math.max(targetAmount - currentAmount, 0);

  return {
    ...goal,
    currentAmount,
    targetAmount,
    type: getGoalType(goal.typeId),
    remaining,
    progress,
    displayStatus: completed ? getGoalStatus('completed') : getGoalStatus(goal.status),
    completed,
    realizedContributions,
    plannedContributions,
    plannedAmount: plannedContributions.reduce((sum, contribution) => sum + safePositive(contribution.amount), 0),
    expectedCompletion: calculateExpectedCompletionDate({
      monthlyContribution: goal.monthlyContribution,
      remaining,
      reminderDay: goal.reminderDay,
      targetDate: goal.targetDate,
      today,
    }),
  };
}

export function calculateRealizedGoalAmount(goal: FinancialGoal, today = new Date()) {
  if (!goal.contributions.length) {
    return safePositive(goal.currentAmount);
  }

  return getRealizedGoalContributions(goal, today).reduce((sum, contribution) => sum + safePositive(contribution.amount), 0);
}

export function getRealizedGoalContributions(goal: Pick<FinancialGoal, 'contributions'>, today = new Date()) {
  const todayTime = startOfDay(today).getTime();

  return goal.contributions.filter((contribution) => {
    const contributionDate = parseGoalDate(contribution.date);

    return contributionDate ? contributionDate.getTime() <= todayTime : false;
  });
}

export function getPlannedGoalContributions(goal: Pick<FinancialGoal, 'contributions'>, today = new Date()) {
  const todayTime = startOfDay(today).getTime();

  return goal.contributions.filter((contribution) => {
    const contributionDate = parseGoalDate(contribution.date);

    return contributionDate ? contributionDate.getTime() > todayTime : false;
  });
}

export function isFutureGoalContributionDate(date: string, today = new Date()) {
  const contributionDate = parseGoalDate(date);

  return contributionDate ? contributionDate.getTime() > startOfDay(today).getTime() : false;
}

export function calculateExpectedCompletionDate({
  remaining,
  monthlyContribution,
  reminderDay,
  targetDate,
  today = new Date(),
}: {
  remaining: number;
  monthlyContribution: number;
  reminderDay: string;
  targetDate: string;
  today?: Date;
}) {
  const safeRemaining = safePositive(remaining);
  const safeMonthlyContribution = safePositive(monthlyContribution);

  if (safeRemaining <= 0) {
    return { label: 'تم تحقيق الهدف' };
  }

  if (safeMonthlyContribution <= 0) {
    return { label: 'لا يمكن حساب التاريخ المتوقع' };
  }

  const paymentsNeeded = Math.ceil(safeRemaining / safeMonthlyContribution);
  const nextPaymentDate = getNextContributionDate(today, reminderDay);
  const expectedDate = addMonths(nextPaymentDate, paymentsNeeded - 1);
  const targetEndDate = parseGoalTargetMonthEnd(targetDate);
  const warning =
    targetEndDate && expectedDate.getTime() > targetEndDate.getTime()
      ? 'قد تحتاج إلى زيادة المساهمة الشهرية للوصول في الموعد.'
      : undefined;

  return {
    label: formatGoalDate(expectedDate),
    warning,
  };
}

export function getGoalStatus(status: GoalStatusId): GoalStatus {
  switch (status) {
    case 'started':
      return { id: status, label: 'بدأ للتو', tone: 'blue' };
    case 'on-track':
      return { id: status, label: 'على المسار', tone: 'green' };
    case 'needs-attention':
      return { id: status, label: 'يحتاج متابعة', tone: 'amber' };
    case 'near-completion':
      return { id: status, label: 'قريب من الإنجاز', tone: 'blue' };
    case 'delayed':
      return { id: status, label: 'متأخر', tone: 'danger' };
    case 'completed':
      return { id: status, label: 'مكتمل', tone: 'green' };
  }
}

export function getContributionPreviewStatus(progress: number): GoalStatus {
  if (progress >= 100) {
    return { id: 'completed', label: 'تم تحقيق الهدف', tone: 'green' };
  }

  if (progress >= 70) {
    return { id: 'contribution-near', label: 'اقتربت من الإنجاز', tone: 'blue' };
  }

  return { id: 'started', label: 'بدأ للتو', tone: 'blue' };
}

export function getUpdatedPlanStatus(): GoalStatus {
  return { id: 'plan-updated', label: 'خطة محدثة', tone: 'blue' };
}

export function formatSar(value: number) {
  return formatCurrency(value);
}

export function formatSignedSar(value: number) {
  return directionSafeText(`${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`);
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

function safePositive(value: number | undefined | null) {
  return Number.isFinite(value) ? Math.max(Number(value), 0) : 0;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseGoalDate(value: string) {
  const normalized = value.replace(/^اليوم،\s*/, '').trim();
  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? new Date(`${normalized}T00:00:00`) : null;

  if (isoDate && Number.isFinite(isoDate.getTime())) {
    return startOfDay(isoDate);
  }

  const [dayText, monthName, yearText] = normalized.split(/\s+/);
  const day = Number(dayText);
  const year = Number(yearText);
  const monthIndex = monthName ? arabicMonthIndex[monthName] : undefined;

  if (!Number.isFinite(day) || !Number.isFinite(year) || monthIndex === undefined) {
    return null;
  }

  return startOfDay(new Date(year, monthIndex, day));
}

function parseGoalTargetMonthEnd(value: string) {
  const [monthName, yearText] = value.trim().split(/\s+/);
  const year = Number(yearText);
  const monthIndex = monthName ? arabicMonthIndex[monthName] : undefined;

  if (!Number.isFinite(year) || monthIndex === undefined) {
    return null;
  }

  return startOfDay(new Date(year, monthIndex + 1, 0));
}

function getNextContributionDate(today: Date, reminderDay: string) {
  const dayOfMonth = getReminderDayOfMonth(reminderDay);
  const base = startOfDay(today);
  const nextDate = new Date(base.getFullYear(), base.getMonth(), dayOfMonth);

  if (nextDate.getTime() <= base.getTime()) {
    return new Date(base.getFullYear(), base.getMonth() + 1, dayOfMonth);
  }

  return nextDate;
}

function getReminderDayOfMonth(reminderDay: string) {
  if (reminderDay.includes('الأول')) {
    return 1;
  }
  if (reminderDay.includes('الخامس')) {
    return 5;
  }
  if (reminderDay.includes('العاشر')) {
    return 10;
  }
  if (reminderDay.includes('منتصف')) {
    return 15;
  }

  const explicitDay = Number(reminderDay.match(/\d+/)?.[0]);

  return Number.isFinite(explicitDay) ? Math.min(Math.max(explicitDay, 1), 28) : 1;
}

function addMonths(date: Date, months: number) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth() + Math.max(months, 0), date.getDate()));
}

export function formatGoalContributionDate(date: Date) {
  if (!Number.isFinite(date.getTime())) {
    return '';
  }

  const monthName = Object.entries(arabicMonthIndex).find(([, monthIndex]) => monthIndex === date.getMonth())?.[0];

  return monthName ? `${date.getDate()} ${monthName} ${date.getFullYear()}` : '';
}

export function getLocalTodayContributionLabel(now = new Date()) {
  const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return `اليوم، ${formatGoalContributionDate(localToday)}`;
}

function formatGoalDate(date: Date) {
  if (!Number.isFinite(date.getTime())) {
    return 'لا يمكن حساب التاريخ المتوقع';
  }

  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const arabicMonthIndex: Record<string, number> = {
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

export function getGoalStatusFromProgress(progress: number): GoalStatusId {
  if (progress >= 100) {
    return 'completed';
  }
  if (progress >= 70) {
    return 'near-completion';
  }
  if (progress <= 20) {
    return 'started';
  }

  return 'on-track';
}
