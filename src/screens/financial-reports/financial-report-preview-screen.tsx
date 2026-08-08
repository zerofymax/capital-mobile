import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useThemeColors } from '@/state/appearance-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  buildFinancialReportShareText,
  formatPercent,
  formatSar,
  formatSignedSar,
  resolveFinancialReportData,
} from './financial-reports-calculations';
import { normalizeFinancialReportPeriod } from './financial-reports-data';
import { ReportHeader } from './financial-reports-screen';

export function FinancialReportPreviewScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const params = useLocalSearchParams<{ period?: string }>();
  const period = normalizeFinancialReportPeriod(params.period);
  const { transactions } = useTransactionsStore();
  const report = useMemo(() => resolveFinancialReportData(period, transactions), [period, transactions]);
  const topExpenses = report.expenseReport.categories.slice(0, 3);

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
        <ReportHeader onBack={() => router.back()} subtitle="نسخة نصية مبسطة قبل المشاركة." title="معاينة الملخص" />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 48, spacing.screenBottom + spacing.md) }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <SolidCard style={styles.previewCard}>
          <View style={styles.previewTop}>
            <View style={styles.previewIcon}>
              <Ionicons color={colors.brand.calmGreen} name="document-text-outline" size={21} />
            </View>
            <View style={styles.previewTitle}>
              <AppText style={styles.rtlText} variant="sectionTitle">ملخص Capital المالي</AppText>
              <AppText style={styles.rtlText} tone="secondary" variant="supporting">
                {report.periodLabel}
              </AppText>
            </View>
          </View>
          <PreviewRow label="الدخل" value={formatSar(report.summary.totalRevenue)} />
          <PreviewRow label="المصروفات" value={formatSar(report.summary.totalExpenses)} />
          <PreviewRow label="الصافي التشغيلي" value={formatSignedSar(report.summary.netProfit)} />
          <PreviewRow label="هامش الصافي التشغيلي" value={formatPercent(report.summary.netProfitMargin)} />
          <PreviewRow label="صافي التدفق التشغيلي المحلي" value={formatSignedSar(report.summary.netCashFlow)} />
        </SolidCard>

        <SolidCard style={styles.previewCard}>
          <AppText style={styles.sectionTitle} variant="sectionTitle">أكبر ثلاثة تصنيفات مصروفات</AppText>
          {topExpenses.length > 0 ? (
            topExpenses.map((expense) => <PreviewRow key={expense.id} label={expense.category} value={formatSar(expense.amount)} />)
          ) : (
            <AppText tone="secondary" variant="supporting">
              لا توجد مصروفات في هذه الفترة.
            </AppText>
          )}
        </SolidCard>

        <View style={styles.insightCard}>
          <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
          <AppText style={styles.insightText} variant="body">
            {directionSafeText(report.insight)}
          </AppText>
        </View>

        <AppButton onPress={shareReport}>مشاركة الملخص</AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <AppText style={styles.previewLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <AppText style={styles.previewValue} variant="cardTitle">
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
  headerWrap: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  previewCard: {
    gap: spacing.md,
  },
  previewTop: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  previewTitle: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  previewRow: {
    alignItems: 'center',
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    width: '100%',
  },
  previewLabel: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewValue: {
    color: colors.text.primary,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  insightCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.card,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.lg,
  },
  insightText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
