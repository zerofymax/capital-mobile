import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryPicker } from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { NumericText, directionSafeText } from '@/utils/rtl';

type SubscriptionFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
type SubscriptionUsage = 'essential' | 'useful' | 'limited';

type SubscriptionFormState = {
  name: string;
  provider: string;
  amount: string;
  currency: string;
  frequency: SubscriptionFrequency;
  usage: SubscriptionUsage;
  renewalReminder: string;
  nextRenewalDate: string;
};

type SubscriptionFormErrors = Partial<
  Record<
    keyof Pick<
      SubscriptionFormState,
      'name' | 'provider' | 'amount' | 'currency' | 'frequency' | 'usage' | 'renewalReminder'
    >,
    string
  >
>;

const currencyOptions = ['ر.س', 'د.إ', 'د.ك', 'ر.ق', 'د.ب', 'ر.ع', 'USD'] as const;

const frequencyOptions: { id: SubscriptionFrequency; label: string; summaryLabel: string; multiplier: number }[] = [
  { id: 'monthly', label: 'شهري', summaryLabel: 'شهريًا', multiplier: 12 },
  { id: 'quarterly', label: 'ربع سنوي', summaryLabel: 'ربع سنوي', multiplier: 4 },
  { id: 'semiannual', label: 'نصف سنوي', summaryLabel: 'نصف سنوي', multiplier: 2 },
  { id: 'annual', label: 'سنوي', summaryLabel: 'سنويًا', multiplier: 1 },
];

const usageOptions: { id: SubscriptionUsage; label: string }[] = [
  { id: 'essential', label: 'أساسي' },
  { id: 'useful', label: 'مفيد' },
  { id: 'limited', label: 'محدود الاستخدام' },
];

const reminderOptions = ['بدون تنبيه', 'قبل يوم', 'قبل 3 أيام', 'قبل 7 أيام', 'قبل 14 يومًا'] as const;

const renewalDateOptions = [
  '3 أغسطس 2026',
  '15 أغسطس 2026',
  '1 سبتمبر 2026',
  '15 سبتمبر 2026',
  '1 أكتوبر 2026',
] as const;

const defaultFormState: SubscriptionFormState = {
  name: 'Capital Pro',
  provider: 'Capital Technologies',
  amount: '149',
  currency: 'ر.س',
  frequency: 'monthly',
  usage: 'essential',
  renewalReminder: 'قبل 3 أيام',
  nextRenewalDate: '3 أغسطس 2026',
};

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function amountToNumber(value: string) {
  return Number(value.replace(/,/g, ''));
}

