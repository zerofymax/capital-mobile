import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { navigationMetrics } from './navigation-metrics';
import { CapitalTabBarActiveFallbackSurface } from './capital-tab-bar-active-fallback-surface';

const liquidGlassAvailable = getLiquidGlassAvailability();

export function CapitalTabBarActiveSurface() {
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceTransparencyEnabled(enabled);
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceTransparencyEnabled(true);
        }
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparencyEnabled,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  if (!liquidGlassAvailable || reduceTransparencyEnabled) {
    return <CapitalTabBarActiveFallbackSurface />;
  }

  return (
    <View pointerEvents="none" style={styles.root}>
      <GlassView
        colorScheme="dark"
        glassEffectStyle="clear"
        isInteractive={false}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tintColor={colors.semantic.successTint}
      />
      <View pointerEvents="none" style={styles.highlight} />
    </View>
  );
}

function getLiquidGlassAvailability() {
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: navigationMetrics.bubbleHeight / 2,
    borderWidth: 0.75,
    bottom: 0,
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 18px rgba(0,0,0,0.22)',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  highlight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    height: 1,
    left: 12,
    position: 'absolute',
    right: 12,
    top: 1,
  },
});
