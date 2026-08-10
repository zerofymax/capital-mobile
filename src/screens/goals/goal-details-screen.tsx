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
import { directionSafeText, formatCurrency } from '@/utils/rtl';
import { BottomConfirmSheet, getGoalScreenTopPadding, GoalHeader, GoalProgressBar, GoalStatusBadge, NoticeBanner } from './components';
import { deleteGoal, useGoalsStore } from './goals-store';
import { getGoalSummary, goalToneColors } from './goal-utils';
import { initialGoals } from './goals-data';

const useAndroidRtlLayout = true;

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
            paddingTop: getGoalScreenTopPadding(insets.top),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <GoalHeader onBack={() => router.back()} title="تفاصيل الهدف" />

        {notice ? <NoticeBanner androidRtlLayout message={notice} /> : null}

        <SolidCard style={[styles.identityCard, useAndroidRtlLayout && styles.identityCardAndroid]}>
          {useAndroidRtlLayout ? (
            <>
              <View style={[styles.goalIcon, { backgroundColor: tone.tint }]}>
                <Ionicons color={tone.accent} name={summary.type.icon} size={22} />
              </View>
              <View style={styles.identityBodyAndroid}>
                <View style={styles.identityDetailsAndroid}>
                  <GoalStatusBadge status={summary.displayStatus} />
                  <View style={styles.identityCopyAndroid}>
                    <AppText style={styles.identityTitleAndroid} variant="sectionTitle">
                      {summary.name}
                    </AppText>
                    <AppText style={styles.identityDescriptionAndroid} tone="secondary" variant="caption">
                      {summary.type.name} · الموعد {summary.targetDate}
                    </AppText>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
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
            </>
          )}
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
            {directionSafeText(getProgressMessage(summary.progress, summary.completed))}
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
        androidRtlLayout
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
        {directionSafeText(formatCurrency(value))}
      </AppText>
    </View>
  );
}

