import { useNavigate, useParams } from 'react-router-dom';

import { SetlistForm } from '../components/SetlistForm';
import { store } from '../store/store';
import { useSetlists } from '../store/useStore';

export function EditSetlistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setlists = useSetlists();

  const setlist = setlists.find((s) => s.id === id);

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
    store.setRow('setlists', id!, { data: JSON.stringify(data) } as Record<
      string,
      string | number
    >);
    navigate('/setlist');
  };

  return <SetlistForm initialData={setlist} onSubmit={handleSubmit} title="Edit Setlist" />;
}
