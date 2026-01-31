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
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Setlist not found</p>
      </div>
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

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <button
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        onClick={() => navigate('/setlist')}
      >
        ← Back to Setlists
      </button>
      <SetlistForm initialData={setlist} onSubmit={handleSubmit} title="Edit Setlist" />
    </div>
  );
}
