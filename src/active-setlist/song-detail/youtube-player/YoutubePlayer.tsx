import * as Slider from '@radix-ui/react-slider';
import { IconBrandYoutube, IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { useState } from 'react';
import type { FC } from 'react';

import { Button } from '../../../ui/Button';
import { formatDurationToString } from '../../../utils/duration';
import { VolumeControl } from '../volume-control/VolumeControl';
import { useYoutubePlayback } from './useYoutubePlayback';

type YoutubePlayerProps = {
  durationSeconds?: number;
  youtubeId: string;
};

const SEEK_STEP_MS = 1000;

export const YoutubePlayer: FC<YoutubePlayerProps> = ({ durationSeconds, youtubeId }) => {
  const {
    containerRef,
    durationMs,
    errorMessage,
    isPlaying,
    isReady,
    positionMs,
    seek,
    setVolume,
    toggle,
    volume,
  } = useYoutubePlayback(youtubeId, durationSeconds ? durationSeconds * 1000 : undefined);
  const [scrubMs, setScrubMs] = useState<number | null>(null);

  const displayedMs = scrubMs ?? positionMs;

  return (
    <div className="border-t border-slate-800 px-4 py-2">
      {/* Kept in the layout but invisible: the video is never shown, only its audio is played */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        ref={containerRef}
      />
      <div className="flex items-center gap-3">
        <VolumeControl label="YouTube" onChange={setVolume} volume={volume} />
        <Button
          color="primary"
          disabled={!isReady}
          isIcon
          onClick={toggle}
          title={isPlaying ? 'Pause YouTube' : 'Play on YouTube'}
          type="button"
          variant="outlined"
        >
          {isPlaying ? (
            <IconPlayerPauseFilled className="h-4 w-4" />
          ) : (
            <IconPlayerPlayFilled className="h-4 w-4" />
          )}
        </Button>
        <span className="w-10 shrink-0 text-right text-xs text-slate-400 tabular-nums">
          {formatDurationToString(Math.floor(displayedMs / 1000))}
        </span>
        <Slider.Root
          className="relative flex h-5 min-w-0 flex-1 touch-none items-center select-none"
          disabled={!isReady || durationMs <= 0}
          max={durationMs}
          min={0}
          onValueChange={([value]) => setScrubMs(value)}
          onValueCommit={([value]) => {
            setScrubMs(null);
            seek(value);
          }}
          step={SEEK_STEP_MS}
          value={[Math.min(displayedMs, durationMs)]}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-slate-800">
            <Slider.Range className="absolute h-full rounded-full bg-brand-400" />
          </Slider.Track>
          <Slider.Thumb
            aria-label="YouTube progress"
            className="block h-4 w-4 rounded-full bg-slate-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          />
        </Slider.Root>
        <span className="w-10 shrink-0 text-xs text-slate-400 tabular-nums">
          {formatDurationToString(Math.floor(durationMs / 1000))}
        </span>
        <IconBrandYoutube aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" />
      </div>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
