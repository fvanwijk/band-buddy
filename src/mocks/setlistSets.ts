import type { SetlistSet, SetlistSetTable, SetlistSongWithDetails } from '../types';
import { createSetlistSongs } from './setlistSongs';
import { createSongs } from './songs';

export const createSetlistSet = (overrides: Partial<SetlistSet> = {}): SetlistSet => ({
  id: '0',
  name: '',
  setIndex: 0,
  setlistId: '0',
  ...overrides,
});

export const createSetlistSets = (): SetlistSet[] => [
  // Setlist 1
  createSetlistSet(),
  createSetlistSet({
    id: '1',
    name: 'Acoustic Set',
    setIndex: 1,
  }),
  createSetlistSet({
    id: '2',
    name: 'Encore',
    setIndex: 2,
  }),

  // Setlist 2
  createSetlistSet({
    id: '3',
    name: '',
    setIndex: 0,
    setlistId: '1',
  }),
];

export const createSetlistSetsWithSongs = (): (SetlistSet & {
  songs: SetlistSongWithDetails[];
})[] => {
  const sets = createSetlistSets().slice(0, 3); // Only for setlist 1, setlist 2 has no songs
  const setlistSongs = createSetlistSongs(); // Setlist songs for setlist 1
  const songs = createSongs(); // All songs, used to get details for setlist songs

  return sets.map((set) => ({
    ...set,
    songs: setlistSongs
      .filter((song) => song.setId === set.id)
      .map((setlistSong) => {
        const songDetails = songs.find((song) => song.id === setlistSong.songId);
        return { ...setlistSong, ...songDetails };
      }),
  }));
};

export const createSetlistSetTable = (
  overrides: Partial<SetlistSetTable> = {},
): SetlistSetTable => {
  const { id, ...table } = createSetlistSet(overrides);
  return table;
};

export const createSetlistSetsTable = (): SetlistSetTable[] => {
  return createSetlistSets().map(({ id, ...table }) => table);
};
