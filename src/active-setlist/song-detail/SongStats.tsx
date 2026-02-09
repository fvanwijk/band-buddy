import { SongStat } from './SongStat';
import type { Song } from '../../types';
import { formatDuration } from '../../utils/duration';

type SongStatsProps = {
  song: Song;
};

export function SongStats({ song }: SongStatsProps) {
  return (
    <div className="flex gap-4 text-right text-sm">
      {song.key && (
        <SongStat
          label="Key"
          value={
            <>
              {song.key}{' '}
              {!song.transpose ? (
                ''
              ) : (
                <span className="text-xs text-slate-400">
                  {song.transpose > 0 ? `+${song.transpose}` : song.transpose}
                </span>
              )}
            </>
          }
        />
      )}
      {song.timeSignature && <SongStat label="Time" value={song.timeSignature} />}
      {song.bpm && <SongStat label="BPM" value={song.bpm} />}
      {song.duration && <SongStat label="Duration" value={formatDuration(song.duration)} />}
    </div>
  );
}
