import { useMemo } from 'react';

import type { Instrument } from '../../../types';
import { useNordProgramOptions } from './useNordProgramOptions';

export type ProgramOption = { label: string; value: string };
export type NordProgramOption = { label: string; options: ProgramOption[] };

const isNordProgramOption = (
  option: ProgramOption | NordProgramOption,
): option is NordProgramOption => 'options' in option;

export function buildProgramOptions(
  instrument: Instrument | undefined,
  nordProgramOptions: NordProgramOption[],
): ProgramOption[] | NordProgramOption[] {
  const isNord = instrument?.name.includes('Nord') ?? false;
  const programNames = instrument?.programNames;
  const hasProgramNames = !!programNames && Object.keys(programNames).length > 0;

  if (hasProgramNames) {
    // If program names are defined, show custom list with names appended.
    if (isNord) {
      return nordProgramOptions.map((group) => ({
        label: group.label,
        options: group.options.map((opt) => {
          const programName = programNames?.[Number(opt.value)];
          return {
            ...opt,
            label: programName ? `${opt.label} ${programName}` : opt.label,
          };
        }),
      }));
    }

    // For non-Nord instruments, show flat list with program names.
    return Object.entries(programNames)
      .map(([programNum, name]) => ({
        label: `${programNum}: ${name}`,
        value: programNum,
      }))
      .sort((a, b) => Number(a.value) - Number(b.value));
  }

  // If no program names but Nord instrument, show Nord options.
  if (isNord) {
    return nordProgramOptions;
  }

  // No program names and not Nord, return empty for numeric input.
  return [];
}

export function getProgramChangeLabel(
  instrument: Instrument | undefined,
  programChange: number,
  nordProgramOptions: NordProgramOption[],
): string | undefined {
  const options = buildProgramOptions(instrument, nordProgramOptions);
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
  const nordProgramOptions = useNordProgramOptions();

  return useMemo(
    () => buildProgramOptions(instrument, nordProgramOptions),
    [instrument, nordProgramOptions],
  );
}
