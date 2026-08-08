import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';
import {
  AmountField,
  goalTypeIdToName,
  goalTypeNameToId,
  GoalHeader,
  NoticeBanner,
  PickerSheet,
  PreviewGoalCard,
  ReminderCard,
  SelectField,
  TextField,
} from './components';
import { addGoal } from './goals-store';
import { formatAmountInput, getContributionPreviewStatus, parseAmount } from './goal-utils';
import { goalDateOptions, goalTypes, reminderDayOptions, type FinancialGoal, type GoalTypeId } from './goals-data';

type PickerType = 'type' | 'date' | 'reminderDay' | null;

type GoalFormErrors = {
  name?: string;
  typeId?: string;
  targetAmount?: string;
  currentAmount?: string;
  targetDate?: string;
  monthlyContribution?: string;
};

export function AddGoalScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<GoalTypeId | null>(null);
  const [targetAmount, setTargetAmount] = useState('0');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('0');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDay, setReminderDay] = useState<string>(reminderDayOptions[0]);
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(
    () => validateGoalForm({ currentAmount, monthlyContribution, name, targetAmount, targetDate, typeId }),
    [currentAmount, monthlyContribution, name, targetAmount, targetDate, typeId],
  );
  const parsedTarget = parseAmount(targetAmount) ?? 0;
  const parsedCurrent = parseAmount(currentAmount) ?? 0;
  const parsedMonthly = parseAmount(monthlyContribution) ?? 0;
  const blockingError = Boolean(errors.name || errors.typeId || errors.targetAmount || errors.currentAmount || errors.targetDate || errors.monthlyContribution);
  const previewGoal: FinancialGoal | null =
    name.trim() && typeId && parsedTarget > 0
      ? {
          id: 'preview-goal',
          name: name.trim(),
          typeId,
          targetAmount: parsedTarget,
          currentAmount: Math.max(parsedCurrent, 0),
          monthlyContribution: Math.max(parsedMonthly, 0),
          targetDate: targetDate || goalDateOptions[1],
          startDate: '1 يوليو 2026',
          status: 'started',
          reminderEnabled,
          reminderDay,
          contributions: [],
        }
      : null;
  const previewProgress = previewGoal && previewGoal.targetAmount > 0 ? Math.round((previewGoal.currentAmount / previewGoal.targetAmount) * 100) : 0;

  function handleSave() {
    setSubmitted(true);

    if (blockingError || !typeId || parsedTarget <= 0) {
      return;
    }

    addGoal({
      currentAmount: Math.max(parsedCurrent, 0),
      monthlyContribution: Math.max(parsedMonthly, 0),
      name: name.trim(),
      reminderDay,
      reminderEnabled,
      targetAmount: parsedTarget,
      targetDate,
      typeId,
    });
    router.replace(routes.goals);
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
          <GoalHeader onBack={() => router.back()} subtitle="حدد هدفك وخطة الوصول إليه" title="إضافة هدف مالي" />

          <NoticeBanner message="الهدف المالي يساعدك على التخطيط ومتابعة التقدم، ولا يسجل عملية مالية جديدة." tone="warning" />

          <TextField androidRtlLayout error={submitted ? errors.name : undefined} label="اسم الهدف" onChangeText={setName} placeholder="مثال: صندوق الطوارئ" value={name} />
          <SelectField androidRtlLayout error={submitted ? errors.typeId : undefined} label="نوع الهدف" onPress={() => setPicker('type')} value={goalTypeIdToName(typeId)} />
          <AmountField
            androidRtlLayout
            error={submitted || targetAmount !== '0' ? errors.targetAmount : undefined}
            helper="إجمالي المبلغ الذي تريد الوصول إليه"
            label="المبلغ المستهدف"
            onChangeText={(value) => setTargetAmount(formatAmountInput(value))}
            value={targetAmount}
          />
          <AmountField
            androidRtlLayout
            error={submitted || currentAmount !== '0' ? errors.currentAmount : undefined}
            helper="أدخل المبلغ الذي تم توفيره أو تحقيقه مسبقًا"
            label="المبلغ المحقق حاليًا"
            onChangeText={(value) => setCurrentAmount(formatAmountInput(value))}
            value={currentAmount}
          />
          <SelectField androidRtlLayout error={submitted ? errors.targetDate : undefined} iconName="calendar-outline" label="الموعد المستهدف" onPress={() => setPicker('date')} value={targetDate} />
          <AmountField
            androidRtlLayout
            error={submitted || monthlyContribution !== '0' ? errors.monthlyContribution : undefined}
            helper="المبلغ الذي تخطط لإضافته للهدف كل شهر"
            label="المساهمة الشهرية"
            onChangeText={(value) => setMonthlyContribution(formatAmountInput(value))}
            value={monthlyContribution}
          />

          <ReminderCard androidRtlLayout enabled={reminderEnabled} day={reminderDay} onDayPress={() => setPicker('reminderDay')} onToggle={setReminderEnabled} />

          {previewGoal ? (
            <View style={styles.section}>
              <AppText variant="cardTitle">معاينة الهدف</AppText>
              <PreviewGoalCard goal={previewGoal} statusOverride={getContributionPreviewStatus(previewProgress)} />
            </View>
          ) : null}

          <AppButton disabled={blockingError} iconName="add-outline" onPress={handleSave}>
            حفظ الهدف
          </AppButton>
          <AppButton onPress={() => router.back()} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setTypeId(goalTypeNameToId(value));
          setPicker(null);
        }}
        options={goalTypes.map((type) => type.name)}
        selectedValue={goalTypeIdToName(typeId)}
        title="اختر نوع الهدف"
        visible={picker === 'type'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setTargetDate(value);
          setPicker(null);
        }}
        options={goalDateOptions}
        selectedValue={targetDate}
        title="اختر تاريخًا"
        visible={picker === 'date'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setReminderDay(value);
          setPicker(null);
        }}
        options={reminderDayOptions}
        selectedValue={reminderDay}
        title="يوم التذكير"
        visible={picker === 'reminderDay'}
      />
    </View>
  );
}

