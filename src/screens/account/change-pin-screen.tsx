import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { ConfirmationDialog, SuccessState } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NumericText } from '@/utils/rtl';

type ChangePinStep = 'current' | 'new' | 'confirm';

type ChangePinState = {
  step: ChangePinStep;
  currentPin: string;
  newPin: string;
  confirmPin: string;
  errorMessage: string | null;
  isTransitioning: boolean;
  isSubmitting: boolean;
};

const initialState: ChangePinState = {
  step: 'current',
  currentPin: '',
  newPin: '',
  confirmPin: '',
  errorMessage: null,
  isTransitioning: false,
  isSubmitting: false,
};

const orderedSteps: ChangePinStep[] = ['current', 'new', 'confirm'];
const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

const stepMeta: Record<ChangePinStep, { title: string; description: string; label: string; index: 1 | 2 | 3 }> = {
  current: {
    title: 'أدخل رمز PIN الحالي',
    description: 'أدخل الرمز الحالي للمتابعة.',
    label: 'الحالي',
    index: 1,
  },
  new: {
    title: 'أنشئ رمز PIN جديد',
    description: 'اختر رمزًا مكوّنًا من 4 أرقام يصعب تخمينه.',
    label: 'الجديد',
    index: 2,
  },
  confirm: {
    title: 'أكد رمز PIN الجديد',
    description: 'أعد إدخال الرمز الجديد للتأكد.',
    label: 'التأكيد',
    index: 3,
  },
};

