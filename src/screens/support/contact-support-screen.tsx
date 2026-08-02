import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/forms';
import { ConfirmationDialog, StateScreen } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type SupportRequestCategory =
  | 'transaction'
  | 'subscription'
  | 'security'
  | 'reports'
  | 'feedback'
  | 'general';

type SupportPriority = 'normal' | 'important' | 'urgent';

type RelatedArea = 'home' | 'ledger' | 'intelligence' | 'reports' | 'account' | 'subscriptions' | 'other';

type ContactSupportFormState = {
  category: SupportRequestCategory;
  priority: SupportPriority;
  subject: string;
  details: string;
  relatedArea: RelatedArea;
  email: string;
};

type ContactSupportErrors = Partial<Record<keyof ContactSupportFormState, string>>;

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

const supportReference = 'CAP-SUP-1049';

const requestCategoryOptions: SelectOption<SupportRequestCategory>[] = [
  { value: 'transaction', label: 'مشكلة في معاملة' },
  { value: 'subscription', label: 'مشكلة في الاشتراك' },
  { value: 'security', label: 'مشكلة أمان' },
  { value: 'reports', label: 'مشكلة في التقارير' },
  { value: 'feedback', label: 'اقتراح أو ملاحظة' },
  { value: 'general', label: 'سؤال عام' },
];

const priorityOptions: SelectOption<SupportPriority>[] = [
  { value: 'normal', label: 'عادية' },
  { value: 'important', label: 'مهمة' },
  { value: 'urgent', label: 'عاجلة' },
];

const relatedAreaOptions: SelectOption<RelatedArea>[] = [
  { value: 'home', label: 'الرئيسية' },
  { value: 'ledger', label: 'السجل والمعاملات' },
  { value: 'intelligence', label: 'الذكاء المالي' },
  { value: 'reports', label: 'التقارير' },
  { value: 'account', label: 'الحساب والإعدادات' },
  { value: 'subscriptions', label: 'الاشتراكات' },
  { value: 'other', label: 'أخرى' },
];

const initialForm: ContactSupportFormState = {
  category: 'general',
  priority: 'normal',
  subject: 'اتصال عام بفريق الدعم',
  details: '',
  relatedArea: 'other',
  email: 'abdullah@capital.app',
};

