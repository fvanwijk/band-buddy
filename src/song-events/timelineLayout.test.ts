import { describe, expect, it } from 'vite-plus/test';

import {
  createCueEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import { buildSongMap } from './songMap';
import { getCountInBars, getTimelineMeasureCount } from './timelineLayout';

describe('timelineLayout', () => {
  describe('getTimelineMeasureCount', () => {
    it('shows at least 8 measures', () => {
      expect(getTimelineMeasureCount({ events: [] })).toBe(8);
      expect(getTimelineMeasureCount({ estimatedMeasures: 3, events: [] })).toBe(8);
    });

    it('covers the length of the song in whole rows of 4', () => {
      expect(getTimelineMeasureCount({ estimatedMeasures: 95, events: [] })).toBe(96);
      expect(getTimelineMeasureCount({ estimatedMeasures: null, events: [] })).toBe(8);
    });

    it('leaves room after the last event', () => {
      expect(getTimelineMeasureCount({ events: [createCueEvent({ measure: 7 })] })).toBe(8);
      expect(getTimelineMeasureCount({ events: [createCueEvent({ measure: 8 })] })).toBe(12);
    });

    it('adds the rows the user asked for', () => {
      expect(getTimelineMeasureCount({ events: [], extraRows: 2 })).toBe(16);
    });
  });

  describe('getCountInBars', () => {
    it('has no bars without tempo changes', () => {
      expect(getCountInBars(buildSongMap({ bpm: 90, events: [createCueEvent()] }))).toEqual([]);
    });

    it('covers the end of the measure before the tempo change', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
      });
      const [bar, ...others] = getCountInBars(map);

      expect(others).toEqual([]);
      expect(bar.bpm).toBe(100);
      expect(bar.measure).toBe(2);
      // The count-in starts on beat 2.6 of the 4 beat measure
      expect(bar.left).toBeCloseTo(0.4, 5);
      expect(bar.width).toBeCloseTo(0.6, 5);
    });

    it('spans several measures when the count-in is longer than the previous measure', () => {
      const map = buildSongMap({
        bpm: 120,
        events: [
          createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' }),
          createTempoChangeEvent({ bpm: 60, measure: 3 }),
        ],
      });
      const bars = getCountInBars(map);

      // 3 beats at 60 BPM take 3 s, which is 1.5 measures of 4/4 at 120 BPM
      expect(bars.map(({ measure }) => measure)).toEqual([1, 2]);
      expect(bars[0].left).toBeCloseTo(0.5, 5);
      expect(bars[1]).toMatchObject({ left: 0, width: 1 });
    });

    it('leaves out a count-in that would start before the song', () => {
      const map = buildSongMap({
        bpm: 60,
        events: [createTempoChangeEvent({ bpm: 30, measure: 2 })],
      });

      expect(getCountInBars(map)).toEqual([]);
    });
  });
});
