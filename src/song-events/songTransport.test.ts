import { describe, expect, it } from 'vite-plus/test';

import {
  createCueEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../mocks/songEvents';
import type { SongEvent } from '../types';
import { buildSongMap } from './songMap';
import { createSongTransport, CUE_LEAD_MS, LOOK_AHEAD_MS, POLL_INTERVAL_MS } from './songTransport';
import type { TransportOutput } from './songTransport';

type RunOptions = {
  bpm?: number;
  cueOffsetBeats?: number;
  durationMs?: number;
  events?: SongEvent[];
  isSpokenEnabled?: boolean;
  /** Time between polls, cycles when it's a list */
  pollSteps?: number[];
  startPosition?: { beat?: number; measure: number };
  timeSignature?: string;
};

const START_WALL = 1000;

// Simulates the timer of the hook and collects everything the transport asks to play
const run = ({
  bpm = 60,
  cueOffsetBeats,
  durationMs = 30_000,
  events = [],
  isSpokenEnabled = true,
  pollSteps = [POLL_INTERVAL_MS],
  startPosition,
  timeSignature = '4/4',
}: RunOptions = {}) => {
  const transport = createSongTransport({
    cueOffsetBeats,
    events,
    isSpokenEnabled,
    map: buildSongMap({ bpm, events, timeSignature }),
    startPosition,
    startWall: START_WALL,
  });
  const outputs: TransportOutput[] = [];

  for (let now = START_WALL, step = 0; now < START_WALL + durationMs; step++) {
    outputs.push(...transport.poll(now));
    now += pollSteps[step % pollSteps.length];
  }

  return outputs.map((output) => ({ ...output, timestamp: output.timestamp - START_WALL }));
};

const timestamps = (outputs: ReturnType<typeof run>) =>
  outputs.map(({ timestamp }) => Math.round(timestamp * 1000) / 1000);

const getClicks = (outputs: ReturnType<typeof run>) =>
  outputs.flatMap((output) => (output.type === 'click' ? [output] : []));

describe('createSongTransport', () => {
  const sixtyToHundred = [createTempoChangeEvent({ bpm: 100, measure: 3 })];

  describe('tempo change with a count-in', () => {
    // The song starts after a two measure pre count of 8 s
    const SONG_START = 8000;
    const outputs = run({ events: sixtyToHundred });
    const songClicks = getClicks(outputs).filter(({ position }) => position);

    it('counts in "one two three four" so the next "one" is on the downbeat of the change', () => {
      const countWords = outputs.filter(
        ({ timestamp, type }) => type === 'countWord' && timestamp > SONG_START,
      );

      expect(
        countWords.map((output) => ({
          timestamp: Math.round(output.timestamp),
          word: output.type === 'countWord' ? output.word : undefined,
        })),
      ).toEqual([
        { timestamp: SONG_START + 5600, word: 'one' },
        { timestamp: SONG_START + 6200, word: 'two' },
        { timestamp: SONG_START + 6800, word: 'three' },
        { timestamp: SONG_START + 7400, word: 'four' },
      ]);
    });

    it('keeps clicking in the old tempo while counting in', () => {
      const oldClicks = songClicks.filter(({ timestamp }) => timestamp < SONG_START + 8000);

      expect(oldClicks.map(({ position }) => position)).toEqual([
        { beat: 1, measure: 1 },
        { beat: 2, measure: 1 },
        { beat: 3, measure: 1 },
        { beat: 4, measure: 1 },
        { beat: 1, measure: 2 },
        { beat: 2, measure: 2 },
        { beat: 3, measure: 2 },
        { beat: 4, measure: 2 },
      ]);
      expect(timestamps(oldClicks)).toEqual(
        [0, 1, 2, 3, 4, 5, 6, 7].map((s) => SONG_START + s * 1000),
      );
    });

    it('clicks in the new tempo from the change on', () => {
      const newClicks = songClicks.filter(({ timestamp }) => timestamp >= SONG_START + 8000);

      expect(newClicks.slice(0, 5).map(({ position }) => position)).toEqual([
        { beat: 1, measure: 3 },
        { beat: 2, measure: 3 },
        { beat: 3, measure: 3 },
        { beat: 4, measure: 3 },
        { beat: 1, measure: 4 },
      ]);
      expect(timestamps(newClicks.slice(0, 5))).toEqual(
        [0, 600, 1200, 1800, 2400].map((ms) => SONG_START + 8000 + ms),
      );
    });

    it('plays the pre count of the song before everything else', () => {
      const preCount = outputs.filter(({ timestamp }) => timestamp < SONG_START);

      expect(getClicks(preCount)).toHaveLength(8);
      expect(getClicks(preCount).every(({ position }) => position === undefined)).toBe(true);
      expect(
        preCount.flatMap((output) =>
          output.type === 'countWord' ? [[output.timestamp, output.word]] : [],
        ),
      ).toEqual([
        [0, 'one'],
        [2000, 'two'],
        [4000, 'one'],
        [5000, 'two'],
        [6000, 'three'],
        [7000, 'four'],
      ]);
    });

    it('plays every event exactly once, in order, whatever the poll interval does', () => {
      const jittery = run({ events: sixtyToHundred, pollSteps: [50, 37, 49, 21, 44] });

      expect(timestamps(jittery)).toEqual(timestamps(outputs));
      expect(jittery.map(({ type }) => type)).toEqual(outputs.map(({ type }) => type));
    });
  });

  it('keeps a click on every beat without changes', () => {
    const outputs = run({ bpm: 120, durationMs: 4000, isSpokenEnabled: false });

    expect(timestamps(outputs.filter(({ type }) => type === 'click')).slice(0, 8)).toEqual([
      0, 500, 1000, 1500, 2000, 2500, 3000, 3500,
    ]);
    expect(outputs.every(({ type }) => type === 'click')).toBe(true);
    expect(outputs[0]).toMatchObject({
      accent: 'downbeat',
      position: { beat: 1, measure: 1 },
    });
    expect(outputs[1]).toMatchObject({ accent: 'regular', position: { beat: 2, measure: 1 } });
  });

  describe('starting from a position', () => {
    it('plays the pre count and then continues from the measure and beat', () => {
      const outputs = run({
        durationMs: 12_000,
        events: [createCueEvent({ beat: 1, measure: 3, text: 'Chorus' })],
        startPosition: { beat: 1, measure: 3 },
      });
      const clicks = getClicks(outputs);
      const preCountClicks = clicks.filter(({ position }) => !position);
      const songClicks = clicks.filter(({ position }) => position);

      expect(timestamps(preCountClicks)).toEqual([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]);
      expect(songClicks[0]).toMatchObject({ position: { beat: 1, measure: 3 }, timestamp: 8000 });
      expect(songClicks[1]).toMatchObject({ position: { beat: 2, measure: 3 }, timestamp: 9000 });
      expect(outputs.filter(({ type }) => type === 'cue')).toMatchObject([
        { text: 'Chorus', timestamp: 8000 },
      ]);
    });

    it('skips cues before the start position', () => {
      const outputs = run({
        events: [
          createCueEvent({ beat: 1, measure: 2, text: 'Verse' }),
          createCueEvent({ beat: 1, measure: 4, text: 'Chorus' }),
        ],
        startPosition: { beat: 1, measure: 3 },
      });

      expect(outputs.flatMap((output) => (output.type === 'cue' ? [output.text] : []))).toEqual([
        'Chorus',
      ]);
    });

    it('counts in with the tempo and time signature at the start position', () => {
      const outputs = run({
        events: [createTempoChangeEvent({ bpm: 120, measure: 3 })],
        startPosition: { beat: 1, measure: 4 },
      });
      const songClicks = getClicks(outputs).filter(({ position }) => position);

      // Two measures of 4 beats at 120 bpm
      expect(songClicks[0]).toMatchObject({ position: { beat: 1, measure: 4 }, timestamp: 4000 });
      expect(songClicks[1].timestamp).toBe(4500);
    });
  });

  it('only speaks and counts in when enabled', () => {
    const outputs = run({
      events: [...sixtyToHundred, createCueEvent({ beat: 1, measure: 2 })],
      isSpokenEnabled: false,
    });

    expect(outputs.every(({ type }) => type === 'click')).toBe(true);
    // No pre count, so the tempo change of measure 3 is at 8 s
    const clicks = getClicks(outputs).filter(({ position }) => position?.measure === 3);
    expect(clicks[0].timestamp).toBe(8000);
    expect(clicks[1].timestamp).toBeCloseTo(8600, 5);
  });

  it('speaks cues on their measure and beat', () => {
    const outputs = run({
      events: [
        ...sixtyToHundred,
        createCueEvent({ beat: 1, id: 'start', measure: 1, text: 'Go' }),
        createCueEvent({ beat: 3, id: 'verse', measure: 2, text: 'Verse' }),
        createCueEvent({ beat: 2, id: 'fast', measure: 3, text: 'Faster' }),
      ],
    });

    expect(
      outputs.flatMap((output) =>
        output.type === 'cue' ? [[Math.round(output.timestamp), output.text]] : [],
      ),
    ).toEqual([
      [8000, 'Go'],
      [8000 + 6000, 'Verse'],
      [8000 + 8600, 'Faster'],
    ]);
  });

  describe('cue offset', () => {
    const getCues = (outputs: ReturnType<typeof run>) =>
      outputs.flatMap((output) =>
        output.type === 'cue' ? [[Math.round(output.timestamp), output.text]] : [],
      );

    it('plays cues the given number of beats earlier, also across a measure', () => {
      const outputs = run({
        cueOffsetBeats: -2,
        events: [createCueEvent({ beat: 1, measure: 3, text: 'Chorus' })],
      });

      // Measure 3 beat 1 is at 8 s + 8 s, the cue is on measure 2 beat 3
      expect(getCues(outputs)).toEqual([[8000 + 6000, 'Chorus']]);
    });

    it('plays cues in the tempo of the segment they end up in', () => {
      const outputs = run({
        cueOffsetBeats: -2,
        events: [...sixtyToHundred, createCueEvent({ beat: 1, measure: 3, text: 'Chorus' })],
      });

      expect(getCues(outputs)).toEqual([[8000 + 6000, 'Chorus']]);
    });

    it('plays cues that would be before the song at the start of the song', () => {
      const outputs = run({
        cueOffsetBeats: -2,
        events: [createCueEvent({ beat: 2, measure: 1, text: 'Go' })],
      });

      expect(getCues(outputs)).toEqual([[8000, 'Go']]);
    });

    describe('pre count', () => {
      // Words of the song's own pre count aren't included, they come before the song starts
      const getSongWords = (outputs: ReturnType<typeof run>) =>
        outputs.flatMap((output) =>
          output.type === 'countWord' && output.timestamp >= 8000
            ? [[Math.round(output.timestamp), output.word]]
            : [],
        );
      const chorus = (overrides: Parameters<typeof createCueEvent>[0] = {}) =>
        createCueEvent({ beat: 1, measure: 4, preCount: true, text: 'Chorus', ...overrides });

      it('counts the beats after the cue text up to the cue position', () => {
        const outputs = run({ cueOffsetBeats: -4, events: [chorus()] });

        // Measure 4 beat 1 is at 12 s + 8 s, the cue text is 4 beats earlier
        expect(getCues(outputs)).toEqual([[8000 + 8000, 'Chorus']]);
        expect(getSongWords(outputs)).toEqual([
          [8000 + 9000, 'two'],
          [8000 + 10_000, 'three'],
          [8000 + 11_000, 'four'],
        ]);
      });

      it('counts the last beats of the count for a smaller offset', () => {
        const outputs = run({ cueOffsetBeats: -2, events: [chorus()] });

        expect(getSongWords(outputs)).toEqual([[8000 + 11_000, 'four']]);
      });

      it('is not audible when the offset is -1 or 0', () => {
        for (const cueOffsetBeats of [-1, 0]) {
          const outputs = run({ cueOffsetBeats, events: [chorus()] });

          expect(getSongWords(outputs)).toEqual([]);
        }
      });

      it('counts at most two measures', () => {
        const outputs = run({ cueOffsetBeats: -8, events: [chorus()] });

        // "Chorus . two . | one two three four" where the silent beats have no word
        expect(getSongWords(outputs).map(([, word]) => word)).toEqual([
          'two',
          'one',
          'two',
          'three',
          'four',
        ]);
      });

      it('does nothing without the pre count option', () => {
        const outputs = run({ cueOffsetBeats: -4, events: [chorus({ preCount: false })] });

        expect(getSongWords(outputs)).toEqual([]);
      });
    });
  });

  it('follows a time signature change without counting in', () => {
    const outputs = run({
      events: [createTimeSignatureChangeEvent({ measure: 2, timeSignature: '3/4' })],
      isSpokenEnabled: false,
    });
    const clicks = getClicks(outputs).slice(0, 9);

    expect(clicks.map(({ position }) => position)).toEqual([
      { beat: 1, measure: 1 },
      { beat: 2, measure: 1 },
      { beat: 3, measure: 1 },
      { beat: 4, measure: 1 },
      { beat: 1, measure: 2 },
      { beat: 2, measure: 2 },
      { beat: 3, measure: 2 },
      { beat: 1, measure: 3 },
      { beat: 2, measure: 3 },
    ]);
    expect(clicks.map(({ accent }) => accent)).toEqual([
      'downbeat',
      'regular',
      'regular',
      'regular',
      'downbeat',
      'regular',
      'regular',
      'downbeat',
      'regular',
    ]);
  });

  it('counts in the new time signature when the tempo changes with it', () => {
    const outputs = run({
      events: [
        createTempoChangeEvent({ bpm: 120, measure: 2 }),
        createTimeSignatureChangeEvent({ measure: 2, timeSignature: '3/4' }),
      ],
    });
    const words = outputs.filter(({ timestamp, type }) => type === 'countWord' && timestamp > 8000);

    // The song starts at 8 s and measure 2 at 12 s, the 3 beat count-in takes 1.5 s
    expect(timestamps(words)).toEqual([8000 + 4000 - 1500, 8000 + 4000 - 1000, 8000 + 4000 - 500]);
  });

  it('skips a count-in that would start before the song', () => {
    const outputs = run({ events: [createTempoChangeEvent({ bpm: 30, measure: 2 })] });

    // Only the pre count of the song is spoken
    expect(outputs.filter(({ type }) => type === 'countWord')).toHaveLength(6);
    expect(
      Math.max(...outputs.filter(({ type }) => type === 'countWord').map((o) => o.timestamp)),
    ).toBe(7000);
  });

  it('hands cues over early enough to speak them on the beat, but clicks just in time', () => {
    const events = [createCueEvent({ beat: 1, measure: 2, text: 'Verse' })];
    const transport = createSongTransport({
      events,
      isSpokenEnabled: true,
      map: buildSongMap({ bpm: 60, events, timeSignature: '4/4' }),
      startWall: 0,
    });

    const leadTimes = { click: [] as number[], cue: [] as number[] };
    for (let now = 0; now < 12_000; now += POLL_INTERVAL_MS) {
      for (const output of transport.poll(now)) {
        if (output.type === 'click' || output.type === 'cue') {
          leadTimes[output.type].push(output.timestamp - now);
        }
      }
    }

    expect(leadTimes.cue).toHaveLength(1);
    expect(leadTimes.cue[0]).toBeGreaterThanOrEqual(CUE_LEAD_MS);
    expect(Math.max(...leadTimes.click)).toBeLessThanOrEqual(LOOK_AHEAD_MS);
  });

  it('accents the middle of a 6/8 measure', () => {
    const outputs = run({
      bpm: 120,
      durationMs: 5000,
      isSpokenEnabled: false,
      timeSignature: '6/8',
    });

    expect(
      getClicks(outputs)
        .slice(0, 6)
        .map(({ accent }) => accent),
    ).toEqual(['downbeat', 'regular', 'regular', 'secondary', 'regular', 'regular']);
  });
});
