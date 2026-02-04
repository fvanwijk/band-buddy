import { useGetLocale } from '../api/useSettings';

/**
 * Hook to pluralize a word based on count using Intl.PluralRules
 * @returns A function that pluralizes a word and prefixes it with count
 */
export function usePluralize() {
  const locale = useGetLocale();

  return (count: number, singular: string, plural?: string): string => {
    const rules = new Intl.PluralRules(locale);
    const rule = rules.select(count);

    const word = rule === 'one' ? singular : plural || `${singular}s`;
    return `${count} ${word}`;
  };
}
