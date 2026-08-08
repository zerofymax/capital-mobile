import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BusinessHealthCard,
  CapitalInsightCard,
  FinancialHeroCard,
  FinancialMetricCard,
  formatFinancialAmount,
  QuickAction,
  TransactionRow,
} from '@/components/financial';
import {
  getTabScreenContentBottomPadding,
  tabScreenContentInsetAdjustmentBehavior,
} from '@/components/navigation';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useBusinessInformation } from '@/screens/account/business-information-data';
import { useFinancialAccounts } from '@/screens/account/financial-accounts-data';
import { getGoalSummary } from '@/screens/goals/goal-utils';
import { useGoalsStore } from '@/screens/goals/goals-store';
import {
  formatInvoiceCollectionRate,
  getInvoiceCollectionSummary,
  type InvoiceCollectionSummary,
} from '@/screens/invoices/invoice-utils';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import {
  getCurrencySymbol,
  getDateOptionLabel,
  useTransactionsStore,
  type TransactionRecord,
  type TransactionSummary,
} from '@/screens/ledger/ledger-data';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import {
  calculateMonthlyEquivalent,
  formatDueDistance,
} from '@/screens/recurring-expenses/recurring-expenses-utils';
import { useUserProfile } from '@/screens/account/profile-data';
import { useCategoriesStore } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { homeQuickActions, type QuickActionItem, type TransactionItem } from './home-data';

