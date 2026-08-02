import type { Ionicons } from '@expo/vector-icons';

export type OperationTransactionType = 'income' | 'expense';

export type OperationTransaction = {
  id: string;
  title: string;
  amount: string;
  type: OperationTransactionType;
  category: string;
  date: string;
  account: string;
  status: string;
  reference: string;
  paymentMethod: string;
};

export type TransactionActionTone = 'default' | 'danger';

export type TransactionAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: TransactionActionTone;
};

export const operationMessages = {
  featureUnavailable: 'هذه الميزة ستكون متاحة لاحقًا',
  deleteTitle: 'حذف العملية',
  deleteMessage: 'هل تريد حذف هذه العملية من السجل؟',
  deleteUnavailable: 'الحذف سيكون متاحًا لاحقًا',
  amountRequired: 'أدخل مبلغ العملية',
  categoryRequired: 'اختر تصنيف العملية',
  addSuccess: 'تمت إضافة العملية كنموذج أولي',
} as const;

const expenseTransaction: OperationTransaction = {
  id: 'design-tools',
  title: 'اشتراك أدوات العمل',
  amount: '-1,250 رس',
  type: 'expense',
  category: 'اشتراكات',
  date: '12 أغسطس 2026',
  account: 'حساب الأعمال',
  status: 'مكتملة',
  reference: 'SUB-118',
  paymentMethod: 'بطاقة الأعمال',
};

const incomeTransaction: OperationTransaction = {
  id: 'identity-design',
  title: 'دفعة عميل',
  amount: '+18,500 رس',
  type: 'income',
  category: 'إيرادات العملاء',
  date: '10 أغسطس 2026',
  account: 'حساب الأعمال',
  status: 'مكتملة',
  reference: 'CAP-1024',
  paymentMethod: 'تحويل بنكي',
};

export const prototypeTransactions: OperationTransaction[] = [expenseTransaction, incomeTransaction];

export const transactionFallback = expenseTransaction;

export function getPrototypeTransaction(transactionId?: string | string[]) {
  const id = Array.isArray(transactionId) ? transactionId[0] : transactionId;
  return prototypeTransactions.find((transaction) => transaction.id === id) ?? transactionFallback;
}

export const capitalTransactionNote =
  'هذه العملية ضمن المصروفات المتكررة. راقب الاشتراكات الشهرية لأنها قد تؤثر على هامش الربح.';

export const transactionActions: TransactionAction[] = [
  { id: 'edit', label: 'تعديل العملية', icon: 'create-outline' },
  { id: 'note', label: 'إضافة ملاحظة', icon: 'chatbubble-ellipses-outline' },
  { id: 'receipt', label: 'تنزيل إيصال', icon: 'download-outline' },
  { id: 'delete', label: 'حذف العملية', icon: 'trash-outline', tone: 'danger' },
];

export const incomeCategories = ['إيرادات العملاء', 'مبيعات', 'اشتراكات', 'استثمار', 'أخرى'] as const;
export const expenseCategories = ['تشغيل', 'رواتب', 'اشتراكات', 'تسويق', 'موردين', 'أخرى'] as const;
export const accountOptions = ['حساب الأعمال', 'كاش', 'محفظة'] as const;

export type TransferType = 'local' | 'international';

export type Beneficiary = {
  id: string;
  name: string;
  ibanEnding: string;
};

export type TransferPurpose = 'suppliers' | 'salaries' | 'services' | 'rent' | 'other';

export type TransferPurposeOption = {
  id: TransferPurpose;
  label: string;
};

export type TransferDraft = {
  transferType: TransferType;
  beneficiaryId: string;
  amount: string;
  purposeId: TransferPurpose;
};

export type TransferReviewData = {
  fromAccount: string;
  beneficiaryName: string;
  ibanMask: string;
  amount: string;
  fee: string;
  total: string;
  purpose: string;
  executionTime: string;
};

