import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FinancialAmount } from '@/components/financial/financial-amount';
import { AppText } from '@/components/ui';
import type { TransactionItem } from '@/screens/home/home-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type TransactionRowProps = {
  transaction: TransactionItem;
  isLast?: boolean;
  onPress?: (transaction: TransactionItem) => void;
  currencySymbol?: string;
};

export function TransactionRow({ transaction, isLast, onPress, currencySymbol }: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const displayAmount = transaction.amount === 0
    ? 0
    : isIncome
      ? Math.abs(transaction.amount)
      : -Math.abs(transaction.amount);

  return (
    <Pressable
      accessibilityLabel={`${transaction.title}، ${transaction.category}، ${transaction.date}`}
      accessibilityRole="button"
      onPress={() => onPress?.(transaction)}
      style={({ pressed }) => [styles.root, !isLast && styles.withBorder, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <AppText numberOfLines={1} style={styles.copyText} variant="body">
          {transaction.title}
        </AppText>
        <AppText numberOfLines={1} style={styles.copyText} tone="secondary" variant="caption">
          {directionSafeText(`${transaction.category} · ${transaction.date}`)}
        </AppText>
      </View>
      <FinancialAmount currencySymbol={currencySymbol} signed size="row" tone={isIncome ? 'success' : 'danger'} value={displayAmount} />
      <View style={[styles.icon, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
        <Ionicons
          color={isIncome ? colors.semantic.success : colors.semantic.danger}
          name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={16}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  withBorder: {
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
    minWidth: 0,
  },
  copyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
