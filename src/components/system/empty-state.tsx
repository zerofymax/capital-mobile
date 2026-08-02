import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <SolidCard style={styles.root}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.iconWrap}>
        {icon}
      </View>
      <View style={styles.copy}>
        <AppText align="center" variant="cardTitle">
          {title}
        </AppText>
        {description ? (
          <AppText align="center" tone="secondary" variant="supporting">
            {description}
          </AppText>
        ) : null}
      </View>
      {actionLabel ? (
        <AppButton onPress={onAction} variant="secondary">
          {actionLabel}
        </AppButton>
      ) : null}
    </SolidCard>
  );
}

export function EmptyStateIcon({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return <Ionicons color={colors.text.tertiary} name={name} size={26} />;
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  copy: {
    gap: spacing.xs,
  },
});
