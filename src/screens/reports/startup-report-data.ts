import type { Ionicons } from '@expo/vector-icons';

export type StartupReportPeriod = 'currentMonth' | 'threeMonths' | 'sixMonths' | 'year';

export type StartupMetricStatus = 'good' | 'watch' | 'intervene';

export type StartupMetricId =
  | 'mrr'
  | 'arr'
  | 'newCustomers'
  | 'lostCustomers'
  | 'churn'
  | 'cac'
  | 'ltv'
  | 'nrr'
  | 'grossMargin';

export type StartupMetric = {
  id: StartupMetricId;
  name: string;
  abbreviation: string;
  value: string;
  comparison: string;
  status: StartupMetricStatus;
  explanation: string;
  formula: string;
  source: string;
  importance: string;
  note: string;
  trend: readonly number[];
};

export type StartupGoalStatus = 'active' | 'completed' | 'delayed';

export type StartupGoalType =
  | 'product'
  | 'revenue'
  | 'customers'
  | 'hiring'
  | 'expansion'
  | 'funding'
  | 'other';

export type StartupGoalUnit = 'ريال' | 'عميل' | 'مستخدم' | 'نسبة مئوية' | 'موظف' | 'مرحلة';

export type StartupGoalMilestone = {
  id: string;
  title: string;
  completed: boolean;
};

export type StartupGoal = {
  id: string;
  title: string;
  type: StartupGoalType;
  description?: string;
  currentValue: number;
  targetValue: number;
  unit: StartupGoalUnit;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  owner: string;
  notes: string;
  status: StartupGoalStatus;
  lastUpdate: string;
  milestones: StartupGoalMilestone[];
};

export type StartupGoalDraft = {
  title: string;
  type: StartupGoalType;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: StartupGoalUnit;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  owner: string;
  notes: string;
  status: StartupGoalStatus;
};

export type StartupUpdateDraft = {
  achievements: string;
  challenges: string;
  needs: string;
  hiring: string;
  nextSteps: string;
};

export const startupReportPeriods: readonly { id: StartupReportPeriod; label: string }[] = [
  { id: 'currentMonth', label: 'هذا الشهر' },
  { id: 'threeMonths', label: 'آخر 3 أشهر' },
  { id: 'sixMonths', label: 'آخر 6 أشهر' },
  { id: 'year', label: 'هذه السنة' },
];

export const startupReportSummary = {
  periodLabel: 'يوليو 2026',
  revenue: 128000,
  revenueGrowth: 14.2,
  cash: 840000,
  monthlyBurn: 72000,
  runwayMonths: 11.7,
  keyGoalProgress: 64,
  keyGoalLabel: 'الوصول إلى 1,000 عميل',
  alert: 'ارتفع CAC بنسبة 18% ويحتاج مراجعة قنوات الاكتساب.',
  mrr: 96000,
  newCustomers: 32,
  lostCustomers: 7,
  grossMargin: 71,
  nrr: 108,
  cac: 1875,
  ltv: 18400,
} as const;

export const growthTrendPoints = [64000, 70000, 76000, 82000, 88500, 96000] as const;

