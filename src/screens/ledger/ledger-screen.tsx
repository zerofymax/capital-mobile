import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FinancialAmount,
  HorizontalFilterChips,
  LedgerDateGroup,
  LedgerFab,
  LedgerFilterChip,
  LedgerSearchField,
  TimeRangeSelector,
} from '@/components/financial';
import { EmptyState } from '@/components/feedback';
import {
  getTabScreenContentBottomPadding,
  tabScreenContentInsetAdjustmentBehavior,
} from '@/components/navigation';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText, NumericText } from '@/utils/rtl';
import {
  calculateTransactionSummary,
  clearTransactionsNotice,
  filterTransactions,
  getTransactionCategoriesForType,
  groupLedgerTransactions,
  hasActiveTransactionFilters,
  resetTransactionFilters,
  transactionDateOptions,
  transactionPeriodOptions,
  transactionSortOptions,
  transactionTypeFilters,
  type LedgerTransaction,
  type TransactionFilters,
} from './ledger-data';
import { useTransactionsStore } from './ledger-data';

const transactionDateOptionsNewestFirst = [...transactionDateOptions]
  .filter((option, index, options) => options.findIndex((item) => item.value === option.value) === index)
  .sort((first, second) => second.value.localeCompare(first.value));

type AddOperationKind = 'income' | 'expense' | 'subscription' | 'commitment';

export function LedgerScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, notice } = useTransactionsStore();
  const [filters, setFilters] = useState<TransactionFilters>(() => resetTransactionFilters());
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const addNavigationPendingRef = useRef(false);

  const visibleTransactions = useMemo(() => filterTransactions(transactions, filters), [filters, transactions]);
  const summary = useMemo(
    () => calculateTransactionSummary(transactions, filters.period, filters.customRange),
    [filters.customRange, filters.period, transactions],
  );
  const filteredGroups = useMemo(() => groupLedgerTransactions(visibleTransactions), [visibleTransactions]);
  const hasTransactions = transactions.length > 0;
  const hasResults = visibleTransactions.length > 0;
  const activeFilters = hasActiveTransactionFilters(filters);

  function updateFilters(updater: (current: TransactionFilters) => TransactionFilters) {
    setFilters((current) => updater(current));
  }

  function handleClearFilters() {
    Haptics.selectionAsync().catch(() => null);
    setFilters(resetTransactionFilters());
  }

  function handleAddTransactionPress() {
    Haptics.selectionAsync().catch(() => null);
    setAddSheetVisible(true);
  }

  function closeAddTransactionSheet() {
    addNavigationPendingRef.current = false;
    setAddSheetVisible(false);
  }

  function openAddOperation(kind: AddOperationKind) {
    if (addNavigationPendingRef.current) {
      return;
    }

    addNavigationPendingRef.current = true;
    setAddSheetVisible(false);

    setTimeout(() => {
      if (kind === 'income' || kind === 'expense') {
        router.push({
          pathname: kind === 'income' ? routes.addIncome : routes.addExpense,
          params: { type: kind },
        });
      } else {
        router.push(kind === 'subscription' ? routes.addRecurringExpense : routes.addCommitment);
      }

      setTimeout(() => {
        addNavigationPendingRef.current = false;
      }, 450);
    }, 90);
  }

  function handleTransactionPress(transaction: LedgerTransaction) {
    Haptics.selectionAsync().catch(() => null);
    router.push({
      pathname: routes.transactionDetail,
      params: { transactionId: transaction.id },
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.7, y: 1 }}
        locations={[0, 0.55, 1]}
        start={{ x: 0.3, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(spacing.safeTop - insets.top, 0),
              paddingBottom: getTabScreenContentBottomPadding(insets.bottom) + spacing.xxl,
            },
          ]}
          contentInsetAdjustmentBehavior={tabScreenContentInsetAdjustmentBehavior}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <LedgerHeader
          activeFilters={activeFilters}
          onFilterPress={() => {
            Haptics.selectionAsync().catch(() => null);
            setFilterSheetVisible(true);
          }}
        />

        {notice ? (
          <Pressable
            accessibilityRole="button"
            onPress={clearTransactionsNotice}
            style={({ pressed }) => [styles.notice, pressed && styles.pressed]}
          >
            <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="success" variant="supporting">
              {notice}
            </AppText>
          </Pressable>
        ) : null}

        <SummaryCard summary={summary} />
        <LedgerSearchField
          onChangeText={(query) => updateFilters((current) => ({ ...current, query }))}
          onClear={() => updateFilters((current) => ({ ...current, query: '' }))}
          value={filters.query}
        />

        <TimeRangeSelector
          options={transactionPeriodOptions.map((period) => ({ id: period.key, label: period.label }))}
          selectedValue={filters.period}
          onSelect={(period) => updateFilters((current) => ({ ...current, period }))}
        />

        <HorizontalFilterChips
          items={transactionTypeFilters.map((filter) => ({ id: filter.key, label: filter.label }))}
          selectedValue={filters.type}
          onChange={(type) => updateFilters((current) => ({ ...current, type, categoryIds: [] }))}
        />

        <View style={styles.groups}>
          {hasResults ? (
            filteredGroups.map((group) => (
              <LedgerDateGroup group={group} key={group.id} onTransactionPress={handleTransactionPress} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              {hasTransactions ? (
                <EmptyState
                  actionLabel="مسح الفلاتر"
                  message="جرّب تغيير البحث أو إزالة بعض الفلاتر."
                  onActionPress={handleClearFilters}
                  title="لا توجد نتائج مطابقة"
                />
              ) : (
                <EmptyState
                  actionLabel="تسجيل دخل"
                  message="ابدأ بتسجيل أول دخل أو مصروف لمتابعة حركة نشاطك."
                  onActionPress={handleAddTransactionPress}
                  title="لا توجد عمليات بعد"
                />
              )}
            </View>
          )}
        </View>
        </ScrollView>
      </SafeAreaView>
      <LedgerFab onPress={handleAddTransactionPress} />
      <AddTransactionSheet
        onClose={closeAddTransactionSheet}
        onSelect={openAddOperation}
        visible={addSheetVisible}
      />
      <TransactionFilterSheet
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        onClose={() => setFilterSheetVisible(false)}
        visible={filterSheetVisible}
      />
    </View>
  );
}

