import { File, Paths } from 'expo-file-system';

import {
  businessInformationOptions,
  getBusinessInformationSnapshot,
  saveBusinessInformation,
  type BusinessInformationState,
} from '@/screens/account/business-information-data';
import {
  getFinancialAccountsSnapshot,
  replaceFinancialAccounts,
  type FinancialAccount,
} from '@/screens/account/financial-accounts-data';
import {
  getUserProfile,
  profileAvatarColors,
  replaceUserProfile,
  type UserProfileState,
} from '@/screens/account/profile-data';
import {
  budgetCategories,
  type Budget,
} from '@/screens/budgets/budgets-data';
import {
  getBudgetsSnapshot,
  replaceBudgets,
} from '@/screens/budgets/budgets-store';
import { type FinancialGoal } from '@/screens/goals/goals-data';
import {
  getGoalsSnapshot,
  replaceGoals,
} from '@/screens/goals/goals-store';
import {
  type Invoice,
  type InvoiceItem,
  type InvoicePayment,
} from '@/screens/invoices/invoices-data';
import {
  getInvoicesSnapshot,
  replaceInvoices,
} from '@/screens/invoices/invoices-store';
import {
  getTransactionsSnapshot,
  replaceTransactions,
  type TransactionRecord,
} from '@/screens/ledger/ledger-data';
import {
  getRecurringExpensesSnapshot,
  replaceRecurringExpenses,
} from '@/screens/recurring-expenses/recurring-expenses-store';
import {
  type RecurringExpense,
  type RecurringPaymentRecord,
} from '@/screens/recurring-expenses/recurring-expenses-types';
import { type CompanyUpdate } from '@/screens/reports/company-update-types';
import {
  getStartupReportsSnapshot,
  replaceStartupReports,
} from '@/screens/reports/startup-report-store';
import {
  type StartupGoal,
  type StartupGoalMilestone,
} from '@/screens/reports/startup-goals-types';
import {
  getAppearanceSnapshot,
  setAppearancePreference,
  type AppearancePreference,
} from '@/state/appearance-state';
import {
  getCategories,
  replaceCategories,
  type FinancialCategory,
} from '@/state/categories-state';

export const CAPITAL_BACKUP_SCHEMA_VERSION = 1;
export const CAPITAL_BACKUP_MAX_BYTES = 10 * 1024 * 1024;

export type CapitalBackupData = {
  appearancePreference: AppearancePreference;
  budgets: Budget[];
  businessInformation: BusinessInformationState;
  categories: FinancialCategory[];
  financialAccounts: FinancialAccount[];
  goals: FinancialGoal[];
  invoices: Invoice[];
  profile: UserProfileState;
  recurringExpenses: RecurringExpense[];
  startupReports: {
    companyUpdates: Record<string, CompanyUpdate>;
    goals: StartupGoal[];
  };
  transactions: TransactionRecord[];
};

export type CapitalBackup = {
  app: 'Capital';
  schemaVersion: 1;
  exportedAt: string;
  data: CapitalBackupData;
};

export type BackupSummary = {
  sections: readonly {
    key: keyof CapitalBackupData;
    label: string;
    count: number;
  }[];
  transactions: number;
  invoices: number;
  categories: number;
  recurringExpenses: number;
  goals: number;
  financialAccounts: number;
};

export type BackupValidationErrorCode =
  | 'empty-file'
  | 'file-too-large'
  | 'invalid-json'
  | 'not-capital'
  | 'newer-schema'
  | 'older-schema'
  | 'invalid-data'
  | 'sensitive-data'
  | 'read-failed';

export type BackupValidationResult =
  | {
      ok: true;
      backup: CapitalBackup;
      summary: BackupSummary;
      warnings: readonly string[];
    }
  | {
      ok: false;
      code: BackupValidationErrorCode;
      reason: string;
    };

export type BackupImportResult =
  | { ok: true }
  | { ok: false; reason: string };

const sectionLabels: Record<keyof CapitalBackupData, string> = {
  appearancePreference: 'إعداد المظهر',
  budgets: 'الميزانيات',
  businessInformation: 'معلومات النشاط',
  categories: 'التصنيفات',
  financialAccounts: 'الحسابات المالية',
  goals: 'الأهداف المالية',
  invoices: 'الفواتير',
  profile: 'الملف الشخصي',
  recurringExpenses: 'المصروفات المتكررة',
  startupReports: 'أهداف وتحديثات الشركة اليدوية',
  transactions: 'العمليات',
};

