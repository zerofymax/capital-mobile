import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, StateScreen } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type HomeWidgetId = 'available-cash' | 'financial-health' | 'ai-summary' | 'quick-actions';
type VisibleHomeWidgetId = Exclude<HomeWidgetId, 'quick-actions'>;
type ReportPeriodPreference = 'monthly' | 'quarterly' | 'annual';

type HomeCustomizationState = {
  order: HomeWidgetId[];
  visibility: Record<VisibleHomeWidgetId, boolean>;
  defaultReportPeriod: ReportPeriodPreference;
};

type ReportPeriodOption = {
  id: ReportPeriodPreference;
  label: string;
};

const widgetTitleById: Record<HomeWidgetId, string> = {
  'available-cash': 'النقد المتاح',
  'financial-health': 'مؤشر الصحة المالية',
  'ai-summary': 'ملخص الذكاء المالي',
  'quick-actions': 'إجراءات سريعة',
};

const visibleWidgetIds: VisibleHomeWidgetId[] = ['available-cash', 'financial-health', 'ai-summary'];

const reportPeriodOptions: ReportPeriodOption[] = [
  { id: 'monthly', label: 'شهري' },
  { id: 'quarterly', label: 'ربع سنوي' },
  { id: 'annual', label: 'سنوي' },
];

const defaultCustomization: HomeCustomizationState = {
  order: ['available-cash', 'financial-health', 'ai-summary', 'quick-actions'],
  visibility: {
    'available-cash': true,
    'financial-health': true,
    'ai-summary': true,
  },
  defaultReportPeriod: 'monthly',
};

export function HomeCustomizationScreen() {
  const insets = useSafeAreaInsets();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [baseline, setBaseline] = useState<HomeCustomizationState>(defaultCustomization);
  const [settings, setSettings] = useState<HomeCustomizationState>(defaultCustomization);
  const [expandedWidgetId, setExpandedWidgetId] = useState<HomeWidgetId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const dirty = useMemo(() => !areCustomizationStatesEqual(settings, baseline), [baseline, settings]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showRestoreDialog) {
        setShowRestoreDialog(false);
        return true;
      }

      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty && !saved) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, saved, showRestoreDialog, showUnsavedDialog]);

  function goBackToAccount() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function handleBackPress() {
    if (dirty && !saved) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToAccount();
  }

  function moveWidget(widgetId: HomeWidgetId, direction: 'up' | 'down') {
    setFeedback(null);
    setSettings((current) => {
      const index = current.order.indexOf(widgetId);
      const nextIndex = direction === 'up' ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.order.length) {
        return current;
      }

      const nextOrder = [...current.order];
      const [item] = nextOrder.splice(index, 1);
      if (!item) {
        return current;
      }
      nextOrder.splice(nextIndex, 0, item);

      return { ...current, order: nextOrder };
    });
  }

  function toggleWidget(widgetId: VisibleHomeWidgetId, value: boolean) {
    setFeedback(null);
    setSettings((current) => {
      if (!value) {
        const visibleCount = visibleWidgetIds.filter((id) => current.visibility[id]).length;
        if (visibleCount <= 1 && current.visibility[widgetId]) {
          setFeedback('يجب إبقاء وحدة واحدة على الأقل ظاهرة');
          return current;
        }
      }

      return {
        ...current,
        visibility: {
          ...current.visibility,
          [widgetId]: value,
        },
      };
    });
  }

  function selectReportPeriod(defaultReportPeriod: ReportPeriodPreference) {
    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    setSettings((current) => ({ ...current, defaultReportPeriod }));
  }

  function handleRestoreConfirm() {
    setShowRestoreDialog(false);
    setExpandedWidgetId(null);
    setSettings(defaultCustomization);
    setFeedback('تمت استعادة الإعدادات الافتراضية');
  }

  function handleSavePress() {
    if (saving) {
      return;
    }

    if (!hasVisibleMainWidget(settings)) {
      setFeedback('يجب إبقاء وحدة واحدة على الأقل ظاهرة');
      return;
    }

    setSaving(true);
    setFeedback(null);
    saveTimerRef.current = setTimeout(() => {
      setBaseline(settings);
      setSaving(false);
      setSaved(true);
    }, 550);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBackToAccount();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  if (saved) {
    return (
      <StateScreen
        description="تم تطبيق إعدادات العرض محليًا في النموذج التجريبي."
        iconName="checkmark-outline"
        onPrimaryAction={() => router.replace(routes.account)}
        onSecondaryAction={() => router.replace(routes.home)}
        primaryActionLabel="العودة إلى الحساب"
        secondaryActionLabel="عرض الصفحة الرئيسية"
        title="تم حفظ تخصيص الصفحة الرئيسية"
      />
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <HomeCustomizationHeader
          onBackPress={handleBackPress}
          onRestorePress={() => setShowRestoreDialog(true)}
        />
        <AppText style={styles.introText} tone="secondary" variant="supporting">
          رتّب الوحدات — اسحب لإعادة الترتيب
        </AppText>

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.feedbackText} tone="warning" variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <WidgetOrderSection
          expandedWidgetId={expandedWidgetId}
          order={settings.order}
          onMove={moveWidget}
          onToggleExpanded={(widgetId) => setExpandedWidgetId((current) => (current === widgetId ? null : widgetId))}
        />

        <VisibilitySection settings={settings} onToggle={toggleWidget} />

        <ReportPeriodSection selectedPeriod={settings.defaultReportPeriod} onSelect={selectReportPeriod} />

        <View style={styles.actions}>
          <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
            {saving ? 'جاري الحفظ' : 'حفظ التخصيص'}
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="استعادة"
        description="سيتم فقدان ترتيبك وتفضيلاتك الحالية."
        onCancel={() => setShowRestoreDialog(false)}
        onConfirm={handleRestoreConfirm}
        title="استعادة الصفحة الرئيسية الافتراضية؟"
        tone="warning"
        visible={showRestoreDialog}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، لن يتم حفظ تخصيص الصفحة الرئيسية."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </View>
  );
}

