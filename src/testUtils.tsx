import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren } from 'react';
import { createRoutesStub } from 'react-router-dom';

import { createAppStore, createStorePersister } from './store/store';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: false },
  },
});
export const MockQueryClientProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Note: If you need a custom route provider, create it yourself
export const MockRouteProvider = ({ children }: PropsWithChildren) => {
  const RoutesStub = createRoutesStub([
    {
      Component: () => children,
      // Retrow error that was caught in boundary
      ErrorBoundary: ({ error }) => {
        throw error;
      },

      path: '/',
    },
  ]);

  return <RoutesStub initialEntries={['/']} />;
};

export const getMockStore = () => {
  const store = createAppStore();
  const persister = createStorePersister(store);

  return { persister, store };
};
