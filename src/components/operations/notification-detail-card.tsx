import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, SolidCard } from '@/components/ui';
import type { CapitalNotification } from '@/screens/operations/notification-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { getNotificationAccent } from './notification-status-dot';

type NotificationDetailCardProps = {
  notification: CapitalNotification;
};

export function NotificationDetailCard({ notification }: NotificationDetailCardProps) {
  const accentColor = getNotificationAccent(notification.accent);

  return (
    <View style={styles.root}>
      <View style={[styles.iconWrap, { borderColor: accentColor, backgroundColor: `${accentColor}20` }]}>
        <Ionicons color={accentColor} name={notification.icon} size={28} />
      </View>
      <View style={styles.titleBlock}>
        <AppText align="center" variant="screenTitle">
          {notification.title}
        </AppText>
        <AppText align="center" style={styles.ltrValue} tone="tertiary" variant="supporting">
          {notification.section === 'today' ? `اليوم، ${notification.timestamp}` : notification.timestamp}
        </AppText>
      </View>

      <SolidCard style={styles.bodyCard}>
        <AppText style={styles.bodyText} tone="secondary" variant="body">
          {notification.body}
        </AppText>
      </SolidCard>

      {notification.amount ? (
        <SolidCard style={styles.savingsCard}>
          <View>
            <AppText tone="secondary" variant="supporting">
              {notification.category === 'intelligence' ? 'التوفير المحتمل' : 'القيمة المرتبطة'}
            </AppText>
            <AppText align="left" style={styles.amountValue} tone="success" variant="sectionTitle">
              {notification.amount}
            </AppText>
          </View>
          <View style={styles.savingsIcon}>
            <Ionicons color={colors.brand.calmGreen} name="trending-up-outline" size={20} />
          </View>
        </SolidCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  titleBlock: {
    gap: spacing.xs,
    maxWidth: 300,
  },
  bodyCard: {
    width: '100%',
  },
  bodyText: {
    lineHeight: 26,
  },
  savingsCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  savingsIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  amountValue: {
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
    writingDirection: 'ltr',
  },
  ltrValue: {
    writingDirection: 'ltr',
  },
});
