import { useNavigate } from 'react-router-dom';
import { useAddRowCallback } from 'tinybase/ui-react';

import { SetlistForm } from '../components/SetlistForm';

export function AddSetlistPage() {
  const backPath = '/setlists';
  const navigate = useNavigate();

  const setRow = useAddRowCallback(
    'setlists',
    (data: {
      date: string;
      sets: Array<{ setNumber: number; songs: Array<{ songId: string; isDeleted?: boolean }> }>;
      title: string;
    }) => ({ data: JSON.stringify(data) }),
    [navigate, backPath],
    undefined,
    () => {
      navigate(backPath);
    },
  );

  const handleSubmit = (data: {
    date: string;
    sets: Array<{ setNumber: number; songs: Array<{ songId: string; isDeleted?: boolean }> }>;
    title: string;
  }) => {
    setRow(data);
  };

  return <SetlistForm backPath={backPath} onSubmit={handleSubmit} title="Add New Setlist" />;
}