export type TransferSuccessData = {
  amount: string;
  beneficiaryName: string;
  reference: string;
  status: string;
  account: string;
  date: string;
};

export const transferMessages = {
  internationalUnavailable: 'التحويل الدولي سيكون متاحًا لاحقًا',
  beneficiaryRequired: 'اختر المستفيد للمتابعة',
  amountRequired: 'أدخل مبلغ التحويل',
  amountOverDailyLimit: 'المبلغ يتجاوز الحد اليومي',
  insufficientBalance: 'الرصيد غير كافٍ',
  purposeRequired: 'اختر سبب التحويل',
} as const;

export const transferLimits = {
  availableBalance: 84250,
  dailyLimit: 50000,
  fromAccount: 'حساب الأعمال',
  availableBalanceLabel: '84,250 رس',
  dailyLimitLabel: '50,000 رس',
} as const;

export const transferBeneficiaries: Beneficiary[] = [
  { id: 'suppliers-first', name: 'شركة الموردين الأولى', ibanEnding: '4821' },
  { id: 'abdullah', name: 'عبدالله محمد', ibanEnding: '1190' },
  { id: 'digital-office', name: 'مكتب الخدمات الرقمية', ibanEnding: '7742' },
];

export const defaultTransferBeneficiary = transferBeneficiaries[0]!;

export const transferPurposes: TransferPurposeOption[] = [
  { id: 'suppliers', label: 'موردين' },
  { id: 'salaries', label: 'رواتب' },
  { id: 'services', label: 'خدمات' },
  { id: 'rent', label: 'إيجار' },
  { id: 'other', label: 'أخرى' },
];

export const defaultTransferPurpose = transferPurposes[0]!;

export const defaultTransferReview: TransferReviewData = {
  fromAccount: transferLimits.fromAccount,
  beneficiaryName: 'شركة الموردين الأولى',
  ibanMask: '****4821',
  amount: '12,500 رس',
  fee: '0 رس',
  total: '12,500 رس',
  purpose: 'موردين',
  executionTime: 'فوري',
};

export const transferReviewNote =
  'راجع بيانات المستفيد والمبلغ قبل التأكيد. هذا النموذج لا ينفذ أي عملية مالية حقيقية.';

export const defaultTransferSuccess: TransferSuccessData = {
  amount: '12,500 رس',
  beneficiaryName: 'شركة الموردين الأولى',
  reference: 'TR-2026-08421',
  status: 'مكتمل كنموذج أولي',
  account: transferLimits.fromAccount,
  date: 'اليوم',
};

export function getBeneficiary(beneficiaryId?: string | string[]) {
  const id = Array.isArray(beneficiaryId) ? beneficiaryId[0] : beneficiaryId;
  return transferBeneficiaries.find((beneficiary) => beneficiary.id === id) ?? defaultTransferBeneficiary;
}

export function getTransferPurpose(purposeId?: string | string[]) {
  const id = Array.isArray(purposeId) ? purposeId[0] : purposeId;
  return transferPurposes.find((purpose) => purpose.id === id) ?? defaultTransferPurpose;
}

export function formatTransferAmount(amount?: string | string[]) {
  const rawAmount = Array.isArray(amount) ? amount[0] : amount;
  const numericAmount = Number((rawAmount ?? '').replace(/,/g, '.').trim());

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return defaultTransferReview.amount;
  }

  return `${numericAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} رس`;
}

export type BillStatus = 'due' | 'paid' | 'overdue';

export type BillFilter = 'all' | BillStatus;

export type BillItem = {
  id: string;
  title: string;
  amount: string;
  due: string;
  status: BillStatus;
  statusLabel: string;
  category: string;
  vendor: string;
  reference: string;
  paymentAccount: string;
};

export type BillSummary = {
  totalDue: string;
  billCount: string;
  nearestDue: string;
};

export type BillPaymentReviewData = {
  billTitle: string;
  vendor: string;
  amount: string;
  fee: string;
  total: string;
  account: string;
  executionTime: string;
};

