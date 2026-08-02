import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { AmountField, GoalHeader, GoalProgressBar, NoticeBanner, PickerSheet, PreviewGoalCard, SelectField, TextField } from './components';
import { addContribution, useGoalsStore } from './goals-store';
import { formatAmountInput, getContributionPreviewStatus, getGoalSummary, getLocalTodayContributionLabel, parseAmount } from './goal-utils';
import { contributionDateOptions, contributionSourceOptions, initialGoals, type FinancialGoal, type GoalContribution } from './goals-data';

type PickerType = 'source' | 'date' | null;

type ContributionErrors = {
  amount?: string;
  source?: string;
  date?: string;
};

export function AddContributionScreen() {
  const insets = useSafeAreaInsets();
  const savingRef = useRef(false);
  const params = useLocalSearchParams<{ id?: string }>();
  const { goals } = useGoalsStore();
  const goal = goals.find((item) => item.id === params.id) ?? goals[0] ?? initialGoals[0]!;
  const summary = getGoalSummary(goal);
  const [dateOptionsOpenedAt, setDateOptionsOpenedAt] = useState(() => new Date());
  const contributionDates = useMemo(
    () => [
      getLocalTodayContributionLabel(dateOptionsOpenedAt),
      ...contributionDateOptions.filter((option) => !option.startsWith('اليوم،')),
    ],
    [dateOptionsOpenedAt],
  );
  const [amount, setAmount] = useState('4200');
  const [source, setSource] = useState('من الإيرادات');
  const [date, setDate] = useState(() => contributionDates[0] ?? '');
  const [note, setNote] = useState('مساهمة من إيرادات هذا الشهر');
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const parsedAmount = parseAmount(amount) ?? 0;
  const appliedAmount = Math.min(Math.max(parsedAmount, 0), summary.remaining);
  const previewContribution: GoalContribution = {
    amount: appliedAmount,
    date,
    id: 'preview-contribution',
    note,
    source,
    title: 'مساهمة جديدة',
  };
  const warning =
    parsedAmount > summary.remaining && summary.remaining > 0
      ? `المساهمة أكبر من المبلغ المتبقي بمقدار ${(parsedAmount - summary.remaining).toLocaleString('en-US')} ر.س. سيُضاف فقط ${summary.remaining.toLocaleString('en-US')} ر.س لإكمال الهدف.`
      : undefined;
  const errors = useMemo(() => validateContribution({ amount, date, source }), [amount, date, source]);
  const blockingError = Boolean(errors.amount || errors.source || errors.date) || summary.remaining <= 0;
  const previewGoal: FinancialGoal = {
    ...goal,
    contributions: [...goal.contributions, previewContribution],
  };
  const previewSummary = getGoalSummary(previewGoal);

  function openDatePicker() {
    const now = new Date();
    const todayLabel = getLocalTodayContributionLabel(now);

    setDateOptionsOpenedAt(now);
    setDate((currentDate) => currentDate.startsWith('اليوم،') ? todayLabel : currentDate);
    setPicker('date');
  }

  function handleSave() {
    if (savingRef.current) {
      return;
    }

    setSubmitted(true);

    if (blockingError || parsedAmount <= 0) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    addContribution(summary.id, {
      amount: parsedAmount,
      date,
      note: note.trim(),
      source,
    });
    router.replace({ pathname: routes.goalDetails, params: { id: summary.id } });
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
          <GoalHeader onBack={() => router.back()} subtitle={`حدث تقدم هدف ${summary.name}`} title="إضافة مساهمة" />

          <PreviewGoalCard goal={goal} showAmountRows />

          <AmountField
            error={submitted || amount !== '4200' ? errors.amount : undefined}
            helper="أدخل المبلغ الذي تريد إضافته إلى تقدم الهدف"
            label="مبلغ المساهمة"
            onChangeText={(value) => setAmount(formatAmountInput(value))}
            value={amount}
            warning={warning}
          />
          <SelectField error={submitted ? errors.source : undefined} iconName="trending-up-outline" label="مصدر المساهمة" onPress={() => setPicker('source')} value={source} />
          <SelectField error={submitted ? errors.date : undefined} iconName="calendar-outline" label="تاريخ المساهمة" onPress={openDatePicker} value={date} />
          <TextField label="ملاحظة" onChangeText={setNote} placeholder="اختياري" value={note} />

          {previewSummary.completed ? <NoticeBanner message={`مبروك، تم تحقيق هدف ${summary.name}`} /> : null}

          <View style={styles.section}>
            <AppText variant="cardTitle">معاينة التقدم</AppText>
            <ProgressPreview before={summary.currentAmount} contribution={appliedAmount} goal={previewGoal} previousProgress={summary.progress} />
          </View>

          <AppButton disabled={blockingError || saving} iconName="add-outline" loading={saving} onPress={handleSave}>
            حفظ المساهمة
          </AppButton>
          <AppButton onPress={() => router.back()} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setSource(value);
          setPicker(null);
        }}
        options={contributionSourceOptions}
        selectedValue={source}
        title="اختر مصدر المساهمة"
        visible={picker === 'source'}
      />
      <PickerSheet
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setDate(value);
          setPicker(null);
        }}
        options={contributionDates}
        selectedValue={date}
        title="اختر تاريخ المساهمة"
        visible={picker === 'date'}
      />
    </View>
  );
}

