import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type CategoryPickerProps = {
  title: string;
  options: readonly string[];
  selectedValue: string;
  error?: string;
  onSelect: (value: string) => void;
};

export function CategoryPicker({ title, options, selectedValue, error, onSelect }: CategoryPickerProps) {
  return (
    <View style={styles.root}>
      <AppText variant="sectionTitle">{title}</AppText>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = selectedValue === option;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => {
                Haptics.selectionAsync().catch(() => null);
                onSelect(option);
              }}
              style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
            >
              <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="supporting">
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  options: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});
