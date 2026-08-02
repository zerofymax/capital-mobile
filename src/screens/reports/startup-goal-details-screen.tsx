import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import { ConfirmSheet, ProgressBar, ReportModalHeader, StatusBadge } from './startup-report-components';
import { getStartupGoalTypeMeta } from './startup-goals-data';
import type { StartupGoal } from './startup-goals-types';
import {
  calculateBudgetUsage,
  calculateDaysRemaining,
  calculateDisplayProgress,
  calculateElapsedTimePercentage,
  calculateMilestonesProgress,
  calculateRemainingBudget,
  compareProgressToBudget,
  formatDate,
  formatDaysRemaining,
  formatGoalNumber,
  formatPercent,
  formatSar,
  resolveGoalBudgetStatus,
  resolveGoalStatus,
  resolveGoalTimeStatus,
} from './startup-goals-utils';
import {
  addStartupGoalMilestone,
  deleteStartupGoal,
  getStartupGoal,
  toggleStartupGoalMilestone,
  useStartupReportsStore,
} from './startup-report-store';

export function StartupGoalDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals } = useStartupReportsStore();
  const goal = goals.find((item) => item.id === id) ?? getStartupGoal(id);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [milestoneVisible, setMilestoneVisible] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const bottomPadding = Math.max(insets.bottom, spacing.sm) + spacing.xxxl;

  if (!goal) {
    return (
      <SafeAreaView edges={['top']} style={styles.root}>
        <View style={[styles.notFound, { paddingBottom: bottomPadding }]}>
          <ReportModalHeader onBack={() => router.back()} subtitle="قد يكون الهدف حُذف من النسخة التجريبية." title="تعذر العثور على الهدف" />
          <SolidCard style={styles.infoCard}>
            <AppText tone="secondary" variant="body">
              لا يمكن عرض تفاصيل هدف غير موجود.
            </AppText>
          </SolidCard>
          <AppButton onPress={() => router.replace(routes.startupGoals)}>العودة إلى الأهداف</AppButton>
        </View>
      </SafeAreaView>
    );
  }

  const type = getStartupGoalTypeMeta(goal.type);

  function handleDelete() {
    deleteStartupGoal(goal!.id);
    setDeleteVisible(false);
    router.replace(routes.startupGoals);
  }

  function handleAddMilestone() {
    addStartupGoalMilestone(goal!.id, milestoneTitle);
    setMilestoneTitle('');
    setMilestoneVisible(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <ReportModalHeader onBack={() => router.back()} subtitle={type.label} title="تفاصيل الهدف" />

        <GoalHero goal={goal} />
        <ProgressSection goal={goal} />
        <BudgetSection goal={goal} />
        <TimeSection goal={goal} />
        <MilestonesSection goal={goal} onAdd={() => setMilestoneVisible(true)} />

        <SolidCard style={styles.infoCard}>
          <AppText variant="cardTitle">ملاحظات</AppText>
          <AppText tone="secondary" variant="body">
            {goal.notes || 'لا توجد ملاحظات لهذا الهدف.'}
          </AppText>
        </SolidCard>

        <AppButton onPress={() => router.push({ pathname: routes.editStartupGoal, params: { id: goal.id } })} variant="secondary">
          تعديل الهدف
        </AppButton>
        <AppButton onPress={() => setDeleteVisible(true)} variant="danger">
          حذف الهدف
        </AppButton>
      </ScrollView>

      <ConfirmSheet
        danger
        description="سيتم حذف الهدف ومراحله من النسخة التجريبية الحالية، ولا يمكن التراجع عن هذا الإجراء."
        onPrimaryPress={handleDelete}
        onSecondaryPress={() => setDeleteVisible(false)}
        primaryLabel="حذف الهدف"
        secondaryLabel="إلغاء"
        title="هل تريد حذف هذا الهدف؟"
        visible={deleteVisible}
      />
      <AddMilestoneSheet
        onChangeTitle={setMilestoneTitle}
        onClose={() => setMilestoneVisible(false)}
        onSave={handleAddMilestone}
        title={milestoneTitle}
        visible={milestoneVisible}
      />
    </SafeAreaView>
  );
}

