import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { currencyOptions } from '@/screens/onboarding/onboarding-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import {
  addFinancialAccount,
  createFinancialAccountFormState,
  financialAccountStatusOptions,
  financialAccountTypes,
  getFinancialAccount,
  normalizeLastFourInput,
  normalizeMoneyInput,
  parseMoneyInput,
  updateFinancialAccount,
  useFinancialAccounts,
  type CurrencyOption,
  type FinancialAccountFormState,
  type FinancialAccountType,
} from './financial-accounts-data';

type FinancialAccountErrors = Partial<Record<keyof FinancialAccountFormState, string>>;

const addSuccessMessage = 'تمت إضافة الحساب في النسخة التجريبية.';
const updateSuccessMessage = 'تم تحديث الحساب في النسخة التجريبية.';
const androidPhysicalLtrRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row' as const }
  : {};
const androidPhysicalRtlRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row-reverse' as const }
  : {};
const androidLtrDirection = Platform.OS === 'android' ? { direction: 'ltr' as const } : {};
const androidHeaderSlot = Platform.OS === 'android' ? { width: 0 } : {};

export function FinancialAccountFormScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ accountId?: string }>();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useFinancialAccounts();
  const initialAccount = getFinancialAccount(params.accountId);
  const [workingAccountId, setWorkingAccountId] = useState(params.accountId);
  const [baseline, setBaseline] = useState<FinancialAccountFormState>(() => createFinancialAccountFormState(initialAccount));
  const [formState, setFormState] = useState<FinancialAccountFormState>(() => createFinancialAccountFormState(initialAccount));
  const [errors, setErrors] = useState<FinancialAccountErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const isEditing = Boolean(workingAccountId);
  const dirty = useMemo(() => !areFormStatesEqual(formState, baseline), [baseline, formState]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, showUnsavedDialog]);

  function updateFormState(nextState: Partial<FinancialAccountFormState>) {
    setNotice(null);
    setErrors((current) => {
      const nextErrors = { ...current };
      (Object.keys(nextState) as (keyof FinancialAccountFormState)[]).forEach((key) => {
        nextErrors[key] = undefined;
      });
      return nextErrors;
    });
    setFormState((current) => ({ ...current, ...nextState }));
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.financialAccounts);
  }

  function handleBackPress() {
    if (dirty) {
      setShowUnsavedDialog(true);
      return;
    }

    goBack();
  }

  function validateForm() {
    const nextErrors: FinancialAccountErrors = {};

    if (!formState.name.trim()) {
      nextErrors.name = 'أدخل اسم الحساب';
    }

    if (!formState.type) {
      nextErrors.type = 'اختر نوع الحساب';
    }

    if (!formState.currency) {
      nextErrors.currency = 'اختر العملة';
    }

    if (formState.lastFour.length > 4) {
      nextErrors.lastFour = 'أدخل أربعة أرقام كحد أقصى';
    }

    if (parseMoneyInput(formState.openingBalance) === null) {
      nextErrors.openingBalance = 'أدخل قيمة مالية صحيحة';
    }

    if (formState.type === 'credit-card' && formState.creditLimit.trim() && parseMoneyInput(formState.creditLimit) === null) {
      nextErrors.creditLimit = 'أدخل حدًا ائتمانيًا صحيحًا';
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
      const nextFormState: FinancialAccountFormState = {
        ...formState,
        name: formState.name.trim(),
        institution: formState.institution.trim(),
        lastFour: formState.lastFour.trim(),
        openingBalance: formState.openingBalance.trim() || '0',
        creditLimit: formState.creditLimit.trim(),
      };

      if (workingAccountId) {
        updateFinancialAccount(workingAccountId, nextFormState);
        setNotice(updateSuccessMessage);
      } else {
        const addedAccount = addFinancialAccount(nextFormState);
        setWorkingAccountId(addedAccount.id);
        setNotice(addSuccessMessage);
      }

      setBaseline(nextFormState);
      setFormState(nextFormState);
      setSaving(false);
    }, 350);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBack();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboardRoot}
      >
        <Header isEditing={isEditing} onBackPress={handleBackPress} />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xxl) },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {notice ? <NoticeCard message={notice} /> : null}

          <SolidCard style={styles.infoCard}>
            <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
            <AppText style={styles.infoText} tone="success" variant="supporting">
              هذا نموذج محلي تجريبي. لا يتم طلب IBAN أو رقم حساب كامل ولا يوجد اتصال بنكي.
            </AppText>
          </SolidCard>

          <View style={styles.formList}>
            <AccountFormField
              accessibilityLabel="اسم الحساب"
              error={errors.name}
              label="اسم الحساب"
              onChangeText={(name) => updateFormState({ name })}
              placeholder="الحساب التشغيلي"
              returnKeyType="next"
              value={formState.name}
            />

            <FinancialSelectField
              error={errors.type}
              label="نوع الحساب"
              onSelect={(type) => updateFormState({ type: type as FinancialAccountType })}
              options={financialAccountTypes.map((option) => ({ label: option.label, value: option.id }))}
              value={formState.type}
              valueLabel={financialAccountTypes.find((option) => option.id === formState.type)?.label ?? 'اختر نوع الحساب'}
            />

            <AccountFormField
              accessibilityLabel="البنك أو الجهة"
              label="البنك أو الجهة (اختياري)"
              onChangeText={(institution) => updateFormState({ institution })}
              placeholder="بنك الراجحي"
              returnKeyType="next"
              value={formState.institution}
            />

            <FinancialSelectField
              error={errors.currency}
              label="العملة"
              onSelect={(currency) => updateFormState({ currency: currency as CurrencyOption })}
              options={currencyOptions.map((currency) => ({ label: currency, value: currency }))}
              value={formState.currency}
              valueLabel={formState.currency || 'اختر العملة'}
            />

            <AccountFormField
              accessibilityLabel="آخر أربعة أرقام"
              error={errors.lastFour}
              keyboardType="number-pad"
              label="آخر أربعة أرقام (اختياري)"
              maxLength={4}
              onChangeText={(lastFour) => updateFormState({ lastFour: normalizeLastFourInput(lastFour) })}
              placeholder="4281"
              returnKeyType="next"
              style={styles.ltrInput}
              value={formState.lastFour}
            />

            <MoneyField
              error={errors.openingBalance}
              label="الرصيد الافتتاحي"
              onChangeText={(openingBalance) => updateFormState({ openingBalance: normalizeMoneyInput(openingBalance) })}
              value={formState.openingBalance}
            />

            {formState.type === 'credit-card' ? (
              <MoneyField
                error={errors.creditLimit}
                label="الحد الائتماني (اختياري)"
                onChangeText={(creditLimit) => updateFormState({ creditLimit: normalizeMoneyInput(creditLimit) })}
                value={formState.creditLimit}
              />
            ) : null}
          </View>

          <SolidCard style={styles.settingsCard}>
            <ToggleRow
              active={formState.isDefault}
              description="سيتم استخدامه كاختيار أول في مراحل الربط القادمة."
              disabled={!formState.status || formState.status === 'inactive'}
              label="حساب افتراضي"
              onPress={() => updateFormState({ isDefault: !formState.isDefault })}
            />
            <View style={styles.statusSection}>
              <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
                حالة الحساب
              </AppText>
              <View style={styles.segmented}>
                {financialAccountStatusOptions.map((option) => {
                  const selected = option.id === formState.status;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={option.id}
                      onPress={() =>
                        updateFormState({
                          status: option.id,
                          isDefault: option.id === 'inactive' ? false : formState.isDefault,
                        })
                      }
                      style={({ pressed }) => [
                        styles.segmentButton,
                        selected && styles.segmentButtonSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SolidCard>

          <View style={styles.actions}>
            <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
              {saving ? 'جاري الحفظ' : isEditing ? 'حفظ التغييرات' : 'إضافة الحساب'}
            </AppButton>
            <AppButton onPress={handleBackPress} variant="ghost">
              إلغاء
            </AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، لن يتم حفظ تعديلات الحساب المالي."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </SafeAreaView>
  );
}

function Header({ isEditing, onBackPress }: { isEditing: boolean; onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الحسابات المالية"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        {Platform.OS === 'android' ? (
          <Feather color={colors.text.muted} name="chevron-left" size={22} />
        ) : (
          <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
        )}
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText style={styles.headerText} variant="screenTitle">
          {isEditing ? 'تعديل الحساب' : 'إضافة حساب'}
        </AppText>
        <AppText style={styles.headerText} tone="secondary" variant="supporting">
          {isEditing ? 'حدّث بيانات الحساب التجريبية.' : 'أضف حسابًا محليًا لإدارة الأرصدة التجريبية.'}
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function AccountFormField({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.accountField}>
      <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={colors.text.tertiary}
        style={[styles.accountInput, error && styles.inputError, style]}
      />
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function MoneyField({
  label,
  value,
  error,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.moneyFieldWrap}>
      <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <View style={[styles.moneyField, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numbers-and-punctuation"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.moneyInput}
          value={value}
        />
        <AppText style={styles.currencyLabel} variant="caption">
          ر.س
        </AppText>
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function FinancialSelectField({
  label,
  value,
  valueLabel,
  options,
  error,
  onSelect,
}: {
  label: string;
  value: string;
  valueLabel: string;
  options: readonly { label: string; value: string }[];
  error?: string;
  onSelect: (value: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  function openPicker() {
    Keyboard.dismiss();
    setVisible(true);
  }

  function closePicker() {
    setVisible(false);
  }

  function selectOption(nextValue: string) {
    onSelect(nextValue);
    setVisible(false);
  }

  return (
    <View style={styles.selectWrap}>
      <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.selectField, error && styles.inputError, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.tertiary} name="chevron-down" size={16} />
        <AppText align="right" numberOfLines={1} style={styles.selectValue} variant="body">
          {valueLabel}
        </AppText>
      </Pressable>
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}

      <Modal animationType="fade" onRequestClose={closePicker} statusBarTranslucent transparent visible={visible}>
        <View style={styles.pickerRoot}>
          <Pressable accessibilityLabel="إغلاق القائمة" onPress={closePicker} style={styles.pickerBackdrop} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <Pressable accessibilityRole="button" hitSlop={10} onPress={closePicker}>
                <AppText tone="link" variant="supporting">
                  إلغاء
                </AppText>
              </Pressable>
              <AppText variant="cardTitle">{label}</AppText>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.pickerOptionsContent,
                { paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxl) },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option.value}
                    onPress={() => selectOption(option.value)}
                    style={({ pressed }) => [
                      styles.pickerOption,
                      selected && styles.pickerOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                    <AppText
                      align="right"
                      numberOfLines={2}
                      style={styles.pickerOptionText}
                      tone={selected ? 'primary' : 'secondary'}
                      variant="body"
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  active,
  disabled,
  onPress,
}: {
  label: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.toggleRow, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <View style={[styles.toggleTrack, active && styles.toggleTrackActive]}>
        <View style={[styles.toggleThumb, active && styles.toggleThumbActive]} />
      </View>
      <View style={styles.toggleCopy}>
        <AppText style={styles.toggleText} variant="body">{label}</AppText>
        <AppText style={styles.toggleText} tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

function NoticeCard({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.noticeCard}>
      <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.infoText} tone="success" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function areFormStatesEqual(left: FinancialAccountFormState, right: FinancialAccountFormState) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    ...androidPhysicalLtrRow,
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
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 40,
    width: 40,
    ...androidHeaderSlot,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    ...androidPhysicalLtrRow,
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    ...androidPhysicalLtrRow,
  },
  infoText: {
    flex: 1,
    lineHeight: 21,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  formList: {
    gap: spacing.lg,
  },
  accountField: {
    alignItems: 'stretch',
    gap: spacing.sm,
    width: '100%',
    ...androidLtrDirection,
  },
  fieldLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  accountInput: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrInput: {
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  moneyFieldWrap: {
    gap: spacing.sm,
    ...androidLtrDirection,
  },
  moneyField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    ...androidPhysicalLtrRow,
  },
  moneyInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    fontVariant: ['tabular-nums'],
    minWidth: 0,
    paddingVertical: 0,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  currencyLabel: {
    color: colors.brand.calmGreen,
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  selectWrap: {
    gap: spacing.sm,
    ...androidLtrDirection,
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    ...androidPhysicalLtrRow,
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  settingsCard: {
    gap: spacing.lg,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    ...androidPhysicalLtrRow,
  },
  toggleCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  toggleText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  toggleTrack: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 52,
  },
  toggleTrackActive: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.calmGreen,
  },
  toggleThumb: {
    backgroundColor: colors.text.primary,
    borderRadius: radii.pill,
    height: 22,
    width: 22,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  statusSection: {
    gap: spacing.sm,
    ...androidLtrDirection,
  },
  segmented: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    ...androidPhysicalRtlRow,
  },
  segmentButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.button,
    borderWidth: 1,
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  segmentButtonSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.56)',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  pickerOptionsContent: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
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
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
