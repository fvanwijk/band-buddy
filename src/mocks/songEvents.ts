import type {
  CueEvent,
  MidiButtonEvent,
  SongEvent,
  TempoChangeEvent,
  TimeSignatureChangeEvent,
} from '../types';

export const createCueEvent = (overrides: Partial<CueEvent> = {}): CueEvent => ({
  beat: 1,
  id: 'cue-1',
  measure: 1,
  text: 'Verse',
  type: 'cue',
  ...overrides,
});

export const createMidiButtonEvent = (
  overrides: Partial<MidiButtonEvent> = {},
): MidiButtonEvent => ({
  beat: 1,
  id: 'midi-button-1',
  measure: 1,
  midiEventId: '1',
  type: 'midiButton',
  ...overrides,
});

export const createTempoChangeEvent = (
  overrides: Partial<TempoChangeEvent> = {},
): TempoChangeEvent => ({
  beat: 1,
  bpm: 100,
  id: 'tempo-change-1',
  measure: 3,
  type: 'tempoChange',
  ...overrides,
});

export const createTimeSignatureChangeEvent = (
  overrides: Partial<TimeSignatureChangeEvent> = {},
): TimeSignatureChangeEvent => ({
  beat: 1,
  id: 'time-signature-change-1',
  measure: 5,
  timeSignature: '3/4',
  type: 'timeSignatureChange',
  ...overrides,
});

export const createSongEvents = (): SongEvent[] => [
  createCueEvent(),
  createMidiButtonEvent(),
  createTempoChangeEvent(),
  createCueEvent({ beat: 3, id: 'cue-2', measure: 4, text: 'Chorus' }),
  createTimeSignatureChangeEvent(),
];