function GoalHero({ goal }: { goal: StartupGoal }) {
  const type = getStartupGoalTypeMeta(goal.type);
  const status = resolveGoalStatus(goal);

  return (
    <SolidCard style={styles.heroCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleBlock}>
          <AppText variant="sectionTitle">{goal.title}</AppText>
          <AppText tone="secondary" variant="supporting">
            {type.label} · {goal.owner} · آخر تحديث {goal.updatedAt}
          </AppText>
        </View>
        <View style={styles.iconBubble}>
          <Ionicons color={colors.brand.calmGreen} name={type.icon} size={20} />
        </View>
      </View>
      <StatusBadge status={status} />
      <AppText tone="secondary" variant="body">
        {goal.description}
      </AppText>
    </SolidCard>
  );
}

function ProgressSection({ goal }: { goal: StartupGoal }) {
  const progress = calculateDisplayProgress(goal);
  const actualProgress = Math.round(calculateDisplayProgress(goal));
  const milestonesProgress = Math.round(calculateMilestonesProgress(goal));

  return (
    <SolidCard style={styles.infoCard}>
      <SectionHeader icon="trending-up-outline" title="التقدم" />
      <View style={styles.amountRow}>
        <AppText tone="secondary" variant="caption">
          نسبة التقدم
        </AppText>
        <AppText style={styles.successText} variant="caption">
          {directionSafeText(`${actualProgress}%`)}
        </AppText>
      </View>
      <ProgressBar progress={progress} tone={resolveGoalStatus(goal) === 'delayed' ? 'intervene' : 'good'} />
      <View style={styles.statsGrid}>
        <Stat label="الحالي" value={formatGoalNumber(goal.currentValue, goal.unit)} />
        <Stat label="المستهدف" value={formatGoalNumber(goal.targetValue, goal.unit)} />
        <Stat label="المراحل" value={`${milestonesProgress}%`} />
      </View>
      <AppText tone="secondary" variant="body">
        {directionSafeText(`تم تحقيق ${formatGoalNumber(goal.currentValue, goal.unit)} من أصل ${formatGoalNumber(goal.targetValue, goal.unit)}.`)}
      </AppText>
    </SolidCard>
  );
}

function BudgetSection({ goal }: { goal: StartupGoal }) {
  const budgetUsage = calculateBudgetUsage(goal);
  const remainingBudget = calculateRemainingBudget(goal);
  const budgetStatus = resolveGoalBudgetStatus(goal);
  const label =
    budgetStatus === 'no-budget'
      ? 'لا توجد ميزانية مخصصة'
      : budgetStatus === 'over-budget'
        ? 'تجاوز الميزانية'
        : budgetStatus === 'near-limit'
          ? 'اقترب من الحد'
          : 'ضمن الميزانية';
  const tone = budgetStatus === 'over-budget' ? 'danger' : budgetStatus === 'near-limit' ? 'warning' : 'success';

  return (
    <SolidCard style={styles.infoCard}>
      <SectionHeader icon="wallet-outline" title="الميزانية" />
      <View style={styles.statsGrid}>
        <Stat label="المخصصة" value={formatSar(goal.allocatedBudget)} />
        <Stat label="المصروف" value={formatSar(goal.spentBudget)} />
        <Stat label="المتبقي" tone={remainingBudget < 0 ? 'danger' : undefined} value={formatSar(remainingBudget)} />
      </View>
      <View style={styles.amountRow}>
        <AppText tone="secondary" variant="caption">
          استهلاك الميزانية
        </AppText>
        <AppText tone={tone} variant="caption">
          {budgetUsage === null ? 'غير متاح' : directionSafeText(formatPercent(budgetUsage))}
        </AppText>
      </View>
      <ProgressBar progress={budgetUsage ?? 0} tone={budgetStatus === 'over-budget' ? 'intervene' : budgetStatus === 'near-limit' ? 'watch' : 'good'} />
      <View style={[styles.insightBox, tone === 'danger' && styles.dangerBox, tone === 'warning' && styles.warningBox]}>
        <AppText tone={tone} variant="caption">
          {label}
        </AppText>
        <AppText tone="secondary" variant="body">
          {compareProgressToBudget(goal)}
        </AppText>
      </View>
    </SolidCard>
  );
}

