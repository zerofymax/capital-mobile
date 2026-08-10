import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, SolidCard } from '@/components/ui';
import { useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useThemeColors } from '@/state/appearance-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  formatComparison,
  formatPercent,
  formatSar,
  formatSignedSar,
  resolveFinancialReportData,
  safePercentage,
} from './financial-reports-calculations';
import { financialReportCards, normalizeFinancialReportPeriod } from './financial-reports-data';
import type {
  CashFlowLine,
  ExpenseCategorySummary,
  FinancialReportType,
  IncomeStatementLine,
  ResolvedFinancialReportData,
} from './financial-reports-types';
import { ReportHeader } from './financial-reports-screen';

const reportTitles: Record<FinancialReportType, { title: string; subtitle: string }> = {
  'income-statement': {
    title: 'قائمة الدخل',
    subtitle: 'تعرف على الإيرادات والمصروفات والصافي التشغيلي.',
  },
  'cash-flow': {
    title: 'التدفق التشغيلي المحلي',
    subtitle: 'راقب الداخل والخارج من العمليات اليدوية المسجلة فقط.',
  },
  'expense-analysis': {
    title: 'تحليل المصروفات',
    subtitle: 'راجع التصنيفات الأعلى تكلفة وفرص ضبط الإنفاق.',
  },
  'financial-trend': {
    title: 'الاتجاه المالي',
    subtitle: 'قارن الدخل والمصروفات والصافي حسب الأشهر.',
  },
};

