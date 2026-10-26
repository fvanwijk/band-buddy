import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import {
  createCueEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import { CUE_LEAD_MS } from '../song-events/songTransport';
import { useSequencerTransport } from './useSequencerTransport';
import type { UseSequencerTransportProps } from './useSequencerTransport';

// Browser audio isn't available in jsdom
class AudioContextStub {
  currentTime = 0;
  destination = {};
  state = 'running';
  createBufferSource = () => ({ buffer: null, connect: vi.fn(), start: vi.fn() });
  createGain = () => ({ connect: vi.fn(), gain: { value: 1 } });
  createOscillator = () => ({
    connect: vi.fn(),
    frequency: { value: 0 },
    start: vi.fn(),
    stop: vi.fn(),
    type: 'sine',
  });
  decodeAudioData = () => Promise.resolve({});
  resume = () => Promise.resolve();
}

describe('useSequencerTransport', () => {
  const onBeatChange = vi.fn();
  const onCue = vi.fn();

  const renderTransport = (props: Partial<UseSequencerTransportProps> = {}) =>
    renderHook(
      (hookProps: Partial<UseSequencerTransportProps>) =>
        useSequencerTransport({
          bpm: 120,
          isRunning: true,
          metronomeVolume: 0,
          onBeatChange,
          onCue,
          timeSignature: '4/4',
          ...hookProps,
        }),
      { initialProps: props },
    );

  const advance = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', AudioContextStub);
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) })),
    );
    onBeatChange.mockClear();
    onCue.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports the beats of a song', () => {
    renderTransport();
    advance(2100);

    expect(onBeatChange.mock.calls).toEqual([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [1, 2],
    ]);
  });

  it('follows tempo and time signature changes', () => {
    const { result } = renderTransport({
      bpm: 60,
      events: [
        createTempoChangeEvent({ bpm: 120, measure: 2 }),
        createTimeSignatureChangeEvent({ measure: 2, timeSignature: '3/4' }),
      ],
    });
    advance(4000 + 1600);

    expect(onBeatChange.mock.calls.slice(3)).toEqual([
      [4, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [1, 3],
    ]);
    expect(result.current).toEqual({ currentBeat: 1, currentMeasure: 3 });
  });

  it('only counts in and speaks cues when the pre count is on', () => {
    renderTransport({ events: [createCueEvent({ text: 'Go' })], preCountVolume: 0 });
    advance(6000);

    expect(onCue).not.toHaveBeenCalled();
    // Without a pre count the song starts right away
    expect(onBeatChange.mock.calls[0]).toEqual([1, 1]);
  });

  it('speaks a cue shortly before its beat, after the pre count of two measures', () => {
    renderTransport({ events: [createCueEvent({ text: 'Go' })], preCountVolume: 50 });

    // The pre count lasts 4 s at 120 BPM in 4/4, and no song beats are reported during it
    advance(4000 - CUE_LEAD_MS - 100);
    expect(onCue).not.toHaveBeenCalled();
    expect(onBeatChange).not.toHaveBeenCalled();

    advance(200);
    expect(onCue).toHaveBeenCalledExactlyOnceWith('Go');
  });

  it('stops everything when the run stops', () => {
    const { rerender, result } = renderTransport();
    advance(1100);
    rerender({ isRunning: false });
    onBeatChange.mockClear();
    advance(5000);

    expect(onBeatChange).not.toHaveBeenCalled();
    expect(result.current).toEqual({ currentBeat: 0, currentMeasure: 0 });
  });
});
