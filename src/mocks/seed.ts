import type { Store } from 'tinybase';

import { createSetlists } from './setlists';
import { createSongs } from './songs';

export function seedStore(store: Store): void {
  const seedSongs = createSongs();
  seedSongs.forEach(({ id, ...song }) => {
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

  const seedSetlists = createSetlists();
  seedSetlists.forEach(({ id, sets, ...metadata }) => {
    // Add setlist metadata
    store.setRow('setlists', id, metadata);

    // Add setlist songs
    sets.forEach((set) => {
      set.songs.forEach((songRef, index) => {
        const songRowId = `${id}_${set.setNumber}_${index}`;
        store.setRow('setlistSongs', songRowId, {
          isDeleted: songRef.isDeleted || false,
          setNumber: set.setNumber,
          setlistId: id,
          songId: songRef.songId,
          songIndex: index,
        });
      });
    });
  });
}
