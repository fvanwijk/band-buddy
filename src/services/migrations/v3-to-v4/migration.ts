import type { Tables, Values } from 'tinybase';
import { z, ZodError } from 'zod';

const v3BackupPayload = z.object({
  tables: z.record(z.string(), z.record(z.string(), z.unknown())),
  values: z.record(z.string(), z.unknown()).optional(),
  version: z.literal(3),
});

/**
 * Migrate from backup version 3 to version 4
 *
 * Changes:
 * - Split shared song canvas paths into tab-specific fields
 * - Move songs[*].canvasPaths -> songs[*].lyricsCanvasPaths (only when lyricsCanvasPaths is empty)
 * - Remove songs[*].canvasPaths
 */
export function migrateV3ToV4(input: unknown): {
  tables: Tables;
  values: Values;
} {
  let parsed;
  try {
    parsed = v3BackupPayload.parse(input);
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
      const legacyCanvasPaths = row.canvasPaths;
      const hasLyricsCanvasPaths =
        typeof row.lyricsCanvasPaths === 'string' && row.lyricsCanvasPaths.length > 0;

      if (
        typeof legacyCanvasPaths === 'string' &&
        legacyCanvasPaths.length > 0 &&
        !hasLyricsCanvasPaths
      ) {
        nextRow.lyricsCanvasPaths = legacyCanvasPaths;
      }

      delete nextRow.canvasPaths;

      return [songId, nextRow];
    }),
  ) as Tables['songs'];

  tables.songs = migratedSongs;

  return {
    tables,
    values: (parsed.values || {}) as Values,
  };
}
