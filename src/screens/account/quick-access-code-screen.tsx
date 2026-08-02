import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import {
  changeQuickAccessCode,
  isWeakQuickAccessCode,
  normalizeQuickAccessCode,
  removeQuickAccessCode,
  setQuickAccessCode,
  useQuickAccessCodeState,
  verifyQuickAccessCode,
} from './quick-access-code-data';

type ScreenMode = 'create' | 'overview' | 'change' | 'remove';

type PinFields = {
  current: string;
  next: string;
  confirm: string;
};

const emptyFields: PinFields = {
  current: '',
  next: '',
  confirm: '',
};

export function QuickAccessCodeScreen() {
  const insets = useSafeAreaInsets();
  const quickAccessCode = useQuickAccessCodeState();
  const [mode, setMode] = useState<ScreenMode>(quickAccessCode.isEnabled ? 'overview' : 'create');
  const [fields, setFields] = useState<PinFields>(emptyFields);
  const [showCode, setShowCode] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);

  const hasDraft = Boolean(fields.current || fields.next || fields.confirm);
  const remainingLockSeconds = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const locked = remainingLockSeconds > 0;
  const createValid = isValidNewCode(fields.next) && fields.confirm === fields.next;
  const changeValid =
    fields.current.length === 4 &&
    isValidNewCode(fields.next) &&
    fields.next !== fields.current &&
    fields.confirm === fields.next &&
    !locked;
  const removeValid = fields.current.length === 4 && !locked;

  useEffect(() => {
    if (!lockedUntil) {
      return undefined;
    }

    const interval = setInterval(() => {
      const nextNow = Date.now();
      setNow(nextNow);
      if (nextNow >= lockedUntil) {
        setLockedUntil(null);
        setWrongAttempts(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (removeDialogVisible) {
        setRemoveDialogVisible(false);
        return true;
      }

      if (unsavedDialogVisible) {
        setUnsavedDialogVisible(false);
        return true;
      }

      if (hasDraft) {
        setUnsavedDialogVisible(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [hasDraft, removeDialogVisible, unsavedDialogVisible]);

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function requestBack() {
    Keyboard.dismiss();

    if (hasDraft) {
      setUnsavedDialogVisible(true);
      return;
    }

    goBackToSecurity();
  }

  function updateField(field: keyof PinFields, value: string) {
    setFields((current) => ({ ...current, [field]: normalizeQuickAccessCode(value) }));
    setError(null);
    setFeedback(null);
  }

  function resetForm(nextMode: ScreenMode = quickAccessCode.isEnabled ? 'overview' : 'create') {
    setFields(emptyFields);
    setShowCode(false);
    setError(null);
    setMode(nextMode);
  }

  function handleWrongCurrentCode() {
    const nextAttempts = wrongAttempts + 1;
    setWrongAttempts(nextAttempts);
    setError('رمز الدخول الحالي غير صحيح.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);

    if (nextAttempts >= 5) {
      setLockedUntil(Date.now() + 30000);
      setError('حاول مرة أخرى بعد 30 ثانية.');
    }
  }

  function verifyCurrentCode() {
    if (locked) {
      setError(`حاول مرة أخرى بعد ${remainingLockSeconds} ثانية.`);
      return false;
    }

    const valid = verifyQuickAccessCode(fields.current);

    if (!valid) {
      handleWrongCurrentCode();
      return false;
    }

    setWrongAttempts(0);
    setLockedUntil(null);
    return true;
  }

  function handleCreateCode() {
    if (!createValid) {
      setError(getCreateError(fields.next, fields.confirm));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    setQuickAccessCode(fields.next);
    resetForm('overview');
    setFeedback('تم تفعيل رمز الدخول السريع في النموذج التجريبي.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  function handleChangeCode() {
    if (!changeValid) {
      setError(getChangeError(fields));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    if (!verifyCurrentCode()) {
      return;
    }

    const changed = changeQuickAccessCode(fields.current, fields.next);
    if (!changed) {
      handleWrongCurrentCode();
      return;
    }

    resetForm('overview');
    setFeedback('تم تغيير رمز الدخول السريع في النموذج التجريبي.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  function requestRemoveCode() {
    if (!removeValid) {
      setError(locked ? `حاول مرة أخرى بعد ${remainingLockSeconds} ثانية.` : 'أدخل رمز الدخول الحالي.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    if (!verifyCurrentCode()) {
      return;
    }

    setRemoveDialogVisible(true);
  }

  function confirmRemoveCode() {
    removeQuickAccessCode();
    setRemoveDialogVisible(false);
    resetForm('create');
    setFeedback('تمت إزالة رمز الدخول السريع.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  function discardDraft() {
    setUnsavedDialogVisible(false);
    resetForm(quickAccessCode.isEnabled ? 'overview' : 'create');
    goBackToSecurity();
  }

  const titleByMode = getModeTitle(mode);
  const inlineError = mode === 'create' || mode === 'change' ? getInlinePinError(fields, mode) : null;

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header onBackPress={requestBack} />
        <PrototypeNotice />

        {feedback ? <FeedbackCard message={feedback} /> : null}
        {locked ? <LockoutCard seconds={remainingLockSeconds} /> : null}

        {mode === 'overview' ? (
          <Overview
            onChangePress={() => {
              resetForm('change');
              setFeedback(null);
            }}
            onRemovePress={() => {
              resetForm('remove');
              setFeedback(null);
            }}
          />
        ) : (
          <SolidCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <AppText variant="cardTitle">{titleByMode}</AppText>
              <Pressable
                accessibilityLabel={showCode ? 'إخفاء الرمز' : 'إظهار الرمز'}
                accessibilityRole="button"
                onPress={() => setShowCode((current) => !current)}
                style={({ pressed }) => [styles.showButton, pressed && styles.pressed]}
              >
                <Ionicons color={colors.text.tertiary} name={showCode ? 'eye-off-outline' : 'eye-outline'} size={18} />
                <AppText tone="secondary" variant="caption">
                  {showCode ? 'إخفاء' : 'إظهار'}
                </AppText>
              </Pressable>
            </View>

            {mode === 'change' || mode === 'remove' ? (
              <>
                <PinInput
                  label="الرمز الحالي"
                  onChangeText={(value) => updateField('current', value)}
                  showCode={showCode}
                  value={fields.current}
                />
                <Divider />
              </>
            ) : null}

            {mode === 'create' || mode === 'change' ? (
              <>
                <PinInput
                  label={mode === 'create' ? 'أدخل رمزًا جديدًا' : 'الرمز الجديد'}
                  onChangeText={(value) => updateField('next', value)}
                  showCode={showCode}
                  value={fields.next}
                />
                <PinRules code={fields.next} currentCode={mode === 'change' ? fields.current : undefined} />
                <Divider />
                <PinInput
                  label={mode === 'create' ? 'أكّد الرمز' : 'تأكيد الرمز الجديد'}
                  onChangeText={(value) => updateField('confirm', value)}
                  showCode={showCode}
                  value={fields.confirm}
                />
              </>
            ) : null}

            {inlineError || error ? (
              <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
                {error ?? inlineError}
              </AppText>
            ) : null}

            {mode === 'create' ? (
              <AppButton disabled={!createValid} onPress={handleCreateCode}>
                تفعيل رمز الدخول
              </AppButton>
            ) : null}

            {mode === 'change' ? (
              <AppButton disabled={!changeValid} onPress={handleChangeCode}>
                حفظ الرمز الجديد
              </AppButton>
            ) : null}

            {mode === 'remove' ? (
              <AppButton disabled={!removeValid} onPress={requestRemoveCode} variant="danger">
                إزالة رمز الدخول
              </AppButton>
            ) : null}

            {quickAccessCode.isEnabled ? (
              <AppButton onPress={() => resetForm('overview')} variant="ghost">
                رجوع
              </AppButton>
            ) : null}
          </SolidCard>
        )}

        <BiometricNote />
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="إزالة الرمز"
        description="لن تتمكن من استخدام الرمز للدخول السريع حتى تقوم بإنشاء رمز جديد."
        onCancel={() => setRemoveDialogVisible(false)}
        onConfirm={confirmRemoveCode}
        title="إزالة رمز الدخول السريع؟"
        tone="danger"
        visible={removeDialogVisible}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة الإعداد"
        description="لديك تغييرات غير مكتملة في رمز الدخول السريع."
        onCancel={discardDraft}
        onConfirm={() => setUnsavedDialogVisible(false)}
        title="لديك تغييرات غير مكتملة"
        tone="warning"
        visible={unsavedDialogVisible}
      />
    </KeyboardAvoidingView>
  );
}

function Header({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="العودة إلى الأمان"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-forward-outline"
        iconSize={22}
        onPress={onBackPress}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="center" numberOfLines={1} variant="screenTitle">
          رمز الدخول السريع
        </AppText>
        <AppText align="center" tone="secondary" variant="caption">
          استخدم رمزًا من 4 أرقام للوصول السريع إلى Capital.
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
        هذا نموذج تجريبي محلي. لا يحمي الرمز حسابًا حقيقيًا ولا يتم إرساله إلى خادم.
      </AppText>
    </SolidCard>
  );
}

function Overview({ onChangePress, onRemovePress }: { onChangePress: () => void; onRemovePress: () => void }) {
  return (
    <SolidCard style={styles.statusCard}>
      <View style={styles.statusIcon}>
        <Ionicons color={colors.brand.calmGreen} name="keypad-outline" size={22} />
      </View>
      <View style={styles.statusCopy}>
        <AppText variant="cardTitle">رمز الدخول السريع مفعّل</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          يمكنك استخدام الرمز المكوّن من 4 أرقام في نموذج الدخول التجريبي.
        </AppText>
        <View style={styles.actions}>
          <AppButton onPress={onChangePress}>تغيير رمز الدخول</AppButton>
          <AppButton onPress={onRemovePress} variant="danger">
            إزالة رمز الدخول
          </AppButton>
        </View>
      </View>
    </SolidCard>
  );
}

function PinInput({
  label,
  value,
  showCode,
  onChangeText,
}: {
  label: string;
  value: string;
  showCode: boolean;
  onChangeText: (value: string) => void;
}) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.pinGroup}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <Pressable accessibilityRole="none" onPress={() => inputRef.current?.focus()} style={styles.pinDisplayRow}>
        {[0, 1, 2, 3].map((index) => {
          const digit = value[index];
          return (
            <View key={index} style={[styles.pinBox, digit && styles.pinBoxFilled]}>
              <AppText align="center" style={styles.pinBoxText} variant="numericValue">
                {digit ? (showCode ? digit : '•') : ''}
              </AppText>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        autoCapitalize="none"
        autoCorrect={false}
        caretHidden={Platform.OS === 'ios'}
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={onChangeText}
        placeholder={Platform.OS === 'ios' ? undefined : '0000'}
        placeholderTextColor={colors.text.tertiary}
        secureTextEntry={!showCode}
        style={[styles.hiddenInput, Platform.OS === 'ios' && styles.hiddenInputIos]}
        textContentType="oneTimeCode"
        value={value}
      />
    </View>
  );
}

function PinRules({ code, currentCode }: { code: string; currentCode?: string }) {
  const rules = [
    { id: 'length', label: '4 أرقام فقط', passed: code.length === 4 },
    { id: 'weak', label: 'ليس رمزًا ضعيفًا', passed: code.length === 4 && !isWeakQuickAccessCode(code) },
    {
      id: 'current',
      label: 'لا يطابق الرمز الحالي',
      passed: currentCode ? code.length === 4 && code !== currentCode : true,
    },
  ];

  return (
    <View style={styles.rules}>
      {rules.map((rule) => (
        <View key={rule.id} style={styles.ruleRow}>
          <Ionicons
            color={rule.passed ? colors.semantic.success : colors.text.tertiary}
            name={rule.passed ? 'checkmark-circle' : 'ellipse-outline'}
            size={15}
          />
          <AppText tone={rule.passed ? 'success' : 'tertiary'} variant="caption">
            {rule.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function FeedbackCard({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
      <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="success" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function LockoutCard({ seconds }: { seconds: number }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.lockoutCard}>
      <Ionicons color={colors.semantic.warning} name="time-outline" size={18} />
      <AppText style={styles.noticeText} tone="warning" variant="supporting">
        حاول مرة أخرى بعد {seconds} ثانية.
      </AppText>
    </SolidCard>
  );
}

function BiometricNote() {
  return (
    <SolidCard style={styles.biometricCard}>
      <Ionicons color={colors.text.tertiary} name="finger-print-outline" size={18} />
      <AppText style={styles.noticeText} tone="tertiary" variant="caption">
        سيتم ربط رمز الدخول بالقياسات الحيوية في مرحلة لاحقة.
      </AppText>
    </SolidCard>
  );
}

function getModeTitle(mode: ScreenMode) {
  if (mode === 'change') {
    return 'تغيير رمز الدخول';
  }

  if (mode === 'remove') {
    return 'إزالة رمز الدخول';
  }

  return 'إنشاء رمز جديد';
}

function isValidNewCode(code: string) {
  return code.length === 4 && !isWeakQuickAccessCode(code);
}

function getCreateError(code: string, confirm: string) {
  if (code.length < 4) {
    return 'أدخل رمزًا من 4 أرقام.';
  }

  if (isWeakQuickAccessCode(code)) {
    return 'اختر رمزًا يصعب تخمينه.';
  }

  if (confirm !== code) {
    return 'رمزا الدخول غير متطابقين.';
  }

  return null;
}

function getChangeError(fields: PinFields) {
  if (fields.current.length < 4) {
    return 'أدخل رمز الدخول الحالي.';
  }

  if (fields.next.length < 4) {
    return 'أدخل رمزًا جديدًا من 4 أرقام.';
  }

  if (isWeakQuickAccessCode(fields.next)) {
    return 'اختر رمزًا يصعب تخمينه.';
  }

  if (fields.next === fields.current) {
    return 'يجب أن يختلف الرمز الجديد عن الحالي.';
  }

  if (fields.confirm !== fields.next) {
    return 'رمزا الدخول غير متطابقين.';
  }

  return null;
}

function getInlinePinError(fields: PinFields, mode: ScreenMode) {
  if (fields.next && fields.next.length < 4) {
    return 'أدخل رمزًا من 4 أرقام.';
  }

  if (fields.next.length === 4 && isWeakQuickAccessCode(fields.next)) {
    return 'اختر رمزًا يصعب تخمينه.';
  }

  if (mode === 'change' && fields.next.length === 4 && fields.current.length === 4 && fields.next === fields.current) {
    return 'يجب أن يختلف الرمز الجديد عن الحالي.';
  }

  if (fields.confirm && fields.confirm !== fields.next) {
    return 'رمزا الدخول غير متطابقين.';
  }

  return null;
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
    gap: spacing.md,
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
  formCard: {
    gap: Platform.select({ ios: spacing.xxl, default: spacing.lg }),
  },
  formHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  showButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  pinGroup: {
    gap: Platform.select({ ios: spacing.md, default: spacing.sm }),
    position: 'relative',
  },
  pinDisplayRow: {
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pinBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  pinBoxFilled: {
    borderColor: 'rgba(167,200,161,0.34)',
  },
  pinBoxText: {
    color: colors.text.primary,
    lineHeight: 32,
  },
  hiddenInput: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 18,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  hiddenInputIos: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    bottom: 0,
    height: 1,
    left: 0,
    minHeight: 0,
    opacity: 0,
    paddingHorizontal: 0,
    position: 'absolute',
    width: 1,
  },
  rules: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ruleRow: {
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
  statusCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  statusCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  description: {
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  lockoutCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  biometricCard: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
