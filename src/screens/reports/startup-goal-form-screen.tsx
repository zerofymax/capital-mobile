import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { AmountField, NoticeBanner, PickerSheet, ReportModalHeader, SelectField, TextField } from './startup-report-components';
import {
  getStartupGoalStatusLabel,
  getStartupGoalTypeMeta,
  startupGoalDateOptions,
  startupGoalStatusOptions,
  startupGoalTypes,
  startupGoalUnits,
} from './startup-goals-data';
import type { StartupGoalDraft, StartupGoalStatus, StartupGoalType, StartupGoalUnit } from './startup-goals-types';
import { formatDate, parseIsoDate } from './startup-goals-utils';
import { addStartupGoal, getStartupGoal, updateStartupGoal, useStartupReportsStore } from './startup-report-store';

type PickerKind = 'type' | 'unit' | 'startDate' | 'targetDate' | 'status' | null;
type GoalFormDraft = Omit<StartupGoalDraft, 'allocatedBudget' | 'currentValue' | 'spentBudget' | 'targetValue' | 'type' | 'unit'> & {
  allocatedBudget: number | null;
  currentValue: number | null;
  spentBudget: number | null;
  targetValue: number | null;
  type: StartupGoalType | null;
  unit: StartupGoalUnit | null;
};
type FormErrors = Partial<Record<keyof GoalFormDraft, string>>;

const androidSystemNavigationClearance = 48;

export function AddStartupGoalScreen() {
  return <StartupGoalFormScreen mode="add" />;
}

export function EditStartupGoalScreen() {
  return <StartupGoalFormScreen mode="edit" />;
}