const quickActionRtlOrder = ['accounts', 'invoices', 'expense', 'income', 'ask', 'goals', 'recurring', 'report'] as const;
const androidPhysicalRtlRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row-reverse' as const }
  : {};

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const profile = useUserProfile();
  const business = useBusinessInformation();
  const { accounts } = useFinancialAccounts();
  const { transactions } = useTransactionsStore();
  const { categories } = useCategoriesStore();
  const { invoices } = useInvoicesStore();
  const { expenses: recurringExpenses } = useRecurringExpensesStore();
  const { goals } = useGoalsStore();
  const quickActionNavigationLocked = useRef(false);
  const [valuesHidden, setValuesHidden] = useState(false);
  const currencySymbol = getCurrencySymbol();
  const currentMonthKey = useMemo(() => formatMonthKey(new Date()), []);
  const monthSummary = useMemo(
    () => calculateCurrentMonthSummary(transactions, currentMonthKey),
    [currentMonthKey, transactions],
  );
  const recentTransactions = useMemo(
    () => buildRecentTransactions(transactions, categories, currencySymbol),
    [categories, currencySymbol, transactions],
  );
  const hasHistoricalTransactions = useMemo(
    () => transactions.some((transaction) => transaction.transactionDate.slice(0, 7) < currentMonthKey),
    [currentMonthKey, transactions],
  );
  const accountsSummary = useMemo(() => summarizeAccounts(accounts), [accounts]);
  const invoiceSummary = useMemo(() => getInvoiceCollectionSummary(invoices), [invoices]);
  const recurringSummary = useMemo(() => summarizeRecurringExpenses(recurringExpenses), [recurringExpenses]);
  const activeGoal = useMemo(() => summarizeActiveGoal(goals), [goals]);
  const orderedQuickActions = quickActionRtlOrder.reduce<QuickActionItem[]>((actions, key) => {
    const action = homeQuickActions.find((item) => item.key === key);
    if (action) {
      actions.push(action);
    }
    return actions;
  }, []);
  const health = getHealthSummary(
    monthSummary,
    invoiceSummary.overdueCount,
    recurringSummary.activeCount,
    activeGoal?.progress ?? 0,
    hasHistoricalTransactions,
  );
  const insight = getInsightSummary(
    monthSummary,
    invoiceSummary.incompleteCount,
    invoiceSummary.overdueCount,
    recurringSummary.activeCount,
    hasHistoricalTransactions,
  );

  useFocusEffect(
    useCallback(() => {
      quickActionNavigationLocked.current = false;
    }, []),
  );

  function handleQuickAction(action: QuickActionItem) {
    if (quickActionNavigationLocked.current) {
      return;
    }

    quickActionNavigationLocked.current = true;

    if (action.key === 'ask') {
      router.navigate(routes.intelligence);
      return;
    }
    if (action.key === 'income') {
      router.push(routes.addIncome);
      return;
    }
    if (action.key === 'expense') {
      router.push(routes.addExpense);
      return;
    }
    if (action.key === 'invoices') {
      router.push(routes.invoices);
      return;
    }
    if (action.key === 'accounts') {
      router.push(routes.financialAccounts);
      return;
    }
    if (action.key === 'recurring') {
      router.push(routes.addRecurringExpense);
      return;
    }
    if (action.key === 'report') {
      router.push(routes.monthlyReport);
      return;
    }
    if (action.key === 'goals') {
      router.push(routes.goals);
      return;
    }

    quickActionNavigationLocked.current = false;
  }

  function openLedger() {
    Haptics.selectionAsync().catch(() => null);
    router.navigate(routes.ledger);
  }

  function openTransaction(transaction: TransactionItem) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.transactionDetail, params: { transactionId: transaction.id } });
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
              paddingBottom: getTabScreenContentBottomPadding(insets.bottom) + spacing.xxl,
            },
          ]}
          contentInsetAdjustmentBehavior={tabScreenContentInsetAdjustmentBehavior}
          showsVerticalScrollIndicator={false}
        >
        <HomeHeader
          avatarInitial={profile.avatarInitial || profile.displayName.trim().charAt(0) || 'م'}
          businessName={business.businessName}
          displayName={profile.displayName}
        />

        <FinancialHeroCard
          amount={monthSummary.net}
          ctaLabel="عرض جميع العمليات"
          currencySymbol={currencySymbol}
          label="ملخص هذا الشهر"
          metrics={[
            { key: 'income', label: 'إجمالي الدخل', value: monthSummary.totalIncome, tone: 'success' },
            { key: 'expenses', label: 'إجمالي المصروفات', value: monthSummary.totalExpenses, tone: 'danger' },
            { key: 'net', label: 'الصافي', value: monthSummary.net, tone: monthSummary.net >= 0 ? 'success' : 'danger', signed: true },
          ]}
          monthlyChange={`${monthSummary.count} عملية خلال ${formatMonthLabel(currentMonthKey)}`}
          onCtaPress={openLedger}
          onToggleVisibility={() => setValuesHidden((current) => !current)}
          valuesHidden={valuesHidden}
        />

        <BusinessHealthCard
          badgeLabel="تجريبي"
          description={health.description}
          label="نبض النشاط المحلي"
          maxScore={100}
          score={health.score}
          status={health.status}
        />

        <View style={styles.quickActions}>
          {orderedQuickActions.map((action) => (
            <QuickAction action={action} key={action.key} onPress={handleQuickAction} />
          ))}
        </View>

        <CapitalInsightCard
          ctaLabel="عرض التحليل المحلي"
          description={insight.description}
          eyebrow="Capital CFO · تجريبي"
          onPress={() => router.navigate(routes.intelligence)}
          title={insight.title}
        />

        <ScrollView
          contentContainerStyle={styles.metricsContent}
          decelerationRate="fast"
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={146}
          style={styles.metricsScroller}
        >
          <FinancialMetricCard
            change="محلي تجريبي"
            currencySymbol={currencySymbol}
            label="الأرصدة التجريبية"
            tone="primary"
            value={accountsSummary.availableBalance}
            valuesHidden={valuesHidden}
          />
          <FinancialMetricCard
            change={`${invoiceSummary.incompleteCount} غير مكتملة`}
            currencySymbol={currencySymbol}
            label="الفواتير المستحقة"
            tone={invoiceSummary.remainingAmount > 0 ? 'danger' : 'success'}
            value={invoiceSummary.remainingAmount}
            valuesHidden={valuesHidden}
          />
          <FinancialMetricCard
            change={`${recurringSummary.activeCount} نشطة`}
            currencySymbol={currencySymbol}
            label="التزامات شهرية"
            tone="primary"
            value={recurringSummary.monthlyEstimate}
            valuesHidden={valuesHidden}
          />
          <FinancialMetricCard
            change={activeGoal ? `${activeGoal.progress}%` : 'لا يوجد هدف'}
            currencySymbol={currencySymbol}
            label="تقدم الهدف"
            tone="success"
            value={activeGoal?.currentAmount ?? 0}
            valuesHidden={valuesHidden}
          />
        </ScrollView>

        <InfoNotice
          iconName="wallet-outline"
          onPress={() => router.push(routes.financialAccounts)}
          text="الأرصدة محلية وتجريبية ولا يتم احتسابها من العمليات."
          title={accountsSummary.defaultAccountName}
        />

        <RecentTransactionsSection
          currencySymbol={currencySymbol}
          onAdd={() => router.push(routes.addTransaction)}
          onOpenAll={openLedger}
          onTransactionPress={openTransaction}
          transactions={recentTransactions}
        />

        <InvoiceCollectionCard
          currencySymbol={currencySymbol}
          onPress={() => router.push(routes.invoices)}
          summary={invoiceSummary}
        />

        <HomeLinkCard
          iconName="repeat-outline"
          meta={recurringSummary.nearestDue ? `${recurringSummary.nearestName} · ${recurringSummary.nearestDue}` : 'لا توجد التزامات نشطة'}
          onPress={() => router.push(routes.recurringExpenses)}
          title="المصروفات المتكررة"
          value={`${recurringSummary.activeCount} نشطة · ${formatHomeMoney(recurringSummary.monthlyEstimate, currencySymbol)} تقديريًا`}
        />

        <HomeLinkCard
          iconName="flag-outline"
          meta={activeGoal ? `${formatHomeMoney(activeGoal.currentAmount, currencySymbol)} من ${formatHomeMoney(activeGoal.targetAmount, currencySymbol)} · ${activeGoal.expectedCompletion}` : 'أضف هدفًا لتتبعه هنا'}
          onPress={() => (activeGoal ? router.push({ pathname: routes.goalDetails, params: { id: activeGoal.id } }) : router.push(routes.goals))}
          title="الهدف النشط"
          value={activeGoal ? `${activeGoal.name} · ${activeGoal.progress}%` : 'لا يوجد هدف نشط'}
        />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HomeHeader({
  displayName,
  businessName,
  avatarInitial,
}: {
  displayName: string;
  businessName: string;
  avatarInitial: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <AppText align="center" style={styles.avatarText} variant="cardTitle">
            {avatarInitial}
          </AppText>
        </View>
        <View style={styles.headerCopy}>
          <AppText style={styles.headerCopyText} variant="sectionTitle">
            مرحبًا {displayName}
          </AppText>
          <AppText style={styles.headerCopyText} tone="secondary" variant="supporting">
            {businessName ? `${businessName} · إليك ملخص نشاطك اليوم` : 'إليك ملخص نشاطك اليوم'}
          </AppText>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="الإشعارات"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            Haptics.selectionAsync().catch(() => null);
            router.push(routes.notifications);
          }}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.muted} name="notifications-outline" size={17} />
        </Pressable>
        <Pressable
          accessibilityLabel="المساعد المالي"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            Haptics.selectionAsync().catch(() => null);
            router.push(routes.intelligence);
          }}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.muted} name="sparkles-outline" size={17} />
        </Pressable>
      </View>
    </View>
  );
}

