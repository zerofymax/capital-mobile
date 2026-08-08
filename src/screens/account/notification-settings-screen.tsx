import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

import {
  budgetAlertThresholdOptions,
  defaultNotificationSettings,
  getReminderLeadTimeLabel,
  lowBalanceThresholdOptions,
  notificationChannels,
  notificationSettingsSections,
  prototypeCompanyCurrency,
  quietHoursEndOptions,
  quietHoursStartOptions,
  reminderLeadTimeOptions,
  type BudgetAlertThreshold,
  type NotificationChannel,
  type NotificationPreferenceId,
  type NotificationSettingsState,
  type QuietHoursTime,
  type ReminderLeadTime,
} from './notification-settings-data';

type SelectFieldId = 'invoice-reminder' | 'budget-threshold' | 'quiet-start' | 'quiet-end';

const saveMessage = 'تم حفظ تفضيلات الإشعارات في النسخة التجريبية.';
const comingSoonMessage = 'هذه القناة قادمة في تحديث لاحق.';

let savedPrototypeSettings: NotificationSettingsState = defaultNotificationSettings;

export function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [baseline, setBaseline] = useState<NotificationSettingsState>(savedPrototypeSettings);
  const [settings, setSettings] = useState<NotificationSettingsState>(savedPrototypeSettings);
  const [activeSelect, setActiveSelect] = useState<SelectFieldId | null>(null);
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const dirty = useMemo(() => !areNotificationSettingsEqual(settings, baseline), [baseline, settings]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeSelect) {
        setActiveSelect(null);
        return true;
      }

      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [activeSelect, dirty, showUnsavedDialog]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function handleBackPress() {
    if (dirty) {
      setShowUnsavedDialog(true);
      return;
    }

    goBack();
  }

  function updateSettings(updater: (current: NotificationSettingsState) => NotificationSettingsState) {
    setNotice(null);
    setSettings(updater);
  }

  function togglePreference(id: NotificationPreferenceId) {
    updateSettings((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [id]: !current.preferences[id],
      },
    }));
  }

  function toggleChannel(id: NotificationChannel) {
    if (id !== 'in-app') {
      setNotice(comingSoonMessage);
      return;
    }

    updateSettings((current) => ({
      ...current,
      channels: {
        ...current.channels,
        [id]: !current.channels[id],
      },
    }));
  }

  function setQuietHoursEnabled(enabled: boolean) {
    updateSettings((current) => ({
      ...current,
      quietHours: {
        ...current.quietHours,
        enabled,
      },
    }));
  }

  function updateLowBalanceThreshold(value: string) {
    setThresholdError(null);
    updateSettings((current) => ({
      ...current,
      lowBalanceThreshold: normalizeAmountInput(value),
    }));
  }

  function selectPresetThreshold(value: string) {
    updateSettings((current) => ({
      ...current,
      lowBalanceThreshold: value,
    }));
  }

  function handleSelectOption(value: string) {
    const selectId = activeSelect;

    if (!selectId) {
      return;
    }

    updateSettings((current) => {
      if (selectId === 'invoice-reminder') {
        return { ...current, invoiceReminderLeadTime: value as ReminderLeadTime };
      }

      if (selectId === 'budget-threshold') {
        return { ...current, budgetAlertThreshold: Number(value) as BudgetAlertThreshold };
      }

      if (selectId === 'quiet-start') {
        return { ...current, quietHours: { ...current.quietHours, start: value as QuietHoursTime } };
      }

      return { ...current, quietHours: { ...current.quietHours, end: value as QuietHoursTime } };
    });
    setActiveSelect(null);
  }

  function handleSavePress() {
    Keyboard.dismiss();

    if (saving) {
      return;
    }

    if (settings.preferences['low-cash-balance'] && !amountIsValid(settings.lowBalanceThreshold)) {
      setThresholdError('أدخل حدًا صحيحًا للرصيد النقدي');
      return;
    }

    setSaving(true);
    setNotice(null);
    saveTimerRef.current = setTimeout(() => {
      savedPrototypeSettings = settings;
      setBaseline(settings);
      setSaving(false);
      setNotice(saveMessage);
    }, 350);
  }

  function discardChanges() {
    setShowUnsavedDialog(false);
    goBack();
  }

  function continueEditing() {
    setShowUnsavedDialog(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboardRoot}
      >
        <Header onBackPress={handleBackPress} />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xxl),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <IntroCard />

          {notice ? <NoticeCard message={notice} tone={notice === saveMessage ? 'success' : 'warning'} /> : null}

          {notificationSettingsSections.map((section) => (
            <PreferenceSection
              key={section.id}
              section={section}
              settings={settings}
              onSelectPress={setActiveSelect}
              onToggle={togglePreference}
            />
          ))}

          {settings.preferences['low-cash-balance'] ? (
            <LowBalanceSection
              error={thresholdError}
              onChangeText={updateLowBalanceThreshold}
              onPresetPress={selectPresetThreshold}
              value={settings.lowBalanceThreshold}
            />
          ) : null}

          <ChannelsSection settings={settings} onToggle={toggleChannel} />

          <QuietHoursSection
            end={settings.quietHours.end}
            enabled={settings.quietHours.enabled}
            onSelectPress={setActiveSelect}
            onToggle={setQuietHoursEnabled}
            start={settings.quietHours.start}
          />

          <View style={styles.actions}>
            <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
              {saving ? 'جاري الحفظ' : 'حفظ الإعدادات'}
            </AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectSheet
        onClose={() => setActiveSelect(null)}
        onSelect={handleSelectOption}
        options={getSelectOptions(activeSelect)}
        selectedValue={getSelectedValue(settings, activeSelect)}
        title={getSelectTitle(activeSelect)}
        visible={activeSelect !== null}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="لديك تعديلات محلية لم يتم حفظها في النسخة التجريبية."
        onCancel={discardChanges}
        onConfirm={continueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </SafeAreaView>
  );
}

