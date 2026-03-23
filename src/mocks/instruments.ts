import type { Instrument, InstrumentTable } from '../types';

export const createInstrument = (overrides: Partial<Instrument> = {}): Instrument => ({
  id: '0',
  midiInId: '1',
  midiInName: 'MIDI In',
  midiOutId: '2',
  midiOutName: 'MIDI Out',
  name: 'Nord Stage 4',
  programNames: undefined,
  ...overrides,
});

export const createInstruments = () => [
  createInstrument(),
  createInstrument({ id: '1', name: 'Yamaha Montage' }),
];

export const createInstrumentTable = (
  overrides: Partial<InstrumentTable> = {},
): InstrumentTable => {
  const { id, programNames, ...table } = createInstrument(overrides);
  return { ...table, programNames: programNames ? JSON.stringify(programNames) : undefined };
};

export const createInstrumentsTable = () => createInstruments().map(({ id, ...table }) => table);
