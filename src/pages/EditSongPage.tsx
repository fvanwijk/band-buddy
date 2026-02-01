import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRow, useStore } from 'tinybase/ui-react';

import { Button } from '../components/Button';
import { SongForm } from '../components/SongForm';
import type { Song } from '../types';

function EditSongPage() {
  const backPath = '/songs';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStore();

  const songRow = useRow('songs', id || '');

  const handleSubmit = (data: {
    artist: string;
    bpm?: number;
    duration?: string;
    key: string;
    timeSignature: string;
    title: string;
  }) => {
    if (!id || !store) return;
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
    store.setRow('songs', id, finalData);
    navigate(backPath);
  };

  if (!id || !songRow) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Song not found</p>
        <Button as={Link} color="primary" to={backPath}>
          Back to Songs
        </Button>
      </section>
    );
  }

  const song: Song = {
    artist: songRow.artist as string,
    bpm: songRow.bpm as number | undefined,
    duration: songRow.duration as string | undefined,
    id: id,
    key: songRow.key as string,
    timeSignature: songRow.timeSignature as string,
    title: songRow.title as string,
  };

  return (
    <SongForm backPath={backPath} initialData={song} onSubmit={handleSubmit} title="Edit Song" />
  );
}

export default EditSongPage;
