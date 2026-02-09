import { useMutation } from '@tanstack/react-query';

type SpotifyPlaylist = {
  name: string;
  tracks: {
    items: Array<{
      track: {
        artists: Array<{ name: string }>;
        name: string;
      };
    }>;
  };
};

const fetchSpotifyPlaylist = async (playlistId: string): Promise<SpotifyPlaylist> => {
  const token = import.meta.env.VITE_SPOTIFY_API_TOKEN;

  if (!token) {
    throw new Error('Spotify API token not configured');
  }

  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid or expired Spotify API token');
    }
    if (response.status === 404) {
      throw new Error('Playlist not found');
    }
    throw new Error('Failed to fetch playlist');
  }

  return response.json();
};

export function useImportSpotifyPlaylist() {
  return useMutation({
    mutationFn: fetchSpotifyPlaylist,
  });
}
