import {
  defaultTransactionFilters,
  filterTransactions,
  getCurrencySymbol,
  type TransactionRecord,
} from '@/screens/ledger/ledger-data';
import {
  getInvoiceCollectionSummary,
  getInvoiceSummary,
} from '@/screens/invoices/invoice-utils';
import type { Invoice } from '@/screens/invoices/invoices-data';
import {
  calculatePotentialMonthlySavings,
  formatDisplayDate,
  parseIsoDate,
} from '@/screens/recurring-expenses/recurring-expenses-utils';
import type { RecurringExpense } from '@/screens/recurring-expenses/recurring-expenses-types';
import { getGoalSummary } from '@/screens/goals/goal-utils';
import type { FinancialGoal } from '@/screens/goals/goals-data';
import type { FinancialCategory } from '@/state/categories-state';
import { formatFinancialAmount } from '@/components/financial';

export type AskCapitalAnswer = {
  status: 'answered' | 'insufficient' | 'unsupported';
  title: string;
  value?: string;
  description: string;
  source?: string;
};

export type AskCapitalData = {
  transactions: readonly TransactionRecord[];
  categories: readonly FinancialCategory[];
  invoices: readonly Invoice[];
  recurringExpenses: readonly RecurringExpense[];
  goals: readonly FinancialGoal[];
  now?: Date;
};

export const askCapitalSuggestedQuestions = [
  'كم دخلي هذا الشهر؟',
  'كم مصروفاتي هذا الشهر؟',
  'ما صافي الفترة؟',
  'كم تبقى لي للتحصيل؟',
  'كم عدد الفواتير المتأخرة؟',
  'ما أكبر تصنيف مصروفات؟',
  'ما الالتزامات القادمة؟',
  'ما الهدف الأقرب للاكتمال؟',
] as const;

