import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { useSpotify } from '../../../contexts/SpotifyContext';
import { loadSpotifySdk } from './loadSpotifySdk';

const PLAYER_NAME = 'BandBuddy';
const READY_TIMEOUT_MS = 10000;

type SpotifyWebPlayerContextType = {
  deviceId: string | null;
  errorMessage: string | null;
  isUnsupported: boolean;
  player: Spotify.Player | null;
};

const SpotifyWebPlayerContext = createContext<SpotifyWebPlayerContextType>({
  deviceId: null,
  errorMessage: null,
  isUnsupported: false,
  player: null,
});

type SpotifyWebPlayerProviderProps = {
  children: ReactNode;
  isEnabled: boolean;
};

/**
 * Keeps one Spotify Web Playback SDK player alive while its children are mounted, so the music
 * keeps playing, and the Spotify device stays the same, when the song detail page changes song.
 */
export const SpotifyWebPlayerProvider: FC<SpotifyWebPlayerProviderProps> = ({
  children,
  isEnabled,
}) => {
  const { sdk } = useSpotify();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    if (!sdk || !isEnabled) {
      return undefined;
    }

    let isCancelled = false;
    let newPlayer: Spotify.Player | null = null;
    // The SDK doesn't always report why it can't start, so give up when it never becomes ready
    const readyTimeoutId = window.setTimeout(() => setIsUnsupported(true), READY_TIMEOUT_MS);

    loadSpotifySdk()
      .then(() => {
        if (isCancelled) {
          return;
        }

        newPlayer = new window.Spotify.Player({
          getOAuthToken: (callback) => {
            void sdk.getAccessToken().then((token) => callback(token?.access_token ?? ''));
          },
          name: PLAYER_NAME,
        });

        newPlayer.addListener('ready', ({ device_id }) => {
          window.clearTimeout(readyTimeoutId);
          setDeviceId(device_id);
        });
        newPlayer.addListener('not_ready', () => setDeviceId(null));
        // Mobile browsers lack the DRM support the SDK needs, the caller falls back to remote control
        newPlayer.addListener('initialization_error', () => setIsUnsupported(true));
        newPlayer.addListener('authentication_error', () =>
          setErrorMessage('Spotify authentication failed. Reconnect Spotify in the settings.'),
        );
        newPlayer.addListener('account_error', () =>
          setErrorMessage('Spotify Premium is required to play music in BandBuddy.'),
        );
        newPlayer.addListener('playback_error', ({ message }) => setErrorMessage(message));

        setPlayer(newPlayer);
        return newPlayer.connect().then((isConnected) => {
          if (!isConnected && !isCancelled) {
            setIsUnsupported(true);
          }
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setIsUnsupported(true);
        }
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(readyTimeoutId);
      newPlayer?.disconnect();
      setDeviceId(null);
      setPlayer(null);
    };
  }, [isEnabled, sdk]);

  const value = useMemo(
    () => ({ deviceId, errorMessage, isUnsupported, player }),
    [deviceId, errorMessage, isUnsupported, player],
  );

  return (
    <SpotifyWebPlayerContext.Provider value={value}>{children}</SpotifyWebPlayerContext.Provider>
  );
};

export const useSpotifyWebPlayer = () => useContext(SpotifyWebPlayerContext);
