import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AmountInputCardProps = {
  value: string;
  displayValue?: string;
  currencyLabel?: string;
  error?: string;
  alignLabelRight?: boolean;
  physicalLtrLayout?: boolean;
  onChangeText: (value: string) => void;
};

export function AmountInputCard({
  value,
  displayValue,
  currencyLabel = 'رس',
  error,
  alignLabelRight = false,
  physicalLtrLayout = false,
  onChangeText,
}: AmountInputCardProps) {
  return (
    <GlassSurface>
      <View style={styles.root}>
        {alignLabelRight ? (
          <View style={styles.rtlLabelWrapper}>
            <AppText style={styles.rtlLabel} tone="secondary" variant="supporting">
              مبلغ العملية
            </AppText>
          </View>
        ) : (
          <AppText tone="secondary" variant="supporting">
            مبلغ العملية
          </AppText>
        )}
        <View style={[styles.amountRow, physicalLtrLayout && styles.physicalLtrRow]}>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={onChangeText}
            placeholder="0.00"
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
            value={displayValue ?? value}
          />
          <AppText style={styles.currency} variant="sectionTitle">
            {currencyLabel}
          </AppText>
        </View>
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
  rtlLabelWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  rtlLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  amountRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    width: '100%',
  },
  physicalLtrRow: {
    direction: 'ltr',
    flexDirection: 'row',
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
});
