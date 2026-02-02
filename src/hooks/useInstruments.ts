import {
  useAddRowCallback,
  useDelRowCallback,
  useRow,
  useSetRowCallback,
  useTable,
} from 'tinybase/ui-react';

import { instrumentSchema } from '../schemas';
import type { Instrument } from '../types';

/**
 * Get all instruments from the store
 */
export function useGetInstruments(): Instrument[] {
  const instrumentsData = useTable('instruments') || {};

  return Object.entries(instrumentsData)
    .map(([id, data]) => {
      const result = instrumentSchema.safeParse({ ...data, id });
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

  const result = instrumentSchema.safeParse({ ...instrumentRow, id });
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
