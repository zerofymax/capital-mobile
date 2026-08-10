import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

import {
  getActiveDeviceSessions,
  getPlatformIcon,
  getSignedOutDeviceSessions,
  signOutDevice,
  useDeviceSessions,
  type DeviceSession,
  type DeviceSessionId,
} from './device-sessions-data';

export function ActiveSessionsScreen() {
  const insets = useSafeAreaInsets();
  const sessions = useDeviceSessions();
  const [selectedSessionId, setSelectedSessionId] = useState<DeviceSessionId | null>(null);
  const [pendingSignOutId, setPendingSignOutId] = useState<DeviceSessionId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeSessions = useMemo(() => getActiveDeviceSessions(sessions), [sessions]);
  const signedOutSessions = useMemo(() => getSignedOutDeviceSessions(sessions), [sessions]);
  const currentDevice = sessions.find((session) => session.isCurrentDevice);
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function openSessionDetails(session: DeviceSession) {
    Haptics.selectionAsync().catch(() => null);
    setSelectedSessionId((current) => (current === session.id ? null : session.id));
    setFeedback(null);
  }

  function requestSignOut(sessionId: DeviceSessionId) {
    Haptics.selectionAsync().catch(() => null);
    setPendingSignOutId(sessionId);
    setFeedback(null);
  }

  function confirmSignOutDevice() {
    if (!pendingSignOutId) {
      return;
    }

    signOutDevice(pendingSignOutId);
    setPendingSignOutId(null);
    setFeedback('تم تسجيل الخروج من هذا الجهاز في النموذج التجريبي.');
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
            paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <DeviceManagementHeader onBackPress={goBackToSecurity} />
        <PrototypeNotice />
        <DeviceSummaryCard activeCount={activeSessions.length} currentDevice={currentDevice} />

        {feedback ? <FeedbackCard message={feedback} /> : null}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle} variant="sectionTitle">الأجهزة النشطة</AppText>
          {activeSessions.map((session) => (
            <DeviceSessionCard
              key={session.id}
              onPress={() => openSessionDetails(session)}
              selected={selectedSessionId === session.id}
              session={session}
            />
          ))}
        </View>

        {selectedSession ? <DeviceDetailsCard onRequestSignOut={requestSignOut} session={selectedSession} /> : null}

        {signedOutSessions.length > 0 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle} variant="sectionTitle">الجلسات المنتهية</AppText>
            {signedOutSessions.map((session) => (
              <DeviceSessionCard
                key={session.id}
                onPress={() => openSessionDetails(session)}
                selected={selectedSessionId === session.id}
                session={session}
              />
            ))}
          </View>
        ) : null}

        <SignOutOthersCard onPress={() => router.push(routes.signOutAllDevices)} />
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="تسجيل الخروج"
        description="سيتم إنهاء الجلسة المحلية التجريبية لهذا الجهاز."
        onCancel={() => setPendingSignOutId(null)}
        onConfirm={confirmSignOutDevice}
        title="تسجيل الخروج من هذا الجهاز؟"
        tone="danger"
        visible={Boolean(pendingSignOutId)}
      />
    </View>
  );
}

function DeviceManagementHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الأمان"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="right" numberOfLines={1} style={styles.headerText} variant="screenTitle">
          إدارة الأجهزة
        </AppText>
        <AppText align="right" style={styles.headerText} tone="secondary" variant="caption">
          راجع الأجهزة والجلسات التي استخدمت حساب Capital.
        </AppText>
      </View>
    </View>
  );
}

function PrototypeNotice() {
  return (
    <SolidCard style={styles.prototypeNotice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="secondary" variant="supporting">
        قائمة الأجهزة تجريبية ومحلية، ولا تمثل جلسات حقيقية على خادم.
      </AppText>
    </SolidCard>
  );
}

function DeviceSummaryCard({
  activeCount,
  currentDevice,
}: {
  activeCount: number;
  currentDevice?: DeviceSession;
}) {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons color={colors.brand.calmGreen} name="phone-portrait-outline" size={22} />
      </View>
      <View style={styles.summaryCopy}>
        <AppText style={styles.summaryTitle} variant="cardTitle">{activeCount} أجهزة نشطة</AppText>
        <SummaryLine label="هذا الجهاز" value={currentDevice?.deviceName ?? 'غير محدد'} ltr />
        <SummaryLine label="آخر نشاط" value={currentDevice?.lastActiveAt ?? 'غير متاح'} />
      </View>
    </SolidCard>
  );
}

