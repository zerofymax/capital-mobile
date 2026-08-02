import { StyleSheet, View } from 'react-native';

import { radii } from '@/theme/radii';
import { CapitalGlassControlSurface } from './capital-glass-control-surface';

export function CapitalBottomSheetHeaderSurface() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <CapitalGlassControlSurface
        effect="regular"
        radius={radii.sheet}
        style={styles.surface}
        tone="neutral"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 84,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  surface: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});
