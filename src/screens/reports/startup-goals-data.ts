import type { StartupGoal, StartupGoalStatus, StartupGoalType, StartupGoalTypeMeta, StartupGoalUnit } from './startup-goals-types';

export const startupGoalTypes: readonly StartupGoalTypeMeta[] = [
  { id: 'product', label: 'منتج', icon: 'cube-outline' },
  { id: 'revenue', label: 'إيرادات', icon: 'cash-outline' },
  { id: 'customers', label: 'عملاء', icon: 'people-outline' },
  { id: 'users', label: 'مستخدمون', icon: 'person-add-outline' },
  { id: 'hiring', label: 'توظيف', icon: 'briefcase-outline' },
  { id: 'expansion', label: 'توسع', icon: 'business-outline' },
  { id: 'funding', label: 'تمويل', icon: 'rocket-outline' },
  { id: 'operations', label: 'عمليات', icon: 'settings-outline' },
  { id: 'other', label: 'هدف آخر', icon: 'flag-outline' },
];

export const startupGoalUnits: readonly StartupGoalUnit[] = ['ر.س', 'عميل', 'مستخدم', 'موظف', 'نسبة مئوية', 'مرحلة', 'عنصر', 'وحدة أخرى'];

export const startupGoalStatusOptions: readonly { id: StartupGoalStatus; label: string }[] = [
  { id: 'not-started', label: 'لم يبدأ' },
  { id: 'active', label: 'جاري' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'delayed', label: 'متأخر' },
  { id: 'paused', label: 'متوقف' },
];

export const startupGoalDateOptions = [
  { value: '2026-06-01', label: '1 يونيو 2026' },
  { value: '2026-07-01', label: '1 يوليو 2026' },
  { value: '2026-07-31', label: '31 يوليو 2026' },
  { value: '2026-08-15', label: '15 أغسطس 2026' },
  { value: '2026-08-31', label: '31 أغسطس 2026' },
  { value: '2026-09-30', label: '30 سبتمبر 2026' },
  { value: '2026-12-31', label: '31 ديسمبر 2026' },
] as const;

export const defaultMilestoneTitles = ['تحديد الخطة', 'تجهيز الموارد', 'بدء التنفيذ', 'قياس النتائج', 'إكمال الهدف'] as const;

