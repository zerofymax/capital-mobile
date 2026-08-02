import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BillPaymentMethodCardProps = {
  account: string;
  balance: string;
};

export function BillPaymentMethodCard({ account, balance }: BillPaymentMethodCardProps) {
  return (
    <GlassSurface>
      <View style={styles.root}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.brand.green} name="wallet-outline" size={20} />
        </View>
        <View style={styles.copy}>
          <AppText variant="cardTitle">{account}</AppText>
          <AppText align="left" style={styles.balance} tone="secondary" variant="caption">
            الرصيد المتاح: {balance}
          </AppText>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  balance: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
