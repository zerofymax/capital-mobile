import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import type { OperationTransaction } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type TransactionHeaderCardProps = {
  transaction: OperationTransaction;
};

export function TransactionHeaderCard({ transaction }: TransactionHeaderCardProps) {
  const isIncome = transaction.type === 'income';

  return (
    <GlassSurface style={styles.root}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
          <Ionicons
            color={isIncome ? colors.semantic.success : colors.semantic.danger}
            name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
            size={22}
          />
        </View>
        <View style={styles.copy}>
          <AppText variant="cardTitle">{transaction.title}</AppText>
          <AppText tone="secondary" variant="supporting">
            {isIncome ? 'دخل' : 'مصروف'} · {transaction.category}
          </AppText>
        </View>
      </View>
      <AppText
        align="left"
        style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}
        variant="numericValue"
      >
        {transaction.amount}
      </AppText>
      <View style={styles.footer}>
        <AppText tone="secondary" variant="caption">
          {transaction.account}
        </AppText>
        <View style={styles.statusBadge}>
          <AppText tone="success" variant="caption">
            {transaction.status}
          </AppText>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  incomeIcon: {
    backgroundColor: colors.semantic.successTint,
  },
  expenseIcon: {
    backgroundColor: colors.semantic.dangerTint,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  amount: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  incomeText: {
    color: colors.semantic.success,
  },
  expenseText: {
    color: colors.semantic.danger,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
