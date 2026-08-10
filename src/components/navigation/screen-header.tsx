import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { CapitalGlassIconButton } from './capital-glass-icon-button';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, showBack = false, rightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.root}>
      {showBack ? (
        <CapitalGlassIconButton
          accessibilityLabel="رجوع"
          hitSlop={8}
          iconColor={colors.text.muted}
          iconName="chevron-back"
          iconSize={18}
          onPress={() => router.back()}
          pressedStyle={styles.pressed}
          radius={radii.control}
          style={styles.iconButton}
        />
      ) : (
        <View style={styles.iconSlot} />
      )}
      <View style={styles.titleWrap}>
        <AppText numberOfLines={1} style={styles.title} variant="screenTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText numberOfLines={1} style={styles.subtitle} tone="secondary" variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.iconSlot}>{rightAction}</View>
    </View>
  );
}

export function DeepScreenHeader(props: ScreenHeaderProps) {
  return <ScreenHeader {...props} showBack />;
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 40,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.glass.overlay,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconSlot: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  titleWrap: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  title: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  subtitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});
