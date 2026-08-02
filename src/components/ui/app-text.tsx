import type { PropsWithChildren } from 'react';
import { Text, type TextProps } from 'react-native';

import { useThemeColors } from '@/state/appearance-state';
import { areCapitalFontsLoaded } from '@/theme/fonts';
import { getTypographyVariant, type TypographyVariant } from '@/theme/typography';

type AppTextTone = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'danger' | 'success' | 'warning' | 'link';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: AppTextTone;
  align?: 'left' | 'center' | 'right' | 'auto';
};

export function AppText({
  children,
  variant = 'body',
  tone = 'primary',
  align = 'right',
  style,
  ...props
}: PropsWithChildren<AppTextProps>) {
  const colors = useThemeColors();
  const toneColor: Record<AppTextTone, string> = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
    muted: colors.text.muted,
    danger: colors.semantic.danger,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    link: colors.brand.link,
  };

  return (
    <Text
      {...props}
      style={[
        getTypographyVariant(variant, areCapitalFontsLoaded()),
        {
          color: toneColor[tone],
          writingDirection: 'rtl',
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
