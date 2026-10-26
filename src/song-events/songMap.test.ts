import { describe, expect, it } from 'vite-plus/test';

import {
  createCueEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import {
  buildSongMap,
  getBeatsPerMeasure,
  getCountIns,
  msToPosition,
  positionToBeat,
  positionToMs,
} from './songMap';

describe('songMap', () => {
  const sixtyToHundred = buildSongMap({
    bpm: 60,
    events: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
    timeSignature: '4/4',
  });

  describe('getBeatsPerMeasure', () => {
    it('uses the numerator of the time signature', () => {
      expect(getBeatsPerMeasure('7/8')).toBe(7);
    });

    it('falls back to 4 for a missing or invalid time signature', () => {
      expect(getBeatsPerMeasure()).toBe(4);
      expect(getBeatsPerMeasure('x/4')).toBe(4);
    });
  });

  describe('buildSongMap', () => {
    it('has a single segment without changes', () => {
      const map = buildSongMap({ bpm: 120, events: [createCueEvent()], timeSignature: '3/4' });

      expect(map.segments).toEqual([
        { beatsPerMeasure: 3, bpm: 120, startBeat: 0, startMeasure: 1, startMs: 0 },
      ]);
    });

    it('starts a segment at a tempo change', () => {
      expect(sixtyToHundred.segments).toEqual([
        { beatsPerMeasure: 4, bpm: 60, startBeat: 0, startMeasure: 1, startMs: 0 },
        { beatsPerMeasure: 4, bpm: 100, startBeat: 8, startMeasure: 3, startMs: 8000 },
      ]);
    });

    it('combines a tempo and time signature change on the same measure', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [
          createTimeSignatureChangeEvent({ measure: 3, timeSignature: '7/8' }),
          createTempoChangeEvent({ bpm: 120, measure: 3 }),
        ],
      });

      expect(map.segments).toHaveLength(2);
      expect(map.segments[1]).toEqual({
        beatsPerMeasure: 7,
        bpm: 120,
        startBeat: 8,
        startMeasure: 3,
        startMs: 8000,
      });
    });

    it('keeps the tempo for a time signature change and vice versa', () => {
      const map = buildSongMap({
        bpm: 90,
        events: [
          createTimeSignatureChangeEvent({ measure: 2, timeSignature: '3/4' }),
          createTempoChangeEvent({ bpm: 120, measure: 4 }),
        ],
      });

      expect(map.segments.map(({ beatsPerMeasure, bpm }) => ({ beatsPerMeasure, bpm }))).toEqual([
        { beatsPerMeasure: 4, bpm: 90 },
        { beatsPerMeasure: 3, bpm: 90 },
        { beatsPerMeasure: 3, bpm: 120 },
      ]);
      expect(map.segments[2].startBeat).toBe(4 + 3 * 2);
    });

    it('sorts changes regardless of the order of the events', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [
          createTempoChangeEvent({ bpm: 80, id: 'b', measure: 5 }),
          createTempoChangeEvent({ bpm: 120, id: 'a', measure: 2 }),
        ],
      });

      expect(map.segments.map((segment) => segment.startMeasure)).toEqual([1, 2, 5]);
      expect(map.segments[2].startMs).toBe(10000);
    });

    it('applies a change on measure 1 to the song itself', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [createTempoChangeEvent({ bpm: 90, measure: 1 })],
      });

      expect(map.segments).toEqual([
        { beatsPerMeasure: 4, bpm: 90, startBeat: 0, startMeasure: 1, startMs: 0 },
      ]);
    });
  });

  describe('positions and time', () => {
    it('converts positions to milliseconds across tempo segments', () => {
      expect(positionToMs(sixtyToHundred, 1, 1)).toBe(0);
      expect(positionToMs(sixtyToHundred, 2, 3)).toBe(6000);
      expect(positionToMs(sixtyToHundred, 3, 1)).toBe(8000);
      expect(positionToMs(sixtyToHundred, 3, 2)).toBeCloseTo(8600, 5);
      expect(positionToMs(sixtyToHundred, 4, 1)).toBeCloseTo(10400, 5);
    });

    it('converts positions to absolute beats across time signature changes', () => {
      const map = buildSongMap({
        bpm: 120,
        events: [createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' })],
        timeSignature: '4/4',
      });

      expect(positionToBeat(map, 3, 1)).toBe(8);
      expect(positionToBeat(map, 4, 2)).toBe(12);
    });

    it('converts milliseconds back to a (fractional) position', () => {
      const position = msToPosition(sixtyToHundred, 5600);

      expect(position.measure).toBe(2);
      expect(position.beat).toBeCloseTo(2.6, 5);
      expect(msToPosition(sixtyToHundred, 8000)).toEqual({ beat: 1, measure: 3 });
      expect(msToPosition(sixtyToHundred, 0)).toEqual({ beat: 1, measure: 1 });
    });

    it('round trips positions', () => {
      const map = buildSongMap({
        bpm: 80,
        events: [
          createTempoChangeEvent({ bpm: 140, measure: 4 }),
          createTimeSignatureChangeEvent({ measure: 6, timeSignature: '6/8' }),
        ],
      });

      for (const [measure, beat] of [
        [1, 1],
        [3, 4],
        [4, 1],
        [5, 3],
        [6, 5],
        [9, 2],
      ]) {
        const position = msToPosition(map, positionToMs(map, measure, beat));

        expect(position.measure).toBe(measure);
        expect(position.beat).toBeCloseTo(beat, 5);
      }
    });

    it('gives positions before the song start for negative times', () => {
      const position = msToPosition(sixtyToHundred, -1000);

      expect(position.measure).toBe(0);
      expect(position.beat).toBeCloseTo(4, 5);
    });
  });

  describe('getCountIns', () => {
    it('counts in one measure in the new tempo, overlapping the old tempo', () => {
      const [countIn, ...others] = getCountIns(sixtyToHundred);

      expect(others).toEqual([]);
      expect(countIn.atMs).toBe(8000);
      expect(countIn.beats).toBe(4);
      expect(countIn.bpm).toBe(100);
      expect(countIn.measure).toBe(3);
      expect(countIn.startMs).toBe(5600);
      expect(countIn.startPosition.measure).toBe(2);
      expect(countIn.startPosition.beat).toBeCloseTo(2.6, 5);
      expect(countIn.words.map(({ word }) => word)).toEqual(['one', 'two', 'three', 'four']);
      expect(countIn.words.map(({ ms }) => ms)).toEqual([5600, 6200, 6800, 7400]);
    });

    it('keeps clicking at the old tempo while the count-in runs', () => {
      const [countIn] = getCountIns(sixtyToHundred);
      const oldClicks = [1, 2, 3, 4].map((beat) => positionToMs(sixtyToHundred, 2, beat));

      expect(oldClicks).toEqual([4000, 5000, 6000, 7000]);
      expect(oldClicks.filter((ms) => ms >= countIn.startMs && ms < countIn.atMs)).toEqual([
        6000, 7000,
      ]);
    });

    it('counts in the new time signature', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [
          createTempoChangeEvent({ bpm: 120, measure: 3 }),
          createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' }),
        ],
      });
      const [countIn] = getCountIns(map);

      expect(countIn.beats).toBe(3);
      expect(countIn.startMs).toBe(8000 - 1500);
      expect(countIn.words.map(({ word }) => word)).toEqual(['one', 'two', 'three']);
    });

    it('only speaks the recorded words in longer measures', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [
          createTimeSignatureChangeEvent({ measure: 2, timeSignature: '5/4' }),
          createTempoChangeEvent({ bpm: 90, measure: 2 }),
        ],
      });
      const [countIn] = getCountIns(map);

      expect(countIn.beats).toBe(5);
      expect(countIn.words.map(({ word }) => word)).toEqual(['one', 'two', 'three', 'four']);
    });

    it('has no count-in for a time signature change at the same tempo', () => {
      const map = buildSongMap({
        bpm: 100,
        events: [createTimeSignatureChangeEvent({ measure: 3 })],
      });

      expect(getCountIns(map)).toEqual([]);
    });

    it('has no count-in when the tempo change repeats the current tempo', () => {
      const map = buildSongMap({
        bpm: 100,
        events: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
      });

      expect(getCountIns(map)).toEqual([]);
    });
  });
});
