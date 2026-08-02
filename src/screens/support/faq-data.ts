export type FaqCategory = 'account' | 'transactions' | 'intelligence' | 'subscription';

export type RelatedArticleId = 'data-consent' | 'data-export';

export type FaqCategoryOption = {
  id: FaqCategory;
  label: string;
};

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  relatedArticleIds?: RelatedArticleId[];
};

export const faqCategories: FaqCategoryOption[] = [
  { id: 'account', label: 'الحساب' },
  { id: 'transactions', label: 'السجل والمعاملات' },
  { id: 'intelligence', label: 'الذكاء المالي' },
  { id: 'subscription', label: 'الاشتراك' },
];

export const defaultFaqCategory: FaqCategory = 'account';

export const faqItems: FaqItem[] = [
  {
    id: 'change-email',
    category: 'account',
    question: 'كيف أغير بريدي الإلكتروني؟',
    answer:
      'يمكنك تغيير بريدك الإلكتروني من الحساب ← إعدادات الحساب ← البريد الإلكتروني. قد نطلب منك تأكيد البريد الجديد لحماية حسابك.',
  },
  {
    id: 'edit-business-info',
    category: 'account',
    question: 'كيف أعدل معلومات نشاطي؟',
    answer:
      'انتقل إلى الحساب ← معلومات النشاط، ثم عدل الاسم التجاري أو نوع النشاط أو الدولة أو العملة. هذه التغييرات محلية في النموذج الحالي.',
  },
  {
    id: 'delete-account',
    category: 'account',
    question: 'كيف أحذف حسابي؟',
    answer:
      'يمكنك حذف حسابك من:\nالحساب ← الخصوصية والقانونية ← حذف الحساب.\n\nسيطلب منك التطبيق تأكيد كلمة المرور أو رمز PIN، ثم كتابة عبارة تأكيد. بعد ذلك تبدأ مهلة قصيرة تسمح لك بالتراجع قبل الحذف النهائي وفقدان جميع بياناتك المالية بشكل دائم.',
    relatedArticleIds: ['data-consent', 'data-export'],
  },
  {
    id: 'refund-subscription',
    category: 'account',
    question: 'هل يمكنني استرداد اشتراكي؟',
    answer:
      'طلبات الاسترداد تعتمد على حالة الاشتراك وتاريخ التجديد. تواصل مع الدعم لتقديم طلب ومراجعته.',
  },
  {
    id: 'add-income-expense',
    category: 'transactions',
    question: 'كيف أضيف دخلًا أو مصروفًا؟',
    answer:
      'من الرئيسية أو السجل اضغط زر الإضافة، ثم اختر نوع العملية وأكمل البيانات المطلوبة.',
  },
  {
    id: 'edit-transaction',
    category: 'transactions',
    question: 'كيف أعدل معاملة؟',
    answer:
      'افتح المعاملة من السجل ثم اختر تعديل. إذا غادرت قبل الحفظ سيظهر تنبيه بالتغييرات غير المحفوظة.',
  },
  {
    id: 'delete-transaction',
    category: 'transactions',
    question: 'كيف أحذف معاملة؟',
    answer: 'من تفاصيل المعاملة اختر حذف، ثم أكد العملية من نافذة التأكيد.',
  },
  {
    id: 'amount-sign',
    category: 'transactions',
    question: 'لماذا يظهر المبلغ بعلامة موجبة أو سالبة؟',
    answer:
      'علامة الموجب تشير إلى الدخل، وعلامة السالب تشير إلى المصروف أو المبلغ الخارج.',
  },
  {
    id: 'ai-how',
    category: 'intelligence',
    question: 'كيف يعمل الذكاء المالي؟',
    answer:
      'يحلل Capital البيانات المحلية التجريبية ليعرض ملخصات ومخاطر وفرصًا وإجراءات مقترحة.',
  },
  {
    id: 'no-insights',
    category: 'intelligence',
    question: 'لماذا لا تظهر لدي رؤى؟',
    answer:
      'قد تحتاج إلى إضافة المزيد من الإيرادات والمصروفات والالتزامات حتى تتوفر بيانات كافية للتحليل.',
  },
  {
    id: 'recommendations-binding',
    category: 'intelligence',
    question: 'هل توصيات Capital ملزمة؟',
    answer:
      'لا. التوصيات إرشادية وتساعدك على فهم الأرقام واتخاذ قرارك.',
  },
  {
    id: 'saving-opportunity',
    category: 'intelligence',
    question: 'كيف يتم حساب فرصة خفض المصروفات؟',
    answer:
      'يعتمد النموذج المحلي على الاشتراكات والمصروفات المتكررة التي تبدو محدودة الاستخدام أو أعلى من المعتاد.',
  },
  {
    id: 'change-plan',
    category: 'subscription',
    question: 'كيف أغير خطتي؟',
    answer:
      'انتقل إلى الحساب ثم بطاقة الاشتراك، وبعدها استخدم خيار إدارة الاشتراك.',
  },
  {
    id: 'renewal-date',
    category: 'subscription',
    question: 'متى يتم تجديد اشتراكي؟',
    answer:
      'يظهر تاريخ التجديد القادم داخل بطاقة الاشتراك في صفحة الحساب.',
  },
  {
    id: 'cancel-renewal',
    category: 'subscription',
    question: 'كيف ألغي التجديد؟',
    answer:
      'من إدارة الاشتراك اختر إيقاف التجديد التلقائي. هذا التدفق محلي وتجريبي حاليًا.',
  },
  {
    id: 'remove-payment-method',
    category: 'subscription',
    question: 'هل يمكنني حذف وسيلة الدفع؟',
    answer:
      'يمكنك طلب إزالة وسيلة الدفع من إعدادات الاشتراك، وقد يظهر تحذير إذا كانت الوسيلة الوحيدة.',
  },
];

export function getFaqItem(faqId?: string | string[]) {
  const normalizedId = Array.isArray(faqId) ? faqId[0] : faqId;

  return faqItems.find((item) => item.id === normalizedId);
}
