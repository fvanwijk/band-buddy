import { useNavigate } from 'react-router-dom';

import { FormattedDuration } from './FormattedDuration';
import type { SetlistSet, Song } from '../types';
import { parseDuration } from '../utils/duration';

type SetlistTableProps = {
  setlistId?: string;
  sets: SetlistSet[];
  songsMap: Map<string, Song>;
};

type SongRowProps = {
  index: number;
  onNavigate: (songId: string) => void;
  song: Song;
};

function SongRow({ index, onNavigate, song }: SongRowProps) {
  const durationSeconds = parseDuration(song.duration);

  return (
    <li
      className="grid cursor-pointer gap-4 px-6 py-2 text-sm text-slate-200 transition hover:bg-slate-900/80 sm:grid-cols-[0.5fr_3fr_1fr_1fr_1fr]"
      onClick={() => onNavigate(song.id)}
    >
      <span className="text-right text-slate-500">{index}</span>
      <span className="flex flex-col">
        <span className="text-base font-semibold text-slate-100">{song.title}</span>
        <span className="text-xs text-slate-400">{song.artist}</span>
      </span>
      <span className="text-right text-sm font-semibold text-slate-100">{song.timeSignature}</span>
      <span className="text-right text-sm font-semibold text-brand-200">{song.key}</span>
      <span className="text-right text-sm text-slate-400">
        <FormattedDuration seconds={durationSeconds} />
      </span>
    </li>
  );
}

function SetlistTable({ setlistId, sets, songsMap }: SetlistTableProps) {
  const navigate = useNavigate();

  const handleSongClick = (songId: string) => {
    if (setlistId) {
      navigate(`/setlist/${setlistId}/song/${songId}`);
    }
  };

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
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden">
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
            <div key={set.setNumber} className="border-b border-slate-800 last:border-b-0">
              {/* Set Header */}
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 backdrop-blur-sm">
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
                          onNavigate={handleSongClick}
                          song={song}
                        />
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Duration Footer */}
      <div className="border-t border-slate-800 bg-slate-900/30 px-6 py-3 text-xs font-semibold  tracking-[0.2em] text-brand-300 flex items-center justify-between">
        <span className="uppercase">Total Duration</span>
        <span className="text-lg font-bold">
          <FormattedDuration seconds={totalSeconds} />
        </span>
      </div>
    </section>
  );
}

export default SetlistTable;
