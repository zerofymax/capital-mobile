import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { getInvoiceSummary, type InvoiceSummary } from '@/screens/invoices/invoice-utils';
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
  type IntelligenceInsight,
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
  const currencySymbol = getCurrencySymbol();
  const overdueInvoice = useMemo(() => getPrimaryOverdueInvoice(invoices), [invoices]);
  const subscriptionReviewCount = useMemo(
    () =>
      recurringExpenses.filter(
        (expense) => expense.needsReview === true,
      ).length,
    [recurringExpenses],
  );
  const insights = useMemo(
    () =>
      buildLiveInsights({
        currencySymbol,
        overdueInvoice,
        subscriptionReviewCount,
      }),
    [currencySymbol, overdueInvoice, subscriptionReviewCount],
  );
  const actions = useMemo(
    () =>
      buildRecommendedActions({
        budgets,
        currencySymbol,
        goals,
        overdueInvoice,
        subscriptionReviewCount,
      }),
    [budgets, currencySymbol, goals, overdueInvoice, subscriptionReviewCount],
  );
  const contentBottomPadding =
    Platform.OS === 'android'
      ? Math.max(
          insets.bottom + spacing.xxxl + spacing.xl,
          spacing.screenBottom + spacing.xxxl,
        )
      : insets.bottom + spacing.xxl;

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
              paddingBottom: contentBottomPadding,
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
          {insights.map((insight) => (
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
          <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
            الإجراءات المقترحة
          </AppText>
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
  overdueInvoice,
  subscriptionReviewCount,
}: {
  budgets: ReturnType<typeof useBudgetsStore>['budgets'];
  currencySymbol: string;
  goals: ReturnType<typeof useGoalsStore>['goals'];
  overdueInvoice: InvoiceSummary | undefined;
  subscriptionReviewCount: number;
}) {
  const candidates: LiveRecommendedAction[] = [];

  if (overdueInvoice) {
    candidates.push({
      id: 'follow-overdue-client-invoice',
      priority: 0,
      urgency: 1,
      title: 'تابع فاتورة العميل المتأخرة',
      description: getOverdueInvoiceDescription(overdueInvoice, currencySymbol),
      status: 'pending',
      relatedInsightId: 'risk',
      destination: {
        pathname: routes.invoiceDetails,
        params: { id: overdueInvoice.id },
      },
    });
  }

  if (subscriptionReviewCount > 0) {
    candidates.push({
      id: 'review-subscriptions',
      priority: 0,
      urgency: 2,
      title: 'راجع اشتراكات البرامج',
      description: getSubscriptionReviewDescription(subscriptionReviewCount),
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

function getPrimaryOverdueInvoice(invoices: ReturnType<typeof useInvoicesStore>['invoices']) {
  return invoices
    .map(getInvoiceSummary)
    .filter((invoice) => invoice.open && invoice.dueTiming.state === 'overdue')
    .sort(
      (first, second) =>
        (second.dueTiming.days ?? 0) - (first.dueTiming.days ?? 0),
    )[0];
}

function buildLiveInsights({
  currencySymbol,
  overdueInvoice,
  subscriptionReviewCount,
}: {
  currencySymbol: string;
  overdueInvoice: InvoiceSummary | undefined;
  subscriptionReviewCount: number;
}): IntelligenceInsight[] {
  return intelligenceInsights.map((insight) => {
    if (insight.id === 'risk' && overdueInvoice) {
      const amount = formatFinancialAmount(overdueInvoice.remaining, false, currencySymbol);

      return {
        ...insight,
        summary: getOverdueInvoiceDescription(overdueInvoice, currencySymbol),
        explanation: `فاتورة ${overdueInvoice.clientName} ${overdueInvoice.dueText}، وكان موعد سدادها ${overdueInvoice.dueDate}. استمرار التأخير قد يؤثر على التدفق النقدي قصير المدى.`,
        estimatedImpact: amount,
        recommendedAction: `تابع الفاتورة ${overdueInvoice.invoiceNumber} أو أرسل تذكير دفع للعميل.`,
      };
    }

    if (insight.id === 'opportunity' && subscriptionReviewCount > 0) {
      return {
        ...insight,
        explanation: `${getSubscriptionReviewDescription(subscriptionReviewCount)} مراجعتها قد تخفف الضغط على المصروفات التشغيلية بدون التأثير على الإيرادات.`,
      };
    }

    return insight;
  });
}

function getOverdueInvoiceDescription(invoice: InvoiceSummary, currencySymbol: string) {
  const amount = formatFinancialAmount(invoice.remaining, false, currencySymbol);

  return `فاتورة ${invoice.clientName} بقيمة ${amount} ${invoice.dueText}، وكان موعد سدادها ${invoice.dueDate}.`;
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
      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="رجوع"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBackPress}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Feather color={colors.text.muted} name="chevron-left" size={18} />
        </Pressable>
        <Pressable
          accessibilityLabel="الإشعارات"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onActionPress}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.muted} name="notifications-outline" size={17} />
        </Pressable>
      </View>
      <View style={styles.headerCopy}>
        <AppText accessibilityRole="text" align="right" style={styles.headerText} variant="screenTitle">
          الذكاء المالي
        </AppText>
        <AppText align="right" style={styles.headerText} tone="secondary" variant="supporting">
          تحليل واضح لأرقام نشاطك وما يجب فعله بعد ذلك
        </AppText>
      </View>
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
    width: '100%',
  },
  headerActions: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
  sectionTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
