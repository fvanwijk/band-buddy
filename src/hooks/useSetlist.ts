import {
  useAddRowCallback,
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useStore,
  useTable,
} from 'tinybase/ui-react';

import { setlistMetadataSchema, setlistSongSchema } from '../schemas';
import type { Setlist, SetlistSet, SongReference } from '../types';

/**
 * Get all setlists from the store
 */
export function useGetSetlists(): Setlist[] {
  const setlistsData = useTable('setlists') || {};
  const setlistSongsData = useTable('setlistSongs') || {};

  return Object.entries(setlistsData)
    .map(([id, data]) => {
      const result = setlistMetadataSchema.safeParse({ ...data, id });
      if (!result.success) return null;

      // Get all songs for this setlist, grouped by set number
      const setlistSongs = Object.entries(setlistSongsData)
        .map(([songRowId, songData]) => {
          const songResult = setlistSongSchema.safeParse({ ...songData, id: songRowId });
          return songResult.success ? songResult.data : null;
        })
        .filter((song): song is NonNullable<typeof song> => song !== null && song.setlistId === id);

      // Group by set number
      const setsMap = new Map<number, SongReference[]>();
      setlistSongs.forEach((song) => {
        if (!setsMap.has(song.setNumber)) {
          setsMap.set(song.setNumber, []);
        }
        setsMap.get(song.setNumber)!.push({
          isDeleted: song.isDeleted,
          songId: song.songId,
        });
      });

      // Convert to sorted array of sets
      const sets: SetlistSet[] = Array.from(setsMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([setNumber, songs]) => ({
          setNumber,
          songs,
        }));

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
    })
    .filter((setlist): setlist is Setlist => setlist !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single setlist by ID
 */
export function useGetSetlist(id: string | undefined): Setlist | null {
  const setlistRow = useRow('setlists', id || '');
  const setlistSongsData = useTable('setlistSongs') || {};

  if (!id || !setlistRow) {
    return null;
  }

  const result = setlistMetadataSchema.safeParse({ ...setlistRow, id });
  if (!result.success) return null;

  // Get all songs for this setlist
  const setlistSongs = Object.entries(setlistSongsData)
    .map(([songRowId, songData]) => {
      const songResult = setlistSongSchema.safeParse({ ...songData, id: songRowId });
      return songResult.success ? songResult.data : null;
    })
    .filter((song): song is NonNullable<typeof song> => song !== null && song.setlistId === id);

  // Group by set number
  const setsMap = new Map<number, SongReference[]>();
  setlistSongs
    .sort((a, b) => a.songIndex - b.songIndex)
    .forEach((song) => {
      if (!setsMap.has(song.setNumber)) {
        setsMap.set(song.setNumber, []);
      }
      setsMap.get(song.setNumber)!.push({
        isDeleted: song.isDeleted,
        songId: song.songId,
      });
    });

  // Convert to sorted array of sets
  const sets: SetlistSet[] = Array.from(setsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([setNumber, songs]) => ({
      setNumber,
      songs,
    }));

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

  return useAddRowCallback(
    'setlists',
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

      const setlistId = Date.now().toString();

      // Add the songs to setlistSongs table
      data.sets.forEach((set) => {
        set.songs.forEach((songRef, index) => {
          const songRowId = `${setlistId}_${set.setNumber}_${index}`;
          store.setRow('setlistSongs', songRowId, {
            isDeleted: songRef.isDeleted || false,
            setNumber: set.setNumber,
            setlistId,
            songId: songRef.songId,
            songIndex: index,
          });
        });
      });

      return row as Record<string, string>;
    },
    [store, onSuccess],
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

      // Delete existing setlist songs
      const setlistSongsData = store.getTable('setlistSongs') || {};
      Object.entries(setlistSongsData).forEach(([songRowId, songData]) => {
        const rowData = songData as { setlistId?: string };
        if (rowData.setlistId === id) {
          store.delRow('setlistSongs', songRowId);
        }
      });

      // Add updated songs
      data.sets.forEach((set) => {
        set.songs.forEach((songRef, index) => {
          const songRowId = `${id}_${set.setNumber}_${index}`;
          store.setRow('setlistSongs', songRowId, {
            isDeleted: songRef.isDeleted || false,
            setNumber: set.setNumber,
            setlistId: id!,
            songId: songRef.songId,
            songIndex: index,
          });
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
