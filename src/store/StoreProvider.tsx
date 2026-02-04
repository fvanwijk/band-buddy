import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Provider, useCreateStore } from 'tinybase/ui-react';

import { createAppStore, createStorePersister } from './store';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';
import { createSetlists } from '../mocks/setlists';
import { createSongs } from '../mocks/songs';
import { Logo } from '../ui/Logo';

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const store = useCreateStore(createAppStore);
  const [isInitialized, setIsInitialized] = useState(false);

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

      // Mark as initialized
      setIsInitialized(true);
    }

    init();
  }, [store]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <Logo className="mb-4 text-4xl" />
          <div className="text-sm text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
