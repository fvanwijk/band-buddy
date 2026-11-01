const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

let sdkPromise: Promise<void> | null = null;

/**
 * Loads the Spotify Web Playback SDK script once and resolves when `window.Spotify` is available.
 */
export const loadSpotifySdk = (): Promise<void> => {
  if (window.Spotify) {
    return Promise.resolve();
  }

  sdkPromise ??= new Promise<void>((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement('script');
    script.async = true;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Could not load the Spotify player'));
    };
    script.src = SDK_URL;
    document.body.appendChild(script);
  });

  return sdkPromise;
};
