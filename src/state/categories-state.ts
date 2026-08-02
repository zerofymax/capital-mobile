import type { Ionicons } from '@expo/vector-icons';
import { useSyncExternalStore } from 'react';

import { prototypeTransactions } from '@/screens/operations/operations-data';

export type CategoryType = 'expense' | 'income';
export type CategoryTone = 'green' | 'blue' | 'amber' | 'red' | 'muted';

export type FinancialCategory = {
  id: string;
  type: CategoryType;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: CategoryTone;
  description?: string;
  isDefault: boolean;
};

export type CategoriesSnapshot = {
  categories: readonly FinancialCategory[];
  notice: string | null;
};

const defaultExpenseCategories: FinancialCategory[] = [
  { id: 'expense-salaries', type: 'expense', name: 'الرواتب', icon: 'people-outline', tone: 'green', isDefault: true },
  { id: 'expense-marketing', type: 'expense', name: 'التسويق', icon: 'megaphone-outline', tone: 'blue', isDefault: true },
  { id: 'expense-software', type: 'expense', name: 'البرمجيات والاشتراكات', icon: 'cube-outline', tone: 'green', isDefault: true },
  { id: 'expense-operations', type: 'expense', name: 'التشغيل', icon: 'construct-outline', tone: 'muted', isDefault: true },
  { id: 'expense-rent', type: 'expense', name: 'الإيجار والمكاتب', icon: 'business-outline', tone: 'amber', isDefault: true },
  { id: 'expense-transport', type: 'expense', name: 'النقل', icon: 'car-outline', tone: 'blue', isDefault: true },
  { id: 'expense-professional', type: 'expense', name: 'الخدمات المهنية', icon: 'briefcase-outline', tone: 'green', isDefault: true },
  { id: 'expense-tax', type: 'expense', name: 'الضرائب والرسوم', icon: 'receipt-outline', tone: 'red', isDefault: true },
  { id: 'expense-travel', type: 'expense', name: 'السفر', icon: 'airplane-outline', tone: 'blue', isDefault: true },
  { id: 'expense-other', type: 'expense', name: 'مصروفات أخرى', icon: 'ellipsis-horizontal-outline', tone: 'muted', isDefault: true },
];

const defaultIncomeCategories: FinancialCategory[] = [
  { id: 'income-subscriptions', type: 'income', name: 'اشتراكات العملاء', icon: 'repeat-outline', tone: 'green', isDefault: true },
  { id: 'income-products', type: 'income', name: 'مبيعات المنتجات', icon: 'storefront-outline', tone: 'blue', isDefault: true },
  { id: 'income-services', type: 'income', name: 'خدمات ومشاريع', icon: 'briefcase-outline', tone: 'green', isDefault: true },
  { id: 'income-commissions', type: 'income', name: 'عمولات', icon: 'cash-outline', tone: 'amber', isDefault: true },
  { id: 'income-recurring', type: 'income', name: 'إيرادات متكررة', icon: 'sync-outline', tone: 'green', isDefault: true },
  { id: 'income-non-operating', type: 'income', name: 'إيرادات غير تشغيلية', icon: 'trending-up-outline', tone: 'blue', isDefault: true },
  { id: 'income-other', type: 'income', name: 'إيرادات أخرى', icon: 'ellipsis-horizontal-outline', tone: 'muted', isDefault: true },
];

const defaultCategories: readonly FinancialCategory[] = [
  ...defaultExpenseCategories,
  ...defaultIncomeCategories,
];

const listeners = new Set<() => void>();

let snapshot: CategoriesSnapshot = {
  categories: defaultCategories,
  notice: null,
};

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useCategoriesStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCategories() {
  return snapshot.categories;
}

export function replaceCategories(categories: readonly FinancialCategory[]) {
  snapshot = {
    categories: [...categories],
    notice: null,
  };
  emit();
}

export function getCategoriesByType(type: CategoryType) {
  return snapshot.categories.filter((category) => category.type === type);
}

export function getCategoryById(id: string) {
  return snapshot.categories.find((category) => category.id === id) ?? null;
}

export function getCategoryNamesByType(type: CategoryType) {
  return getCategoriesByType(type).map((category) => category.name);
}

export function getCategoryTransactionCount(categoryName: string) {
  const normalizedName = normalizeCategoryName(categoryName);

  return prototypeTransactions.filter((transaction) => normalizeCategoryName(transaction.category) === normalizedName).length;
}

export function isCategoryNameDuplicate(type: CategoryType, name: string, excludeId?: string) {
  const normalizedName = normalizeCategoryName(name);

  return snapshot.categories.some(
    (category) => category.type === type && category.id !== excludeId && normalizeCategoryName(category.name) === normalizedName,
  );
}

export function addCategory(draft: Omit<FinancialCategory, 'id' | 'isDefault'>) {
  if (isCategoryNameDuplicate(draft.type, draft.name)) {
    snapshot = { ...snapshot, notice: 'يوجد تصنيف بهذا الاسم ضمن النوع نفسه' };
    emit();
    return null;
  }

  const category: FinancialCategory = {
    ...draft,
    id: `custom-${draft.type}-${Date.now()}`,
    isDefault: false,
  };

  snapshot = {
    categories: [...snapshot.categories, category],
    notice: 'تمت إضافة التصنيف',
  };
  emit();

  return category;
}

export function updateCategory(id: string, draft: Partial<Pick<FinancialCategory, 'name' | 'icon' | 'tone' | 'description'>>) {
  const currentCategory = getCategoryById(id);

  if (!currentCategory) {
    return false;
  }

  const nextName = draft.name?.trim() ?? currentCategory.name;

  if (isCategoryNameDuplicate(currentCategory.type, nextName, id)) {
    snapshot = { ...snapshot, notice: 'يوجد تصنيف بهذا الاسم ضمن النوع نفسه' };
    emit();
    return false;
  }

  snapshot = {
    categories: snapshot.categories.map((category) =>
      category.id === id
        ? {
            ...category,
            ...draft,
            name: nextName,
          }
        : category,
    ),
    notice: 'تم تحديث التصنيف',
  };
  emit();

  return true;
}

export function deleteCategory(id: string) {
  const category = getCategoryById(id);

  if (!category) {
    return false;
  }

  if (category.isDefault) {
    snapshot = { ...snapshot, notice: 'لا يمكن حذف تصنيف افتراضي مستخدم في التطبيق' };
    emit();
    return false;
  }

  snapshot = {
    categories: snapshot.categories.filter((item) => item.id !== id),
    notice: 'تم حذف التصنيف',
  };
  emit();

  return true;
}

export function clearCategoriesNotice() {
  if (!snapshot.notice) {
    return;
  }

  snapshot = { ...snapshot, notice: null };
  emit();
}

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar-SA');
}