export type BillPaymentSuccessData = {
  amount: string;
  billTitle: string;
  reference: string;
  status: string;
  account: string;
  date: string;
};

export const billMessages = {
  scheduleUnavailable: 'جدولة الدفع ستكون متاحة لاحقًا',
  downloadUnavailable: 'تنزيل الفاتورة سيكون متاحًا لاحقًا',
  noteUnavailable: 'إضافة الملاحظات ستكون متاحة لاحقًا',
} as const;

export const billSummary: BillSummary = {
  totalDue: '18,750 رس',
  billCount: '4',
  nearestDue: 'خلال 3 أيام',
};

export const billFilters: { id: BillFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'due', label: 'مستحقة' },
  { id: 'paid', label: 'مدفوعة' },
  { id: 'overdue', label: 'متأخرة' },
];

export const prototypeBills: BillItem[] = [
  {
    id: 'supplier-bill',
    title: 'فاتورة موردين',
    amount: '8,500 رس',
    due: 'خلال 3 أيام',
    status: 'due',
    statusLabel: 'مستحقة',
    category: 'موردين',
    vendor: 'شركة الموردين الأولى',
    reference: 'BILL-2026-1842',
    paymentAccount: transferLimits.fromAccount,
  },
  {
    id: 'tools-subscription',
    title: 'اشتراك أدوات العمل',
    amount: '1,250 رس',
    due: 'اليوم',
    status: 'due',
    statusLabel: 'مستحقة',
    category: 'اشتراكات',
    vendor: 'منصة أدوات العمل',
    reference: 'BILL-2026-1843',
    paymentAccount: transferLimits.fromAccount,
  },
  {
    id: 'office-rent',
    title: 'إيجار المكتب',
    amount: '7,000 رس',
    due: 'متأخرة بيومين',
    status: 'overdue',
    statusLabel: 'متأخرة',
    category: 'إيجار',
    vendor: 'إدارة مبنى الأعمال',
    reference: 'BILL-2026-1844',
    paymentAccount: transferLimits.fromAccount,
  },
  {
    id: 'internet-bill',
    title: 'فاتورة الإنترنت',
    amount: '450 رس',
    due: 'مدفوعة',
    status: 'paid',
    statusLabel: 'مدفوعة',
    category: 'تشغيل',
    vendor: 'مزود الإنترنت',
    reference: 'BILL-2026-1845',
    paymentAccount: transferLimits.fromAccount,
  },
  {
    id: 'accounting-services',
    title: 'خدمات محاسبية',
    amount: '1,550 رس',
    due: 'خلال 10 أيام',
    status: 'due',
    statusLabel: 'مستحقة',
    category: 'خدمات',
    vendor: 'مكتب الخدمات المحاسبية',
    reference: 'BILL-2026-1846',
    paymentAccount: transferLimits.fromAccount,
  },
];

export const defaultBill = prototypeBills[0]!;

export const billCapitalNote =
  'هذه الفاتورة قريبة الاستحقاق. دفعها الآن يساعدك تتجنب التأخير ويحافظ على وضوح التدفق النقدي.';

export const billPaymentPrototypeNote =
  'هذا نموذج أولي. لن يتم تنفيذ أي دفع حقيقي أو خصم من الرصيد.';

export const defaultBillPaymentSuccess: BillPaymentSuccessData = {
  amount: defaultBill.amount,
  billTitle: defaultBill.title,
  reference: 'PAY-2026-09318',
  status: 'مكتمل كنموذج أولي',
  account: transferLimits.fromAccount,
  date: 'اليوم',
};

export function getPrototypeBill(billId?: string | string[]) {
  const id = Array.isArray(billId) ? billId[0] : billId;
  return prototypeBills.find((bill) => bill.id === id) ?? defaultBill;
}

export function createBillPaymentReviewData(bill: BillItem): BillPaymentReviewData {
  return {
    billTitle: bill.title,
    vendor: bill.vendor,
    amount: bill.amount,
    fee: '0 رس',
    total: bill.amount,
    account: bill.paymentAccount,
    executionTime: 'فوري',
  };
}

