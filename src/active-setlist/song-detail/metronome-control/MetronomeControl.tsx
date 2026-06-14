import { IconPlayerPlayFilled, IconPlayerStopFilled } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import type { Output } from 'webmidi';

import { useSequencerTransport } from '../../../hooks/useSequencerTransport';
import { Button } from '../../../ui/Button';

type MetronomeControlProps = {
  bpm?: number;
  isReady: boolean;
  isSupported: boolean;
  metronomeVolume: number;
  onBeatChange?: (beat: number, measure: number) => void;
  onStop?: () => void;
  outputs: Output[];
  timeSignature?: string;
};

export function MetronomeControl({
  bpm,
  isReady,
  isSupported,
  metronomeVolume,
  onBeatChange,
  onStop,
  outputs,
  timeSignature,
}: MetronomeControlProps) {
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);
  const [metronomePulseKey, setMetronomePulseKey] = useState(0);

  if (!bpm) {
    return null;
  }

  const timeSignatureNumerator = useMemo(() => {
    const [numerator] = (timeSignature || '4/4').split('/').map(Number);
    return Number.isFinite(numerator) && numerator > 0 ? numerator : 4;
  }, [timeSignature]);

  const metronomeOutput = useMemo(() => {
    if (!isSupported || !isReady || outputs.length === 0) {
      return undefined;
    }

    return outputs[0];
  }, [isReady, isSupported, outputs]);

  const { currentBeat, currentMeasure } = useSequencerTransport({
    bpm,
    isRunning: isMetronomeRunning,
    metronomeVolume,
    midiOutput: metronomeOutput,
    onBeatChange,
    timeSignatureNumerator,
  });

  const beatDurationSeconds = 60 / bpm;

  const handleMetronomeToggle = () => {
    setIsMetronomeRunning((prev) => {
      const next = !prev;

      if (next) {
        setMetronomePulseKey((key) => key + 1);
      } else {
        onStop?.();
      }

      return next;
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        key={metronomePulseKey}
        className="metronome-pulse"
        isIcon
        onClick={handleMetronomeToggle}
        style={{ animationDuration: `${beatDurationSeconds}s` }}
        title={isMetronomeRunning ? 'Stop metronome' : 'Start metronome'}
        type="button"
        variant="outlined"
      >
        {isMetronomeRunning ? (
          <IconPlayerStopFilled className="h-4 w-4" />
        ) : (
          <IconPlayerPlayFilled className="h-4 w-4" />
        )}
      </Button>
      <span className="min-w-16 text-xs font-medium text-slate-300" title="Metronome counter">
        M{currentMeasure}:B{currentBeat}
      </span>
    </div>
  );
}
