import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  AmountField,
  BottomConfirmSheet,
  BudgetHeader,
  BudgetProgressBar,
  BudgetStatusBadge,
  categoryIdToName,
  categoryNameToId,
  NoticeBanner,
  PickerSheet,
  SelectField,
  ThresholdSelector,
  ToggleRow,
} from './components';
import { findDuplicateBudget, updateBudget, useBudgetsStore } from './budgets-store';
import { formatBudgetInput, getEditBudgetStatus, parseBudgetAmount, toneColors } from './budget-utils';
import { budgetCategories, budgetMonths, initialBudgets, type Budget, type BudgetCategoryId } from './budgets-data';

type PickerType = 'category' | 'month' | null;

type BudgetFormErrors = {
  categoryId?: string;
  budget?: string;
  duplicate?: string;
};

export function EditBudgetScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { budgets } = useBudgetsStore();
  const original = budgets.find((item) => item.id === params.id) ?? budgets[0] ?? initialBudgets[0]!;
  const [categoryId, setCategoryId] = useState<BudgetCategoryId | null>(original.categoryId);
  const [amount, setAmount] = useState(String(original.budget));
  const [month, setMonth] = useState(original.month);
  const [threshold, setThreshold] = useState(original.alertThreshold);
  const [alertEnabled, setAlertEnabled] = useState(original.alertEnabled);
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);

  const parsedAmount = parseBudgetAmount(amount) ?? 0;
  const dirty =
    categoryId !== original.categoryId ||
    parsedAmount !== original.budget ||
    month !== original.month ||
    threshold !== original.alertThreshold ||
    alertEnabled !== original.alertEnabled;
  const errors = useMemo(
    () => validateBudgetForm({ amount, categoryId, month, excludeId: original.id }),
    [amount, categoryId, month, original.id],
  );
  const blockingError = Boolean(errors.categoryId || errors.budget || errors.duplicate);
  const warning =
    parsedAmount > 0 && parsedAmount < original.spent
      ? `المبلغ الجديد أقل من المصروف الحالي بمقدار ${(original.spent - parsedAmount).toLocaleString('en-US')} ر.س، وستظهر الميزانية كمتجاوزة.`
      : undefined;
  const selectedCategoryIcon = budgetCategories.find((category) => category.id === categoryId)?.icon;

  function handleBack() {
    if (dirty) {
      setDiscardVisible(true);
      return;
    }

    router.back();
  }

  function handleSave() {
    setSubmitted(true);

    if (!dirty || blockingError || !categoryId || parsedAmount <= 0) {
      return;
    }

    updateBudget(original.id, {
      categoryId,
      budget: parsedAmount,
      month,
      alertThreshold: threshold,
      alertEnabled,
    });
    router.replace({ pathname: routes.budgetDetails, params: { id: original.id } });
  }

  const previewBudget: Budget = {
    ...original,
    categoryId: categoryId ?? original.categoryId,
    budget: Math.max(parsedAmount, 0),
    month,
    alertThreshold: threshold,
    alertEnabled,
  };
  const currentSpendTitle = (
    <AppText style={Platform.OS !== 'web' ? styles.currentSpendTextAndroid : undefined} tone="secondary" variant="caption">
      المصروف الحالي
    </AppText>
  );
  const currentSpendAmount = (
    <AppText align="left" style={styles.currentSpendAmount} variant="cardTitle">
      {directionSafeText(`${original.spent.toLocaleString('en-US')} ر.س`)}
    </AppText>
  );
  const currentSpendDescription = (
    <AppText style={Platform.OS !== 'web' ? styles.currentSpendTextAndroid : undefined} tone="secondary" variant="supporting">
      تعديل الميزانية لن يغيّر المصروفات المسجلة مسبقًا.
    </AppText>
  );

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
              paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top + spacing.sm, 48),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BudgetHeader onBack={handleBack} subtitle={`عدّل إعدادات ميزانية ${categoryIdToName(original.categoryId)}`} title="تعديل الميزانية" />

          {dirty ? <NoticeBanner message="لديك تغييرات غير محفوظة" tone="warning" /> : null}

          <SolidCard style={[styles.currentSpendCard, Platform.OS !== 'web' && styles.currentSpendCardAndroid]}>
            {Platform.OS !== 'web' ? (
              <>
                <View style={styles.currentSpendIcon} />
                <View style={styles.currentSpendAmountSlotAndroid}>{currentSpendAmount}</View>
                <View style={[styles.currentSpendCopy, styles.currentSpendCopyAndroid]}>
                  {currentSpendTitle}
                  {currentSpendDescription}
                </View>
              </>
            ) : (
              <>
                <View style={styles.currentSpendIcon} />
                <View style={styles.currentSpendCopy}>
                  {currentSpendTitle}
                  {currentSpendAmount}
                  {currentSpendDescription}
                </View>
              </>
            )}
          </SolidCard>

          <SelectField
            androidRtlLayout
            error={submitted ? errors.categoryId : undefined}
            iconName={selectedCategoryIcon}
            label="الفئة"
            onPress={() => setPicker('category')}
            value={categoryIdToName(categoryId)}
          />
          <AmountField
            error={submitted || amount !== String(original.budget) ? errors.budget || errors.duplicate : undefined}
            label="مبلغ الميزانية"
            onChangeText={(value) => setAmount(formatBudgetInput(value))}
            value={amount}
            warning={warning}
          />
          <AppText style={Platform.OS !== 'web' ? styles.supportingTextAndroid : undefined} tone="secondary" variant="caption">
            {directionSafeText(`المصروف الحالي لهذه الفئة هو ${original.spent.toLocaleString('en-US')} ر.س`)}
          </AppText>

          <SelectField androidRtlLayout iconName="calendar-outline" label="الشهر" onPress={() => setPicker('month')} value={month} />

          <View style={styles.section}>
            <AppText style={Platform.OS !== 'web' ? styles.sectionTextAndroid : undefined} variant="cardTitle">
              تنبيه الاقتراب من الحد
            </AppText>
            <AppText style={Platform.OS !== 'web' ? styles.sectionTextAndroid : undefined} tone="secondary" variant="supporting">
              ينبّه عند وصول الإنفاق إلى نسبة محددة من الميزانية.
            </AppText>
            <ThresholdSelector androidRtlLayout onChange={setThreshold} value={threshold} />
          </View>

          <ToggleRow androidRtlLayout enabled={alertEnabled} onValueChange={setAlertEnabled} />

          <View style={styles.section}>
            <AppText style={Platform.OS !== 'web' ? styles.sectionTextAndroid : undefined} variant="cardTitle">
              معاينة التعديلات
            </AppText>
            <EditPreviewCard budget={previewBudget} />
          </View>

          <AppButton disabled={!dirty || blockingError} iconName="checkmark-outline" onPress={handleSave}>
            حفظ التغييرات
          </AppButton>
          <AppButton onPress={handleBack} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        androidRtlLayout
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
        androidRtlLayout
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
      <BottomConfirmSheet
        description="لديك تعديلات غير محفوظة على الميزانية."
        onPrimaryPress={() => {
          setDiscardVisible(false);
          router.replace({ pathname: routes.budgetDetails, params: { id: original.id } });
        }}
        onSecondaryPress={() => setDiscardVisible(false)}
        primaryVariant="danger"
        primaryLabel="تجاهل التغييرات"
        secondaryVariant="primary"
        secondaryLabel="متابعة التعديل"
        title="تجاهل التغييرات؟"
        visible={discardVisible}
      />
    </View>
  );
}

