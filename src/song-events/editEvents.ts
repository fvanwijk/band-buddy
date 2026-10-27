import type { SongEvent, SongEventType } from '../types';
import { isChangeEvent } from './groupEventsByPosition';

export type EventPosition = {
  beat: number;
  measure: number;
};

export type EventTypeAvailability = {
  isAvailable: boolean;
  /** Why the type can't be added, shown to the user */
  reason?: string;
};

export type NewEventDefaults = {
  bpm: number;
  midiEventId: string;
  timeSignature: string;
};

export type EventPatch = Partial<{
  bpm: number;
  midiEventId: string;
  text: string;
  timeSignature: string;
}>;

const hasType = (events: SongEvent[], type: SongEventType) =>
  events.some((event) => event.type === type);

/** Which types of events can be added to a position that holds the given events */
export const getEventTypeAvailability = (
  { beat, measure }: EventPosition,
  eventsAtPosition: SongEvent[],
): Record<SongEventType, EventTypeAvailability> => {
  const changeReason =
    measure === 1
      ? "Measure 1 uses the song's own tempo and time signature"
      : beat !== 1
        ? 'Changes are always on beat 1'
        : undefined;
  const getChangeAvailability = (type: SongEventType): EventTypeAvailability => {
    if (changeReason) {
      return { isAvailable: false, reason: changeReason };
    }

    return hasType(eventsAtPosition, type)
      ? { isAvailable: false, reason: 'There already is one at this position' }
      : { isAvailable: true };
  };

  return {
    cue: hasType(eventsAtPosition, 'cue')
      ? { isAvailable: false, reason: 'There already is a cue at this position' }
      : { isAvailable: true },
    midiButton: { isAvailable: true },
    tempoChange: getChangeAvailability('tempoChange'),
    timeSignatureChange: getChangeAvailability('timeSignatureChange'),
  };
};

/** Position for the first event of a new group: the measure after the last event */
export const getNewEventPosition = (events: SongEvent[], type: SongEventType): EventPosition => {
  if (events.length === 0) {
    return { beat: 1, measure: type === 'tempoChange' || type === 'timeSignatureChange' ? 2 : 1 };
  }

  return { beat: 1, measure: Math.max(...events.map(({ measure }) => measure)) + 1 };
};

export const createSongEvent = (
  type: SongEventType,
  id: string,
  { beat, measure }: EventPosition,
  defaults: NewEventDefaults,
): SongEvent => {
  switch (type) {
    case 'cue':
      return { beat, id, measure, text: '', type };
    case 'midiButton':
      return { beat, id, measure, midiEventId: defaults.midiEventId, type };
    case 'tempoChange':
      return { beat: 1, bpm: defaults.bpm, id, measure, type };
    case 'timeSignatureChange':
      return { beat: 1, id, measure, timeSignature: defaults.timeSignature, type };
  }
};

export const updateSongEvent = (events: SongEvent[], id: string, patch: EventPatch) =>
  // The patch only holds fields of the event's own type, which the editing rows make sure of
  events.map((event) => (event.id === id ? ({ ...event, ...patch } as SongEvent) : event));

export const removeSongEvent = (events: SongEvent[], id: string) =>
  events.filter((event) => event.id !== id);

/**
 * Moves all events at a position to another one. A group with a tempo or time signature change
 * always stays on beat 1.
 */
export const moveEventGroup = (events: SongEvent[], from: EventPosition, to: EventPosition) => {
  const isAtFrom = (event: SongEvent) => event.measure === from.measure && event.beat === from.beat;
  const hasChange = events.some((event) => isAtFrom(event) && isChangeEvent(event));
  const target = { beat: hasChange ? 1 : to.beat, measure: to.measure };

  return events.map((event) =>
    // Changes have beat 1 already, so moving them to beat 1 can't make them invalid
    isAtFrom(event) ? ({ ...event, ...target } as SongEvent) : event,
  );
};

/**
 * Moves a single event. A tempo or time signature change snaps to beat 1 of the measure and
 * can't be moved to the first measure.
 */
export const moveSongEvent = (events: SongEvent[], id: string, to: EventPosition): SongEvent[] => {
  const event = events.find((item) => item.id === id);
  if (!event) {
    return events;
  }

  if (isChangeEvent(event)) {
    return to.measure === 1
      ? events
      : events.map((item) => (item.id === id ? { ...event, beat: 1, measure: to.measure } : item));
  }

  return events.map((item) => (item.id === id ? { ...event, ...to } : item));
};
