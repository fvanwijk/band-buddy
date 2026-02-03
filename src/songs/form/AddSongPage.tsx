import { useNavigate } from 'react-router-dom';

import { SongForm } from './SongForm';
import { useAddSong } from '../../api/useSong';

export function AddSongPage() {
  const backPath = '/songs';
  const navigate = useNavigate();
  const addSong = useAddSong(() => navigate(backPath));

  return <SongForm backPath={backPath} onSubmit={addSong} title="Add New Song" />;
}
