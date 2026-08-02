import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { ReportChartPoint } from '@/screens/reports/reports-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NumericText } from '@/utils/rtl';

type PerformanceChartProps = {
  points: readonly ReportChartPoint[];
};

const chartHeight = 118;

export function PerformanceChart({ points }: PerformanceChartProps) {
  const maxValue = Math.max(...points.flatMap((point) => [point.revenue, point.expenses]));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="cardTitle">أداء الإيرادات والمصروفات</AppText>
        <View style={styles.legend}>
          <LegendItem color={colors.semantic.warning} label="المصروفات" />
          <LegendItem color={colors.brand.green} label="الإيرادات" />
        </View>
      </View>
      <View style={styles.chart}>
        {points.map((point) => (
          <View key={point.id} style={styles.point}>
            <View style={styles.bars}>
              <View
                accessibilityLabel={`${point.label} المصروفات ${point.expenses}`}
                style={[
                  styles.bar,
                  styles.expenseBar,
                  { height: getBarHeight(point.expenses, maxValue) },
                ]}
              />
              <View
                accessibilityLabel={`${point.label} الإيرادات ${point.revenue}`}
                style={[
                  styles.bar,
                  styles.revenueBar,
                  { height: getBarHeight(point.revenue, maxValue) },
                ]}
              />
            </View>
            <AppText align="center" numberOfLines={1} tone="secondary" variant="caption">
              {point.label}
            </AppText>
          </View>
        ))}
      </View>
      <View style={styles.totals}>
        <MetricTotal label="إجمالي الإيرادات" tone="success" value={sum(points, 'revenue')} />
        <MetricTotal label="إجمالي المصروفات" tone="warning" value={sum(points, 'expenses')} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function MetricTotal({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'warning';
}) {
  return (
    <View style={styles.totalItem}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <NumericText style={[styles.totalValue, tone === 'success' ? styles.successValue : styles.warningValue]}>
        {formatCompactSar(value)}
      </NumericText>
    </View>
  );
}

function getBarHeight(value: number, maxValue: number) {
  return Math.max(18, Math.round((value / maxValue) * chartHeight));
}

function sum(points: readonly ReportChartPoint[], key: 'revenue' | 'expenses') {
  return points.reduce((total, point) => total + point[key], 0);
}

function formatCompactSar(value: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
    notation: 'compact',
  });

  return `${formatter.format(value)} ر.س`;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.xs,
  },
  legendDot: {
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    height: 158,
    justifyContent: 'space-between',
  },
  point: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    height: chartHeight,
  },
  bar: {
    borderRadius: radii.chart,
    width: 10,
  },
  revenueBar: {
    backgroundColor: colors.brand.green,
    boxShadow: '0 0 18px rgba(79,138,91,0.22)',
  },
  expenseBar: {
    backgroundColor: colors.semantic.warning,
    opacity: 0.78,
  },
  totals: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  totalItem: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: radii.control,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  totalValue: {
    fontSize: 15,
    lineHeight: 21,
  },
  successValue: {
    color: colors.semantic.success,
  },
  warningValue: {
    color: colors.semantic.warning,
  },
});
