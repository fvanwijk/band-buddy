import { useMemo } from 'react';

import type { Instrument } from '../../../types';
import {
  getInstrumentProgramChangeOptions,
  type MidiSelectOption,
  type MidiSelectOptionGroup,
} from './instrumentMidiLookupTables';

export type ProgramOption = MidiSelectOption;
export type NordProgramOption = MidiSelectOptionGroup;

const isNordProgramOption = (
  option: ProgramOption | NordProgramOption,
): option is NordProgramOption => 'options' in option;

function appendProgramNamesToOptions(
  options: ProgramOption[] | NordProgramOption[],
  programNames: Record<string, string>,
): ProgramOption[] | NordProgramOption[] {
  if (options.length === 0) {
    return options;
  }

  const firstOption = options[0];

  if (isNordProgramOption(firstOption)) {
    const groupedOptions = options as NordProgramOption[];

    return groupedOptions.map((group) => ({
      label: group.label,
      options: group.options.map((opt) => {
        const programName = programNames[Number(opt.value)];
        return {
          ...opt,
          label: programName ? `${opt.label} ${programName}` : opt.label,
        };
      }),
    }));
  }

  const flatOptions = options as ProgramOption[];
  return flatOptions.map((option) => {
    const programName = programNames[Number(option.value)];
    return {
      ...option,
      label: programName ? `${option.label} ${programName}` : option.label,
    };
  });
}

export function buildProgramOptions(
  instrument: Instrument | undefined,
): ProgramOption[] | NordProgramOption[] {
  const lookupOptions = getInstrumentProgramChangeOptions(instrument);
  const programNames = instrument?.programNames;
  const hasProgramNames = !!programNames && Object.keys(programNames).length > 0;

  if (lookupOptions) {
    if (!hasProgramNames) {
      return lookupOptions;
    }

    return appendProgramNamesToOptions(lookupOptions, programNames);
  }

  if (hasProgramNames) {
    return Object.entries(programNames)
      .map(([programNum, name]) => ({
        label: `${programNum}: ${name}`,
        value: programNum,
      }))
      .sort((a, b) => Number(a.value) - Number(b.value));
  }

  return [];
}

export function getProgramChangeLabel(
  instrument: Instrument | undefined,
  programChange: number,
): string | undefined {
  const options = buildProgramOptions(instrument);

  const value = programChange.toString();

  if (options.length === 0) {
    return undefined;
  }

  const firstOption = options[0];

  if (isNordProgramOption(firstOption)) {
    const groupedOptions = options as NordProgramOption[];

    for (const group of groupedOptions) {
      const match = group.options.find((option) => option.value === value);
      if (match) {
        return match.label;
      }
    }

    return undefined;
  }

  const flatOptions = options as ProgramOption[];
  const match = flatOptions.find((option) => option.value === value);
  return match?.label;
}

export function useProgramOptions(
  instrument: Instrument | undefined,
): ProgramOption[] | NordProgramOption[] {
  return useMemo(() => buildProgramOptions(instrument), [instrument]);
}
