import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type SpotifyContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  sdk: SpotifyApi | null;
  logout: () => void;
};

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

type SpotifyProviderProps = {
  children: React.ReactNode;
};

export function SpotifyProvider({ children }: SpotifyProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sdk, setSdk] = useState<SpotifyApi | null>(null);

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URL;

  // Initialize SDK and check auth state
  useEffect(() => {
    if (!clientId || !redirectUri) {
      setIsLoading(false);
      return;
    }

    const initializeSpotify = async () => {
      try {
        // Create SDK instance
        const spotifyApi = SpotifyApi.withUserAuthorization(clientId, redirectUri, [
          'playlist-read-private',
          'playlist-read-collaborative',
        ]);

        // Check if we have authorization code in URL (OAuth callback)
        if (new URLSearchParams(window.location.search).has('code')) {
          // Trigger token exchange by getting access token
          try {
            await spotifyApi.authenticate();
          } catch (error: Error | unknown) {
            const e = error as Error;
            if (e?.message?.includes('No verifier found in cache')) {
              console.debug(
                'useEffect triggers twice in Strict Mode, OAuth callback already processed',
                e,
              );
            } else {
              console.error(e);
            }
          }
        }

        // Check for existing token
        const token = localStorage.getItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token');
        setSdk(spotifyApi);
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Failed to initialize Spotify:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSpotify();
  }, [clientId, redirectUri]);

  const logout = useCallback(() => {
    localStorage.removeItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token');
    localStorage.removeItem('spotify-sdk:verifier');
    setIsAuthenticated(false);
  }, []);

  return (
    <SpotifyContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        logout,
        sdk,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
