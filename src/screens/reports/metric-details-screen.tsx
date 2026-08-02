import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, SolidCard } from '@/components/ui';
import { useBusinessInformation } from '@/screens/account/business-information-data';
import { useGoalsStore } from '@/screens/goals/goals-store';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import { useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { MiniTrend, NoticeBanner, ReportModalHeader } from './startup-report-components';
import { getSaaSMetric, saasPeriods, type GrowthMetricsSourceData } from './saas-metrics-data';
import type { GrowthMetricDefinition, MetricStatus, SaaSPeriod } from './saas-metrics-types';

export function MetricDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { metricId, period } = useLocalSearchParams<{ metricId?: string; period?: SaaSPeriod }>();
  const activePeriod = saasPeriods.some((item) => item.id === period) ? period : 'current-month';
  const { transactions } = useTransactionsStore();
  const { invoices } = useInvoicesStore();
  const { expenses: recurringExpenses } = useRecurringExpensesStore();
  const { goals } = useGoalsStore();
  const businessInfo = useBusinessInformation();
  const sourceData = useMemo<GrowthMetricsSourceData>(
    () => ({ businessInfo, goals, invoices, recurringExpenses, transactions }),
    [businessInfo, goals, invoices, recurringExpenses, transactions],
  );
  const metric = useMemo(() => getSaaSMetric(metricId, activePeriod, sourceData), [activePeriod, metricId, sourceData]);
  const bottomPadding = insets.bottom + 24;
  const hasTrendData = metric.rawValue !== null && metric.history.length > 0;
  const statusLabelOverride = metric.rawValue === null ? (metric.badge ?? 'يحتاج بيانات') : undefined;

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
        <ReportModalHeader onBack={() => router.back()} subtitle={metric.abbreviation} title={metric.title} />

        <SolidCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.valueBox}>
              <AppText tone="secondary" variant="caption">
                القيمة الحالية
              </AppText>
              <AppText style={styles.value} variant="screenTitle">
                {directionSafeText(metric.value)}
              </AppText>
              <AppText tone="secondary" variant="caption">
                {directionSafeText(metric.comparison)}
              </AppText>
            </View>
            <MetricStatusBadge labelOverride={statusLabelOverride} status={metric.status} />
          </View>
          {hasTrendData ? (
            <MiniTrend values={metric.history.map((point) => point.value)} tone={metric.status} />
          ) : (
            <View style={styles.unavailableTrendBox}>
              <Ionicons color={colors.text.tertiary} name="bar-chart-outline" size={18} />
              <AppText align="center" tone="secondary" variant="caption">
                لا توجد بيانات تاريخية موثوقة لهذا المؤشر حاليًا.
              </AppText>
            </View>
          )}
        </SolidCard>

        <NoticeBanner message="هذه المؤشرات تقديرية وتعتمد على البيانات المدخلة." tone="warning" />

        <InfoSection icon="information-circle-outline" title="ما معنى هذا المؤشر؟" text={metric.explanation} />
        <InfoSection icon="calculator-outline" title="طريقة الحساب" text={metric.formula} footer={metric.calculationDescription} />
        <SourceValues metric={metric} />
        <InfoSection icon="sparkles-outline" title="لماذا يهم مؤسس الشركة؟" text={metric.importance} />
        <InfoSection icon="clipboard-outline" title="ملاحظة عملية" text={metric.note} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricStatusBadge({ labelOverride, status }: { labelOverride?: string; status: MetricStatus }) {
  const meta = getStatusMeta(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: meta.tint, borderColor: meta.border }]}>
      <Ionicons color={meta.color} name={meta.icon} size={15} />
      <AppText align="center" style={{ color: meta.color }} variant="caption">
        {labelOverride ?? meta.label}
      </AppText>
    </View>
  );
}

function SourceValues({ metric }: { metric: GrowthMetricDefinition }) {
  return (
    <SolidCard style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIcon}>
          <Ionicons color={colors.brand.calmGreen} name="server-outline" size={17} />
        </View>
        <AppText variant="cardTitle">القيم المستخدمة في الحساب</AppText>
      </View>
      <View style={styles.sourceList}>
        {metric.sourceValues.map((value) => (
          <View key={value} style={styles.sourceRow}>
            <View style={styles.sourceDot} />
            <AppText style={styles.sourceText} tone="secondary" variant="body">
              {directionSafeText(value)}
            </AppText>
          </View>
        ))}
      </View>
    </SolidCard>
  );
}

function InfoSection({
  title,
  text,
  footer,
  icon,
}: {
  title: string;
  text: string;
  footer?: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <SolidCard style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIcon}>
          <Ionicons color={colors.brand.calmGreen} name={icon} size={17} />
        </View>
        <AppText variant="cardTitle">{title}</AppText>
      </View>
      <AppText tone="secondary" variant="body">
        {directionSafeText(text)}
      </AppText>
      {footer ? (
        <View style={styles.footerNote}>
          <AppText tone="secondary" variant="caption">
            {directionSafeText(footer)}
          </AppText>
        </View>
      ) : null}
    </SolidCard>
  );
}

function getStatusMeta(status: MetricStatus) {
  if (status === 'intervene') {
    return {
      label: 'يحتاج تدخل',
      color: colors.semantic.danger,
      tint: colors.semantic.dangerTint,
      border: 'rgba(229,103,90,0.28)',
      icon: 'alert-circle-outline' as const,
    };
  }

  if (status === 'watch') {
    return {
      label: 'يحتاج متابعة',
      color: colors.semantic.warning,
      tint: colors.semantic.warningTint,
      border: 'rgba(232,163,61,0.28)',
      icon: 'time-outline' as const,
    };
  }

  return {
    label: 'جيد',
    color: colors.brand.calmGreen,
    tint: colors.semantic.successTint,
    border: 'rgba(79,138,91,0.28)',
    icon: 'checkmark-circle-outline' as const,
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
  heroCard: {
    gap: spacing.lg,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  valueBox: {
    flex: 1,
    gap: spacing.xs,
  },
  value: {
    fontSize: 31,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  unavailableTrendBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 90,
    padding: spacing.md,
  },
  infoCard: {
    gap: spacing.md,
  },
  infoHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  footerNote: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    padding: spacing.md,
  },
  sourceList: {
    gap: spacing.sm,
  },
  sourceRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  sourceDot: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: 6,
    width: 6,
  },
  sourceText: {
    flex: 1,
  },
});
