import { useNavigate } from 'react-router-dom';

import { useAddSetlist } from '../../api/useSetlist';
import { SetlistForm } from './SetlistForm';

export function AddSetlistPage() {
  const backPath = '/setlists';
  const navigate = useNavigate();
  const addSetlist = useAddSetlist(() => navigate(backPath));

  return <SetlistForm backPath={backPath} onSubmit={addSetlist} title="Add new setlist" />;
}
