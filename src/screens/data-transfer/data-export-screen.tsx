import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { useBudgetsStore } from '@/screens/budgets/budgets-store';
import { useGoalsStore } from '@/screens/goals/goals-store';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

import { buildDataExportPreview } from './export-adapters';
import type { CsvExportRow, ExportDatasetType, ExportPeriod } from './data-transfer-types';

const datasetOptions: { id: ExportDatasetType; title: string; description: string }[] = [
  { id: 'transactions', title: 'العمليات', description: 'الدخل والمصروفات المتاحة في سجل Capital.' },
  { id: 'invoices', title: 'الفواتير', description: 'الفواتير، حالة التحصيل، والمتبقي.' },
  { id: 'recurring_expenses', title: 'المصروفات المتكررة', description: 'الاشتراكات والالتزامات المجدولة.' },
  { id: 'budgets', title: 'الميزانيات', description: 'حدود الإنفاق والمصروف الحالي.' },
  { id: 'goals', title: 'الأهداف', description: 'الأهداف المالية الحالية.' },
  { id: 'milestones', title: 'المراحل', description: 'مساهمات ومراحل الأهداف.' },
  { id: 'financial_summary', title: 'ملخص التقارير المالية', description: 'الإيرادات والمصروفات والربح والتدفق النقدي.' },
];

const periodOptions: { id: ExportPeriod; label: string }[] = [
  { id: 'current-month', label: 'هذا الشهر' },
  { id: 'previous-month', label: 'الشهر السابق' },
  { id: 'last-3-months', label: 'آخر 3 أشهر' },
  { id: 'last-6-months', label: 'آخر 6 أشهر' },
  { id: 'current-year', label: 'هذه السنة' },
  { id: 'all', label: 'كل البيانات' },
];

export function DataExportScreen() {
  const insets = useSafeAreaInsets();
  const invoicesStore = useInvoicesStore();
  const recurringStore = useRecurringExpensesStore();
  const budgetsStore = useBudgetsStore();
  const goalsStore = useGoalsStore();
  const [selectedDatasets, setSelectedDatasets] = useState<ExportDatasetType[]>([]);
  const [period, setPeriod] = useState<ExportPeriod>('current-month');
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const hasSelectedDatasets = selectedDatasets.length > 0;

  const preview = useMemo(
    () =>
      buildDataExportPreview({
        selectedDatasets,
        period,
        invoices: invoicesStore.invoices,
        recurringExpenses: recurringStore.expenses,
        budgets: budgetsStore.budgets,
        goals: goalsStore.goals,
      }),
    [budgetsStore.budgets, goalsStore.goals, invoicesStore.invoices, period, recurringStore.expenses, selectedDatasets],
  );

  function toggleDataset(dataset: ExportDatasetType) {
    Haptics.selectionAsync().catch(() => null);
    setShareNotice(null);
    setSelectedDatasets((current) => {
      if (current.includes(dataset)) {
        return current.filter((item) => item !== dataset);
      }

      return [...current, dataset];
    });
  }

  function selectPeriod(nextPeriod: ExportPeriod) {
    Haptics.selectionAsync().catch(() => null);
    setShareNotice(null);
    setPeriod(nextPeriod);
  }

  function handleShareCsv() {
    if (!hasSelectedDatasets) {
      setShareNotice('اختر نوع بيانات واحدًا على الأقل للمتابعة.');
      return;
    }

    if (!preview.csvText) {
      setShareNotice('لا توجد بيانات للتصدير. غيّر الفترة أو اختر نوع بيانات آخر.');
      return;
    }

    Share.share({ message: preview.csvText, title: preview.fileName })
      .then(() => setShareNotice('تم فتح مشاركة CSV كنص. إنشاء ملف فعلي يحتاج expo-file-system وexpo-sharing.'))
      .catch(() => setShareNotice('تم إلغاء المشاركة أو لم تكتمل.'));
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
      <Header />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <SolidCard style={styles.noticeCard}>
          <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={20} />
          <AppText style={styles.flexText} tone="secondary" variant="supporting">
            يتم إنشاء CSV محليًا من بيانات prototype المتاحة. لا يوجد Backend أو مزامنة أو إرسال خارجي.
          </AppText>
        </SolidCard>

        <View style={styles.section}>
          <AppText variant="sectionTitle">أنواع البيانات</AppText>
          <View style={styles.datasetList}>
            {datasetOptions.map((option) => (
              <DatasetRow
                key={option.id}
                checked={selectedDatasets.includes(option.id)}
                description={option.description}
                onPress={() => toggleDataset(option.id)}
                title={option.title}
              />
            ))}
          </View>
          {!hasSelectedDatasets ? (
            <AppText tone="warning" variant="caption">
              اختر نوع بيانات واحدًا على الأقل للمتابعة.
            </AppText>
          ) : null}
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">الفترة</AppText>
          <ScrollView contentContainerStyle={styles.periodStrip} horizontal showsHorizontalScrollIndicator={false}>
            {periodOptions.map((option) => (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: period === option.id }}
                key={option.id}
                onPress={() => selectPeriod(option.id)}
                style={({ pressed }) => [styles.periodChip, period === option.id && styles.periodChipActive, pressed && styles.pressed]}
              >
                <AppText align="center" tone={period === option.id ? 'success' : 'primary'} variant="caption">
                  {option.label}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <SolidCard style={styles.sectionCard}>
          <SectionHeader iconName="document-text-outline" title="معاينة التصدير" />
          <SummaryRow label="اسم الملف" value={preview.fileName} ltr />
          <Divider />
          <SummaryRow label="تاريخ الإنشاء" value={preview.createdAt} ltr />
          <Divider />
          <SummaryRow label="إجمالي الصفوف" value={`${preview.rows.length}`} ltr />
          <View style={styles.summaryList}>
            {preview.summaries.map((summary) => (
              <SummaryRow key={summary.dataset} label={summary.label} value={`${summary.rowCount}`} ltr />
            ))}
          </View>
          {hasCurrentRecordDatasets(selectedDatasets) ? (
            <AppText tone="secondary" variant="caption">
              الميزانيات والأهداف والمراحل تستخدم السجلات الحالية لأنها ليست سجلات تاريخية مباشرة.
            </AppText>
          ) : null}
        </SolidCard>

        {preview.previewRows.length > 0 ? (
          <SolidCard style={styles.sectionCard}>
            <SectionHeader iconName="eye-outline" title="أول 5 صفوف" />
            {preview.previewRows.map((row, index) => (
              <PreviewRow index={index + 1} key={`${index}-${String(row.id ?? row.dataset ?? 'row')}`} row={row} />
            ))}
          </SolidCard>
        ) : (
          <SolidCard style={styles.emptyCard}>
            <Ionicons color={colors.semantic.warning} name="warning-outline" size={20} />
            <AppText tone="warning" variant="cardTitle">
              لا توجد بيانات للتصدير
            </AppText>
            <AppText align="center" tone="secondary" variant="supporting">
              غيّر الفترة أو اختر نوع بيانات آخر.
            </AppText>
          </SolidCard>
        )}

        <SolidCard style={styles.sectionCard}>
          <SectionHeader iconName="code-slash-outline" title="معاينة CSV" />
          <RawCsvPreview csvText={preview.csvText} />
          <AppButton disabled={!hasSelectedDatasets || !preview.csvText} onPress={handleShareCsv}>
            مشاركة CSV
          </AppButton>
          {shareNotice ? (
            <AppText tone="secondary" variant="caption">
              {shareNotice}
            </AppText>
          ) : null}
        </SolidCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="رجوع" accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={styles.backButton}>
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" variant="screenTitle">
          تصدير البيانات
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          جهّز نسخة CSV من بيانات Capital.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function DatasetRow({
  title,
  description,
  checked,
  onPress,
}: {
  title: string;
  description: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.datasetRow, checked && styles.datasetRowActive, pressed && styles.pressed]}
    >
      <View style={styles.datasetCopy}>
        <AppText variant="body">{title}</AppText>
        <AppText tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={16} /> : null}
      </View>
    </Pressable>
  );
}