export function ContactSupportScreen() {
  const insets = useSafeAreaInsets();
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState<ContactSupportFormState>(initialForm);
  const [errors, setErrors] = useState<ContactSupportErrors>({});
  const [selectState, setSelectState] = useState<SelectState | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dirty = useMemo(() => {
    if (submitted) {
      return false;
    }

    return Object.keys(initialForm).some((key) => {
      const formKey = key as keyof ContactSupportFormState;
      return form[formKey] !== initialForm[formKey];
    });
  }, [form, submitted]);

  const responseExpectation = useMemo(() => {
    if (form.category === 'security' || form.priority === 'urgent') {
      return 'أولوية عالية — سنراجع الطلب بأسرع وقت';
    }

    return 'خلال يوم عمل واحد';
  }, [form.category, form.priority]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
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

  function updateForm<Key extends keyof ContactSupportFormState>(
    key: Key,
    value: ContactSupportFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleBackPress() {
    if (dirty) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToHelpCenter();
  }

  function goBackToHelpCenter() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.helpCenter);
  }

  function openSelect(state: SelectState) {
    Keyboard.dismiss();
    setSelectState(state);
  }

  function validateForm() {
    const nextErrors: ContactSupportErrors = {};
    const subject = form.subject.trim();
    const details = form.details.trim();
    const email = form.email.trim();

    if (!form.category) {
      nextErrors.category = 'اختر نوع الطلب';
    }

    if (!form.priority) {
      nextErrors.priority = 'اختر الأولوية';
    }

    if (!subject) {
      nextErrors.subject = 'اكتب عنوان الطلب';
    }

    if (details.length < 10) {
      nextErrors.details = 'أضف تفاصيل أوضح عن المشكلة';
    }

    if (!isValidEmail(email)) {
      nextErrors.email = 'أدخل بريدًا إلكترونيًا صحيحًا';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (submitting) {
      return;
    }

    if (!validateForm()) {
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
    goBackToHelpCenter();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  if (submitted) {
    return (
      <StateScreen
        description={`رقم المرجع: ‎${supportReference}‎ · سيتم تفعيل الإرسال إلى فريق الدعم في إصدار لاحق.`}
        iconName="checkmark-outline"
        onPrimaryAction={() => router.replace(routes.helpCenter)}
        onSecondaryAction={() => router.push(routes.supportRequests)}
        primaryActionLabel="العودة إلى مركز المساعدة"
        secondaryActionLabel="عرض طلبات الدعم"
        title="تم حفظ طلبك في النسخة التجريبية"
      />
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ContactSupportHeader onBackPress={handleBackPress} />

          <InfoCard />

          <SelectField
            error={errors.category}
            label="نوع الطلب"
            onPress={() =>
              openSelect({
                key: 'category',
                label: 'نوع الطلب',
                options: requestCategoryOptions,
                selectedValue: form.category,
              })
            }
            value={getOptionLabel(requestCategoryOptions, form.category)}
          />

        <View style={styles.section}>
          <AppText tone="secondary" variant="supporting">
            الأولوية
          </AppText>
          <View style={styles.priorityRow}>
            {priorityOptions.map((option) => (
              <PriorityChip
                key={option.value}
                onPress={() => updateForm('priority', option.value)}
                option={option}
                selected={form.priority === option.value}
              />
            ))}
          </View>
          {errors.priority ? (
            <AppText tone="danger" variant="caption">
              {errors.priority}
            </AppText>
          ) : null}
        </View>

        <FormField
          accessibilityLabel="عنوان الطلب"
          error={errors.subject}
          label="عنوان الطلب"
          maxLength={120}
          onChangeText={(value) => updateForm('subject', value)}
          placeholder="اكتب عنوانًا مختصرًا للمشكلة"
          value={form.subject}
        />

        <FormField
          accessibilityLabel="تفاصيل المشكلة"
          error={errors.details}
          label="تفاصيل المشكلة"
          multiline
          onChangeText={(value) => updateForm('details', value)}
          placeholder="اشرح ما حدث والخطوات التي سبقت المشكلة..."
          style={styles.detailsInput}
          textAlignVertical="top"
          value={form.details}
        />
        <AppText style={styles.helperText} tone="tertiary" variant="caption">
          كلما أضفت تفاصيل أكثر، ساعدنا ذلك على حل المشكلة بشكل أسرع.
        </AppText>

        <SelectField
          label="القسم المتعلق بالمشكلة"
          onPress={() =>
            openSelect({
              key: 'relatedArea',
              label: 'القسم المتعلق بالمشكلة',
              options: relatedAreaOptions,
              selectedValue: form.relatedArea,
            })
          }
          value={getOptionLabel(relatedAreaOptions, form.relatedArea)}
        />

        <FormField
          accessibilityLabel="البريد الإلكتروني للتواصل"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="البريد الإلكتروني للتواصل"
          onChangeText={(value) => updateForm('email', value)}
          placeholder="abdullah@capital.app"
          style={styles.emailInput}
          value={form.email}
        />

        <AttachmentCard />

        <ResponseExpectationCard value={responseExpectation} urgent={form.category === 'security' || form.priority === 'urgent'} />

        <View style={styles.actions}>
          <AppButton disabled={submitting} loading={submitting} onPress={handleSubmit}>
            {submitting ? 'جاري الإرسال' : 'إرسال الطلب'}
          </AppButton>
          <AppButton onPress={handleBackPress} variant="ghost">
            إلغاء
          </AppButton>
        </View>
        </ScrollView>
      </SafeAreaView>

      <SelectPicker
        onClose={() => setSelectState(null)}
        onSelect={(value) => {
          if (!selectState) {
            return;
          }

          if (selectState.key === 'category') {
            updateForm('category', value as SupportRequestCategory);
          }

          if (selectState.key === 'relatedArea') {
            updateForm('relatedArea', value as RelatedArea);
          }

          setSelectState(null);
        }}
        state={selectState}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، لن يتم إرسال طلب الدعم."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </KeyboardAvoidingView>
  );
}

type SelectState = {
  key: 'category' | 'relatedArea';
  label: string;
  options: SelectOption<string>[];
  selectedValue: string;
};

function ContactSupportHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى مركز المساعدة"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" numberOfLines={1} variant="screenTitle">
          التواصل مع الدعم
        </AppText>
        <AppText align="center" numberOfLines={2} tone="secondary" variant="supporting">
          أرسل طلبًا وسنساعدك في أقرب وقت
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function InfoCard() {
  return (
    <SolidCard style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={21} />
      </View>
      <View style={styles.infoCopy}>
        <AppText variant="cardTitle">كيف يمكننا مساعدتك؟</AppText>
        <AppText style={styles.infoDescription} tone="secondary" variant="supporting">
          اختر نوع المشكلة وأرسل التفاصيل. لا تشارك كلمة المرور أو رمز PIN أو أي بيانات بنكية حساسة.
        </AppText>
      </View>
    </SolidCard>
  );
}

function SelectField({
  label,
  value,
  error,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.section}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.selectField, error && styles.inputError, pressed && styles.pressed]}
      >
        <AppText style={styles.selectValue} variant="body">
          {value}
        </AppText>
        <Ionicons color={colors.text.tertiary} name="chevron-down-outline" size={18} />
      </Pressable>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function PriorityChip({
  option,
  selected,
  onPress,
}: {
  option: SelectOption<SupportPriority>;
  selected: boolean;
  onPress: () => void;
}) {
  const selectedStyle = getPrioritySelectedStyle(option.value);
  const selectedTone = option.value === 'urgent' ? 'danger' : option.value === 'important' ? 'warning' : 'success';

  return (
    <Pressable
      accessibilityLabel={option.label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.priorityChip,
        selected ? selectedStyle : styles.priorityUnselected,
        pressed && styles.pressed,
      ]}
    >
      <AppText align="center" tone={selected ? selectedTone : 'secondary'} variant="buttonLabel">
        {option.label}
      </AppText>
    </Pressable>
  );
}

function AttachmentCard() {
  return (
    <Pressable
      accessibilityLabel="إرفاق صورة أو ملف. هذه الميزة غير متاحة حاليًا"
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.attachmentCard}
    >
      <View style={styles.attachmentIcon}>
        <Ionicons color={colors.text.tertiary} name="attach-outline" size={21} />
      </View>
      <View style={styles.attachmentCopy}>
        <View style={styles.attachmentTitleRow}>
          <AppText style={styles.attachmentTitle} variant="body">
            إرفاق صورة أو ملف
          </AppText>
          <View style={styles.soonBadge}>
            <AppText align="center" tone="secondary" variant="caption">
              قريبًا
            </AppText>
          </View>
        </View>
        <AppText tone="secondary" variant="caption">
          سيتم تفعيل رفع الملفات في إصدار لاحق.
        </AppText>
      </View>
    </Pressable>
  );
}

function ResponseExpectationCard({ value, urgent }: { value: string; urgent: boolean }) {
  return (
    <SolidCard style={[styles.responseCard, urgent && styles.urgentResponseCard]}>
      <View style={styles.responseIcon}>
        <Ionicons color={urgent ? colors.semantic.warning : colors.semantic.success} name="time-outline" size={19} />
      </View>
      <View style={styles.responseCopy}>
        <AppText variant="cardTitle">وقت الاستجابة المتوقع</AppText>
        <AppText tone={urgent ? 'warning' : 'secondary'} variant="supporting">
          {value}
        </AppText>
      </View>
    </SolidCard>
  );
}

function SelectPicker({
  state,
  onClose,
  onSelect,
}: {
  state: SelectState | null;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={!!state}>
      <View style={styles.pickerRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.pickerBackdrop} />
        <SolidCard style={styles.pickerCard}>
          <AppText align="center" variant="sectionTitle">
            {state?.label}
          </AppText>
          <View style={styles.pickerOptions}>
            {state?.options.map((option) => {
              const selected = option.value === state.selectedValue;

              return (
                <Pressable
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [
                    styles.pickerOption,
                    selected && styles.pickerOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText tone={selected ? 'success' : 'secondary'} variant="body">
                    {option.label}
                  </AppText>
                  {selected ? <Ionicons color={colors.semantic.success} name="checkmark-outline" size={19} /> : null}
                </Pressable>
              );
            })}
          </View>
          <AppButton onPress={onClose} variant="secondary">
            إلغاء
          </AppButton>
        </SolidCard>
      </View>
    </Modal>
  );
}

function getOptionLabel<T extends string>(options: SelectOption<T>[], value: T) {
  return options.find((option) => option.value === value)?.label ?? '';
}

function getPrioritySelectedStyle(priority: SupportPriority) {
  if (priority === 'urgent') {
    return styles.priorityUrgent;
  }

  if (priority === 'important') {
    return styles.priorityImportant;
  }

  return styles.priorityNormal;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
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
  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,200,161,0.11)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  infoDescription: {
    lineHeight: 22,
  },
  section: {
    gap: spacing.sm,
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  selectValue: {
    flex: 1,
  },
  priorityRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  priorityChip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  priorityUnselected: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
  },
  priorityNormal: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.36)',
  },
  priorityImportant: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.34)',
  },
  priorityUrgent: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.34)',
  },
  detailsInput: {
    minHeight: 132,
    paddingVertical: spacing.md,
  },
  helperText: {
    marginTop: -spacing.md,
  },
  emailInput: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  attachmentCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.lg,
  },
  attachmentIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  attachmentCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  attachmentTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  attachmentTitle: {
    flex: 1,
  },
  soonBadge: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  inlineNotice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  responseCard: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  urgentResponseCard: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  responseIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  responseCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  actions: {
    gap: spacing.md,
  },
  pickerRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  pickerBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pickerCard: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  pickerOptions: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  pickerOptionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.38)',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
