import type { PropsWithChildren } from 'react';
import { I18nManager, StyleSheet, Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

const ltrIsolateStart = '\u2066';
const directionalIsolateEnd = '\u2069';
const mixedLtrTokenPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[+-]?\d[\d,]*(?:\.\d+)?%?|[A-Za-z][A-Za-z0-9._%+-]*/g;

export function configureRtl() {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (typeof I18nManager.swapLeftAndRightInRTL === 'function') {
    I18nManager.swapLeftAndRightInRTL(false);
  }
}

export function LtrText({ children, style, ...props }: PropsWithChildren<TextProps>) {
  return (
    <Text {...props} style={[styles.ltrText, style]}>
      {children}
    </Text>
  );
}

export function NumericText({ children, style, ...props }: PropsWithChildren<TextProps>) {
  return (
    <LtrText {...props} style={[styles.numericText, style]}>
      {children}
    </LtrText>
  );
}

export function isolateLtr(value: string | number) {
  return `${ltrIsolateStart}${value}${directionalIsolateEnd}`;
}

export function directionSafeText(value: string) {
  return value.replace(mixedLtrTokenPattern, (token) => isolateLtr(token));
}

export function CurrencyText({
  value,
  currency = 'ر.س',
  style,
  ...props
}: TextProps & { value: number; currency?: string }) {
  return (
    <NumericText {...props} style={style}>
      {formatCurrency(value, currency)}
    </NumericText>
  );
}

export function formatCurrency(value: number, currency = 'ر.س') {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  });

  return `${formatter.format(value)} ${currency}`;
}

const styles = StyleSheet.create({
  ltrText: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  numericText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
  },
});
