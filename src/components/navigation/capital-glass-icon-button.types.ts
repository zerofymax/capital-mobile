import type { ComponentProps } from 'react';
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

import type { CapitalGlassControlTone } from './capital-glass-control-surface.types';

export type CapitalGlassIconButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  hitSlop?: PressableProps['hitSlop'];
  iconColor: string;
  iconName: ComponentProps<typeof Ionicons>['name'];
  iconSize: number;
  onPress: NonNullable<PressableProps['onPress']>;
  pressedStyle?: StyleProp<ViewStyle>;
  radius: number;
  style?: StyleProp<ViewStyle>;
  tone?: CapitalGlassControlTone;
};
