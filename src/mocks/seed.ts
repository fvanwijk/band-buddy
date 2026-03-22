import type { Store } from 'tinybase';

import { createInstrumentTable } from './instruments';
import { createSetlistsTable } from './setlists';
import { createSetlistSetsTable } from './setlistSets';
import { createSetlistSongsTable } from './setlistSongs';
import { createSongsTable } from './songs';

export function seedStore(store: Store): void {
  seedSongs(store);
  seedSetlistSongs(store);
  seedSetlistSets(store);
  seedSetlists(store);
  seedInstruments(store);
}

export const seedSongs = (store: Store): void => {
  createSongsTable().forEach((song, i) => store.setRow('songs', i.toString(), song));
};

export const seedSetlistSongs = (store: Store): void => {
  createSetlistSongsTable().forEach((song) => {
    store.addRow('setlistSongs', song);
  });
};

export const seedSetlistSets = (store: Store): void => {
  createSetlistSetsTable().forEach((set) => {
    store.addRow('setlistSets', set);
  });
};

export const seedSetlists = (store: Store): void => {
  createSetlistsTable().forEach((setlist) => {
    store.addRow('setlists', setlist);
  });
};

export const seedInstruments = (store: Store): void => {
  const instrument = createInstrumentTable();
  store.addRow('instruments', instrument);
};