function Header({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-back-outline"
        iconSize={22}
        onPress={onBackPress}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="right" style={styles.headerText} variant="screenTitle">
          إعدادات الإشعارات
        </AppText>
        <AppText align="right" style={styles.headerText} tone="secondary" variant="supporting">
          خصص التنبيهات التي تساعدك على متابعة شركتك.
        </AppText>
      </View>
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.introIcon}>
        <Ionicons color={colors.brand.calmGreen} name="notifications-outline" size={20} />
      </View>
      <View style={styles.introCopy}>
        <AppText style={styles.rtlText} variant="cardTitle">تنبيهات مالية محلية</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          هذه الإعدادات تتحكم في تجربة النموذج داخل التطبيق فقط، ولا تطلب صلاحيات إشعارات الهاتف.
        </AppText>
      </View>
    </SolidCard>
  );
}

function PreferenceSection({
  section,
  settings,
  onToggle,
  onSelectPress,
}: {
  section: (typeof notificationSettingsSections)[number];
  settings: NotificationSettingsState;
  onToggle: (id: NotificationPreferenceId) => void;
  onSelectPress: (field: SelectFieldId) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle icon={section.icon} title={section.title} />
      <SolidCard style={styles.rowsCard}>
        {section.preferences.map((preference, index) => {
          const enabled = settings.preferences[preference.id];

          return (
            <View key={preference.id}>
              <ToggleRow
                description={preference.description}
                onPress={() => onToggle(preference.id)}
                title={preference.title}
                value={enabled}
              />
              {preference.id === 'invoice-due-reminder' && enabled ? (
                <InlineSelectRow
                  label="مهلة التذكير"
                  onPress={() => onSelectPress('invoice-reminder')}
                  value={getReminderLeadTimeLabel(settings.invoiceReminderLeadTime)}
                />
              ) : null}
              {preference.id === 'budget-near-limit' && enabled ? (
                <InlineSelectRow
                  label="حد الاقتراب"
                  ltr
                  onPress={() => onSelectPress('budget-threshold')}
                  value={`${settings.budgetAlertThreshold}%`}
                />
              ) : null}
              {index < section.preferences.length - 1 ? <Divider /> : null}
            </View>
          );
        })}
      </SolidCard>
    </View>
  );
}

function LowBalanceSection({
  value,
  error,
  onChangeText,
  onPresetPress,
}: {
  value: string;
  error: string | null;
  onChangeText: (value: string) => void;
  onPresetPress: (value: string) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionHeading} variant="sectionTitle">حد انخفاض الرصيد النقدي</AppText>
      <SolidCard style={[styles.amountCard, error && styles.inputError]}>
        <View style={styles.amountLine}>
          <TextInput
            accessibilityLabel="حد انخفاض الرصيد النقدي"
            keyboardType="number-pad"
            onChangeText={onChangeText}
            placeholder="10,000"
            placeholderTextColor={colors.text.tertiary}
            style={styles.amountInput}
            value={value}
          />
          <AppText style={styles.currency} variant="body">
            {prototypeCompanyCurrency}
          </AppText>
        </View>
        <View style={styles.segmentedRow}>
          {lowBalanceThresholdOptions.map((option) => (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => onPresetPress(option)}
              style={({ pressed }) => [
                styles.segment,
                value === option && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText align="center" style={styles.segmentText} variant="caption">
                {directionSafeText(`${option} ${prototypeCompanyCurrency}`)}
              </AppText>
            </Pressable>
          ))}
        </View>
        {error ? (
          <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
            {error}
          </AppText>
        ) : null}
      </SolidCard>
    </View>
  );
}

