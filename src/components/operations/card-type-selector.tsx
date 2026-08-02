import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { BusinessCardType } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type CardTypeOption = {
  id: BusinessCardType;
  label: string;
  description: string;
};

type CardTypeSelectorProps = {
  options: CardTypeOption[];
  selectedValue: BusinessCardType | '';
  onSelect: (value: BusinessCardType) => void;
};

export function CardTypeSelector({ options, selectedValue, onSelect }: CardTypeSelectorProps) {
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const selected = option.id === selectedValue;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null);
              onSelect(option.id);
            }}
            style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
          >
            <AppText variant="cardTitle">{option.label}</AppText>
            <AppText tone="secondary" variant="caption">
              {option.description}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 76,
    padding: spacing.lg,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
