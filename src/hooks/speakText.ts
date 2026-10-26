const MAX_SPEECH_MS = 10_000;

/**
 * Speaks text with the browser's speech synthesis and calls onDone when finished.
 * onDone is also called right away when speech synthesis is unavailable, so callers can always
 * continue. Returns a function that cancels the speech without calling onDone.
 */
export const speakText = (text: string, volume: number, onDone: () => void): (() => void) => {
  const synth = typeof window === 'undefined' ? undefined : window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    onDone();
    return () => {};
  }

  let isDone = false;
  let timeoutId: number | undefined;

  const finish = (shouldCancelSpeech: boolean) => {
    if (isDone) {
      return;
    }

    isDone = true;
    window.clearTimeout(timeoutId);
    if (shouldCancelSpeech) {
      synth.cancel();
    }
  };

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = Math.max(0, Math.min(1, volume / 100));
  utterance.onend = () => {
    if (!isDone) {
      finish(false);
      onDone();
    }
  };
  utterance.onerror = utterance.onend;

  // Some browsers never fire `end` for an utterance, so don't block the count-in forever
  timeoutId = window.setTimeout(() => {
    if (!isDone) {
      finish(true);
      onDone();
    }
  }, MAX_SPEECH_MS);

  synth.cancel();
  synth.speak(utterance);

  return () => finish(true);
};
