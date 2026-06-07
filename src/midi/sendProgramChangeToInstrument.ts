import type { Instrument } from '../types';

type MidiOutputLike = {
  id: string;
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
  if (!instrument.midiInId) {
    return;
  }

  const output = outputs.find((device) => device.id === instrument.midiInId);
  if (!output) {
    return;
  }

  output.sendProgramChange(programChange, { channels: getMidiChannels(instrument) });
}
