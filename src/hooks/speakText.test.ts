import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { speakText } from './speakText';

type FakeUtterance = { onend?: () => void; onerror?: () => void; text: string; volume: number };

describe('speakText', () => {
  let spoken: FakeUtterance[];
  const cancel = vi.fn();

  beforeEach(() => {
    spoken = [];
    cancel.mockClear();
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        onend?: () => void;
        onerror?: () => void;
        text: string;
        volume = 1;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
    vi.stubGlobal('speechSynthesis', {
      cancel,
      speak: (utterance: FakeUtterance) => spoken.push(utterance),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('speaks the text at the given volume and calls onDone when it ends', () => {
    const onDone = vi.fn();

    speakText('Superstition', 40, onDone);

    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('Superstition');
    expect(spoken[0].volume).toBe(0.4);
    expect(onDone).not.toHaveBeenCalled();

    spoken[0].onend?.();

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone when speech fails', () => {
    const onDone = vi.fn();

    speakText('September', 100, onDone);
    spoken[0].onerror?.();

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not call onDone when cancelled', () => {
    const onDone = vi.fn();

    const stop = speakText('September', 100, onDone);
    stop();
    spoken[0].onend?.();

    expect(cancel).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('calls onDone after a timeout when the end event never fires', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();

    speakText('September', 100, onDone);
    vi.advanceTimersByTime(10_000);

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone immediately when speech synthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const onDone = vi.fn();

    speakText('September', 100, onDone);

    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
