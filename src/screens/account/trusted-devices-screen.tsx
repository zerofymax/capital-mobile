import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, EmptyState, EmptyStateIcon } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type TrustedDeviceStatus = 'trusted' | 'untrusted';

type TrustedDevice = {
  id: string;
  name: string;
  platform: string;
  location: string;
  lastActivity: string;
  status: TrustedDeviceStatus;
  isCurrentDevice: boolean;
  trustedAt?: string;
  exampleIpAddress?: string;
};

type DeviceDialogAction = 'trust' | 'remove';

type PendingAction = {
  action: DeviceDialogAction;
  deviceId: string;
} | null;

const initialDevices: TrustedDevice[] = [
  {
    id: 'current-samsung',
    name: 'Samsung Galaxy S24',
    platform: 'Android 16',
    location: 'الرياض، السعودية',
    lastActivity: 'نشط الآن',
    status: 'trusted',
    isCurrentDevice: true,
    trustedAt: '15 يوليو 2026',
    exampleIpAddress: '192.0.2.24',
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    platform: 'iOS 19',
    location: 'جدة، السعودية',
    lastActivity: 'آخر نشاط: أمس، 9:15 م',
    status: 'untrusted',
    isCurrentDevice: false,
  },
];

export function TrustedDevicesScreen() {
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [devices, setDevices] = useState<TrustedDevice[]>(initialDevices);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loadingAction, setLoadingAction] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentDevice = devices.find((device) => device.isCurrentDevice);
  const otherDevices = devices.filter((device) => !device.isCurrentDevice);
  const trustedCount = useMemo(
    () => devices.filter((device) => device.status === 'trusted').length,
    [devices],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function requestDeviceAction(action: DeviceDialogAction, deviceId: string) {
    if (loadingAction) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    setPendingAction({ action, deviceId });
  }

  function handleConfirmAction() {
    if (!pendingAction || loadingAction) {
      return;
    }

    const action = pendingAction;
    setPendingAction(null);
    setLoadingAction(action);
    setFeedback(action.action === 'trust' ? 'جاري توثيق الجهاز' : 'جاري الإزالة');
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current) {
        return;
      }

      if (action.action === 'trust') {
        setDevices((current) =>
          current.map((device) =>
            device.id === action.deviceId
              ? { ...device, status: 'trusted', trustedAt: '22 يوليو 2026', exampleIpAddress: '192.0.2.45' }
              : device,
          ),
        );
        setFeedback('تم توثيق الجهاز');
      } else {
        setDevices((current) => current.filter((device) => device.id !== action.deviceId));
        setFeedback('تمت إزالة الجهاز');
      }

      setLoadingAction(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    }, 600);
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
        <TrustedDevicesHeader onBackPress={goBackToSecurity} />
        <IntroCard />
        <DevicesSummaryCard trustedCount={trustedCount} totalSessions={2} />

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            {loadingAction ? (
              <ActivityIndicator color={colors.brand.calmGreen} size="small" />
            ) : (
              <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
            )}
            <AppText style={styles.feedbackText} tone={loadingAction ? 'secondary' : 'success'} variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        {currentDevice ? (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle} variant="sectionTitle">هذا الجهاز</AppText>
            <DeviceCard device={currentDevice} loadingAction={loadingAction} onRequestAction={requestDeviceAction} />
          </View>
        ) : null}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle} variant="sectionTitle">أجهزة أخرى</AppText>
          {otherDevices.length > 0 ? (
            otherDevices.map((device) => (
              <DeviceCard
                device={device}
                key={device.id}
                loadingAction={loadingAction}
                onRequestAction={requestDeviceAction}
              />
            ))
          ) : (
            <EmptyState
              description="سيظهر هنا أي جهاز آخر يستخدم حسابك."
              icon={<EmptyStateIcon name="phone-portrait-outline" />}
              title="لا توجد أجهزة أخرى"
            />
          )}
        </View>

        <SecurityNote />
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="توثيق"
        description="سيتم اعتبار هذا الجهاز موثوقًا محليًا داخل النموذج التجريبي."
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        title="توثيق هذا الجهاز؟"
        tone="success"
        visible={pendingAction?.action === 'trust'}
      />

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="إزالة"
        description="لن يتمكن هذا الجهاز من استخدام حالة الثقة في النسخة الإنتاجية. لن يحدث أي تغيير حقيقي في هذا النموذج المحلي."
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        title="إزالة هذا الجهاز؟"
        tone="danger"
        visible={pendingAction?.action === 'remove'}
      />
    </View>
  );
}

function TrustedDevicesHeader({ onBackPress }: { onBackPress: () => void }) {
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
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        الأجهزة الموثوقة
      </AppText>
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.introIcon}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={22} />
      </View>
      <View style={styles.introCopy}>
        <AppText variant="cardTitle">ما الجهاز الموثوق؟</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          الجهاز الموثوق هو جهاز سبق استخدامه للدخول إلى Capital وتمت الموافقة عليه محليًا في هذا النموذج التجريبي.
        </AppText>
        <AppText tone="tertiary" variant="caption">
          الأجهزة المعروضة بيانات تجريبية وليست أجهزة حقيقية.
        </AppText>
      </View>
    </SolidCard>
  );
}

function DevicesSummaryCard({ trustedCount, totalSessions }: { trustedCount: number; totalSessions: number }) {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryCopy}>
        <AppText variant="cardTitle">الأجهزة الموثوقة</AppText>
        <AppText tone="secondary" variant="caption">
          من أصل {totalSessions} جلسات
        </AppText>
      </View>
      <View style={styles.summaryValueWrap}>
        <AppText align="center" style={styles.summaryValue} tone="success" variant="numericValue">
          {trustedCount}
        </AppText>
      </View>
    </SolidCard>
  );
}

