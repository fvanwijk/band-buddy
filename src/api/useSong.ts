import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CanvasPath } from 'react-sketch-canvas';
import {
  useAddRowCallback,
  useRow,
  useSetRowCallback,
  useStore,
  useTable,
} from 'tinybase/ui-react';

import { songDetailTabSchema, songSchema } from '../schemas';
import type { Song } from '../types';

export function parseSongDefaultTab(
  songRow: Record<string, unknown> | null | undefined,
): Song['defaultTab'] | undefined {
  const parsedTab = songDetailTabSchema.safeParse(songRow?.defaultTab);

  return parsedTab.success ? parsedTab.data : undefined;
}

export function parseSongRow(
  id: string | undefined,
  songRow: Record<string, unknown> | null | undefined,
  includeDeleted = false,
): Song | null {
  if (!id || !songRow || (songRow.isDeleted && !includeDeleted)) {
    return null;
  }

  const parsedData: Record<string, unknown> = { ...songRow, id };

  // Parse midiEvents if stored as JSON string
  if (typeof songRow.midiEvents === 'string') {
    try {
      parsedData.midiEvents = JSON.parse(songRow.midiEvents);
    } catch {
      parsedData.midiEvents = undefined;
    }
  }

  // Parse canvasPaths if stored as JSON string
  if (typeof songRow.canvasPaths === 'string') {
    try {
      parsedData.canvasPaths = JSON.parse(songRow.canvasPaths);
    } catch {
      parsedData.canvasPaths = undefined;
    }
  }

  const result = songSchema.safeParse(parsedData);
  if (!result.success) {
    console.log(result.error, parsedData);
    return null;
  }

  return result.data;
}

type SortOptions = {
  sortBy?: keyof Song | null;
  sortDirection?: 'asc' | 'desc' | 'none';
};

/**
 * Get all songs from the store
 * @param includeDeleted - If true, includes soft-deleted songs. Defaults to false.
 * @param sort.sortBy - Field to sort by. Defaults to 'title'. Pass null to disable sorting.
 * @param sort.sortDirection - Sort direction. Defaults to 'asc'.
 */
export function useGetSongs(
  includeDeleted = false,
  { sortBy = 'title', sortDirection = 'asc' }: SortOptions = {},
): Song[] {
  const songsData = useTable('songs') || {};

  const songs = Object.entries(songsData)
    .map(([id, data]) => {
      const songData = data as Record<string, unknown>;
      const parsedData: Record<string, unknown> = { ...songData, id };
      // Parse midiEvents if stored as JSON string
      if (typeof songData.midiEvents === 'string') {
        try {
          parsedData.midiEvents = JSON.parse(songData.midiEvents);
        } catch {
          parsedData.midiEvents = undefined;
        }
      }
      // Parse canvasPaths if stored as JSON string
      if (typeof songData.canvasPaths === 'string') {
        try {
          parsedData.canvasPaths = JSON.parse(songData.canvasPaths);
        } catch {
          parsedData.canvasPaths = undefined;
        }
      }
      const result = songSchema.safeParse(parsedData);
      if (!result.success) {
        console.log(result.error, parsedData);
        return null;
      }
      return result.data;
    })
    .filter((song): song is Song => song !== null && (includeDeleted || !song.isDeleted));

  if (!sortBy || sortDirection === 'none') {
    return songs;
  }

  return songs.toSorted((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];

    let comparison = 0;

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    } else if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

/**
 * Get a single song by ID
 */
export function useGetSong(id: string | undefined, includeDeleted = false): Song | null {
  const songRow = useRow('songs', id || '') as Record<string, unknown> | null | undefined;

  return parseSongRow(id, songRow, includeDeleted);
}

/**
 * Hook to add a new song
 */
export function useAddSong(onSuccess?: (id: string) => void) {
  const navigate = useNavigate();

  return useAddRowCallback(
    'songs',
    (data: Omit<Song, 'id'>) => {
      const finalData: Record<string, unknown> = {
        ...data,
      };

      if (data.midiEvents && data.midiEvents.length > 0) {
        finalData.midiEvents = JSON.stringify(data.midiEvents);
      } else {
        delete finalData.midiEvents;
      }

      Object.entries(finalData).forEach(([key, value]) => {
        if (value === undefined) {
          delete finalData[key];
        }
      });

      return finalData as Record<string, string | number>;
    },
    [navigate, onSuccess],
    undefined,
    (id) => {
      onSuccess?.(id as string);
    },
    undefined,
    false, // Do not reuse row ids
  );
}

/**
 * Hook to update an existing song
 */
export function useUpdateSong(id: string, onSuccess?: () => void) {
  return useSetRowCallback(
    'songs',
    id,
    (data: Omit<Song, 'id'>) => {
      const finalData: Record<string, unknown> = {
        ...data,
      };

      if (data.midiEvents && data.midiEvents.length > 0) {
        finalData.midiEvents = JSON.stringify(data.midiEvents);
      } else {
        delete finalData.midiEvents;
      }

      if (data.canvasPaths && data.canvasPaths.length > 0) {
        finalData.canvasPaths = JSON.stringify(data.canvasPaths);
      } else if (data.canvasPaths !== undefined) {
        delete finalData.canvasPaths;
      }

      Object.entries(finalData).forEach(([key, value]) => {
        if (value === undefined) {
          delete finalData[key];
        }
      });

      return finalData as Record<string, string | number>;
    },
    [id, onSuccess],
    undefined,
    () => {
      onSuccess?.();
    },
  );
}

/**
 * Hook to delete a song
 * If the song is in one or more sets, soft-delete it.
 * If the song is not in any sets, hard-delete it.
 */
export function useDeleteSong(onSuccess?: () => void) {
  const store = useStore();

  const handleDelete = (id: string) => {
    if (!store) {
      onSuccess?.();
      return;
    }

    // Check if song is referenced in any setlistSongs
    const setlistSongsData = store.getTable('setlistSongs') || {};
    const isInSets = Object.values(setlistSongsData).some(
      (songData) => (songData as Record<string, unknown>).songId === id,
    );

    if (isInSets) {
      // Soft delete: mark as deleted but don't remove from store
      store.setPartialRow('songs', id, { isDeleted: true });
    } else {
      // Hard delete: remove completely
      store.delRow('songs', id);
    }

    onSuccess?.();
  };

  return handleDelete;
}

/**
 * Hook to get canvas paths for a song
 */
export function useGetSongCanvasPaths(songId: string | undefined): CanvasPath[] {
  const songRow = useRow('songs', songId || '');

  if (!songId || !songRow) {
    return [];
  }
  const songData = songRow as Record<string, unknown>;
  if (!songData.canvasPaths || typeof songData.canvasPaths !== 'string') {
    return [];
  }

  try {
    return JSON.parse(songData.canvasPaths) as CanvasPath[];
  } catch {
    return [];
  }
}

/**
 * Hook to set canvas paths for a song
 */
export function useSetSongCanvasPaths(songId: string | undefined) {
  const store = useStore();

  return useCallback(
    (paths: CanvasPath[]) => {
      if (!songId || !store) {
        return;
      }

      if (paths.length === 0) {
        store.setPartialRow('songs', songId, { canvasPaths: '' });
      } else {
        store.setPartialRow('songs', songId, {
          canvasPaths: JSON.stringify(paths),
        });
      }
    },
    [songId, store],
  );
}
