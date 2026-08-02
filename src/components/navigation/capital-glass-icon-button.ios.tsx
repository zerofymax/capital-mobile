import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { CapitalGlassControlSurface } from './capital-glass-control-surface';
import type { CapitalGlassIconButtonProps } from './capital-glass-icon-button.types';

export function CapitalGlassIconButton(props: CapitalGlassIconButtonProps) {
  const {
    accessibilityLabel,
    disabled,
    hitSlop,
    iconColor,
    iconName,
    iconSize,
    onPress,
    radius,
    style,
    tone,
  } = props;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        style,
        styles.glassHost,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <CapitalGlassControlSurface radius={radius} tone={tone} />
      <Ionicons color={iconColor} name={iconName} size={iconSize} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassHost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  icon: {
    zIndex: 1,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
