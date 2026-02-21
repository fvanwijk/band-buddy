import type { Setlist, SetlistSet } from '../types';

export const createSetlistSet = (overrides: Partial<SetlistSet> = {}): SetlistSet => ({
  id: overrides.id || '' + (overrides.setIndex ?? 1),
  name: overrides.name || '',
  setIndex: typeof overrides.setIndex === 'number' ? overrides.setIndex : 1,
  setlistId: overrides.setlistId || '1',
  songs: overrides.songs?.map((song, idx) => ({
    isDeleted: song.isDeleted,
    setId: overrides.id || '' + (overrides.setIndex ?? 1),
    songId: song.songId,
    songIndex: typeof song.songIndex === 'number' ? song.songIndex : idx,
  })) || [
    {
      setId: overrides.id || '1',
      songId: '1',
      songIndex: 0,
    },
    {
      setId: overrides.id || '1',
      songId: '2',
      songIndex: 1,
    },
  ],
  ...overrides,
});

export const createSetlist = (overrides: Partial<Setlist> = {}): Setlist => ({
  date: new Date().toISOString().split('T')[0],
  id: '1',
  sets: [
    createSetlistSet({ id: '1', setIndex: 1, setlistId: '1' }),
    createSetlistSet({
      id: '2',
      setIndex: 2,
      setlistId: '1',
      songs: [
        { setId: '2', songId: '3', songIndex: 0 },
        { setId: '2', songId: '4', songIndex: 1 },
      ],
    }),
    createSetlistSet({
      id: '3',
      setIndex: 3,
      setlistId: '1',
      songs: [{ setId: '3', songId: '5', songIndex: 0 }],
    }),
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
        id: '2_1',
        setIndex: 1,
        setlistId: '2',
        songs: [
          { setId: '2_1', songId: '3', songIndex: 0 },
          { setId: '2_1', songId: '4', songIndex: 1 },
        ],
      }),
      createSetlistSet({
        id: '2_2',
        setIndex: 2,
        setlistId: '2',
        songs: [
          { setId: '2_2', songId: '5', songIndex: 0 },
          { setId: '2_2', songId: '6', songIndex: 1 },
          { setId: '2_2', songId: '7', songIndex: 2 },
        ],
      }),
    ],
    title: 'Intimate Session',
  }),
  createSetlist({
    date: '2026-01-08',
    id: '3',
    sets: [
      createSetlistSet({
        id: '3_1',
        setIndex: 1,
        setlistId: '3',
        songs: [
          { setId: '3_1', songId: '1', songIndex: 0 },
          { setId: '3_1', songId: '9', songIndex: 1 },
          { setId: '3_1', songId: '10', songIndex: 2 },
        ],
      }),
      createSetlistSet({
        id: '3_2',
        setIndex: 2,
        setlistId: '3',
        songs: [
          { setId: '3_2', songId: '2', songIndex: 0 },
          { setId: '3_2', songId: '5', songIndex: 1 },
        ],
      }),
      createSetlistSet({
        id: '3_3',
        setIndex: 3,
        setlistId: '3',
        songs: [{ setId: '3_3', songId: '8', songIndex: 0 }],
      }),
    ],
    title: 'Birthday Celebration',
  }),
];
