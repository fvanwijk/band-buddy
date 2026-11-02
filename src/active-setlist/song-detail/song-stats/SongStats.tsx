import type { Song } from '../../../types';
import { formatDuration } from '../../../utils/duration';
import { BpmStat } from '../bpm-stat/BpmStat';
import { KeyStat } from '../key-stat/KeyStat';
import { SongStat } from '../song-stat/SongStat';

type SongStatsProps = {
  song: Song;
};

export function SongStats({ song }: SongStatsProps) {
  return (
    <div className="flex gap-4 text-right text-sm" data-testid="song-stats">
      {song.bpm && <BpmStat bpm={song.bpm} song={song} />}
      {song.timeSignature && <SongStat label="Time" value={song.timeSignature} />}
      {song.duration && <SongStat label="Duration" value={formatDuration(song.duration)} />}
      {song.key && <KeyStat keyName={song.key} song={song} />}
    </div>
  );
}
