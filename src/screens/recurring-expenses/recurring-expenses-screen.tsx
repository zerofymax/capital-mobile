import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { clearRecurringExpenseNotice, useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { getCategoryById } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { recurringExpenseFilters } from './recurring-expenses-data';
import type { RecurringExpense, RecurringExpenseFilter } from './recurring-expenses-types';
import {
  calculateAnnualRecurringTotal,
  calculateDaysUntilDue,
  calculateMonthlyRecurringTotal,
  calculatePotentialMonthlySavings,
  calculateRecurringExpenseShareOfBurn,
  calculateUpcomingAmount,
  formatDisplayDate,
  formatDueDistance,
  formatFrequencyLabel,
  formatPaymentMethodLabel,
  formatRenewalModeLabel,
  formatSar,
} from './recurring-expenses-utils';

export function RecurringExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, notice } = useRecurringExpensesStore();
  const [filter, setFilter] = useState<RecurringExpenseFilter>('all');
  const [query, setQuery] = useState('');
  const activeExpenses = expenses.filter((expense) => expense.status === 'active');
  const monthlyTotal = calculateMonthlyRecurringTotal(activeExpenses);
  const annualTotal = calculateAnnualRecurringTotal(activeExpenses);
  const dueThisWeek = calculateUpcomingAmount(activeExpenses, 7);
  const dueThisMonth = calculateUpcomingAmount(activeExpenses, 30);
  const needsReview = expenses.filter((expense) => expense.needsReview);
  const potentialSavings = calculatePotentialMonthlySavings(expenses);
  const burnShare = calculateRecurringExpenseShareOfBurn(monthlyTotal);
  const bottomPadding = Math.max(insets.bottom + spacing.xxxl + spacing.xl, spacing.screenBottom);

  const visibleExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const normalizedQuery = query.trim().toLocaleLowerCase('ar-SA');
        const category = getCategoryById(expense.categoryId);
        const matchesQuery =
          !normalizedQuery ||
          [expense.name, expense.vendor, category?.name ?? '', expense.description ?? '']
            .join(' ')
            .toLocaleLowerCase('ar-SA')
            .includes(normalizedQuery);

        return matchesQuery && matchesFilter(expense, filter);
      }),
    [expenses, filter, query],
  );

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearRecurringExpenseNotice, 2600);

    return () => clearTimeout(timeout);
  }, [notice]);

  function openDetails(id: string) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.recurringExpenseDetails, params: { id } });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RecurringHeader subtitle="تابع اشتراكات الشركة والتزاماتها الدورية قبل موعد استحقاقها." title="المصروفات المتكررة" />

        {notice ? <NoticeBanner message={notice} /> : null}

        <SummaryCard
          activeCount={activeExpenses.length}
          annualTotal={annualTotal}
          dueThisMonth={dueThisMonth}
          dueThisWeek={dueThisWeek}
          monthlyTotal={monthlyTotal}
          needsReviewCount={needsReview.length}
        />

        <InsightCard
          burnShare={burnShare}
          potentialSavings={potentialSavings}
        />

        <View style={styles.searchBox}>
          <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="ابحث باسم المصروف أو المورد"
            placeholderTextColor={colors.text.tertiary}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {recurringExpenseFilters.map((item) => (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: item.id === filter }}
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={({ pressed }) => [styles.filterChip, item.id === filter && styles.filterChipActive, pressed && styles.pressed]}
            >
              <AppText align="center" style={item.id === filter && styles.filterTextActive} variant="caption">
                {item.label}
              </AppText>
            </Pressable>
          ))}
          <View style={styles.filterEndSpacer} />
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionTitleWrapper}>
            <AppText style={styles.sectionTitle} variant="sectionTitle">المصروفات</AppText>
          </View>
          {visibleExpenses.length > 0 ? (
            <View style={styles.list}>
              {visibleExpenses.map((expense) => (
                <RecurringExpenseCard expense={expense} key={expense.id} onPress={openDetails} />
              ))}
            </View>
          ) : (
            <SolidCard style={styles.emptyCard}>
              <Ionicons color={colors.text.tertiary} name="repeat-outline" size={30} />
              <AppText align="center" variant="cardTitle">
                {expenses.length === 0 ? 'لا توجد مصروفات متكررة' : 'لا توجد مصروفات مطابقة'}
              </AppText>
              <AppText align="center" tone="secondary" variant="supporting">
                {expenses.length === 0
                  ? 'أضف اشتراكات الشركة والتزاماتها لتعرف تكلفتها الشهرية ومواعيدها القادمة.'
                  : 'جرّب تغيير الفلتر أو أضف مصروفًا متكررًا جديدًا.'}
              </AppText>
            </SolidCard>
          )}
        </View>

        <AppButton iconName="add-outline" onPress={() => router.push(routes.addRecurringExpense)}>
          إضافة مصروف متكرر
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecurringHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="رجوع" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Ionicons
          color={colors.text.primary}
          name="chevron-back-outline"
          size={21}
        />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText style={styles.headerText} variant="screenTitle">
          {title}
        </AppText>
        <AppText style={styles.headerText} tone="secondary" variant="supporting">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

