import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimeRangeSelector } from '@/components/financial';
import { AppText, SolidCard } from '@/components/ui';
import {
  getTabScreenContentBottomPadding,
  tabScreenContentInsetAdjustmentBehavior,
} from '@/components/navigation';
import { routes } from '@/constants/routes';
import { useBusinessInformation } from '@/screens/account/business-information-data';
import { useGoalsStore } from '@/screens/goals/goals-store';
import { formatInvoiceCollectionRate } from '@/screens/invoices/invoice-utils';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import { useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { MiniTrend, NoticeBanner, ProgressBar } from './startup-report-components';
import { startupReportPeriods, type StartupReportPeriod } from './startup-report-data';
import {
  formatMoney,
  formatSignedMoney,
  getCollectionStatusLabel,
  getOperationalGrowthSummary,
  type GrowthMetricsSourceData,
  type OperationalGrowthSummary,
} from './saas-metrics-data';
import type { SaaSPeriod } from './saas-metrics-types';

const navigationCards: readonly {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
}[] = [
  {
    title: 'نظرة عامة',
    description: 'ملخص شهري للأداء المالي والتشغيلي.',
    icon: 'analytics-outline',
    href: routes.monthlyReport,
  },
  {
    title: 'مؤشرات النمو',
    description: 'دخل الفترة والتحصيل والالتزامات والمؤشرات غير المتاحة بوضوح.',
    icon: 'trending-up-outline',
    href: routes.growthMetrics,
  },
  {
    title: 'الأهداف والمراحل',
    description: 'تابع أهداف الشركة والميزانيات المرتبطة بها.',
    icon: 'flag-outline',
    href: routes.startupGoals,
  },
  {
    title: 'تحديث الشركة',
    description: 'جهّز تحديثًا مختصرًا للمؤسسين والمستثمرين.',
    icon: 'megaphone-outline',
    href: routes.companyUpdate,
  },
];

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const useAndroidRtlLayout = true;
  const [selectedPeriod, setSelectedPeriod] = useState<StartupReportPeriod>('currentMonth');
  const { transactions } = useTransactionsStore();
  const { invoices } = useInvoicesStore();
  const { expenses: recurringExpenses } = useRecurringExpensesStore();
  const { goals } = useGoalsStore();
  const businessInfo = useBusinessInformation();
  const growthPeriod = toGrowthPeriod(selectedPeriod);
  const sourceData = useMemo<GrowthMetricsSourceData>(
    () => ({ businessInfo, goals, invoices, recurringExpenses, transactions }),
    [businessInfo, goals, invoices, recurringExpenses, transactions],
  );
  const summary = useMemo(() => getOperationalGrowthSummary(sourceData, growthPeriod), [growthPeriod, sourceData]);

  function openRoute(href: Href) {
    Haptics.selectionAsync().catch(() => null);
    router.push(href);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(spacing.safeTop - insets.top, 0),
              paddingBottom: getTabScreenContentBottomPadding(insets.bottom),
            },
          ]}
          contentInsetAdjustmentBehavior={tabScreenContentInsetAdjustmentBehavior}
          showsVerticalScrollIndicator={false}
        >
        <View accessibilityRole="header" style={[styles.header, useAndroidRtlLayout && styles.headerAndroid]}>
          <AppText style={styles.headerText} variant="screenTitle">النمو</AppText>
          <AppText style={styles.headerText} tone="secondary" variant="supporting">
            افهم أداء شركتك، تابع أهدافك، وشارك تقدمك بوضوح.
          </AppText>
        </View>

        <TimeRangeSelector options={startupReportPeriods} selectedValue={selectedPeriod} onSelect={setSelectedPeriod} />

        <SummaryPanel summary={summary} />

        <NoticeBanner
          androidRtlLayout
          message={summary.primaryInsight}
          tone={summary.healthScore >= 70 ? 'success' : 'warning'}
        />

        <View style={styles.section}>
          <View style={styles.sectionTitleWrapper}>
            <AppText style={styles.sectionTitle} variant="sectionTitle">مسارات التقارير</AppText>
          </View>
          <View style={styles.navGrid}>
            {navigationCards.map((card) => (
              <Pressable
                accessibilityLabel={card.title}
                accessibilityRole="button"
                key={card.title}
                onPress={() => openRoute(card.href)}
                style={({ pressed }) => [
                  styles.navCard,
                  useAndroidRtlLayout && styles.navCardAndroid,
                  pressed && styles.pressed,
                ]}
              >
                {useAndroidRtlLayout ? (
                  <>
                    <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
                    <View style={styles.navIcon}>
                      <Ionicons color={colors.brand.calmGreen} name={card.icon} size={20} />
                    </View>
                    <View style={[styles.navCopy, styles.navCopyAndroid]}>
                      <AppText style={styles.navTextAndroid} variant="cardTitle">{card.title}</AppText>
                      <AppText style={styles.navTextAndroid} tone="secondary" variant="caption">
                        {card.description}
                      </AppText>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.navIcon}>
                      <Ionicons color={colors.brand.calmGreen} name={card.icon} size={20} />
                    </View>
                    <View style={styles.navCopy}>
                      <AppText variant="cardTitle">{card.title}</AppText>
                      <AppText tone="secondary" variant="caption">
                        {card.description}
                      </AppText>
                    </View>
                    <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
                  </>
                )}
              </Pressable>
            ))}
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryPanel({ summary }: { summary: OperationalGrowthSummary }) {
  const useAndroidRtlLayout = true;
  const keyGoalLabel = summary.activeGoal?.name ?? 'لا يوجد هدف نشط';
  const keyGoalProgress = summary.activeGoal?.progress ?? 0;
  const recurringTone = summary.recurring.ratioToIncome !== null && summary.recurring.ratioToIncome > 35 ? 'warning' : undefined;
  const collectionStatus = getCollectionStatusLabel(summary.invoices);

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={[styles.summaryTop, useAndroidRtlLayout && styles.summaryTopAndroid]}>
        <View style={[styles.summaryHeading, useAndroidRtlLayout && styles.summaryHeadingAndroid]}>
          <AppText style={useAndroidRtlLayout && styles.summaryHeadingTextAndroid} variant="sectionTitle">ملخص النمو المحلي</AppText>
          <AppText style={useAndroidRtlLayout && styles.summaryHeadingTextAndroid} tone="secondary" variant="caption">
            {summary.periodLabel} · رؤية تشغيلية تجريبية
          </AppText>
        </View>
        <View style={styles.healthBadge}>
          <AppText align="center" style={styles.healthText} variant="caption">
            {summary.healthLabel}
          </AppText>
          <AppText align="center" style={styles.healthSeparator} variant="caption">
            ·
          </AppText>
          <AppText style={styles.scoreText} variant="caption">
            {`${summary.healthScore}/100`}
          </AppText>
        </View>
      </View>

      <View style={[styles.heroMetric, useAndroidRtlLayout && styles.heroMetricAndroid]}>
        <AppText style={styles.rtlText} tone="secondary" variant="caption">
          دخل الفترة
        </AppText>
        <AppText
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          numberOfLines={1}
          style={[styles.heroValue, useAndroidRtlLayout && styles.heroValueAndroid]}
          variant="screenTitle"
        >
          {directionSafeText(formatMoney(summary.current.income, summary.currencySymbol))}
        </AppText>
        <AppText style={[styles.positiveText, styles.rtlText]} variant="caption">
          {directionSafeText(summary.revenueGrowthLabel)}
        </AppText>
      </View>

      <MiniTrend values={summary.trend.map((point) => point.income)} />

      <View style={styles.metricGrid}>
        <SummaryMetric label="صافي الفترة" value={formatSignedMoney(summary.current.net, summary.currencySymbol)} />
        <SummaryMetric label="الالتزامات المتكررة" value={formatMoney(summary.recurring.monthlyTotal, summary.currencySymbol)} tone={recurringTone} />
        <SummaryMetric
          label="تحصيل الفواتير"
          value={formatInvoiceCollectionRate(summary.invoices.collectionRate)}
        />
      </View>

      <View style={styles.collectionBox}>
        <View style={[styles.collectionHeader, useAndroidRtlLayout && styles.collectionHeaderAndroid]}>
          <AppText style={useAndroidRtlLayout && styles.collectionTitleAndroid} variant="cardTitle">تفاصيل التحصيل</AppText>
          <View
            style={[
              styles.collectionStatusBadge,
              collectionStatus === 'يحتاج متابعة' && styles.collectionStatusDanger,
              collectionStatus === 'متوسط' && styles.collectionStatusWarning,
              collectionStatus === 'يحتاج بيانات' && styles.collectionStatusMuted,
            ]}
          >
            <AppText
              align="center"
              style={[
                styles.collectionStatusText,
                collectionStatus === 'يحتاج متابعة' && styles.collectionStatusDangerText,
                collectionStatus === 'متوسط' && styles.collectionStatusWarningText,
                collectionStatus === 'يحتاج بيانات' && styles.collectionStatusMutedText,
              ]}
              variant="caption"
            >
              {collectionStatus}
            </AppText>
          </View>
        </View>
        <View style={[styles.collectionAmounts, useAndroidRtlLayout && styles.collectionAmountsAndroid]}>
          <CollectionAmount
            androidRtlLayout={useAndroidRtlLayout}
            currencySymbol={summary.currencySymbol}
            label="المحصّل"
            value={summary.invoices.collected}
          />
          <CollectionAmount
            androidRtlLayout={useAndroidRtlLayout}
            currencySymbol={summary.currencySymbol}
            label="المتبقي للتحصيل"
            value={summary.invoices.remaining}
          />
        </View>
        <AppText style={useAndroidRtlLayout && styles.collectionMetaAndroid} tone="secondary" variant="caption">
          {`متأخرة: ${summary.invoices.overdueCount.toLocaleString('en-US')} · مستحقة قريبًا: ${summary.invoices.dueSoonCount.toLocaleString('en-US')}`}
        </AppText>
      </View>

      <View style={styles.goalProgressBox}>
        <View style={[styles.goalProgressHeader, useAndroidRtlLayout && styles.goalProgressHeaderAndroid]}>
          <AppText style={styles.goalTitle} variant="cardTitle">{keyGoalLabel}</AppText>
          <AppText style={[styles.positiveText, styles.goalProgressValue]} variant="caption">
            {directionSafeText(`${keyGoalProgress}%`)}
          </AppText>
        </View>
        <ProgressBar progress={keyGoalProgress} />
      </View>
    </SolidCard>
  );
}

