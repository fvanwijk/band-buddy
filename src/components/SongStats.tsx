import { IconMinus, IconPlus } from '@tabler/icons-react';

import { useUpdateSong } from '../hooks/useSong';
import type { Song } from '../types';
import { Button } from './Button';
import { SongStat } from './SongStat';

type SongStatsProps = {
  song: Song;
};

const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

const transposeKey = (key: string, transpose: number) => {
  if (transpose === 0) {
    return key;
  }

  const isMinor = key.endsWith('m');
  const root = isMinor ? key.slice(0, -1) : key;
  const normalizedRoot = root.replace('♭', 'b').replace('♯', '#');
  const notes = normalizedRoot.includes('b') ? flatNotes : sharpNotes;
  const rootIndex = notes.findIndex((note) => note.toLowerCase() === normalizedRoot.toLowerCase());

  if (rootIndex === -1) {
    return key;
  }

  const normalizedTranspose = ((transpose % notes.length) + notes.length) % notes.length;
  const transposedRoot = notes[(rootIndex + normalizedTranspose) % notes.length];

  return `${transposedRoot}${isMinor ? 'm' : ''}`;
};

export function SongStats({ song }: SongStatsProps) {
  const updateSong = useUpdateSong(song.id);
  const transpose = song.transpose ?? 0;

  const handleTranspose = (delta: number) => {
    updateSong({
      artist: song.artist,
      bpm: song.bpm,
      duration: song.duration,
      key: song.key,
      lyrics: song.lyrics,
      timeSignature: song.timeSignature,
      title: song.title,
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
        <span className="min-w-8 text-center text-xs text-slate-400">
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
      <SongStat label="Key" value={song.key} valueClassName="font-semibold text-brand-200" />
      <SongStat label="Time" value={song.timeSignature} />
      {song.bpm && <SongStat label="BPM" value={song.bpm} />}
      {song.duration && <SongStat label="Duration" value={song.duration} />}
    </div>
  );
}
