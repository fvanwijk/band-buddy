import { useDelRowCallback, useRow, useSetRowCallback, useTable } from 'tinybase/ui-react';

import type { Setlist } from '../types';

/**
 * Get all setlists from the store
 */
export function useGetSetlists(): Setlist[] {
  const setlistsData = useTable('setlists') || {};

  return Object.entries(setlistsData)
    .map(([id, data]) => {
      try {
        const dataStr = data?.data as string | undefined;
        const parsed = dataStr ? JSON.parse(dataStr) : null;
        if (parsed) {
          return {
            ...parsed,
            id,
          };
        }
        return {
          date: new Date().toISOString().split('T')[0],
          id,
          sets: [],
          title: 'Unknown',
        };
      } catch {
        return {
          date: new Date().toISOString().split('T')[0],
          id,
          sets: [],
          title: 'Unknown',
        };
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single setlist by ID
 */
export function useGetSetlist(id: string | undefined): Setlist | null {
  const setlistRow = useRow('setlists', id || '');

  if (!id || !setlistRow) {
    return null;
  }

  try {
    const data = setlistRow?.data as string | undefined;
    const parsed = data ? JSON.parse(data) : null;
    if (parsed) {
      return {
        ...parsed,
        id,
      };
    }
  } catch {
    // Fall through to return null
  }

  return null;
}

/**
 * Hook to add a new setlist
 */
export function useAddSetlist(onSuccess?: () => void) {
  return useSetRowCallback(
    'setlists',
    (_data: Omit<Setlist, 'id'>) => Date.now().toString(),
    (data: Omit<Setlist, 'id'>) => ({ data: JSON.stringify(data) }),
    [onSuccess],
    undefined,
    () => {
      onSuccess?.();
    },
  );
}

/**
 * Hook to update an existing setlist
 */
export function useUpdateSetlist(id: string | undefined, onSuccess?: () => void) {
  return useSetRowCallback(
    'setlists',
    (_data: Omit<Setlist, 'id'>) => id!,
    (data: Omit<Setlist, 'id'>) => ({ data: JSON.stringify(data) }),
    [id, onSuccess],
    undefined,
    () => {
      onSuccess?.();
    },
  );
}

/**
 * Hook to delete a setlist
 */
export function useDeleteSetlist(onSuccess?: () => void) {
  return useDelRowCallback('setlists', (id: string) => {
    onSuccess?.();
    return id;
  });
}
