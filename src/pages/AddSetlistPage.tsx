import { useNavigate } from 'react-router-dom';
import { useStore } from 'tinybase/ui-react';

import { SetlistForm } from '../components/SetlistForm';

export function AddSetlistPage() {
  const navigate = useNavigate();
  const store = useStore();

  const handleSubmit = (data: {
    date: string;
    sets: Array<{ setNumber: number; songs: Array<{ songId: string; isDeleted?: boolean }> }>;
    title: string;
  }) => {
    if (!store) return;
    const id = Date.now().toString();
    store.setRow('setlists', id, { data: JSON.stringify(data) });
    navigate('/setlist');
  };

  return <SetlistForm onSubmit={handleSubmit} title="Add New Setlist" />;
}
