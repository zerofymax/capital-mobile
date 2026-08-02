import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { useBusinessInformation } from '@/screens/account/business-information-data';
import { useFinancialAccounts } from '@/screens/account/financial-accounts-data';
import { useUserProfile } from '@/screens/account/profile-data';
import { useBudgetsStore } from '@/screens/budgets/budgets-store';
import { useGoalsStore } from '@/screens/goals/goals-store';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import { useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { useStartupReportsStore } from '@/screens/reports/startup-report-store';
import { useAppearanceSettings } from '@/state/appearance-state';
import { useCategoriesStore } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

import {
  CAPITAL_BACKUP_MAX_BYTES,
  buildCapitalBackupFileName,
  createCapitalBackup,
  importCapitalBackup,
  readAndValidateCapitalBackup,
  summarizeCapitalBackup,
  writeCapitalBackupToCache,
  type BackupSummary,
  type BackupValidationResult,
  type CapitalBackup,
} from './local-backup';

type LocalBackupMode = 'export' | 'import';

type LocalBackupScreenProps = {
  mode: LocalBackupMode;
};

type SelectedBackup = {
  backup: CapitalBackup;
  fileName: string;
  summary: BackupSummary;
  warnings: readonly string[];
};

const headerCopy: Record<LocalBackupMode, { title: string; subtitle: string }> = {
  export: {
    title: 'تصدير البيانات',
    subtitle: 'أنشئ نسخة JSON محلية قابلة للاستعادة.',
  },
  import: {
    title: 'استيراد البيانات',
    subtitle: 'استعد نسخة Capital داخل الجلسة الحالية.',
  },
};

export function LocalBackupScreen({ mode }: LocalBackupScreenProps) {
  const insets = useSafeAreaInsets();
  useAppearanceSettings();
  useBudgetsStore();
  useBusinessInformation();
  useCategoriesStore();
  useFinancialAccounts();
  useGoalsStore();
  useInvoicesStore();
  useUserProfile();
  useRecurringExpensesStore();
  useStartupReportsStore();
  useTransactionsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<SelectedBackup | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const currentSummary = summarizeCapitalBackup(createCapitalBackup().data);

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    Haptics.selectionAsync().catch(() => null);

    try {
      const now = new Date();
      const backup = createCapitalBackup(now);
      const file = writeCapitalBackupToCache(backup, now);
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        Alert.alert(
          'تعذر مشاركة النسخة الاحتياطية',
          'تم إنشاء الملف داخل مساحة التطبيق المؤقتة، لكن المشاركة غير متاحة على هذا الجهاز.',
        );
        return;
      }

      await Sharing.shareAsync(file.uri, {
        dialogTitle: 'تصدير نسخة Capital الاحتياطية',
        mimeType: 'application/json',
        UTI: 'public.json',
      });
    } catch {
      Alert.alert('تعذر إنشاء النسخة الاحتياطية', 'حاول مرة أخرى بعد قليل.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handlePickBackup() {
    if (isPicking || isImporting) {
      return;
    }

    setIsPicking(true);
    Haptics.selectionAsync().catch(() => null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ['application/json', 'text/json', 'text/plain'],
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri || !asset.name.toLowerCase().endsWith('.json')) {
        Alert.alert('ملف غير صالح', 'اختر ملف نسخة احتياطية بصيغة JSON.');
        return;
      }

      if ((asset.size ?? 0) > CAPITAL_BACKUP_MAX_BYTES) {
        Alert.alert(
          'الملف كبير جدًا',
          'اختر ملف نسخة احتياطية صالحًا بحجم لا يتجاوز 10 ميجابايت.',
        );
        return;
      }

      const validation = await readAndValidateCapitalBackup(asset.uri, asset.size);

      if (!validation.ok) {
        showValidationError(validation);
        return;
      }

      setSelectedBackup({
        backup: validation.backup,
        fileName: asset.name,
        summary: validation.summary,
        warnings: validation.warnings,
      });
      setPreviewVisible(true);
    } catch {
      Alert.alert('تعذر قراءة الملف', 'تعذر قراءة الملف.');
    } finally {
      setIsPicking(false);
    }
  }

  function requestImport() {
    setPreviewVisible(false);
    setConfirmVisible(true);
  }

  function handleImportConfirm() {
    if (!selectedBackup || isImporting) {
      return;
    }

    setConfirmVisible(false);
    setIsImporting(true);

    requestAnimationFrame(() => {
      const result = importCapitalBackup(selectedBackup.backup);
      setIsImporting(false);

      if (!result.ok) {
        Alert.alert('تعذر استيراد البيانات', result.reason);
        return;
      }

      setSelectedBackup(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      Alert.alert(
        'تم استيراد البيانات',
        'تم استبدال البيانات المحلية بالنسخة الاحتياطية داخل جلسة التطبيق الحالية.',
      );
    });
  }

  const copy = headerCopy[mode];

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Header subtitle={copy.subtitle} title={copy.title} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <PrivacyCard />
        {mode === 'export' ? (
          <ExportContent
            isExporting={isExporting}
            onExport={handleExport}
            summary={currentSummary}
          />
        ) : (
          <ImportContent
            isPicking={isPicking}
            onPick={handlePickBackup}
            selectedFileName={selectedBackup?.fileName}
          />
        )}
      </ScrollView>

      <BackupPreviewModal
        onClose={() => setPreviewVisible(false)}
        onImport={requestImport}
        selectedBackup={selectedBackup}
        visible={previewVisible}
      />
      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="استيراد البيانات"
        description="سيؤدي هذا الإجراء إلى استبدال بيانات Capital المحلية الحالية. لا يمكن التراجع عنه بعد إغلاق النسخة الحالية من التطبيق."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleImportConfirm}
        title="استبدال البيانات الحالية؟"
        tone="danger"
        visible={confirmVisible}
      />
    </SafeAreaView>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" variant="screenTitle">
          {title}
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          {subtitle}
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function PrivacyCard() {
  return (
    <SolidCard style={styles.privacyCard}>
      <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={21} />
      <View style={styles.flexCopy}>
        <AppText variant="cardTitle">نسخة محلية فقط</AppText>
        <AppText style={styles.wrappingText} tone="secondary" variant="supporting">
          يُنشأ الملف محليًا ولا يُرفع تلقائيًا إلى أي خادم. قد يحتوي على بيانات شخصية
          ومالية، فلا تشاركه إلا مع جهة موثوقة. ولا تتضمن النسخة كلمات مرور أو رموز دخول.
        </AppText>
      </View>
    </SolidCard>
  );
}

function ExportContent({
  summary,
  isExporting,
  onExport,
}: {
  summary: BackupSummary;
  isExporting: boolean;
  onExport: () => void;
}) {
  return (
    <>
      <SolidCard style={styles.sectionCard}>
        <SectionHeader iconName="archive-outline" title="تصدير نسخة احتياطية" />
        <AppText tone="secondary" variant="supporting">
          أنشئ ملفًا محليًا يحتوي على بيانات Capital القابلة للاستعادة لاحقًا.
        </AppText>
        <SummaryGrid expanded summary={summary} />
      </SolidCard>

      <SolidCard style={styles.fileCard}>
        <SummaryRow label="الصيغة" ltr value="JSON" />
        <Divider />
        <SummaryRow label="اسم الملف" ltr value={buildCapitalBackupFileName()} />
        <Divider />
        <SummaryRow label="إصدار Schema" ltr value="1" />
      </SolidCard>

      <AppButton loading={isExporting} onPress={onExport}>
        {isExporting ? 'جارٍ إنشاء النسخة…' : 'إنشاء نسخة احتياطية'}
      </AppButton>
    </>
  );
}

function ImportContent({
  isPicking,
  onPick,
  selectedFileName,
}: {
  isPicking: boolean;
  onPick: () => void;
  selectedFileName?: string;
}) {
  return (
    <>
      <SolidCard style={styles.sectionCard}>
        <SectionHeader iconName="cloud-upload-outline" title="استيراد نسخة احتياطية" />
        <AppText tone="secondary" variant="supporting">
          اختر ملف JSON صادرًا من Capital. ستتم مراجعته بالكامل قبل استبدال أي بيانات.
        </AppText>
        <View style={styles.warningBox}>
          <Ionicons color={colors.semantic.warning} name="warning-outline" size={19} />
          <View style={styles.flexCopy}>
            <AppText tone="warning" variant="cardTitle">
              استبدال البيانات المحلية
            </AppText>
            <AppText style={styles.wrappingText} tone="secondary" variant="caption">
              سيؤدي الاستيراد إلى استبدال البيانات الحالية داخل جلسة التطبيق فقط، ولن تُرسل أي بيانات إلى خادم خارجي.
            </AppText>
          </View>
        </View>
      </SolidCard>

      {selectedFileName ? (
        <SolidCard style={styles.fileCard}>
          <SummaryRow label="آخر ملف تمت مراجعته" ltr value={selectedFileName} />
        </SolidCard>
      ) : null}

      <AppButton loading={isPicking} onPress={onPick}>
        {isPicking ? 'جارٍ قراءة الملف…' : 'اختيار ملف نسخة احتياطية'}
      </AppButton>
    </>
  );
}

function BackupPreviewModal({
  visible,
  selectedBackup,
  onClose,
  onImport,
}: {
  visible: boolean;
  selectedBackup: SelectedBackup | null;
  onClose: () => void;
  onImport: () => void;
}) {
  const insets = useSafeAreaInsets();

  if (!selectedBackup) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="إغلاق المعاينة" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={['bottom']} style={styles.previewSheet}>
          <View style={styles.modalHandle} />
          <AppText align="center" variant="sectionTitle">
            مراجعة النسخة الاحتياطية
          </AppText>
          <ScrollView
            contentContainerStyle={[
              styles.previewContent,
              { paddingBottom: insets.bottom + spacing.md },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <SolidCard style={styles.fileCard}>
              <SummaryRow label="اسم الملف" ltr value={selectedBackup.fileName} />
              <Divider />
              <SummaryRow
                label="تاريخ إنشاء النسخة"
                ltr
                value={formatExportedAt(selectedBackup.backup.exportedAt)}
              />
              <Divider />
              <SummaryRow
                label="إصدار Schema"
                ltr
                value={`${selectedBackup.backup.schemaVersion}`}
              />
            </SolidCard>

            <SummaryGrid expanded summary={selectedBackup.summary} />

            {selectedBackup.warnings.map((warning) => (
              <View key={warning} style={styles.warningBox}>
                <Ionicons color={colors.semantic.warning} name="warning-outline" size={18} />
                <AppText style={styles.flexText} tone="warning" variant="caption">
                  {warning}
                </AppText>
              </View>
            ))}

            <View style={styles.importWarning}>
              <AppText tone="warning" variant="cardTitle">
                استبدال البيانات المحلية
              </AppText>
              <AppText style={styles.wrappingText} tone="secondary" variant="supporting">
                سيتم استبدال جميع الأقسام الظاهرة أعلاه، بما فيها الميزانيات ومعلومات النشاط
                والملف الشخصي وإعداد المظهر وأهداف وتحديثات الشركة اليدوية، بالبيانات الموجودة
                في النسخة المختارة داخل جلسة التطبيق الحالية.
              </AppText>
              <AppText tone="success" variant="caption">
                لن تُرسل أي بيانات إلى خادم خارجي.
              </AppText>
            </View>

            <AppButton onPress={onImport} variant="danger">
              استبدال البيانات المحلية
            </AppButton>
            <AppButton onPress={onClose} variant="secondary">
              إلغاء
            </AppButton>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SummaryGrid({ summary, expanded = false }: { summary: BackupSummary; expanded?: boolean }) {
  const items = expanded
    ? summary.sections
    : summary.sections.filter((section) =>
        [
          'transactions',
          'invoices',
          'categories',
          'recurringExpenses',
          'goals',
          'financialAccounts',
        ].includes(section.key),
      );

  return (
    <View style={styles.summaryGrid}>
      {items.map((item) => (
        <View key={item.key} style={styles.summaryItem}>
          <AppText tone="secondary" variant="caption">
            {item.label}
          </AppText>
          <AppText style={styles.ltrText} variant="cardTitle">
            {item.count}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function SectionHeader({
  iconName,
  title,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons color={colors.brand.calmGreen} name={iconName} size={21} />
      <AppText variant="sectionTitle">{title}</AppText>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <AppText style={styles.summaryLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText
        ellipsizeMode="middle"
        numberOfLines={1}
        style={[styles.summaryValue, ltr && styles.ltrText]}
        variant="body"
      >
        {value}
      </AppText>
    </View>
  );
}

function showValidationError(result: Extract<BackupValidationResult, { ok: false }>) {
  if (result.code === 'file-too-large') {
    Alert.alert('الملف كبير جدًا', result.reason);
    return;
  }

  if (result.code === 'newer-schema' || result.code === 'older-schema') {
    Alert.alert('إصدار النسخة غير مدعوم', result.reason);
    return;
  }

  if (result.code === 'read-failed') {
    Alert.alert('تعذر قراءة الملف', result.reason);
    return;
  }

  Alert.alert('ملف غير صالح', result.reason);
}

function formatExportedAt(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
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
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 44,
    width: 44,
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
  flexCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  flexText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  wrappingText: {
    flexShrink: 1,
    lineHeight: 22,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryItem: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.input,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 128,
    padding: spacing.md,
  },
  fileCard: {
    gap: spacing.sm,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 38,
  },
  summaryLabel: {
    flexShrink: 0,
  },
  summaryValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  ltrText: {
    direction: 'ltr',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  warningBox: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.74)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  previewSheet: {
    backgroundColor: colors.background.elevated,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: '90%',
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: colors.surface.border,
    borderRadius: radii.pill,
    height: 4,
    width: 44,
  },
  previewContent: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  importWarning: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
