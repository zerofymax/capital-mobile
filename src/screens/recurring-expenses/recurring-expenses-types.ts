import type { Ionicons } from '@expo/vector-icons';

export type RecurringExpenseStatus = 'active' | 'paused';

export type RecurringFrequency =
  | 'weekly'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'custom';

export type RenewalMode = 'automatic' | 'manual';

export type RecurringPaymentMethod = 'company-card' | 'bank-account' | 'cash' | 'transfer' | 'other';

export type RecurringExpenseReviewStatus = 'normal' | 'needs-review';

export type CustomRecurringInterval = {
  unit: 'days' | 'months';
  value: number;
};

export type RecurringPaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'paid';
  method: RecurringPaymentMethod;
  note?: string;
};

export type RecurringExpense = {
  id: string;
  name: string;
  vendor: string;
  description?: string;
  categoryId: string;
  amount: number;
  currency: string;
  frequency: RecurringFrequency;
  customInterval?: CustomRecurringInterval;
  startDate: string;
  nextDueDate?: string;
  endDate?: string;
  renewalMode: RenewalMode;
  paymentMethod: RecurringPaymentMethod;
  accountId?: string;
  reference?: string;
  owner: string;
  reminderDays?: number;
  status: RecurringExpenseStatus;
  usageLevel?: 'مرتفع' | 'متوسط' | 'منخفض';
  needsReview: boolean;
  reviewReason?: string;
  monthlySavingOpportunity?: number;
  notes?: string;
  payments: RecurringPaymentRecord[];
  createdAt: string;
  updatedAt: string;
  pausedAt?: string;
};

export type RecurringExpenseFormValues = {
  name: string;
  vendor: string;
  description: string;
  categoryId: string;
  amount: string;
  frequency: RecurringFrequency | '';
  customIntervalValue: string;
  customIntervalUnit: CustomRecurringInterval['unit'];
  startDate: string;
  nextDueDate: string;
  endDate: string;
  renewalMode: RenewalMode;
  paymentMethod: RecurringPaymentMethod;
  accountId: string;
  reference: string;
  owner: string;
  reminderDays: string;
  needsReview: boolean;
  monthlySavingOpportunity: string;
  notes: string;
};

export type RecurringExpenseFilter =
  | 'all'
  | 'upcoming'
  | 'subscriptions'
  | 'operational'
  | 'paused'
  | 'needs-review';

export type RecurringExpenseActionIcon = keyof typeof Ionicons.glyphMap;
