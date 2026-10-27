import { z } from 'zod';

// MIDI events are stored as JSON in the songs table.
// Each button can trigger multiple MIDI messages across instruments.
const midiProgramChangeActionSchema = z.object({
  instrumentId: z.string(),
  programChange: z.number().int().min(0).max(511),
  type: z.literal('programChange').optional(),
});
const midiControlChangeActionSchema = z.object({
  controller: z.number().int().min(0).max(127),
  instrumentId: z.string(),
  type: z.literal('controlChange'),
  value: z.number().int().min(0).max(127),
});
const midiNrpnActionSchema = z.object({
  instrumentId: z.string(),
  parameterLsb: z.number().int().min(0).max(127),
  parameterMsb: z.number().int().min(0).max(127),
  type: z.literal('nrpn'),
  valueLsb: z.number().int().min(0).max(127).optional(),
  valueMsb: z.number().int().min(0).max(127),
});
export const midiEventActionSchema = z.union([
  midiProgramChangeActionSchema,
  midiControlChangeActionSchema,
  midiNrpnActionSchema,
]);
export const midiEventBaseSchema = z.object({
  events: z.array(midiEventActionSchema).min(1),
  label: z.string(),
  triggerOnSongChange: z.boolean().optional(),
});
export const midiEventSchema = midiEventBaseSchema.extend({ id: z.string() });

// Song events happen at a measure and beat while the metronome is running.
// Tempo and time signature changes are always on the first beat of a measure, because the count-in
// of one measure leading up to the change ends on the downbeat.
const songEventPositionSchema = z.object({
  beat: z.number().int().min(1).max(16),
  id: z.string(),
  measure: z.number().int().min(1),
});
export const cueEventSchema = songEventPositionSchema.extend({
  text: z.string().min(1),
  type: z.literal('cue'),
});
export const midiButtonEventSchema = songEventPositionSchema.extend({
  midiEventId: z.string(),
  type: z.literal('midiButton'),
});
export const tempoChangeEventSchema = songEventPositionSchema.extend({
  beat: z.literal(1),
  bpm: z.number().min(1).max(300),
  type: z.literal('tempoChange'),
});
export const timeSignatureChangeEventSchema = songEventPositionSchema.extend({
  beat: z.literal(1),
  timeSignature: z.string().regex(/^\d+\/\d+$/),
  type: z.literal('timeSignatureChange'),
});
export const songEventSchema = z.discriminatedUnion('type', [
  cueEventSchema,
  midiButtonEventSchema,
  tempoChangeEventSchema,
  timeSignatureChangeEventSchema,
]);

// Instrument
export const instrumentTableSchema = z.object({
  midiChannels: z.string().optional(),
  midiInId: z.string(),
  midiInName: z.string(),
  midiOutId: z.string().optional(),
  midiOutName: z.string().optional(),
  name: z.string(),
  programNames: z.string().optional(),
});
export const instrumentSchema = instrumentTableSchema.extend({
  id: z.string(),
  midiChannels: z.array(z.number().int().min(1).max(16)).optional(),
  programNames: z.record(z.number(), z.string()).optional(),
});

export const songDetailTabSchema = z.enum(['lyrics', 'text-notes', 'sheet-music', 'midi']);
export const songDetailTabs = songDetailTabSchema.options;
export type SongDetailTab = z.infer<typeof songDetailTabSchema>;
export const songDefaultTabSchema = z.enum(['auto', ...songDetailTabs]);
export type SongDefaultTab = z.infer<typeof songDefaultTabSchema>;

export const songLanguageSchema = z.enum(['en', 'nl']);
export type SongLanguage = z.infer<typeof songLanguageSchema>;

// Song
export const songTableSchema = z.object({
  artist: z.string(),
  bpm: z.number().optional(),
  canvasPaths: z.string().optional(), // Stored as JSON string
  defaultTab: z.string().optional(),
  duration: z.number().optional(),
  events: z.string().optional(), // Stored as JSON string
  isDeleted: z.boolean().optional(),
  key: z.string().optional(),
  language: z.string().optional(),
  lyrics: z.string().optional(),
  lyricsCanvasPaths: z.string().optional(), // Stored as JSON string
  midiEvents: z.string().optional(), // Stored as JSON string
  notes: z.string().optional(),
  sheetMusicFilename: z.string().optional(),
  spotifyId: z.string().optional(),
  textNotesCanvasPaths: z.string().optional(), // Stored as JSON string
  timeSignature: z.string().optional(),
  title: z.string(),
  transpose: z.number().optional(),
});
export const songSchema = songTableSchema.extend({
  canvasPaths: z.array(z.unknown()).optional(),
  defaultTab: songDefaultTabSchema.optional(),
  events: z.array(songEventSchema).optional(),
  id: z.string(),
  language: songLanguageSchema.optional(),
  lyricsCanvasPaths: z.array(z.unknown()).optional(),
  midiEvents: z.array(midiEventSchema).optional(),
  textNotesCanvasPaths: z.array(z.unknown()).optional(),
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
export const preCountVolumeSchema = z.number().min(0).max(100).default(0);
export const ttsVoiceSchema = z.string();
export const showMidiEventLogPanelSchema = z.boolean().default(false);
export const hideEmptyTabsSchema = z.boolean().default(false);
export const skipMidiOnSongChangeSchema = z.boolean().default(false);
export const showDrawingToolsSchema = z.boolean().default(false);
