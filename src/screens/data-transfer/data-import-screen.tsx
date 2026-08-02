import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { ledgerGroups } from '@/screens/ledger/ledger-data';
import { prototypeTransactions } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

import { parseCsvText } from './csv-parser';
import { createDuplicateKey } from './duplicate-detection';
import {
  suggestCsvColumnMapping,
  validateImportedTransactions,
} from './import-calculations';
import type { CsvColumnMapping, ImportedTransactionDraft, ImportResult } from './data-transfer-types';

const importLimit = 2000;

type SelectedCsvFile = {
  name: string;
  size: number | null;
  mimeType?: string;
};

type MappingFieldKey = keyof CsvColumnMapping;

const csvTemplate = `date,description,amount,type,category,reference
2026-07-01,تصميم هوية بصرية,18500,income,خدمات,INV-1001
2026-07-02,اشتراك أدوات تصميم,420,expense,البرمجيات والاشتراكات,SUB-002`;

const requiredFields: { key: keyof CsvColumnMapping; label: string; required: boolean }[] = [
  { key: 'date', label: 'التاريخ', required: true },
  { key: 'description', label: 'الوصف', required: true },
  { key: 'amount', label: 'المبلغ', required: true },
  { key: 'type', label: 'نوع العملية', required: false },
  { key: 'category', label: 'التصنيف', required: false },
  { key: 'reference', label: 'المرجع', required: false },
  { key: 'notes', label: 'ملاحظات', required: false },
  { key: 'party', label: 'العميل أو المورد', required: false },
  { key: 'account', label: 'الحساب', required: false },
];

const coreMappingFields: MappingFieldKey[] = ['date', 'description', 'amount', 'type'];

