import { useNavigate, useParams } from 'react-router-dom';

import { SetlistForm } from '../components/SetlistForm';
import { useGetSetlist, useUpdateSetlist } from '../hooks/useSetlist';

export function EditSetlistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setlist = useGetSetlist(id);
  const updateSetlist = useUpdateSetlist(id, () => navigate('/setlists'));

  if (!setlist) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Setlist not found</p>
      </section>
    );
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
