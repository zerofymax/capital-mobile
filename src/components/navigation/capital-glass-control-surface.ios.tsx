import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import type {
  CapitalGlassControlSurfaceProps,
  CapitalGlassControlTone,
} from './capital-glass-control-surface.types';

const liquidGlassAvailable = getLiquidGlassAvailability();

export function CapitalGlassControlSurface({
  effect = 'clear',
  radius,
  style,
  tone = 'neutral',
}: CapitalGlassControlSurfaceProps) {
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

  const tintColor = getTintColor(tone);

  return (
    <View
      pointerEvents="none"
      style={[styles.root, { borderRadius: radius }, style]}
    >
      {!liquidGlassAvailable || reduceTransparencyEnabled ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.fallback,
            tone === 'accent' && styles.accentFallback,
          ]}
        />
      ) : (
        <GlassView
          colorScheme="dark"
          glassEffectStyle={effect}
          isInteractive={false}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          tintColor={tintColor}
        />
      )}
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

function getTintColor(tone: CapitalGlassControlTone) {
  return tone === 'accent' ? colors.semantic.successTint : 'rgba(15,24,22,0.16)';
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 0.75,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  fallback: {
    backgroundColor: 'rgba(18,22,27,0.94)',
  },
  accentFallback: {
    backgroundColor: 'rgba(24,63,48,0.90)',
  },
  highlight: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    height: 1,
    left: 9,
    position: 'absolute',
    right: 9,
    top: 1,
  },
});
