import type { SetlistSet, Song } from '../types';
import { formatDuration, parseDuration } from '../utils/duration';

type SetlistTableProps = {
  sets: SetlistSet[];
  songsMap: Record<string, Song>;
};

type SongRowProps = {
  index: number;
  song: Song;
};

function SongRow({ index, song }: SongRowProps) {
  const durationSeconds = parseDuration(song.duration);
  const durationDisplay = formatDuration(durationSeconds);

  return (
    <li className="grid gap-4 px-6 py-2 text-sm text-slate-200 transition hover:bg-slate-900/80 sm:grid-cols-[0.5fr_3fr_1fr_1fr_1fr]">
      <span className="text-right text-slate-500">{index}</span>
      <span className="flex flex-col">
        <span className="text-base font-semibold text-slate-100">{song.title}</span>
        <span className="text-xs text-slate-400">{song.artist}</span>
      </span>
      <span className="text-right text-sm font-semibold text-slate-100">{song.timeSignature}</span>
      <span className="text-right text-sm font-semibold text-brand-200">{song.key}</span>
      <span className="text-right text-sm text-slate-400">{durationDisplay}</span>
    </li>
  );
}

function SetlistTable({ sets, songsMap }: SetlistTableProps) {
  // Calculate total duration
  const totalSeconds = sets.reduce((total, set) => {
    return (
      total +
      set.songs.reduce((setTotal, songRef) => {
        const song = songsMap[songRef.songId];
        return setTotal + parseDuration(song?.duration);
      }, 0)
    );
  }, 0);

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {sets.map((set) => {
          // Calculate set duration
          const setSeconds = set.songs.reduce((total, songRef) => {
            const song = songsMap[songRef.songId];
            return total + parseDuration(song?.duration);
          }, 0);

          return (
            <div key={set.setNumber} className="border-b border-slate-800 last:border-b-0">
              {/* Set Header */}
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 backdrop-blur-sm">
                <span>Set {set.setNumber}</span>
                <span className="text-slate-400">{formatDuration(setSeconds)}</span>
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
                      const song = songsMap[songRef.songId];
                      if (!song) return null;
                      return <SongRow key={songRef.songId} index={index + 1} song={song} />;
                    })}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Duration Footer */}
      <div className="border-t border-slate-800 bg-slate-900/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 flex items-center justify-between">
        <span>Total Duration</span>
        <span className="text-lg font-bold">{formatDuration(totalSeconds)}</span>
      </div>
    </section>
  );
}

export default SetlistTable;