export const startupMetrics: readonly StartupMetric[] = [
  {
    id: 'mrr',
    name: 'الإيراد الشهري المتكرر',
    abbreviation: 'MRR',
    value: '96,000 ر.س',
    comparison: '+12.4% عن الشهر السابق',
    status: 'good',
    explanation: 'يقيس الإيراد المتكرر المتوقع من الاشتراكات النشطة خلال شهر واحد.',
    formula: 'متوسط قيمة الاشتراك × عدد العملاء النشطين.',
    source: 'اشتراكات العملاء المحلية، الفواتير المفتوحة، والمدفوعات المسجلة في النموذج.',
    importance: 'يساعدك على فهم سرعة النمو واستقرار الدخل المتكرر.',
    note: 'النمو جيد، لكن راقب تكلفة الاكتساب حتى لا تتآكل الهوامش.',
    trend: [64000, 70000, 76000, 82000, 88500, 96000],
  },
  {
    id: 'arr',
    name: 'الإيراد السنوي المتكرر',
    abbreviation: 'ARR',
    value: '1,152,000 ر.س',
    comparison: 'MRR × 12',
    status: 'good',
    explanation: 'يعرض تقدير الإيراد السنوي إذا استمر الأداء الشهري الحالي.',
    formula: 'MRR × 12.',
    source: 'محسوب مباشرة من MRR الحالي.',
    importance: 'مؤشر سريع لحجم الشركة المتوقع عند عرض الأداء للمستثمرين.',
    note: 'استخدمه كتقدير تشغيلي، وليس كإيراد محقق.',
    trend: [768000, 840000, 912000, 984000, 1062000, 1152000],
  },
  {
    id: 'newCustomers',
    name: 'العملاء الجدد',
    abbreviation: 'New',
    value: '32 عميل',
    comparison: '+9 عن الشهر السابق',
    status: 'good',
    explanation: 'عدد العملاء الذين بدأوا الاشتراك أو الدفع خلال الفترة.',
    formula: 'إجمالي العملاء الجدد المسجلين في الفترة.',
    source: 'سجل العملاء والفواتير التجريبية.',
    importance: 'يوضح قوة قنوات النمو وقدرتها على توليد طلب جديد.',
    note: 'استمر في مراقبة جودة العملاء الجدد ومعدل التحويل إلى خطط مدفوعة.',
    trend: [17, 19, 22, 25, 28, 32],
  },
  {
    id: 'lostCustomers',
    name: 'العملاء المفقودون',
    abbreviation: 'Lost',
    value: '7 عملاء',
    comparison: '+2 عن الشهر السابق',
    status: 'watch',
    explanation: 'عدد العملاء الذين توقفوا عن الدفع أو ألغوا الاشتراك.',
    formula: 'العملاء الملغون أو غير المجددين خلال الفترة.',
    source: 'حالة الاشتراكات التجريبية وسجل التحصيل.',
    importance: 'ارتفاعه قد يخفي مشكلة في المنتج أو التسعير أو الدعم.',
    note: 'راجع أسباب الإلغاء مع العملاء ذوي القيمة الأعلى.',
    trend: [4, 5, 4, 6, 5, 7],
  },
  {
    id: 'churn',
    name: 'معدل فقد العملاء',
    abbreviation: 'Churn',
    value: '2.8%',
    comparison: '+0.4 نقطة',
    status: 'watch',
    explanation: 'النسبة المئوية للعملاء الذين خرجوا من قاعدة العملاء خلال الفترة.',
    formula: 'العملاء المفقودون ÷ إجمالي العملاء في بداية الفترة.',
    source: 'قاعدة العملاء النشطة وحالات الإلغاء التجريبية.',
    importance: 'كل انخفاض في الفقد يحسن قيمة العميل والعائد من النمو.',
    note: 'راقب العملاء في أول 30 يومًا لأنهم أكثر عرضة للتوقف.',
    trend: [2.1, 2.2, 2, 2.4, 2.4, 2.8],
  },
  {
    id: 'cac',
    name: 'تكلفة اكتساب العميل',
    abbreviation: 'CAC',
    value: '1,875 ر.س',
    comparison: '+18% عن الشهر السابق',
    status: 'intervene',
    explanation: 'متوسط ما تدفعه لاكتساب عميل جديد واحد.',
    formula: 'مصروفات التسويق والمبيعات ÷ العملاء الجدد.',
    source: 'مصروفات التسويق، الحملات، وعدد العملاء الجدد.',
    importance: 'إذا زادت بسرعة، قد يصبح النمو أقل كفاءة حتى مع ارتفاع الإيرادات.',
    note: 'اختبر خفض الإنفاق على القنوات الأقل تحويلًا هذا الشهر.',
    trend: [1420, 1510, 1580, 1620, 1680, 1875],
  },
  {
    id: 'ltv',
    name: 'القيمة المتوقعة للعميل',
    abbreviation: 'LTV',
    value: '18,400 ر.س',
    comparison: '+6.2% عن الشهر السابق',
    status: 'good',
    explanation: 'القيمة الإجمالية المتوقعة من العميل طوال فترة بقائه.',
    formula: 'متوسط الإيراد الشهري للعميل × مدة البقاء المتوقعة × الهامش.',
    source: 'الإيراد الشهري، معدل الفقد، والهامش الإجمالي.',
    importance: 'تساعدك على تحديد سقف صحي لتكلفة الاكتساب.',
    note: 'النسبة بين LTV و CAC ما زالت صحية، لكن لا تترك CAC يرتفع أكثر.',
    trend: [15800, 16200, 16900, 17400, 17900, 18400],
  },
  {
    id: 'nrr',
    name: 'صافي الاحتفاظ بالإيراد',
    abbreviation: 'NRR',
    value: '108%',
    comparison: '+3 نقاط',
    status: 'good',
    explanation: 'يقيس نمو الإيراد من العملاء الحاليين بعد التوسعات والانخفاضات والإلغاءات.',
    formula: '(إيراد البداية + التوسع - الانخفاض - الإلغاء) ÷ إيراد البداية.',
    source: 'اشتراكات العملاء الحاليين والتوسعات التجريبية.',
    importance: 'فوق 100% يعني أن قاعدة العملاء الحالية تنمو حتى بدون اكتساب جديد.',
    note: 'وسع عروض الترقية للعملاء الأكثر استخدامًا.',
    trend: [101, 102, 104, 105, 106, 108],
  },
  {
    id: 'grossMargin',
    name: 'الهامش الإجمالي',
    abbreviation: 'GM',
    value: '71%',
    comparison: '+2 نقاط',
    status: 'good',
    explanation: 'النسبة المتبقية من الإيراد بعد تكلفة تقديم الخدمة المباشرة.',
    formula: '(الإيراد - تكلفة الخدمة المباشرة) ÷ الإيراد.',
    source: 'الإيرادات وتكاليف التشغيل المباشرة في النموذج.',
    importance: 'كلما كان أعلى، زادت قدرة الشركة على تمويل النمو والتطوير.',
    note: 'الهامش صحي لشركة SaaS في مرحلة نمو مبكرة.',
    trend: [66, 67, 68, 69, 70, 71],
  },
];

