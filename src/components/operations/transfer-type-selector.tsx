import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { TransferType } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type TransferTypeSelectorProps = {
  value: TransferType;
  onChange: (value: TransferType) => void;
};

const options: { label: string; value: TransferType }[] = [
  { label: 'محلي', value: 'local' },
  { label: 'دولي', value: 'international' },
];

export function TransferTypeSelector({ value, onChange }: TransferTypeSelectorProps) {
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const selected = value === option.value;
        const disabled = option.value === 'international';

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled, selected }}
            key={option.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null);
              onChange(option.value);
            }}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              disabled && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
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
    justifyContent: 'center',
    minHeight: 46,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.78,
  },
});
