import { Link } from 'react-router-dom';

import { FormattedDuration } from './FormattedDuration';
import type { Song } from '../types';

type SongRowProps = {
  index: number;
  setlistId?: string;
  song: Song;
};

export function SongRow({ index, setlistId, song }: SongRowProps) {
  const durationSeconds = song.duration || 0;

  return (
    <li>
      <Link
        className="grid cursor-pointer grid-cols-[25px_4fr_75px] gap-4 px-6 py-2 text-sm text-slate-200 transition hover:bg-slate-900/80 sm:grid-cols-[25px_6fr_2fr_2fr_2fr]"
        to={setlistId ? `/setlist/${setlistId}/song/${song.id}` : '#'}
      >
        <span className="text-right text-slate-500">{index}</span>
        <span className="flex flex-col">
          <span className="text-base font-semibold text-slate-100">{song.title}</span>
          <span className="text-xs text-slate-400">{song.artist}</span>
        </span>
        <span className="hidden text-right text-sm font-semibold text-slate-100 sm:block">
          {song.timeSignature}
        </span>
        <span className="hidden text-right text-sm font-semibold text-slate-100 sm:block">
          {song.key}
        </span>
        <span className="hidden text-right text-sm text-slate-400 sm:block">
          <FormattedDuration seconds={durationSeconds} />
        </span>
        <span className="flex flex-col gap-0.5 text-right sm:hidden">
          <span>
            {song.timeSignature} • {song.key}
          </span>
          <span className="text-xs text-slate-400">
            {durationSeconds && <FormattedDuration seconds={durationSeconds} />}
          </span>
        </span>
      </Link>
    </li>
  );
}
