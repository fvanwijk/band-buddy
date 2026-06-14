/**
 * Base type for events that can be scheduled by EventScheduler
 */
export interface SchedulableEvent {
  tick: number;
}

/**
 * Loop settings for event scheduler
 */
export interface EventSchedulerLoop {
  begin: number;
  end: number;
}

/**
 * MIDI controller event constants
 */
export const MIDI_CONTROL_EVENTS = {
  ALL_NOTES_OFF: 123,
  ALL_SOUNDS_OFF: 120,
  RESET_CONTROLLERS: 121,
} as const;

/**
 * Simple MIDI note event for metronome clicks
 */
export interface MidiNoteEvent extends SchedulableEvent {
  type: 'note';
  channel: number;
  note: number;
  velocity: number;
  duration?: number;
}

/**
 * Simple MIDI controller event
 */
export interface MidiControlEvent extends SchedulableEvent {
  type: 'control';
  channel: number;
  controller: number;
  value: number;
}

/**
 * Union of all schedulable MIDI events
 */
export type SchedulerEvent = MidiNoteEvent | MidiControlEvent;
