import { StyleSheet, View } from 'react-native';

import { LedgerTransactionRow } from '@/components/financial/ledger-transaction-row';
import { AppText } from '@/components/ui/app-text';
import type { LedgerGroup, LedgerTransaction } from '@/screens/ledger/ledger-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type LedgerDateGroupProps = {
  group: LedgerGroup;
  onTransactionPress: (transaction: LedgerTransaction) => void;
};

export function LedgerDateGroup({ group, onTransactionPress }: LedgerDateGroupProps) {
  if (group.transactions.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <AppText style={styles.title} tone="secondary" variant="caption">
        {group.label}
      </AppText>
      <View style={styles.card}>
        {group.transactions.map((transaction, index) => (
          <LedgerTransactionRow
            isLast={index === group.transactions.length - 1}
            key={transaction.id}
            onPress={onTransactionPress}
            transaction={transaction}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  title: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  card: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
