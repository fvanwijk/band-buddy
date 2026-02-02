import type { Instrument } from '../types';

export const createInstrument = (overrides: Partial<Instrument> = {}): Instrument => ({
  id: '1',
  midiInId: 'midi-in',
  midiInName: 'MIDI In',
  midiOutId: undefined,
  midiOutName: undefined,
  name: 'Yamaha',
  programNames: undefined,
  ...overrides,
});
