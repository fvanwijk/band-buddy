import { useCallback, useEffect, useRef } from 'react';
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
  const beatCountRef = useRef(0);
  const audioBeatIndexRef = useRef(0);
  const isArmedRef = useRef(false);
  const nextBeatTimeRef = useRef(0);
  const schedulerIdRef = useRef<number | null>(null);
  const prevIsRunningRef = useRef(false);

  // Parse time signature to get beats per measure
  const [beatsPerMeasure] = timeSignature.split('/').map(Number);

  // Track when isRunning changes
  useEffect(() => {
    if (isRunning && !prevIsRunningRef.current) {
      // Play pressed - arm the next beat as downbeat
      isArmedRef.current = true;
      audioBeatIndexRef.current = 0;
    }
    if (!isRunning && prevIsRunningRef.current) {
      isArmedRef.current = false;
    }
    prevIsRunningRef.current = isRunning;
  }, [isRunning, beatsPerMeasure]);

  // Initialize Sampler with custom WAV samples
  useEffect(() => {
    const initSampler = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!samplerRef.current && audioContextRef.current) {
        samplerRef.current = new Sampler(audioContextRef.current, {
          buffers: {
            hi: hiSample,
            lo: loSample,
          },
        });
      }
    };

    initSampler();

    return () => {
      // Cleanup is handled on unmount
    };
  }, []);

  useEffect(() => {
    if (samplerRef.current) {
      samplerRef.current.output.setVolume(Math.round((volume / 100) * 127));
    }
  }, [volume]);

  const playBeat = useCallback((isDownbeat: boolean) => {
    if (!samplerRef.current || !audioContextRef.current) return;

    const note = isDownbeat ? 'hi' : 'lo';
    const velocity = isDownbeat ? 127 : 90;

    samplerRef.current.start({
      note,
      velocity,
    });
  }, []);

  // Continuous scheduler - always running
  useEffect(() => {
    const beatDuration = (60 / bpm) * 1000; // Beat duration in ms
    const scheduleAhead = 100; // Schedule 100ms ahead

    // Initialize on first run
    if (nextBeatTimeRef.current === 0) {
      nextBeatTimeRef.current = Date.now();
    }

    const scheduler = () => {
      const now = Date.now();

      while (nextBeatTimeRef.current - now < scheduleAhead) {
        // Audio - only play if running
        if (isRunning) {
          let isDownbeat = false;
          if (isArmedRef.current) {
            isDownbeat = true;
            isArmedRef.current = false;
            audioBeatIndexRef.current = 1;
          } else {
            isDownbeat = audioBeatIndexRef.current % beatsPerMeasure === 0;
            audioBeatIndexRef.current += 1;
          }
          playBeat(isDownbeat);
        }

        beatCountRef.current += 1;
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
  }, [bpm, isRunning, beatsPerMeasure, playBeat]);

  // Resume audio context on interaction
  useEffect(() => {
    const resumeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    document.addEventListener('click', resumeAudioContext);
    return () => document.removeEventListener('click', resumeAudioContext);
  }, []);
}
