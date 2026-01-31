import { useNavigate, useParams } from 'react-router-dom';
import { useRow } from 'tinybase/ui-react';

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
      title: data.title,
      key: data.key,
      timeSignature: data.timeSignature,
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
        <button
          onClick={() => navigate('/songs')}
          className="rounded-lg border border-brand-400/30 bg-brand-400/10 px-6 py-3 font-medium text-brand-200 hover:bg-brand-400/20"
        >
          Back to Songs
        </button>
      </section>
    );
  }

  const song: Song = {
    id: id,
    artist: songRow.artist as string,
    title: songRow.title as string,
    key: songRow.key as string,
    timeSignature: songRow.timeSignature as string,
    bpm: songRow.bpm as number | undefined,
  };

  return <SongForm initialData={song} onSubmit={handleSubmit} title="Edit Song" />;
}

export default EditSongPage;
