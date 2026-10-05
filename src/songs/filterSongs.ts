import type { Song } from '../types';

export type SongFilters = {
  artist: string;
  durationMax: string;
  durationMin: string;
  key: string;
  setlistId: string;
  title: string;
};

export const emptySongFilters: SongFilters = {
  artist: '',
  durationMax: '',
  durationMin: '',
  key: '',
  setlistId: '',
  title: '',
};

// The duration range counts as one filter
export const countActiveFilters = ({ durationMax, durationMin, ...rest }: SongFilters) =>
  Object.values(rest).filter((value) => value.trim() !== '').length +
  (durationMin !== '' || durationMax !== '' ? 1 : 0);

const parseMinutes = (value: string) => {
  if (value.trim() === '') return null;
  const minutes = Number(value);
  return Number.isNaN(minutes) ? null : minutes * 60;
};

type FilterSongsOptions = {
  filters: SongFilters;
  searchQuery?: string;
  // Song IDs per setlist ID
  setlistSongIds?: Record<string, Set<string>>;
};

/** Filter songs on quick search and all filter fields (AND). Duration range is in minutes. */
export function filterSongs(
  songs: Song[],
  { filters, searchQuery = '', setlistSongIds = {} }: FilterSongsOptions,
): Song[] {
  const query = searchQuery.trim().toLowerCase();
  const artist = filters.artist.trim().toLowerCase();
  const title = filters.title.trim().toLowerCase();
  const minSeconds = parseMinutes(filters.durationMin);
  const maxSeconds = parseMinutes(filters.durationMax);
  const setlistSongs = filters.setlistId ? (setlistSongIds[filters.setlistId] ?? new Set()) : null;

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
    if (minSeconds !== null && (song.duration === undefined || song.duration < minSeconds)) {
      return false;
    }
    if (maxSeconds !== null && (song.duration === undefined || song.duration > maxSeconds)) {
      return false;
    }
    return true;
  });
}
