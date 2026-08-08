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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';

type CommitmentFrequency = 'one-time' | 'monthly';

type CommitmentFormState = {
  name: string;
  entity: string;
  amount: string;
  dueDate: string;
  commitmentType: string;
  frequency: CommitmentFrequency;
  priority: string;
  status: string;
  reminder: string;
  notes: string;
};

type CommitmentFormErrors = Partial<Record<keyof Pick<CommitmentFormState, 'name' | 'entity' | 'amount' | 'dueDate' | 'commitmentType'>, string>>;

const commitmentTypes = [
  'فاتورة مستحقة',
  'راتب',
  'إيجار',
  'قسط',
  'تمويل',
  'مورد',
  'عقد خدمة',
  'ضريبة تقديرية',
  'أخرى',
] as const;

const dueDateOptions = [
  '1 أغسطس 2026',
  '15 أغسطس 2026',
  '1 سبتمبر 2026',
  '15 سبتمبر 2026',
  '1 أكتوبر 2026',
] as const;

const priorityOptions = ['عادية', 'مهمة', 'عاجلة'] as const;
const statusOptions = ['قادم', 'مستحق قريبًا', 'متأخر', 'مدفوع'] as const;
const reminderOptions = ['بدون تنبيه', 'قبل يوم', 'قبل 3 أيام', 'قبل 7 أيام', 'قبل 14 يومًا'] as const;

const defaultFormState: CommitmentFormState = {
  name: 'إيجار المكتب',
  entity: 'شركة العقارات',
  amount: '4,500',
  dueDate: '1 أغسطس 2026',
  commitmentType: 'إيجار',
  frequency: 'monthly',
  priority: 'مهمة',
  status: 'مستحق قريبًا',
  reminder: 'قبل 3 أيام',
  notes: '',
};

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function amountIsValid(value: string) {
  const normalized = value.replace(/,/g, '');

  return normalized.length > 0 && /^\d+$/.test(normalized) && Number(normalized) > 0;
}

