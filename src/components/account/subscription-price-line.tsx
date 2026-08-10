import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { AppText } from '@/components/ui';

type SubscriptionPriceLineProps = {
  amount: string;
  period: string;
  style?: StyleProp<TextStyle>;
};

export function SubscriptionPriceLine({ amount, period, style }: SubscriptionPriceLineProps) {
  return (
    <AppText
      adjustsFontSizeToFit
      minimumFontScale={0.78}
      numberOfLines={1}
      style={[styles.root, style]}
      variant="numericValue"
    >
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.period}>{` / ${period}`}</Text>
    </AppText>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  amount: {
    writingDirection: 'ltr',
  },
  period: {
    writingDirection: 'rtl',
  },
});
