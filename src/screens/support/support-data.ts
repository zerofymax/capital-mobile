import type { Ionicons } from '@expo/vector-icons';

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type HelpTopic = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  keywords: string[];
  actions?: SupportActionRow[];
  faqs: FAQItem[];
};

export type ContactMethod = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  status: string;
};

export type SupportIssueType =
  | 'account'
  | 'operations'
  | 'bills'
  | 'cards'
  | 'suggestion';

export type FeedbackType =
  | 'ux'
  | 'technical'
  | 'feature'
  | 'design'
  | 'other';

export type LegalContentType = 'terms' | 'privacy';

export type SupportActionId =
  | 'ledger'
  | 'bills'
  | 'transfers'
  | 'invoices'
  | 'budgets'
  | 'reports'
  | 'financial-reports'
  | 'growth-metrics'
  | 'recurring-expenses'
  | 'financial-terms'
  | 'intelligence'
  | 'operations'
  | 'cards'
  | 'business-information'
  | 'edit-profile'
  | 'security'
  | 'privacy-legal';

export type SupportActionRow = {
  id: SupportActionId;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export const supportMessages = {
  issueTypeRequired: 'اختر نوع المشكلة',
  descriptionRequired: 'اكتب وصف المشكلة',
  supportRequestCreated: 'تم حفظ طلبك في النسخة التجريبية',
  feedbackTypeRequired: 'اختر نوع الملاحظة',
  ratingRequired: 'اختر التقييم',
  noteRequired: 'اكتب ملاحظتك',
  feedbackSent: 'تم حفظ ملاحظتك في النسخة التجريبية',
} as const;

export const helpTopics: HelpTopic[] = [
  {
    id: 'account-login',
    icon: 'person-circle-outline',
    title: 'الحساب وتسجيل الدخول',
    description: 'إدارة الدخول، رمز الحماية، ومعلومات الحساب',
    keywords: ['حساب', 'دخول', 'تسجيل', 'PIN', 'بصمة', 'معلومات الحساب'],
    actions: [
      { id: 'edit-profile', icon: 'person-outline', label: 'فتح الملف الشخصي' },
      { id: 'business-information', icon: 'business-outline', label: 'فتح معلومات النشاط' },
      { id: 'security', icon: 'shield-checkmark-outline', label: 'فتح إعدادات الأمان' },
    ],
    faqs: [
      {
        id: 'login-passcode',
        question: 'كيف أستخدم رمز الدخول؟',
        answer: 'رمز الدخول في هذا النموذج يساعدك تجربة تدفق الدخول فقط، ولا يحفظ جلسة حقيقية.',
      },
      {
        id: 'edit-account',
        question: 'هل يمكن تعديل معلومات الحساب؟',
        answer: 'تعديل الحساب سيكون متاحًا لاحقًا ضمن تجربة الإعدادات الكاملة.',
      },
    ],
  },
  {
    id: 'financial-operations',
    icon: 'list-outline',
    title: 'العمليات المالية',
    description: 'استخدام السجل، إضافة العمليات، التحويلات، والفواتير',
    keywords: ['عملية', 'معاملة', 'دخل', 'مصروف', 'تحويل', 'فاتورة', 'سجل'],
    actions: [
      { id: 'ledger', icon: 'list-outline', label: 'فتح السجل' },
      { id: 'transfers', icon: 'swap-horizontal-outline', label: 'فتح التحويلات' },
      { id: 'bills', icon: 'receipt-outline', label: 'فتح الفواتير' },
    ],
    faqs: [
      {
        id: 'add-transaction',
        question: 'إضافة عملية',
        answer: 'من شاشة السجل اضغط زر الإضافة، ثم اختر نوع العملية وأدخل المبلغ والتصنيف.',
      },
      {
        id: 'transaction-detail',
        question: 'مراجعة تفاصيل عملية',
        answer: 'اضغط على أي عملية في السجل لعرض التفاصيل والملاحظات المرتبطة بها.',
      },
      {
        id: 'transfers',
        question: 'التحويلات',
        answer: 'التحويلات الحالية نموذج أولي ولا تنفذ أي عملية مالية حقيقية.',
      },
      {
        id: 'bills',
        question: 'الفواتير',
        answer: 'يمكنك استعراض الفواتير ودفعها كنموذج أولي بدون خصم فعلي.',
      },
    ],
  },
  {
    id: 'bills-payments',
    icon: 'receipt-outline',
    title: 'الفواتير والمدفوعات',
    description: 'متابعة الفواتير ومراجعة حالات الاستحقاق',
    keywords: ['فواتير', 'مدفوعات', 'استحقاق', 'تحصيل', 'دفع'],
    actions: [
      { id: 'bills', icon: 'receipt-outline', label: 'فتح الفواتير' },
      { id: 'invoices', icon: 'document-text-outline', label: 'فتح الفواتير المستحقة' },
      { id: 'transfers', icon: 'swap-horizontal-outline', label: 'فتح التحويلات' },
    ],
    faqs: [
      {
        id: 'pay-bill',
        question: 'كيف أدفع فاتورة؟',
        answer: 'افتح الفواتير، اختر الفاتورة، ثم راجع الدفع. كل ذلك نموذج أولي بلا خصم فعلي.',
      },
      {
        id: 'bill-status',
        question: 'ماذا تعني حالة الفاتورة؟',
        answer: 'الحالة تساعدك تمييز الفواتير المستحقة والمدفوعة والمتأخرة في النموذج.',
      },
    ],
  },
  {
    id: 'cards',
    icon: 'card-outline',
    title: 'البطاقات',
    description: 'إدارة البطاقات وحدود الصرف كنموذج أولي',
    keywords: ['بطاقة', 'بطاقات', 'حدود', 'صرف', 'تجميد'],
    actions: [
      { id: 'cards', icon: 'card-outline', label: 'فتح البطاقات' },
      { id: 'budgets', icon: 'wallet-outline', label: 'فتح الميزانيات' },
    ],
    faqs: [
      {
        id: 'card-limits',
        question: 'كيف أغير حدود البطاقة؟',
        answer: 'من تفاصيل البطاقة اختر تغيير الحدود، ثم عدل الحدود واحفظها كنموذج أولي.',
      },
      {
        id: 'freeze-card',
        question: 'هل تجميد البطاقة حقيقي؟',
        answer: 'تجميد البطاقة في هذا النموذج يغير الواجهة فقط ولا يرسل طلبًا فعليًا.',
      },
    ],
  },
  {
    id: 'reports-ai',
    icon: 'sparkles-outline',
    title: 'التقارير والذكاء المالي',
    description: 'فهم التقارير والرؤى والتنبيهات الذكية',
    keywords: ['تقرير', 'تقارير', 'ذكاء', 'رؤى', 'تنبيهات', 'تحليل'],
    actions: [
      { id: 'financial-reports', icon: 'bar-chart-outline', label: 'فتح التقارير المالية' },
      { id: 'growth-metrics', icon: 'trending-up-outline', label: 'فتح مؤشرات النمو' },
      { id: 'intelligence', icon: 'sparkles-outline', label: 'فتح الذكاء المالي' },
    ],
    faqs: [
      {
        id: 'review-reports',
        question: 'كيف أراجع تقارير النشاط؟',
        answer: 'افتح تبويب التقارير لاختيار الفترة ومراجعة الملخصات المالية.',
      },
      {
        id: 'ai-insights',
        question: 'ما دور ذكاء Capital؟',
        answer: 'يعرض النموذج رؤى إرشادية مبنية على بيانات تجريبية محلية.',
      },
    ],
  },
  {
    id: 'security-privacy',
    icon: 'shield-checkmark-outline',
    title: 'الأمان والخصوصية',
    description: 'معلومات الخصوصية وحدود النموذج الأولي',
    keywords: ['أمان', 'خصوصية', 'بيانات', 'حفظ', 'سياسة', 'حماية'],
    actions: [
      { id: 'security', icon: 'shield-checkmark-outline', label: 'فتح إعدادات الأمان' },
      { id: 'privacy-legal', icon: 'lock-closed-outline', label: 'فتح الخصوصية والقانونية' },
    ],
    faqs: [
      {
        id: 'data-storage',
        question: 'هل بياناتي محفوظة؟',
        answer: 'لا يتم حفظ بيانات حقيقية أو إرسالها إلى خادم في هذا النموذج.',
      },
      {
        id: 'privacy-controls',
        question: 'أين أجد سياسة الخصوصية؟',
        answer: 'يمكنك فتح سياسة الخصوصية من شاشة عن Capital.',
      },
    ],
  },
];

export const defaultHelpTopic =
  helpTopics.find((topic) => topic.id === 'financial-operations') ?? helpTopics[0]!;

export const commonFaqs: FAQItem[] = [
  {
    id: 'common-add-transaction',
    question: 'كيف أضيف عملية جديدة؟',
    answer: 'من شاشة السجل اضغط زر الإضافة، ثم أدخل نوع العملية والمبلغ والتصنيف.',
  },
  {
    id: 'common-transfers',
    question: 'هل التحويلات حقيقية الآن؟',
    answer: 'لا. التحويلات الحالية نموذج أولي ولا تنفذ أي عملية مالية حقيقية.',
  },
  {
    id: 'common-reports',
    question: 'كيف أراجع تقارير النشاط؟',
    answer: 'افتح تبويب التقارير لمراجعة ملخص الأداء والفترات المتاحة.',
  },
  {
    id: 'common-data',
    question: 'هل بياناتي محفوظة؟',
    answer: 'لا يتم حفظ بيانات حقيقية أو إرسالها إلى خادم في هذا النموذج.',
  },
  {
    id: 'common-card-limits',
    question: 'كيف أغير حدود البطاقة؟',
    answer: 'افتح البطاقات، اختر البطاقة، ثم انتقل إلى تغيير الحدود.',
  },
];

export const contactMethods: ContactMethod[] = [
  {
    id: 'chat',
    icon: 'chatbubbles-outline',
    title: 'محادثة الدعم',
    description: 'تواصل فوري مع فريق الدعم',
    status: 'قريبًا',
  },
  {
    id: 'email',
    icon: 'mail-outline',
    title: 'البريد الإلكتروني',
    description: 'أرسل تفاصيل المشكلة لفريق الدعم',
    status: 'قريبًا',
  },
  {
    id: 'call',
    icon: 'call-outline',
    title: 'طلب اتصال',
    description: 'اطلب مكالمة من مختص',
    status: 'قريبًا',
  },
];

export const supportIssueTypes: { id: SupportIssueType; label: string }[] = [
  { id: 'account', label: 'مشكلة في الحساب' },
  { id: 'operations', label: 'مشكلة في العمليات' },
  { id: 'bills', label: 'مشكلة في الفواتير' },
  { id: 'cards', label: 'مشكلة في البطاقات' },
  { id: 'suggestion', label: 'اقتراح أو ملاحظة' },
];

export const feedbackTypes: { id: FeedbackType; label: string }[] = [
  { id: 'ux', label: 'تجربة المستخدم' },
  { id: 'technical', label: 'مشكلة تقنية' },
  { id: 'feature', label: 'اقتراح ميزة' },
  { id: 'design', label: 'تحسين التصميم' },
  { id: 'other', label: 'أخرى' },
];

export const ratingOptions = ['1', '2', '3', '4', '5'] as const;

export const aboutCapitalFeatures: SupportActionRow[] = [
  { id: 'ledger', icon: 'list-outline', label: 'السجل المالي' },
  { id: 'intelligence', icon: 'sparkles-outline', label: 'الذكاء المالي' },
  { id: 'reports', icon: 'bar-chart-outline', label: 'التقارير' },
  { id: 'operations', icon: 'receipt-outline', label: 'التحويلات والفواتير' },
  { id: 'cards', icon: 'card-outline', label: 'البطاقات' },
];

export const legalLinks: { id: LegalContentType; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: 'terms', icon: 'document-text-outline', label: 'الشروط والأحكام' },
  { id: 'privacy', icon: 'shield-checkmark-outline', label: 'سياسة الخصوصية' },
];