function RecentTransactionsSection({
  transactions,
  currencySymbol,
  onOpenAll,
  onAdd,
  onTransactionPress,
}: {
  transactions: readonly TransactionItem[];
  currencySymbol: string;
  onOpenAll: () => void;
  onAdd: () => void;
  onTransactionPress: (transaction: TransactionItem) => void;
}) {
  return (
    <View style={styles.transactionsSection}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionHeaderTitle} variant="sectionTitle">
          أحدث العمليات
        </AppText>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onOpenAll} style={styles.linkButton}>
          <AppText align="left" style={styles.sectionHeaderAction} tone="link" variant="supporting">
            عرض الكل
          </AppText>
        </Pressable>
      </View>
      <View style={styles.transactionsCard}>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <TransactionRow
              currencySymbol={currencySymbol}
              isLast={index === transactions.length - 1}
              key={transaction.id}
              onPress={onTransactionPress}
              transaction={transaction}
            />
          ))
        ) : (
          <View style={styles.emptyTransactions}>
            <AppText align="center" variant="cardTitle">
              لا توجد عمليات بعد
            </AppText>
            <AppText align="center" tone="secondary" variant="supporting">
              ابدأ بتسجيل أول دخل أو مصروف.
            </AppText>
            <AppButton onPress={onAdd}>إضافة عملية</AppButton>
          </View>
        )}
      </View>
    </View>
  );
}

