import { StyleSheet, View } from 'react-native';

import { AppText, Divider, SolidCard } from '@/components/ui';
import { spacing } from '@/theme/spacing';

export type BillSummaryRow = {
  label: string;
  value: string;
  ltr?: boolean;
};

type BillSummaryCardProps = {
  rows: BillSummaryRow[];
};

export function BillSummaryCard({ rows }: BillSummaryCardProps) {
  return (
    <SolidCard style={styles.root}>
      {rows.map((row, index) => (
        <View key={row.label} style={styles.rowBlock}>
          <View style={styles.row}>
            <AppText style={styles.label} tone="secondary" variant="supporting">
              {row.label}
            </AppText>
            <AppText align={row.ltr ? 'left' : 'right'} style={row.ltr ? styles.ltrValue : styles.value} variant="body">
              {row.value}
            </AppText>
          </View>
          {index < rows.length - 1 ? <Divider /> : null}
        </View>
      ))}
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  rowBlock: {
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
