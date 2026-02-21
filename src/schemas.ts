import { z } from 'zod';

// --- MIDI Event Schemas ---
export const midiEventBaseSchema = z.object({
  instrumentId: z.string(),
  label: z.string(),
  programChange: z.number(),
});
export const midiEventSchema = midiEventBaseSchema.extend({ id: z.string() });

// --- Song Schemas ---
export const songBaseSchema = z.object({
  artist: z.string(),
  bpm: z.number().optional(),
  canvasPaths: z.array(z.unknown()).optional(),
  duration: z.number().optional(),
  isDeleted: z.boolean().optional(),
  key: z.string().optional(),
  lyrics: z.string().optional(),
  midiEvents: z.array(midiEventSchema).optional(),
  notes: z.string().optional(),
  sheetMusicFilename: z.string().optional(),
  spotifyId: z.string().optional(),
  timeSignature: z.string().optional(),
  title: z.string(),
  transpose: z.number().optional(),
});
export const songSchema = songBaseSchema.extend({ id: z.string() });
export const songTableSchema = songBaseSchema.extend({
  canvasPaths: z.string().optional(), // Stored as JSON string
  midiEvents: z.string().optional(), // Stored as JSON string
});
export const songWithoutIdSchema = songBaseSchema;

// --- Instrument Schemas ---
export const instrumentBaseSchema = z.object({
  midiInId: z.string(),
  midiInName: z.string(),
  midiOutId: z.string().optional(),
  midiOutName: z.string().optional(),
  name: z.string(),
  programNames: z.string().optional(),
});
export const instrumentSchema = instrumentBaseSchema
  .extend({ id: z.string() })
  .transform((data) => {
    const { programNames, ...rest } = data;
    if (programNames) {
      try {
        return {
          ...rest,
          programNames: JSON.parse(programNames) as Record<number, string>,
        };
      } catch {
        return rest;
      }
    }
    return rest;
  });
export const instrumentTableSchema = instrumentBaseSchema;

// --- Setlist Set Schemas ---
export const setlistSetBaseSchema = z.object({
  name: z.string().optional(),
  setIndex: z.number(),
  setlistId: z.string(),
});
export const setlistSetTableSchema = setlistSetBaseSchema;
export const setlistSetSchema = setlistSetBaseSchema.extend({ id: z.string() });

// --- Setlist Song Schemas ---
export const setlistSongBaseSchema = z.object({
  setId: z.string(),
  songId: z.string(),
  songIndex: z.number(),
});
export const setlistSongSchema = setlistSongBaseSchema.extend({ id: z.string() });
export const setlistSongTableSchema = setlistSongBaseSchema;

// --- Setlist Metadata Schemas ---
export const setlistMetadataBaseSchema = z.object({
  date: z.string(),
  title: z.string(),
  venue: z.string().optional(),
});
export const setlistMetadataSchema = setlistMetadataBaseSchema.extend({ id: z.string() });
export const setlistMetadataTableSchema = setlistMetadataBaseSchema;

// --- Song Reference (UI) ---
export const songReferenceSchema = z.object({
  isDeleted: z.boolean().optional(),
  setId: z.string(),
  songId: z.string(),
  songIndex: z.number(),
});

// --- Setlist Set (UI, with songs) ---
export const setlistSetUiSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  setIndex: z.number(),
  setlistId: z.string(),
  songs: z.array(songReferenceSchema),
});

// --- Complete Setlist (UI) ---
export const setlistBaseSchema = z.object({
  date: z.string(),
  sets: z.array(setlistSetUiSchema),
  title: z.string(),
  venue: z.string().optional(),
});
export const setlistSchema = setlistBaseSchema.extend({ id: z.string() });
export const setlistWithoutIdSchema = setlistBaseSchema;

// --- Settings values ---
export const localeSchema = z.string().default('en-US');
export const themeSchema = z.string().default('emerald');
export const activeSetlistIdSchema = z.string();
export const hasSeenWelcomeSchema = z.boolean().default(false);
export const metronomeVolumeSchema = z.number().min(0).max(100).default(50);
export const showDrawingToolsSchema = z.boolean().default(false);
