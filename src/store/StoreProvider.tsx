import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Provider, useCreateStore } from 'tinybase/ui-react';

import { createAppStore, createStorePersister } from './store';
import { detectLocale } from '../config/locales';
import { DEFAULT_THEME, type ThemeName, applyTheme } from '../config/themes';
import { seedStore } from '../mocks/seed';
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

      // If store is empty and SEED_DB is enabled, populate with seed data
      const shouldSeed =
        import.meta.env.VITE_SEED_DB === 'true' && Object.keys(store.getTables()).length === 0;
      if (shouldSeed) {
        seedStore(store);

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
