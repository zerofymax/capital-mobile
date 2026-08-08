import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalBottomSheetHeaderSurface } from '@/components/navigation/capital-bottom-sheet-header-surface';
import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import { getBudgetSummary, toneColors, type BudgetTone } from './budget-utils';
import { budgetCategories, type Budget, type BudgetCategoryId } from './budgets-data';

const androidPhysicalLtrRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row' as const, width: '100%' as const }
  : {};
const androidHeaderSlot = Platform.OS === 'android' ? { display: 'none' as const } : {};

export function BudgetHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
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

export function BudgetStatusBadge({ label, tone }: { label: string; tone: BudgetTone }) {
  const toneStyle = toneColors[tone];

  return (
    <View style={[styles.statusBadge, { backgroundColor: toneStyle.tint, borderColor: toneStyle.border }]}>
      <AppText align="center" style={[styles.statusBadgeText, { color: toneStyle.text }]} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

export function BudgetProgressBar({
  usage,
  tone,
  marker,
  androidPhysicalLeft = false,
}: {
  usage: number;
  tone: BudgetTone;
  marker?: number;
  androidPhysicalLeft?: boolean;
}) {
  const clampedUsage = Math.max(0, Math.min(usage, 100));
  const clampedMarker = typeof marker === 'number' ? Math.max(0, Math.min(marker, 100)) : null;
  const toneStyle = toneColors[tone];
  const useAndroidPhysicalLeft = Platform.OS === 'android' && androidPhysicalLeft;

  return (
    <View style={[styles.progressTrack, useAndroidPhysicalLeft && styles.progressTrackAndroid]}>
      <View style={[styles.progressFill, { backgroundColor: toneStyle.accent, width: `${clampedUsage}%` }]} />
      {clampedMarker !== null ? <View style={[styles.progressMarker, { right: `${100 - clampedMarker}%` }]} /> : null}
    </View>
  );
}

export function BudgetCategoryCard({ budget, onPress }: { budget: Budget; onPress: (id: string) => void }) {
  const summary = getBudgetSummary(budget);
  const toneStyle = toneColors[summary.status.tone];
  const useAndroidRtlLayout = Platform.OS === 'android';
  const categoryIcon = (
    <View style={[styles.categoryIcon, { backgroundColor: toneStyle.tint }]}>
      <Ionicons color={toneStyle.accent} name={summary.category.icon} size={19} />
    </View>
  );
  const statusBadge = <BudgetStatusBadge label={summary.status.label} tone={summary.status.tone} />;
  const cardChevron = <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />;
  const usageLabel = (
    <AppText style={useAndroidRtlLayout ? styles.cardUsageLabelAndroid : undefined} tone="secondary" variant="caption">
      المصروف
    </AppText>
  );
  const usageValue = (
    <AppText align="left" style={useAndroidRtlLayout ? styles.cardUsageValueAndroid : undefined} tone="secondary" variant="caption">
      {directionSafeText(`من ${formatLabel(summary.budget)}، ${formatLabel(summary.spent)}`)}
    </AppText>
  );

  return (
    <Pressable
      accessibilityLabel={`${summary.category.name}، المصروف ${formatLabel(summary.spent)}، الميزانية ${formatLabel(summary.budget)}، المتبقي ${formatLabel(summary.remaining)}، ${summary.status.label}`}
      accessibilityRole="button"
      onPress={() => onPress(summary.id)}
      style={({ pressed }) => [
        styles.budgetCard,
        summary.status.tone === 'danger' && styles.dangerBudgetCard,
        pressed && styles.pressed,
      ]}
    >
      {useAndroidRtlLayout ? (
        <View style={[styles.budgetCardTop, styles.budgetCardTopAndroid]}>
          {cardChevron}
          {categoryIcon}
          <View style={styles.budgetCardTopSpacerAndroid} />
          {statusBadge}
          <View style={[styles.categoryCopy, styles.categoryCopyAndroid]}>
            <AppText style={styles.categoryNameAndroid} variant="cardTitle">
              {summary.category.name}
            </AppText>
            <View style={styles.remainingMetaRowAndroid}>
              <AppText align="left" style={[styles.remainingAmount, styles.remainingAmountAndroid]} variant="caption">
                {formatLabel(summary.remaining)}
              </AppText>
              <AppText style={styles.remainingLabelAndroid} tone="secondary" variant="caption">
                المتبقي
              </AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.budgetCardTop}>
          <View style={styles.categoryIdentity}>
            {categoryIcon}
            <View style={styles.categoryCopy}>
              <AppText variant="cardTitle">{summary.category.name}</AppText>
              {statusBadge}
            </View>
          </View>
          <View style={styles.cardAmountColumn}>
            <AppText align="left" style={styles.remainingAmount} variant="caption">
              {formatLabel(summary.remaining)}
            </AppText>
            <AppText align="left" tone="secondary" variant="caption">
              المتبقي
            </AppText>
          </View>
          {cardChevron}
        </View>
      )}
      <View style={[styles.cardUsageRow, useAndroidRtlLayout && styles.cardUsageRowAndroid]}>
        {useAndroidRtlLayout ? (
          <>
            {usageValue}
            {usageLabel}
          </>
        ) : (
          <>
            {usageLabel}
            {usageValue}
          </>
        )}
      </View>
      <BudgetProgressBar androidPhysicalLeft tone={summary.status.tone} usage={summary.usage} />
    </Pressable>
  );
}

export function SummaryMiniCard({ budget, androidRtlLayout = false }: { budget: Budget; androidRtlLayout?: boolean }) {
  const summary = getBudgetSummary(budget);
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const categoryIcon = (
    <View style={[styles.categoryIcon, { backgroundColor: toneColors[summary.status.tone].tint }]}>
      <Ionicons color={toneColors[summary.status.tone].accent} name={summary.category.icon} size={18} />
    </View>
  );
  const statusBadge = <BudgetStatusBadge label={summary.status.label} tone={summary.status.tone} />;
  const usageLabel = (
    <AppText style={useAndroidRtlLayout ? styles.cardUsageLabelAndroid : undefined} tone="secondary" variant="caption">
      المصروف
    </AppText>
  );
  const usageValue = (
    <AppText align="left" style={useAndroidRtlLayout ? styles.cardUsageValueAndroid : undefined} tone="secondary" variant="caption">
      {directionSafeText(`من ${formatLabel(summary.budget)}، ${formatLabel(summary.spent)}`)}
    </AppText>
  );

  return (
    <SolidCard style={[styles.previewCard, summary.status.tone === 'danger' && styles.dangerPreviewCard]}>
      {useAndroidRtlLayout ? (
        <View style={[styles.previewTop, styles.previewTopAndroid]}>
          {categoryIcon}
          <View style={styles.previewTopSpacerAndroid} />
          {statusBadge}
          <View style={[styles.categoryCopy, styles.categoryCopyAndroid]}>
            <AppText style={styles.categoryNameAndroid} variant="cardTitle">
              {summary.category.name}
            </AppText>
            <View style={styles.remainingMetaRowAndroid}>
              <AppText align="left" style={[styles.remainingAmount, styles.remainingAmountAndroid]} variant="caption">
                {formatLabel(summary.remaining)}
              </AppText>
              <AppText style={styles.remainingLabelAndroid} tone="secondary" variant="caption">
                المتبقي
              </AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.previewTop}>
          <View style={styles.categoryIdentity}>
            {categoryIcon}
            <View style={styles.categoryCopy}>
              <AppText variant="cardTitle">{summary.category.name}</AppText>
              {statusBadge}
            </View>
          </View>
          <View style={styles.cardAmountColumn}>
            <AppText align="left" style={styles.remainingAmount} variant="caption">
              {formatLabel(summary.remaining)}
            </AppText>
            <AppText align="left" tone="secondary" variant="caption">
              المتبقي
            </AppText>
          </View>
        </View>
      )}
      <View style={[styles.cardUsageRow, useAndroidRtlLayout && styles.cardUsageRowAndroid]}>
        {useAndroidRtlLayout ? (
          <>
            {usageValue}
            {usageLabel}
          </>
        ) : (
          <>
            {usageLabel}
            {usageValue}
          </>
        )}
      </View>
      <BudgetProgressBar androidPhysicalLeft={useAndroidRtlLayout} tone={summary.status.tone} usage={summary.usage} />
      <AppText align={useAndroidRtlLayout ? 'right' : 'left'} style={[{ color: toneColors[summary.status.tone].text }, useAndroidRtlLayout && styles.previewAlertAndroid]} variant="caption">
        {directionSafeText(`تنبيه عند ${summary.alertThreshold}% — نسبة الاستخدام ${summary.usage}%`)}
      </AppText>
    </SolidCard>
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
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const valueText = (
    <AppText style={[styles.selectValue, useAndroidRtlLayout && styles.selectValueAndroid]} variant="cardTitle">
      {value || 'اختر'}
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
      <AppText style={styles.formLabel} variant="supporting">{label}</AppText>
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

export function AmountField({
  label,
  value,
  error,
  warning,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  warning?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText style={styles.formLabel} variant="supporting">{label}</AppText>
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
      {error ? <FieldError message={error} /> : null}
      {warning ? <FieldWarning message={warning} /> : null}
    </View>
  );
}

export function ThresholdSelector({
  value,
  androidRtlLayout = false,
  androidFirstOptionOnLeft = false,
  onChange,
}: {
  value: number;
  androidRtlLayout?: boolean;
  androidFirstOptionOnLeft?: boolean;
  onChange: (value: number) => void;
}) {
  const options = [70, 80, 90] as const;
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const useAndroidFirstOptionOnLeft = Platform.OS === 'android' && androidFirstOptionOnLeft;

  return (
    <View
      style={[
        styles.thresholdGroup,
        useAndroidRtlLayout && styles.thresholdGroupAndroid,
        useAndroidFirstOptionOnLeft && styles.thresholdGroupFirstOptionOnLeftAndroid,
      ]}
    >
      {options.map((option) => (
        <Pressable
          accessibilityLabel={`تنبيه عند ${option}%`}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}
          key={option}
          onPress={() => onChange(option)}
          style={({ pressed }) => [styles.thresholdChip, value === option && styles.thresholdChipActive, pressed && styles.pressed]}
        >
          <AppText align="center" style={[useAndroidRtlLayout && styles.thresholdTextAndroid, value === option && styles.thresholdChipTextActive]} variant="buttonLabel">
            {option}%
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

export function ToggleRow({
  enabled,
  androidRtlLayout = false,
  onValueChange,
}: {
  enabled: boolean;
  androidRtlLayout?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const label = (
    <AppText style={useAndroidRtlLayout ? styles.toggleLabelAndroid : undefined} variant="cardTitle">
      تفعيل التنبيه
    </AppText>
  );
  const toggle = (
    <Switch
      accessibilityLabel="تفعيل التنبيه"
      accessibilityRole="switch"
      onValueChange={onValueChange}
      thumbColor={colors.text.primary}
      trackColor={{ false: colors.surface.disabled, true: '#35D39A' }}
      value={enabled}
    />
  );

  return (
    <View style={[styles.toggleRow, useAndroidRtlLayout && styles.toggleRowAndroid]}>
      {useAndroidRtlLayout ? (
        <>
          {toggle}
          {label}
        </>
      ) : (
        <>
          {label}
          {toggle}
        </>
      )}
    </View>
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
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const titleText = (
    <AppText style={useAndroidRtlLayout ? styles.sheetTitleAndroid : undefined} variant="sectionTitle">
      {title}
    </AppText>
  );

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, { paddingBottom: insets.bottom + spacing.xl }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          {useAndroidRtlLayout ? <View style={styles.sheetTitleWrapperAndroid}>{titleText}</View> : titleText}
          {options.map((option) => {
            const selected = option === selectedValue;
            const optionText = (
              <AppText style={[useAndroidRtlLayout && styles.optionTextAndroid, selected && styles.optionTextSelected]} variant="body">
                {option}
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
                    {selectedIcon}
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
        </View>
      </View>
    </Modal>
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
  const insets = useSafeAreaInsets();
  const resolvedPrimaryVariant = primaryVariant ?? (danger ? 'danger' : 'secondary');
  const resolvedSecondaryVariant = secondaryVariant ?? (danger ? 'secondary' : 'primary');

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onSecondaryPress} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel={secondaryLabel} onPress={onSecondaryPress} style={styles.sheetBackdrop} />
        <View style={[styles.confirmSheet, { paddingBottom: insets.bottom + spacing.xl }]}>
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
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

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

export function createPreviewBudget(categoryId: BudgetCategoryId, amount: number, month: string, threshold: number, alertEnabled: boolean, spent = 0) {
  return {
    id: 'preview-budget',
    categoryId,
    budget: amount,
    spent,
    month,
    alertThreshold: threshold,
    alertEnabled,
    createdAt: '1 يوليو 2026',
  } satisfies Budget;
}

export function categoryNameToId(name: string): BudgetCategoryId | null {
  return budgetCategories.find((category) => category.name === name)?.id ?? null;
}

export function categoryIdToName(id: BudgetCategoryId | null) {
  return id ? budgetCategories.find((category) => category.id === id)?.name ?? '' : '';
}

function formatLabel(value: number) {
  const abs = Math.abs(value).toLocaleString('en-US');

  return `${value < 0 ? '-' : ''}${abs} ر.س`;
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
  progressFill: {
    borderRadius: radii.pill,
    height: '100%',
  },
  progressMarker: {
    backgroundColor: colors.semantic.warning,
    height: '100%',
    position: 'absolute',
    width: 2,
  },
  budgetCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  dangerBudgetCard: {
    backgroundColor: 'rgba(32,11,13,0.58)',
    borderColor: 'rgba(229,103,90,0.24)',
  },
  budgetCardTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  budgetCardTopAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  budgetCardTopSpacerAndroid: {
    flex: 0.25,
    minWidth: spacing.xs,
  },
  categoryIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minWidth: 0,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  categoryCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  categoryCopyAndroid: {
    alignItems: 'flex-end',
  },
  categoryNameAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  remainingMetaRowAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    width: '100%',
  },
  remainingAmountAndroid: {
    flexShrink: 0,
    textAlign: 'left',
  },
  remainingLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardAmountColumn: {
    alignItems: 'flex-start',
    minWidth: 76,
  },
  remainingAmount: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    writingDirection: 'ltr',
  },
  cardUsageRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  cardUsageRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  cardUsageLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardUsageValueAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  previewCard: {
    gap: spacing.md,
  },
  dangerPreviewCard: {
    backgroundColor: 'rgba(32,11,13,0.62)',
    borderColor: 'rgba(229,103,90,0.32)',
  },
  previewTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  previewTopAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  previewTopSpacerAndroid: {
    flex: 0.25,
    minWidth: spacing.xs,
  },
  previewAlertAndroid: {
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
  thresholdGroup: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  thresholdGroupAndroid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    width: '100%',
  },
  thresholdGroupFirstOptionOnLeftAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  thresholdTextAndroid: {
    writingDirection: 'ltr',
  },
  thresholdChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  thresholdChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  thresholdChipTextActive: {
    color: colors.brand.lightNeutral,
  },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
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
    padding: spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 42,
  },
  sheetTitleWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  sheetTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
