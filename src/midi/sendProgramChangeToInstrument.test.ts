import { describe, expect, it, vi } from 'vite-plus/test';

import { createInstrument } from '../mocks/instruments';
import type { MidiEventAction } from '../types';
import { sendMidiActionToInstrument } from './sendProgramChangeToInstrument';

describe('sendMidiActionToInstrument', () => {
  const instrument = createInstrument({ id: 'inst-1', midiChannels: [3] });

  it('sends a program change message', () => {
    const sendProgramChange = vi.fn();

    sendMidiActionToInstrument(
      {
        instrumentId: instrument.id,
        programChange: 12,
        type: 'programChange',
      },
      instrument,
      [{ id: '1', sendProgramChange }],
    );

    expect(sendProgramChange).toHaveBeenCalledWith(12, { channels: [3] });
  });

  it('sends a control change message', () => {
    const sendControlChange = vi.fn();
    const sendProgramChange = vi.fn();

    sendMidiActionToInstrument(
      {
        controller: 32,
        instrumentId: instrument.id,
        type: 'controlChange',
        value: 5,
      },
      instrument,
      [{ id: '1', sendControlChange, sendProgramChange }],
    );

    expect(sendControlChange).toHaveBeenCalledWith(32, 5, { channels: [3] });
  });

  it('sends NRPN as CC99, CC98, CC6, and optional CC38', () => {
    const sendControlChange = vi.fn();
    const sendProgramChange = vi.fn();

    const action: Extract<MidiEventAction, { type: 'nrpn' }> = {
      instrumentId: instrument.id,
      parameterLsb: 7,
      parameterMsb: 1,
      type: 'nrpn',
      valueLsb: 3,
      valueMsb: 64,
    };

    sendMidiActionToInstrument(action, instrument, [
      { id: '1', sendControlChange, sendProgramChange },
    ]);

    expect(sendControlChange).toHaveBeenNthCalledWith(1, 99, 1, { channels: [3] });
    expect(sendControlChange).toHaveBeenNthCalledWith(2, 98, 7, { channels: [3] });
    expect(sendControlChange).toHaveBeenNthCalledWith(3, 6, 64, { channels: [3] });
    expect(sendControlChange).toHaveBeenNthCalledWith(4, 38, 3, { channels: [3] });
  });
});
