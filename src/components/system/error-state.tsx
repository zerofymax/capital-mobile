import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type ErrorStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  tone?: 'danger' | 'warning';
};

export function ErrorState({
  title,
  description,
  actionLabel,
  secondaryActionLabel,
  onRetry,
  onSecondaryAction,
  tone = 'danger',
}: ErrorStateProps) {
  const isDanger = tone === 'danger';

  return (
    <SolidCard style={[styles.root, isDanger ? styles.danger : styles.warning]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, isDanger ? styles.dangerIcon : styles.warningIcon]}>
          <Ionicons color={isDanger ? colors.semantic.danger : colors.semantic.warning} name={isDanger ? 'alert-circle-outline' : 'warning-outline'} size={21} />
        </View>
        <View style={styles.copy}>
          <AppText variant="cardTitle">{title}</AppText>
          {description ? (
            <AppText style={styles.description} tone="secondary" variant="supporting">
              {description}
            </AppText>
          ) : null}
        </View>
      </View>
      {actionLabel || secondaryActionLabel ? (
        <View style={styles.actions}>
          {actionLabel ? (
            <AppButton onPress={onRetry} variant={isDanger ? 'danger' : 'primary'}>
              {actionLabel}
            </AppButton>
          ) : null}
          {secondaryActionLabel ? (
            <AppButton onPress={onSecondaryAction} variant="secondary">
              {secondaryActionLabel}
            </AppButton>
          ) : null}
        </View>
      ) : null}
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  danger: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.24)',
  },
  warning: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  dangerIcon: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
  },
  warningIcon: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});
