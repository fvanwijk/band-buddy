import { useCallback, useEffect, useRef, useState } from 'react';
import type { Output } from 'webmidi';

import { EventScheduler } from '../vendor/signal-player';
import type { SchedulerEvent, MidiNoteEvent } from '../vendor/signal-player';

export interface UseSequencerTransportProps {
  /** BPM (beats per minute) */
  bpm: number;
  /** Time signature numerator (e.g., 4 for 4/4) */
  timeSignatureNumerator: number;
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
  /** Callback when beat changes */
  onBeatChange?: (beat: number, measure: number) => void;
}

export interface UseSequencerTransportResult {
  /** Current beat (1-based within measure) */
  currentBeat: number;
  /** Current measure (1-based) */
  currentMeasure: number;
}

const TIMER_INTERVAL = 50; // 50ms update interval
const LOOK_AHEAD_TIME = 50; // 50ms lookahead for scheduling
const TIMEBASE = 480; // Ticks per quarter note
const DEFAULT_MIDI_CHANNEL = 10; // Channel 10 = drums in MIDI
const DEFAULT_MIDI_NOTE = 36; // Kick drum

/**
 * Sequencer transport hook using EventScheduler for accurate metronome timing
 * Replaces smplr-based sample playback with MIDI note events
 */
export function useSequencerTransport({
  bpm,
  isRunning,
  midiChannel = DEFAULT_MIDI_CHANNEL,
  midiNote = DEFAULT_MIDI_NOTE,
  metronomeVolume = 50,
  midiOutput,
  timeSignatureNumerator,
  onBeatChange,
}: UseSequencerTransportProps): UseSequencerTransportResult {
  const schedulerRef = useRef<EventScheduler<SchedulerEvent> | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pendingTimeoutsRef = useRef<number[]>([]);
  const lastProcessedTickRef = useRef(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentMeasure, setCurrentMeasure] = useState(0);

  // Validate and clamp parameters
  const safeBpm = Math.max(1, Math.min(300, Math.round(bpm)));
  const safeBeats = Math.max(1, Math.min(16, Math.round(timeSignatureNumerator)));
  const safeChannel = Math.max(1, Math.min(16, Math.round(midiChannel)));
  const safeNote = Math.max(0, Math.min(127, Math.round(midiNote)));
  const safeVolume = Math.max(0, Math.min(100, Math.round(metronomeVolume)));

  const clearPendingTimeouts = useCallback(() => {
    for (const timeoutId of pendingTimeoutsRef.current) {
      clearTimeout(timeoutId);
    }
    pendingTimeoutsRef.current = [];
  }, []);

  // Create event source that repeats metronome pattern
  const getEventsInRange = useCallback(
    (startTick: number, endTick: number): SchedulerEvent[] => {
      const firstBeatTick = Math.ceil(startTick / TIMEBASE) * TIMEBASE;
      const events: SchedulerEvent[] = [];

      // Generate events aligned to the global beat grid
      for (let tick = firstBeatTick; tick < endTick; tick += TIMEBASE) {
        const beatNumber = Math.round(tick / TIMEBASE);
        const beatInMeasure = beatNumber % safeBeats;
        const isDownbeat = beatInMeasure === 0;

        events.push({
          channel: safeChannel,
          duration: 50,
          note: safeNote,
          tick,
          type: 'note',
          velocity: isDownbeat ? 127 : 90,
        } as MidiNoteEvent);
      }

      return events;
    },
    [safeBeats, safeChannel, safeNote],
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

          // Downbeat: higher pitch (1000 Hz), regular beat: lower (800 Hz)
          osc.frequency.value = event.velocity > 100 ? 1000 : 800;
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
        // Send note on with attack (velocity is deprecated)
        midiOutput.sendNoteOn(event.note, {
          attack: (event.velocity / 127) * (safeVolume / 100), // 0-1 range
          channels: event.channel,
          time: performance.now() / 1000,
        });

        // Schedule note off
        if (event.duration) {
          const noteOffTime = (performance.now() + event.duration) / 1000;
          midiOutput.sendNoteOff(event.note, {
            channels: event.channel,
            time: noteOffTime,
          });
        }
      } catch (error) {
        console.error('Failed to send MIDI note', { error, event });
      }
    },
    [midiOutput, safeVolume],
  );

  // Initialize scheduler
  useEffect(() => {
    if (!isRunning) {
      clearPendingTimeouts();
      schedulerRef.current?.seek(0);
      lastProcessedTickRef.current = -1;
      setCurrentBeat(0);
      setCurrentMeasure(0);
      return;
    }

    lastProcessedTickRef.current = -1;

    if (schedulerRef.current === null) {
      schedulerRef.current = new EventScheduler<SchedulerEvent>(
        getEventsInRange,
        () => [], // No loop end events needed for metronome
        0, // Start at tick 0
        TIMEBASE,
        LOOK_AHEAD_TIME,
      );
    }

    return () => {
      // Keep scheduler alive across renders, only clean up on unmount
    };
  }, [clearPendingTimeouts, isRunning, getEventsInRange]);

  // Main playback timer
  useEffect(() => {
    if (!isRunning || !schedulerRef.current) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearPendingTimeouts();
      return;
    }

    const timer = () => {
      if (!schedulerRef.current) return;

      try {
        // Read scheduled events
        const events = schedulerRef.current.readNextEvents(safeBpm, performance.now());

        // Process and send MIDI events
        for (const { event, timestamp } of events) {
          if (event.type === 'note') {
            // Skip if we've already processed this event (deduplication)
            if (event.tick <= lastProcessedTickRef.current) {
              continue;
            }

            // Calculate delay for scheduling
            const delayMs = Math.max(0, timestamp - performance.now());

            // Send immediately or schedule for later
            if (delayMs < 10) {
              sendMidiNote(event);
            } else {
              const timeoutId = window.setTimeout(() => {
                pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(
                  (scheduledTimeoutId) => scheduledTimeoutId !== timeoutId,
                );
                sendMidiNote(event);
              }, delayMs);

              pendingTimeoutsRef.current.push(timeoutId);
            }

            // Update beat/measure tracking
            const measureTicks = safeBeats * TIMEBASE;
            const measureIndex = Math.floor(event.tick / measureTicks);
            const beatIndex = (event.tick % measureTicks) / TIMEBASE;

            setCurrentMeasure(measureIndex + 1);
            setCurrentBeat(Math.floor(beatIndex) + 1);

            onBeatChange?.(Math.floor(beatIndex) + 1, measureIndex + 1);

            // Mark this event as processed
            lastProcessedTickRef.current = event.tick;
          }
        }
      } catch (error) {
        console.error('Sequencer timer error', error);
      }
    };

    intervalRef.current = window.setInterval(timer, TIMER_INTERVAL);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [clearPendingTimeouts, isRunning, safeBpm, safeBeats, sendMidiNote, onBeatChange]);

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
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      clearPendingTimeouts();
      schedulerRef.current = null;
    };
  }, [clearPendingTimeouts]);

  return {
    currentBeat,
    currentMeasure,
  };
}
