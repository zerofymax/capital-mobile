import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { ReportMetric, ReportMetricTone } from '@/screens/reports/reports-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText, NumericText } from '@/utils/rtl';

type FinancialSummaryCardProps = {
  metrics: readonly ReportMetric[];
};

const metricToneColor: Record<ReportMetricTone, string> = {
  positive: colors.semantic.success,
  warning: colors.semantic.warning,
  danger: colors.semantic.danger,
};

const metricToneBackground: Record<ReportMetricTone, string> = {
  positive: colors.semantic.successTint,
  warning: colors.semantic.warningTint,
  danger: colors.semantic.dangerTint,
};

export function FinancialSummaryCard({ metrics }: FinancialSummaryCardProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(38,46,62,0.62)', 'rgba(20,24,32,0.58)', 'rgba(10,13,18,0.68)']}
        end={{ x: 0.9, y: 1 }}
        locations={[0, 0.58, 1]}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText style={styles.rtlText} variant="cardTitle">ملخص الأداء المالي</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="caption">
            مقارنة بالفترة السابقة
          </AppText>
        </View>
        <View style={styles.grid}>
          {metrics.map((metric) => (
            <View key={metric.id} style={styles.metric}>
              <AppText style={styles.rtlText} tone="secondary" variant="caption">
                {metric.label}
              </AppText>
              <NumericText style={[styles.metricValue, { color: metricToneColor[metric.tone] }]}>
                {formatMetricValue(metric)}
                </NumericText>
              <View style={[styles.trendBadge, { backgroundColor: metricToneBackground[metric.tone] }]}>
                <AppText style={{ color: metricToneColor[metric.tone] }} variant="caption">
                  {directionSafeText(metric.trend)}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function formatMetricValue(metric: ReportMetric) {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: metric.format === 'percent' ? 1 : 0,
    minimumFractionDigits: metric.format === 'percent' ? 1 : 0,
  });

  return metric.format === 'percent' ? `${formatter.format(metric.value)}%` : `${formatter.format(metric.value)} ر.س`;
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 26,
    borderWidth: 1,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.15), 0 18px 34px rgba(0,0,0,0.40)',
    overflow: 'hidden',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  grid: {
    direction: 'rtl',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 7,
    minWidth: 0,
    padding: 13,
  },
  metricValue: {
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  trendBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
});
