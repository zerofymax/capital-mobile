import { useSyncExternalStore } from 'react';

import { currencyOptions } from '@/screens/onboarding/onboarding-data';

export type FinancialAccountId = string;
export type FinancialAccountType = 'bank' | 'cash' | 'wallet' | 'credit-card';
export type FinancialAccountStatus = 'active' | 'inactive';
export type CurrencyOption = (typeof currencyOptions)[number];

export type FinancialAccount = {
  id: FinancialAccountId;
  name: string;
  type: FinancialAccountType;
  institution: string;
  lastFour: string;
  currency: CurrencyOption;
  balance: number;
  openingBalance: number;
  creditLimit: number | null;
  status: FinancialAccountStatus;
  isDefault: boolean;
  createdAt: string;
};

export type FinancialAccountsState = {
  accounts: FinancialAccount[];
};

export type FinancialAccountFormState = {
  name: string;
  type: FinancialAccountType | '';
  institution: string;
  lastFour: string;
  currency: CurrencyOption | '';
  openingBalance: string;
  creditLimit: string;
  status: FinancialAccountStatus;
  isDefault: boolean;
};

export const financialAccountTypes: readonly {
  id: FinancialAccountType;
  label: string;
  icon: 'business-outline' | 'cash-outline' | 'wallet-outline' | 'card-outline';
}[] = [
  { id: 'bank', label: 'حساب بنكي', icon: 'business-outline' },
  { id: 'cash', label: 'نقدي', icon: 'cash-outline' },
  { id: 'wallet', label: 'محفظة إلكترونية', icon: 'wallet-outline' },
  { id: 'credit-card', label: 'بطاقة ائتمانية', icon: 'card-outline' },
];

export const financialAccountStatusOptions: readonly {
  id: FinancialAccountStatus;
  label: string;
}[] = [
  { id: 'active', label: 'نشط' },
  { id: 'inactive', label: 'غير نشط' },
];

const sarCurrency = currencyOptions[0];

const initialAccounts: FinancialAccount[] = [
  {
    id: 'operational-bank',
    name: 'الحساب التشغيلي',
    type: 'bank',
    institution: 'بنك الراجحي',
    lastFour: '4281',
    currency: sarCurrency,
    balance: 128340,
    openingBalance: 100000,
    creditLimit: null,
    status: 'active',
    isDefault: true,
    createdAt: '2026-07-01',
  },
  {
    id: 'cash-box',
    name: 'الصندوق',
    type: 'cash',
    institution: '',
    lastFour: '',
    currency: sarCurrency,
    balance: 12500,
    openingBalance: 12500,
    creditLimit: null,
    status: 'active',
    isDefault: false,
    createdAt: '2026-07-02',
  },
  {
    id: 'company-card',
    name: 'بطاقة الشركة',
    type: 'credit-card',
    institution: 'بطاقة Capital',
    lastFour: '2219',
    currency: sarCurrency,
    balance: -4200,
    openingBalance: -4200,
    creditLimit: 50000,
    status: 'active',
    isDefault: false,
    createdAt: '2026-07-03',
  },
];

let currentState: FinancialAccountsState = {
  accounts: initialAccounts,
};

const listeners = new Set<() => void>();

function emitFinancialAccountsChange() {
  listeners.forEach((listener) => listener());
}

function sanitizeAmount(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function ensureSingleDefault(accounts: FinancialAccount[]) {
  const activeAccounts = accounts.filter((account) => account.status === 'active');
  const defaultAccount = activeAccounts.find((account) => account.isDefault);

  if (defaultAccount) {
    return accounts.map((account) => ({
      ...account,
      isDefault: account.id === defaultAccount.id,
    }));
  }

  const fallbackDefault = activeAccounts[0];

  if (!fallbackDefault) {
    return accounts.map((account) => ({ ...account, isDefault: false }));
  }

  return accounts.map((account) => ({
    ...account,
    isDefault: account.id === fallbackDefault.id,
  }));
}

function createAccountId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06ff\w-]/g, '');

  return `account-${slug || 'local'}-${Date.now().toString(36)}`;
}

export function subscribeFinancialAccounts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFinancialAccounts() {
  return currentState.accounts;
}

export function getFinancialAccountsSnapshot() {
  return currentState;
}

export function replaceFinancialAccounts(accounts: readonly FinancialAccount[]) {
  currentState = {
    accounts: ensureSingleDefault([...accounts]),
  };
  emitFinancialAccountsChange();
}

export function getFinancialAccount(accountId?: string) {
  if (!accountId) {
    return undefined;
  }

  return currentState.accounts.find((account) => account.id === accountId);
}

export function useFinancialAccounts() {
  return useSyncExternalStore(
    subscribeFinancialAccounts,
    getFinancialAccountsSnapshot,
    getFinancialAccountsSnapshot,
  );
}

