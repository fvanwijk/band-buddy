import type { Instrument, MidiEventAction } from '../types';
import { registerOutboundMidiMessage } from './midiEventLogBus';

type MidiOutputLike = {
  id: string;
  name?: string;
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

function getOutputName(output: MidiOutputLike) {
  return output.name || output.id;
}

function publishProgramChangeLog(
  output: MidiOutputLike,
  channels: number[],
  programChange: number,
) {
  registerOutboundMidiMessage({
    channels,
    data: [0xc0 + ((channels[0] ?? 1) - 1), programChange],
    deviceId: output.id,
    deviceName: getOutputName(output),
    emitLogEntry: true,
    source: 'song-event',
    type: 'programChange',
    value: programChange,
  });
}

function publishControlChangeLog(
  output: MidiOutputLike,
  channels: number[],
  controller: number,
  value: number,
) {
  registerOutboundMidiMessage({
    channels,
    data: [0xb0 + ((channels[0] ?? 1) - 1), controller, value],
    deviceId: output.id,
    deviceName: getOutputName(output),
    emitLogEntry: true,
    source: 'song-event',
    type: 'cc',
    value: controller,
  });
}

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
  publishControlChangeLog(output, options.channels, 99, action.parameterMsb);
  output.sendControlChange(98, action.parameterLsb, options);
  publishControlChangeLog(output, options.channels, 98, action.parameterLsb);
  output.sendControlChange(6, action.valueMsb, options);
  publishControlChangeLog(output, options.channels, 6, action.valueMsb);

  if (typeof action.valueLsb === 'number') {
    output.sendControlChange(38, action.valueLsb, options);
    publishControlChangeLog(output, options.channels, 38, action.valueLsb);
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
    publishProgramChangeLog(output, channels, action.programChange);
    return;
  }

  if (action.type === 'controlChange') {
    if (!output.sendControlChange) {
      return;
    }

    output.sendControlChange(action.controller, action.value, { channels });
    publishControlChangeLog(output, channels, action.controller, action.value);
    return;
  }

  if (action.type === 'nrpn') {
    sendNrpnToOutput(output, action, { channels });
  }
}
