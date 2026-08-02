import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ConsentSettings = {
  improveExperience: boolean;
  personalizeRecommendations: boolean;
  marketingMessages: boolean;
  anonymousUsageData: boolean;
  subscriptionReminders: boolean;
};

type ConsentKey = keyof ConsentSettings;

type RequiredDataRow = {
  id: string;
  title: string;
  description: string;
  status: string;
};

type OptionalConsentRow = {
  key: ConsentKey;
  title: string;
  description: string;
};

type RetentionRow = {
  id: string;
  label: string;
  value: string;
};

const defaultConsentSettings: ConsentSettings = {
  improveExperience: true,
  personalizeRecommendations: true,
  marketingMessages: false,
  anonymousUsageData: false,
  subscriptionReminders: true,
};

const requiredDataRows: RequiredDataRow[] = [
  {
    id: 'account',
    title: 'بيانات الحساب الأساسية',
    description: 'الاسم والبريد الإلكتروني وبيانات النشاط',
    status: 'مطلوبة',
  },
  {
    id: 'security',
    title: 'بيانات الأمان',
    description: 'الجلسات والأجهزة وإعدادات التحقق',
    status: 'مطلوبة',
  },
  {
    id: 'local-ledger',
    title: 'السجل المالي المحلي',
    description: 'المعاملات والتقارير والرؤى داخل النموذج الحالي',
    status: 'مطلوبة',
  },
];

const optionalConsentRows: OptionalConsentRow[] = [
  {
    key: 'improveExperience',
    title: 'تحسين التجربة باستخدام البيانات',
    description: 'استخدام بيانات الاستخدام المحلية لتحسين ترتيب المحتوى والتوصيات.',
  },
  {
    key: 'personalizeRecommendations',
    title: 'تخصيص التوصيات المالية',
    description: 'استخدام بيانات نشاطك لعرض رؤى أكثر ملاءمة.',
  },
  {
    key: 'marketingMessages',
    title: 'الرسائل التسويقية',
    description: 'استلام عروض وتحديثات عن الميزات الجديدة.',
  },
  {
    key: 'anonymousUsageData',
    title: 'مشاركة بيانات استخدام مجهولة',
    description: 'مشاركة إحصاءات عامة دون معلومات تعريفية مباشرة.',
  },
  {
    key: 'subscriptionReminders',
    title: 'تذكيرات الاشتراك والتجديد',
    description: 'إظهار تنبيهات محلية قبل مواعيد التجديد.',
  },
];

const retentionRows: RetentionRow[] = [
  { id: 'account-retention', label: 'مدة الاحتفاظ ببيانات الحساب', value: 'حتى حذف الحساب' },
  { id: 'support-retention', label: 'بيانات الدعم', value: 'حتى 24 شهرًا' },
  { id: 'security-retention', label: 'السجلات الأمنية', value: 'حتى 12 شهرًا' },
  { id: 'local-model-retention', label: 'بيانات النموذج المحلي', value: 'تُحذف عند إعادة ضبط التطبيق' },
];

export function DataConsentsScreen() {
  const insets = useSafeAreaInsets();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedSettings, setSavedSettings] = useState<ConsentSettings>(defaultConsentSettings);
  const [settings, setSettings] = useState<ConsentSettings>(defaultConsentSettings);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const dirty = useMemo(() => !areConsentSettingsEqual(settings, savedSettings), [savedSettings, settings]);

  const enabledCount = useMemo(
    () => Object.values(settings).filter(Boolean).length,
    [settings],
  );
  const totalCount = optionalConsentRows.length;
  const disabledCount = totalCount - enabledCount;

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dirty) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty]);

  function updateConsent(key: ConsentKey, value: boolean) {
    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function handleBackPress() {
    if (dirty) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToPrivacyLegal();
  }

  function goBackToPrivacyLegal() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.privacyLegal);
  }

  function handleSavePress() {
    if (saving) {
      return;
    }

    setSaving(true);
    setFeedback(null);
    saveTimerRef.current = setTimeout(() => {
      setSavedSettings(settings);
      setSaving(false);
      setFeedback('تم حفظ الإعدادات');
    }, 550);
  }

  function handleResetConfirm() {
    setShowResetDialog(false);
    setSettings(defaultConsentSettings);
    setFeedback('تمت إعادة ضبط الموافقات');
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBackToPrivacyLegal();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <DataConsentsHeader onBackPress={handleBackPress} />
        <IntroCard />
        <RequiredDataSection />
        <OptionalConsentsSection settings={settings} onConsentChange={updateConsent} />

        {!settings.personalizeRecommendations ? <PersonalizationNote /> : null}

        <ConsentSummary enabledCount={enabledCount} disabledCount={disabledCount} totalCount={totalCount} />
        <RetentionSection />

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
            <AppText style={styles.feedbackText} tone="success" variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.actions}>
          <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
            {saving ? 'جاري الحفظ' : 'حفظ التغييرات'}
          </AppButton>
          <AppButton onPress={() => setShowResetDialog(true)} variant="secondary">
            إعادة ضبط الموافقات
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="إعادة الضبط"
        description="ستعود جميع الموافقات الاختيارية إلى إعداداتها الافتراضية."
        onCancel={() => setShowResetDialog(false)}
        onConfirm={handleResetConfirm}
        title="إعادة ضبط الموافقات؟"
        tone="warning"
        visible={showResetDialog}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، لن يتم حفظ تعديلات الموافقات."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </View>
  );
}

function DataConsentsHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الخصوصية والقانونية"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" numberOfLines={2} variant="screenTitle">
          إدارة البيانات والموافقات
        </AppText>
        <AppText align="center" numberOfLines={2} tone="secondary" variant="supporting">
          تحكم في كيفية استخدام بياناتك داخل Capital
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.introIcon}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={22} />
      </View>
      <View style={styles.introCopy}>
        <AppText variant="cardTitle">خصوصيتك أولويتنا</AppText>
        <AppText style={styles.introText} tone="secondary" variant="supporting">
          يمكنك تعديل الموافقات الاختيارية في أي وقت. بعض البيانات الأساسية مطلوبة لتشغيل الحساب وحمايته.
        </AppText>
      </View>
    </SolidCard>
  );
}

function RequiredDataSection() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">بيانات مطلوبة لتشغيل الخدمة</AppText>
      <SolidCard style={styles.rowsCard}>
        {requiredDataRows.map((row, index) => (
          <View key={row.id}>
            <View accessibilityRole="text" style={styles.requiredRow}>
              <View style={styles.requiredCopy}>
                <AppText variant="body">{row.title}</AppText>
                <AppText tone="secondary" variant="caption">
                  {row.description}
                </AppText>
              </View>
              <StatusPill label={row.status} />
            </View>
            {index < requiredDataRows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function OptionalConsentsSection({
  settings,
  onConsentChange,
}: {
  settings: ConsentSettings;
  onConsentChange: (key: ConsentKey, value: boolean) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">الموافقات الاختيارية</AppText>
      <SolidCard style={styles.rowsCard}>
        {optionalConsentRows.map((row, index) => (
          <View key={row.key}>
            <ConsentSwitchRow
              checked={settings[row.key]}
              row={row}
              onValueChange={(value) => onConsentChange(row.key, value)}
            />
            {index < optionalConsentRows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ConsentSwitchRow({
  row,
  checked,
  onValueChange,
}: {
  row: OptionalConsentRow;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchCopy}>
        <AppText variant="body">{row.title}</AppText>
        <AppText style={styles.switchDescription} tone="secondary" variant="caption">
          {row.description}
        </AppText>
      </View>
      <Switch
        ios_backgroundColor={colors.surface.muted}
        onValueChange={onValueChange}
        thumbColor={checked ? colors.text.inverse : colors.text.tertiary}
        trackColor={{ false: colors.surface.muted, true: colors.brand.green }}
        value={checked}
      />
    </View>
  );
}

function PersonalizationNote() {
  return (
    <SolidCard style={styles.warningNote}>
      <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
      <View style={styles.noteCopy}>
        <AppText tone="warning" variant="cardTitle">
          تأثير إيقاف التخصيص
        </AppText>
        <AppText style={styles.noteText} tone="secondary" variant="supporting">
          قد تصبح بعض التوصيات أقل ارتباطًا بنشاطك، لكن يمكنك الاستمرار في استخدام بقية وظائف التطبيق.
        </AppText>
      </View>
    </SolidCard>
  );
}

function ConsentSummary({
  enabledCount,
  disabledCount,
  totalCount,
}: {
  enabledCount: number;
  disabledCount: number;
  totalCount: number;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">ملخص الموافقات</AppText>
      <SolidCard style={styles.summaryCard}>
        <SummaryRow label="الموافقات المفعلة" value={`${enabledCount} من ${totalCount}`} tone="success" />
        <Divider />
        <SummaryRow label="الموافقات غير المفعلة" value={`${disabledCount} من ${totalCount}`} tone="secondary" />
      </SolidCard>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'secondary';
}) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="body">{label}</AppText>
      <AppText style={styles.ltrValue} tone={tone} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

function RetentionSection() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">الاحتفاظ بالبيانات</AppText>
      <SolidCard style={styles.rowsCard}>
        {retentionRows.map((row, index) => (
          <View key={row.id}>
            <View style={styles.retentionRow}>
              <AppText style={styles.retentionLabel} tone="secondary" variant="caption">
                {row.label}
              </AppText>
              <AppText style={styles.retentionValue} variant="supporting">
                {row.value}
              </AppText>
            </View>
            {index < retentionRows.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <View style={styles.retentionNote}>
          <AppText style={styles.retentionNoteText} tone="tertiary" variant="caption">
            هذه القيم جزء من النموذج التجريبي وليست سياسة إنتاج نهائية.
          </AppText>
        </View>
      </SolidCard>
    </View>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <View style={styles.statusPill}>
      <AppText align="center" tone="success" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function areConsentSettingsEqual(left: ConsentSettings, right: ConsentSettings) {
  return optionalConsentRows.every((row) => left[row.key] === right[row.key]);
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 54,
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
  introCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,200,161,0.11)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  introCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  introText: {
    lineHeight: 22,
  },
  section: {
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  requiredRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  requiredCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusPill: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 82,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 82,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  switchCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  switchDescription: {
    lineHeight: 18,
  },
  warningNote: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noteCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  noteText: {
    lineHeight: 21,
  },
  summaryCard: {
    padding: 0,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ltrValue: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  retentionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retentionLabel: {
    flex: 1,
  },
  retentionValue: {
    flex: 1,
    textAlign: 'left',
  },
  retentionNote: {
    backgroundColor: colors.surface.muted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retentionNoteText: {
    lineHeight: 18,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackText: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
