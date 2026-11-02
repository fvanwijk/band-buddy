import type { FC } from 'react';

import { useUpdateSong } from '../../../api/useSong';
import type { Song } from '../../../types';
import { DraggableStat } from '../draggable-stat/DraggableStat';

type KeyStatProps = {
  keyName: string;
  song: Song;
};

const PIXELS_PER_SEMITONE = 24;

export const KeyStat: FC<KeyStatProps> = ({ keyName, song }) => {
  const updateSong = useUpdateSong(song.id);
  const transpose = song.transpose ?? 0;

  return (
    <DraggableStat
      ariaLabel="Transpose"
      label="Key"
      onChange={(newTranspose) => updateSong({ ...song, transpose: newTranspose })}
      pixelsPerStep={PIXELS_PER_SEMITONE}
      title="Drag up or down to transpose"
      value={transpose}
    >
      {keyName}{' '}
      {transpose !== 0 && (
        <span className="text-xs text-slate-400">
          {transpose > 0 ? `+${transpose}` : transpose}
        </span>
      )}
    </DraggableStat>
  );
};
