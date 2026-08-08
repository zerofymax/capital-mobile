import { StyleSheet, View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import type { CardTransaction } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type CardTransactionRowProps = {
  transaction: CardTransaction;
  isLast?: boolean;
};

export function CardTransactionRow({ transaction, isLast = false }: CardTransactionRowProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <AppText style={styles.title} variant="body">{transaction.title}</AppText>
          <AppText align="left" style={styles.ltrText} tone="secondary" variant="caption">
            {transaction.date}
          </AppText>
        </View>
        <AppText align="left" style={styles.amount} tone="danger" variant="body">
          {transaction.amount}
        </AppText>
      </View>
      {!isLast ? <Divider /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  amount: {
    color: colors.semantic.danger,
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