function EditPreviewCard({ budget }: { budget: Budget }) {
  const usage = budget.budget > 0 ? Math.round((budget.spent / budget.budget) * 100) : 0;
  const status = getEditBudgetStatus(usage, budget.alertThreshold);
  const remaining = budget.budget - budget.spent;
  const previewName = (
    <AppText style={Platform.OS !== 'web' ? styles.previewNameAndroid : undefined} variant="cardTitle">
      {categoryIdToName(budget.categoryId)}
    </AppText>
  );
  const statusBadge = <BudgetStatusBadge label={status.label} tone={status.tone} />;
  const previewAmount = (
    <View style={styles.previewAmount}>
      <AppText align="left" style={styles.previewAmountText} variant="caption">
        {directionSafeText(`${remaining.toLocaleString('en-US')} ر.س`)}
      </AppText>
      <AppText align="left" tone="secondary" variant="caption">
        المتبقي
      </AppText>
    </View>
  );

  return (
    <SolidCard style={[styles.previewCard, status.tone === 'danger' && styles.dangerPreviewCard]}>
      <View style={[styles.previewHeader, Platform.OS !== 'web' && styles.previewHeaderAndroid]}>
        {Platform.OS !== 'web' ? (
          <>
            {previewAmount}
            <View style={styles.previewSpacerAndroid} />
            {statusBadge}
            <View style={[styles.previewCopy, styles.previewCopyAndroid]}>{previewName}</View>
          </>
        ) : (
          <>
            <View style={styles.previewCopy}>
              {previewName}
              {statusBadge}
            </View>
            {previewAmount}
          </>
        )}
      </View>
      <AppText style={Platform.OS !== 'web' ? styles.previewSupportingTextAndroid : undefined} tone="secondary" variant="caption">
        {directionSafeText(`من ${budget.budget.toLocaleString('en-US')} ر.س، ${budget.spent.toLocaleString('en-US')} ر.س`)}
      </AppText>
      <BudgetProgressBar tone={status.tone} usage={usage} />
      <AppText
        align={Platform.OS !== 'web' ? 'right' : 'left'}
        style={[{ color: toneColors[status.tone].text }, Platform.OS !== 'web' && styles.previewSupportingTextAndroid]}
        variant="caption"
      >
        {directionSafeText(`تنبيه عند ${budget.alertThreshold}% — نسبة الاستخدام ${usage}%`)}
      </AppText>
    </SolidCard>
  );
}

function validateBudgetForm({
  categoryId,
  amount,
  month,
  excludeId,
}: {
  categoryId: BudgetCategoryId | null;
  amount: string;
  month: string;
  excludeId: string;
}) {
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

  if (categoryId && findDuplicateBudget(categoryId, month, excludeId)) {
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
  currentSpendCard: {
    backgroundColor: 'rgba(4,24,40,0.78)',
    borderColor: 'rgba(44,159,224,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  currentSpendCardAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  currentSpendIcon: {
    backgroundColor: 'rgba(44,159,224,0.16)',
    borderRadius: radii.pill,
    height: 20,
    width: 20,
  },
  currentSpendCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  currentSpendCopyAndroid: {
    alignItems: 'flex-end',
  },
  currentSpendAmountSlotAndroid: {
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  currentSpendTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  currentSpendAmount: {
    color: colors.text.primary,
    writingDirection: 'ltr',
  },
  section: {
    gap: spacing.md,
  },
  sectionTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  supportingTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  previewCard: {
    gap: spacing.md,
  },
  dangerPreviewCard: {
    backgroundColor: 'rgba(32,11,13,0.62)',
    borderColor: 'rgba(229,103,90,0.32)',
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  previewHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  previewCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  previewCopyAndroid: {
    alignItems: 'flex-end',
  },
  previewNameAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  previewAmount: {
    alignItems: 'flex-start',
  },
  previewSpacerAndroid: {
    flex: 1,
    minWidth: spacing.sm,
  },
  previewAmountText: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  previewSupportingTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
