import { getPreCountBeats, getPreCountWord } from '../hooks/preCount';
import type { PreCountWord } from '../hooks/preCount';
import type { SongEvent } from '../types';
import { EventScheduler } from '../vendor/signal-player';
import type { SchedulableEvent } from '../vendor/signal-player';
import { findSegmentByMeasure, getCountIns, positionToBeat } from './songMap';
import type { SongMap, SongPosition, SongSegment } from './songMap';

export const TIMEBASE = 480; // Ticks per beat
export const LOOK_AHEAD_MS = 50;
export const POLL_INTERVAL_MS = 50;
// Speech synthesis takes some time to start, so cues are handed over earlier than other events
export const CUE_LEAD_MS = 150;
const CUE_LOOK_AHEAD_MS = LOOK_AHEAD_MS + CUE_LEAD_MS;
const MS_PER_MINUTE = 60_000;

export type ClickAccent = 'downbeat' | 'regular' | 'secondary';

type ClickOutput = {
  accent: ClickAccent;
  /** Position in the song, a click of the song's pre count has none */
  position?: SongPosition;
  type: 'click';
};
type CountWordOutput = { type: 'countWord'; word: PreCountWord };
type CueOutput = { text: string; type: 'cue' };

type TransportOutputBody = ClickOutput | CountWordOutput | CueOutput;

export type TransportOutput = TransportOutputBody & {
  /** When to play it, in the time of performance.now() */
  timestamp: number;
};

type TrackEvent = SchedulableEvent & { output: TransportOutputBody };

type Track = {
  /** Wall-clock time (performance.now()) of tick 0 */
  anchor: number;
  /** Number of beats after which the track ends, Infinity for the last segment of the song */
  beatCount: number;
  bpm: number;
  isDone: boolean;
  isStarted: boolean;
  scheduler: EventScheduler<TrackEvent>;
  /** A track is started slightly before its anchor, so its first events are scheduled in time */
  startAheadMs: number;
};

type CreateTrackOptions = {
  anchor: number;
  beatCount: number;
  bpm: number;
  /** Clicks on every beat of the track when given */
  describeBeat?: (beat: number) => Omit<ClickOutput, 'type'>;
  /** Events with a fixed tick, like spoken words and cues */
  extraEvents?: TrackEvent[];
  /** How long before their time events are handed over, short for accurate timing */
  lookAheadMs?: number;
};

export type SongTransportOptions = {
  events?: SongEvent[];
  /**
   * Whether the song starts with a spoken pre count and has spoken count-ins before tempo
   * changes and cues. Only evaluated when the transport is created.
   */
  isSpokenEnabled: boolean;
  map: SongMap;
  /** Wall-clock time (performance.now()) at which the transport starts */
  startWall: number;
};

export type SongTransport = {
  /** Events that have to be played before `now` + the look-ahead time, each only once */
  poll: (now: number) => TransportOutput[];
};

const SECONDARY_ACCENT_BEATS = 6;

const getAccent = (beatInMeasure: number, beatsPerMeasure: number): ClickAccent => {
  if (beatInMeasure === 0) {
    return 'downbeat';
  }

  return beatsPerMeasure === SECONDARY_ACCENT_BEATS && beatInMeasure === 3
    ? 'secondary'
    : 'regular';
};

const beatsToMs = (beats: number, bpm: number) => (beats * MS_PER_MINUTE) / bpm;

const createTrack = ({
  anchor,
  beatCount,
  bpm,
  describeBeat,
  extraEvents = [],
  lookAheadMs = LOOK_AHEAD_MS,
}: CreateTrackOptions): Track => {
  const getEvents = (startTick: number, endTick: number) => {
    const events: TrackEvent[] = [];

    if (describeBeat) {
      const firstBeat = Math.max(0, Math.ceil(startTick / TIMEBASE));
      for (let beat = firstBeat; beat * TIMEBASE < endTick && beat < beatCount; beat++) {
        events.push({ output: { ...describeBeat(beat), type: 'click' }, tick: beat * TIMEBASE });
      }
    }

    for (const event of extraEvents) {
      if (event.tick >= startTick && event.tick < endTick) {
        events.push(event);
      }
    }

    return events.toSorted((a, b) => a.tick - b.tick);
  };

  return {
    anchor,
    beatCount,
    bpm,
    isDone: false,
    isStarted: false,
    scheduler: new EventScheduler<TrackEvent>(getEvents, () => [], 0, TIMEBASE, lookAheadMs),
    startAheadMs: lookAheadMs + POLL_INTERVAL_MS,
  };
};

const getSegmentBeatCount = (map: SongMap, segment: SongSegment) => {
  const next = map.segments[map.segments.indexOf(segment) + 1];
  return next ? next.startBeat - segment.startBeat : Infinity;
};

