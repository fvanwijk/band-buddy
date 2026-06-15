import type { Instrument, MidiEvent } from '../../../types';
import { createNordProgramOptions } from './useNordProgramOptions';
import { createRev2ProgramOptions } from './useRev2ProgramOptions';

export type MidiSelectOption = {
  label: string;
  value: string;
};

export type MidiSelectOptionGroup = {
  label: string;
  options: MidiSelectOption[];
};

export type MidiSelectOptions = MidiSelectOption[] | MidiSelectOptionGroup[];

type MidiAction = MidiEvent['events'][number];
type ControlChangeAction = Extract<MidiAction, { type: 'controlChange' }>;
type NrpnAction = Extract<MidiAction, { type: 'nrpn' }>;

type InstrumentMidiLookup = {
  controlChange?: {
    controllerLabelByNumber?: Partial<Record<number, string>>;
    defaultController?: number;
    valueLabelByControllerAndValue?: Partial<Record<number, Partial<Record<number, string>>>>;
  };
  instrumentNameIncludes: string[];
  nrpn?: {
    parameterLabelByNumber?: Record<string, string>;
  };
  programChange?: {
    options: MidiSelectOptions;
  };
};

const rev2BankValueLabelByValue: Partial<Record<number, string>> = {
  0: 'User Bank 1',
  1: 'User Bank 2',
  2: 'User Bank 3',
  3: 'User Bank 4',
  4: 'Factory Bank 1',
  5: 'Factory Bank 2',
  6: 'Factory Bank 3',
  7: 'Factory Bank 4',
};

