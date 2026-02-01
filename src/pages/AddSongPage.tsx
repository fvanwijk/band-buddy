import { useNavigate } from 'react-router-dom';
import { useStore } from 'tinybase/ui-react';

import { SongForm } from '../components/SongForm';

function AddSongPage() {
  const backPath = '/songs';
  const navigate = useNavigate();
  const store = useStore();

  const handleSubmit = (data: {
    artist: string;
    bpm?: number;
    duration?: string;
    key: string;
    timeSignature: string;
    title: string;
  }) => {
    if (!store) return;
    const finalData: Record<string, string | number> = {
      artist: data.artist,
      key: data.key,
      timeSignature: data.timeSignature,
      title: data.title,
    };
    if (data.bpm) {
      finalData.bpm = data.bpm;
    }
    if (data.duration) {
      finalData.duration = data.duration;
    }
    store.addRow('songs', finalData);
    navigate(backPath);
  };

  return <SongForm backPath={backPath} onSubmit={handleSubmit} title="Add New Song" />;
}

export default AddSongPage;
