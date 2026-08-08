import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { CapitalNotification } from '@/screens/operations/notification-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NotificationStatusDot, getNotificationAccent } from './notification-status-dot';

const androidPhysicalRtlRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row-reverse' as const }
  : {};
const androidPhysicalRightAlignedColumn = Platform.OS === 'android'
  ? { direction: 'ltr' as const }
  : {};

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
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <View style={styles.titleSlot}>
            <AppText align="right" numberOfLines={1} style={styles.title} tone={unread ? 'primary' : 'muted'} variant="cardTitle">
              {notification.title}
            </AppText>
          </View>
          {unread ? (
            <View style={styles.unreadBadge}>
              <AppText align="center" tone="success" variant="caption">
                غير مقروءة
              </AppText>
            </View>
          ) : null}
          <NotificationStatusDot accent={notification.accent} unread={unread} />
        </View>

        <AppText align="right" numberOfLines={2} style={styles.description} tone={unread ? 'secondary' : 'tertiary'} variant="supporting">
          {notification.description}
        </AppText>

        <View style={styles.metaRow}>
          <AppText align="right" style={styles.category} tone="secondary" variant="caption">
            {notification.categoryLabel}
          </AppText>
          <AppText align="left" numberOfLines={1} style={styles.ltrValue} tone="tertiary" variant="caption">
            {notification.timestamp}
          </AppText>
        </View>
      </View>

      <View style={[styles.iconWrap, { borderColor: accentColor, backgroundColor: `${accentColor}20` }]}>
        <Ionicons color={accentColor} name={notification.icon} size={20} />
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} style={styles.chevron} />
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
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 116,
    padding: spacing.lg,
    ...androidPhysicalRtlRow,
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
    flexShrink: 0,
    width: 42,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
    ...androidPhysicalRightAlignedColumn,
  },
  titleRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  titleSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
    ...androidPhysicalRightAlignedColumn,
  },
  title: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  description: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  unreadBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    flexShrink: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  category: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrValue: {
    flexShrink: 0,
    fontVariant: ['tabular-nums'],
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  chevron: {
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