function validateGoalForm({
  currentAmount,
  monthlyContribution,
  name,
  targetAmount,
  targetDate,
  typeId,
}: {
  currentAmount: string;
  monthlyContribution: string;
  name: string;
  targetAmount: string;
  targetDate: string;
  typeId: GoalTypeId | null;
}) {
  const errors: GoalFormErrors = {};
  const parsedTarget = parseAmount(targetAmount);
  const parsedCurrent = parseAmount(currentAmount);
  const parsedMonthly = parseAmount(monthlyContribution);

  if (!name.trim()) {
    errors.name = 'يرجى إدخال اسم الهدف';
  }

  if (!typeId) {
    errors.typeId = 'يرجى اختيار نوع الهدف';
  }

  if (!targetAmount.trim()) {
    errors.targetAmount = 'يرجى إدخال المبلغ المستهدف';
  } else if (parsedTarget === null || parsedTarget <= 0) {
    errors.targetAmount = 'أدخل مبلغًا أكبر من صفر';
  }

  if (parsedCurrent === null || parsedCurrent < 0) {
    errors.currentAmount = parsedCurrent !== null && parsedCurrent < 0 ? 'لا يمكن أن يكون المبلغ المحقق أقل من صفر' : 'أدخل مبلغًا صحيحًا';
  } else if (parsedTarget !== null && parsedCurrent > parsedTarget) {
    errors.currentAmount = 'المبلغ المحقق لا يمكن أن يتجاوز المبلغ المستهدف';
  }

  if (!targetDate.trim()) {
    errors.targetDate = 'يرجى اختيار الموعد المستهدف';
  } else if (isPastTargetDate(targetDate)) {
    errors.targetDate = 'اختر تاريخًا مستقبليًا';
  }

  if (parsedMonthly === null || parsedMonthly < 0) {
    errors.monthlyContribution = 'لا يمكن أن تكون المساهمة الشهرية أقل من صفر';
  }

  return errors;
}

function isPastTargetDate(value: string) {
  const monthIndex: Record<string, number> = {
    يناير: 1,
    فبراير: 2,
    مارس: 3,
    أبريل: 4,
    مايو: 5,
    يونيو: 6,
    يوليو: 7,
    أغسطس: 8,
    سبتمبر: 9,
    أكتوبر: 10,
    نوفمبر: 11,
    ديسمبر: 12,
  };
  const [month, yearText] = value.split(' ');
  const year = Number(yearText);
  const monthNumber = month ? monthIndex[month] : undefined;

  if (!monthNumber || !Number.isFinite(year)) {
    return false;
  }

  return year < 2026 || (year === 2026 && monthNumber < 8);
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
