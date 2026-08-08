import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { directionSafeText } from '@/utils/rtl';

type SupportModalHeaderProps = {
  title: string;
  onClose?: () => void;
  accessibilityLabel?: string;
  iconName?: 'close-outline' | 'chevron-back-outline';
};

export function SupportModalHeader({
  title,
  onClose,
  accessibilityLabel = 'إغلاق',
  iconName = 'close-outline',
}: SupportModalHeaderProps) {
  return (
    <View style={styles.root}>
      <AppText align="right" numberOfLines={1} style={styles.title} variant="screenTitle">
        {directionSafeText(title)}
      </AppText>
      <CapitalGlassIconButton
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName={iconName}
        iconSize={22}
        onPress={onClose ?? router.back}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.closeButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: 12,
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
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
