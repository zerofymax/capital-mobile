import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { InvoiceHeader, InvoiceStatusBadge } from './components';
import type { Invoice } from './invoices-data';
import { useInvoicesStore } from './invoices-store';
import { formatSar, getInvoiceSummary, type InvoiceSummary } from './invoice-utils';

export type InvoiceScope = 'all' | 'open' | 'paid' | 'overdue';
export type InvoicePeriod = 'all' | 'current-month' | 'previous-month' | 'current-year' | 'custom';
export type ExportFileFormat = 'csv' | 'pdf';
export type ExportFieldId =
  | 'invoiceNumber'
  | 'clientName'
  | 'issueDate'
  | 'dueDate'
  | 'status'
  | 'total'
  | 'paid'
  | 'remaining'
  | 'items'
  | 'payments'
  | 'notes';

export const invoiceScopeOptions: { id: InvoiceScope; label: string }[] = [
  { id: 'all', label: 'جميع الفواتير' },
  { id: 'open', label: 'الفواتير غير المكتملة' },
  { id: 'paid', label: 'الفواتير المدفوعة' },
  { id: 'overdue', label: 'الفواتير المتأخرة' },
];

export const invoicePeriodOptions: { id: InvoicePeriod; label: string; disabled?: boolean; badge?: string }[] = [
  { id: 'all', label: 'جميع الفترات' },
  { id: 'current-month', label: 'هذا الشهر' },
  { id: 'previous-month', label: 'الشهر السابق' },
  { id: 'current-year', label: 'هذا العام' },
  { id: 'custom', label: 'فترة مخصصة', disabled: true, badge: 'قريبًا' },
];

export const exportFieldOptions: { id: ExportFieldId; label: string; helper?: string }[] = [
  { id: 'invoiceNumber', label: 'رقم الفاتورة' },
  { id: 'clientName', label: 'اسم العميل' },
  { id: 'issueDate', label: 'تاريخ الإصدار' },
  { id: 'dueDate', label: 'تاريخ الاستحقاق' },
  { id: 'status', label: 'حالة الفاتورة' },
  { id: 'total', label: 'إجمالي الفاتورة' },
  { id: 'paid', label: 'المبلغ المدفوع' },
  { id: 'remaining', label: 'المبلغ المتبقي' },
  { id: 'items', label: 'بنود الفاتورة', helper: 'اختياري' },
  { id: 'payments', label: 'سجل الدفعات', helper: 'اختياري' },
  { id: 'notes', label: 'ملاحظات الفاتورة', helper: 'اختياري' },
];

const initialSelectedFields = new Set<ExportFieldId>([
  'invoiceNumber',
  'clientName',
  'issueDate',
  'dueDate',
  'status',
  'total',
  'paid',
  'remaining',
]);

export const fileFormatOptions: { id: ExportFileFormat; label: string }[] = [
  { id: 'csv', label: 'CSV' },
  { id: 'pdf', label: 'PDF' },
];