export function DataImportScreen() {
  const insets = useSafeAreaInsets();
  const [csvText, setCsvText] = useState(csvTemplate);
  const [mapping, setMapping] = useState<CsvColumnMapping>({});
  const [useAmountSign, setUseAmountSign] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedCsvFile | null>(null);
  const [fileReadError, setFileReadError] = useState<string | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [mappingSelectorField, setMappingSelectorField] = useState<MappingFieldKey | null>(null);

  const parseResult = useMemo(() => {
    if (!csvText.trim()) {
      return null;
    }

    return parseCsvText(csvText);
  }, [csvText]);

  const activeMapping = useMemo(() => {
    if (!parseResult) {
      return mapping;
    }

    return { ...suggestCsvColumnMapping(parseResult.headers), ...mapping };
  }, [mapping, parseResult]);

  const validation = useMemo(() => {
    if (!parseResult || parseResult.rows.length === 0 || parseResult.rows.length > importLimit) {
      return null;
    }

    return validateImportedTransactions(parseResult.rows, activeMapping, useAmountSign, getExistingTransactionDrafts());
  }, [activeMapping, parseResult, useAmountSign]);

  const mappingBlockReason = useMemo(
    () => getMappingBlockReason(activeMapping, useAmountSign),
    [activeMapping, useAmountSign],
  );

  function handleParse() {
    Haptics.selectionAsync().catch(() => null);
    setImportResult(null);

    if (!csvText.trim()) {
      setParseError('ألصق محتوى CSV أو استخدم النموذج الجاهز.');
      return;
    }

    if (!parseResult || parseResult.headers.length === 0 || parseResult.rows.length === 0) {
      setParseError('يجب أن يحتوي الملف على Header وصف بيانات واحد على الأقل.');
      return;
    }

    if (parseResult.rows.length > importLimit) {
      setParseError('يمكن استيراد حتى 2,000 عملية في المرة الواحدة. قسّم الملف ثم حاول مجددًا.');
      return;
    }

    setParseError(null);
  }

  async function handlePickCsvFile() {
    Haptics.selectionAsync().catch(() => null);
    setIsPickingFile(true);
    setFileReadError(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        return;
      }

      if (!isCsvDocument(asset)) {
        setFileReadError('تعذر قراءة الملف: اختر ملفًا بصيغة CSV ثم حاول مرة أخرى.');
        return;
      }

      const text = await readDocumentText(asset.uri);

      if (!text.trim()) {
        setFileReadError('تعذر قراءة الملف: الملف فارغ أو لا يحتوي على CSV صالح.');
        return;
      }

      setSelectedFile({
        name: asset.name,
        size: asset.size ?? null,
        mimeType: asset.mimeType,
      });
      setCsvText(text);
      setMapping({});
      setParseError(null);
      setImportResult(null);
    } catch {
      setFileReadError('تعذر قراءة الملف. تأكد أن الملف بصيغة CSV وغير تالف، ثم حاول مرة أخرى.');
    } finally {
      setIsPickingFile(false);
    }
  }

  function openMappingSelector(field: MappingFieldKey) {
    if (!parseResult) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    Keyboard.dismiss();
    setMappingSelectorField(field);
  }

  function handleSelectMapping(field: MappingFieldKey, column: string) {
    if (isColumnDisabledForField(column, field, activeMapping)) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setMapping((current) => ({ ...current, [field]: column }));
    setImportResult(null);
    setMappingSelectorField(null);
  }

  function handleRestoreSuggestedMapping() {
    if (!parseResult) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setMapping(suggestCsvColumnMapping(parseResult.headers));
    setImportResult(null);
  }

  function handleConfirmImport() {
    if (!validation) {
      return;
    }

    const importedCount = validation.validatedRows.filter((row) => row.status === 'valid').length;
    const duplicateSkipped = validation.validatedRows.filter((row) => row.status === 'duplicate').length;
    const errorSkipped = validation.validatedRows.filter((row) => row.status === 'error').length;
    setImportResult({ importedCount, duplicateSkipped, errorSkipped });
  }

  function handleUseTemplate() {
    Haptics.selectionAsync().catch(() => null);
    setCsvText(csvTemplate);
    setMapping({});
    setParseError(null);
    setImportResult(null);
    setSelectedFile(null);
    setFileReadError(null);
  }

  function handleShareTemplate() {
    Share.share({ message: csvTemplate, title: 'capital-transactions-template.csv' }).catch(() => null);
  }

  const canImport = Boolean(validation && !mappingBlockReason && validation.summary.validRows > 0 && validation.summary.errorRows === 0);

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <PrivacyCard />
        <FormatCards />

        <SolidCard style={styles.sectionCard}>
          <SectionHeader iconName="document-text-outline" title="ملف CSV" />
          <AppText tone="secondary" variant="supporting">
            يمكنك اختيار ملف CSV من الهاتف أو لصق محتوى CSV يدويًا. تتم القراءة والمعالجة محليًا داخل الجهاز دون إرسال الملف لأي API.
          </AppText>
          <AppButton loading={isPickingFile} onPress={handlePickCsvFile}>
            اختيار ملف CSV
          </AppButton>
          {fileReadError ? <ErrorText>{fileReadError}</ErrorText> : null}
          <View style={styles.actionsRow}>
            <AppButton onPress={handleUseTemplate} style={styles.rowButton} variant="secondary">
              استخدام النموذج
            </AppButton>
            <AppButton onPress={handleShareTemplate} style={styles.rowButton} variant="secondary">
              مشاركة النموذج
            </AppButton>
          </View>
          <TextInput
            multiline
            onChangeText={(text) => {
              setCsvText(text);
              setSelectedFile(null);
              setFileReadError(null);
              setImportResult(null);
            }}
            placeholder="ألصق محتوى CSV هنا"
            placeholderTextColor={colors.text.tertiary}
            style={styles.csvInput}
            textAlign="left"
            value={csvText}
          />
          <AppButton onPress={handleParse}>معاينة CSV</AppButton>
          {parseError ? <ErrorText>{parseError}</ErrorText> : null}
        </SolidCard>

        {parseResult ? (
          <SolidCard style={styles.sectionCard}>
            <SectionHeader iconName="stats-chart-outline" title="ملخص القراءة" />
            {selectedFile ? (
              <>
                <SummaryRow label="اسم الملف" value={selectedFile.name} ltr />
                <Divider />
                <SummaryRow label="حجم الملف" value={formatFileSize(selectedFile.size)} ltr />
                <Divider />
              </>
            ) : null}
            <SummaryRow label="عدد الصفوف" value={`${parseResult.rows.length}`} ltr />
            <Divider />
            <SummaryRow label="الفاصل المكتشف" value={parseResult.delimiter === '\t' ? 'Tab' : parseResult.delimiter} ltr />
            <Divider />
            <SummaryRow label="عدد الأعمدة" value={`${parseResult.headers.length}`} ltr />
            {parseResult.errors.map((error) => (
              <ErrorText key={`${error.rowNumber}-${error.message}`}>{error.message}</ErrorText>
            ))}
          </SolidCard>
        ) : null}

        {parseResult && parseResult.rows.length <= importLimit ? (
          <SolidCard style={styles.sectionCard}>
            <SectionHeader iconName="swap-horizontal-outline" title="ربط الأعمدة" />
            <AppText tone="secondary" variant="supporting">
              اضغط على أي صف لتغيير العمود المرتبط. لا يتم ربط العمود الواحد تلقائيًا بأكثر من حقل أساسي.
            </AppText>
            <AppButton onPress={handleRestoreSuggestedMapping} variant="secondary">
              استعادة الربط المقترح
            </AppButton>
            {requiredFields.map((field) => (
              <Pressable
                accessibilityLabel={field.label}
                accessibilityRole="button"
                key={field.key}
                onPress={() => openMappingSelector(field.key)}
                style={({ pressed }) => [styles.mappingRow, pressed && styles.pressed]}
              >
                <View style={styles.mappingCopy}>
                  <AppText variant="body">{field.label}</AppText>
                  <AppText tone={field.required && !activeMapping[field.key] ? 'warning' : 'secondary'} variant="caption">
                    {field.required ? 'مطلوب' : 'اختياري'}
                  </AppText>
                </View>
                <AppText style={styles.ltrText} variant="body">
                  {activeMapping[field.key] ?? 'غير محدد'}
                </AppText>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: useAmountSign }}
              onPress={() => setUseAmountSign((current) => !current)}
              style={({ pressed }) => [styles.switchRow, pressed && styles.pressed]}
            >
              <View style={styles.switchCopy}>
                <AppText variant="body">تحديد النوع من إشارة المبلغ</AppText>
                <AppText tone="secondary" variant="caption">
                  موجب = دخل، سالب = مصروف.
                </AppText>
              </View>
              <View style={[styles.switchTrack, useAmountSign && styles.switchTrackActive]}>
                <View style={[styles.switchThumb, useAmountSign && styles.switchThumbActive]} />
              </View>
            </Pressable>
          </SolidCard>
        ) : null}

        {validation ? (
          <SolidCard style={styles.sectionCard}>
            <SectionHeader iconName="checkmark-circle-outline" title="معاينة التحقق" />
            <SummaryRow label="صالحة" value={`${validation.summary.validRows}`} ltr />
            <Divider />
            <SummaryRow label="مكررة" value={`${validation.summary.duplicateRows}`} ltr />
            <Divider />
            <SummaryRow label="تحتاج تصحيح" value={`${validation.summary.errorRows}`} ltr />
            <Divider />
            <SummaryRow label="صيغة التاريخ" value={validation.summary.detectedDateFormat} ltr />

            <View style={styles.previewList}>
              {validation.validatedRows.slice(0, 6).map((row) => (
                <View key={row.rowNumber} style={styles.previewRow}>
                  <View style={styles.previewCopy}>
                    <AppText numberOfLines={1} variant="body">
                      {row.draft?.description ?? `صف ${row.rowNumber}`}
                    </AppText>
                    <AppText tone={row.status === 'error' ? 'danger' : row.status === 'duplicate' ? 'warning' : 'secondary'} variant="caption">
                      {row.errors[0] ?? row.draft?.date ?? ''}
                    </AppText>
                  </View>
                  <AppText style={styles.ltrText} tone={row.draft?.type === 'income' ? 'success' : 'primary'} variant="body">
                    {row.draft ? `${row.draft.amount} SAR` : row.status}
                  </AppText>
                </View>
              ))}
            </View>
            {mappingBlockReason ? <ErrorText>{mappingBlockReason}</ErrorText> : null}
            <AppButton disabled={!canImport} onPress={handleConfirmImport}>
              تأكيد الإضافة
            </AppButton>
          </SolidCard>
        ) : null}

        {importResult ? (
          <SolidCard style={styles.resultCard}>
            <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={22} />
            <View style={styles.resultCopy}>
              <AppText tone="success" variant="cardTitle">
                تمت مراجعة الاستيراد محليًا
              </AppText>
              <AppText tone="secondary" variant="supporting">
                تمت معالجة {importResult.importedCount} صف، وتجاهل {importResult.duplicateSkipped} مكرر، و{importResult.errorSkipped} صف به أخطاء. لا توجد دالة Store عمليات قابلة للكتابة حاليًا، لذلك لم يتم حفظ عمليات جديدة.
              </AppText>
            </View>
          </SolidCard>
        ) : null}
      </ScrollView>
      <ColumnMappingSelector
        activeMapping={activeMapping}
        field={mappingSelectorField}
        headers={parseResult?.headers ?? []}
        onClose={() => setMappingSelectorField(null)}
        onSelect={handleSelectMapping}
      />
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
          استيراد البيانات
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          أضف عملياتك السابقة من CSV وراجعها قبل الحفظ.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function PrivacyCard() {
  return (
    <SolidCard style={styles.privacyCard}>
      <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={20} />
      <AppText style={styles.flexText} tone="secondary" variant="supporting">
        تتم معالجة الملف محليًا على جهازك في هذه النسخة التجريبية. لا يتم إرسال الملف إلى API ولا يتم تسجيل محتواه.
      </AppText>
    </SolidCard>
  );
}

function FormatCards() {
  return (
    <View style={styles.formatGrid}>
      <SolidCard style={[styles.formatCard, styles.formatCardActive]}>
        <Ionicons color={colors.semantic.success} name="document-text-outline" size={22} />
        <AppText variant="cardTitle">ملف CSV</AppText>
        <AppText align="center" tone="secondary" variant="caption">
          استيراد العمليات من ملف نصي مفصول بأعمدة.
        </AppText>
      </SolidCard>
      <SolidCard style={styles.formatCard}>
        <View style={styles.soonBadge}>
          <AppText tone="warning" variant="caption">
            قريبًا
          </AppText>
        </View>
        <Ionicons color={colors.text.tertiary} name="grid-outline" size={22} />
        <AppText tone="secondary" variant="cardTitle">
          ملف Excel
        </AppText>
        <AppText align="center" tone="tertiary" variant="caption">
          دعم XLSX سيأتي في مرحلة لاحقة.
        </AppText>
      </SolidCard>
    </View>
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

function ErrorText({ children }: { children: string }) {
  return (
    <AppText tone="danger" variant="caption">
      {children}
    </AppText>
  );
}

function ColumnMappingSelector({
  activeMapping,
  field,
  headers,
  onClose,
  onSelect,
}: {
  activeMapping: CsvColumnMapping;
  field: MappingFieldKey | null;
  headers: string[];
  onClose: () => void;
  onSelect: (field: MappingFieldKey, column: string) => void;
}) {
  if (!field) {
    return null;
  }

  const currentValue = activeMapping[field] ?? '';
  const options = ['', ...headers];

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalOverlay}>
        <Pressable style={styles.mappingSheet}>
          <View style={styles.modalHandle} />
          <AppText align="center" variant="sectionTitle">
            اختيار عمود {getMappingFieldLabel(field)}
          </AppText>
          <ScrollView contentContainerStyle={styles.columnOptions} showsVerticalScrollIndicator={false}>
            {options.map((column) => {
              const selected = currentValue === column;
              const disabled = isColumnDisabledForField(column, field, activeMapping);
              const usage = getColumnUsageLabel(column, field, activeMapping);

              return (
                <Pressable
                  accessibilityLabel={column || 'غير محدد'}
                  accessibilityRole="button"
                  accessibilityState={{ disabled, selected }}
                  disabled={disabled}
                  key={column || 'unmapped'}
                  onPress={() => onSelect(field, column)}
                  style={({ pressed }) => [
                    styles.columnOption,
                    selected && styles.columnOptionSelected,
                    disabled && styles.columnOptionDisabled,
                    pressed && !disabled && styles.pressed,
                  ]}
                >
                  <View style={styles.columnOptionCopy}>
                    <AppText style={column && styles.ltrText} variant="body">
                      {column || 'غير محدد'}
                    </AppText>
                    {usage ? (
                      <AppText tone="warning" variant="caption">
                        {usage}
                      </AppText>
                    ) : null}
                  </View>
                  {selected ? <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={20} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <AppButton onPress={onClose} variant="secondary">
            إغلاق
          </AppButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getExistingTransactionDrafts(): ImportedTransactionDraft[] {
  const ledgerDrafts = ledgerGroups.flatMap((group) =>
    group.transactions.map((transaction) => ({
      rowNumber: 0,
      date: transaction.timestamp.slice(0, 10),
      description: transaction.title,
      amount: Math.abs(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      reference: transaction.reference,
      notes: '',
      party: '',
      account: '',
    })),
  );
  const operationDrafts = prototypeTransactions.map((transaction) => ({
    rowNumber: 0,
    date: transaction.type === 'income' ? '2026-07-10' : '2026-07-12',
    description: transaction.title,
    amount: Math.abs(Number(transaction.amount.replace(/[^\d.-]/g, '')) || 0),
    type: transaction.type,
    category: transaction.category,
    reference: transaction.reference,
    notes: '',
    party: '',
    account: transaction.account,
  }));

  return [...ledgerDrafts, ...operationDrafts].filter((draft) => createDuplicateKey(draft).length > 0);
}

function getMappingBlockReason(mapping: CsvColumnMapping, useAmountSign: boolean) {
  if (!mapping.date) {
    return 'اربط عمود التاريخ قبل المتابعة.';
  }

  if (!mapping.description) {
    return 'اربط عمود الوصف قبل المتابعة.';
  }

  if (!mapping.amount) {
    return 'اربط عمود المبلغ قبل المتابعة.';
  }

  if (!useAmountSign && !mapping.type) {
    return 'اربط عمود نوع العملية أو فعّل تحديد النوع من إشارة المبلغ.';
  }

  const duplicateCoreColumn = findDuplicateCoreMapping(mapping);

  if (duplicateCoreColumn) {
    return `العمود ${duplicateCoreColumn} مستخدم في أكثر من حقل أساسي.`;
  }

  return null;
}

function findDuplicateCoreMapping(mapping: CsvColumnMapping) {
  const seen = new Set<string>();

  for (const field of coreMappingFields) {
    const column = mapping[field];

    if (!column) {
      continue;
    }

    if (seen.has(column)) {
      return column;
    }

    seen.add(column);
  }

  return null;
}

function getMappingFieldLabel(field: MappingFieldKey) {
  return requiredFields.find((item) => item.key === field)?.label ?? field;
}

function getColumnUsageLabel(column: string, currentField: MappingFieldKey, mapping: CsvColumnMapping) {
  if (!column) {
    return null;
  }

  const usedField = requiredFields.find((item) => item.key !== currentField && mapping[item.key] === column);

  if (!usedField) {
    return null;
  }

  return `مستخدم في: ${usedField.label}`;
}

function isColumnDisabledForField(column: string, currentField: MappingFieldKey, mapping: CsvColumnMapping) {
  if (!column) {
    return false;
  }

  return requiredFields.some((item) => item.key !== currentField && mapping[item.key] === column);
}

function isCsvDocument(asset: DocumentPicker.DocumentPickerAsset) {
  const mimeType = asset.mimeType?.toLowerCase();
  const name = asset.name.toLowerCase();

  return (
    name.endsWith('.csv') ||
    mimeType === 'text/csv' ||
    mimeType === 'text/comma-separated-values' ||
    mimeType === 'text/plain'
  );
}

async function readDocumentText(uri: string) {
  const response = await fetch(uri);
  return response.text();
}

function formatFileSize(size: number | null) {
  if (!Number.isFinite(size) || !size) {
    return 'غير معروف';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
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
  privacyCard: {
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
  formatGrid: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  formatCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    minHeight: 128,
  },
  formatCardActive: {
    borderColor: 'rgba(79,138,91,0.38)',
  },
  soonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  rowButton: {
    flex: 1,
  },
  csvInput: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 13,
    minHeight: 136,
    padding: spacing.md,
    textAlignVertical: 'top',
    writingDirection: 'ltr',
  },
  mappingRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mappingCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 66,
    padding: spacing.md,
  },
  switchCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  switchTrack: {
    backgroundColor: colors.surface.disabled,
    borderRadius: radii.pill,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 54,
  },
  switchTrackActive: {
    backgroundColor: colors.semantic.success,
  },
  switchThumb: {
    backgroundColor: colors.text.primary,
    borderRadius: radii.pill,
    height: 24,
    width: 24,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  previewList: {
    gap: spacing.sm,
  },
  previewRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.input,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.md,
  },
  previewCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  resultCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  resultCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.58)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  mappingSheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: '76%',
    padding: spacing.lg,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: colors.surface.border,
    borderRadius: radii.pill,
    height: 4,
    width: 42,
  },
  columnOptions: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  columnOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  columnOptionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.38)',
  },
  columnOptionDisabled: {
    opacity: 0.46,
  },
  columnOptionCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
