export const SUPPORTED_LOCALES = [
  { locale: 'nl-NL', name: '🇳🇱 Nederlands' },
  { locale: 'en-US', name: '🇺🇸 English' },
  { locale: 'en-GB', name: '🇬🇧 English' },
  { locale: 'de-DE', name: '🇩🇪 Deutsch' },
  { locale: 'fr-FR', name: '🇫🇷 Français' },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]['locale'];

/**
 * Detect the user's locale from browser settings
 * Falls back to 'en-US' if detection fails or unsupported
 */
export function detectLocale(): SupportedLocale {
  const browserLocale = navigator.language;
  const locales = SUPPORTED_LOCALES.map((l) => l.locale);
  if (locales.includes(browserLocale as SupportedLocale)) {
    return browserLocale as SupportedLocale;
  }
  // Try matching language code
  const langCode = browserLocale.split('-')[0];
  const matched = locales.find((locale) => locale.startsWith(langCode));
  return (matched || 'en-US') as SupportedLocale;
}
