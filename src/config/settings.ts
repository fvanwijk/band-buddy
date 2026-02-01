import type { Store } from 'tinybase';

import type { SupportedLocale } from './locales';
import { detectLocale } from './locales';

/**
 * Get the stored locale or detect it if not stored
 */
export function getStoredLocale(store: Store): SupportedLocale {
  const locale = store.getValue('locale') as SupportedLocale | undefined;
  return locale || detectLocale();
}

/**
 * Set the locale in the store
 */
export function setStoredLocale(store: Store, locale: SupportedLocale): void {
  store.setValue('locale', locale);
}
