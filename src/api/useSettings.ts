import { useSetValueCallback, useValue } from 'tinybase/ui-react';

import type { SupportedLocale } from '../config/locales';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';
import {
  hasSeenWelcomeSchema,
  localeSchema,
  metronomeVolumeSchema,
  preCountEnabledSchema,
  showMidiEventLogPanelSchema,
  showDrawingToolsSchema,
  themeSchema,
} from '../schemas';

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
 * Hook to get the active setlist ID
 */
export function useGetActiveSetlist(): string | undefined {
  const activeSetlistId = useValue('activeSetlistId');
  return typeof activeSetlistId === 'string' ? activeSetlistId : undefined;
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

/**
 * Hook to get the metronome volume (0-100)
 */
export function useGetMetronomeVolume(): number {
  const volume = useValue('metronomeVolume');
  const result = metronomeVolumeSchema.safeParse(volume);
  return result.success ? result.data : 50;
}

/**
 * Hook to set the metronome volume
 */
export function useSetMetronomeVolume() {
  return useSetValueCallback('metronomeVolume', (volume: number) => volume, []);
}

/**
 * Hook to get whether the spoken pre count is enabled
 */
export function useGetPreCountEnabled(): boolean {
  const enabled = useValue('preCountEnabled');
  const result = preCountEnabledSchema.safeParse(enabled);
  return result.success ? result.data : false;
}

/**
 * Hook to set whether the spoken pre count is enabled
 */
export function useSetPreCountEnabled() {
  return useSetValueCallback('preCountEnabled', (enabled: boolean) => enabled, []);
}

/**
 * Hook to get whether drawing tools are shown
 */
export function useGetShowDrawingTools(): boolean {
  const show = useValue('showDrawingTools');
  const result = showDrawingToolsSchema.safeParse(show);
  return result.success ? result.data : true;
}

/**
 * Hook to set whether drawing tools are shown
 */
export function useSetShowDrawingTools() {
  return useSetValueCallback('showDrawingTools', (show: boolean) => show, []);
}

/**
 * Hook to get whether MIDI event log panel is open
 */
export function useGetShowMidiEventLogPanel(): boolean {
  const show = useValue('showMidiEventLogPanel');
  const result = showMidiEventLogPanelSchema.safeParse(show);
  return result.success ? result.data : false;
}

/**
 * Hook to set whether MIDI event log panel is open
 */
export function useSetShowMidiEventLogPanel() {
  return useSetValueCallback('showMidiEventLogPanel', (show: boolean) => show, []);
}
