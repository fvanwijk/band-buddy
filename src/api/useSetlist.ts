import {
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useStore,
  useTable,
} from 'tinybase/ui-react';

import { setlistMetadataSchema } from '../schemas';
import type { Setlist, SetlistSet } from '../types';

/**
 * Get all setlists from the store
 */
export function useGetSetlists(): Setlist[] {
  const setlistsData = useTable('setlists') || {};
  const setlistSetsData = useTable('setlistSets') || {};
  const setlistSongsData = useTable('setlistSongs') || {};

  return Object.entries(setlistsData)
    .map(([id, data]) => {
      const result = setlistMetadataSchema.safeParse({ ...data, id });
      if (!result.success) return null;

      // Get sets for this setlist
      const sets = Object.entries(setlistSetsData)
        .filter(([, setData]) => typeof setData === 'object' && setData.setlistId === id)
        .map(([setRowId, setData]) => {
          const setIndex = typeof setData.setIndex === 'number' ? setData.setIndex : 0;
          const songs = Object.values(setlistSongsData)
            .filter(
              (songData) =>
                typeof songData === 'object' &&
                songData.setId === setRowId &&
                typeof songData.songId === 'string',
            )
            .toSorted((a, b) => {
              const ai = typeof a.songIndex === 'number' ? a.songIndex : 0;
              const bi = typeof b.songIndex === 'number' ? b.songIndex : 0;
              return ai - bi;
            })
            .map((songData) => ({
              isDeleted: typeof songData.isDeleted === 'boolean' ? songData.isDeleted : false,
              setId: setRowId,
              songId: String(songData.songId),
              songIndex: typeof songData.songIndex === 'number' ? songData.songIndex : 0,
            }));
          return {
            id: setRowId,
            name: typeof setData.name === 'string' ? setData.name : '',
            setIndex,
            setlistId: id,
            songs,
          };
        })
        .toSorted((a, b) => a.setIndex - b.setIndex);

      const setlist = {
        date: result.data.date,
        id: result.data.id,
        sets,
        title: result.data.title,
        venue: result.data.venue,
      };

      return setlist;
    })
    .filter((setlist) => setlist !== null)
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single setlist by ID
 */
export function useGetSetlist(id?: string, includeDeleted = false): Setlist | null {
  const setlistRow = useRow('setlists', id || '');
  const setlistSetsData = useTable('setlistSets') || {};
  const setlistSongsData = useTable('setlistSongs') || {};
  const songsData = useTable('songs') || {};

  if (!id || !setlistRow) {
    return null;
  }

  const result = setlistMetadataSchema.safeParse({ ...setlistRow, id });
  if (!result.success) return null;

  // Get sets for this setlist
  const sets: SetlistSet[] = Object.entries(setlistSetsData)
    .filter(([, setData]) => typeof setData === 'object' && setData.setlistId === id)
    .map(([setRowId, setData]) => {
      const setIndex = typeof setData.setIndex === 'number' ? setData.setIndex : 0;

      const songs = Object.values(setlistSongsData)
        .filter(
          (songData) =>
            typeof songData === 'object' &&
            songData.setId === setRowId &&
            typeof songData.songId === 'string',
        )
        .filter((songData) => {
          if (includeDeleted) return true;
          if (typeof songData.songId !== 'string') return false;
          const songRow = songsData[songData.songId] as Record<string, unknown> | undefined;
          return !songRow?.isDeleted;
        })
        .toSorted((a, b) => {
          const ai = typeof a.songIndex === 'number' ? a.songIndex : 0;
          const bi = typeof b.songIndex === 'number' ? b.songIndex : 0;
          return ai - bi;
        })
        .map((songData) => {
          return typeof songData.songId === 'string'
            ? { setId: songData.setId, songId: songData.songId, songIndex: songData.songIndex }
            : null;
        })
        .filter(
          (song): song is { setId: string; songId: string; songIndex: number } => song !== null,
        );
      return {
        id: setRowId,
        name: typeof setData.name === 'string' ? setData.name : '',
        setIndex,
        setlistId: id,
        songs,
      };
    })
    .sort((a, b) => a.setIndex - b.setIndex);

  const setlist: Setlist = {
    date: result.data.date,
    id: result.data.id,
    sets,
    title: result.data.title,
  };

  if (result.data.venue) {
    setlist.venue = result.data.venue;
  }

  return setlist;
}

/**
 * Hook to add a new setlist
 */
export function useAddSetlist(onSuccess?: () => void) {
  const store = useStore();

  // Create a wrapper that handles both the setlist and setlistSongs creation
  const addSetlistWithSongs = (data: Omit<Setlist, 'id'>) => {
    if (!store) return;

    const row: Record<string, unknown> = { ...data };
    delete row.sets;
    Object.entries(row).forEach(([key, value]) => {
      if (value === undefined) {
        delete row[key];
      }
    });

    // Add the setlist row and get the generated ID
    const setlistId = store.addRow('setlists', row as Record<string, string>);
    if (!setlistId) return;

    // Store sets in setlistSets table and let Tinybase generate setIds
    data.sets.forEach((set, setIndex) => {
      const setRow = {
        name: set.name || '',
        setIndex,
        setlistId,
      };
      const setId = store.addRow('setlistSets', setRow);
      if (!setId) return;
      // Store songs referencing setId, let Tinybase generate song ids
      set.songs.forEach((songRef, songIndex) => {
        const songRow = {
          setId,
          songId: songRef.songId,
          songIndex,
        };
        store.addRow('setlistSongs', songRow);
      });
    });

    onSuccess?.();
  };

  return addSetlistWithSongs;
}

/**
 * Hook to update an existing setlist
 */
export function useUpdateSetlist(id: string | undefined, onSuccess?: () => void) {
  const store = useStore();

  return useSetRowCallback(
    'setlists',
    id!,
    (data: Omit<Setlist, 'id'>) => {
      const row: Record<string, unknown> = {
        ...data,
      };

      delete row.sets;

      Object.entries(row).forEach(([key, value]) => {
        if (value === undefined) {
          delete row[key];
        }
      });

      if (!store) return row as Record<string, string>;

      // Delete existing setlist songs and sets
      const setlistSongsData = store.getTable('setlistSongs') || {};
      Object.entries(setlistSongsData).forEach(([songRowId, songData]) => {
        const rowData = songData as { setlistId?: string };
        if (rowData.setlistId === id) {
          store.delRow('setlistSongs', songRowId);
        }
      });
      const setlistSetsData = store.getTable('setlistSets') || {};
      Object.entries(setlistSetsData).forEach(([setRowId, setData]) => {
        const rowData = setData as { setlistId?: string };
        if (rowData.setlistId === id) {
          store.delRow('setlistSets', setRowId);
        }
      });

      // Add updated sets and songs, let Tinybase generate ids
      data.sets.forEach((set, setIndex) => {
        const setRow = {
          name: set.name || '',
          setIndex,
          setlistId: id!,
        };
        const setId = store.addRow('setlistSets', setRow);
        if (!setId) return;
        set.songs.forEach((songRef, songIndex) => {
          const songRow = {
            setId,
            songId: songRef.songId,
            songIndex,
          };
          store.addRow('setlistSongs', songRow);
        });
      });

      return row as Record<string, string>;
    },
    [id, store, onSuccess],
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
  const store = useStore();

  return useDelRowCallback('setlists', (id: string) => {
    if (store) {
      // Delete associated setlist songs
      const setlistSongsData = store.getTable('setlistSongs') || {};
      Object.entries(setlistSongsData).forEach(([songRowId, songData]) => {
        const rowData = songData as { setlistId?: string };
        if (rowData.setlistId === id) {
          store.delRow('setlistSongs', songRowId);
        }
      });
    }
    onSuccess?.();
    return id;
  });
}
