import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { directionSafeText, formatCurrency } from '@/utils/rtl';
import {
  AmountField,
  BottomConfirmSheet,
  goalTypeIdToName,
  goalTypeNameToId,
  GoalHeader,
  GoalProgressBar,
  NoticeBanner,
  PickerSheet,
  PreviewGoalCard,
  ReminderCard,
  SelectField,
  TextField,
} from './components';
import { updateGoal, useGoalsStore } from './goals-store';
import { formatAmountInput, getGoalSummary, getUpdatedPlanStatus, parseAmount } from './goal-utils';
import { goalDateOptions, goalTypes, initialGoals, reminderDayOptions, type FinancialGoal, type GoalTypeId } from './goals-data';

type PickerType = 'type' | 'date' | 'reminderDay' | null;

type GoalFormErrors = {
  name?: string;
  typeId?: string;
  targetAmount?: string;
  currentAmount?: string;
  targetDate?: string;
  monthlyContribution?: string;
};

export function EditGoalScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { goals } = useGoalsStore();
  const original = goals.find((item) => item.id === params.id) ?? goals[0] ?? initialGoals[0]!;
  const originalSummary = useMemo(() => getGoalSummary(original), [original]);
  const [name, setName] = useState(original.name);
  const [typeId, setTypeId] = useState<GoalTypeId | null>(original.typeId);
  const [targetAmount, setTargetAmount] = useState(String(originalSummary.targetAmount));
  const [currentAmount, setCurrentAmount] = useState(String(originalSummary.currentAmount));
  const [targetDate, setTargetDate] = useState(original.targetDate);
  const [monthlyContribution, setMonthlyContribution] = useState(String(original.monthlyContribution));
  const [reminderEnabled, setReminderEnabled] = useState(original.reminderEnabled);
  const [reminderDay, setReminderDay] = useState<string>(original.reminderDay);
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);
  const parsedTarget = parseAmount(targetAmount) ?? 0;
  const parsedCurrent = parseAmount(currentAmount) ?? 0;
  const parsedMonthly = parseAmount(monthlyContribution) ?? 0;
  const dirty =
    name.trim() !== original.name ||
    typeId !== original.typeId ||
    parsedTarget !== originalSummary.targetAmount ||
    parsedCurrent !== originalSummary.currentAmount ||
    targetDate !== original.targetDate ||
    parsedMonthly !== original.monthlyContribution ||
    reminderEnabled !== original.reminderEnabled ||
    reminderDay !== original.reminderDay;
  const errors = useMemo(
    () =>
      validateGoalForm({
        currentAmount,
        monthlyContribution,
        name,
        targetAmount,
        targetDate,
        typeId,
      }),
    [currentAmount, monthlyContribution, name, targetAmount, targetDate, typeId],
  );
  const blockingError = Boolean(errors.name || errors.typeId || errors.targetAmount || errors.currentAmount || errors.targetDate || errors.monthlyContribution);
  const previewGoal: FinancialGoal = {
    ...original,
    contributions: [],
    currentAmount: Math.max(parsedCurrent, 0),
    monthlyContribution: Math.max(parsedMonthly, 0),
    name: name.trim() || original.name,
    targetAmount: Math.max(parsedTarget, 0),
    targetDate,
    typeId: typeId ?? original.typeId,
    reminderDay,
    reminderEnabled,
  };
  const previewSummary = getGoalSummary(previewGoal);

  function handleBack() {
    if (dirty) {
      setDiscardVisible(true);
      return;
    }

    router.back();
  }

  function handleSave() {
    setSubmitted(true);

    if (!dirty || blockingError || !typeId || parsedTarget <= 0) {
      return;
    }

    updateGoal(original.id, {
      currentAmount: Math.max(parsedCurrent, 0),
      monthlyContribution: Math.max(parsedMonthly, 0),
      name: name.trim(),
      reminderDay,
      reminderEnabled,
      targetAmount: parsedTarget,
      targetDate,
      typeId,
    });
    router.replace({ pathname: routes.goalDetails, params: { id: original.id } });
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
          <GoalHeader onBack={handleBack} subtitle={`حدث إعدادات هدف ${original.name}`} title="تعديل الهدف المالي" />

          {dirty ? <NoticeBanner message="لديك تغييرات غير محفوظة" tone="warning" /> : null}

          <SolidCard style={styles.currentCard}>
            <View style={[styles.currentHeader, Platform.OS === 'android' && styles.currentHeaderAndroid]}>
              <View style={styles.infoDot} />
              <AppText style={Platform.OS === 'android' ? styles.currentTitleAndroid : undefined} variant="cardTitle">
                التقدم الحالي
              </AppText>
            </View>
            <View style={styles.currentValues}>
              <View style={[styles.currentMetric, styles.currentMetricAchieved]}>
                <AppText align="left" style={styles.currentMetricLabel} tone="secondary" variant="caption">
                  المحقق
                </AppText>
                <AppText align="left" style={styles.currentValue} variant="caption">
                  {directionSafeText(formatCurrency(previewSummary.currentAmount))}
                </AppText>
              </View>
              <View style={[styles.currentMetric, styles.currentMetricTarget]}>
                <AppText align="right" style={styles.currentMetricLabel} tone="secondary" variant="caption">
                  المستهدف
                </AppText>
                <AppText align="right" style={styles.currentValue} variant="caption">
                  {directionSafeText(formatCurrency(previewSummary.targetAmount))}
                </AppText>
              </View>
            </View>
            <GoalProgressBar progress={previewSummary.progress} tone="green" />
            <AppText style={Platform.OS === 'android' ? styles.currentNoteAndroid : undefined} tone="secondary" variant="supporting">
              تعديل الهدف لن يغير المساهمات المسجلة مسبقًا.
            </AppText>
          </SolidCard>

          <TextField androidRtlLayout error={submitted ? errors.name : undefined} label="اسم الهدف" onChangeText={setName} placeholder="مثال: صندوق الطوارئ" value={name} />
          <SelectField androidRtlLayout error={submitted ? errors.typeId : undefined} label="نوع الهدف" onPress={() => setPicker('type')} value={goalTypeIdToName(typeId)} />
          <AmountField
            androidRtlLayout
            error={submitted || targetAmount !== String(originalSummary.targetAmount) ? errors.targetAmount : undefined}
            helper={directionSafeText(`المبلغ المحقق حاليًا هو ${formatCurrency(previewSummary.currentAmount)}`)}
            label="المبلغ المستهدف"
            onChangeText={(value) => setTargetAmount(formatAmountInput(value))}
            value={targetAmount}
          />
          <AmountField
            androidRtlLayout
            error={submitted || currentAmount !== String(originalSummary.currentAmount) ? errors.currentAmount : undefined}
            label="المبلغ المحقق"
            onChangeText={(value) => setCurrentAmount(formatAmountInput(value))}
            value={currentAmount}
          />
          <SelectField androidRtlLayout error={submitted ? errors.targetDate : undefined} iconName="calendar-outline" label="الموعد المستهدف" onPress={() => setPicker('date')} value={targetDate} />
          <AmountField
            androidRtlLayout
            error={submitted || monthlyContribution !== String(original.monthlyContribution) ? errors.monthlyContribution : undefined}
            label="المساهمة الشهرية"
            onChangeText={(value) => setMonthlyContribution(formatAmountInput(value))}
            value={monthlyContribution}
          />

          <ReminderCard androidRtlLayout enabled={reminderEnabled} day={reminderDay} onDayPress={() => setPicker('reminderDay')} onToggle={setReminderEnabled} />

          <View style={styles.section}>
            {Platform.OS === 'android' ? (
              <View style={styles.sectionTitleWrapperAndroid}>
                <AppText style={styles.sectionTitleAndroid} variant="cardTitle">
                  معاينة التعديلات
                </AppText>
              </View>
            ) : (
              <AppText variant="cardTitle">معاينة التعديلات</AppText>
            )}
            <PreviewGoalCard androidRtlLayout goal={previewGoal} statusOverride={dirty ? getUpdatedPlanStatus() : undefined} />
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
      <BottomConfirmSheet
        description="لديك تعديلات غير محفوظة على الهدف المالي."
        onPrimaryPress={() => {
          setDiscardVisible(false);
          router.replace({ pathname: routes.goalDetails, params: { id: original.id } });
        }}
        onSecondaryPress={() => setDiscardVisible(false)}
        primaryLabel="تجاهل التغييرات"
        primaryVariant="danger"
        secondaryLabel="متابعة التعديل"
        secondaryVariant="primary"
        title="تجاهل التغييرات؟"
        visible={discardVisible}
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
  } else if (parsedCurrent !== null && parsedTarget < parsedCurrent) {
    errors.targetAmount = 'المبلغ المستهدف لا يمكن أن يكون أقل من المبلغ المحقق حاليًا';
  }

  if (parsedCurrent === null || parsedCurrent < 0) {
    errors.currentAmount = parsedCurrent !== null && parsedCurrent < 0 ? 'لا يمكن أن يكون المبلغ المحقق أقل من صفر' : 'أدخل مبلغًا صحيحًا';
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
  currentCard: {
    backgroundColor: 'rgba(2,25,42,0.92)',
    borderColor: 'rgba(46,168,255,0.22)',
    gap: spacing.md,
  },
  currentHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  currentHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  currentTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoDot: {
    backgroundColor: 'rgba(46,168,255,0.18)',
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  currentValues: {
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  currentMetric: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  currentMetricAchieved: {
    alignItems: 'flex-start',
  },
  currentMetricTarget: {
    alignItems: 'flex-end',
  },
  currentMetricLabel: {
    alignSelf: 'stretch',
    writingDirection: 'rtl',
  },
  currentValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  currentNoteAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
