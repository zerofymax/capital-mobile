import { StyleSheet, View } from 'react-native';

import { AppText, Divider, SolidCard } from '@/components/ui';
import type { TransferReviewData } from '@/screens/operations/operations-data';
import { spacing } from '@/theme/spacing';

type TransferSummaryCardProps = {
  data: TransferReviewData;
};

export function TransferSummaryCard({ data }: TransferSummaryCardProps) {
  const rows = [
    { label: 'من', value: data.fromAccount },
    { label: 'إلى', value: data.beneficiaryName },
    { label: 'رقم الآيبان المختصر', value: data.ibanMask, ltr: true },
    { label: 'المبلغ', value: data.amount, ltr: true },
    { label: 'رسوم التحويل', value: data.fee, ltr: true },
    { label: 'الإجمالي', value: data.total, ltr: true },
    { label: 'سبب التحويل', value: data.purpose },
    { label: 'وقت التنفيذ', value: data.executionTime },
  ];

  return (
    <SolidCard style={styles.root}>
      {rows.map((row, index) => (
        <View key={row.label} style={styles.rowBlock}>
          <View style={styles.row}>
            <AppText tone="secondary" variant="supporting">
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