function TimeSection({ goal }: { goal: StartupGoal }) {
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const elapsed = calculateElapsedTimePercentage(goal.startDate, goal.targetDate);
  const timeStatus = resolveGoalTimeStatus(goal);
  const label =
    timeStatus === 'completed'
      ? 'مكتمل'
      : timeStatus === 'not-started'
        ? 'لم يبدأ'
        : timeStatus === 'delayed'
          ? 'متأخر'
          : timeStatus === 'watch'
            ? 'يحتاج متابعة'
            : 'على المسار';

  return (
    <SolidCard style={styles.infoCard}>
      <SectionHeader icon="time-outline" title="الوقت" />
      <InfoRow label="تاريخ البداية" value={formatDate(goal.startDate)} />
      <InfoRow label="الموعد المستهدف" value={formatDate(goal.targetDate)} />
      <InfoRow label="الأيام المتبقية" value={formatDaysRemaining(daysRemaining)} />
      <InfoRow label="نسبة الوقت المنقضي" value={formatPercent(elapsed)} />
      <InfoRow label="حالة الوقت" value={label} />
    </SolidCard>
  );
}

function MilestonesSection({ goal, onAdd }: { goal: StartupGoal; onAdd: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <AppText variant="sectionTitle">المراحل الفرعية</AppText>
        <Pressable accessibilityLabel="إضافة مرحلة" accessibilityRole="button" onPress={onAdd} style={({ pressed }) => [styles.addMilestoneButton, pressed && styles.pressed]}>
          <Ionicons color={colors.brand.calmGreen} name="add-outline" size={17} />
          <AppText style={styles.addMilestoneText} variant="caption">
            إضافة مرحلة
          </AppText>
        </Pressable>
      </View>
      <View style={styles.milestoneList}>
        {goal.milestones.map((milestone) => (
          <Pressable
            accessibilityLabel={milestone.title}
            accessibilityRole="button"
            key={milestone.id}
            onPress={() => toggleStartupGoalMilestone(goal.id, milestone.id)}
            style={({ pressed }) => [styles.milestoneRow, pressed && styles.pressed]}
          >
            <View style={[styles.milestoneCheck, milestone.completed && styles.milestoneCheckActive]}>
              {milestone.completed ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={15} /> : null}
            </View>
            <View style={styles.milestoneCopy}>
              <AppText style={milestone.completed && styles.completedText} variant="body">
                {milestone.title}
              </AppText>
              {milestone.date ? (
                <AppText tone="secondary" variant="caption">
                  {formatDate(milestone.date)}
                </AppText>
              ) : null}
            </View>
            <AppText tone={milestone.completed ? 'success' : 'secondary'} variant="caption">
              {milestone.completed ? 'مكتملة' : 'غير مكتملة'}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AddMilestoneSheet({
  visible,
  title,
  onChangeTitle,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  onChangeTitle: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">إضافة مرحلة</AppText>
          <View style={styles.inputWrap}>
            <TextInput
              onChangeText={onChangeTitle}
              placeholder="اسم المرحلة"
              placeholderTextColor={colors.text.tertiary}
              style={styles.textInput}
              textAlign="right"
              value={title}
            />
          </View>
          <AppButton disabled={!title.trim()} onPress={onSave}>
            حفظ المرحلة
          </AppButton>
          <AppButton onPress={onClose} variant="secondary">
            إلغاء
          </AppButton>
        </View>
      </View>
    </Modal>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.smallIcon}>
        <Ionicons color={colors.brand.calmGreen} name={icon} size={17} />
      </View>
      <AppText variant="cardTitle">{title}</AppText>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <View style={styles.statBox}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" tone={tone ?? 'primary'} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" variant="caption">
        {directionSafeText(value)}
      </AppText>
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
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  heroCard: {
    gap: spacing.md,
  },
  goalHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  goalTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  smallIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  successText: {
    color: colors.semantic.success,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: radii.input,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  insightBox: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.24)',
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  dangerBox: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.24)',
  },
  warningBox: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  infoRow: {
    borderBottomColor: colors.surface.separator,
    borderBottomWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  addMilestoneButton: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addMilestoneText: {
    color: colors.brand.calmGreen,
  },
  milestoneList: {
    gap: spacing.sm,
  },
  milestoneRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  milestoneCheck: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.pill,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  milestoneCheckActive: {
    backgroundColor: colors.brand.mediumGreen,
  },
  milestoneCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  completedText: {
    color: colors.brand.calmGreen,
  },
  sheetRoot: {
    backgroundColor: colors.background.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheetCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.pill,
    height: 4,
    width: 36,
  },
  inputWrap: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  textInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
