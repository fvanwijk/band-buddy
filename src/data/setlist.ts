import type { Setlist } from '../types/setlist';

export const mockSetlist: Setlist = {
  date: '2026-01-31',
  id: 'setlist-2026-01-31',
  sets: [
    {
      setNumber: 1,
      songs: [{ songId: '1' }, { songId: '2' }, { songId: '3' }],
    },
    {
      setNumber: 2,
      songs: [{ songId: '4' }, { songId: '5' }, { songId: '6' }],
    },
  ],
  title: 'Evening Jazz Session',
};