export const startupGoalTypes: readonly { id: StartupGoalType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'product', label: 'منتج', icon: 'cube-outline' },
  { id: 'revenue', label: 'إيرادات', icon: 'cash-outline' },
  { id: 'customers', label: 'مستخدمون أو عملاء', icon: 'people-outline' },
  { id: 'hiring', label: 'توظيف', icon: 'briefcase-outline' },
  { id: 'expansion', label: 'توسع', icon: 'business-outline' },
  { id: 'funding', label: 'تمويل', icon: 'rocket-outline' },
  { id: 'other', label: 'هدف آخر', icon: 'flag-outline' },
];

export const startupGoalUnits: readonly StartupGoalUnit[] = ['ريال', 'عميل', 'مستخدم', 'نسبة مئوية', 'موظف', 'مرحلة'];

export const startupGoalDateOptions = ['31 يوليو 2026', '15 أغسطس 2026', '31 أغسطس 2026', '30 سبتمبر 2026', '31 ديسمبر 2026'] as const;

export const defaultMilestones: readonly string[] = ['تحديد الخطة', 'تجهيز الموارد', 'بدء التنفيذ', 'قياس النتائج', 'إكمال الهدف'];

export const initialStartupGoals: readonly StartupGoal[] = [
  {
    id: 'startup-goal-customers',
    title: 'الوصول إلى 1,000 عميل',
    type: 'customers',
    description: 'زيادة قاعدة العملاء المدفوعين قبل نهاية الربع.',
    currentValue: 640,
    targetValue: 1000,
    unit: 'عميل',
    budget: 80000,
    spent: 52000,
    startDate: '1 يونيو 2026',
    dueDate: '31 أغسطس 2026',
    owner: 'فريق النمو',
    notes: 'التركيز على القنوات ذات التحويل الأعلى.',
    status: 'active',
    lastUpdate: '20 يوليو 2026',
    milestones: createMilestones(3),
  },
  {
    id: 'startup-goal-product',
    title: 'إطلاق النسخة الأولى',
    type: 'product',
    description: 'تجهيز النسخة الأولى للاستخدام التجاري المحدود.',
    currentValue: 82,
    targetValue: 100,
    unit: 'نسبة مئوية',
    budget: 150000,
    spent: 124000,
    startDate: '15 مايو 2026',
    dueDate: '15 أغسطس 2026',
    owner: 'فريق المنتج',
    notes: 'تبقى اختبار الدفع وإعداد صفحة الدعم.',
    status: 'active',
    lastUpdate: '19 يوليو 2026',
    milestones: createMilestones(4),
  },
  {
    id: 'startup-goal-mrr',
    title: 'الوصول إلى إيراد شهري مستهدف بقيمة 100,000 ر.س',
    type: 'revenue',
    description: 'رفع الإيراد الشهري المتكرر إلى مستوى جاهز للعرض الاستثماري.',
    currentValue: 96000,
    targetValue: 100000,
    unit: 'ريال',
    budget: 120000,
    spent: 94000,
    startDate: '1 يونيو 2026',
    dueDate: '31 يوليو 2026',
    owner: 'فريق المبيعات',
    notes: 'الصفقات قيد الإغلاق تكفي للوصول عند تحويلها.',
    status: 'active',
    lastUpdate: '22 يوليو 2026',
    milestones: createMilestones(4),
  },
  {
    id: 'startup-goal-hiring',
    title: 'توظيف فريق المبيعات',
    type: 'hiring',
    description: 'بناء فريق صغير لمتابعة العملاء المحتملين.',
    currentValue: 2,
    targetValue: 4,
    unit: 'موظف',
    budget: 60000,
    spent: 28000,
    startDate: '1 يوليو 2026',
    dueDate: '30 سبتمبر 2026',
    owner: 'المؤسس',
    notes: 'تمت مقابلة مرشحين إضافيين.',
    status: 'active',
    lastUpdate: '18 يوليو 2026',
    milestones: createMilestones(2),
  },
  {
    id: 'startup-goal-expansion',
    title: 'دخول مدينة جديدة',
    type: 'expansion',
    description: 'اختبار التشغيل في مدينة إضافية مع شركاء محليين.',
    currentValue: 30,
    targetValue: 100,
    unit: 'نسبة مئوية',
    budget: 200000,
    spent: 46000,
    startDate: '1 يونيو 2026',
    dueDate: '31 يوليو 2026',
    owner: 'فريق العمليات',
    notes: 'التنفيذ متأخر بسبب اعتماد الشركاء.',
    status: 'delayed',
    lastUpdate: '17 يوليو 2026',
    milestones: createMilestones(1),
  },
  {
    id: 'startup-goal-funding',
    title: 'بدء الجولة الاستثمارية',
    type: 'funding',
    description: 'تحضير المواد وبدء محادثات أولية مع مستثمرين.',
    currentValue: 15,
    targetValue: 100,
    unit: 'نسبة مئوية',
    budget: 30000,
    spent: 5000,
    startDate: '1 يوليو 2026',
    dueDate: '31 أغسطس 2026',
    owner: 'الفريق التنفيذي',
    notes: 'تجهيز تحديث الشركة والمقاييس الأساسية.',
    status: 'active',
    lastUpdate: '21 يوليو 2026',
    milestones: createMilestones(1),
  },
];

