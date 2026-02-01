import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Provider, useTable } from 'tinybase/ui-react';

import { initializeStore, store } from './store';
import { createSetlists } from '../mocks/setlists';
import { createSongs } from '../mocks/songs';
import type { Setlist, Song } from '../types';

type StoreProviderProps = {
  children: ReactNode;
};

type StoreContextType = {
  setlists: Setlist[];
  songs: Song[];
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export { StoreContext };

export function StoreProvider({ children }: StoreProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeStore();

      // If store is empty (first load), populate with seed data
      if (Object.keys(store.getTables()).length === 0) {
        const seedSongs = createSongs();

        seedSongs.forEach(({ id, ...song }) => {
          store.setRow('songs', id, song as Record<string, string | number>);
        });

        const seedSetlists = createSetlists();

        seedSetlists.forEach(({ id, ...setlist }) => {
          store.setRow('setlists', id, { data: JSON.stringify(setlist) } as Record<
            string,
            string | number
          >);
        });
      }

      setIsInitialized(true);
    }

    init();
  }, []);

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Provider store={store}>
      <StoreContextProvider>{children}</StoreContextProvider>
    </Provider>
  );
}

function StoreContextProvider({ children }: { children: ReactNode }) {
  const songsData = useTable('songs') || {};
  const setlistsData = useTable('setlists') || {};

  const songs: Song[] = Object.entries(songsData)
    .map(
      ([id, data]) =>
        ({
          ...data,
          id,
        }) as Song,
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  const setlists: Setlist[] = Object.entries(setlistsData)
    .map(([id, data]) => {
      try {
        const dataStr = data?.data as string | undefined;
        const parsed = dataStr ? JSON.parse(dataStr) : null;
        if (parsed) {
          return {
            ...parsed,
            id,
          };
        }
        return {
          date: new Date().toISOString().split('T')[0],
          id,
          sets: [],
          title: 'Unknown',
        };
      } catch {
        return {
          date: new Date().toISOString().split('T')[0],
          id,
          sets: [],
          title: 'Unknown',
        };
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <StoreContext.Provider value={{ setlists, songs }}>{children}</StoreContext.Provider>;
}
