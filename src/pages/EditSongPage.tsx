import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { SongForm } from '../components/SongForm';
import { useGetSong, useUpdateSong } from '../hooks/useSong';

function EditSongPage() {
  const backPath = '/songs';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const song = useGetSong(id);
  const updateSong = useUpdateSong(id, () => navigate(backPath));

  if (!id || !song) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Song not found</p>
        <Button as={Link} color="primary" to={backPath}>
          Back to Songs
        </Button>
      </section>
    );
  }

  return (
    <SongForm backPath={backPath} initialData={song} onSubmit={updateSong} title="Edit Song" />
  );
}

export default EditSongPage;
