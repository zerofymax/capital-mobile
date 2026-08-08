import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { useThemeColors } from '@/state/appearance-state';
import {
  addCategory,
  clearCategoriesNotice,
  deleteCategory,
  getCategoryTransactionCount,
  isCategoryNameDuplicate,
  updateCategory,
  useCategoriesStore,
  type CategoryTone,
  type CategoryType,
  type FinancialCategory,
} from '@/state/categories-state';
import { colors as staticColors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';

type CategoryFormState = {
  name: string;
  type: CategoryType;
  icon: keyof typeof Ionicons.glyphMap;
  tone: CategoryTone;
  description: string;
};

type CategorySheetMode =
  | { type: 'add'; category?: undefined }
  | { type: 'edit'; category: FinancialCategory };

const typeTabs: { id: CategoryType; label: string }[] = [
  { id: 'income', label: 'الإيرادات' },
  { id: 'expense', label: 'المصروفات' },
];

const iconOptions: (keyof typeof Ionicons.glyphMap)[] = [
  'briefcase-outline',
  'cash-outline',
  'receipt-outline',
  'megaphone-outline',
  'people-outline',
  'business-outline',
  'cube-outline',
  'trending-up-outline',
];

const toneOptions: { id: CategoryTone; label: string }[] = [
  { id: 'green', label: 'أخضر' },
  { id: 'blue', label: 'أزرق' },
  { id: 'amber', label: 'ذهبي' },
  { id: 'red', label: 'أحمر' },
  { id: 'muted', label: 'هادئ' },
];

function createEmptyForm(type: CategoryType): CategoryFormState {
  return {
    name: '',
    type,
    icon: type === 'income' ? 'cash-outline' : 'receipt-outline',
    tone: type === 'income' ? 'green' : 'blue',
    description: '',
  };
}

function createEditForm(category: FinancialCategory): CategoryFormState {
  return {
    name: category.name,
    type: category.type,
    icon: category.icon,
    tone: category.tone,
    description: category.description ?? '',
  };
}

export function CategoriesScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { categories, notice } = useCategoriesStore();
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetMode, setSheetMode] = useState<CategorySheetMode | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<FinancialCategory | null>(null);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = normalizeQuery(searchQuery);

    return categories.filter((category) => {
      if (category.type !== activeType) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return normalizeQuery(category.name).includes(normalizedQuery);
    });
  }, [activeType, categories, searchQuery]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearCategoriesNotice, 2500);

    return () => clearTimeout(timeout);
  }, [notice]);

  function openAddSheet() {
    Haptics.selectionAsync().catch(() => null);
    setSheetMode({ type: 'add' });
  }

  function openEditSheet(category: FinancialCategory) {
    Haptics.selectionAsync().catch(() => null);
    setSheetMode({ type: 'edit', category });
  }

  function handleDeleteConfirm() {
    if (deleteCandidate) {
      deleteCategory(deleteCandidate.id);
    }

    setDeleteCandidate(null);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background.base }]}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom) },
        ]}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <ModalHeader
          onBack={() => router.back()}
          subtitle="نظّم عملياتك باستخدام تصنيفات واضحة للإيرادات والمصروفات."
          title="التصنيفات"
        />

        {notice ? <Notice message={notice} /> : null}

        <View style={styles.tabs}>
          {typeTabs.map((tab) => {
            const selected = activeType === tab.id;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={tab.id}
                onPress={() => {
                  setActiveType(tab.id);
                  setSearchQuery('');
                }}
                style={({ pressed }) => [
                  styles.tab,
                  {
                    backgroundColor: selected ? colors.brand.green : colors.surface.card,
                    borderColor: selected ? colors.brand.mediumGreen : colors.surface.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <AppText align="center" style={selected && styles.activeTabText} variant="buttonLabel">
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.surface.card, borderColor: colors.surface.inputBorder }]}>
          <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
          <TextInput
            onChangeText={setSearchQuery}
            placeholder="ابحث عن تصنيف"
            placeholderTextColor={colors.text.tertiary}
            style={[styles.searchInput, { color: colors.text.primary }]}
            value={searchQuery}
          />
        </View>

        <View style={styles.list}>
          {filteredCategories.map((category) => (
            <CategoryCard
              category={category}
              key={category.id}
              onDelete={() => setDeleteCandidate(category)}
              onEdit={() => openEditSheet(category)}
            />
          ))}
        </View>

        <AppButton iconName="add-outline" onPress={openAddSheet}>
          إضافة تصنيف
        </AppButton>
      </ScrollView>

      <CategoryFormSheet
        activeType={activeType}
        mode={sheetMode}
        onClose={() => setSheetMode(null)}
      />

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="حذف"
        description="لن يتم حذف العمليات المرتبطة به، وسيتم نقلها إلى «أخرى» أو إبقاؤها دون تصنيف وفق بنية البيانات الحالية."
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="هل تريد حذف هذا التصنيف؟"
        tone="danger"
        visible={Boolean(deleteCandidate)}
      />
    </SafeAreaView>
  );
}

function ModalHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  const colors = useThemeColors();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: colors.surface.card, borderColor: colors.surface.border },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={21} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText style={styles.headerText} variant="screenTitle">
          {title}
        </AppText>
        <AppText style={styles.headerText} tone="secondary" variant="supporting">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: FinancialCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  const tone = getToneColors(category.tone, colors);
  const transactions = getCategoryTransactionCount(category.name);

  return (
    <SolidCard style={styles.categoryCard}>
      <View style={styles.cardActions}>
        <Pressable accessibilityLabel="تعديل التصنيف" accessibilityRole="button" onPress={onEdit} style={styles.iconButton}>
          <Ionicons color={colors.text.tertiary} name="create-outline" size={18} />
        </Pressable>
        <Pressable accessibilityLabel="حذف التصنيف" accessibilityRole="button" onPress={onDelete} style={styles.iconButton}>
          <Ionicons color={category.isDefault ? colors.text.disabled : colors.semantic.danger} name="trash-outline" size={17} />
        </Pressable>
      </View>
      <View style={styles.categoryCopy}>
        <View style={styles.categoryTitleRow}>
          <AppText numberOfLines={1} style={styles.categoryName} variant="cardTitle">
            {directionSafeText(category.name)}
          </AppText>
          <View style={[styles.statusBadge, { backgroundColor: category.isDefault ? colors.semantic.successTint : colors.surface.muted }]}>
            <AppText align="center" tone={category.isDefault ? 'success' : 'secondary'} variant="caption">
              {category.isDefault ? 'افتراضي' : 'مخصص'}
            </AppText>
          </View>
        </View>
        <AppText style={styles.categoryMeta} tone="secondary" variant="caption">
          {directionSafeText(
            `${category.type === 'income' ? 'إيراد' : 'مصروف'} · ${transactions.toLocaleString('en-US')} عمليات`,
          )}
        </AppText>
        {category.description ? (
          <AppText numberOfLines={2} style={styles.categoryDescription} tone="secondary" variant="caption">
            {directionSafeText(category.description)}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.categoryIcon, { backgroundColor: tone.tint, borderColor: tone.border }]}>
        <Ionicons color={tone.color} name={category.icon} size={20} />
      </View>
    </SolidCard>
  );
}