export type BusinessCardStatus = 'active' | 'frozen';

export type BusinessCardType = 'virtual' | 'physical';

export type BusinessCardItem = {
  id: string;
  title: string;
  brand: string;
  numberMask: string;
  holderName: string;
  type: BusinessCardType;
  typeLabel: string;
  status: BusinessCardStatus;
  statusLabel: string;
  spent: string;
  limit: string;
  remaining: string;
  lastUsed: string;
};

export type CardTransaction = {
  id: string;
  title: string;
  amount: string;
  date: string;
};

export type CardLimitSettings = {
  daily: string;
  weekly: string;
  monthly: string;
  onlinePurchases: boolean;
  subscriptions: boolean;
  cashWithdrawal: boolean;
  internationalPayments: boolean;
};

export type CardRequestDraft = {
  cardType: BusinessCardType | '';
  purpose: string;
  monthlyLimit: string;
};

export type CardRequestSuccessData = {
  cardType: string;
  purpose: string;
  monthlyLimit: string;
  reference: string;
  status: string;
  expectedTime: string;
};

export const cardMessages = {
  frozen: 'تم تجميد البطاقة كنموذج أولي',
  activated: 'تم تفعيل البطاقة كنموذج أولي',
  numberUnavailable: 'عرض رقم البطاقة سيكون متاحًا لاحقًا',
  settingsUnavailable: 'إعدادات البطاقة ستكون متاحة لاحقًا',
  invalidLimits: 'أدخل حدودًا صحيحة للبطاقة',
  dailyOverMonthly: 'الحد اليومي لا يمكن أن يتجاوز الحد الشهري',
  limitsUpdated: 'تم تحديث الحدود كنموذج أولي',
  typeRequired: 'اختر نوع البطاقة للمتابعة',
  purposeRequired: 'اختر استخدام البطاقة',
  requestLimitRequired: 'أدخل حد البطاقة',
  requestLimitTooHigh: 'الحد المقترح أعلى من المسموح في النموذج الأولي',
} as const;

export const prototypeBusinessCards: BusinessCardItem[] = [
  {
    id: 'business-virtual',
    title: 'بطاقة الأعمال الافتراضية',
    brand: 'Capital Business',
    numberMask: '**** 4821',
    holderName: 'عبدالله',
    type: 'virtual',
    typeLabel: 'افتراضية',
    status: 'active',
    statusLabel: 'نشطة',
    spent: '12,450 رس',
    limit: '30,000 رس',
    remaining: '17,550 رس',
    lastUsed: 'اليوم',
  },
  {
    id: 'operations-physical',
    title: 'بطاقة المصاريف التشغيلية',
    brand: 'Capital Business',
    numberMask: '**** 7742',
    holderName: 'عبدالله',
    type: 'physical',
    typeLabel: 'فعلية',
    status: 'frozen',
    statusLabel: 'مجمدة',
    spent: '4,200 رس',
    limit: '10,000 رس',
    remaining: '5,800 رس',
    lastUsed: 'أمس',
  },
  {
    id: 'team-virtual',
    title: 'بطاقة الفريق',
    brand: 'Capital Business',
    numberMask: '**** 1190',
    holderName: 'عبدالله',
    type: 'virtual',
    typeLabel: 'افتراضية',
    status: 'active',
    statusLabel: 'نشطة',
    spent: '2,850 رس',
    limit: '8,000 رس',
    remaining: '5,150 رس',
    lastUsed: 'قبل 3 أيام',
  },
];

export const defaultBusinessCard = prototypeBusinessCards[0]!;

export const cardTransactions: CardTransaction[] = [
  { id: 'tools-subscription', title: 'اشتراك أدوات العمل', amount: '-1,250 رس', date: 'اليوم' },
  { id: 'marketing-ad', title: 'إعلان تسويقي', amount: '-850 رس', date: 'أمس' },
  { id: 'office-tools', title: 'أدوات مكتبية', amount: '-320 رس', date: 'قبل 3 أيام' },
];

