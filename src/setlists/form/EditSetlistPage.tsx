import { useNavigate, useParams } from 'react-router-dom';

import { useGetSetlist, useUpdateSetlist } from '../../api/useSetlist';
import { SetlistForm } from './SetlistForm';

export function EditSetlistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setlist = useGetSetlist(id!, true);
  const updateSetlist = useUpdateSetlist(id, () => navigate('/setlists'));

  if (!setlist) {
    throw new Error('Setlist not found');
  }

  return (
    <SetlistForm
      backPath="/setlists"
      initialData={setlist}
      onSubmit={updateSetlist}
      title="Edit setlist"
    />
  );
}
