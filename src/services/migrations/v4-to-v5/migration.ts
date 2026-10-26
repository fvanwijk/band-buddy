import type { Tables, Values } from 'tinybase';
import { z, ZodError } from 'zod';

const v4BackupPayload = z.object({
  tables: z.record(z.string(), z.record(z.string(), z.unknown())),
  values: z.record(z.string(), z.unknown()).optional(),
  version: z.literal(4),
});

// Shape of a MIDI button trigger in version 4, defined here so the migration stays stable
// when the current schemas change
const legacyMidiButtonTriggerSchema = z.object({
  beat: z.number().int().min(1).max(16),
  id: z.string(),
  measure: z.number().int().min(1),
  midiEventId: z.string(),
});

const parseLegacyTriggers = (value: unknown) => {
  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((trigger) => {
      const result = legacyMidiButtonTriggerSchema.safeParse(trigger);
      return result.success ? [{ ...result.data, type: 'midiButton' }] : [];
    });
  } catch {
    return [];
  }
};

/**
 * Migrate from backup version 4 to version 5
 *
 * Changes:
 * - Move songs[*].midiButtonTriggers into the generic songs[*].events array
 *   as events of type 'midiButton'
 * - Remove songs[*].midiButtonTriggers
 * - Invalid triggers are dropped
 */
export function migrateV4ToV5(input: unknown): {
  tables: Tables;
  values: Values;
} {
  let parsed;
  try {
    parsed = v4BackupPayload.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error('The backup file format is invalid or corrupted.');
    }
    throw error;
  }

  const tables: Tables = { ...parsed.tables } as Tables;

  const songs = (parsed.tables.songs || {}) as Record<string, Record<string, unknown>>;
  const migratedSongs = Object.fromEntries(
    Object.entries(songs).map(([songId, row]) => {
      const { midiButtonTriggers, ...nextRow } = row;
      const events = parseLegacyTriggers(midiButtonTriggers);

      if (events.length > 0) {
        nextRow.events = JSON.stringify(events);
      }

      return [songId, nextRow];
    }),
  ) as Tables['songs'];

  tables.songs = migratedSongs;

  return {
    tables,
    values: (parsed.values || {}) as Values,
  };
}