export const defaultCardLimits: CardLimitSettings = {
  daily: '5,000',
  weekly: '15,000',
  monthly: '30,000',
  onlinePurchases: true,
  subscriptions: true,
  cashWithdrawal: false,
  internationalPayments: false,
};

export const cardRequestTypes: {
  id: BusinessCardType;
  label: string;
  description: string;
}[] = [
  {
    id: 'virtual',
    label: 'بطاقة افتراضية',
    description: 'للاشتراكات والمدفوعات الرقمية',
  },
  {
    id: 'physical',
    label: 'بطاقة فعلية',
    description: 'للمشتريات ونقاط البيع',
  },
];

export const cardRequestPurposes = ['مصاريف تشغيلية', 'فريق العمل', 'تسويق', 'اشتراكات', 'أخرى'] as const;

export const cardCapitalNote =
  'استخدام البطاقة ضمن الحدود الحالية. راقب الاشتراكات المتكررة لأنها تشكل نسبة واضحة من مصروفات البطاقة.';

export const defaultCardRequestSuccess: CardRequestSuccessData = {
  cardType: 'بطاقة افتراضية',
  purpose: 'مصاريف تشغيلية',
  monthlyLimit: '10,000 رس',
  reference: 'CARD-2026-01482',
  status: 'قيد المراجعة كنموذج أولي',
  expectedTime: 'فوري للبطاقة الافتراضية',
};

export function getPrototypeBusinessCard(cardId?: string | string[]) {
  const id = Array.isArray(cardId) ? cardId[0] : cardId;
  return prototypeBusinessCards.find((card) => card.id === id) ?? defaultBusinessCard;
}

export function getCardStatusLabel(status: BusinessCardStatus) {
  return status === 'active' ? 'نشطة' : 'مجمدة';
}

export function formatCardLimit(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number((rawValue ?? '').replace(/,/g, '').trim());

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return defaultCardRequestSuccess.monthlyLimit;
  }

  return `${numericValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} رس`;
}

export type NotificationType = 'bills' | 'capital-ai' | 'operations';

export type NotificationPriority = 'important' | 'normal';

export type NotificationFilter = 'all' | 'important' | NotificationType;

export type CapitalNotification = {
  id: string;
  title: string;
  body: string;
  detailBody: string;
  type: NotificationType;
  typeLabel: string;
  priority: NotificationPriority;
  priorityLabel: string;
  time: string;
  unread: boolean;
};

export type NotificationDetailAction = {
  id: 'reports' | 'ledger' | 'bills' | 'dismiss';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: TransactionActionTone;
};

export const notificationMessages = {
  allRead: 'تم تعليم التنبيهات كمقروءة كنموذج أولي',
  read: 'تم تعليم التنبيه كمقروء كنموذج أولي',
  dismissed: 'تم تجاهل التنبيه كنموذج أولي',
} as const;

export const notificationSummary = {
  unreadCount: '5',
  importantCount: '2',
  lastUpdated: 'الآن',
} as const;

export const notificationFilters: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'important', label: 'مهم' },
  { id: 'bills', label: 'فواتير' },
  { id: 'capital-ai', label: 'ذكاء Capital' },
  { id: 'operations', label: 'عمليات' },
];

