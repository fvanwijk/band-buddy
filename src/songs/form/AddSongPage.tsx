import { useNavigate } from 'react-router-dom';

import { SongForm } from './SongForm';
import { useAddSong } from '../../api/useSong';
import { useStoreSheetMusic } from '../../hooks/useSheetMusic';
import type { Song } from '../../types';

export function AddSongPage() {
  const backPath = '/songs';
  const navigate = useNavigate();
  const storeSheetMusic = useStoreSheetMusic();

  let pendingFile: File | undefined;

  const addSong = useAddSong((newSongId: string) => {
    if (pendingFile) {
      storeSheetMusic.mutate({ file: pendingFile, songId: newSongId });
    }
    navigate(backPath);
  });

  const handleSubmit = (data: Omit<Song, 'id'>, sheetMusicFile?: File) => {
    pendingFile = sheetMusicFile;
    addSong(data);
  };

  return <SongForm backPath={backPath} onSubmit={handleSubmit} title="Add New Song" />;
}
