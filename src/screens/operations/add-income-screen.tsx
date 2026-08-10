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
import { directionSafeText } from '@/utils/rtl';

type IncomeRecurrence = 'one-time' | 'recurring';

type IncomeFormState = {
  amount: string;
  source: string;
  category: string;
  date: string;
  paymentStatus: string;
  recurrence: IncomeRecurrence;
  frequency: string;
  nextDate: string;
  endDate: string;
  notes: string;
};

type IncomeFormErrors = Partial<Record<keyof Pick<IncomeFormState, 'amount' | 'source' | 'category' | 'date' | 'paymentStatus'>, string>>;

const incomeSources = [
  'دفعة عميل',
  'اشتراك',
  'بيع منتج',
  'بيع خدمة',
  'استشارة',
  'عمولة',
  'إعلان أو رعاية',
  'أخرى',
] as const;

const incomeCategories = [
  'دخل من عميل',
  'مبيعات',
  'اشتراكات',
  'استشارات',
  'عمولات',
  'إعلانات ورعاية',
  'استثمار',
  'أخرى',
] as const;

const dateOptions = [
  '15 يوليو 2026',
  '20 يوليو 2026',
  '1 أغسطس 2026',
  '15 أغسطس 2026',
  '1 سبتمبر 2026',
] as const;

const paymentStatuses = ['تم الاستلام', 'مستحق', 'متأخر', 'جزئي'] as const;
const frequencyOptions = ['أسبوعي', 'شهري', 'ربع سنوي', 'سنوي'] as const;
const nextDateOptions = ['15 أغسطس 2026', '1 سبتمبر 2026', '15 سبتمبر 2026', '1 أكتوبر 2026'] as const;
const endDateOptions = ['بدون تاريخ', '31 ديسمبر 2026', '30 يونيو 2027', '31 ديسمبر 2027'] as const;

const defaultFormState: IncomeFormState = {
  amount: '18,500',
  source: 'دفعة عميل',
  category: 'دخل من عميل',
  date: '15 يوليو 2026',
  paymentStatus: 'تم الاستلام',
  recurrence: 'recurring',
  frequency: 'شهري',
  nextDate: '15 أغسطس 2026',
  endDate: 'بدون تاريخ',
  notes: '',
};

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function amountIsValid(value: string) {
  const normalized = value.replace(/,/g, '');

  return normalized.length > 0 && /^\d+$/.test(normalized) && Number(normalized) > 0;
}