export const prototypeNotifications: CapitalNotification[] = [
  {
    id: 'bill-due-today',
    title: 'فاتورة مستحقة اليوم',
    body: 'اشتراك أدوات العمل مستحق اليوم بقيمة 1,250 رس',
    detailBody: 'اشتراك أدوات العمل مستحق اليوم بقيمة 1,250 رس. ادفعها أو راجع جدول الفواتير لتجنب أي تأخير في المصروفات التشغيلية.',
    type: 'bills',
    typeLabel: 'فواتير',
    priority: 'important',
    priorityLabel: 'مهم',
    time: 'اليوم',
    unread: true,
  },
  {
    id: 'operational-expense-rise',
    title: 'ارتفاع المصروفات التشغيلية',
    body: 'مصروفات التشغيل أعلى من المتوسط بنسبة 18%',
    detailBody:
      'مصروفات التشغيل أعلى من المتوسط بنسبة 18% مقارنة بالفترة السابقة. راجع الاشتراكات والمصاريف المتكررة لتقليل الهدر وتحسين هامش الربح.',
    type: 'capital-ai',
    typeLabel: 'ذكاء Capital',
    priority: 'important',
    priorityLabel: 'مهم',
    time: 'قبل ساعتين',
    unread: true,
  },
  {
    id: 'prototype-transfer-created',
    title: 'تم إنشاء تحويل تجريبي',
    body: 'تحويل إلى شركة الموردين الأولى بقيمة 12,500 رس',
    detailBody: 'تم إنشاء تحويل إلى شركة الموردين الأولى بقيمة 12,500 رس كنموذج أولي. لن يتم تنفيذ أي عملية مالية حقيقية.',
    type: 'operations',
    typeLabel: 'عمليات',
    priority: 'normal',
    priorityLabel: 'عادي',
    time: 'اليوم',
    unread: false,
  },
  {
    id: 'monthly-report-reminder',
    title: 'تذكير تقرير شهري',
    body: 'تقرير الأداء الشهري جاهز للمراجعة',
    detailBody: 'تقرير الأداء الشهري جاهز للمراجعة. راجع اتجاه الإيرادات والمصروفات قبل إغلاق الشهر.',
    type: 'capital-ai',
    typeLabel: 'ذكاء Capital',
    priority: 'normal',
    priorityLabel: 'عادي',
    time: 'أمس',
    unread: true,
  },
  {
    id: 'overdue-office-rent',
    title: 'فاتورة متأخرة',
    body: 'إيجار المكتب متأخر بيومين',
    detailBody: 'إيجار المكتب متأخر بيومين. راجع الفاتورة وحدد الإجراء المناسب للحفاظ على وضوح الالتزامات القادمة.',
    type: 'bills',
    typeLabel: 'فواتير',
    priority: 'important',
    priorityLabel: 'مهم',
    time: 'أمس',
    unread: true,
  },
  {
    id: 'card-usage',
    title: 'استخدام البطاقة',
    body: 'تم تسجيل عملية على بطاقة الأعمال بقيمة 850 رس',
    detailBody: 'تم تسجيل عملية على بطاقة الأعمال بقيمة 850 رس. راقب استخدام البطاقات ضمن حدود الصرف الشهرية المعتمدة.',
    type: 'operations',
    typeLabel: 'عمليات',
    priority: 'normal',
    priorityLabel: 'عادي',
    time: 'قبل 3 أيام',
    unread: false,
  },
];

export const defaultNotification =
  prototypeNotifications.find((notification) => notification.id === 'operational-expense-rise') ?? prototypeNotifications[0]!;

export const notificationCapitalRecommendation =
  'ابدأ بمراجعة الاشتراكات المتكررة والمصاريف الصغيرة المتكررة لأنها غالبًا تسبب ارتفاعًا تدريجيًا في التكاليف.';

export const notificationDetailActions: NotificationDetailAction[] = [
  { id: 'reports', label: 'فتح التقارير', icon: 'bar-chart-outline' },
  { id: 'ledger', label: 'عرض السجل', icon: 'list-outline' },
  { id: 'bills', label: 'مراجعة الفواتير', icon: 'receipt-outline' },
  { id: 'dismiss', label: 'تجاهل التنبيه', icon: 'close-circle-outline', tone: 'danger' },
];

export function getPrototypeNotification(notificationId?: string | string[]) {
  const id = Array.isArray(notificationId) ? notificationId[0] : notificationId;
  return prototypeNotifications.find((notification) => notification.id === id) ?? defaultNotification;
}
