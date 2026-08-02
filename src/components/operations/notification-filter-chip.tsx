import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui';
import type { NotificationFilter } from '@/screens/operations/notification-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type NotificationFilterChipProps = {
  id: NotificationFilter;
  label: string;
  selected: boolean;
  onPress: (id: NotificationFilter) => void;
};

export function NotificationFilterChip({ id, label, selected, onPress }: NotificationFilterChipProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(id);
      }}
      style={({ pressed }) => [
        styles.root,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <AppText align="center" numberOfLines={1} tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.46)',
  },
  unselected: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
