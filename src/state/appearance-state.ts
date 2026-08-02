import { useSyncExternalStore } from 'react';

import { darkColors, type CapitalColorScheme, type CapitalColors } from '@/theme/colors';

export type AppearancePreference = 'system' | 'dark';

export type AppearanceSettings = {
  preference: AppearancePreference;
  isHydrated: boolean;
};

const listeners = new Set<() => void>();

let snapshot: AppearanceSettings = {
  preference: 'dark',
  isHydrated: true,
};

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function getAppearanceSnapshot() {
  return snapshot;
}

export function hydrateAppearancePreference() {
  if ((snapshot.preference as string) === 'light') {
    snapshot = {
      ...snapshot,
      preference: 'dark',
      isHydrated: true,
    };
    emit();
    return;
  }

  if (snapshot.isHydrated) {
    return;
  }

  snapshot = { ...snapshot, isHydrated: true };
  emit();
}

export function setAppearancePreference(preference: AppearancePreference) {
  snapshot = {
    ...snapshot,
    preference,
    isHydrated: true,
  };
  emit();
}

export function resolveAppearanceScheme(
  preference: AppearancePreference,
  _deviceScheme?: CapitalColorScheme | null,
): CapitalColorScheme {
  if (preference === 'system') {
    return 'dark';
  }

  return preference;
}

export function getColorsForScheme(scheme: CapitalColorScheme): CapitalColors {
  return darkColors;
}

export function useAppearanceSettings() {
  return useSyncExternalStore(subscribe, getAppearanceSnapshot, getAppearanceSnapshot);
}

export function useResolvedAppearance() {
  const settings = useAppearanceSettings();
  const resolvedScheme = resolveAppearanceScheme(settings.preference);

  return {
    ...settings,
    colors: getColorsForScheme(resolvedScheme),
    resolvedScheme,
  };
}

export function useThemeColors() {
  return useResolvedAppearance().colors;
}