export function ChangePinScreen() {
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [state, setState] = useState<ChangePinState>(initialState);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activePin = getActivePin(state);
  const activeMeta = stepMeta[state.step];
  const dirty = Boolean(state.currentPin || state.newPin || state.confirmPin || state.step !== 'current');
  const keypadDisabled = state.isTransitioning || state.isSubmitting || showConfirmDialog || submitted;
  const accessibilityDigitCount = useMemo(() => getDigitCountLabel(activePin.length), [activePin.length]);

  const clearActiveTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleTransition = useCallback((callback: () => void, delay: number) => {
    clearActiveTimer();
    setState((current) => ({ ...current, errorMessage: null, isTransitioning: true }));
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current) {
        return;
      }
      callback();
    }, delay);
  }, [clearActiveTimer]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearActiveTimer();
    };
  }, [clearActiveTimer]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showConfirmDialog) {
        setShowConfirmDialog(false);
        return true;
      }

      if (showDiscardDialog) {
        setShowDiscardDialog(false);
        return true;
      }

      if (dirty && !submitted) {
        setShowDiscardDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, showConfirmDialog, showDiscardDialog, submitted]);

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function clearPinState() {
    clearActiveTimer();
    setState(initialState);
    setShowConfirmDialog(false);
  }

  function handleHeaderBack() {
    if (dirty && !submitted) {
      setShowDiscardDialog(true);
      return;
    }

    goBackToSecurity();
  }

  function handleDigitPress(digit: string) {
    if (keypadDisabled || activePin.length >= 4) {
      return;
    }

    const nextPin = `${activePin}${digit}`;

    Haptics.selectionAsync().catch(() => null);
    setState((current) => appendDigit(current, digit));

    if (nextPin.length === 4) {
      handleCompletedPin(nextPin);
    }
  }

  function handleCompletedPin(completedPin: string) {
    if (state.step === 'current') {
      scheduleTransition(() => {
        setState((current) => ({ ...current, step: 'new', errorMessage: null, isTransitioning: false }));
      }, 350);
      return;
    }

    if (state.step === 'new') {
      scheduleTransition(() => {
        const validationError = validateNewPin(completedPin, state.currentPin);

        if (validationError) {
          setState((current) => ({
            ...current,
            newPin: '',
            confirmPin: '',
            errorMessage: validationError,
            isTransitioning: false,
          }));
          return;
        }

        setState((current) => ({ ...current, step: 'confirm', errorMessage: null, isTransitioning: false }));
      }, 350);
      return;
    }

    scheduleTransition(() => {
      if (completedPin !== state.newPin) {
        setState((current) => ({
          ...current,
          confirmPin: '',
          errorMessage: 'رمزا PIN غير متطابقين',
          isTransitioning: false,
        }));
        return;
      }

      setState((current) => ({ ...current, isTransitioning: false }));
      setShowConfirmDialog(true);
    }, 280);
  }

  function handleBackspacePress() {
    if (keypadDisabled) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setState((current) => removeLastDigit(current));
  }

  function handleConfirmPress() {
    if (keypadDisabled) {
      return;
    }

    if (activePin.length < 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      setState((current) => ({ ...current, errorMessage: 'أدخل 4 أرقام للمتابعة' }));
    }
  }

  function handleInternalBack() {
    Haptics.selectionAsync().catch(() => null);
    clearActiveTimer();
    setShowConfirmDialog(false);

    if (state.step === 'confirm') {
      setState((current) => ({
        ...current,
        step: 'new',
        newPin: '',
        confirmPin: '',
        errorMessage: null,
        isTransitioning: false,
      }));
      return;
    }

    if (state.step === 'new') {
      setState(initialState);
    }
  }

  function handleSubmitConfirm() {
    if (state.isSubmitting) {
      return;
    }

    setShowConfirmDialog(false);
    setState((current) => ({ ...current, errorMessage: null, isSubmitting: true }));
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current) {
        return;
      }

      setState(initialState);
      setSubmitted(true);
    }, 650);
  }

  function handleDiscard() {
    clearPinState();
    setShowDiscardDialog(false);
    goBackToSecurity();
  }

  if (submitted) {
    return (
      <SuccessState
        description="تم تنفيذ التغيير محليًا في النموذج التجريبي. لم يتم تحديث رمز دخول حقيقي أو تخزين أي أرقام."
        fullScreen
        onPrimaryAction={() => router.replace(routes.security)}
        onSecondaryAction={() => router.replace(routes.account)}
        primaryActionLabel="العودة إلى الأمان"
        secondaryActionLabel="العودة إلى الحساب"
        title="تم تحديث رمز PIN"
      />
    );
  }

  return (
    <View style={styles.root}>
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
        showsVerticalScrollIndicator={false}
      >
        <ChangePinHeader onBackPress={handleHeaderBack} />
        <StepIndicator currentStep={state.step} />

        <SolidCard style={styles.pinCard}>
          <View style={styles.copy}>
            <AppText align="center" variant="sectionTitle">
              {activeMeta.title}
            </AppText>
            <AppText align="center" style={styles.description} tone="secondary" variant="supporting">
              {activeMeta.description}
            </AppText>
            {state.step === 'current' ? (
              <AppText align="center" tone="tertiary" variant="caption">
                لن يتم التحقق من رمز حقيقي في هذا النموذج التجريبي.
              </AppText>
            ) : null}
          </View>

          <View accessibilityLabel={accessibilityDigitCount}>
            <ChangePinKeypad
              disabled={keypadDisabled}
              onBackspacePress={handleBackspacePress}
              onConfirmPress={handleConfirmPress}
              onDigitPress={handleDigitPress}
              valueLength={activePin.length}
            />
          </View>

          {state.isSubmitting ? (
            <View accessibilityLiveRegion="polite" style={styles.loadingRow}>
              <ActivityIndicator color={colors.brand.calmGreen} size="small" />
              <AppText tone="secondary" variant="supporting">
                جاري تحديث رمز PIN
              </AppText>
            </View>
          ) : null}

          {state.errorMessage ? (
            <View accessibilityLiveRegion="polite" style={styles.errorCard}>
              <Ionicons color={colors.semantic.danger} name="alert-circle-outline" size={17} />
              <AppText style={styles.errorText} tone="danger" variant="caption">
                {state.errorMessage}
              </AppText>
            </View>
          ) : null}

          {state.step === 'confirm' ? (
            <AppButton disabled={keypadDisabled} onPress={handleInternalBack} variant="secondary">
              تغيير الرمز الجديد
            </AppButton>
          ) : state.step === 'new' ? (
            <AppButton disabled={keypadDisabled} onPress={handleInternalBack} variant="ghost">
              العودة إلى الرمز الحالي
            </AppButton>
          ) : null}
        </SolidCard>

        {state.step === 'new' ? <PinSecurityTips /> : null}
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="تحديث"
        description="سيتم تنفيذ التغيير محليًا فقط في هذا النموذج التجريبي."
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleSubmitConfirm}
        title="تحديث رمز PIN؟"
        tone="success"
        visible={showConfirmDialog}
      />

      <ConfirmationDialog
        cancelLabel="إلغاء التغيير"
        confirmLabel="متابعة التعديل"
        description="سيتم حذف الأرقام التي أدخلتها ولن يتم حفظ أي تغيير."
        onCancel={handleDiscard}
        onConfirm={() => setShowDiscardDialog(false)}
        title="إلغاء تغيير رمز PIN؟"
        tone="warning"
        visible={showDiscardDialog}
      />
    </View>
  );
}

