import type { SongEvent } from '../types';
import { findSegmentByMeasure, getCountIns } from './songMap';
import type { SongMap } from './songMap';

export const MEASURES_PER_ROW = 4;
const MIN_MEASURES = 8;

type TimelineMeasureCountOptions = {
  /** Number of measures the song's duration comes down to, when known */
  estimatedMeasures?: number | null;
  events: SongEvent[];
  /** Rows of measures added by the user */
  extraRows?: number;
};

/** Number of measures to show: the song, with room after the last event, in whole rows */
export const getTimelineMeasureCount = ({
  estimatedMeasures,
  events,
  extraRows = 0,
}: TimelineMeasureCountOptions) => {
  const lastEventMeasure = Math.max(0, ...events.map(({ measure }) => measure));
  const needed = Math.max(MIN_MEASURES, estimatedMeasures ?? 0, lastEventMeasure + 1);

  return (Math.ceil(needed / MEASURES_PER_ROW) + extraRows) * MEASURES_PER_ROW;
};

/** The part of a measure that a count-in covers, as fractions of the measure's width */
export type CountInBar = {
  bpm: number;
  /** Where in the measure the count-in starts: 0 is the start, 0.5 the middle */
  left: number;
  measure: number;
  width: number;
};

/**
 * The measures every count-in is spoken over. A count-in starts somewhere in the measure before
 * the tempo change, so the bar starts there and runs to the end of the measure.
 */
export const getCountInBars = (map: SongMap): CountInBar[] =>
  getCountIns(map)
    // A count-in before the start of the song can't be played
    .filter(({ startMs }) => startMs >= 0)
    .flatMap(({ bpm, measure: changeMeasure, startPosition }) =>
      Array.from({ length: changeMeasure - startPosition.measure }, (_, index): CountInBar => {
        const measure = startPosition.measure + index;
        const { beatsPerMeasure } = findSegmentByMeasure(map, measure);
        const left = index === 0 ? (startPosition.beat - 1) / beatsPerMeasure : 0;

        return { bpm, left, measure, width: 1 - left };
      }),
    );
