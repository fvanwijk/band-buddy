import { FormattedDuration } from './FormattedDuration';
import { SongRow } from './SongRow';
import type { SetlistSetWithSongs } from '../types';
import { parseDuration } from '../utils/duration';

type SetCardProps = {
  set: SetlistSetWithSongs;
  setIndex: number;
  setlistId?: string;
  sets: SetlistSetWithSongs[];
};

export function SetCard({ set, setIndex, setlistId, sets }: SetCardProps) {
  // Calculate cumulative song count before this set
  const songsBefore = sets.slice(0, setIndex).reduce((total, s) => total + s.songs.length, 0);

  // Calculate set duration
  const setSeconds = set.songs.reduce((total, songRef) => {
    const duration = 'duration' in songRef ? songRef.duration : undefined;
    return total + parseDuration(duration);
  }, 0);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40">
        <div className="text-brand-300 flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase">
          <span>{set.name || `Set ${setIndex + 1}`}</span>
          <span className="text-slate-400">
            <FormattedDuration seconds={setSeconds} />
          </span>
        </div>

        {set.songs.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400">No songs in this set</div>
        ) : (
          <>
            <div className="hidden grid-cols-[25px_6fr_2fr_2fr_2fr] gap-4 border-b border-slate-700 bg-slate-900/30 px-6 py-3 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase sm:grid">
              <span className="text-right"></span>
              <span>Song</span>
              <span className="text-right">Time</span>
              <span className="text-right">Key</span>
              <span className="text-right">Duration</span>
            </div>

            <ul className="divide-y divide-slate-800">
              {set.songs.map((song, index) => {
                // TODO: isSong(song)
                if (!('duration' in song)) return null;

                return (
                  <SongRow
                    key={song.songId}
                    index={songsBefore + index + 1}
                    setlistId={setlistId}
                    song={song}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>

      {setIndex < sets.length - 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Break
          </span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>
      )}
    </div>
  );
}
