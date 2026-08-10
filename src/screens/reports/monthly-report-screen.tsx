import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportExportSheet } from '@/components/reports/report-export-sheet';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText, NumericText } from '@/utils/rtl';
import {
  monthlyReportData,
  type MonthlyReportAction,
  type MonthlyReportListRow,
  type MonthlyReportMetric,
} from './monthly-report-data';

const chartHeight = 130;
const bottomActionsMinHeight = 50;
const useAndroidRtlLayout = true;

export function MonthlyReportScreen() {
  const insets = useSafeAreaInsets();
  const [exportSheetVisible, setExportSheetVisible] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleActionPress(action: MonthlyReportAction) {
    Haptics.selectionAsync().catch(() => null);

    if (action.href) {
      router.push(action.href);
      return;
    }

    setNotice('هذا الإجراء متاح كنموذج أولي فقط.');
  }

  function handleSharePress() {
    Haptics.selectionAsync().catch(() => null);
    setNotice('المشاركة متاحة كنموذج أولي فقط. لم يتم فتح مشاركة نظامية.');
  }

  function handlePeriodPress() {
    Haptics.selectionAsync().catch(() => null);
    router.replace(routes.reports);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: useAndroidRtlLayout
              ? insets.bottom + bottomActionsMinHeight + spacing.xxl
              : Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <ReportHeader />

        <SummaryCard />
        <MetricGrid metrics={monthlyReportData.metrics} />
        <RevenueExpenseChart />
        <SummaryList rows={monthlyReportData.revenueSources} title="أبرز مصادر الإيرادات" />
        <SummaryList rows={monthlyReportData.expenseCategories} title="أكبر فئات المصروفات" />
        <SummaryList rows={monthlyReportData.commitments} title="الاشتراكات والالتزامات" />
        <InterpretationCard />
        <RecommendedActions actions={monthlyReportData.recommendedActions} onPress={handleActionPress} />

        {notice ? (
          <View accessibilityLiveRegion="polite" style={styles.notice}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={17} />
            <AppText style={styles.noticeText} tone="warning" variant="caption">
              {notice}
            </AppText>
          </View>
        ) : null}

        <View style={styles.bottomActions}>
          <AppButton onPress={() => setExportSheetVisible(true)} style={styles.primaryBottomAction}>
            تصدير التقرير
          </AppButton>
          <AppButton onPress={handleSharePress} style={styles.secondaryBottomAction} variant="secondary">
            مشاركة
          </AppButton>
          <AppButton onPress={handlePeriodPress} style={styles.secondaryBottomAction} variant="secondary">
            تغيير الفترة
          </AppButton>
        </View>
      </ScrollView>

      <ReportExportSheet
        onClose={() => setExportSheetVisible(false)}
        subtitle={monthlyReportData.exportSubtitle}
        visible={exportSheetVisible}
      />
    </SafeAreaView>
  );
}

function ReportHeader() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع إلى التقارير"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.replace(routes.reports)}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <Ionicons
          color={colors.text.muted}
          name="chevron-back-outline"
          size={22}
        />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="right" style={styles.headerTitle} variant="screenTitle">
          {monthlyReportData.title}
        </AppText>
        <AppText align="right" style={styles.headerPeriod} tone="secondary" variant="supporting">
          {monthlyReportData.period}
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function SummaryCard() {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={[styles.summaryHeader, useAndroidRtlLayout && styles.summaryHeaderAndroid]}>
        <AppText style={styles.summaryTitle} variant="cardTitle">الملخص التنفيذي</AppText>
        <View style={styles.manualReportBadge}>
          <AppText align="center" style={styles.manualReportBadgeText} variant="caption">
            {monthlyReportData.sourceBadge}
          </AppText>
        </View>
      </View>
      <View style={[styles.sourceNoteBox, useAndroidRtlLayout && styles.sourceNoteBoxAndroid]}>
        <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={16} />
        <AppText style={styles.sourceNoteText} tone="secondary" variant="caption">
          {monthlyReportData.sourceNote}
        </AppText>
      </View>
      <AppText style={styles.bodyText} tone="secondary" variant="body">
        {monthlyReportData.executiveSummary}
      </AppText>
    </SolidCard>
  );
}

