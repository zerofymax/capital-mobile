import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';
import {
  AmountField,
  BudgetHeader,
  categoryIdToName,
  categoryNameToId,
  createPreviewBudget,
  NoticeBanner,
  PickerSheet,
  SelectField,
  SummaryMiniCard,
  ThresholdSelector,
  ToggleRow,
} from './components';
import { addBudget, findDuplicateBudget } from './budgets-store';
import { formatBudgetInput, parseBudgetAmount } from './budget-utils';
import { budgetCategories, budgetMonths, type BudgetCategoryId } from './budgets-data';

type PickerType = 'category' | 'month' | null;

type BudgetFormErrors = {
  categoryId?: string;
  budget?: string;
  duplicate?: string;
};

export function AddBudgetScreen() {
  const insets = useSafeAreaInsets();
  const [categoryId, setCategoryId] = useState<BudgetCategoryId | null>('marketing');
  const [amount, setAmount] = useState('5000');
  const [month, setMonth] = useState('يوليو 2026');
  const [threshold, setThreshold] = useState(80);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(
    () => validateBudgetForm({ amount, categoryId, month }),
    [amount, categoryId, month],
  );
  const blockingError = Boolean(errors.categoryId || errors.budget || errors.duplicate);
  const parsedAmount = parseBudgetAmount(amount) ?? 0;
  const previewBudget = categoryId ? createPreviewBudget(categoryId, Math.max(parsedAmount, 0), month, threshold, alertEnabled) : null;
  const amountError = errors.budget && (submitted || amount !== '5000') ? errors.budget : errors.duplicate;

  function handleSave() {
    setSubmitted(true);

    if (blockingError || !categoryId || parsedAmount <= 0) {
      return;
    }

    addBudget({
      categoryId,
      budget: parsedAmount,
      month,
      alertThreshold: threshold,
      alertEnabled,
    });
    router.replace(routes.budgets);
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
              paddingTop: Math.max(insets.top + spacing.sm, 48),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BudgetHeader onBack={() => router.back()} subtitle="حدد حد الإنفاق لفئة خلال شهر معين" title="إضافة ميزانية" />

          <NoticeBanner message="الميزانية تحدد حد الإنفاق المتوقع، ولا تسجل عملية مالية جديدة." tone="warning" />

          <SelectField
            error={submitted ? errors.categoryId : undefined}
            label="الفئة"
            onPress={() => setPicker('category')}
            value={categoryIdToName(categoryId)}
          />
          <AmountField
            error={amountError}
            label="مبلغ الميزانية"
            onChangeText={(value) => setAmount(formatBudgetInput(value))}
            value={amount}
          />
          <AppText tone="secondary" variant="caption">
            الحد الأقصى المخطط للإنفاق على هذه الفئة
          </AppText>

          <SelectField iconName="calendar-outline" label="الشهر" onPress={() => setPicker('month')} value={month} />

          <View style={styles.section}>
            <AppText variant="cardTitle">تنبيه الاقتراب من الحد</AppText>
            <AppText tone="secondary" variant="supporting">
              ينبّه عند وصول الإنفاق إلى نسبة محددة من الميزانية.
            </AppText>
            <ThresholdSelector onChange={setThreshold} value={threshold} />
          </View>

          <ToggleRow enabled={alertEnabled} onValueChange={setAlertEnabled} />

          <View style={styles.section}>
            <AppText variant="cardTitle">معاينة الميزانية</AppText>
            {previewBudget ? <SummaryMiniCard budget={previewBudget} /> : null}
          </View>

          <AppButton disabled={blockingError} iconName="checkmark-outline" onPress={handleSave}>
            حفظ الميزانية
          </AppButton>
          <AppButton onPress={() => router.back()} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setCategoryId(categoryNameToId(value));
          setPicker(null);
        }}
        options={budgetCategories.map((category) => category.name)}
        selectedValue={categoryIdToName(categoryId)}
        title="اختر الفئة"
        visible={picker === 'category'}
      />
      <PickerSheet
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setMonth(value);
          setPicker(null);
        }}
        options={budgetMonths}
        selectedValue={month}
        title="اختر الشهر"
        visible={picker === 'month'}
      />
    </View>
  );
}

function validateBudgetForm({ categoryId, amount, month }: { categoryId: BudgetCategoryId | null; amount: string; month: string }) {
  const errors: BudgetFormErrors = {};
  const parsedAmount = parseBudgetAmount(amount);

  if (!categoryId) {
    errors.categoryId = 'يرجى اختيار فئة';
  }

  if (!amount.trim()) {
    errors.budget = 'يرجى إدخال مبلغ الميزانية';
  } else if (parsedAmount === null || parsedAmount <= 0) {
    errors.budget = 'أدخل مبلغًا أكبر من صفر';
  }

  if (categoryId && findDuplicateBudget(categoryId, month)) {
    errors.duplicate = 'توجد ميزانية لهذه الفئة في الشهر المحدد';
  }

  return errors;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
});
