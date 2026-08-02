import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, SuccessState } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ChangePasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ChangePasswordErrors = Partial<Record<keyof ChangePasswordFormState | 'reuse', string>>;

type PasswordRequirement = {
  id: string;
  label: string;
  passed: boolean;
};

type PasswordStrength = {
  label: 'ضعيفة' | 'متوسطة' | 'قوية';
  level: 1 | 2 | 3;
  tone: 'danger' | 'warning' | 'success';
};

const emptyForm: ChangePasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [form, setForm] = useState<ChangePasswordFormState>(emptyForm);
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const requirements = useMemo(
    () => getPasswordRequirements(form.newPassword, form.currentPassword),
    [form.currentPassword, form.newPassword],
  );
  const strength = useMemo(() => getPasswordStrength(requirements, form.newPassword), [form.newPassword, requirements]);
  const dirty = Boolean(form.currentPassword || form.newPassword || form.confirmPassword);
  const formValid = useMemo(() => {
    const currentPassword = form.currentPassword.trim();
    const newPassword = form.newPassword;
    const confirmPassword = form.confirmPassword;

    return Boolean(
      currentPassword &&
        newPassword &&
        confirmPassword &&
        requirements.every((requirement) => requirement.passed) &&
        newPassword === confirmPassword &&
        newPassword === newPassword.trim() &&
        newPassword !== currentPassword,
    );
  }, [form, requirements]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty && !submitted) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, showUnsavedDialog, submitted]);

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function handleBackPress() {
    Keyboard.dismiss();

    if (dirty && !submitted) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToSecurity();
  }

  function updateField(field: keyof ChangePasswordFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, reuse: undefined }));
  }

  function clearSensitiveValues() {
    setForm(emptyForm);
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  function validateForm() {
    const nextErrors: ChangePasswordErrors = {};
    const currentPassword = form.currentPassword;
    const newPassword = form.newPassword;
    const confirmPassword = form.confirmPassword;
    const allRequirementsPassed = requirements.every((requirement) => requirement.passed);

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = 'أدخل كلمة المرور الحالية';
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = 'أدخل كلمة مرور جديدة';
    } else if (newPassword !== newPassword.trim()) {
      nextErrors.newPassword = 'لا تستخدم مسافات في بداية أو نهاية كلمة المرور';
    } else if (!allRequirementsPassed) {
      nextErrors.newPassword = 'أكمل متطلبات كلمة المرور الجديدة';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      nextErrors.reuse = 'يجب أن تختلف كلمة المرور الجديدة عن الحالية';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'أكد كلمة المرور الجديدة';
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    Keyboard.dismiss();

    if (submitting) {
      return;
    }

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setSubmitting(true);
    submitTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      clearSensitiveValues();
      setSubmitting(false);
      setSubmitted(true);
    }, 650);
  }

  function handleDiscardChanges() {
    clearSensitiveValues();
    setShowUnsavedDialog(false);
    goBackToSecurity();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  if (submitted) {
    return (
      <SuccessState
        description="تم تنفيذ التغيير محليًا في النموذج التجريبي. لم يتم تحديث بيانات دخول حقيقية أو إنهاء أي جلسة."
        fullScreen
        onPrimaryAction={() => router.replace(routes.security)}
        onSecondaryAction={() => router.replace(routes.account)}
        primaryActionLabel="العودة إلى الأمان"
        secondaryActionLabel="العودة إلى الحساب"
        title="تم تحديث كلمة المرور"
      />
    );
  }

  const confirmMatches = Boolean(form.confirmPassword && form.confirmPassword === form.newPassword);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      style={styles.root}
    >
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
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
        <ChangePasswordHeader onBackPress={handleBackPress} />
        <PrototypeNotice />
        <SecurityInfoCard />

        <SolidCard style={styles.formCard}>
          <PasswordField
            error={errors.currentPassword}
            helper="لن يتم إرسال كلمة المرور أو تخزينها في هذا النموذج التجريبي."
            label="كلمة المرور الحالية"
            onChangeText={(value) => updateField('currentPassword', value)}
            onToggleVisibility={() => setShowCurrentPassword((current) => !current)}
            placeholder="أدخل كلمة المرور الحالية"
            showPassword={showCurrentPassword}
            value={form.currentPassword}
          />
          <Divider />
          <PasswordField
            error={errors.newPassword ?? errors.reuse}
            label="كلمة المرور الجديدة"
            onChangeText={(value) => updateField('newPassword', value)}
            onToggleVisibility={() => setShowNewPassword((current) => !current)}
            placeholder="أدخل كلمة مرور جديدة"
            showPassword={showNewPassword}
            value={form.newPassword}
          />
          <PasswordRequirements requirements={requirements} />
          <PasswordStrengthIndicator strength={strength} />
          <Divider />
          <PasswordField
            error={errors.confirmPassword}
            helper={confirmMatches ? 'كلمتا المرور متطابقتان' : undefined}
            helperTone={confirmMatches ? 'success' : 'secondary'}
            label="تأكيد كلمة المرور الجديدة"
            onChangeText={(value) => updateField('confirmPassword', value)}
            onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
            placeholder="أعد إدخال كلمة المرور الجديدة"
            showPassword={showConfirmPassword}
            value={form.confirmPassword}
          />
        </SolidCard>

        <SessionNoticeCard />

        <View style={styles.actions}>
          <AppButton disabled={!formValid || submitting} loading={submitting} onPress={handleSubmit}>
            {submitting ? 'جاري تحديث كلمة المرور' : 'تحديث كلمة المرور'}
          </AppButton>
          <AppButton disabled={submitting} onPress={handleBackPress} variant="ghost">
            إلغاء
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، سيتم حذف القيم التي أدخلتها."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </KeyboardAvoidingView>
  );
}

function ChangePasswordHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الأمان"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" numberOfLines={1} variant="screenTitle">
          تغيير كلمة المرور
        </AppText>
        <AppText align="center" style={styles.headerSubtitle} tone="secondary" variant="caption">
          استخدم كلمة قوية لا تستخدمها في حساب آخر.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function PrototypeNotice() {
  return (
    <SolidCard style={styles.prototypeNotice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="secondary" variant="supporting">
        هذا نموذج تجريبي محلي، ولا يتم تغيير كلمة مرور حقيقية أو إرسال بيانات إلى خادم.
      </AppText>
    </SolidCard>
  );
}

function SecurityInfoCard() {
  return (
    <SolidCard style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Ionicons color={colors.brand.calmGreen} name="lock-closed-outline" size={22} />
      </View>
      <View style={styles.infoCopy}>
        <AppText variant="cardTitle">حافظ على أمان حسابك</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          استخدم كلمة مرور قوية ومختلفة عن كلمات المرور التي تستخدمها في الخدمات الأخرى.
        </AppText>
      </View>
    </SolidCard>
  );
}

function PasswordField({
  label,
  value,
  placeholder,
  showPassword,
  error,
  helper,
  helperTone = 'secondary',
  onChangeText,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  placeholder: string;
  showPassword: boolean;
  error?: string;
  helper?: string;
  helperTone?: 'secondary' | 'success';
  onChangeText: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  const visibilityLabel = showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور';

  return (
    <View style={styles.field}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <View style={[styles.inputFrame, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={!showPassword}
          style={styles.input}
          textContentType="password"
          value={value}
        />
        <Pressable
          accessibilityLabel={visibilityLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onToggleVisibility}
          style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.tertiary} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} />
        </Pressable>
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : helper ? (
        <AppText accessibilityLiveRegion="polite" tone={helperTone} variant="caption">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

function PasswordRequirements({ requirements }: { requirements: PasswordRequirement[] }) {
  return (
    <View style={styles.requirements}>
      {requirements.map((requirement) => (
        <View
          accessibilityLabel={`${requirement.label}. ${requirement.passed ? 'مكتمل' : 'غير مكتمل'}`}
          key={requirement.id}
          style={styles.requirementRow}
        >
          <Ionicons
            color={requirement.passed ? colors.semantic.success : colors.text.tertiary}
            name={requirement.passed ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
          />
          <AppText style={styles.requirementText} tone={requirement.passed ? 'success' : 'tertiary'} variant="caption">
            {requirement.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: PasswordStrength }) {
  return (
    <View style={styles.strengthBlock} accessibilityLabel={`قوة كلمة المرور ${strength.label}`}>
      <View style={styles.strengthHeader}>
        <AppText tone="secondary" variant="caption">
          قوة كلمة المرور
        </AppText>
        <AppText tone={strength.tone} variant="caption">
          {strength.label}
        </AppText>
      </View>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              level <= strength.level && strength.tone === 'danger' && styles.strengthWeak,
              level <= strength.level && strength.tone === 'warning' && styles.strengthMedium,
              level <= strength.level && strength.tone === 'success' && styles.strengthStrong,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function SessionNoticeCard() {
  return (
    <SolidCard style={styles.sessionCard}>
      <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={20} />
      <View style={styles.sessionCopy}>
        <AppText variant="cardTitle">بعد تغيير كلمة المرور</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          في النسخة الإنتاجية، قد يتم تسجيل خروجك من الأجهزة الأخرى لحماية الحساب.
        </AppText>
      </View>
    </SolidCard>
  );
}

function getPasswordRequirements(password: string, currentPassword: string): PasswordRequirement[] {
  return [
    { id: 'length', label: '8 أحرف على الأقل', passed: password.length >= 8 },
    { id: 'uppercase', label: 'حرف إنجليزي كبير', passed: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'حرف إنجليزي صغير', passed: /[a-z]/.test(password) },
    { id: 'number', label: 'رقم واحد على الأقل', passed: /\d/.test(password) },
    { id: 'symbol', label: 'رمز خاص واحد على الأقل', passed: /[^A-Za-z0-9]/.test(password) },
    {
      id: 'not-current',
      label: 'لا تطابق كلمة المرور الحالية',
      passed: Boolean(password && currentPassword && password !== currentPassword),
    },
  ];
}

function getPasswordStrength(requirements: PasswordRequirement[], password: string): PasswordStrength {
  const passedCount = requirements.filter((requirement) => requirement.passed).length;

  if (passedCount === requirements.length && password.length >= 10) {
    return { label: 'قوية', level: 3, tone: 'success' };
  }

  if (passedCount >= 3) {
    return { label: 'متوسطة', level: 2, tone: 'warning' };
  }

  return { label: 'ضعيفة', level: 1, tone: 'danger' };
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
    minHeight: 42,
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
  headerSubtitle: {
    lineHeight: 18,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  prototypeNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.58)',
    borderColor: 'rgba(167,200,161,0.22)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
    lineHeight: 22,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.32)',
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
  description: {
    lineHeight: 22,
  },
  formCard: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  inputFrame: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 52,
    paddingVertical: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  visibilityButton: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  requirements: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  requirementRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  requirementText: {
    lineHeight: 16,
  },
  strengthBlock: {
    gap: spacing.sm,
  },
  strengthHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  strengthBars: {
    flexDirection: 'row-reverse',
    gap: spacing.xs,
  },
  strengthBar: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.pill,
    flex: 1,
    height: 5,
  },
  strengthWeak: {
    backgroundColor: colors.semantic.danger,
  },
  strengthMedium: {
    backgroundColor: colors.semantic.warning,
  },
  strengthStrong: {
    backgroundColor: colors.semantic.success,
  },
  sessionCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  sessionCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  actions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
