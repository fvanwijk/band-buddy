import type { Store } from 'tinybase';

import type { SupportedLocale } from './locales';
import { detectLocale } from './locales';

const SETTINGS_TABLE = 'settings';
const SETTINGS_ROW = 'app';

/**
 * Get the stored locale or detect it if not stored
 */
export function getStoredLocale(store: Store): SupportedLocale {
  const locale = store.getCell(SETTINGS_TABLE, SETTINGS_ROW, 'locale') as
    | SupportedLocale
    | undefined;
  return locale || detectLocale();
}

/**
 * Set the locale in the store
 */
export function setStoredLocale(store: Store, locale: SupportedLocale): void {
  store.setCell(SETTINGS_TABLE, SETTINGS_ROW, 'locale', locale);
}
