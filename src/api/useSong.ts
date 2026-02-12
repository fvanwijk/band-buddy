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

import { songSchema } from '../schemas';
import type { Song } from '../types';

/**
 * Get all songs from the store
 * @param includeDeleted - If true, includes soft-deleted songs. Defaults to false.
 */
export function useGetSongs(includeDeleted = false): Song[] {
  const songsData = useTable('songs') || {};

  return Object.entries(songsData)
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
    .filter((song): song is Song => song !== null && (includeDeleted || !song.isDeleted))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Get a single song by ID
 */
export function useGetSong(id: string | undefined, includeDeleted = false): Song | null {
  const songRow = useRow('songs', id || '');

  if (!id || !songRow || (songRow.isDeleted && !includeDeleted)) {
    return null;
  }

  const songData = songRow as Record<string, unknown>;
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
