import type { Tables, Values } from 'tinybase';
import { z, ZodError } from 'zod';

/**
 * Version 1 backup schemas (deprecated)
 */
const v1SetlistSongSchema = z.object({
  setNumber: z.number().optional(),
  setlistId: z.string().optional(),
  songId: z.string(),
  songIndex: z.number(),
});

const v1SongTableSchema = z.object({
  artist: z.string(),
  bpm: z.number().optional(),
  canvasPaths: z.string().optional(),
  duration: z.number().optional(),
  isDeleted: z.boolean().optional(),
  key: z.string().optional(),
  lyrics: z.string().optional(),
  midiEvents: z.string().optional(),
  notes: z.string().optional(),
  sheetMusicFilename: z.string().optional(),
  spotifyId: z.string().optional(),
  timeSignature: z.string().optional(),
  title: z.string(),
  transpose: z.number().optional(),
});

const v1InstrumentTableSchema = z.object({
  midiInId: z.string(),
  midiInName: z.string(),
  midiOutId: z.string().optional(),
  midiOutName: z.string().optional(),
  name: z.string(),
  programNames: z.string().optional(),
});

const v1SetlistTableSchema = z.object({
  date: z.string(),
  title: z.string(),
  venue: z.string().optional(),
});

const v1BackupPayload = z.object({
  tables: z.object({
    instruments: z.record(z.string(), v1InstrumentTableSchema).optional(),
    setlistSongs: z.record(z.string(), v1SetlistSongSchema).optional(),
    setlists: z.record(z.string(), v1SetlistTableSchema).optional(),
    songs: z.record(z.string(), v1SongTableSchema).optional(),
  }),
  values: z.record(z.string(), z.unknown()).optional(),
  version: z.literal(1),
});

function deriveLegacySetlistSongPartsFromRowId(
  rowId: string,
): { setNumber: number; setlistId: string } | undefined {
  // Legacy IDs are expected as: {setlistId}_{setIndex}_{songIndex}
  const parts = rowId.split('_');
  if (parts.length < 3) {
    return undefined;
  }

  const setlistId = parts[0];
  const setNumber = Number.parseInt(parts[parts.length - 2], 10);
  if (!setlistId || Number.isNaN(setNumber)) {
    return undefined;
  }

  return {
    setNumber,
    setlistId,
  };
}

/**
 * Migrate from backup version 1 to version 2
 *
 * Changes:
 * - Extract setlistSongs.setNumber into a new setlistSets table
 * - Update setlistSongs to use setId instead of setNumber
 */
export function migrateV1ToV2(input: unknown): {
  tables: Tables;
  values: Values;
} {
  let parsed;
  try {
    parsed = v1BackupPayload.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error('The backup file format is invalid or corrupted.');
    }
    throw error;
  }

  const tables: Tables = {};

  // Copy songs as-is
  if (parsed.tables.songs) {
    tables.songs = { ...parsed.tables.songs } as Tables['songs'];
  } else {
    tables.songs = {};
  }

  // Copy setlists as-is
  if (parsed.tables.setlists) {
    tables.setlists = { ...parsed.tables.setlists } as Tables['setlists'];
  } else {
    tables.setlists = {};
  }

  // Copy instruments as-is
  if (parsed.tables.instruments) {
    tables.instruments = { ...parsed.tables.instruments } as Tables['instruments'];
  } else {
    tables.instruments = {};
  }

  // Create setlistSets from setlistSongs.setNumber
  const setlistSets: Tables['setlistSets'] = {};
  const newSetlistSongs: Tables['setlistSongs'] = {};

  if (parsed.tables.setlistSongs) {
    const setNumbers = new Map<string, Set<number>>();

    // First pass: collect all setNumbers for each setlistId
    for (const [rowId, setlistSong] of Object.entries(parsed.tables.setlistSongs)) {
      const derivedParts = deriveLegacySetlistSongPartsFromRowId(rowId);
      const setlistId = setlistSong.setlistId ?? derivedParts?.setlistId;
      const setNumber = setlistSong.setNumber ?? derivedParts?.setNumber;

      if (!setlistId || setNumber === undefined) {
        throw new Error(
          `Failed to derive setlistId/setNumber for setlistSongs row '${rowId}'. Expected fields or legacy row id format '{setlistId}_{setIndex}_{songIndex}'.`,
        );
      }

      const key = setlistId;
      if (!setNumbers.has(key)) {
        setNumbers.set(key, new Set());
      }
      setNumbers.get(key)!.add(setNumber);
    }

    // Create setlistSets from unique setlistId + setNumber combinations
    let setIdCounter = 0;
    const setNumberToSetId = new Map<string, string>();

    for (const [setlistId, setNums] of setNumbers) {
      const sortedSetNums = Array.from(setNums).sort((a, b) => a - b);
      for (const setNumber of sortedSetNums) {
        const setId = String(setIdCounter++);
        setNumberToSetId.set(`${setlistId}:${setNumber}`, setId);
        const setRow = {
          setIndex: setNumber,
          setlistId,
        } as Tables['setlistSets'][string];
        setlistSets[setId] = setRow;
      }
    }

    // Second pass: create new setlistSongs with setId
    let songId = 0;
    for (const [rowId, v1Song] of Object.entries(parsed.tables.setlistSongs)) {
      const derivedParts = deriveLegacySetlistSongPartsFromRowId(rowId);
      const setlistId = v1Song.setlistId ?? derivedParts?.setlistId;
      const setNumber = v1Song.setNumber ?? derivedParts?.setNumber;

      if (!setlistId || setNumber === undefined) {
        throw new Error(
          `Failed to derive setlistId/setNumber for setlistSongs row '${rowId}'. Expected fields or legacy row id format '{setlistId}_{setIndex}_{songIndex}'.`,
        );
      }

      const setId = setNumberToSetId.get(`${setlistId}:${setNumber}`);
      if (!setId) {
        throw new Error(`Failed to find setId for setlistId=${setlistId}, setNumber=${setNumber}`);
      }
      const songRow = {
        setId,
        songId: v1Song.songId,
        songIndex: v1Song.songIndex,
      } as Tables['setlistSongs'][string];
      newSetlistSongs[String(songId++)] = songRow;
    }
  }

  tables.setlistSets = setlistSets;
  tables.setlistSongs = newSetlistSongs;

  // Copy values as-is
  const values: Values = {};
  if (parsed.values) {
    Object.assign(values, parsed.values);
  }

  return { tables, values };
}
