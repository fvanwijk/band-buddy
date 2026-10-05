import { describe, expect, it } from 'vitest';

import { createSong } from '../mocks/songs';
import { countActiveFilters, emptySongFilters, filterSongs } from './filterSongs';

describe('countActiveFilters', () => {
  it('counts the duration range as one filter', () => {
    expect(countActiveFilters(emptySongFilters)).toBe(0);
    expect(
      countActiveFilters({ ...emptySongFilters, durationMax: '5', durationMin: '1', key: 'C' }),
    ).toBe(2);
  });
});

describe('filterSongs', () => {
  const songs = [
    createSong({ artist: 'Queen', duration: 355, id: '1', key: 'Bb', title: 'Bohemian Rhapsody' }),
    createSong({
      artist: 'Stevie Wonder',
      duration: 240,
      id: '2',
      key: 'Ebm',
      title: 'Superstition',
    }),
    createSong({ artist: 'Queen', duration: undefined, id: '3', key: 'C', title: 'Radio Ga Ga' }),
  ];

  it('returns all songs without filters', () => {
    expect(filterSongs(songs, { filters: emptySongFilters })).toHaveLength(3);
  });

  it('filters artist and title case-insensitively as substrings', () => {
    const result = filterSongs(songs, {
      filters: { ...emptySongFilters, artist: 'QUE', title: 'rhaps' },
    });
    expect(result.map((song) => song.id)).toEqual(['1']);
  });

  it('filters by key', () => {
    const result = filterSongs(songs, { filters: { ...emptySongFilters, key: 'Ebm' } });
    expect(result.map((song) => song.id)).toEqual(['2']);
  });

  it('filters by setlist', () => {
    const result = filterSongs(songs, {
      filters: { ...emptySongFilters, setlistId: 'a' },
      setlistSongIds: { a: new Set(['2', '3']) },
    });
    expect(result.map((song) => song.id)).toEqual(['2', '3']);
  });

  it('filters by duration range in minutes and excludes songs without duration', () => {
    const result = filterSongs(songs, {
      filters: { ...emptySongFilters, durationMax: '5', durationMin: '3' },
    });
    expect(result.map((song) => song.id)).toEqual(['2']);

    const wider = filterSongs(songs, {
      filters: { ...emptySongFilters, durationMax: '6', durationMin: '3' },
    });
    expect(wider.map((song) => song.id)).toEqual(['1', '2']);
  });

  it('combines quick search and filters with AND', () => {
    const result = filterSongs(songs, {
      filters: { ...emptySongFilters, key: 'C' },
      searchQuery: 'queen',
    });
    expect(result.map((song) => song.id)).toEqual(['3']);
  });
});
