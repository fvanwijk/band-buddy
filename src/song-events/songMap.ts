import { getPreCountWord } from '../hooks/preCount';
import type { PreCountWord } from '../hooks/preCount';
import type { SongEvent } from '../types';

const DEFAULT_BEATS_PER_MEASURE = 4;
const MS_PER_MINUTE = 60_000;

/** A stretch of the song with a constant tempo and time signature */
export type SongSegment = {
  beatsPerMeasure: number;
  bpm: number;
  /** Beats from the start of the song (0-based) to the start of this segment */
  startBeat: number;
  startMeasure: number;
  startMs: number;
};

export type SongMap = {
  /** Never empty, sorted by start. The first segment holds the song's own tempo and signature */
  segments: SongSegment[];
};

export type SongPosition = {
  /** 1-based, fractional when the position is between two beats */
  beat: number;
  measure: number;
};

export type CountInWord = {
  /** 0-based beat within the count-in measure */
  beatIndex: number;
  ms: number;
  word: PreCountWord;
};

/**
 * The spoken measure that leads up to a tempo change. It is counted in the new tempo and time
 * signature and overlaps the last measure of the previous segment, so that the next "one" lands
 * exactly on the downbeat of the change.
 */
export type CountIn = {
  atMs: number;
  beats: number;
  bpm: number;
  /** Measure of the tempo change the count-in leads up to */
  measure: number;
  startMs: number;
  startPosition: SongPosition;
  words: CountInWord[];
};

type BuildSongMapOptions = {
  bpm: number;
  events?: SongEvent[];
  timeSignature?: string;
};

export const getBeatsPerMeasure = (timeSignature?: string) => {
  const [numerator] = (timeSignature || '4/4').split('/').map(Number);
  return Number.isFinite(numerator) && numerator > 0 ? numerator : DEFAULT_BEATS_PER_MEASURE;
};

const beatsToMs = (beats: number, bpm: number) => (beats * MS_PER_MINUTE) / bpm;

const lastSegmentWhere = (map: SongMap, predicate: (segment: SongSegment) => boolean) =>
  map.segments.findLast(predicate) ?? map.segments[0];

export const findSegmentByMeasure = (map: SongMap, measure: number) =>
  lastSegmentWhere(map, (segment) => segment.startMeasure <= measure);

export const findSegmentByBeat = (map: SongMap, beat: number) =>
  lastSegmentWhere(map, (segment) => segment.startBeat <= beat);

export const findSegmentByMs = (map: SongMap, ms: number) =>
  lastSegmentWhere(map, (segment) => segment.startMs <= ms);

/**
 * Builds the tempo and time signature segments of a song from its change events.
 * A change on measure 1 overrides the song's own values.
 */
export const buildSongMap = ({ bpm, events = [], timeSignature }: BuildSongMapOptions): SongMap => {
  const changes = new Map<number, { beatsPerMeasure?: number; bpm?: number }>();

  for (const event of events) {
    if (event.type === 'tempoChange') {
      changes.set(event.measure, { ...changes.get(event.measure), bpm: event.bpm });
    } else if (event.type === 'timeSignatureChange') {
      changes.set(event.measure, {
        ...changes.get(event.measure),
        beatsPerMeasure: getBeatsPerMeasure(event.timeSignature),
      });
    }
  }

  const segments: SongSegment[] = [
    {
      beatsPerMeasure: getBeatsPerMeasure(timeSignature),
      bpm,
      startBeat: 0,
      startMeasure: 1,
      startMs: 0,
    },
  ];

  for (const measure of [...changes.keys()].toSorted((a, b) => a - b)) {
    const change = changes.get(measure)!;
    const previous = segments[segments.length - 1];

    if (measure <= previous.startMeasure) {
      segments[segments.length - 1] = {
        ...previous,
        beatsPerMeasure: change.beatsPerMeasure ?? previous.beatsPerMeasure,
        bpm: change.bpm ?? previous.bpm,
      };
      continue;
    }

    const beats = (measure - previous.startMeasure) * previous.beatsPerMeasure;
    segments.push({
      beatsPerMeasure: change.beatsPerMeasure ?? previous.beatsPerMeasure,
      bpm: change.bpm ?? previous.bpm,
      startBeat: previous.startBeat + beats,
      startMeasure: measure,
      startMs: previous.startMs + beatsToMs(beats, previous.bpm),
    });
  }

  return { segments };
};

/** Number of beats (0-based) from the start of the song to a position */
export const positionToBeat = (map: SongMap, measure: number, beat = 1) => {
  const segment = findSegmentByMeasure(map, measure);
  return (
    segment.startBeat + (measure - segment.startMeasure) * segment.beatsPerMeasure + (beat - 1)
  );
};

export const positionToMs = (map: SongMap, measure: number, beat = 1) => {
  const segment = findSegmentByMeasure(map, measure);
  const beatsIntoSegment = (measure - segment.startMeasure) * segment.beatsPerMeasure + (beat - 1);
  return segment.startMs + beatsToMs(beatsIntoSegment, segment.bpm);
};

/** Inverse of positionToMs. Times before the song start give positions before measure 1. */
export const msToPosition = (map: SongMap, ms: number): SongPosition => {
  const segment = findSegmentByMs(map, ms);
  const beatsIntoSegment = ((ms - segment.startMs) * segment.bpm) / MS_PER_MINUTE;
  const measuresIntoSegment = Math.floor(beatsIntoSegment / segment.beatsPerMeasure);
  const beatInMeasure = beatsIntoSegment - measuresIntoSegment * segment.beatsPerMeasure;

  return {
    beat: beatInMeasure + 1,
    measure: segment.startMeasure + measuresIntoSegment,
  };
};

/** One count-in for every segment that starts with a different tempo than the one before */
export const getCountIns = (map: SongMap): CountIn[] =>
  map.segments.flatMap((segment, index) => {
    const previous = map.segments[index - 1];
    if (!previous || previous.bpm === segment.bpm) {
      return [];
    }

    const beats = segment.beatsPerMeasure;
    const startMs = segment.startMs - beatsToMs(beats, segment.bpm);
    const words = Array.from({ length: beats }, (_, beatIndex) => ({
      beatIndex,
      ms: startMs + beatsToMs(beatIndex, segment.bpm),
      // The second measure of the song's pre count is the full count
      word: getPreCountWord(beats + beatIndex, beats),
    })).filter((item): item is CountInWord => item.word !== null);

    return [
      {
        atMs: segment.startMs,
        beats,
        bpm: segment.bpm,
        measure: segment.startMeasure,
        startMs,
        startPosition: msToPosition(map, startMs),
        words,
      },
    ];
  });
