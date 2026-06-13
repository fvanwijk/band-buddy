import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sampler } from 'smplr';

import { useGetMetronomeVolume } from '../api/useSettings';
import hiSample from '../assets/hi.wav';
import loSample from '../assets/lo.wav';

type UseMetronomeProps = {
  bpm: number;
  isRunning: boolean;
  timeSignature: string;
};

export function useMetronome({ bpm, isRunning, timeSignature }: UseMetronomeProps) {
  const volume = useGetMetronomeVolume();
  const samplerRef = useRef<Sampler | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const samplerReadyRef = useRef(false);
  const audioBeatIndexRef = useRef(0);
  const isArmedRef = useRef(false);
  const nextBeatTimeRef = useRef(0);
  const schedulerIdRef = useRef<number | null>(null);
  const prevIsRunningRef = useRef(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentMeasure, setCurrentMeasure] = useState(0);

  // Parse time signature to get beats per measure
  const beatsPerMeasure = useMemo(() => {
    const [parsedBeats] = timeSignature.split('/').map(Number);
    if (!Number.isFinite(parsedBeats) || parsedBeats <= 0) {
      return 4;
    }

    return Math.floor(parsedBeats);
  }, [timeSignature]);

  const safeBpm = useMemo(() => {
    if (!Number.isFinite(bpm) || bpm <= 0) {
      return 120;
    }

    return bpm;
  }, [bpm]);

  // Track when isRunning changes
  useEffect(() => {
    if (isRunning && !prevIsRunningRef.current) {
      // Play pressed - arm the next beat as downbeat
      isArmedRef.current = true;
      audioBeatIndexRef.current = 0;
      setCurrentBeat(1);
      setCurrentMeasure(1);
    }
    if (!isRunning && prevIsRunningRef.current) {
      isArmedRef.current = false;
      audioBeatIndexRef.current = 0;
      nextBeatTimeRef.current = 0;
      setCurrentBeat(0);
      setCurrentMeasure(0);
    }
    prevIsRunningRef.current = isRunning;
  }, [isRunning]);

  // Initialize Sampler with custom WAV samples
  useEffect(() => {
    const initSampler = () => {
      try {
        if (!audioContextRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          audioContextRef.current = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
        }

        if (!samplerRef.current && audioContextRef.current) {
          samplerRef.current = new Sampler(audioContextRef.current, {
            buffers: {
              hi: hiSample,
              lo: loSample,
            },
          });
          samplerReadyRef.current = true;
        }
      } catch (error) {
        console.error('Failed to initialize metronome sampler', error);
        samplerReadyRef.current = false;
      }
    };

    initSampler();

    return () => {
      // Cleanup is handled on unmount
    };
  }, []);

  useEffect(() => {
    if (samplerRef.current && samplerReadyRef.current) {
      const normalizedVolume = Number.isFinite(volume) && volume !== undefined ? volume : 50;
      const clampedVolume = Math.min(100, Math.max(0, normalizedVolume));
      const scaledVolume = Math.round((clampedVolume / 100) * 127);

      if (!Number.isFinite(scaledVolume) || scaledVolume < 0 || scaledVolume > 127) {
        console.warn('Invalid volume calculated', {
          normalized: normalizedVolume,
          original: volume,
          clamped: clampedVolume,
          scaled: scaledVolume,
        });
        return;
      }

      try {
        samplerRef.current.output.setVolume(scaledVolume);
      } catch (error) {
        console.error('Failed to set metronome volume', { error, scaledVolume });
      }
    }
  }, [volume]);

  const playBeat = useCallback((isDownbeat: boolean) => {
    if (!samplerRef.current || !audioContextRef.current || !samplerReadyRef.current) return;

    const note = isDownbeat ? 'hi' : 'lo';
    const velocity = isDownbeat ? 127 : 90;

    if (!Number.isFinite(velocity) || velocity < 0 || velocity > 127) {
      console.warn('Invalid velocity calculated', { isDownbeat, velocity });
      return;
    }

    try {
      samplerRef.current.start({
        note,
        velocity,
      });
    } catch (error) {
      console.error('Failed to play metronome click', { note, error, velocity });
    }
  }, []);

  // Continuous scheduler - always running
  useEffect(() => {
    const beatDuration = (60 / safeBpm) * 1000; // Beat duration in ms
    const scheduleAhead = 100; // Schedule 100ms ahead

    if (!Number.isFinite(beatDuration) || beatDuration <= 0) {
      return;
    }

    // Initialize on first run
    if (nextBeatTimeRef.current === 0) {
      nextBeatTimeRef.current = Date.now();
    }

    const scheduler = () => {
      const now = Date.now();

      while (nextBeatTimeRef.current - now < scheduleAhead) {
        // Audio - only play if running and sampler is ready
        if (isRunning && samplerReadyRef.current) {
          let isDownbeat = false;
          if (isArmedRef.current) {
            isDownbeat = true;
            isArmedRef.current = false;
            audioBeatIndexRef.current = 1;
            setCurrentBeat(1);
            setCurrentMeasure(1);
          } else {
            isDownbeat = audioBeatIndexRef.current % beatsPerMeasure === 0;
            const beatIndexInMeasure = (audioBeatIndexRef.current % beatsPerMeasure) + 1;
            const measureNumber = Math.floor(audioBeatIndexRef.current / beatsPerMeasure) + 1;

            setCurrentBeat(beatIndexInMeasure);
            setCurrentMeasure(measureNumber);
            audioBeatIndexRef.current += 1;
          }
          playBeat(isDownbeat);
        }

        nextBeatTimeRef.current += beatDuration;
      }

      schedulerIdRef.current = requestAnimationFrame(scheduler);
    };

    schedulerIdRef.current = requestAnimationFrame(scheduler);

    return () => {
      if (schedulerIdRef.current !== null) {
        cancelAnimationFrame(schedulerIdRef.current);
        schedulerIdRef.current = null;
      }
    };
  }, [safeBpm, isRunning, beatsPerMeasure, playBeat]);

  // Resume audio context on interaction
  useEffect(() => {
    const resumeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume();
      }
    };

    document.addEventListener('click', resumeAudioContext);
    return () => document.removeEventListener('click', resumeAudioContext);
  }, []);

  return {
    currentBeat,
    currentMeasure,
  };
}
