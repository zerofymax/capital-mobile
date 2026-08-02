import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

import { signOutOtherDevices, useDeviceSessions, type DeviceSession } from './device-sessions-data';

export function SignOutAllDevicesScreen() {
  const insets = useSafeAreaInsets();
  const sessions = useDeviceSessions();
  const [acknowledged, setAcknowledged] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentDevice = sessions.find((session) => session.isCurrentDevice);
  const otherDevices = useMemo(
    () => sessions.filter((session) => !session.isCurrentDevice && session.status === 'active'),
    [sessions],
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function handleConfirm() {
    if (!acknowledged) {
      return;
    }

    signOutOtherDevices();
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
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
        showsVerticalScrollIndicator={false}
      >
        <Header onBackPress={goBack} />

        {completed ? (
          <CompletedCard />
        ) : (
          <>
            <WarningCard />
            <ResultsCard currentDevice={currentDevice} otherDevices={otherDevices} />
            <AcknowledgementCard checked={acknowledged} onPress={() => setAcknowledged((current) => !current)} />
            <View style={styles.actions}>
              <AppButton disabled={!acknowledged} onPress={handleConfirm} variant="danger">
                تسجيل الخروج من جميع الأجهزة الأخرى
              </AppButton>
              <AppButton onPress={goBack} variant="secondary">
                إلغاء
              </AppButton>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Header({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الأمان"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        تسجيل الخروج من جميع الأجهزة
      </AppText>
      <View style={styles.headerSlot} />
    </View>
  );
}

function WarningCard() {
  return (
    <SolidCard style={styles.warningCard}>
      <View style={styles.warningIcon}>
        <Ionicons color={colors.semantic.warning} name="warning-outline" size={22} />
      </View>
      <View style={styles.copy}>
        <AppText tone="warning" variant="cardTitle">
          سيتم إنهاء الجلسات المحلية التجريبية على جميع الأجهزة الأخرى.
        </AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          سيبقى هذا الجهاز مسجلًا لتجنب إغلاق التطبيق أثناء الاختبار.
        </AppText>
      </View>
    </SolidCard>
  );
}

function ResultsCard({
  currentDevice,
  otherDevices,
}: {
  currentDevice?: DeviceSession;
  otherDevices: readonly DeviceSession[];
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">النتائج المتوقعة</AppText>
      <SolidCard style={styles.rowsCard}>
        {otherDevices.map((session) => (
          <View key={session.id}>
            <ResultRow icon="log-out-outline" label={`إنهاء جلسة ${session.deviceName}`} tone="warning" />
            <Divider />
          </View>
        ))}
        <ResultRow icon="phone-portrait-outline" label={`بقاء ${currentDevice?.deviceName ?? 'هذا الجهاز'} متصلًا`} tone="success" />
      </SolidCard>
    </View>
  );
}

function ResultRow({
  icon,
  label,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: 'success' | 'warning';
}) {
  return (
    <View style={styles.resultRow}>
      <View style={[styles.resultIcon, tone === 'warning' && styles.resultWarningIcon]}>
        <Ionicons color={tone === 'success' ? colors.brand.calmGreen : colors.semantic.warning} name={icon} size={18} />
      </View>
      <AppText style={styles.resultText} tone={tone} variant="supporting">
        {label}
      </AppText>
    </View>
  );
}

function AcknowledgementCard({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="أفهم أنني سأحتاج إلى تسجيل الدخول مجددًا على الأجهزة الأخرى."
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.checkboxCard, checked && styles.checkboxCardChecked, pressed && styles.pressed]}
    >
      <AppText style={styles.checkboxLabel} variant="supporting">
        أفهم أنني سأحتاج إلى تسجيل الدخول مجددًا على الأجهزة الأخرى.
      </AppText>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={16} /> : null}
      </View>
    </Pressable>
  );
}

function CompletedCard() {
  return (
    <>
      <SolidCard accessibilityLiveRegion="polite" style={styles.completedCard}>
        <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={22} />
        <View style={styles.copy}>
          <AppText tone="success" variant="cardTitle">
            تم تسجيل الخروج من جميع الأجهزة الأخرى في النموذج التجريبي.
          </AppText>
          <AppText style={styles.description} tone="secondary" variant="supporting">
            بقي هذا الجهاز متصلًا، وتمت مزامنة الحالة مع صفحة إدارة الأجهزة.
          </AppText>
        </View>
      </SolidCard>
      <View style={styles.actions}>
        <AppButton onPress={() => router.replace(routes.activeSessions)}>
          العودة إلى إدارة الأجهزة
        </AppButton>
        <AppButton onPress={() => router.replace(routes.security)} variant="secondary">
          العودة إلى الأمان والخصوصية
        </AppButton>
      </View>
    </>
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
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  warningCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  warningIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,163,61,0.12)',
    borderColor: 'rgba(232,163,61,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  description: {
    lineHeight: 22,
  },
  section: {
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.26)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  resultWarningIcon: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
  },
  resultText: {
    flex: 1,
  },
  checkboxCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 64,
    padding: spacing.lg,
  },
  checkboxCardChecked: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.30)',
  },
  checkboxLabel: {
    flex: 1,
    lineHeight: 22,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.small,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  actions: {
    gap: spacing.md,
  },
  completedCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
