import { IconMinus, IconPlus } from '@tabler/icons-react';

import { SongStat } from './SongStat';
import { useUpdateSong } from '../../api/useSong';
import type { Song } from '../../types';
import { Button } from '../../ui/Button';
import { cn } from '../../utils/cn';

type SongStatsProps = {
  song: Song;
};

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

export function SongStats({ song }: SongStatsProps) {
  const updateSong = useUpdateSong(song.id);
  const transpose = song.transpose ?? 0;

  const handleTranspose = (delta: number) => {
    updateSong({
      ...song,
      transpose: transpose + delta,
    });
  };

  return (
    <div className="flex gap-4 text-right text-sm">
      <div className="bg-slate-900 rounded-full p-1 flex items-center gap-2">
        <Button
          aria-label="Transpose down"
          className="h-7 w-7 text-xs"
          icon
          onClick={() => handleTranspose(-1)}
          type="button"
          variant="ghost"
        >
          <IconMinus className="h-4 w-4" />
        </Button>
        <span
          className={cn(
            'min-w-8 text-center text-xs',
            transpose !== 0 ? 'text-brand-200 font-semibold' : 'text-slate-400',
          )}
        >
          {formatTranspose(transpose)}
        </span>
        <Button
          aria-label="Transpose up"
          className="h-7 w-7 text-xs"
          icon
          onClick={() => handleTranspose(1)}
          type="button"
          variant="ghost"
        >
          <IconPlus className="h-4 w-4" />
        </Button>
      </div>
      <SongStat label="Key" value={song.key} />
      <SongStat label="Time" value={song.timeSignature} />
      {song.bpm && <SongStat label="BPM" value={song.bpm} />}
      {song.duration && <SongStat label="Duration" value={song.duration} />}
    </div>
  );
}
