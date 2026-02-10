import { useNavigate, useParams } from 'react-router-dom';

import { SongForm } from './SongForm';
import { useGetSong, useUpdateSong } from '../../api/useSong';
import { useDeleteSheetMusic, useStoreSheetMusic } from '../../hooks/useSheetMusic';
import type { Song } from '../../types';

export function EditSongPage() {
  const backPath = '/songs';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const song = useGetSong(id);
  const storeSheetMusic = useStoreSheetMusic();
  const deleteSheetMusic = useDeleteSheetMusic();

  let pendingFile: File | undefined;
  let hadSheetMusic: boolean;
  let hasSheetMusic: boolean;

  const updateSong = useUpdateSong(id!, () => {
    if (id) {
      if (hadSheetMusic && !hasSheetMusic) {
        deleteSheetMusic.mutate(id);
      } else if (hasSheetMusic && pendingFile) {
        storeSheetMusic.mutate({ file: pendingFile, songId: id });
      }
    }
    navigate(backPath);
  });

  if (!id || !song) {
    throw new Error('Song not found');
  }

  const handleSubmit = (data: Omit<Song, 'id'>, sheetMusicFile?: File) => {
    pendingFile = sheetMusicFile;
    hadSheetMusic = !!song.sheetMusicFilename;
    hasSheetMusic = !!data.sheetMusicFilename;
    updateSong(data);
  };

  return (
    <SongForm backPath={backPath} initialData={song} onSubmit={handleSubmit} title="Edit Song" />
  );
}