function LedgerHeader({ activeFilters, onFilterPress }: { activeFilters: boolean; onFilterPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="تصفية العمليات"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onFilterPress}
        style={({ pressed }) => [styles.headerButton, activeFilters && styles.headerButtonActive, pressed && styles.pressed]}
      >
        <Ionicons color={activeFilters ? colors.brand.green : colors.text.muted} name="filter-outline" size={18} />
        {activeFilters ? <View style={styles.activeFilterDot} /> : null}
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText style={styles.headerText} numberOfLines={1} variant="screenTitle">
          العمليات
        </AppText>
        <AppText style={styles.headerText} tone="secondary" variant="supporting">
          تابع دخلك ومصروفاتك في مكان واحد.
        </AppText>
      </View>
    </View>
  );
}

function SummaryCard({ summary }: { summary: ReturnType<typeof calculateTransactionSummary> }) {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIcon}>
          <Ionicons color={colors.brand.calmGreen} name="analytics-outline" size={18} />
        </View>
        <View style={styles.summaryCopy}>
          <AppText style={styles.summaryTitle} variant="cardTitle">ملخص الفترة</AppText>
          <AppText style={styles.summaryDescription} tone="secondary" variant="caption">
            الملخص يتأثر بالفترة الزمنية فقط.
          </AppText>
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryMetric label="إجمالي الدخل" tone="success" value={summary.totalIncome} />
        <SummaryMetric label="إجمالي المصروفات" tone="danger" value={summary.totalExpenses} />
        <SummaryMetric label="الصافي" signed tone={summary.net >= 0 ? 'success' : 'danger'} value={summary.net} />
        <SummaryMetric label="عدد العمليات" plainValue={String(summary.count)} tone="primary" />
      </View>
    </SolidCard>
  );
}

