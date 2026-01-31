import SetlistHeader from "../components/SetlistHeader";
import SetlistTable from "../components/SetlistTable";
import { useValue, useRow, useTable } from "tinybase/ui-react";
import type { Song } from "../types/setlist";

function ActiveSetlistPage() {
  const activeSetlistId = useValue("activeSetlistId") as string | undefined;
  const setlist = useRow("setlists", activeSetlistId || "");
  const songsTable = useTable("songs");

  if (!activeSetlistId || !setlist) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
        <div className="rounded-full bg-brand-400/10 p-6 mb-4">
          <svg
            className="w-12 h-12 text-brand-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">
          No active setlist
        </h2>
        <p className="text-slate-400 max-w-md">
          Select or create a setlist to get started with your performance.
        </p>
      </div>
    );
  }

  // Get songs in the order specified in the setlist
  const songIds = (setlist.songIds as string)?.split(",") || [];
  const songs: Song[] = songIds
    .map((id) => {
      const songRow = songsTable[id];
      if (!songRow) return null;
      return {
        id,
        artist: songRow.artist as string,
        title: songRow.title as string,
        key: songRow.key as string,
        timeSignature: songRow.timeSignature as string,
      };
    })
    .filter((song): song is Song => song !== null);

  return (
    <div className="flex h-full flex-col gap-3">
      <SetlistHeader
        name={setlist.name as string}
        date={setlist.date as string}
        venue={setlist.venue as string}
        songCount={songs.length}
      />

      <SetlistTable songs={songs} />
    </div>
  );
}

export default ActiveSetlistPage;
