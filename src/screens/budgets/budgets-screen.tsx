import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { BudgetCategoryCard, BudgetHeader, BudgetProgressBar, BudgetStatusBadge, NoticeBanner } from './components';
import { clearBudgetNotice, useBudgetsStore } from './budgets-store';
import { getBudgetSummary, type BudgetTone } from './budget-utils';
import type { Budget } from './budgets-data';

type BudgetFilter = 'all' | 'within' | 'near' | 'over';

const filters: { id: BudgetFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'within', label: 'ضمن الميزانية' },
  { id: 'near', label: 'قريب من الحد' },
  { id: 'over', label: 'متجاوزة' },
];

export function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const { budgets, notice } = useBudgetsStore();
  const [filter, setFilter] = useState<BudgetFilter>('all');
  const julyBudgets = budgets.filter((budget) => budget.month === 'يوليو 2026');
  const totalBudget = julyBudgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = julyBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const usage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalSpent;
  const visibleBudgets = useMemo(() => julyBudgets.filter((budget) => matchesFilter(budget, filter)), [filter, julyBudgets]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearBudgetNotice, 2600);

    return () => clearTimeout(timeout);
  }, [notice]);

  function openDetails(id: string) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.budgetDetails, params: { id } });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <BudgetHeader onBack={() => router.back()} subtitle="راقب حدود الإنفاق حسب الفئة" title="الميزانيات" />
        <MonthSelector />

        {notice ? <NoticeBanner androidRtlLayout message={notice} /> : null}

        <MonthlySummaryCard remaining={remaining} spent={totalSpent} total={totalBudget} usage={usage} />
        <BudgetAlertCard />

        <View style={[styles.filterRow, Platform.OS !== 'web' && styles.filterRowAndroid]}>
          {filters.map((item) => (
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
        </View>

        <View style={styles.section}>
          {Platform.OS !== 'web' ? (
            <View style={styles.sectionTitleWrapperAndroid}>
              <AppText style={styles.sectionTitle} variant="sectionTitle">
                ميزانيات الفئات
              </AppText>
            </View>
          ) : (
            <AppText style={styles.sectionTitle} variant="sectionTitle">
              ميزانيات الفئات
            </AppText>
          )}
          <View style={styles.budgetList}>
            {visibleBudgets.map((budget) => (
              <BudgetCategoryCard budget={budget} key={budget.id} onPress={openDetails} />
            ))}
          </View>
        </View>

        <AppButton iconName="add-outline" onPress={() => router.push(routes.addBudget)}>
          إضافة ميزانية
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function MonthSelector() {
  return (
    <View accessibilityLabel="الشهر يوليو 2026" style={styles.monthSelector}>
      <Pressable accessibilityLabel="الشهر السابق" accessibilityRole="button" style={styles.monthButton}>
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={19} />
      </Pressable>
      <AppText align="center" style={styles.monthText} variant="cardTitle">
        يوليو 2026
      </AppText>
      <Pressable accessibilityLabel="الشهر التالي" accessibilityRole="button" style={styles.monthButton}>
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={19} />
      </Pressable>
    </View>
  );
}

function MonthlySummaryCard({ total, spent, remaining, usage }: { total: number; spent: number; remaining: number; usage: number }) {
  const summaryTitle = (
    <AppText style={Platform.OS !== 'web' ? styles.summaryTitleAndroid : undefined} variant="sectionTitle">
      ميزانية يوليو
    </AppText>
  );
  const summaryBadge = <BudgetStatusBadge label="ضمن الميزانية" tone="green" />;
  const totalMetric = <Metric label="إجمالي الميزانية" value={total} />;
  const spentMetric = <Metric label="المصروف" value={spent} />;
  const remainingMetric = <Metric label="المتبقي" tone="green" value={remaining} />;
  const usageLabel = (
    <AppText style={Platform.OS !== 'web' ? styles.usageLabelAndroid : undefined} tone="secondary" variant="caption">
      نسبة الاستخدام
    </AppText>
  );
  const usageValue = (
    <AppText style={[styles.usageText, Platform.OS !== 'web' && styles.usageTextAndroid]} variant="caption">
      {usage}%
    </AppText>
  );

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={[styles.summaryHeader, Platform.OS !== 'web' && styles.summaryHeaderAndroid]}>
        {Platform.OS !== 'web' ? (
          <>
            {summaryBadge}
            {summaryTitle}
          </>
        ) : (
          <>
            {summaryTitle}
            {summaryBadge}
          </>
        )}
      </View>
      <View style={[styles.summaryMetrics, Platform.OS !== 'web' && styles.summaryMetricsAndroid]}>
        {Platform.OS !== 'web' ? (
          <>
            {remainingMetric}
            {spentMetric}
            {totalMetric}
          </>
        ) : (
          <>
            {totalMetric}
            {spentMetric}
            {remainingMetric}
          </>
        )}
      </View>
      <View style={[styles.usageRow, Platform.OS !== 'web' && styles.usageRowAndroid]}>
        {Platform.OS !== 'web' ? (
          <>
            {usageValue}
            {usageLabel}
          </>
        ) : (
          <>
            {usageLabel}
            {usageValue}
          </>
        )}
      </View>
      <BudgetProgressBar androidPhysicalLeft tone="green" usage={usage} />
    </SolidCard>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: BudgetTone }) {
  return (
    <View style={styles.metric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.metricValue, tone === 'green' && styles.greenText]} variant="caption">
        {directionSafeText(`${value.toLocaleString('en-US')} ر.س`)}
      </AppText>
    </View>
  );
}

function BudgetAlertCard() {
  return (
    <SolidCard style={[styles.alertCard, Platform.OS !== 'web' && styles.alertCardAndroid]}>
      <View style={styles.alertIcon}>
        <Ionicons color={colors.semantic.warning} name="warning-outline" size={19} />
      </View>
      <View style={[styles.alertCopy, Platform.OS !== 'web' && styles.alertCopyAndroid]}>
        <AppText style={styles.alertTitle} variant="cardTitle">
          تنبيهات الميزانية
        </AppText>
        <AppText style={styles.alertText} variant="supporting">
          اقتربت ميزانيتا التشغيل والرواتب من الحد، وتم تجاوز ميزانية الاشتراكات.
        </AppText>
        <AppText style={styles.alertLink} variant="caption">
          مراجعة الفئات
        </AppText>
      </View>
    </SolidCard>
  );
}

function matchesFilter(budget: Budget, filter: BudgetFilter) {
  const summary = getBudgetSummary(budget);

  if (filter === 'all') {
    return true;
  }

  if (filter === 'within') {
    return summary.status.tone === 'green';
  }

  if (filter === 'near') {
    return summary.status.tone === 'amber' || summary.status.tone === 'orange';
  }

  return summary.status.tone === 'danger';
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  monthSelector: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'center',
    minHeight: 44,
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  monthText: {
    minWidth: 112,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  summaryTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryMetrics: {
    flexDirection: 'row-reverse',
  },
  summaryMetricsAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  metric: {
    alignItems: 'center',
    borderLeftColor: colors.surface.separator,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
  },
  metricValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    writingDirection: 'ltr',
  },
  greenText: {
    color: '#35D39A',
  },
  usageRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  usageRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  usageLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  usageText: {
    color: '#35D39A',
    fontWeight: '700',
  },
  usageTextAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  alertCard: {
    backgroundColor: 'rgba(34,24,8,0.78)',
    borderColor: 'rgba(243,183,68,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  alertCardAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  alertIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(243,183,68,0.15)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  alertCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  alertCopyAndroid: {
    alignItems: 'flex-end',
    minWidth: 0,
  },
  alertTitle: {
    color: colors.semantic.warning,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  alertText: {
    color: colors.text.primary,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  alertLink: {
    color: colors.semantic.warning,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  filterRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  filterRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    width: '100%',
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  filterTextActive: {
    color: colors.brand.lightNeutral,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  budgetList: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
