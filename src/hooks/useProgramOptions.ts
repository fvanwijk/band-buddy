import { useMemo } from 'react';

import { useNordProgramOptions } from './useNordProgramOptions';
import type { Instrument } from '../types';

type ProgramOption = { label: string; value: string };
type NordProgramOption = { label: string; options: ProgramOption[] };

export function useProgramOptions(
  instrument: Instrument | undefined,
): ProgramOption[] | NordProgramOption[] {
  const isNord = instrument?.name.includes('Nord') ?? false;
  const nordProgramOptions = useNordProgramOptions();

  return useMemo(() => {
    const hasProgramNames =
      instrument?.programNames && Object.keys(instrument.programNames).length > 0;

    if (hasProgramNames) {
      // If program names are defined, show custom list with names appended
      if (isNord) {
        // Transform nordProgramOptions to append program names where defined
        return nordProgramOptions.map((group) => ({
          label: group.label,
          options: group.options.map((opt) => {
            const programName = instrument.programNames?.[Number(opt.value)];
            return {
              ...opt,
              label: programName ? `${opt.label} ${programName}` : opt.label,
            };
          }),
        }));
      } else {
        // For non-Nord instruments, show flat list with program names
        return Object.entries(instrument.programNames!)
          .map(([programNum, name]) => ({
            label: `${programNum}: ${name}`,
            value: programNum,
          }))
          .sort((a, b) => Number(a.value) - Number(b.value));
      }
    }

    // If no program names but Nord instrument, show Nord options
    if (isNord) {
      return nordProgramOptions;
    }

    // No program names and not Nord, return empty for numeric input
    return [];
  }, [instrument?.programNames, isNord, nordProgramOptions]);
}
