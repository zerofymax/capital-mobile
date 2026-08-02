import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/rtl';
import { budgetCategories, type Budget, type BudgetCategory, type BudgetCategoryId } from './budgets-data';

export type BudgetTone = 'green' | 'amber' | 'orange' | 'danger';

export type BudgetStatus = {
  label: string;
  tone: BudgetTone;
};

export type BudgetSummary = Budget & {
  category: BudgetCategory;
  remaining: number;
  usage: number;
  status: BudgetStatus;
  alertAmount: number;
};

export const toneColors: Record<BudgetTone, { accent: string; tint: string; border: string; text: string }> = {
  green: {
    accent: '#35D39A',
    tint: 'rgba(53,211,154,0.12)',
    border: 'rgba(53,211,154,0.24)',
    text: '#35D39A',
  },
  amber: {
    accent: '#F3B744',
    tint: 'rgba(243,183,68,0.13)',
    border: 'rgba(243,183,68,0.26)',
    text: '#F3B744',
  },
  orange: {
    accent: '#F28B54',
    tint: 'rgba(242,139,84,0.13)',
    border: 'rgba(242,139,84,0.26)',
    text: '#F28B54',
  },
  danger: {
    accent: colors.semantic.danger,
    tint: colors.semantic.dangerTint,
    border: 'rgba(229,103,90,0.35)',
    text: colors.semantic.danger,
  },
};

export function getBudgetCategory(categoryId: BudgetCategoryId) {
  return budgetCategories.find((category) => category.id === categoryId) ?? budgetCategories[budgetCategories.length - 1]!;
}

export function getBudgetSummary(budget: Budget): BudgetSummary {
  const usage = budget.budget > 0 ? Math.round((budget.spent / budget.budget) * 100) : 0;

  return {
    ...budget,
    category: getBudgetCategory(budget.categoryId),
    remaining: budget.budget - budget.spent,
    usage,
    status: getBudgetStatus(usage),
    alertAmount: Math.round((budget.budget * budget.alertThreshold) / 100),
  };
}

export function getBudgetStatus(usage: number): BudgetStatus {
  if (usage >= 100) {
    return { label: 'تم تجاوز الميزانية', tone: 'danger' };
  }

  if (usage >= 90) {
    return { label: 'تنبيه مرتفع', tone: 'orange' };
  }

  if (usage >= 70) {
    return { label: 'اقتربت من الحد', tone: 'amber' };
  }

  return { label: 'ضمن الميزانية', tone: 'green' };
}

export function getEditBudgetStatus(usage: number, threshold: number): BudgetStatus {
  if (usage === threshold) {
    return { label: 'وصلت إلى حد التنبيه', tone: 'amber' };
  }

  return getBudgetStatus(usage);
}

export function formatSar(value: number) {
  return formatCurrency(value);
}

export function formatSignedSar(value: number) {
  return `${value < 0 ? '-' : ''}${formatSar(Math.abs(value))}`;
}

export function formatBudgetInput(value: string) {
  return value.replace(/[^\d-]/g, '');
}

export function parseBudgetAmount(value: string) {
  const normalized = value.replace(/,/g, '').trim();

  if (!normalized || normalized === '-') {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function formatInputAmount(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
