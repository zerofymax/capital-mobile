import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationDetailCard } from '@/components/operations';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useNotificationsState } from '@/state/notifications-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { getPrototypeNotification } from './notification-data';

const androidPhysicalLtrRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row' as const }
  : {};
const androidHeaderSlot = Platform.OS === 'android' ? { width: 0 } : {};

export function NotificationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { notificationId } = useLocalSearchParams<{ notificationId?: string }>();
  const { deleteNotification, markAsRead, notifications } = useNotificationsState();
  const notification = useMemo(
    () =>
      notifications.find((item) => item.id === notificationId) ??
      getPrototypeNotification(notificationId),
    [notificationId, notifications],
  );

  useEffect(() => {
    markAsRead(notification.id);
  }, [markAsRead, notification.id]);

  function handlePrimaryAction() {
    Haptics.selectionAsync().catch(() => null);

    if (notification.category === 'reports') {
      router.replace(routes.reports);
      return;
    }

    if (notification.category === 'transactions') {
      router.replace(routes.ledger);
      return;
    }

    if (notification.category === 'security' || notification.category === 'settings') {
      router.replace(routes.account);
      return;
    }

    router.replace(routes.intelligence);
  }

  function handleDelete() {
    Haptics.selectionAsync().catch(() => null);
    deleteNotification(notification.id);
    router.replace(routes.notifications);
  }

  return (
    <View style={styles.root}>
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
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.back()} title="تفاصيل الإشعار" />

        <NotificationDetailCard notification={notification} />

        <View style={styles.actions}>
          <AppButton onPress={handlePrimaryAction}>
            {notification.actionLabel ?? 'عرض التفاصيل'}
          </AppButton>
          <AppButton onPress={handleDelete} variant="danger">
            حذف الإشعار
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Feather color={colors.text.muted} name="chevron-left" size={22} />
      </Pressable>
      <View style={styles.headerTitleSlot}>
        <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
    ...androidPhysicalLtrRow,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitleSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 40,
    width: 40,
    ...androidHeaderSlot,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
