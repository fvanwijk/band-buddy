import type { MidiSelectOption } from './instrumentMidiLookupTables';

export function createRev2ProgramOptions(): MidiSelectOption[] {
  const options: MidiSelectOption[] = [];

  for (let program = 0; program < 128; program++) {
    options.push({
      label: `P${program + 1} (${program})`,
      value: String(program),
    });
  }

  return options;
}
