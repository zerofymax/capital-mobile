export type CapitalColors = {
  background: {
    base: string;
    elevated: string;
    heroStart: string;
    overlay: string;
  };
  surface: {
    card: string;
    muted: string;
    raised: string;
    separator: string;
    border: string;
    inputBorder: string;
    disabled: string;
  };
  glass: {
    fill: string;
    fillDeep: string;
    border: string;
    shine: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
    disabled: string;
  };
  brand: {
    deepGreen: string;
    green: string;
    mediumGreen: string;
    calmGreen: string;
    lightNeutral: string;
    ctaStart: string;
    ctaEnd: string;
    link: string;
  };
  semantic: {
    success: string;
    successTint: string;
    danger: string;
    dangerTint: string;
    warning: string;
    warningTint: string;
  };
};

export const darkColors: CapitalColors = {
  background: {
    base: '#050608',
    elevated: '#0A0C10',
    heroStart: '#000000',
    overlay: 'rgba(0,0,0,0.62)',
  },
  surface: {
    card: '#111419',
    muted: '#151C19',
    raised: '#121A17',
    separator: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.10)',
    disabled: 'rgba(255,255,255,0.05)',
  },
  glass: {
    fill: 'rgba(38,46,62,0.52)',
    fillDeep: 'rgba(10, 13, 18, 0.61)',
    border: 'rgba(255, 255, 255, 0.24)',
    shine: 'rgba(255, 255, 255, 0.17)',
    overlay: 'rgba(255,255,255,0.07)',
  },
  text: {
    primary: '#F6F8F7',
    secondary: '#9AA3AF',
    tertiary: '#7C8797',
    muted: '#D6DAE1',
    inverse: '#050608',
    disabled: 'rgba(214,218,225,0.55)',
  },
  brand: {
    deepGreen: '#0B2E26',
    green: '#1F5A3A',
    mediumGreen: '#4F8A5B',
    calmGreen: '#A7C8A1',
    lightNeutral: '#F6F8F7',
    ctaStart: '#1F5A3A',
    ctaEnd: '#0B2E26',
    link: '#A7C8A1',
  },
  semantic: {
    success: '#4F8A5B',
    successTint: 'rgba(79,138,91,0.14)',
    danger: '#E5675A',
    dangerTint: 'rgba(229,103,90,0.14)',
    warning: '#E8A33D',
    warningTint: 'rgba(232,163,61,0.14)',
  },
} as const;

export type CapitalColorScheme = 'light' | 'dark';

export const colors = darkColors;
