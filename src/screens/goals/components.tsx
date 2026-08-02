import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatFinancialAmount } from '@/components/financial/financial-amount';
import { CapitalBottomSheetHeaderSurface } from '@/components/navigation/capital-bottom-sheet-header-surface';
import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText, isolateLtr, NumericText } from '@/utils/rtl';
import { getGoalSummary, goalToneColors, type GoalStatus, type GoalTone } from './goal-utils';
import { goalTypes, type FinancialGoal, type GoalTypeId } from './goals-data';

export function GoalHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
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

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const toneStyle = goalToneColors[status.tone];

  return (
    <View style={[styles.statusBadge, { backgroundColor: toneStyle.tint, borderColor: toneStyle.border }]}>
      <AppText align="center" style={[styles.statusBadgeText, { color: toneStyle.text }]} variant="caption">
        {status.label}
      </AppText>
    </View>
  );
}

export function GoalProgressBar({ progress, tone }: { progress: number; tone: GoalTone }) {
  const clamped = Math.max(0, Math.min(progress, 100));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { backgroundColor: goalToneColors[tone].accent, width: `${clamped}%` }]} />
    </View>
  );
}

export function GoalCard({ goal, onPress }: { goal: FinancialGoal; onPress: (id: string) => void }) {
  const summary = getGoalSummary(goal);
  const toneStyle = goalToneColors[summary.displayStatus.tone];

  return (
    <Pressable
      accessibilityLabel={`${summary.name}، ${summary.type.name}، ${summary.currentAmount} من ${summary.targetAmount}، ${summary.progress}%، ${summary.displayStatus.label}`}
      accessibilityRole="button"
      onPress={() => onPress(summary.id)}
      style={({ pressed }) => [styles.goalCard, summary.completed && styles.completedCard, pressed && styles.pressed]}
    >
      <View style={styles.goalTop}>
        <View style={styles.goalIdentity}>
          <View style={[styles.goalIcon, { backgroundColor: toneStyle.tint }]}>
            <Ionicons color={toneStyle.accent} name={summary.type.icon} size={19} />
          </View>
          <View style={styles.goalCopy}>
            <AppText variant="cardTitle">{summary.name}</AppText>
            <AppText tone="secondary" variant="caption">
              {summary.type.name}
            </AppText>
          </View>
        </View>
        <GoalStatusBadge status={summary.displayStatus} />
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </View>
      <GoalProgressAmount
        currentAmount={summary.currentAmount}
        targetAmount={summary.targetAmount}
      />
      <GoalProgressBar progress={summary.progress} tone={summary.displayStatus.tone} />
      <View style={styles.cardFooter}>
        <AppText align="left" style={{ color: toneStyle.text }} variant="caption">
          {summary.progress}%
        </AppText>
        <AppText align="left" style={styles.remainingText} variant="caption">
          {directionSafeText(`${summary.remaining.toLocaleString('en-US')} ر.س`)}
        </AppText>
      </View>
      <AppText tone="secondary" variant="caption">
        {summary.completed ? `المكتمل: ${summary.completionDate}` : `المتوقع: ${summary.expectedCompletion.label}`}
      </AppText>
    </Pressable>
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
    <View style={styles.formField}>
      <AppText variant="supporting">{label}</AppText>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.selectField, error && styles.fieldError, pressed && styles.pressed]}
      >
        {iconName ? (
          <View style={styles.fieldIcon}>
            <Ionicons color={colors.text.tertiary} name={iconName} size={17} />
          </View>
        ) : null}
        <AppText style={styles.selectValue} variant="cardTitle">
          {value || 'اختر'}
        </AppText>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </Pressable>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function TextField({
  label,
  value,
  placeholder,
  error,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText variant="supporting">{label}</AppText>
      <View style={[styles.textField, error && styles.fieldError]}>
        <TextInput
          accessibilityLabel={label}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={styles.textInput}
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
  error,
  warning,
  helper,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  warning?: string;
  helper?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText variant="supporting">{label}</AppText>
      <View style={[styles.amountField, error && styles.fieldError, warning && !error && styles.fieldWarning]}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.amountInput}
          value={value}
        />
        <AppText align="left" tone="secondary" variant="caption">
          ر.س
        </AppText>
      </View>
      {helper ? (
        <AppText tone="secondary" variant="caption">
          {helper}
        </AppText>
      ) : null}
      {error ? <FieldError message={error} /> : null}
      {warning ? <FieldWarning message={warning} /> : null}
    </View>
  );
}

