import { useNavigate } from 'react-router-dom';
import { useAddRowCallback } from 'tinybase/ui-react';

import { SongForm } from '../components/SongForm';

function AddSongPage() {
  const backPath = '/songs';
  const navigate = useNavigate();

  const addRow = useAddRowCallback(
    'songs',
    (data: {
      artist: string;
      bpm?: number;
      duration?: string;
      key: string;
      timeSignature: string;
      title: string;
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
      if (data.duration) {
        finalData.duration = data.duration;
      }

      return finalData;
    },
    [backPath, navigate],
    undefined,
    () => {
      navigate(backPath);
    },
  );

  return <SongForm backPath={backPath} onSubmit={addRow} title="Add New Song" />;
}

export default AddSongPage;
