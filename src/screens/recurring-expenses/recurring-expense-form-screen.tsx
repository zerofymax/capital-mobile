import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { getCategoriesByType, getCategoryById } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { paymentMethodOptions, recurringFrequencyOptions, reminderOptions, renewalModeOptions } from './recurring-expenses-data';
import {
  addRecurringExpense,
  getRecurringExpenseById,
  updateRecurringExpense,
} from './recurring-expenses-store';
import type {
  CustomRecurringInterval,
  RecurringExpense,
  RecurringExpenseFormValues,
  RecurringFrequency,
  RecurringPaymentMethod,
  RenewalMode,
} from './recurring-expenses-types';
import {
  calculateMonthlyEquivalent,
  compareIsoDates,
  formatDateInputValue,
  formatFrequencyLabel,
  formatPaymentMethodLabel,
  formatSar,
  parseAmount,
  parseIsoDate,
  prototypeToday,
} from './recurring-expenses-utils';

type FormMode = 'add' | 'edit';
type FormErrors = Partial<Record<keyof RecurringExpenseFormValues, string>>;
type DateFieldKey = 'startDate' | 'nextDueDate' | 'endDate';

const recurringDateOptions = [
  '2026-07-25',
  '2026-07-28',
  '2026-08-01',
  '2026-08-03',
  '2026-08-10',
  '2026-08-12',
  '2026-09-01',
  '2026-11-01',
  '2026-12-31',
] as const;