export function addFinancialAccount(formState: FinancialAccountFormState) {
  const openingBalance = parseMoneyInput(formState.openingBalance) ?? 0;
  const creditLimit = formState.type === 'credit-card' ? parseMoneyInput(formState.creditLimit) : null;
  const nextAccount: FinancialAccount = {
    id: createAccountId(formState.name),
    name: formState.name.trim(),
    type: formState.type || 'bank',
    institution: formState.institution.trim(),
    lastFour: formState.lastFour.trim(),
    currency: formState.currency || sarCurrency,
    balance: sanitizeAmount(openingBalance),
    openingBalance: sanitizeAmount(openingBalance),
    creditLimit: creditLimit === null ? null : sanitizeAmount(creditLimit),
    status: formState.status,
    isDefault: formState.isDefault,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const accounts = formState.isDefault
    ? currentState.accounts.map((account) => ({ ...account, isDefault: false }))
    : currentState.accounts;

  currentState = {
    accounts: ensureSingleDefault([...accounts, nextAccount]),
  };
  emitFinancialAccountsChange();

  return nextAccount;
}

export function updateFinancialAccount(accountId: FinancialAccountId, formState: FinancialAccountFormState) {
  const currentAccount = getFinancialAccount(accountId);

  if (!currentAccount) {
    return undefined;
  }

  const openingBalance = parseMoneyInput(formState.openingBalance) ?? currentAccount.openingBalance;
  const creditLimit = formState.type === 'credit-card' ? parseMoneyInput(formState.creditLimit) : null;

  const accounts = currentState.accounts.map((account) => {
    if (account.id !== accountId) {
      return formState.isDefault ? { ...account, isDefault: false } : account;
    }

    return {
      ...account,
      name: formState.name.trim(),
      type: formState.type || account.type,
      institution: formState.institution.trim(),
      lastFour: formState.lastFour.trim(),
      currency: formState.currency || account.currency,
      balance: sanitizeAmount(openingBalance),
      openingBalance: sanitizeAmount(openingBalance),
      creditLimit: creditLimit === null ? null : sanitizeAmount(creditLimit),
      status: formState.status,
      isDefault: formState.isDefault,
    };
  });

  currentState = {
    accounts: ensureSingleDefault(accounts),
  };
  emitFinancialAccountsChange();

  return getFinancialAccount(accountId);
}

export function setDefaultFinancialAccount(accountId: FinancialAccountId) {
  currentState = {
    accounts: ensureSingleDefault(
      currentState.accounts.map((account) => ({
        ...account,
        isDefault: account.id === accountId,
        status: account.id === accountId ? 'active' : account.status,
      })),
    ),
  };
  emitFinancialAccountsChange();
}

export function toggleFinancialAccountStatus(accountId: FinancialAccountId) {
  currentState = {
    accounts: ensureSingleDefault(
      currentState.accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              status: account.status === 'active' ? 'inactive' : 'active',
            }
          : account,
      ),
    ),
  };
  emitFinancialAccountsChange();

  return getFinancialAccount(accountId);
}

export function createFinancialAccountFormState(account?: FinancialAccount): FinancialAccountFormState {
  return {
    name: account?.name ?? '',
    type: account?.type ?? 'bank',
    institution: account?.institution ?? '',
    lastFour: account?.lastFour ?? '',
    currency: account?.currency ?? sarCurrency,
    openingBalance: account ? String(account.openingBalance) : '0',
    creditLimit: account?.creditLimit ? String(account.creditLimit) : '',
    status: account?.status ?? 'active',
    isDefault: account?.isDefault ?? false,
  };
}

export function getFinancialAccountTypeLabel(type: FinancialAccountType) {
  return financialAccountTypes.find((option) => option.id === type)?.label ?? type;
}

export function getFinancialAccountTypeIcon(type: FinancialAccountType) {
  return financialAccountTypes.find((option) => option.id === type)?.icon ?? 'wallet-outline';
}

export function getFinancialAccountStatusLabel(status: FinancialAccountStatus) {
  return status === 'active' ? 'نشط' : 'غير نشط';
}

export function getCurrencyCode(currency: string) {
  return currency.split('—').at(-1)?.trim() ?? currency.split('â€”').at(-1)?.trim() ?? currency;
}

export function formatAccountAmount(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(safeValue);
}

export function parseMoneyInput(value: string) {
  const normalized = value.trim().replace(/,/g, '');

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeMoneyInput(value: string) {
  return value.replace(/[^\d.,-]/g, '');
}

export function normalizeLastFourInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function summarizeAccountsByCurrency(accounts: readonly FinancialAccount[]) {
  const totals = new Map<CurrencyOption, number>();

  accounts
    .filter((account) => account.status === 'active')
    .forEach((account) => {
      totals.set(account.currency, (totals.get(account.currency) ?? 0) + sanitizeAmount(account.balance));
    });

  return Array.from(totals.entries()).map(([currency, balance]) => ({
    currency,
    code: getCurrencyCode(currency),
    balance: sanitizeAmount(balance),
  }));
}
