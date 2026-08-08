import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ToggleRowProps = {
  title: string;
  description?: string;
  value: boolean;
  disabled?: boolean;
  onValueChange?: (value: boolean) => void;
};

export function ToggleRow({ title, description, value, disabled, onValueChange }: ToggleRowProps) {
  return (
    <View style={[styles.root, disabled && styles.disabled]}>
      <View style={styles.copy}>
        <AppText variant="cardTitle">{title}</AppText>
        {description ? (
          <AppText tone="secondary" variant="caption">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        disabled={disabled}
        ios_backgroundColor={colors.surface.muted}
        onValueChange={onValueChange}
        thumbColor={value ? colors.text.inverse : colors.text.tertiary}
        trackColor={{ false: colors.surface.muted, true: colors.brand.green }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    padding: spacing.lg,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.55,
  },
});
