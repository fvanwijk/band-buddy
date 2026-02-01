import type { Store } from 'tinybase';
import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

/**
 * Create a new store with schema configuration
 */
export function createAppStore(): Store {
  const store = createStore()
    .setSchema({
      setlists: {
        data: { type: 'string' }, // Stores JSON-stringified Setlist
      },
      settings: {
        locale: { type: 'string' },
      },
      songs: {
        artist: { type: 'string' },
        bpm: { type: 'number' },
        duration: { type: 'string' },
        key: { type: 'string' },
        timeSignature: { type: 'string' },
        title: { type: 'string' },
      },
    })
    .setValuesSchema({
      activeSetlistId: { type: 'string' },
    });

  return store;
}

/**
 * Create a persister for the given store
 */
export function createStorePersister(store: Store) {
  return createLocalPersister(store, 'gig-buddy-store');
}
