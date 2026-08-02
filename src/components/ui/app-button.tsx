import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useThemeColors } from '@/state/appearance-state';
import { radii } from '@/theme/radii';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';

type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type AppButtonProps = {
  variant?: AppButtonVariant;
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  iconName,
  onPress,
  style,
  ...props
}: PropsWithChildren<AppButtonProps>) {
  const isDisabled = disabled || loading;
  const colors = useThemeColors();

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        variant === 'secondary' && {
          backgroundColor: colors.surface.muted,
          borderColor: colors.surface.inputBorder,
        },
        variant === 'danger' && {
          backgroundColor: colors.semantic.dangerTint,
          borderColor: colors.semantic.danger,
        },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={[colors.brand.ctaStart, colors.brand.ctaEnd]} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors.text.primary} size="small" /> : null}
        {!loading && iconName ? <Ionicons color={colors.text.primary} name={iconName} size={18} /> : null}
        <AppText align="center" variant="buttonLabel">
          {children}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.button,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  primary: {
    ...shadows.cta,
  },
  secondary: {
    borderWidth: 1,
  },
  danger: {
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