function InfoNotice({
  title,
  text,
  iconName,
  onPress,
}: {
  title: string;
  text: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.noticeCard, pressed && styles.pressed]}>
      <View style={styles.noticeCopy}>
        <AppText numberOfLines={1} style={styles.noticeCopyText} variant="cardTitle">
          {title}
        </AppText>
        <AppText style={styles.noticeCopyText} tone="secondary" variant="caption">
          {text}
        </AppText>
      </View>
      <View style={styles.noticeActions}>
        <View style={styles.noticeIcon}>
          <Ionicons color={colors.brand.calmGreen} name={iconName} size={18} />
        </View>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </View>
    </Pressable>
  );
}

function HomeLinkCard({
  title,
  value,
  meta,
  iconName,
  onPress,
}: {
  title: string;
  value: string;
  meta: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}>
      <View style={styles.linkCopy}>
        <AppText style={styles.linkCopyText} variant="cardTitle">
          {title}
        </AppText>
        <AppText style={styles.linkCopyText} variant="body">
          {directionSafeText(value)}
        </AppText>
        <AppText style={styles.linkCopyText} tone="secondary" variant="caption">
          {directionSafeText(meta)}
        </AppText>
      </View>
      <View style={styles.linkActions}>
        <View style={styles.linkIcon}>
          <Ionicons color={colors.brand.calmGreen} name={iconName} size={18} />
        </View>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </View>
    </Pressable>
  );
}

