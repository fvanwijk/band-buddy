import type { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { describe, expect, it, vi } from 'vite-plus/test';

import type { SpotifyContextType } from '../contexts/SpotifyContext';
import { StoreProvider } from '../store/StoreProvider';
import { MockQueryClientProvider, MockSpotifyProvider } from '../testUtils';
import { ImportSpotifyDialog, type ImportSpotifyDialogProps } from './ImportSpotifyDialog';

describe('ImportSpotifyDialog', () => {
  const renderComponent = ({
    hasStoreProvider,
    props,
    spotifyProviderProps,
  }: Partial<{
    hasStoreProvider?: boolean;
    props: Partial<ImportSpotifyDialogProps>;
    spotifyProviderProps: Partial<SpotifyContextType>;
  }> = {}) =>
    render(<ImportSpotifyDialog isOpen onClose={() => {}} {...props} />, {
      wrapper: ({ children }) => {
        const Store = hasStoreProvider !== false ? StoreProvider : Fragment;
        const RoutesStub = createRoutesStub([
          { Component: () => children, path: '/setlists' },
          { Component: () => 'Active setlist page', path: '/play' },
        ]);

        return (
          <MockQueryClientProvider>
            <MockSpotifyProvider {...spotifyProviderProps}>
              <Store>
                <RoutesStub initialEntries={['/setlists']} />
              </Store>
            </MockSpotifyProvider>
          </MockQueryClientProvider>
        );
      },
    });

  const mockGetPlaylist = (getPlaylist: SpotifyApi['playlists']['getPlaylist']) => ({
    sdk: { playlists: { getPlaylist } } as unknown as SpotifyApi,
  });

  it('should throw when there is no store to save the setlist to', async () => {
    const user = userEvent.setup();
    renderComponent({ hasStoreProvider: false });

    await user.type(screen.getByLabelText('Playlist URL or ID*'), '37i9dQZF1DXcBWIGoYBM5M');
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('An unexpected error occurred.');
  });

  it('should throw when there is no Spotify SDK', async () => {
    const user = userEvent.setup();
    renderComponent({ spotifyProviderProps: { sdk: null } });

    await user.type(await screen.findByLabelText('Playlist URL or ID*'), '37i9dQZF1DXcBWIGoYBM5M');
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('An unexpected error occurred.');
  });

  it('should show error when Spotify SDK call fails', async () => {
    const user = userEvent.setup();
    renderComponent({
      spotifyProviderProps: mockGetPlaylist(() => {
        throw new Error('Something went wrong');
      }),
    });

    await user.type(await screen.findByLabelText('Playlist URL or ID*'), '37i9dQZF1DXcBWIGoYBM5M');
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('validates playlist URLs and IDs', async () => {
    const user = userEvent.setup();
    const getPlaylistMock = vi.fn().mockResolvedValue({
      name: 'Test Playlist',
      tracks: {
        items: [{ track: { artists: [{ name: 'Test Artist' }], id: '1', name: 'Test Song' } }],
      },
    });
    renderComponent({
      spotifyProviderProps: mockGetPlaylist(getPlaylistMock),
    });

    const input = await screen.findByLabelText('Playlist URL or ID*');

    // No input
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByText('Playlist URL or ID is required')).toBeInTheDocument();

    // Invalid ID format
    await user.clear(input);
    await user.type(input, 'invalid_playlist_id');
    expect(await screen.findByText('Invalid Spotify playlist URL or ID')).toBeInTheDocument();

    // Invalid playlist URL (it is for a track)
    await user.clear(input);
    await user.type(input, 'http://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN');
    expect(await screen.findByText('Invalid Spotify playlist URL or ID')).toBeInTheDocument();

    // Valid URL
    await user.clear(input);
    await user.type(input, 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
    await waitFor(() =>
      expect(screen.queryByText('Invalid Spotify playlist URL or ID')).not.toBeInTheDocument(),
    );

    // Valid ID
    await user.clear(input);
    await user.type(input, '37i9dQZF1DXcBWIGoYBM5M');
    await waitFor(() =>
      expect(screen.queryByText('Invalid Spotify playlist URL or ID')).not.toBeInTheDocument(),
    );
  });

  it('closes the dialog and resets the form and mutation state on success', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    const getPlaylistMock = vi.fn().mockResolvedValue({
      name: 'Test Playlist',
      tracks: {
        items: [{ track: { artists: [{ name: 'Test Artist' }], id: '1', name: 'Test Song' } }],
      },
    });
    renderComponent({
      props: { onClose: onCloseMock },
      spotifyProviderProps: mockGetPlaylist(
        () => new Promise((resolve) => setTimeout(() => resolve(getPlaylistMock()), 100)),
      ),
    });

    await user.type(await screen.findByLabelText('Playlist URL or ID*'), '37i9dQZF1DXcBWIGoYBM5M');

    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(await screen.findByRole('button', { name: 'Importing...' })).toBeDisabled();

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });

    // Dialog is not really closed in this test
    expect(screen.getByLabelText('Playlist URL or ID*')).toHaveValue('');
  });

  it('closes the dialog and resets the form and mutation state on close', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    const { rerender } = renderComponent({
      props: { onClose: onCloseMock },
      spotifyProviderProps: mockGetPlaylist(() => {
        throw new Error('Something went wrong');
      }),
    });

    await user.type(await screen.findByLabelText('Playlist URL or ID*'), '37i9dQZF1DXcBWIGoYBM5M');
    await user.click(screen.getByRole('button', { name: 'Import' })); // Trigger alert

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCloseMock).toHaveBeenCalled();
    // Simulate closing of dialog
    rerender(<ImportSpotifyDialog isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByRole('dialog', { name: 'Import from Spotify' })).not.toBeInTheDocument();

    rerender(<ImportSpotifyDialog isOpen onClose={onCloseMock} />);

    expect(screen.getByLabelText('Playlist URL or ID*')).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
