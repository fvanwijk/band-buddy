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
  setlistSetTableSchema,
  setlistSongTableSchema,
  setlistTableSchema,
  showDrawingToolsSchema,
  songTableSchema,
  themeSchema,
} from '../schemas';

/**
 * Create a new store with proper relational schema using Zod
 *
 * Tables:
 * - songs: Individual songs with their properties
 * - setlistSongs: Join table connecting setlists to songs with set/order info
 * - setlistSets: Sets within a setlist with order info and optional name
 * - setlists: Setlist metadata (title, date)
 * - instruments: List of instruments with their MIDI program numbers
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
    setlistSets: setlistSetTableSchema,
    setlistSongs: setlistSongTableSchema,
    setlists: setlistTableSchema,
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
