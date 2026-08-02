import { StyleSheet } from 'react-native';

import { NumericText } from '@/components/financial/numeric-text';
import { colors } from '@/theme/colors';

type FinancialAmountProps = {
  value: number;
  hidden?: boolean;
  signed?: boolean;
  tone?: 'primary' | 'success' | 'danger';
  size?: 'hero' | 'metric' | 'row';
  currencySymbol?: string;
};

const toneColor = {
  primary: colors.text.primary,
  success: colors.semantic.success,
  danger: colors.semantic.danger,
} as const;

export function FinancialAmount({
  value,
  hidden = false,
  signed = false,
  tone = 'primary',
  size = 'metric',
  currencySymbol = 'ر.س',
}: FinancialAmountProps) {
  const formatted = hidden ? `••••••• ${currencySymbol}` : formatFinancialAmount(value, signed, currencySymbol);

  return (
    <NumericText
      accessibilityLabel={hidden ? 'القيمة مخفية' : formatted}
      style={[styles.base, styles[size], { color: toneColor[tone] }]}
    >
      {formatted}
    </NumericText>
  );
}

export function formatFinancialAmount(value: number, signed = false, currencySymbol = 'ر.س') {
  const safeValue = Number.isFinite(value) ? value : 0;
  const absValue = Math.abs(safeValue);
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  const sign = signed ? (safeValue > 0 ? '+' : safeValue < 0 ? '-' : '') : '';

  return `${sign}${formatter.format(absValue)} ${currencySymbol}`;
}

const styles = StyleSheet.create({
  base: {
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  hero: {
    fontSize: 42,
    letterSpacing: -0.5,
    lineHeight: 52,
  },
  metric: {
    fontSize: 16,
    lineHeight: 22,
  },
  row: {
    fontSize: 14.5,
    lineHeight: 22,
  },
});
