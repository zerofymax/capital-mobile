import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { InvoiceHeader, InvoiceStatusBadge } from './components';
import {
  buildExportSummary,
  exportFieldOptions,
  fileFormatOptions,
  getPeriodLabel,
  invoiceScopeOptions,
  matchesPeriod,
  matchesScope,
  type ExportFieldId,
  type ExportFileFormat,
  type InvoicePeriod,
  type InvoiceScope,
} from './export-invoices-screen';
import { buildInvoiceExportFileName, createInvoiceCsv, writeInvoiceCsvToCache } from './invoice-csv-export';
import { buildInvoicePdfFileName, createInvoicePdf } from './invoice-pdf-export';
import { useInvoicesStore } from './invoices-store';
import { formatSar, getInvoiceSummary, type InvoiceSummary } from './invoice-utils';

type PrepareInvoiceExportParams = {
  format?: string | string[];
  invoiceCount?: string | string[];
  period?: string | string[];
  scope?: string | string[];
  selectedFieldKeys?: string | string[];
};

const validScopeIds = new Set<InvoiceScope>(invoiceScopeOptions.map((option) => option.id));
const validPeriodIds = new Set<InvoicePeriod>(['all', 'current-month', 'previous-month', 'current-year']);
const validFormatIds = new Set<ExportFileFormat>(fileFormatOptions.map((option) => option.id));
const validFieldIds = new Set<ExportFieldId>(exportFieldOptions.map((option) => option.id));