function SummaryCard({
  monthlyTotal,
  annualTotal,
  dueThisWeek,
  dueThisMonth,
  activeCount,
  needsReviewCount,
}: {
  monthlyTotal: number;
  annualTotal: number;
  dueThisWeek: number;
  dueThisMonth: number;
  activeCount: number;
  needsReviewCount: number;
}) {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIcon}>
          <Ionicons color={colors.brand.calmGreen} name="repeat-outline" size={19} />
        </View>
        <View style={styles.summaryTitle}>
          <AppText style={styles.summaryTitleText} variant="sectionTitle">ملخص الالتزامات</AppText>
          <AppText style={styles.summaryDescription} tone="secondary" variant="caption">
            تقديرات مبنية على بيانات محلية تجريبية.
          </AppText>
        </View>
      </View>
      <View style={styles.metricsGrid}>
        <Metric label="شهريًا" value={formatSar(monthlyTotal)} />
        <Metric label="سنويًا" value={formatSar(annualTotal)} />
        <Metric label="خلال 7 أيام" value={formatSar(dueThisWeek)} />
        <Metric label="خلال 30 يومًا" value={formatSar(dueThisMonth)} />
        <Metric label="نشطة" value={`${activeCount}`} />
        <Metric label="تحتاج مراجعة" tone="warning" value={`${needsReviewCount}`} />
      </View>
    </SolidCard>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <View style={styles.metric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.metricValue, tone === 'warning' && styles.warningText]} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function InsightCard({ burnShare, potentialSavings }: { burnShare: number | null; potentialSavings: number }) {
  return (
    <SolidCard style={styles.insightCard}>
      <View style={styles.insightIcon}>
        <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
      </View>
      <View style={styles.insightCopy}>
        <AppText style={styles.insightTitle} variant="cardTitle">
          توصية Capital
        </AppText>
        <AppText style={styles.insightText} variant="supporting">
          {burnShare === null
            ? 'تابع الالتزامات المتكررة حتى تظهر نسبتها من الحرق الشهري.'
            : `تمثل المصروفات المتكررة ${burnShare}% من الحرق الشهري الحالي.`}
        </AppText>
        {potentialSavings > 0 ? (
          <AppText style={styles.savingText} variant="caption">
            {directionSafeText(`فرصة توفير تقديرية: ${formatSar(potentialSavings)} شهريًا.`)}
          </AppText>
        ) : null}
      </View>
    </SolidCard>
  );
}

