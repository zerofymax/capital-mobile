import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type TransferAmountCardProps = {
  value: string;
  helperText: string;
  error?: string;
  onChangeText: (value: string) => void;
};

export function TransferAmountCard({ value, helperText, error, onChangeText }: TransferAmountCardProps) {
  return (
    <GlassSurface>
      <View style={styles.root}>
        <AppText tone="secondary" variant="supporting">
          مبلغ التحويل
        </AppText>
        <View style={styles.amountRow}>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={onChangeText}
            placeholder="0.00"
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
            value={value}
          />
          <AppText style={styles.currency} variant="sectionTitle">
            رس
          </AppText>
        </View>
        <AppText align="left" style={styles.helper} tone="secondary" variant="caption">
          {helperText}
        </AppText>
        {error ? (
          <AppText tone="danger" variant="caption">
            {error}
          </AppText>
        ) : null}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  amountRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    width: '100%',
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 40,
    fontVariant: ['tabular-nums'],
    lineHeight: 48,
    minHeight: 58,
    minWidth: 0,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  currency: {
    color: colors.brand.link,
    paddingBottom: spacing.sm,
  },
  helper: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
