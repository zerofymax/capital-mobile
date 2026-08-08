import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { ReportPeriod } from '@/screens/reports/reports-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type PeriodSelectorProps = {
  options: readonly { id: ReportPeriod; label: string }[];
  selectedPeriod: ReportPeriod;
  onSelect: (period: ReportPeriod) => void;
};

export function PeriodSelector({ options, selectedPeriod, onSelect }: PeriodSelectorProps) {
  return (
    <View accessibilityRole="tablist" style={styles.root}>
      {options.map((option) => {
        const selected = option.id === selectedPeriod;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [styles.option, selected && styles.selectedOption, pressed && styles.pressed]}
          >
            <AppText align="center" style={selected && styles.selectedText} variant="caption">
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
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.control,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  selectedOption: {
    backgroundColor: 'rgba(79,138,91,0.13)',
    borderColor: 'rgba(167,200,161,0.32)',
    borderWidth: 1,
  },
  selectedText: {
    color: colors.brand.green,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