function InvoiceCollectionCard({
  summary,
  currencySymbol,
  onPress,
}: {
  summary: InvoiceCollectionSummary;
  currencySymbol: string;
  onPress: () => void;
}) {
  const hasInvoices = summary.totalCount > 0;
  const collectionRate =
    summary.collectionRate === null
      ? 'غير متاح'
      : directionSafeText(formatInvoiceCollectionRate(summary.collectionRate));

  return (
    <Pressable
      accessibilityLabel="عرض الفواتير والتحصيل"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.invoiceCollectionCard, pressed && styles.pressed]}
    >
      <View style={styles.invoiceCollectionHeader}>
        <View style={styles.invoiceCollectionTitle}>
          <AppText style={styles.invoiceCollectionTitleText} variant="cardTitle">
            الفواتير والتحصيل
          </AppText>
        </View>
        <View style={styles.invoiceCollectionActions}>
          <View style={styles.linkIcon}>
            <Ionicons color={colors.brand.calmGreen} name="receipt-outline" size={18} />
          </View>
          <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
        </View>
      </View>

      {hasInvoices ? (
        <>
          <View style={styles.invoiceCollectionMain}>
            <View style={styles.invoiceCollectionAmountRow}>
              <AppText style={styles.invoiceCollectionAmountLabel} tone="secondary" variant="caption">
                المتبقي للتحصيل
              </AppText>
              <AppText
                align="left"
                numberOfLines={1}
                style={styles.invoiceCollectionValue}
                variant="sectionTitle"
              >
                {directionSafeText(formatHomeMoney(summary.remainingAmount, currencySymbol))}
              </AppText>
            </View>
            <View style={styles.invoiceCollectionAmountRow}>
              <AppText style={styles.invoiceCollectionAmountLabel} tone="secondary" variant="caption">
                المحصّل
              </AppText>
              <AppText
                align="left"
                numberOfLines={1}
                style={styles.invoiceCollectionSecondaryValue}
                variant="body"
              >
                {directionSafeText(formatHomeMoney(summary.collectedAmount, currencySymbol))}
              </AppText>
            </View>
          </View>

          <View style={styles.invoiceCollectionStats}>
            <InvoiceCollectionStat label="نسبة التحصيل" value={collectionRate} />
            <InvoiceCollectionStat
              label="متأخرة"
              tone={summary.overdueCount > 0 ? 'danger' : undefined}
              value={summary.overdueCount.toLocaleString('en-US')}
            />
            <InvoiceCollectionStat
              label="مستحقة قريبًا"
              tone={summary.dueSoonCount > 0 ? 'warning' : undefined}
              value={summary.dueSoonCount.toLocaleString('en-US')}
            />
          </View>

          {summary.overdueCount > 0 ? (
            <View style={styles.invoiceOverdueAlert}>
              <View style={styles.invoiceOverdueCopy}>
                <AppText style={styles.invoiceOverdueText} variant="caption">
                  {formatHomeOverdueAlert(summary.overdueCount)}
                </AppText>
              </View>
              <Ionicons
                color={colors.semantic.danger}
                name="warning-outline"
                size={17}
                style={styles.invoiceOverdueIcon}
              />
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.invoiceEmpty}>
          <AppText variant="cardTitle">لا توجد فواتير مسجلة</AppText>
          <AppText tone="secondary" variant="caption">
            أضف فاتورة لتبدأ متابعة التحصيل ومواعيد الاستحقاق.
          </AppText>
          <AppText style={styles.invoiceEmptyAction} variant="caption">
            عرض الفواتير
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

function InvoiceCollectionStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'danger' | 'warning';
}) {
  return (
    <View style={styles.invoiceCollectionStat}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText
        align="center"
        style={[
          styles.invoiceCollectionStatValue,
          tone === 'danger' && styles.invoiceDangerText,
          tone === 'warning' && styles.invoiceWarningText,
        ]}
        variant="cardTitle"
      >
        {value}
      </AppText>
    </View>
  );
}

function calculateCurrentMonthSummary(transactions: readonly TransactionRecord[], monthKey: string): TransactionSummary {
  return transactions
    .filter((transaction) => transaction.transactionDate.startsWith(monthKey))
    .reduce<TransactionSummary>(
      (summary, transaction) => {
        const amount = Number.isFinite(transaction.amount) ? Math.max(transaction.amount, 0) : 0;

        if (transaction.type === 'income') {
          summary.totalIncome += amount;
        } else {
          summary.totalExpenses += amount;
        }

        summary.net = summary.totalIncome - summary.totalExpenses;
        summary.count += 1;
        return summary;
      },
      { totalIncome: 0, totalExpenses: 0, net: 0, count: 0 },
    );
}

function buildRecentTransactions(
  transactions: readonly TransactionRecord[],
  categories: ReturnType<typeof useCategoriesStore>['categories'],
  currencySymbol: string,
): TransactionItem[] {
  return [...transactions]
    .sort(compareRecentTransactions)
    .slice(0, 5)
    .map((transaction) => {
      const category = categories.find((item) => item.id === transaction.categoryId);

      return {
        id: transaction.id,
        title: transaction.description || 'عملية بدون وصف',
        category: category?.name ?? 'تصنيف غير متاح',
        date: getDateOptionLabel(transaction.transactionDate),
        amount: transaction.type === 'income' ? safePositive(transaction.amount) : -safePositive(transaction.amount),
        type: transaction.type,
      };
    });
}

function compareRecentTransactions(first: TransactionRecord, second: TransactionRecord) {
  const dateDiff = safeDateMs(second.transactionDate) - safeDateMs(first.transactionDate);

  if (dateDiff !== 0) {
    return dateDiff;
  }

  return safeDateMs(second.createdAt) - safeDateMs(first.createdAt);
}

function summarizeAccounts(accounts: ReturnType<typeof useFinancialAccounts>['accounts']) {
  const activeAccounts = accounts.filter((account) => account.status === 'active');
  const defaultAccount = activeAccounts.find((account) => account.isDefault) ?? activeAccounts[0];
  const availableBalance = activeAccounts
    .filter((account) => account.type !== 'credit-card')
    .reduce((sum, account) => sum + safeNumber(account.balance), 0);

  return {
    availableBalance,
    defaultAccountName: defaultAccount?.name ?? 'الأرصدة المحلية التجريبية',
  };
}

function summarizeRecurringExpenses(expenses: ReturnType<typeof useRecurringExpensesStore>['expenses']) {
  const activeExpenses = expenses.filter((expense) => expense.status === 'active');
  const monthlyEstimate = activeExpenses.reduce(
    (sum, expense) => sum + calculateMonthlyEquivalent(safePositive(expense.amount), expense.frequency, expense.customInterval),
    0,
  );
  const nearestExpense = [...activeExpenses]
    .filter((expense) => Boolean(expense.nextDueDate))
    .sort((first, second) => safeDateMs(first.nextDueDate) - safeDateMs(second.nextDueDate))[0];

  return {
    activeCount: activeExpenses.length,
    monthlyEstimate,
    nearestName: nearestExpense?.name,
    nearestDue: nearestExpense ? formatDueDistance(nearestExpense.nextDueDate) : undefined,
  };
}

function summarizeActiveGoal(goals: ReturnType<typeof useGoalsStore>['goals']) {
  const goal = goals.find((item) => item.status !== 'completed') ?? null;

  if (!goal) {
    return null;
  }

  const summary = getGoalSummary(goal);

  return {
    id: summary.id,
    name: summary.name,
    currentAmount: summary.currentAmount,
    targetAmount: summary.targetAmount,
    progress: summary.progress,
    expectedCompletion: summary.expectedCompletion.label,
  };
}

function getHealthSummary(
  summary: TransactionSummary,
  overdueInvoicesCount: number,
  activeRecurringCount: number,
  goalProgress: number,
  hasHistoricalTransactions: boolean,
) {
  const score = calculateLocalActivityScore(summary, overdueInvoicesCount, activeRecurringCount, goalProgress);
  const experimentalPrefix = 'تحليل محلي تجريبي مبني على البيانات المسجلة.';

  if (summary.count === 0) {
    return {
      score,
      status: hasHistoricalTransactions ? 'بانتظار أول عملية هذا الشهر' : 'بانتظار أول عملية',
      description: `${experimentalPrefix} سيظهر التقييم بعد تسجيل الدخل والمصروفات.`,
    };
  }

  if (summary.net >= 0 && summary.totalIncome > 0) {
    return {
      score,
      status: 'مستقر',
      description: `${experimentalPrefix} الدخل المسجل يغطي المصروفات في الشهر الحالي.`,
    };
  }

  return {
    score,
    status: 'يحتاج متابعة',
    description: `${experimentalPrefix} المصروفات المسجلة أعلى من الدخل خلال الشهر الحالي.`,
  };
}

function getInsightSummary(
  summary: TransactionSummary,
  openInvoicesCount: number,
  overdueInvoicesCount: number,
  activeRecurringCount: number,
  hasHistoricalTransactions: boolean,
) {
  const experimentalPrefix = 'تحليل محلي تجريبي مبني على البيانات المسجلة.';

  if (summary.count === 0) {
    return {
      title: hasHistoricalTransactions ? 'سجّل أول عملية لهذا الشهر' : 'ابدأ بتسجيل عملياتك',
      description: `${experimentalPrefix} كل عملية محلية تضيفها ستنعكس مباشرة على الملخص وأحدث العمليات.`,
    };
  }

  if (summary.net >= 0) {
    return {
      title: overdueInvoicesCount > 0 ? 'الوضع مستقر مع فواتير متأخرة' : 'الشهر الحالي في وضع إيجابي',
      description: `${experimentalPrefix} الصافي المحلي موجب، مع ${openInvoicesCount} فواتير مفتوحة و${activeRecurringCount} التزامات متكررة تحتاج متابعة منفصلة.`,
    };
  }

  return {
    title: 'راجع المصروفات المسجلة',
    description: `${experimentalPrefix} الصافي المحلي سالب هذا الشهر. الفواتير والالتزامات تظهر كتذكير ولا تُخصم تلقائيًا من العمليات.`,
  };
}

function safeNumber(value: number | undefined | null) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function safePositive(value: number | undefined | null) {
  return Math.max(safeNumber(value), 0);
}

function calculateLocalActivityScore(
  summary: TransactionSummary,
  overdueInvoicesCount: number,
  activeRecurringCount: number,
  goalProgress: number,
) {
  if (summary.count === 0) {
    return 50;
  }

  const income = safePositive(summary.totalIncome);
  const netMargin = income > 0 ? clamp(summary.net / income, -1, 1) : 0;
  const invoicePenalty = Math.min(overdueInvoicesCount * 6, 18);
  const recurringPenalty = Math.min(activeRecurringCount * 1.5, 8);
  const goalBonus = clamp(goalProgress / 100, 0, 1) * 6;
  const activityBonus = Math.min(summary.count, 5) * 1.4;
  const score = 58 + netMargin * 24 + activityBonus + goalBonus - invoicePenalty - recurringPenalty;

  return Math.round(clamp(score, 35, 88));
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function formatHomeMoney(value: number, currencySymbol: string, signed = false) {
  return formatFinancialAmount(Math.round(safeNumber(value)), signed, currencySymbol);
}

function formatHomeOverdueAlert(count: number) {
  if (count === 1) {
    return 'توجد فاتورة واحدة متأخرة تحتاج إلى المتابعة.';
  }

  if (count === 2) {
    return 'توجد فاتورتان متأخرتان تحتاجان إلى المتابعة.';
  }

  if (count >= 3 && count <= 10) {
    return `توجد ${count.toLocaleString('en-US')} فواتير متأخرة تحتاج إلى المتابعة.`;
  }

  return `توجد ${count.toLocaleString('en-US')} فاتورة متأخرة تحتاج إلى المتابعة.`;
}

function formatMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

function formatMonthLabel(monthKey: string) {
  const parts = monthKey.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return 'الشهر الحالي';
  }

  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function safeDateMs(value?: string) {
  if (!value) {
    return 0;
  }

  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const timestamp = new Date(isoDate).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
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
    gap: 14,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...androidPhysicalRtlRow,
  },
  identity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
    ...androidPhysicalRtlRow,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderColor: colors.surface.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: colors.brand.green,
  },
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  headerCopyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
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
  quickActions: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
    rowGap: 14,
    width: '100%',
  },
  metricsScroller: {
    marginHorizontal: -16,
  },
  metricsContent: {
    direction: 'rtl',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  transactionsSection: {
    gap: 11,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  sectionHeaderTitle: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionHeaderAction: {
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  linkButton: {
    justifyContent: 'center',
    minHeight: 44,
  },
  transactionsCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyTransactions: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    ...androidPhysicalRtlRow,
  },
  noticeIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  noticeCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minWidth: 0,
  },
  noticeCopyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  noticeActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm,
    ...androidPhysicalRtlRow,
  },
  linkCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    ...androidPhysicalRtlRow,
  },
  linkIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.15)',
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  linkCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 5,
    justifyContent: 'center',
    minWidth: 0,
  },
  linkCopyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  linkActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm,
    ...androidPhysicalRtlRow,
  },
  invoiceCollectionCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
  },
  invoiceCollectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  invoiceCollectionTitle: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  invoiceCollectionTitleText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  invoiceCollectionActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm,
    ...androidPhysicalRtlRow,
  },
  invoiceCollectionMain: {
    gap: spacing.sm,
    width: '100%',
  },
  invoiceCollectionAmountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  invoiceCollectionAmountLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  invoiceCollectionValue: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  invoiceCollectionSecondaryValue: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  invoiceCollectionStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  invoiceCollectionStat: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 68,
    minWidth: 0,
    padding: spacing.sm,
  },
  invoiceCollectionStatValue: {
    fontSize: 16,
    writingDirection: 'ltr',
  },
  invoiceDangerText: {
    color: colors.semantic.danger,
  },
  invoiceWarningText: {
    color: colors.semantic.warning,
  },
  invoiceOverdueAlert: {
    alignItems: 'center',
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    width: '100%',
  },
  invoiceOverdueIcon: {
    flexShrink: 0,
  },
  invoiceOverdueCopy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  invoiceOverdueText: {
    color: colors.semantic.danger,
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 21,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  invoiceEmpty: {
    gap: spacing.sm,
  },
  invoiceEmptyAction: {
    color: colors.brand.calmGreen,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