function HomeCustomizationHeader({
  onBackPress,
  onRestorePress,
}: {
  onBackPress: () => void;
  onRestorePress: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الحساب"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        تخصيص الصفحة الرئيسية
      </AppText>
      <Pressable
        accessibilityLabel="استعادة الافتراضي"
        accessibilityRole="button"
        onPress={onRestorePress}
        style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
      >
        <AppText align="center" tone="link" variant="caption">
          استعادة الافتراضي
        </AppText>
      </Pressable>
    </View>
  );
}

function WidgetOrderSection({
  order,
  expandedWidgetId,
  onToggleExpanded,
  onMove,
}: {
  order: HomeWidgetId[];
  expandedWidgetId: HomeWidgetId | null;
  onToggleExpanded: (widgetId: HomeWidgetId) => void;
  onMove: (widgetId: HomeWidgetId, direction: 'up' | 'down') => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">ترتيب الوحدات</AppText>
      <SolidCard style={styles.rowsCard}>
        {order.map((widgetId, index) => {
          const widget = getWidgetDefinition(widgetId);
          const expanded = expandedWidgetId === widgetId;

          return (
            <View key={widgetId}>
              <Pressable
                accessibilityLabel={`${widget.title}. خيارات الترتيب`}
                accessibilityRole="button"
                onPress={() => onToggleExpanded(widgetId)}
                style={({ pressed }) => [styles.orderRow, pressed && styles.pressed]}
              >
                <AppText style={styles.rowTitle} variant="body">
                  {widget.title}
                </AppText>
                <Ionicons color={colors.text.tertiary} name="reorder-three-outline" size={22} />
              </Pressable>
              {expanded ? (
                <View style={styles.reorderActions}>
                  <ReorderAction
                    disabled={index === 0}
                    label="تحريك لأعلى"
                    onPress={() => onMove(widgetId, 'up')}
                  />
                  <ReorderAction
                    disabled={index === order.length - 1}
                    label="تحريك لأسفل"
                    onPress={() => onMove(widgetId, 'down')}
                  />
                </View>
              ) : null}
              {index < order.length - 1 ? <Divider /> : null}
            </View>
          );
        })}
      </SolidCard>
    </View>
  );
}

function ReorderAction({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.reorderAction, disabled && styles.disabledAction, pressed && !disabled && styles.pressed]}
    >
      <AppText align="center" tone={disabled ? 'tertiary' : 'link'} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}

function VisibilitySection({
  settings,
  onToggle,
}: {
  settings: HomeCustomizationState;
  onToggle: (widgetId: VisibleHomeWidgetId, value: boolean) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">إظهار / إخفاء</AppText>
      <SolidCard style={styles.rowsCard}>
        {visibleWidgetIds.map((widgetId, index) => {
          const widget = getWidgetDefinition(widgetId);
          const enabled = settings.visibility[widgetId];

          return (
            <View key={widgetId}>
              <Pressable
                accessibilityLabel={widget.title}
                accessibilityRole="switch"
                accessibilityState={{ checked: enabled }}
                onPress={() => onToggle(widgetId, !enabled)}
                style={({ pressed }) => [styles.switchRow, pressed && styles.pressed]}
              >
                <AppText style={styles.rowTitle} variant="body">
                  {widget.title}
                </AppText>
                <Switch
                  ios_backgroundColor={colors.surface.muted}
                  onValueChange={(value) => onToggle(widgetId, value)}
                  thumbColor={enabled ? colors.text.inverse : colors.text.tertiary}
                  trackColor={{ false: colors.surface.muted, true: colors.brand.green }}
                  value={enabled}
                />
              </Pressable>
              {index < visibleWidgetIds.length - 1 ? <Divider /> : null}
            </View>
          );
        })}
      </SolidCard>
    </View>
  );
}

function ReportPeriodSection({
  selectedPeriod,
  onSelect,
}: {
  selectedPeriod: ReportPeriodPreference;
  onSelect: (period: ReportPeriodPreference) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">الفترة الافتراضية للتقارير</AppText>
      <View accessibilityRole="radiogroup" style={styles.segmentedControl}>
        {reportPeriodOptions.map((option) => {
          const selected = option.id === selectedPeriod;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.segmentOption,
                selected && styles.segmentOptionSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getWidgetDefinition(widgetId: HomeWidgetId) {
  return { id: widgetId, title: widgetTitleById[widgetId] };
}

function hasVisibleMainWidget(settings: HomeCustomizationState) {
  return visibleWidgetIds.some((widgetId) => settings.visibility[widgetId]);
}

function areCustomizationStatesEqual(left: HomeCustomizationState, right: HomeCustomizationState) {
  return (
    left.defaultReportPeriod === right.defaultReportPeriod &&
    left.order.length === right.order.length &&
    left.order.every((widgetId, index) => widgetId === right.order[index]) &&
    visibleWidgetIds.every((widgetId) => left.visibility[widgetId] === right.visibility[widgetId])
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  restoreButton: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
    width: 82,
  },
  introText: {
    lineHeight: 21,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackText: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  orderRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 62,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowTitle: {
    flex: 1,
  },
  reorderActions: {
    backgroundColor: colors.surface.muted,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  reorderAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  disabledAction: {
    backgroundColor: colors.surface.disabled,
    borderColor: colors.surface.border,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  segmentedControl: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.xs,
  },
  segmentOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: 'transparent',
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.40)',
  },
  actions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
