import { useNavigate, useParams } from 'react-router-dom';

import { SetlistForm } from './SetlistForm';
import { useGetSetlist, useUpdateSetlist } from '../../api/useSetlist';

export function EditSetlistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setlist = useGetSetlist(id!);
  const updateSetlist = useUpdateSetlist(id, () => navigate('/setlists'));

  if (!setlist) {
    throw new Error('Setlist not found');
  }

  return (
    <SetlistForm
      backPath="/setlists"
      initialData={setlist}
      onSubmit={updateSetlist}
      title="Edit Setlist"
    />
  );
}
