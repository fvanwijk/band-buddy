import { useCallback, useEffect, useRef } from 'react';
import { Soundfont2Sampler } from 'smplr';
import { SoundFont2 } from 'soundfont2';

import { useGetMetronomeVolume } from '../api/useSettings';

type UseMetronomeProps = {
  bpm: number;
  isRunning: boolean;
  timeSignature: string;
};

export function useMetronome({ bpm, isRunning, timeSignature }: UseMetronomeProps) {
  const volume = useGetMetronomeVolume();
  const samplerRef = useRef<Soundfont2Sampler | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beatCountRef = useRef(0);
  const nextBeatTimeRef = useRef(0);
  const schedulerIdRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);

  // Parse time signature to get beats per measure
  const [beatsPerMeasure] = timeSignature.split('/').map(Number);

  // Initialize Soundfont2Sampler with custom metronome.sf2
  useEffect(() => {
    const initSampler = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!samplerRef.current && audioContextRef.current) {
        samplerRef.current = new Soundfont2Sampler(audioContextRef.current, {
          createSoundfont: (data) => new SoundFont2(data),
          url: '/src/assets/metronome.sf2',
        });

        try {
          await samplerRef.current.load;
          // Load the first instrument available in the soundfont
          if (samplerRef.current.instrumentNames.length > 0) {
            samplerRef.current.loadInstrument(samplerRef.current.instrumentNames[0]);
            isLoadedRef.current = true;
          }
        } catch (err) {
          console.error('Failed to load metronome soundfont:', err);
        }
      }
    };

    initSampler();

    return () => {
      // Cleanup is handled on unmount
    };
  }, []);

  const playBeat = useCallback(
    (isDownbeat: boolean) => {
      if (!samplerRef.current || !isLoadedRef.current || !audioContextRef.current) return;

      // Play different notes for downbeat vs other beats
      // Downbeat: F5 (higher velocity), other beats: E5 (lower velocity)
      const note = isDownbeat ? 'F5' : 'E5';
      const velocity = isDownbeat ? 127 : 80;

      samplerRef.current.start({
        duration: 1,
        note,
        velocity: velocity * (volume / 100), // Scale velocity by volume setting
      });
    },
    [volume],
  );

  // Metronome scheduler
  useEffect(() => {
    if (!isRunning || !audioContextRef.current) {
      if (schedulerIdRef.current !== null) {
        cancelAnimationFrame(schedulerIdRef.current);
        schedulerIdRef.current = null;
      }
      return;
    }

    const beatDuration = (60 / bpm) * 1000; // Beat duration in ms
    const scheduleAhead = 100; // Schedule 100ms ahead

    const scheduler = () => {
      const now = Date.now();

      if (nextBeatTimeRef.current === 0) {
        nextBeatTimeRef.current = now;
      }

      while (nextBeatTimeRef.current - now < scheduleAhead) {
        const isDownbeat = beatCountRef.current % beatsPerMeasure === 0;
        playBeat(isDownbeat);

        beatCountRef.current = (beatCountRef.current + 1) % beatsPerMeasure;
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
  }, [isRunning, bpm, beatsPerMeasure, playBeat]);

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
