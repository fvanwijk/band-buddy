import { useNavigate } from 'react-router-dom';

import { SongForm } from '../components/SongForm';
import { useAddSong } from '../hooks/useSong';

function AddSongPage() {
  const backPath = '/songs';
  const navigate = useNavigate();
  const addSong = useAddSong(() => navigate(backPath));

  return <SongForm backPath={backPath} onSubmit={addSong} title="Add New Song" />;
}

export default AddSongPage;
