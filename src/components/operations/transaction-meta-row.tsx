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
        <AppText style={styles.label} tone="secondary" variant="supporting">
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
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  value: {
    flex: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  ltrValue: {
    flex: 1,
    fontVariant: ['tabular-nums'],
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});
