import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { QuickActionItem } from '@/screens/home/home-data';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type QuickActionProps = {
  action: QuickActionItem;
  onPress?: (action: QuickActionItem) => void;
};

export function QuickAction({ action, onPress }: QuickActionProps) {
  return (
    <Pressable
      accessibilityLabel={action.label}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress?.(action);
      }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={[styles.iconShell, action.featured && styles.featuredShell]}>
        <View style={styles.blurFallback} />
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={
            action.featured
              ? ['rgba(79,138,91,0.42)', 'rgba(79,138,91,0.28)']
              : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)']
          }
          style={StyleSheet.absoluteFill}
        />
        <Ionicons color={colors.text.muted} name={action.icon} size={20} />
      </View>
      <AppText align="center" numberOfLines={2} style={styles.label} variant="caption">
        {action.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 70,
    width: 76,
  },
  iconShell: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 16px rgba(0,0,0,0.3)',
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 44,
  },
  featuredShell: {
    borderColor: 'rgba(167,200,161,0.4)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 20px rgba(79,138,91,0.35)',
  },
  blurFallback: {
    backgroundColor: colors.glass.fillDeep,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  label: {
    color: '#C7CCD4',
    includeFontPadding: false,
    lineHeight: 17,
    width: '100%',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
