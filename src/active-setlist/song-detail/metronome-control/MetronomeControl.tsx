import { IconPlayerPlayFilled, IconPlayerStopFilled } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Output } from 'webmidi';

import { useGetTtsVoice } from '../../../api/useSettings';
import { speakText } from '../../../hooks/speakText';
import { useSequencerTransport } from '../../../hooks/useSequencerTransport';
import type { SongLanguage } from '../../../schemas';
import type { SongEvent } from '../../../types';
import { Button } from '../../../ui/Button';

const PAUSE_AFTER_ANNOUNCEMENT_MS = 500;

type MetronomeControlProps = {
  bpm?: number;
  events?: SongEvent[];
  isReady: boolean;
  isSupported: boolean;
  metronomeVolume: number;
  onBeatChange?: (beat: number, measure: number) => void;
  onStop?: () => void;
  outputs: Output[];
  preCountVolume?: number;
  songLanguage?: SongLanguage;
  songTitle?: string;
  timeSignature?: string;
};

export function MetronomeControl({
  bpm,
  events,
  isReady,
  isSupported,
  metronomeVolume,
  onBeatChange,
  onStop,
  outputs,
  preCountVolume,
  songLanguage,
  songTitle,
  timeSignature,
}: MetronomeControlProps) {
  const hasBpm = !!bpm;
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [metronomePulseKey, setMetronomePulseKey] = useState(0);
  const cancelAnnouncementRef = useRef<(() => void) | null>(null);
  const cancelCueRef = useRef<(() => void) | null>(null);
  const ttsVoiceURI = useGetTtsVoice(songLanguage ?? 'en');
  const cueVoiceURI = useGetTtsVoice('en');

  useEffect(
    () => () => {
      cancelAnnouncementRef.current?.();
      cancelCueRef.current?.();
    },
    [],
  );

  const metronomeOutput = useMemo(() => {
    if (!isSupported || !isReady || outputs.length === 0) {
      return undefined;
    }

    return outputs[0];
  }, [isReady, isSupported, outputs]);

  // Cues are always English, like the spoken count
  const handleCue = (text: string) => {
    cancelCueRef.current = speakText(text, {
      language: 'en',
      onDone: () => {},
      voiceURI: cueVoiceURI,
      volume: preCountVolume ?? 0,
    });
  };

  const { currentBeat, currentMeasure } = useSequencerTransport({
    bpm: bpm ?? 0,
    events,
    isRunning: hasBpm && isMetronomeRunning,
    metronomeVolume,
    midiOutput: metronomeOutput,
    onBeatChange,
    onCue: handleCue,
    preCountVolume: hasBpm ? preCountVolume : 0,
    timeSignature,
  });

  if (!bpm) {
    return null;
  }

  const beatDurationSeconds = 60 / bpm;
  const isActive = isMetronomeRunning || isAnnouncing;

  const startMetronome = () => {
    cancelAnnouncementRef.current = null;
    setIsAnnouncing(false);
    setIsMetronomeRunning(true);
    setMetronomePulseKey((key) => key + 1);
  };

  const handleMetronomeToggle = () => {
    if (isMetronomeRunning || isAnnouncing) {
      cancelAnnouncementRef.current?.();
      cancelAnnouncementRef.current = null;
      cancelCueRef.current?.();
      cancelCueRef.current = null;
      setIsAnnouncing(false);
      setIsMetronomeRunning(false);
      onStop?.();
      return;
    }

    // The pre count starts after the song title has been announced
    if (preCountVolume && preCountVolume > 0 && songTitle) {
      setIsAnnouncing(true);
      const cancelSpeech = speakText(songTitle, {
        language: songLanguage,
        onDone: () => {
          const timeoutId = window.setTimeout(startMetronome, PAUSE_AFTER_ANNOUNCEMENT_MS);
          cancelAnnouncementRef.current = () => window.clearTimeout(timeoutId);
        },
        voiceURI: ttsVoiceURI,
        volume: preCountVolume,
      });
      cancelAnnouncementRef.current ??= cancelSpeech;
      return;
    }

    startMetronome();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        key={metronomePulseKey}
        className="metronome-pulse"
        isIcon
        onClick={handleMetronomeToggle}
        style={{ animationDuration: `${beatDurationSeconds}s` }}
        title={isActive ? 'Stop metronome' : 'Start metronome'}
        type="button"
        variant="outlined"
      >
        {isActive ? (
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
