import { useNavigate, useParams } from 'react-router-dom';
import { useRow } from 'tinybase/ui-react';

import { Button } from '../components/Button';
import { SongForm } from '../components/SongForm';
import { store } from '../store/store';
import type { Song } from '../types/setlist';

function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const songRow = useRow('songs', id || '');

  const handleSubmit = (data: {
    artist: string;
    title: string;
    key: string;
    timeSignature: string;
    bpm?: number;
  }) => {
    if (!id) return;
    const finalData: Record<string, string | number> = {
      artist: data.artist,
      key: data.key,
      timeSignature: data.timeSignature,
      title: data.title,
    };
    if (data.bpm) {
      finalData.bpm = data.bpm;
    }
    store.setRow('songs', id, finalData);
    navigate('/songs');
  };

  if (!id || !songRow) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Song not found</p>
        <Button
          className="rounded-lg border border-brand-400/30 bg-brand-400/10 px-6 py-3 font-medium text-brand-200 hover:bg-brand-400/20"
          onClick={() => navigate('/songs')}
          variant="primary"
        >
          Back to Songs
        </Button>
      </section>
    );
  }

  const song: Song = {
    artist: songRow.artist as string,
    bpm: songRow.bpm as number | undefined,
    id: id,
    key: songRow.key as string,
    timeSignature: songRow.timeSignature as string,
    title: songRow.title as string,
  };

  return <SongForm initialData={song} onSubmit={handleSubmit} title="Edit Song" />;
}

export default EditSongPage;