function SectionHeader({ iconName, title }: { iconName: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons color={colors.brand.calmGreen} name={iconName} size={20} />
      <AppText variant="sectionTitle">{title}</AppText>
    </View>
  );
}

function SummaryRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={ltr && styles.ltrText} variant="body">
        {value}
      </AppText>
    </View>
  );
}

function PreviewRow({ row, index }: { row: CsvExportRow; index: number }) {
  const rowEntries = Object.entries(row)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .slice(0, 4);

  return (
    <View style={styles.previewRow}>
      <AppText style={styles.ltrText} tone="secondary" variant="caption">
        #{index}
      </AppText>
      <View style={styles.previewCopy}>
        {rowEntries.map(([key, value]) => (
          <View key={key} style={styles.previewField}>
            <AppText style={styles.ltrText} tone="tertiary" variant="caption">
              {key}
            </AppText>
            <AppText style={styles.ltrText} numberOfLines={1} variant="caption">
              {String(value)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function RawCsvPreview({ csvText }: { csvText: string }) {
  const previewLines = buildCsvPreviewLines(csvText);

  if (previewLines.length === 0) {
    return (
      <View style={styles.csvPreviewContainer}>
        <AppText style={styles.csvPreviewLine} tone="secondary" variant="caption">
          لا يوجد CSV جاهز.
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator style={styles.csvPreviewScroll}>
      <View style={styles.csvPreviewContainer}>
        {previewLines.map((line, index) => (
          <AppText key={`${index}-${line}`} numberOfLines={1} style={styles.csvPreviewLine} variant="caption">
            {line}
          </AppText>
        ))}
      </View>
    </ScrollView>
  );
}

function buildCsvPreviewLines(csvText: string) {
  if (!csvText) {
    return [];
  }

  const lines = csvText.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).filter(Boolean);
  const previewLines = lines.slice(0, 6);

  if (lines.length > 6) {
    previewLines.push('... وبقية الصفوف داخل الملف');
  }

  return previewLines;
}

function hasCurrentRecordDatasets(datasets: readonly ExportDatasetType[]) {
  return datasets.some((dataset) => dataset === 'budgets' || dataset === 'goals' || dataset === 'milestones');
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 68,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  backButton: {
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
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.md,
  },
  noticeCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  flexText: {
    flex: 1,
    lineHeight: 22,
  },
  section: {
    gap: spacing.md,
  },
  datasetList: {
    gap: spacing.sm,
  },
  datasetRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.md,
  },
  datasetRowActive: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  datasetCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.small,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  checkboxActive: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  periodStrip: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  periodChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 40,
    minWidth: 104,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  periodChipActive: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.38)',
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  summaryList: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.input,
    gap: spacing.xs,
    padding: spacing.md,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  previewRow: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.input,
    gap: spacing.sm,
    padding: spacing.md,
  },
  previewCopy: {
    gap: spacing.xs,
  },
  previewField: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  csvPreviewScroll: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    maxHeight: 178,
  },
  csvPreviewContainer: {
    minWidth: 620,
    padding: spacing.md,
  },
  csvPreviewLine: {
    color: colors.text.secondary,
    fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo', default: 'monospace' }),
    lineHeight: 19,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
