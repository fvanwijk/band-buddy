import { useNavigate } from 'react-router-dom';

import { SongForm } from '../components/SongForm';
import { store } from '../store/store';

function AddSongPage() {
  const backPath = '/songs';
  const navigate = useNavigate();

  const handleSubmit = (data: {
    artist: string;
    title: string;
    key: string;
    timeSignature: string;
    bpm?: number;
  }) => {
    const finalData: Record<string, string | number> = {
      artist: data.artist,
      key: data.key,
      timeSignature: data.timeSignature,
      title: data.title,
    };
    if (data.bpm) {
      finalData.bpm = data.bpm;
    }
    store.addRow('songs', finalData);
    navigate(backPath);
  };

  return <SongForm backPath={backPath} onSubmit={handleSubmit} title="Add New Song" />;
}

export default AddSongPage;