function CollectionAmount({
  androidRtlLayout,
  label,
  value,
  currencySymbol,
}: {
  androidRtlLayout: boolean;
  label: string;
  value: number;
  currencySymbol: string;
}) {
  return (
    <View style={[styles.collectionAmount, androidRtlLayout && styles.collectionAmountAndroid]}>
      <AppText style={androidRtlLayout && styles.collectionLabelAndroid} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={[styles.collectionAmountValue, androidRtlLayout && styles.collectionAmountValueAndroid]} variant="cardTitle">
        {directionSafeText(formatMoney(value, currencySymbol))}
      </AppText>
    </View>
  );
}

function toGrowthPeriod(period: StartupReportPeriod): SaaSPeriod {
  if (period === 'threeMonths') {
    return 'three-months';
  }

  if (period === 'sixMonths') {
    return 'six-months';
  }

  if (period === 'year') {
    return 'year';
  }

  return 'current-month';
}
function SummaryMetric({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <View style={styles.metricBox}>
      <AppText style={styles.metricLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={[styles.metricValue, tone === 'warning' && styles.warningText]} variant="cardTitle">
        {directionSafeText(value)}
      </AppText>
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
    paddingHorizontal: spacing.screenX,
  },
  header: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  headerAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  headerText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryCard: {
    gap: spacing.lg,
    overflow: 'hidden',
  },
  summaryTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTopAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    width: '100%',
  },
  summaryHeading: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  summaryHeadingAndroid: {
    alignItems: 'flex-end',
  },
  summaryHeadingTextAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  healthBadge: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    flexDirection: 'row-reverse',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  healthText: {
    color: '#3DD598',
  },
  healthSeparator: {
    color: '#3DD598',
  },
  scoreText: {
    color: '#3DD598',
    direction: 'ltr',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  heroMetric: {
    gap: spacing.xs,
  },
  heroMetricAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  rtlText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  heroValue: {
    flexShrink: 1,
    fontSize: 31,
    lineHeight: 40,
    minWidth: 0,
  },
  heroValueAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  positiveText: {
    color: '#3DD598',
  },
  metricGrid: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  metricBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 78,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  metricValue: {
    fontSize: 16,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  metricLabel: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  warningText: {
    color: colors.semantic.warning,
  },
  collectionBox: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  collectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  collectionHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    width: '100%',
  },
  collectionTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  collectionStatusBadge: {
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  collectionStatusText: {
    color: colors.brand.calmGreen,
  },
  collectionStatusDanger: {
    backgroundColor: colors.semantic.dangerTint,
  },
  collectionStatusDangerText: {
    color: colors.semantic.danger,
  },
  collectionStatusWarning: {
    backgroundColor: colors.semantic.warningTint,
  },
  collectionStatusWarningText: {
    color: colors.semantic.warning,
  },
  collectionStatusMuted: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  collectionStatusMutedText: {
    color: colors.text.secondary,
  },
  collectionAmounts: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  collectionAmountsAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  collectionAmount: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  collectionAmountAndroid: {
    alignItems: 'flex-end',
  },
  collectionLabelAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  collectionAmountValue: {
    fontSize: 16,
    writingDirection: 'ltr',
  },
  collectionAmountValueAndroid: {
    textAlign: 'right',
    width: '100%',
  },
  collectionMetaAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  goalProgressBox: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  goalProgressHeader: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  goalProgressHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  goalTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  goalProgressValue: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  navGrid: {
    gap: spacing.md,
  },
  navCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 82,
    padding: spacing.md,
  },
  navCardAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  navIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  navCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  navCopyAndroid: {
    alignItems: 'flex-end',
    minWidth: 0,
  },
  navTextAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
