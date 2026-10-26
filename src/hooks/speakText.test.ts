import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { speakText } from './speakText';

type FakeVoice = { default?: boolean; lang: string; name: string; voiceURI: string };
type FakeUtterance = {
  lang?: string;
  onend?: () => void;
  onerror?: () => void;
  text: string;
  voice?: FakeVoice;
  volume: number;
};

describe('speakText', () => {
  let spoken: FakeUtterance[];
  let voices: FakeVoice[];
  const cancel = vi.fn();

  beforeEach(() => {
    spoken = [];
    voices = [];
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
      getVoices: () => voices,
      speak: (utterance: FakeUtterance) => spoken.push(utterance),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('speaks the text at the given volume and calls onDone when it ends', () => {
    const onDone = vi.fn();

    speakText('Superstition', { onDone, volume: 40 });

    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('Superstition');
    expect(spoken[0].volume).toBe(0.4);
    expect(onDone).not.toHaveBeenCalled();

    spoken[0].onend?.();

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('uses the selected voice', () => {
    voices = [
      { lang: 'en-US', name: 'Samantha', voiceURI: 'samantha' },
      { lang: 'en-GB', name: 'Daniel', voiceURI: 'daniel' },
    ];

    speakText('Superstition', { onDone: vi.fn(), voiceURI: 'daniel', volume: 100 });

    expect(spoken[0].voice).toBe(voices[1]);
    expect(spoken[0].lang).toBe('en-GB');
  });

  it('falls back to the default voice of the language when the selected voice is unavailable', () => {
    voices = [
      { lang: 'nl-NL', name: 'Xander', voiceURI: 'xander' },
      { lang: 'en-US', name: 'Samantha', voiceURI: 'samantha' },
      { default: true, lang: 'en-GB', name: 'Daniel', voiceURI: 'daniel' },
    ];

    speakText('Superstition', { onDone: vi.fn(), voiceURI: 'missing', volume: 100 });

    expect(spoken[0].voice).toBe(voices[2]);
  });

  it('falls back to the first voice of the language when there is no default voice', () => {
    voices = [
      { lang: 'en-US', name: 'Samantha', voiceURI: 'samantha' },
      { lang: 'nl-NL', name: 'Xander', voiceURI: 'xander' },
      { lang: 'nl-BE', name: 'Bart', voiceURI: 'bart' },
    ];

    speakText('Zeven dagen', { language: 'nl', onDone: vi.fn(), voiceURI: 'missing', volume: 100 });

    expect(spoken[0].voice).toBe(voices[1]);
  });

  it('lets the browser choose when no voice matches the language', () => {
    voices = [{ lang: 'en-US', name: 'Samantha', voiceURI: 'samantha' }];

    speakText('Zeven dagen', { language: 'nl', onDone: vi.fn(), volume: 100 });

    expect(spoken[0].voice).toBeUndefined();
    expect(spoken[0].lang).toBe('nl');
  });

  it('calls onDone when speech fails', () => {
    const onDone = vi.fn();

    speakText('September', { onDone, volume: 100 });
    spoken[0].onerror?.();

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not call onDone when cancelled', () => {
    const onDone = vi.fn();

    const stop = speakText('September', { onDone, volume: 100 });
    stop();
    spoken[0].onend?.();

    expect(cancel).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('calls onDone after a timeout when the end event never fires', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();

    speakText('September', { onDone, volume: 100 });
    vi.advanceTimersByTime(10_000);

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone immediately when speech synthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const onDone = vi.fn();

    speakText('September', { onDone, volume: 100 });

    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
