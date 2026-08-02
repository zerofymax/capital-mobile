import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalBottomSheetHeaderSurface } from '@/components/navigation/capital-bottom-sheet-header-surface';
import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import type { StartupMetricStatus } from './startup-report-data';
import { getStartupGoalStatusLabel, getStartupGoalTypeMeta } from './startup-goals-data';
import type { StartupGoal, StartupGoalStatus } from './startup-goals-types';
import {
  calculateBudgetUsage,
  calculateDaysRemaining,
  calculateDisplayProgress,
  calculateRemainingBudget,
  formatDaysRemaining,
  formatGoalNumber,
  formatPercent,
  formatSar,
  resolveGoalStatus,
} from './startup-goals-utils';

export function ReportModalHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-forward-outline"
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="center" style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="center" tone="secondary" variant="supporting">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

export function NoticeBanner({ message, tone = 'success' }: { message: string; tone?: 'success' | 'warning' | 'danger' }) {
  const toneStyle = getToneStyle(tone);

  return (
    <View style={[styles.notice, { backgroundColor: toneStyle.tint, borderColor: toneStyle.border }]}>
      <Ionicons color={toneStyle.text} name={tone === 'success' ? 'checkmark-circle-outline' : 'warning-outline'} size={17} style={styles.noticeIcon} />
      <View style={styles.noticeTextWrap}>
        <AppText style={[styles.noticeText, { color: toneStyle.text }]} variant="supporting">
          {message}
        </AppText>
      </View>
    </View>
  );
}

export function ProgressBar({ progress, tone = 'good' }: { progress: number; tone?: StartupMetricStatus }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
  const toneStyle = getStatusStyle(tone);

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { backgroundColor: toneStyle.accent, width: `${clamped}%` }]} />
    </View>
  );
}

export function MiniTrend({ values, tone = 'good' }: { values: readonly number[]; tone?: StartupMetricStatus }) {
  const finiteValues = values.filter(Number.isFinite);
  const max = finiteValues.length > 0 ? Math.max(...finiteValues) : 1;
  const min = finiteValues.length > 0 ? Math.min(...finiteValues) : 0;
  const range = Math.max(max - min, 1);
  const toneStyle = getStatusStyle(tone);

  return (
    <View style={styles.trendBox}>
      <View style={styles.trendGridLine} />
      {values.map((value, index) => {
        const safeValue = Number.isFinite(value) ? value : min;
        const height = 26 + ((safeValue - min) / range) * 58;

        return <View key={`${safeValue}-${index}`} style={[styles.trendBar, { backgroundColor: toneStyle.accent, height }]} />;
      })}
    </View>
  );
}

export function StartupGoalCard({ goal, onPress }: { goal: StartupGoal; onPress: (id: string) => void }) {
  const progress = calculateDisplayProgress(goal);
  const budgetUsage = calculateBudgetUsage(goal);
  const remainingBudget = calculateRemainingBudget(goal);
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const resolvedStatus = resolveGoalStatus(goal);
  const type = getStartupGoalTypeMeta(goal.type);
  const statusTone = resolvedStatus === 'delayed' ? 'intervene' : resolvedStatus === 'completed' ? 'good' : 'watch';
  const toneStyle = getStatusStyle(statusTone);

  return (
    <Pressable accessibilityLabel={goal.title} accessibilityRole="button" onPress={() => onPress(goal.id)} style={({ pressed }) => [styles.goalCard, pressed && styles.pressed]}>
      <View style={styles.goalTopRow}>
        <View style={[styles.iconBubble, { backgroundColor: toneStyle.tint }]}>
          <Ionicons color={toneStyle.accent} name={type.icon} size={19} />
        </View>
        <View style={styles.goalTitleBox}>
          <AppText variant="cardTitle">{goal.title}</AppText>
          <AppText tone="secondary" variant="caption">
            {type.label} · {goal.owner}
          </AppText>
        </View>
        {goal.id === 'mrr-100k' ? <ManualProgressBadge /> : null}
        <StatusBadge status={resolvedStatus} />
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      </View>
      <View style={styles.goalMetaRow}>
        <AppText tone="secondary" variant="caption">
          {directionSafeText(`${formatGoalNumber(goal.currentValue, goal.unit)} من ${formatGoalNumber(goal.targetValue, goal.unit)}`)}
        </AppText>
        <AppText style={{ color: toneStyle.text }} variant="caption">
          {directionSafeText(`${Math.round(progress)}%`)}
        </AppText>
      </View>
      <ProgressBar progress={progress} tone={statusTone} />
      <View style={styles.goalMetaRow}>
        <AppText tone="secondary" variant="caption">
          {directionSafeText(`الميزانية ${formatSar(goal.allocatedBudget)} · المصروف ${formatSar(goal.spentBudget)}`)}
        </AppText>
        <AppText tone="secondary" variant="caption">
          {budgetUsage === null ? 'لا توجد ميزانية مخصصة' : directionSafeText(`استهلاك ${formatPercent(budgetUsage)}`)}
        </AppText>
      </View>
      <View style={styles.goalMetaRow}>
        <AppText tone={resolvedStatus === 'delayed' ? 'danger' : 'secondary'} variant="caption">
          {formatDaysRemaining(daysRemaining)}
        </AppText>
        <AppText tone={remainingBudget < 0 ? 'danger' : 'secondary'} variant="caption">
          {directionSafeText(`المتبقي ${formatSar(remainingBudget)}`)}
        </AppText>
      </View>
    </Pressable>
  );
}

