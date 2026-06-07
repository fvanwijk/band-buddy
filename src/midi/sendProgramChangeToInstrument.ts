import type { Instrument, MidiEventAction } from '../types';

type MidiOutputLike = {
  id: string;
  sendControlChange?: (
    controller: number,
    value: number,
    options?: { channels?: number | number[]; time?: number | string },
  ) => unknown;
  sendProgramChange: (
    program?: number,
    options?: { channels?: number | number[]; time?: number | string },
  ) => unknown;
};

function getMidiChannels(instrument: Instrument): number[] {
  if (!instrument.midiChannels || instrument.midiChannels.length === 0) {
    return [1];
  }

  return instrument.midiChannels
    .filter(
      (channel): channel is number => Number.isInteger(channel) && channel >= 1 && channel <= 16,
    )
    .sort((a, b) => a - b);
}

export function sendProgramChangeToInstrument(
  instrument: Instrument,
  outputs: MidiOutputLike[],
  programChange: number,
) {
  sendMidiActionToInstrument(
    {
      instrumentId: instrument.id,
      programChange,
      type: 'programChange',
    },
    instrument,
    outputs,
  );
}

function sendNrpnToOutput(
  output: MidiOutputLike,
  action: Extract<MidiEventAction, { type: 'nrpn' }>,
  options: { channels: number[] },
) {
  if (!output.sendControlChange) {
    return;
  }

  output.sendControlChange(99, action.parameterMsb, options);
  output.sendControlChange(98, action.parameterLsb, options);
  output.sendControlChange(6, action.valueMsb, options);

  if (typeof action.valueLsb === 'number') {
    output.sendControlChange(38, action.valueLsb, options);
  }
}

export function sendMidiActionToInstrument(
  action: MidiEventAction,
  instrument: Instrument,
  outputs: MidiOutputLike[],
) {
  if (!instrument.midiInId) {
    return;
  }

  const output = outputs.find((device) => device.id === instrument.midiInId);
  if (!output) {
    return;
  }

  const channels = getMidiChannels(instrument);

  if (!action.type || action.type === 'programChange') {
    output.sendProgramChange(action.programChange, { channels });
    return;
  }

  if (action.type === 'controlChange') {
    if (!output.sendControlChange) {
      return;
    }

    output.sendControlChange(action.controller, action.value, { channels });
    return;
  }

  if (action.type === 'nrpn') {
    sendNrpnToOutput(output, action, { channels });
  }
}
