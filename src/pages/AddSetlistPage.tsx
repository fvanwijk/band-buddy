import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
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
      <Button onClick={() => navigate('/setlist')} variant="secondary">
        ← Back to Setlists
      </Button>
      <SetlistForm onSubmit={handleSubmit} title="Create New Setlist" />
    </div>
  );
}