export function FinancialReportDetailScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const params = useLocalSearchParams<{ reportType?: string; period?: string }>();
  const period = normalizeFinancialReportPeriod(params.period);
  const reportType = normalizeReportType(params.reportType);
  const { transactions } = useTransactionsStore();
  const report = useMemo(() => resolveFinancialReportData(period, transactions), [period, transactions]);
  const title = reportTitles[reportType];

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: themeColors.background.base }]}>
      <LinearGradient
        colors={[themeColors.background.heroStart, themeColors.background.base, themeColors.background.base]}
        end={{ x: 0.65, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.35, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerWrap}>
        <ReportHeader onBack={() => router.back()} subtitle={title.subtitle} title={title.title} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 48, spacing.screenBottom + spacing.md) }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <ReportPeriodPill label={report.periodLabel} />
        {reportType === 'income-statement' ? <IncomeStatementReport report={report} /> : null}
        {reportType === 'cash-flow' ? <CashFlowReport report={report} /> : null}
        {reportType === 'expense-analysis' ? <ExpenseAnalysisReport report={report} /> : null}
        {reportType === 'financial-trend' ? <FinancialTrendReport report={report} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function IncomeStatementReport({ report }: { report: ResolvedFinancialReportData }) {
  return (
    <>
      <LineSection lines={report.incomeStatement.revenue} title="الإيرادات" totalLabel="إجمالي الإيرادات" totalValue={report.incomeStatement.totalRevenue} />
      <LineSection
        lines={report.incomeStatement.operatingExpenses}
        emptyMessage="لا توجد مصروفات مسجلة خلال هذه الفترة."
        title="المصروفات"
        totalLabel="إجمالي المصروفات"
        totalValue={report.incomeStatement.totalOperatingExpenses}
      />
      <ResultCard
        highlight
        items={[
          { label: 'الصافي التشغيلي', value: formatSignedSar(report.incomeStatement.netProfit) },
          { label: 'هامش الصافي التشغيلي', value: formatPercent(report.incomeStatement.netProfitMargin) },
        ]}
      />
      <ExplanationCard
        text="قائمة تشغيلية محلية مبنية على العمليات المسجلة، وليست قائمة مالية محاسبية معتمدة."
        title="كيف تقرأ قائمة الدخل؟"
      />
    </>
  );
}

function CashFlowReport({ report }: { report: ResolvedFinancialReportData }) {
  return (
    <>
      <ResultCard
        highlight={report.cashFlow.netCashFlow >= 0}
        items={[
          { label: 'التدفقات الداخلة', value: formatSar(report.cashFlow.totalInflows) },
          { label: 'التدفقات الخارجة', value: formatSar(report.cashFlow.totalOutflows) },
          { label: 'صافي التدفق التشغيلي المحلي', value: formatSignedSar(report.cashFlow.netCashFlow) },
          { label: 'عدد العمليات الداخلة', value: report.summary.incomeCount.toLocaleString('en-US') },
          { label: 'عدد العمليات الخارجة', value: report.summary.expenseCount.toLocaleString('en-US') },
        ]}
      />
      <CashFlowLineSection lines={report.cashFlow.inflows} title="مصادر النقد الداخل" />
      <CashFlowLineSection lines={report.cashFlow.outflows} title="النقد الخارج" danger />
      <ExplanationCard
        text="هذا العرض مبني على العمليات المسجلة فقط، ولا يمثل حركة الحسابات البنكية أو الرصيد النقدي الفعلي."
        title="ماذا يعني التدفق التشغيلي المحلي؟"
      />
    </>
  );
}

function ExpenseAnalysisReport({ report }: { report: ResolvedFinancialReportData }) {
  return (
    <>
      <ResultCard
        items={[
          { label: 'إجمالي المصروفات الفعلية', value: formatSar(report.expenseReport.totalExpenses) },
          { label: 'عدد عمليات المصروف', value: report.expenseReport.expenseCount.toLocaleString('en-US') },
          { label: 'أكبر فئة مصروفات', value: report.expenseReport.topCategory?.category ?? 'غير متاح' },
          { label: 'متوسط عملية المصروف', value: formatSar(report.expenseReport.averageExpense) },
        ]}
      />
      <SolidCard style={styles.cardGap}>
        <AppText style={styles.sectionTitle} variant="sectionTitle">المصروفات حسب التصنيف</AppText>
        {report.expenseReport.categories.length === 0 ? (
          <EmptyState />
        ) : (
          report.expenseReport.categories.map((category) => <ExpenseCategoryRow category={category} key={category.id} />)
        )}
      </SolidCard>
      <ExplanationCard
        text="تحليل المصروفات يساعدك على معرفة التصنيفات التي تستهلك أكبر جزء من المصروفات اليدوية المسجلة خلال الفترة."
        title="ماذا يعني تحليل المصروفات؟"
      />
    </>
  );
}

function FinancialTrendReport({ report }: { report: ResolvedFinancialReportData }) {
  const trend = report.monthlyTrend;
  const trendValues = trend.flatMap((item) => [item.revenue, item.expenses, Math.abs(item.netProfit)]).filter(Number.isFinite);
  const maxValue = Math.max(...trendValues, 1);
  const firstMonth = trend[0] ?? null;
  const lastMonth = trend.at(-1) ?? null;
  const revenueGrowth = calculateTrendGrowth(firstMonth?.revenue, lastMonth?.revenue);
  const expenseGrowth = calculateTrendGrowth(firstMonth?.expenses, lastMonth?.expenses);
  const netProfitChange = calculateTrendNetProfitChange(trend);
  const bestMonth = [...trend].sort((first, second) => second.netProfit - first.netProfit)[0] ?? null;
  const highestExpenseMonth = [...trend].sort((first, second) => second.expenses - first.expenses)[0] ?? null;

  return (
    <>
      <SolidCard style={styles.cardGap}>
        <View style={styles.trendLegend}>
          <Legend color={colors.brand.calmGreen} label="الإيرادات" />
          <Legend color={colors.semantic.warning} label="المصروفات" />
          <Legend color="#4CA3FF" label="الصافي التشغيلي" />
        </View>
        <View style={styles.trendChart}>
          {trend.map((month) => (
            <View key={month.id} style={styles.trendColumn}>
              <View style={styles.trendBars}>
                <View style={[styles.trendBar, { backgroundColor: colors.brand.calmGreen, height: barHeight(month.revenue, maxValue) }]} />
                <View style={[styles.trendBar, { backgroundColor: colors.semantic.warning, height: barHeight(month.expenses, maxValue) }]} />
                <View style={[styles.trendBar, { backgroundColor: '#4CA3FF', height: barHeight(month.netProfit, maxValue) }]} />
              </View>
              <AppText align="center" tone="secondary" variant="caption">
                {month.month}
              </AppText>
            </View>
          ))}
        </View>
      </SolidCard>
      <ResultCard
        compact
        items={[
          { label: 'نمو الإيرادات', value: formatPercent(revenueGrowth) },
          { label: 'نمو المصروفات', value: formatPercent(expenseGrowth) },
          { label: 'تغير الصافي التشغيلي', value: formatSignedSar(netProfitChange) },
          { label: 'أفضل شهر', value: bestMonth?.month ?? 'غير متاح' },
          { label: 'أعلى شهر مصروفات', value: highestExpenseMonth?.month ?? 'غير متاح' },
        ]}
      />
      <ExplanationCard
        text={report.summary.netProfit > 0 ? 'الدخل المسجل أعلى من المصروفات داخل الفترة المختارة، ما جعل الصافي التشغيلي موجبًا.' : 'المصروفات المسجلة أعلى من الدخل داخل الفترة المختارة، وينصح بمراجعة التصنيفات الأعلى تكلفة.'}
        title="استنتاج الاتجاه"
      />
    </>
  );
}

function ReportPeriodPill({ label }: { label: string }) {
  return (
    <View style={styles.periodPill}>
      <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={16} />
      <AppText style={styles.periodLabel} variant="caption">{label}</AppText>
    </View>
  );
}

function LineSection({
  title,
  lines,
  totalLabel,
  totalValue,
  emptyMessage = 'لا توجد إيرادات مسجلة خلال هذه الفترة.',
}: {
  title: string;
  lines: IncomeStatementLine[];
  totalLabel: string;
  totalValue: number;
  emptyMessage?: string;
}) {
  return (
    <SolidCard style={styles.cardGap}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">{title}</AppText>
      {lines.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        lines.map((line) => (
          <View key={line.id} style={styles.lineRow}>
            <View style={styles.lineCopy}>
              <AppText style={styles.rtlText} variant="cardTitle">{line.label}</AppText>
              <AppText style={styles.rtlText} tone="secondary" variant="caption">
                {`${line.transactionCount.toLocaleString('en-US')} عملية · ${formatComparison(line.comparison)}`}
              </AppText>
            </View>
            <AppText adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.lineValue} variant="cardTitle">
              {formatSar(line.amount)}
            </AppText>
          </View>
        ))
      )}
      <View style={styles.totalRow}>
        <AppText style={styles.rowLabel} variant="cardTitle">{totalLabel}</AppText>
        <AppText adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.totalValue} variant="sectionTitle">
          {formatSar(totalValue)}
        </AppText>
      </View>
    </SolidCard>
  );
}