export function ReminderCard({
  enabled,
  day,
  onToggle,
  onDayPress,
}: {
  enabled: boolean;
  day: string;
  onToggle: (value: boolean) => void;
  onDayPress: () => void;
}) {
  return (
    <SolidCard style={styles.reminderCard}>
      <AppText variant="cardTitle">تذكير الهدف</AppText>
      <AppText tone="secondary" variant="supporting">
        ذكّرني بمتابعة تقدم الهدف شهريًا.
      </AppText>
      <View style={styles.toggleRow}>
        <AppText variant="cardTitle">تفعيل التذكير</AppText>
        <Switch
          accessibilityLabel="تفعيل التذكير"
          accessibilityRole="switch"
          onValueChange={onToggle}
          thumbColor={colors.text.primary}
          trackColor={{ false: colors.surface.disabled, true: '#35D39A' }}
          value={enabled}
        />
      </View>
      <Pressable
        accessibilityLabel="يوم التذكير"
        accessibilityRole="button"
        onPress={onDayPress}
        style={({ pressed }) => [styles.reminderDayRow, pressed && styles.pressed]}
      >
        <AppText tone="secondary" variant="caption">
          يوم التذكير
        </AppText>
        <AppText variant="cardTitle">{day}</AppText>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </Pressable>
    </SolidCard>
  );
}