function ChannelsSection({
  settings,
  onToggle,
}: {
  settings: NotificationSettingsState;
  onToggle: (id: NotificationChannel) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle icon="notifications-outline" title="طريقة استلام التنبيهات" />
      <SolidCard style={styles.rowsCard}>
        {notificationChannels.map((channel, index) => (
          <View key={channel.id}>
            <ChannelRow
              description={channel.description}
              soon={channel.soon}
              title={channel.title}
              value={settings.channels[channel.id]}
              onPress={() => onToggle(channel.id)}
            />
            {index < notificationChannels.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function QuietHoursSection({
  enabled,
  start,
  end,
  onToggle,
  onSelectPress,
}: {
  enabled: boolean;
  start: QuietHoursTime;
  end: QuietHoursTime;
  onToggle: (value: boolean) => void;
  onSelectPress: (field: SelectFieldId) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle icon="moon-outline" title="وضع عدم الإزعاج" />
      <SolidCard style={styles.rowsCard}>
        <ToggleRow
          description="إيقاف التنبيهات غير العاجلة خلال فترة محددة."
          onPress={() => onToggle(!enabled)}
          title="تفعيل عدم الإزعاج"
          value={enabled}
        />
        {enabled ? (
          <View style={styles.quietControls}>
            <InlineSelectRow label="وقت البداية" ltr onPress={() => onSelectPress('quiet-start')} value={start} />
            <Divider />
            <InlineSelectRow label="وقت النهاية" ltr onPress={() => onSelectPress('quiet-end')} value={end} />
          </View>
        ) : null}
      </SolidCard>
    </View>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onPress,
}: {
  title: string;
  description: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={({ pressed }) => [styles.switchRow, pressed && styles.pressed]}
    >
      <View style={styles.switchCopy}>
        <View style={styles.rowTitleLine}>
          <AppText style={styles.rowTitle} variant="body">
            {directionSafeText(title)}
          </AppText>
          {value ? <StatusBadge label="مفعّل" tone="success" /> : null}
        </View>
        <AppText style={styles.description} tone="secondary" variant="caption">
          {directionSafeText(description)}
        </AppText>
      </View>
      <Switch
        ios_backgroundColor={colors.surface.muted}
        onValueChange={onPress}
        thumbColor={value ? colors.text.inverse : colors.text.tertiary}
        trackColor={{ false: colors.surface.muted, true: colors.brand.green }}
        value={value}
      />
    </Pressable>
  );
}

function ChannelRow({
  title,
  description,
  value,
  soon,
  onPress,
}: {
  title: string;
  description: string;
  value: boolean;
  soon?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: soon }}
      onPress={onPress}
      style={({ pressed }) => [styles.switchRow, soon && styles.soonRow, pressed && styles.pressed]}
    >
      <View style={styles.switchCopy}>
        <View style={styles.rowTitleLine}>
          <AppText style={styles.rowTitle} tone={soon ? 'secondary' : 'primary'} variant="body">
            {title}
          </AppText>
          {soon ? <StatusBadge label="قريبًا" tone="neutral" /> : <StatusBadge label="مفعّل" tone="success" />}
        </View>
        <AppText style={styles.description} tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <Switch
        disabled={soon}
        ios_backgroundColor={colors.surface.muted}
        onValueChange={onPress}
        thumbColor={value && !soon ? colors.text.inverse : colors.text.tertiary}
        trackColor={{ false: colors.surface.muted, true: soon ? colors.surface.muted : colors.brand.green }}
        value={value}
      />
    </Pressable>
  );
}

function InlineSelectRow({
  label,
  value,
  ltr = false,
  onPress,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.inlineSelect, pressed && styles.pressed]}
    >
      <AppText style={styles.inlineLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <View style={styles.inlineValueWrap}>
        <AppText align={ltr ? 'left' : 'right'} style={ltr && styles.ltrValue} variant="body">
          {value}
        </AppText>
        <Ionicons color={colors.text.tertiary} name="chevron-down" size={16} />
      </View>
    </Pressable>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.brand.calmGreen} name={icon} size={17} />
      </View>
      <AppText style={styles.sectionTitleText} variant="sectionTitle">{title}</AppText>
    </View>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'success' | 'neutral' }) {
  return (
    <View style={[styles.badge, tone === 'success' ? styles.badgeSuccess : styles.badgeNeutral]}>
      <AppText align="center" style={styles.badgeText} tone={tone === 'success' ? 'success' : 'secondary'} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function NoticeCard({ message, tone }: { message: string; tone: 'success' | 'warning' }) {
  const isSuccess = tone === 'success';

  return (
    <SolidCard
      accessibilityLiveRegion="polite"
      style={[styles.noticeCard, isSuccess ? styles.noticeSuccess : styles.noticeWarning]}
    >
      <Ionicons
        color={isSuccess ? colors.semantic.success : colors.semantic.warning}
        name={isSuccess ? 'checkmark-circle-outline' : 'information-circle-outline'}
        size={18}
      />
      <AppText style={styles.noticeText} tone={isSuccess ? 'success' : 'warning'} variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function SelectSheet({
  visible,
  title,
  selectedValue,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  selectedValue: string;
  options: readonly { value: string; label: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.pickerRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.pickerBackdrop} />
        <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
          <View style={styles.pickerHandle} />
          <View style={styles.pickerHeader}>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <AppText tone="link" variant="supporting">
                إلغاء
              </AppText>
            </Pressable>
            <AppText variant="cardTitle">{title}</AppText>
          </View>
          <View style={styles.pickerOptions}>
            {options.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [
                    styles.pickerOption,
                    selected && styles.pickerOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                  <AppText style={styles.pickerOptionText} tone={selected ? 'primary' : 'secondary'} variant="body">
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getSelectOptions(selectId: SelectFieldId | null) {
  if (selectId === 'invoice-reminder') {
    return reminderLeadTimeOptions;
  }

  if (selectId === 'budget-threshold') {
    return budgetAlertThresholdOptions.map((option) => ({ value: String(option.value), label: option.label }));
  }

  if (selectId === 'quiet-start') {
    return quietHoursStartOptions.map((option) => ({ value: option, label: option }));
  }

  return quietHoursEndOptions.map((option) => ({ value: option, label: option }));
}

function getSelectTitle(selectId: SelectFieldId | null) {
  if (selectId === 'invoice-reminder') {
    return 'تذكير قبل موعد الاستحقاق';
  }

  if (selectId === 'budget-threshold') {
    return 'حد الاقتراب من الميزانية';
  }

  if (selectId === 'quiet-start') {
    return 'وقت البداية';
  }

  return 'وقت النهاية';
}

function getSelectedValue(settings: NotificationSettingsState, selectId: SelectFieldId | null) {
  if (selectId === 'invoice-reminder') {
    return settings.invoiceReminderLeadTime;
  }

  if (selectId === 'budget-threshold') {
    return String(settings.budgetAlertThreshold);
  }

  if (selectId === 'quiet-start') {
    return settings.quietHours.start;
  }

  if (selectId === 'quiet-end') {
    return settings.quietHours.end;
  }

  return '';
}

function normalizeAmountInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function amountIsValid(value: string) {
  const normalized = value.trim();
  const amount = Number(normalized.replace(/,/g, ''));

  return normalized.length > 0 && Number.isFinite(amount) && amount > 0;
}

function areNotificationSettingsEqual(left: NotificationSettingsState, right: NotificationSettingsState) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
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
  headerCopy: {
    alignItems: 'flex-end',
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
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.22)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  introCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    width: '100%',
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderRadius: radii.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionTitleText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionHeading: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rowsCard: {
    padding: 0,
  },
  switchRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  soonRow: {
    opacity: 0.9,
  },
  switchCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowTitleLine: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    width: '100%',
  },
  rowTitle: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  description: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(79,138,91,0.14)',
    borderColor: 'rgba(79,138,91,0.35)',
  },
  badgeNeutral: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  inlineSelect: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: radii.control,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inlineValueWrap: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  inlineLabel: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  amountCard: {
    gap: spacing.md,
  },
  amountLine: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  currency: {
    color: colors.text.secondary,
    flexShrink: 0,
  },
  segmentedRow: {
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  segmentSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.45)',
  },
  segmentText: {
    fontSize: 11,
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  quietControls: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
  },
  noticeCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeSuccess: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  noticeWarning: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.30)',
  },
  noticeText: {
    flex: 1,
    lineHeight: 23,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.md,
  },
  ltrValue: {
    writingDirection: 'ltr',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.82,
  },
  pickerRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pickerSheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  pickerHandle: {
    alignSelf: 'center',
    backgroundColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    height: 4,
    width: 38,
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerOptions: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  pickerOptionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.45)',
  },
  pickerOptionText: {
    flex: 1,
  },
});
