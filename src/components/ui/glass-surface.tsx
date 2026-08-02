import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';

type GlassSurfaceProps = ViewProps & {
  radius?: number;
};

export function GlassSurface({ children, radius = radii.glass, style, ...props }: PropsWithChildren<GlassSurfaceProps>) {
  return (
    <View {...props} style={[styles.root, { borderRadius: radius }, style]}>
      <BlurView intensity={32} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.glass.fill, colors.glass.fillDeep]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.inner, { borderRadius: radius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: colors.glass.border,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.glass,
  },
  inner: {
    borderTopColor: colors.glass.shine,
    borderTopWidth: 1,
    padding: spacing.lg,
  },
});
