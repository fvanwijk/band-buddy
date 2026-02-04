import { FormattedDuration } from './FormattedDuration';
import { SongRow } from './SongRow';
import type { SetlistSet, Song } from '../types';
import { parseDuration } from '../utils/duration';

type SetlistTableProps = {
  setlistId?: string;
  sets: SetlistSet[];
  songsMap: Map<string, Song>;
};

export function SetlistTable({ setlistId, sets, songsMap }: SetlistTableProps) {
  // Calculate total duration
  const totalSeconds = sets.reduce((total, set) => {
    return (
      total +
      set.songs.reduce((setTotal, songRef) => {
        const song = songsMap.get(songRef.songId);
        return setTotal + parseDuration(song?.duration);
      }, 0)
    );
  }, 0);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex-1 overflow-y-auto">
        {sets.map((set, setIndex) => {
          // Calculate cumulative song count before this set
          const songsBefore = sets
            .slice(0, setIndex)
            .reduce((total, s) => total + s.songs.length, 0);

          // Calculate set duration
          const setSeconds = set.songs.reduce((total, songRef) => {
            const song = songsMap.get(songRef.songId);
            return total + parseDuration(song?.duration);
          }, 0);

          return (
            <div key={set.setNumber}>
              {/* Set Card */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden">
                {/* Set Header */}
                <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                  <span>Set {set.setNumber}</span>
                  <span className="text-slate-400">
                    <FormattedDuration seconds={setSeconds} />
                  </span>
                </div>

                {/* Songs in Set */}
                {set.songs.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-400">No songs in this set</div>
                ) : (
                  <>
                    {/* Column Headers */}
                    <div className="grid gap-4 border-b border-slate-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:grid-cols-[0.5fr_3fr_1fr_1fr_1fr] bg-slate-900/30">
                      <span className="text-right">No.</span>
                      <span>Song</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Key</span>
                      <span className="text-right">Duration</span>
                    </div>

                    {/* Songs */}
                    <ul className="divide-y divide-slate-800">
                      {set.songs.map((songRef, index) => {
                        const song = songsMap.get(songRef.songId);
                        if (!song) return null;
                        return (
                          <SongRow
                            key={songRef.songId}
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

              {/* Break Between Sets */}
              {setIndex < sets.length - 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="h-px flex-1 bg-slate-700" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Break
                  </span>
                  <div className="h-px flex-1 bg-slate-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
