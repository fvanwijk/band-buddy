import type { Setlist, SetlistSet } from '../types';

export const createSetlistSet = (overrides: Partial<SetlistSet> = {}): SetlistSet => ({
  setNumber: 1,
  songs: [{ songId: '1' }, { songId: '2' }],
  ...overrides,
});

export const createSetlist = (overrides: Partial<Setlist> = {}): Setlist => ({
  date: new Date().toISOString().split('T')[0],
  id: '1',
  sets: [
    createSetlistSet({ setNumber: 1 }),
    createSetlistSet({ setNumber: 2, songs: [{ songId: '3' }, { songId: '4' }] }),
    createSetlistSet({ setNumber: 3, songs: [{ songId: '5' }] }),
  ],
  title: 'Main Setlist',
  venue: 'The Grand Arena',
  ...overrides,
});

export const createSetlists = (): Setlist[] => [
  createSetlist(),
  createSetlist({
    date: '2026-01-15',
    id: '2',
    sets: [
      createSetlistSet({
        setNumber: 1,
        songs: [{ songId: '3' }, { songId: '4' }],
      }),
      createSetlistSet({
        setNumber: 2,
        songs: [{ songId: '5' }, { songId: '6' }, { songId: '7' }],
      }),
    ],
    title: 'Intimate Session',
  }),
  createSetlist({
    date: '2026-01-08',
    id: '3',
    sets: [
      createSetlistSet({
        setNumber: 1,
        songs: [{ songId: '1' }, { songId: '9' }, { songId: '10' }],
      }),
      createSetlistSet({
        setNumber: 2,
        songs: [{ songId: '2' }, { songId: '5' }],
      }),
      createSetlistSet({
        setNumber: 3,
        songs: [{ songId: '8' }],
      }),
    ],
    title: 'Birthday Celebration',
  }),
];
