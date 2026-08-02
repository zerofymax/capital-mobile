export type CompanyUpdateStatus = 'draft' | 'saved';

export type CompanyUpdateDisplayStatus = 'none' | 'draft' | 'saved' | 'dirty';

export type CompanyUpdateSectionKey = 'achievements' | 'challenges' | 'companyNeeds' | 'hiringUpdate' | 'nextSteps';

export type CompanyUpdatePeriod = {
  key: string;
  month: number;
  year: number;
  label: string;
};

export type CompanyUpdateFinancialSnapshot = {
  activeCustomers: number | null;
  cash: number | null;
  churnRate: number | null;
  employees: number | null;
  keyGoalLabel: string | null;
  keyGoalProgress: number | null;
  monthlyBurn: number | null;
  mrr: number | null;
  newCustomers: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  runwayMonths: number | null;
};

export type CompanyUpdateFormValues = {
  achievements: string;
  challenges: string;
  companyNeeds: string;
  hiringUpdate: string;
  nextSteps: string;
};

export type CompanyUpdate = CompanyUpdateFormValues & {
  createdAt: string;
  financialSnapshot: CompanyUpdateFinancialSnapshot | null;
  id: string;
  month: number;
  periodKey: string;
  status: CompanyUpdateStatus;
  updatedAt: string;
  year: number;
};

export type CompanyUpdatePreviewData = {
  executiveSummary: string;
  financialSnapshot: CompanyUpdateFinancialSnapshot | null;
  periodLabel: string;
  sections: readonly {
    key: CompanyUpdateSectionKey;
    title: string;
    items: readonly string[];
  }[];
  title: string;
};
