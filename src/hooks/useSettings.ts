import { useCell, useSetCellCallback, useSetValueCallback } from 'tinybase/ui-react';

import type { SupportedLocale } from '../config/locales';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';

const SETTINGS_TABLE = 'settings';
const SETTINGS_ROW = 'app';

/**
 * Hook to get the current locale
 */
export function useGetLocale(): SupportedLocale {
  const locale = useCell(SETTINGS_TABLE, SETTINGS_ROW, 'locale') as SupportedLocale | undefined;
  return locale || detectLocale();
}

/**
 * Hook to set the locale
 */
export function useSetLocale() {
  return useSetCellCallback(
    SETTINGS_TABLE,
    SETTINGS_ROW,
    'locale',
    (locale: SupportedLocale) => locale,
    [],
  );
}

/**
 * Hook to get the current theme
 */
export function useGetTheme(): ThemeName {
  const theme = useCell(SETTINGS_TABLE, SETTINGS_ROW, 'theme') as ThemeName | undefined;
  return theme || DEFAULT_THEME;
}

/**
 * Hook to set the theme
 */
export function useSetTheme() {
  return useSetCellCallback(
    SETTINGS_TABLE,
    SETTINGS_ROW,
    'theme',
    (theme: ThemeName) => {
      applyTheme(theme);
      return theme;
    },
    [],
  );
}

/**
 * Hook to activate a setlist
 */
export function useActivateSetlist(onSuccess?: () => void) {
  return useSetValueCallback(
    'activeSetlistId',
    (id: string) => {
      onSuccess?.();
      return id;
    },
    [onSuccess],
  );
}
