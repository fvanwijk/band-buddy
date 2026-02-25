import type { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ManageSetlistsPage } from './ManageSetlistsPage';
import type { SpotifyContextType } from '../contexts/SpotifyContext';
import { seedSetlists } from '../mocks/seed';
import { StoreProvider } from '../store/StoreProvider';
import { MockQueryClientProvider, MockSpotifyProvider, getMockStore } from '../testUtils';

describe('ManageSetlistPage', () => {
  const renderComponent = (props: Partial<SpotifyContextType> = {}) =>
    render(<ManageSetlistsPage />, {
      wrapper: ({ children }) => {
        const RoutesStub = createRoutesStub([
          { Component: () => children, path: '/setlists' },
          { Component: () => 'Active setlist page', path: '/play' },
        ]);

        return (
          <MockQueryClientProvider>
            <MockSpotifyProvider {...props}>
              <StoreProvider>
                <RoutesStub initialEntries={['/setlists']} />
              </StoreProvider>
            </MockSpotifyProvider>
          </MockQueryClientProvider>
        );
      },
    });

  it('renders a page without setlists', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'Setlists' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'No setlists yet' })).toBeInTheDocument();
  });

  it('activates a setlist', async () => {
    const user = userEvent.setup();
    const { store, persister } = getMockStore();
    seedSetlists(store);
    persister.save();

    renderComponent();

    expect(await screen.findByText('3 setlists')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: 'Activate setlist' });
    expect(buttons).toHaveLength(3);

    await user.click(buttons[0]);
    expect(screen.getByText('Active setlist page')).toBeInTheDocument();
  });

  it('shows activated setlist', async () => {
    const { store, persister } = getMockStore();
    seedSetlists(store);
    store.setValue('activeSetlistId', '0');
    persister.save();

    renderComponent();

    expect(await screen.findAllByRole('button', { name: 'Activate setlist' })).toHaveLength(2);
    expect(await screen.findAllByRole('button', { name: 'Active setlist' })).toHaveLength(1);
  });

  it('edits a setlist', async () => {
    const { store, persister } = getMockStore();
    seedSetlists(store);
    persister.save();

    renderComponent();

    expect((await screen.findAllByRole('link', { name: 'Edit setlist' }))[0]).toHaveAttribute(
      'href',
      '/setlists/edit/0',
    );
  });

  it('deletes a setlist', async () => {
    const user = userEvent.setup();
    const { store, persister } = getMockStore();
    seedSetlists(store);
    persister.save();

    renderComponent();

    await user.click((await screen.findAllByRole('button', { name: 'Delete setlist' }))[0]);

    expect(screen.getByRole('dialog', { name: 'Delete setlist' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Delete setlist' })).not.toBeInTheDocument(),
    );

    expect(screen.getByText('2 setlists')).toBeInTheDocument();
  });

  describe('importing from Spotify', () => {
    it('when authenticated it shows the import from Spotify button', async () => {
      const user = userEvent.setup();
      const getPlaylistMock = vi.fn().mockResolvedValue({
        name: 'Test Playlist',
        tracks: {
          items: [{ track: { artists: [{ name: 'Test Artist' }], id: '1', name: 'Test Song' } }],
        },
      });
      renderComponent({
        sdk: { playlists: { getPlaylist: getPlaylistMock } } as unknown as SpotifyApi,
      });

      await user.click(await screen.findByRole('button', { name: 'Import from Spotify' }));

      expect(screen.getByRole('dialog', { name: 'Import from Spotify' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Import' }));
      expect(await screen.findByText('Playlist URL or ID is required')).toBeInTheDocument();

      await user.type(
        await screen.findByLabelText('Playlist URL or ID*'),
        'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      );

      await user.click(screen.getByRole('button', { name: 'Import' }));

      expect(getPlaylistMock).toHaveBeenCalledWith('37i9dQZF1DXcBWIGoYBM5M');

      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Import from Spotify' }),
        ).not.toBeInTheDocument(),
      );

      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
      expect(screen.getByText('1 set')).toBeInTheDocument();
      expect(screen.getByText('1 song')).toBeInTheDocument();
    });

    it('when not authenticated it does not show the import from Spotify button', async () => {
      renderComponent({ isAuthenticated: false });

      expect(screen.queryByRole('button', { name: 'Import from Spotify' })).not.toBeInTheDocument();
    });
  });
});
