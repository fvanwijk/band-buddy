import type { Tables, Values } from 'tinybase';
import { z, ZodError } from 'zod';

const v2BackupPayload = z.object({
  tables: z.record(z.string(), z.record(z.string(), z.unknown())),
  values: z.record(z.string(), z.unknown()).optional(),
  version: z.literal(2),
});

type LegacyMidiEvent = {
  id: string;
  instrumentId: string;
  label: string;
  programChange: number;
};

function isLegacyMidiEvent(event: unknown): event is LegacyMidiEvent {
  if (typeof event !== 'object' || event === null) {
    return false;
  }

  const typedEvent = event as Record<string, unknown>;

  return (
    typeof typedEvent.id === 'string' &&
    typeof typedEvent.instrumentId === 'string' &&
    typeof typedEvent.label === 'string' &&
    typeof typedEvent.programChange === 'number' &&
    !Array.isArray(typedEvent.events)
  );
}

/**
 * Migrate from backup version 2 to version 3
 *
 * Changes:
 * - songs[*].midiEvents entries now support multiple actions per button
 * - Legacy shape: { id, instrumentId, label, programChange }
 * - New shape: { id, label, events: [{ instrumentId, programChange }] }
 */
export function migrateV2ToV3(input: unknown): {
  tables: Tables;
  values: Values;
} {
  let parsed;
  try {
    parsed = v2BackupPayload.parse(input);
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
      const nextRow: Record<string, unknown> = { ...row };
      const midiEvents = row.midiEvents;

      if (typeof midiEvents === 'string') {
        try {
          const parsedEvents = JSON.parse(midiEvents);
          if (Array.isArray(parsedEvents)) {
            const nextEvents = parsedEvents.map((event) => {
              if (!isLegacyMidiEvent(event)) {
                return event;
              }

              return {
                events: [
                  {
                    instrumentId: event.instrumentId,
                    programChange: event.programChange,
                  },
                ],
                id: event.id,
                label: event.label,
              };
            });

            nextRow.midiEvents = JSON.stringify(nextEvents);
          }
        } catch {
          // Preserve invalid JSON unchanged so existing error handling can surface it.
        }
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
