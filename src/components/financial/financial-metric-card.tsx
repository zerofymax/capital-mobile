import { StyleSheet, View } from 'react-native';

import { FinancialAmount } from '@/components/financial/financial-amount';
import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { directionSafeText } from '@/utils/rtl';

type FinancialMetricCardProps = {
  label: string;
  value: number;
  change: string;
  tone: 'success' | 'danger' | 'primary';
  valuesHidden?: boolean;
  currencySymbol?: string;
};

export function FinancialMetricCard({ label, value, change, tone, valuesHidden, currencySymbol }: FinancialMetricCardProps) {
  const changeTone = tone === 'danger' ? 'danger' : 'success';

  return (
    <View style={styles.root}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <FinancialAmount currencySymbol={currencySymbol} hidden={valuesHidden} size="row" tone={tone} value={value} />
      <AppText tone={changeTone} variant="caption">
        {directionSafeText(change)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexShrink: 0,
    gap: 6,
    padding: 14,
    width: 136,
  },
});