function DeviceCard({
  device,
  loadingAction,
  onRequestAction,
}: {
  device: TrustedDevice;
  loadingAction: PendingAction;
  onRequestAction: (action: DeviceDialogAction, deviceId: string) => void;
}) {
  const isLoading = loadingAction?.deviceId === device.id;
  const isTrusted = device.status === 'trusted';

  return (
    <SolidCard
      accessibilityLabel={`${device.name}. ${isTrusted ? 'موثوق' : 'غير موثوق'}. ${device.lastActivity}`}
      style={[styles.deviceCard, device.isCurrentDevice && styles.currentDeviceCard, !isTrusted && styles.untrustedCard]}
    >
      <View style={styles.deviceHeader}>
        <View style={styles.deviceIcon}>
          <Ionicons color={isTrusted ? colors.brand.calmGreen : colors.semantic.warning} name="phone-portrait-outline" size={22} />
        </View>
        <View style={styles.badgeStack}>
          <StatusBadge label={isTrusted ? 'موثوق' : 'غير موثوق'} tone={isTrusted ? 'success' : 'warning'} />
          {device.isCurrentDevice ? <StatusBadge label="هذا الجهاز" tone="success" /> : null}
        </View>
        <View style={styles.deviceCopy}>
          <AppText align="right" numberOfLines={1} style={[styles.deviceName, styles.ltrText]} variant="cardTitle">
            {device.name}
          </AppText>
          <AppText align="right" style={[styles.deviceName, styles.ltrText]} tone="secondary" variant="caption">
            {device.platform}
          </AppText>
        </View>
      </View>

      <View style={styles.deviceFacts}>
        <DeviceFact icon="location-outline" label="الموقع التقريبي" value={device.location} />
        <DeviceFact icon="time-outline" label="آخر نشاط" value={device.lastActivity} />
        {device.trustedAt ? <DeviceFact icon="checkmark-done-outline" label="تاريخ التوثيق" value={device.trustedAt} /> : null}
        {device.exampleIpAddress ? (
          <DeviceFact icon="globe-outline" label="عنوان IP تجريبي" ltr value={device.exampleIpAddress} />
        ) : null}
      </View>

      <Divider />

      {device.isCurrentDevice ? (
        <AppText style={styles.currentRestriction} tone="tertiary" variant="caption">
          لا يمكن إزالة الجهاز الحالي من هذه الصفحة.
        </AppText>
      ) : (
        <View style={styles.deviceActions}>
          {!isTrusted ? (
            <AppButton
              disabled={Boolean(loadingAction)}
              loading={isLoading && loadingAction?.action === 'trust'}
              onPress={() => onRequestAction('trust', device.id)}
              style={styles.deviceActionButton}
            >
              توثيق الجهاز
            </AppButton>
          ) : null}
          <AppButton
            disabled={Boolean(loadingAction)}
            loading={isLoading && loadingAction?.action === 'remove'}
            onPress={() => onRequestAction('remove', device.id)}
            style={styles.deviceActionButton}
            variant="danger"
          >
            إزالة الجهاز
          </AppButton>
        </View>
      )}
    </SolidCard>
  );
}

function DeviceFact({
  icon,
  label,
  value,
  ltr = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <View style={styles.deviceFact}>
      <Ionicons color={colors.text.tertiary} name={icon} size={15} />
      <View style={styles.factCopy}>
        <AppText tone="tertiary" variant="caption">
          {label}
        </AppText>
        <AppText align={ltr ? 'left' : 'right'} style={ltr && styles.ltrText} variant="caption">
          {value}
        </AppText>
      </View>
    </View>
  );
}

function SecurityNote() {
  return (
    <SolidCard style={styles.securityNote}>
      <Ionicons color={colors.semantic.warning} name="alert-circle-outline" size={20} />
      <View style={styles.noteCopy}>
        <AppText variant="cardTitle">راجع أجهزتك بانتظام</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          أزل أي جهاز لا تعرفه، وغيّر كلمة المرور إذا لاحظت نشاطًا غير معتاد.
        </AppText>
        <Pressable
          accessibilityLabel="تغيير كلمة المرور"
          accessibilityRole="button"
          onPress={() => router.push(routes.changePassword)}
          style={({ pressed }) => [styles.inlineAction, pressed && styles.pressed]}
        >
          <AppText align="center" tone="link" variant="supporting">
            تغيير كلمة المرور
          </AppText>
        </Pressable>
      </View>
    </SolidCard>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'success' | 'warning' }) {
  return (
    <View style={[styles.statusBadge, tone === 'success' ? styles.successBadge : styles.warningBadge]}>
      <AppText align="center" tone={tone === 'success' ? 'success' : 'warning'} variant="caption">
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
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.32)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  introCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  description: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  summaryCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryValueWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.card,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  summaryValue: {
    lineHeight: 34,
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
  feedbackText: {
    alignSelf: 'stretch',
    flex: 1,
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
    gap: spacing.md,
  },
  currentDeviceCard: {
    backgroundColor: 'rgba(17,26,23,0.96)',
    borderColor: 'rgba(167,200,161,0.30)',
  },
  untrustedCard: {
    opacity: 0.94,
  },
  deviceHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  deviceIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  deviceCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  deviceName: {
    alignSelf: 'stretch',
    textAlign: 'right',
  },
  badgeStack: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  successBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  warningBadge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
  },
  deviceFacts: {
    gap: spacing.sm,
  },
  deviceFact: {
    width: '100%',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  factCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  currentRestriction: {
    alignSelf: 'stretch',
    lineHeight: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  deviceActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  deviceActionButton: {
    flexGrow: 1,
    minHeight: 44,
    minWidth: 138,
  },
  securityNote: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  noteCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  inlineAction: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