function SummaryLine({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.summaryLine}>
      <AppText style={styles.summaryLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={[styles.summaryValue, ltr && styles.ltrText]} variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function DeviceSessionCard({
  session,
  selected,
  onPress,
}: {
  session: DeviceSession;
  selected: boolean;
  onPress: () => void;
}) {
  const signedOut = session.status === 'signedOut';

  return (
    <Pressable
      accessibilityLabel={`${session.deviceName}. ${session.platform}. ${session.browserOrApp}. ${session.location}. ${session.lastActiveAt}. ${
        session.isCurrentDevice ? 'هذا الجهاز.' : ''
      } ${signedOut ? 'تم تسجيل الخروج.' : 'نشط.'}`}
      accessibilityRole="button"
      accessibilityState={{ expanded: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.deviceCard, signedOut && styles.signedOutCard, selected && styles.selectedCard, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name={selected ? 'chevron-up-outline' : 'chevron-back-outline'} size={16} />
      <View style={styles.deviceIcon}>
        <Ionicons color={signedOut ? colors.text.tertiary : colors.brand.calmGreen} name={getPlatformIcon(session.platform)} size={21} />
      </View>
      <View style={styles.deviceCopy}>
        <View style={styles.titleLine}>
          <AppText align="left" numberOfLines={1} style={[styles.flexTitle, styles.ltrText]} variant="cardTitle">
            {session.deviceName}
          </AppText>
          {session.isCurrentDevice ? <StatusBadge label="هذا الجهاز" tone="success" /> : null}
          <StatusBadge label={signedOut ? 'تم تسجيل الخروج' : 'نشط'} tone={signedOut ? 'neutral' : 'success'} />
        </View>
        <AppText style={styles.deviceMeta} tone="secondary" variant="caption">
          {session.platform} · {session.browserOrApp}
        </AppText>
        <AppText style={styles.deviceMeta} tone="tertiary" variant="caption">
          {session.location} · {session.lastActiveAt}
        </AppText>
      </View>
    </Pressable>
  );
}

function DeviceDetailsCard({
  session,
  onRequestSignOut,
}: {
  session: DeviceSession;
  onRequestSignOut: (sessionId: DeviceSessionId) => void;
}) {
  const signedOut = session.status === 'signedOut';

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">تفاصيل الجهاز</AppText>
      <SolidCard style={styles.detailsCard}>
        <InfoRow label="اسم الجهاز" ltr value={session.deviceName} />
        <Divider />
        <InfoRow label="المنصة" ltr value={session.platform} />
        <Divider />
        <InfoRow label="التطبيق أو المتصفح" value={session.browserOrApp} />
        <Divider />
        <InfoRow label="الموقع التقريبي" value={session.location} />
        <Divider />
        <InfoRow label="آخر نشاط" value={session.lastActiveAt} />
        <Divider />
        <InfoRow label="حالة الجلسة" value={signedOut ? 'تم تسجيل الخروج' : 'نشط'} />

        {session.isCurrentDevice ? (
          <SolidCard style={styles.currentDeviceNotice}>
            <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="secondary" variant="supporting">
              هذا هو الجهاز المستخدم حاليًا.
            </AppText>
          </SolidCard>
        ) : signedOut ? null : (
          <AppButton onPress={() => onRequestSignOut(session.id)} style={styles.signOutButton} variant="danger">
            تسجيل الخروج من هذا الجهاز
          </AppButton>
        )}
      </SolidCard>
    </View>
  );
}

function InfoRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={[styles.infoValue, ltr && styles.ltrText]} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

function SignOutOthersCard({ onPress }: { onPress: () => void }) {
  return (
    <SolidCard style={styles.signOutOthersCard}>
      <View style={styles.warningIcon}>
        <Ionicons color={colors.semantic.warning} name="log-out-outline" size={20} />
      </View>
      <View style={styles.deviceCopy}>
        <AppText tone="warning" variant="cardTitle">
          تسجيل الخروج من جميع الأجهزة
        </AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          أنهِ جميع الجلسات الأخرى مع إبقاء هذا الجهاز متصلًا.
        </AppText>
        <AppButton onPress={onPress} style={styles.signOutButton} variant="secondary">
          فتح التأكيد
        </AppButton>
      </View>
    </SolidCard>
  );
}

function FeedbackCard({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
      <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="success" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'success' | 'neutral' }) {
  return (
    <View style={[styles.statusBadge, tone === 'success' ? styles.successBadge : styles.neutralBadge]}>
      <AppText align="center" tone={tone === 'success' ? 'success' : 'secondary'} variant="caption">
        {label}
      </AppText>
    </View>
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
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
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
    writingDirection: 'rtl',
  },
  prototypeNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.58)',
    borderColor: 'rgba(167,200,161,0.22)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    alignSelf: 'stretch',
    flex: 1,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  summaryCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  summaryTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryLine: {
    width: '100%',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  summaryValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  summaryLabel: {
    flexShrink: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  section: {
    alignItems: 'flex-end',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  deviceCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  selectedCard: {
    borderColor: 'rgba(167,200,161,0.36)',
  },
  signedOutCard: {
    opacity: 0.78,
  },
  deviceIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  deviceCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  titleLine: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  flexTitle: {
    flex: 1,
    minWidth: 108,
    textAlign: 'right',
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  deviceMeta: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  successBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  neutralBadge: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
  },
  detailsCard: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  infoRow: {
    width: '100%',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 42,
  },
  infoValue: {
    flex: 1,
  },
  currentDeviceNotice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.sm,
    minHeight: 44,
  },
  signOutOthersCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
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
  description: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
