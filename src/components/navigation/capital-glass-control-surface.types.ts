import type { StyleProp, ViewStyle } from 'react-native';

export type CapitalGlassControlTone = 'neutral' | 'accent';

export type CapitalGlassControlSurfaceProps = {
  effect?: 'clear' | 'regular';
  radius: number;
  style?: StyleProp<ViewStyle>;
  tone?: CapitalGlassControlTone;
};
