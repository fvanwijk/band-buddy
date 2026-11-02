import type { FC } from 'react';

import { useUpdateSong } from '../../../api/useSong';
import type { Song } from '../../../types';
import { DraggableStat } from '../draggable-stat/DraggableStat';

type BpmStatProps = {
  bpm: number;
  song: Song;
};

const MAX_BPM = 200;
const MIN_BPM = 1;

export const BpmStat: FC<BpmStatProps> = ({ bpm, song }) => {
  const updateSong = useUpdateSong(song.id);

  return (
    <DraggableStat
      label="BPM"
      max={MAX_BPM}
      min={MIN_BPM}
      onChange={(newBpm) => updateSong({ ...song, bpm: newBpm })}
      title="Drag up or down to change the BPM"
      value={bpm}
    />
  );
};
