import { hasFilterFields } from './filterSongs';
import type { HasFilterField, SongFilters } from './filterSongs';

export type FilterId =
  | HasFilterField
  | 'artist'
  | 'durationRange'
  | 'key'
  | 'setlistId'
  | 'title'
  | 'transpose';

export type FilterDefinition = {
  // Form fields that hold the value of this filter
  fields: Array<keyof SongFilters>;
  id: FilterId;
  label: string;
};

export const filterDefinitions: FilterDefinition[] = [
  { fields: ['title'], id: 'title', label: 'Title' },
  { fields: ['artist'], id: 'artist', label: 'Artist' },
  { fields: ['key'], id: 'key', label: 'Key' },
  { fields: ['durationMin', 'durationMax'], id: 'durationRange', label: 'Duration' },
  { fields: ['transpose'], id: 'transpose', label: 'Transpose' },
  { fields: ['setlistId'], id: 'setlistId', label: 'Setlist' },
  { fields: ['hasLyrics'], id: 'hasLyrics', label: 'Has lyrics' },
  { fields: ['hasSheetMusic'], id: 'hasSheetMusic', label: 'Has sheet music' },
  { fields: ['hasTextNotes'], id: 'hasTextNotes', label: 'Has text notes' },
  { fields: ['hasEvents'], id: 'hasEvents', label: 'Has events' },
  { fields: ['hasMidiButtons'], id: 'hasMidiButtons', label: 'Has MIDI buttons' },
];

export const isHasField = (field: string): field is HasFilterField =>
  (hasFilterFields as readonly string[]).includes(field);
