import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { navigationMetrics } from './navigation-metrics';

export function CapitalTabBarActiveFallbackSurface() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View pointerEvents="none" style={styles.highlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.26)',
    borderRadius: navigationMetrics.bubbleHeight / 2,
    borderWidth: 0.75,
    bottom: 0,
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 18px rgba(0,0,0,0.24)',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  highlight: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    height: 1,
    left: 12,
    position: 'absolute',
    right: 12,
    top: 1,
  },
});
