import type { Table } from 'tinybase';
import {
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useStore,
  useTable,
} from 'tinybase/ui-react';

import {
  setlistSetTableSchema,
  setlistSongTableSchema,
  setlistTableSchema,
  songTableSchema,
} from '../schemas';
import type { SetlistSetTable, SetlistSongTable, SetlistTable, SetlistWithSets } from '../types';

// Join 4 tables into one big nested object
// Filter out data that doesn't match the schema
export function parseSetlists(
  setlistsData: Table,
  setlistSetsData: Table,
  setlistSongsData: Table,
  songsData: Table,
  includeDeletedSongs = false,
): SetlistWithSets[] {
  return Object.entries(setlistsData)
    .map(([setlistId, setlistRow]) => {
      // Validate setlist row
      const metaResult = setlistTableSchema.safeParse(setlistRow);
      if (!metaResult.success) return undefined;
      const setlist = { ...metaResult.data, id: setlistId };

      const sets = Object.entries(setlistSetsData)
        .map(([setId, setRow]) => {
          // Validate set row
          const setResult = setlistSetTableSchema.safeParse(setRow);
          return setResult.success && setResult.data.setlistId === setlistId
            ? { ...setResult.data, id: setId }
            : undefined;
        })
        .filter((set) => set !== undefined)
        .map((set) => {
          const setlistSongs = Object.entries(setlistSongsData)
            .map(([setlistSongId, setlistSongRow]) => {
              // Validate setlist song row
              const setlistSongResult = setlistSongTableSchema.safeParse(setlistSongRow);
              return setlistSongResult.success && setlistSongResult.data.setId === set.id
                ? { ...setlistSongResult.data, id: setlistSongId }
                : undefined;
            })
            .filter((setlistSong) => setlistSong !== undefined)
            .map((setlistSong) => {
              // Validate and merge song row
              const songData = songsData[setlistSong.songId];
              const songResult = songTableSchema.safeParse(songData);
              const song = songResult.success
                ? {
                    ...songResult.data,
                    canvasPaths: songResult.data.canvasPaths
                      ? JSON.parse(songResult.data.canvasPaths)
                      : [],
                  }
                : undefined;
              return song ? { ...setlistSong, ...song } : setlistSong;
            })
            .filter(
              (setlistSong) =>
                includeDeletedSongs ||
                !('isDeleted' in setlistSong) ||
                setlistSong?.isDeleted !== true,
            )
            .toSorted((a, b) => a.songIndex - b.songIndex);

          return { ...set, songs: setlistSongs };
        })
        .toSorted((a, b) => a.setIndex - b.setIndex);

      return { ...setlist, id: setlistId, sets };
    })
    .filter((setlist) => setlist !== undefined)
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get all setlists from the store
 */
export function useGetSetlists(): SetlistWithSets[] {
  const setlistsData = useTable('setlists') || {};
  const setlistSetsData = useTable('setlistSets') || {};
  const setlistSongsData = useTable('setlistSongs') || {};
  const songsData = useTable('songs') || {};

  return parseSetlists(setlistsData, setlistSetsData, setlistSongsData, songsData);
}

/**
 * Get a single setlist by ID
 */
export function useGetSetlist(id?: string, includeDeleted = false): SetlistWithSets | null {
  const setlistRow = useRow('setlists', id || '');
  const setlistSetsData = useTable('setlistSets') || {};
  const setlistSongsData = useTable('setlistSongs') || {};
  const songsData = useTable('songs') || {};

  if (!id || !setlistRow) {
    return null;
  }

  return parseSetlists(
    { [id]: setlistRow },
    setlistSetsData,
    setlistSongsData,
    songsData,
    includeDeleted,
  )[0];
}

/**
 * Hook to add a new setlist
 */
export function useAddSetlist(onSuccess?: () => void) {
  const store = useStore();

  // Create a wrapper that handles both the setlist and setlistSongs creation
  const addSetlistWithSongs = (
    data: SetlistTable & {
      sets: (SetlistSetTable & { songs: SetlistSongTable[] })[];
    },
  ) => {
    console.log({ data });
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
    (
      data: SetlistTable & {
        sets: (SetlistSetTable & { songs: SetlistSongTable[] })[];
      },
    ) => {
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
      const setlistSetsData = store.getTable('setlistSets') || {};
      const setlistSongsData = store.getTable('setlistSongs') || {};

      Object.entries(setlistSetsData).forEach(([setRowId, setData]) => {
        const rowData = setData as { setlistId?: string };
        if (rowData.setlistId === id) {
          store.delRow('setlistSets', setRowId);

          Object.entries(setlistSongsData).forEach(([songRowId, songData]) => {
            const rowData = songData as { setId?: string };
            if (rowData.setId === setRowId) {
              store.delRow('setlistSongs', songRowId);
            }
          });
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
      // Delete existing setlist songs and sets
      const setlistSetsData = store.getTable('setlistSets') || {};
      const setlistSongsData = store.getTable('setlistSongs') || {};

      Object.entries(setlistSetsData).forEach(([setRowId, setData]) => {
        const rowData = setData as { setlistId?: string };
        if (rowData.setlistId === id) {
          store.delRow('setlistSets', setRowId);

          Object.entries(setlistSongsData).forEach(([songRowId, songData]) => {
            const rowData = songData as { setId?: string };
            if (rowData.setId === setRowId) {
              store.delRow('setlistSongs', songRowId);
            }
          });
        }
      });
    }
    onSuccess?.();
    return id;
  });
}
