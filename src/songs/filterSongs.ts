import type { Song } from '../types';

export const hasFilterFields = [
  'hasLyrics',
  'hasMidiEvents',
  'hasSheetMusic',
  'hasTextNotes',
] as const;

export type HasFilterField = (typeof hasFilterFields)[number];

export type HasFilterValue = 'no' | 'yes';

// A has-filter is only applied when set: 'yes' requires the content, 'no' requires its absence
export type SongFilters = Partial<Record<HasFilterField, HasFilterValue>> & {
  artist: string;
  durationMax: string;
  durationMin: string;
  key: string;
  search: string;
  setlistId: string;
  title: string;
  transpose: string;
};

export const emptySongFilters: SongFilters = {
  artist: '',
  durationMax: '',
  durationMin: '',
  key: '',
  search: '',
  setlistId: '',
  title: '',
  transpose: '',
};

const hasContent: Record<HasFilterField, (song: Song) => boolean> = {
  hasLyrics: (song) => !!song.lyrics?.trim() || !!song.lyricsCanvasPaths?.length,
  hasMidiEvents: (song) => !!song.midiEvents?.length,
  hasSheetMusic: (song) => !!song.sheetMusicFilename,
  hasTextNotes: (song) => !!song.notes?.trim() || !!song.textNotesCanvasPaths?.length,
};

// The duration range counts as one filter
export const isHasValue = (value: unknown): value is HasFilterValue =>
  value === 'yes' || value === 'no';

export const countActiveFilters = (filters: SongFilters) =>
  [filters.artist, filters.key, filters.setlistId, filters.title, filters.transpose].filter(
    (value) => value.trim() !== '',
  ).length +
  (filters.durationMin !== '' || filters.durationMax !== '' ? 1 : 0) +
  hasFilterFields.filter((field) => isHasValue(filters[field])).length;

const parseMinutes = (value: string) => {
  if (value.trim() === '') return null;
  const minutes = Number(value);
  return Number.isNaN(minutes) ? null : minutes * 60;
};

type FilterSongsOptions = {
  filters: SongFilters;
  // Song IDs per setlist ID
  setlistSongIds?: Record<string, Set<string>>;
};

/** Filter songs on the search query and all filter fields (AND). Duration range is in minutes. */
export function filterSongs(
  songs: Song[],
  { filters, setlistSongIds = {} }: FilterSongsOptions,
): Song[] {
  const query = filters.search.trim().toLowerCase();
  const artist = filters.artist.trim().toLowerCase();
  const title = filters.title.trim().toLowerCase();
  const minSeconds = parseMinutes(filters.durationMin);
  const maxSeconds = parseMinutes(filters.durationMax);
  const setlistSongs = filters.setlistId ? (setlistSongIds[filters.setlistId] ?? new Set()) : null;
  const transpose = filters.transpose.trim() === '' ? null : Number(filters.transpose);
  const hasFilters = hasFilterFields.flatMap((field) => {
    const value = filters[field];
    return isHasValue(value) ? [{ expected: value === 'yes', field }] : [];
  });

  return songs.filter((song) => {
    if (
      query &&
      !song.title.toLowerCase().includes(query) &&
      !song.artist.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (artist && !song.artist.toLowerCase().includes(artist)) return false;
    if (title && !song.title.toLowerCase().includes(title)) return false;
    if (filters.key && song.key !== filters.key) return false;
    if (setlistSongs && !setlistSongs.has(song.id)) return false;
    if (transpose !== null && (song.transpose ?? 0) !== transpose) return false;
    if (hasFilters.some(({ expected, field }) => hasContent[field](song) !== expected)) {
      return false;
    }
    if (minSeconds !== null && (song.duration === undefined || song.duration < minSeconds)) {
      return false;
    }
    if (maxSeconds !== null && (song.duration === undefined || song.duration > maxSeconds)) {
      return false;
    }
    return true;
  });
}
