import { useRef, useState } from 'react';
import type { FC, KeyboardEvent, PointerEvent } from 'react';

import { useUpdateSong } from '../../../api/useSong';
import type { Song } from '../../../types';
import { cn } from '../../../utils/cn';

type BpmStatProps = {
  bpm: number;
  song: Song;
};

const MAX_BPM = 200;
const MIN_BPM = 1;
const PIXELS_PER_STEP = 6;

const clampBpm = (bpm: number) => Math.min(MAX_BPM, Math.max(MIN_BPM, bpm));

export const BpmStat: FC<BpmStatProps> = ({ bpm, song }) => {
  const updateSong = useUpdateSong(song.id);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ lastBpm: number; startBpm: number; startY: number } | null>(null);

  const saveBpm = (newBpm: number) => {
    updateSong({ ...song, bpm: newBpm });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { lastBpm: bpm, startBpm: bpm, startY: event.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    const steps = Math.round((drag.startY - event.clientY) / PIXELS_PER_STEP);
    const newBpm = clampBpm(drag.startBpm + steps);
    if (newBpm !== drag.lastBpm) {
      drag.lastBpm = newBpm;
      saveBpm(newBpm);
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    const newBpm = clampBpm(bpm + (event.key === 'ArrowUp' ? 1 : -1));
    if (newBpm !== bpm) {
      saveBpm(newBpm);
    }
  };

  return (
    <div
      aria-label="BPM"
      aria-valuemax={MAX_BPM}
      aria-valuemin={MIN_BPM}
      aria-valuenow={bpm}
      className="group cursor-ns-resize touch-none select-none"
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      role="spinbutton"
      tabIndex={0}
      title="Drag up or down to change the BPM"
    >
      <p className="text-xs text-slate-500">BPM</p>
      <p
        className={cn(
          'font-semibold transition-colors',
          isDragging ? 'text-brand-400' : 'text-slate-100 group-hover:text-brand-300',
        )}
      >
        {bpm}
      </p>
    </div>
  );
};
