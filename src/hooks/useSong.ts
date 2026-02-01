import { useNavigate } from 'react-router-dom';
import {
  useAddRowCallback,
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useTable,
} from 'tinybase/ui-react';

import type { Song } from '../types';

/**
 * Get all songs from the store
 */
export function useGetSongs(): Song[] {
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

/**
 * Get a single song by ID
 */
export function useGetSong(id: string | undefined): Song | null {
  const songRow = useRow('songs', id || '');

  if (!id || !songRow) {
    return null;
  }

  return {
    artist: songRow.artist as string,
    bpm: songRow.bpm as number | undefined,
    duration: songRow.duration as string | undefined,
    id,
    key: songRow.key as string,
    timeSignature: songRow.timeSignature as string,
    title: songRow.title as string,
  };
}

/**
 * Hook to add a new song
 */
export function useAddSong(onSuccess?: () => void) {
  const navigate = useNavigate();

  return useAddRowCallback(
    'songs',
    (data: Omit<Song, 'id'>) => {
      const finalData: Record<string, string | number> = {
        artist: data.artist,
        key: data.key,
        timeSignature: data.timeSignature,
        title: data.title,
      };
      if (data.bpm) {
        finalData.bpm = data.bpm;
      }
      if (data.duration) {
        finalData.duration = data.duration;
      }
      return finalData;
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
      const finalData: Record<string, string | number> = {
        artist: data.artist,
        key: data.key,
        timeSignature: data.timeSignature,
        title: data.title,
      };
      if (data.bpm) {
        finalData.bpm = data.bpm;
      }
      if (data.duration) {
        finalData.duration = data.duration;
      }
      return finalData;
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
