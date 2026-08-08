import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountInputCard,
  CategoryPicker,
  TransactionTypeSelector,
  UnsavedChangesModal,
} from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import {
  createTransaction,
  getTransactionCategoriesForType,
  normalizeAmountInput,
  parseAmountInput,
  updateTransaction,
  useTransactionsStore,
  type TransactionDraft,
  type TransactionRecord,
  type TransactionType,
} from '@/screens/ledger/ledger-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';

type AddTransactionScreenProps = {
  initialType?: TransactionType;
};

type TransactionFormValues = {
  transactionType: TransactionType;
  amount: string;
  categoryId: string;
  transactionDate: string;
  description: string;
  note: string;
};

type TransactionFormErrors = Partial<Record<keyof TransactionFormValues, string>>;

function normalizeRequestedType(type?: string | string[], fallback: TransactionType = 'expense') {
  const value = Array.isArray(type) ? type[0] : type;

  if (value === 'income' || value === 'expense') {
    return value;
  }

  return fallback;
}

function getInitialValues(transaction: TransactionRecord | null, fallbackType: TransactionType, todayIso: string): TransactionFormValues {
  if (transaction) {
    return {
      transactionType: transaction.type,
      amount: String(transaction.amount),
      categoryId: transaction.categoryId,
      transactionDate: transaction.transactionDate,
      description: transaction.description,
      note: transaction.note,
    };
  }

  return {
    transactionType: fallbackType,
    amount: '',
    categoryId: '',
    transactionDate: todayIso,
    description: '',
    note: '',
  };
}

