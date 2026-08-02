import { StyleSheet, View } from 'react-native';

import type { NotificationAccent } from '@/screens/operations/notification-data';
import { colors } from '@/theme/colors';

type NotificationStatusDotProps = {
  unread?: boolean;
  accent: NotificationAccent;
};

export function NotificationStatusDot({ unread = false, accent }: NotificationStatusDotProps) {
  const accentColor = getNotificationAccent(accent);

  return (
    <View
      accessibilityLabel={unread ? 'إشعار غير مقروء' : 'إشعار مقروء'}
      style={[
        styles.dot,
        { backgroundColor: unread ? accentColor : colors.text.tertiary },
        !unread && styles.read,
      ]}
    />
  );
}

export function getNotificationAccent(accent: NotificationAccent) {
  if (accent === 'amber') {
    return colors.semantic.warning;
  }

  if (accent === 'muted') {
    return colors.text.muted;
  }

  return colors.brand.mediumGreen;
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  read: {
    opacity: 0.34,
  },
});
