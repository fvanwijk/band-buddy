import { store } from '../store/store';
import { detectLocale, type SupportedLocale } from './locales';

const SETTINGS_TABLE = 'settings';

/**
 * Get the stored locale or detect it if not stored
 */
export function getStoredLocale(): SupportedLocale {
  const locale = store.getCell(SETTINGS_TABLE, 'app', 'locale') as SupportedLocale | undefined;
  return locale || detectLocale();
}

/**
 * Set the locale in the store
 */
export function setStoredLocale(locale: SupportedLocale): void {
  store.setCell(SETTINGS_TABLE, 'app', 'locale', locale);
}
