import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { getBudgetSummary, toneColors } from './budget-utils';
import { BottomConfirmSheet, BudgetHeader, BudgetProgressBar, BudgetStatusBadge } from './components';
import { deleteBudget, useBudgetsStore } from './budgets-store';
import { initialBudgets, recentMarketingExpenses } from './budgets-data';

export function BudgetDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { budgets } = useBudgetsStore();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const budget = budgets.find((item) => item.id === params.id) ?? budgets[0] ?? initialBudgets[0]!;
  const summary = useMemo(() => getBudgetSummary(budget), [budget]);
  const beforeAlert = summary.alertAmount - summary.spent;

  function handleDelete() {
    deleteBudget(summary.id);
    setDeleteVisible(false);
    router.replace(routes.budgets);
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
            paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top + spacing.sm, 48),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <BudgetHeader onBack={() => router.back()} title="تفاصيل الميزانية" />

        <SolidCard style={styles.identityCard}>
          <View style={[styles.categoryIcon, { backgroundColor: toneColors[summary.status.tone].tint }]}>
            <Ionicons color={toneColors[summary.status.tone].accent} name={summary.category.icon} size={22} />
          </View>
          <View style={styles.identityCopy}>
            <AppText style={styles.identityTitle} variant="sectionTitle">{summary.category.name}</AppText>
            <AppText style={styles.identityTitle} tone="secondary" variant="caption">
              {summary.month}
            </AppText>
          </View>
          <BudgetStatusBadge label={summary.status.label} tone={summary.status.tone} />
        </SolidCard>

        <SolidCard style={styles.summaryCard}>
          <View style={styles.summaryMetrics}>
            <Metric label="إجمالي الميزانية" value={summary.budget} />
            <Metric label="المصروف" value={summary.spent} />
            <Metric label="المتبقي" tone={summary.status.tone} value={summary.remaining} />
          </View>
          <View style={[styles.usageRow, Platform.OS !== 'web' && styles.usageRowAndroid]}>
            {Platform.OS !== 'web' ? (
              <>
                <AppText style={[styles.usageValueAndroid, { color: toneColors[summary.status.tone].text }]} variant="caption">
                  {summary.usage}%
                </AppText>
                <AppText style={styles.usageLabelAndroid} tone="secondary" variant="caption">
                  نسبة الاستخدام
                </AppText>
              </>
            ) : (
              <>
                <AppText tone="secondary" variant="caption">
                  نسبة الاستخدام
                </AppText>
                <AppText style={{ color: toneColors[summary.status.tone].text }} variant="caption">
                  {summary.usage}%
                </AppText>
              </>
            )}
          </View>
          <BudgetProgressBar androidPhysicalLeft marker={summary.alertThreshold} tone={summary.status.tone} usage={summary.usage} />
        </SolidCard>

        <SolidCard style={styles.progressDetailCard}>
          <View style={styles.progressLabels}>
            <AppText align="left" tone="secondary" variant="caption">
              حد الميزانية
            </AppText>
            <AppText align="center" tone="secondary" variant="caption">
              حد التنبيه
            </AppText>
            <AppText tone="secondary" variant="caption">
              المصروف الحالي
            </AppText>
          </View>
          <BudgetProgressBar androidPhysicalLeft marker={summary.alertThreshold} tone={summary.status.tone} usage={summary.usage} />
          <AppText align="center" variant="caption">
            {directionSafeText(`متبقي ${beforeAlert.toLocaleString('en-US')} ر.س قبل الوصول إلى حد التنبيه`)}
          </AppText>
        </SolidCard>

        <InfoCard summary={summary} />
        <ExpensesCard />
        <InsightCard summary={summary} />

        <AppButton iconName="create-outline" onPress={() => router.push({ pathname: routes.editBudget, params: { id: summary.id } })}>
          تعديل الميزانية
        </AppButton>
        <AppButton iconName="trash-outline" onPress={() => setDeleteVisible(true)} variant="danger">
          حذف الميزانية
        </AppButton>
      </ScrollView>

      <BottomConfirmSheet
        danger
        description={`سيتم حذف ميزانية ${summary.category.name} لشهر يوليو، ولن يتم حذف المصروفات المسجلة.`}
        onPrimaryPress={handleDelete}
        onSecondaryPress={() => setDeleteVisible(false)}
        primaryLabel="حذف الميزانية"
        secondaryLabel="إلغاء"
        title="حذف الميزانية؟"
        visible={deleteVisible}
      />
    </View>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: keyof typeof toneColors }) {
  return (
    <View style={styles.metric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText
        adjustsFontSizeToFit
        align="center"
        minimumFontScale={0.82}
        numberOfLines={1}
        style={[styles.metricValue, tone && { color: toneColors[tone].text }]}
        variant="caption"
      >
        {directionSafeText(`${value.toLocaleString('en-US')} ر.س`)}
      </AppText>
    </View>
  );
}

function InfoCard({ summary }: { summary: ReturnType<typeof getBudgetSummary> }) {
  const rows: [string, string][] = [
    ['الفئة', summary.category.name],
    ['الشهر', summary.month],
    ['مبلغ الميزانية', `${summary.budget.toLocaleString('en-US')} ر.س`],
    ['تنبيه الاقتراب', `${summary.alertThreshold}%`],
    ['حالة التنبيه', summary.alertEnabled ? 'مفعل' : 'غير مفعل'],
    ['تاريخ الإنشاء', summary.createdAt],
  ];

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle} variant="cardTitle">معلومات الميزانية</AppText>
      <SolidCard style={styles.infoCard}>
        {rows.map(([label, value], index) => (
          <View key={label}>
            <View style={styles.infoRow}>
              <AppText style={styles.infoLabel} tone="secondary" variant="caption">
                {label}
              </AppText>
              <AppText align="left" style={styles.infoValue} variant="caption">
                {directionSafeText(value)}
              </AppText>
            </View>
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ExpensesCard() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionHeaderTitle} variant="cardTitle">المصروفات الأخيرة</AppText>
        <AppText style={styles.linkText} variant="caption">
          عرض كل المصروفات
        </AppText>
      </View>
      <SolidCard style={styles.expensesCard}>
        {recentMarketingExpenses.map((expense, index) => (
          <View key={expense.id}>
            <View style={[styles.expenseRow, Platform.OS !== 'web' && styles.expenseRowAndroid]}>
              {Platform.OS !== 'web' ? (
                <>
                  <View style={styles.expenseIcon}>
                    <Ionicons color={colors.text.tertiary} name="megaphone-outline" size={16} />
                  </View>
                  <AppText align="left" style={[styles.expenseAmount, styles.expenseAmountAndroid]} variant="caption">
                    {directionSafeText(`-${expense.amount.toLocaleString('en-US')} ر.س`)}
                  </AppText>
                  <View style={styles.expenseSpacerAndroid} />
                  <View style={[styles.expenseCopy, styles.expenseCopyAndroid]}>
                    <AppText style={styles.expenseTitleAndroid} variant="cardTitle">
                      {expense.title}
                    </AppText>
                    <AppText style={styles.expenseDateAndroid} tone="secondary" variant="caption">
                      {expense.date}
                    </AppText>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.expenseIcon}>
                    <Ionicons color={colors.text.tertiary} name="megaphone-outline" size={16} />
                  </View>
                  <View style={styles.expenseCopy}>
                    <AppText variant="cardTitle">{expense.title}</AppText>
                    <AppText tone="secondary" variant="caption">
                      {expense.date}
                    </AppText>
                  </View>
                  <AppText align="left" style={styles.expenseAmount} variant="caption">
                    {directionSafeText(`-${expense.amount.toLocaleString('en-US')} ر.س`)}
                  </AppText>
                </>
              )}
            </View>
            {index < recentMarketingExpenses.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function InsightCard({ summary }: { summary: ReturnType<typeof getBudgetSummary> }) {
  const insightIcon = <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={17} />;
  const insightTitle = (
    <AppText style={Platform.OS !== 'web' ? styles.insightTitleAndroid : undefined} variant="cardTitle">
      معدل إنفاقك الحالي
    </AppText>
  );
  const prototypeBadge = (
    <View style={[styles.prototypeBadge, Platform.OS !== 'web' && styles.prototypeBadgeAndroid]}>
      <AppText align={Platform.OS !== 'web' ? 'right' : 'center'} style={Platform.OS !== 'web' ? styles.prototypeTextAndroid : undefined} variant="caption">
        تقدير تجريبي
      </AppText>
    </View>
  );

  return (
    <SolidCard style={styles.insightCard}>
      <View style={[styles.insightHeader, Platform.OS !== 'web' && styles.insightHeaderAndroid]}>
        {Platform.OS !== 'web' ? (
          <>
            {insightIcon}
            <View style={styles.insightHeaderCopyAndroid}>
              <View style={styles.insightTitleGroupAndroid}>
                {prototypeBadge}
                {insightTitle}
              </View>
            </View>
          </>
        ) : (
          <>
            {insightIcon}
            {insightTitle}
            {prototypeBadge}
          </>
        )}
      </View>
      <AppText style={Platform.OS !== 'web' ? styles.insightTextAndroid : undefined} variant="body">
        {directionSafeText(`أنفقت ${summary.usage}% من ميزانية ${summary.category.name}، ويتبقى ${summary.remaining.toLocaleString('en-US')} ر.س حتى نهاية الشهر.`)}
      </AppText>
      <AppText style={Platform.OS !== 'web' ? styles.insightTextAndroid : undefined} variant="body">
        بناءً على وتيرة الإنفاق الحالية، قد تصل إلى 92% من الميزانية بنهاية يوليو.
      </AppText>
      <View style={[styles.recommendationBox, Platform.OS !== 'web' && styles.recommendationBoxAndroid]}>
        <AppText style={[styles.linkText, Platform.OS !== 'web' && styles.insightTextAndroid]} variant="supporting">
          خفّض الإنفاق اليومي المتبقي إلى 150 ر.س للحفاظ على الميزانية.
        </AppText>
      </View>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  identityCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  identityCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  identityTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryMetrics: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  metric: {
    alignItems: 'center',
    borderLeftColor: colors.surface.separator,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  metricValue: {
    color: colors.text.primary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    writingDirection: 'ltr',
  },
  usageRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  usageRowAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  usageLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  usageValueAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  progressDetailCard: {
    gap: spacing.md,
  },
  progressLabels: {
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    alignSelf: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionHeaderTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoCard: {
    gap: spacing.md,
  },
  infoRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 34,
    width: '100%',
  },
  infoLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    color: colors.text.primary,
    flexShrink: 1,
    fontWeight: '700',
    maxWidth: '58%',
    minWidth: 0,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  expensesCard: {
    gap: spacing.md,
  },
  expenseRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 52,
  },
  expenseRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  expenseIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  expenseCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  expenseCopyAndroid: {
    alignItems: 'flex-end',
  },
  expenseSpacerAndroid: {
    flex: 0.25,
    minWidth: spacing.xs,
  },
  expenseTitleAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  expenseDateAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  expenseAmount: {
    color: colors.semantic.danger,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  expenseAmountAndroid: {
    flexShrink: 0,
    textAlign: 'left',
  },
  insightCard: {
    backgroundColor: 'rgba(4,24,40,0.78)',
    borderColor: 'rgba(44,159,224,0.22)',
    gap: spacing.md,
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  insightHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  insightHeaderCopyAndroid: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  insightTitleGroupAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  insightTitleAndroid: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  insightTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  prototypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    marginRight: 'auto',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  prototypeBadgeAndroid: {
    marginRight: 0,
  },
  prototypeTextAndroid: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  recommendationBox: {
    backgroundColor: 'rgba(44,159,224,0.12)',
    borderRadius: radii.control,
    padding: spacing.md,
  },
  recommendationBoxAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  linkText: {
    color: colors.brand.calmGreen,
  },
});
