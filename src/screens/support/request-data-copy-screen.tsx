import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, StateScreen } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type DataExportCategory =
  | 'account'
  | 'transactions'
  | 'reports'
  | 'insights'
  | 'subscriptions'
  | 'support'
  | 'consents';

type DataExportFormat = 'pdf' | 'csv' | 'json';
type DataDeliveryMethod = 'in-app' | 'email';

type DataCopyRequestState = {
  selectedCategories: DataExportCategory[];
  format: DataExportFormat;
  deliveryMethod: DataDeliveryMethod;
  ownershipConfirmed: boolean;
};

type DataCategoryOption = {
  id: DataExportCategory;
  title: string;
  description: string;
};

type FormatOption = {
  id: DataExportFormat;
  label: string;
  description: string;
};

type DeliveryOption = {
  id: DataDeliveryMethod;
  title: string;
  description: string;
};

type RequestDataCopyErrors = {
  selectedCategories?: string;
  format?: string;
  deliveryMethod?: string;
  ownershipConfirmed?: string;
};

const requestReference = 'CAP-DATA-2026-1049';

const dataCategoryOptions: DataCategoryOption[] = [
  {
    id: 'account',
    title: 'معلومات الحساب',
    description: 'الاسم والبريد الإلكتروني وبيانات النشاط',
  },
  {
    id: 'transactions',
    title: 'المعاملات المالية',
    description: 'الدخل والمصروفات والتحويلات والالتزامات',
  },
  {
    id: 'reports',
    title: 'التقارير المالية',
    description: 'التقارير الشهرية والملخصات المحفوظة',
  },
  {
    id: 'insights',
    title: 'الرؤى والتوصيات',
    description: 'الرؤى المالية والتنبيهات والإجراءات المقترحة',
  },
  {
    id: 'subscriptions',
    title: 'الاشتراكات',
    description: 'الاشتراكات المتكررة ومواعيد التجديد',
  },
  {
    id: 'support',
    title: 'طلبات الدعم',
    description: 'الطلبات والمحادثات والتحديثات المحلية',
  },
  {
    id: 'consents',
    title: 'إعدادات الخصوصية والموافقات',
    description: 'حالة الموافقات وإعدادات استخدام البيانات',
  },
];

const formatOptions: FormatOption[] = [
  { id: 'pdf', label: 'PDF', description: 'نسخة سهلة القراءة والمراجعة' },
  { id: 'csv', label: 'CSV', description: 'مناسب للمعاملات والجداول' },
  { id: 'json', label: 'JSON', description: 'نسخة تقنية للبيانات المنظمة' },
];

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'in-app',
    title: 'رابط تحميل داخل التطبيق',
    description: 'سيظهر رابط مؤقت داخل التطبيق عند جاهزية النسخة.',
  },
  {
    id: 'email',
    title: 'إرسال إلى البريد الإلكتروني',
    description: 'إرسال إشعار إلى abdullah@capital.app عند الجاهزية.',
  },
];

const defaultRequestState: DataCopyRequestState = {
  selectedCategories: ['account', 'transactions', 'reports', 'insights', 'subscriptions', 'consents'],
  format: 'pdf',
  deliveryMethod: 'in-app',
  ownershipConfirmed: false,
};

