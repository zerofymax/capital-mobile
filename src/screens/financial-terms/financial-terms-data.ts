import { routes } from '@/constants/routes';
import type {
  FinancialTerm,
  FinancialTermCategory,
  FinancialTermCategoryDefinition,
  FinancialTermCategoryFilter,
  FinancialTermId,
} from './financial-terms-types';
import { financialTermIds } from './financial-terms-types';

export const financialTermCategories: readonly FinancialTermCategoryDefinition[] = [
  { id: 'all', label: 'الكل' },
  { id: 'basics', label: 'الأساسيات' },
  { id: 'profitability', label: 'الربحية والمصروفات' },
  { id: 'liquidity', label: 'السيولة والتخطيط' },
  { id: 'saas', label: 'شركات SaaS' },
  { id: 'invoices', label: 'الفواتير والتحصيل' },
] as const;

const financialReportsDestination = { label: 'فتح التقارير المالية', route: routes.financialReports };
const growthDestination = { label: 'فتح مؤشرات SaaS', route: routes.growthMetrics };
const budgetDestination = { label: 'فتح حدود الميزانية', route: routes.budgets };
const recurringDestination = { label: 'فتح المصروفات المتكررة', route: routes.recurringExpenses };
const invoicesDestination = { label: 'فتح الفواتير المستحقة', route: routes.invoices };
const growthTabDestination = { label: 'فتح النمو', route: routes.reports };