export function PrepareInvoiceExportScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<PrepareInvoiceExportParams>();
  const { invoices } = useInvoicesStore();
  const exportLockRef = useRef(false);
  const [isExporting, setIsExporting] = useState(false);
  const scope = parseScopeParam(params.scope);
  const period = parsePeriodParam(params.period);
  const fileFormat = parseFormatParam(params.format);
  const selectedFieldIds = parseSelectedFieldKeys(params.selectedFieldKeys);
  const receivedInvoiceCount = getParamValue(params.invoiceCount);

  const summaries = useMemo(() => invoices.map(getInvoiceSummary), [invoices]);
  const matchingInvoices = useMemo(() => summaries.filter((invoice) => matchesScope(invoice, scope) && matchesPeriod(invoice, period)), [period, scope, summaries]);
  const exportSummary = useMemo(() => buildExportSummary(matchingInvoices), [matchingInvoices]);
  const partiallyPaidCount = useMemo(() => matchingInvoices.filter((invoice) => invoice.status === 'partially-paid').length, [matchingInvoices]);
  const selectedFields = useMemo(
    () =>
      selectedFieldIds
        .map((fieldId) => exportFieldOptions.find((field) => field.id === fieldId))
        .filter((field): field is { id: ExportFieldId; label: string } => Boolean(field)),
    [selectedFieldIds],
  );
  const proposedFileName = fileFormat === 'csv' ? buildInvoiceExportFileName() : fileFormat === 'pdf' ? buildInvoicePdfFileName() : '';
  const canCreateFile = Boolean(fileFormat && selectedFields.length > 0 && matchingInvoices.length > 0);

  async function handleCreateFile() {
    if (!fileFormat || !canCreateFile || exportLockRef.current) {
      return;
    }

    exportLockRef.current = true;
    setIsExporting(true);

    try {
      const fileUri =
        fileFormat === 'pdf'
          ? (
              await createInvoicePdf({
                fields: selectedFields,
                fileName: proposedFileName,
                invoices: matchingInvoices,
                periodLabel: getPeriodLabel(period),
                scopeLabel: getScopeLabel(scope),
                summary: {
                  ...exportSummary,
                  partiallyPaidCount,
                },
              })
            ).uri
          : writeInvoiceCsvToCache(createInvoiceCsv(matchingInvoices, selectedFields), proposedFileName);
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        Alert.alert(
          'تعذر مشاركة الملف',
          fileFormat === 'pdf'
            ? 'تم إنشاء ملف PDF داخل مساحة التطبيق المؤقتة، لكن المشاركة غير متاحة على هذا الجهاز.'
            : 'تم إنشاء ملف CSV داخل مساحة التطبيق المؤقتة، لكن المشاركة غير متاحة على هذا الجهاز.',
          [{ text: 'حسنًا' }],
        );
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: fileFormat === 'pdf' ? 'تصدير الفواتير PDF' : 'تصدير الفواتير',
        mimeType: fileFormat === 'pdf' ? 'application/pdf' : 'text/csv',
        UTI: fileFormat === 'pdf' ? 'com.adobe.pdf' : 'public.comma-separated-values-text',
      });
    } catch {
      Alert.alert('تعذر إنشاء الملف', fileFormat === 'pdf' ? 'حدث خطأ أثناء تجهيز ملف PDF. حاول مرة أخرى.' : 'حدث خطأ أثناء تجهيز ملف CSV. حاول مرة أخرى.', [{ text: 'حسنًا' }]);
    } finally {
      exportLockRef.current = false;
      setIsExporting(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <InvoiceHeader onBack={() => router.back()} subtitle="راجع تفاصيل الملف قبل متابعة إنشاء التصدير." title="تجهيز التصدير" />

        <PreparationStatusCard fileFormat={fileFormat} />
        {!canCreateFile ? <InvalidOptionsCard /> : null}
        <FileSummaryCard
          fieldCount={selectedFields.length}
          fileFormat={fileFormat}
          invoiceCount={matchingInvoices.length}
          period={period}
          proposedFileName={proposedFileName}
          receivedInvoiceCount={receivedInvoiceCount}
          scope={scope}
        />
        <FinancialSummaryCard partiallyPaidCount={partiallyPaidCount} summary={exportSummary} />
        <IncludedFieldsCard fields={selectedFields} />
        <FilePreviewCard fields={selectedFields} fileFormat={fileFormat} invoices={matchingInvoices} />

        <View style={styles.actions}>
          <AppButton disabled={!canCreateFile || isExporting} onPress={handleCreateFile}>
            {isExporting ? (fileFormat === 'pdf' ? 'جارٍ إنشاء ملف PDF…' : 'جارٍ إنشاء الملف…') : 'إنشاء ملف التصدير'}
          </AppButton>
          <AppButton onPress={() => router.back()} variant="secondary">
            العودة للتعديل
          </AppButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreparationStatusCard({ fileFormat }: { fileFormat: ExportFileFormat | null }) {
  const isPdf = fileFormat === 'pdf';
  const statusTitle = (
    <AppText style={Platform.OS === 'android' ? styles.statusTitleAndroid : undefined} variant="sectionTitle">
      ملف التصدير جاهز للمراجعة
    </AppText>
  );
  const previewBadge = <Badge label="معاينة" />;

  return (
    <SolidCard style={styles.statusCard}>
      <View style={[styles.statusHeader, Platform.OS === 'android' && styles.statusHeaderAndroid]}>
        <View style={styles.statusIcon}>
          <Ionicons color="#9DD5FF" name={isPdf ? 'document-text-outline' : 'download-outline'} size={22} />
        </View>
        <View style={[styles.statusCopy, Platform.OS === 'android' && styles.statusCopyAndroid]}>
          <View style={[styles.titleRow, Platform.OS === 'android' && styles.titleRowAndroid]}>
            {Platform.OS === 'android' ? previewBadge : statusTitle}
            {Platform.OS === 'android' ? statusTitle : previewBadge}
          </View>
          <AppText style={Platform.OS === 'android' ? styles.statusDescriptionAndroid : undefined} tone="secondary" variant="body">
            {isPdf ? 'سيتم تجهيز ملف PDF منسق يتضمن بيانات الفواتير المحددة.' : 'سيتم تجهيز ملف CSV يتضمن بيانات الفواتير المحددة.'}
          </AppText>
        </View>
      </View>
    </SolidCard>
  );
}

function InvalidOptionsCard() {
  return (
    <View style={styles.warningCard}>
      <Ionicons color={colors.semantic.warning} name="warning-outline" size={18} />
      <AppText style={styles.warningText} variant="supporting">
        تعذر تجهيز التصدير بالخيارات الحالية.
      </AppText>
    </View>
  );
}

function FileSummaryCard({
  fileFormat,
  invoiceCount,
  scope,
  period,
  fieldCount,
  proposedFileName,
  receivedInvoiceCount,
}: {
  fileFormat: ExportFileFormat | null;
  invoiceCount: number;
  scope: InvoiceScope;
  period: InvoicePeriod;
  fieldCount: number;
  proposedFileName: string;
  receivedInvoiceCount?: string;
}) {
  return (
    <SolidCard style={styles.sectionCard}>
      <AppText style={Platform.OS === 'android' ? styles.sectionTitleAndroid : undefined} variant="sectionTitle">ملخص الملف</AppText>
      <View style={styles.rows}>
        <TextRow label="صيغة الملف" ltrValue value={fileFormat ? fileFormat.toUpperCase() : 'غير صالحة'} />
        <TextRow label="عدد الفواتير" value={`${invoiceCount}`} />
        {receivedInvoiceCount ? <TextRow label="العدد من صفحة الاختيار" value={receivedInvoiceCount} /> : null}
        <TextRow label="نطاق الفواتير" value={getScopeLabel(scope)} />
        <TextRow label="الفترة الزمنية" value={getPeriodLabel(period)} />
        <TextRow label="عدد الحقول المضمنة" value={`${fieldCount}`} />
        <FileNameRow value={proposedFileName || 'غير متاح'} />
      </View>
    </SolidCard>
  );
}

function FinancialSummaryCard({
  partiallyPaidCount,
  summary,
}: {
  partiallyPaidCount: number;
  summary: {
    collected: number;
    openCount: number;
    overdueCount: number;
    paidCount: number;
    remaining: number;
    totalValue: number;
  };
}) {
  return (
    <SolidCard style={styles.sectionCard}>
      <AppText style={Platform.OS === 'android' ? styles.sectionTitleAndroid : undefined} variant="sectionTitle">ملخص الفواتير المحددة</AppText>
      <View style={styles.rows}>
        <AmountRow label="إجمالي قيمة الفواتير" value={summary.totalValue} />
        <AmountRow label="المبلغ المحصل" tone="success" value={summary.collected} />
        <AmountRow label="المتبقي للتحصيل" value={summary.remaining} />
        <TextRow label="عدد المدفوعة" value={`${summary.paidCount}`} />
        <TextRow label="عدد المدفوعة جزئيًا" value={`${partiallyPaidCount}`} />
        <TextRow label="عدد غير المكتملة" value={`${summary.openCount}`} />
        <TextRow label="عدد المتأخرة" value={`${summary.overdueCount}`} />
      </View>
    </SolidCard>
  );
}

function IncludedFieldsCard({ fields }: { fields: { id: ExportFieldId; label: string }[] }) {
  return (
    <SolidCard style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <AppText style={Platform.OS === 'android' ? styles.sectionHeaderTitleAndroid : undefined} variant="sectionTitle">الحقول المضمنة</AppText>
        <Pressable accessibilityLabel="تعديل الاختيارات" accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
          <AppText style={styles.linkText} variant="caption">
            تعديل الاختيارات
          </AppText>
        </Pressable>
      </View>
      {fields.length > 0 ? (
        <View style={styles.chipWrap}>
          {fields.map((field) => (
            <View key={field.id} style={styles.fieldChip}>
              <AppText variant="caption">{field.label}</AppText>
            </View>
          ))}
        </View>
      ) : (
        <AppText tone="warning" variant="body">
          لا توجد حقول محددة.
        </AppText>
      )}
    </SolidCard>
  );
}

function FilePreviewCard({ invoices, fields, fileFormat }: { invoices: InvoiceSummary[]; fields: { id: ExportFieldId; label: string }[]; fileFormat: ExportFileFormat | null }) {
  const hiddenInvoiceCount = Math.max(invoices.length - 3, 0);

  return (
    <SolidCard style={styles.sectionCard}>
      <AppText style={Platform.OS === 'android' ? styles.sectionTitleAndroid : undefined} variant="sectionTitle">معاينة الملف</AppText>
      <FormatNote fileFormat={fileFormat} fields={fields} />
      {invoices.length === 0 ? (
        <View style={styles.emptyPreview}>
          <Ionicons color={colors.text.tertiary} name="document-outline" size={24} />
          <AppText align="center" tone="secondary" variant="body">
            لا توجد فواتير مطابقة للخيارات الحالية.
          </AppText>
        </View>
      ) : fileFormat === 'csv' ? (
        <CsvPreviewTable fields={fields} invoice={invoices[0]!} />
      ) : (
        <View style={styles.previewList}>
          {invoices.slice(0, 3).map((invoice) => (
            <InvoicePreviewRow invoice={invoice} key={invoice.id} />
          ))}
          {hiddenInvoiceCount > 0 ? (
            <AppText align="center" tone="secondary" variant="caption">
              {`و${hiddenInvoiceCount} فواتير أخرى`}
            </AppText>
          ) : null}
        </View>
      )}
    </SolidCard>
  );
}

function CsvPreviewTable({ fields, invoice }: { fields: { id: ExportFieldId; label: string }[]; invoice: InvoiceSummary }) {
  const previewFields = fields.slice(0, 4);

  return (
    <View style={styles.csvPreviewWrap}>
      <ScrollView contentContainerStyle={styles.csvScrollerContent} horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
        <View style={styles.csvTable}>
          <View style={styles.csvRow}>
            {previewFields.map((field) => (
              <View key={field.id} style={[styles.csvCell, { width: getCsvColumnWidth(field.id) }]}>
                <AppText align={isLtrField(field.id) ? 'left' : 'right'} numberOfLines={1} style={[styles.csvHeaderText, getCsvTextDirectionStyle(field.id)]} variant="caption">
                  {field.label}
                </AppText>
              </View>
            ))}
          </View>
          <View style={[styles.csvRow, styles.csvDataRow]}>
            {previewFields.map((field) => (
              <View key={field.id} style={[styles.csvCell, { width: getCsvColumnWidth(field.id) }]}>
                <AppText
                  align={isLtrField(field.id) ? 'left' : 'right'}
                  ellipsizeMode={field.id === 'clientName' ? 'tail' : undefined}
                  numberOfLines={1}
                  style={[styles.csvValueText, getCsvTextDirectionStyle(field.id)]}
                  variant="caption"
                >
                  {getCsvPreviewValue(invoice, field.id)}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <AppText style={Platform.OS === 'android' ? styles.previewDescriptionAndroid : undefined} tone="secondary" variant="caption">
        اسحب أفقيًا لمشاهدة بقية الأعمدة.
      </AppText>
    </View>
  );
}

function FormatNote({ fileFormat, fields }: { fileFormat: ExportFileFormat | null; fields: { id: ExportFieldId; label: string }[] }) {
  if (fileFormat === 'pdf') {
    return (
      <View style={styles.pdfPreview}>
        <View style={styles.pdfLineWide} />
        <View style={styles.pdfLine} />
        <AppText style={Platform.OS === 'android' ? styles.previewDescriptionAndroid : undefined} tone="secondary" variant="supporting">
          سيتم تنسيق الفواتير في مستند مناسب للحفظ والطباعة.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.csvNote}>
      <AppText style={Platform.OS === 'android' ? styles.previewDescriptionAndroid : undefined} tone="secondary" variant="supporting">
        سيتم ترتيب كل فاتورة في صف مستقل، مع تضمين الحقول المختارة كأعمدة.
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.columnPreview}>
          {fields.slice(0, 8).map((field) => (
            <View key={field.id} style={styles.columnChip}>
              <AppText align="center" variant="caption">
                {field.label}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function InvoicePreviewRow({ invoice }: { invoice: InvoiceSummary }) {
  const statusBadge = <InvoiceStatusBadge status={invoice.displayStatus} />;
  const identity = (
    <View style={[styles.previewIdentity, Platform.OS === 'android' && styles.previewIdentityAndroid]}>
      <AppText style={Platform.OS === 'android' ? styles.previewIdentityTextAndroid : undefined} variant="cardTitle">
        {invoice.clientName}
      </AppText>
      <AppText
        align={Platform.OS === 'android' ? 'right' : 'left'}
        numberOfLines={Platform.OS === 'android' ? 1 : undefined}
        style={[styles.ltrText, Platform.OS === 'android' && styles.previewIdentityTextAndroid]}
        tone="secondary"
        variant="caption"
      >
        {directionSafeText(invoice.invoiceNumber)}
      </AppText>
    </View>
  );

  return (
    <View style={styles.invoicePreviewRow}>
      <View style={[styles.previewTop, Platform.OS === 'android' && styles.previewTopAndroid]}>
        {Platform.OS === 'android' ? statusBadge : identity}
        {Platform.OS === 'android' ? identity : statusBadge}
      </View>
      <View style={styles.rows}>
        <AmountRow label="الإجمالي" value={invoice.total} />
        <AmountRow label="المدفوع" tone="success" value={invoice.paid} />
        <AmountRow label="المتبقي" value={invoice.remaining} />
      </View>
    </View>
  );
}

function AmountRow({ label, value, tone }: { label: string; value: number; tone?: 'success' }) {
  const labelText = (
    <AppText style={Platform.OS === 'android' ? styles.summaryLabelTextAndroid : undefined} tone="secondary" variant="supporting">
      {label}
    </AppText>
  );
  const valueText = (
    <AppText align="left" style={[styles.amountText, tone === 'success' && styles.successText]} variant="cardTitle">
      {formatSar(value)}
    </AppText>
  );

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.textRow, styles.textRowAndroid]}>
        <View style={styles.summaryValueSlotAndroid}>{valueText}</View>
        <View style={styles.summaryLabelSlotAndroid}>{labelText}</View>
      </View>
    );
  }

  return (
    <View style={styles.textRow}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <AppText align="left" style={[styles.amountText, tone === 'success' && styles.successText]} variant="cardTitle">
        {formatSar(value)}
      </AppText>
    </View>
  );
}

function TextRow({ label, value, ltrValue }: { label: string; value: string; ltrValue?: boolean }) {
  const usesLtrValue = ltrValue || (Platform.OS === 'android' && /^\d[\d.,]*$/.test(value));
  const labelText = (
    <AppText style={Platform.OS === 'android' ? styles.summaryLabelTextAndroid : undefined} tone="secondary" variant="supporting">
      {label}
    </AppText>
  );
  const valueText = (
    <AppText
      align={Platform.OS === 'android' || ltrValue ? 'left' : 'right'}
      style={[styles.textRowValue, usesLtrValue && styles.ltrText, Platform.OS === 'android' && !usesLtrValue && styles.summaryRtlValueAndroid]}
      variant="cardTitle"
    >
      {value}
    </AppText>
  );

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.textRow, styles.textRowAndroid]}>
        <View style={styles.summaryValueSlotAndroid}>{valueText}</View>
        <View style={styles.summaryLabelSlotAndroid}>{labelText}</View>
      </View>
    );
  }

  return (
    <View style={styles.textRow}>
      {labelText}
      {valueText}
    </View>
  );
}

function FileNameRow({ value }: { value: string }) {
  const labelText = (
    <AppText style={Platform.OS === 'android' ? styles.summaryLabelTextAndroid : undefined} tone="secondary" variant="supporting">
      اسم ملف مقترح
    </AppText>
  );
  const valueText = (
    <View style={[styles.fileNameValueWrap, Platform.OS === 'android' && styles.fileNameValueWrapAndroid]}>
      <AppText align="left" ellipsizeMode="middle" numberOfLines={1} style={styles.fileNameValue} variant="cardTitle">
        {value}
      </AppText>
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.textRow, styles.textRowAndroid]}>
        <View style={styles.summaryValueSlotAndroid}>{valueText}</View>
        <View style={styles.summaryLabelSlotAndroid}>{labelText}</View>
      </View>
    );
  }

  return (
    <View style={styles.textRow}>
      {labelText}
      {valueText}
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

function parseScopeParam(value: string | string[] | undefined): InvoiceScope {
  const candidate = getParamValue(value);
  return candidate && validScopeIds.has(candidate as InvoiceScope) ? (candidate as InvoiceScope) : 'all';
}

function parsePeriodParam(value: string | string[] | undefined): InvoicePeriod {
  const candidate = getParamValue(value);
  return candidate && validPeriodIds.has(candidate as InvoicePeriod) ? (candidate as InvoicePeriod) : 'all';
}

function parseFormatParam(value: string | string[] | undefined): ExportFileFormat | null {
  const candidate = getParamValue(value);
  return candidate && validFormatIds.has(candidate as ExportFileFormat) ? (candidate as ExportFileFormat) : null;
}

function parseSelectedFieldKeys(value: string | string[] | undefined) {
  const selectedFieldKeys = getParamValue(value);

  if (!selectedFieldKeys) {
    return [];
  }

  return selectedFieldKeys
    .split(',')
    .map((field) => field.trim())
    .filter((field): field is ExportFieldId => validFieldIds.has(field as ExportFieldId));
}

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getScopeLabel(scope: InvoiceScope) {
  return invoiceScopeOptions.find((option) => option.id === scope)?.label ?? 'جميع الفواتير';
}

function getCsvPreviewValue(invoice: InvoiceSummary, fieldId: ExportFieldId) {
  switch (fieldId) {
    case 'invoiceNumber':
      return directionSafeText(invoice.invoiceNumber);
    case 'clientName':
      return invoice.clientName;
    case 'issueDate':
      return invoice.issueDate;
    case 'dueDate':
      return invoice.dueDate;
    case 'status':
      return invoice.displayStatus.label;
    case 'total':
      return formatSar(invoice.total);
    case 'paid':
      return formatSar(invoice.paid);
    case 'remaining':
      return formatSar(invoice.remaining);
    case 'items':
      return `${invoice.items.length}`;
    case 'payments':
      return `${invoice.payments.length}`;
    case 'notes':
      return invoice.notes || 'لا توجد';
  }
}

function isLtrField(fieldId: ExportFieldId) {
  return fieldId === 'invoiceNumber' || fieldId === 'total' || fieldId === 'paid' || fieldId === 'remaining';
}

function getCsvColumnWidth(fieldId: ExportFieldId) {
  switch (fieldId) {
    case 'invoiceNumber':
      return 150;
    case 'clientName':
      return 180;
    case 'status':
      return 140;
    case 'issueDate':
    case 'dueDate':
      return 140;
    case 'total':
    case 'paid':
    case 'remaining':
      return 130;
    default:
      return 140;
  }
}

function getCsvTextDirectionStyle(fieldId: ExportFieldId) {
  return isLtrField(fieldId) ? styles.csvLtrText : styles.csvRtlText;
}

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
  statusCard: {
    backgroundColor: 'rgba(2,25,42,0.92)',
    borderColor: 'rgba(46,168,255,0.24)',
    gap: spacing.md,
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  statusHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(46,168,255,0.14)',
    borderColor: 'rgba(46,168,255,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  statusCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  statusCopyAndroid: {
    alignItems: 'flex-end',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  titleRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  statusTitleAndroid: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusDescriptionAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  warningCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  warningText: {
    color: colors.semantic.warning,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionHeaderTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rows: {
    gap: spacing.sm,
    ...Platform.select({ android: { width: '100%' } }),
  },
  textRow: {
    alignItems: 'flex-start',
    borderTopColor: colors.surface.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  textRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  summaryValueSlotAndroid: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  summaryLabelSlotAndroid: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  summaryLabelTextAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryRtlValueAndroid: {
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  textRowValue: {
    flexShrink: 1,
    minWidth: 0,
  },
  fileNameValueWrap: {
    flex: 1,
    minWidth: 0,
  },
  fileNameValueWrapAndroid: {
    flex: 0,
    width: '100%',
  },
  fileNameValue: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  amountText: {
    writingDirection: 'ltr',
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  successText: {
    color: '#35D39A',
  },
  chipWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fieldChip: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkButton: {
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  linkText: {
    color: '#9DD5FF',
  },
  csvNote: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  columnPreview: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  columnChip: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  csvPreviewWrap: {
    gap: spacing.sm,
  },
  previewDescriptionAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  csvScrollerContent: {
    paddingHorizontal: 1,
  },
  csvTable: {
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    minWidth: 720,
    overflow: 'hidden',
  },
  csvRow: {
    flexDirection: 'row',
  },
  csvDataRow: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  csvCell: {
    borderRightColor: colors.surface.separator,
    borderRightWidth: StyleSheet.hairlineWidth,
    minHeight: 46,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  csvHeaderText: {
    color: colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  csvValueText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    minWidth: 0,
  },
  csvLtrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  csvRtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pdfPreview: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  pdfLineWide: {
    alignSelf: 'flex-end',
    backgroundColor: colors.text.secondary,
    borderRadius: radii.pill,
    height: 8,
    opacity: 0.45,
    width: '74%',
  },
  pdfLine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 7,
    opacity: 0.35,
    width: '52%',
  },
  previewList: {
    gap: spacing.md,
  },
  invoicePreviewRow: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  previewTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  previewTopAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  previewIdentity: {
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
  emptyPreview: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
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
  actions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
