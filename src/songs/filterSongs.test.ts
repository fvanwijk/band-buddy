import { describe, expect, it } from 'vite-plus/test';

import { createCueEvent } from '../mocks/songEvents';
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

  it('filters by transpose, treating a missing value as 0', () => {
    const transposed = [
      createSong({ id: '1', transpose: 2 }),
      createSong({ id: '2', transpose: undefined }),
    ];
    expect(
      filterSongs(transposed, { filters: { ...emptySongFilters, transpose: '2' } }).map(
        (song) => song.id,
      ),
    ).toEqual(['1']);
    expect(
      filterSongs(transposed, { filters: { ...emptySongFilters, transpose: '0' } }).map(
        (song) => song.id,
      ),
    ).toEqual(['2']);
  });

  it('filters on the presence of lyrics, sheet music, text notes, events and MIDI buttons', () => {
    const content = [
      createSong({
        events: [],
        id: '1',
        lyrics: 'La la',
        midiEvents: [],
        notes: '',
        sheetMusicFilename: undefined,
      }),
      createSong({
        events: [createCueEvent()],
        id: '2',
        lyrics: undefined,
        notes: 'Capo 2',
        sheetMusicFilename: 'a.pdf',
      }),
    ];
    const ids = (filters: Partial<typeof emptySongFilters>) =>
      filterSongs(content, { filters: { ...emptySongFilters, ...filters } }).map((song) => song.id);

    expect(ids({ hasLyrics: 'yes' })).toEqual(['1']);
    expect(ids({ hasLyrics: 'no' })).toEqual(['2']);
    expect(ids({ hasSheetMusic: 'yes' })).toEqual(['2']);
    expect(ids({ hasTextNotes: 'yes' })).toEqual(['2']);
    expect(ids({ hasEvents: 'yes' })).toEqual(['2']);
    expect(ids({ hasEvents: 'no' })).toEqual(['1']);
    expect(ids({ hasMidiButtons: 'yes' })).toEqual(['2']);
    expect(ids({ hasMidiButtons: 'no' })).toEqual(['1']);
    expect(ids({ hasLyrics: 'yes', hasSheetMusic: 'yes' })).toEqual([]);
    expect(ids({})).toEqual(['1', '2']);
  });

  it('counts text note drawings but ignores lyrics drawings and erased strokes', () => {
    const stroke = { drawMode: true, paths: [{ x: 1, y: 1 }], strokeColor: '#fff', strokeWidth: 2 };
    const content = [
      createSong({
        id: '1',
        lyrics: '  ',
        lyricsCanvasPaths: [{ ...stroke, drawMode: false }],
        notes: ' ',
        textNotesCanvasPaths: [
          { ...stroke, drawMode: false },
          { ...stroke, paths: [] },
        ],
      }),
      createSong({
        id: '2',
        lyrics: '',
        lyricsCanvasPaths: [stroke],
        notes: '',
        textNotesCanvasPaths: [stroke],
      }),
    ];
    const ids = (filters: Partial<typeof emptySongFilters>) =>
      filterSongs(content, { filters: { ...emptySongFilters, ...filters } }).map((song) => song.id);

    expect(ids({ hasTextNotes: 'yes' })).toEqual(['2']);
    expect(ids({ hasTextNotes: 'no' })).toEqual(['1']);
    expect(ids({ hasLyrics: 'yes' })).toEqual([]);
  });

  it('combines quick search and filters with AND', () => {
    const result = filterSongs(songs, {
      filters: { ...emptySongFilters, key: 'C', search: 'queen' },
    });
    expect(result.map((song) => song.id)).toEqual(['3']);
  });
});