function ProgressPreview({
  before,
  contribution,
  goal,
  previousProgress,
}: {
  before: number;
  contribution: number;
  goal: FinancialGoal;
  previousProgress: number;
}) {
  const preview = getGoalSummary(goal);
  const status = getContributionPreviewStatus(preview.progress);

  return (
    <SolidCard style={[styles.previewCard, preview.progress >= 100 && styles.completedPreviewCard]}>
      <View style={styles.previewNumbers}>
        <View style={styles.previewMetric}>
          <AppText align="left" tone="secondary" variant="caption">
            قبل
          </AppText>
          <AppText align="left" style={styles.previewValue} variant="caption">
            {directionSafeText(`${before.toLocaleString('en-US')} ر.س · ${previousProgress}%`)}
          </AppText>
        </View>
        <View style={styles.previewMetric}>
          <AppText align="center" style={styles.greenText} variant="caption">
            {directionSafeText(`+${contribution.toLocaleString('en-US')} ر.س`)}
          </AppText>
        </View>
        <View style={styles.previewMetric}>
          <AppText tone="secondary" variant="caption">
            بعد
          </AppText>
          <AppText style={styles.greenText} variant="caption">
            {directionSafeText(`${preview.currentAmount.toLocaleString('en-US')} ر.س · ${preview.progress}%`)}
          </AppText>
        </View>
      </View>
      <GoalProgressBar progress={preview.progress} tone={status.tone} />
      <View style={styles.previewFooter}>
        <AppText style={styles.previewValue} variant="caption">
          {directionSafeText(`${preview.remaining.toLocaleString('en-US')} ر.س`)}
        </AppText>
        <AppText style={styles.statusText} variant="caption">
          {status.label}
        </AppText>
      </View>
      <AppText align="center" variant="supporting">
        {preview.progress >= 100
          ? 'اكتمل الهدف بالمبلغ المستهدف بالكامل.'
          : `بعد إضافة هذه المساهمة سيتبقى ${preview.remaining.toLocaleString('en-US')} ر.س لتحقيق الهدف.`}
      </AppText>
    </SolidCard>
  );
}

function validateContribution({ amount, date, source }: { amount: string; date: string; source: string }) {
  const errors: ContributionErrors = {};
  const parsedAmount = parseAmount(amount);

  if (!amount.trim()) {
    errors.amount = 'يرجى إدخال مبلغ المساهمة';
  } else if (parsedAmount === null || parsedAmount <= 0) {
    errors.amount = 'أدخل مبلغًا أكبر من صفر';
  }

  if (!source.trim()) {
    errors.source = 'يرجى اختيار مصدر المساهمة';
  }

  if (!date.trim()) {
    errors.date = 'يرجى اختيار تاريخ المساهمة';
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
  previewCard: {
    gap: spacing.md,
  },
  completedPreviewCard: {
    backgroundColor: 'rgba(5,38,24,0.68)',
    borderColor: 'rgba(53,211,154,0.32)',
  },
  previewNumbers: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewMetric: {
    gap: spacing.xs,
    minWidth: 86,
  },
  previewValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  greenText: {
    color: '#35D39A',
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  previewFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    backgroundColor: 'rgba(53,211,154,0.12)',
    borderRadius: radii.pill,
    color: '#35D39A',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
});
