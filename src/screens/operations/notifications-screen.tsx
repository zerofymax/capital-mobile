import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NotificationCard,
  NotificationFilterChip,
} from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useNotificationsState } from '@/state/notifications-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  notificationFilters,
  notificationMessages,
  notificationSectionLabels,
  notificationSectionOrder,
  type CapitalNotification,
  type NotificationFilter,
} from './notification-data';

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const { isRead, markAllAsRead, markAsRead, notifications, unreadCount } = useNotificationsState();

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (filter === 'all') {
          return true;
        }

        return notification.category === filter;
      }),
    [filter, notifications],
  );

  const groupedNotifications = useMemo(
    () =>
      notificationSectionOrder
        .map((section) => ({
          data: visibleNotifications.filter((notification) => notification.section === section),
          section,
          title: notificationSectionLabels[section],
        }))
        .filter((group) => group.data.length > 0),
    [visibleNotifications],
  );

  function handleNotificationPress(notification: CapitalNotification) {
    markAsRead(notification.id);
    router.push({
      pathname: routes.notificationDetail,
      params: { notificationId: notification.id },
    });
  }

  function handleMarkAllAsRead() {
    markAllAsRead(notifications.map((notification) => notification.id));
    setNotice(notificationMessages.allRead);
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
        <ModalHeader onClose={() => router.back()} title="الإشعارات" />

        <View style={styles.topActionRow}>
          <AppText tone="tertiary" variant="caption">
            {unreadCount > 0 ? `${unreadCount} غير مقروءة` : 'كل الإشعارات مقروءة'}
          </AppText>
          <Pressable
            accessibilityRole="button"
            disabled={notifications.length === 0}
            onPress={handleMarkAllAsRead}
            style={({ pressed }) => [
              styles.markAll,
              notifications.length === 0 && styles.disabledAction,
              pressed && styles.pressed,
            ]}
          >
            <AppText tone={unreadCount > 0 ? 'success' : 'tertiary'} variant="buttonLabel">
              تعيين الكل كمقروء
            </AppText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {notificationFilters.map((item) => (
            <NotificationFilterChip
              id={item.id}
              key={item.id}
              label={item.label}
              onPress={setFilter}
              selected={item.id === filter}
            />
          ))}
        </ScrollView>

        {notice ? (
          <SolidCard style={styles.notice}>
            <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="success" variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        {groupedNotifications.length > 0 ? (
          <View style={styles.groups}>
            {groupedNotifications.map((group) => (
              <View key={group.section} style={styles.section}>
                <AppText variant="sectionTitle">{group.title}</AppText>
                {group.data.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={handleNotificationPress}
                    unread={!isRead(notification)}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <EmptyNotificationsState />
        )}
      </ScrollView>
    </View>
  );
}

function EmptyNotificationsState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.text.tertiary} name="notifications-outline" size={32} />
      </View>
      <View style={styles.emptyCopy}>
        <AppText align="center" variant="sectionTitle">
          لا توجد إشعارات
        </AppText>
        <AppText align="center" tone="secondary" variant="body">
          ستظهر هنا التنبيهات المالية والتقارير والتوصيات المهمة.
        </AppText>
      </View>
      <AppButton onPress={() => router.replace(routes.home)} variant="secondary">
        العودة إلى الرئيسية
      </AppButton>
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
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
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
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
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
  headerTitle: {
    flex: 1,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  topActionRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  markAll: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  disabledAction: {
    opacity: 0.55,
  },
  filters: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
  },
  notice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  groups: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'stretch',
    gap: spacing.lg,
    justifyContent: 'center',
    minHeight: 430,
  },
  emptyIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  emptyCopy: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
