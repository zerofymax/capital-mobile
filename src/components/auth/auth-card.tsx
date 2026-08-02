import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function AuthCard({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View {...props} style={[styles.root, style]}>
      <View style={styles.blurFallback} />
      <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(38,46,62,0.58)', 'rgba(12,16,22,0.72)']}
        end={{ x: 0.95, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: colors.glass.border,
    borderRadius: 26,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 34px rgba(0,0,0,0.42)',
    overflow: 'hidden',
  },
  blurFallback: {
    backgroundColor: colors.glass.fillDeep,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
});
