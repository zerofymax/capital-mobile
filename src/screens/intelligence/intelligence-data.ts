export type InsightType = 'opportunity' | 'warning' | 'risk' | 'forecast';

export type MonthlyBriefItem = {
  id: string;
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'danger' | 'brand';
};

export type IntelligenceInsight = {
  id: string;
  type: InsightType;
  statusLabel: string;
  title: string;
  summary: string;
  explanation: string;
  estimatedImpact: string;
  recommendedAction: string;
  ctaLabel?: string;
  defaultExpanded?: boolean;
};

export type RecommendedActionStatus = 'pending' | 'completed';

export type RecommendedAction = {
  id: string;
  priority: number;
  title: string;
  description: string;
  status: RecommendedActionStatus;
  relatedInsightId: string;
};

export const monthlyBrief = {
  label: 'الموجز الشهري',
  statusLabel: 'مستقر',
  items: [
    {
      id: 'positive',
      label: 'أقوى تغير إيجابي',
      value: 'الإيرادات ارتفعت 12%',
      tone: 'success',
    },
    {
      id: 'concern',
      label: 'الخطر الرئيسي',
      value: 'ارتفاع المصروفات التشغيلية',
      tone: 'danger',
    },
    {
      id: 'opportunity',
      label: 'أفضل فرصة',
      value: 'خفض الاشتراكات غير المستخدمة',
      tone: 'brand',
    },
  ] satisfies MonthlyBriefItem[],
} as const;

export const capitalSummary = {
  label: 'ملخص Capital',
  text: 'وضعك المالي مستقر هذا الشهر. ارتفعت الإيرادات، لكن المصروفات التشغيلية والاشتراكات المتكررة تحتاج إلى مراجعة.',
} as const;

export const intelligenceInsights: IntelligenceInsight[] = [
  {
    id: 'opportunity',
    type: 'opportunity',
    statusLabel: 'فرصة',
    title: 'فرصة لخفض المصروفات',
    summary: 'يمكنك توفير 480 ر.س شهريًا بمراجعة اشتراكاتك.',
    explanation: 'لديك أربعة اشتراكات متكررة لا تستخدمها بانتظام. مراجعتها قد تخفف الضغط على المصروفات التشغيلية بدون التأثير على الإيرادات.',
    estimatedImpact: '+480 ر.س شهريًا',
    recommendedAction: 'راجع اشتراكات البرامج وحدد الأدوات غير المستخدمة خلال هذا الأسبوع.',
    ctaLabel: 'مراجعة الاشتراكات',
  },
  {
    id: 'warning',
    type: 'warning',
    statusLabel: 'تنبيه',
    title: 'ارتفاع المصروفات التشغيلية',
    summary: 'المصروفات التشغيلية ارتفعت 14% مقارنة بالشهر السابق.',
    explanation: 'الارتفاع لا يزال قابلًا للسيطرة، لكنه قد يقلل هامش الربح إذا استمر بنفس الوتيرة خلال الشهر القادم.',
    estimatedImpact: '-3,200 ر.س',
    recommendedAction: 'راجع البنود المتكررة وحدد سقفًا مؤقتًا للمصروفات التشغيلية.',
  },
  {
    id: 'risk',
    type: 'risk',
    statusLabel: 'مخاطرة',
    title: 'فاتورة متأخرة',
    summary: 'هناك فاتورة بقيمة 8,500 ر.س تجاوزت موعد السداد.',
    explanation: 'تأخر التحصيل قد يؤثر على التدفق النقدي قصير المدى، خصوصًا مع الالتزامات المتكررة الحالية.',
    estimatedImpact: '8,500 ر.س',
    recommendedAction: 'تابع الفاتورة المتأخرة اليوم أو أرسل تذكير دفع للعميل.',
  },
  {
    id: 'forecast',
    type: 'forecast',
    statusLabel: 'توقع',
    title: 'توقع التدفق النقدي',
    summary: 'سيظل التدفق النقدي موجبًا خلال الثلاثين يومًا القادمة.',
    explanation: 'بناءً على نمط الإيرادات والمصروفات الحالي، يبقى النشاط في نطاق مستقر إذا لم تظهر مصروفات كبيرة غير مخطط لها.',
    estimatedImpact: '+30 يومًا',
    recommendedAction: 'حافظ على ميزانية التسويق الحالية وراجع الالتزامات قبل أي توسع جديد.',
  },
];
