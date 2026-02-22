import { z } from 'zod';

// MIDI Event - stored as JSON string in the DB, but parsed into an array of objects in the app
// TODO: Consider normalizing this in the DB for easier querying and updates
export const midiEventBaseSchema = z.object({
  instrumentId: z.string(),
  label: z.string(),
  programChange: z.number(),
});
export const midiEventSchema = midiEventBaseSchema.extend({ id: z.string() });

// Instrument
export const instrumentTableSchema = z.object({
  midiInId: z.string(),
  midiInName: z.string(),
  midiOutId: z.string().optional(),
  midiOutName: z.string().optional(),
  name: z.string(),
  programNames: z.string().optional(),
});
export const instrumentSchema = instrumentTableSchema.extend({
  id: z.string(),
  programNames: z.record(z.number(), z.string()).optional(),
});

// Song
export const songTableSchema = z.object({
  artist: z.string(),
  bpm: z.number().optional(),
  canvasPaths: z.string().optional(), // Stored as JSON string
  duration: z.number().optional(),
  isDeleted: z.boolean().optional(),
  key: z.string().optional(),
  lyrics: z.string().optional(),
  midiEvents: z.string().optional(), // Stored as JSON string
  notes: z.string().optional(),
  sheetMusicFilename: z.string().optional(),
  spotifyId: z.string().optional(),
  timeSignature: z.string().optional(),
  title: z.string(),
  transpose: z.number().optional(),
});
export const songSchema = songTableSchema.extend({
  canvasPaths: z.array(z.unknown()).optional(),
  id: z.string(),
  midiEvents: z.array(midiEventSchema).optional(),
});

// Setlist Song ---
export const setlistSongTableSchema = z.object({
  setId: z.string(),
  songId: z.string(),
  songIndex: z.number(),
});
export const setlistSongSchema = setlistSongTableSchema.extend({ id: z.string() });

// Setlist Set
export const setlistSetTableSchema = z.object({
  name: z.string().optional(),
  setIndex: z.number(),
  setlistId: z.string(),
});
export const setlistSetSchema = setlistSetTableSchema.extend({ id: z.string() });

// Setlist
export const setlistTableSchema = z.object({
  date: z.string(),
  title: z.string(),
  venue: z.string().optional(),
});
export const setlistSchema = setlistTableSchema.extend({ id: z.string() });

// --- Settings values ---
export const localeSchema = z.string().default('en-US');
export const themeSchema = z.string().default('emerald');
export const activeSetlistIdSchema = z.string();
export const hasSeenWelcomeSchema = z.boolean().default(false);
export const metronomeVolumeSchema = z.number().min(0).max(100).default(50);
export const showDrawingToolsSchema = z.boolean().default(false);
