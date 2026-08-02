import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { navigationMetrics } from './navigation-metrics';

type LiquidGlassBubbleProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function LiquidGlassBubble({ children, style }: LiquidGlassBubbleProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.blurFallback} />
        <BlurView intensity={34} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.06)', 'rgba(90,120,160,0.14)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.lowerReflection} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: navigationMetrics.bubbleHeight / 2,
    borderWidth: 0.75,
    boxShadow: 'inset 0 -6px 14px rgba(60,100,160,0.12), 0 12px 24px rgba(0,0,0,0.42), 0 4px 10px rgba(79,138,91,0.06)',
    height: navigationMetrics.bubbleHeight,
    justifyContent: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
    width: navigationMetrics.bubbleWidth,
  },
  blurFallback: {
    backgroundColor: colors.glass.fillDeep,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  lowerReflection: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    bottom: 0,
    height: 14,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  content: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
});
