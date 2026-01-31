import SetlistHeader from "./components/SetlistHeader";
import SetlistTable from "./components/SetlistTable";
import { mockSetlist } from "./data/setlist";

function App() {
  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-3 px-4 py-4">
        <SetlistHeader
          name={mockSetlist.name}
          date={mockSetlist.date}
          venue={mockSetlist.venue}
          songCount={mockSetlist.songs.length}
        />

        <SetlistTable songs={mockSetlist.songs} />
      </div>
    </div>
  );
}

export default App;