function RecurringExpenseCard({ expense, onPress }: { expense: RecurringExpense; onPress: (id: string) => void }) {
  const category = getCategoryById(expense.categoryId);
  const daysUntilDue = calculateDaysUntilDue(expense.nextDueDate);
  const isPaused = expense.status === 'paused';
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

  return (
    <Pressable
      accessibilityLabel={expense.name}
      accessibilityRole="button"
      onPress={() => onPress(expense.id)}
      style={({ pressed }) => [styles.expenseCard, expense.needsReview && styles.reviewCard, pressed && styles.pressed]}
    >
      <View style={styles.expenseTop}>
        <View style={[styles.expenseIcon, expense.needsReview && styles.reviewIcon]}>
          <Ionicons
            color={expense.needsReview ? colors.semantic.warning : colors.brand.calmGreen}
            name={category?.icon ?? 'repeat-outline'}
            size={19}
          />
        </View>
        <View style={styles.expenseCopy}>
          <View style={styles.titleRow}>
            <AppText style={styles.expenseTitle} variant="cardTitle">
              {expense.name}
            </AppText>
            <StatusBadge
              label={isPaused ? 'متوقف' : expense.needsReview ? 'يحتاج مراجعة' : isDueSoon ? 'قريب' : 'نشط'}
              tone={isPaused ? 'muted' : expense.needsReview ? 'warning' : isDueSoon ? 'warning' : 'green'}
            />
          </View>
          <AppText style={styles.expenseDescription} tone="secondary" variant="caption">
            {expense.vendor} · {category?.name ?? 'مصروفات'}
          </AppText>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View>
          <AppText tone="secondary" variant="caption">
            المبلغ
          </AppText>
          <AppText style={styles.amountText} variant="cardTitle">
            {directionSafeText(formatSar(expense.amount))}
          </AppText>
        </View>
        <View>
          <AppText align="left" tone="secondary" variant="caption">
            التكرار
          </AppText>
          <AppText align="left" variant="caption">
            {formatFrequencyLabel(expense.frequency, expense.customInterval)}
          </AppText>
        </View>
      </View>

      <View style={styles.dueRow}>
        <AppText tone="secondary" variant="caption">
          {isPaused ? 'لا يوجد موعد قادم' : formatDueDistance(expense.nextDueDate)}
        </AppText>
        <AppText align="left" tone="secondary" variant="caption">
          {expense.nextDueDate ? formatDisplayDate(expense.nextDueDate) : 'متوقف مؤقتًا'}
        </AppText>
      </View>
      <View style={styles.dueRow}>
        <AppText tone="secondary" variant="caption">
          {formatRenewalModeLabel(expense.renewalMode)}
        </AppText>
        <AppText align="left" tone="secondary" variant="caption">
          {formatPaymentMethodLabel(expense.paymentMethod)}
        </AppText>
      </View>
    </Pressable>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'green' | 'warning' | 'muted' }) {
  return (
    <View style={[styles.statusBadge, styles[`${tone}Badge`]]}>
      <AppText align="center" style={[styles.statusText, tone === 'warning' && styles.statusWarning]} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function NoticeBanner({ message }: { message: string }) {
  return (
    <View style={styles.notice}>
      <Ionicons color={colors.brand.calmGreen} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.noticeText} variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

function matchesFilter(expense: RecurringExpense, filter: RecurringExpenseFilter) {
  const category = getCategoryById(expense.categoryId);
  const daysUntilDue = calculateDaysUntilDue(expense.nextDueDate);

  if (filter === 'all') {
    return true;
  }

  if (filter === 'upcoming') {
    return expense.status === 'active' && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 30;
  }

  if (filter === 'subscriptions') {
    return expense.categoryId === 'expense-software';
  }

  if (filter === 'operational') {
    return category?.type === 'expense' && expense.categoryId !== 'expense-software' && expense.status === 'active';
  }

  if (filter === 'paused') {
    return expense.status === 'paused';
  }

  return expense.needsReview;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    minHeight: 64,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  headerText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.button,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  summaryTitle: {
    alignItems: 'flex-end',
    direction: 'rtl',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryTitleText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  metricsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 70,
    padding: spacing.sm,
    width: '31.5%',
  },
  metricValue: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  warningText: {
    color: colors.semantic.warning,
  },
  insightCard: {
    backgroundColor: '#071310',
    borderColor: 'rgba(167,200,161,0.18)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  insightIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.button,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  insightCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  insightTitle: {
    alignSelf: 'stretch',
    color: colors.brand.calmGreen,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  insightText: {
    alignSelf: 'stretch',
    lineHeight: 24,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  savingText: {
    alignSelf: 'stretch',
    color: colors.brand.calmGreen,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  filterScroll: {
    direction: 'rtl',
    marginHorizontal: -spacing.xl,
    overflow: 'visible',
  },
  filterContent: {
    direction: 'rtl',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  filterChip: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  filterEndSpacer: {
    flexShrink: 0,
    width: spacing.xl,
  },
  section: {
    alignItems: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  list: {
    gap: spacing.md,
  },
  expenseCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  reviewCard: {
    backgroundColor: '#151007',
    borderColor: 'rgba(232,163,61,0.28)',
  },
  expenseTop: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  expenseIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.button,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  reviewIcon: {
    backgroundColor: colors.semantic.warningTint,
  },
  expenseCopy: {
    alignItems: 'flex-end',
    direction: 'rtl',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    width: '100%',
  },
  expenseTitle: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  expenseDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  statusBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  greenBadge: {
    backgroundColor: colors.semantic.successTint,
  },
  warningBadge: {
    backgroundColor: colors.semantic.warningTint,
  },
  mutedBadge: {
    backgroundColor: colors.surface.muted,
  },
  statusText: {
    color: colors.brand.calmGreen,
  },
  statusWarning: {
    color: colors.semantic.warning,
  },
  cardDetails: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  amountText: {
    color: colors.text.primary,
    writingDirection: 'ltr',
  },
  dueRow: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    color: colors.brand.calmGreen,
    flex: 1,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
