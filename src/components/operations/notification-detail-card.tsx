import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';

import { AppText, SolidCard } from '@/components/ui';
import type { CapitalNotification } from '@/screens/operations/notification-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { getNotificationAccent } from './notification-status-dot';

const androidPhysicalRtlRow: ViewStyle = { direction: 'ltr', flexDirection: 'row-reverse' };
const androidSavingsContent: ViewStyle = {
      alignItems: 'center' as const,
      direction: 'ltr' as const,
      flex: 1,
      flexDirection: 'row-reverse' as const,
      gap: spacing.md,
      minWidth: 0,
    };
const androidSavingsLabelSlot: ViewStyle = { flex: 1, minWidth: 0 };
const androidSavingsLabel: TextStyle = {
      alignSelf: 'stretch' as const,
      textAlign: 'right' as const,
      width: '100%' as const,
      writingDirection: 'rtl' as const,
    };
const androidBodyText: TextStyle = {
      alignSelf: 'stretch' as const,
      textAlign: 'right' as const,
      width: '100%' as const,
      writingDirection: 'rtl' as const,
    };
const androidAmountValue: TextStyle = { marginTop: 0 };

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
          <View style={styles.savingsContent}>
            <View style={styles.savingsLabelSlot}>
              <AppText style={styles.savingsLabel} tone="secondary" variant="supporting">
                {notification.category === 'intelligence' ? 'التوفير المحتمل' : 'القيمة المرتبطة'}
              </AppText>
            </View>
            <AppText
              align="left"
              numberOfLines={1}
              style={styles.amountValue}
              tone="success"
              variant="sectionTitle"
            >
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
    ...androidBodyText,
  },
  savingsCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  savingsContent: {
    ...androidSavingsContent,
  },
  savingsLabelSlot: {
    ...androidSavingsLabelSlot,
  },
  savingsLabel: {
    ...androidSavingsLabel,
  },
  savingsIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderRadius: radii.control,
    flexShrink: 0,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  amountValue: {
    flexShrink: 0,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
    textAlign: 'left',
    writingDirection: 'ltr',
    ...androidAmountValue,
  },
  ltrValue: {
    writingDirection: 'ltr',
  },
});
