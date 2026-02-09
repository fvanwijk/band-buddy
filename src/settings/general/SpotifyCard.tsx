import { IconBrandSpotify, IconCheck, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useSpotify } from '../../contexts/SpotifyContext';
import { Button } from '../../ui/Button';
import { SettingsCard } from '../SettingsCard';

export function SpotifyCard() {
  const { isAuthenticated, isLoading, sdk, logout } = useSpotify();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { data: userProfile } = useQuery({
    enabled: isAuthenticated && !!sdk,
    queryFn: async () => {
      if (!sdk) throw new Error('SDK not available');
      return await sdk.currentUser.profile();
    },
    queryKey: ['spotify-profile'],
  });

  const handleAuthenticate = async () => {
    if (!sdk) {
      console.error('Spotify SDK not initialized');
      return;
    }

    try {
      setIsAuthenticating(true);
      // This will redirect to Spotify's authorization page
      await sdk.authenticate();
    } catch (error) {
      console.error('Spotify authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SettingsCard>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <IconBrandSpotify className="h-5 w-5" />
            Spotify Integration
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Connect your Spotify account to import playlists directly.
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-sm text-green-400">
            <IconCheck className="h-4 w-4" />
            Connected
          </div>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">Checking connection...</p>
        ) : isAuthenticated && userProfile ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="mt-1 font-semibold text-slate-100">{userProfile.display_name}</p>
            </div>
            <Button
              color="danger"
              iconStart={<IconX className="h-4 w-4" />}
              onClick={handleLogout}
              variant="outlined"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            color="primary"
            disabled={isAuthenticating}
            iconStart={<IconBrandSpotify className="h-4 w-4" />}
            onClick={handleAuthenticate}
            variant="filled"
          >
            {isAuthenticating ? 'Authenticating...' : 'Connect Spotify'}
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}
