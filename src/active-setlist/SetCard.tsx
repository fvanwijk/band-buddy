import type { SetlistSetWithSongs, SetlistSong, Song } from '../types';
import { parseDuration } from '../utils/duration';
import { FormattedDuration } from './FormattedDuration';
import { SongRow } from './SongRow';

type SetCardProps = {
  set: SetlistSetWithSongs;
  setIndex: number;
  setlistId?: string;
  songStartIndex: number;
};

export function SetCard({ set, setIndex, setlistId, songStartIndex }: SetCardProps) {
  const songs = set.songs.filter(
    (song): song is Omit<SetlistSong, 'id'> & Song => 'artist' in song,
  );

  // Calculate set duration
  const setSeconds = songs.reduce((total, songRef) => {
    const duration = 'duration' in songRef ? songRef.duration : undefined;
    return total + parseDuration(duration);
  }, 0);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-3 text-xs font-semibold tracking-[0.2em] text-brand-300 uppercase">
          <span>{set.name || `Set ${setIndex + 1}`}</span>
          <span className="text-slate-400" data-testid="set-duration">
            <FormattedDuration seconds={setSeconds} />
          </span>
        </div>

        {songs.length === 0 ? (
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
              {songs.map((song, index) => (
                <SongRow
                  key={song.songId}
                  index={songStartIndex + index + 1}
                  setIndex={set.setIndex}
                  setlistId={setlistId}
                  song={song}
                  songIndex={song.songIndex}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
