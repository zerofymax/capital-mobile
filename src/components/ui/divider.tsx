import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/state/appearance-state';

export function Divider() {
  const colors = useThemeColors();

  return <View style={[styles.divider, { backgroundColor: colors.surface.separator }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
