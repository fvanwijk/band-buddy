const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]+$/;

/**
 * Extracts a Spotify track ID from a track URL (`https://open.spotify.com/track/<id>?si=...`),
 * a URI (`spotify:track:<id>`) or a bare ID. Returns undefined when the input is not a track.
 */
export const parseSpotifyTrackId = (input: string): string | undefined => {
  const value = input.trim();
  if (!value) {
    return undefined;
  }

  const fromUri = /^spotify:track:([A-Za-z0-9]+)$/.exec(value);
  if (fromUri) {
    return fromUri[1];
  }

  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      const fromUrl = /^\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)\/?$/.exec(url.pathname);
      return url.hostname === 'open.spotify.com' && fromUrl ? fromUrl[1] : undefined;
    } catch {
      return undefined;
    }
  }

  return SPOTIFY_ID_PATTERN.test(value) ? value : undefined;
};
