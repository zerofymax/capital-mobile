import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
            paddingTop: Math.max(insets.top + spacing.sm, 48),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <BudgetHeader onBack={() => router.back()} title="تفاصيل الميزانية" />

        <SolidCard style={styles.identityCard}>
          <View style={[styles.categoryIcon, { backgroundColor: toneColors[summary.status.tone].tint }]}>
            <Ionicons color={toneColors[summary.status.tone].accent} name={summary.category.icon} size={22} />
          </View>
          <View style={styles.identityCopy}>
            <AppText variant="sectionTitle">{summary.category.name}</AppText>
            <AppText tone="secondary" variant="caption">
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
          <View style={styles.usageRow}>
            <AppText tone="secondary" variant="caption">
              نسبة الاستخدام
            </AppText>
            <AppText style={{ color: toneColors[summary.status.tone].text }} variant="caption">
              {summary.usage}%
            </AppText>
          </View>
          <BudgetProgressBar marker={summary.alertThreshold} tone={summary.status.tone} usage={summary.usage} />
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
          <BudgetProgressBar marker={summary.alertThreshold} tone={summary.status.tone} usage={summary.usage} />
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
      <AppText align="center" style={[styles.metricValue, tone && { color: toneColors[tone].text }]} variant="caption">
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
      <AppText variant="cardTitle">معلومات الميزانية</AppText>
      <SolidCard style={styles.infoCard}>
        {rows.map(([label, value], index) => (
          <View key={label}>
            <View style={styles.infoRow}>
              <AppText tone="secondary" variant="caption">
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
        <AppText variant="cardTitle">المصروفات الأخيرة</AppText>
        <AppText style={styles.linkText} variant="caption">
          عرض كل المصروفات
        </AppText>
      </View>
      <SolidCard style={styles.expensesCard}>
        {recentMarketingExpenses.map((expense, index) => (
          <View key={expense.id}>
            <View style={styles.expenseRow}>
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
            </View>
            {index < recentMarketingExpenses.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function InsightCard({ summary }: { summary: ReturnType<typeof getBudgetSummary> }) {
  return (
    <SolidCard style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={17} />
        <AppText variant="cardTitle">معدل إنفاقك الحالي</AppText>
        <View style={styles.prototypeBadge}>
          <AppText align="center" variant="caption">
            تقدير تجريبي
          </AppText>
        </View>
      </View>
      <AppText variant="body">
        {directionSafeText(`أنفقت ${summary.usage}% من ميزانية ${summary.category.name}، ويتبقى ${summary.remaining.toLocaleString('en-US')} ر.س حتى نهاية الشهر.`)}
      </AppText>
      <AppText variant="body">
        بناءً على وتيرة الإنفاق الحالية، قد تصل إلى 92% من الميزانية بنهاية يوليو.
      </AppText>
      <View style={styles.recommendationBox}>
        <AppText style={styles.linkText} variant="supporting">
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
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryMetrics: {
    flexDirection: 'row-reverse',
  },
  metric: {
    alignItems: 'center',
    borderLeftColor: colors.surface.separator,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
  },
  metricValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    writingDirection: 'ltr',
  },
  usageRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  progressDetailCard: {
    gap: spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  infoCard: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
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
  expenseAmount: {
    color: colors.semantic.danger,
    fontWeight: '700',
    writingDirection: 'ltr',
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
  prototypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    marginRight: 'auto',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  recommendationBox: {
    backgroundColor: 'rgba(44,159,224,0.12)',
    borderRadius: radii.control,
    padding: spacing.md,
  },
  linkText: {
    color: colors.brand.calmGreen,
  },
});
