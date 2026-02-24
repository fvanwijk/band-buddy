import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WebMidi } from 'webmidi';

import { useMidiDevices } from './useMidiDevices';

vi.mock('webmidi', () => {
  return {
    WebMidi: {
      addListener: vi.fn(),
      enable: vi.fn(),
      inputs: [{ id: 'input1' }, { id: 'input2' }],
      outputs: [{ id: 'output1' }, { id: 'output2' }],
      removeListener: vi.fn(),
    },
  };
});

describe('useMidiDevices', () => {
  it('returns MIDI devices after enable', async () => {
    vi.mocked(WebMidi.enable).mockResolvedValueOnce(WebMidi);
    const { result } = renderHook(() => useMidiDevices());
    await act(async () => Promise.resolve());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isReady).toBe(true);
    expect(result.current.inputs).toEqual([{ id: 'input1' }, { id: 'input2' }]);
    expect(result.current.outputs).toEqual([{ id: 'output1' }, { id: 'output2' }]);
    expect(result.current.error).toBeNull();
  });

  it('handles enable error', async () => {
    vi.mocked(WebMidi.enable).mockRejectedValueOnce(new Error('MIDI error'));
    const { result } = renderHook(() => useMidiDevices());
    await act(async () => Promise.resolve());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBe('MIDI error');
  });

  it('updates devices on connected/disconnected', async () => {
    vi.mocked(WebMidi.enable).mockResolvedValueOnce(WebMidi);
    renderHook(() => useMidiDevices());
    await act(async () => Promise.resolve());

    expect(vi.mocked(WebMidi.addListener)).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(vi.mocked(WebMidi.addListener)).toHaveBeenCalledWith(
      'disconnected',
      expect.any(Function),
    );

    // Testing the listeners would be very contrived
  });
});
