import { getStoredLocale } from '../config/settings';

export function formatDate(date: string | Date, locale?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const finalLocale = locale || getStoredLocale();

  return new Intl.DateTimeFormat(finalLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}
