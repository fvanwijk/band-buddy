import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

import { useGetShowSpotifyPlayer } from '../api/useSettings';
import { useSpotify } from '../contexts/SpotifyContext';
import { isMobileBrowser } from './song-detail/spotify-player/isMobileBrowser';
import { SpotifyWebPlayerProvider } from './song-detail/spotify-player/SpotifyWebPlayerProvider';

// Mobile browsers can't play Spotify themselves, so there is no web player to keep alive
const isMobile = isMobileBrowser();

/**
 * Wraps the active setlist and its songs, so the Spotify web player survives changing songs.
 */
export const PlayLayout: FC = () => {
  const showSpotifyPlayer = useGetShowSpotifyPlayer();
  const { isAuthenticated } = useSpotify();

  return (
    <SpotifyWebPlayerProvider isEnabled={showSpotifyPlayer && isAuthenticated && !isMobile}>
      <Outlet />
    </SpotifyWebPlayerProvider>
  );
};