export function RecurringExpenseFormScreen({ mode }: { mode: FormMode }) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const existingExpense = mode === 'edit' ? getRecurringExpenseById(params.id) : undefined;
  const initialValues = useMemo(() => createInitialValues(existingExpense), [existingExpense]);
  const [values, setValues] = useState<RecurringExpenseFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [datePicker, setDatePicker] = useState<DateFieldKey | null>(null);
  const categories = getCategoriesByType('expense');
  const parsedAmount = parseAmount(values.amount);
  const amount = parsedAmount ?? 0;
  const hasAmountValue = values.amount.trim().length > 0;
  const monthlyEquivalent = values.frequency
    ? calculateMonthlyEquivalent(amount, values.frequency, buildCustomInterval(values))
    : 0;
  const bottomPadding = Math.max(insets.bottom + spacing.xxxl + spacing.xl, spacing.screenBottom);
  const title = mode === 'add' ? 'إضافة مصروف متكرر' : 'تعديل مصروف متكرر';
  const subtitle = mode === 'add' ? 'سجّل الاشتراك أو الالتزام وحدد موعده ودورية دفعه.' : 'حدّث بيانات الالتزام وتذكيراته.';
  const formRtlLayout = Platform.OS === 'android';

  if (mode === 'edit' && !existingExpense) {
    return (
      <SafeAreaView edges={['top']} style={styles.root}>
        <View style={[styles.missingWrap, { paddingBottom: bottomPadding }]}>
          <ModalHeader subtitle="قد يكون المصروف حُذف من بيانات النموذج." title="تعذر العثور على المصروف" />
          <AppButton onPress={() => router.replace(routes.recurringExpenses)}>العودة للمصروفات</AppButton>
        </View>
      </SafeAreaView>
    );
  }

  function updateField<Key extends keyof RecurringExpenseFormValues>(key: Key, value: RecurringExpenseFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSave() {
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (mode === 'add') {
      addRecurringExpense(values);
      router.replace(routes.recurringExpenses);
      return;
    }

    const updated = updateRecurringExpense(params.id ?? '', values);
    if (updated) {
      router.replace({ pathname: routes.recurringExpenseDetails, params: { id: updated.id } });
      return;
    }

    router.replace(routes.recurringExpenses);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ModalHeader rtlLayout={formRtlLayout} subtitle={subtitle} title={title} />

          <InfoCard message="المصروف المتكرر يضيف تقديرًا شهريًا ولا يسجل عملية مالية جديدة تلقائيًا." />

          <Field
            error={errors.name}
            label="اسم المصروف"
            onChangeText={(value) => updateField('name', value)}
            placeholder="مثال: اشتراك أدوات التصميم"
            rtlLayout={formRtlLayout}
            value={values.name}
          />
          <Field
            error={errors.vendor}
            label="المورد"
            onChangeText={(value) => updateField('vendor', value)}
            placeholder="مثال: Adobe"
            rtlLayout={formRtlLayout}
            value={values.vendor}
          />

          <SelectSection
            error={errors.categoryId}
            label="التصنيف"
            options={categories.map((category) => ({ id: category.id, label: category.name, icon: category.icon }))}
            rtlLayout={formRtlLayout}
            selectedId={values.categoryId}
            stretchTitle={formRtlLayout}
            onSelect={(id) => updateField('categoryId', id)}
          />

          <Field
            error={errors.amount}
            inputMode="numeric"
            label="المبلغ"
            onChangeText={(value) => updateField('amount', value)}
            placeholder="أدخل مبلغ المصروف"
            rtlLayout={formRtlLayout}
            suffix="ر.س"
            value={values.amount}
          />

          <SelectSection
            error={errors.frequency}
            label="التكرار"
            options={recurringFrequencyOptions}
            rtlLayout={formRtlLayout}
            selectedId={values.frequency}
            stretchTitle={formRtlLayout}
            onSelect={(id) => updateField('frequency', id as RecurringFrequency)}
          />

          {values.frequency === 'custom' ? (
            <View style={styles.twoColumn}>
              <Field
                error={errors.customIntervalValue}
                inputMode="numeric"
                label="كل"
                onChangeText={(value) => updateField('customIntervalValue', value)}
                placeholder="1"
                rtlLayout={formRtlLayout}
                value={values.customIntervalValue}
              />
              <SelectSection
                compact
                label="الوحدة"
                options={[
                  { id: 'days', label: 'أيام' },
                  { id: 'months', label: 'أشهر' },
                ]}
                rtlLayout={formRtlLayout}
                selectedId={values.customIntervalUnit}
                onSelect={(id) => updateField('customIntervalUnit', id as CustomRecurringInterval['unit'])}
              />
            </View>
          ) : null}

          <DateSelectField
            error={errors.startDate}
            label="تاريخ البداية"
            onPress={() => setDatePicker('startDate')}
            placeholder="اختر تاريخ البداية"
            rtlLayout={formRtlLayout}
            value={values.startDate}
          />
          <DateSelectField
            error={errors.nextDueDate}
            label="الاستحقاق القادم"
            onPress={() => setDatePicker('nextDueDate')}
            placeholder="اختر موعد الاستحقاق"
            rtlLayout={formRtlLayout}
            value={values.nextDueDate}
          />

          <DateSelectField
            error={errors.endDate}
            label="تاريخ النهاية"
            onPress={() => setDatePicker('endDate')}
            optional
            placeholder="اختياري"
            rtlLayout={formRtlLayout}
            value={values.endDate}
          />

        <SelectSection
          label="طريقة التجديد"
          options={renewalModeOptions}
          rtlLayout={formRtlLayout}
          selectedId={values.renewalMode}
          stretchTitle={formRtlLayout}
          onSelect={(id) => updateField('renewalMode', id as RenewalMode)}
        />

        <SelectSection
          label="طريقة الدفع"
          options={paymentMethodOptions}
          rtlLayout={formRtlLayout}
          selectedId={values.paymentMethod}
          stretchTitle={formRtlLayout}
          onSelect={(id) => updateField('paymentMethod', id as RecurringPaymentMethod)}
        />

        <Field
          label="الحساب أو البطاقة"
          onChangeText={(value) => updateField('accountId', value)}
          optional
          placeholder="مثال: بطاقة الشركة"
          rtlLayout={formRtlLayout}
          value={values.accountId}
        />
        <Field
          label="رقم مرجعي"
          onChangeText={(value) => updateField('reference', value)}
          optional
          placeholder="اختياري"
          rtlLayout={formRtlLayout}
          value={values.reference}
        />
        <Field
          label="المسؤول"
          onChangeText={(value) => updateField('owner', value)}
          placeholder="مثال: فريق التقنية"
          rtlLayout={formRtlLayout}
          value={values.owner}
        />

        <SelectSection
          label="التذكير"
          options={reminderOptions.map((item) => ({ id: item.value, label: item.label }))}
          rtlLayout={formRtlLayout}
          selectedId={values.reminderDays}
          stretchTitle={formRtlLayout}
          onSelect={(id) => updateField('reminderDays', id)}
        />

        <SwitchRow
          label="يحتاج مراجعة"
          onValueChange={(value) => updateField('needsReview', value)}
          rtlLayout={formRtlLayout}
          value={values.needsReview}
        />

        {values.needsReview ? (
          <Field
            inputMode="numeric"
            label="فرصة التوفير الشهرية"
            onChangeText={(value) => updateField('monthlySavingOpportunity', value)}
            optional
            placeholder="0"
            rtlLayout={formRtlLayout}
            suffix="ر.س"
            value={values.monthlySavingOpportunity}
          />
        ) : null}

        <Field
          label="ملاحظات"
          multiline
          onChangeText={(value) => updateField('notes', value)}
          optional
          placeholder="أي تفاصيل تساعدك لاحقًا"
          rtlLayout={formRtlLayout}
          value={values.notes}
        />

          <PreviewCard
            amount={hasAmountValue && parsedAmount !== null ? amount : null}
            categoryName={getCategoryById(values.categoryId)?.name ?? 'غير محدد'}
            frequency={values.frequency}
            monthlyEquivalent={hasAmountValue && parsedAmount !== null ? monthlyEquivalent : null}
            paymentMethod={values.paymentMethod}
            rtlLayout={formRtlLayout}
          />

          <AppButton iconName="checkmark-outline" onPress={handleSave}>
            {mode === 'add' ? 'حفظ المصروف' : 'حفظ التغييرات'}
          </AppButton>
          <AppButton onPress={() => router.back()} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>
      <DatePickerSheet
        allowClear={datePicker === 'endDate'}
        onClose={() => setDatePicker(null)}
        onClear={() => {
          if (datePicker) {
            updateField(datePicker, '');
          }
          setDatePicker(null);
        }}
        onSelect={(value) => {
          if (datePicker) {
            updateField(datePicker, value);
          }
          setDatePicker(null);
        }}
        selectedValue={datePicker ? values[datePicker] : ''}
        title={datePicker ? getDatePickerTitle(datePicker) : ''}
        rtlLayout={formRtlLayout}
        visible={datePicker !== null}
      />
    </SafeAreaView>
  );
}