export function ExportInvoicesScreen() {
  const insets = useSafeAreaInsets();
  const { invoices } = useInvoicesStore();
  const [scope, setScope] = useState<InvoiceScope>('all');
  const [period, setPeriod] = useState<InvoicePeriod>('all');
  const [fileFormat, setFileFormat] = useState<ExportFileFormat>('csv');
  const [selectedFields, setSelectedFields] = useState<Set<ExportFieldId>>(initialSelectedFields);

  const summaries = useMemo(() => invoices.map(getInvoiceSummary), [invoices]);
  const filteredInvoices = useMemo(() => summaries.filter((invoice) => matchesScope(invoice, scope) && matchesPeriod(invoice, period)), [period, scope, summaries]);
  const exportSummary = useMemo(() => buildExportSummary(filteredInvoices), [filteredInvoices]);
  const selectedFieldCount = selectedFields.size;
  const canPrepareExport = filteredInvoices.length > 0 && selectedFieldCount > 0;

  function handleToggleField(fieldId: ExportFieldId) {
    setSelectedFields((current) => {
      const next = new Set(current);

      if (next.has(fieldId)) {
        if (next.size === 1) {
          Alert.alert('البيانات المضمنة', 'اختر حقلًا واحدًا على الأقل لتجهيز التصدير.', [{ text: 'حسنًا' }]);
          return current;
        }

        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }

      return next;
    });
  }

  function handleSelectPeriod(nextPeriod: InvoicePeriod, disabled?: boolean) {
    if (disabled) {
      Alert.alert('فترة مخصصة', 'اختيار فترة مخصصة سيكون متاحًا في تحديث قادم.', [{ text: 'حسنًا' }]);
      return;
    }

    setPeriod(nextPeriod);
  }

  function handlePrepareExport() {
    if (!canPrepareExport) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    router.push({
      pathname: routes.prepareInvoiceExport,
      params: {
        format: fileFormat,
        invoiceCount: String(filteredInvoices.length),
        period,
        scope,
        selectedFieldKeys: Array.from(selectedFields).join(','),
      },
    });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <InvoiceHeader rtl onBack={() => router.back()} subtitle="اختر الفواتير والبيانات التي تريد تجهيزها للتصدير." title="تصدير الفواتير" />

        {summaries.length === 0 ? (
          <EmptyInvoicesCard />
        ) : (
          <>
            <ExportSummaryCard summary={exportSummary} />

            <SectionCard title="نطاق الفواتير">
              {invoiceScopeOptions.map((option) => (
                <ChoiceRow key={option.id} label={option.label} selected={scope === option.id} onPress={() => setScope(option.id)} />
              ))}
            </SectionCard>

            <SectionCard title="الفترة الزمنية">
              {invoicePeriodOptions.map((option) => (
                <ChoiceRow
                  badge={option.badge}
                  disabled={option.disabled}
                  key={option.id}
                  label={option.label}
                  selected={period === option.id}
                  onPress={() => handleSelectPeriod(option.id, option.disabled)}
                />
              ))}
            </SectionCard>

            <SectionCard title="البيانات المضمنة">
              {exportFieldOptions.map((option) => (
                <FieldRow
                  checked={selectedFields.has(option.id)}
                  helper={option.helper}
                  key={option.id}
                  label={option.label}
                  onPress={() => handleToggleField(option.id)}
                />
              ))}
            </SectionCard>

            <SectionCard title="صيغة الملف">
              {fileFormatOptions.map((option) => (
                <ChoiceRow badge="تجريبي" key={option.id} label={option.label} ltrLabel selected={fileFormat === option.id} onPress={() => setFileFormat(option.id)} />
              ))}
            </SectionCard>

            <SelectionSummaryCard fieldCount={selectedFieldCount} fileFormat={fileFormat} invoices={filteredInvoices} period={period} />
            <PreviewCard invoices={filteredInvoices} />
          </>
        )}

        <AppButton disabled={!canPrepareExport} onPress={handlePrepareExport}>
          تجهيز التصدير
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExportSummaryCard({
  summary,
}: {
  summary: {
    totalCount: number;
    openCount: number;
    paidCount: number;
    overdueCount: number;
    totalValue: number;
    collected: number;
    remaining: number;
  };
}) {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={[styles.summaryHeader, Platform.OS === 'android' && styles.summaryHeaderAndroid]}>
        <View style={styles.summaryIcon}>
          <Ionicons color="#9DD5FF" name="download-outline" size={20} />
        </View>
        <View style={styles.summaryCopy}>
          <AppText align="right" style={[styles.rtlText, styles.summaryText]} variant="sectionTitle">
            ملخص التصدير
          </AppText>
          <AppText align="right" style={[styles.rtlText, styles.summaryText]} tone="secondary" variant="supporting">
            البيانات محسوبة من الفواتير الحالية داخل النموذج المحلي.
          </AppText>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricBox label="إجمالي الفواتير" value={`${summary.totalCount}`} />
        <MetricBox label="غير مكتملة" value={`${summary.openCount}`} />
        <MetricBox label="مدفوعة" value={`${summary.paidCount}`} />
        <MetricBox label="متأخرة" tone="danger" value={`${summary.overdueCount}`} />
      </View>

      <View style={styles.amountRows}>
        <AmountRow label="إجمالي القيمة" value={summary.totalValue} />
        <AmountRow label="المحصّل" tone="success" value={summary.collected} />
        <AmountRow label="المتبقي للتحصيل" value={summary.remaining} />
      </View>
    </SolidCard>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SolidCard style={styles.sectionCard}>
      <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
        {title}
      </AppText>
      <View style={styles.optionList}>{children}</View>
    </SolidCard>
  );
}

function ChoiceRow({
  label,
  selected,
  badge,
  disabled,
  ltrLabel,
  onPress,
}: {
  label: string;
  selected: boolean;
  badge?: string;
  disabled?: boolean;
  ltrLabel?: boolean;
  onPress: () => void;
}) {
  const radio = (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
  const optionLabel = (
    <AppText align="right" style={[styles.optionLabel, Platform.OS === 'android' && styles.optionLabelAndroid, ltrLabel ? styles.ltrText : styles.rtlText]} variant="body">
      {label}
    </AppText>
  );
  const optionBadge = badge ? <Badge label={badge} /> : null;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionRow,
        Platform.OS === 'android' && styles.optionRowAndroid,
        selected && styles.optionRowSelected,
        disabled && styles.optionRowDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {Platform.OS === 'android' ? (
        <>
          {radio}
          <View style={styles.optionSpacerAndroid} />
          {optionBadge}
          <View style={styles.optionLabelSlotAndroid}>{optionLabel}</View>
        </>
      ) : (
        <>
          <View style={styles.optionLeading}>
            {radio}
            {optionLabel}
          </View>
          {optionBadge}
        </>
      )}
    </Pressable>
  );
}

function FieldRow({ label, helper, checked, onPress }: { label: string; helper?: string; checked: boolean; onPress: () => void }) {
  const checkbox = (
    <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
      {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={15} /> : null}
    </View>
  );
  const fieldLabel = (
    <AppText align="right" style={[styles.optionLabel, Platform.OS === 'android' && styles.optionLabelAndroid, styles.rtlText]} variant="body">
      {label}
    </AppText>
  );
  const helperBadge = helper ? <Badge label={helper} /> : null;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.optionRow, Platform.OS === 'android' && styles.optionRowAndroid, checked && styles.optionRowSelected, pressed && styles.pressed]}
    >
      {Platform.OS === 'android' ? (
        <>
          {checkbox}
          <View style={styles.optionSpacerAndroid} />
          {helperBadge}
          <View style={styles.optionLabelSlotAndroid}>{fieldLabel}</View>
        </>
      ) : (
        <>
          <View style={styles.optionLeading}>
            {checkbox}
            {fieldLabel}
          </View>
          {helperBadge}
        </>
      )}
    </Pressable>
  );
}

