import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteSheetMusic, getSheetMusic, storeSheetMusic } from '../services/sheetMusicStorage';

/**
 * Hook to fetch sheet music for a song
 */
export function useSheetMusic(songId: string | undefined, enabled: boolean = true) {
  return useQuery({
    enabled: enabled && !!songId,
    queryFn: async () => {
      if (!songId) return null;
      return getSheetMusic(songId);
    },
    queryKey: ['sheetMusic', songId],
  });
}

/**
 * Hook to upload/store sheet music
 */
export function useStoreSheetMusic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, songId }: { file: File; songId: string }) => {
      await storeSheetMusic(songId, file);
      return { file, songId };
    },
    onSuccess: (data) => {
      // Invalidate the query to refetch the sheet music
      queryClient.invalidateQueries({ queryKey: ['sheetMusic', data.songId] });
    },
  });
}

/**
 * Hook to delete sheet music
 */
export function useDeleteSheetMusic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: string) => {
      await deleteSheetMusic(songId);
      return songId;
    },
    onSuccess: (songId) => {
      // Remove the query from cache
      queryClient.removeQueries({ queryKey: ['sheetMusic', songId] });
    },
  });
}
