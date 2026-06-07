import type { Instrument, InstrumentTable } from '../types';

export const createInstrument = (overrides: Partial<Instrument> = {}): Instrument => ({
  id: '0',
  midiChannels: [1],
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

export const createInstrumentTable = (overrides: Partial<Instrument> = {}): InstrumentTable => {
  const { id, midiChannels, programNames, ...table } = createInstrument(overrides);
  return {
    ...table,
    midiChannels:
      midiChannels && midiChannels.length > 0 ? JSON.stringify(midiChannels) : undefined,
    programNames: programNames ? JSON.stringify(programNames) : undefined,
  };
};

export const createInstrumentsTable = () => createInstruments().map(({ id, ...table }) => table);