function CategoryFormSheet({
  mode,
  activeType,
  onClose,
}: {
  mode: CategorySheetMode | null;
  activeType: CategoryType;
  onClose: () => void;
}) {
  if (!mode) {
    return null;
  }

  return (
    <CategoryFormSheetContent
      activeType={activeType}
      key={mode.type === 'edit' ? mode.category.id : `add-${activeType}`}
      mode={mode}
      onClose={onClose}
    />
  );
}

function CategoryFormSheetContent({
  mode,
  activeType,
  onClose,
}: {
  mode: CategorySheetMode;
  activeType: CategoryType;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const [form, setForm] = useState<CategoryFormState>(() =>
    mode.type === 'edit' ? createEditForm(mode.category) : createEmptyForm(activeType),
  );
  const [error, setError] = useState<string | null>(null);

  function updateForm(values: Partial<CategoryFormState>) {
    setError(null);
    setForm((current) => ({ ...current, ...values }));
  }

  function handleSave() {
    Keyboard.dismiss();
    const name = form.name.trim();

    if (!name) {
      setError('اسم التصنيف مطلوب');
      return;
    }

    const duplicate = isCategoryNameDuplicate(form.type, name, mode.type === 'edit' ? mode.category.id : undefined);

    if (duplicate) {
      setError('لا يمكن تكرار اسم التصنيف داخل النوع نفسه');
      return;
    }

    if (mode.type === 'edit') {
      updateCategory(mode.category.id, {
        description: form.description.trim(),
        icon: form.icon,
        name,
        tone: form.tone,
      });
    } else {
      addCategory({
        description: form.description.trim(),
        icon: form.icon,
        name,
        tone: form.tone,
        type: form.type,
      });
    }

    onClose();
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheet, { backgroundColor: colors.surface.card, borderColor: colors.surface.border }]}>
          <View style={[styles.sheetGrabber, { backgroundColor: colors.text.tertiary }]} />
          <View style={styles.sheetTitleWrap}>
            <AppText style={styles.sheetTitle} variant="sectionTitle">
              {mode.type === 'edit' ? 'تعديل التصنيف' : 'إضافة تصنيف'}
            </AppText>
          </View>

          <TextField
            error={error}
            label="اسم التصنيف"
            onChangeText={(value) => updateForm({ name: value })}
            placeholder="مثال: خدمات تقنية"
            value={form.name}
          />

          <View style={styles.sheetSection}>
            <AppText style={styles.sheetSectionTitle} variant="cardTitle">النوع</AppText>
            <View style={styles.choiceRow}>
              {typeTabs.map((tab) => (
                <ChoiceChip
                  disabled={mode.type === 'edit'}
                  key={tab.id}
                  label={tab.id === 'income' ? 'إيراد' : 'مصروف'}
                  onPress={() => updateForm({ type: tab.id })}
                  selected={form.type === tab.id}
                />
              ))}
            </View>
          </View>

          <View style={styles.sheetSection}>
            <AppText style={styles.sheetSectionTitle} variant="cardTitle">الأيقونة</AppText>
            <View style={styles.iconGrid}>
              {iconOptions.map((icon) => (
                <Pressable
                  accessibilityLabel={icon}
                  accessibilityRole="button"
                  accessibilityState={{ selected: form.icon === icon }}
                  key={icon}
                  onPress={() => updateForm({ icon })}
                  style={({ pressed }) => [
                    styles.iconOption,
                    { backgroundColor: colors.surface.muted, borderColor: colors.surface.border },
                    form.icon === icon && { borderColor: colors.brand.mediumGreen },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons color={form.icon === icon ? colors.brand.calmGreen : colors.text.tertiary} name={icon} size={19} />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sheetSection}>
            <AppText style={styles.sheetSectionTitle} variant="cardTitle">اللون</AppText>
            <View style={styles.choiceRow}>
              {toneOptions.map((tone) => (
                <ChoiceChip
                  key={tone.id}
                  label={tone.label}
                  onPress={() => updateForm({ tone: tone.id })}
                  selected={form.tone === tone.id}
                />
              ))}
            </View>
          </View>

          <TextField
            label="وصف اختياري"
            multiline
            onChangeText={(value) => updateForm({ description: value })}
            placeholder="أضف وصفًا مختصرًا"
            value={form.description}
          />

          <View style={styles.sheetActions}>
            <AppButton onPress={handleSave}>{mode.type === 'edit' ? 'حفظ التعديل' : 'إضافة التصنيف'}</AppButton>
            <AppButton onPress={onClose} variant="secondary">
              إلغاء
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string | null;
  multiline?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.field}>
      <AppText style={styles.fieldLabel} variant="cardTitle">{label}</AppText>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            backgroundColor: colors.surface.muted,
            borderColor: error ? colors.semantic.danger : colors.surface.inputBorder,
            color: colors.text.primary,
          },
        ]}
        value={value}
      />
      {error ? (
        <AppText style={styles.fieldError} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceChip,
        {
          backgroundColor: selected ? colors.brand.green : colors.surface.muted,
          borderColor: selected ? colors.brand.mediumGreen : colors.surface.border,
          opacity: disabled && !selected ? 0.55 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <AppText align="center" style={selected && styles.activeTabText} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}

function Notice({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.notice}>
      <Ionicons color={staticColors.semantic.success} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="success" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function getToneColors(tone: CategoryTone, colors: typeof staticColors) {
  const tones: Record<CategoryTone, { color: string; tint: string; border: string }> = {
    green: { color: colors.brand.calmGreen, tint: colors.semantic.successTint, border: 'rgba(79,138,91,0.28)' },
    blue: { color: '#4EA1FF', tint: 'rgba(42,129,211,0.13)', border: 'rgba(42,129,211,0.24)' },
    amber: { color: colors.semantic.warning, tint: colors.semantic.warningTint, border: 'rgba(232,163,61,0.26)' },
    red: { color: colors.semantic.danger, tint: colors.semantic.dangerTint, border: 'rgba(229,103,90,0.24)' },
    muted: { color: colors.text.tertiary, tint: colors.surface.muted, border: colors.surface.border },
  };

  return tones[tone];
}

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar-SA');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
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
  tabs: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  tab: {
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  activeTabText: {
    color: staticColors.brand.lightNeutral,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 48,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  list: {
    gap: spacing.md,
  },
  categoryCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  categoryCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  categoryTitleRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    width: '100%',
  },
  categoryName: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryMeta: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  categoryDescription: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  cardActions: {
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  notice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  sheet: {
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    maxHeight: '92%',
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetGrabber: {
    alignSelf: 'center',
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.45,
    width: 36,
  },
  sheetTitleWrap: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sheetTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  field: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
  },
  fieldLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fieldError: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  input: {
    borderRadius: radii.input,
    borderWidth: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  multilineInput: {
    minHeight: 76,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  sheetSection: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
  },
  sheetSectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  choiceRow: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choiceChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconGrid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sheetActions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
