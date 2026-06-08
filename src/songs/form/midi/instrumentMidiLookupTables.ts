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
    instrumentNameIncludes: ['nord'],
    programChange: {
      options: createNordProgramOptions(),
    },
  },
  {
    controlChange: {
      controllerLabelByNumber: {
        32: 'Bank Select (32)',
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
