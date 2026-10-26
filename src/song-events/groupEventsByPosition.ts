import type {
  SongEvent,
  SongEventType,
  TempoChangeEvent,
  TimeSignatureChangeEvent,
} from '../types';

export type SongEventGroup = {
  beat: number;
  events: SongEvent[];
  /** Groups with a tempo or time signature change are locked to beat 1 */
  hasChange: boolean;
  key: string;
  measure: number;
};

// Sort position of events that share a position, which is also the order they are handled in
// playback: signature and tempo changes first, then MIDI buttons, then cues
const EVENT_TYPE_ORDER: Record<SongEventType, number> = {
  cue: 3,
  midiButton: 2,
  tempoChange: 1,
  timeSignatureChange: 0,
};

export const isChangeEvent = (
  event: SongEvent,
): event is TempoChangeEvent | TimeSignatureChangeEvent =>
  event.type === 'tempoChange' || event.type === 'timeSignatureChange';

export const compareSongEvents = (a: SongEvent, b: SongEvent) =>
  a.measure - b.measure || a.beat - b.beat || EVENT_TYPE_ORDER[a.type] - EVENT_TYPE_ORDER[b.type];

/** Groups events that happen at the same measure and beat, sorted by position */
export const groupEventsByPosition = (events: SongEvent[]): SongEventGroup[] => {
  const groups = new Map<string, SongEventGroup>();

  for (const event of events.toSorted(compareSongEvents)) {
    const key = `${event.measure}:${event.beat}`;
    const group = groups.get(key);

    if (group) {
      group.events.push(event);
      group.hasChange ||= isChangeEvent(event);
    } else {
      groups.set(key, {
        beat: event.beat,
        events: [event],
        hasChange: isChangeEvent(event),
        key,
        measure: event.measure,
      });
    }
  }

  return [...groups.values()];
};
