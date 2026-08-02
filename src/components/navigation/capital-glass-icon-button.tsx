import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import type { CapitalGlassIconButtonProps } from './capital-glass-icon-button.types';

export function CapitalGlassIconButton({
  accessibilityLabel,
  disabled,
  hitSlop,
  iconColor,
  iconName,
  iconSize,
  onPress,
  pressedStyle,
  style,
}: CapitalGlassIconButtonProps) {
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
        pressed && !disabled && pressedStyle,
      ]}
    >
      <Ionicons color={iconColor} name={iconName} size={iconSize} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
