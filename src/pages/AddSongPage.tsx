import { useNavigate } from "react-router-dom";
import { store } from "../store/store";
import { SongForm } from "../components/SongForm";

function AddSongPage() {
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
      title: data.title,
      key: data.key,
      timeSignature: data.timeSignature,
    };
    if (data.bpm) {
      finalData.bpm = data.bpm;
    }
    store.addRow("songs", finalData);
    navigate("/songs");
  };

  return <SongForm onSubmit={handleSubmit} title="Add New Song" />;
}

export default AddSongPage;