export function answerAskCapitalQuestion(question: string, data: AskCapitalData): AskCapitalAnswer {
  const normalizedQuestion = normalizeArabic(question);
  const now = isValidDate(data.now) ? data.now! : new Date();
  const currentMonthTransactions = filterTransactions(data.transactions, {
    ...defaultTransactionFilters,
    categoryIds: [],
    customRange: { ...defaultTransactionFilters.customRange },
    period: 'current-month',
    query: '',
    sortOrder: 'newest',
    type: 'all',
  });
  const incomeTransactions = currentMonthTransactions.filter((transaction) => transaction.type === 'income');
  const expenseTransactions = currentMonthTransactions.filter((transaction) => transaction.type === 'expense');

  if (includesAll(normalizedQuestion, ['اكبر', 'تصنيف']) && includesAny(normalizedQuestion, ['مصروف', 'انفاق'])) {
    if (!expenseTransactions.length) {
      return insufficientAnswer();
    }

    const totals = new Map<string, number>();
    expenseTransactions.forEach((transaction) => {
      totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + safeAmount(transaction.amount));
    });
    const largest = [...totals.entries()].sort((first, second) => second[1] - first[1])[0];

    if (!largest) {
      return insufficientAnswer();
    }

    const category = data.categories.find((item) => item.id === largest[0]);
    return {
      status: 'answered',
      title: 'أكبر تصنيف مصروفات',
      value: formatAnswerCurrency(largest[1]),
      description: `التصنيف الأعلى إنفاقًا هو ${category?.name ?? 'تصنيف غير متاح'}.`,
      source: 'استنادًا إلى مصروفات العمليات المسجلة هذا الشهر.',
    };
  }

  if (includesAll(normalizedQuestion, ['اكبر', 'مصروف'])) {
    const largestExpense = [...expenseTransactions].sort(
      (first, second) => safeAmount(second.amount) - safeAmount(first.amount),
    )[0];

    if (!largestExpense) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'أكبر مصروف',
      value: formatAnswerCurrency(safeAmount(largestExpense.amount)),
      description: largestExpense.description || 'عملية مصروف مسجلة دون وصف.',
      source: 'استنادًا إلى عمليات المصروف المسجلة هذا الشهر.',
    };
  }

  if (includesAll(normalizedQuestion, ['عدد', 'عملي'])) {
    if (!currentMonthTransactions.length) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'عدد العمليات',
      value: `${currentMonthTransactions.length}`,
      description: `سُجلت ${currentMonthTransactions.length} عمليات خلال هذا الشهر.`,
      source: 'استنادًا إلى Store العمليات.',
    };
  }

  if (includesAny(normalizedQuestion, ['صافي'])) {
    if (!currentMonthTransactions.length) {
      return insufficientAnswer();
    }

    const income = sumTransactions(incomeTransactions);
    const expenses = sumTransactions(expenseTransactions);
    return {
      status: 'answered',
      title: 'صافي الفترة',
      value: formatAnswerCurrency(income - expenses),
      description: 'يمثل الدخل المسجل ناقص المصروفات المسجلة خلال هذا الشهر.',
      source: 'استنادًا إلى العمليات فقط، دون إضافة تحصيل الفواتير أو أرصدة الحسابات.',
    };
  }

  if (includesAny(normalizedQuestion, ['دخل', 'ايراد'])) {
    if (!incomeTransactions.length) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'دخل هذا الشهر',
      value: formatAnswerCurrency(sumTransactions(incomeTransactions)),
      description: `بلغ الدخل المسجل خلال هذا الشهر بناءً على ${incomeTransactions.length} عمليات دخل.`,
      source: 'استنادًا إلى العمليات المسجلة هذا الشهر.',
    };
  }

  if (includesAny(normalizedQuestion, ['مصروف', 'انفاق'])) {
    if (!expenseTransactions.length) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'مصروفات هذا الشهر',
      value: formatAnswerCurrency(sumTransactions(expenseTransactions)),
      description: `بلغت المصروفات المسجلة خلال هذا الشهر بناءً على ${expenseTransactions.length} عمليات مصروف.`,
      source: 'استنادًا إلى العمليات المسجلة هذا الشهر.',
    };
  }

  if (includesAll(normalizedQuestion, ['نسب', 'تحصيل'])) {
    const summary = getInvoiceCollectionSummary(data.invoices, now);

    if (summary.collectionRate === null) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'نسبة التحصيل',
      value: `${Math.round(summary.collectionRate)}%`,
      description: 'النسبة المحصلة من إجمالي قيمة الفواتير الحالية.',
      source: 'استنادًا إلى Store الفواتير، بصورة مستقلة عن دخل العمليات.',
    };
  }

  if (includesAny(normalizedQuestion, ['متبقي للتحصيل', 'تبقي لي للتحصيل', 'متبقي لي للتحصيل'])) {
    const summary = getInvoiceCollectionSummary(data.invoices, now);

    if (!summary.totalCount || summary.totalAmount <= 0) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'المتبقي للتحصيل',
      value: formatAnswerCurrency(summary.remainingAmount),
      description: 'هذا هو المبلغ المتبقي عبر الفواتير الحالية.',
      source: 'استنادًا إلى Store الفواتير، دون إضافته إلى دخل العمليات.',
    };
  }

  if (includesAny(normalizedQuestion, ['المحصل', 'تم تحصيل'])) {
    const summary = getInvoiceCollectionSummary(data.invoices, now);

    if (!summary.totalCount || summary.totalAmount <= 0) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'المبلغ المحصل',
      value: formatAnswerCurrency(summary.collectedAmount),
      description: 'إجمالي الدفعات المسجلة على الفواتير الحالية.',
      source: 'استنادًا إلى Store الفواتير، بصورة مستقلة عن دخل العمليات.',
    };
  }

  if (includesAny(normalizedQuestion, ['متاخر'])) {
    if (!data.invoices.length) {
      return insufficientAnswer();
    }

    const overdue = data.invoices
      .map(getInvoiceSummary)
      .filter((invoice) => invoice.open && invoice.dueTiming.state === 'overdue');

    if (!overdue.length) {
      return {
        status: 'answered',
        title: 'الفواتير المتأخرة',
        description: 'لا توجد فواتير متأخرة حاليًا.',
        source: 'استنادًا إلى مواعيد استحقاق الفواتير الحالية.',
      };
    }

    return {
      status: 'answered',
      title: 'الفواتير المتأخرة',
      value: `${overdue.length}`,
      description: `القيمة المتبقية للفواتير المتأخرة هي ${formatAnswerCurrency(overdue.reduce((sum, invoice) => sum + invoice.remaining, 0))}.`,
      source: 'استنادًا إلى مواعيد الاستحقاق والمبالغ المتبقية في Store الفواتير.',
    };
  }

  if (includesAny(normalizedQuestion, ['مستحقه قريبا', 'قريبه الاستحقاق'])) {
    if (!data.invoices.length) {
      return insufficientAnswer();
    }

    const dueSoon = data.invoices
      .map(getInvoiceSummary)
      .filter(
        (invoice) =>
          invoice.open &&
          (invoice.dueTiming.state === 'today' ||
            (invoice.dueTiming.state === 'upcoming' &&
              invoice.dueTiming.days !== null &&
              invoice.dueTiming.days <= 7)),
      );

    return {
      status: 'answered',
      title: 'الفواتير المستحقة قريبًا',
      value: `${dueSoon.length}`,
      description: dueSoon.length
        ? `القيمة المتبقية لهذه الفواتير هي ${formatAnswerCurrency(dueSoon.reduce((sum, invoice) => sum + invoice.remaining, 0))}.`
        : 'لا توجد فواتير مستحقة خلال الأيام السبعة القادمة.',
      source: 'استنادًا إلى مواعيد استحقاق الفواتير الحالية.',
    };
  }

  if (includesAny(normalizedQuestion, ['توفير', 'وفر'])) {
    const reviewableExpenses = data.recurringExpenses.filter(
      (expense) =>
        expense.status === 'active' &&
        expense.needsReview &&
        safeAmount(expense.monthlySavingOpportunity) > 0,
    );

    if (!reviewableExpenses.length) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'فرص التوفير',
      value: formatAnswerCurrency(calculatePotentialMonthlySavings(reviewableExpenses)),
      description: `إجمالي فرص التوفير الشهرية المسجلة في ${reviewableExpenses.length} مصروفات تحتاج مراجعة.`,
      source: 'استنادًا إلى monthlySavingOpportunity المسجلة فعليًا.',
    };
  }

  if (includesAny(normalizedQuestion, ['التزام', 'متكرر', 'استحقاق قادم'])) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const upcoming = data.recurringExpenses
      .filter((expense) => expense.status === 'active')
      .map((expense) => ({ expense, date: parseIsoDate(expense.nextDueDate) }))
      .filter(
        (item): item is { expense: RecurringExpense; date: Date } =>
          Boolean(item.date && item.date.getTime() >= startOfToday),
      )
      .sort((first, second) => first.date.getTime() - second.date.getTime());
    const nearest = upcoming[0];

    if (!nearest) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'الالتزام القادم',
      value: formatAnswerCurrency(safeAmount(nearest.expense.amount)),
      description: `${nearest.expense.name}، وموعده ${formatDisplayDate(nearest.expense.nextDueDate)}.`,
      source: 'استنادًا إلى أقرب nextDueDate للمصروفات المتكررة النشطة.',
    };
  }

  if (includesAll(normalizedQuestion, ['هدف', 'اقرب'])) {
    const activeGoals = data.goals
      .map((goal) => getGoalSummary(goal, now))
      .filter((goal) => !goal.completed)
      .sort((first, second) => second.progress - first.progress);
    const closest = activeGoals[0];

    if (!closest) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'الهدف الأقرب للاكتمال',
      value: `${closest.progress}%`,
      description: `${closest.name}، والمتبقي له ${formatAnswerCurrency(closest.remaining)}.`,
      source: 'استنادًا إلى الأهداف والمساهمات المحققة حتى اليوم.',
    };
  }

  if (includesAll(normalizedQuestion, ['هدف', 'نشط'])) {
    const active = data.goals.map((goal) => getGoalSummary(goal, now)).find((goal) => !goal.completed);

    if (!active) {
      return insufficientAnswer();
    }

    return {
      status: 'answered',
      title: 'الهدف النشط',
      value: `${active.progress}%`,
      description: `${active.name}، والمحقق فيه ${formatAnswerCurrency(active.currentAmount)}.`,
      source: 'استنادًا إلى Store الأهداف.',
    };
  }

  return {
    status: 'unsupported',
    title: 'السؤال غير مدعوم حاليًا',
    description: 'يمكنك السؤال عن العمليات، الفواتير، التحصيل، المصروفات المتكررة، أو الأهداف.',
  };
}

function insufficientAnswer(): AskCapitalAnswer {
  return {
    status: 'insufficient',
    title: 'لا توجد بيانات كافية للإجابة حاليًا.',
    description: 'جرّب سؤالًا آخر من الأسئلة المقترحة بعد تسجيل البيانات المطلوبة.',
  };
}

function sumTransactions(transactions: readonly TransactionRecord[]) {
  return transactions.reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
}

function formatAnswerCurrency(value: number) {
  return formatFinancialAmount(value, value < 0, getCurrencySymbol());
}

function safeAmount(value: number | null | undefined) {
  return Number.isFinite(value) ? Math.max(Number(value), 0) : 0;
}

function isValidDate(value: Date | undefined): value is Date {
  return Boolean(value && Number.isFinite(value.getTime()));
}

function includesAny(value: string, tokens: readonly string[]) {
  return tokens.some((token) => value.includes(token));
}

function includesAll(value: string, tokens: readonly string[]) {
  return tokens.every((token) => value.includes(token));
}

function normalizeArabic(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