function SelectionSummaryCard({ invoices, period, fileFormat, fieldCount }: { invoices: InvoiceSummary[]; period: InvoicePeriod; fileFormat: ExportFileFormat; fieldCount: number }) {
  return (
    <SolidCard style={styles.sectionCard}>
      <View style={styles.sectionTitleWrapper}>
        <AppText align="right" style={styles.sectionTitleText} variant="sectionTitle">
          ملخص الاختيار
        </AppText>
      </View>
      {invoices.length === 0 ? (
        <AppText tone="warning" variant="body">
          لا توجد فواتير مطابقة للخيارات الحالية.
        </AppText>
      ) : (
        <View style={styles.amountRows}>
          <TextRow label="عدد الفواتير المشمولة" ltrValue value={`${invoices.length}`} />
          <TextRow label="الفترة المختارة" value={getPeriodLabel(period)} />
          <TextRow label="صيغة الملف" ltrValue value={fileFormat.toUpperCase()} />
          <TextRow label="عدد الحقول المضمنة" ltrValue value={`${fieldCount}`} />
        </View>
      )}
    </SolidCard>
  );
}

function PreviewCard({ invoices }: { invoices: InvoiceSummary[] }) {
  if (invoices.length === 0) {
    return null;
  }

  return (
    <SolidCard style={styles.sectionCard}>
      <View style={[styles.previewHeader, Platform.OS === 'android' && styles.previewHeaderAndroid]}>
        {Platform.OS === 'android' ? <Badge label={`${Math.min(invoices.length, 5)} من ${invoices.length}`} /> : null}
        <AppText align="right" style={styles.previewTitle} variant="sectionTitle">
          معاينة البيانات
        </AppText>
        {Platform.OS === 'android' ? null : <Badge label={`${Math.min(invoices.length, 5)} من ${invoices.length}`} />}
      </View>
      <View style={styles.previewList}>
        {invoices.slice(0, 5).map((invoice) => (
          <View key={invoice.id} style={styles.previewRow}>
            <View style={[styles.previewTopRow, Platform.OS === 'android' && styles.previewTopRowAndroid]}>
              {Platform.OS === 'android' ? <InvoiceStatusBadge status={invoice.displayStatus} /> : null}
              <View style={[styles.previewIdentity, Platform.OS === 'android' && styles.previewIdentityAndroid]}>
                <AppText align="right" style={[styles.rtlText, Platform.OS === 'android' && styles.previewIdentityTextAndroid]} variant="cardTitle">
                  {invoice.clientName}
                </AppText>
                <AppText align="right" numberOfLines={Platform.OS === 'android' ? 1 : undefined} style={[styles.ltrText, Platform.OS === 'android' && styles.previewIdentityTextAndroid]} tone="secondary" variant="caption">
                  {directionSafeText(invoice.invoiceNumber)}
                </AppText>
              </View>
              {Platform.OS === 'android' ? null : <InvoiceStatusBadge status={invoice.displayStatus} />}
            </View>
            <View style={styles.previewAmounts}>
              <PreviewAmount label="الإجمالي" value={invoice.total} />
              <PreviewAmount label="المتبقي" value={invoice.remaining} />
            </View>
          </View>
        ))}
      </View>
    </SolidCard>
  );
}

