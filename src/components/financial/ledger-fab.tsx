import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigationMetrics } from '@/components/navigation';
import { CapitalGlassControlSurface } from '@/components/navigation/capital-glass-control-surface';
import { colors } from '@/theme/colors';

type LedgerFabProps = {
  onPress: () => void;
};

export function LedgerFab({ onPress }: LedgerFabProps) {
  const insets = useSafeAreaInsets();
  const bottom =
    Platform.OS === 'ios'
      ? insets.bottom + 16
      : Math.max(insets.bottom, navigationMetrics.bottomGap) + navigationMetrics.barHeight + 18;

  return (
    <View style={[styles.overlay, { bottom, left: Math.max(insets.left + 20, 20) }]}>
      <Pressable
        accessibilityLabel="إضافة عملية"
        accessibilityRole="button"
        hitSlop={6}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          Platform.OS === 'ios' && styles.iosButton,
          pressed && (Platform.OS === 'ios' ? styles.iosPressed : styles.pressed),
        ]}
      >
        {Platform.OS === 'ios' ? (
          <CapitalGlassControlSurface effect="regular" radius={18} tone="accent" />
        ) : (
          <>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(35,42,55,0.82)', 'rgba(8,10,14,0.88)']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0.1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.highlight} />
          </>
        )}
        <Ionicons color={colors.brand.green} name="add-outline" size={25} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    pointerEvents: 'box-none',
    position: 'absolute',
    zIndex: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderColor: colors.glass.border,
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 14px 28px rgba(0,0,0,0.45)',
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 50,
  },
  highlight: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    height: 1,
    left: 11,
    position: 'absolute',
    right: 11,
    top: 1,
  },
  iosButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  iosPressed: {
    transform: [{ scale: 0.96 }],
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.96 }],
  },
});
