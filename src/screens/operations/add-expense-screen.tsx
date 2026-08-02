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
  View,
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

type ExpenseRecurrence = 'one-time' | 'monthly';

type ExpenseFormState = {
  amount: string;
  category: string;
  merchant: string;
  paymentMethod: string;
  date: string;
  recurrence: ExpenseRecurrence;
  notes: string;
};

type ExpenseFormErrors = Partial<Record<keyof Pick<ExpenseFormState, 'amount' | 'category' | 'merchant' | 'paymentMethod' | 'date'>, string>>;

const expenseCategories = [
  'أدوات وبرامج',
  'رواتب',
  'تسويق',
  'تشغيل',
  'استضافة',
  'تطوير',
  'تصميم',
  'إيجار',
  'خدمات قانونية',
  'سفر',
  'شحن وتوصيل',
  'أخرى',
] as const;

const paymentMethods = ['بطاقة', 'تحويل', 'نقدًا', 'محفظة رقمية', 'أخرى'] as const;

const dateOptions = [
  '14 يوليو 2026',
  '15 يوليو 2026',
  '20 يوليو 2026',
  '1 أغسطس 2026',
  '15 أغسطس 2026',
] as const;

const defaultFormState: ExpenseFormState = {
  amount: '3,200',
  category: 'تسويق',
  merchant: 'منصة إعلانات ميتا',
  paymentMethod: 'بطاقة',
  date: '14 يوليو 2026',
  recurrence: 'one-time',
  notes: '',
};

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function amountIsValid(value: string) {
  const normalized = value.replace(/,/g, '');

  return normalized.length > 0 && /^\d+$/.test(normalized) && Number(normalized) > 0;
}

export function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<ExpenseFormState>(defaultFormState);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [receiptNotice, setReceiptNotice] = useState(false);

  function updateField<Key extends keyof ExpenseFormState>(key: Key, value: ExpenseFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSave() {
    const nextErrors: ExpenseFormErrors = {};

    if (!form.amount.trim()) {
      nextErrors.amount = 'أدخل مبلغ المصروف';
    } else if (!amountIsValid(form.amount)) {
      nextErrors.amount = 'أدخل مبلغًا صحيحًا أكبر من صفر';
    }

    if (!form.category.trim()) {
      nextErrors.category = 'اختر تصنيف المصروف';
    }

    if (!form.merchant.trim()) {
      nextErrors.merchant = 'أدخل اسم الجهة أو المتجر';
    }

    if (!form.paymentMethod.trim()) {
      nextErrors.paymentMethod = 'اختر طريقة الدفع';
    }

    if (!form.date.trim()) {
      nextErrors.date = 'اختر تاريخ المصروف';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    router.replace({
      pathname: routes.transactionSuccessExpense,
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
          <ModalHeader onBack={() => router.back()} title="إضافة مصروف" />

          <AmountCard
            error={errors.amount}
            onChangeText={(value) => updateField('amount', normalizeAmountInput(value))}
            value={form.amount}
          />

          <CategoryPicker
            error={errors.category}
            onSelect={(value) => updateField('category', value)}
            options={expenseCategories}
            selectedValue={form.category}
            title="التصنيف"
          />

          <TextField
            error={errors.merchant}
            label="الجهة أو المتجر"
            onChangeText={(value) => updateField('merchant', value)}
            value={form.merchant}
          />

          <CategoryPicker
            error={errors.paymentMethod}
            onSelect={(value) => updateField('paymentMethod', value)}
            options={paymentMethods}
            selectedValue={form.paymentMethod}
            title="طريقة الدفع"
          />

          <DateField
            error={errors.date}
            onSelect={(value) => updateField('date', value)}
            options={dateOptions}
            value={form.date}
          />

          <View style={styles.section}>
            <AppText variant="sectionTitle">متكرر أم مرة واحدة</AppText>
            <View style={styles.segmentedControl}>
              <FrequencyOption
                label="مرة واحدة"
                onPress={() => updateField('recurrence', 'one-time')}
                selected={form.recurrence === 'one-time'}
              />
              <FrequencyOption
                label="متكرر — شهري"
                onPress={() => updateField('recurrence', 'monthly')}
                selected={form.recurrence === 'monthly'}
              />
            </View>
          </View>

          <NotesField onChangeText={(value) => updateField('notes', value)} value={form.notes} />

          <ReceiptPlaceholder
            noticeVisible={receiptNotice}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null);
              setReceiptNotice(true);
            }}
          />

          <View style={styles.actions}>
            <AppButton onPress={handleSave}>حفظ المصروف</AppButton>
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
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
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
          <Ionicons color={colors.semantic.danger} name="remove-outline" size={18} />
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

type DateFieldProps = {
  value: string;
  options: readonly string[];
  error?: string;
  onSelect: (value: string) => void;
};

function DateField({ value, options, error, onSelect }: DateFieldProps) {
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
    <View style={styles.fieldRoot}>
      <AppText tone="secondary" variant="supporting">
        التاريخ
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.selectField, error && styles.inputCardError, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.tertiary} name="calendar-outline" size={17} />
        <AppText align="right" numberOfLines={1} style={styles.selectValue} variant="body">
          {directionSafeText(value)}
        </AppText>
      </Pressable>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
      <OptionSheet label="التاريخ" onClose={closePicker} onSelect={selectOption} options={options} value={value} visible={visible} />
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

          <View style={styles.pickerOptions}>
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
          </View>
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

function ReceiptPlaceholder({ noticeVisible, onPress }: { noticeVisible: boolean; onPress: () => void }) {
  return (
    <View style={styles.fieldRoot}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.receiptRow, pressed && styles.pressed]}
      >
        <View style={styles.receiptIcon}>
          <Ionicons color={colors.text.tertiary} name="image-outline" size={18} />
        </View>
        <View style={styles.receiptCopy}>
          <AppText variant="cardTitle">إرفاق إيصال (قريبًا)</AppText>
          <AppText tone="tertiary" variant="caption">
            لا يتم فتح ملفات أو طلب أذونات في النموذج الأولي
          </AppText>
        </View>
      </Pressable>
      {noticeVisible ? (
        <AppText tone="secondary" variant="caption">
          ميزة إرفاق الإيصالات ستكون متاحة لاحقًا.
        </AppText>
      ) : null}
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
    flexDirection: 'row-reverse',
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
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  amountCard: {
    backgroundColor: 'rgba(17,20,25,0.94)',
    borderColor: 'rgba(229,103,90,0.20)',
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
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
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
    color: colors.semantic.danger,
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
    color: colors.semantic.danger,
    paddingBottom: spacing.sm,
  },
  fieldRoot: {
    gap: spacing.sm,
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
    writingDirection: 'rtl',
  },
  section: {
    gap: spacing.md,
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
  receiptRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.lg,
  },
  receiptIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  receiptCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
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
