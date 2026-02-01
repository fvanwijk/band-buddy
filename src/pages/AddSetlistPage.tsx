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

  return <SetlistForm onSubmit={handleSubmit} title="Add New Setlist" />;
}
