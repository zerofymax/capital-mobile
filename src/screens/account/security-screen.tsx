import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
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
  accountSessionActions,
  dataPrivacyActions,
  defaultSecurityPrivacySettings,
  privacySettings,
  securitySettings,
  type AccountSessionActionItem,
  type PrivacyPreferenceId,
  type SecurityPrivacyActionItem,
  type SecurityPrivacySettingsState,
  type SecuritySettingItem,
} from './security-privacy-data';
import { useQuickAccessCodeState } from './quick-access-code-data';

const saveMessage = 'تم حفظ تفضيلات الخصوصية في النسخة التجريبية.';

let savedPrototypeSettings: SecurityPrivacySettingsState = defaultSecurityPrivacySettings;

export function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickAccessCode = useQuickAccessCodeState();
  const [baseline, setBaseline] = useState<SecurityPrivacySettingsState>(savedPrototypeSettings);
  const [settings, setSettings] = useState<SecurityPrivacySettingsState>(savedPrototypeSettings);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(baseline), [baseline, settings]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
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
  }, [dirty, showUnsavedDialog]);

  function goBackToAccount() {
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

    goBackToAccount();
  }

  function togglePrivacyPreference(id: PrivacyPreferenceId) {
    setNotice(null);
    setSettings((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function handleSecurityPress(item: SecuritySettingItem) {
    if (item.soon) {
      return;
    }

    if (item.id === 'pin-code') {
      router.push(routes.changePin);
    }
  }

  function handleAccountSessionPress(action: AccountSessionActionItem) {
    if (action.id === 'quick-access-code') {
      router.push(routes.quickAccessCode);
      return;
    }

    if (action.id === 'change-password') {
      router.push(routes.changePassword);
      return;
    }

    if (action.id === 'device-management') {
      router.push(routes.activeSessions);
      return;
    }

    if (action.id === 'sign-out-all-devices') {
      router.push(routes.signOutAllDevices);
    }
  }

  function handleActionPress(action: SecurityPrivacyActionItem) {
    if (action.soon) {
      return;
    }

    if (action.id === 'privacy-policy') {
      router.push({ pathname: routes.legal, params: { type: 'privacy' } });
      return;
    }

    if (action.id === 'terms') {
      router.push({ pathname: routes.legal, params: { type: 'terms' } });
    }
  }

  function handleSavePress() {
    if (saving) {
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
    goBackToAccount();
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
      <Header onBackPress={handleBackPress} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xxl),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <IntroCard />

        {notice ? <NoticeCard message={notice} /> : null}

        <SecurityAccessSection onItemPress={handleSecurityPress} />
        <AccountSessionsSection quickCodeEnabled={quickAccessCode.isEnabled} onActionPress={handleAccountSessionPress} />
        <PrivacyPreferencesSection settings={settings} onToggle={togglePrivacyPreference} />
        <DataPrivacySection onActionPress={handleActionPress} />

        <View style={styles.actions}>
          <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
            {saving ? 'جاري الحفظ' : 'حفظ إعدادات الخصوصية'}
          </AppButton>
        </View>
      </ScrollView>

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
        accessibilityLabel="العودة إلى المزيد"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-forward-outline"
        iconSize={22}
        onPress={onBackPress}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="center" variant="screenTitle">
          الأمان والخصوصية
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          تحكم في حماية حسابك وخصوصية بيانات شركتك.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.introIcon}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={21} />
      </View>
      <View style={styles.introCopy}>
        <View style={styles.titleLine}>
          <AppText style={styles.flexTitle} variant="cardTitle">
            حماية Capital
          </AppText>
          <StatusBadge label="Prototype" tone="neutral" />
        </View>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          إعدادات هذه الصفحة محلية وتجريبية، ولا تنفذ مصادقة أو جمع بيانات حقيقيًا.
        </AppText>
      </View>
    </SolidCard>
  );
}

function SecurityAccessSection({ onItemPress }: { onItemPress: (item: SecuritySettingItem) => void }) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">حماية الدخول</AppText>
      <SolidCard style={styles.rowsCard}>
        {securitySettings.map((item, index) => (
          <View key={item.id}>
            <SecurityRow item={item} onPress={() => onItemPress(item)} />
            {index < securitySettings.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function SecurityRow({ item, onPress }: { item: SecuritySettingItem; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${item.title}. ${item.description}${item.status ? `. ${item.status}` : ''}`}
      accessibilityRole="button"
      disabled={item.soon}
      onPress={onPress}
      style={({ pressed }) => [styles.row, item.soon && styles.disabledRow, pressed && !item.soon && styles.pressed]}
    >
      <View style={styles.rowIconWrap}>
        <Ionicons color={colors.brand.green} name={item.icon} size={18} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.titleLine}>
          <AppText style={styles.flexTitle} variant="body">
            {item.title}
          </AppText>
          {item.soon ? <StatusBadge label="قريبًا" tone="neutral" /> : null}
          {item.status ? <StatusBadge label={item.status} tone="success" /> : null}
        </View>
        <AppText style={styles.description} tone="secondary" variant="caption">
          {item.description}
        </AppText>
      </View>
      {item.soon ? null : <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />}
    </Pressable>
  );
}

function AccountSessionsSection({
  quickCodeEnabled,
  onActionPress,
}: {
  quickCodeEnabled: boolean;
  onActionPress: (action: AccountSessionActionItem) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">الحساب والجلسات</AppText>
      <SolidCard style={styles.rowsCard}>
        {accountSessionActions.map((action, index) => (
          <View key={action.id}>
            <AccountSessionRow action={action} quickCodeEnabled={quickCodeEnabled} onPress={() => onActionPress(action)} />
            {index < accountSessionActions.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function AccountSessionRow({
  action,
  quickCodeEnabled,
  onPress,
}: {
  action: AccountSessionActionItem;
  quickCodeEnabled: boolean;
  onPress: () => void;
}) {
  const warning = action.tone === 'warning';
  const description =
    action.id === 'quick-access-code' && quickCodeEnabled ? 'رمز الدخول السريع مفعّل.' : action.description;

  return (
    <Pressable
      accessibilityLabel={`${action.title}. ${description}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, warning && styles.warningRow, pressed && styles.pressed]}
    >
      <View style={[styles.rowIconWrap, warning && styles.warningIconWrap]}>
        <Ionicons color={warning ? colors.semantic.warning : colors.brand.green} name={action.icon} size={18} />
      </View>
      <View style={styles.rowCopy}>
        <AppText style={styles.flexTitle} tone={warning ? 'warning' : 'primary'} variant="body">
          {action.title}
        </AppText>
        <AppText style={styles.description} tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
    </Pressable>
  );
}

function PrivacyPreferencesSection({
  settings,
  onToggle,
}: {
  settings: SecurityPrivacySettingsState;
  onToggle: (id: PrivacyPreferenceId) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">خصوصية البيانات</AppText>
      <SolidCard style={styles.rowsCard}>
        {privacySettings.map((item, index) => (
          <View key={item.id}>
            <ToggleRow
              description={item.description}
              onPress={() => onToggle(item.id)}
              title={item.title}
              value={settings[item.id]}
            />
            {index < privacySettings.length - 1 ? <Divider /> : null}
          </View>
        ))}
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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowCopy}>
        <View style={styles.titleLine}>
          <AppText style={styles.flexTitle} variant="body">
            {title}
          </AppText>
          {value ? <StatusBadge label="مفعّل" tone="success" /> : null}
        </View>
        <AppText style={styles.description} tone="secondary" variant="caption">
          {description}
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

function DataPrivacySection({ onActionPress }: { onActionPress: (action: SecurityPrivacyActionItem) => void }) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">البيانات والخصوصية</AppText>
      <SolidCard style={styles.rowsCard}>
        {dataPrivacyActions.map((action, index) => (
          <View key={action.id}>
            <ActionRow action={action} onPress={() => onActionPress(action)} />
            {index < dataPrivacyActions.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ActionRow({ action, onPress }: { action: SecurityPrivacyActionItem; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${action.title}. ${action.description}`}
      accessibilityRole="button"
      disabled={action.soon}
      onPress={onPress}
      style={({ pressed }) => [styles.row, action.soon && styles.disabledRow, pressed && !action.soon && styles.pressed]}
    >
      <View style={[styles.rowIconWrap, action.id === 'delete-account' && styles.dangerIconWrap]}>
        <Ionicons color={action.id === 'delete-account' ? colors.semantic.danger : colors.brand.green} name={action.icon} size={18} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.titleLine}>
          <AppText style={styles.flexTitle} tone={action.id === 'delete-account' ? 'danger' : 'primary'} variant="body">
            {directionSafeText(action.title)}
          </AppText>
          {action.soon ? <StatusBadge label="قريبًا" tone="neutral" /> : null}
        </View>
        <AppText style={styles.description} tone="secondary" variant="caption">
          {directionSafeText(action.description)}
        </AppText>
      </View>
      {action.soon ? null : <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />}
    </Pressable>
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

function NoticeCard({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.noticeCard}>
      <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="success" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
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
    flex: 1,
    gap: spacing.xs,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.72)',
    borderColor: 'rgba(167,200,161,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.18)',
    borderColor: 'rgba(167,200,161,0.34)',
    borderRadius: radii.card,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  introCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabledRow: {
    opacity: 0.9,
  },
  rowIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  dangerIconWrap: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
  },
  warningRow: {
    backgroundColor: 'rgba(232,163,61,0.045)',
  },
  warningIconWrap: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  titleLine: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  flexTitle: {
    flex: 1,
  },
  description: {
    lineHeight: 22,
  },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeSuccess: {
    backgroundColor: colors.semantic.successTint,
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
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
    lineHeight: 23,
  },
  actions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.82,
  },
});
