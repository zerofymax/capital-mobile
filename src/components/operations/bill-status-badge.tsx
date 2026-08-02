import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { BillStatus } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BillStatusBadgeProps = {
  status: BillStatus;
  label: string;
};

const statusStyles: Record<BillStatus, { backgroundColor: string; borderColor: string; tone: 'success' | 'warning' | 'danger' }> = {
  due: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(245,158,11,0.28)',
    tone: 'warning',
  },
  paid: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    tone: 'success',
  },
  overdue: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(255,84,84,0.30)',
    tone: 'danger',
  },
};

export function BillStatusBadge({ status, label }: BillStatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <View style={[styles.root, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      <AppText align="center" tone={style.tone} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