function CashFlowLineSection({ title, lines, danger }: { title: string; lines: CashFlowLine[]; danger?: boolean }) {
  return (
    <SolidCard style={styles.cardGap}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">{title}</AppText>
      {lines.length === 0 ? (
        <EmptyState message={danger ? 'لا توجد مصروفات مسجلة خلال هذه الفترة.' : 'لا توجد إيرادات مسجلة خلال هذه الفترة.'} />
      ) : (
        lines.map((line) => (
          <View key={line.id} style={styles.lineRow}>
            <View style={styles.lineCopy}>
              <AppText style={styles.rtlText} variant="cardTitle">{line.label}</AppText>
              <AppText style={styles.rtlText} tone="secondary" variant="caption">
                {`${line.transactionCount.toLocaleString('en-US')} عملية · ${formatComparison(line.comparison)}`}
              </AppText>
            </View>
            <AppText adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.lineValue, danger && styles.warningValue]} variant="cardTitle">
              {formatSar(line.amount)}
            </AppText>
          </View>
        ))
      )}
    </SolidCard>
  );
}

function ResultCard({
  items,
  highlight,
  compact = false,
}: {
  items: readonly { label: string; value: string }[];
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <SolidCard style={[styles.resultCard, compact && styles.compactResultCard, highlight && styles.highlightCard]}>
      {items.map((item) => (
        <View key={item.label} style={[styles.resultRow, compact && styles.compactResultRow]}>
          <AppText style={styles.rowLabel} tone="secondary" variant="supporting">
            {item.label}
          </AppText>
          <AppText adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.resultValue} variant="cardTitle">
            {directionSafeText(item.value)}
          </AppText>
        </View>
      ))}
    </SolidCard>
  );
}

