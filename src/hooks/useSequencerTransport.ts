import { useCallback, useEffect, useRef, useState } from 'react';
import type { Output } from 'webmidi';

import { registerOutboundMidiMessage } from '../midi/midiEventLogBus';
import { buildSongMap } from '../song-events/songMap';
import { createSongTransport, CUE_LEAD_MS, POLL_INTERVAL_MS } from '../song-events/songTransport';
import type { ClickAccent, TransportOutput } from '../song-events/songTransport';
import type { SongEvent } from '../types';
import type { MidiNoteEvent } from '../vendor/signal-player';
import { loadPreCountBuffers } from './preCount';
import type { PreCountWord } from './preCount';

export interface UseSequencerTransportProps {
  /** BPM (beats per minute) at the start of the song */
  bpm: number;
  /** Tempo changes, time signature changes and cues of the song */
  events?: SongEvent[];
  /** Time signature at the start of the song (e.g., "4/4") */
  timeSignature?: string;
  /** Whether playback is running */
  isRunning: boolean;
  /** MIDI output device to send clicks to */
  midiOutput?: Output;
  /** MIDI channel (1-16, default 10 for drums) */
  midiChannel?: number;
  /** MIDI note number for clicks (default 36 = kick drum) */
  midiNote?: number;
  /** Metronome volume (0-100, default 50) */
  metronomeVolume?: number;
  /**
   * Volume (0-100) of the spoken two measure count-in before the song starts and of the spoken
   * count-ins and cues during the song, 0 disables them
   */
  preCountVolume?: number;
  /** Callback when beat changes */
  onBeatChange?: (beat: number, measure: number) => void;
  /** Callback to speak the text of a cue, called slightly before the cue's beat */
  onCue?: (text: string) => void;
}

export interface UseSequencerTransportResult {
  /** Current beat (1-based within measure) */
  currentBeat: number;
  /** Current measure (1-based) */
  currentMeasure: number;
}

const DEFAULT_MIDI_CHANNEL = 10; // Channel 10 = drums in MIDI
const DEFAULT_MIDI_NOTE = 36; // Kick drum
const DOWNBEAT_VELOCITY = 127;
const SECONDARY_ACCENT_VELOCITY = 108;
const REGULAR_BEAT_VELOCITY = 90;
const CLICK_VELOCITIES: Record<ClickAccent, number> = {
  downbeat: DOWNBEAT_VELOCITY,
  regular: REGULAR_BEAT_VELOCITY,
  secondary: SECONDARY_ACCENT_VELOCITY,
};
// Events closer than this are played right away instead of through a timeout
const IMMEDIATE_THRESHOLD_MS = 10;

/**
 * Metronome playback: clicks (audio and MIDI), the spoken count-in and cues of a song, including
 * its tempo and time signature changes. The timing is done by createSongTransport, this hook
 * plays what it schedules.
 */
