import type { TextInputProps } from 'react-native';

export type BusinessTypeId = 'trade' | 'services' | 'restaurant' | 'startup' | 'other';

export type FinancialGoalId =
  | 'cash-flow'
  | 'expenses'
  | 'profit'
  | 'invoices'
  | 'monthly-reports'
  | 'ai-performance';

export type BusinessInfoFieldId = 'businessName' | 'country' | 'currency' | 'monthlyRevenue' | 'monthlyExpense';

type BusinessTypeOption = {
  id: BusinessTypeId;
  icon: string;
  title: string;
  description: string;
};

type BusinessInfoField = {
  id: BusinessInfoFieldId;
  label: string;
  placeholder: string;
  defaultValue: string;
  keyboardType?: TextInputProps['keyboardType'];
  ltr?: boolean;
};

export const onboardingCopy = {
  label: 'إعداد Capital',
  businessTypeRequired: 'اختر نوع النشاط للمتابعة',
  businessNameRequired: 'أدخل اسم النشاط للمتابعة',
  goalsRequired: 'اختر هدفًا واحدًا على الأقل',
  linkingUnavailable: 'الربط سيكون متاحًا لاحقًا',
} as const;

export const businessTypeOptions = [
  {
    id: 'trade',
    icon: 'storefront-outline',
    title: 'متجر أو تجارة',
    description: 'مبيعات، مشتريات، مخزون، ومصاريف تشغيل',
  },
  {
    id: 'services',
    icon: 'briefcase-outline',
    title: 'خدمات مهنية',
    description: 'استشارات، وكالات، فريلانس، أو خدمات رقمية',
  },
  {
    id: 'restaurant',
    icon: 'cafe-outline',
    title: 'مطعم أو مقهى',
    description: 'مبيعات يومية، موردين، رواتب، وتكاليف تشغيل',
  },
  {
    id: 'startup',
    icon: 'rocket-outline',
    title: 'شركة ناشئة',
    description: 'نمو، مصاريف تقنية، إيرادات متكررة، وتقارير أداء',
  },
  {
    id: 'other',
    icon: 'sparkles-outline',
    title: 'نشاط آخر',
    description: 'سأخصص الإعدادات لاحقًا',
  },
] as const satisfies readonly BusinessTypeOption[];

export const businessActivityTypeOptions = [
  'برمجيات وخدمات SaaS',
  'تجارة إلكترونية',
  'خدمات مهنية',
  'وكالة أو استوديو',
  'مطاعم وضيافة',
  'تجارة وتجزئة',
  'تصنيع',
  'عقار',
  'نقل ولوجستيات',
  'نشاط آخر',
] as const;

export const businessSectorOptions = ['التقنية', 'التجارة الإلكترونية', 'الخدمات المهنية', 'الوكالات', 'صناعة المحتوى', 'أخرى'] as const;

export const countryOptions = [
  'المملكة العربية السعودية',
  'الإمارات العربية المتحدة',
  'الكويت',
  'البحرين',
  'قطر',
  'عُمان',
] as const;

export const currencyOptions = [
  'الريال السعودي — ر.س — SAR',
  'الدرهم الإماراتي — د.إ — AED',
  'الدينار الكويتي — د.ك — KWD',
  'الدينار البحريني — د.ب — BHD',
  'الريال القطري — ر.ق — QAR',
  'الريال العُماني — ر.ع — OMR',
  'الدولار الأمريكي — USD',
] as const;

export const businessInfoFields: readonly BusinessInfoField[] = [
  {
    id: 'businessName',
    label: 'اسم النشاط',
    placeholder: 'مثال: متجر Capital',
    defaultValue: '',
  },
  {
    id: 'country',
    label: 'الدولة',
    placeholder: 'المملكة العربية السعودية',
    defaultValue: 'المملكة العربية السعودية',
  },
  {
    id: 'currency',
    label: 'العملة',
    placeholder: 'الريال السعودي SAR',
    defaultValue: 'الريال السعودي SAR',
    ltr: true,
  },
  {
    id: 'monthlyRevenue',
    label: 'متوسط الإيراد الشهري',
    placeholder: '64000 SAR',
    defaultValue: '',
    keyboardType: 'numeric',
    ltr: true,
  },
  {
    id: 'monthlyExpense',
    label: 'متوسط المصروف الشهري',
    placeholder: '21000 SAR',
    defaultValue: '',
    keyboardType: 'numeric',
    ltr: true,
  },
];

export const financialGoalOptions = [
  { id: 'cash-flow', label: 'تحسين التدفق النقدي' },
  { id: 'expenses', label: 'تقليل المصروفات' },
  { id: 'profit', label: 'زيادة الربح' },
  { id: 'invoices', label: 'متابعة الفواتير والتحصيل' },
  { id: 'monthly-reports', label: 'تجهيز تقارير شهرية' },
  { id: 'ai-performance', label: 'فهم أداء النشاط بالذكاء المالي' },
] as const satisfies readonly { id: FinancialGoalId; label: string }[];

export const connectionOptions = [
  {
    icon: 'card-outline',
    title: 'الحساب البنكي',
    description: 'ربط آمن لحركات الحساب',
    status: 'قريبًا',
  },
  {
    icon: 'reader-outline',
    title: 'نقاط البيع',
    description: 'مبيعات المتجر أو الفرع',
    status: 'قريبًا',
  },
  {
    icon: 'document-text-outline',
    title: 'الفواتير',
    description: 'متابعة الفواتير والتحصيل',
    status: 'قريبًا',
  },
  {
    icon: 'cloud-upload-outline',
    title: 'الملفات اليدوية',
    description: 'رفع CSV أو Excel لاحقًا',
    status: 'قريبًا',
  },
] as const;

export const readySummaryItems = [
  'تم اختيار نوع النشاط',
  'تم تجهيز ملف النشاط',
  'تم تحديد الأهداف المالية',
  'يمكنك ربط الحسابات لاحقًا',
] as const;
