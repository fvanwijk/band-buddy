import type { Store } from 'tinybase';

import { createInstrument } from './instruments';
import { createSetlists } from './setlists';
import { createSongs } from './songs';

export function seedStore(store: Store): void {
  seedSongs(store);
  seedSetlists(store);
  seedInstruments(store);
}

export const seedSongs = (store: Store): void => {
  createSongs().forEach(({ id, ...song }) => {
    const row: Record<string, unknown> = {
      ...song,
    };

    if (song.midiEvents && song.midiEvents.length > 0) {
      row.midiEvents = JSON.stringify(song.midiEvents);
    } else {
      delete row.midiEvents;
    }

    Object.entries(row).forEach(([key, value]) => {
      if (value === undefined) {
        delete row[key];
      }
    });

    store.setRow('songs', id, row as Record<string, string | number>);
  });
};

const seedSetlists = (store: Store): void => {
  createSetlists().forEach(({ id, sets, ...metadata }) => {
    // Add setlist metadata
    store.setRow('setlists', id, metadata);

    // Add setlist songs
    sets.forEach((set) => {
      set.songs.forEach((songRef, index) => {
        const songRowId = `${id}_${set.setNumber}_${index}`;
        store.setRow('setlistSongs', songRowId, {
          setNumber: set.setNumber,
          setlistId: id,
          songId: songRef.songId,
          songIndex: index,
        });
      });
    });
  });
};

const seedInstruments = (store: Store): void => {
  const { id, ...instrument } = createInstrument();
  const row: Record<string, unknown> = {
    ...instrument,
  };
  Object.entries(row).forEach(([key, value]) => {
    if (value === undefined) {
      delete row[key];
    }
  });
  store.setRow('instruments', id, row as Record<string, string | number>);
};
