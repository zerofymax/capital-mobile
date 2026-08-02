import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import type { BillPaymentSuccessData } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BillSuccessCardProps = {
  data: BillPaymentSuccessData;
};

export function BillSuccessCard({ data }: BillSuccessCardProps) {
  return (
    <GlassSurface>
      <View style={styles.root}>
        <View style={styles.successIcon}>
          <Ionicons color={colors.brand.green} name="checkmark" size={32} />
        </View>
        <View style={styles.copy}>
          <AppText align="center" variant="sectionTitle">
            تم إنشاء دفع تجريبي بنجاح
          </AppText>
          <AppText align="center" style={styles.amount} variant="numericValue">
            {data.amount}
          </AppText>
          <AppText align="center" tone="secondary" variant="supporting">
            {data.billTitle}
          </AppText>
          <AppText align="center" style={styles.reference} tone="tertiary" variant="caption">
            {data.reference}
          </AppText>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  amount: {
    color: colors.semantic.success,
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  reference: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
