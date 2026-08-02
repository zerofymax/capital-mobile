import type { Ionicons } from '@expo/vector-icons';

export type QuickActionItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  featured?: boolean;
};

export type TransactionItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
};

export const homeQuickActions: readonly QuickActionItem[] = [
  { key: 'income', label: 'إضافة دخل', icon: 'add-outline' },
  { key: 'expense', label: 'إضافة مصروف', icon: 'remove-outline' },
  { key: 'invoices', label: 'الفواتير', icon: 'receipt-outline' },
  { key: 'accounts', label: 'الحسابات', icon: 'wallet-outline' },
  { key: 'report', label: 'التقرير', icon: 'document-text-outline' },
  { key: 'recurring', label: 'مصروف متكرر', icon: 'repeat-outline' },
  { key: 'goals', label: 'الأهداف', icon: 'flag-outline' },
  { key: 'ask', label: 'اسأل Capital', icon: 'sparkles-outline', featured: true },
] as const;
