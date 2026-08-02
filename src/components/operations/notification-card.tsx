import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { CapitalNotification } from '@/screens/operations/notification-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NotificationStatusDot, getNotificationAccent } from './notification-status-dot';

type NotificationCardProps = {
  notification: CapitalNotification;
  unread: boolean;
  onPress: (notification: CapitalNotification) => void;
};

export function NotificationCard({ notification, unread, onPress }: NotificationCardProps) {
  const accentColor = getNotificationAccent(notification.accent);
  const readLabel = unread ? 'غير مقروء' : 'مقروء';

  return (
    <Pressable
      accessibilityLabel={`${notification.title}، ${readLabel}`}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(notification);
      }}
      style={({ pressed }) => [styles.root, unread && styles.unread, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { borderColor: accentColor, backgroundColor: `${accentColor}20` }]}>
        <Ionicons color={accentColor} name={notification.icon} size={20} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText numberOfLines={1} style={styles.title} tone={unread ? 'primary' : 'muted'} variant="cardTitle">
            {notification.title}
          </AppText>
          {unread ? (
            <View style={styles.unreadBadge}>
              <AppText align="center" tone="success" variant="caption">
                غير مقروءة
              </AppText>
            </View>
          ) : null}
          <NotificationStatusDot accent={notification.accent} unread={unread} />
        </View>

        <AppText numberOfLines={2} tone={unread ? 'secondary' : 'tertiary'} variant="supporting">
          {notification.description}
        </AppText>

        <View style={styles.metaRow}>
          <AppText tone="secondary" variant="caption">
            {notification.categoryLabel}
          </AppText>
          <AppText align="left" style={styles.ltrValue} tone="tertiary" variant="caption">
            {notification.timestamp}
          </AppText>
        </View>
      </View>

      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 116,
    padding: spacing.lg,
  },
  unread: {
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderColor: 'rgba(79,138,91,0.28)',
  },
  iconWrap: {
    alignItems: 'center',
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
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  ltrValue: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