function StartupGoalFormScreen({ mode }: { mode: 'add' | 'edit' }) {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals } = useStartupReportsStore();
  const existingGoal = mode === 'edit' ? goals.find((goal) => goal.id === id) ?? getStartupGoal(id) : null;
  const [title, setTitle] = useState(existingGoal?.title ?? '');
  const [type, setType] = useState<StartupGoalType | null>(existingGoal?.type ?? null);
  const [description, setDescription] = useState(existingGoal?.description ?? '');
  const [currentValue, setCurrentValue] = useState(existingGoal ? String(existingGoal.currentValue) : '');
  const [targetValue, setTargetValue] = useState(existingGoal ? String(existingGoal.targetValue) : '');
  const [unit, setUnit] = useState<StartupGoalUnit | null>(existingGoal?.unit ?? null);
  const [startDate, setStartDate] = useState(existingGoal?.startDate ?? '2026-07-01');
  const [targetDate, setTargetDate] = useState(existingGoal?.targetDate ?? '2026-08-31');
  const [allocatedBudget, setAllocatedBudget] = useState(existingGoal ? String(existingGoal.allocatedBudget) : '');
  const [spentBudget, setSpentBudget] = useState(existingGoal ? String(existingGoal.spentBudget) : '');
  const [owner, setOwner] = useState(existingGoal?.owner ?? '');
  const [notes, setNotes] = useState(existingGoal?.notes ?? '');
  const [status, setStatus] = useState<StartupGoalStatus>(existingGoal?.status ?? 'active');
  const [picker, setPicker] = useState<PickerKind>(null);
  const [submitted, setSubmitted] = useState(false);
  const draft = buildDraft();
  const errors = validateDraft(draft);
  const hasErrors = Object.keys(errors).length > 0;
  const typeLabel = type ? getStartupGoalTypeMeta(type).label : 'اختر نوع الهدف';
  const unitLabel = unit ?? 'اختر وحدة القياس';
  const statusLabel = getStartupGoalStatusLabel(status);
  const budgetWarning =
    draft.allocatedBudget !== null && draft.spentBudget !== null && draft.allocatedBudget >= 0 && draft.spentBudget > draft.allocatedBudget
      ? 'المصروف أعلى من الميزانية. يمكنك الحفظ إذا كان ذلك قرارًا مقصودًا.'
      : undefined;
  const bottomPadding = Platform.OS === 'android'
    ? insets.bottom + androidSystemNavigationClearance + spacing.xl
    : Math.max(insets.bottom, spacing.sm) + spacing.xxxl;

  function handleSave() {
    setSubmitted(true);

    if (hasErrors || draft.type === null || draft.unit === null || draft.targetValue === null) {
      return;
    }

    const saveDraft: StartupGoalDraft = {
      ...draft,
      allocatedBudget: draft.allocatedBudget ?? 0,
      currentValue: draft.currentValue ?? 0,
      spentBudget: draft.spentBudget ?? 0,
      targetValue: draft.targetValue,
      type: draft.type,
      unit: draft.unit,
    };

    if (mode === 'edit' && existingGoal) {
      updateStartupGoal(existingGoal.id, saveDraft);
      router.replace({ pathname: routes.startupGoalDetails, params: { id: existingGoal.id } });
      return;
    }

    addStartupGoal(saveDraft);
    router.replace(routes.startupGoals);
  }

  function buildDraft(): GoalFormDraft {
    const parsedCurrent = parseAmount(currentValue);
    const parsedTarget = parseAmount(targetValue);
    const parsedAllocated = parseAmount(allocatedBudget);
    const parsedSpent = parseAmount(spentBudget);

    return {
      allocatedBudget: parsedAllocated,
      currentValue: parsedCurrent,
      description: description.trim(),
      notes: notes.trim(),
      owner: owner.trim(),
      spentBudget: parsedSpent,
      startDate,
      status,
      targetDate,
      targetValue: parsedTarget,
      title: title.trim(),
      type,
      unit,
    };
  }

  if (mode === 'edit' && !existingGoal) {
    return (
      <SafeAreaView edges={['top']} style={styles.root}>
        <View style={[styles.notFound, { paddingBottom: bottomPadding }]}>
          <ReportModalHeader androidRtlLayout onBack={() => router.back()} subtitle="قد يكون الهدف حُذف من النسخة التجريبية." title="تعذر العثور على الهدف" />
          <AppButton onPress={() => router.replace(routes.startupGoals)}>العودة إلى الأهداف</AppButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <ReportModalHeader
            androidRtlLayout
            onBack={() => router.back()}
            subtitle={mode === 'edit' ? 'حدّث بيانات الهدف وميزانيته ومراحل التنفيذ.' : 'حدد الهدف وقيمته وخطته وميزانيته.'}
            title={mode === 'edit' ? 'تعديل هدف' : 'إضافة هدف'}
          />

          {budgetWarning ? <NoticeBanner androidRtlLayout message={budgetWarning} tone="warning" /> : null}

          <View style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
                معلومات أساسية
              </AppText>
            </View>
            <TextField androidRtlLayout error={submitted ? errors.title : undefined} label="اسم الهدف" onChangeText={setTitle} placeholder="مثال: الوصول إلى 1,000 عميل" value={title} />
            <SelectField androidRtlLayout error={submitted ? errors.type : undefined} label="نوع الهدف" onPress={() => setPicker('type')} value={typeLabel} />
            <TextField androidRtlLayout label="وصف" multiline onChangeText={setDescription} placeholder="اكتب وصفًا مختصرًا للهدف" value={description} />
            <TextField androidRtlLayout error={submitted ? errors.owner : undefined} label="المسؤول" onChangeText={setOwner} placeholder="مثال: فريق النمو" value={owner} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
                قياس الهدف
              </AppText>
            </View>
            <SelectField androidRtlLayout error={submitted ? errors.unit : undefined} label="وحدة القياس" onPress={() => setPicker('unit')} value={unitLabel} />
            <AmountField
              androidRtlLayout
              error={submitted ? errors.currentValue : undefined}
              label="القيمة الحالية"
              onChangeText={(value) => setCurrentValue(formatNumericInput(value))}
              placeholder="أدخل القيمة الحالية"
              suffix={unit ?? ''}
              value={currentValue}
            />
            <AmountField
              androidRtlLayout
              error={submitted ? errors.targetValue : undefined}
              label="القيمة المستهدفة"
              onChangeText={(value) => setTargetValue(formatNumericInput(value))}
              placeholder="أدخل القيمة المستهدفة"
              suffix={unit ?? ''}
              value={targetValue}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
                الوقت والميزانية
              </AppText>
            </View>
            <SelectField androidRtlLayout iconName="calendar-outline" label="تاريخ البداية" onPress={() => setPicker('startDate')} value={formatDate(startDate)} />
            <SelectField androidRtlLayout error={submitted ? errors.targetDate : undefined} iconName="calendar-outline" label="الموعد المستهدف" onPress={() => setPicker('targetDate')} value={formatDate(targetDate)} />
            <AmountField
              androidRtlLayout
              error={submitted ? errors.allocatedBudget : undefined}
              label="الميزانية المخصصة"
              onChangeText={(value) => setAllocatedBudget(formatNumericInput(value))}
              placeholder="أدخل الميزانية المخصصة"
              value={allocatedBudget}
            />
            <AmountField
              androidRtlLayout
              error={submitted ? errors.spentBudget : undefined}
              helper={budgetWarning}
              label="المصروف حتى الآن"
              onChangeText={(value) => setSpentBudget(formatNumericInput(value))}
              placeholder="أدخل المبلغ المصروف"
              value={spentBudget}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <AppText align="right" style={styles.sectionTitle} variant="sectionTitle">
                ملاحظات وحالة
              </AppText>
            </View>
            <SelectField androidRtlLayout label="حالة الهدف" onPress={() => setPicker('status')} value={statusLabel} />
            <TextField androidRtlLayout label="ملاحظات" multiline onChangeText={setNotes} placeholder="اكتب ملاحظات تشغيلية مختصرة" value={notes} />
          </View>

          <AppButton disabled={submitted && hasErrors} onPress={handleSave}>
            {mode === 'edit' ? 'حفظ التغييرات' : 'حفظ الهدف'}
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setType(labelToType(value));
          setPicker(null);
        }}
        options={startupGoalTypes.map((item) => item.label)}
        selectedValue={type ? typeLabel : ''}
        title="نوع الهدف"
        visible={picker === 'type'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setUnit(value as StartupGoalUnit);
          setPicker(null);
        }}
        options={startupGoalUnits}
        selectedValue={unit ?? ''}
        title="وحدة القياس"
        visible={picker === 'unit'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setStartDate(labelToDate(value));
          setPicker(null);
        }}
        options={startupGoalDateOptions.map((item) => item.label)}
        selectedValue={formatDate(startDate)}
        title="تاريخ البداية"
        visible={picker === 'startDate'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setTargetDate(labelToDate(value));
          setPicker(null);
        }}
        options={startupGoalDateOptions.map((item) => item.label)}
        selectedValue={formatDate(targetDate)}
        title="الموعد المستهدف"
        visible={picker === 'targetDate'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setStatus(labelToStatus(value));
          setPicker(null);
        }}
        options={startupGoalStatusOptions.map((item) => item.label)}
        selectedValue={statusLabel}
        title="حالة الهدف"
        visible={picker === 'status'}
      />
    </SafeAreaView>
  );
}

