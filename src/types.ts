import { z } from 'zod';

import {
  instrumentSchema,
  instrumentTableSchema,
  midiEventSchema,
  setlistSchema,
  setlistSetSchema,
  setlistSetTableSchema,
  setlistSongSchema,
  setlistSongTableSchema,
  setlistTableSchema,
  songSchema,
  songTableSchema,
} from './schemas';

export type InstrumentTable = z.infer<typeof instrumentTableSchema>;
export type SongTable = z.infer<typeof songTableSchema>;
export type SetlistSongTable = z.infer<typeof setlistSongTableSchema>;
export type SetlistTable = z.infer<typeof setlistTableSchema>;
export type SetlistSetTable = z.infer<typeof setlistSetTableSchema>;

export type MidiEvent = z.infer<typeof midiEventSchema>;
export type Instrument = z.infer<typeof instrumentSchema>;
export type Song = z.infer<typeof songSchema>;
export type SetlistSong = z.infer<typeof setlistSongSchema>;
export type Setlist = z.infer<typeof setlistSchema>;
export type SetlistSet = z.infer<typeof setlistSetSchema>;

// Nested types for easier consumption in the UI
export type SetlistSongWithDetails =
  | (Omit<SetlistSong, 'id'> & Song) // Song is found, id is now the songId
  | SetlistSong; // Song not found, id is the setlistSong id and songId is the songId
export type SetlistSetWithSongs = SetlistSet & { songs: SetlistSongWithDetails[] };
export type SetlistWithSets = Setlist & { sets: SetlistSetWithSongs[] };
