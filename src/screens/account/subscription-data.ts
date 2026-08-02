import { useSyncExternalStore } from 'react';

import type { AccountSubscription } from './account-data';

export type SubscriptionPlanId = 'basic' | 'pro' | 'business';
export type SubscriptionBillingCycle = 'monthly';
export type SubscriptionStatus = 'active';
export type SubscriptionCancellationReason = string | null;

export type SubscriptionPaymentMethod = {
  id: string;
  brand: 'visa' | 'mastercard' | 'mada' | 'generic';
  holderName: string;
  lastFour: string;
  expiry: string;
  label: string;
};

export type SubscriptionState = {
  planId: SubscriptionPlanId;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: SubscriptionBillingCycle;
  monthlyPrice: number;
  currency: string;
  nextRenewalDate: string;
  accessUntilDate: string;
  autoRenewEnabled: boolean;
  paymentMethod: SubscriptionPaymentMethod;
  cancellationReason: SubscriptionCancellationReason;
  cancelledAt: string | null;
};

export type SubscriptionPlanFeature = {
  id: string;
  label: string;
  included: boolean;
};

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  arabicLabel: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  isCurrent: boolean;
  isPopular?: boolean;
  annualMonthlyEquivalent?: number;
  features: SubscriptionPlanFeature[];
};

export type BillingInvoice = {
  id: string;
  invoiceNumber: string;
  planName: string;
  period: string;
  issueDate: string;
  amount: string;
  tax: string;
  paymentMethodLabel: string;
  status: 'paid' | 'due' | 'refunded' | 'failed';
  statusLabel: string;
  paymentDate: string;
  tone: 'success' | 'warning' | 'muted' | 'danger';
};

const initialSubscriptionState: SubscriptionState = {
  planId: 'pro',
  planName: 'Capital Pro',
  status: 'active',
  billingCycle: 'monthly',
  monthlyPrice: 49,
  currency: 'ر.س',
  nextRenewalDate: '15 أغسطس 2026',
  accessUntilDate: '14 أغسطس 2026',
  autoRenewEnabled: true,
  paymentMethod: {
    id: 'prototype-visa-4242',
    brand: 'visa',
    holderName: 'SARA ALKANANI',
    lastFour: '4242',
    expiry: '08/28',
    label: 'Visa •••• 4242',
  },
  cancellationReason: null,
  cancelledAt: null,
};

let subscriptionState = initialSubscriptionState;
const listeners = new Set<() => void>();

function emitSubscriptionChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeSubscriptionState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSubscriptionState() {
  return subscriptionState;
}

export function useSubscriptionState() {
  return useSyncExternalStore(subscribeSubscriptionState, getSubscriptionState, getSubscriptionState);
}