export function AddIncomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const stackPairs = width < 430;
  const [form, setForm] = useState<IncomeFormState>(defaultFormState);
  const [errors, setErrors] = useState<IncomeFormErrors>({});

  function updateField<Key extends keyof IncomeFormState>(key: Key, value: IncomeFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSave() {
    const nextErrors: IncomeFormErrors = {};

    if (!form.amount.trim()) {
      nextErrors.amount = 'أدخل مبلغ الدخل';
    } else if (!amountIsValid(form.amount)) {
      nextErrors.amount = 'أدخل مبلغًا صحيحًا أكبر من صفر';
    }

    if (!form.source.trim()) {
      nextErrors.source = 'اختر مصدر الدخل';
    }

    if (!form.category.trim()) {
      nextErrors.category = 'اختر تصنيف الدخل';
    }

    if (!form.date.trim()) {
      nextErrors.date = 'اختر تاريخ الدخل';
    }

    if (!form.paymentStatus.trim()) {
      nextErrors.paymentStatus = 'اختر حالة الدفع';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    router.replace({
      pathname: routes.transactionSuccessIncome,
      params: {
        amount: form.amount,
      },
    });
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
          <ModalHeader onBack={() => router.back()} title="إضافة دخل" />

          <AmountCard
            error={errors.amount}
            onChangeText={(value) => updateField('amount', normalizeAmountInput(value))}
            value={form.amount}
          />

          <CategoryPicker
            error={errors.source}
            onSelect={(value) => updateField('source', value)}
            options={incomeSources}
            selectedValue={form.source}
            title="المصدر"
          />

          <SelectField
            error={errors.category}
            label="التصنيف"
            onSelect={(value) => updateField('category', value)}
            options={incomeCategories}
            value={form.category}
          />

          <View style={[styles.fieldPair, stackPairs && styles.fieldPairStacked]}>
            <SelectField
              error={errors.date}
              iconName="calendar-outline"
              label="التاريخ"
              onSelect={(value) => updateField('date', value)}
              options={dateOptions}
              style={styles.flexField}
              value={form.date}
            />
            <SelectField
              error={errors.paymentStatus}
              label="حالة الدفع"
              onSelect={(value) => updateField('paymentStatus', value)}
              options={paymentStatuses}
              style={styles.flexField}
              value={form.paymentStatus}
            />
          </View>

          <View style={styles.section}>
            <AppText variant="sectionTitle">متكرر أم مرة واحدة</AppText>
            <View style={styles.segmentedControl}>
              <FrequencyOption
                label="مرة واحدة"
                onPress={() => updateField('recurrence', 'one-time')}
                selected={form.recurrence === 'one-time'}
              />
              <FrequencyOption
                label="متكرر"
                onPress={() => updateField('recurrence', 'recurring')}
                selected={form.recurrence === 'recurring'}
              />
            </View>
          </View>

          {form.recurrence === 'recurring' ? (
            <SolidCard style={styles.recurrenceCard}>
              <View style={styles.recurrenceHeader}>
                <View style={styles.recurrenceIcon}>
                  <Ionicons color={colors.brand.calmGreen} name="repeat-outline" size={18} />
                </View>
                <AppText variant="cardTitle">تفاصيل التكرار</AppText>
              </View>
              <SelectField
                label="التكرار"
                onSelect={(value) => updateField('frequency', value)}
                options={frequencyOptions}
                value={form.frequency}
              />
              <SelectField
                iconName="calendar-outline"
                label="تاريخ العملية القادمة"
                onSelect={(value) => updateField('nextDate', value)}
                options={nextDateOptions}
                value={form.nextDate}
              />
              <SelectField
                iconName="calendar-outline"
                label="تاريخ الانتهاء — اختياري"
                onSelect={(value) => updateField('endDate', value)}
                options={endDateOptions}
                value={form.endDate}
              />
            </SolidCard>
          ) : null}

          <NotesField onChangeText={(value) => updateField('notes', value)} value={form.notes} />

          <View style={styles.actions}>
            <AppButton onPress={handleSave}>حفظ الدخل</AppButton>
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
        <Ionicons color={colors.text.muted} name="arrow-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
    </View>
  );
}

type AmountCardProps = {
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
};

function AmountCard({ value, error, onChangeText }: AmountCardProps) {
  return (
    <SolidCard style={[styles.amountCard, error && styles.inputCardError]}>
      <View style={styles.amountHeader}>
        <View style={styles.amountIcon}>
          <Ionicons color={colors.semantic.success} name="add-outline" size={18} />
        </View>
        <AppText tone="secondary" variant="supporting">
          المبلغ
        </AppText>
      </View>
      <View style={styles.amountLine}>
        <TextInput
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.amountInput}
          value={value}
        />
        <AppText style={styles.currencySuffix} variant="sectionTitle">
          ر.س
        </AppText>
      </View>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </SolidCard>
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

function FrequencyOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
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

function NotesField({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.fieldRoot}>
      <AppText tone="secondary" variant="supporting">
        ملاحظات (اختياري)
      </AppText>
      <SolidCard style={styles.notesCard}>
        <TextInput
          multiline
          onChangeText={onChangeText}
          placeholder="أضف تفاصيل إضافية..."
          placeholderTextColor={colors.text.tertiary}
          style={styles.notesInput}
          value={value}
        />
      </SolidCard>
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
    gap: spacing.xl,
    paddingHorizontal: spacing.screenX,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
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
  amountCard: {
    backgroundColor: 'rgba(17,20,25,0.94)',
    borderColor: 'rgba(79,138,91,0.24)',
    gap: spacing.md,
    padding: spacing.xl,
  },
  amountHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  amountIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  amountLine: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amountInput: {
    color: colors.semantic.success,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 40,
    fontVariant: ['tabular-nums'],
    lineHeight: 48,
    minHeight: 58,
    minWidth: 0,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  currencySuffix: {
    color: colors.semantic.success,
    paddingBottom: spacing.sm,
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
  fieldRoot: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  inputCardError: {
    borderColor: colors.semantic.danger,
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
    paddingHorizontal: spacing.md,
  },
  segmentOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderWidth: 1,
  },
  recurrenceCard: {
    gap: spacing.lg,
  },
  recurrenceHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  recurrenceIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  notesCard: {
    minHeight: 104,
  },
  notesInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 76,
    padding: 0,
    textAlign: 'right',
    textAlignVertical: 'top',
    writingDirection: 'rtl',
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