export const initialStartupGoals: readonly StartupGoal[] = [
  {
    id: 'customers-1000',
    title: 'الوصول إلى 1,000 عميل',
    description: 'زيادة قاعدة العملاء النشطين قبل نهاية الربع.',
    type: 'customers',
    status: 'active',
    owner: 'فريق النمو',
    currentValue: 640,
    targetValue: 1000,
    unit: 'عميل',
    startDate: '2026-06-01',
    targetDate: '2026-08-31',
    allocatedBudget: 80000,
    spentBudget: 52000,
    notes: 'التركيز على القنوات ذات التحويل الأعلى وتحسين تجربة أول أسبوع للعميل.',
    milestones: [
      { id: 'customers-1000-1', title: 'تحديد قنوات الاكتساب', completed: true, date: '2026-06-05' },
      { id: 'customers-1000-2', title: 'إطلاق الحملات', completed: true, date: '2026-06-16' },
      { id: 'customers-1000-3', title: 'تحسين التحويل', completed: false, date: '2026-07-30' },
      { id: 'customers-1000-4', title: 'الوصول إلى 800 عميل', completed: false, date: '2026-08-10' },
      { id: 'customers-1000-5', title: 'الوصول إلى 1,000 عميل', completed: false, date: '2026-08-31' },
    ],
    createdAt: '2026-06-01',
    updatedAt: '2026-07-20',
  },
  {
    id: 'launch-v1',
    title: 'إطلاق النسخة الأولى',
    description: 'تجهيز النسخة الأولى للاستخدام التجاري المحدود.',
    type: 'product',
    status: 'active',
    owner: 'فريق المنتج',
    currentValue: 82,
    targetValue: 100,
    unit: 'نسبة مئوية',
    startDate: '2026-04-01',
    targetDate: '2026-08-15',
    allocatedBudget: 150000,
    spentBudget: 124000,
    notes: 'تبقى اختبار الدفع وإعداد صفحة الدعم قبل الإطلاق.',
    milestones: [
      { id: 'launch-v1-1', title: 'إغلاق نطاق النسخة الأولى', completed: true, date: '2026-04-12' },
      { id: 'launch-v1-2', title: 'تجهيز تجربة الدفع', completed: true, date: '2026-06-18' },
      { id: 'launch-v1-3', title: 'اختبار المستخدمين الأوائل', completed: true, date: '2026-07-05' },
      { id: 'launch-v1-4', title: 'مراجعة جاهزية الدعم', completed: false, date: '2026-08-01' },
      { id: 'launch-v1-5', title: 'الإطلاق المحدود', completed: false, date: '2026-08-15' },
    ],
    createdAt: '2026-04-01',
    updatedAt: '2026-07-19',
  },
  {
    id: 'mrr-100k',
    title: 'الوصول إلى إيراد شهري مستهدف بقيمة 100,000 ر.س',
    description: 'هدف إداري يدوي لرفع الإيراد الشهري المستهدف، وليس مؤشر MRR محسوبًا من اشتراكات العملاء.',
    type: 'revenue',
    status: 'active',
    owner: 'فريق المبيعات',
    currentValue: 96000,
    targetValue: 100000,
    unit: 'ر.س',
    startDate: '2026-06-01',
    targetDate: '2026-08-31',
    allocatedBudget: 120000,
    spentBudget: 94000,
    notes: 'الصفقات قيد الإغلاق تكفي للوصول عند تحويلها.',
    milestones: [
      { id: 'mrr-100k-1', title: 'تحديث باقات التسعير', completed: true, date: '2026-06-10' },
      { id: 'mrr-100k-2', title: 'إغلاق أول 20 عميلًا مدفوعًا', completed: true, date: '2026-06-30' },
      { id: 'mrr-100k-3', title: 'الوصول إلى 80,000 ر.س كإيراد شهري مستهدف', completed: true, date: '2026-07-15' },
      { id: 'mrr-100k-4', title: 'تحويل الصفقات المفتوحة', completed: false, date: '2026-08-12' },
      { id: 'mrr-100k-5', title: 'الوصول إلى 100,000 ر.س كإيراد شهري مستهدف', completed: false, date: '2026-08-31' },
    ],
    createdAt: '2026-06-01',
    updatedAt: '2026-07-22',
  },
  {
    id: 'hire-sales-team',
    title: 'توظيف فريق المبيعات',
    description: 'بناء فريق صغير لمتابعة العملاء المحتملين.',
    type: 'hiring',
    status: 'active',
    owner: 'المؤسس',
    currentValue: 2,
    targetValue: 4,
    unit: 'موظف',
    startDate: '2026-07-01',
    targetDate: '2026-09-30',
    allocatedBudget: 60000,
    spentBudget: 28000,
    notes: 'تمت مقابلة مرشحين إضافيين ويحتاج القرار النهائي إلى أسبوع.',
    milestones: [
      { id: 'hire-sales-team-1', title: 'كتابة الوصف الوظيفي', completed: true, date: '2026-07-02' },
      { id: 'hire-sales-team-2', title: 'فرز المرشحين', completed: true, date: '2026-07-14' },
      { id: 'hire-sales-team-3', title: 'تعيين أول موظف مبيعات', completed: false, date: '2026-08-05' },
      { id: 'hire-sales-team-4', title: 'تعيين الموظف الثاني', completed: false, date: '2026-09-01' },
    ],
    createdAt: '2026-07-01',
    updatedAt: '2026-07-18',
  },
  {
    id: 'expand-city',
    title: 'دخول مدينة جديدة',
    description: 'اختبار التشغيل في مدينة إضافية مع شركاء محليين.',
    type: 'expansion',
    status: 'delayed',
    owner: 'فريق العمليات',
    currentValue: 30,
    targetValue: 100,
    unit: 'نسبة مئوية',
    startDate: '2026-06-01',
    targetDate: '2026-07-20',
    allocatedBudget: 200000,
    spentBudget: 46000,
    notes: 'التنفيذ متأخر بسبب اعتماد الشركاء المحليين.',
    milestones: [
      { id: 'expand-city-1', title: 'اختيار المدينة', completed: true, date: '2026-06-07' },
      { id: 'expand-city-2', title: 'توقيع شريك محلي', completed: false, date: '2026-07-10' },
      { id: 'expand-city-3', title: 'تجربة التشغيل', completed: false, date: '2026-07-20' },
      { id: 'expand-city-4', title: 'قرار التوسع', completed: false, date: '2026-07-25' },
    ],
    createdAt: '2026-06-01',
    updatedAt: '2026-07-17',
  },
  {
    id: 'fundraising-round',
    title: 'بدء الجولة الاستثمارية',
    description: 'تحضير المواد وبدء محادثات أولية مع مستثمرين.',
    type: 'funding',
    status: 'active',
    owner: 'المؤسس',
    currentValue: 15,
    targetValue: 100,
    unit: 'نسبة مئوية',
    startDate: '2026-08-01',
    targetDate: '2026-08-31',
    allocatedBudget: 30000,
    spentBudget: 5000,
    notes: 'تجهيز تحديث الشركة والمقاييس الأساسية قبل التواصل.',
    milestones: [
      { id: 'fundraising-round-1', title: 'تجهيز قائمة المستثمرين', completed: false, date: '2026-08-05' },
      { id: 'fundraising-round-2', title: 'مراجعة العرض المختصر', completed: false, date: '2026-08-12' },
      { id: 'fundraising-round-3', title: 'بدء المحادثات الأولية', completed: false, date: '2026-08-20' },
    ],
    createdAt: '2026-07-21',
    updatedAt: '2026-07-21',
  },
];

export function getStartupGoalTypeMeta(type: StartupGoalType) {
  return startupGoalTypes.find((item) => item.id === type) ?? startupGoalTypes[startupGoalTypes.length - 1]!;
}

export function getStartupGoalStatusLabel(status: StartupGoalStatus) {
  return startupGoalStatusOptions.find((item) => item.id === status)?.label ?? 'جاري';
}

export function createDraftMilestones() {
  return defaultMilestoneTitles.map((title, index) => ({
    id: `milestone-${Date.now()}-${index}`,
    title,
    completed: index === 0,
  }));
}
