import type { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ManageSetlistsPage } from './ManageSetlistsPage';
import type { SpotifyContextType } from '../contexts/SpotifyContext';
import { StoreProvider } from '../store/StoreProvider';
import { MockQueryClientProvider, MockRouteProvider, MockSpotifyProvider } from '../testUtils';

describe('ManageSetlistPage', () => {
  const renderComponent = (props: Partial<SpotifyContextType> = {}) =>
    render(<ManageSetlistsPage />, {
      wrapper: ({ children }) => (
        <MockQueryClientProvider>
          <MockSpotifyProvider {...props}>
            <StoreProvider>
              <MockRouteProvider>{children}</MockRouteProvider>
            </StoreProvider>
          </MockSpotifyProvider>
        </MockQueryClientProvider>
      ),
    });

  it('renders a page without setlists', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'Setlists' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'No setlists yet' })).toBeInTheDocument();
  });

  describe('importing from Spotify', () => {
    it.only('when authenticated it shows the import from Spotify button', async () => {
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
