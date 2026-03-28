import { Link } from 'react-router-dom';

import type { Song } from '../types';
import { FormattedDuration } from './FormattedDuration';

type SongRowProps = {
  index: number;
  setIndex: number;
  setlistId?: string;
  song: Song;
  songIndex: number;
};

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

export function SongRow({ index, setIndex, setlistId, song, songIndex }: SongRowProps) {
  const transposeLabel = song.transpose ? formatTranspose(song.transpose) : null;
  const keyWithTranspose = [song.key, transposeLabel].filter(Boolean).join(' ');

  return (
    <li>
      <Link
        className="grid cursor-pointer grid-cols-[25px_4fr_75px] gap-4 px-6 py-2 text-sm text-slate-200 transition hover:bg-slate-900/80 sm:grid-cols-[25px_6fr_2fr_2fr_2fr]"
        to={setlistId ? `/play/${setlistId}/${setIndex}/${songIndex}` : '#'}
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
          {transposeLabel && (
            <span className="text-xs font-normal text-slate-400"> {transposeLabel}</span>
          )}
        </span>
        <span
          data-testid="song-duration"
          className="hidden text-right text-sm text-slate-400 sm:block"
        >
          {song.duration === undefined ? null : <FormattedDuration seconds={song.duration} />}
        </span>
        <span className="flex flex-col gap-0.5 text-right sm:hidden">
          <span>{[song.timeSignature, keyWithTranspose].filter(Boolean).join(' • ')}</span>
          <span className="text-xs text-slate-400">
            {song.duration === undefined ? null : <FormattedDuration seconds={song.duration} />}
          </span>
        </span>
      </Link>
    </li>
  );
}