export const financialTerms: readonly FinancialTerm[] = [
  {
    id: 'revenue',
    category: 'basics',
    titleAr: 'الإيرادات',
    englishName: 'Revenue',
    aliases: ['دخل', 'مبيعات', 'مداخيل'],
    shortDefinition: 'كل ما تحققه الشركة من بيع منتجاتها أو خدماتها قبل خصم المصروفات.',
    simpleExplanation: 'الإيرادات هي الأموال التي تكسبها شركتك من النشاط الأساسي، مثل الاشتراكات أو المبيعات أو الخدمات.',
    founderImportance: 'تساعدك على معرفة حجم الطلب الحقيقي، وهل النمو يأتي من عملاء أكثر أم من زيادة قيمة المبيعات.',
    formula: 'الإيرادات = مجموع المبيعات أو الاشتراكات أو الخدمات خلال الفترة',
    formulaExplanation: 'اجمع كل المبالغ المسجلة كدخل خلال نفس الفترة، ولا تخصم منها المصروفات.',
    example: {
      title: 'مثال سريع',
      description: 'إذا باعت الشركة خدمات بقيمة 80,000 ر.س واشتراكات بقيمة 20,000 ر.س، فالإيرادات 100,000 ر.س.',
      result: '100,000 ر.س',
    },
    interpretation: ['ارتفاع الإيرادات جيد عندما لا ترتفع المصروفات بوتيرة أسرع.', 'قارن الإيرادات بالتحصيل النقدي حتى لا تختلط المبيعات غير المحصلة بالنقد المتاح.'],
    commonMistake: 'اعتبار الإيرادات مساوية للربح، مع أن المصروفات لم تخصم بعد.',
    simplerSummary: 'الإيرادات هي كل الأموال التي كسبتها شركتك من البيع قبل خصم التكاليف.',
    relatedTermIds: ['expenses', 'profit', 'net-profit', 'cash-flow'],
    capitalDestination: financialReportsDestination,
    icon: 'trending-up-outline',
  },
  {
    id: 'expenses',
    category: 'basics',
    titleAr: 'المصروفات',
    englishName: 'Expenses',
    aliases: ['تكاليف', 'مدفوعات', 'إنفاق'],
    shortDefinition: 'كل ما تدفعه الشركة لتشغيل النشاط وتقديم المنتج أو الخدمة.',
    simpleExplanation: 'المصروفات تشمل الرواتب، الأدوات، التسويق، الإيجار، ورسوم الخدمات التي يحتاجها النشاط.',
    founderImportance: 'توضح أين يذهب المال، وتساعدك على تخفيض البنود التي لا تضيف قيمة واضحة.',
    formula: 'المصروفات = مجموع التكاليف المباشرة + المصروفات التشغيلية + المصروفات الأخرى',
    formulaExplanation: 'اجمع كل بنود الإنفاق المسجلة خلال الفترة نفسها.',
    example: {
      title: 'مثال سريع',
      description: 'دفعت الشركة 30,000 ر.س رواتب و10,000 ر.س أدوات و5,000 ر.س تسويق، فالمصروفات 45,000 ر.س.',
      result: '45,000 ر.س',
    },
    interpretation: ['راقب البنود الكبيرة أولًا.', 'ارتفاع المصروفات مقبول إذا كان يقابله نمو واضح في الإيرادات أو جودة الخدمة.'],
    commonMistake: 'تجاهل المصروفات الصغيرة المتكررة لأنها تبدو قليلة منفردة.',
    simplerSummary: 'المصروفات هي الأموال التي خرجت أو التزمت بها لتشغيل الشركة.',
    relatedTermIds: ['revenue', 'profit', 'operating-expenses', 'recurring-expense'],
    capitalDestination: financialReportsDestination,
    icon: 'trending-down-outline',
  },
  {
    id: 'profit',
    category: 'basics',
    titleAr: 'الربح',
    englishName: 'Profit',
    aliases: ['مكسب', 'ربحية'],
    shortDefinition: 'المبلغ المتبقي عندما تكون الإيرادات أعلى من المصروفات.',
    simpleExplanation: 'الربح يعني أن ما كسبته الشركة خلال الفترة أكبر مما أنفقته.',
    founderImportance: 'يوضح هل النشاط ينتج قيمة مالية فعلية أم يستهلك أموالًا أكثر مما يحقق.',
    formula: 'الربح = الإيرادات - المصروفات',
    formulaExplanation: 'إذا كانت النتيجة موجبة فهي ربح، وإذا كانت سالبة فهي خسارة.',
    example: {
      title: 'مثال سريع',
      description: 'إيرادات 100,000 ر.س ومصروفات 70,000 ر.س تعني ربحًا قدره 30,000 ر.س.',
      result: '30,000 ر.س',
    },
    interpretation: ['الربح لا يعني دائمًا توفر نقد في الحساب.', 'قارن الربح بالتدفق النقدي حتى تفهم جودة التحصيل.'],
    commonMistake: 'الخلط بين الربح والرصيد النقدي المتاح في الحساب.',
    simplerSummary: 'الربح هو ما يتبقى بعد خصم مصروفاتك من إيراداتك.',
    relatedTermIds: ['net-profit', 'loss', 'cash-balance', 'cash-flow'],
    capitalDestination: financialReportsDestination,
    icon: 'wallet-outline',
  },
  {
    id: 'loss',
    category: 'basics',
    titleAr: 'الخسارة',
    englishName: 'Loss',
    aliases: ['عجز', 'خسائر'],
    shortDefinition: 'تحدث عندما تكون المصروفات أعلى من الإيرادات خلال فترة محددة.',
    simpleExplanation: 'الخسارة تعني أن النشاط أنفق أكثر مما حقق، وقد تكون مؤقتة في مراحل النمو أو علامة خطر إذا استمرت.',
    founderImportance: 'تساعدك على تحديد متى تحتاج لتقليل الإنفاق أو تحسين التسعير أو زيادة التحصيل.',
    formula: 'الخسارة = المصروفات - الإيرادات عندما تكون المصروفات أعلى',
    formulaExplanation: 'إذا كان الفرق بين الإيرادات والمصروفات سالبًا، فالمبلغ يمثل خسارة.',
    example: {
      title: 'مثال سريع',
      description: 'إيرادات 60,000 ر.س ومصروفات 75,000 ر.س تعني خسارة 15,000 ر.س.',
      result: '15,000 ر.س',
    },
    interpretation: ['الخسارة الشهرية المتكررة تقلل مدة بقاء السيولة.', 'افصل بين خسارة مخططة للنمو وخسارة بسبب إنفاق غير منضبط.'],
    commonMistake: 'الانتظار حتى ينخفض الرصيد النقدي بدل مراقبة الخسارة مبكرًا.',
    simplerSummary: 'الخسارة تعني أن شركتك أنفقت أكثر مما كسبت.',
    relatedTermIds: ['profit', 'net-profit', 'burn-rate', 'runway'],
    capitalDestination: financialReportsDestination,
    icon: 'alert-circle-outline',
  },
  {
    id: 'net-profit',
    category: 'basics',
    titleAr: 'صافي الربح',
    englishName: 'Net Profit',
    aliases: ['الربح الصافي', 'صافي الدخل'],
    shortDefinition: 'الربح النهائي بعد خصم كل المصروفات والتكاليف من الإيرادات.',
    simpleExplanation: 'صافي الربح هو الرقم الذي يخبرك بما تبقى فعليًا من أداء النشاط بعد كل المصروفات.',
    founderImportance: 'يساعدك على معرفة هل نموذج العمل مربح وقابل للاستمرار أم يحتاج تعديلًا.',
    formula: 'صافي الربح = إجمالي الإيرادات - إجمالي المصروفات',
    formulaExplanation: 'إذا كانت الإيرادات 128,000 ر.س والمصروفات 85,450 ر.س، يكون صافي الربح 42,550 ر.س.',
    example: {
      title: 'مثال من Capital',
      description: 'حققت الشركة 128,000 ر.س إيرادات وأنفقت 85,450 ر.س، لذلك صافي الربح 42,550 ر.س.',
      result: '42,550 ر.س',
    },
    interpretation: ['ارتفاع صافي الربح مع ثبات الجودة إشارة صحية.', 'انخفاضه رغم نمو الإيرادات يعني أن المصروفات تلتهم النمو.'],
    commonMistake: 'اعتبار صافي الربح مبلغًا نقديًا متاحًا فورًا، مع أن بعض الإيرادات قد تكون غير محصلة.',
    simplerSummary: 'صافي الربح هو ما يبقى من الإيرادات بعد دفع كل المصروفات.',
    relatedTermIds: ['revenue', 'expenses', 'net-profit-margin', 'cash-flow'],
    capitalDestination: financialReportsDestination,
    icon: 'checkmark-circle-outline',
  },
  {
    id: 'cash-balance',
    category: 'basics',
    titleAr: 'الرصيد النقدي',
    englishName: 'Cash Balance',
    aliases: ['النقد المتاح', 'رصيد الحساب', 'الكاش'],
    shortDefinition: 'المبلغ المتاح حاليًا في الحسابات أو المحافظ التي تستخدمها الشركة.',
    simpleExplanation: 'الرصيد النقدي يختلف عن الربح؛ قد تكون مربحًا لكن التحصيل متأخر، أو لديك نقد بسبب تمويل لا بسبب مبيعات.',
    founderImportance: 'يساعدك على اتخاذ قرارات الدفع والتوظيف والشراء دون تعريض الشركة لنقص سيولة.',
    example: {
      title: 'مثال سريع',
      description: 'إذا كان في الحساب البنكي 90,000 ر.س وفي المحفظة 10,000 ر.س، فالرصيد النقدي 100,000 ر.س.',
      result: '100,000 ر.س',
    },
    interpretation: ['راقب الرصيد مع الالتزامات القادمة.', 'لا تعتمد على الرصيد وحده لتقييم الربحية.'],
    commonMistake: 'الخلط بين وجود رصيد مرتفع وبين كون النشاط مربحًا.',
    simplerSummary: 'الرصيد النقدي هو المال المتاح الآن للدفع والتشغيل.',
    relatedTermIds: ['cash-flow', 'liquidity', 'runway', 'profit'],
    icon: 'cash-outline',
  },
  {
    id: 'capital',
    category: 'basics',
    titleAr: 'رأس المال',
    englishName: 'Capital',
    aliases: ['تمويل', 'استثمار', 'مبلغ التأسيس'],
    shortDefinition: 'الأموال التي يبدأ بها النشاط أو تضخ فيه لدعم التشغيل والنمو.',
    simpleExplanation: 'رأس المال قد يأتي من المؤسس أو المستثمرين أو الأرباح المعاد استثمارها، ويستخدم لبناء الشركة قبل أو أثناء تحقيق أرباح كافية.',
    founderImportance: 'يوضح كم تملك من موارد لدعم النمو، ومتى تحتاج تمويلًا إضافيًا أو تخفيضًا للإنفاق.',
    example: {
      title: 'مثال سريع',
      description: 'إذا ضخ المؤسس 200,000 ر.س لبدء النشاط، فهذا يمثل رأس مال مبدئي.',
      result: '200,000 ر.س',
    },
    interpretation: ['استخدم رأس المال في بنود تزيد قدرة الشركة على تحقيق الإيرادات.', 'لا تخلط بين رأس المال والإيرادات التشغيلية.'],
    commonMistake: 'اعتبار التمويل إيرادًا من النشاط، مع أنه مصدر تمويل وليس مبيعات.',
    simplerSummary: 'رأس المال هو المال الذي يمول بداية الشركة ونموها.',
    relatedTermIds: ['cash-balance', 'runway', 'burn-rate', 'revenue'],
    icon: 'business-outline',
  },
  {
    id: 'gross-profit',
    category: 'profitability',
    titleAr: 'مجمل الربح',
    englishName: 'Gross Profit',
    aliases: ['الربح الإجمالي'],
    shortDefinition: 'ما يتبقى من الإيرادات بعد خصم التكاليف المباشرة لتقديم الخدمة أو المنتج.',
    simpleExplanation: 'مجمل الربح يوضح هل المنتج أو الخدمة نفسها مربحة قبل مصروفات الإدارة والتسويق.',
    founderImportance: 'يساعدك على فهم جودة التسعير وتكلفة تقديم الخدمة قبل النظر إلى باقي المصروفات.',
    formula: 'مجمل الربح = الإيرادات - التكاليف المباشرة',
    formulaExplanation: 'لا تخصم الرواتب الإدارية أو المصروفات التشغيلية العامة هنا.',
    example: {
      title: 'مثال سريع',
      description: 'إيرادات 100,000 ر.س وتكاليف مباشرة 35,000 ر.س تعني مجمل ربح 65,000 ر.س.',
      result: '65,000 ر.س',
    },
    interpretation: ['مجمل ربح مرتفع يعني أن التسعير أو تكلفة الخدمة جيدة.', 'مجمل ربح منخفض قد يتطلب رفع السعر أو تخفيض تكلفة التنفيذ.'],
    commonMistake: 'خلط مجمل الربح مع صافي الربح بعد كل المصروفات.',
    simplerSummary: 'مجمل الربح هو ربح المنتج قبل مصاريف تشغيل الشركة العامة.',
    relatedTermIds: ['gross-margin', 'direct-costs', 'net-profit', 'revenue'],
    capitalDestination: financialReportsDestination,
    icon: 'layers-outline',
  },
  {
    id: 'gross-margin',
    category: 'profitability',
    titleAr: 'هامش مجمل الربح',
    englishName: 'Gross Margin',
    aliases: ['هامش الربح الإجمالي'],
    shortDefinition: 'نسبة مجمل الربح إلى الإيرادات.',
    simpleExplanation: 'الهامش يحول مجمل الربح إلى نسبة سهلة المقارنة بين الشهور أو المنتجات.',
    founderImportance: 'يساعدك على معرفة هل كل ريال مبيعات يترك مساحة كافية لتغطية المصروفات الأخرى.',
    formula: 'هامش مجمل الربح = مجمل الربح ÷ الإيرادات × 100',
    formulaExplanation: 'إذا كانت الإيرادات صفرًا، لا تكون النسبة متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'مجمل ربح 60,000 ر.س من إيرادات 100,000 ر.س يعني هامش 60%.',
      result: '60%',
    },
    interpretation: ['الهامش المرتفع يمنحك قدرة أفضل على التسويق والتوظيف.', 'انخفاض الهامش يحتاج مراجعة التسعير أو تكلفة تقديم الخدمة.'],
    commonMistake: 'مقارنة الهامش بين منتجات مختلفة دون فهم اختلاف تكلفة تقديم كل منتج.',
    simplerSummary: 'هامش مجمل الربح يخبرك كم يتبقى من كل 100 ر.س مبيعات قبل مصاريف التشغيل.',
    relatedTermIds: ['gross-profit', 'direct-costs', 'net-profit-margin', 'revenue'],
    capitalDestination: financialReportsDestination,
    icon: 'pie-chart-outline',
  },
  {
    id: 'net-profit-margin',
    category: 'profitability',
    titleAr: 'هامش صافي الربح',
    englishName: 'Net Profit Margin',
    aliases: ['هامش الربح الصافي', 'نسبة الربح الصافي'],
    shortDefinition: 'نسبة صافي الربح إلى إجمالي الإيرادات.',
    simpleExplanation: 'يوضح كم تحتفظ الشركة كربح نهائي من كل ريال إيراد بعد كل المصروفات.',
    founderImportance: 'يساعدك على قياس كفاءة الشركة، وليس حجمها فقط.',
    formula: 'هامش صافي الربح = صافي الربح ÷ إجمالي الإيرادات × 100',
    formulaExplanation: 'إذا كانت الإيرادات صفرًا، لا تكون النتيجة متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'صافي ربح 25,000 ر.س من إيرادات 100,000 ر.س يعني هامش صافي ربح 25%.',
      result: '25%',
    },
    interpretation: ['تحسن الهامش يعني أن النمو أصبح أكثر كفاءة.', 'انخفاض الهامش مع نمو الإيرادات قد يشير إلى إنفاق زائد.'],
    commonMistake: 'التركيز على الإيرادات فقط مع تجاهل الهامش.',
    simplerSummary: 'هامش صافي الربح هو نسبة الربح النهائي من إجمالي مبيعاتك.',
    relatedTermIds: ['net-profit', 'gross-margin', 'expenses', 'revenue'],
    capitalDestination: financialReportsDestination,
    icon: 'analytics-outline',
  },
  {
    id: 'direct-costs',
    category: 'profitability',
    titleAr: 'التكاليف المباشرة',
    englishName: 'Direct Costs',
    aliases: ['تكلفة الخدمة', 'تكلفة المنتج'],
    shortDefinition: 'تكاليف ترتبط مباشرة بتقديم المنتج أو الخدمة للعميل.',
    simpleExplanation: 'تشمل مثل تكلفة الخوادم المرتبطة بالخدمة أو رسوم الدفع أو تكلفة تنفيذ الطلب.',
    founderImportance: 'تساعدك على فهم هل المنتج مربح قبل تحمل مصاريف الإدارة والتسويق.',
    example: {
      title: 'مثال سريع',
      description: 'رسوم دفع 2,000 ر.س وخوادم 4,000 ر.س وتكلفة تنفيذ 6,000 ر.س تعني تكاليف مباشرة 12,000 ر.س.',
      result: '12,000 ر.س',
    },
    interpretation: ['إذا زادت مع كل عميل جديد فهي تكلفة مباشرة غالبًا.', 'خفضها يحسن مجمل الربح مباشرة.'],
    commonMistake: 'إدخال مصروفات عامة مثل إيجار المكتب ضمن التكاليف المباشرة.',
    simplerSummary: 'التكاليف المباشرة هي ما تدفعه لتسليم المنتج أو الخدمة نفسها.',
    relatedTermIds: ['gross-profit', 'gross-margin', 'expenses', 'operating-expenses'],
    capitalDestination: financialReportsDestination,
    icon: 'construct-outline',
  },
  {
    id: 'operating-expenses',
    category: 'profitability',
    titleAr: 'المصروفات التشغيلية',
    englishName: 'Operating Expenses',
    acronym: 'OPEX',
    aliases: ['مصاريف تشغيل', 'نفقات تشغيلية'],
    shortDefinition: 'مصروفات تشغيل الشركة اليومية غير المرتبطة مباشرة بتسليم منتج واحد.',
    simpleExplanation: 'تشمل رواتب الفريق، الإيجار، الأدوات، التسويق، والخدمات الإدارية.',
    founderImportance: 'توضح تكلفة تشغيل الشركة حتى قبل التوسع، وتكشف البنود التي تضغط على الربحية.',
    example: {
      title: 'مثال سريع',
      description: 'رواتب 40,000 ر.س وإيجار 10,000 ر.س وأدوات 5,000 ر.س تعني مصروفات تشغيلية 55,000 ر.س.',
      result: '55,000 ر.س',
    },
    interpretation: ['راقبها شهريًا لأنها تتكرر غالبًا.', 'ارتفاعها يجب أن يقابله نمو مستدام في الإيرادات.'],
    commonMistake: 'إهمال أثر الاشتراكات الصغيرة ضمن مصروفات التشغيل.',
    simplerSummary: 'مصروفات التشغيل هي تكلفة إبقاء الشركة تعمل كل شهر.',
    relatedTermIds: ['expenses', 'recurring-expense', 'net-profit', 'budget'],
    capitalDestination: financialReportsDestination,
    icon: 'briefcase-outline',
  },
  {
    id: 'break-even',
    category: 'profitability',
    titleAr: 'نقطة التعادل',
    englishName: 'Break-even Point',
    aliases: ['التعادل', 'نقطة عدم الربح والخسارة'],
    shortDefinition: 'المستوى الذي تتساوى فيه الإيرادات مع المصروفات.',
    simpleExplanation: 'عند نقطة التعادل لا تربح الشركة ولا تخسر، لكنها تغطي تكاليفها فقط.',
    founderImportance: 'تساعدك على معرفة حجم المبيعات المطلوب لتغطية الالتزامات قبل تحقيق أرباح.',
    formula: 'نقطة التعادل = المصروفات الثابتة ÷ هامش المساهمة لكل وحدة',
    formulaExplanation: 'إذا كان المقام صفرًا فلا يمكن حساب نقطة التعادل.',
    example: {
      title: 'مثال سريع',
      description: 'إذا كانت مصروفاتك الشهرية 50,000 ر.س وتربح 50 ر.س من كل طلب، تحتاج 1,000 طلب للتعادل.',
      result: '1,000 طلب',
    },
    interpretation: ['كلما انخفضت نقطة التعادل أصبح الوصول للربحية أسهل.', 'ارتفاعها يعني أن الشركة تحتاج حجم مبيعات أكبر لتغطية نفسها.'],
    commonMistake: 'حساب التعادل باستخدام الإيرادات فقط دون معرفة هامش كل عملية بيع.',
    simplerSummary: 'نقطة التعادل هي اللحظة التي تغطي فيها مبيعاتك مصروفاتك.',
    relatedTermIds: ['profit', 'expenses', 'gross-margin', 'budget'],
    capitalDestination: financialReportsDestination,
    icon: 'remove-circle-outline',
  },
  {
    id: 'recurring-expense',
    category: 'profitability',
    titleAr: 'المصروف المتكرر',
    englishName: 'Recurring Expense',
    aliases: ['التزام شهري', 'اشتراك متكرر', 'مصروف دوري'],
    shortDefinition: 'مصروف يتكرر بشكل منتظم مثل اشتراك شهري أو إيجار أو خدمة مستمرة.',
    simpleExplanation: 'هذه المصروفات قد تبدو صغيرة لكنها تتراكم لأنها تعود كل شهر أو كل فترة.',
    founderImportance: 'تساعدك على ضبط الالتزامات قبل أن تصبح عبئًا ثابتًا على السيولة.',
    example: {
      title: 'مثال سريع',
      description: 'اشتراك أداة 500 ر.س شهريًا يعني 6,000 ر.س سنويًا.',
      result: '6,000 ر.س سنويًا',
    },
    interpretation: ['راجع الاشتراكات غير المستخدمة.', 'قارن قيمة كل مصروف متكرر بأثره على الإيرادات أو الإنتاجية.'],
    commonMistake: 'تقييم الاشتراك بسعره الشهري فقط دون النظر إلى أثره السنوي.',
    simplerSummary: 'المصروف المتكرر هو التزام يعود باستمرار ويؤثر على السيولة كل فترة.',
    relatedTermIds: ['operating-expenses', 'budget', 'cash-outflow', 'runway'],
    capitalDestination: recurringDestination,
    icon: 'repeat-outline',
  },
  {
    id: 'cash-flow',
    category: 'liquidity',
    titleAr: 'التدفق النقدي',
    englishName: 'Cash Flow',
    aliases: ['حركة النقد', 'دخول وخروج الأموال', 'تدفقات نقدية'],
    shortDefinition: 'حركة الأموال التي دخلت الشركة وخرجت منها فعليًا خلال فترة محددة.',
    simpleExplanation: 'التدفق النقدي يركز على النقد الحقيقي، لا على الفواتير التي صدرت ولم تحصل بعد.',
    founderImportance: 'يساعدك على معرفة هل لديك مال كاف للدفع حتى لو كانت الشركة مربحة على الورق.',
    formula: 'صافي التدفق النقدي = التدفقات الداخلة - التدفقات الخارجة',
    formulaExplanation: 'إذا كان الناتج موجبًا زاد النقد، وإذا كان سالبًا انخفض.',
    example: {
      title: 'مثال سريع',
      description: 'دخل 60,000 ر.س وخرج 45,000 ر.س، فصافي التدفق النقدي 15,000 ر.س.',
      result: '15,000 ر.س',
    },
    interpretation: ['تدفق نقدي موجب يعني قدرة أفضل على الدفع.', 'تدفق سلبي مستمر يقلل مدة بقاء السيولة.'],
    commonMistake: 'اعتبار الفواتير الصادرة نقدًا محصلًا قبل وصول المال فعلًا.',
    simplerSummary: 'التدفق النقدي هو الأموال التي دخلت وخرجت من شركتك فعليًا.',
    relatedTermIds: ['cash-inflow', 'cash-outflow', 'cash-balance', 'runway'],
    capitalDestination: financialReportsDestination,
    icon: 'swap-vertical-outline',
  },
  {
    id: 'liquidity',
    category: 'liquidity',
    titleAr: 'السيولة',
    englishName: 'Liquidity',
    aliases: ['قدرة الدفع', 'النقدية', 'السيولة النقدية'],
    shortDefinition: 'قدرة الشركة على الوفاء بالتزاماتها القريبة باستخدام النقد المتاح.',
    simpleExplanation: 'السيولة لا تعني الربح فقط؛ تعني وجود مال جاهز لدفع الرواتب والفواتير والالتزامات.',
    founderImportance: 'تساعدك على تجنب التعثر المفاجئ حتى عندما تكون المبيعات جيدة.',
    example: {
      title: 'مثال سريع',
      description: 'إذا كان لديك 80,000 ر.س نقدًا والتزامات قريبة 50,000 ر.س، فالسيولة مريحة نسبيًا.',
      result: '30,000 ر.س هامش أمان',
    },
    interpretation: ['السيولة الجيدة تمنحك وقتًا لاتخاذ قرارات هادئة.', 'السيولة الضعيفة تتطلب تسريع التحصيل أو خفض المدفوعات.'],
    commonMistake: 'الاعتماد على أرباح متوقعة بدل نقد موجود.',
    simplerSummary: 'السيولة هي قدرتك على الدفع الآن وفي المدى القريب.',
    relatedTermIds: ['cash-balance', 'cash-flow', 'collection', 'accounts-receivable'],
    capitalDestination: financialReportsDestination,
    icon: 'water-outline',
  },
  {
    id: 'burn-rate',
    category: 'liquidity',
    titleAr: 'الحرق الشهري',
    englishName: 'Burn Rate',
    aliases: ['معدل الحرق', 'استهلاك النقد الشهري'],
    shortDefinition: 'مقدار النقد الذي تستهلكه الشركة شهريًا عندما تكون المصروفات النقدية أعلى من النقد الداخل.',
    simpleExplanation: 'يعبر عن سرعة انخفاض الرصيد النقدي بسبب التشغيل أو النمو.',
    founderImportance: 'يساعدك على معرفة متى تحتاج تقليل المصروفات أو زيادة التمويل أو تسريع الإيرادات.',
    formula: 'الحرق الشهري = النقد الخارج شهريًا - النقد الداخل شهريًا',
    formulaExplanation: 'يستخدم عندما يكون الخارج أكبر من الداخل. إذا كان الداخل أعلى، فقد لا يوجد حرق فعلي.',
    example: {
      title: 'مثال سريع',
      description: 'خرج 70,000 ر.س ودخل 50,000 ر.س خلال الشهر، فالحرق الشهري 20,000 ر.س.',
      result: '20,000 ر.س',
    },
    interpretation: ['انخفاض الحرق يزيد مدة بقاء السيولة.', 'ارتفاعه يحتاج تفسيرًا: نمو مخطط أم إنفاق غير منضبط.'],
    commonMistake: 'حساب الحرق من الأرباح بدل الحركة النقدية.',
    simplerSummary: 'الحرق الشهري هو سرعة استهلاك شركتك للنقد.',
    relatedTermIds: ['runway', 'cash-flow', 'cash-balance', 'loss'],
    capitalDestination: growthTabDestination,
    icon: 'flame-outline',
  },
  {
    id: 'runway',
    category: 'liquidity',
    titleAr: 'مدة بقاء السيولة',
    englishName: 'Runway',
    aliases: ['مدة الاستمرار', 'أشهر السيولة'],
    shortDefinition: 'عدد الأشهر التي تستطيع الشركة الاستمرار فيها بالنقد الحالي إذا استمر الحرق الشهري نفسه.',
    simpleExplanation: 'Runway يترجم الرصيد النقدي إلى وقت متاح أمامك قبل الحاجة لتغيير الخطة.',
    founderImportance: 'يساعدك على التخطيط للتوظيف، التسويق، التمويل، وخفض المصروفات قبل فوات الأوان.',
    formula: 'مدة بقاء السيولة = النقد المتاح ÷ الحرق الشهري',
    formulaExplanation: 'إذا كان الحرق الشهري صفرًا أو أقل، لا تكون النتيجة التقليدية متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'رصيد نقدي 120,000 ر.س وحرق شهري 20,000 ر.س يعني Runway لمدة 6 أشهر.',
      result: '6 أشهر',
    },
    interpretation: ['كلما زادت المدة كان لديك وقت أكبر للتجربة والتصحيح.', 'المدة القصيرة تحتاج قرارات سريعة في التحصيل أو المصروفات.'],
    commonMistake: 'استخدام مصروفات محاسبية بدل الحرق النقدي الفعلي.',
    simplerSummary: 'Runway هو عدد الأشهر التي تستطيع شركتك الاستمرار فيها بالنقد الحالي.',
    relatedTermIds: ['burn-rate', 'cash-balance', 'liquidity', 'cash-flow'],
    capitalDestination: growthTabDestination,
    icon: 'timer-outline',
  },
  {
    id: 'budget',
    category: 'liquidity',
    titleAr: 'الميزانية',
    englishName: 'Budget',
    aliases: ['حد الإنفاق', 'خطة المصروفات'],
    shortDefinition: 'خطة تحدد كم تنوي الشركة إنفاقه على بند أو فترة معينة.',
    simpleExplanation: 'الميزانية تساعدك على وضع حدود قبل الصرف بدل اكتشاف التجاوز بعد نهاية الشهر.',
    founderImportance: 'تجعل الإنفاق مرتبطًا بالأولويات وتمنع البنود الصغيرة من الخروج عن السيطرة.',
    example: {
      title: 'مثال سريع',
      description: 'إذا حددت 5,000 ر.س للتسويق وصرفت 3,200 ر.س، بقي 1,800 ر.س من الميزانية.',
      result: '1,800 ر.س',
    },
    interpretation: ['الميزانية الجيدة واقعية وقابلة للمراجعة.', 'تجاوز الميزانية ليس سيئًا دائمًا إذا كان بقرار واع ونتيجة واضحة.'],
    commonMistake: 'وضع ميزانية ثم عدم مراجعتها أثناء الشهر.',
    simplerSummary: 'الميزانية هي حد مخطط يساعدك على التحكم في الإنفاق.',
    relatedTermIds: ['expenses', 'recurring-expense', 'cash-outflow', 'break-even'],
    capitalDestination: budgetDestination,
    icon: 'speedometer-outline',
  },
  {
    id: 'cash-inflow',
    category: 'liquidity',
    titleAr: 'التدفق النقدي الداخل',
    englishName: 'Cash Inflow',
    aliases: ['نقد داخل', 'تحصيلات', 'دخول النقد'],
    shortDefinition: 'الأموال التي وصلت فعلًا إلى حسابات الشركة خلال فترة معينة.',
    simpleExplanation: 'يشمل التحصيل من العملاء أو التمويل أو أي مال دخل فعليًا.',
    founderImportance: 'يساعدك على تقييم قدرة الشركة على تمويل نفسها من التحصيل الحقيقي.',
    example: {
      title: 'مثال سريع',
      description: 'إذا دفع العملاء 40,000 ر.س ودخل تمويل 20,000 ر.س، فالتدفق الداخل 60,000 ر.س.',
      result: '60,000 ر.س',
    },
    interpretation: ['ارتفاع التدفق الداخل يحسن السيولة.', 'افصله عن الإيرادات غير المحصلة.'],
    commonMistake: 'احتساب فاتورة أصدرت ولم يدفعها العميل كتدفق نقدي داخل.',
    simplerSummary: 'التدفق الداخل هو المال الذي وصل حسابك فعليًا.',
    relatedTermIds: ['cash-flow', 'collection', 'accounts-receivable', 'cash-balance'],
    capitalDestination: financialReportsDestination,
    icon: 'arrow-down-circle-outline',
  },
  {
    id: 'cash-outflow',
    category: 'liquidity',
    titleAr: 'التدفق النقدي الخارج',
    englishName: 'Cash Outflow',
    aliases: ['نقد خارج', 'مدفوعات', 'خروج النقد'],
    shortDefinition: 'الأموال التي خرجت فعليًا من حسابات الشركة خلال فترة معينة.',
    simpleExplanation: 'يشمل الرواتب، الموردين، الاشتراكات، الإيجارات، وأي مدفوعات نقدية حقيقية.',
    founderImportance: 'يساعدك على معرفة الالتزامات التي تضغط على الرصيد النقدي.',
    example: {
      title: 'مثال سريع',
      description: 'دفعت 25,000 ر.س رواتب و10,000 ر.س موردين، فالتدفق الخارج 35,000 ر.س.',
      result: '35,000 ر.س',
    },
    interpretation: ['خفض الخارج غير الضروري يحسن السيولة فورًا.', 'لا تؤجل مدفوعات مهمة بطريقة تضر العلاقة مع الموردين.'],
    commonMistake: 'تجاهل المدفوعات السنوية لأنها لا تظهر شهريًا.',
    simplerSummary: 'التدفق الخارج هو المال الذي دفعته الشركة فعليًا.',
    relatedTermIds: ['cash-flow', 'expenses', 'recurring-expense', 'accounts-payable'],
    capitalDestination: financialReportsDestination,
    icon: 'arrow-up-circle-outline',
  },
  {
    id: 'mrr',
    category: 'saas',
    titleAr: 'الإيراد الشهري المتكرر',
    englishName: 'Monthly Recurring Revenue',
    acronym: 'MRR',
    aliases: ['monthly recurring revenue', 'إيراد الاشتراكات الشهري'],
    shortDefinition: 'الإيراد المتوقع تكراره شهريًا من الاشتراكات النشطة.',
    simpleExplanation: 'MRR يركز على دخل الاشتراكات المستمر، وليس المبيعات المؤقتة أو رسوم التأسيس.',
    founderImportance: 'يساعد شركات SaaS على معرفة حجم الإيراد القابل للتوقع شهريًا.',
    formula: 'MRR = مجموع قيمة الاشتراكات الشهرية النشطة',
    formulaExplanation: 'لا تدخل الإيرادات غير المتكررة ضمن MRR.',
    example: {
      title: 'مثال سريع',
      description: '100 عميل يدفع كل منهم 300 ر.س شهريًا يعني MRR قدره 30,000 ر.س.',
      result: '30,000 ر.س',
    },
    interpretation: ['نمو MRR يعني توسع الإيراد المتكرر.', 'قارن نموه مع Churn حتى تفهم جودة النمو.'],
    commonMistake: 'إضافة رسوم لمرة واحدة إلى MRR.',
    simplerSummary: 'MRR هو دخل الاشتراكات الذي تتوقع تكراره كل شهر.',
    relatedTermIds: ['arr', 'churn', 'nrr', 'arpu'],
    capitalDestination: growthDestination,
    icon: 'refresh-circle-outline',
  },
  {
    id: 'arr',
    category: 'saas',
    titleAr: 'الإيراد السنوي المتكرر',
    englishName: 'Annual Recurring Revenue',
    acronym: 'ARR',
    aliases: ['annual recurring revenue', 'إيراد الاشتراكات السنوي'],
    shortDefinition: 'الإيراد المتكرر المتوقع خلال سنة بناءً على الاشتراكات الحالية.',
    simpleExplanation: 'ARR يحول MRR إلى صورة سنوية تساعد في عرض حجم الشركة ونموها.',
    founderImportance: 'مفيد للتخطيط السنوي والمقارنة مع أهداف النمو أو المستثمرين.',
    formula: 'ARR = MRR × 12',
    formulaExplanation: 'يعتمد على استمرار الاشتراكات الحالية بنفس المستوى.',
    example: {
      title: 'مثال سريع',
      description: 'إذا كان MRR يساوي 30,000 ر.س، فإن ARR يساوي 360,000 ر.س.',
      result: '360,000 ر.س',
    },
    interpretation: ['ARR جيد للمقارنة السنوية لكنه لا يضمن التحصيل.', 'تغير MRR يؤثر على ARR مباشرة.'],
    commonMistake: 'اعتبار ARR نقدًا مؤكدًا بالكامل رغم احتمال الإلغاء.',
    simplerSummary: 'ARR هو MRR مضروبًا في 12 ليعطي صورة سنوية.',
    relatedTermIds: ['mrr', 'nrr', 'churn', 'revenue'],
    capitalDestination: growthDestination,
    icon: 'calendar-outline',
  },
  {
    id: 'arpu',
    category: 'saas',
    titleAr: 'متوسط الإيراد لكل عميل',
    englishName: 'Average Revenue Per User',
    acronym: 'ARPU',
    aliases: ['average revenue per user', 'متوسط دخل العميل'],
    shortDefinition: 'متوسط ما يحققه كل عميل من إيراد خلال فترة محددة.',
    simpleExplanation: 'ARPU يساعدك على فهم قيمة العميل العادي وليس فقط عدد العملاء.',
    founderImportance: 'يساعد في التسعير، تصميم الباقات، ومعرفة أثر الترقية أو الخصومات.',
    formula: 'ARPU = الإيراد خلال الفترة ÷ عدد العملاء النشطين',
    formulaExplanation: 'إذا كان عدد العملاء صفرًا، لا تكون النتيجة متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'إيراد 50,000 ر.س من 200 عميل يعني ARPU قدره 250 ر.س.',
      result: '250 ر.س',
    },
    interpretation: ['ارتفاع ARPU قد يعني نجاح الباقات الأعلى.', 'انخفاضه قد ينتج عن خصومات أو عملاء منخفضي القيمة.'],
    commonMistake: 'تحسين عدد العملاء دون الانتباه لانخفاض متوسط الإيراد.',
    simplerSummary: 'ARPU يخبرك بمتوسط ما يدفعه العميل الواحد.',
    relatedTermIds: ['mrr', 'ltv', 'cac', 'revenue'],
    capitalDestination: growthDestination,
    icon: 'person-circle-outline',
  },
  {
    id: 'cac',
    category: 'saas',
    titleAr: 'تكلفة اكتساب العميل',
    englishName: 'Customer Acquisition Cost',
    acronym: 'CAC',
    aliases: ['customer acquisition cost', 'تكلفة العميل الجديد'],
    shortDefinition: 'متوسط ما تدفعه للحصول على عميل جديد.',
    simpleExplanation: 'CAC يجمع تكلفة التسويق والمبيعات ثم يقسمها على عدد العملاء الجدد.',
    founderImportance: 'يساعدك على معرفة هل النمو مربح أم أنك تدفع أكثر من قيمة العميل.',
    formula: 'CAC = مصاريف التسويق والمبيعات ÷ عدد العملاء الجدد',
    formulaExplanation: 'إذا لم يوجد عملاء جدد، لا تكون النتيجة متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'أنفقت 20,000 ر.س وجلبت 40 عميلًا جديدًا، فـ CAC يساوي 500 ر.س.',
      result: '500 ر.س',
    },
    interpretation: ['قارن CAC مع LTV لمعرفة جدوى النمو.', 'ارتفاع CAC يحتاج تحسين القنوات أو التسعير.'],
    commonMistake: 'حساب CAC دون إدخال تكلفة فريق المبيعات أو الحملات.',
    simplerSummary: 'CAC هو كم تدفع في المتوسط لجلب عميل جديد.',
    relatedTermIds: ['ltv', 'churn', 'arpu', 'mrr'],
    capitalDestination: growthDestination,
    icon: 'person-add-outline',
  },
  {
    id: 'ltv',
    category: 'saas',
    titleAr: 'قيمة العميل',
    englishName: 'Customer Lifetime Value',
    acronym: 'LTV',
    aliases: ['customer lifetime value', 'القيمة العمرية للعميل'],
    shortDefinition: 'الإيراد أو الربح المتوقع من العميل طوال فترة بقائه مع الشركة.',
    simpleExplanation: 'LTV يساعدك على تقدير قيمة العميل على المدى الطويل، لا أول شهر فقط.',
    founderImportance: 'يساعدك على تحديد سقف منطقي للإنفاق على اكتساب العملاء.',
    formula: 'LTV = متوسط الإيراد من العميل ÷ معدل الإلغاء',
    formulaExplanation: 'إذا كان معدل الإلغاء صفرًا، تحتاج تقديرًا مختلفًا ولا تظهر نتيجة آمنة.',
    example: {
      title: 'مثال سريع',
      description: 'إذا كان ARPU يساوي 300 ر.س ومعدل الإلغاء 5% شهريًا، فقد تكون قيمة العميل التقريبية 6,000 ر.س.',
      result: '6,000 ر.س',
    },
    interpretation: ['LTV يجب أن يكون أعلى من CAC بوضوح.', 'تحسين الاحتفاظ يرفع LTV غالبًا.'],
    commonMistake: 'رفع LTV بتوقعات غير واقعية عن مدة بقاء العميل.',
    simplerSummary: 'LTV هو القيمة المتوقعة من العميل طوال علاقته بشركتك.',
    relatedTermIds: ['cac', 'arpu', 'churn', 'nrr'],
    capitalDestination: growthDestination,
    icon: 'diamond-outline',
  },
  {
    id: 'churn',
    category: 'saas',
    titleAr: 'معدل إلغاء العملاء',
    englishName: 'Churn',
    acronym: 'Churn',
    aliases: ['إلغاء الاشتراك', 'فقد العملاء', 'customer churn'],
    shortDefinition: 'النسبة التي تفقدها الشركة من العملاء أو الإيراد خلال فترة محددة.',
    simpleExplanation: 'Churn يوضح مدى فقدان العملاء، وهو عكس الاحتفاظ تقريبًا.',
    founderImportance: 'انخفاضه يجعل النمو أسهل؛ لأنك لا تحتاج تعويض عملاء مفقودين باستمرار.',
    formula: 'معدل الإلغاء = العملاء المفقودون ÷ العملاء في بداية الفترة × 100',
    formulaExplanation: 'إذا كان عدد العملاء في البداية صفرًا، لا تكون النسبة متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'بدأت الشهر بـ 200 عميل وفقدت 10، فمعدل الإلغاء 5%.',
      result: '5%',
    },
    interpretation: ['انخفاض Churn يساعد على نمو MRR.', 'ارتفاعه قد يعني مشكلة في المنتج أو السعر أو الدعم.'],
    commonMistake: 'الاحتفال بالعملاء الجدد دون خصم العملاء الذين غادروا.',
    simplerSummary: 'Churn هو نسبة العملاء الذين تركوا الخدمة.',
    relatedTermIds: ['mrr', 'nrr', 'ltv', 'cac'],
    capitalDestination: growthDestination,
    icon: 'exit-outline',
  },
  {
    id: 'nrr',
    category: 'saas',
    titleAr: 'صافي الاحتفاظ بالإيراد',
    englishName: 'Net Revenue Retention',
    acronym: 'NRR',
    aliases: ['net revenue retention', 'الاحتفاظ الصافي'],
    shortDefinition: 'يقيس تغير إيراد العملاء الحاليين بعد التوسعات والتخفيضات والإلغاءات.',
    simpleExplanation: 'NRR يخبرك هل العملاء الحاليون يدفعون أكثر مع الوقت أم أقل.',
    founderImportance: 'مؤشر قوي على جودة المنتج وقدرته على النمو من قاعدة العملاء الحالية.',
    formula: 'NRR = (MRR البداية + التوسعات - التخفيضات - الإلغاءات) ÷ MRR البداية × 100',
    formulaExplanation: 'إذا كان MRR البداية صفرًا، لا تكون النتيجة متاحة.',
    example: {
      title: 'مثال سريع',
      description: 'بدأت بـ 100,000 ر.س، زادت 15,000 ر.س وخسرت 5,000 ر.س، فـ NRR يساوي 110%.',
      result: '110%',
    },
    interpretation: ['NRR أعلى من 100% يعني أن العملاء الحاليين ينمون.', 'انخفاضه يتطلب مراجعة الإلغاء والتخفيضات.'],
    commonMistake: 'خلط NRR مع نمو الإيراد الكلي الذي يشمل عملاء جدد.',
    simplerSummary: 'NRR يقيس هل إيراد عملائك الحاليين يكبر أم يصغر.',
    relatedTermIds: ['mrr', 'arr', 'churn', 'ltv'],
    capitalDestination: growthDestination,
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'invoice-due',
    category: 'invoices',
    titleAr: 'الفاتورة المستحقة',
    englishName: 'Due Invoice',
    aliases: ['فاتورة قريبة', 'مستحق الدفع', 'فاتورة تنتظر السداد'],
    shortDefinition: 'فاتورة لم تسدد بعد واقترب أو حان موعد دفعها.',
    simpleExplanation: 'الفاتورة المستحقة تعني أن هناك مبلغًا متوقع التحصيل أو الدفع حسب نوع الفاتورة.',
    founderImportance: 'تساعدك على متابعة التحصيل قبل أن يتأثر التدفق النقدي.',
    example: {
      title: 'مثال سريع',
      description: 'فاتورة بقيمة 12,500 ر.س موعدها 28 يوليو ولم تدفع بعد تعد فاتورة مستحقة.',
      result: '12,500 ر.س',
    },
    interpretation: ['تابعها مبكرًا حتى لا تتحول إلى متأخرة.', 'اربطها بتوقعات السيولة القادمة.'],
    commonMistake: 'اعتبار الفاتورة المستحقة مالًا محصلًا قبل وصوله.',
    simplerSummary: 'الفاتورة المستحقة هي فاتورة تنتظر السداد في موعد قريب أو حالي.',
    relatedTermIds: ['due-date', 'collection', 'overdue-invoice', 'accounts-receivable'],
    capitalDestination: invoicesDestination,
    icon: 'document-text-outline',
  },
  {
    id: 'accounts-receivable',
    category: 'invoices',
    titleAr: 'الحسابات المدينة',
    englishName: 'Accounts Receivable',
    acronym: 'AR',
    aliases: ['ذمم مدينة', 'مبالغ لدى العملاء', 'مستحقات العملاء'],
    shortDefinition: 'مبالغ تستحقها الشركة على العملاء ولم تحصل بعد.',
    simpleExplanation: 'هي فواتير أو مبالغ صدرت للعملاء لكن النقد لم يدخل حساب الشركة بعد.',
    founderImportance: 'تساعدك على فهم الفرق بين المبيعات المسجلة والنقد المحصل.',
    formula: 'الحسابات المدينة = مجموع الفواتير غير المحصلة من العملاء',
    formulaExplanation: 'لا تشمل المبالغ التي تم تحصيلها بالفعل.',
    example: {
      title: 'مثال سريع',
      description: 'ثلاث فواتير غير مدفوعة بقيم 5,000 و7,500 و10,000 ر.س تعني حسابات مدينة 22,500 ر.س.',
      result: '22,500 ر.س',
    },
    interpretation: ['ارتفاعها قد يعني تأخر تحصيل.', 'راقب عمر الفواتير وليس الإجمالي فقط.'],
    commonMistake: 'اعتبار الحسابات المدينة جزءًا من الرصيد النقدي.',
    simplerSummary: 'الحسابات المدينة هي أموال لك عند العملاء ولم تحصلها بعد.',
    relatedTermIds: ['collection', 'invoice-due', 'overdue-invoice', 'cash-inflow'],
    capitalDestination: invoicesDestination,
    icon: 'download-outline',
  },
  {
    id: 'accounts-payable',
    category: 'invoices',
    titleAr: 'الحسابات الدائنة',
    englishName: 'Accounts Payable',
    acronym: 'AP',
    aliases: ['ذمم دائنة', 'مبالغ على الشركة', 'مستحقات الموردين'],
    shortDefinition: 'مبالغ يجب على الشركة دفعها للموردين أو الجهات الأخرى.',
    simpleExplanation: 'هي التزامات لم تدفع بعد، وقد تؤثر على السيولة عند حلول موعدها.',
    founderImportance: 'تساعدك على معرفة المدفوعات القادمة وتجنب ضغط نقدي مفاجئ.',
    formula: 'الحسابات الدائنة = مجموع الفواتير والمستحقات غير المدفوعة على الشركة',
    formulaExplanation: 'لا تشمل المبالغ التي تم دفعها بالفعل.',
    example: {
      title: 'مثال سريع',
      description: 'إذا كان عليك 8,000 ر.س لمورد و4,000 ر.س لخدمة، فالحسابات الدائنة 12,000 ر.س.',
      result: '12,000 ر.س',
    },
    interpretation: ['ارتفاعها قد يساعد مؤقتًا في السيولة لكنه يزيد الالتزامات.', 'ادفع المهم في موعده لتجنب تعطيل الموردين.'],
    commonMistake: 'نسيان الالتزامات غير المدفوعة عند تقدير النقد المتاح.',
    simplerSummary: 'الحسابات الدائنة هي أموال يجب على شركتك دفعها لاحقًا.',
    relatedTermIds: ['cash-outflow', 'due-date', 'expenses', 'liquidity'],
    icon: 'arrow-up-outline',
  },
  {
    id: 'due-date',
    category: 'invoices',
    titleAr: 'موعد الاستحقاق',
    englishName: 'Due Date',
    aliases: ['تاريخ الاستحقاق', 'موعد السداد'],
    shortDefinition: 'التاريخ الذي يجب فيه سداد الفاتورة أو تحصيلها.',
    simpleExplanation: 'موعد الاستحقاق يساعدك على ترتيب التحصيل والمدفوعات حسب الأولوية الزمنية.',
    founderImportance: 'يجعل توقعات السيولة أدق، لأنك تعرف متى يفترض دخول أو خروج المال.',
    example: {
      title: 'مثال سريع',
      description: 'فاتورة صدرت في 1 يوليو ومدة السداد 30 يومًا يكون موعد استحقاقها 31 يوليو.',
      result: '31 يوليو',
    },
    interpretation: ['الفواتير القريبة تحتاج متابعة مبكرة.', 'الفواتير التي تجاوزت موعدها تصبح متأخرة وتحتاج إجراء.'],
    commonMistake: 'إرسال الفاتورة دون تحديد موعد استحقاق واضح.',
    simplerSummary: 'موعد الاستحقاق هو آخر تاريخ متوقع للسداد.',
    relatedTermIds: ['invoice-due', 'overdue-invoice', 'collection', 'accounts-payable'],
    capitalDestination: invoicesDestination,
    icon: 'calendar-number-outline',
  },
  {
    id: 'collection',
    category: 'invoices',
    titleAr: 'التحصيل',
    englishName: 'Collection',
    aliases: ['تحصيل الفواتير', 'قبض المبالغ', 'استلام الدفعات'],
    shortDefinition: 'عملية استلام الأموال المستحقة من العملاء.',
    simpleExplanation: 'التحصيل يحول الفواتير من مبالغ مستحقة إلى نقد داخل فعلي.',
    founderImportance: 'سرعة التحصيل تحسن السيولة وتقلل الحاجة لتمويل خارجي.',
    example: {
      title: 'مثال سريع',
      description: 'إذا دفع العميل فاتورة 12,500 ر.س، فقد تم تحصيل هذا المبلغ وتحول إلى نقد داخل.',
      result: '12,500 ر.س',
    },
    interpretation: ['تحصيل أسرع يعني سيولة أفضل.', 'تأخر التحصيل قد يخلق ضغطًا حتى مع وجود مبيعات جيدة.'],
    commonMistake: 'إهمال متابعة العملاء بعد إرسال الفاتورة.',
    simplerSummary: 'التحصيل هو استلام أموال الفواتير من العملاء.',
    relatedTermIds: ['invoice-due', 'cash-inflow', 'accounts-receivable', 'overdue-invoice'],
    capitalDestination: invoicesDestination,
    icon: 'checkmark-done-outline',
  },
  {
    id: 'partial-payment',
    category: 'invoices',
    titleAr: 'الدفع الجزئي',
    englishName: 'Partial Payment',
    aliases: ['دفعة جزئية', 'سداد جزئي'],
    shortDefinition: 'سداد جزء من قيمة الفاتورة مع بقاء مبلغ غير مدفوع.',
    simpleExplanation: 'الدفع الجزئي يقلل المبلغ المتبقي لكنه لا يغلق الفاتورة بالكامل.',
    founderImportance: 'يساعد على تحسين السيولة حتى لو لم يتم تحصيل كامل المبلغ فورًا.',
    example: {
      title: 'مثال سريع',
      description: 'فاتورة 12,500 ر.س دفع العميل منها 3,500 ر.س، فيبقى 9,000 ر.س.',
      result: '9,000 ر.س متبقية',
    },
    interpretation: ['سجل الدفعات الجزئية حتى لا تضيع المتبقيات.', 'اتفق على مواعيد واضحة لباقي المبلغ.'],
    commonMistake: 'اعتبار الفاتورة مدفوعة بالكامل بعد أول دفعة جزئية.',
    simplerSummary: 'الدفع الجزئي هو جزء من قيمة الفاتورة وليس كاملها.',
    relatedTermIds: ['collection', 'invoice-due', 'accounts-receivable', 'cash-inflow'],
    capitalDestination: invoicesDestination,
    icon: 'card-outline',
  },
  {
    id: 'overdue-invoice',
    category: 'invoices',
    titleAr: 'الفاتورة المتأخرة',
    englishName: 'Overdue Invoice',
    aliases: ['فاتورة متأخرة', 'متأخرة السداد', 'فاتورة تجاوزت الاستحقاق'],
    shortDefinition: 'فاتورة لم تسدد بعد مرور موعد استحقاقها.',
    simpleExplanation: 'الفاتورة المتأخرة تعني أن التحصيل لم يتم في الموعد، وقد يؤثر ذلك على السيولة.',
    founderImportance: 'تساعدك على تحديد العملاء أو الفواتير التي تحتاج متابعة عاجلة.',
    example: {
      title: 'مثال سريع',
      description: 'فاتورة موعدها 15 يوليو ولم تدفع حتى 24 يوليو تعد متأخرة 9 أيام.',
      result: '9 أيام تأخير',
    },
    interpretation: ['كلما زاد التأخير زادت صعوبة التحصيل غالبًا.', 'ابدأ المتابعة قبل أن تتراكم الفواتير المتأخرة.'],
    commonMistake: 'ترك الفواتير المتأخرة دون تذكير أو خطة متابعة.',
    simplerSummary: 'الفاتورة المتأخرة هي فاتورة لم يدفعها العميل بعد موعدها.',
    relatedTermIds: ['invoice-due', 'due-date', 'collection', 'accounts-receivable'],
    capitalDestination: invoicesDestination,
    icon: 'warning-outline',
  },
] as const;

