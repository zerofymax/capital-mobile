import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
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

import { AuthPrototypeNotice } from '@/components/auth';
import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const noCommitmentsLabel = 'لا توجد التزامات متكررة';
const helperText = 'اختيارها يلغي بقية الخيارات المتاحة ويجعل حقلي المبلغ والتاريخ غير مطلوبين';
const invalidSelectionMessage = 'اختر التزاماتك المتكررة أو حدّد أنه لا توجد التزامات';
const invalidAmountMessage = 'أدخل قيمة صحيحة';

const commitmentOptions = [
  'اشتراكات برامج',
  'رواتب شهرية',
  'إيجار',
  'أقساط أو تمويل',
  'استضافة',
  'عقود خدمات',
  'أخرى',
] as const;

const dueDateOptions = [
  'أغسطس 2026',
  'سبتمبر 2026',
  'أكتوبر 2026',
  'نوفمبر 2026',
  'ديسمبر 2026',
  'يناير 2027',
] as const;

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function isValidOptionalAmount(value: string) {
  if (!value.trim()) {
    return true;
  }

  const normalized = value.replace(/,/g, '');

  return normalized.length > 0 && /^\d+$/.test(normalized) && Number(normalized) >= 0;
}

export function FinancialSetupRecurringCommitmentsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>(['اشتراكات برامج', 'إيجار']);
  const [noCommitments, setNoCommitments] = useState(false);
  const [monthlyAmount, setMonthlyAmount] = useState('6,200');
  const [dueDate, setDueDate] = useState('أغسطس 2026');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fieldsMuted = noCommitments;

  function toggleCommitment(commitment: string) {
    setNotice(null);
    setSelectionError(null);
    setSelectedCommitments((currentCommitments) => {
      const nextCommitments = currentCommitments.includes(commitment)
        ? currentCommitments.filter((item) => item !== commitment)
        : [...currentCommitments, commitment];

      if (nextCommitments.length > 0) {
        setNoCommitments(false);
      }

      return nextCommitments;
    });
  }

  function toggleNoCommitments() {
    setNotice(null);
    setSelectionError(null);
    setAmountError(null);
    setNoCommitments((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        setSelectedCommitments([]);
      }

      return nextValue;
    });
  }

  function updateMonthlyAmount(value: string) {
    setNotice(null);
    setAmountError(null);
    setMonthlyAmount(normalizeAmountInput(value));
  }

  function handleContinue() {
    const hasCommitmentSelection = noCommitments || selectedCommitments.length > 0;
    const amountIsValid = isValidOptionalAmount(monthlyAmount);

    setSelectionError(hasCommitmentSelection ? null : invalidSelectionMessage);
    setAmountError(amountIsValid ? null : invalidAmountMessage);

    if (!hasCommitmentSelection || !amountIsValid) {
      setNotice(null);
      return;
    }

    router.push(routes.financialSetupFinancialGoal);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.48, 1]}
        start={{ x: 0.22, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
              paddingTop: Math.max(insets.top + spacing.xl, spacing.safeTop),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FinancialSetupProgressHeader
            currentStep={7}
            onBack={() => router.push(routes.financialSetupExpenseCategories)}
            totalSteps={10}
          />

          <View style={styles.titleBlock}>
            <AppText style={styles.rtlText} variant="screenTitle">هل لديك التزامات متكررة؟</AppText>
          </View>

          <View style={styles.chipSection}>
            <View style={styles.chipGrid}>
              {commitmentOptions.map((commitment) => {
                const selected = selectedCommitments.includes(commitment);

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={commitment}
                    onPress={() => toggleCommitment(commitment)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
                      {commitment}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            {selectionError ? (
              <AppText style={styles.rtlText} tone="danger" variant="caption">
                {selectionError}
              </AppText>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: noCommitments }}
            onPress={toggleNoCommitments}
            style={({ pressed }) => [
              styles.noCommitmentsCard,
              noCommitments && styles.noCommitmentsCardSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.noCommitmentsCopy}>
              <AppText style={styles.rtlText} tone={noCommitments ? 'primary' : 'secondary'} variant="cardTitle">
                {noCommitmentsLabel}
              </AppText>
              <AppText style={styles.rtlText} tone="tertiary" variant="supporting">
                {helperText}
              </AppText>
            </View>
            <View style={[styles.radioIndicator, noCommitments && styles.radioIndicatorSelected]}>
              {noCommitments ? <Ionicons color={colors.text.primary} name="checkmark" size={14} /> : null}
            </View>
          </Pressable>

          <View style={[styles.formSection, fieldsMuted && styles.formSectionMuted]}>
            <CommitmentAmountField
              disabled={fieldsMuted}
              error={amountError}
              onChangeText={updateMonthlyAmount}
              value={monthlyAmount}
            />
            <DueDateField disabled={fieldsMuted} onSelect={setDueDate} options={dueDateOptions} value={dueDate} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.actionArea}>
            {notice ? <AuthPrototypeNotice message={notice} /> : null}
            <AppButton onPress={handleContinue}>متابعة</AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type CommitmentAmountFieldProps = {
  value: string;
  error: string | null;
  disabled: boolean;
  onChangeText: (value: string) => void;
};

function CommitmentAmountField({ value, error, disabled, onChangeText }: CommitmentAmountFieldProps) {
  return (
    <View style={[styles.inputCard, disabled && styles.inputCardDisabled, error && styles.inputCardError]}>
      <AppText style={styles.rtlText} tone="secondary" variant="supporting">
        إجمالي تقريبي شهري (اختياري)
      </AppText>
      <View style={styles.amountRow}>
        <TextInput
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.amountInput, disabled && styles.inputTextDisabled]}
          value={value}
        />
        <AppText style={styles.currencySuffix} tone={disabled ? 'tertiary' : 'primary'} variant="cardTitle">
          ر.س
        </AppText>
      </View>
      {error ? (
        <AppText style={styles.rtlText} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type DueDateFieldProps = {
  value: string;
  options: readonly string[];
  disabled: boolean;
  onSelect: (value: string) => void;
};

function DueDateField({ value, options, disabled, onSelect }: DueDateFieldProps) {
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  function openPicker() {
    if (disabled) {
      return;
    }

    Keyboard.dismiss();
    setPickerVisible(true);
  }

  function closePicker() {
    setPickerVisible(false);
  }

  function selectOption(option: string) {
    onSelect(option);
    setPickerVisible(false);
  }

  return (
    <View style={[styles.inputCard, disabled && styles.inputCardDisabled]}>
      <AppText style={styles.rtlText} tone="secondary" variant="supporting">
        تاريخ أقرب استحقاق (اختياري)
      </AppText>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={openPicker}
        style={({ pressed }) => [styles.dateField, pressed && !disabled && styles.pressed]}
      >
        <Ionicons color={disabled ? colors.text.disabled : colors.text.tertiary} name="chevron-down" size={16} />
        <AppText align="right" style={styles.dateValue} tone={disabled ? 'tertiary' : 'primary'} variant="body">
          {value}
        </AppText>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={closePicker}
        statusBarTranslucent
        transparent
        visible={pickerVisible}
      >
        <View style={styles.pickerModalRoot}>
          <Pressable accessibilityLabel="إغلاق القائمة" onPress={closePicker} style={styles.pickerBackdrop} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <Pressable accessibilityRole="button" hitSlop={10} onPress={closePicker}>
                <AppText tone="link" variant="supporting">
                  إلغاء
                </AppText>
              </Pressable>
              <AppText style={styles.pickerTitle} variant="cardTitle">تاريخ أقرب استحقاق</AppText>
            </View>
            <View style={styles.pickerOptions}>
              {options.map((option) => {
                const selected = option === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    onPress={() => selectOption(option)}
                    style={({ pressed }) => [
                      styles.pickerOption,
                      selected && styles.pickerOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.checkSlot}>
                      {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                    </View>
                    <AppText align="right" style={styles.pickerOptionText} tone={selected ? 'primary' : 'secondary'} variant="body">
                      {option}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  titleBlock: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
    width: '100%',
  },
  chipSection: {
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
  },
  chipGrid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  noCommitmentsCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginTop: spacing.xxxl,
    padding: spacing.lg,
  },
  noCommitmentsCardSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  noCommitmentsCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  radioIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioIndicatorSelected: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.calmGreen,
  },
  formSection: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  formSectionMuted: {
    opacity: 0.58,
  },
  inputCard: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  inputCardDisabled: {
    backgroundColor: 'rgba(255,255,255,0.028)',
  },
  inputCardError: {
    borderColor: colors.semantic.danger,
  },
  amountRow: {
    alignItems: 'baseline',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  currencySuffix: {
    writingDirection: 'rtl',
  },
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 36,
    minHeight: 44,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  inputTextDisabled: {
    color: colors.text.disabled,
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  dateValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pickerModalRoot: {
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
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pickerTitle: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  checkSlot: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxxl,
  },
  actionArea: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