function validateDraft(draft: GoalFormDraft): FormErrors {
  const errors: FormErrors = {};

  if (!draft.title.trim()) {
    errors.title = 'اسم الهدف مطلوب.';
  }

  if (!draft.type) {
    errors.type = 'اختر نوع الهدف.';
  }

  if (!draft.unit) {
    errors.unit = 'اختر وحدة القياس.';
  }

  if (!draft.owner.trim()) {
    errors.owner = 'المسؤول مطلوب.';
  }

  if (draft.targetValue === null) {
    errors.targetValue = 'القيمة المستهدفة مطلوبة.';
  } else if (draft.targetValue <= 0) {
    errors.targetValue = 'القيمة المستهدفة يجب أن تكون أكبر من صفر.';
  }

  if (draft.currentValue !== null && draft.currentValue < 0) {
    errors.currentValue = 'القيمة الحالية لا يمكن أن تكون سالبة.';
  }

  if (parseIsoDate(draft.targetDate) !== null && parseIsoDate(draft.startDate) !== null && parseIsoDate(draft.targetDate)! <= parseIsoDate(draft.startDate)!) {
    errors.targetDate = 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ البداية.';
  }

  if (draft.allocatedBudget !== null && draft.allocatedBudget < 0) {
    errors.allocatedBudget = 'الميزانية لا يمكن أن تكون سالبة.';
  }

  if (draft.spentBudget !== null && draft.spentBudget < 0) {
    errors.spentBudget = 'المصروف لا يمكن أن يكون سالبًا.';
  }

  return errors;
}

function parseAmount(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/[^\d.]/g, '');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumericInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

function labelToType(label: string): StartupGoalType {
  return startupGoalTypes.find((item) => item.label === label)?.id ?? 'other';
}

function labelToStatus(label: string): StartupGoalStatus {
  return startupGoalStatusOptions.find((item) => item.label === label)?.id ?? 'active';
}

function labelToDate(label: string) {
  return startupGoalDateOptions.find((item) => item.label === label)?.value ?? '2026-08-31';
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
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
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
  notFound: {
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
});