const termIdSet = new Set<FinancialTermId>(financialTermIds);
const categoryOrder: Record<FinancialTermCategory, number> = {
  basics: 1,
  profitability: 2,
  liquidity: 3,
  saas: 4,
  invoices: 5,
};

export function getFinancialTerms() {
  return [...financialTerms].sort(compareFinancialTerms);
}

export function getFinancialTermById(id: string | null | undefined) {
  return financialTerms.find((term) => term.id === id) ?? null;
}

export function getFinancialTermsByCategory(category: FinancialTermCategoryFilter) {
  if (category === 'all') {
    return getFinancialTerms();
  }

  return getFinancialTerms().filter((term) => term.category === category);
}

export function getRelatedFinancialTerms(term: FinancialTerm) {
  return term.relatedTermIds
    .map((id) => getFinancialTermById(id))
    .filter((related): related is FinancialTerm => related !== null);
}

export function searchFinancialTerms(query: string, category: FinancialTermCategoryFilter = 'all') {
  const normalizedQuery = normalizeFinancialTermSearchText(query);
  const terms = getFinancialTermsByCategory(category);

  if (!normalizedQuery) {
    return terms;
  }

  return terms.filter((term) => {
    const searchable = [
      term.titleAr,
      term.englishName,
      term.acronym,
      term.shortDefinition,
      term.simpleExplanation,
      ...term.aliases,
    ]
      .filter(Boolean)
      .join(' ');

    return normalizeFinancialTermSearchText(searchable).includes(normalizedQuery);
  });
}

