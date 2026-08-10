import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { AccountSubscription } from '@/screens/account/account-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type SubscriptionCardProps = {
  subscription: AccountSubscription;
  onPress: () => void;
};

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  const [priceAmount, pricePeriod = ''] = subscription.priceLine
    .split('/')
    .map((part) => part.trim());

  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        <View style={[styles.titleRow, Platform.OS === 'ios' && styles.titleRowIos]}>
          <AppText
            align="left"
            style={[styles.planTitle, Platform.OS === 'ios' && styles.planTitleIos]}
            variant="sectionTitle"
          >
            {directionSafeText(subscription.title)}
          </AppText>
          <View style={styles.statusBadge}>
            <AppText align="center" style={styles.statusBadgeText} variant="caption">
              {subscription.statusValue}
            </AppText>
          </View>
        </View>
        {Platform.OS === 'ios' ? (
          <View style={styles.priceRowIos}>
            <AppText align="left" style={styles.priceAmountIos} variant="numericValue">
              {priceAmount}
            </AppText>
            {pricePeriod ? (
              <>
                <AppText align="left" style={styles.priceSeparatorIos} variant="numericValue">
                  /
                </AppText>
                <AppText align="left" style={styles.pricePeriodIos} variant="numericValue">
                  {pricePeriod}
                </AppText>
              </>
            ) : null}
          </View>
        ) : (
          <AppText align="left" style={styles.priceText} variant="numericValue">
            {subscription.priceLine}
          </AppText>
        )}
        <AppText style={styles.renewalText} tone="secondary" variant="body">
          {directionSafeText(subscription.renewalLine)}
        </AppText>
      </View>

      <Pressable
        accessibilityLabel={subscription.ctaLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <AppText align="center" numberOfLines={1} style={styles.ctaText} variant="buttonLabel">
          {subscription.ctaLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#0B1713',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: 20,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 110,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  copy: {
    alignItems: Platform.OS === 'android' ? 'flex-end' : 'flex-start',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  titleRow: {
    alignSelf: Platform.OS === 'android' ? 'stretch' : 'auto',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: Platform.OS === 'android' ? 'flex-start' : 'flex-start',
  },
  titleRowIos: {
    gap: spacing.md,
    maxWidth: '100%',
    minWidth: 0,
  },
  planTitle: {
    color: colors.text.primary,
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 27,
    minWidth: 0,
    writingDirection: 'rtl',
  },
  planTitleIos: {
    fontFamily: 'System',
    minHeight: 27,
  },
  statusBadge: {
    backgroundColor: 'rgba(79,138,91,0.18)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  statusBadgeText: {
    color: colors.brand.calmGreen,
    fontSize: 11.5,
    lineHeight: 15,
  },
  priceText: {
    alignSelf: 'flex-start',
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 27,
    marginTop: spacing.xs,
    maxWidth: '100%',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  priceRowIos: {
    alignItems: 'baseline',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    maxWidth: '100%',
  },
  priceAmountIos: {
    color: colors.text.primary,
    direction: 'ltr',
    flexShrink: 0,
    fontSize: 18,
    lineHeight: 27,
    writingDirection: 'ltr',
  },
  priceSeparatorIos: {
    color: colors.text.primary,
    direction: 'ltr',
    flexShrink: 0,
    fontSize: 18,
    lineHeight: 27,
    writingDirection: 'ltr',
  },
  pricePeriodIos: {
    color: colors.text.primary,
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 27,
    writingDirection: 'rtl',
  },
  renewalText: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'left',
    width: '100%',
    writingDirection: 'rtl',
  },
  cta: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.brand.green,
    borderRadius: 22,
    flexShrink: 0,
    height: 50,
    justifyContent: 'center',
    maxWidth: 120,
    minWidth: 108,
    paddingHorizontal: spacing.md,
  },
  ctaText: {
    color: colors.brand.lightNeutral,
    fontSize: 14,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
