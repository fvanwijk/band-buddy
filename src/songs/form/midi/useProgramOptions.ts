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
        const programNum = Number(opt.value);
        const programName = programNames[programNum];
        // Extract base label (e.g., "A-11" from "A-11 (0)")
        const baseLabel = opt.label.match(/^([^(]+)/)?.[1].trim() || opt.label;
        return {
          ...opt,
          label: programName
            ? `${baseLabel} ${programName} (${programNum})`
            : `${baseLabel} (${programNum})`,
        };
      }),
    }));
  }

  const flatOptions = options as ProgramOption[];
  return flatOptions.map((option) => {
    const programNum = Number(option.value);
    const programName = programNames[programNum];
    // Extract base label (e.g., "P1" from "P1 (0)")
    const baseLabel = option.label.match(/^([^(]+)/)?.[1].trim() || option.label;
    return {
      ...option,
      label: programName
        ? `${baseLabel} ${programName} (${programNum})`
        : `${baseLabel} (${programNum})`,
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
        label: `${name} (${programNum})`,
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