function amountIsValid(value: string) {
  const normalized = value.replace(/,/g, '');

  return normalized.length > 0 && /^\d+$/.test(normalized) && Number(normalized) > 0;
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function getFrequencyLabel(frequency: SubscriptionFrequency) {
  return frequencyOptions.find((option) => option.id === frequency)?.label ?? 'شهري';
}

function getFrequencySummaryLabel(frequency: SubscriptionFrequency) {
  return frequencyOptions.find((option) => option.id === frequency)?.summaryLabel ?? 'شهريًا';
}

function getAnnualEstimate(amount: string, frequency: SubscriptionFrequency) {
  const numericAmount = amountIsValid(amount) ? amountToNumber(amount) : 0;
  const multiplier = frequencyOptions.find((option) => option.id === frequency)?.multiplier ?? 12;

  return numericAmount * multiplier;
}

export function AddSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const stackPairs = width < 430;
  const [form, setForm] = useState<SubscriptionFormState>(defaultFormState);
  const [errors, setErrors] = useState<SubscriptionFormErrors>({});
  const annualEstimate = getAnnualEstimate(form.amount, form.frequency);

  function updateField<Key extends keyof SubscriptionFormState>(key: Key, value: SubscriptionFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSave() {
    const nextErrors: SubscriptionFormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'أدخل اسم الاشتراك';
    }

    if (!form.provider.trim()) {
      nextErrors.provider = 'أدخل اسم الجهة المقدمة';
    }

    if (!form.amount.trim()) {
      nextErrors.amount = 'أدخل قيمة الاشتراك';
    } else if (!amountIsValid(form.amount)) {
      nextErrors.amount = 'أدخل قيمة صحيحة أكبر من صفر';
    }

    if (!form.currency.trim()) {
      nextErrors.currency = 'اختر العملة';
    }

    if (!form.frequency) {
      nextErrors.frequency = 'اختر تكرار الدفع';
    }

    if (!form.usage) {
      nextErrors.usage = 'اختر مستوى الاستخدام';
    }

    if (!form.renewalReminder.trim()) {
      nextErrors.renewalReminder = 'اختر تنبيه التجديد';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    router.replace({
      pathname: routes.transactionSuccessSubscription,
      params: {
        amount: form.amount,
        currency: form.currency,
        frequency: getFrequencySummaryLabel(form.frequency),
        name: form.name,
      },
    });
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xl),
              paddingTop: Math.max(insets.top + spacing.md, spacing.safeTop),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ModalHeader onBack={() => router.back()} title="إضافة اشتراك" />

          <SubscriptionPreviewCard
            amount={form.amount}
            annualEstimate={annualEstimate}
            currency={form.currency}
            frequency={getFrequencyLabel(form.frequency)}
            name={form.name}
            nextRenewalDate={form.nextRenewalDate}
          />

          <View style={styles.formStack}>
            <TextField
              error={errors.name}
              label="اسم الاشتراك"
              onChangeText={(value) => updateField('name', value)}
              value={form.name}
            />
            <TextField
              error={errors.provider}
              label="الجهة المقدمة"
              onChangeText={(value) => updateField('provider', value)}
              value={form.provider}
            />

            <View style={[styles.fieldPair, stackPairs && styles.fieldPairStacked]}>
              <AmountField
                currency={form.currency}
                error={errors.amount}
                onChangeText={(value) => updateField('amount', normalizeAmountInput(value))}
                style={styles.flexField}
                value={form.amount}
              />
              <SelectField
                error={errors.currency}
                label="العملة"
                onSelect={(value) => updateField('currency', value)}
                options={currencyOptions}
                style={styles.flexField}
                value={form.currency}
              />
            </View>

            <View style={styles.section}>
              <CategoryPicker
                error={errors.frequency}
                onSelect={(value) => {
                  const selectedFrequency = frequencyOptions.find((option) => option.label === value)?.id ?? 'monthly';
                  updateField('frequency', selectedFrequency);
                }}
                options={frequencyOptions.map((option) => option.label)}
                selectedValue={getFrequencyLabel(form.frequency)}
                title="تكرار الدفع"
              />
            </View>

            <View style={styles.section}>
              <AppText variant="sectionTitle">الاستخدام</AppText>
              <View style={styles.segmentedControl}>
                {usageOptions.map((option) => (
                  <SegmentOption
                    key={option.id}
                    label={option.label}
                    onPress={() => updateField('usage', option.id)}
                    selected={form.usage === option.id}
                  />
                ))}
              </View>
              {errors.usage ? (
                <AppText tone="danger" variant="caption">
                  {errors.usage}
                </AppText>
              ) : null}
            </View>

            <SelectField
              error={errors.renewalReminder}
              label="تنبيه قبل التجديد"
              onSelect={(value) => updateField('renewalReminder', value)}
              options={reminderOptions}
              value={form.renewalReminder}
            />

            <SelectField
              iconName="calendar-outline"
              label="تاريخ التجديد القادم"
              onSelect={(value) => updateField('nextRenewalDate', value)}
              options={renewalDateOptions}
              value={form.nextRenewalDate}
            />

            <View style={styles.infoCard}>
              <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
              <AppText style={styles.infoText} tone="secondary" variant="supporting">
                يمكنك مراجعة الاشتراكات لاحقًا من الذكاء المالي.
              </AppText>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton onPress={handleSave}>حفظ الاشتراك</AppButton>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <AppText align="center" tone="secondary" variant="buttonLabel">
                إلغاء
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ModalHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="arrow-forward-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
    </View>
  );
}

