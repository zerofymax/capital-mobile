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
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, StateScreen } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type OpeningBalancesFormState = {
  availableCash: string;
  receivables: string;
  outstandingCommitments: string;
  currentDebt: string;
  startDate: string;
};

type OpeningBalancesErrors = Partial<Record<keyof OpeningBalancesFormState, string>>;

type AmountFieldKey = Exclude<keyof OpeningBalancesFormState, 'startDate'>;

const initialOpeningBalances: OpeningBalancesFormState = {
  availableCash: '45,000',
  receivables: '12,300',
  outstandingCommitments: '6,200',
  currentDebt: '0',
  startDate: '1 يناير 2026',
};

const startDateOptions = ['1 يناير 2026', '1 فبراير 2026', '1 مارس 2026', '1 أبريل 2026', '1 يوليو 2026'] as const;

const amountFields: {
  key: AmountFieldKey;
  label: string;
  description?: string;
  tone?: 'primary' | 'danger';
}[] = [
  { key: 'availableCash', label: 'النقد المتاح' },
  {
    key: 'receivables',
    label: 'مستحقات على العملاء',
    description: 'مبالغ مستحقة لك ولم يتم تحصيلها بعد',
  },
  {
    key: 'outstandingCommitments',
    label: 'التزامات مستحقة',
    description: 'مبالغ واجبة السداد ولم تُدفع بعد',
    tone: 'danger',
  },
  {
    key: 'currentDebt',
    label: 'الدين الحالي',
    description: 'الرصيد القائم للتمويل أو القروض',
  },
];

export function OpeningBalancesScreen() {
  const insets = useSafeAreaInsets();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [baseline, setBaseline] = useState<OpeningBalancesFormState>(initialOpeningBalances);
  const [formState, setFormState] = useState<OpeningBalancesFormState>(initialOpeningBalances);
  const [errors, setErrors] = useState<OpeningBalancesErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const dirty = useMemo(() => !areOpeningBalanceStatesEqual(formState, baseline), [baseline, formState]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showDatePicker) {
        setShowDatePicker(false);
        return true;
      }

      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty && !saved) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, saved, showDatePicker, showUnsavedDialog]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function handleBackPress() {
    if (dirty && !saved) {
      setShowUnsavedDialog(true);
      return;
    }

    goBack();
  }

  function updateField(key: keyof OpeningBalancesFormState, value: string) {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleAmountChange(key: AmountFieldKey, value: string) {
    updateField(key, normalizeAmountInput(value));
  }

  function validateForm() {
    const nextErrors: OpeningBalancesErrors = {};

    amountFields.forEach((field) => {
      const value = formState[field.key];

      if (field.key === 'availableCash' && !value.trim()) {
        nextErrors.availableCash = 'أدخل قيمة النقد المتاح';
        return;
      }

      if (!amountIsValid(value)) {
        nextErrors[field.key] = 'أدخل قيمة صحيحة';
      }
    });

    if (!formState.startDate) {
      nextErrors.startDate = 'اختر تاريخ البداية';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSavePress() {
    Keyboard.dismiss();

    if (saving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    saveTimerRef.current = setTimeout(() => {
      setBaseline(formState);
      setSaving(false);
      setSaved(true);
    }, 550);
  }

  function handleDatePress() {
    Keyboard.dismiss();
    setShowDatePicker(true);
  }

  function selectStartDate(value: string) {
    updateField('startDate', value);
    setShowDatePicker(false);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBack();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  if (saved) {
    return (
      <StateScreen
        description="سيتم استخدام القيم الجديدة في الحسابات المستقبلية داخل النموذج التجريبي."
        iconName="checkmark-outline"
        onPrimaryAction={() => router.replace(routes.account)}
        primaryActionLabel="العودة إلى الحساب"
        title="تم تحديث الأرصدة الابتدائية"
      />
    );
  }

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
        <OpeningBalancesHeader onBackPress={handleBackPress} />
        <WarningCard />

        <View style={styles.amountList}>
          {amountFields.map((field) => (
            <OpeningAmountInput
              description={field.description}
              error={errors[field.key]}
              key={field.key}
              label={field.label}
              onChangeText={(value) => handleAmountChange(field.key, value)}
              tone={field.tone}
              value={formState[field.key]}
            />
          ))}
        </View>

        <DateSelectField
          error={errors.startDate}
          onPress={handleDatePress}
          value={formState.startDate}
        />

        <CalculationNote />

        <View style={styles.actions}>
          <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
            {saving ? 'جاري التحديث' : 'تحديث الأرصدة'}
          </AppButton>
        </View>
      </ScrollView>

      <DatePickerSheet
        onClose={() => setShowDatePicker(false)}
        onSelect={selectStartDate}
        selectedValue={formState.startDate}
        visible={showDatePicker}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، لن يتم حفظ تعديلات الأرصدة الابتدائية."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </KeyboardAvoidingView>
  );
}

function OpeningBalancesHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الحساب"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        الأرصدة الابتدائية
      </AppText>
    </View>
  );
}

function WarningCard() {
  return (
    <SolidCard style={styles.warningCard}>
      <Ionicons color={colors.semantic.warning} name="warning-outline" size={18} />
      <AppText style={styles.cardText} tone="warning" variant="supporting">
        إدخال أرصدة غير صحيحة سيؤثر على التقارير والمؤشرات المستقبلية. يمكنك تعديلها لاحقًا، لكن لن يتم تغيير التقارير السابقة تلقائيًا.
      </AppText>
    </SolidCard>
  );
}

function OpeningAmountInput({
  label,
  description,
  value,
  error,
  tone = 'primary',
  onChangeText,
}: {
  label: string;
  description?: string;
  value: string;
  error?: string;
  tone?: 'primary' | 'danger';
  onChangeText: (value: string) => void;
}) {
  return (
    <SolidCard style={[styles.amountCard, error && styles.inputCardError]}>
      <View style={styles.amountHeader}>
        <View style={styles.amountCopy}>
          <AppText style={styles.amountTitle} variant="cardTitle">{label}</AppText>
          {description ? (
            <AppText style={styles.description} tone="secondary" variant="caption">
              {description}
            </AppText>
          ) : null}
        </View>
        <View style={styles.amountIcon}>
          <Ionicons color={tone === 'danger' ? colors.semantic.danger : colors.brand.calmGreen} name="wallet-outline" size={18} />
        </View>
      </View>
      <View style={styles.amountLine}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="number-pad"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.amountInput, tone === 'danger' && styles.dangerAmountInput]}
          value={value}
        />
        <AppText style={styles.currency} variant="sectionTitle">
          ر.س
        </AppText>
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </SolidCard>
  );
}

