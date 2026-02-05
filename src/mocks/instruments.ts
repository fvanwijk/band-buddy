import type { Instrument } from '../types';

export const createInstrument = (overrides: Partial<Instrument> = {}): Instrument => ({
  id: '1',
  midiInId: 'midi-in',
  midiInName: 'MIDI In',
  midiOutId: 'midi-out',
  midiOutName: 'MIDI Out',
  name: 'Nord Stage 4',
  programNames: undefined,
  ...overrides,
});
