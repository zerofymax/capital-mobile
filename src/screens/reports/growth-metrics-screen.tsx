import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimeRangeSelector } from '@/components/financial';
import { AppText, SolidCard } from '@/components/ui';
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
import { MiniTrend, NoticeBanner, ProgressBar, ReportModalHeader } from './startup-report-components';
import {
  formatMoney,
  formatPercent,
  formatSignedMoney,
  getCollectionStatusLabel,
  getOperationalGrowthSummary,
  getMetricSectionTitle,
  getSaaSMetrics,
  saasPeriods,
  type GrowthMetricsSourceData,
} from './saas-metrics-data';
import type { GrowthMetricDefinition, MetricStatus, SaaSPeriod } from './saas-metrics-types';

const metricSections: readonly GrowthMetricDefinition['section'][] = ['revenue', 'customers', 'efficiency'];
const useAndroidRtlLayout = true;
const androidSystemNavigationClearance = 48;

export function GrowthMetricsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<SaaSPeriod>('current-month');
  const { transactions } = useTransactionsStore();
  const { invoices } = useInvoicesStore();
  const { expenses: recurringExpenses } = useRecurringExpensesStore();
  const { goals } = useGoalsStore();
  const businessInfo = useBusinessInformation();
  const sourceData = useMemo<GrowthMetricsSourceData>(
    () => ({ businessInfo, goals, invoices, recurringExpenses, transactions }),
    [businessInfo, goals, invoices, recurringExpenses, transactions],
  );
  const summary = useMemo(() => getOperationalGrowthSummary(sourceData, period), [period, sourceData]);
  const metrics = useMemo(() => getSaaSMetrics(period, sourceData), [period, sourceData]);
  const bottomPadding = Platform.OS === 'android'
    ? insets.bottom + androidSystemNavigationClearance + spacing.xxl
    : Math.max(insets.bottom, spacing.sm) + spacing.xxxl;
  const collectionStatus = getCollectionStatusLabel(summary.invoices);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: bottomPadding,
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <ReportModalHeader
          androidRtlLayout
          onBack={() => router.back()}
          subtitle="تابع الإيرادات والعملاء وكفاءة نمو شركتك."
          title="مؤشرات النمو"
        />

        <TimeRangeSelector options={saasPeriods} selectedValue={period} onSelect={setPeriod} />

        <SolidCard style={styles.heroCard}>
          <View style={[styles.heroHeader, useAndroidRtlLayout && styles.heroHeaderAndroid]}>
            <View style={styles.heroCopy}>
              <AppText align="right" style={styles.rtlText} variant="sectionTitle">
                ملخص النمو المحلي
              </AppText>
              <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
                {directionSafeText(summary.periodLabel)}
              </AppText>
            </View>
            <View style={styles.modelBadge}>
              <AppText align="center" style={styles.modelBadgeText} variant="caption">تجريبي</AppText>
            </View>
          </View>

          <View style={[styles.mrrRow, useAndroidRtlLayout && styles.mrrRowAndroid]}>
            <View style={styles.heroCopy}>
              <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
                دخل الفترة
              </AppText>
              <AppText
                adjustsFontSizeToFit
                align="right"
                minimumFontScale={0.65}
                numberOfLines={1}
                style={styles.mrrValue}
                variant="screenTitle"
              >
                {directionSafeText(formatMoney(summary.current.income, summary.currencySymbol))}
              </AppText>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons color={colors.brand.calmGreen} name="trending-up-outline" size={16} />
              <AppText style={styles.growthText} variant="caption">
                {directionSafeText(formatPercent(summary.revenueGrowth))}
              </AppText>
            </View>
          </View>

          <MiniTrend values={summary.trend.map((point) => point.income)} />

          <View style={[styles.summaryGrid, useAndroidRtlLayout && styles.summaryGridAndroid]}>
            <SummaryStat label="صافي الفترة" value={formatSignedMoney(summary.current.net, summary.currencySymbol)} />
            <SummaryStat label="هامش الصافي" value={formatPercent(summary.netMargin)} />
            <SummaryStat
              label="التحصيل"
              value={formatInvoiceCollectionRate(summary.invoices.collectionRate)}
            />
          </View>

          <View style={styles.collectionBox}>
            <View style={[styles.collectionHeader, useAndroidRtlLayout && styles.collectionHeaderAndroid]}>
              <AppText align="right" style={styles.flexRtlText} variant="cardTitle">
                تحصيل الفواتير
              </AppText>
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
                currencySymbol={summary.currencySymbol}
                label="المحصّل"
                value={summary.invoices.collected}
              />
              <CollectionAmount
                currencySymbol={summary.currencySymbol}
                label="المتبقي للتحصيل"
                value={summary.invoices.remaining}
              />
            </View>
            <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
              {`متأخرة: ${summary.invoices.overdueCount.toLocaleString('en-US')} · مستحقة قريبًا: ${summary.invoices.dueSoonCount.toLocaleString('en-US')}`}
            </AppText>
          </View>

          <View style={styles.progressBox}>
            <View style={[styles.progressHeader, useAndroidRtlLayout && styles.progressHeaderAndroid]}>
              <AppText align="right" style={styles.flexRtlText} tone="secondary" variant="caption">
                اتجاه العمليات المسجلة
              </AppText>
              <AppText style={[styles.growthText, styles.healthStatusText]} variant="caption">
                {summary.healthLabel}
              </AppText>
            </View>
            <ProgressBar progress={summary.healthScore} />
          </View>
        </SolidCard>

        <NoticeBanner androidRtlLayout message={summary.primaryInsight} tone="warning" />

        {metricSections.map((section) => {
          const sectionMetrics = metrics.filter((metric) => metric.section === section);

          return (
            <View key={section} style={styles.section}>
              <View style={styles.sectionTitleWrapper}>
                <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
                  {getMetricSectionTitle(section)}
                </AppText>
              </View>
              <View style={styles.metricsGrid}>
                {sectionMetrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} period={period} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function CollectionAmount({
  label,
  value,
  currencySymbol,
}: {
  label: string;
  value: number;
  currencySymbol: string;
}) {
  return (
    <View style={styles.collectionAmount}>
      <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="right" style={styles.collectionAmountValue} variant="cardTitle">
        {directionSafeText(formatMoney(value, currencySymbol))}
      </AppText>
    </View>
  );
}

function SummaryStat({ label, value, ltrLabel = false }: { label: string; value: string; ltrLabel?: boolean }) {
  const numericValue = /\d/.test(value);

  return (
    <View style={styles.summaryStat}>
      <AppText align="right" style={[styles.summaryStatLabel, ltrLabel && styles.ltrLabel]} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText
        adjustsFontSizeToFit
        align="right"
        minimumFontScale={0.7}
        numberOfLines={1}
        style={[styles.summaryStatValue, numericValue ? styles.ltrSummaryStatValue : styles.rtlSummaryStatValue]}
        variant="cardTitle"
      >
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function MetricCard({ metric, period }: { metric: GrowthMetricDefinition; period: SaaSPeriod }) {
  const statusMeta = getStatusMeta(metric.status);
  const sourceDescription = metric.sourceDescription?.trim();
  const comparison = metric.comparison.trim();
  const shouldShowSourceDescription = Boolean(sourceDescription && sourceDescription !== comparison);
  const badgeLabels = metric.rawValue === null ? [metric.badge ?? 'يحتاج بيانات'] : [metric.badge, statusMeta.label].filter(Boolean);

  return (
    <Pressable
      accessibilityLabel={`${metric.title} ${metric.value}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: routes.metricDetails, params: { metricId: metric.id, period } })}
      style={({ pressed }) => [styles.metricCard, pressed && styles.pressed]}
    >
      <View style={[styles.metricTop, useAndroidRtlLayout && styles.metricTopAndroid]}>
        {useAndroidRtlLayout ? (
          <>
            <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
            <View style={[styles.metricIcon, { backgroundColor: statusMeta.tint }]}>
              <Ionicons color={statusMeta.color} name={metric.icon} size={17} />
            </View>
            <MetricCardCopy
              comparison={metric.comparison}
              metric={metric}
              shouldShowSourceDescription={shouldShowSourceDescription}
              sourceDescription={sourceDescription}
            />
          </>
        ) : (
          <>
            <View style={[styles.metricIcon, { backgroundColor: statusMeta.tint }]}>
              <Ionicons color={statusMeta.color} name={metric.icon} size={17} />
            </View>
            <MetricCardCopy
              comparison={metric.comparison}
              metric={metric}
              shouldShowSourceDescription={shouldShowSourceDescription}
              sourceDescription={sourceDescription}
            />
            <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
          </>
        )}
      </View>
      <View style={[styles.metricBottom, useAndroidRtlLayout && styles.metricBottomAndroid]}>
        <AppText
          adjustsFontSizeToFit
          align="right"
          minimumFontScale={0.65}
          numberOfLines={1}
          style={[styles.metricValue, metric.rawValue === null ? styles.rtlMetricValue : styles.ltrMetricValue]}
          variant="cardTitle"
        >
          {directionSafeText(metric.value)}
        </AppText>
        <View style={styles.badgeRow}>
          {badgeLabels.map((label) => (
            <View key={label} style={[styles.statusBadge, { backgroundColor: statusMeta.tint, borderColor: statusMeta.border }]}>
              <AppText align="center" style={{ color: statusMeta.color }} variant="caption">
                {label}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function MetricCardCopy({
  comparison,
  metric,
  shouldShowSourceDescription,
  sourceDescription,
}: {
  comparison: string;
  metric: GrowthMetricDefinition;
  shouldShowSourceDescription: boolean;
  sourceDescription?: string;
}) {
  return (
    <View style={styles.metricCopy}>
      <View style={[styles.metricTitleRow, useAndroidRtlLayout && styles.metricTitleRowAndroid]}>
        <AppText
          align="right"
          numberOfLines={2}
          style={styles.metricTitle}
          variant="cardTitle"
        >
          {metric.title}
        </AppText>
        <AppText style={styles.abbreviation} variant="caption">
          {metric.abbreviation}
        </AppText>
      </View>
      <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
        {directionSafeText(comparison)}
      </AppText>
      {shouldShowSourceDescription ? (
        <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
          {directionSafeText(sourceDescription ?? '')}
        </AppText>
      ) : null}
    </View>
  );
}

function getStatusMeta(status: MetricStatus) {
  if (status === 'intervene') {
    return {
      label: 'يحتاج تدخل',
      color: colors.semantic.danger,
      tint: colors.semantic.dangerTint,
      border: 'rgba(229,103,90,0.28)',
    };
  }

  if (status === 'watch') {
    return {
      label: 'يحتاج متابعة',
      color: colors.semantic.warning,
      tint: colors.semantic.warningTint,
      border: 'rgba(232,163,61,0.28)',
    };
  }

  return {
    label: 'جيد',
    color: colors.brand.calmGreen,
    tint: colors.semantic.successTint,
    border: 'rgba(79,138,91,0.28)',
  };
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
  unsupportedWrap: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  heroCard: {
    gap: spacing.lg,
  },
  heroHeader: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  heroHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  heroCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  modelBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modelBadgeText: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  mrrRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  mrrRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  mrrValue: {
    flexShrink: 1,
    fontSize: 31,
    lineHeight: 40,
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  growthBadge: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  growthText: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryGridAndroid: {
    direction: 'rtl',
  },
  summaryStat: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 72,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  summaryStatLabel: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryStatValue: {
    fontSize: 16,
    lineHeight: 22,
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
  },
  ltrSummaryStatValue: {
    writingDirection: 'ltr',
  },
  rtlSummaryStatValue: {
    writingDirection: 'rtl',
  },
  ltrLabel: {
    writingDirection: 'ltr',
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
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  collectionHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
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
    flexDirection: 'row',
    gap: spacing.sm,
  },
  collectionAmountsAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  collectionAmount: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  collectionAmountValue: {
    fontSize: 16,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  progressBox: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  progressHeader: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  progressHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  healthStatusText: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'rtl',
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
  metricsGrid: {
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  metricTop: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  metricTopAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    flexShrink: 0,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  metricCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  metricTitleRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  metricTitleRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  abbreviation: {
    color: colors.brand.calmGreen,
    flexShrink: 0,
    minWidth: 34,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  metricTitle: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metricBottom: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  metricBottomAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
  },
  metricValue: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    minWidth: 0,
    textAlign: 'right',
  },
  ltrMetricValue: {
    writingDirection: 'ltr',
  },
  rtlMetricValue: {
    writingDirection: 'rtl',
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
  rtlText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  flexRtlText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
