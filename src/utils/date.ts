import type { Store } from 'tinybase';

import { getStoredLocale } from '../config/settings';

export function formatDate(date: string | Date, locale?: string, store?: Store): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const finalLocale = locale || (store ? getStoredLocale(store) : 'en-US');

  return new Intl.DateTimeFormat(finalLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}
