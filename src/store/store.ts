import type { Store } from 'tinybase';
import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { createZodSchematizer } from 'tinybase/schematizers/schematizer-zod';

import {
  activeSetlistIdSchema,
  hasSeenWelcomeSchema,
  instrumentTableSchema,
  localeSchema,
  metronomeVolumeSchema,
  setlistMetadataTableSchema,
  setlistSongTableSchema,
  showDrawingToolsSchema,
  songTableSchema,
  themeSchema,
} from '../schemas';

/**
 * Create a new store with proper relational schema using Zod
 *
 * Tables:
 * - songs: Individual songs with their properties
 * - setlists: Setlist metadata (title, date)
 * - setlistSongs: Join table connecting setlists to songs with set/order info
 *
 * Values:
 * - activeSetlistId: ID of the currently active setlist
 * - locale: User's preferred locale
 * - theme: User's preferred theme
 */
export function createAppStore(): Store {
  const schematizer = createZodSchematizer();

  const tablesSchema = schematizer.toTablesSchema({
    instruments: instrumentTableSchema,
    setlistSongs: setlistSongTableSchema,
    setlists: setlistMetadataTableSchema,
    songs: songTableSchema,
  });

  const valuesSchema = schematizer.toValuesSchema({
    activeSetlistId: activeSetlistIdSchema,
    hasSeenWelcome: hasSeenWelcomeSchema,
    locale: localeSchema,
    metronomeVolume: metronomeVolumeSchema,
    showDrawingTools: showDrawingToolsSchema,
    theme: themeSchema,
  });

  return createStore().setTablesSchema(tablesSchema).setValuesSchema(valuesSchema);
}

/**
 * Create a persister for the given store
 */
export function createStorePersister(store: Store) {
  return createLocalPersister(store, 'band-buddy');
}
