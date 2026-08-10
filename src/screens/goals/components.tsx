import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View, type ViewStyle } from 'react-native';
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

const androidPhysicalLtrRow: ViewStyle = { direction: 'ltr', flexDirection: 'row', width: '100%' };
const androidHeaderSlot: ViewStyle = { display: 'none' };

export function getGoalScreenTopPadding(topInset: number) {
  return Platform.OS === 'ios' ? spacing.sm : Math.max(topInset + spacing.sm, 48);
}

export function GoalHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-back-outline"
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="right" style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="right" style={styles.headerSubtitle} tone="secondary" variant="supporting">
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

export function GoalProgressBar({
  progress,
  tone,
  androidPhysicalLeft = false,
  androidPhysicalRight = false,
}: {
  progress: number;
  tone: GoalTone;
  androidPhysicalLeft?: boolean;
  androidPhysicalRight?: boolean;
}) {
  const clamped = Math.max(0, Math.min(progress, 100));
  const useAndroidPhysicalLeft = androidPhysicalLeft;
  const useAndroidPhysicalRight = androidPhysicalRight;

  return (
    <View style={[styles.progressTrack, useAndroidPhysicalLeft && styles.progressTrackAndroid, useAndroidPhysicalRight && styles.progressTrackAndroidRight]}>
      <View style={[styles.progressFill, { backgroundColor: goalToneColors[tone].accent, width: `${clamped}%` }]} />
    </View>
  );
}

