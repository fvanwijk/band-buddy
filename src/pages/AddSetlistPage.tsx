import { useNavigate } from 'react-router-dom';

import { SetlistForm } from '../components/SetlistForm';
import { store } from '../store/store';

export function AddSetlistPage() {
  const navigate = useNavigate();

  const handleSubmit = (data: {
    date: string;
    sets: Array<{ setNumber: number; songs: Array<{ songId: string; isDeleted?: boolean }> }>;
    title: string;
  }) => {
    const id = Date.now().toString();
    store.setRow('setlists', id, { data: JSON.stringify(data) } as Record<string, string | number>);
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
      <SetlistForm onSubmit={handleSubmit} title="Create New Setlist" />
    </div>
  );
}
