import { StyleSheet, View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import { spacing } from '@/theme/spacing';

type TransactionMetaRowProps = {
  label: string;
  value: string;
  ltr?: boolean;
  isLast?: boolean;
};

export function TransactionMetaRow({ label, value, ltr = false, isLast = false }: TransactionMetaRowProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText tone="secondary" variant="supporting">
          {label}
        </AppText>
        <AppText align={ltr ? 'left' : 'right'} style={ltr ? styles.ltrValue : styles.value} variant="body">
          {value}
        </AppText>
      </View>
      {!isLast ? <Divider /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  value: {
    flex: 1,
  },
  ltrValue: {
    flex: 1,
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
