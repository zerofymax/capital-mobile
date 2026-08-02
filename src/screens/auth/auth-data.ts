import type { TextInputProps } from 'react-native';

type RegisterField = {
  id: 'name' | 'email' | 'phone' | 'businessName';
  label: string;
  keyboardType?: TextInputProps['keyboardType'];
  textContentType?: TextInputProps['textContentType'];
  ltr?: boolean;
};

export const authMessages = {
  loginPrototype: 'هذا نموذج أولي، لا يتم التحقق من البيانات الآن',
  loginMissingFields: 'أدخل بيانات الدخول للمتابعة',
  biometricUnavailable: 'تسجيل الدخول البيومتري سيكون متاحًا لاحقًا',
  recoveryUnavailable: 'استعادة الدخول ستكون متاحة لاحقًا',
  registerMissingFields: 'أكمل البيانات الأساسية للمتابعة',
  pinIncomplete: 'أدخل رمزًا من 4 أرقام',
} as const;

export const registerFields: readonly RegisterField[] = [
  { id: 'name', label: 'الاسم', textContentType: 'name' },
  { id: 'email', label: 'البريد الإلكتروني', keyboardType: 'email-address', textContentType: 'emailAddress', ltr: true },
  { id: 'phone', label: 'رقم الجوال', keyboardType: 'phone-pad', textContentType: 'telephoneNumber', ltr: true },
  { id: 'businessName', label: 'اسم النشاط', textContentType: 'organizationName' },
] as const;

export type RegisterFieldId = (typeof registerFields)[number]['id'];