/**
 * Plays a song as a set of tracks that are each constant in tempo, so every track is scheduled
 * by its own single-tempo EventScheduler:
 * - a track for the pre count at the start of the song (clicks and spoken count);
 * - a track per tempo/time signature segment for its clicks;
 * - a track per segment for its cues, which are handed over earlier than the other events so they
 *   can be spoken on the beat;
 * - a track per tempo change for the spoken count-in, which overlaps the end of the segment
 *   before it. The segment before keeps clicking in its own tempo during the count-in.
 * Tracks are anchored on the wall clock, so they stay in sync without knowing about each other.
 */
export const createSongTransport = ({
  events = [],
  isSpokenEnabled,
  map,
  startWall,
}: SongTransportOptions): SongTransport => {
  const tracks: Track[] = [];
  const [firstSegment] = map.segments;

  const preCountBeats = isSpokenEnabled ? getPreCountBeats(firstSegment.beatsPerMeasure) : 0;
  // All tracks of the song start after the pre count
  const songStart = startWall + beatsToMs(preCountBeats, firstSegment.bpm);

  if (preCountBeats > 0) {
    const { beatsPerMeasure } = firstSegment;
    const words = Array.from({ length: preCountBeats }, (_, beat) => ({
      beat,
      word: getPreCountWord(beat, beatsPerMeasure),
    }));

    tracks.push(
      createTrack({
        anchor: startWall,
        beatCount: preCountBeats,
        bpm: firstSegment.bpm,
        describeBeat: (beat) => ({ accent: getAccent(beat % beatsPerMeasure, beatsPerMeasure) }),
        extraEvents: words.flatMap(({ beat, word }) =>
          word ? [{ output: { type: 'countWord' as const, word }, tick: beat * TIMEBASE }] : [],
        ),
      }),
    );
  }

  const cueEventsBySegment = new Map<SongSegment, TrackEvent[]>();
  if (isSpokenEnabled) {
    for (const event of events) {
      if (event.type !== 'cue') {
        continue;
      }

      const segment = findSegmentByMeasure(map, event.measure);
      const beatsIntoSegment = positionToBeat(map, event.measure, event.beat) - segment.startBeat;
      cueEventsBySegment.set(segment, [
        ...(cueEventsBySegment.get(segment) ?? []),
        {
          output: { text: event.text, type: 'cue' },
          tick: beatsIntoSegment * TIMEBASE,
        },
      ]);
    }
  }

  for (const segment of map.segments) {
    const { beatsPerMeasure } = segment;
    const beatCount = getSegmentBeatCount(map, segment);

    tracks.push(
      createTrack({
        anchor: songStart + segment.startMs,
        beatCount,
        bpm: segment.bpm,
        describeBeat: (beat) => ({
          accent: getAccent(beat % beatsPerMeasure, beatsPerMeasure),
          position: {
            beat: (beat % beatsPerMeasure) + 1,
            measure: segment.startMeasure + Math.floor(beat / beatsPerMeasure),
          },
        }),
      }),
    );

    const cues = cueEventsBySegment.get(segment);
    if (cues) {
      tracks.push(
        createTrack({
          anchor: songStart + segment.startMs,
          beatCount,
          bpm: segment.bpm,
          extraEvents: cues,
          lookAheadMs: CUE_LOOK_AHEAD_MS,
        }),
      );
    }
  }

  if (isSpokenEnabled) {
    // A count-in that would start before the song can't be played, validation reports these
    for (const countIn of getCountIns(map).filter(({ startMs }) => startMs >= 0)) {
      tracks.push(
        createTrack({
          anchor: songStart + countIn.startMs,
          beatCount: countIn.beats,
          bpm: countIn.bpm,
          extraEvents: countIn.words.map(({ beatIndex, word }) => ({
            output: { type: 'countWord', word },
            tick: beatIndex * TIMEBASE,
          })),
        }),
      );
    }
  }

  const poll = (now: number) => {
    const outputs: TransportOutput[] = [];

    for (const track of tracks) {
      if (track.isDone || now + track.startAheadMs < track.anchor) {
        continue;
      }

      if (!track.isStarted) {
        track.scheduler.startAt(track.anchor);
        track.isStarted = true;
      }

      for (const { event, timestamp } of track.scheduler.readNextEvents(track.bpm, now)) {
        outputs.push({ ...event.output, timestamp });
      }

      track.isDone = track.scheduler.scheduledTick >= track.beatCount * TIMEBASE;
    }

    return outputs.toSorted((a, b) => a.timestamp - b.timestamp);
  };

  return { poll };
};
