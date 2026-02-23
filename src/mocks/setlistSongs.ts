import type { SetlistSong, SetlistSongTable } from '../types';

export const createSetlistSong = (overrides: Partial<SetlistSong> = {}): SetlistSong => ({
  id: '0',
  setId: '0',
  songId: '0',
  songIndex: 0,
  ...overrides,
});

export const createSetlistSongs = (): SetlistSong[] => [
  // Setlist 1 - set 1
  createSetlistSong(),
  createSetlistSong({
    id: '1',
    songId: '1',
    songIndex: 1,
  }),
  createSetlistSong({
    id: '2',
    songId: '2',
    songIndex: 2,
  }),

  // Setlist 1 - set 2
  createSetlistSong({
    id: '3',
    setId: '1',
    songId: '3',
  }),
  createSetlistSong({
    id: '4',
    setId: '1',
    songId: '4',
    songIndex: 1,
  }),

  // Setlist 1 - set 3
  createSetlistSong({
    id: '5',
    setId: '2',
    songId: '5',
  }),
];

export const createSetlistSongTable = (
  overrides: Partial<SetlistSongTable> = {},
): SetlistSongTable => {
  const { id, ...table } = createSetlistSong(overrides);
  return table;
};

export const createSetlistSongsTable = (): SetlistSongTable[] =>
  createSetlistSongs().map(({ id, ...table }) => table);
