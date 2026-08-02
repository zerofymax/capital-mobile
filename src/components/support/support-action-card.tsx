import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { SupportActionRow } from '@/screens/support/support-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type SupportActionCardProps = {
  action: SupportActionRow;
  onPress: (action: SupportActionRow) => void;
};

export function SupportActionCard({ action, onPress }: SupportActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(action);
      }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons color={colors.text.muted} name={action.icon} size={19} />
      </View>
      <AppText style={styles.label} variant="body">
        {action.label}
      </AppText>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 56,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
