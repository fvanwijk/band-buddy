import * as Slider from '@radix-ui/react-slider';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { useState } from 'react';
import type { FC } from 'react';

import { Button } from '../../../ui/Button';
import { formatDurationToString } from '../../../utils/duration';
import { useSpotifyPlayback } from './useSpotifyPlayback';

type SpotifyPlayerProps = {
  durationSeconds?: number;
  spotifyId: string;
};

const SEEK_STEP_MS = 1000;

export const SpotifyPlayer: FC<SpotifyPlayerProps> = ({ durationSeconds, spotifyId }) => {
  const { durationMs, errorMessage, isBusy, isPlaying, isReady, positionMs, seek, toggle } =
    useSpotifyPlayback(spotifyId, durationSeconds ? durationSeconds * 1000 : undefined);
  const [scrubMs, setScrubMs] = useState<number | null>(null);

  const displayedMs = scrubMs ?? positionMs;

  return (
    <div className="border-t border-slate-800 px-4 py-2">
      <div className="flex items-center gap-3">
        <Button
          color="primary"
          disabled={isBusy || !isReady}
          isIcon
          onClick={() => void toggle()}
          title={isPlaying ? 'Pause Spotify' : 'Play on Spotify'}
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
          disabled={isBusy || !isReady || durationMs <= 0}
          max={durationMs}
          min={0}
          onValueChange={([value]) => setScrubMs(value)}
          onValueCommit={([value]) => {
            setScrubMs(null);
            void seek(value);
          }}
          step={SEEK_STEP_MS}
          value={[Math.min(displayedMs, durationMs)]}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-slate-800">
            <Slider.Range className="absolute h-full rounded-full bg-brand-400" />
          </Slider.Track>
          <Slider.Thumb
            aria-label="Song progress"
            className="block h-4 w-4 rounded-full bg-slate-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          />
        </Slider.Root>
        <span className="w-10 shrink-0 text-xs text-slate-400 tabular-nums">
          {formatDurationToString(Math.floor(durationMs / 1000))}
        </span>
      </div>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
