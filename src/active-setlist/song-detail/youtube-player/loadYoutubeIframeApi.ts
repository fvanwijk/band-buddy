const API_URL = 'https://www.youtube.com/iframe_api';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: typeof YT;
  }
}

let apiPromise: Promise<typeof YT> | null = null;

/**
 * Loads the YouTube IFrame API script once and resolves with `window.YT` when it is available.
 */
export const loadYoutubeIframeApi = (): Promise<typeof YT> => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  apiPromise ??= new Promise<typeof YT>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT as typeof YT);
    };

    const script = document.createElement('script');
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('Could not load the YouTube player'));
    };
    script.src = API_URL;
    document.body.appendChild(script);
  });

  return apiPromise;
};
