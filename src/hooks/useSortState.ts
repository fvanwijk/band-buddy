import { useState } from 'react';

type SortDirection = 'asc' | 'desc' | 'none';

export function useSortState<T extends string>(
  initialField: T | null,
  initialDirection: SortDirection = 'none',
) {
  const [sortBy, setSortBy] = useState<T | null>(initialField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const handleSort = (field: T) => {
    if (sortBy === field) {
      // Same field clicked: cycle through asc -> desc -> none
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('none');
        setSortBy(null);
      }
    } else {
      // Different field clicked: start with ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const isActive = (field: T) => sortBy === field && sortDirection !== 'none';

  return {
    handleSort,
    isActive,
    sortBy,
    sortDirection,
  };
}
