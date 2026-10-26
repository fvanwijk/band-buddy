import { describe, expect, it } from 'vite-plus/test';

import {
  createCueEvent,
  createMidiButtonEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import {
  createSongEvent,
  getEventTypeAvailability,
  getNewEventPosition,
  moveEventGroup,
  removeSongEvent,
  updateSongEvent,
} from './editEvents';

describe('editEvents', () => {
  const defaults = { bpm: 90, midiEventId: 'midi-1', timeSignature: '3/4' };

  describe('getEventTypeAvailability', () => {
    it('allows every type on an empty position after the first measure', () => {
      const availability = getEventTypeAvailability({ beat: 1, measure: 3 }, []);

      expect(Object.values(availability).every(({ isAvailable }) => isAvailable)).toBe(true);
    });

    it('only allows cues and MIDI buttons on a beat other than 1', () => {
      const availability = getEventTypeAvailability({ beat: 2, measure: 3 }, []);

      expect(availability.cue.isAvailable).toBe(true);
      expect(availability.midiButton.isAvailable).toBe(true);
      expect(availability.tempoChange).toEqual({
        isAvailable: false,
        reason: 'Changes are always on beat 1',
      });
      expect(availability.timeSignatureChange.isAvailable).toBe(false);
    });

    it('does not allow changes on the first measure', () => {
      const availability = getEventTypeAvailability({ beat: 1, measure: 1 }, []);

      expect(availability.cue.isAvailable).toBe(true);
      expect(availability.tempoChange.isAvailable).toBe(false);
      expect(availability.timeSignatureChange.isAvailable).toBe(false);
    });

    it('allows one of each type except MIDI buttons per position', () => {
      const availability = getEventTypeAvailability({ beat: 1, measure: 3 }, [
        createCueEvent({ measure: 3 }),
        createMidiButtonEvent({ measure: 3 }),
        createTempoChangeEvent({ measure: 3 }),
      ]);

      expect(availability.cue.isAvailable).toBe(false);
      expect(availability.midiButton.isAvailable).toBe(true);
      expect(availability.tempoChange.isAvailable).toBe(false);
      expect(availability.timeSignatureChange.isAvailable).toBe(true);
    });
  });

  describe('getNewEventPosition', () => {
    it('starts at the first measure, or the second for changes, without events', () => {
      expect(getNewEventPosition([], 'cue')).toEqual({ beat: 1, measure: 1 });
      expect(getNewEventPosition([], 'midiButton')).toEqual({ beat: 1, measure: 1 });
      expect(getNewEventPosition([], 'tempoChange')).toEqual({ beat: 1, measure: 2 });
      expect(getNewEventPosition([], 'timeSignatureChange')).toEqual({ beat: 1, measure: 2 });
    });

    it('uses the measure after the last event', () => {
      const events = [createCueEvent({ measure: 9 }), createCueEvent({ id: 'b', measure: 4 })];

      expect(getNewEventPosition(events, 'tempoChange')).toEqual({ beat: 1, measure: 10 });
    });
  });

  describe('createSongEvent', () => {
    it('creates events of every type with their defaults', () => {
      const position = { beat: 1, measure: 5 };

      expect(createSongEvent('cue', 'a', position, defaults)).toMatchObject({
        id: 'a',
        text: '',
        type: 'cue',
      });
      expect(createSongEvent('midiButton', 'b', position, defaults)).toMatchObject({
        midiEventId: 'midi-1',
        type: 'midiButton',
      });
      expect(createSongEvent('tempoChange', 'c', position, defaults)).toMatchObject({
        beat: 1,
        bpm: 90,
        type: 'tempoChange',
      });
      expect(createSongEvent('timeSignatureChange', 'd', position, defaults)).toMatchObject({
        beat: 1,
        timeSignature: '3/4',
        type: 'timeSignatureChange',
      });
    });

    it('puts changes on beat 1', () => {
      expect(createSongEvent('tempoChange', 'a', { beat: 3, measure: 5 }, defaults).beat).toBe(1);
    });
  });

  describe('updateSongEvent and removeSongEvent', () => {
    const events = [createCueEvent({ id: 'cue', text: 'Verse' }), createMidiButtonEvent()];

    it('updates only the event with the id', () => {
      expect(updateSongEvent(events, 'cue', { text: 'Chorus' })).toEqual([
        createCueEvent({ id: 'cue', text: 'Chorus' }),
        createMidiButtonEvent(),
      ]);
    });

    it('removes the event with the id', () => {
      expect(removeSongEvent(events, 'cue')).toEqual([createMidiButtonEvent()]);
    });
  });

  describe('moveEventGroup', () => {
    it('moves all events at the position and leaves others alone', () => {
      const events = [
        createCueEvent({ beat: 2, id: 'cue', measure: 4 }),
        createMidiButtonEvent({ beat: 2, id: 'midi', measure: 4 }),
        createCueEvent({ beat: 2, id: 'other', measure: 5 }),
      ];

      const moved = moveEventGroup(events, { beat: 2, measure: 4 }, { beat: 3, measure: 7 });

      expect(moved.map(({ beat, id, measure }) => ({ beat, id, measure }))).toEqual([
        { beat: 3, id: 'cue', measure: 7 },
        { beat: 3, id: 'midi', measure: 7 },
        { beat: 2, id: 'other', measure: 5 },
      ]);
    });

    it('keeps a group with a change on beat 1', () => {
      const events = [
        createTimeSignatureChangeEvent({ id: 'time', measure: 4 }),
        createMidiButtonEvent({ beat: 1, id: 'midi', measure: 4 }),
      ];

      const moved = moveEventGroup(events, { beat: 1, measure: 4 }, { beat: 3, measure: 6 });

      expect(moved.map(({ beat, measure }) => ({ beat, measure }))).toEqual([
        { beat: 1, measure: 6 },
        { beat: 1, measure: 6 },
      ]);
    });
  });
});
