import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';

type SupportModalHeaderProps = {
  title: string;
  onClose?: () => void;
};

export function SupportModalHeader({ title, onClose }: SupportModalHeaderProps) {
  return (
    <View style={styles.root}>
      <CapitalGlassIconButton
        accessibilityLabel="إغلاق"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="close-outline"
        iconSize={22}
        onPress={onClose ?? router.back}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.closeButton}
      />
      <AppText align="center" numberOfLines={1} style={styles.title} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.slot} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    flex: 1,
  },
  slot: {
    height: 40,
    width: 40,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