function DateSelectField({ value, error, onPress }: { value: string; error?: string; onPress: () => void }) {
  return (
    <View style={styles.fieldGroup}>
      <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
        تاريخ البداية
      </AppText>
      <Pressable
        accessibilityLabel={`تاريخ البداية ${value}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.dateField, error && styles.inputCardError, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
        <AppText style={styles.dateValue} variant="body">
          {value}
        </AppText>
        <Ionicons color={colors.brand.link} name="calendar-outline" size={19} />
      </Pressable>
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function CalculationNote() {
  return (
    <SolidCard style={styles.noteCard}>
      <Ionicons color={colors.brand.calmGreen} name="calculator-outline" size={18} />
      <AppText style={styles.cardText} tone="secondary" variant="supporting">
        تُستخدم هذه الأرصدة كنقطة انطلاق لحساب صافي الربح، التدفق النقدي، والالتزامات في جميع تقاريرك.
      </AppText>
    </SolidCard>
  );
}

function DatePickerSheet({
  visible,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.pickerRoot}>
        <Pressable accessibilityLabel="إغلاق قائمة التاريخ" onPress={onClose} style={styles.pickerBackdrop} />
        <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
          <View style={styles.pickerHandle} />
          <View style={styles.pickerHeader}>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <AppText tone="link" variant="supporting">
                إلغاء
              </AppText>
              </Pressable>
            <AppText style={styles.pickerTitle} variant="cardTitle">تاريخ البداية</AppText>
          </View>
          <View style={styles.pickerOptions}>
            {startDateOptions.map((option) => {
              const selected = option === selectedValue;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option}
                  onPress={() => onSelect(option)}
                  style={({ pressed }) => [
                    styles.pickerOption,
                    selected && styles.pickerOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                  <AppText style={styles.pickerOptionText} tone={selected ? 'primary' : 'secondary'} variant="body">
                    {option}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function amountToNumber(value: string) {
  return Number(value.replace(/,/g, ''));
}

function amountIsValid(value: string) {
  const normalized = value.trim();
  const amount = amountToNumber(normalized);

  return normalized.length > 0 && Number.isFinite(amount) && amount >= 0;
}

function areOpeningBalanceStatesEqual(left: OpeningBalancesFormState, right: OpeningBalancesFormState) {
  return (
    left.availableCash === right.availableCash &&
    left.receivables === right.receivables &&
    left.outstandingCommitments === right.outstandingCommitments &&
    left.currentDebt === right.currentDebt &&
    left.startDate === right.startDate
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
    writingDirection: 'rtl',
    width: '100%',
  },
  warningCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noteCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.18)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  cardText: {
    flex: 1,
    lineHeight: 21,
  },
  amountList: {
    gap: spacing.md,
  },
  amountCard: {
    gap: spacing.md,
  },
  inputCardError: {
    borderColor: colors.semantic.danger,
  },
  amountHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  amountIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.18)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  amountCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  amountTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  description: {
    lineHeight: 18,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  amountLine: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 32,
    fontVariant: ['tabular-nums'],
    lineHeight: 40,
    minHeight: 48,
    minWidth: 0,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  dangerAmountInput: {
    color: colors.semantic.danger,
  },
  currency: {
    color: colors.brand.link,
    paddingBottom: spacing.sm,
    writingDirection: 'rtl',
  },
  fieldGroup: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
  },
  fieldLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  dateValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.md,
  },
  pickerRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  pickerBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pickerSheet: {
    backgroundColor: 'rgba(17,20,25,0.98)',
    borderColor: colors.glass.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: '72%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  pickerHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    height: 4,
    width: 42,
  },
  pickerHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  pickerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pickerOptions: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.56)',
  },
  pickerOptionText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
