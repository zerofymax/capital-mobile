import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BiometricButtonProps = {
  onPress: () => void;
};

export function BiometricButton({ onPress }: BiometricButtonProps) {
  return (
    <Pressable
      accessibilityLabel="الدخول بالبصمة"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <Ionicons color={colors.brand.green} name="finger-print-outline" size={20} />
      <AppText style={styles.label} variant="buttonLabel">
        الدخول بالبصمة
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.08)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 50,
  },
  label: {
    color: colors.brand.green,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