function PreviewAmount({ label, value }: { label: string; value: number }) {
  const labelText = (
    <AppText align="right" style={styles.textRowLabel} tone="secondary" variant="caption">
      {label}
    </AppText>
  );
  const valueText = (
    <AppText align="left" style={styles.amountText} variant="caption">
      {formatSar(value)}
    </AppText>
  );

  return (
    <View style={[styles.previewAmountRow, Platform.OS === 'android' && styles.previewAmountRowAndroid]}>
      {Platform.OS === 'android' ? valueText : labelText}
      {Platform.OS === 'android' ? labelText : valueText}
    </View>
  );
}

function EmptyInvoicesCard() {
  return (
    <SolidCard style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.text.tertiary} name="document-text-outline" size={25} />
      </View>
      <AppText align="center" variant="sectionTitle">
        لا توجد فواتير للتصدير
      </AppText>
      <AppText align="center" tone="secondary" variant="body">
        أضف فاتورة أولًا حتى تتمكن من تجهيز بيانات التصدير.
      </AppText>
      <AppButton onPress={() => router.push(routes.addInvoice)} variant="secondary">
        إضافة فاتورة
      </AppButton>
    </SolidCard>
  );
}

function MetricBox({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <View style={styles.metricBox}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.metricBoxValue, tone === 'danger' && styles.dangerText]} variant="cardTitle">
        {value}
      </AppText>
    </View>
  );
}

function AmountRow({ label, value, tone }: { label: string; value: number; tone?: 'success' }) {
  return (
    <View style={styles.fixedSummaryRow}>
      <View style={styles.fixedValueSlot}>
        <AppText align="left" style={[styles.fixedValueText, tone === 'success' && styles.successText]} variant="cardTitle">
          {formatSar(value)}
        </AppText>
      </View>
      <View style={styles.fixedLabelSlot}>
        <AppText align="right" style={styles.fixedLabelText} tone="secondary" variant="supporting">
          {label}
        </AppText>
      </View>
    </View>
  );
}

