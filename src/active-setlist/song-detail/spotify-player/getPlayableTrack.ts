import type { Market, SpotifyApi } from '@spotify/web-api-ts-sdk';

/**
 * Looks up the track for the user's market. Spotify accepts a play command for a track that is
 * unavailable there but then plays nothing, so an unavailable track is reported up front.
 * Tracks that Spotify relinks in the user's market are played through the relinked URI.
 */
export const getPlayableTrack = async (sdk: SpotifyApi, spotifyId: string) => {
  const track = await sdk.tracks.get(spotifyId, 'from_token' as Market);
  if (track.is_playable === false) {
    throw new Error('Track unavailable');
  }

  return { albumUri: track.album.uri, uri: track.uri };
};
