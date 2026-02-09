/**
 * Hook to sort an array by a field and direction
 * Returns the sorted array without mutating the original
 */
export function useSortedArray<T extends Record<string, unknown>, K extends keyof T = keyof T>(
  items: T[],
  sortBy: K | null,
  sortDirection: 'asc' | 'desc' | 'none',
  compareValue?: (item: T, field: K) => string | number,
): T[] {
  if (!sortBy || sortDirection === 'none') {
    return items;
  }

  return items.toSorted((a, b) => {
    const valueA = compareValue ? compareValue(a, sortBy) : (a[sortBy] as string | number);
    const valueB = compareValue ? compareValue(b, sortBy) : (b[sortBy] as string | number);

    let comparison = 0;

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    } else if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}