export function RequestDataCopyScreen() {
  const insets = useSafeAreaInsets();
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [requestState, setRequestState] = useState<DataCopyRequestState>(defaultRequestState);
  const [errors, setErrors] = useState<RequestDataCopyErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const allCategoriesSelected = requestState.selectedCategories.length === dataCategoryOptions.length;
  const selectedCategoryCount = requestState.selectedCategories.length;
  const dirty = useMemo(() => !areRequestStatesEqual(requestState, defaultRequestState), [requestState]);
  const selectedDeliveryLabel =
    deliveryOptions.find((option) => option.id === requestState.deliveryMethod)?.title ?? '';

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dirty && !submitted) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, submitted]);

  function handleBackPress() {
    if (dirty && !submitted) {
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

  function toggleCategory(category: DataExportCategory) {
    Haptics.selectionAsync().catch(() => null);
    setErrors((current) => ({ ...current, selectedCategories: undefined }));
    setRequestState((current) => {
      const selected = current.selectedCategories.includes(category);
      const selectedCategories = selected
        ? current.selectedCategories.filter((item) => item !== category)
        : [...current.selectedCategories, category];

      return { ...current, selectedCategories };
    });
  }

  function toggleAllCategories() {
    Haptics.selectionAsync().catch(() => null);
    setErrors((current) => ({ ...current, selectedCategories: undefined }));
    setRequestState((current) => ({
      ...current,
      selectedCategories: allCategoriesSelected ? [] : dataCategoryOptions.map((option) => option.id),
    }));
  }

  function selectFormat(format: DataExportFormat) {
    Haptics.selectionAsync().catch(() => null);
    setErrors((current) => ({ ...current, format: undefined }));
    setRequestState((current) => ({ ...current, format }));
  }

  function selectDeliveryMethod(deliveryMethod: DataDeliveryMethod) {
    Haptics.selectionAsync().catch(() => null);
    setErrors((current) => ({ ...current, deliveryMethod: undefined }));
    setRequestState((current) => ({ ...current, deliveryMethod }));
  }

  function toggleOwnershipConfirmed() {
    Haptics.selectionAsync().catch(() => null);
    setErrors((current) => ({ ...current, ownershipConfirmed: undefined }));
    setRequestState((current) => ({ ...current, ownershipConfirmed: !current.ownershipConfirmed }));
  }

  function validateRequest() {
    const nextErrors: RequestDataCopyErrors = {};

    if (requestState.selectedCategories.length === 0) {
      nextErrors.selectedCategories = 'اختر نوعًا واحدًا من البيانات على الأقل';
    }

    if (!requestState.format) {
      nextErrors.format = 'اختر صيغة الملف';
    }

    if (!requestState.deliveryMethod) {
      nextErrors.deliveryMethod = 'اختر طريقة الاستلام';
    }

    if (!requestState.ownershipConfirmed) {
      nextErrors.ownershipConfirmed = 'أكد ملكية الحساب للمتابعة';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (submitting) {
      return;
    }

    if (!validateRequest()) {
      return;
    }

    setSubmitting(true);
    submitTimerRef.current = setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBackToPrivacyLegal();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  if (submitted) {
    return (
      <StateScreen
        description={`رقم الطلب: ‎${requestReference}‎`}
        iconName="checkmark-outline"
        onPrimaryAction={() => router.replace(routes.privacyLegal)}
        onSecondaryAction={() => router.replace(routes.account)}
        primaryActionLabel="العودة إلى الخصوصية والقانونية"
        secondaryActionLabel="العودة إلى الحساب"
        title="تم إرسال طلب نسخة البيانات"
      >
        <SolidCard style={styles.successInfoCard}>
          <AppText align="center" tone="secondary" variant="supporting">
            سنرسل إشعارًا داخل التطبيق عند جاهزية النسخة. الوقت المتوقع: خلال 48 ساعة.
          </AppText>
        </SolidCard>
      </StateScreen>
    );
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RequestDataCopyHeader onBackPress={handleBackPress} />
        <IntroCard />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle} variant="sectionTitle">
              ما البيانات التي تريد تضمينها؟
            </AppText>
            <Pressable
              accessibilityLabel={allCategoriesSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              accessibilityRole="button"
              onPress={toggleAllCategories}
              style={({ pressed }) => [styles.selectAllButton, pressed && styles.pressed]}
            >
              <AppText align="center" tone="success" variant="caption">
                {allCategoriesSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </AppText>
            </Pressable>
          </View>
          <SolidCard style={styles.rowsCard}>
            {dataCategoryOptions.map((category, index) => (
              <View key={category.id}>
                <CheckboxRow
                  checked={requestState.selectedCategories.includes(category.id)}
                  description={category.description}
                  onPress={() => toggleCategory(category.id)}
                  title={category.title}
                />
                {index < dataCategoryOptions.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </SolidCard>
          {errors.selectedCategories ? <ErrorText>{errors.selectedCategories}</ErrorText> : null}
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">صيغة الملف</AppText>
          <View style={styles.formatGrid}>
            {formatOptions.map((option) => (
              <FormatCard
                key={option.id}
                onPress={() => selectFormat(option.id)}
                option={option}
                selected={requestState.format === option.id}
              />
            ))}
          </View>
          {errors.format ? <ErrorText>{errors.format}</ErrorText> : null}
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">طريقة الاستلام</AppText>
          <View style={styles.deliveryList}>
            {deliveryOptions.map((option) => (
              <RadioCard
                key={option.id}
                onPress={() => selectDeliveryMethod(option.id)}
                option={option}
                selected={requestState.deliveryMethod === option.id}
              />
            ))}
          </View>
          {errors.deliveryMethod ? <ErrorText>{errors.deliveryMethod}</ErrorText> : null}
        </View>

        <EstimatedTimeCard />

        <View style={styles.section}>
          <AppText variant="sectionTitle">تأكيد الأمان</AppText>
          <SolidCard style={styles.rowsCard}>
            <CheckboxRow
              checked={requestState.ownershipConfirmed}
              description="قد نطلب تحققًا إضافيًا في النسخة الإنتاجية."
              onPress={toggleOwnershipConfirmed}
              title="أؤكد أنني صاحب الحساب وأرغب في طلب نسخة من بياناتي."
            />
          </SolidCard>
          {errors.ownershipConfirmed ? <ErrorText>{errors.ownershipConfirmed}</ErrorText> : null}
        </View>

        <PrivacyNotice />

        <RequestSummary
          categoryCount={selectedCategoryCount}
          deliveryLabel={selectedDeliveryLabel}
          format={requestState.format}
        />

        <View style={styles.actions}>
          <AppButton disabled={submitting} loading={submitting} onPress={handleSubmit}>
            {submitting ? 'جاري إرسال الطلب' : 'إرسال طلب النسخة'}
          </AppButton>
          <AppButton onPress={handleBackPress} variant="ghost">
            إلغاء
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، سيتم تجاهل إعدادات طلب نسخة البيانات."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </View>
  );
}

function RequestDataCopyHeader({ onBackPress }: { onBackPress: () => void }) {
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
          طلب نسخة من بياناتي
        </AppText>
        <AppText align="center" numberOfLines={2} tone="secondary" variant="supporting">
          اختر البيانات التي تريد تضمينها في النسخة
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
        <Ionicons color={colors.brand.calmGreen} name="download-outline" size={22} />
      </View>
      <View style={styles.introCopy}>
        <AppText variant="cardTitle">نسخة من بيانات حسابك</AppText>
        <AppText style={styles.introText} tone="secondary" variant="supporting">
          سنجهّز ملفًا يحتوي على البيانات التي تختارها. هذا نموذج محلي تجريبي ولا يتم إنشاء أو إرسال ملف حقيقي حاليًا.
        </AppText>
      </View>
    </SolidCard>
  );
}

function CheckboxRow({
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
      style={({ pressed }) => [styles.checkboxRow, checked && styles.checkboxRowSelected, pressed && styles.pressed]}
    >
      <View style={styles.checkboxCopy}>
        <AppText variant="body">{title}</AppText>
        <AppText style={styles.rowDescription} tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
        {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={17} /> : null}
      </View>
    </Pressable>
  );
}

function FormatCard({
  option,
  selected,
  onPress,
}: {
  option: FormatOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={option.label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.formatCard, selected && styles.selectedCard, pressed && styles.pressed]}
    >
      <AppText align="center" style={styles.ltrValue} tone={selected ? 'success' : 'primary'} variant="cardTitle">
        {option.label.toUpperCase()}
      </AppText>
      <AppText align="center" tone="secondary" variant="caption">
        {option.description}
      </AppText>
    </Pressable>
  );
}

function RadioCard({
  option,
  selected,
  onPress,
}: {
  option: DeliveryOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={option.title}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.radioCard, selected && styles.selectedCard, pressed && styles.pressed]}
    >
      <View style={styles.radioCopy}>
        <AppText variant="body">{option.title}</AppText>
        <AppText style={option.id === 'email' && styles.emailDescription} tone="secondary" variant="caption">
          {option.description}
        </AppText>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function EstimatedTimeCard() {
  return (
    <SolidCard style={styles.estimatedCard}>
      <View style={styles.estimatedIcon}>
        <Ionicons color={colors.semantic.success} name="time-outline" size={19} />
      </View>
      <View style={styles.estimatedCopy}>
        <AppText variant="cardTitle">الوقت المتوقع للتجهيز</AppText>
        <AppText tone="success" variant="body">
          خلال 48 ساعة
        </AppText>
        <AppText style={styles.estimatedDescription} tone="secondary" variant="supporting">
          سنُظهر حالة الطلب داخل التطبيق عند ربط خدمة تصدير البيانات لاحقًا.
        </AppText>
      </View>
    </SolidCard>
  );
}

function PrivacyNotice() {
  return (
    <SolidCard style={styles.privacyNotice}>
      <Ionicons color={colors.semantic.warning} name="shield-checkmark-outline" size={18} />
      <View style={styles.noticeCopy}>
        <AppText tone="warning" variant="cardTitle">
          ملاحظة مهمة
        </AppText>
        <AppText style={styles.noticeText} tone="secondary" variant="supporting">
          لن تتضمن النسخة كلمات المرور أو رموز PIN أو بيانات الدفع الحساسة. هذا التدفق محلي وتجريبي حاليًا.
        </AppText>
      </View>
    </SolidCard>
  );
}

function RequestSummary({
  categoryCount,
  format,
  deliveryLabel,
}: {
  categoryCount: number;
  format: DataExportFormat;
  deliveryLabel: string;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">ملخص الطلب</AppText>
      <SolidCard style={styles.summaryCard}>
        <SummaryRow label="عدد أنواع البيانات" value={`${categoryCount}`} />
        <Divider />
        <SummaryRow label="الصيغة" value={format.toUpperCase()} ltr />
        <Divider />
        <SummaryRow label="طريقة الاستلام" value={deliveryLabel} />
      </SolidCard>
    </View>
  );
}

function SummaryRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={ltr && styles.ltrValue} variant="supporting">
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

function areRequestStatesEqual(left: DataCopyRequestState, right: DataCopyRequestState) {
  return (
    left.format === right.format &&
    left.deliveryMethod === right.deliveryMethod &&
    left.ownershipConfirmed === right.ownershipConfirmed &&
    left.selectedCategories.length === right.selectedCategories.length &&
    left.selectedCategories.every((category) => right.selectedCategories.includes(category))
  );
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 1,
  },
  selectAllButton: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkboxRowSelected: {
    backgroundColor: 'rgba(79,138,91,0.055)',
  },
  checkboxCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowDescription: {
    lineHeight: 18,
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
  checkboxSelected: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  formatGrid: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  formatCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 92,
    padding: spacing.md,
  },
  selectedCard: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.46)',
  },
  deliveryList: {
    gap: spacing.sm,
  },
  radioCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.lg,
  },
  radioCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  emailDescription: {
    textAlign: 'right',
  },
  radio: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: {
    borderColor: colors.brand.mediumGreen,
  },
  radioDot: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: 12,
    width: 12,
  },
  estimatedCard: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  estimatedIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  estimatedCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  estimatedDescription: {
    lineHeight: 21,
  },
  privacyNotice: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noticeCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  noticeText: {
    lineHeight: 21,
  },
  summaryCard: {
    padding: 0,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ltrValue: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  actions: {
    gap: spacing.md,
  },
  successInfoCard: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