export function createCapitalBackup(now = new Date()): CapitalBackup {
  const data: CapitalBackupData = {
    appearancePreference: getAppearanceSnapshot().preference,
    budgets: [...getBudgetsSnapshot().budgets],
    businessInformation: { ...getBusinessInformationSnapshot() },
    categories: [...getCategories()],
    financialAccounts: [...getFinancialAccountsSnapshot().accounts],
    goals: [...getGoalsSnapshot().goals],
    invoices: [...getInvoicesSnapshot().invoices],
    profile: { ...getUserProfile() },
    recurringExpenses: [...getRecurringExpensesSnapshot().expenses],
    startupReports: {
      companyUpdates: { ...getStartupReportsSnapshot().companyUpdates },
      goals: [...getStartupReportsSnapshot().goals],
    },
    transactions: [...getTransactionsSnapshot().transactions],
  };

  if (containsSensitiveKey(data)) {
    throw new Error('Sensitive data cannot be exported.');
  }

  return {
    app: 'Capital',
    schemaVersion: CAPITAL_BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
}

export function serializeCapitalBackup(backup: CapitalBackup) {
  return JSON.stringify(backup, null, 2);
}

export function buildCapitalBackupFileName(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `capital-backup-${year}-${month}-${day}.json`;
}

export function writeCapitalBackupToCache(backup: CapitalBackup, date = new Date()) {
  const fileName = buildCapitalBackupFileName(date);
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(serializeCapitalBackup(backup), { encoding: 'utf8' });

  return {
    fileName,
    uri: file.uri,
  };
}

export async function readAndValidateCapitalBackup(
  uri: string,
  reportedSize?: number,
): Promise<BackupValidationResult> {
  try {
    const file = new File(uri);
    const fileSize = reportedSize ?? file.size ?? 0;

    if (fileSize > CAPITAL_BACKUP_MAX_BYTES) {
      return failure('file-too-large', 'اختر ملف نسخة احتياطية صالحًا بحجم لا يتجاوز 10 ميجابايت.');
    }

    const text = await file.text();

    if (!text.trim()) {
      return failure('empty-file', 'الملف فارغ.');
    }

    if (getUtf8ByteLength(text) > CAPITAL_BACKUP_MAX_BYTES) {
      return failure('file-too-large', 'اختر ملف نسخة احتياطية صالحًا بحجم لا يتجاوز 10 ميجابايت.');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      return failure('invalid-json', 'الملف ليس نسخة احتياطية صالحة من Capital.');
    }

    return validateCapitalBackup(parsed);
  } catch {
    return failure('read-failed', 'تعذر قراءة الملف.');
  }
}

export function validateCapitalBackup(value: unknown): BackupValidationResult {
  if (!isRecord(value)) {
    return failure('invalid-data', 'الملف ليس نسخة احتياطية صالحة من Capital.');
  }

  if (value.app !== 'Capital') {
    return failure('not-capital', 'الملف ليس نسخة احتياطية صالحة من Capital.');
  }

  if (typeof value.schemaVersion !== 'number') {
    return failure('invalid-data', 'الملف لا يحتوي على إصدار Schema صالح.');
  }

  if (value.schemaVersion > CAPITAL_BACKUP_SCHEMA_VERSION) {
    return failure('newer-schema', 'تم إنشاء هذه النسخة باستخدام إصدار أحدث من Capital.');
  }

  if (value.schemaVersion < CAPITAL_BACKUP_SCHEMA_VERSION) {
    return failure('older-schema', 'إصدار النسخة الاحتياطية غير مدعوم.');
  }

  if (!isIsoDateTime(value.exportedAt) || !isRecord(value.data)) {
    return failure('invalid-data', 'بيانات النسخة الاحتياطية غير مكتملة.');
  }

  if (containsSensitiveKey(value.data)) {
    return failure('sensitive-data', 'تحتوي النسخة على بيانات غير مسموح باستيرادها.');
  }

  const data = value.data;

  if (
    !isBusinessInformation(data.businessInformation) ||
    !isUserProfile(data.profile) ||
    !isAppearancePreference(data.appearancePreference) ||
    !isArrayOf(data.categories, isFinancialCategory) ||
    !isArrayOf(data.financialAccounts, isFinancialAccount) ||
    !isArrayOf(data.transactions, isTransaction) ||
    !isArrayOf(data.invoices, isInvoice) ||
    !isArrayOf(data.recurringExpenses, isRecurringExpense) ||
    !isArrayOf(data.budgets, isBudget) ||
    !isArrayOf(data.goals, isFinancialGoal) ||
    !isStartupReports(data.startupReports)
  ) {
    return failure('invalid-data', 'أحد أقسام النسخة الاحتياطية غير صالح أو غير مكتمل.');
  }

  const backup = value as CapitalBackup;
  const relationshipValidation = validateRelationships(backup.data);

  if (!relationshipValidation.ok) {
    return failure('invalid-data', relationshipValidation.reason);
  }

  return {
    ok: true,
    backup,
    summary: summarizeCapitalBackup(backup.data),
    warnings: relationshipValidation.warnings,
  };
}

export function summarizeCapitalBackup(data: CapitalBackupData): BackupSummary {
  const sections: BackupSummary['sections'] = [
    { key: 'businessInformation', label: sectionLabels.businessInformation, count: 1 },
    { key: 'profile', label: sectionLabels.profile, count: 1 },
    { key: 'appearancePreference', label: sectionLabels.appearancePreference, count: 1 },
    { key: 'categories', label: sectionLabels.categories, count: data.categories.length },
    { key: 'financialAccounts', label: sectionLabels.financialAccounts, count: data.financialAccounts.length },
    { key: 'transactions', label: sectionLabels.transactions, count: data.transactions.length },
    { key: 'invoices', label: sectionLabels.invoices, count: data.invoices.length },
    { key: 'recurringExpenses', label: sectionLabels.recurringExpenses, count: data.recurringExpenses.length },
    { key: 'budgets', label: sectionLabels.budgets, count: data.budgets.length },
    { key: 'goals', label: sectionLabels.goals, count: data.goals.length },
    {
      key: 'startupReports',
      label: sectionLabels.startupReports,
      count: data.startupReports.goals.length + Object.keys(data.startupReports.companyUpdates).length,
    },
  ];

  return {
    sections,
    transactions: data.transactions.length,
    invoices: data.invoices.length,
    categories: data.categories.length,
    recurringExpenses: data.recurringExpenses.length,
    goals: data.goals.length,
    financialAccounts: data.financialAccounts.length,
  };
}

export function importCapitalBackup(backup: CapitalBackup): BackupImportResult {
  const current = createCapitalBackup();

  try {
    applyBackupData(backup.data);
    return { ok: true };
  } catch {
    try {
      applyBackupData(current.data);
    } catch {
      return {
        ok: false,
        reason: 'تعذر استيراد البيانات وتعذر استعادة الحالة السابقة داخل الجلسة الحالية.',
      };
    }

    return {
      ok: false,
      reason: 'تعذر استيراد البيانات. لم يتم تطبيق النسخة المختارة.',
    };
  }
}

function applyBackupData(data: CapitalBackupData) {
  saveBusinessInformation({ ...data.businessInformation });
  replaceUserProfile({ ...data.profile });
  replaceCategories(data.categories);
  replaceFinancialAccounts(data.financialAccounts);
  replaceTransactions(data.transactions);
  replaceInvoices(data.invoices);
  replaceRecurringExpenses(data.recurringExpenses);
  replaceBudgets(data.budgets);
  replaceGoals(data.goals);
  replaceStartupReports(data.startupReports);
  setAppearancePreference(data.appearancePreference);
}

function validateRelationships(data: CapitalBackupData):
  | { ok: true; warnings: string[] }
  | { ok: false; reason: string } {
  const uniqueChecks: readonly [string, readonly { id: string }[]][] = [
    ['التصنيفات', data.categories],
    ['الحسابات المالية', data.financialAccounts],
    ['العمليات', data.transactions],
    ['الفواتير', data.invoices],
    ['المصروفات المتكررة', data.recurringExpenses],
    ['الميزانيات', data.budgets],
    ['الأهداف المالية', data.goals],
    ['أهداف الشركة', data.startupReports.goals],
  ];

  for (const [label, items] of uniqueChecks) {
    if (hasDuplicateIds(items)) {
      return { ok: false, reason: `توجد معرّفات مكررة داخل قسم ${label}.` };
    }
  }

  for (const invoice of data.invoices) {
    if (hasDuplicateIds(invoice.items) || hasDuplicateIds(invoice.payments)) {
      return { ok: false, reason: `توجد بنود أو دفعات مكررة في الفاتورة ${invoice.invoiceNumber}.` };
    }
  }

  for (const expense of data.recurringExpenses) {
    if (hasDuplicateIds(expense.payments)) {
      return { ok: false, reason: `توجد دفعات مكررة في المصروف المتكرر ${expense.name}.` };
    }
  }

  for (const goal of data.goals) {
    if (hasDuplicateIds(goal.contributions)) {
      return { ok: false, reason: `توجد مساهمات مكررة في الهدف ${goal.name}.` };
    }
  }

  for (const goal of data.startupReports.goals) {
    if (hasDuplicateIds(goal.milestones)) {
      return { ok: false, reason: `توجد مراحل مكررة في هدف الشركة ${goal.title}.` };
    }
  }

  const categoryIds = new Set(data.categories.map((category) => category.id));
  const missingTransactionCategories = data.transactions.filter(
    (transaction) => !categoryIds.has(transaction.categoryId),
  ).length;
  const missingRecurringCategories = data.recurringExpenses.filter(
    (expense) => !categoryIds.has(expense.categoryId),
  ).length;
  const warnings: string[] = [];

  if (missingTransactionCategories > 0) {
    warnings.push(
      `${missingTransactionCategories} عملية تشير إلى تصنيف غير متاح، وستستخدم حالة العرض الاحتياطية الحالية.`,
    );
  }

  if (missingRecurringCategories > 0) {
    warnings.push(`${missingRecurringCategories} مصروف متكرر يشير إلى تصنيف غير متاح.`);
  }

  return { ok: true, warnings };
}

function hasDuplicateIds(items: readonly { id: string }[]) {
  const ids = new Set<string>();

  return items.some((item) => {
    if (ids.has(item.id)) {
      return true;
    }
    ids.add(item.id);
    return false;
  });
}

function containsSensitiveKey(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsSensitiveKey);
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).some(([key, child]) => {
    const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();
    const sensitive = ['token', 'secret', 'password', 'apikey', 'servicerole', 'session'].some(
      (term) => normalizedKey.includes(term),
    );
    return sensitive || containsSensitiveKey(child);
  });
}

