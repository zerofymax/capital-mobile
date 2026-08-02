import { Platform, type TextStyle } from 'react-native';

const fallbackFontFamilies = {
  regular: Platform.select({
    web: '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif',
    android: 'sans-serif',
    default: 'System',
  })!,
  medium: Platform.select({
    web: '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif',
    android: 'sans-serif-medium',
    default: 'System',
  })!,
  semiBold: Platform.select({
    web: '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif',
    android: 'sans-serif-medium',
    default: 'System',
  })!,
  bold: Platform.select({
    web: '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif',
    android: 'sans-serif-medium',
    default: 'System',
  })!,
  fallback: Platform.select({
    web: '"Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif',
    android: 'sans-serif',
    default: 'System',
  })!,
} as const;

export const fontFamilies = {
  regular: 'IBMPlexSansArabic-Regular',
  medium: 'IBMPlexSansArabic-Medium',
  semiBold: 'IBMPlexSansArabic-SemiBold',
  bold: 'IBMPlexSansArabic-Bold',
  fallback: fallbackFontFamilies.regular,
} as const;

export type TypographyVariant =
  | 'display'
  | 'screenTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'body'
  | 'supporting'
  | 'caption'
  | 'numericValue'
  | 'buttonLabel';

function createVariants(families: typeof fontFamilies | typeof fallbackFontFamilies) {
  return {
    display: { fontSize: 34, lineHeight: 44, fontFamily: families.bold, fontWeight: '700' },
    screenTitle: { fontSize: 22, lineHeight: 30, fontFamily: families.bold, fontWeight: '700' },
    sectionTitle: { fontSize: 17, lineHeight: 24, fontFamily: families.bold, fontWeight: '700' },
    cardTitle: { fontSize: 15, lineHeight: 22, fontFamily: families.semiBold, fontWeight: '600' },
    body: { fontSize: 14, lineHeight: 23, fontFamily: families.regular, fontWeight: '400' },
    supporting: { fontSize: 12.5, lineHeight: 20, fontFamily: families.regular, fontWeight: '400' },
    caption: { fontSize: 11, lineHeight: 16, fontFamily: families.medium, fontWeight: '500' },
    numericValue: { fontSize: 28, lineHeight: 36, fontFamily: families.bold, fontWeight: '700' },
    buttonLabel: { fontSize: 15, lineHeight: 22, fontFamily: families.bold, fontWeight: '700' },
  } satisfies Record<TypographyVariant, TextStyle>;
}

export const typography = {
  fontFamily: fontFamilies,
  variants: createVariants(fontFamilies),
  fallbackVariants: createVariants(fallbackFontFamilies),
} as const;

export function getTypographyVariant(variant: TypographyVariant, useCapitalFont = true) {
  return useCapitalFont ? typography.variants[variant] : typography.fallbackVariants[variant];
}