function MetricGrid({ metrics }: { metrics: readonly MonthlyReportMetric[] }) {
  return (
    <View style={styles.metricGrid}>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.metricCard}>
          <AppText style={styles.metricLabel} tone="secondary" variant="caption">
            {metric.label}
          </AppText>
          <NumericText style={[styles.metricValue, getMetricToneStyle(metric.tone)]}>
            {metric.value}
          </NumericText>
          {metric.change ? (
            <NumericText style={[styles.metricChange, metric.tone === 'danger' ? styles.dangerText : styles.successText]}>
              {directionSafeText(metric.change)}
            </NumericText>
          ) : null}
          {metric.support ? (
            <AppText style={styles.metricSupport} tone="secondary" variant="caption">
              {metric.support}
            </AppText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function RevenueExpenseChart() {
  const point = monthlyReportData.chart[0]!;
  const maxValue = Math.max(point.currentRevenue, point.currentExpenses, point.previousRevenue, point.previousExpenses);

  return (
    <SolidCard style={styles.chartCard}>
      <View style={styles.cardHeader}>
        <View style={styles.sectionTitleWrapper}>
          <AppText style={styles.chartTitle} variant="cardTitle">الإيرادات مقابل المصروفات</AppText>
        </View>
        <View style={[styles.legend, useAndroidRtlLayout && styles.legendAndroid]}>
          {useAndroidRtlLayout ? (
            <>
              <LegendItem color={colors.text.tertiary} label="الفترة السابقة" />
              <LegendItem color={colors.semantic.danger} label="مصروفات الفترة الحالية" />
              <LegendItem color={colors.brand.green} label="إيرادات الفترة الحالية" />
            </>
          ) : (
            <>
              <LegendItem color={colors.brand.green} label="إيرادات الفترة الحالية" />
              <LegendItem color={colors.semantic.danger} label="مصروفات الفترة الحالية" />
              <LegendItem color={colors.text.tertiary} label="الفترة السابقة" />
            </>
          )}
        </View>
      </View>

      <View style={styles.chart}>
        <MonthGroup
          expenses={point.previousExpenses}
          expensesColor="rgba(124,135,151,0.58)"
          label="يونيو"
          maxValue={maxValue}
          revenue={point.previousRevenue}
          revenueColor="rgba(124,135,151,0.82)"
        />
        <MonthGroup
          expenses={point.currentExpenses}
          expensesColor={colors.semantic.danger}
          label={point.label}
          maxValue={maxValue}
          revenue={point.currentRevenue}
          revenueColor={colors.brand.green}
        />
      </View>
    </SolidCard>
  );
}

function MonthGroup({
  expenses,
  expensesColor,
  label,
  maxValue,
  revenue,
  revenueColor,
}: {
  expenses: number;
  expensesColor: string;
  label: string;
  maxValue: number;
  revenue: number;
  revenueColor: string;
}) {
  return (
    <View style={styles.monthGroup}>
      <View style={styles.bars}>
        <View
          accessibilityLabel={`${label} المصروفات ${expenses}`}
          style={[styles.bar, { backgroundColor: expensesColor, height: getBarHeight(expenses, maxValue) }]}
        />
        <View
          accessibilityLabel={`${label} الإيرادات ${revenue}`}
          style={[styles.bar, { backgroundColor: revenueColor, height: getBarHeight(revenue, maxValue) }]}
        />
      </View>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
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

function SummaryList({ rows, title }: { rows: readonly MonthlyReportListRow[]; title: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleWrapper}>
        <AppText style={styles.sectionTitle} variant="sectionTitle">{title}</AppText>
      </View>
      <SolidCard style={styles.listCard}>
        {rows.map((row, index) => (
          <View key={row.id} style={styles.rowBlock}>
            <View style={[styles.summaryRow, useAndroidRtlLayout && styles.summaryRowAndroid]}>
              <View style={styles.rowLabelSlot}>
                <AppText style={styles.rowLabel} variant="body">
                  {row.label}
                </AppText>
              </View>
              <View style={styles.rowAmountSlot}>
                <NumericText style={styles.rowAmount}>{row.amount}</NumericText>
              </View>
            </View>
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function InterpretationCard() {
  return (
    <SolidCard style={styles.interpretationCard}>
      <View style={[styles.interpretationHeader, useAndroidRtlLayout && styles.interpretationHeaderAndroid]}>
        <View style={styles.aiIcon}>
          <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
        </View>
        <AppText style={styles.interpretationTitle} variant="cardTitle">
          ماذا تعني هذه الأرقام؟
        </AppText>
      </View>
      <AppText style={styles.bodyText} tone="secondary" variant="body">
        {monthlyReportData.interpretation}
      </AppText>
    </SolidCard>
  );
}

function RecommendedActions({
  actions,
  onPress,
}: {
  actions: readonly MonthlyReportAction[];
  onPress: (action: MonthlyReportAction) => void;
}) {
  return (
    <View style={[styles.section, styles.recommendedSection]}>
      <View style={styles.recommendedSectionTitleWrapper}>
        <AppText style={styles.recommendedSectionTitle} variant="sectionTitle">إجراءات موصى بها</AppText>
      </View>
      <View style={styles.recommendedList}>
        {actions.map((action) => (
          <Pressable
            accessibilityRole="button"
            key={action.id}
            onPress={() => onPress(action)}
            style={({ pressed }) => [
              styles.recommendedRow,
              useAndroidRtlLayout && styles.recommendedRowAndroid,
              pressed && styles.pressed,
            ]}
          >
            {useAndroidRtlLayout ? (
              <>
                <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
                <View style={[styles.actionDot, action.accent === 'amber' ? styles.amberDot : styles.greenDot]} />
                <View style={[styles.actionTitle, styles.actionTitleAndroid]}>
                  <AppText style={styles.actionTitleText} variant="body">{action.title}</AppText>
                  <AppText style={styles.actionCaption} tone="secondary" variant="caption">
                    تجريبي
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.actionDot, action.accent === 'amber' ? styles.amberDot : styles.greenDot]} />
                <View style={styles.actionTitle}>
                  <AppText style={styles.actionTitleText} variant="body">{action.title}</AppText>
                  <AppText style={styles.actionCaption} tone="secondary" variant="caption">
                    تجريبي
                  </AppText>
                </View>
                <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
              </>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function getBarHeight(value: number, maxValue: number) {
  return Math.max(22, Math.round((value / maxValue) * chartHeight));
}

function getMetricToneStyle(tone: MonthlyReportMetric['tone']) {
  if (tone === 'success') {
    return styles.successText;
  }

  if (tone === 'danger') {
    return styles.dangerText;
  }

  return styles.neutralText;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerTitle: {
    writingDirection: 'rtl',
    textAlign: 'right',
    width: '100%',
  },
  headerPeriod: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    display: 'none',
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  summaryTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  manualReportBadge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  manualReportBadgeText: {
    color: colors.semantic.warning,
  },
  sourceNoteBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  sourceNoteBoxAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  sourceNoteText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bodyText: {
    alignSelf: 'stretch',
    lineHeight: 26,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  metricGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 118,
    minWidth: 150,
    padding: spacing.md,
  },
  metricLabel: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  metricChange: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  metricSupport: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  successText: {
    color: colors.semantic.success,
  },
  dangerText: {
    color: colors.semantic.danger,
  },
  neutralText: {
    color: colors.text.primary,
  },
  chartCard: {
    gap: spacing.lg,
  },
  cardHeader: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  chartTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  legend: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendAndroid: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
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
    gap: spacing.xl,
    height: 174,
    justifyContent: 'center',
  },
  monthGroup: {
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 86,
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    height: chartHeight,
  },
  bar: {
    borderRadius: radii.chart,
    width: 14,
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
  listCard: {
    gap: spacing.md,
  },
  rowBlock: {
    gap: spacing.md,
  },
  summaryRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  rowLabel: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rowLabelSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  rowAmountSlot: {
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  rowAmount: {
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 21,
    minWidth: 100,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  interpretationCard: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    gap: spacing.md,
  },
  interpretationHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  interpretationHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  interpretationTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  aiIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.18)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  recommendedList: {
    gap: spacing.sm,
  },
  recommendedSection: {
    alignSelf: 'stretch',
    width: '100%',
  },
  recommendedSectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  recommendedSectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  recommendedRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  recommendedRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  actionDot: {
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  greenDot: {
    backgroundColor: colors.semantic.success,
  },
  amberDot: {
    backgroundColor: colors.semantic.warning,
  },
  actionTitle: {
    flex: 1,
    minWidth: 0,
  },
  actionTitleAndroid: {
    alignItems: 'flex-end',
  },
  actionTitleText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  actionCaption: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  bottomActions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  primaryBottomAction: {
    flex: 1.4,
    minHeight: bottomActionsMinHeight,
    paddingHorizontal: spacing.sm,
  },
  secondaryBottomAction: {
    flex: 1,
    minHeight: bottomActionsMinHeight,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
