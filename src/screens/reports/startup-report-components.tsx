import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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

export function ReportModalHeader({
  title,
  subtitle,
  onBack,
  androidRtlLayout = false,
  subtitleWritingDirection = 'rtl',
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  androidRtlLayout?: boolean;
  subtitleWritingDirection?: 'ltr' | 'rtl';
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View style={[styles.header, useAndroidRtlLayout && styles.headerAndroid]}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName={Platform.OS === 'android' ? 'chevron-back-outline' : 'chevron-forward-outline'}
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="right" style={[styles.headerTitle, styles.rtlText]} variant="screenTitle">
          {directionSafeText(title)}
        </AppText>
        {subtitle ? (
          <AppText
            align="right"
            style={[styles.rtlText, subtitleWritingDirection === 'ltr' && styles.ltrHeaderSubtitle]}
            tone="secondary"
            variant="supporting"
          >
            {directionSafeText(subtitle)}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.headerSlot, useAndroidRtlLayout && styles.headerSlotAndroid]} />
    </View>
  );
}

export function NoticeBanner({
  message,
  tone = 'success',
  androidRtlLayout = false,
}: {
  message: string;
  tone?: 'success' | 'warning' | 'danger';
  androidRtlLayout?: boolean;
}) {
  const toneStyle = getToneStyle(tone);
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View
      style={[
        styles.notice,
        useAndroidRtlLayout && styles.noticeAndroid,
        { backgroundColor: toneStyle.tint, borderColor: toneStyle.border },
      ]}
    >
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
  const useAndroidRtlLayout = Platform.OS === 'android';
  const progress = calculateDisplayProgress(goal);
  const budgetUsage = calculateBudgetUsage(goal);
  const remainingBudget = calculateRemainingBudget(goal);
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const resolvedStatus = resolveGoalStatus(goal);
  const type = getStartupGoalTypeMeta(goal.type);
  const statusTone = resolvedStatus === 'delayed' ? 'intervene' : resolvedStatus === 'completed' ? 'good' : 'watch';
  const toneStyle = getStatusStyle(statusTone);
  const goalIcon = (
    <View style={[styles.iconBubble, { backgroundColor: toneStyle.tint }]}>
      <Ionicons color={toneStyle.accent} name={type.icon} size={19} />
    </View>
  );
  const goalTitle = (
    <View style={[styles.goalTitleBox, useAndroidRtlLayout && styles.goalTitleBoxAndroid]}>
      <AppText align="right" style={styles.rtlText} variant="cardTitle">
        {goal.title}
      </AppText>
      <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
        {type.label} · {goal.owner}
      </AppText>
    </View>
  );
  const manualBadge = goal.id === 'mrr-100k' ? <ManualProgressBadge /> : null;
  const statusBadge = <StatusBadge status={resolvedStatus} />;
  const openIcon = <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />;

  return (
    <Pressable accessibilityLabel={goal.title} accessibilityRole="button" onPress={() => onPress(goal.id)} style={({ pressed }) => [styles.goalCard, pressed && styles.pressed]}>
      <View style={[styles.goalTopRow, useAndroidRtlLayout && styles.goalTopRowAndroid]}>
        {useAndroidRtlLayout ? (
          <>
            {openIcon}
            {goalIcon}
            <View style={styles.goalIdentityArea}>
              {manualBadge}
              {statusBadge}
              {goalTitle}
            </View>
          </>
        ) : (
          <>
            {goalIcon}
            {goalTitle}
            {manualBadge}
            {statusBadge}
            {openIcon}
          </>
        )}
      </View>
      <View style={[styles.goalMetaRow, useAndroidRtlLayout && styles.goalMetaRowAndroid]}>
        <AppText align="right" style={styles.goalMetaLabel} tone="secondary" variant="caption">
          {directionSafeText(`${formatGoalNumber(goal.currentValue, goal.unit)} من ${formatGoalNumber(goal.targetValue, goal.unit)}`)}
        </AppText>
        <AppText align="left" style={[styles.goalMetaValue, { color: toneStyle.text }]} variant="caption">
          {directionSafeText(`${Math.round(progress)}%`)}
        </AppText>
      </View>
      <ProgressBar progress={progress} tone={statusTone} />
      <View style={[styles.goalMetaRow, useAndroidRtlLayout && styles.goalMetaRowAndroid]}>
        <AppText align="right" style={styles.goalMetaLabel} tone="secondary" variant="caption">
          {directionSafeText(`الميزانية ${formatSar(goal.allocatedBudget)} · المصروف ${formatSar(goal.spentBudget)}`)}
        </AppText>
        <AppText align="left" style={styles.goalMetaValue} tone="secondary" variant="caption">
          {budgetUsage === null ? 'لا توجد ميزانية مخصصة' : directionSafeText(`استهلاك ${formatPercent(budgetUsage)}`)}
        </AppText>
      </View>
      <View style={[styles.goalMetaRow, useAndroidRtlLayout && styles.goalMetaRowAndroid]}>
        <AppText align="right" style={styles.goalMetaLabel} tone={resolvedStatus === 'delayed' ? 'danger' : 'secondary'} variant="caption">
          {formatDaysRemaining(daysRemaining)}
        </AppText>
        <AppText align="left" style={styles.goalMetaValue} tone={remainingBudget < 0 ? 'danger' : 'secondary'} variant="caption">
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
  androidRtlLayout = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  androidRtlLayout?: boolean;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View style={[styles.fieldWrap, useAndroidRtlLayout && styles.fieldWrapAndroid]}>
      <FieldLabel label={label} useAndroidRtlLayout={useAndroidRtlLayout} />
      <View style={[styles.inputWrap, multiline && styles.multilineWrap, error && styles.fieldError]}>
        <TextInput
          accessibilityLabel={label}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={[styles.textInput, useAndroidRtlLayout && styles.textInputAndroid, multiline && styles.multilineInput]}
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
  androidRtlLayout = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  suffix?: string;
  onChangeText: (value: string) => void;
  androidRtlLayout?: boolean;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View style={[styles.fieldWrap, useAndroidRtlLayout && styles.fieldWrapAndroid]}>
      <FieldLabel label={label} useAndroidRtlLayout={useAndroidRtlLayout} />
      <View style={[styles.amountWrap, useAndroidRtlLayout && styles.amountWrapAndroid, error && styles.fieldError]}>
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
        <AppText align="right" style={useAndroidRtlLayout && styles.fieldHelperAndroid} tone="warning" variant="caption">
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
  androidRtlLayout = false,
}: {
  label: string;
  value: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  androidRtlLayout?: boolean;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View style={[styles.fieldWrap, useAndroidRtlLayout && styles.fieldWrapAndroid]}>
      <FieldLabel label={label} useAndroidRtlLayout={useAndroidRtlLayout} />
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.selectWrap, useAndroidRtlLayout && styles.selectWrapAndroid, error && styles.fieldError, pressed && styles.pressed]}
      >
        {useAndroidRtlLayout ? (
          <>
            <View style={styles.selectActionSlot}>
              <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
            </View>
            {iconName ? (
              <View style={styles.fieldIcon}>
                <Ionicons color={colors.text.tertiary} name={iconName} size={16} />
              </View>
            ) : null}
            <AppText align="right" style={[styles.selectText, styles.selectTextAndroid]} variant="cardTitle">
              {directionSafeText(value || 'اختر')}
            </AppText>
          </>
        ) : (
          <>
            {iconName ? (
              <View style={styles.fieldIcon}>
                <Ionicons color={colors.text.tertiary} name={iconName} size={16} />
              </View>
            ) : null}
            <AppText style={styles.selectText} variant="cardTitle">
              {value || 'اختر'}
            </AppText>
            <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
          </>
        )}
      </Pressable>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

