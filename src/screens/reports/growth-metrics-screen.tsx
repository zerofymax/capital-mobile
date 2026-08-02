import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const bottomPadding = Math.max(insets.bottom, spacing.sm) + spacing.xxxl;
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
          onBack={() => router.back()}
          subtitle="تابع الإيرادات والعملاء وكفاءة نمو شركتك."
          title="مؤشرات النمو"
        />

        <View style={styles.periodRow}>
          {saasPeriods.map((item) => {
            const selected = item.id === period;

            return (
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.id}
                onPress={() => setPeriod(item.id)}
                style={({ pressed }) => [styles.periodChip, selected && styles.periodChipActive, pressed && styles.pressed]}
              >
                <AppText align="center" style={selected && styles.periodChipTextActive} variant="caption">
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <SolidCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <AppText tone="secondary" variant="caption">
                {summary.periodLabel}
              </AppText>
              <AppText variant="sectionTitle">ملخص النمو المحلي</AppText>
            </View>
            <View style={styles.modelBadge}>
              <AppText align="center" style={styles.modelBadgeText} variant="caption">تجريبي</AppText>
            </View>
          </View>

          <View style={styles.mrrRow}>
            <View>
              <AppText tone="secondary" variant="caption">
                دخل الفترة
              </AppText>
              <AppText style={styles.mrrValue} variant="screenTitle">
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

          <View style={styles.summaryGrid}>
            <SummaryStat label="صافي الفترة" value={formatSignedMoney(summary.current.net, summary.currencySymbol)} />
            <SummaryStat label="هامش الصافي" value={formatPercent(summary.netMargin)} />
            <SummaryStat
              label="التحصيل"
              value={formatInvoiceCollectionRate(summary.invoices.collectionRate)}
            />
          </View>

          <View style={styles.collectionBox}>
            <View style={styles.collectionHeader}>
              <AppText variant="cardTitle">تحصيل الفواتير</AppText>
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
            <View style={styles.collectionAmounts}>
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
            <AppText tone="secondary" variant="caption">
              {`متأخرة: ${summary.invoices.overdueCount.toLocaleString('en-US')} · مستحقة قريبًا: ${summary.invoices.dueSoonCount.toLocaleString('en-US')}`}
            </AppText>
          </View>

          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <AppText tone="secondary" variant="caption">
                اتجاه العمليات المسجلة
              </AppText>
              <AppText style={styles.growthText} variant="caption">
                {summary.healthLabel}
              </AppText>
            </View>
            <ProgressBar progress={summary.healthScore} />
          </View>
        </SolidCard>

        <NoticeBanner message={summary.primaryInsight} tone="warning" />

        {metricSections.map((section) => {
          const sectionMetrics = metrics.filter((metric) => metric.section === section);

          return (
            <View key={section} style={styles.section}>
              <AppText variant="sectionTitle">{getMetricSectionTitle(section)}</AppText>
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
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={styles.collectionAmountValue} variant="cardTitle">
        {directionSafeText(formatMoney(value, currencySymbol))}
      </AppText>
    </View>
  );
}

function SummaryStat({ label, value, ltrLabel = false }: { label: string; value: string; ltrLabel?: boolean }) {
  return (
    <View style={styles.summaryStat}>
      <AppText align="center" style={ltrLabel && styles.ltrLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={styles.summaryStatValue} variant="cardTitle">
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
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, { backgroundColor: statusMeta.tint }]}>
          <Ionicons color={statusMeta.color} name={metric.icon} size={17} />
        </View>
        <View style={styles.metricCopy}>
          <View style={styles.metricTitleRow}>
            <AppText numberOfLines={2} variant="cardTitle">
              {metric.title}
            </AppText>
            <AppText style={styles.abbreviation} variant="caption">
              {metric.abbreviation}
            </AppText>
          </View>
          <AppText tone="secondary" variant="caption">
            {directionSafeText(metric.comparison)}
          </AppText>
          {shouldShowSourceDescription ? (
            <AppText tone="secondary" variant="caption">
              {directionSafeText(sourceDescription ?? '')}
            </AppText>
          ) : null}
        </View>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      </View>
      <View style={styles.metricBottom}>
        <AppText style={styles.metricValue} variant="cardTitle">
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
  periodRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  periodChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  periodChipTextActive: {
    color: colors.text.primary,
  },
  heroCard: {
    gap: spacing.lg,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  modelBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modelBadgeText: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  mrrRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  mrrValue: {
    fontSize: 31,
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
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  summaryStat: {
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
  summaryStatValue: {
    fontSize: 16,
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
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
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
  collectionAmount: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  collectionAmountValue: {
    fontSize: 16,
    writingDirection: 'ltr',
  },
  progressBox: {
    gap: spacing.sm,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  section: {
    gap: spacing.md,
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
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  metricCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  metricTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  abbreviation: {
    color: colors.brand.calmGreen,
    minWidth: 34,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  metricBottom: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexShrink: 0,
    gap: spacing.xs,
  },
  metricValue: {
    fontSize: 20,
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
});