export function GoalCard({ goal, onPress }: { goal: FinancialGoal; onPress: (id: string) => void }) {
  const summary = getGoalSummary(goal);
  const toneStyle = goalToneColors[summary.displayStatus.tone];
  const useAndroidRtlLayout = true;
  const goalChevron = <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />;
  const goalIcon = (
    <View style={[styles.goalIcon, { backgroundColor: toneStyle.tint }]}>
      <Ionicons color={toneStyle.accent} name={summary.type.icon} size={19} />
    </View>
  );
  const statusBadge = <GoalStatusBadge status={summary.displayStatus} />;
  const goalCopy = (
    <View style={[styles.goalCopy, useAndroidRtlLayout && styles.goalCopyAndroid]}>
      <AppText style={useAndroidRtlLayout ? styles.goalTitleAndroid : undefined} variant="cardTitle">
        {summary.name}
      </AppText>
      <AppText style={useAndroidRtlLayout ? styles.goalTypeAndroid : undefined} tone="secondary" variant="caption">
        {summary.type.name}
      </AppText>
    </View>
  );

  return (
    <Pressable
      accessibilityLabel={`${summary.name}، ${summary.type.name}، ${summary.currentAmount} من ${summary.targetAmount}، ${summary.progress}%، ${summary.displayStatus.label}`}
      accessibilityRole="button"
      onPress={() => onPress(summary.id)}
      style={({ pressed }) => [styles.goalCard, summary.completed && styles.completedCard, pressed && styles.pressed]}
    >
      <View style={[styles.goalTop, useAndroidRtlLayout && styles.goalTopAndroid]}>
        {useAndroidRtlLayout ? (
          <>
            {goalChevron}
            {goalIcon}
            <View style={styles.goalTopSpacerAndroid} />
            {statusBadge}
            {goalCopy}
          </>
        ) : (
          <>
            <View style={styles.goalIdentity}>
              {goalIcon}
              {goalCopy}
            </View>
            {statusBadge}
            {goalChevron}
          </>
        )}
      </View>
      <GoalProgressAmount
        androidRtlLayout={useAndroidRtlLayout}
        currentAmount={summary.currentAmount}
        targetAmount={summary.targetAmount}
      />
      <GoalProgressBar androidPhysicalLeft progress={summary.progress} tone={summary.displayStatus.tone} />
      <View style={[styles.cardFooter, useAndroidRtlLayout && styles.cardFooterAndroid]}>
        <AppText align="left" style={[{ color: toneStyle.text }, useAndroidRtlLayout && styles.cardProgressAndroid]} variant="caption">
          {summary.progress}%
        </AppText>
        <AppText align={useAndroidRtlLayout ? 'right' : 'left'} style={[styles.remainingText, useAndroidRtlLayout && styles.remainingTextAndroid]} variant="caption">
          {directionSafeText(`${summary.remaining.toLocaleString('en-US')} ر.س`)}
        </AppText>
      </View>
      <AppText style={useAndroidRtlLayout ? styles.goalMetaAndroid : undefined} tone="secondary" variant="caption">
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
  androidRtlLayout = false,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  androidRtlLayout?: boolean;
  onPress: () => void;
}) {
  const useAndroidRtlLayout = androidRtlLayout;
  const valueText = (
    <AppText style={[styles.selectValue, useAndroidRtlLayout && styles.selectValueAndroid]} variant="cardTitle">
      {useAndroidRtlLayout ? directionSafeText(value || 'اختر') : value || 'اختر'}
    </AppText>
  );
  const fieldIcon = iconName ? (
    <View style={styles.fieldIcon}>
      <Ionicons color={colors.text.tertiary} name={iconName} size={17} />
    </View>
  ) : null;
  const chevron = <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />;

  return (
    <View style={styles.formField}>
      <FormLabel androidRtlLayout={useAndroidRtlLayout} label={label} />
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.selectField, useAndroidRtlLayout && styles.selectFieldAndroid, error && styles.fieldError, pressed && styles.pressed]}
      >
        {useAndroidRtlLayout ? (
          <>
            {chevron}
            {fieldIcon}
            <View style={styles.selectValueSlotAndroid}>{valueText}</View>
          </>
        ) : (
          <>
            {valueText}
            {fieldIcon}
            {chevron}
          </>
        )}
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
  androidRtlLayout = false,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  androidRtlLayout?: boolean;
  onChangeText: (value: string) => void;
}) {
  const useAndroidRtlLayout = androidRtlLayout;

  return (
    <View style={styles.formField}>
      <FormLabel androidRtlLayout={useAndroidRtlLayout} label={label} />
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
  androidRtlLayout = false,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  warning?: string;
  helper?: string;
  androidRtlLayout?: boolean;
  onChangeText: (value: string) => void;
}) {
  const useAndroidRtlLayout = androidRtlLayout;
  const helperText = helper ? (
    <AppText style={useAndroidRtlLayout ? styles.helperTextAndroid : undefined} tone="secondary" variant="caption">
      {helper}
    </AppText>
  ) : null;

  return (
    <View style={styles.formField}>
      <FormLabel androidRtlLayout={useAndroidRtlLayout} label={label} />
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
      {helperText && useAndroidRtlLayout ? <View style={styles.helperTextWrapperAndroid}>{helperText}</View> : helperText}
      {error ? <FieldError message={error} /> : null}
      {warning ? <FieldWarning message={warning} /> : null}
    </View>
  );
}