export function StatusBadge({ status }: { status: StartupGoalStatus }) {
  const tone = status === 'delayed' ? 'danger' : status === 'completed' ? 'success' : status === 'active' ? 'warning' : 'success';
  const toneStyle = getToneStyle(tone);

  return (
    <View style={[styles.statusBadge, { backgroundColor: toneStyle.tint, borderColor: toneStyle.border }]}>
      <AppText align="center" style={[styles.statusText, { color: toneStyle.text }]} variant="caption">
        {getStartupGoalStatusLabel(status)}
      </AppText>
    </View>
  );
}

function ManualProgressBadge() {
  return (
    <View style={styles.manualProgressBadge}>
      <AppText align="center" style={styles.manualProgressBadgeText} variant="caption">
        تقدم يدوي
      </AppText>
    </View>
  );
}

export function TextField({
  label,
  value,
  placeholder,
  error,
  multiline,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="supporting">{label}</AppText>
      <View style={[styles.inputWrap, multiline && styles.multilineWrap, error && styles.fieldError]}>
        <TextInput
          accessibilityLabel={label}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={[styles.textInput, multiline && styles.multilineInput]}
          textAlign="right"
          value={value}
        />
      </View>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function AmountField({
  label,
  value,
  placeholder = '0',
  error,
  helper,
  suffix = 'ر.س',
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  suffix?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="supporting">{label}</AppText>
      <View style={[styles.amountWrap, error && styles.fieldError]}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={styles.amountInput}
          value={value}
        />
        <AppText align="left" tone="secondary" variant="caption">
          {suffix}
        </AppText>
      </View>
      {helper ? (
        <AppText tone="warning" variant="caption">
          {helper}
        </AppText>
      ) : null}
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  error,
  iconName,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="supporting">{label}</AppText>
      <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.selectWrap, error && styles.fieldError, pressed && styles.pressed]}>
        {iconName ? (
          <View style={styles.fieldIcon}>
            <Ionicons color={colors.text.tertiary} name={iconName} size={16} />
          </View>
        ) : null}
        <AppText style={styles.selectText} variant="cardTitle">
          {value || 'اختر'}
        </AppText>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      </Pressable>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function PickerSheet({
  title,
  visible,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  options: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, { paddingBottom: insets.bottom + spacing.xl }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">{title}</AppText>
          {options.map((option) => {
            const selected = option === selectedValue;

            return (
              <Pressable
                accessibilityLabel={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => onSelect(option)}
                style={({ pressed }) => [styles.optionRow, selected && styles.optionSelected, pressed && styles.pressed]}
              >
                <AppText style={selected && styles.optionSelectedText} variant="body">
                  {option}
                </AppText>
                {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

export function ConfirmSheet({
  visible,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  danger,
  onPrimaryPress,
  onSecondaryPress,
}: {
  visible: boolean;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  danger?: boolean;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onSecondaryPress} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel={secondaryLabel} onPress={onSecondaryPress} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, { paddingBottom: insets.bottom + spacing.xl }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText tone="secondary" variant="body">
            {description}
          </AppText>
          <View style={styles.confirmActions}>
            <AppButton onPress={onSecondaryPress} variant="secondary">
              {secondaryLabel}
            </AppButton>
            <AppButton onPress={onPrimaryPress} variant={danger ? 'danger' : 'primary'}>
              {primaryLabel}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <AppText style={styles.errorText} variant="caption">
      {message}
    </AppText>
  );
}

function getStatusStyle(status: StartupMetricStatus) {
  if (status === 'intervene') {
    return { accent: colors.semantic.danger, text: colors.semantic.danger, tint: colors.semantic.dangerTint };
  }

  if (status === 'watch') {
    return { accent: colors.semantic.warning, text: colors.semantic.warning, tint: colors.semantic.warningTint };
  }

  return { accent: '#3DD598', text: '#3DD598', tint: colors.semantic.successTint };
}

function getToneStyle(tone: 'success' | 'warning' | 'danger') {
  if (tone === 'danger') {
    return { border: 'rgba(229,103,90,0.3)', text: colors.semantic.danger, tint: colors.semantic.dangerTint };
  }

  if (tone === 'warning') {
    return { border: 'rgba(232,163,61,0.3)', text: colors.semantic.warning, tint: colors.semantic.warningTint };
  }

  return { border: 'rgba(79,138,91,0.3)', text: '#3DD598', tint: colors.semantic.successTint };
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 26,
  },
  headerSlot: {
    width: 38,
  },
  notice: {
    alignItems: 'flex-start',
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'rtl',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },
  noticeIcon: {
    flexShrink: 0,
    marginTop: 1,
  },
  noticeTextWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  noticeText: {
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: typography.variants.supporting.lineHeight,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radii.pill,
    height: '100%',
  },
  trendBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderRadius: radii.input,
    flexDirection: 'row',
    gap: 9,
    height: 110,
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  trendGridLine: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    height: 1,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
    top: 54,
  },
  trendBar: {
    borderRadius: radii.pill,
    flex: 1,
    maxWidth: 18,
    opacity: 0.9,
  },
  goalCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  goalTopRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  goalTitleBox: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  manualProgressBadge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  manualProgressBadgeText: {
    color: colors.semantic.warning,
  },
  statusText: {
    fontSize: 11,
  },
  goalMetaRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  fieldWrap: {
    gap: spacing.sm,
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
  multilineWrap: {
    minHeight: 112,
    paddingVertical: spacing.sm,
  },
  textInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    writingDirection: 'rtl',
  },
  multilineInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  amountWrap: {
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
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  selectWrap: {
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
  selectText: {
    flex: 1,
  },
  fieldIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.control,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  fieldError: {
    borderColor: colors.semantic.danger,
  },
  errorText: {
    color: colors.semantic.danger,
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
  optionRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.38)',
  },
  optionSelectedText: {
    color: colors.brand.calmGreen,
  },
  confirmActions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