const instrumentMidiLookups: InstrumentMidiLookup[] = [
  {
    controlChange: {
      controllerLabelByNumber: {
        // oxlint-disable sort-keys-fix/sort-keys-fix
        0: 'Global - Bank select MSB (0)',
        2: 'Organ - Section enable scene II (2)',
        3: 'Piano - Section enable scene II (3)',
        5: 'Synth - Section enable scene II (5)',
        11: 'Global - Control pedal (11)',
        7: 'Global - Volume (7)',
        12: 'Organ - Octave shift (12)',
        8: 'Global - Layer scene (8)',
        13: 'Organ - A level (13)',
        9: 'Organ - Section enable scene I (9)',
        14: 'Organ - B level (14)',
        15: 'Synth Vibrato - Pedal (15)',
        16: 'Organ - Drawbar 1 (16)',
        17: 'Organ - Drawbar 2 (17)',
        18: 'Organ - Drawbar 3 (18)',
        19: 'Organ - Drawbar 4 (19)',
        20: 'Organ - Drawbar 5 (20)',
        21: 'Organ - Drawbar 6 (21)',
        22: 'Organ - Drawbar 7 (22)',
        23: 'Organ - Drawbar 8 (23)',
        24: 'Organ - Drawbar 9 (24)',
        25: 'Synth Filter - Group (25)',
        28: 'Compressor - Global (28)',
        29: 'Delay - Global (29)',
        30: 'Reverb - Global (30)',
        31: 'Global - Section effects focus (31)',
        32: 'Global - Bank select LSB (32)',
        33: 'Piano - Section enable scene I (33)',
        34: 'Piano - A level (34)',
        35: 'Piano - Octave shift (35)',
        36: 'Synth - C pan (36)',
        37: 'Synth - B level (37)',
        39: 'Synth - C level (39)',
        40: 'Synth - A pan (40)',
        41: 'Synth - B pan (41)',
        42: 'Synth - Section enable scene I (42)',
        43: 'Synth - A level (43)',
        44: 'Synth - Octave shift (44)',
        45: 'Synth Vibrato - Amount (45)',
        46: 'Synth Vibrato - Rate (46)',
        47: 'Synth Oscillator - Pitch fine (47)',
        48: 'Synth - Glide rate (48)',
        49: 'Synth Filter Envelope - Attack (49)',
        50: 'Synth Filter Envelope - Decay (50)',
        51: 'Synth Filter Envelope - Release (51)',
        52: 'Synth Oscillator - Envelope attack (52)',
        53: 'Synth Oscillator - Envelope decay (53)',
        54: 'Synth LFO - Amount (54)',
        55: 'Synth Oscillator - Pitch coarse (55)',
        56: 'Synth Oscillator - Control (56)',
        57: 'Synth Oscillator - Envelope release (57)',
        59: 'Synth Filter - Frequency (59)',
        60: 'Synth Filter - Resonance (60)',
        61: 'Synth - Layers enable scene I (61)',
        63: 'Piano - B level (63)',
        64: 'Global - Sustain pedal (64)',
        66: 'Global - Sostenuto pedal (66)',
        67: 'Global - Soft pedal (67)',
        68: 'Synth Amplifier Envelope - Attack (68)',
        69: 'Synth Amplifier Envelope - Decay (69)',
        71: 'Synth Amplifier Envelope - Release (71)',
        72: 'Piano - Layers enable scene I (72)',
        73: 'Synth Filter Envelope - Amount (73)',
        74: 'Synth Arpeggiator - Rate (74)',
        75: 'Synth - Layers enable scene II (75)',
        76: 'Synth Arpeggiator - Range (76)',
        77: 'Synth Arpeggiator - Run (77)',
        79: 'Synth LFO - Rate (79)',
        80: 'Organ - Layers enable scene I (80)',
        81: 'Organ - Layers enable scene II (81)',
        82: 'Organ - Layers focus scene I (82)',
        83: 'Organ - Layers focus scene II (83)',
        85: 'Mod 1 - Amount (85)',
        86: 'Mod 1 - Rate (86)',
        87: 'Mod 1 - Pump pedal (87)',
        88: 'Piano - Layers enable scene II (88)',
        89: 'Mod 2 - Amount (89)',
        90: 'Mod 2 - Rate (90)',
        101: 'Amp/EQ - Drive (101)',
        93: 'Delay - Dry/wet (93)',
        102: 'Amp/EQ - Bass (102)',
        94: 'Delay - Tempo (94)',
        103: 'Amp/EQ - Mid (103)',
        95: 'Delay - Feedback (95)',
        104: 'Amp/EQ - Treble (104)',
        107: 'Amp/EQ - Mid frequency (107)',
        108: 'Rotary - Speed (108)',
        109: 'Piano - Layers focus scene I (109)',
        110: 'Rotary - Drive (110)',
        112: 'Piano - Layers focus scene II (112)',
        113: 'Reverb - Amount (113)',
        115: 'Synth - Layers focus scene I (115)',
        117: 'Compressor - Amount (117)',
        118: 'Global - Section edit (118)',
        119: 'Synth - Layers focus scene II (119)',
        // oxlint-enable sort-keys-fix/sort-keys-fix
      },
    },
    instrumentNameIncludes: ['nord'],
    programChange: {
      options: createNordProgramOptions(),
    },
  },
  {
    controlChange: {
      controllerLabelByNumber: {
        // oxlint-disable sort-keys-fix/sort-keys-fix
        1: 'MOD Wheel (1)',
        3: 'FX Type (3)',
        5: 'Glide Mode (5)',
        7: 'Master Volume (7)',
        8: 'SUB Oscillator (8)',
        9: 'OSC Slop (9)',
        10: 'PAN MOD Mode (10)',
        12: 'FX Param1 (12)',
        13: 'FX Param2 (13)',
        14: 'BPM (14)',
        15: 'Clock Divide (15)',
        16: 'FX ON OFF (16)',
        17: 'FX MIX (17)',
        18: 'A B Mode (18)',
        19: 'Sequencer Type (19)',
        20: 'Oscillators - OSC1 Frequency (20)',
        21: 'Oscillators - OSC1 Fine Tune (21)',
        22: 'Oscillators - OSC1 Shape (22)',
        23: 'Oscillators - OSC1 Glide Rate Time (23)',
        24: 'Oscillators - OSC2 Frequency (24)',
        25: 'Oscillators - OSC2 Fine Tune (25)',
        26: 'Oscillators - OSC2 Shape (26)',
        27: 'Oscillators - OSC2 Glide Rate Time (27)',
        28: 'Oscillators - OSC MIX (28)',
        29: 'Noise Level (29)',
        30: 'Oscillators - OSC1 Shape MOD (30)',
        31: 'Oscillators - OSC2 Shape MOD (31)',
        32: 'Bank Select (32)',
        33: 'ARP ON OFF (33)',
        34: 'ARP Mode (34)',
        35: 'ARP Range (35)',
        36: 'ARP Repeats (36)',
        37: 'Voice Volume (37)',
        39: 'Split Point (39)',
        64: 'Sustain Pedal (64)',
        65: 'Glide ON OFF (65)',
        75: 'AMP Sustain (75)',
        76: 'AMP Release (76)',
        77: 'ENV3 Sustain (77)',
        78: 'ENV3 Release (78)',
        85: 'ENV3 Destination (85)',
        86: 'ENV3 Amount (86)',
        87: 'ENV3 Velocity (87)',
        88: 'ENV3 Delay (88)',
        89: 'ENV3 Attack (89)',
        90: 'ENV3 Decay (90)',
        102: 'Filter - Filter Frequency (102)',
        103: 'Filter - Resonance (103)',
        104: 'Filter - Filter KEY Amount (104)',
        105: 'Filter - Filter Audio MOD (105)',
        106: 'Filter - Filter ENV Amount (106)',
        107: 'Filter - Filter ENV Velocity (107)',
        108: 'Filter - Filter Delay (108)',
        109: 'Filter - Filter Attack (109)',
        110: 'Filter - Filter Decay (110)',
        111: 'Filter - Filter Sustain (111)',
        112: 'Filter - Filter Release (112)',
        113: 'VCA Level (113)',
        114: 'PAN Spread (114)',
        115: 'AMP ENV Amount (115)',
        116: 'AMP ENV Velocity (116)',
        117: 'AMP Delay (117)',
        118: 'AMP Attack (118)',
        119: 'AMP Decay (119)',
        // oxlint-enable sort-keys-fix/sort-keys-fix
      },
      defaultController: 32,
      valueLabelByControllerAndValue: {
        32: rev2BankValueLabelByValue,
      },
    },
    instrumentNameIncludes: ['rev2'],
    programChange: {
      options: createRev2ProgramOptions(),
    },
  },
];

