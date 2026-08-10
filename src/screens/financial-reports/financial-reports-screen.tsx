import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimeRangeSelector } from '@/components/financial';
import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useThemeColors } from '@/state/appearance-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  buildFinancialReportShareText,
  formatComparison,
  formatPercent,
  formatSar,
  formatSignedSar,
  resolveFinancialReportData,
} from './financial-reports-calculations';
import { financialReportCards, financialReportPeriods } from './financial-reports-data';
import type { FinancialReportPeriod, FinancialReportStatus, FinancialReportType } from './financial-reports-types';

const statusLabel: Record<FinancialReportStatus, string> = {
  profitable: 'مربح',
  'near-break-even': 'متعادل تقريبًا',
  loss: 'خاسر',
};

export function FinancialReportsScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const [period, setPeriod] = useState<FinancialReportPeriod>('current-month');
  const { transactions } = useTransactionsStore();
  const report = useMemo(() => resolveFinancialReportData(period, transactions), [period, transactions]);

  function openReport(type: FinancialReportType) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.financialReportDetail, params: { reportType: type, period } });
  }

  async function shareReport() {
    await Share.share({
      message: buildFinancialReportShareText(report),
      title: 'ملخص Capital المالي',
    });
  }

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
        <ReportHeader onBack={() => router.back()} subtitle="افهم دخل نشاطك ومصروفاته والصافي التشغيلي من العمليات المسجلة." title="التقارير المالية" />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 48, spacing.screenBottom + spacing.md) }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <TimeRangeSelector options={financialReportPeriods} selectedValue={period} onSelect={setPeriod} />
        <NoticeCard />
        <SummaryCard periodLabel={report.periodLabel} report={report} />
        <InsightCard text={report.insight} />
        <View style={styles.sectionHeader}>
          <AppText style={styles.rtlText} variant="sectionTitle">أنواع التقارير</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="supporting">
            افتح أي تقرير لمراجعة التفاصيل.
          </AppText>
        </View>
        <View style={styles.reportGrid}>
          {financialReportCards.map((card) => (
            <Pressable
              accessibilityLabel={card.title}
              accessibilityRole="button"
              key={card.type}
              onPress={() => openReport(card.type)}
              style={({ pressed }) => [styles.reportCard, pressed && styles.pressed]}
            >
              <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} style={styles.reportChevron} />
              <View style={styles.reportCopy}>
                <AppText style={styles.rtlText} variant="cardTitle">{card.title}</AppText>
                <AppText style={styles.rtlText} tone="secondary" variant="supporting">
                  {card.description}
                </AppText>
              </View>
              <View style={styles.reportIcon}>
                <Ionicons color={colors.brand.calmGreen} name={card.icon} size={21} />
              </View>
            </Pressable>
          ))}
        </View>
        <View style={styles.actions}>
          <AppButton onPress={() => router.push({ pathname: routes.financialReportPreview, params: { period } })} variant="secondary">
            معاينة الملخص
          </AppButton>
          <AppButton onPress={shareReport}>مشاركة الملخص</AppButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ReportHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-back-outline"
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="right" style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="right" style={styles.headerSubtitle} tone="secondary" variant="supporting">
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function NoticeCard() {
  return (
    <View style={styles.notice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.noticeText} variant="supporting">
        تعتمد هذه التقارير على العمليات المسجلة يدويًا خلال الفترة المختارة.
      </AppText>
    </View>
  );
}

function SummaryCard({ periodLabel, report }: { periodLabel: string; report: ReturnType<typeof resolveFinancialReportData> }) {
  const metrics = [
    { label: 'إجمالي الدخل', value: formatSar(report.summary.totalRevenue), comparison: report.summary.revenueComparison },
    { label: 'إجمالي المصروفات', value: formatSar(report.summary.totalExpenses), comparison: report.summary.expensesComparison },
    { label: 'الصافي التشغيلي', value: formatSignedSar(report.summary.netProfit), comparison: report.summary.profitComparison },
    { label: 'هامش الصافي التشغيلي', value: formatPercent(report.summary.netProfitMargin) },
    { label: 'عمليات الدخل', value: report.summary.incomeCount.toLocaleString('en-US') },
    { label: 'عمليات المصروف', value: report.summary.expenseCount.toLocaleString('en-US') },
    { label: 'إجمالي العمليات', value: report.summary.transactionCount.toLocaleString('en-US') },
  ];

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <View style={styles.summaryBadge}>
          <AppText align="center" style={styles.summaryBadgeText} variant="caption">
            {statusLabel[report.summary.status]}
          </AppText>
        </View>
        <View style={styles.summaryCopy}>
          <AppText style={styles.rtlText} variant="sectionTitle">ملخص التقارير المالية</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="supporting">
            {periodLabel}
          </AppText>
        </View>
      </View>
      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricBox}>
            <AppText style={styles.rtlText} tone="secondary" variant="caption">
              {metric.label}
            </AppText>
            <AppText
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              numberOfLines={1}
              style={styles.metricValue}
              variant="cardTitle"
            >
              {directionSafeText(metric.value)}
            </AppText>
            {'comparison' in metric && metric.comparison ? (
              <AppText style={styles.rtlText} tone={metric.comparison.direction === 'down' ? 'warning' : metric.comparison.direction === 'unavailable' ? 'tertiary' : 'success'} variant="caption">
                {formatComparison(metric.comparison)}
              </AppText>
            ) : null}
          </View>
        ))}
      </View>
    </SolidCard>
  );
}

function InsightCard({ text }: { text: string }) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightIcon}>
        <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={19} />
      </View>
      <AppText style={styles.insightText} variant="body">
        {directionSafeText(text)}
      </AppText>
    </View>
  );
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
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 25,
    lineHeight: 34,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  notice: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,43,72,0.32)',
    borderColor: 'rgba(46,142,217,0.24)',
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.text.muted,
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryTop: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  summaryBadgeText: {
    color: colors.brand.calmGreen,
  },
  metricGrid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 86,
    minWidth: 0,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text.primary,
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  insightCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.card,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.lg,
  },
  insightIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  insightText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    width: '100%',
  },
  reportGrid: {
    gap: spacing.md,
  },
  reportCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 94,
    padding: spacing.lg,
  },
  reportIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    flexShrink: 0,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  reportCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  reportChevron: {
    flexShrink: 0,
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
