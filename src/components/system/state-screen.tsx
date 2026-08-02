import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type StateTone = 'success' | 'warning' | 'danger' | 'muted';

type StateScreenProps = {
  title: string;
  description?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  tone?: StateTone;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  children?: ReactNode;
};

const toneConfig: Record<StateTone, { color: string; tint: string; border: string }> = {
  success: {
    color: colors.semantic.success,
    tint: colors.semantic.successTint,
    border: 'rgba(79,138,91,0.30)',
  },
  warning: {
    color: colors.semantic.warning,
    tint: colors.semantic.warningTint,
    border: 'rgba(232,163,61,0.30)',
  },
  danger: {
    color: colors.semantic.danger,
    tint: colors.semantic.dangerTint,
    border: 'rgba(229,103,90,0.30)',
  },
  muted: {
    color: colors.text.tertiary,
    tint: colors.surface.muted,
    border: colors.surface.border,
  },
};

export function StateScreen({
  title,
  description,
  iconName,
  tone = 'success',
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  children,
}: StateScreenProps) {
  const insets = useSafeAreaInsets();
  const config = toneConfig[tone];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.screenBottom),
          paddingTop: Math.max(insets.top, spacing.safeTop),
        },
      ]}
      style={styles.root}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.iconWrap, { backgroundColor: config.tint, borderColor: config.border }]}>
        <Ionicons color={config.color} name={iconName} size={34} />
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
      {children ? <View style={styles.children}>{children}</View> : null}
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
    </ScrollView>
  );
}

export function StateInfoCard({
  title,
  description,
  tone = 'success',
}: {
  title: string;
  description: string;
  tone?: StateTone;
}) {
  const config = toneConfig[tone];

  return (
    <SolidCard style={[styles.infoCard, { backgroundColor: config.tint, borderColor: config.border }]}>
      <AppText variant="cardTitle">{title}</AppText>
      <AppText style={styles.description} tone="secondary" variant="supporting">
        {description}
      </AppText>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    gap: spacing.xl,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  copy: {
    gap: spacing.sm,
    maxWidth: 350,
  },
  description: {
    lineHeight: 25,
  },
  children: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  infoCard: {
    gap: spacing.sm,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