function isBusinessInformation(value: unknown): value is BusinessInformationState {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'businessName',
      'legalName',
      'description',
      'businessType',
      'revenueModel',
      'country',
      'currency',
      'fiscalYearStart',
      'taxNumber',
      'website',
      'teamSize',
    ]) &&
    isOneOf(value.businessType, businessInformationOptions.businessTypes) &&
    isOneOf(value.revenueModel, businessInformationOptions.revenueModels) &&
    isOneOf(value.country, businessInformationOptions.countries) &&
    isOneOf(value.currency, businessInformationOptions.currencies) &&
    isOneOf(value.fiscalYearStart, businessInformationOptions.fiscalYearStarts) &&
    isOneOf(value.teamSize, businessInformationOptions.companySizes)
  );
}

function isUserProfile(value: unknown): value is UserProfileState {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'displayName',
      'email',
      'phone',
      'jobTitle',
      'avatarType',
      'avatarInitial',
      'avatarColor',
    ]) &&
    (value.avatarType === 'initial' || value.avatarType === 'icon') &&
    isOneOf(
      value.avatarColor,
      profileAvatarColors.map((color) => color.id),
    )
  );
}

function isAppearancePreference(value: unknown): value is AppearancePreference {
  return value === 'dark' || value === 'system';
}

