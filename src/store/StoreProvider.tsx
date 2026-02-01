import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Provider, useCreateStore } from 'tinybase/ui-react';

import { createAppStore, createStorePersister } from './store';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';
import { createSetlists } from '../mocks/setlists';
import { createSongs } from '../mocks/songs';

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const store = useCreateStore(createAppStore);

  useEffect(() => {
    if (!store) return;

    async function init() {
      const persister = createStorePersister(store);

      // Load from localStorage
      await persister.load();

      // If store is empty (first load), populate with seed data
      if (Object.keys(store.getTables()).length === 0) {
        const seedSongs = createSongs();
        seedSongs.forEach(({ id, ...song }) => {
          store.setRow('songs', id, song as Record<string, string | number>);
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

        // Initialize settings with defaults
        store.setValue('locale', detectLocale());
        store.setValue('theme', DEFAULT_THEME);
      }

      // Apply theme from store
      const storedTheme = store.getValue('theme') as string | undefined;
      if (storedTheme) {
        applyTheme(storedTheme as ThemeName);
      } else {
        applyTheme(DEFAULT_THEME);
      }

      // Start auto-save
      await persister.startAutoSave();
    }

    init();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
