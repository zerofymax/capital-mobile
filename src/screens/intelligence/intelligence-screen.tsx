import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatFinancialAmount } from '@/components/financial';
import {
  AskCapitalButton,
  CapitalSummaryCard,
  InsightCard,
  MonthlyBriefCard,
  RecommendedActionRow,
} from '@/components/intelligence';
import { AppText } from '@/components/ui/app-text';
import { routes } from '@/constants/routes';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { getBudgetSummary } from '@/screens/budgets/budget-utils';
import { useBudgetsStore } from '@/screens/budgets/budgets-store';
import { getGoalSummary } from '@/screens/goals/goal-utils';
import { useGoalsStore } from '@/screens/goals/goals-store';
import { getInvoiceSummary } from '@/screens/invoices/invoice-utils';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import { getCurrencySymbol } from '@/screens/ledger/ledger-data';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  capitalSummary,
  intelligenceInsights,
  monthlyBrief,
  type RecommendedAction,
} from './intelligence-data';

type LiveRecommendedAction = RecommendedAction & {
  destination: Href;
  urgency: number;
};

export function IntelligenceScreen() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const askCapitalNavigationLocked = useRef(false);
  const actionNavigationLocked = useRef(false);
  const defaultExpandedInsight = intelligenceInsights.find((insight) => insight.defaultExpanded)?.id ?? null;
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(defaultExpandedInsight);
  const { expenses: recurringExpenses } = useRecurringExpensesStore();
  const { invoices } = useInvoicesStore();
  const { budgets } = useBudgetsStore();
  const { goals } = useGoalsStore();
  const actions = useMemo(
    () =>
      buildRecommendedActions({
        budgets,
        currencySymbol: getCurrencySymbol(),
        goals,
        invoices,
        recurringExpenses,
      }),
    [budgets, goals, invoices, recurringExpenses],
  );

  useFocusEffect(
    useCallback(() => {
      askCapitalNavigationLocked.current = false;
      actionNavigationLocked.current = false;
    }, []),
  );

  function openAskCapital() {
    if (askCapitalNavigationLocked.current) {
      return;
    }

    askCapitalNavigationLocked.current = true;
    Haptics.selectionAsync().catch(() => null);
    router.push(routes.askCapital);
  }

  function handleInsightPress(insightId: string) {
    Haptics.selectionAsync().catch(() => null);
    setExpandedInsightId((current) => (current === insightId ? null : insightId));
  }

  function handleActionPress(action: LiveRecommendedAction) {
    if (actionNavigationLocked.current) {
      return;
    }

    actionNavigationLocked.current = true;
    Haptics.selectionAsync().catch(() => null);
    router.push(action.destination);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.7, y: 1 }}
        locations={[0, 0.55, 1]}
        start={{ x: 0.3, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(spacing.safeTop - insets.top, 0),
              paddingBottom: insets.bottom + spacing.xxl,
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
        <IntelligenceHeader
          onActionPress={() => router.push(routes.notifications)}
          onBackPress={() => router.back()}
        />
        <MonthlyBriefCard items={monthlyBrief.items} label={monthlyBrief.label} statusLabel={monthlyBrief.statusLabel} />
        <CapitalSummaryCard label={capitalSummary.label} text={capitalSummary.text} />

        <View style={styles.insights}>
          {intelligenceInsights.map((insight) => (
            <InsightCard
              expanded={expandedInsightId === insight.id}
              insight={insight}
              key={insight.id}
              onCtaPress={openAskCapital}
              onPress={() => handleInsightPress(insight.id)}
              reducedMotion={reducedMotion}
            />
          ))}
        </View>

        <View style={styles.actionsSection}>
          <AppText variant="sectionTitle">الإجراءات المقترحة</AppText>
          <View style={styles.actionsCard}>
            {actions.length ? (
              actions.map((action, index) => (
                <RecommendedActionRow
                  action={action}
                  completed={false}
                  isLast={index === actions.length - 1}
                  key={action.id}
                  onPress={() => handleActionPress(action)}
                />
              ))
            ) : (
              <View style={styles.emptyActions}>
                <AppText variant="body">لا توجد إجراءات عاجلة</AppText>
                <AppText tone="secondary" variant="caption">
                  بياناتك الحالية لا تتطلب متابعة فورية.
                </AppText>
              </View>
            )}
          </View>
        </View>

        <AskCapitalButton onPress={openAskCapital} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function buildRecommendedActions({
  budgets,
  currencySymbol,
  goals,
  invoices,
  recurringExpenses,
}: {
  budgets: ReturnType<typeof useBudgetsStore>['budgets'];
  currencySymbol: string;
  goals: ReturnType<typeof useGoalsStore>['goals'];
  invoices: ReturnType<typeof useInvoicesStore>['invoices'];
  recurringExpenses: ReturnType<typeof useRecurringExpensesStore>['expenses'];
}) {
  const candidates: LiveRecommendedAction[] = [];
  const overdueInvoice = invoices
    .map(getInvoiceSummary)
    .filter((invoice) => invoice.open && invoice.dueTiming.state === 'overdue')
    .sort(
      (first, second) =>
        (second.dueTiming.days ?? 0) - (first.dueTiming.days ?? 0),
    )[0];

  if (overdueInvoice) {
    candidates.push({
      id: 'follow-overdue-client-invoice',
      priority: 0,
      urgency: 1,
      title: 'تابع فاتورة العميل المتأخرة',
      description: `فاتورة بقيمة ${formatFinancialAmount(overdueInvoice.remaining, false, currencySymbol)} تجاوزت موعد السداد.`,
      status: 'pending',
      relatedInsightId: 'risk',
      destination: {
        pathname: routes.invoiceDetails,
        params: { id: overdueInvoice.id },
      },
    });
  }

  const reviewCount = recurringExpenses.filter(
    (expense) => expense.needsReview === true,
  ).length;

  if (reviewCount > 0) {
    candidates.push({
      id: 'review-subscriptions',
      priority: 0,
      urgency: 2,
      title: 'راجع اشتراكات البرامج',
      description: getSubscriptionReviewDescription(reviewCount),
      status: 'pending',
      relatedInsightId: 'opportunity',
      destination: routes.recurringExpenses,
    });
  }

  const marketingBudget = budgets.find((budget) => budget.categoryId === 'marketing');

  if (marketingBudget) {
    const summary = getBudgetSummary(marketingBudget);

    candidates.push({
      id: 'keep-marketing-budget',
      priority: 0,
      urgency: 3,
      title: 'حافظ على ميزانية التسويق',
      description: getMarketingBudgetDescription(summary.spent, summary.alertAmount, summary.budget),
      status: 'pending',
      relatedInsightId: 'forecast',
      destination: {
        pathname: routes.budgetDetails,
        params: { id: summary.id },
      },
    });
  }

  const goalSummaries = goals.map((goal) => getGoalSummary(goal));
  const emergencyGoal =
    goalSummaries.find(
      (goal) => !goal.completed && goal.name.includes('صندوق الطوارئ'),
    ) ??
    goalSummaries.find(
      (goal) => !goal.completed && goal.typeId === 'saving',
    );

  if (emergencyGoal) {
    candidates.push({
      id: 'build-cash-buffer',
      priority: 0,
      urgency: 4,
      title: 'تابع بناء الاحتياطي النقدي',
      description: `اكتمل ${emergencyGoal.progress.toLocaleString('en-US')}% من هدف ${emergencyGoal.name}.`,
      status: 'pending',
      relatedInsightId: 'warning',
      destination: {
        pathname: routes.goalDetails,
        params: { id: emergencyGoal.id },
      },
    });
  } else {
    candidates.push({
      id: 'create-cash-buffer',
      priority: 0,
      urgency: 5,
      title: 'أنشئ احتياطيًا نقديًا',
      description: 'أنشئ هدفًا ادخاريًا لمتابعة احتياطي نشاطك.',
      status: 'pending',
      relatedInsightId: 'warning',
      destination: routes.addGoal,
    });
  }

  return candidates
    .sort((first, second) => first.urgency - second.urgency)
    .slice(0, 4)
    .map((action, index) => ({
      ...action,
      priority: index + 1,
    }));
}

function getSubscriptionReviewDescription(count: number) {
  if (count === 1) {
    return 'يوجد اشتراك واحد يحتاج إلى المراجعة.';
  }

  if (count === 2) {
    return 'يوجد اشتراكان يحتاجان إلى المراجعة.';
  }

  if (count >= 3 && count <= 10) {
    return `توجد ${count.toLocaleString('en-US')} اشتراكات تحتاج إلى المراجعة.`;
  }

  return `يوجد ${count.toLocaleString('en-US')} اشتراكًا يحتاج إلى المراجعة.`;
}

function getMarketingBudgetDescription(spent: number, alertAmount: number, budget: number) {
  if (spent > budget) {
    return 'تجاوز الإنفاق الميزانية المحددة.';
  }

  if (spent >= alertAmount) {
    return 'اقترب الإنفاق من حد التنبيه المحدد.';
  }

  return 'الإنفاق الحالي ضمن الخطة المحددة.';
}

function IntelligenceHeader({
  onActionPress,
  onBackPress,
}: {
  onActionPress: () => void;
  onBackPress: () => void;
}) {
  return (
    <View accessibilityRole="header" style={styles.header}>
      <Pressable
        accessibilityLabel="الإشعارات"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onActionPress}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="notifications-outline" size={17} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText accessibilityRole="text" variant="screenTitle">
          الذكاء المالي
        </AppText>
        <AppText tone="secondary" variant="supporting">
          تحليل واضح لأرقام نشاطك وما يجب فعله بعد ذلك
        </AppText>
      </View>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  insights: {
    gap: spacing.md,
  },
  actionsSection: {
    gap: 11,
  },
  actionsCard: {
    backgroundColor: colors.surface.card,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyActions: {
    gap: spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
