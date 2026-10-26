import { describe, expect, it } from 'vite-plus/test';

import {
  createCueEvent,
  createMidiButtonEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import { validateSongEvents } from './validateSongEvents';

describe('validateSongEvents', () => {
  const options = { bpm: 60, timeSignature: '4/4' };

  it('accepts valid events', () => {
    expect(
      validateSongEvents(
        [
          createCueEvent({ beat: 3, measure: 4 }),
          createMidiButtonEvent({ measure: 3 }),
          createTempoChangeEvent({ measure: 3 }),
          createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' }),
        ],
        options,
      ),
    ).toEqual([]);
  });

  it('allows cues and MIDI buttons on the first measure', () => {
    const issues = validateSongEvents(
      [
        createCueEvent({ beat: 1, measure: 1 }),
        createMidiButtonEvent({ beat: 3, measure: 1 }),
        createMidiButtonEvent({ beat: 1, id: 'midi-2', measure: 1 }),
      ],
      options,
    );

    expect(issues).toEqual([]);
  });

  it('rejects a time signature change on the first measure', () => {
    const issues = validateSongEvents(
      [createTimeSignatureChangeEvent({ id: 'time', measure: 1 })],
      options,
    );

    expect(issues).toEqual([
      expect.objectContaining({ code: 'changeOnFirstMeasure', eventId: 'time' }),
    ]);
  });

  it('rejects a change on the first measure', () => {
    const issues = validateSongEvents(
      [createTempoChangeEvent({ id: 'tempo', measure: 1 })],
      options,
    );

    expect(issues).toEqual([
      expect.objectContaining({ code: 'changeOnFirstMeasure', eventId: 'tempo' }),
    ]);
  });

  it('rejects duplicates of one type at the same position but allows several MIDI buttons', () => {
    const issues = validateSongEvents(
      [
        createCueEvent({ id: 'cue-a', measure: 2 }),
        createCueEvent({ id: 'cue-b', measure: 2 }),
        createTempoChangeEvent({ id: 'tempo-a', measure: 3 }),
        createTempoChangeEvent({ id: 'tempo-b', measure: 3 }),
        createMidiButtonEvent({ id: 'midi-a', measure: 4 }),
        createMidiButtonEvent({ id: 'midi-b', measure: 4 }),
      ],
      options,
    );

    expect(issues.map(({ code, eventId }) => ({ code, eventId }))).toEqual([
      { code: 'duplicateEvent', eventId: 'cue-b' },
      { code: 'duplicateEvent', eventId: 'tempo-b' },
    ]);
  });

  it('allows a cue and a tempo change at the same position', () => {
    const issues = validateSongEvents(
      [createTempoChangeEvent({ measure: 3 }), createCueEvent({ beat: 1, measure: 3 })],
      options,
    );

    expect(issues).toEqual([]);
  });

  it('rejects a beat beyond the beats of the measure', () => {
    const issues = validateSongEvents(
      [
        createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' }),
        createCueEvent({ beat: 4, id: 'before', measure: 2 }),
        createCueEvent({ beat: 4, id: 'after', measure: 3 }),
      ],
      options,
    );

    expect(issues.map(({ code, eventId }) => ({ code, eventId }))).toEqual([
      { code: 'beatOutOfRange', eventId: 'after' },
    ]);
  });

  it('rejects a count-in that starts before the song does', () => {
    const issues = validateSongEvents(
      [createTempoChangeEvent({ bpm: 30, id: 'slow', measure: 2 })],
      options,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'countInBeforeSongStart',
        eventId: 'slow',
        severity: 'error',
      }),
    ]);
  });

  it('warns about a count-in that reaches into the previous change', () => {
    const issues = validateSongEvents(
      [
        createTempoChangeEvent({ bpm: 120, id: 'first', measure: 3 }),
        createTempoChangeEvent({ bpm: 80, id: 'second', measure: 4 }),
      ],
      options,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'countInOverlapsPreviousChange',
        eventId: 'second',
        severity: 'warning',
      }),
    ]);
  });

  it('warns about a cue that is spoken during a count-in', () => {
    const issues = validateSongEvents(
      [
        createTempoChangeEvent({ bpm: 100, measure: 3 }),
        createCueEvent({ beat: 3, id: 'during', measure: 2 }),
        createCueEvent({ beat: 2, id: 'before', measure: 2 }),
        createCueEvent({ beat: 1, id: 'on-change', measure: 3 }),
      ],
      options,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'cueOverlapsCountIn',
        eventId: 'during',
        severity: 'warning',
      }),
    ]);
  });

  it('skips timing checks without a tempo', () => {
    const issues = validateSongEvents(
      [createTempoChangeEvent({ bpm: 30, measure: 2 }), createCueEvent({ beat: 3, measure: 2 })],
      { timeSignature: '4/4' },
    );

    expect(issues).toEqual([]);
  });
});