export function AddCommitmentScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const stackPairs = width < 430;
  const [form, setForm] = useState<CommitmentFormState>(defaultFormState);
  const [errors, setErrors] = useState<CommitmentFormErrors>({});

  function updateField<Key extends keyof CommitmentFormState>(key: Key, value: CommitmentFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSave() {
    const nextErrors: CommitmentFormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'أدخل اسم الالتزام';
    }

    if (!form.entity.trim()) {
      nextErrors.entity = 'أدخل اسم الجهة';
    }

    if (!form.amount.trim()) {
      nextErrors.amount = 'أدخل قيمة الالتزام';
    } else if (!amountIsValid(form.amount)) {
      nextErrors.amount = 'أدخل قيمة صحيحة أكبر من صفر';
    }

    if (!form.dueDate.trim()) {
      nextErrors.dueDate = 'اختر تاريخ الاستحقاق';
    }

    if (!form.commitmentType.trim()) {
      nextErrors.commitmentType = 'اختر نوع الالتزام';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    router.replace({
      pathname: routes.transactionSuccessCommitment,
      params: {
        amount: form.amount,
        dueDate: form.dueDate,
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
          <ModalHeader onBack={() => router.back()} title="إضافة التزام" />

          <View style={styles.formStack}>
            <TextField
              error={errors.name}
              label="اسم الالتزام"
              onChangeText={(value) => updateField('name', value)}
              value={form.name}
            />

            <View style={[styles.fieldPair, stackPairs && styles.fieldPairStacked]}>
              <TextField
                error={errors.entity}
                label="الجهة"
                onChangeText={(value) => updateField('entity', value)}
                style={styles.flexField}
                value={form.entity}
              />
              <AmountField
                error={errors.amount}
                onChangeText={(value) => updateField('amount', normalizeAmountInput(value))}
                style={styles.flexField}
                value={form.amount}
              />
            </View>

            <SelectField
              error={errors.dueDate}
              iconName="calendar-outline"
              label="تاريخ الاستحقاق"
              onSelect={(value) => updateField('dueDate', value)}
              options={dueDateOptions}
              value={form.dueDate}
            />

            <View style={styles.section}>
              <AppText variant="sectionTitle">نوع الالتزام</AppText>
              <View style={styles.chipGrid}>
                {commitmentTypes.map((type) => {
                  const selected = form.commitmentType === type;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={type}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => null);
                        updateField('commitmentType', type);
                      }}
                      style={({ pressed }) => [
                        styles.chip,
                        selected && styles.chipSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
                        {type}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              {errors.commitmentType ? (
                <AppText tone="danger" variant="caption">
                  {errors.commitmentType}
                </AppText>
              ) : null}
            </View>

            <View style={styles.section}>
              <AppText variant="sectionTitle">متكرر أم مرة واحدة</AppText>
              <View style={styles.segmentedControl}>
                <FrequencyOption
                  label="مرة واحدة"
                  onPress={() => updateField('frequency', 'one-time')}
                  selected={form.frequency === 'one-time'}
                />
                <FrequencyOption
                  label="متكرر — شهري"
                  onPress={() => updateField('frequency', 'monthly')}
                  selected={form.frequency === 'monthly'}
                />
              </View>
            </View>

            <View style={[styles.fieldPair, stackPairs && styles.fieldPairStacked]}>
              <SelectField
                accent="warning"
                label="أولوية السداد"
                onSelect={(value) => updateField('priority', value)}
                options={priorityOptions}
                style={styles.flexField}
                value={form.priority}
              />
              <SelectField
                accent="warning"
                label="حالة الالتزام"
                onSelect={(value) => updateField('status', value)}
                options={statusOptions}
                style={styles.flexField}
                value={form.status}
              />
            </View>

            <SelectField
              label="تنبيه قبل الاستحقاق"
              onSelect={(value) => updateField('reminder', value)}
              options={reminderOptions}
              value={form.reminder}
            />

            <NotesField onChangeText={(value) => updateField('notes', value)} value={form.notes} />
          </View>

          <AppButton onPress={handleSave}>حفظ الالتزام</AppButton>
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

type TextFieldProps = {
  label: string;
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
  style?: object;
};

function TextField({ label, value, error, onChangeText, style }: TextFieldProps) {
  return (
    <View style={[styles.fieldRoot, style]}>
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
  error?: string;
  onChangeText: (value: string) => void;
  style?: object;
};

function AmountField({ value, error, onChangeText, style }: AmountFieldProps) {
  return (
    <View style={[styles.fieldRoot, style]}>
      <AppText tone="secondary" variant="supporting">
        القيمة
      </AppText>
      <SolidCard style={[styles.inputCard, styles.amountCard, error && styles.inputCardError]}>
        <AppText style={styles.currencySuffix} variant="cardTitle">
          ر.س
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
  accent?: 'green' | 'warning';
  iconName?: keyof typeof Ionicons.glyphMap;
  onSelect: (value: string) => void;
  style?: object;
};

function SelectField({
  label,
  value,
  options,
  error,
  accent = 'green',
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
        style={({ pressed }) => [
          styles.selectField,
          accent === 'warning' && styles.warningSelectField,
          error && styles.inputCardError,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons color={accent === 'warning' ? colors.semantic.warning : colors.text.tertiary} name={iconName} size={17} />
        <AppText align="right" numberOfLines={1} style={styles.selectValue} variant="body">
          {directionSafeText(value)}
        </AppText>
      </Pressable>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
      <OptionSheet
        accent={accent}
        label={label}
        onClose={closePicker}
        onSelect={selectOption}
        options={options}
        value={value}
        visible={visible}
      />
    </View>
  );
}

type OptionSheetProps = {
  visible: boolean;
  label: string;
  value: string;
  options: readonly string[];
  accent: 'green' | 'warning';
  onClose: () => void;
  onSelect: (value: string) => void;
};

function OptionSheet({ visible, label, value, options, accent, onClose, onSelect }: OptionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.pickerRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.pickerBackdrop} />
        <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxl) }]}>
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
                    selected && (accent === 'warning' ? styles.pickerOptionWarningSelected : styles.pickerOptionSelected),
                    pressed && styles.pressed,
                  ]}
                >
                  {selected ? (
                    <Ionicons
                      color={accent === 'warning' ? colors.semantic.warning : colors.brand.calmGreen}
                      name="checkmark-circle"
                      size={18}
                    />
                  ) : null}
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
  formStack: {
    gap: spacing.lg,
  },
  fieldRoot: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  flexField: {
    flex: 1,
  },
  fieldPair: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  fieldPairStacked: {
    flexDirection: 'column',
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
  amountCard: {
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
  warningSelectField: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.35)',
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.46)',
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
  pickerOptionWarningSelected: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.46)',
  },
  pickerOptionText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
