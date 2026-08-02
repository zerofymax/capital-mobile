import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { Beneficiary } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BeneficiaryCardProps = {
  beneficiary: Beneficiary;
  selected: boolean;
  onPress: (beneficiary: Beneficiary) => void;
};

export function BeneficiaryCard({ beneficiary, selected, onPress }: BeneficiaryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(beneficiary);
      }}
      style={({ pressed }) => [styles.root, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, selected && styles.iconSelected]}>
        <Ionicons color={selected ? colors.brand.green : colors.text.secondary} name="person-outline" size={19} />
      </View>
      <View style={styles.copy}>
        <AppText variant="cardTitle">{beneficiary.name}</AppText>
        <AppText align="left" style={styles.iban} tone="secondary" variant="caption">
          ****{beneficiary.ibanEnding}
        </AppText>
      </View>
      <Ionicons color={selected ? colors.brand.green : colors.text.tertiary} name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 70,
    padding: spacing.lg,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconSelected: {
    backgroundColor: 'rgba(79,138,91,0.12)',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  iban: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
