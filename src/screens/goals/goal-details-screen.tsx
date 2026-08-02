import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { BottomConfirmSheet, GoalHeader, GoalProgressBar, GoalStatusBadge, NoticeBanner } from './components';
import { deleteGoal, useGoalsStore } from './goals-store';
import { getGoalSummary, goalToneColors } from './goal-utils';
import { initialGoals } from './goals-data';

export function GoalDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { goals, notice } = useGoalsStore();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const goal = goals.find((item) => item.id === params.id) ?? goals[0] ?? initialGoals[0]!;
  const summary = useMemo(() => getGoalSummary(goal), [goal]);
  const tone = goalToneColors[summary.displayStatus.tone];

  function handleDelete() {
    deleteGoal(summary.id);
    setDeleteVisible(false);
    router.replace(routes.goals);
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
        <GoalHeader onBack={() => router.back()} title="تفاصيل الهدف" />

        {notice ? <NoticeBanner message={notice} /> : null}

        <SolidCard style={styles.identityCard}>
          <View style={[styles.goalIcon, { backgroundColor: tone.tint }]}>
            <Ionicons color={tone.accent} name={summary.type.icon} size={22} />
          </View>
          <View style={styles.identityCopy}>
            <AppText variant="sectionTitle">{summary.name}</AppText>
            <AppText tone="secondary" variant="caption">
              {summary.type.name} · الموعد {summary.targetDate}
            </AppText>
          </View>
          <GoalStatusBadge status={summary.displayStatus} />
        </SolidCard>

        <SolidCard style={styles.summaryCard}>
          <View style={styles.summaryMetrics}>
            <Metric label="المستهدف" value={summary.targetAmount} />
            <Metric label="المحقق" tone={summary.displayStatus.tone} value={summary.currentAmount} />
            <Metric label="المتبقي" tone={summary.displayStatus.tone} value={summary.remaining} />
          </View>
          <View style={styles.progressRow}>
            <AppText tone="secondary" variant="caption">
              نسبة الإنجاز
            </AppText>
            <AppText style={{ color: tone.text }} variant="caption">
              {summary.progress}%
            </AppText>
          </View>
          <GoalProgressBar progress={summary.progress} tone={summary.displayStatus.tone} />
          <AppText align="center" variant="supporting">
            {summary.completed ? 'تم تحقيق الهدف بالكامل' : 'حققت أكثر من نصف هدفك المالي'}
          </AppText>
        </SolidCard>

        <TimelineCard summary={summary} />
        <InfoCard summary={summary} />
        <ContributionHistory goal={summary} />
        <InsightCard summary={summary} />

        {!summary.completed ? (
          <AppButton iconName="add-outline" onPress={() => router.push({ pathname: routes.addContribution, params: { id: summary.id } })}>
            إضافة مساهمة
          </AppButton>
        ) : null}
        <AppButton iconName="create-outline" onPress={() => router.push({ pathname: routes.editGoal, params: { id: summary.id } })} variant="secondary">
          تعديل الهدف
        </AppButton>
        <AppButton iconName="trash-outline" onPress={() => setDeleteVisible(true)} variant="danger">
          حذف الهدف
        </AppButton>
      </ScrollView>

      <BottomConfirmSheet
        danger
        description={`سيتم حذف هدف ${summary.name} وسجل متابعته، ولن يتم حذف أي معاملات مالية مسجلة.`}
        onPrimaryPress={handleDelete}
        onSecondaryPress={() => setDeleteVisible(false)}
        primaryLabel="حذف الهدف"
        secondaryLabel="إلغاء"
        title="حذف الهدف؟"
        visible={deleteVisible}
      />
    </View>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: keyof typeof goalToneColors }) {
  return (
    <View style={styles.metric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.metricValue, tone && { color: goalToneColors[tone].text }]} variant="caption">
        {directionSafeText(`${value.toLocaleString('en-US')} ر.س`)}
      </AppText>
    </View>
  );
}

function TimelineCard({ summary }: { summary: ReturnType<typeof getGoalSummary> }) {
  const rows: [string, string][] = [
    ['تاريخ البدء', summary.startDate],
    ['الموعد المستهدف', summary.targetDate],
    ['الوقت المتبقي', summary.expectedCompletion.label],
    ['المساهمة الشهرية', `${summary.monthlyContribution.toLocaleString('en-US')} ر.س`],
  ];

  return (
    <View style={styles.section}>
      <AppText variant="cardTitle">الجدول الزمني</AppText>
      <SolidCard style={styles.infoCard}>
        {rows.map(([label, value], index) => (
          <View key={label}>
            <InfoRow label={label} value={value} />
            {index < 3 ? <Divider /> : null}
          </View>
        ))}
        {!summary.completed ? (
          <View style={styles.noteBox}>
            <AppText style={styles.linkText} variant="caption">
              {`التاريخ المتوقع للإنجاز: ${summary.expectedCompletion.label}`}
            </AppText>
            <AppText tone="secondary" variant="caption">
              {summary.expectedCompletion.warning ?? 'محسوب من المبلغ المتبقي والمساهمة الشهرية.'}
            </AppText>
          </View>
        ) : null}
      </SolidCard>
    </View>
  );
}

