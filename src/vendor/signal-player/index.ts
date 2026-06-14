/**
 * Minimal vendored Signal Player code
 *
 * Contains only the core event scheduling engine, adapted for BandBuddy:
 * - EventScheduler: Generic lookahead scheduler
 * - Event types: Simplified MIDI event definitions
 * - Utilities: Tick-to-millisecond conversions
 *
 * Removed dependencies:
 * - mobx (no reactivity needed, React state is sufficient)
 * - lodash (simple operations only)
 * - midifile-ts (custom minimal event types)
 */

export { EventScheduler } from './EventScheduler';
export type { WithTimestamp } from './EventScheduler';
export { tickToMillisec } from './tick';
export {
  MIDI_CONTROL_EVENTS,
  type SchedulableEvent,
  type EventSchedulerLoop,
  type MidiNoteEvent,
  type MidiControlEvent,
  type SchedulerEvent,
} from './events';