function TextRow({ label, value, ltrValue }: { label: string; value: string; ltrValue?: boolean }) {
  return (
    <View style={styles.fixedSummaryRow}>
      <View style={styles.fixedValueSlot}>
        <AppText align="left" style={[styles.fixedValueText, !ltrValue && styles.fixedRtlValueText]} variant="cardTitle">
          {value}
        </AppText>
      </View>
      <View style={styles.fixedLabelSlot}>
        <AppText align="right" style={styles.fixedLabelText} tone="secondary" variant="supporting">
          {label}
        </AppText>
      </View>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText style={styles.badgeText} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

export function buildExportSummary(invoices: InvoiceSummary[]) {
  return invoices.reduce(
    (summary, invoice) => ({
      totalCount: summary.totalCount + 1,
      openCount: summary.openCount + (invoice.open ? 1 : 0),
      paidCount: summary.paidCount + (invoice.paidInFull ? 1 : 0),
      overdueCount: summary.overdueCount + (invoice.status === 'overdue' ? 1 : 0),
      totalValue: summary.totalValue + invoice.total,
      collected: summary.collected + invoice.paid,
      remaining: summary.remaining + invoice.remaining,
    }),
    {
      totalCount: 0,
      openCount: 0,
      paidCount: 0,
      overdueCount: 0,
      totalValue: 0,
      collected: 0,
      remaining: 0,
    },
  );
}

export function matchesScope(invoice: InvoiceSummary, scope: InvoiceScope) {
  switch (scope) {
    case 'all':
      return true;
    case 'open':
      return invoice.open;
    case 'paid':
      return invoice.paidInFull;
    case 'overdue':
      return invoice.status === 'overdue';
  }
}

export function matchesPeriod(invoice: Invoice, period: InvoicePeriod) {
  if (period === 'all') {
    return true;
  }

  const invoiceDate = parseInvoiceDate(invoice.issueDate);

  if (!invoiceDate) {
    return false;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (period === 'current-month') {
    return invoiceDate.getFullYear() === currentYear && invoiceDate.getMonth() === currentMonth;
  }

  if (period === 'previous-month') {
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
    return invoiceDate.getFullYear() === previousMonthDate.getFullYear() && invoiceDate.getMonth() === previousMonthDate.getMonth();
  }

  if (period === 'current-year') {
    return invoiceDate.getFullYear() === currentYear;
  }

  return false;
}

function parseInvoiceDate(value: string) {
  const normalized = value.replace('اليوم، ', '').trim();
  const [dayText, monthText, yearText] = normalized.split(/\s+/);
  const monthIndex = monthText ? arabicMonthIndexes[monthText] : undefined;
  const day = Number(dayText);
  const year = Number(yearText);

  if (!Number.isFinite(day) || !Number.isFinite(year) || monthIndex === undefined) {
    return null;
  }

  return new Date(year, monthIndex, day);
}

export function getPeriodLabel(period: InvoicePeriod) {
  return invoicePeriodOptions.find((option) => option.id === period)?.label ?? 'جميع الفترات';
}

const arabicMonthIndexes: Record<string, number> = {
  يناير: 0,
  فبراير: 1,
  مارس: 2,
  أبريل: 3,
  مايو: 4,
  يونيو: 5,
  يوليو: 6,
  أغسطس: 7,
  سبتمبر: 8,
  أكتوبر: 9,
  نوفمبر: 10,
  ديسمبر: 11,
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  summaryHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(46,168,255,0.14)',
    borderColor: 'rgba(46,168,255,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  summaryCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryText: {
    width: '100%',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 74,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  metricBoxValue: {
    fontSize: 18,
    lineHeight: 25,
    writingDirection: 'ltr',
  },
  amountRows: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  fixedSummaryRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderTopColor: colors.surface.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    direction: 'ltr',
    flexDirection: 'row',
    paddingTop: spacing.sm,
    width: '100%',
  },
  fixedValueSlot: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  fixedLabelSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  fixedLabelText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fixedValueText: {
    textAlign: 'left',
    width: '100%',
    writingDirection: 'ltr',
  },
  fixedRtlValueText: {
    writingDirection: 'rtl',
  },
  amountText: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  textRowLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  successText: {
    color: '#35D39A',
  },
  dangerText: {
    color: colors.semantic.danger,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  sectionTitleText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(79,138,91,0.38)',
  },
  optionRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  optionSpacerAndroid: {
    flex: 1,
    minWidth: spacing.sm,
  },
  optionLabelSlotAndroid: {
    alignItems: 'flex-end',
    flexShrink: 1,
    minWidth: 0,
  },
  optionRowDisabled: {
    opacity: 0.68,
  },
  optionLeading: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  optionLabelAndroid: {
    flex: 0,
    flexShrink: 1,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: {
    borderColor: colors.brand.mediumGreen,
  },
  radioDot: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.surface.inputBorder,
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxSelected: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  badge: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  previewHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  previewTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewList: {
    gap: spacing.sm,
  },
  previewRow: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  previewTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  previewTopRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  previewIdentity: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  previewIdentityAndroid: {
    alignItems: 'flex-end',
  },
  previewIdentityTextAndroid: {
    textAlign: 'right',
    width: '100%',
  },
  previewAmounts: {
    gap: spacing.xs,
    width: '100%',
  },
  previewAmountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  previewAmountRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.glass,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
