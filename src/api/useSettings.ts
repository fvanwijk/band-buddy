import { useSetValueCallback, useValue } from 'tinybase/ui-react';

import type { SupportedLocale } from '../config/locales';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';
import { hasSeenWelcomeSchema, localeSchema, themeSchema } from '../schemas';

/**
 * Hook to get the current locale
 */
export function useGetLocale(): SupportedLocale {
  const locale = useValue('locale');
  const result = localeSchema.safeParse(locale);
  return result.success ? (result.data as SupportedLocale) : detectLocale();
}

/**
 * Hook to set the locale
 */
export function useSetLocale() {
  return useSetValueCallback('locale', (locale: SupportedLocale) => locale, []);
}

/**
 * Hook to get the current theme
 */
export function useGetTheme(): ThemeName {
  const theme = useValue('theme');
  const result = themeSchema.safeParse(theme);
  return result.success ? (result.data as ThemeName) : DEFAULT_THEME;
}

/**
 * Hook to set the theme
 */
export function useSetTheme() {
  return useSetValueCallback(
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

/**
 * Hook to get whether the user has seen the welcome modal
 */
export function useHasSeenWelcome(): boolean {
  const hasSeenWelcome = useValue('hasSeenWelcome');
  const result = hasSeenWelcomeSchema.safeParse(hasSeenWelcome);
  return result.success ? result.data : false;
}

/**
 * Hook to set whether the user has seen the welcome modal
 */
export function useSetHasSeenWelcome() {
  return useSetValueCallback('hasSeenWelcome', (value: boolean) => value, []);
}
