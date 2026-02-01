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
        seedSetlists.forEach(({ id, ...setlist }) => {
          store.setRow('setlists', id, { data: JSON.stringify(setlist) });
        });

        // Initialize settings with defaults
        store.setCell('settings', 'app', 'locale', detectLocale());
        store.setCell('settings', 'app', 'theme', DEFAULT_THEME);
      }

      // Apply theme from store
      const storedTheme = store.getCell('settings', 'app', 'theme') as string | undefined;
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