function isFinancialCategory(value: unknown): value is FinancialCategory {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'type', 'name', 'icon', 'tone']) &&
    (value.type === 'income' || value.type === 'expense') &&
    isOneOf(value.tone, ['green', 'blue', 'amber', 'red', 'muted']) &&
    typeof value.isDefault === 'boolean' &&
    isOptionalString(value.description)
  );
}

function isFinancialAccount(value: unknown): value is FinancialAccount {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'name', 'type', 'institution', 'lastFour', 'currency', 'status', 'createdAt']) &&
    isOneOf(value.type, ['bank', 'cash', 'wallet', 'credit-card']) &&
    isOneOf(value.status, ['active', 'inactive']) &&
    isFiniteNumber(value.balance) &&
    isFiniteNumber(value.openingBalance) &&
    (value.creditLimit === null || isFiniteNumber(value.creditLimit)) &&
    typeof value.isDefault === 'boolean'
  );
}

function isTransaction(value: unknown): value is TransactionRecord {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'id',
      'type',
      'categoryId',
      'description',
      'note',
      'transactionDate',
      'createdAt',
      'updatedAt',
      'source',
    ]) &&
    (value.type === 'income' || value.type === 'expense') &&
    value.source === 'manual' &&
    isFiniteNumber(value.amount)
  );
}

