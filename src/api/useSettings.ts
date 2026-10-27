import { useCallback } from 'react';
import { useSetValueCallback, useStore, useValue } from 'tinybase/ui-react';

import type { SupportedLocale } from '../config/locales';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';
import type { SpeechLanguage } from '../hooks/speechVoices';
import {
  hasSeenWelcomeSchema,
  hideEmptyTabsSchema,
  localeSchema,
  metronomeVolumeSchema,
  preCountVolumeSchema,
  showMidiEventLogPanelSchema,
  showDrawingToolsSchema,
  themeSchema,
  ttsVoiceSchema,
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
 * Hook to get the spoken pre count volume (0-100, 0 disables the pre count)
 */
export function useGetPreCountVolume(): number {
  const volume = useValue('preCountVolume');
  const result = preCountVolumeSchema.safeParse(volume);
  return result.success ? result.data : 0;
}

/**
 * Hook to set the spoken pre count volume
 */
export function useSetPreCountVolume() {
  return useSetValueCallback('preCountVolume', (volume: number) => volume, []);
}

const ttsVoiceKeys = { en: 'ttsVoiceEn', nl: 'ttsVoiceNl' } as const;

/**
 * Hook to get the URI of the text-to-speech voice selected for a language
 */
export function useGetTtsVoice(language: SpeechLanguage): string | undefined {
  const voice = useValue(ttsVoiceKeys[language]);
  const result = ttsVoiceSchema.safeParse(voice);
  return result.success ? result.data : undefined;
}

/**
 * Hook to set the text-to-speech voice for a language, an empty value clears the selection
 */
export function useSetTtsVoice(language: SpeechLanguage) {
  const store = useStore();
  return useCallback(
    (voiceURI: string) => {
      if (voiceURI) {
        store?.setValue(ttsVoiceKeys[language], voiceURI);
      } else {
        store?.delValue(ttsVoiceKeys[language]);
      }
    },
    [language, store],
  );
}

/**
 * Hook to get whether empty song detail tabs are hidden
 */
export function useGetHideEmptyTabs(): boolean {
  const hide = useValue('hideEmptyTabs');
  const result = hideEmptyTabsSchema.safeParse(hide);
  return result.success ? result.data : false;
}

/**
 * Hook to set whether empty song detail tabs are hidden
 */
export function useSetHideEmptyTabs() {
  return useSetValueCallback('hideEmptyTabs', (hide: boolean) => hide, []);
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
