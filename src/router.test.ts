import type { LoaderFunctionArgs } from 'react-router-dom';
import { describe, expect, it } from 'vite-plus/test';

import { songDetailIndexLoader } from './active-setlist/song-detail/song-detail-page/songDetailIndexLoader';

const createLoaderArgs = (songId: string, setlistId = '0') =>
  ({
    context: {},
    params: { setlistId, songId },
    request: new Request('http://localhost/setlist/0/song/0'),
  }) as unknown as LoaderFunctionArgs;

describe('songDetailIndexLoader', () => {
  it('redirects to details when no default tab is stored', async () => {
    localStorage.removeItem('band-buddy');

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/setlist/0/song/3/details');
  });

  it('redirects to stored default tab for the song', async () => {
    localStorage.setItem(
      'band-buddy',
      JSON.stringify([
        {
          songs: {
            '3': {
              defaultTab: 'midi',
            },
          },
        },
        {},
      ]),
    );

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/setlist/0/song/3/midi');
  });

  it('falls back to details when stored tab is invalid', async () => {
    localStorage.setItem(
      'band-buddy',
      JSON.stringify([
        {
          songs: {
            '3': {
              defaultTab: 'invalid-tab',
            },
          },
        },
        {},
      ]),
    );

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/setlist/0/song/3/details');
  });
});