function isInvoice(value: unknown): value is Invoice {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'id',
      'clientName',
      'invoiceNumber',
      'issueDate',
      'dueDate',
      'status',
      'notes',
      'createdAt',
    ]) &&
    isFiniteNumber(value.discount) &&
    isFiniteNumber(value.tax) &&
    isFiniteNumber(value.paid) &&
    isOneOf(value.status, [
      'awaiting-payment',
      'due-soon',
      'overdue',
      'partially-paid',
      'paid',
      'cancelled',
    ]) &&
    isOptionalString(value.paymentDate) &&
    isArrayOf(value.items, isInvoiceItem) &&
    isArrayOf(value.payments, isInvoicePayment)
  );
}

function isInvoiceItem(value: unknown): value is InvoiceItem {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'description']) &&
    isFiniteNumber(value.quantity) &&
    isFiniteNumber(value.unitPrice)
  );
}

function isInvoicePayment(value: unknown): value is InvoicePayment {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'date', 'method', 'reference']) &&
    isFiniteNumber(value.amount) &&
    isOptionalString(value.note)
  );
}

function isRecurringExpense(value: unknown): value is RecurringExpense {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'id',
      'name',
      'vendor',
      'categoryId',
      'currency',
      'frequency',
      'startDate',
      'renewalMode',
      'paymentMethod',
      'owner',
      'status',
      'createdAt',
      'updatedAt',
    ]) &&
    isOneOf(value.frequency, [
      'weekly',
      'monthly',
      'bimonthly',
      'quarterly',
      'semiannual',
      'annual',
      'custom',
    ]) &&
    isOneOf(value.renewalMode, ['automatic', 'manual']) &&
    isOneOf(value.paymentMethod, ['company-card', 'bank-account', 'cash', 'transfer', 'other']) &&
    isOneOf(value.status, ['active', 'paused']) &&
    isFiniteNumber(value.amount) &&
    typeof value.needsReview === 'boolean' &&
    isOptionalCustomInterval(value.customInterval) &&
    isOptionalFiniteNumber(value.reminderDays) &&
    isOptionalFiniteNumber(value.monthlySavingOpportunity) &&
    isArrayOf(value.payments, isRecurringPayment) &&
    isOptionalString(value.description) &&
    isOptionalString(value.nextDueDate) &&
    isOptionalString(value.endDate) &&
    isOptionalString(value.accountId) &&
    isOptionalString(value.reference) &&
    isOptionalString(value.notes) &&
    isOptionalString(value.reviewReason) &&
    isOptionalString(value.pausedAt) &&
    (value.usageLevel === undefined || isOneOf(value.usageLevel, ['مرتفع', 'متوسط', 'منخفض']))
  );
}

function isRecurringPayment(value: unknown): value is RecurringPaymentRecord {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'date', 'status', 'method']) &&
    value.status === 'paid' &&
    isFiniteNumber(value.amount) &&
    isOptionalString(value.note)
  );
}

function isBudget(value: unknown): value is Budget {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'categoryId', 'month', 'createdAt']) &&
    isOneOf(
      value.categoryId,
      budgetCategories.map((category) => category.id),
    ) &&
    isFiniteNumber(value.budget) &&
    isFiniteNumber(value.spent) &&
    isFiniteNumber(value.alertThreshold) &&
    typeof value.alertEnabled === 'boolean'
  );
}

function isFinancialGoal(value: unknown): value is FinancialGoal {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'id',
      'name',
      'typeId',
      'targetDate',
      'startDate',
      'status',
      'reminderDay',
    ]) &&
    isOneOf(value.typeId, ['saving', 'expansion', 'equipment', 'obligations', 'revenue', 'other']) &&
    isOneOf(value.status, [
      'started',
      'on-track',
      'needs-attention',
      'near-completion',
      'delayed',
      'completed',
    ]) &&
    isFiniteNumber(value.targetAmount) &&
    isFiniteNumber(value.currentAmount) &&
    isFiniteNumber(value.monthlyContribution) &&
    typeof value.reminderEnabled === 'boolean' &&
    isOptionalString(value.completionDate) &&
    isArrayOf(value.contributions, isGoalContribution)
  );
}