function buildRangeOptions(
  maxInclusive: number,
  labelByValue: Partial<Record<number, string>> = {},
): MidiSelectOption[] {
  return Array.from({ length: maxInclusive + 1 }, (_, value) => ({
    label: labelByValue[value] || String(value),
    value: String(value),
  }));
}

function findLookup(instrument: Instrument | undefined): InstrumentMidiLookup | undefined {
  const normalizedName = (instrument?.name || '').toLowerCase();

  if (!normalizedName) {
    return undefined;
  }

  return instrumentMidiLookups.find((lookup) =>
    lookup.instrumentNameIncludes.some((needle) => normalizedName.includes(needle)),
  );
}

function findOptionLabel(options: MidiSelectOptions, value: string): string | undefined {
  const firstOption = options[0];

  if (!firstOption) {
    return undefined;
  }

  if ('options' in firstOption) {
    const groupedOptions = options as MidiSelectOptionGroup[];

    for (const group of groupedOptions) {
      const groupMatch = group.options.find((option) => option.value === value);
      if (groupMatch) {
        return groupMatch.label;
      }
    }

    return undefined;
  }

  const flatOptions = options as MidiSelectOption[];
  return flatOptions.find((option) => option.value === value)?.label;
}

export function getInstrumentControlChangeControllerOptions(
  instrument: Instrument | undefined,
): MidiSelectOption[] | undefined {
  const lookup = findLookup(instrument);
  if (!lookup?.controlChange) {
    return undefined;
  }

  return buildRangeOptions(127, lookup.controlChange.controllerLabelByNumber);
}

export function getInstrumentControlChangeDefaultController(
  instrument: Instrument | undefined,
): number {
  const lookup = findLookup(instrument);
  return lookup?.controlChange?.defaultController ?? 0;
}

export function getInstrumentControlChangeControllerLabel(
  instrument: Instrument | undefined,
  controller: number,
): string | undefined {
  return findLookup(instrument)?.controlChange?.controllerLabelByNumber?.[controller];
}

export function getInstrumentControlChangeValueOptions(
  instrument: Instrument | undefined,
  controller: number,
): MidiSelectOption[] | undefined {
  const lookup = findLookup(instrument);
  const valueLabelByValue = lookup?.controlChange?.valueLabelByControllerAndValue?.[controller];

  if (!valueLabelByValue) {
    return undefined;
  }

  return buildRangeOptions(127, valueLabelByValue);
}

export function getInstrumentControlChangeLabel(
  action: ControlChangeAction,
  instrument: Instrument | undefined,
): string | undefined {
  const lookup = findLookup(instrument);
  const controllerLabel = lookup?.controlChange?.controllerLabelByNumber?.[action.controller];
  const valueLabel =
    lookup?.controlChange?.valueLabelByControllerAndValue?.[action.controller]?.[action.value];

  if (!controllerLabel && !valueLabel) {
    return undefined;
  }

  if (controllerLabel && valueLabel) {
    return `${controllerLabel} - ${valueLabel} (#${action.value})`;
  }

  if (controllerLabel) {
    return `${controllerLabel} = ${action.value}`;
  }

  return `CC ${action.controller} = ${valueLabel} (#${action.value})`;
}

export function getInstrumentNrpnLabel(
  action: NrpnAction,
  instrument: Instrument | undefined,
): string | undefined {
  const lookup = findLookup(instrument);
  const parameterKey = `${action.parameterMsb}:${action.parameterLsb}`;
  const parameterLabel = lookup?.nrpn?.parameterLabelByNumber?.[parameterKey];

  if (!parameterLabel) {
    return undefined;
  }

  const valueLabel =
    typeof action.valueLsb === 'number'
      ? `${action.valueMsb}:${action.valueLsb}`
      : `${action.valueMsb}`;
  return `${parameterLabel} = ${valueLabel}`;
}

export function getInstrumentProgramChangeOptions(
  instrument: Instrument | undefined,
): MidiSelectOptions | undefined {
  return findLookup(instrument)?.programChange?.options;
}

export function getInstrumentProgramChangeLabel(
  instrument: Instrument | undefined,
  programChange: number,
): string | undefined {
  const options = getInstrumentProgramChangeOptions(instrument);
  if (!options) {
    return undefined;
  }

  return findOptionLabel(options, String(programChange));
}