export function ReminderCard({
  enabled,
  day,
  androidRtlLayout = false,
  onToggle,
  onDayPress,
}: {
  enabled: boolean;
  day: string;
  androidRtlLayout?: boolean;
  onToggle: (value: boolean) => void;
  onDayPress: () => void;
}) {
  const useAndroidRtlLayout = androidRtlLayout;
  const reminderTitle = (
    <AppText style={useAndroidRtlLayout ? styles.reminderTextAndroid : undefined} variant="cardTitle">
      تذكير الهدف
    </AppText>
  );
  const reminderDescription = (
    <AppText style={useAndroidRtlLayout ? styles.reminderTextAndroid : undefined} tone="secondary" variant="supporting">
      ذكّرني بمتابعة تقدم الهدف شهريًا.
    </AppText>
  );
  const toggleLabel = (
    <AppText style={useAndroidRtlLayout ? styles.toggleLabelAndroid : undefined} variant="cardTitle">
      تفعيل التذكير
    </AppText>
  );
  const reminderSwitch = (
    <Switch
      accessibilityLabel="تفعيل التذكير"
      accessibilityRole="switch"
      onValueChange={onToggle}
      thumbColor={colors.text.primary}
      trackColor={{ false: colors.surface.disabled, true: '#35D39A' }}
      value={enabled}
    />
  );
  const dayLabel = (
    <AppText style={useAndroidRtlLayout ? styles.reminderDayLabelAndroid : undefined} tone="secondary" variant="caption">
      يوم التذكير
    </AppText>
  );
  const dayValue = (
    <AppText style={useAndroidRtlLayout ? styles.reminderDayValueAndroid : undefined} variant="cardTitle">
      {day}
    </AppText>
  );
  const dayChevron = <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />;

  return (
    <SolidCard style={styles.reminderCard}>
      {useAndroidRtlLayout ? (
        <View style={styles.reminderCopyAndroid}>
          {reminderTitle}
          {reminderDescription}
        </View>
      ) : (
        <>
          {reminderTitle}
          {reminderDescription}
        </>
      )}
      <View style={[styles.toggleRow, useAndroidRtlLayout && styles.toggleRowAndroid]}>
        {useAndroidRtlLayout ? (
          <>
            {reminderSwitch}
            {toggleLabel}
          </>
        ) : (
          <>
            {toggleLabel}
            {reminderSwitch}
          </>
        )}
      </View>
      <Pressable
        accessibilityLabel="يوم التذكير"
        accessibilityRole="button"
        onPress={onDayPress}
        style={({ pressed }) => [styles.reminderDayRow, useAndroidRtlLayout && styles.reminderDayRowAndroid, pressed && styles.pressed]}
      >
        {useAndroidRtlLayout ? (
          <>
            {dayChevron}
            <View style={styles.reminderDaySpacerAndroid} />
            {dayLabel}
            {dayValue}
          </>
        ) : (
          <>
            {dayLabel}
            {dayValue}
            {dayChevron}
          </>
        )}
      </Pressable>
    </SolidCard>
  );
}

