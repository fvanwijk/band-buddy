import SetlistHeader from "../components/SetlistHeader";
import SetlistTable from "../components/SetlistTable";
import { mockSetlist } from "../data/setlist";

function ActiveSetlistPage() {
  return (
    <div className="flex h-full flex-col gap-3">
      <SetlistHeader
        name={mockSetlist.name}
        date={mockSetlist.date}
        venue={mockSetlist.venue}
        songCount={mockSetlist.songs.length}
      />

      <SetlistTable songs={mockSetlist.songs} />
    </div>
  );
}

export default ActiveSetlistPage;
