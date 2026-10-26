import type { SongEvent } from '../types';
import { isChangeEvent } from './groupEventsByPosition';
import { buildSongMap, findSegmentByMeasure, getCountIns, positionToMs } from './songMap';

export type SongEventIssueCode =
  | 'beatOutOfRange'
  | 'changeOnFirstMeasure'
  | 'countInBeforeSongStart'
  | 'countInOverlapsPreviousChange'
  | 'cueOverlapsCountIn'
  | 'duplicateEvent'
  | 'emptyCueText';

export type SongEventIssue = {
  code: SongEventIssueCode;
  eventId: string;
  message: string;
  severity: 'error' | 'warning';
};

type ValidateSongEventsOptions = {
  bpm?: number;
  timeSignature?: string;
};

const DUPLICATE_LABELS = {
  cue: 'cue',
  tempoChange: 'tempo change',
  timeSignatureChange: 'time signature change',
} as const;

/**
 * Checks events for problems the schema can't see. Errors make the playback unreliable, warnings
 * point at things that probably aren't intended.
 * Timing based checks (count-ins and cues) need the song's tempo and are skipped without it.
 */
export const validateSongEvents = (
  events: SongEvent[],
  { bpm, timeSignature }: ValidateSongEventsOptions = {},
): SongEventIssue[] => {
  const issues: SongEventIssue[] = [];
  const map = buildSongMap({ bpm: bpm ?? 120, events, timeSignature });
  const seenPositions = new Set<string>();

  for (const event of events) {
    if (event.type === 'cue' && !event.text.trim()) {
      issues.push({
        code: 'emptyCueText',
        eventId: event.id,
        message: 'A cue needs text to speak',
        severity: 'error',
      });
    }

    if (isChangeEvent(event) && event.measure === 1) {
      issues.push({
        code: 'changeOnFirstMeasure',
        eventId: event.id,
        message: "Measure 1 uses the song's own tempo and time signature, so it can't change",
        severity: 'error',
      });
    }

    if (event.type !== 'midiButton') {
      const key = `${event.type}:${event.measure}:${event.beat}`;
      if (seenPositions.has(key)) {
        issues.push({
          code: 'duplicateEvent',
          eventId: event.id,
          message: `There already is a ${DUPLICATE_LABELS[event.type]} at measure ${event.measure}, beat ${event.beat}`,
          severity: 'error',
        });
      }
      seenPositions.add(key);
    }

    const { beatsPerMeasure } = findSegmentByMeasure(map, event.measure);
    if (event.beat > beatsPerMeasure) {
      issues.push({
        code: 'beatOutOfRange',
        eventId: event.id,
        message: `Measure ${event.measure} only has ${beatsPerMeasure} beats`,
        severity: 'error',
      });
    }
  }

  if (!bpm) {
    return issues;
  }

  const countIns = getCountIns(map);

  for (const countIn of countIns) {
    const change = events.find(
      (event) => event.type === 'tempoChange' && event.measure === countIn.measure,
    );
    if (!change) {
      continue;
    }

    const segmentIndex = map.segments.findIndex(
      (segment) => segment.startMeasure === countIn.measure,
    );
    const previousSegment = map.segments[segmentIndex - 1];

    if (countIn.startMs < 0) {
      issues.push({
        code: 'countInBeforeSongStart',
        eventId: change.id,
        message: `The count-in for measure ${countIn.measure} would start before the song does`,
        severity: 'error',
      });
    } else if (previousSegment && countIn.startMs < previousSegment.startMs) {
      issues.push({
        code: 'countInOverlapsPreviousChange',
        eventId: change.id,
        message: `The count-in for measure ${countIn.measure} would start before the previous change`,
        severity: 'warning',
      });
    }
  }

  for (const event of events) {
    if (event.type !== 'cue') {
      continue;
    }

    const ms = positionToMs(map, event.measure, event.beat);
    if (countIns.some((countIn) => ms >= countIn.startMs && ms < countIn.atMs)) {
      issues.push({
        code: 'cueOverlapsCountIn',
        eventId: event.id,
        message: 'This cue is spoken during a count-in',
        severity: 'warning',
      });
    }
  }

  return issues;
};
