import type { Instrument, InstrumentTable } from '../types';

export const createInstrument = (overrides: Partial<Instrument> = {}): Instrument => ({
  id: '0',
  midiInId: 'midi-in',
  midiInName: 'MIDI In',
  midiOutId: 'midi-out',
  midiOutName: 'MIDI Out',
  name: 'Nord Stage 4',
  programNames: undefined,
  ...overrides,
});

export const createInstrumentTable = (
  overrides: Partial<InstrumentTable> = {},
): InstrumentTable => {
  const { id, programNames, ...table } = createInstrument(overrides);
  return { ...table, programNames: programNames ? JSON.stringify(programNames) : undefined };
};
