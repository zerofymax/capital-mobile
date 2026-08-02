import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { type PropsWithChildren, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

import { navigationMetrics } from './navigation-metrics';
import { CapitalTabBarFallbackSurface } from './capital-tab-bar-fallback-surface';

const liquidGlassAvailable = getLiquidGlassAvailability();

export function CapitalTabBarContainer({
  children,
  ...props
}: PropsWithChildren<ViewProps>) {
  const reduceTransparencyEnabled = useReduceTransparencyEnabled();

  if (!liquidGlassAvailable || reduceTransparencyEnabled) {
    return <View {...props}>{children}</View>;
  }

  return (
    <GlassContainer {...props} spacing={12}>
      {children}
    </GlassContainer>
  );
}

export function CapitalTabBarSurface() {
  const reduceTransparencyEnabled = useReduceTransparencyEnabled();

  if (!liquidGlassAvailable || reduceTransparencyEnabled) {
    return <CapitalTabBarFallbackSurface />;
  }

  return (
    <View pointerEvents="none" style={styles.root}>
      <GlassView
        colorScheme="dark"
        glassEffectStyle="regular"
        isInteractive={false}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tintColor="rgba(11,46,38,0.20)"
      />
      <View pointerEvents="none" style={styles.topHighlight} />
    </View>
  );
}

function useReduceTransparencyEnabled() {
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

  return reduceTransparencyEnabled;
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
    borderRadius: navigationMetrics.barRadius,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
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