function SummaryMetric({
  label,
  value,
  plainValue,
  tone,
  signed = false,
}: {
  label: string;
  value?: number;
  plainValue?: string;
  tone: 'primary' | 'success' | 'danger';
  signed?: boolean;
}) {
  return (
    <View style={styles.summaryMetric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      {plainValue ? (
        <NumericText style={[styles.summaryValue, styles.plainSummaryValue]}>{plainValue}</NumericText>
      ) : (
        <FinancialAmount
          signed={signed}
          size="metric"
          tone={tone === 'primary' ? 'primary' : tone}
          value={signed ? value ?? 0 : Math.abs(value ?? 0)}
        />
      )}
    </View>
  );
}

function AddTransactionSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (kind: AddOperationKind) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق خيارات الإضافة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxxl) }]}>
          <View style={styles.sheetHandle} />
          <View style={[styles.sheetHeader, styles.addSheetHeader]}>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <AppText tone="link" variant="supporting">
                إغلاق
              </AppText>
            </Pressable>
            <AppText style={styles.addSheetTitle} variant="sectionTitle">إضافة عملية</AppText>
          </View>
          <ScrollView contentContainerStyle={styles.sheetActions} showsVerticalScrollIndicator={false}>
            <ActionChoice
              description="سجّل دفعة أو إيرادًا جديدًا."
              icon="arrow-up-outline"
              label="إضافة دخل"
              onPress={() => onSelect('income')}
              tone="success"
            />
            <ActionChoice
              description="أضف تكلفة أو عملية دفع."
              icon="arrow-down-outline"
              label="إضافة مصروف"
              onPress={() => onSelect('expense')}
              tone="danger"
            />
            <ActionChoice
              description="سجّل اشتراكًا أو تكلفة دورية."
              icon="repeat-outline"
              label="إضافة مصروف متكرر"
              onPress={() => onSelect('subscription')}
              tone="neutral"
            />
            <ActionChoice
              description="سجّل مبلغًا مستحقًا أو فاتورة للدفع لاحقًا."
              icon="document-text-outline"
              label="إضافة التزام"
              onPress={() => onSelect('commitment')}
              tone="neutral"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ActionChoice({
  label,
  description,
  icon,
  tone,
  onPress,
}: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'success' | 'danger' | 'neutral';
  onPress: () => void;
}) {
  const toneStyle = tone === 'success' ? styles.successIcon : tone === 'danger' ? styles.dangerIcon : styles.neutralIcon;
  const toneColor = tone === 'success' ? colors.semantic.success : tone === 'danger' ? colors.semantic.danger : colors.brand.calmGreen;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress();
      }}
      style={({ pressed }) => [styles.actionChoice, pressed && styles.pressed]}
    >
      <View style={styles.actionLeading}>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
        <View style={[styles.actionIcon, toneStyle]}>
          <Ionicons color={toneColor} name={icon} size={18} />
        </View>
      </View>
      <View style={styles.actionCopy}>
        <AppText style={styles.actionLabel} variant="buttonLabel">
          {label}
        </AppText>
        <AppText numberOfLines={2} style={styles.actionDescription} tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