function SubscriptionPreviewCard({
  name,
  frequency,
  amount,
  currency,
  nextRenewalDate,
  annualEstimate,
}: {
  name: string;
  frequency: string;
  amount: string;
  currency: string;
  nextRenewalDate: string;
  annualEstimate: number;
}) {
  const visibleName = name.trim() || 'Capital Pro';
  const visibleAmount = amount.trim() || '149';

  return (
    <View style={styles.previewCard}>
      <LinearGradient
        colors={['rgba(38,46,62,0.58)', 'rgba(23,38,32,0.48)', 'rgba(10,13,18,0.70)']}
        end={{ x: 0.9, y: 1 }}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.previewContent}>
        <View style={styles.previewHeader}>
          <View style={styles.previewIcon}>
            <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={20} />
          </View>
          <View style={styles.previewCopy}>
            <AppText style={styles.mixedText} variant="cardTitle">
              {directionSafeText(visibleName)}
            </AppText>
            <AppText tone="secondary" variant="supporting">
              {directionSafeText(`يتجدد ${frequency}`)}
            </AppText>
          </View>
        </View>

        <View style={styles.previewAmountRow}>
          <NumericText style={styles.previewAmount}>{`${visibleAmount} ${currency}`}</NumericText>
        </View>

        <View style={styles.previewMeta}>
          <AppText tone="secondary" variant="caption">
            {directionSafeText(`التجديد القادم: ${nextRenewalDate}`)}
          </AppText>
          <AppText tone="secondary" variant="caption">
            {directionSafeText(`تقديري سنويًا: ${formatWholeNumber(annualEstimate)} ${currency}`)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
};

function TextField({ label, value, error, onChangeText }: TextFieldProps) {
  return (
    <View style={styles.fieldRoot}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <SolidCard style={[styles.inputCard, error && styles.inputCardError]}>
        <TextInput
          onChangeText={onChangeText}
          placeholderTextColor={colors.text.tertiary}
          style={styles.textInput}
          value={value}
        />
      </SolidCard>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type AmountFieldProps = {
  value: string;
  currency: string;
  error?: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

function AmountField({ value, currency, error, onChangeText, style }: AmountFieldProps) {
  return (
    <View style={[styles.fieldRoot, style]}>
      <AppText tone="secondary" variant="supporting">
        القيمة
      </AppText>
      <SolidCard style={[styles.inputCard, styles.amountFieldCard, error && styles.inputCardError]}>
        <AppText style={styles.currencySuffix} variant="cardTitle">
          {currency}
        </AppText>
        <TextInput
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.amountInput}
          value={value}
        />
      </SolidCard>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

function SelectField({
  label,
  value,
  options,
  error,
  iconName = 'chevron-down',
  onSelect,
  style,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);

  function openPicker() {
    Keyboard.dismiss();
    setVisible(true);
  }

  function closePicker() {
    setVisible(false);
  }

  function selectOption(option: string) {
    Haptics.selectionAsync().catch(() => null);
    onSelect(option);
    setVisible(false);
  }

  return (
    <View style={[styles.fieldRoot, style]}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.selectField, error && styles.inputCardError, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.tertiary} name={iconName} size={17} />
        <AppText align="right" numberOfLines={1} style={styles.selectValue} variant="body">
          {directionSafeText(value)}
        </AppText>
      </Pressable>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
      <OptionSheet label={label} onClose={closePicker} onSelect={selectOption} options={options} value={value} visible={visible} />
    </View>
  );
}

type OptionSheetProps = {
  visible: boolean;
  label: string;
  value: string;
  options: readonly string[];
  onClose: () => void;
  onSelect: (value: string) => void;
};

function OptionSheet({ visible, label, value, options, onClose, onSelect }: OptionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.pickerRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.pickerBackdrop} />
        <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
          <View style={styles.pickerHandle} />
          <View style={styles.pickerHeader}>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <AppText tone="link" variant="supporting">
                إلغاء
              </AppText>
            </Pressable>
            <AppText variant="cardTitle">{label}</AppText>
          </View>

          <ScrollView contentContainerStyle={styles.pickerOptions} showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const selected = option === value;

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
                  <AppText align="right" style={styles.pickerOptionText} tone={selected ? 'primary' : 'secondary'} variant="body">
                    {directionSafeText(option)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SegmentOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress();
      }}
      style={({ pressed }) => [styles.segmentOption, selected && styles.segmentOptionSelected, pressed && styles.pressed]}
    >
      <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
        {label}
      </AppText>
    </Pressable>
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
    gap: spacing.xl,
    paddingHorizontal: spacing.screenX,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  headerButton: {
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
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  previewCard: {
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.glass,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewContent: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.button,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  previewCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  mixedText: {
    writingDirection: 'auto',
  },
  previewAmountRow: {
    alignItems: 'flex-start',
  },
  previewAmount: {
    color: colors.brand.calmGreen,
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'left',
  },
  previewMeta: {
    gap: spacing.xs,
  },
  formStack: {
    gap: spacing.lg,
  },
  fieldRoot: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  fieldPair: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  fieldPairStacked: {
    flexDirection: 'column',
  },
  flexField: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  inputCard: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputCardError: {
    borderColor: colors.semantic.danger,
  },
  textInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 24,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'auto',
  },
  amountFieldCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    lineHeight: 28,
    minHeight: 28,
    minWidth: 0,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  currencySuffix: {
    color: colors.brand.calmGreen,
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
  },
  segmentedControl: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segmentOption: {
    alignItems: 'center',
    borderRadius: radii.control,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.sm,
  },
  segmentOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderWidth: 1,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.26)',
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.lg,
  },
  infoText: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
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
  pickerOptions: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
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
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
