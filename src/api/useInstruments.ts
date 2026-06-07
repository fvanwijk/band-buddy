import {
  useAddRowCallback,
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useTable,
} from 'tinybase/ui-react';

import { instrumentSchema } from '../schemas';
import type { Instrument } from '../types';

function parseMidiChannels(midiChannels: unknown): number[] | undefined {
  if (typeof midiChannels !== 'string') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(midiChannels);
    if (!Array.isArray(parsed)) {
      return undefined;
    }

    return parsed
      .filter((value): value is number => Number.isInteger(value) && value >= 1 && value <= 16)
      .sort((a, b) => a - b);
  } catch {
    return undefined;
  }
}

function parseProgramNames(programNames: unknown): Record<number, string> | undefined {
  if (typeof programNames !== 'string') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(programNames);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }

    return Object.entries(parsed).reduce<Record<number, string>>((result, [key, value]) => {
      const keyNumber = Number.parseInt(key, 10);
      if (Number.isNaN(keyNumber) || typeof value !== 'string') {
        return result;
      }

      result[keyNumber] = value;
      return result;
    }, {});
  } catch {
    return undefined;
  }
}

/**
 * Get all instruments from the store
 */
export function useGetInstruments(): Instrument[] {
  const instrumentsData = useTable('instruments') || {};

  return Object.entries(instrumentsData)
    .map(([id, data]) => {
      const result = instrumentSchema.safeParse({
        ...data,
        id,
        midiChannels: parseMidiChannels(data.midiChannels),
        programNames: parseProgramNames(data.programNames),
      });
      return result.success ? result.data : null;
    })
    .filter((instrument): instrument is Instrument => instrument !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single instrument by ID
 */
export function useGetInstrument(id: string | undefined): Instrument | null {
  const instrumentRow = useRow('instruments', id || '');

  if (!id || !instrumentRow) {
    return null;
  }

  const result = instrumentSchema.safeParse({
    ...instrumentRow,
    id,
    midiChannels: parseMidiChannels(instrumentRow.midiChannels),
    programNames: parseProgramNames(instrumentRow.programNames),
  });
  return result.success ? result.data : null;
}

/**
 * Hook to add a new instrument
 */
export function useAddInstrument(onSuccess?: () => void) {
  return useAddRowCallback(
    'instruments',
    (data: Omit<Instrument, 'id'>) => {
      const finalData: Record<string, unknown> = {
        ...data,
      };

      if (data.programNames && Object.keys(data.programNames).length > 0) {
        finalData.programNames = JSON.stringify(data.programNames);
      } else {
        delete finalData.programNames;
      }

      if (data.midiChannels && data.midiChannels.length > 0) {
        finalData.midiChannels = JSON.stringify(data.midiChannels);
      } else {
        delete finalData.midiChannels;
      }

      Object.entries(finalData).forEach(([key, value]) => {
        if (value === undefined) {
          delete finalData[key];
        }
      });

      return finalData as Record<string, string>;
    },
    [onSuccess],
    undefined,
    () => {
      onSuccess?.();
    },
  );
}

/**
 * Hook to delete an instrument
 */
export function useDeleteInstrument(onSuccess?: () => void) {
  return useDelRowCallback('instruments', (id: string) => {
    onSuccess?.();
    return id;
  });
}

/**
 * Hook to update an existing instrument
 */
export function useUpdateInstrument(id: string | undefined, onSuccess?: () => void) {
  return useSetRowCallback(
    'instruments',
    id!,
    (data: Omit<Instrument, 'id'>) => {
      const finalData: Record<string, unknown> = {
        ...data,
      };

      if (data.programNames && Object.keys(data.programNames).length > 0) {
        finalData.programNames = JSON.stringify(data.programNames);
      } else {
        delete finalData.programNames;
      }

      if (data.midiChannels && data.midiChannels.length > 0) {
        finalData.midiChannels = JSON.stringify(data.midiChannels);
      } else {
        delete finalData.midiChannels;
      }

      Object.entries(finalData).forEach(([key, value]) => {
        if (value === undefined) {
          delete finalData[key];
        }
      });

      return finalData as Record<string, string>;
    },
    [id, onSuccess],
    undefined,
    () => {
      onSuccess?.();
    },
  );
}
