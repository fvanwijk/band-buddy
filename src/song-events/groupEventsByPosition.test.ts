import { describe, expect, it } from 'vite-plus/test';

import {
  createCueEvent,
  createMidiButtonEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import { compareSongEvents, groupEventsByPosition } from './groupEventsByPosition';

describe('groupEventsByPosition', () => {
  it('returns no groups without events', () => {
    expect(groupEventsByPosition([])).toEqual([]);
  });

  it('groups events at the same measure and beat, sorted by position', () => {
    const cue = createCueEvent({ beat: 1, id: 'cue', measure: 5 });
    const midiA = createMidiButtonEvent({ beat: 1, id: 'midi-a', measure: 5 });
    const midiB = createMidiButtonEvent({ beat: 3, id: 'midi-b', measure: 2 });
    const tempo = createTempoChangeEvent({ id: 'tempo', measure: 5 });

    const groups = groupEventsByPosition([cue, midiA, midiB, tempo]);

    expect(groups.map(({ events, key }) => ({ ids: events.map(({ id }) => id), key }))).toEqual([
      { ids: ['midi-b'], key: '2:3' },
      { ids: ['tempo', 'midi-a', 'cue'], key: '5:1' },
    ]);
  });

  it('orders a time signature change before a tempo change', () => {
    const [group] = groupEventsByPosition([
      createTempoChangeEvent({ id: 'tempo', measure: 3 }),
      createTimeSignatureChangeEvent({ id: 'time', measure: 3 }),
    ]);

    expect(group.events.map(({ id }) => id)).toEqual(['time', 'tempo']);
  });

  it('flags groups with a tempo or time signature change', () => {
    const groups = groupEventsByPosition([
      createCueEvent({ beat: 2, measure: 1 }),
      createCueEvent({ beat: 1, id: 'other', measure: 2 }),
      createTimeSignatureChangeEvent({ measure: 2 }),
    ]);

    expect(groups.map(({ hasChange }) => hasChange)).toEqual([false, true]);
  });

  it('keeps the order of equal events', () => {
    const first = createMidiButtonEvent({ id: 'first', measure: 2 });
    const second = createMidiButtonEvent({ id: 'second', measure: 2 });

    expect(compareSongEvents(first, second)).toBe(0);
    expect(groupEventsByPosition([first, second])[0].events.map(({ id }) => id)).toEqual([
      'first',
      'second',
    ]);
  });
});