function DateSelectField({
  label,
  value,
  placeholder,
  error,
  optional,
  rtlLayout,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  optional?: boolean;
  rtlLayout: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.labelRow, rtlLayout && styles.physicalLtrRow]}>
        {optional ? (
          <View style={styles.optionalBadge}>
            <AppText align="center" tone="secondary" variant="caption">
              اختياري
            </AppText>
          </View>
        ) : null}
        <AppText style={rtlLayout ? styles.rtlFieldLabel : undefined} variant="cardTitle">{label}</AppText>
      </View>
      <Pressable
        accessibilityLabel={`${label} ${formatDateInputValue(value, placeholder)}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.dateField,
          rtlLayout && styles.physicalLtrRow,
          error && styles.inputError,
          pressed && styles.pressed,
        ]}
      >
        {rtlLayout ? (
          <>
            <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
            <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={19} />
            <AppText style={[styles.dateValue, styles.rtlDateValue, !value && styles.placeholderText]} variant="body">
              {formatDateInputValue(value, placeholder)}
            </AppText>
          </>
        ) : (
          <>
            <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={19} />
            <AppText style={[styles.dateValue, !value && styles.placeholderText]} variant="body">
              {formatDateInputValue(value, placeholder)}
            </AppText>
            <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
          </>
        )}
      </Pressable>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function DatePickerSheet({
  visible,
  title,
  selectedValue,
  allowClear,
  rtlLayout,
  onSelect,
  onClear,
  onClose,
}: {
  visible: boolean;
  title: string;
  selectedValue: string;
  allowClear: boolean;
  rtlLayout: boolean;
  onSelect: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.pickerRoot}>
        <Pressable accessibilityLabel="إغلاق اختيار التاريخ" onPress={onClose} style={styles.pickerBackdrop} />
        <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.xxl, 52) }]}>
          <View style={styles.pickerHandle} />
          <View style={[styles.pickerHeader, rtlLayout && styles.physicalLtrRow]}>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <AppText tone="link" variant="supporting">
                إلغاء
              </AppText>
            </Pressable>
            <AppText style={rtlLayout ? styles.rtlPickerTitle : undefined} variant="sectionTitle">{title}</AppText>
          </View>
          {allowClear ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !selectedValue }}
              onPress={onClear}
              style={[styles.clearDateButton, rtlLayout && styles.rtlPickerOptionRow]}
            >
              {!selectedValue ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
              <AppText style={rtlLayout ? styles.rtlPickerOptionText : undefined} tone="secondary" variant="caption">
                بدون تاريخ نهاية
              </AppText>
            </Pressable>
          ) : null}
          <View style={styles.pickerOptions}>
            {recurringDateOptions.map((option) => {
              const selected = option === selectedValue;

              return (
                <Pressable
                  accessibilityLabel={formatDisplayDateForOption(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option}
                  onPress={() => onSelect(option)}
                  style={({ pressed }) => [
                    styles.pickerOption,
                    rtlLayout && styles.physicalLtrRow,
                    selected && styles.pickerOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                  <AppText
                    style={[styles.pickerOptionText, rtlLayout && styles.rtlPickerOptionText]}
                    tone={selected ? 'primary' : 'secondary'}
                    variant="body"
                  >
                    {formatDisplayDateForOption(option)}
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

function ModalHeader({
  title,
  subtitle,
  rtlLayout = false,
}: {
  title: string;
  subtitle: string;
  rtlLayout?: boolean;
}) {
  if (rtlLayout) {
    return (
      <View style={styles.addHeader}>
        <Pressable
          accessibilityLabel="رجوع"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.addBackButton}
        >
          <Ionicons color={colors.text.primary} name="chevron-back-outline" size={21} />
        </Pressable>
        <View style={styles.addHeaderCopy}>
          <AppText style={styles.addHeaderText} variant="screenTitle">
            {title}
          </AppText>
          <AppText style={styles.addHeaderText} tone="secondary" variant="supporting">
            {subtitle}
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons
          color={colors.text.primary}
          name={Platform.OS === 'android' ? 'chevron-back-outline' : 'chevron-forward-outline'}
          size={21}
        />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="right" variant="screenTitle">
          {title}
        </AppText>
        <AppText align="right" tone="secondary" variant="supporting">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

function InfoCard({ message }: { message: string }) {
  return (
    <View style={styles.infoCard}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.infoText} variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  error,
  optional,
  suffix,
  multiline,
  inputMode,
  rtlLayout,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  optional?: boolean;
  suffix?: string;
  multiline?: boolean;
  inputMode?: 'numeric';
  rtlLayout: boolean;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.labelRow, rtlLayout && styles.physicalLtrRow]}>
        {optional ? (
          <View style={styles.optionalBadge}>
            <AppText align="center" tone="secondary" variant="caption">
              اختياري
            </AppText>
          </View>
        ) : null}
        <AppText style={rtlLayout ? styles.rtlFieldLabel : undefined} variant="cardTitle">{label}</AppText>
      </View>
      <View style={[styles.inputWrap, rtlLayout && styles.physicalLtrRow, error && styles.inputError, multiline && styles.textArea]}>
        {suffix ? (
          <AppText style={styles.inputSuffix} tone="secondary" variant="caption">
            {suffix}
          </AppText>
        ) : null}
        <TextInput
          inputMode={inputMode}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, rtlLayout && styles.rtlInput, multiline && styles.textAreaInput]}
          value={value}
        />
      </View>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function SelectSection({
  label,
  options,
  selectedId,
  error,
  compact,
  rtlLayout,
  stretchTitle = false,
  onSelect,
}: {
  label: string;
  options: readonly { id: string; label: string; icon?: keyof typeof Ionicons.glyphMap }[];
  selectedId: string;
  error?: string;
  compact?: boolean;
  rtlLayout: boolean;
  stretchTitle?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={[styles.fieldWrap, compact && styles.compactSelect]}>
      {stretchTitle ? (
        <View style={styles.sectionTitleWrapper}>
          <AppText style={styles.sectionTitle} variant="cardTitle">{label}</AppText>
        </View>
      ) : (
        <AppText style={rtlLayout ? styles.rtlSectionLabel : undefined} variant="cardTitle">{label}</AppText>
      )}
      <View style={[styles.chipGrid, rtlLayout && styles.physicalRtlWrap]}>
        {options.map((option) => {
          const selected = option.id === selectedId;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.id || option.label}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [styles.selectChip, selected && styles.selectChipActive, pressed && styles.pressed]}
            >
              {option.icon ? (
                <Ionicons color={selected ? colors.text.primary : colors.text.tertiary} name={option.icon} size={16} />
              ) : null}
              <AppText align="center" style={selected && styles.selectTextActive} variant="caption">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function SwitchRow({
  label,
  value,
  rtlLayout,
  onValueChange,
}: {
  label: string;
  value: boolean;
  rtlLayout: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={[styles.switchRow, rtlLayout && styles.physicalLtrRow]}>
      <Switch
        onValueChange={onValueChange}
        thumbColor={colors.text.primary}
        trackColor={{ false: colors.surface.muted, true: colors.brand.mediumGreen }}
        value={value}
      />
      <AppText style={rtlLayout ? styles.rtlSwitchLabel : undefined} variant="cardTitle">{label}</AppText>
    </View>
  );
}

function PreviewCard({
  amount,
  categoryName,
  frequency,
  monthlyEquivalent,
  paymentMethod,
  rtlLayout,
}: {
  amount: number | null;
  categoryName: string;
  frequency: RecurringFrequency | '';
  monthlyEquivalent: number | null;
  paymentMethod: RecurringPaymentMethod;
  rtlLayout: boolean;
}) {
  return (
    <SolidCard style={styles.previewCard}>
      <AppText style={rtlLayout ? styles.rtlSectionLabel : undefined} variant="sectionTitle">معاينة المصروف</AppText>
      <View style={styles.previewRows}>
        <PreviewItem label="التصنيف" rtlLayout={rtlLayout} value={categoryName} />
        <PreviewItem label="المبلغ" rtlLayout={rtlLayout} value={amount === null ? 'غير محدد' : formatSar(amount)} />
        <PreviewItem label="التكرار" rtlLayout={rtlLayout} value={frequency ? formatFrequencyLabel(frequency) : 'غير محدد'} />
        <PreviewItem label="طريقة الدفع" rtlLayout={rtlLayout} value={formatPaymentMethodLabel(paymentMethod)} />
        <PreviewItem
          label="الأثر الشهري التقريبي"
          rtlLayout={rtlLayout}
          value={monthlyEquivalent === null ? 'غير محدد' : formatSar(monthlyEquivalent)}
        />
      </View>
    </SolidCard>
  );
}

function PreviewItem({ label, value, rtlLayout }: { label: string; value: string; rtlLayout: boolean }) {
  return (
    <View style={[styles.previewItem, rtlLayout && styles.physicalRtlRow]}>
      <AppText style={rtlLayout ? styles.rtlPreviewLabel : undefined} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.previewValue} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function createInitialValues(expense?: RecurringExpense): RecurringExpenseFormValues {
  return {
    name: expense?.name ?? '',
    vendor: expense?.vendor ?? '',
    description: expense?.description ?? '',
    categoryId: expense?.categoryId ?? '',
    amount: expense ? String(expense.amount) : '',
    frequency: expense?.frequency ?? '',
    customIntervalValue: expense?.customInterval ? String(expense.customInterval.value) : '1',
    customIntervalUnit: expense?.customInterval?.unit ?? 'months',
    startDate: expense?.startDate ?? prototypeToday,
    nextDueDate: expense?.nextDueDate ?? '',
    endDate: expense?.endDate ?? '',
    renewalMode: expense?.renewalMode ?? 'manual',
    paymentMethod: expense?.paymentMethod ?? 'company-card',
    accountId: expense?.accountId ?? '',
    reference: expense?.reference ?? '',
    owner: expense?.owner ?? '',
    reminderDays: expense?.reminderDays ? String(expense.reminderDays) : '',
    needsReview: expense?.needsReview ?? false,
    monthlySavingOpportunity: expense?.monthlySavingOpportunity ? String(expense.monthlySavingOpportunity) : '',
    notes: expense?.notes ?? '',
  };
}

function buildCustomInterval(values: RecurringExpenseFormValues): CustomRecurringInterval | undefined {
  if (values.frequency !== 'custom') {
    return undefined;
  }

  return {
    unit: values.customIntervalUnit,
    value: Math.max(1, Number(values.customIntervalValue) || 1),
  };
}

function validate(values: RecurringExpenseFormValues) {
  const errors: FormErrors = {};
  const amount = parseAmount(values.amount);
  const saving = parseAmount(values.monthlySavingOpportunity);
  const customIntervalValue = values.customIntervalValue.trim();

  if (!values.name.trim()) {
    errors.name = 'يرجى إدخال اسم المصروف';
  }

  if (!values.vendor.trim()) {
    errors.vendor = 'يرجى إدخال اسم المورد';
  }

  if (!values.categoryId) {
    errors.categoryId = 'يرجى اختيار التصنيف';
  }

  if (!values.amount.trim()) {
    errors.amount = 'المبلغ مطلوب';
  } else if (amount === null || amount <= 0) {
    errors.amount = 'أدخل مبلغًا صحيحًا أكبر من صفر';
  }

  if (!values.frequency) {
    errors.frequency = 'يرجى اختيار التكرار';
  }

  if (values.frequency === 'custom' && (!customIntervalValue || Number(customIntervalValue) <= 0)) {
    errors.customIntervalValue = 'أدخل فترة مخصصة صحيحة';
  }

  if (values.startDate && !parseIsoDate(values.startDate)) {
    errors.startDate = 'اختر تاريخ بداية صحيح';
  }

  if (!values.nextDueDate.trim()) {
    errors.nextDueDate = 'موعد الاستحقاق القادم مطلوب';
  } else if (!parseIsoDate(values.nextDueDate)) {
    errors.nextDueDate = 'اختر موعد استحقاق صحيح';
  }

  if (values.endDate && !parseIsoDate(values.endDate)) {
    errors.endDate = 'اختر تاريخ نهاية صحيح';
  } else if (values.endDate && values.startDate && compareIsoDates(values.endDate, values.startDate) !== 1) {
    errors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
  }

  if (values.monthlySavingOpportunity.trim() && (saving === null || saving < 0)) {
    errors.monthlySavingOpportunity = 'قيمة التوفير لا يمكن أن تكون سالبة';
  }

  return errors;
}

function getDatePickerTitle(field: DateFieldKey) {
  const labels: Record<DateFieldKey, string> = {
    startDate: 'تاريخ البداية',
    nextDueDate: 'الاستحقاق القادم',
    endDate: 'تاريخ النهاية',
  };

  return labels[field];
}

function formatDisplayDateForOption(value: string) {
  return formatDateInputValue(value, value);
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
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  missingWrap: {
    flex: 1,
    gap: spacing.xl,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    minHeight: 72,
  },
  addHeader: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    minHeight: 72,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    ...Platform.select({ android: { left: 0 }, default: { right: 0 } }),
    top: 0,
    width: 42,
  },
  addBackButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    alignItems: 'stretch',
    ...Platform.select({ android: { alignSelf: 'stretch' } }),
    gap: spacing.xs,
    paddingHorizontal: 52,
    minWidth: 0,
  },
  addHeaderCopy: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  addHeaderText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#061726',
    borderColor: 'rgba(54,154,255,0.24)',
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 23,
  },
  fieldWrap: {
    gap: spacing.sm,
  },
  physicalLtrRow: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  physicalRtlRow: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  physicalRtlWrap: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rtlFieldLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSectionLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  optionalBadge: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  dateValue: {
    flex: 1,
    writingDirection: 'rtl',
  },
  rtlDateValue: {
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  placeholderText: {
    color: colors.text.tertiary,
  },
  inputSuffix: {
    minWidth: 42,
  },
  textArea: {
    alignItems: 'flex-start',
    minHeight: 92,
    paddingVertical: spacing.sm,
  },
  textAreaInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  twoColumn: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  compactSelect: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  selectTextActive: {
    color: colors.text.primary,
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  rtlSwitchLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewCard: {
    gap: spacing.md,
  },
  previewRows: {
    gap: spacing.sm,
  },
  previewItem: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  rtlPreviewLabel: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewValue: {
    color: colors.text.primary,
    writingDirection: 'ltr',
  },
  pickerRoot: {
    flex: 1,
    justifyContent: 'flex-end',
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
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  pickerHandle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 34,
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rtlPickerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  clearDateButton: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rtlPickerOptionRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  pickerOptions: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  pickerOptionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  pickerOptionText: {
    flex: 1,
  },
  rtlPickerOptionText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
