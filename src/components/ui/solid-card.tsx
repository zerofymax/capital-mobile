import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColors } from '@/state/appearance-state';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export function SolidCard({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  const colors = useThemeColors();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.card,
          borderColor: colors.surface.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.input,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