function TimelineCard({ summary }: { summary: ReturnType<typeof getGoalSummary> }) {
  const rows: { label: string; value: string; valueDirection?: 'ltr' | 'rtl' }[] = [
    { label: 'تاريخ البدء', value: summary.startDate },
    { label: 'الموعد المستهدف', value: summary.targetDate },
    { label: 'الوقت المتبقي', value: getRemainingTimeLabel(summary.targetDate, summary.completed), valueDirection: 'rtl' },
    { label: 'المساهمة الشهرية', value: formatCurrency(summary.monthlyContribution) },
  ];

  return (
    <View style={styles.section}>
      <SectionTitle>الجدول الزمني</SectionTitle>
      <SolidCard style={styles.infoCard}>
        {rows.map((row, index) => (
          <View key={row.label}>
            <InfoRow label={row.label} value={row.value} valueDirection={row.valueDirection} />
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
    ['المبلغ المستهدف', formatCurrency(summary.targetAmount)],
    ['المبلغ المحقق', formatCurrency(summary.currentAmount)],
    ['المساهمة الشهرية', formatCurrency(summary.monthlyContribution)],
    ['الموعد المستهدف', summary.targetDate],
    ['التذكير', summary.reminderEnabled ? 'مفعل' : 'غير مفعل'],
    ['يوم التذكير', summary.reminderDay],
    ['تاريخ الإنشاء', summary.startDate],
  ];

  return (
    <View style={styles.section}>
      <SectionTitle>معلومات الهدف</SectionTitle>
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
            <AppText style={styles.sectionHeaderTitle} variant="cardTitle">
              سجل المساهمات
            </AppText>
            <AppText style={styles.linkText} variant="caption">
              عرض كل المساهمات
            </AppText>
          </View>
          <ContributionList contributions={goal.realizedContributions} />
        </>
      ) : null}

      {goal.plannedContributions.length ? (
        <>
          <SectionTitle>مساهمات مخططة</SectionTitle>
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
      {contributions.map((contribution, index) => {
        const contributionIcon = (
          <View style={[styles.contributionIcon, planned && styles.plannedContributionIcon]}>
            <Ionicons color={planned ? colors.semantic.warning : '#35D39A'} name={planned ? 'calendar-outline' : 'arrow-up-outline'} size={15} />
          </View>
        );
        const contributionCopy = (
          <View style={useAndroidRtlLayout ? styles.contributionCopyAndroid : styles.contributionCopy}>
            <AppText style={useAndroidRtlLayout ? styles.contributionTitleAndroid : undefined} variant="cardTitle">
              {contribution.title}
            </AppText>
            <AppText style={useAndroidRtlLayout ? styles.contributionDateAndroid : undefined} tone="secondary" variant="caption">
              {contribution.date}
            </AppText>
          </View>
        );
        const contributionAmount = (
          <AppText
            align="left"
            numberOfLines={1}
            style={[styles.contributionAmount, planned && styles.plannedContributionAmount]}
            variant="caption"
          >
            {directionSafeText(`+${formatCurrency(contribution.amount)}`)}
          </AppText>
        );

        return (
          <View key={contribution.id}>
            <View style={[styles.contributionRow, useAndroidRtlLayout && styles.contributionRowAndroid]}>
              {useAndroidRtlLayout ? (
                <>
                  {contributionIcon}
                  {contributionAmount}
                  <View style={styles.contributionBodyAndroid}>
                    {contributionCopy}
                  </View>
                </>
              ) : (
                <>
                  {contributionIcon}
                  {contributionCopy}
                  {contributionAmount}
                </>
              )}
            </View>
            {index < contributions.length - 1 ? <Divider /> : null}
          </View>
        );
      })}
    </SolidCard>
  );
}

function InsightCard({ summary }: { summary: ReturnType<typeof getGoalSummary> }) {
  return (
    <SolidCard style={styles.insightCard}>
      <View style={[styles.insightHeader, useAndroidRtlLayout && styles.insightHeaderAndroid]}>
        <Ionicons color="#9DD5FF" name="sparkles-outline" size={17} />
        <AppText style={[styles.linkText, useAndroidRtlLayout && styles.insightTitleAndroid]} variant="cardTitle">
          {summary.completed ? 'تقدم ممتاز' : 'تقدم جيد'}
        </AppText>
      </View>
      <AppText style={useAndroidRtlLayout ? styles.insightTextAndroid : undefined} variant="body">
        {summary.completed
          ? 'تم تحقيق الهدف بالكامل. يمكنك الآن متابعة أهداف مالية جديدة لنشاطك.'
          : directionSafeText(`حققت ${summary.progress}% من هدف ${summary.name} ويتبقى ${formatCurrency(summary.remaining)} للوصول إلى المبلغ المستهدف.`)}
      </AppText>
    </SolidCard>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleWrapper}>
      <AppText style={styles.sectionTitle} variant="cardTitle">
        {children}
      </AppText>
    </View>
  );
}

function InfoRow({ label, value, valueDirection = 'ltr' }: { label: string; value: string; valueDirection?: 'ltr' | 'rtl' }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={[styles.infoValue, valueDirection === 'rtl' && styles.infoValueRtl]} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function getProgressMessage(progress: number, completed: boolean) {
  if (completed) {
    return 'تم تحقيق الهدف بالكامل';
  }

  if (progress < 50) {
    return `حققت ${progress}% من هدفك المالي، وأصبحت قريبًا من المنتصف.`;
  }

  if (progress === 50) {
    return `حققت ${progress}% من هدفك المالي، ووصلت إلى المنتصف.`;
  }

  return `حققت ${progress}% من هدفك المالي، وتجاوزت المنتصف.`;
}

function getRemainingTimeLabel(targetDate: string, completed: boolean, today = new Date()) {
  if (completed) {
    return 'تم تحقيق الهدف';
  }

  const [monthName, yearText] = targetDate.trim().split(/\s+/);
  const targetMonth = monthName ? goalMonthIndexes[monthName] : undefined;
  const targetYear = Number(yearText);

  if (targetMonth === undefined || !Number.isFinite(targetYear)) {
    return 'غير محدد';
  }

  const remainingMonths = (targetYear - today.getFullYear()) * 12 + targetMonth - today.getMonth();

  if (remainingMonths <= 0) {
    return 'أقل من شهر';
  }
  if (remainingMonths === 1) {
    return 'حوالي شهر';
  }
  if (remainingMonths === 2) {
    return 'حوالي شهرين';
  }

  const formattedMonths = remainingMonths.toLocaleString('en-US');

  return remainingMonths <= 10 ? `حوالي ${formattedMonths} أشهر` : `حوالي ${formattedMonths} شهرًا`;
}

const goalMonthIndexes: Record<string, number> = {
  يناير: 0,
  فبراير: 1,
  مارس: 2,
  أبريل: 3,
  مايو: 4,
  يونيو: 5,
  يوليو: 6,
  أغسطس: 7,
  سبتمبر: 8,
  أكتوبر: 9,
  نوفمبر: 10,
  ديسمبر: 11,
};

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
  identityCardAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  identityBodyAndroid: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  identityDetailsAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    maxWidth: '100%',
  },
  goalIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    flexShrink: 0,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  identityCopyAndroid: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  identityTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  identityDescriptionAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
    alignSelf: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitleWrapper: {
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
  sectionHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionHeaderTitle: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoCard: {
    gap: spacing.sm,
  },
  infoRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 34,
    width: '100%',
  },
  infoLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    color: colors.text.primary,
    flexShrink: 0,
    fontWeight: '700',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  infoValueRtl: {
    writingDirection: 'rtl',
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
  contributionRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  contributionBodyAndroid: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  contributionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(53,211,154,0.12)',
    borderRadius: radii.control,
    flexShrink: 0,
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
  contributionCopyAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flexShrink: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  contributionTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  contributionDateAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  contributionAmount: {
    color: '#35D39A',
    flexShrink: 0,
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
  insightHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  insightTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  insightTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