function InfoCard({ summary }: { summary: ReturnType<typeof getGoalSummary> }) {
  const rows: [string, string][] = [
    ['اسم الهدف', summary.name],
    ['نوع الهدف', summary.type.name],
    ['المبلغ المستهدف', `${summary.targetAmount.toLocaleString('en-US')} ر.س`],
    ['المبلغ المحقق', `${summary.currentAmount.toLocaleString('en-US')} ر.س`],
    ['المساهمة الشهرية', `${summary.monthlyContribution.toLocaleString('en-US')} ر.س`],
    ['الموعد المستهدف', summary.targetDate],
    ['التذكير', summary.reminderEnabled ? 'مفعل' : 'غير مفعل'],
    ['يوم التذكير', summary.reminderDay],
    ['تاريخ الإنشاء', summary.startDate],
  ];

  return (
    <View style={styles.section}>
      <AppText variant="cardTitle">معلومات الهدف</AppText>
      <SolidCard style={styles.infoCard}>
        {rows.map(([label, value], index) => (
          <View key={label}>
            <InfoRow label={label} value={value} />
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ContributionHistory({ goal }: { goal: ReturnType<typeof getGoalSummary> }) {
  if (!goal.realizedContributions.length && !goal.plannedContributions.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      {goal.realizedContributions.length ? (
        <>
          <View style={styles.sectionHeader}>
            <AppText variant="cardTitle">سجل المساهمات</AppText>
            <AppText style={styles.linkText} variant="caption">
              عرض كل المساهمات
            </AppText>
          </View>
          <ContributionList contributions={goal.realizedContributions} />
        </>
      ) : null}

      {goal.plannedContributions.length ? (
        <>
          <AppText variant="cardTitle">مساهمات مخططة</AppText>
          <ContributionList contributions={goal.plannedContributions} planned />
        </>
      ) : null}
    </View>
  );
}

function ContributionList({
  contributions,
  planned,
}: {
  contributions: ReturnType<typeof getGoalSummary>['contributions'];
  planned?: boolean;
}) {
  return (
    <SolidCard style={styles.infoCard}>
      {contributions.map((contribution, index) => (
        <View key={contribution.id}>
          <View style={styles.contributionRow}>
            <View style={[styles.contributionIcon, planned && styles.plannedContributionIcon]}>
              <Ionicons color={planned ? colors.semantic.warning : '#35D39A'} name={planned ? 'calendar-outline' : 'arrow-up-outline'} size={15} />
            </View>
            <View style={styles.contributionCopy}>
              <AppText variant="cardTitle">{contribution.title}</AppText>
              <AppText tone="secondary" variant="caption">
                {contribution.date}
              </AppText>
            </View>
            <AppText align="left" style={[styles.contributionAmount, planned && styles.plannedContributionAmount]} variant="caption">
              {directionSafeText(`+${contribution.amount.toLocaleString('en-US')} ر.س`)}
            </AppText>
          </View>
          {index < contributions.length - 1 ? <Divider /> : null}
        </View>
      ))}
    </SolidCard>
  );
}

function InsightCard({ summary }: { summary: ReturnType<typeof getGoalSummary> }) {
  return (
    <SolidCard style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons color="#9DD5FF" name="sparkles-outline" size={17} />
        <AppText style={styles.linkText} variant="cardTitle">
          {summary.completed ? 'تقدم ممتاز' : 'تقدم جيد'}
        </AppText>
      </View>
      <AppText variant="body">
        {summary.completed
          ? 'تم تحقيق الهدف بالكامل. يمكنك الآن متابعة أهداف مالية جديدة لنشاطك.'
          : `حققت ${summary.progress}% من هدف ${summary.name} ويتبقى ${summary.remaining.toLocaleString('en-US')} ر.س للوصول إلى المبلغ المستهدف.`}
      </AppText>
    </SolidCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.infoValue} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
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
  identityCard: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  goalIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryMetrics: {
    flexDirection: 'row-reverse',
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
  progressRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  infoCard: {
    gap: spacing.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  noteBox: {
    backgroundColor: 'rgba(46,168,255,0.10)',
    borderColor: 'rgba(46,168,255,0.20)',
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  linkText: {
    color: '#9DD5FF',
  },
  contributionRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 52,
  },
  contributionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(53,211,154,0.12)',
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  plannedContributionIcon: {
    backgroundColor: colors.semantic.warningTint,
  },
  contributionCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  contributionAmount: {
    color: '#35D39A',
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  plannedContributionAmount: {
    color: colors.semantic.warning,
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
});
