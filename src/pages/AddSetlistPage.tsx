import { useNavigate } from 'react-router-dom';

import { SetlistForm } from '../components/SetlistForm';
import { useAddSetlist } from '../hooks/useSetlist';

export function AddSetlistPage() {
  const backPath = '/setlists';
  const navigate = useNavigate();
  const addSetlist = useAddSetlist(() => navigate(backPath));

  return <SetlistForm backPath={backPath} onSubmit={addSetlist} title="Add New Setlist" />;
}