function ChangePinKeypad({
  valueLength,
  disabled = false,
  onDigitPress,
  onBackspacePress,
  onConfirmPress,
}: {
  valueLength: number;
  disabled?: boolean;
  onDigitPress: (digit: string) => void;
  onBackspacePress: () => void;
  onConfirmPress: () => void;
}) {
  return (
    <View style={[styles.keypadRoot, disabled && styles.keypadDisabled]}>
      <View accessibilityLabel={`${valueLength} من 4 أرقام`} style={styles.keypadDots}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.keypadDot, index < valueLength && styles.keypadDotFilled]} />
        ))}
      </View>

      <View style={styles.keypadLtrContainer}>
        {keypadRows.map((row) => (
          <View key={row.join('-')} style={styles.keypadRow}>
            {row.map((digit) => (
              <KeypadNumberKey
                disabled={disabled}
                key={digit}
                label={digit}
                onPress={() => onDigitPress(digit)}
              />
            ))}
          </View>
        ))}
        <View style={styles.keypadRow}>
          <KeypadIconKey
            accessibilityLabel="تأكيد الرمز"
            disabled={disabled}
            iconName="checkmark-outline"
            onPress={onConfirmPress}
            tone="success"
          />
          <KeypadNumberKey disabled={disabled} label="0" onPress={() => onDigitPress('0')} />
          <KeypadIconKey
            accessibilityLabel="حذف رقم"
            disabled={disabled}
            iconName="backspace-outline"
            onPress={onBackspacePress}
          />
        </View>
      </View>
    </View>
  );
}

function KeypadNumberKey({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`رقم ${label}`}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.keypadKey, pressed && !disabled && styles.pressed]}
    >
      <NumericText style={styles.keypadKeyLabel}>{label}</NumericText>
    </Pressable>
  );
}

function KeypadIconKey({
  accessibilityLabel,
  iconName,
  disabled,
  tone = 'default',
  onPress,
}: {
  accessibilityLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  tone?: 'default' | 'success';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.keypadKey, pressed && !disabled && styles.pressed]}
    >
      <Ionicons color={tone === 'success' ? colors.brand.green : colors.text.muted} name={iconName} size={22} />
    </Pressable>
  );
}

function ChangePinHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="العودة إلى الأمان"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-back-outline"
        iconSize={22}
        onPress={onBackPress}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        تغيير رمز PIN
      </AppText>
    </View>
  );
}