function isGoalContribution(
  value: unknown,
): value is FinancialGoal['contributions'][number] {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'title', 'date', 'source']) &&
    isFiniteNumber(value.amount) &&
    isOptionalString(value.note)
  );
}

function isStartupReports(value: unknown): value is CapitalBackupData['startupReports'] {
  if (
    !isRecord(value) ||
    !isArrayOf(value.goals, isStartupGoal) ||
    !isRecord(value.companyUpdates)
  ) {
    return false;
  }

  return Object.entries(value.companyUpdates).every(
    ([periodKey, update]) => isCompanyUpdate(update) && update.periodKey === periodKey,
  );
}

function isStartupGoal(value: unknown): value is StartupGoal {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'id',
      'title',
      'description',
      'type',
      'status',
      'owner',
      'unit',
      'startDate',
      'targetDate',
      'notes',
      'createdAt',
      'updatedAt',
    ]) &&
    isOneOf(value.type, [
      'product',
      'revenue',
      'customers',
      'users',
      'hiring',
      'expansion',
      'funding',
      'operations',
      'other',
    ]) &&
    isOneOf(value.status, ['not-started', 'active', 'completed', 'delayed', 'paused']) &&
    isOneOf(value.unit, [
      'ر.س',
      'عميل',
      'مستخدم',
      'موظف',
      'نسبة مئوية',
      'مرحلة',
      'عنصر',
      'وحدة أخرى',
    ]) &&
    isFiniteNumber(value.currentValue) &&
    isFiniteNumber(value.targetValue) &&
    isFiniteNumber(value.allocatedBudget) &&
    isFiniteNumber(value.spentBudget) &&
    isArrayOf(value.milestones, isStartupMilestone)
  );
}

function isStartupMilestone(value: unknown): value is StartupGoalMilestone {
  return (
    isRecord(value) &&
    hasStringFields(value, ['id', 'title']) &&
    typeof value.completed === 'boolean' &&
    isOptionalString(value.date)
  );
}

function isCompanyUpdate(value: unknown): value is CompanyUpdate {
  return (
    isRecord(value) &&
    hasStringFields(value, [
      'achievements',
      'challenges',
      'companyNeeds',
      'hiringUpdate',
      'nextSteps',
      'createdAt',
      'id',
      'periodKey',
      'status',
      'updatedAt',
    ]) &&
    isOneOf(value.status, ['draft', 'saved']) &&
    isFiniteNumber(value.month) &&
    isFiniteNumber(value.year) &&
    (value.financialSnapshot === null || isFinancialSnapshot(value.financialSnapshot))
  );
}

function isFinancialSnapshot(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  const numericKeys = [
    'activeCustomers',
    'cash',
    'churnRate',
    'employees',
    'keyGoalProgress',
    'monthlyBurn',
    'mrr',
    'newCustomers',
    'revenue',
    'revenueGrowth',
    'runwayMonths',
  ] as const;

  return (
    numericKeys.every((key) => value[key] === null || isFiniteNumber(value[key])) &&
    (value.keyGoalLabel === null || typeof value.keyGoalLabel === 'string')
  );
}

function hasStringFields(value: Record<string, unknown>, keys: readonly string[]) {
  return keys.every((key) => typeof value[key] === 'string');
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === 'string';
}

function isOptionalFiniteNumber(value: unknown) {
  return value === undefined || isFiniteNumber(value);
}

function isOptionalCustomInterval(value: unknown) {
  return (
    value === undefined ||
    (isRecord(value) &&
      isOneOf(value.unit, ['days', 'months']) &&
      isFiniteNumber(value.value) &&
      value.value > 0)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIsoDateTime(value: unknown) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T);
}

function getUtf8ByteLength(value: string) {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index) ?? 0;

    if (codePoint <= 0x7f) {
      bytes += 1;
    } else if (codePoint <= 0x7ff) {
      bytes += 2;
    } else if (codePoint <= 0xffff) {
      bytes += 3;
    } else {
      bytes += 4;
      index += 1;
    }
  }

  return bytes;
}

function failure(code: BackupValidationErrorCode, reason: string): BackupValidationResult {
  return { ok: false, code, reason };
}