export const defaultCompanyUpdate: StartupUpdateDraft = {
  achievements: '• ارتفع MRR إلى 96,000 ر.س.\n• وصلنا إلى 640 عميل نشط.\n• تم إطلاق تحسينات التحصيل داخل Capital.',
  challenges: '• ارتفعت تكلفة اكتساب العميل بنسبة 18%.\n• بعض الفواتير ما زالت مستحقة قريبًا.\n• نحتاج ضبط وتيرة الإنفاق التسويقي.',
  needs: '• دعم في تحسين قنوات الاكتساب.\n• مراجعة استراتيجية التسعير للشركات الصغيرة.\n• متابعة فرص شراكات محلية.',
  hiring: '• نبحث عن مسؤول مبيعات أول.\n• نحتاج دعم جزئي في نجاح العملاء.',
  nextSteps: '• إغلاق 20 عميل جديد خلال أغسطس.\n• خفض CAC عبر اختبار قنوات أقل تكلفة.\n• تجهيز نسخة المستثمرين من لوحة الأداء.',
};

export function getStartupMetric(id: string | string[] | undefined) {
  const metricId = Array.isArray(id) ? id[0] : id;

  return startupMetrics.find((metric) => metric.id === metricId) ?? startupMetrics[0]!;
}

export function getGoalTypeMeta(type: StartupGoalType) {
  return startupGoalTypes.find((item) => item.id === type) ?? startupGoalTypes[startupGoalTypes.length - 1]!;
}

export function formatSar(value: number) {
  return `${value.toLocaleString('en-US')} ر.س`;
}

export function formatNumber(value: number, unit: StartupGoalUnit) {
  if (unit === 'ريال') {
    return formatSar(value);
  }

  if (unit === 'نسبة مئوية') {
    return `${value.toLocaleString('en-US')}%`;
  }

  return `${value.toLocaleString('en-US')} ${unit}`;
}

export function getGoalProgress(goal: Pick<StartupGoal, 'currentValue' | 'targetValue'>) {
  if (goal.targetValue <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100)));
}

export function getGoalRemaining(goal: Pick<StartupGoal, 'currentValue' | 'targetValue'>) {
  return Math.max(goal.targetValue - goal.currentValue, 0);
}

export function getGoalDaysLeft(goal: Pick<StartupGoal, 'status'>) {
  if (goal.status === 'completed') {
    return 'مكتمل';
  }

  if (goal.status === 'delayed') {
    return 'متأخر';
  }

  return 'متبقّي 38 يومًا';
}

export function createDraftMilestones() {
  return defaultMilestones.map((title, index) => ({
    id: `milestone-${Date.now()}-${index}`,
    title,
    completed: index === 0,
  }));
}

function createMilestones(completedCount: number): StartupGoalMilestone[] {
  return defaultMilestones.map((title, index) => ({
    id: `milestone-${index + 1}`,
    title,
    completed: index < completedCount,
  }));
}
