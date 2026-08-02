import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type SuccessStateProps = {
  title: string;
  description?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  icon?: ReactNode;
  fullScreen?: boolean;
};

export function SuccessState({
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  icon,
  fullScreen = false,
}: SuccessStateProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        fullScreen && [
          styles.fullScreen,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ],
      ]}
    >
      <View style={styles.iconWrap}>
        {icon ?? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={32} />}
      </View>
      <View style={styles.copy}>
        <AppText align="center" variant="screenTitle">
          {title}
        </AppText>
        {description ? (
          <AppText align="center" style={styles.description} tone="secondary" variant="body">
            {description}
          </AppText>
        ) : null}
      </View>
      {primaryActionLabel || secondaryActionLabel ? (
        <View style={styles.actions}>
          {primaryActionLabel ? <AppButton onPress={onPrimaryAction}>{primaryActionLabel}</AppButton> : null}
          {secondaryActionLabel ? (
            <AppButton onPress={onSecondaryAction} variant="secondary">
              {secondaryActionLabel}
            </AppButton>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.xl,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    backgroundColor: colors.background.base,
    flex: 1,
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  copy: {
    gap: spacing.sm,
    maxWidth: 340,
  },
  description: {
    lineHeight: 25,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
