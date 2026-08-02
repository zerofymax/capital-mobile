import { useSyncExternalStore } from 'react';

import {
  businessActivityTypeOptions,
  countryOptions,
  currencyOptions,
} from '@/screens/onboarding/onboarding-data';

export type BusinessActivityType = (typeof businessActivityTypeOptions)[number];
export type CountryOption = (typeof countryOptions)[number];
export type CurrencyOption = (typeof currencyOptions)[number];

export type RevenueModel =
  | 'اشتراكات متكررة'
  | 'مبيعات منتجات'
  | 'خدمات ومشاريع'
  | 'عمولات'
  | 'نموذج مختلط'
  | 'أخرى';

export type CompanySize =
  | 'موظف واحد'
  | '2–5 موظفين'
  | '6–10 موظفين'
  | '11–25 موظفًا'
  | '26–50 موظفًا'
  | 'أكثر من 50 موظفًا';

export type FiscalYearStart = 'يناير' | 'أبريل' | 'يوليو' | 'أكتوبر';

export type BusinessInformationState = {
  businessName: string;
  legalName: string;
  description: string;
  businessType: BusinessActivityType;
  revenueModel: RevenueModel;
  country: CountryOption;
  currency: CurrencyOption;
  fiscalYearStart: FiscalYearStart;
  taxNumber: string;
  website: string;
  teamSize: CompanySize;
};

export const revenueModelOptions: readonly RevenueModel[] = [
  'اشتراكات متكررة',
  'مبيعات منتجات',
  'خدمات ومشاريع',
  'عمولات',
  'نموذج مختلط',
  'أخرى',
];

export const companySizeOptions: readonly CompanySize[] = [
  'موظف واحد',
  '2–5 موظفين',
  '6–10 موظفين',
  '11–25 موظفًا',
  '26–50 موظفًا',
  'أكثر من 50 موظفًا',
];

export const fiscalYearStartOptions: readonly FiscalYearStart[] = ['يناير', 'أبريل', 'يوليو', 'أكتوبر'];

export const businessInformationOptions = {
  businessTypes: businessActivityTypeOptions,
  countries: countryOptions,
  currencies: currencyOptions,
  revenueModels: revenueModelOptions,
  companySizes: companySizeOptions,
  fiscalYearStarts: fiscalYearStartOptions,
} as const;

export const defaultBusinessInformation: BusinessInformationState = {
  businessName: 'استوديو رقمي',
  legalName: 'شركة الاستوديو الرقمي المحدودة',
  description: 'استوديو يقدم منتجات رقمية وخدمات SaaS للشركات الناشئة.',
  businessType: 'برمجيات وخدمات SaaS',
  revenueModel: 'اشتراكات متكررة',
  country: 'المملكة العربية السعودية',
  currency: 'الريال السعودي — ر.س — SAR',
  fiscalYearStart: 'يناير',
  taxNumber: '',
  website: 'https://capital.app',
  teamSize: '6–10 موظفين',
};

let currentBusinessInformation = defaultBusinessInformation;
const listeners = new Set<() => void>();

function emitBusinessInformationChange() {
  listeners.forEach((listener) => listener());
}

export function getBusinessInformationSnapshot() {
  return currentBusinessInformation;
}

export function saveBusinessInformation(nextState: BusinessInformationState) {
  currentBusinessInformation = nextState;
  emitBusinessInformationChange();
}

export function subscribeToBusinessInformation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useBusinessInformation() {
  return useSyncExternalStore(
    subscribeToBusinessInformation,
    getBusinessInformationSnapshot,
    getBusinessInformationSnapshot,
  );
}

export function getCurrencyCode(currency: string) {
  return currency.split('—').at(-1)?.trim() ?? currency;
}

export function formatBusinessLine(state: BusinessInformationState) {
  return `${state.businessType} — ${getCurrencyCode(state.currency)}`;
}
