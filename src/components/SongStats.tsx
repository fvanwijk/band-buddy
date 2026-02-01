import type { Song } from '../types';
import { SongStat } from './SongStat';

type SongStatsProps = {
  song: Song;
};

export function SongStats({ song }: SongStatsProps) {
  return (
    <div className="flex gap-4 text-right text-sm">
      <SongStat label="Key" value={song.key} valueClassName="font-semibold text-brand-200" />
      <SongStat label="Time" value={song.timeSignature} />
      {song.bpm && <SongStat label="BPM" value={song.bpm} />}
      {song.duration && <SongStat label="Duration" value={song.duration} />}
    </div>
  );
}
