import { Link } from 'react-router-dom';

import { FormattedDuration } from './FormattedDuration';
import type { Song } from '../types';
import { parseDuration } from '../utils/duration';

type SongRowProps = {
  index: number;
  setlistId?: string;
  song: Song;
};

export function SongRow({ index, setlistId, song }: SongRowProps) {
  const durationSeconds = parseDuration(song.duration);

  return (
    <li>
      <Link
        className="grid cursor-pointer gap-4 px-6 py-2 text-sm text-slate-200 transition hover:bg-slate-900/80 sm:grid-cols-[0.5fr_3fr_1fr_1fr_1fr]"
        to={setlistId ? `/setlist/${setlistId}/song/${song.id}` : '#'}
      >
        <span className="text-right text-slate-500">{index}</span>
        <span className="flex flex-col">
          <span className="text-base font-semibold text-slate-100">{song.title}</span>
          <span className="text-xs text-slate-400">{song.artist}</span>
        </span>
        <span className="text-right text-sm font-semibold text-slate-100">
          {song.timeSignature}
        </span>
        <span className="text-right text-sm font-semibold text-slate-100">{song.key}</span>
        <span className="text-right text-sm text-slate-400">
          <FormattedDuration seconds={durationSeconds} />
        </span>
      </Link>
    </li>
  );
}