function ExpenseCategoryRow({ category }: { category: ExpenseCategorySummary }) {
  const progress = Math.max(0, Math.min(category.percentage ?? 0, 100));

  return (
    <View style={styles.categoryRow}>
      <View style={styles.lineRow}>
        <View style={styles.lineCopy}>
          <AppText style={styles.rtlText} variant="cardTitle">{category.category}</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="caption">
            {`${category.transactionCount.toLocaleString('en-US')} عملية`}
          </AppText>
        </View>
        <View style={styles.categoryAmount}>
          <AppText adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.lineValue} variant="cardTitle">
            {formatSar(category.amount)}
          </AppText>
          <AppText style={styles.numericText} tone="secondary" variant="caption">
            {formatPercent(category.percentage)}
          </AppText>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

function ExplanationCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.explanationCard}>
      <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
      <View style={styles.explanationCopy}>
        <AppText style={styles.rtlText} variant="cardTitle">{title}</AppText>
        <AppText style={styles.rtlText} tone="secondary" variant="body">
          {directionSafeText(text)}
        </AppText>
      </View>
    </View>
  );
}

function EmptyState({ message = 'لا توجد عمليات مسجلة خلال هذه الفترة.' }: { message?: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons color={colors.text.tertiary} name="file-tray-outline" size={24} />
      <AppText align="center" variant="cardTitle">
        لا توجد بيانات لهذه الفترة
      </AppText>
      <AppText align="center" tone="secondary" variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText style={styles.legendText} tone="secondary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function normalizeReportType(value: unknown): FinancialReportType {
  const routeType = Array.isArray(value) ? value[0] : value;

  return financialReportCards.some((card) => card.type === routeType) ? (routeType as FinancialReportType) : 'income-statement';
}

function calculateTrendGrowth(firstValue: number | null | undefined, lastValue: number | null | undefined) {
  if (!Number.isFinite(firstValue) || !Number.isFinite(lastValue)) {
    return null;
  }

  return safePercentage(Number(lastValue) - Number(firstValue), Number(firstValue));
}

function calculateTrendNetProfitChange(trend: ResolvedFinancialReportData['monthlyTrend']) {
  if (trend.length < 2) {
    return null;
  }

  const firstMonth = trend[0];
  const lastMonth = trend.at(-1);

  if (!firstMonth || !lastMonth || !Number.isFinite(firstMonth.netProfit) || !Number.isFinite(lastMonth.netProfit)) {
    return null;
  }

  return lastMonth.netProfit - firstMonth.netProfit;
}

function barHeight(value: number, maxValue: number) {
  const ratio = Math.max(0, Math.min(Math.abs(value) / Math.max(maxValue, 1), 1));

  return 12 + ratio * 60;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
    overflow: 'hidden',
  },
  headerWrap: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  periodPill: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  periodLabel: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardGap: {
    gap: spacing.md,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  lineRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  lineCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  lineValue: {
    color: colors.brand.lightNeutral,
    flexShrink: 1,
    maxWidth: '48%',
    minWidth: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  warningValue: {
    color: colors.semantic.warning,
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalValue: {
    color: colors.brand.calmGreen,
    flexShrink: 1,
    maxWidth: '48%',
    minWidth: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  resultCard: {
    gap: spacing.md,
  },
  compactResultCard: {
    gap: spacing.sm,
  },
  highlightCard: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
  },
  resultRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  compactResultRow: {
    minHeight: 32,
    paddingVertical: spacing.xxs,
  },
  resultValue: {
    color: colors.text.primary,
    flexShrink: 1,
    maxWidth: '48%',
    minWidth: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  numericText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  categoryRow: {
    gap: spacing.sm,
  },
  categoryAmount: {
    alignItems: 'flex-start',
    flexShrink: 1,
    gap: spacing.xs,
    maxWidth: '48%',
    minWidth: 0,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: '100%',
  },
  trendLegend: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  legendItem: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.xs,
  },
  legendDot: {
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  legendText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  trendChart: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 104,
  },
  trendColumn: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  trendBars: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 78,
    justifyContent: 'center',
  },
  trendBar: {
    borderRadius: radii.pill,
    width: 7,
  },
  explanationCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,43,72,0.32)',
    borderColor: 'rgba(46,142,217,0.22)',
    borderRadius: radii.card,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.lg,
  },
  explanationCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
