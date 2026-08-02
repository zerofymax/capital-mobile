import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { navigationMetrics } from './navigation-metrics';

export function CapitalTabBarFallbackSurface() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.blurFallback} />
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(30,34,42,0.72)', 'rgba(10,12,16,0.82)']}
        end={{ x: 0.95, y: 1 }}
        start={{ x: 0.15, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topHighlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.elevated,
    borderRadius: navigationMetrics.barRadius,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  blurFallback: {
    backgroundColor: 'rgba(10,12,16,0.90)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  topHighlight: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    height: 1,
    left: 20,
    position: 'absolute',
    right: 20,
    top: 1,
  },
});
