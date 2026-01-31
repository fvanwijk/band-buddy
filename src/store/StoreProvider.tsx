import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'tinybase/ui-react';

import { initializeStore, store } from './store';
import { createSongs } from '../mocks/songs';

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeStore();

      // If store is empty (first load), populate with seed data
      if (Object.keys(store.getTables()).length === 0) {
        const seedSongs = createSongs();

        seedSongs.forEach(({ id, ...song }) => {
          store.setRow('songs', id, song);
        });
      }

      setIsInitialized(true);
    }

    init();
  }, []);

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <Provider store={store}>{children}</Provider>;
}