function StepIndicator({ currentStep }: { currentStep: ChangePinStep }) {
  const currentIndex = stepMeta[currentStep].index;

  return (
    <SolidCard accessibilityLabel={`الخطوة ${currentIndex} من 3`} style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <AppText tone="secondary" variant="caption">
          التقدم
        </AppText>
        <View style={styles.stepCount}>
          <NumericText style={styles.stepCountNumber}>{currentIndex}</NumericText>
          <AppText tone="secondary" variant="caption">
            من
          </AppText>
          <NumericText style={styles.stepCountNumber}>3</NumericText>
        </View>
      </View>
      <View style={styles.stepPills}>
        {orderedSteps.map((step) => {
          const meta = stepMeta[step];
          const isComplete = meta.index < currentIndex;
          const isActive = step === currentStep;

          return (
            <View
              key={step}
              style={[styles.stepPill, isComplete && styles.completeStepPill, isActive && styles.activeStepPill]}
            >
              <AppText align="center" tone={isComplete || isActive ? 'success' : 'tertiary'} variant="caption">
                {meta.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </SolidCard>
  );
}

function PinSecurityTips() {
  return (
    <SolidCard style={styles.tipsCard}>
      <View style={styles.tipsHeader}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={20} />
        <AppText variant="cardTitle">اختر رمزًا أكثر أمانًا</AppText>
      </View>
      <View style={styles.tipsList}>
        {['لا تستخدم أرقامًا متطابقة', 'تجنب التسلسلات مثل 1234', 'لا تستخدم تاريخ ميلاد أو رقمًا معروفًا'].map(
          (tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons color={colors.brand.mediumGreen} name="checkmark-circle-outline" size={16} />
              <AppText style={styles.tipText} tone="secondary" variant="caption">
                {tip}
              </AppText>
            </View>
          ),
        )}
      </View>
    </SolidCard>
  );
}

function getActivePin(state: ChangePinState) {
  if (state.step === 'current') {
    return state.currentPin;
  }

  if (state.step === 'new') {
    return state.newPin;
  }

  return state.confirmPin;
}

function appendDigit(state: ChangePinState, digit: string): ChangePinState {
  if (state.step === 'current') {
    return { ...state, currentPin: `${state.currentPin}${digit}`, errorMessage: null };
  }

  if (state.step === 'new') {
    return { ...state, newPin: `${state.newPin}${digit}`, errorMessage: null };
  }

  return { ...state, confirmPin: `${state.confirmPin}${digit}`, errorMessage: null };
}

function removeLastDigit(state: ChangePinState): ChangePinState {
  if (state.step === 'current') {
    return { ...state, currentPin: state.currentPin.slice(0, -1), errorMessage: null };
  }

  if (state.step === 'new') {
    return { ...state, newPin: state.newPin.slice(0, -1), errorMessage: null };
  }

  return { ...state, confirmPin: state.confirmPin.slice(0, -1), errorMessage: null };
}

function validateNewPin(newPin: string, currentPin: string) {
  if (newPin === currentPin) {
    return 'يجب أن يختلف رمز PIN الجديد عن الرمز الحالي';
  }

  if (/^(\d)\1{3}$/.test(newPin)) {
    return 'تجنب استخدام أربعة أرقام متطابقة';
  }

  if (isObviousSequence(newPin)) {
    return 'تجنب استخدام تسلسل رقمي سهل التخمين';
  }

  return null;
}

function isObviousSequence(pin: string) {
  const ascending = ['0123', '1234', '2345', '3456', '4567', '5678', '6789'];
  const descending = ['9876', '8765', '7654', '6543', '5432', '4321', '3210'];

  return ascending.includes(pin) || descending.includes(pin);
}

function getDigitCountLabel(length: number) {
  const labels = [
    'لم يتم إدخال أي رقم',
    'تم إدخال رقم واحد من أربعة',
    'تم إدخال رقمين من أربعة',
    'تم إدخال ثلاثة أرقام من أربعة',
    'تم إدخال أربعة أرقام من أربعة',
  ];

  return labels[length] ?? labels[0];
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: Platform.select({ ios: spacing.md, default: spacing.lg }),
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
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
  headerTitle: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  stepCard: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  stepHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  stepCount: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepCountNumber: {
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  stepPills: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  stepPill: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  activeStepPill: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.48)',
  },
  completeStepPill: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  pinCard: {
    gap: Platform.select({ ios: spacing.lg, default: spacing.xl }),
  },
  keypadRoot: {
    gap: Platform.select({ ios: 0, default: spacing.xl }),
    paddingBottom: Platform.select({ ios: spacing.lg, default: spacing.xxl }),
    paddingTop: Platform.select({ ios: spacing.md, default: spacing.md }),
  },
  keypadDisabled: {
    opacity: 0.58,
  },
  keypadDots: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    writingDirection: 'ltr',
  },
  keypadDot: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 14,
    width: 14,
  },
  keypadDotFilled: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.green,
    boxShadow: '0 0 16px rgba(79,138,91,0.28)',
  },
  keypadLtrContainer: {
    alignSelf: 'center',
    direction: 'ltr',
    gap: 18,
    marginTop: 32,
    paddingHorizontal: 24,
    width: '91%',
  },
  keypadRow: {
    direction: 'ltr',
    flexDirection: 'row',
    gap: 18,
  },
  keypadKey: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
  },
  keypadKeyLabel: {
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 28,
  },
  copy: {
    alignItems: 'flex-end',
    gap: Platform.select({ ios: spacing.md, default: spacing.sm }),
  },
  description: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  loadingRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.md,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.26)',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  tipsCard: {
    backgroundColor: 'rgba(17,26,23,0.94)',
    gap: spacing.md,
  },
  tipsHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  tipText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
