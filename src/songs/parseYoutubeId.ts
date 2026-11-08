const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = ['youtube.com', 'm.youtube.com', 'music.youtube.com', 'www.youtube.com'];

/**
 * Extracts a YouTube video ID from a video URL (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`,
 * `/live/`) or a bare 11 character ID. Returns undefined when the input is not a video.
 */
export const parseYoutubeId = (input: string): string | undefined => {
  const value = input.trim();
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      let id: string | null | undefined;

      if (url.hostname === 'youtu.be') {
        id = url.pathname.split('/')[1];
      } else if (YOUTUBE_HOSTS.includes(url.hostname)) {
        id =
          url.pathname === '/watch'
            ? url.searchParams.get('v')
            : /^\/(?:embed|live|shorts|v)\/([^/]+)/.exec(url.pathname)?.[1];
      }

      return id && YOUTUBE_ID_PATTERN.test(id) ? id : undefined;
    } catch {
      return undefined;
    }
  }

  return YOUTUBE_ID_PATTERN.test(value) ? value : undefined;
};
