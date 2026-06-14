import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { MidiEventLogProvider } from './contexts/MidiEventLogContext.tsx';
import { SpotifyProvider } from './contexts/SpotifyContext.tsx';
import { router } from './router.tsx';
import { StoreProvider } from './store/StoreProvider.tsx';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SpotifyProvider>
        <StoreProvider>
          <MidiEventLogProvider>
            <RouterProvider router={router} />
          </MidiEventLogProvider>
        </StoreProvider>
      </SpotifyProvider>
    </QueryClientProvider>
  </StrictMode>,
);