function FieldLabel({ label, useAndroidRtlLayout }: { label: string; useAndroidRtlLayout: boolean }) {
  if (!useAndroidRtlLayout) {
    return <AppText variant="supporting">{label}</AppText>;
  }

  return (
    <View style={styles.fieldLabelWrapperAndroid}>
      <AppText align="right" style={styles.fieldLabelAndroid} variant="supporting">
        {label}
      </AppText>
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
  androidRtlLayout = false,
}: {
  title: string;
  visible: boolean;
  options: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  androidRtlLayout?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const bottomPadding = useAndroidRtlLayout
    ? insets.bottom + 48 + spacing.xl
    : insets.bottom + spacing.xl;
  const optionRows = options.map((option) => {
    const selected = option === selectedValue;

    return (
      <Pressable
        accessibilityLabel={option}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        key={option}
        onPress={() => onSelect(option)}
        style={({ pressed }) => [
          styles.optionRow,
          useAndroidRtlLayout && styles.optionRowAndroid,
          selected && styles.optionSelected,
          pressed && styles.pressed,
        ]}
      >
        <AppText
          align="right"
          style={[useAndroidRtlLayout && styles.optionTextAndroid, selected && styles.optionSelectedText]}
          variant="body"
        >
          {directionSafeText(option)}
        </AppText>
        {useAndroidRtlLayout ? (
          <View style={styles.optionCheckSlot}>
            {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} /> : null}
          </View>
        ) : selected ? (
          <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} />
        ) : null}
      </Pressable>
    );
  });

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, useAndroidRtlLayout && styles.sheetCardAndroid, { paddingBottom: bottomPadding }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText align="right" style={useAndroidRtlLayout && styles.sheetTitleAndroid} variant="sectionTitle">
            {title}
          </AppText>
          {useAndroidRtlLayout ? (
            <ScrollView
              contentContainerStyle={styles.optionList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.optionScroll}
            >
              {optionRows}
            </ScrollView>
          ) : (
            optionRows
          )}
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
  androidRtlLayout = false,
}: {
  visible: boolean;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  danger?: boolean;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  androidRtlLayout?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const bottomPadding = useAndroidRtlLayout
    ? insets.bottom + 48 + spacing.xl
    : insets.bottom + spacing.xl;

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onSecondaryPress} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel={secondaryLabel} onPress={onSecondaryPress} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, { paddingBottom: bottomPadding }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText align="right" style={useAndroidRtlLayout && styles.confirmTitleAndroid} variant="sectionTitle">
            {title}
          </AppText>
          <AppText align="right" style={useAndroidRtlLayout && styles.confirmDescriptionAndroid} tone="secondary" variant="body">
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
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerAndroid: {
    direction: 'ltr',
    width: '100%',
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
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 26,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  ltrHeaderSubtitle: {
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    width: 38,
  },
  headerSlotAndroid: {
    display: 'none',
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
  noticeAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
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
    alignItems: 'flex-end',
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
    flexDirection: 'row',
    gap: spacing.sm,
  },
  goalTopRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  goalTitleBox: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  goalTitleBoxAndroid: {
    flex: 0,
    flexShrink: 1,
  },
  goalIdentityArea: {
    alignItems: 'center',
    direction: 'ltr',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
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
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  goalMetaRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  goalMetaLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  goalMetaValue: {
    flexShrink: 0,
    textAlign: 'left',
  },
  fieldWrap: {
    gap: spacing.sm,
  },
  fieldWrapAndroid: {
    alignSelf: 'stretch',
    width: '100%',
  },
  fieldLabelWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  fieldLabelAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fieldHelperAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
  textInputAndroid: {
    textAlign: 'right',
    textAlignVertical: 'center',
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
  amountWrapAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    width: '100%',
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
  selectWrapAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  selectText: {
    flex: 1,
  },
  selectTextAndroid: {
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectActionSlot: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
    width: 16,
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
  sheetCardAndroid: {
    maxHeight: '92%',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.pill,
    height: 4,
    width: 36,
  },
  sheetTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
  optionRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
  },
  optionTextAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionCheckSlot: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
    width: 18,
  },
  optionList: {
    gap: spacing.md,
  },
  optionScroll: {
    flexGrow: 0,
    flexShrink: 1,
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
  confirmTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  confirmDescriptionAndroid: {
    alignSelf: 'stretch',
    flexShrink: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
