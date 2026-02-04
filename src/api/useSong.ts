import { useNavigate } from 'react-router-dom';
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
      const result = songSchema.safeParse(parsedData);
      return result.success ? result.data : null;
    })
    .filter((song): song is Song => song !== null && (includeDeleted || !song.isDeleted))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Get a single song by ID
 */
export function useGetSong(id: string | undefined): Song | null {
  const songRow = useRow('songs', id || '');

  if (!id || !songRow) {
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

  const result = songSchema.safeParse(parsedData);
  return result.success ? result.data : null;
}

/**
 * Hook to add a new song
 */
export function useAddSong(onSuccess?: () => void) {
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
    () => {
      onSuccess?.();
    },
    undefined,
    false, // Do not reuse row ids
  );
}

/**
 * Hook to update an existing song
 */
export function useUpdateSong(id: string | undefined, onSuccess?: () => void) {
  return useSetRowCallback(
    'songs',
    id!,
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
