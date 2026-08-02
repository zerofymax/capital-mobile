import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { NoticeBanner, ProgressBar, ReportModalHeader, StartupGoalCard } from './startup-report-components';
import { clearStartupReportsNotice, useStartupReportsStore } from './startup-report-store';
import type { StartupGoal, StartupGoalStatus } from './startup-goals-types';
import { calculateDisplayProgress, formatSar, resolveGoalStatus } from './startup-goals-utils';

type GoalFilter = 'all' | 'active' | 'completed' | 'delayed' | 'not-started';

const filters: readonly { id: GoalFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'جارية' },
  { id: 'completed', label: 'مكتملة' },
  { id: 'delayed', label: 'متأخرة' },
  { id: 'not-started', label: 'لم تبدأ' },
];

export function StartupGoalsScreen() {
  const insets = useSafeAreaInsets();
  const { goals, notice } = useStartupReportsStore();
  const [filter, setFilter] = useState<GoalFilter>('all');
  const visibleGoals = useMemo(
    () => goals.filter((goal) => filter === 'all' || resolveGoalStatus(goal) === filter),
    [filter, goals],
  );
  const bottomPadding = Math.max(insets.bottom, spacing.sm) + spacing.xxxl;

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearStartupReportsNotice, 2600);

    return () => clearTimeout(timeout);
  }, [notice]);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <ReportModalHeader
          onBack={() => router.back()}
          subtitle="اربط ميزانيتك بأهم النتائج التي تريد شركتك تحقيقها."
          title="الأهداف والمراحل"
        />

        {notice ? <NoticeBanner message={notice} /> : null}

        <GoalsSummary goals={goals} />

        <View style={styles.filterRow}>
          {filters.map((item) => (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === item.id }}
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={({ pressed }) => [styles.filterChip, filter === item.id && styles.filterChipActive, pressed && styles.pressed]}
            >
              <AppText align="center" style={filter === item.id && styles.filterTextActive} variant="caption">
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {visibleGoals.length > 0 ? (
          <View style={styles.goalList}>
            {visibleGoals.map((goal) => (
              <StartupGoalCard key={goal.id} goal={goal} onPress={(id) => router.push({ pathname: routes.startupGoalDetails, params: { id } })} />
            ))}
          </View>
        ) : (
          <EmptyGoalsState />
        )}

        <AppButton iconName="add-outline" onPress={() => router.push(routes.addStartupGoal)}>
          {goals.length > 0 ? 'إضافة هدف' : 'إضافة أول هدف'}
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalsSummary({ goals }: { goals: readonly StartupGoal[] }) {
  const statusCounts = goals.reduce<Record<StartupGoalStatus, number>>(
    (acc, goal) => {
      acc[resolveGoalStatus(goal)] += 1;
      return acc;
    },
    { active: 0, completed: 0, delayed: 0, 'not-started': 0, paused: 0 },
  );
  const allocatedBudget = goals.reduce((sum, goal) => sum + goal.allocatedBudget, 0);
  const spentBudget = goals.reduce((sum, goal) => sum + goal.spentBudget, 0);
  const averageProgress =
    goals.length === 0 ? 0 : Math.round(goals.reduce((sum, goal) => sum + calculateDisplayProgress(goal), 0) / goals.length);

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <AppText variant="sectionTitle">ملخص الأهداف</AppText>
        <View style={styles.summaryBadge}>
          <AppText align="center" style={styles.summaryBadgeText} variant="caption">
            {goals.length} أهداف
          </AppText>
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryItem label="الإجمالي" value={String(goals.length)} />
        <SummaryItem label="الجارية" value={String(statusCounts.active)} />
        <SummaryItem label="المكتملة" value={String(statusCounts.completed)} />
      </View>
      <View style={styles.summaryGrid}>
        <SummaryItem label="المتأخرة" tone="danger" value={String(statusCounts.delayed)} />
        <SummaryItem label="الميزانيات" value={formatSar(allocatedBudget)} />
        <SummaryItem label="المصروف" tone="success" value={formatSar(spentBudget)} />
      </View>
      <View style={styles.progressHeader}>
        <AppText tone="secondary" variant="caption">
          متوسط التقدم
        </AppText>
        <AppText style={styles.successText} variant="caption">
          {directionSafeText(`${averageProgress}%`)}
        </AppText>
      </View>
      <ProgressBar progress={averageProgress} />
    </SolidCard>
  );
}

function SummaryItem({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'danger' }) {
  return (
    <View style={styles.summaryItem}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.summaryValue, tone === 'success' && styles.successText, tone === 'danger' && styles.dangerText]} variant="cardTitle">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function EmptyGoalsState() {
  return (
    <SolidCard style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.brand.calmGreen} name="flag-outline" size={22} />
      </View>
      <AppText align="center" variant="sectionTitle">
        لا توجد أهداف بعد
      </AppText>
      <AppText align="center" tone="secondary" variant="body">
        ابدأ بإضافة أول هدف واربطه بميزانية وموعد واضح.
      </AppText>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  summaryBadge: {
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  summaryBadgeText: {
    color: colors.brand.calmGreen,
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  summaryItem: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 70,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  summaryValue: {
    fontSize: 15,
  },
  successText: {
    color: colors.semantic.success,
  },
  dangerText: {
    color: colors.semantic.danger,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  filterRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  goalList: {
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
