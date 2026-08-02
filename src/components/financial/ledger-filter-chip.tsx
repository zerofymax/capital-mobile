import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type LedgerFilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function LedgerFilterChip({ label, selected, onPress }: LedgerFilterChipProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.root, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText style={[styles.label, selected && styles.selectedLabel]} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 58,
    paddingHorizontal: spacing.lg,
  },
  selected: {
    backgroundColor: 'rgba(79,138,91,0.11)',
    borderColor: 'rgba(79,138,91,0.38)',
  },
  label: {
    color: colors.text.secondary,
  },
  selectedLabel: {
    color: colors.brand.green,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
