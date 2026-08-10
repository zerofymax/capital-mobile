import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import {
  companyUpdatePeriods,
  companyUpdatePlaceholders,
  companyUpdateSectionLabels,
  getCompanyUpdatePeriod,
} from './company-update-data';
import type { CompanyUpdate, CompanyUpdateFormValues, CompanyUpdateSectionKey } from './company-update-types';
import {
  buildCompanyUpdatePreviewData,
  buildCompanyUpdateShareText,
  buildSnapshotMetricLines,
  getCompanyUpdateDisplayStatusLabel,
  hasMeaningfulUpdateContent,
  normalizeMultilineSection,
  resolveCompanyUpdateDisplayStatus,
} from './company-update-utils';
import { clearStartupReportsNotice, createDraftForPeriod, saveCompanyUpdate, useStartupReportsStore } from './startup-report-store';
import { NoticeBanner, ReportModalHeader } from './startup-report-components';

type CompanyUpdateMode = 'edit' | 'preview';

const sectionKeys: readonly CompanyUpdateSectionKey[] = ['achievements', 'challenges', 'companyNeeds', 'hiringUpdate', 'nextSteps'];

export function CompanyUpdateScreen() {
  const insets = useSafeAreaInsets();
  const { companyUpdates, notice } = useStartupReportsStore();
  const [periodKey, setPeriodKey] = useState('2026-07');
  const [mode, setMode] = useState<CompanyUpdateMode>('edit');
  const [draft, setDraft] = useState<CompanyUpdate>(() => createDraftForPeriod('2026-07'));
  const [savedBaseline, setSavedBaseline] = useState<CompanyUpdate>(() => createDraftForPeriod('2026-07'));
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const bottomPadding = insets.bottom + spacing.xxxl + spacing.md;
  const savedUpdate = companyUpdates[periodKey];
  const dirty = !areUpdateValuesEqual(draft, savedBaseline);
  const displayStatus = resolveCompanyUpdateDisplayStatus({ dirty, savedUpdate, update: draft });
  const statusLabel = getCompanyUpdateDisplayStatusLabel(displayStatus);
  const shareText = useMemo(() => buildCompanyUpdateShareText(draft), [draft]);
  const preview = useMemo(() => buildCompanyUpdatePreviewData(draft), [draft]);
  const futurePeriod = isFutureCompanyUpdatePeriod(periodKey);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearStartupReportsNotice, 2600);

    return () => clearTimeout(timeout);
  }, [notice]);

  function loadPeriod(nextPeriodKey: string) {
    const nextUpdate = companyUpdates[nextPeriodKey] ?? createDraftForPeriod(nextPeriodKey);
    setPeriodKey(nextPeriodKey);
    setDraft(nextUpdate);
    setSavedBaseline(nextUpdate);
    setMode('edit');
    setLocalNotice(companyUpdates[nextPeriodKey] ? null : 'ابدأ تحديثًا جديدًا لهذه الفترة.');
  }

  function handleSelectPeriod(nextPeriodKey: string) {
    if (nextPeriodKey === periodKey) {
      return;
    }

    if (dirty) {
      Alert.alert('تغييرات غير محفوظة', 'لديك تغييرات غير محفوظة. هل تريد تجاهلها والانتقال إلى فترة أخرى؟', [
        { text: 'البقاء', style: 'cancel' },
        { text: 'تجاهل التغييرات', style: 'destructive', onPress: () => loadPeriod(nextPeriodKey) },
      ]);
      return;
    }

    loadPeriod(nextPeriodKey);
  }

  function updateDraft(values: Partial<CompanyUpdateFormValues>) {
    setDraft((current) => ({
      ...current,
      ...values,
      status: 'draft',
    }));
  }

  function handleSave() {
    const nextDraft: CompanyUpdate = {
      ...draft,
      status: 'saved',
      updatedAt: 'اليوم',
    };
    saveCompanyUpdate(nextDraft);
    setDraft(nextDraft);
    setSavedBaseline(nextDraft);
    setLocalNotice('تم حفظ تحديث الشركة.');
  }

  function handlePreview() {
    if (!hasMeaningfulUpdateContent(draft)) {
      setLocalNotice('أضف إنجازًا أو خطوة قادمة واحدة على الأقل ليكون التحديث مفيدًا.');
    }

    setMode('preview');
  }

  async function handleShare() {
    setShareError(null);

    try {
      await Share.share({ message: shareText, title: 'تحديث Capital الشهري' });
    } catch {
      setShareError('تعذرت مشاركة التحديث. حاول مرة أخرى.');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <ReportModalHeader
            androidRtlLayout
            onBack={() => router.back()}
            subtitle="جهّز ملخصًا شهريًا واضحًا عن أداء شركتك وما تحتاجه خلال الفترة القادمة."
            title="تحديث الشركة"
          />

          {notice ? <NoticeBanner message={notice} /> : null}
          {localNotice ? <NoticeBanner message={localNotice} tone="warning" /> : null}
          {shareError ? <NoticeBanner message={shareError} tone="danger" /> : null}

          <PeriodSelector futurePeriod={futurePeriod} periodKey={periodKey} statusLabel={statusLabel} onSelect={handleSelectPeriod} />
          <ManualUpdateNotice futurePeriod={futurePeriod} />

          <View style={styles.tabs}>
            <SegmentButton active={mode === 'preview'} label="معاينة" onPress={handlePreview} />
            <SegmentButton active={mode === 'edit'} label="تحرير" onPress={() => setMode('edit')} />
          </View>

          {mode === 'edit' ? (
            <>
              <KeyNumbers update={draft} />
              <EditableSections draft={draft} onChange={updateDraft} />
              <View style={styles.actions}>
                <AppButton onPress={handleSave}>حفظ التحديث</AppButton>
                <AppButton onPress={handlePreview} variant="secondary">
                  معاينة التحديث
                </AppButton>
              </View>
            </>
          ) : (
            <>
              <PreviewDocument preview={preview} />
              <View style={styles.actions}>
                <AppButton onPress={handleShare}>مشاركة التحديث</AppButton>
                <AppButton onPress={() => setMode('edit')} variant="secondary">
                  تعديل
                </AppButton>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PeriodSelector({
  periodKey,
  statusLabel,
  futurePeriod,
  onSelect,
}: {
  periodKey: string;
  statusLabel: string;
  futurePeriod: boolean;
  onSelect: (periodKey: string) => void;
}) {
  const period = getCompanyUpdatePeriod(periodKey);

  return (
    <SolidCard style={styles.periodCard}>
      <View style={styles.periodTop}>
        <View style={styles.periodCopy}>
          <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
            الفترة
          </AppText>
          <AppText align="right" style={styles.periodValue} variant="cardTitle">
            {directionSafeText(period.label)}
          </AppText>
        </View>
        <View style={styles.statusBadgeGroup}>
          {futurePeriod ? (
            <View style={styles.futureBadge}>
              <AppText align="center" style={styles.futureBadgeText} variant="caption">
                مسودة مستقبلية
              </AppText>
            </View>
          ) : null}
          <View style={styles.statusBadge}>
            <AppText align="center" style={styles.statusText} variant="caption">
              {statusLabel}
            </AppText>
          </View>
        </View>
      </View>
      <View style={styles.periodGrid}>
        {companyUpdatePeriods.map((item) => {
          const selected = item.key === periodKey;

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={({ pressed }) => [styles.periodChip, selected && styles.periodChipActive, pressed && styles.pressed]}
            >
              <AppText align="center" style={selected && styles.periodChipTextActive} variant="caption">
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </SolidCard>
  );
}

function ManualUpdateNotice({ futurePeriod }: { futurePeriod: boolean }) {
  return (
    <SolidCard style={styles.manualNoticeCard}>
      <View style={styles.manualNoticeHeader}>
        <View style={styles.manualBadge}>
          <AppText align="center" style={styles.manualBadgeText} variant="caption">
            تحديث يدوي
          </AppText>
        </View>
        {futurePeriod ? (
          <View style={styles.futureBadge}>
            <AppText align="center" style={styles.futureBadgeText} variant="caption">
              مسودة مستقبلية
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText align="right" style={styles.rtlText} tone="secondary" variant="body">
        بيانات هذا التحديث مدخلة يدويًا، ولا تمثل بالضرورة العمليات أو مؤشرات النمو المحسوبة داخل التطبيق.
      </AppText>
      <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
        {directionSafeText('قيم MRR وChurn والعملاء النشطين هنا قيم مدخلة ضمن تحديث الشركة، وليست محسوبة من بيانات اشتراكات العملاء.')}
      </AppText>
    </SolidCard>
  );
}

function KeyNumbers({ update }: { update: CompanyUpdate }) {
  const metrics = buildSnapshotMetricLines(update.financialSnapshot);

  return (
    <View style={styles.section}>
      <SectionTitle title="الأرقام الرئيسية" />
      {update.financialSnapshot ? (
        <>
          <MetricGroup
            title="الأداء المالي"
            metrics={metrics.filter((line) => ['الإيرادات', 'نمو الإيرادات', 'السيولة', 'الحرق الشهري', 'مدة بقاء السيولة'].some((label) => line.startsWith(label)))}
          />
          <MetricGroup title="النمو والعملاء" metrics={metrics.filter((line) => line.includes('MRR') || line.includes('Churn') || line.startsWith('العملاء'))} />
          <MetricGroup title="الفريق والأهداف" metrics={metrics.filter((line) => line.startsWith('عدد الموظفين') || line.startsWith('أهم هدف'))} />
          <AppText tone="secondary" variant="caption">
            القيم المدخلة هنا مستقلة عن مؤشرات SaaS المحسوبة، وتظهر كمدخلات يدوية داخل تحديث الشركة فقط.
          </AppText>
        </>
      ) : (
        <SolidCard style={styles.emptyDataCard}>
          <View style={styles.emptyDataIcon}>
            <Ionicons color={colors.text.tertiary} name="analytics-outline" size={20} />
          </View>
          <AppText align="center" variant="cardTitle">
            لا توجد بيانات مالية كافية لهذه الفترة.
          </AppText>
          <AppText align="center" tone="secondary" variant="body">
            يمكنك كتابة التحديث يدويًا، وستظهر الأرقام تلقائيًا عند توفر البيانات.
          </AppText>
        </SolidCard>
      )}
    </View>
  );
}

function MetricGroup({ title, metrics }: { title: string; metrics: readonly string[] }) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <SolidCard style={styles.metricGroup}>
      <AppText align="right" style={styles.rtlText} variant="cardTitle">
        {title}
      </AppText>
      <View style={styles.metricsGrid}>
        {metrics.map((metric) => {
          const [label = '', ...rest] = metric.split(':');
          const value = rest.join(':').trim();
          const manual = label.includes('يدوي');
          const displayLabel = label.replace(/\s+—\s+(?:إدخال\s+)?يدوي/g, '');

          return (
            <View key={metric} style={styles.metricBox}>
              <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
                {directionSafeText(displayLabel)}
              </AppText>
              {manual ? (
                <View style={styles.inlineManualBadge}>
                  <AppText align="center" style={styles.inlineManualBadgeText} variant="caption">
                    يدوي
                  </AppText>
                </View>
              ) : null}
              <AppText align="right" style={styles.metricValue} variant="cardTitle">
                {directionSafeText(value)}
              </AppText>
            </View>
          );
        })}
      </View>
    </SolidCard>
  );
}

function EditableSections({ draft, onChange }: { draft: CompanyUpdate; onChange: (values: Partial<CompanyUpdateFormValues>) => void }) {
  return (
    <View style={styles.section}>
      <SectionTitle title="أقسام التحديث" />
      {sectionKeys.map((key) => (
        <UpdateSectionField
          key={key}
          label={companyUpdateSectionLabels[key]}
          onChangeText={(value) => onChange({ [key]: value })}
          placeholder={companyUpdatePlaceholders[key]}
          value={draft[key]}
        />
      ))}
    </View>
  );
}

function PreviewDocument({ preview }: { preview: ReturnType<typeof buildCompanyUpdatePreviewData> }) {
  return (
    <SolidCard style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <AppText align="right" style={styles.previewHeaderText} variant="screenTitle">
          {preview.title}
        </AppText>
        <AppText align="right" style={styles.previewHeaderText} tone="secondary" variant="supporting">
          {directionSafeText(preview.periodLabel)}
        </AppText>
      </View>

      <PreviewSection title="ملخص تنفيذي قصير" items={[preview.executiveSummary]} prose />

      {preview.financialSnapshot ? <PreviewSection title="الأرقام الرئيسية" items={buildSnapshotMetricLines(preview.financialSnapshot)} /> : null}

      {preview.sections.map((section) =>
        section.items.length > 0 ? <PreviewSection key={section.key} title={section.title} items={section.items} showCount /> : null,
      )}
    </SolidCard>
  );
}

function PreviewSection({
  title,
  items,
  prose,
  showCount = false,
}: {
  title: string;
  items: readonly string[];
  prose?: boolean;
  showCount?: boolean;
}) {
  return (
    <View style={styles.previewSection}>
      <View style={styles.previewSectionHeader}>
        <View style={styles.fieldLabelSlot}>
          <AppText align="right" style={styles.fieldLabel} variant="cardTitle">
            {title}
          </AppText>
        </View>
        {showCount ? <PointCount count={items.length} /> : null}
      </View>
      {items.map((item) =>
        prose ? (
          <AppText align="right" key={item} style={styles.rtlText} tone="secondary" variant="body">
            {directionSafeText(item)}
          </AppText>
        ) : (
          <View key={item} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <AppText align="right" style={styles.bulletText} tone="secondary" variant="body">
              {directionSafeText(item)}
            </AppText>
          </View>
        ),
      )}
    </View>
  );
}

function UpdateSectionField({
  label,
  value,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  const itemCount = normalizeMultilineSection(value).length;

  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldLabelSlot}>
          <AppText align="right" style={styles.fieldLabel} variant="supporting">
            {label}
          </AppText>
        </View>
        <PointCount count={itemCount} />
      </View>
      <View style={styles.textAreaWrap}>
        <TextInput
          accessibilityLabel={label}
          multiline
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          scrollEnabled={false}
          style={styles.textArea}
          textAlign="right"
          textAlignVertical="top"
          value={value}
        />
      </View>
    </View>
  );
}

function PointCount({ count }: { count: number }) {
  return (
    <View style={styles.pointCount}>
      <AppText style={styles.pointNumber} tone="secondary" variant="caption">
        {count}
      </AppText>
      <AppText style={styles.pointLabel} tone="secondary" variant="caption">
        نقاط
      </AppText>
    </View>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.segmentButton, active && styles.segmentButtonActive, pressed && styles.pressed]}
    >
      <AppText align="center" style={active && styles.segmentTextActive} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
      {title}
    </AppText>
  );
}

function areUpdateValuesEqual(a: CompanyUpdate, b: CompanyUpdate) {
  return sectionKeys.every((key) => a[key] === b[key]);
}

function isFutureCompanyUpdatePeriod(periodKey: string) {
  const period = getCompanyUpdatePeriod(periodKey);
  const today = new Date();
  const periodStart = new Date(period.year, period.month - 1, 1);
  const currentStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return periodStart.getTime() > currentStart.getTime();
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  periodCard: {
    alignSelf: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  periodTop: {
    alignSelf: 'stretch',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  periodCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  periodValue: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  statusBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeGroup: {
    alignItems: 'flex-start',
    flexShrink: 0,
    gap: spacing.xs,
  },
  futureBadge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  futureBadgeText: {
    color: colors.semantic.warning,
  },
  manualNoticeCard: {
    gap: spacing.sm,
  },
  manualNoticeHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  manualBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  manualBadgeText: {
    color: colors.brand.calmGreen,
  },
  statusText: {
    color: colors.brand.calmGreen,
  },
  periodGrid: {
    direction: 'rtl',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  periodChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  periodChipTextActive: {
    color: colors.text.primary,
  },
  tabs: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    direction: 'rtl',
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.brand.mediumGreen,
  },
  segmentTextActive: {
    color: colors.text.primary,
  },
  section: {
    gap: spacing.md,
  },
  metricGroup: {
    gap: spacing.md,
  },
  metricsGrid: {
    direction: 'ltr',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 72,
    minWidth: 0,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  inlineManualBadge: {
    alignSelf: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  inlineManualBadgeText: {
    color: colors.semantic.warning,
  },
  emptyDataCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyDataIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  fieldWrap: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  fieldHeader: {
    alignSelf: 'stretch',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  fieldLabel: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fieldLabelSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  pointCount: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
  },
  pointNumber: {
    writingDirection: 'ltr',
  },
  pointLabel: {
    writingDirection: 'rtl',
  },
  textAreaWrap: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    minHeight: 124,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textArea: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    lineHeight: 23,
    minHeight: 96,
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.md,
  },
  previewCard: {
    gap: spacing.lg,
  },
  previewHeader: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    width: '100%',
  },
  previewHeaderText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  previewSection: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  previewSectionHeader: {
    alignSelf: 'stretch',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  bulletRow: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    width: '100%',
  },
  bulletDot: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: 6,
    marginTop: 9,
    width: 6,
  },
  bulletText: {
    alignSelf: 'stretch',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metricValue: {
    alignSelf: 'stretch',
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rtlText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
