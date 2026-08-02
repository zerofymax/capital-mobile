import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type StatusBadgeTone = 'success' | 'warning' | 'danger';

type StatusBadgeProps = {
  label: string;
  tone: StatusBadgeTone;
};

const toneStyles = {
  success: { backgroundColor: colors.semantic.successTint, color: colors.semantic.success },
  warning: { backgroundColor: colors.semantic.warningTint, color: colors.semantic.warning },
  danger: { backgroundColor: colors.semantic.dangerTint, color: colors.semantic.danger },
} as const;

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.root, { backgroundColor: toneStyle.backgroundColor }]}>
      <AppText style={{ color: toneStyle.color }} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
