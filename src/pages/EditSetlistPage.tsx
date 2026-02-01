import { useNavigate, useParams } from 'react-router-dom';
import { useSetRowCallback } from 'tinybase/ui-react';

import { SetlistForm } from '../components/SetlistForm';
import { useSetlists } from '../store/useStore';

export function EditSetlistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setlists = useSetlists();

  const setlist = setlists.find((s) => s.id === id);

  const setRow = useSetRowCallback(
    'setlists',
    id!,
    (data: {
      date: string;
      sets: Array<{ setNumber: number; songs: Array<{ songId: string; isDeleted?: boolean }> }>;
      title: string;
    }) => ({ data: JSON.stringify(data) }),
  );

  if (!setlist) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Setlist not found</p>
      </section>
    );
  }

  const handleSubmit = (data: {
    date: string;
    sets: Array<{ setNumber: number; songs: Array<{ songId: string; isDeleted?: boolean }> }>;
    title: string;
  }) => {
    setRow(data);
    navigate('/setlists');
  };

  return <SetlistForm initialData={setlist} onSubmit={handleSubmit} title="Edit Setlist" />;
}