function TransactionFilterSheet({
  visible,
  filters,
  onChange,
  onClear,
  onClose,
}: {
  visible: boolean;
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const categoryTypes = filters.type === 'income' ? ['income'] : filters.type === 'expense' ? ['expense'] : ['income', 'expense'];
  const categories = categoryTypes.flatMap((type) => getTransactionCategoriesForType(type as 'income' | 'expense'));

  function update(nextFilters: TransactionFilters) {
    onChange(nextFilters);
  }

  function toggleCategory(categoryId: string) {
    const selected = filters.categoryIds.includes(categoryId);
    update({
      ...filters,
      categoryIds: selected
        ? filters.categoryIds.filter((id) => id !== categoryId)
        : [...filters.categoryIds, categoryId],
    });
  }

  function selectCustomDate(field: 'startDate' | 'endDate', value: string) {
    const nextRange = { ...filters.customRange, [field]: value };
    const safeRange =
      nextRange.endDate < nextRange.startDate
        ? { startDate: nextRange.startDate, endDate: nextRange.startDate }
        : nextRange;

    update({ ...filters, customRange: safeRange });
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق الفلاتر" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.filterSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <AppText variant="sectionTitle">فلاتر العمليات</AppText>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <AppText tone="link" variant="supporting">
                تم
              </AppText>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.filterContent} showsVerticalScrollIndicator={false}>
            <FilterSection title="نوع العملية">
              <HorizontalFilterChips
                items={transactionTypeFilters.map((option) => ({ id: option.key, label: option.label }))}
                selectedValue={filters.type}
                onChange={(type) => update({ ...filters, type, categoryIds: [] })}
              />
            </FilterSection>

            <FilterSection title="التصنيف">
              <View style={styles.optionWrap}>
                {categories.map((category) => (
                  <LedgerFilterChip
                    key={category.id}
                    label={category.name}
                    onPress={() => toggleCategory(category.id)}
                    selected={filters.categoryIds.includes(category.id)}
                  />
                ))}
              </View>
            </FilterSection>

            <FilterSection title="الترتيب">
              <View style={styles.optionWrap}>
                {transactionSortOptions.map((option) => (
                  <LedgerFilterChip
                    key={option.key}
                    label={option.label}
                    onPress={() => update({ ...filters, sortOrder: option.key })}
                    selected={filters.sortOrder === option.key}
                  />
                ))}
              </View>
            </FilterSection>

            <FilterSection title="الفترة المخصصة">
              <AppText style={styles.filterDescription} tone="secondary" variant="caption">
                فعّل «فترة مخصصة» من شريط الفترة ثم اختر البداية والنهاية.
              </AppText>
              <View style={styles.customDates}>
                <CustomDateColumn
                  label="تاريخ البداية"
                  onSelect={(value) => selectCustomDate('startDate', value)}
                  selectedValue={filters.customRange.startDate}
                />
                <CustomDateColumn
                  label="تاريخ النهاية"
                  onSelect={(value) => selectCustomDate('endDate', value)}
                  selectedValue={filters.customRange.endDate}
                />
              </View>
            </FilterSection>

            <AppButton onPress={onClear} variant="secondary">
              مسح الفلاتر
            </AppButton>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FilterSection({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.filterSection}>
      <AppText style={styles.filterSectionTitle} variant="cardTitle">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function CustomDateColumn({
  label,
  selectedValue,
  onSelect,
}: {
  label: string;
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.customDateColumn}>
      <AppText style={styles.filterSectionTitle} tone="secondary" variant="caption">
        {label}
      </AppText>
      <View style={styles.optionWrap}>
        {transactionDateOptionsNewestFirst.map((option) => (
          <LedgerFilterChip
            key={`${label}-${option.value}`}
            label={directionSafeText(option.label)}
            onPress={() => onSelect(option.value)}
            selected={selectedValue === option.value}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
    width: '100%',
  },
  headerCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    width: 38,
  },
  headerButtonActive: {
    borderColor: 'rgba(79,138,91,0.42)',
  },
  activeFilterDot: {
    backgroundColor: colors.brand.green,
    borderRadius: radii.pill,
    height: 7,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 7,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.24)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  summaryCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryMetric: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  summaryValue: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  plainSummaryValue: {
    color: colors.text.primary,
  },
  successText: {
    color: colors.semantic.success,
  },
  dangerText: {
    color: colors.semantic.danger,
  },
  filtersScroller: {
    direction: 'ltr',
    marginHorizontal: -16,
  },
  filtersContent: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexGrow: 1,
    gap: spacing.sm,
    paddingLeft: 16,
    paddingRight: 16,
  },
  groups: {
    gap: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    maxHeight: '82%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  filterSheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    maxHeight: '82%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    height: 4,
    width: 44,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addSheetHeader: {
    direction: 'ltr',
    gap: spacing.md,
  },
  addSheetTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sheetActions: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  actionChoice: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  actionLeading: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: 12,
  },
  successIcon: {
    backgroundColor: colors.semantic.successTint,
  },
  dangerIcon: {
    backgroundColor: colors.semantic.dangerTint,
  },
  neutralIcon: {
    backgroundColor: 'rgba(167,200,161,0.10)',
  },
  actionCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  actionLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  filterContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  filterSection: {
    gap: spacing.md,
  },
  filterSectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  filterDescription: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  customDates: {
    gap: spacing.md,
  },
  customDateColumn: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
