/**
 * Hook to pluralize a word based on count using Intl.PluralRules
 * @returns A function that pluralizes a word and prefixes it with count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const rules = new Intl.PluralRules('en-US');
  const rule = rules.select(count);

  const word = rule === 'one' ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}
