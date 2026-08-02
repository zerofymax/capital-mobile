import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export const expectedFontDestination = 'assets/fonts/';

export const expectedFontAssets = [
  'IBMPlexSansArabic-Regular.ttf',
  'IBMPlexSansArabic-Medium.ttf',
  'IBMPlexSansArabic-SemiBold.ttf',
  'IBMPlexSansArabic-Bold.ttf',
] as const;

const bundledFontMap: Record<string, Font.FontSource> = {
  'IBMPlexSansArabic-Regular': require('../../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
  'IBMPlexSansArabic-Medium': require('../../assets/fonts/IBMPlexSansArabic-Medium.ttf'),
  'IBMPlexSansArabic-SemiBold': require('../../assets/fonts/IBMPlexSansArabic-SemiBold.ttf'),
  'IBMPlexSansArabic-Bold': require('../../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
};

let capitalFontsLoaded = false;

export function areCapitalFontsLoaded() {
  return capitalFontsLoaded;
}

export function useOptionalCapitalFonts() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    Font.loadAsync(bundledFontMap)
      .then(() => {
        capitalFontsLoaded = true;
      })
      .catch(() => {
        capitalFontsLoaded = false;
      })
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return ready;
}
