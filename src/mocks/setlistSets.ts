import type { SetlistSet, SetlistSetTable } from '../types';

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

export const createSetlistSetTable = (
  overrides: Partial<SetlistSetTable> = {},
): SetlistSetTable => {
  const { id, ...table } = createSetlistSet(overrides);
  return table;
};

export const createSetlistSetsTable = (): SetlistSetTable[] => {
  return createSetlistSets().map(({ id, ...table }) => table);
};
