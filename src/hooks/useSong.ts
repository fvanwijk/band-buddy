import { useNavigate } from 'react-router-dom';
import {
  useAddRowCallback,
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useTable,
} from 'tinybase/ui-react';

import { songSchema } from '../schemas';
import type { Song } from '../types';

/**
 * Get all songs from the store
 */
export function useGetSongs(): Song[] {
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
    .filter((song): song is Song => song !== null)
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
 */
export function useDeleteSong(onSuccess?: () => void) {
  return useDelRowCallback('songs', (id: string) => {
    onSuccess?.();
    return id;
  });
}
