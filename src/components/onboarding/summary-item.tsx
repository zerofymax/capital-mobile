import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type SummaryItemProps = {
  label: string;
};

export function SummaryItem({ label }: SummaryItemProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.brand.green} name="checkmark" size={18} />
      </View>
      <AppText style={styles.label} variant="cardTitle">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  label: {
    flex: 1,
  },
});