export const legalContent: Record<LegalContentType, { title: string; body: string }> = {
  terms: {
    title: 'الشروط والأحكام',
    body: 'هذه نسخة نموذجية لأغراض العرض فقط. Capital في هذه المرحلة Prototype محلي ولا ينفذ خدمات مالية أو مصرفية أو محاسبية فعلية. البيانات والعمليات المعروضة تجريبية، ولا تنشئ علاقة قانونية أو مصرفية حقيقية.',
  },
  privacy: {
    title: 'سياسة الخصوصية',
    body: 'هذه نسخة نموذجية لأغراض العرض فقط. لا يوجد Backend أو مزامنة سحابية في النموذج الحالي، ولا يتم إرسال بياناتك إلى خادم من هذه الشاشات التجريبية. بعض البيانات تحفظ محليًا داخل جلسة التطبيق فقط لتجربة التدفق.',
  },
};

export function getHelpTopic(topicId?: string | string[]) {
  const id = Array.isArray(topicId) ? topicId[0] : topicId;
  return helpTopics.find((topic) => topic.id === id) ?? null;
}

export function getLegalContentType(type?: string | string[]): LegalContentType | null {
  const value = Array.isArray(type) ? type[0] : type;

  if (value === 'terms' || value === 'privacy') {
    return value;
  }

  return null;
}