export function AddTransactionScreen({ initialType }: AddTransactionScreenProps) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string; transactionId?: string; type?: string }>();
  const { transactions } = useTransactionsStore();
  const editing = params.mode === 'edit';
  const requestedType = normalizeRequestedType(params.type, initialType ?? 'expense');
  const transaction = editing ? transactions.find((item) => item.id === params.transactionId) ?? null : null;
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const yesterdayIso = useMemo(() => offsetIsoDate(todayIso, -1), [todayIso]);
  const initialValues = useMemo(
    () => getInitialValues(transaction, requestedType, todayIso),
    [requestedType, todayIso, transaction],
  );
  const [transactionType, setTransactionType] = useState<TransactionType>(initialValues.transactionType);
  const [amount, setAmount] = useState(initialValues.amount);
  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [transactionDate, setTransactionDate] = useState(initialValues.transactionDate);
  const [description, setDescription] = useState(initialValues.description);
  const [note, setNote] = useState(initialValues.note);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const savedRef = useRef(false);

  const categories = useMemo(() => getTransactionCategoriesForType(transactionType), [transactionType]);
  const validCategoryIds = useMemo(() => categories.map((category) => category.id), [categories]);
  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const currentValues = useMemo<TransactionFormValues>(
    () => ({
      transactionType,
      amount,
      categoryId,
      transactionDate,
      description,
      note,
    }),
    [amount, categoryId, description, note, transactionDate, transactionType],
  );
  const isDirty = useMemo(() => !formValuesAreEqual(currentValues, initialValues), [currentValues, initialValues]);
  const validation = useMemo(() => validateForm(currentValues, validCategoryIds), [currentValues, validCategoryIds]);
  const isSaveDisabled = saving || Object.keys(validation).length > 0 || (editing && !isDirty);
  const incomeRtlLayout = Platform.OS === 'android' && !editing;
  const editRtlLayout = Platform.OS === 'android' && editing;
  const formRtlLayout = incomeRtlLayout || editRtlLayout;

  const requestNavigation = useCallback(
    (action: () => void) => {
      if (isDirty && !savedRef.current) {
        pendingNavigationRef.current = action;
        setUnsavedModalVisible(true);
        return;
      }

      action();
    },
    [isDirty],
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!isDirty || savedRef.current) {
          return false;
        }

        requestNavigation(() => router.back());
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, [isDirty, requestNavigation]),
  );

  function handleTypeChange(value: TransactionType) {
    Haptics.selectionAsync().catch(() => null);
    setTransactionType(value);
    setErrors({});

    const nextCategories = getTransactionCategoriesForType(value);
    if (!nextCategories.some((category) => category.id === categoryId)) {
      setCategoryId('');
    }
  }

  function handleCategorySelect(name: string) {
    const category = categories.find((item) => item.name === name);

    if (!category) {
      return;
    }

    setCategoryId(category.id);
    setErrors((current) => ({ ...current, categoryId: undefined }));
  }

  function handleDateSelect(value: string) {
    if (!isValidIsoDate(value)) {
      return;
    }

    setTransactionDate(value);
    setErrors((current) => ({ ...current, transactionDate: undefined }));
    setDatePickerVisible(false);
  }

  function handleDiscardChanges() {
    const action = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setUnsavedModalVisible(false);
    action?.();
  }

  function handleContinueEditing() {
    pendingNavigationRef.current = null;
    setUnsavedModalVisible(false);
  }

  function handleSave() {
    if (saving) {
      return;
    }

    const nextErrors = validateForm(currentValues, validCategoryIds);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    const draft: TransactionDraft = {
      type: transactionType,
      amount: parseAmountInput(amount) ?? 0,
      categoryId,
      description: description.trim().replace(/\s+/g, ' '),
      note: note.trim(),
      transactionDate,
    };

    savedRef.current = true;

    if (editing && transaction) {
      updateTransaction(transaction.id, draft);
      router.back();
    } else {
      createTransaction(draft);
      router.replace(routes.ledger);
    }
  }

  if (editing && !transaction) {
    return <MissingTransactionState onBack={() => router.replace(routes.ledger)} />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xl),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader
          editRtlLayout={editRtlLayout}
          incomeRtlLayout={incomeRtlLayout}
          onClose={() => requestNavigation(() => router.back())}
          title={editing ? 'تعديل العملية' : transactionType === 'income' ? 'إضافة دخل' : 'إضافة مصروف'}
        />

        <TransactionTypeSelector physicalRtlLayout={editRtlLayout} onChange={handleTypeChange} value={transactionType} />

        <AmountInputCard
          alignLabelRight={formRtlLayout}
          currencyLabel={editRtlLayout ? 'ر.س' : undefined}
          displayValue={editRtlLayout ? formatAmountInputValue(amount) : undefined}
          error={errors.amount}
          onChangeText={(value) => {
            setAmount(normalizeAmountInput(value));
            setErrors((current) => ({ ...current, amount: undefined }));
          }}
          physicalLtrLayout={editRtlLayout}
          value={amount}
        />

        <CategoryPicker
          alignTitleRight={formRtlLayout}
          error={errors.categoryId}
          onSelect={handleCategorySelect}
          options={categoryOptions}
          selectedValue={selectedCategory?.name ?? ''}
          title="التصنيف"
        />

        <TransactionDateField
          editRtlLayout={editRtlLayout}
          error={errors.transactionDate}
          incomeRtlLayout={incomeRtlLayout}
          onPress={() => setDatePickerVisible(true)}
          value={formatTransactionDateLabel(transactionDate, todayIso, yesterdayIso)}
        />

        <TextField
          error={errors.description}
          alignLabelRight={formRtlLayout}
          label="الوصف"
          onChangeText={(value) => {
            setDescription(value);
            setErrors((current) => ({ ...current, description: undefined }));
          }}
          placeholder={transactionType === 'income' ? 'مثال: اشتراك عميل جديد' : 'مثال: شراء أدوات مكتبية'}
          value={description}
        />

        <NotesField
          onChangeText={(value) => {
            setNote(value.slice(0, 300));
            setErrors((current) => ({ ...current, note: undefined }));
          }}
          rtlLayout={editRtlLayout}
          value={note}
        />

        {errors.note ? (
          <AppText tone="danger" variant="caption">
            {errors.note}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <AppButton disabled={isSaveDisabled} loading={saving} onPress={handleSave}>
            {editing ? 'حفظ التعديلات' : transactionType === 'income' ? 'حفظ الدخل' : 'حفظ المصروف'}
          </AppButton>
          <AppButton onPress={() => requestNavigation(() => router.back())} variant="secondary">
            إلغاء
          </AppButton>
        </View>
      </ScrollView>
      <UnsavedChangesModal
        onContinueEditing={handleContinueEditing}
        onDiscardChanges={handleDiscardChanges}
        visible={unsavedModalVisible}
      />
      {datePickerVisible ? (
        <TransactionDateSheet
          incomeRtlLayout={incomeRtlLayout}
          onClose={() => setDatePickerVisible(false)}
          onSelect={handleDateSelect}
          selectedValue={transactionDate}
          todayIso={todayIso}
          visible={datePickerVisible}
          yesterdayIso={yesterdayIso}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function validateForm(values: TransactionFormValues, validCategoryIds: readonly string[]) {
  const errors: TransactionFormErrors = {};
  const parsedAmount = parseAmountInput(values.amount);
  const normalizedDescription = values.description.trim().replace(/\s+/g, ' ');

  if (!values.amount.trim()) {
    errors.amount = 'المبلغ مطلوب.';
  } else if (!parsedAmount) {
    errors.amount = values.amount.trim() === '0' ? 'أدخل مبلغًا أكبر من صفر.' : 'أدخل مبلغًا صحيحًا.';
  }

  if (!values.categoryId) {
    errors.categoryId = 'اختر تصنيف العملية.';
  } else if (!validCategoryIds.includes(values.categoryId)) {
    errors.categoryId = 'اختر تصنيفًا مناسبًا لنوع العملية.';
  }

  if (!values.transactionDate) {
    errors.transactionDate = 'اختر تاريخ العملية.';
  } else if (!isValidIsoDate(values.transactionDate)) {
    errors.transactionDate = 'اختر تاريخًا صحيحًا.';
  }

  if (!normalizedDescription) {
    errors.description = 'الوصف مطلوب.';
  } else if (normalizedDescription.length < 2) {
    errors.description = 'الوصف يجب أن يكون من حرفين على الأقل.';
  } else if (normalizedDescription.length > 100) {
    errors.description = 'الوصف يجب ألا يتجاوز 100 حرف.';
  }

  if (values.note.length > 300) {
    errors.note = 'الملاحظة يجب ألا تتجاوز 300 حرف.';
  }

  return errors;
}

function normalizeFormForDirty(values: TransactionFormValues) {
  return {
    transactionType: values.transactionType,
    amount: parseAmountInput(values.amount) ?? null,
    categoryId: values.categoryId,
    transactionDate: values.transactionDate,
    description: values.description.trim().replace(/\s+/g, ' '),
    note: values.note.trim(),
  };
}

function formValuesAreEqual(first: TransactionFormValues, second: TransactionFormValues) {
  return JSON.stringify(normalizeFormForDirty(first)) === JSON.stringify(normalizeFormForDirty(second));
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parts = value.split('-');

  if (parts.length !== 3) {
    return null;
  }

  const yearValue = Number(parts[0]);
  const monthValue = Number(parts[1]);
  const dayValue = Number(parts[2]);
  const date = new Date(yearValue, monthValue - 1, dayValue);

  if (
    date.getFullYear() !== yearValue ||
    date.getMonth() !== monthValue - 1 ||
    date.getDate() !== dayValue
  ) {
    return null;
  }

  return date;
}

function isValidIsoDate(value: string) {
  return parseIsoDate(value) !== null;
}

function offsetIsoDate(value: string, offsetDays: number) {
  const date = parseIsoDate(value) ?? new Date();
  date.setDate(date.getDate() + offsetDays);

  return formatIsoDate(date);
}

function formatArabicDate(value: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return 'تاريخ غير محدد';
  }

  return new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTransactionDateLabel(value: string, todayIso: string, yesterdayIso: string) {
  if (value === todayIso) {
    return `اليوم، ${formatArabicDate(value)}`;
  }

  if (value === yesterdayIso) {
    return `أمس، ${formatArabicDate(value)}`;
  }

  return formatArabicDate(value);
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('ar-SA', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysCount }, (_, index) => formatIsoDate(new Date(year, month, index + 1)));
}

function formatAmountInputValue(value: string) {
  const [integerPart = '', decimalPart] = value.split('.');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart === undefined ? groupedInteger : `${groupedInteger}.${decimalPart}`;
}

function TransactionDateField({
  value,
  error,
  incomeRtlLayout,
  editRtlLayout,
  onPress,
}: {
  value: string;
  error?: string;
  incomeRtlLayout: boolean;
  editRtlLayout: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldRoot}>
      {incomeRtlLayout || editRtlLayout ? (
        <View style={styles.rtlLabelWrapper}>
          <AppText style={styles.rtlLabel} variant="sectionTitle">تاريخ العملية</AppText>
        </View>
      ) : (
        <AppText variant="sectionTitle">تاريخ العملية</AppText>
      )}
      <Pressable
        accessibilityLabel={`تاريخ العملية ${value}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.dateField,
          (incomeRtlLayout || editRtlLayout) && styles.physicalLtrRow,
          error && styles.inputError,
          pressed && styles.pressed,
        ]}
      >
        {incomeRtlLayout ? (
          <>
            <Feather color={colors.text.tertiary} name="chevron-left" size={17} />
            <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={19} />
            <AppText numberOfLines={1} style={styles.dateValue} variant="body">
              {directionSafeText(value)}
            </AppText>
          </>
        ) : editRtlLayout ? (
          <>
            <Feather color={colors.text.tertiary} name="chevron-left" size={17} />
            <AppText numberOfLines={1} style={styles.dateValue} variant="body">
              {directionSafeText(value)}
            </AppText>
            <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={19} />
          </>
        ) : (
          <>
            <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={19} />
            <AppText numberOfLines={1} style={styles.dateValue} variant="body">
              {directionSafeText(value)}
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

function TransactionDateSheet({
  visible,
  selectedValue,
  todayIso,
  yesterdayIso,
  incomeRtlLayout,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedValue: string;
  todayIso: string;
  yesterdayIso: string;
  incomeRtlLayout: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [fullPickerVisible, setFullPickerVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseIsoDate(selectedValue) ?? parseIsoDate(todayIso) ?? new Date());
  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.dateSheetRoot}>
        <Pressable accessibilityLabel="إغلاق اختيار التاريخ" onPress={onClose} style={styles.dateSheetBackdrop} />
        <View style={[styles.dateSheet, { paddingBottom: Math.max(insets.bottom + spacing.xxl, 56) }]}>
          <View style={styles.dateSheetHandle} />
          <View style={[styles.dateSheetHeader, incomeRtlLayout && styles.physicalLtrRow]}>
            {incomeRtlLayout ? (
              <>
                <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
                  <AppText tone="link" variant="supporting">
                    إلغاء
                  </AppText>
                </Pressable>
                <View style={styles.dateSheetTitleWrapper}>
                  <AppText style={styles.dateSheetTitle} variant="sectionTitle">
                    تاريخ العملية
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <AppText style={styles.dateSheetTitle} variant="sectionTitle">
                  تاريخ العملية
                </AppText>
                <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
                  <AppText tone="link" variant="supporting">
                    إلغاء
                  </AppText>
                </Pressable>
              </>
            )}
          </View>

          {!fullPickerVisible ? (
            <View style={styles.quickDateOptions}>
              <DateSheetOption
                incomeRtlLayout={incomeRtlLayout}
                label="اليوم"
                onPress={() => onSelect(todayIso)}
                selected={selectedValue === todayIso}
                value={formatArabicDate(todayIso)}
              />
              <DateSheetOption
                incomeRtlLayout={incomeRtlLayout}
                label="أمس"
                onPress={() => onSelect(yesterdayIso)}
                selected={selectedValue === yesterdayIso}
                value={formatArabicDate(yesterdayIso)}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setFullPickerVisible(true)}
                style={({ pressed }) => [
                  styles.otherDateButton,
                  incomeRtlLayout && styles.physicalLtrRow,
                  pressed && styles.pressed,
                ]}
              >
                {incomeRtlLayout ? (
                  <>
                    <Feather color={colors.text.tertiary} name="chevron-left" size={17} />
                    <Ionicons color={colors.brand.calmGreen} name="calendar-number-outline" size={18} />
                    <AppText style={[styles.otherDateText, styles.rtlRowText]} variant="body">
                      اختيار تاريخ آخر
                    </AppText>
                  </>
                ) : (
                  <>
                    <Ionicons color={colors.brand.calmGreen} name="calendar-number-outline" size={18} />
                    <AppText style={styles.otherDateText} variant="body">
                      اختيار تاريخ آخر
                    </AppText>
                    <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.monthPicker}>
              <View style={styles.monthHeader}>
                <Pressable accessibilityLabel="الشهر السابق" accessibilityRole="button" hitSlop={10} onPress={() => moveMonth(-1)}>
                  <Ionicons color={colors.text.secondary} name="chevron-forward-outline" size={20} />
                </Pressable>
                <AppText align="center" style={styles.monthTitle} variant="cardTitle">
                  {getMonthLabel(visibleMonth)}
                </AppText>
                <Pressable accessibilityLabel="الشهر التالي" accessibilityRole="button" hitSlop={10} onPress={() => moveMonth(1)}>
                  <Ionicons color={colors.text.secondary} name="chevron-back-outline" size={20} />
                </Pressable>
              </View>

              <View style={styles.monthGrid}>
                {monthDays.map((dayIso) => {
                  const selected = selectedValue === dayIso;
                  const dayNumber = parseIsoDate(dayIso)?.getDate() ?? '';

                  return (
                    <Pressable
                      accessibilityLabel={formatArabicDate(dayIso)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={dayIso}
                      onPress={() => onSelect(dayIso)}
                      style={({ pressed }) => [styles.dayButton, selected && styles.dayButtonSelected, pressed && styles.pressed]}
                    >
                      <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="supporting">
                        {String(dayNumber)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function DateSheetOption({
  label,
  value,
  selected,
  incomeRtlLayout,
  onPress,
}: {
  label: string;
  value: string;
  selected: boolean;
  incomeRtlLayout: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dateOption,
        incomeRtlLayout && styles.physicalLtrRow,
        selected && styles.dateOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
      <View style={styles.dateOptionCopy}>
        <AppText style={incomeRtlLayout ? styles.rtlLabel : undefined} variant="body">{label}</AppText>
        <AppText style={[styles.dateOptionValue, incomeRtlLayout && styles.rtlLabel]} tone="secondary" variant="caption">
          {directionSafeText(value)}
        </AppText>
      </View>
    </Pressable>
  );
}

function MissingTransactionState({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.missingContent}>
        <SolidCard style={styles.missingCard}>
          <Ionicons color={colors.text.tertiary} name="alert-circle-outline" size={34} />
          <AppText align="center" variant="sectionTitle">
            تعذر العثور على العملية
          </AppText>
          <AppText align="center" tone="secondary" variant="body">
            قد تكون العملية حُذفت أو أن الرابط غير صالح.
          </AppText>
          <AppButton onPress={onBack}>العودة إلى العمليات</AppButton>
        </SolidCard>
      </View>
    </View>
  );
}

function ModalHeader({
  title,
  incomeRtlLayout,
  editRtlLayout,
  onClose,
}: {
  title: string;
  incomeRtlLayout: boolean;
  editRtlLayout: boolean;
  onClose: () => void;
}) {
  const rtlLayout = incomeRtlLayout || editRtlLayout;

  return (
    <View style={[styles.header, rtlLayout && styles.physicalLtrRow]}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        {rtlLayout ? (
          <Feather color={colors.text.muted} name="chevron-left" size={22} />
        ) : (
          <Ionicons color={colors.text.muted} name="arrow-forward-outline" size={22} />
        )}
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      {!rtlLayout ? <View style={styles.headerSlot} /> : null}
    </View>
  );
}

function TextField({
  label,
  value,
  error,
  alignLabelRight = false,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  alignLabelRight?: boolean;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldRoot}>
      {alignLabelRight ? (
        <View style={styles.rtlLabelWrapper}>
          <AppText style={styles.rtlLabel} variant="sectionTitle">{label}</AppText>
        </View>
      ) : (
        <AppText variant="sectionTitle">{label}</AppText>
      )}
      <SolidCard style={[styles.inputCard, error && styles.inputError]}>
        <TextInput
          maxLength={100}
          onChangeText={onChangeText}
          placeholder={placeholder}
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

function NotesField({ value, rtlLayout, onChangeText }: { value: string; rtlLayout: boolean; onChangeText: (value: string) => void }) {
  const remaining = 300 - value.length;

  return (
    <View style={styles.fieldRoot}>
      <View style={[styles.labelRow, rtlLayout && styles.physicalLtrRow]}>
        {rtlLayout ? (
          <>
            <AppText style={styles.noteCounter} tone={remaining < 30 ? 'warning' : 'tertiary'} variant="caption">
              {directionSafeText(`${remaining} حرف متبقٍ`)}
            </AppText>
            <AppText style={styles.noteLabel} variant="sectionTitle">الملاحظة</AppText>
          </>
        ) : (
          <>
            <AppText variant="sectionTitle">الملاحظة</AppText>
            <AppText tone={remaining < 30 ? 'warning' : 'tertiary'} variant="caption">
              {directionSafeText(`${remaining} حرف متبقٍ`)}
            </AppText>
          </>
        )}
      </View>
      <SolidCard style={styles.notesCard}>
        <TextInput
          maxLength={300}
          multiline
          onChangeText={onChangeText}
          placeholder="أضف ملاحظة اختيارية"
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
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  physicalLtrRow: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  closeButton: {
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
  fieldRoot: {
    gap: spacing.sm,
  },
  rtlLabelWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  rtlLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rtlRowText: {
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputCard: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  dateValue: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  noteCounter: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  noteLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  missingContent: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  missingCard: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  dateSheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateSheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  dateSheet: {
    backgroundColor: colors.background.elevated,
    borderColor: colors.surface.border,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dateSheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.pill,
    height: 4,
    width: 36,
  },
  dateSheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateSheetTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  dateSheetTitleWrapper: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  quickDateOptions: {
    gap: spacing.sm,
  },
  dateOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateOptionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.42)',
  },
  dateOptionCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  dateOptionValue: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  otherDateButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
  },
  otherDateText: {
    flex: 1,
    textAlign: 'right',
  },
  monthPicker: {
    gap: spacing.md,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthTitle: {
    flex: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  dayButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dayButtonSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: colors.brand.green,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
