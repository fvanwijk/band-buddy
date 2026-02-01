import { useTable } from 'tinybase/ui-react';

import type { Setlist, Song } from '../types';

export function useSetlists(): Setlist[] {
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

export function useSongs(): Song[] {
  const songsData = useTable('songs') || {};

  return Object.entries(songsData)
    .map(
      ([id, data]) =>
        ({
          ...data,
          id,
        }) as Song,
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}
