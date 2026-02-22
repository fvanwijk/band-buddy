import type { Setlist, SetlistTable } from '../types';

export const createSetlist = (overrides: Partial<Setlist> = {}): Setlist => ({
  date: new Date().toISOString().split('T')[0],
  id: '0',
  title: 'Main Setlist',
  venue: 'The Grand Arena',
  ...overrides,
});

export const createSetlists = (): Setlist[] => [
  createSetlist(),
  createSetlist({
    date: '2026-01-15',
    id: '1',
    title: 'Intimate Session',
  }),
  createSetlist({
    date: '2026-01-08',
    id: '2',
    title: 'Birthday Celebration',
  }),
];

export const createSetlistTable = (overrides: Partial<SetlistTable> = {}): SetlistTable => {
  const { id, ...table } = createSetlist(overrides);
  return table;
};

export const createSetlistsTable = (): SetlistTable[] =>
  createSetlists().map((setlist) => {
    const { id, ...table } = setlist;
    return table;
  });