export function PreviewGoalCard({
  goal,
  statusOverride,
  showAmountRows = false,
}: {
  goal: FinancialGoal;
  statusOverride?: GoalStatus;
  showAmountRows?: boolean;
}) {
  const summary = getGoalSummary(goal);
  const status = statusOverride ?? summary.displayStatus;
  const toneStyle = goalToneColors[status.tone];

  return (
    <SolidCard style={[styles.previewCard, summary.progress >= 100 && styles.completePreviewCard]}>
      <View style={styles.goalTop}>
        <View style={styles.goalIdentity}>
          <View style={[styles.goalIcon, { backgroundColor: toneStyle.tint }]}>
            <Ionicons color={toneStyle.accent} name={summary.type.icon} size={19} />
          </View>
          <View style={styles.goalCopy}>
            <AppText variant="cardTitle">{summary.name}</AppText>
            <AppText tone="secondary" variant="caption">
              {summary.type.name}
            </AppText>
          </View>
        </View>
        <GoalStatusBadge status={status} />
      </View>
      {showAmountRows ? (
        <GoalAmountRows
          currentAmount={summary.currentAmount}
          targetAmount={summary.targetAmount}
        />
      ) : (
        <GoalProgressAmount
          currentAmount={summary.currentAmount}
          targetAmount={summary.targetAmount}
        />
      )}
      <GoalProgressBar progress={summary.progress} tone={status.tone} />
      <View style={styles.cardFooter}>
        <AppText align="left" style={{ color: toneStyle.text }} variant="caption">
          {summary.progress}%
        </AppText>
        <AppText align="left" style={styles.remainingText} variant="caption">
          {directionSafeText(`${summary.remaining.toLocaleString('en-US')} ر.س`)}
        </AppText>
      </View>
    </SolidCard>
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
        <View style={styles.sheetCard}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">{title}</AppText>
          <ScrollView
            contentContainerStyle={[
              styles.optionsContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => {
              const selected = option === selectedValue;

              return (
                <Pressable
                  accessibilityLabel={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option}
                  onPress={() => onSelect(option)}
                  style={({ pressed }) => [styles.optionRow, selected && styles.optionRowSelected, pressed && styles.pressed]}
                >
                  <AppText style={selected && styles.optionTextSelected} variant="body">
                    {option}
                  </AppText>
                  {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function GoalProgressAmount({
  currentAmount,
  targetAmount,
}: {
  currentAmount: number;
  targetAmount: number;
}) {
  const current = isolateLtr(`${currentAmount.toLocaleString('en-US')} ر.س`);
  const target = isolateLtr(`${targetAmount.toLocaleString('en-US')} ر.س`);

  return (
    <AppText style={styles.progressAmountText} tone="secondary" variant="caption">
      المحقق{' '}
      <AppText style={styles.moneyText} tone="secondary" variant="caption">
        {current}
      </AppText>
      {' من '}
      <AppText style={styles.moneyText} tone="secondary" variant="caption">
        {target}
      </AppText>
    </AppText>
  );
}

function GoalAmountRows({
  currentAmount,
  targetAmount,
}: {
  currentAmount: number;
  targetAmount: number;
}) {
  return (
    <View style={styles.goalAmounts}>
      <View style={styles.goalAmountRow}>
        <AppText style={styles.goalAmountLabel} tone="secondary" variant="caption">
          المحقق
        </AppText>
        <NumericText style={styles.goalAmountValue}>
          {formatFinancialAmount(currentAmount)}
        </NumericText>
      </View>
      <View style={styles.goalAmountRow}>
        <AppText style={styles.goalAmountLabel} tone="secondary" variant="caption">
          المستهدف
        </AppText>
        <NumericText style={styles.goalAmountValue}>
          {formatFinancialAmount(targetAmount)}
        </NumericText>
      </View>
    </View>
  );
}

export function BottomConfirmSheet({
  visible,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  danger,
  primaryVariant,
  secondaryVariant,
  onPrimaryPress,
  onSecondaryPress,
}: {
  visible: boolean;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  danger?: boolean;
  primaryVariant?: 'primary' | 'secondary' | 'danger';
  secondaryVariant?: 'primary' | 'secondary' | 'danger';
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}) {
  const resolvedPrimaryVariant = primaryVariant ?? (danger ? 'danger' : 'secondary');
  const resolvedSecondaryVariant = secondaryVariant ?? (danger ? 'secondary' : 'primary');

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onSecondaryPress} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel={secondaryLabel} onPress={onSecondaryPress} style={styles.sheetBackdrop} />
        <View style={styles.confirmSheet}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText tone="secondary" variant="body">
            {description}
          </AppText>
          <View style={styles.confirmActions}>
            <AppButton onPress={onSecondaryPress} variant={resolvedSecondaryVariant}>
              {secondaryLabel}
            </AppButton>
            <AppButton onPress={onPrimaryPress} variant={resolvedPrimaryVariant}>
              {primaryLabel}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function NoticeBanner({ message, tone = 'success' }: { message: string; tone?: 'success' | 'warning' }) {
  const isWarning = tone === 'warning';

  return (
    <View style={[styles.notice, isWarning ? styles.warningNotice : styles.successNotice]}>
      <Ionicons color={isWarning ? colors.semantic.warning : '#35D39A'} name={isWarning ? 'warning-outline' : 'checkmark-circle-outline'} size={17} />
      <AppText style={{ color: isWarning ? colors.semantic.warning : '#35D39A' }} variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <AppText style={styles.errorText} variant="caption">
      {message}
    </AppText>
  );
}

export function FieldWarning({ message }: { message: string }) {
  return (
    <AppText style={styles.warningText} variant="caption">
      {message}
    </AppText>
  );
}

export function goalTypeNameToId(name: string): GoalTypeId | null {
  return goalTypes.find((type) => type.name === name)?.id ?? null;
}

export function goalTypeIdToName(id: GoalTypeId | null) {
  return id ? goalTypes.find((type) => type.id === id)?.name ?? '' : '';
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 23,
    lineHeight: 31,
  },
  headerSlot: {
    height: 42,
    width: 42,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    height: 7,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radii.pill,
    height: '100%',
  },
  goalCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  completedCard: {
    borderColor: 'rgba(53,211,154,0.28)',
  },
  goalTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  goalIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minWidth: 0,
  },
  goalIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  goalCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  progressAmountText: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  moneyText: {
    direction: 'ltr',
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  goalAmounts: {
    gap: spacing.sm,
    width: '100%',
  },
  goalAmountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 0,
    width: '100%',
  },
  goalAmountLabel: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  goalAmountValue: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remainingText: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  formField: {
    gap: spacing.sm,
  },
  textField: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  textInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  fieldIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  selectValue: {
    flex: 1,
  },
  amountField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 23,
    fontWeight: '700',
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  fieldError: {
    borderColor: colors.semantic.danger,
  },
  fieldWarning: {
    borderColor: colors.semantic.warning,
  },
  errorText: {
    color: colors.semantic.danger,
    textAlign: 'right',
  },
  warningText: {
    color: colors.semantic.warning,
    textAlign: 'right',
  },
  reminderCard: {
    gap: spacing.md,
  },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: '#1A2230',
    borderRadius: radii.control,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  reminderDayRow: {
    alignItems: 'center',
    backgroundColor: '#1A2230',
    borderRadius: radii.control,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  previewCard: {
    gap: spacing.md,
  },
  completePreviewCard: {
    backgroundColor: 'rgba(5,38,24,0.68)',
    borderColor: 'rgba(53,211,154,0.32)',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.62)',
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
    maxHeight: '82%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 42,
  },
  optionRow: {
    alignItems: 'center',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  optionsContent: {
    gap: spacing.md,
  },
  optionRowSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  optionTextSelected: {
    color: colors.brand.calmGreen,
  },
  confirmSheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  confirmActions: {
    gap: spacing.sm,
  },
  notice: {
    alignItems: 'center',
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  successNotice: {
    backgroundColor: 'rgba(53,211,154,0.10)',
    borderColor: 'rgba(53,211,154,0.24)',
  },
  warningNotice: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
