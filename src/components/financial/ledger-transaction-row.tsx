import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FinancialAmount } from '@/components/financial/financial-amount';
import { StatusBadge } from '@/components/feedback';
import { AppText } from '@/components/ui/app-text';
import type { LedgerTransaction } from '@/screens/ledger/ledger-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type LedgerTransactionRowProps = {
  transaction: LedgerTransaction;
  isLast?: boolean;
  onPress: (transaction: LedgerTransaction) => void;
};

export function LedgerTransactionRow({ transaction, isLast = false, onPress }: LedgerTransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const semanticLabel = isIncome ? 'دخل' : 'مصروف';
  const displayAmount = transaction.amount === 0
    ? 0
    : isIncome
      ? Math.abs(transaction.amount)
      : -Math.abs(transaction.amount);

  return (
    <Pressable
      accessibilityLabel={`${semanticLabel}، ${transaction.title}، ${transaction.category}، ${transaction.dateGroup}`}
      accessibilityRole="button"
      onPress={() => onPress(transaction)}
      style={({ pressed }) => [styles.root, !isLast && styles.withBorder, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText numberOfLines={2} style={styles.titleText} variant="body">
            {transaction.title}
          </AppText>
          {transaction.recurring ? <StatusBadge label="متكرر" tone="warning" /> : null}
        </View>
        <View style={styles.metaRow}>
          <AppText numberOfLines={1} style={styles.metaText} tone="secondary" variant="caption">
            {transaction.category}
          </AppText>
          <View style={[styles.typeDot, isIncome ? styles.incomeDot : styles.expenseDot]} />
          <AppText tone={isIncome ? 'success' : 'danger'} variant="caption">
            {semanticLabel}
          </AppText>
        </View>
      </View>
      <View style={[styles.icon, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
        <Ionicons
          color={isIncome ? colors.semantic.success : colors.semantic.danger}
          name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={17}
        />
      </View>
      <FinancialAmount signed size="row" tone={isIncome ? 'success' : 'danger'} value={displayAmount} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  withBorder: {
    borderBottomColor: 'rgba(255,255,255,0.055)',
    borderBottomWidth: 1,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  incomeIcon: {
    backgroundColor: colors.semantic.successTint,
  },
  expenseIcon: {
    backgroundColor: colors.semantic.dangerTint,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metaRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaText: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  typeDot: {
    borderRadius: radii.pill,
    height: 5,
    width: 5,
  },
  incomeDot: {
    backgroundColor: colors.semantic.success,
  },
  expenseDot: {
    backgroundColor: colors.semantic.danger,
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
