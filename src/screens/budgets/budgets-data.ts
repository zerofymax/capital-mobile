import type { Ionicons } from '@expo/vector-icons';

export type BudgetCategoryId =
  | 'marketing'
  | 'operations'
  | 'payroll'
  | 'subscriptions'
  | 'transport'
  | 'rent'
  | 'utilities'
  | 'other';

export type BudgetCategory = {
  id: BudgetCategoryId;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type Budget = {
  id: string;
  categoryId: BudgetCategoryId;
  budget: number;
  spent: number;
  month: string;
  alertThreshold: number;
  alertEnabled: boolean;
  createdAt: string;
};

export const budgetCategories: BudgetCategory[] = [
  { id: 'marketing', name: 'التسويق', icon: 'megaphone-outline' },
  { id: 'operations', name: 'التشغيل', icon: 'settings-outline' },
  { id: 'payroll', name: 'الرواتب', icon: 'briefcase-outline' },
  { id: 'subscriptions', name: 'الاشتراكات', icon: 'repeat-outline' },
  { id: 'transport', name: 'النقل', icon: 'car-outline' },
  { id: 'rent', name: 'الإيجار', icon: 'home-outline' },
  { id: 'utilities', name: 'المرافق', icon: 'flash-outline' },
  { id: 'other', name: 'أخرى', icon: 'apps-outline' },
];

export const budgetMonths = ['يونيو 2026', 'يوليو 2026', 'أغسطس 2026', 'سبتمبر 2026'] as const;
export const thresholdOptions = [70, 80, 90] as const;

export const initialBudgets: Budget[] = [
  {
    id: 'budget-marketing-july-2026',
    categoryId: 'marketing',
    budget: 5000,
    spent: 3200,
    month: 'يوليو 2026',
    alertThreshold: 80,
    alertEnabled: true,
    createdAt: '1 يوليو 2026',
  },
  {
    id: 'budget-operations-july-2026',
    categoryId: 'operations',
    budget: 6000,
    spent: 5100,
    month: 'يوليو 2026',
    alertThreshold: 80,
    alertEnabled: true,
    createdAt: '1 يوليو 2026',
  },
  {
    id: 'budget-payroll-july-2026',
    categoryId: 'payroll',
    budget: 7000,
    spent: 4900,
    month: 'يوليو 2026',
    alertThreshold: 80,
    alertEnabled: true,
    createdAt: '1 يوليو 2026',
  },
  {
    id: 'budget-subscriptions-july-2026',
    categoryId: 'subscriptions',
    budget: 1200,
    spent: 1350,
    month: 'يوليو 2026',
    alertThreshold: 80,
    alertEnabled: true,
    createdAt: '1 يوليو 2026',
  },
  {
    id: 'budget-transport-july-2026',
    categoryId: 'transport',
    budget: 800,
    spent: 420,
    month: 'يوليو 2026',
    alertThreshold: 80,
    alertEnabled: true,
    createdAt: '1 يوليو 2026',
  },
];

export const recentMarketingExpenses = [
  { id: 'expense-social-ads', title: 'إعلانات منصات التواصل', date: '20 يوليو 2026', amount: 1200 },
  { id: 'expense-campaign', title: 'تصميم حملة إعلانية', date: '15 يوليو 2026', amount: 1000 },
  { id: 'expense-search-ads', title: 'إعلانات البحث', date: '8 يوليو 2026', amount: 1000 },
] as const;
