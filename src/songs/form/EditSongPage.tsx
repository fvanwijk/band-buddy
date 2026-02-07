import { useNavigate, useParams } from 'react-router-dom';

import { SongForm } from './SongForm';
import { useGetSong, useUpdateSong } from '../../api/useSong';

export function EditSongPage() {
  const backPath = '/songs';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const song = useGetSong(id);
  const updateSong = useUpdateSong(id!, () => navigate(backPath));

  if (!id || !song) {
    throw new Error('Song not found');
  }

  return (
    <SongForm backPath={backPath} initialData={song} onSubmit={updateSong} title="Edit Song" />
  );
}