export function formatSubscriptionAmount(amount: number, currency = subscriptionState.currency) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${safeAmount.toLocaleString('en-US')} ${currency}`;
}

export function getSubscriptionPriceLine(state: SubscriptionState) {
  return `${formatSubscriptionAmount(state.monthlyPrice, state.currency)} / شهريًا`;
}

export function getPaymentMethodLabel(state: SubscriptionState) {
  return state.paymentMethod.label;
}

export function stopSubscriptionAutoRenewal(reason: string) {
  subscriptionState = {
    ...subscriptionState,
    autoRenewEnabled: false,
    cancellationReason: reason,
    cancelledAt: '26 يوليو 2026',
  };
  emitSubscriptionChange();
}

export function reactivateSubscriptionAutoRenewal() {
  subscriptionState = {
    ...subscriptionState,
    autoRenewEnabled: true,
    cancellationReason: null,
    cancelledAt: null,
  };
  emitSubscriptionChange();
}

export function updateSubscriptionPaymentMethod(paymentMethod: SubscriptionPaymentMethod) {
  subscriptionState = {
    ...subscriptionState,
    paymentMethod: {
      ...paymentMethod,
      label: `${getPaymentBrandLabel(paymentMethod.brand)} •••• ${paymentMethod.lastFour}`,
    },
  };
  emitSubscriptionChange();
}

export function getPaymentBrandLabel(brand: SubscriptionPaymentMethod['brand']) {
  const labels: Record<SubscriptionPaymentMethod['brand'], string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    mada: 'mada',
    generic: 'بطاقة',
  };

  return labels[brand];
}

export function getAccountSubscriptionViewModel(state: SubscriptionState): AccountSubscription {
  const autoRenewEnabled = state.autoRenewEnabled;

  return {
    title: state.planName,
    subtitle: autoRenewEnabled
      ? 'مزايا الذكاء المالي والتقارير المتقدمة مفعلة'
      : `ساري حتى ${state.accessUntilDate}`,
    renewalLabel: autoRenewEnabled ? 'التجديد القادم' : 'الوصول إلى المزايا حتى',
    renewalValue: autoRenewEnabled ? state.nextRenewalDate : state.accessUntilDate,
    statusLabel: 'الحالة',
    statusValue: autoRenewEnabled ? 'نشط' : 'تم إيقاف التجديد',
    ctaLabel: 'إدارة الاشتراك',
    priceLine: getSubscriptionPriceLine(state),
    renewalLine: autoRenewEnabled ? `التجديد في ${state.nextRenewalDate}` : `ساري حتى ${state.accessUntilDate}`,
  };
}

export const subscriptionPrototypeNotice =
  'هذه الصفحة نموذج محلي لإدارة الاشتراك. لا يتم تنفيذ دفع أو تغيير اشتراك حقيقي.';

export const temporaryPauseMessage = 'إيقاف الاشتراك مؤقتًا سيكون متاحًا لاحقًا.';
export const annualBillingMessage = 'الفوترة السنوية ستكون متاحة لاحقًا.';
export const businessUpgradeMessage = 'الترقية والدفع سيكونان متاحين في النسخة الإنتاجية.';
export const invoiceExportMessage = 'تصدير الفاتورة سيكون متاحًا لاحقًا.';
export const currentPaymentRemoveWarning =
  'هذه وسيلة الدفع الحالية للاشتراك. إضافة وسيلة بديلة ستكون متاحة لاحقًا.';
export const addPaymentMethodComingSoonMessage = 'إضافة وسيلة دفع جديدة ستكون متاحة لاحقًا.';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Capital Basic',
    arabicLabel: 'الأساسية',
    description: 'للبدء في متابعة الدخل والمصروفات الأساسية.',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'ر.س',
    isCurrent: false,
    features: [
      { id: 'transactions', label: 'تسجيل الدخل والمصروفات', included: true },
      { id: 'summary', label: 'ملخص مالي أساسي', included: true },
      { id: 'monthly-report', label: 'تقرير شهري واحد', included: true },
      { id: 'limited-alerts', label: 'تنبيهات محدودة', included: true },
      { id: 'one-device', label: 'جهاز واحد', included: true },
      { id: 'advanced-insights', label: 'رؤى Capital المتقدمة', included: false },
      { id: 'exports', label: 'تصدير جميع التقارير', included: false },
      { id: 'priority-support', label: 'دعم أولوية', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Capital Pro',
    arabicLabel: 'الاحترافية',
    description: 'لأصحاب الأنشطة الذين يحتاجون إلى تحليلات وتقارير أعمق.',
    monthlyPrice: 49,
    annualPrice: 470,
    currency: 'ر.س',
    isCurrent: true,
    isPopular: true,
    annualMonthlyEquivalent: 39,
    features: [
      { id: 'basic', label: 'جميع مزايا الخطة الأساسية', included: true },
      { id: 'advanced-reports', label: 'تقارير مالية متقدمة', included: true },
      { id: 'smart-insights', label: 'رؤى Capital الذكية', included: true },
      { id: 'subscriptions', label: 'متابعة الاشتراكات والالتزامات', included: true },
      { id: 'exports', label: 'تصدير التقارير', included: true },
      { id: 'priority-support', label: 'دعم أولوية', included: true },
      { id: 'three-devices', label: 'مزامنة حتى 3 أجهزة', included: true },
    ],
  },
  {
    id: 'business',
    name: 'Capital Business',
    arabicLabel: 'الأعمال',
    description: 'للفرق والمنشآت التي تحتاج إلى صلاحيات وتقارير موسعة.',
    monthlyPrice: 99,
    annualPrice: 99,
    currency: 'ر.س',
    isCurrent: false,
    features: [
      { id: 'pro', label: 'جميع مزايا Capital Pro', included: true },
      { id: 'multi-users', label: 'مستخدمون متعددون', included: true },
      { id: 'permissions', label: 'صلاحيات الفريق', included: true },
      { id: 'custom-reports', label: 'تقارير مخصصة', included: true },
      { id: 'unlimited-exports', label: 'تصدير غير محدود', included: true },
      { id: 'ten-devices', label: 'مزامنة حتى 10 أجهزة', included: true },
      { id: 'dedicated-support', label: 'دعم مخصص', included: true },
    ],
  },
];

export function getSubscriptionInvoices(state: SubscriptionState): BillingInvoice[] {
  const amount = formatSubscriptionAmount(state.monthlyPrice, state.currency);
  const paymentMethodLabel = getPaymentMethodLabel(state);

  return [
    {
      id: 'july-2026',
      invoiceNumber: 'CAP-INV-2026-0715',
      planName: state.planName,
      period: '15 يوليو 2026 — 14 أغسطس 2026',
      issueDate: '15 يوليو 2026',
      amount,
      tax: 'تجريبية',
      paymentMethodLabel,
      status: 'paid',
      statusLabel: 'مدفوعة',
      paymentDate: '15 يوليو 2026',
      tone: 'success',
    },
    {
      id: 'june-2026',
      invoiceNumber: 'CAP-INV-2026-0615',
      planName: state.planName,
      period: '15 يونيو 2026 — 14 يوليو 2026',
      issueDate: '15 يونيو 2026',
      amount,
      tax: 'تجريبية',
      paymentMethodLabel,
      status: 'paid',
      statusLabel: 'مدفوعة',
      paymentDate: '15 يونيو 2026',
      tone: 'success',
    },
    {
      id: 'may-2026',
      invoiceNumber: 'CAP-INV-2026-0515',
      planName: state.planName,
      period: '15 مايو 2026 — 14 يونيو 2026',
      issueDate: '15 مايو 2026',
      amount,
      tax: 'تجريبية',
      paymentMethodLabel,
      status: 'paid',
      statusLabel: 'مدفوعة',
      paymentDate: '15 مايو 2026',
      tone: 'success',
    },
    {
      id: 'april-2026',
      invoiceNumber: 'CAP-INV-2026-0415',
      planName: state.planName,
      period: '15 أبريل 2026 — 14 مايو 2026',
      issueDate: '15 أبريل 2026',
      amount,
      tax: 'تجريبية',
      paymentMethodLabel,
      status: 'paid',
      statusLabel: 'مدفوعة',
      paymentDate: '15 أبريل 2026',
      tone: 'success',
    },
  ];
}
