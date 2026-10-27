// Router state that marks a navigation as an explicit song change (setlist click, next/prev button).
// It is cleared again once the "trigger on song change" MIDI buttons have been sent.
export const songChangeTriggerState = { triggerMidi: true };

export const hasSongChangeTrigger = (state: unknown) =>
  typeof state === 'object' && state !== null && 'triggerMidi' in state && !!state.triggerMidi;
