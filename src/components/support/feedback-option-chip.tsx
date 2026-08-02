import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type FeedbackOptionChipProps<T extends string> = {
  id: T;
  label: string;
  selected: boolean;
  onPress: (id: T) => void;
};

export function FeedbackOptionChip<T extends string>({ id, label, selected, onPress }: FeedbackOptionChipProps<T>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(id);
      }}
      style={({ pressed }) => [styles.root, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
