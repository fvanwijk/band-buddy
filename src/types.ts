import { z } from 'zod';

import {
  instrumentSchema,
  midiEventSchema,
  setlistSchema,
  setlistSetUiSchema,
  songReferenceSchema,
  songSchema,
} from './schemas';

// UI Instrument type: programNames is Record<number, string> when present
export type Instrument = Omit<z.infer<typeof instrumentSchema>, 'programNames'> & {
  programNames?: Record<number, string>;
};
export type MidiEvent = z.infer<typeof midiEventSchema>;
export type Song = z.infer<typeof songSchema>;
export type SongReference = z.infer<typeof songReferenceSchema>;
export type SetlistSet = z.infer<typeof setlistSetUiSchema>;
export type Setlist = z.infer<typeof setlistSchema>;