export function PreviewGoalCard({
  goal,
  statusOverride,
  showAmountRows = false,
  androidRtlLayout = false,
  androidRtlHeader = false,
}: {
  goal: FinancialGoal;
  statusOverride?: GoalStatus;
  showAmountRows?: boolean;
  androidRtlLayout?: boolean;
  androidRtlHeader?: boolean;
}) {
  const summary = getGoalSummary(goal);
  const status = statusOverride ?? summary.displayStatus;
  const toneStyle = goalToneColors[status.tone];
  const useAndroidRtlLayout = androidRtlLayout;
  const useAndroidRtlHeader = androidRtlLayout || androidRtlHeader;
  const goalIcon = (
    <View style={[styles.goalIcon, { backgroundColor: toneStyle.tint }]}>
      <Ionicons color={toneStyle.accent} name={summary.type.icon} size={19} />
    </View>
  );
  const goalCopy = (
    <View style={[styles.goalCopy, useAndroidRtlHeader && styles.goalCopyAndroid]}>
      <AppText style={useAndroidRtlHeader ? styles.goalTitleAndroid : undefined} variant="cardTitle">
        {summary.name}
      </AppText>
      <AppText style={useAndroidRtlHeader ? styles.goalTypeAndroid : undefined} tone="secondary" variant="caption">
        {summary.type.name}
      </AppText>
    </View>
  );
  const statusBadge = <GoalStatusBadge status={status} />;

  return (
    <SolidCard style={[styles.previewCard, summary.progress >= 100 && styles.completePreviewCard]}>
      <View style={[styles.goalTop, useAndroidRtlHeader && styles.goalTopAndroid]}>
        {useAndroidRtlHeader ? (
          <>
            {goalIcon}
            <View style={styles.goalTopSpacerAndroid} />
            {statusBadge}
            {goalCopy}
          </>
        ) : (
          <>
            <View style={styles.goalIdentity}>
              {goalIcon}
              {goalCopy}
            </View>
            {statusBadge}
          </>
        )}
      </View>
      {showAmountRows ? (
        <GoalAmountRows
          currentAmount={summary.currentAmount}
          targetAmount={summary.targetAmount}
        />
      ) : useAndroidRtlLayout ? (
        <View style={styles.previewProgressAmountWrapperAndroid}>
          <GoalProgressAmount
            androidRtlLayout
            currentAmount={summary.currentAmount}
            targetAmount={summary.targetAmount}
          />
        </View>
      ) : (
        <GoalProgressAmount
          currentAmount={summary.currentAmount}
          targetAmount={summary.targetAmount}
        />
      )}
      <GoalProgressBar androidPhysicalRight={useAndroidRtlLayout} progress={summary.progress} tone={status.tone} />
      <View style={[styles.cardFooter, useAndroidRtlLayout && styles.cardFooterAndroid]}>
        <AppText align="left" style={[{ color: toneStyle.text }, useAndroidRtlLayout && styles.cardProgressAndroid]} variant="caption">
          {summary.progress}%
        </AppText>
        <AppText align={useAndroidRtlLayout ? 'right' : 'left'} style={[styles.remainingText, useAndroidRtlLayout && styles.remainingTextAndroid]} variant="caption">
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
  androidRtlLayout = false,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  options: readonly string[];
  selectedValue: string;
  androidRtlLayout?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const useAndroidRtlLayout = androidRtlLayout;
  const titleText = (
    <AppText style={useAndroidRtlLayout ? styles.sheetTitleAndroid : undefined} variant="sectionTitle">
      {title}
    </AppText>
  );

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={styles.sheetCard}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleWrapper}>{titleText}</View>
          </View>
          <View style={styles.sheetDivider} />
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
              const optionText = (
                <AppText style={[useAndroidRtlLayout && styles.optionTextAndroid, selected && styles.optionTextSelected]} variant="body">
                  {useAndroidRtlLayout ? directionSafeText(option) : option}
                </AppText>
              );
              const selectedIcon = selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} /> : null;

              return (
                <Pressable
                  accessibilityLabel={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option}
                  onPress={() => onSelect(option)}
                  style={({ pressed }) => [styles.optionRow, useAndroidRtlLayout && styles.optionRowAndroid, selected && styles.optionRowSelected, pressed && styles.pressed]}
                >
                  {useAndroidRtlLayout ? (
                    <>
                      <View style={styles.optionCheckSlotAndroid}>{selectedIcon}</View>
                      <View style={styles.optionSpacerAndroid} />
                      <View style={styles.optionTextSlotAndroid}>{optionText}</View>
                    </>
                  ) : (
                    <>
                      {optionText}
                      {selectedIcon}
                    </>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FormLabel({ label, androidRtlLayout }: { label: string; androidRtlLayout: boolean }) {
  const labelText = (
    <AppText style={styles.formLabel} variant="supporting">
      {label}
    </AppText>
  );

  return androidRtlLayout ? <View style={styles.formLabelWrapperAndroid}>{labelText}</View> : labelText;
}

function GoalProgressAmount({
  currentAmount,
  targetAmount,
  androidRtlLayout = false,
}: {
  currentAmount: number;
  targetAmount: number;
  androidRtlLayout?: boolean;
}) {
  const current = isolateLtr(`${currentAmount.toLocaleString('en-US')} ر.س`);
  const target = isolateLtr(`${targetAmount.toLocaleString('en-US')} ر.س`);

  return (
    <AppText style={[styles.progressAmountText, androidRtlLayout && styles.progressAmountTextAndroid]} tone="secondary" variant="caption">
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
  androidRtlLayout = false,
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
  androidRtlLayout?: boolean;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  const resolvedPrimaryVariant = primaryVariant ?? (danger ? 'danger' : 'secondary');
  const resolvedSecondaryVariant = secondaryVariant ?? (danger ? 'secondary' : 'primary');
  const useAndroidRtlLayout = androidRtlLayout;
  const titleText = (
    <AppText style={useAndroidRtlLayout ? styles.confirmTitleAndroid : undefined} variant="sectionTitle">
      {title}
    </AppText>
  );
  const descriptionText = (
    <AppText style={useAndroidRtlLayout ? styles.confirmDescriptionAndroid : undefined} tone="secondary" variant="body">
      {description}
    </AppText>
  );

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onSecondaryPress} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel={secondaryLabel} onPress={onSecondaryPress} style={styles.sheetBackdrop} />
        <View style={[styles.confirmSheet, useAndroidRtlLayout && { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.lg) }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          {useAndroidRtlLayout ? (
            <View style={styles.confirmCopyAndroid}>
              {titleText}
              {descriptionText}
            </View>
          ) : (
            <>
              {titleText}
              {descriptionText}
            </>
          )}
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

export function NoticeBanner({
  message,
  tone = 'success',
  androidRtlLayout = false,
}: {
  message: string;
  tone?: 'success' | 'warning';
  androidRtlLayout?: boolean;
}) {
  const isWarning = tone === 'warning';
  const useAndroidRtlLayout = androidRtlLayout;

  return (
    <View style={[styles.notice, useAndroidRtlLayout && styles.noticeAndroid, isWarning ? styles.warningNotice : styles.successNotice]}>
      <Ionicons color={isWarning ? colors.semantic.warning : '#35D39A'} name={isWarning ? 'warning-outline' : 'checkmark-circle-outline'} size={17} />
      <AppText style={[{ color: isWarning ? colors.semantic.warning : '#35D39A' }, useAndroidRtlLayout && styles.noticeTextAndroid]} variant="supporting">
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    ...androidPhysicalLtrRow,
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
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 23,
    lineHeight: 31,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 42,
    width: 42,
    ...androidHeaderSlot,
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
  progressTrackAndroid: {
    alignItems: 'flex-start',
    direction: 'ltr',
  },
  progressTrackAndroidRight: {
    alignItems: 'flex-end',
    direction: 'ltr',
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
  goalTopAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  goalTopSpacerAndroid: {
    flex: 0.25,
    minWidth: spacing.xs,
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
  goalCopyAndroid: {
    alignItems: 'flex-end',
  },
  goalTitleAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  goalTypeAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  progressAmountText: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  progressAmountTextAndroid: {
    alignSelf: 'stretch',
    width: '100%',
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
  cardFooterAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  cardProgressAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  remainingText: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  remainingTextAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  goalMetaAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  formField: {
    gap: spacing.sm,
  },
  formLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  selectFieldAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
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
  selectValueAndroid: {
    flex: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  selectValueSlotAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
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
    width: '100%',
    writingDirection: 'rtl',
  },
  warningText: {
    color: colors.semantic.warning,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  formLabelWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  helperTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  helperTextWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  reminderCard: {
    gap: spacing.md,
  },
  reminderCopyAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.md,
    width: '100%',
  },
  reminderTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
  toggleRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  toggleLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  reminderDayRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  reminderDaySpacerAndroid: {
    flex: 1,
    minWidth: spacing.xs,
  },
  reminderDayLabelAndroid: {
    flexShrink: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  reminderDayValueAndroid: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewCard: {
    gap: spacing.md,
  },
  previewProgressAmountWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
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
    maxHeight: '82%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sheetHeader: {
    gap: spacing.md,
    minHeight: 60,
    paddingBottom: spacing.md,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 42,
  },
  sheetTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sheetTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sheetDivider: {
    backgroundColor: colors.surface.separator,
    height: StyleSheet.hairlineWidth,
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
  optionRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  optionCheckSlotAndroid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
  },
  optionSpacerAndroid: {
    flex: 1,
    minWidth: spacing.sm,
  },
  optionTextSlotAndroid: {
    alignItems: 'flex-end',
    flexShrink: 1,
    minWidth: 0,
  },
  optionTextAndroid: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionsContent: {
    gap: spacing.md,
    paddingTop: spacing.md,
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
  confirmCopyAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.lg,
    width: '100%',
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
  noticeAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  noticeTextAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
