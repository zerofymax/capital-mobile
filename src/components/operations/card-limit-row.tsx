import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CardLimitRowProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function CardLimitRow({ label, value, onChangeText }: CardLimitRowProps) {
  return (
    <SolidCard style={styles.root}>
      <AppText variant="cardTitle">{label}</AppText>
      <View style={styles.inputRow}>
        <TextInput
          keyboardType="number-pad"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          value={value}
        />
        <AppText style={styles.currency} variant="body">
          رس
        </AppText>
      </View>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    lineHeight: 30,
    minWidth: 0,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  currency: {
    color: colors.brand.link,
  },
});
