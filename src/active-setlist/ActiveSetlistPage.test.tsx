import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { seedStore } from '../mocks/seed';
import { StoreProvider } from '../store/StoreProvider';
import { MockRouteProvider, getMockStore } from '../testUtils';
import { ActiveSetlistPage } from './ActiveSetlistPage';

describe('ActiveSetlistPage', () => {
  const renderComponent = async (activeSetlistId?: string) => {
    const { store, persister } = getMockStore();
    seedStore(store);
    if (activeSetlistId) {
      store.setValue('activeSetlistId', activeSetlistId);
    }
    await persister.save();

    return render(<ActiveSetlistPage />, {
      wrapper: ({ children }) => (
        <StoreProvider>
          <MockRouteProvider>{children}</MockRouteProvider>
        </StoreProvider>
      ),
    });
  };

  it('renders empty state when there is no setlist at all', async () => {
    render(<ActiveSetlistPage />, { wrapper: MockRouteProvider });

    expect(screen.getByText('No active setlist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'setlist' })).toHaveAttribute('href', '/setlists');
  });

  it('renders empty state when no active setlist', async () => {
    await renderComponent();

    expect(await screen.findByText('No active setlist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'setlist' })).toHaveAttribute('href', '/setlists');
  });

  it('renders setlist details when active setlist is present', async () => {
    await renderComponent('0');

    expect(await screen.findByText('Main Setlist')).toBeInTheDocument();
    expect(screen.getByText('Feb 26, 2026')).toBeInTheDocument();
    expect(screen.getByText('The Grand Arena')).toBeInTheDocument();
    expect(screen.getByTestId('song-count-duration')).toHaveTextContent('6 songs • 27m 30s');
  });
});
