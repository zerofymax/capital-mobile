import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { BusinessCardStatus } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type CardStatusBadgeProps = {
  status: BusinessCardStatus;
  label: string;
};

export function CardStatusBadge({ status, label }: CardStatusBadgeProps) {
  const active = status === 'active';

  return (
    <View style={[styles.root, active ? styles.active : styles.frozen]}>
      <AppText align="center" tone={active ? 'success' : 'warning'} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: spacing.md,
  },
  active: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  frozen: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.30)',
  },
});
