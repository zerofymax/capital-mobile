import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { OperationTransactionType } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type TransactionTypeSelectorProps = {
  value: OperationTransactionType;
  onChange: (value: OperationTransactionType) => void;
};

const options: { label: string; value: OperationTransactionType }[] = [
  { label: 'دخل', value: 'income' },
  { label: 'مصروف', value: 'expense' },
];

export function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const selected = value === option.value;
        const isIncome = option.value === 'income';
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null);
              onChange(option.value);
            }}
            style={({ pressed }) => [
              styles.option,
              selected && (isIncome ? styles.incomeSelected : styles.expenseSelected),
              pressed && styles.pressed,
            ]}
          >
            <AppText
              align="center"
              tone={selected ? (isIncome ? 'success' : 'danger') : 'secondary'}
              variant="buttonLabel"
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.xs,
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.control,
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
  },
  incomeSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.24)',
    borderWidth: 1,
  },
  expenseSelected: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.24)',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.78,
  },
});
