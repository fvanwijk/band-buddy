import { IconPlayerPlayFilled, IconPlayerStopFilled } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Output } from 'webmidi';

import { useGetCueOffsetBeats, useGetTtsVoice } from '../../../api/useSettings';
import { speakText } from '../../../hooks/speakText';
import { useLongPress } from '../../../hooks/useLongPress';
import { useSequencerTransport } from '../../../hooks/useSequencerTransport';
import type { SongLanguage } from '../../../schemas';
import type { CueEvent, SongEvent } from '../../../types';
import { Button } from '../../../ui/Button';
import { CueMenu } from './CueMenu';

const PAUSE_AFTER_ANNOUNCEMENT_MS = 500;
const TOP_NAV_HEIGHT_PX = 56;
const VISIBILITY_THRESHOLDS = Array.from({ length: 101 }, (_, index) => index / 100);

export type MetronomeControlProps = {
  bpm?: number;
  events?: SongEvent[];
  /** Element to render the play/pause button in while the inline button is scrolled out of view */
  floatingSlot?: HTMLElement | null;
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
  floatingSlot,
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
  const [inlineButtonVisibility, setInlineButtonVisibility] = useState(1);
  const [isCueMenuOpen, setIsCueMenuOpen] = useState(false);
  const [metronomePulseKey, setMetronomePulseKey] = useState(0);
  const [startPosition, setStartPosition] = useState<{ beat: number; measure: number }>();
  const inlineButtonRef = useRef<HTMLDivElement>(null);
  const cancelAnnouncementRef = useRef<(() => void) | null>(null);
  const cancelCueRef = useRef<(() => void) | null>(null);
  const ttsVoiceURI = useGetTtsVoice(songLanguage ?? 'en');
  const cueVoiceURI = useGetTtsVoice('en');
  const cueOffsetBeats = useGetCueOffsetBeats();

  useEffect(
    () => () => {
      cancelAnnouncementRef.current?.();
      cancelCueRef.current?.();
    },
    [],
  );

  useEffect(() => {
    const element = inlineButtonRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // The sticky top navigation covers the top of the viewport. The floating button fades in at the
    // same rate as the inline button disappears behind it.
    const observer = new IntersectionObserver(
      ([entry]) => setInlineButtonVisibility(entry.intersectionRatio),
      { rootMargin: `-${TOP_NAV_HEIGHT_PX}px 0px 0px 0px`, threshold: VISIBILITY_THRESHOLDS },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [hasBpm]);

  const cues = useMemo(
    () =>
      (events ?? [])
        .filter((event): event is CueEvent => event.type === 'cue')
        .toSorted((a, b) => a.measure - b.measure || a.beat - b.beat),
    [events],
  );
  const closeCueMenu = useCallback(() => setIsCueMenuOpen(false), []);
  const isActive = isMetronomeRunning || isAnnouncing;
  const { consumeLongPress, handlers: longPressHandlers } = useLongPress({
    isEnabled: hasBpm && !isActive && cues.length > 0,
    onLongPress: () => setIsCueMenuOpen(true),
  });

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
    cueOffsetBeats,
    events,
    isRunning: hasBpm && isMetronomeRunning,
    metronomeVolume,
    midiOutput: metronomeOutput,
    onBeatChange,
    onCue: handleCue,
    preCountVolume: hasBpm ? preCountVolume : 0,
    startPosition,
    timeSignature,
  });

  if (!bpm) {
    return null;
  }

  const beatDurationSeconds = 60 / bpm;

  const startMetronome = (position?: { beat: number; measure: number }) => {
    setStartPosition(position);
    cancelAnnouncementRef.current = null;
    setIsAnnouncing(false);
    setIsMetronomeRunning(true);
    setMetronomePulseKey((key) => key + 1);
  };

  // The pre count starts after the announcement has been spoken
  const announceAndStart = (
    text: string,
    options: {
      language?: SongLanguage;
      position?: { beat: number; measure: number };
      voiceURI?: string;
    },
  ) => {
    setIsAnnouncing(true);
    const cancelSpeech = speakText(text, {
      language: options.language,
      onDone: () => {
        const timeoutId = window.setTimeout(
          () => startMetronome(options.position),
          PAUSE_AFTER_ANNOUNCEMENT_MS,
        );
        cancelAnnouncementRef.current = () => window.clearTimeout(timeoutId);
      },
      voiceURI: options.voiceURI,
      volume: preCountVolume ?? 0,
    });
    cancelAnnouncementRef.current ??= cancelSpeech;
  };

  const handleCueSelect = (cue: CueEvent) => {
    const position = { beat: cue.beat, measure: cue.measure };
    setIsCueMenuOpen(false);

    // Cues are always English
    if (preCountVolume && preCountVolume > 0) {
      announceAndStart(cue.text, { language: 'en', position, voiceURI: cueVoiceURI });
      return;
    }

    startMetronome(position);
  };

  const handleMetronomeToggle = () => {
    if (consumeLongPress()) {
      return;
    }

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

    if (preCountVolume && preCountVolume > 0 && songTitle) {
      announceAndStart(songTitle, { language: songLanguage, voiceURI: ttsVoiceURI });
      return;
    }

    startMetronome();
  };

  const isFloating = inlineButtonVisibility < 1 && !!floatingSlot;

  const renderToggleButton = () => (
    <Button
      key={metronomePulseKey}
      className="metronome-pulse select-none"
      isIcon
      onClick={handleMetronomeToggle}
      style={{ animationDuration: `${beatDurationSeconds}s` }}
      title={isActive ? 'Stop metronome' : 'Start metronome, long press to start from cue'}
      type="button"
      variant="outlined"
      {...longPressHandlers}
    >
      {isActive ? (
        <IconPlayerStopFilled className="h-4 w-4" />
      ) : (
        <IconPlayerPlayFilled className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      <div ref={inlineButtonRef} className="relative">
        {renderToggleButton()}
        {isCueMenuOpen && !isActive && !isFloating && (
          <CueMenu cues={cues} onClose={closeCueMenu} onSelect={handleCueSelect} />
        )}
      </div>
      {isFloating &&
        createPortal(
          <div className="relative" style={{ opacity: 1 - inlineButtonVisibility }}>
            {renderToggleButton()}
            {isCueMenuOpen && !isActive && (
              <CueMenu
                className="right-0 left-auto"
                cues={cues}
                onClose={closeCueMenu}
                onSelect={handleCueSelect}
              />
            )}
          </div>,
          floatingSlot,
        )}
      <span className="min-w-16 text-xs font-medium text-slate-300" title="Metronome counter">
        M{currentMeasure}:B{currentBeat}
      </span>
    </div>
  );
}
