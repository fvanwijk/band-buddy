import { describe, expect, it } from 'vite-plus/test';

import { createInstrument } from '../../../mocks/instruments';
import {
  getInstrumentControlChangeControllerOptions,
  getInstrumentControlChangeLabel,
  getInstrumentControlChangeValueOptions,
  getInstrumentProgramChangeLabel,
  getInstrumentProgramChangeOptions,
} from './instrumentMidiLookupTables';

describe('instrumentMidiLookupTables', () => {
  it('returns 128 controller options for Rev2 with CC32 special label', () => {
    const instrument = createInstrument({ name: 'Prophet Rev2' });

    const options = getInstrumentControlChangeControllerOptions(instrument);

    expect(options).toHaveLength(128);
    expect(options?.[0]).toEqual({ label: '0', value: '0' });
    expect(options?.[32]).toEqual({ label: 'Bank Select (32)', value: '32' });
    expect(options?.[127]).toEqual({ label: '127', value: '127' });
  });

  it('returns Rev2 bank labels for CC32 values while keeping 128 values available', () => {
    const instrument = createInstrument({ name: 'Prophet Rev2' });

    const options = getInstrumentControlChangeValueOptions(instrument, 32);

    expect(options).toHaveLength(128);
    expect(options?.[0]).toEqual({ label: 'User Bank 1', value: '0' });
    expect(options?.[5]).toEqual({ label: 'Factory Bank 2', value: '5' });
    expect(options?.[127]).toEqual({ label: '127', value: '127' });
  });

  it('returns undefined CC lookup options for instruments without lookup tables', () => {
    const instrument = createInstrument({ name: 'Yamaha Montage' });

    expect(getInstrumentControlChangeControllerOptions(instrument)).toBeUndefined();
    expect(getInstrumentControlChangeValueOptions(instrument, 32)).toBeUndefined();
  });

  it('formats mapped Rev2 CC action labels with controller and value names', () => {
    const instrument = createInstrument({ name: 'Prophet Rev2' });

    const label = getInstrumentControlChangeLabel(
      {
        controller: 32,
        instrumentId: instrument.id,
        type: 'controlChange',
        value: 5,
      },
      instrument,
    );

    expect(label).toBe('Bank Select (32) - Factory Bank 2 (#5)');
  });

  it('returns grouped Nord program options and labels from the lookup table', () => {
    const instrument = createInstrument({ name: 'Nord Stage 4' });

    const options = getInstrumentProgramChangeOptions(instrument);
    const label = getInstrumentProgramChangeLabel(instrument, 7);

    expect(options).toHaveLength(8);
    expect(options?.[0]).toEqual(
      expect.objectContaining({
        label: 'Bank A',
      }),
    );
    expect(label).toBe('A-18 (7)');
  });
});