export function useSequencerTransport({
  bpm,
  events,
  isRunning,
  midiChannel = DEFAULT_MIDI_CHANNEL,
  midiNote = DEFAULT_MIDI_NOTE,
  metronomeVolume = 50,
  midiOutput,
  preCountVolume = 0,
  timeSignature,
  onBeatChange,
  onCue,
}: UseSequencerTransportProps): UseSequencerTransportResult {
  const pendingTimeoutsRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const preCountBuffersRef = useRef<Record<PreCountWord, AudioBuffer> | null>(null);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentMeasure, setCurrentMeasure] = useState(0);

  // Validate and clamp parameters
  const safeBpm = Math.max(1, Math.min(300, Math.round(bpm)));
  const safeChannel = Math.max(1, Math.min(16, Math.round(midiChannel)));
  const safeNote = Math.max(0, Math.min(127, Math.round(midiNote)));
  const safeVolume = Math.max(0, Math.min(100, Math.round(metronomeVolume)));
  const safePreCountVolume = Math.max(0, Math.min(100, Math.round(preCountVolume)));

  const clearPendingTimeouts = useCallback(() => {
    for (const timeoutId of pendingTimeoutsRef.current) {
      clearTimeout(timeoutId);
    }
    pendingTimeoutsRef.current = [];
  }, []);

  const runAfter = useCallback((callback: () => void, delayMs: number) => {
    if (delayMs < IMMEDIATE_THRESHOLD_MS) {
      callback();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(
        (scheduledTimeoutId) => scheduledTimeoutId !== timeoutId,
      );
      callback();
    }, delayMs);

    pendingTimeoutsRef.current.push(timeoutId);
  }, []);

  const playPreCountWord = useCallback(
    (word: PreCountWord, delayMs: number) => {
      const buffer = preCountBuffersRef.current?.[word];
      const ctx = audioContextRef.current;
      if (!buffer || !ctx || safePreCountVolume <= 0) {
        return;
      }

      try {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = buffer;
        gain.gain.value = safePreCountVolume / 100;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(ctx.currentTime + delayMs / 1000);
      } catch (error) {
        console.error('Failed to play pre count word', { error });
      }
    },
    [safePreCountVolume],
  );

  // Send MIDI note event and play audio click
  const sendMidiNote = useCallback(
    (event: MidiNoteEvent) => {
      // Play audio click using Web Audio API
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      const playAudioClick = () => {
        try {
          const volumeFactor = safeVolume / 100;
          if (volumeFactor <= 0) {
            return;
          }

          // Create audio click using oscillator
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Downbeat: 1000 Hz, 6/8 secondary accent: 900 Hz, regular beat: 800 Hz
          osc.frequency.value =
            event.velocity >= DOWNBEAT_VELOCITY
              ? 1000
              : event.velocity >= SECONDARY_ACCENT_VELOCITY
                ? 900
                : 800;
          osc.type = 'sine';

          // Envelope: quick attack and decay
          gain.gain.setValueAtTime(0.3 * volumeFactor, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
        } catch (error) {
          console.error('Failed to play audio click', { error });
        }
      };

      if (ctx.state === 'suspended') {
        void ctx
          .resume()
          .then(() => {
            playAudioClick();
          })
          .catch((error: unknown) => {
            console.error('Failed to resume audio context', { error });
          });
      } else {
        playAudioClick();
      }

      // Send MIDI note event (if device available)
      if (!midiOutput) return;

      try {
        const noteOnData = [0x90 + (event.channel - 1), event.note, event.velocity];

        // Send note on with attack (velocity is deprecated)
        midiOutput.sendNoteOn(event.note, {
          attack: (event.velocity / 127) * (safeVolume / 100), // 0-1 range
          channels: event.channel,
          time: performance.now() / 1000,
        });
        registerOutboundMidiMessage({
          channels: [event.channel],
          data: noteOnData,
          deviceId: midiOutput.id,
          deviceName: midiOutput.name,
          emitLogEntry: false,
          source: 'sequencer',
          type: 'noteOn',
          value: event.note,
        });

        // Schedule note off
        if (event.duration) {
          const noteOffData = [0x80 + (event.channel - 1), event.note, 0];
          const noteOffTime = (performance.now() + event.duration) / 1000;
          midiOutput.sendNoteOff(event.note, {
            channels: event.channel,
            time: noteOffTime,
          });
          registerOutboundMidiMessage({
            channels: [event.channel],
            data: noteOffData,
            deviceId: midiOutput.id,
            deviceName: midiOutput.name,
            emitLogEntry: false,
            source: 'sequencer',
            timestamp: Date.now() + event.duration,
            type: 'noteOff',
            value: event.note,
          });
        }
      } catch (error) {
        console.error('Failed to send MIDI note', { error, event });
      }
    },
    [midiOutput, safeVolume],
  );

  const playClick = useCallback(
    (accent: ClickAccent) => {
      sendMidiNote({
        channel: safeChannel,
        duration: 50,
        note: safeNote,
        tick: 0,
        type: 'note',
        velocity: CLICK_VELOCITIES[accent],
      });
    },
    [safeChannel, safeNote, sendMidiNote],
  );

  // The playback loop lives as long as a run does, so it reads the latest props through a ref.
  // Settings that only apply when a run starts (like the tempo) aren't picked up while running.
  const latestRef = useRef({
    bpm: safeBpm,
    events,
    onBeatChange,
    onCue,
    playClick,
    playPreCountWord,
    preCountVolume: safePreCountVolume,
    timeSignature,
  });
  latestRef.current = {
    bpm: safeBpm,
    events,
    onBeatChange,
    onCue,
    playClick,
    playPreCountWord,
    preCountVolume: safePreCountVolume,
    timeSignature,
  };

  const handleOutput = useCallback(
    (output: TransportOutput) => {
      const delayMs = Math.max(0, output.timestamp - performance.now());

      switch (output.type) {
        case 'click': {
          runAfter(() => latestRef.current.playClick(output.accent), delayMs);

          if (output.position) {
            const { beat, measure } = output.position;
            setCurrentMeasure(measure);
            setCurrentBeat(beat);
            latestRef.current.onBeatChange?.(beat, measure);
          }
          break;
        }
        case 'countWord':
          latestRef.current.playPreCountWord(output.word, delayMs);
          break;
        case 'cue':
          if (latestRef.current.preCountVolume > 0) {
            runAfter(() => latestRef.current.onCue?.(output.text), delayMs - CUE_LEAD_MS);
          }
          break;
      }
    },
    [runAfter],
  );

  useEffect(() => {
    if (preCountVolume <= 0) {
      return;
    }

    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    loadPreCountBuffers(audioContextRef.current)
      .then((buffers) => {
        preCountBuffersRef.current = buffers;
      })
      .catch((error: unknown) => {
        console.error('Failed to load pre count samples', { error });
      });
  }, [preCountVolume]);

  // One run of the metronome, from start to stop
  useEffect(() => {
    if (!isRunning) {
      setCurrentBeat(0);
      setCurrentMeasure(0);
      return;
    }

    const latest = latestRef.current;
    // The spoken parts are fixed when playback starts so toggling them mid-song has no effect
    const transport = createSongTransport({
      events: latest.events,
      isSpokenEnabled: latest.preCountVolume > 0,
      map: buildSongMap({
        bpm: latest.bpm,
        events: latest.events,
        timeSignature: latest.timeSignature,
      }),
      startWall: performance.now(),
    });

    const poll = () => {
      try {
        for (const output of transport.poll(performance.now())) {
          handleOutput(output);
        }
      } catch (error) {
        console.error('Sequencer timer error', error);
      }
    };

    poll();
    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      clearPendingTimeouts();
    };
  }, [clearPendingTimeouts, handleOutput, isRunning]);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const resumeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume();
      }
    };

    document.addEventListener('click', resumeAudioContext);

    return () => {
      document.removeEventListener('click', resumeAudioContext);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => clearPendingTimeouts, [clearPendingTimeouts]);

  return {
    currentBeat,
    currentMeasure,
  };
}
