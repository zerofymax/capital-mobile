import { type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

export function CapitalTabBarContainer({
  children,
  ...props
}: PropsWithChildren<ViewProps>) {
  return <View {...props}>{children}</View>;
}

export {
  CapitalTabBarFallbackSurface as CapitalTabBarSurface,
} from './capital-tab-bar-fallback-surface';
