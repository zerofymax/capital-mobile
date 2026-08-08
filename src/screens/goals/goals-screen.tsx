import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { GoalCard, GoalHeader, GoalProgressBar, NoticeBanner } from './components';
import { getGoalSummary } from './goal-utils';
import { clearGoalsNotice, useGoalsStore } from './goals-store';

type GoalFilter = 'all' | 'active' | 'near' | 'completed';

const filters: { id: GoalFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'نشطة' },
  { id: 'near', label: 'قريبة من الإنجاز' },
  { id: 'completed', label: 'مكتملة' },
];

export function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { goals, notice } = useGoalsStore();
  const [filter, setFilter] = useState<GoalFilter>('all');
  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const completedGoals = goals.filter((goal) => goal.status === 'completed');
  const activeGoalSummaries = activeGoals.map((goal) => getGoalSummary(goal));
  const totalTarget = activeGoalSummaries.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalAchieved = activeGoalSummaries.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  const visibleActiveGoals = activeGoals.filter((goal) => matchesFilter(goal.status, filter));
  const visibleCompletedGoals = filter === 'all' || filter === 'completed' ? completedGoals : [];

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearGoalsNotice, 2600);

    return () => clearTimeout(timeout);
  }, [notice]);

  function openDetails(id: string) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.goalDetails, params: { id } });
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top + spacing.sm, 48),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <GoalHeader onBack={() => router.back()} subtitle="تابع تقدمك نحو أهداف نشاطك" title="الأهداف المالية" />

        {notice ? <NoticeBanner message={notice} /> : null}

        <SummaryCard activeCount={activeGoals.length} completedCount={completedGoals.length} progress={progress} totalAchieved={totalAchieved} totalTarget={totalTarget} />

        <View style={[styles.filterRow, Platform.OS === 'android' && styles.filterRowAndroid]}>
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

        {visibleActiveGoals.length ? (
          <View style={styles.section}>
            <SectionTitle>الأهداف النشطة</SectionTitle>
            <View style={styles.goalList}>
              {visibleActiveGoals.map((goal) => (
                <GoalCard goal={goal} key={goal.id} onPress={openDetails} />
              ))}
            </View>
          </View>
        ) : null}

        {visibleCompletedGoals.length ? (
          <View style={styles.section}>
            <SectionTitle>الأهداف المكتملة</SectionTitle>
            <View style={styles.goalList}>
              {visibleCompletedGoals.map((goal) => (
                <GoalCard goal={goal} key={goal.id} onPress={openDetails} />
              ))}
            </View>
          </View>
        ) : null}

        <InsightCard />

        <AppButton iconName="add-outline" onPress={() => router.push(routes.addGoal)}>
          إضافة هدف
        </AppButton>
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  activeCount,
  completedCount,
  progress,
  totalAchieved,
  totalTarget,
}: {
  activeCount: number;
  completedCount: number;
  progress: number;
  totalAchieved: number;
  totalTarget: number;
}) {
  const summaryTitle = (
    <AppText style={Platform.OS === 'android' ? styles.summaryTitleAndroid : undefined} variant="sectionTitle">
      ملخص الأهداف
    </AppText>
  );
  const activeBadge = (
    <View style={styles.activeBadge}>
      <AppText align="center" style={styles.activeBadgeText} variant="caption">
        {activeCount} نشطة
      </AppText>
    </View>
  );
  const progressLabel = (
    <AppText style={Platform.OS === 'android' ? styles.progressLabelAndroid : undefined} tone="secondary" variant="caption">
      نسبة الإنجاز
    </AppText>
  );
  const progressValue = (
    <AppText style={[styles.progressValue, Platform.OS === 'android' && styles.progressValueAndroid]} variant="caption">
      {progress}%
    </AppText>
  );

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={[styles.summaryHeader, Platform.OS === 'android' && styles.summaryHeaderAndroid]}>
        {Platform.OS === 'android' ? (
          <>
            {activeBadge}
            {summaryTitle}
          </>
        ) : (
          <>
            {summaryTitle}
            {activeBadge}
          </>
        )}
      </View>
      <View style={[styles.summaryMetrics, Platform.OS === 'android' && styles.summaryMetricsAndroid]}>
        <Metric label="إجمالي المستهدف" value={totalTarget} />
        <Metric label="المبلغ المحقق" tone="green" value={totalAchieved} />
        <Metric label="مكتملة" value={completedCount} />
      </View>
      <View style={[styles.progressRow, Platform.OS === 'android' && styles.progressRowAndroid]}>
        {Platform.OS === 'android' ? (
          <>
            {progressValue}
            {progressLabel}
          </>
        ) : (
          <>
            {progressLabel}
            {progressValue}
          </>
        )}
      </View>
      <GoalProgressBar androidPhysicalLeft progress={progress} tone="blue" />
      <AppText align="center" variant="supporting">
        أنت قريب من تحقيق نصف أهدافك المالية
      </AppText>
    </SolidCard>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: 'green' }) {
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

function InsightCard() {
  const insightIcon = <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={17} />;
  const insightTitle = (
    <AppText style={[styles.insightTitle, Platform.OS === 'android' && styles.insightTitleAndroid]} variant="cardTitle">
      نصيحة من Capital
    </AppText>
  );
  const prototypeText = (
    <AppText style={Platform.OS === 'android' ? styles.prototypeTextAndroid : undefined} tone="secondary" variant="caption">
      تقدير تجريبي
    </AppText>
  );

  return (
    <SolidCard style={styles.insightCard}>
      <View style={[styles.insightHeader, Platform.OS === 'android' && styles.insightHeaderAndroid]}>
        {insightIcon}
        {insightTitle}
      </View>
      <AppText style={Platform.OS === 'android' ? styles.insightTextAndroid : undefined} variant="body">
        زيادة المساهمة الشهرية في هدف تجهيز الفرع بمقدار 1,500 ر.س قد تساعدك على الوصول في الموعد المحدد.
      </AppText>
      {Platform.OS === 'android' ? <View style={styles.prototypeTextWrapperAndroid}>{prototypeText}</View> : prototypeText}
    </SolidCard>
  );
}

function SectionTitle({ children }: { children: string }) {
  const title = (
    <AppText style={Platform.OS === 'android' ? styles.sectionTitleAndroid : undefined} variant="sectionTitle">
      {children}
    </AppText>
  );

  return Platform.OS === 'android' ? <View style={styles.sectionTitleWrapperAndroid}>{title}</View> : title;
}

function matchesFilter(status: string, filter: GoalFilter) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'active') {
    return status !== 'completed';
  }

  if (filter === 'near') {
    return status === 'near-completion';
  }

  return status === 'completed';
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
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
  activeBadge: {
    backgroundColor: 'rgba(46,168,255,0.12)',
    borderColor: 'rgba(46,168,255,0.26)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: '#2EA8FF',
    fontSize: 11,
    lineHeight: 16,
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
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    writingDirection: 'ltr',
  },
  greenText: {
    color: '#35D39A',
  },
  progressRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  progressRowAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  progressLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  progressValue: {
    color: '#2EA8FF',
  },
  progressValueAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
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
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  filterTextActive: {
    color: colors.text.primary,
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
  sectionTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  goalList: {
    gap: spacing.md,
  },
  insightCard: {
    backgroundColor: 'rgba(2,25,42,0.92)',
    borderColor: 'rgba(46,168,255,0.22)',
    gap: spacing.sm,
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  insightHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  insightTitle: {
    color: '#9DD5FF',
  },
  insightTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  insightTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  prototypeTextWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  prototypeTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
