import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { AppText } from '@/components/ui';
import type { CapitalTabConfig } from '@/components/navigation/tab-config';
import { colors } from '@/theme/colors';
import { navigationMetrics } from './navigation-metrics';

type CapitalTabIconProps = {
  tab: CapitalTabConfig;
  active?: boolean;
  showLabel?: boolean;
  activeColor?: string;
  labelStyle?: StyleProp<TextStyle>;
};

function CapitalTabIconComponent({
  tab,
  active = false,
  showLabel = false,
  activeColor,
  labelStyle,
}: CapitalTabIconProps) {
  const iconColor = active ? (activeColor ?? colors.text.primary) : colors.text.tertiary;

  return (
    <View style={[styles.root, showLabel && styles.activeRoot]}>
      <Ionicons color={iconColor} name={tab.icon} size={navigationMetrics.iconSize} />
      {showLabel ? (
        <AppText
          align="center"
          numberOfLines={1}
          style={[styles.label, activeColor ? { color: activeColor } : undefined, labelStyle]}
          variant="caption"
        >
          {tab.label}
        </AppText>
      ) : null}
    </View>
  );
}

export const CapitalTabIcon = memo(CapitalTabIconComponent);

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 3,
    justifyContent: 'center',
    minHeight: navigationMetrics.minTapTarget,
    minWidth: navigationMetrics.minTapTarget,
  },
  activeRoot: {
    gap: 2,
    height: navigationMetrics.bubbleHeight - 14,
  },
  label: {
    color: colors.text.primary,
    fontSize: navigationMetrics.labelFontSize,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 13,
    maxWidth: navigationMetrics.bubbleWidth - 14,
  },
});