export function getFinancialTermCategoryLabel(category: FinancialTermCategoryFilter) {
  return financialTermCategories.find((item) => item.id === category)?.label ?? financialTermCategories[0]!.label;
}

export function normalizeFinancialTermSearchText(value: string) {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateFinancialTerms() {
  const ids = new Set<string>();
  const errors: string[] = [];

  financialTerms.forEach((term) => {
    if (ids.has(term.id)) {
      errors.push(`Duplicate financial term id: ${term.id}`);
    }
    ids.add(term.id);

    term.relatedTermIds.forEach((relatedId) => {
      if (relatedId === term.id) {
        errors.push(`Financial term ${term.id} references itself`);
      }

      if (!termIdSet.has(relatedId)) {
        errors.push(`Financial term ${term.id} has invalid related term ${relatedId}`);
      }
    });
  });

  financialTermIds.forEach((id) => {
    if (!ids.has(id)) {
      errors.push(`Missing financial term id: ${id}`);
    }
  });

  if (financialTerms.length !== 35) {
    errors.push(`Expected 35 financial terms, received ${financialTerms.length}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function compareFinancialTerms(first: FinancialTerm, second: FinancialTerm) {
  const categoryDiff = categoryOrder[first.category] - categoryOrder[second.category];

  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  return first.titleAr.localeCompare(second.titleAr, 'ar-SA');
}

const validation = validateFinancialTerms();

if (!validation.valid) {
  throw new Error(`Invalid financial terms data:\n${validation.errors.join('\n')}`);
}
