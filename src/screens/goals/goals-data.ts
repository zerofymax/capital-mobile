import type { Ionicons } from '@expo/vector-icons';

export type GoalTypeId = 'saving' | 'expansion' | 'equipment' | 'obligations' | 'revenue' | 'other';
export type GoalStatusId = 'started' | 'on-track' | 'needs-attention' | 'near-completion' | 'delayed' | 'completed';

export type GoalType = {
  id: GoalTypeId;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type GoalContribution = {
  id: string;
  title: string;
  date: string;
  amount: number;
  source: string;
  note?: string;
};

export type FinancialGoal = {
  id: string;
  name: string;
  typeId: GoalTypeId;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  startDate: string;
  status: GoalStatusId;
  reminderEnabled: boolean;
  reminderDay: string;
  completionDate?: string;
  contributions: GoalContribution[];
};

export const goalTypes: GoalType[] = [
  { id: 'saving', name: 'ادخار', icon: 'shield-checkmark-outline' },
  { id: 'expansion', name: 'توسع', icon: 'home-outline' },
  { id: 'equipment', name: 'معدات', icon: 'desktop-outline' },
  { id: 'obligations', name: 'التزامات', icon: 'checkmark-circle-outline' },
  { id: 'revenue', name: 'زيادة الإيرادات', icon: 'trending-up-outline' },
  { id: 'other', name: 'أخرى', icon: 'flag-outline' },
];

export const goalDateOptions = ['سبتمبر 2026', 'ديسمبر 2026', 'مارس 2027', 'يونيو 2027'] as const;
export const contributionSourceOptions = ['من الإيرادات', 'من المدخرات', 'إضافة يدوية', 'أخرى'] as const;
export const contributionDateOptions = ['1 أغسطس 2026', '20 أغسطس 2026', '1 سبتمبر 2026'] as const;
export const reminderDayOptions = ['اليوم الأول من كل شهر', 'اليوم الخامس من كل شهر', 'منتصف كل شهر'] as const;

export const initialGoals: FinancialGoal[] = [
  {
    id: 'goal-emergency-fund',
    name: 'صندوق الطوارئ',
    typeId: 'saving',
    targetAmount: 30000,
    currentAmount: 18000,
    monthlyContribution: 4200,
    targetDate: 'ديسمبر 2026',
    startDate: '1 يوليو 2026',
    status: 'on-track',
    reminderEnabled: true,
    reminderDay: 'اليوم الأول من كل شهر',
    contributions: [
      { id: 'contribution-july', title: 'مساهمة شهر يوليو', date: '1 يوليو 2026', amount: 5000, source: 'من الإيرادات' },
      { id: 'contribution-revenue', title: 'إضافة من الإيرادات', date: '15 يوليو 2026', amount: 4500, source: 'من الإيرادات' },
      { id: 'contribution-august', title: 'مساهمة شهر أغسطس', date: '1 أغسطس 2026', amount: 4200, source: 'من المدخرات' },
      { id: 'contribution-extra', title: 'إضافة إضافية', date: '20 أغسطس 2026', amount: 4300, source: 'إضافة يدوية' },
    ],
  },
  {
    id: 'goal-new-branch',
    name: 'تجهيز فرع جديد',
    typeId: 'expansion',
    targetAmount: 75000,
    currentAmount: 30000,
    monthlyContribution: 5000,
    targetDate: 'مارس 2027',
    startDate: '1 يوليو 2026',
    status: 'needs-attention',
    reminderEnabled: true,
    reminderDay: 'اليوم الأول من كل شهر',
    contributions: [],
  },
  {
    id: 'goal-new-equipment',
    name: 'شراء أجهزة جديدة',
    typeId: 'equipment',
    targetAmount: 15000,
    currentAmount: 9500,
    monthlyContribution: 3000,
    targetDate: 'سبتمبر 2026',
    startDate: '1 يوليو 2026',
    status: 'near-completion',
    reminderEnabled: false,
    reminderDay: 'اليوم الأول من كل شهر',
    contributions: [],
  },
  {
    id: 'goal-equipment-loan',
    name: 'سداد قرض المعدات',
    typeId: 'obligations',
    targetAmount: 20000,
    currentAmount: 20000,
    monthlyContribution: 0,
    targetDate: 'يونيو 2026',
    startDate: '1 يوليو 2026',
    status: 'completed',
    reminderEnabled: false,
    reminderDay: 'اليوم الأول من كل شهر',
    completionDate: 'يونيو 2026',
    contributions: [],
  },
];
